import asyncHandler from 'express-async-handler';
import { supabaseAdmin } from '../config/db.js';
import { ai, GEMINI_MODEL, generateAdaptationPrompt, extractJSON } from '../config/gemini.js';

const INTERRUPTION_LABELS = {
  EXAMS: 'College Exams / Midterms',
  BURNOUT: 'Feeling Overwhelmed / Burnout',
  BUSY_WORK: 'High Workload / Assignments',
  ILLNESS: 'Sick / Personal Break',
};

// ─── POST /api/adapt/preview ─────────────────────────────────────────────────
export const previewAdaptation = asyncHandler(async (req, res) => {
  const { user, profile } = req;
  const { reasonCode, newCapacityMinutes } = req.body;

  if (!profile) {
    return res.status(404).json({ error: 'Profile not found.' });
  }

  // Find last struggled topic
  const { data: recentHard } = await supabaseAdmin
    .from('user_progress')
    .select('difficulty_rating, missions(title)')
    .eq('user_id', user.id)
    .eq('difficulty_rating', 'HARD')
    .eq('status', 'COMPLETED')
    .order('completed_at', { ascending: false })
    .limit(1)
    .single();

  const lastStruggledTopic = recentHard?.missions?.title || null;

  // Count completed missions
  const { count: completedCount } = await supabaseAdmin
    .from('user_progress')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('status', 'COMPLETED');

  // Build Gemini prompt
  const prompt = generateAdaptationPrompt({
    studentName: profile.full_name,
    reason: INTERRUPTION_LABELS[reasonCode] || reasonCode,
    currentCapacity: profile.daily_capacity_minutes,
    newCapacity: newCapacityMinutes,
    lastStruggledTopic,
    completedCount: completedCount || 0,
    totalMissions: 12,
  });

  let aiResponse;
  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        systemInstruction: `You are NextStep AI, an expert, empathetic, and highly structured placement preparation mentor. 
Your primary directive is to eliminate overwhelm for students by making computer science learning doable, personalized, and adaptive.
Rules of Interaction:
1. Always maintain an encouraging, action-oriented, non-judgmental tone. Never punish or shame students for missing days or having low availability.
2. Focus on clear, immediate next actions rather than massive theoretical long-term maps.
3. Keep technical explanations clear, concise, and focused on core intuition.
4. Output strict, valid JSON matching requested schemas whenever system API requests demand structured representations. Never wrap JSON in extra markdown prose outside code blocks when structured output is requested.`,
        temperature: 0.7,
      },
    });
    aiResponse = extractJSON(response.text);
  } catch (err) {
    console.error('Gemini adapt error:', err);
    // Fallback response
    aiResponse = {
      encouragement: `Hey ${profile.full_name}, life happens! You're not behind — you're just adjusting. Every small step still counts.`,
      strategySummary: `With ${newCapacityMinutes} mins/day, we'll slow the pace and focus on depth over speed.`,
      revisedPacing: `${Math.floor(newCapacityMinutes / 30)} mission${Math.floor(newCapacityMinutes / 30) !== 1 ? 's' : ''} per day`,
      focusRecommendation: lastStruggledTopic || 'Core fundamentals',
      actionableSteps: [
        'Open today\'s mission and spend just 5 minutes reading the concept.',
        'Try one practice problem — don\'t worry about finishing.',
        'Close the app knowing you showed up today.',
      ],
    };
  }

  // Compute revised schedule timeline
  const remainingMissions = 12 - (completedCount || 0);
  const daysNeeded = newCapacityMinutes >= 30
    ? remainingMissions
    : remainingMissions * 2;

  res.status(200).json({
    aiPlan: aiResponse,
    schedulePreview: {
      previousCapacity: profile.daily_capacity_minutes,
      newCapacity: newCapacityMinutes,
      completedMissions: completedCount || 0,
      remainingMissions,
      estimatedDaysToComplete: daysNeeded,
      previousDaysToComplete: profile.daily_capacity_minutes >= 30
        ? remainingMissions
        : remainingMissions * 2,
    },
  });
});

// ─── POST /api/adapt/accept ──────────────────────────────────────────────────
export const acceptAdaptation = asyncHandler(async (req, res) => {
  const { user, profile } = req;
  const { reasonCode, newCapacityMinutes } = req.body;

  if (!profile) {
    return res.status(404).json({ error: 'Profile not found.' });
  }

  // We need an AI explanation to store — generate a brief one
  let aiExplanation = `Schedule adapted: reduced from ${profile.daily_capacity_minutes} to ${newCapacityMinutes} mins/day due to ${INTERRUPTION_LABELS[reasonCode] || reasonCode}.`;

  try {
    const prompt = generateAdaptationPrompt({
      studentName: profile.full_name,
      reason: INTERRUPTION_LABELS[reasonCode] || reasonCode,
      currentCapacity: profile.daily_capacity_minutes,
      newCapacity: newCapacityMinutes,
      lastStruggledTopic: null,
      completedCount: 0,
      totalMissions: 12,
    });
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
    });
    const parsed = extractJSON(response.text);
    aiExplanation = parsed.strategySummary || aiExplanation;
  } catch (_) {
    // use fallback explanation
  }

  // 1. Update profile capacity
  const { error: profileError } = await supabaseAdmin
    .from('profiles')
    .update({
      daily_capacity_minutes: newCapacityMinutes,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id);

  if (profileError) {
    return res.status(500).json({ error: 'Failed to update profile capacity.' });
  }

  // 2. Log the adaptation
  const { error: logError } = await supabaseAdmin
    .from('schedule_adaptations')
    .insert({
      user_id: user.id,
      reason_code: reasonCode,
      previous_capacity: profile.daily_capacity_minutes,
      new_capacity: newCapacityMinutes,
      ai_explanation: aiExplanation,
    });

  if (logError) {
    console.error('Adaptation log error:', logError);
  }

  res.status(200).json({
    success: true,
    newCapacity: newCapacityMinutes,
    message: 'Schedule adapted successfully.',
  });
});

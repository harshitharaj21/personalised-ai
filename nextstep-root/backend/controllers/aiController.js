import asyncHandler from 'express-async-handler';
import { supabaseAdmin } from '../config/db.js';
import { ai, GEMINI_MODEL, generateTutorPrompt, extractJSON } from '../config/gemini.js';

const SYSTEM_INSTRUCTION = `You are NextStep AI, an expert, empathetic, and highly structured placement preparation mentor. 
Your primary directive is to eliminate overwhelm for students by making computer science learning doable, personalized, and adaptive.
Rules of Interaction:
1. Always maintain an encouraging, action-oriented, non-judgmental tone. Never punish or shame students for missing days or having low availability.
2. Focus on clear, immediate next actions rather than massive theoretical long-term maps.
3. Keep technical explanations clear, concise, and focused on core intuition.
4. Output strict, valid JSON matching requested schemas whenever system API requests demand structured representations. Never wrap JSON in extra markdown prose outside code blocks when structured output is requested.`;

// ─── POST /api/ai/tutor ──────────────────────────────────────────────────────
export const getTutorResponse = asyncHandler(async (req, res) => {
  const { missionId, userQuestion } = req.body;

  // Fetch mission details for context
  const { data: mission, error: missionError } = await supabaseAdmin
    .from('missions')
    .select('title, concept_breakdown, summary')
    .eq('id', missionId)
    .single();

  if (missionError || !mission) {
    return res.status(404).json({ error: 'Mission not found.' });
  }

  const prompt = generateTutorPrompt({
    missionTitle: mission.title,
    concept: mission.concept_breakdown,
    userQuestion,
  });

  let tutorResponse;
  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.5,
      },
    });
    tutorResponse = extractJSON(response.text);
  } catch (err) {
    console.error('Tutor AI error:', err);
    // Meaningful fallback
    tutorResponse = {
      explanation: `Great question about ${mission.title}! ${mission.concept_breakdown.slice(0, 120)}...`,
      codeSnippet: '',
      keyTakeaway: `Focus on understanding the core intuition before diving into code.`,
    };
  }

  // Validate required fields exist
  if (!tutorResponse.explanation) {
    tutorResponse.explanation = 'Let me think through this with you step by step.';
  }
  if (tutorResponse.codeSnippet === undefined) {
    tutorResponse.codeSnippet = '';
  }
  if (!tutorResponse.keyTakeaway) {
    tutorResponse.keyTakeaway = 'Understanding the problem deeply is half the solution.';
  }

  res.status(200).json({ tutorResponse, missionTitle: mission.title });
});

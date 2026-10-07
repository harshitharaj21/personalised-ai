import asyncHandler from 'express-async-handler';
import { supabaseAdmin } from '../config/db.js';

// ─── GET /api/dashboard ──────────────────────────────────────────────────────
export const getDashboard = asyncHandler(async (req, res) => {
  const { user, profile } = req;

  if (!profile) {
    return res.status(404).json({ error: 'Profile not found. Please complete onboarding.' });
  }

  // 1. Fetch all user progress with mission details
  const { data: progressData, error: progressError } = await supabaseAdmin
    .from('user_progress')
    .select(`
      id,
      status,
      difficulty_rating,
      completed_at,
      user_notes,
      missions (
        id,
        sequence_order,
        title,
        summary,
        estimated_minutes,
        tracks (slug, title)
      )
    `)
    .eq('user_id', user.id)
    .order('missions(sequence_order)', { ascending: true });

  if (progressError) {
    console.error('Dashboard progress error:', progressError);
    return res.status(500).json({ error: 'Failed to load progress data.' });
  }

  // 2. Calculate stats
  const completed = progressData.filter((p) => p.status === 'COMPLETED');
  const available = progressData.find((p) => p.status === 'AVAILABLE');
  const inProgress = progressData.find((p) => p.status === 'IN_PROGRESS');
  const currentMission = inProgress || available || null;

  // 3. Compute active streak (consecutive days with a completion)
  let streak = profile.current_streak || 0;

  // 4. Build response
  res.status(200).json({
    profile,
    stats: {
      completedCount: completed.length,
      totalMissions: progressData.length,
      streak,
      completionPercentage: progressData.length
        ? Math.round((completed.length / progressData.length) * 100)
        : 0,
    },
    currentMission: currentMission
      ? {
          progressId: currentMission.id,
          status: currentMission.status,
          mission: currentMission.missions,
        }
      : null,
    allProgress: progressData.map((p) => ({
      progressId: p.id,
      status: p.status,
      difficultyRating: p.difficulty_rating,
      completedAt: p.completed_at,
      userNotes: p.user_notes,
      mission: p.missions,
    })),
  });
});

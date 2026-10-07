import asyncHandler from 'express-async-handler';
import { supabaseAdmin } from '../config/db.js';

// ─── GET /api/mission/:id ────────────────────────────────────────────────────
export const getMission = asyncHandler(async (req, res) => {
  const { user } = req;
  const { id } = req.params;

  // Fetch mission details
  const { data: mission, error: missionError } = await supabaseAdmin
    .from('missions')
    .select('*, tracks(slug, title)')
    .eq('id', id)
    .single();

  if (missionError || !mission) {
    return res.status(404).json({ error: 'Mission not found.' });
  }

  // Fetch user's progress for this mission
  const { data: progress, error: progressError } = await supabaseAdmin
    .from('user_progress')
    .select('*')
    .eq('user_id', user.id)
    .eq('mission_id', id)
    .single();

  if (progressError && progressError.code !== 'PGRST116') {
    return res.status(500).json({ error: 'Failed to load mission progress.' });
  }

  // Guard: don't allow accessing locked missions
  if (progress && progress.status === 'LOCKED') {
    return res.status(403).json({ error: 'This mission is locked. Complete previous missions first.' });
  }

  // Mark as IN_PROGRESS if currently AVAILABLE
  if (progress && progress.status === 'AVAILABLE') {
    await supabaseAdmin
      .from('user_progress')
      .update({ status: 'IN_PROGRESS', updated_at: new Date().toISOString() })
      .eq('id', progress.id);
  }

  res.status(200).json({ mission, progress: progress || null });
});

// ─── POST /api/mission/complete ──────────────────────────────────────────────
export const completeMission = asyncHandler(async (req, res) => {
  const { user } = req;
  const { missionId, difficultyRating, userNotes } = req.body;

  // 1. Find the progress row
  const { data: progress, error: progressError } = await supabaseAdmin
    .from('user_progress')
    .select('*, missions(sequence_order, track_id)')
    .eq('user_id', user.id)
    .eq('mission_id', missionId)
    .single();

  if (progressError || !progress) {
    return res.status(404).json({ error: 'Mission progress record not found.' });
  }

  if (progress.status === 'COMPLETED') {
    return res.status(400).json({ error: 'Mission already completed.' });
  }

  // 2. Mark this mission as completed
  const { error: updateError } = await supabaseAdmin
    .from('user_progress')
    .update({
      status: 'COMPLETED',
      difficulty_rating: difficultyRating,
      user_notes: userNotes || null,
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', progress.id);

  if (updateError) {
    return res.status(500).json({ error: 'Failed to mark mission as completed.' });
  }

  // 3. Unlock the next mission in sequence
  const { data: nextMission, error: nextError } = await supabaseAdmin
    .from('missions')
    .select('id')
    .eq('track_id', progress.missions.track_id)
    .eq('sequence_order', progress.missions.sequence_order + 1)
    .single();

  let nextMissionUnlocked = false;
  if (!nextError && nextMission) {
    const { error: unlockError } = await supabaseAdmin
      .from('user_progress')
      .update({ status: 'AVAILABLE', updated_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .eq('mission_id', nextMission.id);

    if (!unlockError) nextMissionUnlocked = true;
  }

  // 4. Update streak
  const today = new Date().toISOString().split('T')[0];
  const { data: profileData } = await supabaseAdmin
    .from('profiles')
    .select('current_streak, last_active_date')
    .eq('id', user.id)
    .single();

  let newStreak = 1;
  if (profileData) {
    const lastActive = profileData.last_active_date;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (lastActive === yesterdayStr) {
      newStreak = (profileData.current_streak || 0) + 1;
    } else if (lastActive === today) {
      newStreak = profileData.current_streak || 1;
    }
  }

  await supabaseAdmin
    .from('profiles')
    .update({
      current_streak: newStreak,
      last_active_date: today,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id);

  res.status(200).json({
    success: true,
    newStreak,
    nextMissionUnlocked,
    nextMissionId: nextMissionUnlocked ? nextMission?.id : null,
  });
});

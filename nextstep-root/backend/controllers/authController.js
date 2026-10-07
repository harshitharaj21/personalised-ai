import asyncHandler from 'express-async-handler';
import { supabaseAdmin } from '../config/db.js';

// ─── POST /api/auth/sync-user ────────────────────────────────────────────────
/**
 * Called immediately after Supabase Auth signup/login.
 * Creates or returns the profiles row for the authenticated user.
 */
export const syncUser = asyncHandler(async (req, res) => {
  const { user } = req; // attached by authMiddleware
  const { fullName, email } = req.body;

  // Upsert profile (idempotent — safe to call multiple times)
  const { data: profile, error } = await supabaseAdmin
    .from('profiles')
    .upsert(
      {
        id: user.id,
        full_name: fullName,
        email: email || user.email,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id', ignoreDuplicates: false }
    )
    .select()
    .single();

  if (error) {
    console.error('syncUser error:', error);
    return res.status(500).json({ error: 'Failed to sync user profile.' });
  }

  res.status(200).json({ profile });
});

// ─── POST /api/auth/onboarding ───────────────────────────────────────────────
/**
 * Sets daily capacity and initialises user_progress for the selected track.
 */
export const completeOnboarding = asyncHandler(async (req, res) => {
  const { user } = req;
  const { dailyCapacityMinutes, trackSlug } = req.body;

  // 1. Update profile capacity
  const { error: profileError } = await supabaseAdmin
    .from('profiles')
    .update({
      daily_capacity_minutes: dailyCapacityMinutes,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id);

  if (profileError) {
    return res.status(500).json({ error: 'Failed to update profile capacity.' });
  }

  // 2. Fetch track
  const { data: track, error: trackError } = await supabaseAdmin
    .from('tracks')
    .select('id')
    .eq('slug', trackSlug)
    .single();

  if (trackError || !track) {
    return res.status(404).json({ error: 'Track not found.' });
  }

  // 3. Fetch all missions for the track
  const { data: missions, error: missionsError } = await supabaseAdmin
    .from('missions')
    .select('id, sequence_order')
    .eq('track_id', track.id)
    .order('sequence_order', { ascending: true });

  if (missionsError || !missions.length) {
    return res.status(500).json({ error: 'Failed to load track missions.' });
  }

  // 4. Check for existing progress rows to avoid duplicate upsert issues
  const { data: existingProgress } = await supabaseAdmin
    .from('user_progress')
    .select('mission_id')
    .eq('user_id', user.id);

  const existingMissionIds = new Set((existingProgress || []).map((p) => p.mission_id));

  const progressRows = missions
    .filter((m) => !existingMissionIds.has(m.id))
    .map((m, idx) => ({
      user_id: user.id,
      mission_id: m.id,
      status: idx === 0 ? 'AVAILABLE' : 'LOCKED',
    }));

  if (progressRows.length > 0) {
    const { error: progressError } = await supabaseAdmin
      .from('user_progress')
      .insert(progressRows);

    if (progressError) {
      console.error('Onboarding progress insert error:', progressError);
      return res.status(500).json({ error: 'Failed to initialize mission progress.' });
    }
  }

  res.status(200).json({ success: true, message: 'Onboarding complete.' });
});

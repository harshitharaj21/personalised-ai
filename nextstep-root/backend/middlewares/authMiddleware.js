import { supabaseAdmin } from '../config/db.js';

/**
 * Middleware to verify Supabase Bearer JWT token.
 * Attaches `req.user` (auth user) and `req.profile` (profiles row) to the request.
 */
export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: No Bearer token provided.' });
    }

    const token = authHeader.split(' ')[1];

    // Verify the JWT with Supabase Auth
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Unauthorized: Invalid or expired token.' });
    }

    // Fetch the user's profile row
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      // PGRST116 = row not found (profile may not exist yet during onboarding)
      console.error('Profile fetch error:', profileError);
    }

    req.user = user;
    req.profile = profile || null;
    req.token = token;
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    res.status(500).json({ error: 'Internal server error during authentication.' });
  }
};

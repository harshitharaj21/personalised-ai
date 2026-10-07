const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Helper to get auth header
const getAuthHeader = (token) => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`,
});

// Generic fetch wrapper with error handling
const apiFetch = async (path, options = {}) => {
  const response = await fetch(`${BASE_URL}${path}`, options);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const err = new Error(data.error || `API Error ${response.status}`);
    err.status = response.status;
    err.details = data.details;
    throw err;
  }
  return data;
};

// ─── Auth APIs ────────────────────────────────────────────────────────────────
export const syncUser = (token, fullName, email) =>
  apiFetch('/auth/sync-user', {
    method: 'POST',
    headers: getAuthHeader(token),
    body: JSON.stringify({ fullName, email }),
  });

export const completeOnboarding = (token, dailyCapacityMinutes, trackSlug = 'dsa-foundations') =>
  apiFetch('/auth/onboarding', {
    method: 'POST',
    headers: getAuthHeader(token),
    body: JSON.stringify({ dailyCapacityMinutes, trackSlug }),
  });

// ─── Dashboard APIs ───────────────────────────────────────────────────────────
export const fetchDashboard = (token) =>
  apiFetch('/dashboard', {
    method: 'GET',
    headers: getAuthHeader(token),
  });

// ─── Mission APIs ─────────────────────────────────────────────────────────────
export const fetchMission = (token, missionId) =>
  apiFetch(`/mission/${missionId}`, {
    method: 'GET',
    headers: getAuthHeader(token),
  });

export const completeMission = (token, missionId, difficultyRating, userNotes) =>
  apiFetch('/mission/complete', {
    method: 'POST',
    headers: getAuthHeader(token),
    body: JSON.stringify({ missionId, difficultyRating, userNotes }),
  });

// ─── Adapt APIs ───────────────────────────────────────────────────────────────
export const previewAdaptation = (token, reasonCode, newCapacityMinutes) =>
  apiFetch('/adapt/preview', {
    method: 'POST',
    headers: getAuthHeader(token),
    body: JSON.stringify({ reasonCode, newCapacityMinutes }),
  });

export const acceptAdaptation = (token, reasonCode, newCapacityMinutes) =>
  apiFetch('/adapt/accept', {
    method: 'POST',
    headers: getAuthHeader(token),
    body: JSON.stringify({ reasonCode, newCapacityMinutes }),
  });

// ─── AI Tutor APIs ────────────────────────────────────────────────────────────
export const askTutor = (token, missionId, userQuestion) =>
  apiFetch('/ai/tutor', {
    method: 'POST',
    headers: getAuthHeader(token),
    body: JSON.stringify({ missionId, userQuestion }),
  });

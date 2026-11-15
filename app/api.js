// Read-only client for make.fun's public API.
const API = 'https://make.fun/api';

async function get(path) {
  const response = await fetch(`${API}${path}`);
  if (!response.ok) throw new Error(`make.fun API returned ${response.status}`);
  return response.json();
}

// The board contract is one canonical request; its response contains { items: [...] }.
export const getBounties = () => get('/competitions?status=open&activity=times');
export const getBounty = (slug) => get(`/competitions/${encodeURIComponent(slug)}`);
export const getLeaderboard = (slug) => get(`/competitions/${encodeURIComponent(slug)}/leaderboard`);
export const getProfile = (handle) => get(`/profiles/${encodeURIComponent(handle)}`);

export function leaderboardRows(data) {
  for (const key of ['rows', 'entries', 'leaderboard', 'items']) {
    if (Array.isArray(data?.[key])) return data[key];
  }
  return [];
}

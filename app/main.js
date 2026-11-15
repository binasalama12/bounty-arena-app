import { getBounties, getBounty, getLeaderboard, getProfile } from './api.js';
import { board, bounty, errorView, leaderboard, loading, profile } from './views.js';

const app = document.getElementById('app');
let boardData = null;
const savedSort = sessionStorage.getItem('bounty-arena-sort');
let boardSort = savedSort === 'pot' ? 'pot' : 'deadline';
let boardFilter = '';
let competitions = [];

function route() {
  const parts = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  return { page: parts[0] || 'board', slug: parts[1] ? decodeURIComponent(parts[1]) : '' };
}

async function render() {
  window.__shotReady = false;
  app.innerHTML = loading();
  const { page, slug } = route();
  try {
    if (page === 'bounty' && slug) {
      const data = await getBounty(slug);
      document.title = `${data.title} | Bounty Arena`;
      app.innerHTML = bounty(data);
    } else if (page === 'leaderboard') {
      if (!competitions.length) {
        const data = await getBounties();
        competitions = Array.isArray(data.items) ? data.items : [];
      }
      const biggest = [...competitions].sort((a, b) => Number(b.potUsd || 0) - Number(a.potUsd || 0))[0];
      const chosen = slug || biggest?.slug;
      if (!chosen) throw new Error('No open competitions are available for the leaderboard.');
      const data = await getLeaderboard(chosen);
      document.title = 'Leaderboard | Bounty Arena';
      app.innerHTML = leaderboard(data, competitions);
    } else if (page === 'profile' && slug) {
      const data = await getProfile(slug);
      document.title = `${data.display_name || data.handle} | Bounty Arena`;
      app.innerHTML = profile(data);
    } else {
      if (!boardData) {
        boardData = await getBounties();
        competitions = Array.isArray(boardData.items) ? boardData.items : [];
      }
      document.title = 'Bounty Arena | make.fun';
      app.innerHTML = board(boardData, { sort: boardSort, filter: boardFilter });
    }
  } catch (error) {
    app.innerHTML = errorView(error);
  }
  window.scrollTo(0, 0);
  window.__shotReady = true;
}

app.addEventListener('input', (event) => {
  if (event.target.id === 'title-filter') {
    boardFilter = event.target.value;
    app.innerHTML = board(boardData, { sort: boardSort, filter: boardFilter });
    const field = document.getElementById('title-filter');
    field.focus(); field.setSelectionRange(field.value.length, field.value.length);
  }
});
app.addEventListener('change', (event) => {
  if (event.target.id === 'sort-order') {
    boardSort = event.target.value;
    sessionStorage.setItem('bounty-arena-sort', boardSort);
    app.innerHTML = board(boardData, { sort: boardSort, filter: boardFilter });
  }
  if (event.target.id === 'competition-picker') location.hash = `#/leaderboard/${encodeURIComponent(event.target.value)}`;
});
window.addEventListener('hashchange', render);
render();

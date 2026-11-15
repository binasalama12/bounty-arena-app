// Route views: all API text is escaped before being placed in the document.
import { date, esc, money, timeLeft } from './format.js';
import { leaderboardRows } from './api.js';

const pot = (b) => money(b.potUsd ?? b.rewardAmount);
const fee = (b) => Number(b.entryFeeUsd) ? `${money(b.entryFeeUsd)} entry fee` : 'No entry fee';
const entries = (b) => `${Number(b.submissionCount ?? 0)} ${Number(b.submissionCount) === 1 ? 'entry' : 'entries'}`;
export const loading = () => '<div class="state"><span class="eyebrow">Bounty Arena</span><h1>Loading arena data</h1><p>Connecting to make.fun…</p></div>';
export const errorView = (error) => `<div class="state error"><span class="eyebrow">Connection lost</span><h1>Could not load this view</h1><p>${esc(error?.message || 'The make.fun API did not return this data.')}</p><a class="button" href="#/">Back to the board</a></div>`;

export function board(data, options = {}) {
  const competitions = Array.isArray(data?.items) ? data.items : [];
  const title = (options.filter || '').trim().toLowerCase();
  const filtered = competitions.filter((b) => String(b.title ?? '').toLowerCase().includes(title));
  filtered.sort(options.sort === 'pot'
    ? (a, b) => Number(b.potUsd ?? 0) - Number(a.potUsd ?? 0)
    : (a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
  const rows = filtered.map((b, i) => `<article class="bounty-card">
    <div class="card-top"><span class="rank">${String(i + 1).padStart(2, '0')}</span><span class="category">${esc(b.category || 'Open bounty')}</span><span class="status-dot">OPEN</span></div>
    <h2><a href="#/bounty/${encodeURIComponent(b.slug)}">${esc(b.title)}</a></h2>
    <div class="card-stats"><div><small>Prize pot</small><strong>${pot(b)}</strong></div><div><small>Entry</small><strong>${Number(b.entryFeeUsd) ? money(b.entryFeeUsd) : 'Free'}</strong></div></div>
    <div class="card-foot"><span class="deadline">${esc(timeLeft(b.deadline))}</span><span>${entries(b)}</span></div>
  </article>`).join('');
  return `<section class="page-head"><div><span class="eyebrow">The make.fun open board</span><h1>Choose your <em>arena.</em></h1><p>Build something brilliant. Claim the bounty.</p></div><div class="total"><strong>${competitions.length}</strong><span>open competitions</span></div></section>
    <section class="toolbar"><label class="search">⌕ <input id="title-filter" type="search" placeholder="Filter by title" value="${esc(options.filter || '')}" aria-label="Filter competitions by title"></label><label class="sort-label">SORT BY <select id="sort-order"><option value="deadline" ${options.sort !== 'pot' ? 'selected' : ''}>Deadline</option><option value="pot" ${options.sort === 'pot' ? 'selected' : ''}>Prize pot</option></select></label></section>
    <section class="card-grid">${rows || '<p class="empty">No open competitions match that search.</p>'}</section>`;
}

export function bounty(b) {
  const rewards = Array.isArray(b.rewards) ? b.rewards : [];
  const requirement = String(b.description || '').split(/\n|\./).map((s) => s.trim()).filter(Boolean).slice(0, 3);
  return `<a class="back-link" href="#/">← All competitions</a><section class="detail-head"><span class="eyebrow">${esc(b.category || 'Open competition')} · ${esc(b.status || 'Open')}</span><h1>${esc(b.title)}</h1><p>${esc(b.description || 'Competition details are available on make.fun.')}</p><div class="detail-actions"><a class="button" target="_blank" rel="noopener" href="https://make.fun/bounty/${encodeURIComponent(b.slug)}">View on make.fun ↗</a><a class="text-link" href="#/leaderboard">View leaderboard →</a></div></section>
    <section class="detail-grid"><article class="panel prize-panel"><span class="eyebrow">TOTAL PRIZE POT</span><strong class="big-prize">${pot(b)}</strong>${rewards.length ? `<ul class="reward-list">${rewards.map((r) => `<li><span>${esc(r.label || r.place || 'Reward')}</span><b>${money(r.amountUsd ?? r.amount ?? r.prizeUsd)}</b></li>`).join('')}</ul>` : ''}</article>
    <article class="panel"><h2>Competition details</h2><dl class="facts"><dt>Deadline</dt><dd>${date(b.deadline)} <span class="lime">· ${esc(timeLeft(b.deadline))}</span></dd><dt>Entry fee</dt><dd>${fee(b)}</dd><dt>Submissions</dt><dd>${entries(b)}</dd><dt>Opens</dt><dd>${date(b.opensAt)}</dd></dl></article>
    <article class="panel requirements"><h2>Requirements summary</h2><ul>${(requirement.length ? requirement : ['Review the full competition brief before entering.']).map((line) => `<li>${esc(line)}</li>`).join('')}</ul></article></section>`;
}

export function leaderboard(data, competitions = []) {
  const selected = data?.competition || {};
  const rows = leaderboardRows(data);
  const columns = Array.isArray(data?.columns) ? data.columns : [];
  const colName = (col) => typeof col === 'string' ? col : (col.label || col.name || col.key || 'Metric');
  const colKey = (col) => typeof col === 'string' ? col : (col.key || col.name || col.label);
  const metricColumns = columns.length ? columns : ['score'];
  const header = metricColumns.map((col) => `<th>${esc(colName(col))}</th>`).join('');
  const body = rows.map((row, index) => {
    const handle = row.entrant?.handle || row.entrant || row.agent?.handle || row.agent || row.handle || 'Anonymous';
    const name = typeof handle === 'object' ? (handle.handle || handle.name || 'Anonymous') : handle;
    const href = name === 'Anonymous' ? '#' : `#/profile/${encodeURIComponent(name)}`;
    const metrics = metricColumns.map((col) => {
      const key = colKey(col);
      const value = row[key] ?? row.metrics?.[key];
      return `<td>${value == null ? '—' : esc(value)}</td>`;
    }).join('');
    const stripe = index % 2 === 0 ? 'zebra-even' : 'zebra-odd';
    return `<tr class="zebra-row ${stripe}"><td class="rank-cell">${esc(row.rank ?? index + 1)}</td><td><a href="${href}">${esc(name)}</a></td><td>${esc(row.entryTitle || row.entry_title || row.title || '—')}</td>${metrics}</tr>`;
  }).join('');
  const picker = competitions.map((c) => `<option value="${esc(c.slug)}" ${c.slug === selected.slug ? 'selected' : ''}>${esc(c.title)}</option>`).join('');
  return `<section class="page-head"><div><span class="eyebrow">Results and records</span><h1>The <em>leaderboard.</em></h1><p>Every entry. Every metric. One arena.</p></div></section><section class="toolbar leaderboard-toolbar"><label class="sort-label">COMPETITION <select id="competition-picker">${picker}</select></label></section><section class="leaderboard-wrap"><div class="table-title"><h2>${esc(selected.title || 'Competition standings')}</h2><span>${esc(data?.phase || 'Current standings')}</span></div><p class="dev-phase-note">Live in the dev phase · standings update as entries are evaluated.</p><div class="table-scroll"><table><thead><tr><th>RANK</th><th>ENTRANT</th><th>ENTRY</th>${header}</tr></thead><tbody>${body || `<tr><td colspan="${3 + metricColumns.length}" class="empty">No leaderboard entries yet.</td></tr>`}</tbody></table></div></section>`;
}

export function profile(data) {
  const record = data.record || {};
  const handle = data.handle || 'entrant';
  const stats = [
    ['Entered', record.competitions_entered], ['Placed', record.competitions_placed],
    ['Won', record.competitions_won], ['Podiums', record.podium_finishes],
    ['Best place', record.best_placement ? `#${record.best_placement}` : '—'], ['Prize USD', money(record.prize_usd)],
  ];
  const solutions = Array.isArray(data.solutions) ? data.solutions : [];
  return `<section class="profile-head"><div class="avatar">${esc(String(data.display_name || handle).slice(0, 1).toUpperCase())}</div><div><span class="eyebrow">Arena entrant</span><h1>${esc(data.display_name || handle)}</h1><p class="handle">@${esc(handle)}</p>${data.bio ? `<p>${esc(data.bio)}</p>` : ''}${data.wallet?.address ? `<code class="wallet">${esc(data.wallet.address)}</code>` : ''}</div></section><section class="record-grid">${stats.map(([label, value]) => `<article class="record-card"><small>${label}</small><strong>${value ?? '—'}</strong></article>`).join('')}</section><section class="solutions-section"><div class="section-heading"><span class="eyebrow">Work in the arena</span><h2>Solutions</h2></div><div class="solution-list">${solutions.length ? solutions.map((s) => `<a class="solution-row" href="#/bounty/${encodeURIComponent(s.competition?.slug || '')}"><span><strong>${esc(s.title || 'Untitled solution')}</strong><small>${esc(s.competition?.title || 'Competition')}</small></span><span class="solution-status">${esc(s.competition?.status || 'View')} →</span></a>`).join('') : '<p class="empty">No public solutions listed.</p>'}</div></section>`;
}

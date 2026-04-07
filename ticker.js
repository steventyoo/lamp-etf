/**
 * ticker.js
 *
 * Populates the ticker tape with prediction market odds.
 *
 * HOW IT WORKS:
 * 1. On load, renders STATIC_MARKETS immediately so the ticker is never blank.
 * 2. Then attempts to fetch live data from the Polymarket Gamma API.
 * 3. If the fetch succeeds, replaces the static data with live prices.
 * 4. Refreshes every 60 seconds.
 *
 * TO ADD MORE MARKETS:
 * Add entries to STATIC_MARKETS with the Polymarket slug as the key.
 * Find slugs at: https://gamma-api.polymarket.com/markets?active=true&limit=100
 */

// ── Static fallback data (shown instantly + used if API is unavailable) ──
const STATIC_MARKETS = [
  { label: 'DEM NOMINEE 2028',       value: 'NEWSOM 24% · AOC 8%' },
  { label: 'REP NOMINEE 2028',       value: 'VANCE 37% · RUBIO 20%' },
  { label: '2028 PRES WINNER',       value: 'VANCE 17% · NEWSOM 17%' },
  { label: 'HOUSE 2026',             value: 'DEM 86% · REP 14%' },
  { label: 'SENATE 2026',            value: 'DEM 51% · REP 49%' },
  { label: 'BALANCE OF POWER 2026',  value: 'DEM SWEEP 52%' },
  { label: 'POWELL OUT BY JUN 30',   value: '76%' },
  { label: 'US FORCES IN IRAN',      value: '90% · $191M VOL' },
  { label: 'IRAN CEASEFIRE DEC 31',  value: '76%' },
  { label: 'SCOTUS VACANCY 2026',    value: '59%' },
  { label: 'WHICH PARTY WINS 2028',  value: 'DEM 59% · REP 42%' },
];

// ── Polymarket Gamma API slugs for live data ──
// Each entry maps a display label to a Polymarket market slug + outcome index.
// outcome: 0 = first outcome listed, 1 = second, etc.
// Find slugs: https://gamma-api.polymarket.com/markets?active=true&limit=100
const LIVE_MARKET_SLUGS = [
  {
    label: 'HOUSE 2026',
    slug: 'will-democrats-win-the-house-in-2026',
    format: (price) => `DEM ${pct(price)} · REP ${pct(1 - price)}`,
  },
  {
    label: 'SENATE 2026',
    slug: 'will-democrats-win-the-senate-in-2026',
    format: (price) => `DEM ${pct(price)} · REP ${pct(1 - price)}`,
  },
  {
    label: 'POWELL OUT BY JUN 30',
    slug: 'will-jerome-powell-leave-as-fed-chair-by-june-30-2026',
    format: (price) => pct(price),
  },
  {
    label: 'SCOTUS VACANCY 2026',
    slug: 'will-there-be-a-supreme-court-vacancy-in-2026',
    format: (price) => pct(price),
  },
];

const GAMMA_BASE = 'https://gamma-api.polymarket.com';

// ── helpers ──
function pct(p) {
  return Math.round(p * 100) + '%';
}

function buildTickerHTML(markets) {
  // duplicate content for seamless infinite scroll
  const items = markets
    .map(m => `<span>${m.label}: ${m.value}</span><span class="ticker-sep">●</span>`)
    .join('');
  return items + items; // doubled for seamless loop
}

function renderTicker(markets) {
  const el = document.getElementById('ticker-inner');
  if (!el) return;
  el.innerHTML = buildTickerHTML(markets);
}

// ── live fetch ──
async function fetchLiveOdds() {
  const results = [...STATIC_MARKETS]; // start from static copy

  try {
    const fetches = LIVE_MARKET_SLUGS.map(async (m) => {
      const res = await fetch(`${GAMMA_BASE}/markets?slug=${m.slug}`, {
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) return null;
      const data = await res.json();
      if (!data || !data.length) return null;

      const market = data[0];
      // outcomePrices is a JSON string array e.g. '["0.86","0.14"]'
      const prices = JSON.parse(market.outcomePrices || '[]');
      if (!prices.length) return null;

      const price = parseFloat(prices[0]);
      return { label: m.label, value: m.format(price) };
    });

    const liveResults = await Promise.all(fetches);

    liveResults.forEach((live) => {
      if (!live) return;
      const idx = results.findIndex(r => r.label === live.label);
      if (idx !== -1) {
        results[idx] = live; // replace static with live
      }
    });
  } catch (err) {
    console.warn('[ticker] Live fetch failed, using static data:', err.message);
  }

  renderTicker(results);
}

// ── init ──
document.addEventListener('DOMContentLoaded', () => {
  // 1. Render static immediately
  renderTicker(STATIC_MARKETS);

  // 2. Fetch live data
  fetchLiveOdds();

  // 3. Refresh every 60s
  setInterval(fetchLiveOdds, 60_000);
});

# LAMP ETF — Subversive Capital

Landing page for the LAMP Political Intelligence ETF.

## File structure

```
lamp-etf/
├── index.html      # Main page markup
├── styles.css      # All styles (Barlow Condensed, Subversive aesthetic)
├── ticker.js       # Ticker tape — static fallback + live Polymarket API
├── vercel.json     # Vercel deployment config
└── README.md
```

## Local development

No build step required. Just open `index.html` in a browser, or run a local server:

```bash
# Python
python3 -m http.server 3000

# Node (if you have npx)
npx serve .
```

Then visit `http://localhost:3000`.

## Deploy to Vercel

### Option A — CLI (fastest)
```bash
npm i -g vercel
cd lamp-etf
vercel
```
Follow the prompts. You'll get a live URL in ~30 seconds.

### Option B — GitHub
1. Push this folder to a GitHub repo
2. Go to vercel.com → Add New Project → Import Git Repository
3. Select the repo → Deploy
4. Every push to `main` auto-redeploys

### Custom domain
Vercel dashboard → your project → Settings → Domains → add your domain.

---

## Live ticker data (Polymarket API)

`ticker.js` fetches live odds from the Polymarket Gamma API and updates the
ticker tape every 60 seconds. Static fallback data is shown immediately on
load so the ticker is never blank.

**To add more live markets:**
1. Find the market slug at `https://gamma-api.polymarket.com/markets?active=true&limit=100`
2. Add an entry to `LIVE_MARKET_SLUGS` in `ticker.js`:

```js
{
  label: 'YOUR LABEL',
  slug: 'the-polymarket-slug-here',
  format: (price) => pct(price),  // or custom format function
}
```

**Note:** The Polymarket Gamma API has CORS headers that allow browser
requests. No API key required. If you hit rate limits in production, proxy
the requests through a Vercel Edge Function (ask Claude Code to set this up).

---

## Updating content

- **Ticker static data** → edit `STATIC_MARKETS` array in `ticker.js`
- **Stats strip numbers** → edit the `.strip-val` divs in `index.html`
- **Segment weights/volumes** → edit the `.segment-card` divs in `index.html`
- **NAV price** → edit `#nav-price` and `#nav-change` in `index.html` (or wire to a real feed)
- **Colors/fonts** → edit CSS variables in `styles.css` (`:root` block at the top)
- **ETF description** → edit `.etf-desc` in `index.html`

---

## Next steps for Claude Code

Things worth building next:
- [ ] Wire NAV price to a real data source
- [ ] Add individual contract pages (Holdings detail)
- [ ] Add a Vercel Edge Function to proxy Polymarket API (avoids CORS in prod)
- [ ] Add a contact / investor interest form
- [ ] Mobile hamburger nav

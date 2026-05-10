# HantaTracker — Design Spec
**Date:** 2026-05-09
**Status:** Approved

## Overview

A static website hosted on GitHub Pages that tracks hantavirus cases globally on an interactive map. Targets the general public — simple, jargon-free UI. Data is fetched daily from trusted public health sources via a GitHub Actions cron job and committed to the repo as a static JSON file. Google AdSense units provide revenue.

---

## Architecture

```
GitHub Actions (cron, daily)
  → runs scripts/fetch-cases.js
  → fetches from CDC, WHO, ProMED, HealthMap
  → normalizes into public/data/cases.json
  → commits + pushes if data changed

GitHub Pages
  → serves built static site from gh-pages branch
  → browser fetches cases.json at page load
  → Leaflet.js renders map with markers
```

Two GitHub Actions workflows:
- `fetch-data.yml` — daily cron, runs the fetch script, commits updated JSON
- `deploy.yml` — triggers on push to main, builds with Vite, deploys to `gh-pages` branch

No server, no database, no cost beyond the domain (optional).

---

## Data Sources

| Source | Coverage | Method |
|---|---|---|
| CDC (data.cdc.gov) | US state-level case counts | JSON/CSV API |
| WHO Disease Outbreak News | International country-level alerts | RSS feed + HTML parsing |
| ProMED-mail | Near-real-time global outbreak reports | RSS feed (no key required) |
| HealthMap | Aggregated alerts with geo-coordinates | Public JSON feed |

**Data shape — `public/data/cases.json`:**
```json
{
  "last_updated": "2026-05-09T00:00:00Z",
  "cases": [
    {
      "id": "us-mt-2024",
      "location": "Montana, USA",
      "lat": 46.8797,
      "lng": -110.3626,
      "level": "state",
      "count": 2,
      "last_case_date": "2024-09-15",
      "source": "CDC",
      "source_url": "https://..."
    }
  ]
}
```

Geographic granularity: state/province level where data exists (US, EU), country level elsewhere.

Hantavirus is rare (~20–50 US cases/year). The map shows "last confirmed case" per region rather than a live stream — accurate and consistent with how CDC and WHO present this data.

---

## UI Components

### Header
- Site name: "HantaTracker"
- Last-updated timestamp
- "● LIVE" badge — green if data < 7 days old, gray otherwise

### Stat Cards (4 cards, row layout)
| Card | Metric | Color |
|---|---|---|
| Cases this year | Total confirmed cases in current year | Red |
| Cases this month | Cases reported in current month | Amber |
| Countries affected | Distinct countries with recorded cases | Indigo |
| Fatality rate | Historical case fatality rate (~36%) — static display value, not computed from cases.json | Red |

### Interactive Map (Leaflet.js + OpenStreetMap)
- Circle markers: size proportional to case count, color by recency (red = recent, amber = older)
- Click marker → popup showing: location name, case count, date of last case, source link
- Zoom: state/province detail where available, country level elsewhere

### Google AdSense Placements
- **Leaderboard (728×90):** between stat cards and map
- **Rectangle (300×250):** in footer beside the "What is Hantavirus?" blurb
- Both lazy-loaded to avoid blocking map render

### Footer
- "What is Hantavirus?" — 1–2 sentence plain-language blurb
- Links to CDC and WHO for further reading

---

## Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Frontend framework | Vite + React | Lightweight, fast build, outputs plain static files |
| Map library | Leaflet.js | Free, no API key, well-supported |
| Map tiles | OpenStreetMap | Free, no API key |
| Hosting | GitHub Pages (`gh-pages` branch) | Free, reliable |
| Data pipeline | GitHub Actions cron | Free for public repos, no external service needed |
| Ads | Google AdSense | Revenue from display ads |

---

## File Structure

```
hanta-virus-map/
├── .github/
│   └── workflows/
│       ├── fetch-data.yml        # daily cron: fetch + commit cases.json
│       └── deploy.yml            # on push to main: build + deploy to gh-pages
├── src/
│   ├── App.jsx                   # root layout
│   ├── components/
│   │   ├── StatCards.jsx         # 4 metric cards
│   │   ├── Map.jsx               # Leaflet map wrapper
│   │   ├── MarkerPopup.jsx       # click popup content
│   │   └── AdUnit.jsx            # Google AdSense wrapper
│   └── main.jsx
├── public/
│   └── data/
│       └── cases.json            # auto-updated by GitHub Action
├── scripts/
│   └── fetch-cases.js            # Node.js fetch + normalize script
├── docs/
│   └── superpowers/specs/
│       └── 2026-05-09-hantavirus-map-design.md
└── vite.config.js
```

---

## Out of Scope

- User accounts or saved preferences
- Historical trend charts
- Mobile app
- Email/push alerts
- Data download / export

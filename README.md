# Restaurant Sim Trainer

A small **React + TypeScript** project that prototypes a restaurant training simulator / PWA.

This repo bundles everything we discussed:

- A simple **grid-based restaurant layout**
- **Simulation engine** with scenarios
- **Play-as-server mode** (keyboard + touch controls)
- Two **tutorial scenarios**:
  - `First Table – Server Training`
  - `Two Tables – Section Management`
- A `Friday Night Rush` scenario stub
- A **compact UI mode** that works well on phones
- A clear structure to extend later in Windsurf / your editor

> ⚠️ This is a *prototype scaffold*, not a full production sim.
> It’s intentionally simple so you can extend and refactor it.

---

## Tech stack

- React 18
- TypeScript
- Vite
- Zustand (for simulation store)

---

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:5173 (default Vite port).

---

## Deploying to GitHub Pages

The project is configured with `base: './'` so a static build can run on GitHub Pages.

1. Build:

   ```bash
   npm run build
   ```

2. Deploy the contents of `dist/` to your `gh-pages` branch or use a GitHub Action for Vite/Pages.

---

## PWA notes

- The project includes a minimal `manifest.json` and dark theme colors.
- For a full PWA (offline, install prompts), you’ll want to:
  - Add a service worker (e.g., using `vite-plugin-pwa` or a custom SW).
  - Add icons in `public/icons/`.
  - Tune cache strategy for the simulation and assets.

This scaffold keeps it simple so you can decide how deep you want to go with PWA.

---

## Main views & concepts

The app has a single-page layout with a **Simulation Console** that supports:

- **Scenario selection** (`Free Play`, `Tutorials`, `Friday Night Rush`)
- **Play as server** with:
  - Keyboard (WASD / arrow keys)
  - On-screen D-pad (touch-friendly)
- **Tutorial HUD** that explains what to do next
- **Compact mode** toggle for mobile

Core files:

- `src/App.tsx` – high-level layout & view selection
- `src/state/simStore.ts` – Zustand store
- `src/sim/types.ts` – shared simulation types
- `src/sim/engine.ts` – simulation orchestrator
- `src/sim/heuristics.ts` – spawn, tasks, updates
- `src/sim/pathfinding.ts` – simple grid A* pathfinding
- `src/sim/scenarios.ts` – scenario definitions
- Components in `src/components/` – HUD, panels, tutorial, floor grid, etc.

---

## Simulation overview (current behavior)

This is a *lightweight* sim with the following ideas wired up:

- Time advances in discrete ticks (e.g., 0.25 minutes).
- Staff have:
  - Position (`x`, `y`) on the grid
  - Role (`server`, `host`, etc.)
  - Speed
- Guests have:
  - A table assignment
  - A state (waiting for greet, ordering, eating, etc.)
  - Simple patience / satisfaction values
- Staff tasks:
  - `greetTable`
  - `takeOrder`
  - `dropCheck`
  - Optional `cashout`
- Tasks have:
  - A target table & guest
  - A minimum time they must spend at the table to complete (cooldown)
- Kitchen tickets are created when orders are taken and move through states:
  - `pending` → `inProgress` → `ready` → `delivered`

### AI vs Player

- AI servers:
  - Automatically take tasks from the queue in priority order.
  - Auto-path to the table via A*.
  - Complete tasks when they reach and remain at the table for a minimum duration.

- Player server:
  - You select which server you control.
  - You **manually** claim tasks via the HUD.
  - You move via keyboard or on-screen D-pad.
  - Task completes only after you reach the table and stay long enough.

---

## Scenarios included

### 1. First Table – Server Training

A very simple tutorial:

- Layout: 1 table (T1), 1 host station, 1 kitchen.
- One party already seated at T1.
- You are the only server.
- Tutorial panel walks through:
  1. Greet table
  2. Take order
  3. Watch the ticket
  4. Drop the check
  5. Cash out & watch them leave

### 2. Two Tables – Section Management

Second tutorial:

- Layout: 2 tables (T1, T2).
- Two parties, one at each table.
- You are the server for both.
- Tutorial panel encourages you to juggle tasks between the two tables.

### 3. Friday Night Rush (stub)

A more complex scenario scaffold:

- Larger layout with multiple tables & stations.
- Multiple staff (servers, host, expo, bartender).
- Uses an arrival curve (bell-shaped) to model rush intensity.
- Scorecard with grade (S–F) based on:
  - Average seating wait
  - Average ticket time
  - Number of unhappy guests

The Friday Night Rush implementation here is simplified and meant as a starting point
for deeper heuristics and analytics.

---

## Compact UI mode

The app exposes a `Compact UI` checkbox in the header:

- **Off (default on desktop):**
  - Metrics & Event log show side-by-side.
  - Staff, Tasks, and Tickets show in a separate row.

- **On (default on narrow screens):**
  - Panels are stacked into `<details>` sections:
    - Metrics & Events
    - Staff & Tasks
    - Kitchen Tickets
  - Keeps the important controls (scenario, Player HUD, tutorial) visible and thumb-friendly.

---

## Future patches & ideas (not fully implemented here)

This repo is meant as a base; here are directions to take it further:

1. **Richer heuristics & AI**
   - More nuanced guest satisfaction modeling (per-course timing, server friendliness).
   - Dynamic staffing (servers starting/leaving mid-shift).
   - Fatigue affecting speed and error rate.

2. **Full floorplan editor**
   - Add UI tools to:
     - Resize grid.
     - Add/remove walls.
     - Save/load layouts to localStorage or JSON files.

3. **Menu & station configuration**
   - Admin UI for defining:
     - Menu categories and items.
     - Prep times and stations per item.
   - Separate “Menu Designer” view.

4. **Additional training scenarios**
   - Short-staffed lunch.
   - Bar-heavy service (high drink volume).
   - Takeout lane / counter-service mode.

5. **Analytics & reporting**
   - Graphs for:
     - Wait-time distribution.
     - Ticket times by station.
     - Labor vs revenue for each scenario.
   - Export scorecards as JSON or CSV.

6. **Local multiplayer**
   - Same browser, multiple devices:
     - Each device controls a different server in the same sim.
   - Could use:
     - WebRTC or WebSocket with a tiny signaling server.
     - Or a simplified “hotseat” mode on one device.

7. **Deeper PWA integration**
   - Offline-capable scenario training (service worker caching).
   - “Install app” prompts.
   - Push-style reminders for scheduled training sessions.

8. **Domain-specific training content**
   - You can layer in:
     - Real menu items.
     - True floorplans of your restaurants.
     - Training scripts (how to greet, upsell, handle issues).

As you open this project in Windsurf or your editor, you’ll have a structured
starting point and can apply the patches we discussed iteratively.

---

## Where to start hacking

If you want one-file entry points for specific areas:

- **Simulation loop:** `src/sim/engine.ts`
- **AI & guest logic:** `src/sim/heuristics.ts`
- **Scenario definitions:** `src/sim/scenarios.ts`
- **Player & UI:** `src/components/PlayerHud.tsx` and `src/components/TutorialPanel.tsx`
- **Global store:** `src/state/simStore.ts`

Happy hacking — this is your skeleton for a full restaurant training sim PWA.

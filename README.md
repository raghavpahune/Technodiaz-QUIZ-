# Technodiaz Quiz Competition

Interactive quiz competition platform for live, in-person team events. Built with React, Vite, Three.js, and a WebSocket relay for real-time sync across host, projector, and team phone buzzers.

## Features

- **5 themed rounds** (Movies, GK, History, Riddles, Tech) — 250 questions total
- **Quizmaster panel** — host controls: start/stop timer, correct/incorrect, reveal answer, next question
- **Projector view** — full-screen audience display via `?mode=projector`
- **Remote phone buzzers** — each team buzzes from their own phone via QR code link
- **Buzzer queue** — first-to-buzz locks in, pass-the-turn on incorrect answers
- **Configurable timer** — per-question countdown, adjustable 10–60 seconds
- **Live scoreboard** — always visible on projector and quizmaster panel
- **Connection status** — green/gray dots show which team phones are connected
- **State persistence** — quiz state survives server restart (JSON backup)
- **3D ambient scenes** — themed Three.js backgrounds per round
- **Sound effects** — synthesized audio (buzzer, correct, incorrect, timer)

## Architecture

```
┌─────────────────┐     WebSocket      ┌───────────────────┐
│  Quizmaster     │◄──────────────────►│  Relay Server     │
│  (Host Laptop)  │                    │  (Render.com)     │
└─────────────────┘                    └───────┬───────────┘
                                               │
                    ┌──────────────────────────┼──────────────────┐
                    │                          │                  │
             ┌──────▼──────┐           ┌───────▼──────┐   ┌──────▼──────┐
             │  Projector  │           │  Team 1 Phone│   │  Team 2 Phone│
             │  ?mode=     │           │  ?mode=buzzer│   │  ?mode=buzzer│
             │  projector  │           │  &team=0     │   │  &team=1     │
             └─────────────┘           └──────────────┘   └──────────────┘
```

**Frontend**: GitHub Pages (static React SPA)  
**Backend**: Node.js WebSocket relay on Render.com (free tier)

## Quick Start (Local Development)

```bash
# 1. Clone
git clone https://github.com/raghavpahune/Technodiaz-QUIZ-.git
cd Technodiaz-QUIZ-

# 2. Install dependencies
npm install

# 3. Start dev server (includes built-in WebSocket relay)
npm run dev

# 4. Open in browser
# Quizmaster:  http://localhost:5173/Technodiaz-QUIZ-/
# Projector:   http://localhost:5173/Technodiaz-QUIZ-/?mode=projector
# Team Buzzer: http://localhost:5173/Technodiaz-QUIZ-/?mode=buzzer&team=0
```

In dev mode, the Vite plugin (`vite-ws-plugin.js`) runs the WebSocket relay — everything works on localhost with no extra setup.

## Production Deployment

### Step 1: Deploy the WebSocket Relay Server

The relay server (`server.js`) needs to be hosted somewhere with WebSocket support. We use Render.com (free tier):

1. Push this repo to GitHub
2. Go to [render.com](https://render.com) → New → **Web Service**
3. Connect your GitHub repo
4. Render auto-detects `render.yaml` — just click **Create Web Service**
5. Wait for deploy — note your URL (e.g. `https://technodiaz-quiz-relay.onrender.com`)

Verify: `curl https://technodiaz-quiz-relay.onrender.com/` should return `{"status":"ok",...}`

### Step 2: Configure Frontend

Set your Render URL in `.env.production`:

```env
VITE_WS_URL=wss://technodiaz-quiz-relay.onrender.com
```

### Step 3: Deploy Frontend to GitHub Pages

```bash
npm run deploy
```

This builds the frontend with the production WebSocket URL baked in, and publishes to GitHub Pages.

### Step 4: Use It

| View | URL |
|------|-----|
| Quizmaster | `https://raghavpahune.github.io/Technodiaz-QUIZ-/` |
| Projector | `https://raghavpahune.github.io/Technodiaz-QUIZ-/?mode=projector` |
| Team 1 Buzzer | `https://raghavpahune.github.io/Technodiaz-QUIZ-/?mode=buzzer&team=0` |
| Team 2 Buzzer | `https://raghavpahune.github.io/Technodiaz-QUIZ-/?mode=buzzer&team=1` |

Team buzzer QR codes are generated automatically in the quizmaster panel — click the **📱 QR** button.

## How It Works During an Event

1. Host opens the **quizmaster panel** on their laptop
2. Connect a projector/TV and open **projector view** in a second window (or drag to projector display)
3. Click **📱 QR** to show team QR codes — teams scan with their phones
4. Set up team names → select a round → click **▶ START QUESTION**
5. Teams buzz from their phones — first buzz locks in
6. Host marks correct/incorrect → points awarded automatically
7. If host laptop crashes: open quizmaster URL on any other device — state is preserved on the server

## Crash Recovery

Quiz state is persisted on the WebSocket relay server. If the host laptop crashes:

1. The relay server still has the full quiz state
2. Open the quizmaster URL on any laptop/phone
3. The server sends the latest state to the new client
4. Continue the quiz from where it left off — scores, current question, everything preserved

## Notes

- **Render free tier cold starts**: The server sleeps after 15 min of inactivity. First connection after sleep takes ~30s. Hit the health check URL a minute before your event starts.
- **Buzzer ordering**: The server stamps buzz events with `Date.now()` for authoritative ordering, so near-simultaneous buzzes are correctly sequenced.
- **BroadcastChannel fallback**: For same-device windows (e.g. quizmaster + projector on one laptop), BroadcastChannel syncs instantly without needing the server.

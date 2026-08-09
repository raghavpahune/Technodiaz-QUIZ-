import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { readFileSync, writeFileSync } from 'fs';

/**
 * Standalone WebSocket relay for quiz sync.
 * Extracted from vite-ws-plugin.js to run on Render.com (or anywhere).
 *
 * ponytail: same broadcast-everything pattern, plus:
 * - state persistence to /tmp for crash recovery
 * - client registration for connection tracking
 * - server timestamps on buzz events for authoritative ordering
 */

const PORT = process.env.PORT || 3001;
const STATE_FILE = process.env.STATE_FILE || '/tmp/quiz-state.json';

// ── Load persisted state (survives server restart) ──
let latestState = null;
try {
  latestState = readFileSync(STATE_FILE, 'utf-8');
  console.log('[server] Restored state from disk');
} catch {
  // No prior state — that's fine
}

// ── Client tracking ──
// Each WS client gets metadata: { ws, mode, teamIdx }
const clients = new Map();
let clientId = 0;

function broadcastConnectionStatus() {
  const status = { type: 'connection-status', teams: {} };
  for (const [, meta] of clients) {
    if (meta.mode === 'buzzer' && meta.teamIdx !== null) {
      status.teams[meta.teamIdx] = true;
    }
  }
  const msg = JSON.stringify(status);
  for (const [, meta] of clients) {
    if (meta.ws.readyState === 1) {
      meta.ws.send(msg);
    }
  }
}

// ── HTTP server (health check) ──
const httpServer = createServer((req, res) => {
  // CORS headers for health checks
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method === 'GET' && req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ok',
      clients: clients.size,
      hasState: !!latestState
    }));
  } else {
    res.writeHead(404);
    res.end();
  }
});

// ── WebSocket server ──
const wss = new WebSocketServer({ noServer: true });

httpServer.on('upgrade', (req, socket, head) => {
  // Accept connections on /quiz-ws (or root / for flexibility)
  const url = req.url?.split('?')[0];
  if (url === '/quiz-ws' || url === '/') {
    wss.handleUpgrade(req, socket, head, (ws) => {
      wss.emit('connection', ws, req);
    });
  } else {
    socket.destroy();
  }
});

wss.on('connection', (ws, req) => {
  const id = ++clientId;
  const meta = { ws, mode: 'unknown', teamIdx: null };
  clients.set(id, meta);

  // Send cached state to late joiners
  if (latestState) {
    ws.send(latestState);
  }

  ws.on('message', (data) => {
    const msg = data.toString();
    let parsed;
    try {
      parsed = JSON.parse(msg);
    } catch {
      return;
    }

    // Client registration — track mode and team index
    if (parsed.type === 'register') {
      meta.mode = parsed.mode || 'unknown';
      meta.teamIdx = parsed.teamIdx ?? null;
      broadcastConnectionStatus();
      return;
    }

    // Buzz events — stamp with server time for authoritative ordering
    if (parsed.type === 'buzz') {
      parsed.serverTimestamp = Date.now();
      const stamped = JSON.stringify(parsed);
      for (const [cid, cmeta] of clients) {
        if (cid !== id && cmeta.ws.readyState === 1) {
          cmeta.ws.send(stamped);
        }
      }
      return;
    }

    // State broadcasts — cache + persist
    if (parsed.type === 'quiz-state') {
      latestState = msg;
      // ponytail: async write, fire-and-forget — disk persistence is best-effort
      try { writeFileSync(STATE_FILE, msg); } catch {}
    }

    // Relay to all other clients
    for (const [cid, cmeta] of clients) {
      if (cid !== id && cmeta.ws.readyState === 1) {
        cmeta.ws.send(msg);
      }
    }
  });

  ws.on('close', () => {
    clients.delete(id);
    broadcastConnectionStatus();
  });
});

httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`[server] Quiz WebSocket relay running on port ${PORT}`);
  console.log(`[server] Health check: http://localhost:${PORT}/`);
  console.log(`[server] WebSocket:    ws://localhost:${PORT}/quiz-ws`);
});

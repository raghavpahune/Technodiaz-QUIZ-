/**
 * Cross-device sync module.
 * Uses WebSocket for real-time sync, BroadcastChannel as supplementary local relay.
 *
 * ponytail: single abstraction, two transports.
 * In dev: connects to Vite's WS relay at current host.
 * In production: connects to hosted server via VITE_WS_URL env var.
 */

let ws = null;
let bc = null;
let listeners = [];
let reconnectTimer = null;
let registered = false;

function notifyListeners(data) {
  for (const fn of listeners) fn(data);
}

// ponytail: detect mode + team from URL once
const urlParams = new URLSearchParams(window.location.search);
const CLIENT_MODE = urlParams.get('mode') || 'quizmaster';
const CLIENT_TEAM = CLIENT_MODE === 'buzzer' ? parseInt(urlParams.get('team') || '0', 10) : null;

function getWebSocketUrl() {
  // Env var set at build time for production (points to Render.com server)
  const envUrl = import.meta.env.VITE_WS_URL;
  if (envUrl) {
    // Ensure it ends with /quiz-ws
    return envUrl.replace(/\/$/, '') + '/quiz-ws';
  }
  // Dev: connect to Vite's WS relay on same host
  const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${proto}//${window.location.host}/quiz-ws`;
}

function registerClient() {
  if (ws && ws.readyState === 1 && !registered) {
    ws.send(JSON.stringify({
      type: 'register',
      mode: CLIENT_MODE,
      teamIdx: CLIENT_TEAM
    }));
    registered = true;
  }
}

function connectWebSocket() {
  const url = getWebSocketUrl();

  try {
    ws = new WebSocket(url);
    registered = false;

    ws.onopen = () => {
      clearTimeout(reconnectTimer);
      registerClient();
    };

    ws.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        notifyListeners(data);
      } catch {}
    };

    ws.onclose = () => {
      ws = null;
      registered = false;
      // Retry in 2s — covers page reloads and brief disconnects
      reconnectTimer = setTimeout(connectWebSocket, 2000);
    };

    ws.onerror = () => {
      ws?.close();
    };
  } catch {
    // WebSocket not available — fall through to BroadcastChannel
    ws = null;
  }
}

function initBroadcastChannel() {
  if (typeof BroadcastChannel === 'undefined') return;
  bc = new BroadcastChannel('quiz-sync');
  bc.onmessage = (e) => notifyListeners(e.data);
}

// Initialize both — WebSocket is primary, BroadcastChannel is fallback for same-device
connectWebSocket();
initBroadcastChannel();

/**
 * Send a message to all connected clients.
 */
export function syncSend(data) {
  const msg = JSON.stringify(data);

  if (ws && ws.readyState === 1) {
    ws.send(msg);
  }

  // Also broadcast locally for same-device windows (projector in same browser)
  if (bc) {
    bc.postMessage(data);
  }
}

/**
 * Listen for incoming messages.
 */
export function syncListen(callback) {
  listeners.push(callback);
  return () => {
    listeners = listeners.filter(fn => fn !== callback);
  };
}

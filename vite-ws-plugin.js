import { WebSocketServer } from 'ws';
import { networkInterfaces } from 'os';

/**
 * Vite plugin: WebSocket relay for cross-device quiz sync.
 * Upgrades connections at /quiz-ws and relays all messages to all other clients.
 * ponytail: zero-config relay — no rooms, no auth, just broadcast everything.
 *           Also detects LAN IP and sends it to clients so buzzer URLs work on phones.
 */

function detectLanIp() {
  const nets = networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      // Skip internal/loopback and IPv6
      if (!net.internal && net.family === 'IPv4') {
        return net.address;
      }
    }
  }
  return null;
}

export default function quizWsPlugin() {
  return {
    name: 'quiz-ws-relay',
    configureServer(server) {
      const wss = new WebSocketServer({ noServer: true });
      const clients = new Set();
      let latestState = null; // cache last state for late joiners
      const lanIp = detectLanIp();

      server.httpServer.on('upgrade', (req, socket, head) => {
        // Only handle our path — let Vite HMR handle its own
        if (req.url === '/quiz-ws') {
          wss.handleUpgrade(req, socket, head, (ws) => {
            wss.emit('connection', ws, req);
          });
        }
      });

      wss.on('connection', (ws) => {
        clients.add(ws);

        // Send LAN IP so clients can generate correct buzzer URLs
        if (lanIp) {
          const port = server.config?.server?.port || 5173;
          ws.send(JSON.stringify({
            type: 'server-info',
            lanIp,
            port
          }));
        }

        // Send cached state to late joiners
        if (latestState) {
          ws.send(latestState);
        }

        ws.on('message', (data) => {
          const msg = data.toString();

          // Cache state broadcasts for late joiners
          try {
            const parsed = JSON.parse(msg);
            if (parsed.type === 'quiz-state') {
              latestState = msg;
            }
          } catch {}

          // Relay to all other clients
          for (const client of clients) {
            if (client !== ws && client.readyState === 1) {
              client.send(msg);
            }
          }
        });

        ws.on('close', () => clients.delete(ws));
      });

      if (lanIp) {
        console.log(`\n  ➜  Quiz WebSocket relay: /quiz-ws`);
        console.log(`  ➜  LAN buzzer access:   http://${lanIp}:${server.config?.server?.port || 5173}/\n`);
      } else {
        console.log('\n  ➜  Quiz WebSocket relay: /quiz-ws\n');
      }
    }
  };
}

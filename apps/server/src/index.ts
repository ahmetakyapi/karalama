import { createServer } from 'http';
import { Server } from 'socket.io';
import type {
  ClientToServerEvents,
  ServerToClientEvents,
} from '@karalama/shared';
import { GameManager } from './game/GameManager';
import { registerHandlers } from './socket/handlers';

const PORT = parseInt(process.env.PORT || '3001', 10);
const CORS_ORIGINS = (process.env.CORS_ORIGIN || 'http://localhost:3000')
  .split(',')
  .map((s) => s.trim());

const httpServer = createServer((req, res) => {
  // CORS headers for health check
  const origin = req.headers.origin || '';
  if (CORS_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', players: manager?.totalPlayers ?? 0 }));
    return;
  }
  res.writeHead(404);
  res.end();
});

const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: {
    origin: CORS_ORIGINS,
    methods: ['GET', 'POST'],
  },
  transports: ['websocket', 'polling'],
});

const manager = new GameManager(io);
registerHandlers(io, manager);

httpServer.listen(PORT, () => {
  console.log(`Game server running on port ${PORT}`);
  console.log(`CORS origins: ${CORS_ORIGINS.join(', ')}`);
});

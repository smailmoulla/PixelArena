import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── JWT secret ─────────────────────────────────────────────────────────────────
const JWT_SECRET = process.env.JWT_SECRET || 'pixelarena-dev-secret-change-me-in-prod';

// ── Pure-JS JSON database ──────────────────────────────────────────────────────
const DB_FILE = join(__dirname, 'users.json');
function readDB() {
  if (!existsSync(DB_FILE)) writeFileSync(DB_FILE, JSON.stringify({ users: [] }, null, 2));
  return JSON.parse(readFileSync(DB_FILE, 'utf8'));
}
function writeDB(data) {
  writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// ── CORS ──────────────────────────────────────────────────────────────────────
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || null;

const corsOptions = {
  origin: (origin, cb) => {
    // In production, restrict to ALLOWED_ORIGIN env var.
    // In development (no env var set), allow everything.
    if (!ALLOWED_ORIGIN) return cb(null, true);
    if (!origin || origin === ALLOWED_ORIGIN) return cb(null, true);
    // Gracefully reject instead of throwing
    return cb(null, false);
  },
  credentials: true,
};

const app = express();
app.use(cors(corsOptions));
app.use(express.json());

// ── Global error guard (prevents unhandled CORS throws from crashing) ──────────
process.on('uncaughtException', (err) => {
  console.error('[Server] Uncaught exception (non-fatal):', err.message);
});
process.on('unhandledRejection', (reason) => {
  console.error('[Server] Unhandled rejection (non-fatal):', reason);
});


// ── Auth ───────────────────────────────────────────────────────────────────────
app.post('/api/register', (req, res) => {
  const { username, password } = req.body || {};
  if (!username?.trim() || !password?.trim())
    return res.status(400).json({ error: 'Username and password required' });
  if (username.trim().length < 3)
    return res.status(400).json({ error: 'Username must be at least 3 characters' });
  if (password.length < 6)
    return res.status(400).json({ error: 'Password must be at least 6 characters' });

  const db = readDB();
  if (db.users.find(u => u.username.toLowerCase() === username.trim().toLowerCase()))
    return res.status(400).json({ error: 'Username already taken' });

  const hashed = bcrypt.hashSync(password, 10);
  db.users.push({ username: username.trim(), password: hashed, created: new Date().toISOString() });
  writeDB(db);

  const token = jwt.sign({ username: username.trim() }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ success: true, username: username.trim(), token });
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body || {};
  if (!username?.trim() || !password)
    return res.status(400).json({ error: 'Username and password required' });

  const db = readDB();
  const user = db.users.find(u => u.username.toLowerCase() === username.trim().toLowerCase());
  if (!user || !bcrypt.compareSync(password, user.password))
    return res.status(401).json({ error: 'Invalid username or password' });

  const token = jwt.sign({ username: user.username }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ success: true, username: user.username, token });
});

// ── Serve built frontend ───────────────────────────────────────────────────────
const distPath = join(__dirname, 'dist');
if (existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*splat', (req, res) => {
    if (!req.path.startsWith('/api')) res.sendFile(join(distPath, 'index.html'));
  });
}

// ── Socket.io ─────────────────────────────────────────────────────────────────
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: ALLOWED_ORIGIN || '*',
    methods: ['GET', 'POST'],
    credentials: !!ALLOWED_ORIGIN,
  },
});

// ── State ──────────────────────────────────────────────────────────────────────
let chatHistory = [];
const MAX_MESSAGES = 50;

// username -> socketId mapping for online players
const onlinePlayers = new Map();   // socketId -> username

// matchmaking queues: gameId -> [socketId, ...]
const queues = new Map();

// active game rooms: roomId -> { gameId, players: [{id, username}], state }
const rooms = new Map();

let roomCounter = 0;

function broadcastOnlineCount() {
  io.emit('onlineCount', onlinePlayers.size);
}

function makeRoomId() {
  return `room_${++roomCounter}_${Date.now()}`;
}

// ── Chat clear interval ────────────────────────────────────────────────────────
setInterval(() => {
  chatHistory = [];
  io.emit('chatCleared');
  console.log('[Chat] History cleared.');
}, 10 * 60 * 1000);

// ── Socket events ──────────────────────────────────────────────────────────────
io.on('connection', (socket) => {
  console.log('[Socket] Connected:', socket.id);

  // Send initial data
  socket.emit('chatHistory', chatHistory);
  socket.emit('onlineCount', onlinePlayers.size);

  // ── Register online player ──────────────────────────────────────────────────
  socket.on('playerOnline', ({ username }) => {
    if (!username) return;
    onlinePlayers.set(socket.id, String(username).substring(0, 20));
    broadcastOnlineCount();
    console.log(`[Online] ${username} joined. Total: ${onlinePlayers.size}`);
  });

  // ── Chat ────────────────────────────────────────────────────────────────────
  socket.on('chatMessage', (data) => {
    if (!data?.author || !data?.text) return;
    const message = {
      id: Date.now(),
      author: String(data.author).substring(0, 15),
      text: String(data.text).substring(0, 100),
      timestamp: new Date().toISOString(),
    };
    chatHistory.push(message);
    if (chatHistory.length > MAX_MESSAGES) chatHistory.shift();
    io.emit('chatMessage', message);
  });

  // ── Matchmaking ─────────────────────────────────────────────────────────────
  socket.on('joinMatchmaking', ({ gameId, username }) => {
    if (!gameId || !username) return;

    // Remove from any existing queue first
    queues.forEach((q, gId) => {
      const idx = q.indexOf(socket.id);
      if (idx !== -1) q.splice(idx, 1);
    });

    if (!queues.has(gameId)) queues.set(gameId, []);
    const queue = queues.get(gameId);

    // Don't add duplicates
    if (queue.includes(socket.id)) return;
    queue.push(socket.id);

    console.log(`[MM] ${username} queued for ${gameId}. Queue size: ${queue.length}`);
    socket.emit('matchmakingStatus', { status: 'waiting', queueSize: queue.length });

    // If 2+ players, match them
    if (queue.length >= 2) {
      const [p1id, p2id] = queue.splice(0, 2);
      const p1socket = io.sockets.sockets.get(p1id);
      const p2socket = io.sockets.sockets.get(p2id);

      if (!p1socket || !p2socket) {
        // One disconnected, re-queue the other
        if (p1socket) queue.unshift(p1id);
        if (p2socket) queue.unshift(p2id);
        return;
      }

      const p1name = onlinePlayers.get(p1id) || 'Player 1';
      const p2name = onlinePlayers.get(p2id) || 'Player 2';

      const roomId = makeRoomId();
      const room = {
        gameId,
        players: [
          { id: p1id, username: p1name },
          { id: p2id, username: p2name },
        ],
        state: {},
      };
      rooms.set(roomId, room);

      p1socket.join(roomId);
      p2socket.join(roomId);

      // Notify both players: P1 is X/first, P2 is O/second
      p1socket.emit('matchFound', { roomId, gameId, you: p1name, opponent: p2name, role: 'first' });
      p2socket.emit('matchFound', { roomId, gameId, you: p2name, opponent: p1name, role: 'second' });

      console.log(`[MM] Match found! Room ${roomId}: ${p1name} vs ${p2name} (${gameId})`);
    }
  });

  // ── Leave matchmaking ───────────────────────────────────────────────────────
  socket.on('leaveMatchmaking', ({ gameId }) => {
    if (!gameId || !queues.has(gameId)) return;
    const q = queues.get(gameId);
    const idx = q.indexOf(socket.id);
    if (idx !== -1) q.splice(idx, 1);
    console.log(`[MM] ${socket.id} left queue for ${gameId}`);
  });

  // ── Game moves relay ────────────────────────────────────────────────────────
  socket.on('gameMove', ({ roomId, move }) => {
    if (!roomId || !rooms.has(roomId)) return;
    // Relay move to everyone else in the room
    socket.to(roomId).emit('opponentMove', { move, from: socket.id });
  });

  // ── Game state sync ─────────────────────────────────────────────────────────
  socket.on('gameSync', ({ roomId, state }) => {
    if (!roomId || !rooms.has(roomId)) return;
    socket.to(roomId).emit('gameSync', { state, from: socket.id });
  });

  // ── Game over ───────────────────────────────────────────────────────────────
  socket.on('gameOver', ({ roomId, result }) => {
    if (!roomId || !rooms.has(roomId)) return;
    socket.to(roomId).emit('gameOver', { result, from: socket.id });
    // Keep room a bit longer for cleanup
    setTimeout(() => rooms.delete(roomId), 5000);
  });

  // ── Leave room ──────────────────────────────────────────────────────────────
  socket.on('leaveRoom', ({ roomId }) => {
    if (!roomId) return;
    socket.leave(roomId);
    socket.to(roomId).emit('opponentLeft');
    rooms.delete(roomId);
  });

  // ── Disconnect ──────────────────────────────────────────────────────────────
  socket.on('disconnect', () => {
    console.log('[Socket] Disconnected:', socket.id);

    // Remove from online players
    onlinePlayers.delete(socket.id);
    broadcastOnlineCount();

    // Remove from all queues
    queues.forEach(q => {
      const idx = q.indexOf(socket.id);
      if (idx !== -1) q.splice(idx, 1);
    });

    // Notify room partner
    rooms.forEach((room, roomId) => {
      const isInRoom = room.players.some(p => p.id === socket.id);
      if (isInRoom) {
        io.to(roomId).emit('opponentLeft');
        rooms.delete(roomId);
      }
    });
  });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`🚀 PixelArena Server running on http://localhost:${PORT}`);
});

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

// ── JWT secret — set JWT_SECRET env var in production ─────────────────────────
const JWT_SECRET = process.env.JWT_SECRET || 'pixelarena-dev-secret-change-me-in-prod';

// ── Pure-JS JSON database (no native modules, works on all platforms) ─────────
const DB_FILE = join(__dirname, 'users.json');

function readDB() {
  if (!existsSync(DB_FILE)) {
    writeFileSync(DB_FILE, JSON.stringify({ users: [] }, null, 2));
  }
  return JSON.parse(readFileSync(DB_FILE, 'utf8'));
}

function writeDB(data) {
  // Atomic write: write full content in one call (Node buffers this)
  writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// ── CORS ──────────────────────────────────────────────────────────────────────
const allowedOrigins = process.env.ALLOWED_ORIGIN
  ? [process.env.ALLOWED_ORIGIN]
  : ['http://localhost:5173', 'http://localhost:3000'];

const app = express();
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use(express.json());

// ── Registration ──────────────────────────────────────────────────────────────
app.post('/api/register', (req, res) => {
  const { username, password } = req.body || {};
  if (!username?.trim() || !password?.trim()) {
    return res.status(400).json({ error: 'Username and password required' });
  }
  if (username.trim().length < 3) {
    return res.status(400).json({ error: 'Username must be at least 3 characters' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  const db = readDB();
  if (db.users.find(u => u.username.toLowerCase() === username.trim().toLowerCase())) {
    return res.status(400).json({ error: 'Username already taken' });
  }

  const hashed = bcrypt.hashSync(password, 10);
  db.users.push({
    username: username.trim(),
    password: hashed,
    created: new Date().toISOString(),
  });
  writeDB(db);

  const token = jwt.sign({ username: username.trim() }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ success: true, username: username.trim(), token });
});

// ── Login ─────────────────────────────────────────────────────────────────────
app.post('/api/login', (req, res) => {
  const { username, password } = req.body || {};
  if (!username?.trim() || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  const db = readDB();
  const user = db.users.find(u => u.username.toLowerCase() === username.trim().toLowerCase());
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  const token = jwt.sign({ username: user.username }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ success: true, username: user.username, token });
});

// ── Serve built frontend ──────────────────────────────────────────────────────
const distPath = join(__dirname, 'dist');
if (existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(join(distPath, 'index.html'));
    }
  });
}

// ── Socket.io — Global Chat ───────────────────────────────────────────────────
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: allowedOrigins, methods: ['GET', 'POST'] },
});

let chatHistory = [];
const MAX_MESSAGES = 50;

setInterval(() => {
  chatHistory = [];
  io.emit('chatCleared');
  console.log('[Chat] History cleared.');
}, 10 * 60 * 1000);

io.on('connection', (socket) => {
  console.log('[Socket] Player connected:', socket.id);
  socket.emit('chatHistory', chatHistory);

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

  socket.on('disconnect', () => {
    console.log('[Socket] Player disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`🚀 PixelArena Server running on http://localhost:${PORT}`);
});

# PixelArena 🕹️

Welcome to **PixelArena** — a premium, dynamic web-based arcade portal featuring 20 highly addictive mini-games. From classics like *Snake* and *Tetris* to puzzle games like *Wordle* and *Minesweeper*, this portal has it all.

PixelArena includes a **Real-Time Multiplayer Architecture** powered by Socket.io, featuring a global chat system, secure JWT-based authentication, and a lightweight SQLite database.

---

## 🚀 Features

- **20 Mini-Games**: Guess the Flag, Hangman, Snake, 2048, Tetris, Quiz Duel, and many more.
- **Progressive Difficulty**: Games are categorized into Easy 🌟, Medium 🔥, and Hard 💀.
- **Multiplayer Ready**: Secure Login/Registration with JWT tokens, SQLite database, and real-time Global Chat.
- **Sleek Glassmorphism Design**: High-end UI with smooth transitions, dark mode, and mobile responsiveness.
- **Lightweight DB**: Uses `better-sqlite3` — a fast, embedded SQLite database with no external software needed.

---

## 🛠️ Local Development Setup

### 1. Prerequisites
You need **Node.js v18+** installed. Download from [nodejs.org](https://nodejs.org/).

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Environment Variables (optional for dev)
Create a `.env` file in the root (or skip — defaults are fine for local dev):
```
JWT_SECRET=your-super-secret-key
```

### 4. Launch the App
You need two terminals:

**Terminal 1 — Frontend (Vite)**
```bash
npm run dev
```

**Terminal 2 — Backend (Express + Socket.io)**
```bash
node server.js
```

Open `http://localhost:5173` in your browser.

---

## 🌍 Hosting Guide — Moving from Netlify to a Full-Stack Host

Your first version was hosted on **Netlify** as a static frontend — that worked because there was no backend. Now that you have a Node.js server (auth, chat, sockets), **Netlify can no longer run your backend**. You need a platform that supports Node.js.

### Option 1 — Render.com (recommended, free tier available)

**Step 1 — Prepare your GitHub repo**

Make sure your repo has all the updated files. Your `.gitignore` should include:
```
node_modules/
dist/
users.db
.env
```

If your old Netlify repo is still on GitHub, you can either push to the same repo (the new server.js + Vite build replaces everything) or create a new repo.

**Step 2 — Create a Web Service on Render**
1. Go to [render.com](https://render.com) and log in.
2. Click **New +** → **Web Service**.
3. Connect your GitHub account and select your repo.

**Step 3 — Configure the build**

| Setting | Value |
|---|---|
| Runtime | `Node` |
| Build Command | `npm install && npm run build` |
| Start Command | `node server.js` |
| Node Version | `20` (set in Environment tab) |

**Step 4 — Set Environment Variables**

In the Render dashboard → your service → **Environment**:

| Key | Value |
|---|---|
| `JWT_SECRET` | A long random string (generate one at [randomkeygen.com](https://randomkeygen.com)) |
| `ALLOWED_ORIGIN` | Your Render URL e.g. `https://pixelarena.onrender.com` |
| `NODE_ENV` | `production` |

**Step 5 — Deploy**

Click **Create Web Service**. Render will install dependencies, run `npm run build` (creating the `dist/` folder), then start `node server.js` which serves both the frontend and the API from the same URL.

> ⚠️ **Free tier note**: Render free services spin down after 15 minutes of inactivity. The first load after inactivity takes ~30 seconds. Upgrade to a paid plan ($7/month) to avoid this.

---

### Option 2 — Railway.app (easiest, very fast deploys)

1. Go to [railway.app](https://railway.app) and log in with GitHub.
2. Click **New Project** → **Deploy from GitHub repo** → select your repo.
3. Railway auto-detects Node.js. Set these environment variables:
   - `JWT_SECRET` → your secret
   - `ALLOWED_ORIGIN` → your Railway URL (find it after first deploy)
4. In **Settings** → set **Start Command** to `node server.js` and **Build Command** to `npm run build`.
5. Click **Deploy**.

Railway gives you $5/month free credit — more than enough for a hobby project.

---

### Option 3 — Keep Netlify for the frontend + add a separate backend

If you want to keep your existing Netlify site, you can deploy **only the backend** to Render/Railway as a separate service and point your frontend to it.

In your frontend code, change the base URL logic:
```js
// In main.js and home.js, replace:
const baseUrl = window.location.hostname === 'localhost' ? 'http://localhost:3000' : '';

// With:
const baseUrl = window.location.hostname === 'localhost'
  ? 'http://localhost:3000'
  : 'https://your-backend-service.onrender.com'; // your backend URL
```

Then on Render, set `ALLOWED_ORIGIN` to your Netlify URL (e.g. `https://pixelarena.netlify.app`).

This is more complex but lets you keep your existing Netlify domain.

---

## 🔒 Security Notes

- **JWT tokens**: Auth now issues signed tokens that expire after 7 days. Store them in `localStorage` (already done).
- **SQLite**: Concurrent writes are safe — `better-sqlite3` uses WAL mode under the hood.
- **Passwords**: Hashed with `bcryptjs` at cost factor 10.
- **CORS**: Locked to `ALLOWED_ORIGIN` in production. Set this env var.

---

*Designed & Built by Smail MOULLA*
ss
import './style.css';
import { socket } from './socket.js';
import { initI18n, currentLang, setLanguage } from './i18n.js';
import { renderHome } from './pages/home.js';
import { renderFlag } from './games/flag.js';
import { renderHangman } from './games/hangman.js';
import { renderMemory } from './games/memory.js';
import { renderTrivia } from './games/trivia.js';
import { renderNumberGuess } from './games/numberguess.js';
import { renderColorGuess } from './games/colorguess.js';
import { renderSpeedTyping } from './games/speedtyping.js';
import { renderWordScramble } from './games/wordscramble.js';
import { renderRPS } from './games/rps.js';
import { renderMathChallenge } from './games/math.js';
import { renderSnake } from './games/snake.js';
import { render2048 } from './games/game2048.js';
import { renderWordle } from './games/wordle.js';
import { renderReactionTime } from './games/reactiontime.js';
import { renderMinesweeper } from './games/minesweeper.js';
import { renderTetris } from './games/tetris.js';
import { renderQuizDuel } from './games/quizduel.js';
import { renderWhackMole } from './games/whackmole.js';
import { renderSimon } from './games/simon.js';
import { renderTicTacToe } from './games/tictactoe.js';
import { renderMpTicTacToe } from './games/mp_tictactoe.js';
import { renderMpRPS } from './games/mp_rps.js';
import { renderMpTrivia } from './games/mp_trivia.js';
import { renderMpReactionTime } from './games/mp_reactiontime.js';

const routes = {
  '': renderHome,
  'flag': renderFlag,
  'hangman': renderHangman,
  'memory': renderMemory,
  'trivia': renderTrivia,
  'numberguess': renderNumberGuess,
  'colorguess': renderColorGuess,
  'speedtyping': renderSpeedTyping,
  'wordscramble': renderWordScramble,
  'rps': renderRPS,
  'math': renderMathChallenge,
  'snake': renderSnake,
  '2048': render2048,
  'wordle': renderWordle,
  'reactiontime': renderReactionTime,
  'minesweeper': renderMinesweeper,
  'tetris': renderTetris,
  'quizduel': renderQuizDuel,
  'whackmole': renderWhackMole,
  'simon': renderSimon,
  'tictactoe': renderTicTacToe,
};

// Multiplayer-capable game IDs
const MP_GAMES = {
  'tictactoe': renderMpTicTacToe,
  'rps': renderMpRPS,
  'trivia': renderMpTrivia,
  'reactiontime': renderMpReactionTime,
};

function getRoute() {
  return window.location.hash.replace('#/', '').replace('#', '');
}

// Online player count (reactive)
let _onlineCount = 0;

function renderHeader(route) {
  const isHome = route === '';
  const isDark = document.body.classList.contains('dark');
  const user = localStorage.getItem('pixelArenaUsername');

  const authBtn = user
    ? `<button type="button" class="btn btn-secondary" id="auth-logout-btn" style="padding: 6px 12px; font-size: 0.85rem; border: 1px solid #ef4444; color: #ef4444; background: transparent;" data-i18n-key="Disconnect">Disconnect</button>`
    : `<button type="button" class="btn btn-primary" id="auth-login-btn" style="padding: 6px 12px; font-size: 0.85rem;" data-i18n-key="Connect">Connect</button>`;

  return `
    <header class="header">
      <div class="header-inner">
        <div class="logo" onclick="window.location.hash=''" id="logo-link">
          <div class="logo-icon">🕹️</div>
          <span class="logo-text">PixelArena</span>
        </div>
        <div style="display:flex;align-items:center;gap:0.75rem;">
          ${!isHome ? `<a class="nav-home" href="#" id="nav-home-btn" data-i18n-key="← Back to Games">← Back to Games</a>` : ''}
          <div id="online-badge" style="display:flex;align-items:center;gap:0.4rem;background:rgba(34,197,94,0.12);border:1px solid rgba(34,197,94,0.3);border-radius:20px;padding:4px 10px;font-size:0.78rem;font-weight:600;color:#22c55e;">
            <span style="width:7px;height:7px;border-radius:50%;background:#22c55e;display:inline-block;animation:pulse-dot 1.4s ease-in-out infinite;"></span>
            <span id="online-count">${_onlineCount}</span> online
          </div>
          <select id="lang-selector" style="background:var(--card-bg); color:var(--text-dark); border:1px solid rgba(150,150,150,0.3); border-radius:6px; padding:4px 8px; font-size:0.85rem;">
            <option value="en" ${currentLang==='en'?'selected':''}>🇬🇧 EN</option>
            <option value="ar" ${currentLang==='ar'?'selected':''}>🇸🇦 AR</option>
            <option value="fr" ${currentLang==='fr'?'selected':''}>🇫🇷 FR</option>
            <option value="es" ${currentLang==='es'?'selected':''}>🇪🇸 ES</option>
          </select>
          ${authBtn}
          <button type="button" class="dark-toggle" id="dark-toggle-btn" title="Toggle dark mode">${isDark ? '☀️' : '🌙'}</button>
        </div>
      </div>
    </header>
  `;
}

// Store cleanup functions for games
let currentCleanup = null;

// Pending multiplayer session from matchmaking
let pendingMpSession = null;

function render() {
  if (currentCleanup) {
    currentCleanup();
    currentCleanup = null;
  }

  const route = getRoute();
  const app = document.getElementById('app');

  app.innerHTML = renderHeader(route);

  const content = document.createElement('div');
  content.id = 'page-content';
  content.className = 'fade-in';
  app.appendChild(content);

  // Check if this is a multiplayer game session
  if (pendingMpSession && MP_GAMES[route] === MP_GAMES[pendingMpSession.gameId]) {
    const session = pendingMpSession;
    pendingMpSession = null;
    const cleanup = MP_GAMES[session.gameId](content, session);
    if (typeof cleanup === 'function') currentCleanup = cleanup;
  } else {
    const renderPage = routes[route] || renderHome;
    const cleanup = renderPage(content);
    if (typeof cleanup === 'function') currentCleanup = cleanup;
  }

  // Header re-attach
  const darkBtn = document.getElementById('dark-toggle-btn');
  if (darkBtn) {
    darkBtn.addEventListener('click', () => {
      document.body.classList.toggle('dark');
      localStorage.setItem('darkMode', document.body.classList.contains('dark'));
      darkBtn.textContent = document.body.classList.contains('dark') ? '☀️' : '🌙';
    });
  }

  const logoutBtn = document.getElementById('auth-logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('pixelArenaUsername');
      socket.emit('playerOnline', { username: null });
      render();
      document.getElementById('chat-toggle').style.display = 'none';
      document.getElementById('chat-panel').classList.remove('active');
    });
  }

  const loginBtn = document.getElementById('auth-login-btn');
  const authModal = document.getElementById('global-auth-modal');
  if (loginBtn && authModal) {
    loginBtn.addEventListener('click', () => {
      authModal.style.display = 'flex';
      document.getElementById('global-auth-username').focus();
    });
  }

  const langSel = document.getElementById('lang-selector');
  if (langSel) {
    langSel.addEventListener('change', (e) => {
      setLanguage(e.target.value);
    });
  }
}

// Global Auth + Chat — wired once outside render()
window.addEventListener('DOMContentLoaded', () => {
  initI18n();

  if (localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add('dark');
  }

  // Add pulse animation for online dot
  const style = document.createElement('style');
  style.textContent = `
    @keyframes pulse-dot {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.5; transform: scale(0.7); }
    }
  `;
  document.head.appendChild(style);

  const authModal = document.getElementById('global-auth-modal');
  document.getElementById('close-global-auth').addEventListener('click', () => {
    authModal.style.display = 'none';
  });

  const handleGlobalAuth = async (action) => {
    const username = document.getElementById('global-auth-username').value.trim();
    const password = document.getElementById('global-auth-password').value;
    const errEl = document.getElementById('global-auth-error');

    if (!username || !password) {
      errEl.textContent = 'Please enter both username and password.';
      errEl.style.display = 'block';
      return;
    }

    const baseUrl = window.location.hostname === 'localhost' ? 'http://localhost:3000' : '';
    try {
      const res = await fetch(`${baseUrl}/api/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('pixelArenaUsername', username);
        authModal.style.display = 'none';
        document.getElementById('global-auth-username').value = '';
        document.getElementById('global-auth-password').value = '';
        document.getElementById('chat-toggle').style.display = 'flex';
        socket.emit('playerOnline', { username });
        render();
      } else {
        errEl.textContent = data.error || 'Authentication failed.';
        errEl.style.display = 'block';
      }
    } catch(e) {
      errEl.textContent = 'Server is offline. Unable to connect.';
      errEl.style.display = 'block';
    }
  };

  document.getElementById('global-btn-login').addEventListener('click', () => handleGlobalAuth('login'));
  document.getElementById('global-btn-register').addEventListener('click', () => handleGlobalAuth('register'));

  const globalOnEnter = (e) => { if (e.key === 'Enter') handleGlobalAuth('login'); };
  document.getElementById('global-auth-username').addEventListener('keydown', globalOnEnter);
  document.getElementById('global-auth-password').addEventListener('keydown', globalOnEnter);

  // ── Online count ────────────────────────────────────────────────────────────
  socket.on('onlineCount', (count) => {
    _onlineCount = count;
    const el = document.getElementById('online-count');
    if (el) el.textContent = count;
  });

  // ── Matchmaking result ──────────────────────────────────────────────────────
  socket.on('matchFound', (session) => {
    pendingMpSession = session;
    // Navigate to the game route — render() will pick up pendingMpSession
    if (window.location.hash === `#${session.gameId}`) {
      render(); // already on the route, just re-render with mp session
    } else {
      window.location.hash = session.gameId;
    }
  });

  // ── Chat ────────────────────────────────────────────────────────────────────
  const chatToggle = document.getElementById('chat-toggle');
  const chatPanel  = document.getElementById('chat-panel');
  const chatClose  = document.getElementById('chat-close');
  const chatInput  = document.getElementById('chat-input');
  const chatSend   = document.getElementById('chat-send');
  const chatMessages = document.getElementById('chat-messages');

  if (localStorage.getItem('pixelArenaUsername')) {
    chatToggle.style.display = 'flex';
    socket.emit('playerOnline', { username: localStorage.getItem('pixelArenaUsername') });
  }

  socket.on('chatHistory', (history) => {
    chatMessages.innerHTML = '';
    history.forEach(msg => appendMessage(msg.author, msg.text));
  });

  socket.on('chatMessage', (msg) => {
    appendMessage(msg.author, msg.text);
  });

  socket.on('chatCleared', () => {
    chatMessages.innerHTML = '<div class="chat-msg"><span class="author">System</span>Chat history was cleared to free up memory.</div>';
  });

  chatToggle.addEventListener('click', () => chatPanel.classList.add('active'));
  chatClose.addEventListener('click',  () => chatPanel.classList.remove('active'));

  const appendMessage = (author, text) => {
    const msg = document.createElement('div');
    msg.className = 'chat-msg';
    const authorSpan = document.createElement('span');
    authorSpan.className = 'author';
    authorSpan.textContent = author;
    msg.appendChild(authorSpan);
    msg.appendChild(document.createTextNode(text));
    chatMessages.appendChild(msg);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  };

  const handleSend = () => {
    const text = chatInput.value.trim();
    if (!text) return;
    const author = localStorage.getItem('pixelArenaUsername');
    if (!author) {
      alert("You must be logged in to chat! Click 'Connect' in the header.");
      return;
    }
    chatInput.value = '';
    socket.emit('chatMessage', { author, text });
  };

  chatSend.addEventListener('click', handleSend);
  chatInput.addEventListener('keypress', (e) => e.key === 'Enter' && handleSend());

  window.addEventListener('hashchange', render);
  window.addEventListener('languageChanged', render);
  render();
});

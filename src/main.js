import './style.css';
import { io } from 'socket.io-client';
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

function getRoute() {
  return window.location.hash.replace('#/', '').replace('#', '');
}

function renderHeader(route) {
  const isHome = route === '';
  const isDark = document.body.classList.contains('dark');
  const user = localStorage.getItem('pixelArenaUsername');

  const authBtn = user
    ? `<button type="button" class="btn btn-secondary" id="auth-logout-btn" style="padding: 6px 12px; font-size: 0.85rem; border: 1px solid #ef4444; color: #ef4444; background: transparent;">Disconnect</button>`
    : `<button type="button" class="btn btn-primary" id="auth-login-btn" style="padding: 6px 12px; font-size: 0.85rem;">Connect</button>`;

  return `
    <header class="header">
      <div class="header-inner">
        <div class="logo" onclick="window.location.hash=''" id="logo-link">
          <div class="logo-icon">🕹️</div>
          <span class="logo-text">PixelArena</span>
        </div>
        <div style="display:flex;align-items:center;gap:0.75rem;">
          ${!isHome ? `<a class="nav-home" href="#" id="nav-home-btn">← Back to Games</a>` : ''}
          ${authBtn}
          <button type="button" class="dark-toggle" id="dark-toggle-btn" title="Toggle dark mode">${isDark ? '☀️' : '🌙'}</button>
        </div>
      </div>
    </header>
  `;
}

// Store cleanup functions for games
let currentCleanup = null;

function render() {
  if (currentCleanup) {
    currentCleanup();
    currentCleanup = null;
  }

  const route = getRoute();
  const app = document.getElementById('app');
  const renderPage = routes[route] || renderHome;

  app.innerHTML = renderHeader(route);

  const content = document.createElement('div');
  content.id = 'page-content';
  content.className = 'fade-in';
  app.appendChild(content);

  const cleanup = renderPage(content);
  if (typeof cleanup === 'function') {
    currentCleanup = cleanup;
  }

  // Header Logic — re-attach on every render since innerHTML was replaced
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
      render();
      document.getElementById('chat-toggle').style.display = 'none';
      document.getElementById('chat-panel').classList.remove('active');
    });
  }

  // The login button lives in the header (rebuilt on every render), so it's safe to
  // attach a fresh listener each time — there's only ever one in the DOM.
  const loginBtn = document.getElementById('auth-login-btn');
  const authModal = document.getElementById('global-auth-modal');
  if (loginBtn && authModal) {
    loginBtn.addEventListener('click', () => {
      authModal.style.display = 'flex';
      document.getElementById('global-auth-username').focus();
    });
  }
}

// Global Auth + Chat — wired once outside render() to avoid duplicate listeners
window.addEventListener('DOMContentLoaded', () => {
  if (localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add('dark');
  }

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
        render(); // Refresh header to show username / Disconnect btn
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

  // Allow Enter key in global auth inputs
  const globalOnEnter = (e) => { if (e.key === 'Enter') handleGlobalAuth('login'); };
  document.getElementById('global-auth-username').addEventListener('keydown', globalOnEnter);
  document.getElementById('global-auth-password').addEventListener('keydown', globalOnEnter);

  // ── Chat Wiring ──────────────────────────────────────────────────────────────
  const chatToggle = document.getElementById('chat-toggle');
  const chatPanel  = document.getElementById('chat-panel');
  const chatClose  = document.getElementById('chat-close');
  const chatInput  = document.getElementById('chat-input');
  const chatSend   = document.getElementById('chat-send');
  const chatMessages = document.getElementById('chat-messages');

  if (localStorage.getItem('pixelArenaUsername')) {
    chatToggle.style.display = 'flex';
  }

  const socket = io(window.location.hostname === 'localhost' ? 'http://localhost:3000' : undefined);

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
  render();
});

import { socket } from '../socket.js';
import { QUESTIONS } from '../data/trivia.js';

const TOTAL = 8;
const TIME_PER_Q = 12;

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function renderMpTrivia(container, { roomId, you, opponent, role }) {
  const isHost = role === 'first';

  let questions = [];
  let current = 0;
  let myScore = 0, oppScore = 0;
  let myAnswered = false, oppAnswered = false;
  let transitioning = false; // prevents double-advance
  let timer = null;
  let timeLeft = TIME_PER_Q;
  let gameStarted = false;

  // ── Init ───────────────────────────────────────────────────────────────────
  function init() {
    showWaiting('Syncing game...');

    if (isHost) {
      const picked = shuffle(QUESTIONS).slice(0, TOTAL);
      const qIds = picked.map(q => QUESTIONS.indexOf(q));
      questions = qIds.map(id => QUESTIONS[id]);
      // Send to opponent, then wait a beat and start both
      socket.emit('gameSync', { roomId, state: { type: 'start', qIds } });
      setTimeout(() => {
        if (!gameStarted) beginGame();
      }, 600);
    }
    // Non-host starts via onGameSync
  }

  function beginGame() {
    gameStarted = true;
    current = 0; myScore = 0; oppScore = 0;
    nextQuestion();
  }

  // ── Question cycle ─────────────────────────────────────────────────────────
  function nextQuestion() {
    if (current >= TOTAL) return showResult();

    myAnswered = false;
    oppAnswered = false;
    transitioning = false;
    timeLeft = TIME_PER_Q;
    clearInterval(timer);

    renderQuestion();
    startTimer();
  }

  function startTimer() {
    timer = setInterval(() => {
      timeLeft--;
      // Update only the timer element to avoid full re-render
      const el = document.getElementById('mp-t-timer');
      if (el) {
        el.textContent = `${timeLeft}s`;
        el.style.color = timeLeft <= 4 ? '#ef4444' : 'inherit';
      }
      if (timeLeft <= 0) {
        clearInterval(timer);
        if (!myAnswered) submitAnswer(-1); // time out
      }
    }, 1000);
  }

  // ── Answer handling ────────────────────────────────────────────────────────
  function submitAnswer(idx) {
    if (myAnswered || transitioning) return;
    myAnswered = true;
    clearInterval(timer);

    const q = questions[current];
    const correct = idx >= 0 && idx === q.answer;
    if (correct) myScore++;

    // Highlight buttons
    document.querySelectorAll('.mp-t-btn').forEach((btn, i) => {
      btn.style.pointerEvents = 'none';
      if (i === q.answer) btn.classList.add('correct');
      else if (i === idx) btn.classList.add('wrong');
    });

    // Update my score display
    const myScoreEl = document.getElementById('mp-t-myscore');
    if (myScoreEl) myScoreEl.textContent = myScore;

    // Show waiting status
    const waitEl = document.getElementById('mp-t-wait');
    if (waitEl) {
      waitEl.textContent = oppAnswered
        ? (correct ? '✅ Correct!' : '❌ Wrong!')
        : `${correct ? '✅ Correct! ' : '❌ Wrong! '}⏳ Waiting for ${opponent}...`;
    }

    // Send move
    socket.emit('gameMove', { roomId, move: { type: 'answer', idx, correct } });

    // Advance only if opponent already answered
    if (oppAnswered && !transitioning) {
      transitioning = true;
      setTimeout(advance, 2000);
    }
  }

  function advance() {
    current++;
    nextQuestion();
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  function renderQuestion() {
    const q = questions[current];
    if (!q) return showResult();

    container.innerHTML = `
      <div class="game-page">
        <div class="game-header">
          <h1>📝 Trivia Duel</h1>
          <p style="color:#667eea;font-weight:600;">🌐 vs <strong>${opponent}</strong></p>
        </div>
        <div class="game-container">
          <div class="score-bar">
            <div class="score-item">
              <span class="score-label">You</span>
              <span class="score-value" id="mp-t-myscore" style="color:#667eea;">${myScore}</span>
            </div>
            <div class="score-item">
              <span class="score-label">Q ${current + 1}/${TOTAL}</span>
              <span class="score-value" id="mp-t-timer" style="font-variant-numeric:tabular-nums;">${timeLeft}s</span>
            </div>
            <div class="score-item">
              <span class="score-label">${opponent}</span>
              <span class="score-value" id="mp-t-oppscore" style="color:#f093fb;">${oppScore}</span>
            </div>
          </div>

          <div class="trivia-progress">
            <div class="trivia-progress-fill" style="width:${(current / TOTAL) * 100}%"></div>
          </div>

          <div class="trivia-question">${q.q}</div>

          <div class="trivia-options">
            ${q.options.map((o, i) => `
              <button class="btn-option mp-t-btn" data-idx="${i}">${o}</button>
            `).join('')}
          </div>

          <div id="mp-t-wait" style="text-align:center;min-height:1.6rem;margin-top:1rem;font-weight:600;color:var(--text-mid);"></div>
        </div>
      </div>`;

    document.querySelector('.trivia-options').addEventListener('click', (e) => {
      if (!e.target.matches('.mp-t-btn') || myAnswered || transitioning) return;
      submitAnswer(parseInt(e.target.dataset.idx));
    });
  }

  function showWaiting(msg) {
    container.innerHTML = `
      <div class="game-page" style="display:flex;align-items:center;justify-content:center;min-height:60vh;">
        <div style="text-align:center;">
          <div style="font-size:3rem;margin-bottom:1rem;">⏳</div>
          <p style="font-weight:600;font-size:1.1rem;">${msg}</p>
        </div>
      </div>`;
  }

  function showResult() {
    clearInterval(timer);
    let emoji, title;
    if (myScore > oppScore) { emoji = '🏆'; title = 'You Win!'; }
    else if (myScore < oppScore) { emoji = '😞'; title = `${opponent} Wins!`; }
    else { emoji = '🤝'; title = "It's a Draw!"; }

    container.innerHTML = `
      <div class="game-over-overlay">
        <div class="game-over-card">
          <div class="emoji">${emoji}</div>
          <h2>${title}</h2>
          <div style="display:flex;gap:4rem;justify-content:center;margin:1.5rem 0;">
            <div style="text-align:center;">
              <div style="font-size:2.5rem;font-weight:800;color:#667eea;">${myScore}</div>
              <div style="font-size:0.85rem;color:var(--text-mid);">You</div>
            </div>
            <div style="text-align:center;">
              <div style="font-size:2.5rem;font-weight:800;color:#f093fb;">${oppScore}</div>
              <div style="font-size:0.85rem;color:var(--text-mid);">${opponent}</div>
            </div>
          </div>
          <p>${TOTAL} questions total</p>
          <div class="game-actions">
            <button class="btn btn-primary" id="mp-t-again">Play Again</button>
            <button class="btn btn-secondary" id="mp-t-quit">Leave</button>
          </div>
        </div>
      </div>`;

    document.getElementById('mp-t-again')?.addEventListener('click', () => {
      gameStarted = false;
      init();
    });
    document.getElementById('mp-t-quit')?.addEventListener('click', () => {
      cleanup();
      socket.emit('leaveRoom', { roomId });
      window.location.hash = '';
    });
  }

  // ── Socket listeners ───────────────────────────────────────────────────────
  function onGameSync({ state }) {
    if (state.type === 'start' && !isHost) {
      questions = state.qIds.map(id => QUESTIONS[id]).filter(Boolean);
      if (!gameStarted) beginGame();
    }
  }

  function onOpponentMove({ move }) {
    if (move.type !== 'answer') return;
    if (oppAnswered) return; // guard against duplicates
    oppAnswered = true;

    if (move.correct) oppScore++;
    const oppScoreEl = document.getElementById('mp-t-oppscore');
    if (oppScoreEl) oppScoreEl.textContent = oppScore;

    const waitEl = document.getElementById('mp-t-wait');

    if (myAnswered) {
      // Both have answered — advance
      if (!transitioning) {
        transitioning = true;
        if (waitEl) waitEl.textContent = `✅ Both answered!`;
        setTimeout(advance, 2000);
      }
    } else {
      if (waitEl) waitEl.textContent = `✅ ${opponent} answered! Your turn...`;
    }
  }

  function onOpponentLeft() {
    clearInterval(timer);
    container.innerHTML = `
      <div class="game-over-overlay">
        <div class="game-over-card">
          <div class="emoji">🚪</div>
          <h2>${opponent} left the game</h2>
          <div class="game-actions"><a href="#" class="btn btn-primary">Back to Games</a></div>
        </div>
      </div>`;
  }

  function cleanup() {
    clearInterval(timer);
    socket.off('gameSync', onGameSync);
    socket.off('opponentMove', onOpponentMove);
    socket.off('opponentLeft', onOpponentLeft);
  }

  socket.on('gameSync', onGameSync);
  socket.on('opponentMove', onOpponentMove);
  socket.on('opponentLeft', onOpponentLeft);

  init();
  return cleanup;
}

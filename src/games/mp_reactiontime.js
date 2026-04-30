import { socket } from '../socket.js';

const TOTAL_ROUNDS = 5;

export function renderMpReactionTime(container, { roomId, you, opponent, role }) {
  const isHost = role === 'first';

  let round = 0;
  let myWins = 0, oppWins = 0;
  let phase = 'waiting'; // waiting | ready | green | clicked | toosoon | result | done
  let myTime = null, oppTime = null;
  let greenTimeout = null;
  let startTime = null;
  let roundDelay = 0;

  // ── Start a round ──────────────────────────────────────────────────────────
  function startRound() {
    round++;
    myTime = null;
    oppTime = null;
    phase = 'ready';

    if (isHost) {
      // Host picks the delay and syncs it to both
      roundDelay = Math.floor(1500 + Math.random() * 3500);
      socket.emit('gameSync', { roomId, state: { type: 'roundStart', round, delay: roundDelay } });
    }
    // Both (host and non-host) arm their green light via beginRound()
    beginRound(roundDelay);
  }

  function beginRound(delay) {
    clearTimeout(greenTimeout);
    phase = 'ready';
    render();
    greenTimeout = setTimeout(() => {
      phase = 'green';
      startTime = performance.now();
      render();
    }, delay);
  }

  // ── Handle user click ──────────────────────────────────────────────────────
  function handleClick() {
    if (phase === 'waiting') return;

    if (phase === 'ready') {
      // Clicked too early
      clearTimeout(greenTimeout);
      myTime = 9999; // penalty
      phase = 'toosoon';
      socket.emit('gameMove', { roomId, move: { type: 'time', time: 9999 } });
      render();
      checkBothAnswered();
      return;
    }

    if (phase === 'green') {
      myTime = Math.round(performance.now() - startTime);
      phase = 'clicked';
      socket.emit('gameMove', { roomId, move: { type: 'time', time: myTime } });
      render();
      checkBothAnswered();
      return;
    }
  }

  function checkBothAnswered() {
    if (myTime !== null && oppTime !== null) {
      showRoundResult();
    }
  }

  // ── Show round result ──────────────────────────────────────────────────────
  function showRoundResult() {
    clearTimeout(greenTimeout);
    phase = 'result';

    const iWon = myTime < oppTime;
    const isDraw = myTime === oppTime;
    if (iWon) myWins++;
    else if (!isDraw) oppWins++;

    render();

    if (round >= TOTAL_ROUNDS) {
      setTimeout(showFinalResult, 2500);
    } else if (isHost) {
      setTimeout(startRound, 2500);
    }
    // Non-host advances via gameSync 'roundStart' event
  }

  function showFinalResult() {
    phase = 'done';
    render();
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  function bgColor() {
    if (phase === 'green') return '#22c55e';
    if (phase === 'toosoon') return '#ef4444';
    if (phase === 'ready') return '#1e1b4b';
    return 'var(--card-bg, #1e1b4b)';
  }

  function render() {
    const showBox = ['waiting', 'ready', 'green', 'clicked', 'toosoon', 'result'].includes(phase);

    container.innerHTML = `
      <div class="game-page">
        <div class="game-header">
          <h1>⚡ Reaction Duel</h1>
          <p style="color:#667eea;font-weight:600;">🌐 vs <strong>${opponent}</strong></p>
        </div>
        <div class="game-container">
          <div class="score-bar">
            <div class="score-item">
              <span class="score-label">You</span>
              <span class="score-value" style="color:#667eea;">${myWins}</span>
            </div>
            <div class="score-item">
              <span class="score-label">Round</span>
              <span class="score-value">${round}/${TOTAL_ROUNDS}</span>
            </div>
            <div class="score-item">
              <span class="score-label">${opponent}</span>
              <span class="score-value" style="color:#f093fb;">${oppWins}</span>
            </div>
          </div>

          ${phase === 'waiting' ? `
            <div style="text-align:center; margin-top:3rem;">
              <div style="font-size:3rem;">⏳</div>
              <p style="margin-top:1rem;font-weight:600;">Waiting for opponent...</p>
            </div>
          ` : phase === 'done' ? renderFinal() : `
            <div id="mp-rt-box" style="
              background:${bgColor()};
              border-radius:20px;
              min-height:260px;
              display:flex;flex-direction:column;align-items:center;justify-content:center;
              cursor:pointer;user-select:none;
              padding:2rem;margin: 1.5rem auto 0;max-width:480px;
              box-shadow:0 8px 30px rgba(0,0,0,0.2);
              transition: background 0.15s;
            ">
              ${renderPhaseContent()}
            </div>
            ${phase === 'result' ? renderRoundResult() : ''}
          `}

          <div style="margin-top:1.5rem;text-align:center;">
            <button class="btn btn-secondary" id="mp-rt-quit" style="padding:8px 18px;font-size:0.85rem;">Leave Game</button>
          </div>
        </div>
      </div>`;

    document.getElementById('mp-rt-box')?.addEventListener('click', handleClick);
    document.getElementById('mp-rt-quit')?.addEventListener('click', () => {
      cleanup();
      socket.emit('leaveRoom', { roomId });
      window.location.hash = '';
    });
  }

  function renderPhaseContent() {
    if (phase === 'ready') return `
      <div style="font-size:3.5rem;">⏳</div>
      <div style="font-size:1.4rem;font-weight:700;color:#fff;margin-top:1rem;">Wait for green...</div>
      <div style="color:rgba(255,255,255,0.7);margin-top:0.5rem;">Don't click yet!</div>`;

    if (phase === 'green') return `
      <div style="font-size:5rem;">🟢</div>
      <div style="font-size:2.2rem;font-weight:800;color:#fff;margin-top:0.5rem;">CLICK NOW!</div>`;

    if (phase === 'clicked') return `
      <div style="font-size:2.5rem;font-weight:900;color:#22c55e;">${myTime}ms</div>
      <div style="font-size:1.1rem;font-weight:600;color:var(--text-mid);margin-top:0.5rem;">⏳ Waiting for ${opponent}...</div>`;

    if (phase === 'toosoon') return `
      <div style="font-size:3.5rem;">😬</div>
      <div style="font-size:1.5rem;font-weight:700;color:#fff;margin-top:1rem;">Too soon!</div>
      <div style="color:rgba(255,255,255,0.8);margin-top:0.5rem;">Penalty round!</div>`;

    if (phase === 'result') {
      const iWon = myTime < oppTime;
      const isDraw = myTime === oppTime;
      return `
        <div style="font-size:2rem;font-weight:800;color:#fff;">
          ${isDraw ? "🤝 Draw!" : iWon ? "🎉 You're faster!" : `😞 ${opponent} was faster`}
        </div>`;
    }
    return '';
  }

  function renderRoundResult() {
    const iWon = myTime < oppTime;
    const isDraw = myTime === oppTime;
    return `
      <div style="display:flex;justify-content:center;gap:4rem;margin-top:1.2rem;text-align:center;">
        <div>
          <div style="font-size:1.8rem;font-weight:800;color:${iWon ? '#22c55e' : '#ef4444'};">
            ${myTime >= 9999 ? '❌ Too soon' : `${myTime}ms`}
          </div>
          <div style="font-size:0.8rem;color:var(--text-mid);margin-top:0.3rem;">You</div>
        </div>
        <div>
          <div style="font-size:1.8rem;font-weight:800;color:${!iWon && !isDraw ? '#22c55e' : '#ef4444'};">
            ${oppTime >= 9999 ? '❌ Too soon' : `${oppTime}ms`}
          </div>
          <div style="font-size:0.8rem;color:var(--text-mid);margin-top:0.3rem;">${opponent}</div>
        </div>
      </div>`;
  }

  function renderFinal() {
    let emoji, title;
    if (myWins > oppWins) { emoji = '🏆'; title = 'You Win!'; }
    else if (myWins < oppWins) { emoji = '😞'; title = `${opponent} Wins!`; }
    else { emoji = '🤝'; title = "It's a Draw!"; }

    return `
      <div style="text-align:center;padding:2rem 0;">
        <div style="font-size:4rem;">${emoji}</div>
        <h2 style="font-size:2rem;font-weight:800;margin:1rem 0;">${title}</h2>
        <div style="display:flex;gap:4rem;justify-content:center;margin:1.5rem 0;">
          <div><div style="font-size:2.5rem;font-weight:800;color:#667eea;">${myWins}</div><div style="font-size:0.85rem;color:var(--text-mid);">You</div></div>
          <div><div style="font-size:2.5rem;font-weight:800;color:#f093fb;">${oppWins}</div><div style="font-size:0.85rem;color:var(--text-mid);">${opponent}</div></div>
        </div>
        <p style="color:var(--text-mid);">${TOTAL_ROUNDS} rounds played</p>
        <div style="display:flex;gap:1rem;justify-content:center;margin-top:1.5rem;">
          <button class="btn btn-primary" id="mp-rt-again">Play Again</button>
        </div>
      </div>`;
  }

  // ── Socket listeners ───────────────────────────────────────────────────────
  function onGameSync({ state }) {
    if (state.type === 'roundStart' && !isHost) {
      roundDelay = state.delay;
      round = state.round;
      myTime = null; oppTime = null;
      beginRound(state.delay);
    }
  }

  function onOpponentMove({ move }) {
    if (move.type !== 'time') return;
    oppTime = move.time;
    checkBothAnswered();
  }

  function onOpponentLeft() {
    clearTimeout(greenTimeout);
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
    clearTimeout(greenTimeout);
    socket.off('gameSync', onGameSync);
    socket.off('opponentMove', onOpponentMove);
    socket.off('opponentLeft', onOpponentLeft);
  }

  socket.on('gameSync', onGameSync);
  socket.on('opponentMove', onOpponentMove);
  socket.on('opponentLeft', onOpponentLeft);

  // ── Start ──────────────────────────────────────────────────────────────────
  if (isHost) {
    // Brief delay so both sides have registered listeners
    setTimeout(startRound, 800);
  } else {
    phase = 'waiting';
    render();
  }

  // Play Again button wiring (after final result)
  container.addEventListener('click', (e) => {
    if (e.target.id === 'mp-rt-again') {
      round = 0; myWins = 0; oppWins = 0;
      if (isHost) startRound();
      else { phase = 'waiting'; render(); }
    }
  });

  return cleanup;
}

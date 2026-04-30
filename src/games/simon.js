export function renderSimon(container) {
  const COLORS = ['red', 'blue', 'green', 'yellow'];
  const COLOR_LABELS = { red: '🔴', blue: '🔵', green: '🟢', yellow: '🟡' };
  const FLASH_COLORS = { red: '#ff4444', blue: '#4488ff', green: '#44cc44', yellow: '#ffdd00' };
  const BASE_COLORS = { red: '#cc2222', blue: '#2255cc', green: '#22aa22', yellow: '#ccaa00' };

  let sequence = [], playerSeq = [], level = 0, isShowing = false, gameOver = false, started = false;
  let speed = 700;

  function init() {
    sequence = []; playerSeq = []; level = 0; gameOver = false; started = true;
    speed = 700;
    render();
    setTimeout(nextRound, 600);
  }

  function nextRound() {
    level++;
    playerSeq = [];
    sequence.push(COLORS[Math.floor(Math.random() * 4)]);
    if (level > 5) speed = 550;
    if (level > 10) speed = 400;
    if (level > 15) speed = 280;
    render();
    showSequence();
  }

  function showSequence() {
    isShowing = true;
    updateStatus('Watch the sequence...');
    let i = 0;
    function flashNext() {
      if (i >= sequence.length) {
        isShowing = false;
        updateStatus('Your turn! Repeat the sequence.');
        enableButtons(true);
        return;
      }
      const color = sequence[i];
      flashButton(color, () => {
        i++;
        setTimeout(flashNext, speed * 0.3);
      });
    }
    setTimeout(flashNext, 400);
  }

  function flashButton(color, cb) {
    const btn = document.getElementById(`simon-${color}`);
    if (!btn) { cb(); return; }
    btn.style.background = FLASH_COLORS[color];
    btn.style.boxShadow = `0 0 30px ${FLASH_COLORS[color]}`;
    setTimeout(() => {
      btn.style.background = BASE_COLORS[color];
      btn.style.boxShadow = 'none';
      setTimeout(cb, speed * 0.15);
    }, speed * 0.55);
  }

  function enableButtons(on) {
    COLORS.forEach(c => {
      const btn = document.getElementById(`simon-${c}`);
      if (btn) btn.style.pointerEvents = on ? 'auto' : 'none';
    });
  }

  function updateStatus(msg) {
    const el = document.getElementById('simon-status');
    if (el) el.textContent = msg;
  }

  function playerPress(color) {
    if (isShowing || gameOver) return;
    playerSeq.push(color);
    flashButton(color, () => {});

    const idx = playerSeq.length - 1;
    if (playerSeq[idx] !== sequence[idx]) {
      // Wrong!
      enableButtons(false);
      updateStatus('❌ Wrong! Game over!');
      setTimeout(showGameOver, 900);
      return;
    }

    if (playerSeq.length === sequence.length) {
      enableButtons(false);
      updateStatus('✅ Correct! Get ready...');
      setTimeout(nextRound, 1000);
    }
  }

  function showGameOver() {
    container.innerHTML = `
      <div class="game-page">
        <div class="game-header"><h1>🟢 Simon Says</h1></div>
        <div class="game-container" style="text-align:center;">
          <div style="font-size:3rem;margin-bottom:0.5rem;">😵</div>
          <div class="final-score">${level - 1}</div>
          <p style="font-weight:600;font-size:1.1rem;margin:0.5rem 0;">
            ${level <= 3 ? 'Keep practicing!' : level <= 8 ? 'Nice memory!' : level <= 15 ? '🔥 Impressive!' : '🧠 Memory Master!'}
          </p>
          <p style="opacity:0.65;margin-bottom:1.5rem;">You reached level ${level - 1}</p>
          <div class="game-actions">
            <button class="btn btn-primary" id="simon-retry">Play Again</button>
            <a href="#" class="btn btn-secondary">All Games</a>
          </div>
        </div>
      </div>`;
    document.getElementById('simon-retry')?.addEventListener('click', () => { started = false; render(); });
  }

  function render() {
    container.innerHTML = `
      <div class="game-page">
        <div class="game-header">
          <h1>🟢 Simon Says</h1>
          <p>${started ? `Level ${level}` : 'Watch, remember, repeat!'}</p>
        </div>
        <div class="game-container" style="text-align:center;">
          ${started ? `<div class="score-bar"><div class="score-item"><span class="score-label">Level</span><span class="score-value">${level}</span></div><div class="score-item"><span class="score-label">Sequence</span><span class="score-value">${sequence.length}</span></div></div>` : ''}
          <div id="simon-status" style="min-height:1.5rem;margin:1rem 0;font-weight:600;opacity:0.8;font-size:1rem;">
            ${started ? 'Get ready...' : 'Press Start to play!'}
          </div>
          <div class="simon-grid">
            ${COLORS.map(c => `
              <button id="simon-${c}" class="simon-btn simon-${c}" style="background:${BASE_COLORS[c]};pointer-events:${started ? 'auto' : 'none'};">
                ${COLOR_LABELS[c]}
              </button>
            `).join('')}
          </div>
          ${!started ? `<button class="btn btn-primary" id="simon-start" style="margin-top:1.5rem;font-size:1.1rem;padding:0.9rem 2.5rem;">▶ Start Game</button>` : ''}
        </div>
      </div>`;

    document.getElementById('simon-start')?.addEventListener('click', init);
    COLORS.forEach(c => {
      document.getElementById(`simon-${c}`)?.addEventListener('click', () => playerPress(c));
    });
  }

  render();
}

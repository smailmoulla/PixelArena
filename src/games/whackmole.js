export function renderWhackMole(container) {
  const GRID = 9;
  const GAME_DURATION = 30;

  let score = 0, misses = 0, timeLeft = GAME_DURATION;
  let activeMole = null, moleTimer = null, countdownTimer = null;
  let gameRunning = false, gameStarted = false;

  function getSpeed() {
    const elapsed = GAME_DURATION - timeLeft;
    return Math.max(500, 1400 - elapsed * 20);
  }

  function showMole() {
    clearTimeout(moleTimer);
    if (!gameRunning) return;

    // Hide current mole
    if (activeMole !== null) {
      const prev = document.getElementById(`mole-${activeMole}`);
      if (prev) prev.classList.remove('active');
    }

    // Pick new random hole
    const next = Math.floor(Math.random() * GRID);
    activeMole = next;
    const hole = document.getElementById(`mole-${next}`);
    if (hole) hole.classList.add('active');

    // Auto-miss if not whacked
    moleTimer = setTimeout(() => {
      const h = document.getElementById(`mole-${activeMole}`);
      if (h && h.classList.contains('active')) {
        h.classList.remove('active');
        misses++;
        updateScoreboard();
      }
      showMole();
    }, getSpeed());
  }

  function whack(idx) {
    if (!gameRunning) return;
    if (idx !== activeMole) return;
    const hole = document.getElementById(`mole-${idx}`);
    if (!hole || !hole.classList.contains('active')) return;

    hole.classList.remove('active');
    hole.classList.add('whacked');
    score++;
    updateScoreboard();
    setTimeout(() => hole.classList.remove('whacked'), 300);
    clearTimeout(moleTimer);
    showMole();
  }

  function updateScoreboard() {
    const sc = document.getElementById('wm-score');
    const ms = document.getElementById('wm-misses');
    const tm = document.getElementById('wm-time');
    if (sc) sc.textContent = score;
    if (ms) ms.textContent = misses;
    if (tm) tm.textContent = timeLeft;
  }

  function startGame() {
    score = 0; misses = 0; timeLeft = GAME_DURATION;
    gameRunning = true; gameStarted = true;
    const startBtn = document.getElementById('wm-start');
    if (startBtn) startBtn.style.display = 'none';
    updateScoreboard();
    showMole();
    countdownTimer = setInterval(() => {
      timeLeft--;
      updateScoreboard();
      if (timeLeft <= 0) endGame();
    }, 1000);
  }

  function endGame() {
    gameRunning = false;
    clearTimeout(moleTimer);
    clearInterval(countdownTimer);
    if (activeMole !== null) {
      const h = document.getElementById(`mole-${activeMole}`);
      if (h) h.classList.remove('active');
    }
    const rating = score >= 25 ? '🏆 Legendary!' : score >= 15 ? '⭐ Great job!' : score >= 8 ? '👍 Not bad!' : '😅 Keep practicing!';
    container.innerHTML = `
      <div class="game-page">
        <div class="game-header"><h1>🔨 Whack-a-Mole</h1></div>
        <div class="game-container" style="text-align:center;">
          <div style="font-size:3.5rem;margin-bottom:0.5rem;">🐭</div>
          <div class="final-score">${score}</div>
          <p style="font-weight:600;font-size:1.1rem;margin:0.5rem 0;">${rating}</p>
          <p style="opacity:0.65;margin-bottom:1.5rem;">Missed ${misses} moles</p>
          <div class="game-actions">
            <button class="btn btn-primary" id="wm-retry">Play Again</button>
            <a href="#" class="btn btn-secondary">All Games</a>
          </div>
        </div>
      </div>`;
    document.getElementById('wm-retry')?.addEventListener('click', () => { render(); });
  }

  function render() {
    gameRunning = false; gameStarted = false; score = 0; misses = 0; timeLeft = GAME_DURATION;
    clearTimeout(moleTimer); clearInterval(countdownTimer);

    container.innerHTML = `
      <div class="game-page">
        <div class="game-header">
          <h1>🔨 Whack-a-Mole</h1>
          <p>Smash as many moles as you can in ${GAME_DURATION} seconds!</p>
        </div>
        <div class="game-container">
          <div class="score-bar">
            <div class="score-item"><span class="score-label">Score</span><span class="score-value" id="wm-score">0</span></div>
            <div class="score-item"><span class="score-label">Time</span><span class="score-value" id="wm-time">${GAME_DURATION}</span></div>
            <div class="score-item"><span class="score-label">Misses</span><span class="score-value" id="wm-misses">0</span></div>
          </div>
          <div class="wm-grid">
            ${Array.from({length: GRID}, (_, i) => `
              <div class="wm-hole" id="mole-${i}" data-idx="${i}">
                <div class="wm-mole">🐭</div>
                <div class="wm-dirt"></div>
              </div>
            `).join('')}
          </div>
          <div style="text-align:center;margin-top:1.5rem;">
            <button class="btn btn-primary" id="wm-start" style="font-size:1.1rem;padding:0.9rem 2.5rem;">🔨 Start Game</button>
          </div>
        </div>
      </div>`;

    document.getElementById('wm-start')?.addEventListener('click', startGame);
    container.querySelectorAll('.wm-hole').forEach(hole => {
      hole.addEventListener('click', () => whack(parseInt(hole.dataset.idx)));
    });
  }

  render();
  return () => { clearTimeout(moleTimer); clearInterval(countdownTimer); };
}

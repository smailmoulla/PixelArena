export function renderSnake(container) {
  const GRID = 20;
  const CELL = 20;
  const CANVAS_SIZE = GRID * CELL;
  let snake, dir, nextDir, food, score, highScore, gameInterval, scoreInterval, gameOver, gameStarted;
  let keyHandler = null;

  function randomFood() {
    let pos;
    do {
      pos = { x: Math.floor(Math.random() * GRID), y: Math.floor(Math.random() * GRID) };
    } while (snake.some(s => s.x === pos.x && s.y === pos.y));
    return pos;
  }

  function startGame() {
    snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
    dir = { x: 1, y: 0 };
    nextDir = { x: 1, y: 0 };
    food = randomFood();
    score = 0;
    highScore = parseInt(localStorage.getItem('snake-hs') || '0');
    gameOver = false;
    gameStarted = false;

    clearInterval(gameInterval);
    clearInterval(scoreInterval);

    container.innerHTML = `
      <div class="game-page">
        <div class="game-header">
          <h1>🐍 Snake</h1>
          <p>Eat the red dots, avoid the walls and yourself!</p>
        </div>
        <div class="game-container">
          <div class="score-bar">
            <div class="score-item"><span class="score-label">Score</span><span class="score-value" id="snake-score">0</span></div>
            <div class="score-item"><span class="score-label">Best</span><span class="score-value" id="snake-hs">${highScore}</span></div>
          </div>
          <div style="display:flex;flex-direction:column;align-items:center;gap:1rem;">
            <canvas id="snake-canvas" width="${CANVAS_SIZE}" height="${CANVAS_SIZE}"
              style="border-radius:12px;cursor:none;touch-action:none;max-width:min(100%,400px);width:100%;height:auto;"></canvas>
            <div class="dpad-wrapper">
              <div class="dpad">
                <button class="dpad-btn dpad-up" id="snake-up">▲</button>
                <button class="dpad-btn dpad-left" id="snake-left">◀</button>
                <button class="dpad-btn dpad-right" id="snake-right">▶</button>
                <button class="dpad-btn dpad-down" id="snake-down">▼</button>
              </div>
            </div>
            <div id="snake-actions">
              <div style="color:var(--text-secondary,#666);font-size:0.85rem;text-align:center;">
                Arrow keys or WASD to move • Swipe or use D-pad on mobile
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    scoreInterval = setInterval(() => {
      const el = document.getElementById('snake-score');
      const hsEl = document.getElementById('snake-hs');
      if (el) el.textContent = score;
      if (hsEl) hsEl.textContent = highScore;
    }, 80);

    let tx0, ty0;
    const canvas = document.getElementById('snake-canvas');
    canvas?.addEventListener('touchstart', e => { 
      tx0 = e.touches[0].clientX; ty0 = e.touches[0].clientY; 
      if (!gameStarted && !gameOver) {
        gameStarted = true;
        gameInterval = setInterval(tick, 120);
      }
    }, { passive: true });
    canvas?.addEventListener('touchend', e => {
      if (tx0 == null) return;
      const dx = e.changedTouches[0].clientX - tx0;
      const dy = e.changedTouches[0].clientY - ty0;
      if (Math.abs(dx) > Math.abs(dy)) nextDir = dx > 0 ? { x: 1, y: 0 } : { x: -1, y: 0 };
      else nextDir = dy > 0 ? { x: 0, y: 1 } : { x: 0, y: -1 };
      tx0 = ty0 = null;
    });

    // D-pad buttons
    const dpadMap = {
      'snake-up':    { x: 0, y: -1 },
      'snake-down':  { x: 0, y: 1 },
      'snake-left':  { x: -1, y: 0 },
      'snake-right': { x: 1, y: 0 },
    };
    Object.entries(dpadMap).forEach(([id, nd]) => {
      const btn = document.getElementById(id);
      if (!btn) return;
      const press = (e) => {
        e.preventDefault();
        if (!gameStarted && !gameOver) {
          gameStarted = true;
          gameInterval = setInterval(tick, 120);
        }
        if (!(nd.x === -dir.x && nd.y === -dir.y)) nextDir = nd;
      };
      btn.addEventListener('touchstart', press, { passive: false });
      btn.addEventListener('mousedown', press);
    });

    drawCanvas();
  }

  function tick() {
    dir = nextDir;
    const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

    if (head.x < 0 || head.x >= GRID || head.y < 0 || head.y >= GRID ||
        snake.some(s => s.x === head.x && s.y === head.y)) {
      clearInterval(gameInterval);
      clearInterval(scoreInterval);
      gameOver = true;
      if (score > highScore) {
        highScore = score;
        localStorage.setItem('snake-hs', highScore);
      }
      const el = document.getElementById('snake-score');
      const hsEl = document.getElementById('snake-hs');
      if (el) el.textContent = score;
      if (hsEl) hsEl.textContent = highScore;
      const actions = document.getElementById('snake-actions');
      if (actions) {
        actions.innerHTML = `
          <div class="game-actions">
            <button class="btn btn-primary" id="snake-restart">Play Again</button>
            <a href="#" class="btn btn-secondary">All Games</a>
          </div>
        `;
        document.getElementById('snake-restart')?.addEventListener('click', startGame);
      }
      drawCanvas();
      return;
    }

    snake.unshift(head);
    if (head.x === food.x && head.y === food.y) {
      score++;
      food = randomFood();
    } else {
      snake.pop();
    }
    drawCanvas();
  }

  function drawCanvas() {
    const canvas = document.getElementById('snake-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    for (let x = 0; x < GRID; x++) {
      for (let y = 0; y < GRID; y++) {
        ctx.fillStyle = (x + y) % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent';
        ctx.fillRect(x * CELL, y * CELL, CELL, CELL);
      }
    }

    const fCx = food.x * CELL + CELL / 2;
    const fCy = food.y * CELL + CELL / 2;
    ctx.beginPath();
    ctx.arc(fCx, fCy, CELL / 2 - 2, 0, Math.PI * 2);
    ctx.fillStyle = '#ff6b6b';
    ctx.shadowBlur = 12;
    ctx.shadowColor = '#ff6b6b';
    ctx.fill();
    ctx.shadowBlur = 0;

    snake.forEach((seg, i) => {
      const t = i / snake.length;
      const r = Math.round(72 + (102 - 72) * t);
      const g = Math.round(219 + (126 - 219) * t);
      const b = Math.round(164 + (234 - 164) * t);
      ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx.beginPath();
      ctx.roundRect(seg.x * CELL + 1, seg.y * CELL + 1, CELL - 2, CELL - 2, 4);
      ctx.fill();
    });

    const h = snake[0];
    ctx.fillStyle = '#1a1a2e';
    const eyeOff = dir.y === 0 ? [4, 6, 4, 14] : [6, 4, 14, 4];
    ctx.beginPath(); ctx.arc(h.x * CELL + eyeOff[0], h.y * CELL + eyeOff[1], 2, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(h.x * CELL + eyeOff[2], h.y * CELL + eyeOff[3], 2, 0, Math.PI * 2); ctx.fill();

    if (gameOver) {
      ctx.fillStyle = 'rgba(26,26,46,0.78)';
      ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 28px Space Grotesk, system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('GAME OVER', CANVAS_SIZE / 2, CANVAS_SIZE / 2 - 20);
      ctx.font = '18px Space Grotesk, system-ui';
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.fillText(`Score: ${score}`, CANVAS_SIZE / 2, CANVAS_SIZE / 2 + 14);
    } else if (!gameStarted) {
      ctx.fillStyle = 'rgba(26,26,46,0.6)';
      ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 22px Space Grotesk, system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('PRESS TO START', CANVAS_SIZE / 2, CANVAS_SIZE / 2);
    }
  }

  keyHandler = (e) => {
    const map = {
      ArrowUp: { x: 0, y: -1 }, ArrowDown: { x: 0, y: 1 },
      ArrowLeft: { x: -1, y: 0 }, ArrowRight: { x: 1, y: 0 },
      w: { x: 0, y: -1 }, s: { x: 0, y: 1 },
      a: { x: -1, y: 0 }, d: { x: 1, y: 0 },
    };
    const nd = map[e.key];
    if (!gameStarted && !gameOver) {
      gameStarted = true;
      gameInterval = setInterval(tick, 120);
    }
    if (nd && !(nd.x === -dir.x && nd.y === -dir.y)) {
      nextDir = nd;
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) e.preventDefault();
    }
  };
  document.addEventListener('keydown', keyHandler);

  startGame();

  return () => {
    clearInterval(gameInterval);
    clearInterval(scoreInterval);
    document.removeEventListener('keydown', keyHandler);
  };
}

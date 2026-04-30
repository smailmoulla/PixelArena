export function renderTetris(container) {
  const COLS = 10, ROWS = 20, CELL = 28;
  const W = COLS * CELL, H = ROWS * CELL;

  const PIECES = [
    { shape: [[1,1,1,1]], color: '#48dbfb' },           // I
    { shape: [[1,1],[1,1]], color: '#feca57' },           // O
    { shape: [[0,1,0],[1,1,1]], color: '#a29bfe' },       // T
    { shape: [[1,0],[1,0],[1,1]], color: '#fd9644' },     // J
    { shape: [[0,1],[0,1],[1,1]], color: '#54a0ff' },     // L
    { shape: [[0,1,1],[1,1,0]], color: '#6aaa64' },       // S
    { shape: [[1,1,0],[0,1,1]], color: '#ff6b6b' },       // Z
  ];

  let board, current, score, lines, level, gameOver, paused, dropTimer, keyHandler;
  let animFrame;

  function emptyBoard() {
    return Array.from({ length: ROWS }, () => Array(COLS).fill(null));
  }

  function randomPiece() {
    const p = PIECES[Math.floor(Math.random() * PIECES.length)];
    return {
      shape: p.shape,
      color: p.color,
      x: Math.floor(COLS / 2) - Math.floor(p.shape[0].length / 2),
      y: 0,
    };
  }

  function rotate(shape) {
    return shape[0].map((_, i) => shape.map(r => r[i]).reverse());
  }

  function fits(shape, x, y, b) {
    return shape.every((row, dr) =>
      row.every((v, dc) => {
        if (!v) return true;
        const nx = x + dc, ny = y + dr;
        return nx >= 0 && nx < COLS && ny < ROWS && (ny < 0 || !b[ny][nx]);
      })
    );
  }

  function lock() {
    current.shape.forEach((row, dr) => {
      row.forEach((v, dc) => {
        if (v && current.y + dr >= 0) {
          board[current.y + dr][current.x + dc] = current.color;
        }
      });
    });
    // Clear full lines
    let cleared = 0;
    for (let r = ROWS - 1; r >= 0; r--) {
      if (board[r].every(c => c)) {
        board.splice(r, 1);
        board.unshift(Array(COLS).fill(null));
        cleared++; r++;
      }
    }
    if (cleared) {
      const pts = [0, 100, 300, 500, 800];
      score += (pts[cleared] || 800) * level;
      lines += cleared;
      level = Math.floor(lines / 10) + 1;
    }
    current = randomPiece();
    if (!fits(current.shape, current.x, current.y, board)) {
      gameOver = true;
    }
  }

  function drop() {
    if (gameOver || paused) return;
    if (fits(current.shape, current.x, current.y + 1, board)) {
      current.y++;
    } else {
      lock();
    }
    draw();
  }

  function hardDrop() {
    while (fits(current.shape, current.x, current.y + 1, board)) current.y++;
    lock();
    draw();
  }

  let lastDrop = 0;
  function loop(ts) {
    if (gameOver) { showGameOver(); return; }
    const interval = Math.max(80, 500 - (level - 1) * 45);
    if (ts - lastDrop > interval) { drop(); lastDrop = ts; }
    animFrame = requestAnimationFrame(loop);
  }

  function ghostY() {
    let gy = current.y;
    while (fits(current.shape, current.x, gy + 1, board)) gy++;
    return gy;
  }

  function draw() {
    const canvas = document.getElementById('tetris-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, W, H);

    // Background
    ctx.fillStyle = '#0f0f23';
    ctx.fillRect(0, 0, W, H);
    // Grid lines
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    for (let c = 0; c <= COLS; c++) { ctx.beginPath(); ctx.moveTo(c*CELL,0); ctx.lineTo(c*CELL,H); ctx.stroke(); }
    for (let r = 0; r <= ROWS; r++) { ctx.beginPath(); ctx.moveTo(0,r*CELL); ctx.lineTo(W,r*CELL); ctx.stroke(); }

    // Board
    board.forEach((row, r) => row.forEach((color, c) => {
      if (color) drawCell(ctx, c, r, color);
    }));

    // Ghost
    const gy = ghostY();
    if (gy !== current.y) {
      current.shape.forEach((row, dr) => row.forEach((v, dc) => {
        if (v) {
          ctx.fillStyle = 'rgba(255,255,255,0.1)';
          ctx.fillRect((current.x+dc)*CELL+1, (gy+dr)*CELL+1, CELL-2, CELL-2);
        }
      }));
    }

    // Current piece
    current.shape.forEach((row, dr) => row.forEach((v, dc) => {
      if (v) drawCell(ctx, current.x+dc, current.y+dr, current.color);
    }));

    // Update score display
    const scoreEl = document.getElementById('tetris-score');
    const levelEl = document.getElementById('tetris-level');
    const linesEl = document.getElementById('tetris-lines');
    if (scoreEl) scoreEl.textContent = score;
    if (levelEl) levelEl.textContent = level;
    if (linesEl) linesEl.textContent = lines;
  }

  function drawCell(ctx, c, r, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(c*CELL+1, r*CELL+1, CELL-2, CELL-2, 3);
    ctx.fill();
    // Highlight
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.fillRect(c*CELL+2, r*CELL+2, CELL-4, 4);
  }

  function showGameOver() {
    const canvas = document.getElementById('tetris-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'rgba(15,15,35,0.82)';
    ctx.fillRect(0, H/2-60, W, 120);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 26px Space Grotesk, system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', W/2, H/2-20);
    ctx.font = '16px Space Grotesk, system-ui';
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.fillText(`Score: ${score}`, W/2, H/2+10);

    const actions = document.getElementById('tetris-actions');
    if (actions && !actions.querySelector('button')) {
      actions.innerHTML = `
        <div class="game-actions" style="margin-top:0.75rem;">
          <button class="btn btn-primary" id="tetris-restart">Play Again</button>
          <a href="#" class="btn btn-secondary">All Games</a>
        </div>`;
      document.getElementById('tetris-restart')?.addEventListener('click', startGame);
    }
  }

  function startGame() {
    board = emptyBoard();
    score = 0; lines = 0; level = 1;
    gameOver = false; paused = false;
    current = randomPiece();
    lastDrop = 0;

    cancelAnimationFrame(animFrame);

    container.innerHTML = `
      <div class="game-page">
        <div class="game-header">
          <h1>🧱 Tetris</h1>
          <p>Clear lines before the blocks reach the top!</p>
        </div>
        <div class="game-container" style="max-width:600px;margin:0 auto;">
          <div class="score-bar">
            <div class="score-item"><span class="score-label">Score</span><span class="score-value" id="tetris-score">0</span></div>
            <div class="score-item"><span class="score-label">Level</span><span class="score-value" id="tetris-level">1</span></div>
            <div class="score-item"><span class="score-label">Lines</span><span class="score-value" id="tetris-lines">0</span></div>
          </div>
          <div style="display:flex;flex-direction:column;align-items:center;gap:0.75rem;">
            <canvas id="tetris-canvas" width="${W}" height="${H}"
              style="border-radius:12px;touch-action:none;max-width:min(100%,320px);width:100%;height:auto;"></canvas>
            <div class="dpad-wrapper" style="margin-top:0.25rem;">
              <div class="dpad">
                <button class="dpad-btn dpad-up" id="tetris-rotate" title="Rotate">↻</button>
                <button class="dpad-btn dpad-left" id="tetris-left">◀</button>
                <button class="dpad-btn dpad-right" id="tetris-right">▶</button>
                <button class="dpad-btn dpad-down" id="tetris-softdrop">▼</button>
              </div>
              <div class="tetris-touch-row" style="margin-top:0.5rem;">
                <button class="tetris-touch-btn" id="tetris-harddrop">⬇ Drop</button>
                <button class="tetris-touch-btn" id="tetris-pause-btn">⏸ Pause</button>
              </div>
            </div>
            <div id="tetris-actions">
              <div style="color:var(--text-secondary,#666);font-size:0.82rem;text-align:center;">
                ← → Move &nbsp;|&nbsp; ↑ Rotate &nbsp;|&nbsp; ↓ Soft drop &nbsp;|&nbsp; Space Hard drop &nbsp;|&nbsp; P Pause
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Touch swipe
    let tx0, ty0, ttime;
    const canvas = document.getElementById('tetris-canvas');
    canvas?.addEventListener('touchstart', e => {
      tx0 = e.touches[0].clientX; ty0 = e.touches[0].clientY; ttime = Date.now();
    }, { passive: true });
    canvas?.addEventListener('touchend', e => {
      if (tx0 == null) return;
      const dx = e.changedTouches[0].clientX - tx0;
      const dy = e.changedTouches[0].clientY - ty0;
      const dt = Date.now() - ttime;
      if (Math.abs(dx) < 15 && Math.abs(dy) < 15 && dt < 250) {
        // Tap = rotate
        const rotated = rotate(current.shape);
        if (fits(rotated, current.x, current.y, board)) current.shape = rotated;
      } else if (Math.abs(dx) > Math.abs(dy)) {
        if (fits(current.shape, current.x + Math.sign(dx), current.y, board)) current.x += Math.sign(dx);
      } else if (dy > 30) {
        hardDrop();
      }
      draw();
      tx0 = ty0 = null;
    });

    // D-pad buttons
    const wireBtn = (id, fn) => {
      const btn = document.getElementById(id);
      if (!btn) return;
      btn.addEventListener('touchstart', e => { e.preventDefault(); if (!gameOver && !paused) fn(); }, { passive: false });
      btn.addEventListener('mousedown', e => { e.preventDefault(); if (!gameOver && !paused) fn(); });
    };
    wireBtn('tetris-left',  () => { if (fits(current.shape, current.x-1, current.y, board)) { current.x--; draw(); } });
    wireBtn('tetris-right', () => { if (fits(current.shape, current.x+1, current.y, board)) { current.x++; draw(); } });
    wireBtn('tetris-softdrop', () => drop());
    wireBtn('tetris-harddrop', () => { if (!gameOver && !paused) hardDrop(); });
    wireBtn('tetris-rotate', () => {
      const rot = rotate(current.shape);
      if (fits(rot, current.x, current.y, board)) current.shape = rot;
      else if (fits(rot, current.x-1, current.y, board)) { current.shape = rot; current.x--; }
      else if (fits(rot, current.x+1, current.y, board)) { current.shape = rot; current.x++; }
      draw();
    });
    const pauseBtn = document.getElementById('tetris-pause-btn');
    if (pauseBtn) {
      pauseBtn.addEventListener('click', () => {
        paused = !paused;
        if (!paused) { lastDrop = performance.now(); animFrame = requestAnimationFrame(loop); }
        else cancelAnimationFrame(animFrame);
      });
    }

    animFrame = requestAnimationFrame(loop);
    draw();
  }

  keyHandler = (e) => {
    if (gameOver) return;
    switch (e.key) {
      case 'ArrowLeft':  e.preventDefault(); if (fits(current.shape, current.x-1, current.y, board)) { current.x--; draw(); } break;
      case 'ArrowRight': e.preventDefault(); if (fits(current.shape, current.x+1, current.y, board)) { current.x++; draw(); } break;
      case 'ArrowUp': {
        e.preventDefault();
        const rot = rotate(current.shape);
        if (fits(rot, current.x, current.y, board)) current.shape = rot;
        else if (fits(rot, current.x-1, current.y, board)) { current.shape = rot; current.x--; }
        else if (fits(rot, current.x+1, current.y, board)) { current.shape = rot; current.x++; }
        draw(); break;
      }
      case 'ArrowDown': e.preventDefault(); drop(); break;
      case ' ': e.preventDefault(); hardDrop(); break;
      case 'p': case 'P':
        paused = !paused;
        if (!paused) { lastDrop = performance.now(); animFrame = requestAnimationFrame(loop); }
        else cancelAnimationFrame(animFrame);
        break;
    }
  };
  document.addEventListener('keydown', keyHandler);

  startGame();

  return () => {
    cancelAnimationFrame(animFrame);
    document.removeEventListener('keydown', keyHandler);
  };
}

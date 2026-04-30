export function render2048(container) {
  let board, score, best, moved, gameOver, won;

  function newBoard() { return Array.from({length:4}, () => Array(4).fill(0)); }

  function addTile(b) {
    const empty = [];
    b.forEach((row, r) => row.forEach((v, c) => { if (!v) empty.push({r, c}); }));
    if (!empty.length) return;
    const {r, c} = empty[Math.floor(Math.random() * empty.length)];
    b[r][c] = Math.random() < 0.9 ? 2 : 4;
  }

  function init() {
    board = newBoard();
    score = 0;
    best = parseInt(localStorage.getItem('2048-best') || '0');
    won = false;
    gameOver = false;
    addTile(board); addTile(board);
    render();
  }

  function slide(row) {
    let arr = row.filter(v => v);
    let gained = 0;
    for (let i = 0; i < arr.length - 1; i++) {
      if (arr[i] === arr[i+1]) {
        arr[i] *= 2; gained += arr[i]; arr.splice(i+1, 1); i++;
      }
    }
    while (arr.length < 4) arr.push(0);
    return { row: arr, gained };
  }

  function move(dir) {
    let totalGained = 0; moved = false;
    const b = board.map(r => [...r]);

    const rotRight = m => m[0].map((_, i) => m.map(r => r[i]).reverse());
    const rotLeft  = m => m[0].map((_, i) => m.map(r => r[r.length-1-i]));

    let rotated = dir === 'up' ? rotLeft(b) : dir === 'down' ? rotRight(b) : b;
    let newBoard2 = rotated.map(row => {
      const rev = dir === 'right';
      const r = rev ? [...row].reverse() : row;
      const {row: slid, gained} = slide(r);
      totalGained += gained;
      const result = rev ? slid.reverse() : slid;
      if (result.some((v, i) => v !== row[i])) moved = true;
      return result;
    });

    let final = dir === 'up' ? rotRight(newBoard2) : dir === 'down' ? rotLeft(newBoard2) : newBoard2;
    if (moved) {
      board = final;
      score += totalGained;
      if (score > best) { best = score; localStorage.setItem('2048-best', best); }
      if (board.some(r => r.includes(2048))) won = true;
      addTile(board);
      checkGameOver();
      render();
    }
  }

  function checkGameOver() {
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (!board[r][c]) return;
        if (r < 3 && board[r][c] === board[r+1][c]) return;
        if (c < 3 && board[r][c] === board[r][c+1]) return;
      }
    }
    gameOver = true;
  }

  const TILE_COLORS = {
    0:    ['#cdc1b4','#776e65'],
    2:    ['#eee4da','#776e65'],
    4:    ['#ede0c8','#776e65'],
    8:    ['#f2b179','#f9f6f2'],
    16:   ['#f59563','#f9f6f2'],
    32:   ['#f67c5f','#f9f6f2'],
    64:   ['#f65e3b','#f9f6f2'],
    128:  ['#edcf72','#f9f6f2'],
    256:  ['#edcc61','#f9f6f2'],
    512:  ['#edc850','#f9f6f2'],
    1024: ['#edc53f','#f9f6f2'],
    2048: ['#edc22e','#f9f6f2'],
  };

  function tileStyle(v) {
    const [bg, color] = TILE_COLORS[v] || ['#3c3a32','#f9f6f2'];
    const fontSize = v >= 1000 ? '1.2rem' : v >= 100 ? '1.5rem' : '1.8rem';
    return `background:${bg};color:${color};font-size:${fontSize};`;
  }

  function render() {
    container.innerHTML = `
      <div class="game-page">
        <div class="game-header">
          <h1>🟨 2048</h1>
          <p>Merge tiles to reach <strong>2048</strong>!</p>
        </div>
        <div class="game-container">
          <div class="score-bar">
            <div class="score-item"><span class="score-label">Score</span><span class="score-value">${score}</span></div>
            <div class="score-item"><span class="score-label">Best</span><span class="score-value">${best}</span></div>
          </div>
          <div id="board-2048" style="
            display:grid;grid-template-columns:repeat(4,1fr);
            gap:10px;padding:12px;background:#bbada0;border-radius:12px;
            max-width:360px;margin:0 auto;touch-action:none;
          ">
            ${board.flat().map(v => `
              <div style="
                aspect-ratio:1;display:flex;align-items:center;justify-content:center;
                border-radius:8px;font-weight:800;font-family:var(--font,system-ui);
                ${tileStyle(v)}transition:background 0.1s;
              ">${v || ''}</div>
            `).join('')}
          </div>
          ${gameOver ? `
            <div class="message error" style="margin-top:1rem;">Game over! Final score: ${score}</div>
            <div class="game-actions">
              <button class="btn btn-primary" id="g2048-restart">New Game</button>
              <a href="#" class="btn btn-secondary">All Games</a>
            </div>
          ` : won ? `
            <div class="message success" style="margin-top:1rem;">🎉 You reached 2048! Keep going!</div>
            <div class="game-actions">
              <button class="btn btn-primary" id="g2048-restart">New Game</button>
            </div>
          ` : `
            <div style="color:var(--text-secondary,#666);font-size:0.85rem;text-align:center;margin-top:0.5rem;">
              Arrow keys or WASD • Swipe on mobile
            </div>
          `}
        </div>
      </div>
    `;

    document.getElementById('g2048-restart')?.addEventListener('click', init);

    const keyHandler = (e) => {
      const map = { ArrowUp:'up', ArrowDown:'down', ArrowLeft:'left', ArrowRight:'right',
                    w:'up', s:'down', a:'left', d:'right' };
      const d = map[e.key];
      if (d) { e.preventDefault(); move(d); }
    };
    document.addEventListener('keydown', keyHandler);

    let tx0, ty0;
    const bd = document.getElementById('board-2048');
    bd?.addEventListener('touchstart', e => { tx0=e.touches[0].clientX; ty0=e.touches[0].clientY; }, { passive:true });
    bd?.addEventListener('touchend', e => {
      if (tx0==null) return;
      const dx = e.changedTouches[0].clientX - tx0;
      const dy = e.changedTouches[0].clientY - ty0;
      if (Math.abs(dx) > Math.abs(dy)) move(dx > 0 ? 'right' : 'left');
      else move(dy > 0 ? 'down' : 'up');
      tx0=ty0=null;
    });

    return () => document.removeEventListener('keydown', keyHandler);
  }

  init();
}

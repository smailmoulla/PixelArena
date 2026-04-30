export function renderMinesweeper(container) {
  const PRESETS = {
    easy:   { rows: 9,  cols: 9,  mines: 10 },
    medium: { rows: 13, cols: 13, mines: 25 },
    hard:   { rows: 16, cols: 16, mines: 40 },
  };

  let rows, cols, numMines, board, revealed, flagged, gameOver, won, firstClick, startTime, elapsed, timerInterval;
  let difficulty = 'easy';
  let flagMode = false;

  function initGame() {
    const cfg = PRESETS[difficulty];
    rows = cfg.rows; cols = cfg.cols; numMines = cfg.mines;
    board    = Array.from({length: rows}, () => Array(cols).fill(0));
    revealed = Array.from({length: rows}, () => Array(cols).fill(false));
    flagged  = Array.from({length: rows}, () => Array(cols).fill(false));
    gameOver = false; won = false; firstClick = true; elapsed = 0;
    flagMode = false;
    clearInterval(timerInterval);
    render();
  }

  function placeMines(avoidR, avoidC) {
    let placed = 0;
    while (placed < numMines) {
      const r = Math.floor(Math.random() * rows);
      const c = Math.floor(Math.random() * cols);
      if (board[r][c] !== -1 && !(Math.abs(r-avoidR)<=1 && Math.abs(c-avoidC)<=1)) {
        board[r][c] = -1; placed++;
      }
    }
    for (let r=0;r<rows;r++) for (let c=0;c<cols;c++) {
      if (board[r][c]===-1) continue;
      let cnt=0;
      for(let dr=-1;dr<=1;dr++) for(let dc=-1;dc<=1;dc++){
        const nr=r+dr,nc=c+dc;
        if(nr>=0&&nr<rows&&nc>=0&&nc<cols&&board[nr][nc]===-1) cnt++;
      }
      board[r][c]=cnt;
    }
  }

  function reveal(r,c) {
    if (r<0||r>=rows||c<0||c>=cols||revealed[r][c]||flagged[r][c]) return;
    if (firstClick) {
      firstClick=false; placeMines(r,c);
      startTime=Date.now();
      timerInterval=setInterval(()=>{ elapsed=Math.floor((Date.now()-startTime)/1000); updateTimer(); },1000);
    }
    revealed[r][c]=true;
    if (board[r][c]===-1) { gameOver=true; clearInterval(timerInterval); revealAllMines(); render(); return; }
    if (board[r][c]===0) {
      for(let dr=-1;dr<=1;dr++) for(let dc=-1;dc<=1;dc++) reveal(r+dr,c+dc);
    }
    checkWin();
  }

  function revealAllMines() {
    for(let r=0;r<rows;r++) for(let c=0;c<cols;c++) {
      if(board[r][c]===-1) revealed[r][c]=true;
    }
  }

  function checkWin() {
    let unrevealed=0;
    for(let r=0;r<rows;r++) for(let c=0;c<cols;c++) if(!revealed[r][c]) unrevealed++;
    if(unrevealed===numMines){ won=true; gameOver=true; clearInterval(timerInterval); render(); }
  }

  function updateTimer() {
    const el=document.getElementById('ms-timer');
    if(el) el.textContent=elapsed+'s';
  }

  const NUM_COLORS=['','#2563eb','#16a34a','#dc2626','#7c3aed','#b45309','#0891b2','#000','#6b7280'];

  function getCellSize() {
    const vw = Math.min(window.innerWidth, 600);
    const available = vw - 32;
    const byWidth = Math.floor(available / cols);
    const base = difficulty === 'hard' ? 28 : difficulty === 'medium' ? 32 : 38;
    return Math.min(base, Math.max(22, byWidth));
  }

  function renderCell(r,c) {
    const isRev=revealed[r][c], isFlag=flagged[r][c], val=board[r][c];
    let content='', style='';
    if (isFlag && !isRev) { content='🚩'; style='background:#fff3cd;'; }
    else if (!isRev) { style='background:#d1d5db;cursor:pointer;'; }
    else if (val===-1) { content=gameOver&&!won?'💥':'💣'; style='background:#fecaca;'; }
    else if (val===0) { style='background:#f3f4f6;'; }
    else { content=val; style=`background:#f3f4f6;color:${NUM_COLORS[val]};font-weight:800;`; }
    return `<div class="ms-cell" data-r="${r}" data-c="${c}" style="${style}">${content}</div>`;
  }

  function render() {
    const flagCount = flagged.flat().filter(Boolean).length;
    const cellSize = getCellSize();
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    container.innerHTML = `
      <div class="game-page">
        <div class="game-header">
          <h1>💣 Minesweeper</h1>
          <p>Find all the mines without triggering any!</p>
        </div>
        <div class="game-container" style="max-width:640px;margin:0 auto;">
          <div style="display:flex;gap:8px;justify-content:center;margin-bottom:1rem;flex-wrap:wrap;">
            ${['easy','medium','hard'].map(d=>`
              <button class="btn ${d===difficulty?'btn-primary':'btn-secondary'}" id="ms-diff-${d}" style="padding:6px 16px;font-size:0.85rem;">${d}</button>
            `).join('')}
          </div>
          <div class="score-bar">
            <div class="score-item"><span class="score-label">🚩 Flags</span><span class="score-value">${flagCount}/${numMines}</span></div>
            <div class="score-item"><span class="score-label">⏱ Time</span><span class="score-value" id="ms-timer">${elapsed}s</span></div>
            ${isTouch ? `<div class="score-item">
              <button id="ms-flag-toggle" class="btn ${flagMode ? 'btn-primary' : 'btn-secondary'}" style="padding:6px 14px;font-size:0.85rem;">
                🚩 ${flagMode ? 'Flag ON' : 'Flag OFF'}
              </button>
            </div>` : ''}
          </div>
          ${won ? `<div class="message success">🎉 You won in ${elapsed}s!</div>` : ''}
          ${gameOver && !won ? `<div class="message error">💥 Boom! Try again.</div>` : ''}
          <div style="overflow-x:auto;-webkit-overflow-scrolling:touch;">
            <div id="ms-board" style="
              display:grid;grid-template-columns:repeat(${cols},${cellSize}px);
              gap:2px;justify-content:center;margin:0.5rem auto;
            ">
              ${Array.from({length:rows},(_,r)=>Array.from({length:cols},(_,c)=>renderCell(r,c)).join('')).join('')}
            </div>
          </div>
          <div class="game-actions" style="margin-top:0.5rem;">
            <button class="btn btn-primary" id="ms-restart">New Game</button>
            <a href="#" class="btn btn-secondary">All Games</a>
          </div>
          <div style="color:var(--text-secondary,#666);font-size:0.8rem;text-align:center;margin-top:0.5rem;">
            ${isTouch
              ? 'Tap to reveal • Long-press or 🚩 toggle to flag'
              : 'Left click to reveal • Right click to flag'}
          </div>
        </div>
      </div>
    `;

    // Inject cell styles
    document.querySelectorAll('#ms-cell-style').forEach(e=>e.remove());
    const styleEl = document.createElement('style');
    styleEl.id = 'ms-cell-style';
    styleEl.textContent = `.ms-cell{width:${cellSize}px;height:${cellSize}px;display:flex;align-items:center;justify-content:center;border-radius:4px;font-size:${Math.max(10, cellSize * 0.45)}px;border:1px solid rgba(0,0,0,0.1);user-select:none;-webkit-user-select:none;}`;
    document.head.appendChild(styleEl);

    document.getElementById('ms-restart')?.addEventListener('click', initGame);
    ['easy','medium','hard'].forEach(d => {
      document.getElementById(`ms-diff-${d}`)?.addEventListener('click', () => { difficulty=d; initGame(); });
    });

    // Flag toggle button (mobile)
    const flagToggle = document.getElementById('ms-flag-toggle');
    if (flagToggle) {
      flagToggle.addEventListener('click', () => {
        flagMode = !flagMode;
        flagToggle.textContent = `🚩 ${flagMode ? 'Flag ON' : 'Flag OFF'}`;
        flagToggle.className = `btn ${flagMode ? 'btn-primary' : 'btn-secondary'}`;
        flagToggle.style.cssText = 'padding:6px 14px;font-size:0.85rem;';
      });
    }

    const board_el = document.getElementById('ms-board');

    // Mouse click (reveal or flag based on flagMode)
    board_el?.addEventListener('click', e => {
      const cell = e.target.closest('.ms-cell');
      if (!cell || gameOver) return;
      const r=+cell.dataset.r, c=+cell.dataset.c;
      if (flagMode) {
        if (!revealed[r][c]) { flagged[r][c]=!flagged[r][c]; renderBoard(); }
      } else {
        reveal(r, c);
        renderBoard();
      }
    });

    // Right-click to flag (desktop)
    board_el?.addEventListener('contextmenu', e => {
      e.preventDefault();
      const cell = e.target.closest('.ms-cell');
      if (!cell || gameOver) return;
      const r=+cell.dataset.r, c=+cell.dataset.c;
      if (!revealed[r][c]) { flagged[r][c]=!flagged[r][c]; renderBoard(); }
    });

    // Long-press to flag (mobile)
    let longPressTimer = null;
    board_el?.addEventListener('touchstart', e => {
      const cell = e.target.closest('.ms-cell');
      if (!cell || gameOver) return;
      longPressTimer = setTimeout(() => {
        const r=+cell.dataset.r, c=+cell.dataset.c;
        if (!revealed[r][c]) { flagged[r][c]=!flagged[r][c]; renderBoard(); }
        longPressTimer = null;
      }, 500);
    }, { passive: true });
    board_el?.addEventListener('touchend', () => {
      if (longPressTimer) { clearTimeout(longPressTimer); longPressTimer = null; }
    }, { passive: true });
    board_el?.addEventListener('touchmove', () => {
      if (longPressTimer) { clearTimeout(longPressTimer); longPressTimer = null; }
    }, { passive: true });
  }

  function renderBoard() {
    const bd = document.getElementById('ms-board');
    if (!bd) return;
    const cells = bd.querySelectorAll('.ms-cell');
    cells.forEach(cell => {
      const r=+cell.dataset.r, c=+cell.dataset.c;
      const isRev=revealed[r][c], isFlag=flagged[r][c], val=board[r][c];
      if (isFlag && !isRev) { cell.textContent='🚩'; cell.style.background='#fff3cd'; }
      else if (!isRev) { cell.textContent=''; cell.style.background='#d1d5db'; cell.style.cursor='pointer'; }
      else if (val===-1) { cell.textContent=gameOver&&!won?'💥':'💣'; cell.style.background='#fecaca'; }
      else if (val===0) { cell.textContent=''; cell.style.background='#f3f4f6'; }
      else { cell.textContent=val; cell.style.background='#f3f4f6'; cell.style.color=NUM_COLORS[val]; }
    });
    const flagEl=document.querySelector('.score-bar .score-value');
    if(flagEl) flagEl.textContent=flagged.flat().filter(Boolean).length+'/'+numMines;
    if(won) { const el=document.createElement('div'); el.className='message success'; el.textContent=`🎉 You won in ${elapsed}s!`; document.getElementById('ms-board')?.closest('div[style*="overflow"]')?.before(el); }
    if(gameOver&&!won) { const el=document.createElement('div'); el.className='message error'; el.textContent='💥 Boom! Try again.'; document.getElementById('ms-board')?.closest('div[style*="overflow"]')?.before(el); }
  }

  initGame();
  return () => clearInterval(timerInterval);
}

export function renderTicTacToe(container) {
  let board, xScore, oScore, draws, currentPlayer, gameActive;

  function init(reset = true) {
    board = Array(9).fill(null);
    currentPlayer = 'X';
    gameActive = true;
    if (reset) { xScore = 0; oScore = 0; draws = 0; }
    render();
  }

  function checkWinner(b) {
    const wins = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    for (const [a,c,d] of wins) {
      if (b[a] && b[a] === b[c] && b[a] === b[d]) return { winner: b[a], line: [a,c,d] };
    }
    if (b.every(c => c)) return { winner: 'draw' };
    return null;
  }

  function minimax(b, isMax) {
    const res = checkWinner(b);
    if (res) return res.winner === 'O' ? 10 : res.winner === 'X' ? -10 : 0;
    const moves = b.map((v,i) => v ? null : i).filter(v => v !== null);
    if (isMax) {
      let best = -Infinity;
      for (const m of moves) {
        b[m] = 'O'; best = Math.max(best, minimax(b, false)); b[m] = null;
      }
      return best;
    } else {
      let best = Infinity;
      for (const m of moves) {
        b[m] = 'X'; best = Math.min(best, minimax(b, true)); b[m] = null;
      }
      return best;
    }
  }

  function cpuMove() {
    const empty = board.map((v,i) => v ? null : i).filter(v => v !== null);
    if (!empty.length) return;
    let bestScore = -Infinity, bestMove = empty[0];
    for (const m of empty) {
      board[m] = 'O';
      const s = minimax(board, false);
      board[m] = null;
      if (s > bestScore) { bestScore = s; bestMove = m; }
    }
    board[bestMove] = 'O';
    const result = checkWinner(board);
    if (result) { handleResult(result); return; }
    currentPlayer = 'X';
    render();
  }

  function handleResult(result) {
    gameActive = false;
    if (result.winner === 'X') xScore++;
    else if (result.winner === 'O') oScore++;
    else draws++;
    render(result);
  }

  function handleClick(idx) {
    if (!gameActive || board[idx] || currentPlayer !== 'X') return;
    board[idx] = 'X';
    const result = checkWinner(board);
    if (result) { handleResult(result); return; }
    currentPlayer = 'O';
    render();
    setTimeout(cpuMove, 420);
  }

  function render(result = null) {
    const winLine = result && result.line ? result.line : [];
    const statusMsg = !gameActive
      ? result?.winner === 'draw' ? "🤝 It's a draw!" : result?.winner === 'X' ? '🎉 You win!' : '🤖 CPU wins!'
      : currentPlayer === 'X' ? '👆 Your turn (X)' : '🤖 CPU is thinking...';

    container.innerHTML = `
      <div class="game-page">
        <div class="game-header">
          <h1>⭕ Tic Tac Toe</h1>
          <p>You (X) vs CPU (O)</p>
        </div>
        <div class="game-container" style="text-align:center;">
          <div class="score-bar">
            <div class="score-item"><span class="score-label">You (X)</span><span class="score-value" style="color:#667eea;">${xScore}</span></div>
            <div class="score-item"><span class="score-label">Draws</span><span class="score-value">${draws}</span></div>
            <div class="score-item"><span class="score-label">CPU (O)</span><span class="score-value" style="color:#f093fb;">${oScore}</span></div>
          </div>
          <div style="font-weight:600;margin:1rem 0;font-size:1.05rem;min-height:1.6rem;">${statusMsg}</div>
          <div class="ttt-grid">
            ${board.map((cell, i) => `
              <button class="ttt-cell ${winLine.includes(i) ? 'ttt-win' : ''} ${cell ? 'ttt-filled' : ''}" data-idx="${i}">
                <span class="${cell === 'X' ? 'ttt-x' : cell === 'O' ? 'ttt-o' : ''}">${cell || ''}</span>
              </button>
            `).join('')}
          </div>
          <div class="game-actions" style="margin-top:1.5rem;">
            <button class="btn btn-primary" id="ttt-next">New Round</button>
            <button class="btn btn-secondary" id="ttt-reset">Reset Score</button>
          </div>
        </div>
      </div>`;

    container.querySelectorAll('.ttt-cell').forEach(cell => {
      cell.addEventListener('click', () => handleClick(parseInt(cell.dataset.idx)));
    });
    document.getElementById('ttt-next')?.addEventListener('click', () => init(false));
    document.getElementById('ttt-reset')?.addEventListener('click', () => init(true));
  }

  init(true);
}

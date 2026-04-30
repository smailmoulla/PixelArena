import { socket } from '../socket.js';

export function renderMpTicTacToe(container, { roomId, you, opponent, role }) {
  // role === 'first' means you are X and go first
  const mySymbol = role === 'first' ? 'X' : 'O';
  const oppSymbol = mySymbol === 'X' ? 'O' : 'X';

  let board = Array(9).fill(null);
  let myScore = 0, oppScore = 0, draws = 0;
  let myTurn = role === 'first';
  let gameActive = true;

  // ── Helpers ────────────────────────────────────────────────────────────────
  function checkWinner(b) {
    const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    for (const [a,c,d] of lines) {
      if (b[a] && b[a] === b[c] && b[a] === b[d]) return { winner: b[a], line: [a,c,d] };
    }
    if (b.every(c => c)) return { winner: 'draw' };
    return null;
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  function render(result = null) {
    const winLine = result?.line || [];
    let statusMsg;
    if (!gameActive && result) {
      if (result.winner === 'draw') statusMsg = "🤝 It's a draw!";
      else if (result.winner === mySymbol) statusMsg = '🎉 You win!';
      else statusMsg = `😞 ${opponent} wins!`;
    } else {
      statusMsg = myTurn ? '👆 Your turn' : `⏳ ${opponent}'s turn...`;
    }

    container.innerHTML = `
      <div class="game-page">
        <div class="game-header">
          <h1>⭕ Tic Tac Toe</h1>
          <p style="color: #667eea; font-weight: 600;">🌐 vs <strong>${opponent}</strong></p>
        </div>
        <div class="game-container" style="text-align:center;">
          <div class="score-bar">
            <div class="score-item"><span class="score-label">You (${mySymbol})</span><span class="score-value" style="color:#667eea;">${myScore}</span></div>
            <div class="score-item"><span class="score-label">Draws</span><span class="score-value">${draws}</span></div>
            <div class="score-item"><span class="score-label">${opponent} (${oppSymbol})</span><span class="score-value" style="color:#f093fb;">${oppScore}</span></div>
          </div>
          <div style="font-weight:600;margin:1rem 0;font-size:1.05rem;min-height:1.6rem;">${statusMsg}</div>
          <div class="ttt-grid">
            ${board.map((cell, i) => `
              <button class="ttt-cell ${winLine.includes(i) ? 'ttt-win' : ''} ${cell ? 'ttt-filled' : ''}" data-idx="${i}" ${(!myTurn || !gameActive || cell) ? 'disabled' : ''}>
                <span class="${cell === 'X' ? 'ttt-x' : cell === 'O' ? 'ttt-o' : ''}">${cell || ''}</span>
              </button>
            `).join('')}
          </div>
          ${!gameActive ? `
            <div class="game-actions" style="margin-top:1.5rem;">
              <button class="btn btn-primary" id="mp-ttt-next">New Round</button>
              <button class="btn btn-secondary" id="mp-ttt-quit">Leave Game</button>
            </div>
          ` : `
            <div style="margin-top:1.5rem;">
              <button class="btn btn-secondary" id="mp-ttt-quit" style="padding: 8px 18px; font-size: 0.85rem;">Leave Game</button>
            </div>
          `}
        </div>
      </div>`;

    container.querySelectorAll('.ttt-cell:not([disabled])').forEach(cell => {
      cell.addEventListener('click', () => handleMyMove(parseInt(cell.dataset.idx)));
    });
    document.getElementById('mp-ttt-next')?.addEventListener('click', requestNewRound);
    document.getElementById('mp-ttt-quit')?.addEventListener('click', quitGame);
  }

  // ── Moves ──────────────────────────────────────────────────────────────────
  function handleMyMove(idx) {
    if (!myTurn || !gameActive || board[idx]) return;
    board[idx] = mySymbol;
    myTurn = false;
    socket.emit('gameMove', { roomId, move: { idx, symbol: mySymbol } });
    const result = checkWinner(board);
    if (result) { endGame(result); } else { render(); }
  }

  function handleOpponentMove({ move }) {
    if (!gameActive) return;
    board[move.idx] = move.symbol;
    myTurn = true;
    const result = checkWinner(board);
    if (result) { endGame(result); } else { render(); }
  }

  function endGame(result) {
    gameActive = false;
    if (result.winner === 'draw') draws++;
    else if (result.winner === mySymbol) myScore++;
    else oppScore++;
    render(result);
  }

  // ── New round ──────────────────────────────────────────────────────────────
  function requestNewRound() {
    board = Array(9).fill(null);
    gameActive = true;
    // The loser or second player goes first next round — alternate
    myTurn = role === 'first' ? (myScore + oppScore + draws) % 2 === 0 : (myScore + oppScore + draws) % 2 !== 0;
    socket.emit('gameMove', { roomId, move: { type: 'newRound', firstTurn: myTurn ? mySymbol : oppSymbol } });
    render();
  }

  function quitGame() {
    cleanup();
    socket.emit('leaveRoom', { roomId });
    window.location.hash = '';
  }

  // ── Socket listeners ───────────────────────────────────────────────────────
  function onOpponentMove({ move }) {
    if (move.type === 'newRound') {
      board = Array(9).fill(null);
      gameActive = true;
      myTurn = move.firstTurn !== mySymbol;
      render();
      return;
    }
    handleOpponentMove({ move });
  }

  function onOpponentLeft() {
    gameActive = false;
    container.innerHTML = `
      <div class="game-over-overlay">
        <div class="game-over-card">
          <div class="emoji">🚪</div>
          <h2>${opponent} left the game</h2>
          <div class="game-actions">
            <a href="#" class="btn btn-primary">Back to Games</a>
          </div>
        </div>
      </div>`;
  }

  function cleanup() {
    socket.off('opponentMove', onOpponentMove);
    socket.off('opponentLeft', onOpponentLeft);
  }

  socket.on('opponentMove', onOpponentMove);
  socket.on('opponentLeft', onOpponentLeft);

  render();

  // Return cleanup
  return cleanup;
}

import { socket } from '../socket.js';

const CHOICES = ['✊ Rock', '✋ Paper', '✌️ Scissors'];
const CHOICE_KEYS = ['rock', 'paper', 'scissors'];

function getWinner(a, b) {
  if (a === b) return 'draw';
  if ((a === 'rock' && b === 'scissors') ||
      (a === 'scissors' && b === 'paper') ||
      (a === 'paper' && b === 'rock')) return 'a';
  return 'b';
}

export function renderMpRPS(container, { roomId, you, opponent, role }) {
  let myScore = 0, oppScore = 0, rounds = 0;
  let myChoice = null, oppChoice = null;
  let roundOver = false;

  function render(statusMsg = null, showResult = false) {
    const status = statusMsg || (myChoice ? `✅ You chose ${CHOICES[CHOICE_KEYS.indexOf(myChoice)]}. Waiting for ${opponent}...` : '👆 Make your choice!');

    container.innerHTML = `
      <div class="game-page">
        <div class="game-header">
          <h1>✂️ Rock Paper Scissors</h1>
          <p style="color: #667eea; font-weight: 600;">🌐 vs <strong>${opponent}</strong></p>
        </div>
        <div class="game-container" style="text-align:center; max-width: 480px; margin: 0 auto;">
          <div class="score-bar">
            <div class="score-item"><span class="score-label">You</span><span class="score-value" style="color:#667eea;">${myScore}</span></div>
            <div class="score-item"><span class="score-label">Rounds</span><span class="score-value">${rounds}</span></div>
            <div class="score-item"><span class="score-label">${opponent}</span><span class="score-value" style="color:#f093fb;">${oppScore}</span></div>
          </div>

          <div style="font-weight: 600; font-size: 1.1rem; margin: 1.2rem 0; min-height: 1.8rem;">${status}</div>

          ${showResult ? `
            <div style="display:flex; justify-content:center; gap:3rem; margin: 1.5rem 0; font-size:3rem;">
              <div>
                <div>${CHOICES[CHOICE_KEYS.indexOf(myChoice)]}</div>
                <div style="font-size:0.85rem; margin-top:0.5rem; color:var(--text-mid);">You</div>
              </div>
              <div style="font-size:1.5rem; align-self:center; color:var(--text-mid);">VS</div>
              <div>
                <div>${CHOICES[CHOICE_KEYS.indexOf(oppChoice)]}</div>
                <div style="font-size:0.85rem; margin-top:0.5rem; color:var(--text-mid);">${opponent}</div>
              </div>
            </div>
            <div class="game-actions" style="margin-top:1rem;">
              <button class="btn btn-primary" id="mp-rps-next">Next Round</button>
              <button class="btn btn-secondary" id="mp-rps-quit">Leave</button>
            </div>
          ` : `
            <div style="display:flex; justify-content:center; gap:1.2rem; margin: 1.5rem 0; flex-wrap:wrap;">
              ${CHOICE_KEYS.map((k, i) => `
                <button class="btn btn-secondary mp-rps-choice" data-choice="${k}"
                  style="font-size:2rem; padding: 1.2rem 1.8rem; ${myChoice === k ? 'border-color:#667eea; color:#667eea; background: rgba(102,126,234,0.1);' : ''}
                  ${myChoice ? 'opacity:0.6; pointer-events:none;' : ''}">
                  ${CHOICES[i]}
                </button>
              `).join('')}
            </div>
            <button class="btn btn-secondary" id="mp-rps-quit" style="padding: 8px 18px; font-size: 0.85rem; margin-top:1rem;">Leave Game</button>
          `}
        </div>
      </div>`;

    container.querySelectorAll('.mp-rps-choice').forEach(btn => {
      btn.addEventListener('click', () => makeChoice(btn.dataset.choice));
    });
    document.getElementById('mp-rps-next')?.addEventListener('click', nextRound);
    document.getElementById('mp-rps-quit')?.addEventListener('click', quitGame);
  }

  function makeChoice(choice) {
    if (myChoice || roundOver) return;
    myChoice = choice;
    socket.emit('gameMove', { roomId, move: { choice } });
    render();

    // If both chose already (oppChoice set by event)
    if (oppChoice) resolveRound();
  }

  function resolveRound() {
    rounds++;
    const result = getWinner(myChoice, oppChoice);
    let msg;
    if (result === 'draw') { msg = "🤝 It's a draw!"; }
    else if (result === 'a') { myScore++; msg = '🎉 You win this round!'; }
    else { oppScore++; msg = `😞 ${opponent} wins this round!`; }
    roundOver = true;
    render(msg, true);
  }

  function nextRound() {
    myChoice = null;
    oppChoice = null;
    roundOver = false;
    render();
  }

  function quitGame() {
    cleanup();
    socket.emit('leaveRoom', { roomId });
    window.location.hash = '';
  }

  function onOpponentMove({ move }) {
    oppChoice = move.choice;
    if (myChoice) resolveRound();
    // else just wait — will resolve when we pick
  }

  function onOpponentLeft() {
    container.innerHTML = `
      <div class="game-over-overlay">
        <div class="game-over-card">
          <div class="emoji">🚪</div>
          <h2>${opponent} left the game</h2>
          <p>You had ${myScore} wins!</p>
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
  return cleanup;
}

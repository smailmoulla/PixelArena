export function renderNumberGuess(container) {
  let secret = 0;
  let attempts = 0;
  let maxNum = 100;
  let history = [];
  let won = false;

  function init() {
    secret = Math.floor(Math.random() * maxNum) + 1;
    attempts = 0;
    history = [];
    won = false;
    render();
  }

  function render() {
    container.innerHTML = `
      <div class="game-page">
        <div class="game-header">
          <h1>🔢 Number Guessing</h1>
          <p>I'm thinking of a number between 1 and ${maxNum}</p>
        </div>
        <div class="game-container">
          <div class="score-bar">
            <div class="score-item"><span class="score-label">Attempts</span><span class="score-value">${attempts}</span></div>
          </div>
          ${won ? `
            <div class="number-display">🎉 ${secret}</div>
            <div class="message success">You found it in ${attempts} attempt${attempts > 1 ? 's' : ''}!</div>
            <div class="game-actions">
              <button class="btn btn-primary" id="ng-retry">Play Again</button>
              <a href="#" class="btn btn-secondary">All Games</a>
            </div>
          ` : `
            <div class="number-display">?</div>
            <div class="hint-text">${history.length > 0 ? history[history.length - 1].hint : 'Enter your guess below'}</div>
            <div style="display:flex;gap:10px;max-width:400px;margin:0 auto;">
              <input type="number" class="game-input" id="ng-input" min="1" max="${maxNum}" placeholder="Your guess..." autofocus />
              <button class="btn btn-primary" id="ng-submit">Guess</button>
            </div>
            ${history.length > 0 ? `
              <div style="margin-top:1.5rem;display:flex;flex-direction:column;gap:6px;align-items:center;">
                ${history.map(h => `
                  <div style="display:flex;align-items:center;gap:10px;font-size:0.9rem;color:var(--text-secondary);">
                    <span style="font-weight:700;color:var(--text-primary);width:40px;text-align:right;">${h.guess}</span>
                    <span>${h.dir === 'up' ? '⬆️ Higher' : '⬇️ Lower'}</span>
                  </div>
                `).join('')}
              </div>
            ` : ''}
          `}
        </div>
      </div>
    `;

    if (!won) {
      const input = document.getElementById('ng-input');
      const submit = document.getElementById('ng-submit');
      const doGuess = () => {
        const val = parseInt(input.value);
        if (isNaN(val) || val < 1 || val > maxNum) return;
        attempts++;
        if (val === secret) {
          won = true;
        } else {
          history.push({ guess: val, dir: val < secret ? 'up' : 'down', hint: val < secret ? `📈 ${val} is too low! Go higher!` : `📉 ${val} is too high! Go lower!` });
        }
        render();
      };
      submit.addEventListener('click', doGuess);
      input.addEventListener('keydown', (e) => { if (e.key === 'Enter') doGuess(); });
      input.focus();
    } else {
      document.getElementById('ng-retry')?.addEventListener('click', init);
    }
  }

  init();
}

const CHOICES = ['🪨', '📄', '✂️'];
const NAMES = ['Rock', 'Paper', 'Scissors'];

export function renderRPS(container) {
  let playerScore = 0;
  let cpuScore = 0;
  let rounds = 0;
  let lastResult = null;
  let playerChoice = null;
  let cpuChoice = null;

  function getResult(p, c) {
    if (p === c) return 'draw';
    if ((p === 0 && c === 2) || (p === 1 && c === 0) || (p === 2 && c === 1)) return 'win';
    return 'lose';
  }

  function render() {
    container.innerHTML = `
      <div class="game-page">
        <div class="game-header">
          <h1>✂️ Rock Paper Scissors</h1>
          <p>Best of luck against the computer!</p>
        </div>
        <div class="game-container">
          <div class="score-bar">
            <div class="score-item"><span class="score-label">You</span><span class="score-value">${playerScore}</span></div>
            <div class="score-item"><span class="score-label">Rounds</span><span class="score-value">${rounds}</span></div>
            <div class="score-item"><span class="score-label">CPU</span><span class="score-value">${cpuScore}</span></div>
          </div>
          <div class="rps-arena">
            <div class="rps-choice ${lastResult === 'win' ? 'win' : lastResult === 'lose' ? 'lose' : lastResult === 'draw' ? 'draw' : ''}" id="rps-player">
              ${playerChoice !== null ? CHOICES[playerChoice] : '❓'}
            </div>
            <div class="rps-vs">VS</div>
            <div class="rps-choice ${lastResult === 'lose' ? 'win' : lastResult === 'win' ? 'lose' : lastResult === 'draw' ? 'draw' : ''}" id="rps-cpu">
              ${cpuChoice !== null ? CHOICES[cpuChoice] : '❓'}
            </div>
          </div>
          ${lastResult ? `
            <div class="message ${lastResult === 'win' ? 'success' : lastResult === 'lose' ? 'error' : 'info'}">
              ${lastResult === 'win' ? '🎉 You Win!' : lastResult === 'lose' ? '😢 You Lose!' : '🤝 Draw!'}
              ${playerChoice !== null ? `${NAMES[playerChoice]} vs ${NAMES[cpuChoice]}` : ''}
            </div>
          ` : `
            <div class="hint-text">Choose your weapon!</div>
          `}
          <div class="rps-buttons" style="margin-top:1.5rem;">
            ${CHOICES.map((ch, i) => `
              <button class="rps-btn" data-choice="${i}" title="${NAMES[i]}">${ch}</button>
            `).join('')}
          </div>
          <div class="game-actions" style="margin-top:1rem;">
            <button class="btn btn-secondary" id="rps-reset">Reset Score</button>
            <a href="#" class="btn btn-secondary">All Games</a>
          </div>
        </div>
      </div>
    `;

    document.querySelectorAll('.rps-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const p = parseInt(btn.dataset.choice);
        const c = Math.floor(Math.random() * 3);
        playerChoice = p;
        cpuChoice = c;
        lastResult = getResult(p, c);
        rounds++;
        if (lastResult === 'win') playerScore++;
        if (lastResult === 'lose') cpuScore++;
        render();
      });
    });

    document.getElementById('rps-reset').addEventListener('click', () => {
      playerScore = 0;
      cpuScore = 0;
      rounds = 0;
      lastResult = null;
      playerChoice = null;
      cpuChoice = null;
      render();
    });
  }

  render();
}

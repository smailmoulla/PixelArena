import { FLAGS } from '../data/flags.js';

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function renderFlag(container) {
  let score = 0;
  let round = 0;
  const totalRounds = 10;
  let answered = false;
  let gameFlags = [];

  function getQuestion() {
    const correct = gameFlags[round - 1];
    let options = [correct];
    while (options.length < 4) {
      const pick = FLAGS[Math.floor(Math.random() * FLAGS.length)];
      if (!options.find(o => o.code === pick.code)) options.push(pick);
    }
    return { correct, options: shuffle(options) };
  }

  function renderRound() {
    answered = false;
    round++;
    if (round > totalRounds) return showResult();
    const q = getQuestion();

    container.innerHTML = `
      <div class="game-page">
        <div class="game-header">
          <h1>🏴 Guess the Flag</h1>
          <p>Round ${round} of ${totalRounds}</p>
        </div>
        <div class="game-container">
          <div class="score-bar">
            <div class="score-item"><span class="score-label">Score</span><span class="score-value" id="flag-score">${score}</span></div>
            <div class="score-item"><span class="score-label">Round</span><span class="score-value">${round}/${totalRounds}</span></div>
          </div>
          <img class="flag-img" src="https://flagcdn.com/w320/${q.correct.code.toLowerCase()}.png" alt="Flag" id="flag-image" />
          <div class="flag-options" id="flag-options">
            ${q.options.map(o => `<button class="btn-option" data-code="${o.code}">${o.name}</button>`).join('')}
          </div>
          <div id="flag-msg"></div>
        </div>
      </div>
    `;

    document.getElementById('flag-options').addEventListener('click', (e) => {
      if (answered || !e.target.matches('.btn-option')) return;
      answered = true;
      const selected = e.target.dataset.code;
      const buttons = document.querySelectorAll('.btn-option');
      buttons.forEach(btn => {
        if (btn.dataset.code === q.correct.code) btn.classList.add('correct');
        else if (btn.dataset.code === selected) btn.classList.add('wrong');
        btn.style.pointerEvents = 'none';
      });
      if (selected === q.correct.code) {
        score++;
        document.getElementById('flag-score').textContent = score;
      }
      setTimeout(renderRound, 1200);
    });
  }

  function showResult() {
    container.innerHTML = `
      <div class="game-over-overlay">
        <div class="game-over-card">
          <div class="emoji">${score >= 8 ? '🏆' : score >= 5 ? '👏' : '😅'}</div>
          <h2>${score >= 8 ? 'Amazing!' : score >= 5 ? 'Good Job!' : 'Keep Trying!'}</h2>
          <div class="final-score">${score} / ${totalRounds}</div>
          <p>You identified ${score} flags correctly!</p>
          <div class="game-actions">
            <button class="btn btn-primary" id="flag-retry">Play Again</button>
            <a href="#" class="btn btn-secondary">All Games</a>
          </div>
        </div>
      </div>
    `;
    document.getElementById('flag-retry').addEventListener('click', () => {
      score = 0; round = 0; gameFlags = shuffle(FLAGS).slice(0, totalRounds); renderRound();
    });
  }

  gameFlags = shuffle(FLAGS).slice(0, totalRounds);
  renderRound();
}

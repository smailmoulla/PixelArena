import { QUESTIONS } from '../data/trivia.js';

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function renderTrivia(container) {
  let questions = [];
  let current = 0;
  let score = 0;
  let answered = false;
  const total = 10;

  function init() {
    questions = shuffle(QUESTIONS).slice(0, total);
    current = 0;
    score = 0;
    answered = false;
    renderQ();
  }

  function renderQ() {
    if (current >= total) return showResult();
    answered = false;
    const q = questions[current];
    container.innerHTML = `
      <div class="game-page">
        <div class="game-header">
          <h1>📝 Trivia Quiz</h1>
          <p>Question ${current + 1} of ${total}</p>
        </div>
        <div class="game-container">
          <div class="score-bar">
            <div class="score-item"><span class="score-label">Score</span><span class="score-value">${score}</span></div>
          </div>
          <div class="trivia-progress"><div class="trivia-progress-fill" style="width:${((current) / total) * 100}%"></div></div>
          <div class="trivia-question">${q.q}</div>
          <div class="trivia-options" id="trivia-opts">
            ${q.options.map((o, i) => `<button class="btn-option" data-idx="${i}">${o}</button>`).join('')}
          </div>
          <div id="trivia-msg"></div>
        </div>
      </div>
    `;

    document.getElementById('trivia-opts').addEventListener('click', (e) => {
      if (answered || !e.target.matches('.btn-option')) return;
      answered = true;
      const idx = parseInt(e.target.dataset.idx);
      const buttons = document.querySelectorAll('.btn-option');
      buttons.forEach((btn, i) => {
        if (i === q.answer) btn.classList.add('correct');
        else if (i === idx) btn.classList.add('wrong');
        btn.style.pointerEvents = 'none';
      });
      if (idx === q.answer) score++;
      current++;
      setTimeout(renderQ, 1000);
    });
  }

  function showResult() {
    container.innerHTML = `
      <div class="game-over-overlay">
        <div class="game-over-card">
          <div class="emoji">${score >= 8 ? '🏆' : score >= 5 ? '👏' : '😅'}</div>
          <h2>${score >= 8 ? 'Genius!' : score >= 5 ? 'Well Done!' : 'Study More!'}</h2>
          <div class="final-score">${score} / ${total}</div>
          <p>You answered ${score} questions correctly!</p>
          <div class="game-actions">
            <button class="btn btn-primary" id="trivia-retry">Play Again</button>
            <a href="#" class="btn btn-secondary">All Games</a>
          </div>
        </div>
      </div>
    `;
    document.getElementById('trivia-retry').addEventListener('click', init);
  }

  init();
}

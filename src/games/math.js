export function renderMathChallenge(container) {
  let score = 0;
  let timeLeft = 60;
  let problem = null;
  let timer = null;
  let gameActive = false;

  function generateProblem() {
    const ops = ['+', '-', '×'];
    const op = ops[Math.floor(Math.random() * ops.length)];
    let a, b, answer;
    switch (op) {
      case '+':
        a = Math.floor(Math.random() * 50) + 10;
        b = Math.floor(Math.random() * 50) + 10;
        answer = a + b;
        break;
      case '-':
        a = Math.floor(Math.random() * 50) + 20;
        b = Math.floor(Math.random() * a);
        answer = a - b;
        break;
      case '×':
        a = Math.floor(Math.random() * 12) + 2;
        b = Math.floor(Math.random() * 12) + 2;
        answer = a * b;
        break;
    }
    return { text: `${a} ${op} ${b}`, answer };
  }

  function start() {
    score = 0;
    timeLeft = 60;
    gameActive = true;
    problem = generateProblem();
    render();

    timer = setInterval(() => {
      timeLeft--;
      const timeEl = document.getElementById('math-time');
      const fillEl = document.getElementById('math-timer-fill');
      if (timeEl) timeEl.textContent = timeLeft + 's';
      if (fillEl) {
        fillEl.style.width = (timeLeft / 60) * 100 + '%';
        if (timeLeft <= 15) fillEl.classList.add('danger');
      }
      if (timeLeft <= 0) {
        clearInterval(timer);
        gameActive = false;
        showResult();
      }
    }, 1000);
  }

  function render() {
    container.innerHTML = `
      <div class="game-page">
        <div class="game-header">
          <h1>🧮 Math Challenge</h1>
          <p>Solve as many as you can in 60 seconds!</p>
        </div>
        <div class="game-container">
          ${!gameActive && score === 0 ? `
            <div style="text-align:center;padding:3rem 0;">
              <div style="font-size:4rem;margin-bottom:1rem;">🧮</div>
              <p style="color:var(--text-secondary);margin-bottom:2rem;">Solve math problems as fast as you can!<br/>You have 60 seconds.</p>
              <button class="btn btn-primary" id="math-start" style="font-size:1.1rem;padding:14px 40px;">Start Challenge</button>
            </div>
          ` : `
            <div class="score-bar">
              <div class="score-item"><span class="score-label">Score</span><span class="score-value">${score}</span></div>
              <div class="score-item"><span class="score-label">Time</span><span class="score-value" id="math-time">${timeLeft}s</span></div>
            </div>
            <div class="timer-bar"><div class="timer-fill ${timeLeft <= 15 ? 'danger' : ''}" id="math-timer-fill" style="width:${(timeLeft / 60) * 100}%"></div></div>
            <div class="math-problem">${problem.text} = ?</div>
            <div style="display:flex;gap:10px;max-width:400px;margin:0 auto;">
              <input type="number" class="game-input" id="math-input" placeholder="Answer..." autofocus />
              <button class="btn btn-primary" id="math-submit">→</button>
            </div>
            <div id="math-msg" style="min-height:50px;"></div>
          `}
        </div>
      </div>
    `;

    if (!gameActive && score === 0) {
      document.getElementById('math-start')?.addEventListener('click', start);
    } else if (gameActive) {
      const input = document.getElementById('math-input');
      const submit = document.getElementById('math-submit');
      const doSubmit = () => {
        const val = parseInt(input.value);
        if (isNaN(val)) return;
        if (val === problem.answer) {
          score++;
          problem = generateProblem();
          render();
        } else {
          const msg = document.getElementById('math-msg');
          if (msg) msg.innerHTML = `<div class="message error">❌ Wrong! Try again.</div>`;
          input.value = '';
          input.focus();
        }
      };
      submit.addEventListener('click', doSubmit);
      input.addEventListener('keydown', (e) => { if (e.key === 'Enter') doSubmit(); });
      input.focus();
    }
  }

  function showResult() {
    container.innerHTML = `
      <div class="game-over-overlay">
        <div class="game-over-card">
          <div class="emoji">${score >= 20 ? '🏆' : score >= 10 ? '🔥' : '💪'}</div>
          <h2>${score >= 20 ? 'Math Genius!' : score >= 10 ? 'Great Job!' : 'Keep Practicing!'}</h2>
          <div class="final-score">${score}</div>
          <p>You solved ${score} problems in 60 seconds!</p>
          <div class="game-actions">
            <button class="btn btn-primary" id="math-retry">Play Again</button>
            <a href="#" class="btn btn-secondary">All Games</a>
          </div>
        </div>
      </div>
    `;
    document.getElementById('math-retry').addEventListener('click', () => { start(); });
  }

  render();
  return () => { if (timer) clearInterval(timer); };
}

import { questions } from '../data/questions.js';
import { moreQuestions } from '../data/q2.js';

const allQuestions = [...questions, ...moreQuestions];

export function renderQuizDuel(container) {

  const TOTAL_QUESTIONS = 10;
  const TIME_PER_Q = 15;

  let pool, currentQ, qIndex, playerScore, selected, timer, timeLeft, answered;

  function init() {
    pool = [...allQuestions].sort(() => Math.random() - 0.5).slice(0, TOTAL_QUESTIONS);
    qIndex = 0; playerScore = 0;
    nextQuestion();
  }

  function nextQuestion() {
    if (qIndex >= TOTAL_QUESTIONS) { showResult(); return; }
    currentQ = pool[qIndex];
    selected = null; answered = false; timeLeft = TIME_PER_Q;
    render();
    startTimer();
  }

  function startTimer() {
    clearInterval(timer);
    timer = setInterval(() => {
      timeLeft--;
      const fill = document.getElementById('qd-timer-fill');
      if (fill) fill.style.width = (timeLeft / TIME_PER_Q * 100) + '%';
      if (timeLeft <= 5 && fill) fill.style.background = 'linear-gradient(90deg,#ef4444,#f97316)';
      if (timeLeft <= 0) { clearInterval(timer); autoAnswer(); }
    }, 1000);
  }

  function autoAnswer() {
    if (answered) return;
    answered = true;
    showAnswerFeedback(-1);
  }

  function playerAnswer(idx) {
    if (answered) return;
    clearInterval(timer);
    answered = true;
    selected = idx;
    const correct = idx === currentQ.ans;
    if (correct) playerScore++;
    showAnswerFeedback(idx);
  }

  function showAnswerFeedback(playerIdx) {
    const btns = document.querySelectorAll('.qd-option');
    btns.forEach((btn, i) => {
      btn.disabled = true;
      if (i === currentQ.ans) btn.classList.add('correct');
      else if (i === playerIdx && i !== currentQ.ans) btn.classList.add('wrong');
    });

    setTimeout(() => {
      qIndex++;
      nextQuestion();
    }, 1800);
  }

  function showResult() {
    container.innerHTML = `
      <div class="game-page">
        <div class="game-header"><h1>🧠 Quiz Solo</h1></div>
        <div class="game-container" style="text-align:center;">
          <div style="font-size:3rem;margin-bottom:1rem;">${playerScore >= 7 ? '🏆' : playerScore >= 4 ? '👏' : '😅'}</div>
          <h2 style="font-size:1.8rem;font-weight:700;margin-bottom:1rem;">${playerScore >= 7 ? 'Excellent!' : playerScore >= 4 ? 'Good Job!' : 'Keep Trying!'}</h2>
          <div style="font-size:4rem;font-weight:700;color:#667eea;margin:1.5rem 0;">${playerScore} / ${TOTAL_QUESTIONS}</div>
          <p style="opacity:0.7;margin-bottom:1.5rem;">questions answered correctly</p>
          <div class="game-actions">
            <button class="btn btn-primary" id="qd-retry">Play Again</button>
            <a href="#" class="btn btn-secondary">All Games</a>
          </div>
        </div>
      </div>`;
    document.getElementById('qd-retry')?.addEventListener('click', init);
  }

  function render() {
    container.innerHTML = `
      <div class="game-page">
        <div class="game-header">
          <h1>🧠 Quiz Solo</h1>
          <p>${TOTAL_QUESTIONS} questions, ${TIME_PER_Q}s each</p>
        </div>
        <div class="game-container">
          <div class="score-bar">
            <div class="score-item"><span class="score-label">Score</span><span class="score-value" style="color:#667eea;">${playerScore}</span></div>
            <div class="score-item"><span class="score-label">Question</span><span class="score-value">${qIndex + 1}/${TOTAL_QUESTIONS}</span></div>
          </div>
          <div class="timer-bar"><div id="qd-timer-fill" class="timer-fill" style="width:100%;"></div></div>
          <div style="font-size:1.25rem;font-weight:600;text-align:center;margin:1.5rem 0;line-height:1.4;">${currentQ.q}</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;max-width:560px;margin:0 auto;">
            ${currentQ.options.map((opt, i) => `
              <button class="qd-option btn btn-secondary" data-idx="${i}" style="text-align:left;padding:0.9rem 1.1rem;font-size:0.95rem;">
                <span style="font-weight:700;margin-right:8px;opacity:0.5;">${String.fromCharCode(65+i)}.</span>${opt}
              </button>
            `).join('')}
          </div>
        </div>
      </div>`;

    container.querySelectorAll('.qd-option').forEach(btn => {
      btn.addEventListener('click', () => playerAnswer(parseInt(btn.dataset.idx)));
    });
  }

  init();
  return () => clearInterval(timer);
}

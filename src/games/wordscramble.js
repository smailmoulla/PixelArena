import { SCRAMBLE_WORDS as WORDS } from '../data/scramble.js';

function scramble(word) {
  const arr = word.split('');
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  // Make sure it's different
  if (arr.join('') === word) return scramble(word);
  return arr.join('');
}

export function renderWordScramble(container) {
  let score = 0;
  let round = 0;
  const totalRounds = 10;
  let currentWord = '';
  let scrambled = '';
  let hintUsed = false;

  function nextRound() {
    round++;
    if (round > totalRounds) return showResult();
    currentWord = WORDS[Math.floor(Math.random() * WORDS.length)];
    scrambled = scramble(currentWord);
    hintUsed = false;
    render();
  }

  function render() {
    container.innerHTML = `
      <div class="game-page">
        <div class="game-header">
          <h1>🔤 Word Scramble</h1>
          <p>Round ${round} of ${totalRounds}</p>
        </div>
        <div class="game-container">
          <div class="score-bar">
            <div class="score-item"><span class="score-label">Score</span><span class="score-value">${score}</span></div>
            <div class="score-item"><span class="score-label">Round</span><span class="score-value">${round}/${totalRounds}</span></div>
          </div>
          <div class="scramble-word">
            ${scrambled.split('').map((l, i) => `<div class="scramble-letter" style="animation-delay:${i * 0.05}s">${l}</div>`).join('')}
          </div>
          <div id="ws-hint" style="text-align:center;color:var(--text-secondary);margin-bottom:1rem;min-height:24px;"></div>
          <div style="display:flex;gap:10px;max-width:500px;margin:0 auto;">
            <input type="text" class="game-input" id="ws-input" placeholder="Your answer..." autofocus autocomplete="off" />
            <button class="btn btn-primary" id="ws-submit">Submit</button>
          </div>
          <div style="text-align:center;margin-top:1rem;">
            <button class="btn btn-secondary" id="ws-hint-btn" ${hintUsed ? 'disabled style="opacity:0.5"' : ''}>💡 Hint</button>
            <button class="btn btn-secondary" id="ws-skip" style="margin-left:8px;">⏭️ Skip</button>
          </div>
          <div id="ws-msg"></div>
        </div>
      </div>
    `;

    const input = document.getElementById('ws-input');
    const submit = document.getElementById('ws-submit');
    const hintBtn = document.getElementById('ws-hint-btn');
    const skipBtn = document.getElementById('ws-skip');

    const doSubmit = () => {
      const answer = input.value.trim().toUpperCase();
      if (!answer) return;
      if (answer === currentWord) {
        score++;
        document.getElementById('ws-msg').innerHTML = `<div class="message success">✅ Correct!</div>`;
        setTimeout(nextRound, 800);
      } else {
        document.getElementById('ws-msg').innerHTML = `<div class="message error">❌ Try again!</div>`;
        input.value = '';
        input.focus();
      }
    };

    submit.addEventListener('click', doSubmit);
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') doSubmit(); });
    input.focus();

    hintBtn.addEventListener('click', () => {
      if (hintUsed) return;
      hintUsed = true;
      const hint = `First letter: ${currentWord[0]}, Last letter: ${currentWord[currentWord.length - 1]}, ${currentWord.length} letters`;
      document.getElementById('ws-hint').textContent = '💡 ' + hint;
      hintBtn.disabled = true;
      hintBtn.style.opacity = '0.5';
    });

    skipBtn.addEventListener('click', () => {
      document.getElementById('ws-msg').innerHTML = `<div class="message info">The word was: ${currentWord}</div>`;
      setTimeout(nextRound, 1200);
    });
  }

  function showResult() {
    container.innerHTML = `
      <div class="game-over-overlay">
        <div class="game-over-card">
          <div class="emoji">${score >= 8 ? '🏆' : score >= 5 ? '👏' : '😅'}</div>
          <h2>${score >= 8 ? 'Word Wizard!' : score >= 5 ? 'Nice Work!' : 'Keep Trying!'}</h2>
          <div class="final-score">${score} / ${totalRounds}</div>
          <p>You unscrambled ${score} words!</p>
          <div class="game-actions">
            <button class="btn btn-primary" id="ws-retry">Play Again</button>
            <a href="#" class="btn btn-secondary">All Games</a>
          </div>
        </div>
      </div>
    `;
    document.getElementById('ws-retry').addEventListener('click', () => { score = 0; round = 0; nextRound(); });
  }

  nextRound();
}

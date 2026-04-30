import { WORDS } from '../data/words.js';

const HANGMAN_PARTS = [
  // head
  `<circle cx="150" cy="65" r="18" stroke="currentColor" stroke-width="3" fill="none"/>`,
  // body
  `<line x1="150" y1="83" x2="150" y2="140" stroke="currentColor" stroke-width="3"/>`,
  // left arm
  `<line x1="150" y1="100" x2="120" y2="125" stroke="currentColor" stroke-width="3"/>`,
  // right arm
  `<line x1="150" y1="100" x2="180" y2="125" stroke="currentColor" stroke-width="3"/>`,
  // left leg
  `<line x1="150" y1="140" x2="125" y2="175" stroke="currentColor" stroke-width="3"/>`,
  // right leg
  `<line x1="150" y1="140" x2="175" y2="175" stroke="currentColor" stroke-width="3"/>`,
];

export function renderHangman(container) {
  let word = '';
  let guessed = new Set();
  let wrong = 0;
  const maxWrong = 6;

  function init() {
    word = WORDS[Math.floor(Math.random() * WORDS.length)];
    guessed = new Set();
    wrong = 0;
    render();
  }

  function render() {
    const won = word.split('').every(l => guessed.has(l));
    const lost = wrong >= maxWrong;

    container.innerHTML = `
      <div class="game-page">
        <div class="game-header">
          <h1>🎯 Hangman</h1>
          <p>Guess the word before it's too late!</p>
        </div>
        <div class="game-container">
          <div class="score-bar">
            <div class="score-item"><span class="score-label">Wrong</span><span class="score-value">${wrong}/${maxWrong}</span></div>
          </div>
          <svg class="hangman-svg" width="300" height="200" viewBox="0 0 300 200" style="color: var(--accent-2);">
            <!-- gallows -->
            <line x1="60" y1="190" x2="240" y2="190" stroke="var(--text-muted)" stroke-width="3"/>
            <line x1="100" y1="190" x2="100" y2="20" stroke="var(--text-muted)" stroke-width="3"/>
            <line x1="100" y1="20" x2="150" y2="20" stroke="var(--text-muted)" stroke-width="3"/>
            <line x1="150" y1="20" x2="150" y2="47" stroke="var(--text-muted)" stroke-width="3"/>
            ${HANGMAN_PARTS.slice(0, wrong).join('')}
          </svg>
          <div class="hangman-word">
            ${word.split('').map(l => `<div class="hangman-letter">${guessed.has(l) || lost ? l : ''}</div>`).join('')}
          </div>
          ${won ? `<div class="message success">🎉 You won! The word was "${word}"</div>` :
            lost ? `<div class="message error">💀 Game Over! The word was "${word}"</div>` : ''}
          ${!won && !lost ? `
            <div class="hangman-keyboard" id="hm-keyboard">
              ${'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(l => {
                const used = guessed.has(l);
                const hit = used && word.includes(l);
                const miss = used && !word.includes(l);
                return `<button class="key-btn ${used ? 'used' : ''} ${hit ? 'hit' : ''} ${miss ? 'miss' : ''}" data-letter="${l}" ${used ? 'disabled' : ''}>${l}</button>`;
              }).join('')}
            </div>
          ` : `
            <div class="game-actions">
              <button class="btn btn-primary" id="hm-retry">Play Again</button>
              <a href="#" class="btn btn-secondary">All Games</a>
            </div>
          `}
        </div>
      </div>
    `;

    if (!won && !lost) {
      document.getElementById('hm-keyboard').addEventListener('click', (e) => {
        if (!e.target.matches('.key-btn') || e.target.disabled) return;
        guess(e.target.dataset.letter);
      });
    } else {
      const retry = document.getElementById('hm-retry');
      if (retry) retry.addEventListener('click', init);
    }
  }

  function guess(letter) {
    if (guessed.has(letter)) return;
    const won = word.split('').every(l => guessed.has(l));
    const lost = wrong >= maxWrong;
    if (won || lost) return;
    guessed.add(letter);
    if (!word.includes(letter)) wrong++;
    render();
  }

  const keyHandler = (e) => {
    if (/^[a-zA-Z]$/.test(e.key)) guess(e.key.toUpperCase());
  };
  document.addEventListener('keydown', keyHandler);

  init();

  return () => document.removeEventListener('keydown', keyHandler);
}

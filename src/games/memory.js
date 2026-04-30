const ALL_EMOJIS = [
  '🎮', '🎲', '🎯', '🏆', '⚡', '🔥', '💎', '🌟',
  '🎸', '🎺', '🎨', '🎭', '🚀', '🌈', '🦄', '🐉',
  '🍕', '🍔', '🎂', '🍩', '🌺', '🌻', '🍀', '🌙',
  '🦋', '🐬', '🦊', '🐧', '🎪', '🎠', '🗿', '👑',
];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function renderMemory(container) {
  let cards = [];
  let flipped = [];
  let matched = new Set();
  let moves = 0;
  let locked = false;
  let level = 1;
  let pairsCount = 4; // Start with 4 pairs, grows each level

  function getPairsForLevel(lvl) {
    // Level 1: 4 pairs (4x2), Level 2: 6 pairs (4x3), Level 3: 8 pairs (4x4)
    // Level 4: 10 pairs (4x5), Level 5+: 12 pairs (4x6)
    const pairs = [4, 6, 8, 10, 12];
    return pairs[Math.min(lvl - 1, pairs.length - 1)];
  }

  function getGridCols(numCards) {
    if (numCards <= 8) return 4;
    if (numCards <= 12) return 4;
    if (numCards <= 16) return 4;
    if (numCards <= 20) return 5;
    return 6;
  }

  function init(newLevel) {
    level = newLevel || 1;
    pairsCount = getPairsForLevel(level);
    const pairs = shuffle(ALL_EMOJIS).slice(0, pairsCount);
    cards = shuffle([...pairs, ...pairs]);
    flipped = [];
    matched = new Set();
    moves = 0;
    locked = false;
    render();
  }

  function render() {
    const won = matched.size === cards.length;
    const cols = getGridCols(cards.length);

    container.innerHTML = `
      <div class="game-page">
        <div class="game-header">
          <h1>🧠 Memory Match</h1>
          <p>${won ? 'Level Complete!' : `Level ${level} — Find all ${pairsCount} pairs!`}</p>
        </div>
        <div class="game-container">
          <div class="score-bar">
            <div class="score-item"><span class="score-label">Level</span><span class="score-value">${level}</span></div>
            <div class="score-item"><span class="score-label">Moves</span><span class="score-value" id="mem-moves">${moves}</span></div>
            <div class="score-item"><span class="score-label">Pairs</span><span class="score-value">${matched.size / 2}/${pairsCount}</span></div>
          </div>
          <div class="memory-grid" id="mem-grid" style="grid-template-columns: repeat(${cols}, 1fr);">
            ${cards.map((emoji, i) => {
              const isFlipped = flipped.includes(i) || matched.has(i);
              const isMatched = matched.has(i);
              return `
                <div class="memory-cell ${isFlipped ? 'flipped' : ''} ${isMatched ? 'matched' : ''}" data-index="${i}">
                  <div class="memory-cell-inner">
                    <div class="memory-front">❓</div>
                    <div class="memory-back">${emoji}</div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
          ${won ? `
            <div class="message success" style="margin-top:1.5rem">
              🎉 Level ${level} complete in ${moves} moves!
              ${level < 5 ? ' Ready for a bigger challenge?' : ' You mastered all levels!'}
            </div>
            <div class="game-actions">
              ${level < 5 ? `<button class="btn btn-primary" id="mem-next">Next Level →</button>` : ''}
              <button class="btn ${level < 5 ? 'btn-secondary' : 'btn-primary'}" id="mem-retry">Play Again (Lvl 1)</button>
              <a href="#" class="btn btn-secondary">All Games</a>
            </div>
          ` : ''}
        </div>
      </div>
    `;

    if (!won) {
      document.getElementById('mem-grid').addEventListener('click', (e) => {
        if (locked) return;
        const cell = e.target.closest('.memory-cell');
        if (!cell) return;
        const idx = parseInt(cell.dataset.index);
        if (flipped.includes(idx) || matched.has(idx)) return;

        flipped.push(idx);
        cell.classList.add('flipped');

        if (flipped.length === 2) {
          moves++;
          locked = true;
          const [a, b] = flipped;
          if (cards[a] === cards[b]) {
            matched.add(a);
            matched.add(b);
            flipped = [];
            locked = false;
            render();
          } else {
            setTimeout(() => {
              flipped = [];
              locked = false;
              render();
            }, 800);
          }
        }
      });
    } else {
      document.getElementById('mem-next')?.addEventListener('click', () => init(level + 1));
      document.getElementById('mem-retry')?.addEventListener('click', () => init(1));
    }
  }

  init(1);
}

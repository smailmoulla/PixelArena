function randomColor() {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);
  return { r, g, b, hex: `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}` };
}

function varyColor(base, range) {
  const vary = (v) => Math.min(255, Math.max(0, v + Math.floor((Math.random() - 0.5) * range * 2)));
  const r = vary(base.r);
  const g = vary(base.g);
  const b = vary(base.b);
  return { r, g, b, hex: `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}` };
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function renderColorGuess(container) {
  let score = 0;
  let round = 0;
  const totalRounds = 10;
  let answered = false;

  function renderRound() {
    answered = false;
    round++;
    if (round > totalRounds) return showResult();

    const correct = randomColor();
    let options = [correct];
    while (options.length < 4) {
      options.push(varyColor(correct, 40 + Math.random() * 40));
    }
    options = shuffle(options);

    container.innerHTML = `
      <div class="game-page">
        <div class="game-header">
          <h1>🎨 Color Guessing</h1>
          <p>Which hex code matches this color?</p>
        </div>
        <div class="game-container">
          <div class="score-bar">
            <div class="score-item"><span class="score-label">Score</span><span class="score-value">${score}</span></div>
            <div class="score-item"><span class="score-label">Round</span><span class="score-value">${round}/${totalRounds}</span></div>
          </div>
          <div class="color-swatch" style="background:${correct.hex}"></div>
          <div class="color-options" id="color-opts">
            ${options.map(o => `<button class="btn-option" data-hex="${o.hex}" style="text-align:center;font-family:monospace;font-size:1.1rem;">${o.hex.toUpperCase()}</button>`).join('')}
          </div>
          <div id="color-msg"></div>
        </div>
      </div>
    `;

    document.getElementById('color-opts').addEventListener('click', (e) => {
      if (answered || !e.target.matches('.btn-option')) return;
      answered = true;
      const picked = e.target.dataset.hex;
      document.querySelectorAll('.btn-option').forEach(btn => {
        if (btn.dataset.hex === correct.hex) btn.classList.add('correct');
        else if (btn.dataset.hex === picked) btn.classList.add('wrong');
        btn.style.pointerEvents = 'none';
      });
      if (picked === correct.hex) score++;
      setTimeout(renderRound, 1000);
    });
  }

  function showResult() {
    container.innerHTML = `
      <div class="game-over-overlay">
        <div class="game-over-card">
          <div class="emoji">${score >= 8 ? '🎨' : score >= 5 ? '👏' : '😅'}</div>
          <h2>${score >= 8 ? 'Color Master!' : score >= 5 ? 'Good Eye!' : 'Keep Practicing!'}</h2>
          <div class="final-score">${score} / ${totalRounds}</div>
          <p>You identified ${score} colors correctly!</p>
          <div class="game-actions">
            <button class="btn btn-primary" id="color-retry">Play Again</button>
            <a href="#" class="btn btn-secondary">All Games</a>
          </div>
        </div>
      </div>
    `;
    document.getElementById('color-retry').addEventListener('click', () => { score = 0; round = 0; renderRound(); });
  }

  renderRound();
}

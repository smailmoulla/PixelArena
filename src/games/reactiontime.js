export function renderReactionTime(container) {
  let phase = 'idle'; // idle | waiting | ready | result
  let timeout, startTime, reactionMs;
  let scores = [];

  function start() {
    phase = 'waiting';
    render();
    const delay = 2000 + Math.random() * 3000;
    timeout = setTimeout(() => {
      phase = 'ready';
      startTime = performance.now();
      render();
    }, delay);
  }

  function handleClick() {
    if (phase === 'idle') { start(); return; }
    if (phase === 'waiting') {
      clearTimeout(timeout);
      phase = 'toosoon';
      render();
      return;
    }
    if (phase === 'ready') {
      reactionMs = Math.round(performance.now() - startTime);
      scores.push(reactionMs);
      phase = 'result';
      render();
      return;
    }
    if (phase === 'result' || phase === 'toosoon') {
      start();
    }
  }

  function rating(ms) {
    if (ms < 150) return { label: '⚡ Superhuman!', color: '#6aaa64' };
    if (ms < 200) return { label: '🔥 Excellent!',  color: '#54a0ff' };
    if (ms < 250) return { label: '👍 Good',         color: '#feca57' };
    if (ms < 350) return { label: '😐 Average',      color: '#ff9f43' };
    return             { label: '🐢 Keep trying',    color: '#ff6b6b' };
  }

  function avg() {
    return scores.length ? Math.round(scores.reduce((a,b)=>a+b,0)/scores.length) : 0;
  }
  function best() {
    return scores.length ? Math.min(...scores) : 0;
  }

  function bgColor() {
    if (phase === 'waiting') return '#1a1a2e';
    if (phase === 'ready')   return '#6aaa64';
    if (phase === 'toosoon') return '#ff6b6b';
    return 'var(--bg-card,#fff)';
  }

  function render() {
    container.innerHTML = `
      <div class="game-page">
        <div class="game-header">
          <h1>⚡ Reaction Time</h1>
          <p>Test how fast your reflexes are!</p>
        </div>
        <div class="game-container">
          ${scores.length > 0 ? `
            <div class="score-bar">
              <div class="score-item"><span class="score-label">Best</span><span class="score-value">${best()}ms</span></div>
              <div class="score-item"><span class="score-label">Average</span><span class="score-value">${avg()}ms</span></div>
              <div class="score-item"><span class="score-label">Rounds</span><span class="score-value">${scores.length}</span></div>
            </div>
          ` : ''}

          <div id="rt-box" style="
            background:${bgColor()};
            border-radius:20px;
            min-height:280px;
            display:flex;flex-direction:column;align-items:center;justify-content:center;
            cursor:pointer;
            transition:background 0.2s;
            user-select:none;
            padding:2rem;
            margin:0 auto;max-width:500px;
            box-shadow:0 8px 30px rgba(0,0,0,0.15);
          ">
            ${phase === 'idle' ? `
              <div style="font-size:4rem;">🎯</div>
              <div style="font-size:1.5rem;font-weight:700;color:var(--text-dark,#1a1a2e);margin-top:1rem;">Click to Start</div>
              <div style="color:var(--text-mid,#666);margin-top:0.5rem;">Click when the screen turns green</div>
            ` : phase === 'waiting' ? `
              <div style="font-size:4rem;">⏳</div>
              <div style="font-size:1.5rem;font-weight:700;color:#fff;margin-top:1rem;">Wait for green...</div>
              <div style="color:rgba(255,255,255,0.7);margin-top:0.5rem;">Don't click yet!</div>
            ` : phase === 'ready' ? `
              <div style="font-size:5rem;animation:pulse 0.3s;">🟢</div>
              <div style="font-size:2rem;font-weight:800;color:#fff;margin-top:0.5rem;">CLICK NOW!</div>
            ` : phase === 'toosoon' ? `
              <div style="font-size:4rem;">😬</div>
              <div style="font-size:1.5rem;font-weight:700;color:#fff;margin-top:1rem;">Too soon!</div>
              <div style="color:rgba(255,255,255,0.8);margin-top:0.5rem;">Click to try again</div>
            ` : (() => {
              const r = rating(reactionMs);
              return `
                <div style="font-size:2.5rem;font-weight:900;color:${r.color};">${reactionMs}ms</div>
                <div style="font-size:1.4rem;font-weight:700;color:var(--text-dark,#1a1a2e);margin-top:0.5rem;">${r.label}</div>
                <div style="color:var(--text-mid,#666);margin-top:0.5rem;font-size:0.9rem;">Click to go again</div>
              `;
            })()}
          </div>

          ${phase === 'idle' || phase === 'result' ? `
            <div style="margin-top:1.5rem;text-align:center;">
              <a href="#" class="btn btn-secondary">All Games</a>
            </div>
          ` : ''}
        </div>
      </div>
    `;

    document.getElementById('rt-box')?.addEventListener('click', handleClick);
  }

  render();
}

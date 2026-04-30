import { SENTENCES } from '../data/sentences.js';

export function renderSpeedTyping(container) {
  let text = '';
  let typed = '';
  let started = false;
  let startTime = 0;
  let finished = false;
  let timerInterval = null;
  let elapsed = 0;

  function init() {
    text = SENTENCES[Math.floor(Math.random() * SENTENCES.length)];
    typed = '';
    started = false;
    finished = false;
    elapsed = 0;
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = null;
    render();
  }

  function render() {
    const wpm = elapsed > 0 ? Math.round((typed.split(' ').filter(Boolean).length / elapsed) * 60) : 0;
    let correct = 0;
    for (let i = 0; i < typed.length; i++) {
      if (typed[i] === text[i]) correct++;
    }
    const accuracy = typed.length > 0 ? Math.round((correct / typed.length) * 100) : 100;

    container.innerHTML = `
      <div class="game-page">
        <div class="game-header">
          <h1>⌨️ Speed Typing</h1>
          <p>${!started ? 'Start typing to begin!' : finished ? 'Finished!' : 'Type the text below as fast as you can!'}</p>
        </div>
        <div class="game-container">
          <div class="score-bar">
            <div class="score-item"><span class="score-label">WPM</span><span class="score-value" id="st-wpm">${wpm}</span></div>
            <div class="score-item"><span class="score-label">Accuracy</span><span class="score-value" id="st-acc">${accuracy}%</span></div>
            <div class="score-item"><span class="score-label">Time</span><span class="score-value" id="st-time">${elapsed}s</span></div>
          </div>
          <div class="typing-text" id="st-display">
            ${text.split('').map((ch, i) => {
              if (i < typed.length) {
                return typed[i] === ch
                  ? `<span class="correct-char">${ch}</span>`
                  : `<span class="wrong-char">${ch}</span>`;
              } else if (i === typed.length) {
                return `<span class="current-char">${ch}</span>`;
              }
              return `<span class="pending-char">${ch}</span>`;
            }).join('')}
          </div>
          ${!finished ? `
            <input type="text" class="game-input" id="st-input" placeholder="Start typing here..." autofocus autocomplete="off" autocapitalize="off" />
          ` : `
            <div class="message success">🎉 ${wpm} WPM with ${accuracy}% accuracy!</div>
            <div class="game-actions">
              <button class="btn btn-primary" id="st-retry">Try Again</button>
              <a href="#" class="btn btn-secondary">All Games</a>
            </div>
          `}
        </div>
      </div>
    `;

    if (!finished) {
      const input = document.getElementById('st-input');
      input.focus();
      input.addEventListener('input', () => {
        if (!started) {
          started = true;
          startTime = Date.now();
          timerInterval = setInterval(() => {
            elapsed = Math.round((Date.now() - startTime) / 1000);
            const timeEl = document.getElementById('st-time');
            if (timeEl) timeEl.textContent = elapsed + 's';
            // Update WPM live
            const currentWPM = elapsed > 0 ? Math.round((typed.split(' ').filter(Boolean).length / elapsed) * 60) : 0;
            const wpmEl = document.getElementById('st-wpm');
            if (wpmEl) wpmEl.textContent = currentWPM;
          }, 1000);
        }
        typed = input.value;
        // Re-render display
        const display = document.getElementById('st-display');
        if (display) {
          display.innerHTML = text.split('').map((ch, i) => {
            if (i < typed.length) {
              return typed[i] === ch
                ? `<span class="correct-char">${ch}</span>`
                : `<span class="wrong-char">${ch}</span>`;
            } else if (i === typed.length) {
              return `<span class="current-char">${ch}</span>`;
            }
            return `<span class="pending-char">${ch}</span>`;
          }).join('');
        }
        // Update accuracy live
        let c = 0;
        for (let i = 0; i < typed.length; i++) {
          if (typed[i] === text[i]) c++;
        }
        const accEl = document.getElementById('st-acc');
        if (accEl) accEl.textContent = (typed.length > 0 ? Math.round((c / typed.length) * 100) : 100) + '%';

        if (typed.length >= text.length) {
          finished = true;
          elapsed = Math.round((Date.now() - startTime) / 1000);
          clearInterval(timerInterval);
          render();
        }
      });
    } else {
      document.getElementById('st-retry')?.addEventListener('click', init);
    }
  }

  init();
  return () => { if (timerInterval) clearInterval(timerInterval); };
}

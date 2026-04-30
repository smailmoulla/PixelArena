export const GAMES = [
  { id: 'flag', emoji: '🏴', title: 'Guess the Flag', desc: 'Can you identify countries by their flags? Test your geography knowledge!', difficulty: 'easy' },
  { id: 'hangman', emoji: '🎯', title: 'Hangman', desc: 'Classic word guessing game. Guess the word before the stickman is complete!', difficulty: 'medium' },
  { id: 'memory', emoji: '🧠', title: 'Memory Match', desc: 'Flip cards and find matching pairs. Train your memory!', difficulty: 'easy' },
  { id: 'trivia', emoji: '📝', title: 'Trivia Quiz', desc: 'Test your general knowledge with challenging multiple-choice questions.', difficulty: 'medium' },
  { id: 'numberguess', emoji: '🔢', title: 'Number Guessing', desc: 'Guess the secret number with higher/lower hints. How few tries can you do it in?', difficulty: 'easy' },
  { id: 'colorguess', emoji: '🎨', title: 'Color Guessing', desc: 'Look at a color and guess its hex code. A true test for designers!', difficulty: 'hard' },
  { id: 'speedtyping', emoji: '⌨️', title: 'Speed Typing', desc: 'Type the text as fast and accurately as you can. Race against the clock!', difficulty: 'medium' },
  { id: 'wordscramble', emoji: '🔤', title: 'Word Scramble', desc: 'Unscramble the jumbled letters to find the hidden word.', difficulty: 'easy' },
  { id: 'rps', emoji: '✂️', title: 'Rock Paper Scissors', desc: 'The classic showdown! Can you outsmart the computer?', difficulty: 'easy' },
  { id: 'math', emoji: '🧮', title: 'Math Challenge', desc: 'Solve math problems as fast as you can before time runs out!', difficulty: 'hard' },
  { id: 'snake', emoji: '🐍', title: 'Snake', desc: 'Guide your snake to eat food and grow longer. Avoid walls and yourself!', difficulty: 'medium' },
  { id: '2048', emoji: '🟨', title: '2048', desc: 'Slide tiles to merge numbers and reach the legendary 2048 tile!', difficulty: 'medium' },
  { id: 'wordle', emoji: '🟩', title: 'Wordle', desc: 'Guess the secret 5-letter word in 6 tries using color-coded hints.', difficulty: 'medium' },
  { id: 'reactiontime', emoji: '⚡', title: 'Reaction Time', desc: 'Click the moment the screen turns green. Test your lightning reflexes!', difficulty: 'easy' },
  { id: 'minesweeper', emoji: '💣', title: 'Minesweeper', desc: 'Reveal safe squares and flag all the mines. Classic logic puzzle!', difficulty: 'hard' },
  { id: 'tetris', emoji: '🧱', title: 'Tetris', desc: 'Stack falling blocks and clear lines before they reach the top!', difficulty: 'hard' },
  { id: 'quizduel', emoji: '🧠', title: 'Quiz Duel', desc: 'Race against the CPU to answer trivia questions before time runs out!', difficulty: 'medium' },
  { id: 'whackmole', emoji: '🔨', title: 'Whack-a-Mole', desc: 'Smash moles as they pop up! How many can you hit in 30 seconds?', difficulty: 'easy' },
  { id: 'simon', emoji: '🟢', title: 'Simon Says', desc: 'Watch the color sequence and repeat it. How long can your memory hold?', difficulty: 'medium' },
  { id: 'tictactoe', emoji: '⭕', title: 'Tic Tac Toe', desc: 'Classic 3x3 battle against an unbeatable AI. Can you force a draw?', difficulty: 'easy' },
];

export function renderHome(container) {
  let activeCategory = null;

  function render() {
    if (!activeCategory) {
      container.innerHTML = `
        <section class="hero">
          <h1>Choose Your <span class="gradient-text">Difficulty</span></h1>
          <p>Select a challenge level to see the available games.</p>
        </section>
        <section class="games-section">
          <div class="games-grid" style="grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; max-width: 900px; margin: 0 auto;">
            <div class="game-card category-card" data-cat="easy" style="text-align:center; padding: 3rem 2rem;">
              <div class="card-emoji" style="margin: 0 auto 1.5rem; font-size: 3.5rem; width: 80px; height: 80px;">🌟</div>
              <div class="card-title" style="font-size:1.8rem; margin-bottom: 0.5rem;">Easy</div>
              <div class="card-desc" style="font-size: 1.05rem; flex: none;">Relaxing games to pass the time.</div>
            </div>
            <div class="game-card category-card" data-cat="medium" style="text-align:center; padding: 3rem 2rem;">
              <div class="card-emoji" style="margin: 0 auto 1.5rem; font-size: 3.5rem; width: 80px; height: 80px;">🔥</div>
              <div class="card-title" style="font-size:1.8rem; margin-bottom: 0.5rem;">Medium</div>
              <div class="card-desc" style="font-size: 1.05rem; flex: none;">A good balance of fun and challenge.</div>
            </div>
            <div class="game-card category-card" data-cat="hard" style="text-align:center; padding: 3rem 2rem;">
              <div class="card-emoji" style="margin: 0 auto 1.5rem; font-size: 3.5rem; width: 80px; height: 80px;">💀</div>
              <div class="card-title" style="font-size:1.8rem; margin-bottom: 0.5rem;">Hard</div>
              <div class="card-desc" style="font-size: 1.05rem; flex: none;">For true gamers. Prepare to sweat.</div>
            </div>
          </div>
        </section>
        <footer style="text-align: center; padding: 3rem 1rem 2rem; color: var(--text-mid); opacity: 0.8; font-size: 0.95rem; font-weight: 500;">
          Designed &amp; Built by <span style="font-weight: 700; color: var(--text-dark);">Smail MOULLA</span>
        </footer>
      `;

      container.querySelectorAll('.category-card').forEach(card => {
        card.addEventListener('click', () => {
          activeCategory = card.dataset.cat;
          render();
        });
      });

    } else {
      const filteredGames = GAMES.filter(g => g.difficulty === activeCategory);
      const capCat = activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1);

      container.innerHTML = `
        <section class="hero" style="position: relative; padding-bottom: 2rem;">
          <button type="button" id="back-to-categories" class="btn btn-secondary" style="position:absolute; top: 1.5rem; left: 1.5rem; padding: 8px 16px; font-size: 0.85rem; z-index: 10;">← Categories</button>
          <h1 style="margin-bottom: 0.5rem;"><span class="gradient-text">${capCat} Games</span></h1>
          <p>Select a game to start playing!</p>
        </section>
        <section class="games-section">
          <div class="games-grid">
            ${filteredGames.map(g => `
              <div class="game-card play-game-card" data-id="${g.id}" data-emoji="${g.emoji}" data-title="${g.title}" style="cursor: pointer;">
                <div class="card-emoji">${g.emoji}</div>
                <div class="card-title">${g.title}</div>
                <div class="card-desc">${g.desc}</div>
                <span class="card-badge badge-${g.difficulty}">${g.difficulty}</span>
              </div>
            `).join('')}
          </div>
        </section>
        <footer style="text-align: center; padding: 2rem 1rem; color: var(--text-mid); opacity: 0.8; font-size: 0.95rem; font-weight: 500;">
          Designed &amp; Built by <span style="font-weight: 700; color: var(--text-dark);">Smail MOULLA</span>
        </footer>

        <!-- Mode Selection Modal -->
        <div id="mode-modal" class="game-over-overlay" style="display:none; z-index: 999;">
          <div class="game-over-card" style="position: relative;">
            <button type="button" id="close-modal" style="position: absolute; top: 1rem; right: 1.5rem; background: transparent; border: none; font-size: 2rem; cursor: pointer; color: var(--text-mid);">&times;</button>
            <div class="emoji" id="modal-emoji" style="font-size: 3.5rem; margin-bottom: 0.5rem;">🎮</div>
            <h2 id="modal-title" style="font-size: 1.6rem; margin-bottom: 1.5rem; color: var(--text-dark);">Select Mode</h2>

            <div id="modal-buttons" style="display: flex; flex-direction: column; gap: 1rem;">
              <button type="button" id="btn-solo" class="btn btn-primary" style="padding: 1rem; font-size: 1.1rem; width: 100%;">👤 Play Solo</button>
              <button type="button" id="btn-multi" class="btn btn-secondary" style="padding: 1rem; font-size: 1.1rem; width: 100%; border: 2px solid #667eea; color: #667eea; background: transparent;">🌐 Multiplayer</button>
            </div>

            <div id="modal-auth" style="display:none;">
              <p style="color: var(--text-mid); margin-bottom: 1rem;">Login or Register to play online.</p>
              <input type="text" id="auth-username" class="game-input" placeholder="Username" style="margin-bottom: 0.5rem; text-align: center; font-size: 1.1rem;" maxlength="15" autocomplete="off" />
              <input type="password" id="auth-password" class="game-input" placeholder="Password" style="margin-bottom: 1rem; text-align: center; font-size: 1.1rem;" autocomplete="off" />
              <div style="display:flex; gap:0.5rem;">
                <button type="button" id="btn-login" class="btn btn-primary" style="flex:1; padding: 12px;">Login</button>
                <button type="button" id="btn-register" class="btn btn-secondary" style="flex:1; padding: 12px; border: 2px solid #667eea; color: #667eea; background:transparent;">Register</button>
              </div>
              <p id="auth-error" style="color: #ef4444; font-size: 0.85rem; margin-top: 1rem; display:none;"></p>
            </div>

            <div id="matchmaking-status" style="display:none; margin-top: 1.5rem; color: var(--text-mid);">
              <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">⏳</div>
              <p>Searching for players...</p>
              <p style="font-size: 0.8rem; margin-top: 0.5rem; color: #ef4444; font-weight: 600;">(Multiplayer coming soon — starting Solo mode...)</p>
            </div>
          </div>
        </div>
      `;

      document.getElementById('back-to-categories').addEventListener('click', () => {
        activeCategory = null;
        render();
      });

      let selectedGameId = null;
      const modal = document.getElementById('mode-modal');

      container.querySelectorAll('.play-game-card').forEach(card => {
        card.addEventListener('click', () => {
          selectedGameId = card.dataset.id;
          document.getElementById('modal-emoji').textContent = card.dataset.emoji;
          document.getElementById('modal-title').textContent = card.dataset.title;
          document.getElementById('modal-buttons').style.display = 'flex';
          document.getElementById('modal-auth').style.display = 'none';
          document.getElementById('matchmaking-status').style.display = 'none';
          modal.style.display = 'flex';
        });
      });

      document.getElementById('close-modal').addEventListener('click', () => {
        modal.style.display = 'none';
      });

      document.getElementById('btn-solo').addEventListener('click', () => {
        modal.style.display = 'none';
        window.location.hash = selectedGameId;
      });

      const startMatchmaking = () => {
        document.getElementById('modal-buttons').style.display = 'none';
        document.getElementById('modal-auth').style.display = 'none';
        document.getElementById('matchmaking-status').style.display = 'block';
        setTimeout(() => {
          modal.style.display = 'none';
          window.location.hash = selectedGameId;
        }, 2500);
      };

      document.getElementById('btn-multi').addEventListener('click', () => {
        if (localStorage.getItem('pixelArenaUsername')) {
          startMatchmaking();
        } else {
          document.getElementById('modal-buttons').style.display = 'none';
          document.getElementById('modal-auth').style.display = 'block';
          document.getElementById('auth-username').focus();
        }
      });

      const handleAuth = async (action) => {
        const username = document.getElementById('auth-username').value.trim();
        const password = document.getElementById('auth-password').value;
        const errEl = document.getElementById('auth-error');

        if (!username || !password) {
          errEl.textContent = 'Please enter both username and password.';
          errEl.style.display = 'block';
          return;
        }

        const baseUrl = window.location.hostname === 'localhost' ? 'http://localhost:3000' : '';

        try {
          const res = await fetch(`${baseUrl}/api/${action}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
          });
          const data = await res.json();
          if (res.ok) {
            localStorage.setItem('pixelArenaUsername', username);
            errEl.style.display = 'none';
            startMatchmaking();
          } else {
            errEl.textContent = data.error || 'Authentication failed.';
            errEl.style.display = 'block';
          }
        } catch(e) {
          errEl.textContent = 'Server is offline. Unable to connect.';
          errEl.style.display = 'block';
        }
      };

      document.getElementById('btn-login').addEventListener('click', () => handleAuth('login'));
      document.getElementById('btn-register').addEventListener('click', () => handleAuth('register'));

      // Allow Enter key in auth inputs to submit
      const onEnter = (e) => { if (e.key === 'Enter') handleAuth('login'); };
      document.getElementById('auth-username').addEventListener('keydown', onEnter);
      document.getElementById('auth-password').addEventListener('keydown', onEnter);
    }
  }

  render();
}

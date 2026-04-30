// ~1000 common 5-letter words
const WORDS = [
  'ABOUT','ABOVE','ABUSE','ACIDS','ACRES','ACTED','ACUTE','ADDED','ADMIT','ADOBE',
  'ADORE','ADULT','AFTER','AGAIN','AGENT','AGILE','AGING','AGONY','AGORA','AGREE',
  'AHEAD','AIDED','AIMED','AIRED','AISLE','ALBUM','ALGAE','ALIEN','ALIGN','ALIKE',
  'ALIVE','ALLEY','ALLOT','ALLOW','ALLOY','ALOFT','ALONE','ALONG','ALOOF','ALOUD',
  'ALTER','ANGEL','ANGER','ANGLE','ANGRY','ANIME','ANNEX','ANTIC','ANVIL','AORTA',
  'APHID','APPLE','APPLY','APTLY','ARENA','ARGUE','ARISE','ARMOR','AROMA','AROSE',
  'ARRAY','ARROW','ARSON','ASSET','ATLAS','ATONE','ATTIC','AUDIT','AUGUR','AVAIL',
  'AVERT','AVIAN','AVOID','AWAKE','AWARD','AWARE','AWFUL','AWOKE','AXIOM','AZURE',
  'BADGE','BADLY','BAGEL','BAKER','BALED','BALLS','BANAL','BANJO','BANTY','BARON',
  'BASED','BASIN','BASIS','BATCH','BAYOU','BEACH','BEARD','BEADY','BEEFY','BEGAN',
  'BEGIN','BEING','BELOW','BENCH','BESET','BETEL','BEVEL','BINGE','BIRCH','BIRDY',
  'BIRTH','BISON','BITCH','BLANK','BLAST','BLAZE','BLEED','BLESS','BLISS','BLOAT',
  'BLOCK','BLOOD','BLOOM','BLOWN','BOARD','BOAST','BOBBY','BOGUS','BOLTS','BONUS',
  'BOTCH','BOUGH','BOUND','BOXER','BRACE','BRASH','BRAWN','BREAK','BREED','BRICK',
  'BRIDE','BRINE','BRINK','BROAD','BROKE','BROOK','BROTH','BROWS','BRUNT','BUDDY',
  'BUILD','BUILT','BULGE','BULLS','BUMPY','BUXOM','BYLAW','CABAL','CABIN','CACHE',
  'CADET','CAIRN','CAMEL','CAMEO','CANDY','CANON','CARRY','CARGO','CAROL','CATCH',
  'CAUSE','CEDAR','CHASE','CHEAP','CHEAT','CHECK','CHEEK','CHESS','CHIEF','CHIME',
  'CHIRP','CIVIC','CLAIM','CLAMP','CLANG','CLASP','CLEAT','CLEFT','CLERK','CLICK',
  'CLING','CLOAK','CLUBS','CLUED','COILS','COLOR','COMIC','COMMA','CORAL','CORPS',
  'COSTS','COUCH','COVET','CRAWL','CREAK','CREEK','CREST','CRIMP','CRISP','CROAK',
  'CROPS','CROSS','CROUP','CRUMB','CRUST','CRYPT','CUBIC','CULPA','CURLY','CURRY',
  'CYCLE','CYNIC','DADDY','DAISY','DATUM','DECOY','DEFER','DELTA','DEMON','DENSE',
  'DEPOT','DERBY','DIGIT','DIODE','DISCO','DISCS','DIVER','DIVOT','DIZZY','DOING',
  'DOLLY','DOMED','DONOR','DONUT','DOPEY','DOWDY','DOWNS','DOWRY','DOWSE','DOZEN',
  'DRAPE','DROOL','DROVE','DRUID','DRUMS','DUMPY','DUSKY','DUSTY','DWARF','EARLY',
  'EARNS','EARTH','EDGED','EIGHT','EJECT','ELBOW','ELDER','ELECT','ELEGY','ELITE',
  'EMBER','EMCEE','EMOTE','EMPTY','ENACT','ENDED','ENDOW','ENSUE','ENTER','ENVOY',
  'EPOXY','ERODE','ERRAND','ETHIC','EVADE','EVENT','EVICT','EVOKE','EXACT','EXALT',
  'EXERT','EXILE','EXIST','EXTRA','FABLE','FACET','FAINT','FAIRY','FAITH','FAKER',
  'FARCE','FATAL','FAUNA','FAVOR','FEAST','FEIGN','FERRY','FETCH','FEVER','FEWER',
  'FIBER','FICUS','FIEND','FIFTH','FIFTY','FIGHT','FILTH','FJORD','FLAGS','FLAIR',
  'FLANK','FLARE','FLASK','FLAXY','FLECK','FLEET','FLOCK','FLORA','FLOUR','FLOWN',
  'FLUTE','FLYBY','FOCAL','FOGGY','FORAY','FORGE','FORGO','FOYER','FRAIL','FRANC',
  'FRAUD','FREAK','FRIAR','FROZE','FRUGAL','TRULY','FUNDS','FUNGI','FUNKY','FUNNY',
  'GENRE','GHOST','GIRTH','GIVEN','GLAND','GLARE','GLAZE','GLEAM','GLOAT','GLOBE',
  'GLOSS','GLOVE','GLYPH','GNARLY','GOING','GORGE','GOUGE','GOURD','GRAIL','GRANT',
  'GRAVY','GRAZE','GREED','GREET','GRIEF','GROAN','GROIN','GROOM','GROOVE','GROPE',
  'GROVE','GRUEL','GRUFF','GRUMP','GRUNGE','GUILD','GUISE','GULCH','GUSTO','GUILE',
  'HAIKU','HAIRY','HASTE','HATCH','HAVEN','HAZEL','HEADY','HEIST','HENCE','HERBS',
  'HERON','HINGE','HIPPO','HOBBY','HOMER','HONOR','HORNS','HOVER','HUSKY','HYDRA',
  'HYENA','HYPER','ICING','IMAGE','IMPLY','IMPLY','INDEX','INFER','INFIX','INGOT',
  'INLAY','INLET','IRATE','IRONY','ISSUE','ITCHY','JAUNT','JAZZY','JELLY','JERKY',
  'JOUST','JUROR','KAYAK','KEBAB','KNACK','KNEEL','KNELT','KNOLL','KNOTS','KNOWN',
  'KUDOS','LADEN','LANCE','LAPEL','LAPSE','LATCH','LATHE','LATTE','LEDGE','LEMUR',
  'LENDS','LINER','LINGO','LINKS','LITER','LITHE','LLAMA','LODGE','LOSSY','LOWER',
  'LUCID','LUNAR','LUSTY','LYRIC','MAGIC','MANOR','MAPLE','MARSH','MIRTH','MIXED',
  'MOCHA','MODAL','MODEL','MOGUL','MOOSE','MOTEL','MOTTO','MUCKY','MURKY','MUSTY',
  'MYRRH','NASAL','NAVAL','NERVE','NIFTY','NIGHT','NOBLE','NOMAD','NOTCH','NYMPH',
  'OCCUR','OFFAL','OFFBEAT','ONSET','OPTIC','ORBIT','ORDER','OUTDO','OVOID','OZONE',
  'PADDY','PAGAN','PALSY','PANEL','PAPAL','PATCH','PAUSE','PENAL','PERCH','PERIL',
  'PERKY','PETTY','PHONY','PIANO','PLAID','PRANK','PLUMB','PLUME','PLUNK','PLUSH',
  'POACH','POGROM','POKEY','POLAR','POLKA','POMMEL','POPPY','POPUP','POSSE','POTTY',
  'PRANK','PRESS','PRICK','PRIDE','PRIOR','PRIVY','PROBE','PROXY','PRUDE','PRUNE',
  'PSALM','PUDGY','PULPY','PUNKY','PUPIL','PUSHY','PYGMY','QUEEN','QUELL','QUILL',
  'QUIRK','QUOTA','RABBI','RABID','RAINY','RAMEN','RAVEN','REPAY','REPEL','REPRO',
  'RESIN','RETRO','RHINO','RIDER','RISKY','RIVET','ROAST','ROBIN','ROCKY','RODEO',
  'ROUGE','ROUTE','ROWDY','ROYAL','RUDDY','RUGBY','RUINS','RULER','RUNNY','RUSTY',
  'SADLY','SAUCE','SCALD','SCALP','SCAMP','SCENT','SCONE','SCOUT','SCRAM','SERUM',
  'SEVEN','SHAKY','SHALL','SHANK','SHAVE','SHELL','SHOAL','SHONE','SHOWN','SHRED',
  'SHREW','SHRUB','SIGMA','SILKY','SINCE','SIXTH','SIXTY','SKIER','SKULL','SLAIN',
  'SLANG','SLANT','SMASH','SNARE','SNEAK','SNIFF','SNORE','SOLAR','SOLVE','SPADE',
  'SPARK','SPAWN','SPELL','SPINE','SPITE','SPORT','SQUAD','SQUAT','STAMP','STERN',
  'STICK','STING','STOMP','STOVE','STRAP','STRAY','STRIP','STRUT','STUCK','STUMP',
  'SUGAR','SUITE','SULKY','SULKY','SUNNY','SURGE','SWAMP','SWEAR','SWEPT','SWIRL',
  'TABBY','TAUNT','TAWNY','TEDDY','TEPID','TERSE','THANE','THINE','THONG','THORN',
  'THREE','TIGER','TILDE','TITHE','TITHE','TITLE','TOTEM','TOXIC','TRACK','TRAMP',
  'TRICK','TROUT','TROVE','TRUCE','TULIP','TUMOR','TWEAK','UMBRA','UNCLE','UNDER',
  'UNFIT','UNIFY','UNTIL','UPSET','USHER','USURP','UTTER','UVULA','VAGUE','VALID',
  'VALOR','VALVE','VAPOR','VAULT','VAUNT','VENOM','VERSE','VICAR','VIGOR','VINYL',
  'VIOLA','VIRAL','VISOR','VISTA','VIXEN','VODKA','VOGUE','VOILA','VOUCH','VYING',
  'WAGED','WAIVE','WALTZ','WATCH','WEARY','WEDGE','WEEDY','WENCH','WHACK','WHELP',
  'WHERE','WHICH','WHILE','WHIFF','WHOSE','WIELD','WINDY','WITTY','WOKEN','WRATH',
  'WRING','YACHT','YEARN','YIELD','ZIPPY','ZONAL',
  // More common Wordle-style words
  'CRANE','SLATE','AUDIO','RAISE','AROSE','ADIEU','ORATE','IRATE','STARE','SNARE',
  'BEAST','FEAST','LEAPT','STEAM','TEAMS','MATES','TAMES','METAL','FLAME','BLEND',
  'BLUNT','BURNT','BURST','BRUSH','BRAIN','BRAND','BRAVE','CHARM','CHART','CHEAP',
  'CHEST','CHILD','CHIPS','CHORD','CHOSE','CIVIL','CLASS','CLEAN','CLEAR','CLIMB',
  'CLOCK','CLONE','CLOTH','CLOUD','COACH','COAST','COULD','COUNT','COURT','COVER',
  'CRACK','CRAFT','CRASH','CRAZY','CREAM','CROSS','CROWD','CROWN','CRUSH','CURVE',
  'DANCE','DATED','DEALT','DEATH','DEBUT','DELAY','DEPTH','DIRTY','DODGE','DOUBT',
  'DOUGH','DRAFT','DRAIN','DRAMA','DRANK','DRAWN','DREAM','DRESS','DRIFT','DRINK',
  'DRIVE','DRONE','DROVE','DRUNK','DYING','EAGER','EIGHT','EMPTY','ENEMY','ENJOY',
  'EQUAL','ERROR','FALSE','FANCY','FAULT','FEVER','FIELD','FIGHT','FINAL','FIRST',
  'FIXED','FLASH','FLOAT','FLOOD','FLOOR','FLUID','FLUSH','FOCUS','FORCE','FORTH',
  'FOUND','FRAME','FRANK','FRAUD','FRESH','FRONT','FROST','FRUIT','FULLY','GENRE',
  'GIVEN','GLASS','GLOOM','GLORY','GOING','GRACE','GRADE','GRAIN','GRAND','GRASP',
  'GRASS','GRAVE','GREAT','GREEN','GRIEF','GRILL','GRIND','GROUP','GROWN','GUARD',
  'GUESS','GUEST','GUIDE','GUILT','HAPPY','HARSH','HAVEN','HEART','HEAVY','HERBS',
  'HORSE','HOTEL','HOUSE','HUMAN','HUMOR','HURRY','IMAGE','INBOX','INNER','INPUT',
  'INTER','INTRO','IVORY','JAPAN','JEWEL','JOINT','JOKER','JUDGE','JUICE','JUICY',
  'JUMPY','KNIFE','KNOCK','LARGE','LASER','LATER','LAUGH','LAYER','LEARN','LEGAL',
  'LEMON','LEVEL','LIGHT','LIMIT','LINEN','LOCAL','LOGIC','LOOSE','LOVER','LUCKY',
  'LYING','MAJOR','MAKER','MARCH','MARKS','MATCH','MAYOR','MEDIA','MERIT','MESSY',
  'MIGHT','MINUS','MIXER','MODEL','MONEY','MONTH','MORAL','MOUTH','MOVIE','MOWER',
  'MUSIC','NAIVE','NAMES','NEVER','NINJA','NOISE','NORTH','NOTED','NOVEL','NURSE',
  'OCEAN','OFFER','OFTEN','OLIVE','OPERA','OTHER','OUTER','OWNER','PAINT','PAPER',
  'PARTY','PASTA','PEACE','PEACH','PENNY','PHASE','PHONE','PHOTO','PIECE','PILOT',
  'PITCH','PIXEL','PIZZA','PLACE','PLAIN','PLANE','PLANT','PLATE','PLAZA','PLEAD',
  'PLEAT','PLUCK','POINT','PORCH','POWER','PRICE','PRIME','PRINT','PRIZE','PROUD',
  'PROVE','PULSE','PUNCH','QUERY','QUEST','QUICK','QUIET','QUOTE','RALLY','RANCH',
  'RANGE','RAPID','RATIO','REACH','READY','REALM','REBEL','REFER','REIGN','RELAX',
  'RELAY','REPLY','RIDGE','RIFLE','RIGID','RIVAL','RIVER','ROBOT','ROUGH','ROUND',
  'ROVER','RULER','RURAL','SAINT','SCALE','SCARY','SCENE','SCOPE','SCORE','SCREW',
  'SEIZE','SENSE','SERVE','SETUP','SEVER','SHADE','SHAME','SHAPE','SHARE','SHARK',
  'SHARP','SHEER','SHELF','SHIFT','SHIRT','SHOCK','SHORE','SHORT','SHOUT','SHOVE',
  'SIGHT','SILLY','SKILL','SLEEP','SLEET','SLICK','SLIDE','SLING','SMART','SMELL',
  'SMILE','SMOKE','SNACK','SNAKE','SOBER','SOLID','SORRY','SOUND','SOUTH','SPACE',
  'SPARE','SPEAK','SPEND','SPICE','SPIRE','SPLIT','SPOIL','SPOKE','SPORE','SPRAY',
  'STACK','STAFF','STAGE','STAIN','STAKE','STALL','STAND','STARK','START','STATE',
  'STEAL','STEEP','STEER','STIFF','STILL','STOCK','STONE','STOOD','STORE','STORM',
  'STORY','STYLE','SUPER','SWEAR','SWEET','SWIFT','SWORD','TABLE','TASTE','TEACH',
  'THOSE','THREW','THROW','TIMER','TIRED','TODAY','TOKEN','TOTAL','TOUCH','TOUGH',
  'TOWER','TRACE','TRAIL','TRAIN','TRASH','TREAT','TREND','TRIAL','TROOP','TRUCK',
  'TRUST','TRUTH','TUTOR','TWICE','TWIST','UNFIT','UNION','UNITY','UPPER','URBAN',
  'USAGE','USUAL','VALUE','VIDEO','VIRUS','VISIT','VOICE','VOTER','WAIST','WATER',
  'WEAVE','WEIRD','WHALE','WHEAT','WHEEL','WHITE','WHOLE','WIDER','WITCH','WOMAN',
  'WOMEN','WORLD','WORRY','WORSE','WORST','WORTH','WOULD','WOUND','WRITE','WROTE',
  'YOUNG','YOURS','YOUTH','ZEBRA',
];

const ALPHA = 'QWERTYUIOPASDFGHJKLZXCVBNM'.split('');

export function renderWordle(container) {
  let answer, guesses, current, gameOver, won;
  let keyHandler = null;

  // Inject styles once
  if (!document.getElementById('wordle-styles')) {
    const style = document.createElement('style');
    style.id = 'wordle-styles';
    style.textContent = `
      .wordle-board { display:flex;flex-direction:column;gap:6px;align-items:center;margin:1rem 0; }
      .wordle-row { display:flex;gap:5px; }
      .wordle-tile {
        width:clamp(44px,11vw,56px);height:clamp(44px,11vw,56px);
        display:flex;align-items:center;justify-content:center;
        font-size:clamp(1.2rem,4vw,1.6rem);font-weight:800;
        border:2px solid #d3d6da;border-radius:6px;
        text-transform:uppercase;color:#1a1a2e;background:#fff;
      }
      .wordle-filled { border-color:#999; }
      .wordle-correct { background:#6aaa64;border-color:#6aaa64;color:#fff; }
      .wordle-present { background:#c9b458;border-color:#c9b458;color:#fff; }
      .wordle-absent  { background:#787c7e;border-color:#787c7e;color:#fff; }
      .wordle-keyboard { display:flex;flex-direction:column;gap:5px;align-items:center;margin-top:0.75rem; }
      .wordle-keyrow { display:flex;gap:4px; }
      .wordle-key {
        padding:0;height:clamp(42px,10vw,58px);min-width:clamp(28px,7.5vw,38px);
        border:none;border-radius:6px;
        background:#d3d6da;font-family:var(--font,system-ui);
        font-size:clamp(0.7rem,2.5vw,0.85rem);font-weight:700;
        cursor:pointer;transition:background 0.2s;color:#1a1a2e;
        -webkit-tap-highlight-color:transparent;touch-action:manipulation;
      }
      .wordle-key-wide { min-width:clamp(42px,10vw,52px);font-size:clamp(0.9rem,3vw,1.1rem); }
      .wordle-key-correct { background:#6aaa64;color:#fff; }
      .wordle-key-present { background:#c9b458;color:#fff; }
      .wordle-key-absent  { background:#787c7e;color:#fff; }
      .wordle-key:hover { filter:brightness(0.92); }
    `;
    document.head.appendChild(style);
  }

  function init() {
    answer = WORDS[Math.floor(Math.random() * WORDS.length)];
    guesses = [];
    current = '';
    gameOver = false;
    won = false;
    renderBoard();
  }

  function handleKey(key) {
    if (gameOver) return;
    if (key === 'BACK') { current = current.slice(0, -1); renderBoard(); return; }
    if (key === 'ENTER') {
      if (current.length < 5) return;
      guesses.push(current);
      const isAnagram = current.split('').sort().join('') === answer.split('').sort().join('');
      if (current === answer || isAnagram) { won = true; gameOver = true; }
      else if (guesses.length >= 6) { gameOver = true; }
      current = '';
      renderBoard();
      return;
    }
    if (/^[A-Z]$/.test(key) && current.length < 5) { current += key; renderBoard(); }
  }

  function getLetterStates() {
    const state = {};
    guesses.forEach(g => {
      g.split('').forEach((ch, i) => {
        const existing = state[ch];
        const newState = ch === answer[i] ? 'correct' : answer.includes(ch) ? 'present' : 'absent';
        if (existing === 'correct') return;
        if (existing === 'present' && newState !== 'correct') return;
        state[ch] = newState;
      });
    });
    return state;
  }

  function tileClass(guess, pos) {
    const ch = guess[pos];
    if (ch === answer[pos]) return 'wordle-correct';
    if (answer.includes(ch)) return 'wordle-present';
    return 'wordle-absent';
  }

  function renderBoard() {
    const letterStates = getLetterStates();

    const rows = Array.from({ length: 6 }, (_, i) => {
      const guess = guesses[i];
      const isActive = i === guesses.length && !gameOver;
      const tiles = Array.from({ length: 5 }, (_, j) => {
        let ch = '';
        let cls = 'wordle-tile';
        if (guess) { ch = guess[j]; cls += ' ' + tileClass(guess, j); }
        else if (isActive) { ch = current[j] || ''; cls += ch ? ' wordle-filled' : ''; }
        return `<div class="${cls}">${ch}</div>`;
      }).join('');
      return `<div class="wordle-row">${tiles}</div>`;
    }).join('');

    const keyboard = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'].map((row, ri) => {
      const keys = row.split('').map(ch => {
        const st = letterStates[ch] || '';
        return `<button class="wordle-key ${st ? 'wordle-key-' + st : ''}" data-key="${ch}">${ch}</button>`;
      }).join('');
      const extra = ri === 2 ? `<button class="wordle-key wordle-key-wide" data-key="ENTER">↵</button>` : '';
      const del   = ri === 2 ? `<button class="wordle-key wordle-key-wide" data-key="BACK">⌫</button>` : '';
      return `<div class="wordle-keyrow">${extra}${keys}${del}</div>`;
    }).join('');

    container.innerHTML = `
      <div class="game-page">
        <div class="game-header">
          <h1>🟩 Wordle</h1>
          <p>Guess the 5-letter word in 6 tries! (${WORDS.length} possible words)</p>
        </div>
        <div class="game-container" style="max-width:480px;margin:0 auto;">
          ${won ? `<div class="message success">🎉 ${answer} — You got it in ${guesses.length}!</div>` : ''}
          ${gameOver && !won ? `<div class="message error">The word was <strong>${answer}</strong></div>` : ''}
          <div class="wordle-board">${rows}</div>
          <div class="wordle-keyboard">${keyboard}</div>
          ${gameOver ? `
            <div class="game-actions">
              <button class="btn btn-primary" id="wordle-restart">New Word</button>
              <a href="#" class="btn btn-secondary">All Games</a>
            </div>` : ''}
        </div>
      </div>
    `;

    // Keyboard buttons — use data-key, NOT closures that capture stale 'current'
    container.querySelectorAll('.wordle-key').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        handleKey(btn.dataset.key);
      });
    });

    document.getElementById('wordle-restart')?.addEventListener('click', init);
  }

  // Physical keyboard handler registered ONCE, never re-added
  keyHandler = (e) => {
    if (e.key === 'Enter') handleKey('ENTER');
    else if (e.key === 'Backspace') handleKey('BACK');
    else if (/^[a-zA-Z]$/.test(e.key)) handleKey(e.key.toUpperCase());
  };
  document.addEventListener('keydown', keyHandler);

  init();

  return () => {
    if (keyHandler) document.removeEventListener('keydown', keyHandler);
  };
}

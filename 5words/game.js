(function () {
  'use strict';

  // ---------- Constants ----------

  const ALPHABET = 'abcdefghijklmnopqrstuvwxyz'.split('');
  const PLAIN = 0, OUT = 1, IN = 2;
  const STATE_NAMES = ['plain', 'excluded', 'included'];
  const WORD_LENGTH = 5;

  const RECENT_KEY   = '5words.recentTargets';
  const RECENT_LIMIT = 100;

  // ---------- DOM ----------

  const alphabetEl = document.getElementById('alphabet');
  const boardEl    = document.getElementById('board');
  const playEl     = document.getElementById('play');
  const inputRowEl = document.getElementById('input-row');
  const inputCells = Array.from(inputRowEl.querySelectorAll('.cell'));
  const inputEl    = document.getElementById('guess-input');
  const formEl     = document.getElementById('guess-form');
  const messageEl  = document.getElementById('message');
  const newGameEl  = document.getElementById('new-game');
  const revealEl   = document.getElementById('reveal');
  const helpBtn    = document.getElementById('help');
  const helpModal  = document.getElementById('help-modal');
  const helpClose  = document.getElementById('help-close');

  // ---------- State ----------

  let target      = '';
  let gameOver    = false;
  let letterState = Object.create(null);  // 'a'..'z' -> PLAIN/OUT/IN
  const buttons   = Object.create(null);  // 'a'..'z' -> <button>

  // ---------- Scoring ----------
  // Multiset intersection.
  //
  //   scoreGuess('poppy', 'poops') === 3
  //   scoreGuess('poops', 'poppy') === 3
  //
  function scoreGuess(guess, target) {
    const counts = new Array(26).fill(0);
    const a = 97;

    for (let i = 0; i < target.length; i++) {
      counts[target.charCodeAt(i) - a]++;
    }

    let score = 0;
    for (let i = 0; i < guess.length; i++) {
      const idx = guess.charCodeAt(i) - a;
      if (counts[idx] > 0) {
        counts[idx]--;
        score++;
      }
    }
    return score;
  }

  // ---------- Alphabet ----------

  function buildAlphabet() {
    const frag = document.createDocumentFragment();
    for (const ch of ALPHABET) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'letter';
      btn.dataset.letter = ch;
      btn.textContent = ch;
      btn.addEventListener('click', () => cycleLetter(ch));
      buttons[ch] = btn;
      frag.appendChild(btn);
    }
    alphabetEl.appendChild(frag);
  }

  function setLetterState(ch, state) {
    letterState[ch] = state;
    const btn = buttons[ch];
    btn.dataset.state = String(state);
    btn.setAttribute('aria-label',
      'Letter ' + ch + ', ' + STATE_NAMES[state]);
  }

  function cycleLetter(ch) {
    setLetterState(ch, (letterState[ch] + 1) % 3);
  }

  // ---------- Recent-targets buffer (localStorage) ----------

  function loadRecent() {
    try {
      const raw = localStorage.getItem(RECENT_KEY);
      if (!raw) return [];
      const arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr.filter(w => typeof w === 'string') : [];
    } catch {
      return [];
    }
  }

  function saveRecent(arr) {
    try {
      localStorage.setItem(RECENT_KEY, JSON.stringify(arr));
    } catch {
      /* private mode, quota, etc. — just skip persistence */
    }
  }

  function pickTarget() {
    const recent    = loadRecent();
    const recentSet = new Set(recent);

    // Avoid words used in the last RECENT_LIMIT rounds. If the pool is
    // empty (small common list, long session), fall back to the whole
    // list rather than failing.
    const pool   = COMMON_WORDS.filter(w => !recentSet.has(w));
    const source = pool.length > 0 ? pool : COMMON_WORDS;
    const word   = source[Math.floor(Math.random() * source.length)];

    const updated = [word, ...recent.filter(w => w !== word)]
      .slice(0, RECENT_LIMIT);
    saveRecent(updated);

    return word;
  }

  // ---------- Input row rendering ----------

  function renderInputRow() {
    const value   = inputEl.value.toLowerCase();
    const focused = document.activeElement === inputEl;
    const caretAt = (!gameOver && focused && value.length < WORD_LENGTH)
      ? value.length
      : -1;

    for (let i = 0; i < WORD_LENGTH; i++) {
      inputCells[i].textContent = value[i] || '';
      inputCells[i].classList.toggle('active', i === caretAt);
    }
  }

  // ---------- Messages ----------

  function setMessage(text, kind) {
    messageEl.textContent = text;
    messageEl.className = kind ? 'message ' + kind : 'message';
  }

  // ---------- Guess log ----------

  function appendGuessRow(word, score) {
    const row = document.createElement('div');
    row.className = 'row';
    row.setAttribute('role', 'listitem');

    for (const ch of word) {
      const cell = document.createElement('span');
      cell.className = 'cell';
      cell.textContent = ch;
      row.appendChild(cell);
    }

    const s = document.createElement('span');
    s.className = 'score';
    s.textContent = String(score);
    row.appendChild(s);

    boardEl.appendChild(row);

    // Keep the newest row (and the dock) in view.a
    boardEl.scrollTop = boardEl.scrollHeight;

  }

  // ---------- Round lifecycle ----------

  function endRound(text, kind) {
    gameOver = true;
    setMessage(text, kind);
    inputEl.value = '';
    inputEl.disabled = true;
    renderInputRow();
    revealEl.disabled = true;
  }

  function submitGuess(ev) {
    ev.preventDefault();
    if (gameOver) return;

    const guess = inputEl.value.trim().toLowerCase();

    if (!/^[a-z]{5}$/.test(guess)) {
      setMessage('Enter exactly 5 letters.', 'error');
      return;
    }
    if (!WORD_SET.has(guess)) {
      setMessage('"' + guess + '" is not in the word list.', 'error');
      return;
    }

    const score = scoreGuess(guess, target);
    appendGuessRow(guess, score);

    inputEl.value = '';
    renderInputRow();

    if (guess === target) {
      endRound('You got it! The word was "' + target + '".', 'win');
      return;
    }

    setMessage('');
    inputEl.focus();
  }

  function revealWord() {
    if (gameOver) return;
    endRound('The word was "' + target + '".', 'reveal');
  }

  function newGame() {
    target   = pickTarget();
    gameOver = false;

    for (const ch of ALPHABET) setLetterState(ch, PLAIN);

    boardEl.replaceChildren();
    setMessage('');
    inputEl.value = '';
    inputEl.disabled = false;
    revealEl.disabled = false;
    renderInputRow();
    boardEl.scrollTop = 0;
    inputEl.focus();
  }

  // ---------- Help modal ----------

  function openHelp() {
    helpModal.hidden = false;
    helpClose.focus();
  }

  function closeHelp() {
    helpModal.hidden = true;
    helpBtn.focus();
  }

  // ---------- Init ----------

  buildAlphabet();

  formEl.addEventListener('submit', submitGuess);
  inputEl.addEventListener('input', renderInputRow);
  inputEl.addEventListener('focus', renderInputRow);
  inputEl.addEventListener('blur',  renderInputRow);

  newGameEl.addEventListener('click', newGame);
  revealEl.addEventListener('click', revealWord);

  boardEl.addEventListener('click', (ev) => {
    if (gameOver) return;
    if (ev.target === inputEl) return;
    inputEl.focus();
  });

  helpBtn.addEventListener('click', openHelp);
  helpClose.addEventListener('click', closeHelp);
  helpModal.addEventListener('click', (e) => {
    if (e.target === helpModal) closeHelp();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !helpModal.hidden) closeHelp();
  });

  newGame();
})();

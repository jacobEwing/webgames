(function () {
  'use strict';

  // ---------- Constants ----------

  const ALPHABET = 'abcdefghijklmnopqrstuvwxyz'.split('');
  const PLAIN = 0, OUT = 1, IN = 2;
  const STATE_NAMES = ['plain', 'excluded', 'included'];
  const WORD_LENGTH = 5;

  const RECENT_KEY   = '5word.recentTargets';
  const RECENT_LIMIT = 100;

  // ---------- DOM ----------

  const alphabetEl    = document.getElementById('alphabet');
  const boardEl       = document.getElementById('board');
  const inputRowEl    = document.getElementById('input-row');
  const inputCells    = Array.from(inputRowEl.querySelectorAll('.cell'));
  const inputEl       = document.getElementById('guess-input');
  const formEl        = document.getElementById('guess-form');
  const messageEl     = document.getElementById('message');
  const newGameEl     = document.getElementById('new-game');
  const revealEl      = document.getElementById('reveal');
  const playAgainWrap = document.getElementById('play-again-wrap');
  const playAgainBtn  = document.getElementById('play-again');
  const helpBtn       = document.getElementById('help');
  const helpModal     = document.getElementById('help-modal');
  const helpClose     = document.getElementById('help-close');
  const revealWrapEl  = document.getElementById('reveal-wrap');


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

  // Could `score` plausibly be the score of `guess` against some target
  // consistent with the current letter markings?
  //
  // For each distinct letter in the guess:
  //   - marked OUT: it can't match, so it contributes 0 to both bounds
  //   - marked IN:  target has >=1, guess has >=1, so >=1 match; max = count
  //   - unmarked:   0..count
  //
  // If the actual score falls outside [min, max], it's a contradiction.
  function scoreIsConsistent(guess, score) {
    const counts = Object.create(null);
    for (const ch of guess) counts[ch] = (counts[ch] || 0) + 1;

    let min = 0, max = 0;
    for (const ch in counts) {
      const state = letterState[ch];
      if (state === OUT) {
        // target has none; contributes nothing
      } else if (state === IN) {
        min += 1;
        max += counts[ch];
      } else {
        max += counts[ch];
      }
    }
    return score >= min && score <= max;
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
      // Keeps focus on the input on desktop; no keyboard popup on mobile.
      btn.addEventListener('pointerdown', (e) => e.preventDefault());
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
    refreshBoard();
  }

  // ---------- Board rendering ----------

  // Reapplies letter markings and score-conflict flags to every row.
  // Rows marked `.final` (the winning guess, or the revealed answer)
  // are skipped — their colours are locked in.
  function refreshBoard() {
    boardEl.querySelectorAll('.row').forEach(row => {
      if (row.classList.contains('final')) return;

      row.querySelectorAll('.cell').forEach(cell => {
        const state = letterState[cell.textContent];
        cell.classList.toggle('marked-out', state === OUT);
        cell.classList.toggle('marked-in',  state === IN);
      });

      const scoreEl = row.querySelector('.score');
      const guess   = row.dataset.guess;
      if (scoreEl && guess) {
        const score = Number(row.dataset.score);
        scoreEl.classList.toggle('conflict', !scoreIsConsistent(guess, score));
      }
    });
  }

  function appendGuessRow(word, score) {
    const row = document.createElement('div');
    row.className = 'row';
    row.setAttribute('role', 'listitem');
    row.dataset.guess = word;
    row.dataset.score = String(score);

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
    boardEl.scrollTop = boardEl.scrollHeight;

    refreshBoard();
  }

  // ---------- Input row rendering ----------

  function renderInputRow() {
    const cleaned = inputEl.value.toLowerCase().replace(/[^a-z]/g, '').slice(0, WORD_LENGTH);
    if (cleaned !== inputEl.value) inputEl.value = cleaned;
    const value   = inputEl.value;
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

    const pool   = COMMON_WORDS.filter(w => !recentSet.has(w));
    const source = pool.length > 0 ? pool : COMMON_WORDS;
    const word   = source[Math.floor(Math.random() * source.length)];

    const updated = [word, ...recent.filter(w => w !== word)]
      .slice(0, RECENT_LIMIT);
    saveRecent(updated);

    return word;
  }

  // ---------- Round lifecycle ----------

  // Shared teardown: hide the input row, reveal the Play Again button.
  function finishRound() {
    gameOver = true;
    inputEl.value = '';
    inputEl.disabled = true;
    setMessage('');
    renderInputRow();

    inputRowEl.hidden = true;
    revealWrapEl.hidden = true;      // ← was: revealEl.disabled = true;
    playAgainWrap.hidden = false;
    playAgainBtn.focus();
  }

  // Win: the last guess *is* the answer, so mark that row green.
  function winRound() {
    const lastRow = boardEl.lastElementChild;
    if (lastRow) {
      lastRow.classList.add('final');
      lastRow.querySelectorAll('.cell').forEach(c => c.classList.add('win'));
    }
    finishRound();
  }

  // Reveal: append the answer as a new green row, then finish.
  function revealRound() {
    const row = document.createElement('div');
    row.className = 'row final';

    for (const ch of target) {
      const cell = document.createElement('span');
      cell.className = 'cell win';
      cell.textContent = ch;
      row.appendChild(cell);
    }

    const s = document.createElement('span');
    s.className = 'score';
    row.appendChild(s);

    boardEl.appendChild(row);
    boardEl.scrollTop = boardEl.scrollHeight;

    finishRound();
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
      winRound();
      return;
    }

    setMessage('');
    inputEl.focus();
  }

  function revealWord() {
    if (gameOver) return;
    revealRound();
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

    inputRowEl.hidden = false;
    revealWrapEl.hidden = false;
    playAgainWrap.hidden = true;

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
  inputEl.addEventListener('beforeinput', (e) => {
    // Block any single-character insertion that isn't a-z.
    if (e.data && e.data.length === 1 && !/[a-z]/i.test(e.data)) {
      e.preventDefault();
    }
  });

  newGameEl.addEventListener('click', newGame);
  revealEl.addEventListener('click', revealWord);
  playAgainBtn.addEventListener('click', newGame);

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

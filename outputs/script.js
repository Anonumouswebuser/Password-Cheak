(() => {
  'use strict';

  const byId = (id) => document.getElementById(id);
  const passwordInput = byId('password-input');
  const commonPasswords = new Set([
    '123456', '12345678', 'password', 'password123', 'qwerty', 'qwerty123',
    'admin', 'admin123', 'welcome', 'letmein', 'abc123', 'iloveyou'
  ]);
  const leetMap = { '@': 'a', '4': 'a', '3': 'e', '1': 'i', '!': 'i', '0': 'o', '$': 's', '5': 's', '7': 't' };

  function getCharacterTypes(value) {
    return {
      lower: /[a-z]/.test(value),
      upper: /[A-Z]/.test(value),
      number: /[0-9]/.test(value),
      symbol: /[^A-Za-z0-9\s]/.test(value)
    };
  }

  function countCharacters(value) {
    return Array.from(value).length;
  }

  function normalizeForCommonCheck(value) {
    return value.toLowerCase().replace(/[a-z0-9@$!]/g, (char) => leetMap[char] || char).replace(/[^a-z]/g, '');
  }

  function checkCommonPassword(value) {
    const compact = value.toLowerCase().replace(/[^a-z0-9]/g, '');
    const normalized = normalizeForCommonCheck(value);
    if (commonPasswords.has(compact) || commonPasswords.has(value.toLowerCase())) return true;
    // Catch small, obvious suffix/prefix variations while avoiding broad substring matches.
    return [...commonPasswords].some((common) => {
      const word = common.replace(/[0-9]/g, '');
      return word.length >= 4 && (normalized === word || normalized === word + 's');
    });
  }

  function checkSequences(value) {
    const text = value.toLowerCase();
    const sequences = ['qwerty', 'asdf', 'zxcv', 'qazwsx'];
    if (sequences.some((pattern) => text.includes(pattern))) return true;
    for (let i = 0; i <= text.length - 3; i += 1) {
      const a = text.charCodeAt(i), b = text.charCodeAt(i + 1), c = text.charCodeAt(i + 2);
      if ((a >= 48 && a <= 57 && b === a + 1 && c === b + 1) ||
          (a >= 49 && a <= 57 && b === a - 1 && c === b - 1) ||
          (a >= 97 && a <= 122 && b === a + 1 && c === b + 1) ||
          (a >= 98 && a <= 122 && b === a - 1 && c === b - 1)) return true;
    }
    return false;
  }

  function checkRepeatedCharacters(value) {
    return /(.)\1{2,}/su.test(value) || /(.{2,})\1{2,}/su.test(value);
  }

  function checkPersonalPattern(value) {
    // Heuristic only: a word-like segment followed by digits is common in personal passwords.
    const hasWordAndDigits = /[a-z]{3,}[^a-z0-9]{0,4}\d{2,}/i.test(value) || /\d{2,}[^a-z0-9]{0,4}[a-z]{3,}/i.test(value);
    const word = value.match(/[a-z]{3,}/i)?.[0] || '';
    return hasWordAndDigits && new Set(word.toLowerCase()).size >= 3;
  }

  function calculateEntropy(value, types = getCharacterTypes(value)) {
    let poolSize = 0;
    if (types.lower) poolSize += 26;
    if (types.upper) poolSize += 26;
    if (types.number) poolSize += 10;
    if (types.symbol) poolSize += 32;
    const length = countCharacters(value);
    return length && poolSize ? Math.round(length * Math.log2(poolSize)) : 0;
  }

  function classifyScore(score) {
    if (score <= 20) return { label: 'VERY WEAK', color: '#ff7f86' };
    if (score <= 40) return { label: 'WEAK', color: '#ffad76' };
    if (score <= 60) return { label: 'MEDIUM', color: '#ffca70' };
    if (score <= 80) return { label: 'STRONG', color: '#8bd9b6' };
    return { label: 'VERY STRONG', color: '#75e3bb' };
  }

  function calculateScore(value, types, findings) {
    const length = countCharacters(value);
    const lengthPoints = Math.min(length / 16, 1) * 30;
    const diversityPoints = Object.values(types).filter(Boolean).length * 2.5;
    let score = lengthPoints + (types.lower ? 10 : 0) + (types.upper ? 10 : 0) +
      (types.number ? 10 : 0) + (types.symbol ? 15 : 0) + diversityPoints +
      (!findings.repeated ? 5 : 0) + (!findings.sequence ? 5 : 0) + (!findings.common ? 5 : 0);

    // Explicit penalties keep obvious weaknesses low even when they mix character types.
    if (length < 6) score -= 30;
    else if (length < 8) score -= 12;
    if (findings.common) score -= 45;
    if (findings.sequence) score -= 12;
    if (findings.repeated) score -= 10;
    if (findings.personal) score -= 8;
    // Keep score bands consistent with the length guidance shown in the dashboard.
    if (length < 6) score = Math.min(score, 20);
    else if (length < 8) score = Math.min(score, 40);
    else if (length < 11) score = Math.min(score, 60);
    else if (length < 15) score = Math.min(score, 80);
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  function getRecommendations(value, types, findings, score) {
    const advice = [];
    const length = countCharacters(value);
    if (length < 12) advice.push('Use at least 12 characters; a longer passphrase is easier to remember and harder to guess.');
    if (!types.upper) advice.push('Add uppercase letters to increase character variety.');
    if (!types.lower) advice.push('Add lowercase letters to increase character variety.');
    if (!types.number) advice.push('Include numbers where they fit naturally.');
    if (!types.symbol) advice.push('Add a symbol or use a longer, less predictable passphrase.');
    if (findings.common) advice.push('Avoid common passwords and predictable variations of them.');
    if (findings.sequence) advice.push('Remove predictable sequences such as 123 or adjacent keyboard patterns.');
    if (findings.repeated) advice.push('Avoid long runs or repeated character groups.');
    if (findings.personal) advice.push('Avoid names or easily guessable personal information.');
    if (length >= 12 && score >= 61) advice.push('Good characteristics. Make this password unique and do not reuse it elsewhere.');
    advice.push('Consider using a password manager to create and store unique passwords.');
    return advice;
  }

  function setComposition(types) {
    const items = [
      ['lower', 'Lowercase'], ['upper', 'Uppercase'], ['number', 'Numbers'], ['symbol', 'Symbols']
    ];
    byId('composition-list').innerHTML = items.map(([key, label]) =>
      `<span class="composition-item ${types[key] ? 'present' : 'missing'}"><i>${types[key] ? '✓' : '−'}</i> ${label}</span>`
    ).join('');
  }

  function renderSignals(findings) {
    const signals = [];
    if (findings.common) signals.push(['Common password detected', true]);
    else signals.push(['No common password match', false]);
    if (findings.sequence) signals.push(['Predictable sequence detected', true]);
    else signals.push(['No obvious sequence', false]);
    if (findings.repeated) signals.push(['Repeated pattern detected', true]);
    else signals.push(['No excessive repetition', false]);
    if (findings.personal) signals.push(['Personal-style pattern; avoid names', true]);
    byId('signal-list').innerHTML = signals.map(([label, warning]) =>
      `<span class="signal-badge ${warning ? 'warning' : ''}">${warning ? '⚠' : '✓'} ${label}</span>`
    ).join('');
  }

  function updateUI() {
    const value = passwordInput.value;
    const trimmed = value.trim();
    const message = byId('input-message');
    const characterLength = countCharacters(value);
    byId('length-value').textContent = String(characterLength);
    byId('length-fill').style.width = `${Math.min(characterLength / 20, 1) * 100}%`;
    byId('length-status').textContent = characterLength === 0 ? 'Aim for at least 12 characters' :
      characterLength < 8 ? 'Too short — use at least 8 characters' :
      characterLength < 12 ? 'Getting there — 12 or more is better' :
      characterLength < 16 ? 'Good length — consider 16 or more' : 'Excellent length';

    if (!value.length) {
      message.textContent = 'Please enter a password to begin analysis.';
      message.style.color = '';
      setComposition(getCharacterTypes(''));
      byId('signal-list').innerHTML = '<p class="signal-muted">Analysis details appear as you type.</p>';
      byId('recommendations-list').innerHTML = '<li>Enter a password to get personalized recommendations.</li>';
      setScoreDisplay(0, 0, '—', '#738096');
      return;
    }

    if (!trimmed) {
      message.textContent = 'Spaces alone do not make a useful password. Try a longer passphrase.';
      message.style.color = 'var(--warning)';
    } else {
      message.textContent = characterLength < 8 ? 'This password is very short and easy to guess.' : 'Analysis updates instantly as you type.';
      message.style.color = characterLength < 8 ? 'var(--warning)' : '';
    }

    const types = trimmed ? getCharacterTypes(value) : { lower: false, upper: false, number: false, symbol: false };
    const findings = {
      common: checkCommonPassword(value),
      sequence: checkSequences(value),
      repeated: Boolean(trimmed) && checkRepeatedCharacters(value),
      personal: Boolean(trimmed) && checkPersonalPattern(value)
    };
    const score = trimmed ? calculateScore(value, types, findings) : 0;
    const entropy = trimmed ? calculateEntropy(value, types) : 0;
    const classification = classifyScore(score);
    setComposition(types);
    renderSignals(findings);
    const recommendations = trimmed ? getRecommendations(value, types, findings, score) :
      ['Spaces alone do not create a useful password. Try a longer passphrase with varied words and characters.'];
    byId('recommendations-list').innerHTML = recommendations.map((item) => `<li>${item}</li>`).join('');
    setScoreDisplay(score, entropy, classification.label, classification.color);
  }

  function setScoreDisplay(score, entropy, label, color) {
    byId('score-value').textContent = String(score);
    byId('strength-label').textContent = label;
    byId('strength-label').style.color = color;
    byId('meter-fill').style.width = `${score}%`;
    byId('meter-fill').style.background = color;
    byId('strength-meter').setAttribute('aria-valuenow', String(score));
    byId('entropy-value').textContent = String(entropy);
  }

  function toggleVisibility(input, button, shownLabel, hiddenLabel) {
    const show = input.type === 'password';
    input.type = show ? 'text' : 'password';
    button.setAttribute('aria-label', show ? hiddenLabel : shownLabel);
    button.title = show ? hiddenLabel : shownLabel;
  }

  // Rejection sampling avoids modulo bias while using only Web Crypto randomness.
  function randomIndex(max) {
    if (!globalThis.crypto || typeof globalThis.crypto.getRandomValues !== 'function') {
      throw new Error('Secure generation is unavailable here. Open this page in a modern browser over HTTPS or localhost.');
    }
    const ceiling = Math.floor(256 / max) * max;
    const buffer = new Uint8Array(1);
    do { crypto.getRandomValues(buffer); } while (buffer[0] >= ceiling);
    return buffer[0] % max;
  }

  function secureShuffle(characters) {
    for (let i = characters.length - 1; i > 0; i -= 1) {
      const j = randomIndex(i + 1);
      [characters[i], characters[j]] = [characters[j], characters[i]];
    }
    return characters;
  }

  function generatePassword(length, selected) {
    const groups = [];
    if (selected.lower) groups.push('abcdefghijkmnopqrstuvwxyz');
    if (selected.upper) groups.push('ABCDEFGHJKLMNPQRSTUVWXYZ');
    if (selected.numbers) groups.push('23456789');
    if (selected.symbols) groups.push('!@#$%^&*()-_=+');
    if (!groups.length) throw new Error('Select at least one character type.');
    if (length < groups.length) throw new Error('Choose a longer length to include every selected type.');

    const allCharacters = groups.join('');
    const result = groups.map((group) => group[randomIndex(group.length)]);
    while (result.length < length) result.push(allCharacters[randomIndex(allCharacters.length)]);
    return secureShuffle(result).join('');
  }

  passwordInput.addEventListener('input', updateUI);
  byId('toggle-visibility').addEventListener('click', () => toggleVisibility(passwordInput, byId('toggle-visibility'), 'Show password', 'Hide password'));
  byId('clear-password').addEventListener('click', () => { passwordInput.value = ''; updateUI(); passwordInput.focus(); });
  const lengthSlider = byId('generator-length');
  lengthSlider.addEventListener('input', () => { byId('generator-length-output').textContent = lengthSlider.value; });
  byId('generate-button').addEventListener('click', () => {
    const message = byId('generator-message');
    const generatedField = byId('generated-password');
    const selected = {
      lower: byId('gen-lower').checked,
      upper: byId('gen-upper').checked,
      numbers: byId('gen-numbers').checked,
      symbols: byId('gen-symbols').checked
    };
    try {
      generatedField.value = generatePassword(Number(lengthSlider.value), selected);
      generatedField.type = 'password';
      byId('toggle-generated').setAttribute('aria-label', 'Show generated password');
      byId('toggle-generated').title = 'Show generated password';
      byId('copy-generated').disabled = false;
      message.textContent = 'Generated securely. It stays in this page and is not saved.';
      message.className = 'generator-message success';
    } catch (error) {
      message.textContent = error.message;
      message.className = 'generator-message error';
      generatedField.value = '';
      byId('copy-generated').disabled = true;
    }
  });
  byId('toggle-generated').addEventListener('click', () => toggleVisibility(byId('generated-password'), byId('toggle-generated'), 'Show generated password', 'Hide generated password'));
  byId('copy-generated').addEventListener('click', async () => {
    const message = byId('generator-message');
    try {
      await navigator.clipboard.writeText(byId('generated-password').value);
      message.textContent = 'Copied to clipboard. Clear it when you are done.';
      message.className = 'generator-message success';
    } catch (_) {
      message.textContent = 'Clipboard access is unavailable. Select and copy the generated password manually.';
      message.className = 'generator-message error';
    }
  });
  updateUI();
})();

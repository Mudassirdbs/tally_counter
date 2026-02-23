(function () {
  'use strict';

  var root        = document.getElementById('tasbeeh-wrap');
  var countEl     = root.querySelector('#tb-count');
  var phraseEl    = root.querySelector('#tb-phrase');
  var meaningEl   = root.querySelector('#tb-meaning');
  var targetEl    = root.querySelector('#tb-target');
  var barEl       = root.querySelector('#tb-bar');
  var progressWrap= root.querySelector('#tb-progress-wrap');
  var completeEl  = root.querySelector('#tb-complete');
  var customWrap  = root.querySelector('#tb-custom-wrap');
  var customInput = root.querySelector('#tb-custom-input');
  var customPhraseInput = root.querySelector('#tb-custom-phrase');
  var micBtn     = root.querySelector('#tb-mic-btn');
  var selBtns     = root.querySelectorAll('.tb-sel-btn');
  var statTodayEl = root.querySelector('#tb-stat-today');
  var statSetsEl  = root.querySelector('#tb-stat-sets');

  var dhikrList = [
    { arabic: 'سُبْحَانَ اللَّهِ',           roman: 'Subhanallah',       target: 33  },
    { arabic: 'الْحَمْدُ لِلَّهِ',            roman: 'Alhamdulillah',     target: 33  },
    { arabic: 'اللَّهُ أَكْبَرُ',             roman: 'Allahu Akbar',      target: 34  },
    { arabic: 'لَا إِلَٰهَ إِلَّا اللَّهُ', roman: 'La ilaha illallah', target: 100 },
    { arabic: '\u2014',                        roman: 'Other',             target: 33  }
  ];

  var STORAGE_KEY = 'tasbeeh-counter-state-v1';

  var current = 0;
  var count   = 0;
  var todayTotal = 0;
  var todaySets  = 0;
  var recognition = null;

  function todayKey() {
    return new Date().toISOString().slice(0, 10);
  }

  function updateStatsUI() {
    if (statTodayEl) {
      statTodayEl.textContent = todayTotal + ' dhikr';
    }
    if (statSetsEl) {
      statSetsEl.textContent = String(todaySets);
    }
  }

  function saveState() {
    try {
      var state = {
        version: 1,
        current: current,
        count: count,
        dhikrList: {
          customTarget: dhikrList[4].target,
          customPhrase: (customPhraseInput && customPhraseInput.value) || ''
        },
        customInputValue: customInput ? customInput.value : null,
        todayDate: todayKey(),
        todayTotal: todayTotal,
        todaySets: todaySets
      };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      // ignore storage errors
    }
  }

  function loadState() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      var state = JSON.parse(raw);
      if (!state || typeof state !== 'object') return;

      var savedDate = state.todayDate;
      var today = todayKey();

      current = typeof state.current === 'number' ? state.current : 0;
      count   = typeof state.count === 'number' ? state.count : 0;

      if (state.dhikrList && typeof state.dhikrList.customTarget === 'number') {
        dhikrList[4].target = state.dhikrList.customTarget;
      }
      if (customInput && typeof state.customInputValue === 'string') {
        customInput.value = state.customInputValue;
      }
      if (customPhraseInput && state.dhikrList && typeof state.dhikrList.customPhrase === 'string') {
        customPhraseInput.value = state.dhikrList.customPhrase;
        updateCustomPhrase();
      }

      if (savedDate === today) {
        todayTotal = typeof state.todayTotal === 'number' ? state.todayTotal : 0;
        todaySets  = typeof state.todaySets === 'number' ? state.todaySets : 0;
      } else {
        todayTotal = 0;
        todaySets  = 0;
      }

      setDhikr(current);
      count = state.count || 0;
      render();
      updateStatsUI();
    } catch (e) {
      // ignore parse/load errors
    }
  }

  function updateCustomPhrase() {
    if (!customPhraseInput) return;
    var text = customPhraseInput.value.trim();
    if (!text) {
      dhikrList[4].arabic = '\u2014';
      dhikrList[4].roman  = 'Custom dhikr';
    } else {
      dhikrList[4].arabic = text;
      dhikrList[4].roman  = 'Custom dhikr';
    }
    if (current === 4) {
      phraseEl.textContent  = dhikrList[4].arabic;
      meaningEl.textContent = dhikrList[4].roman;
    }
  }

  function render() {
    var d   = dhikrList[current];
    var pct = Math.min(count / d.target * 100, 100);
    countEl.textContent  = count;
    targetEl.textContent = count + ' / ' + d.target;
    barEl.style.width    = pct + '%';
    progressWrap.setAttribute('aria-valuenow', Math.round(pct));
    if (count > 0 && count % d.target === 0) {
      completeEl.classList.add('show');
    } else {
      completeEl.classList.remove('show');
    }

    // For custom dhikr: hide inputs once user has started counting
    if (current === 4 && customWrap) {
      if (count >= 5) {
        customWrap.style.display = 'none';
      } else {
        customWrap.style.display = 'block';
      }
    }

    updateStatsUI();
  }

  function setDhikr(idx) {
    current = idx;
    count   = 0;
    var d   = dhikrList[idx];
    phraseEl.textContent  = d.arabic;
    meaningEl.textContent = d.roman;
    customWrap.style.display = idx === 4 ? 'block' : 'none';
    if (idx === 4) {
      dhikrList[4].target = Math.max(1, parseInt(customInput.value, 10) || 33);
      updateCustomPhrase();
    }
    selBtns.forEach(function (btn, i) {
      btn.setAttribute('aria-pressed', i === idx ? 'true' : 'false');
    });
    render();
    saveState();
  }

  selBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      setDhikr(parseInt(btn.getAttribute('data-dhikr'), 10));
    });
  });

  customInput.addEventListener('input', function () {
    if (current === 4) {
      dhikrList[4].target = Math.max(1, parseInt(customInput.value, 10) || 33);
      render();
      saveState();
    }
  });

  if (customPhraseInput) {
    customPhraseInput.addEventListener('input', function () {
      if (current === 4) {
        updateCustomPhrase();
      }
      saveState();
    });
  }

  if (micBtn && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
    var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.lang = 'ar-SA';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    micBtn.addEventListener('click', function () {
      try {
        recognition.start();
      } catch (e) {
        // ignore repeated start errors
      }
    });

    recognition.addEventListener('result', function (event) {
      if (!event.results || !event.results[0] || !event.results[0][0]) return;
      var transcript = event.results[0][0].transcript;
      if (!customPhraseInput) return;
      customPhraseInput.value = transcript;
      updateCustomPhrase();
      saveState();
    });
  } else if (micBtn) {
    // Hide mic button if speech recognition not supported
    micBtn.style.display = 'none';
  }

  root.querySelector('#tb-main-btn').addEventListener('click', function () {
    count++;
    todayTotal++;
    var d = dhikrList[current];
    if (count > 0 && (count + 1) % d.target === 0) {
      todaySets++;
    }
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
    countEl.classList.remove('pop');
    void countEl.offsetWidth;
    countEl.classList.add('pop');
    setTimeout(function () { countEl.classList.remove('pop'); }, 120);
    render();
    saveState();
  });

  root.querySelector('#tb-undo-btn').addEventListener('click', function () {
    if (count > 0) {
      var d = dhikrList[current];
      if (count % d.target === 0 && todaySets > 0) {
        todaySets--;
      }
      count--;
      if (todayTotal > 0) {
        todayTotal--;
      }
      render();
      saveState();
    }
  });

  root.querySelector('#tb-reset-btn').addEventListener('click', function () {
    count = 0;
    render();
    saveState();
  });

  loadState();
  render();
}());

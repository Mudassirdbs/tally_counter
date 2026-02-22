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
  var selBtns     = root.querySelectorAll('.tb-sel-btn');

  var dhikrList = [
    { arabic: 'سُبْحَانَ اللَّهِ',           roman: 'Subhanallah',       target: 33  },
    { arabic: 'الْحَمْدُ لِلَّهِ',            roman: 'Alhamdulillah',     target: 33  },
    { arabic: 'اللَّهُ أَكْبَرُ',             roman: 'Allahu Akbar',      target: 34  },
    { arabic: 'لَا إِلَٰهَ إِلَّا اللَّهُ', roman: 'La ilaha illallah', target: 100 },
    { arabic: '\u2014',                        roman: 'Other',             target: 33  }
  ];

  var current = 0;
  var count   = 0;

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
    }
    selBtns.forEach(function (btn, i) {
      btn.setAttribute('aria-pressed', i === idx ? 'true' : 'false');
    });
    render();
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
    }
  });

  root.querySelector('#tb-main-btn').addEventListener('click', function () {
    count++;
    countEl.classList.remove('pop');
    void countEl.offsetWidth;
    countEl.classList.add('pop');
    setTimeout(function () { countEl.classList.remove('pop'); }, 120);
    render();
  });

  root.querySelector('#tb-undo-btn').addEventListener('click', function () {
    if (count > 0) { count--; render(); }
  });

  root.querySelector('#tb-reset-btn').addEventListener('click', function () {
    count = 0;
    render();
  });

  render();
}());

/* الشاشات وإدارة جولة اللعب */
(function (DF) {
  'use strict';
  var U = DF.util, store = DF.store, audio = DF.audio;

  function $(id) { return document.getElementById(id); }

  var IC = {
    star: '<svg class="star" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.2l3 6.2 6.8 1-4.9 4.8 1.2 6.8L12 17.8 5.9 21l1.2-6.8L2.2 9.4l6.8-1z"/></svg>',
    medal: '<svg class="medal" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 1.5h4.2l2.6 6-3.8 1.6zM18 1.5h-4.2l-2.6 6 3.8 1.6z"/><circle cx="12" cy="15" r="6.8"/><path d="M12 11l1.2 2.5 2.7.4-2 1.9.5 2.7-2.4-1.3-2.4 1.3.5-2.7-2-1.9 2.7-.4z" fill="#fffdf6"/></svg>',
    back: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    gear: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="7.6" fill="none" stroke="currentColor" stroke-width="4.2" stroke-dasharray="3.2 2.77"/><circle cx="12" cy="12" r="5.4" fill="none" stroke="currentColor" stroke-width="2.6"/></svg>',
    pause: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="5" width="4.4" height="14" rx="1.6" fill="currentColor"/><rect x="13.6" y="5" width="4.4" height="14" rx="1.6" fill="currentColor"/></svg>',
    say: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9.5h3.5L12 5.6v12.8l-4.5-3.9H4z" fill="currentColor"/><path d="M15.2 9a4.2 4.2 0 0 1 0 6M17.8 6.4a8 8 0 0 1 0 11.2" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
    lock: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10.5" width="14" height="10" rx="2.6" fill="currentColor"/><path d="M8.2 10.5V8a3.8 3.8 0 0 1 7.6 0v2.5" fill="none" stroke="currentColor" stroke-width="2.4"/></svg>'
  };

  function starSvg(on) { return on ? IC.star : IC.star.replace('class="star"', 'class="star off"'); }
  function stars(n, max) {
    var h = '';
    for (var i = 0; i < (max || 3); i++) h += starSvg(i < n);
    return h;
  }
  function em(e) { return '<span class="emoji">' + e + '</span>'; }
  function pic(w) {
    return w.img ? '<img class="pic-img" src="' + U.esc(w.img) + '" alt="">' : em(w.emoji);
  }

  function character() {
    var id = store.state.character;
    return DF.CHARACTERS.filter(function (c) { return c.id === id; })[0] || DF.CHARACTERS[0];
  }

  function worldStars(w) {
    if (!w.stages) return 0;
    return w.stages.reduce(function (n, s) { return n + store.stageStars(s.id); }, 0);
  }

  function stageOpen(w, i) { return i === 0 || store.stageStars(w.stages[i - 1].id) > 0; }

  /* ---------- التنقّل ---------- */
  var current = 'home';
  var view = { world: null, stage: 0 };
  var RENDER = {};

  function show(name) {
    var prev = current;
    current = name;
    var list = document.querySelectorAll('.screen');
    for (var i = 0; i < list.length; i++) list[i].hidden = list[i].id !== 'screen-' + name;
    if (prev === 'game' && name !== 'game') { runner.stop(); audio.stop(); }
    if (RENDER[name]) RENDER[name]();
  }

  function chipsHTML() {
    return '<span class="chip" title="النجوم">' + IC.star + U.num(store.totalStars()) + '</span>' +
      '<span class="chip" title="نقاط المدرسة">' + IC.medal + U.num(store.points()) + '</span>';
  }
  function fillChips() {
    $('home-chips').innerHTML = chipsHTML();
    var list = document.querySelectorAll('[data-chips]');
    for (var i = 0; i < list.length; i++) list[i].innerHTML = chipsHTML();
  }

  /* ---------- الرئيسية ---------- */
  RENDER.home = function () {
    fillChips();
    $('home-hero').textContent = character().emoji;
  };

  /* ---------- العوالم ---------- */
  RENDER.worlds = function () {
    fillChips();
    $('world-list').innerHTML = DF.WORLDS.map(function (w) {
      var side = w.ready
        ? IC.star + '<span>' + U.num(worldStars(w)) + ' / ' + U.num(w.count * 3) + '</span>'
        : '<span class="soon">قريباً</span>';
      return '<button class="world" type="button" data-world="' + w.id + '"' + (w.ready ? '' : ' disabled') + '>' +
        '<span class="world-icon" style="background:' + w.color + '33">' + w.icon + '</span>' +
        '<span class="world-text"><span class="world-name">' + U.num(w.id) + '. ' + w.title + '</span><br>' +
        '<span class="world-meta">' + w.topic + ' · ' + w.grade + '</span></span>' +
        '<span class="world-side">' + side + '</span></button>';
    }).join('');
  };

  /* ---------- المراحل ---------- */
  RENDER.stages = function () {
    fillChips();
    var w = view.world;
    $('stages-title').textContent = w.title;
    var nextMarked = false;
    $('stage-list').innerHTML = w.stages.map(function (s, i) {
      var open = stageOpen(w, i), got = store.stageStars(s.id);
      var isNext = open && got === 0 && !nextMarked;
      if (isNext) nextMarked = true;
      var label = s.letters.map(function (id) { return '<span>' + DF.LETTER[id].char + '</span>'; }).join('');
      return '<button class="stage' + (isNext ? ' next' : '') + '" type="button" data-stage="' + i + '"' + (open ? '' : ' disabled') +
        ' aria-label="المرحلة ' + U.num(i + 1) + '">' +
        '<span class="stage-num">' + (open ? U.num(i + 1) : IC.lock) + '</span>' +
        '<span class="stage-letters">' + label + '</span>' +
        '<span class="stage-stars">' + stars(got) + '</span></button>';
    }).join('');
  };

  /* ---------- تعرّف على حروف المرحلة ---------- */
  RENDER.intro = function () {
    var w = view.world, s = w.stages[view.stage];
    $('intro-title').textContent = 'المرحلة ' + U.num(view.stage + 1);
    $('intro-cards').innerHTML = s.letters.map(function (id) {
      var L = DF.LETTER[id], wd = L.words[0];
      return '<button class="letter-card" type="button" data-letter="' + id + '" aria-label="حرف ' + L.name + '">' +
        '<span class="letter-big">' + L.char + '</span>' +
        '<span class="letter-word">' + pic(wd) + '<span>' + wd.text + '</span></span></button>';
    }).join('');
  };

  function sayLetterCard(btn) {
    var L = DF.LETTER[btn.getAttribute('data-letter')], wd = L.words[0];
    var on = document.querySelectorAll('.letter-card.on');
    for (var i = 0; i < on.length; i++) on[i].classList.remove('on');
    btn.classList.add('on');
    setTimeout(function () { btn.classList.remove('on'); }, 900);
    audio.say({ id: 'intro-' + L.id, text: L.name, say: L.say + '. ' + wd.say, parts: ['name-' + L.id, 'word-' + wd.id] }, { interrupt: true });
  }

  /* ---------- الشخصيات ---------- */
  RENDER.chars = function () {
    fillChips();
    var total = store.totalStars(), sel = character().id;
    $('char-grid').innerHTML = DF.CHARACTERS.map(function (ch) {
      var open = total >= ch.need, state, cls = 'char';
      if (ch.id === sel) { cls += ' selected'; state = 'معك الآن'; }
      else if (open) { cls += ' open'; state = 'اختيار'; }
      else state = IC.lock + '<span>' + U.num(total) + ' / ' + U.num(ch.need) + '</span>' + IC.star;
      return '<button class="' + cls + '" type="button" data-char="' + ch.id + '"' + (open ? '' : ' disabled') + '>' +
        em(ch.emoji) + '<span class="char-name">' + ch.name + '</span><span class="char-kind">' + ch.kind + '</span>' +
        '<span class="char-state">' + state + '</span>' +
        (open ? '' : '<span class="char-bar"><i style="width:' + Math.round(100 * total / ch.need) + '%"></i></span>') +
        '</button>';
    }).join('');
  };

  /* ---------- نافذة ---------- */
  function modal(html) {
    $('modal-card').innerHTML = html;
    $('modal').hidden = false;
  }
  function closeModal() { $('modal').hidden = true; }

  function settingsModal() {
    var on = store.state.sound;
    modal('<h2 class="modal-title">الإعدادات</h2>' +
      '<button class="btn ' + (on ? 'green' : 'ghost') + '" type="button" data-act="sound">الصوت: ' + (on ? 'شغّال' : 'مطفأ') + '</button>' +
      '<button class="btn ghost" type="button" data-act="test-sound">جرّب الصوت</button>' +
      '<button class="btn ghost" type="button" data-act="reset">مسح التقدّم</button>' +
      '<p class="modal-note">التقدّم محفوظ على هذا الجهاز فقط.</p>' +
      '<p class="modal-diag" id="diag" dir="ltr">' + U.esc(audio.diag()) + '</p>' +
      '<button class="btn" type="button" data-act="close">تم</button>');
  }

  function pauseModal() {
    runner.pause(); audio.stop();
    modal('<h2 class="modal-title">استراحة</h2>' +
      '<button class="btn" type="button" data-act="resume">متابعة</button>' +
      '<button class="btn ghost" type="button" data-act="restart">إعادة المرحلة</button>' +
      '<button class="btn ghost" type="button" data-act="quit">خروج</button>');
  }

  /* ---------- جولة اللعب ---------- */
  var runner = new DF.Runner($('game-canvas'));
  var game = null;
  var timers = [];

  function later(fn, ms) { timers.push(setTimeout(fn, ms)); }
  function clearTimers() { timers.forEach(clearTimeout); timers = []; }

  function potentialStars(m) { return m === 0 ? 3 : m <= 1 ? 2 : 1; }

  function updateHud() {
    var n = DF.config.questionsPerStage;
    $('progress-fill').style.width = (100 * game.i / n) + '%';
    $('progress-num').textContent = U.num(game.i) + '/' + U.num(n);
    $('hud-stars').innerHTML = stars(potentialStars(game.mistakes));
  }

  function setPrompt(q) {
    var showEl = $('prompt-show');
    if (q.show.kind === 'pic') showEl.innerHTML = pic(q.show.word);
    else if (q.show.kind === 'letter') showEl.textContent = q.show.letter.char;
    else showEl.innerHTML = '';
    $('prompt-text').textContent = q.prompt.text;
  }

  function toast(text, bad) {
    var t = $('toast');
    t.className = 'toast' + (bad ? ' bad' : '');
    t.textContent = text;
    void t.offsetWidth;
    t.classList.add('show');
  }

  function layoutGame() {
    var p = $('prompt').getBoundingClientRect(), g = $('screen-game').getBoundingClientRect();
    runner.configure({ hudBottom: p.bottom - g.top });
    runner.resize();
    $('toast').style.top = Math.round(runner.hz + 4) + 'px';
  }

  function startStage(w, si) {
    clearTimers(); audio.stop(); closeModal();
    view.world = w; view.stage = si;
    game = { world: w, si: si, stage: w.stages[si], qs: DF.Q.build(w, si), i: 0, mistakes: 0, done: false };
    show('game');
    var sp = DF.SPEEDS[w.speed];
    runner.reset();
    runner.configure({ character: character(), speed: sp.speed, wait: sp.wait, hint: store.totalStars() === 0 });
    setPrompt(game.qs[0]);
    updateHud();
    layoutGame();
    runner.state = 'run';
    runner.start();
    later(nextQuestion, 600);
  }

  function nextQuestion() {
    if (!game || game.done) return;
    var q = game.qs[game.i];
    setPrompt(q);
    runner.ask(q.options, q.correct);
    audio.say(q.prompt);
  }

  runner.on('choose', function () { audio.stop(); audio.sfx('tap'); });
  runner.on('blocked', function () { audio.sfx('blocked'); });

  runner.on('correct', function (lane) {
    var q = game.qs[game.i], opt = q.options[lane], pr = DF.Q.praise();
    game.i++;
    updateHud();
    audio.sfx('correct');
    toast(pr.text);
    audio.say(opt.kind === 'pic' ? { id: 'word-' + opt.word.id, text: opt.word.text, say: opt.word.say } : pr);
  });

  runner.on('wrong', function (lane) {
    var q = game.qs[game.i];
    game.mistakes++;
    updateHud();
    audio.sfx('wrong');
    toast(DF.Q.retry.text, true);
    later(function () {
      if (!game || game.done || current !== 'game') return;
      audio.say(DF.Q.describe(q.options[lane]));
      audio.say(DF.Q.retry);
      if (q.type !== 'pic2letter') audio.say(q.prompt);
    }, 350);
  });

  runner.on('passed', function () {
    if (game.i >= game.qs.length) finishStage();
    else nextQuestion();
  });

  function finishStage() {
    game.done = true;
    var got = potentialStars(game.mistakes);
    var res = store.setStageResult(game.stage.id, got, game.mistakes);
    res.stars = got;
    game.result = res;
    runner.finish();
    audio.sfx('win');
    later(function () { show('result'); }, 1700);
  }

  /* ---------- النتيجة ---------- */
  RENDER.result = function () {
    var res = game.result, w = game.world;
    var titles = { 3: 'ممتاز!', 2: 'أحسنت!', 1: 'جيّد!' };
    var notes = {
      3: 'بدون أي غلطة.',
      2: 'غلطة واحدة فقط. أعد المحاولة لتجمع النجمة الثالثة.',
      1: 'أنهيت المرحلة. أعد المحاولة لتجمع نجوماً أكثر.'
    };
    $('result-hero').textContent = character().emoji;
    $('result-title').textContent = titles[res.stars];
    $('result-note').textContent = notes[res.stars];
    $('result-stars').innerHTML = stars(0);
    var svgs = $('result-stars').querySelectorAll('svg');
    for (var i = 0; i < res.stars; i++) {
      (function (k) {
        later(function () {
          svgs[k].classList.add('lit');
          audio.sfx('star');
        }, 350 + k * 420);
      })(i);
    }
    $('result-rows').innerHTML =
      '<span class="chip">' + IC.star + (res.gained ? 'نجوم جديدة: ' + U.num(res.gained) : 'لا نجوم جديدة') + '</span>' +
      '<span class="chip">' + IC.star + 'المجموع: ' + U.num(res.total) + '</span>' +
      '<span class="chip">' + IC.medal + 'نقاط المدرسة: ' + U.num(store.points()) + '</span>';
    var un = $('result-unlock');
    if (res.unlocked.length) {
      var ch = res.unlocked[0];
      un.hidden = false;
      un.innerHTML = em(ch.emoji) + '<span>شخصية جديدة: ' + ch.name + ' ' + ch.kind + '</span>';
      later(function () { audio.sfx('unlock'); }, 1800);
    } else if (res.newPoints > 0) {
      un.hidden = false;
      un.innerHTML = IC.medal.replace('<svg', '<svg width="40" height="40"') + '<span>نقطة مدرسية جديدة!</span>';
    } else un.hidden = true;

    var hasNext = game.si + 1 < w.stages.length;
    $('btn-next').textContent = hasNext ? 'المرحلة التالية' : 'العوالم';
  };

  /* ---------- الأحداث ---------- */
  function bind() {
    ['touchend', 'click', 'keydown'].forEach(function (ev) {
      document.addEventListener(ev, function () { audio.unlock(); }, { capture: true, passive: true });
    });

    var backs = document.querySelectorAll('.icon-btn.back');
    for (var i = 0; i < backs.length; i++) backs[i].innerHTML = IC.back;
    $('btn-settings').innerHTML = IC.gear;
    $('btn-pause').innerHTML = IC.pause;
    $('btn-say').innerHTML = IC.say;

    document.addEventListener('click', function (e) {
      var t = e.target.closest ? e.target.closest('button') : null;
      if (!t || t.disabled) return;
      var go = t.getAttribute('data-go');
      if (go) { audio.sfx('tap'); audio.stop(); show(go); return; }
      if (t.hasAttribute('data-world')) {
        audio.sfx('tap');
        view.world = DF.worldById(+t.getAttribute('data-world'));
        show('stages'); return;
      }
      if (t.hasAttribute('data-stage')) {
        audio.sfx('tap');
        view.stage = +t.getAttribute('data-stage');
        show('intro'); return;
      }
      if (t.hasAttribute('data-letter')) { sayLetterCard(t); return; }
      if (t.hasAttribute('data-char')) {
        store.state.character = t.getAttribute('data-char');
        store.save();
        audio.sfx('star');
        RENDER.chars(); return;
      }
      var act = t.getAttribute('data-act');
      if (act) onAction(act, t);
    });

    $('btn-play').addEventListener('click', function () { audio.sfx('tap'); show('worlds'); });
    $('btn-chars').addEventListener('click', function () { audio.sfx('tap'); show('chars'); });
    $('btn-settings').addEventListener('click', function () { audio.sfx('tap'); settingsModal(); });
    $('btn-start').addEventListener('click', function () { startStage(view.world, view.stage); });
    $('btn-pause').addEventListener('click', pauseModal);
    $('btn-say').addEventListener('click', function () {
      if (game && !game.done) audio.say(game.qs[Math.min(game.i, game.qs.length - 1)].prompt, { interrupt: true });
    });
    $('btn-retry').addEventListener('click', function () { startStage(game.world, game.si); });
    $('btn-to-stages').addEventListener('click', function () { clearTimers(); show('stages'); });
    $('btn-next').addEventListener('click', function () {
      clearTimers();
      if (game.si + 1 < game.world.stages.length) { view.stage = game.si + 1; show('intro'); }
      else show('worlds');
    });

    audio.onSpeaking(function (on) { $('btn-say').classList.toggle('speaking', on); });

    var rz = 0;
    window.addEventListener('resize', function () {
      clearTimeout(rz);
      rz = setTimeout(function () { if (current === 'game') layoutGame(); }, 120);
    });
    document.addEventListener('visibilitychange', function () {
      if (document.hidden && current === 'game' && game && !game.done && $('modal').hidden) pauseModal();
    });
  }

  function onAction(act, btn) {
    if (act === 'close') { closeModal(); return; }
    if (act === 'test-sound') {
      audio.test();
      setTimeout(function () { var d = $('diag'); if (d) d.textContent = audio.diag(); }, 1200);
      return;
    }
    if (act === 'sound') {
      store.state.sound = !store.state.sound;
      store.save();
      audio.setEnabled(store.state.sound);
      audio.sfx('tap');
      settingsModal(); return;
    }
    if (act === 'reset') {
      if (btn.getAttribute('data-sure')) {
        store.reset();
        audio.setEnabled(true);
        closeModal(); show('home');
      } else {
        btn.setAttribute('data-sure', '1');
        btn.className = 'btn danger';
        btn.textContent = 'اضغط مرة ثانية للتأكيد';
      }
      return;
    }
    if (act === 'resume') {
      closeModal(); runner.resume();
      if (game && !game.done && (runner.state === 'approach' || runner.state === 'wait')) audio.say(game.qs[game.i].prompt);
      return;
    }
    if (act === 'restart') { startStage(game.world, game.si); return; }
    if (act === 'quit') { closeModal(); clearTimers(); game.done = true; show('stages'); return; }
  }

  function boot() {
    document.documentElement.lang = 'ar';
    document.documentElement.dir = 'rtl';
    store.load();
    audio.setEnabled(store.state.sound);
    view.world = DF.WORLDS[0];
    bind();
    show('home');
    if (document.fonts && document.fonts.load) {
      try {
        document.fonts.load('500 40px "Thmanyah"', 'ب');
        document.fonts.load('700 40px "Thmanyah Display"', 'ب');
      } catch (e) { /* تجاهل */ }
    }
  }

  DF.ui = { show: show, startStage: startStage, runner: runner };
  boot();
})(window.DF);

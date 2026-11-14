/* توليد الأسئلة. كل سؤال: { type, prompt, show, options[3], correct }.
   لإضافة عالم جديد: أضف مولّد مراحل في BUILDERS ومولّد اختبار في TESTS حسب stage.kind */
(function (DF) {
  'use strict';
  var U = DF.util;

  var PRAISE = [
    { id: 'praise-1', text: 'أحسنت!', say: 'أَحْسَنْت' },
    { id: 'praise-2', text: 'ممتاز!', say: 'مُمْتَاز' },
    { id: 'praise-3', text: 'رائع!', say: 'رَائِع' },
    { id: 'praise-4', text: 'صحيح!', say: 'صَحِيح' }
  ];
  var RETRY = { id: 'retry', text: 'حاول مرة أخرى', say: 'حَاوِلْ مَرَّةً أُخْرَى' };

  function letterOpt(L) { return { kind: 'letter', key: L.id, text: L.char, letter: L }; }
  function picOpt(w) { return { kind: 'pic', key: w.id, emoji: w.emoji, img: w.img, word: w }; }

  /* وصف الخيار الغلط بعد ما يخبط فيه الطفل */
  function describe(opt) {
    if (opt.describe) return opt.describe;
    if (opt.kind === 'letter') {
      return { id: 'this-' + opt.letter.id, text: 'هذا حرف ' + opt.letter.name, say: 'هَذَا حَرْفُ ' + opt.letter.sayDef, parts: ['this-is', 'harf-' + opt.letter.id] };
    }
    return { id: 'word-' + opt.word.id, text: opt.word.text, say: opt.word.say };
  }

  /* ---------- أسئلة الحروف ---------- */
  function wordPicker() {
    var used = {};
    return function (letterId, clearOnly) {
      var ws = DF.LETTER[letterId].words.filter(function (w) { return !clearOnly || !w.weak; });
      var freshWs = ws.filter(function (w) { return !used[w.id]; });
      var w = U.pick(freshWs.length ? freshWs : ws);
      used[w.id] = true;
      return w;
    };
  }

  /* wrong = حرفان غلط (لأسئلة الحروف)، picLetters = حرفان لصور غلط (لسؤال الصور) */
  function letterQ(type, ans, wrong, picLetters, wordFor) {
    var L = DF.LETTER[ans], q = { type: type, answer: ans }, opts;
    function wrongOpts() { return wrong.map(function (id) { return letterOpt(DF.LETTER[id]); }); }
    if (type === 'listen') {
      q.prompt = { id: 'q-where-' + L.id, text: 'أين حرف ' + L.name + '؟', say: 'أَيْنَ حَرْفُ ' + L.sayDef + '؟', parts: ['q-where', 'harf-' + L.id] };
      q.show = { kind: 'listen' };
      opts = [letterOpt(L)].concat(wrongOpts());
    } else if (type === 'pic2letter') {
      var w = wordFor(ans, false);
      q.prompt = { id: 'q-first-' + w.id, text: 'بأيّ حرف تبدأ الكلمة؟', say: w.say + '. بِأَيِّ حَرْفٍ تَبْدَأُ كَلِمَةُ ' + w.say + '؟', parts: ['word-' + w.id, 'q-first', 'word-' + w.id] };
      q.show = { kind: 'pic', word: w };
      opts = [letterOpt(L)].concat(wrongOpts());
    } else {
      var target = wordFor(ans, true);
      q.prompt = { id: 'q-pic-' + L.id, text: 'أيّ صورة تبدأ بحرف ' + L.name + '؟', say: 'أَيُّ صُورَةٍ تَبْدَأُ بِحَرْفِ ' + L.sayDef + '؟', parts: ['q-pic', 'harf-' + L.id] };
      q.show = { kind: 'letter', letter: L };
      opts = [picOpt(target)].concat(picLetters.map(function (id) { return picOpt(wordFor(id, true)); }));
    }
    var order = U.shuffle([0, 1, 2]);
    q.options = order.map(function (k) { return opts[k]; });
    q.correct = order.indexOf(0);
    return q;
  }

  /* مرحلة عادية */
  function buildLetters(world, si) {
    var mine = world.stages[si].letters.slice();
    var learned = [];
    for (var s = 0; s <= si; s++) learned = learned.concat(world.stages[s].letters);
    var earlier = learned.filter(function (id) { return mine.indexOf(id) < 0; });

    // كل حرف جوابه مرتين على الأقل، وأول أربعة أسئلة تمرّ على الحروف الأربعة
    var answers = U.shuffle(mine).concat(U.shuffle(mine)).concat(U.sample(mine, 2));
    for (var i = 4; i < answers.length; i++) {
      if (answers[i] === answers[i - 1]) {
        for (var j = i + 1; j < answers.length; j++) {
          if (answers[j] !== answers[i - 1] && answers[j] !== answers[i]) {
            var t = answers[i]; answers[i] = answers[j]; answers[j] = t; break;
          }
        }
      }
    }
    var types = ['listen', 'listen', 'listen', 'listen', 'pic2letter', 'pic2letter', 'pic2letter', 'letter2pic', 'letter2pic', 'listen'];
    var wordFor = wordPicker();

    function wrongLetters(ans, pos) {
      var a = U.shuffle(mine.filter(function (id) { return id !== ans; }));
      var out = [a[0]];
      var sim = (DF.SIMILAR[ans] || []).filter(function (id) { return earlier.indexOf(id) >= 0; });
      var b = sim.length && Math.random() < 0.7 ? sim : earlier;
      if (pos >= 4 && b.length) out.push(U.pick(b)); else out.push(a[1]);
      return out;
    }

    return answers.slice(0, DF.config.questionsPerStage).map(function (ans, pos) {
      var pics = U.sample(learned.filter(function (id) { return id !== ans; }), 2);
      return letterQ(types[pos], ans, wrongLetters(ans, pos), pics, wordFor);
    });
  }

  /* اختبار تحديد المستوى: حروف من كل المراحل، والخيارات الغلط من الحروف المتقاربة */
  function testLetters(world) {
    var all = [];
    var answers = world.stages.map(function (s) { all = all.concat(s.letters); return U.pick(s.letters); });
    var rest = U.shuffle(all.filter(function (id) { return answers.indexOf(id) < 0; }));
    // حرف من كل مرحلة، والباقي عشوائي
    answers = U.shuffle(answers.concat(rest.slice(0, Math.max(0, DF.config.testQuestions - answers.length))));
    var types = [];
    ['listen', 'pic2letter', 'letter2pic'].forEach(function (t, k) {
      var n = Math.round(answers.length * [0.42, 0.33, 0.25][k]);
      for (var i = 0; i < n; i++) types.push(t);
    });
    while (types.length < answers.length) types.push('listen');
    types = U.shuffle(types).slice(0, answers.length);
    var wordFor = wordPicker();

    return answers.map(function (ans, pos) {
      var others = all.filter(function (id) { return id !== ans; });
      var sim = U.shuffle(DF.SIMILAR[ans] || []).slice(0, 2);
      var fill = U.shuffle(others.filter(function (id) { return sim.indexOf(id) < 0; }));
      var wrong = sim.concat(fill).slice(0, 2);
      return letterQ(types[pos], ans, wrong, U.sample(others, 2), wordFor);
    });
  }

  /* ---------- أسئلة الحركات ---------- */
  function seal(q, opts) {
    var order = U.shuffle([0, 1, 2]);
    q.options = order.map(function (k) { return opts[k]; });
    q.correct = order.indexOf(0);
    return q;
  }

  function sylOpt(L, h) {
    var s = DF.syl(L, h);
    return { kind: 'text', key: s.key, text: s.text,
      describe: { id: 'this-syl-' + s.key, text: s.text, say: s.say + '. ' + L.sayDef + ' مَعَ ' + h.say, parts: ['syl-' + s.key] } };
  }

  function otherLetters(L, pool) {
    var sim = U.shuffle((DF.SIMILAR[L.id] || []).filter(function (id) { return pool.indexOf(id) >= 0; }));
    var rest = U.shuffle(pool.filter(function (id) { return id !== L.id && sim.indexOf(id) < 0; }));
    return sim.slice(0, 1).concat(rest).slice(0, 2).map(function (id) { return DF.LETTER[id]; });
  }
  function otherHarakat(h) { return U.shuffle(DF.HARAKAT.filter(function (x) { return x !== h; })); }

  /* الأنواع: syl-listen (نفس الحركة، حروف مختلفة)، syl-same (نفس الحرف، ثلاث حركات)،
     haraka-name (أين الفتحة؟)، pic-one / pic-same (الصوت الأول بالكلمة)، mix (حرف وحركة) */
  function harakaQ(type, L, h, pool, entry) {
    var s = DF.syl(L, h), q = { type: type, answer: s.key }, wrong;
    var sameLetter = otherHarakat(h).map(function (x) { return sylOpt(L, x); });
    function sameHaraka() { return otherLetters(L, pool).map(function (X) { return sylOpt(X, h); }); }

    if (type === 'haraka-name') {
      q.prompt = { id: 'q-haraka-' + h.id, text: 'أين ' + h.name + '؟', say: 'أَيْنَ ' + h.say + '؟', parts: ['q-where-haraka', 'haraka-' + h.id] };
      q.show = { kind: 'listen' };
      wrong = sameLetter;
    } else if (type === 'pic-one' || type === 'pic-same') {
      var w = entry.word;
      q.prompt = { id: 'q-sound-' + w.id, text: 'ما الصوت الأول في الكلمة؟', say: w.say + '. مَا الصَّوْتُ الْأَوَّلُ فِي كَلِمَةِ ' + w.say + '؟', parts: ['word-' + w.id, 'q-first-sound', 'word-' + w.id] };
      q.show = { kind: 'pic', word: w };
      q.noRepeat = true;
      wrong = type === 'pic-one' ? sameHaraka() : sameLetter;
    } else {
      q.prompt = { id: 'q-syl-' + s.key, text: 'أين ' + L.name + ' مع ' + h.name + '؟', say: s.say + '. أَيْنَ ' + L.sayDef + ' مَعَ ' + h.say + '؟', parts: ['syl-' + s.key, 'q-where-syl-' + s.key] };
      q.show = { kind: 'listen' };
      if (type === 'syl-listen') wrong = sameHaraka();
      else if (type === 'syl-same') wrong = sameLetter;
      else wrong = [sameLetter[0], sameHaraka()[0]];
    }
    return seal(q, [sylOpt(L, h)].concat(wrong));
  }

  function harakaSet(types, pool, fixed) {
    var letters = U.shuffle(pool), li = 0, hs = [], used = {};
    function nextH() { if (!hs.length) hs = U.shuffle(DF.HARAKAT); return hs.pop(); }
    return types.map(function (type) {
      var h = fixed || nextH();
      if (type === 'pic-one' || type === 'pic-same') {
        var c = DF.HARAKA_WORDS.filter(function (e) {
          return pool.indexOf(e.letter.id) >= 0 && (type === 'pic-same' || e.haraka === h);
        });
        var fresh = c.filter(function (e) { return !used[e.word.id]; });
        var e = U.pick(fresh.length ? fresh : c);
        used[e.word.id] = true;
        return harakaQ(type, e.letter, e.haraka, pool, e);
      }
      var L = DF.LETTER[letters[li++ % letters.length]];
      return harakaQ(type, L, h, pool);
    });
  }

  function buildHarakat(world, si) {
    var st = world.stages[si];
    return harakaSet(st.types, st.letters, st.haraka ? DF.HARAKA[st.haraka] : null);
  }

  function testHarakat() {
    var types = ['mix', 'mix', 'mix', 'mix', 'mix', 'syl-same', 'syl-same', 'syl-same', 'pic-same', 'pic-same', 'pic-same', 'haraka-name'];
    return harakaSet(U.shuffle(types).slice(0, DF.config.testQuestions), DF.LETTERS.map(function (L) { return L.id; }), null);
  }

  var BUILDERS = { letters: buildLetters, harakat: buildHarakat };
  var TESTS = { letters: testLetters, harakat: testHarakat };

  DF.Q = {
    build: function (world, si) { return BUILDERS[world.stages[si].kind](world, si); },
    buildTest: function (world) { return TESTS[world.stages[0].kind](world); },
    praise: function () { return U.pick(PRAISE); },
    retry: RETRY,
    describe: describe
  };
})(window.DF);

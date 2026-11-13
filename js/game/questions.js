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

  var BUILDERS = { letters: buildLetters };
  var TESTS = { letters: testLetters };

  DF.Q = {
    build: function (world, si) { return BUILDERS[world.stages[si].kind](world, si); },
    buildTest: function (world) { return TESTS[world.stages[0].kind](world); },
    praise: function () { return U.pick(PRAISE); },
    retry: RETRY,
    describe: describe
  };
})(window.DF);

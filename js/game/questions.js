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

  /* ---------- أسئلة الحركات والمدود ----------
     نظام الأصوات V: { items(), syl(L, v), words() }. الحركات والمدود بيستخدموا نفس المولّد. */
  var SYSTEMS = {
    harakat: { items: function () { return DF.HARAKAT; }, syl: function (L, v) { return DF.syl(L, v); }, words: function () { return DF.HARAKA_WORDS; }, pool: allIds },
    mudud: { items: function () { return DF.MUDUD; }, syl: function (L, v) { return DF.sylLong(L, v); }, words: function () { return DF.MADD_WORDS; }, pool: allIds,
      short: function (L, v) { return DF.syl(L, DF.HARAKA[v.haraka]); } },
    sukun: { items: function () { return DF.HARAKAT; }, syl: function (L, v) { return DF.sukunSyl(L, v); }, pool: function () { return DF.POOL_SUKUN; } },
    tanwin: { items: function () { return DF.TANWIN; }, syl: function (L, v) { return DF.tanwinSyl(L, v); }, pool: function () { return DF.POOL_TANWIN; } },
    shadda: { items: function () { return DF.HARAKAT; }, syl: function (L, v) { return DF.shaddaSyl(L, v); }, pool: function () { return DF.POOL_SUKUN; },
      short: function (L, v) { return DF.plainSyl(L, v); } }
  };
  function allIds() { return DF.LETTERS.map(function (L) { return L.id; }); }

  function seal(q, opts) {
    var order = U.shuffle([0, 1, 2]);
    q.options = order.map(function (k) { return opts[k]; });
    q.correct = order.indexOf(0);
    return q;
  }

  function sylOpt(s) {
    return { kind: 'text', key: s.key, text: s.text,
      describe: { id: 'this-syl-' + s.key, text: s.text, say: s.desc || (s.say + '. ' + s.letter.sayDef + ' مَعَ ' + s.haraka.say), parts: ['syl-' + s.key] } };
  }

  function otherLetters(L, pool) {
    var sim = U.shuffle((DF.SIMILAR[L.id] || []).filter(function (id) { return pool.indexOf(id) >= 0; }));
    var rest = U.shuffle(pool.filter(function (id) { return id !== L.id && sim.indexOf(id) < 0; }));
    return sim.slice(0, 1).concat(rest).slice(0, 2).map(function (id) { return DF.LETTER[id]; });
  }

  /* الأنواع: syl-listen (نفس الصوت، حروف مختلفة)، syl-same (نفس الحرف، ثلاثة أصوات)،
     haraka-name (أين الفتحة؟ / أين مدّ الألف؟)، pic-one / pic-same (الصوت الأول بالكلمة)،
     mix (حرف وصوت)، short-long (بَ أم بَا، للمدود فقط) */
  function soundQ(V, type, L, v, pool, entry, wantShort) {
    var s = V.syl(L, v), q = { type: type, answer: s.key }, wrong, right = s;
    var others = U.shuffle(V.items().filter(function (x) { return x !== v; }));
    var sameLetter = others.map(function (x) { return sylOpt(V.syl(L, x)); });
    function sameSound() { return otherLetters(L, pool).map(function (X) { return sylOpt(V.syl(X, v)); }); }

    if (type === 'haraka-name') {
      q.prompt = { id: 'q-haraka-' + v.id, text: 'أين ' + v.name + '؟', say: 'أَيْنَ ' + (v.sayName || v.say) + '؟', parts: ['q-where-haraka', 'haraka-' + v.id] };
      q.show = { kind: 'listen' };
      wrong = sameLetter;
    } else if (type === 'pic-one' || type === 'pic-same') {
      var w = entry.word;
      q.prompt = { id: 'q-sound-' + w.id, text: 'ما الصوت الأول في الكلمة؟', say: w.say + '. مَا الصَّوْتُ الْأَوَّلُ فِي كَلِمَةِ ' + w.say + '؟', parts: ['word-' + w.id, 'q-first-sound', 'word-' + w.id] };
      q.show = { kind: 'pic', word: w };
      q.noRepeat = true;
      wrong = type === 'pic-one' ? sameSound() : sameLetter;
    } else {
      if (type === 'short-long') {
        var short = V.short(L, v);
        right = wantShort ? short : s;
        wrong = [sylOpt(wantShort ? s : short), sameLetter[0]];
      } else if (type === 'syl-listen') wrong = sameSound();
      else if (type === 'syl-same') wrong = sameLetter;
      else wrong = [sameLetter[0], sameSound()[0]];
      q.answer = right.key;
      q.prompt = right.ask
        ? { id: 'q-syl-' + right.key, text: right.ask.text, say: right.ask.say, parts: ['syl-' + right.key, 'q-where-syl-' + right.key] }
        : { id: 'q-syl-' + right.key, text: 'أين ' + L.name + ' مع ' + right.haraka.name + '؟', say: right.say + '. أَيْنَ ' + L.sayDef + ' مَعَ ' + right.haraka.say + '؟', parts: ['syl-' + right.key, 'q-where-syl-' + right.key] };
      q.show = { kind: 'listen' };
    }
    return seal(q, [sylOpt(right)].concat(wrong));
  }

  function soundSet(V, types, pool, fixed) {
    var letters = U.shuffle(pool), li = 0, vs = [], used = {}, flip = Math.random() < 0.5;
    function nextV() { if (!vs.length) vs = U.shuffle(V.items()); return vs.pop(); }
    return types.map(function (type) {
      var v = fixed || nextV();
      if (type === 'pic-one' || type === 'pic-same') {
        var c = V.words().filter(function (e) {
          return pool.indexOf(e.letter.id) >= 0 && (type === 'pic-same' || e.haraka === v);
        });
        var fresh = c.filter(function (e) { return !used[e.word.id]; });
        var e = U.pick(fresh.length ? fresh : c);
        used[e.word.id] = true;
        return soundQ(V, type, e.letter, e.haraka, pool, e);
      }
      var L = DF.LETTER[letters[li++ % letters.length]];
      flip = !flip;
      return soundQ(V, type, L, v, pool, null, flip);
    });
  }

  function byId(V, id) { return V.items().filter(function (x) { return x.id === id; })[0] || null; }

  function buildHarakat(world, si) {
    var st = world.stages[si], V = SYSTEMS.harakat;
    return soundSet(V, st.types, st.letters, st.haraka ? byId(V, st.haraka) : null);
  }
  function buildMudud(world, si) {
    var st = world.stages[si], V = SYSTEMS.mudud;
    return soundSet(V, st.types, st.letters, st.vowel ? byId(V, st.vowel) : null);
  }

  /* ---------- أشكال الحرف والكلمات ---------- */
  function textOpt(key, text, desc) { return { kind: 'text', key: key, text: text, describe: desc }; }
  function formOpt(f) {
    return textOpt(f.key, f.text, { id: 'this-' + f.key, text: f.text, say: f.letter.sayDef + ' فِي ' + f.pos.say });
  }
  function wordOpt(w, vowelled) {
    return textOpt('w-' + w.id, vowelled ? w.say : w.text, { id: 'word-' + w.id, text: w.text, say: w.say });
  }

  /* الأنواع: form-pick:<موضع> (نفس الموضع، حروف مختلفة)، form-of:<موضع> (نفس الحرف، ثلاثة مواضع)،
     word-has (أي كلمة فيها الحرف)، word-shadda (أي كلمة فيها شدّة). الموضع: initial | medial | final | any */
  function formsSet(types) {
    var used = {}, usedW = {};
    function letter(pool, ok) {
      var c = U.shuffle(pool.filter(function (id) { return !used[id] && (!ok || ok(DF.LETTER[id])); }));
      if (!c.length) c = U.shuffle(pool.filter(function (id) { return !ok || ok(DF.LETTER[id]); }));
      used[c[0]] = true;
      return DF.LETTER[c[0]];
    }
    function freshWord(list) {
      var f = list.filter(function (w) { return !usedW[w.id]; });
      var w = U.pick(f.length ? f : list);
      usedW[w.id] = true;
      return w;
    }
    return types.map(function (spec) {
      var parts = spec.split(':'), type = parts[0], pos = parts[1];
      if (pos === 'any') pos = U.pick(['initial', 'medial', 'final']);
      var q = { type: type }, L, P, w, no;
      if (type === 'word-shadda') {
        w = freshWord(DF.ALL_WORDS.filter(DF.hasShadda));
        no = U.sample(DF.ALL_WORDS.filter(function (x) { return !DF.hasShadda(x); }), 2);
        q.prompt = { id: 'q-word-shadda', text: 'أيّ كلمة فيها شدّة؟', say: 'أَيُّ كَلِمَةٍ فِيهَا شَدَّة؟' };
        q.show = { kind: 'listen' };
        return seal(q, [wordOpt(w, true)].concat(no.map(function (x) { return wordOpt(x, true); })));
      }
      if (type === 'word-has') {
        L = letter(DF.POOL_FORMS, function (X) { return DF.ALL_WORDS.some(function (x) { return DF.wordHas(x, X); }); });
        w = freshWord(DF.ALL_WORDS.filter(function (x) { return DF.wordHas(x, L); }));
        no = U.sample(DF.ALL_WORDS.filter(function (x) { return !DF.wordHas(x, L); }), 2);
        q.prompt = { id: 'q-word-has-' + L.id, text: 'أيّ كلمة فيها حرف ' + L.name + '؟', say: 'أَيُّ كَلِمَةٍ فِيهَا حَرْفُ ' + L.sayDef + '؟', parts: ['q-word-has', 'harf-' + L.id] };
        q.show = { kind: 'letter', letter: L };
        return seal(q, [wordOpt(w)].concat(no.map(function (x) { return wordOpt(x); })));
      }
      P = DF.POSITIONS[pos];
      L = letter(type === 'form-of' ? DF.POOL_JOINING : DF.POOL_FORMS);
      q.prompt = { id: 'q-form-' + L.id + '-' + pos, text: 'أين ' + L.name + ' في ' + P.name + '؟', say: 'أَيْنَ ' + L.sayDef + ' فِي ' + P.say + '؟', parts: ['harf-' + L.id, 'q-form-' + pos] };
      q.show = { kind: 'letter', letter: L };
      var wrong = type === 'form-of'
        ? ['initial', 'medial', 'final'].filter(function (p) { return p !== pos; }).map(function (p) { return formOpt(DF.form(L, p)); })
        : otherLetters(L, DF.POOL_FORMS).map(function (X) { return formOpt(DF.form(X, pos)); });
      return seal(q, [formOpt(DF.form(L, pos))].concat(wrong));
    });
  }

  /* مرحلة مركّبة: أجزاء من أنظمة أصوات مختلفة و/أو أسئلة أشكال */
  function planSet(plan, shuffle) {
    var out = [];
    plan.forEach(function (part) {
      if (part.forms) { out = out.concat(formsSet(part.forms)); return; }
      var V = SYSTEMS[part.sys], fixed = part.fixed ? byId(V, part.fixed) : null;
      if (part.only) {
        var base = V;
        V = Object.create(base);
        V.items = function () { return base.items().filter(function (x) { return part.only.indexOf(x.id) >= 0; }); };
      }
      out = out.concat(soundSet(V, part.types, part.pool || V.pool(), fixed));
    });
    return shuffle ? U.shuffle(out) : out;
  }
  function buildPlan(world, si) { var st = world.stages[si]; return planSet(st.plan, st.shuffle); }
  function testPlan(world) { return planSet(world.testPlan, true).slice(0, DF.config.testQuestions); }

  function testHarakat() {
    var types = ['mix', 'mix', 'mix', 'mix', 'mix', 'syl-same', 'syl-same', 'syl-same', 'pic-same', 'pic-same', 'pic-same', 'haraka-name'];
    return soundSet(SYSTEMS.harakat, U.shuffle(types).slice(0, DF.config.testQuestions), allIds(), null);
  }
  function testMudud() {
    var types = ['mix', 'mix', 'mix', 'mix', 'short-long', 'short-long', 'short-long', 'short-long', 'syl-same', 'syl-same', 'pic-same', 'pic-same'];
    return soundSet(SYSTEMS.mudud, U.shuffle(types).slice(0, DF.config.testQuestions), allIds(), null);
  }

  var BUILDERS = { letters: buildLetters, harakat: buildHarakat, mudud: buildMudud, plan: buildPlan };
  var TESTS = { letters: testLetters, harakat: testHarakat, mudud: testMudud, plan: testPlan };

  DF.Q = {
    build: function (world, si) { return BUILDERS[world.stages[si].kind](world, si); },
    buildTest: function (world) { return TESTS[world.stages[0].kind](world); },
    praise: function () { return U.pick(PRAISE); },
    retry: RETRY,
    describe: describe
  };
})(window.DF);

/* العالم ٤ (السكون وأشكال الحرف) والعالم ٥ (التنوين والشدّة). بيعتمد على letters.js و harakat.js و mudud.js */
window.DF = window.DF || {};
(function (DF) {
  'use strict';

  var SUKUN = 'ْ', SHADDA = 'ّ';

  function base(L) { return L.char.charAt(0); }
  function without(ids) {
    return DF.LETTERS.map(function (L) { return L.id; }).filter(function (id) { return ids.indexOf(id) < 0; });
  }
  DF.POOL_SUKUN = without(['alif', 'waw', 'ya']);
  DF.POOL_TANWIN = without(['alif']);

  /* ---------- السكون: همزة متحركة + حرف ساكن (أَبْ) ---------- */
  DF.sukunSyl = function (L, h) {
    var text = (h.id === 'kasra' ? 'إ' : 'أ') + h.mark + base(L) + SUKUN;
    return {
      key: 'sukun-' + L.id + '-' + h.id, text: text, say: text, letter: L, haraka: h,
      ask: { text: 'أين ' + h.name + ' ثم ' + L.name + ' الساكنة؟', say: text + '. أَيْنَ ' + text + '؟' },
      desc: text + '. ' + L.sayDef + ' السَّاكِنَة'
    };
  };

  /* ---------- التنوين ---------- */
  DF.TANWIN = [
    { id: 'tanwin-fath', mark: 'ً', vowel: 'َ', name: 'تنوين الفتح', say: 'تَنْوِينِ الْفَتْح', sayName: 'تَنْوِينُ الْفَتْح' },
    { id: 'tanwin-damm', mark: 'ٌ', vowel: 'ُ', name: 'تنوين الضم', say: 'تَنْوِينِ الضَّمّ', sayName: 'تَنْوِينُ الضَّمّ' },
    { id: 'tanwin-kasr', mark: 'ٍ', vowel: 'ِ', name: 'تنوين الكسر', say: 'تَنْوِينِ الْكَسْر', sayName: 'تَنْوِينُ الْكَسْر' }
  ];
  /* اللفظ الآلي: «بَنْ» بدل «بًا» حتى ينلفظ التنوين نون ساكنة */
  DF.tanwinSyl = function (L, t) {
    var text = base(L) + t.mark + (t.id === 'tanwin-fath' ? 'ا' : '');
    return { key: L.id + '-' + t.id, text: text, say: base(L) + t.vowel + 'نْ', letter: L, haraka: t };
  };

  /* ---------- الشدّة: أَبَّ مقابل أَبَ ---------- */
  DF.shaddaSyl = function (L, h) {
    var text = 'أَ' + base(L) + SHADDA + h.mark;
    return {
      key: 'shadda-' + L.id + '-' + h.id, text: text, say: text, letter: L, haraka: h,
      ask: { text: 'أين ' + L.name + ' المشدّدة مع ' + h.name + '؟', say: text + '. أَيْنَ ' + text + '؟' },
      desc: text + '. ' + L.sayDef + ' مُشَدَّدَة'
    };
  };
  DF.plainSyl = function (L, h) {
    var text = 'أَ' + base(L) + h.mark;
    return {
      key: 'plain-' + L.id + '-' + h.id, text: text, say: text, letter: L, haraka: h,
      ask: { text: 'أين ' + L.name + ' مع ' + h.name + ' بدون شدّة؟', say: text + '. أَيْنَ ' + text + '؟' },
      desc: text + '. ' + L.sayDef + ' بِدُونِ شَدَّة'
    };
  };

  /* ---------- أشكال الحرف ---------- */
  DF.POSITIONS = {
    initial: { id: 'initial', name: 'أول الكلمة', say: 'أَوَّلِ الْكَلِمَة' },
    medial: { id: 'medial', name: 'وسط الكلمة', say: 'وَسَطِ الْكَلِمَة' },
    final: { id: 'final', name: 'آخر الكلمة', say: 'آخِرِ الْكَلِمَة' }
  };
  var NO_JOIN = ['alif', 'dal', 'dhal', 'ra', 'zay', 'waw'];   // حروف ما بتتصل بما بعدها
  DF.joins = function (L) { return NO_JOIN.indexOf(L.id) < 0; };
  DF.POOL_FORMS = without(['alif']);
  DF.POOL_JOINING = without(NO_JOIN);
  DF.form = function (L, pos) {
    var b = base(L), j = DF.joins(L), text;
    if (pos === 'initial') text = j ? b + 'ـ' : b;
    else if (pos === 'medial') text = 'ـ' + b + (j ? 'ـ' : '');
    else text = 'ـ' + b;
    return { key: 'form-' + L.id + '-' + pos, text: text, letter: L, pos: DF.POSITIONS[pos] };
  };

  /* كل الكلمات (بدون تكرار) لأسئلة «أي كلمة فيها...» */
  DF.ALL_WORDS = [];
  (function () {
    var seen = {};
    function add(w) { if (!seen[w.id] && w.text.length <= 6) { seen[w.id] = true; DF.ALL_WORDS.push(w); } }
    DF.LETTERS.forEach(function (L) { L.words.forEach(add); });
    DF.MADD_WORDS.forEach(function (e) { add(e.word); });
  })();
  var VARIANTS = { alif: 'اأإآ', ya: 'يى' };
  DF.wordHas = function (w, L) {
    var set = VARIANTS[L.id] || base(L);
    for (var i = 0; i < w.text.length; i++) if (set.indexOf(w.text.charAt(i)) >= 0) return true;
    return false;
  };
  DF.hasShadda = function (w) { return w.say.indexOf(SHADDA) >= 0; };

  /* ---------- بطاقات التعريف ---------- */
  function sayCard(key, text, say) { return { id: 'intro-' + key, text: text, say: say }; }
  function unitCard(s, sub) { return { big: s.text, sub: sub, say: sayCard(s.key, s.text, s.say) }; }
  function markCard(mark, name, say) { return { big: 'ـ' + mark, sub: name, say: sayCard('mark-' + name, name, say) }; }
  function formsCard(L, positions) {
    var parts = positions.map(function (p) { return DF.form(L, p).text; });
    return { big: parts.join(' '), small: true, sub: L.name, say: sayCard('forms-' + L.id, L.name, L.say) };
  }
  function rep(type, n) { var a = []; for (var i = 0; i < n; i++) a.push(type); return a; }

  DF.sukunStages = function () {
    var H = DF.HARAKA, T = DF.LETTER;
    var sukunCard = markCard(SUKUN, 'السكون', 'السُّكُون');
    var stages = [
      { label: [DF.sukunSyl(T.ba, H.fatha).text, DF.sukunSyl(T.ta, H.fatha).text],
        cards: [sukunCard, unitCard(DF.sukunSyl(T.ba, H.fatha), 'باء ساكنة'), unitCard(DF.sukunSyl(T.mim, H.fatha), 'ميم ساكنة'), unitCard(DF.sukunSyl(T.nun, H.fatha), 'نون ساكنة')],
        plan: [{ sys: 'sukun', fixed: 'fatha', types: rep('syl-listen', 10) }] },
      { label: DF.HARAKAT.map(function (h) { return DF.sukunSyl(T.ba, h).text; }),
        cards: DF.HARAKAT.map(function (h) { return unitCard(DF.sukunSyl(T.ba, h), h.name + ' ثم باء ساكنة'); }).concat([sukunCard]),
        plan: [{ sys: 'sukun', types: ['syl-same', 'syl-same', 'syl-same', 'syl-same', 'syl-listen', 'syl-same', 'mix', 'syl-same', 'mix', 'mix'] }] },
      { label: ['ba', 'ayn', 'ha2'].map(function (id) { return DF.form(T[id], 'initial').text; }),
        cards: ['ba', 'ayn', 'ha2', 'kaf'].map(function (id) { return formsCard(T[id], ['initial']); }),
        plan: [{ forms: ['form-pick:initial', 'form-pick:initial', 'form-pick:initial', 'form-of:initial', 'form-pick:initial', 'form-of:initial', 'form-pick:initial', 'form-of:initial', 'form-pick:initial', 'form-of:initial'] }] },
      { label: [DF.form(T.ayn, 'medial').text, DF.form(T.ayn, 'final').text],
        cards: ['ayn', 'ha2', 'kaf', 'ya'].map(function (id) { return formsCard(T[id], ['medial', 'final']); }),
        plan: [{ forms: ['form-pick:medial', 'form-pick:final', 'form-pick:medial', 'form-of:medial', 'form-pick:final', 'form-of:final', 'form-pick:medial', 'form-of:medial', 'form-pick:final', 'form-of:final'] }] },
      { label: ['ـ' + SUKUN, DF.form(T.ha2, 'medial').text, DF.form(T.kaf, 'final').text],
        cards: [sukunCard, formsCard(T.ayn, ['initial', 'medial', 'final']), formsCard(T.ha2, ['initial', 'medial', 'final']), formsCard(T.kaf, ['initial', 'medial', 'final'])],
        shuffle: true,
        plan: [{ sys: 'sukun', types: ['mix', 'mix', 'syl-same'] }, { forms: ['word-has', 'word-has', 'word-has', 'word-has', 'form-of:any', 'form-of:any', 'form-pick:any'] }] }
    ];
    stages.forEach(function (s, i) { s.id = 'w4s' + (i + 1); s.kind = 'plan'; });
    return stages;
  };
  DF.sukunTest = [{ sys: 'sukun', types: ['mix', 'mix', 'mix', 'syl-same', 'syl-same'] }, { forms: ['form-pick:any', 'form-pick:any', 'form-of:any', 'form-of:any', 'form-of:any', 'word-has', 'word-has'] }];

  DF.tanwinStages = function () {
    var H = DF.HARAKA, T = DF.LETTER, TF = DF.TANWIN[0], TD = DF.TANWIN[1], TK = DF.TANWIN[2];
    var tCards = DF.TANWIN.map(function (t) { return { big: 'ـ' + t.mark, sub: t.name, say: sayCard(t.id, t.name, t.sayName) }; });
    var shaddaCard = markCard(SHADDA, 'الشدّة', 'الشَّدَّة');
    function tri(L) {
      var parts = DF.TANWIN.map(function (t) { return DF.tanwinSyl(L, t); });
      return { big: parts.map(function (p) { return p.text; }).join(' '), small: true, sub: L.name,
        say: sayCard('tanwin3-' + L.id, L.name, parts.map(function (p) { return p.say; }).join('. ')) };
    }
    function pair(L, h) {
      var a = DF.plainSyl(L, h), b = DF.shaddaSyl(L, h);
      return { big: a.text + ' ' + b.text, small: true, sub: 'بدون شدّة ثم مع شدّة', say: sayCard('pair-' + b.key, b.text, a.say + '. ' + b.say) };
    }
    var stages = [
      { label: ['ba', 'ta', 'tha'].map(function (id) { return DF.tanwinSyl(T[id], TF).text; }),
        cards: [tCards[0], unitCard(DF.tanwinSyl(T.ba, TF), 'الباء مع تنوين الفتح'), unitCard(DF.tanwinSyl(T.mim, TF), 'الميم مع تنوين الفتح'), unitCard(DF.tanwinSyl(T.sin, TF), 'السين مع تنوين الفتح')],
        plan: [{ sys: 'tanwin', fixed: 'tanwin-fath', types: rep('syl-listen', 10) }] },
      { label: [DF.tanwinSyl(T.ba, TD).text, DF.tanwinSyl(T.ba, TK).text],
        cards: [tCards[1], tCards[2], unitCard(DF.tanwinSyl(T.ba, TD), 'الباء مع تنوين الضم'), unitCard(DF.tanwinSyl(T.ba, TK), 'الباء مع تنوين الكسر')],
        plan: [{ sys: 'tanwin', only: ['tanwin-damm', 'tanwin-kasr'], types: rep('syl-listen', 10) }] },
      { label: DF.TANWIN.map(function (t) { return DF.tanwinSyl(T.ba, t).text; }),
        cards: tCards.concat([tri(T.ba)]),
        plan: [{ sys: 'tanwin', types: ['haraka-name', 'haraka-name', 'haraka-name', 'syl-same', 'haraka-name', 'syl-same', 'syl-same', 'mix', 'syl-same', 'mix'] }] },
      { label: [DF.plainSyl(T.ba, H.fatha).text, DF.shaddaSyl(T.ba, H.fatha).text],
        cards: [shaddaCard, pair(T.ba, H.fatha), pair(T.mim, H.damma), pair(T.sin, H.kasra)],
        plan: [{ sys: 'shadda', types: ['short-long', 'short-long', 'short-long', 'syl-listen', 'short-long', 'syl-listen', 'short-long', 'syl-same', 'short-long', 'syl-same'] }] },
      { label: ['ـ' + TF.mark, 'ـ' + TD.mark, 'ـ' + TK.mark, 'ـ' + SHADDA],
        cards: [tri(T.mim), shaddaCard, pair(T.dal, H.fatha), tCards[0]],
        shuffle: true,
        plan: [{ sys: 'tanwin', types: ['mix', 'mix', 'syl-same', 'haraka-name'] }, { sys: 'shadda', types: ['short-long', 'short-long', 'short-long'] }, { forms: ['word-shadda', 'word-shadda', 'word-shadda'] }] }
    ];
    stages.forEach(function (s, i) { s.id = 'w5s' + (i + 1); s.kind = 'plan'; });
    return stages;
  };
  DF.tanwinTest = [{ sys: 'tanwin', types: ['mix', 'mix', 'mix', 'syl-same', 'syl-same', 'haraka-name'] }, { sys: 'shadda', types: ['short-long', 'short-long', 'short-long', 'syl-same'] }, { forms: ['word-shadda', 'word-shadda'] }];
})(window.DF);

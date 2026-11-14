/* العالم ٣: المدود (ألف، واو، ياء). بيعتمد على letters.js و harakat.js */
window.DF = window.DF || {};
(function (DF) {
  'use strict';

  /* say = بعد «مع» (مجرور)، sayName = بأول الجملة */
  DF.MUDUD = [
    { id: 'madd-alif', haraka: 'fatha', letter: 'ا', name: 'مدّ الألف', say: 'مَدِّ الْأَلِف', sayName: 'مَدُّ الْأَلِف' },
    { id: 'madd-waw', haraka: 'damma', letter: 'و', name: 'مدّ الواو', say: 'مَدِّ الْوَاو', sayName: 'مَدُّ الْوَاو' },
    { id: 'madd-ya', haraka: 'kasra', letter: 'ي', name: 'مدّ الياء', say: 'مَدِّ الْيَاء', sayName: 'مَدُّ الْيَاء' }
  ];
  DF.MADD = {};
  DF.MUDUD.forEach(function (m) { DF.MADD[m.id] = m; });

  /* المقطع الطويل: حرف + حركة + حرف المد. القراءة الآلية بتلفظه منيح بدون حيل. */
  DF.sylLong = function (L, m) {
    var h = DF.HARAKA[m.haraka], base = L.char.charAt(0), text;
    if (L.id === 'alif') text = m.id === 'madd-alif' ? 'آ' : (m.id === 'madd-ya' ? 'إ' : 'أ') + h.mark + m.letter;
    else text = base + h.mark + m.letter;
    return { key: L.id + '-' + m.id, text: text, say: text, letter: L, haraka: m };
  };

  /* كلمات أول مقطع فيها ممدود: [id, الكلمة, مشكولة, إيموجي, حرف, مد] */
  var RAW = [
    ['bab', 'باب', 'بَاب', '🚪', 'ba', 'madd-alif'], ['taj', 'تاج', 'تَاج', '👑', 'ta', 'madd-alif'],
    ['nar', 'نار', 'نَار', '🔥', 'nun', 'madd-alif'], ['jami', 'جامع', 'جَامِع', '🕌', 'jim', 'madd-alif'],
    ['sarukh', 'صاروخ', 'صَارُوخ', '🚀', 'sad', 'madd-alif'], ['taira', 'طائرة', 'طَائِرَة', '✈️', 'tah', 'madd-alif'],
    ['hatif', 'هاتف', 'هَاتِف', '📱', 'ha2', 'madd-alif'], ['saa', 'ساعة', 'سَاعَة', '⏰', 'sin', 'madd-alif'],
    ['qarib', 'قارب', 'قَارِب', '⛵', 'qaf', 'madd-alif'], ['khatam', 'خاتم', 'خَاتَم', '💍', 'kha', 'madd-alif'],
    ['hafila', 'حافلة', 'حَافِلَة', '🚌', 'ha', 'madd-alif'], ['shay', 'شاي', 'شَاي', '🍵', 'shin', 'madd-alif'],
    ['hut', 'حوت', 'حُوت', '🐳', 'ha', 'madd-waw'], ['buma', 'بومة', 'بُومَة', '🦉', 'ba', 'madd-waw'],
    ['duda', 'دودة', 'دُودَة', '🐛', 'dal', 'madd-waw'], ['robot', 'روبوت', 'رُوبُوت', '🤖', 'ra', 'madd-waw'],
    ['kub', 'كوب', 'كُوب', '☕', 'kaf', 'madd-waw'], ['suf', 'صوف', 'صُوف', '🧶', 'sad', 'madd-waw'],
    ['thum', 'ثوم', 'ثُوم', '🧄', 'tha', 'madd-waw'], ['tub', 'طوب', 'طُوب', '🧱', 'tah', 'madd-waw'],
    ['fil', 'فيل', 'فِيل', '🐘', 'fa', 'madd-ya'], ['dik', 'ديك', 'دِيك', '🐓', 'dal', 'madd-ya'],
    ['id', 'عيد', 'عِيد', '🎉', 'ayn', 'madd-ya'], ['kis', 'كيس', 'كِيس', '🛍️', 'kaf', 'madd-ya'],
    ['mizan', 'ميزان', 'مِيزَان', '⚖️', 'mim', 'madd-ya'], ['qithara', 'قيثارة', 'قِيثَارَة', '🎸', 'qaf', 'madd-ya']
  ];
  DF.MADD_WORDS = RAW.map(function (r) {
    return {
      word: { id: r[0], text: r[1], say: r[2], emoji: r[3], img: (DF.WORD_IMAGES || {})[r[0]] || null },
      letter: DF.LETTER[r[4]], haraka: DF.MADD[r[5]]
    };
  });

  function sayCard(key, text, say) { return { id: 'intro-' + key, text: text, say: say }; }
  function markCard(m) {
    return { big: 'ـ' + DF.HARAKA[m.haraka].mark + m.letter, sub: m.name, say: sayCard(m.id, m.name, m.sayName) };
  }
  function wordCard(e) {
    var s = DF.sylLong(e.letter, e.haraka);
    return { big: s.text, word: e.word, say: sayCard(s.key, s.text, s.say + '. ' + e.word.say) };
  }
  function examples(m, n) {
    return DF.MADD_WORDS.filter(function (e) { return e.haraka === m; }).slice(0, n).map(wordCard);
  }
  function pairCard(L, m) {
    var a = DF.syl(L, DF.HARAKA[m.haraka]), b = DF.sylLong(L, m);
    return { big: a.text + ' ' + b.text, small: true, sub: 'قصير ثم طويل', say: sayCard('pair-' + b.key, b.text, a.say + '. ' + b.say) };
  }
  function tripleCard(L) {
    var parts = DF.MUDUD.map(function (m) { return DF.sylLong(L, m); });
    return {
      big: parts.map(function (p) { return p.text; }).join(' '), small: true, sub: L.name,
      say: sayCard('long3-' + L.id, L.name, parts.map(function (p) { return p.say; }).join('. '))
    };
  }
  function label(ids, m) { return ids.map(function (id) { return DF.sylLong(DF.LETTER[id], m).text; }); }

  DF.mududStages = function () {
    var ids = DF.LETTERS.map(function (L) { return L.id; });
    var A = DF.MUDUD[0], W = DF.MUDUD[1], Y = DF.MUDUD[2];
    var ba = DF.LETTER.ba, mim = DF.LETTER.mim, sin = DF.LETTER.sin, nun = DF.LETTER.nun;
    var ONE = ['syl-listen', 'syl-listen', 'syl-listen', 'syl-listen', 'pic-one', 'syl-listen', 'syl-listen', 'pic-one', 'syl-listen', 'pic-one'];
    var three = ['ba', 'ta', 'tha'];
    var marks = DF.MUDUD.map(markCard);
    var stages = [
      { vowel: 'madd-alif', types: ONE, label: label(three, A), cards: [markCard(A)].concat(examples(A, 3)) },
      { vowel: 'madd-waw', types: ONE, label: label(three, W), cards: [markCard(W)].concat(examples(W, 3)) },
      { vowel: 'madd-ya', types: ONE, label: label(three, Y), cards: [markCard(Y)].concat(examples(Y, 3)) },
      { label: [DF.syl(ba, DF.HARAKA.fatha).text, DF.sylLong(ba, A).text],
        cards: [pairCard(ba, A), pairCard(mim, W), pairCard(sin, Y), pairCard(nun, A)],
        types: ['short-long', 'short-long', 'short-long', 'short-long', 'short-long', 'short-long', 'short-long', 'short-long', 'short-long', 'short-long'] },
      { label: DF.MUDUD.map(function (m) { return DF.sylLong(ba, m).text; }),
        cards: DF.MUDUD.map(function (m) { var s = DF.sylLong(ba, m); return { big: s.text, sub: ba.name + ' مع ' + m.name, say: sayCard(s.key, s.text, s.say) }; }).concat([tripleCard(mim)]),
        types: ['syl-same', 'syl-same', 'syl-same', 'pic-same', 'syl-same', 'pic-same', 'syl-same', 'pic-same', 'syl-same', 'pic-same'] },
      { label: [DF.sylLong(mim, A).text, DF.sylLong(nun, W).text, DF.sylLong(sin, Y).text], cards: marks.concat([tripleCard(sin)]),
        types: ['mix', 'short-long', 'pic-same', 'mix', 'short-long', 'haraka-name', 'mix', 'pic-same', 'short-long', 'mix'] }
    ];
    stages.forEach(function (s, i) { s.id = 'w3s' + (i + 1); s.kind = 'mudud'; s.letters = ids; });
    return stages;
  };
})(window.DF);

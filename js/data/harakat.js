/* العالم ٢: الحركات (فتحة، ضمة، كسرة). بيعتمد على letters.js */
window.DF = window.DF || {};
(function (DF) {
  'use strict';

  DF.HARAKAT = [
    { id: 'fatha', mark: 'َ', name: 'الفتحة', say: 'الْفَتْحَة' },
    { id: 'damma', mark: 'ُ', name: 'الضمة', say: 'الضَّمَّة' },
    { id: 'kasra', mark: 'ِ', name: 'الكسرة', say: 'الْكَسْرَة' }
  ];
  DF.HARAKA = {};
  DF.HARAKAT.forEach(function (h) { DF.HARAKA[h.id] = h; });

  /* المقطع: حرف + حركة. say = كيف بينقرأ آلياً.
     القراءة الآلية ما بتلفظ «بَ» لحالها منيح، فمنضيف هاء ساكنة: «بَهْ». غيّر هون إذا اللفظ مو مظبوط. */
  DF.syl = function (L, h) {
    var base = L.char.charAt(0), text;
    if (L.id === 'alif') { base = h.id === 'kasra' ? 'إ' : 'أ'; text = base + h.mark; }
    else if (L.id === 'ha2') text = base + h.mark + 'ـ';
    else text = base + h.mark;
    return { key: L.id + '-' + h.id, text: text, say: base + h.mark + 'هْ', letter: L, haraka: h };
  };

  /* حركة أول حرف بالكلمة، من النص المشكول. الكلمات اللي بعدها مدّ أو لين بتنترك للعالم ٣. */
  function firstHaraka(w) {
    var m = w.say.charAt(1), next = w.say.charAt(2);
    if ('اوي'.indexOf(next) >= 0) return null;
    for (var i = 0; i < DF.HARAKAT.length; i++) if (DF.HARAKAT[i].mark === m) return DF.HARAKAT[i];
    return null;
  }

  /* كلمات واضحة الصورة مع حركة أولها: [{ word, letter, haraka }] */
  DF.HARAKA_WORDS = [];
  DF.LETTERS.forEach(function (L) {
    L.words.forEach(function (w) {
      var h = firstHaraka(w);
      if (h && !w.weak) DF.HARAKA_WORDS.push({ word: w, letter: L, haraka: h });
    });
  });

  function sayCard(key, text, say) { return { id: 'intro-' + key, text: text, say: say }; }

  function markCard(h) {
    return { big: 'ـ' + h.mark, sub: h.name, say: sayCard(h.id, h.name, h.say) };
  }
  function wordCard(e) {
    var s = DF.syl(e.letter, e.haraka);
    return { big: s.text, word: e.word, say: sayCard(s.key, s.text, s.say + '. ' + e.word.say) };
  }
  function tripleCard(L) {
    var parts = DF.HARAKAT.map(function (h) { return DF.syl(L, h); });
    return {
      big: parts.map(function (p) { return p.text; }).join(' '), small: true, sub: L.name,
      say: sayCard('triple-' + L.id, L.name, parts.map(function (p) { return p.say; }).join('. '))
    };
  }
  function examples(h, letterIds, n) {
    var out = [], seen = {};
    DF.HARAKA_WORDS.forEach(function (e) {
      if (out.length < n && e.haraka === h && letterIds.indexOf(e.letter.id) >= 0 && !seen[e.letter.id]) {
        seen[e.letter.id] = true; out.push(wordCard(e));
      }
    });
    return out;
  }
  function label(letterIds, h) {
    return letterIds.map(function (id) { return DF.syl(DF.LETTER[id], h).text; });
  }

  DF.harakatStages = function () {
    var ids = DF.LETTERS.map(function (L) { return L.id; });
    var a = ids.slice(0, 14), b = ids.slice(14);
    var F = DF.HARAKA.fatha, D = DF.HARAKA.damma, K = DF.HARAKA.kasra;
    var ONE = ['syl-listen', 'syl-listen', 'syl-listen', 'syl-listen', 'pic-one', 'syl-listen', 'syl-listen', 'pic-one', 'syl-listen', 'pic-one'];
    var marks = DF.HARAKAT.map(markCard);
    var ba = DF.LETTER.ba, mim = DF.LETTER.mim;
    var stages = [
      { haraka: 'fatha', letters: a, types: ONE, label: label(a.slice(0, 4), F), cards: [markCard(F)].concat(examples(F, a, 3)) },
      { haraka: 'fatha', letters: b, types: ONE, label: label(b.slice(0, 4), F), cards: [markCard(F)].concat(examples(F, b, 3)) },
      { haraka: 'damma', letters: ids, types: ONE, label: label(ids.slice(1, 5), D), cards: [markCard(D)].concat(examples(D, ids, 3)) },
      { haraka: 'kasra', letters: ids, types: ONE, label: label(ids.slice(1, 5), K), cards: [markCard(K)].concat(examples(K, ids, 3)) },
      { letters: ids, label: ['ـَ', 'ـُ', 'ـِ'], cards: marks.concat([tripleCard(ba)]),
        types: ['haraka-name', 'haraka-name', 'haraka-name', 'syl-same', 'haraka-name', 'syl-same', 'haraka-name', 'syl-same', 'syl-same', 'syl-same'] },
      { letters: ids, label: label(['ba'], F).concat(label(['ba'], D), label(['ba'], K)),
        cards: DF.HARAKAT.map(function (h) { var s = DF.syl(ba, h); return { big: s.text, sub: ba.name + ' مع ' + h.name, say: sayCard(s.key, s.text, s.say) }; }).concat([tripleCard(mim)]),
        types: ['syl-same', 'syl-same', 'syl-same', 'pic-same', 'syl-same', 'pic-same', 'syl-same', 'pic-same', 'syl-same', 'pic-same'] },
      { letters: ids, label: [DF.syl(DF.LETTER.alif, F).text, DF.syl(mim, D).text, DF.syl(DF.LETTER.sin, K).text], cards: marks.concat([tripleCard(DF.LETTER.sin)]),
        types: ['mix', 'mix', 'pic-same', 'mix', 'haraka-name', 'mix', 'pic-same', 'mix', 'haraka-name', 'pic-same'] }
    ];
    stages.forEach(function (s, i) { s.id = 'w2s' + (i + 1); s.kind = 'harakat'; });
    return stages;
  };
})(window.DF);

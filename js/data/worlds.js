/* العوالم العشرة. الجاهز هلق: العالم ١ فقط. الباقي عدد مراحل بدون محتوى. */
window.DF = window.DF || {};
(function (DF) {
  'use strict';

  /* السرعة: بطيئة وبدون مؤقّت (الشخصية تنتظر عند البوابات)، متوسطة، أسرع */
  DF.SPEEDS = {
    slow: { speed: 2.1, wait: true },
    medium: { speed: 3.0, wait: false },
    fast: { speed: 4.0, wait: false }
  };

  function letterStages() {
    var ids = DF.LETTERS.map(function (L) { return L.id; });
    var out = [];
    for (var i = 0; i < 7; i++) {
      out.push({ id: 'w1s' + (i + 1), kind: 'letters', letters: ids.slice(i * 4, i * 4 + 4) });
    }
    return out;
  }

  DF.WORLDS = [
    { id: 1, title: 'حديقة الحروف', topic: 'الحروف', grade: 'روضة', icon: '🌳', color: '#7fb069', speed: 'slow', stages: letterStages() },
    { id: 2, title: 'تلّة الحركات', topic: 'الحركات: تَ تُ تِ', grade: 'روضة – أول', icon: '🎈', color: '#f2a93b', speed: 'slow', count: 7 },
    { id: 3, title: 'جسر المدود', topic: 'المدود', grade: 'أول', icon: '🌉', color: '#4a9fd8', speed: 'slow', count: 6 },
    { id: 4, title: 'كهف السكون', topic: 'السكون وأشكال الحرف', grade: 'أول', icon: '⛰️', color: '#8d7fc7', speed: 'slow', count: 5 },
    { id: 5, title: 'قلعة الشدّة', topic: 'التنوين والشدّة', grade: 'أول – ثاني', icon: '🏰', color: '#e08a5b', speed: 'slow', count: 5 },
    { id: 6, title: 'سوق الكلمات', topic: 'كلمات وصور', grade: 'ثاني', icon: '🧺', color: '#d96c8a', speed: 'medium', count: 8 },
    { id: 7, title: 'ورشة الإملاء', topic: 'الإملاء الأول', grade: 'ثاني – ثالث', icon: '✏️', color: '#3fa7a0', speed: 'medium', count: 8 },
    { id: 8, title: 'بستان المعاني', topic: 'الكلمة ومعناها', grade: 'ثالث – رابع', icon: '🍊', color: '#e6a23c', speed: 'medium', count: 8 },
    { id: 9, title: 'مدينة الكلمات', topic: 'أنواع الكلمة', grade: 'رابع – خامس', icon: '🏙️', color: '#5b8def', speed: 'fast', count: 8 },
    { id: 10, title: 'قمّة الإعراب', topic: 'الجملة والإعراب', grade: 'خامس – سادس', icon: '🏔️', color: '#6c7ae0', speed: 'fast', count: 8 }
  ];

  DF.WORLDS.forEach(function (w) {
    w.ready = !!w.stages;
    w.count = w.stages ? w.stages.length : w.count;
  });

  DF.worldById = function (id) {
    return DF.WORLDS.filter(function (w) { return w.id === id; })[0];
  };
})(window.DF);

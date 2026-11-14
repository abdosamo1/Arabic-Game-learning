/* الشخصيات: وحدة مفتوحة، والباقي بالنجوم. الرسم من الخلف في js/game/draw.js.
   emoji مؤقت لشاشة الاختيار؛ لاحقاً img: 'assets/img/characters/cat.png' */
window.DF = window.DF || {};
window.DF.CHARACTERS = [
  { id: 'cat', name: 'مشمش', kind: 'القطة', emoji: '🐱', need: 0, ears: 'cat', tail: 'cat',
    colors: { body: '#f4a259', dark: '#c9772f', pack: '#3f86cf', packDark: '#2f69a6' } },
  { id: 'rabbit', name: 'نطّوط', kind: 'الأرنب', emoji: '🐰', need: 15, ears: 'rabbit', tail: 'puff',
    colors: { body: '#f7f4ef', dark: '#cbc3b6', pack: '#e56b8a', packDark: '#c24f6d' } },
  { id: 'bear', name: 'دبدوب', kind: 'الدب', emoji: '🐻', need: 40, ears: 'round', tail: 'nub',
    colors: { body: '#a8744a', dark: '#7d5232', pack: '#5aa86b', packDark: '#3f8450' } },
  { id: 'fox', name: 'فهيم', kind: 'الثعلب', emoji: '🦊', need: 80, ears: 'fox', tail: 'fox',
    colors: { body: '#e8752e', dark: '#b9551b', pack: '#6a5acd', packDark: '#4f41a8', tip: '#fff6ea' } },
  { id: 'panda', name: 'بندق', kind: 'الباندا', emoji: '🐼', need: 130, ears: 'round', tail: 'nub',
    colors: { body: '#34343b', head: '#f7f7f4', dark: '#1f1f24', pack: '#e2574c', packDark: '#b9403a' } },
  { id: 'lion', name: 'ليث', kind: 'الأسد', emoji: '🦁', need: 180, ears: 'round', tail: 'lion', mane: true,
    colors: { body: '#f0b54a', dark: '#c98a25', mane: '#b5651d', pack: '#2a9d8f', packDark: '#1f7a6f' } }
];

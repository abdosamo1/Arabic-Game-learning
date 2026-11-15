/* العالم ٦: كلمات وصور، مقسومة مواضيع. الكلمة: [id, الكلمة, مشكولة, إيموجي] */
window.DF = window.DF || {};
(function (DF) {
  'use strict';

  var THEMES = [
    { id: 'animals', name: 'حيوانات', words: [
      ['arnab', 'أرنب', 'أَرْنَب', '🐰'], ['asad', 'أسد', 'أَسَد', '🦁'], ['batta', 'بطة', 'بَطَّة', '🦆'], ['baqara', 'بقرة', 'بَقَرَة', '🐄'],
      ['jamal', 'جمل', 'جَمَل', '🐪'], ['hisan', 'حصان', 'حِصَان', '🐴'], ['kharuf', 'خروف', 'خَرُوف', '🐑'], ['dubb', 'دب', 'دُبّ', '🐻'],
      ['fil', 'فيل', 'فِيل', '🐘'], ['kalb', 'كلب', 'كَلْب', '🐶'], ['qitta', 'قطة', 'قِطَّة', '🐈'], ['namir', 'نمر', 'نَمِر', '🐯'],
      ['zarafa', 'زرافة', 'زَرَافَة', '🦒'], ['qird', 'قرد', 'قِرْد', '🐒'], ['samaka', 'سمكة', 'سَمَكَة', '🐟'], ['nahla', 'نحلة', 'نَحْلَة', '🐝'],
      ['difda', 'ضفدع', 'ضِفْدَع', '🐸'], ['hut', 'حوت', 'حُوت', '🐳'], ['dik', 'ديك', 'دِيك', '🐓'], ['far', 'فأر', 'فَأْر', '🐭']
    ] },
    { id: 'food', name: 'طعام', words: [
      ['tuffaha', 'تفاحة', 'تُفَّاحَة', '🍎'], ['mawz', 'موز', 'مَوْز', '🍌'], ['inab', 'عنب', 'عِنَب', '🍇'], ['laymun', 'ليمون', 'لَيْمُون', '🍋'],
      ['jazar', 'جزر', 'جَزَر', '🥕'], ['khubz', 'خبز', 'خُبْز', '🍞'], ['dhura', 'ذرة', 'ذُرَة', '🌽'], ['bayda', 'بيضة', 'بَيْضَة', '🥚'],
      ['halib', 'حليب', 'حَلِيب', '🥛'], ['jubna', 'جبنة', 'جُبْنَة', '🧀'], ['asal', 'عسل', 'عَسَل', '🍯'], ['bittikh', 'بطيخ', 'بِطِّيخ', '🍉'],
      ['farawla', 'فراولة', 'فَرَاوْلَة', '🍓'], ['karaz', 'كرز', 'كَرَز', '🍒'], ['kaka', 'كعكة', 'كَعْكَة', '🎂'], ['thum', 'ثوم', 'ثُوم', '🧄']
    ] },
    { id: 'things', name: 'أشياء', words: [
      ['bab', 'باب', 'بَاب', '🚪'], ['bayt', 'بيت', 'بَيْت', '🏠'], ['kitab', 'كتاب', 'كِتَاب', '📖'], ['qalam', 'قلم', 'قَلَم', '✏️'],
      ['miftah', 'مفتاح', 'مِفْتَاح', '🔑'], ['saa', 'ساعة', 'سَاعَة', '⏰'], ['kura', 'كرة', 'كُرَة', '⚽'], ['hatif', 'هاتف', 'هَاتِف', '📱'],
      ['sunduq', 'صندوق', 'صُنْدُوق', '📦'], ['hadiyya', 'هدية', 'هَدِيَّة', '🎁'], ['sarir', 'سرير', 'سَرِير', '🛏️'], ['miqass', 'مقص', 'مِقَصّ', '✂️'],
      ['haqiba', 'حقيبة', 'حَقِيبَة', '🎒'], ['mizalla', 'مظلة', 'مِظَلَّة', '☂️'], ['shama', 'شمعة', 'شَمْعَة', '🕯️'], ['kub', 'كوب', 'كُوب', '☕']
    ] },
    { id: 'nature', name: 'طبيعة', words: [
      ['shams', 'شمس', 'شَمْس', '☀️'], ['qamar', 'قمر', 'قَمَر', '🌙'], ['najma', 'نجمة', 'نَجْمَة', '⭐'], ['shajara', 'شجرة', 'شَجَرَة', '🌳'],
      ['zahra', 'زهرة', 'زَهْرَة', '🌸'], ['ghayma', 'غيمة', 'غَيْمَة', '☁️'], ['thalj', 'ثلج', 'ثَلْج', '❄️'], ['nar', 'نار', 'نَار', '🔥'],
      ['ma', 'ماء', 'مَاء', '💧'], ['jabal', 'جبل', 'جَبَل', '⛰️'], ['bahr', 'بحر', 'بَحْر', '🌊'], ['matar', 'مطر', 'مَطَر', '🌧️'],
      ['waraqa', 'ورقة', 'وَرَقَة', '🍁']
    ] },
    { id: 'body', name: 'جسم وملابس', words: [
      ['yad', 'يد', 'يَد', '✋'], ['ayn-eye', 'عين', 'عَيْن', '👁️'], ['lisan', 'لسان', 'لِسَان', '👅'], ['udhun', 'أذن', 'أُذُن', '👂'],
      ['anf', 'أنف', 'أَنْف', '👃'], ['fam', 'فم', 'فَم', '👄'], ['qadam', 'قدم', 'قَدَم', '🦶'], ['qalb', 'قلب', 'قَلْب', '❤️'],
      ['qamis', 'قميص', 'قَمِيص', '👕'], ['hidha', 'حذاء', 'حِذَاء', '👟'], ['qubbaa', 'قبعة', 'قُبَّعَة', '🧢'], ['fustan', 'فستان', 'فُسْتَان', '👗'],
      ['nazzara', 'نظارة', 'نَظَّارَة', '👓'], ['taj', 'تاج', 'تَاج', '👑']
    ] },
    { id: 'places', name: 'مركبات وأماكن', words: [
      ['sayyara', 'سيارة', 'سَيَّارَة', '🚗'], ['taira', 'طائرة', 'طَائِرَة', '✈️'], ['darraja', 'دراجة', 'دَرَّاجَة', '🚲'], ['hafila', 'حافلة', 'حَافِلَة', '🚌'],
      ['qarib', 'قارب', 'قَارِب', '⛵'], ['sarukh', 'صاروخ', 'صَارُوخ', '🚀'], ['qitar', 'قطار', 'قِطَار', '🚂'], ['safina', 'سفينة', 'سَفِينَة', '🚢'],
      ['jami', 'جامع', 'جَامِع', '🕌'], ['madrasa', 'مدرسة', 'مَدْرَسَة', '🏫'], ['khayma', 'خيمة', 'خَيْمَة', '⛺'], ['qala', 'قلعة', 'قَلْعَة', '🏰']
    ] }
  ];

  DF.VOCAB = { themes: {}, all: [] };
  THEMES.forEach(function (t) {
    var list = t.words.map(function (r) {
      return { id: r[0], text: r[1], say: r[2], emoji: r[3], theme: t.id, img: (DF.WORD_IMAGES || {})[r[0]] || null };
    });
    DF.VOCAB.themes[t.id] = { id: t.id, name: t.name, words: list };
    DF.VOCAB.all = DF.VOCAB.all.concat(list);
  });

  /* مسافة التعديل بين كلمتين: لاختيار كلمات متشابهة بالكتابة */
  DF.wordDistance = function (a, b) {
    var m = a.length, n = b.length, d = [], i, j;
    for (i = 0; i <= m; i++) { d[i] = [i]; }
    for (j = 1; j <= n; j++) d[0][j] = j;
    for (i = 1; i <= m; i++) for (j = 1; j <= n; j++) {
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a.charAt(i - 1) === b.charAt(j - 1) ? 0 : 1));
    }
    return d[m][n];
  };

  function card(w) { return { big: w.say, small: true, word: w, say: { id: 'word-' + w.id, text: w.text, say: w.say } }; }

  DF.vocabStages = function () {
    var MIX = ['pic2word', 'pic2word', 'word2pic', 'pic2word', 'word2pic', 'pic2word', 'word2pic', 'pic2word', 'word2pic', 'word2pic'];
    var stages = THEMES.map(function (t) {
      var ws = DF.VOCAB.themes[t.id].words;
      return { theme: t.id, label: [t.name], cards: ws.slice(0, 4).map(card), types: MIX };
    });
    var all = DF.VOCAB.all;
    function byId(id) { return all.filter(function (w) { return w.id === id; })[0]; }
    stages.push({ theme: 'all', similar: true, label: ['كلمات متشابهة'], cards: ['jamal', 'jabal', 'kalb', 'qalb'].map(byId).map(card), types: MIX });
    stages.push({ theme: 'all', label: ['مراجعة'], cards: ['qitar', 'bittikh', 'nazzara', 'madrasa'].map(byId).map(card), types: MIX });
    stages.forEach(function (s, i) { s.id = 'w6s' + (i + 1); s.kind = 'words'; s.labelText = true; });
    return stages;
  };
})(window.DF);

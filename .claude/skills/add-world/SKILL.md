---
name: add-world
description: إضافة عالم جديد للعبة رحلة الضاد حسب الخطة
disable-model-invocation: true
---

أضف العالم رقم $ARGUMENTS.

1. اقرأ `memory/plan.md` (محتوى العالم وعدد مراحله وسرعته) و`memory/decisions.md`.
2. إذا تفاصيل المراحل مو مكتوبة بالخطة: اقترح توزيع المراحل واسأل المستخدم موافقة (AskUserQuestion، سؤال واحد).
3. البيانات: ملف جديد `js/data/<اسم>.js` على نمط `js/data/letters.js`. كل كلمة: id لاتيني، نص، نص مشكول للنطق، إيموجي. تجنّب صور ملتبسة أو متشابهة (زهرة/وردة، قمر/هلال).
4. `js/data/worlds.js`: بدّل `count` بـ `stages` للعالم. كل مرحلة `{ id: 'w<ع>s<م>', kind: '<نوع>', ... }`.
5. `js/game/questions.js`: أضف مولّداً في `BUILDERS` بنفس `kind`. كل سؤال: `{ type, prompt{id,text,say,parts}, show, options[3], correct }`. ١٠ أسئلة للمرحلة.
6. إذا في نوع خيار جديد (مو حرف ولا صورة): عدّل `_makeCard` في `js/game/runner.js` و`describe` في `questions.js`.
7. شاشة التعريف والمراحل في `js/ui.js` (`RENDER.intro`, `RENDER.stages`) مكتوبة للحروف: عمّمها حسب `stage.kind`.
8. `index.html`: أضف سكربت البيانات الجديد قبل `worlds.js`.
9. معرّفات الصوت الجديدة: وثّقها بتعليق `js/data/audio-manifest.js`.
10. التشكيل: العالم ١ بدون حركات على الشاشة. خط ثمانية مع الحركات لازم ينفحص بصورة وحدة قبل الاعتماد (`assets/fonts/NotoNaskhArabic-Marks.woff2` موجود كبديل).
11. افحص: `node tools/playtest.js --world <ع> --stage 1`، وبعدها آخر مرحلة.
12. حدّث `memory/plan.md` (الحالة) و`README.md`، ثم commit و push.

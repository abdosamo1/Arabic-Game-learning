---
name: add-world
description: Add a new world to the Rihlat al-Dad game according to the plan
disable-model-invocation: true
---

Add world number $ARGUMENTS.

1. Read `memory/plan.md` (the world's content, stage count and speed) and `memory/decisions.md`.
2. If the stage breakdown is not in the plan: propose one and ask the user to approve it (AskUserQuestion, one question).
3. Data: a new file `js/data/<name>.js` modelled on `js/data/letters.js`. Each word: Latin id, text, vowelled text for speech, emoji. Avoid ambiguous or similar pictures (flower/rose, moon/crescent).
4. `js/data/worlds.js`: replace the world's `count` with `stages`. Each stage is `{ id: 'w<W>s<S>', kind: '<kind>', ... }`.
5. `js/game/questions.js`: add a generator to `BUILDERS` under the same `kind`, and a placement test generator to `TESTS`. Each question: `{ type, prompt{id,text,say,parts}, show, options[3], correct }`. 10 questions per stage.
6. If there is a new option type (not a letter or a picture): update `_makeCard` in `js/game/runner.js` and `describe` in `questions.js`.
7. The intro and stages screens in `js/ui.js` (`RENDER.intro`, `RENDER.stages`) and the first-play placement prompt are written for letters: generalise them by `stage.kind`.
8. `index.html`: add the new data script before `worlds.js`.
9. Document new audio ids in the comment in `js/data/audio-manifest.js`.
10. Harakat: world 1 shows none. Check Thmanyah with harakat in one screenshot before relying on it (`assets/fonts/NotoNaskhArabic-Marks.woff2` is there as a fallback).
11. Test: `node tools/playtest.js --world <W> --stage 1`, then the last stage, then `--placement --world <W>`.
12. Update `memory/plan.md` (state) and `README.md`, then commit and push. Write all of it in English.

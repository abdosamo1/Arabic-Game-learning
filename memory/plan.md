# World plan

10 worlds, 70 stages, 10 questions per stage. The overall plan is approved. Each world's stage breakdown is shown to the user for approval before it is built.

| # | World (Arabic title) | Content | Grade | Stages | Speed | State |
|---|---|---|---|---|---|---|
| 1 | حديقة الحروف | Letters | KG | 7 | slow | Built, waiting for user feedback |
| 2 | تلّة الحركات | Harakat تَ تُ تِ | KG–1 | 7 | slow | Next |
| 3 | جسر المدود | Long vowels | 1 | 6 | slow | — |
| 4 | كهف السكون | Sukun and letter forms | 1 | 5 | slow | — |
| 5 | قلعة الشدّة | Tanwin and shadda | 1–2 | 5 | slow | — |
| 6 | سوق الكلمات | Words and pictures | 2 | 8 | medium | — |
| 7 | ورشة الإملاء | Missing letter, similar-sounding letters, sun and moon lam, ta forms | 2–3 | 8 | medium | — |
| 8 | بستان المعاني | Singular/plural, masculine/feminine, opposite, synonym | 3–4 | 8 | medium | — |
| 9 | مدينة الكلمات | Noun/verb/particle, tenses, pronouns, hamza | 4–5 | 8 | fast | — |
| 10 | قمّة الإعراب | Sentence and i'rab | 5–6 | 8 | fast | — |

Speed: slow = no timer, the character waits at the gates. Medium and fast = no waiting (code exists in `DF.SPEEDS`, not tried yet).

## World 1 (built)

4 letters per stage in alphabetical order. Questions: 4 "where is the letter" (stage letters), 3 "which letter starts the word", 2 "which picture starts with the letter", 1 review "where is the letter". Wrong options come from the stage's letters and similar earlier letters.

## Placement test (built)

Offered once on first play, and as a card on the stages screen. 12 questions across all stages of the world, harder distractors, 1 mistake allowed (2 hearts). Passing opens all stages of the world with no stars. Each world needs its own test generator in `TESTS` in `js/game/questions.js`. Rule for opening the next world is not decided yet.

## Waiting

- User feedback on world 1 before continuing.
- Later: teacher recordings, images instead of emoji, mosque platform integration, a stable public link (GitHub Pages needs a `main` branch and Pages enabled).

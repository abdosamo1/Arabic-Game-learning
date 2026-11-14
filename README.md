# Rihlat al-Dad (رحلة الضاد)

An Arabic learning game for the Dar Al-Farah school (Wernau mosque), for children from kindergarten to grade 6. It runs in the browser on phones and tablets. The game interface is Arabic only.

## How it plays

The character runs along three lanes toward three gates, with the camera behind it. Each gate shows one answer. The right gate opens and the character passes. A wrong gate knocks the character back and closes, and the child tries again.

- **Stars:** up to 3 per stage (finished / at most one mistake / no mistakes). Each star counts once.
- **School points:** every 4 stars are worth 1 school point.
- **Characters:** 6 characters. One is open from the start, the others unlock at 15, 40, 80, 130 and 180 stars.
- **Placement test:** 12 questions drawn from a whole world, one mistake allowed. Passing opens every stage of that world without awarding stars, so advanced students can skip ahead and the easy stages become optional.
- **Progress:** saved on the device (`localStorage`).

## Status

| # | World | Topic | Grade | Stages | State |
|---|---|---|---|---|---|
| 1 | Letter Garden | The 28 letters | KG | 7 | Built |
| 2 | Harakat Hill | Short vowels | KG–1 | 7 | Next |
| 3 | Madd Bridge | Long vowels | 1 | 6 | Planned |
| 4 | Sukun Cave | Sukun and letter forms | 1 | 5 | Planned |
| 5 | Shadda Castle | Tanwin and shadda | 1–2 | 5 | Planned |
| 6 | Word Market | Words and pictures | 2 | 8 | Planned |
| 7 | Spelling Workshop | Basic spelling | 2–3 | 8 | Planned |
| 8 | Meaning Orchard | Singular/plural, gender, opposites, synonyms | 3–4 | 8 | Planned |
| 9 | Word City | Parts of speech, tenses, pronouns, hamza | 4–5 | 8 | Planned |
| 10 | Grammar Summit | Sentences and i'rab | 5–6 | 8 | Planned |

Each stage has 10 questions. World 1 has three question types: find the letter you hear, pick the first letter of a pictured word, and pick the picture that starts with a letter.

## Running it

Static files, no build step and no dependencies. Open `index.html`, or serve the folder:

```
python3 -m http.server 8000
```

## Testing

```
node tools/playtest.js                # plays a full stage at three screen sizes
node tools/playtest.js --placement    # checks the placement test (pass and fail)
```

The script needs Playwright. It prints `PASS` or `FAIL` as text. Audio is not covered, because the automated browser has no sound.

## Files

| File | Contents |
|---|---|
| `index.html`, `css/style.css` | Screens and styling |
| `js/data/letters.js` | Letters, words and emoji |
| `js/data/worlds.js` | Worlds, stages and speeds |
| `js/data/characters.js` | Characters and the stars they need |
| `js/data/audio-manifest.js` | Recorded audio files |
| `js/game/questions.js` | Question and placement test generators |
| `js/game/runner.js` | The three-lane gate engine (Canvas 2D) |
| `js/game/draw.js` | Character drawing |
| `js/ui.js` | Screens and game session logic |
| `js/storage.js` | Saved progress |
| `js/audio.js` | Sound effects and speech |
| `tools/playtest.js` | Automated playthrough |
| `memory/` | Project plan and decisions |

## Audio

Questions are read by the device's Arabic text-to-speech voice. On an iPhone in silent mode the sound effects play but the speech does not; that is an iOS limit.

To replace the synthetic voice with a teacher's recording, put the file in `assets/audio/` and add a line to `js/data/audio-manifest.js`. The ids are documented in that file. Any id without a file falls back to text-to-speech. Recorded files also play in silent mode.

## Pictures

Pictures are emoji for now. To use an image instead, put it in `assets/img/words/` and add a line to `DF.WORD_IMAGES` in `js/data/letters.js`:

```js
DF.WORD_IMAGES = { batta: 'assets/img/words/batta.png' };
```

## Planned: mosque platform integration

The game is standalone today. New stars and passed placement tests are logged in `state.events` in `js/storage.js`, ready to be sent to the mosque platform's accounts and points later.

## Deploying

Static site, so Vercel needs no build: Framework Preset "Other", empty build command and output directory. Search engines are told not to index it (`<meta name="robots">` in `index.html`, `robots.txt`, and an `X-Robots-Tag` header in `vercel.json`). Progress is stored per domain, so pick the final domain before students start.

## Credits

Thmanyah typeface in `assets/fonts`. Noto Naskh Arabic is under the OFL (`assets/fonts/NotoNaskhArabic-OFL.txt`).

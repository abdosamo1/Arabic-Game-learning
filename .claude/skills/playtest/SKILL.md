---
name: playtest
description: Automated browser check of the game (full stage at three screen sizes, plus the placement test). Use after any change to gameplay, UI or world data.
---

Run:

```
node tools/playtest.js [--world 1] [--stage 1] [--shots <dir>]
node tools/playtest.js --placement
```

- Plays the whole stage at three sizes (phone, tablet, landscape phone) with one deliberate mistake.
- Checks: no browser errors, the wrong gate closes, the result is two stars, progress is saved.
- `--placement` checks the placement test: pass with one mistake opens all stages with no stars; two mistakes fail.
- Output is text only: `PASS` or `FAIL` with the reason.
- `--shots` saves screenshots. Do not use it or read the images unless the change is visual or a failure has no clear cause (images cost tokens).
- Audio is not tested (the automated browser has no sound). Tell the user.

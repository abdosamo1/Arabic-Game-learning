# Decisions

## From the user (fixed)

- Audience: kindergarten to grade 6. Dar Al-Farah school, Wernau mosque.
- Web game opened from a link in the mosque platform's library. Students play at home on phone or tablet.
- Gameplay: three lanes and gates, camera behind the character. Right answer passes, wrong answer bumps and pushes back.
- Audio: synthetic voice now, ready to be replaced by a teacher's recording.
- Pictures: emoji for now, ready to be replaced by images the user will send.
- Characters: one open, the rest unlock at 15, 40, 80, 130, 180 stars.
- Stars: 3 per stage (finish / at most one mistake / no mistakes). Each star counts once.
- Every 4 stars = 1 school point.
- Game UI is Arabic only.
- UI digits are 123, not ١٢٣ (`DF.config.arabicDigits = false`).
- Progress stays on the device for now. Later: link to accounts and points on the mosque platform `yummi2/moschee_wernau_app` (Django, `StudentPointActivity` with category library, parental consent).
- Build world by world: the user tries each world before the next.
- Placement test so advanced students skip easy stages. Passing gives no stars; stages just open and become optional.
- Save tokens: no subagents, no extra MCP servers.
- All writing about the project is in English (README, memory, skills, commits, PRs).

## From Claude (user has neither objected nor confirmed; can change)

- Game name: "رحلة الضاد".
- World names (in the plan) and characters: مشمش the cat, قطن the rabbit, دبدوب the bear, فهيم the fox, بندق the panda, ليث the lion.
- Tapping a gate is a final choice. A wrong gate closes and the child tries another. No losing; the minimum is one star.
- After a mistake the game says the name of the chosen letter, then "try again".
- An intro screen shows the stage's letters before play.
- Placement test: 12 questions, 1 mistake allowed, ends at the second mistake, can be retaken.
- Technical: Canvas 2D, plain scripts without modules or libraries, so it drops easily into Django.
- World 1 shows no harakat on screen. Thmanyah with harakat has not been checked.
- Code comments are still in Arabic.

## Findings

- iPhone silent mode: sound effects play (silent looping audio element trick), text-to-speech does not. Confirmed by the user on a real iPhone. Recorded audio files should play in silent mode. A tip on the intro screen tells the child to turn silent mode off.

## Working environment

- The repo has no `main`. A new session starts on an empty branch: fetch the newest `claude/*` branch and continue from it.
- Preview link: a private Artifact built from `index.html` (body content plus `css/ js/ assets/`).

# Instructions

- Always use the caveman skill: short, direct answers, unless the user asks for normal answers. Reply to the user in Arabic.
- Ask the user questions through the choice dialog (AskUserQuestion), one question at a time.
- Thmanyah font is in `assets/fonts`, the Dar Al-Farah logo is `assets/img/logo-dar-alfarah.jpg`. Do not modify them.
- Save tokens: no subagents, no extra MCP servers, no reading images unless needed.
- Everything written about the project (README, memory, skills, commits, PRs) is in English. The game UI stays Arabic only.

# Project

"Rihlat al-Dad": a web game that teaches Arabic, for the Dar Al-Farah school. Static files, no build. `README.md` explains the files.

- If the branch is empty or stale: fetch the newest `claude/*` branch and continue from it.
- Before working, read `memory/plan.md` (plan and status) and `memory/decisions.md` (decisions). Update them with every new decision or finished world.
- New world: `/add-world <number>`. After any gameplay change: `node tools/playtest.js` and `node tools/playtest.js --placement`.

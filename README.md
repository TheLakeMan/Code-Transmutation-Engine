<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1ocM6O5mkGT5Z2pruXMNE8wMeiFjg_GU1

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Tests and automation
- TypeScript build (baseline quality gate): `npm run build`
- Seven Gates Python tests: `python -m unittest discover -s python/tests -p "test_*.py"`

Run both commands for every change before sending a pull request.

## Contribution flow
- Start new application work from a fork of the main repository.
- Keep `Master.md` and `AGENTS.md` nearby while coding so you follow the repo's guardrails.
- Include the required test commands in your pull request notes.

## Seven Gates cellular automaton
- Execute directly: `python python/seven_gates.py --width 32 --height 16 --steps 12 --seed 7`
- Execute via npm wrapper: `npm run seven-gates`

Use the `--frames` flag to print every step instead of only the final grid.

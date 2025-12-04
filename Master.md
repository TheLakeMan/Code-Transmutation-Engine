# Code Transmutation Engine Handbook

This repository hosts the Code Transmutation Engine front-end and related tooling. Please read this file **and** `AGENTS.md` before making any change.

## How we work
- Always start by reviewing both `Master.md` and `AGENTS.md` so you understand current expectations.
- Run the full test suite for every change, even for documentation-only work.
- Build new applications in a fork of the main repository before opening a pull request upstream.
- Keep documentation for new modules or workflows close to the root so teammates can find it quickly.

## Points of contact
- Engineering owner: engineering@codetransmute.local
- For urgent production issues: #code-transmutation Slack channel (ping @maintainer)

## Test and quality checklist
Run all commands below before submitting changes:
1. TypeScript build (acts as our baseline check): `npm run build`
2. Python tests for the cellular automaton: `python -m unittest discover -s python/tests -p "test_*.py"`

## Running the Seven Gates cellular automaton
The Python implementation lives in `python/seven_gates.py`.
- Direct execution: `python python/seven_gates.py --width 32 --height 16 --steps 12 --seed 7`
- Via npm wrapper: `npm run seven-gates`

The script prints the evolving grid to stdout using seven energy bands. Adjust the CLI flags to explore different patterns.

## Notes on new applications
When you need to build a new application, create it in a fork of the main repository. Use pull requests from your fork to propose changes back to the primary repo.

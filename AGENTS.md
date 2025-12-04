# Contributor notes
- Read `Master.md` first, then this file, before making any edits.
- Keep docs and code changes in sync; update usage instructions when adding new scripts or modules.
- Do not add try/catch blocks around imports.
- Run `npm run build` and `python -m unittest discover -s python/tests -p "test_*.py"` before every commit and include results in your notes.
- Prefer lightweight, dependency-free Python utilities unless a requirement is documented.

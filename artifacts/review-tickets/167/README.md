# Service resize evidence (#167)

The before and after captures reproduce the same service selection and resize
sequence at 669 × 449. Both sets use fallback fonts because the isolated
worktree initially could not serve its symlinked font dependencies. They show
the composition defect, but do not establish production-font readability.

`red.txt` records the failing resize assertions before the fix; `green.txt`
records the focused Chromium pass after composition-specific annotations and
percentage-coordinate interpolation were implemented. The full integration
suite supplies the browser-engine and bundled-font validation.

# CI resize diagnosis

These records derive from Chromium's failing Workflows resize test on
`f852982`. `service-resize-trace-states.json` preserves click/resize calls and
95 snapshots with timing, viewport, page scroll position, pressed choices and
current article classes. It excludes the full trace and page DOM.

The second-cycle Workflows click (`call@571`, 37099.6ms) completed its jump at
1024px: page scroll reached 4740px by 37602.2ms and stayed there. The 961px resize
(`call@607`) then changed the article in the reading band. Workflows was still
selected at 38690.9ms; Automations became selected at 38725.3ms, with the same
4740px page scroll position. The final Automation drawing matched its selected
button, caption and article rule. This is reading selection after reflow, rather
than an unfinished drawing transition.

`service-resize-1024-landed.jpeg` and
`service-resize-961-reader-change.jpeg` show those successive states.
The test now aligns its requested article after each width change, asserts that
it spans the viewport midpoint and its choice is selected, then checks the
complete labels, settled pieces, overlap, clipping and minimum type size. Both
cycles and the immediate first resize during the morph remain covered.

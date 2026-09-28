# PyViz: online Python compiler + visualizer

An in-browser Python compiler that **steps through your code line by line and draws the
data structures** the way DSA pattern cards do: arrays with `L / M / R` pointers, key/count
tables, stacks, queues, heaps, grids, interval timelines, binary trees and graphs.

It ships with runnable examples for 15 must-know DSA patterns:

| # | Pattern | # | Pattern | # | Pattern |
|---|---------|---|---------|---|---------|
| 1 | Two Pointers | 6 | Monotonic Stack | 11 | Backtracking |
| 2 | Sliding Window | 7 | Prefix Sum | 12 | Binary Tree Traversal |
| 3 | Binary Search | 8 | Overlapping Intervals | 13 | Depth-First Search |
| 4 | Frequency Counting | 9 | Greedy | 14 | Breadth-First Search |
| 5 | Matrix Traversal | 10 | Top K Elements | 15 | Dynamic Programming |

It also has **45 practice problems**, three for each pattern (at least one Easy per pattern), taken from well-known LeetCode and
HackerRank questions (Valid Palindrome, Longest Substring Without Repeating Characters, Number
of Islands, Coin Change…). Each problem has:

- a short description in our own words, with a link to the original problem
- starter code you can **▶ Visualize** as you write it
- **✓ Submit**, which runs the test cases and shows ✓/✗ for each one with the expected and actual output
- **Show solution**, which reveals a reference solution you can also visualize
- a ✓ in the list once you've solved it (saved in your browser)

You can edit any example or write your own code. It all runs locally in your browser
through [Pyodide](https://pyodide.org) (CPython compiled to WebAssembly), so there's no
server to run.

## Run it

It's a static site. Serve the folder over HTTP (Web Workers don't load from `file://`):

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

The first run downloads the Python runtime (~10 MB) from jsDelivr. After that it's cached.

- **▶ Visualize** (Ctrl+Enter) traces the program and opens the step player (◀ ▶, slider,
  play/pause, ← → keys). The current line is highlighted in the editor.
- **Run** (Shift+Enter) just executes the code and prints the output.
- `input()` reads from the **stdin** box.
- Programs are stopped after 10 s (Run) or 3000 traced steps (Visualize).

## How variables are drawn

The visualizer chooses a drawing from each value's shape and its variable name:

| Value | Drawn as |
|-------|----------|
| list of numbers/strings | array cells. Int variables named `left/right`, `lo/mid/hi`, `l/r`, `i/j`, `start/end`… become pointers under the cells, and cells outside `left..right` / `lo..hi` are dimmed |
| list named `*stack*` | vertical stack with the top marked |
| `deque` or list named `*queue*` | queue with front/back |
| list named `*heap*` | array plus heap tree |
| list of `[a, b]` pairs | interval timeline |
| list of equal-length rows | grid. `(r, c)`, `(i, j)`, `(row, col)` mark the current cell, and `dp` grids also outline `dp[i-1][j]` and `dp[i][j-1]` |
| dict of adjacency lists | graph: current node orange, queued blue, visited green (taken from `seen`/`visited`/`dist`/`order`/…) |
| other dict | Key / Value (or Count) table |
| object with `left`/`right` | binary tree (a local `node` highlights its node) |
| object with `next` | linked list |

Cells that changed since the previous step turn **blue**. The cell under a pointer is **orange**.

## Project layout

| File | Role |
|------|------|
| `index.html`, `style.css` | page shell and the dark card theme |
| `app.js` | editor (CodeMirror 5), pattern list, step player |
| `worker.js` | Web Worker that loads Pyodide and runs code off the main thread |
| `tracer.py` | runs inside Pyodide: `sys.settrace` snapshots of every line, JSON-encoded |
| `viz.js` | renders one snapshot as cards |
| `patterns.js` | the 15 pattern descriptions and example programs |
| `problems.js` | the 45 practice problems: statement, examples, tests, starter, solution |
| `tests/test_tracer.py` | runs every example through the tracer with regular CPython |
| `tests/test_problems.py` | checks every solution passes its tests and every starter loads but fails |

## Test

```bash
python3 tests/test_tracer.py
python3 tests/test_problems.py
```

## Adding a problem

Add an entry to `problems.js`: `pattern` (a pattern id), `fn` (the function the tests call),
`tests` (`args` / `expected` as JSON), and optionally `compare: "unordered"` or
`"nested_unordered"` when the order of the answer doesn't matter, or `argTypes: ["tree"]` to
pass a LeetCode-style level-order list as a `TreeNode`. Then run `tests/test_problems.py`.

## Deploy

`.github/workflows/pages.yml` publishes the site to GitHub Pages on every push to `main`.
Before the first deploy, enable Pages once in **Settings → Pages → Source: GitHub Actions**.

// Renders one trace step (see tracer.py for the data shape) as pattern cards:
// arrays with L/M/R pointers, stacks, queues, heaps, key/count tables, grids,
// interval timelines, trees and graphs.
//
// How a variable is drawn is decided by its value's shape plus its name:
//   list of scalars      -> array (int variables named like pointers mark cells)
//   name contains stack  -> vertical stack          deque / name queue -> queue
//   name contains heap   -> array + heap tree       list of [a, b]     -> timeline
//   list of equal rows   -> grid (r/c, i/j, row/col mark a cell)
//   dict of adjacency    -> graph                   other dict         -> table
//   object with left/right -> tree                  object with next   -> linked list

(function () {
  "use strict";

  // Pointer names and the colour role they get (L green, M yellow, R red, * blue).
  const ROLE = {
    left: "L", l: "L", lo: "L", low: "L", start: "L", slow: "L",
    right: "R", r: "R", hi: "R", high: "R", end: "R", fast: "R",
    mid: "M", m: "M",
    i: "P", j: "P", idx: "P", index: "P", p: "P", q: "P", head: "P", tail: "P", pos: "P",
  };
  // Pairs whose closed range [a, b] is "alive"; cells outside get dimmed.
  const RANGES = [["left", "right"], ["lo", "hi"], ["low", "high"], ["l", "r"]];
  // Row/column pointer pairs for grids.
  const CELL_PAIRS = [["r", "c"], ["i", "j"], ["row", "col"], ["y", "x"]];
  // Lists that collect output: index pointers on them would only be noise.
  const NO_POINTERS = /^(result|res|out|output|path|used|order|ans|answer|seen|visited)$|stack|queue|heap/;
  // Variables that name "the current thing" for graphs and tables.
  const CURRENT = /^(node|cur|curr|current|u|v|ch|char|key|x|word|vertex)$/;
  const VISITED = /seen|visited|dist|parent|order|path/;

  const esc = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

  const isPrim = (v) => v && v.t === "prim";
  const isInt = (v) => isPrim(v) && Number.isInteger(v.n);
  const isNum = (v) => isPrim(v) && typeof v.n === "number";

  // Display text for a scalar: strings unquoted, everything else as repr.
  function label(v) {
    if (v == null) return "None";
    if (v.t === "prim") return v.s !== undefined ? v.s : v.r;
    return short(v);
  }

  // Compact one-line repr for any encoded value.
  function short(v, budget = 48) {
    if (v == null) return "None";
    let s;
    switch (v.t) {
      case "prim": s = v.r; break;
      case "ref": s = "…"; break;
      case "list": case "deque": {
        const inner = v.items.map((x) => short(x, 16)).join(", ") + (v.len > v.items.length ? ", …" : "");
        s = v.tuple ? "(" + inner + (v.len === 1 ? ",)" : ")") : "[" + inner + "]";
        if (v.t === "deque") s = "deque(" + s + ")";
        break;
      }
      case "set": s = v.len ? "{" + v.items.map((x) => short(x, 16)).join(", ") + "}" : "set()"; break;
      case "dict": s = "{" + v.items.map(([k, x]) => short(k, 12) + ": " + short(x, 16)).join(", ") + "}"; break;
      case "tree": case "linked": s = v.t === "tree" ? "Node(" + label(v.val) + ")" : "ListNode(" + label(v.val) + ")"; break;
      case "obj": s = v.cls + "(…)"; break;
      default: s = "?";
    }
    return s.length > budget ? s.slice(0, budget - 1) + "…" : s;
  }

  const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

  // ---------------------------------------------------------------- context

  function buildContext(step, prev) {
    const focus = step.locals || step.globals;
    const ptrs = new Map();
    for (const v of focus) if (isInt(v.val)) ptrs.set(v.name, v.val.n);
    if (step.locals) for (const v of step.globals) if (isInt(v.val) && !ptrs.has(v.name)) ptrs.set(v.name, v.val.n);

    const scalars = new Map(); // name -> label, for "current node / key" highlights
    for (const v of [...(step.locals || []), ...step.globals]) {
      if (isPrim(v.val) && !scalars.has(v.name)) scalars.set(v.name, label(v.val));
    }

    // Previous values, keyed by section + name. Locals only compare within the same frame.
    const prevVals = new Map();
    if (prev) {
      for (const v of prev.globals) prevVals.set("g:" + v.name, v.val);
      const sameFrame = prev.locals && step.locals && prev.stack.length === step.stack.length &&
        prev.stack[prev.stack.length - 1].func === step.stack[step.stack.length - 1].func;
      if (sameFrame) for (const v of prev.locals) prevVals.set("l:" + v.name, v.val);
    }

    // Interval timelines share one scale so [1, 4] lines up across variables.
    let lo = Infinity, hi = -Infinity;
    for (const v of [...(step.locals || []), ...step.globals]) {
      if (isIntervals(v.name, v.val)) for (const it of v.val.items) { lo = Math.min(lo, it.items[0].n); hi = Math.max(hi, it.items[1].n); }
    }
    return { ptrs, scalars, prevVals, span: [lo, hi], hotTrees: new Set(), step };
  }

  // ---------------------------------------------------------------- shape tests

  const primList = (v) => (v.t === "list" || v.t === "deque") && v.items.every(isPrim);
  function isMatrix(v) {
    if (v.t !== "list" || v.items.length < 2) return false;
    const w = v.items[0].items ? v.items[0].items.length : -1;
    return w > 0 && v.items.every((row) => row.t === "list" && !row.tuple && row.items.length === w && row.items.every(isPrim));
  }
  function isIntervals(name, v) {
    if (!v || v.t !== "list" || !v.items.length || /^(dp|grid|matrix|board|table|memo)/.test(name)) return false;
    return v.items.every((it) => it.t === "list" && it.items.length === 2 && isNum(it.items[0]) && isNum(it.items[1]) && it.items[0].n <= it.items[1].n);
  }
  function isGraph(v) {
    if (v.t !== "dict" || !v.items.length) return false;
    const keys = new Set(v.items.map(([k]) => label(k)));
    let total = 0, hits = 0;
    for (const [k, x] of v.items) {
      if (!isPrim(k) || !(x.t === "list" || x.t === "set") || !x.items.every(isPrim)) return false;
      for (const it of x.items) { total++; if (keys.has(label(it))) hits++; }
    }
    return total > 0 && hits / total >= 0.5;
  }

  // ---------------------------------------------------------------- pieces

  const roleOf = (name) => ROLE[name] || "P";

  function head(entry, kind) {
    return '<div class="var-head"><span class="var-name">' + entry.names.map(esc).join(" = ") +
      '</span><span class="var-type">' + esc(kind) + "</span></div>";
  }

  function cellChanged(prevVal, i, item) {
    if (!prevVal || !prevVal.items) return false;
    return i >= prevVal.items.length || !same(prevVal.items[i], item);
  }

  function pointerMap(entry, len, ctx) {
    const at = {};
    if (entry.names.some((n) => NO_POINTERS.test(n))) return { at, range: null };
    for (const [name, val] of ctx.ptrs) {
      if (!(name in ROLE) || val < 0 || val >= len) continue;
      (at[val] = at[val] || []).push(name);
    }
    let range = null;
    for (const [a, b] of RANGES) {
      if (ctx.ptrs.has(a) && ctx.ptrs.has(b)) { range = [ctx.ptrs.get(a), ctx.ptrs.get(b)]; break; }
    }
    return { at, range };
  }

  function ptrTags(names) {
    return (names || []).map((n) => '<span class="ptr role-' + roleOf(n) + '">' + esc(n) + "</span>").join("");
  }

  // ---------------------------------------------------------------- renderers

  function renderArray(entry, ctx, kind) {
    const v = entry.val;
    if (!v.items.length) return head(entry, kind + " · empty") + '<div class="arr"><span class="empty-box">empty</span></div>';
    const { at, range } = pointerMap(entry, v.items.length, ctx);
    const cols = v.items.map((it, i) => {
      const hot = !!at[i];
      const dim = range && (i < range[0] || i > range[1]);
      const changed = cellChanged(entry.prev, i, it);
      const cls = hot ? "hot" : changed ? "changed" : dim ? "dim" : "";
      return '<div class="col"><span class="idx">' + i + '</span><span class="cell ' + cls + '">' + esc(label(it)) +
        '</span><span class="ptrs">' + ptrTags(at[i]) + "</span></div>";
    }).join("");
    const more = v.len > v.items.length ? '<span class="more">… +' + (v.len - v.items.length) + "</span>" : "";
    return head(entry, kind + " · " + v.len) + '<div class="arr">' + cols + more + "</div>";
  }

  function renderStack(entry) {
    const v = entry.val;
    const grew = entry.prev && entry.prev.items && v.items.length > entry.prev.items.length;
    const rows = v.items.map((it, i) => ({ it, i })).reverse().map(({ it, i }, k) => {
      const top = k === 0;
      return '<div class="stack-row">' + (top ? '<span class="top-label">top →</span>' : '<span class="top-label"></span>') +
        '<span class="cell ' + (top && grew ? "hot" : top ? "changed" : "") + '">' + esc(label(it)) + "</span></div>";
    }).join("");
    return head(entry, "stack · " + v.len) + '<div class="stack">' + (rows || '<span class="empty-box">empty</span>') +
      '<div class="stack-base"></div></div>';
  }

  function renderQueue(entry) {
    const v = entry.val;
    const cells = v.items.map((it, i) => {
      const changed = !entry.prev || !entry.prev.items || !entry.prev.items.some((p) => same(p, it));
      return '<div class="col"><span class="idx">' + (i === 0 ? "front" : i === v.items.length - 1 ? "back" : "") +
        '</span><span class="cell ' + (changed ? "changed" : "") + '">' + esc(label(it)) + "</span></div>";
    }).join('<span class="q-arrow">←</span>');
    return head(entry, (v.t === "deque" ? "deque" : "queue") + " · " + v.len) +
      '<div class="arr queue">' + (cells || '<span class="empty-box">empty</span>') + "</div>";
  }

  // Binary tree drawing shared by heaps and Node trees. node = {label, hot, left, right}
  function treeSvg(root) {
    if (!root) return '<span class="empty-box">empty</span>';
    const nodes = [];
    let x = 0, maxDepth = 0;
    (function walk(n, depth) { // in-order x positions keep the drawing a proper BST shape
      if (!n) return;
      walk(n.left, depth + 1);
      n.x = x++; n.depth = depth; maxDepth = Math.max(maxDepth, depth);
      nodes.push(n);
      walk(n.right, depth + 1);
    })(root, 0);
    const dx = 42, dy = 54, pad = 22;
    const W = (x - 1) * dx + pad * 2, H = maxDepth * dy + pad * 2;
    const px = (n) => pad + n.x * dx, py = (n) => pad + n.depth * dy;
    let edges = "", circles = "";
    for (const n of nodes) {
      for (const c of [n.left, n.right]) if (c) edges += '<line x1="' + px(n) + '" y1="' + py(n) + '" x2="' + px(c) + '" y2="' + py(c) + '"/>';
      circles += '<g class="tnode ' + (n.hot ? "hot" : n.cls || "") + '"><circle cx="' + px(n) + '" cy="' + py(n) + '" r="16"/>' +
        '<text x="' + px(n) + '" y="' + py(n) + '">' + esc(n.label) + "</text></g>";
    }
    return '<svg class="tree" viewBox="0 0 ' + W + " " + H + '" style="max-width:' + W + 'px"><g class="edges">' + edges + "</g>" + circles + "</svg>";
  }

  function renderHeap(entry, ctx) {
    const v = entry.val;
    const build = (i) => i < v.items.length ? { label: label(v.items[i]), hot: i === 0, left: build(2 * i + 1), right: build(2 * i + 2) } : null;
    return renderArray(entry, ctx, "heap") + '<div class="tree-wrap">' + treeSvg(build(0)) + "</div>";
  }

  function toTree(t, ctx, done) {
    if (!t || t.t !== "tree") return null;
    const l = label(t.val);
    return { label: l, hot: ctx.hotTrees.has(t.id), cls: done.has(l) ? "visited" : "",
      left: toTree(t.left, ctx, done), right: toTree(t.right, ctx, done) };
  }

  // Values already emitted into output-like lists (out, order, result, ...).
  function collected(ctx) {
    const done = new Set();
    for (const { name, val } of [...(ctx.step.locals || []), ...ctx.step.globals]) {
      if ((val.t === "list" || val.t === "set") && /^(out|output|order|result|res|visited|seen|path)$/.test(name)) {
        val.items.forEach((x) => isPrim(x) && done.add(label(x)));
      }
    }
    return done;
  }

  function renderTree(entry, ctx) {
    return head(entry, "binary tree") + '<div class="tree-wrap">' + treeSvg(toTree(entry.val, ctx, collected(ctx))) + "</div>";
  }

  function renderMatrix(entry, ctx) {
    const v = entry.val;
    const rows = v.items.length, cols = v.items[0].items.length;
    let cell = null;
    if (!entry.names.some((n) => /^(dirs|directions|moves|deltas|offsets)$/.test(n)))
    for (const [a, b] of CELL_PAIRS) {
      if (ctx.ptrs.has(a) && ctx.ptrs.has(b)) {
        const r = ctx.ptrs.get(a), c = ctx.ptrs.get(b);
        if (r >= 0 && r < rows && c >= 0 && c < cols) { cell = [r, c]; break; }
      }
    }
    const isDp = entry.names.some((n) => /^(dp|memo|table)/.test(n));
    const deps = new Set();
    if (cell && isDp) { deps.add(cell[0] - 1 + "," + cell[1]); deps.add(cell[0] + "," + (cell[1] - 1)); }
    let html = '<div class="grid" style="grid-template-columns: 24px repeat(' + cols + ', 34px)"><span></span>';
    for (let c = 0; c < cols; c++) html += '<span class="idx">' + c + "</span>";
    v.items.forEach((row, r) => {
      html += '<span class="idx">' + r + "</span>";
      row.items.forEach((it, c) => {
        const prevRow = entry.prev && entry.prev.items && entry.prev.items[r];
        const changed = prevRow ? cellChanged(prevRow, c, it) : false;
        const hot = cell && cell[0] === r && cell[1] === c;
        let text = label(it), cls = hot ? "hot" : changed ? "changed" : deps.has(r + "," + c) ? "dep" : "";
        if (it.r === "True") text = "✓";
        else if (it.r === "False") { text = "·"; cls = cls || "dim"; }
        html += '<span class="cell ' + cls + '">' + esc(text) + "</span>";
      });
    });
    return head(entry, "grid · " + rows + "×" + cols) + html + "</div>";
  }

  function renderIntervals(entry, ctx) {
    const v = entry.val;
    const [lo, hi] = ctx.span;
    const width = Math.max(1, hi - lo);
    const cur = ctx.ptrs.has("start") && ctx.ptrs.has("end") ? [ctx.ptrs.get("start"), ctx.ptrs.get("end")] : null;
    const rows = v.items.map((it, i) => {
      const a = it.items[0].n, b = it.items[1].n;
      const hot = cur && cur[0] === a && cur[1] === b && !entry.names.some((n) => /merged|result|out/.test(n));
      const changed = cellChanged(entry.prev, i, it);
      const cls = hot ? "hot" : changed ? "changed" : "";
      const left = ((a - lo) / width) * 100, w = Math.max(2, ((b - a) / width) * 100);
      return '<div class="iv-row"><div class="iv-bar ' + cls + '" style="left:' + left + "%;width:" + w + '%"><span>[' + a + ", " + b + "]</span></div></div>";
    }).join("");
    return head(entry, "intervals · " + v.len) + '<div class="timeline">' + rows +
      '<div class="iv-axis"><span>' + lo + "</span><span>" + hi + "</span></div></div>";
  }

  function renderPills(entry, kind, open, close) {
    const v = entry.val;
    const prevItems = entry.prev && entry.prev.items ? entry.prev.items : null;
    const pills = v.items.map((it) => {
      const isNew = prevItems && !prevItems.some((p) => same(p, it));
      return '<span class="pill ' + (isNew ? "hot" : "") + '">' + esc(short(it, 40)) + "</span>";
    }).join("");
    const more = v.len > v.items.length ? '<span class="more">… +' + (v.len - v.items.length) + "</span>" : "";
    return head(entry, kind + " · " + v.len) + '<div class="pills"><span class="brace">' + open + "</span>" +
      (pills || '<span class="empty-box">empty</span>') + more + '<span class="brace">' + close + "</span></div>";
  }

  function renderDict(entry, ctx) {
    const v = entry.val;
    const counts = v.items.length && v.items.every(([, x]) => isInt(x)) && entry.names.some((n) => /count|freq|cnt|tally/.test(n));
    const prevMap = new Map((entry.prev && entry.prev.t === "dict" ? entry.prev.items : []).map(([k, x]) => [label(k), x]));
    const current = new Set([...ctx.scalars].filter(([n]) => CURRENT.test(n)).map(([, l]) => l));
    const rows = v.items.map(([k, x]) => {
      const key = label(k);
      const changed = entry.prev && (!prevMap.has(key) || !same(prevMap.get(key), x));
      const cls = changed ? "hot" : current.has(key) ? "cur" : "";
      return '<div class="kv-row ' + cls + '"><span>' + esc(key) + "</span><span>" + esc(short(x, 36)) + "</span></div>";
    }).join("");
    return head(entry, (v.cls === "dict" ? "dict" : v.cls) + " · " + v.len) +
      '<div class="kv"><div class="kv-row kv-head"><span>Key</span><span>' + (counts ? "Count" : "Value") + "</span></div>" +
      (rows || '<div class="kv-row"><span class="muted">empty</span><span></span></div>') + "</div>";
  }

  function renderGraph(entry, ctx) {
    const v = entry.val;
    const keys = v.items.map(([k]) => label(k));
    const n = keys.length, R = n <= 2 ? 50 : 88, cx = 120, cy = 108;
    const pos = {};
    keys.forEach((k, i) => {
      const a = -Math.PI / 2 + (2 * Math.PI * i) / n;
      pos[k] = [cx + R * Math.cos(a), cy + R * Math.sin(a)];
    });

    // Node state from other variables: current node, visited sets/dicts/lists, queued items.
    const all = [...(ctx.step.locals || []), ...ctx.step.globals];
    const current = new Set(), visited = new Set(), queued = new Set();
    for (const { name, val } of all) {
      if (isPrim(val) && CURRENT.test(name)) current.add(label(val));
      if (val.id === v.id) continue;
      if ((val.t === "set" || (val.t === "list" && VISITED.test(name))) && val.items.every(isPrim)) val.items.forEach((x) => visited.add(label(x)));
      if (val.t === "dict" && VISITED.test(name)) val.items.forEach(([k]) => visited.add(label(k)));
      if ((val.t === "deque" || /queue|stack/.test(name)) && val.items) val.items.forEach((x) => isPrim(x) && queued.add(label(x)));
    }

    let edges = "";
    const drawn = new Set();
    for (const [k, x] of v.items) {
      const a = label(k);
      for (const it of x.items) {
        const b = label(it);
        if (!pos[b] || drawn.has(b + "→" + a)) continue;
        drawn.add(a + "→" + b);
        const both = v.items.some(([k2, x2]) => label(k2) === b && x2.items.some((y) => label(y) === a));
        edges += '<line x1="' + pos[a][0] + '" y1="' + pos[a][1] + '" x2="' + pos[b][0] + '" y2="' + pos[b][1] + '"' +
          (both ? "" : ' marker-end="url(#arrow)"') + "/>";
      }
    }
    const nodes = keys.map((k) => {
      const cls = current.has(k) ? "hot" : queued.has(k) ? "queued" : visited.has(k) ? "visited" : "";
      return '<g class="gnode ' + cls + '"><circle cx="' + pos[k][0] + '" cy="' + pos[k][1] + '" r="16"/><text x="' + pos[k][0] + '" y="' + pos[k][1] + '">' + esc(k) + "</text></g>";
    }).join("");
    const svg = '<svg class="graph" viewBox="0 0 240 216" style="max-width:240px"><defs><marker id="arrow" viewBox="0 0 10 10" refX="26" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z"/></marker></defs><g class="edges">' + edges + "</g>" + nodes + "</svg>";
    const legend = '<div class="legend"><span class="dot hot"></span>current<span class="dot queued"></span>queued<span class="dot visited"></span>visited</div>';
    return head(entry, "graph · " + n + " nodes") + '<div class="graph-wrap">' + svg + legend + "</div>";
  }

  function renderLinked(entry) {
    const cells = [];
    let n = entry.val, guard = 0;
    while (n && n.t === "linked" && guard++ < 40) { cells.push('<span class="cell">' + esc(label(n.val)) + "</span>"); n = n.next; }
    return head(entry, "linked list") + '<div class="arr linked">' + cells.join('<span class="q-arrow">→</span>') + '<span class="q-arrow">→ None</span></div>';
  }

  function renderObj(entry) {
    const rows = entry.val.fields.map((f) => '<div class="kv-row"><span>' + esc(f.name) + "</span><span>" + esc(short(f.val, 36)) + "</span></div>").join("");
    return head(entry, entry.val.cls + " object") + '<div class="kv">' + (rows || '<div class="kv-row"><span class="muted">no fields yet</span><span></span></div>') + "</div>";
  }

  function renderEntry(entry, ctx) {
    const v = entry.val, name = entry.names[0];
    switch (v.t) {
      case "deque": return renderQueue(entry);
      case "list":
        if (/stack/.test(name) && primList(v)) return renderStack(entry);
        if (/queue/.test(name) && primList(v)) return renderQueue(entry);
        if (/heap/.test(name) && primList(v)) return renderHeap(entry, ctx);
        if (primList(v)) return renderArray(entry, ctx, v.tuple ? "tuple" : "list");
        if (isIntervals(name, v)) return renderIntervals(entry, ctx);
        if (isMatrix(v)) return renderMatrix(entry, ctx);
        return renderPills(entry, v.tuple ? "tuple" : "list", v.tuple ? "(" : "[", v.tuple ? ")" : "]");
      case "set": return renderPills(entry, "set", "{", "}");
      case "dict": return isGraph(v) ? renderGraph(entry, ctx) : renderDict(entry, ctx);
      case "tree": return renderTree(entry, ctx);
      case "linked": return renderLinked(entry);
      case "obj": return renderObj(entry);
      default: return head(entry, v.t) + '<div class="muted">' + esc(short(v)) + "</div>";
    }
  }

  function treeIds(t, out) {
    if (t && t.t === "tree") { out.add(t.id); treeIds(t.left, out); treeIds(t.right, out); }
    return out;
  }

  // ---------------------------------------------------------------- step

  function render(step, prev) {
    const ctx = buildContext(step, prev);

    // Merge variables that alias the same object (e.g. a parameter bound to a global list).
    const entries = [], byId = new Map();
    const sections = step.locals ? [["l", step.locals], ["g", step.globals]] : [["g", step.globals]];
    for (const [sec, vars] of sections) {
      for (const { name, val } of vars) {
        if (name === "_") continue;
        if (val.id && byId.has(val.id)) { byId.get(val.id).names.push(name); continue; }
        const e = { names: [name], val, sec, prev: ctx.prevVals.get(sec + ":" + name) };
        if (e.prev && e.prev.t !== val.t) e.prev = undefined;
        entries.push(e);
        if (val.id) byId.set(val.id, e);
      }
    }

    // A tree variable that points inside another drawn tree becomes a highlight, not a new tree.
    const trees = entries.filter((e) => e.val.t === "tree");
    for (const e of trees) {
      const owner = trees.find((o) => o !== e && !o.isPtr && treeIds(o.val, new Set()).has(e.val.id));
      if (owner) { e.isPtr = true; ctx.hotTrees.add(e.val.id); }
    }

    const chips = [], cards = { l: [], g: [] };
    for (const e of entries) {
      if (e.isPtr || isPrim(e.val)) {
        const text = e.isPtr ? "→ node " + label(e.val.val) : label(e.val);
        const quoted = isPrim(e.val) && e.val.s !== undefined ? e.val.r : text;
        const changed = e.prev && !same(e.prev, e.val);
        const role = ROLE[e.names[0]] && isInt(e.val) ? " role-" + roleOf(e.names[0]) : "";
        chips.push({ sec: e.sec, html: '<span class="chip' + (changed ? " changed" : "") + role + '"><b>' + esc(e.names.join(" = ")) + "</b> " + esc(quoted) + "</span>" });
      } else {
        cards[e.sec].push('<div class="var">' + renderEntry(e, ctx) + "</div>");
      }
    }

    let html = "";
    if (step.event === "return") {
      const fn = step.stack[step.stack.length - 1].func;
      html += '<div class="ret">↩ <b>' + esc(fn) + "()</b> returns <code>" + esc(short(step.ret, 60)) + "</code></div>";
    }
    for (const [sec, title] of sections.map(([s]) => [s, s === "l" ? "Locals · " + step.stack[step.stack.length - 1].func + "()" : "Globals"])) {
      const secChips = chips.filter((c) => c.sec === sec).map((c) => c.html).join("");
      if (!secChips && !cards[sec].length) continue;
      html += '<div class="section"><h4>' + esc(title) + "</h4>" + (secChips ? '<div class="chips">' + secChips + "</div>" : "") +
        '<div class="vars">' + cards[sec].join("") + "</div></div>";
    }
    return html || '<div class="empty">No variables yet.</div>';
  }

  function renderCallstack(step) {
    let frames = step.stack.map((f) => (f.func === "<module>" ? "main" : f.func + "()"));
    if (frames.length > 6) frames = [frames[0], "… " + (frames.length - 5) + " more", ...frames.slice(-4)];
    return frames.map((f, i) => '<span class="frame' + (i === frames.length - 1 ? " active" : "") + '">' + esc(f) + "</span>").join('<span class="sep">›</span>');
  }

  window.Viz = { render, renderCallstack };
})();

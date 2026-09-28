// Page wiring: sidebar (patterns + practice problems), CodeMirror editor,
// Python worker, step player and test runner.

(function () {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const RUN_TIMEOUT_MS = 10000;

  const esc = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

  // JSON test data shown the way Python would print it.
  function pyRepr(v) {
    if (v === null) return "None";
    if (v === true) return "True";
    if (v === false) return "False";
    if (typeof v === "string") return JSON.stringify(v);
    if (Array.isArray(v)) return "[" + v.map(pyRepr).join(", ") + "]";
    return String(v);
  }

  // ---------------------------------------------------------------- storage (per-viewer convenience only)
  const store = {
    get(k) { try { return localStorage.getItem("pyviz:" + k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem("pyviz:" + k, v); } catch { /* storage unavailable */ } },
    del(k) { try { localStorage.removeItem("pyviz:" + k); } catch { /* storage unavailable */ } },
  };

  // ---------------------------------------------------------------- items
  // Patterns keep their original ids/hashes; problems live under "p/<id>".
  const patternItems = PATTERNS.map((p, i) => ({ kind: "pattern", key: p.id, num: i + 1, data: p, code: p.code }));
  // Easy first within each pattern (stable sort keeps file order otherwise).
  const RANK = { Easy: 0, Medium: 1, Hard: 2 };
  const problemItems = PROBLEMS.map((p) => ({ kind: "problem", key: "p/" + p.id, data: p, code: p.starter }))
    .sort((a, b) => RANK[a.data.difficulty] - RANK[b.data.difficulty]);
  const byKey = new Map([...patternItems, ...problemItems].map((it) => [it.key, it]));
  const patternById = new Map(patternItems.map((it) => [it.data.id, it]));

  const isSolved = (id) => store.get("solved:" + id) === "1";

  // ---------------------------------------------------------------- editor
  const editor = CodeMirror($("editor"), {
    mode: "python",
    lineNumbers: true,
    indentUnit: 4,
    tabSize: 4,
    indentWithTabs: false,
    extraKeys: {
      Tab: (cm) => cm.replaceSelection("    "),
      "Ctrl-Enter": () => execute("trace"),
      "Cmd-Enter": () => execute("trace"),
      "Shift-Enter": () => execute("run"),
    },
  });

  let current = null;        // item being edited
  let viewingSolution = null; // stashed user code while the solution is shown
  let trace = null;          // {steps, out, error, truncated}
  let stepIndex = 0;
  let playTimer = null;
  let markedLines = [];

  // ---------------------------------------------------------------- sidebar
  const patternList = $("pattern-list");
  patternItems.forEach((it) => {
    const li = document.createElement("li");
    li.innerHTML = '<button data-key="' + it.key + '"><span class="num">' + it.num + ".</span> " + esc(it.data.name) + "</button>";
    patternList.appendChild(li);
  });

  let difficulty = "";
  function renderProblemList() {
    const q = $("problem-search").value.trim().toLowerCase();
    let html = "";
    for (const pat of patternItems) {
      const items = problemItems.filter((it) => it.data.pattern === pat.data.id &&
        (!difficulty || it.data.difficulty === difficulty) &&
        (!q || (it.data.title + " " + it.data.sources.map((s) => s.site).join(" ")).toLowerCase().includes(q)));
      if (!items.length) continue;
      html += '<h3 class="group">' + pat.num + ". " + esc(pat.data.name) + "</h3><ol>";
      for (const it of items) {
        html += '<li><button data-key="' + it.key + '"' + (current === it ? ' class="active"' : "") + ">" +
          '<span class="diff-dot ' + it.data.difficulty.toLowerCase() + '" title="' + it.data.difficulty + '"></span>' +
          '<span class="ptitle">' + esc(it.data.title) + "</span>" +
          (isSolved(it.data.id) ? '<span class="solved" title="Solved">✓</span>' : "") + "</button></li>";
      }
      html += "</ol>";
    }
    $("problem-list").innerHTML = html || '<p class="muted">No problems match.</p>';
    const solved = problemItems.filter((it) => isSolved(it.data.id)).length;
    $("solved-count").textContent = solved + "/" + problemItems.length;
  }

  function showTab(tab) {
    for (const t of document.querySelectorAll(".tab")) t.classList.toggle("active", t.dataset.tab === tab);
    patternList.hidden = tab !== "patterns";
    $("problem-panel").hidden = tab !== "problems";
  }

  document.querySelector(".tabs").addEventListener("click", (e) => {
    const t = e.target.closest(".tab");
    if (t) showTab(t.dataset.tab);
  });
  $("difficulty-filter").addEventListener("click", (e) => {
    const f = e.target.closest(".filter");
    if (!f) return;
    difficulty = f.dataset.diff;
    for (const b of document.querySelectorAll(".filter")) b.classList.toggle("active", b === f);
    renderProblemList();
  });
  $("problem-search").addEventListener("input", renderProblemList);
  document.querySelector(".sidebar").addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-key]");
    if (btn) select(btn.dataset.key);
  });

  // ---------------------------------------------------------------- info card
  function patternInfo(p, num) {
    const practice = problemItems.filter((it) => it.data.pattern === p.id)
      .map((it) => '<a href="#' + it.key + '" class="plink"><span class="diff-dot ' + it.data.difficulty.toLowerCase() + '"></span>' +
        esc(it.data.title) + (isSolved(it.data.id) ? " ✓" : "") + "</a>").join("");
    return '<h1><span class="num">' + num + ".</span> " + esc(p.name) + '</h1><p class="idea">' + esc(p.idea) +
      '</p><div class="meta"><span><b>Use when</b> ' + esc(p.when) + '</span><span class="badge">' + esc(p.complexity) + "</span></div>" +
      (practice ? '<div class="practice"><b>Practice</b>' + practice + "</div>" : "");
  }

  function problemInfo(p) {
    const pat = patternById.get(p.pattern);
    const sources = p.sources.map((s) => '<a class="src" href="' + s.url + '" target="_blank" rel="noopener">' + esc(s.site) + " ↗</a>").join("");
    const examples = p.examples.map((ex) => '<div class="example"><div><span class="muted">Input</span> <code>' + esc(ex.input) +
      '</code></div><div><span class="muted">Output</span> <code>' + esc(ex.output) + "</code></div></div>").join("");
    return '<div class="ptags"><span class="diff ' + p.difficulty.toLowerCase() + '">' + p.difficulty + "</span>" +
      '<a class="tag" href="#' + pat.key + '">' + pat.num + ". " + esc(pat.data.name) + "</a>" + sources +
      (isSolved(p.id) ? '<span class="solved-badge">✓ Solved</span>' : "") + "</div>" +
      "<h1>" + esc(p.title) + '</h1><p class="idea">' + esc(p.desc) + "</p>" + examples +
      '<p class="muted small">Write <code>' + esc(p.fn) + "(…)</code>, then press <b>✓ Submit</b> to run " + p.tests.length +
      " test cases. Statement paraphrased; see the original for full details.</p>";
  }

  function renderInfo() {
    $("pattern-info").innerHTML = current.kind === "pattern" ? patternInfo(current.data, current.num) : problemInfo(current.data);
  }

  // ---------------------------------------------------------------- selection
  function select(key) {
    const it = byKey.get(key) || patternItems[0];
    viewingSolution = null;
    current = it;
    for (const b of patternList.querySelectorAll("button")) b.classList.toggle("active", b.dataset.key === it.key);
    const isProblem = it.kind === "problem";
    $("btn-submit").hidden = !isProblem;
    $("btn-solution").hidden = !isProblem;
    $("btn-solution").textContent = "Show solution";
    showTab(isProblem ? "problems" : "patterns");
    renderProblemList();
    renderInfo();
    editor.setValue(store.get("code:" + it.key) || it.code);
    editor.clearHistory();
    store.set("last", it.key);
    if (location.hash !== "#" + it.key) history.replaceState(null, "", "#" + it.key);
    clearTrace("Press <b>▶ Visualize</b> to step through your code.");
    setOutput("Output", "");
  }

  editor.on("change", () => {
    if (!current || viewingSolution !== null) return;
    const code = editor.getValue();
    if (code === current.code) store.del("code:" + current.key);
    else store.set("code:" + current.key, code);
    if (trace) clearTrace("Code changed · press <b>▶ Visualize</b> again.");
  });

  $("btn-reset").onclick = () => {
    if (viewingSolution !== null) toggleSolution();
    store.del("code:" + current.key);
    editor.setValue(current.code);
  };

  function toggleSolution() {
    clearTrace("Press <b>▶ Visualize</b> to step through your code.");
    if (viewingSolution === null) {
      const mine = editor.getValue();
      viewingSolution = mine;
      editor.setValue(current.data.solution);
      $("btn-solution").textContent = "Back to my code";
    } else {
      const mine = viewingSolution;
      viewingSolution = null;
      editor.setValue(mine);
      $("btn-solution").textContent = "Show solution";
    }
  }
  $("btn-solution").onclick = toggleSolution;

  // ---------------------------------------------------------------- worker
  let worker = null, ready = false, runId = 0, pending = null;

  function setStatus(text, cls) { const s = $("status"); s.textContent = text; s.className = "status " + cls; }

  function startWorker() {
    ready = false;
    setStatus("Loading Python…", "loading");
    worker = new Worker("worker.js");
    worker.onmessage = (e) => {
      const m = e.data;
      if (m.type === "ready") { ready = true; setStatus("Python ready", "ok"); if (pending) send(pending); }
      else if (m.type === "fatal") { setStatus("Python failed to load", "err"); setOutput("Output", m.msg); }
      else if (m.type === "result" && pending && m.id === pending.id) finish(m.result, pending);
    };
  }

  function send(job) {
    setStatus(job.mode === "trace" ? "Tracing…" : job.mode === "test" ? "Testing…" : "Running…", "busy");
    const msg = { id: job.id, code: job.code };
    if (job.mode === "test") {
      const p = current.data;
      Object.assign(msg, { mode: "test", tests: p.tests, fn: p.fn, compare: p.compare || "exact", argTypes: p.argTypes || [] });
    } else {
      Object.assign(msg, { mode: "run", stdin: $("stdin").value, trace: job.mode === "trace" });
    }
    worker.postMessage(msg);
    job.timer = setTimeout(() => {
      worker.terminate();
      pending = null;
      setButtons(false);
      $("output").innerHTML = '<span class="err">Time limit exceeded (' + RUN_TIMEOUT_MS / 1000 + " s). Is there an infinite loop?</span>";
      startWorker();
    }, RUN_TIMEOUT_MS);
  }

  function execute(mode) {
    if (pending) return;
    if (mode === "test" && (!current || current.kind !== "problem")) return;
    stop();
    pending = { id: ++runId, code: editor.getValue(), mode, item: current };
    setButtons(true);
    setOutput(mode === "test" ? "Test results" : "Output", ready ? "" : "Loading Python (first run downloads ~10 MB)…");
    if (ready) send(pending);
  }

  function finish(result, job) {
    clearTimeout(job.timer);
    pending = null;
    setButtons(false);
    setStatus("Python ready", "ok");
    if (job.item !== current) return; // user switched away mid-run
    if (job.mode === "test") return showTests(result, job);
    if (job.mode === "trace" && result.steps.length) {
      trace = result;
      stepIndex = 0;
      $("step-slider").max = result.steps.length - 1;
      showStep(0);
      play();
    } else {
      clearTrace(job.mode === "trace" ? "Nothing to visualize." : "Ran without tracing · press <b>▶ Visualize</b> to see the steps.");
      showOutput(result.out, result.error, result.truncated);
      if (result.error && result.error.line) markLine(result.error.line, "cm-error-line");
    }
  }

  function setButtons(busy) {
    for (const id of ["btn-viz", "btn-run", "btn-submit"]) $(id).disabled = busy;
  }

  // ---------------------------------------------------------------- tests
  function showTests(result, job) {
    const p = job.item.data;
    unmarkLines();
    const el = $("output");
    if (result.error) {
      setOutput("Test results", "");
      el.innerHTML = '<span class="err">' + esc(result.error.msg) + "</span>";
      if (result.error.line) markLine(result.error.line, "cm-error-line");
      return;
    }
    const passed = result.results.filter((r) => r.pass).length;
    const all = passed === p.tests.length;
    let html = '<div class="verdict ' + (all ? "pass" : "fail") + '">' + (all ? "✓ Accepted" : "✗ Wrong answer") +
      " · " + passed + " / " + p.tests.length + " tests passed</div>";
    result.results.forEach((r, i) => {
      const t = p.tests[i];
      html += '<div class="test ' + (r.pass ? "pass" : "fail") + '"><span class="mark">' + (r.pass ? "✓" : "✗") + "</span>" +
        '<div><code class="call">' + esc(p.fn) + "(" + esc(t.args.map(pyRepr).join(", ")) + ")</code>" +
        (r.pass ? "" : '<div class="detail">expected <code>' + esc(pyRepr(t.expected)) + "</code> · got <code>" +
          esc(r.error || r.got) + "</code></div>") + "</div></div>";
    });
    setOutput("Test results", "");
    el.innerHTML = html;
    if (all && viewingSolution === null) {
      store.set("solved:" + p.id, "1");
      renderProblemList();
      renderInfo();
    }
  }

  // ---------------------------------------------------------------- player
  function setOutput(title, text) {
    $("output-title").textContent = title;
    $("output").textContent = text;
  }

  function clearTrace(message) {
    stop();
    trace = null;
    unmarkLines();
    $("step-slider").max = 0;
    $("step-label").textContent = "–";
    $("callstack").innerHTML = "";
    $("viz").innerHTML = '<div class="empty">' + message + "</div>";
  }

  function unmarkLines() {
    for (const [line, cls] of markedLines) editor.removeLineClass(line, "background", cls);
    markedLines = [];
  }

  function markLine(line, cls) {
    const h = editor.addLineClass(line - 1, "background", cls);
    markedLines.push([h, cls]);
    editor.scrollIntoView({ line: line - 1, ch: 0 }, 60);
  }

  function showOutput(out, error, truncated) {
    const el = $("output");
    $("output-title").textContent = "Output";
    el.innerHTML = "";
    el.append(document.createTextNode(out));
    if (truncated) el.insertAdjacentHTML("beforeend", '<span class="warn">\n[stopped after the step limit: too many steps to visualize]</span>');
    if (error) {
      const span = document.createElement("span");
      span.className = "err";
      span.textContent = (out && !out.endsWith("\n") ? "\n" : "") + error.msg;
      el.append(span);
    }
    el.scrollTop = el.scrollHeight;
  }

  function showStep(i) {
    if (!trace) return;
    const steps = trace.steps;
    stepIndex = Math.max(0, Math.min(steps.length - 1, i));
    const step = steps[stepIndex];
    const last = stepIndex === steps.length - 1;
    $("step-slider").value = stepIndex;
    $("step-label").textContent = "Step " + (stepIndex + 1) + " / " + steps.length;
    $("callstack").innerHTML = Viz.renderCallstack(step);
    $("viz").innerHTML = Viz.render(step, steps[stepIndex - 1]);
    unmarkLines();
    markLine(step.line, step.event === "return" ? "cm-return-line" : "cm-step-line");
    if (last) {
      showOutput(trace.out, trace.error, trace.truncated);
      if (trace.error && trace.error.line) markLine(trace.error.line, "cm-error-line");
    } else {
      showOutput(trace.out.slice(0, step.out), null, false);
    }
  }

  function play() {
    stop();
    if (!trace) return;
    if (stepIndex >= trace.steps.length - 1) showStep(0);
    $("btn-play").textContent = "⏸";
    const tick = () => {
      if (!trace || stepIndex >= trace.steps.length - 1) return stop();
      showStep(stepIndex + 1);
      playTimer = setTimeout(tick, +$("speed").value);
    };
    playTimer = setTimeout(tick, +$("speed").value);
  }

  function stop() {
    clearTimeout(playTimer);
    playTimer = null;
    $("btn-play").textContent = "▶";
  }

  $("btn-viz").onclick = () => execute("trace");
  $("btn-run").onclick = () => execute("run");
  $("btn-submit").onclick = () => execute("test");
  $("btn-play").onclick = () => (playTimer ? stop() : play());
  $("btn-first").onclick = () => { stop(); showStep(0); };
  $("btn-prev").onclick = () => { stop(); showStep(stepIndex - 1); };
  $("btn-next").onclick = () => { stop(); showStep(stepIndex + 1); };
  $("btn-last").onclick = () => { stop(); if (trace) showStep(trace.steps.length - 1); };
  $("step-slider").oninput = (e) => { stop(); showStep(+e.target.value); };

  document.addEventListener("keydown", (e) => {
    if (e.target.closest(".CodeMirror, textarea, input, select")) return;
    if (e.key === "ArrowRight") { stop(); showStep(stepIndex + 1); e.preventDefault(); }
    if (e.key === "ArrowLeft") { stop(); showStep(stepIndex - 1); e.preventDefault(); }
    if (e.key === " " && trace) { playTimer ? stop() : play(); e.preventDefault(); }
  });

  // ---------------------------------------------------------------- boot
  $("problem-total").textContent = problemItems.length;
  startWorker();
  select(location.hash.slice(1) || store.get("last") || patternItems[0].key);
  window.addEventListener("hashchange", () => {
    const key = location.hash.slice(1);
    if (!current || key !== current.key) select(key);
  });
})();

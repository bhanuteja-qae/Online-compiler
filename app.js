// Page wiring: pattern list, CodeMirror editor, Python worker, step player.

(function () {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const RUN_TIMEOUT_MS = 10000;

  // ---------------------------------------------------------------- storage (per-viewer convenience only)
  const store = {
    get(k) { try { return localStorage.getItem("pyviz:" + k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem("pyviz:" + k, v); } catch { /* storage unavailable */ } },
    del(k) { try { localStorage.removeItem("pyviz:" + k); } catch { /* storage unavailable */ } },
  };

  // ---------------------------------------------------------------- editor
  const editor = CodeMirror($("editor"), {
    mode: "python",
    lineNumbers: true,
    indentUnit: 4,
    tabSize: 4,
    indentWithTabs: false,
    extraKeys: {
      Tab: (cm) => cm.replaceSelection("    "),
      "Ctrl-Enter": () => execute(true),
      "Cmd-Enter": () => execute(true),
      "Shift-Enter": () => execute(false),
    },
  });

  let current = null;       // pattern object
  let trace = null;         // {steps, out, error, truncated}
  let stepIndex = 0;
  let playTimer = null;
  let markedLines = [];

  // ---------------------------------------------------------------- pattern list
  const list = $("pattern-list");
  PATTERNS.forEach((p, i) => {
    const li = document.createElement("li");
    li.innerHTML = '<button data-id="' + p.id + '"><span class="num">' + (i + 1) + ".</span> " + p.name + "</button>";
    list.appendChild(li);
  });
  list.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-id]");
    if (btn) selectPattern(btn.dataset.id);
  });

  function selectPattern(id) {
    current = PATTERNS.find((p) => p.id === id) || PATTERNS[0];
    for (const b of list.querySelectorAll("button")) b.classList.toggle("active", b.dataset.id === current.id);
    const n = PATTERNS.indexOf(current) + 1;
    $("pattern-info").innerHTML =
      '<h1><span class="num">' + n + ".</span> " + current.name + '</h1><p class="idea">' + current.idea +
      '</p><div class="meta"><span><b>Use when</b> ' + current.when + '</span><span class="badge">' + current.complexity + "</span></div>";
    editor.setValue(store.get("code:" + current.id) || current.code);
    editor.clearHistory();
    store.set("last", current.id);
    if (location.hash !== "#" + current.id) history.replaceState(null, "", "#" + current.id);
    clearTrace("Press <b>▶ Visualize</b> to step through your code.");
    $("output").textContent = "";
  }

  editor.on("change", () => {
    if (!current) return;
    const code = editor.getValue();
    if (code === current.code) store.del("code:" + current.id);
    else store.set("code:" + current.id, code);
    if (trace) clearTrace("Code changed · press <b>▶ Visualize</b> again.");
  });

  $("btn-reset").onclick = () => { store.del("code:" + current.id); editor.setValue(current.code); };

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
      else if (m.type === "fatal") setStatus("Python failed to load", "err"), ($("output").textContent = m.msg);
      else if (m.type === "result" && pending && m.id === pending.id) finish(m.result, pending.trace);
    };
  }

  function send(job) {
    setStatus(job.trace ? "Tracing…" : "Running…", "busy");
    worker.postMessage({ id: job.id, code: job.code, stdin: job.stdin, trace: job.trace });
    job.timer = setTimeout(() => {
      worker.terminate();
      pending = null;
      setButtons(false);
      $("output").innerHTML = '<span class="err">Time limit exceeded (' + RUN_TIMEOUT_MS / 1000 + " s). Is there an infinite loop?</span>";
      startWorker();
    }, RUN_TIMEOUT_MS);
  }

  function execute(withTrace) {
    if (pending) return;
    stop();
    pending = { id: ++runId, code: editor.getValue(), stdin: $("stdin").value, trace: withTrace };
    setButtons(true);
    $("output").textContent = ready ? "" : "Loading Python (first run downloads ~10 MB)…";
    if (ready) send(pending);
  }

  function finish(result, withTrace) {
    clearTimeout(pending.timer);
    pending = null;
    setButtons(false);
    setStatus("Python ready", "ok");
    if (withTrace && result.steps.length) {
      trace = result;
      stepIndex = 0;
      $("step-slider").max = result.steps.length - 1;
      showStep(0);
      play();
    } else {
      clearTrace(withTrace ? "Nothing to visualize." : "Ran without tracing · press <b>▶ Visualize</b> to see the steps.");
      showOutput(result.out, result.error, result.truncated);
      if (result.error && result.error.line) markLine(result.error.line, "cm-error-line");
    }
  }

  function setButtons(busy) {
    $("btn-viz").disabled = busy;
    $("btn-run").disabled = busy;
  }

  // ---------------------------------------------------------------- player
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

  $("btn-viz").onclick = () => execute(true);
  $("btn-run").onclick = () => execute(false);
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
  startWorker();
  selectPattern(location.hash.slice(1) || store.get("last") || PATTERNS[0].id);
  window.addEventListener("hashchange", () => {
    const id = location.hash.slice(1);
    if (!current || id !== current.id) selectPattern(id);
  });
})();

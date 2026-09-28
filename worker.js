// Web Worker that owns the Python runtime (Pyodide) so user code never blocks the
// page. The main thread terminates and recreates this worker on a timeout.
// Protocol:  in  {id, mode: "run", code, stdin, trace}
//                | {id, mode: "test", code, tests, fn, compare, argTypes}
//            out {type: "ready"} | {type: "fatal", msg} | {type: "result", id, result}

const PYODIDE_URL = "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/";
importScripts(PYODIDE_URL + "pyodide.js");

let runUser = null, runTests = null;

const ready = (async () => {
  const pyodide = await loadPyodide({ indexURL: PYODIDE_URL });
  const src = await (await fetch("tracer.py")).text();
  pyodide.runPython(src);
  runUser = pyodide.globals.get("run_user");
  runTests = pyodide.globals.get("run_tests");
  postMessage({ type: "ready" });
})().catch((err) => postMessage({ type: "fatal", msg: String(err) }));

onmessage = async (e) => {
  await ready;
  const m = e.data;
  let result;
  try {
    result = m.mode === "test"
      ? JSON.parse(runTests(m.code, JSON.stringify(m.tests), m.fn, m.compare, JSON.stringify(m.argTypes)))
      : JSON.parse(runUser(m.code, m.stdin, m.trace));
  } catch (err) {
    result = { steps: [], results: [], out: "", error: { msg: String(err), line: null }, truncated: false };
  }
  const id = m.id;
  postMessage({ type: "result", id, result });
};

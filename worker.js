// Web Worker that owns the Python runtime (Pyodide) so user code never blocks the
// page. The main thread terminates and recreates this worker on a timeout.
// Protocol:  in  {id, code, stdin, trace}
//            out {type: "ready"} | {type: "fatal", msg} | {type: "result", id, result}

const PYODIDE_URL = "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/";
importScripts(PYODIDE_URL + "pyodide.js");

let runUser = null;

const ready = (async () => {
  const pyodide = await loadPyodide({ indexURL: PYODIDE_URL });
  const src = await (await fetch("tracer.py")).text();
  pyodide.runPython(src);
  runUser = pyodide.globals.get("run_user");
  postMessage({ type: "ready" });
})().catch((err) => postMessage({ type: "fatal", msg: String(err) }));

onmessage = async (e) => {
  await ready;
  const { id, code, stdin, trace } = e.data;
  let result;
  try {
    result = JSON.parse(runUser(code, stdin, trace));
  } catch (err) {
    result = { steps: [], out: "", error: { msg: String(err), line: null }, truncated: false };
  }
  postMessage({ type: "result", id, result });
};

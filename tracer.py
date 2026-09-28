# Execution tracer that runs inside Pyodide (see worker.js).
#
# run_user(code, stdin, trace) executes the user's program and returns JSON:
#   {"steps": [...], "out": "<all stdout>", "error": {...} | null, "truncated": bool}
# Each step is a snapshot taken on a 'line' or 'return' event of user code:
#   {"line", "event", "stack": [{"func", "line"}], "globals": [var], "locals": [var] | null,
#    "ret": value | absent, "out": <length of stdout so far>}
# where var = {"name", "val"} and val is an encoded value (see enc()).

import builtins
import io
import json
import linecache
import sys
import traceback
import types
from collections import deque

FILENAME = "<user>"
MAX_STEPS = 3000
MAX_ITEMS = 64
MAX_DEPTH = 6

_HIDDEN_TYPES = (
    types.ModuleType,
    types.FunctionType,
    types.BuiltinFunctionType,
    types.MethodType,
    type,
)


class StepLimit(BaseException):
    """Raised from the trace function to stop runaway programs. BaseException so a
    user's `except Exception` cannot swallow it."""


def _prim(v):
    d = {"t": "prim", "r": repr(v)[:120]}
    if isinstance(v, bool) or v is None:
        pass
    elif isinstance(v, int):
        d["n"] = v
    elif isinstance(v, float) and v == v and v not in (float("inf"), float("-inf")):
        d["n"] = v
    elif isinstance(v, str):
        d["s"] = v[:120]
    return d


def enc(v, depth=0, path=None):
    """Encode a Python value as JSON-friendly data for the visualizer."""
    if v is None or isinstance(v, (bool, int, float, str)):
        return _prim(v)
    path = path if path is not None else set()
    oid = id(v)
    if oid in path or depth > MAX_DEPTH:
        return {"t": "ref", "id": str(oid), "r": type(v).__name__}
    path.add(oid)
    try:
        if isinstance(v, (list, tuple, deque)):
            kind = "deque" if isinstance(v, deque) else "list"
            return {
                "t": kind,
                "id": str(oid),
                "tuple": isinstance(v, tuple),
                "len": len(v),
                "items": [enc(x, depth + 1, path) for x in list(v)[:MAX_ITEMS]],
            }
        if isinstance(v, (set, frozenset)):
            try:
                items = sorted(v)
            except TypeError:
                items = list(v)
            return {
                "t": "set",
                "id": str(oid),
                "len": len(v),
                "items": [enc(x, depth + 1, path) for x in items[:MAX_ITEMS]],
            }
        if isinstance(v, dict):
            items = list(v.items())[:MAX_ITEMS]
            return {
                "t": "dict",
                "id": str(oid),
                "cls": type(v).__name__,
                "len": len(v),
                "items": [[enc(k, depth + 1, path), enc(x, depth + 1, path)] for k, x in items],
            }
        attrs = getattr(v, "__dict__", None)
        if isinstance(attrs, dict):
            val = next((attrs[k] for k in ("val", "value", "key", "data") if k in attrs), None)
            if "left" in attrs and "right" in attrs:
                return {
                    "t": "tree",
                    "id": str(oid),
                    "val": enc(val, depth + 1, path),
                    # Trees get their own depth budget: a subtree is one level deeper.
                    "left": enc(attrs["left"], 0, path) if attrs["left"] is not None else None,
                    "right": enc(attrs["right"], 0, path) if attrs["right"] is not None else None,
                }
            if "next" in attrs:
                return {
                    "t": "linked",
                    "id": str(oid),
                    "val": enc(val, depth + 1, path),
                    "next": enc(attrs["next"], 0, path) if attrs["next"] is not None else None,
                }
            return {
                "t": "obj",
                "id": str(oid),
                "cls": type(v).__name__,
                "fields": [
                    {"name": k, "val": enc(x, depth + 1, path)}
                    for k, x in list(attrs.items())[:MAX_ITEMS]
                    if not k.startswith("__")
                ],
            }
        return {"t": "prim", "r": repr(v)[:120]}
    finally:
        path.discard(oid)


def _hidden(name, v):
    return name.startswith("__") or isinstance(v, _HIDDEN_TYPES)


def _vars(mapping):
    return [{"name": k, "val": enc(v)} for k, v in list(mapping.items()) if not _hidden(k, v)]


class _Tracer:
    def __init__(self, buf):
        self.buf = buf
        self.steps = []

    def __call__(self, frame, event, arg):
        if frame.f_code.co_filename != FILENAME:
            return None
        if event == "line" or (event == "return" and frame.f_code.co_name != "<module>"):
            self.record(frame, event, arg)
        return self

    def record(self, frame, event, arg):
        if len(self.steps) >= MAX_STEPS:
            raise StepLimit()
        chain = []
        f = frame
        while f is not None:
            if f.f_code.co_filename == FILENAME:
                chain.append(f)
            f = f.f_back
        chain.reverse()
        is_module = frame.f_code.co_name == "<module>"
        step = {
            "line": frame.f_lineno,
            "event": event,
            "stack": [{"func": fr.f_code.co_name, "line": fr.f_lineno} for fr in chain],
            "globals": _vars(frame.f_globals),
            "locals": None if is_module else _vars(frame.f_locals),
            "out": len(self.buf.getvalue()),
        }
        if event == "return":
            step["ret"] = enc(arg)
        self.steps.append(step)


def _format_error(exc):
    te = traceback.TracebackException.from_exception(exc)
    user_frames = [fs for fs in te.stack if fs.filename == FILENAME]
    te.stack = traceback.StackSummary.from_list(user_frames)
    line = user_frames[-1].lineno if user_frames else getattr(exc, "lineno", None)
    text = "".join(te.format()).replace('File "<user>", ', "")
    return {"msg": text, "line": line}


def run_user(code, stdin_text="", trace=True):
    buf = io.StringIO()
    tracer = _Tracer(buf)
    linecache.cache[FILENAME] = (len(code), None, code.splitlines(True), FILENAME)
    saved = sys.stdout, sys.stderr, sys.stdin
    sys.stdout = sys.stderr = buf
    sys.stdin = io.StringIO(stdin_text or "")
    g = {"__name__": "__main__", "__builtins__": builtins}
    error, truncated = None, False
    try:
        compiled = compile(code, FILENAME, "exec")
        if trace:
            sys.settrace(tracer)
        try:
            exec(compiled, g)
        finally:
            sys.settrace(None)
    except StepLimit:
        truncated = True
    except BaseException as e:  # noqa: BLE001 - report every user error, incl. SystemExit
        error = _format_error(e)
    finally:
        sys.stdout, sys.stderr, sys.stdin = saved
    return json.dumps(
        {"steps": tracer.steps, "out": buf.getvalue(), "error": error, "truncated": truncated}
    )


# ---------------------------------------------------------------- problem tests


class _TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right


def _build_tree(values, cls):
    """Level-order list (None = missing child), LeetCode style -> tree of cls."""
    if not values or values[0] is None:
        return None
    root = cls(values[0])
    queue, i = deque([root]), 1
    while queue and i < len(values):
        node = queue.popleft()
        for side in ("left", "right"):
            if i < len(values) and values[i] is not None:
                child = cls(values[i])
                setattr(node, side, child)
                queue.append(child)
            i += 1
    return root


def _normalize(value, compare):
    value = json.loads(json.dumps(value, default=repr))  # tuples -> lists
    if compare == "unordered" and isinstance(value, list):
        return sorted(value, key=repr)
    if compare == "nested_unordered" and isinstance(value, list):
        return sorted((sorted(x, key=repr) if isinstance(x, list) else x for x in value), key=repr)
    return value


def run_tests(code, tests_json, fn_name, compare="exact", arg_types_json="[]"):
    """Load the user's code, then call fn_name on every test case.

    Returns JSON {"error": {...} | null, "results": [{"pass", "got", "error"}]}.
    Output printed by the code (e.g. its own "try it" prints) is discarded.
    """
    tests = json.loads(tests_json)
    arg_types = json.loads(arg_types_json)
    linecache.cache[FILENAME] = (len(code), None, code.splitlines(True), FILENAME)
    saved = sys.stdout, sys.stderr, sys.stdin
    sys.stdout = sys.stderr = io.StringIO()
    sys.stdin = io.StringIO("")
    g = {"__name__": "__main__", "__builtins__": builtins}
    results = []
    try:
        try:
            exec(compile(code, FILENAME, "exec"), g)
        except BaseException as e:  # noqa: BLE001
            return json.dumps({"error": _format_error(e), "results": []})
        fn = g.get(fn_name)
        if not callable(fn):
            return json.dumps({"error": {"msg": "Define a function named %s(...)" % fn_name, "line": None}, "results": []})
        tree_cls = g.get("TreeNode", _TreeNode)
        for t in tests:
            args = json.loads(json.dumps(t["args"]))  # fresh copy per call
            for k, kind in enumerate(arg_types):
                if kind == "tree":
                    args[k] = _build_tree(args[k], tree_cls)
            try:
                got = fn(*args)
                ok = _normalize(got, compare) == _normalize(t["expected"], compare)
                results.append({"pass": ok, "got": repr(got)[:200]})
            except BaseException as e:  # noqa: BLE001
                results.append({"pass": False, "got": None, "error": _format_error(e)["msg"].strip().splitlines()[-1]})
    finally:
        sys.stdout, sys.stderr, sys.stdin = saved
    return json.dumps({"error": None, "results": results})

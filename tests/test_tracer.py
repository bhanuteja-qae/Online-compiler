"""Run every pattern example through the tracer and check it traces cleanly.

Usage: python3 tests/test_tracer.py   (needs node to read patterns.js)
"""
import json
import os
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, ROOT)
from tracer import run_user  # noqa: E402

patterns = json.loads(subprocess.check_output(
    ["node", "-e", "console.log(JSON.stringify(require('./patterns.js')))"], cwd=ROOT))

EXPECTED = {
    "two-pointers": "1 + 11 = 12",
    "sliding-window": "= 9",
    "binary-search": "at index 5",
    "frequency-counting": "first unique: c",
    "matrix-traversal": "[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]",
    "monotonic-stack": "[3, 4, 4, -1]",
    "prefix-sum": "sum(1..3) = 9",
    "overlapping-intervals": "[[1, 6], [8, 12], [15, 18]]",
    "greedy": "[25, 10, 5]",
    "top-k": "[12, 11, 7]",
    "backtracking": "[2, 3], [3]]",
    "binary-tree-traversal": "[1, 2, 3, 4, 5, 6, 7]",
    "dfs": "A B C E D",
    "bfs": "A B D C E",
    "dynamic-programming": "unique paths: 10",
}

failed = 0
assert len(patterns) == 15, len(patterns)
for p in patterns:
    for trace in (True, False):
        res = json.loads(run_user(p["code"], "", trace))
        ok = (res["error"] is None and not res["truncated"]
              and EXPECTED[p["id"]] in res["out"]
              and (len(res["steps"]) > 3 if trace else not res["steps"]))
        if not ok:
            failed += 1
            print("FAIL", p["id"], "trace" if trace else "run", res["error"], repr(res["out"]))
    print(f"ok   {p['id']:24} {len(json.loads(run_user(p['code']))['steps'])} steps")

# error reporting, stdin, step limit, cycles
res = json.loads(run_user("x = 1\ny = x / 0\n"))
assert res["error"] and res["error"]["line"] == 2 and "ZeroDivisionError" in res["error"]["msg"], res
res = json.loads(run_user("print(input() + '!')", "hi\n"))
assert res["out"] == "hi!\n", res
res = json.loads(run_user("while True:\n    pass\n"))
assert res["truncated"], res
res = json.loads(run_user("a = []\na.append(a)\n"))
assert res["error"] is None
res = json.loads(run_user("def f(:\n  pass"))
assert res["error"] and res["error"]["line"] == 1, res
print("edge cases ok")
sys.exit(1 if failed else 0)

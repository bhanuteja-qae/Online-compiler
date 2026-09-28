"""Check every practice problem: the solution passes all tests, the starter loads
cleanly but does not pass, and both trace without errors.

Usage: python3 tests/test_problems.py   (needs node to read problems.js)
"""
import json
import os
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, ROOT)
from tracer import run_tests, run_user  # noqa: E402

problems = json.loads(subprocess.check_output(
    ["node", "-e", "console.log(JSON.stringify(require('./problems.js')))"], cwd=ROOT))
patterns = {p["id"] for p in json.loads(subprocess.check_output(
    ["node", "-e", "console.log(JSON.stringify(require('./patterns.js')))"], cwd=ROOT))}

failed = 0
ids = set()


def check(cond, msg):
    global failed
    if not cond:
        failed += 1
        print("FAIL", msg)


for p in problems:
    check(p["id"] not in ids, p["id"] + " duplicate id")
    ids.add(p["id"])
    check(p["pattern"] in patterns, p["id"] + " unknown pattern " + p["pattern"])
    check(p["difficulty"] in ("Easy", "Medium", "Hard"), p["id"] + " difficulty")
    args = (json.dumps(p["tests"]), p["fn"], p.get("compare", "exact"), json.dumps(p.get("argTypes", [])))

    sol = json.loads(run_tests(p["solution"], *args))
    check(sol["error"] is None, p["id"] + " solution error " + str(sol["error"]))
    bad = [i for i, r in enumerate(sol["results"]) if not r["pass"]]
    check(not bad and len(sol["results"]) == len(p["tests"]), p["id"] + " solution fails tests %s: %s" % (bad, [sol["results"][i] for i in bad]))

    start = json.loads(run_tests(p["starter"], *args))
    check(start["error"] is None, p["id"] + " starter error " + str(start["error"]))
    check(not all(r["pass"] for r in start["results"]), p["id"] + " starter passes already")

    for name, code in (("solution", p["solution"]), ("starter", p["starter"])):
        tr = json.loads(run_user(code))
        check(tr["error"] is None and not tr["truncated"], p["id"] + " %s trace: %s truncated=%s" % (name, tr["error"], tr["truncated"]))
    print(f"ok   {p['pattern']:24} {p['id']}")

print(len(problems), "problems checked")
sys.exit(1 if failed else 0)

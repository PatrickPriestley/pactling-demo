#!/usr/bin/env python3
"""Compares two brokers' can-i-deploy answers for the same pipeline runs.

    scripts/compare.py out/pactling out/ruby

Each directory holds one sub-directory per commit with can-i-deploy-<service>.json and
.exit files written by scripts/pipeline.sh. The verdict (exit code and summary.deployable),
the counts and the reason must match; hosts, uuids and verification numbers may differ.
"""
import json, re, sys
from pathlib import Path

def norm(text):
    text = re.sub(r"https?://[^/\s\"]+", "http://HOST", text)
    text = re.sub(r"verification-results/\d+", "verification-results/N", text)
    return re.sub(r"/metadata/[A-Za-z0-9_=-]+", "/metadata/M", text)

def answer(d, svc):
    exit_code = (d / f"can-i-deploy-{svc}.exit").read_text().strip()
    raw = (d / f"can-i-deploy-{svc}.json").read_text()
    doc = json.loads(raw) if raw.strip() else {}
    s = doc.get("summary", {})
    return {"exit": exit_code, "deployable": s.get("deployable"), "success": s.get("success"),
            "failed": s.get("failed"), "unknown": s.get("unknown"), "reason": norm(s.get("reason", ""))}

a, b = Path(sys.argv[1]), Path(sys.argv[2])
mismatches = 0
for commit in sorted(p.name for p in a.iterdir() if p.is_dir()):
    for svc in ["payments-api", "orders-api", "web"]:
        x, y = answer(a / commit, svc), answer(b / commit, svc)
        same = x == y
        mismatches += not same
        print(f"{'same' if same else 'DIFF'}  {commit:8s} {svc:13s} {a.name}: exit {x['exit']} deployable {x['deployable']}  {b.name}: exit {y['exit']} deployable {y['deployable']}")
        if not same:
            for k in x:
                if x[k] != y[k]:
                    print(f"      {k}: {x[k]!r} vs {y[k]!r}")
print(f"{mismatches} mismatch(es)")
sys.exit(1 if mismatches else 0)

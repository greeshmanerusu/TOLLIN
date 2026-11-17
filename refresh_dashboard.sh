#!/bin/bash
set -e

LOG_BUCKET="ecommerce-logs-499631736710-1791694761"
DASH_BUCKET="sentinelai-dashboard-499631736710-1791695635"

aws s3 cp "s3://${LOG_BUCKET}/logs/ecommerce.log" ecommerce.log

python3 - <<'PY'
import json, re

entries = []
with open("ecommerce.log", encoding="utf-8") as f:
    for line in f:
        m = re.match(
            r"(\S+\s+\S+)\s+(INFO|WARNING|ERROR)\s+(.*)",
            line.strip()
        )
        if m:
            timestamp, level, message = m.groups()
            entries.append({
                "time": timestamp,
                "level": level,
                "message": message
            })

with open("dashboard/logs.json", "w", encoding="utf-8") as f:
    json.dump(entries, f, indent=2)

print("Entries:", len(entries))
print("Errors:", sum(x["level"] == "ERROR" for x in entries))
print("Warnings:", sum(x["level"] == "WARNING" for x in entries))
PY

aws s3 cp dashboard/logs.json \
  "s3://${DASH_BUCKET}/logs.json" \
  --content-type application/json

echo "Dashboard log snapshot refreshed."

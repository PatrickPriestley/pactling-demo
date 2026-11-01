#!/usr/bin/env bash
# Runs the same three commits through both brokers and compares their verdicts:
#   c1: the system as is (everything deployable)
#   c2: web makes a breaking change (web refused, the others allowed)
#   c3: web reverts it (everything deployable again)
set -euo pipefail
cd "$(dirname "$0")/.."
PACTLING=${PACTLING_URL:-http://localhost:9393}
RUBY=${RUBY_BROKER_URL:-http://localhost:9292}
rm -rf out
for broker in pactling ruby; do
  url=$PACTLING; [ $broker = ruby ] && url=$RUBY
  echo "=== $broker ($url)"
  scripts/pipeline.sh "$url" out/$broker/c1 c1
  scripts/pipeline.sh "$url" out/$broker/c2 c2 break
  scripts/pipeline.sh "$url" out/$broker/c3 c3
done
python3 scripts/compare.py out/pactling out/ruby

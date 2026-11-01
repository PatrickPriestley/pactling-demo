#!/usr/bin/env bash
# Runs one commit of the whole system through the contract pipeline against a broker:
#   consumer tests -> publish pacts -> provider verification -> can-i-deploy -> record-deployment
# Usage: scripts/pipeline.sh <broker-url> <out-dir> <commit> [break]
# With "break", web's new pact expects a field orders-api does not return, so orders-api's
# verification fails and can-i-deploy must refuse web while still allowing the others.
set -euo pipefail
cd "$(dirname "$0")/.."
export PACT_BROKER_BASE_URL=$1 GIT_COMMIT=$3 GIT_BRANCH=main
OUT=$2; mkdir -p "$OUT"; rm -rf pacts
PB=node_modules/.bin/pact-broker
BREAK=0; [ "${4:-}" = break ] && BREAK=1
log() { echo "[$GIT_COMMIT] $*"; }

# describe-environment only takes a uuid, so look the name up in the list.
"$PB" list-environments --output json | grep -q '"name": *"staging"' \
  || "$PB" create-environment --name staging --no-production >/dev/null

log "consumer tests (web, orders-api)"
BREAK=$BREAK node --test services/web/consumer.test.js services/orders-api/consumer.test.js > "$OUT/consumer-tests.log" 2>&1

log "publish pacts"
"$PB" publish pacts --consumer-app-version "$GIT_COMMIT" --branch "$GIT_BRANCH" > "$OUT/publish.log" 2>&1

log "provider verification (orders-api, payments-api)"
# A failing pact that is still pending does not fail the provider build (Pact's pending
# pacts feature); the failed result is published and can-i-deploy sees it.
for svc in orders-api payments-api; do
  node --test "services/$svc/provider.test.js" > "$OUT/verify-$svc.log" 2>&1 || log "  $svc verification exited non-zero"
done

log "can-i-deploy to staging, then record the deployments it allows"
for svc in payments-api orders-api web; do
  set +e
  "$PB" can-i-deploy --pacticipant "$svc" --version "$GIT_COMMIT" --to-environment staging --output json > "$OUT/can-i-deploy-$svc.json" 2> "$OUT/can-i-deploy-$svc.err"
  code=$?
  set -e
  echo "$code" > "$OUT/can-i-deploy-$svc.exit"
  if [ "$code" = 0 ]; then
    "$PB" record-deployment --pacticipant "$svc" --version "$GIT_COMMIT" --environment staging > /dev/null
    log "  $svc: deployable, recorded"
  else
    log "  $svc: NOT deployable"
  fi
done

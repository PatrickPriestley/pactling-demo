# pactling-demo

A small system with consumer-driven contracts and a deployment gate, run against
[pactling](https://github.com/PatrickPriestley/pactling) and the Ruby Pact broker
2.121.2 side by side to show they give the same answers.

```
web  --(orders pact)-->  orders-api  --(payments pact)-->  payments-api
```

Each service lives in `services/` with its [pact-js](https://github.com/pact-foundation/pact-js)
consumer tests and provider verification. `scripts/pipeline.sh` runs one commit of the whole
system through the contract pipeline against a broker:

1. consumer tests write pacts (`web` of `orders-api`, `orders-api` of `payments-api`),
2. `pact-broker publish` with the commit as version and `main` as branch,
3. provider verification of the pacts the broker selects (main branch, matching branch,
   deployed or released), with results published,
4. `pact-broker can-i-deploy --to-environment staging` for each service,
5. `pact-broker record-deployment` for every service the gate allows.

`scripts/run-all.sh` sends three commits through both brokers:

| Commit | Change | Expected gate |
|---|---|---|
| c1 | the system as is | all three deployable |
| c2 | `web` expects a `currency` field `orders-api` does not return | `web` refused, the others allowed |
| c3 | `web` reverts the change | all three deployable |

and `scripts/compare.py` checks the two brokers agree on every verdict, count and reason.
The GitHub Actions workflow does the same on every push and weekly.

## Run it locally

```bash
npm ci
docker compose up -d        # pactling on :9393, Ruby broker on :9292
scripts/run-all.sh
```

To point a single pipeline run at a broker of your own:

```bash
scripts/pipeline.sh http://localhost:9393 out/try c1
```

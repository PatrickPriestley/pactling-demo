// Shared provider-verification options: what to verify and where results go.
function verifierOptions(provider, port, stateHandlers) {
  return {
    provider,
    providerBaseUrl: `http://127.0.0.1:${port}`,
    pactBrokerUrl: process.env.PACT_BROKER_BASE_URL,
    consumerVersionSelectors: [{ mainBranch: true }, { matchingBranch: true }, { deployedOrReleased: true }],
    enablePending: true,
    publishVerificationResult: true,
    providerVersion: process.env.GIT_COMMIT,
    providerVersionBranch: process.env.GIT_BRANCH,
    stateHandlers,
    logLevel: 'warn',
  };
}

module.exports = { verifierOptions };

import 'dotenv/config';
import oliPlugin from '@openlabels/oli-hardhat';

export default {
  plugins: [oliPlugin],
  networks: {
    hardhat: { type: 'edr-simulated', chainId: 8453 }
  },
  oli: {
    privateKey: process.env.OLI_PRIVATE_KEY,
    apiKey: process.env.OLI_API_KEY,
    rpcUrl: process.env.OLI_RPC_URL || 'https://mainnet.base.org',
    easAddress: process.env.OLI_EAS_ADDRESS,
    labelPoolSchema:
      process.env.OLI_LABEL_POOL_SCHEMA ||
      '0xcff83309b59685fdae9dad7c63d969150676d51d8eeda66799d1c4898b84556a'
  }
};

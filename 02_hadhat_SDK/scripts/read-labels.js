import 'dotenv/config';
import { OLIClient } from '@openlabels/oli-sdk';
import { normalizeChainId, parseCaip10 } from './chain-aliases.js';

const addressArg = process.argv[2];
const chainArg = process.argv[3];

if (!addressArg) {
  console.error('Usage: node scripts/read-labels.js <address|caip10> [chain_id]');
  process.exit(1);
}

const apiKey = process.env.OLI_API_KEY;
if (!apiKey) {
  console.error('Missing OLI_API_KEY in .env');
  process.exit(1);
}

let address = addressArg;
let chainId = chainArg;

const caip10 = parseCaip10(addressArg);
if (caip10) {
  address = caip10.address;
  chainId = caip10.chainId;
}

if (chainId) {
  chainId = normalizeChainId(chainId);
}

const oli = new OLIClient({
  api: {
    apiKey,
    enableCache: false
  }
});

await oli.init();

const response = await oli.api.getLabels({
  address,
  chain_id: chainId || undefined
});

console.log(JSON.stringify(response, null, 2));

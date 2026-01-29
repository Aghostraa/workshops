import 'dotenv/config';
import { OLIClient } from '@openlabels/oli-sdk';
import { normalizeChainId } from './chain-aliases.js';

const rawArgs = process.argv.slice(2);
const positional = [];
let attester;

for (let i = 0; i < rawArgs.length; i += 1) {
  const arg = rawArgs[i];
  if (arg === '--attester') {
    attester = rawArgs[i + 1];
    i += 1;
    continue;
  }
  if (arg.startsWith('--attester=')) {
    attester = arg.slice('--attester='.length);
    continue;
  }
  if (arg.startsWith('--')) {
    console.error(`Unknown flag: ${arg}`);
    process.exit(1);
  }
  positional.push(arg);
}

const tagId = positional[0];
const tagValue = positional[1];
const chainArg = positional[2];

if (!tagId || !tagValue) {
  console.error(
    'Usage: node scripts/read-search.js <tag_id> <tag_value> [chain_id] [--attester 0x...]'
  );
  process.exit(1);
}

const apiKey = process.env.OLI_API_KEY;
if (!apiKey) {
  console.error('Missing OLI_API_KEY in .env');
  process.exit(1);
}

const chainId = chainArg ? normalizeChainId(chainArg) : undefined;

if (attester && !/^0x[a-fA-F0-9]{40}$/.test(attester)) {
  console.error('Invalid attester address: expected 0x + 40 hex chars');
  process.exit(1);
}

const oli = new OLIClient({
  api: {
    apiKey,
    enableCache: false
  }
});

await oli.init();

let response;

if (attester) {
  const { attestations } = await oli.api.getAttestationsExpanded({
    attester,
    chain_id: chainId || null
  });

  const filtered = attestations.filter(
    (att) => Object.prototype.hasOwnProperty.call(att, tagId) && att[tagId] === tagValue
  );

  response = {
    tag_id: tagId,
    tag_value: tagValue,
    count: filtered.length,
    results: filtered
      .filter((att) => Boolean(att.recipient))
      .map((att) => ({
        address: att.recipient,
        chain_id: att.chain_id || chainId || 'unknown',
        time: att.time,
        attester: att.attester ?? null
      }))
  };
} else {
  response = await oli.api.searchAddressesByTag({
    tag_id: tagId,
    tag_value: tagValue,
    chain_id: chainId
  });
}

console.log(JSON.stringify(response, null, 2));

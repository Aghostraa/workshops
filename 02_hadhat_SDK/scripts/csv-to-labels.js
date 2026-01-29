import fs from 'fs';
import { parse } from 'csv-parse/sync';
import { normalizeChainId } from './chain-aliases.js';

const inputPath = process.argv[2];
const outputPath = process.argv[3] || 'data/labels.json';

if (!inputPath) {
  console.error('Usage: node scripts/csv-to-labels.js <input.csv> [output.json]');
  process.exit(1);
}

const csv = fs.readFileSync(inputPath, 'utf-8');
const rows = parse(csv, {
  columns: true,
  skip_empty_lines: true,
  trim: true
});

const labels = rows.map((row, index) => {
  const address = row.address || row.contract_address || row.addr;
  const chainRaw = row.chain_id || row.chain || row.network;

  if (!address) {
    throw new Error(`Row ${index + 1}: missing address`);
  }
  if (!chainRaw) {
    throw new Error(`Row ${index + 1}: missing chain_id`);
  }

  const chainId = normalizeChainId(chainRaw);

  const tags = {
    contract_name: row.contract_name || row.name || row.contract,
    owner_project: row.owner_project || row.project,
    usage_category: row.usage_category || row.category
  };

  // Remove empty tags
  Object.keys(tags).forEach((key) => {
    if (tags[key] === undefined || tags[key] === null || tags[key] === '') {
      delete tags[key];
    }
  });

  return {
    address,
    chain_id: chainId,
    tags
  };
});

fs.writeFileSync(outputPath, JSON.stringify(labels, null, 2));

console.log(`Wrote ${labels.length} labels to ${outputPath}`);

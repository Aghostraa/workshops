const CHAIN_ALIASES = {
  ethereum: 'eip155:1',
  eth: 'eip155:1',
  mainnet: 'eip155:1',
  base: 'eip155:8453',
  arbitrum: 'eip155:42161',
  optimism: 'eip155:10',
  polygon: 'eip155:137',
  starknet: 'starknet:SN_MAIN',
  'starknet-mainnet': 'starknet:SN_MAIN',
  'starknet:sn_main': 'starknet:SN_MAIN'
};

const looksLikeCaip2 = (value) => {
  const idx = value.indexOf(':');
  return idx > 0 && idx < value.length - 1 && value.indexOf(':', idx + 1) === -1;
};

export const normalizeChainId = (input) => {
  if (!input) return '';
  const raw = String(input).trim();
  if (!raw) return '';
  if (looksLikeCaip2(raw)) return raw;
  const key = raw.toLowerCase();
  if (CHAIN_ALIASES[key]) return CHAIN_ALIASES[key];
  throw new Error(`Unknown chain_id alias: ${raw}. Use CAIP-2 format like eip155:1.`);
};

export const buildCaip10 = (chainId, address) => `${chainId}:${address}`;

export const parseCaip10 = (value) => {
  const parts = value.split(':');
  if (parts.length !== 3) return null;
  const [namespace, reference, address] = parts;
  if (!namespace || !reference || !address) return null;
  return {
    chainId: `${namespace}:${reference}`,
    address
  };
};

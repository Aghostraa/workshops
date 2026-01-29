import { useState } from 'react';
import { OLIClient } from '@openlabels/oli-sdk';

const parseCaip10 = (value) => {
  const parts = value.split(':');
  if (parts.length !== 3) return null;
  const [namespace, reference, address] = parts;
  if (!namespace || !reference || !address) return null;
  return { chainId: `${namespace}:${reference}`, address };
};

const normalizeChainId = (value) => {
  if (!value) return '';
  const trimmed = value.trim();
  if (!trimmed) return '';
  if (trimmed.includes(':')) return trimmed;
  const aliases = {
    ethereum: 'eip155:1',
    eth: 'eip155:1',
    mainnet: 'eip155:1',
    base: 'eip155:8453',
    arbitrum: 'eip155:42161',
    optimism: 'eip155:10',
    polygon: 'eip155:137',
    starknet: 'starknet:SN_MAIN'
  };
  const mapped = aliases[trimmed.toLowerCase()];
  return mapped || trimmed;
};

export default function App() {
  const [addressInput, setAddressInput] = useState('');
  const [chainInput, setChainInput] = useState('');
  const [labels, setLabels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const apiKey = import.meta.env.VITE_OLI_API_KEY;

  const fetchLabels = async () => {
    setError('');
    setLabels([]);

    if (!apiKey) {
      setError('Missing VITE_OLI_API_KEY in frontend/.env');
      return;
    }

    const caip10 = parseCaip10(addressInput);
    let address = addressInput.trim();
    let chainId = chainInput.trim();

    if (caip10) {
      address = caip10.address;
      chainId = caip10.chainId;
    }

    if (!address) {
      setError('Enter an address or CAIP-10 string.');
      return;
    }

    const normalizedChainId = chainId ? normalizeChainId(chainId) : undefined;

    setLoading(true);
    try {
      const oli = new OLIClient({
        api: { apiKey, enableCache: false }
      });
      await oli.init();
      const res = await oli.api.getLabels({
        address,
        chain_id: normalizedChainId
      });
      setLabels(res.labels || []);
    } catch (err) {
      setError(err?.message || 'Failed to fetch labels');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <header className="hero">
        <h1>OLI Workshop UI</h1>
        <p>Fetch labels from the OLI label pool using oli-sdk.</p>
      </header>

      <section className="panel">
        <label>
          Address or CAIP-10
          <input
            value={addressInput}
            onChange={(e) => setAddressInput(e.target.value)}
            placeholder="eip155:1:0x... or 0x..."
          />
        </label>
        <label>
          Chain ID (optional)
          <input
            value={chainInput}
            onChange={(e) => setChainInput(e.target.value)}
            placeholder="eip155:1 (optional)"
          />
        </label>
        <button onClick={fetchLabels} disabled={loading}>
          {loading ? 'Loading...' : 'Fetch labels'}
        </button>
        {error ? <p className="error">{error}</p> : null}
      </section>

      <section className="panel">
        <h2>Results</h2>
        {labels.length === 0 ? (
          <p className="muted">No labels yet. Try another address.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>tag_id</th>
                <th>tag_value</th>
                <th>chain_id</th>
                <th>attester</th>
                <th>time</th>
              </tr>
            </thead>
            <tbody>
              {labels.map((label, idx) => (
                <tr key={`${label.tag_id}-${idx}`}>
                  <td>{label.tag_id}</td>
                  <td>{label.tag_value}</td>
                  <td>{label.chain_id}</td>
                  <td className="mono">{label.attester || '—'}</td>
                  <td>{label.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

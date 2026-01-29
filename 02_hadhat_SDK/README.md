# OLI 1‑Hour Workshop Template

A minimal, hands‑on workshop that takes a CSV list of contracts → converts to OLI labels → **attests** them (off‑chain by default) → reads and displays labels with `oli-sdk`.


---

## Workshop flow (60 minutes)

- **0–5 min** Intro: OLI labels, schema, and tools
- **5–15 min** Task 1: CSV → labels.json
- **15–30 min** Task 2: Attest labels with `oli-hardhat`
- **30–45 min** Task 3: Read labels with `oli-sdk`
- **45–60 min** Onchain bulk attestations on the live site

---

## Prereqs

- Node 18+ installed
- An OLI API key (for reads)
- A private key + RPC URL (for attestation signing)
- Basic JS/TS knowledge

---

## Setup (attendee)

First get your OLI API KEY here: https://www.openlabelsinitiative.org/developer

```bash
cd 02_hadhat_SDK
npm install
```

Create `.env` in the workshop root:
```
cp .env.example .env
# add your OLI_API_KEY
```


Hardhat env:
```bash
cd hardhat
cp .env.example .env
# add your OLI_PRIVATE_KEY (+ optional API key)
cd ..
```

---

## Task 1 — CSV → labels.json (10 min)

Goal: Prepare and convert the CSV to turn it into OLI‑compatible label objects.

SubTask 1: Check the prepared list of labels in data/chainlink-eth-datafeeds-001.csv

SubTask 2: Choose which ones you would like to work with and delete the rest. Choose atleast 3, and try to randomize your choice :)

SubTask 3: Run the script below to create compatible jsons that can be used with hardhat and the Post APIs

```bash
node scripts/csv-to-labels.js data/chainlink-eth-datafeeds-001.csv
```

✅ **Checkpoint:** `data/labels.json` exists and each item has:
- `address`
- `chain_id` (CAIP‑2)
- `tags`

> Note: the CSV uses `chain_id = ethereum`. The script (scripts/chain-aliases.js) normalizes aliases to CAIP‑2 (e.g., `ethereum` → `eip155:1`) (scripts/chain-aliases.js).

---

## Task 2 — Attest labels with `oli-hardhat` (15 min)

Goal: submit your labels to the OLI label pool (off‑chain by default).

SubTask 1: Install hardhat deps:
```bash
cd hardhat
npm install
```
SubTask 2: Submit 1 of your labels

There are multiple ways you can submit your label:

```bash
npx hardhat oli:submit-label 0xE592427A0AEce92De3Edee1F18E0157C05861564 eip155:1
'{"contract_name":"OnChainGM V2","owner_project":"onchaingm"}'
```
Make sure they are in one line or you'll get arg position errors

CAIP‑10:

```bash
npx hardhat oli:submit-label eip155:1:0xE592427A0AEce92De3Edee1F18E0157C05861564 '{"contract_name":"OnChainGM V2","owner_project":"onchaingm"}'
```
Make sure they are in one line or you'll get arg position errors

SubTask 3: Submit the rest of your labels

Remove the one you already submitted and do a bulk submit for the rest

1- Bulk Submit labels **off‑chain** (default):
```bash
npx hardhat oli:submit-label-bulk ../data/labels.json
```

2- Optional **on‑chain** (if you are rich):
```bash
npx hardhat oli:submit-label-bulk ../data/labels.json --onchain
```

✅ **Checkpoint:** you see a success response with `uid`/`uids`.

> Off‑chain writes usually appear quickly, but may take a minute to surface via read APIs.

---

## Task 3 — Read labels with `oli-sdk` (15 min)

Fetch labels for a specific address:

```bash
node scripts/read-labels.js 0xE62B71cf983019BFf55bC83B48601ce8419650CC eip155:1
```

You can also pass CAIP‑10:
```bash
node scripts/read-labels.js eip155:1:0xE62B71cf983019BFf55bC83B48601ce8419650CC
```

✅ **Checkpoint:** response JSON contains `contract_name`, `owner_project`, `usage_category`.

Optional search:
```bash
node scripts/read-search.js usage_category oracle eip155:1
```

Optional search filtered by a trusted attester:
```bash
node scripts/read-search.js usage_category oracle eip155:1 --attester 0xYourTrustedAttester
```

---

## Host demo (5 min)

- Show the bulk attestation UI on the live OLI website
- Upload a tiny CSV (3–5 rows)
- Submit on‑chain

---

## File layout

```
workshop-oli-1h/
  data/
    chainlink-eth-datafeeds-001.csv
    labels.json
  scripts/
    chain-aliases.js
    csv-to-labels.js
    read-labels.js
    read-search.js
  hardhat/
    hardhat.config.js
  frontend/
    src/
      App.jsx
```

---

## Notes / FAQ


---

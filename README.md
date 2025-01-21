# Local signer for Algorand tranasctions

Allows signing arbitrary raw transactions via Pera/Defly

## Setup

Install dependencies with:

```
pnpm i
```

In a pickle, `npm i` should also work

## Run

Run with 

```
npm run dev
```

## Use

- Visit http://localhost:5173/ 
- Connect Pera or Defly
- Paste Base64 encoded unsigned txn
- Sign
- Profit: get signed base64 encoded txn

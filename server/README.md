## Overview

The server exposes three GET API endpoints that accept specific query parameters, hash and encode them similarly to Solidity's `keccak256(abi.encodePacked(...))`, then sign the resulting hash with a private Ethereum key. This enables clients to obtain signed proofs that can be verified on-chain or off-chain.

## Setup

- Requires Node.js and npm.
- Create a `.env` file with your Ethereum private key:

```
PRIVATE_KEY=private_key_here
```

Install dependencies:

```bash
npm install
```

Start the server:
```bash
node server
```

## API Endpoints

### 1. `GET /api/proofOfAccountOwnership`

Signs proof of account ownership with the following query parameters:

- `creator` (address)
- `name` (string)
- `symbol` (string)
- `maxSupply` (uint32)
- `contract` (address)

**Response:**

```json
{
  "msgHash": "0x...",
  "signature": "0x..."
}
```


---

### 2. `GET /api/proofOfVideoOwnership`

Signs proof of video ownership with the following query parameters:

- `creator` (address)
- `ipUri` (string)
- `ipHash` (bytes32)
- `nftUri` (string)
- `nftHash` (bytes32)
- `contract` (address)

**Response:**



```json
{
  "msgHash": "0x...",
  "signature": "0x..."
}
```

---

### 3. `GET /api/proofOfRoyaltyRevenue`

Signs proof of royalty revenue transfer with the following query parameters:

- `creator` (address)
- `ipHash` (bytes32)
- `month` (string)
- `amount` (uint256)
- `token` (address)
- `contract` (address)

**Response:**



```bash
{
  "msgHash": "0x...",
  "signature": "0x..."
}
```


---

## How It Works

- The server uses `ethers.js` to hash the encoded parameters exactly as Solidity's `keccak256(abi.encodePacked(...))` would.
- It then signs the hash with the private key loaded from the environment.
- The signature and message hash can be used for verification in smart contracts or other Ethereum-compatible environments.

## Notes

- All parameters are required; missing parameters result in a 400 error.
- Signing failures return a 500 error.
- Make sure your `.env` file is secure and never committed to version control.


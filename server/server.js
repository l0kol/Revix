// src/server.js
require('dotenv').config();
const express = require('express');
const { ethers } = require('ethers');

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 5000;

const PRIVATE_KEY = process.env.PRIVATE_KEY;
if (!PRIVATE_KEY) {
  console.error('Please set PRIVATE_KEY in .env');
  process.exit(1);
}
const wallet = new ethers.Wallet(PRIVATE_KEY);

// Util: hash encoded values just like solidity keccak256(abi.encodePacked(...))
function hashPacked(types, values) {
  return ethers.utils.keccak256(ethers.utils.solidityPack(types, values));
}

// API endpoint helper
async function signPacked(types, values) {
  const msgHash = hashPacked(types, values);
  const ethHash = ethers.utils.hashMessage(ethers.utils.arrayify(msgHash));
  const signature = await wallet.signMessage(ethers.utils.arrayify(msgHash));
  return { msgHash, signature };
}

/**
 * GET /api/signCollection
 * Query params: creator, name, symbol, maxSupply, contract
 */
app.get('/api/proofOfAccountOwnership', async (req, res) => {
  try {
    const { creator, name, symbol, maxSupply, contract } = req.query;
    if (!creator || !name || !symbol || !maxSupply || !contract) {
      return res.status(400).json({ error: 'Missing params' });
    }
    const { msgHash, signature } = await signPacked(
      ['address', 'string', 'string', 'uint32', 'address'],
      [creator, name, symbol, maxSupply, contract]
    );
    res.json({ msgHash, signature });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Signing failed' });
  }
});

/**
 * GET /api/signRegisterIp
 * Query params: creator, ipUri, ipHash, nftUri, nftHash, contract
 */
app.get('/api/proofOfVideoOwnership', async (req, res) => {
  try {
    const { creator, ipUri, ipHash, nftUri, nftHash, contract } = req.query;
    if (!creator || !ipUri || !ipHash || !nftUri || !nftHash || !contract) {
      return res.status(400).json({ error: 'Missing params' });
    }
    const { msgHash, signature } = await signPacked(
      ['address', 'string', 'bytes32', 'string', 'bytes32', 'address'],
      [creator, ipUri, ipHash, nftUri, nftHash, contract]
    );
    res.json({ msgHash, signature });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Signing failed' });
  }
});

/**
 * GET /api/signTransferRevenue
 * Query params: creator, ipHash, month, amount, token, contract
 */
app.get('/api/proofOfRoyaltyRevenue', async (req, res) => {
  try {
    const { creator, ipHash, month, amount, token, contract } = req.query;
    if (!creator || !ipHash || !month || !amount || !token || !contract) {
      return res.status(400).json({ error: 'Missing params' });
    }
    const { msgHash, signature } = await signPacked(
      ['address', 'bytes32', 'string', 'uint256', 'address', 'address'],
      [creator, ipHash, month, amount, token, contract]
    );
    res.json({ msgHash, signature });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Signing failed' });
  }
});

app.listen(PORT, () => console.log(`🚀 Server listening on port ${PORT}`));

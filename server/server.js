require('dotenv').config();
const express = require('express');
const { ethers } = require('ethers');
const { google } = require('googleapis');

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
  const signature = await wallet.signMessage(ethers.utils.arrayify(msgHash));
  return { msgHash, signature };
}

// Helper: verify OAuth token and get YouTube channel info
async function verifyYouTubeToken(oauthToken) {
  if (!oauthToken) throw new Error('Missing OAuth token');

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: oauthToken });

  const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

  // Get channel info for the authenticated user
  const response = await youtube.channels.list({
    part: 'id,snippet',
    mine: true,
  });

  if (!response.data.items || response.data.items.length === 0) {
    throw new Error('No YouTube channel found for this user');
  }

  return response.data.items[0]; // Return channel info
}

/**
 * Middleware to validate OAuth token and YouTube channel ownership
 */
async function validateYouTubeAuth(req, res, next) {
  try {
    const oauthToken = req.headers['authorization']?.split(' ')[1] || req.query.oauthToken;
    if (!oauthToken) {
      return res.status(401).json({ error: 'Missing OAuth token' });
    }

    const channel = await verifyYouTubeToken(oauthToken);

    // You can add additional checks here, e.g., match channel ID with creator address or other logic

    req.youtubeChannel = channel; // Attach channel info to request for later use
    next();
  } catch (err) {
    console.error('OAuth validation failed:', err.message);
    res.status(401).json({ error: 'Invalid or expired OAuth token' });
  }
}

/**
 * GET /api/proofOfAccountOwnership
 * Query params: creator, name, symbol, maxSupply, contract
 * Requires OAuth token in Authorization header or oauthToken query param
 */
app.get('/api/proofOfAccountOwnership', validateYouTubeAuth, async (req, res) => {
  try {
    const { creator, name, symbol, maxSupply, contract } = req.query;
    if (!creator || !name || !symbol || !maxSupply || !contract) {
      return res.status(400).json({ error: 'Missing params' });
    }

    // Optional: verify that req.youtubeChannel corresponds to creator or other business logic

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
 * GET /api/proofOfVideoOwnership
 * Query params: creator, ipUri, ipHash, nftUri, nftHash, contract
 * Requires OAuth token in Authorization header or oauthToken query param
 */
app.get('/api/proofOfVideoOwnership', validateYouTubeAuth, async (req, res) => {
  try {
    const { creator, ipUri, ipHash, nftUri, nftHash, contract } = req.query;
    if (!creator || !ipUri || !ipHash || !nftUri || !nftHash || !contract) {
      return res.status(400).json({ error: 'Missing params' });
    }

    // Optional: verify ownership or other logic with req.youtubeChannel

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
 * GET /api/proofOfRoyaltyRevenue
 * Query params: creator, ipHash, month, amount, token, contract
 * Requires OAuth token in Authorization header or oauthToken query param
 */
app.get('/api/proofOfRoyaltyRevenue', validateYouTubeAuth, async (req, res) => {
  try {
    const { creator, ipHash, month, amount, token, contract } = req.query;
    if (!creator || !ipHash || !month || !amount || !token || !contract) {
      return res.status(400).json({ error: 'Missing params' });
    }

    // Optional: verify ownership or other logic with req.youtubeChannel

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

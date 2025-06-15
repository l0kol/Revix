# Revix - README

## Project Overview

**Revix** is a decentralized platform designed to empower content creators on YouTube to tokenize their intellectual property (IP) and prove ownership and revenue transparently on-chain. By bridging a Web2 platform like YouTube with Web3 blockchain ecosystems, Revix enables creators to unlock new financial opportunities of monetization, funding, fractional ownership and revenue sharing.

---

## Motivation

Many small and mid-sized content creators struggle to access capital because their digital content, despite generating revenue, lacks verifiable collateral value. Today, ownership and revenue data are siloed within centralized platforms, making it nearly impossible to use digital content as real-world assets (RWAs) in decentralized finance.

Revix addresses this gap by providing a **trustworthy, cryptographically verifiable system** that links YouTube accounts to blockchain wallets, verifies content ownership, and attests to real revenue streams.

---

## Key Problems Addressed

- **Ownership Verification:** How to prove that a creator actually controls the content they want to tokenize.
- **Revenue Verification:** How to prove that the content generates real revenue through trusted platforms like YouTube.
- **Data Portability:** How to make ownership and revenue data verifiable and portable on-chain.
- **Fraud Prevention:** How to prevent fake revenue claims or false ownership assertions.

---

## Core Features

1. **Web2-Linked Ownership Verification**  
   - Uses OAuth 2.0 to authenticate creators via their Google accounts linked to YouTube channels.  
   - Confirms that a video URL belongs to the authenticated YouTube channel via YouTube Data API.  
   - Creator signs an approval with their Web3 wallet, cryptographically binding YouTube ownership to blockchain identity.

2. **Revenue Attestation Engine**  
   - Fetches authenticated revenue data (ad earnings, memberships) from YouTube via API.  
   - Generates verifiable proofs of revenue that are recorded immutably on-chain.

3. **Smart Contract-Based IP Registry**  
   - All ownership and revenue proofs are stored on the Story Protocol blockchain.  
   - Enables tokenization of IP as NFTs and in the future also fractional ownership and programmable royalty splits.

4. **Wallet-Linked Creator Identity**  
   - Binds verified IP and revenue data to the creator’s MPC social login wallet (Tomo).  
   - Establishes a durable, decentralized identity and asset history.

---

## How It Works

### Step 1: Authentication & Linking  
- User logs in with Google OAuth, granting permission to access YouTube channel data.  
- The app receives an OAuth token to call YouTube Data API securely.  
- User connects their Web3 wallet through a social login wallet provider Tomo, creating an MPC wallet linked to their Google identity.

### Step 2: IP registration 
- The app fetches all the YouTube videos that belong to the authenticated channel.
- User selects YouTube video for IP registration.  
- User signs a cryptographic approval with their wallet.  
- This approval, along with video metadata, is sent to a smart contract on Story Protocol, registering the IP on-chain.

### Step 3: Revenue Proof Generation  
- The app fetches monetization data (ad revenue, memberships) from YouTube API and royalties/revenue from licenses and derivatives on Story Protocol.
- Revenue data is hashed and stored on-chain as proof of income. 
- This enables transparent revenue sharing and investor confidence.

### Step 4: Financial Use Cases  
- Registered IP can be tokenized and fractionalized for investment.  
- Tokens from previous IPs can be staked as collateral to incentivize creators to honor revenue sharing.  
- Investors receive automated royalty payouts based on on-chain revenue proofs.

---

## Technical Architecture

- **Frontend:** React.js with OAuth 2.0 integration for Google and YouTube APIs.  
- **Wallet Integration:** MPC social login wallet Tomo for seamless Web3 onboarding without private key management complexity.  
- **YouTube API:** Secure calls to fetch channel videos, ownership data, and monetization metrics.  
- **Blockchain:** Story Protocol for IP NFT minting, ownership registry, and relationship tracking.  
- **Smart Contracts:** Handle IP registration, revenue proof storage, staking, and royalty distribution.  

---

## Why Revix Matters

- **For Creators:** Unlock the financial value of digital content by proving ownership and revenue transparently.  
- **For Investors:** Gain confidence through verifiable on-chain proofs and automated royalty distributions.  
- **For the Ecosystem:** Bridges Web2 content platforms with Web3 finance, enabling new decentralized creator economies.  

---

## Future Directions

- Expand support to other content platforms like TikTok and Instagram.  
- Integrate AI-powered verification to combat deepfake and content impersonation.  
- Develop secondary IP marketplaces and lending protocols using tokenized IP.  
- Enhance user experience with real-time dashboards and advanced analytics.

---



## References

- [YouTube Data API OAuth Guide](https://developers.google.com/youtube/v3/guides/authentication)  
- [Story Protocol Documentation](https://www.story.foundation/)
- [Tomo Wallet MPC Social Login](https://tomo.inc/) 



**Revix** — Empowering creators to transform digital content into verifiable, collateralizable real-world assets.

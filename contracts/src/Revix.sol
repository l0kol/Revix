// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import { ISPGNFT } from "@storyprotocol/periphery/interfaces/ISPGNFT.sol";
import { IRegistrationWorkflows } from "@storyprotocol/periphery/interfaces/workflows/IRegistrationWorkflows.sol";
import { WorkflowStructs } from "@storyprotocol/periphery/lib/WorkflowStructs.sol";
import { RoyaltyModule } from "@storyprotocol/core/modules/royalty/RoyaltyModule.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";


contract Revix {
    using ECDSA for bytes32;

    IRegistrationWorkflows public immutable REGISTRATION_WORKFLOWS =
        IRegistrationWorkflows(0xbe39E1C756e921BD25DF86e7AAa31106d1eb0424);

    RoyaltyModule public immutable ROYALTY_MODULE =
        RoyaltyModule(0xD2f60c40fEbccf6311f8B47c4f2Ec6b040400086);

    address public owner;
    address public trustedSigner;  // Backend/server signing address

    mapping(address => ISPGNFT) public creatorCollections;
    mapping(bytes32 => bool) public ipRegistered;
    mapping(address => mapping(bytes32 => address)) public creatorIpIds;
    mapping(address => mapping(bytes32 => mapping(string => uint256))) public revenueProofs;

    event CollectionCreated(address indexed creator, address collection);
    event IpRegistered(address indexed creator, address ipId, uint256 tokenId);
    event RevenueProofUploaded(address indexed creator, bytes32 indexed ipMetadataHash, string month);
    event RevenueTransferredAndProofUploaded(address indexed creator, bytes32 indexed ipMetadataHash, string month, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor(address _trustedSigner) {
        owner = msg.sender;
        trustedSigner = _trustedSigner;
    }

    /// @notice Create a new SPG NFT collection for a creator, authorized by a backend signature
    /// @param creator The creator address
    /// @param name NFT collection name
    /// @param symbol NFT collection symbol
    /// @param maxSupply Max NFTs allowed
    /// @param signature Signature from trusted signer authorizing this action
    function createCollectionForCreatorWithSig(
        address creator,
        string calldata name,
        string calldata symbol,
        uint32 maxSupply,
        bytes calldata signature
    ) external returns (address collectionAddress) {
        require(address(creatorCollections[creator]) == address(0), "Collection exists");

        // Recreate the signed message hash
        bytes32 messageHash = keccak256(abi.encodePacked(creator, name, symbol, maxSupply, address(this)));
        bytes32 ethSignedMessageHash = MessageHashUtils.toEthSignedMessageHash(messageHash);

        // Recover signer from signature
        address signer = ethSignedMessageHash.recover(signature);
        require(signer == trustedSigner, "Invalid signature");

        ISPGNFT.InitParams memory params = ISPGNFT.InitParams({
            name: name,
            symbol: symbol,
            baseURI: "",
            contractURI: "",
            maxSupply: maxSupply,
            mintFee: 0,
            mintFeeToken: address(0),
            mintFeeRecipient: address(0),
            owner: creator,
            mintOpen: true,
            isPublicMinting: true
        });

        collectionAddress = REGISTRATION_WORKFLOWS.createCollection(params);
        creatorCollections[creator] = ISPGNFT(collectionAddress);

        emit CollectionCreated(creator, collectionAddress);
    }

    /// @notice Verify signature and register IP for creator if valid
    /// @param creator Creator address whose collection is used
    /// @param ipMetadataURI URI for IP metadata
    /// @param ipMetadataHash Hash of the IP metadata
    /// @param nftMetadataURI URI for NFT metadata
    /// @param nftMetadataHash Hash of the NFT metadata
    /// @param signature Signature from trusted backend authorizing this registration
    function registerIpForCreatorWithSig(
        address creator,
        string calldata ipMetadataURI,
        bytes32 ipMetadataHash,
        string calldata nftMetadataURI,
        bytes32 nftMetadataHash,
        bytes calldata signature
    ) external returns (address ipId, uint256 tokenId) {
        require(!ipRegistered[ipMetadataHash], "IP already registered");
        
        // Recreate the signed message hash (include contract address to prevent replay)
        bytes32 messageHash = keccak256(
            abi.encodePacked(
                creator,
                ipMetadataURI,
                ipMetadataHash,
                nftMetadataURI,
                nftMetadataHash,
                address(this)
            )
        );

        bytes32 ethSignedMessageHash = MessageHashUtils.toEthSignedMessageHash(messageHash);

        // Recover signer address from signature
        address signer = ethSignedMessageHash.recover(signature);
        require(signer == trustedSigner, "Invalid signature");

        ISPGNFT spgNft = creatorCollections[creator];
        require(address(spgNft) != address(0), "Collection not found for creator");

        WorkflowStructs.IPMetadata memory ipMetadata = WorkflowStructs.IPMetadata({
            ipMetadataURI: ipMetadataURI,
            ipMetadataHash: ipMetadataHash,
            nftMetadataURI: nftMetadataURI,
            nftMetadataHash: nftMetadataHash
        });

        (ipId, tokenId) = REGISTRATION_WORKFLOWS.mintAndRegisterIp(
            address(spgNft),
            creator,
            ipMetadata,
            true
        );
        ipRegistered[ipMetadataHash] = true;
        creatorIpIds[creator][ipMetadataHash] = ipId;
        emit IpRegistered(creator, ipId, tokenId);
    }

    /// @notice Upload proof of monthly revenue for a video (no token transfer)
    /// @param creator Creator address
    /// @param ipMetadataHash Hash of the IP metadata (video)
    /// @param month String representing the month, e.g. "2025-05"
    /// @param amount Amount of tokens to transfer as royalty
    /// @param signature Signature from trusted backend authorizing this upload
    function uploadRevenueProof(
        address creator,
        bytes32 ipMetadataHash,
        string calldata month,
        uint256 amount,
        bytes calldata signature
    ) external {
        // Verify signature authorizing this upload
        bytes32 messageHash = keccak256(abi.encodePacked(creator, ipMetadataHash, month, amount, address(this)));
        bytes32 ethSignedMessageHash = MessageHashUtils.toEthSignedMessageHash(messageHash);
        address signer = ethSignedMessageHash.recover(signature);
        require(signer == trustedSigner, "Invalid signature");

        // Check if IP is registered
        require(ipRegistered[ipMetadataHash], "IP not registered");
        // Check if revenue proof for this month already exists
        require(revenueProofs[creator][ipMetadataHash][month] == 0, "Proof already exists for this month");

        // Store the proof
        revenueProofs[creator][ipMetadataHash][month] = amount;

        emit RevenueProofUploaded(creator, ipMetadataHash, month);
    }

    /// @notice Transfer tokens as royalty payment via RoyaltyModule and upload revenue proof
    /// @param creator Creator address
    /// @param ipMetadataHash Hash of the IP metadata (video)
    /// @param month String representing the month, e.g. "2025-05"
    /// @param amount Amount of tokens to transfer as royalty
    /// @param token Address of ERC20 token to transfer
    /// @param signature Signature from trusted backend authorizing this payment and upload
    function transferRevenueAndUploadProof(
        address creator,
        bytes32 ipMetadataHash,
        string calldata month,
        uint256 amount,
        address token,
        bytes calldata signature
    ) external {
        // Verify signature authorizing this transfer and upload
        bytes32 messageHash = keccak256(abi.encodePacked(creator, ipMetadataHash, month, amount, token, address(this)));
        bytes32 ethSignedMessageHash = MessageHashUtils.toEthSignedMessageHash(messageHash);
        address signer = ethSignedMessageHash.recover(signature);
        require(signer == trustedSigner, "Invalid signature");
        
        // Get the creator's collection NFT contract and derive ipId (simplified assumption)
        ISPGNFT spgNft = creatorCollections[creator];
        require(address(spgNft) != address(0), "Collection not found for creator");

        address ipId = creatorIpIds[creator][ipMetadataHash];
        require(ipId != address(0), "IP not registered");

        // Call Story Protocol RoyaltyModule to pay royalty on behalf of msg.sender
        ROYALTY_MODULE.payRoyaltyOnBehalf(ipId, address(0), token, amount);

        // Store the proof
        revenueProofs[creator][ipMetadataHash][month] = amount;

        emit RevenueTransferredAndProofUploaded(creator, ipMetadataHash, month, amount);
    }
}

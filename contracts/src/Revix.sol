// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import { ISPGNFT } from "@storyprotocol/periphery/interfaces/ISPGNFT.sol";
import { IRegistrationWorkflows } from "@storyprotocol/periphery/interfaces/workflows/IRegistrationWorkflows.sol";
import { WorkflowStructs } from "@storyprotocol/periphery/lib/WorkflowStructs.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";


contract Revix {
    using ECDSA for bytes32;

    IRegistrationWorkflows public immutable REGISTRATION_WORKFLOWS =
        IRegistrationWorkflows(0xbe39E1C756e921BD25DF86e7AAa31106d1eb0424);

    address public owner;
    address public trustedSigner;  // Backend/server signing address

    mapping(address => ISPGNFT) public creatorCollections;
    mapping(bytes32 => bool) public ipRegistered;

    event CollectionCreated(address indexed creator, address collection);
    event IpRegistered(address indexed creator, address ipId, uint256 tokenId);

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
        emit IpRegistered(creator, ipId, tokenId);
    }
}

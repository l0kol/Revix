// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import "forge-std/Test.sol";
import "../src/Revix.sol";
import { IRegistrationWorkflows } from "@storyprotocol/periphery/interfaces/workflows/IRegistrationWorkflows.sol";
import { ISPGNFT } from "@storyprotocol/periphery/interfaces/ISPGNFT.sol";
import { WorkflowStructs } from "@storyprotocol/periphery/lib/WorkflowStructs.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";


contract RevixForkedTest is Test {
    using ECDSA for bytes32;

    Revix public revix;
    IRegistrationWorkflows public registrationWorkflows;

    // Simulated trusted signer key and address
    uint256 trustedSignerKey = 0xBEEFCAFEDEADBEEF1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF;
    address trustedSigner;

    address creator = address(0x1234);
    string constant collectionName = "Demo Collection";
    string constant collectionSymbol = "DEMO";
    uint32 constant maxSupply = 1000;

    string constant ipMetadataURI = "ipfs://QmDemoIpfsHashForYouTubeVideo";
    bytes32 ipMetadataHash;
    string constant nftMetadataURI = "ipfs://QmDemoIpfsHashForNFTMetadata";
    bytes32 nftMetadataHash;

    function setUp() public {
        // Fork mainnet at latest block using Story RPC endpoint
        vm.createSelectFork("https://aeneid.storyrpc.io/");

        trustedSigner = vm.addr(trustedSignerKey);

        // Use the real deployed RegistrationWorkflows contract on mainnet
        registrationWorkflows = IRegistrationWorkflows(0xbe39E1C756e921BD25DF86e7AAa31106d1eb0424);

        // Deploy your Revix contract with trustedSigner
        revix = new Revix(trustedSigner);

        // Precompute metadata hashes
        ipMetadataHash = keccak256(abi.encodePacked(ipMetadataURI));
        nftMetadataHash = keccak256(abi.encodePacked(nftMetadataURI));
    }

    function signCreateCollection(
        address _creator,
        string memory name,
        string memory symbol,
        uint32 supply,
        address contractAddr
    ) internal view returns (bytes memory) {
        bytes32 messageHash = keccak256(abi.encodePacked(_creator, name, symbol, supply, contractAddr));
        bytes32 ethSignedMessageHash = MessageHashUtils.toEthSignedMessageHash(messageHash);
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(trustedSignerKey, ethSignedMessageHash);
        return abi.encodePacked(r, s, v);
    }

    function signRegisterIp(
        address _creator,
        string memory _ipMetadataURI,
        bytes32 _ipMetadataHash,
        string memory _nftMetadataURI,
        bytes32 _nftMetadataHash,
        address contractAddr
    ) internal view returns (bytes memory) {
        bytes32 messageHash = keccak256(
            abi.encodePacked(_creator, _ipMetadataURI, _ipMetadataHash, _nftMetadataURI, _nftMetadataHash, contractAddr)
        );
        bytes32 ethSignedMessageHash = MessageHashUtils.toEthSignedMessageHash(messageHash);
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(trustedSignerKey, ethSignedMessageHash);
        return abi.encodePacked(r, s, v);
    }

    function testCreateCollectionAndRegisterIp() public {
        // Sign and create collection
        bytes memory sigCreate = signCreateCollection(creator, collectionName, collectionSymbol, maxSupply, address(revix));
        address collectionAddr = revix.createCollectionForCreatorWithSig(creator, collectionName, collectionSymbol, maxSupply, sigCreate);

        assertTrue(collectionAddr != address(0));
        assertEq(address(revix.creatorCollections(creator)), collectionAddr);

        // Sign and register IP
        bytes memory sigRegister = signRegisterIp(creator, ipMetadataURI, ipMetadataHash, nftMetadataURI, nftMetadataHash, address(revix));
        (address ipId, uint256 tokenId) = revix.registerIpForCreatorWithSig(
            creator,
            ipMetadataURI,
            ipMetadataHash,
            nftMetadataURI,
            nftMetadataHash,
            sigRegister
        );

        assertTrue(ipId != address(0));
        assertGt(tokenId, 0);
        assertTrue(revix.ipRegistered(ipMetadataHash));
    }
}

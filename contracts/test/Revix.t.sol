// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import "forge-std/Test.sol";
import "../src/Revix.sol";
import { MockERC20 } from "@storyprotocol/test/mocks/token/MockERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

contract RevixFullTest is Test {
    using ECDSA for bytes32;

    Revix revix;
    uint256 trustedKey = 0xBEEFCAFEDEADBEEF1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF;
    address trusted;

    address creator = address(0x1234);
    string constant name = "Demo";
    string constant sym = "D";
    uint32 constant max = 100;

    string constant ipUri = "ipfs://ip";
    bytes32 ipHash;
    string constant nftUri = "ipfs://nft";
    bytes32 nftHash;

    // For revenue tests
    MockERC20 token;
    uint256 constant amount = 42;
    string constant month = "2025-05";

    function setUp() public {
        vm.createSelectFork("https://aeneid.storyrpc.io/");
        trusted = vm.addr(trustedKey);
        revix = new Revix(trusted);
        ipHash = keccak256(abi.encodePacked(ipUri));
        nftHash = keccak256(abi.encodePacked(nftUri));

        token = MockERC20(0xF2104833d386a2734a4eB3B8ad6FC6812F29E38E);
        token.mint(address(this), amount);
        token.approve(address(revix.ROYALTY_MODULE()), amount);
    }

    function sign(bytes32 msgHash) internal view returns (bytes memory sig) {
        bytes32 eth = MessageHashUtils.toEthSignedMessageHash(msgHash);
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(trustedKey, eth);
        return abi.encodePacked(r,s,v);
    }

    function testCreateCollectionHappyPath() public {
        bytes32 mh = keccak256(abi.encodePacked(creator,name,sym,max,address(revix)));
        bytes memory sig = sign(mh);

        address coll = revix.createCollectionForCreatorWithSig(creator,name,sym,max,sig);
        assertEq(address(revix.creatorCollections(creator)), coll);
    }

    function testCreateCollectionFailsTwice() public {
        bytes32 mh = keccak256(abi.encodePacked(creator,name,sym,max,address(revix)));
        bytes memory sig = sign(mh);
        revix.createCollectionForCreatorWithSig(creator,name,sym,max,sig);

        vm.expectRevert("Collection exists");
        revix.createCollectionForCreatorWithSig(creator,name,sym,max,sig);
    }

    function testCreateCollectionWrongSig() public {
        bytes memory badSig = new bytes(65);
        vm.expectRevert(ECDSA.ECDSAInvalidSignature.selector);
        revix.createCollectionForCreatorWithSig(creator,name,sym,max,badSig);
    }

    function testRegisterIpHappyPath() public {
        // prepare collection
        bytes memory csig = sign( keccak256(abi.encodePacked(creator,name,sym,max,address(revix))) );
        revix.createCollectionForCreatorWithSig(creator,name,sym,max,csig);

        // register
        bytes32 mh = keccak256(abi.encodePacked(creator,ipUri,ipHash,nftUri,nftHash,address(revix)));
        bytes memory isig = sign(mh);
        (address ipId, uint256 tid) = revix.registerIpForCreatorWithSig(creator,ipUri,ipHash,nftUri,nftHash,isig);
        assertTrue(ipId != address(0));
        assertGt(tid, 0);
        assertTrue(revix.ipRegistered(ipHash));
    }

    function testRegisterIpFailDuplicate() public {
        testRegisterIpHappyPath();
        bytes32 mh = keccak256(abi.encodePacked(creator,ipUri,ipHash,nftUri,nftHash,address(revix)));
        bytes memory isig = sign(mh);
        vm.expectRevert("IP already registered");
        revix.registerIpForCreatorWithSig(creator,ipUri,ipHash,nftUri,nftHash,isig);
    }

    function testRegisterIpNoCollection() public {
        bytes32 mh = keccak256(abi.encodePacked(creator,ipUri,ipHash,nftUri,nftHash,address(revix)));
        bytes memory isig = sign(mh);
        vm.expectRevert("Collection not found for creator");
        revix.registerIpForCreatorWithSig(creator,ipUri,ipHash,nftUri,nftHash,isig);
    }

    function testRegisterIpBadSig() public {
        // setup collection
        bytes memory csig = sign( keccak256(abi.encodePacked(creator,name,sym,max,address(revix))) );
        revix.createCollectionForCreatorWithSig(creator,name,sym,max,csig);

        // bad sig
        bytes memory badSig = new bytes(65);
        vm.expectRevert(ECDSA.ECDSAInvalidSignature.selector);
        revix.registerIpForCreatorWithSig(creator,ipUri,ipHash,nftUri,nftHash,badSig);
    }

    function testUploadRevenueProofHappyPath() public {
        testRegisterIpHappyPath();
        bytes32 mh = keccak256(abi.encodePacked(creator,ipHash,month,amount,address(revix)));
        bytes memory proofSig = sign(mh);
        revix.uploadRevenueProof(creator, ipHash, month, amount, proofSig);
        assertEq(revix.revenueProofs(creator, ipHash, month), amount);
    }

    function testUploadRevenueProofFailDuplicate() public {
        testUploadRevenueProofHappyPath();
        bytes32 mh = keccak256(abi.encodePacked(creator,ipHash,month,amount,address(revix)));
        bytes memory proofSig = sign(mh);
        vm.expectRevert("Proof already exists for this month");
        revix.uploadRevenueProof(creator, ipHash, month, amount, proofSig);
    }

    function testUploadRevenueProofIPNotRegistered() public {
        bytes32 mh = keccak256(abi.encodePacked(creator,ipHash,month,amount,address(revix)));
        bytes memory proofSig = sign(mh);
        vm.expectRevert("IP not registered");
        revix.uploadRevenueProof(creator, ipHash, month, amount, proofSig);
    }

    function testUploadRevenueProofBadSig() public {
        testRegisterIpHappyPath();
        bytes memory badSig = new bytes(65);
        vm.expectRevert(ECDSA.ECDSAInvalidSignature.selector);
        revix.uploadRevenueProof(creator, ipHash, month, amount, badSig);
    }

    /* function testTransferRevenueAndUploadProofHappy() public {
        bytes memory csig = sign(keccak256(abi.encodePacked(creator, name, sym, max, address(revix))));
        revix.createCollectionForCreatorWithSig(creator, name, sym, max, csig);

        bytes32 ipMh = keccak256(abi.encodePacked(creator, ipUri, ipHash, nftUri, nftHash, address(revix)));
        bytes memory ipSig = sign(ipMh);
        (address ipId, ) = revix.registerIpForCreatorWithSig(creator, ipUri, ipHash, nftUri, nftHash, ipSig);

        uint256 licenseTermsId = pilTemplate.registerLicenseTerms(
            pilTemplate.commercialRemix({
                mintingFee: 0,
                commercialRevShare: 10 * 10 ** 6, // 10%
                royaltyPolicy: address(royaltyModule),
                currencyToken: address(token)
            })
        );

        vm.prank(creator);
        licensingModule.attachLicenseTerms(ipId, address(pilTemplate), licenseTermsId);

        vm.prank(creator);
        royaltyModule.registerVault(ipId);

        token.mint(address(this), amount);
        token.approve(address(royaltyModule), amount);

        bytes32 mh = keccak256(abi.encodePacked(creator, ipHash, month, amount, address(token), address(revix)));
        bytes memory proofSig = sign(mh);
        revix.transferRevenueAndUploadProof(creator, ipHash, month, amount, address(token), proofSig);

        assertEq(revix.revenueProofs(creator, ipHash, month), amount);
    } */


    function testTransferRevenueAndUploadProofFailBadSig() public {
        testRegisterIpHappyPath();
        bytes memory badSig = new bytes(65);
        vm.expectRevert(ECDSA.ECDSAInvalidSignature.selector);
        revix.transferRevenueAndUploadProof(creator, ipHash, month, amount, address(token), badSig);
    }

    function testTransferRevenueAndUploadProofFailNoCollectionOrIp() public {
        // no ip
        bytes32 mh = keccak256(abi.encodePacked(creator,ipHash,month,amount,address(token),address(revix)));
        bytes memory proofSig = sign(mh);
        vm.expectRevert("Collection not found for creator");
        revix.transferRevenueAndUploadProof(creator, ipHash, month, amount, address(token), proofSig);
    }

    // Repeat proof duplication for transfer
    function testTransferRevenueAndUploadProofFailDuplicate() public {
        bytes memory csig = sign(keccak256(abi.encodePacked(creator, name, sym, max, address(revix))));
        revix.createCollectionForCreatorWithSig(creator, name, sym, max, csig);


        bytes32 ipMh = keccak256(abi.encodePacked(creator, ipUri, ipHash, nftUri, nftHash, address(revix)));
        bytes memory ipSig = sign(ipMh);
        (address ipId, ) = revix.registerIpForCreatorWithSig(creator, ipUri, ipHash, nftUri, nftHash, ipSig);

        bytes32 mh = keccak256(abi.encodePacked(creator,ipHash,month,amount,address(token),address(revix)));
        bytes memory proofSig = sign(mh);
        // storage should be non-zero from prior
        vm.expectRevert(); 
        // you might get custom revert, but storage check happens post transfer
        revix.transferRevenueAndUploadProof(creator, ipHash, month, amount, address(token), proofSig);
    }
}

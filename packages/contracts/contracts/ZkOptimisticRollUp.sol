pragma solidity >= 0.6.0;

import { ISetupWizard } from "./interfaces/ISetupWizard.sol";
import { Layer2 } from "./storage/Layer2.sol";
import { Layer2Controller } from "./Layer2Controller.sol";
import { SNARKsVerifier } from "./libraries/SNARKs.sol";
import { Header, Types } from "./libraries/Types.sol";
import { Pairing } from "./libraries/Pairing.sol";
import { Hash } from "./libraries/Hash.sol";
import { SMT256 } from "smt-rollup/contracts/SMT.sol";

contract ZkOptimisticRollUp is Layer2Controller {
    using Types for Header;

    address setupWizard;

    constructor(address _setupWizard) public {
        setupWizard = _setupWizard;
    }

    modifier onlySetupWizard {
        require(msg.sender == setupWizard, "Not authorized");
        _;
    }

    function registerVk(
        uint8 numOfInputs,
        uint8 numOfOutputs,
        uint[2] memory alfa1,
        uint[2][2] memory beta2,
        uint[2][2] memory gamma2,
        uint[2][2] memory delta2,
        uint[2][] memory ic
    ) public onlySetupWizard {
        bytes32 txSig = Types.getSNARKsSignature(numOfInputs, numOfOutputs);
        SNARKsVerifier.VerifyingKey storage vk = Layer2.vks[txSig];
        vk.alfa1 = Pairing.G1Point(alfa1[0], alfa1[1]);
        vk.beta2 = Pairing.G2Point(beta2[0], beta2[1]);
        vk.gamma2 = Pairing.G2Point(gamma2[0], gamma2[1]);
        vk.delta2 = Pairing.G2Point(delta2[0], delta2[1]);
        for (uint i = 0; i < ic.length; i++) {
            vk.ic.push(Pairing.G1Point(ic[i][0], ic[i][1]));
        }
    }

    function makeUserInteractable(address addr) public onlySetupWizard{
        Layer2Controller._connectUserInteractable(addr);
    }

    function makeCoordinatable(address addr) public onlySetupWizard{
        Layer2Controller._connectCoordinatable(addr);
    }


    function makeRollUpable(address addr) public onlySetupWizard{
        Layer2Controller._connectRollUpable(addr);
    }

    function makeChallengeable(
        address depositChallenge,
        address headerChallenge,
        address migrationChallenge,
        address rollUpChallenge,
        address txChallenge
    ) public onlySetupWizard {
        Layer2Controller._connectChallengeable(
            depositChallenge,
            headerChallenge,
            migrationChallenge,
            rollUpChallenge,
            txChallenge
        );
    }

    function makeMigratable(address addr) public onlySetupWizard {
        Layer2Controller._connectMigratable(addr);
    }

    function allowMigrants(address[] memory migrants) public onlySetupWizard {
        for (uint i = 0; i < migrants.length; i++) {
            Layer2.allowedMigrants[migrants[i]] = true;
        }
    }

    function init() internal {
        uint[] memory poseidonPreHashes = Hash.poseidonPrehashedZeroes();
        uint utxoRoot = poseidonPreHashes[poseidonPreHashes.length - 1];
        uint[] memory keccakPreHashes = Hash.keccakPrehashedZeroes();
        uint withdrawalRoot = keccakPreHashes[keccakPreHashes.length - 1];
        bytes32 nullifierRoot = bytes32(0);
        for (uint i = 0; i < 256; i++) {
            nullifierRoot = keccak256(abi.encodePacked(nullifierRoot, nullifierRoot));
        }
        Header memory header = Header(
            address(this),
            bytes32(0),
            bytes32(0),
            uint256(0),
            utxoRoot,
            uint256(0),
            nullifierRoot,
            bytes32(withdrawalRoot),
            uint256(0),
            bytes32(0),
            bytes32(0),
            bytes32(0)
        );
        bytes32 genesis = header.hash();
        Layer2.chain.latest = genesis;
        Layer2.chain.withdrawables.push(); /// withdrawables[0]: daily snapshot
        Layer2.chain.withdrawables.push(); /// withdrawables[0]: initial withdrawable tree
    }

    function completeSetup() public onlySetupWizard {
        init();
        delete setupWizard;
    }
}
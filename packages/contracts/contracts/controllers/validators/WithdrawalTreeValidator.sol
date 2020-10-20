// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity = 0.6.12;

import { Storage } from "../../storage/Storage.sol";
import { Challengeable } from "../Challengeable.sol";
import { SubTreeLib } from "../../libraries/MerkleTree.sol";
import { Hash } from "../../libraries/Hash.sol";
import {
    Block,
    Transaction,
    Outflow,
    OutflowType,
    Header,
    Types
} from "../../libraries/Types.sol";
import { Deserializer } from "../../libraries/Deserializer.sol";
import { IWithdrawalTreeValidator } from "../../interfaces/validators/IWithdrawalTreeValidator.sol";

contract WithdrawalTreeValidator is Storage, IWithdrawalTreeValidator {
    using Types for Header;

    /**
     * @dev Challenge when the submitted block's updated withdrawal tree index is invalid.
     * @param // blockData Serialized block data
     * @param // parentHeader  Serialized parent header data
     */
    function validateWithdrawalIndex(
        bytes calldata, // blockData
        bytes calldata // parentHeader
    )
    external
    view
    override
    returns (bool slash, string memory reason)
    {
        Block memory l2Block = Deserializer.blockFromCalldataAt(0);
        Header memory parentHeader = Deserializer.headerFromCalldataAt(1);
        require(l2Block.header.parentBlock == parentHeader.hash(), "Invalid prev header");
        uint256 withdrawalLen = 0;
        // Get withdrawals from transactions
        for (uint256 i = 0; i < l2Block.body.txs.length; i++) {
            for(uint256 j = 0; j < l2Block.body.txs[i].outflow.length; j++) {
                if(l2Block.body.txs[i].outflow[j].outflowType == uint8(OutflowType.Withdrawal)) {
                    withdrawalLen += 1;
                }
            }
        }
        if (withdrawalLen != l2Block.header.withdrawalIndex - parentHeader.withdrawalIndex) {
            // code W1: The updated number of total Withdarawls is not correct.
            return (true, "W1");
        } else if (l2Block.header.withdrawalIndex > MAX_WITHDRAWAL) {
            // code W2: The updated number of total Withdrawals is exceeding the maximum value.
            return (true, "W2");
        }
    }

    /**
     * @dev Challenge when the submitted block's updated withdrawal tree root is invalid.
     * @param // blockData Serialized block data
     * @param // parentHeader  Serialized parent header data
     * @param initialSiblings Submit the siblings of the starting index leaf
     */
    function validateWithdrawalRoot(
        bytes calldata, // blockData
        bytes calldata, // parentHeader
        uint256[] calldata initialSiblings
    )
    external
    view
    override
    returns (bool slash, string memory reason)
    {
        Block memory l2Block = Deserializer.blockFromCalldataAt(0);
        Header memory parentHeader = Deserializer.headerFromCalldataAt(1);
        require(l2Block.header.parentBlock == parentHeader.hash(), "Invalid prev header");
        uint256[] memory withdrawals = _getWithdrawals(
            l2Block.header.withdrawalIndex - parentHeader.withdrawalIndex,
            l2Block.body.txs
        );
        // Check validity of the roll up using the storage based Poseidon sub-tree roll up
        uint256 computedRoot = SubTreeLib.appendSubTree(
            Hash.keccak(),
            parentHeader.withdrawalRoot,
            parentHeader.withdrawalIndex,
            WITHDRAWAL_SUB_TREE_DEPTH,
            withdrawals,
            initialSiblings
        );
        // Computed new utxo root is different with the submitted
        // code W3: The updated withdrawal tree root is not correct.
        return (computedRoot != l2Block.header.withdrawalRoot, "W3");
    }

    /** Computes challenge here */
    function _getWithdrawals(
        uint256 numOfWithdrawals,
        Transaction[] memory txs
    ) private pure returns (uint256[] memory withdrawals) {
        withdrawals = new uint256[](numOfWithdrawals);
        uint256 index = 0;
        // Append UTXOs from transactions
        for (uint256 i = 0; i < txs.length; i++) {
            Transaction memory transaction = txs[i];
            for(uint256 j = 0; j < transaction.outflow.length; j++) {
                if(txs[i].outflow[j].outflowType == uint8(OutflowType.Withdrawal)) {
                    withdrawals[index++] = transaction.outflow[j].note;
                }
            }
        }
        require(numOfWithdrawals == index, "Run index challenge");
    }
}

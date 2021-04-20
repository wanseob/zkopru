// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity =0.7.4;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import { IERC721 } from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import { SafeMath } from "@openzeppelin/contracts/math/SafeMath.sol";
import { MerkleTreeLib } from "../libraries/MerkleTree.sol";
import { Storage } from "../storage/Storage.sol";
import { Hash, Poseidon3, Poseidon4 } from "../libraries/Hash.sol";
import { WithdrawalTree, Blockchain, Types } from "../libraries/Types.sol";

contract UserInteractable is Storage {
    uint256 public constant SNARK_FIELD =
        21888242871839275222246405745257275088548364400416034343698204186575808495617;
    uint256 public constant RANGE_LIMIT = SNARK_FIELD >> 32;
    using MerkleTreeLib for *;
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    event Deposit(uint256 indexed queuedAt, uint256 note, uint256 fee);

    /**
     * @notice Users can use zkopru network by submitting a new homomorphically hiden note.
     * @param spendingPubKey P = poseidon(p*G, N) https://github.com/zkopru-network/zkopru/issues/34#issuecomment-666988505
     * @param salt 254bit salt for the privacy
     * @param eth Amount of Ether to deposit
     * @param token Token address of ERC20 or ERC721. It can be undefined.
     * @param amount Amount of ERC20 when the token param is defined and it is an ERC20
     * @param nft NFT id when the token param is defined and it is an ERC721
     * @param fee Amount of fee to give to the coordinator
     */
    function deposit(
        uint256 spendingPubKey,
        uint256 salt,
        uint256 eth,
        address token,
        uint256 amount,
        uint256 nft,
        uint256 fee
    ) public payable {
        _deposit(spendingPubKey, salt, eth, token, amount, nft, fee);
    }

    /**
     * @notice Users can withdraw notes when only after they're finazlied.
     * @param note Note hash in layer 2. It is a poseidon hash
     * @param owner The original owner's address of the note
     * @param eth Amount of Ether to withdraw out
     * @param token Token address of ERC20 or ERC721. It can be undefined.
     * @param amount Amount of ERC20 when the token param is defined and it is an ERC20
     * @param nft NFT id when the token param is defined and it is an ERC721
     * @param callerFee Amount of fee to give to the caller. This can be used when the withdrawer account has no ETH.
     * @param blockHash Finalized block hash to find the finalized withdrawal root
     * @param leafIndex The index of your withdrawal note's leaf in the given tree.
     * @param siblings Inclusion proof data
     */
    function withdraw(
        uint256 note,
        address owner,
        uint256 eth,
        address token,
        uint256 amount,
        uint256 nft,
        uint256 callerFee,
        bytes32 blockHash,
        uint256 leafIndex,
        uint256[] memory siblings
    ) public {
        return
            _withdraw(
                note,
                owner,
                eth,
                token,
                amount,
                nft,
                callerFee,
                blockHash,
                leafIndex,
                siblings
            );
    }

    /**
     * @notice Someone can pay in advance for unfinalized withdrawals
     * @param note Poseidon note hash of the withdrawal
     * @param owner Address of the note
     * @param eth Amount of Ether to withdraw out
     * @param token Token address of ERC20 or ERC721. It can be undefined.
     * @param amount Amount of ERC20 when the token param is defined and it is an ERC20
     * @param nft NFT id when the token param is defined and it is an ERC721
     * @param callerFee Amount of fee to give to the caller. This can be used when the withdrawer account has no ETH.
     * @param signature ECDSA signature
     */
    function payInAdvance(
        uint256 note,
        address owner,
        uint256 eth,
        address token,
        uint256 amount,
        uint256 nft,
        uint256 callerFee,
        uint256 prepayFeeInEth,
        uint256 prepayFeeInToken,
        bytes memory signature
    ) public payable {
        bytes32 withdrawalHash =
            _withdrawalHash(note, owner, eth, token, amount, nft, callerFee);
        require(!Storage.chain.withdrawn[withdrawalHash], "Already withdrawn");

        address newOwner = Storage.chain.newWithdrawalOwner[withdrawalHash];
        address currentOwner = newOwner == address(0) ? owner : newOwner;
        address prepayer = msg.sender;
        bytes32 payInAdvanceMsg =
            keccak256(
                abi.encodePacked(
                    prepayer,
                    withdrawalHash,
                    prepayFeeInEth,
                    prepayFeeInToken
                )
            );
        // verify original owner's signature
        require(
            _verifySignature(currentOwner, payInAdvanceMsg, signature),
            "Invalid owner signature"
        );
        // transfer ownership
        Storage.chain.newWithdrawalOwner[withdrawalHash] = prepayer;
        // transfer assets
        uint256 ethToWithdraw = eth.sub(prepayFeeInEth);
        uint256 tokenToWithdraw = amount.sub(prepayFeeInToken);
        require(msg.value == eth, "not enough ether");
        // prepay tokens
        if (Storage.chain.registeredERC20s[token]) {
            IERC20(token).transferFrom(prepayer, currentOwner, tokenToWithdraw);
        } else if (Storage.chain.registeredERC721s[token]) {
            revert("Does not support NFT prepay");
        }
        // prepay ether
        _sendEth(currentOwner, ethToWithdraw);
    }

    function _deposit(
        uint256 spendingPubKey,
        uint256 salt,
        uint256 eth,
        address token,
        uint256 amount,
        uint256 nft,
        uint256 fee
    ) internal {
        // range check
        require(
            amount < RANGE_LIMIT,
            "Too big value can cause the overflow inside the SNARK"
        );
        require(
            eth < RANGE_LIMIT,
            "Too big value can cause the overflow inside the SNARK"
        );
        require(
            fee < RANGE_LIMIT,
            "Too big value can cause the overflow inside the SNARK"
        );
        require(nft < SNARK_FIELD, "Does not support too big nubmer of nft id");
        // check eth value
        require(eth.add(fee) == msg.value, "Inexact amount of eth");
        require(
            Storage.chain.stagedSize < 1024,
            "Should wait until it is committed"
        );
        // check note fields
        require(_checkNoteFields(eth, token, amount, nft));

        //TODO: require(fee >= specified fee);
        // Validate the note is same with the hash result
        uint256[4] memory assetHashInputs = [eth, uint256(token), amount, nft];
        uint256 assetHash = Poseidon4.poseidon(assetHashInputs);
        uint256[3] memory resultHashInputs = [spendingPubKey, salt, assetHash];
        uint256 note = Poseidon3.poseidon(resultHashInputs);
        // Receive token
        if (token != address(0)) {
            if (chain.registeredERC20s[token]) {
                require(nft == 0, "ERC20 note cannot have NFT");
                IERC20(token).safeTransferFrom(
                    msg.sender,
                    address(this),
                    amount
                );
            } else if (chain.registeredERC721s[token]) {
                require(amount == 0, "NFT note cannot have amount");
                IERC721(token).transferFrom(msg.sender, address(this), nft);
            } else {
                revert("Not a registered token.");
            }
        }
        // Update the mass deposit
        Storage.chain.stagedDeposits.merged = keccak256(
            abi.encodePacked(Storage.chain.stagedDeposits.merged, note)
        );
        Storage.chain.stagedDeposits.fee = Storage.chain.stagedDeposits.fee.add(
            fee
        );
        Storage.chain.stagedSize = Storage.chain.stagedSize.add(1);
        // Emit event. Coordinator should subscribe this event.
        emit Deposit(Storage.chain.massDepositId, note, fee);
    }

    function _withdraw(
        uint256 note,
        address owner,
        uint256 eth,
        address token,
        uint256 amount,
        uint256 nft,
        uint256 callerFee,
        bytes32 blockHash,
        uint256 leafIndex,
        uint256[] memory siblings
    ) internal {
        // range check
        require(
            amount < RANGE_LIMIT,
            "Too big value can cause the overflow inside the SNARK"
        );
        require(
            eth < RANGE_LIMIT,
            "Too big value can cause the overflow inside the SNARK"
        );
        require(
            callerFee < RANGE_LIMIT,
            "Too big value can cause the overflow inside the SNARK"
        );
        require(nft < SNARK_FIELD, "Does not support too big nubmer of nft id");
        // check note fields
        require(_checkNoteFields(eth, token, amount, nft));
        // check the reference block is finalized
        require(Storage.chain.finalized[blockHash], "Not a finalized block");
        uint256 root = Storage.chain.withdrawalRootOf[blockHash];
        bytes32 withdrawalHash =
            _withdrawalHash(note, owner, eth, token, amount, nft, callerFee);
        // Should not allow double-withdrawing
        require(!Storage.chain.withdrawn[withdrawalHash], "Already withdrawn");
        // Mark as withdrawn
        Storage.chain.withdrawn[withdrawalHash] = true;
        // Check whether new owner exists
        address to =
            Storage.chain.newWithdrawalOwner[withdrawalHash] != address(0)
                ? Storage.chain.newWithdrawalOwner[withdrawalHash]
                : owner;

        // inclusion proof
        bool inclusion =
            Hash.keccak().merkleProof(
                root,
                uint256(withdrawalHash),
                leafIndex,
                siblings
            );
        require(inclusion, "The given withdrawal note does not exist");
        // Withdraw ETH & get fee
        if (to == msg.sender) {
            _sendEth(to, eth.add(callerFee));
        } else {
            _sendEth(to, eth);
            _sendEth(msg.sender, callerFee);
        }
        // Withdraw tokens if exists
        if (Storage.chain.registeredERC20s[token]) {
            IERC20(token).transfer(to, amount);
        } else if (Storage.chain.registeredERC721s[token]) {
            require(
                nft != 0,
                "Circuit cannot accept NFT id 0. Please deposit other NFT."
            );
            IERC721(token).transferFrom(address(this), to, nft);
        }
    }

    function _withdrawalHash(
        uint256 note,
        address owner,
        uint256 eth,
        address token,
        uint256 amount,
        uint256 nft,
        uint256 callerFee
    ) internal pure returns (bytes32) {
        return
            keccak256(
                abi.encodePacked(
                    note,
                    owner,
                    eth,
                    token,
                    amount,
                    nft,
                    callerFee
                )
            );
    }

    function _verifySignature(
        address signer,
        bytes32 message,
        bytes memory sig
    ) internal pure returns (bool) {
        require(sig.length == 65);
        bytes32 r;
        bytes32 s;
        uint8 v;
        assembly {
            // first 32 bytes, after the length prefix.
            r := mload(add(sig, 32))
            // second 32 bytes.
            s := mload(add(sig, 64))
            // final byte (first byte of the next 32 bytes).
            v := byte(0, mload(add(sig, 96)))
        }
        bytes32 prefixedHash =
            keccak256(
                abi.encodePacked("\x19Ethereum Signed Message:\n32", message)
            );
        return signer == ecrecover(prefixedHash, v, r, s);
    }

    function _checkNoteFields(
        uint256 eth,
        address token,
        uint256 amount,
        uint256 nft
    ) internal view returns (bool) {
        if (token == address(0)) {
            require(
                nft == 0 && amount == 0,
                "Ether note does not have amount field & nft field"
            );
            require(eth != 0, "Should have ETH field");
        } else {
            // this note contains token value
            bool isERC20 = Storage.chain.registeredERC20s[token];
            bool isERC721 = Storage.chain.registeredERC721s[token];
            require(
                isERC20 || isERC721,
                "Not a registered token. Reigster that token first"
            );
            if (isERC20) {
                require(nft == 0, "ERC20 does have NFT field");
            } else if (isERC721) {
                require(
                    nft != 0,
                    "Circuit cannot accept NFT id 0. Please deposit other NFT."
                );
                require(amount == 0, "ERC721 does have amount field");
            }
        }
        return true;
    }

    function _sendEth(address to, uint256 val) internal {
        if (val > 0) {
            (bool success, ) = to.call{ value: val }("");
            require(success, "Failed to send ETH");
        }
    }
}

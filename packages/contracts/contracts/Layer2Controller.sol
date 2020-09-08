pragma solidity >= 0.6.0;

import { Layer2 } from "./storage/Layer2.sol";
import { SNARKsVerifier } from "./libraries/SNARKs.sol";
import { Pairing } from "./libraries/Pairing.sol";
import { ICoordinatable } from "./interfaces/ICoordinatable.sol";
import { IUserInteractable } from "./interfaces/IUserInteractable.sol";
import { IMigratable } from "./interfaces/IMigratable.sol";
import { IDepositChallenge } from "./interfaces/IDepositChallenge.sol";
import { IHeaderChallenge } from "./interfaces/IHeaderChallenge.sol";
import { IMigrationChallenge } from "./interfaces/IMigrationChallenge.sol";
import { IUtxoTreeChallenge } from "./interfaces/IUtxoTreeChallenge.sol";
import { IWithdrawalTreeChallenge } from "./interfaces/IWithdrawalTreeChallenge.sol";
import { INullifierTreeChallenge } from "./interfaces/INullifierTreeChallenge.sol";
import { ITxChallenge } from "./interfaces/ITxChallenge.sol";

/* solium-disable */

contract Layer2Controller is Layer2 {
    /** Addresses where to execute the given function call */
    mapping(bytes4=>address) public proxied;

    /**
     * @notice This proxies supports the following interfaces
     *          - ICoordinatable.sol
     *          - IUserInteractable.sol
     *          - IMigratable.sol
     *          - Challenges
     *              - IDepositChallenge.sol
     *              - IHeaderChallenge.sol
     *              - IMigrationChallenge.sol
     *              - IUtxoTreeChallenge.sol
     *              - IWithdrawalTreeChallenge.sol
     *              - INullifierTreeChallenge.sol
     *              - ITxChallenge.sol
     */
    fallback () external payable {
        address addr = proxied[msg.sig];
        require(addr != address(0), "There is no proxy contract");
        (bool success, bytes memory result) = addr.delegatecall(msg.data);
        require(success, string(result));
    }

    /**
     * @dev See Coordinatable.sol's register() function
    */
    receive() external payable {
        bytes4 sig = ICoordinatable(0).register.selector;
        address addr = proxied[sig];
        (bool success, bytes memory result) = addr.delegatecall(msg.data);
        require(success, string(result));
    }

    function _connectCoordinatable(address addr) internal {
        _connect(addr, ICoordinatable(0).register.selector);
        _connect(addr, ICoordinatable(0).deregister.selector);
        _connect(addr, ICoordinatable(0).propose.selector);
        _connect(addr, ICoordinatable(0).finalize.selector);
        _connect(addr, ICoordinatable(0).commitMassDeposit.selector);
        _connect(addr, ICoordinatable(0).withdrawReward.selector);
        _connect(addr, ICoordinatable(0).isProposable.selector);
        _connect(addr, ICoordinatable(0).registerERC20.selector);
        _connect(addr, ICoordinatable(0).registerERC721.selector);
    }

    function _connectUserInteractable(address addr) internal {
        _connect(addr, IUserInteractable(0).deposit.selector);
        _connect(addr, IUserInteractable(0).withdraw.selector);
        _connect(addr, IUserInteractable(0).payInAdvance.selector);
    }

    function _connectMigratable(address addr) internal virtual {
        _connect(addr, IMigratable(0).migrateTo.selector);
    }

    function _connectChallengeable(
        address depositChallenge,
        address headerChallenge,
        address migrationChallenge,
        address utxoTreeChallenge,
        address withdrawalTreeChallenge,
        address nullifierTreeChallenge,
        address txChallenge
    ) internal virtual {
        _connect(depositChallenge, IDepositChallenge(0).challengeMassDeposit.selector);
        _connect(headerChallenge, IHeaderChallenge(0).challengeDepositRoot.selector);
        _connect(headerChallenge, IHeaderChallenge(0).challengeTxRoot.selector);
        _connect(headerChallenge, IHeaderChallenge(0).challengeMigrationRoot.selector);
        _connect(headerChallenge, IHeaderChallenge(0).challengeTotalFee.selector);
        _connect(migrationChallenge, IMigrationChallenge(0).challengeMassMigrationToMassDeposit.selector);
        _connect(migrationChallenge, IMigrationChallenge(0).challengeERC20Migration.selector);
        _connect(migrationChallenge, IMigrationChallenge(0).challengeERC721Migration.selector);
        _connect(utxoTreeChallenge, IUtxoTreeChallenge(0).challengeUTXOIndex.selector);
        _connect(utxoTreeChallenge, IUtxoTreeChallenge(0).challengeUTXORoot.selector);
        _connect(withdrawalTreeChallenge, IWithdrawalTreeChallenge(0).challengeWithdrawalIndex.selector);
        _connect(withdrawalTreeChallenge, IWithdrawalTreeChallenge(0).challengeWithdrawalRoot.selector);
        _connect(nullifierTreeChallenge, INullifierTreeChallenge(0).challengeNullifierRollUp.selector);
        _connect(txChallenge, ITxChallenge(0).challengeInclusion.selector);
        _connect(txChallenge, ITxChallenge(0).challengeTransaction.selector);
        _connect(txChallenge, ITxChallenge(0).challengeUsedNullifier.selector);
        _connect(txChallenge, ITxChallenge(0).challengeDuplicatedNullifier.selector);
        _connect(txChallenge, ITxChallenge(0).isValidRef.selector);
    }

    function _connect(address to, bytes4 sig) internal {
        proxied[sig] = to;
    }
}

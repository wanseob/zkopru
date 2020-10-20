import Web3 from 'web3'
import { ContractOptions } from 'web3-eth-contract'
import { ICoordinatable } from './contracts/ICoordinatable'
import { IDepositValidator } from './contracts/IDepositValidator'
import { IHeaderValidator } from './contracts/IHeaderValidator'
import { IMigratable } from './contracts/IMigratable'
import { IMigrationValidator } from './contracts/IMigrationValidator'
import { INullifierTreeValidator } from './contracts/INullifierTreeValidator'
import { ISetupWizard } from './contracts/ISetupWizard'
import { ITxSNARKValidator } from './contracts/ITxSNARKValidator'
import { ITxValidator } from './contracts/ITxValidator'
import { IUserInteractable } from './contracts/IUserInteractable'
import { IUtxoTreeValidator } from './contracts/IUtxoTreeValidator'
import { IWithdrawalTreeValidator } from './contracts/IWithdrawalTreeValidator'
import { Zkopru } from './contracts/Zkopru'

import { Layer1 } from './layer1'

export class ZkOPRUContract {
  upstream: Zkopru

  coordinator: ICoordinatable

  user: IUserInteractable

  migrator: IMigratable

  challenger: {
    deposit: IDepositValidator
    migration: IMigrationValidator
    header: IHeaderValidator
    tx: ITxValidator
    snark: ITxSNARKValidator
    utxoTree: IUtxoTreeValidator
    withdrawalTree: IWithdrawalTreeValidator
    nullifierTree: INullifierTreeValidator
  }

  setup: ISetupWizard

  constructor(web3: Web3, address: string, option?: ContractOptions) {
    this.upstream = Layer1.getZkopru(web3, address, option)
    this.coordinator = Layer1.getICoordinatable(web3, address, option)
    this.user = Layer1.getIUserInteractable(web3, address, option)
    this.migrator = Layer1.getIMigratable(web3, address, option)
    this.challenger = {
      deposit: Layer1.getIDepositValidator(web3, address, option),
      migration: Layer1.getIMigrationValidator(web3, address, option),
      header: Layer1.getIHeaderValidator(web3, address, option),
      tx: Layer1.getITxValidator(web3, address, option),
      snark: Layer1.getITxSNARKValidator(web3, address, option),
      utxoTree: Layer1.getIUtxoTreeValidator(web3, address, option),
      withdrawalTree: Layer1.getIWithdrawalTreeValidator(web3, address, option),
      nullifierTree: Layer1.getINullifierTreeValidator(web3, address, option),
    }
    this.setup = Layer1.getISetupWizard(web3, address, option)
  }
}

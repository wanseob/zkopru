/* eslint-disable camelcase */
const fs = require('fs')
const path = require('path')
const save = require('../utils/save-deployed')

const TestERC20 = artifacts.require('TestERC20')
const TestERC721 = artifacts.require('TestERC721')
const UserInteractable = artifacts.require('UserInteractable')
const Coordinatable = artifacts.require('Coordinatable')
const Challengeable = artifacts.require('Challengeable')
const DepositValidator = artifacts.require('DepositValidator')
const HeaderValidator = artifacts.require('HeaderValidator')
const UtxoTreeValidator = artifacts.require('UtxoTreeValidator')
const WithdrawalTreeValidator = artifacts.require('WithdrawalTreeValidator')
const NullifierTreeValidator = artifacts.require('NullifierTreeValidator')
const TxValidator = artifacts.require('TxValidator')
const TxSNARKValidator = artifacts.require('TxSNARKValidator')
const MigrationValidator = artifacts.require('MigrationValidator')
const Migratable = artifacts.require('Migratable')
const Zkopru = artifacts.require('Zkopru')

const instances = {}

module.exports = function migration(deployer, network, accounts) {
  deployer
    .then(() => {
      return TestERC20.deployed()
    })
    .then(erc20 => {
      instances.erc20 = erc20
      return TestERC721.deployed()
    })
    .then(erc721 => {
      instances.erc721 = erc721
      return UserInteractable.deployed()
    })
    .then(ui => {
      instances.ui = ui
      return Coordinatable.deployed()
    })
    .then(coordinatable => {
      instances.coordinatable = coordinatable
      return UtxoTreeValidator.deployed()
    })
    .then(utxoTreeValidator => {
      instances.utxoTreeValidator = utxoTreeValidator
      return WithdrawalTreeValidator.deployed()
    })
    .then(withdrawalTreeValidator => {
      instances.withdrawalTreeValidator = withdrawalTreeValidator
      return NullifierTreeValidator.deployed()
    })
    .then(nullifierTreeValidator => {
      instances.nullifierTreeValidator = nullifierTreeValidator
      return HeaderValidator.deployed()
    })
    .then(headerValidator => {
      instances.headerValidator = headerValidator
      return TxValidator.deployed()
    })
    .then(txValidator => {
      instances.txValidator = txValidator
      return TxSNARKValidator.deployed()
    })
    .then(txSNARKValidator => {
      instances.txSNARKValidator = txSNARKValidator
      return DepositValidator.deployed()
    })
    .then(depositValidator => {
      instances.depositValidator = depositValidator
      return MigrationValidator.deployed()
    })
    .then(migrationValidator => {
      instances.migrationValidator = migrationValidator
      return Challengeable.deployed()
    })
    .then(challengeable => {
      instances.challengeable = challengeable
      return Migratable.deployed()
    })
    .then(migratable => {
      instances.migratable = migratable
      return Zkopru.deployed()
    })
    .then(async zkopru => {
      console.log(`Deployed ZKOPRU at:\n${zkopru.address}`)
      // Save deployed addresses
      save({
        name: 'TestERC20',
        address: instances.erc20.address,
        network: deployer.network_id,
      })
      save({
        name: 'TestERC721',
        address: instances.erc721.address,
        network: deployer.network_id,
      })
      save({
        name: 'Zkopru',
        address: zkopru.address,
        network: deployer.network_id,
      })
      // Setup proxy
      await zkopru.makeCoordinatable(instances.coordinatable.address)
      await zkopru.makeUserInteractable(instances.ui.address)
      await zkopru.makeChallengeable(
        instances.challengeable.address,
        instances.depositValidator.address,
        instances.headerValidator.address,
        instances.migrationValidator.address,
        instances.utxoTreeValidator.address,
        instances.withdrawalTreeValidator.address,
        instances.nullifierTreeValidator.address,
        instances.txValidator.address,
        instances.txSNARKValidator.address,
      )
      await zkopru.makeMigratable(instances.migratable.address)
      if (network === 'integrationtest') {
        // integration test will run the below steps manually.
        return
      }
      // Setup zkSNARKs
      // Setup migrations
      const keyDir = path.join(__dirname, '../keys/vks')
      const vkToInput = (nIn, nOut, vk) => {
        return [
          nIn,
          nOut,
          {
            alpha1: vk.vk_alpha_1.slice(0, 2),
            beta2: vk.vk_beta_2.slice(0, 2),
            gamma2: vk.vk_gamma_2.slice(0, 2),
            delta2: vk.vk_delta_2.slice(0, 2),
            ic: vk.IC.map(arr => arr.slice(0, 2)),
          },
        ]
      }
      // console.log(path.resolve(keyDir))
      for (let nIn = 1; nIn <= 4; nIn += 1) {
        for (let nOut = 1; nOut <= 4; nOut += 1) {
          const vk = JSON.parse(
            fs.readFileSync(
              path.join(keyDir, `/zk_transaction_${nIn}_${nOut}.vk.json`),
            ),
          )
          await zkopru.registerVk(...vkToInput(nIn, nOut, vk))
        }
      }
      // await wizard.allowMigrants(...)

      const coordinatable = await Coordinatable.at(zkopru.address)
      // register erc20
      await coordinatable.registerERC20(instances.erc20.address)
      // register erc721
      await coordinatable.registerERC721(instances.erc721.address)
      // Complete setup
      await zkopru.completeSetup()
      if (network === 'testnet') {
        // Register as coordinator
        await coordinatable.register({ value: '32000000000000000000' })
      }
    })
}

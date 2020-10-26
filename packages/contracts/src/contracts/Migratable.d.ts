/* Generated by ts-generator ver. 0.0.8 */
/* tslint:disable */

import BN from 'bn.js'
import { Contract, ContractOptions } from 'web3-eth-contract'
import { EventLog } from 'web3-core'
import { EventEmitter } from 'events'
import { ContractEvent, Callback, TransactionObject, BlockType } from './types'

interface EventOptions {
  filter?: object
  fromBlock?: BlockType
  topics?: string[]
}

export class Migratable extends Contract {
  constructor(jsonInterface: any[], address?: string, options?: ContractOptions)

  clone(): Migratable

  methods: {
    CHALLENGE_PERIOD(): TransactionObject<string>

    MAX_BLOCK_SIZE(): TransactionObject<string>

    MAX_UTXO(): TransactionObject<string>

    MAX_VALIDATION_GAS(): TransactionObject<string>

    MAX_WITHDRAWAL(): TransactionObject<string>

    MINIMUM_STAKE(): TransactionObject<string>

    NULLIFIER_TREE_DEPTH(): TransactionObject<string>

    REF_DEPTH(): TransactionObject<string>

    UTXO_SUB_TREE_DEPTH(): TransactionObject<string>

    UTXO_SUB_TREE_SIZE(): TransactionObject<string>

    UTXO_TREE_DEPTH(): TransactionObject<string>

    WITHDRAWAL_SUB_TREE_DEPTH(): TransactionObject<string>

    WITHDRAWAL_SUB_TREE_SIZE(): TransactionObject<string>

    WITHDRAWAL_TREE_DEPTH(): TransactionObject<string>

    allowedMigrants(arg0: string): TransactionObject<boolean>

    committedDeposits(
      massDepositHash: string | number[],
    ): TransactionObject<string>

    consensusProvider(): TransactionObject<string>

    finalizedUTXORoots(utxoRoot: string | number[]): TransactionObject<boolean>

    genesis(): TransactionObject<string>

    getVk(
      numOfInputs: number | string,
      numOfOutputs: number | string,
    ): TransactionObject<{
      alpha1: string[]
      beta2: string[][]
      gamma2: string[][]
      delta2: string[][]
      ic: string[][]
      0: string[]
      1: string[][]
      2: string[][]
      3: string[][]
      4: string[][]
    }>

    latest(): TransactionObject<string>

    massDepositId(): TransactionObject<string>

    migrations(migrationHash: string | number[]): TransactionObject<boolean>

    owner(): TransactionObject<string>

    parentOf(header: string | number[]): TransactionObject<string>

    proposals(
      proposalId: string | number[],
    ): TransactionObject<{
      header: string
      challengeDue: string
      slashed: boolean
      0: string
      1: string
      2: boolean
    }>

    proposedBlocks(): TransactionObject<string>

    proposers(
      addr: string,
    ): TransactionObject<{
      stake: string
      reward: string
      exitAllowance: string
      0: string
      1: string
      2: string
    }>

    proxied(arg0: string | number[]): TransactionObject<string>

    registeredERC20s(tokenAddr: string): TransactionObject<boolean>

    registeredERC721s(tokenAddr: string): TransactionObject<boolean>

    renounceOwnership(): TransactionObject<void>

    stagedDeposits(): TransactionObject<{
      merged: string
      fee: string
      0: string
      1: string
    }>

    stagedSize(): TransactionObject<string>

    transferOwnership(newOwner: string): TransactionObject<void>

    utxoRootOf(header: string | number[]): TransactionObject<string>

    validators(arg0: string | number[]): TransactionObject<string>

    withdrawalRootOf(header: string | number[]): TransactionObject<string>

    withdrawn(leaf: string | number[]): TransactionObject<boolean>

    migrateTo(
      proposalChecksum: string | number[],
      arg1: string | number[],
    ): TransactionObject<void>

    acceptMigration(
      checksum: string | number[],
      merged: string | number[],
      fee: number | string,
    ): TransactionObject<void>
  }

  events: {
    NewMassMigration: ContractEvent<{
      checksum: string
      network: string
      merged: string
      fee: string
      0: string
      1: string
      2: string
      3: string
    }>
    OwnershipTransferred: ContractEvent<{
      previousOwner: string
      newOwner: string
      0: string
      1: string
    }>
    allEvents: (options?: EventOptions, cb?: Callback<EventLog>) => EventEmitter
  }
}

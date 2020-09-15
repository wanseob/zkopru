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

export class UserInteractable extends Contract {
  constructor(jsonInterface: any[], address?: string, options?: ContractOptions)
  clone(): UserInteractable
  methods: {
    CHALLENGE_PERIOD(): TransactionObject<string>

    MAX_UTXO(): TransactionObject<string>

    MAX_WITHDRAWAL(): TransactionObject<string>

    MINIMUM_STAKE(): TransactionObject<string>

    NULLIFIER_TREE_DEPTH(): TransactionObject<string>

    RANGE_LIMIT(): TransactionObject<string>

    REF_DEPTH(): TransactionObject<string>

    SNARK_FIELD(): TransactionObject<string>

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

    finalizedUTXORoots(utxoRoot: string | number[]): TransactionObject<boolean>

    genesis(): TransactionObject<string>

    getVk(
      numOfInputs: number | string,
      numOfOutputs: number | string,
    ): TransactionObject<{
      alfa1: string[]
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

    registeredERC20s(tokenAddr: string): TransactionObject<boolean>

    registeredERC721s(tokenAddr: string): TransactionObject<boolean>

    stagedDeposits(): TransactionObject<{
      merged: string
      fee: string
      0: string
      1: string
    }>

    stagedSize(): TransactionObject<string>

    utxoRootOf(header: string | number[]): TransactionObject<string>

    withdrawalRootOf(header: string | number[]): TransactionObject<string>

    withdrawn(leaf: string | number[]): TransactionObject<boolean>

    deposit(
      spendingPubKey: number | string,
      salt: number | string,
      eth: number | string,
      token: string,
      amount: number | string,
      nft: number | string,
      fee: number | string,
    ): TransactionObject<void>

    withdraw(
      note: number | string,
      owner: string,
      eth: number | string,
      token: string,
      amount: number | string,
      nft: number | string,
      fee: number | string,
      blockHash: string | number[],
      leafIndex: number | string,
      siblings: (number | string)[],
    ): TransactionObject<void>

    payInAdvance(
      note: number | string,
      owner: string,
      eth: number | string,
      token: string,
      amount: number | string,
      nft: number | string,
      fee: number | string,
      signature: string | number[],
    ): TransactionObject<void>
  }
  events: {
    Deposit: ContractEvent<{
      queuedAt: string
      note: string
      fee: string
      0: string
      1: string
      2: string
    }>
    allEvents: (options?: EventOptions, cb?: Callback<EventLog>) => EventEmitter
  }
}

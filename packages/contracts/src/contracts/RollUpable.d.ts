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

export class RollUpable extends Contract {
  constructor(jsonInterface: any[], address?: string, options?: ContractOptions)
  clone(): RollUpable
  methods: {
    CHALLENGE_LIMIT(): TransactionObject<string>

    CHALLENGE_PERIOD(): TransactionObject<string>

    MINIMUM_STAKE(): TransactionObject<string>

    POOL_SIZE(): TransactionObject<string>

    REF_DEPTH(): TransactionObject<string>

    SUB_TREE_DEPTH(): TransactionObject<string>

    SUB_TREE_SIZE(): TransactionObject<string>

    newProofOfUTXORollUp(
      startingRoot: number | string,
      startingIndex: number | string,
      initialSiblings: (number | string)[],
    ): TransactionObject<void>

    newProofOfNullifierRollUp(
      prevRoot: string | number[],
    ): TransactionObject<void>

    newProofOfWithdrawalRollUp(
      startingRoot: number | string,
      startingIndex: number | string,
    ): TransactionObject<void>

    updateProofOfUTXORollUp(
      id: number | string,
      leaves: (number | string)[],
    ): TransactionObject<void>

    updateProofOfNullifierRollUp(
      id: number | string,
      leaves: (string | number[])[],
      siblings: (string | number[])[][],
    ): TransactionObject<void>

    updateProofOfWithdrawalRollUp(
      id: number | string,
      initialSiblings: (number | string)[],
      leaves: (number | string)[],
    ): TransactionObject<void>
  }
  events: {
    NewProofOfRollUp: ContractEvent<{
      rollUpType: string
      id: string
      0: string
      1: string
    }>
    allEvents: (options?: EventOptions, cb?: Callback<EventLog>) => EventEmitter
  }
}

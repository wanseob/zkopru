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

export class IUserInteractable extends Contract {
  constructor(jsonInterface: any[], address?: string, options?: ContractOptions)

  clone(): IUserInteractable

  methods: {
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
      callerFee: number | string,
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
      callerFee: number | string,
      prepayFeeInEth: number | string,
      prepayFeeInToken: number | string,
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

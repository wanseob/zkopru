/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import BN from 'bn.js'
import { ContractOptions } from 'web3-eth-contract'
import { EventLog } from 'web3-core'
import { EventEmitter } from 'events'
import {
  Callback,
  PayableTransactionObject,
  NonPayableTransactionObject,
  BlockType,
  ContractEventLog,
  BaseContract,
} from './types'

interface EventOptions {
  filter?: object
  fromBlock?: BlockType
  topics?: string[]
}

export type Update = ContractEventLog<{
  name: string
  value: string
  0: string
  1: string
}>

export interface IConfigurable extends BaseContract {
  constructor(
    jsonInterface: any[],
    address?: string,
    options?: ContractOptions,
  ): IConfigurable
  clone(): IConfigurable
  methods: {
    setMaxBlockSize(
      blockSize: number | string | BN,
    ): NonPayableTransactionObject<void>

    setMaxValidationGas(
      maxGas: number | string | BN,
    ): NonPayableTransactionObject<void>

    setChallengePeriod(
      period: number | string | BN,
    ): NonPayableTransactionObject<void>

    setMinimumStake(
      stake: number | string | BN,
    ): NonPayableTransactionObject<void>

    setReferenceDepth(
      depth: number | string | BN,
    ): NonPayableTransactionObject<void>

    setConsensusProvider(provider: string): NonPayableTransactionObject<void>
  }
  events: {
    Update(cb?: Callback<Update>): EventEmitter
    Update(options?: EventOptions, cb?: Callback<Update>): EventEmitter

    allEvents(options?: EventOptions, cb?: Callback<EventLog>): EventEmitter
  }

  once(event: 'Update', cb: Callback<Update>): void
  once(event: 'Update', options: EventOptions, cb: Callback<Update>): void
}

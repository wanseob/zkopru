/* Generated by ts-generator ver. 0.0.8 */
/* tslint:disable */

import BN from 'bn.js'
import { EventLog } from 'web3-core/types'
import { EventEmitter } from 'events'
// @ts-ignore
import PromiEvent from 'web3/promiEvent'

interface EstimateGasOptions {
  from?: string
  gas?: number
  value?: number | string | BN
}

interface EventOptions {
  filter?: object
  fromBlock?: BlockType
  topics?: string[]
}

export type Callback<T> = (error: Error, result: T) => void
export interface TransactionObject<T> {
  arguments: any[]
  call(options?: EstimateGasOptions): Promise<T>
  send(options?: EstimateGasOptions): PromiEvent<T>
  estimateGas(options?: EstimateGasOptions): Promise<number>
  encodeABI(): string
}
export interface ContractEventLog<T> extends EventLog {
  returnValues: T
}
export interface ContractEventEmitter<T> extends EventEmitter {
  on(event: 'connected', listener: (subscriptionId: string) => void): this
  on(
    event: 'data' | 'changed',
    listener: (event: ContractEventLog<T>) => void,
  ): this
  on(event: 'error', listener: (error: Error) => void): this
}
export type ContractEvent<T> = (
  options?: EventOptions,
  cb?: Callback<ContractEventLog<T>>,
) => ContractEventEmitter<T>

export interface Tx {
  nonce?: string | number
  chainId?: string | number
  from?: string
  to?: string
  data?: string
  value?: string | number
  gas?: string | number
  gasPrice?: string | number
}

export interface TransactionObject<T> {
  arguments: any[]
  call(tx?: Tx): Promise<T>
  send(tx?: Tx): PromiEvent<T>
  estimateGas(tx?: Tx): Promise<number>
  encodeABI(): string
}

export type BlockType = 'latest' | 'pending' | 'genesis' | number

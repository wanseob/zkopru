/* eslint-disable no-underscore-dangle */
import Web3 from 'web3'
import { SomeDBConnector, DB, schema } from '@zkopru/database'
import { FullNode } from '@zkopru/core'
import { NodeConfig } from './types'

const DEFAULT = {
  address:
    process.env.ZKOPRU_ADDRESS || '0xdadF77fdc462900B98458eA310a18d60946161a6',
  bootstrap: true,
  websocket:
    process.env.ZKOPRU_WEBSOCKET ||
    'wss://goerli.infura.io/ws/v3/5b122dbc87ed4260bf9a2031e8a0e2aa',
}

export default class ZkopruNode {
  config: NodeConfig

  _db?: DB

  node?: FullNode

  private connectorType: SomeDBConnector

  constructor(_config: NodeConfig, connectorType: SomeDBConnector) {
    this.config = {
      ...DEFAULT,
      ...(_config || {}),
    }
    this.connectorType = connectorType
    if (!this.config.websocket) {
      throw new Error('No websocket provided')
    }
  }

  get isRunning() {
    return this.node?.isRunning()
  }

  // Accept database configuration here
  async start(...args: any[]) {
    if (!this._db) {
      this._db = await this.connectorType.create(schema, ...args)
    }
    if (!this.node) {
      const provider = new Web3.providers.WebsocketProvider(
        this.config.websocket as string,
        {
          reconnect: {
            delay: 2000,
            auto: true,
          },
          clientConfig: {
            keepalive: true,
            keepaliveInterval: 30000,
          },
        },
      )
      // eslint-disable-next-line no-inner-declarations
      async function waitConnection(_provider: any) {
        return new Promise<void>(res => {
          if (_provider.connected) return res()
          _provider.on('connect', res)
        })
      }
      provider.connect()
      await waitConnection(provider)
      await new Promise(r => setTimeout(r, 1000))
      this.node = await FullNode.new({
        address: this.config.address as string,
        provider,
        db: this._db,
      })
    }
    this.node.start()
  }
}
/**
 * @jest-environment node
 */
/* eslint-disable jest/no-hooks */
import Web3 from 'web3'
import { WebsocketProvider } from 'web3-core'
import { Container } from 'node-docker-api/lib/container'
import { FullNode } from '@zkopru/core'
import { Coordinator } from '~coordinator'
import { ZkAccount } from '~account'
import { readFromContainer, sleep, pullOrBuildAndGetContainer } from '~utils'
import { MockupDB, DB } from '~prisma'

describe('coordinator test to run testnet', () => {
  const accounts: ZkAccount[] = [
    new ZkAccount(Buffer.from('sample private key')),
  ]
  let address
  let container: Container
  let fullNode: FullNode
  let wsProvider: WebsocketProvider
  let mockup: MockupDB
  let coordinator: Coordinator
  beforeAll(async () => {
    mockup = await DB.mockup()
    // It may take about few minutes. If you want to skip building image,
    // run `yarn pull:images` on the root directory
    container = await pullOrBuildAndGetContainer({
      compose: [__dirname, '../../../../dockerfiles'],
      service: 'contracts',
    })
    await container.start()
    const file = await readFromContainer(
      container,
      '/proj/build/deployed/Zkopru.json',
    )
    const deployed = JSON.parse(file.toString())
    address = deployed.address
    const status = await container.status()
    const containerIP = (status.data as {
      NetworkSettings: { IPAddress: string }
    }).NetworkSettings.IPAddress
    await sleep(3000)
    wsProvider = new Web3.providers.WebsocketProvider(
      `ws://${containerIP}:5000`,
      { reconnect: { auto: true } },
    )
    async function waitConnection() {
      return new Promise<void>(res => {
        if (wsProvider.connected) res()
        wsProvider.on('connect', res)
      })
    }
    await waitConnection()
    fullNode = await FullNode.new({
      provider: wsProvider,
      address,
      db: mockup.db,
      accounts,
    })
  }, 36000)
  afterAll(async () => {
    wsProvider.disconnect(0, 'close connection')
    await coordinator.stop()
    await mockup.terminate()
    await container.stop()
    await container.delete()
  }, 10000)
  describe('coordinator', () => {
    it('should be defined', async () => {
      coordinator = new Coordinator(fullNode, accounts[0].ethAccount, {
        maxBytes: 131072,
        bootstrap: true,
        priceMultiplier: 48, // 32 gas is the current default price for 1 byte
        port: 9999,
      })
      expect(coordinator).toBeDefined()
    })
  })
})

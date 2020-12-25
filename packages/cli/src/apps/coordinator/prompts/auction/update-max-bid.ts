import chalk from 'chalk'
import App, { AppMenu, Context } from '..'
import { parseStringToUnit } from '@zkopru/utils'
import { toWei, fromWei } from 'web3-utils'
import BN from 'bn.js'

export default class UpdateMaxBid extends App {
  static code = AppMenu.UPDATE_MAX_BID

  async run(context: Context): Promise<{ context: Context; next: number }> {
    const { maxBid } = this.base.context.auctionMonitor
    const parsedGwei = fromWei(maxBid, 'gwei')
    this.print(chalk.blue(`Current max bid: ${parsedGwei.toString()} gwei`))
    const { amount } = await this.ask({
      type: 'text',
      name: 'amount',
      initial: 0,
      message: 'New max bid price (gwei):',
    })
    if (amount.trim()) {
      const parsed = parseStringToUnit(amount, 'gwei')
      const amountWei = toWei(parsed.val, parsed.unit).toString()
      this.base.context.auctionMonitor.maxBid = new BN(amountWei)
      this.print(chalk.blue(`New max bid: ${fromWei(amountWei, 'gwei').toString()} gwei`))
    }
    return { context, next: AppMenu.TOP_MENU }
  }
}

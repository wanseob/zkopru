const chai = require('chai')
const timeMachine = require('ganache-time-traveler')
const BN = require('bn.js')

const BurnAuctionTester = artifacts.require('BurnAuctionTester')
const ZkopruStubTester = artifacts.require('ZkopruStubTester')

contract('BurnAuction tests', async accounts => {
  let burnAuction
  let zkopru
  let startBlock
  let roundLength
  let auctionStart
  let auctionEnd
  before(async () => {
    burnAuction = await BurnAuctionTester.deployed()
    zkopru = await ZkopruStubTester.deployed()
    await zkopru.setConsensusProvider(burnAuction.address)
    startBlock = +(await burnAuction.startBlock()).toString()
    roundLength = +(await burnAuction.roundLength()).toString()
    auctionStart = +(await burnAuction.auctionStart()).toString()
    auctionEnd = +(await burnAuction.auctionEnd()).toString()
  })
  describe('bidding test', () => {
    it('should fail to bid on 0th auction', async () => {
      const currentRound = +(await burnAuction.currentRound()).toString()
      try {
        await burnAuction.bid(currentRound, {
          from: accounts[0],
        })
        chai.assert(false)
      } catch (err) {
        chai.assert(err.reason === 'BurnAuction: Round is in past')
      }
    })

    it('should fail to bid on auction too close', async () => {
      const currentRound = +(await burnAuction.currentRound()).toString()
      const roundStartBlock = +(await burnAuction.calcRoundStart(currentRound)).toString()
      const targetRound = +(await burnAuction.roundForBlock(roundStartBlock + roundLength + auctionEnd - 1)).toString()
      try {
        await burnAuction.bid(targetRound, {
          from: accounts[0],
        })
        chai.assert(false, 'Auction bid should fail')
      } catch (err) {
        chai.assert(
          err.reason === 'BurnAuction: Bid is too close to round start'
        )
      }
    })

    it('should fail to bid on auction too far', async () => {
      const currentRound = +(await burnAuction.currentRound()).toString()
      const roundStartBlock = +(await burnAuction.calcRoundStart(currentRound)).toString()
      const targetRound = +(await burnAuction.roundForBlock(roundStartBlock + roundLength + auctionStart)).toString()
      try {
        await burnAuction.bid(targetRound, {
          from: accounts[0],
        })
        chai.assert(false, 'Auction bid should fail')
      } catch (err) {
        chai.assert(
          err.reason === 'BurnAuction: Bid is too far from round start'
        )
      }
    })

    it('should fail to bid on past auction', async () => {
      try {
        await burnAuction.bid(0, {
          from: accounts[0]
        })
        chai.assert(false, 'Past auction bid should fail')
      } catch (err) {
        chai.assert(err.reason === 'BurnAuction: Round is in past')
      }
    })

    it('should bid on near auction', async () => {
      const currentRound = +(await burnAuction.currentRound()).toString()
      const roundStartBlock = +(await burnAuction.calcRoundStart(currentRound)).toString()
      const targetRound = +(await burnAuction.roundForBlock(roundStartBlock + roundLength + auctionEnd + 1)).toString()
      const bidAmount = await burnAuction.minNextBid(targetRound)
      const originalBalance = await burnAuction.pendingBalances(accounts[0])
      await burnAuction.bid(targetRound, {
        from: accounts[0],
        value: bidAmount,
      })
      const newBalance = await burnAuction.pendingBalances(accounts[0])
      chai.assert(originalBalance.eq(newBalance), 'Pending balance incorrect')
      const highBid = await burnAuction.highestBidPerRound(targetRound)
      chai.assert.equal(highBid.owner, accounts[0], 'Incorrect high bid owner')
      chai.assert(highBid.amount.eq(bidAmount), 'Incorrect high bid amount')
    })

    it('should bid on far auction', async () => {
      const currentRound = +(await burnAuction.currentRound()).toString()
      const roundStartBlock = +(await burnAuction.calcRoundStart(currentRound)).toString()
      const targetRound = +(await burnAuction.roundForBlock(roundStartBlock + roundLength + auctionStart - 1)).toString()
      const bidAmount = await burnAuction.minNextBid(targetRound)
      const originalBalance = await burnAuction.pendingBalances(accounts[0])
      await burnAuction.bid(targetRound, {
        from: accounts[0],
        value: bidAmount,
      })
      const newBalance = await burnAuction.pendingBalances(accounts[0])
      chai.assert(originalBalance.eq(newBalance), 'Pending balance incorrect')
      const highBid = await burnAuction.highestBidPerRound(targetRound)
      chai.assert.equal(highBid.owner, accounts[0], 'Incorrect high bid owner')
      chai.assert(highBid.amount.eq(bidAmount), 'Incorrect high bid amount')
    })

    it('should fail to bid too little', async () => {
      const currentRound = +(await burnAuction.currentRound()).toString()
      const roundStartBlock = +(await burnAuction.calcRoundStart(currentRound)).toString()
      const targetRound = +(await burnAuction.roundForBlock(roundStartBlock + roundLength + auctionStart/2)).toString()
      const bidAmount = (await burnAuction.minNextBid(targetRound)).sub(new BN('1'))
      try {
        await burnAuction.bid(targetRound, {
          from: accounts[0],
          value: bidAmount,
        })
        chai.assert(false)
      } catch (err) {
        chai.assert(err.reason === 'BurnAuction: Bid not high enough')
      }
    })

    it('should refund bid when outbid', async () => {
      const currentRound = +(await burnAuction.currentRound()).toString()
      const roundStartBlock = +(await burnAuction.calcRoundStart(currentRound)).toString()
      const targetRound = +(await burnAuction.roundForBlock(roundStartBlock + roundLength + auctionStart/2)).toString()
      const bidAmount = (await burnAuction.minNextBid(targetRound))
      // Do first bid
      const originalBalance = await burnAuction.pendingBalances(accounts[1])
      await burnAuction.bid(targetRound, {
        from: accounts[1],
        value: bidAmount,
      })
      const nextBidAmount = await burnAuction.minNextBid(targetRound)
      await burnAuction.bid(targetRound, {
        from: accounts[2],
        value: nextBidAmount,
      })
      const newBalance = await burnAuction.pendingBalances(accounts[1])
      chai.assert(originalBalance.add(bidAmount).eq(newBalance))
    })
  })

  describe('refund test', () => {
    it('should fail to refund empty balance', async () => {
      try {
        await burnAuction.refund({
          from: accounts[9],
        })
        chai.assert(false, 'Should fail to do empty refund')
      } catch (err) {
        chai.assert(err.reason === 'BurnAuction: No balance to refund')
      }
    })

    it('should refund balance once', async () => {
      const currentRound = +(await burnAuction.currentRound()).toString()
      const roundStartBlock = +(await burnAuction.calcRoundStart(currentRound)).toString()
      const targetRound = +(await burnAuction.roundForBlock(roundStartBlock + roundLength + auctionStart/2)).toString()
      const bidAmount = await burnAuction.minNextBid(targetRound)
      await burnAuction.bid(targetRound, {
        from: accounts[3],
        value: bidAmount,
      })
      // outbid self to get a pending balance
      const nextBidAmount = await burnAuction.minNextBid(targetRound)
      await burnAuction.bid(targetRound, {
        from: accounts[3],
        value: nextBidAmount,
      })
      const pendingBalance = await burnAuction.pendingBalances(accounts[3])
      const addressBalance = new BN(await web3.eth.getBalance(accounts[3], 'latest'))
      await burnAuction.refundAddress(accounts[3], {
        from: accounts[9],
      })
      const finalBalance = new BN(await web3.eth.getBalance(accounts[3], 'latest'))
      chai.assert(addressBalance.add(pendingBalance).eq(finalBalance))
      const newPendingBalance = await burnAuction.pendingBalances(accounts[3])
      chai.assert(newPendingBalance.eq(new BN('0')))
      try {
        await burnAuction.refund({
          from: accounts[3],
        })
        chai.assert(false, 'Should fail to do empty refund')
      } catch (err) {
        chai.assert(err.reason === 'BurnAuction: No balance to refund')
      }
    })
  })

  describe('open round tests', () => {
    it('should not open round', async () => {
      const currentRound = +(await burnAuction.currentRound()).toString()
      const roundStartBlock = +(await burnAuction.calcRoundStart(currentRound)).toString()
      const targetRound = +(await burnAuction.roundForBlock(roundStartBlock + roundLength + auctionEnd)).toString()
      const targetRoundStart = +(await burnAuction.calcRoundStart(targetRound)).toString()
      const bidAmount = await burnAuction.minNextBid(targetRound)
      await burnAuction.bid(targetRound, {
        from: accounts[5],
        value: bidAmount,
      })
      // advance the blockchain
      while ((await web3.eth.getBlock('latest')).number < targetRoundStart) {
        await timeMachine.advanceBlock()
      }
      chai.assert(+(await burnAuction.currentRound()).toString() === targetRound)
      // now we're in the round controlled by accounts[5]
      chai.assert(!(await burnAuction.isRoundOpen()), 'Round is already open')
      await burnAuction.openRoundIfNeeded()
      chai.assert(!(await burnAuction.isRoundOpen()), 'Round should not be opened')
      await zkopru.propose(accounts[5])
      // advance the blockchain further
      while ((await web3.eth.getBlock('latest')).number < targetRoundStart + roundLength / 2) {
        await timeMachine.advanceBlock()
      }
      await burnAuction.openRoundIfNeeded()
      chai.assert(!(await burnAuction.isRoundOpen()), 'Round should not be opened after half')
    })

    it('should open round if no proposed block in first half', async () => {
      const currentRound = +(await burnAuction.currentRound()).toString()
      const roundStartBlock = +(await burnAuction.calcRoundStart(currentRound)).toString()
      const targetRound = +(await burnAuction.roundForBlock(roundStartBlock + roundLength + auctionEnd)).toString()
      const targetRoundStart = +(await burnAuction.calcRoundStart(targetRound)).toString()
      const bidAmount = await burnAuction.minNextBid(targetRound)
      await burnAuction.bid(targetRound, {
        from: accounts[5],
        value: bidAmount,
      })
      // advance the blockchain
      while ((await web3.eth.getBlock('latest')).number < targetRoundStart) {
        await timeMachine.advanceBlock()
      }
      chai.assert(+(await burnAuction.currentRound()).toString() === targetRound)
      // now we're in the round controlled by accounts[5]
      chai.assert(!(await burnAuction.isRoundOpen()), 'Round is already open')
      await burnAuction.openRoundIfNeeded()
      chai.assert(!(await burnAuction.isRoundOpen()), 'Round should not be opened')
      // advance the blockchain past halfway point
      while ((await web3.eth.getBlock('latest')).number < targetRoundStart + roundLength / 2) {
        await timeMachine.advanceBlock()
      }
      await burnAuction.openRoundIfNeeded()
      chai.assert(await burnAuction.isRoundOpen(), 'Round should be opened after half')
    })
  })

  describe('balance transfer tests', () => {
    it('should update balance', async () => {
      const currentRound = +(await burnAuction.currentRound()).toString()
      // calculate the expected balance here
      let balance = new BN('0')
      for (let x = 0; x <= currentRound; x++) {
        const highBid = await burnAuction.highestBidPerRound(x)
        balance = balance.clone().add(highBid.amount)
      }
      const startBalance = await burnAuction.balance()
      chai.assert(startBalance.eq(new BN('0')), 'Contract balance is non-zero')
      await burnAuction.updateBalance({
        from: accounts[8],
      })
      const contractBalance = await burnAuction.balance()
      chai.assert(contractBalance.eq(balance))
    })

    it('should transfer balance', async () => {
      const receiver = accounts[7]
      const startBalance = new BN(await web3.eth.getBalance(receiver))
      const contractBalance = await burnAuction.balance()
      await burnAuction.transferBalance(receiver, {
        from: accounts[8],
      })
      const balance = new BN(await web3.eth.getBalance(receiver))
      chai.assert(startBalance.add(contractBalance).eq(balance), 'Funds were not received')
      const newContractBalance = await burnAuction.balance()
      chai.assert(newContractBalance.eq(new BN('0')), 'Not all funds were moved')
    })
  })

  describe('round tests', () => {
    it('should propose if winning bid', async () => {
      const currentRound = +(await burnAuction.currentRound()).toString()
      const roundStartBlock = +(await burnAuction.calcRoundStart(currentRound)).toString()
      const targetRound = +(await burnAuction.roundForBlock(roundStartBlock + roundLength + auctionEnd)).toString()
      const targetRoundStart = +(await burnAuction.calcRoundStart(targetRound)).toString()
      const bidAmount = await burnAuction.minNextBid(targetRound)
      await burnAuction.bid(targetRound, {
        from: accounts[0],
        value: bidAmount,
      })
      while ((await web3.eth.getBlock('latest')).number < targetRoundStart) {
        await timeMachine.advanceBlock()
      }
      chai.assert(+(await burnAuction.currentRound()).toString() === targetRound)
      chai.assert(await burnAuction.isProposable(accounts[0]))
      chai.assert(!(await burnAuction.isProposable(accounts[1])))
    })

    it('should propose if no winning bid', async () => {
      const currentRound = +(await burnAuction.currentRound()).toString()
      let targetRound = 0
      // find a round that has no bids
      for (let x = currentRound + 1; true; x++) {
        const highBid = await burnAuction.highestBidPerRound(x)
        if (highBid.amount.eq(new BN('0'))) {
          targetRound = x
          break
        }
      }
      const targetRoundStart = +(await burnAuction.calcRoundStart(targetRound)).toString()
      while ((await web3.eth.getBlock('latest')).number < targetRoundStart) {
        await timeMachine.advanceBlock()
      }
      chai.assert(+(await burnAuction.currentRound()).toString() === targetRound)
      chai.assert(await burnAuction.isProposable(accounts[0]))
      chai.assert(await burnAuction.isProposable(accounts[1]))
      chai.assert(await burnAuction.isProposable(accounts[2]))
    })
  })

  describe('lock tests', () => {
    it('should fail to lock', async () => {
      const currentRound = +(await burnAuction.currentRound()).toString()
      const roundStartBlock = +(await burnAuction.calcRoundStart(currentRound)).toString()
      const targetRound = +(await burnAuction.roundForBlock(roundStartBlock + roundLength + auctionStart - 1)).toString()
      try {
        await zkopru.lock(targetRound, {
          from: accounts[0],
        })
        chai.assert(false, 'Should fail to lock')
      } catch (err) {
        chai.assert(err.reason === 'BurnAuction: Round index is not far enough in the future')
      }
    })

    it('should lock', async () => {
      const currentRound = +(await burnAuction.currentRound()).toString()
      const roundStartBlock = +(await burnAuction.calcRoundStart(currentRound)).toString()
      const targetRound = +(await burnAuction.roundForBlock(roundStartBlock + roundLength + auctionStart + 1)).toString()
      await zkopru.lock(targetRound, {
        from: accounts[0],
      })
      const lockedRound = +(await burnAuction.lockedRoundIndex()).toString()
      chai.assert(lockedRound === targetRound, 'Locked round incorrect')
      for (let x = 0; x < roundLength; x++) {
        await timeMachine.advanceBlock()
      }
      try {
        await burnAuction.bid(lockedRound, {
          from: accounts[9],
        })
        chai.assert(false, 'Should fail to bid on locked round')
      } catch (err) {
        chai.assert(err.reason === 'BurnAuction: Contract is locked')
      }
    })

    it('should fail to double lock', async () => {
      const currentRound = +(await burnAuction.currentRound()).toString()
      const roundStartBlock = +(await burnAuction.calcRoundStart(currentRound)).toString()
      const targetRound = +(await burnAuction.roundForBlock(roundStartBlock + roundLength + auctionStart + 1)).toString()
      try {
        await zkopru.lock(targetRound, {
          from: accounts[0],
        })
        chai.assert(false, 'Double lock should fail')
      } catch (err) {
        chai.assert(err.reason === 'BurnAuction: Contract already locked')
      }
    })
  })
})
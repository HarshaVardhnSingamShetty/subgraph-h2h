import { BigInt, ByteArray, Bytes, ethereum, log } from "@graphprotocol/graph-ts"

import {
  h2h,
  Head2HeadBetCancelled,
  Head2HeadBetPlaced,
  Head2HeadBetUpdated,
  Head2HeadEmergencyFundsWithdraw,
  Head2HeadGameCreated,
  Head2HeadGameWinAmountSent,
  Head2HeadPricesUpdated,
  Head2HeadUpdateOrCancelBetAmountReturned,
  Head2HeadWinningStockUpdated,
  OwnershipTransferred,
  Paused,
  Unpaused
} from "../generated/h2h/h2h"
import { Better, Head2HeadBet, Head2HeadGame } from "../generated/schema"

// export function handleHead2HeadBetCancelled(
//   event: Head2HeadBetCancelled
// ): void {
//   // Entities can be loaded from the store using a string ID; this ID
//   // needs to be unique across all entities of the same type
//   let entity = ExampleEntity.load(event.transaction.from.toHex())

//   // Entities only exist after they have been saved to the store;
//   // `null` checks allow to create entities on demand
//   if (!entity) {
//     entity = new ExampleEntity(event.transaction.from.toHex())

//     // Entity fields can be set using simple assignments
//     entity.count = BigInt.fromI32(0)
//   }

//   // BigInt and BigDecimal math are supported
//   entity.count = entity.count + BigInt.fromI32(1)

//   // Entity fields can be set based on event parameters
//   entity.gameId = event.params.gameId
//   entity.better = event.params.better

//   // Entities can be written to the store with `.save()`
//   entity.save()

//   // Note: If a handler doesn't require existing field values, it is faster
//   // _not_ to load the entity from the store. Instead, create it fresh with
//   // `new Entity(...)`, set the fields that should be updated and save the
//   // entity back to the store. Fields that were not set or unset remain
//   // unchanged, allowing for partial updates to be applied.

//   // It is also possible to access smart contracts from mappings. For
//   // example, the contract that has emitted the event can be connected to
//   // with:
//   //
//   // let contract = Contract.bind(event.address)
//   //
//   // The following functions can then be called on this contract to access
//   // state variables and other data:
//   //
//   // - contract.bets(...)
//   // - contract.betterGameIds(...)
//   // - contract.gameId(...)
//   // - contract.gameidIdxOfBetter(...)
//   // - contract.getBetOfUserInGameId(...)
//   // - contract.getBetterIndex(...)
//   // - contract.getEndGameStockPriceOfStockId(...)
//   // - contract.getGameBets(...)
//   // - contract.getGameBetters(...)
//   // - contract.getGameStatus(...)
//   // - contract.getInGameStockIds(...)
//   // - contract.getInGameStockSymbols(...)
//   // - contract.getIsBetter(...)
//   // - contract.getIsStockInGame(...)
//   // - contract.getStartGameStockPriceOfStockId(...)
//   // - contract.head2headGames(...)
//   // - contract.owner(...)
//   // - contract.paused(...)
// }

export function handleHead2HeadBetPlaced(event: Head2HeadBetPlaced): void {
  let betId = event.params.gameId.toHexString() + event.params.better.toHexString()
  let h2hBet = new Head2HeadBet(betId)
  h2hBet.gameId = event.params.gameId
  h2hBet.better = event.params.better
  h2hBet.betAmount = event.params.betAmount
  h2hBet.stockId = event.params.stockId
  h2hBet.save()

  let h2hGame = Head2HeadGame.load(event.params.gameId.toHexString())
  if(h2hGame){
    h2hGame.totalBetsPooled = h2hGame.totalBetsPooled.plus(event.params.betAmount)
    h2hGame.save()
  }
  
  let h2hBetter = Better.load(event.params.better.toHexString())
  if(h2hBetter){
    if(h2hBetter.gameIds){
      h2hBetter.gameIds!.push(event.params.gameId)
    }
    else{
      h2hBetter.gameIds = []
      h2hBetter.gameIds!.push(event.params.gameId)
    }
    let prevTotal = h2hBetter.totalBetAmount
    h2hBetter.totalBetAmount = prevTotal.plus(event.params.betAmount)
  }
  else{
    h2hBetter = new Better(event.params.better.toHexString())
    h2hBetter.address = event.params.better
    if(h2hBetter.gameIds){
      h2hBetter.gameIds!.push(event.params.gameId)
    }
    else{
      h2hBetter.gameIds = []
      h2hBetter.gameIds!.push(event.params.gameId)
    }
    h2hBetter.totalBetAmount = event.params.betAmount
  }
  h2hBetter.save()
}

export function handleHead2HeadBetUpdated(event: Head2HeadBetUpdated): void {}

export function handleHead2HeadEmergencyFundsWithdraw(
  event: Head2HeadEmergencyFundsWithdraw
): void {}

export function handleHead2HeadGameCreated(event: Head2HeadGameCreated): void {
  //let id = event.transaction.hash
  let h2hGame = new Head2HeadGame(event.params.gameId.toHexString())
  h2hGame.gameId = event.params.gameId
  h2hGame.startGameTimestamp = event.params.startGameTimestamp
  h2hGame.endGameTimestamp = event.params.endGameTimeStamp
  h2hGame.minBet = event.params.minBetAmountInWei
  h2hGame.maxBet = event.params.maxBetAmountInWei
  h2hGame.winningMultiplier = event.params.winningMultiplierBasisPoints
  h2hGame.stockIds = event.params.stocks
  h2hGame.stockSymbols = event.params.stockSymbols;
  h2hGame.rewardsDistributed = false
  h2hGame.totalBetsPooled = BigInt.fromI32(0)
  //save entity
  h2hGame.save()
}

export function handleHead2HeadGameWinAmountSent(
  event: Head2HeadGameWinAmountSent
): void {
  let h2hGame =  Head2HeadGame.load(event.params.gameId.toHexString())
  h2hGame!.rewardsDistributed = true
  let id = event.params.gameId.toHexString() + event.params.winner.toHexString()
  let h2hBet = Head2HeadBet.load(id)
  h2hBet!.winAmount = event.params.amountSent
  h2hBet!.win = true
  
  let h2hBetter = Better.load(event.params.winner.toHexString())
  // h2hBetter!.totalWinAmont += event.params.amountSent
}

export function handleHead2HeadPricesUpdated(
  event: Head2HeadPricesUpdated
): void {
  let h2hGame =  Head2HeadGame.load(event.params.gameId.toHexString())
  h2hGame!.startGameStockPrices = event.params.startGameStockPricesInWei
  h2hGame!.endGameStockPrices = event.params.endGameStockPricesInWei

}

export function handleHead2HeadUpdateOrCancelBetAmountReturned(
  event: Head2HeadUpdateOrCancelBetAmountReturned
): void {}

export function handleHead2HeadWinningStockUpdated(
  event: Head2HeadWinningStockUpdated
): void {
  let h2hGame =  Head2HeadGame.load(event.params.gameId.toHexString())
  h2hGame!.winningStockId = event.params.winningStockId
}

export function handleOwnershipTransferred(event: OwnershipTransferred): void {}

export function handlePaused(event: Paused): void {}

export function handleUnpaused(event: Unpaused): void {}

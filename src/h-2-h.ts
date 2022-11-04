import { BigInt } from "@graphprotocol/graph-ts"
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
import { ExampleEntity } from "../generated/schema"

export function handleHead2HeadBetCancelled(
  event: Head2HeadBetCancelled
): void {
  // Entities can be loaded from the store using a string ID; this ID
  // needs to be unique across all entities of the same type
  let entity = ExampleEntity.load(event.transaction.from.toHex())

  // Entities only exist after they have been saved to the store;
  // `null` checks allow to create entities on demand
  if (!entity) {
    entity = new ExampleEntity(event.transaction.from.toHex())

    // Entity fields can be set using simple assignments
    entity.count = BigInt.fromI32(0)
  }

  // BigInt and BigDecimal math are supported
  entity.count = entity.count + BigInt.fromI32(1)

  // Entity fields can be set based on event parameters
  entity.gameId = event.params.gameId
  entity.better = event.params.better

  // Entities can be written to the store with `.save()`
  entity.save()

  // Note: If a handler doesn't require existing field values, it is faster
  // _not_ to load the entity from the store. Instead, create it fresh with
  // `new Entity(...)`, set the fields that should be updated and save the
  // entity back to the store. Fields that were not set or unset remain
  // unchanged, allowing for partial updates to be applied.

  // It is also possible to access smart contracts from mappings. For
  // example, the contract that has emitted the event can be connected to
  // with:
  //
  // let contract = Contract.bind(event.address)
  //
  // The following functions can then be called on this contract to access
  // state variables and other data:
  //
  // - contract.bets(...)
  // - contract.betterGameIds(...)
  // - contract.gameId(...)
  // - contract.gameidIdxOfBetter(...)
  // - contract.getBetOfUserInGameId(...)
  // - contract.getBetterIndex(...)
  // - contract.getEndGameStockPriceOfStockId(...)
  // - contract.getGameBets(...)
  // - contract.getGameBetters(...)
  // - contract.getGameStatus(...)
  // - contract.getInGameStockIds(...)
  // - contract.getInGameStockSymbols(...)
  // - contract.getIsBetter(...)
  // - contract.getIsStockInGame(...)
  // - contract.getStartGameStockPriceOfStockId(...)
  // - contract.head2headGames(...)
  // - contract.owner(...)
  // - contract.paused(...)
}

export function handleHead2HeadBetPlaced(event: Head2HeadBetPlaced): void {}

export function handleHead2HeadBetUpdated(event: Head2HeadBetUpdated): void {}

export function handleHead2HeadEmergencyFundsWithdraw(
  event: Head2HeadEmergencyFundsWithdraw
): void {}

export function handleHead2HeadGameCreated(event: Head2HeadGameCreated): void {}

export function handleHead2HeadGameWinAmountSent(
  event: Head2HeadGameWinAmountSent
): void {}

export function handleHead2HeadPricesUpdated(
  event: Head2HeadPricesUpdated
): void {}

export function handleHead2HeadUpdateOrCancelBetAmountReturned(
  event: Head2HeadUpdateOrCancelBetAmountReturned
): void {}

export function handleHead2HeadWinningStockUpdated(
  event: Head2HeadWinningStockUpdated
): void {}

export function handleOwnershipTransferred(event: OwnershipTransferred): void {}

export function handlePaused(event: Paused): void {}

export function handleUnpaused(event: Unpaused): void {}

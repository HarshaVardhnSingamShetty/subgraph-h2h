import { newMockEvent } from "matchstick-as"
import { ethereum, BigInt, Address } from "@graphprotocol/graph-ts"
import {
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
} from "../generated/Head2Head/Head2Head"

export function createHead2HeadBetCancelledEvent(
  gameId: BigInt,
  better: Address,
  stockId: BigInt
): Head2HeadBetCancelled {
  let head2HeadBetCancelledEvent = changetype<Head2HeadBetCancelled>(
    newMockEvent()
  )

  head2HeadBetCancelledEvent.parameters = new Array()

  head2HeadBetCancelledEvent.parameters.push(
    new ethereum.EventParam("gameId", ethereum.Value.fromUnsignedBigInt(gameId))
  )
  head2HeadBetCancelledEvent.parameters.push(
    new ethereum.EventParam("better", ethereum.Value.fromAddress(better))
  )
  head2HeadBetCancelledEvent.parameters.push(
    new ethereum.EventParam(
      "stockId",
      ethereum.Value.fromUnsignedBigInt(stockId)
    )
  )

  return head2HeadBetCancelledEvent
}

export function createHead2HeadBetPlacedEvent(
  gameId: BigInt,
  better: Address,
  stockId: BigInt,
  betAmount: BigInt
): Head2HeadBetPlaced {
  let head2HeadBetPlacedEvent = changetype<Head2HeadBetPlaced>(newMockEvent())

  head2HeadBetPlacedEvent.parameters = new Array()

  head2HeadBetPlacedEvent.parameters.push(
    new ethereum.EventParam("gameId", ethereum.Value.fromUnsignedBigInt(gameId))
  )
  head2HeadBetPlacedEvent.parameters.push(
    new ethereum.EventParam("better", ethereum.Value.fromAddress(better))
  )
  head2HeadBetPlacedEvent.parameters.push(
    new ethereum.EventParam(
      "stockId",
      ethereum.Value.fromUnsignedBigInt(stockId)
    )
  )
  head2HeadBetPlacedEvent.parameters.push(
    new ethereum.EventParam(
      "betAmount",
      ethereum.Value.fromUnsignedBigInt(betAmount)
    )
  )

  return head2HeadBetPlacedEvent
}

export function createHead2HeadBetUpdatedEvent(
  gameId: BigInt,
  better: Address,
  stockId: BigInt,
  prevBetAmount: BigInt,
  newBetAmount: BigInt
): Head2HeadBetUpdated {
  let head2HeadBetUpdatedEvent = changetype<Head2HeadBetUpdated>(newMockEvent())

  head2HeadBetUpdatedEvent.parameters = new Array()

  head2HeadBetUpdatedEvent.parameters.push(
    new ethereum.EventParam("gameId", ethereum.Value.fromUnsignedBigInt(gameId))
  )
  head2HeadBetUpdatedEvent.parameters.push(
    new ethereum.EventParam("better", ethereum.Value.fromAddress(better))
  )
  head2HeadBetUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "stockId",
      ethereum.Value.fromUnsignedBigInt(stockId)
    )
  )
  head2HeadBetUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "prevBetAmount",
      ethereum.Value.fromUnsignedBigInt(prevBetAmount)
    )
  )
  head2HeadBetUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "newBetAmount",
      ethereum.Value.fromUnsignedBigInt(newBetAmount)
    )
  )

  return head2HeadBetUpdatedEvent
}

export function createHead2HeadEmergencyFundsWithdrawEvent(
  gameId: BigInt,
  better: Address,
  stockId: BigInt,
  betAmt: BigInt
): Head2HeadEmergencyFundsWithdraw {
  let head2HeadEmergencyFundsWithdrawEvent = changetype<
    Head2HeadEmergencyFundsWithdraw
  >(newMockEvent())

  head2HeadEmergencyFundsWithdrawEvent.parameters = new Array()

  head2HeadEmergencyFundsWithdrawEvent.parameters.push(
    new ethereum.EventParam("gameId", ethereum.Value.fromUnsignedBigInt(gameId))
  )
  head2HeadEmergencyFundsWithdrawEvent.parameters.push(
    new ethereum.EventParam("better", ethereum.Value.fromAddress(better))
  )
  head2HeadEmergencyFundsWithdrawEvent.parameters.push(
    new ethereum.EventParam(
      "stockId",
      ethereum.Value.fromUnsignedBigInt(stockId)
    )
  )
  head2HeadEmergencyFundsWithdrawEvent.parameters.push(
    new ethereum.EventParam("betAmt", ethereum.Value.fromUnsignedBigInt(betAmt))
  )

  return head2HeadEmergencyFundsWithdrawEvent
}

export function createHead2HeadGameCreatedEvent(
  gameId: BigInt,
  stocks: Array<BigInt>,
  winningMultiplierBasisPoints: BigInt,
  startGameTimestamp: BigInt,
  endGameTimeStamp: BigInt,
  minBetAmountInWei: BigInt,
  maxBetAmountInWei: BigInt
): Head2HeadGameCreated {
  let head2HeadGameCreatedEvent = changetype<Head2HeadGameCreated>(
    newMockEvent()
  )

  head2HeadGameCreatedEvent.parameters = new Array()

  head2HeadGameCreatedEvent.parameters.push(
    new ethereum.EventParam("gameId", ethereum.Value.fromUnsignedBigInt(gameId))
  )
  head2HeadGameCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "stocks",
      ethereum.Value.fromUnsignedBigIntArray(stocks)
    )
  )
  head2HeadGameCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "winningMultiplierBasisPoints",
      ethereum.Value.fromUnsignedBigInt(winningMultiplierBasisPoints)
    )
  )
  head2HeadGameCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "startGameTimestamp",
      ethereum.Value.fromUnsignedBigInt(startGameTimestamp)
    )
  )
  head2HeadGameCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "endGameTimeStamp",
      ethereum.Value.fromUnsignedBigInt(endGameTimeStamp)
    )
  )
  head2HeadGameCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "minBetAmountInWei",
      ethereum.Value.fromUnsignedBigInt(minBetAmountInWei)
    )
  )
  head2HeadGameCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "maxBetAmountInWei",
      ethereum.Value.fromUnsignedBigInt(maxBetAmountInWei)
    )
  )

  return head2HeadGameCreatedEvent
}

export function createHead2HeadGameWinAmountSentEvent(
  gameId: BigInt,
  winner: Address,
  winningStockId: BigInt,
  amountSent: BigInt
): Head2HeadGameWinAmountSent {
  let head2HeadGameWinAmountSentEvent = changetype<Head2HeadGameWinAmountSent>(
    newMockEvent()
  )

  head2HeadGameWinAmountSentEvent.parameters = new Array()

  head2HeadGameWinAmountSentEvent.parameters.push(
    new ethereum.EventParam("gameId", ethereum.Value.fromUnsignedBigInt(gameId))
  )
  head2HeadGameWinAmountSentEvent.parameters.push(
    new ethereum.EventParam("winner", ethereum.Value.fromAddress(winner))
  )
  head2HeadGameWinAmountSentEvent.parameters.push(
    new ethereum.EventParam(
      "winningStockId",
      ethereum.Value.fromUnsignedBigInt(winningStockId)
    )
  )
  head2HeadGameWinAmountSentEvent.parameters.push(
    new ethereum.EventParam(
      "amountSent",
      ethereum.Value.fromUnsignedBigInt(amountSent)
    )
  )

  return head2HeadGameWinAmountSentEvent
}

export function createHead2HeadPricesUpdatedEvent(
  gameId: BigInt,
  stockIds: Array<BigInt>,
  startGameStockPricesInWei: Array<BigInt>,
  endGameStockPricesInWei: Array<BigInt>
): Head2HeadPricesUpdated {
  let head2HeadPricesUpdatedEvent = changetype<Head2HeadPricesUpdated>(
    newMockEvent()
  )

  head2HeadPricesUpdatedEvent.parameters = new Array()

  head2HeadPricesUpdatedEvent.parameters.push(
    new ethereum.EventParam("gameId", ethereum.Value.fromUnsignedBigInt(gameId))
  )
  head2HeadPricesUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "stockIds",
      ethereum.Value.fromUnsignedBigIntArray(stockIds)
    )
  )
  head2HeadPricesUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "startGameStockPricesInWei",
      ethereum.Value.fromUnsignedBigIntArray(startGameStockPricesInWei)
    )
  )
  head2HeadPricesUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "endGameStockPricesInWei",
      ethereum.Value.fromUnsignedBigIntArray(endGameStockPricesInWei)
    )
  )

  return head2HeadPricesUpdatedEvent
}

export function createHead2HeadUpdateOrCancelBetAmountReturnedEvent(
  gameId: BigInt,
  better: Address,
  stockId: BigInt,
  returnBetAmount: BigInt
): Head2HeadUpdateOrCancelBetAmountReturned {
  let head2HeadUpdateOrCancelBetAmountReturnedEvent = changetype<
    Head2HeadUpdateOrCancelBetAmountReturned
  >(newMockEvent())

  head2HeadUpdateOrCancelBetAmountReturnedEvent.parameters = new Array()

  head2HeadUpdateOrCancelBetAmountReturnedEvent.parameters.push(
    new ethereum.EventParam("gameId", ethereum.Value.fromUnsignedBigInt(gameId))
  )
  head2HeadUpdateOrCancelBetAmountReturnedEvent.parameters.push(
    new ethereum.EventParam("better", ethereum.Value.fromAddress(better))
  )
  head2HeadUpdateOrCancelBetAmountReturnedEvent.parameters.push(
    new ethereum.EventParam(
      "stockId",
      ethereum.Value.fromUnsignedBigInt(stockId)
    )
  )
  head2HeadUpdateOrCancelBetAmountReturnedEvent.parameters.push(
    new ethereum.EventParam(
      "returnBetAmount",
      ethereum.Value.fromUnsignedBigInt(returnBetAmount)
    )
  )

  return head2HeadUpdateOrCancelBetAmountReturnedEvent
}

export function createHead2HeadWinningStockUpdatedEvent(
  gameId: BigInt,
  winningStockId: BigInt
): Head2HeadWinningStockUpdated {
  let head2HeadWinningStockUpdatedEvent = changetype<
    Head2HeadWinningStockUpdated
  >(newMockEvent())

  head2HeadWinningStockUpdatedEvent.parameters = new Array()

  head2HeadWinningStockUpdatedEvent.parameters.push(
    new ethereum.EventParam("gameId", ethereum.Value.fromUnsignedBigInt(gameId))
  )
  head2HeadWinningStockUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "winningStockId",
      ethereum.Value.fromUnsignedBigInt(winningStockId)
    )
  )

  return head2HeadWinningStockUpdatedEvent
}

export function createOwnershipTransferredEvent(
  previousOwner: Address,
  newOwner: Address
): OwnershipTransferred {
  let ownershipTransferredEvent = changetype<OwnershipTransferred>(
    newMockEvent()
  )

  ownershipTransferredEvent.parameters = new Array()

  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam(
      "previousOwner",
      ethereum.Value.fromAddress(previousOwner)
    )
  )
  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam("newOwner", ethereum.Value.fromAddress(newOwner))
  )

  return ownershipTransferredEvent
}

export function createPausedEvent(account: Address): Paused {
  let pausedEvent = changetype<Paused>(newMockEvent())

  pausedEvent.parameters = new Array()

  pausedEvent.parameters.push(
    new ethereum.EventParam("account", ethereum.Value.fromAddress(account))
  )

  return pausedEvent
}

export function createUnpausedEvent(account: Address): Unpaused {
  let unpausedEvent = changetype<Unpaused>(newMockEvent())

  unpausedEvent.parameters = new Array()

  unpausedEvent.parameters.push(
    new ethereum.EventParam("account", ethereum.Value.fromAddress(account))
  )

  return unpausedEvent
}

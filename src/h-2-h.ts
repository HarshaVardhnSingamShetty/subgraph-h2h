import {
  BigInt,
  Bytes
} from "@graphprotocol/graph-ts";

import {
  Head2HeadBetPlaced,
  Head2HeadGameDrawRevertBets,
  Head2HeadGameCreated,
  Head2HeadGameWinAmountSent,
  Head2HeadPricesUpdated,
  Head2HeadWinningStockUpdated,
  Head2HeadRewardsDistributed,
  Head2HeadOddsUpdated
} from "../generated/h2h/h2h";
import { Better, Head2HeadBet, Head2HeadGame } from "../generated/schema";

export function handleHead2HeadGameCreated(event: Head2HeadGameCreated): void {
  //let id = event.transaction.hash
  let h2hGame = new Head2HeadGame(event.params.gameId.toHexString());
  h2hGame.gameId = event.params.gameId;
  h2hGame.startGameTimestamp = event.params.startGameTimestamp;
  h2hGame.endGameTimestamp = event.params.endGameTimeStamp;
  h2hGame.minBet = event.params.minBetAmountInWei;
  h2hGame.maxBet = event.params.maxBetAmountInWei;
  h2hGame.initialMultiplier = event.params.initialMultiplierInWei;
  h2hGame.updateMulAfterAmountInWei = event.params.updateMulAfterAmountInWei;
  h2hGame.curUpdateMulAtAmountInWei = event.params.updateMulAfterAmountInWei;
  h2hGame.isGameDraw = false;
  h2hGame.stockIds = event.params.stocks;
  h2hGame.stockSymbols = event.params.stockSymbols;
  h2hGame.rewardsDistributed = false;
  h2hGame.winners = [];
  h2hGame.totalBetsPooled = BigInt.fromI32(0);
  h2hGame.totalBetsInStocks = [BigInt.fromI32(0), BigInt.fromI32(0)];
  h2hGame.curMultiplierOfStocks = [
    event.params.initialMultiplierInWei,
    event.params.initialMultiplierInWei,
  ];

  //save entity
  h2hGame.save();
}
export function handleHead2HeadBetPlaced(event: Head2HeadBetPlaced): void {
  let betId =
    event.params.gameId.toHexString() +
    event.params.better.toHexString() +
    event.params.index.toHexString();

  let h2hGame = Head2HeadGame.load(event.params.gameId.toHexString());

  let h2hBet = new Head2HeadBet(betId);
  h2hBet.gameId = event.params.gameId;
  h2hBet.better = event.params.better;
  h2hBet.betAmount = event.params.betAmount;
  h2hBet.stockId = event.params.stockId;
  h2hBet.index = event.params.index;
  h2hBet.bet = h2hGame!.id;
  h2hBet.save();

  if (h2hGame) {
    h2hGame.totalBetsPooled = h2hGame.totalBetsPooled.plus(
      event.params.betAmount
    );
    h2hGame.curUpdateMulAtAmountInWei = event.params.curUpdateMulAtAmountInWei;
    if (event.params.stockId == h2hGame.stockIds[0]) {
      // if(h2hGame.totalBetsInStocks)
      h2hGame.totalBetsInStocks[0] = h2hGame.totalBetsInStocks[0].plus(
        event.params.betAmount
      );
    } else {
      // if(h2hGame.totalBetsInStocks)
      h2hGame.totalBetsInStocks[1] = h2hGame.totalBetsInStocks[1].plus(
        event.params.betAmount
      );
    }
    h2hGame.save();
  }

  let h2hBetter = Better.load(event.params.better.toHexString());
  if (h2hBetter) {
    if (!h2hBetter.gameIds.includes(event.params.gameId)) {
      let gameIds = h2hBetter.gameIds;
      gameIds.push(event.params.gameId);
      h2hBetter.gameIds = gameIds;
    }
    h2hBetter.totalBetAmount = h2hBetter.totalBetAmount.plus(event.params.betAmount);
  } else {
    h2hBetter = new Better(event.params.better.toHexString());
    h2hBetter.address = event.params.better;
    h2hBetter.gameIds = [event.params.gameId];
    h2hBetter.totalBetAmount = event.params.betAmount;
    h2hBetter.totalWinAmont = BigInt.fromI32(0)

  }
  h2hBetter.save();
}

export function handleHead2HeadOddsUpdated(event: Head2HeadOddsUpdated): void {
  let h2hGame = Head2HeadGame.load(event.params.gameId.toHexString());
  if (h2hGame) {
    h2hGame.curMultiplierOfStocks[0] = event.params.newOddsStock0;
    h2hGame.curMultiplierOfStocks[1] = event.params.newOddsStock1;
    h2hGame.save();
  }
}

export function handleHead2HeadPricesUpdated(
  event: Head2HeadPricesUpdated
): void {
  let h2hGame = Head2HeadGame.load(event.params.gameId.toHexString());

  if (h2hGame) {
    h2hGame.startGameStockPrices = event.params.startGameStockPricesInWei;
    h2hGame.endGameStockPrices = event.params.endGameStockPricesInWei;

    h2hGame.save();
  }
}

export function handleHead2HeadWinningStockUpdated(
  event: Head2HeadWinningStockUpdated
): void {
  let h2hGame = Head2HeadGame.load(event.params.gameId.toHexString());
  if (h2hGame) {
    if (event.params.winningStockId == new Bytes(0)) {
      h2hGame.isGameDraw = true;
    }
    h2hGame.winningStockId = event.params.winningStockId;
    h2hGame.save();
  }
}

export function handleHead2HeadGameDrawRevertBets(
  event: Head2HeadGameDrawRevertBets
): void {
  let h2hGame = Head2HeadGame.load(event.params.gameId.toHexString());
  if (h2hGame) {
    h2hGame.isGameDraw = true
    h2hGame.save()
  }

  let id =
    event.params.gameId.toHexString() +
    event.params.better.toHexString() +
    event.params.index.toHexString();
  let h2hBet = Head2HeadBet.load(id);
  if(h2hBet){
    h2hBet.betAmount = BigInt.fromI32(0)
    h2hBet.save()
  }

  let h2hBetter = Better.load(event.params.better.toHexString());
  if(h2hBetter){
    h2hBetter.totalBetAmount = h2hBetter.totalBetAmount.minus(event.params.betAmt)
  }

}

export function handleHead2HeadGameWinAmountSent(
  event: Head2HeadGameWinAmountSent
): void {
  let id =
    event.params.gameId.toHexString() +
    event.params.winner.toHexString() +
    event.params.index.toHexString();
  let h2hBet = Head2HeadBet.load(id);

  if (h2hBet) {
    h2hBet.winAmount = event.params.amountSent;
    h2hBet.win = true;
    h2hBet.save()
  }

  let h2hBetter = Better.load(event.params.winner.toHexString());
  if (h2hBetter) {
    if (h2hBetter.totalWinAmont){
      h2hBetter.totalWinAmont = h2hBetter.totalWinAmont.plus(
        event.params.amountSent
      );
    }
    else {
      h2hBetter.totalWinAmont = event.params.amountSent;
    }
    
    h2hBetter.save()
  }

  let h2hGame = Head2HeadGame.load(event.params.gameId.toHexString())
  if(h2hGame && (h2hGame.winners.indexOf(event.params.winner) === -1)){
    let gameWinners = h2hGame.winners;
    gameWinners.push(event.params.winner);
    h2hGame.winners = gameWinners;
    h2hGame.save()
  }

}

export function handleHead2HeadRewardsDistributed(event: Head2HeadRewardsDistributed): void{
  let h2hGame = Head2HeadGame.load(event.params.gameId.toHexString());
  if (h2hGame) {
    h2hGame.rewardsDistributed = true;
    h2hGame.save()
  }
}

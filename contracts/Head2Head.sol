// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "./StockDetails.sol";

contract Head2Head is Ownable, Pausable {
    //enum for GameStatus
    enum GameStatus {
        NONEXISTENT,
        CREATED,
        STARTED,
        ENDED,
        FORFEITED
    }
    struct Head2HeadBet {
        address better;
        uint256 betAmount;
        bytes12 stockId;
        uint256 timestamp;
        uint256 winAmount;
        bool win;
    }
    /**
     * @notice HEAD 2 HEAD Game Info
     */
    struct Head2HeadGame {
        bytes12[2] stockIds; // stock IDs listed in this game
        string[2] stockSymbols; // stock symbols of respective stockIDs
        mapping(bytes12 => bool) isStockInGame; // boolean check is stock is listed in this game
        uint256 createGameTimestamp; // creation time for this game
        uint256 startGameTimestamp; // start time for this game
        uint256 endGameTimestamp; // end time for this game
        uint256 minBetAmountInWei; // minimum amount to bet in wei
        uint256 maxBetAmountInWei; // maximum amount to bet in wei
        uint256 winningMultiplierBasisPoints; // basis points rate (e.g. 200 = 2%, 150 = 1.50%)
        bool isForfeited; // Is this Game Destroyed ?
        mapping(bytes12 => uint256) startGameStockPricesInWei; // stockId => price before game start in wei uints
        mapping(bytes12 => uint256) endGameStockPricesInWei; // stockId => price after game start in wei uints
        bytes12 winningStockId; // Stock ID of winning stock
        bool rewardsDistributed; // Is Reward Distributed in this game ?
        address payable[] betters; // address array of all the betters
        uint256 totalNumberOfBetters; // total number of betters in the current game
        mapping(address => uint256) betterIndex; // address -> index of betters array, to easily pop better
        mapping(address => bool) isBetter; // address -> boolean check given address is a better in this game
        uint256 totalBetsPooled; // total amount pooled in this bet
    }

    /**
     *  MAPPINGS FOR HEAD 2 HEAD GAME
     */

    /**
     * @notice Game Info For This Game Id  (gameID -> GameInfo)
     */
    mapping(uint256 => Head2HeadGame) public head2headGames;
    /**
     * @notice Bet Info for a given gameID and better address (gameid -> better -> Bet)
     */
    mapping(uint256 => mapping(address => Head2HeadBet)) public bets;
    /**
     * @notice gameIds of all the games, the better has participated in head2head game ( betterAddress -> gameId[] )
     */
    mapping(address => uint256[]) public betterGameIds;
    /**
     *@notice ( betterAddress -> gameId -> index of the gameId inside the betterGameIds)
     * Index of a given gameId of a better inside the betterGameIds mapping
     * @dev this is used for efficiently deleting a gameId from betterGameIds, when better cancels a bet from a game
     */
    mapping(address => mapping(uint256 => uint256)) public gameidIdxOfBetter;
    /**
     * @notice Current Game ID
     */
    uint256 public gameId;

    // StockDetails public stockDetailsContract;

    /**
     *  HEAD 2 HEAD GAME DIFFERENT ERRORS
     */

    error Head2Head__WrongGameStatus();
    error Head2Head__GameNotEnded();
    error Head2Head__BetExists();
    error Head2Head__BetDoesNotExist();
    error Head2Head__InvalidBetAmount();
    error Head2Head__WinningStockNotCalculated();
    error Head2Head__RewardsAlreadyDistributed();
    error Head2Head__ArrayLengthsMismatch();
    error Head2Head__GameForfeited();
    error Head2Head__WrongTimestamps();
    error Head2Head__WrongStockIds(bytes12 stockId1, bytes12 stockId2);
    error Head2Head__StockIdNotInGame(uint256 gameId, bytes12 stockId);
    error Head2Head__WrongIdxs(uint256 startIdx, uint256 endIdx);
    /**
     *  HEAD 2 HEAD GAME EVENTS
     */

    event Head2HeadGameCreated(
        uint256 indexed gameId,
        bytes12[2] stocks,
        string[2] stockSymbols,
        uint256 winningMultiplierBasisPoints,
        uint256 startGameTimestamp,
        uint256 endGameTimeStamp,
        uint256 minBetAmountInWei,
        uint256 maxBetAmountInWei
    );
    event Head2HeadBetPlaced(
        uint256 indexed gameId,
        address indexed better,
        bytes12 indexed stockId,
        uint256 betAmount
    );
    event Head2HeadBetUpdated(
        uint256 indexed gameId,
        address indexed better,
        bytes12 indexed stockId,
        uint256 prevBetAmount,
        uint256 newBetAmount
    );
    event Head2HeadBetCancelled(
        uint256 indexed gameId,
        address better,
        bytes12 indexed stockId
    );
    event Head2HeadGameWinAmountSent(
        uint256 indexed gameId,
        address winner,
        bytes12 winningStockId,
        uint256 amountSent
    );
    event Head2HeadUpdateOrCancelBetAmountReturned(
        uint256 gameId,
        address better,
        bytes12 stockId,
        uint256 returnBetAmount
    );
    event Head2HeadEmergencyFundsWithdraw(
        uint256 indexed gameId,
        address better,
        bytes12 stockId,
        uint256 betAmt
    );
    event Head2HeadPricesUpdated(
        uint256 indexed gameId,
        bytes12[2] stockIds,
        uint256[2] startGameStockPricesInWei,
        uint256[2] endGameStockPricesInWei
    );
    event Head2HeadWinningStockUpdated(
        uint256 indexed gameId,
        bytes12 winningStockId
    );

    // constructor(address _stockDetailsContract) {
    //     stockDetailsContract = StockDetails(_stockDetailsContract);
    // }

    /**
     * @notice Place Bet For Given game ID and stock ID
     * @dev Reverts when
     * (Game Is Not Created ||
     *  Game Is Ended ||
     *  Game Is Forfeited ||
     *  Given stock Not Listed In This Game ||
     *  Caller has already Bet In This Game ||
     *  Caller bet is less than minimum bet value)
     * @param _gameId Game ID of the game to place Bet
     * @param _stockId ID of the stock on which bet is placed
     */
    function placeBet(uint256 _gameId, bytes12 _stockId)
        external
        payable
        whenNotPaused
    {
        //BET AMOUNT
        uint256 betAmount = msg.value;

        // SUFFICIENT CHECKS TO CHECK BET IS VALID OR NOT
        if (!head2headGames[_gameId].isStockInGame[_stockId]) {
            revert Head2Head__StockIdNotInGame(_gameId, _stockId);
        }
        if (getGameStatus(_gameId) != GameStatus.CREATED) {
            revert Head2Head__WrongGameStatus();
        } else if (bets[_gameId][_msgSender()].timestamp > 0) {
            revert Head2Head__BetExists();
        } else if (
            betAmount < head2headGames[_gameId].minBetAmountInWei ||
            betAmount > head2headGames[_gameId].maxBetAmountInWei
        ) {
            revert Head2Head__InvalidBetAmount();
        }

        // ADD THE GAMEID TO THE USER ROUNDS
        betterGameIds[_msgSender()].push(_gameId);
        uint256 totalBetterGames = betterGameIds[_msgSender()].length;

        //UPDATING THE gameidIdxOfBetter
        gameidIdxOfBetter[_msgSender()][_gameId] = totalBetterGames - 1;

        // UPDATE TOTAL AMOUNT POOLED IN THIS BET IN THIS GAME
        head2headGames[_gameId].totalBetsPooled += betAmount;

        // UPDATE BETTER STATUS TO TRUE FOR THIS GAME
        head2headGames[_gameId].isBetter[_msgSender()] = true;

        // UPDATE BETTERS ARRAY WITH THIS BETTER'S ADDRESS
        head2headGames[_gameId].betters.push(payable(_msgSender()));

        // UPDATE BET INFO FOR THIS BETTER FOR THIS GAME
        uint256 len = head2headGames[_gameId].betters.length;
        head2headGames[_gameId].totalNumberOfBetters = len;
        head2headGames[_gameId].betterIndex[_msgSender()] = len - 1;
        bets[_gameId][_msgSender()] = Head2HeadBet(
            _msgSender(),
            betAmount,
            _stockId,
            block.timestamp,
            0,
            false
        );

        // EMIT BET PLACED EVENT FOR GAME ID, BETTER, STOCK ID, BET AMOUNT
        emit Head2HeadBetPlaced(_gameId, _msgSender(), _stockId, betAmount);
    }

    /**
     * @notice Create Game With Given Info
     * @dev Reverts when
     * BOTH OF STOCK IDs ARE SAME
     * ANY OF THE STOCK IDs ARE ZERO
     * @param _stockIds integer array of stock IDs
     * @param _minBetAmountInWei minimum bet amount
     * @param _winningMultiplierBasisPoints winning multiplier for winning betters
     * @param _startGameTimeStamp timestamp when game will start
     * @param _endGameTimestamp timestamp when game will end
     */
    function createGame(
        bytes12[2] memory _stockIds,
        string[2] memory _stockSymbols,
        uint256 _minBetAmountInWei,
        uint256 _maxBetAmountInWei,
        uint256 _winningMultiplierBasisPoints,
        uint256 _startGameTimeStamp,
        uint256 _endGameTimestamp
    ) external onlyOwner whenNotPaused {
        // string[2] memory _stockSymbols;

        // _stockSymbols[0] = stockDetailsContract.stockIdToSymbol(_stockIds[0]);
        // _stockSymbols[1] = stockDetailsContract.stockIdToSymbol(_stockIds[1]);

        // if(keccak256(abi.encodePacked(_stockSymbols[0])) == keccak256(abi.encodePacked("")) ||
        //   keccak256(abi.encodePacked(_stockSymbols[1])) == keccak256(abi.encodePacked(""))
        // ){
        //     revert Head2Head__WrongStockIds(_stockIds[0], _stockIds[1]);
        // }
        // if (_stockIds[0] == _stockIds[1]) {
        //     revert Head2Head__WrongStockIds(_stockIds[0], _stockIds[1]);
        // }
        if (_startGameTimeStamp >= _endGameTimestamp) {
            revert Head2Head__WrongTimestamps();
        }
        uint256 currentTimestamp = block.timestamp;

        // INCREMENT GAME ID
        gameId += 1;

        // UPDATE HEAD 2 HEAD CREATION GAME INFO
        head2headGames[gameId].createGameTimestamp = currentTimestamp;
        head2headGames[gameId].startGameTimestamp = _startGameTimeStamp;
        head2headGames[gameId].endGameTimestamp = _endGameTimestamp;
        head2headGames[gameId].minBetAmountInWei = _minBetAmountInWei;
        head2headGames[gameId].maxBetAmountInWei = _maxBetAmountInWei;
        head2headGames[gameId].stockIds = _stockIds;
        head2headGames[gameId].stockSymbols = _stockSymbols;
        head2headGames[gameId]
            .winningMultiplierBasisPoints = _winningMultiplierBasisPoints;

        // UPDATE STOCK STATUS IN THIS GAME
        head2headGames[gameId].isStockInGame[_stockIds[0]] = true;
        head2headGames[gameId].isStockInGame[_stockIds[1]] = true;

        // EMIT EVENT WHEN HEAD 2 HEAD GAME IS CREATED WIT STOCK IDS, START ANND END TIME, MIN BET AMOUNT
        emit Head2HeadGameCreated(
            gameId,
            _stockIds,
            _stockSymbols,
            _winningMultiplierBasisPoints,
            _startGameTimeStamp,
            _endGameTimestamp,
            _minBetAmountInWei,
            _maxBetAmountInWei
        );
    }

    /**
     * @notice Return Game Status
     * @param _gameId Game ID to return status
     * @return status GameStatus Status of the game for given game ID
     */
    function getGameStatus(uint256 _gameId)
        public
        view
        returns (GameStatus status)
    {
        /**
         *  IF START__TIME IS ZERO THEN RETURN GAME STATUS AS NONEXISTENT
         *  ELSE IF CURR__TIME IS LESS THAN START__GAME THEN RETURN GAME STATUS AS CREATED
         *  ELSE IF CURR__TIME IS LESS THAN END__TIME THEN RETURN GAME STATUS AS STARTED
         *  ELSE RETURN GAMESTATUS AS ENDED
         */

        uint256 currentTimestamp = block.timestamp;
        uint256 startGameTimestamp = head2headGames[_gameId].startGameTimestamp;
        uint256 endGameTimestamp = head2headGames[_gameId].endGameTimestamp;

        if (startGameTimestamp == 0) {
            return GameStatus.NONEXISTENT;
        } else if (currentTimestamp < startGameTimestamp) {
            return GameStatus.CREATED;
        } else if (currentTimestamp < endGameTimestamp) {
            return GameStatus.STARTED;
        } else {
            return GameStatus.ENDED;
        }
    }

    /**
     * @notice Update Results for this game ID
     * @dev Revert
     * When stock ID is not present in this game ,
     * Revert if game is forfeited ,
     * Revert if sender is not the owner ,
     * Revert when length is mismatch for given arrays ,
     * Revert when game is not ended ,
     * Revert when rewards are already distributed ,
     * Emit event
     * @param _gameId Game Id of which results has to be updated
     * @param _stockIds stock IDs in this game
     * @param _startGameStockPricesInWei Start Game Prices
     * @param _endGameStockPricesInWei End Game Prices
     * @param _winningStockId  Winning Stock Id
     */
    function updateResults(
        uint256 _gameId,
        bytes12[2] memory _stockIds,
        uint256[2] memory _startGameStockPricesInWei,
        uint256[2] memory _endGameStockPricesInWei,
        bytes12 _winningStockId
    ) external onlyOwner {
        // CHECKS FOR UPDATING THE RESULTS

        if (head2headGames[_gameId].isForfeited) {
            revert Head2Head__GameForfeited();
        } else if (getGameStatus(_gameId) != GameStatus.ENDED) {
            revert Head2Head__GameNotEnded();
        } else if (!head2headGames[_gameId].isStockInGame[_winningStockId]) {
            revert Head2Head__StockIdNotInGame(_gameId, _winningStockId);
        } else if (
            _startGameStockPricesInWei.length != 2 ||
            _endGameStockPricesInWei.length != 2 ||
            _stockIds.length != 2
        ) {
            revert Head2Head__ArrayLengthsMismatch();
        } else if (head2headGames[_gameId].rewardsDistributed) {
            revert Head2Head__RewardsAlreadyDistributed();
        }

        Head2HeadGame storage _head2headGames = head2headGames[_gameId];

        //UPDATE START AND END GAME STOCK PRICES AND WINNING STOCK ID
        for (uint256 i = 0; i < _stockIds.length; ++i) {
            _head2headGames.startGameStockPricesInWei[
                    _stockIds[i]
                ] = _startGameStockPricesInWei[i];
            _head2headGames.endGameStockPricesInWei[
                _stockIds[i]
            ] = _endGameStockPricesInWei[i];
        }

        _head2headGames.winningStockId = _winningStockId;

        emit Head2HeadPricesUpdated(
            _gameId,
            _stockIds,
            _startGameStockPricesInWei,
            _endGameStockPricesInWei
        );
        emit Head2HeadWinningStockUpdated(_gameId, _winningStockId);
    }

    /**
     * @notice Distribute Rewards for this game ID
     * @dev Revert
     * Revert if game is forfeited ,
     * Revert when rewards are already distributed ,
     * Revert when winning stock is not calculated for this game ID ,
     * Revert when length is mismatch for given arrays ,
     * Revert when game is not ended ,
     * Emit event
     * @param _gameId Game ID of which rewards has to be distributed
     */
    function rewardDistribution(uint256 _gameId) public onlyOwner {
        bytes12 winningStockId = head2headGames[_gameId].winningStockId;

        // SUFFICIEND CHECK FOR DISTRIBUTING REWARDS
        if (head2headGames[_gameId].isForfeited) {
            revert Head2Head__GameForfeited();
        } else if (head2headGames[_gameId].rewardsDistributed) {
            revert Head2Head__RewardsAlreadyDistributed();
        } else if (winningStockId == bytes12(0)) {
            revert Head2Head__WinningStockNotCalculated();
        }

        // UPDATE REWARD DISTRIBUTED STATUS FOR THIS GAME ID
        address payable[] memory betters = head2headGames[_gameId].betters;
        uint256 len = betters.length;
        head2headGames[_gameId].rewardsDistributed = true;

        // UPDATE BETTER'S INFO IF THEY WIN AND DISTRIBUTE REWARDS
        for (uint256 i = 0; i < len; ++i) {
            if ((bets[_gameId][betters[i]].stockId) == (winningStockId)) {
                uint256 _betAmount = bets[_gameId][betters[i]].betAmount;
                uint256 _winAmount = (_betAmount *
                    head2headGames[_gameId].winningMultiplierBasisPoints) / 100;
                bets[_gameId][betters[i]].win = true;
                bets[_gameId][betters[i]].winAmount = _winAmount;

                betters[i].transfer(_winAmount);
                emit Head2HeadGameWinAmountSent(
                    _gameId,
                    betters[i],
                    winningStockId,
                    _winAmount
                );
            }
        }
    }

    /**
     * @notice Update Bet Amount For This Game ID
     * @dev Revert
     * Revert When Game Is Started, Not Exist, Ended, Forfeited ,
     * Revert When Given Stock Id does not match with Betted Stock Id
     * Revert When Caller has not bet on this game before
     * Emit event
     * @param _gameId game ID of which bet has to be updated
     * @param _stockId stock ID
     * @param _updateBetAmount updated bet amount
     */
    function updateBetAmount(
        uint256 _gameId,
        bytes12 _stockId,
        uint256 _updateBetAmount
    ) external payable whenNotPaused {
        // SUFFICIENT CHECKS FOR UPDATING BET INFO
        if (getGameStatus(_gameId) != GameStatus.CREATED) {
            revert Head2Head__WrongGameStatus();
        }
        if (
            (bets[_gameId][_msgSender()].stockId) != (_stockId) ||
            bets[_gameId][_msgSender()].timestamp == 0
        ) {
            revert Head2Head__BetDoesNotExist();
        }

        uint256 betAmountValueSent = msg.value;
        uint256 prevBetAmount = bets[_gameId][_msgSender()].betAmount;

        if (betAmountValueSent == 0) {
            // WHEN VALUE SENT IS ZERO MEANS DECREASE THE BET to be equal to UpdateBet amount
            if (
                _updateBetAmount < head2headGames[_gameId].minBetAmountInWei ||
                _updateBetAmount > prevBetAmount ||
                _updateBetAmount == 0
            ) {
                // REVERT WHEN NEW BET IS (LESS THAN MIN BET VALUE OR GREATER THAN PREV BET VALUE OR ZERO)
                revert Head2Head__InvalidBetAmount();
            }

            // UPDATE BETS INFO OF THIS GAME FOR THIS USER
            uint256 returnBetAmount = prevBetAmount - _updateBetAmount;
            bets[_gameId][_msgSender()].betAmount = _updateBetAmount;
            bets[_gameId][_msgSender()].timestamp = block.timestamp;
            head2headGames[_gameId].totalBetsPooled -= returnBetAmount;
            address payable better = payable(_msgSender());
            better.transfer(returnBetAmount);

            emit Head2HeadUpdateOrCancelBetAmountReturned(
                _gameId,
                _msgSender(),
                _stockId,
                returnBetAmount
            );
            emit Head2HeadBetUpdated(
                _gameId,
                _msgSender(),
                _stockId,
                prevBetAmount,
                _updateBetAmount
            );
        } else {
            // VALUE MISMATCH
            uint256 finalBetAmount = prevBetAmount + _updateBetAmount;
            if (betAmountValueSent != _updateBetAmount) {
                revert Head2Head__InvalidBetAmount();
            }
            if (finalBetAmount > head2headGames[_gameId].maxBetAmountInWei) {
                revert Head2Head__InvalidBetAmount();
            }
            // UPDATE BETS INFO OF THIS GAME FOR THIS USER
            bets[_gameId][_msgSender()].betAmount = finalBetAmount;
            bets[_gameId][_msgSender()].timestamp = block.timestamp;
            head2headGames[_gameId].totalBetsPooled += betAmountValueSent;

            emit Head2HeadBetUpdated(
                _gameId,
                _msgSender(),
                _stockId,
                prevBetAmount,
                finalBetAmount
            );
        }
    }

    /**
     * @notice Cancel Bet For This Game ID
     * @dev Revert
     * Revert When Game Is Started, Not Exist, Ended, Forfeited ,
     * Revert When Given Stock Id does not match with Betted Stock Id
     * Revert When Caller has not bet on this game before
     * Emit event
     * @param _gameId game ID of which bet has to be cancel
     * @param _stockId stock ID
     */
    function cancelBet(uint256 _gameId, bytes12 _stockId)
        external
        whenNotPaused
    {
        // SUFFICIENT CHECKS

        if (getGameStatus(_gameId) != GameStatus.CREATED) {
            revert Head2Head__WrongGameStatus();
        }
        if (
            (bets[_gameId][_msgSender()].stockId) != (_stockId) ||
            bets[_gameId][_msgSender()].timestamp == 0
        ) {
            revert Head2Head__BetDoesNotExist();
        }

        // UPDATE BETTER INDEX AND BET INFO

        uint256 betAmount = bets[_gameId][_msgSender()].betAmount;
        uint256 bettersLength = head2headGames[_gameId].betters.length;
        uint256 delIdx = head2headGames[_gameId].betterIndex[_msgSender()];
        address lastAddress = head2headGames[_gameId].betters[
            bettersLength - 1
        ];

        head2headGames[_gameId].betterIndex[lastAddress] = delIdx;
        head2headGames[_gameId].betters[delIdx] = payable(lastAddress);
        head2headGames[_gameId].betters.pop();
        head2headGames[_gameId].isBetter[_msgSender()] = false;
        head2headGames[_gameId].totalNumberOfBetters = bettersLength - 1;

        delete head2headGames[_gameId].betterIndex[_msgSender()];
        delete bets[_gameId][_msgSender()]; //.betAmount = 0;
        head2headGames[_gameId].totalBetsPooled -= betAmount;

        // REMOVE GAME ID FROM BETTER GAMEIDS
        uint256 totalGamesOfBetter = betterGameIds[_msgSender()].length;
        delIdx = gameidIdxOfBetter[_msgSender()][_gameId];
        uint256 lastGameId = betterGameIds[_msgSender()][
            totalGamesOfBetter - 1
        ];

        gameidIdxOfBetter[_msgSender()][lastGameId] = delIdx;
        betterGameIds[_msgSender()][delIdx] = lastGameId;
        betterGameIds[_msgSender()].pop();

        // TRANSFER BET AMOUNT AFTER CANCEL
        address payable better = payable(_msgSender());
        better.transfer(betAmount);
        emit Head2HeadUpdateOrCancelBetAmountReturned(
            _gameId,
            _msgSender(),
            _stockId,
            betAmount
        );
        emit Head2HeadBetCancelled(_gameId, _msgSender(), _stockId);
    }

    /**
     * @notice To forfeit game and return back bet amount of betters of given _gameId
     * @dev marks the gameId as forfeited
     * returns all the betters their betAmount
     * this function can be used when there is an error loading stock prices
     * @param _gameId Game id to be forfeited.
     */
    function emergencyWithdrawFunds(uint256 _gameId) external onlyOwner {
        address payable[] memory betters = head2headGames[_gameId].betters;
        uint256 len = betters.length;
        // MARKING THE GAME AS FORFEITED
        head2headGames[_gameId].isForfeited = true;

        for (uint256 i = 0; i < len; ++i) {
            uint256 betAmount = bets[_gameId][betters[i]].betAmount;
            bytes12 stockId = bets[_gameId][betters[i]].stockId;
            // CHANGING BET AMOUNT TO 0
            bets[_gameId][betters[i]].betAmount = 0;
            // TRANSFERRING THE BETAMOUNT TO THE BETTER
            betters[i].transfer(betAmount);

            // EMIT EVENT FOR FUNDS WITHDRAWAL OF GAMEID, BETTER, BETTINGSTOCK, BETAMOUNT
            emit Head2HeadEmergencyFundsWithdraw(
                _gameId,
                betters[i],
                stockId,
                betAmount
            );
        }
    }

    //** getter functions*/
    function getBetOfUserInGameId(uint256 _gameID, address _better)
        public
        view
        returns (Head2HeadBet memory)
    {
        return bets[_gameID][_better];
    }

    function getEndGameStockPriceOfStockId(uint256 _gameId, bytes12 _stockId)
        public
        view
        returns (uint256)
    {
        return head2headGames[_gameId].endGameStockPricesInWei[_stockId];
    }

    function getStartGameStockPriceOfStockId(uint256 _gameId, bytes12 _stockId)
        public
        view
        returns (uint256)
    {
        return head2headGames[_gameId].startGameStockPricesInWei[_stockId];
    }

    function getIsBetter(uint256 _gameId, address _better)
        public
        view
        returns (bool)
    {
        return head2headGames[_gameId].isBetter[_better];
    }

    function getBetterIndex(uint256 _gameId, address _better)
        public
        view
        returns (uint256)
    {
        require(head2headGames[_gameId].isBetter[_better], "Not a better");
        return head2headGames[_gameId].betterIndex[_better];
    }

    function getGameBetters(
        uint256 _gameId,
        uint256 startIdx,
        uint256 endIdx
    ) public view returns (address payable[] memory) {
        uint256 totalNumberOfBetters = head2headGames[_gameId]
            .totalNumberOfBetters;
        if (startIdx > endIdx || startIdx >= totalNumberOfBetters) {
            revert Head2Head__WrongIdxs(startIdx, endIdx);
        }
        address payable[] memory _betters = head2headGames[_gameId].betters;
        if (totalNumberOfBetters == 0) {
            return _betters;
        }
        if (totalNumberOfBetters - 1 < endIdx) {
            endIdx = totalNumberOfBetters - 1;
        }
        uint256 requiredLength = endIdx - startIdx + 1;
        address payable[] memory requiredBetters = new address payable[](
            requiredLength
        );
        uint256 curIdx = 0;
        for (uint256 i = startIdx; i <= endIdx; ++i) {
            requiredBetters[curIdx] = _betters[i];
            curIdx += 1;
        }
        return requiredBetters;
    }

    function getGameBets(
        uint256 _gameId,
        uint256 startIdx,
        uint256 endIdx
    ) public view returns (Head2HeadBet[] memory) {
        if (startIdx > endIdx) {
            revert Head2Head__WrongIdxs(startIdx, endIdx);
        }
        address payable[] memory _betters = head2headGames[_gameId].betters;
        uint256 totalNumberOfBetters = head2headGames[_gameId]
            .totalNumberOfBetters;
        if (totalNumberOfBetters - 1 < endIdx) {
            endIdx = totalNumberOfBetters - 1;
        }
        uint256 requiredLength = endIdx - startIdx + 1;
        Head2HeadBet[] memory requiredBets = new Head2HeadBet[](requiredLength);
        uint256 curIdx = 0;
        for (uint256 i = startIdx; i <= endIdx; ++i) {
            requiredBets[curIdx] = bets[_gameId][_betters[i]];
            curIdx += 1;
        }
        return requiredBets;
    }

    function getIsStockInGame(uint256 _gameId, bytes12 _stockId)
        public
        view
        returns (bool)
    {
        return head2headGames[_gameId].isStockInGame[_stockId];
    }
    function getInGameStockIds(uint _gameId) public view returns(bytes12[2] memory){
        return head2headGames[_gameId].stockIds;
    }
    function getInGameStockSymbols(uint _gameId) public view returns(string[2] memory){
        return head2headGames[_gameId].stockSymbols;
    }
}

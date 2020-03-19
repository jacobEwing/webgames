// a class for representing a cribbage board
function cribbageBoardClass(){
	var image, width, height, div;
	var posx, posy;
	var holes;
	var endScore;
	var peg, pegXOffset, pegYOffset, pegScore;
	var n;

	this.setScore = function(playerNum, newScore){
		var n = 0;
		if(this.pegScore[playerNum][1] < this.pegScore[playerNum][0]) n = 1;
		if(newScore > this.pegScore[playerNum][n]){
			this.placePeg(playerNum, n, newScore);
		}
	}

	this.placePeg = function(playerNum, pegNum, holeNum){
		this.pegScore[playerNum][pegNum] = holeNum;
		if(holeNum < 1){
			this.peg[playerNum][pegNum].setPos(
				1 * this.holes['starter'][playerNum][holeNum + 1][0] + 1 * this.pegXOffset,
				1 * this.holes['starter'][playerNum][holeNum + 1][1] + 1 * this.pegYOffset
			);
		}else if(holeNum < this.endScore){
			this.peg[playerNum][pegNum].setPos(
				1 * this.holes['pegging'][playerNum][holeNum - 1][0] + 1 * this.pegXOffset,
				1 * this.holes['pegging'][playerNum][holeNum - 1][1] + 1 * this.pegYOffset
			);
		}else{
			this.peg[playerNum][pegNum].setPos(
				1 * this.holes['finish'][0] + 1 * this.pegXOffset,
				1 * this.holes['finish'][1] + 1 * this.pegYOffset
			);
		}

		// make sure the pegs are layered properly
		peg1 = this.peg[playerNum][0];
		peg2 = this.peg[playerNum][1];
		if(peg1.posY < peg2.posY){
			peg1.element.insertBefore(peg2.element);
		}else{
			peg2.element.insertBefore(peg1.element);
		}
	}

	// do the initialization
	this.endScore = _g[1];

	// first we'll build our divs
	this.div = $('<div id="board"><img src="' + _g[3] + '"></div>');
	this.posy = (GAME_HEIGHT - _g[5]) >> 1;
	this.posx = this.posy;
	this.div.css('position', 'absolute');
	this.div.css({'left':this.posx + 'px', 'top':this.posy + 'px'});
	this.div.appendTo($('#gameCanvas'));

	// now let's build the holes and pegs
	this.holes = [];
	this.holes['starter'] = [];
	this.holes['pegging'] = [];
	this.peg = [];
	this.pegScore = [];
	this.pegWidth = _p[0];
	this.pegHeight = _p[1];
	this.pegXOffset = _p[2];
	this.pegYOffset = _p[3];
	radius = Math.sqrt(this.pegWidth * this.pegWidth + this.pegHeight * this.pegHeigth);
	for(n = 0; n < numPlayers; n++){
		this.holes['starter'][n] = _h[n].s;
		this.holes['pegging'][n] = _h[n].p;
		this.peg[n] = [];
		for(m = 0; m < 2; m++){
			this.peg[n][m] = new itemClass(this.pegWidth, this.pegHeight, $('#board'));
			this.peg[n][m].setImage(_p[4 + n], 0, 0, this.pegWidth, this.pegHeight);
			this.peg[n][m].display(true);
		}
		this.pegScore[n] = [];
		this.pegScore[n][0] = -1;
		this.pegScore[n][1] = 0;
		this.placePeg(n, 0, -1);
		this.placePeg(n, 1, 0);
	}
	this.holes['finish'] = _h.f;
}

// a class for representing a cribbage game 
function cribbageGame(){
	this.globalId = 'GAME_CRIBBAGE';
	globalRefs[this.globalId] = this;

	var draggedItem;
	var dragOffset, dragOffsetLength;
	var dragPosition;
	this.draggedItem = undefined;
	this.draggingCard = false;

	var handSize;
	var gameState;
	var currentPlayer;
	var deck, crib;
	var add_to_crib_size = 2;
	var endScore;
	var dealer;
	var playSet; // <- the temp hand use for counting the plays



	this.handleCardClick = function(x, y, card){
		var allowDrag = false;
		if(this.currentPlayer.type == 'human' || this.gameState == 'waiting_discard'){
			switch(this.gameState){
				case 'waiting_discard':
					if(card.stack == this.humanPlayer.hand){
						allowDrag = true;
					}
					break;
				case 'playing':
					if(card.stack == this.currentPlayer.hand){
						if(this.playTally + this.getCardPointValue(card) <= 31){
							allowDrag = true;
						}
					}
					break;
				case 'cutting':
					if(card.stack == this.deck){
						this.handleCut(card.globalId, 0);
					}
					break;
			}

			if(allowDrag){
				this.dragPosition = [x - card.x, y - card.y];
				this.draggedItem = card;
				this.draggingCard = true; // just to keep track of the fact that it's a card we're dragging
				this.dragOffset = [ // the vector from the center of the card to the mouse location
					this.dragPosition[0] - card.stack.posx,
					this.dragPosition[1] - card.stack.posy
				];
				this.dragOffsetLength = Math.sqrt(this.dragOffset[0] * this.dragOffset[0] + this.dragOffset[1] * this.dragOffset[1]);
			}
		}
	}

	this.handleClick = function(x, y){
	}

	this.handleDrag = function(obj, x, y){
		if(this.draggedItem != undefined){
			if(this.draggedItem.globalId.search('card_') >= 0){
				if(this.dragOffsetLength > 15){
					// this is a card getting dragged
					oldDx = this.dragOffset[0];
					oldDy = this.dragOffset[1];
					newDx = x - this.draggedItem.x - this.draggedItem.stack.posx;
					newDy = y - this.draggedItem.y - this.draggedItem.stack.posy;

					theta = rel_ang(0, 0, newDx, newDy) - rel_ang(0, 0, oldDx, oldDy);

					this.draggedItem.rotate(theta);
					this.dragOffset[0] = newDx;
					this.dragOffset[1] = newDy;

					ul = Math.sqrt(newDx * newDx + newDy * newDy);
					uDx = newDx / ul;
					uDy = newDy / ul;

					x = this.draggedItem.x + uDx * (ul - this.dragOffsetLength);
					y = this.draggedItem.y + uDy * (ul - this.dragOffsetLength);
					this.draggedItem.setPos(x, y);
				}else{
					x -= this.dragPosition[0];
					y -= this.dragPosition[1];
					this.draggedItem.setPos(x, y);
				}
			}
		}
	}

	this.handleRelease = function(e, obj, dragtime, netDelta){
		switch(this.gameState){
			case 'waiting_discard':
				if(this.draggingCard == true){
					pos = $('#gameWrapper').offset();
					x = e.pageX - pos.left;
					y = e.pageY - pos.top;
					delta = hypotenuse(x, y, this.crib.posx, this.crib.posy);
					if(delta < 100){
						obj.flip(100, 5);
						obj.stack.passCard(this.crib, obj.stack.getCardPos(obj));
						this.crib.stack(0, 0, 2, 0.5, true);
						if(this.humanPlayer.hand.numCards == 4){
							this.humanPlayer.hand.fan(false, null, true);
								eval("globalRefs['" + this.globalId + "'].play();");
						}
					}
				}
				break;
			case 'playing':
				if(this.draggingCard == true){
				
					pos = $('#gameWrapper').offset();
					x = e.pageX - pos.left;
					y = e.pageY - pos.top;
					delta = hypotenuse(x, y, this.humanPlayer.playStack.posx, this.humanPlayer.playStack.posy);
					if(delta < 100){
						obj.stack.passCard(this.humanPlayer.playStack, obj.stack.getCardPos(obj));
						this.humanPlayer.playStack.refresh();
						this.humanPlayer.playStack.stack(0, 0, 10, 0, true);
						this.processCardPlay(this.humanPlayer, obj);
					}
				}

			default:
		}
		this.draggingCard = false;
		this.draggedItem = undefined;
	}

	this.nextPlayer = function(){
		this.currentPlayerNum = (this.currentPlayerNum + 1) % numPlayers;
		this.currentPlayer = player[this.currentPlayerNum];
		eval("globalRefs['" + this.globalId + "'].play();");
	}

	// scaffolding - this should eventually get info from the user regarding the options
	// they want when playing the game (# of players, types of players, etc.)
	this.getConfiguration = function(){
		$('#swapDiv').load('cribbage.php', null, function(){
			var game = globalRefs['GAME_CRIBBAGE'];
			numPlayers = _g[0];
			game.endScore = _g[1];
			game.handSize = _g[2];
			setTimeout('globalRefs["GAME_CRIBBAGE"].initialize(1);', 1);
		});
	}

	// scaffolding - this should eventually prompt the user for info
	this.getPlayerInfo = function(){
//		player[0] = new playerClass('human');
//		player[1] = new playerClass('ai');

		for(var n = 0; n < numPlayers; n++){
			if(player[n].type == 'human') {
				this.humanPlayer = player[n];
			}
			player[n].score = 0;
//			player[n].getName();
			player[n].draw();
			player[n].playStack = new cardStack();
			player[n].playStack.setParentDiv('#gameCanvas');
		}


		player[0].position(GAME_WIDTH >> 1, GAME_HEIGHT - 90);
		player[0].dealX = GAME_WIDTH >> 2;
		player[0].dealY = GAME_HEIGHT + 80;
		player[0].playStack.position(GAME_WIDTH >> 1, GAME_HEIGHT - 120 - CARD_HEIGHT);
		player[0].textColour = '#FFA';

		player[1].position(GAME_WIDTH >> 1, 70);
		player[1].dealX = GAME_WIDTH >> 2;
		player[1].dealY = - 80;
		player[1].playStack.position(GAME_WIDTH >> 1, 100 + CARD_HEIGHT);
		player[1].textColour = '#AFF';

		eval('globalRefs["' + this.globalId + '"].initialize(3);');
	}

	// take the data that we've already loaded and use it to build the cribbage board
	this.buildBoard = function(){
		this.board = new cribbageBoardClass();
		eval('globalRefs["' + this.globalId + '"].initialize(2);');
	}

	this.start = function(){
		this.initialize(0);
	}

	this.initialize = function(step){
		if(step == undefined) step = 0;
		switch(step){
			case 0:
				// get the game configuration and player info
				this.getConfiguration();
				break;
			case 1:
				// prepare the board
				this.buildBoard();
				break;
			case 2:
				// get the player info
				this.getPlayerInfo();
				break;
			case 3:
				// now we'll actually assemble the game itself

				// some css touchups
				$('#console').css({
					'top': '10px', 
					'left': '500px',
					'height' : '220px',
					'width' : '280px'
				});

				// create our deck
				this.deck = new cardStack();
				this.deck.setParentDiv('#gameCanvas');
				this.deck.buildDeck('images/back3.jpg');

				// set up the crib
				this.crib = new cardStack();
				cribX = GAME_WIDTH - (CARD_WIDTH) - 15;
				cribY = GAME_HEIGHT >> 1;
				cribBack = $('<div id="cribBack"><img src="images/slot.png"></div>');
				cribBack.css('position', 'absolute');
				cribBack.css('left', (cribX - (CARD_WIDTH >> 1) - 8) + 'px');
				cribBack.css('top', (cribY - (CARD_HEIGHT >> 1) - 6) + 'px');

				this.crib.setParentDiv('#gameCanvas');
				$('<div id="cribLabel" class="stackLabel" style="top:' + (CARD_HEIGHT * 0.9) + 'px; left:' + 0 + 'px;width:auto"></div>').appendTo(cribBack);
				this.crib.position(cribX, cribY);

				// specify who the dealer is
				this.dealerNum = 0;
				this.dealer = player[this.dealerNum];
				$('#cribLabel').html(this.dealer.name + "'s Crib");

				// let's layer stuff properly...
				this.crib.moveToBottom();
				$('#gameCanvas').prepend(cribBack);
				$('#cribLabel').html(this.dealer.name + "'s Crib");
				this.crib.moveToTop();
				for(var n = 0; n < numPlayers; n++){
					player[n].hand.moveToTop();
				}

				// and get this show on the road
				this.deck.shuffle();
				this.deck.faceDown();
				this.deck.position(player[this.dealerNum].dealX, player[this.dealerNum].dealY);
				this.deck.stack(0, 0, 0.25, 0.125);
				this.cutCard = null;

				this.play();
		}
	}

	this.setGameState = function(state){
		switch(state){
			case 'dealing':
			case 'discarding':
			case 'waiting_discard':
			case 'cutting':
			case 'playing':
			case 'pegging':
			case 'end_round':
				if(this.gameState != 'end_game') this.gameState = state;
				break;

			case 'end_game':
			case 'new_game':
				this.gameState = state;
				break;
			default:
				error("&quot;" + state + "&quot; is an invalid game state");
		}
	}

	this.play = function(){
		var n;
		if(this.gameState == undefined) this.setGameState('dealing');
		switch(this.gameState){
			case 'dealing':
				this.deal();
				break;

			case 'discarding':
//				this.currentPlayerNum = (this.dealerNum + 1) % numPlayers;
//				this.currentPlayer = player[this.currentPlayerNum];
				this.setGameState('waiting_discard');
				this.discard();
				break;

			case 'waiting_discard':
				for(n = 0; n < numPlayers && player[n].hand.numCards == 4; n++);
				if(n >= numPlayers){
					this.setGameState('cutting');
					write("Cutting the deck");
					this.currentPlayer = player[(this.dealerNum + 1) % numPlayers];
					this.cut();
				}
				break;

			case 'cutting': // nothing to do here really - might want to drop it
				break;

			case 'playing':
				this.currentPlayerNum = (this.dealerNum + 1) % numPlayers;
				this.currentPlayer = player[this.currentPlayerNum];
				this.playTally = 0; // the count while people play their hands
				this.playSet = []; // an array in which the sequence of cards played is stored
				this.totalCardsPlayed = 0;
				this.playHands();
				break;

			case 'pegging':
				write('pegging hands');
				this.currentPlayerNum = (this.dealerNum + 1) % numPlayers;
				this.currentPlayer = player[this.currentPlayerNum];
				this.pegHands((this.dealerNum + 1) % numPlayers);
				break;

			case 'end_round':
				setTimeout('globalRefs["' + this.globalId + '"].collectCards();', 2000); // FIXME -- this needs to wait for all players to acknowledge the round end
				break;

			case 'end_game':
				write('the game has ended');
				break;
		}
	}

	this.collectCards = function(){
		var n;
		var passedACard;
		do{
			passedACard = false;
			passedACard |= this.crib.passCard(this.deck);
			for(n = 0; n < numPlayers; n++){
				passedACard |= player[n].hand.passCard(this.deck);
				passedACard |= player[n].playStack.passCard(this.deck);
			}
		}while(passedACard != false);
		this.deck.faceDown();
		this.deck.shuffle();
		this.deck.stack(0, 0, 0.4, 0.2, false);//true, 'globalRefs["' + this.globalId + '"].newRound();');
		this.newRound();
	}

	this.newRound = function(){
		write('<div style="background-color:#FFF;color:#060;text-align:center">Next Hand</div>', undefined, false);
		// specify who the dealer is
		this.dealerNum = (this.dealerNum + 1) % numPlayers;
		this.dealer = player[this.dealerNum];
		$('#cribLabel').html(this.dealer.name + "'s Crib");

		this.setGameState('dealing');
		this.play();
	}

	// let the player after the dealer cut the deck
	this.cut = function(){
		this.setGameState('cutting');
		write(this.currentPlayer.name + " cuts the deck: ");
		switch(this.currentPlayer.type){
			case 'human':
				// do nothing.  We're waiting for the human player
				break;
			case 'ai':
				setTimeout("globalRefs['" + this.globalId + "'].AICutDeck(" + "globalRefs['" + this.globalId + "'].currentPlayer);", 1000);
				break;
			case 'remote':
				break;
		}
	}

	this.discard = function(){
		for(var n = 0; n < numPlayers; n++){
			switch(player[n].type){
				case 'human':
					write("Place two of your cards in the crib");
					break;
				case 'ai':
					this.AICutHand(player[n])
					break;
				case 'remote':
					break;
			}
		}
	}

	this.incrementScore = function(p, amount){
		if(amount == 0) return;

		var playerNum;
		for(playerNum in player){
			if(player[playerNum] == p) break;
		}
		p.score += amount;
		this.board.setScore(playerNum, p.score);
		if(p.score >= this.endScore){
			this.setGameState('end_game');
		}
	}

	this.playHands = function(){
		switch(this.currentPlayer.type){
			case 'human':
				if(this.playTally != undefined){
					for(var n = 0; n < this.currentPlayer.hand.numCards && this.playTally + this.getCardPointValue(this.currentPlayer.hand.card[n]) > 31; n++);
					if(n >= this.currentPlayer.hand.numCards){
						// this player can't play, so we'll let them pass.
						// this should later be handled with user IO instead of being automatic
						this.processCardPlay(this.currentPlayer, null);
					}
				}else{
					write(this.currentPlayer.name + ', play a card');
				}
				break;
			case 'ai':
				// use a delay to make the AI bot feel a little more natural
				setTimeout("globalRefs['" + this.globalId + "'].AIPlayHand(" + "globalRefs['" + this.globalId + "'].currentPlayer);", 1500);
				break;
			case 'remote':
				break;
		}
	}

	this.getCardPointValue = function(card){
		switch(card.rank){
			case 'A': returnval = 1; break;
			case 'T': case 'J': case 'Q': case 'K': returnval = 10; break;
			default: returnval = card.rank;
		}
		return returnval;
	}

	this.processCardPlay = function(activePlayer, card){
		var n, m; 
		var doneRound = false;
		var playerPassed = false;
		var testSet, resetCount = false;
		if(card == null){
			// this player has passed
			if(activePlayer == this.lastPlayer){
				resetCount = true;
				this.incrementScore(activePlayer, 1);
				activePlayer.say('one for a go');
			}else{
				this.currentPlayer.say('go');
				playerPassed = true;
			}
		}else{
			// process the card played
			this.totalCardsPlayed++;
			doneRound = (this.totalCardsPlayed == numPlayers << 2);
			this.lastPlayer = activePlayer;

			// get the numbers we need for calculating points
			this.playTally += this.getCardPointValue(card);
			this.playSet[this.playSet.length] = {
				'rank' : card.rank,
				'suit' : card.suit,
				'order' : card.getIndex()
			}

			saidCount = false;
			// check for fifteens
			if(this.playTally == 15){
				activePlayer.say("Fifteen for two");
				saidCount = true;
				this.incrementScore(activePlayer, 2);
			}

			// check for end of play points
			if(this.playTally == 31){
				resetCount = true;
				this.incrementScore(activePlayer, 2);
				activePlayer.say("Thirty-one for two");
				saidCount = true;
			}else if(doneRound){
				// we get a "go"
				if(saidCount){
					activePlayer.say('one for a go');
				}else{
					activePlayer.say(this.playTally + ', one for a go');
				}
				saidCount = true;
				this.incrementScore(activePlayer, 1);
			}

			if(!saidCount){
				// no points, just say the number and continue
				activePlayer.say(this.playTally);
			}

			// check for pairs, pair royals, etc.
			m = 1;
			for(n = this.playSet.length - 1; n > 0 && this.playSet[n].rank == this.playSet[n - 1].rank; n--) m++;
			if(m >= 2){
				this.incrementScore(activePlayer, (m * (m - 1))); 
				if(m == 2){
					activePlayer.say('pair for two');
				}else if(m == 3){
					activePlayer.say('pair royal for ' + (m * (m - 1))); 
				}else{
					activePlayer.say('double royal for ' + (m * (m - 1))); 
				}
			}

			// check for runs
			var runcount = 3;
			var bestRun = 0;
			var haveRun;
			for(n = 3; n <= this.playSet.length; n++){
				testSet = [];
				for(m = 0; m < n; m++){
					testSet[m] = this.playSet[this.playSet.length - 1 - m];
				}
				testSet = this.sortTestSet(testSet);
				haveRun = true;
				for(m = 1; m < n; m++){
					if(testSet[m].order != testSet[m - 1].order + 1){
						haveRun = false;
					}
				}
				if(haveRun) bestRun = n;
			}

			if(bestRun != 0){
				activePlayer.say("run for " + bestRun);
				this.incrementScore(activePlayer, bestRun);
			}
		}

		if(resetCount){
			this.playTally = 0;
			this.playSet = [];
		}

		if(this.gameState == 'end_game'){
			setTimeout("globalRefs['" + this.globalId + "'].play();", 500); // avoid excessive callstack with timeouts
		}else if(doneRound){
			this.setGameState('pegging');
			setTimeout("globalRefs['" + this.globalId + "'].play();", 500);
		}else{
			lastPlayerNum = this.currentPlayerNum;
			do{
				this.currentPlayerNum = (this.currentPlayerNum + 1) % numPlayers;
				this.currentPlayer = player[this.currentPlayerNum];
			}while(this.currentPlayer.hand.numCards == 0);

			if(this.currentPlayerNum == lastPlayerNum && playerPassed == true){
				// this player just passed, did not play the last card, but is the only one with cards left
				this.lastPlayer.say('one for a go');
				this.incrementScore(this.lastPlayer, 1);
				this.playTally = 0;
				this.playSet = [];
			}
			this.playHands();
		}
	}

	this.AIPlayHand = function(AIPlayer){
		var hand = AIPlayer.hand;
		var card = null;
		if(AIPlayer.hand.numCards != 0){
			for(n = 0; n < AIPlayer.hand.numCards && card == null; n++){
				if(this.playTally + this.getCardPointValue(AIPlayer.hand.card[n]) <= 31){
					card = hand.card[n];
					cardIndex = n;
				}
			}

			if(card != null){
				AIPlayer.hand.passCard(AIPlayer.playStack, cardIndex);
				card.flip(200, 5);
				AIPlayer.playStack.refresh();
				AIPlayer.playStack.stack(0, 0, 10, 0, true);
			}
		}
		this.processCardPlay(AIPlayer, card);
	}

	this.pegHands = function(playerNum, doCrib){
		if(doCrib != undefined){
			this.countCrib(this.dealer);
			if(this.gameState != 'end_game'){
				this.setGameState('end_round');
			}
			// avoid excessive callstack with timeouts
			setTimeout("globalRefs['" + this.globalId + "'].play();", 100);
		}else{
			this.countHand(player[playerNum]);
			if(this.gameState != 'end_game'){
				if(player[playerNum] == this.dealer){
					// we need to count the crib
					this.crib.stack(
						this.dealer.hand.posx - this.crib.posx,
						this.dealer.hand.posy - this.crib.posy, 10, 0, true,
						"globalRefs['" + this.globalId + "'].pegHands(" + playerNum + ", true);"
					);
					this.crib.flipCards(400, 20);
				}else{
					// move to the next player
					setTimeout("globalRefs['" + this.globalId + "'].pegHands(" + ((playerNum + 1) % numPlayers) + ");", 1000);
				}
			}else{
				setTimeout("globalRefs['" + this.globalId + "'].play();", 100);
			}
		}
	}

	this.countHand = function(player){
		var score = 0;
		var message = '';
		var cardSet = this.buildTestSet(player.playStack, true);
		for(n = 0; n < 5; n++){
			switch(n){
				case 0: results = this.count_fifteens(cardSet); break;
				case 1: results = this.count_runs(cardSet); break;
				case 2: results = this.count_pairs(cardSet); break;
				case 3:
                                        results = this.count_flush(cardSet);
                                        if(results.score == 0){
                                                // no flush when the cut card is included.  Let's try without:
                                                results = this.count_flush(this.buildTestSet(player.playStack, false));
                                        }
                                        break;

				case 4: results = this.count_nobs(cardSet); break;
			}

			if(results.score > 0){
				if(score > 0) message += ', ';
				score += results.score;
				message += results.message;
			}
		}
		if(score > 0){
			player.say(message + ' for a total of ' + score);
		}else{
			player.say('nothing');
		}
		this.incrementScore(player, score);
	}

	this.countCrib = function(player){
		var score = 0;
		var message = '';
		var cardSet = this.buildTestSet(this.crib, true);
		for(n = 0; n < 5; n++){
			switch(n){
				case 0: results = this.count_fifteens(cardSet); break;
				case 1: results = this.count_runs(cardSet); break;
				case 2: results = this.count_pairs(cardSet); break;
				case 3: results = this.count_flush(cardSet); break;
				case 4: results = this.count_nobs(cardSet); break;
			}

			if(results.score > 0){
				if(score > 0) message += ' ';
				score += results.score;
				message += results.message;
			}
		}
		write('and in the crib:');
		player.say(message + ' for a total of ' + score);
		this.incrementScore(player, score);
	}


	// take the card that's been cut, pull it out of the deck, flip it, and place it back on top
	this.handleCut = function(cardId, step){
		card = globalRefs[cardId];
		switch(step){
			case 0:
				animCallback = "globalRefs['" + this.globalId + "'].handleCut('" + cardId + "', 1);";
				card.move(-100, 0, pi / 2, false, 450, 10, animCallback);
				break;
			case 1:
				animCallback = "globalRefs['" + this.globalId + "'].handleCut('" + cardId + "', 2);";
				card.stack.shiftCard(card, 100);
				card.move(16, 8, pi, true, 450, 10, animCallback);
				break;
			case 2:
				this.deck.stack(0, 0, 0.4, 0.2, false);

				// this has to go before the cut, in case the dealer pegs out on nobs
				this.setGameState('playing');

				this.cutCard = card;
				if(this.cutCard.rank == 'J'){
					this.dealer.say("Two for nobs");
					this.incrementScore(this.dealer, 2);
				}else{
					write("It's the " + this.cutCard.getName());
				}

				eval("globalRefs['" + this.globalId + "'].play();");
				break;
		}
	}

	// deal a hand
	this.deal = function(playerNum, count){
		if(playerNum == undefined){
			playerNum = 0;
			count = numPlayers * this.handSize;
		}

		if(count > 0){
			this.deck.passCard(player[playerNum].hand);
			nextPlayer = (playerNum + 1) % numPlayers;
			animCallback = "globalRefs['" + this.globalId + "'].deal(" + nextPlayer + ", " + (count - 1) + ");";
			ang = pi * (2 * Math.random() - 1);
			x = (Math.random() - 0.5) * 80;
			y = (Math.random() - 0.5) * 80;
			player[playerNum].hand.card[player[playerNum].hand.numCards - 1].move(x, y, ang, false, 250, 10, animCallback);
		}else{
			this.deck.position(GAME_WIDTH * 0.75, GAME_HEIGHT >> 1);
			this.deck.stack(0, 0, 0.4, 0.2, false);
			this.fanHands();
		}

	}
	// strictly a helper function to use after dealing out the cards
	this.fanHands = function(playerNum, count){
		if(playerNum == undefined){
			playerNum = (this.dealerNum + 1) % numPlayers;
			count = 0;
		}

		if(count < numPlayers){
			showHand = (player[playerNum].type == 'human');
			nextPlayerNum = (playerNum + 1) % numPlayers;
			callBack = "globalRefs['" + this.globalId + "'].fanHands(" + nextPlayerNum + ", " + (count + 1) + ");";
			player[playerNum].hand.fan(showHand, callBack, true);
		}else{
			this.setGameState('discarding');
			this.currentPlayerNum = (this.dealerNum + 1) % numPlayers;
			this.currentPlayer = player[this.currentPlayerNum];
			eval("globalRefs['" + this.globalId + "'].play();");
		}
		
	}

	this.AICutDeck = function(player){
		cutIndex = this.deck.numCards >> 1;
		this.handleCut(this.deck.card[cutIndex].globalId, 0);
	}

	this.AICutHand = function(player){
		var combo, max, n, numbits, bestcombo, bestscore, score;
		var testHand;
		var numcards;
		cardSet = this.buildTestSet(player.hand, false);
		bestscore = -1;
		numcards = cardSet.length;
		max = 1 << numcards;

		// work out what combination of cards leaves us with the most points in hand
		for(combo = 0; combo < max; combo++){
			numbits = 0; 
			for(n = 0; n < numcards; n++){
				if(combo & (1 << n)) numbits++;
			}
			if(numbits == add_to_crib_size){
				testHand = [];

				// generate the test hand
				m = 0;
				for(n = 0; n < numcards; n++){
					if(!(combo & (1 << n))){
						testHand[m] = cardSet[n];
						m++;
					}    
				}    

				// get the value of it
				score = this.count_fifteens(testHand).score;
				score += this.count_pairs(testHand).score;
				score += this.count_runs(testHand).score;
				score += this.count_flush(testHand).score;
				if(score > bestscore ){
					bestscore = score;
					bestcombo = combo;
				}    
			}    
		}    

		// now pass along the two cards we've decided to drop
		for(n = 0; n < numcards; n++){
			if((1 << n) & bestcombo){
				for(m = 0; m < player.hand.numCards; m++){
					if(player.hand.card[m].rank == cardSet[n].rank && player.hand.card[m].suit == cardSet[n].suit){
						player.hand.passCard(this.crib, m);
						break;
					}
				}
			}
		}
		this.crib.refresh(); // <-- IE is a fucking fucked up fucker of a fucking fuck.  It's the reason that this fucking function call is fucking needed.
		this.crib.stack(0, 0, 2, 0.5, true);
		player.hand.fan(false, null, true);
		eval("globalRefs['" + this.globalId + "'].play();");
	}

	// assembles and sorts a list of card values and ranks, used for point counting
	this.buildTestSet = function(hand, includeCut){
		var returnval = [];
		var n, m, numcards;
		numcards = 0;
		for(n = 0; n < hand.numCards; n++){
			returnval[n] = {'rank':hand.card[n].rank, 'suit':hand.card[n].suit};
			numcards++;
		}
		if(includeCut && this.cutCard != null){
			returnval[n] = {'rank':this.cutCard.rank, 'suit':this.cutCard.suit};
			numcards++;
		}
		for(n = 0; n < numcards; n++){
			switch(returnval[n].rank){
				case 'A':
					returnval[n].order = 1;
					returnval[n].value = 1;
					break;
				case 'T':
					returnval[n].order = 10;
					returnval[n].value = 10;
					break;
				case 'J':
					returnval[n].order = 11;
					returnval[n].value = 10;
					break;
				case 'Q':
					returnval[n].order = 12;
					returnval[n].value = 10;
					break;
				case 'K':
					returnval[n].order = 13;
					returnval[n].value = 10;
					break;
				default:
					returnval[n].value = returnval[n].order = returnval[n].rank;
			}
		}

		return this.sortTestSet(returnval);
	}

	this.sortTestSet = function(returnval){
		numcards = returnval.length;
		for(n = 1; n < numcards; n++){
			m = n;
			/*** Move the value down to the appropriate spot. ***/
			while(m > 0 && returnval[m].order < returnval[m - 1].order){
				/*** switch the values around ***/
				tempval = returnval[m];
				returnval[m] = returnval[m - 1]; 
				returnval[m - 1] = tempval;
				m--;
			}   
		}
		return returnval;
	}

	this.count_fifteens = function(cardSet){
		var score, message, numcombos, tally, n, m, numcards, returnval;
		numcards = cardSet.length;

		numcombos = 1 << numcards;   // This is the total number of combinations of the cards
		score = 0;
		message = '';

		for(n = 1; n < numcombos; n++){
			tally = 0;
			for(m = 0; m < numcards; m++){
				if((1 << m) & n){
					tally += cardSet[m].value;
				}
			}
			if(tally == 15){
				if(score != 0)
					message += ", ";
				score += 2;
				message +=  "Fifteen " + score;
			}
		}
		returnval = {};
		returnval.score = score;
		returnval.message = message;
		return returnval;
	}

	this.count_pairs = function(cardSet){
		var numcards, n, m, alreadycounted, tally;
		var message;
		score = numpairs = spoken = 0;
		numcards = cardSet.length;
		message = '';

		// ********** looking for pairs and pair royals **********
		for(n = 0; n < numcards; n++){
			// determine if the current card has already been counted in a pair combo
			alreadycounted = 0;
			for(m = 0; m < n; m++){
				if(cardSet[m].rank == cardSet[n].rank)
					alreadycounted = 1;
			}

			if(!alreadycounted){
				tally = 1;
				for(m = n + 1; m < numcards; m++){
					if(cardSet[n].rank == cardSet[m].rank)
						tally++;
				}

				if(tally > 1){
					switch(tally){
					    case 2: numpairs++; break;
					    case 3:
						if(spoken) message += ", ";
						message += "Pair royal for six";
						spoken = 1;
						break;
					    case 4: 
						if(spoken) message += ", ";
						message += "Double royal for twelve";
						spoken = 1;
						break;
					}
				}

				// no if here, since tally - 1 == 0 if there are no pairs
				score += tally * (tally - 1);
			}
		}

		if(score != 0){
			switch(numpairs){
			    case 0: break;
			    case 1:
				if(score > (numpairs << 1)) 
					message += ", and a pair for two.";
				else
					message += "Pair for two";
				break;
			    case 2:
				if(score > (numpairs << 1)) message += ", ";
				message += "Two pairs for four";
				break;
			    default:
				if(score > (numpairs << 1)) message += ", ";
				message += numpairs + " pairs for " + (numpairs << 1);
				break;


			}
		}
		returnval = {};
		returnval.score = score;
		returnval.message = message;
		return returnval;
	}

	this.count_runs = function(cardSet){
		var numcards, n, runlength, multiplicand, newfactor, score, increment;
		var message;

		message = '';
		numcards = cardSet.length;
		score = 0;
		runlength = multiplicand = newfactor = 1;

		for(n = 1; n < numcards; n++){
			if(cardSet[n - 1].rank == cardSet[n].rank){
				// if the current card is the same number as the previous 
				newfactor ++;
			}else{
				if(newfactor > 1){
					multiplicand *= newfactor;
					newfactor = 1;
				}

				if(cardSet[n - 1].order == cardSet[n].order - 1){
					// if the curent card is one up from the previous 
					runlength++;
				}else{
					if(runlength > 2){
						increment = runlength;
						increment *= multiplicand;
						score += increment;

						switch(multiplicand){
						    case 2: message += "Double run "; break;
						    case 3: message += "Triple run "; break;
						    case 4: message += "Quadruple run "; break;
						    default: message += "Run ";
						}
						message += "for " + increment;

					}
					multiplicand = newfactor = runlength = 1;
				}
			}
		}

		
		// This repetition of the "if" needs to be done in case the loop
		// ends with a run at the end of the hand.
		if(runlength > 2){
			if(newfactor > 1) multiplicand *= newfactor;
			increment = runlength;
			increment *= multiplicand;
			score += increment;

			switch(multiplicand){
			    case 2: message += "Double run "; break;
			    case 3: message += "Triple run "; break;
			    case 4: message += "Quadruple run "; break;
			    default: message += "Run ";
			}
			message += "for " + increment;
		}

		returnval = {};
		returnval.score = score;
		returnval.message = message;
		return returnval;
	}

	this.count_flush = function(cardSet){
		var score, n, isaflush, numcards, message;

		score = 0;
		message = '';
		numcards = cardSet.length;
		isaflush = true;

		for(n = 1; n < numcards && isaflush; n++){
			if(cardSet[n].suit != cardSet[n - 1].suit){
				isaflush = false;
			}
		}

		if(isaflush){
			score = numcards;
		}

		if(score != 0){
			message = score + " card flush";
		}

		returnval = {};
		returnval.score = score;
		returnval.message = message;
		return returnval;
	}

	this.count_nobs = function(cardSet){
		var returnval, n, score, message, numcards;
		numcards = cardSet.length;
		message = '';
		score = 0;
		if(this.cutCard != null && this.cutCard.rank != 'J'){
			for(n = 0; n < numcards; n++){
				if(cardSet[n].rank == 'J' && cardSet[n].suit == this.cutCard.suit){
					score = 1;
					message = "1 for his nobs";
					break;
				}
			}
		}


		returnval = {};
		returnval.score = score;
		returnval.message = message;
		return returnval;
	}

}

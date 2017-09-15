var deckData = require("./deck.json"); // deck json

class GameState {

	constructor(numPlayers) {

		this.deck = new Array();
		this.board = new Array();
		this.ships = new Array();
		this.players = new Array();
		this.phase = "DRAW";
		this.player = 0;

		this.addPlayers(numPlayers);
		this.loadDeck();
		this.shuffle();
		this.deal();
		this.placeShips();
	}

	addPlayers(numPlayers) {

		for(var i = 0; i < numPlayers; ++i) {

			this.players.push({ "currentCard" : null, "lure" : null, "score" : 0 });
		}
	}

	loadDeck() {

		for(var i = 0; i < deckData.length; i++) {

			for(var j = 0; j < deckData[i].number; j++) {

				this.deck.push(deckData[i].type);
			}
		}
	}

	shuffle() {

		for(var i = 0; i < this.deck.length; i++) {

			// get a random card index
			var randomIndex = Math.floor(Math.random() * i);

			// get the current card
			var card = this.deck[i];

			// put the card at the random index in the current index
			this.deck[i] = this.deck[randomIndex];

			// put the current card at the random index
			this.deck[randomIndex] = card;
		}
	}

	deal() {

		this.board.push({ "type" : this.deck.pop(), "x" : 4, "y" : 2 });
		this.board.push({ "type" : this.deck.pop(), "x" : 3, "y" : 3 });
		this.board.push({ "type" : this.deck.pop(), "x" : 5, "y" : 3 });
		this.board.push({ "type" : this.deck.pop(), "x" : 2, "y" : 4 });
		this.board.push({ "type" : this.deck.pop(), "x" : 4, "y" : 4 });
		this.board.push({ "type" : this.deck.pop(), "x" : 6, "y" : 4 });
		this.board.push({ "type" : this.deck.pop(), "x" : 3, "y" : 5 });
		this.board.push({ "type" : this.deck.pop(), "x" : 5, "y" : 5 });
		this.board.push({ "type" : this.deck.pop(), "x" : 4, "y" : 6 });

	}

	placeShips() {

		this.ships.length = 0;

		for(var i = 0; i < this.board.length; i++) {

			if(this.board[i].type.substring(0, 4) == "gate") {

				var numShips = parseInt(this.board[i].type.substring(4));

				for(var j = 0; j < numShips; ++j) {

					this.ships.push({ "x" : this.board[i].x, "y" : this.board[i].y });
				}
			}
		}
	}

	placeShipsOnCard(x, y) {

		if(this.cardAtTile(x, y).substring(0, 4) == "gate") {

			var numShips = parseInt(this.cardAtTile(x, y).substring(4));

			for(var j = 0; j < numShips; ++j) {

				this.ships.push({ "x" : x, "y" : y });
			}
		}
	}

	drawCard(player) {

		if(this.players[player].currentCard) {

			return false;
		} 
		else {

			this.players[player].currentCard = this.deck.pop();
			return true;
		}
	}

	placeCard(player, x, y) {

		if(x > 8 || x < 0 || y > 8 || y < 0 || this.cardAtTile(x, y)) {

			return false;
		}

		for(var i = 0; i < this.board.length; i++) {

			if((Math.abs(this.board[i].x - x) == 1 && this.board[i].y == y) ||
			   (Math.abs(this.board[i].y - y) == 1 && this.board[i].x == x)) {

			   	this.board.push({ "type" : this.players[player].currentCard, "x" : x, "y" : y });
				this.players[player].currentCard = null;
				this.placeShipsOnCard(x, y);

				return true;
			}
		}

		return false;
	}

	placeLure(player, x, y) {

		if(this.cardAtTile(x, y) && this.cardAtTile(x, y) != "pub" && this.numShipsOnTile(x, y) == 0 && !this.lureOnTile(x, y)) {

			this.players[player].lure = { "x" : x, "y" : y };
			return true;
		}

		return false;
	}

	lureOnTile(x, y) {

		for(var i = 0; i < this.players.length; ++i) {

			if(this.players[i].lure && this.players[i].lure.x == x && this.players[i].lure.y == y) {

				return true;
			}
		}

		return false;
	}

	cardAtTile(x, y) {

		for(var i = 0; i < this.board.length; i++) {

			if(this.board[i].x == x && this.board[i].y == y) {

				return this.board[i].type;
			} 
		}

		return null;
	}

	numShipsOnTile(x, y) {

		var shipCount = 0;

		for(var i = 0; i < this.ships.length; ++i) {

			if(this.ships[i].x == x && this.ships[i].y == y) {

				shipCount++;
			}
		}

		return shipCount;
	}

	nextPhase() {

		if(this.phase == "DRAW") {

			this.phase = "PLACE";
		}
		else if(this.phase == "PLACE") {

			this.phase = "LURE";
		}
		else if(this.phase == "LURE") {

			if(this.player == this.players.length - 1) {

				this.phase = "SHIPSFLY";
			}
			else {

				this.phase = "DRAW";
				this.player++;
			}
		}
		else if(this.phase == "SHIPSFLY") {

			this.shipsFly();
			this.phase = "SCORING";
		}
		else if(this.phase == "SCORING") {

			this.score();
			this.phase = "SHIPSFLEE";

		}
		else if(this.phase == "SHIPSFLEE") {

			this.scatter();
			this.resetLures();

			if(this.isGameOver()) {

				this.phase = "END"
			}
			else {

				this.phase = "DRAW";
				this.player = 0;
			}
		}
		else if(this.phase == "END") {

			// do some end stuff
		}
	}

	resetLures() {
		
		for(var i = 0; i < this.players.length; ++i) {

			this.players[i].lure = null;
		}
	}

	isGameOver() {

		if(this.deck.length == 0) {
			return true;
		}

		return false;
	}

	scatter() {
		
		var shipGroups = new Array();
		var newShipGroups = new Array();
		
		for(var i = 0; i < this.board.length; ++i) {

			var shipCount = this.numShipsOnTile(this.board[i].x, this.board[i].y);

			if(shipCount > 0) {

				shipGroups.push({ "num" : shipCount, "x" : this.board[i].x, "y" : this.board[i].y });
			}
		}

		for(var j = 0; j < shipGroups.length; ++j) {

			if(shipGroups[j].num >= 6) {

				var shipsToScatter = shipGroups[j].num - 2;

			    var direction = 0; // current direction; 0=RIGHT, 1=DOWN, 2=LEFT, 3=UP
			    var size = 1; // chain size

			    // starting point
			    var x = shipGroups[j].x;
			    var y = shipGroups[j].y;

			    for (var k = 0; k < shipsToScatter; k++) {

			        for (var l = 0; l < 2; l++) {

			            for (var i = 0; i < size; i++) {

			                console.log(`( ${x}, ${y} )\n`);
			                if(cardAtTile(x, y)) {
			                	
			                }

			                switch (direction) {

			                    case 0: 
			                    	y--; 
			                    	break;

			                    case 1: 
			                    	x++; 
			                    	break;

			                    case 2: 
				                    y++;
				                    break;

			                    case 3: 
			                    	x--; 
			                    	break;
			                }
			            }

			            direction = (direction + 1) % 4;
			        }

			        size++;
			    }
			}
		}
	}

	score() {

		for(var i = 0; i < this.players.length; ++i) {

			var ships = this.numShipsOnTile(this.players[i].lure.x, this.players[i].lure.y);
			
			if(this.cardAtTile(this.players[i].lure.x, this.players[i].lure.y) == "lair") {

				this.players[i].score += (ships * 2);
			} 
			else {

				this.players[i].score += ships;
			}
		}
	}

	shipsFly() {

		var shipGroups = new Array();
		var newShipGroups = new Array();
		
		for(var i = 0; i < this.board.length; ++i) {

			var shipCount = this.numShipsOnTile(this.board[i].x, this.board[i].y);

			if(shipCount > 0) {

				shipGroups.push({ "num" : shipCount, "x" : this.board[i].x, "y" : this.board[i].y });
			}
		}

		for(var k = 0; k < shipGroups.length; ++k) {

			var axisLures = new Array();
			var closestLureDistance = 9;
			var cruiserLures = new Array();
			var numShipsPerLure = 0;
			var pub = null;

			for(var j = 0; j < this.players.length; ++j) {

				if(this.players[j].lure.x == shipGroups[k].x) {

					axisLures.push({ "axis" : "x", "x" : this.players[j].lure.x, "y" : this.players[j].lure.y });
				}
				else if(this.players[j].lure.y == shipGroups[k].y) {

					axisLures.push({ "axis" : "y", "x" : this.players[j].lure.x, "y" : this.players[j].lure.y });
				}
			}
			
			for(var l = 0; l < axisLures.length; ++l) {

				if(axisLures[l].axis == "x" && !this.checkShipPathX(shipGroups[k].y, axisLures[l].y, axisLures[l].x)) {

					axisLures.splice(l, 1);
				}
				else if(axisLures[l].axis == "y" && !this.checkShipPathY(shipGroups[k].x, axisLures[l].x, axisLures[l].y)) {

					axisLures.splice(l, 1);
				}
			}

			for(var n = 0; n < axisLures.length; ++n) {

				if(axisLures[n].axis == "x") {

					if(closestLureDistance >= Math.abs(axisLures[n].y - shipGroups[k].y)) {

						closestLureDistance = Math.abs(axisLures[n].y - shipGroups[k].y);
					}
					else {

						axisLures.splice(n, 1);
					}
				}
				else if(axisLures[n].axis == "y") {

					if(closestLureDistance >= Math.abs(axisLures[n].x - shipGroups[k].x)) {

						closestLureDistance = Math.abs(axisLures[n].x - shipGroups[k].x);
					}
					else {

						axisLures.splice(n, 1);
					}					
				}
			}

			if(axisLures.length == 1) {

				numShipsPerLure = shipGroups[k].num;

				if(axisLures[0].axis = "x") {

					pub = this.getPubInPathX(shipGroups[k].y, axisLures[0].y, axisLures[0].x);
				}
				else {

					pub = this.getPubInPathY(shipGroups[k].x, axisLures[0].x, axisLures[0].y);
				}
				
				if(pub != null) {

					newShipGroups.push({ "num" : numShipsPerLure, "x" : pub.x,  "y" : pub.y });
				}
				else {

					newShipGroups.push({ "num" : numShipsPerLure, "x" : axisLures[0].x,  "y" : axisLures[0].y });
				}
			}
			else if(axisLures.length > 1) {

				for(var t = 0; t < axisLures.length; ++t) {

					if(this.cardAtTile(axisLures[t].x, axisLures[t].y) == "cruiser") {

						cruiserLures.push({ "axis" : axisLures[t].axis, "x" : axisLures[t].x, "y" : axisLures[t].y });
					}
				}

				if(cruiserLures.length > 0 && shipGroups[k].num % cruiserLures.length == 0) {

					numShipsPerLure = shipGroups[k].num / cruiserLures.length;

					for(var v = 0; v < cruiserLures.length; ++v) {

						if(cruiserLures[v].axis == "y") {

							pub = this.getPubInPathY(shipGroups[k].x, cruiserLures[v].x, cruiserLures[v].y);

							if(pub != null) {

								newShipGroups.push({ "num" : numShipsPerLure, "x" : pub.x,  "y" : pub.y });
							}
							else {

								newShipGroups.push({ "num" : numShipsPerLure, "x" : cruiserLures[v].x,  "y" : cruiserLures[v].y });
							}
						}
						else if(cruiserLures[v].axis == "x") {

							pub = this.getPubInPathX(shipGroups[k].y, cruiserLures[v].y, cruiserLures[v].x);

							if(pub != null) {

								newShipGroups.push({ "num" : numShipsPerLure, "x" : pub.x,  "y" : pub.y });
							}
							else {

								newShipGroups.push({ "num" : numShipsPerLure, "x" : cruiserLures[v].x,  "y" : cruiserLures[v].y });
							}
						}
					}
				}
				else if(cruiserLures.length == 0 && shipGroups[k].num % axisLures.length == 0) {

					numShipsPerLure = shipGroups[k].num / cruiserLures.length;

					for(var v = 0; v < axisLures.length; ++v) {

						if(axisLures[v].axis == "y") {

							pub = this.getPubInPathY(shipGroups[k].x, axisLures[v].x, axisLures[v].y);

							if(pub != null) {

								newShipGroups.push({ "num" : numShipsPerLure, "x" : pub.x,  "y" : pub.y });
							}
							else {

								newShipGroups.push({ "num" : numShipsPerLure, "x" : axisLures[v].x,  "y" : axisLures[v].y });
							}
						}
						else if(axisLures[v].axis == "x") {

							pub = this.getPubInPathX(shipGroups[k].y, axisLures[v].y, axisLures[v].x);

							if(pub != null) {

								newShipGroups.push({ "num" : numShipsPerLure, "x" : pub.x,  "y" : pub.y });
							}
							else {

								newShipGroups.push({ "num" : numShipsPerLure, "x" : axisLures[v].x,  "y" : axisLures[v].y });
							}
						}
					}
				}
				else {
					newShipGroups.push({ "num" : shipGroups[k].num, "x" : shipGroups[k].x,  "y" : shipGroups[k].y });
				}
			}
			else {
				newShipGroups.push({ "num" : shipGroups[k].num, "x" : shipGroups[k].x,  "y" : shipGroups[k].y });
			}
		}

		this.ships.length = 0;

		for(var i = 0; i < newShipGroups.length; ++i) {

			for(var k = 0;  k < newShipGroups[i].num; ++k) {

				this.ships.push({ "x" : newShipGroups[i].x, "y" : newShipGroups[i].y });
			}
		}
	}

	getPubInPathY(xStart, xEnd, y) {

		if(xStart > xEnd) {

			for(var i = xStart - 1; i > xEnd; --i) {

				if(this.cardAtTile(i, y) == "pub") {

					return { "x" : i, "y" : y };
				}
			}
		}
		else {

			for(var i = xStart + 1; i < xEnd; ++i) {

				if(this.cardAtTile(i, y) == "pub") {

					return { "x" : i, "y" : y };
				}
			}
		}

		return null;
	}

	getPubInPathX(yStart, yEnd, x) {

		if(yStart > yEnd) {

			for(var i = yStart - 1; i > yEnd; --i) {

				if(this.cardAtTile(x, i) == "pub") {

					return { "x" : x, "y" : i };
				}
			}
		}
		else {

			for(var i = yStart + 1; i < yEnd; ++i) {

				if(this.cardAtTile(x, i) == "pub") {

					return { "x" : x, "y" : i };
				}
			}
		}

		return null;
	}

	checkShipPathX(xStart, xEnd, y) {

		if(xStart > xEnd) {

			for(var i = xStart - 1; i > xEnd; --i) {

				if(!this.cardAtTile(i, y)) {

					return false;
				}
			}
		}
		else {

			for(var i = xStart + 1; i < xEnd; ++i) {

				if(!this.cardAtTile(i, y)) {

					return false;
				}
			}
		}

		return true;
	}

	checkShipPathY(yStart, yEnd, x) {

		if(yStart > yEnd) {

			for(var i = yStart - 1; i > yEnd; --i) {

				if(!this.cardAtTile(x, i)) {

					return false;
				}
			}
		}
		else {

			for(var i = yStart + 1; i < yEnd; ++i) {

				if(!this.cardAtTile(x, i)) {

					return false;
				}
			}
		}

		return true;
	}
}

module.exports = GameState;
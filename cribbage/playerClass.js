function playerClass(type){
	this.globalId = 'player_' + randomText(10);
	globalRefs[this.globalId] = this;

	var name;
	var hand;
	var x, y;
	var type;
	var pickedNames;
	var dealX, dealY; // the location from which the cards are dealt when this player is dealing
	var score;

	this.pickedNames = [];
	this.type = type;
	this.x = this.y = 0;
	this.score = 0;
	this.textColour = '#FF8';

	this.hand = new cardStack();
	this.hand.setParentDiv('#gameCanvas');

	this.elementId = this.globalId;
	this.element = $('<div id="' + this.elementId + '" class="playerDiv"></div>');
	$('#gameCanvas').append(this.element);

	this.position = function(x, y){
		this.x = x;
		this.y = y;
		this.element.css("left", (this.x - 200) + 'px');
		this.element.css("top", this.y + 30 + 'px');
		this.element.css("width", '400px');

		this.hand.position(x, y);
	}


	this.draw = function(){
		nameX = this.x;
		nameY = this.y + 60;
		$('<div id="name_' + this.globalId + '" class="playerName" style="top:' + nameY + 'px; left:' + nameX + 'px">' + this.name + '</div>').prependTo(this.element);
	}

	this.getName = function(){
		if(this.name == undefined){
			switch(this.type){
				case 'human':
					// FIXME: should prompt player 
					this.name = 'Jacob';
					break;
				case 'ai':
					this.name = this.getRandomName();
					break;
				case 'remote':
					// FIXME:  this should probably be stored from an earlier server request
					this.name = "FIXME";
					break;
			}
		}
		return this.name;
	}

	this.getRandomName = function(){
		var returnval;
		switch(Math.floor(Math.random() * 26)){
			case 0: returnval = "Alfred"; break;
			case 1: returnval = "Bonnie"; break;
			case 2: returnval = "Charles"; break;
			case 3: returnval = "Dominique"; break;
			case 4: returnval = "Edward"; break;
			case 5: returnval = "Francine"; break;
			case 6: returnval = "Ginny"; break;
			case 7: returnval = "Howard"; break;
			case 8: returnval = "Ivan"; break;
			case 9: returnval = "Josephine"; break;
			case 10: returnval = "Kenny"; break;
			case 11: returnval = "Laurel"; break;
			case 12: returnval = "Michael"; break;
			case 13: returnval = "Nora"; break;
			case 14: returnval = "Oliver"; break;
			case 15: returnval = "Penelope"; break;
			case 16: returnval = "Quincy"; break;
			case 17: returnval = "Rebecca"; break;
			case 18: returnval = "Samson"; break;
			case 19: returnval = "Tasha"; break;
			case 20: returnval = "Uriel"; break;
			case 21: returnval = "Victoria"; break;
			case 22: returnval = "William"; break;
			case 23: returnval = "Xena"; break;
			case 24: returnval = "Yolanda"; break;
			case 25: returnval = "Zachary"; break;
		}
		return returnval;
	}

	this.say = function(text){
		write(this.name + ': ' + text, 'color:' + this.textColour);
	}

	this.ready = function(){
//		this.say(this.name + " is not ready");
		return false;
	}
}

var pi = 3.14159265358979;
var FAST_MODE = false; // if set to true, unnecessary animation is skipped, speeding up the interface.  Should be made into a config option
var CARD_SCALE = 1.0; // these three constants should be made into user options
var CARD_HEIGHT = 102;
var CARD_WIDTH = 74;
var inputLayer;
var globalRefs = [];
var game;

function inputHandler(inputDiv){
	var mouseX, mouseY;
	var netDelta; // used for tracking net drag motion of mouse
	var mouseDown;
	var inputDiv;
	var pressTime; // used for counting the duration of a mouse click
	var clickSpeed; // the aforementioned duration
	var clickQueue; // used for catching double clicks

	var selectedObj;

	this.inputDiv = inputDiv;
	this.mouseDown = false;
	this.selectedObj = false;
	this.clickQueue = [0, 0];

	this.handleMotion = function(x, y){
		this.mouseX = x;
		this.mouseY = y;
		if(this.mouseDown) game.handleDrag(this.selecetedObj, x, y);
	}

	this.handlePress = function(e){
		this.pressTime = new Date().valueOf();
		this.clickQueue[1] = this.clickQueue[0];
		this.clickQueue[0] = this.pressTime;
		this.netDelta = {x:this.mouseX, y:this.mouseY};
		this.detectObject(this.mouseX, this.mouseY);
		this.mouseDown = true;
	}

	this.handleRelease = function(e){
		var timeStamp = new Date().valueOf();
		this.netDelta.x = this.mouseX - this.netDelta.x;
		this.netDelta.y = this.mouseY - this.netDelta.y;
		this.clickSpeed = timeStamp - this.pressTime;
		if(timeStamp - this.clickQueue[1] < 300){
			doubleClick = true;
		}else{
			doubleClick = false;
		}
		game.handleRelease(e, this.selectedObj, this.clickSpeed, this.netDelta, doubleClick);
		this.mouseDown = false;
		this.selectedObj = false;
	}

	this.detectObject = function(x, y){
		var n, cardClicked = null;
		children = $('#gameCanvas').children();

		// this loop counts down because we want the top divs first
		for(n = children.length - 1; n >= 0 && cardClicked == null; n--){
			if(children[n].id.indexOf('stack_') != -1){
				cardClicked = globalRefs[children[n].id].catchMouse(x, y);
			}
		}

		if(cardClicked != null){
			this.selectedObj = cardClicked;
			game.handleCardClick(x, y, cardClicked);
		}else{
			this.selectedObj = false;
			game.handleClick(x, y);
		}
	}
}

// a class for representing any "stack" of cards, be it a hand, deck, pile, etc.
function cardStack(){
	this.card = [];
	this.numCards = 0;
	this.divId = 'stack_' + randomText(10);
	this.globalId = this.divId;
	globalRefs[this.globalId] = this;
	this.div = $('<div class="stackDiv" id="' + this.divId + '"></div>');
	this.parentDiv = null;
	this.backImage = null;

	this.initialize = function(){
		this.position(0, 0);
	}

	this.buildDeck = function(backImage){
		this.backImage = backImage;
		this.card = [];
		suits = ['s', 'c', 'h', 'd'];
		ranks = ['A', 2, 3, 4, 5, 6, 7, 8, 9, 'T', 'J', 'Q', 'K'];
		for(s in suits){
			for(r in ranks){
				this.card[this.numCards] = new cardClass(ranks[r], suits[s], this.backImage);
				this.card[this.numCards].setStack(this);
				this.numCards++;
			}
		}

		this.backImage = backImage;
	}

	// This function is needed because IE sucks the bowels a rotting goat corpse.
	// I hope the fuckers who wrote it all die from a severe case of genital herpes.
	this.refresh = function(){
		for(var n = 0; n < this.numCards; n++){
			this.card[n].showFace(this.card[n].faceUp);
		}
	}

	// move this stack's div to the top (or end) of the parent div.  This allows it's cards
	// to pass over other stacks
	this.moveToTop = function(){
		this.div.appendTo(this.div.parent());
		this.refresh(); // fucking IE
	}

	this.moveToBottom = function(){
		this.div.prependTo(this.div.parent());
		this.refresh(); // fucking IE
	}

	this.catchMouse = function(x, y){
		var n, m;
		var cardSelected = null;
		var corners;
		// find out if one of our cards has been clicked on, starting at the top
		for(n = this.numCards - 1; n >= 0 && cardSelected == null; n--){
			corners = this.card[n].getCorners();
			for(m = 0; m < 4; m++){
				corners[m][0] += this.posx;
				corners[m][1] += this.posy;
			}
			if(polyContains(x, y, corners)){
				cardSelected = this.card[n];
			}
		}
		return cardSelected;
	}

	// get the position of the specified card within this stack.  Returns 0 for the bottom and 
	// numCards - 1 for the top.  -1 if the card is not found.
	this.getCardPos = function(card){
		var returnval = -1;
		for(var n = 0; n < this.numCards && returnval == -1; n++){
			if(this.card[n] == card){
				returnval = n;
			}
		}
		return returnval;
	}

	this.shiftCard = function(card, delta){
		if(delta == 0) return;
		if(delta > 0) dinc = 1;
		else dinc = -1;

		for(var n = 0; n < this.numCards && this.card[n] != card; n++);
		if(n < this.numCards){
			m = n + delta;
			if(m < 0) m = 0;
			if(m >= this.numCards) m = this.numCards - 1;


			tempCard = this.card[n];
			while(m != n){
				this.card[n] = this.card[n + dinc];
				n += dinc;
			}
			this.card[n] = tempCard;
			this.relayer();
		}
	}

	this.shuffle = function(){
		if(this.numCards <= 1) return 0;

		for(var n = 0; n < this.numCards; n++){
			tempCard = this.card[n];
			do{
				m = Math.floor(Math.random() * this.numCards);
			}while(m == n);
			this.card[n] = this.card[m];
			this.card[m] = tempCard;
		}

		this.relayer();
	}

	this.faceDown = function(){
		for(var n = 0; n < this.numCards; n++){
			this.card[n].showFace(false);
		}
	}

	this.faceUp = function(){
		for(var n = 0; n < this.numCards; n++){
			this.card[n].showFace(true);
		}
	}

	// take the order in which the cards are stored, and re-organize their divs to match
	this.relayer = function(){
		for(var n = 1; n < this.numCards; n++){
			this.card[n].canvas.element.insertAfter(this.card[n - 1].canvas.element);
			this.card[n].showFace(this.card[n].faceUp);
		}
	}

	// either fetch or specify the position of this stack
	this.position = function(x, y){
		if(x == undefined || y == undefined){
			returnval = function(){};
			returnval.x = this.div.css("left");
			returnval.y = this.div.css("top");
			return returnval;
		}
		this.posx = x;
		this.posy = y;
		this.div.css("top", y + 'px');
		this.div.css("left", x + 'px');
	}

	this.setParentDiv = function(targetDiv){
		this.div.appendTo(targetDiv);
		this.parentDiv = targetDiv;
	}

	this.getParent = function(){
		return this.parentDiv;
	}

	// fan the stack out the way it would be held in a normal hand
	this.fan = function(showHand, callBack, animate){
		var ang, anginc, startx, endx, xinc, x, y, startAng, endAng;
		if(animate == undefined) animate = false;
		switch(this.numCards){
			case 0:
				if(callBack != undefined){
					eval(callBack);
				}
				return 0;
				break;
			case 1:
				startAng = 0;
				endAng = 0;
				anginc = 0;
				break;
			case 2:
				startAng = -pi / 24;
				endAng = pi / 24;
				anginc = (endAng - startAng);
				break;
			default:
				startAng = -pi / 12 - (pi * this.numCards / 400);
				endAng = pi / 12 + (pi * this.numCards / 400);
				anginc = (endAng - startAng) / (this.numCards - 1);
		}
		ang = startAng;
		startx = -4 * this.numCards;
		endx = 4 * this.numCards;
		xinc = (endx - startx) / this.numCards;
		x = startx;
		y = 0;

		if(!animate){
			for(var n = 0; n < this.numCards- 1;  n++){
				this.card[n].move(x, 0, ang, false, 0, 1);
				this.card[n].showFace(showHand);
				ang += anginc;
				x += xinc;
			}
			this.card[n].move(x, 0, ang, false, 0, 1, callBack);
		}else{
			this.animFan(0, ang, anginc, x, xinc, showHand, callBack);
		}
	}

	// a helper function for this.fan, using callbacks to animate the cards one at a time.
	this.animFan = function(cardNumber, ang, anginc, x, xinc, showHand, callBack){
		if(cardNumber < this.numCards){
			animCallback = "globalRefs['" + this.globalId + "'].animFan(" 
				+ (cardNumber + 1) + ", "
				+ (ang + anginc) + ", "
				+ anginc + ", "
				+ (x + xinc) + ", "
				+ xinc + ", "
				+ showHand + ", "
				+ '"' + callBack + '");';
			this.card[cardNumber].move(x, 0, ang, showHand, 200, 10, animCallback);
		}else{
			eval(callBack);
		}
	}

	this.flipCards = function(time, numsteps, animate, callback, cardnum){
		var n;
		if(animate == undefined ){
			for(n = 0; n < this.numCards - 1; n++){
				this.card[n].flip(time, numsteps);
			}
			this.card[n].flip(time, numsteps, callback);
		}else if(!animate){
			for(n = 0; n < this.numCards; n++){
				this.card[n].flip(0, 1);
			}
			if(callback != undefined) eval(callback);
		}else{
			if(cardnum == undefined) cardnum = this.numCards - 1;

			if(cardnum == 0){
				this.card[0].flip(time, numsteps, callback);
				
			}else{
				animCallback = "globalRefs['" + this.globalId + "'].flipCards(";
				animCallback += time + ', ' + numsteps + ', true, "';
				animCallback += parseQuotes(callback) + '", ' + (cardnum - 1) + ');';
				this.card[cardnum].flip(time, numsteps, animCallback);
			}
		}
	}

	this.move = function(x, y, time, iterations, callback){
		if(time == undefined){
			time = 0;
			iterations = 1;
		}

		if(iterations > 1){
			dx = (x - this.posx) / iterations;
			dy = (y - this.posy) / iterations;
			this.position(this.posx + dx, this.posy + dy);
			deltaT = time / iterations;
			time -= deltaT;
			iterations--;
			setTimeout("globalRefs['" + this.globalId + "'].move(" + x + ", " + y + ", " + time + ", " + iterations + ", \"" + parseQuotes(callback) + "\");", deltaT);

		}else{
			this.position(x, y);
			if(callback != undefined) eval(callback);
		}
	}

	// arrange the cards in a simple linear stack
	this.stack = function(x, y, xoffset, yoffset, animate, callback){
		if(this.numCards == 0) return 0;
		if(animate == undefined)  animate = false;
		if(animate){
			this.animStack(0, x, y, xoffset, yoffset, callback);
		}else{
			for(var n = 0; n < this.numCards; n++){
				this.card[n].setPos(x + n * xoffset, y + n * yoffset);
				this.card[n].setAngle(0);
			}
		}
	}

	// animate the stacking of the cards
	this.animStack = function(index, x, y, xinc, yinc, callback){
		if(index < this.numCards){
			callback = parseQuotes(callback);
			newCallback = "globalRefs['" + this.globalId + "'].animStack("
				+ (index + 1) + ', '
				+ (x + xinc) + ', '
				+ (y + yinc) + ', '
				+ xinc + ', ' + yinc;
			if(callback != undefined) newCallback +=  ', "' + callback + '"';
			newCallback += ');';
			this.card[index].move(x, y, 0, false, 250, 10, newCallback)
		}else{
			if(callback != undefined) eval(callback);
		}
	}

	// passes the card at the specified index to the target hand.  If no index is
	// specified, the top card is taken.  Returns true on success, false if the index
	// is invalid
	this.passCard = function(targetHand, index){
		if(index == undefined) index = this.numCards - 1;
		if(index < 0 || index >= this.numCards) return false;

		this.card[index].setStack(targetHand);
		targetHand.card[targetHand.numCards] = this.card[index];
		targetHand.numCards++;
		for(var n = index; n < this.numCards - 1; n++){
			this.card[n] = this.card[n + 1];
		}
		delete this.card[n];
		this.numCards --;
		return true;
	}

	// pass all cards of the specified rank and suit to the target hand.
	// if a null value is passed for the rank or suit, then all ranks or suits are a match.
	// eg this.pass('J', null, foo); would pass all jacks of any suit to the stack "foo"
	this.pass = function(rank, suit, targetHand){
	
		success = false;
		for(var n = 0; n < this.numCards; n++){
			if((this.card[n].rank == rank || rank == null) && (this.card[n].suit == suit || suit == null)){
				if(this.passCard(targetHand, n)){
					success = true;
					n--;
				}
			}
		}
		return success;
	}

	// must go after other function definitions
	this.initialize();
}


function cardClass(rank, suit, backImage){
	this.globalId = 'card_' + randomText(10);
	globalRefs[this.globalId] = this;
	this.scale = CARD_SCALE;
	this.height = CARD_HEIGHT * this.scale;
	this.width = CARD_WIDTH * this.scale;

	this.radius = Math.sqrt(this.width * this.width + this.height * this.height);
	this.leftMargin = (this.radius - this.width) / 2;
	this.topMargin = (this.radius - this.height) / 2;
	this.centerx = this.width >> 1;
	this.centery = this.height >> 1;
	this.canvas = new itemClass(this.radius, this.radius, $('#swapDiv'), 'card_' + rank + suit);
	this.frontImage = "images/" + rank + suit + ".jpg";
	this.canvas.setImage(this.frontImage, this.leftMargin, this.topMargin, this.width, this.height);
	this.canvas.display('inline');

	this.stack = null;

	this.angle = 0;
	this.rank = rank;
	this.suit = suit;
	this.faceUp = true;
	this.backImage = backImage;

	// get the ordering index of this card's rank
	this.getIndex = function(){
		var returnval;
		switch('' + this.rank){
			case 'A': returnval = 1; break;
			case '2': returnval = 2; break;
			case '3': returnval = 3; break;
			case '4': returnval = 4; break;
			case '5': returnval = 5; break;
			case '6': returnval = 6; break;
			case '7': returnval = 7; break;
			case '8': returnval = 8; break;
			case '9': returnval = 9; break;
			case 'T': returnval = 10; break;
			case 'J': returnval = 11; break;
			case 'Q': returnval = 12; break;
			case 'K': returnval = 13; break;
		}
		return returnval;
	}

	this.getName = function(){
		var returnval;
		switch('' + this.rank){
			case 'A': returnval = 'ace'; break;
			case '2': returnval = 'two'; break;
			case '3': returnval = 'three'; break;
			case '4': returnval = 'four'; break;
			case '5': returnval = 'five'; break;
			case '6': returnval = 'six'; break;
			case '7': returnval = 'seven'; break;
			case '8': returnval = 'eight'; break;
			case '9': returnval = 'nine'; break;
			case 'T': returnval = 'ten'; break;
			case 'J': returnval = 'jack'; break;
			case 'Q': returnval = 'queen'; break;
			case 'K': returnval = 'king'; break;
		}
		returnval += " of ";
		switch(this.suit){
			case 's': returnval += 'spades'; break;
			case 'h': returnval += 'hearts'; break;
			case 'c': returnval += 'clubs'; break;
			case 'd': returnval += 'diamonds'; break;
		}
		return returnval;
	}

	// retrieves the current locations of the four corners of this card, and returns them in an array
	this.getCorners = function(){
		var returnval = [];
		var SINE = Math.sin(this.angle);
		var COSINE = Math.cos(this.angle);
		for(var n = 0; n < 4; n++){
			switch(n){
				case 0:
					dx = -this.width >> 1;
					dy = -this.height >> 1;
					break;
				case 1:
					dx = this.width >> 1;
					dy = -this.height >> 1;
					break;
				case 2:
					dx = this.width >> 1;
					dy = this.height >> 1;
					break;
				case 3:
					dx = -this.width >> 1;
					dy = this.height >> 1;
					break;
			}
			cx = dx * COSINE - dy * SINE + this.x;
			cy = dx * SINE + dy * COSINE + this.y;
			returnval[n] = [cx, cy];
		}
		return returnval;
	}

	// set the position of the card's center point to {x, y} relative to the parent div
	this.setPos = function(x, y){
		this.x = x;
		this.y = y;
		this.canvas.setPos(x, y);
	}

	this.setHand = function(hand){
		// Just an alias for setStack
		this.setStack(hand);
	}

	this.setParentDiv = function(targetDiv){
		this.canvas.setParentDiv(targetDiv);
	}

	this.setStack = function(stack){
		if(this.stack != null){
			deltax = this.stack.posx - stack.posx;
			deltay = this.stack.posy - stack.posy;
			this.setPos(this.x + deltax, this.y + deltay);

		}
		this.stack = stack;
		this.setParentDiv('#' + stack.divId);
	}

	this.rotate = function(ai){
		this.angle += ai;
		this.canvas.rotate(this.angle);
	}

	this.setAngle = function(angle){
		this.angle = angle;
		this.canvas.rotate(this.angle);
	}

	this.showFace = function(show){
		if(show == undefined || show != false) show = true;
		if(show == true){
			this.changeImage(this.frontImage);
			this.faceUp = true
		}else if(show == false){
			this.changeImage(this.backImage);
			this.faceUp = false;
		}
	}

	this.flip = function(time, numsteps, callback, r, ri){
		if(r == undefined){
			// this is the first call to this function
			r = 1;
			ri = -2 / numsteps;
		}
		r += ri;
		if(r <= -1){
			this.canvas.scale(1, 1);
			this.canvas.rotate(this.angle);
			if(callback != undefined) eval(callback);
		}else{
			if(r <= 0 && r > ri) this.switchFace();
			this.canvas.scale(Math.abs(r), 1);
			newCallback = "globalRefs['" + this.globalId + "'].flip(";
			newCallback += (time - time / numsteps) + ', ';
			newCallback += (numsteps - 1) + ', ';
			newCallback += '"' + parseQuotes(callback) + '", ';
			newCallback += r + ', ' + ri + ');';
			setTimeout(newCallback, time / numsteps)
		}
	}

	this.switchFace = function(){ this.showFace(!this.faceUp); }

	this.changeImage = function(imagefile){
		this.canvas.canvas.clear();
		this.canvas.setImage(imagefile, this.leftMargin, this.topMargin, this.width, this.height);
		this.canvas.rotate(this.angle);
	}

	this.move = function(x, y, angle, flip, time, iterations, callback){

		if(iterations <= 1){
			this.canvas.position(x, y);
			this.canvas.rotate(angle);
			this.angle = angle;
			this.x = x; this.y = y;
			this.canvas.scale(1, 1);
			if(callback != undefined) eval(callback);
		}else{
			da = (angle - this.angle) / iterations;
			this.angle += da;
			this.canvas.rotate(this.angle);

			if(flip == true){
				flip = 1 - (2 / iterations);
			}else if(flip != false){
				flipInc = (flip + 1) / iterations;
				if(flip < 0 && flipInc > Math.abs(flip)){
					this.switchFace();
				}
				flip -= flipInc;
				this.canvas.scale(Math.abs(flip), 1);
			}

			dx = x - this.canvas.posx;
			dy = y - this.canvas.posy;
			dx /= iterations;
			dy /= iterations;
			this.canvas.position(this.canvas.posx + dx, this.canvas.posy + dy);

			time = (iterations - 1) * time / iterations;
			iterations--;

			newCallback = "globalRefs['" + this.globalId + "'].move(" + 
				x + ", " + y + ", " + angle + ", " + flip + "," +
				time + ", " + iterations + ", \"" + 
				parseQuotes(callback) + "\");";
			setTimeout(newCallback, time / iterations)
		}
	}

	this.setPos(0, 0);
}

// this is a class for representing basic objects that will get manipulated in the document
// the main purpose here is to incorporate the Raphael library, allowing the conversion of
// raster images to vector, and their rotation thereafter
function itemClass(w, h, targetDiv, elementId){
	this.globalId = randomText(10);
	globalRefs[this.globalId] = this;
	if(w == undefined || h == undefined) return undefined;
	this.width = w;
	this.height = h;
	this.posx = 0;
	this.posy = 0;

	// create our div, and use it as a canvas
	if(elementId == undefined) elementId = randomText(10);
	this.elementId = elementId;
	this.element = $('<div id="' + this.elementId + '"></div>');
	this.element.css("width", this.width + "px");
	this.element.css("height", this.height + "px");
	this.element.css("position", "absolute");
	this.element.css("display", "none");
	targetDiv.append(this.element); // the div has to be added to the document before Raphael can use it
	this.canvas = Raphael(this.elementId, this.width, this.height);
	
	this.setImage = function(imagefile, left, top, width, height){
		this.image = this.canvas.image(imagefile, left, top, width, height);
	}

	this.display = function(show){
		if(show == undefined || show == false){
			this.element.css("display", "none");
		}else if(show == true){
			this.element.css("display", "inline");
		}else{
			this.element.css("display", show);
		}
	}

	this.translate = function(dx, dy){
		this.setPos(this.posX + dx, this.posy + dy);
	}

	this.position = function(x, y){
		if(x == undefined || y == undefined){
			returnval = function(){};
			offset = this.element.offset();
			returnval.x = offset.left;
			returnval.y = offset.top;
			return returnval;
		}
		this.setPos(x, y);
	}

	this.centerpoint = function(){
		var returnval = this.position();
		returnval.x += this.width >> 1;
		returnval.y += this.height >> 1;
		return returnval;
	}

	this.rotate = function(radians){
		this.image.rotate(radians * 180 / pi, true);
	}

	// set the position of the card's center point to {x, y} relative to the parent div
	this.setPos = function(x, y){
		this.posx = x;
		this.posy = y;
		x -= this.width >> 1;
		y -= this.height >> 1;
		this.element.css("top", y + "px");
		this.element.css("left", x + "px");
	}

	this.scale = function(xRatio, yRatio){
		this.image.scale(xRatio, yRatio);
		this.xScale = xRatio;
		this.yScale = yRatio;
	}

	this.setParentDiv = function(targetDiv){
		this.element.appendTo(targetDiv)
	}

}

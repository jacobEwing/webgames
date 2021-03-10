var settings = {
	gridScale : 0, // <-- calculated in "bestCanvasSize()"
	gridSize : { x : 6 , y : 9},
	minTileSize : 5,
	blockProbability : .4,
	minAngle : 7 * Math.PI / 16,
	maxAngle : 25 * Math.PI / 16,
	animationFrequency : 24,
	defaultBallRadius: 15
};

var gameCanvas, canvasWrapper, gameWrapper, context, player, blockStrength, blocks, gameState;



var playerClass = function(){
	this.level = 1;
	this.x = 0;
	this.newX = 0;
	this.angle = 0;
	this.ballSpeed = 16;
	this.launchFrequency = Math.floor(settings.defaultBallRadius * 10);
	this.balls = [];
};

playerClass.prototype.fire = function(){
	gameState = 'launching';
	this.launchBalls();
}

playerClass.prototype.addBall = function(){
	var ball = new ballClass();
	ball.position = {
		x : this.x,
		y : settings.gridScale * settings.gridSize.y
	};
	this.balls[this.balls.length] = ball;
}

playerClass.prototype.launchBalls = function(){
	// actually a matrix rotation of a vertical line.
	var idx = 0;
	var angle = this.angle;
	var me = this;

	gameState = 'balls moving';

	var launch = function(){
		var ball = this.balls[idx++];
		// set the ball's position to that of the player
		ball.position = {
			x : this.x,
			y : settings.gridScale * settings.gridSize.y
		};
		// set its velocity correctly
		ball.velocity = {
			dx : Math.sin(this.angle) * this.ballSpeed,
			dy : -Math.cos(this.angle) * this.ballSpeed
		}
		ball.moving = true;
		// stop after looping through all the balls
		if(idx < this.balls.length){
			setTimeout(function(){launch.call(me);}, this.launchFrequency);
		}
	};
	launch.call(this);
};

var ballClass = function(){
	this.position = {x: 0, y : 0};
	this.velocity = {dx: 0, dy : 0};
	this.animaionInterval = null;
	this.radius = settings.defaultBallRadius;
	this.moving = false;
	this.colour = {};
	this.pickAColour();
};

ballClass.prototype.pickAColour = function(){
	this.colour = {
		red : 64 + Math.floor(Math.random() * 128),
		green : 128 + Math.floor(Math.random() * 129),
		blue : 192 + Math.floor(Math.random() * 64)
	};
}

function brighten(val){
	return (val + 255) >> 1;
}

function darken(val){
	return (val + 0) >> 1;
}

ballClass.prototype.draw = function(){
	if(this.velocity.dy == 0 && this.velocity.dx == 0) return;
	var radius = settings.gridScale * this.radius / 75;
	var colour = 'rgb(' + this.colour.red + ', ' + this.colour.green + ', ' + this.colour.blue + ')';
	var brightColour = 'rgba(' + brighten(this.colour.red) + ', ' + brighten(this.colour.green) + ', ' + brighten(this.colour.blue) + ')';
	var darkColour = 'rgba(' + darken(this.colour.red) + ', ' + darken(this.colour.green) + ', ' + darken(this.colour.blue) + ')';
	var brightest = 'rgba(255, 255, 255, 0.6)';
	var sqrtRad = Math.floor(Math.sqrt(2 * radius * radius));

	context.save()
		// first draw the circle
		context.fillStyle = colour;
		context.beginPath();
		context.arc(this.position.x, this.position.y, radius, 0, 2 * Math.PI);
		context.fill();
		context.closePath();

		// shade it on the top left
		context.fillStyle = brightColour;
		context.beginPath();
		context.arc(this.position.x, this.position.y, radius, 3 * Math.PI / 4, 7 * Math.PI / 4);
		context.bezierCurveTo(this.position.x, this.position.y - radius / 3, this.position.x - radius / 3, this.position.y,  this.position.x - sqrtRad / 2, this.position.y + sqrtRad / 2);
		context.closePath();
		context.fill();

		// and on the bottom right
		context.fillStyle = darkColour;
		context.beginPath();
		context.arc(this.position.x, this.position.y, radius, -Math.PI / 4, 3 * Math.PI / 4);
		context.bezierCurveTo(this.position.x, this.position.y + radius, this.position.x + radius, this.position.y,  this.position.x + sqrtRad / 2, this.position.y - sqrtRad / 2);
		context.closePath();
		context.fill();

		// shade it on the top left
		context.fillStyle = brightest;
		context.beginPath();
		context.arc(this.position.x, this.position.y, radius, 3 * Math.PI / 4, 7 * Math.PI / 4);
		context.bezierCurveTo(this.position.x, this.position.y - radius, this.position.x - radius, this.position.y,  this.position.x - sqrtRad / 2, this.position.y + sqrtRad / 2);
		context.closePath();
		context.fill();

	context.restore();
};

ballClass.prototype.move = function(){
	var xResolution = settings.gridScale * settings.gridSize.x;
	var yResolution = settings.gridScale * settings.gridSize.y;

	this.position.x += this.velocity.dx;
	this.position.y += this.velocity.dy;

	if(this.position.x < this.radius){
		this.position.x = Math.abs(this.position.x)
		this.velocity.dx = Math.abs(this.velocity.dx);
	}

	if(this.position.x >= xResolution - this.radius){
		this.velocity.dx = -Math.abs(this.velocity.dx);
	}

	if(this.position.y < 0){
		this.position.y = Math.abs(this.position.y);
		this.velocity.dy = Math.abs(this.velocity.dy);
	}

	if(this.position.y >= yResolution - this.radius && this.velocity.dy > 0){
		this.velocity.dy = 0;
		this.velocity.dx = 0;
		player.newX = this.position.x;
	}
};


ballClass.prototype.checkCollisions = function(){
	var block = null, n;
	var edgeBits; // <-- named so because it will store bitflags to note which edges are collided with
	var gridx = Math.floor(this.position.x / settings.gridScale);
	var gridy = Math.floor(this.position.y / settings.gridScale);

	var blockCenter = {
		x: (gridx + .5) * settings.gridScale,
		y: (gridy + .5) * settings.gridScale
	};


	for(n = 0; n < blocks.length; n++){
		if(blocks[n].position.x == gridx && blocks[n].position.y == gridy){
			block = blocks[n];
			break;
		}
	}

	if(block != undefined){
		// we are colliding with a block

		edgeFlags = this.getCollisionSide(block);


		if(1 & edgeFlags){ // top of block
			this.velocity.dy = -Math.abs(this.velocity.dy);
		}

		if(2 & edgeFlags){ // right edge
			this.velocity.dx = Math.abs(this.velocity.dx)
		}

		if(4 & edgeFlags){ // bottom edge
			this.velocity.dy = Math.abs(this.velocity.dy);
		}

		if(8 & edgeFlags){// left edge
			this.velocity.dx = -Math.abs(this.velocity.dx)
		}

		/*
			What I have here is pretty good.  There are some issues though:
			1) the balls move fast enough that if two blocks are corner-to-corner,
			   the balls can move right between them, jumping across.

			   One solution to that would be to use the same collision detection in edge
			   flags, but instead of testing two points and checking for line intersection,
			   trace every pixel on the step, and check for collisions with each one, bouncing
			   as we trace, giving us the correct position.

			2) The motion is too uniform.  The slope you launch at is maintained throughout
			   each run.  A solution to this would be to account for the rounded curve
			   edges on the blocks, treating them like circles to bounce off of.

		*/

		/*
		// old code
		if(edgeFlags && !15){
			var speed = distance(0, 0, this.velocity.dx, this.velocity.dy);
			this.velocity = unitVector(this.position.x - blockCenter.x, this.position.y - blockCenter.y);
			this.velocity.dx *= speed;
			this.velocity.dy *= speed;
		}
		*/

		hitBlock(n);

	}
}

ballClass.prototype.getCollisionSide = function(block){
	var n, p1, p2;
	var oldx = this.position.x - this.velocity.dx;
	var oldy = this.position.y - this.velocity.dy;
	var collisionTally = 0;

	for(n = 0; n < 4; n++){
		p1 = block.getCornerVector(n);
		p2 = block.getCornerVector((n + 1) % 4);
		if(
		     sideOfLine(p1.x, p1.y, p2.x, p2.y, oldx, oldy) 
		  != sideOfLine(p1.x, p1.y, p2.x, p2.y, this.position.x, this.position.y)
		){
			collisionTally += 1 << n;

/*
			context.save();
				context.lineWidth = 5;
				context.strokeStyle = 'rgb(255, 255, 64)';
				context.beginPath();
				context.moveTo(p1.x, p1.y);
				context.lineTo(p2.x, p2.y);
				context.stroke();
				context.closePath();
			context.restore();
*/
		}
	}
	return collisionTally;

}


var blockClass = function(strength){
	if(strength == undefined) strength = 1;
	this.strength = strength;
	this.position = {
		x : 0,
		y : 0
	};
	this.rgb = {
		red : 0, green : 0, blue : 0
	};
	this.pickAColour();

	this.realX = function(){
		return this.position.x * settings.gridScale;
	};

	this.realY = function(){
		return this.position.y * settings.gridScale;
	};

};

blockClass.prototype.getCornerVector = function(idx){
	var rval;
	switch(idx){
		case 0:
			rval = { 
				x : this.position.x * settings.gridScale,
				y : this.position.y * settings.gridScale
			}; 
			break;

		case 1: 
			rval = { 
				x : (this.position.x + 1) * settings.gridScale - 1,
				y : this.position.y * settings.gridScale
			}; 
			break;
		case 2: 
			rval = { 
				x : (this.position.x + 1) * settings.gridScale - 1,
				y : (this.position.y + 1) * settings.gridScale - 1
			}; 
			break;
		case 3:
			rval = { 
				x : this.position.x * settings.gridScale,
				y : (this.position.y + 1) * settings.gridScale - 1
			}; 
			break;
		default:
			throw "blockClass.getCornerVector: invalid corner index \"" + idx + "\"";
	}
	return rval;
}

blockClass.prototype.draw = function(x, y){
	var darkColour = 'rgba(' + (this.rgb.red >> 1) + ', ' + (this.rgb.green >> 1) + ', ' + (this.rgb.blue >> 1) + ', 0.6)';
	var darkColour2 = 'rgba(' + (this.rgb.red >> 1) + ', ' + (this.rgb.green >> 1) + ', ' + (this.rgb.blue >> 1) + ', 1)';
	var quarterblock = settings.gridScale >> 3;
	var halfblock = settings.gridScale >> 1;
	if(x == undefined) x = this.realX();
	if(y == undefined) y = this.realY();

	// let's draw the surrounding box with rounded corners:
	context.beginPath();
	context.fillStyle = this.colour;
	context.strokeStyle = this.negative;
	context.lineWidth = settings.gridScale >> 4;
	context.moveTo(x, y + quarterblock);
	context.quadraticCurveTo(x, y, x + quarterblock, y);
	context.lineTo(x + settings.gridScale - quarterblock, y);

	context.quadraticCurveTo(x + settings.gridScale, y, x + settings.gridScale, y + quarterblock);
	context.lineTo(x + settings.gridScale, y + settings.gridScale - quarterblock);

	context.quadraticCurveTo(x + settings.gridScale, y + settings.gridScale, x + settings.gridScale - quarterblock, y + settings.gridScale);
	context.lineTo(x + quarterblock, y + settings.gridScale);

	context.quadraticCurveTo(x, y + settings.gridScale, x, y + settings.gridScale - quarterblock);
	context.closePath();
	context.fill();

	// add some text
	context.textAlign = 'center';
	var fontSize = Math.floor(settings.gridScale /  (1 + log10(this.strength) / 2));
	context.font = fontSize + "px PoorStory";

	context.fillStyle = 'rgba(255, 255, 255, .6)';
	context.fillText(this.strength, x + halfblock + 2, y + halfblock + 2 + fontSize / 3);

	context.fillStyle = darkColour2;//'rgba(0, 0, 0, 1)';
	context.fillText(this.strength, x + halfblock, y + halfblock + fontSize / 3);


	// add some shading, first with white shading at the top
	context.beginPath();
	context.fillStyle = 'rgba(255, 255, 255, .6)';
	context.moveTo(x, y + settings.gridScale - quarterblock);
	context.lineTo(x, y + quarterblock);
	context.quadraticCurveTo(x, y, x + quarterblock, y);
	context.lineTo(x + settings.gridScale - quarterblock, y);
	context.quadraticCurveTo(x + settings.gridScale, y, x + settings.gridScale, y + quarterblock);
	context.bezierCurveTo(
		x, 
		y, 
		x + quarterblock, 
		y + quarterblock, 
		x, 
		y + settings.gridScale - quarterblock
	);

	context.fill();
	context.closePath();
	// and now some dark colour shading at the bottom
	context.beginPath();
	context.fillStyle = darkColour;
	context.moveTo(x + settings.gridScale, y + quarterblock);
	context.lineTo(x + settings.gridScale, y + settings.gridScale - quarterblock);
	context.quadraticCurveTo(x + settings.gridScale, y + settings.gridScale, x + settings.gridScale - quarterblock, y + settings.gridScale);
	context.lineTo(x + quarterblock, y + settings.gridScale);
	context.quadraticCurveTo(x, y + settings.gridScale, x, y + settings.gridScale - quarterblock);
	context.bezierCurveTo(
		x + settings.gridScale,
		y + settings.gridScale,
		x + settings.gridScale - quarterblock,
		y + settings.gridScale - quarterblock,
		x + settings.gridScale,
		y + quarterblock
	);

	context.fill();
	context.closePath();

};

// sets the colour for this block.
blockClass.prototype.pickAColour = function(){
	var ratio, colourSum;
	this.rgb = {
		red : 128 + Math.floor(Math.random() * 128),
		green : 128 + Math.floor(Math.random() * 128),
		blue : 128 + Math.floor(Math.random() * 128)
	};

	this.negative = 'rgb(' + (this.rgb.red >> 2) + ', ' + (this.rgb.green >> 2) + ', ' + (this.rgb.blue >> 2) + ')';
	this.colour = 'rgb(' + this.rgb.red + ', ' + this.rgb.green + ', ' + this.rgb.blue + ')';
}

function hitBlock(idx){
	blocks[idx].strength--;
	if(blocks[idx].strength <= 0){
		blocks.splice(idx, 1);
	}
}
/////////////////////////////////a


function startRound(){
	//player.level++;

	if(dropBlocks()){
		doGameOver();
		return;
	}

	// add a top row
	addBlockRow();

	// wait for user input
	gameState = 'aiming';
	playerTurn();
}

function playerTurn(){
	var mouseState = 0;

	var handleMouseDown = function(e){
		mouseState = 1;

	}

	var handleMouseUp = function(e){
		if(mouseState == 1){
			gameCanvas.removeEventListener('mousemove', handleMouseTargeting);
			gameCanvas.removeEventListener('mouseup', handleMouseUp);
			gameCanvas.removeEventListener('mousedown', handleMouseDown);
			player.angle = rel_ang(player.x, settings.gridSize.y * settings.gridScale, e.offsetX, e.offsetY);
			player.angle = scrubAimingAngle(player.angle);
			player.fire();
		}
		mouseState = 0;
	};

	gameCanvas.addEventListener('mousemove', handleMouseTargeting);
	gameCanvas.addEventListener('mousedown', handleMouseDown);
	gameCanvas.addEventListener('mouseup', handleMouseUp);
}


var handleMouseTargeting = (function(){
	var lastTime = 0;
	return function(e){
		// only allow a canvas update every 50ms at the most
		var dateTime = new Date();
		var time = dateTime.getTime();
		if(time < lastTime + 25){
			return;
		}
		lastTime = time;

		// get the relative angle between the current location and the mouse pointer

		doAiming(e.offsetX, e.offsetY);
	}
})();

function scrubAimingAngle(angle){
	if(angle > settings.minAngle && angle < Math.PI) angle = settings.minAngle;
	if(angle < settings.maxAngle && angle > Math.PI) angle = settings.maxAngle;
	return angle;
}

function doAiming(targetX, targetY){
	// calculate the correct angle
	player.angle = scrubAimingAngle(rel_ang(
		player.x, settings.gridSize.y * settings.gridScale, targetX, targetY
	));
}

function renderArrow(){
	// for now we'll draw the arrow with simple vectors.  In the future, I'd like
	// to replace it with a particular raster image, assets/images/OrangeArrow.png
	var arrowPoints = [
		-1, -2,  -1, -5,  -2, -4.5,  0, -7.5,  2, -4.5, 1, -5, 1, -2
	];
	var n;
	var px = player.x;
	var py = settings.gridSize.y * settings.gridScale

	// scale the arrow vectors to match the game scale
	for(n = 0; n < arrowPoints.length; n++){
		arrowPoints[n] *= settings.gridScale / 5;
	}

	// drow the arrow
	context.save();
		context.beginPath();
		context.fillStyle = 'rgb(160, 120, 64)';
/*
// leftover for reference, this is how you want to do the image, but I might just use my sprite library for it instead
var img = new Image();
img.src = "assets/images/OrangeArrow.png";
var pattern = context.createPattern(img, "repeat");
context.fillStyle = pattern;
*/

		context.strokeStyle = 'rgb(255, 255, 64)';
		context.translate(px, py);
		context.rotate(player.angle);
		context.moveTo(arrowPoints[0], arrowPoints[1]);

		for(n = 2; n < arrowPoints.length; n += 2){
			context.lineTo(arrowPoints[n], arrowPoints[n + 1]);
		}

		context.closePath();
		context.fill();
		context.stroke();
	context.restore();

}

function animateBalls(){
	var animated = false;
	var ball, n;
	for(n = 0; n < player.balls.length; n++){
		ball = player.balls[n];
		if(ball.velocity.dx == 0 && ball.velocity.dy == 0){
			ball.draw();
			continue;
		}
		animated = true;

		ball.move();
		ball.checkCollisions();

		ball.draw();

	}

	if(!animated){
		endRound();
	}
}

function endRound(){
	gameState = 'endRound';
	player.x = player.newX;
	// additional stuff can be put here
	blockStrength++;
	player.addBall();
	startRound();
}

function renderGame(){
	var n;
	drawBackground();
	for(n = 0; n < blocks.length; n++){
		blocks[n].draw();
	}
	switch(gameState){
		case 'aiming':
			renderArrow();
			break;
		case 'balls moving':
			animateBalls();
			break;
	}

}

drawBackground = (function(){
	var ang = 0;
	var radius = null;//settings.gridScale;
	return function(){
		if(radius === null){
			radius =  (settings.gridSize.y >> 3) * settings.gridScale;// / 5;
		}
		ang += .01;
		if(ang > 4 * Math.PI) ang -= 4 * Math.PI;

		//context.clearRect(0, 0, gameCanvas.width, gameCanvas.height);

		context.save();
		context.fillStyle = "#FFC";
		context.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
		context.restore();
		doBGSine(ang * 2 + 2, radius / 2, gameCanvas.height >> 2, "#EFE0A0"); 
		doBGSine(ang, radius, gameCanvas.height >> 1, "#A85");
		doBGSine(ang  / 2 + 1, radius, gameCanvas.height * .75, "#863");


	};
})();

function doBGSine(ang, radius, midpoint, colour){
	var x, y;
	var stepSize = settings.gridScale * .1;
	var myAng = ang;
	var myAngi = settings.gridScale * .0005;
	context.save();
		context.fillStyle = colour;
		context.beginPath();
		context.moveTo(0, midpoint + radius * Math.sin(ang));
		x = -stepSize;
		do{
			x += stepSize;
			y = midpoint + radius * Math.sin(myAng);
			myAng += myAngi;

			context.lineTo(x, y);
		}while(x < gameCanvas.width);
		context.lineTo(gameCanvas.width, gameCanvas.height);
		context.lineTo(0, gameCanvas.height);
		context.fill();

	context.restore();
}

function addBlockRow(){
	var n, idx;
	for(n = 0; n < settings.gridSize.x; n++){
		if(Math.random() < settings.blockProbability){
			idx = blocks.length;
			blocks[idx] = new blockClass(blockStrength * (Math.random() < .1 ? 2 : 1));
			blocks[idx].position = {
				x : n,
				y : 0
			};
		}
	}
}

function dropBlocks(){
	// move all the current blocks down one notch
	var n;
	var gameOver = 0;
	for(n = 0; n < blocks.length; n++){
		blocks[n].position.y ++;
		if(blocks[n].position.y == settings.gridSize.y){
			gameOver = 1;
		}
	}
	return gameOver;
}

function doGameOver(){
	console.log('Game Over!');
	// WRITE ME - for now this will just restart the game, but in the
	// future it should bring you a menu prompt that will ultimately lead
	// to the initial game load as well.
	initialize(function(){
		blocks = [];
		startRound();
	});
}

/////////////////////////////////
function bestCanvasSize(){
	var parentWidth = gameWrapper.clientWidth;
	var parentHeight = gameWrapper.clientHeight;

	var gridScale = Math.floor(parentHeight / (settings.gridSize.y + .1));
	if((settings.gridSize.x + 2) * gridScale > parentWidth){
		gridScale = Math.floor(parentWidth / (settings.gridSize.x + .1));
	}

	if(gridScale < settings.minTileSize){
		throw "Could not create an area large enough for this game";
	}

	return {
		scale : gridScale,
		width : settings.gridSize.x * gridScale,
		height: settings.gridSize.y * gridScale
	};
}

function initialize(callback, step){
	if(step == undefined){
		step = 'createObjects';
	}
	gameState = step;
	switch(step){
		case 'createObjects':
			player = new playerClass();
			setTimeout(function(){initialize(callback, 'initCanvas');}, 0);
			blockStrength = 1;
			break;
		case 'initCanvas':
			var width, height, bestSize;
			canvasWrapper = document.getElementById('canvasWrapper');
			gameWrapper = document.getElementById('gameWrapper');
			gameCanvas = document.getElementById('gameCanvas');

			// get the right size for the canvas
			try{
				bestSize = bestCanvasSize();
			}catch(e){
				die(e);
				return;
			}

			gameCanvas.width = bestSize.width;
			gameCanvas.height = bestSize.height;
			settings.gridScale = bestSize.scale;
			player.ballSpeed = settings.gridScale / 5;

			// get drawing context
			context = gameCanvas.getContext('2d');

			setTimeout(function(){initialize(callback, 'loadImages');}, 0);
			break;
		case 'loadImages':
			var cacheTally = 1;
			var loadCallback = function(){
				cacheTally --;
				if(cacheTally == 0){
					setTimeout(function(){initialize(callback, 'initPlayer');}, 0);
				}
			};
			var img = new Image();
			img.onload = loadCallback;
			img.src = "assets/images/OrangeArrow.png";

/*
			//var pattern = context.createPattern(img, "repeat");
			//context.fillStyle = pattern;
*/

			break;
		case 'initPlayer':
			player.x = Math.ceil(settings.gridSize.x * settings.gridScale >> 1);
			player.addBall();
			setTimeout(function(){initialize(callback, 'finish initializing');}, 0);
			break;
		case 'finish initializing':
			// We'll use a callback here to allow the use of this function to re-initialize the canvas
			// without resetting the game statse.  That will be done with initialize("initCanvas");
			callback();
			break;
		default:
			throw 'initialize: invalid step name "' + step + '"';
	}
}

window.onload = function(){
	initialize(function(){
		blocks = [];
		setInterval(renderGame, settings.animationFrequency);
		startRound();
	});
};

// grabbed from stack overflow: https://stackoverflow.com/questions/550574/how-to-terminate-the-script-in-javascript
// this function will terminate flow in the program.
function die(status) {
	var i;

	if (typeof status === 'string') {
		//console.log(status);
	}

	window.addEventListener('error', function (e) {e.preventDefault();e.stopPropagation();}, false);

	var handlers = [
		'copy', 'cut', 'paste',
		'beforeunload', 'blur', 'change', 'click', 'contextmenu', 'dblclick', 'focus', 'keydown', 'keypress', 'keyup', 'mousedown', 'mousemove', 'mouseout', 'mouseover', 'mouseup', 'resize', 'scroll',
		'DOMNodeInserted', 'DOMNodeRemoved', 'DOMNodeRemovedFromDocument', 'DOMNodeInsertedIntoDocument', 'DOMAttrModified', 'DOMCharacterDataModified', 'DOMElementNameChanged', 'DOMAttributeNameChanged', 'DOMActivate', 'DOMFocusIn', 'DOMFocusOut', 'online', 'offline', 'textInput',
		'abort', 'close', 'dragdrop', 'load', 'paint', 'reset', 'select', 'submit', 'unload'
	];

	function stopPropagation (e) {
		e.stopPropagation();
		// e.preventDefault(); // Stop for the form controls, etc., too?
	}
	for (i = 0; i < handlers.length; i++) {
		window.addEventListener(handlers[i], function (e) {stopPropagation(e);}, true);
	}

	if (window.stop) {
		window.stop();
	}

	throw '';
}

// Need this because IE is a fucking tit
function log10(value){
	return Math.log(value) / Math.log(10);
}

// return a unit vector matching the specified one
function unitVector(dx, dy){
	var length = Math.sqrt(dx * dx + dy * dy);
	dx /= length;
	dy /= length;
	return { dx : dx, dy : dy };
}


var settings = {
	gridScale : 0, // <-- calculated in "bestCanvasSize()"
	gridSize : { x : 8 , y : 12},
	minTileSize : 5,
	blockProbability : .4,
	minAngle : 7 * Math.PI / 16,
	maxAngle : 25 * Math.PI / 16,
	animationFrequency : 40
};

var gameCanvas, canvasWrapper, gameWrapper, context, player, blockStrength, blocks;

var playerClass = function(){
	this.level = 0;
	this.x = 0;
	this.angle = 0;
	this.ballSpeed = 5;
	this.launchFrequency = 200;
	this.balls = [];
};

playerClass.prototype.fire = function(){
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

	var interval = setInterval(function(){
		var ball = this.balls[idx++];
		// set the ball's position to that of the player
		ball.position = {
			x : this.x,
			y : settings.gridScale * settings.gridSize.y
		};
		// set its velocity correctly
		ball.velocity = {
			dx : -Math.sin(this.angle) * this.ballSpeed,
			dy : Math.cos(this.angle) * this.ballSpeed
		}
		// stop after looping through all the balls
		if(idx >= balls.length){
			clearInterval(interval);
			/****************************


Here we should set the state to animateballs;
		
console.log('foo');

			***************************/
		}
	}, this.launchFrequency);
};

var ballClass = function(){
	this.position = {x: 0, y : 0};
	this.velocity = {dx: 0, dy : 0};
	this.animaionInterval = null;
};

ballClass.prototype.move = function(){
	this.position.x += this.velocity.dx;
	this.position.y += this.velocity.dy;

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

blockClass.prototype.draw = function(x, y){
	var darkColour = 'rgba(' + (this.rgb.red >> 1) + ', ' + (this.rgb.green >> 1) + ', ' + (this.rgb.blue >> 1) + ', 0.6)';
	var darkColour2 = 'rgba(' + (this.rgb.red >> 1) + ', ' + (this.rgb.green >> 1) + ', ' + (this.rgb.blue >> 1) + ', 1)';
	var quarterblock = settings.gridScale >> 3;
	var halfblock = settings.gridScale >> 1;
	if(x == undefined) x = this.realX();
	if(y == undefined) y = this.realY();

	// let's draw the surrounding box with rounded corners:
	context.fillStyle = this.colour;
	context.strokeStyle = this.negative;
	context.lineWidth = settings.gridScale >> 4;
	context.beginPath();
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
/////////////////////////////////
function startRound(){
	player.level++;

	if(dropBlocks()){
		doGameOver();
		return;
	}

	// add a top row
	addBlockRow();
	
	// draw the game area
	renderGame();

	// wait for user input
	playerTurn();
//	setTimeout(startRound, 100);

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

		renderGame();
		doAiming(e.offsetX, e.offsetY);
	}
})();

function scrubAimingAngle(angle){
	if(angle > settings.minAngle && angle < Math.PI) angle = settings.minAngle;
	if(angle < settings.maxAngle && angle > Math.PI) angle = settings.maxAngle;
	return angle;
}

function doAiming(targetX, targetY){
	// for now we'll draw the arrow with simple vectors.  In the future, I'd like
	// to replace it with a particular raster image, assets/images/OrangeArrow.png
	var arrowPoints = [
		-1, 0,  -1, -5,  -2, -4.5,  0, -7.5,  2, -4.5, 1, -5, 1, 0
	];
	var n;
	var px = player.x;
	var py = settings.gridSize.y * settings.gridScale

	// calculate the correct angle
	player.angle = scrubAimingAngle(rel_ang(px, py, targetX, targetY));

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

function renderGame(){
	var n;

	context.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
	for(n = 0; n < blocks.length; n++){
		blocks[n].draw();
	}
}

function addBlockRow(){
	var n, idx;
	for(n = 0; n < settings.gridSize.x; n++){
		if(Math.random() < settings.blockProbability){
			idx = blocks.length;
			blocks[idx] = new blockClass(player.level);
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

	var gridScale = Math.floor(parentHeight / (settings.gridSize.y + 2));
	if((settings.gridSize.x + 2) * gridScale > parentWidth){
		gridScale = Math.floor(parentWidth / (settings.gridSize.x + 2));
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
	switch(step){
		case 'createObjects':
			player = new playerClass();
			setTimeout(function(){initialize(callback, 'initCanvas');}, 0);
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

			//var pattern = context.createPattern(img, "repeat");
			//context.fillStyle = pattern;
			
			break;
		case 'initPlayer':
			player.x = Math.ceil(settings.gridSize.x * settings.gridScale >> 1);
			player.addBall();
			setTimeout(function(){initialize(callback, 'finish');}, 0);
			break;
		case 'finish':
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

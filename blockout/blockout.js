var settings = {
	gridScale : 0, // <-- calculated in "bestCanvasSize()"
	gridSize : { x : 6 , y : 9},
	minTileSize : 5,
	blockProbability : .5,
	minAngle : 7 * Math.PI / 16,
	maxAngle : 25 * Math.PI / 16,
	animationFrequency : 24,
	defaultBallRadius: 15,
	ballRadiusScale : 1 / 75,
	bonusBlockChance : 0.1
};

var gameCanvas, canvasWrapper, gameWrapper, context, player, blockStrength, blocks, gameState;



var playerClass = function(){
	this.level = 0;
	this.x = 0;
	this.newX = 0;
	this.angle = 0;
	this.ballSpeed = 16;
	this.launchFrequency = Math.floor(settings.defaultBallRadius * 10);
	this.balls = [];
	this.score = 0;
	this.scoreIncrement = 1;
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
	var idx = 0;
	var me = this;

	gameState = 'balls moving';
	player.scoreIncrement = 1;
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
	this.radius = settings.defaultBallRadius + Math.random() * settings.defaultBallRadius ;
	this.moving = false;
	this.colour = {};
	this.pickAColour();
	// balls can now rotate as they fly, but for the default ball type, that shouldn't happen
	this.angle = 0;//Math.random() * 2 * Math.PI;
	this.angi = 0;//Math.random() < 0.5 ? -.1 : .1;

	// stepTally is used for counting ratios in using Bresenham's line algorithm to trace ball motion.
	// we need it to be consistent with the object for accuracy.  If it's set to zero with each call
	// to the ball's move function, then it becomes slightly inaccurate, making the aim often inaccurate
	// by several pixels.
	this.stepTally = 0;

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
	var radius = settings.gridScale * this.radius * settings.ballRadiusScale;
	var colour = 'rgb(' + this.colour.red + ', ' + this.colour.green + ', ' + this.colour.blue + ')';
	var brightColour = 'rgba(' + brighten(this.colour.red) + ', ' + brighten(this.colour.green) + ', ' + brighten(this.colour.blue) + ')';
	var darkColour = 'rgba(' + darken(this.colour.red) + ', ' + darken(this.colour.green) + ', ' + darken(this.colour.blue) + ')';
	var brightest = 'rgba(255, 255, 255, 0.6)';
	var sqrtRad = Math.floor(Math.sqrt(2 * radius * radius));
	context.save()
		context.translate(this.position.x, this.position.y);
		context.rotate(this.angle);
		// first draw the circle
		context.fillStyle = colour;
		context.beginPath();
		context.arc(0, 0, radius, 0, 2 * Math.PI);
		context.fill();
		context.closePath();

		// shade it on the top left
		context.fillStyle = brightColour;
		context.beginPath();
		context.arc(0, 0, radius, 3 * Math.PI / 4, 7 * Math.PI / 4);
		context.bezierCurveTo(0,  -radius / 3,  -radius / 3, 0,  -sqrtRad / 2, sqrtRad / 2);
		context.closePath();
		context.fill();

		// and on the bottom right
		context.fillStyle = darkColour;
		context.beginPath();
		context.arc(0, 0, radius, -Math.PI / 4, 3 * Math.PI / 4);
		context.bezierCurveTo(0, radius, radius, 0, sqrtRad / 2, -sqrtRad / 2);
		context.closePath();
		context.fill();

		// shade it on the top left
		context.fillStyle = brightest;
		context.beginPath();
		context.arc(0, 0, radius, 3 * Math.PI / 4, 7 * Math.PI / 4);
		context.bezierCurveTo(0, -radius, -radius, 0,  -sqrtRad / 2, sqrtRad / 2);
		context.closePath();
		context.fill();

	context.restore();
};

ballClass.prototype.move = function(){
	var xResolution = settings.gridScale * settings.gridSize.x;
	var yResolution = settings.gridScale * settings.gridSize.y;


	var radius = settings.gridScale * this.radius * settings.ballRadiusScale;
	var sgndx = Math.sign(this.velocity.dx);
	var sgndy = Math.sign(this.velocity.dy);
	var absdx = Math.abs(this.velocity.dx);
	var absdy = Math.abs(this.velocity.dy);
	var n;
	var minDY = settings.gridScale / 10;
	if(minDY < 1) minDY = 1;

	var alreadyHit = {};

	var testBlockCollision = function(){
		// we're defining this function locally because we need access to the same variables.
		var n, center;
		var xdist, ydist;
		var halfWidth = settings.gridScale >> 1;
		var cornerRadius = settings.gridScale >> 2;

		for(n = 0; n < blocks.length; n++){
			center = blocks[n].centerPoint();
			xdist = Math.abs(center.x - this.position.x) - radius;
			if(xdist < halfWidth){
				ydist = Math.abs(center.y - this.position.y) - radius;
				if(ydist < halfWidth){	
					if(alreadyHit[n] != undefined){
						continue;
					}
					alreadyHit[n] = 1;

					if(Math.abs(xdist - ydist) < cornerRadius){
						var speed = distance(this.velocity.dx, this.velocity.dy);
						var dx = this.position.x - center.x;
						var dy = this.position.y - center.y;
						var unitLength = Math.sqrt(dx * dx + dy * dy);
						this.velocity = {
							dx : speed * dx / unitLength,
							dy : speed * dy / unitLength
						}
						this.angi *= -1

					}else{
						// we're hitting a side, so we'll just negate the velocity on that axis
						if(xdist >= ydist){
							sgndx *= -1;
							this.velocity.dx *= -1;
							this.position.x += 2 * sgndx;
							this.angi *= -1;
						}

						if(ydist >= xdist){
							sgndy *= -1;
							this.velocity.dy *= -1;
							this.position.y += 2 * sgndy;
							this.angi *= -1
						}
					}
					hitBlock(n);

				}else if(alreadyHit[n] != undefined){
					alreadyHit[n] = undefined;
				}
			}else if(alreadyHit[n] != undefined){
				alreadyHit[n] = undefined;
			}
		}
	}
	/*
		Here we'll use Bresenham's line algorithm to trace the balls'
		movements, allowing us to accurately bounce off the edges.
	*/

	if(absdx > absdy){
		for(n = 0; n < absdx; n++){
			this.position.x += sgndx;
			if(
			   (this.position.x < radius && this.velocity.dx < 0) ||
			   (this.position.x >= xResolution - radius && this.velocity.dx > 0)
			){
				sgndx *= -1;
				this.velocity.dx *= -1;
				this.position.x += 2 * sgndx;
				this.angi *= -1;
			}


			this.stepTally += absdy;
			if(this.stepTally > absdx){
				this.position.y += sgndy;
				if(this.position.y < radius){
					sgndy *= -1;
					this.velocity.dy *= -1;
					this.position.y += 2 * sgndy;
					this.angi *= -1;
				}
				if(this.position.y >= yResolution + radius){ // +radius to let it go off bottom
					this.velocity.dy = 0;
					this.velocity.dx = 0;
					player.newX = this.position.x;
				}
				this.stepTally -= absdx;
			}
			testBlockCollision.call(this);
		}
	}else{
		for(n = 0; n < absdy; n++){
			this.position.y += sgndy;
			if(this.position.y < radius){
				sgndy *= -1;
				this.velocity.dy *= -1;
				this.position.y += 2 * sgndy;
				this.angi *= -1
			}

			if(this.position.y >= yResolution + radius){ // +radius to let it go off bottom
				this.velocity.dy = 0;
				this.velocity.dx = 0;
				player.newX = this.position.x;
			}

			this.stepTally += absdx;
			if(this.stepTally > absdy){
				this.position.x += sgndx;
				if(
				   (this.position.x < radius && this.velocity.dx < 0) ||
				   (this.position.x >= xResolution - radius && this.velocity.dx > 0)
				){
					sgndx *= -1;
					this.velocity.dx *= -1;
					this.position.x += 2 * sgndx;
					this.angi *= -1;
				}
				this.stepTally -= absdy;
			}
			testBlockCollision.call(this);
		}

	}
	this.angle += this.angi;

};


var blockClass = function(strength){
	if(strength == undefined) strength = 1;
	this.originalStrength = strength
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

	this.hasBonus = false;
	this.isBonus = false;
	// a weird one-off for animating blocks that have a bonus ready to go
	this.starAngle = 0;
};

blockClass.prototype.centerPoint = function(){
	return {
		x : Math.floor((this.position.x + .5) * settings.gridScale),
		y : Math.floor((this.position.y + .5) * settings.gridScale)
	};
}

function texasStar(cx, cy, radius, angle){
	var numPoints = 5, n, innerRadius = Math.round(radius * .5), ang, x, y, r;
	context.save();
		context.beginPath();
		context.fillStyle = 'rgba(255, 255, 192, .8)';
		context.strokeStyle = 'rgb(64, 64, 32)';
		context.lineWidth = settings.gridScale >> 4;
		context.translate(cx, cy);
		context.rotate(Math.sin(angle) * .5);
		for(n = 0; n < numPoints * 2; n++){
			r = n & 1 ? innerRadius : radius;
			ang = (Math.PI / numPoints) * n + Math.PI;
			x = Math.sin(ang) * r;
			y = Math.cos(ang) * r;
			if(n == 0){
				context.moveTo(x, y);
			}else{
				context.lineTo(x, y);
			}
		}
		context.closePath();
		context.stroke();
		context.fill();
	context.restore();
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

	if(this.hasBonus){
		// if this block has a bonus waiting inside, we add a texas star under the number
		this.starAngle += .1;
		texasStar(x + halfblock, y + halfblock, halfblock * .8, this.starAngle);
	}else if(this.isBonus){
		this.starAngle += .15
		texasStar(
			x + 3 * halfblock / 2,
			y + 3 * halfblock / 2, 
			halfblock * Math.abs(Math.sin(1 + this.starAngle)/ 3) + .3, 
			this.starAngle
		);
		texasStar(
			x + halfblock,
			y + halfblock / 2,
			halfblock * Math.abs(Math.sin(this.starAngle)/ 3) + .3,
			this.starAngle + 2
		);
		texasStar(
			x + halfblock / 2,
			y + halfblock,
			halfblock * Math.abs(Math.cos(this.starAngle)/ 3) + .3,
			this.starAngle + 1
		);
		
	}

	// add some text
	context.textAlign = 'center';
	var fontSize = Math.floor(settings.gridScale /  (1 + log10(this.strength) / 2));
	context.font = fontSize + "px PoorStory";

	context.fillStyle = 'rgba(255, 255, 255, .6)';
	context.fillText(this.strength, x + halfblock + 2, y + halfblock + 2 + fontSize / 3);

	context.fillStyle = darkColour2;//'rgba(0, 0, 0, 1)';
	context.fillText(this.strength, x + halfblock, y + halfblock + fontSize / 3);





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
		if(blocks[idx].hasBonus){
			blocks[idx].strength = blocks[idx].originalStrength;
			blocks[idx].hasBonus = false;
			blocks[idx].isBonus = true;
		}else if(blocks[idx].isBonus){
			blocks.splice(idx, 1);
			player.score += player.scoreIncrement;
			player.scoreIncrement += blocks[idx].originalStrength;
			console.log("ADD BONUS UPGRADE HERE");
		}else{
			blocks.splice(idx, 1);
			player.score += player.scoreIncrement;
			player.scoreIncrement ++;
		}
	}else{
		player.score++;
	}
}


////////////////////////////////

function startRound(){
	player.level++;

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
		// only update the arrow with the animation frequency at the most
		var dateTime = new Date();
		var time = dateTime.getTime();
		if(time < lastTime + settings.animationFrequency){
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
	var arrowPoints = [
		-.8, -2,  -.8, -5,  -2, -4.75,  0, -7.5,  2, -4.75, .8, -5, .8, -2
	];
	var n;
	var px = player.x;
	var py = settings.gridSize.y * settings.gridScale

	var arrowStyle = context.createLinearGradient(0, 0, 170, 0);
	arrowStyle.addColorStop(0, "#FEA");
	arrowStyle.addColorStop(0.2, "#FA0");
	arrowStyle.addColorStop(0.5, "#A80");
	arrowStyle.addColorStop(1, "white");

	// scale the arrow vectors to match the game scale
	for(n = 0; n < arrowPoints.length; n++){
		arrowPoints[n] *= settings.gridScale >> 3;
	}

	// drow the arrow
	context.save();
		context.beginPath();
		context.lineJoin = 'round';
		context.lineWidth = 5;
		context.translate(px, py);
		context.rotate(player.angle);
		context.moveTo(arrowPoints[0], arrowPoints[1]);

		for(n = 2; n < arrowPoints.length; n += 2){
			context.lineTo(arrowPoints[n], arrowPoints[n + 1]);
		}

		context.closePath();

		context.fillStyle = arrowStyle;
		context.strokeStyle = arrowStyle;

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
	drawStats();
	switch(gameState){
		case 'aiming':
			renderArrow();
			break;
		case 'balls moving':
			animateBalls();
			break;
	}

}

function drawStats(){
	context.save();
		var fontSize = Math.floor(settings.gridScale * .4);
		var marginSize = fontSize / 2;
		var bottomY = settings.gridScale * settings.gridSize.y - marginSize;
		var rightX = settings.gridScale * settings.gridSize.x - marginSize / 2;
		context.fillStyle = 'rgba(160, 160, 160, .6)';
		context.fillRect(0, settings.gridScale * (settings.gridSize.y - .75), gameCanvas.width, settings.gridScale * .75);
		context.fillStyle = 'rgba(190, 190, 190, .6)';
		context.fillRect(0, settings.gridScale * (settings.gridSize.y - .75), gameCanvas.width, settings.gridScale * .125);
		context.font = fontSize + "px fatternregular";
		context.textAlign = 'left';
		context.fillStyle = 'rgba(128, 64, 48, 1)';
		context.fillText('LEVEL: ' + player.level, marginSize + 3, bottomY + 3);
		context.fillStyle = 'rgba(255, 196, 128, 1)';
		context.fillText('LEVEL: ' + player.level, marginSize, bottomY);

		context.textAlign = 'right';
		context.fillStyle = 'rgb(64, 128, 48, 1)';
		context.fillText('SCORE: ' + player.score, rightX + 3, bottomY + 3);
		context.fillStyle = 'rgba(196, 255, 128, 1)';
		context.fillText('SCORE: ' + player.score, rightX, bottomY);
	context.restore();
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
	do{
		for(n = 0; n < settings.gridSize.x; n++){
			if(Math.random() < settings.blockProbability){
				idx = blocks.length;
				blocks[idx] = new blockClass(blockStrength/* * (Math.random() < .1 ? 2 : 1)*/);
				blocks[idx].position = {
					x : n,
					y : 0
				};
				if(Math.random() < .5){//settings.bonusBlockChance){
					blocks[idx].hasBonus = true;
				}
			}
		}
	}while(blocks.length == 0);
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
	var marginScale = .2;

	var gridScale = Math.floor(parentHeight / (settings.gridSize.y + marginScale));
	if((settings.gridSize.x + marginScale) * gridScale > parentWidth){
		gridScale = Math.floor(parentWidth / (settings.gridSize.x + marginScale));
	}
//	debugger;

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
			setTimeout(function(){initialize(callback, 'initPlayer');}, 0);
			/*
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
			*/
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

var game, context, player;

var soundEffects, music, muted = false, musicVolume = 0 * .5, effectsVolume = 1;
/////////////////////////////////////////////////////////////////////////////////////////////
// the game class
/////////////////////////////////////////////////////////////////////////////////////////////
var gameClass = function(){
	var self = this;

	// various static settings
	this.gridScale = 0; // <-- calculated in "bestCanvasSize()"
	this.textShadowOffset = 0; // <-- ditto
	this.gridSize = { x : 6 , y : 9};
	this.minTileSize = 5;
	this.blockProbability = .5;
	this.minAngle = 7 * Math.PI / 16;
	this.maxAngle = 25 * Math.PI / 16;
	this.animationFrequency = 24;
	this.minBallRadius = 10;
	this.ballRadiusScale = 1 / 75;
	this.bonusBlockChance = 0.1;
	this.defaultBallSpeed = 16;
	this.menuOptions = [
		{
			'label' : 'Play',
			'action' : function(){ self.start(); },
			'hovering' : 0
		},
		{
			'label' : 'Settings',
			'action' : function(){alert('Not implemented');},
			'hovering' : 0
		},
		{
			'label' : 'About',
			'action' : function(){alert('Not implemented');},
			'hovering' : 0
		},
		{
			'label' : 'Exit',
			'action' : function(){ document.location.href = window.location;},
			'hovering' : 0
		}
	];

	// initialize variables
	this.canvas = null;
	this.state = 'initializing';
	this.blockStrength = 0;
	this.blocks = [];
	this.balls = [];
	this.bgAng = 0;
	this.bonuses = [];
};

gameClass.prototype.drawBackground = function(){
	var radius =  (this.gridSize.y >> 3) * this.gridScale;// / 5;

	this.bgAng += .01;
	if(this.bgAng > 4 * Math.PI) this.bgAng -= 4 * Math.PI;

	context.save();
	context.fillStyle = "#FFC";
	context.fillRect(0, 0, this.canvas.width, this.canvas.height);
	context.restore();
	doBGSine(this.bgAng * 2 + 2, radius / 2, this.canvas.height >> 2, "#EFE0A0"); 
	doBGSine(-this.bgAng, radius, this.canvas.height >> 1, "#A85");
	doBGSine(this.bgAng / 2 + 1, radius, this.canvas.height * .75, "#863");
};


gameClass.prototype.dropBlocks = function(callback){
	var n, gameOver = 0;
	var tally = 0, increment = .0012;
	var me = this;
	playSound('swish');
	// add a top row
	this.addBlockRow();
	// move them down and shift their offset up
	for(n = 0; n < this.blocks.length; n++){
		this.blocks[n].position.y ++;
		this.blocks[n].offset.y --;
	}

	// drop them by reducing the offset at an accelerating rate
	var interval = setInterval(function(){
		for(n = 0; n < me.blocks.length; n++){
			me.blocks[n].offset.y += increment;
		}
		tally += increment;
		increment *= 1.5;
		if(tally >= 1){
			clearInterval(interval);
			for(n = 0; n < me.blocks.length; n++){
				me.blocks[n].offset.y -= tally;
				me.blocks[n].offset.y ++;
				if(me.blocks[n].position.y == me.gridSize.y - 1){
					gameOver = 1;
				}
			}
			// We're all done, let's do the callback
			callback(gameOver);
		}
	}, this.animationFrequency);
};

gameClass.prototype.startRound = function(){
	player.level++;
	var me = this;

	this.dropBlocks(function(gameOver){
		if(gameOver){
			// need to add some "game over" animation
			playSound('gameOver');
			console.log('add game over animation');
			game.state = 'menu';
			game.initializeMenu();
		}else{
			// wait for user input
			me.state = 'aiming';
			player.takeTurn();
		}
	});


};

gameClass.prototype.endRound = function(){
	this.state = 'endRound';
	player.x = player.newX;
	// additional stuff can be put here
	this.blockStrength++;
	game.addBall();
	this.startRound();
};

gameClass.prototype.render = function(){
	var n;
	this.drawBackground();
	if(this.state != 'menu'){
		for(n = 0; n < this.blocks.length; n++){
			this.blocks[n].draw();
		}
		drawStats();
	}
	switch(this.state){
		case 'aiming':
			renderArrow();
			break;
		case 'balls moving':
			this.animateBalls();
			break;
		case 'menu':
			this.drawMenuStars();

			// draw the title
			context.save();
			context.moveTo(0, 0);
			drawShape('title', context);

			this.drawMenu();
			break;
	}
	for(n = 0; n < this.bonuses.length; n++){
		this.bonuses[n].move();
		this.bonuses[n].draw();
		if(this.bonuses[n].reachedBottom){
			this.bonuses[n].awardPlayer();
			this.bonuses.splice(n, 1);
			n--;
		}
	}

	context.moveTo(0, 0);

};

gameClass.prototype.animateBalls = function(){
	var animated = false;
	var ball, n;
	for(n = 0; n < this.balls.length; n++){
		ball = this.balls[n];
		if(ball.velocity.dx == 0 && ball.velocity.dy == 0){
			ball.draw();
			continue;
		}
		animated = true;

		ball.move();
		if(ball.temporary && ball.velocity.dx == 0 && ball.velocity.dy == 0){
			ball[n] = undefined;
			this.balls.splice(n, 1);
			n--;
		}else{
			ball.draw();
		}

	}

	if(!animated){
		this.endRound();
	}
};


gameClass.prototype.addBall = function(params){
	if(params == undefined) params = {};
	var ball = new ballClass();

	ball.position = {
		x : this.x,
		y : game.gridScale * game.gridSize.y
	};

	for(var p in params){
		switch(p){
			case 'position':
				ball.position = {
					x : params.position.x,
					y : params.position.y
				};
				break;
			case 'velocity':
				ball.velocity = {
					dx : params.velocity.dx,
					dy : params.velocity.dy
				};
				break;
			case 'colour':
				ball.colour = {
					red : params.colour.red,
					green : params.colour.green,
					blue : params.colour.blue
				}
				break;
			default:
				ball[p] = params[p];
		}
	}
	this.balls[this.balls.length] = ball;
};

gameClass.prototype.drawMenuStars = function(){
	var n;
	var w = this.gridScale * this.gridSize.x * .8;
	var h = this.gridScale * this.gridSize.y * .8;
	var minx = w * .125; // <-- .125 because an eight of .8 is .1, and .8 + 2 * .1 = 1.
	var miny = h * .125;

	if(this.bgStars == undefined){
		var pointList = [
			[0, 0],
			[-.1, 1],
			[1.05, .7],
			[.415, -.0255],
			[1.1, 1.1],
			[.975, .925],
			[1.0, .2],
			[.03, .8],
			[-.01, .5],
			[.7, 1.05],
			[.35, .3],
			[.3, 1.1],
			[1.1, -.05],
			[1.15, 0.4],
			[-.15, 0.2]
		];
		this.bgStars = [];
		myRandom(1); // <-- setting a random seed for consistent "randomness".
		// first we need to generate the stars
		for(n = 0; n < pointList.length; n++){
			this.bgStars[n] = {
				x : pointList[n][0],
				y : pointList[n][1],
				radius: (Math.sin(myRandom() * Math.PI) + 2) / 6,
				angle: myRandom() * Math.PI,
				angi: (myRandom() < .5 ? 1 : -1) * (.2 + myRandom() * .1)
			};
		}
//		debugger;
	}

	// render the stars
	for(n in this.bgStars){
		texasStar(this.bgStars[n].x * w + minx, this.bgStars[n].y * h + miny, this.bgStars[n].radius * this.gridScale, Math.sin(this.bgStars[n].angle), 1);
		this.bgStars[n].angle += this.bgStars[n].angi;
//		debugger;
	}
};

gameClass.prototype.drawMenu = function(){
	var spacing = this.gridScale >> 2;
	var topMargin = this.gridScale * .45;
	var height = this.gridScale * this.gridSize.y;
	var y = height * .3/*(height >> 2)*/ + (height - this.menuOptions.length * (this.gridScale + spacing)) >> 1;
	var n;
	var x = (this.gridSize.x * this.gridScale) >> 1;
	var colour;
	context.save()
		context.textAlign = 'center';
		for(n = 0; n < this.menuOptions.length; n++){
			var fontSize = this.gridScale * .8;
			this.menuOptions[n].x = this.gridScale;
			this.menuOptions[n].y = y;
			this.menuOptions[n].width = this.gridScale * (this.gridSize.x - 2);
			this.menuOptions[n].height = this.gridScale;

			if(this.menuOptions[n].hovering == 1){
				this.menuOptions[n].x -= this.gridScale >> 3;
				this.menuOptions[n].y -= this.gridScale >> 3;
				this.menuOptions[n].width += this.gridScale >> 2;
				this.menuOptions[n].height += this.gridScale >> 2;
				fontSize += fontSize >> 2;
				colour = {red : 200, green : 230, blue : 160};
			}else{
				colour = {red : 140, green : 200, blue : 120};
			}

			context.font = fontSize + "px PoorStory";
			drawNiceBox(this.menuOptions[n].x, this.menuOptions[n].y, this.menuOptions[n].width, this.menuOptions[n].height, colour);//, {red : 200, green : 192, blue : 160 });

			context.fillStyle = 'rgba(255, 255, 255, .6)';
			context.fillText(this.menuOptions[n].label, x + game.textShadowOffset, y + topMargin + game.textShadowOffset + fontSize / 3);

			context.fillStyle = 'rgba(0, 48, 0, .8)';
			context.fillText(this.menuOptions[n].label, x, y + topMargin + fontSize / 3);
			
			y += this.gridScale + spacing;
		}
	context.restore();
};

// this is just called as a first step in initializing the menu, setting up event triggering etc.
gameClass.prototype.initializeMenu = function(){
	var lastButtonState = -1;
	var mousex, mousey;
	var currentButton = -1;
	var me = this;
	this.canvas.onmousemove = function(evt){
		var n;
		mousex = evt.offsetX;
		mousey = evt.offsetY;
		currentButton = -1;
		for(n = 0; n < me.menuOptions.length; n++){
			if(mousex >= me.menuOptions[n].x && mousex <= me.menuOptions[n].x + me.menuOptions[n].width){
				if(mousey >= me.menuOptions[n].y && mousey <= me.menuOptions[n].y + me.menuOptions[n].height){
					currentButton = n;
					if(!me.menuOptions[n].hovering){
						playSound('whoosh');
					}
					me.menuOptions[n].hovering = 1;
				}else{
					me.menuOptions[n].hovering = 0;
				}
			}else{
				me.menuOptions[n].hovering = 0;
			}
		}
	};

	this.canvas.onmousedown = function(){
		if(currentButton != -1){
			if(lastButtonState == -1){
				me.menuOptions[currentButton].action();
			}
		}
	}
};

gameClass.prototype.start = function(){

	// turn the main menu events
	this.canvas.onmousedown = null;
	this.canvas.onmousemove = null;

	// reset the player, balls, game.blocks, etc.
	player = new playerClass(this);
	player.x = Math.ceil(this.gridSize.x * this.gridScale >> 1);
	player.ballSpeed = this.gridScale / 5;
	this.blockStrength = 1;
	this.blocks = [];
	this.balls = [];
	this.addBall();

	// let the game begin
	// we'll do this instead of calling startround, as this lets the blocks
	// visibly drop instead of appearing in the first row instantly.
	this.state = 'aiming';
	player.takeTurn();
	this.dropBlocks(function(){});
};

gameClass.prototype.addBlockRow = function(){
	var n, idx;
	do{
		for(n = 0; n < this.gridSize.x; n++){
			if(Math.random() < this.blockProbability){
				idx = this.blocks.length;
				this.blocks[idx] = new blockClass(this.blockStrength);
				this.blocks[idx].position = {
					x : n,
					y : -1 // <-- place it above the game, as they'll be shifting down afterward
				};
				if(Math.random() < this.bonusBlockChance){
					this.blocks[idx].pickABonus();
				}
			}
		}
	}while(this.blocks.length == 0);
}




/////////////////////////////////////////////////////////////////////////////////////////////
// 		Initial game setup
/////////////////////////////////////////////////////////////////////////////////////////////
function initialize(step){
	if(step == undefined){
		step = 'initGame';
	}
	switch(step){
		case 'initGame':
			game = new gameClass;
			setTimeout(function(){initialize('initCanvas');}, 0);
			break;
		case 'initCanvas':
			var width, height, bestSize;
			game.canvas = document.getElementById('gameCanvas');

			// get the right size for the canvas
			try{
				bestSize = bestCanvasSize();
			}catch(e){
				die(e);
				return;
			}
			game.canvas.width = bestSize.width;
			game.canvas.height = bestSize.height;
			game.gridScale = bestSize.scale;
			game.textShadowOffset = game.gridScale * game.gridSize.x * .004;

			// get drawing context
			context = game.canvas.getContext('2d');

			setTimeout(function(){initialize('loadSounds');}, 0);
			break;
		case 'loadSounds':
			// we'll load the sounds first to get the music started ASAP
			music = [
				new Audio('assets/music/Wintergatan\ -\ Wintergatan\ -\ 05\ Biking\ Is\ Better.mp3'),
				new Audio('assets/music/Wintergatan\ -\ Wintergatan\ -\ 07\ Starmachine2000.mp3')
			];
			for(n in music){
				music[n].volume = musicVolume;
				music[n].addEventListener("ended", function(){
					music.push(music.shift());
					music[0].play();
				});
			}

			var soundPath = 'assets/sounds/';
			var zapPath = soundPath + 'zapsplat/';
			var freesoundPath = soundPath + 'freesound/';
			soundEffects = {
				swish : new Audio(soundPath + 'swish.wav'),
				gameOver : new Audio(zapPath + "cartoon_fail_strings_trumpet.mp3"),
				thud : new Audio(soundPath + 'sideImpact.mp3'),
				blockHit: new Audio(freesoundPath + '539169__eminyildirim__glass-hit.wav'),
				whoosh : new Audio(zapPath + "zapsplat_foley_wood_bambo_swoosh_through_air_001_modded.mp3")

			};
			for(n in soundEffects){
				soundEffects[n].volume = effectsVolume;
			}

			soundOn();

			setTimeout(function(){initialize('finish');}, 0);
			break;
		case 'finish':
			window.onresize = handleResize;
			game.state = 'menu';
			setInterval(function(){game.render();}, game.animationFrequency);
			game.initializeMenu();
			break;
		default:
			throw 'initialize: invalid step name "' + step + '"';
	}
}
/*

We actually want this active, but for now we want to trigger it with a button for sound to work properly

window.onload = function(){
	initialize();
};
*/

/////////////////////////////////////////////////////////////////////////////////////////////
//		Function definitions
/////////////////////////////////////////////////////////////////////////////////////////////
function handleResize(){
	var width, height, bestSize;
	//game.canvas = document.getElementById('gameCanvas');

	// get the right size for the canvas
	try{
		bestSize = bestCanvasSize();
	}catch(e){
		die(e);
		return;
	}
	if(player != undefined){
		player.x *= bestSize.width / game.canvas.width;
		player.ballSpeed = bestSize.scale / 5;
	}
	game.canvas.width = bestSize.width;
	game.canvas.height = bestSize.height;
	game.gridScale = bestSize.scale;
	game.textShadowOffset = game.gridScale * game.gridSize.x * .004;


	// get drawing context
	context = game.canvas.getContext('2d');

}
var handleMouseTargeting = (function(){
	var lastTime = 0;
	return function(e){
		// only update the arrow with the animation frequency at the most
		var dateTime = new Date();
		var time = dateTime.getTime();
		if(time < lastTime + game.animationFrequency){
			return;
		}
		lastTime = time;

		// get the relative angle between the current location and the mouse pointer
		player.aim(e.offsetX, e.offsetY);
	}
})();

function renderArrow(){
	var arrowPoints = [
		-.8, -2,  -.8, -5,  -2, -4.75,  0, -7.5,  2, -4.75, .8, -5, .8, -2
	];
	var n;
	var px = player.x;
	var py = (game.gridSize.y - .5) * game.gridScale

	var arrowStyle = context.createLinearGradient(0, 0, 170, 0);
	arrowStyle.addColorStop(0, "#FEA");
	arrowStyle.addColorStop(0.2, "#FA0");
	arrowStyle.addColorStop(0.5, "#A80");
	arrowStyle.addColorStop(1, "white");

	// scale the arrow vectors to match the game scale
	for(n = 0; n < arrowPoints.length; n++){
		arrowPoints[n] *= game.gridScale >> 3;
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

function drawStats(){
	context.save();
		var fontSize = Math.floor(game.gridScale * .39);
		var marginSize = fontSize / 2;
		var bottomY = game.gridScale * game.gridSize.y - marginSize;
		var rightX = game.gridScale * game.gridSize.x - marginSize / 2;

		context.fillStyle = 'rgba(160, 160, 160, .6)';
		context.fillRect(0, game.gridScale * (game.gridSize.y - .75), game.canvas.width, game.gridScale * .75);
		context.fillStyle = 'rgba(190, 190, 190, .6)';
		context.fillRect(0, game.gridScale * (game.gridSize.y - .75), game.canvas.width, game.gridScale * .125);
		context.font = fontSize + "px jelleeroman";
		context.textAlign = 'left';
		context.fillStyle = 'rgba(128, 64, 48, 1)';
		context.fillText('LEVEL: ' + (player.level + 1), marginSize + game.textShadowOffset * 2, bottomY + game.textShadowOffset);
		context.fillStyle = 'rgba(255, 196, 128, 1)';
		context.fillText('LEVEL: ' + (player.level + 1), marginSize, bottomY);

		context.textAlign = 'right';
		context.fillStyle = 'rgb(48, 64, 32, 1)';
		context.fillText('SCORE: ' + player.score, rightX + game.textShadowOffset * -2, bottomY + game.textShadowOffset);
		context.fillStyle = 'rgba(196, 255, 128, 1)';
		context.fillText('SCORE: ' + player.score, rightX, bottomY);
	context.restore();
}


// render a nicely shaded rectangle with rounded corners
function drawNiceBox(x, y, width, height, colour){
	var edgeBias = height < width ? height >> 3 : width >> 3;

	var darkColour = 'rgba(' + (colour.red >> 1) + ', ' + (colour.green >> 1) + ', ' + (colour.blue >> 1) + ', 0.6)';

	var colour = 'rgb('+ colour.red + ',' + colour.green + ',' + colour.blue + ')';
	var x2 = x + width, y2 = y + height;
	
	context.save();

		context.beginPath();
		context.fillStyle = colour;
		context.moveTo(x, y + edgeBias);
		context.quadraticCurveTo(x, y, x + edgeBias, y);
		context.lineTo(x2 - edgeBias, y);

		context.quadraticCurveTo(x2, y, x2, y + edgeBias);
		context.lineTo(x2, y2 - edgeBias);

		context.quadraticCurveTo(x2, y2, x2 - edgeBias, y2);
		context.lineTo(x + edgeBias, y2);

		context.quadraticCurveTo(x, y2, x, y2 - edgeBias);
		context.closePath();
		context.fill();

		// add some shading, first with white shading at the top
		context.beginPath();
		context.fillStyle = 'rgba(255, 255, 255, .6)';
		context.moveTo(x, y2 - edgeBias);
		context.lineTo(x, y + edgeBias);
		context.quadraticCurveTo(x, y, x + edgeBias, y);
		context.lineTo(x2 - edgeBias, y);
		context.quadraticCurveTo(x2, y, x2, y + edgeBias);
		context.bezierCurveTo(
			x, 
			y, 
			x + edgeBias, 
			y + edgeBias, 
			x, 
			y2 - edgeBias
		);

		context.closePath();
		context.fill();


		// and now some dark colour shading at the bottom
		context.beginPath();
		context.fillStyle = darkColour;
		context.moveTo(x2, y + edgeBias);
		context.lineTo(x2, y2 - edgeBias);
		context.quadraticCurveTo(x2, y2, x2 - edgeBias, y2);
		context.lineTo(x + edgeBias, y2);
		context.quadraticCurveTo(x, y2, x, y2 - edgeBias);
		context.bezierCurveTo(
			x2,
			y2,
			x2 - edgeBias,
			y2 - edgeBias,
			x2,
			y + edgeBias
		);

		context.fill();
		context.closePath();

	context.restore();
}

// render a sine wave with the bottom side filled in with colour.  Used for
// background animation
function doBGSine(ang, radius, midpoint, colour){
	var x, y;
	var stepSize = game.gridScale * .1;
	var myAng = ang;
	var myAngi = game.gridScale * .0005;
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
		}while(x < game.canvas.width);
		context.lineTo(game.canvas.width, game.canvas.height);
		context.lineTo(0, game.canvas.height);
		context.fill();

	context.restore();
}


// calculate the best fitting canvas for the available space
function bestCanvasSize(){
	var gameWrapper = document.getElementById('gameWrapper');
	var parentWidth = gameWrapper.clientWidth;
	var parentHeight = gameWrapper.clientHeight;
	var marginScale = .2;

	var gridScale = Math.floor(parentHeight / (game.gridSize.y + marginScale));
	if((game.gridSize.x + marginScale) * gridScale > parentWidth){
		gridScale = Math.floor(parentWidth / (game.gridSize.x + marginScale));
	}

	if(gridScale < game.minTileSize){
		throw "Could not create an area large enough for this game";
	}

	return {
		scale : gridScale,
		width : game.gridSize.x * gridScale,
		height: game.gridSize.y * gridScale
	};
}

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

// Average a value toward 255.  Meant for handling byte values in colours
function brightenByte(val){
	return (val + 255) >> 1;
}

// Average toward zero.  Same reason
function darkenByte(val){
	return (val + 0) >> 1;
}

// render a texas star.  Used in several places
function texasStar(cx, cy, radius, angle, opacity){
	if(opacity == undefined) opacity = 0.8;
	var numPoints = 5, n, innerRadius = Math.round(radius * .45), ang, x, y, r;
	context.save();
		context.beginPath();
		context.fillStyle = 'rgba(255, 255, 192, ' + opacity + ')';
		context.strokeStyle = 'rgb(64, 64, 32)';
		context.lineWidth = game.gridScale >> 4;
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
	/*
	context.save();
		context.translate(cx, cy);
		context.rotate(Math.sin(angle) * .5);
		drawShape('volume', context);

	context.restore();
	*/
}


// @@@@@@@@@@@@@@@@@@@@@@@ copied from swix 
function playSound(soundName, force){
	if(force == undefined) force = 0;
	if(!muted || force){
		var sound = soundEffects[soundName].cloneNode();
		sound.volume = effectsVolume;
		sound.play();
	}
}

function soundOn(){

	var playPromise = music[0].play();

	if (playPromise !== undefined) {
		playPromise.then(function() {
			muted = false;
//			$('#soundCheckmark').html('On&nbsp;');
		}).catch(function(error) {
			muted = true;
//			$('#soundCheckmark').html('Off');
			console.log(error);
		});
	}else{
		muted = false;
//		$('#soundCheckmark').html('On&nbsp;');
	}

}

function soundOff(){
	music[0].pause();
	muted = true;
	//	$('#soundCheckmark').html('Off');
}

function toggleSound(){
	muted ? soundOn() : soundOff();
}


var myRandom = (function(){
	var seed = 2;
	return function(newSeed) {
		if(newSeed != undefined) seed = 1 * newSeed;

		var x = Math.sin(seed++) * 10000;
		return x - Math.floor(x);
	}
})();
//  /@@@@@@@@@@@@@@@@@@@@@@@@@@@

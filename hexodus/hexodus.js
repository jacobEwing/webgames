var MIN_CELL_X = 0;
var MAX_CELL_X = 16;
var MAX_CELL_Y = 19;
var CELL_HEIGHT = 42;
var CELL_WIDTH = 48;
var CELL_DELTA_X = 32;
var GRID_IMAGE_HEIGHT = 379;
var activeShape, previewShape = null;
var cellSprite;
var cell;
var canvasTop = 0, canvasOffset = 0;
var bgOffset = 0, laserOffset = 0;
var dropCount = 0; haveLanded = false;
var target_height = 94;
var scrollSpeed;
var gameTimer;
var score;
var shapeTypes = [
	[[0, 0], [1, -1], [2, -1], [-1, 1], [-1, 2]], // letter c
	[[0, 0], [-1, 0], [1, 0], [0, -1], [1, -1], [1, -2]], // triangle
	[[0, 0], [1, 0], [-1, 1], [0, -1]], // letter t
	[[0, 0], [0, 1], [1, 0], [-1, 0], [0, -1]], // letter x
	[[0, 0], [0, 1], [1, -1], [1, -2]], // letter z
	[[0, 0], [0, 1], [-1, 0], [-1, -1]], // bacxwards z
	[[0, 0], [-1, 0], [1, 0], [-2, 0], [2, 0]], // line
	[[-1, 0], [0, 0], [0, -1], [1, -1]], // rhombus
];

var controls = {
	'ROT_LEFT' : ',',
	'ROT_RIGHT' : '.',
	'MOVE_UP' : 'UP',
	'MOVE_DOWN' : 'DOWN',
	'MOVE_LEFT' : 'LEFT',
	'MOVE_RIGHT' : 'RIGHT',
	'EXIT_GAME' : 'ESC',
	'PAUSE_GAME' : 'SPACE'
};

var cellColours = ['red', 'green', 'blue', 'cyan', 'yellow', 'purple'];
var dropMap;
var keyState = {};
var keyBuffer = Array();
var KEYMAP = {
	'UP' : 38,		'DOWN' : 40,		'LEFT' : 37,		'RIGHT' : 39,
	'ESC' : 27,		'ENTER' : 13,		'TAB' : 9,		'SPACE' : 32,
	'SHIFT' : 16,		'CTRL' : 17,		'ALT' : 18,		'BACKSPACE' : 8,
	'CAPS_LOCK' : 20,	'NUM_LOCK' : 144,	'SCROLL_LOCK' : 145,
	'PGUP' : 33,		'PGDN' : 34,		'END' : 35,
	'HOME' : 36,		'INSERT' : 45,		'DELETE' : 46,
	'TILDE' : 192,		"'" : 222,		'[' : 219,		']' : 221,
	'\\' : 220,		';' : 59,		'=' : 61,		'-' : 173,
	'META' : 91,		'MENU' : 93,
	'NUMPAD_*' : 106,	'NUMPAD_+' : 107,	'NUMPAD_-' : 109,	'NUMPAD_/' : 111,
	',' : 188,		'.' : 190

};
var REV_KEYMAP = {
	38: 'UP',		40: 'DOWN',		37: 'LEFT',		39: 'RIGHT',
	27: 'ESC',		13: 'ENTER',		9: 'TAB',		32: 'SPACE',
	16: 'SHIFT',		17: 'CTRL',		18: 'ALT',		8: 'BACKSPACE',
	20: 'CAPS_LOCK',	144: 'NUM_LOCK',	145: 'SCROLL_LOCK',
	33: 'PGUP',		34: 'PGDN',		35: 'END',
	36: 'HOME',		45: 'INSERT',		46: 'DELETE',
	192: 'TILDE',		222: "'",		219: '[',		221: ']',
	220: '\\',		59: ';',		61: '=',		173: '-',
	91: 'META',		93: 'MENU',
	106: 'NUMPAD_*',	107: 'NUMPAD_+',	109: 'NUMPAD_-',	111: 'NUMPAD_/',
	188: ',',		190: '.'
};
for(n = 65; n < 91; n++){
	KEYMAP[String.fromCharCode(n)] = n;
	REV_KEYMAP[n] = String.fromCharCode(n);
}
for(n = 0; n < 10; n++){
	KEYMAP[n] = 48 + n;
	REV_KEYMAP[48 + n] = n;
}
for(n = 1; n <= 12; n++){
	KEYMAP['F' + n] = 111 + n;
	REV_KEYMAP[111 + n] = 'F' + n;
}
for(n = 0; n < 10; n++){
	KEYMAP['NUMPAD_' + n] = 96 + n;
	REV_KEYMAP[96 + n] = 'NUMPAD_' + n;
}

for(n in KEYMAP){
	keyState[n] = 0;
}

function keyupCall(e){
	handleKey(e.which, 0); return false;
}

function keydownCall(e){
	handleKey(e.which, 1); return false;
}


var cellClass = function(){
	var me = this;
	this.colour = 'red';
	this.sprite = new spriteClass(cellSprite);
	this.pos = {x : 0, y : 0};

	this.setColour = function(newColour){
		this.colour = newColour;
		this.sprite.setFrame(this.colour + '_0');
	}

	this.position = function(x, y){
		if(x == undefined || y == undefined){
			return this.pos;
		}else{
			var hexx, hexy;
			hexx = 37 * x;
			hexy = 21 * x + 42 * y;
			this.sprite.position(hexx, hexy);

			this.pos.x = x;
			this.pos.y = y;
		}
	}

	this.draw = function(target){
		this.sprite.appendTo($('#canvas'));
	}

	this.dissolve = function(){
		this.sprite.startSequence('dissolve_' + this.colour, {'callback' : function(){
			me.sprite.remove();
		}});
	}
}

var shapeClass = function(){
	this.cells = [];
	this.pos = {x : 0, y : 0};

	this.generateShape = function(type){
		if(type == undefined){
			type = Math.floor(Math.random() * shapeTypes.length);
		}
		this.cells = [];
		for(var n = 0; n < shapeTypes[type].length; n++){
			this.cells[n] = new cellClass();
			this.cells[n].pos = {
				x : shapeTypes[type][n][0],
				y : shapeTypes[type][n][1]
			};
			this.cells[n].setColour(cellColours[Math.floor(Math.random() * 6)]);
		}
	}

	this.die = function(){
		var n;
		for(n in this.cells){
			this.cells[n].dissolve();
			score --;
		}
	}

	this.remove = function(){
		for(n in this.cells){
			this.cells[n].sprite.remove();
		}
	}

	this.position = function(x, y){
		if(x == undefined || y == undefined){
			return this.pos;
		}else{
			this.pos.x = x;
			this.pos.y = y;
			this.refreshCellSprites();
		}
	}

	this.refreshCellSprites = function(){
		var hexx, hexy, n;
		for(n in this.cells){
			hexx = 37 * (this.pos.x + this.cells[n].pos.x);
			hexy = 21 * (this.pos.x + this.cells[n].pos.x) + 42 * (this.pos.y + this.cells[n].pos.y);
			this.cells[n].sprite.position(hexx, hexy);
		}
	}

	this.rotate = function(direction){
		var n;

		for(n = 0; n < this.cells.length; n++){
			if(direction < 0){
				this.cells[n].pos.x += this.cells[n].pos.y;
				this.cells[n].pos.y -= this.cells[n].pos.x;
			}else{
				this.cells[n].pos.y += this.cells[n].pos.x;
				this.cells[n].pos.x -= this.cells[n].pos.y;
			}
			if(this.cells[n].pos.x + this.pos.x < MIN_CELL_X || this.cells[n].pos.x + this.pos.x > MAX_CELL_X) break;
		}

		if(n < this.cells.length){
			for(; n >= 0; n--){
				if(direction < 0){
					this.cells[n].pos.y += this.cells[n].pos.x;
					this.cells[n].pos.x -= this.cells[n].pos.y;
				}else{
					this.cells[n].pos.x += this.cells[n].pos.y;
					this.cells[n].pos.y -= this.cells[n].pos.x;
				}
			}
		}
		this.refreshCellSprites();
	}

	this.move = function(dx, dy){
		var n;
		if(dx > 1) dx = 1;
		if(dx < -1) dx = -1;

		for(n in this.cells){
			var cx = this.cells[n].pos.x + this.pos.x + dx;
			var cy = this.cells[n].pos.y + this.pos.y + dy;
			if(cx < MIN_CELL_X) dx = 0;
			if(cx > MAX_CELL_X) dx = 0;
			if(cy < -(cx >> 1) && dy < 0) dy = 0;

		}

		this.pos.y += dy;
		this.pos.x += dx;

		if(dx > 0){
			this.pos.y -= this.pos.x % 2;
		}else if(dx < 0){
			this.pos.y += (1 - this.pos.x % 2);
		}
		this.refreshCellSprites();
	}

	this.draw = function(target){
		for(n in this.cells){
			this.cells[n].sprite.appendTo(target);
		}
	}

	this.checkStatus = function(){
		var landed = false, destroyed = false;
		var n, cx, cy;
		for(n = 0; n < this.cells.length; n++){
			
			cx = this.cells[n].pos.x + this.pos.x;
			cy = this.cells[n].pos.y + this.pos.y;

			cy += (cx + 1) >> 1;
			sideOffset = 1 - cx % 2;
			if(cy >= MAX_CELL_Y){
				landed = true;
			}else if(dropMap[cx][cy + 1] != null){
				landed = true;
				if(dropMap[cx][cy + 1].colour != this.cells[n].colour){
					destroyed = true;
					dropCount --;
					dropMap[cx][cy + 1].dissolve();
					dropMap[cx][cy + 1] = null;
				}
			}
			if(cx > MIN_CELL_X && dropMap[cx - 1][cy + sideOffset] != null){
				landed = true;
				if(dropMap[cx - 1][cy + sideOffset].colour != this.cells[n].colour){
					destroyed = true;
					dropCount --;
					dropMap[cx - 1][cy + sideOffset].dissolve();
					dropMap[cx - 1][cy + sideOffset] = null;
				}
			}
			if(cx < MAX_CELL_X - 1 && dropMap[cx + 1][cy + sideOffset] != null){
				landed = true;
				if(dropMap[cx + 1][cy + sideOffset].colour != this.cells[n].colour){
					destroyed = true;
					dropCount --;
					dropMap[cx + 1][cy + sideOffset].dissolve();
					dropMap[cx + 1][cy + sideOffset] = null;
				}
			}
		}
		return destroyed ? 'destroyed' : (landed ? 'landed' : null);

	}

	this.addToMap = function(){
		var n, cx, cy;
		for(n = 0; n < this.cells.length; n++){
			cx = this.cells[n].pos.x + this.pos.x;
			cy = this.cells[n].pos.y + this.pos.y;
			cy += (cx + 1) >> 1;
			dropMap[cx][cy] = this.cells[n];
			haveLanded = true;
			dropCount++;
		}
	}

}

function getTopY(){
	var x, y;
	var rval, rvx;
	for(y = 0; y <= MAX_CELL_Y && rval == undefined; y++){
		for(x = 0; x <= MAX_CELL_X; x++){
			if(dropMap[x][y] != null){
				if(rval == undefined || (x % 2)){
					rval = y;
					rvx = x;
				}
			}
		}
	}
	if(rval != undefined){
		rval --;
		rval *= CELL_HEIGHT;
		if(rvx % 2) rval -= (CELL_HEIGHT >> 1);
		rval += canvasTop;
	}
	return rval;
}

function handle_gameplay(){
	var rotation = 0;
	var displacement = {x : 0, y : 0};
	var n, x, y;
	var quitting = false, pausing = false;
	// handle any controls of the active shape.  Need to do it a couple of ways to
	// smothly handle both continuous keypressing and single key pecks.
	if(keyState[KEYMAP[controls.ROT_LEFT]]){
		rotation -= 1;	
	}
	if(keyState[KEYMAP[controls.ROT_RIGHT]]){
		rotation += 1;	
	}

	if(keyState[KEYMAP[controls.MOVE_UP]]){
		displacement.y--;
	}
	if(keyState[KEYMAP[controls.MOVE_DOWN]]){
		displacement.y++;
	}
	if(keyState[KEYMAP[controls.MOVE_LEFT]]){
		displacement.x--;
	}
	if(keyState[KEYMAP[controls.MOVE_RIGHT]]){
		displacement.x++;
	}
	if(keyState[KEYMAP[controls.EXIT_GAME]]){
		quitting = true;
	}
	if(keyState[KEYMAP[controls.PAUSE_GAME]]){
		pausing = true;
	}

	if(displacement.y || displacement.x || rotation){
		keyBuffer = [];
	}else{
		for(n in keyBuffer){
			var c = REV_KEYMAP[keyBuffer.shift()];
			switch(c){
				case controls.ROT_LEFT:
					rotation = rotation < 0 ? -1 : rotation - 1;
					break;
				case controls.ROT_RIGHT:
					rotation = rotation > 0 ? 1 : rotation + 1;
					break;
				case controls.MOVE_UP:
					displacement.y = displacement.y < 0 ? -1 : displacement.y - 1;
					break;
				case controls.MOVE_DOWN:
					displacement.y = displacement.y > 0 ? 1 : displacement.y + 1;
					break;
				case controls.MOVE_LEFT:
					displacement.x = displacement.x < 0 ? -1 : displacement.x - 1;
					break;
				case controls.MOVE_RIGHT:
					displacement.x = displacement.x > 0 ? 1 : displacement.x + 1;
					break;
				case controls.EXIT_GAME:
					quitting = true;
					break;
				case controls.PAUSE_GAME:
					pauseing = true;
					break;
			}
		}
	}

	if(quitting){
		// might as well stop here if they're quitting
		quitGame();
	}

	if(rotation) activeShape.rotate(rotation);
	if(displacement.x || displacement.y){
		activeShape.move(displacement.x, displacement.y);
	}

	// check to see if the shape has landed:
	switch(activeShape.checkStatus()){
		case 'landed':
			activeShape.addToMap();
			// let's see if we've reached the target height
			var topy = getTopY();
			if(topy <= target_height){
				startNextLevel();
			}
			getNextShape();
			break;
		case 'destroyed':
			activeShape.die();
			getNextShape();
			break;
	}

	// move everything downward
	canvasTop += scrollSpeed;
	bgOffset -= 2;
	laserOffset += 6;
	$('#canvaswrapper').css('background-position', '0px ' + bgOffset + 'px');
	$('#laser').css('background-position', laserOffset + 'px ' + laserOffset + 'px');
	if(canvasTop > CELL_HEIGHT){
		canvasTop -= CELL_HEIGHT;
		canvasOffset += CELL_HEIGHT;
		$('#canvas').css('background-position', '0px ' + canvasOffset + 'px');

		activeShape.move(0, 1);

		for(x = 0; x <= MAX_CELL_X; x++){
			var maxY = dropMap[x].length - 1;
			if(dropMap[x][maxY] != null){
				dropMap[x][maxY].position(x, maxY + 1 - ((x + 1) >> 1));
				dropMap[x][maxY].dissolve();
				dropCount--;
			}
			for(y = maxY; y > 0; y--){
				dropMap[x][y] = dropMap[x][y - 1];
				if(dropMap[x][y] != null){
					dropMap[x][y].position(x, y - ((x + 1) >> 1));
				}
			}
			dropMap[x][0] = null;
		}

	}
	$('#canvas').css('top', canvasTop);
	if(haveLanded && dropCount == 0){
		endGame();
	}

	if(pausing) pauseGame();
}

function pauseGame(){
	clearInterval(gameTimer);
	$('#gameContent').fadeTo(500, 0.3, function(){
		keyBuffer = [];
		gameTimer = setInterval(waitForUnpause, gameSpeed);
	});
}

function waitForUnpause(){
	if(keyBuffer.length > 0){
		clearInterval(gameTimer);
		$('#gameContent').fadeTo(500, 1, function(){
			keyBuffer = [];
			gameTimer = setInterval(handle_gameplay, gameSpeed);
		});
	}
}

function quitGame(){
	clearInterval(gameTimer);
	$('body').fadeTo(800, 0, function(){
		setGameState('menu');
		showMenu('main');
		$('#menu').css('display', 'block');
		$('#gameContent').css('display', 'none');
		$('body').fadeTo(800, 1.0);
	});
}


function endGame(){
	setGameState('death');
	clearInterval(gameTimer);
	var n;
	var dieDiv = $('<div></div>');
	dieDiv .css({
		'position' : 'absolute',
		'top' : '0px',
		'left' : '0px',
		'width' : '100%',
		'height' : '100%'
	});
	dieDiv.insertBefore($('#canvasOverlay'));

	var topBorder = $('<div></div>');
	topBorder.data('topy', ((MAX_CELL_Y - 1) * CELL_HEIGHT + canvasTop - 6));
	topBorder.data('xoffset', 0);
	topBorder.css({
		'position' : 'absolute',
		'left' : 0,
		'top' : topBorder.data('topy') + 'px',
		'background-position' : '0px 0px',
		'width' : '100%',
		'height' : CELL_DELTA_X + 'px',
		'background-image' : 'url(images/hexblack.png)'

	});

	var filler = $('<div></div>');
	filler.css({
		'position' : 'absolute',
		'left' : 0,
		'top' : (1 * topBorder.data('topy') + CELL_DELTA_X) + 'px',
		'width' : '100%',
		'height' : '1000px',
		'background' : '#000'
		
	});
	topBorder.appendTo(dieDiv);
	filler.appendTo(dieDiv);
	for(n = 0; n < MAX_CELL_Y << 1; n++){
		setTimeout(function(){
			var topy = topBorder.data('topy');
			var xoffset = topBorder.data('xoffset');
			topy -= (CELL_HEIGHT >> 1);
			xoffset = 37 - xoffset;
			topBorder.data('topy', topy);
			topBorder.data('xoffset', xoffset);
			topBorder.css({
				'top': topy + 'px',
				'background-position' : xoffset + 'px 0px'
			});
			filler.css('top', (1 * topy + CELL_DELTA_X) + 'px');
		}, n * 90);
	}

	setTimeout(function(){
		$('body').fadeTo(800, 0, function(){
			dieDiv.remove();
			setGameState('menu');
			showMenu('main');
			$('#menu').css('display', 'block');
			$('#gameContent').css('display', 'none');
			$('body').fadeTo(800, 1.0);
		});
	}, n * 90);
}

function startNextLevel(){
	haveLanded = false;
	dropCount = 0;
	for(var y = 0; y <= MAX_CELL_Y; y++){
		for(var x = 0; x <= MAX_CELL_X; x++){
			if(dropMap[x][y] != null){
				dropMap[x][y].dissolve();
				dropMap[x][y] = null;
			}
		}
	}
	currentLevel ++;
	scrollSpeed += 0.125;
	target_height = Math.floor(48 + (256 / Math.pow(currentLevel, 0.333333)));
	$('#laser').animate({'top': target_height});
	$('#laserguns').animate({'top': target_height});
}

function getNextShape(){
	if(previewShape == null){
		previewShape = new shapeClass();
		previewShape.generateShape();
	}
	activeShape = previewShape;
	activeShape.draw($('#canvas'));
	var newX = (MAX_CELL_X + MIN_CELL_X) >> 1;
	var newY = -((newX + 1) >> 1);
	activeShape.position((MAX_CELL_X + MIN_CELL_X) >> 1, newY - 1);

	previewShape = new shapeClass();
	previewShape.generateShape();
	$('#preview').empty();
	previewShape.draw($('#preview'));
	previewShape.position(2, 1);
}

function startGame(){
	var x, y;

	// clear stuff out
	$('#canvas').empty();
	dropMap = [];
	for(x = 0; x <= MAX_CELL_X; x++){
		dropMap[x] = [];
		for(y = 0; y <= MAX_CELL_Y; y++){
			dropMap[x][y] = null;
		}
	}
	activeShape = previewShape = null;
	dropCount = 0;
	haveLanded = false;

	// actually start the game
	$('body').fadeTo(300, 0, function(){
		$('#menu').css('display', 'none');
		$('#gameContent').css('display', 'block');
		$('body').fadeTo(300, 1.0);
	});
	getNextShape();
	flushKeyState();
	gameTimer = setInterval(handle_gameplay, gameSpeed);
	setGameState('playing');
}

function flushKeyState(){
	for(var n in keyState){
		keyState[n] = 0;
	}
}

function drawLoadingQuote(quotation){
	var quote = [
		'Making the first move',
		'Bootstrapping the system',
		'Priming the pump',
		'Delegating responsibilities',
		'Activating the hydraulics',
		'Tuning the equilibriator',
		'Switching diagnostics on',
		'Escalating the issue',
		'Looking on the bright side of life',
		'Overstating the matter',
		'Looking for answers',
		'Whithering away to a tonne',
		'Bringing home the bacon',
		'Wishing you were here',
		'Flying by the seat of my pants',
		'Bringing it on home',
		'Punching the clock',
		'Stating the obvious',
		'Regretting my actions',
		'Anticipating the outcome',
		'Wearing and tearing',
		'Killing time',
		'Twiddling my thumbs',
		'Wondering what the hell is going on',
		'Taking my own sweet time',
		'Repeating myself'
	];
	if ( typeof drawLoadingQuote.quoteNumber == 'undefined' ) {
		drawLoadingQuote.quoteNumber = 0;
	}
	var line = $('<span></span>');
	if(quotation == undefined){
		line.append(quote[drawLoadingQuote.quoteNumber % quote.length] + '...<br/>');
		drawLoadingQuote.quoteNumber++;
	}else{
		line.append(quotation + '...<br/>');
	}
	$('#loadingBar').append(line);
	//$('#loadingBar').attr('scrollTop', $('#loadingBar').attr('scrollHeight'));
	$('#loadingBar').animate({'scrollTop' : $('#loadingBar').attr('scrollHeight')}, 300, function(){
		line.fadeOut(1500);
	});
}
drawLoadingQuote.quoteNumber = 0;

var loadingFlags;
function initialize(callback, step){
	if(step == undefined){
		step = 'start';
	}
	switch(step){
		case 'start':
			currentLevel = 1;
			gameSpeed = 80;
			scrollSpeed = 1;
			target_height = Math.floor(48 + (256 / Math.pow(currentLevel, 0.333333)));
			$('#laser').css('top', target_height + 'px');
			$('#laserguns').css('top', target_height + 'px');
			drawLoadingQuote();
			// load our sprite for the cells
			cellSprite = new spriteSet();
			cellSprite.load('hexodus.sprite', function(){
				initialize(callback, 'loadbackground');
			});
			break;
		case 'loadbackground':
			drawLoadingQuote('Loading background image');
			$('<img src="images/scratchedmetal.png">').load(function(){
				initialize(callback, 'loadpics');
			});
			break;
		case 'loadpics':
			drawLoadingQuote('Commence image caching');
			loadingFlags = lastLoadingFlags = 16383;
			$('<img src="images/hexgrid3.png">').load(function(){loadingFlags ^= 1;});
			$('<img src="images/overlay1.png">').load(function(){loadingFlags ^= 2;});
			$('<img src="images/rust.png">').load(function(){loadingFlags ^= 4;});
			$('<img src="images/preview_overlay.png">').load(function(){loadingFlags ^= 8;});
			$('<img src="images/laser.png">').load(function(){loadingFlags ^= 16;});
			$('<img src="images/laserguns.png">').load(function(){loadingFlags ^= 32;});
			$('<img src="images/hexodus_original.png">').load(function(){loadingFlags ^= 64;});
			$('<img src="images/goodplay_1.png">').load(function(){loadingFlags ^= 128;});
			$('<img src="images/goodplay_2.png">').load(function(){loadingFlags ^= 256;});
			$('<img src="images/badplay_1.png">').load(function(){loadingFlags ^= 512;});
			$('<img src="images/badplay_2.png">').load(function(){loadingFlags ^= 1024;});
			$('<img src="images/celeste.png">').load(function(){loadingFlags ^= 2048;});
			$('<img src="images/jacob.png">').load(function(){loadingFlags ^= 4096;});
			$('<img src="images/hexblack.png">').load(function(){loadingFlags ^= 8192;});
			setTimeout(function(){
				initialize(callback, 'complete_loadpics');
			}, 300);
			break;
		case 'complete_loadpics':
			drawLoadingQuote();
			var delay = 0;
			var waitcallback;
			if(loadingFlags){
				waitcallback = function(){
					initialize(callback, 'complete_loadpics');
				};
				delay = 750;

			}else{
				if(loadingFlags != lastLoadingFlags){

				}
				waitcallback = function(){
					initialize(callback, 'finish');
				};
			}
			setTimeout(waitcallback, delay);
			break;
		case 'finish':
			drawLoadingQuote('Wrapping up');

			$(document).keydown(keydownCall);
			$(document).keyup(keyupCall);
			if(callback != undefined){
				callback();
			}
			break;

	}
}


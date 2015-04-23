var MAP_WIDTH = 10;
var MAP_HEIGHT = 22;
var CELL_SIZE = 32;
var nextShape, activeShape;
var validShapes = ['L', 'J', 'T', 'Z', 'S', 'long', 'square'];
var map, mapTemplate;
var shapeSprite, clipSprite, imageClips;
var dropTimeout, dropTime;
var controls = {
	'ROT_LEFT' : ',',
	'ROT_RIGHT' : '.',
	'MOVE_DOWN' : 'DOWN',
	'MOVE_LEFT' : 'LEFT',
	'MOVE_RIGHT' : 'RIGHT',
	'EXIT_GAME' : 'ESC',
	'PAUSE_GAME' : 'SPACE'
};
var stats;

function shapeClass(){
	this.x = 0;
	this.y = 0;
	this.sprite = new spriteClass(shapeSprite);
	this.angleIndex = 0;
	this.shapeName = null;
};

shapeClass.prototype.getRandomShape = function(){
	this.setShape(validShapes[Math.floor(Math.random() * validShapes.length)]);
};

shapeClass.prototype.position = function(){
	if(arguments.length == 2){
		this.x = arguments[0];
		this.y = arguments[1];
		this.reposition();
	}else{
		return {'x' : this.x, 'y' : this.y};
	}
};

shapeClass.prototype.startPosition = function(){
	var min = 0, max = 0;
	for(var n in this.cells){
		min = min > this.cells[n][0] ? min : this.cells[n][0];
		max = max < this.cells[n][0] ? max : this.cells[n][0];
	}
	var x = MAP_WIDTH + max - min >> 1;
	if(this.shapeName == 'J') x++;
	this.position(x, 2);	
};

shapeClass.prototype.drawX = function(){ return (this.x + this.drawOffset.x) * CELL_SIZE; };
shapeClass.prototype.drawY = function(){ return (this.y + this.drawOffset.y - 2) * CELL_SIZE; };

shapeClass.prototype.reposition = function(){
	this.sprite.position(this.drawX(), this.drawY());
};

shapeClass.prototype.move = function(dx, dy){
	var n, x, y;
	var goodmove = true;
	for(n = 0; n < this.cells.length && goodmove; n++){
		x = this.x + this.cells[n][0] + dx;
		y = this.y + this.cells[n][1] + dy;
		if(x < 0 || x >= MAP_WIDTH || y >= MAP_HEIGHT){
			goodmove = false;
		}else if(map[x + MAP_WIDTH * y] != 0){
			goodmove = false;
		}
	}
	if(goodmove){
		this.x += dx;
		this.y += dy;
		this.reposition();
	}else if(dy > 0){
		// Let's set this sucker down
		dropShape();
	}
};

shapeClass.prototype.rotate = function(direction){
	direction = direction == -1 ? -1 : 1;
	var newCells = [];
	var x, y, n;
	switch(this.shapeName){
		case 'square':
			newCells = this.cells;
			break;
		case 'long':
			if(this.angleIndex % 2){
				newCells = [[-1, 0], [0, 0], [1, 0], [2, 0]];
			}else{
				newCells = [[0, -1], [0, 0], [0, 1], [0, 2]];
			}
			break;
		case 'Z':
			if(this.angleIndex % 2){
				newCells = [[-1, 0], [0, 0], [0, 1], [1, 1]];
			}else{
				newCells = [[1, -1], [1, 0], [0, 0], [0, 1]];
			}
			break;
		case 'S':
			if(this.angleIndex % 2){
				newCells = [[1, 0], [0, 0], [0, 1], [-1, 1]];
			}else{
				newCells = [[1, 1], [1, 0], [0, 0], [0, -1]];
			}
			break;
		default:
			for(var n = 0; n < this.cells.length; n++){
				newCells[n] = [- this.cells[n][1] * direction, this.cells[n][0] * direction];
			}
	}
	x = y = 0;
	for(n = 0; n < newCells.length; n++){
		x = this.x + newCells[n][0];
		y = this.y + newCells[n][1];
		if(x < 0 || x >= MAP_WIDTH || y >= MAP_HEIGHT || map[x + MAP_WIDTH * y] != 0){
			break;
		}
	}
	if(n >= newCells.length){
		this.cells = newCells;
		this.angleIndex = (this.angleIndex + direction + 4) % 4;
		this.sprite.setFrame(this.shapeName + '_' + this.angleIndex);
		this.reposition();
	}
};

shapeClass.prototype.setShape = function(shapeName){
	this.drawOffset = { x : 0, y : 0 };
	this.angleIndex = 0;
	var cellFrame = false;
	switch(shapeName){
		case 'L_cell': case 'J_cell': case 'T_cell': case 'Z_cell': case 'S_cell': case 'long_cell': case 'square_cell':
			this.cells = [[0, 0]];
			cellFrame = true;
			break;
		case 'L':
			this.cells = [[0, -1], [0, 0], [0, 1], [1, 1]];
			break;
		case 'J':
			this.cells = [[0, -1], [0, -0], [0, 1], [-1, 1]];
			this.angleIndex = 2;
			break;
		case 'T':
			this.cells = [[0, -1], [-1, 0], [0, 0], [1, 0]];
			this.angleIndex = 2;
			break;
		case 'Z':
			this.cells = [[-1, 0], [0, 0], [0, 1], [1, 1]];
			break;
		case 'S':
			this.cells = [[1, 0], [0, 0], [0, 1], [-1, 1]];
			break;
		case 'long':
			this.cells = [[0, -1], [0, 0], [0, 1], [0, 2]];
			this.angleIndex = 1;
			break;
		case 'square':
			this.cells = [[0, 0], [0, 1], [1, 0], [1, 1]];
			this.drawOffset = { x : 1, y : 1 };
			break;
		default:
			throw "Invalid shape name '" + shapeName + "'";
	}
	this.shapeName = shapeName;
	if(cellFrame){
		this.sprite.setFrame(shapeName);
	}else{
		this.sprite.setFrame(shapeName + '_' + this.angleIndex);
	}
};

shapeClass.prototype.draw = function(target){
	this.sprite.draw(target);
};


shapeClass.prototype.drawBoxes = function(target){
	var n;
	var colour = 'rgb(' + Math.floor(Math.random() * 256) + ', ' + Math.floor(Math.random() * 256) + ', ' + Math.floor(Math.random() * 256) + ')';
	for(n = 0; n < this.cells.length; n++){
		var box = $('<div></div>');
		var cx = (this.x + this.cells[n][0]) * CELL_SIZE;
		var cy = (this.y + this.cells[n][1] - 2) * CELL_SIZE;
		box.css({
			'width' : CELL_SIZE + 'px',
			'height' : CELL_SIZE + 'px',
			'background-color' : colour,
			'border' : 'solid',
			'border-width' : '1px',
			'border-color' : '#000',
			'position' : 'absolute',
			'top' : cy + 'px',
			'left' : cx + 'px'
		});
		box.appendTo($('#canvas'));
	}
};


function dropShape(){
	var n, m, x, y, shape, tempShape, shapeList, completedRow, clearedRows = [];
	for(n in activeShape.cells){
		x = activeShape.x + activeShape.cells[n][0];
		y = activeShape.y + activeShape.cells[n][1];
		map[x + MAP_WIDTH * y] = activeShape;
	}
	activeShape = nextShape;

	activeShape.startPosition();
	activeShape.draw($('#canvas'));

	var goodmove = true;
	for(n = 0; n < activeShape.cells.length && goodmove; n++){
		x = activeShape.x + activeShape.cells[n][0];
		y = activeShape.y + activeShape.cells[n][1];
		if(map[x + MAP_WIDTH * y] != 0){
			goodmove = false;
		}
	}
	if(!goodmove){
		$('#previewArea').empty();
		endGame();
		return;
	}

	nextShape = new shapeClass();
	nextShape.getRandomShape();
	drawPreview(nextShape);
	for(y = MAP_HEIGHT - 1; y >= 0; y--){
		completedRow = true;
		shapeList = [];
		for(x = 0; x < MAP_WIDTH; x++){
			shape = droppedShapeAt(x, y);
			if(!shape){
				completedRow = false;
				break;
			}else{
				for(m = 0; m < shapeList.length && shapeList[m] != shape; m++);
				if(m >= shapeList.length){
					shapeList[shapeList.length] = shape;
				}
			}
		}
		if(completedRow){
			clearedRows[clearedRows.length] = y;
			for(n = 0; n < shapeList.length; n++){
				splitDroppedShape(shapeList[n]);
			}
		}
	}

	if(clearedRows.length > 0){
		clearRows(clearedRows);
		var numRows = clearedRows.length
		if((stats.lines % 10) + numRows >= 10){
			var imgIndex = stats.level % 10;
			$('#eyecandy').fadeOut(200, function(){
				$('#eyecandy').empty();
				imageClips.drawFrame($('#eyecandy'), ['horse_1', 'horse_2', 'swan', 'giraffe', 'camel', 'duck', 'mushroom', 'bug', 'raven', 'turtle', 'bison_skull', '3dplus', 'raptor', 'jellyfish', 'gecko', 'octopus'][imgIndex], 0, 0);
				$('#eyecandy').fadeIn(200);
			});
			stats.level++;
			dropTime = (dropTime >> 1) + (dropTime >> 2);
		}
		stats.lines += numRows;
		stats.score += 5 * (1 << numRows);
		drawStats();
	}
}

function clearRows(rows){
	var x, y, n;
	var delta = 0;
	y = MAP_HEIGHT - 1;
	nextRowIndex = 0;
	while(y > 0){
		n = y * MAP_WIDTH;
		for(x = 0; x < MAP_WIDTH; x++){
			if(y == rows[nextRowIndex]){
				map[n].sprite.remove();
				map[n] = 0;
			}else if(map[n]){
				if(delta){
					map[n].dropAmount = delta;
					map[n + MAP_WIDTH * delta] = map[n];
					map[n] = 0;
				}else{
					map[n].dropAmount = 0;
				}
			}
			n++;
		}
		if(nextRowIndex < rows.length && y == rows[nextRowIndex]){
			delta++;
			nextRowIndex++;
		}
		y--;
	}

	for(n = 0; n < map.length; n++){
		if(map[n] != 0 && map[n].dropAmount > 0){
			map[n].position(map[n].x, map[n].y + map[n].dropAmount);
			map[n].dropAmount = 0;
		}
	}
}

function splitDroppedShape(shape){
	var n, x, y, newShape;
	if(shape.cells.length == 1) return;
	newName = shape.shapeName + '_cell';
	
	for(n = 1; n < shape.cells.length; n++){
		newShape = new shapeClass();
		newShape.setShape(newName);
		newShape.position(shape.x + shape.cells[n][0], shape.y + shape.cells[n][1]);
		newShape.draw($('#canvas'));
		map[newShape.x + newShape.y * MAP_WIDTH] = newShape;
	}
	shape.position(shape.x + shape.cells[0][0], shape.y + shape.cells[0][1]);
	map[shape.x + shape.y * MAP_WIDTH] = shape;
	shape.setShape(newName);
	shape.reposition();
}

function droppedShapeAt(x, y){
	return map[x + MAP_WIDTH * y];
}

function mapIndex(x, y){
	if(x < 0 || x >= MAP_WIDTH) return -1;
	if(y < 0 || y >= MAP_HEIGHT) return -1;
	return x + y * MAP_WIDTH;
}

function drawPreview(shape){
	var wrapper = $('<div></div>');
	var frameName = shape.shapeName.toLowerCase() + '_' + shape.angleIndex;
	wrapper.css({
		'display' : 'inline-block',
		'position' : 'relative',
		'margin' : 'auto',
		'top' : '16px'
	});
	var pic = shape.sprite.renderFrame(frameName, 0, 0);
	pic.appendTo(wrapper);
	wrapper.css('width', pic.width() + 'px');
	wrapper.css('top', (($('#previewArea').height() - pic.height()) >> 2) + 'px');
	
	$('#previewArea').empty();
	wrapper.appendTo($('#previewArea'));
}

function handleGameKey(key){
	switch(REV_KEYMAP[key]){
		case controls.ROT_LEFT:
			activeShape.rotate(-1);
			break;
		case controls.ROT_RIGHT:
			activeShape.rotate(1);
			break;
		case controls.MOVE_DOWN:
			clearTimeout(dropTimeout)
			dropTimeout = setTimeout(moveDown, dropTime);
			activeShape.move(0, 1);
			break;
		case controls.MOVE_LEFT:
			activeShape.move(-1, 0);
			break;
		case controls.MOVE_RIGHT:
			activeShape.move(1, 0);
			break;
		case controls.EXIT_GAME:
			clearTimeout(dropTimeout);
			$('#canvas').empty();
			$('#gameContent').css('display', 'none');
			$('#menuWrapper').fadeIn(300);
			gameState = 'menu';
			break;
		case controls.PAUSE_GAME:
			gameState = 'paused';
			clearTimeout(dropTimeout);
			break;
	}
}

var loadingFlags;
var waitcallback;
var loadNotice;
function initialize(callback, step){
	if(step == undefined){
		step = 'start';
	}
	switch(step){
		case 'start':
			$('#loadingMessage').html('Loading Sprites');
			shapeSprite = new spriteSet();
			shapeSprite.load('tetrigami.sprite', function(){
				initialize(callback, 'loadClips');
			});
			break;
		case 'loadClips':
			$('#loadingMessage').html('Clipping the hedges');
			clipSprite = new spriteSet();
			clipSprite.load('clips.sprite', function(){
				imageClips = new spriteClass(clipSprite);
				initialize(callback, 'loadPics');
			});
			break;
		case 'loadPics':
			$('#loadingMessage').html('Loading Images');
			loadingFlags = 127;
			loadNotice = "Taking our time";
			$('<img src="images/grainypaper.jpg">').load(function(){ loadNotice = "Using the force"; loadingFlags ^= 1;});
			$('<img src="images/playareaoverlay.png">').load(function(){ loadNotice = "Activating the flux capacitor"; loadingFlags ^= 2;});
			$('<img src="images/previewareabackdrop.png">').load(function(){ loadNotice = "Pushing the big red button"; loadingFlags ^= 4;});
			$('<img src="images/playareabackdrop.png">').load(function(){ loadNotice = "Opening the pod bay doors"; loadingFlags ^= 8;});
			$('<img src="images/infoareabackdrop.png">').load(function(){ loadNotice = "Tuning the bicycle"; loadingFlags ^= 16;});
			$('<img src="images/us.png">').load(function(){ loadNotice = "Charging the flash"; loadingFlags ^= 32;});
			$('<img src="images/tetrisPieces.png">').load(function(){ loadNotice = "Betting you can't eat just one"; loadingFlags ^= 64;});
			initialize(callback, 'finishCaching');
			break;
		case 'finishCaching':
			//wait for all of the images to finish loading before we continue
			var delay = 0;
			if(loadingFlags){
				$('#loadingMessage').html(loadNotice);
				waitcallback = function(){
					initialize(callback, 'finishCaching');
				};
				delay = 100;

			}else{
				waitcallback = function(){
					initialize(callback, 'finish');
				};
			}
			setTimeout(waitcallback, delay);
			break;
		case 'finish':
			$('#loadingMessage').html('Ignition');
			callback();
			break;
	}
}

function moveDown(){
	dropTimeout = setTimeout(moveDown, dropTime);
	activeShape.move(0, 1);
}

function drawStats(){
	$('#cleared').html(stats.lines);
	$('#score').html(stats.score);
	$('#level').html(stats.level);
}

function startGame(){
	stats = {
		lines : 0,
		score : 0,
		level : 0
	};
	drawStats();

	$('#menuWrapper').css('display', 'none');
	$('#gameContent').css('display', 'block');
	mapTemplate = [];
	for(var n = MAP_HEIGHT * MAP_WIDTH - 1; n >= 0; n--) mapTemplate[n]  = 0;
	map = mapTemplate.slice(0);
	activeShape = new shapeClass();
	activeShape.getRandomShape();
	activeShape.startPosition();
	activeShape.draw($('#canvas'));

	nextShape = new shapeClass();
	nextShape.getRandomShape();
	drawPreview(nextShape);

	setGameState('playing');
	dropTime = 1000;
	dropTimeout = setTimeout(moveDown, dropTime);
}
var cascadingTally;
function cascadeShape(shape){
	return function(){
		shape.sprite.element.animate(
			{
				'top' : 1000 + Math.random() * 500,
				'left' : Math.random() * 128 - 64 + shape.drawX()
			},
			Math.random() * 500 + 1000,
			function(){
				cascadingTally--;
				if(cascadingTally <= 10){
					cascadingTally = 100
					$('#gameContent').css('display', 'none');
					$('#menuWrapper').fadeIn(300);
					gameState = 'menu';
				}
			}
		)
	};
}

function endGame(){
	var n;
	gameState = 'dead';
	clearTimeout(dropTimeout);
	cascadingTally = 1;
	cascadeShape(activeShape)();
	for(n = 0; n < map.length; n++){
		if(map[n] != 0 && map[n].hasFallen == undefined){
			map[n].hasFallen = true;
			cascadingTally ++;
			setTimeout(cascadeShape(map[n]), Math.random() * 50 + n * 5);
		}
	}
	
}

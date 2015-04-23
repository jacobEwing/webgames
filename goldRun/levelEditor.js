//var ANIMATION_FREQUENCY = 50;
var keyState = {};
var KEYMAP = {
	'UP' : 38,		'DOWN' : 40,		'LEFT' : 37,		'RIGHT' : 39,
	'ESC' : 27,		'ENTER' : 13,		'TAB' : 9,		'SPACE' : 32,
	'SHIFT' : 16,		'CTRL' : 17,		'ALT' : 18,
	'CAPS_LOCK' : 20,	'NUM_LOCK' : 144,	'SCROLL_LOCK' : 145,
	'PGUP' : 33,		'PGDN' : 34,		'END' : 35,
	'HOME' : 36,		'INSERT' : 45,		'DELETE' : 46
};
for(n = 65; n < 91; n++) KEYMAP[String.fromCharCode(n)] = n;
for(n = 0; n < 10; n++) KEYMAP[n] = 48 + n;
for(n = 1; n <= 12; n++) KEYMAP['F' + n] = 111 + n;

for(n in KEYMAP){
	keyState[n] = 0;
}

function keyupCall(e){
	handleKey(e.which, 1); return false;
}
function keydownCall(e){
	handleKey(e.which, 0); return false;
}

// relevant to both gameplay and edtior
var sprites;
var characterMap = {
	'empty' : 0, 0 : 'empty',
	'brick' : 1, 1 : 'brick',
	'steel' : 2, 2 : 'steel',
	'ladder' : 3, 3 : 'ladder',
	'hiddenladder' : 4, 4 : 'hiddenladder',
	'bar' : 5, 5 : 'bar',
	'gold' : 6, 6 : 'gold',
	'goodguy' : 7, 7 : 'goodguy',
	'badguy' : 8, 8 : 'badguy',
	'water1' : 9, 9 : 'water1',
	'deepwater' : 10, 10 : 'deepwater',
	'fire1' : 11, 11 : 'fire1',
	'elevator_up_1' : 12, 12 : 'elevator_up_1',
	'elevator_down_1' : 13, 13 : 'elevator_down_1',
	'ice_1' : 14, 14 : 'ice_1',
	'floorspike_7' : 15, 15 : 'floorspike_7',
	'ceilingspike_7' : 16, 16 : 'ceilingspike_7',
	'blades_3' : 17, 17 : 'blades_3',
	'teleporter_1' : 18, 18 : 'teleporter_1',
	'heart_2' : 19, 19 : 'heart_2',
	'righthinge_2' : 20, 20 : 'righthinge_2',
	'lefthinge_2' : 21, 21 : 'lefthinge_2'
};
var mapWidth = 40, mapHeight = 24;
var map = [];
var spriteMap = [];

// relevant only to the editor
var buttonList = ['eraserbutton', 'brick', 'steel', 'ladder', 'hiddenladder', 'bar', 'gold', 'goodguy', 'badguy', 'water1', 'ice_1', 'deepwater', 'fire1', 'elevator_up_1', 'elevator_down_1', 'floorspike_7', 'ceilingspike_7', 'blades_3', 'teleporter_1', 'heart_2', 'righthinge_2', 'lefthinge_2'];
var editButtons = [];
var cursorSprite, currentTool, mouseState = 0;

function handleKey(code, state){
	keyState[code] = state ? 1 : 0;
}

function clearLevel(){
	var x, y;
	for(x = 0; x < mapWidth; x++){
		for(y = 0; y < mapHeight; y++){
			if(spriteMap[x][y] != null){
				spriteMap[x][y].remove();
				spriteMap[x][y] = null;
			}
			map[x][y] = null;
		}
	}
}

// functions relevant only to the editor
function draw_editor(){
	var n, x, y;
	// initialize the map
	for(x = 0; x < mapWidth; x++){
		map[x] = [];
		spriteMap[x] = [];
		for(y = 0; y < mapHeight; y++){
			map[x][y] = characterMap['empty'];
			spriteMap[x][y] = null;
		}
	}

	// build our buttons
	editButtons = [];
	function addAction(ob, nm){
		ob.click(function(){setTool(nm); return false;});
	}

	for(n in buttonList){
		editButtons[n] = new spriteClass(sprites);
		var buttonObj = editButtons[n].drawFrame($('#gameHeader'), buttonList[n], n * editButtons[n].width, 0);
		var buttonName = buttonList[n];
		addAction(buttonObj, buttonName);
	}

	// set up the cursor
	cursorSprite = new spriteClass(sprites);
	setTool('eraserbutton');
	cursorSprite.appendTo($('#gameCanvas'));

	// set up the editing behavior
	$('#gameOverlay').mousemove(function(evt){
		var offset = $('#gameCanvas').offset();
		var x = evt.pageX - offset.left;
		var y = evt.pageY - offset.top;
		x = Math.floor(x / sprites.frameWidth);
		y = Math.floor(y / sprites.frameHeight);
		var oldPos = cursorSprite.position();
		var drawx = x * sprites.frameWidth;
		var drawy = y * sprites.frameHeight;
		if(oldPos.left != drawx || oldPos.top != drawy){
			$('#mousePos').html(x + ', ' + y);
			cursorSprite.position(drawx, drawy);
			if(mouseState == 1){
				draw(x, y);
			}
		}
	});

	$('#gameOverlay').mousedown(function(evt){
		mouseState = 1;
		$('#mouseState').html(mouseState);
		var offset = $('#gameCanvas').offset();
		var x = evt.pageX - offset.left;
		var y = evt.pageY - offset.top;
		if(x >= 0 && x < $('#gameCanvas').width() && y >= 0 && y < $('#gameCanvas').height()){
			x = Math.floor(x / sprites.frameWidth);
			y = Math.floor(y / sprites.frameHeight);
			draw(x, y);
		}
		return false;
	});

	$('#newLevelName').mousedown(function(){
		$('#newLevelName').focus();
	});

	$('#editorPass').mousedown(function(){
		$('#editorPass').focus();
	});

	$(document).mouseup(function(evt){
		mouseState = 0;
		$('#mouseState').html(mouseState);
		return false;
	});
}

function draw(x, y){
	if(currentTool == 'eraser'){
		map[x][y] = null;
		if(spriteMap[x][y] != null){
			spriteMap[x][y].remove();
			spriteMap[x][y] = null;
		}
		
	}else{
		map[x][y] = characterMap[currentTool];
		if(spriteMap[x][y] == null){
			spriteMap[x][y] = new spriteClass(sprites);
			spriteMap[x][y].setFrame(currentTool);
			spriteMap[x][y].position(x * sprites.frameWidth, y * sprites.frameHeight);
			spriteMap[x][y].draw($('#gameCanvas'));
		}else{
			spriteMap[x][y].setFrame(currentTool);
		}
	}
	
}

function setTool(toolName){
	if(toolName == 'eraserbutton'){
		cursorSprite.setFrame('eraser');
		currentTool = 'eraser';
	}else{
		cursorSprite.setFrame('cursor');
		currentTool = toolName;
	}
	$('#currentTool').html(currentTool);
	return false;
}

function saveLevel(){
	var x, y;
	var lastVal = -1;
	var tally = 0;
	var rval = '';
	var name = $('#newLevelName').val();

	if(name.length == 0){
		alert('You must specify a level name.');
		return;
	}
	for(y = 0; y < mapHeight; y++){
		for(x = 0; x < mapWidth; x++){
			val = map[x][y] == null ? 0 : map[x][y];
			if(val == lastVal){
				tally++;
			}else{
				if(lastVal != -1){
					if(rval == ''){
						rval = lastVal + ':' + tally;
					}else{
						rval = rval + (',' + lastVal + ':' + tally);
					}
				}
				tally = 1;
				lastVal = val;
			}
		}
	}
	if(rval == ''){
		rval = lastVal + ':' + tally;
	}else{
		rval = rval + (',' + lastVal + ':' + tally);
	}
	$.post('levelEditor.php?action=save', {'title':$('#newLevelName').val(), 'map':rval}, function(result){
		if(result == 'Ok'){
			message('Successfully Saved');
		}else{
			message('Error Saving Level');
		}
		// do something
	});
}

function loadLevel(){
	$('#gameCanvas').empty();
	$.post('levelEditor.php?action=load', {'title':$('#levelSelect').val()}, function(result){
		var leveldat, dat, n, m, x, y;
		eval('leveldat = ' + result);
		// initialize the map
		for(x = 0; x < mapWidth; x++){
			map[x] = [];
			spriteMap[x] = [];
			for(y = 0; y < mapHeight; y++){
				map[x][y] = characterMap['empty'];
				spriteMap[x][y] = null;
			}
		}
		var parts = leveldat.split(',');
		x = y = 0;
		for(n in parts){
			dat = parts[n].split(':');
			for(m = 0; m < dat[1]; m++){
				map[x][y] = dat[0];
				if(spriteMap[x][y] == null){
					spriteMap[x][y] = new spriteClass(sprites);
					spriteMap[x][y].setFrame(characterMap[dat[0]]);
					spriteMap[x][y].position(x * sprites.frameWidth, y * sprites.frameHeight);
					spriteMap[x][y].draw($('#gameCanvas'));
				}else{
					spriteMap[x][y].setFrame(characterMap[dat[0]]);
				}


				x++;
				if(x >= mapWidth){
					x = 0;
					y++;
				}
			}
		}
		cursorSprite.appendTo($('#gameCanvas'));
		$('#newLevelName').val($('#levelSelect').val());
	});
}

function message(text){
	$('#messages').html(text);
}

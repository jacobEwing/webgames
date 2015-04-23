var drawOffset, animationTally;
var offTally;
var gameState, currentLevel = 0;
var button, buttonTypes, numButtons;
var stepCounter, bestCounter;
var levelmap, testlevel;
var levelQueue;
var hint;
var clickedButton = null;

levelQueue = [];
buttonTypes = ['flipNeighbours', 'rotateNeighbours'];

var digiType = function(objName){
	var image;
	var position;
	var canvas;
	var digit;
	var value;

	this.image = {
		0:new imgElement('images/digits/0.png'),
		1:new imgElement('images/digits/1.png'),
		2:new imgElement('images/digits/2.png'),
		3:new imgElement('images/digits/3.png'),
		4:new imgElement('images/digits/4.png'),
		5:new imgElement('images/digits/5.png'),
		6:new imgElement('images/digits/6.png'),
		7:new imgElement('images/digits/7.png'),
		8:new imgElement('images/digits/8.png'),
		9:new imgElement('images/digits/9.png')
	};
	this.position = {'x':0, 'y':0};
	this.canvas = null;
	this.digit = [];
	this.value = 0;

	this.setCanvas = function(newCanvas){
		this.canvas = newCanvas;
	}

	this.reset = function(newvalue){
		if(newvalue == undefined) newvalue = 0;
		this.value = newvalue;
		this.draw();
	}

	this.increment = function(){
		this.value++;
		this.draw();
	}

	this.eraseDigits = function(){
		for(n in this.digit){
			if(this.digit[n] != undefined){
				this.digit[n].element.remove();
				this.digit[n] = undefined;
			}
		}
	}

	this.draw = function(numval){
		this.eraseDigits();
		
		if(numval == undefined) numval = this.value;
		numval = Math.floor(numval);
		numtext = '' + numval;
		for(n = 0; n < numtext.length; n++){
			this.drawDigit(numtext.substr(n, 1), n);
		}
		
	}

	this.drawDigit = function(value, column){
		if(this.canvas == null) return false;
		if(this.digit[column] != undefined){
			this.digit[column].element.remove();
			this.digit[column] = undefined;
		}
		this.digit[column] = this.image[1 * value].copy();
		this.digit[column].appendTo(this.canvas);
		this.digit[column].setPosition(10 * column, 6 * column);
	}
}

function incAnimationTally(increment){
	animationTally += increment;
	if(animationTally == 0){
		if(offTally == 0){
			gameState = 'won';
			setTimeout('finishLevel()', 600);
		}
	}
}

function realPosition(x, y){
	return {'x':48 * x - drawOffset.x, 'y': 27.5 * x + 55 * y + drawOffset.y};
}

// flips the six cells that surround the current selected one
function flipNeighbours(x, y, flipSelf){
	if(animationTally != 0) return false;
	if(flipSelf != undefined) flipSelf = false;
	var n;
	for(n = 0; n < numButtons; n++){
		if(button[n].position.y == y){
			if(Math.abs(button[n].position.x - x) == 1 || (flipSelf && button[n].position.x == x)){
				button[n].flip();
			}
		}else if(button[n].position.y == y - 1){
			dx = button[n].position.x - x;
			if(dx == 1 || dx == 0){
				button[n].flip();
			}
		}else if(button[n].position.y == y + 1){
			dx = button[n].position.x - x;
			if(dx == -1 || dx == 0){
				button[n].flip();
			}
		}
	}
}

// flips the selected cell as well as the six that surround it
function flipSelfAndNeighbours(x, y){
	flipNeighbours(x, y, true);
}

function rotateNeighbours(x, y, direction){
	if(animationTally != 0) return false;
	var n;
	for(n = 0; n < numButtons; n++){
		if(button[n].position.y == y){
			dx = button[n].position.x - x;
			if(dx == 1){
				incAnimationTally(1);
				if(direction == -1){
					realPos = realPosition(x + 1, y - 1);
					button[n].setPosition(x + 1, y - 1, true);
				}else{
					realPos = realPosition(x, y + 1);
					button[n].setPosition(x, y + 1, true);
				}
				button[n].animObj.moveTo(realPos.x, realPos.y, {'stepsize':12, callback:'incAnimationTally(-1)'}); 
			}else if(dx == -1){
				incAnimationTally(1);
				if(direction == -1){
					realPos = realPosition(x - 1, y + 1);
					button[n].setPosition(x - 1, y + 1, true);
				}else{
					realPos = realPosition(x, y - 1);
					button[n].setPosition(x, y - 1, true);
				}
				button[n].animObj.moveTo(realPos.x, realPos.y, {'stepsize':12, callback:'incAnimationTally(-1)'}); 
			}
		}else if(button[n].position.y == y - 1){
			dx = button[n].position.x - x;
			if(dx == 1){
				incAnimationTally(1);
				if(direction == -1){
					realPos = realPosition(x, y - 1);
					button[n].setPosition(x, y - 1, true);
				}else{
					realPos = realPosition(x + 1, y);
					button[n].setPosition(x + 1, y, true);
				}
				button[n].animObj.moveTo(realPos.x, realPos.y, {'stepsize':12, callback:'incAnimationTally(-1)'}); 
			}else if(dx == 0){
				incAnimationTally(1);
				if(direction == -1){
					button[n].setPosition(x - 1, y, true);
					realPos = realPosition(x - 1, y);
				}else{
					button[n].setPosition(x + 1, y - 1, true);
					realPos = realPosition(x + 1, y - 1);
				}
				button[n].animObj.moveTo(realPos.x, realPos.y, {'stepsize':12, callback:'incAnimationTally(-1)'}); 
			}
		}else if(button[n].position.y == y + 1){
			dx = button[n].position.x - x;
			if(dx == -1){
				incAnimationTally(1);
				if(direction == -1){
					realPos = realPosition(x, y + 1);
					button[n].setPosition(x, y + 1, true);
				}else{
					realPos = realPosition(x - 1, y);
					button[n].setPosition(x - 1, y, true);
				}
				button[n].animObj.moveTo(realPos.x, realPos.y, {'stepsize':12, callback:'incAnimationTally(-1)'}); 
			}else if(dx == 0){
				incAnimationTally(1);
				if(direction == -1){
					realPos = realPosition(x + 1, y);
					button[n].setPosition(x + 1, y, true);
				}else{
					realPos = realPosition(x - 1, y + 1);
					button[n].setPosition(x - 1, y + 1, true);
				}
				button[n].animObj.moveTo(realPos.x, realPos.y, {'stepsize':12, callback:'incAnimationTally(-1)'}); 
			}
		}
	}
}


function setTrigger(button){
	if(!testLevel){
		if(button.state == 1){
			switch(button.objType){
				case 'flipNeighbours':
					button.animObj.frame[0].element.mouseup(function(){if(animationTally == 0 && clickedButton == button.globalName){stepCounter.increment();flipNeighbours(button.position.x, button.position.y);}});
					break;
				case 'rotateNeighbours':
					button.animObj.frame[0].element.mouseup(function(){if(animationTally == 0 && clickedButton == button.globalName){stepCounter.increment();rotateNeighbours(button.position.x, button.position.y, 1);}});
					break;
			}
		}
	}else{
		switch(button.objType){
			case 'flipNeighbours':
				if(button.state == 1){
					button.animObj.frame[0].element.mouseup(function(){if(animationTally == 0 && clickedButton == button.globalName){stepCounter.increment();flipNeighbours(button.position.x, button.position.y);}});
				}
				break;
			case 'rotateNeighbours':
				if(button.state == 1){
					button.animObj.frame[0].element.mouseup(function(){if(animationTally == 0 && clickedButton == button.globalName){stepCounter.increment();rotateNeighbours(button.position.x, button.position.y, -1);}});
				}
				break;
		}
	}
	button.animObj.frame[0].element.mousedown(function(){clickedButton = button.globalName; return false});
	button.animObj.frame[7].element.mousedown(function(){clickedButton = button.globalName; return false});
	
}

function finishLevel(){
	currentLevel++;
	clearLevel(function(){getLevel(currentLevel)});
}

function getLevel(levelNum){
	gameState = 'loading';
	if(levelQueue[levelNum] == undefined){
		loadLevel(levelNum, function(){getLevel(levelNum);});
	}else{
		levelMap = levelQueue[levelNum];
		if(levelMap['cells'] != undefined){
			drawLevel(function(){
				showTitle(levelMap['title']);
			});

			// go ahead and cache the next level
			if(1 * levelNum == levelNum){
				nextLevelnum = 1 * levelNum + 1;
				if(levelQueue[nextLevelnum] == undefined){
					setTimeout('loadLevel(' + nextLevelnum + ')', 1000);
				}
			}
		}else{
			showHint(levelMap['message'], function(){currentLevel = 0; getLevel(currentLevel);}, true);
		}

	}
}

function loadLevel(levelNum, callback){

	$.get('index.php', {'action':'getLevel', 'id':levelNum}, function(resultstring){
		eval('levelQueue["' + levelNum + '"] = ' + resultstring);
		if(callback != undefined) callback();
	});
}

function showTitle(title){
	var titleDiv = $('#titleDiv');
	titleDiv.html(title);
	titleDiv.fadeIn('medium').delay(500).fadeOut('medium');
}

function clearLevel(callback){
	gameState = 'clearing';
	var n;
	if(callback == undefined) callback = function(){};
	animationTally = numButtons;
	for(n = 0; n < numButtons; n++){
		button[n].animObj.canvas.animate({'top':'+=' + $(window).height() + 'px'}, Math.random() * 500 + 300, 'swing', function(){
			animationTally --;
			if(animationTally == 0){
				finishClearLevel(callback);
			}
		});
	}
}

function finishClearLevel(callback){
	animationTally = 0;
	stepCounter.reset();
	offTally = 0;
	drawOffset = {x:0, y:0};
	button = [];
	numButtons = 0;
	$('#content').empty();
	if(callback != undefined) callback()
}

var disableHints;
disableHints = false;

function drawLevel(callback){
	var x, y;
	if(callback == undefined) callback = function(){};
	drawOffset = {'x':levelMap['offset'][0], 'y':levelMap['offset'][1]};
	$('#titlebar').html(levelMap['title']);
	animationTally = 0;
	bestCounter.value = levelMap['best'];
	bestCounter.draw();
	testLevel = levelMap['testlevel'] != undefined;
	if(testLevel) offTally = 9999;
	for(celltype in levelMap['cells']){
		plateSet = levelMap['cells'][celltype];

		// can't just say "plateSet.length" when using the custom
		// json_encode function, so we'll calculate it's length manually.
		var objlen = 0;
		for(elem in plateSet) objlen++;

		for(n = 0; n < objlen; n += 3){
			animationTally++;
			button[numButtons] = new buttonClass('button[' + numButtons + ']', celltype);
			button[numButtons].setPosition(plateSet[n], plateSet[n + 1]);
			state = plateSet[n + 2];
			button[numButtons].setState(plateSet[n + 2]);
			offTally += (1 - state);
			setTrigger(button[numButtons]);
			realPos = realPosition(button[numButtons].position.x, button[numButtons].position.y);
			button[numButtons].animObj.canvas.css({'top':'-100px'});
			button[numButtons].animObj.canvas.animate({'top': + realPos.y + 'px'}, Math.random() * 500 + 300, 'swing', function(){
				animationTally--;
				if(animationTally == 0){
					gameState = 'playing';
					if(levelMap['hint'] != undefined && !disableHints){
						showHint(levelMap['hint'], callback);
						levelMap['hint'] = undefined; // we only want the hint once per loading of the level
					}else{
						callback();
					}
				}
			});
			button[numButtons].animObj.appendTo($('#content'));
			numButtons++;
		}
	}

}

function closeHint(){
	colourBack.fadeTo(400, 0);
	backing.fadeTo(400, 0, function(){
		backing.remove();
		colourBackHolder.remove();
		if(hintCallback != undefined){
			hintCallback();
		}
	});
}

function toggleHints(){
	disableHints = !disableHints;
}

function showHint(promptText, callback, hideDisable){
	if(hideDisable == undefined) hideDisable = false;
	if(callback == undefined){
		hintCallback = function(){};
	}else{
		hintCallback = callback;
	}

	colourBackHolder = $('<div></div>');
	colourBackHolder.css({"width":"0px", "height":"0px", "top":"0px", "left":"0px", "position":"fixed"});
	colourBack = $('<div></div>');
	colourBack.css({'position':'absolute', 'top':'0', 'left':'0', 'background-color':'#000'});
	colourBack.appendTo(colourBackHolder);	
	colourBack.css({'width':$(document).width() + 'px', 'height':$(document).height() + 'px'});
	colourBack.fadeTo(0, 0);

	backing = $('<div></div>');
	backing.addClass('screenOverlay');
	backing.fadeTo(0, 0);

	wrapper = $('<div></div>');
	wrapper.addClass('promptWrapper');

	hint = $('<div></div>');
	hint.addClass('promptBox');

	hint.append(promptText);
	footbit = $('<div></div>');
	footbit.css({'clear':'both', 'padding-top':'2em', 'position':'relative'});
	if(!hideDisable){
		checkbox = $('<div></div>');
		checkbox.addClass('disableHints');
		checkText = '<input type="checkbox" id="disable" class="customcheck" onclick = "toggleHints();"';
		if(disableHints) checkText += ' SELECTED';
		checkText += '> Disable Tips</div>';
		checkbox.append(checkText);

		footbit.append(checkbox);
	}
	okButton = $('<input type="button" value="Close" class="promptButton"></input>');
	okButton.appendTo(footbit);
	okButton.click(function(){closeHint();});
	footbit.appendTo(hint);

	hint.appendTo(wrapper);
	wrapper.appendTo(backing);

	colourBackHolder.appendTo($('body'));
	backing.appendTo($('body'));
	wrapper.css({'top': (backing.height() - wrapper.height()) / 2 + 'px'});


	// all assembled - let's fade in
	colourBack.fadeTo(400, 0.6);
	backing.fadeTo(400, 0.9);
}

function restartLevel(){
	if(gameState == 'playing'){
		clearLevel(function(){drawLevel()});
	}
}

function skipLevel(){
	if(gameState == 'playing'){
		currentLevel++;
		clearLevel(function(){getLevel(currentLevel)});
	}
}
var lodingTally;
var loadingAnim;
function startGame(step){
	if(step == undefined){
		step = 'init';
	}
	switch(step){
		case 'init':
			gameState = 'initializing';
			stepCounter = new digiType();
			stepCounter.setCanvas($('#stepstaken'));
			bestCounter = new digiType();
			bestCounter.setCanvas($('#beststeps'));
			startGame('loadbg');
			break;
		case 'loadbg':
			$('<img src="images/backdrop2.jpg">').load(function(){
				startGame('loadLogo');
			});
			break;
		case 'loadLogo':
			$('<img src="images/swix.png">').load(function(){
				startGame('loadAnimation');
			});
			break;
		case 'loadAnimation':
			$('#loadingPrompt').append('<img src="images/swix.png"/><br/><span id="loadingText">Loading</span>');
			loadingAnim = setInterval(function(){
				var ang = Math.random() * 2 * Math.PI;
				var xoffset = 2 * Math.sin(ang);
				var yoffset = 2 * Math.cos(ang);
				c = 160 + Math.floor(Math.random() * 96);
				if(Math.random() < .05){
					$('#loadingText').html('10@d1n6');
				}else{
					$('#loadingText').html('Loading');
				}
				$('#loadingText').css({
					'padding-top' : xoffset,
					'padding-left' : yoffset,
					'color' : 'rgb(' + c + ', ' + c + ', ' + c + ')',
					'font-size' : (Math.random() * 2 + 39) + 'px'
				});
			}, 20);
			startGame('cache');
			break;
		case 'cache':
			// cache the images for gameplay
			var imageList = [
				'digits/6.png', 'digits/0.png', 'digits/2.png', 'digits/7.png',
				'digits/5.png', 'digits/9.png', 'digits/3.png', 'digits/8.png', 'digits/4.png',
				'digits/1.png', 'reset.png', 'exit.png', 'moves.png', 'bigBlueArrow.png',
				'button3/button3_08.png', 'button3/button3_11.png', 'button3/button3_03.png',
				'button3/button3_01.png', 'button3/button3_12.png', 'button3/button3_00.png',
				'button3/button3_09.png', 'button3/button3_04.png', 'button3/button3_10.png',
				'button3/button3_13.png', 'button3/button3_06.png', 'button3/button3_02.png',
				'button3/button3_05.png', 'button3/button3_07.png', 'button2/button2_06.png',
				'button2/button2_01.png', 'button2/button2_12.png', 'button2/button2_05.png',
				'button2/button2_13.png', 'button2/button2_07.png', 'button2/button2_11.png',
				'button2/button2_00.png', 'button2/button2_08.png', 'button2/button2_10.png',
				'button2/button2_02.png', 'button2/button2_04.png', 'button2/button2_03.png',
				'button2/button2_09.png', 'hexgrid.png', 'best.png', 'skip.png',
				'bigBlueTile.png', 'copyright.png', 'button1/button1_02.png',
				'button1/button1_13.png', 'button1/button1_10.png', 'button1/button1_01.png',
				'button1/button1_04.png', 'button1/button1_00.png', 'button1/button1_06.png',
				'button1/button1_07.png', 'button1/button1_08.png', 'button1/button1_12.png',
				'button1/button1_03.png', 'button1/button1_09.png', 'button1/button1_11.png',
				'button1/button1_05.png'
			];
			loadingTally = imageList.length;
			for(var n in imageList){
				$('<img src="images/' + imageList[n] + '">').load(function(){ loadingTally--;});
			}
			setTimeout(function(){
				startGame('finishCache');
			}, 300);
			break;
		case 'finishCache':
			if(loadingTally){
				setTimeout(function(){
					startGame('finishCache');
				}, 300);
			}else{
				startGame('fadeIn');
			}
			break;
		case 'fadeIn':
			$('#loadingPrompt').fadeTo('slow', 0);
			$('#contentWrapper').fadeTo('slow', 1, function(){
				clearInterval(loadingAnim);
				startGame('complete');
			});
			break;
		case 'complete':
			stepCounter.draw();
			bestCounter.draw();
			finishClearLevel();
			getLevel(currentLevel);
			break;
		default:
			alert('invalid startGame step: "' + step + '"');
	}
}

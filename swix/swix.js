'use strict';
var drawOffset, animationTally;
var offTally;
var gameState, currentLevel = 0;
var cells;
var stepstaken, beststeps;
var levelmap, testlevel;
var levelQueue;
var hint;
var cellSprite;
var disableHints = false;
var levelMap, stepsTaken;
var soundEffects, music, muted = false;

levelQueue = [];

function checkForWin(){
	var n;
	for(n = 0; n < cells.length && cells[n].active; n++);
	if(n >= cells.length){
		// all cells are active!
		gameState = 'won';
		setTimeout('finishLevel()', 600);
	}
}	

function finishLevel(){
	currentLevel++;
	if(currentLevel >= gameLevels.length || currentLevel == 0){
		currentLevel = 0;
		toMenu();
	}else{
		clearLevel(function(){getLevel(currentLevel)});
	}
}

function getLevel(levelNum){
	// FIXME  Is this variable needed?
	gameState = 'loading';
	levelMap = gameLevels[levelNum];
	if(levelMap['cells'] != undefined){
		drawLevel(function(){
			showTitle(levelMap['title']);
		});
	}
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
	animationTally = cells.length;
	for(n = 0; n < cells.length; n++){
		cells[n].sprite.element.animate({'top':'+=' + $(window).height() + 'px'}, Math.random() * 500 + 300, 'swing', function(){
			animationTally --;
			if(animationTally == 0){
				finishClearLevel(callback);
			}
		});
	}
}

function finishClearLevel(callback){
	animationTally = 0;
	stepsTaken = 0;
	$('#stepstaken').html('0');
	offTally = 0;
	drawOffset = {x:0, y:0};
	cells = [];
	$('#content').empty();
	if(callback != undefined) callback()
}


function drawLevel(callback){
	var x, y, n, numCells = 0, plateSet;
	if(callback == undefined) callback = function(){};
	drawOffset = {'x':levelMap['offset'][0], 'y':levelMap['offset'][1]};
	$('#titlebar').html(levelMap['title']);
	animationTally = 0;
	beststeps = levelMap['best'];
	$('#beststeps').html(beststeps);
	offTally = 0;
	for(var celltype in levelMap['cells']){
		plateSet = levelMap['cells'][celltype];

		// can't just say "plateSet.length" when using the custom
		// json_encode function, so we'll calculate it's length manually.
		var objlen = 0;
		for(var elem in plateSet) objlen++;

		for(n = 0; n < objlen; n += 3){
			animationTally++;
			cells[numCells] = new cellClass({
				'sprite' : cellSprite,
				'celltype' : celltype,
				'active' : plateSet[n + 2],
				'position' : { x : plateSet[n], y : plateSet[n + 1]}

			});
			offTally += (1 - plateSet[n + 2]);
			var realPos = cells[numCells].realPosition();
			cells[numCells].sprite.element.css({'top':'-100px', 'left' : realPos.x + 'px'});
			cells[numCells].sprite.element.animate({'top': + realPos.y + 'px'}, Math.random() * 500 + 300, 'swing', function(){
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
			cells[numCells].sprite.appendTo($('#content'));
			numCells++;
		}
	}

}


function toggleHints(){
	disableHints = !disableHints;
}

function showHint(promptText, callback, hideDisable){
	if(hideDisable == undefined) hideDisable = false;
	if(callback == undefined){
		callback = function(){};
	}
	
	var colourBackHolder = $('<div></div>');
	colourBackHolder.css({"width":"0px", "height":"0px", "top":"0px", "left":"0px", "position":"fixed"});
	var colourBack = $('<div></div>');
	colourBack.css({'position':'absolute', 'top':'0', 'left':'0', 'background-color':'#000'});
	colourBack.appendTo(colourBackHolder);	
	colourBack.css({'width':$(document).width() + 'px', 'height':$(document).height() + 'px'});
	colourBack.fadeTo(0, 0);

	var closeHint = function (callback){
		colourBack.fadeTo(400, 0);
		backing.fadeTo(400, 0, function(){
			backing.remove();
			callback();
		});
	}

	var backing = $('<div></div>');
	backing.addClass('screenOverlay');
	backing.fadeTo(0, 0);

	var wrapper = $('<div></div>');
	wrapper.addClass('promptWrapper');

	var hint = $('<div></div>');
	hint.addClass('promptBox');

	hint.append(promptText);
	var footbit = $('<div></div>');
	footbit.css({'clear':'both', 'padding-top':'2em', 'position':'relative'});
	if(!hideDisable){
		var checkbox = $('<div></div>');
		checkbox.addClass('disableHints');
		var checkText = '<input type="checkbox" id="disable" class="customcheck" onclick = "toggleHints();"';
		if(disableHints) checkText += ' SELECTED';
		checkText += '> Disable Tips</div>';
		checkbox.append(checkText);

		footbit.append(checkbox);
	}
	var okButton = $('<input type="button" value="Close" class="promptButton"></input>');
	okButton.appendTo(footbit);
	okButton.click(function(){closeHint(function(){
		colourBackHolder.remove();
		callback();
	});});
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
	playSound('mouseClick');
	if(gameState == 'playing'){
		clearLevel(function(){drawLevel()});
	}
}

function skipLevel(direction){
	if(direction == undefined) direction = 1;
	if(currentLevel + direction > gameLevels.length - 1 || currentLevel + direction < 0){
		return;
	}

	playSound('mouseClick');
	if(gameState == 'playing'){
		currentLevel += direction;
		clearLevel(function(){getLevel(currentLevel)});
	}
}

function playSound(soundName){
	if(!muted){
		soundEffects[soundName].cloneNode().play();
	}
}

function soundOn(){

	var playPromise = music[0].play();

	if (playPromise !== undefined) {
		playPromise.then(function() {
			muted = false;
			$('#soundCheckmark').html('On&nbsp;');
		}).catch(function(error) {
			muted = true;
			$('#soundCheckmark').html('Off');
			console.log(error);
		});
	}else{
		muted = false;
		$('#soundCheckmark').html('On&nbsp;');
	}



}

function soundOff(){
	music[0].pause();
	muted = true;
	$('#soundCheckmark').html('Off');
}

function toggleSound(){
	muted ? soundOn() : soundOff();
}

function showMenu(){
	$('#soundCheckmark').html(muted ? 'Off' : 'On&nbsp;');
	console.log(muted);
	$('#menuWrapper').css({
		display : 'inline-block',
		opacity : 0
	}).animate({opacity: 1}, function(){
		console.log('done');
	});

}

var startGame = function(){
	var loadingAnim, n;
	return function(step){
		if(step == undefined){
			step = 'init';
		}
		switch(step){
			case 'init':
				gameState = 'initializing';
				startGame('loadSounds');
				break;
			case 'loadSounds':
				// we'll load the sounds first to get the music started ASAP
				music = [
					new Audio('music/bensound-smallguitar.mp3'),
					new Audio('music/bensound-ukulele.mp3'),
					new Audio('music/bensound-smile.mp3')
				];
				for(n in music){
					music[n].volume = 0.5;
					music[n].addEventListener("ended", function(){
						music.push(music.shift());
						music[0].play();
					});
				}

				soundEffects = {
					crank : new Audio("sounds/crank.wav"),
					swish : new Audio("sounds/swish.wav"),
					mouseClick : new Audio("sounds/mouseClick.wav")
				};
				currentLevel = 0;

				soundOn();				

				startGame('loadSprite');
				break;
			case 'loadSprite':
				cellSprite = new spriteSet('tiles.sprite', function(){
					startGame('loadbg');
				});
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
					var c = 160 + Math.floor(Math.random() * 96);
					$('#loadingText').html(Math.random() < 0.5 ? '10@d1n6' : 'Loading');
					$('#loadingText').css({
						'font-family' : 'Loved by the King',
						'padding-top' : xoffset,
						'padding-left' : yoffset,
						'color' : 'rgb(' + c + ', ' + c + ', ' + c + ')',
						'font-size' : (Math.random() * 2 + 39) + 'px'
					});
				}, 20);
				startGame('loadHexgrid');
				break;
			case 'loadHexgrid':
				$('<img src="images/hexgrid.png">').load(function(){
					startGame('loadTiles');
				});
				break;
			case 'loadTiles':
				$('#loadingPrompt').fadeTo('slow', 0, function(){
					$(this).remove();
				});
				$('<img src="images/tiles.png">').load(function(){
					startGame('doMenu');
				});
				break;
			case 'doMenu':
				clearInterval(loadingAnim);
				showMenu();
				//startGame('fadeIn');
				break;
			case 'fadeIn':
				
				$('#menuWrapper').fadeTo('slow', 0, function(){
					$('#menuWrapper').css('display', 'none');
					$('#contentWrapper').fadeTo('slow', 1, function(){
						startGame('complete');
					});
				});
				break;
			case 'complete':
				beststeps = 0;
				finishClearLevel();
				getLevel(currentLevel);
				break;
			default:
				alert('invalid startGame step: "' + step + '"');
		}
	}
}();

function toMenu(){
	playSound('mouseClick');
	clearLevel(function(){
		$('#contentWrapper').fadeTo('slow', 0, function(){
			$('#contentWrapper').css('display', 'none');
			$('#menuWrapper').fadeTo('slow', 1, function(){
				//startGame('complete');
			});
		});
	});
	
}

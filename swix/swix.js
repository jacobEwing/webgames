'use strict';
var drawOffset, animationTally;
var offTally;
var gameState, currentLevel = 0;
var cells;
var stepstaken, beststeps;
var levelmap, testlevel;
var levelQueue;
var hint;
var cellSprite, menuSpriteSet, menuSprite;
var disableHints = false;
var levelMap, stepsTaken;
var soundEffects, music, muted = false, musicVolume = 0.5, effectsVolume = 1;

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
	// Load the specified level
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
	titleDiv.fadeIn('medium').delay(1000).fadeOut('medium');
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

		for(n = 0; n < plateSet.length; n += 3){
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
			cells[numCells].sprite.element.addClass('depressable');
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


function showHint(promptText, callback){
	// create a shaded overlay on the game, emphasizing the prompt
	var shading = document.createElement("div");
	shading.className = "backShading";

	// a wrapper to hold the window
	var backing = document.createElement("div");
	backing.className = "screenOverlay";

	// Use the "promptWrapper" element as a template to put the content into
	var wrapper = document.getElementsByClassName('promptWrapper')[0].cloneNode(true);

	wrapper.getElementsByClassName('promptContent')[0].innerHTML = promptText;


	// close on click
	wrapper.getElementsByClassName('closeButton')[0].onclick = function(){
		shading.parentNode.removeChild(shading);
		backing.parentNode.removeChild(backing);
		wrapper.parentNode.removeChild(wrapper);
		callback();

	};

	// (dis/en)able tips
	var toggleHintsButton = wrapper.getElementsByClassName('disableHints')[0];
	toggleHintsButton.onclick = function(){
		disableHints = !disableHints;
		toggleHintsButton.innerHTML = disableHints ? "Enable Tips" : "Disable Tips";

	};

	// make it invisible
	shading.style.opacity = 0;
	wrapper.style.opacity = 0;

	// add it to the document
	document.body.appendChild(shading);
	document.body.appendChild(backing);
	backing.appendChild(wrapper);

	// now fade them all in
	var opacity = 0;
	var fadeIn = function(){
		opacity += .05;
		if(opacity < 1){
			setTimeout(fadeIn, 30);
		}else{
			opacity = 1; // <-- make sure we're not over 1
		}
		shading.style.opacity = opacity / 2;
		wrapper.style.opacity = opacity;
	};
	fadeIn();

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

function showAbout(){
	playSound('swish');
	menuSprite.startSequence('flipOff');
	$('#menuTop').animate({opacity : 0}, function(){
		$(this).css('display', 'none');
		$('#aboutMenu').css('display', 'block').animate({opacity : 1});
	});

}

function showSettings(){
	playSound('swish');
	menuSprite.startSequence('flipOff');
	$('#menuTop').animate({opacity : 0}, function(){
		$(this).css('display', 'none');
		$('#settingsMenu').css('display', 'block').animate({opacity : 1});
		$('#musicVolumeSlider').val(musicVolume);
		$('#effectsVolumeSlider').val(effectsVolume);
	});

}


function aboutShowMainMenu(){
	playSound('swish');
	menuSprite.startSequence('flipOn');
	$('#aboutMenu').animate({opacity : 0}, function(){
		$(this).css('display', 'none');
		$('#menuTop').css('display', 'block').animate({opacity : 1});
	});
}

function settingsShowMainMenu(){
	playSound('swish');
	menuSprite.startSequence('flipOn');
	$('#settingsMenu').animate({opacity : 0}, function(){
		$(this).css('display', 'none');
		$('#menuTop').css('display', 'block').animate({opacity : 1});
	});
}

function exitGame(){
	history.go(-1);
}

var startGame = function(){
	var loadingAnim, n, widget;
	return function(step){
		if(step == undefined){
			step = 'init';
		}
		switch(step){
			case 'init':
				gameState = 'initializing';
				setTimeout(function(){ startGame('loadSounds'); }, 0);
				break;
			case 'loadSounds':
				// we'll load the sounds first to get the music started ASAP
				music = [
					new Audio('music/bensound-smallguitar.mp3'),
					new Audio('music/bensound-ukulele.mp3'),
					new Audio('music/bensound-smile.mp3')
				];
				for(n in music){
					music[n].volume = musicVolume;
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
				for(n in soundEffects){
					soundEffects[n].volume = effectsVolume;
				}
				currentLevel = 0;

				soundOn();

				setTimeout(startGame('loadBigCellSprite'), 0);
				break;
			case 'loadBigCellSprite':
				// pre cache the sprite image as it's too big to be ready when loading
				var img = document.createElement('IMG');
				img.onload = function(){
					menuSpriteSet = new spriteSet('bigCell.sprite', function(){
						menuSprite = new spriteClass(menuSpriteSet);
						menuSprite.currentFrame = 0;
						menuSprite.draw($('#menuBackdrop'));

						startGame('loadCellSprite');
					});
				};
				img.src = "images/bigCell.png";
				break;
			case 'loadCellSprite':
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
					startGame('buildSettingsWidgets');
				});
				break;
			case 'buildSettingsWidgets':
				var selectElement = document.getElementById('startingLevel');
				for(n = 0; n < gameLevels.length; n++){
					widget = document.createElement('option');
					widget.value = n;
					widget.text = (n + 1) + ' - ' + gameLevels[n].title;
					selectElement.appendChild(widget);
				}
				selectElement.onchange = function(){
					currentLevel = 1 * this.value;
				}
				setTimeout(function(){ startGame('doMenu'); }, 0);
				break;
			case 'doMenu':
				clearInterval(loadingAnim);
				showMenu();
				break;
			default:
				alert('invalid startGame step: "' + step + '"');
		}
	}
}();

function startPlaying(){
	$('#menuWrapper').fadeTo('slow', 0, function(){
		$('#menuWrapper').css('display', 'none');
		$('#contentWrapper').fadeTo('slow', 1, function(){
			beststeps = 0;
			finishClearLevel();
			getLevel(currentLevel);
		});
	});
}

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

function setMusicVolume(volume){
	musicVolume = volume;
	for(var n in music){
		music[n].volume = musicVolume;
	}
}

function setEffectsVolume(volume){
	effectsVolume = volume;
	for(var n in soundEffects){
		soundEffects[n].volume = effectsVolume;
	}
}

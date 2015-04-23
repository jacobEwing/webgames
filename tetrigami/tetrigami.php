<?php
$done = true;
switch($_GET['action']){
	case 'help':
		draw_help($_GET['step']);
		break;
	case 'about':
		draw_about($_GET['step']);
		break;
	default:
		$done = false;
}
if($done) exit();


function draw_about($step){
	switch($step){
		case 0: ?>
			<div style="position:absolute;width:900px; text-align:center">
				<img style="position:relative; margin:auto;" src="images/tetrisPieces.png"/>
			</div>
			<div id="helpWrapper">
				<h2>About Tetrigami</h2>
				<p>Given how well known the original "Tetris" game is, I'm sure there is no need to
				point out where the concept for this game comes from.</p>
				<p>The inspiration for this cover of it comes from one of my other hobbies, origami.  At
				one point I stumbled upon a technique that could be used to create arbitrary box-like
				shapes, and so my <a href="http://www.diagrami.com/gallery.php?index=tetris1">Origami &quot;Tetris&quot; Pieces</a>
				came to life.</p>
				<p>I wrote <a href="http://www.weirdly.net/software.php?category=games">my first cover</a> of this game
				when I was in high school (doesn't everybody?), but as all software does, it
				decayed as the platform it was written for became antiquated.</p>
				<p>Recently I've taken on the goal of restoring many of the games I wrote in my high
				school years, moving them away from the old &quot;MS-DOS&quot; platform that they were built for
				and onto the web.  You'll find several other restored games as well as newly created ones on
				our main game page, <a href="http://www.skilliwags.com/">www.skilliwags.com</a>.
			</div>
		<?php	break;
		case 1: ?>
			<div style="position:absolute;width:900px; text-align:center">
				<img style="position:relative; margin:auto;" src="images/us.png"/>
			</div>
			<div id="helpWrapper">
				<h2>About Us</h2>
				<p>The work you see here is that of a small husband &amp; wife development team.</p>
				<p>With myself, Jacob being strong on software development and having a good background
				in artwork, and my wife Celeste being strong in artwork and design with a good
				background in software, we find that developing games is a hobby that fits us both
				well.</p>
				<p>This game is somewhat the exception to the rule, where most of the artwork is my own,
				as origami is a hobby I've enjoyed since my teen years.</p>
				<br/><br/><br/>
			</div>
		<?php	break;
	}
}

function draw_help($step){
	switch($step){
		case 0: ?>
			<div id="helpWrapper">
				<h2>How to play</h2>
				<p>What?  I thought everyone knew how to play this!</p>
			</div>
		<?php	break;
		case 1: ?>
			<div id="helpWrapper">
				<h2>Really?</h2>
				<p>Ok, well, have you ever played a classic game called "Tetris"?  This game works the
				same way, but is presented with a whimsical set of images made with photographs of
				original origami by myself, Jacob Ewing.</p>  If you'd like to see more of my artwork in
				that medium, check out <a href="http://www.diagrami.com">diagrami.com</a>.</p>
				<p>The short of it is that these shapes fall from the top of the screen.  The available
				shapes are every possible arrangement of four connected squares.  As they fall, you can
				move them left, right or downwards, and also rotate them clockwise and
				counter-clockwise.</p>
				</p>The object of the game is to fit them together in such a way that they form full
				horizontal lines across the play area.  Each time you form such a line, it will
				disappear, allowing the blocks above it to fall downward.</p>
				<p>The game will end if the stack of blocks reaches the top of the screen.</p>
			</div>
		<?php	break;
	}
}

?>
<!DOCTYPE html>
<html>
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
	<link rel="stylesheet" type="text/css" href="tetrigami.css"/>
	<script type="text/javascript" src="jquery-1.8.3.min.js"></script>
	<script type="text/javascript" src="keyboard.js"></script>
	<script type="text/javascript" src="spriteSet.js"></script>
	<script type="text/javascript" src="tetrigami.js"></script>
	<script type="text/javascript">
		var gameState, samplingKey;
		$(window).bind("load", function() {
			$('#mainContent').css('visibility', 'visible');
			initialize(function(){
				showMenu('main');
				$('#loading').fadeTo(300, 0, function(){
					$('#loading').css('display', 'none');
					$('#menuWrapper').fadeTo(300, 1.0);
				});
				setGameState('menu');
			});
		});

		function setGameState(state){
			if({'death':0, 'menu':0, 'playing':0, 'defineKey':0, 'waitfordefinitionrelease':0}[state] != undefined){
				$('#menu').data('selected', null);
				gameState = state;
			}
		}

		function showMenu(name){
			$('#clipArea').empty();
			switch(name){
				case 'main':
					imageClips.drawFrame($('#clipArea'), 'gecko', 555, -95);
					imageClips.drawFrame($('#clipArea'), 'giraffe', 240, 100);
					drawMenu('Tetrigami', {
							'Play' : startGame,
							'Controls' : function(){showMenu('controls')},
							'How To' : function(){draw_help()},
							'About' : function(){draw_about()},
							'Exit' : leaveGame
						}
					);
					break;
				case 'settings':
					drawMenu('SETTINGS', {
						'Control Keys' : function(){showMenu('controlkeys')},
						'Main Menu' : function(){showMenu('main')}
					});
					break;
				case 'controls':
					imageClips.drawFrame($('#clipArea'), '3dplus', 60, -95);
					imageClips.drawFrame($('#clipArea'), 'raven', 640, -95);
					var params = {};
					params[('Move Left: ' + controls['MOVE_LEFT'])] = function(){changeControl("MOVE_LEFT")};
					params[('Move Right: ' + controls['MOVE_RIGHT'])] = function(){changeControl("MOVE_RIGHT")};
					params[('Rotate Counter-Clockwise: ' + controls['ROT_LEFT'])] = function(){changeControl("ROT_LEFT")};
					params[('Rotate Clockwise:' + controls['ROT_RIGHT'])] = function(){changeControl("ROT_RIGHT")};
					params[('Exit: ' + controls['EXIT_GAME'])] = function(){changeControl("EXIT_GAME")};
					params[('Pause: ' + controls['PAUSE_GAME'])] = function(){changeControl("PAUSE_GAME")};
					params['<div style="margin-top:1em">Main Menu</div>'] = function(){showMenu('main')}
					drawMenu('CONTROLS', params);
					break;
			}
		}

		function changeControl(code){
			var labels = {
				'ROT_LEFT' : 'rotate counter-clockwise',
				'ROT_RIGHT' : 'rotate clockwise',
				'MOVE_LEFT' : 'move left',
				'MOVE_RIGHT' : 'move right',
				'EXIT_GAME' : 'exit the game',
				'PAUSE_GAME' : 'pause the game'
			}
			samplingKey = code;
			$('#menu').html('Press the key you wish to use to ' + labels[code]);
			setGameState('defineKey');
		}

		function setKeyDefinition(keycode){
			controls[samplingKey] = REV_KEYMAP[keycode];
			setGameState('waitfordefinitionrelease');
			showMenu('controls');
		}

		function drawMenu(label, options, params){
			var menuStyle = 'menuOption';
			var target = $('#menu');
			var noTitle = noErase = false;
			if(params != undefined){
				if(params.style != undefined){
					menuStyle = params.style;
				}
				if(params.target != undefined){
					target = params.target;
				}
				if(params.noTitle != undefined){
					notTitle = true;
				}
				if(params.noErase != undefined){
					noErase = true;
				}
			}
			if(!noTitle) $('#mainTitle').html(label);
			if(!noErase) target.empty();

			var idx = 0;
			for(label in options){
				var option = $('<div id="menu_' + idx + '"></div>');
				idx++;
				option.addClass(menuStyle);
				option.html(label);
				option.click(options[label]);
				option.appendTo(target);
			}
			$('#menu').data('selected', null);
		}

		function handleMenuKey(key){
			switch(key){
				case KEYMAP.DOWN: changeMenuSelect(1); break;
				case KEYMAP.UP: changeMenuSelect(-1); break;
				case KEYMAP.ENTER: case KEYMAP.SPACE: selectMenuOption();
			}
		}

		function changeMenuSelect(delta){
			selectedOption = $('#menu').data('selected');
			if(selectedOption == null){
				selectedOption = 0;
			}else{
				$('#menu_' + selectedOption).removeClass('menuSelected');
				selectedOption += delta;
				var menuList = $('.menuOption');
				selectedOption %= menuList.length;
				if(selectedOption < 0) selectedOption += menuList.length
			}

			$('#menu_' + selectedOption).addClass('menuSelected');
			$('#menu').data('selected', selectedOption);


		}

		function selectMenuOption(){
			selectedOption = $('#menu').data('selected');
			if(selectedOption != null){
				$('#menu_' + selectedOption).click();
			}
		}

		function handleKey(key, state){
			switch(gameState){
				case 'paused':
					if(state && REV_KEYMAP[key] == controls.PAUSE_GAME){
						gameState = 'playing';
						dropTimeout = setTimeout(moveDown, dropTime);
					}
					break;
				case 'playing':
					keyState[key] = state;
					if(state){
						handleGameKey(key);
					}
					break;
				case 'menu':
					if(state) handleMenuKey(key);
					break;
				case 'defineKey':
					if(state)
						setKeyDefinition(key);
					break;
				case 'waitfordefinitionrelease':
					if(!state){
						setGameState('menu');
					}
					break;
			}
		}

		function draw_help(currentStep){
			if(currentStep == undefined) currentStep = 0;
			var helpContent = $('<div></div>');
			helpContent.addClass('textContent');
			var buttonDiv = $('<div></div>');
			var menuOptions = {
				'Close' : function(){showMenu('main')},
			};
			if(currentStep > 0){
				menuOptions.Previous = function(){draw_help(currentStep - 1)}
			}
			if(currentStep < 1){
				menuOptions.Next = function(){draw_help(currentStep + 1)}
			}
			drawMenu('HELP', menuOptions,
				{
					'style' : 'menuButton',
					'target' : buttonDiv
				}
			)
			$('#menu').empty();
			$('#clipArea').empty();
			helpContent.load('tetrigami.php?action=help&step=' + currentStep, function(){
				if(currentStep == 0){
					imageClips.drawFrame($('#clipArea'), 'raptor', 80, 80);
					imageClips.drawFrame($('#clipArea'), 'horse_2', 500, 60);
				}else if(currentStep == 1){
					var demoSprite = new spriteClass(shapeSprite);
					demoSprite.drawFrame($('#clipArea'), 's_0', 80, 40);
					demoSprite.drawFrame($('#clipArea'), 'z_0', 80, 136);
					demoSprite.drawFrame($('#clipArea'), 'square_0', 80, 232);
					demoSprite.drawFrame($('#clipArea'), 'l_0', 80, 326);

					demoSprite.drawFrame($('#clipArea'), 't_1', 730, 40);
					demoSprite.drawFrame($('#clipArea'), 'j_0', 730, 168);
					demoSprite.drawFrame($('#clipArea'), 'long_1', 730, 296);
				}
				buttonDiv.appendTo(helpContent);
				helpContent.appendTo($('#menu'));
			});
		}

		function draw_about(currentStep){
			$('#clipArea').empty();
			if(currentStep == undefined) currentStep = 0;
			var aboutContent = $('<div></div>');
			aboutContent.addClass('textContent');
			var buttonDiv = $('<div></div>');
			var menuOptions = {
				'Close' : function(){showMenu('main')},
			};
			if(currentStep > 0){
				menuOptions.Previous = function(){draw_about(currentStep - 1)}
			}
			if(currentStep < 1){
				menuOptions.Next = function(){draw_about(currentStep + 1)}
			}
			drawMenu('ABOUT', menuOptions,
				{
					'style' : 'menuButton',
					'target' : buttonDiv
				}
			)
			$('#menu').empty();
			aboutContent.load('tetrigami.php?action=about&step=' + currentStep, function(){
				buttonDiv.appendTo(aboutContent);
				aboutContent.appendTo($('#menu'));
			});
		}

		function leaveGame(){
			if(typeof exitFunc == "undefined"){
				history.go(-1);
			}else{
				exitFunc();
			}
		}
	</script>
</head>
<body>
	<div id="gameWrapper">
		<div id="mainContent">
			<h1 id="mainTitle">Tetrigami</h1>
			<div id="gameContent" style="display:none">
				<div id="canvaswrapper">
					<div id="canvasHideBorder">
						<div id="canvas"></div>
					</div>
					<div id="canvasOverlay"></div>
				</div>
				<div id="previewArea"></div>
				<div id="infoArea">
					<div id="infoInset">
						<strong>lines:</strong><br/>
						<span class="stat" id="cleared">0</span><br/>
						<strong>score:</strong><br/>
						<span class="stat" id="score">0</span><br/>
						<strong>level:</strong><br/>
						<span class="stat" id="level">0</span><br/>
					</div>
				</div>
				<div id="eyecandy">
				</div>
			</div>
			<div id="menuWrapper" style="display:none">
				<div id="clipArea" style="position:relative; width:0; height:0;"></div>
				<div id="menu"></div>
			</div>
		</div>
		<div id="loading">
			<h2>Loading</h2>
			<span id="loadingMessage">Initializing</span>
		</div>
	</div>
	<div id="debug"></div>
</body>
</html>

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
			<h2>About Hexodus</h2>
			<div style="display:inline-block; float:left; margin: 0 1em 1em 0; font-size: 16px">
				<img src="images/hexodus_original.png"/><br/>
				Original Game
			</div>
			<p>This is a game that I originally conceived and wrote in the '90s while attending high school.  I had the
			joy of putting it on the school's LAN, and sharing it with the student body.  Hexodus has a bit of
			a sentimental value to me, as it's the first original game that I ever created (having previously made only
			new renditions of existing games).</p>
			<p>Unfortunately, age wears all things, including software.  The original game was written in C, on an
			MS-DOS platform, using my own custom graphics library with low-res 8-bit graphics.  I'm very happy
			to revive it now, and share it with a much broader audience.</p>
		<?php	break;
		case 1: ?>
			<h2>About Us</h2>
			<p>The work you see here is that of a small husband &amp; wife development team.</p>
			<img src="images/jacob.png" style="float:right; margin-left:1em" alt="Jacob and his coffee"/>
			<img src="images/celeste.png" style="float:left; margin-right:1em" alt="Celeste and her tea"/>
			<p>With myself, Jacob being strong on software development and having a good background in artwork,
			and my wife Celeste being strong in artwork and design with a good background in software, we
			find that developing games is a hobby that fits us both well.</p>

			<p>If you haven't already, do check out our other work at <a class="helpContent" href="http://skilliwags.com">skilliwags.com</a>,
			where we're continuously adding to our collection of games.
			</p>
		<?php	break;
	}
}


function draw_help($step){
	switch($step){
		case 0: ?>
			<h2>How to play</h2>
			<p>The object of the game is to build a tower of hexagonal cells that goes above a required height.  This tower is built
			by stacking randomly provided shapes in such a way that any falling cell lands only on the bottom of the screen, or on
			another cell of the same colour.</p>

			<img src="images/goodplay_1.png" style="float:right; margin: .5em"/>
			<p>As you build the tower, it will sink into the bottom of the screen.  If it falls below the visible play area, the game will end.</p>
			<p>You can rotate each shape, and move it in any direction.  In order to land a shape, one of its cells must be either
			touching the bottom of the play area, or resting on another cell of the same colour.  The cell that it rests upon can be
			immediately below it, or below it to the left or right</p>
		<?php	break;
		case 1: ?>
			<h2>Landing</h2>
			<div style="float:left; margin: 0 .5em">
				<img src="images/badplay_1.png"/>
				<br/><br/>
				<img src="images/goodplay_2.png"/>
			</div>
			<p>The cell that lands must be the same colour as any cells that it lands on.  That includes the one immediately
			below it, the one below and to the left, and the one below and to the right.</p>
			<img src="images/badplay_2.png" style="float:right; margin: .5em"/>
			<p>If there is a cell in any of those 
			positions that does not match the landing one, then the entire landing piece will disappear, as well as any
			unmatching cells that it lands on.</p>
			<p>The cells above the landing piece are irrelevant, even if they do not match.  You can safely land a piece that does
			not match the colours immediately above it, as long as the colours below do match.
			</p>
		<?php	break;
		case 2: ?>
			<h2>Increasing Difficulty</h2>
			<p>As the game continues, it will become increasingly difficult.  The structure will fall at a faster
			and faster pace as you build it, and the target height will become higher with each level.</p>
		<?php	break;
	}
}

?>
<!DOCTYPE html>
<html>
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
	<link rel="stylesheet" type="text/css" href="hexodus.css"/>
	<link href='http://fonts.googleapis.com/css?family=Special+Elite' rel='stylesheet' type='text/css'>
	<script src="http://ajax.googleapis.com/ajax/libs/jquery/1.5/jquery.min.js"></script>
	<script type="text/javascript" src="spriteSet.js"></script>
	<script type="text/javascript" src="hexodus.js"></script>
	<script type="text/javascript">
		var gameState, samplingKey;
		$(document).ready(function(){
			setGameState('menu');
			initialize(function(){
				showMenu('main');
				$('#loading').fadeTo(300, 0, function(){
					$('#loading').css('display', 'none');
					$('#menu').fadeTo(300, 1.0);
				});
			});
		});

		function setGameState(state){
			if({'death':0, 'menu':0, 'playing':0, 'defineKey':0, 'waitfordefinitionrelease':0}[state] != undefined){
				$('#menu').data('selected', null);
				gameState = state;
			}
		}

		function showMenu(name){
			switch(name){
				case 'main':
					drawMenu('HEXODUS', {
						'Play' : startGame,
						'Controls' : function(){showMenu('controls')},
						'How To' : function(){draw_help()},
						'About' : function(){draw_about()},
						'Exit' : function(){exitFunc();}
					});
					break;
				case 'settings':
					drawMenu('SETTINGS', {
						'Control Keys' : function(){showMenu('controlkeys')},
						'Main Menu' : function(){showMenu('main')}
					});
					break;
				case 'controls':
					var params = {};
					params[('Move Left: ' + controls['MOVE_LEFT'])] = function(){changeControl("MOVE_LEFT")};
					params[('Move Right: ' + controls['MOVE_RIGHT'])] = function(){changeControl("MOVE_RIGHT")};
					params[('Move Up: ' + controls['MOVE_UP'])] = function(){changeControl("MOVE_UP")};
					params[('Move Down: ' + controls['MOVE_DOWN'])] = function(){changeControl("MOVE_DOWN")};
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
				'MOVE_UP' : 'move up',
				'MOVE_DOWN' : 'move down',
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
			var noTitle = false;
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
			}
			if(!noTitle) $('#mainTitle').html(label);

			target.empty();
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
				case 'playing':
					keyState[key] = state;
					if(state){
						keyBuffer[keyBuffer.length] = key;
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
			var buttonDiv = $('<div></div>');
			var menuOptions = {
				'Close' : function(){showMenu('main')},
			};
			if(currentStep > 0){
				menuOptions.Previous = function(){draw_help(currentStep - 1)}
			}
			if(currentStep < 2){
				menuOptions.Next = function(){draw_help(currentStep + 1)}
			}
			drawMenu('HELP', menuOptions,
				{
					'style' : 'menuButton',
					'target' : buttonDiv
				}
			)
			$('#menu').empty();
			helpContent.load('hexodus.php?action=help&step=' + currentStep, function(){
				buttonDiv.appendTo(helpContent);
				helpContent.appendTo($('#menu'));
			});
		}

		function draw_about(currentStep){
			if(currentStep == undefined) currentStep = 0;
			var aboutContent = $('<div></div>');
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
			aboutContent.load('hexodus.php?action=about&step=' + currentStep, function(){
				buttonDiv.appendTo(aboutContent);
				aboutContent.appendTo($('#menu'));
			});
		}

	</script>
</head>
<body>
	<div id="gameWrapper">
		<h1 id="mainTitle">HEXODUS</h1>
		<div id="gameContent" style="display:none">
			<div id="previewWrapper">
				<div id="preview"></div>
				<div id="previewOverlay"></div>
			</div>
			<div id="canvaswrapper">
				<div id="laser"></div>
				<div id="canvas"></div>
				<div id="laserguns"></div>
				<div id="canvasOverlay"></div>
			</div>
		</div>
		<div id="menu" style="display:none"></div>
		<div id="loading">
			Loading<br/>
			<div id="loadingBar"></div>
		</div>
	</div>
</body>
</html>

<?php
ini_set('display_errors',1);
error_reporting(E_ALL | E_STRICT);
require_once("globalInc.php");


define('_GAME_WIDTH', 800);
define('_GAME_HEIGHT', 610);

if(array_key_exists('action', $_POST)){
	switch($_POST['action']){
		case 'loadCardCanvas':
			drawCardCanvas();
			break;
		case 'cribbageSettings':
			draw_cribbage_settings_form();
			break;
		default:
			echo 'ERR ID #10:T';
			_log('bad $_GET["action"] value: ' . $_POST['action']);
			break;
	}
	exit();
}else if(array_key_exists('action', $_GET)){

	switch($_GET['action']){
		case 'newGame':
			$game = new gameClass('cribbage');
			if($game->setType($_GET['gameType'])){
				$codes = explode(',', $game->getCodes());
				$keyCode = $codes[0];
				$hostCode = $codes[1];
				echo "[$keyCode][$hostCode]";
			}else{
				echo "bad game type: " . $_GET['gameType'];
				_log("bad game type: " . $_GET['gameType']);
			}
			break;
		case 'joinGame':
			$gameCode = $_GET['gameCode'];
			$gameType = $_GET['gameType'];
			try{
				$game = new gameClass($gameType, $gameCode);
			}catch(Exception $e){
				 echo("ERROR: " . $e->getMessage());
			}

			if(isset($game)){
				echo $game->getCodes();
			}

			break;
		default:
			echo 'ERR ID #10:T';
			_log('bad $_GET["action"] value: ' . $_GET['action']);
			break;
			
	}
	exit();
}else{
	draw_LandingPage();
}

function draw_LandingPage(){
?>
<html>
<head>
	<!--	Credits:

		Development: Jacob Ewing: http://www.weirdly.net/
		Vector graphic library: Rapha&euml;l: http://raphaeljs.com/
		Javascript library: JQuery: http://jquery.com/
		Card images found in Wikimedia commons: http://commons.wikimedia.org/wiki/Poker_%28cards_deck%29

	-->
	<link rel="stylesheet" href="global.css" type="text/css" />
	<!--link  href="jquery.alerts.css" rel="stylesheet" type="text/css" media="screen" /-->
	<link type="text/css" href="css/south-street/jquery-ui-1.8.2.custom.css" rel="stylesheet" /> 
	<style type="text/css">
		body{
			background-image: url(images/background.jpg);
		}
		#topArea{
			margin:auto;
			height: 40px;

		}
		#pageWrapper{
			text-align:center;
		}
		#gameCanvas{
			width:100%;
			height:100%;
			background-color: #508c2c;
			background-image: url(images/felt.jpg);
			overflow: hidden;
			position:absolute;
		}
		#gameWrapper{
			margin:auto;
			width: <?=_GAME_WIDTH?>px;
			height: <?=_GAME_HEIGHT?>px;
			position: relative;
		}
		#inputLayer{
			width:100%;
			height:100%;
			width: <?=_GAME_WIDTH?>px;
			height: <?=_GAME_HEIGHT?>px;
			position: relative;
		}

		#swapDiv{
			display: none;
		}
		.card{
			width: 310px;
			height: 310px;
			position: absolute;
		}
		.stackDiv{
			position:absolute;
		}

	</style>

	<script type = "text/javascript">
		var GAME_WIDTH = <?=_GAME_WIDTH?>;
		var GAME_HEIGHT = <?=_GAME_HEIGHT?>;
	</script>

	<script type="text/javascript" src="raphael-min.js"></script>
	<script type="text/javascript" src="js/jquery-1.4.2.min.js"></script>
	<script type="text/javascript" src="js/jquery-ui-1.8.2.custom.min.js"></script>
	<script type="text/javascript" src="helperFuncs.js"></script>
	<script type="text/javascript" src="baseClasses.js"></script>
	<script type="text/javascript" src="playerClass.js"></script>
	<script type="text/javascript" src="cribbage.js"></script>

	<script type="text/javascript">

	var numPlayers;
	var player;
	var game, gameName;
	var settingsBox;

	$(document).ready(function(){
		player = [];
		getCribbageConfig(); // later call this from a main menu event
	});

	function handleMouseMove(e){
		var x = e.pageX;
		var y = e.pageY;
		var offset = $('#inputLayer').offset();
		x -= offset.left;
		y -= offset.top;
		inputLayer.handleMotion(x, y);
	}
	function handleMouseUp(e){inputLayer.handleRelease(e);}
	function handleMouseDown(e){inputLayer.handlePress();}
	function initializeEvents(){
		inputLayer = new inputHandler($('#inputLayer'));
		$('#gameWrapper').mousemove(function(e){ handleMouseMove(e); return false; });
		$('#gameWrapper').mouseup(function(e){handleMouseUp(e);return false;});
		$('#gameWrapper').mousedown(function(e){handleMouseDown(e);return false;});
		$('#inputLayer').mousemove(function(e){handleMouseMove(e);return false;});
		$('#inputLayer').mousedown(function(e){handleMouseDown(e);return false;});
		$('#inputLayer').mouseup(function(e){handleMouseUp(e);return false;});
	}

	function waitForPlayers(){
		var n;
		for(n = 0; n < numPlayers; n++){
			if(!player[n].ready()) break;
		}
		if(n < numPlayers){
			setTimeout("waitForPlayers();", 1000);
		}else{
			$("#settingsBox").dialog("close");
			startGame();
		}
	}

	function startGame(){
		initializeEvents();
		switch(gameName){
			case 'cribbage':
				game = new cribbageGame();
				game.start();
				break;
			default:
				break;
		}
	}

	function initGame(gName){
		gameName = gName;
		$.get('index.php', {action: 'newGame', gameType:gameName}, function(gameCode){

			$('#pageWrapper').load('index.php', {'action':'loadCardCanvas'}, function(){
				var mustWait = false;
				for(n = 0; n < numPlayers; n++){
					player[n] = new playerClass(playerType[n]);
					if(player[n].type == 'human'){
						player[n].name = $('#p' + (n + 1) + 'nameField').val();
						if(player[n].name == '') player[n].name = 'Sourpuss';
					}else{
						player[n].getName();
						if(player[n].type == "remote") mustWait = true;
					}
				}

				if(mustWait){
					var infoWrapper = $('<div style="font-size:11px;text-align:center; margin-top: 4em">The code for this game is:<br/></div>');
					var info = $('<div style="font-size:24px; font-weight:bold;">' + gameCode + '</div>');
					infoWrapper.append(info);
					// FIXME!!!  this should provide a URL to share
					infoWrapper.append("<p>Share this code with the person you want to play with.</p>");
					$('#settingsBox').html('');
					$('#settingsBox').append(infoWrapper);
					$('#settingsBox').dialog({
						title: 'Waiting for players to join',
						width: 480,
						height: 300,
						resizeable: false,
						buttons: {
							"Cancel": function() { 
								$(this).dialog("close");
								getCribbageConfig();
							}
						}
					});
					waitForPlayers();
				}else{
					startGame();
				}
			});
			
		});
	}

	function joinGame(gameName, gameCode){
		$.get('index.php', {action: 'joinGame', 'gameType':gameName, 'gameCode':gameCode}, function(results){
			//popup(results);
			dat = results.split(':');
			if(dat[0] == 'ERROR'){
				popup(results);
			}else{
				dat = results.split(',');
				popup('yay! ' + results);
			}
		});
//		settingsBox.dialog('close');
//		return false;

/*
			$(this).dialog("close");
		}else{
			popup("Could not join the game with that code, please try again.");
		}
*/
	}

	function getCribbageConfig(){
		settingsBox = $('<div id="settingsBox"></div>');
		settingsBox.load('index.php', {'action':'cribbageSettings'}, function(){
			settingsBox.dialog({
				title : 'Game Settings',
				width : 480,
				height : 400,
				resizable: false,
				buttons: {
					"Cancel": function() { 
						$(this).dialog("close"); 
					},
					"Ok": function() {
						selectedTab = $('#tabWrapper').tabs('option', 'selected');
						switch(selectedTab){
							case 0:
								$(this).dialog("close");
								initGame("cribbage");
								break;
							case 1:
								joinGame('cribbage', $('#joinCode').val());
								break;
						}
					}
				}
			});
			var tabs = $('#tabWrapper').tabs();
		});
	}

	</script>
</head>
<body>
	<div id="pageWrapper">
<?php /*
		<span onclick="getCribbageConfig()"><img src="images/main/cribbage.png"/></span>
*/?>
	</div>
</body>
</html>
<?php
}

function draw_cribbage_settings_form(){
?>
	<script type="text/javascript">
		var playerType = [];
		playerType[0] = 'human';
		playerType[1] = 'ai';
		numPlayers = 2;
		function setPlayer(index, type){
			playerType[index] = type;
			$('#p' + (1.0 * index + 1) + 'Name').css('visibility', 'visible');
			if(type == 'human'){
				for(var n in playerType){
					if(n != index && playerType[n] == 'human'){
						playerType[n] = 'ai';
						$('#p' + (1.0 * n + 1) + 'tai').attr("checked", "checked");
						$('#p' + (1.0 * n + 1) + 'Name').css('visibility', 'hidden');
					}
				}
			}else{
				$('#p' + (1.0 * index + 1) + 'Name').css('visibility', 'hidden');
			}
		}
	</script>
	<div style="font-size: 11px" id="tabWrapper">
		<ul>
			<li><a href="#new"><span>Start a game</span></a></li>
			<li><a href="#join"><span>Join a game</span></a></li>
		</ul>
		<div id="new">
			<table style="font-size:90%; width:100%"><tr><td>
			<div style="margin:1em; padding:1em; border:solid; border-width:1px; background-color:#FEC;">
				<strong>Player 1:</strong><br/>
				Type: <br/>
				<div style="margin-left:1em">
					<input id='p1thuman' name='p1t' type="radio" onclick="setPlayer(0, 'human');" checked></input>Local<br/>
					<input id='p1tai' name='p1t' type="radio" onclick="setPlayer(0, 'ai');"></input>AI<br/>
				</div>
				<div id="p1Name">
					Name: <input type="text" id='p1nameField' name="player1name" value="Nameless"></input>
				</div>
			</div>
			</td><td>
			<div style="margin:1em; padding:1em; border:solid; border-width:1px; background-color:#FEC;">
				<strong>Player 2:</strong><br/>
				Type: <br/>
				<div style="margin-left:1em">
					<input id='p2thuman' name='p2t' type="radio" onclick="setPlayer(1, 'human');"></input>Local<br/>
					<input id='p2tai' name='p2t' type="radio" onclick="setPlayer(1, 'ai');" checked></input>AI<br/>
				</div>
				<div id="p2Name" style="visibility:hidden">
					Name: <input type="text" id='p2nameField' name="player2name" value="Nameless"></input>
				</div>

			</div>
			</td></tr></table>
		</div>
		<div id="join">
			<div style="text-align:center">
				Not yet implemented
			</div>
		</div>
	</div>
<?php
}

function drawCardCanvas(){
	echo '<div id="topArea"></div>';
	echo '<div id="gameWrapper">';
	echo '<div id="gameCanvas">';
	echo '<div id="console"></div>';
	echo '</div>';
	echo '<div id="inputLayer" draggable="false"></div>';
	echo '</div>';
	echo '<div id="swapDiv"></div>';
}

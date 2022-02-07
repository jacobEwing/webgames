<?php
/* TODO:
	BUG: when the shield powerup falls after the last alien dies, and you catch it on the next level,
	it successfully gives you the powerup, but the sprite for that powerup is never enabled

	FIX: when a shot destroys an alien, it should stick its id in an array.  When a pill is dropped, it
	should also store its releasing alien's id.  If they two match, then the shot does not destroy the
	pill.

	- add a prompt to continue the game or quit after dying
	- add more levels
	- add a congratulatory game over screen
	- add a screen warning against IE
*/

define('_MAX_NAME_LENGTH', 15);

function buildLevels(){
	return array(
		array(
			'alien' => 'sprites/tentacles.sprite',
			'bombid' => 'tentacle',
			'background' => 'images/tentacles_tile.jpg'
		),
		array(
			'alien' => 'sprites/triangulalien.sprite',
			'bombid' => 'triangulalien',
			'background' => 'images/triangulalien_tile.jpg'
		),
		array(
			'alien' => 'sprites/FireTorus.sprite',
			'bombid' => 3,
			'background' => 'images/pixellated_brown.jpg'
		),
		array(
			'alien' => 'sprites/alien1.sprite',
			'bombid' => 'greySpike',
			'background' => 'images/pixellated_grey.jpg'
		),
		array(
			'alien' => 'sprites/alien2.sprite',
			'bombid' => 2,
			'background' => 'images/tinytile2.png'
		),
		array(
			'alien' => 'sprites/alien3.sprite',
			'bombid' => 3,
			'background' => 'images/tinytile3.png'
		),
		array(
			'alien' => 'sprites/alien4.sprite',
			'bombid' => 4,
			'background' => 'images/tinytile4.png'
		),
		array(
			'alien' => 'sprites/alien5.sprite',
			'bombid' => 5,
			'background' => 'images/tinytile5.png'
		),
		array(
			'alien' => 'sprites/alien7.sprite',
			'bombid' => 7,
			'background' => 'images/browntile.jpg'
		),
		array(
			'alien' => 'sprites/alien6.sprite',
			'bombid' => 6,
			'background' => 'images/greytile.jpg'
		),
		array(
			'alien' => 'sprites/brownBlob.sprite',
			'bombid' => 'redBlob',
			'background' => 'images/brownblob_tile.jpg'
		),
		array(
			'alien' => 'sprites/ringAround.sprite',
			'bombid' => 'rings',
			'background' => 'images/alienMatrix.jpg'
		),
		array(
			'alien' => 'sprites/slideyBoxes.sprite',
			'bombid' => 'cube',
			'background' => 'images/checkerTile.jpg'
		),
		array(
			'alien' => 'sprites/pistonCube.sprite',
			'bombid' => 4,
			'background' => 'images/pixellated_grey.jpg'
		),
		array(
			'alien' => 'sprites/spikey.sprite',
			'bombid' => 'brownBlob',
			'background' => 'images/soilTile.jpg'
		),
	);
}
function addHighScore($name, $score){
	$name = substr($name, 0, _MAX_NAME_LENGTH);
	$name = str_replace(array('<', '&', '>', ':'), array('&lt', '&amp', '&gt', '&#58'), $name);
	$fin = fopen("data/highscores.dat", "r");
	$setNewScore = false;
	while(($line = fgets($fin))){
		$parts = explode(':', $line);
		if(intval($parts[2]) < $score && $setNewScore == false){
			$setNewScore = true;
			$record[] = array(
				'ip' => $_SERVER["REMOTE_ADDR"],
				'name' => $name,
				'score' => $score
			);
		}
		$record[] = array('ip' => $parts[0], 'name' => $parts[1], 'score' => trim($parts[2]));
	}
	fclose($fin);

	$tally = 0;
	$fout = fopen("data/highscores.dat", "w");
//	print_r($record);
	foreach($record as $dat){
		fprintf($fout, "%s:%s:%s\n", $dat['ip'], $dat['name'], $dat['score']);
		$tally++;
		if($tally >= 10) break;
	}
	fclose($fout);

}

function isHighScore($newScore){
	$returnval = false;
	$fin = fopen("data/highscores.dat", "r");
	while(($line = fgets($fin))){
		$parts = explode(':', $line);
		$score = intval($parts[2]);
		if($score < $newScore){
			$returnval = true;
			break;
		}
	}
	return $returnval;
	
}

function drawMenu(){
?>
	<img src="images/title.png" />
	<div style="position:absolute; top:0px; left:0px; width:100%; text-align:center">
	
	<div id="mainMenu" style="position:relative;top:375px">
		<a onclick="startGame()" class="menuItem">BEGIN THE ONSLAUGHT</a><br/>
		<a onclick="showHighScores()" class="menuItem">TOP DEFENDERS</a><br/>
		<a onclick="showHelp()" class="menuItem">YOUR MISSION</a><br/>
		<a onclick="showAbout()" class="menuItem">IN THE BEGINNING</a><br/>
		<a onclick="leaveGame()" class="menuItem">RETURN TO REALITY</a>
	</div>
	</div>
<?php
}

function drawHelpStep_start(){
?>
	<div class="helpHeader">-== Your Mission  ==-</div>
	<div class="helpContent">
		<p>The mutant space invaders are on the rise, and we are called to arms to stop them!</p>
		
		<h2 class="helpSubtitle">The Enemy</h2>
		<img src="images/alien3_frame.png" style="float:right; margin:.5em"/>
		<p>From freakish monsters to odd structural entities, they come in all shapes and sizes, arriving with
		<img src="images/tentacle_frame.png" style="float:left; margin:.5em"/>
		the sole intention of conquering our world!  As part of our last line of defense, it is your job to shoot them
		down and prevent them from passing.
		</p>
<div style="clear:both"></div>
		<h2 class="helpSubtitle">Your Vessel</h2>
		<img src="images/ship_frame.png" style="float:right; margin:.5em"/>
		<p>You'll be flying the latest ship from SpaceTech War Industries<sup>tm</sup>.  It comes
		fully equipped with a basic fireball launcher, highly responsive control system (colloquially referred
		to as a "mouse"), and the standard A7X onboard robot.</p>
	</div>
	<div class="helpButtonLayer">
		<span id="nextButton" class="helpButton">next</span>
		<span id="closeButton" class="helpButton">done</span>
	</div>
	<script type="text/javascript">
		$('#closeButton').click(function(){
			$('#helpWrapper').fadeTo(500, 0, function(){
				$('#helpWrapper').remove();
			});
		});
		$('#nextButton').click(function(){
			infoContentWrapperer.fadeTo(200, 0, function(){
				infoContentWrapperer.load("invaders.php?action=loadHelp&step=upgrades", function(){
					infoContentWrapperer.fadeTo(200, 1);
				});
			});

		});
	</script>
<?
}

function drawHelpStep_upgrades(){
?>
	<div class="helpHeader">-== Upgrades  ==-</div>
	<div class="helpContent">
		<img src="images/powerup_frame.png" style="float:left; margin: 0 1.5em 0 0"/>
		<p>One of the few advantages we have is the ablility to pilfer and make use of their
		more advanced technology.  When you destroy an enemy, a salvageable piece of equipment
		may fall out.  If you can intercept it, the A7X robot on your ship will catch and
		incorporate it into your system.  The following is a complete list of the technologies
		we've been able to connect with:</p>

		<h2 class="helpSubtitle">Double Guns</h2>
		<img src="images/bonus_double.png" style="float:right; margin: .5em"/>
		<p>The double guns allow your ship to fire two shots simultaneously, while drawing
		only slightly more power.  Although not the most powerful upgrade available, there
		are many pilots who swear by it.</p>

		<h2 class="helpSubtitle">Spread Shot</h2>
		<img src="images/bonus_triple.png" style="float:right; margin: .5em"/>
		<p>The spread shot triples the damage you can do in a single round, firing a full barrage
		of ammo outward ahead of you.  Although it draws more power than the standard weapons, the
		resulting damage is well worth the wear.</p>
	</div>
	<div class="helpButtonLayer">
		<span id="backButton" class="helpButton">back</span>
		<span id="nextButton" class="helpButton">next</span>
		<span id="closeButton" class="helpButton">done</span>
	</div>
	<script type="text/javascript">
		$('#closeButton').click(function(){
			$('#helpWrapper').fadeTo(500, 0, function(){
				$('#helpWrapper').remove();
			});
		});
		$('#nextButton').click(function(){
			infoContentWrapperer.fadeTo(200, 0, function(){
				infoContentWrapperer.load("invaders.php?action=loadHelp&step=upgrades2", function(){
					infoContentWrapperer.fadeTo(200, 1);
				});
			});

		});
		$('#backButton').click(function(){
			infoContentWrapperer.fadeTo(200, 0, function(){
				infoContentWrapperer.load("invaders.php?action=loadHelp&step=start", function(){
					infoContentWrapperer.fadeTo(200, 1);
				});
			});

		});
	</script>
<?php
}

function drawHelpStep_upgrades2(){
?>
	<div class="helpContent">

		<h2 class="helpSubtitle">SpeedShot</h2>
		<img src="images/bonus_fast.png" style="float:right; margin: .5em"/>
		<p>The speedshot allows your guns to autofire at a far greater rate than they normally do.
		Althogh the individual shots no longer have quite as much firepower, the additional speed
		makes this a weapon of choice.</p>

		<h2 class="helpSubtitle">Electric Arc</h2>
		<img src="images/bonus_electric.png" style="float:right; margin: .5em"/>
		<p>Instantly forming an electric arc between your ship and the first object
		ahead of you, this is the fastest weapon in our arsenal.  Although its damage at
		any moment is minimal, its constant impact makes it an excellent weapon.</p>

		<h2 class="helpSubtitle">BFG</h2>
		<img src="images/bonus_bfg.png" style="float:right; margin: .5em"/>
		<p>The <acronym title="Bravo Foxtrot Golf - what? You thought it meant something else?">BFG</acronym> is an extremely powerful weapon
		that has far more firepower than anything else available.  A single shot will draw a 
		significant amount of power from your ship and use it to obliterate anything it passes
		through.</p>

		<h2 class="helpSubtitle">Freeze</h2>
		<img src="images/bonus_ice.png" style="float:right; margin: .5em"/>
		<p>By forming a rift in the fabric of time, this powerup causes all of the aliens to move
		infinitely slower.  This does wear off, but gives you a brief window of opportunity
		to go in and do some serious damage.</p>
	</div>
	<div class="helpButtonLayer">
		<span id="backButton" class="helpButton">back</span>
		<span id="nextButton" class="helpButton">next</span>
		<span id="closeButton" class="helpButton">done</span>
	</div>
	<script type="text/javascript">
		$('#closeButton').click(function(){
			$('#helpWrapper').fadeTo(500, 0, function(){
				$('#helpWrapper').remove();
			});
		});
		$('#nextButton').click(function(){
			infoContentWrapperer.fadeTo(200, 0, function(){
				infoContentWrapperer.load("invaders.php?action=loadHelp&step=upgrades3", function(){
					infoContentWrapperer.fadeTo(200, 1);
				});
			});

		});
		$('#backButton').click(function(){
			infoContentWrapperer.fadeTo(200, 0, function(){
				infoContentWrapperer.load("invaders.php?action=loadHelp&step=upgrades", function(){
					infoContentWrapperer.fadeTo(200, 1);
				});
			});

		});
	</script>
<?php
}

function drawHelpStep_upgrades3(){
?>
	<div class="helpContent">

		<h2 class="helpSubtitle">Shielding</h2>
		<img src="images/bonus_shield.png" style="float:right; margin: .5em"/>
		<p>You can get shielding for your ship that will protect against everything as long as
		you don't wear it out.  Any missiles or other objects that strike your ship will be
		destroyed by the high energy waves surrounding you.</p>

		<h2 class="helpSubtitle">Ship lives</h2>
		<img src="images/bonus_life.png" style="float:right; margin: .5em"/>
		<p>One last and extremely important thing you can find is additional life units for your
		ship.  The ships now come provided with three of these alien self-repair systems.  As you're
		incurring damage, the ship will automatically repair itself.  If too much damage is done,
		these self-repair systems get destroyed.  If they are all gone, your ship is destroyed with them.
		Picking up additional ones from the invaders you destroy may very well save you life.</p>

	</div>
	<div class="helpButtonLayer">
		<span id="backButton" class="helpButton">back</span>
		<span id="closeButton" class="helpButton">done</span>
	</div>
	<script type="text/javascript">
		$('#closeButton').click(function(){
			$('#helpWrapper').fadeTo(500, 0, function(){
				$('#helpWrapper').remove();
			});
		});
		$('#backButton').click(function(){
			infoContentWrapperer.fadeTo(200, 0, function(){
				infoContentWrapperer.load("invaders.php?action=loadHelp&step=upgrades2", function(){
					infoContentWrapperer.fadeTo(200, 1);
				});
			});

		});
	</script>
<?php
}

function drawHelp($step){
	if(in_array($step, array('start', 'upgrades', 'upgrades2', 'upgrades3'))){
		$func = 'drawHelpStep_' . $step;
		$func();
	}
}

function drawAbout($step){
	if(in_array($step, array('beginning', 'us'))){
		$func = 'drawAboutStep_' . $step;
		$func();
	}
}

function drawAboutStep_beginning(){
?>
	<div class="helpContent">
		<h2>In the Beginning...</h2>
		<p>Almost a quarter century before this writing, a great rendition of what was even then a classic arcade game came into being.
		<a class="helpContent" href="http://en.wikipedia.org/wiki/Better_Dead_Than_Alien">Better Dead Than Alien</a> was released by a company called Electra.
		I dare not count the number of hours I spent playing that game, and enjoyed it so much that I wrote my own rendition of it years
		later for my PC (viewable <a style="color:#FFF;text-decoration:none" href="http://www.weirdly.net/software.php?category=games">here</a>).
		</p>
		<p>It was nothing great though,
		and having been written to work on an MS-DOS platform, would not play well in these days.  Given how poorly my old rendition aged,
		I thought it appropriate to make a web application of it today; I present you with <i>Rise of the Mutant Space Invaders</i>!
		</p>
	</div>
	<div class="helpButtonLayer">
		<span id="nextButton" class="helpButton">next</span>
		<span id="closeButton" class="helpButton">done</span>
	</div>
	<script type="text/javascript">
		$('#closeButton').click(function(){
			$('#aboutWrapper').fadeTo(500, 0, function(){
				$('#aboutWrapper').remove();
			});
		});
		$('#nextButton').click(function(){
			infoContentWrapperer.fadeTo(200, 0, function(){
				infoContentWrapperer.load("invaders.php?action=loadAbout&step=us", function(){
					infoContentWrapperer.fadeTo(200, 1);
				});
			});

		});
	</script>
<?
}
function drawAboutStep_us(){
?>
	<div class="helpContent">
		<h2>About Us...</h2>
		<p>The work you see here is that of a small husband &amp; wife development team.</p>
		<img src="images/jacob.png" style="float:right; margin-left:1em" alt="Childhood picture of Jacob"/>
		<p>With myself, Jacob being strong on software development and having a good background in artwork,
		and my wife Celeste being strong in artwork and design with a good background in software, we
		find that developing games is a hobby that fits us both well.</p>

		<img src="images/celeste.png" style="float:left; margin-right:1em" alt="Childhood picture of Celeste"/>
		<p>If you haven't already, do check out our other work at <a class="helpContent" href="http://skilliwags.com">skilliwags.com</a>,
		where we're continuously addding to our collection of games.
		</p>

		<p>Now go and kick some alien behinds!</p>
	</div>
	<div class="helpButtonLayer">
		<span id="backButton" class="helpButton">back</span>
		<span id="closeButton" class="helpButton">done</span>
	</div>
	<script type="text/javascript">
		$('#closeButton').click(function(){
			$('#aboutWrapper').fadeTo(500, 0, function(){
				$('#aboutWrapper').remove();
			});
		});
		$('#backButton').click(function(){
			infoContentWrapperer.fadeTo(200, 0, function(){
				infoContentWrapperer.load("invaders.php?action=loadAbout&step=beginning", function(){
					infoContentWrapperer.fadeTo(200, 1);
				});
			});

		});
	</script>
<?php
}

function drawHighScores($newScore = null){
	echo "<h1>TOP DEFENDERS</h1>";
	$fin = fopen("data/highscores.dat", "r");
	echo '<div class="helpContent" style="text-align:center; margin-top:2em">';
	if($newScore !== null){
?>		<div style="position:absolute; top: 70px; text-align:center; width:100%; left:0">
		<p style="margin:auto">Your outstanding efforts to save the human race will not be forgotten.</p>
		</div>
<?php	}
	echo '<table class="highscores">';
	echo '<thead><tr><th class="highscores">PLAYER</th><th class="highscores">SCORE</th></tr></thead><tbody><tr><td colspan="2"><hr/></td></tr>';

	$lastScore = null;
	$count = 0;
	$drewNewScore = false;
	while(($line = fgets($fin)) && $count < 10){
		$count++;
		$parts = explode(':', $line);
		$score = intval(trim($parts[2]));
		$name = trim($parts[1]);
		if($newScore !== null && $newScore > $score && !$drewNewScore){
			$drewNewScore = true;
			$count++;
			?>
			<tr><td class="highscores">
			<div id="highscoreName"></div>
			<!--input type="text" class="nameEntry" id="newname"></input-->
			</td>
			<td class="highscores"><?=$newScore?></td></tr>
			<?php
			
		}
		if($count <= 10){
			$row[] = array($name, $score);
			echo '<tr><td class="highscores">' . $name . '</td><td class="highscores">' . $score . "</td></tr>";
		}
	}
	fclose($fin);
	echo "</tbody></table>";
	echo '</div>';
	if($drewNewScore){
?>		<script type="text/javascript">
		</script>
<?php	}
	if($newScore === null){
?>		<div class="helpButtonLayer">
			<span id="closeButton" class="helpButton">Close</span>
		</div>
		<script type="text/javascript">
			$('#closeButton').click(function(){
				$('#highScore').fadeTo(500, 0, function(){
					$('#highScore').remove();
				});
			});
		</script>
<?php	}else{
?>		<div class="helpButtonLayer">
			<span id="saveButton" class="helpButton">Save</span>
			<span id="cancelButton" class="helpButton">Cancel</span>
		</div>
		<script type="text/javascript">
			gameState = 'hiscore';
			var playerTag = '';
			newHighScoreCancel = function(){
				$('#highScore').fadeTo(500, 0, function(){
					gameState = 'menu';
					$('#highScore').remove();
				});
			};

			newHighScoreSave = function(){
				$('#highScoreContent').fadeTo(200, 0, function(){
					$.post('invaders.php?action=highscore', {
						'score':<?=$newScore?>,
						'name':playerTag
					}, function(result){
						gameState = 'menu';
						$('#highScoreContent').html(result);
						$('#highScoreContent').fadeTo(200, 1);
					});
				});
			}

			$('#cancelButton').click(newHighScoreCancel);
			$('#saveButton').click(newHighScoreSave);
			var caps_on = false;
			var shiftNums = {0:')', 1:'!', 2:'@', 3:'#', 4:'$', 5:'%', 6:'^', 7:'&', 8:'*', 9:'('};
			function handleHighScoreKey(action, e){
				var key = e.which;
				if((key >= 65 && key <= 90) && action == 'down'){
					if(playerTag.length < <?=_MAX_NAME_LENGTH?>){
						if(caps_on){
							playerTag += String.fromCharCode(key);
						}else{
							playerTag += String.fromCharCode(key + 32);
						}
						$('#highscoreName').html(playerTag);
					}
				}else if((key >= 48 && key <= 57) && action == 'down'){
					if(playerTag.length < <?=_MAX_NAME_LENGTH?>){
						if(caps_on){
							playerTag += shiftNums[String.fromCharCode(key)];
						}else{
							playerTag += String.fromCharCode(key);
						}
						$('#highscoreName').html(playerTag);
					}
				}else if(key == 32){
					playerTag += String.fromCharCode(key);
					$('#highscoreName').html(playerTag);
				}else if(key == 8 && action == 'down'){ // bksp
					playerTag = playerTag.substr(0, playerTag.length - 1);
					$('#highscoreName').html(playerTag);

				}else if(key == 13 && action == 'up'){
					newHighScoreSave();
				}else if(key == 27 && action == 'up'){
					newHighScoreCancel();
				}else if(key == 16){
					if(action == 'up'){
						caps_on = false;
					}else{
						caps_on = true;
					}
				}
			}
		</script>
<?php	}
}
if(!function_exists('json_encode')){
	function json_encode($a = false){
		// Some basic debugging to ensure we have something returned
		if (is_null($a)) return 'null';
		if ($a === false) return 'false';
		if ($a === true) return 'true';
		if (is_scalar($a))
		{
			if (is_float($a))
			{
				// Always use "." for floats.
				return floatval(str_replace(",", ".", strval($a)));
			}

			if (is_string($a))
			{
				static $jsonReplaces = array(array("\\", "/", "\n", "\t", "\r", "\b", "\f", '"'), array('\\\\', '\\/', '\\n', '\\t', '\\r', '\\b', '\\f', '\"'));
				return '"' . str_replace($jsonReplaces[0], $jsonReplaces[1], $a) . '"';
			}
			else
				return $a;
		}
		$isList = true;
		for ($i = 0; reset($a); $i++){
			if (key($a) !== $i)
			{
				$isList = false;
				break;
			}
		}
		$result = array();
		if ($isList){
			foreach ($a as $v) $result[] = json_encode($v);
			return '[' . join(',', $result) . ']';
		}
		else
		{
			foreach ($a as $k => $v){
				$result[] = json_encode($k).':'.json_encode($v);
			}
			return '{' . join(',', $result) . '}';
		}
	}
}
$action = 'none';
if(array_key_exists('action', $_GET)){
	$action = $_GET['action'];
}
if(array_key_exists('action', $_POST)){
	$action = $_POST['action'];
}
if($action != 'none'){
	switch($action){
		case 'getLevel':
			$levelnum = 0;
			$level = buildLevels();
			if(array_key_exists('num', $_POST)){
				$levelnum = intval(trim($_POST['num']));
//				$levelnum %= count($level);
			}

			// most of this configuration we'll generate based on the level number, making the game progressively more difficult
			$rval = $level[$levelnum % count($level)];
			$rval['alienLife'] = 10 * (1 + ($levelnum >> 2));
			$rval['maxKamikazes'] = floor(log($levelnum + 2) * 1.5);
			$rval['kamikazeChance'] = log($levelnum + 2) / 1000;
			$rval['powerupChance'] = 1 / (($levelnum << 1) + 80);
			$rval['bombChance'] = log($levelnum + 2) / 100;
			$rval['maxBombs'] = 2 + (($levelnum + 2) >> 2);
			$rval['bombSpeed'] = 6 + ($levelnum >> 3);
			$rval['alienSpeed'] = 2 + floor(2 * $levelnum / count($level));
			$rval['cols'] = 5 + ($levelnum % 4);
			$rval['rows'] = 3 + ($levelnum >> 2);
			$rval['xspacing'] = 20;
			$rval['yspacing'] = 8;
			while($rval['xspacing'] * ($rval['cols'] - 1) + 48/*alien width*/ * $rval['cols'] > 500 && $rval['xspacing'] > 1){
				$rval['xspacing']--;
			}
			echo json_encode($rval);
			break;
		case 'loadmenu':
			drawMenu();
			break;
		case 'loadHelp':
			$helpStep = array_key_exists('step', $_GET) ? $_GET['step'] : 'start';
			drawHelp($helpStep);
			break;
		case 'loadAbout':
			$aboutStep = array_key_exists('step', $_GET) ? $_GET['step'] : 'beginning';
			drawAbout($aboutStep);
			break;
		case 'loadHighScores':
			if(array_key_exists('score', $_GET)){
				drawHighScores(intval($_GET['score']));
			}else{
				drawHighScores();
			}
			break;
		case 'checkHighScore':
			$score = intval($_POST['score']);
			if(isHighScore($score)){
				echo 'yes';
			}else{
				echo 'no';
			}
			break;
		case 'highscore':
			addHighScore($_POST['name'], intval($_POST['score']));
			drawHighScores();
			break;
		default:
			echo "Your hacking attempt and IP address (" . $_SERVER["REMOTE_ADDR"] . ") have been noted.";
			$fout = fopen("data/badAction.log", "a");
			fprintf($fout, "--------------\nIPA:%s\nPOST:\n%s\nGET:\n%s\n", $_SERVER["REMOTE_ADDR"], print_r($_POST, true), print_r($_GET, true));
			fclose($fout);
	}
	exit;
}
?>
<html>
<head>
	<link rel="stylesheet" type="text/css" href="invaders.css" />
	<title>Rise of the Mutant Space Invaders</title>

	<script src="http://ajax.googleapis.com/ajax/libs/jquery/1.5/jquery.min.js"></script>
	<script type="text/javascript" src="spriteSet.js"></script>
	<script type="text/javascript" src="invaders.js"></script>
	<script type="text/javascript">
		var menuWrapper;
		$(document).ready(function(){
			gameState = 'menu';
			$('#infoArea').fadeTo(0, 0);
			$(document).keypress(function(e){
				$('#keyfield').focus();
				var key = e.keyCode ? e.keyCode : e.which;
				if(gameState == 'menu'){
					handleMenuKey(key);
				}else if(gameState == 'hiscore'){
				}else{
				}
				return false;
			});

			$(document).keydown(function(e){
				switch(gameState){
					case 'hiscore':
						handleHighScoreKey('down', e);
						break;
					case 'menu':
						break;
					default:
						handleKeypress('down', e);

				}
			});

			$(document).keyup(function(e){
				switch(gameState){
					case 'hiscore':
						handleHighScoreKey('up', e);
						break;
					case 'menu':
						break;
					default:
						handleKeypress('up', e);

				}
			});
			initialize_game('start', function(){
				$('#loadingDiv').fadeTo(500, 0, function(){
					$('#loadingDiv').remove();
					drawMenu();
				});
			});
		});

		function drawMenu(checkScore){
			if(checkScore == true){
				callback = function(){
					$.post('invaders.php?action=checkHighScore', {'score':score}, function(result){
						if(result == 'yes'){
							showInfoBox('highScore', 'loadHighScores&score=' + score);
						}
					});
				}
			}else{
				callback = function(){};
			}
			$('#playArea').fadeTo(500, 1);
			$('#infoArea').fadeTo(500, 1, callback);
			menuWrapper = $('<div></div>');
			menuWrapper.css({'display':'inline-block'});
			menuWrapper.load('invaders.php?action=loadmenu', function(){
				$('#playArea').append(menuWrapper);
			});
		}

		function handleMenuKey(code){
			$('#debug').append(code + ' ' + gameState + ', ');
		}

		var helpDiv;
		function showHelp(){
			showInfoBox('helpWrapper', 'loadHelp');
		}

		function showHighScores(){
			showInfoBox('highScore', 'loadHighScores');
		}

		function showInfoBox(divid, actiontag){
			infoDiv = $('<div id="' + divid + '"><div>');
			infoDiv.css({
				'width': '90%',
				'height': '80%',
				'position': 'absolute',
				'top': '10%',
				'left': '5%'
			});
			infoDiv.fadeTo(0, 0);
			infoBackdrop = $('<div></div>');
			infoBackdrop.css({
				'background-color': '#000018',
				'width': '100%',
				'height': '100%',
				'position': 'absolute',
				'top': '0px',
				'left': '0px',
				'border': '1px solid #AAB',
				'-moz-border-radius': '16px',
				'border-radius': '16px'
			});
			infoContentWrapperer = $('<div id="' + divid + 'Content"></div>');
			infoContentWrapperer.css({
				'background': 'none',
				'width': '100%',
				'height': '100%',
				'position': 'absolute',
				'top': '0px',
				'left': '0px'
			});

			infoBackdrop.appendTo(infoDiv);
			infoContentWrapperer.appendTo(infoDiv);
			infoBackdrop.fadeTo(0, 0.85);
			infoDiv.appendTo(playArea);
			infoContentWrapperer.load("invaders.php?action=" + actiontag, function(){
				infoDiv.fadeTo(500, 1);
			});
		}

		function showAbout(){
			showInfoBox('aboutWrapper', 'loadAbout');
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
<body style="background-color:black; color:white">

	<div id="header">
	</div>
	<div id="gameWrapper">
		<div id="playArea" class="mainWindow"></div>
		<div id="infoArea"></div>
		<div id="loadingDiv" class="overlay"></div>
		<input type="text" id="keyfield" style="position:absolute; top:-100px;"></input>
	</div>
	<div id="debug" style="position:absolute; top: 0px; left: 100px;color:#FFF;"></div>
</body>
</html>

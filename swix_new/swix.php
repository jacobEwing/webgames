<?php
ini_set('display_errors', 1); 
error_reporting(E_ALL);
include('levels.php');

function gameOverMessage(){
	global $level;
	return array(
		'message' => 'Congratulations!  You have completed all ' . count($level) . ' levels!'
	);
}

function loadLevel($levelNum){
	global $level;
	switch($levelNum){
		case 'ring':
			$returnval = array(
				'title' => 'testlevel',
				'best' => 0,
				'cells' => array(
					'rotateNeighbours' => array(5,2,1, 8,2,1, 2,5,1, 8,5,1, 2,8,1, 5,8,1, ),
					'flipNeighbours' => array(5,1,1, 6,1,1, 7,1,1, 8,1,1, 9,1,1, 4,2,1, 6,2,1, 7,2,1, 9,2,1, 3,3,1, 4,3,1, 5,3,1, 6,3,1, 7,3,1, 8,3,1, 9,3,1, 2,4,1, 3,4,1, 4,4,1, 7,4,1, 8,4,1, 9,4,1, 1,5,1, 3,5,1, 7,5,1, 9,5,1, 1,6,1, 2,6,1, 3,6,1, 6,6,1, 7,6,1, 8,6,1, 1,7,1, 2,7,1, 3,7,1, 4,7,1, 5,7,1, 6,7,1, 7,7,1, 1,8,1, 3,8,1, 4,8,1, 6,8,1, 1,9,1, 2,9,1, 3,9,1, 4,9,1, 5,9,1, ),
				),
				'testlevel' => 1,
				'offset' => array(-12, -127)
			);
			break;

		case 'cookie':
			$returnval = array(
				'title' => 'testlevel',
				'best' => 0,
				'cells' => array(
					'rotateNeighbours' => array(5,1,1, 7,1,1, 9,1,1, 3,3,1, 5,3,1, 7,3,1, 9,3,1, 1,5,1, 3,5,1, 5,5,1, 7,5,1, 9,5,1, 1,7,1, 3,7,1, 5,7,1, 7,7,1, 1,9,1, 3,9,1, 5,9,1),
					'flipNeighbours' => array(5,0,1, 6,0,1, 7,0,1, 8,0,1, 9,0,1, 10,0,1, 4,1,1, 6,1,1, 8,1,1, 10,1,1, 3,2,1, 4,2,1, 5,2,1, 6,2,1, 7,2,1, 8,2,1, 9,2,1, 10,2,1, 2,3,1, 4,3,1, 6,3,1, 8,3,1, 10,3,1, 1,4,1, 2,4,1, 3,4,1, 4,4,1, 5,4,1, 6,4,1, 7,4,1, 8,4,1, 9,4,1, 10,4,1, 0,5,1, 2,5,1, 4,5,1, 6,5,1, 8,5,1, 10,5,1, 0,6,1, 1,6,1, 2,6,1, 3,6,1, 4,6,1, 5,6,1, 6,6,1, 7,6,1, 8,6,1, 9,6,1, 0,7,1, 2,7,1, 4,7,1, 6,7,1, 8,7,1, 0,8,1, 1,8,1, 2,8,1, 3,8,1, 4,8,1, 5,8,1, 6,8,1, 7,8,1, 0,9,1, 2,9,1, 4,9,1, 6,9,1, 0,10,1, 1,10,1, 2,10,1, 3,10,1, 4,10,1, 5,10,1, ),
				),
				'testlevel' => 1,
				'offset' => array(-12, -127)
			);
			break;
		case 'test_large':
			$returnval = array(
				'title' => 'testlevel',
				'best' => 0,
				'cells' => array(
					'flipNeighbours' => array(
						5,0,1,  6,0,1,  7,0,1,  8,0,1,  9,0,1,  10,0,1,
						4,1,1,  5,1,1,  6,1,1,  7,1,1,  8,1,1,  9,1,1,  10,1,1,
						3,2,1,  4,2,1,  5,2,1,  6,2,1,  7,2,1,  8,2,1,  9,2,1,  10,2,1,
						2,3,1,  3,3,1,  4,3,1,  5,3,1,  6,3,1,  7,3,1,  8,3,1,  9,3,1,  10,3,1,
						1,4,1,  2,4,1,  3,4,1,  4,4,1,  5,4,1,  6,4,1,  7,4,1,  8,4,1,  9,4,1,  10,4,1,
						0,5,1,  1,5,1,  2,5,1,  3,5,1,  4,5,1,  5,5,1,  6,5,1,  7,5,1,  8,5,1,  9,5,1,  10,5,1,
						0,6,1,  1,6,1,  2,6,1,  3,6,1,  4,6,1,  5,6,1,  6,6,1,  7,6,1,  8,6,1,  9,6,1,
						0,7,1,  1,7,1,  2,7,1,  3,7,1,  4,7,1,  5,7,1,  6,7,1,  7,7,1,  8,7,1,
						0,8,1,  1,8,1,  2,8,1,  3,8,1,  4,8,1,  5,8,1,  6,8,1,  7,8,1,
						0,9,1,  1,9,1,  2,9,1,  3,9,1,  4,9,1,  5,9,1,  6,9,1,
						0,10,1, 1,10,1, 2,10,1, 3,10,1, 4,10,1, 5,10,1,
					),
					'rotateNeighbours' => array(
					)
				),
				'testlevel' => 1,
				'offset' => array(-12, -127)
			);
			for($n = 2; $n < count($returnval['cells']['flipNeighbours']); $n += 3){
				$returnval['cells']['flipNeighbours'][$n] = 0;
			}
			break;
		case 'test_medium_large':
			$returnval = array(
				'title' => 'testlevel',
				'best' => 0,
				'cells' => array(
'flipNeighbours' => array(5,1,0, 6,1,0, 7,1,0, 8,1,0, 9,1,0, 4,2,0, 6,2,0, 7,2,0, 9,2,0, 3,3,0, 4,3,0, 5,3,0, 7,3,0, 8,3,0, 9,3,0, 2,4,0, 3,4,0, 5,4,0, 6,4,0, 8,4,0, 9,4,0, 1,5,0, 3,5,0, 4,5,0, 6,5,0, 7,5,0, 9,5,0, 1,6,0, 2,6,0, 4,6,0, 5,6,0, 7,6,0, 8,6,0, 1,7,0, 2,7,0, 3,7,0, 5,7,0, 6,7,0, 7,7,0, 1,8,0, 3,8,0, 4,8,0, 6,8,0, 1,9,0, 2,9,0, 3,9,0, 4,9,0, 5,9,0),
'rotateNeighbours' => array(5,2,1, 8,2,1, 6,3,1, 4,4,1, 7,4,1, 2,5,1, 5,5,1, 8,5,1, 3,6,1, 6,6,1, 4,7,1, 2,8,1, 5,8,1, ),
				),
				'testlevel' => 1,
				'offset' => array(-12, -127)
			);
			for($n = 2; $n < count($returnval['cells']['flipNeighbours']); $n += 3){
				$returnval['cells']['flipNeighbours'][$n] = 1;
			}
			break;
		case 'test_medium':
			$returnval = array(
				'title' => 'testlevel',
				'best' => 0,
				'cells' => array(
					'flipNeighbours' => array(
						3,0,1,  4,0,1,  5,0,1,  6,0,1,
						2,1,1,  4,1,1,  6,1,1,
						1,2,1,  2,2,1,  4,2,1,  5,2,1,  6,2,1,
						0,3,1,  2,3,1,  6,3,1,
						0,4,1,  1,4,1,  3,4,1,  4,4,1,  5,4,1, 
						0,5,1,  2,5,1,  4,5,1,
						0,6,1,  1,6,1,  2,6,1,  3,6,1,

						3,2,1,   2,4,1,  4,3,1,

					),
					'rotateNeighbours' => array(
						3,3,1,
						3,1,1, 5,1,1, 1,3,1, 5,3,1, 1,5,1, 3,5,1
					)
				),
				'testlevel' => 1,
				'offset' => array(-107, 38) 

			);
			break;
		case 'test_small': 
			$returnval = array(
				'title' => 'small',
				'best' => 4,
				'cells' => array(
					'flipNeighbours' => array(2,0,1,  3,0,1,  4,0,1,  1,1,1,  2,1,1,  3,1,1,  4,1,1,  0,2,1,  1,2,1,  2,2,1,  3,2,1,  4,2,1,  0,3,1,  1,3,1,  2,3,1,  3,3,1,  0,4,1,  1,4,1,  2,4,1),
				),
				'testlevel' => 1,
				'offset' => array(-156, 122)

			);
			for($n = 2; $n < count($returnval['cells']['flipNeighbours']); $n += 3){
				$returnval['cells']['flipNeighbours'][$n] = 0;
			}
			break;
		case 'test_tiny': 
			$returnval = array(
				'title' => 'tiny',
				'best' => 4,
				'cells' => array(
					'flipNeighbours' => array(2,1,1, 3,1,1, 1,2,1, 3,2,1, 1,3,1, 2,3,1),
					'flipNeighbours' => array(2,2,1)
				),
				'testlevel' => 1,
				'offset' => array(-156, 122)

			);
			for($n = 2; $n < count($returnval['cells']['flipNeighbours']); $n += 3){
				$returnval['cells']['flipNeighbours'][$n] = 0;
			}
			break;
		default:
			if(array_key_exists($levelNum, $level)){
				$returnval = $level[$levelNum];
			}else{
				$returnval = gameOverMessage();
			}
	}
	return $returnval;
}

if(array_key_exists('action', $_GET)){
	switch($_GET['action']){
		case 'getLevel':
			$dat = loadLevel($_GET['id']);

			echo local_json_encode($dat);
			break;
	}
	exit();
}

function local_json_encode($a = false){
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
		foreach ($a as $v) $result[] = local_json_encode($v);
		return '[' . join(',', $result) . ']';
	}
	else
	{
		foreach ($a as $k => $v){
			$result[] = local_json_encode($k).':'.local_json_encode($v);
		}
		return '{' . join(',', $result) . '}';
	}
}

?>
<!DOCTYPE html>
<html>
<head>
	<link href='http://fonts.googleapis.com/css?family=Loved+by+the+King' rel='stylesheet' type='text/css'>
	<link rel="stylesheet" type="text/css" href="swix.css" />
	<script type="text/javascript" src="jquery.js"></script>
	<script type="text/javascript" src="spriteSet.js"></script>
	<script type="text/javascript" src="cellClass.js"></script>
	<script type="text/javascript" src="swix.js"></script>
	<script type="text/javascript">
		<?php
			if(isset($exitFunc)) echo $exitFunc;
			else echo "function exit(){history.go(-1);}";
		?>

		function dumpMap(){
			for(m in buttonTypes){
				echo("'" + buttonTypes[m] + "'" + ' => array(');
				for(n in button){
					if(button[n].objType == buttonTypes[m] && button[n].state == 0){
						echo(button[n].position.x + ',' + button[n].position.y + ',' + button[n].state + ',  ');
					}
				}
				echo("<br/>");
				for(n in button){
					if(button[n].objType == buttonTypes[m] && button[n].state == 1){
						echo(button[n].position.x + ',' + button[n].position.y + ',' + button[n].state + ',  ');
					}
				}
				echo("),<br/>");
			}
		}

		function echo(text){
			$('#debug').append(text);
		}

		$(document).ready(function(){
			<?php 
			if(array_key_exists('level', $_GET)){
				echo "currentLevel = '{$_GET['level']}';";
			}else{
				echo "currentLevel = 0;";
			}
			?>
			startGame();
		});
	</script>
</head>
<body>
	<div id="gameWrapper">
		<div id="centering">
			<div id="loadingPrompt"></div>
			<div id="contentWrapper"><!-- style="display:none"-->
				<div id="swix"><img src="images/swix.png"/></div>
				<img id="copyright" src="images/copyright.png"/>
				<div id="stepstitle" class="topRightEdge">Moves:</div>
				<div id="stepstaken" class="topRightEdge">0</div>
				<div id="beststepstitle" class="topRightEdge">Best:</div>
				<div id="beststeps" class="topRightEdge">0</div>
				<div id="content"></div>
				<a id="resetButton" class="actionButton" href="#" onclick="restartLevel(); return false">reset</a>
				<a id="exitButton" class="actionButton" href="#"  onclick="exit(); return false;">exit</a>
				<a id="skipButton" class="actionButton" href="#" onclick="skipLevel(); return false;">skip</a>
				<div id="titleDivWrapper">
					<div id="titleDiv"></div>
				</div>
			</div>
		</div>
	</div>
<?php
	if(array_key_exists('devel', $_GET)){
		echo '<div id="tools"><span onclick = "dumpMap()">dump</span></div>';
		echo '<div id="debug"></div>';
	}
?>
</body>
</html>

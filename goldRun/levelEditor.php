<?php
if(array_key_exists('action', $_GET)){
	switch(trim(strtolower($_GET['action']))){
		case 'save':
			$title = htmlentities(trim($_POST['title']));
			$testLevel = loadLevel($title);
			if($testLevel){
				$testLevel['map'] = $_POST['map'];
				saveLevel($testLevel);
			}else{
				$level = array(
					'map' => $_POST['map'],
					'title' => $title
				);
				saveLevel($level);
			}
			echo "Ok";
			break;
		case 'load':
			$title = $_POST['title'];
			$result = loadLevel($title);
			if($result){
				echo json_encode($result['map']);
			}
			break;
	}
	exit;
}

function loadLevel($title){
	$levels = loadAllLevels();
	if(array_key_exists($title, $levels)){
		return array(
			'title' => $title,
			'map' => $levels[$title]
		);
	}else{
		return null;
	}
}

function saveLevel($level){
	$levels = loadAllLevels();
	$levels[$level['title']] = $level['map'];
	saveAllLevels($levels);
}

function loadAllLevels(){
	$levels = array();
	$fin = fopen('levels.dat', 'r');
	while(!feof($fin)){
		$row = trim(fgets($fin));
		if(strlen($row) > 0){
			$parts = explode('>', $row, 2);
			$levels[$parts[0]] = $parts[1];
		}
	}
	fclose($fin);
	return $levels;
}

function saveAllLevels($levels){
	$fout = fopen('levels.dat', 'w');
	foreach($levels as $title => $data){
		fprintf($fout, $title . ">" . $data . "\n");
	}
	fclose($fout);
}

?>
<!DOCTYPE html>
<html>
<head>
	<style type="text/css">
		body{
			text-align:center;
		}
		#pageWrapper{
			margin:auto;
			width: 960px;
			text-align:center;
			border: 1px solid #0A0;
		}
		#gameHeader{
			position:relative;
			height: 60px;
			border: 1px solid #A00;
		}
		#gameWrapper{
			position:relative;
			margin:auto;
			width: 960px;
			height: 576px;
			border: 1px solid #AAA;
		}
		#gameOverlay{
			position: absolute;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
		}
		#gameCanvas{
			position: absolute;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			background-color: #000;
		}
		#gameFooter{
			text-align:right;
			border: 1px solid #A0A;
		}

		span.buttonSpan{
			padding: 2px;
			background-color: #888;
			border: 1px solid;
			border-color: #AAA #666 #666 #AAA;
			cursor: pointer;
		}

	</style>
	<script src="http://ajax.googleapis.com/ajax/libs/jquery/1.5/jquery.min.js"></script>
	<script type="text/javascript" src="spriteSet.js"></script>
	<script type="text/javascript" src="levelEditor.js"></script>
	<script type="text/javascript">
	$(document).ready(function(){

//		setInterval(function(){doAnimation()}, ANIMATION_FREQUENCY);

///		$(document).keydown(keydownCall);
//		$(document).keyup(keyupCall);
		sprites = new spriteSet();
		sprites.load('goldRun.sprite', function(){
			draw_editor();
		});
	});

	</script>
</head>
<body>
	<div id="pageWrapper">
		<div id="gameHeader">
			<div style="float:right; text-align:right">
				<select name="levelSelect" id="levelSelect">
<?php
					$levels = loadAllLevels();
					foreach($levels as $title => $data){
						echo "<option value=\"$title\">$title</option>\n";
					}
?>
				</select>
				<span class="buttonSpan" onclick="loadLevel()">Load</span>
				<span class="buttonSpan" onclick="clearLevel()">Clear</span>
				<br/>
				Level name:<input type="text" id="newLevelName"></input>
				<span class="buttonSpan" onclick="saveLevel()">Save</span>
			</div>
		</div>
		<div id="gameWrapper">
			<div id="gameCanvas"></div>
			<div id="gameOverlay"></div>
		</div>
		<div id="gameFooter">
			<div id="mouseState" style="float:left; margin-right: 2em;">0</div>
			<div id="mousePos" style="float:left; margin-right: 2em;">0, 0</div>
			<div id="currentTool" style="float:left; margin-right: 2em;"></div>
			<div id="messages" style="float:left; margin-right: 2em;"></div>
			&copy; 2012 Skilliwags
		</div>
		<div id="debug"></div>
	</div>
</body>
</html>

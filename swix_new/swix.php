<!DOCTYPE html>
<html>
<head>
	<link href='http://fonts.googleapis.com/css?family=Coming+Soon' rel='stylesheet' type='text/css'>
	<link rel="stylesheet" type="text/css" href="swix.css" />
	<script type="text/javascript" src="jquery.js"></script>
	<script type="text/javascript" src="spriteSet.js"></script>
	<script type="text/javascript" src="swix.js"></script>
	<script type="text/javascript">
	</script>
</head>
<body>
	<div id="gameWrapper">
		<div id="spriteTest" style="border: 1px dashed #FFF; border-radius: 10px; width: 600px; height: 400px; color: #FFF; margin: 1em">
			<?php
				$sequences = array(
					'blue2black', 'black2blue', 'gold2black', 'black2gold', 'rotblue', 'rotgold', 'rotblack'
				);
				foreach($sequences as $sequence){
					echo '<br/><a href="#" onclick="cells[0].sprite.startSequence(\'' . $sequence . '\'); return false;">' . $sequence . '</a>';
				}
			?>
		</div>
		<div id="centering">
			<div id="loadingPrompt"></div>
			<div id="contentWrapper"><!-- style="display:none"-->
				<div id="swix"><img src="images/swix.png"/></div>
				<img id="copyright" src="images/copyright.png"/>
				<img id="stepstitle" src="images/moves.png"/>
				<div id="stepstaken"></div>
				<img id="beststepstitle" src="images/best.png"/>
				<div id="beststeps"></div>
				<div id="content"></div>
				<img id="resetButton" class="anchor" src="images/reset.png" onclick="restartLevel()"/>
				<img id="exitButton" class="anchor" src="images/exit.png" onclick="exit()"/>
				<img id="skipButton" class="anchor" src="images/skip.png" onclick="skipLevel()"/>
				<div id="titleDivWrapper">
					<div id="titleDiv"></div>
				</div>
			</div>
		</div>
	</div>
</body>
</html>

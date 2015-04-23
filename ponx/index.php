<html>
<head>
<title>Ponx</title>
<script src="http://ajax.googleapis.com/ajax/libs/jquery/1.5/jquery.min.js"></script>
<style type="text/css">
	body{
		background-color: #000;
	}
	#pageWrapper{
		position: absolute;
		width: 100%;
		height: 100%
		background-color: #000;
		text-align:center;
	}
	#gameWrapper{
		margin:auto;
		margin-top:1em;
		width: 680px;
		height: 480px;
		position:relative;
		padding: 0px;
		border-width: 5px;
		border-color: #63A;
		border-style:inset;
		background: url(images/powerBackdrop.png);
	}
	#gameFooter{
		margin:auto;
		margin-top:1em;
		width:640;
		position:relative;
	}
	#gameArea{
		margin: none;
		padding: 0px;
		position: absolute;
		top:0px;
		left: 20px;
		width: 640px;
		height: 480px;
		background-image: url(images/DarkGrainyFluffyStuff2.png);
		background-position: 10px 20px;
	}
	div.scorebar{
		position:absolute;
		width:20px;
		background-image:url(images/power.png);
	}
	#score1{
		left: 0px;
		height:480px;
		top:0px;
		background-position:0px 0px;
	}
	#score2{
		position:absolute;
		left: 660px;
		height:480px;
		top:0px;
		background-position:0px 0px;
	}
	#gameOverlay{
		width: 100%;
		height: 100%;
		background-image: url(images/overlay_1.png);
		position: absolute;
		top: 0px;
		left: 0px;
		background-position: 10px 20px;
	}
	.paddle{
		width: 18px;
		height: 100px;
		background-image: url(images/paddle_2.png);
		position: absolute;
		margin: 0px;
	}

	#ball{
		width: 28px;
		height: 28px;
		background-image: url(images/ball_2.png);
		position:absolute;
		overflow:hidden;
	}
	#pointWrapper{
		position: relative;
		font-size: 1.5em;
		height: 2em;
		margin: auto;
		top: 0px;
		width: 640px;
	}
	#titleWrapper{
		text-align:center;
		display:block;
	}
	#title{
		position:relative;
		margin:auto;
		width:172px;
	}
	span.button{
		margin: 1em;
	}
</style>
<script src="http://www.google-analytics.com/urchin.js" type="text/javascript"></script>
<script type="text/javascript">
_uacct = "UA-3072147-1";
try{urchinTracker();} catch(e){};
var gameArea, leftPaddle, rightPaddle;
var paddleLength;
var ball;
var maxPoints = 5;
var humanPlayer;
var gameState = 'done';
var pi = 3.14159265358979;
var ballSpeed = 12, ballFrequency = 30;
var playButton, ticker, tickerOffset;
var pauseButton;

// returns the clockwise angle in radians between the line "x = x1" and the vector (x1, y1)-(x2, y2)
function rel_ang(x1, y1, x2, y2){ 
	var hyp, alpha, deltax, deltay;
	var deltax = x2 - x1;
	var deltay = y2 - y1;
	var hyp = Math.sqrt(deltax * deltax + deltay * deltay);

	/********* figure out the value for alpha *********/
	if(y2 == y1){ 
		alpha = pi / 2; 
		if(x2 < x1) alpha = 3 * pi / 2; 
	}else if(x2 == x1){ 
		alpha = 0; 
		if(y2 > y1) alpha = pi;

	}else if(x2 > x1){ 
		if(y2 < y1)
			alpha = Math.asin(deltay / hyp) + pi / 2; 
		else if(y2 > y1)
			alpha = Math.asin(deltay / hyp) + pi / 2; 
	}else if(x2 < x1){ 
		if(y2 < y1)
			alpha = Math.acos(deltay / hyp) + pi;
		else if(y2 > y1)
			alpha = Math.acos(deltay / hyp) + pi;
	}    
	return alpha;
}

function startTicker(image){
	ticker = $('<div></div>');
	ticker.css({
		'width':'100%',
		'height':'31px',
		'position':'absolute',
		'top': '190px',
		'left':'0px',
		'text-align':'left',
		'background-image': 'url(' + image + ')',
		'background-position':'0px 0px'
	});
	ticker.appendTo($('#gameWrapper'));
	tickerOffset = 0;
	setTimeout('scrollTicker()', 40);
}

function scrollTicker(){
	if(gameState == 'done'){
		tickerOffset -= 10;
		ticker.css({
			'background-position': + tickerOffset + 'px 0px'
		});
//		alert('background-position:-' + tickerOffset + 'px 0px');
		setTimeout('scrollTicker()', 40);
	}
}

function addPlayButton(){
	playButtonWrapper = $('<div></div>');
	playButtonWrapper.css({
		'width':'100%',
		'position':'absolute',
		'top': '230px',
		'left':'0px',
		'text-align':'center'
	});

	playButton = $('<img src="images/play.png"/>');
	playButton.css({'margin':'auto'});
	playButton.mouseup(function(){restartGame();});
	playButtonWrapper.append(playButton);

	playButtonWrapper.appendTo($('#gameArea'));
}

function addPauseButton(){
	pauseButton = $('<img src="images/pause.png"/>');
	pauseButton.click(function(){
		pauseGame();
	});
	$('#pauseButton').append(pauseButton);
}

function checkGameOver(){
	var winner = null;
	if(leftPlayer.points <= 0){
		winner = rightPlayer;
	}else if(rightPlayer.points <= 0){
		winner = leftPlayer;
	}
	if(winner != null){
		if(winner == humanPlayer){
			startTicker('images/humanWins.png');
		}else{
			startTicker('images/computerWins.png');
		}
		pauseButton.remove();
		addPlayButton();
		setGameState('done');
	}
}

function restartGame(){
	setGameState('charging');
	if(ticker != undefined){
		ticker.remove();
	}
	playButton.remove();
	rechargePoints();
}

function rechargePoints(){
	var done = true;
	if(leftPlayer.points < maxPoints){
		leftPlayer.points += maxPoints / 60;
		if(leftPlayer.points > maxPoints) leftPlayer.points = maxPoints;
		else if(leftPlayer.points < maxPoints) done = false;
		leftPlayer.drawPoints();
	}
	if(rightPlayer.points < maxPoints){
		rightPlayer.points += maxPoints / 60;
		if(rightPlayer.points > maxPoints) rightPlayer.points = maxPoints;
		else if(rightPlayer.points < maxPoints) done = false;
		rightPlayer.drawPoints();
	}
	if(done){
		addPauseButton();
		setGameState('playing');
	}else{
		setTimeout('rechargePoints()', 30);
	}
}

function playerClass(playerName){
	var points;
	var pointDisplayDiv;
	var myName = playerName;
	var AISpeed;
	var paddle;
	var x, y;

	this.points = 0;
	this.AISpeed = 32;

	this.setPointDisplay = function(targetDiv){
		this.pointDisplayDiv = targetDiv;
	}

	this.setPaddle = function(newPaddle){
		this.paddle = newPaddle;
		this.y = this.paddle.position().top;
		this.x = this.paddle.position().left;
	}

	this.drawPoints = function(){
		var newHeight, newTop;
		newHeight = Math.floor(480 * this.points / maxPoints);
		newTop = 480 - newHeight;
		this.pointDisplayDiv.css({
			'top' : newTop + 'px',
			'height' : newHeight + 'px',
			'background-position' : '0px -' + newTop + 'px'
		});

	}

	this.playAI = function(){
		if(gameState != 'paused'){
			y1 = ball.y + (ball.height >> 1);
			y2 = this.y + (paddleLength >> 1);
			delta = Math.abs(y1 - y2);


			if((ball.x < this.x && ball.dx > 0) || (ball.x > this.x && ball.dx < 0)){
				speed = delta >> 3;

				//if(speed < 4) speed = 4;
				//if(speed > gameArea.height * 5) speed = gameArea.height * 5;
			}else{
				speed = delta >> 5;
			}
			if(ball.y > this.y) this.movePaddle(speed);
			if(ball.y < this.y) this.movePaddle(-speed);
		}
		setTimeout(myName + '.playAI()', this.AISpeed);
	}

	this.movePaddle = function(distance){
		y = this.y + distance;
		if(y < 0) y = 0;
		if(y > gameArea.height - paddleLength) y = gameArea.height - paddleLength;
		this.y = y;
		this.paddle.css('top', y);
	}

	this.placePaddle = function(y){
		this.y = y;
		this.paddle.css('top', y);
	}
};


function buildBall(ball){
	ball.width = ball.innerWidth();
	ball.height = ball.innerHeight();
	ball.horseAroundAngle = 0;
	ball.setPos = function(newx, newy){
		this.x = newx;
		this.y = newy;
		this.css('left', this.x);
		this.css('top', this.y);
	}

	ball.setSpeed = function(newdx, newdy, newfreq){
		this.dx = newdx;
		this.dy = newdy;
		this.frequency = newfreq;
		this.velocity = Math.sqrt(newdx * newdx + newdy * newdy);
	}

	ball.move = function(){
		switch(gameState){
			case 'playing':
				ball.gameMove();
				break;
			case 'paused':
				break;
			default:
				ball.horseAround();
		}
		setTimeout('ball.move()', this.frequency);
	}

	ball.horseAround = function(){
		var cx = this.maxx - this.minx >> 1;
		var cy = this.maxy - this.miny >> 1;
		this.horseAroundAngle += 0.1;
		cx += 240 * Math.sin(this.horseAroundAngle + Math.cos(this.horseAroundAngle / 3));
		cy += 240 * Math.cos(this.horseAroundAngle + Math.sin(this.horseAroundAngle / 4));


		var dx = (cx - this.x) >> 4;
		var dy = (cy - this.y) >> 4;

		var ratio = ballSpeed / Math.sqrt(dx * dx + dy * dy);
		this.setSpeed(
			Math.floor(ratio * dx),
			Math.floor(ratio * dy),
			ballFrequency
		);

		this.x += dx;
		this.y += dy;
		this.css('left', this.x);
		this.css('top', this.y);
		pos1 = (-this.x >> 1) + 'px ' + (-this.y >> 1) + 'px';
		pos2 = (-this.x) + 'px ' + (-this.y) + 'px';
		gameArea.css({backgroundPosition:pos1});
		$('#gameOverlay').css({backgroundPosition:pos2});
		
	}

	ball.gameMove = function(){
		this.x += this.dx;
		this.y += this.dy;

		// test collision for leftward motion
		if(this.dx < 0){
			if(this.x < this.minx){
				this.x = (this.minx << 1) - this.x;
				this.dx = -this.dx;
				leftPlayer.points--;
				leftPlayer.drawPoints();
				checkGameOver();
			}else if(this.x < this.minx + paddleDepth){
				var padTop = leftPaddle.position().top;
				if(this.y > padTop - this.height && this.y < padTop + paddleLength){
					paddlePos = padTop + (paddleLength >> 1);
					bdelta = this.y - paddlePos + (this.height >> 1);
					ratio = 2.0 * Math.abs(bdelta / paddleLength);
					if(ratio > 0.9) ratio = 0.9;

					this.dy = Math.sqrt(this.velocity * this.velocity * ratio);
					this.dx = Math.sqrt(this.velocity * this.velocity - this.dy * this.dy);
					if(bdelta < 0) this.dy *= -1;
					//this.x = ((this.minx + paddleDepth) << 1) - this.x;
				}
			}
		}

		// test collision for rightward motion
		if(this.dx > 0){
			if(this.x > this.maxx){
				this.x = (this.maxx << 1) - this.x;
				this.dx = -this.dx;
				rightPlayer.points--;
				rightPlayer.drawPoints();
				checkGameOver();
			}else if(this.x > this.maxx - paddleDepth){
				var padTop = rightPaddle.position().top;
				if(this.y > padTop - this.height && this.y < padTop + paddleLength){

					paddlePos = padTop + (paddleLength >> 1);
					bdelta = this.y - paddlePos + (this.height >> 1);
					ratio = 2.0 * Math.abs(bdelta / paddleLength);
					if(ratio > 0.9) ratio = 0.9;

					this.dy = Math.sqrt(this.velocity * this.velocity * ratio);
					this.dx = -Math.sqrt(this.velocity * this.velocity - this.dy * this.dy);
					if(bdelta < 0) this.dy *= -1;
				}
			}
		}

		// test collision for vertical motion
		if(this.y > this.maxy && this.dy > 0){
			this.y = (this.maxy << 1) - this.y;
			this.dy = -this.dy;
		}else if(this.y < 0 && this.dy < 0){
			this.y = (this.miny << 1) - this.y;
			this.dy = -this.dy;
		}

		// move the ball
		this.css('left', this.x);
		this.css('top', this.y);
		pos1 = (-this.x >> 1) + 'px ' + (-this.y >> 1) + 'px';
		pos2 = (-this.x) + 'px ' + (-this.y) + 'px';
		gameArea.css({backgroundPosition:pos1});
		$('#gameOverlay').css({backgroundPosition:pos2});
	}

	ball.initialize = function(){
		this.width = this.innerWidth();
		this.height = this.innerHeight();
		this.minx = this.miny = 0;
		this.maxx = gameArea.width - this.width;
		this.maxy = gameArea.height - this.height;
		this.setPos(this.maxx >> 1, this.maxy >> 1);
	}

	ball.setRandomVelocity = function(){
		ang = Math.random() * .75 * pi;
		ang += .125;
		if(Math.random() < 0.5) ang += pi;
		this.setSpeed(ballSpeed * Math.sin(ang), ballSpeed * Math.cos(ang), ballFrequency);
	}
}

$('document').ready(function(){
	gameArea = $('#gameArea');
	leftPaddle = $('#leftPaddle');
	rightPaddle = $('#rightPaddle');

	rightPaddle.css('left', gameArea.innerWidth() - rightPaddle.innerWidth());
	leftPaddle.css('left', 0);
	paddleLength = $('.paddle').innerHeight();
	paddleDepth = $('.paddle').innerWidth();

	// get the absolute position of our play area
	pos1 = gameArea.position();
	pos2 = $('#pageWrapper').position();
	gameArea.x = pos1.left + pos2.left;
	gameArea.y = pos1.top + pos2.top;
	gameArea.width = gameArea.innerWidth();
	gameArea.height = gameArea.innerHeight();
	$(document).mousemove(function(e){
		//var mouseX = e.pageX - gameArea.x;
		if(humanPlayer != undefined && gameState != 'paused'){
			var offset = gameArea.offset();
			y = e.pageY - offset.top - paddleLength / 2;
			if(y < 0) y = 0;
			if(y > gameArea.height - paddleLength) y = gameArea.height - paddleLength;
			humanPlayer.placePaddle(y);
		}
	});

	// set up the players
	leftPlayer = new playerClass('leftPlayer');
	leftPlayer.points = 0;
	leftPlayer.setPointDisplay($('#score1'));
	leftPlayer.drawPoints();
	leftPlayer.setPaddle(leftPaddle);

	rightPlayer = new playerClass('rightPlayer');
	rightPlayer.points = 0;
	rightPlayer.setPointDisplay($('#score2'));
	rightPlayer.drawPoints();
	rightPlayer.setPaddle(rightPaddle);

	// create our ball
	ball = $('#ball');
	buildBall(ball);

	ball.setPos(100, 100);
	ball.setRandomVelocity();
	ball.initialize();
	ball.move();

	// these should eventually be selectable options for the user
	rightPlayer.playAI();
	humanPlayer = leftPlayer;

	addPlayButton();
});

function pauseGame(){
	if(gameState == 'playing'){
		setGameState('paused');
		pauseButton = $('<img src="images/unpause.png"/>');
		pauseButton.click(function(){
			pauseGame();
		});
		$('#pauseButton').empty();
		$('#pauseButton').append(pauseButton);
	}else if(gameState == 'paused'){
		setGameState('playing');
		pauseButton = $('<img src="images/pause.png"/>');
		pauseButton.click(function(){
			pauseGame();
		});
		$('#pauseButton').empty();
		$('#pauseButton').append(pauseButton);
	}
}

function setGameState(state){
	// done, charging, playing, paused
	if(state == 'playing'){
		// if the ball has been moving around randomly, then we have to make
		// sure it's not moving vertically before we release it.
		if(gameState != 'paused'
		   && gameState != 'playing'
		   && ballSpeed - ball.dy < ballSpeed >> 2
		){
			setTimeout('setGameState("' + state + '")', 100);
		}else{
			$('#gameWrapper').css({'cursor':'url(images/blankDot.png)'});
			gameState = state;
		}
	}else{
		$('#gameWrapper').css({'cursor':'default'});
		gameState = state;
	}
}

// we only want this if there isn't a custom exit function for the page calling this game

if(typeof('exit') != 'function'){
	function exit(){
		history.go(-1);
	}
}

</script>
</head>
<body>
	<div id="pageWrapper">
		<div id="titleWrapper">
			<img src="images/ball_2.png"/ style="margin-right:10px;">
			<img src="images/ponx.png"/>
			<img src="images/ball_2.png" style="margin-left:10px;"/>
		</div>
		<div id="gameWrapper">
			<div id="score1" class="scorebar"></div>
			<div id="score2" class="scorebar"></div>
			<div id="gameArea">
				<div id="gameOverlay"></div>
				<div class="paddle" id="leftPaddle"></div>
				<div class="paddle" id="rightPaddle"></div>
				<div id="ball"></div>
			</div>
		</div>
		<div id="gameFooter">
			<span id="pauseButton" class="button">
			</span>
			<span id="exitButton" class="button">
			<img src="images/exit.png" alt="Exit" onclick="exit()" />
			</span>
		</div>
	</div>
</body>
</html>

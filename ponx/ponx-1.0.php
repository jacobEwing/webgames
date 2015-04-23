<html>
<head>
	<title>Ponx</title>
	<script type="text/javascript" src="jquery-1.4.2.min.js"></script>
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
		#gameArea{
			margin: auto;
			padding: 0px;
			position: relative;
			top: 100px;
			width: 320px;
			height: 200px;
			background-color: #888;
		}
		.paddle{
			width: 8px;
			height: 32px;
			background-color: #AFA;
			position: absolute;
			margin: 0px;
		}

		#ball{
			width: 8px;
			height: 8px;
			background-color: #CCF;
			position:absolute;
			overflow:hidden;
		}
		#pointWrapper{
			font-size: 1.5em;
			height: 2em;
			margin: auto;
			top: 0px;
			background-color: #000;
			width: 10em;
		}
		#rightPoints{
			width: 40px;
			background-color: #888;
			color: #000;
			display: inline;
		}

		#leftPoints{
			width: 40px;
			background-color: #888;
			color: #000;
			display: inline;
		}
	</style>
	<script type="text/javascript">
	var gameArea, leftPaddle, rightPaddle;
	var paddleLength;
	var ball;
	function isDefined(variable){
		return (!(!(document.getElementById(variable))))
	}

	function playerClass(playerName){
		var points;
		var pointDisplayDiv;
		var myName = playerName;
		var AISpeed;
		var paddle;
		var x, y;

		this.points = 0;
		this.AISpeed = 30;

		this.setPointDisplay = function(targetDiv){
			this.pointDisplayDiv = targetDiv;
		}

		this.setPaddle = function(newPaddle){
			this.paddle = newPaddle;
			this.y = this.paddle.position().top;
			this.x = this.paddle.position().left;
		}

		this.drawPoints = function(){
			this.pointDisplayDiv.text(this.points);
		}

		this.playAI = function(){
			if((ball.x < this.x && ball.dx > 0) || (ball.x > this.x && ball.dx < 0)){
				speed = 3;
			}else{
				speed = 1;
			}
			if(ball.y > this.y) this.movePaddle(speed);
			if(ball.y < this.y) this.movePaddle(-speed);
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

	$('document').ready(function(){
		var humanPlayer;
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

		gameArea.mousemove(function(e){
			//var mouseX = e.pageX - gameArea.x;
			if(humanPlayer != undefined){
				y = e.pageY - gameArea.y - paddleLength / 2;
				if(y < 0) y = 0;
				if(y > gameArea.height - paddleLength) y = gameArea.height - paddleLength;
				humanPlayer.placePaddle(y);
			}
		});

		// set up the players
		leftPlayer = new playerClass('leftPlayer');
		leftPlayer.setPointDisplay($('#leftPoints'));
		leftPlayer.drawPoints();
		leftPlayer.setPaddle(leftPaddle);

		rightPlayer = new playerClass('rightPlayer');
		rightPlayer.setPointDisplay($('#rightPoints'));
		rightPlayer.drawPoints();
		rightPlayer.setPaddle(rightPaddle);

		// create our ball
		ball = $('#ball');
		buildBall(ball);

		ball.setPos(100, 100);
		ball.setSpeed(3, 3, 20);
		ball.initialize();
		ball.move();

		// these should eventually be selectable options for the user
		rightPlayer.playAI();
//		humanPlayer = leftPlayer;
		leftPlayer.playAI();

	});

	function buildBall(ball){
		ball.width = ball.innerWidth();
		ball.height = ball.innerHeight();

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
		}

		ball.move = function(){
			this.x += this.dx;
			this.y += this.dy;

			// test collision for leftward motion
			if(this.dx < 0){
				if(this.x < this.minx){
					this.x = (this.minx << 1) - this.x;
					this.dx = -this.dx;
					rightPlayer.points++;
					rightPlayer.drawPoints();
				}else if(this.x < this.minx + paddleDepth){
					var padTop = leftPaddle.position().top;
					if(this.y > padTop - this.height && this.y < padTop + paddleLength){
						this.x = ((this.minx + paddleDepth) << 1) - this.x;
						this.dx = -this.dx;
					}
				}
			}

			// test collision for rightward motion
			if(this.dx > 0){
				if(this.x > this.maxx){
					this.x = (this.maxx << 1) - this.x;
					this.dx = -this.dx;
					leftPlayer.points++;
					leftPlayer.drawPoints();
				}else if(this.x > this.maxx - paddleDepth){
					var padTop = rightPaddle.position().top;
					if(this.y > padTop - this.height && this.y < padTop + paddleLength){
						this.x = ((this.maxx - paddleDepth) << 1) - this.x;
						this.dx = -this.dx;
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
			setTimeout('ball.move()', this.frequency);
		}

		ball.initialize = function(){
			this.width = this.innerWidth();
			this.height = this.innerHeight();
			this.minx = this.miny = 0;
			this.maxx = gameArea.width - this.width;
			this.maxy = gameArea.height - this.height;
			this.setPos(this.maxx >> 1, this.maxy >> 1);
		}
	}
	</script>
</head>
<body>
	<div id="pageWrapper">
		<div id="pointWrapper">
			BLAH
			<div id="leftPoints">00</div>
			<div id="rightPoints">00</div>
		</div>
		<div id="gameArea">
			<div class="paddle" id="leftPaddle"></div>
			<div class="paddle" id="rightPaddle"></div>
			<div id="ball"></div>
		</div>
	</div>
	<div id="foo" style="width: 200px;background-color:#FFF;">
	</div>
</body>
</html>

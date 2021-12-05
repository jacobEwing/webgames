
/////////////////////////////////////////////////////////////////////////////////////////////
// 		the player
/////////////////////////////////////////////////////////////////////////////////////////////
var playerClass = function(game){
	this.level = 0;
	this.x = 0;
	this.newX = 0;
	this.angle = 0;
	this.ballSpeed = game.defaultBallSpeed;
	this.launchFrequency = Math.floor(game.minBallRadius * 10);
	this.score = 0;
	this.scoreIncrement = 1;
	this.game = game;
};

playerClass.prototype.fire = function(){
	game.state = 'launching';
	this.launchBalls();
}

playerClass.prototype.launchBalls = function(){
	var idx = 0;
	var me = this;

	game.state = 'balls moving';
	player.scoreIncrement = 1;
	var launch = function(){
		var ball = this.game.balls[idx++];

		if(ball.temporary){
			return;
		}
		// set the ball's position to that of the player
		ball.position = {
			x : this.x,
			y : game.gridScale * (game.gridSize.y - .5)
		};
		// set its velocity correctly
		ball.velocity = {
			dx : Math.sin(this.angle) * this.ballSpeed,
			dy : -Math.cos(this.angle) * this.ballSpeed
		}
		ball.moving = true;
		// stop after looping through all the balls
		if(idx < this.game.balls.length){
			setTimeout(function(){launch.call(me);}, this.launchFrequency);
		}
	};
	launch.call(this);
};

playerClass.prototype.takeTurn = function(){
	var me = this;
	var mouseState = 0;

	var handleMouseDown = function(e){
		mouseState = 1;

	}

	var handleMouseUp = function(e){
		if(mouseState == 1){
			game.canvas.removeEventListener('mousemove', handleMouseTargeting);
			game.canvas.removeEventListener('mouseup', handleMouseUp);
			game.canvas.removeEventListener('mousedown', handleMouseDown);
			me.angle = rel_ang(me.x, game.gridSize.y * game.gridScale, e.offsetX, e.offsetY);
			me.scrubAimingAngle();
			me.fire();
		}
		mouseState = 0;
	};

	game.canvas.addEventListener('mousemove', handleMouseTargeting);
	game.canvas.addEventListener('mousedown', handleMouseDown);
	game.canvas.addEventListener('mouseup', handleMouseUp);
};

playerClass.prototype.aim = function(targetX, targetY){
	this.angle = rel_ang(this.x, game.gridSize.y * game.gridScale, targetX, targetY);
	this.scrubAimingAngle();
};

playerClass.prototype.scrubAimingAngle = function(){
	if(this.angle > game.minAngle && this.angle < Math.PI) this.angle = game.minAngle;
	if(this.angle < game.maxAngle && this.angle > Math.PI) this.angle = game.maxAngle;
};



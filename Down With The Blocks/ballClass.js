/////////////////////////////////////////////////////////////////////////////////////////////
// 		the ball
/////////////////////////////////////////////////////////////////////////////////////////////
var ballClass = function(){
	this.position = {x: 0, y : 0};
	this.velocity = {dx: 0, dy : 0};
	this.radius = game.minBallRadius + Math.random() * game.minBallRadius ;
	this.moving = false;
	this.colour = {};
	this.pickAColour();
	this.temporary = false;

	// balls can now rotate as they fly, but for the default ball type, that shouldn't happen
	this.angle = 0;//Math.random() * 2 * Math.PI;
	this.angi = Math.random() < 0.5 ? -.1 : .1;

	// stepTally is used for counting ratios in using Bresenham's line algorithm to trace ball motion.
	// we need it to be consistent with the object for accuracy.  If it's set to zero with each call
	// to the ball's move function, then it becomes slightly inaccurate, making the aim often inaccurate
	// by several pixels.
	this.stepTally = 0;

	// used to avoid getting stuck in the same block bouncing back and forth.
	this.alreadyHit = {};

};

ballClass.prototype.pickAColour = function(){
	this.colour = {
		red : 64 + Math.floor(Math.random() * 128),
		green : 128 + Math.floor(Math.random() * 129),
		blue : 192 + Math.floor(Math.random() * 64)
	};
}

ballClass.prototype.draw = function(){
	if(this.velocity.dy == 0 && this.velocity.dx == 0) return;

	var radius = game.gridScale * this.radius * game.ballRadiusScale;
	var colour = 'rgb(' + this.colour.red + ', ' + this.colour.green + ', ' + this.colour.blue + ')';
	var brightColour = 'rgba(' + brightenByte(this.colour.red) + ', ' + brightenByte(this.colour.green) + ', ' + brightenByte(this.colour.blue) + ')';
	var darkColour = 'rgba(' + darkenByte(this.colour.red) + ', ' + darkenByte(this.colour.green) + ', ' + darkenByte(this.colour.blue) + ')';
	var brightest = 'rgba(255, 255, 255, 0.6)';
	var sqrtRad = Math.floor(Math.sqrt(2 * radius * radius));
	context.save()
		context.translate(this.position.x, this.position.y);
		//context.rotate(this.angle);
		// first draw the circle
		context.fillStyle = colour;
		context.beginPath();
		context.arc(0, 0, radius, 0, 2 * Math.PI);
		context.fill();
		context.closePath();

		// shade it on the top left
		context.fillStyle = brightColour;
		context.beginPath();
		context.arc(0, 0, radius, 3 * Math.PI / 4, 7 * Math.PI / 4);
		context.bezierCurveTo(0,  -radius / 3,  -radius / 3, 0,  -sqrtRad / 2, sqrtRad / 2);
		context.closePath();
		context.fill();

		// and on the bottom right
		context.fillStyle = darkColour;
		context.beginPath();
		context.arc(0, 0, radius, -Math.PI / 4, 3 * Math.PI / 4);
		context.bezierCurveTo(0, radius, radius, 0, sqrtRad / 2, -sqrtRad / 2);
		context.closePath();
		context.fill();

		// shade it on the top left
		context.fillStyle = brightest;
		context.beginPath();
		context.arc(0, 0, radius, 3 * Math.PI / 4, 7 * Math.PI / 4);
		context.bezierCurveTo(0, -radius, -radius, 0,  -sqrtRad / 2, sqrtRad / 2);
		context.closePath();
		context.fill();

	context.restore();
};

ballClass.prototype.hitBlock = function(block){
	var n, x, y;
	block.hit(1, this);

}

ballClass.prototype.move = function(){
	var xResolution = game.gridScale * game.gridSize.x;
	var yResolution = game.gridScale * game.gridSize.y;


	var radius = game.gridScale * this.radius * game.ballRadiusScale;
	var sgndx = Math.sign(this.velocity.dx);
	var sgndy = Math.sign(this.velocity.dy);
	var absdx = Math.abs(this.velocity.dx);
	var absdy = Math.abs(this.velocity.dy);
	var n;
	var minDY = game.gridScale / 10;
	if(minDY < 1) minDY = 1;


	var testBlockCollision = function(){
		// we're defining this function locally because we need access to the same variables.
		var n, center;
		var xdist, ydist;
		var halfWidth = game.gridScale >> 1;
		var cornerRadius = game.gridScale >> 2;

		// Instead of looping through game.blocks, we instead need to loop through a
		// clone of that array.  Without doing so, we can run into cases where
		// game.blocks can get spliced as a block is destroyed, but the index continues
		// onward, failing to test the next block in the array.  Instead, we'll
		// duplicate the array here, which points to the same objects and keeps them at
		// the same array indices, and is destroyed at the end, giving us a consistent
		// list of block objects while the master list is edited.
		var testBlocks = [];
		for(n = 0; n < game.blocks.length; n++){
			testBlocks[n] = game.blocks[n];
		}

		for(n = 0; n < testBlocks.length; n++){
			center = testBlocks[n].centerPoint();
			xdist = Math.abs(center.x - this.position.x) - radius;
			if(xdist < halfWidth){
				ydist = Math.abs(center.y - this.position.y) - radius;
				if(ydist < halfWidth){	
					if(this.alreadyHit[n] != undefined){
						continue;
					}
					this.alreadyHit[n] = 1;
					playSound('blockHit');
					if(Math.abs(xdist - ydist) < cornerRadius){
						var speed = distance(this.velocity.dx, this.velocity.dy);
						var dx = this.position.x - center.x;
						var dy = this.position.y - center.y;
						var unitLength = Math.sqrt(dx * dx + dy * dy);
						this.velocity = {
							dx : speed * dx / unitLength,
							dy : speed * dy / unitLength
						}
						this.angi *= -1

					}else{
						// we're hitting a side, so we'll just negate the velocity on that axis
						if(xdist >= ydist){
							sgndx *= -1;
							this.velocity.dx *= -1;
							this.position.x += 2 * sgndx;
							this.angi *= -1;
						}

						if(ydist >= xdist){
							sgndy *= -1;
							this.velocity.dy *= -1;
							this.position.y += 2 * sgndy;
							this.angi *= -1
						}
					}
					this.hitBlock(testBlocks[n]);

				}else if(this.alreadyHit[n] != undefined){
					this.alreadyHit[n] = undefined;
				}
			}else if(this.alreadyHit[n] != undefined){
				this.alreadyHit[n] = undefined;
			}
		}
	}
	/*
		Here we'll use Bresenham's line algorithm to trace the balls'
		movements, allowing us to accurately bounce off the edges.
	*/

	if(absdx > absdy){
		for(n = 0; n < absdx; n++){
			this.position.x += sgndx;
			if(
			   (this.position.x < radius && this.velocity.dx < 0) ||
			   (this.position.x >= xResolution - radius && this.velocity.dx > 0)
			){
				playSound('thud');
				sgndx *= -1;
				this.velocity.dx *= -1;
				this.position.x += 2 * sgndx;
				this.angi *= -1;
				if(Math.abs(this.velocity.dy) < 1){
					this.velocity.dy += 1 * (Math.random() < .5 ? 1 : -1);
				}
			}


			this.stepTally += absdy;
			if(this.stepTally > absdx){
				this.position.y += sgndy;
				if(this.position.y < radius){
					playSound('thud');
					sgndy *= -1;
					this.velocity.dy *= -1;
					this.position.y += 2 * sgndy;
					this.angi *= -1;
				}
				if(this.position.y >= yResolution + radius){ // +radius to let it go off bottom
					this.velocity.dy = 0;
					this.velocity.dx = 0;
					player.newX = this.position.x;
				}
				this.stepTally -= absdx;
			}
			testBlockCollision.call(this);
		}
	}else{
		for(n = 0; n < absdy; n++){
			this.position.y += sgndy;
			if(this.position.y < radius){
				playSound('thud');
				sgndy *= -1;
				this.velocity.dy *= -1;
				this.position.y += 2 * sgndy;
				this.angi *= -1
			}

			if(this.position.y >= yResolution + radius){ // +radius to let it go off bottom
				this.velocity.dy = 0;
				this.velocity.dx = 0;
				player.newX = this.position.x;
			}

			this.stepTally += absdx;
			if(this.stepTally > absdy){
				this.position.x += sgndx;
				if(
				   (this.position.x < radius && this.velocity.dx < 0) ||
				   (this.position.x >= xResolution - radius && this.velocity.dx > 0)
				){
					playSound('thud');
					sgndx *= -1;
					this.velocity.dx *= -1;
					this.position.x += 2 * sgndx;
					this.angi *= -1;
				}
				this.stepTally -= absdy;
			}
			testBlockCollision.call(this);
		}

	}
	this.angle += this.angi;

};


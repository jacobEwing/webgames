/////////////////////////////////////////////////////////////////////////////////////////////
//		The blocks
/////////////////////////////////////////////////////////////////////////////////////////////
var blockClass = function(strength){
	if(strength == undefined) strength = 1;
	this.originalStrength = strength
	this.strength = strength;
	this.offset = {
		x : 0,
		y : 0
	};
	this.position = {
		x : 0,
		y : 0
	};
	this.rgb = {
		red : 0, green : 0, blue : 0
	};
	this.pickAColour();

	this.realX = function(){
		return this.position.x * game.gridScale;
	};

	this.realY = function(){
		return this.position.y * game.gridScale;
	};

	this.hasBonus = false;
	this.isBonus = false;
	this.bonusType = null;
	this.isTemporay = false;
	// a weird one-off for animating game.blocks that have a bonus ready to go
	this.starAngle = Math.random() * Math.PI;
};

blockClass.prototype.centerPoint = function(){
	return {
		x : Math.floor((this.position.x + .5 + this.offset.x) * game.gridScale),
		y : Math.floor((this.position.y + .5 + this.offset.y) * game.gridScale)
	};
}

blockClass.prototype.draw = function(x, y){
	var fontColour = 'rgba(' + (this.rgb.red >> 1) + ', ' + (this.rgb.green >> 1) + ', ' + (this.rgb.blue >> 1) + ', 1)';
	var shadeColour = 'rgba(255, 255, 255, .6)';
	var halfblock = game.gridScale >> 1;
	if(x == undefined) x = this.realX();
	if(y == undefined) y = this.realY();
	context.save();
		drawNiceBox(x + this.offset.x * game.gridScale, y + this.offset.y * game.gridScale, game.gridScale, game.gridScale, this.rgb);

		// for some reason the translation done in drawNiceBox isn't
		// reverted on restore.  I don't know why, as I do have it being
		// saved and restored before the translation.  This works
		// though, so barring further incident I guess it'll do.
//		context.translate(x + halfblock + this.offset.x * game.gridScale, y + halfblock + this.offset.y * game.gridScale);
		context.translate(this.offset.x * game.gridScale, this.offset.y * game.gridScale);


		if(this.hasBonus){
			// if this block has a bonus waiting inside, we add a texas star under the number
			this.starAngle += .15
			texasStar(
				x + 3 * halfblock / 2,
				y + 3 * halfblock / 2, 
				halfblock * Math.abs(Math.sin(1 + this.starAngle)/ 3) + .3, 
				this.starAngle
			);
			texasStar(
				x + halfblock,
				y + halfblock / 2,
				halfblock * Math.abs(Math.sin(this.starAngle)/ 3) + .3,
				this.starAngle + 2
			);
			texasStar(
				x + halfblock / 2,
				y + halfblock,
				halfblock * Math.abs(Math.cos(this.starAngle)/ 3) + .3,
				this.starAngle + 1
			);
		}else if(this.isBonus){
			this.starAngle += .15
			context.save();
				switch(this.bonusType){
					case 'bomb':
						context.translate(x + halfblock + Math.sin(this.starAngle) * halfblock / 4, y + halfblock);
						context.rotate(Math.sin(this.starAngle));
						context.scale(0.9, 0.9);
						drawShape('bomb', context);
						fontColour = 'rgba(48, 48, 48, 1)';
						shadeColour = 'rgba(96, 96, 96, 1)';
						break;
					case 'faster':
						context.translate(x + halfblock + Math.sin(this.starAngle) * halfblock / 4, y + halfblock);
						context.scale(0.9, 0.9);
						drawShape('faster', context, this.rgb);
						fontColour = 'rgba(48, 48, 48, 1)';
						shadeColour = 'rgba(96, 96, 96, 1)';
						break;
				}

				//texasStar(x + halfblock, y + halfblock, halfblock * .8, this.starAngle, 0.4);
			context.restore();
			
		}

		// add some text
		context.textAlign = 'center';
		var fontSize = Math.floor(game.gridScale /  (1 + log10(this.strength) / 2));
		context.font = fontSize + "px PoorStory";

		context.fillStyle = shadeColour;
		context.fillText(this.strength, x + halfblock + game.textShadowOffset, y + halfblock + game.textShadowOffset + fontSize / 3);

		context.fillStyle = fontColour;//'rgba(0, 0, 0, 1)';
		context.fillText(this.strength, x + halfblock, y + halfblock + fontSize / 3);

	context.restore();



};

// select which type of bonus this block is carrying
blockClass.prototype.pickABonus = function(){
	this.hasBonus = true;

	var chance = Math.random();
	if(chance < 0.5){
		this.bonusType = 'bomb';
	}else{
		this.bonusType = 'faster';
	}
}

// sets the colour for this block.
blockClass.prototype.pickAColour = function(){
	var ratio, colourSum;
	this.rgb = {
		red : 128 + Math.floor(Math.random() * 128),
		green : 128 + Math.floor(Math.random() * 128),
		blue : 128 + Math.floor(Math.random() * 128)
	};

	this.negative = 'rgb(' + (this.rgb.red >> 2) + ', ' + (this.rgb.green >> 2) + ', ' + (this.rgb.blue >> 2) + ')';
	this.colour = 'rgb(' + this.rgb.red + ', ' + this.rgb.green + ', ' + this.rgb.blue + ')';
}

// impact the block with a ball
blockClass.prototype.hit = function(strength, ball){
	this.strength -= strength;
	if(this.strength <= 0){
		if(this.hasBonus){
			this.strength = this.originalStrength;
			this.hasBonus = false;
			this.isBonus = true;
		}else if(this.isBonus !== false){
			switch(this.bonusType){	
				case 'bomb':
					this.bombBonus(ball);
					break;
				case 'faster':
					this.speedBonus();
					break;
			}
			blockClass.removeBlock(this);
		}else{
			blockClass.removeBlock(this);
			player.score += player.scoreIncrement;
			player.scoreIncrement ++;
		}
	}else{
		player.score++;
	}
}

blockClass.prototype.speedBonus = function(){
	player.ballSpeed += .05;
	player.launchFrequency *= .95;
	
}

blockClass.prototype.bombBonus = function(ball){
	player.scoreIncrement += this.originalStrength;
	player.score += player.scoreIncrement;
/*
	// add a bonus 
	var bonus = new bonusClass((this.position.x + .5) * game.gridScale, (this.position.y + .5) * game.gridScale);
	game.bonuses[game.bonuses.length] = bonus;
	blockClass.removeBlock(this);
*/
	var numchunks = 18, ang, n;
	for(n = 0; n < numchunks; n++){
		ang = n * 2 * Math.PI / numchunks;

		game.addBall({
			position : {
				x : (this.position.x + .5) * game.gridScale,
				y : (this.position.y + .5) * game.gridScale
			},
			velocity : {
				dx : Math.sin(ang) * player.ballSpeed,
				dy : Math.cos(ang) * player.ballSpeed
			},
			colour : {
				red : 64,
				green : 64,
				blue : 64
			},
			temporary : true,
			//powerUp : 'temporary',
			radius : game.minBallRadius,
			moving : true
		});
	}
}

// delete a block
blockClass.removeBlock = function(block){
	for(var idx = 0; idx < game.blocks.length; idx++){
		if(game.blocks[idx] == block){
			game.blocks.splice(idx, 1);
			break;
		}
	}
}

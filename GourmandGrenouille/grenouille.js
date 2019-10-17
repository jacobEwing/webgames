var scoring = {
	'fly' : 0,
	'junk' : 0,
	'fish' : 0,
	'boat' : 0
};
var dContext;
var grassSprite = [], grassTemplate;
var frog, frogTemplate;
var numBlades = 60;
var grassAngle = 0;
var xResolution = 800, yResolution = 600;
var waterImage, waterAng = 0;
var waterBaseline = 380, waterBaselineAng = 0;
var startingBoatChance = 1000;
var waterLevel;
var gameCanvas;
var mousePos;
var fly = [], numFlies = 0, flyTemplate, startingFlies = 10, maxFlies = 25, caughtFly = null;
var junk = [], numJunks = 0, junkTemplate, junkSprite, caughtJunk = null;
var fish = [], numFish = 0, fishTemplate, caughtFish = null;
var boat = null, caughtBoat = null, boatChance = startingBoatChance;
var cloud = [], numClouds = 0;
var cloudClass = function(randomX){
	this.position = {x:0,y:0};
	this.points = [];
	this.generate(randomX);
};

cloudClass.prototype.generate = function(randomX){
	this.numPoints = 3 * (5 + 2 * Math.floor(Math.random() * 3));
	var radius = Math.random() * 150 + 10;
	var ang = Math.random() * 2 * Math.PI;
	var angi = 2 * Math.PI / this.numPoints;
	var n;
	if(randomX != undefined){
		this.position.x = Math.random() * 800;
		this.speed = Math.random() < 0.5 ? -1 : 1;
	}else if(Math.random() < 0.5){
		this.position.x = -radius * 1.2;
		this.speed = 1;
	}else{
		this.position.x = 800 + radius * 1.2;
		this.speed = -1;
	}
	this.position.y = 300 - (radius - 10) / 150 * 300
	this.speed *= (300 - this.position.y + 1) / 300;
	this.radius = 1.2 * radius;

	for(n = 0; n < this.numPoints; n += 3){
		var angOffset = Math.random() * 0.25 - .125;
		this.points[n] = {x : Math.sin(ang + angOffset) * radius, y : Math.cos(ang + angOffset) * radius * .3};
		ang += angi * .5;
		this.points[n + 1] = {x : Math.sin(ang) * radius * 1.2, y : Math.cos(ang) * radius * .6};
		ang += angi * 2;
		this.points[n + 2] = {x : Math.sin(ang - angOffset) * radius * 1.2, y : Math.cos(ang - angOffset) * radius * .6};
		ang += angi * .5;
	}
};

cloudClass.prototype.draw = function(){
	var n;
	dContext.beginPath();
	dContext.fillStyle = "rgba(255, 255, 255, .5)";
	dContext.strokeStyle = "rgba(200, 200, 225, .3)";
	dContext.moveTo(this.position.x + this.points[0].x, this.position.y + this.points[0].y);
	for(n = 0; n < this.numPoints; n += 3){
		dContext.bezierCurveTo(
			this.position.x + this.points[n + 1].x, this.position.y + this.points[n + 1].y,
			this.position.x + this.points[n + 2].x, this.position.y + this.points[n + 2].y,
			this.position.x + this.points[(n + 3) % this.numPoints].x, this.position.y + this.points[(n + 3) % this.numPoints].y
		);
		//140, 10, 388, 10, 388, 170);
	}
	dContext.stroke();
	dContext.fill();

}

cloudClass.prototype.move = function(){
	this.position.x += this.speed;
}

var boatClass = function(){
	this.sprite = new cSprite(junkTemplate);
	this.sprite.setFrame('boat');
	if(Math.random() < 0.5){
		this.speed = -2;
		this.x = 835;
	}else{
		this.speed = 2;
		this.x = -35;
	}
};

boatClass.prototype.move = function(){
	this.x += this.speed;
	if(!caughtBoat){
		this.position = {
			x : 20 * Math.cos(waterAng) + this.x,
			y : waterLevel + 35 + 10 * Math.abs(Math.sin(waterAng))
		}
	}
};

boatClass.prototype.draw = function(){
	this.sprite.position = this.position;
	this.sprite.angle = Math.sin(waterAng) / 10;
	this.sprite.draw(dContext);
};


var fishClass = function(){
	this.position = {x : 0, y : 425 + Math.random() * 130};
	this.sprite = new cSprite(fishTemplate);
	if(Math.random() < 0.5){
		this.direction = 'left'
		this.position.x = 835;
	}else{
		this.direction = 'right'
		this.position.x = -35;
	}

	this.colour = Math.random() < 0.5 ? 'green' : 'orange';
	this.sprite.scale = 1 - Math.random() * 0.5;
	this.speed = this.sprite.scale * 5 * (this.direction == 'left' ? -1 : 1);
	this.sprite.startSequence(this.colour + '_' + this.direction);

	this.angle = 0;
};

fishClass.prototype.move = function(){
	this.position.x += this.speed;
	this.angle += 0.75;
};

fishClass.prototype.draw = function(){
	this.sprite.position = this.position;
	this.sprite.angle = 0.02 * Math.sin(this.angle);
	this.sprite.draw(dContext);
};

var flyClass = function(){
	this.position = {x : 0, y : 0};
	this.sprite = new cSprite(flyTemplate);
	this.frameIndex = Math.floor(Math.random() * 2);
	this.angle = Math.random() * 6.2831853;
	this.angi = 0.05 + Math.random() * 0.025;
	if(Math.random() < 0.5) this.angi *= -1;
	this.mode = 'flying';
	this.velocity = {x : 0, y : 0}
	this.velocityRadius = {x : Math.random() * 8 + 4, y : Math.random() * 4 + 4};
	this.startTimeout = 0;
};

flyClass.prototype.draw = function(){
	this.sprite.setFrame(this.frameIndex);
	this.frameIndex = 1 - this.frameIndex;
	this.sprite.position = this.position;
	this.sprite.angle = rel_ang(0, 0, this.velocity.x, this.velocity.y);
	this.sprite.draw(dContext);
};

flyClass.prototype.move = function(){
	if(this.mode != 'flying') return;
	if(this.startTimeout == 0){
		this.angle += this.angi;
	}else{
		this.startTimeout --;
	}
	this.velocity = {x : this.velocityRadius.x * Math.sin(this.angle), y : this.velocityRadius.y * Math.cos(this.angle * 3 + Math.random() / 5.)};

	this.position.x += this.velocity.x;
	this.position.y += this.velocity.y;
};

var junkClass = function(type){
	this.position = {x : 0, y : 500};
	this.speed = Math.random() * 2 + 1;
	if(Math.random() < 0.5){
		this.speed *= -1;
		this.position.x = 800;
	}
	this.floatAngle = Math.random() * 2 * Math.PI;
	this.rotAngle = 0;
	this.rotRange = {'can' : 0.25, 'boot' : 0.05}[type];
	this.type = type;
	this.drawScale = 1.0;

	this.size = {'width' : junkTemplate.frames[type].width, 'height' : junkTemplate.frames[type].height};
	this.center = {'x' :  junkTemplate.frames[type].centerx, 'y' : junkTemplate.frames[type].centery };
	this.yOffset = 0;
};

junkClass.prototype.move = function(){
	var dx = this.speed + 3.5 * Math.sin(this.floatAngle);
	this.position.x += dx;
	this.position.y += Math.sin(this.floatAngle) / 5;
	this.floatAngle += 0.2;
	this.rotAngle += 0.3;
};

junkClass.prototype.draw = function(){
	junkSprite.setFrame(this.type);
	this.yOffset = Math.abs(Math.sin(this.floatAngle)) * 6;
	junkSprite.position = {x : this.position.x, y: this.position.y + this.yOffset};
	junkSprite.angle = this.rotRange * Math.cos(this.rotAngle);
	junkSprite.draw(dContext, {'scale': this.drawScale});
};

function addFly(x, y){
	fly[numFlies] = new flyClass();
	if(x == undefined){
		if(Math.random() < 0.33333){
			fly[numFlies].position = {'x' : 800, 'y' : 100 + Math.random() * 200};
			fly[numFlies].angle = 3.14159265 * 1.5;
			fly[numFlies].startTimeout = 50;
		}else if(Math.random() < 0.5){
			fly[numFlies].position = {'x' : 0, 'y' : 100 + Math.random() * 200};
			fly[numFlies].angle = 3.14159265 * 0.5;
			fly[numFlies].startTimeout = 50;
		}else{
			fly[numFlies].position = {'x' : 200 + Math.random() * 400, 'y' : 0};
			fly[numFlies].angle = (Math.random() - 0.5) * 0.25;
			fly[numFlies].startTimeout = 25 + Math.floor(Math.random() * 20);
			
		}

	}else{
		fly[numFlies].position = {'x' : x, 'y' : y};
	}
	numFlies ++;
}

function animate(){
	var n, currentBlade;
	grassAngle += 0.2;
	dContext.clearRect(0, 0, xResolution, yResolution);

	moveWater();

	moveClouds();
	drawClouds();

	// Half the grass blades get drawn before the the frog
	// and the other water items, and half after.
	for(currentBlade = 0; currentBlade < numBlades >> 1; currentBlade++){
		grassSprite[currentBlade].angle  = Math.cos(grassAngle + currentBlade / 10) / 10;
		grassSprite[currentBlade + numBlades].angle = Math.sin(grassAngle + currentBlade / 10) / 10;
		grassSprite[currentBlade].draw(dContext);
	}

	drawJunk();
	drawFish();

	for(; currentBlade < numBlades; currentBlade++){
		grassSprite[currentBlade].angle  = Math.cos(grassAngle + currentBlade / 10) / 10;
		grassSprite[currentBlade + numBlades].angle = Math.sin(grassAngle + currentBlade / 10) / 10;
		grassSprite[currentBlade].draw(dContext);
	}

	drawBackWater();
	if(boat == null){
		if(boatChance > 1){
			boatChance --;
		}
		if(Math.random() < 1 / boatChance){
			boat = new boatClass();
		}
	}else{
		boat.move();
		if((boat.position.x < -40 && boat.speed < 0) || (boat.position.x > 840 && boat.speed > 0)){
			boat = null;
			boatChance = startingBoatChance;
		}else{
			boat.draw();
		}
	}
	drawFrog();
	drawFrontWater();
	drawFlies();
}

function drawFish(){
	var n;
	if(Math.random() < 0.0005 * Math.sqrt(scoring['fly'])){
		fish[numFish] = new fishClass();
		numFish++;
	}
	for(n = 0; n < numFish; n++){
		fish[n].move();
		if((fish[n].direction == 'left' && fish[n].position.x < -20) || (fish[n].direction == 'right' && fish[n].position.x > 820)){
			fish.splice(n, 1);
			if(caughtFish > n) caughtFish--;
			n--;
			numFish--;
		}else{
			fish[n].draw();
		}
	}
}

function drawFlies(){
	var n;
	if(Math.random() < (1 / 35) - numFlies / (35 * (maxFlies + numFlies / 10))){
		addFly();
	}
	for(n = 0; n < numFlies; n++){
		fly[n].move();
		fly[n].draw();
	}
}

function drawJunk(){
	var n;
	if(numJunks == 0 && Math.random() < 0.0005 * Math.sqrt(scoring['fish'])){
		junk[numJunks] = new junkClass({0:'can', 1:'boot'}[Math.floor(Math.random() * 2)]);
		numJunks++;
	}
	for(n = 0; n < numJunks; n++){
		junk[n].move();

		if((junk[n].speed < 0 && junk[n].position.x < -50) || (junk[n].speed > 0 && junk[n].position.x > 850)){
			if(caughtJunk > n) caughtJunk--;
			junk.splice(n, 1);
			n--;
			numJunks--;
		}else{
			junk[n].draw();
		}
	}
}

function moveWater(){
	waterBaselineAng += 0.01;
	waterLevel = waterBaseline + 10 * Math.sin(waterBaselineAng);
	waterAng += 0.25;
	if(waterAng > 4 * Math.PI) waterAng -= 2 * Math.PI;
}

function drawBackWater(){
	dContext.save();
	dContext.translate(20 * Math.sin(waterAng) - 50, 10 * Math.abs(Math.cos(waterAng * 1.5)));
	dContext.drawImage(waterImage, 0, waterLevel);
	dContext.drawImage(waterImage, 480, waterLevel);
	dContext.restore();
}

function drawFrontWater(){
	dContext.save();
	dContext.translate(20 * Math.cos(waterAng) - 115, 10 * Math.abs(Math.sin(waterAng)));
	dContext.drawImage(waterImage, 0, waterLevel);
	dContext.drawImage(waterImage, 480, waterLevel);
	dContext.restore();
}


drawFrog = function(){
	var n;
	frog.draw(dContext);
	dContext.fillStyle = 'black';
	dContext.beginPath();
	for(n in frog.eye){
		dContext.arc(frog.position.x + frog.eye[n].x + frog.eyeOffset.x, frog.position.y + frog.eye[n].y + frog.eyeOffset.y, 2, 0, 2 * Math.PI, false);
	}
	dContext.closePath();
	dContext.fill();

	if(frog.frameName == 1){
		frog.setFrame(0);
	}

	switch(frog.action){
		case 'launchTongue':
			var dx, dy;
			var x1, y1, x2, y2;
			frog.drawTongue(frog.tongueTarget.x, frog.tongueTarget.y);
			frog.action = 'retractTongue';
			for(n = 0; n < numFlies && caughtFly == null; n++){
				dx = frog.tongueTarget.x - fly[n].position.x - 12;
				dy = frog.tongueTarget.y - fly[n].position.y - 10;
				if(dx * dx + dy * dy < 625){
					caughtFly = n;
					break;
				}
			}

			if(!caughtFly && boat != null){
				x1 = boat.sprite.position.x - boat.sprite.frame.centerx;
				y1 = boat.sprite.position.y - boat.sprite.frame.centery + 20;
				x2 = x1 + boat.sprite.frame.width;
				y2 = y1 + boat.sprite.frame.height - 20;
				if(frog.tongueTarget.x > x1
				   && frog.tongueTarget.x < x2
				   && frog.tongueTarget.y > y1
				   && frog.tongueTarget.y < y2
				){
					caughtBoat = true;
					break;
				}
			}

			if(!caughtFly && !caughtBoat){
				for(n = 0; n < numFish; n++){
					var s = fish[n].sprite.scale;
					x1 = fish[n].position.x - fish[n].sprite.frame.centerx * s;
					y1 = fish[n].position.y - fish[n].sprite.frame.centery * s;
					x2 = x1 + fish[n].sprite.frame.width * s;
					y2 = y1 + fish[n].sprite.frame.height * s;
					if(frog.tongueTarget.x > x1
					   && frog.tongueTarget.x < x2
					   && frog.tongueTarget.y > y1
					   && frog.tongueTarget.y < y2
					){
						caughtFish = n;
						break;
					}
				}
			}

			if(!caughtFly && !caughtBoat && !caughtFish){
				for(n = 0; n < numJunks; n++){
					x1 = junk[n].position.x - junk[n].center.x;
					y1 = junk[n].position.y - junk[n].center.y + junk[n].yOffset;
					x2 = x1 + junk[n].size.width;
					y2 = y1 + junk[n].size.height;

					if(frog.tongueTarget.x > x1
					   && frog.tongueTarget.x < x2
					   && frog.tongueTarget.y > y1
					   && frog.tongueTarget.y < y2
					){
						caughtJunk = n;
						break;
					}
				}
			}

			break;
		case 'retractTongue':
			var dx = (frog.tongueTarget.x - frog.tonguePos.x) * 0.5 + Math.random() * 10;
			var dy = (frog.tongueTarget.y - frog.tonguePos.y) * 0.5 + Math.random() * 10;
			if(Math.abs(dx) < 16 && Math.abs(dy) < 16){
				frog.action = null;
				frog.setFrame(1);
				if(caughtFly != null){
					fly.splice(caughtFly, 1);
					caughtFly = null;
					numFlies--;
					addToScore('fly');
				}

				if(caughtBoat != null){
					caughtBoat = null;
					boat = null;
					addToScore('boat');
					boatChance = startingBoatChance;
				}

				if(caughtFish != null){
					fish[caughtFish] = null;
					fish.splice(caughtFish, 1);
					caughtFish = null;
					numFish--;
					addToScore('fish');
				}

				if(caughtJunk != null){
					junk.splice(caughtJunk, 1);
					caughtJunk = null;
					numJunks--;
					addToScore('junk');
				}
			}else{
				frog.tongueTarget.x = frog.tonguePos.x + dx;
				frog.tongueTarget.y = frog.tonguePos.y + dy;
				frog.drawTongue(frog.tongueTarget.x, frog.tongueTarget.y);
				if(caughtFly != null){
					fly[caughtFly].position = frog.tongueTarget;
				}
				if(caughtBoat != null){
					boat.position = frog.tongueTarget;
					boat.sprite.scale *= .8;
				}
				if(caughtFish != null){
					fish[caughtFish].sprite.scale *= .8;
					fish[caughtFish].position = frog.tongueTarget;
				}
				if(caughtJunk != null){
					junk[caughtJunk].drawScale *= .8;
					junk[caughtJunk].position = frog.tongueTarget;
				}
			}
			break;
	}
}

function drawClouds(){
	var n;
	for(n = 0; n < numClouds; n++){
		cloud[n].draw();
	}
}

function moveClouds(){
	var n;
	for(n = 0; n < numClouds; n++){
		cloud[n].move();
		if((cloud[n].position.x < -cloud[n].radius && cloud[n].speed < 0) || (cloud[n].position.x > 800 + cloud[n].radius && cloud[n].speed > 0)){
			cloud[n] = new cloudClass();
		}
	}
}


function addToScore(food){
	scoring[food]++;
	$('#score_' + food).html(scoring[food]);
	if(scoring[food] == 1) $('#scoreDiv_' + food).css('display', 'inline');
}

function rel_ang(x1, y1, x2, y2){
	var hyp, alpha, deltax, deltay;
	deltax = x2 - x1; 
	deltay = y2 - y1; 
	hyp = Math.sqrt(deltax * deltax + deltay * deltay);
	if(x2 == x1){
		if(y2 > y1){
			alpha = Math.PI;
		}else{
			alpha = 0;
		}

	}else if(y2 == y1){
		if(x2 < x1){
			alpha = 3 * Math.PI / 4; 
		}else{
			alpha = Math.PI / 2;
		}
	}else if(x2 > x1){
		if(y2 < y1){
			alpha = Math.PI - Math.acos(deltay / hyp);
		}else if(y2 > y1){
			alpha = Math.PI - Math.acos(deltay / hyp); 
		}else{
			alpha = 0;
		}
	}else if(x2 < x1){
		if(y2 < y1){
			alpha = 2 * Math.PI - Math.acos(-deltay / hyp);
		}else if(y2 > y1){
			alpha = 2 * Math.PI - Math.acos(-deltay / hyp); 
		}else{
			alpha = 0;
		}
	}   

	return alpha;
}

$(document).ready(function(){
	gameCanvas = document.getElementById('gameCanvas');
	dContext = gameCanvas.getContext('2d');
	numClouds = 20;
	for(var n = 0; n < numClouds; n++){
		cloud[n] = new cloudClass(true);
	}

	grassTemplate = new spriteTemplate('grass.sprite', function(){
		var y = 600;
		for(var n = 0; n < numBlades; n++){
			grassSprite[n + numBlades] = new cSprite(grassTemplate);
			grassSprite[n + numBlades].setFrame('tip');
			grassSprite[n + numBlades].position.x = 6;
			grassSprite[n + numBlades].position.y = 6;

			grassSprite[n] = new cSprite(grassTemplate);
			grassSprite[n].angle = 0;
			grassSprite[n].scale = 0.8 + Math.random() * 0.2;

			grassSprite[n].position.x = Math.random() * 800;
			grassSprite[n].position.y = y;

			grassSprite[n].setFrame('blade');
			grassSprite[n].attach(grassSprite[n + numBlades]);
			grassSprite[n].zIndex = -5;
		}
		
		initialize();
	});
});

function initialize(){
	var mound = new Image();
	mound.onload = loadWater;
	mound.src = 'mound.png';
}

function loadWater(){
	waterImage = new Image();
	waterImage.onload = function(){
		loadFrog();
	}
	waterImage.src = 'water.png';
}

function loadFrog(){
	frogTemplate = new spriteTemplate('frog.sprite', function(){
		frog = new cSprite(frogTemplate);
		frog.setFrame(0);
		frog.position = {x:400, y:328};
		frog.eye = [
			{x : 12.5, y: 5 },
			{x : 26, y: 5 }
		];
		frog.tongueTarget = {x : 0, y : 0};
		frog.eyeOffset = {x : 0, y : 0};
		frog.action = null;
		frog.tonguePos = {x : frog.position.x + 19, y : frog.position.y + 16};

		frog.launchTongue = function(){
			this.tongueTarget = {x : mousePos.x, y : mousePos.y};
			this.action = 'launchTongue';
		}

		frog.drawTongue = function(tx, ty){
			dContext.save();
			dContext.lineCap = 'round';
			dContext.beginPath();
			dContext.lineWidth = 4;
			dContext.strokeStyle = 'rgba(255, 80, 80, 0.8)';//'#C55';
			dContext.moveTo(this.tonguePos.x, this.tonguePos.y);
			dContext.lineTo(tx, ty);
			dContext.stroke();
			dContext.restore();

		}
		loadFish();
	});
}

function loadFish(){
	fishTemplate = new spriteTemplate('fish.sprite', function(){
		loadJunk();
	});
}


function loadJunk(){
	junkTemplate = new spriteTemplate('junk.sprite', function(){
		junkSprite = new cSprite(junkTemplate);
		loadFly();
	});
}

function loadFly(){
	flyTemplate = new spriteTemplate('flies.sprite', function(){
		startGame();
	});
}

function startGame(){
	var n;
	setInterval(animate, 50);

	gameCanvas.onmousemove = function(evt){

		mousePos = {
			x : evt.pageX - $('#gameCanvas').offset().left,
			y : evt.pageY - $('#gameCanvas').offset().top
		};
		var dx = mousePos.x - frog.position.x - 20;
		var dy = mousePos.y - frog.position.y - 6;

		var maxRadius = 266;
		var hyp = dx * dx + dy * dy;
		if(hyp > maxRadius * maxRadius){
			hyp = Math.sqrt(hyp);
			dx *= maxRadius / hyp;
			dy *= maxRadius / hyp;
		}
		frog.eyeOffset = {
			x : dx / maxRadius * 2.5,
			y : dy / maxRadius * 2.5
		};
	};

	// initialize the flies
	for(n = 0; n < startingFlies; n++){
		addFly(Math.random() * 500 + 150, Math.random() * 200 + 50);
	}

	$(gameCanvas).mousedown(function(){
		if(frog.action == null){
			frog.setFrame(2);
			frog.launchTongue();
		}
	});
	$('#bodyOverlay').fadeOut(500, function(){
		$('#bodyOverlay').css('display', 'none');
	});
}

function quit(){
	if(typeof exitFunc == "undefined"){
		history.go(-1);
	}else{
		exitFunc();
	}
}

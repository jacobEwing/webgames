var ANIMATION_FREQUENCY = 50;
var PLAY_WIDTH = 620;
var PLAY_HEIGHT = 620;
var MAX_LIVES = 6;
var MAX_LIFE = 200;
var LIFECELL_SPACING_X = 20;
var LIFECELL_TOP_Y = 392;
var BONUS_TOP_Y = 106;
var MINBONUSTIME = 15000 / ANIMATION_FREQUENCY;
var MAX_FROZEN_TIME = 300;

var bonusCells, bonusSprite;
var shipSprite, ship;
var shotSprite, shot, numShots, firing, shotCountdown = 0, electricActivated = false;
var aliens, numAliens, startingAliens, alienSprite, alienMotion, alienLife, alienSpeed;
var kamikazeChance, numKamikazes, maxKamikazes;
var level, gameInterval;
var bombSprite, bombId, bomb, maxBombs, bombSpeed, numBombs, bombChance;
var labels;
var shieldSprite, shield;
var highlightSprite, highlight;
var powerupSprite, powerup, powerupChance = 0, powerupCountdown = 0;
var numLives, life;
var explosion = [], numExplosions = 0;
var lightningDiv = null;
var currentLevel = 0;
var loadingFlags;
var mousePos = {};
var pauseBox, pauseButton, exitButton;
var doingAnimation = false;
var frozen = 0;
var score, scoreDiv, scoreDigits;

var gameState = 'loading';
var guns = {
	'normal' : {speed:8, delay: 8, energy: 10, powerNeeded: 12},
	'bfg' : {speed:8, delay: 12, energy: 100, powerNeeded: 24},
	'double' : {speed:8, delay: 8, energy: 10, powerNeeded: 15},
	'electric' : {speed:24, delay: 0, energy: 1, powerNeeded: 1.5},
	'fast' : {speed:8, delay: 3, energy: 6, powerNeeded: 4},
	'spread' : {speed:8, delay: 8, energy: 10, powerNeeded: 15}
};

var powerTypes = ['fast', 'double', 'spread', 'bfg', 'electric', 'life', 'shield', 'freeze'];

var lifeClass = function(){
	this.powerBar = null;
	this.power = 0;

	this.recharge = function(){
		if(this.power < MAX_LIFE){
			this.power++;
		}
	}

	this.buildElement = function(){
		var wrapper = $('<div></div>');
		wrapper.css({
			'width': '18px',
			'height':'124px',
			'position':'absolute'
		});
		var backdrop = $('<div></div>');
		backdrop.css({
			'position':'absolute',
			'width' : '10px',
			'height' : '116px',
			'top':'4px',
			'left':'4px',
			'background-color' : '#626262'
		});
		wrapper.append(backdrop);

		var image = $('<img src="images/lifebarframe.png"/>');
		image.css({
			'position':'absolute',
			'top':'0px',
			'left':'0px'
		});

		this.powerBar = $('<div></div>');
		this.powerBar.css({
			'width' : '10px',
			'height' : '116px',
			'position' : 'absolute',
			'top':'4px',
			'left':'4px',
			'background-color': '#0F0'
		});
		wrapper.append(this.powerBar);
		wrapper.append(image);
		return wrapper;
	}
	this.element = this.buildElement();

	this.changePower = function(delta){
		this.power += delta;
		if(this.power > MAX_LIFE) this.power = MAX_LIFE;
		if(this.power < 0) this.power = 0;
	}

	this.draw = function(index){
		var l = this.element.width();
		var w = $('#infoArea').width();
		var m = MAX_LIVES;
		var spacing = l + (w - m * l) / (m - 1);
		$('#infoArea').append(this.element);

		this.element.css({
			'position': 'absolute',
			'top' : LIFECELL_TOP_Y + 'px',
			'left' : index * spacing + 'px'
		});
	}

	this.update = function(){
		var red, green;
		var newHeight = Math.floor(116 * (this.power / MAX_LIFE));
		if(newHeight < 87){
			red = 255;
			green = Math.floor(255 * newHeight / 87);
		}else{
			green = 255;
			red = Math.floor(255 * (116 - newHeight) / 29);
		}
		var newTop = 4 + 116 - newHeight;
		this.powerBar.css({
			'height': newHeight + 'px',
			'top' : newTop + 'px',
			'background-color' : 'rgb(' + red + ',' + green + ',0)'
		});
	}
}

var shipClass = function(callback){
	if(callback == undefined) callback = function(){};
	this.initializing = 1; // a bit flag set for noting if all initialization activities are complete
	var me = this;
	this.gunOffset = 0;
	this.minx = 0;
	this.maxx = PLAY_WIDTH;
	this.miny = PLAY_HEIGHT - 180;
	this.maxy = PLAY_HEIGHT;
	this.yRange = this.maxy - this.miny;
	this.sprite = undefined;
	this.currentGun = 'normal';
	this.shieldStrength = 0;

	this.spriteSet = new spriteSet();
	this.draw = function(){}
	this.spriteSet.load('sprites/ship.sprite', function(result){
		me.sprite = new spriteClass(me.spriteSet);
		me.position(290, 500);
		me.initializing ^= 1;
		me.draw = function(target){
			me.sprite.draw(target);
		}
//		me.draw($('#playArea'));
		me.ready();
	});

	this.setGun = function(currentGun){
		if(guns[currentGun] != undefined){
			this.currentGun = gunName;
		}
	}

	this.ready = function(){
		if(this.initializing == 0){
			callback();
		}
	}

	this.position = function(x, y){	
		if(x != undefined && y != undefined){
			var ph = $('#playArea').height();
			y = this.miny + (y - 200) * (this.maxy - this.miny - 30) / (ph >> 1);
			this.oldx = this.x;
			this.oldy = this.y;
			if(x < this.minx) x = this.minx;
			if(x > this.maxx) x = this.maxx;
			if(y < this.miny) y = this.miny;
			if(y > this.maxy) y = this.maxy;
			this.x = x;
			this.y = y;
			this.sprite.position(this.x, this.y);
		}
		return {'x': this.x, 'y': this.y};
	}
}

function build_lives(){
	var n;
	life = []
	for(n = 0; n < MAX_LIVES; n++){
		life[n] = new lifeClass();
		life[n].draw(n);
		life[n].update();
	}
}

function setInitialLives(){
	var n;
	numLives = 3;
	for(n = 0; n < MAX_LIVES; n++){
		if(n < numLives) life[n].power = MAX_LIFE;
		life[n].update();
	}
}

function takeDamage(amount, reduceShield){
	if(ship.shieldStrength > 0 && reduceShield == true){
		ship.shieldStrength -= amount;
		if(ship.shieldStrength <= 0){
			shield.detach();
		}
	}else{
		life[numLives - 1].changePower(-amount);
		if(life[numLives - 1].power <= 0){
			numLives--;
			life[numLives].update();
		}
		if(numLives == 0){
			endGame();
		}else{
			life[numLives - 1].update();
		}
	}
}

function rechargeLife(){
	if(life[numLives - 1].power < MAX_LIFE){
		life[numLives - 1].power++;
		life[numLives - 1].update();
	}
}

function scroll(){
	backgroundOffset += 3;
	$('#playArea').css({
		'background-position' : '0px ' + backgroundOffset + 'px'
	});
}

/***********************************************************
Functions for handling bombs dropped by aliens
***********************************************************/

function launchBomb(){
	if(numBombs >= maxBombs || numAliens == 0) return;

	// let's launch us a bomb!
	var newPos = alien[Math.floor(Math.random() * numAliens)].position();
	bomb[numBombs] = new spriteClass(bombSprite);
	bomb[numBombs].position(newPos.left, newPos.top);
	bomb[numBombs].setFrame(bombId);
	bomb[numBombs].draw($('#playArea'));
	bomb[numBombs].strength = 5; // used only for delayed destruction with lightning bolt
	numBombs++;
}

function moveBombs(){
	var n;
	for(n = 0; n < numBombs; n++){
		if(bomb[n].y > PLAY_HEIGHT + bomb[n].centery){
			deleteBomb(n);
			n--;
		}else{
			bomb[n].move(0, bombSpeed);
		}
	}
}

function deleteBomb(n){
	bomb[n].remove();
	for(; n < numBombs - 1; n++){
		bomb[n] = bomb[n + 1];
	}
	bomb[n] = undefined;
	numBombs--;
}

/***********************************************************
Functions for handling aliens
***********************************************************/

function moveAliens(){
	var n, pos, checkFunc, switchDir = 0, motion, stillEntering = false, ratio = 1, state;
	if(alienState == 'entering'){
		motion = {x:0, y: 5};
	}else{
		motion = {x:alienMotion.x, y:alienMotion.y};
		if(frozen > 0){
			ratio = (MAX_FROZEN_TIME - (frozen << 1)) / MAX_FROZEN_TIME;
			if(ratio < 0) ratio = 0;
			frozen--;
			motion.x *= ratio;
			motion.y *= ratio;
		}
	}
	if(alienMotion.x > 0){
		checkFunc = function(x){
			if(x > $('#playArea').width() - (alienSprite.frameWidth >> 1)) switchDir = true;
		}
	}else{
		checkFunc = function(x){
			if(x < (alienSprite.frameWidth >> 1)) switchDir = true;
		}
	}
	for(n = 0; n < numAliens; n++){
		doAnim = true;
		if(alienState == 'entering'){
			state = 'marching';
			if(alien[n].y < motion.y * 2 + alien[n].centery) stillEntering = true;
		}else{
			state = alien[n].state;
		}
		switch(state){
			case 'kamikaze':
				if(Math.random() < .1 || alien[n].x < 10 || alien[n].x > PLAY_WIDTH - 10 - alien[n].width + alien[n].centerx){
					if(alien[n].x < ship.x){
						alien[n].motion.x = Math.abs(alien[n].motion.x);
					}else{
						alien[n].motion.x = -Math.abs(alien[n].motion.x);
					}
				}
				alien[n].move(alien[n].motion.x * ratio, alien[n].motion.y * ratio);
				if(alien[n].y > PLAY_HEIGHT + alien[n].centerx){
					alien[n].y = alien[n].centery - alien[n].height;
				}
				break;
			case 'marching':
				alien[n].move(motion.x, motion.y);
				checkFunc(alien[n].x);
				break;
			default:
				doAnim = false;
		}
		if(doAnim){
			if(alien[n].state == 'marching' && Math.random() < kamikazeChance && numKamikazes < maxKamikazes && alienState != 'entering'){
				alien[n].state = 'kamikaze';
				numKamikazes++;
				alien[n].motion = {'x':0, 'y':3};
				if(alien[n].x < ship.x){
					alien[n].motion.x = Math.abs(motion.x) - 1;
				}else{
					alien[n].motion.x = -Math.abs(motion.x) + 1;
				}
			}
			alien[n].animParams = alien[n].doSequenceStep(alien[n].animParams);

			if(alien[n].highlighted == true){
				highlight.animParams = highlight.doSequenceStep(highlight.animParams);
				highlight.position(alien[n].x, alien[n].y);
			}
		}
	}
	if(!stillEntering){
		alienState = 'marching';
	}
	if(alienMotion.y > 0) alienMotion.y --;
	if(switchDir){
		alienMotion.x *= -1;
		alienMotion.y = alienSpeed;
	}

}

// applies 'amount' damage to alien[index], returning true if the alien is destroyed
function hurtAlien(index, amount){
	var returnval = false;
	alien[index].health -= amount;
	if(alien[index].health <= 0){
		addScore(amount + alien[index].health);
		if(alien[index].highlighted == true){
			highlight.detach();
			powerup.prependTo($('#playArea'));
			var pos = alien[index].position();
			powerup.setFrame(0);
			powerup.position(pos.left, pos.top);
			powerup.activated = true;
		}
		deleteAlien(index);
		returnval = true;
	}else{
		addScore(amount);
	}
	return returnval;
}

function deleteAlien(idx){
	if(alien[idx] != undefined){
		if(alien[idx].state == 'kamikaze'){
			numKamikazes--;
		}
		alien[idx].remove();
		for(;idx < numAliens - 1; idx++){
			alien[idx] = alien[idx + 1];
		}
		numAliens--;
	}
}


/***********************************************************
Functions for handling shots fired by the ship
***********************************************************/
function moveShots(){
	var n;
	for(n = 0; n < numShots; n++){
		shot[n].move(shot[n].velocity.dx, shot[n].velocity.dy);
		if(shot[n].y < -shot[n].height + shot[n].centery){
			deleteShot(n);
			n--;
		}
	}
	if(shotCountdown > 0) shotCountdown--;
}

function deleteShot(idx){
	shot[idx].remove();
	for(;idx < numShots - 1; idx++){
		shot[idx] = shot[idx + 1];
	}
	shot[idx] = undefined;
	numShots--;
}

function fireGun(){
	if(!(numAliens || powerup.activated || numBombs)){
		firing = 0;
		return;
	}
	if(ship.currentGun == 'electric'){
		// The electric gun is a special case, handled differently from the others.  Instead of waiting
		// for object collision, the electric gun does it's damage immediately, with no delay of it travelling
		// from the ship to the target.  As a result, we handle both it's animation and collision detection
		// on the firing event, rather than waiting for a collision.
		electricActivated = true;
		if(lightningDiv != null){
			lightningDiv.remove();
		}
		var n;

		var powerNeeded = guns[ship.currentGun].powerNeeded;
		var energy = guns[ship.currentGun].powerNeeded;
		var numBolts = 2;
		if(life[numLives - 1].power <= powerNeeded){
			// we don't want to destroy the ship, so we'll make the bolt do less damage
			numBolts = 1;
			powerNeeded = life[numLives - 1].power - 1;
			energy *= powerNeeded / guns[ship.currentGun].powerNeeded;
		}


		// find the y-location of the nearest item that can be zapped
		var targety = 0;

		// we'll start by checking for aliens
		var targetAlien = -1;
		for(n = 0; n < numAliens; n++){
			if(Math.abs(alien[n].x - ship.x) < 24){
				if(alien[n].y > targety && alien[n].y < ship.y){
					targety = alien[n].y;
					targetAlien = n;
				}
			}
		}

		// now let's look at bombs
		var targetBomb = -1;
		for(n = 0; n < numBombs; n++){
			if(Math.abs(bomb[n].x - ship.x) < 12){
				if(bomb[n].y > targety && bomb[n].y < ship.y){
					targety = bomb[n].y;
					targetBomb = n;
				}
			}
		}

		// finally, check to see if we're hitting the powerup
		var hitPowerup = false;
		if(powerup.activated && Math.abs(powerup.x - ship.x) < 16 && powerup.y > targety && powerup.y < ship.y){
			hitPowerup = true;
			targety = powerup.y;
		}

		var height = ship.y - 30 - targety;
		var width = 24; // the width of our bolt image
		var targetx = ship.x + ship.gunOffset - (width >> 1);
		if(hitPowerup){
			explode(targetx + 8, powerup.y);
			powerup.strength--;
			if(powerup.strength <= 0){
				deletePowerup();
			}
		}else if(targetBomb != -1){
			explode(targetx + 8, bomb[targetBomb].y);
			bomb[targetBomb].strength--;
			addScore(1);
			if(bomb[targetBomb].strength <= 0){
				deleteBomb(targetBomb);
			}
		}else if(targetAlien != -1){
			explode(targetx + 8, alien[targetAlien].y);
			hurtAlien(targetAlien, energy);
		}

		// draw the lightning bolt
		lightningDiv = $('<div></div>');
		lightningDiv.appendTo($('#playArea'));
		lightningDiv.css({
			'position':'absolute',
			'left': targetx + 'px',
			'top': targety + 'px',
			'width':width + 'px',
			'height':height + 'px'
		});
		for(n = 0; n < numBolts; n++){
			var subDiv = $('<div></div>');
			subDiv.css({
				'position':'absolute',
				'left': '0px',
				'top': '0px',
				'width':'100%',
				'height': '100%',
				'background-image':'url(images/lightning_' + (Math.floor(Math.random() * 6) + 1) + '.png)',
				'background-position': '0px ' + Math.floor(Math.random() * 144) + 'px'

			});
			lightningDiv.append(subDiv);
		}

		takeDamage(powerNeeded, false);

	}else if(shotCountdown <= 0 && life[numLives - 1].power > guns[ship.currentGun].powerNeeded){
		switch(ship.currentGun){
			case 'normal': case 'fast': case 'bfg':
				shot[numShots] = new spriteClass(shotSprite);
				shot[numShots].draw($('#playArea'));
				shot[numShots].setFrame(ship.currentGun);
				shot[numShots].position(ship.x + ship.gunOffset, ship.y - 16);
				shot[numShots].velocity = {'dx': 0, 'dy': -guns[ship.currentGun].speed};
				shot[numShots].energy = guns[ship.currentGun].energy;
				numShots++;
				shotCountdown = guns[ship.currentGun].delay;
				break;
			case 'double':
				shot[numShots] = new spriteClass(shotSprite);
				shot[numShots].draw($('#playArea'));
				shot[numShots].setFrame('normal');
				shot[numShots].position(ship.x + ship.gunOffset + 12, ship.y - 16);
				shot[numShots].velocity = {'dx': 0, 'dy': -guns[ship.currentGun].speed};
				shot[numShots].energy = guns[ship.currentGun].energy;
				numShots++;

				shot[numShots] = new spriteClass(shotSprite);
				shot[numShots].draw($('#playArea'));
				shot[numShots].setFrame('normal');
				shot[numShots].position(ship.x + ship.gunOffset - 12, ship.y - 16);
				shot[numShots].velocity = {'dx': 0, 'dy': -guns[ship.currentGun].speed};
				shot[numShots].energy = guns[ship.currentGun].energy;
				numShots++;

				shotCountdown = guns[ship.currentGun].delay;
				break;
			case 'spread':
				var xdelta = guns[ship.currentGun].speed * 0.5; // sin(pi / 6);
				var ydelta = guns[ship.currentGun].speed * 0.86602540378443864676; // cos(pi / 6);

				shot[numShots] = new spriteClass(shotSprite);
				shot[numShots].draw($('#playArea'));
				shot[numShots].setFrame('normal');
				shot[numShots].position(ship.x + ship.gunOffset, ship.y - 16);
				shot[numShots].velocity = {'dx': 0, 'dy': -guns[ship.currentGun].speed};
				shot[numShots].energy = guns[ship.currentGun].energy;
				numShots++;

				shot[numShots] = new spriteClass(shotSprite);
				shot[numShots].draw($('#playArea'));
				shot[numShots].setFrame('leftbank');
				shot[numShots].position(ship.x + ship.gunOffset - 12, ship.y - 16);
				shot[numShots].velocity = {'dx': -xdelta, 'dy': -ydelta};
				shot[numShots].energy = guns[ship.currentGun].energy;
				numShots++;

				shot[numShots] = new spriteClass(shotSprite);
				shot[numShots].draw($('#playArea'));
				shot[numShots].setFrame('rightbank');
				shot[numShots].position(ship.x + ship.gunOffset + 12, ship.y - 16);
				shot[numShots].velocity = {'dx': xdelta, 'dy': -ydelta};
				shot[numShots].energy = guns[ship.currentGun].energy;
				numShots++;

				shotCountdown = guns[ship.currentGun].delay;
				break;
		};
		takeDamage(guns[ship.currentGun].powerNeeded, false);
	}
}

/***********************************************************
Functions for handling powerups
***********************************************************/

function makePowerup(){
	if(!numAliens) return;
	var n;
	var alienNum = Math.floor(Math.random() * numAliens);
	powerupCountdown = MINBONUSTIME;
	if(powerup.type != null){
		bonusCells[powerup.type].setFrame(powerup.type + '_grey');
	}

	powerup.type = powerTypes[Math.floor(Math.random() * powerTypes.length)];
	bonusCells[powerup.type].setFrame(powerup.type);
	for(n = 0; n < numAliens; n++){
		alien[n].highlighted = n == alienNum;
	}
	powerup.strength = 10; // <- used only for avoiding instant destruction from lightning bolt
	
	alien[alienNum].highlighted = true;
	highlight.position(alien[alienNum].x, alien[alienNum].y);
	highlight.appendTo($('#playArea'));
}

function animatePowerup(){
	powerup.move(0, 5);
	powerup.animParams = powerup.doSequenceStep(powerup.animParams);
	if(powerup.y > PLAY_HEIGHT + powerup.centery){
		deletePowerup();
	}
}

function deletePowerup(){
	if(powerup.activated){
		powerup.detach();
		powerup.activated = false;
		powerupCountdown = 0;
		if(powerup.type != null){
			bonusCells[powerup.type].setFrame(powerup.type + '_grey');
		}
	}
}

function awardPowerup(){
	// get the curent ship angle for use when changing the sprite to match a new gun
	var frameName = ship.sprite.currentFrame;
	var parts = frameName.split('_');
	var frameIndex = parts[parts.length - 1];
	addScore(5);

	bonusCells[powerup.type].setFrame(powerup.type + '_grey');

	switch(powerup.type){
		case 'life':
			if(numLives < MAX_LIVES){
				life[numLives].power = life[numLives - 1].power;
				life[numLives].update();
				life[numLives - 1].power = MAX_LIFE;
				life[numLives - 1].update();
				numLives++;
			}else if(life[numLives - 1].power < MAX_LIFE){
				life[numLives - 1].power = MAX_LIFE;
				life[numLives - 1].update();
			}
			break;
		case 'fast':
			if(ship.currentGun == 'electric') lightningDiv.detach();
			ship.currentGun = 'fast';
			ship.sprite.setFrame('fast_' + frameIndex);
			break;
		case 'double':
			if(ship.currentGun == 'electric') lightningDiv.detach();
			ship.currentGun = 'double';
			ship.sprite.setFrame('double_' + frameIndex);
			break;
		case 'spread':
			if(ship.currentGun == 'electric') lightningDiv.detach();
			ship.currentGun = 'spread';
			ship.sprite.setFrame('spread_' + frameIndex);
			break;
		case 'bfg':
			if(ship.currentGun == 'electric') lightningDiv.detach();
			ship.currentGun = 'bfg';
			ship.sprite.setFrame('bfg_' + frameIndex);
			break;
		case 'electric':
			if(ship.currentGun == 'electric') lightningDiv.detach();
			ship.currentGun = 'electric';
			ship.sprite.setFrame('electric_' + frameIndex);
			break;
		case 'shield':
			if(ship.shieldStrength <= 0){
				shield.position(ship.x, ship.y);
				shield.draw($('#playArea'));
			}
			ship.shieldStrength += 250;
			break;
		case 'freeze':
			frozen = MAX_FROZEN_TIME;
			break;
	}
	powerup.type = null;

}

/***********************************************************
Functions for handling explosions
***********************************************************/
function explode(x, y){
	var idx = Math.ceil(4 * Math.random());
	explosion[numExplosions] = new spriteClass(explosionSprite);
	explosion[numExplosions].setFrame(Math.floor(Math.random() * explosionSprite.frames.length));
	explosion[numExplosions].position(x, y);
	explosion[numExplosions].draw($('#playArea'));
	numExplosions++;
}

function clearExplosions(){
	var n;
	for(n = 0; n < numExplosions; n++){
		explosion[n].remove();
	}
	numExplosions = 0;
}

/***********************************************************
Gameplay functions
***********************************************************/
// here is where we handle the interaction between game elements
function interact(){
	var n, m;
	var dx, dy, dxsq, dysq;
	var minAlienRadiusSq, minBombRadius, minPowerupRadiusSq, minShipToAlienRadiusSq;
	minAlienRadiusSq = 1184; // <-- will probably need to be dynamically calculated based on the sprites' center points.
	minBombRadiusSq = 256;
	minPowerupRadiusSq = 256;
	minShipToAlienRadiusSq = 2500;

	// check for collisions with the player's gunfire
	for(n = 0; n < numShots; n++){
		// let's see if we hit an alien
		for(m = 0; m < numAliens; m++){
			dxsq = alien[m].x - shot[n].x;
			dxsq *= dxsq;
			dysq = alien[m].y - shot[n].y;
			dysq *= dysq;
			if(dxsq + dysq < minAlienRadiusSq){
				break;
			}
		}
		if(m < numAliens){
			// looks like we have a collision!
			var h = alien[m].health;
			explode(shot[n].x, shot[n].y);
			hurtAlien(m, shot[n].energy);
			shot[n].energy -= h;
			if(shot[n].energy < h){
				deleteShot(n);
				n--;
			}
			continue;
		}

		// no aliens hit if we got this far.  Let's see if it collides with ammo
		for(m = 0; m < numBombs; m++){
			dxsq = bomb[m].x - shot[n].x;
			dxsq *= dxsq;
			dysq = bomb[m].y - shot[n].y;
			dysq *= dysq;
			if(dxsq + dysq < minBombRadiusSq){
				break;
			}
		}

		if(m < numBombs){
			explode(shot[n].x, shot[n].y);
			deleteBomb(m);
			shot[n].energy -= 10;
			if(shot[n].energy <= 0){
				deleteShot(n);
				addScore(1);
				n--;
			}
			continue;
		}

		// still good.  Let's check for collision with powerups
		if(powerup.activated == true){
			dxsq = powerup.x - shot[n].x;
			dxsq *= dxsq;
			dysq = powerup.y - shot[n].y;
			dysq *= dysq;
			if(dxsq + dysq < minPowerupRadiusSq){
				explode(shot[n].x, shot[n].y);
				shot[n].energy -= 10;
				if(shot[n].energy <= 0){
					deleteShot(n);
					n--;
				}
				deletePowerup();
			}
		}
	}

	// that's all interaction with the ship's weaponry accounted for.  Now let's check the other possible collisions
	
	// let's see if any of the aliens' bombs are hitting our ship
	minBombRadiusSq = 1600;
	for(n = 0; n < numBombs; n++){
		dxsq = bomb[n].x - ship.x;
		dxsq *= dxsq;
		dysq = bomb[n].y - ship.y;
		dysq *= dysq;
		if(dxsq + dysq < minBombRadiusSq){
			explode(bomb[n].x, bomb[n].y);
			deleteBomb(n);
			takeDamage(40, true);
			n--;
		}
	}

	// are we colliding with an alien?
	for(n = 0; n < numAliens; n++){
		dxsq = alien[n].x - ship.x;
		dxsq *= dxsq;
		dysq = alien[n].y - ship.y;
		dysq *= dysq;
		if(dxsq + dysq < minShipToAlienRadiusSq){
			explode((alien[n].x + ship.x) >> 1, (alien[n].y + ship.y) >> 1);
			takeDamage(alien[n].health << 1, true);
			if(hurtAlien(n, 1)) n--;
		}

	}

	// do we have a powerup coming at us?  Did we hit it?
	if(powerup.activated == true){
		var minPowerupRadiusSq = 1600;
		dxsq = powerup.x - ship.x;
		dxsq *= dxsq;
		dysq = powerup.y - ship.y;
		dysq *= dysq;
		if(dxsq + dysq < minPowerupRadiusSq){
			awardPowerup();
			deletePowerup();
		}
	}

}

function moveShip(){
	var offset = $('#playArea').offset();
	var newX = mousePos.x - offset.left;
	var newY = mousePos.y - offset.top;

	if(ship.oldx != undefined){

		tilt = newX - ship.oldx;
		if(tilt > 6){
			ship.sprite.setFrame(ship.currentGun + '_5');
			ship.gunOffset = 8;
		}else if(tilt > 2){
			ship.sprite.setFrame(ship.currentGun + '_4');
			ship.gunOffset = 4;
		}else if(tilt < -6){
			ship.sprite.setFrame(ship.currentGun + '_1');
			ship.gunOffset = -8;
		}else if(tilt < -2){
			ship.sprite.setFrame(ship.currentGun + '_2');
			ship.gunOffset = -4;
		}else{
			ship.sprite.setFrame(ship.currentGun + '_3');
			ship.gunOffset = 0;
		}
	}
	ship.position(newX, newY);
	shield.position(ship.x, ship.y);
}

function doAnimation(){
	if(doingAnimation == false){
		doingAnimation = true;
		clearExplosions(); // note that this must happend before "interact" is called
		rechargeLife();
		moveAliens();
		moveShip();
		if(!(numAliens || powerup.activated || numBombs)) firing = 0;
		if(firing){
			fireGun();
		}else if(electricActivated){
			lightningDiv.detach();
			electricActivated = false;
		}
		interact();
		moveShots();
		if(Math.random() <= bombChance){
			launchBomb();
		}

		if(Math.random() <= powerupChance && !powerup.activated && powerupCountdown <= 0){
			makePowerup();
		}
		if(powerupCountdown > 0){
			powerupCountdown--;
		}

		if(powerup.activated){
			animatePowerup();
		}

		if(ship.shieldStrength > 0){
			shield.animParams = shield.doSequenceStep(shield.animParams);
		}
		moveBombs();
		scroll();

		if(numAliens <= 0 /*&& !powerup.activated*/ && numShots == 0 && numBombs <= 0 && gameState == 'active'){
			// the level has ended!!!
			endLevel();
		}
		drawScore(score);
		doingAnimation = false;
	}
}

function endLevel(){
	clearInterval(gameInterval);
	gameState = 'loading';
	//deletePowerup();
	//ship.currentGun = 'normal';
	//ship.sprite.setFrame('normal_3');
	buildLevel({'levelNum':++currentLevel, 'callback':function(){
		alienState = 'entering';
		gameState = 'active';
		gameInterval = setInterval(function(){doAnimation()}, ANIMATION_FREQUENCY);
	}});
}

function promptBox(){
	var rval = $('<div></div>');

	rval.css({
		'width': '500px',
		'height': '200px',
		'background-color': '#000',
		'margin': 'auto',
		'border': '2px solid #8AF',
		'position': 'relative',
		'top': (($('#playArea').height() >> 1) - 100) + 'px',
		'text-align': 'center',
		'-moz-border-radius' : '8px',
		'border-radius' : '8px'
	});
	return rval;
}

function togglePause(){
	if(gameState == 'paused'){
		gameState = 'unpausing';
		unpauseGame();
	}else if(gameState == 'active'){
		gameState = 'pausing';
		pauseGame();
	}
}

function pauseGame(){
	if(gameState == 'paused' || gameState == 'confirming' || gameState == 'unpausing') return;
	clearInterval(gameInterval);
	$('#playArea').css({'cursor':'auto'});
	pauseBox = promptBox();
	pauseBox.fadeTo(0, 0);
	pauseBox.appendTo($('#playArea'));
	var topMargin = $('<div></div>');
	topMargin.css('height', '60px');
	pauseBox.append(topMargin);
	pauseBox.append("PAUSED<br/><br/>");
	var textSpan = $("<span>CLICK TO CONTINUE<span>");
	textSpan.css('font-size', '14px');
	pauseBox.append(textSpan);
	pauseBox.fadeTo(500, 0.5, function(){
		gameState = 'paused';
	});
	pauseBox.click(function(){
		togglePause();
	});
}

function unpauseGame(){
	pauseBox.fadeTo(500, 0, function(){
		gameState = 'active';
		$('#playArea').css({'cursor':'none'});
		pauseBox.remove()
		gameInterval = setInterval(function(){doAnimation()}, ANIMATION_FREQUENCY);
	});
}

function confirmQuit(){
	if(gameState == 'active'){
		gameState = 'pausing';
		showQuit();
	}
}

function showQuit(){
	if(gameState == 'confirming' || gameState == 'unpausing' || gameState == 'paused') return;
	clearInterval(gameInterval);
	$('#playArea').css({'cursor':'auto'});
	pauseBox = promptBox();
	pauseBox.fadeTo(0, 0);
	pauseBox.appendTo($('#playArea'));
	var topMargin = $('<div></div>');
	topMargin.css('height', '60px');
	pauseBox.append(topMargin);
	pauseBox.append("GIVING UP THE FIGHT?<br/><br/>");
	//var textSpan = $("<span>yes no<span>");
	//textSpan.css('font-size', '14px');
	//pauseBox.append(textSpan);
	var spanStyle = {
		'margin': '18px',
		'font-size':'14px',
		'background-color':'#8AF',
		'border' : '2px solid #9CF',
		'border-bottom-color': '#68D',
		'border-right-color': '#68D',
		'padding': '4px',
		'color': '#000',
		'cursor': 'pointer'
	};

	var yesButton = $('<span>GET ME OUTTA HERE!</span>');
	yesButton.css(spanStyle)
	pauseBox.append(yesButton);
	yesButton.click(function(){
		endGame();
	});

	var noButton = $('<span>BRING \'EM ON!</span>');
	noButton.css(spanStyle)
	pauseBox.append(noButton);
	noButton.click(function(){
		gameState = 'unpausing';
		unpauseGame();
	});

	pauseBox.fadeTo(500, 0.5, function(){
		gameState = 'confirming';
	});
}
function clearLevel(){
	while(numAliens){
		if(alien[numAliens - 1] != undefined){
			if(alien[numAliens - 1].highlighted == true){
				highlight.detach();
				bonusCells[powerup.type].setFrame(powerup.type + '_grey');
			}
			deleteAlien(numAliens - 1);
		}else{
			numAliens--;
		}
	}
	while(numBombs) deleteBomb(numBombs - 1);
	while(numShots) deleteShot(numShots - 1);
}

function skipLevel(){
	clearLevel();
	endLevel();
}

function startGame(){
	setInitialLives();
	$('#playArea').css({'cursor':'none'});
	$('#playArea').empty();
	ship.draw($('#playArea'));
	buildLevel({'callback': function(){
		buildIO();
		score = 0;
		currentLevel = 0;
		drawScore(score);
		gameState = 'active';
		alienState = 'entering';
		gameInterval = setInterval(function(){doAnimation()}, ANIMATION_FREQUENCY);
	}});
}

function endGame(){
	clearInterval(gameInterval);
	gameState = 'menu';
	ship.currentGun = 'normal';
	$('#infoArea').fadeTo(500, 0);
	$('#playArea').fadeTo(500, 0, function(){
		var n;
		numLives = 0;
		deletePowerup();
		for(n = 0; n < MAX_LIVES; n++){
			life[n].power = 0;
			life[n].update();
		}
		removeIO();
		clearLevel();
		clearScore();
		$('#playArea').empty();
		$('#playArea').css('background', '#000');
		drawMenu(true);
	});
}

/***********************************************************
Initialization functions
***********************************************************/
// here we'll do the basic initialization that has to be handled on the first load:
var initProgress;
function initialize_game(step, callback){
	alienSprite = new spriteSet();
	if(step != 'start'){
		initProgress += 2;
		progressBar.css({'width':initProgress + 'px'});
	}
	switch(step){
		case 'start':
			build_lives();
			$('#playArea').fadeTo(0, 0);
			$('#loadingDiv').fadeTo(0, 0.4);
			progressBar = $('<div></div>');
			initProgress = 1;
			progressBar.css({'display':'inline-block', 'height': '.5em', 'top':'.25em', 'width': initProgress + 'px', 'background-color':'#0F0'});
			loadingText = $('<div>Loading: </div>');
			loadingText.css({
				'color':'#88F',
				'font-weight':'bold',
				'font-size':'18px',
				'font-family':'sans-serif',
				'text-align':'center',
				'position':'relative',
				'top': ((PLAY_HEIGHT >> 1) - 32) + 'px'
			});
			loadingText.append(progressBar);
			$('#loadingDiv').append(loadingText);

			ship = new shipClass(function(){
				initialize_game('loadShots', callback);
			});
			break;

		case 'loadShots':
			shotSprite = new spriteSet();
			shotSprite.load('sprites/shots.sprite', function(){
				shot = [];
				numShots = 0;
				initialize_game('buildBonuses', callback);
			});
			break;
		case 'buildBonuses':
			bonusSprite = new spriteSet();
			bonusSprite.load('sprites/bonuses.sprite', function(){
				bonusCells = [];
				initialize_game('loadLabels', callback);
			});
			break;
		case 'loadLabels':
			labels = new spriteSet();
			labels.load('sprites/labels.sprite', function(){
				var sprite, wrapper;

				// one-time sprite usage for labels
				wrapper = $('<div><div>');
				wrapper.css({'text-align':'center', 'display':'block', 'position':'absolute', 'top':'0px', 'width':'100%'});
				sprite = new spriteClass(labels);
				sprite.drawFrame(wrapper, 'score')
				wrapper.appendTo($('#infoArea'));

				wrapper = $('<div></div>');
				wrapper.css({'text-align':'center', 'display':'block', 'position':'absolute', 'top':'20px', 'width':'100%'});
				scoreDiv = $('<div></div>');
				scoreDiv.appendTo(wrapper);
				wrapper.appendTo($('#infoArea'));
				scoreText = new spriteClass(labels);

				wrapper = $('<div><div>');
				wrapper.css({'text-align':'center', 'display':'block', 'position':'absolute', 'top':'80px', 'width':'100%'});
				sprite.drawFrame(wrapper, 'powerups');
				wrapper.appendTo($('#infoArea'));

				wrapper = $('<div><div>');
				wrapper.css({'text-align':'center', 'display':'block', 'position':'absolute', 'top':'363px', 'width':'100%'});
				sprite.drawFrame(wrapper, 'lives');
				wrapper.appendTo($('#infoArea'));

				initialize_game('loadExplosion', callback);
			});
			break;
		case 'loadExplosion':
			explosionSprite = new spriteSet();
			explosionSprite.load('sprites/explosions.sprite', function(){
				initialize_game('loadBombs', callback);
			});
			break;
		case 'loadBombs':
			bombSprite = new spriteSet();
			bombSprite.load('sprites/bombs.sprite', function(){
				initialize_game('loadShield', callback);
			});
			break;
		case 'loadShield':
			shieldSprite = new spriteSet();
			shieldSprite.load('sprites/shield.sprite', function(){
				shield = new spriteClass(shieldSprite);
				shield.setFrame(0);
				shield.animParams = shield.startSequence('animate', {'iterations':0, 'method':'manual'});
				initialize_game('loadPowerup', callback);
			});
			break;
		case 'loadPowerup':
			powerupSprite = new spriteSet();
			powerupSprite.load('sprites/powerup.sprite', function(){
				powerup = new spriteClass(powerupSprite);
				powerup.type = null;
				powerup.animParams = powerup.startSequence('animate', {'iterations':0, 'method':'manual'});
				powerup.activated = false;
				initialize_game('loadHighlight', callback);
			});
			break;
		case 'loadHighlight':
			highlightSprite = new spriteSet();
			highlightSprite.load('sprites/highlight.sprite', function(){
				highlight = new spriteClass(highlightSprite);
				highlight.animParams = highlight.startSequence('animate', {'iterations':0, 'method':'manual'});
				initialize_game('cacheImages', callback);
			});
			break;
		case 'cacheImages':
			loadingFlags = 127;
			$('<img src="images/lightning_1.png">').load(function(){loadingFlags ^= 1;});
			$('<img src="images/lightning_2.png">').load(function(){loadingFlags ^= 2;});
			$('<img src="images/lightning_3.png">').load(function(){loadingFlags ^= 4;});
			$('<img src="images/lightning_4.png">').load(function(){loadingFlags ^= 8;});
			$('<img src="images/lightning_5.png">').load(function(){loadingFlags ^= 16;});
			$('<img src="images/lightning_6.png">').load(function(){loadingFlags ^= 32;});
			$('<img src="images/title.png">').load(function(){loadingFlags ^= 64;});

			initialize_game('finishLoading', callback);
			break;

		case 'finishLoading':
			//wait for all of the images to finish loading before we continue
			var delay = 0;
			if(
			  shotSprite.loadingImage || bonusSprite.loadingImage || shieldSprite.loadingImage ||
			  powerupSprite.loadingImage || highlightSprite.loadingImage || explosionSprite.loadingImage ||
			  bombSprite.loadingImage || loadingFlags
			){
				var waitcallback = function(){
					initialize_game('finishLoading', callback);
				};
				delay = 100;

			}else{
				drawBonuses(); // this line is here because we only want it drawn in it's entirety, not in parts while being loaded
				var waitcallback = function(){
					initialize_game('finish', callback);
				};
			}
			setTimeout(waitcallback, delay);
			break;
		case 'finish':
			callback();
			break;
	}

}

function buildLevel (params){
	switch(params.step){
		case undefined:
			var postdat = {'action':'getLevel'};
			if(params['levelNum'] != undefined){
				postdat['num'] = params['levelNum'];
			}
			$.post('invaders.php', postdat, function(rval){
				var results;
				eval('params["levelDat"] = ' + rval);
				params['step'] = 'processLevel';
				buildLevel(params);
			});
			break;
			
		case 'processLevel':
			var data = params['levelDat'];

			// initialize the aliens
			numAliens = startingAliens = data['rows'] * data['cols'];
			alien = [];
			alienSprite = new spriteSet();
			alienSpeed = data['alienSpeed'];
			alienMotion = {'x':alienSpeed, 'y':0};
			alienLife = data['alienLife'];

			// initialize the bombs
			bombId = data['bombid'];
			bomb = [];
			maxBombs = data['maxBombs'];
			bombSpeed = data['bombSpeed'];
			numBombs = 0;
			bombChance = data['bombChance'];

			// other
			powerupChance = data['powerupChance'];
			kamikazeChance = data['kamikazeChance'];
			numKamikazes = 0;
			maxKamikazes = data['maxKamikazes'];

			// we'll make sure we have the background image cached before continuing
			$('<img src="' + data['background'] + '">').load(function(){
				// create the background
				$('#playArea').css({
					'background' : 'url(' + data['background'] + ')',
					'background-position' : '0px 0px'
				});
				backgroundOffset = 0;
				params['step'] = 'loadAliens';
				buildLevel(params);
			});
			break;

		case 'loadAliens':
			// and on to the next step
			alienSprite.load(params['levelDat']['alien'], function(){
				params['step'] = 'buildAliens';
				buildLevel(params);
			});
			break;
		case 'buildAliens':
			// let's wait for the alien sprite to finish loading before we continue
			if(alienSprite.loadingImage){
				var callback = function(){
					buildLevel(params);
				};
				setTimeout(callback, 100);
				break;

			}

			var data = params['levelDat'];
			var xspacing = data['xspacing'] + alienSprite.frameWidth;
			var lineWidth = xspacing * (data['cols'] - 1);
			var yspacing = data['yspacing'] + alienSprite.frameHeight;
			var columnHeight = yspacing * (data['rows'] - 1);
			var startx = ($('#playArea').width() - lineWidth) >> 1;
//			var starty = ($('#playArea').height() - columnHeight) >> 3;
			var starty = -yspacing;

			var n, x, y;
			for(n = y = 0; y < data['rows']; y++){
				for(x = 0; x < data['cols']; x++){
					alien[n] = new spriteClass(alienSprite);
					alien[n].draw($('#playArea'));
					alien[n].animParams = alien[n].startSequence('animate', {'iterations':0, 'method':'manual', 'startFrame':(n % alienSprite.frames.length)});
					alien[n].position(startx + x * xspacing, starty - y * yspacing);
					alien[n].health = alienLife;
					alien[n].state = 'marching';
					n++;
				}
			}

			// this is our last step, so if there's a callback, do it.
			params['callback']();
			break;
	}
}

function addScore(amount){
	score += amount;
}

function drawScore(score){
	score = Math.floor(score);
	var digits = [], n = 0;
	do{
		digits[n] = score % 10;
		score -= digits[n];
		score /= 10;
		n++;
	}while(score > 0);

	clearScore();
	for(n = digits.length - 1; n >= 0; n--){
		scoreText.drawFrame(scoreDiv, digits[n]);
	}
}

function clearScore(){
	scoreDiv.empty();
}

function drawBonuses(){
	var n = 0, x, y, drawx, drawy, idx;
	var holder = $('<div></div>');
	bonusCells['double'] = new spriteClass(bonusSprite);
	bonusCells['spread'] = new spriteClass(bonusSprite);
	bonusCells['fast'] = new spriteClass(bonusSprite);
	bonusCells['electric'] = new spriteClass(bonusSprite);
	bonusCells['bfg'] = new spriteClass(bonusSprite);
	bonusCells['freeze'] = new spriteClass(bonusSprite);
	bonusCells['shield'] = new spriteClass(bonusSprite);
	bonusCells['life'] = new spriteClass(bonusSprite);
	var xSpacing = ($('#infoArea').width() - bonusSprite.frameWidth * 2) / 3;
	for(idx in bonusCells){
		bonusCells[idx].setFrame(idx + '_grey');
		x = n % 2;
		y = n >> 1;
		drawx = x * (bonusSprite.frameWidth + xSpacing) + xSpacing;
		drawy = y * (bonusSprite.frameHeight + xSpacing) + BONUS_TOP_Y;

		bonusCells[idx].position(drawx, drawy);
		bonusCells[idx].draw(holder);
		n++;
	}
	holder.appendTo($('#infoArea'));
	holder.css({'margin':'auto', 'background-color':'#FFF'});
}

function handleKeypress(state, e){
	
	switch(e.which){
		case 81: case 113: case 27:
			confirmQuit();
			break;
		case 32: case 80: case 112:
			togglePause();
			break;
		case 9: case 83: case 115:
			//if(gameState != 'paused' && gameState != 'confirming' && gameState != 'unpausing' && gameState != 'pausing' && gameState != 'loading'){
			if(gameState == 'active'){
				skipLevel();
			}
			break;
	}
}

function buildIO(){
	// draw our pause and exit buttons
	var sprite;
	exitButton = $('<div><div>');
	exitButton.css({'text-align':'center', 'display':'inlineblock', 'position':'absolute', 'top':'540px', 'width':'50%', 'cursor':'pointer'});
	sprite = new spriteClass(labels);
	sprite.setFrame('quit');
	sprite.draw(exitButton);
	sprite.element.css({'position':'relative', 'margin':'auto'});
	exitButton.appendTo($('#infoArea'));
	exitButton.click(function(){showQuit();});

	pauseButton = $('<div><div>');
	pauseButton.css({'text-align':'center', 'display':'inline-block', 'position':'absolute', 'top':'540px', 'width':'50%', 'left':'50%', 'cursor':'pointer'});
	sprite = new spriteClass(labels);
	sprite.setFrame('pause');
	sprite.draw(pauseButton);
	sprite.element.css({'position':'relative', 'margin':'auto'});
	pauseButton.appendTo($('#infoArea'));
	pauseButton.click(function(){pauseGame();});

	$(document).mousemove(function(e){
		mousePos.x = e.pageX;
		mousePos.y = e.pageY;
	});

	$(document).mouseup(function(){
		firing = false;
		$('#keyfield').focus();
		return false;
	});

	$('#keyfield').focusout(function(){
		$('#keyfield').focus();
	});
	$(document).mousedown(function(){$('#keyfield').focus();return false;});
	$('#gameWrapper').mousedown(function(){$('#keyfield').focus();return false;});
	$('#playArea').mousedown(
		function(){
			if(gameState == 'active'){
				firing = true;
				fireGun();
			}
			$('#keyfield').focus();
			return false;
		}
	);
	$('#scoreArea').mousedown(function(){$('#keyfield').focus();return false;});
	$('#infoArea').mousedown(function(){$('#keyfield').focus();return false;});
}

function removeIO(){
	pauseButton.remove();
	exitButton.remove();
	$(document).unbind('mousedown');
	$(document).unbind('mouseup');	
	$(document).unbind('mousemove');
	$('#playArea').css({'cursor':'auto'});
	$('#gameWrapper').unbind('mousedown');
	$('#playArea').unbind('mousedown');
	$('#scoreArea').unbind('mousedown');
	$('#infoArea').unbind('mousedown');
}

// we'll make an extension of the animationElement class to represent buttons
var buttonClass = function(buttonName, objType){
	this.me = this;
	this.globalName = buttonName;
	this.position = {x:0, y:0};
	this.objType = objType;
	this.animObj = null;
	this.state = -1;
	//this.animObj = loadButton(this.globalName + '.animObj', this.objType);
	this.load()
}

buttonClass.prototype.load = function(){
	var n;
	switch(this.objType){
		case 'flipNeighbours':
			this.animObj = new animationElement(this.globalName + '.animObj');
			fnameBase = 'images/button1/button1_';
			break;
		case 'rotateNeighbours':
			this.animObj = new animationElement(this.globalName + '.animObj');
			fnameBase = 'images/button2/button2_';
			break;
	}
	if(this.animObj != undefined){
		for(n = 0; n < 14; n++){
			fname = fnameBase;
			if(n < 10) fname += '0';
			fname += n + '.png';
			this.animObj.addFrame(fname);
		}
		this.animObj.addSequence('flipOff', [1, 2, 3, 4, 5, 6, 7]);
		this.animObj.addSequence('flipOn', [8, 9, 10, 11, 12, 13, 0]);
	}
};

buttonClass.prototype.setPosition = function(x, y, noDraw){
	if(noDraw == undefined) noDraw = false;
	this.position.x = x;
	this.position.y = y;
	pos = realPosition(x, y);
	if(!noDraw){
		this.animObj.setPosition(pos.x, pos.y);
	}
};

buttonClass.prototype.draw = function(){
	this.animObj.appendTo($('#content'));
};

buttonClass.prototype.setState = function(state){
	switch(state){
		case 0:
			if(this.state != 0){
				this.state = 0;
				this.animObj.drawFrame(7);
			}
			break;
		case 1:
			if(this.state != 1){
				this.state = 1;
				this.animObj.drawFrame(0);
			}
			break;
		default:
			break;

	}
};

buttonClass.prototype.flip = function(){
	if(gameState == 'playing'){
		incAnimationTally(1);
		callback = 'function(){' + this.globalName + '.finishFlip()}';
		this.state ^= 1;
		if(this.state == 0){
			offTally ++;
			this.animObj.startSequence('flipOff', {'callback':callback, 'frameRate':30});
		}else{
			offTally--;
			this.animObj.startSequence('flipOn', {'callback':callback, 'frameRate':30});
		}
	}
};

buttonClass.prototype.finishFlip = function(){
	setTrigger(this);
	incAnimationTally(-1);
};




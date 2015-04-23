function trim(stringToTrim) {
	// make sure it is indeed a string:
	stringToTrim = ' ' + stringToTrim;
	return stringToTrim.replace(/^\s+|\s+$/g,"");
}

var cSprite = function(newTemplate){
	// orientation variables
	this.position = { x : 0, y : 0 };
	this.angle = 0;
	this.zIndex = 0;
	this.scale = 1;

	this.template = null;
	this.image = null;
	this.frameName = this.frame = null;
	this.currentSequence = null;
	this.currentSequenceName = null;
	this.frameIndex = 0;
	this.animating = null;

	// parent/child sprite management variables
	this.children = [];
	this.numChildren = 0;
	this.myParent = 0;
	

	this.setTemplate = function(template){
		this.template = template;
		this.image = template.image;
	}

	this.setFrame = function(frameName){
		this.frameName = frameName;
		this.frame = this.template.frames[frameName];
	}

	this.startSequence = function(sequenceName){
		if(this.template.sequences[sequenceName] != undefined){
			this.animating = true;
			this.currentSequenceName = sequenceName;
			this.currentSequence = this.template.sequences[sequenceName];
			this.frameIndex = 0; // <-- fixme, allow this to be passed as an argument to this function
			this.setFrame(this.currentSequence.frames[this.frameIndex]);
		}
	};

	this.draw = function(context, params){
		var x = this.position.x;
		var y = this.position.y;
		var n;
		var drawScale = null;
		context.save();
		context.translate(x, y);
		context.rotate(this.angle);
		for(n in params){
			switch(n){
				case 'x': x = params[n]; break;
				case 'y': y = params[n]; break;
				case 'scale' : drawScale = params[n]; break;
			}
		}

		if(drawScale == null){
			drawScale = this.scale;
		}
		context.scale(drawScale, drawScale);
		if(this.frame != null) context.translate(-this.frame.centerx, -this.frame.centery);

		for(n = 0; n < this.numChildren; n++){
			if(this.children[n].zIndex > this.zIndex){
				this.children[n].draw(context);
			}
		}
		if(this.frame != null){
			context.drawImage(
				this.image,
				this.frame.x + 0.5, this.frame.y + 0.5,
				this.frame.width - 1, this.frame.height - 1,
				0, 0,
				this.frame.width, this.frame.height
			);
		}

		for(n = 0; n < this.numChildren; n++){
			if(this.children[n].zIndex <= this.zIndex){
				this.children[n].draw(context);
			}
		}

		if(this.animating){
			this.frameIndex = (this.frameIndex + 1) % this.currentSequence.frames.length;
			this.frameName = this.currentSequence.frames[this.frameIndex];
			this.setFrame(this.frameName);
		}
		context.restore();
	}

	// parent/child sprite management functions
	this.detach = function(oldChild){
		if(oldChild == undefined){
			// separate this sprite from it's parent
			if(this.myParent) this.myParent.detach(this);
		}else{
			// separate the specified child from it's parent
			var foundit = false;
			for(var n in this.children){
				if(this.children[n] == oldChild){
					foundit = true;
				}else if(foundit){
					this.children[n - 1] = this.children[n];
				}
			}
			if(foundit){
				this.numChildren--;
				this.children[this.numChildren].myParent = 0;
				this.children[this.numChildren] = null;
			}
		}
	}

	this.attach = function(newChild){
		newChild.detach();
		newChild.myParent = this;
		this.children[this.numChildren] = newChild;
		this.numChildren++;
	}

	this.attachTo = function(newParent){
		this.detach();
		newParent.attach(this);
	}

	if(newTemplate != undefined){
		this.setTemplate(newTemplate);
	}
}

var spriteTemplate = function(filename, callback){
	var me = this;
	this.frames = [];
	this.sequences = {};
	this.defaultFrameRate = 40;
	this.centerx = this.centery = 0;
	this.loadingImage = false;

	this.newSprite = function(){
		return new cSprite(this);
	}

	this.load = function(fileName, callback){
		$.get(fileName, {}, function(result){
			var lines = result.split(';');
			var parts, n, m;
			for(n in lines){
				if(trim(lines[n]).length){
					parts = lines[n].split(':');
					switch(trim(parts[0]).toLowerCase()){
						case 'image':
							me.setImage(parts[1]);
							break;
						case 'framewidth':
							me.frameWidth = 1 * trim(parts[1]);
							break;
						case 'frameheight':
							me.frameHeight = 1 * trim(parts[1]);
							break;
						case 'frame':
							me.loadFrame(parts[1]);
							break;
						case 'sequence':
							me.loadSequence(parts[1]);
							break;
						case 'framerate':
							me.defaultFrameRate = 1 * trim(parts[1]);
							break;
						case 'centerx': case 'cx':
							me.centerx = 1 * trim(parts[1]);
							break;
						case 'centery': case 'cy':
							me.centery = 1 * trim(parts[1]);
							break;
					}
				}
			}
			
			if(callback != undefined){
				callback(result);
			}
		});
	}

	this.setFrameSize = function(w, h){
		this.frameWidth = w;
		this.frameHeight = h;
	}

	this.addFrame = function(id, params){
		var parts, arg, val, n;
		var newFrame = {
			'x': 0,
			'y': 0,
			'width': this.frameWidth,
			'height': this.frameHeight,
			'centerx': this.centerx,
			'centery': this.centery
		};
		for(n in params){
			switch(trim(n).toLowerCase()){
				case 'width': case 'height':
					newFrame[n] = 1 * params[n];
					break;
				case 'x': case 'left':
					newFrame['x'] = 1 * newFrame['x'] + 1 * params[n];
					break;
				case 'xoffset':
					newFrame['x'] = 1 * newFrame['x'] + 1 * params[n];
					break;
				case 'y': case 'top':
					newFrame['y'] = 1 * newFrame['y'] + 1 * params[n];
					break;
				case 'yoffset':
					newFrame['y'] = 1 * newFrame['y'] + 1 * params[n];
					break;
				case 'centerx': case 'cx':
					newFrame['centerx'] = 1 * params[n];
					break;
				case 'centery': case 'cy':
					newFrame['centery'] = 1 * params[n];
					break;
			}
		}
		this.frames[id] = newFrame;
	}

	this.loadSequence = function(datastr){
		var sequenceName = undefined;
		var newSequence = {
			'frames':[],
			'frameRate': me.defaultFrameRate
		};
		var params = datastr.split(',');
		var parts, arg, val, n, m;
		var numParts, numFrames;
		for(n in params){
			parts = params[n].split('=');
			arg = trim(parts[0]).toLowerCase();
			val = trim(parts[1]);
			switch(arg){
				case 'name':
					sequenceName = val;
					break;
				case 'frames':
					frameSet = val.split(' ');
					numFrames = 0;
					for(m in frameSet){
						parts = frameSet[m].split('*');
						if(parts.length == 2){
							numParts = 1 * trim(parts[1]);
						}else{
							numParts = 1;
						}
						while(numParts > 0){
							newSequence.frames[numFrames++] = trim(parts[0]);
							numParts--;
						}
					}
					break;
				case 'framerate':
					newSequence.frameRate = 1 * val;
					break;
			}

		}
		if(sequenceName != undefined){
			this.sequences[sequenceName] = newSequence;
		}

	}

	this.loadFrame = function(datastr){
		var params = datastr.split(',');
		var parts, arg, val, n;
		var frameName = undefined;
		var newFrame = {
			'x': 0,
			'y': 0,
			'width': this.frameWidth,
			'height': this.frameHeight,
			'centerx': this.centerx,
			'centery': this.centery
		};
		for(n in params){
			parts = params[n].toLowerCase().split('=');
			arg = trim(parts[0]);
			val = trim(parts[1]);
			switch(arg){
				case 'name':
					frameName = val;
					break;
				case 'width': case 'height':
					newFrame[arg] = 1 * val;
					break;
				case 'x':
					newFrame['x'] += this.frameWidth * val;
					break;
				case 'xoffset':
					newFrame['x'] += 1 * val;
					break;
				case 'y':
					newFrame['y'] += this.frameHeight * val;
					break;
				case 'yoffset':
					newFrame['y'] += 1 * val;
					break;
				case 'centerx': case 'cx':
					newFrame['centerx'] = 1 * val;
					break;
				case 'centery': case 'cy':
					newFrame['centery'] = 1 * val;
					break;
			}
		}
		if(frameName != undefined){
			this.frames[frameName] = newFrame;
		}
	}

	// set the image and cache it
	this.setImage = function(file, callback){
		if(callback == undefined) callback = function(){};
		this.image = new Image();
		this.image.onload = function(){
			this.loadingImage = false;
			callback();
		}
		this.image.src = file;
	}

	if(filename != undefined){
		this.load(filename, callback);
	}

}

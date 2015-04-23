function trim(stringToTrim) {
	// make sure it is indeed a string:
	stringToTrim = ' ' + stringToTrim;
	return stringToTrim.replace(/^\s+|\s+$/g,"");
}

var spriteClass = function(set){
	var me = this;

	this.set = set;
	this.frame = null;
	this.image = $('<img src="' + set.image + '">');
	this.element = $('<div></div>');
	this.width = this.height = this.x = this.y = 0;
	this.scale = 1;


	this.image.css({
		'position': 'absolute',
		'left': this.y,
		'top': this.x
	});

	this.element.append(this.image);

	this.element.css({
		'position':'absolute',
		'width': this.width + 'px',
		'height': this.height + 'px',
		'left': this.x + 'px',
		'top': this.y + 'px',
		'overflow': 'hidden'
	});

	this.setFrame = function(framename){
		framename = trim(framename).toLowerCase();
	
		if(this.set.frames[framename] != undefined){
			this.frame = this.set.frames[framename];
			this.setFrameSize(this.frame.width * this.scale, this.frame.height * this.scale);
			this.refreshFrame();
		}
	}

	this.setFrameSize = function(w, h){
		this.width = w;
		this.height = h;
		this.element.css({
			width: this.width + 'px',
			height: this.height + 'px'
		});
	}

	this.setScale = function(newScale){
		var cx = 0, cy = 0;
		if(this.frame != undefined){
			cx = this.frame.centerx;
			cy = this.frame.centery;
		}
		this.scale = newScale;
		this.image.css({
			width: (this.set.imageWidth * this.scale) + 'px',
			height: (this.set.imageHeight * this.scale) + 'px'
		});
		// also need to adjust our element's position, as that will be dependent on scale when we have a center point other than 0,0
		this.element.css({
			'left': (this.x - cx * this.scale) + 'px',
			'top': (this.y - cy * this.scale) + 'px'
		});
		this.setFrameSize(this.frame.width * this.scale, this.frame.height * this.scale);
		this.refreshFrame();
	}

	this.refreshFrame = function(){
		this.image.css({
			'position': 'absolute',
			'left': -(this.frame.x * this.scale) + 'px',
			'top': -(this.frame.y * this.scale) + 'px'
		});
	}

	this.refreshImage = function(){
		this.image = $('<img src="' + this.set.image + '">');
		this.element.empty();
		this.element.append(this.image);
		this.setScale(this.scale);
	}

	this.draw = function(target){
		target.append(this.element);
	}

	this.position = function(x, y){
		var cx = 0, cy = 0;
		if(x != undefined && y != undefined){
			this.x = x;
			this.y = y;
			if(this.frame != undefined){
				cx = this.frame.centerx;
				cy = this.frame.centery;
			}
			this.element.css({
				'left': (this.x - cx * this.scale) + 'px',
				'top': (this.y - cy * this.scale) + 'px'
			});
		}
		return({'top':this.y, 'left':this.x});
	}


	this.startSequence = function(sequenceName, params){
		var n, callback, frameRate, sequence, iterations, newParams;

		if(this.set.sequences[sequenceName] == undefined) return false;
		newParams = {
			frames: this.set.sequences[sequenceName].frames,
			frameRate: this.set.sequences[sequenceName].frameRate,
			callback: function(){},
			stepCallback: function(){},
			iterations: 1,
			currentFrame: 0,
			stop: false
		};

		if(params != undefined){
			for(n in params){
				switch(trim(n).toLowerCase()){
					case 'framerate':
						newParams.frameRate = params[n];
						break;
					case 'callback':
						newParams.callback = params[n];
						break;
					case 'iterations':
						newParams.iterations = params[n];
						break;
					case 'stepcallback':
						newParams.stepCallback = params[n];
						break;
					case 'frametimes':
						newParams.frameTimes = params[n];
						newParams.currentFrameTime = 0;
						break;
				}
			}
		}

		this.doSequenceStep(newParams);
		return newParams;
	}

	// kill the current sequence
	this.stopSequence = function(sequenceParams, docallback){
		sequenceParams.stop = true;
		if(docallback == true){
			sequenceParams.callback();
		}
	}

	// make this iteration of the sequence it's final iteration, adding a new callback if desired
	this.finishSequence = function(sequenceParams, callback){
		sequenceParams.iterations = 1;
		if(callback != undefined){
			var oldCallback = sequenceParams.callback;
			var newCallback = function(){
				oldCallback();
				callback();
			}
			sequenceParams.callback = newCallback;
		}
	}

	this.doSequenceStep = function(params){
		var doNextFrame = true;
		var animDelay = params.frameRate;

		if(params.stop == true){
			return;
		}

		if(params.frameTimes != undefined){
			animDelay = params.frameTimes[params.currentFrameTime];
			params.currentFrameTime = (params.currentFrameTime + 1) % params.frameTimes.length;
		}

		this.setFrame(params.frames[params.currentFrame]);
		params.stepCallback();
		params.currentFrame++;
		
		if(params.currentFrame == params.frames.length){
			if(params.iterations == 1){
				doNextFrame = false;
				params.callback();
			}else if(params.iterations == 0){
				params.currentFrame = 0;
			}else{
				params.currentFrame = 0;
				params.iterations--;
			}
		}
		if(doNextFrame){
			setTimeout(function(){me.doSequenceStep(params)}, animDelay);
		}
	}
/* // concept to work on later 
	this.animate = function(params){
		var n;
		var newParams = {
			deltax:0,
			deltay:0,
			steps:0,
			sequence:null
		};
		for(n in params){
			switch(n){
				case 'dx': newParams.deltax = params[n]; break;
				case 'dy': newParams.deltay = params[n]; break;
				case 'steps': newParams.steps = params[n]; break;
				case 'sequence': newParams.sequence = sequence; break;
			}
		}
		if(newParams.steps == 0 && newParams.sequence == null){
			return false;
		}

	}
*/
	// finally, some initialization
	this.setFrameSize(this.set.frameWidth, this.set.frameHeight);
}

var spriteSet = function(){
	var me = this;
	this.frames = {};
	this.sequences = {};
	this.defaultFrameRate = 40;
	this.centerx = this.centery = 0;

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
					for(m in frameSet){
						newSequence.frames[m] = trim(frameSet[m]);
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
					newFrame['y'] += this.frameWidth * val;
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
	this.setImage = function(file){
		me.image = file;
		var cacheDiv = $('<div><div>');
		cacheDiv.css({
			width:'0px',
			height: '0px',
			position: 'absolute',
			top: '-1px',
			left: '-1px',
			overflow: 'hidden'
		});
		$('body').append(cacheDiv);
		var imgElement = $('<img src="' + file + '">');
		cacheDiv.append(imgElement);
		this.imageWidth = imgElement.width();
		this.imageHeight = imgElement.height();
	}
}

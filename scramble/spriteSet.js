function trim(stringToTrim) {
	return stringToTrim.replace(/^\s+|\s+$/g,"");
}

var spriteClass = function(set){
	this.set = set;
	this.frame = null;
	this.image = $('<img src="' + set.image + '">');
	this.element = $('<div></div>');
	this.width = this.height = this.x = this.y = 0;


	this.image.css({
		'position': 'absolute',
		'left': -this.y,
		'top': -this.x
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
		framename = trim(' ' + framename).toLowerCase();
	
		if(this.set.frames[framename] != undefined){
			this.frame = this.set.frames[framename];
			this.setSize(this.frame.width, this.frame.height);
			this.refreshFrame();
		}
	}

	this.setSize = function(w, h){
		this.width = w;
		this.height = h;
		this.element.css({
			width: this.width + 'px',
			height: this.height + 'px'
		});
	}

	this.refreshFrame = function(){
		this.image.css({
			'position': 'absolute',
			'left': -this.frame.x + 'px',
			'top': -this.frame.y + 'px'
		});
	}

	this.refreshImage = function(){
		this.image = $('<img src="' + this.set.image + '">');
		this.element.empty();
		this.element.append(this.image);
		this.refreshFrame();
	}

	this.draw = function(target){
		target.append(this.element);
	}

	this.position = function(x, y){
		if(x != undefined && y != undefined){
			this.x = x;
			this.y = y;
			this.element.css({
				'left': this.x + 'px',
				'top': this.y + 'px'
			});
		}
		return({'top':this.y, 'left':this.x});
	}

	this.setSize(this.set.frameWidth, this.set.frameHeight);
}

var spriteSet = function(){
	var me = this;
	this.frames = {};
	this.sequences = {};

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
			'height': this.frameHeight
		};
		for(n in params){
			switch(n){
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
			}
		}
		this.frames[id] = newFrame;
	}

	this.loadSequence = function(datastr){
		var sequenceName = undefined;
		var newSequence = [];
		var params = datastr.split(',');
		var parts, arg, val, n, m;
		for(n in params){
			parts = params[n].split('=');
			arg = trim(parts[0]);
			val = trim(parts[1]);
			switch(arg){
				case 'name':
					sequenceName = val;
					break;
				case 'frames':
					frameSet = val.split(' ');
					for(m in frameSet){
						newSequence[m] = trim(frameSet[m]);
					}
					break;
			}

		}
		if(sequenceName != undefined && newSequence.length){
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
			'height': this.frameHeight
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
		cacheDiv.append($('<img src="' + file + '">'));
	}
}

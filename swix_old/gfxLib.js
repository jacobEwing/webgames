// make text with double quotes safe to reference inside double quotes
function parseQuotes(text){
	if(text == undefined) return text;
	if(typeof(text) != 'string') return text;
	returnval = text.replace(/\\/g, '\\\\');
	returnval = returnval.replace(/\"/g, '\\"');
	return returnval;
}

// a generic class for handling page elements that are animated by switching frames
var animationElement = function(objName){
	var globalName;
	var frame, numFrames, currentFrame;
	var sequence, sequenceKey;
	var position, scale;
	var canvas; // a separate div that the animation happens in
	var element;
	var defaultFrameTime;
//	var uniqueId; // a key by which this object can be globally identified
	var child; // an array of child animationElements
  
	this.globalName = objName;
	this.position = { x : 0, y : 0 };
	this.frame = [];
	this.numFrames = 0;
	this.sequence = [];
	this.sequenceKey = null;
	this.defaultFrameTime = 40;
	this.currentFrame = null;
	this.scale = 1;
	this.child = [];

	// the drawing canvas upon which this element and it's childern are drawn
	this.canvas = $("<div id=\"" + objName + "Canvas\"></div>");
	this.canvas.css({'position' : 'absolute', 'left' : '0px', 'top' : '0px'});

	this.element = $("<div id=\"" + objName + "Element\"></div>");
	this.element.css({'position' : 'absolute', 'left' : '0px', 'top' : '0px'});
	this.element.appendTo(this.canvas);

//	this.uniqueId = randomText();

	this.loadFrames = function(url, callback){
		var animObj = this;
		$.get(url, null, function(result){
			eval('data = ' + result);
			for(frame in data['frames']){
				animObj.addFrame(data['path'] + '/' + data['frames'][frame]['name'], frame);
				animObj.frame[frame].setDimensions(data['frames'][frame]['w'], data['frames'][frame]['h']);
				if(data['frames'][frame]['offset'] != undefined){
					animObj.frame[frame].setOffset(data['frames'][frame]['offset'][0],data['frames'][frame]['offset'][1]);
				}
			}
			for(sequence in data['sequences']){
				obj = {'___':null};
				seq = data['sequences'][sequence];
				for(val in seq['params']){
					eval('obj.' + val + ' = "' + seq['params'][val] + '"');
				}
				animObj.addSequence(sequence, seq['frames'], obj);
			}
			if(callback != undefined){
				callback(data);
			}
		});
	}

	// append an additional animobj to this one's canvas
	this.addChild = function(child){
		this.child[this.numChildren++] = child;
		child.appendTo(this.canvas);
	}

	this.dropChild = function(child){
		for(n in this.child){
			if(this.child[n] == child){
				this.child[n].detach();
				this.child[n] = undefined;
				break;
			}
		}
	}

	this.copy = function(newGlobalName){
		var obj = new animationElement(newGlobalName);
		for(n in this.frame) obj.frame[n] = this.frame[n].copy();
		for(n in this.sequence) obj.sequence[n] = this.copySequence(n);
		obj.setPosition(this.position.x, this.position.y);
		obj.numFrames = this.numFrames;
		obj.currentFrame = this.currentFrame;
		obj.sequenceKey = this.sequenceKey;
		obj.setScale(this.scale);
		return obj;
	}

	this.copySequence = function(sequenceName){
		seq = this.sequence[sequenceName];
		obj = {};
		obj.steps = seq.steps;
		obj.flags = seq.flags;
		obj.speed = seq.speed;
		this.processSequenceFlags(obj);
		return obj;
	}

	this.setScale = function(newScale){
		if(newScale != this.scale){
			this.scale = newScale;
			if(this.currentFrame != null){
				this.currentFrame.setScale(this.scale);
			}
		}
	}

	// append this animation element to another one
	this.appendTo = function(canvas){
		canvas.append(this.canvas);
	}

	// remove this animation element from it's parent DOM object
	this.detach = function(){
		this.canvas.remove();
	}

	// add a sequence of frames to this animation canvas.
	// Steps are passed in an array (eg. [1, 2, 3, 4, 3, 2], or ['north', 'east', 'south', 'west'])
	// Flags is an array of additional parameters (eg. {'mode':'loop', 'speed':32})
	this.addSequence = function(sequenceName, sequenceSteps, sequenceFlags){
		var n;
		this.sequence[sequenceName] = {};
		this.sequence[sequenceName].steps = sequenceSteps;
		this.sequence[sequenceName].flags = sequenceFlags;
		this.sequence[sequenceName].speed = this.defaultFrameTime;
		if(sequenceFlags != undefined){
			this.processSequenceFlags(this.sequence[sequenceName]);
		}
	}

	this.processSequenceFlags = function(seq){
		for(n in seq.flags){
			switch(n){
				case 'mode': seq.mode = seq.flags[n]; break;
				case 'speed': seq.speed = seq.flags[n]; break;
				case 'times': seq.times = seq.flags[n]; break;
			}
		}
	}

	this.addFrame = function(imageFile, index){
		if(index == undefined){
			index = this.numFrames;
		}
		this.frame[index] = new imgElement(imageFile);
		this.numFrames++;
	}

	this.setPosition = function(x, y){
		this.position.x = x;
		this.position.y = y;
		this.canvas.css({
			'left' : x + 'px',
			'top' : y + 'px'
		});
	}

	this.drawFrame = function(frameIndex){
		if(this.frame[frameIndex].scale != this.scale){
			this.frame[frameIndex].setScale(this.scale);
		}
		this.clear();
		this.frame[frameIndex].appendTo(this.element);
		this.frame[frameIndex].setPosition(0, 0);
		this.currentFrame = this.frame[frameIndex];
	}

	// empty our animation div
	this.clear = function(){
		this.element.empty();
		this.currentFrame = null;
	}

	this.startSequence = function(sequenceName, params){
	//	 params is an array of argument:value pairs, current uses are:
	//		keepIndex : true / false value.  If true, the frame index last used is the starting index on this sequence
		var skey = '';
		for(n = 0; n < 12; n++){
			skey = skey + String.fromCharCode(65 + Math.round(Math.random()) * 32 + Math.round(Math.random() * 25));
		}
		this.sequenceKey = skey;
		
		if(params == undefined){
			idx = 0;
		}else if(params['idx'] == undefined){
			if(params['keepIndex'] == true && this.lastidx != undefined){
				idx = this.lastidx;
			}else{
				idx = 0;
			}
		}else{
			idx = params['idx'];
		}

		this.doSequenceStep(sequenceName, idx, skey, params);
	}

	this.stopSequence = function(){
		this.sequenceKey = '';
	}

	this.doSequenceStep = function(sequenceName, idx, skey, params){
		// ensure that there's only one sequence being followed
		if(skey != this.sequenceKey) return false;
		var delay;
		var seq = this.sequence[sequenceName];

		if(params == undefined || params.frameRate == undefined){
			delay = seq.speed;
		}else{
			delay = params.frameRate;
		}

		this.drawFrame(seq.steps[idx]);

		if(seq.times != undefined){
			delay = seq.times[idx];
			alert(idx + ': ' + delay);
		}
		this.lastidx = idx;
		idx++;
		if(idx == seq.steps.length){
			if(seq.mode != undefined){
				switch(seq.mode){
					case 'loop':
						idx %= seq.steps.length;
						break;
					default:
						break;
				}
			}
		}

		paramString = '{';
		for(n in params){
			if(paramString != '{') paramString += ',';
			paramString += '"' + parseQuotes(n) + '":' + parseQuotes(params[n]) ;
		}
		paramString += '}';

		if(idx < seq.steps.length){
//alert(this.globalName + '.doSequenceStep("' + sequenceName + '", ' + (idx) + ', "' + skey + '", ' + paramString  + ')');
			setTimeout(this.globalName + '.doSequenceStep("' + sequenceName + '", ' + (idx) + ', "' + skey + '", ' + paramString  + ')', delay);
		}else if(params.callback != null){
			params.callback();
		}

	}

	// move to the specified location, at a speed that is scaled with the object
	this.moveTo = function(goalx, goaly, params){
		var delay = null;

		if(params['stepsize'] == undefined){
			return "animationElement.moveto error: stepsize parameter required";
		}
		if(params['numSteps'] != undefined){
			numSteps = params['numSteps'];
		}
		if(params['delay'] != undefined){
			delay = params['delay'];
		}
		if(delay == null){
			delay = this.defaultFrameTime;
		}
		dx = goalx - this.position.x;
		dy = goaly - this.position.y;
		dist = Math.sqrt(dx * dx + dy * dy);
		if(dist < params['stepsize']){
			this.setPosition(goalx, goaly);
			if(params['callback'] != undefined){
				setTimeout(params['callback'], delay);
			}
			
		}else{
			dx = params['stepsize'] * dx / dist;
			dy = params['stepsize'] * dy / dist;
			this.setPosition(this.position.x + dx * this.scale, this.position.y + dy * this.scale);

			paramString = '{';
			for(n in params){
				if(paramString != '{'){
					paramString += ',';
				}
				paramString += "'" + n + "':'" + params[n] + "'";
			}
			paramString += '}';

			setTimeout(this.globalName + '.moveTo(' + goalx + ', ' + goaly + ', ' + paramString + ')', delay);
		}

	}

	// slide to the specified location within the specified timeframe
	this.slide = function(deltax, deltay, time, params){
		var numSteps = null;
		var delay = null;
		if(params != undefined){
			if(params['numSteps'] != undefined){
				numSteps = params['numSteps'];
			}
			if(params['delay'] != undefined){
				delay = params['delay'];
			}
		}

		if(delay == null){
			delay = this.defaultFrameTime;
		}
		if(numSteps == undefined){
			numSteps = Math.floor(time / delay);
		}

		if(numSteps == 0){
			// this is our last animation step
			dx = deltax;
			dy = deltay;
		}else{
			dx = deltax / numSteps;
			dy = deltay / numSteps;
			deltax -= dx;
			deltay -= dy;
		}

		this.setPosition(this.position.x + dx * this.scale, this.position.y + dy * this.scale);
		if(numSteps == 0){
			if(params != undefined){
				if(params['callback'] != undefined){
					setTimeout(params['callback'], delay);
				}
			}
		}else{
			newParams = {
				'delay' : delay,
				'numSteps' : numSteps - 1
			};
			if(params != undefined && params['callback'] != undefined) newParams['callback'] = parseQuotes(params['callback']);

			paramString = '{';
			for(n in newParams){
				if(paramString != '{'){
					paramString += ',';
				}
				paramString += "'" + n + "':'" + newParams[n] + "'";
			}
			paramString += '}';

			setTimeout(this.globalName + '.slide(' + deltax + ', ' + deltay + ', ' + (time - delay) + ', ' + paramString + ')', delay);
		}
	}
}

var imgElement = function(imagename){
	var element;
	var drawOffset;
	var realWidth, realHeight, width, height, scale;
	var position;
	var imageName;

	this.scale = 1;
	this.realWidth = this.width = this.realHeight = this.height = -1;
	this.drawOffset = {x : 0, y : 0};
	this.position = {x : 0, y : 0};
	this.element = $('<img src="' + imagename + '"></img>');
	this.imageName = imagename;
	this.element.css({
		'position':'absolute',
		'top': '0px',
		'left': '0px'
	});

	this.setId = function(newId){
		this.element.attr('id', newId);
	}

	this.copy = function(){
		var obj = new imgElement(this.imageName);
		obj.position.x = this.position.x;
		obj.position.y = this.position.y;
		obj.realWidth = this.realWidth;
		obj.width = this.width;
		obj.realHeight = this.realHeight;
		obj.height = this.height;
		obj.scale = this.scale;
		return obj;
	}

	this.setDimensions = function(w, h){
		this.width = this.realWidth = w;
		this.height = this.realHeight = h;
	}

	this.appendTo = function(target){
		target.append(this.element);
	}

	this.setOffset = function(x, y){
		this.drawOffset.x = x;
		this.drawOffset.y = y;
	}

	this.setPosition = function(x, y){
		this.element.css({
			'left': (x - this.drawOffset.x * this.scale) + 'px',
			'top': (y - this.drawOffset.y * this.scale) + 'px'
		});
		this.position.x = x;
		this.position.y = y;
	}

	this.setScale = function(ratio){
		if(ratio > 0){
			this.scale = ratio;
			this.width = this.realWidth * this.scale;
			this.height = this.realHeight * this.scale;
			this.element.css({'width':this.width});
			this.setPosition(this.position.x, this.position.y);
		}
	}

}

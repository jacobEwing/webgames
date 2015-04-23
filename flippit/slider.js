/*
Creates a two dimensional slider widget.  It can be used to slide along any line segment,
using a jQuery object (e.g. $('<div>foo</div>')), and adjust a single value.  The value can
be a float, an integer, or a set of arbitrary values.

parameters:
	x1, y1, x2, y2: The locations of the two end points
	min, max: the range of values to use
	value: the starting value to which it's set
	values:  parameter for specifying the type of slider. Can be "int" or "integer" to
	         specify integer values, or an array of arbitrary values.
	handle: the jQuery element that gets dragged
	ondrag: a callback function that gets passed the current value when dragging the slider
	onrelease: a callback function that gets passed the current value when the widget is released

Depends on the projection_on_segment function, which is currently defined in helperFuncs.js
*/

var sliderClass = function(params){
	me = this;
	this.x1 = this.y1 = this.x2 = this.y2 = this.min = this.max = 0;
	this.handle = '';
	this.value = 0;
	this.dragging = false;
	this.round = false;
	this.use_array = false;
	this.values = null;
	this.dragCallback = null;
	this.releaseCallback = null;
	this.realIndex = null;

	var tag, newValue = null;
	for(tag in params){
		switch(tag){
			case 'x1': case 'x2': case 'y1': case 'y2': case 'min': case 'max': case 'handle':
				this[tag] = params[tag];
				break;
			case 'values':
				if(params[tag] == 'integer' || params[tag] == 'int'){
					this.round = true;
				}else if(is_array(params[tag])){
					this.round = true;
					this.use_array = true;
					this.min = 0;
					this.max = params[tag].length - 1;
					this.values = params[tag];
				}
				break;
			case 'ondrag': case 'onDrag':
				this.dragCallback = params[tag];
				break;
			case 'onrelease': case 'onRelease':
				this.releaseCallback = params[tag];
				break;
			case 'value':
				newValue = params[tag];
		}
	}

	this.hypotenuse = Math.sqrt((this.x2 - this.x1) * (this.x2 - this.x1) + (this.y2 - this.y1) * (this.y2 - this.y1));

	this.draw = function(target){
		target.append(this.handle);
		this.target = target;

		this.handle.mousedown(function(e){
			me.mouseOffset = {x: e.pageX - me.handle.offset().left, y: e.pageY - me.handle.offset().top};

			$(document).bind('mousemove.sliderWidget', function(e){
			
				var targetX = e.pageX - me.target.position().left - me.mouseOffset.x;
				var targetY = e.pageY - me.target.position().top - me.mouseOffset.y;
				var oldValue = me.value;
				var projected = projection_on_segment(me.x1, me.y1, me.x2, me.y2, targetX, targetY);

				var dx = projected.x - me.x1;
				var dy = projected.y - me.y1;
				me.value = me.min + (me.max - me.min) * Math.sqrt(dx * dx + dy * dy) / me.hypotenuse;
				if(me.round){
					me.value = Math.round(me.value);
					projected.x = me.x1 + (me.value - me.min) * (me.x2 - me.x1) / (me.max - me.min);
					projected.y = me.y1 + (me.value - me.min) * (me.y2 - me.y1) / (me.max - me.min);
				}
				if(me.use_array){
					me.realIndex = me.value;
					me.value = me.values[me.value];
				}
				if(me.dragCallback != null && oldValue != me.value) me.dragCallback(me.value);
				me.handle.css({'left':projected.x + 'px', 'top':projected.y + 'px'});

				return false;
			});

			$(document).bind('mouseup.sliderWidget', function(){
				$(document).unbind('mousemove.sliderWidget');
				$(document).unbind('mouseup.sliderWidget');
				if(me.releaseCallback != null){
					me.releaseCallback(me.value);
				}
			});

			return false;
		});
	}

	this.setValue = function(value){
		if(value == undefined) return false;
		if(value < this.min) value = this.min;
		if(value > this.max) value = this.max;
		this.value = value;
		if(this.use_array){
			this.realIndex = this.value;
			this.value = this.values[this.value];
		}
		this.updatePosition();
	}

	this.updatePosition = function(){
		var ratio;
		if(this.use_array){
			ratio = this.realIndex / (this.values.length - 1);
		}else if(this.round){
			ratio = (this.value - this.min) / (this.max - this.min);
		}else{
			ratio = (this.value - this.min) / (this.max - this.min);
		}
		this.handle.css({
			'position': 'absolute',
			'left': (this.x1 + (this.x2 - this.x1) * ratio) + 'px',
			'top': (this.y1 + (this.y2 - this.y1) * ratio) + 'px'
		});
	}

	if(newValue != null) this.setValue(newValue);
}

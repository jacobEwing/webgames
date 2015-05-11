var constants = function(){
	this.rotationAng = Math.PI / 36; // five degrees
	return {
		'rotcos' : Math.cos(this.rotationAng),
		'rotsin' : Math.sin(this.rotationAng)
	};
}();

var globals = {
	'animating' : 0
};

var cellClass = function(){
	this.sprite = this.active = this.celltype = null;
	this.position = {x : 0, y : 0};
	this.children = [];
	if(arguments.length == 1) this.initialize(arguments[0]);
};

cellClass.prototype.initialize = function(params){
	//var me = this;
	for(var idx in params){
		switch(idx){
			case 'sprite':
				this.sprite = new spriteClass(params[idx]);
				break;
			case 'active': case 'celltype':
				this[idx] = params[idx];
				break;
			case 'position':
				try{
					this.position = {
						'x' : params[idx].x,
						'y' : params[idx].y
					};
				}catch(e){
					throw "cellClass::initialize: position parameter expects an object with x, y values";
				}
				break;
			default:
				throw "cellClass::initialize: Invalid parameter \"" + idx + "\"";
		}
	}
	if(this.sprite == null || this.active == null || this.celltype == null){
		throw "cellClass::initialize: parameters must include 'sprite', 'active', and 'celltype'";
	}

	this.sprite.position(this.position.x, this.position.y);

	if(this.active){
		if(this.celltype == 'flip'){
			this.sprite.setFrame('blue');
		}else if(this.celltype == 'spin'){
			this.sprite.setFrame('gold');
		}
	}else{
		this.sprite.setFrame('black');
	}
	this.sprite.image.data('cell', this);
	this.sprite.image.click(
		function(){
			var cell = $(this).data('cell');
			cell.act();
			return false;
		}
	);
	this.sprite.image.mousedown(function(){return false;});
};

cellClass.prototype.draw = function(target){
	var realpos = realPosition(this.position.x, this.position.y);
	this.sprite.position(realpos.x, realpos.y);
	this.sprite.draw(target);
};

cellClass.prototype.act = function(){
	if(!this.active || globals.animating) return;
	if(this.celltype == 'spin'){
		this.rotNeighbours();
	}else if(this.celltype == 'flip'){
		this.flipNeighbours();
	}
};

cellClass.prototype.getNeighbours = function(){
	var n;
	var rval = [];
	for(n = 0; n < cells.length; n++){
		if(cells[n].position.y == this.position.y){
			if(Math.abs(cells[n].position.x - this.position.x) == 1){
				rval[rval.length] = cells[n];
			}
		}else if(cells[n].position.y == this.position.y - 1){
			dx = cells[n].position.x - this.position.x;
			if(dx == 1 || dx == 0){
				rval[rval.length] = cells[n];
			}
		}else if(cells[n].position.y == this.position.y + 1){
			dx = cells[n].position.x - this.position.x;
			if(dx == -1 || dx == 0){
				rval[rval.length] = cells[n];
			}
		}
	}
	return rval;
};

// flips the six cells that surround the current selected one
cellClass.prototype.flipNeighbours = function(){
	var n;
	var neighbourList = this.getNeighbours();
	for(n = 0; n < neighbourList.length; n++){
		neighbourList[n].flip();
	}
	stepsTaken ++;
	$('#stepstaken').html(stepsTaken);
};

cellClass.prototype.flip = function(){
	globals.animating++;
	var flipParams = {
		'callback' : function(){
			globals.animating--;
			if(globals.animating == 0){
				checkForWin();
			}
		}
	};

	if(this.celltype == 'flip'){
		if(this.active){
			this.sprite.startSequence('blue2black', flipParams);
			this.active = 0;
		}else{
			this.sprite.startSequence('black2blue', flipParams);
			this.active = 1;
		}
	}else if(this.celltype == 'spin'){
		if(this.active){
			this.sprite.startSequence('gold2black', flipParams);
			this.active = 0;
		}else{
			this.sprite.startSequence('black2gold', flipParams);
			this.active = 1;
		}
	}
};

cellClass.prototype.setPosition = function(x, y, noDraw){
	if(noDraw == undefined) noDraw = false;
	this.position.x = x;
	this.position.y = y;
	pos = this.realPosition(x, y);
	if(!noDraw){
		this.sprite.setPosition(pos.x, pos.y);
	}
};

cellClass.prototype.rotNeighbours = function(){
	// first, grab the neighbours we'll be rotating
	var n;
	var dx, dy;
	var me = this;
	var childSequence;
	var myRealPos = this.realPosition();
	this.children = this.getNeighbours();
	for(n = 0; n < this.children.length; n++){
		//this.children[n].sprite.element.remove().appendTo($('#spriteTest'));
		this.children[n].sprite.element.appendTo($('#spriteTest'));
		var childRealPos = this.children[n].realPosition();
		this.children[n].transformation = {
			sine : Math.sin(5),
			cosine : Math.cos(5),
			relPos : {
				x : childRealPos.x - myRealPos.x,
				y : childRealPos.y - myRealPos.y
			}
		};
//		$('body').append(this.children[n].transformation.relPos.x + ', ' + this.children[n].transformation.relPos.y);
		if(this.children[n].active){
			if(this.children[n].celltype == 'flip'){
				childSequence = 'rotblue';
			}else if(this.children[n].celltype == 'spin'){
				childSequence = 'rotgold';
			}else{
				// shouldn't happen, but for the sake of completeness
				throw "cellClass::rotNeighbours: Invalid cell type";
			}
		}else{
			childSequence = 'rotblack';
		}
		globals.animating++;

		this.children[n].sprite.startSequence(childSequence, {'method' : 'manual'});

		dx = this.children[n].position.x - this.position.x;
		dy = this.children[n].position.y - this.position.y;

		if(dy == 0){
			if(dx == 1){
				this.children[n].setPosition(this.position.x, this.position.y + 1, true);
			}else if(dx == -1){
				this.children[n].setPosition(this.position.x, this.position.y - 1, true);
			}
		}else if(dy == -1){
			if(dx == 1){
				this.children[n].setPosition(this.position.x + 1, this.position.y, true);
			}else if(dx == 0){
				this.children[n].setPosition(this.position.x + 1, this.position.y - 1, true);
			}
		}else if(dy == 1){
			if(dx == -1){
				this.children[n].setPosition(this.position.x - 1, this.position.y, true);
			}else if(dx == 0){
				this.children[n].setPosition(this.position.x - 1, this.position.y + 1, true);
			}
		}
	}

	this.sprite.startSequence('rotgold', {
		'stepCallback' : function(currentFrame){
			//alert(currentFrame);
			var myRealPos = me.realPosition();	
			var n, newx, newy;
			for(n = 0; n < me.children.length; n++){
				newx = me.children[n].transformation.relPos.x * constants.rotcos - me.children[n].transformation.relPos.y * constants.rotsin;
				newy = me.children[n].transformation.relPos.x * constants.rotsin + me.children[n].transformation.relPos.y * constants.rotcos;
				me.children[n].transformation.relPos = { x : newx, y : newy };

				me.children[n].sprite.position(
					newx + myRealPos.x + 32,
					newy + myRealPos.y + 32 
				);

				me.children[n].sprite.doSequenceStep();
			}
			
		},
		'callback' : function(){
			var n;
			for(n = 0; n < me.children.length; n++){
				globals.animating--;
				me.children[n].transformation = undefined;

			}
			stepsTaken ++;
			$('#stepstaken').html(stepsTaken);
		}
	});

};

cellClass.prototype.realPosition = function(){
	return realPosition(this.position.x, this.position.y);
};

function realPosition(x, y){
	return {'x':48 * x - drawOffset.x, 'y': 27.5 * x + 55 * y + drawOffset.y};
}

//var cellSprite, cells;
//var drawOffset = {x : 0, y : 0};

/*
$().ready(function(){

	cells = [];
	cellSprite = new spriteSet('tiles.sprite', function(){
		var n;
		for(n = 0; n < 9; n++){
			cells[n] = new cellClass({
				'sprite' : cellSprite,
				'active' : 1,
				'celltype' : n % 2 ? 'flip' : 'spin',
				'position' : {x : 3 + (n % 3), y : Math.floor(n / 3) - (n % 3 == 2 ? 1 : 0)}
			});
			cells[n].draw($('#spriteTest'));
		}
	});

});
*/

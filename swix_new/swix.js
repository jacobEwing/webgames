var cellClass = function(){
	this.sprite = this.active = this.celltype = null;
	this.position = {x : 0, y : 0};
	if(arguments.length == 1) this.initialize(arguments[0]);
};

cellClass.prototype.initialize = function(params){
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
				//alert("params[" + idx + "] = " + params[idx]);
		}
	}
	if(this.sprite == null || this.active == null || this.celltype == null){
		throw "cellClass::initialize: parameters must include 'sprite', 'active', and 'celltype'";
	}

	this.sprite.position(this.position.x, this.position.y);

	if(this.active){
		if(this.celltype == 'flip'){
			this.sprite.setFrame('gold');
		}else if(this.celltype == 'spin'){
			this.sprite.setFrame('blue');
		}
	}else{
		this.sprite.setFrame('black');
	}
};

cellClass.prototype.draw = function(target){
	this.sprite.draw(target);
};

var cellSprite, cells;

$().ready(function(){

	var cell;

	cellSprite = new spriteSet('tiles.sprite', function(){
		cell = new cellClass({
			'sprite' : cellSprite,
			'active' : 1,
			'celltype' : 'flip',
			'position' : {x : 6, y : 3}
		});

		cell.draw($('#spriteTest'));
	});

});

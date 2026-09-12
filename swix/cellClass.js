'use strict';

var constants = function() {
	let rotationAng = Math.PI / 36; // five degrees
	return {
		'rotcos': Math.cos(rotationAng),
		'rotsin': Math.sin(rotationAng)
	};
}();

var globals = {
	'animating': 0
};

var cellClass = function() {
	this.sprite = this.active = this.celltype = null;
	this.position = { x: 0, y: 0 };
	this.children = [];

	if (arguments.length == 1) this.initialize(arguments[0]);

	this.toString = function() {
		var rval =
			'{x:' + this.position.x
			+ ',y:' + this.position.y
			+ ',a:' + this.active
			+ ',t:"' + this.celltype + '"}';
		return rval;
	};
};

cellClass.prototype.initialize = function(params) {
	for (var idx in params) {
		switch (idx) {
			case 'sprite':
				this.sprite = new spriteClass(params[idx]);
				break;
			case 'active':
			case 'celltype':
				this[idx] = params[idx];
				break;
			case 'position':
				try {
					this.position = {
						'x': params[idx].x,
						'y': params[idx].y
					};
				} catch (e) {
					throw "cellClass::initialize: position parameter expects an object with x, y values";
				}
				break;
			default:
				throw "cellClass::initialize: Invalid parameter \"" + idx + "\"";
		}
	}

	if (this.sprite == null || this.active == null || this.celltype == null) {
		throw "cellClass::initialize: parameters must include 'sprite', 'active', and 'celltype'";
	}

	this.sprite.position(this.position.x, this.position.y);

	if (this.active) {
		if (this.celltype == 'flip') {
			this.sprite.setFrame('blue');
		} else if (this.celltype == 'spin') {
			this.sprite.setFrame('gold');
		}
	} else {
		this.sprite.setFrame('black');
	}

	this.sprite.image.cell = this;
	this.sprite.image.addEventListener('click', function(e) {
		var cell = this.cell;
		cell.act();
		e.preventDefault();
		return false;
	});
	this.sprite.image.addEventListener('mousedown', function(e) {
		e.preventDefault();
		return false;
	});
};

cellClass.prototype.draw = function(target) {
	var realpos = realPosition(this.position.x, this.position.y);
	this.sprite.position(realpos.x, realpos.y);
	this.sprite.draw(target);
};

cellClass.prototype.act = function() {
	if (!this.active || globals.animating) return;

	if (this.celltype == 'spin') {
		this.rotNeighbours();
	} else if (this.celltype == 'flip') {
		this.flipNeighbours();
	}
};

cellClass.prototype.getNeighbours = function() {
	var n, dx;
	var rval = [];

	for (n = 0; n < cells.length; n++) {
		if (cells[n].position.y == this.position.y) {
			if (Math.abs(cells[n].position.x - this.position.x) == 1) {
				rval[rval.length] = cells[n];
			}
		} else if (cells[n].position.y == this.position.y - 1) {
			dx = cells[n].position.x - this.position.x;
			if (dx == 1 || dx == 0) {
				rval[rval.length] = cells[n];
			}
		} else if (cells[n].position.y == this.position.y + 1) {
			dx = cells[n].position.x - this.position.x;
			if (dx == -1 || dx == 0) {
				rval[rval.length] = cells[n];
			}
		}
	}

	return rval;
};

// flips the six cells that surround the current selected one
cellClass.prototype.flipNeighbours = function() {
	var n;
	var neighbourList = this.getNeighbours();

	playSound('swish');

	for (n = 0; n < neighbourList.length; n++) {
		neighbourList[n].flip();
	}

	stepsTaken++;
	document.getElementById('stepstaken').innerHTML = stepsTaken;
};

cellClass.prototype.flip = function() {
	globals.animating++;

	var flipParams = {
		'callback': function() {
			globals.animating--;
			if (globals.animating == 0) {
				checkForWin();
			}
		}
	};

	if (this.celltype == 'flip') {
		if (this.active) {
			this.sprite.startSequence('blue2black', flipParams);
			this.active = 0;
		} else {
			this.sprite.startSequence('black2blue', flipParams);
			this.active = 1;
		}
	} else if (this.celltype == 'spin') {
		if (this.active) {
			this.sprite.startSequence('gold2black', flipParams);
			this.active = 0;
		} else {
			this.sprite.startSequence('black2gold', flipParams);
			this.active = 1;
		}
	}
};

cellClass.prototype.setPosition = function(x, y, noDraw) {
	if (noDraw == undefined) noDraw = false;

	this.position.x = x;
	this.position.y = y;

	let pos = this.realPosition(x, y);

	if (!noDraw) {
		this.sprite.setPosition(pos.x, pos.y);
	}
};

cellClass.prototype.rotNeighbours = function() {
	// first, grab the neighbours we'll be rotating
	var n;
	var dx, dy;
	var childSequence;
	var myRealPos = this.realPosition();

	this.children = this.getNeighbours();
	playSound('crank');

	for (n = 0; n < this.children.length; n++) {

		var childRealPos = this.children[n].realPosition();
		this.children[n].transformation = {
			sine: Math.sin(5),
			cosine: Math.cos(5),
			relPos: {
				x: childRealPos.x - myRealPos.x,
				y: childRealPos.y - myRealPos.y
			}
		};

		if (this.children[n].active) {
			if (this.children[n].celltype == 'flip') {
				childSequence = 'rotblue';
			} else if (this.children[n].celltype == 'spin') {
				childSequence = 'rotgold';
			} else {
				// shouldn't happen, but for the sake of completeness
				throw "cellClass::rotNeighbours: Invalid cell type";
			}
		} else {
			childSequence = 'rotblack';
		}

		globals.animating++;

		this.children[n].sprite.startSequence(childSequence, { 'method': 'manual' });

		dx = this.children[n].position.x - this.position.x;
		dy = this.children[n].position.y - this.position.y;

		if (dy == 0) {
			if (dx == 1) {
				this.children[n].setPosition(this.position.x, this.position.y + 1, true);
			} else if (dx == -1) {
				this.children[n].setPosition(this.position.x, this.position.y - 1, true);
			}
		} else if (dy == -1) {
			if (dx == 1) {
				this.children[n].setPosition(this.position.x + 1, this.position.y, true);
			} else if (dx == 0) {
				this.children[n].setPosition(this.position.x + 1, this.position.y - 1, true);
			}
		} else if (dy == 1) {
			if (dx == -1) {
				this.children[n].setPosition(this.position.x - 1, this.position.y, true);
			} else if (dx == 0) {
				this.children[n].setPosition(this.position.x - 1, this.position.y + 1, true);
			}
		}
	}

	this.sprite.startSequence('rotgold', {
		'stepCallback': (currentFrame) => {
			var myRealPos = this.realPosition();
			var n, newx, newy;

			for (n = 0; n < this.children.length; n++) {
				newx = this.children[n].transformation.relPos.x * constants.rotcos - this.children[n].transformation.relPos.y * constants.rotsin;
				newy = this.children[n].transformation.relPos.x * constants.rotsin + this.children[n].transformation.relPos.y * constants.rotcos;
				this.children[n].transformation.relPos = { x: newx, y: newy };

				this.children[n].sprite.position(
					newx + myRealPos.x + 32,
					newy + myRealPos.y + 32
				);

				this.children[n].sprite.doSequenceStep();
			}
		},
		'callback': () => {
			var n;

			for (n = 0; n < this.children.length; n++) {
				globals.animating--;
				this.children[n].transformation = undefined;
			}

			stepsTaken++;
			document.getElementById('stepstaken').innerHTML = stepsTaken;
		}
	});
};

cellClass.prototype.realPosition = function() {
	return realPosition(this.position.x, this.position.y);
};

function realPosition(x, y) {
	return { 'x': 48 * x - drawOffset.x, 'y': 27.5 * x + 55 * y + drawOffset.y };
}

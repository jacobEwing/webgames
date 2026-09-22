class Nonogram {
	constructor(parameters){
		if(parameters.target == undefined){
			throw new Error('Nonogram: No target element defined.');
		}

		this.initialize(parameters);
	}

	initialize(parameters){
		//some enums
		this.rowcolStates = {
			unsolved : 0,
			solved : 1,
			error : 2
		};

		this.cellStates = {
			unknown : 0,
			filled : 1,
			flagged : 2,
			struck : 4
		};

		this.difficultySettings = {
			easy:   { fillProbability: 0.60, hardnessRange: [0.0, 0.3], sizeRange: [ 4,  7] },
			medium: { fillProbability: 0.55, hardnessRange: [0.3, 0.9], sizeRange: [ 6,  10]  },
			hard:   { fillProbability: 0.50, hardnessRange: [0.9, 99.0], sizeRange: [ 9,  12]  }
		};

		this.threeStrikes = !!parameters.threeStrikes;
		this.showErrors   = !this.threeStrikes;   // red clue highlighting is off in three-strikes mode
		this.onStateChange = parameters.onStateChange || null;

		// per-game state, reset in start()
		this.ended = false;
		this.won   = false;
		this.strikesRemaining = this.threeStrikes ? 3 : null;

		// initialize default colours and check to see if custom ones were passed in
		this.colours = {
			empty : { red : 157, green : 168, blue : 138, alpha : 1 },
			active : { red: 239, green :221, blue : 115, alpha : 1 },
			plainText : { red : 68, green :  67, blue : 58, alpha : 1 },
			paleText : { red : 137, green :  135, blue : 119, alpha : 1 },
			errorText : { red : 192, green :  96, blue : 64, alpha : 1 }
		};

		if(parameters.colours != undefined){
			for(let n in this.colours){
				if(n in parameters.colours){
					this.colours[n] = parameters.colours[n];
				}
			}
		}

		this.difficulty = parameters.difficulty in this.difficultySettings ? parameters.difficulty : 'medium';

		if(parameters.font != undefined){
			this.font = parameters.font;
		}else{
			this.font = 'Arial';
		}

		// declare and assign some values

		this.maxGridSize = 12;
		this.map = null; // the actual solution mapped
		this.rowClues = null;
		this.columnClues = null;
		this.state = null; // an array of what marks the player has made
		this.sideSpacing = 2; // number of cell sizes used for numbers.  Should be made dynamic with settings, along with board position
		this.xOffset = 0; // the offset to centre the board - set on generation

		// calculate the canvas size we want and the corresponding cell size
		var canvasSize = this.getCanvasSize();
		this.cellSize = Math.floor(canvasSize / (this.maxGridSize + this.sideSpacing));

		// prevent right-click menus
		document.oncontextmenu = () => false;

		// clear the target div, create the canvas, and get context
		parameters.target.innerHTML = '';
		this.canvas = this.buildCanvas(parameters.target);
		this.context = this.canvas.getContext('2d');


	}

	getCanvasSize(){
		// calculate the size of canvas we want to fit inside the window
		let size = window.innerHeight;
		if(window.innerWidth < size){
			size = window.innerWidth;
		}
		size = Math.round(size * .8);
		return size;
		
	}

	start(){
		const settings = this.difficultySettings[this.difficulty];
		const [minSize, maxSize] = settings.sizeRange;

		if(minSize > maxSize){
			throw new Error(
				`Nonogram: invalid sizeRange [${minSize}, ${maxSize}] for difficulty "${this.difficulty}"`
			);
		}

		const pickSize = () =>
			minSize + Math.floor(Math.random() * (maxSize - minSize + 1));

		const w = pickSize();
		const h = pickSize();

		this.xOffset = ((this.maxGridSize - w) * this.cellSize) >> 1;

		this.generate(w, h, this.difficulty);
		this.resetForNewGame();
		this.drawCells();
		this.initializeEvents();
		this.notifyStateChange();
	}

	// Keep the current puzzle; reset player progress and re-arm the board.
	replay(){
		this.resetForNewGame();
		this.drawCells();
		this.initializeEvents();
		this.notifyStateChange();
	}

	resetForNewGame(){
		this.ended = false;
		this.won   = false;
		this.strikesRemaining = this.threeStrikes ? 3 : null;
		this.state = Array.from(
			{ length : this.map.length },
			() => Array(this.map[0].length).fill(this.cellStates.unknown)
		);
	}

	initializeEvents(){
		this.dragState = null;
		this.windowMouseUpHandler = null;

		this.canvas.onmousedown = (e) => this.onCanvasMouseDown(e);
		this.canvas.onmousemove = (e) => this.onCanvasMouseMove(e);
	}

	// Translate a mouse event into grid coordinates, or null if out of bounds.
	eventToCell(e){
		const x = e.offsetX - this.xOffset;
		const y = e.offsetY;
		const cellX = Math.floor(x / this.cellSize) - this.sideSpacing;
		const cellY = Math.floor(y / this.cellSize) - this.sideSpacing;

		if(
			cellX >= 0 && cellX < this.map.length &&
			cellY >= 0 && cellY < this.map[0].length
		){
			return { x : cellX, y : cellY };
		}
		return null;
	}

	onCanvasMouseDown(e){
		if(this.ended) return;

		const cell = this.eventToCell(e);
		if(!cell) return;

		const button = e.button ? 'right' : 'left';
		const op = this.beginDragOperation(cell.x, cell.y, button);
		if(!op) return;   // this cell can't start a drag (flag/struck with wrong button)

		op.lastCell = { x : cell.x, y : cell.y };
		this.dragState = op;

		// mouseup is on window so a drag that ends outside the canvas still terminates.
		this.windowMouseUpHandler = (ev) => this.onWindowMouseUp(ev);
		window.addEventListener('mouseup', this.windowMouseUpHandler);

		this.applyDragToCell(cell.x, cell.y);
		e.preventDefault();
	}

	onCanvasMouseMove(e){
		if(!this.dragState) return;
		if(this.ended){ this.dragState = null; return; }

		const cell = this.eventToCell(e);
		if(!cell) return;

		// Skip if the pointer is still over the same cell — avoids redundant redraws.
		if(this.dragState.lastCell.x === cell.x && this.dragState.lastCell.y === cell.y) return;

		this.applyDragToCell(cell.x, cell.y);
	}
	endDrag(){
		if(this.windowMouseUpHandler){
			window.removeEventListener('mouseup', this.windowMouseUpHandler);
			this.windowMouseUpHandler = null;
		}
		this.dragState = null;
	}

	onWindowMouseUp(e){
		this.endDrag();
		this.refresh();
		this.checkEndConditions();
	}

	// Decide what a drag starting at (x, y) with the given button means.
	// Returns an operation descriptor, or null if the cell can't start a drag.
	// Apply the current drag operation to one cell.
		beginDragOperation(x, y, button){
		const cs = this.cellStates;
		const cur = this.state[x][y];

		if(button === 'left'){
			if(cur === cs.unknown) return { mode : 'fill', set : true  };
			if(cur === cs.filled)  return { mode : 'fill', set : false };
			return null;
		}
		if(cur === cs.unknown) return { mode : 'flag', set : true  };
		if(cur === cs.flagged) return { mode : 'flag', set : false };
		return null;
	}

	applyDragToCell(x, y){
		const ds = this.dragState;
		const cs = this.cellStates;
		const cur = this.state[x][y];
		let next = null;
		let strike = false;

		if(ds.mode === 'fill'){
			if(ds.set && cur === cs.unknown){
				if(this.threeStrikes && this.map[x][y] !== 1){
					next = cs.struck;
					strike = true;
				}else{
					next = cs.filled;
				}
			}else if(!ds.set && cur === cs.filled){
				next = cs.unknown;
			}
		}else{
			if(ds.set && cur === cs.unknown){
				next = cs.flagged;
			}else if(!ds.set && cur === cs.flagged){
				next = cs.unknown;
			}
		}

		if(next === null) return;

		this.state[x][y] = next;
		ds.lastCell = { x, y };

		if(strike){
			this.registerStrike();
			this.endDrag();
		}

		this.refresh();

		if(strike){
			this.checkEndConditions();
		}
	}

	checkEndConditions(){
		if(this.ended) return;
		if(this.strikesRemaining !== null && this.strikesRemaining <= 0){
			this.endGame(false);
		}else if(this.checkForWin()){
			this.endGame(true);
		}
	}

	endGame(won){
		this.ended = true;
		this.won   = won;
		this.endDrag();
		this.canvas.onmousedown = null;
		this.canvas.classList.add('shaking');
		this.notifyStateChange();
	}

	registerStrike(){
		this.strikesRemaining--;
		this.notifyStateChange();
	}

	notifyStateChange(){
		if (!this.onStateChange) return;
		this.onStateChange({
			strikesRemaining : this.strikesRemaining,
			ended			: this.ended,
			won			  : this.won
		});
	}

	refresh(){
		this.context.clearRect(0, 0, this.canvas.width - 1, this.canvas.height - 1);
		this.drawCells();
	}

	checkForWin(){
		let win = true;

		for(let x = 0; x < this.map.length && win; x++){
			for(let y = 0; y < this.map[x].length && win; y++){

				if(this.map[x][y] == 1 && this.state[x][y] != this.cellStates.filled){
					win = false;
				}

				if(this.map[x][y] != 1 && this.state[x][y] == this.cellStates.filled){
					win = false;
				}

			}
		}

		return win;
	}
	

	drawCells(){
		// draw the cells
		var x, y;
		for(x = 0; x < this.map.length; x++){
			for(y = 0; y < this.map[x].length; y++){
				switch(this.state[x][y]){
					case this.cellStates.unknown:
						this.drawBox(x, y, this.colours.empty);
						break;
					case this.cellStates.filled:
						this.drawBox(x, y, this.colours.active);
						break;
					case this.cellStates.flagged:
						this.drawBox(x, y, this.colours.empty, true);
						this.drawX(x, y);
						break;
					case this.cellStates.error:
					case this.cellStates.struck:
						this.drawBox(x, y, this.colours.empty, true);
						this.drawSkull(x, y);
						break;
					default:
						throw new Error('Invalid map state "' + this.state[x][y] + '"');
						break;
				}
			}
		}

		// the margin is this.sideSpacing * this.cellSize
		this.context.save();
		this.context.font = this.cellSize / 5 + "px " + this.font;
		//this.context.fillStyle = Nonogram.#colourToText(this.colours.text);

		// draw the clues at the top
		this.context.textAlign = "center";
		for(x = 0; x < this.map.length; x++){
			this.context.fillStyle = this.getTextColour(this.checkColumn(x));

			for(y = 0; y < this.columnClues[x].length; y++){
				this.context.fillText(
					this.columnClues[x][this.columnClues[x].length - 1 - y],
					(x + this.sideSpacing + .5) * this.cellSize + this.xOffset,  
					(this.sideSpacing) * this.cellSize - (y + .4) * this.cellSize / 3
				);
			}
		}

		// now we'll do the side clues
		this.context.textBaseline = 'middle';
		for(y = 0; y < this.map[0].length; y++){
			this.context.fillStyle = this.getTextColour(this.checkRow(y));
			for(x = 0; x < this.rowClues[y].length; x++){
				this.context.fillText(
					this.rowClues[y][this.rowClues[y].length - 1 - x],
					(this.sideSpacing - .25) * this.cellSize - x * this.cellSize * .28 + this.xOffset,
					(this.sideSpacing + .5 + y) * this.cellSize
				);
			}
		}

		this.context.restore();

	}

	// return the appropriate text color for a given row/column state
	getTextColour(state){
		var rval;
		switch(state){
			case this.rowcolStates.unsolved:
				rval = Nonogram.#colourToText(this.colours.plainText);
				break;
			case this.rowcolStates.solved:
				rval = Nonogram.#colourToText(this.colours.paleText);
				break;
			case this.rowcolStates.error:
				rval = Nonogram.#colourToText(this.colours.errorText);
				break;
			default:
				throw ("uncaught case");
		}
		return rval;
	}

	// Convert a row or column of this.state into the solver's line-state array.
	// filled  → 1 (forced filled)
	// flagged → 2 (forced empty)
	// unknown → 0 (free)
	//
	// If you'd rather flags be purely advisory (never trigger errors),
	// map flagged to 0 here instead of 2.
	lineStateFromStates(cells){
		return cells.map(c => {
			if (c === this.cellStates.filled)  return 1;
			if (c === this.cellStates.flagged) return 2;
			return 0;
		});
	}

	// Return error / solved / unsolved for column x.
	//   error - the clue no longer fits alongside the player's marks
	//   solved - the player's marks exactly match the solution for this column
	//   unsolved - everything else
	checkColumn(x){
		const cells = new Array(this.map[x].length);
		for (let y = 0; y < this.map[x].length; y++) cells[y] = this.state[x][y];

		// Feasibility: can the clue still fit given filled + flagged cells?
		if(this.showErrors){
			const line = this.lineStateFromStates(cells);
			if (this.solveLine(this.map[x].length, this.columnClues[x], line) === null){
				return this.rowcolStates.error;
			}
		}

		// Completion: does the player's fill match the solution?
		for (let y = 0; y < this.map[x].length; y++){
			if (this.map[x][y] && this.state[x][y] !== this.cellStates.filled){
				return this.rowcolStates.unsolved;
			}
			if (!this.map[x][y] && this.state[x][y] === this.cellStates.filled){
				return this.rowcolStates.unsolved;
			}
		}
		return this.rowcolStates.solved;
	}

	// Mirror of checkColumn, for row y.
	checkRow(y){
		const cells = new Array(this.map.length);
		for (let x = 0; x < this.map.length; x++) cells[x] = this.state[x][y];

		if(this.showErrors){
			const line = this.lineStateFromStates(cells);
			if (this.solveLine(this.map.length, this.rowClues[y], line) === null){
				return this.rowcolStates.error;
			}
		}

		for (let x = 0; x < this.map.length; x++){
			if (this.map[x][y] && this.state[x][y] !== this.cellStates.filled){
				return this.rowcolStates.unsolved;
			}
			if (!this.map[x][y] && this.state[x][y] === this.cellStates.filled){
				return this.rowcolStates.unsolved;
			}
		}
		return this.rowcolStates.solved;
	}

	buildCanvas(target){
		let canvas = document.createElement('canvas');
		let size = this.cellSize * (this.maxGridSize + this.sideSpacing);
		canvas.width = size;
		canvas.height = size;
		canvas.style.backgroundColor = 'rgb(0, 0, 0, 0)';//'rgb(' + this.colours.empty.red + ', ' + this.colours.empty.green + ', ' + this.colours.empty.blue + ')';
		
		// horizontally offset the canvas so that the numbers don't factor into centering the board
		canvas.style.marginLeft = -this.sideSpacing * this.cellSize + 'px';

		target.appendChild(canvas);
		return canvas;

	}

	// Render one cell at pixel position (px, py). Pure drawing; no game state.
	static drawCellBox(context, px, py, cellSize, colour, invert){
		if(invert == undefined) invert = false;

		const edgeBias = cellSize >> 4;
		const fill = Nonogram.#colourToText(colour);

		let shade, highlight;
		if(invert){
			shade     = 'rgba(255, 255, 255, .2)';
			highlight = 'rgba(0, 0, 0, .2)';
		}else{
			highlight = 'rgba(255, 255, 255, .2)';
			shade     = 'rgba(0, 0, 0, .1)';
		}

		const x  = px;
		const y  = py;
		const x2 = x + Math.floor(cellSize * .95);
		const y2 = y + Math.floor(cellSize * .95);

		context.save();

		context.beginPath();
		context.fillStyle = fill;
		context.moveTo(x, y + edgeBias);
		context.quadraticCurveTo(x, y, x + edgeBias, y);
		context.lineTo(x2 - edgeBias, y);
		context.quadraticCurveTo(x2, y, x2, y + edgeBias);
		context.lineTo(x2, y2 - edgeBias);
		context.quadraticCurveTo(x2, y2, x2 - edgeBias, y2);
		context.lineTo(x + edgeBias, y2);
		context.quadraticCurveTo(x, y2, x, y2 - edgeBias);
		context.closePath();
		context.fill();

		context.beginPath();
		context.fillStyle = highlight;
		context.moveTo(x, y2 - edgeBias);
		context.lineTo(x, y + edgeBias);
		context.quadraticCurveTo(x, y, x + edgeBias, y);
		context.lineTo(x2 - edgeBias, y);
		context.quadraticCurveTo(x2, y, x2, y + edgeBias);
		context.bezierCurveTo(x, y, x + edgeBias, y + edgeBias, x, y2 - edgeBias);
		context.closePath();
		context.fill();

		context.beginPath();
		context.fillStyle = shade;
		context.moveTo(x2, y + edgeBias);
		context.lineTo(x2, y2 - edgeBias);
		context.quadraticCurveTo(x2, y2, x2 - edgeBias, y2);
		context.lineTo(x + edgeBias, y2);
		context.quadraticCurveTo(x, y2, x, y2 - edgeBias);
		context.bezierCurveTo(x2, y2, x2 - edgeBias, y2 - edgeBias, x2, y + edgeBias);
		context.fill();
		context.closePath();

		context.restore();
	}

	// Instance-level wrapper: converts cell coords to pixel coords, then defers.
	drawBox(x, y, colour, invert){
		const px = (x + this.sideSpacing) * this.cellSize + this.xOffset;
		const py = (y + this.sideSpacing) * this.cellSize;
		Nonogram.drawCellBox(this.context, px, py, this.cellSize, colour, invert);
	}

	drawX(x, y, colour){
		//if(colour == undefined) colour = 'rgba(192, 128, 64, .4)';
		if(colour == undefined) colour = 'rgba(0, 0, 0, .15)';
		x += this.sideSpacing;
		y += this.sideSpacing;
		x += .22;
		y += .22;
		x *= this.cellSize;
		y *= this.cellSize;

		x += this.xOffset;

		this.context.save();

		this.context.translate(x, y);
		this.context.beginPath();
		this.context.fillStyle = colour;
	
		var points = [
			{x : 1, y : 0},
			{x : 0, y : 1},
			{x : 1, y : 2},
			{x : 0, y : 3},
			{x : 1, y : 4},
			{x : 2, y : 3},
			{x : 3, y : 4},
			{x : 4, y : 3},
			{x : 3, y : 2},
			{x : 4, y : 1},
			{x : 3, y : 0},
			{x : 2, y : 1}
		];
		let scale = this.cellSize / 8;

		this.context.moveTo(points[0].x * scale, points[0].y * scale);
		for(let n = 1; n < 12; n++){
			this.context.lineTo(points[n].x * scale, points[n].y * scale);
		}
		this.context.closePath();
		this.context.fill();
		this.context.restore();
	}

		
	drawSkull(x, y){
		x += this.sideSpacing;
		y += this.sideSpacing;
		x *= this.cellSize;
		y *= this.cellSize;

		x += this.xOffset;

		// 240 is an arbitrary denominator to scale down the vectors in use
		let scale = this.cellSize / 240;

		// for clarity, we'll le this calculation in place.
		// this is centre the image in the cell.
		// 240 as described above is the denominator in the scale of the icon
		// 125 is the real vector size of the icon
		// divided by two because we're centering it.
		x += scale * (240 - 125) / 2;
		y += scale * (240 - 125) / 2;

		this.context.save();

		this.context.translate(x, y);
		this.context.scale(scale, scale);


		this.context.fillStyle = 'rgba(0, 0, 0, .5)';
		this.context.lineCap = 'butt';
		this.context.lineJoin = 'miter';

		// this ugly chunk of numbers was extracted from a PDF file, exported to HTML with Inkscape.
		this.context.beginPath();
		this.context.globalAlpha = 0.8;
		this.context.moveTo(62.548000, 20.889000);
		this.context.bezierCurveTo(44.751000, 20.889000, 30.321000, 35.320000, 30.321000, 53.116000);
		this.context.bezierCurveTo(30.321000, 62.014300, 33.918600, 70.075000, 39.754000, 75.910000);
		this.context.bezierCurveTo(42.671800, 78.827700, 44.554600, 97.197000, 48.411400, 98.830000);
		this.context.bezierCurveTo(52.268200, 100.463000, 72.853400, 100.462100, 76.710400, 98.830000);
		this.context.bezierCurveTo(80.567400, 97.197900, 82.425000, 78.828000, 85.342800, 75.910000);
		this.context.bezierCurveTo(91.178300, 70.074500, 94.800800, 62.014000, 94.800900, 53.116000);
		this.context.bezierCurveTo(94.800900, 35.319000, 80.344900, 20.889000, 62.548900, 20.889000);
		this.context.closePath();
		this.context.moveTo(9.978000, 38.004000);
		this.context.bezierCurveTo(6.150000, 38.096240, 2.559800, 40.422300, 1.070400, 44.209300);
		this.context.bezierCurveTo(-0.915500, 49.258600, 1.575800, 54.984300, 6.625100, 56.970300);
		this.context.bezierCurveTo(9.077700, 57.934870, 11.694600, 57.797070, 13.956300, 56.870210);
		this.context.lineTo(27.618300, 62.224810);
		this.context.bezierCurveTo(26.855670, 59.291310, 26.317200, 56.282010, 26.317200, 53.117010);
		this.context.bezierCurveTo(26.317200, 50.956410, 26.577430, 48.869810, 26.942730, 46.811610);
		this.context.lineTo(19.111030, 43.734010);
		this.context.bezierCurveTo(18.086730, 41.514410, 16.284330, 39.644410, 13.831530, 38.679710);
		this.context.bezierCurveTo(12.569230, 38.183240, 11.254230, 37.973390, 9.978230, 38.004130);
		this.context.closePath();
		this.context.moveTo(115.118000, 38.004000);
		this.context.bezierCurveTo(113.840100, 37.970810, 112.527000, 38.183100, 111.264700, 38.679580);
		this.context.bezierCurveTo(108.812500, 39.644020, 107.009700, 41.490080, 105.985200, 43.708880);
		this.context.lineTo(98.153500, 46.786480);
		this.context.bezierCurveTo(98.522170, 48.852580, 98.804050, 50.947280, 98.804050, 53.116880);
		this.context.bezierCurveTo(98.804050, 56.286480, 98.248930, 59.313780, 97.477950, 62.249680);
		this.context.lineTo(111.164950, 56.870080);
		this.context.bezierCurveTo(113.426650, 57.796780, 116.018750, 57.909680, 118.471150, 56.945150);
		this.context.bezierCurveTo(123.520450, 54.959250, 126.011750, 49.283650, 124.025850, 44.234150);
		this.context.bezierCurveTo(122.536450, 40.447150, 118.951850, 38.103450, 115.118250, 38.003850);
		this.context.closePath();
		this.context.moveTo(49.387000, 45.335200);
		this.context.bezierCurveTo(54.440800, 45.335180, 58.544800, 49.439200, 58.544800, 54.493000);
		this.context.bezierCurveTo(58.544800, 59.546800, 54.440800, 63.650800, 49.387000, 63.650800);
		this.context.bezierCurveTo(44.333200, 63.650800, 40.229200, 59.546800, 40.229200, 54.493000);
		this.context.bezierCurveTo(40.229200, 49.439200, 44.333200, 45.335200, 49.387000, 45.335200);
		this.context.closePath();
		this.context.moveTo(75.709000, 45.335200);
		this.context.bezierCurveTo(80.762800, 45.335180, 84.866800, 49.439200, 84.866800, 54.493000);
		this.context.bezierCurveTo(84.866800, 59.546800, 80.762800, 63.650800, 75.709000, 63.650800);
		this.context.bezierCurveTo(70.655200, 63.650800, 66.551200, 59.546800, 66.551200, 54.493000);
		this.context.bezierCurveTo(66.551200, 49.439200, 70.655200, 45.335200, 75.709000, 45.335200);
		this.context.closePath();
		this.context.moveTo(32.147000, 72.758200);
		this.context.lineTo(13.957000, 79.914300);
		this.context.bezierCurveTo(11.695200, 78.987450, 9.078300, 78.874600, 6.625800, 79.839240);
		this.context.bezierCurveTo(1.576500, 81.825140, -0.914800, 87.525740, 1.071100, 92.575240);
		this.context.bezierCurveTo(3.057000, 97.624740, 8.782700, 100.090840, 13.832100, 98.104940);
		this.context.bezierCurveTo(16.284900, 97.140240, 18.087300, 95.295240, 19.111600, 93.075640);
		this.context.lineTo(38.903600, 85.294040);
		this.context.bezierCurveTo(38.587930, 84.049040, 38.254970, 82.648640, 37.952790, 81.640940);
		this.context.bezierCurveTo(37.356690, 79.653040, 36.298390, 78.134940, 36.901890, 78.738440);
		this.context.bezierCurveTo(35.097990, 76.934540, 33.537590, 74.911140, 32.147890, 72.758340);
		this.context.closePath();
		this.context.moveTo(92.949000, 72.758200);
		this.context.bezierCurveTo(91.552600, 74.913600, 89.975200, 76.933000, 88.169900, 78.738300);
		this.context.bezierCurveTo(88.775480, 78.132730, 87.712810, 79.653310, 87.119000, 81.640800);
		this.context.bezierCurveTo(86.819910, 82.641800, 86.482400, 84.032800, 86.168190, 85.268900);
		this.context.lineTo(105.985190, 93.075500);
		this.context.bezierCurveTo(107.009690, 95.294300, 108.812490, 97.140300, 111.264690, 98.104800);
		this.context.bezierCurveTo(116.313990, 100.090700, 122.039690, 97.624400, 124.025690, 92.575100);
		this.context.bezierCurveTo(126.011690, 87.525800, 123.520250, 81.825100, 118.470990, 79.839100);
		this.context.bezierCurveTo(116.018590, 78.874560, 113.426490, 78.987460, 111.164790, 79.914160);
		this.context.lineTo(92.948790, 72.758060);
		this.context.closePath();
		this.context.fill();


		this.context.restore();
	}

	// Paint a 2x2 mini-board onto a canvas. `filledCount` is 1, 2, or 3.
	static renderIcon(canvas, filledCount){
		const size = canvas.width;
		const cellSize = size / 2;
		const ctx = canvas.getContext('2d');
		ctx.clearRect(0, 0, size, size);

		// Backing plate so the icon reads as a board rather than floating tiles.
		ctx.fillStyle = 'rgba(80, 60, 40, 0.18)';
		ctx.fillRect(0, 0, size, size);

		const fillColour  = { red : 239, green : 221, blue : 115, alpha : 1.0 };
		const emptyColour = { red : 157, green : 168, blue : 138, alpha : 0.9 };

		// Which cells are filled. Chosen for visual variety across the three icons.
		let filled;
		if(filledCount === 3)      filled = [[0,0],[1,0],[0,1]];  // all but bottom-right
		else if(filledCount === 2) filled = [[0,0],[1,1]];        // diagonal
		else                       filled = [[0,0]];              // top-left only

		const isFilled = (x, y) => filled.some(c => c[0] === x && c[1] === y);

		for(let x = 0; x < 2; x++){
			for(let y = 0; y < 2; y++){
				Nonogram.drawCellBox(
					ctx,
					x * cellSize,
					y * cellSize,
					cellSize,
					isFilled(x, y) ? fillColour : emptyColour,
					false
				);
			}
		}
	}

	generate(width, height, difficulty) {
		if (width <= 0 || height <= 0 || !Number.isInteger(width) || !Number.isInteger(height)) {
			throw new Error('Width and height must be positive integers');
		}

		const settings = this.difficultySettings[difficulty] || this.difficultySettings.medium;
		const [lo, hi] = settings.hardnessRange;
		const maxAttempts = 200;

		let best = null;

		for (let attempt = 0; attempt < maxAttempts; attempt++) {
			const map = this.generateMap(width, height, settings.fillProbability);
			const rowClues = this.generateRowClues(map);
			const colClues = this.generateColumnClues(map);
			const result = this.solveClues(rowClues, colClues, width, height);

			if (result.solved) {
				const h = result.stats.hardness;
				if (h >= lo && h < hi) {
					this.map = map;
					this.rowClues = rowClues;
					this.columnClues = colClues;
					return;
				}
				// Solvable but out of band — track by distance to band.
				const distance = h < lo ? lo - h : h - hi;
				if (best === null || best.kind !== 'solved' || distance < best.distance) {
					best = { kind: 'solved', map, rowClues, colClues, distance, h };
				}
			} else {
				// Not line-solvable — track by how far the solver got.
				let deduced = 0;
				for (let x = 0; x < width; x++) {
					for (let y = 0; y < height; y++) {
						if (result.state[x][y] !== 0) deduced++;
					}
				}
				if (best === null || (best.kind === 'unsolved' && deduced > best.deduced)) {
					best = { kind: 'unsolved', map, rowClues, colClues, deduced };
				}
			}
		}

		if (best === null) {
			// generateMap always returns a grid, so this should be unreachable.
			throw new Error('Nonogram: generation produced no candidate puzzle');
		}

		if (best.kind === 'solved') {
			console.warn(
				`Nonogram: no puzzle in hardness band [${lo}, ${hi}) for ${width}×${height} ` +
				`at difficulty "${difficulty}" in ${maxAttempts} attempts. ` +
				`Using closest candidate (hardness ${best.h.toFixed(2)}).`
			);
		} else {
			console.warn(
				`Nonogram: no line-solvable puzzle found for ${width}×${height} at ` +
				`difficulty "${difficulty}" in ${maxAttempts} attempts. ` +
				`Using best candidate (${best.deduced}/${width * height} cells deducible).`
			);
		}

		this.map = best.map;
		this.rowClues = best.rowClues;
		this.columnClues = best.colClues;
	}
		generateMap(width, height, fillProbability) {
			const grid = Array.from({ length: width }, () => Array(height).fill(0));

		// Seed one filled cell per column, then per row, so no clue reads as a lone "0".
		// (Preserves the intent of the old generator's "one per row/column" pass.)
		for (let x = 0; x < width; x++) {
			grid[x][Math.floor(Math.random() * height)] = 1;
		}
		for (let y = 0; y < height; y++) {
			if (!grid.some(column => column[y] === 1)) {
				grid[Math.floor(Math.random() * width)][y] = 1;
			}
		}

		// Scatter additional fills until we hit the difficulty's target density.
		const targetCells = Math.round(width * height * fillProbability);
		let numCells = 0;
		for (let x = 0; x < width; x++) {
			for (let y = 0; y < height; y++) {
				if (grid[x][y]) numCells++;
			}
		}

		// Bounded so a bad fillProbability can't spin forever.
		let guard = width * height * 4;
		while (numCells < targetCells && guard-- > 0) {
			const x = Math.floor(Math.random() * width);
			const y = Math.floor(Math.random() * height);
			if (!grid[x][y]) {
				grid[x][y] = 1;
				numCells++;
			}
		}

		return grid;
	}

	generateColumnClues(map) {
		const clues = [];
		for (let x = 0; x < map.length; x++) {
			const column = [];
			let count = 0;
			for (let y = 0; y < map[x].length; y++) {
				if (map[x][y]) {
					count++;
				} else if (count > 0) {
					column.push(count);
					count = 0;
				}
			}
			if (count > 0) column.push(count);
			clues.push(column);
		}
		return clues;
	}

	generateRowClues(map) {
		const clues = [];
		for (let y = 0; y < map[0].length; y++) {
			const row = [];
			let count = 0;
			for (let x = 0; x < map.length; x++) {
				if (map[x][y]) {
					count++;
				} else if (count > 0) {
					row.push(count);
					count = 0;
				}
			}
			if (count > 0) row.push(count);
			clues.push(row);
		}
		return clues;
	}


	static #colourToText(colour){
		// a convenience function for converting RGB definitions into strings for canvas styles;
		return 'rgb(' +
			colour.red + ', ' + 
			colour.green + ', ' + 
			colour.blue + ', ' + 
			(colour.alpha == undefined ? '1' : colour.alpha) + 
			')';
	}

	/**
	 * Solve a single line of a nonogram by exhaustive enumeration of all
	 * block placements that are consistent with the current cell states.
	 *
	 * @param {number}   length  Number of cells in the line.
	 * @param {number[]} blocks  Runs of filled cells, in order. May be [].
	 * @param {number[]} state   Current knowledge per cell:
	 *							 0 = unknown, 1 = filled, 2 = empty
	 * @returns {{canFill: boolean[], canEmpty: boolean[]} | null}
	 *   canFill[i]  = true if some valid arrangement fills cell i
	 *   canEmpty[i] = true if some valid arrangement leaves cell i empty
	 *   null		= no valid arrangement exists (contradiction)
	 */
	solveLine(length, blocks, state) {
		const canFill  = new Array(length).fill(false);
		const canEmpty = new Array(length).fill(false);
		const committed = new Array(length).fill(0);
		let anyPlacement = false;

		const place = (blockIdx, startPos) => {
			if (blockIdx === blocks.length) {
				// Trailing cells after the last block must be empty.
				for (let i = startPos; i < length; i++) {
					if (state[i] === 1) return;
				}
				anyPlacement = true;
				for (let i = 0; i < length; i++) {
					if (committed[i] === 1) canFill[i] = true;
					else					canEmpty[i] = true;
				}
				return;
			}

			const b = blocks[blockIdx];

			// Room needed for this block + all following blocks + mandatory gaps.
			let tail = 0;
			for (let j = blockIdx + 1; j < blocks.length; j++) tail += blocks[j];
			tail += (blocks.length - blockIdx - 1);
			const maxStart = length - tail - b;

			for (let start = startPos; start <= maxStart; start++) {
				let ok = true;

				// Cells between the previous block and this one must be empty.
				for (let i = startPos; i < start; i++) {
					if (state[i] === 1) { ok = false; break; }
				}
				if (!ok) break; // any later start is blocked by the same cell

				// Cells under this block must not already be forced empty.
				for (let i = start; i < start + b; i++) {
					if (state[i] === 2) { ok = false; break; }
				}
				if (!ok) continue;

				// The separator cell after the block must not be forced filled.
				if (start + b < length && state[start + b] === 1) continue;

				for (let i = start; i < start + b; i++) committed[i] = 1;
				place(blockIdx + 1, start + b + 1);
				for (let i = start; i < start + b; i++) committed[i] = 0;
			}
		};

		place(0, 0);
		return anyPlacement ? { canFill, canEmpty } : null;
	}

	/**
	 * Run line-logic to exhaustion on the given clues.
	 *
	 * @returns {{ solved: boolean, state: number[][] }}
	 *   solved = true iff every cell was deduced without guessing
	 *   state[x][y] ∈ {0 unknown, 1 filled, 2 empty}
	 */
	solveClues(rowClues, colClues, width, height) {
		const state = Array.from({ length: width }, () => new Array(height).fill(0));
		const level = Array.from({ length: width }, () => new Array(height).fill(-1));

		let pass = 0;
		let progress = true;
		while (progress) {
			progress = false;

			// Columns: colClues[x] describes column x, which is state[x][*]
			for (let x = 0; x < width; x++) {
				const line = new Array(height);
				for (let y = 0; y < height; y++) line[y] = state[x][y];

				const res = this.solveLine(height, colClues[x], line);
				if (!res) return { solved: false, state, level, stats: null };

				for (let y = 0; y < height; y++) {
					if (state[x][y] !== 0) continue;
					if (res.canFill[y] && !res.canEmpty[y]) {
						state[x][y] = 1; level[x][y] = pass; progress = true;
					} else if (res.canEmpty[y] && !res.canFill[y]) {
						state[x][y] = 2; level[x][y] = pass; progress = true;
					}
				}
			}

			// Rows: rowClues[y] describes row y, which is state[*][y]
			for (let y = 0; y < height; y++) {
				const line = new Array(width);
				for (let x = 0; x < width; x++) line[x] = state[x][y];

				const res = this.solveLine(width, rowClues[y], line);
				if (!res) return { solved: false, state, level, stats: null };

				for (let x = 0; x < width; x++) {
					if (state[x][y] !== 0) continue;
					if (res.canFill[x] && !res.canEmpty[x]) {
						state[x][y] = 1; level[x][y] = pass; progress = true;
					} else if (res.canEmpty[x] && !res.canFill[x]) {
						state[x][y] = 2; level[x][y] = pass; progress = true;
					}
				}
			}

			pass++;
		}

		let solved = true;
		for (let x = 0; x < width && solved; x++) {
			for (let y = 0; y < height && solved; y++) {
				if (state[x][y] === 0) solved = false;
			}
		}

		const stats = this.scoreDeduction(level, width, height);
		return { solved, state, level, stats };
	}

	scoreDeduction(level, width, height) {
		let maxLevel = 0;
		let firstPass = 0;
		const total = width * height;

		for (let x = 0; x < width; x++) {
			for (let y = 0; y < height; y++) {
				const l = level[x][y];
				if (l < 0) continue;
				if (l > maxLevel) maxLevel = l;
				if (l === 0) firstPass++;
			}
		}

		const firstPassFrac = firstPass / total;
		const raw = maxLevel + 2 * (1 - firstPassFrac);
		const norm = Math.max(width, height);

		return {
			maxLevel,
			firstPassFrac,
			hardness: raw / norm
		};
	}
}

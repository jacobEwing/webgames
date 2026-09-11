/****************************************
This is incomplete code.

It's a fully functional game, but some of the code needs cleanup/replacement.
I'm just setting it aside for now as my attention is needed elsewhere.

Some things that still need attention:

1) Puzzle generation. It currently sucks, largely being random.

2) For the same reason, difficultySettings isn't used.  I originally planned on
allowing different levels of difficulty, but that's not currently in use.

3) I originally planned on making it use a three-strikes-you're-out style of
play, which was how it was done in the site that I previously played the game
in. That was replaced with highlighting the hint numbers in red if an empty
cell is marked as full.
First, that should be more elegant. It should instead check whether or not the
row CAN fit the markers in place, not whether or not it does. This will give
more of a challenge and not just tell the user when they fill the wrong cell.
Also, I would still like to optionally have the three-strikes-you're-out style.

****************************************/

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
			easy: { fillProbability: 0.6 },
			medium: { fillProbability: 0.5 },
			hard: { fillProbability: 0.4 }
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
			empty : { red : 157, green : 168, blue : 138, alpha : .5 },
			active : { red: 239, green :221, blue : 115, alpha : .5 },
			plainText : { red : 68, green :  67, blue : 58, alpha : 1 },
			paleText : { red : 68, green :  67, blue : 58, alpha : .4 },
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

	start(){  // start the game!
		this.ended = false;
		this.won   = false;
		this.strikesRemaining = this.threeStrikes ? 3 : null;
		this.notifyStateChange();

		let w = Math.round(Math.random() * this.maxGridSize / 2);
		w += this.maxGridSize >> 1;

		let h = Math.round(Math.random() * this.maxGridSize / 2);
		h += this.maxGridSize >> 1;

		this.xOffset = ((this.maxGridSize - w) * this.cellSize) >> 1;


		this.generate(w, h, this.difficulty);
		this.state =  Array.from({ length: this.map.length }, () => Array(this.map[0].length).fill(this.cellStates.unknown));

		// initialize our cell states
		this.drawCells();

		// add events
		this.initializeEvents();
	}

	initializeEvents(){
		this.canvas.onmousedown = (e) => this.onCanvasMouseDown(e);
	}

	onCanvasMouseDown(e){
		const x = e.offsetX - this.xOffset;
		const y = e.offsetY;
		const cellX = Math.floor(x / this.cellSize) - this.sideSpacing;
		const cellY = Math.floor(y / this.cellSize) - this.sideSpacing;

		if(
			cellX >= 0 && cellX < this.map.length &&
			cellY >= 0 && cellY < this.map[0].length
		){
			this.handleCellClick(cellX, cellY, e.button ? 'right' : 'left');
		}
	}

	handleCellClick(x, y, button){
		if(this.ended) return;

		if(button == 'left'){
			// handle left clicks
			switch(this.state[x][y]){
				case this.cellStates.unknown:
					if(this.threeStrikes && this.map[x][y] !== 1){
						// Wrong fill. Mark it as struck, take a strike.
						this.state[x][y] = this.cellStates.struck;
						this.registerStrike();
					}else{
						this.state[x][y] = this.cellStates.filled;
					}
					break;
				case this.cellStates.filled:
					this.state[x][y] = this.cellStates.unknown;
					break;
				case this.cellStates.flagged:
					//this.state[x][y] = this.cellStates.filled;
					break;
				case this.cellStates.struck:
					// permanent, do nothing
					break;
				case this.cellStates.error:
					break;
				default:
					throw new Error('Invalid map state "' + this.state[x][y] + '"');
			}
		}else{
			// handle right clicks
			switch(this.state[x][y]){
				case this.cellStates.unknown:
					this.state[x][y] = this.cellStates.flagged;
					break;
				case this.cellStates.filled:
					//this.state[x][y] = this.cellStates.unknown;
					break;
				case this.cellStates.flagged:
					this.state[x][y] = this.cellStates.unknown;
					break;
				case this.cellStates.struck:
					// permanent, do nothing
					break;
				case this.cellStates.error:
					break;
				default:
					throw new Error('Invalid map state "' + this.state[x][y] + '"');
			}
		}

		this.refresh();
		if(this.strikesRemaining !== null && this.strikesRemaining <= 0){
			this.endGame(false);
		}else if(this.checkForWin()){
			this.endGame(true);
		}
	}

	endGame(won){
		this.ended = true;
		this.won   = won;
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
						this.drawRedX(x, y);
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
		//this.context.fillStyle = this.#colourToText(this.colours.text);

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
				rval = this.#colourToText(this.colours.plainText);
				break;
			case this.rowcolStates.solved:
				rval = this.#colourToText(this.colours.paleText);
				break;
			case this.rowcolStates.error:
				rval = this.#colourToText(this.colours.errorText);
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

	// render a nicely shaded rectangle with rounded corners
	drawBox(x, y, colour, invert){
		if(invert == undefined){
			invert = false;
		}

		var edgeBias = this.cellSize >> 4;

		var colour = this.#colourToText(colour);
		var shade = 'rgba(0, 0, 0, .1)';
		/*
		var highlight = 'rgba(255, 255, 255, .2)';
		var darkColour = this.#colourToText({red : colour.red >> 1, green : colour.green >> 1, blue : colour.blue >> 1, 'alpha' : 0.1});
		*/
		if(invert){
			shade = 'rgba(255, 255, 255, .2)';
			var highlight = 'rgba(0, 0, 0, .2)';
//			var highlight = this.#colourToText({red : colour.red >> 1, green : colour.green >> 1, blue : colour.blue >> 1, 'alpha' : 0.1});
		}else{
			var highlight = 'rgba(255, 255, 255, .2)';
			shade = this.#colourToText({red : colour.red >> 1, green : colour.green >> 1, blue : colour.blue >> 1, 'alpha' : 0.1});
		}

		x = (x + this.sideSpacing) * this.cellSize;
		y = (y + this.sideSpacing) * this.cellSize;
		x += this.xOffset;
		var x2 = x + Math.floor(this.cellSize * .95);
		var y2 = y + Math.floor(this.cellSize * .95);

		
		this.context.save();

			this.context.beginPath();
			this.context.fillStyle = colour;
			this.context.moveTo(x, y + edgeBias);
			this.context.quadraticCurveTo(x, y, x + edgeBias, y);
			this.context.lineTo(x2 - edgeBias, y);

			this.context.quadraticCurveTo(x2, y, x2, y + edgeBias);
			this.context.lineTo(x2, y2 - edgeBias);

			this.context.quadraticCurveTo(x2, y2, x2 - edgeBias, y2);
			this.context.lineTo(x + edgeBias, y2);

			this.context.quadraticCurveTo(x, y2, x, y2 - edgeBias);
			this.context.closePath();
			this.context.fill();

			// add some shading, first at the top
			this.context.beginPath();
			this.context.fillStyle = highlight;
			this.context.moveTo(x, y2 - edgeBias);
			this.context.lineTo(x, y + edgeBias);
			this.context.quadraticCurveTo(x, y, x + edgeBias, y);
			this.context.lineTo(x2 - edgeBias, y);
			this.context.quadraticCurveTo(x2, y, x2, y + edgeBias);
			this.context.bezierCurveTo(
				x, 
				y, 
				x + edgeBias, 
				y + edgeBias, 
				x, 
				y2 - edgeBias
			);

			this.context.closePath();
			this.context.fill();


			// and now some dark colour shading at the bottom
			this.context.beginPath();
			this.context.fillStyle = shade;
			this.context.moveTo(x2, y + edgeBias);
			this.context.lineTo(x2, y2 - edgeBias);
			this.context.quadraticCurveTo(x2, y2, x2 - edgeBias, y2);
			this.context.lineTo(x + edgeBias, y2);
			this.context.quadraticCurveTo(x, y2, x, y2 - edgeBias);
			this.context.bezierCurveTo(
				x2,
				y2,
				x2 - edgeBias,
				y2 - edgeBias,
				x2,
				y + edgeBias
			);

			this.context.fill();
			this.context.closePath();

		this.context.restore();
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

		
	drawRedX(x, y){
		x += this.sideSpacing;
		y += this.sideSpacing;
		x += .15;
		y += .15;
		x *= this.cellSize;
		y *= this.cellSize;

		x += this.xOffset;
		let scale = this.cellSize / 100;

		this.context.save();

		this.context.translate(x, y);
		this.context.scale(scale, scale);
		this.context.fillStyle = 'rgb(238, 109, 68)';
		this.context.lineCap = 'butt';
		this.context.lineJoin = 'miter';

		this.context.beginPath();
		this.context.moveTo(6, 14);
		this.context.bezierCurveTo(25, 29, 40, 41, 51, 61);
		this.context.bezierCurveTo(57, 70, 69, 58, 60, 52);
		this.context.bezierCurveTo(42, 39, 30, 27, 15, 4);
		this.context.bezierCurveTo(8, -3, -2, 8, 6, 14);
		this.context.closePath();
		this.context.fill();
		
		this.context.beginPath();
		this.context.moveTo(53, 7);
		this.context.bezierCurveTo(47, 18, 18, 45, 5, 52);
		this.context.bezierCurveTo(-4, 57, 8, 70, 14, 60);
		this.context.bezierCurveTo(26, 42, 39, 31, 62, 16);
		this.context.bezierCurveTo(71, 9, 58, -1, 53, 7);
		this.context.closePath();

		this.context.fill();
		this.context.restore();
	}

	generate(width, height, difficulty) {
		if (width <= 0 || height <= 0 || !Number.isInteger(width) || !Number.isInteger(height)) {
			throw new Error('Width and height must be positive integers');
		}

		const settings = this.difficultySettings[difficulty] || this.difficultySettings.medium;
		const maxAttempts = 200;

		let best = null; // closest-to-solvable fallback

		for (let attempt = 0; attempt < maxAttempts; attempt++) {
			const map = this.generateMap(width, height, settings.fillProbability);
			const rowClues = this.generateRowClues(map);
			const colClues = this.generateColumnClues(map);
			const result = this.solveClues(rowClues, colClues, width, height);

			if (result.solved) {
				this.map = map;
				this.rowClues = rowClues;
				this.columnClues = colClues;
				return;
			}

			// Track the candidate the solver got furthest on.
			let deduced = 0;
			for (let x = 0; x < width; x++) {
				for (let y = 0; y < height; y++) {
					if (result.state[x][y] !== 0) deduced++;
				}
			}
			if (best === null || deduced > best.deduced) {
				best = { map, rowClues, colClues, deduced };
			}
		}

		// Fallback — warn so we know to tune.
		console.warn(
			`Nonogram: no line-solvable puzzle found for ${width}×${height} at ` +
			`difficulty "${difficulty}" in ${maxAttempts} attempts. ` +
			`Using best candidate (${best.deduced}/${width * height} cells deducible).`
		);
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


	#colourToText(colour){
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

		let progress = true;
		while (progress) {
			progress = false;

			// Columns
			for (let x = 0; x < width; x++) {
				const line = new Array(height);
				for (let y = 0; y < height; y++) line[y] = state[x][y];

				const res = this.solveLine(height, colClues[x], line);
				if (!res) return { solved: false, state };

				for (let y = 0; y < height; y++) {
					if (state[x][y] !== 0) continue;
					if (res.canFill[y] && !res.canEmpty[y])	  { state[x][y] = 1; progress = true; }
					else if (res.canEmpty[y] && !res.canFill[y]) { state[x][y] = 2; progress = true; }
				}
			}

			// Rows
			for (let y = 0; y < height; y++) {
				const line = new Array(width);
				for (let x = 0; x < width; x++) line[x] = state[x][y];

				const res = this.solveLine(width, rowClues[y], line);
				if (!res) return { solved: false, state };

				for (let x = 0; x < width; x++) {
					if (state[x][y] !== 0) continue;
					if (res.canFill[x] && !res.canEmpty[x])	  { state[x][y] = 1; progress = true; }
					else if (res.canEmpty[x] && !res.canFill[x]) { state[x][y] = 2; progress = true; }
				}
			}
		}

		let solved = true;
		for (let x = 0; x < width && solved; x++) {
			for (let y = 0; y < height && solved; y++) {
				if (state[x][y] === 0) solved = false;
			}
		}
		return { solved, state };
	}
}


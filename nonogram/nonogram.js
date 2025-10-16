/****************************************
This is incomplete code.

It's a fully functional game, but some of the code needs cleanup/replacement.
I'm just setting it aside for now as my attention is needed elsewhere.

Some things that still need attention:

1) Puzzle generation. It currently sucks, largely being random.  I started
writing a function to try solving it (solveTest), to ensure it's solvable, but
it's not complete or functional in any way.  It is heavily remarked below.

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
			error: 3
		};

		// handle settings
		this.font = null;
		if(parameters.font != undefined){
			this.font = parameters.font;
		}

		this.difficultySettings = {
			easy: { fillProbability: 0.6 },
			medium: { fillProbability: 0.5 },
			hard: { fillProbability: 0.4 }
		};

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

		let w = Math.round(Math.random() * this.maxGridSize / 2);
		w += this.maxGridSize >> 1;

		let h = Math.round(Math.random() * this.maxGridSize / 2);
		h += this.maxGridSize >> 1;

		this.xOffset = ((this.maxGridSize - w) * this.cellSize) >> 1;


		this.generate(w, h, 'hard');
		this.state =  Array.from({ length: this.map.length }, () => Array(this.map[0].length).fill(this.cellStates.unknown));

		//@@@@@@@@@@@@@@ TEMPORARY @@@@@@@@@@@@@@@@@
		// a quick test to try and solve it
//		this.solveTest();
		//@@@@@@@@@@@@@@ /TEMPORARY @@@@@@@@@@@@@@@@@

		// initialize our cell states
		this.drawCells();

		// add events
		this.initializeEvents();
	}

	solveTest(){
		//@@@@@@@@@@@
		// This incomplete code is not in use, the call to it being remarked.
		//@@@@@@@@@@
		return;
		var x, y, n, m;

		// check columns
		let height = this.map[0].length;
		for(x = 0; x < this.map.length; x++){
			let sum = this.columnClues[x].length - 1;
			for(n = 0; n < this.columnClues[x].length; n++){
				sum += this.columnClues[x][n];
			}
			console.log('x: ' + x + ', sum: ' + sum);

			// if the numbers add up to more than half the length of the column, then check
			// to see if any overlap with themselves
			if(sum == this.map[0].length){
				// the clues fill the row
			}else if(sum > this.map[0].length >> 1){
				// the clues describe an area longer than half the row length, check them out

				/**
					THIS IS INCOMPLETE.  The idea is to check whether any segments
					on a given column overlap with each other
				**/
				let offset = 0;
				let testColumn = Array(height).fill(-1);
				for(n = 0; n < this.columnClues[x].length; n++){
					for(m = 0; m < this.columnClues[x][n]; m++){
						testColumn[offset] = 1 << n
					}
				}
			}
		}
	}

	initializeEvents(){
		var me = this;
		/**
		@@@ this should be a member function so that I don't need to use "me"
		**/
		this.canvas.onmousedown = function(e){
			let x = e.offsetX - me.xOffset;
			let y = e.offsetY;
			let cellX = Math.floor(x / me.cellSize) - me.sideSpacing;
			let cellY = Math.floor(y / me.cellSize) - me.sideSpacing;
			if(
			  cellX >= 0 && cellX < me.map.length &&
			  cellY >= 0 && cellY < me.map[0].length
			){
				me.handleCellClick(cellX, cellY, e.button ? 'right' : 'left');
				
			}

		}
	}

	handleCellClick(x, y, button){
		if(button == 'left'){
			// handle left clicks
			switch(this.state[x][y]){
				case this.cellStates.unknown:
					/*
					Currently, this just marks the cell as filled. Erroneous fillings are flagged
					by changing colour of the numbers.
					In the future, I want an option to play in a "3 errors and your out" style,
					which will use the x instead. That can be done with the currently remarked
					line below.
					*/
					//this.state[x][y] = this.map[x][y] == 1 ? this.cellStates.filled : this.cellStates.error;
					this.state[x][y] = this.cellStates.filled;
					break;
				case this.cellStates.filled:
					this.state[x][y] = this.cellStates.unknown;
					break;
				case this.cellStates.flagged:
					//this.state[x][y] = this.cellStates.filled;
					break;
				case this.cellStates.error:
					
					break;
				default:
					throw new Error('Invalid map state "' + this.state[x][y] + '"');
					break;
			}
		}else{
			// handle right clicks

			switch(this.state[x][y]){
				case this.cellStates.unknown:
					if(this.state[x][y] == this.cellStates.flagged){
						this.state[x][y] = this.cellStates.unknown;
					}else{
						this.state[x][y] = this.cellStates.flagged;
					}
					break;
				case this.cellStates.filled:
					//this.state[x][y] = this.cellStates.unknown;
					break;
				case this.cellStates.flagged:
					this.state[x][y] = this.cellStates.unknown;
					break;
				case this.cellStates.error:
					
					break;
				default:
					throw new Error('Invalid map state "' + this.state[x][y] + '"');
					break;
			}
		}
		this.refresh();
		if(this.checkForWin()){
			console.log('WIN!');
		}
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

	// returns a state of error, solved, or unsolved depending on the column status
	checkColumn(x){
		var rval = this.rowcolStates.solved;
		for(let y = 0; y < this.map[x].length; y++){
			if(!this.map[x][y] && this.state[x][y] == this.cellStates.filled){
				rval = this.rowcolStates.error;
				break;
			}else if(this.map[x][y] && this.state[x][y] != this.map[x][y]){
				rval = this.rowcolStates.unsolved;
			}
		}
		return rval;
	}

	// returns a state of error, solved, or unsolved depending on the row status
	checkRow(y){
		var rval = this.rowcolStates.solved;
		for(let x = 0; x < this.map.length; x++){
			if(!this.map[x][y] && this.state[x][y] == this.cellStates.filled){
				rval = this.rowcolStates.error;
				break;
			}else if(this.map[x][y] && this.state[x][y] != this.map[x][y]){
				rval = this.rowcolStates.unsolved;
			}
		}
		return rval;
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

	generate(width, height, difficulty){
		// Validate inputs
		if(width <= 0 || height <= 0 || !Number.isInteger(width) || !Number.isInteger(height)){
			throw new Error('Width and height must be positive integers');
		}
		
		const settings = this.difficultySettings[difficulty] || this.difficultySettings.medium;
		
		// Generate random map and the corresponding clues
		this.map = this.generateMap(width, height, settings.fillProbability);
		this.rowClues = this.generateRowClues();
		this.columnClues = this.generateColumnClues();
		
	}

	generateMap(width, height, fillProbability) {
		var grid = Array.from({ length: width }, () => Array(height).fill(0));
		var x, y;

		var numCells = 0;
		let iterations = 0;
		let minCells = Math.floor(width * height * .4);

		// fill in at least minCells number of cells
		while(numCells < minCells && iterations < 10){
			iterations++;
			for(x = 0; x < width; x++){
				let n = 0;
				do{
					y = Math.floor(Math.random() * height);
					n++;
				}while(n < 10 && grid[x][y] == 1);
				if(n < 10){
					grid[x][y] = 1;
					numCells++;
				}
			}

			// fill one cell in each row
			for(y = 0; y < height; y++){
				let n = 0;
				do{
					x = Math.floor(Math.random() * width);
					n++;
				}while(n < 10 && grid[x][y] == 1);
				if(n < 10){
					grid[x][y] = 1;
					numCells++;
				}
			}
		}

		return grid;
	}

	generateColumnClues() {
		var clues = [];
		
		for (let x = 0; x < this.map.length; x++) {
			const mapColumn = this.map[x];
			const column = [];
			let currentCount = 0;
			
			for (let y = 0; y < mapColumn.length; y++) {
				if (mapColumn[y]) {
					currentCount++;
				} else if (currentCount > 0) {
					column.push(currentCount);
					currentCount = 0;
				}
			}
			
			// Don't forget the last segment
			if (currentCount > 0) {
				column.push(currentCount);
			}
			
			clues.push(column);
		}
		
		return clues;
	}

	generateRowClues() {
		var clues = [];
		
		for (let y = 0; y < this.map[0].length; y++) {
			var row = [];
			let currentCount = 0;
			
			for (let x = 0; x < this.map.length; x++) {
				if (this.map[x][y]) {
					currentCount++;
				} else if (currentCount > 0) {
					row.push(currentCount);
					currentCount = 0;
				}
			}
			
			// Don't forget the last segment
			if (currentCount > 0) {
				row.push(currentCount);
			}
			
			clues.push(row);
		}
		
		return clues;
	}
	
	pointFallsInGrid(x, y){
		return 	x >= 0
			&& y >= 0
			&& x < this.map.length
			&& y < this.map[0].length;
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

}


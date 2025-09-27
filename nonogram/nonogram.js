class Nonogram {
	constructor(parameters){
		if(parameters.target == undefined){
			throw new Error('Nonogram: No target element defined.');
		}

		this.font = null;
		if(parameters.font != undefined){
			this.font = parameters.font;
		}

		this.difficultySettings = {
			easy: { minSegments: 1, maxSegments: 3, fillProbability: 0.8 },
			medium: { minSegments: 2, maxSegments: 5, fillProbability: 0.7 },
			hard: { minSegments: 3, maxSegments: 7, fillProbability: 0.6 }
		};

		this.colours = {
			empty : { red : 157, green : 168, blue : 138, alpha : .5 },
			active : { red: 239, green :221, blue : 115, alpha : .5 },
			text : { red : 68, green :  67, blue : 58 }
		};

		this.cellStates = {
			unknown : 0,
			filled : 1,
			flagged : 2,
			error: 3
		}

		this.maxGridSize = 12;
		this.map = null; // the actual solution mapped
		this.rowClues = null;
		this.columnClues = null;
		this.state = null; // an array of what marks the player has made
		this.cellSize = 0;
		this.sideSpacing = 2; // number of cell sizes used for numbers.  Should be made dynamic with settings, along with board position
		this.font = 'Vanilla Extract';

		this.canvas = this.buildCanvas(parameters.target);
		this.canvas.oncontextmenu = function(){return false};

		this.context = this.canvas.getContext('2d');


		this.startGame();
	}

	startGame(){
		// generate our map and states of each cell.
		//this.generate(this.maxGridSize, this.maxGridSize, 'hard');
		this.generate(this.maxGridSize, this.maxGridSize, 'hard');
		this.state =  Array.from({ length: this.map.length }, () => Array(this.map[0].length).fill(this.cellStates.unknown));

		// initialize our cell states
		this.drawCells();

		// add events
		this.initializeEvents();
	}

	initializeEvents(){
		var me = this;

		this.canvas.onmousedown = function(e){
			console.log(e.button);
			let x = e.offsetX;
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
//		console.log('(' + x + ', ' + y + ') : ' + button);

		if(button == 'left'){
			// handle left clicks
			switch(this.state[x][y]){
				case this.cellStates.unknown:
					this.state[x][y] = this.map[x][y] == 1 ? this.cellStates.filled : this.cellStates.error;
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
	}

	refresh(){
		this.context.clearRect(0, 0, this.canvas.width - 1, this.canvas.height - 1);
		this.drawCells();
	}
	

	drawCells(){
		// draw the cells
		var x, y;

		for(y = 0; y < this.map.length; y++){
			for(x = 0; x < this.map[y].length; x++){
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

		// draw the clues at the top
		// the margin is this.sideSpacing * this.cellSize
		this.context.save();
		this.context.font = this.cellSize / 5 + "px " + this.font;
		this.context.fillStyle = this.#colourToText(this.colours.text);
		this.context.textAlign = "center";

		for(x = 0; x < this.map.length; x++){
			for(y = 0; y < this.columnClues[x].length; y++){
				this.context.fillText(
					this.columnClues[x][this.columnClues[x].length - 1 - y],
					(x + this.sideSpacing + .5) * this.cellSize,  
					(this.sideSpacing) * this.cellSize - (y + .4) * this.cellSize / 3
				);
			}
		}

		// now we'll do the side clues
		this.context.textBaseline = 'middle';
		for(y = 0; y < this.map[0].length; y++){
			for(x = 0; x < this.rowClues[y].length; x++){
				this.context.fillText(
					this.rowClues[y][this.rowClues[y].length - 1 - x],
					(this.sideSpacing - .25) * this.cellSize - x * this.cellSize * .28,
					(this.sideSpacing + .5 + y) * this.cellSize
				);
			}
		}

		this.context.restore();

	}

	buildCanvas(target){
		// calculate the size of canvas we want to fit inside the window
		let size = window.innerHeight;
		if(window.innerWidth < size){
			size = window.innerWidth;
		}
		size = Math.round(size * .9);
		
		// now get the cell size that we'll be using.
		this.cellSize = Math.floor(size / (this.maxGridSize + this.sideSpacing));

		// now we can build the canvas itself
		let canvas = document.createElement('canvas');
		size = this.cellSize * (this.maxGridSize + this.sideSpacing);
		canvas.width = size;
		canvas.height = size;
		canvas.style.backgroundColor = 'rgb(0, 0, 0, 0)';//'rgb(' + this.colours.empty.red + ', ' + this.colours.empty.green + ', ' + this.colours.empty.blue + ')';

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
		const grid = [];
		
		for (let x = 0; x < width; x++) {
			grid[x] = [];
			for (let y = 0; y < height; y++) {
				grid[x][y] = Math.random() < fillProbability ? 1 : 0;
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


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
			easy: { minSegments: 1, maxSegments: 3, fillProbability: 0.7 },
			medium: { minSegments: 2, maxSegments: 5, fillProbability: 0.6 },
			hard: { minSegments: 3, maxSegments: 7, fillProbability: 0.45 }
		};

		this.colours = {
			empty : { red : 157, green : 168, blue : 138, alpha : .5 },
			active : { red: 239, green :221, blue : 115, alpha : .5 },
			text : { red : 68, green :  67, blue : 58 }
		};

		this.maxGridSize = 12;
		this.map = null;
		this.rowClues = null;
		this.columnClues = null;
		this.cellSize = 0;
		this.sideSpacing = 2; // number of cell sizes used for numbers.  Should be made dynamic with settings, along with board position
		this.font = 'Vanilla Extract';

		this.canvas = this.buildCanvas(parameters.target);
		this.context = this.canvas.getContext('2d');


		this.startGame();
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

	startGame(){
		// generate our map and 
		this.generate(this.maxGridSize, this.maxGridSize, 'hard');
		this.drawCells();
	}

	drawCells(){
		// draw the cells
		var x, y;

		for(y = 0; y < this.map.length; y++){
			for(x = 0; x < this.map[y].length; x++){
				if(this.map[y][x] == 1){
					this.drawBox(x, y, this.colours.active);
				}else{
					this.drawBox(x, y, this.colours.empty, true);
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
		var highlight = 'rgba(255, 255, 255, .2)';
		var darkColour = this.#colourToText({red : colour.red >> 1, green : colour.green >> 1, blue : colour.blue >> 1, 'alpha' : 0.1});

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
		if(colour == undefined) colour = 'rgba(255, 64, 0, .3)';
		x *= this.cellSize;
		y *= this.cellSize;
		let x1 = 40;
		let x2 = 215;
		let y1 = x1;
		let y2 = x2;

		this.context.save();

		this.context.translate(x, y);
		this.context.scale(this.cellSize / 256, this.cellSize / 256);

		this.context.strokeStyle = colour;
		this.context.lineWidth = this.cellSize / 3;
		this.context.lineCap = 'round';
		this.context.lineJoin = 'miter';

		this.context.beginPath();

		this.context.moveTo(x1, y1);
		this.context.lineTo(x2, y2);
		this.context.moveTo(x1, y2);
		this.context.lineTo(x2, y1);

		this.context.stroke();

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

	generateRowClues() {
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

	generateColumnClues() {
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
}


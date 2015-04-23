<html>
<head>
<style type="text/css">

	#gameWrapper{
		text-align:center;
		position:relative;
		width:100%;
	}
	#playArea{
		position:relative;
		margin:auto;
		height:0px;
	}
	#gameHolder{
		position:relative;
	}
	#header{
		margin-bottom: 20px;
	}
	#imagecache{
		width: 0px;
		height: 0px;
		overflow: hidden;
		position: absolute;
		top:-1px;
		left: -1px;
	}
	#controls{
		position:relative;
		margin:auto;
		width:100%;
		top: 370px;
	}
	#slideWrapper{
		position:relative;
		margin:auto;
		width: 160px;
		height: 8px;
		background-image:url(images/sliderBackdrop.png);
	}
	body{
		background-color: #000;
		background-image: url(images/backdrop.jpg);
	}
</style>
<script src="http://ajax.googleapis.com/ajax/libs/jquery/1.5/jquery.min.js"></script>
<script type="text/javascript" src="gfxLib.js"></script>
<script type="text/javascript" src="helperFuncs.js"></script>
<script type="text/javascript" src="spriteSet.js"></script>
<script type="text/javascript" src="slider.js"></script>
<script src="http://www.google-analytics.com/urchin.js" type="text/javascript"></script>
<script type="text/javascript">
	_uacct = "UA-3072147-1";
	try { urchinTracker(); } catch(e){};

	var cellSet, slider;
	var board, animationTally;

	var flippitBoard = function(){
		var xspacing, yspacing;
		var cell, width, height, maxBoardSize;
		var globalKey, animationTally;
		var inputLayer, overlay;
		var gameState;
		var me = this;

		this.cell = [];
		this.width = this.height = this.maxBoardSize = 7;
		this.xspacing = this.yspacing = 48;
		this.globalKey = globalRefs.add(this);
		this.animationTally = 0;
		this.gameState = 'initializing';

		for(n = 0; n < this.maxBoardSize * this.maxBoardSize; n++){
			this.cell[n] = new spriteClass(cellSet);
			this.cell[n].setFrame(0);
			x = n % 8;
			y = Math.floor(n / 8);
			this.cell[n].position(x * cellSet.frameWidth, y * cellSet.frameHeight);
			this.cell[n].setFrame(0);
			this.cell[n].flipState = 0;
		}

		this.flipCell = function(x, y, noanimate){
			if(noanimate == undefined) noanimate = false;
			var index;
			if(x >= 0 && x < this.width && y >= 0 && y < this.width){
				index = x + y * this.maxBoardSize;
				this.cell[index].flipState ^= 1;
				if(!noanimate){
					if(this.cell[index].flipState){
						this.animationTally++;
						this.cell[index].startSequence('on', {
							'callback': function(){
								me.animationTally--;
								me.checkState();
							}
						});
					}else{
						this.animationTally++;
						this.cell[index].startSequence('off', {
							'callback': function(){
								me.animationTally--;
								me.checkState();
							}
						});
					}
				}
			}
		}

		this.checkState = function(){
			var x, y, won, lastState;
			if(this.animationTally == 0){
				won = true;
				lastState = this.cell[0].flipState;
				for(y = 0; y < this.height && won; y++){
					for(x = 0; x < this.width && won; x++){
						if(this.cell[x + this.maxBoardSize * y].flipState != lastState) won = false;
					}
				}
				if(won == true){
					this.congratulate();
				}
			}
		}

		this.congratulate = function(step){
			var x, y, sequence;
			if(step == undefined) step = 0;
			switch(step){
				case 0:
					// we'll start by triggering fade in of the "you win" text
					this.gameState = 'congratulating';
					var img1 = $('<img src="images/win1.png">');
					var img2 = $('<img src="images/win2.png">');
					this.overlay.append(img2);
					this.overlay.append(img1);
					var params = {
						'left': (this.width * this.xspacing - img1.width()) / 2,
						'top': (this.height * this.yspacing - img1.height()) / 2,
						'opacity':0,
						'position':'absolute'
					};
					img1.css(params);
					img2.css(params);

					img1.animate({'opacity':1}, 500, function(){
						img1.animate({'opacity':0}, 1000);
						img2.animate({'opacity':1}, 500, function(){
							img2.animate({'opacity':0}, 500);
						});
					});

					// now let's start all of the cells flipping over
					if(this.cell[0].flipState){
						sequence = 'off';
					}else{
						sequence = 'on';
					}
					for(y = 0; y < this.height; y++){
						for(x = 0; x < this.width; x++){
							index = x + y * this.maxBoardSize;
							this.cell[index].flipState ^= 1;
							var cell = this.cell[index];
							if(y == this.height - 1 && x == this.height - 1){
								flipFunc = function(obj, time){
									setTimeout(function(){
										obj.startSequence(sequence, {
											'callback': function(){
												me.congratulate(1);
											}
										});
									}, time);
								};
							}else{
								flipFunc = function(obj, time){
									setTimeout(function(){
										obj.startSequence(sequence);
									}, time);
								};
							}
							flipFunc(cell, 80 *(x + y));
						}
					}
					break;
				case 1:
					// cells are done flipping, let's rescramble
					oldState = this.cell[0].flipState;
					if(oldState){
						sequence = 'off';
					}else{
						sequence = 'on';
					}
					this.scramble();
					for(y = 0; y < this.height; y++){
						for(x = 0; x < this.width; x++){
							var cell = this.cell[x + y * this.maxBoardSize];
							flipFunc = function(obj, time){
								setTimeout(function(){
									obj.startSequence(sequence);
								}, time);
							};
							if(cell.flipState != oldState){
								flipFunc(cell, 80 *(x + y));
							}
						}
					}
					this.gameState = 'active';
					break;
			}
		}

		this.setSize = function(newSize){
			if(newSize > 0 && newSize <= this.maxBoardSize){
				this.width = this.height = newSize;
			}
		}

		this.clear = function(){
			var n, max;
			max = this.maxBoardSize * this.maxBoardSize;
			for(n = 0; n < max; n++){
				this.cell[n].setFrame(0);
				this.cell[n].flipState = 0;
			}
		}

		this.scramble = function(factor){
			var numFlips, n, x, y, priorFlips;
			if(factor == undefined) factor = 1;
			factor *= .25;
			numFlips = Math.floor(this.width * this.height * factor);
			if(numFlips > this.width * this.height - 1) numFlips = this.width * this.height - 1;

			priorFlips = [];
			for(n = 0; n < numFlips; n++){
				x = Math.floor(Math.random() * this.width);
				y = Math.floor(Math.random() * this.height);
				if(priorFlips[x + this.width * y] == undefined){
					priorFlips[x + this.width * y] = true;
					this.flipCell(x, y, true);
					this.flipCell(x + 1, y, true);
					this.flipCell(x - 1, y, true);
					this.flipCell(x, y + 1, true);
					this.flipCell(x, y - 1, true);
				}else{
					n--;
				}
			}
		}

		this.draw = function(target){
			var x, y, sprite, yoffset;
			yoffset = (this.maxBoardSize - this.width) * this.yspacing >> 1;
			$('#playArea').css({'width':(this.width * this.xspacing) + 'px'});
			$('#gameHolder').css({'width':(this.width * this.xspacing) + 'px'});
			for(y = 0; y < this.height; y++){
				for(x = 0; x < this.width; x++){
					sprite = this.cell[x + this.maxBoardSize * y];
					if(this.cell[x + this.maxBoardSize * y].flipState == 1){
						sprite.setFrame(11)
					}else{
						sprite.setFrame(0)
					}
					sprite.draw(target);
					
					sprite.position(x * this.xspacing, y * this.yspacing + yoffset);
				}
			}
			this.inputLayer = $('<div></div>');
			this.overlay = $('<div></div>');
			var props = {
				'width':(this.width * this.xspacing) + 'px',
				'height':(this.height * this.yspacing) + 'px',
				'left':(this.cell[0].set.frameWidth - this.xspacing) / 2 + 'px',
				'top':yoffset + ((this.cell[0].set.frameHeight - this.yspacing) / 2) + 'px',
				'position':'absolute',
				'background-color':'#000', // these two lines are needed because
				'opacity':0		   // IE is a useless piece of shit.
			};
			
			this.inputLayer.css(props);
			this.overlay.css(props);
			this.overlay.appendTo(target);
			this.inputLayer.appendTo(target);
			this.gameState = 'active';
			var flipFunc = function(obj){
				obj.inputLayer.click(
					function(e){ 
						obj.handleClick(e.pageX, e.pageY); 
						return false;
					}
				);
			}
			flipFunc(this);
		}

		this.handleClick = function(x, y){
			var p = this.inputLayer.offset();
			if(this.animationTally == 0 && this.gameState == 'active'){
				x -= p.left;
				y -= p.top;
				x = Math.floor(x / this.xspacing);
				y = Math.floor(y / this.yspacing);
				this.flipCell(x, y);
				this.flipCell(x + 1, y);
				this.flipCell(x - 1, y);
				this.flipCell(x, y + 1);
				this.flipCell(x, y - 1);
			}
		}

		this.resize = function(size){
			this.clear();
			this.setSize(size);
			this.scramble();
			$('#gameHolder').empty();
			this.draw($('#gameHolder'));
		}
	}

	$(document).ready(function(){
		slider = new sliderClass({
			x1: -12, y1: -6,
			x2: 148, y2: -6,
			value:5,
			min: 3, max: 7,
			values: 'integer',
			handle: $('<img src="images/sliderHandle.png">'),
			onDrag: function(val){
				board.resize(val);
			}
		});
		slider.draw($('#slideWrapper'));

		cellSet = new spriteSet();
		cellSet.load('cell.sprite', function(rval){
			board = new flippitBoard();
			board.setSize(5);
			board.scramble();
			board.draw($('#gameHolder'));
		});
	});
</script>
</head>
<body>
	<div id="gameWrapper">
		<div id="header">
			<img src="images/banner.png">
		</div>
		<div id="playArea">
			<div id="gameHolder">
			</div>
		</div>
		<div id="controls">
			<div id="slideWrapper"></div>
			<div id="test" style="top:100px; position:relative; color:#FFF"></div>
		</div>
	</div>
	<div id="imagecache">
		<img src="images/win1.png"/>
		<img src="images/win2.png"/>
	</div>
	<div style="font-weight:bold;color:#FFA" id="dump"></div>
</body>
</html>

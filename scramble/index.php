<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/> 
<style type="text/css">
	body{
		margin:none;
		text-align:center;
		background-color: #000;
	}
	#pageWrapper{
		position:relative;
		margin:auto;
		width:640px;
		color: #FA7;
	}
	#header{
		position:relative;
		height:40px;
		margin-left:64px;
		margin-right:64px;
	}
	#content{
		position:relative;
		height:520px;
	}
	#footer{
		position:relative;
	}
	#preload{
		width:0px;
		height:0px;
		overflow:hidden;
	}
</style>
<script src="http://ajax.googleapis.com/ajax/libs/jquery/1.5/jquery.min.js"></script>
<script type="text/javascript" src="spriteSet.js"></script>
<script type="text/javascript" src="gfxLib.js"></script>
<script type="text/javascript" src="helperFuncs.js"></script>
<script src="http://www.google-analytics.com/urchin.js" type="text/javascript"></script>
<script type="text/javascript">
	_uacct = "UA-3072147-1";
	try{ urchinTracker();}catch(e){};
	function sliderGame(){
		var text;
		var globalKey, cellMap;
		var map, cell, canvas, inputLayer, overlay, canvasWrapper;
		var image, imageWidth, imageHeight, enumerate;
		var canvasWidth, canvasHeight, cellWidth, cellHeight;
		var width, height;

		var toolWrapper, scrolling, gridSizeText;

		this.globalKey = globalRefs.add(this);

		// let's add some default values
		this.image = 'images/scenes/01_trail.jpg';
		this.imageWidth = 512;
		this.imageHeight = 512;
		this.width = 5;
		this.height = 5;
		this.enumerate = false;

		this.initialize = function(){
			var me = this;
			this.state = 'initializing';
			this.buildMap();
			this.buildLayers();
			this.buildCells();
			this.drawCompleteImage();

			this.text = new spriteSet();
			this.text.load('text.sprite', function(){
				me.drawToolbars();
			});
			this.state = 'playing';
		}

		this.reset = function(){
			this.buildMap();
			this.buildLayers();
			this.buildCells();
			this.drawCompleteImage();
			this.state = 'playing';
		}

		this.drawToolbars = function(){
			var imageText, gridText, startButton, exitButton;
			var me = this, n;

			this.toolWrapper = $('<div></div>');
			this.toolWrapper.css({
				'width': '512px',
				'position':'relative',
				'margin':'auto'
			});

			exitButton = new spriteClass(this.text);
			exitButton.setFrame('exit');
			exitButton.draw($('#header'));
			exitButton.position(464, 18);
			exitButton.element.click(function(){
				exit();
			});

			imageText = new spriteClass(this.text);
			imageText.setFrame('image');
			imageText.draw(this.toolWrapper);
			imageText.position(0, 0);

			this.imageDiv = $('<div></div>');
			this.imageDiv.css({'position':'absolute', 'left':'150px', 'top':'8px', 'height':'54px', 'width':'180px', 'overflow':'hidden'});

			this.imageList = $('<div></div>');
			this.imageList.css({
				'position':'absolute', 
				'left':'0px', 
				'height':'54px'
			});
			this.imageFiles = [<?php
				// yes, PHP nested in Javascript.  I feel dirty too.
				$result = explode("\n", trim(shell_exec('ls -1 images/thumbnails')));
				echo "'" . implode("','", $result) . "'";

			?>];
			for(n = 0; n < this.imageFiles.length; n++){
				var img = $('<img src="images/thumbnails/' + this.imageFiles[n] + '">');
				this.imageList.append(img);
				img.css({
					'position':'absolute',
					'top': '0px',
					'left': (60 * n) + 'px'
				});
				eval('img.handleClick = function(){globalRefs.get("' + this.globalKey + '").selectImage(' + n + ');}');
				img.click(img.handleClick);
			}
			this.imageList.css({'width':(60 * this.imageFiles.length) + 'px'});

			this.imageList.appendTo(this.imageDiv);
			this.imageDiv.appendTo($('#footer'));

			var scrollLeft = new spriteClass(this.text);
			scrollLeft.setFrame('prev');
			scrollLeft.draw($('#footer'));
			scrollLeft.position(110, 28);
			eval('scrollLeft.element.click(function(){globalRefs.get("' + this.globalKey + '").scrollImage(1);})');

			var scrollRight = new spriteClass(this.text);
			scrollRight.setFrame('next');
			scrollRight.draw($('#footer'));
			scrollRight.position(336, 28);
			eval('scrollRight.element.click(function(){globalRefs.get("' + this.globalKey + '").scrollImage(-1);})');

			gridText = new spriteClass(this.text);
			gridText.setFrame('gridSize');
			gridText.draw(this.toolWrapper);
			gridText.position(436, 0);

			this.gridSizeText = new spriteClass(this.text);
			this.gridSizeText.setFrame(this.width);
			this.gridSizeText.draw(this.toolWrapper);
			this.gridSizeText.position(448, 28);

			var leftArrow = new spriteClass(this.text);
			leftArrow.setFrame('prev');
			leftArrow.draw(this.toolWrapper);
			leftArrow.position(416, 28);
			eval('leftArrow.element.click(function(){globalRefs.get("' + this.globalKey + '").changeSize(-1);})');

			var rightArrow = new spriteClass(this.text);
			rightArrow.setFrame('next');
			rightArrow.draw(this.toolWrapper);
			rightArrow.position(480, 28);
			eval('rightArrow.element.click(function(){globalRefs.get("' + this.globalKey + '").changeSize(1);})');


			var enumerateText = new spriteClass(this.text);
			enumerateText.setFrame('enum');
			enumerateText.draw(this.toolWrapper);
			enumerateText.position(300, 0);

			this.yesButton = new spriteClass(this.text);
			this.yesButton.setFrame('yes');
			this.yesButton.draw(this.toolWrapper);
			this.yesButton.position(312, 30);

			this.yesHighlight = new spriteClass(this.text);
			this.yesHighlight.setFrame('yesbold');
			this.yesHighlight.draw(this.toolWrapper);
			this.yesHighlight.position(312, 30);
			this.yesHighlight.element.click(function(){me.showNumbers(true);});
			this.yesHighlight.element.fadeTo(0, 0);

			this.noButton = new spriteClass(this.text);
			this.noButton.setFrame('no');
			this.noButton.draw(this.toolWrapper);
			this.noButton.position(350, 30);

			this.noHighlight = new spriteClass(this.text);
			this.noHighlight.setFrame('nobold');
			this.noHighlight.draw(this.toolWrapper);
			this.noHighlight.position(350, 30);
			this.noHighlight.element.click(function(){me.showNumbers(false);});



			$('#footer').append(this.toolWrapper);

		}

		this.buildLayers = function(){
			var layerParams = {
				'position':'absolute',
				'top':'0px',
				'left':'0px',
				'width':'100%',
				'height':'100%'
			}

			if(this.canvasWrapper != undefined) this.canvasWrapper.remove();
			if(this.canvas != undefined) this.canvas.remove();
			if(this.overlay != undefined) this.overlay.remove();
			if(this.inputLayer != undefined) this.inputLayer.remove();


			// add the wrapper that contains our layers
			this.canvasWidth = (Math.floor(this.imageWidth / this.width)) * this.width + 1;
			this.canvasHeight = (Math.floor(this.imageHeight / this.height)) * this.height + 1;
			this.canvasWrapper = $('<div></div>');
			this.canvasWrapper.css({
				'width': this.canvasWidth + 'px',
				'height': this.canvasHeight + 'px',
				'margin':'auto',
				'top':'4px',
				'position':'relative'
			});
			$('#content').append(this.canvasWrapper);

			// add the game drawing canvas
			this.canvas = $('<div></div>');
			this.canvas.css(layerParams);
			this.canvasWrapper.append(this.canvas);

			// add the overlay
			this.overlay = $('<div></div>');
			this.overlay.css(layerParams);
			this.canvasWrapper.append(this.overlay);

			// add our input layer
			this.inputLayer = $('<div></div>');
			// need to add these two parameters because IE is a fucked up piece of shit
			layerParams['background-color'] = '#000'; 
			layerParams['opacity'] = '0';
			this.inputLayer.css(layerParams);
			this.canvasWrapper.append(this.inputLayer);
			eval('globalRefs.get("' + this.globalKey + '").inputLayer.click(function(e){ globalRefs.get("' + this.globalKey + '").handleClick(e.pageX, e.pageY); return false;});');

		}

		this.buildMap = function(){
			var x, y, idx;

			this.cellWidth = Math.floor(this.imageWidth / this.width);
			this.cellHeight = Math.floor(this.imageHeight / this.height);

			this.map = new spriteSet();
			this.map.setImage(this.image);
			this.map.setFrameSize(this.cellWidth - 1, this.cellHeight - 1);
			idx = 0;
			for(y = 0; y < this.height; y++){
				for(x = 0; x < this.width; x++){
					this.map.addFrame(idx++, {
						'left':this.cellWidth * x + 1,
						'top':this.cellHeight * y + 1,
						'width':this.cellWidth - 1,
						'height':this.cellHeight - 1
					});
				}
			}

		}

		this.buildCells = function(){
			var n, x, y, pos;

			this.cell = [];
			this.cellMap = [];
			for(n = 0; n < this.width * this.height - 1; n++){
				x = n % this.width;
				y = (n - x) / this.width;
				if(!y) this.cellMap[n] = [];

				this.cell[n] = new spriteClass(this.map);
				this.cell[n].setFrame(n);
				pos = this.calcCellPos(x, y);
				this.cell[n].position(pos.x, pos.y);

				this.cellMap[x][y] = n;
			}
			this.scramble();
			for(n--; n >= 0; n--){
				this.cell[n].draw(this.canvas);

				// quick 'n' dirty: draw the cell enumeration:
				var numWrapper = $('<div></div>');
				numWrapper.attr("id", "enum_" + n);
				var numberTag = $('<div>' + (n + 1) + '</div>');
				numberTag.css({'font-weight':'bold', 'position':'absolute', 'top':1, 'left':1, 'color':'#000'});
				var numberOverlay = $('<div>' + (n + 1) + '</div>');
				numberOverlay.css({'font-weight':'bold', 'position':'absolute', 'top':0, 'left':0, 'color':'#FFF'});
				numWrapper.append(numberTag);
				numWrapper.append(numberOverlay);
				this.cell[n].element.append(numWrapper);
				if(!this.enumerate){
					numWrapper.fadeTo(0, 0);
				}
			}
		}

		this.showNumbers = function(on){
			if(on != this.enumerate){
				this.enumerate = on;
				var onFade = on ? 1:0;
				this.noHighlight.element.fadeTo(200, 1 - onFade);
				this.yesHighlight.element.fadeTo(200, onFade);
				for(n = this.width * this.height - 2; n >= 0; n--){
					$('#enum_' + n).fadeTo(200, onFade);
				}
			}
		}

		this.changeSize = function(direction){
			var newSize = this.width + direction;
			var me = this;
			if(newSize > 2 && newSize < 10 && me.state != 'resize'){
				me.state = 'resize';
				me.gridSizeText.setFrame(newSize);
				me.overlay.fadeOut(0);
				this.canvas.fadeOut(200, function(){
					me.width = newSize;
					me.height = newSize;
					me.canvas.empty();
					me.buildMap();
					me.buildCells();
					me.scramble();
					me.canvas.fadeIn(200);

					me.state = 'playing';
				});
			}
		}


		this.scrollImage = function(direction){
			if(this.scrolling != true){
				this.scrolling = true;

				var newPos;
				var pos = this.imageList.position();
				var me = this;
				var vw = this.imageDiv.width(), lw = this.imageList.width();

				newPos = pos.left + 120 * direction;
				if(newPos > 0) newPos = 0;
				if(newPos < vw - lw) newPos = vw - lw;

				this.imageList.animate({'left': + newPos + 'px'}, 100, function(){
					me.scrolling = false;
				});
			}
		}

		this.drawCompleteImage = function(){
			var img;
			img = $('<img src="' + this.image + '">');
			this.overlay.empty();
			this.overlay.append(img);
			this.overlay.fadeOut(0);
		}

		this.scramble = function(){
			var gapx, gapy, n, slidex, slidey, x, y, direction, idx;
			// first find out where our gap is
			for(y = 0; y < this.width && gapy == undefined; y++){
				for(x = 0; x < this.width && gapx == undefined; x++){
					if(this.cellMap[x][y] == undefined){
						gapx = x;
						gapy = y;
					}
				}
			}

			for(n = 0; n < this.width * this.height; n++){
				if(n % 2){
					slidex = gapx + 1 + Math.floor(Math.random() * (this.width - 1));
					slidex %= this.width;
					
					direction = slidex < gapx ? -1 : 1;
					for(; gapx != slidex; gapx += direction){
						idx = this.cellMap[gapx + direction][gapy];
						this.cell[idx].pos = {x:gapx, y:gapy};
						this.cellMap[gapx][gapy] = idx;
						pos = this.calcCellPos(gapx, gapy);
						this.cell[idx].position(pos.x, pos.y);
					}
					this.cellMap[gapx][gapy] = undefined;
				}else{
					slidey = gapy + 1 + Math.floor(Math.random() * (this.height - 1));
					slidey %= this.height;
					
					direction = slidey < gapy ? -1 : 1;
					for(; gapy != slidey; gapy += direction){
						idx = this.cellMap[gapx][gapy + direction];
						this.cell[idx].pos = {x:gapx, y:gapy};
						this.cellMap[gapx][gapy] = idx;
						pos = this.calcCellPos(gapx, gapy);
						this.cell[idx].position(pos.x, pos.y);
					}
					this.cellMap[gapx][gapy] = undefined;

				}
			}
		}

		this.selectImage = function(imageNum){
			var me = this;

			this.image = 'images/scenes/' + this.imageFiles[imageNum];
			this.drawCompleteImage();
			this.canvas.fadeOut(200, function(){
				me.map.setImage(me.image);
				for(n = 0; n < me.width * me.height - 1; n++){
					me.cell[n].image.remove();
					me.cell[n].image = $('<img src="' + me.image + '">');
					me.cell[n].element.prepend(me.cell[n].image);
					me.cell[n].image.css({
						'position':'absolute',
						'left':-me.cell[n].frame.x + 'px',
						'top':-me.cell[n].frame.y + 'px'
					});
					me.cell[n].refreshFrame();
				}
				if(me.state != 'playing'){
					me.scramble();
				}
				me.canvas.fadeIn(200, function(){
					me.state = 'playing';
				});
			});

		}

		this.checkForWin = function(){
			var n, x, y, win;
			win = true;
			for(n = 0; n < this.width * this.height - 1; n++){
				x = n % this.width;
				y = (n - x) / this.width;
				if(this.cellMap[x][y] != n){
					win = false;
				}
			}
			if(win){
				this.state = 'won';
				this.overlay.fadeIn(800);
				var flare = $('<div></div>');
				flare.css({'width':'100%', 'height':'100%', 'background-color':'#FFD', 'position':'absolute', 'top':'0px', 'left':'0px'});
				flare.fadeTo(0, 0);
				this.overlay.append(flare);
				flare.fadeTo(200, .8, function(){
					flare.fadeTo(600, 0);
				});

			}
		}

		this.handleClick = function(x, y){
			if(this.state == 'playing'){
				var p = this.inputLayer.offset();
				x -= p.left;
				y -= p.top;
				x = Math.floor(x / this.cellWidth);
				y = Math.floor(y / this.cellHeight);
				this.doSlide(x, y, true);
			}
		}

		this.doSlide = function(x, y, animate){
			var n, slideX = false, slideY = false;
			var increment, pos, tally, callback;
			if(this.cellMap[x][y] != undefined){
				for(n = 0; n < this.width && !slideX; n++){
					if(this.cellMap[n][y] == undefined){
						slideX = true;
						break;
					}
				}
				if(slideX){
					increment = n < x ? 1:-1;
					tally = 0;
					for(n += increment;n != x + increment; n += increment){
						pos = this.calcCellPos(n - increment, y);
						if(animate){
							if(n == x){
								eval('callback = function(){globalRefs.get("' + this.globalKey + '").checkForWin();}');
								this.cell[this.cellMap[n][y]].element.delay(30 * tally).animate({'left':pos.x}, 100, callback);
							}else{
								this.cell[this.cellMap[n][y]].element.delay(30 * tally).animate({'left':pos.x}, 100);
							}
						}
						this.cell[this.cellMap[n][y]].pos = pos;
						this.cellMap[n - increment][y] = this.cellMap[n][y];
						this.cellMap[n][y] = undefined;
						tally++;
					}
				}else{
					for(n = 0; n < this.height && !slideY; n++){
						if(this.cellMap[x][n] == undefined){
							slideY = true;
							break;
						}
					}
					if(slideY){
						increment = n < y ? 1:-1;
						tally = 0;
						for(n += increment ;n != y + increment; n += increment){
							pos = this.calcCellPos(x, n - increment);
							if(animate){
								if(n == y){
									eval('callback = function(){globalRefs.get("' + this.globalKey + '").checkForWin();}');
									this.cell[this.cellMap[x][n]].element.delay(50 * tally).animate({'top':pos.y}, 100, callback);
								}else{
									this.cell[this.cellMap[x][n]].element.delay(50 * tally).animate({'top':pos.y}, 100);
								}
							}
							this.cell[this.cellMap[x][n]].pos = pos;
							this.cellMap[x][n - increment] = this.cellMap[x][n];
							this.cellMap[x][n] = undefined;
							tally++;
						}
					}
				}
			}
			return false;
		}

		this.calcCellPos = function(x, y){
			return {
				'x' : x * (this.cellWidth) + 1,
				'y' : y * (this.cellHeight) + 1
			};
		}

		this.initialize();
	}

<?php
	if(isset($exitFunc)) echo $exitFunc;
	else echo "function exit(){history.go(-1);}";
?>

	var game;

	$(document).ready(function(){
		
		game = new sliderGame();
	});
</script>
</head>
<body>
	<div id="pageWrapper">
		<div id="header"><img src="images/scramble.png" alt="SCRAMBLE" style="position:absolute;top:10px;left:0px;"/></div>
		<div id="content"></div>
		<div id="footer"></div>
	</div>
</body>
</html>

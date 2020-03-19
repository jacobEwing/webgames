var randomTextCache = [], randomTextCount = 0;
// returns "numChars" random characters that have not been returned previously
function randomText(numChars){
	var n, c, i;
	var returnval = '';

	// note: this will cause an infinite loop if more than 26^numChars strings are asked for. 
	do{
		for(n = 0; n < numChars; n++){
			i = Math.round(Math.random() * 25);
			c = String.fromCharCode(65 + i);
			returnval = returnval + c;
		}
		inUse = false;
		for(n = 0; n < randomTextCount; n++){
			if(randomTextCache[n] == returnval){
				inUse = true;
				break;
			}
		}
	}while(inUse);
	randomTextCache[randomTextCount] = returnval;
	randomTextCount++;
	return returnval;
}

// precede backslash characters and double quotes with backslash characters
function parseQuotes(text){
	if(text == undefined) return text;

	returnval = text.replace(/\\/g, '\\\\');
	returnval = returnval.replace(/\"/g, '\\"');
	return returnval;
}

// returns the clockwise angle in radians between the line "x = x1" and the vector (x1, y1)-(x2, y2)
function rel_ang(x1, y1, x2, y2){ 
	var hyp, alpha, deltax, deltay;
	var deltax = x2 - x1;
	var deltay = y2 - y1;
	var hyp = Math.sqrt(deltax * deltax + deltay * deltay);

	/********* figure out the value for alpha *********/
	if(y2 == y1){ 
		alpha = pi / 2; 
		if(x2 < x1) alpha = 3 * pi / 2; 
	}else if(x2 == x1){ 
		alpha = 0; 
		if(y2 > y1) alpha = pi;

	}else if(x2 > x1){ 
		if(y2 < y1)
			alpha = Math.asin(deltay / hyp) + pi / 2; 
		else if(y2 > y1)
			alpha = Math.asin(deltay / hyp) + pi / 2; 
	}else if(x2 < x1){ 
		if(y2 < y1)
			alpha = Math.acos(deltay / hyp) + pi;
		else if(y2 > y1)
			alpha = Math.acos(deltay / hyp) + pi;
	}    
	return alpha;
}

// checks to see if the polygon defined by the points in the array "corners"
// contains the point (x, y).  Note that this ~only~ works for convex polygons
function polyContains(x, y, corners){
	var n, m, tally = 0;
	var numCorners = corners.length;
	var returnval = false;

	for(n = 0; n < numCorners; n++){
		m = (n + 1) % numCorners;
		tally += sideOfLine(
			corners[n][0], corners[n][1],
			corners[m][0], corners[m][1],
			x, y);
	}
	if(Math.abs(tally) == numCorners) returnval = true;
	return returnval;
}

// takes the line segment (x1, y1)-(x2, y2), and tells what side (pointx, pointy) lies on
function sideOfLine(x1, y1, x2, y2, pointx, pointy){
	var a, b, returnval = 0;

	a = (pointx - x1) * (y2 - y1); 
	b = (pointy - y1) * (x2 - x1);

	if(a > b) returnval = 1;
	else if(a < b) returnval = -1;
	return returnval;
}

function in_array(needle, haystack) {
	var length = haystack.length;
	for(var n = 0; n < length; n++) {
		if(haystack[n] == needle) return true;
	}
	return false;
}


function write(text, style, useBreak){
	if(style == undefined) style = 'font-weight:bold; color:#FFF';
	if(useBreak == undefined) useBreak = true;

	_console = $('#console');
	_console.append('<span style="' + style + '">' + text + '</span>');
	if(useBreak) _console.append('<br/>');
	h1 = _console.innerHeight();
	h2 = _console.attr('scrollHeight');
	_console.scrollTop(h2 - h1);
}

function error(text){
	write('[ERROR]: ' + text, "font-weight: bold; color: #F55");
}

function hypotenuse(x1, y1, x2, y2){
	dx = x2 - x1;
	dy = y2 - y1;
	return Math.sqrt(dx * dx + dy * dy);
}

function popup(message, lockscreen){
	if(lockscreen == undefined) lockscreen = true;
	var messageDiv = $('<div style="text-align:center"></div>');

	messageDiv.append(message);

	messageDiv.dialog({
		modal: true,
		resizable: false,
		close: function() { 
			$(this).remove();
		},
		buttons: {
			"Close": function() { 
				$(this).dialog("close");
//				$(this).remove();
			}
		}
	});

}

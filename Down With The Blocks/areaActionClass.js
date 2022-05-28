/*
This is a simple class to keep track of rectangular areas that need to trigger
a function call on mouse click.  Used for handling icon clicks inside the game
canvas.
*/
var areaActionClass = function(){
	this.areas = [];	
};

// add a neweon to the list
areaActionClass.prototype.addArea = function(areaName, area, callback){
	if(this.areas[areaName] != undefined){
		throw "areaActionCLass::addArea: area name \"" + areaName + "\" already exists";
	}

	this.areas[areaName] = {
		area : area, //JSON.parse(JSON.stringify(area)),
		callback : callback
	}
}

// remove the specified area from our list
areaActionClass.prototype.removeArea = function(areaName){
	if(this.areas[areaName] == undefined){
		//throw "areaActionClass::removeArea: area name \"" + areaName + "\" undefined";
		return;
	}

	delete this.areas[areaName];
}

// check to see if the x/y coordinate is on any areas, and run their callback if so
areaActionClass.prototype.checkAreas = function(x, y){
	var idx, topRight;
	var tally = 0;

	for(idx in this.areas){
		topLeft = {
			x : x - this.areas[idx].area.x,
			y : y - this.areas[idx].area.y
		}
		if(topLeft.x >= 0 && topLeft.y >= 0 && topLeft.x < this.areas[idx].area.w && topLeft.y < this.areas[idx].area.h){
			this.areas[idx].callback();
		}
	}
}


// a class for representing different games.  
function gameClass(){
	this.globalId = 'game_' + randomText(10);
	globalRefs[this.globalId] = this;
	var draggedItem;
	var dragOffset, dragOffsetLength;
	var dragPosition;
	this.draggedItem = undefined;
	this.draggingCard = false;

	this.handleCardClick = function(x, y, element){
		if(element.globalId.search('card_') >= 0){
			this.dragPosition = [x - element.x, y - element.y];
			this.draggedItem = element;
			this.draggingCard = true; // just to keep track of the fact that it's a card we're dragging
			this.dragOffset = [ // the vector from the center of the card to the mouse location
				this.dragPosition[0] - element.stack.posx,
				this.dragPosition[1] - element.stack.posy
			];
			this.dragOffsetLength = Math.sqrt(this.dragOffset[0] * this.dragOffset[0] + this.dragOffset[1] * this.dragOffset[1]);
		}
	}

	this.handleClick = function(x, y){
	}

	this.handleDrag = function(obj, x, y){
		if(this.draggedItem != undefined){
			if(this.draggedItem.globalId.search('card_') >= 0){
				if(this.dragOffsetLength > 15){
					// this is a card getting dragged
					oldDx = this.dragOffset[0];
					oldDy = this.dragOffset[1];
					newDx = x - this.draggedItem.x - this.draggedItem.stack.posx;
					newDy = y - this.draggedItem.y - this.draggedItem.stack.posy;

					theta = rel_ang(0, 0, newDx, newDy) - rel_ang(0, 0, oldDx, oldDy);

					this.draggedItem.rotate(theta);
					this.dragOffset[0] = newDx;
					this.dragOffset[1] = newDy;

					ul = Math.sqrt(newDx * newDx + newDy * newDy);
					uDx = newDx / ul;
					uDy = newDy / ul;

					x = this.draggedItem.x + uDx * (ul - this.dragOffsetLength);
					y = this.draggedItem.y + uDy * (ul - this.dragOffsetLength);
					this.draggedItem.setPos(x, y);
				}else{
					x -= this.dragPosition[0];
					y -= this.dragPosition[1];
					this.draggedItem.setPos(x, y);
				}
			}
		}
	}

	this.handleRelease = function(obj, dragtime, netDelta){
		if(this.draggingCard && netDelta.x * netDelta.x + netDelta.y + netDelta.y < 25){
			if(this.draggedItem.stack.getCardPos(this.draggedItem) < this.draggedItem.stack.numCards - 1){
				this.draggedItem.stack.shiftCard(this.draggedItem, 100);
			}else{
				this.draggedItem.flip(200, 10);
			}
		}
		this.draggingCard = false;
		this.draggedItem = undefined;
	}
}



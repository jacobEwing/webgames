/*
	These functions were built by drawing vector images and using available tools to convert them to javascript
*/
function drawShape(shapeName, context){
	switch(shapeName){
		case 'bomb':
			drawBomb(context);
			break;
		case 'volume':
			drawVolume(context);
			break;
		default:
			throw 'svgImages:drawBomb(): invalid image name';
	}
}

function drawVolume(ctx){
	ctx.save();
	var scale = game.gridScale / 100;
	ctx.scale(scale, scale);
	var waveWidth = 7;



	ctx.transform(1.000000, 0.000000, 0.000000, 1.000000, 0.000000, -233.000000);
	
// #rect848
	ctx.beginPath();
	ctx.strokeStyle = 'rgba(245, 249, 250, 0.0)';
	ctx.lineCap = 'round';
	ctx.miterLimit = 4;
	ctx.lineWidth = 0.046518;
	ctx.fillStyle = 'rgb(0, 0, 0)';
	ctx.moveTo(0.090624, 255.967220);
	ctx.lineTo(0.090624, 273.999830);
	ctx.quadraticCurveTo(0.090624, 274.651860, 0.090624, 274.651860);
	ctx.lineTo(16.293961, 274.651860);
	ctx.quadraticCurveTo(16.293961, 274.651860, 16.293961, 273.999830);
	ctx.lineTo(16.293961, 255.967220);
	ctx.quadraticCurveTo(16.293961, 255.315190, 16.293961, 255.315190);
	ctx.lineTo(0.090624, 255.315190);
	ctx.quadraticCurveTo(0.090624, 255.315190, 0.090624, 255.967220);
	ctx.fill();
	ctx.stroke();
	
// #rect856
	ctx.beginPath();
	ctx.strokeStyle = 'rgba(245, 249, 250, 0.0)';
	ctx.lineCap = 'round';
	ctx.miterLimit = 4;
	ctx.lineWidth = 0.069495;
	ctx.fillStyle = 'rgb(0, 0, 0)';
	ctx.moveTo(24.107739, 241.394740);
	ctx.lineTo(27.021977, 241.394740);
	ctx.bezierCurveTo(27.480532, 241.394740, 27.849692, 241.769320, 27.849692, 242.234590);
	ctx.lineTo(27.849692, 287.726650);
	ctx.bezierCurveTo(27.849692, 288.191920, 27.480532, 288.566500, 27.021977, 288.566500);
	ctx.lineTo(24.107739, 288.566500);
	ctx.bezierCurveTo(23.649185, 288.566500, 5.038236, 271.749190, 5.038236, 271.613510);
	ctx.lineTo(5.038236, 258.347730);
	ctx.bezierCurveTo(5.038236, 258.212050, 23.649185, 241.394740, 24.107739, 241.394740);
	ctx.fill();
	ctx.stroke();
	
// #path919
	ctx.beginPath();
	ctx.strokeStyle = 'rgb(2, 3, 3)';
	ctx.lineCap = 'round';
	ctx.miterLimit = 4;
	ctx.lineWidth = waveWidth;
	ctx.moveTo(50.524294, 241.569930);
	ctx.translate(44.306049, 264.841801);
	ctx.rotate(0.000000);
	ctx.scale(0.489325, 1.000000);
	ctx.arc(0.000000, 0.000000, 26.515438, -1.070984, 0.01132719, 0);
	ctx.scale(2.043633, 1.000000);
	ctx.rotate(-0.000000);
	ctx.translate(-44.306049, -264.841801);
	ctx.translate(44.306049, 264.841799);
	ctx.rotate(0.000000);
	ctx.scale(0.489325, 1.000000);
	ctx.arc(0.000000, 0.000000, 26.515438, 0.011327, 1.09363903, 0);
	ctx.scale(2.043633, 1.000000);
	ctx.rotate(-0.000000);
	ctx.translate(-44.306049, -264.841799);
	ctx.stroke();
	
// #path919-3
	ctx.beginPath();
	ctx.strokeStyle = 'rgb(2, 3, 3)';
	ctx.lineCap = 'round';
	ctx.miterLimit = 4;
	ctx.lineWidth = waveWidth;
	ctx.moveTo(61.986126, 235.994190);
	ctx.translate(54.287015, 264.808231);
	ctx.rotate(0.000000);
	ctx.scale(0.489325, 1.000000);
	ctx.arc(0.000000, 0.000000, 32.830059, -1.070984, 0.01132734, 0);
	ctx.scale(2.043633, 1.000000);
	ctx.rotate(-0.000000);
	ctx.translate(-54.287015, -264.808231);
	ctx.translate(54.287015, 264.808226);
	ctx.rotate(0.000000);
	ctx.scale(0.489325, 1.000000);
	ctx.arc(0.000000, 0.000000, 32.830059, 0.011327, 1.09363903, 0);
	ctx.scale(2.043633, 1.000000);
	ctx.rotate(-0.000000);
	ctx.translate(-54.287015, -264.808226);
	ctx.stroke();
	
// #path919-6
	ctx.beginPath();
	ctx.strokeStyle = 'rgb(2, 3, 3)';
	ctx.lineCap = 'round';
	ctx.miterLimit = 4;
	ctx.lineWidth = waveWidth;
	ctx.moveTo(39.051834, 248.103990);
	ctx.translate(34.568981, 264.881132);
	ctx.rotate(0.000000);
	ctx.scale(0.489325, 1.000000);
	ctx.arc(0.000000, 0.000000, 19.115492, -1.070984, 0.01132758, 0);
	ctx.scale(2.043633, 1.000000);
	ctx.rotate(-0.000000);
	ctx.translate(-34.568981, -264.881132);
	ctx.translate(34.568982, 264.881131);
	ctx.rotate(0.000000);
	ctx.scale(0.489325, 1.000000);
	ctx.arc(0.000000, 0.000000, 19.115492, 0.011328, 1.09363903, 0);
	ctx.scale(2.043633, 1.000000);
	ctx.rotate(-0.000000);
	ctx.translate(-34.568982, -264.881131);
	ctx.stroke();
	ctx.restore();
}

function drawBomb(ctx){
	ctx.save();
	ctx.strokeStyle="rgba(0,0,0,0)";
	ctx.miterLimit=4;
	ctx.font="15px / 21.4286px ''";
	ctx.font="   15px ";

	// these lines are tailored to fit the bomb to a cell and align it accordingly
	//ctx.scale(0.125,0.125);
	var scale =  game.gridScale / 1000;
	ctx.scale(scale, scale); //<-- to fit it in a cell.  890 is the actual vector height of the image.
	ctx.translate(180, -80);

	ctx.save();
	ctx.font="   15px ";
	ctx.save();
	ctx.font="   15px ";
	ctx.save();
	ctx.font="   15px ";
	ctx.save();
	ctx.fillStyle="rgba(0, 0, 0, 1)";
	ctx.font="   15px ";
	ctx.save();
	ctx.font="   15px ";
	ctx.beginPath();
	ctx.moveTo(640.16,566.95);
	ctx.bezierCurveTo(640.16,743.6,496.74,887.03,320.08,887.03);
	ctx.bezierCurveTo(143.42,887.03,0,743.6,0,566.95);
	ctx.bezierCurveTo(0,390.29,143.42,246.87,320.08,246.87);
	ctx.bezierCurveTo(496.74,246.87,640.16,390.29,640.16,566.95);
	ctx.closePath();
	ctx.fill();
	ctx.stroke();
	ctx.restore();
	ctx.restore();
	ctx.restore();
	ctx.save();
	ctx.font="   15px ";
	ctx.save();
	ctx.fillStyle="#46344d";
	ctx.fillStyle="rgba(70, 52, 77, 1)";
	ctx.font="   15px ";
	ctx.save();
	ctx.font="   15px ";
	ctx.beginPath();
	ctx.moveTo(394.48,419.03);
	ctx.bezierCurveTo(394.48,419.03,393.73,419.03,392.82,419.03);
	ctx.bezierCurveTo(391.9,419.03,391.16,419.03,391.16,419.03);
	ctx.bezierCurveTo(391.16,419.03,391.9,419.03,392.82,419.03);
	ctx.bezierCurveTo(393.73,419.03,394.15,419.03,394.48,419.03);
	ctx.fill();
	ctx.stroke();
	ctx.restore();
	ctx.restore();
	ctx.restore();
	ctx.save();
	ctx.font="   15px ";
	ctx.save();
	ctx.font="   15px ";
	ctx.save();
	ctx.fillStyle="rgba(0, 0, 0, 0)";
	ctx.strokeStyle="#66625b";
	ctx.strokeStyle="rgba(160, 150, 140, 1)";
	ctx.lineWidth=25;
	ctx.font="   15px ";
	ctx.save();
	ctx.font="   15px ";
	ctx.beginPath();
	ctx.moveTo(497.44,7.19);
	ctx.bezierCurveTo(372.94,21.52,313.99,94.59,320.58,226.4);
	ctx.fill();
	ctx.stroke();
	ctx.restore();
	ctx.restore();
	ctx.restore();
	ctx.restore();
	ctx.save();
	ctx.font="   15px ";
	ctx.save();
	ctx.fillStyle="rgba(0, 0, 0, 1)";
	ctx.font="   15px ";
	ctx.save();
	ctx.font="   15px ";
	ctx.beginPath();
	ctx.moveTo(267.01,153.99);
	ctx.lineTo(373.15,153.99);
	ctx.lineTo(373.15,316.52);
	ctx.lineTo(267.01,316.52);
	ctx.lineTo(267.01,153.99);
	ctx.closePath();
	ctx.fill();
	ctx.stroke();
	ctx.restore();
	ctx.restore();
	ctx.restore();
	ctx.save();
	ctx.font="   15px ";
	ctx.save();
	ctx.fillStyle="#8d8d8d";
	ctx.fillStyle="rgba(141, 141, 141, 1)";
	ctx.font="   15px ";
	ctx.save();
	ctx.font="   15px ";
	ctx.beginPath();
	ctx.moveTo(481.83,545.24);
	ctx.bezierCurveTo(481.83,675.39,382.86,781.05,260.96,781.05);
	ctx.bezierCurveTo(139.06,781.05,40.1,675.39,40.1,545.24);
	ctx.bezierCurveTo(40.1,415.09,139.06,309.43,260.96,309.43);
	ctx.bezierCurveTo(382.86,309.43,481.83,415.09,481.83,545.24);
	ctx.closePath();
	ctx.fill();
	ctx.stroke();
	ctx.restore();
	ctx.restore();
	ctx.restore();
	ctx.save();
	ctx.font="   15px ";
	ctx.save();
	ctx.fillStyle="rgba(0, 0, 0, 1)";
	ctx.font="   15px ";
	ctx.save();
	ctx.font="   15px ";
	ctx.beginPath();
	ctx.moveTo(582.46,608.68);
	ctx.bezierCurveTo(582.46,749.27,473.67,863.42,339.68,863.42);
	ctx.bezierCurveTo(205.68,863.42,96.89,749.27,96.89,608.68);
	ctx.bezierCurveTo(96.89,468.08,205.68,353.93,339.68,353.93);
	ctx.bezierCurveTo(473.67,353.93,582.46,468.08,582.46,608.68);
	ctx.closePath();
	ctx.fill();
	ctx.stroke();
	ctx.restore();
	ctx.restore();
	ctx.restore();
	ctx.restore();
	ctx.restore();
	ctx.restore();
}

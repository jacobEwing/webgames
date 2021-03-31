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
		case 'title':
			drawTitle(context);
			break;
		case 'hexcell':
			drawHexCell(context);
			break;
		default:
			throw 'svgImages:drawShape(): invalid image name';
	}
}

function drawHexCell(ctx){


    	
// #layer1
	ctx.save();

	/**** custom lines to center and scale the object properly ***/
	var scale = game.gridScale / 120;
	ctx.scale(scale, scale);
	ctx.translate(-60, -50); //<-- translate to center of actual vector image area
	/*************************************************************/


	ctx.transform(1.000000, 0.000000, 0.000000, 1.000000, 0.000000, -197.000000);
	
// #g1486
	ctx.save();
	ctx.transform(1.067931, 0.000000, 0.000000, 1.067931, -48.210050, 114.293640);
	
// #path815
	ctx.save();
	ctx.beginPath();
	ctx.transform(0.500000, -0.866025, 0.866025, 0.500000, -50.671490, 168.403264);
	ctx.globalAlpha = 1.0;
	ctx.lineCap = 'round';
	ctx.miterLimit = 4;
	ctx.lineWidth = 0.070115;
	ctx.fillStyle = 'rgb(136, 8, 94)';
	ctx.moveTo(167.226140, 107.728420);
	ctx.lineTo(140.194890, 154.547900);
	ctx.lineTo(86.132408, 154.547900);
	ctx.lineTo(59.101166, 107.728410);
	ctx.lineTo(86.132408, 60.908931);
	ctx.lineTo(140.194900, 60.908933);
	ctx.fill();
	ctx.restore();
	
// #path815-3
	ctx.save();
	ctx.beginPath();
	ctx.transform(0.500000, -0.866025, 0.866025, 0.500000, -50.671490, 168.403264);
	ctx.globalAlpha = 1.0;
	ctx.lineCap = 'round';
	ctx.miterLimit = 4;
	ctx.lineWidth = 0.056530;
	ctx.fillStyle = 'rgb(242, 20, 116)';
	ctx.moveTo(156.751350, 98.656990);
	ctx.lineTo(134.957500, 136.405050);
	ctx.lineTo(91.369801, 136.405050);
	ctx.lineTo(69.575951, 98.656988);
	ctx.lineTo(91.369801, 60.908935);
	ctx.lineTo(134.957500, 60.908936);
	ctx.fill();
	ctx.restore();
	
// #path857
	ctx.save();
	ctx.beginPath();
	ctx.transform(-0.500000, -0.866025, 0.866025, -0.500000, 62.655829, 276.037199);
	ctx.globalAlpha = 1.0;
	ctx.lineCap = 'round';
	ctx.miterLimit = 4;
	ctx.lineWidth = 0.056530;
	ctx.fillStyle = 'rgba(234, 20, 242, 0.6)';
	ctx.moveTo(156.751360, 98.468002);
	ctx.lineTo(134.957510, 136.216060);
	ctx.lineTo(91.369808, 136.216060);
	ctx.lineTo(69.575958, 98.468000);
	ctx.lineTo(91.369808, 60.719947);
	ctx.lineTo(134.957510, 60.719948);
	ctx.fill();
	ctx.restore();
	
// #path863
	ctx.save();
	ctx.beginPath();
	ctx.transform(-1.000000, 0.000000, 0.000000, -1.000000, 0.000000, 0.000000);
	ctx.globalAlpha = 1.0;
	ctx.lineCap = 'round';
	ctx.miterLimit = 4;
	ctx.lineWidth = 0.056530;
	ctx.fillStyle = 'rgba(44, 140, 243, 0.6)';
	ctx.moveTo(-55.618179, -133.336300);
	ctx.lineTo(-77.412031, -95.588247);
	ctx.lineTo(-120.999730, -95.588248);
	ctx.lineTo(-142.793580, -133.336310);
	ctx.lineTo(-120.999730, -171.084360);
	ctx.lineTo(-77.412027, -171.084360);
	ctx.fill();
	ctx.restore();
	
// #path815-3-7
	ctx.save();
	ctx.beginPath();
	ctx.transform(-0.500000, 0.866025, -0.866025, -0.500000, 248.919590, 80.031988);
	ctx.globalAlpha = 0.4;
	ctx.lineCap = 'round';
	ctx.miterLimit = 4;
	ctx.lineWidth = 0.056530;
	ctx.fillStyle = 'rgb(20, 242, 206)';
	ctx.moveTo(156.751360, 98.467995);
	ctx.lineTo(134.957510, 136.216050);
	ctx.lineTo(91.369808, 136.216050);
	ctx.lineTo(69.575958, 98.467993);
	ctx.lineTo(91.369808, 60.719939);
	ctx.lineTo(134.957510, 60.719940);
	ctx.fill();
	ctx.restore();
	
// #path815-3-7-5
	ctx.save();
	ctx.beginPath();
	ctx.transform(0.500000, 0.866025, -0.866025, 0.500000, 135.755927, -27.507442);
	ctx.globalAlpha = 0.4;
	ctx.lineCap = 'round';
	ctx.miterLimit = 4;
	ctx.lineWidth = 0.056530;
	ctx.fillStyle = 'rgb(65, 100, 255)';
	ctx.moveTo(156.751360, 98.468002);
	ctx.lineTo(134.957510, 136.216060);
	ctx.lineTo(91.369808, 136.216060);
	ctx.lineTo(69.575958, 98.468000);
	ctx.lineTo(91.369808, 60.719947);
	ctx.lineTo(134.957510, 60.719948);
	ctx.fill();
	ctx.restore();
	
// #path942
	ctx.beginPath();
	ctx.globalAlpha = 0.0;
	ctx.lineCap = 'round';
	ctx.miterLimit = 4;
	ctx.lineWidth = 0.070115;
	ctx.fillStyle = 'rgba(21, 0, 246, 0.0)';
	ctx.moveTo(118.264890, 157.276050);
	ctx.lineTo(80.146872, 157.276050);
	ctx.lineTo(61.087864, 124.264880);
	ctx.lineTo(80.146871, 91.253708);
	ctx.lineTo(118.264890, 91.253709);
	ctx.lineTo(137.323890, 124.264880);
	ctx.fill();
	
// #path1415
	ctx.beginPath();
	ctx.globalAlpha = 1.0;
	ctx.lineCap = 'round';
	ctx.miterLimit = 4;
	ctx.lineWidth = 0.087219;
	ctx.moveTo(123.590390, 166.500060);
	ctx.bezierCurveTo(115.565700, 171.133110, 82.846085, 171.133110, 74.821402, 166.500060);
	ctx.bezierCurveTo(66.796717, 161.867000, 50.436909, 133.530980, 50.436909, 124.264870);
	ctx.bezierCurveTo(50.436909, 114.998770, 66.796717, 86.662750, 74.821401, 82.029697);
	ctx.bezierCurveTo(82.846086, 77.396643, 115.565700, 77.396644, 123.590390, 82.029698);
	ctx.bezierCurveTo(131.615070, 86.662751, 147.974880, 114.998770, 147.974880, 124.264880);
	ctx.bezierCurveTo(147.974880, 133.530980, 131.615070, 161.867010, 123.590390, 166.500060);
	ctx.fill();
	ctx.restore();
	ctx.restore();
}

function drawVolume(ctx){
	ctx.save();
	// area is 75x65
	var scale = game.gridScale / 75;
	ctx.scale(scale, scale);
	ctx.translate(-37, -32);
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

    	
// #layer1
	ctx.save();
	/////////// custom /////////////
	var scale = game.gridScale / 86; //<-- scale the area of the image to match the area of a cell
	ctx.scale(scale, scale);
	ctx.translate(-35, -52); //<-- translate to center of circular bomb part
	/////////// custom //////////////

	ctx.transform(1.000000, 0.000000, 0.000000, 1.000000, 0.000000, -210.000000);
	
// #g8531
	ctx.save();
	ctx.transform(1.000000, 0.000000, 0.000000, 1.000000, -77.485115, 120.196430);
	
// #path844
	ctx.beginPath();
	ctx.lineJoin = 'miter';
	ctx.lineCap = 'butt';
	ctx.lineWidth = 0.070004;
	ctx.fillStyle = 'rgb(214, 207, 180)';
	ctx.moveTo(112.520470, 106.704100);
	ctx.bezierCurveTo(112.520470, 106.704100, 110.916850, 100.824170, 112.654100, 96.280585);
	ctx.bezierCurveTo(114.391350, 91.737005, 117.064050, 90.267015, 117.064050, 90.267015);
	ctx.lineTo(117.464950, 91.469735);
	ctx.bezierCurveTo(117.464950, 91.469735, 114.391350, 95.077875, 113.856810, 97.082395);
	ctx.bezierCurveTo(113.322270, 99.086915, 113.055000, 102.427790, 113.322270, 104.298670);
	ctx.bezierCurveTo(113.589540, 106.169560, 112.520470, 106.704100, 112.520470, 106.704100);
	ctx.fill();
	
// #g824
	
// #rect817
	ctx.beginPath();
	ctx.globalAlpha = 1.0;
	ctx.lineCap = 'round';
	ctx.miterLimit = 4;
	ctx.lineWidth = 0.070115;
	ctx.fillStyle = 'rgb(0, 0, 0)';
	ctx.rect(104.964600, 102.342260, 15.344608, 8.315475);
	ctx.fill();
	
// #path815
	ctx.beginPath();
	ctx.globalAlpha = 1.0;
	ctx.lineCap = 'round';
	ctx.miterLimit = 4;
	ctx.lineWidth = 0.070115;
	ctx.fillStyle = 'rgb(0, 0, 0)';
	ctx.arc(112.636900, 141.651780, 35.151787, 0.000000, 6.28318531, 1);
	ctx.fill();
	
// #path826
	ctx.beginPath();
	ctx.globalAlpha = 1.0;
	ctx.lineCap = 'round';
	ctx.miterLimit = 4;
	ctx.lineWidth = 0.070115;
	ctx.fillStyle = 'rgb(101, 101, 101)';
	ctx.moveTo(82.719923, 147.195440);
	ctx.bezierCurveTo(81.555728, 149.734490, 76.209684, 151.152120, 79.245419, 134.901040);
	ctx.bezierCurveTo(81.784477, 121.308810, 92.246505, 110.980410, 102.497870, 109.243160);
	ctx.bezierCurveTo(128.429580, 105.430900, 86.948234, 121.369560, 82.719923, 147.195440);
	ctx.fill();
	ctx.restore();
	ctx.restore();
}

function drawTitle(ctx){

    	
// #layer1
	ctx.save();
	var scale = game.gridScale / 40;
	ctx.translate((game.gridScale * game.gridSize.x) / 2, 0);
	ctx.scale(scale, scale);
	// 69 is half the pixel width of the header banner
	ctx.translate(-69, 5 * scale);

	ctx.transform(1.000000, 0.000000, 0.000000, 1.000000, 0.000000, -204.000000);
	
// #g1049
	ctx.save();
	ctx.transform(1.000000, 0.000000, 0.000000, 1.000000, -31.759768, 158.084350);
	
// #path850
	ctx.beginPath();
	ctx.lineJoin = 'miter';
	ctx.strokeStyle = 'rgb(0, 0, 0)';
	ctx.lineCap = 'butt';
	ctx.lineWidth = 0.070004;
	ctx.fillStyle = 'rgb(0, 0, 0)';
	ctx.moveTo(103.060990, 77.006868);
	ctx.bezierCurveTo(103.060990, 77.006868, 105.832650, 77.007268, 106.776100, 77.006868);
	ctx.bezierCurveTo(108.054760, 75.308014, 110.797740, 64.609781, 112.192470, 64.749302);
	ctx.bezierCurveTo(114.242550, 64.954382, 116.622840, 76.787930, 117.613270, 77.006868);
	ctx.bezierCurveTo(117.982270, 77.173519, 120.746210, 77.112365, 121.237660, 77.006868);
	ctx.bezierCurveTo(122.570110, 76.720841, 129.766640, 47.529732, 129.766640, 47.529732);
	ctx.bezierCurveTo(129.744740, 47.114227, 125.869960, 45.768001, 125.566520, 46.184738);
	ctx.bezierCurveTo(122.721400, 53.770564, 121.586180, 62.473266, 119.297950, 70.236961);
	ctx.bezierCurveTo(117.781840, 65.762456, 115.013390, 60.713825, 114.083040, 59.670246);
	ctx.bezierCurveTo(113.682140, 59.220550, 110.998920, 59.517159, 110.654560, 59.670246);
	ctx.bezierCurveTo(109.966810, 59.975989, 106.888400, 65.279270, 105.140060, 70.236961);
	ctx.bezierCurveTo(103.279310, 65.162319, 101.147550, 48.794433, 100.150590, 46.184738);
	ctx.bezierCurveTo(100.076790, 45.991500, 96.387324, 46.888779, 96.446604, 47.529732);
	ctx.bezierCurveTo(96.536604, 48.552434, 99.323624, 68.088083, 103.060990, 77.006868);
	ctx.fill();
	ctx.stroke();
	
// #path852
	ctx.beginPath();
	ctx.lineJoin = 'miter';
	ctx.strokeStyle = 'rgb(0, 0, 0)';
	ctx.lineCap = 'butt';
	ctx.lineWidth = 0.070004;
	ctx.fillStyle = 'rgb(0, 0, 0)';
	ctx.moveTo(131.683690, 76.965595);
	ctx.bezierCurveTo(130.636890, 75.428795, 130.638880, 47.281257, 131.550060, 46.296417);
	ctx.bezierCurveTo(132.037680, 45.794866, 136.410730, 45.969824, 136.680750, 46.296417);
	ctx.bezierCurveTo(137.173090, 46.510729, 148.836350, 67.359379, 149.173630, 67.171692);
	ctx.bezierCurveTo(149.402770, 67.286283, 148.783530, 47.090939, 149.189830, 46.296417);
	ctx.bezierCurveTo(149.364690, 45.866605, 154.187210, 45.878808, 154.267950, 46.296417);
	ctx.bezierCurveTo(154.503370, 46.684401, 154.674960, 76.853399, 154.134320, 76.965595);
	ctx.bezierCurveTo(153.632050, 77.343571, 149.123340, 77.311618, 149.013120, 76.965595);
	ctx.bezierCurveTo(148.350020, 76.783301, 137.621500, 56.156462, 136.761800, 56.586294);
	ctx.bezierCurveTo(136.290560, 56.736633, 138.002160, 76.762759, 137.230100, 76.965595);
	ctx.bezierCurveTo(136.879800, 77.148716, 131.813360, 77.461327, 131.683690, 76.965595);
	ctx.fill();
	ctx.stroke();
	
// #path854
	ctx.beginPath();
	ctx.lineJoin = 'miter';
	ctx.strokeStyle = 'rgb(0, 0, 0)';
	ctx.lineCap = 'butt';
	ctx.lineWidth = 0.070004;
	ctx.fillStyle = 'rgb(0, 0, 0)';
	ctx.moveTo(84.196708, 76.973365);
	ctx.bezierCurveTo(67.386758, 76.702174, 68.312772, 46.324019, 84.196708, 46.237371);
	ctx.bezierCurveTo(100.842780, 46.879254, 100.397510, 76.333749, 84.196708, 76.973365);
	ctx.lineTo(83.996256, 71.693990);
	ctx.bezierCurveTo(96.198372, 71.042035, 93.110060, 50.651543, 84.129891, 51.238234);
	ctx.bezierCurveTo(73.926630, 50.858932, 72.963290, 72.281553, 83.996256, 71.693990);
	ctx.fill();
	ctx.stroke();
	
// #path854-8
	ctx.beginPath();
	ctx.lineJoin = 'miter';
	ctx.strokeStyle = 'rgb(0, 0, 0)';
	ctx.lineCap = 'butt';
	ctx.lineWidth = 0.070004;
	ctx.fillStyle = 'rgb(0, 0, 0)';
	ctx.moveTo(58.558572, 76.984666);
	ctx.bezierCurveTo(54.842139, 76.899066, 48.757050, 77.179756, 48.248416, 76.369416);
	ctx.bezierCurveTo(47.446872, 75.092436, 47.682330, 46.796080, 48.248416, 46.684654);
	ctx.bezierCurveTo(48.686065, 46.598514, 53.218319, 46.117168, 58.558572, 46.248667);
	ctx.bezierCurveTo(75.204644, 46.890550, 74.759374, 76.345046, 58.558572, 76.984666);
	ctx.lineTo(58.358120, 71.705286);
	ctx.bezierCurveTo(70.560234, 71.053336, 67.471924, 50.662839, 58.491755, 51.249530);
	ctx.bezierCurveTo(56.154903, 51.162660, 52.582922, 51.509786, 51.881663, 52.476000);
	ctx.bezierCurveTo(51.881663, 52.476000, 51.425250, 71.048036, 52.303361, 71.420066);
	ctx.bezierCurveTo(52.303361, 71.420066, 55.918504, 71.835206, 58.358120, 71.705286);
	ctx.fill();
	ctx.stroke();
	ctx.restore();
	
// #g1043
	ctx.save();
	ctx.transform(1.000000, 0.000000, 0.000000, 1.000000, -36.305585, 158.084350);
	
// #path850-6
	ctx.beginPath();
	ctx.lineJoin = 'miter';
	ctx.strokeStyle = 'rgb(0, 0, 0)';
	ctx.lineCap = 'butt';
	ctx.lineWidth = 0.040879;
	ctx.fillStyle = 'rgb(0, 0, 0)';
	ctx.moveTo(62.427127, 101.765290);
	ctx.bezierCurveTo(62.427127, 101.765290, 64.045642, 101.765600, 64.596571, 101.765290);
	ctx.bezierCurveTo(65.343247, 100.773230, 66.945014, 94.525984, 67.759469, 94.607457);
	ctx.bezierCurveTo(68.956617, 94.727214, 70.346589, 101.637440, 70.924953, 101.765290);
	ctx.bezierCurveTo(71.140431, 101.862590, 72.754438, 101.826890, 73.041421, 101.765290);
	ctx.bezierCurveTo(73.819507, 101.598260, 77.801212, 87.862863, 77.801212, 87.862863);
	ctx.bezierCurveTo(77.788422, 87.620228, 75.525740, 86.834098, 75.348546, 87.077452);
	ctx.bezierCurveTo(73.687133, 91.507206, 73.244940, 93.278366, 71.908724, 97.811989);
	ctx.bezierCurveTo(71.023389, 95.199093, 69.406750, 92.250938, 68.863470, 91.641538);
	ctx.bezierCurveTo(68.629364, 91.378935, 67.062494, 91.552138, 66.861404, 91.641538);
	ctx.bezierCurveTo(66.459792, 91.820075, 64.662149, 94.916934, 63.641203, 97.811989);
	ctx.bezierCurveTo(62.554615, 94.848641, 61.089051, 88.601385, 60.506875, 87.077452);
	ctx.bezierCurveTo(60.463775, 86.964610, 58.309308, 87.488578, 58.343924, 87.862863);
	ctx.bezierCurveTo(58.396484, 88.460069, 60.244684, 96.557143, 62.427127, 101.765290);
	ctx.fill();
	ctx.stroke();
	
// #g950
	ctx.save();
	ctx.transform(1.000000, 0.000000, 0.000000, 1.000000, 9.862246, -2.539059);
	
// #path888
	ctx.save();
	ctx.beginPath();
	ctx.transform(1.421715, 0.000000, 0.000000, 1.280897, -64.876112, -34.722285);
	ctx.globalAlpha = 1.0;
	ctx.lineCap = 'round';
	ctx.miterLimit = 4;
	ctx.lineWidth = 0.264583;
	ctx.fillStyle = 'rgb(0, 0, 0)';
	ctx.moveTo(96.424557, 95.984505);
	ctx.translate(95.816124, 97.216026);
	ctx.rotate(0.000000);
	ctx.scale(0.904762, 1.000000);
	ctx.arc(0.000000, 0.000000, 1.403165, -1.070987, 0.49438224, 0);
	ctx.scale(1.105263, 1.000000);
	ctx.rotate(-0.000000);
	ctx.translate(-95.816124, -97.216026);
	ctx.translate(95.816124, 97.216026);
	ctx.rotate(0.000000);
	ctx.scale(0.904762, 1.000000);
	ctx.arc(0.000000, 0.000000, 1.403165, 0.494382, 2.05975027, 0);
	ctx.scale(1.105263, 1.000000);
	ctx.rotate(-0.000000);
	ctx.translate(-95.816124, -97.216026);
	ctx.translate(95.816124, 97.216026);
	ctx.rotate(0.000000);
	ctx.scale(0.904762, 1.000000);
	ctx.arc(0.000000, 0.000000, 1.403165, 2.059750, 3.62511899, 0);
	ctx.scale(1.105263, 1.000000);
	ctx.rotate(-0.000000);
	ctx.translate(-95.816124, -97.216026);
	ctx.translate(95.816124, 97.216026);
	ctx.rotate(0.000000);
	ctx.scale(0.904762, 1.000000);
	ctx.arc(0.000000, 0.000000, 1.403165, -2.658066, -1.09269780, 0);
	ctx.scale(1.105263, 1.000000);
	ctx.rotate(-0.000000);
	ctx.translate(-95.816124, -97.216026);
	ctx.fill();
	ctx.restore();
	
// #rect922
	ctx.beginPath();
	ctx.lineCap = 'round';
	ctx.miterLimit = 4;
	ctx.lineWidth = 0.140506;
	ctx.fillStyle = 'rgb(0, 0, 0)';
	ctx.moveTo(69.749947, 94.007410);
	ctx.lineTo(69.749947, 103.454191);
	ctx.quadraticCurveTo(69.749947, 104.441925, 69.749947, 104.441925);
	ctx.lineTo(72.944369, 104.441925);
	ctx.quadraticCurveTo(72.944369, 104.441925, 72.944369, 103.454191);
	ctx.lineTo(72.944369, 94.007410);
	ctx.quadraticCurveTo(72.944369, 93.019676, 72.944369, 93.019676);
	ctx.lineTo(69.749947, 93.019676);
	ctx.quadraticCurveTo(69.749947, 93.019676, 69.749947, 94.007410);
	ctx.fill();
	ctx.restore();
	
// #path926
	ctx.beginPath();
	ctx.lineJoin = 'miter';
	ctx.strokeStyle = 'rgb(0, 0, 0)';
	ctx.lineCap = 'butt';
	ctx.lineWidth = 0.040879;
	ctx.fillStyle = 'rgb(0, 0, 0)';
	ctx.moveTo(85.337813, 83.675523);
	ctx.bezierCurveTo(88.220799, 83.228455, 88.165539, 84.543678, 88.028976, 88.748922);
	ctx.bezierCurveTo(87.801116, 88.879223, 84.913015, 88.616187, 84.856129, 88.748922);
	ctx.bezierCurveTo(84.613509, 88.886872, 84.562389, 91.327699, 84.856129, 91.446236);
	ctx.bezierCurveTo(86.375583, 91.353846, 87.277184, 91.332563, 88.028976, 91.446236);
	ctx.bezierCurveTo(88.819062, 96.634230, 86.191390, 103.024960, 94.429849, 101.631180);
	ctx.bezierCurveTo(94.547381, 100.823940, 94.987096, 100.274430, 94.429849, 98.927363);
	ctx.bezierCurveTo(89.327572, 100.820430, 91.049473, 95.442041, 90.650021, 91.446236);
	ctx.bezierCurveTo(90.764931, 91.247715, 93.250273, 91.423286, 93.960819, 91.446236);
	ctx.bezierCurveTo(94.133253, 91.415166, 94.222608, 88.868686, 93.960819, 88.748922);
	ctx.bezierCurveTo(93.717107, 88.555793, 91.195326, 88.851486, 90.650021, 88.748922);
	ctx.bezierCurveTo(89.813381, 85.706020, 90.932995, 80.118833, 85.337811, 81.403920);
	ctx.bezierCurveTo(84.727896, 81.544003, 84.843181, 83.900309, 85.337811, 83.675523);
	ctx.fill();
	ctx.stroke();
	
// #path928
	ctx.beginPath();
	ctx.lineJoin = 'miter';
	ctx.strokeStyle = 'rgb(0, 0, 0)';
	ctx.lineCap = 'butt';
	ctx.lineWidth = 0.040879;
	ctx.fillStyle = 'rgb(0, 0, 0)';
	ctx.moveTo(96.772477, 81.777821);
	ctx.bezierCurveTo(96.790867, 88.399415, 96.588247, 100.752870, 96.827657, 101.642600);
	ctx.bezierCurveTo(96.843477, 101.851570, 99.221356, 101.849600, 99.238261, 101.642600);
	ctx.bezierCurveTo(99.479673, 101.084470, 98.542874, 93.341303, 102.718530, 93.252140);
	ctx.bezierCurveTo(105.838870, 93.256240, 105.874430, 98.871264, 105.932350, 101.642600);
	ctx.bezierCurveTo(105.937350, 101.875160, 108.316580, 101.897800, 108.360270, 101.642600);
	ctx.bezierCurveTo(109.232230, 93.617460, 104.191200, 87.234422, 99.810149, 91.992469);
	ctx.bezierCurveTo(99.289118, 92.188624, 99.393639, 85.727266, 99.476298, 81.777821);
	ctx.bezierCurveTo(99.335875, 81.384124, 96.932406, 81.358377, 96.772473, 81.777821);
	ctx.fill();
	ctx.stroke();
	
// #path928-8
	ctx.beginPath();
	ctx.lineJoin = 'miter';
	ctx.strokeStyle = 'rgb(0, 0, 0)';
	ctx.lineCap = 'butt';
	ctx.lineWidth = 0.040879;
	ctx.fillStyle = 'rgb(0, 0, 0)';
	ctx.moveTo(129.334880, 81.777823);
	ctx.bezierCurveTo(129.353280, 88.399417, 129.150650, 100.752870, 129.390080, 101.642600);
	ctx.bezierCurveTo(129.405880, 101.851570, 131.783780, 101.849600, 131.800680, 101.642600);
	ctx.bezierCurveTo(132.042090, 101.084470, 131.105290, 93.341305, 135.280940, 93.252142);
	ctx.bezierCurveTo(138.401290, 93.256242, 138.436850, 98.871264, 138.494770, 101.642600);
	ctx.bezierCurveTo(138.499770, 101.875160, 140.879000, 101.897800, 140.922690, 101.642600);
	ctx.bezierCurveTo(141.794650, 93.617462, 136.753620, 87.234424, 132.372570, 91.992471);
	ctx.bezierCurveTo(131.851540, 92.188626, 131.956060, 85.727268, 132.038720, 81.777823);
	ctx.bezierCurveTo(131.898290, 81.384126, 129.494830, 81.358379, 129.334890, 81.777823);
	ctx.fill();
	ctx.stroke();
	
// #path952
	ctx.beginPath();
	ctx.lineJoin = 'miter';
	ctx.strokeStyle = 'rgb(0, 0, 0)';
	ctx.lineCap = 'butt';
	ctx.lineWidth = 0.040879;
	ctx.fillStyle = 'rgb(0, 0, 0)';
	ctx.moveTo(118.977700, 83.675523);
	ctx.bezierCurveTo(121.860680, 83.228455, 121.805420, 84.543678, 121.668860, 88.748922);
	ctx.bezierCurveTo(121.441000, 88.879223, 118.552900, 88.616187, 118.496010, 88.748922);
	ctx.bezierCurveTo(118.253390, 88.886872, 118.202270, 91.327699, 118.496010, 91.446236);
	ctx.bezierCurveTo(120.015470, 91.353846, 120.917070, 91.332563, 121.668860, 91.446236);
	ctx.bezierCurveTo(122.458950, 96.634230, 119.831270, 103.024960, 128.069730, 101.631180);
	ctx.bezierCurveTo(128.187260, 100.823940, 128.626980, 100.274430, 128.069730, 98.927363);
	ctx.bezierCurveTo(122.967460, 100.820430, 124.689360, 95.442041, 124.289900, 91.446236);
	ctx.bezierCurveTo(124.404810, 91.247715, 126.890160, 91.423286, 127.600700, 91.446236);
	ctx.bezierCurveTo(127.773140, 91.415166, 127.862490, 88.868686, 127.600700, 88.748922);
	ctx.bezierCurveTo(127.356990, 88.555793, 124.835210, 88.851486, 124.289900, 88.748922);
	ctx.bezierCurveTo(123.453260, 85.706020, 124.572880, 80.118833, 118.977690, 81.403920);
	ctx.bezierCurveTo(118.367780, 81.544003, 118.483060, 83.900309, 118.977690, 83.675523);
	ctx.fill();
	ctx.stroke();
	
// #path954
	ctx.beginPath();
	ctx.lineJoin = 'miter';
	ctx.strokeStyle = 'rgb(0, 0, 0)';
	ctx.lineCap = 'butt';
	ctx.lineWidth = 0.062975;
	ctx.fillStyle = 'rgb(0, 0, 0)';
	ctx.moveTo(152.819600, 99.446098);
	ctx.bezierCurveTo(151.753060, 100.953680, 149.924270, 101.726240, 147.825550, 101.783750);
	ctx.bezierCurveTo(139.438070, 101.214330, 141.453100, 88.626921, 147.825550, 88.905464);
	ctx.bezierCurveTo(153.362670, 89.347216, 151.934290, 94.810746, 151.757040, 95.025836);
	ctx.bezierCurveTo(151.342060, 95.175812, 146.097110, 96.513426, 143.277780, 95.727128);
	ctx.lineTo(143.298980, 93.835763);
	ctx.bezierCurveTo(144.588220, 94.402464, 150.308150, 94.120347, 150.226890, 93.623250);
	ctx.bezierCurveTo(150.837630, 91.694942, 149.516610, 90.784570, 147.825510, 90.860583);
	ctx.bezierCurveTo(143.261060, 91.863068, 142.698950, 100.177570, 147.825510, 99.531108);
	ctx.bezierCurveTo(149.663880, 99.459308, 150.668210, 98.571258, 152.245770, 97.660988);
	ctx.bezierCurveTo(152.552750, 97.503308, 152.987550, 99.359628, 152.819550, 99.446098);
	ctx.fill();
	ctx.stroke();
	ctx.restore();
	
// #g1032
	ctx.save();
	ctx.transform(1.000000, 0.000000, 0.000000, 1.000000, -39.736309, 158.084350);
	
// #path854-8-8
	ctx.beginPath();
	ctx.lineJoin = 'miter';
	ctx.strokeStyle = 'rgb(0, 0, 0)';
	ctx.lineCap = 'butt';
	ctx.lineWidth = 0.070929;
	ctx.fillStyle = 'rgb(0, 0, 0)';
	ctx.moveTo(40.398485, 138.623380);
	ctx.bezierCurveTo(40.032028, 138.529980, 39.888254, 132.569970, 39.916621, 129.496020);
	ctx.lineTo(44.139223, 129.523520);
	ctx.bezierCurveTo(44.398969, 131.729230, 45.107449, 134.628740, 45.107449, 134.628740);
	ctx.bezierCurveTo(58.300560, 136.286270, 56.511950, 130.416290, 54.776452, 127.278480);
	ctx.bezierCurveTo(53.123798, 124.290450, 44.276298, 125.123210, 43.904586, 126.393780);
	ctx.bezierCurveTo(43.804410, 126.736200, 43.554149, 125.115630, 43.430240, 123.878260);
	ctx.bezierCurveTo(43.261864, 122.196840, 43.609242, 119.309730, 43.712490, 119.894810);
	ctx.bezierCurveTo(43.972853, 121.370210, 55.077026, 122.598270, 56.034014, 116.916630);
	ctx.bezierCurveTo(55.952034, 110.476430, 48.057447, 110.748240, 45.094865, 111.650540);
	ctx.bezierCurveTo(42.825102, 112.341830, 44.118659, 127.894260, 44.139223, 129.523520);
	ctx.lineTo(39.916621, 129.496020);
	ctx.bezierCurveTo(39.740894, 123.820790, 40.083948, 109.795320, 40.642887, 108.123460);
	ctx.bezierCurveTo(41.086319, 108.036260, 48.217518, 106.445990, 54.029235, 107.681720);
	ctx.bezierCurveTo(60.824818, 110.225930, 62.494291, 120.703680, 55.216074, 123.332780);
	ctx.bezierCurveTo(60.719331, 123.118490, 62.379431, 137.110820, 57.084369, 137.941850);
	ctx.bezierCurveTo(50.576927, 138.963160, 41.766997, 138.861320, 40.398489, 138.623380);
	ctx.fill();
	ctx.stroke();
	
// #path990
	ctx.beginPath();
	ctx.lineJoin = 'miter';
	ctx.strokeStyle = 'rgb(0, 0, 0)';
	ctx.lineCap = 'butt';
	ctx.lineWidth = 0.070004;
	ctx.fillStyle = 'rgb(0, 0, 0)';
	ctx.moveTo(63.200533, 108.459980);
	ctx.bezierCurveTo(63.256893, 118.352890, 62.637472, 137.829360, 63.369604, 138.138710);
	ctx.bezierCurveTo(64.104750, 138.441840, 81.543933, 138.506210, 81.811203, 138.138710);
	ctx.bezierCurveTo(82.072827, 137.799050, 81.857913, 132.534760, 81.677567, 132.258780);
	ctx.bezierCurveTo(81.371607, 131.928840, 68.708034, 132.752700, 68.581359, 132.258780);
	ctx.bezierCurveTo(68.238534, 131.939250, 68.403180, 116.392920, 68.314090, 108.459980);
	ctx.bezierCurveTo(68.260780, 107.316470, 63.118548, 107.320520, 63.200533, 108.459980);
	ctx.fill();
	ctx.stroke();
	
// #path854-89
	ctx.beginPath();
	ctx.lineJoin = 'miter';
	ctx.strokeStyle = 'rgb(0, 0, 0)';
	ctx.lineCap = 'butt';
	ctx.lineWidth = 0.070004;
	ctx.fillStyle = 'rgb(0, 0, 0)';
	ctx.moveTo(93.850439, 138.362770);
	ctx.bezierCurveTo(77.040489, 138.091580, 77.966502, 107.713420, 93.850439, 107.626770);
	ctx.bezierCurveTo(110.496510, 108.268650, 110.051240, 137.723150, 93.850439, 138.362770);
	ctx.lineTo(93.649987, 133.083390);
	ctx.bezierCurveTo(105.852100, 132.431440, 102.763790, 112.040940, 93.783622, 112.627630);
	ctx.bezierCurveTo(83.580361, 112.248330, 82.617021, 133.670950, 93.649987, 133.083390);
	ctx.fill();
	ctx.stroke();
	
// #path854-89-7
	ctx.beginPath();
	ctx.lineJoin = 'miter';
	ctx.strokeStyle = 'rgb(0, 0, 0)';
	ctx.lineCap = 'butt';
	ctx.lineWidth = 0.070004;
	ctx.fillStyle = 'rgb(0, 0, 0)';
	ctx.moveTo(131.179530, 129.182290);
	ctx.bezierCurveTo(130.465500, 141.587410, 108.585470, 142.393880, 108.664510, 121.859000);
	ctx.bezierCurveTo(108.725510, 106.005920, 127.059120, 104.004890, 131.230320, 114.561700);
	ctx.bezierCurveTo(131.345710, 114.838850, 127.143560, 115.961360, 126.704450, 115.444870);
	ctx.bezierCurveTo(122.280050, 109.351590, 112.545260, 113.898220, 112.624840, 122.067560);
	ctx.bezierCurveTo(112.724140, 132.259040, 122.312730, 137.943080, 126.798940, 129.099260);
	ctx.bezierCurveTo(126.915540, 128.869400, 131.063940, 128.924810, 131.179530, 129.182260);
	ctx.fill();
	ctx.stroke();
	
// #path1022
	ctx.beginPath();
	ctx.lineJoin = 'miter';
	ctx.strokeStyle = 'rgb(0, 0, 0)';
	ctx.lineCap = 'butt';
	ctx.lineWidth = 0.070004;
	ctx.fillStyle = 'rgb(0, 0, 0)';
	ctx.moveTo(135.078020, 108.108970);
	ctx.bezierCurveTo(134.863050, 108.251620, 134.781480, 137.195840, 135.078020, 137.856070);
	ctx.bezierCurveTo(135.268690, 138.059970, 139.898930, 138.054510, 140.176180, 137.856070);
	ctx.bezierCurveTo(140.355100, 137.468250, 139.928130, 126.212200, 140.176180, 126.256570);
	ctx.bezierCurveTo(140.381280, 125.955880, 150.619430, 137.984930, 150.887000, 137.856070);
	ctx.bezierCurveTo(151.168350, 137.973410, 154.298310, 134.115890, 154.161050, 133.833660);
	ctx.bezierCurveTo(154.336450, 133.549130, 142.690310, 123.179330, 142.655110, 122.701890);
	ctx.bezierCurveTo(142.620910, 122.302860, 154.270930, 110.900150, 154.161050, 110.541120);
	ctx.bezierCurveTo(154.195850, 110.208990, 151.325950, 108.059340, 150.887000, 108.108970);
	ctx.bezierCurveTo(150.491730, 108.116970, 140.496920, 119.370160, 140.176180, 119.147200);
	ctx.bezierCurveTo(139.944670, 119.072700, 140.365120, 108.153380, 140.176180, 108.108970);
	ctx.bezierCurveTo(139.965070, 107.976680, 135.487560, 107.920320, 135.078020, 108.108970);
	ctx.fill();
	ctx.stroke();
	
// #path1024
	ctx.beginPath();
	ctx.lineJoin = 'miter';
	ctx.strokeStyle = 'rgb(0, 0, 0)';
	ctx.lineCap = 'butt';
	ctx.lineWidth = 0.070004;
	ctx.fillStyle = 'rgb(0, 0, 0)';
	ctx.moveTo(156.866200, 134.545970);
	ctx.bezierCurveTo(156.315780, 134.230740, 157.869570, 130.646750, 158.650870, 131.011580);
	ctx.bezierCurveTo(164.972530, 137.478780, 174.042950, 133.798690, 174.120000, 130.463530);
	ctx.bezierCurveTo(174.278950, 123.583350, 157.184250, 125.215380, 157.139490, 116.013500);
	ctx.bezierCurveTo(156.802880, 107.666230, 172.177300, 104.329700, 178.264100, 112.636450);
	ctx.bezierCurveTo(178.669730, 113.046780, 176.222610, 115.415740, 175.812000, 114.950870);
	ctx.bezierCurveTo(171.376930, 109.044780, 161.295700, 110.688040, 161.214120, 115.732870);
	ctx.bezierCurveTo(161.097480, 122.945730, 177.799870, 119.452660, 178.105950, 130.510300);
	ctx.bezierCurveTo(178.321750, 138.306350, 162.973670, 140.995190, 156.866200, 134.545970);
	ctx.fill();
	ctx.stroke();
	ctx.restore();
	ctx.restore();


}

'use strict';

function qs(selector, root) {
	return (root || document).querySelector(selector);
}

function qsa(selector, root) {
	return Array.prototype.slice.call((root || document).querySelectorAll(selector));
}

function css(el, props) {
	if (!el) return;
	for (var k in props) {
		if (!props.hasOwnProperty(k)) continue;
		var v = props[k];
		if (typeof v === 'number' && k !== 'opacity' && k !== 'zIndex') {
			el.style[k] = v + 'px';
		} else {
			el.style[k] = v;
		}
	}
}

function empty(el) {
	if (!el) return;
	while (el.firstChild) el.removeChild(el.firstChild);
}

function animate(el, props, duration, easing, callback) {
	if (!el) return;

	if (typeof duration === 'string') {
		duration = { slow: 600, medium: 400, fast: 200 }[duration] || 400;
	}

	if (typeof easing === 'function') {
		callback = easing;
		easing = 'swing';
	}

	var start = {};
	var end = {};

	for (var k in props) {
		if (!props.hasOwnProperty(k)) continue;

		var computed = window.getComputedStyle(el)[k];
		var startVal = parseFloat(computed);
		if (isNaN(startVal)) startVal = 0;

		var propVal = props[k];
		var endVal;

		if (typeof propVal === 'string' && propVal.indexOf('+=') === 0) {
			endVal = startVal + parseFloat(propVal.slice(2));
		} else if (typeof propVal === 'string' && propVal.indexOf('-=') === 0) {
			endVal = startVal - parseFloat(propVal.slice(2));
		} else {
			endVal = parseFloat(propVal);
			if (isNaN(endVal)) endVal = startVal;
		}

		start[k] = startVal;
		end[k] = endVal;
	}

	var startTime = performance.now();

	var ease = easing === 'swing'
		? function(t) { return 0.5 - Math.cos(t * Math.PI) / 2; }
		: function(t) { return t; };

	function frame(now) {
		var t = Math.min(1, (now - startTime) / duration);
		var eased = ease(t);

		for (var k in end) {
			if (!end.hasOwnProperty(k)) continue;
			var val = start[k] + (end[k] - start[k]) * eased;

			if (k === 'opacity') {
				el.style[k] = val;
			} else {
				el.style[k] = val + 'px';
			}
		}

		if (t < 1) {
			requestAnimationFrame(frame);
		} else if (callback) {
			callback.call(el);
		}
	}

	requestAnimationFrame(frame);
}

function fadeTo(el, duration, opacity, callback) {
	animate(el, { opacity: opacity }, duration, 'swing', callback);
}

function fadeIn(el, duration, callback) {
	if (!el) return;

	if (window.getComputedStyle(el).display === 'none') {
		el.style.display = 'block';
	}

	el.style.opacity = 0;
	fadeTo(el, duration, 1, callback);
}

function fadeOut(el, duration, callback) {
	fadeTo(el, duration, 0, callback);
}

function loadImage(src, callback) {
	var img = new Image();
	img.onload = callback;
	img.src = src;
	return img;
}
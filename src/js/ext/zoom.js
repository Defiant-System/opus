
/* Rewrite of "zoom.js" by Hakim El Hattab
 * http://lab.hakim.se/zoom-js
 */

let Zoom = () => {

	// The current zoom level (scale)
	let level = 1;
	// The current mouse position, used for panning
	let mouseX = 0,
		mouseY = 0;
	// Timeout before pan is activated
	let panEngageTimeout = -1,
		panUpdateInterval = -1;
	
}();

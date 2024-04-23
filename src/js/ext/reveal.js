
/* Heavy rewrite of "reveal.js" by Hakim El Hattab
 * https://github.com/hakimel/reveal.js
 */

let Reveal = (() => {

	// Rewrite from reveal.js version
	let VERSION = "3.3.0",
		SLIDES_SELECTOR = ".slides section",
		HORIZONTAL_SLIDES_SELECTOR = ".slides > section",
		VERTICAL_SLIDES_SELECTOR = ".slides > section.present > section",
		HOME_SLIDE_SELECTOR = ".slides > section:first-of-type";

	// Configuration defaults, can be overridden at initialization time
	let config = {
			// The "normal" size of the presentation, aspect ratio will be preserved
			// when the presentation is scaled to fit different resolutions
			width: 960,
			height: 700,

			// Factor of the display size that should remain empty around the content
			margin: 0.1,

			// Bounds for smallest/largest possible scale to apply to content
			minScale: 0.2,
			maxScale: 1.5,

			// Display controls in the bottom right corner
			controls: true,

			// Display a presentation progress bar
			progress: true,

			// Display the page number of the current slide
			slideNumber: false,

			// Push each slide change to the browser history
			history: false,

			// Enable the slide overview mode
			overview: true,

			// Vertical centering of slides
			center: true,

			// Loop the presentation
			loop: false,

			// Transition style
			transition: "slide", // none/fade/slide/convex/concave/zoom

			// Transition speed
			transitionSpeed: "default", // default/fast/slow

			// Transition style for full page slide backgrounds
			backgroundTransition: "fade", // none/fade/slide/convex/concave/zoom

			// Number of slides away from the current that are visible
			viewDistance: 3,
		},
	
		// Flags if the overview mode is currently active
		overview = false,

		// Holds the dimensions of our overview slides, including margins
		overviewSlideWidth = null,
		overviewSlideHeight = null,

		// The horizontal and vertical index of the currently active slide
		indexh,
		indexv,

		// The previous and current slide HTML elements
		previousSlide,
		currentSlide,

		previousBackground,

		// The current scale of the presentation (see width/height config)
		scale = 1,

		// CSS transform that is currently applied to the slides container,
		// split into two groups
		slidesTransform = { layout: "", overview: "" },

		// Cached references to DOM elements
		dom = {},

		// Features supported by the browser, see #checkCapabilities()
		features = {},

		// Holds information about the keyboard shortcuts
		keyboardShortcuts = {
			"N  ,  SPACE":			"Next slide",
			"P":					"Previous slide",
			"&#8592;  ,  H":		"Navigate left",
			"&#8594;  ,  L":		"Navigate right",
			"&#8593;  ,  K":		"Navigate up",
			"&#8595;  ,  J":		"Navigate down",
			"Home":					"First slide",
			"End":					"Last slide",
			"B  ,  .":				"Pause",
			"F":					"Fullscreen",
			"ESC, O":				"Slide overview"
		};

	/**
	 * Starts up the presentation if the client is capable.
	 */
	function initialize(options) {
		dom.wrapper = options.spawn.find(`.file-slides .slides`);
		console.log( dom.wrapper ); // .find(HOME_SLIDE_SELECTOR)
	}

	/**
	 * Applies the configuration settings from the config
	 * object. May be called multiple times.
	 */
	function configure( options ) {
		var numberOfSlides = dom.wrapper.find(SLIDES_SELECTOR).length;
	}


	/*
	 * API
	 */

	let Reveal = {
		VERSION,
		initialize,
	};

	return Reveal;

})();

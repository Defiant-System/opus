
/* Heavy rewrite of "reveal.js" by Hakim El Hattab
 * https://github.com/hakimel/reveal.js
 */

let Reveal = (() => {

	// Rewrite from reveal.js version
	let VERSION = "3.3.0",
		SLIDES_SELECTOR = "section",
		HORIZONTAL_SLIDES_SELECTOR = "> section",
		VERTICAL_SLIDES_SELECTOR = "> section.present > section",
		HOME_SLIDE_SELECTOR = "> section:first-of-type";

	// Configuration defaults, can be overridden at initialization time
	let config = {
			// The "normal" size of the presentation, aspect ratio will be preserved
			// when the presentation is scaled to fit different resolutions
			width: 960,
			height: 700,

			// Margin pixels that should remain empty around the content
			margin: 29,

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

		options = {},
	
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

		// Slides may hold a data-state attribute which we pick up and apply
		// as a class to the body. This list contains the combined state of
		// all current slides.
		state = [],

		// The current scale of the presentation (see width/height config)
		scale = 1,

		// CSS transform that is currently applied to the slides container,
		// split into two groups
		slidesTransform = { layout: "", overview: "" },

		// Cached references to DOM elements
		Dom = {},

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
	function initialize(opt) {
		// Copy options over to our config object
		options = { ...config, ...opt };

		Dom.file = options.spawn.find(".file-slides");
		Dom.wrapper = Dom.file.find(".slides");
		// prepend player helpers (controls + progress + slide number)
		Dom.wrapper.prepend(options.spawn.find(".player-helpers").clone(true));
		// reference to elements
		Dom.controls = {
			all: Dom.wrapper.find(".controls span"),
			left: Dom.wrapper.find(".controls .nav-left"),
			right: Dom.wrapper.find(".controls .nav-right"),
			up: Dom.wrapper.find(".controls .nav-up"),
			down: Dom.wrapper.find(".controls .nav-down"),
		};
		Dom.progressbar = Dom.wrapper.find(".progress span");
		Dom.slideNumber = Dom.wrapper.find(".slide-number");

		// Updates the presentation to match the current configuration values
		configure(options);
	}

	/**
	 * Applies the configuration settings from the config
	 * object. May be called multiple times.
	 */
	function configure(opt) {
		let numberOfSlides = Dom.file.find(SLIDES_SELECTOR).length;

		// New config options may be passed when this method
		// is invoked through the API after initialization
		options = { ...config, ...opt };

		Dom.file.data({ "background-transition": options.transition });
		Dom.file[ options.controls ? "addClass" : "removeClass" ]("show-controls");
		Dom.file[ options.progress ? "addClass" : "removeClass" ]("show-progress");
		Dom.file[ options.progress ? "addClass" : "removeClass" ]("vertical-center");

		// setTimeout(() => slide(0, 0), 500);
		slide(0, 0);
	}

	/**
	 * Steps from the current point in the presentation to the
	 * slide which matches the specified horizontal and vertical
	 * indices.
	 *
	 * @param {int} h Horizontal index of the target slide
	 * @param {int} v Vertical index of the target slide
	 * @param {int} f Optional index of a fragment within the
	 * target slide to activate
	 * @param {int} o Optional origin for use in multimaster environments
	 */
	function slide(h, v, f, o) {
		// Remember where we were at before
		previousSlide = currentSlide;

		// Query all horizontal slides in the deck
		let horizontalSlides = Dom.wrapper.find(HORIZONTAL_SLIDES_SELECTOR);

		// Activate and transition to the new slide
		indexh = updateSlides(HORIZONTAL_SLIDES_SELECTOR, h === undefined ? indexh : h);
		indexv = updateSlides(VERTICAL_SLIDES_SELECTOR, v === undefined ? indexv : v);

		// make first slide active
		horizontalSlides.get(h).addClass("present");

		layout();

		updateControls();
		updateProgress();
		updateSlideNumber();
	}

	/**
	 * Applies JavaScript-controlled layout rules to the
	 * presentation.
	 */
	function layout() {
		let size = getComputedSlideSize(),
			slidePadding = 20, // TODO Dig this out of DOM
			zoom = "",
			left = "",
			top = "",
			bottom = "",
			right = "",
			transform = "";
		// Layout the contents of the slides
		layoutSlideContents(options.width, options.height, slidePadding);

		Dom.wrapper.css({ width: size.width, height: size.height });

		// Determine scale of content to fit within available space
		scale = Math.min( size.presentationWidth / size.width, size.presentationHeight / size.height );

		// Respect max/min scale settings
		scale = Math.max( scale, options.minScale );
		scale = Math.min( scale, options.maxScale );

		// Prefer zoom for scaling up so that content remains crisp.
		// Don't use zoom to scale down since that can lead to shifts
		// in text layout/line breaks.
		if (scale < 1) {
			left = "50%";
			top = "50%";
			bottom = "auto";
			right = "auto";
			transform = `translate(-50%, -50%) scale(${scale})`;
		}
		// Don't apply any scaling styles if scale is >= 1
		Dom.wrapper.css({ top, left, bottom, right, zoom, transform });

		// Select all slides, vertical and horizontal
		Dom.wrapper.find(SLIDES_SELECTOR).map(el => {
			let slide = $(el),
				top = "";
			if (!slide.is(":visible")) return;
			
			if (options.center || slide.hasClass("center")) {
				// Vertical stacks are not centred since their section
				// children will be
				top = slide.hasClass("stack") ? 0 : Math.max(((size.height - getAbsoluteHeight(slide)) / 2) - slidePadding, 0);
			}
			slide.css({ top });
		});

		updateProgress();
	}

	/**
	 * Applies layout logic to the contents of all slides in
	 * the presentation.
	 */
	function layoutSlideContents(width, height, padding) {
		// Handle sizing of elements with the 'stretch' class
		Dom.wrapper.find("section > .stretch").map(element => {
			// Determine how much vertical space we can use
			let remainingHeight = getRemainingHeight(element, height);
			// Consider the aspect ratio of media elements
			if (/(img|video)/gi.test(element.nodeName)) {
				let nw = element.naturalWidth || element.videoWidth,
					nh = element.naturalHeight || element.videoHeight,
					es = Math.min( width / nw, remainingHeight / nh );
				element.style.width = `${nw * es}px`;
				element.style.height = `${nh * es}px`;
			} else {
				element.style.width = `${width}px`;
				element.style.height = `${remainingHeight}px`;
			}
		});
	}

	/**
	 * Calculates the computed pixel size of our slides. These
	 * values are based on the width and height configuration
	 * options.
	 */
	function getComputedSlideSize() {
		let offset = Dom.wrapper.parents(".files-wrapper").offset(),
			size = {
				// Slide size
				width: options.width,
				height: options.height,
				// Presentation size - Reduce available space by margin
				presentationWidth: offset.width - (options.margin * 2),
				presentationHeight: offset.height - (options.margin * 2),
			};
		return size;
	}

	/**
	 * Retrieves the height of the given element by looking
	 * at the position and height of its immediate children.
	 */
	function getAbsoluteHeight(el) {
		let height = 0;
		if (el.length) {
			let absoluteChildren = 0;
			el.find("> *").map(child => {
				let cEl = $(child),
					offset = cEl.offset();
				if (typeof offset.top === "number") {
					// Count # of abs children
					if (cEl.cssProp("position") === "absolute") {
						absoluteChildren += 1;
					}
					height = Math.max(height, offset.top + offset.height);
				}
			});
			// If there are no absolute children, use offsetHeight
			if (absoluteChildren === 0) {
				height = el.offset().height;
			}
		}
		return height;
	}

	/**
	 * Returns the remaining height within the parent of the
	 * target element.
	 *
	 * remaining height = [ configured parent height ] - [ current parent height ]
	 */
	function getRemainingHeight(element, height) {
		height = height || 0;
		if (element) {
			let newHeight,
				oldHeight = element.style.height;
			// Change the .stretch element height to 0 in order find the height of all
			// the other elements
			element.style.height = "0px";
			newHeight = height - element.parentNode.offsetHeight;
			// Restore the old height, just in case
			element.style.height = `${oldHeight}px`;
			return newHeight;
		}
		return height;
	}

	/**
	 * Retrieves the total number of slides in this presentation.
	 */
	function getTotalSlides() {
		return Dom.wrapper.find(`${SLIDES_SELECTOR}:not(.stack)`).length;
	}

	/**
	 * Returns the number of past slides. This can be used as a global
	 * flattened index for slides.
	 */
	function getSlidePastCount() {
		let horizontalSlides = Dom.wrapper.find(HORIZONTAL_SLIDES_SELECTOR);
		// The number of past slides
		let pastCount = 0;
		// Step through all slides and count the past ones
		mainLoop: for(let i=0; i<horizontalSlides.length; i++) {
			let horizontalSlide = horizontalSlides.get(i);
			let verticalSlides = horizontalSlide.find("section");
			for(let j=0; j<verticalSlides.length; j++) {
				// Stop as soon as we arrive at the present
				if (verticalSlides.get(j).hasClass("present")) {
					break mainLoop;
				}
				pastCount++;
			}
			// Stop as soon as we arrive at the present
			if (horizontalSlide.hasClass("present")) {
				break;
			}
			// Don't count the wrapping section for vertical slides
			if (!horizontalSlide.hasClass("stack")) {
				pastCount++;
			}
		}
		return pastCount;
	}

	/**
	 * Updates one dimension of slides by showing the slide
	 * with the specified index.
	 *
	 * @param {String} selector A CSS selector that will fetch
	 * the group of slides we are working with
	 * @param {Number} index The index of the slide that should be
	 * shown
	 *
	 * @return {Number} The index of the slide that is now shown,
	 * might differ from the passed in index if it was out of
	 * bounds.
	 */
	function updateSlides(selector, index) {
		// Select all slides and convert the NodeList result to
		// an array
		let slides = Dom.wrapper.find(selector),
			slidesLength = slides.length;

		if (slidesLength) {
			// Enforce max and minimum index bounds
			index = Math.max(Math.min(index, slidesLength - 1), 0);

			for (let i=0; i<slidesLength; i++) {
				let element = slides.get(i);
				let reverse = !isVerticalSlide( element);

				element.removeClass("past present future");
				// http://www.w3.org/html/wg/drafts/html/master/editing.html#the-hidden-attribute
				element.attr({ "aria-hidden": "true" });

				// If this element contains vertical slides
				if (element.find("section").length) {
					element.addClass("stack");
				}

				if (i < index) {
					// Any element previous to index is given the "past" class
					element.addClass(reverse ? "future" : "past");
				} else if (i > index) {
					// Any element subsequent to index is given the "future" class
					element.addClass(reverse ? "past" : "future");
				}
			}

			// Mark the current slide as present
			slides.get(index)
				.addClass("preset")
				.removeAttr("aria-hidden");

			// If this slide has a state associated with it, add it
			// onto the current state of the deck
			let slideState = slides.get(index).data("state");
			if (slideState) {
				state = state.concat(slideState.split(" "));
			}
		} else {
			// Since there are no slides we can't be anywhere beyond the
			// zeroth index
			index = 0;
		}
		return index;
	}

	/**
	 * Returns a value ranging from 0-1 that represents
	 * how far into the presentation we have navigated.
	 */
	function getProgress() {
		// The number of past and total slides
		let totalCount = getTotalSlides();
		let pastCount = getSlidePastCount();
		if (currentSlide) {
			let allFragments = currentSlide.querySelectorAll(".fragment");
			// If there are fragments in the current slide those should be
			// accounted for in the progress.
			if (allFragments.length > 0) {
				let visibleFragments = currentSlide.querySelectorAll(".fragment.visible");
				// This value represents how big a portion of the slide progress
				// that is made up by its fragments (0-1)
				let fragmentWeight = 0.9;
				// Add fragment progress to the past slide count
				pastCount += (visibleFragments.length / allFragments.length) * fragmentWeight;
			}
		}
		return pastCount / (totalCount - 1);
	}

	/**
	 * Updates the progress bar to reflect the current slide.
	 */
	function updateProgress() {
		// Update progress if enabled
		if (options.progress && Dom.progressbar) {
			let width = getProgress() * +Dom.progressbar.parent().prop("offsetWidth");
			Dom.progressbar.css({ width });
		}
	}

	/**
	 * Updates the state of all control/navigation arrows.
	 */
	function updateControls() {
		let routes = availableRoutes();
		// Remove the 'enabled' class from all directions
		Dom.controls.all.addClass("disabled_");
		// Add the 'enabled' class to the available routes
		if (routes.left) Dom.controls.left.removeClass("disabled_");
		if (routes.right) Dom.controls.right.removeClass("disabled_");
		if (routes.up) Dom.controls.up.removeClass("disabled_");
		if (routes.down) Dom.controls.down.removeClass("disabled_");
	}

	/**
	 * Updates the slide number div to reflect the current slide.
	 *
	 * The following slide number formats are available:
	 *  "count":       flattened slide number (default)
	 *  "count-total": flattened slide number / total slides
	 *  "h-dot-v": 	   horizontal . vertical slide number
	 *  "h-slash-v":   horizontal / vertical slide number
	 */
	function updateSlideNumber() {
		// Update slide number if enabled
		if (options.slideNumber && Dom.slideNumber.length) {
			let value = [];
			let format = "count";
			// Check if a custom number format is available
			if (typeof options.slideNumber === "string") {
				format = options.slideNumber;
			}
			switch (format) {
				case "h-slash-v":
					value.push(indexh + 1);
					if (isVerticalSlide()) value.push("/", indexv + 1);
					break;
				case "h-dot-v":
					value.push(indexh + 1);
					if (isVerticalSlide()) value.push(".", indexv + 1);
				case "count-total":
					value.push(getSlidePastCount() + 1, "/", getTotalSlides());
					break;
				default:
					value.push(getSlidePastCount() + 1);
					break;
			}
			Dom.slideNumber.data({ format }).html(value.join(" "));
		}
	}

	/**
	 * Determine what available routes there are for navigation.
	 *
	 * @return {Object} containing four booleans: left/right/up/down
	 */
	function availableRoutes() {
		let horizontalSlides = Dom.wrapper.find(HORIZONTAL_SLIDES_SELECTOR),
			verticalSlides = Dom.wrapper.find(VERTICAL_SLIDES_SELECTOR),
			routes = {
				left: indexh > 0,
				right: indexh < horizontalSlides.length - 1,
				up: indexv > 0,
				down: indexv < verticalSlides.length - 1
			};
		return routes;
	}

	/**
	 * Checks if the current or specified slide is vertical
	 * (nested within another slide).
	 *
	 * @param {HTMLElement} slide [optional] The slide to check
	 * orientation of
	 */
	function isVerticalSlide(slide) {
		// Prefer slide argument, otherwise use current slide
		slide = slide.length ? slide : currentSlide;
		return slide && slide.parent() &&  slide.parent().nodeName() !== "section";
	}

	function navigateLeft() {
		slide(indexh - 1);
	}

	function navigateRight() {
		slide(indexh + 1);
	}

	function navigateUp() {
		slide(indexh, indexv - 1);
	}

	function navigateDown() {
		slide(indexh, indexv + 1);
	}


	/*
	 * API
	 */

	let Reveal = {
		VERSION,
		initialize,

		navigateLeft,
		navigateRight,
		navigateUp,
		navigateDown,
	};

	return Reveal;

})();

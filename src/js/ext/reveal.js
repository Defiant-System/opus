
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
		dom.file = options.spawn.find(".file-slides");
		dom.wrapper = dom.file.find(".slides");
		dom.progressbar = dom.wrapper.prepend(options.spawn.find(".player-helpers").clone(true));

		// Copy options over to our config object
		options = { ...config, ...options };

		// Updates the presentation to match the current configuration values
		configure(options);
	}

	/**
	 * Applies the configuration settings from the config
	 * object. May be called multiple times.
	 */
	function configure(options) {
		let numberOfSlides = dom.file.find(SLIDES_SELECTOR).length;
		dom.file.removeClass(config.transition);

		// New config options may be passed when this method
		// is invoked through the API after initialization
		options = { ...config, ...options };

		dom.file.addClass(config.transition);
		dom.file[ config.controls ? "addClass" : "removeClass" ]("show-controls");
		dom.file[ config.progress ? "addClass" : "removeClass" ]("show-progress");
		dom.file[ config.progress ? "addClass" : "removeClass" ]("vertical-center");

		setTimeout(() => slide(0, 0), 500);
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
		let horizontalSlides = dom.wrapper.find(HORIZONTAL_SLIDES_SELECTOR);

		// Activate and transition to the new slide
		indexh = updateSlides(HORIZONTAL_SLIDES_SELECTOR, h === undefined ? indexh : h);
		indexv = updateSlides(VERTICAL_SLIDES_SELECTOR, v === undefined ? indexv : v);

		// make first slide active
		horizontalSlides.get(h).addClass("present");

		layout();
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
		layoutSlideContents(config.width, config.height, slidePadding);

		dom.wrapper.css({ width: size.width, height: size.height });

		// Determine scale of content to fit within available space
		scale = Math.min( size.presentationWidth / size.width, size.presentationHeight / size.height );

		// Respect max/min scale settings
		scale = Math.max( scale, config.minScale );
		scale = Math.min( scale, config.maxScale );

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
		dom.wrapper.css({ top, left, bottom, right, zoom, transform });

		// Select all slides, vertical and horizontal
		dom.wrapper.find(SLIDES_SELECTOR).map(el => {
			let slide = $(el),
				top = "";
			if (!slide.is(":visible")) return;
			
			if (config.center || slide.hasClass("center")) {
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
		dom.wrapper.find("section > .stretch").map(element => {
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
		let offset = dom.wrapper.parents(".files-wrapper").offset(),
			size = {
				// Slide size
				width: config.width,
				height: config.height,
				// Presentation size - Reduce available space by margin
				presentationWidth: offset.width - (config.margin * 2),
				presentationHeight: offset.height - (config.margin * 2),
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
		return dom.wrapper.find(`${SLIDES_SELECTOR}:not(.stack)`).length;
	}

	/**
	 * Returns the number of past slides. This can be used as a global
	 * flattened index for slides.
	 */
	function getSlidePastCount() {
		let horizontalSlides = dom.wrapper.find(HORIZONTAL_SLIDES_SELECTOR);
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
		let slides = dom.wrapper.find(selector),
			slidesLength = slides.length;

		if (slidesLength) {
			// Enforce max and minimum index bounds
			index = Math.max(Math.min(index, slidesLength - 1), 0);

			for (let i=0; i<slidesLength; i++) {
				let element = slides.get(i);
				let reverse = !isVerticalSlide( element);

				element.removeClass("past present future");
				// http://www.w3.org/html/wg/drafts/html/master/editing.html#the-hidden-attribute
				element.attr({
					"hidden": "",
					"aria-hidden": "true",
				});

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
				.removeAttr("hidden")
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
		if (config.progress && dom.progressbar) {
			let width = getProgress() * dom.wrapper.offsetWidth;
			dom.progressbar.css({ width });
		}
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

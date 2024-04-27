
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

			// Turns fragments on and off globally
			fragments: true,

			// Enable the slide overview mode
			overview: true,

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

			// default first slide
			goto: [0],
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
		previousSlide = [],
		currentSlide = [],

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

		// code hightlight
		Dom.wrapper.find("pre code").map(code => {
			Hljs.highlightElement(code);
			Hljs.lineNumbers(code);
		});
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

		// auto go to slide number
		let initSlide = options.goto || [0,0]; // <-- first slide
		slide(...initSlide);
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
	 */
	function slide(h, v, f) {
		// Remember where we were at before
		previousSlide = currentSlide;

		// Query all horizontal slides in the deck
		let horizontalSlides = Dom.wrapper.find(HORIZONTAL_SLIDES_SELECTOR);

		// If no vertical index is specified and the upcoming slide is a
		// stack, resume at its previous vertical index
		if (v === undefined) {
			v = getPreviousVerticalIndex(horizontalSlides.get(h));
		}

		// If we were on a vertical stack, remember what vertical index
		// it was on so we can resume at the same position when returning
		if (previousSlide.length && previousSlide.parent().hasClass("stack")) {
			setPreviousVerticalIndex(previousSlide.parent(), indexv);
		}

		// Remember the state before this slide
		let stateBefore = state.concat();

		// Reset the state array
		state.length = 0;

		let indexhBefore = indexh || 0,
			indexvBefore = indexv || 0;

		// Activate and transition to the new slide
		indexh = updateSlides(HORIZONTAL_SLIDES_SELECTOR, h === undefined ? indexh : h);
		indexv = updateSlides(VERTICAL_SLIDES_SELECTOR, v === undefined ? indexv : v);

		// Update the visibility of slides now that the indices have changed
		updateSlidesVisibility();

		layout();

		// Find the current horizontal slide and any possible vertical slides
		// within it
		let currentHorizontalSlide = horizontalSlides.get(indexh),
			currentVerticalSlides = currentHorizontalSlide.find("section");

		// Store references to the previous and current slides
		currentSlide = currentVerticalSlides.get(indexv);
		if (!currentSlide.length) currentSlide = currentHorizontalSlide;

		// Dispatch an event if the slide changed
		let slideChanged = (indexh !== indexhBefore || indexv !== indexvBefore);
		if (slideChanged) {
			// dispatchEvent ?
		} else {
			// Ensure that the previous slide is never the same as the current
			previousSlide = [];
		}

		// Solves an edge case where the previous slide maintains the
		// 'present' class when navigating between adjacent vertical
		// stacks
		if (previousSlide.length) {
			previousSlide.removeClass("present").attr({ "aria-hidden": "true" });
		}

		updateControls();
		updateProgress();
		updateSlideNumber();
	}

	/**
	 * Applies JavaScript-controlled layout rules to the
	 * presentation.
	 */
	function layout(dim) {
		let size = getComputedSlideSize(),
			slidePadding = 20, // TODO Dig this out of DOM
			zoom = "",
			left = "",
			top = "",
			bottom = "",
			right = "",
			transform = "";
		
		// adopt "width" & "height", if any
		if (dim) {
			size.presentationWidth = dim.width - (options.margin * 2);
			size.presentationHeight = dim.height - (options.margin * 2);
		}

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
		if (scale > 1) {
			zoom = scale;
		} else {
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
	 * Stores the vertical index of a stack so that the same
	 * vertical slide can be selected when navigating to and
	 * from the stack.
	 *
	 * @param {HTMLElement} stack The vertical stack element
	 * @param {int} v Index to memorize
	 */
	function setPreviousVerticalIndex(stack, v) {
		if (stack.length) {
			stack.data({ "previous-indexv": v || 0 });
		}
	}

	/**
	 * Retrieves the vertical index which was stored using
	 * #setPreviousVerticalIndex() or 0 if no previous index
	 * exists.
	 *
	 * @param {HTMLElement} stack The vertical stack element
	 */
	function getPreviousVerticalIndex(stack) {
		if (stack.length && stack.hasClass("stack")) {
			// Prefer manually defined start-indexv
			let attributeName = stack.data("start-indexv") ? "start-indexv" : "previous-indexv"
			return parseInt(stack.data(attributeName) || 0, 10);
		}
		return 0;
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
	 * Retrieves the h/v location of the current, or specified,
	 * slide.
	 *
	 * @param {HTMLElement} slide If specified, the returned
	 * index will be for this slide rather than the currently
	 * active one
	 *
	 * @return {Object} { h: <int>, v: <int>, f: <int> }
	 */
	function getIndices(slide) {
		// By default, return the current indices
		let h = indexh,
			v = indexv,
			f;
		// If a slide is specified, return the indices of that slide
		if (slide) {
			let isVertical = isVerticalSlide(slide);
			let slideh = isVertical ? slide.parentNode : slide;
			// Select all horizontal slides
			let horizontalSlides = Dom.wrapper.find(HORIZONTAL_SLIDES_SELECTOR);
			// Now that we know which the horizontal slide is, get its index
			h = Math.max(horizontalSlides.indexOf(slideh), 0);
			// Assume we're not vertical
			v = undefined;
			// If this is a vertical slide, grab the vertical index
			if (isVertical) {
				v = Math.max(slide.parent().find("section").indexOf(slide), 0);
			}
		}
		if (!slide && currentSlide) {
			let hasFragments = currentSlide.find(".fragment").length > 0;
			if (hasFragments) {
				let currentFragment = currentSlide.querySelector(".current-fragment");
				if (currentFragment && currentFragment.hasAttribute("data-fragment-index")) {
					f = parseInt(currentFragment.getAttribute("data-fragment-index"), 10);
				} else {
					f = currentSlide.find(".fragment.visible").length - 1;
				}
			}
		}
		return { h, v, f };

	}

	/**
	 * Retrieves the total number of slides in this presentation.
	 */
	function getTotalSlides() {
		return Dom.wrapper.find(`${SLIDES_SELECTOR}:not(.stack)`).length;
	}

	/**
	 * Returns the background element for the given slide.
	 * All slides, even the ones with no background properties
	 * defined, have a background element so as long as the
	 * index is valid an element will be returned.
	 */
	function getSlideBackground(x, y) {
		let horizontalBackground = Dom.wrapper.find(".backgrounds > .slide-background")[x];
		let verticalBackgrounds = horizontalBackground && $(horizontalBackground).find(".slide-background");
		if (verticalBackgrounds && verticalBackgrounds.length && typeof y === "number") {
			return verticalBackgrounds ? verticalBackgrounds[y] : undefined;
		}
		return horizontalBackground;
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
				let reverse = !isVerticalSlide(element);

				element.removeClass("past present future");
				// http://www.w3.org/html/wg/drafts/html/master/editing.html#the-hidden-attribute
				element.attr({ "aria-hidden": "true" });

				// If this element contains vertical slides
				if (element.find("section").length) {
					element.addClass("stack");
				}

				if (i < index) {
					// Any element previous to index is given the "past" class
					element.addClass("past");
					// element.addClass(reverse ? "future" : "past");
				} else if (i > index) {
					// Any element subsequent to index is given the "future" class
					element.addClass("future");
					// element.addClass(reverse ? "past" : "future");
				}
			}

			// Mark the current slide as present
			slides.get(index)
				.addClass("present")
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
	 * Optimization method; hide all slides that are far away
	 * from the present slide.
	 */
	function updateSlidesVisibility() {
		// Select all slides and convert the NodeList result to
		// an array
		let horizontalSlides = Dom.wrapper.find(HORIZONTAL_SLIDES_SELECTOR),
			horizontalSlidesLength = horizontalSlides.length,
			distanceX,
			distanceY;
		if (horizontalSlidesLength && typeof indexh !== "undefined") {
			// The number of steps away from the present slide that will
			// be visible
			let viewDistance = config.viewDistance;
			for (let x = 0; x < horizontalSlidesLength; x++) {
				let horizontalSlide = horizontalSlides.get(x);
				let verticalSlides = horizontalSlide.find("section"),
					verticalSlidesLength = verticalSlides.length;
				// Determine how far away this slide is from the present
				distanceX = Math.abs( ( indexh || 0 ) - x ) || 0;
				// If the presentation is looped, distance should measure
				// 1 between the first and last slides
				if (config.loop) {
					distanceX = Math.abs(((indexh || 0) - x) % (horizontalSlidesLength - viewDistance)) || 0;
				}
				// Show the horizontal slide if it's within the view distance
				if (distanceX < viewDistance) {
					showSlide(horizontalSlide);
				} else {
					hideSlide(horizontalSlide);
				}
				if (verticalSlidesLength) {
					let oy = getPreviousVerticalIndex(horizontalSlide);
					for (let y = 0; y < verticalSlidesLength; y++) {
						let verticalSlide = verticalSlides.get(y);
						distanceY = x === (indexh || 0) ? Math.abs((indexv || 0) - y) : Math.abs(y - oy);
						if (distanceX + distanceY < viewDistance) {
							showSlide(verticalSlide);
						} else {
							hideSlide(verticalSlide);
						}
					}
				}
			}
		}
	}

	/**
	 * Returns a value ranging from 0-1 that represents
	 * how far into the presentation we have navigated.
	 */
	function getProgress() {
		// The number of past and total slides
		let totalCount = getTotalSlides();
		let pastCount = getSlidePastCount();
		if (currentSlide && currentSlide.length) {
			let allFragments = currentSlide.find(".fragment");
			// If there are fragments in the current slide those should be
			// accounted for in the progress.
			if (allFragments.length > 0) {
				let visibleFragments = currentSlide.find(".fragment.visible");
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
		let fragments = availableFragments();

		// Remove the 'enabled' class from all directions
		Dom.controls.all.removeClass("fragmented").addClass("disabled_");
		// Add the 'enabled' class to the available routes
		if (routes.left) Dom.controls.left.removeClass("disabled_");
		if (routes.right) Dom.controls.right.removeClass("disabled_");
		if (routes.up) Dom.controls.up.removeClass("disabled_");
		if (routes.down) Dom.controls.down.removeClass("disabled_");

		// Highlight fragment directions
		if (currentSlide) {
			// Apply fragment decorators to directional buttons based on
			// what slide axis they are in
			if (isVerticalSlide(currentSlide)) {
				if (fragments.prev) Dom.controls.up.addClass("fragmented").removeClass("disabled_");
				if (fragments.next) Dom.controls.down.addClass("fragmented").removeClass("disabled_");
			} else {
				if (fragments.prev) Dom.controls.left.addClass("fragmented").removeClass("disabled_");
				if (fragments.next) Dom.controls.right.addClass("fragmented").removeClass("disabled_");
			}
		}
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
	 * Called when the given slide is within the configured view
	 * distance. Shows the slide element and loads any content
	 * that is set to load lazily (data-src).
	 */
	function showSlide(slide) {
		// Show the slide element
		slide.css({ display: "block" });
		// Media elements with data-src attributes
		slide.find("img[data-src], video[data-src], audio[data-src]").map(element => {
			element.setAttribute("src", element.getAttribute( "data-src"));
			element.removeAttribute("data-src");
		});

		// Media elements with <source> children
		slide.find("video, audio").map(element => {
			let sources = 0;
			$("source[data-src]", media).map(source => {
				source.setAttribute("src", source.getAttribute( "data-src"));
				source.removeAttribute("data-src");
				sources += 1;
			});
			// If we rewrote sources for this video/audio element, we need
			// to manually tell it to load from its new origin
			if (sources > 0) {
				media.load();
			}
		});

		// Show the corresponding background element
		let indices = getIndices(slide);
		let background = getSlideBackground(indices.h, indices.v);
		if (background) {
			background.style.display = "block";

			// If the background contains media, load it
			if (background.hasAttribute("data-loaded") === false) {
				background.setAttribute("data-loaded", "true");

				let backgroundImage = slide.data("background-image"),
					backgroundVideo = slide.data("background-video"),
					backgroundVideoLoop = !!slide.data("background-video-loop"),
					backgroundVideoMuted = !!slide.data("background-video-muted");

				if (backgroundImage) {
					// Images
					background.style.backgroundImage = "url("+ backgroundImage +")";
				} else if (backgroundVideo) {
					// Videos
					let video = document.createElement("video");
					if (backgroundVideoLoop) {
						video.setAttribute("loop", "");
					}
					if (backgroundVideoMuted) {
						video.muted = true;
					}
					// Support comma separated lists of video sources
					backgroundVideo.split(",").forEach(source => {
						video.innerHTML += `<source src="${source}">`;
					});
					background.appendChild(video);
				}
			}
		}
	}

	/**
	 * Called when the given slide is moved outside of the
	 * configured view distance.
	 */
	function hideSlide(slide) {
		// Hide the slide element
		slide.css({ display: "none" });
		// Hide the corresponding background element
		let indices = getIndices(slide);
		let background = getSlideBackground(indices.h, indices.v);
		if (background) {
			background.style.display = "none";
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
	 * Returns an object describing the available fragment
	 * directions.
	 *
	 * @return {Object} two boolean properties: prev/next
	 */
	function availableFragments() {
		let prev = false,
			next = false;
		if (currentSlide.length && config.fragments) {
			let fragments = currentSlide.find(".fragment");
			let hiddenFragments = currentSlide.find(".fragment:not(.visible)");
			prev = fragments.length - hiddenFragments.length > 0;
			next = !!hiddenFragments.length;
		}
		return { prev, next };
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
		return slide && slide.length && slide.parent() && slide.parent().nodeName() === "section";
	}

	/**
	 * Return a sorted fragments list, ordered by an increasing
	 * "data-fragment-index" attribute.
	 *
	 * Fragments will be revealed in the order that they are returned by
	 * this function, so you can use the index attributes to control the
	 * order of fragment appearance.
	 *
	 * To maintain a sensible default fragment order, fragments are presumed
	 * to be passed in document order. This function adds a "fragment-index"
	 * attribute to each node if such an attribute is not already present,
	 * and sets that attribute to an integer value which is the position of
	 * the fragment within the fragments list.
	 */
	function sortFragments(fragments ) {
		let ordered = [],
			unordered = [],
			sorted = [];
		// Group ordered and unordered elements
		fragments.map((fragment, i) => {
			if (fragment.hasAttribute("data-fragment-index")) {
				let index = parseInt(fragment.getAttribute("data-fragment-index"), 10);
				if (!ordered[index]) {
					ordered[index] = [];
				}
				ordered[index].push(fragment);
			} else {
				unordered.push([fragment]);
			}
		});

		// Append fragments without explicit indices in their DOM order
		ordered = ordered.concat(unordered);
		// Manually count the index up per group to ensure there are no gaps
		let index = 0;

		// Push all fragments in their sorted order to an array, this flattens the groups
		ordered.forEach(group => {
			group.forEach(fragment => {
				sorted.push( fragment );
				fragment.setAttribute("data-fragment-index", index);
			} );
			index ++;
		});

		return sorted;
	}

	/**
	 * Navigate to the specified slide fragment.
	 *
	 * @param {Number} index The index of the fragment that
	 * should be shown, -1 means all are invisible
	 * @param {Number} offset Integer offset to apply to the
	 * fragment index
	 *
	 * @return {Boolean} true if a change was made in any
	 * fragments visibility as part of this call
	 */
	function navigateFragment(index, offset) {
		if (currentSlide && config.fragments) {
			let fragments = sortFragments(currentSlide.find(".fragment"));
			if (fragments.length) {
				// If no index is specified, find the current
				if (typeof index !== "number") {
					let lastVisibleFragment = sortFragments(currentSlide.find(".fragment.visible")).pop();
					if (lastVisibleFragment) {
						index = parseInt(lastVisibleFragment.getAttribute("data-fragment-index") || 0, 10);
					} else {
						index = -1;
					}
				}
				// If an offset is specified, apply it to the index
				if (typeof offset === "number") {
					index += offset;
				}

				let fragmentsShown = [],
					fragmentsHidden = [];
				fragments.map((element, i) => {
					if (element.hasAttribute("data-fragment-index")) {
						i = parseInt(element.getAttribute("data-fragment-index"), 10);
					}

					// Visible fragments
					if (i <= index) {
						if (!element.classList.contains( "visible")) fragmentsShown.push(element);
						element.classList.add("visible");
						element.classList.remove("current-fragment");

						if (i === index) {
							element.classList.add("current-fragment");
						}
					} else {
						// Hidden fragments
						if (element.classList.contains("visible")) fragmentsHidden.push(element);
						element.classList.remove("visible");
						element.classList.remove("current-fragment");
					}
				} );
				updateControls();
				updateProgress();
				return !!( fragmentsShown.length || fragmentsHidden.length );
			}
		}
		return false;
	}

	/**
	 * Navigate to the next slide fragment.
	 *
	 * @return {Boolean} true if there was a next fragment,
	 * false otherwise
	 */
	function nextFragment() {
		return navigateFragment(null, 1);
	}

	/**
	 * Navigate to the previous slide fragment.
	 *
	 * @return {Boolean} true if there was a previous fragment,
	 * false otherwise
	 */
	function previousFragment() {
		return navigateFragment(null, -1);
	}

	function navigateLeft() {
		if (previousFragment() === false) {
			slide(indexh - 1);
		}
	}

	function navigateRight() {
		if (nextFragment() === false) {
			slide(indexh + 1);
		}
	}

	function navigateUp() {
		if (previousFragment() === false) {
			slide(indexh, indexv - 1);
		}
	}

	function navigateDown() {
		if (nextFragment() === false) {
			slide(indexh, indexv + 1);
		}
	}


	/*
	 * API
	 */

	let Reveal = {
		VERSION,
		initialize,
		slide,
		layout,
		navigateLeft,
		navigateRight,
		navigateUp,
		navigateDown,
	};

	return Reveal;

})();

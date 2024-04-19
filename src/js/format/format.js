
// opus.spawn.format

{
	init() {
		// fast references
		this.els = {};

		// init all sub-objects
		Object.keys(this)
			.filter(i => typeof this[i].init === "function")
			.map(i => this[i].init(this));
	},
	dispatch(event) {
		let APP = opus,
			Self = APP.spawn.format,
			Spawn = event.spawn,
			name,
			value,
			pEl,
			el;
		switch (event.type) {
			// custom events
			case "select-tab":
				event.el.find(".active").removeClass("active");
				el = $(event.target).addClass("active");
				
				pEl = event.el.parent();
				pEl.find(".sidebar-body.active").removeClass("active");
				pEl.find(".sidebar-body").get(el.index()).addClass("active");
				break;
			// forward popup events
			case "popup-color-ring":
			case "popup-color-palette-1":
			case "popup-color-palette-2":
			case "popup-color-palette-3":
				APP.spawn.popups.dispatch(event);
				break;
			default:
				el = event.el || (event.origin && event.origin.el) || $(event.target);
				pEl = el.parents("[data-section]");
				name = pEl.data("section");
				if (Self[name]) {
					return Self[name].dispatch(event);
				}
		}
	},
	shape: @import "./shape.js",
	image: @import "./image.js",
	text: @import "./text.js",
	line: @import "./line.js",
}

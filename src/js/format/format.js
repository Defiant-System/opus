
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
		// console.log(\event);
		switch (event.type) {
			// system events
			case "spawn.blur":
				// unbind event handlers
				if (Self.els.el) {
					Self.els.el.off("mousedown", ".gradient-colors", Self.gradientPoints);
					Self.els.el.off("mousedown", ".angle-ring", Self.angleRing);
				}
				// reset fast references
				Self.els = {};
				break;
			case "spawn.focus":
				// fast references
				Self.els = {
					doc: $(document),
					layout: Spawn.find("layout"),
					el: Spawn.find("sidebar.format"),
					tbl: Spawn.find(".sidebar-table"),
				};
				// init all sub-objects
				Object.keys(Self)
					.filter(i => typeof Self[i].dispatch === "function")
					.map(i => Self[i].dispatch(event));

				// bind event handlers
				Self.els.el.on("mousedown", ".gradient-colors", Self.gradientPoints);
				Self.els.el.on("mousedown", ".angle-ring", Self.angleRing);
				break;
			// custom events
			case "toggle-format":
				if (event.target) {
					el = $(event.target);
					value = el.hasClass("tool-active_");
				} else {
					el = Spawn.find(`.toolbar-tool_[data-click="toggle-format"]`);
					value = !event.isOn;
					el[value ? "removeClass" : "addClass"]("tool-active_");
				}

				let formatWidth = Self.els.el.offset().width,
					offset = Spawn.find(".files-wrapper").offset(),
					width = offset.width + (value ? formatWidth : -formatWidth),
					height = offset.height;
				Reveal.layout({ width, height });

				// toggle app content
				Spawn.find("layout")[value ? "removeClass" : "addClass"]("show-sidebar-format");

				// return "state"
				return !value;
			case "select-tab":
				event.el.find(".active").removeClass("active");
				el = $(event.target).addClass("active");
				
				pEl = event.el.parent();
				pEl.find(".sidebar-body.active").removeClass("active");
				pEl.find(".sidebar-body").get(el.index()).addClass("active");
				break;
			case "toggle-group-body":
				el = event.el.parent();
				value = el.hasClass("expanded");
				el.toggleClass("expanded", value);
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
	gradientPoints(event) {
		let APP = eniac,
			Self = APP.spawn.sidebar,
			Parent = Self.parent,
			Drag = Self.drag,
			stops;
		switch (event.type) {
			case "mousedown": break;
			case "mousemove": break;
			case "mouseup": break;
		}
	},
	angleRing(event) {
		let APP = eniac,
			Self = APP.spawn.sidebar,
			Parent = Self.parent,
			Drag = Self.drag,
			stops;
		switch (event.type) {
			case "mousedown": break;
			case "mousemove": break;
			case "mouseup": break;
		}
	},
	file: @import "./file.js",
	shape: @import "./shape.js",
	image: @import "./image.js",
	text: @import "./text.js",
	line: @import "./line.js",
}

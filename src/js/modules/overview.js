
// opus.spawn.overview

{
	init() {
		
	},
	dispatch(event) {
		let APP = opus,
			Self = APP.spawn.overview,
			Spawn = event.spawn,
			Tab = Spawn ? Spawn.data.tabs._active : null,
			name,
			value,
			el;
		// console.log(event);
		switch (event.type) {
			// system events
			case "spawn.focus":
				// fast references
				Self.els = {
					container: Spawn.find(`.container`),
					overview: Spawn.find(`.overview`),
					toolAdd: Spawn.find(`.tool-add`),
				};
				// bind event handler
				Self.els.overview.on("mousedown", Self.doPan);
				break;
			case "spawn.blur":
				// unbind event handler
				Self.els.overview.off("mousedown", Self.doPan);
				// reset references
				Self.els = {};
				break;
			// custom events
			case "toggle-overview":
				if (event.target) {
					el = $(event.target);
					value = el.hasClass("tool-active_");
				} else {
					el = Spawn.find(`.toolbar-tool_[data-click="toggle-overview"]`);
					value = !event.isOn;
					el[value ? "removeClass" : "addClass"]("tool-active_");
				}
				// toggle app content
				Spawn.find("layout")[value ? "removeClass" : "addClass"]("show-overview");
				// return "state"
				return !value;
			case "add-slide":
				console.log(event);
				break;
			case "select-slide":
				el = $(event.target).parents("?li").get(0);
				if (!el.length) return;
				// active indicator
				event.el.find(".active").removeClass("active");
				el.addClass("active");

				let siblings = el.parent().find("> li"),
					ultY = +el.parent().cssProp("--tY"),
					ultX = +el.parent().cssProp("--tX"),
					ul = el,
					ulIndex = 0;
				while (!ul.parent().hasClass("container")) {
					ul = ul.parents("ul");
					ulIndex++;
				}

				let rect1 = Self.els.overview[0].getBoundingClientRect(),
					rect2 = el[0].getBoundingClientRect(),
					top = rect2.y - rect1.y,
					left = rect2.x - rect1.x,
					options = [];

				if (ulIndex % 2 === 1) {
					options.push("n");
					options.push("s");
					if (el.index() === -ultX && ulIndex > 1) options = [];
					if (el.index() === 0) options.push("e");
					if (el.index() === siblings.length-1) options.push("w");
				}
				if (ulIndex % 2 === 0) {
					options.push("e");
					options.push("w");
					if (el.index() === -ultY) options = [];
					if (el.index() === 0) options.push("n");
					if (el.index() === siblings.length-1) options.push("s");
				}

				// normalize options
				options = options.join("");
				// apply to add tools
				Self.els.toolAdd.css({ top, left }).data({ options });
				break;
		}
	},
	doPan(event) {
		let APP = opus,
			Self = APP.spawn.overview,
			Drag = Self.drag;
		switch (event.type) {
			case "mousedown":
				// exit if event didn't originate in "overview root"
				if (!$(event.target).hasClass("overview")) return;
				// stop default behaviour
				event.preventDefault();
				// clear add-tools
				Self.els.toolAdd.removeAttr("data-options");

				let doc = $(document),
					el = $(event.target).parents("?.overview").find(".container"),
					[a, b, c, d, x, y] = el.css("transform").replace(/matrix\(|\)/g, "").split(",").map(i => +i),
					click = {
						x: event.clientX - x,
						y: event.clientY - y,
					};

				// create drag object
				Self.drag = { el, doc, click };

				// bind event
				Self.drag.doc.on("mousemove mouseup", Self.doPan);
				break;
			case "mousemove":
				let tX = event.clientX - Drag.click.x,
					tY = event.clientY - Drag.click.y,
					transform = `translate(${tX}px, ${tY}px)`;
				Drag.el.css({ transform });
				break;
			case "mouseup":
				// unbind event
				Self.drag.doc.off("mousemove mouseup", Self.doPan);
				break;
		}
	}
}

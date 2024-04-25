
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
			// native events
			case "mouseover":
				el = $(event.target);
				// if (el.hasClass("overview")) {
				// 	console.log(event.target);
				// 	return Self.els.toolAdd.removeAttr("data-option");
				// }

				let [a, b, c, d, x, y] = Self.els.container.css("transform").replace(/matrix\(|\)/g, "").split(",").map(i => +i),
					offset = el.offset(),
					top = offset.top + y,
					left = offset.left + x,
					options = [];
				
				options.push("n");
				// options.push("s");
				// options.push("e");
				// options.push("w");

				Self.els.toolAdd
					.css({ top, left })
					.data({ option: options.join("") });
				break;
			// system events
			case "spawn.focus":
				// fast references
				Self.els = {
					container: Spawn.find(`.container`),
					overview: Spawn.find(`.overview`),
					toolAdd: Spawn.find(`.tool-add`),
				};
				// bind event handler
				Self.els.container.on("mouseover", "li:not(.stack)", Self.dispatch);
				// Self.els.overview.on("mouseover", Self.dispatch);
				Self.els.overview.on("mousedown", Self.doPan);
				break;
			case "spawn.blur":
				// unbind event handler
				Self.els.container.off("mouseover", "li:not(.stack)", Self.dispatch);
				// Self.els.overview.off("mouseover", Self.dispatch);
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
			case "select-slide":
				el = $(event.target).parents("?li").get(0);
				if (!el.length) return;
				// active indicator
				event.el.find(".active").removeClass("active");
				el.addClass("active");
				break;
		}
	},
	doPan(event) {
		let APP = opus,
			Self = APP.spawn.overview,
			Drag = Self.drag;
		switch (event.type) {
			case "mousedown":
				// stop default behaviour
				event.preventDefault();

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

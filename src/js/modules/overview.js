
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
				// bind event handler
				Spawn.find(`.overview`).on("mousedown", Self.doPan);
				break;
			case "spawn.blur":
				// unbind event handler
				Spawn.find(`.overview`).off("mousedown", Self.doPan);
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
					tr = el.css("transform").replace(/matrix\(|\)/g, "").split(",").map(i => +i),
					click = {
						x: event.clientX - tr[4],
						y: event.clientY - tr[5],
					};

				// create drag object
				Self.drag = { el, doc, click };

				// bind event
				Self.drag.doc.on("mousemove mouseup", Self.doPan);
				break;
			case "mousemove":
				let x = event.clientX - Drag.click.x,
					y = event.clientY - Drag.click.y,
					transform = `translate(${x}px, ${y}px)`;
				Drag.el.css({ transform });
				break;
			case "mouseup":
				// unbind event
				Self.drag.doc.off("mousemove mouseup", Self.doPan);
				break;
		}
	}
}

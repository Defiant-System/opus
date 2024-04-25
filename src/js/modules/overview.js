
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
		switch (event.type) {
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
	pan(event) {
		let APP = opus,
			Self = APP.spawn.overview,
			Drag = Self.drag;
		switch (event.type) {
			case "mousedown":
				break;
			case "mousemove":
				break;
			case "mouseup":
				break;
		}
	}
}

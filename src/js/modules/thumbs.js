
// opus.spawn.thumbs

{
	init() {
		
	},
	dispatch(event) {
		let APP = opus,
			Self = APP.spawn.thumbs,
			Spawn = event.spawn,
			Tab = Spawn ? Spawn.data.tabs._active : null,
			name,
			value,
			el;
		switch (event.type) {
			// custom events
			case "toggle-thumbs":
				if (event.target) {
					el = $(event.target);
					value = el.hasClass("tool-active_");
				} else {
					el = Spawn.find(`.toolbar-tool_[data-click="toggle-thumbs"]`);
					value = !event.isOn;
					el[value ? "removeClass" : "addClass"]("tool-active_");
				}
				// toggle app content
				Spawn.find("layout")[value ? "removeClass" : "addClass"]("show-sidebar-thumbs");
				// return "state"
				return !value;
		}
	}
}

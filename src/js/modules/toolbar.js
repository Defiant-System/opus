
// opus.spawn.toolbar

{
	init() {

	},
	dispatch(event) {
		let APP = opus,
			Self = APP.spawn.toolbar,
			Spawn = event.spawn || karaqu.getSpawn(event.target),
			el;
		// console.log(event);
		switch (event.type) {
			// system events
			case "spawn.blur":
				// reset fast references
				Self.els = {};
				break;
			case "spawn.focus":
				// fast references
				Self.els = {
					toolZoom: Spawn.find(`.toolbar-selectbox_[data-menu="view-zoom"]`),
					toolPlay: Spawn.find(`.toolbar-tool_[data-click="play-slides"]`),
					toolSlide: Spawn.find(`.toolbar-tool_[data-arg="slide"]`),
					toolGrid: Spawn.find(`.toolbar-tool_[data-arg="grid"]`),
					toolChart: Spawn.find(`.toolbar-tool_[data-arg="chart"]`),
					toolText: Spawn.find(`.toolbar-tool_[data-click="insert-text-box"]`),
					toolShape: Spawn.find(`.toolbar-tool_[data-arg="shape"]`),
					toolImage: Spawn.find(`.toolbar-tool_[data-arg="image"]`),
					overview: Spawn.find(`.toolbar-tool_[data-click="toggle-overview"]`),
					sidebar: Spawn.find(`.toolbar-tool_[data-click="toggle-sidebar"]`),
				};
				break;
			// custom events
			case "toggle-overview":
				return APP.spawn.overview.dispatch(event);
			case "toggle-sidebar":
				return APP.spawn.sidebar.dispatch(event);
			case "toggle-toolbars":
				for (name in Self.els) {
					Self.els[name][event.value ? "removeClass" : "addClass"]("tool-disabled_");
				}
				break;
		}
	}
}

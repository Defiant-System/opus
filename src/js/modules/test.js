
let Test = {
	init(APP, Spawn) {

		// return;
		setTimeout(() => Spawn.find(`.file-slides .controls span[data-click="nav-right"]`).trigger("click"), 1000);

		return;
		setTimeout(() => Spawn.find(`.blank-view .btn[data-click="new-file"]`).trigger("click"), 300);
		setTimeout(() => APP.spawn.dispatch({ type: "tab.new", spawn: Spawn }), 1000);
		
		// setTimeout(() => Spawn.find(`.toolbar-tool_[data-click="toggle-thumbs"]`).trigger("click"), 500);
		// setTimeout(() => APP.spawn.thumbs.dispatch({ type: "toggle-thumbs", spawn: Spawn, isOn: false }), 1400);

		// setTimeout(() => Spawn.find(`.toolbar-tool_[data-click="toggle-format"]`).trigger("click"), 500);
		// setTimeout(() => APP.spawn.format.dispatch({ type: "toggle-format", spawn: Spawn, isOn: false }), 1400);

		return;

		// Spawn.el.find("layout").addClass("show-blank-view");
		Spawn.el.find("layout").addClass("show-sidebar-format show-sidebar-thumbs");
		
		Spawn.el.find("sidebar.format").addClass("show-text");

		Spawn.el.find(".tool-disabled_:nth(0), .tool-disabled_:nth(9)").removeClass("tool-disabled_");


		// document.documentElement.webkitRequestFullscreen.apply(Spawn.find(".slides")[0]);

	}
};

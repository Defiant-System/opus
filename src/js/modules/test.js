
let Test = {
	init(APP, Spawn) {

		// return;

		setTimeout(() => Spawn.find(`.toolbar-tool_[data-click="toggle-overview"]`).trigger("click"), 300);
		// return;
		setTimeout(() => Spawn.find(`.overview li:nth(2)`).trigger("click"), 500);
		// setTimeout(() => Spawn.find(`.overview .add-east`).trigger("click"), 700);
		return;
		setTimeout(() => Spawn.find(`.toolbar-tool_[data-click="toggle-sidebar"]`).trigger("click"), 500);
		return;
		setTimeout(() => Spawn.find(`.file-slides .controls span[data-click="nav-right"]`).trigger("click"), 500);
		return;
		setTimeout(() => Spawn.find(`.file-slides .controls span[data-click="nav-left"]`).trigger("click"), 500);

		return;
		setTimeout(() => Spawn.find(`.blank-view .btn[data-click="new-file"]`).trigger("click"), 300);
		setTimeout(() => APP.spawn.dispatch({ type: "tab.new", spawn: Spawn }), 1000);
		
		// setTimeout(() => APP.spawn.overview.dispatch({ type: "toggle-overview", spawn: Spawn, isOn: false }), 1400);

		// setTimeout(() => APP.spawn.sidebar.dispatch({ type: "toggle-sidebar", spawn: Spawn, isOn: false }), 1400);

		return;

		// Spawn.el.find("layout").addClass("show-blank-view");
		Spawn.el.find("layout").addClass("show-sidebar show-sidebar-overview");
		
		Spawn.el.find("sidebar").addClass("show-text");

		Spawn.el.find(".tool-disabled_:nth(0), .tool-disabled_:nth(9)").removeClass("tool-disabled_");


		// document.documentElement.webkitRequestFullscreen.apply(Spawn.find(".slides")[0]);

	}
};

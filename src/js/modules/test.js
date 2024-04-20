
let Test = {
	init(APP, Spawn) {

		return;
		setTimeout(() => Spawn.el.find(`.blank-view .btn[data-click="new-file"]`).trigger("click"), 500);

		return;

		// Spawn.el.find("layout").addClass("show-blank-view");
		Spawn.el.find("layout").addClass("show-sidebar-format show-sidebar-thumbs");
		
		Spawn.el.find("sidebar.format").addClass("show-text");

		Spawn.el.find(".tool-disabled_:nth(0), .tool-disabled_:nth(9)").removeClass("tool-disabled_");

	}
};

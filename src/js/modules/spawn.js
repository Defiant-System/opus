
// opus.spawn

{
	init() {
		// init all sub-objects
		Object.keys(this)
			.filter(i => typeof this[i].init === "function")
			.map(i => this[i].init());
	},
	dispose(event) {
		let Spawn = event.spawn;
		let cmd = { type: "open.file", files: [] };
		for (let key in Spawn.data.tabs._stack) {
			let tab = Spawn.data.tabs._stack[key];
			if (tab.file._file) {
				cmd.files.push(tab.file._file.path);
			}
		}
		return cmd.files.length ? cmd : { "type": "tab.new" };
	},
	dispatch(event) {
		let APP = opus,
			Self = APP.spawn,
			Spawn = event.spawn,
			tabs,
			file,
			table,
			data,
			name,
			value,
			pEl,
			el;
		// console.log(event);
		switch (event.type) {
			// system events
			case "spawn.open":
				Spawn.data.tabs = new Tabs(Self, Spawn);
				// init blank view
				Self.blankView.dispatch({ ...event, type: "init-blank-view" });

				// DEV-ONLY-START
				Test.init(APP, Spawn);
				// DEV-ONLY-END
				break;
			case "spawn.init":
				Self.dispatch({ ...event, type: "tab.new" });
				break;
			case "spawn.blur":
				// forward event to all sub-objects
				Object.keys(Self)
					.filter(i => typeof Self[i].dispatch === "function")
					.map(i => Self[i].dispatch(event));
				break;
			case "spawn.focus":
				// forward event to all sub-objects
				Object.keys(Self)
					.filter(i => typeof Self[i].dispatch === "function")
					.map(i => Self[i].dispatch(event));

				// fast references
				Self.els = {
					layout: Spawn.find("layout"),
					body: Spawn.find("content .body .active-slide"),
					blankView: Spawn.find(".blank-view"),
				};
				break;
			case "load-samples":
				// console.log(event);
				break;

			// tab related events
			case "show-blank-view":
			case "tab.new":
				// add "file" to tab row
				Spawn.data.tabs.add(event.file);
				break;
			case "tab.clicked":
				Spawn.data.tabs.focus(event.el.data("id"));
				break;
			case "tab.close":
				Spawn.data.tabs.remove(event.el.data("id"));
				break;
				
			// custom events
			case "close-spawn":
				// system close window / spawn
				karaqu.shell("win -c");
				break;
			case "open-help":
				karaqu.shell("fs -u '~/help/index.md'");
				break;
			// forwards events
			default:
				el = event.el || (event.origin && event.origin.el);
				if (el) {
					pEl = el.data("area") ? el : el.parents("[data-area]");
					name = pEl.data("area");
					if (pEl.length) {
						if (Self[name] && Self[name].dispatch) {
							return Self[name].dispatch(event);
						}
						if (Self.tools[name].dispatch) {
							return Self.tools[name].dispatch(event);
						}
					}
				}
		}
	},
	blankView: @import "./blankView.js",
	format: @import "../format/format.js",
	thumbs: @import "./thumbs.js",
	popups: @import "./popups.js",
	toolbar: @import "./toolbar.js",
	tools: @import "../tools/tools.js",
}

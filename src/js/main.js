
@import "./classes/file.js"
@import "./classes/tabs.js"
@import "./modules/test.js"


// default settings
const DefaultSettings = {
	"document-zoom": 100,
	"guides-snap-sensitivity": 7,
};


const opus = {
	init() {
		// get settings or use default settings
		this.Settings = window.settings.getItem("settings") || DefaultSettings;

		// init all sub-objects
		Object.keys(this)
			.filter(i => typeof this[i].init === "function")
			.map(i => this[i].init());
	},
	dispose(event) {
		if (event.spawn) {
			return this.spawn.dispose(event);
		}
	},
	dispatch(event) {
		let Self = opus,
			spawn,
			el;
		// proxy spawn events
		if (event.spawn) return Self.spawn.dispatch(event);
		
		switch (event.type) {
			// system events
			case "window.init":
			case "new":
				spawn = window.open(event.id || "spawn");
				Self.spawn.dispatch({ ...event, type: "spawn.init", spawn });
				break;
			case "open.file":
				spawn = window.open("spawn");
				Self.spawn.dispatch({ ...event, spawn });
				break;
		}
	},
	spawn: @import "./modules/spawn.js",
};

window.exports = opus;

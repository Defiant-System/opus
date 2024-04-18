
// opus.spawn

{
	init() {
		// init all sub-objects
		Object.keys(this)
			.filter(i => typeof this[i].init === "function")
			.map(i => this[i].init());
	},
	dispose(event) {
		
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
			// custom events
			case "some-event":
				break;
			case "open-help":
				karaqu.shell("fs -u '~/help/index.md'");
				break;
		}
	}
}


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
			// custom events
			case "toggle-thumbs":
				return APP.spawn.thumbs.dispatch(event);
			case "toggle-format":
				return APP.spawn.format.dispatch(event);
		}
	}
}

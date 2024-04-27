
class File {

	constructor(fsFile, data) {
		// save reference to original FS file
		this._file = fsFile || new karaqu.File({ kind: "opf" });
		// parse file "head"
		this._head = {};

		let xDoc = this._file.data ? this._file.data.documentElement : null;

		switch (this._file.kind) {
			case "xml":
				// parse file "head"
				xDoc.selectNodes(`//head/meta[@name][@value]`).map(xMeta => {
					let name = xMeta.getAttribute("name"),
						value = xMeta.getAttribute("value");
					if ("true false".split(" ").includes(value)) value = value === "true";
					if (name === "goto") value = value.split(",").map(i => +i);
					this._head[xMeta.getAttribute("name")] = value;
				});
				// parse file "body"
				this._body = xDoc.selectSingleNode(`//body`).textContent;
				break;
			case "opf":
				break;
		}
	}

	dispatch(event) {
		let APP = opus,
			Spawn = event.spawn,
			name,
			value;
		// console.log(event);
		switch (event.type) {
			case "focus-file":
				// apply file options
				Reveal.initialize({ ...this._head, spawn: Spawn });

				// let el = Spawn.find(".slides");
				// Spawn.paint.toCache(el, "test.png")
				// 	.then(res => {
				// 		console.log(res);
				// 	});
				break;
			case "blur-file": break;
			case "nav-left": Reveal.navigateLeft(); break;
			case "nav-right": Reveal.navigateRight(); break;
			case "nav-up": Reveal.navigateUp(); break;
			case "nav-down": Reveal.navigateDown(); break;
		}
	}

	get base() {
		return this._file.base;
	}

	get isDirty() {
		
	}

	set parent(p) {
		this._parent = p;
	}

	async expand() {
		let files = await this._file.unzip();

		// temp
		// let vfs = await file.expand(),
		// 	str = bodyEl.html();
		// Object.keys(vfs).map(key => {
		// 	let rx = new RegExp(key, "g");
		// 	str = str.replace(rx, vfs[key]);
		// });
		
		return files;
	}

	toBlob(kind) {
		
	}

}

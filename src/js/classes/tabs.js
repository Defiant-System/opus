
class Tabs {
	constructor(parent, spawn) {
		this._parent = parent;
		this._spawn = spawn;
		this._stack = {};
		this._active = null;
		this._content = spawn.find(".files-wrapper");

		// file template
		let template = this._content.find(`.file-template`);
		this._fileTemplate = template.clone(true).removeClass("file-template").addClass("file-slides");
		template.remove();

		// slide template
		template = this._content.find(`.slide-template`);
		this._slideTemplate = template.clone(true).removeClass("slide-template");
		template.remove();
	}

	get file() {
		return this._active.file;
	}

	get length() {
		return Object.keys(this._stack).length;
	}

	setFocusElement(el) {
		// focus element
		this._active.focusEl = el;
	}

	async add(fItem) {
		// let file = fItem || new File();
		let file = fItem || { base: "Blank" },
			tId = "f"+ Date.now(),
			tName = file ? file.base : "Blank",
			tabEl = this._spawn.tabs.add(tName, tId),
			bodyEl = this._fileTemplate.clone(),
			history = new window.History,
			thumbs = false,
			format = false;

		if (fItem) {
			// add element to DOM + append file contents
			bodyEl.attr({ "data-id": tId });
			bodyEl = this._content.append(bodyEl);

			file.bodyEl = bodyEl;
			if (file._body) {
				// append file content
				bodyEl.append(file._body);
			} else {
				// add first empty slide
				bodyEl.append(this._slideTemplate.clone(true));	
			}

			// save reference to tab
			this._stack[tId] = { tId, tabEl, bodyEl, history, file, thumbs, format };
			// focus on file
			this.focus(tId);
		} else {
			this._stack[tId] = { tId, tabEl, file };
			// focus on file
			this.focus(tId);
		}
	}

	merge(ref) {
		let tId = ref.tId,
			file = ref.file,
			history = ref.history,
			format = ref.format,
			bodyEl = ref.bodyEl.clone(true).addClass("hidden"),
			tabEl = this._spawn.tabs.add(file.base, tId, true);
		// clone & append original bodyEl
		bodyEl = this._content.append(bodyEl);
		// save reference to this spawns stack
		this._stack[tId] = { tId, tabEl, bodyEl, history, file, thumbs, format };
	}

	removeDelayed() {
		let el = this._active.tabEl;
		this._spawn.tabs.wait(el);
	}

	remove(tId) {
		// remove element from DOM tree
		this._stack[tId].bodyEl.remove();
		// delete references
		this._stack[tId] = false;
		delete this._stack[tId];
	}

	focus(tId) {
		let spawn = this._spawn,
			active = this._active;
		if (active && active.bodyEl) {
			// hide blurred body
			active.bodyEl.addClass("hidden");
		}
		// reference to active tab
		this._active = this._stack[tId];

		if (this._active.file._file) {
			// hide blank view
			this._parent.blankView.dispatch({ type: "hide-blank-view", spawn });
			// enable toolbar
			this._parent.toolbar.dispatch({ type: "toggle-toolbars", spawn, value: true });
			// toggle thumbs
			this._parent.thumbs.dispatch({ type: "toggle-thumbs", spawn, isOn: this._active.thumbs });
			// toggle format
			this._parent.format.dispatch({ type: "toggle-format", spawn, isOn: this._active.format });
		} else {
			setTimeout(() => {
				// show blank view
				this._parent.blankView.dispatch({ type: "show-blank-view", spawn });
				// disable toolbar
				this._parent.toolbar.dispatch({ type: "toggle-toolbars", spawn, value: null });
			}, 10);
		}
	}

	update() {
		// todo
	}

	openLocal(url) {
		let parts = url.slice(url.lastIndexOf("/") + 1),
			[ name, kind ] = parts.split("."),
			file = new karaqu.File({ name, kind });
		// return promise
		return new Promise((resolve, reject) => {
			// fetch image and transform it to a "fake" file
			fetch(url)
				.then(resp => resp.blob())
				.then(blob => {
					// here the image is a blob
					file.blob = blob;
					if (blob.type === "application/xml") {
						let reader = new FileReader();
						reader.addEventListener("load", () => {
							// this will then display a text file
							file.data = $.xmlFromString(reader.result);
							resolve(file);
						}, false);

						reader.readAsText(blob);
					} else {
						resolve(file);
					}
				})
				.catch(err => reject(err));
		});
	}
}

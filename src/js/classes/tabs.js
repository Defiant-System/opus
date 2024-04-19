
class Tabs {
	constructor(parent, spawn) {
		this._parent = parent;
		this._spawn = spawn;
		this._stack = {};
		this._active = null;
		this._content = spawn.find(".slides-wrapper");

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

	add(fItem) {
		// let file = fItem || new File();
		let file = fItem || { base: "Blank" },
			tId = "f"+ Date.now(),
			tName = file ? file.base : "Blank",
			tabEl = this._spawn.tabs.add(tName, tId),
			bodyEl = this._fileTemplate.clone(),
			history = new window.History,
			sidebar = false;

		// add element to DOM + append file contents
		bodyEl.attr({ "data-id": tId });
		bodyEl = this._content.append(bodyEl);

		if (file._file) file.bodyEl = bodyEl;
		else {
			// add first empty slide
			bodyEl.append(this._slideTemplate.clone(true));
		}

		// save reference to tab
		this._stack[tId] = { tId, tabEl, bodyEl, history, file, sidebar };
		// focus on file
		this.focus(tId);
		
		if (file._file) {
			// default renders
			// file.dispatch({ type: "render-sheet", spawn: this._spawn });
		}
	}

	merge(ref) {
		let tId = ref.tId,
			file = ref.file,
			history = ref.history,
			sidebar = ref.sidebar,
			bodyEl = ref.bodyEl.clone(true).addClass("hidden"),
			tabEl = this._spawn.tabs.add(file.base, tId, true);
		// clone & append original bodyEl
		bodyEl = this._content.append(bodyEl);
		// save reference to this spawns stack
		this._stack[tId] = { tId, tabEl, bodyEl, history, file, sidebar };
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

	}

	update() {

	}

	openLocal(url) {

	}
}


class File {

	constructor(fsFile, data) {
		// save reference to original FS file
		this._file = fsFile || new karaqu.File({ kind: "xml" });

		console.log(fsFile);
	}

	toBlob(kind) {
		
	}

	get isDirty() {
		
	}

	undo() {
		
	}

	redo() {
		
	}

}


class File {

	constructor(fsFile, data) {
		// save reference to original FS file
		this._file = fsFile || new karaqu.File({ kind: "opf" });
	}

	get base() {
		return this._file.base;
	}

	get isDirty() {
		
	}

	expand() {
		this._file.unzip();
	}

	toBlob(kind) {
		
	}

}

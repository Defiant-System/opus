
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

	async expand() {
		let files = await this._file.unzip();
		return files;
	}

	toBlob(kind) {
		
	}

}

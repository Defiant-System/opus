
class File {

	constructor(fsFile, data) {
		// save reference to original FS file
		this._file = fsFile || new karaqu.File({ kind: "xml" });

		// console.log( this._file );
	}

	get base() {
		return this._file.base;
	}

	get isDirty() {
		
	}

	toBlob(kind) {
		
	}

}

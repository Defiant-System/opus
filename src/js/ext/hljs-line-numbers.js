// custom line numbers for "highlight.js"

hljs.lineNumbers = (function () {
	"use strict";

	let lineNumbers = block => {
		let el = $(block),
			lineNumbers = el.text().split("\n").length,
			lines = [...Array(lineNumbers)].map((e,i) => `<div>${i+1}</div>`);
		el.before(`<div class="hljs-ln">${lines.join("")}</div>`);
	};

	return lineNumbers;

}());

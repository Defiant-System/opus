
// opus.spawn.overview

{
	init() {
		
	},
	dispatch(event) {
		let APP = opus,
			Self = APP.spawn.overview,
			Spawn = event.spawn,
			Tab = Spawn ? Spawn.data.tabs._active : null,
			File = Tab ? Tab.file : null,
			oRect,
			value,
			ultY, ultX,
			siblings,
			aEl, aUl,
			el;
		// console.log(event);
		switch (event.type) {
			// system events
			case "spawn.focus":
				// fast references
				Self.els = {
					container: Spawn.find(`.overview .container`),
					overview: Spawn.find(`.overview`),
					toolAdd: Spawn.find(`.tool-add`),
				};
				// bind event handler
				Self.els.overview.on("mousedown", Self.doPan);
				break;
			case "spawn.blur":
				// unbind event handler
				Self.els.overview.off("mousedown", Self.doPan);
				// reset references
				Self.els = {};
				break;
			// custom events
			case "toggle-overview":
				if (event.target) {
					el = $(event.target);
					value = el.hasClass("tool-active_");
				} else {
					el = Spawn.find(`.toolbar-tool_[data-click="toggle-overview"]`);
					value = !event.isOn;
					el[value ? "removeClass" : "addClass"]("tool-active_");
				}
				// toggle app content
				Spawn.find("layout")[value ? "removeClass" : "addClass"]("show-overview");
				// auto-center view
				Self.dispatch({ type: "auto-center-overview" });
				// return "state"
				return !value;

			case "draw-overview":
				el = File.bodyEl.find(`.slides`);
				value = Self.drawOverviewMap(el);
				// populate DOM
				Self.els.container.html(value.join(""));
				// temp
				setTimeout(() => Self.els.container.find("li").get(0).trigger("click"), 100);
				break;

			case "auto-center-overview":
				oRect = Self.els.overview[0].getBoundingClientRect();
				value = {
					y: 1e5,
					x: 1e5,
					w: 0,
					h: 0,
				};
				Self.els.container.find("ul").map(element => {
					let rect = element.getBoundingClientRect();
					value.y = Math.min(value.y, (rect.y - oRect.y)) | 0;
					value.x = Math.min(value.x, (rect.x - oRect.x)) | 0;
					value.w = Math.max(value.w, (rect.x - oRect.x) + rect.width) | 0;
					value.h = Math.max(value.h, (rect.y - oRect.y) + rect.height) | 0;
				});
				// normalize values
				value.w -= value.x;
				value.h -= value.y;
				value.x = (oRect.width - value.w) >> 1;
				value.y = (oRect.height - value.h) >> 1;
				// console.log(value);
				// console.log(oRect);

				// center overview container
				Self.els.container.css({ transform: `translate(${value.x}px, ${value.y}px)` });
				break;
			case "add-slide":
				let [what, dir] = event.el.prop("className").split("-"),
					nEl;
				aEl = Self.els.overview.find(".active").removeClass("active selected"),
				aUl = aEl.parent();
				ultY = +aUl.cssProp("--tY") || 0;
				ultX = +aUl.cssProp("--tX") || 0;

				value = [];

				if (aUl.parent().hasClass("container") && aUl.find("li").length === 1) {
					if (["north", "south"].includes(dir)) aUl.removeClass("slides-h slides-v").addClass("slides-v");
					else aUl.removeClass("slides-h slides-v").addClass("slides-h");
				}

				// hide add-tools
				Self.els.toolAdd.removeAttr("data-options");

				if (aUl.hasClass("slides-h")) {
					console.log(1, dir);
					switch (dir) {
						case "north":
							break;
						case "south": break;
						case "east":
							value.push({ "--tX": ultX - 1 });
							nEl = aEl.before(aEl.clone(true).addClass(`new-${dir}`));
							break;
						case "west":
							nEl = aEl.after(aEl.clone(true).addClass(`new-${dir}`));
							break;
					}
				} else {
					console.log(2, dir);
					switch (dir) {
						case "north":
							value.push({ "--tY": ultY - 1 });
							nEl = aEl.before(aEl.clone(true).addClass(`new-${dir}`));
							break;
						case "south":
							nEl = aEl.after(aEl.clone(true).addClass(`new-${dir}`));
							break;
						case "east":
							value.push({ "--tX": ultX - 1 });
							nEl = aEl.addClass("stack").append(`<ul class="slides-h"><li class="new-${dir}"></li><li></li></ul>`).find(`li.new-${dir}`);
							break;
						case "west":
							nEl = aEl.addClass("stack").append(`<ul class="slides-h"><li></li><li class="new-${dir}"></li></ul>`).find(`li.new-${dir}`);
							break;
					}
				}
				// wait until next tick
				requestAnimationFrame(() => {
					nEl.cssSequence("appear", "transitionend", el => {
						value.map(data => nEl.parent().css(data));
						el.removeClass(`new-${dir} appear`).trigger("click");
					});
				});
				break;
			case "zoom-slide":
				console.log(event);
				break;
			case "delete-slide":
				// reference to active element
				aEl = Self.els.overview.find(".active").removeClass("active selected"),
				// hide add-tools
				Self.els.toolAdd.removeAttr("data-options");
				// trigger animation
				aEl.cssSequence("disappear", "transitionend", el => {
					let next = el.nextAll("li");
					if (!next.length) next = el.prevAll("li");
					// remove animated element
					el.remove();
					// single in "stack", make next a child of parent list
					let pNext = next.parent();
					if (pNext.find("> li").length === 1 && !pNext.parent().hasClass("container")) {
						console.log(pNext);
						next = pNext.parent().replace(next);
					}
					// make next element active
					next.trigger("click");
				});
				break;
			case "select-slide":
				el = $(event.target).parents("?li").get(0);
				if (!el.length || el.hasClass("stack")) return;
				
				// active indicator
				event.el.find(".active, .selected").removeClass("active selected");
				el.addClass("active");

				aUl = el.parent();
				siblings = aUl.find("> li");
				ultY = +el.parent().cssProp("--tY");
				ultX = +el.parent().cssProp("--tX");
				// overview rectangle
				oRect = Self.els.overview[0].getBoundingClientRect();

				let aulParent = aUl.parent(),
					rect = el[0].getBoundingClientRect(),
					top = rect.y - oRect.y,
					left = rect.x - oRect.x,
					options = [];
				// contextual tool options
				if (aUl.hasClass("slides-h")) {
					options.push("n");
					options.push("s");
					if (el.index() === -ultX && !aulParent.hasClass("container")) options = [];
					if (el.index() === 0) options.push("e");
					if (aulParent.hasClass("stack") && aulParent.index() === aulParent.parent().find("> li").length-1) options.push("s");
					if (el.index() === siblings.length-1) options.push("w");
				}
				if (aUl.hasClass("slides-v")) {
					options.push("e");
					options.push("w");
					if (el.index() === -ultY && !aulParent.hasClass("container")) options = [];
					if (el.index() === 0) options.push("n");
					if (el.index() === siblings.length-1) options.push("s");
				}
				options.push("z"); // zoom
				if (siblings.length > 1) options.push("t"); // trashcan
				// normalize options
				options = options.join("");
				// apply to add tools
				Self.els.toolAdd.css({ top, left }).data({ options });
				break;
		}
	},
	drawOverviewMap(pEl) {
		let sections = pEl.find("> section"),
			slidesType = pEl.data("slides-h") === null ? "slides-v" : "slides-h",
			list = [`<ul class="${slidesType}">`];
		
		sections.map(section => {
			let el = $(section),
				str = `<li></li>`;
			if (el.find("> section").length) {
				str = `<li class="stack">${this.drawOverviewMap(el).join("")}</li>`;
			}
			list.push(str);
		});

		list.push(`</ul>`);
		return list;
	},
	doPan(event) {
		let APP = opus,
			Self = APP.spawn.overview,
			Drag = Self.drag;
		switch (event.type) {
			case "mousedown":
				// exit if event didn't originate in "overview root"
				if (!$(event.target).hasClass("overview")) return;
				// stop default behaviour
				event.preventDefault();

				let doc = $(document),
					selected = Self.els.container.find(".active, .selected").removeClass("active").addClass("selected"),
					el = $(event.target).parents("?.overview").find(".container"),
					[a, b, c, d, x, y] = el.css("transform").replace(/matrix\(|\)/g, "").split(",").map(i => +i),
					click = {
						x: event.clientX - x,
						y: event.clientY - y,
					};

				// create drag object
				Self.drag = { el, doc, click, selected };

				// hide add-tools
				Self.els.toolAdd.data({ options: "h" });
				// bind event
				Self.drag.doc.on("mousemove mouseup", Self.doPan);
				break;
			case "mousemove":
				let tX = event.clientX - Drag.click.x,
					tY = event.clientY - Drag.click.y,
					transform = `translate(${tX}px, ${tY}px)`;
				Drag.el.css({ transform });
				break;
			case "mouseup":
				// unbind event
				Self.drag.doc.off("mousemove mouseup", Self.doPan);
				break;
		}
	}
}

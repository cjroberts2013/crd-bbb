//OWL CAROUSEL

!(function (a, b, c, d) {
	function e(b, c) {
		(this.settings = null),
			(this.options = a.extend({}, e.Defaults, c)),
			(this.$element = a(b)),
			(this._handlers = {}),
			(this._plugins = {}),
			(this._supress = {}),
			(this._current = null),
			(this._speed = null),
			(this._coordinates = []),
			(this._breakpoint = null),
			(this._width = null),
			(this._items = []),
			(this._clones = []),
			(this._mergers = []),
			(this._widths = []),
			(this._invalidated = {}),
			(this._pipe = []),
			(this._drag = {
				time: null,
				target: null,
				pointer: null,
				stage: { start: null, current: null },
				direction: null,
			}),
			(this._states = {
				current: {},
				tags: {
					initializing: ["busy"],
					animating: ["busy"],
					dragging: ["interacting"],
				},
			}),
			a.each(
				["onResize", "onThrottledResize"],
				a.proxy(function (b, c) {
					this._handlers[c] = a.proxy(this[c], this);
				}, this)
			),
			a.each(
				e.Plugins,
				a.proxy(function (a, b) {
					this._plugins[a.charAt(0).toLowerCase() + a.slice(1)] = new b(this);
				}, this)
			),
			a.each(
				e.Workers,
				a.proxy(function (b, c) {
					this._pipe.push({ filter: c.filter, run: a.proxy(c.run, this) });
				}, this)
			),
			this.setup(),
			this.initialize();
	}
	(e.Defaults = {
		items: 3,
		loop: !1,
		center: !1,
		rewind: !1,
		checkVisibility: !0,
		mouseDrag: !0,
		touchDrag: !0,
		pullDrag: !0,
		freeDrag: !1,
		margin: 0,
		stagePadding: 0,
		merge: !1,
		mergeFit: !0,
		autoWidth: !1,
		startPosition: 0,
		rtl: !1,
		smartSpeed: 250,
		fluidSpeed: !1,
		dragEndSpeed: !1,
		responsive: {},
		responsiveRefreshRate: 200,
		responsiveBaseElement: b,
		fallbackEasing: "swing",
		slideTransition: "",
		info: !1,
		nestedItemSelector: !1,
		itemElement: "div",
		stageElement: "div",
		refreshClass: "owl-refresh",
		loadedClass: "owl-loaded",
		loadingClass: "owl-loading",
		rtlClass: "owl-rtl",
		responsiveClass: "owl-responsive",
		dragClass: "owl-drag",
		itemClass: "owl-item",
		stageClass: "owl-stage",
		stageOuterClass: "owl-stage-outer",
		grabClass: "owl-grab",
	}),
		(e.Width = { Default: "default", Inner: "inner", Outer: "outer" }),
		(e.Type = { Event: "event", State: "state" }),
		(e.Plugins = {}),
		(e.Workers = [
			{
				filter: ["width", "settings"],
				run: function () {
					this._width = this.$element.width();
				},
			},
			{
				filter: ["width", "items", "settings"],
				run: function (a) {
					a.current = this._items && this._items[this.relative(this._current)];
				},
			},
			{
				filter: ["items", "settings"],
				run: function () {
					this.$stage.children(".cloned").remove();
				},
			},
			{
				filter: ["width", "items", "settings"],
				run: function (a) {
					var b = this.settings.margin || "",
						c = !this.settings.autoWidth,
						d = this.settings.rtl,
						e = {
							width: "auto",
							"margin-left": d ? b : "",
							"margin-right": d ? "" : b,
						};
					!c && this.$stage.children().css(e), (a.css = e);
				},
			},
			{
				filter: ["width", "items", "settings"],
				run: function (a) {
					var b =
							(this.width() / this.settings.items).toFixed(3) -
							this.settings.margin,
						c = null,
						d = this._items.length,
						e = !this.settings.autoWidth,
						f = [];
					for (a.items = { merge: !1, width: b }; d--; )
						(c = this._mergers[d]),
							(c =
								(this.settings.mergeFit && Math.min(c, this.settings.items)) ||
								c),
							(a.items.merge = c > 1 || a.items.merge),
							(f[d] = e ? b * c : this._items[d].width());
					this._widths = f;
				},
			},
			{
				filter: ["items", "settings"],
				run: function () {
					var b = [],
						c = this._items,
						d = this.settings,
						e = Math.max(2 * d.items, 4),
						f = 2 * Math.ceil(c.length / 2),
						g = d.loop && c.length ? (d.rewind ? e : Math.max(e, f)) : 0,
						h = "",
						i = "";
					for (g /= 2; g > 0; )
						b.push(this.normalize(b.length / 2, !0)),
							(h += c[b[b.length - 1]][0].outerHTML),
							b.push(this.normalize(c.length - 1 - (b.length - 1) / 2, !0)),
							(i = c[b[b.length - 1]][0].outerHTML + i),
							(g -= 1);
					(this._clones = b),
						a(h).addClass("cloned").appendTo(this.$stage),
						a(i).addClass("cloned").prependTo(this.$stage);
				},
			},
			{
				filter: ["width", "items", "settings"],
				run: function () {
					for (
						var a = this.settings.rtl ? 1 : -1,
							b = this._clones.length + this._items.length,
							c = -1,
							d = 0,
							e = 0,
							f = [];
						++c < b;

					)
						(d = f[c - 1] || 0),
							(e = this._widths[this.relative(c)] + this.settings.margin),
							f.push(d + e * a);
					this._coordinates = f;
				},
			},
			{
				filter: ["width", "items", "settings"],
				run: function () {
					var a = this.settings.stagePadding,
						b = this._coordinates,
						c = {
							width: Math.ceil(Math.abs(b[b.length - 1])) + 2 * a,
							"padding-left": a || "",
							"padding-right": a || "",
						};
					this.$stage.css(c);
				},
			},
			{
				filter: ["width", "items", "settings"],
				run: function (a) {
					var b = this._coordinates.length,
						c = !this.settings.autoWidth,
						d = this.$stage.children();
					if (c && a.items.merge)
						for (; b--; )
							(a.css.width = this._widths[this.relative(b)]),
								d.eq(b).css(a.css);
					else c && ((a.css.width = a.items.width), d.css(a.css));
				},
			},
			{
				filter: ["items"],
				run: function () {
					this._coordinates.length < 1 && this.$stage.removeAttr("style");
				},
			},
			{
				filter: ["width", "items", "settings"],
				run: function (a) {
					(a.current = a.current ? this.$stage.children().index(a.current) : 0),
						(a.current = Math.max(
							this.minimum(),
							Math.min(this.maximum(), a.current)
						)),
						this.reset(a.current);
				},
			},
			{
				filter: ["position"],
				run: function () {
					this.animate(this.coordinates(this._current));
				},
			},
			{
				filter: ["width", "position", "items", "settings"],
				run: function () {
					var a,
						b,
						c,
						d,
						e = this.settings.rtl ? 1 : -1,
						f = 2 * this.settings.stagePadding,
						g = this.coordinates(this.current()) + f,
						h = g + this.width() * e,
						i = [];
					for (c = 0, d = this._coordinates.length; c < d; c++)
						(a = this._coordinates[c - 1] || 0),
							(b = Math.abs(this._coordinates[c]) + f * e),
							((this.op(a, "<=", g) && this.op(a, ">", h)) ||
								(this.op(b, "<", g) && this.op(b, ">", h))) &&
								i.push(c);
					this.$stage.children(".active").removeClass("active"),
						this.$stage
							.children(":eq(" + i.join("), :eq(") + ")")
							.addClass("active"),
						this.$stage.children(".center").removeClass("center"),
						this.settings.center &&
							this.$stage.children().eq(this.current()).addClass("center");
				},
			},
		]),
		(e.prototype.initializeStage = function () {
			(this.$stage = this.$element.find("." + this.settings.stageClass)),
				this.$stage.length ||
					(this.$element.addClass(this.options.loadingClass),
					(this.$stage = a("<" + this.settings.stageElement + ">", {
						class: this.settings.stageClass,
					}).wrap(a("<div/>", { class: this.settings.stageOuterClass }))),
					this.$element.append(this.$stage.parent()));
		}),
		(e.prototype.initializeItems = function () {
			var b = this.$element.find(".owl-item");
			if (b.length)
				return (
					(this._items = b.get().map(function (b) {
						return a(b);
					})),
					(this._mergers = this._items.map(function () {
						return 1;
					})),
					void this.refresh()
				);
			this.replace(this.$element.children().not(this.$stage.parent())),
				this.isVisible() ? this.refresh() : this.invalidate("width"),
				this.$element
					.removeClass(this.options.loadingClass)
					.addClass(this.options.loadedClass);
		}),
		(e.prototype.initialize = function () {
			if (
				(this.enter("initializing"),
				this.trigger("initialize"),
				this.$element.toggleClass(this.settings.rtlClass, this.settings.rtl),
				this.settings.autoWidth && !this.is("pre-loading"))
			) {
				var a, b, c;
				(a = this.$element.find("img")),
					(b = this.settings.nestedItemSelector
						? "." + this.settings.nestedItemSelector
						: d),
					(c = this.$element.children(b).width()),
					a.length && c <= 0 && this.preloadAutoWidthImages(a);
			}
			this.initializeStage(),
				this.initializeItems(),
				this.registerEventHandlers(),
				this.leave("initializing"),
				this.trigger("initialized");
		}),
		(e.prototype.isVisible = function () {
			return !this.settings.checkVisibility || this.$element.is(":visible");
		}),
		(e.prototype.setup = function () {
			var b = this.viewport(),
				c = this.options.responsive,
				d = -1,
				e = null;
			c
				? (a.each(c, function (a) {
						a <= b && a > d && (d = Number(a));
				  }),
				  (e = a.extend({}, this.options, c[d])),
				  "function" == typeof e.stagePadding &&
						(e.stagePadding = e.stagePadding()),
				  delete e.responsive,
				  e.responsiveClass &&
						this.$element.attr(
							"class",
							this.$element
								.attr("class")
								.replace(
									new RegExp(
										"(" + this.options.responsiveClass + "-)\\S+\\s",
										"g"
									),
									"$1" + d
								)
						))
				: (e = a.extend({}, this.options)),
				this.trigger("change", { property: { name: "settings", value: e } }),
				(this._breakpoint = d),
				(this.settings = e),
				this.invalidate("settings"),
				this.trigger("changed", {
					property: { name: "settings", value: this.settings },
				});
		}),
		(e.prototype.optionsLogic = function () {
			this.settings.autoWidth &&
				((this.settings.stagePadding = !1), (this.settings.merge = !1));
		}),
		(e.prototype.prepare = function (b) {
			var c = this.trigger("prepare", { content: b });
			return (
				c.data ||
					(c.data = a("<" + this.settings.itemElement + "/>")
						.addClass(this.options.itemClass)
						.append(b)),
				this.trigger("prepared", { content: c.data }),
				c.data
			);
		}),
		(e.prototype.update = function () {
			for (
				var b = 0,
					c = this._pipe.length,
					d = a.proxy(function (a) {
						return this[a];
					}, this._invalidated),
					e = {};
				b < c;

			)
				(this._invalidated.all || a.grep(this._pipe[b].filter, d).length > 0) &&
					this._pipe[b].run(e),
					b++;
			(this._invalidated = {}), !this.is("valid") && this.enter("valid");
		}),
		(e.prototype.width = function (a) {
			switch ((a = a || e.Width.Default)) {
				case e.Width.Inner:
				case e.Width.Outer:
					return this._width;
				default:
					return (
						this._width - 2 * this.settings.stagePadding + this.settings.margin
					);
			}
		}),
		(e.prototype.refresh = function () {
			this.enter("refreshing"),
				this.trigger("refresh"),
				this.setup(),
				this.optionsLogic(),
				this.$element.addClass(this.options.refreshClass),
				this.update(),
				this.$element.removeClass(this.options.refreshClass),
				this.leave("refreshing"),
				this.trigger("refreshed");
		}),
		(e.prototype.onThrottledResize = function () {
			b.clearTimeout(this.resizeTimer),
				(this.resizeTimer = b.setTimeout(
					this._handlers.onResize,
					this.settings.responsiveRefreshRate
				));
		}),
		(e.prototype.onResize = function () {
			return (
				!!this._items.length &&
				this._width !== this.$element.width() &&
				!!this.isVisible() &&
				(this.enter("resizing"),
				this.trigger("resize").isDefaultPrevented()
					? (this.leave("resizing"), !1)
					: (this.invalidate("width"),
					  this.refresh(),
					  this.leave("resizing"),
					  void this.trigger("resized")))
			);
		}),
		(e.prototype.registerEventHandlers = function () {
			a.support.transition &&
				this.$stage.on(
					a.support.transition.end + ".owl.core",
					a.proxy(this.onTransitionEnd, this)
				),
				!1 !== this.settings.responsive &&
					this.on(b, "resize", this._handlers.onThrottledResize),
				this.settings.mouseDrag &&
					(this.$element.addClass(this.options.dragClass),
					this.$stage.on("mousedown.owl.core", a.proxy(this.onDragStart, this)),
					this.$stage.on(
						"dragstart.owl.core selectstart.owl.core",
						function () {
							return !1;
						}
					)),
				this.settings.touchDrag &&
					(this.$stage.on(
						"touchstart.owl.core",
						a.proxy(this.onDragStart, this)
					),
					this.$stage.on(
						"touchcancel.owl.core",
						a.proxy(this.onDragEnd, this)
					));
		}),
		(e.prototype.onDragStart = function (b) {
			var d = null;
			3 !== b.which &&
				(a.support.transform
					? ((d = this.$stage
							.css("transform")
							.replace(/.*\(|\)| /g, "")
							.split(",")),
					  (d = {
							x: d[16 === d.length ? 12 : 4],
							y: d[16 === d.length ? 13 : 5],
					  }))
					: ((d = this.$stage.position()),
					  (d = {
							x: this.settings.rtl
								? d.left +
								  this.$stage.width() -
								  this.width() +
								  this.settings.margin
								: d.left,
							y: d.top,
					  })),
				this.is("animating") &&
					(a.support.transform ? this.animate(d.x) : this.$stage.stop(),
					this.invalidate("position")),
				this.$element.toggleClass(
					this.options.grabClass,
					"mousedown" === b.type
				),
				this.speed(0),
				(this._drag.time = new Date().getTime()),
				(this._drag.target = a(b.target)),
				(this._drag.stage.start = d),
				(this._drag.stage.current = d),
				(this._drag.pointer = this.pointer(b)),
				a(c).on(
					"mouseup.owl.core touchend.owl.core",
					a.proxy(this.onDragEnd, this)
				),
				a(c).one(
					"mousemove.owl.core touchmove.owl.core",
					a.proxy(function (b) {
						var d = this.difference(this._drag.pointer, this.pointer(b));
						a(c).on(
							"mousemove.owl.core touchmove.owl.core",
							a.proxy(this.onDragMove, this)
						),
							(Math.abs(d.x) < Math.abs(d.y) && this.is("valid")) ||
								(b.preventDefault(),
								this.enter("dragging"),
								this.trigger("drag"));
					}, this)
				));
		}),
		(e.prototype.onDragMove = function (a) {
			var b = null,
				c = null,
				d = null,
				e = this.difference(this._drag.pointer, this.pointer(a)),
				f = this.difference(this._drag.stage.start, e);
			this.is("dragging") &&
				(a.preventDefault(),
				this.settings.loop
					? ((b = this.coordinates(this.minimum())),
					  (c = this.coordinates(this.maximum() + 1) - b),
					  (f.x = ((((f.x - b) % c) + c) % c) + b))
					: ((b = this.settings.rtl
							? this.coordinates(this.maximum())
							: this.coordinates(this.minimum())),
					  (c = this.settings.rtl
							? this.coordinates(this.minimum())
							: this.coordinates(this.maximum())),
					  (d = this.settings.pullDrag ? (-1 * e.x) / 5 : 0),
					  (f.x = Math.max(Math.min(f.x, b + d), c + d))),
				(this._drag.stage.current = f),
				this.animate(f.x));
		}),
		(e.prototype.onDragEnd = function (b) {
			var d = this.difference(this._drag.pointer, this.pointer(b)),
				e = this._drag.stage.current,
				f = (d.x > 0) ^ this.settings.rtl ? "left" : "right";
			a(c).off(".owl.core"),
				this.$element.removeClass(this.options.grabClass),
				((0 !== d.x && this.is("dragging")) || !this.is("valid")) &&
					(this.speed(this.settings.dragEndSpeed || this.settings.smartSpeed),
					this.current(this.closest(e.x, 0 !== d.x ? f : this._drag.direction)),
					this.invalidate("position"),
					this.update(),
					(this._drag.direction = f),
					(Math.abs(d.x) > 3 || new Date().getTime() - this._drag.time > 300) &&
						this._drag.target.one("click.owl.core", function () {
							return !1;
						})),
				this.is("dragging") &&
					(this.leave("dragging"), this.trigger("dragged"));
		}),
		(e.prototype.closest = function (b, c) {
			var e = -1,
				f = 30,
				g = this.width(),
				h = this.coordinates();
			return (
				this.settings.freeDrag ||
					a.each(
						h,
						a.proxy(function (a, i) {
							return (
								"left" === c && b > i - f && b < i + f
									? (e = a)
									: "right" === c && b > i - g - f && b < i - g + f
									? (e = a + 1)
									: this.op(b, "<", i) &&
									  this.op(b, ">", h[a + 1] !== d ? h[a + 1] : i - g) &&
									  (e = "left" === c ? a + 1 : a),
								-1 === e
							);
						}, this)
					),
				this.settings.loop ||
					(this.op(b, ">", h[this.minimum()])
						? (e = b = this.minimum())
						: this.op(b, "<", h[this.maximum()]) && (e = b = this.maximum())),
				e
			);
		}),
		(e.prototype.animate = function (b) {
			var c = this.speed() > 0;
			this.is("animating") && this.onTransitionEnd(),
				c && (this.enter("animating"), this.trigger("translate")),
				a.support.transform3d && a.support.transition
					? this.$stage.css({
							transform: "translate3d(" + b + "px,0px,0px)",
							transition:
								this.speed() / 1e3 +
								"s" +
								(this.settings.slideTransition
									? " " + this.settings.slideTransition
									: ""),
					  })
					: c
					? this.$stage.animate(
							{ left: b + "px" },
							this.speed(),
							this.settings.fallbackEasing,
							a.proxy(this.onTransitionEnd, this)
					  )
					: this.$stage.css({ left: b + "px" });
		}),
		(e.prototype.is = function (a) {
			return this._states.current[a] && this._states.current[a] > 0;
		}),
		(e.prototype.current = function (a) {
			if (a === d) return this._current;
			if (0 === this._items.length) return d;
			if (((a = this.normalize(a)), this._current !== a)) {
				var b = this.trigger("change", {
					property: { name: "position", value: a },
				});
				b.data !== d && (a = this.normalize(b.data)),
					(this._current = a),
					this.invalidate("position"),
					this.trigger("changed", {
						property: { name: "position", value: this._current },
					});
			}
			return this._current;
		}),
		(e.prototype.invalidate = function (b) {
			return (
				"string" === a.type(b) &&
					((this._invalidated[b] = !0),
					this.is("valid") && this.leave("valid")),
				a.map(this._invalidated, function (a, b) {
					return b;
				})
			);
		}),
		(e.prototype.reset = function (a) {
			(a = this.normalize(a)) !== d &&
				((this._speed = 0),
				(this._current = a),
				this.suppress(["translate", "translated"]),
				this.animate(this.coordinates(a)),
				this.release(["translate", "translated"]));
		}),
		(e.prototype.normalize = function (a, b) {
			var c = this._items.length,
				e = b ? 0 : this._clones.length;
			return (
				!this.isNumeric(a) || c < 1
					? (a = d)
					: (a < 0 || a >= c + e) &&
					  (a = ((((a - e / 2) % c) + c) % c) + e / 2),
				a
			);
		}),
		(e.prototype.relative = function (a) {
			return (a -= this._clones.length / 2), this.normalize(a, !0);
		}),
		(e.prototype.maximum = function (a) {
			var b,
				c,
				d,
				e = this.settings,
				f = this._coordinates.length;
			if (e.loop) f = this._clones.length / 2 + this._items.length - 1;
			else if (e.autoWidth || e.merge) {
				if ((b = this._items.length))
					for (
						c = this._items[--b].width(), d = this.$element.width();
						b-- && !((c += this._items[b].width() + this.settings.margin) > d);

					);
				f = b + 1;
			} else
				f = e.center ? this._items.length - 1 : this._items.length - e.items;
			return a && (f -= this._clones.length / 2), Math.max(f, 0);
		}),
		(e.prototype.minimum = function (a) {
			return a ? 0 : this._clones.length / 2;
		}),
		(e.prototype.items = function (a) {
			return a === d
				? this._items.slice()
				: ((a = this.normalize(a, !0)), this._items[a]);
		}),
		(e.prototype.mergers = function (a) {
			return a === d
				? this._mergers.slice()
				: ((a = this.normalize(a, !0)), this._mergers[a]);
		}),
		(e.prototype.clones = function (b) {
			var c = this._clones.length / 2,
				e = c + this._items.length,
				f = function (a) {
					return a % 2 == 0 ? e + a / 2 : c - (a + 1) / 2;
				};
			return b === d
				? a.map(this._clones, function (a, b) {
						return f(b);
				  })
				: a.map(this._clones, function (a, c) {
						return a === b ? f(c) : null;
				  });
		}),
		(e.prototype.speed = function (a) {
			return a !== d && (this._speed = a), this._speed;
		}),
		(e.prototype.coordinates = function (b) {
			var c,
				e = 1,
				f = b - 1;
			return b === d
				? a.map(
						this._coordinates,
						a.proxy(function (a, b) {
							return this.coordinates(b);
						}, this)
				  )
				: (this.settings.center
						? (this.settings.rtl && ((e = -1), (f = b + 1)),
						  (c = this._coordinates[b]),
						  (c += ((this.width() - c + (this._coordinates[f] || 0)) / 2) * e))
						: (c = this._coordinates[f] || 0),
				  (c = Math.ceil(c)));
		}),
		(e.prototype.duration = function (a, b, c) {
			return 0 === c
				? 0
				: Math.min(Math.max(Math.abs(b - a), 1), 6) *
						Math.abs(c || this.settings.smartSpeed);
		}),
		(e.prototype.to = function (a, b) {
			var c = this.current(),
				d = null,
				e = a - this.relative(c),
				f = (e > 0) - (e < 0),
				g = this._items.length,
				h = this.minimum(),
				i = this.maximum();
			this.settings.loop
				? (!this.settings.rewind && Math.abs(e) > g / 2 && (e += -1 * f * g),
				  (a = c + e),
				  (d = ((((a - h) % g) + g) % g) + h) !== a &&
						d - e <= i &&
						d - e > 0 &&
						((c = d - e), (a = d), this.reset(c)))
				: this.settings.rewind
				? ((i += 1), (a = ((a % i) + i) % i))
				: (a = Math.max(h, Math.min(i, a))),
				this.speed(this.duration(c, a, b)),
				this.current(a),
				this.isVisible() && this.update();
		}),
		(e.prototype.next = function (a) {
			(a = a || !1), this.to(this.relative(this.current()) + 1, a);
		}),
		(e.prototype.prev = function (a) {
			(a = a || !1), this.to(this.relative(this.current()) - 1, a);
		}),
		(e.prototype.onTransitionEnd = function (a) {
			if (
				a !== d &&
				(a.stopPropagation(),
				(a.target || a.srcElement || a.originalTarget) !== this.$stage.get(0))
			)
				return !1;
			this.leave("animating"), this.trigger("translated");
		}),
		(e.prototype.viewport = function () {
			var d;
			return (
				this.options.responsiveBaseElement !== b
					? (d = a(this.options.responsiveBaseElement).width())
					: b.innerWidth
					? (d = b.innerWidth)
					: c.documentElement && c.documentElement.clientWidth
					? (d = c.documentElement.clientWidth)
					: console.warn("Can not detect viewport width."),
				d
			);
		}),
		(e.prototype.replace = function (b) {
			this.$stage.empty(),
				(this._items = []),
				b && (b = b instanceof jQuery ? b : a(b)),
				this.settings.nestedItemSelector &&
					(b = b.find("." + this.settings.nestedItemSelector)),
				b
					.filter(function () {
						return 1 === this.nodeType;
					})
					.each(
						a.proxy(function (a, b) {
							(b = this.prepare(b)),
								this.$stage.append(b),
								this._items.push(b),
								this._mergers.push(
									1 *
										b
											.find("[data-merge]")
											.addBack("[data-merge]")
											.attr("data-merge") || 1
								);
						}, this)
					),
				this.reset(
					this.isNumeric(this.settings.startPosition)
						? this.settings.startPosition
						: 0
				),
				this.invalidate("items");
		}),
		(e.prototype.add = function (b, c) {
			var e = this.relative(this._current);
			(c = c === d ? this._items.length : this.normalize(c, !0)),
				(b = b instanceof jQuery ? b : a(b)),
				this.trigger("add", { content: b, position: c }),
				(b = this.prepare(b)),
				0 === this._items.length || c === this._items.length
					? (0 === this._items.length && this.$stage.append(b),
					  0 !== this._items.length && this._items[c - 1].after(b),
					  this._items.push(b),
					  this._mergers.push(
							1 *
								b
									.find("[data-merge]")
									.addBack("[data-merge]")
									.attr("data-merge") || 1
					  ))
					: (this._items[c].before(b),
					  this._items.splice(c, 0, b),
					  this._mergers.splice(
							c,
							0,
							1 *
								b
									.find("[data-merge]")
									.addBack("[data-merge]")
									.attr("data-merge") || 1
					  )),
				this._items[e] && this.reset(this._items[e].index()),
				this.invalidate("items"),
				this.trigger("added", { content: b, position: c });
		}),
		(e.prototype.remove = function (a) {
			(a = this.normalize(a, !0)) !== d &&
				(this.trigger("remove", { content: this._items[a], position: a }),
				this._items[a].remove(),
				this._items.splice(a, 1),
				this._mergers.splice(a, 1),
				this.invalidate("items"),
				this.trigger("removed", { content: null, position: a }));
		}),
		(e.prototype.preloadAutoWidthImages = function (b) {
			b.each(
				a.proxy(function (b, c) {
					this.enter("pre-loading"),
						(c = a(c)),
						a(new Image())
							.one(
								"load",
								a.proxy(function (a) {
									c.attr("src", a.target.src),
										c.css("opacity", 1),
										this.leave("pre-loading"),
										!this.is("pre-loading") &&
											!this.is("initializing") &&
											this.refresh();
								}, this)
							)
							.attr(
								"src",
								c.attr("src") || c.attr("data-src") || c.attr("data-src-retina")
							);
				}, this)
			);
		}),
		(e.prototype.destroy = function () {
			this.$element.off(".owl.core"),
				this.$stage.off(".owl.core"),
				a(c).off(".owl.core"),
				!1 !== this.settings.responsive &&
					(b.clearTimeout(this.resizeTimer),
					this.off(b, "resize", this._handlers.onThrottledResize));
			for (var d in this._plugins) this._plugins[d].destroy();
			this.$stage.children(".cloned").remove(),
				this.$stage.unwrap(),
				this.$stage.children().contents().unwrap(),
				this.$stage.children().unwrap(),
				this.$stage.remove(),
				this.$element
					.removeClass(this.options.refreshClass)
					.removeClass(this.options.loadingClass)
					.removeClass(this.options.loadedClass)
					.removeClass(this.options.rtlClass)
					.removeClass(this.options.dragClass)
					.removeClass(this.options.grabClass)
					.attr(
						"class",
						this.$element
							.attr("class")
							.replace(
								new RegExp(this.options.responsiveClass + "-\\S+\\s", "g"),
								""
							)
					)
					.removeData("owl.carousel");
		}),
		(e.prototype.op = function (a, b, c) {
			var d = this.settings.rtl;
			switch (b) {
				case "<":
					return d ? a > c : a < c;
				case ">":
					return d ? a < c : a > c;
				case ">=":
					return d ? a <= c : a >= c;
				case "<=":
					return d ? a >= c : a <= c;
			}
		}),
		(e.prototype.on = function (a, b, c, d) {
			a.addEventListener
				? a.addEventListener(b, c, d)
				: a.attachEvent && a.attachEvent("on" + b, c);
		}),
		(e.prototype.off = function (a, b, c, d) {
			a.removeEventListener
				? a.removeEventListener(b, c, d)
				: a.detachEvent && a.detachEvent("on" + b, c);
		}),
		(e.prototype.trigger = function (b, c, d, f, g) {
			var h = { item: { count: this._items.length, index: this.current() } },
				i = a.camelCase(
					a
						.grep(["on", b, d], function (a) {
							return a;
						})
						.join("-")
						.toLowerCase()
				),
				j = a.Event(
					[b, "owl", d || "carousel"].join(".").toLowerCase(),
					a.extend({ relatedTarget: this }, h, c)
				);
			return (
				this._supress[b] ||
					(a.each(this._plugins, function (a, b) {
						b.onTrigger && b.onTrigger(j);
					}),
					this.register({ type: e.Type.Event, name: b }),
					this.$element.trigger(j),
					this.settings &&
						"function" == typeof this.settings[i] &&
						this.settings[i].call(this, j)),
				j
			);
		}),
		(e.prototype.enter = function (b) {
			a.each(
				[b].concat(this._states.tags[b] || []),
				a.proxy(function (a, b) {
					this._states.current[b] === d && (this._states.current[b] = 0),
						this._states.current[b]++;
				}, this)
			);
		}),
		(e.prototype.leave = function (b) {
			a.each(
				[b].concat(this._states.tags[b] || []),
				a.proxy(function (a, b) {
					this._states.current[b]--;
				}, this)
			);
		}),
		(e.prototype.register = function (b) {
			if (b.type === e.Type.Event) {
				if (
					(a.event.special[b.name] || (a.event.special[b.name] = {}),
					!a.event.special[b.name].owl)
				) {
					var c = a.event.special[b.name]._default;
					(a.event.special[b.name]._default = function (a) {
						return !c ||
							!c.apply ||
							(a.namespace && -1 !== a.namespace.indexOf("owl"))
							? a.namespace && a.namespace.indexOf("owl") > -1
							: c.apply(this, arguments);
					}),
						(a.event.special[b.name].owl = !0);
				}
			} else
				b.type === e.Type.State &&
					(this._states.tags[b.name]
						? (this._states.tags[b.name] = this._states.tags[b.name].concat(
								b.tags
						  ))
						: (this._states.tags[b.name] = b.tags),
					(this._states.tags[b.name] = a.grep(
						this._states.tags[b.name],
						a.proxy(function (c, d) {
							return a.inArray(c, this._states.tags[b.name]) === d;
						}, this)
					)));
		}),
		(e.prototype.suppress = function (b) {
			a.each(
				b,
				a.proxy(function (a, b) {
					this._supress[b] = !0;
				}, this)
			);
		}),
		(e.prototype.release = function (b) {
			a.each(
				b,
				a.proxy(function (a, b) {
					delete this._supress[b];
				}, this)
			);
		}),
		(e.prototype.pointer = function (a) {
			var c = { x: null, y: null };
			return (
				(a = a.originalEvent || a || b.event),
				(a =
					a.touches && a.touches.length
						? a.touches[0]
						: a.changedTouches && a.changedTouches.length
						? a.changedTouches[0]
						: a),
				a.pageX
					? ((c.x = a.pageX), (c.y = a.pageY))
					: ((c.x = a.clientX), (c.y = a.clientY)),
				c
			);
		}),
		(e.prototype.isNumeric = function (a) {
			return !isNaN(parseFloat(a));
		}),
		(e.prototype.difference = function (a, b) {
			return { x: a.x - b.x, y: a.y - b.y };
		}),
		(a.fn.owlCarousel = function (b) {
			var c = Array.prototype.slice.call(arguments, 1);
			return this.each(function () {
				var d = a(this),
					f = d.data("owl.carousel");
				f ||
					((f = new e(this, "object" == typeof b && b)),
					d.data("owl.carousel", f),
					a.each(
						[
							"next",
							"prev",
							"to",
							"destroy",
							"refresh",
							"replace",
							"add",
							"remove",
						],
						function (b, c) {
							f.register({ type: e.Type.Event, name: c }),
								f.$element.on(
									c + ".owl.carousel.core",
									a.proxy(function (a) {
										a.namespace &&
											a.relatedTarget !== this &&
											(this.suppress([c]),
											f[c].apply(this, [].slice.call(arguments, 1)),
											this.release([c]));
									}, f)
								);
						}
					)),
					"string" == typeof b && "_" !== b.charAt(0) && f[b].apply(f, c);
			});
		}),
		(a.fn.owlCarousel.Constructor = e);
})(window.Zepto || window.jQuery, window, document),
	(function (a, b, c, d) {
		var e = function (b) {
			(this._core = b),
				(this._interval = null),
				(this._visible = null),
				(this._handlers = {
					"initialized.owl.carousel": a.proxy(function (a) {
						a.namespace && this._core.settings.autoRefresh && this.watch();
					}, this),
				}),
				(this._core.options = a.extend({}, e.Defaults, this._core.options)),
				this._core.$element.on(this._handlers);
		};
		(e.Defaults = { autoRefresh: !0, autoRefreshInterval: 500 }),
			(e.prototype.watch = function () {
				this._interval ||
					((this._visible = this._core.isVisible()),
					(this._interval = b.setInterval(
						a.proxy(this.refresh, this),
						this._core.settings.autoRefreshInterval
					)));
			}),
			(e.prototype.refresh = function () {
				this._core.isVisible() !== this._visible &&
					((this._visible = !this._visible),
					this._core.$element.toggleClass("owl-hidden", !this._visible),
					this._visible &&
						this._core.invalidate("width") &&
						this._core.refresh());
			}),
			(e.prototype.destroy = function () {
				var a, c;
				b.clearInterval(this._interval);
				for (a in this._handlers) this._core.$element.off(a, this._handlers[a]);
				for (c in Object.getOwnPropertyNames(this))
					"function" != typeof this[c] && (this[c] = null);
			}),
			(a.fn.owlCarousel.Constructor.Plugins.AutoRefresh = e);
	})(window.Zepto || window.jQuery, window, document),
	(function (a, b, c, d) {
		var e = function (b) {
			(this._core = b),
				(this._loaded = []),
				(this._handlers = {
					"initialized.owl.carousel change.owl.carousel resized.owl.carousel": a.proxy(
						function (b) {
							if (
								b.namespace &&
								this._core.settings &&
								this._core.settings.lazyLoad &&
								((b.property && "position" == b.property.name) ||
									"initialized" == b.type)
							) {
								var c = this._core.settings,
									e = (c.center && Math.ceil(c.items / 2)) || c.items,
									f = (c.center && -1 * e) || 0,
									g =
										(b.property && b.property.value !== d
											? b.property.value
											: this._core.current()) + f,
									h = this._core.clones().length,
									i = a.proxy(function (a, b) {
										this.load(b);
									}, this);
								for (
									c.lazyLoadEager > 0 &&
									((e += c.lazyLoadEager),
									c.loop && ((g -= c.lazyLoadEager), e++));
									f++ < e;

								)
									this.load(h / 2 + this._core.relative(g)),
										h && a.each(this._core.clones(this._core.relative(g)), i),
										g++;
							}
						},
						this
					),
				}),
				(this._core.options = a.extend({}, e.Defaults, this._core.options)),
				this._core.$element.on(this._handlers);
		};
		(e.Defaults = { lazyLoad: !1, lazyLoadEager: 0 }),
			(e.prototype.load = function (c) {
				var d = this._core.$stage.children().eq(c),
					e = d && d.find(".owl-lazy");
				!e ||
					a.inArray(d.get(0), this._loaded) > -1 ||
					(e.each(
						a.proxy(function (c, d) {
							var e,
								f = a(d),
								g =
									(b.devicePixelRatio > 1 && f.attr("data-src-retina")) ||
									f.attr("data-src") ||
									f.attr("data-srcset");
							this._core.trigger("load", { element: f, url: g }, "lazy"),
								f.is("img")
									? f
											.one(
												"load.owl.lazy",
												a.proxy(function () {
													f.css("opacity", 1),
														this._core.trigger(
															"loaded",
															{ element: f, url: g },
															"lazy"
														);
												}, this)
											)
											.attr("src", g)
									: f.is("source")
									? f
											.one(
												"load.owl.lazy",
												a.proxy(function () {
													this._core.trigger(
														"loaded",
														{ element: f, url: g },
														"lazy"
													);
												}, this)
											)
											.attr("srcset", g)
									: ((e = new Image()),
									  (e.onload = a.proxy(function () {
											f.css({
												"background-image": 'url("' + g + '")',
												opacity: "1",
											}),
												this._core.trigger(
													"loaded",
													{ element: f, url: g },
													"lazy"
												);
									  }, this)),
									  (e.src = g));
						}, this)
					),
					this._loaded.push(d.get(0)));
			}),
			(e.prototype.destroy = function () {
				var a, b;
				for (a in this.handlers) this._core.$element.off(a, this.handlers[a]);
				for (b in Object.getOwnPropertyNames(this))
					"function" != typeof this[b] && (this[b] = null);
			}),
			(a.fn.owlCarousel.Constructor.Plugins.Lazy = e);
	})(window.Zepto || window.jQuery, window, document),
	(function (a, b, c, d) {
		var e = function (c) {
			(this._core = c),
				(this._previousHeight = null),
				(this._handlers = {
					"initialized.owl.carousel refreshed.owl.carousel": a.proxy(function (
						a
					) {
						a.namespace && this._core.settings.autoHeight && this.update();
					},
					this),
					"changed.owl.carousel": a.proxy(function (a) {
						a.namespace &&
							this._core.settings.autoHeight &&
							"position" === a.property.name &&
							this.update();
					}, this),
					"loaded.owl.lazy": a.proxy(function (a) {
						a.namespace &&
							this._core.settings.autoHeight &&
							a.element.closest("." + this._core.settings.itemClass).index() ===
								this._core.current() &&
							this.update();
					}, this),
				}),
				(this._core.options = a.extend({}, e.Defaults, this._core.options)),
				this._core.$element.on(this._handlers),
				(this._intervalId = null);
			var d = this;
			a(b).on("load", function () {
				d._core.settings.autoHeight && d.update();
			}),
				a(b).resize(function () {
					d._core.settings.autoHeight &&
						(null != d._intervalId && clearTimeout(d._intervalId),
						(d._intervalId = setTimeout(function () {
							d.update();
						}, 250)));
				});
		};
		(e.Defaults = { autoHeight: !1, autoHeightClass: "owl-height" }),
			(e.prototype.update = function () {
				var b = this._core._current,
					c = b + this._core.settings.items,
					d = this._core.settings.lazyLoad,
					e = this._core.$stage.children().toArray().slice(b, c),
					f = [],
					g = 0;
				a.each(e, function (b, c) {
					f.push(a(c).height());
				}),
					(g = Math.max.apply(null, f)),
					g <= 1 && d && this._previousHeight && (g = this._previousHeight),
					(this._previousHeight = g),
					this._core.$stage
						.parent()
						.height(g)
						.addClass(this._core.settings.autoHeightClass);
			}),
			(e.prototype.destroy = function () {
				var a, b;
				for (a in this._handlers) this._core.$element.off(a, this._handlers[a]);
				for (b in Object.getOwnPropertyNames(this))
					"function" != typeof this[b] && (this[b] = null);
			}),
			(a.fn.owlCarousel.Constructor.Plugins.AutoHeight = e);
	})(window.Zepto || window.jQuery, window, document),
	(function (a, b, c, d) {
		var e = function (b) {
			(this._core = b),
				(this._videos = {}),
				(this._playing = null),
				(this._handlers = {
					"initialized.owl.carousel": a.proxy(function (a) {
						a.namespace &&
							this._core.register({
								type: "state",
								name: "playing",
								tags: ["interacting"],
							});
					}, this),
					"resize.owl.carousel": a.proxy(function (a) {
						a.namespace &&
							this._core.settings.video &&
							this.isInFullScreen() &&
							a.preventDefault();
					}, this),
					"refreshed.owl.carousel": a.proxy(function (a) {
						a.namespace &&
							this._core.is("resizing") &&
							this._core.$stage.find(".cloned .owl-video-frame").remove();
					}, this),
					"changed.owl.carousel": a.proxy(function (a) {
						a.namespace &&
							"position" === a.property.name &&
							this._playing &&
							this.stop();
					}, this),
					"prepared.owl.carousel": a.proxy(function (b) {
						if (b.namespace) {
							var c = a(b.content).find(".owl-video");
							c.length &&
								(c.css("display", "none"), this.fetch(c, a(b.content)));
						}
					}, this),
				}),
				(this._core.options = a.extend({}, e.Defaults, this._core.options)),
				this._core.$element.on(this._handlers),
				this._core.$element.on(
					"click.owl.video",
					".owl-video-play-icon",
					a.proxy(function (a) {
						this.play(a);
					}, this)
				);
		};
		(e.Defaults = { video: !1, videoHeight: !1, videoWidth: !1 }),
			(e.prototype.fetch = function (a, b) {
				var c = (function () {
						return a.attr("data-vimeo-id")
							? "vimeo"
							: a.attr("data-vzaar-id")
							? "vzaar"
							: "youtube";
					})(),
					d =
						a.attr("data-vimeo-id") ||
						a.attr("data-youtube-id") ||
						a.attr("data-vzaar-id"),
					e = a.attr("data-width") || this._core.settings.videoWidth,
					f = a.attr("data-height") || this._core.settings.videoHeight,
					g = a.attr("href");
				if (!g) throw new Error("Missing video URL.");
				if (
					((d = g.match(
						/(http:|https:|)\/\/(player.|www.|app.)?(vimeo\.com|youtu(be\.com|\.be|be\.googleapis\.com|be\-nocookie\.com)|vzaar\.com)\/(video\/|videos\/|embed\/|channels\/.+\/|groups\/.+\/|watch\?v=|v\/)?([A-Za-z0-9._%-]*)(\&\S+)?/
					)),
					d[3].indexOf("youtu") > -1)
				)
					c = "youtube";
				else if (d[3].indexOf("vimeo") > -1) c = "vimeo";
				else {
					if (!(d[3].indexOf("vzaar") > -1))
						throw new Error("Video URL not supported.");
					c = "vzaar";
				}
				(d = d[6]),
					(this._videos[g] = { type: c, id: d, width: e, height: f }),
					b.attr("data-video", g),
					this.thumbnail(a, this._videos[g]);
			}),
			(e.prototype.thumbnail = function (b, c) {
				var d,
					e,
					f,
					g =
						c.width && c.height
							? "width:" + c.width + "px;height:" + c.height + "px;"
							: "",
					h = b.find("img"),
					i = "src",
					j = "",
					k = this._core.settings,
					l = function (c) {
						(e = '<div class="owl-video-play-icon"></div>'),
							(d = k.lazyLoad
								? a("<div/>", { class: "owl-video-tn " + j, srcType: c })
								: a("<div/>", {
										class: "owl-video-tn",
										style: "opacity:1;background-image:url(" + c + ")",
								  })),
							b.after(d),
							b.after(e);
					};
				if (
					(b.wrap(a("<div/>", { class: "owl-video-wrapper", style: g })),
					this._core.settings.lazyLoad && ((i = "data-src"), (j = "owl-lazy")),
					h.length)
				)
					return l(h.attr(i)), h.remove(), !1;
				"youtube" === c.type
					? ((f = "//img.youtube.com/vi/" + c.id + "/hqdefault.jpg"), l(f))
					: "vimeo" === c.type
					? a.ajax({
							type: "GET",
							url: "//vimeo.com/api/v2/video/" + c.id + ".json",
							jsonp: "callback",
							dataType: "jsonp",
							success: function (a) {
								(f = a[0].thumbnail_large), l(f);
							},
					  })
					: "vzaar" === c.type &&
					  a.ajax({
							type: "GET",
							url: "//vzaar.com/api/videos/" + c.id + ".json",
							jsonp: "callback",
							dataType: "jsonp",
							success: function (a) {
								(f = a.framegrab_url), l(f);
							},
					  });
			}),
			(e.prototype.stop = function () {
				this._core.trigger("stop", null, "video"),
					this._playing.find(".owl-video-frame").remove(),
					this._playing.removeClass("owl-video-playing"),
					(this._playing = null),
					this._core.leave("playing"),
					this._core.trigger("stopped", null, "video");
			}),
			(e.prototype.play = function (b) {
				var c,
					d = a(b.target),
					e = d.closest("." + this._core.settings.itemClass),
					f = this._videos[e.attr("data-video")],
					g = f.width || "100%",
					h = f.height || this._core.$stage.height();
				this._playing ||
					(this._core.enter("playing"),
					this._core.trigger("play", null, "video"),
					(e = this._core.items(this._core.relative(e.index()))),
					this._core.reset(e.index()),
					(c = a(
						'<iframe frameborder="0" allowfullscreen mozallowfullscreen webkitAllowFullScreen ></iframe>'
					)),
					c.attr("height", h),
					c.attr("width", g),
					"youtube" === f.type
						? c.attr(
								"src",
								"//www.youtube.com/embed/" +
									f.id +
									"?autoplay=1&rel=0&v=" +
									f.id
						  )
						: "vimeo" === f.type
						? c.attr("src", "//player.vimeo.com/video/" + f.id + "?autoplay=1")
						: "vzaar" === f.type &&
						  c.attr(
								"src",
								"//view.vzaar.com/" + f.id + "/player?autoplay=true"
						  ),
					a(c)
						.wrap('<div class="owl-video-frame" />')
						.insertAfter(e.find(".owl-video")),
					(this._playing = e.addClass("owl-video-playing")));
			}),
			(e.prototype.isInFullScreen = function () {
				var b =
					c.fullscreenElement ||
					c.mozFullScreenElement ||
					c.webkitFullscreenElement;
				return b && a(b).parent().hasClass("owl-video-frame");
			}),
			(e.prototype.destroy = function () {
				var a, b;
				this._core.$element.off("click.owl.video");
				for (a in this._handlers) this._core.$element.off(a, this._handlers[a]);
				for (b in Object.getOwnPropertyNames(this))
					"function" != typeof this[b] && (this[b] = null);
			}),
			(a.fn.owlCarousel.Constructor.Plugins.Video = e);
	})(window.Zepto || window.jQuery, window, document),
	(function (a, b, c, d) {
		var e = function (b) {
			(this.core = b),
				(this.core.options = a.extend({}, e.Defaults, this.core.options)),
				(this.swapping = !0),
				(this.previous = d),
				(this.next = d),
				(this.handlers = {
					"change.owl.carousel": a.proxy(function (a) {
						a.namespace &&
							"position" == a.property.name &&
							((this.previous = this.core.current()),
							(this.next = a.property.value));
					}, this),
					"drag.owl.carousel dragged.owl.carousel translated.owl.carousel": a.proxy(
						function (a) {
							a.namespace && (this.swapping = "translated" == a.type);
						},
						this
					),
					"translate.owl.carousel": a.proxy(function (a) {
						a.namespace &&
							this.swapping &&
							(this.core.options.animateOut || this.core.options.animateIn) &&
							this.swap();
					}, this),
				}),
				this.core.$element.on(this.handlers);
		};
		(e.Defaults = { animateOut: !1, animateIn: !1 }),
			(e.prototype.swap = function () {
				if (
					1 === this.core.settings.items &&
					a.support.animation &&
					a.support.transition
				) {
					this.core.speed(0);
					var b,
						c = a.proxy(this.clear, this),
						d = this.core.$stage.children().eq(this.previous),
						e = this.core.$stage.children().eq(this.next),
						f = this.core.settings.animateIn,
						g = this.core.settings.animateOut;
					this.core.current() !== this.previous &&
						(g &&
							((b =
								this.core.coordinates(this.previous) -
								this.core.coordinates(this.next)),
							d
								.one(a.support.animation.end, c)
								.css({ left: b + "px" })
								.addClass("animated owl-animated-out")
								.addClass(g)),
						f &&
							e
								.one(a.support.animation.end, c)
								.addClass("animated owl-animated-in")
								.addClass(f));
				}
			}),
			(e.prototype.clear = function (b) {
				a(b.target)
					.css({ left: "" })
					.removeClass("animated owl-animated-out owl-animated-in")
					.removeClass(this.core.settings.animateIn)
					.removeClass(this.core.settings.animateOut),
					this.core.onTransitionEnd();
			}),
			(e.prototype.destroy = function () {
				var a, b;
				for (a in this.handlers) this.core.$element.off(a, this.handlers[a]);
				for (b in Object.getOwnPropertyNames(this))
					"function" != typeof this[b] && (this[b] = null);
			}),
			(a.fn.owlCarousel.Constructor.Plugins.Animate = e);
	})(window.Zepto || window.jQuery, window, document),
	(function (a, b, c, d) {
		var e = function (b) {
			(this._core = b),
				(this._call = null),
				(this._time = 0),
				(this._timeout = 0),
				(this._paused = !0),
				(this._handlers = {
					"changed.owl.carousel": a.proxy(function (a) {
						a.namespace && "settings" === a.property.name
							? this._core.settings.autoplay
								? this.play()
								: this.stop()
							: a.namespace &&
							  "position" === a.property.name &&
							  this._paused &&
							  (this._time = 0);
					}, this),
					"initialized.owl.carousel": a.proxy(function (a) {
						a.namespace && this._core.settings.autoplay && this.play();
					}, this),
					"play.owl.autoplay": a.proxy(function (a, b, c) {
						a.namespace && this.play(b, c);
					}, this),
					"stop.owl.autoplay": a.proxy(function (a) {
						a.namespace && this.stop();
					}, this),
					"mouseover.owl.autoplay": a.proxy(function () {
						this._core.settings.autoplayHoverPause &&
							this._core.is("rotating") &&
							this.pause();
					}, this),
					"mouseleave.owl.autoplay": a.proxy(function () {
						this._core.settings.autoplayHoverPause &&
							this._core.is("rotating") &&
							this.play();
					}, this),
					"touchstart.owl.core": a.proxy(function () {
						this._core.settings.autoplayHoverPause &&
							this._core.is("rotating") &&
							this.pause();
					}, this),
					"touchend.owl.core": a.proxy(function () {
						this._core.settings.autoplayHoverPause && this.play();
					}, this),
				}),
				this._core.$element.on(this._handlers),
				(this._core.options = a.extend({}, e.Defaults, this._core.options));
		};
		(e.Defaults = {
			autoplay: !1,
			autoplayTimeout: 5e3,
			autoplayHoverPause: !1,
			autoplaySpeed: !1,
		}),
			(e.prototype._next = function (d) {
				(this._call = b.setTimeout(
					a.proxy(this._next, this, d),
					this._timeout * (Math.round(this.read() / this._timeout) + 1) -
						this.read()
				)),
					this._core.is("interacting") ||
						c.hidden ||
						this._core.next(d || this._core.settings.autoplaySpeed);
			}),
			(e.prototype.read = function () {
				return new Date().getTime() - this._time;
			}),
			(e.prototype.play = function (c, d) {
				var e;
				this._core.is("rotating") || this._core.enter("rotating"),
					(c = c || this._core.settings.autoplayTimeout),
					(e = Math.min(this._time % (this._timeout || c), c)),
					this._paused
						? ((this._time = this.read()), (this._paused = !1))
						: b.clearTimeout(this._call),
					(this._time += (this.read() % c) - e),
					(this._timeout = c),
					(this._call = b.setTimeout(a.proxy(this._next, this, d), c - e));
			}),
			(e.prototype.stop = function () {
				this._core.is("rotating") &&
					((this._time = 0),
					(this._paused = !0),
					b.clearTimeout(this._call),
					this._core.leave("rotating"));
			}),
			(e.prototype.pause = function () {
				this._core.is("rotating") &&
					!this._paused &&
					((this._time = this.read()),
					(this._paused = !0),
					b.clearTimeout(this._call));
			}),
			(e.prototype.destroy = function () {
				var a, b;
				this.stop();
				for (a in this._handlers) this._core.$element.off(a, this._handlers[a]);
				for (b in Object.getOwnPropertyNames(this))
					"function" != typeof this[b] && (this[b] = null);
			}),
			(a.fn.owlCarousel.Constructor.Plugins.autoplay = e);
	})(window.Zepto || window.jQuery, window, document),
	(function (a, b, c, d) {
		"use strict";
		var e = function (b) {
			(this._core = b),
				(this._initialized = !1),
				(this._pages = []),
				(this._controls = {}),
				(this._templates = []),
				(this.$element = this._core.$element),
				(this._overrides = {
					next: this._core.next,
					prev: this._core.prev,
					to: this._core.to,
				}),
				(this._handlers = {
					"prepared.owl.carousel": a.proxy(function (b) {
						b.namespace &&
							this._core.settings.dotsData &&
							this._templates.push(
								'<div class="' +
									this._core.settings.dotClass +
									'">' +
									a(b.content)
										.find("[data-dot]")
										.addBack("[data-dot]")
										.attr("data-dot") +
									"</div>"
							);
					}, this),
					"added.owl.carousel": a.proxy(function (a) {
						a.namespace &&
							this._core.settings.dotsData &&
							this._templates.splice(a.position, 0, this._templates.pop());
					}, this),
					"remove.owl.carousel": a.proxy(function (a) {
						a.namespace &&
							this._core.settings.dotsData &&
							this._templates.splice(a.position, 1);
					}, this),
					"changed.owl.carousel": a.proxy(function (a) {
						a.namespace && "position" == a.property.name && this.draw();
					}, this),
					"initialized.owl.carousel": a.proxy(function (a) {
						a.namespace &&
							!this._initialized &&
							(this._core.trigger("initialize", null, "navigation"),
							this.initialize(),
							this.update(),
							this.draw(),
							(this._initialized = !0),
							this._core.trigger("initialized", null, "navigation"));
					}, this),
					"refreshed.owl.carousel": a.proxy(function (a) {
						a.namespace &&
							this._initialized &&
							(this._core.trigger("refresh", null, "navigation"),
							this.update(),
							this.draw(),
							this._core.trigger("refreshed", null, "navigation"));
					}, this),
				}),
				(this._core.options = a.extend({}, e.Defaults, this._core.options)),
				this.$element.on(this._handlers);
		};
		(e.Defaults = {
			nav: !1,
			navText: [
				'<span aria-label="Previous">&#x2039;</span>',
				'<span aria-label="Next">&#x203a;</span>',
			],
			navSpeed: !1,
			navElement: 'button type="button" role="presentation"',
			navContainer: !1,
			navContainerClass: "owl-nav",
			navClass: ["owl-prev", "owl-next"],
			slideBy: 1,
			dotClass: "owl-dot",
			dotsClass: "owl-dots",
			dots: !0,
			dotsEach: !1,
			dotsData: !1,
			dotsSpeed: !1,
			dotsContainer: !1,
		}),
			(e.prototype.initialize = function () {
				var b,
					c = this._core.settings;
				(this._controls.$relative = (c.navContainer
					? a(c.navContainer)
					: a("<div>").addClass(c.navContainerClass).appendTo(this.$element)
				).addClass("disabled")),
					(this._controls.$previous = a("<" + c.navElement + ">")
						.addClass(c.navClass[0])
						.html(c.navText[0])
						.prependTo(this._controls.$relative)
						.on(
							"click",
							a.proxy(function (a) {
								this.prev(c.navSpeed);
							}, this)
						)),
					(this._controls.$next = a("<" + c.navElement + ">")
						.addClass(c.navClass[1])
						.html(c.navText[1])
						.appendTo(this._controls.$relative)
						.on(
							"click",
							a.proxy(function (a) {
								this.next(c.navSpeed);
							}, this)
						)),
					c.dotsData ||
						(this._templates = [
							a('<button role="button">')
								.addClass(c.dotClass)
								.append(a("<span>"))
								.prop("outerHTML"),
						]),
					(this._controls.$absolute = (c.dotsContainer
						? a(c.dotsContainer)
						: a("<div>").addClass(c.dotsClass).appendTo(this.$element)
					).addClass("disabled")),
					this._controls.$absolute.on(
						"click",
						"button",
						a.proxy(function (b) {
							var d = a(b.target).parent().is(this._controls.$absolute)
								? a(b.target).index()
								: a(b.target).parent().index();
							b.preventDefault(), this.to(d, c.dotsSpeed);
						}, this)
					);
				for (b in this._overrides) this._core[b] = a.proxy(this[b], this);
			}),
			(e.prototype.destroy = function () {
				var a, b, c, d, e;
				e = this._core.settings;
				for (a in this._handlers) this.$element.off(a, this._handlers[a]);
				for (b in this._controls)
					"$relative" === b && e.navContainer
						? this._controls[b].html("")
						: this._controls[b].remove();
				for (d in this.overides) this._core[d] = this._overrides[d];
				for (c in Object.getOwnPropertyNames(this))
					"function" != typeof this[c] && (this[c] = null);
			}),
			(e.prototype.update = function () {
				var a,
					b,
					c,
					d = this._core.clones().length / 2,
					e = d + this._core.items().length,
					f = this._core.maximum(!0),
					g = this._core.settings,
					h = g.center || g.autoWidth || g.dotsData ? 1 : g.dotsEach || g.items;
				if (
					("page" !== g.slideBy && (g.slideBy = Math.min(g.slideBy, g.items)),
					g.dots || "page" == g.slideBy)
				)
					for (this._pages = [], a = d, b = 0, c = 0; a < e; a++) {
						if (b >= h || 0 === b) {
							if (
								(this._pages.push({
									start: Math.min(f, a - d),
									end: a - d + h - 1,
								}),
								Math.min(f, a - d) === f)
							)
								break;
							(b = 0), ++c;
						}
						b += this._core.mergers(this._core.relative(a));
					}
			}),
			(e.prototype.draw = function () {
				var b,
					c = this._core.settings,
					d = this._core.items().length <= c.items,
					e = this._core.relative(this._core.current()),
					f = c.loop || c.rewind;
				this._controls.$relative.toggleClass("disabled", !c.nav || d),
					c.nav &&
						(this._controls.$previous.toggleClass(
							"disabled",
							!f && e <= this._core.minimum(!0)
						),
						this._controls.$next.toggleClass(
							"disabled",
							!f && e >= this._core.maximum(!0)
						)),
					this._controls.$absolute.toggleClass("disabled", !c.dots || d),
					c.dots &&
						((b =
							this._pages.length - this._controls.$absolute.children().length),
						c.dotsData && 0 !== b
							? this._controls.$absolute.html(this._templates.join(""))
							: b > 0
							? this._controls.$absolute.append(
									new Array(b + 1).join(this._templates[0])
							  )
							: b < 0 && this._controls.$absolute.children().slice(b).remove(),
						this._controls.$absolute.find(".active").removeClass("active"),
						this._controls.$absolute
							.children()
							.eq(a.inArray(this.current(), this._pages))
							.addClass("active"));
			}),
			(e.prototype.onTrigger = function (b) {
				var c = this._core.settings;
				b.page = {
					index: a.inArray(this.current(), this._pages),
					count: this._pages.length,
					size:
						c &&
						(c.center || c.autoWidth || c.dotsData ? 1 : c.dotsEach || c.items),
				};
			}),
			(e.prototype.current = function () {
				var b = this._core.relative(this._core.current());
				return a
					.grep(
						this._pages,
						a.proxy(function (a, c) {
							return a.start <= b && a.end >= b;
						}, this)
					)
					.pop();
			}),
			(e.prototype.getPosition = function (b) {
				var c,
					d,
					e = this._core.settings;
				return (
					"page" == e.slideBy
						? ((c = a.inArray(this.current(), this._pages)),
						  (d = this._pages.length),
						  b ? ++c : --c,
						  (c = this._pages[((c % d) + d) % d].start))
						: ((c = this._core.relative(this._core.current())),
						  (d = this._core.items().length),
						  b ? (c += e.slideBy) : (c -= e.slideBy)),
					c
				);
			}),
			(e.prototype.next = function (b) {
				a.proxy(this._overrides.to, this._core)(this.getPosition(!0), b);
			}),
			(e.prototype.prev = function (b) {
				a.proxy(this._overrides.to, this._core)(this.getPosition(!1), b);
			}),
			(e.prototype.to = function (b, c, d) {
				var e;
				!d && this._pages.length
					? ((e = this._pages.length),
					  a.proxy(this._overrides.to, this._core)(
							this._pages[((b % e) + e) % e].start,
							c
					  ))
					: a.proxy(this._overrides.to, this._core)(b, c);
			}),
			(a.fn.owlCarousel.Constructor.Plugins.Navigation = e);
	})(window.Zepto || window.jQuery, window, document),
	(function (a, b, c, d) {
		"use strict";
		var e = function (c) {
			(this._core = c),
				(this._hashes = {}),
				(this.$element = this._core.$element),
				(this._handlers = {
					"initialized.owl.carousel": a.proxy(function (c) {
						c.namespace &&
							"URLHash" === this._core.settings.startPosition &&
							a(b).trigger("hashchange.owl.navigation");
					}, this),
					"prepared.owl.carousel": a.proxy(function (b) {
						if (b.namespace) {
							var c = a(b.content)
								.find("[data-hash]")
								.addBack("[data-hash]")
								.attr("data-hash");
							if (!c) return;
							this._hashes[c] = b.content;
						}
					}, this),
					"changed.owl.carousel": a.proxy(function (c) {
						if (c.namespace && "position" === c.property.name) {
							var d = this._core.items(
									this._core.relative(this._core.current())
								),
								e = a
									.map(this._hashes, function (a, b) {
										return a === d ? b : null;
									})
									.join();
							if (!e || b.location.hash.slice(1) === e) return;
							b.location.hash = e;
						}
					}, this),
				}),
				(this._core.options = a.extend({}, e.Defaults, this._core.options)),
				this.$element.on(this._handlers),
				a(b).on(
					"hashchange.owl.navigation",
					a.proxy(function (a) {
						var c = b.location.hash.substring(1),
							e = this._core.$stage.children(),
							f = this._hashes[c] && e.index(this._hashes[c]);
						f !== d &&
							f !== this._core.current() &&
							this._core.to(this._core.relative(f), !1, !0);
					}, this)
				);
		};
		(e.Defaults = { URLhashListener: !1 }),
			(e.prototype.destroy = function () {
				var c, d;
				a(b).off("hashchange.owl.navigation");
				for (c in this._handlers) this._core.$element.off(c, this._handlers[c]);
				for (d in Object.getOwnPropertyNames(this))
					"function" != typeof this[d] && (this[d] = null);
			}),
			(a.fn.owlCarousel.Constructor.Plugins.Hash = e);
	})(window.Zepto || window.jQuery, window, document),
	(function (a, b, c, d) {
		function e(b, c) {
			var e = !1,
				f = b.charAt(0).toUpperCase() + b.slice(1);
			return (
				a.each((b + " " + h.join(f + " ") + f).split(" "), function (a, b) {
					if (g[b] !== d) return (e = !c || b), !1;
				}),
				e
			);
		}
		function f(a) {
			return e(a, !0);
		}
		var g = a("<support>").get(0).style,
			h = "Webkit Moz O ms".split(" "),
			i = {
				transition: {
					end: {
						WebkitTransition: "webkitTransitionEnd",
						MozTransition: "transitionend",
						OTransition: "oTransitionEnd",
						transition: "transitionend",
					},
				},
				animation: {
					end: {
						WebkitAnimation: "webkitAnimationEnd",
						MozAnimation: "animationend",
						OAnimation: "oAnimationEnd",
						animation: "animationend",
					},
				},
			},
			j = {
				csstransforms: function () {
					return !!e("transform");
				},
				csstransforms3d: function () {
					return !!e("perspective");
				},
				csstransitions: function () {
					return !!e("transition");
				},
				cssanimations: function () {
					return !!e("animation");
				},
			};
		j.csstransitions() &&
			((a.support.transition = new String(f("transition"))),
			(a.support.transition.end = i.transition.end[a.support.transition])),
			j.cssanimations() &&
				((a.support.animation = new String(f("animation"))),
				(a.support.animation.end = i.animation.end[a.support.animation])),
			j.csstransforms() &&
				((a.support.transform = new String(f("transform"))),
				(a.support.transform3d = j.csstransforms3d()));
	})(window.Zepto || window.jQuery, window, document);

// ISOTOPE

!(function (a) {
	function b() {}
	function c(a) {
		function c(b) {
			b.prototype.option ||
				(b.prototype.option = function (b) {
					a.isPlainObject(b) && (this.options = a.extend(!0, this.options, b));
				});
		}
		function e(b, c) {
			a.fn[b] = function (e) {
				if ("string" == typeof e) {
					for (
						var g = d.call(arguments, 1), h = 0, i = this.length;
						i > h;
						h++
					) {
						var j = this[h],
							k = a.data(j, b);
						if (k)
							if (a.isFunction(k[e]) && "_" !== e.charAt(0)) {
								var l = k[e].apply(k, g);
								if (void 0 !== l) return l;
							} else f("no such method '" + e + "' for " + b + " instance");
						else
							f(
								"cannot call methods on " +
									b +
									" prior to initialization; attempted to call '" +
									e +
									"'"
							);
					}
					return this;
				}
				return this.each(function () {
					var d = a.data(this, b);
					d
						? (d.option(e), d._init())
						: ((d = new c(this, e)), a.data(this, b, d));
				});
			};
		}
		if (a) {
			var f =
				"undefined" == typeof console
					? b
					: function (a) {
							console.error(a);
					  };
			return (
				(a.bridget = function (a, b) {
					c(b), e(a, b);
				}),
				a.bridget
			);
		}
	}
	var d = Array.prototype.slice;
	"function" == typeof define && define.amd
		? define("jquery-bridget/jquery.bridget", ["jquery"], c)
		: c("object" == typeof exports ? require("jquery") : a.jQuery);
})(window),
	(function (a) {
		function b(b) {
			var c = a.event;
			return (c.target = c.target || c.srcElement || b), c;
		}
		var c = document.documentElement,
			d = function () {};
		c.addEventListener
			? (d = function (a, b, c) {
					a.addEventListener(b, c, !1);
			  })
			: c.attachEvent &&
			  (d = function (a, c, d) {
					(a[c + d] = d.handleEvent
						? function () {
								var c = b(a);
								d.handleEvent.call(d, c);
						  }
						: function () {
								var c = b(a);
								d.call(a, c);
						  }),
						a.attachEvent("on" + c, a[c + d]);
			  });
		var e = function () {};
		c.removeEventListener
			? (e = function (a, b, c) {
					a.removeEventListener(b, c, !1);
			  })
			: c.detachEvent &&
			  (e = function (a, b, c) {
					a.detachEvent("on" + b, a[b + c]);
					try {
						delete a[b + c];
					} catch (d) {
						a[b + c] = void 0;
					}
			  });
		var f = { bind: d, unbind: e };
		"function" == typeof define && define.amd
			? define("eventie/eventie", f)
			: "object" == typeof exports
			? (module.exports = f)
			: (a.eventie = f);
	})(window),
	function () {
		"use strict";
		function a() {}
		function b(a, b) {
			for (var c = a.length; c--; ) if (a[c].listener === b) return c;
			return -1;
		}
		function c(a) {
			return function () {
				return this[a].apply(this, arguments);
			};
		}
		var d = a.prototype,
			e = this,
			f = e.EventEmitter;
		(d.getListeners = function (a) {
			var b,
				c,
				d = this._getEvents();
			if (a instanceof RegExp) {
				b = {};
				for (c in d) d.hasOwnProperty(c) && a.test(c) && (b[c] = d[c]);
			} else b = d[a] || (d[a] = []);
			return b;
		}),
			(d.flattenListeners = function (a) {
				var b,
					c = [];
				for (b = 0; b < a.length; b += 1) c.push(a[b].listener);
				return c;
			}),
			(d.getListenersAsObject = function (a) {
				var b,
					c = this.getListeners(a);
				return c instanceof Array && ((b = {}), (b[a] = c)), b || c;
			}),
			(d.addListener = function (a, c) {
				var d,
					e = this.getListenersAsObject(a),
					f = "object" == typeof c;
				for (d in e)
					e.hasOwnProperty(d) &&
						-1 === b(e[d], c) &&
						e[d].push(f ? c : { listener: c, once: !1 });
				return this;
			}),
			(d.on = c("addListener")),
			(d.addOnceListener = function (a, b) {
				return this.addListener(a, { listener: b, once: !0 });
			}),
			(d.once = c("addOnceListener")),
			(d.defineEvent = function (a) {
				return this.getListeners(a), this;
			}),
			(d.defineEvents = function (a) {
				for (var b = 0; b < a.length; b += 1) this.defineEvent(a[b]);
				return this;
			}),
			(d.removeListener = function (a, c) {
				var d,
					e,
					f = this.getListenersAsObject(a);
				for (e in f)
					f.hasOwnProperty(e) &&
						((d = b(f[e], c)), -1 !== d && f[e].splice(d, 1));
				return this;
			}),
			(d.off = c("removeListener")),
			(d.addListeners = function (a, b) {
				return this.manipulateListeners(!1, a, b);
			}),
			(d.removeListeners = function (a, b) {
				return this.manipulateListeners(!0, a, b);
			}),
			(d.manipulateListeners = function (a, b, c) {
				var d,
					e,
					f = a ? this.removeListener : this.addListener,
					g = a ? this.removeListeners : this.addListeners;
				if ("object" != typeof b || b instanceof RegExp)
					for (d = c.length; d--; ) f.call(this, b, c[d]);
				else
					for (d in b)
						b.hasOwnProperty(d) &&
							(e = b[d]) &&
							("function" == typeof e
								? f.call(this, d, e)
								: g.call(this, d, e));
				return this;
			}),
			(d.removeEvent = function (a) {
				var b,
					c = typeof a,
					d = this._getEvents();
				if ("string" === c) delete d[a];
				else if (a instanceof RegExp)
					for (b in d) d.hasOwnProperty(b) && a.test(b) && delete d[b];
				else delete this._events;
				return this;
			}),
			(d.removeAllListeners = c("removeEvent")),
			(d.emitEvent = function (a, b) {
				var c,
					d,
					e,
					f,
					g = this.getListenersAsObject(a);
				for (e in g)
					if (g.hasOwnProperty(e))
						for (d = g[e].length; d--; )
							(c = g[e][d]),
								c.once === !0 && this.removeListener(a, c.listener),
								(f = c.listener.apply(this, b || [])),
								f === this._getOnceReturnValue() &&
									this.removeListener(a, c.listener);
				return this;
			}),
			(d.trigger = c("emitEvent")),
			(d.emit = function (a) {
				var b = Array.prototype.slice.call(arguments, 1);
				return this.emitEvent(a, b);
			}),
			(d.setOnceReturnValue = function (a) {
				return (this._onceReturnValue = a), this;
			}),
			(d._getOnceReturnValue = function () {
				return this.hasOwnProperty("_onceReturnValue")
					? this._onceReturnValue
					: !0;
			}),
			(d._getEvents = function () {
				return this._events || (this._events = {});
			}),
			(a.noConflict = function () {
				return (e.EventEmitter = f), a;
			}),
			"function" == typeof define && define.amd
				? define("eventEmitter/EventEmitter", [], function () {
						return a;
				  })
				: "object" == typeof module && module.exports
				? (module.exports = a)
				: (e.EventEmitter = a);
	}.call(this),
	(function (a) {
		function b(a) {
			if (a) {
				if ("string" == typeof d[a]) return a;
				a = a.charAt(0).toUpperCase() + a.slice(1);
				for (var b, e = 0, f = c.length; f > e; e++)
					if (((b = c[e] + a), "string" == typeof d[b])) return b;
			}
		}
		var c = "Webkit Moz ms Ms O".split(" "),
			d = document.documentElement.style;
		"function" == typeof define && define.amd
			? define("get-style-property/get-style-property", [], function () {
					return b;
			  })
			: "object" == typeof exports
			? (module.exports = b)
			: (a.getStyleProperty = b);
	})(window),
	(function (a, b) {
		function c(a) {
			var b = parseFloat(a),
				c = -1 === a.indexOf("%") && !isNaN(b);
			return c && b;
		}
		function d() {}
		function e() {
			for (
				var a = {
						width: 0,
						height: 0,
						innerWidth: 0,
						innerHeight: 0,
						outerWidth: 0,
						outerHeight: 0,
					},
					b = 0,
					c = h.length;
				c > b;
				b++
			) {
				var d = h[b];
				a[d] = 0;
			}
			return a;
		}
		function f(b) {
			function d() {
				if (!m) {
					m = !0;
					var d = a.getComputedStyle;
					if (
						((j = (function () {
							var a = d
								? function (a) {
										return d(a, null);
								  }
								: function (a) {
										return a.currentStyle;
								  };
							return function (b) {
								var c = a(b);
								return (
									c ||
										g(
											"Style returned " +
												c +
												". Are you running this code in a hidden iframe on Firefox? See http://bit.ly/getsizebug1"
										),
									c
								);
							};
						})()),
						(k = b("boxSizing")))
					) {
						var e = document.createElement("div");
						(e.style.width = "200px"),
							(e.style.padding = "1px 2px 3px 4px"),
							(e.style.borderStyle = "solid"),
							(e.style.borderWidth = "1px 2px 3px 4px"),
							(e.style[k] = "border-box");
						var f = document.body || document.documentElement;
						f.appendChild(e);
						var h = j(e);
						(l = 200 === c(h.width)), f.removeChild(e);
					}
				}
			}
			function f(a) {
				if (
					(d(),
					"string" == typeof a && (a = document.querySelector(a)),
					a && "object" == typeof a && a.nodeType)
				) {
					var b = j(a);
					if ("none" === b.display) return e();
					var f = {};
					(f.width = a.offsetWidth), (f.height = a.offsetHeight);
					for (
						var g = (f.isBorderBox = !(!k || !b[k] || "border-box" !== b[k])),
							m = 0,
							n = h.length;
						n > m;
						m++
					) {
						var o = h[m],
							p = b[o];
						p = i(a, p);
						var q = parseFloat(p);
						f[o] = isNaN(q) ? 0 : q;
					}
					var r = f.paddingLeft + f.paddingRight,
						s = f.paddingTop + f.paddingBottom,
						t = f.marginLeft + f.marginRight,
						u = f.marginTop + f.marginBottom,
						v = f.borderLeftWidth + f.borderRightWidth,
						w = f.borderTopWidth + f.borderBottomWidth,
						x = g && l,
						y = c(b.width);
					y !== !1 && (f.width = y + (x ? 0 : r + v));
					var z = c(b.height);
					return (
						z !== !1 && (f.height = z + (x ? 0 : s + w)),
						(f.innerWidth = f.width - (r + v)),
						(f.innerHeight = f.height - (s + w)),
						(f.outerWidth = f.width + t),
						(f.outerHeight = f.height + u),
						f
					);
				}
			}
			function i(b, c) {
				if (a.getComputedStyle || -1 === c.indexOf("%")) return c;
				var d = b.style,
					e = d.left,
					f = b.runtimeStyle,
					g = f && f.left;
				return (
					g && (f.left = b.currentStyle.left),
					(d.left = c),
					(c = d.pixelLeft),
					(d.left = e),
					g && (f.left = g),
					c
				);
			}
			var j,
				k,
				l,
				m = !1;
			return f;
		}
		var g =
				"undefined" == typeof console
					? d
					: function (a) {
							console.error(a);
					  },
			h = [
				"paddingLeft",
				"paddingRight",
				"paddingTop",
				"paddingBottom",
				"marginLeft",
				"marginRight",
				"marginTop",
				"marginBottom",
				"borderLeftWidth",
				"borderRightWidth",
				"borderTopWidth",
				"borderBottomWidth",
			];
		"function" == typeof define && define.amd
			? define("get-size/get-size", [
					"get-style-property/get-style-property",
			  ], f)
			: "object" == typeof exports
			? (module.exports = f(require("desandro-get-style-property")))
			: (a.getSize = f(a.getStyleProperty));
	})(window),
	(function (a) {
		function b(a) {
			"function" == typeof a && (b.isReady ? a() : g.push(a));
		}
		function c(a) {
			var c = "readystatechange" === a.type && "complete" !== f.readyState;
			b.isReady || c || d();
		}
		function d() {
			b.isReady = !0;
			for (var a = 0, c = g.length; c > a; a++) {
				var d = g[a];
				d();
			}
		}
		function e(e) {
			return (
				"complete" === f.readyState
					? d()
					: (e.bind(f, "DOMContentLoaded", c),
					  e.bind(f, "readystatechange", c),
					  e.bind(a, "load", c)),
				b
			);
		}
		var f = a.document,
			g = [];
		(b.isReady = !1),
			"function" == typeof define && define.amd
				? define("doc-ready/doc-ready", ["eventie/eventie"], e)
				: "object" == typeof exports
				? (module.exports = e(require("eventie")))
				: (a.docReady = e(a.eventie));
	})(window),
	(function (a) {
		"use strict";
		function b(a, b) {
			return a[g](b);
		}
		function c(a) {
			if (!a.parentNode) {
				var b = document.createDocumentFragment();
				b.appendChild(a);
			}
		}
		function d(a, b) {
			c(a);
			for (
				var d = a.parentNode.querySelectorAll(b), e = 0, f = d.length;
				f > e;
				e++
			)
				if (d[e] === a) return !0;
			return !1;
		}
		function e(a, d) {
			return c(a), b(a, d);
		}
		var f,
			g = (function () {
				if (a.matches) return "matches";
				if (a.matchesSelector) return "matchesSelector";
				for (
					var b = ["webkit", "moz", "ms", "o"], c = 0, d = b.length;
					d > c;
					c++
				) {
					var e = b[c],
						f = e + "MatchesSelector";
					if (a[f]) return f;
				}
			})();
		if (g) {
			var h = document.createElement("div"),
				i = b(h, "div");
			f = i ? b : e;
		} else f = d;
		"function" == typeof define && define.amd
			? define("matches-selector/matches-selector", [], function () {
					return f;
			  })
			: "object" == typeof exports
			? (module.exports = f)
			: (window.matchesSelector = f);
	})(Element.prototype),
	(function (a, b) {
		"use strict";
		"function" == typeof define && define.amd
			? define("fizzy-ui-utils/utils", [
					"doc-ready/doc-ready",
					"matches-selector/matches-selector",
			  ], function (c, d) {
					return b(a, c, d);
			  })
			: "object" == typeof exports
			? (module.exports = b(
					a,
					require("doc-ready"),
					require("desandro-matches-selector")
			  ))
			: (a.fizzyUIUtils = b(a, a.docReady, a.matchesSelector));
	})(window, function (a, b, c) {
		var d = {};
		(d.extend = function (a, b) {
			for (var c in b) a[c] = b[c];
			return a;
		}),
			(d.modulo = function (a, b) {
				return ((a % b) + b) % b;
			});
		var e = Object.prototype.toString;
		(d.isArray = function (a) {
			return "[object Array]" == e.call(a);
		}),
			(d.makeArray = function (a) {
				var b = [];
				if (d.isArray(a)) b = a;
				else if (a && "number" == typeof a.length)
					for (var c = 0, e = a.length; e > c; c++) b.push(a[c]);
				else b.push(a);
				return b;
			}),
			(d.indexOf = Array.prototype.indexOf
				? function (a, b) {
						return a.indexOf(b);
				  }
				: function (a, b) {
						for (var c = 0, d = a.length; d > c; c++) if (a[c] === b) return c;
						return -1;
				  }),
			(d.removeFrom = function (a, b) {
				var c = d.indexOf(a, b);
				-1 != c && a.splice(c, 1);
			}),
			(d.isElement =
				"function" == typeof HTMLElement || "object" == typeof HTMLElement
					? function (a) {
							return a instanceof HTMLElement;
					  }
					: function (a) {
							return (
								a &&
								"object" == typeof a &&
								1 == a.nodeType &&
								"string" == typeof a.nodeName
							);
					  }),
			(d.setText = (function () {
				function a(a, c) {
					(b =
						b ||
						(void 0 !== document.documentElement.textContent
							? "textContent"
							: "innerText")),
						(a[b] = c);
				}
				var b;
				return a;
			})()),
			(d.getParent = function (a, b) {
				for (; a != document.body; )
					if (((a = a.parentNode), c(a, b))) return a;
			}),
			(d.getQueryElement = function (a) {
				return "string" == typeof a ? document.querySelector(a) : a;
			}),
			(d.handleEvent = function (a) {
				var b = "on" + a.type;
				this[b] && this[b](a);
			}),
			(d.filterFindElements = function (a, b) {
				a = d.makeArray(a);
				for (var e = [], f = 0, g = a.length; g > f; f++) {
					var h = a[f];
					if (d.isElement(h))
						if (b) {
							c(h, b) && e.push(h);
							for (
								var i = h.querySelectorAll(b), j = 0, k = i.length;
								k > j;
								j++
							)
								e.push(i[j]);
						} else e.push(h);
				}
				return e;
			}),
			(d.debounceMethod = function (a, b, c) {
				var d = a.prototype[b],
					e = b + "Timeout";
				a.prototype[b] = function () {
					var a = this[e];
					a && clearTimeout(a);
					var b = arguments,
						f = this;
					this[e] = setTimeout(function () {
						d.apply(f, b), delete f[e];
					}, c || 100);
				};
			}),
			(d.toDashed = function (a) {
				return a
					.replace(/(.)([A-Z])/g, function (a, b, c) {
						return b + "-" + c;
					})
					.toLowerCase();
			});
		var f = a.console;
		return (
			(d.htmlInit = function (c, e) {
				b(function () {
					for (
						var b = d.toDashed(e),
							g = document.querySelectorAll(".js-" + b),
							h = "data-" + b + "-options",
							i = 0,
							j = g.length;
						j > i;
						i++
					) {
						var k,
							l = g[i],
							m = l.getAttribute(h);
						try {
							k = m && JSON.parse(m);
						} catch (n) {
							f &&
								f.error(
									"Error parsing " +
										h +
										" on " +
										l.nodeName.toLowerCase() +
										(l.id ? "#" + l.id : "") +
										": " +
										n
								);
							continue;
						}
						var o = new c(l, k),
							p = a.jQuery;
						p && p.data(l, e, o);
					}
				});
			}),
			d
		);
	}),
	(function (a, b) {
		"use strict";
		"function" == typeof define && define.amd
			? define("outlayer/item", [
					"eventEmitter/EventEmitter",
					"get-size/get-size",
					"get-style-property/get-style-property",
					"fizzy-ui-utils/utils",
			  ], function (c, d, e, f) {
					return b(a, c, d, e, f);
			  })
			: "object" == typeof exports
			? (module.exports = b(
					a,
					require("wolfy87-eventemitter"),
					require("get-size"),
					require("desandro-get-style-property"),
					require("fizzy-ui-utils")
			  ))
			: ((a.Outlayer = {}),
			  (a.Outlayer.Item = b(
					a,
					a.EventEmitter,
					a.getSize,
					a.getStyleProperty,
					a.fizzyUIUtils
			  )));
	})(window, function (a, b, c, d, e) {
		"use strict";
		function f(a) {
			for (var b in a) return !1;
			return (b = null), !0;
		}
		function g(a, b) {
			a &&
				((this.element = a),
				(this.layout = b),
				(this.position = { x: 0, y: 0 }),
				this._create());
		}
		function h(a) {
			return a.replace(/([A-Z])/g, function (a) {
				return "-" + a.toLowerCase();
			});
		}
		var i = a.getComputedStyle,
			j = i
				? function (a) {
						return i(a, null);
				  }
				: function (a) {
						return a.currentStyle;
				  },
			k = d("transition"),
			l = d("transform"),
			m = k && l,
			n = !!d("perspective"),
			o = {
				WebkitTransition: "webkitTransitionEnd",
				MozTransition: "transitionend",
				OTransition: "otransitionend",
				transition: "transitionend",
			}[k],
			p = [
				"transform",
				"transition",
				"transitionDuration",
				"transitionProperty",
			],
			q = (function () {
				for (var a = {}, b = 0, c = p.length; c > b; b++) {
					var e = p[b],
						f = d(e);
					f && f !== e && (a[e] = f);
				}
				return a;
			})();
		e.extend(g.prototype, b.prototype),
			(g.prototype._create = function () {
				(this._transn = { ingProperties: {}, clean: {}, onEnd: {} }),
					this.css({ position: "absolute" });
			}),
			(g.prototype.handleEvent = function (a) {
				var b = "on" + a.type;
				this[b] && this[b](a);
			}),
			(g.prototype.getSize = function () {
				this.size = c(this.element);
			}),
			(g.prototype.css = function (a) {
				var b = this.element.style;
				for (var c in a) {
					var d = q[c] || c;
					b[d] = a[c];
				}
			}),
			(g.prototype.getPosition = function () {
				var a = j(this.element),
					b = this.layout.options,
					c = b.isOriginLeft,
					d = b.isOriginTop,
					e = a[c ? "left" : "right"],
					f = a[d ? "top" : "bottom"],
					g = this.layout.size,
					h =
						-1 != e.indexOf("%")
							? (parseFloat(e) / 100) * g.width
							: parseInt(e, 10),
					i =
						-1 != f.indexOf("%")
							? (parseFloat(f) / 100) * g.height
							: parseInt(f, 10);
				(h = isNaN(h) ? 0 : h),
					(i = isNaN(i) ? 0 : i),
					(h -= c ? g.paddingLeft : g.paddingRight),
					(i -= d ? g.paddingTop : g.paddingBottom),
					(this.position.x = h),
					(this.position.y = i);
			}),
			(g.prototype.layoutPosition = function () {
				var a = this.layout.size,
					b = this.layout.options,
					c = {},
					d = b.isOriginLeft ? "paddingLeft" : "paddingRight",
					e = b.isOriginLeft ? "left" : "right",
					f = b.isOriginLeft ? "right" : "left",
					g = this.position.x + a[d];
				(c[e] = this.getXValue(g)), (c[f] = "");
				var h = b.isOriginTop ? "paddingTop" : "paddingBottom",
					i = b.isOriginTop ? "top" : "bottom",
					j = b.isOriginTop ? "bottom" : "top",
					k = this.position.y + a[h];
				(c[i] = this.getYValue(k)),
					(c[j] = ""),
					this.css(c),
					this.emitEvent("layout", [this]);
			}),
			(g.prototype.getXValue = function (a) {
				var b = this.layout.options;
				return b.percentPosition && !b.isHorizontal
					? (a / this.layout.size.width) * 100 + "%"
					: a + "px";
			}),
			(g.prototype.getYValue = function (a) {
				var b = this.layout.options;
				return b.percentPosition && b.isHorizontal
					? (a / this.layout.size.height) * 100 + "%"
					: a + "px";
			}),
			(g.prototype._transitionTo = function (a, b) {
				this.getPosition();
				var c = this.position.x,
					d = this.position.y,
					e = parseInt(a, 10),
					f = parseInt(b, 10),
					g = e === this.position.x && f === this.position.y;
				if ((this.setPosition(a, b), g && !this.isTransitioning))
					return void this.layoutPosition();
				var h = a - c,
					i = b - d,
					j = {};
				(j.transform = this.getTranslate(h, i)),
					this.transition({
						to: j,
						onTransitionEnd: { transform: this.layoutPosition },
						isCleaning: !0,
					});
			}),
			(g.prototype.getTranslate = function (a, b) {
				var c = this.layout.options;
				return (
					(a = c.isOriginLeft ? a : -a),
					(b = c.isOriginTop ? b : -b),
					n
						? "translate3d(" + a + "px, " + b + "px, 0)"
						: "translate(" + a + "px, " + b + "px)"
				);
			}),
			(g.prototype.goTo = function (a, b) {
				this.setPosition(a, b), this.layoutPosition();
			}),
			(g.prototype.moveTo = m ? g.prototype._transitionTo : g.prototype.goTo),
			(g.prototype.setPosition = function (a, b) {
				(this.position.x = parseInt(a, 10)),
					(this.position.y = parseInt(b, 10));
			}),
			(g.prototype._nonTransition = function (a) {
				this.css(a.to), a.isCleaning && this._removeStyles(a.to);
				for (var b in a.onTransitionEnd) a.onTransitionEnd[b].call(this);
			}),
			(g.prototype._transition = function (a) {
				if (!parseFloat(this.layout.options.transitionDuration))
					return void this._nonTransition(a);
				var b = this._transn;
				for (var c in a.onTransitionEnd) b.onEnd[c] = a.onTransitionEnd[c];
				for (c in a.to)
					(b.ingProperties[c] = !0), a.isCleaning && (b.clean[c] = !0);
				if (a.from) {
					this.css(a.from);
					var d = this.element.offsetHeight;
					d = null;
				}
				this.enableTransition(a.to),
					this.css(a.to),
					(this.isTransitioning = !0);
			});
		var r = "opacity," + h(q.transform || "transform");
		(g.prototype.enableTransition = function () {
			this.isTransitioning ||
				(this.css({
					transitionProperty: r,
					transitionDuration: this.layout.options.transitionDuration,
				}),
				this.element.addEventListener(o, this, !1));
		}),
			(g.prototype.transition =
				g.prototype[k ? "_transition" : "_nonTransition"]),
			(g.prototype.onwebkitTransitionEnd = function (a) {
				this.ontransitionend(a);
			}),
			(g.prototype.onotransitionend = function (a) {
				this.ontransitionend(a);
			});
		var s = {
			"-webkit-transform": "transform",
			"-moz-transform": "transform",
			"-o-transform": "transform",
		};
		(g.prototype.ontransitionend = function (a) {
			if (a.target === this.element) {
				var b = this._transn,
					c = s[a.propertyName] || a.propertyName;
				if (
					(delete b.ingProperties[c],
					f(b.ingProperties) && this.disableTransition(),
					c in b.clean &&
						((this.element.style[a.propertyName] = ""), delete b.clean[c]),
					c in b.onEnd)
				) {
					var d = b.onEnd[c];
					d.call(this), delete b.onEnd[c];
				}
				this.emitEvent("transitionEnd", [this]);
			}
		}),
			(g.prototype.disableTransition = function () {
				this.removeTransitionStyles(),
					this.element.removeEventListener(o, this, !1),
					(this.isTransitioning = !1);
			}),
			(g.prototype._removeStyles = function (a) {
				var b = {};
				for (var c in a) b[c] = "";
				this.css(b);
			});
		var t = { transitionProperty: "", transitionDuration: "" };
		return (
			(g.prototype.removeTransitionStyles = function () {
				this.css(t);
			}),
			(g.prototype.removeElem = function () {
				this.element.parentNode.removeChild(this.element),
					this.css({ display: "" }),
					this.emitEvent("remove", [this]);
			}),
			(g.prototype.remove = function () {
				if (!k || !parseFloat(this.layout.options.transitionDuration))
					return void this.removeElem();
				var a = this;
				this.once("transitionEnd", function () {
					a.removeElem();
				}),
					this.hide();
			}),
			(g.prototype.reveal = function () {
				delete this.isHidden, this.css({ display: "" });
				var a = this.layout.options,
					b = {},
					c = this.getHideRevealTransitionEndProperty("visibleStyle");
				(b[c] = this.onRevealTransitionEnd),
					this.transition({
						from: a.hiddenStyle,
						to: a.visibleStyle,
						isCleaning: !0,
						onTransitionEnd: b,
					});
			}),
			(g.prototype.onRevealTransitionEnd = function () {
				this.isHidden || this.emitEvent("reveal");
			}),
			(g.prototype.getHideRevealTransitionEndProperty = function (a) {
				var b = this.layout.options[a];
				if (b.opacity) return "opacity";
				for (var c in b) return c;
			}),
			(g.prototype.hide = function () {
				(this.isHidden = !0), this.css({ display: "" });
				var a = this.layout.options,
					b = {},
					c = this.getHideRevealTransitionEndProperty("hiddenStyle");
				(b[c] = this.onHideTransitionEnd),
					this.transition({
						from: a.visibleStyle,
						to: a.hiddenStyle,
						isCleaning: !0,
						onTransitionEnd: b,
					});
			}),
			(g.prototype.onHideTransitionEnd = function () {
				this.isHidden &&
					(this.css({ display: "none" }), this.emitEvent("hide"));
			}),
			(g.prototype.destroy = function () {
				this.css({
					position: "",
					left: "",
					right: "",
					top: "",
					bottom: "",
					transition: "",
					transform: "",
				});
			}),
			g
		);
	}),
	(function (a, b) {
		"use strict";
		"function" == typeof define && define.amd
			? define("outlayer/outlayer", [
					"eventie/eventie",
					"eventEmitter/EventEmitter",
					"get-size/get-size",
					"fizzy-ui-utils/utils",
					"./item",
			  ], function (c, d, e, f, g) {
					return b(a, c, d, e, f, g);
			  })
			: "object" == typeof exports
			? (module.exports = b(
					a,
					require("eventie"),
					require("wolfy87-eventemitter"),
					require("get-size"),
					require("fizzy-ui-utils"),
					require("./item")
			  ))
			: (a.Outlayer = b(
					a,
					a.eventie,
					a.EventEmitter,
					a.getSize,
					a.fizzyUIUtils,
					a.Outlayer.Item
			  ));
	})(window, function (a, b, c, d, e, f) {
		"use strict";
		function g(a, b) {
			var c = e.getQueryElement(a);
			if (!c)
				return void (
					h &&
					h.error(
						"Bad element for " + this.constructor.namespace + ": " + (c || a)
					)
				);
			(this.element = c),
				i && (this.$element = i(this.element)),
				(this.options = e.extend({}, this.constructor.defaults)),
				this.option(b);
			var d = ++k;
			(this.element.outlayerGUID = d),
				(l[d] = this),
				this._create(),
				this.options.isInitLayout && this.layout();
		}
		var h = a.console,
			i = a.jQuery,
			j = function () {},
			k = 0,
			l = {};
		return (
			(g.namespace = "outlayer"),
			(g.Item = f),
			(g.defaults = {
				containerStyle: { position: "relative" },
				isInitLayout: !0,
				isOriginLeft: !0,
				isOriginTop: !0,
				isResizeBound: !0,
				isResizingContainer: !0,
				transitionDuration: "0.4s",
				hiddenStyle: { opacity: 0, transform: "scale(0.001)" },
				visibleStyle: { opacity: 1, transform: "scale(1)" },
			}),
			e.extend(g.prototype, c.prototype),
			(g.prototype.option = function (a) {
				e.extend(this.options, a);
			}),
			(g.prototype._create = function () {
				this.reloadItems(),
					(this.stamps = []),
					this.stamp(this.options.stamp),
					e.extend(this.element.style, this.options.containerStyle),
					this.options.isResizeBound && this.bindResize();
			}),
			(g.prototype.reloadItems = function () {
				this.items = this._itemize(this.element.children);
			}),
			(g.prototype._itemize = function (a) {
				for (
					var b = this._filterFindItemElements(a),
						c = this.constructor.Item,
						d = [],
						e = 0,
						f = b.length;
					f > e;
					e++
				) {
					var g = b[e],
						h = new c(g, this);
					d.push(h);
				}
				return d;
			}),
			(g.prototype._filterFindItemElements = function (a) {
				return e.filterFindElements(a, this.options.itemSelector);
			}),
			(g.prototype.getItemElements = function () {
				for (var a = [], b = 0, c = this.items.length; c > b; b++)
					a.push(this.items[b].element);
				return a;
			}),
			(g.prototype.layout = function () {
				this._resetLayout(), this._manageStamps();
				var a =
					void 0 !== this.options.isLayoutInstant
						? this.options.isLayoutInstant
						: !this._isLayoutInited;
				this.layoutItems(this.items, a), (this._isLayoutInited = !0);
			}),
			(g.prototype._init = g.prototype.layout),
			(g.prototype._resetLayout = function () {
				this.getSize();
			}),
			(g.prototype.getSize = function () {
				this.size = d(this.element);
			}),
			(g.prototype._getMeasurement = function (a, b) {
				var c,
					f = this.options[a];
				f
					? ("string" == typeof f
							? (c = this.element.querySelector(f))
							: e.isElement(f) && (c = f),
					  (this[a] = c ? d(c)[b] : f))
					: (this[a] = 0);
			}),
			(g.prototype.layoutItems = function (a, b) {
				(a = this._getItemsForLayout(a)),
					this._layoutItems(a, b),
					this._postLayout();
			}),
			(g.prototype._getItemsForLayout = function (a) {
				for (var b = [], c = 0, d = a.length; d > c; c++) {
					var e = a[c];
					e.isIgnored || b.push(e);
				}
				return b;
			}),
			(g.prototype._layoutItems = function (a, b) {
				if ((this._emitCompleteOnItems("layout", a), a && a.length)) {
					for (var c = [], d = 0, e = a.length; e > d; d++) {
						var f = a[d],
							g = this._getItemLayoutPosition(f);
						(g.item = f), (g.isInstant = b || f.isLayoutInstant), c.push(g);
					}
					this._processLayoutQueue(c);
				}
			}),
			(g.prototype._getItemLayoutPosition = function () {
				return { x: 0, y: 0 };
			}),
			(g.prototype._processLayoutQueue = function (a) {
				for (var b = 0, c = a.length; c > b; b++) {
					var d = a[b];
					this._positionItem(d.item, d.x, d.y, d.isInstant);
				}
			}),
			(g.prototype._positionItem = function (a, b, c, d) {
				d ? a.goTo(b, c) : a.moveTo(b, c);
			}),
			(g.prototype._postLayout = function () {
				this.resizeContainer();
			}),
			(g.prototype.resizeContainer = function () {
				if (this.options.isResizingContainer) {
					var a = this._getContainerSize();
					a &&
						(this._setContainerMeasure(a.width, !0),
						this._setContainerMeasure(a.height, !1));
				}
			}),
			(g.prototype._getContainerSize = j),
			(g.prototype._setContainerMeasure = function (a, b) {
				if (void 0 !== a) {
					var c = this.size;
					c.isBorderBox &&
						(a += b
							? c.paddingLeft +
							  c.paddingRight +
							  c.borderLeftWidth +
							  c.borderRightWidth
							: c.paddingBottom +
							  c.paddingTop +
							  c.borderTopWidth +
							  c.borderBottomWidth),
						(a = Math.max(a, 0)),
						(this.element.style[b ? "width" : "height"] = a + "px");
				}
			}),
			(g.prototype._emitCompleteOnItems = function (a, b) {
				function c() {
					e.dispatchEvent(a + "Complete", null, [b]);
				}
				function d() {
					g++, g === f && c();
				}
				var e = this,
					f = b.length;
				if (!b || !f) return void c();
				for (var g = 0, h = 0, i = b.length; i > h; h++) {
					var j = b[h];
					j.once(a, d);
				}
			}),
			(g.prototype.dispatchEvent = function (a, b, c) {
				var d = b ? [b].concat(c) : c;
				if ((this.emitEvent(a, d), i))
					if (((this.$element = this.$element || i(this.element)), b)) {
						var e = i.Event(b);
						(e.type = a), this.$element.trigger(e, c);
					} else this.$element.trigger(a, c);
			}),
			(g.prototype.ignore = function (a) {
				var b = this.getItem(a);
				b && (b.isIgnored = !0);
			}),
			(g.prototype.unignore = function (a) {
				var b = this.getItem(a);
				b && delete b.isIgnored;
			}),
			(g.prototype.stamp = function (a) {
				if ((a = this._find(a))) {
					this.stamps = this.stamps.concat(a);
					for (var b = 0, c = a.length; c > b; b++) {
						var d = a[b];
						this.ignore(d);
					}
				}
			}),
			(g.prototype.unstamp = function (a) {
				if ((a = this._find(a)))
					for (var b = 0, c = a.length; c > b; b++) {
						var d = a[b];
						e.removeFrom(this.stamps, d), this.unignore(d);
					}
			}),
			(g.prototype._find = function (a) {
				return a
					? ("string" == typeof a && (a = this.element.querySelectorAll(a)),
					  (a = e.makeArray(a)))
					: void 0;
			}),
			(g.prototype._manageStamps = function () {
				if (this.stamps && this.stamps.length) {
					this._getBoundingRect();
					for (var a = 0, b = this.stamps.length; b > a; a++) {
						var c = this.stamps[a];
						this._manageStamp(c);
					}
				}
			}),
			(g.prototype._getBoundingRect = function () {
				var a = this.element.getBoundingClientRect(),
					b = this.size;
				this._boundingRect = {
					left: a.left + b.paddingLeft + b.borderLeftWidth,
					top: a.top + b.paddingTop + b.borderTopWidth,
					right: a.right - (b.paddingRight + b.borderRightWidth),
					bottom: a.bottom - (b.paddingBottom + b.borderBottomWidth),
				};
			}),
			(g.prototype._manageStamp = j),
			(g.prototype._getElementOffset = function (a) {
				var b = a.getBoundingClientRect(),
					c = this._boundingRect,
					e = d(a),
					f = {
						left: b.left - c.left - e.marginLeft,
						top: b.top - c.top - e.marginTop,
						right: c.right - b.right - e.marginRight,
						bottom: c.bottom - b.bottom - e.marginBottom,
					};
				return f;
			}),
			(g.prototype.handleEvent = function (a) {
				var b = "on" + a.type;
				this[b] && this[b](a);
			}),
			(g.prototype.bindResize = function () {
				this.isResizeBound ||
					(b.bind(a, "resize", this), (this.isResizeBound = !0));
			}),
			(g.prototype.unbindResize = function () {
				this.isResizeBound && b.unbind(a, "resize", this),
					(this.isResizeBound = !1);
			}),
			(g.prototype.onresize = function () {
				function a() {
					b.resize(), delete b.resizeTimeout;
				}
				this.resizeTimeout && clearTimeout(this.resizeTimeout);
				var b = this;
				this.resizeTimeout = setTimeout(a, 100);
			}),
			(g.prototype.resize = function () {
				this.isResizeBound && this.needsResizeLayout() && this.layout();
			}),
			(g.prototype.needsResizeLayout = function () {
				var a = d(this.element),
					b = this.size && a;
				return b && a.innerWidth !== this.size.innerWidth;
			}),
			(g.prototype.addItems = function (a) {
				var b = this._itemize(a);
				return b.length && (this.items = this.items.concat(b)), b;
			}),
			(g.prototype.appended = function (a) {
				var b = this.addItems(a);
				b.length && (this.layoutItems(b, !0), this.reveal(b));
			}),
			(g.prototype.prepended = function (a) {
				var b = this._itemize(a);
				if (b.length) {
					var c = this.items.slice(0);
					(this.items = b.concat(c)),
						this._resetLayout(),
						this._manageStamps(),
						this.layoutItems(b, !0),
						this.reveal(b),
						this.layoutItems(c);
				}
			}),
			(g.prototype.reveal = function (a) {
				this._emitCompleteOnItems("reveal", a);
				for (var b = a && a.length, c = 0; b && b > c; c++) {
					var d = a[c];
					d.reveal();
				}
			}),
			(g.prototype.hide = function (a) {
				this._emitCompleteOnItems("hide", a);
				for (var b = a && a.length, c = 0; b && b > c; c++) {
					var d = a[c];
					d.hide();
				}
			}),
			(g.prototype.revealItemElements = function (a) {
				var b = this.getItems(a);
				this.reveal(b);
			}),
			(g.prototype.hideItemElements = function (a) {
				var b = this.getItems(a);
				this.hide(b);
			}),
			(g.prototype.getItem = function (a) {
				for (var b = 0, c = this.items.length; c > b; b++) {
					var d = this.items[b];
					if (d.element === a) return d;
				}
			}),
			(g.prototype.getItems = function (a) {
				a = e.makeArray(a);
				for (var b = [], c = 0, d = a.length; d > c; c++) {
					var f = a[c],
						g = this.getItem(f);
					g && b.push(g);
				}
				return b;
			}),
			(g.prototype.remove = function (a) {
				var b = this.getItems(a);
				if ((this._emitCompleteOnItems("remove", b), b && b.length))
					for (var c = 0, d = b.length; d > c; c++) {
						var f = b[c];
						f.remove(), e.removeFrom(this.items, f);
					}
			}),
			(g.prototype.destroy = function () {
				var a = this.element.style;
				(a.height = ""), (a.position = ""), (a.width = "");
				for (var b = 0, c = this.items.length; c > b; b++) {
					var d = this.items[b];
					d.destroy();
				}
				this.unbindResize();
				var e = this.element.outlayerGUID;
				delete l[e],
					delete this.element.outlayerGUID,
					i && i.removeData(this.element, this.constructor.namespace);
			}),
			(g.data = function (a) {
				a = e.getQueryElement(a);
				var b = a && a.outlayerGUID;
				return b && l[b];
			}),
			(g.create = function (a, b) {
				function c() {
					g.apply(this, arguments);
				}
				return (
					Object.create
						? (c.prototype = Object.create(g.prototype))
						: e.extend(c.prototype, g.prototype),
					(c.prototype.constructor = c),
					(c.defaults = e.extend({}, g.defaults)),
					e.extend(c.defaults, b),
					(c.prototype.settings = {}),
					(c.namespace = a),
					(c.data = g.data),
					(c.Item = function () {
						f.apply(this, arguments);
					}),
					(c.Item.prototype = new f()),
					e.htmlInit(c, a),
					i && i.bridget && i.bridget(a, c),
					c
				);
			}),
			(g.Item = f),
			g
		);
	}),
	(function (a, b) {
		"use strict";
		"function" == typeof define && define.amd
			? define("isotope/js/item", ["outlayer/outlayer"], b)
			: "object" == typeof exports
			? (module.exports = b(require("outlayer")))
			: ((a.Isotope = a.Isotope || {}), (a.Isotope.Item = b(a.Outlayer)));
	})(window, function (a) {
		"use strict";
		function b() {
			a.Item.apply(this, arguments);
		}
		(b.prototype = new a.Item()),
			(b.prototype._create = function () {
				(this.id = this.layout.itemGUID++),
					a.Item.prototype._create.call(this),
					(this.sortData = {});
			}),
			(b.prototype.updateSortData = function () {
				if (!this.isIgnored) {
					(this.sortData.id = this.id),
						(this.sortData["original-order"] = this.id),
						(this.sortData.random = Math.random());
					var a = this.layout.options.getSortData,
						b = this.layout._sorters;
					for (var c in a) {
						var d = b[c];
						this.sortData[c] = d(this.element, this);
					}
				}
			});
		var c = b.prototype.destroy;
		return (
			(b.prototype.destroy = function () {
				c.apply(this, arguments), this.css({ display: "" });
			}),
			b
		);
	}),
	(function (a, b) {
		"use strict";
		"function" == typeof define && define.amd
			? define("isotope/js/layout-mode", [
					"get-size/get-size",
					"outlayer/outlayer",
			  ], b)
			: "object" == typeof exports
			? (module.exports = b(require("get-size"), require("outlayer")))
			: ((a.Isotope = a.Isotope || {}),
			  (a.Isotope.LayoutMode = b(a.getSize, a.Outlayer)));
	})(window, function (a, b) {
		"use strict";
		function c(a) {
			(this.isotope = a),
				a &&
					((this.options = a.options[this.namespace]),
					(this.element = a.element),
					(this.items = a.filteredItems),
					(this.size = a.size));
		}
		return (
			(function () {
				function a(a) {
					return function () {
						return b.prototype[a].apply(this.isotope, arguments);
					};
				}
				for (
					var d = [
							"_resetLayout",
							"_getItemLayoutPosition",
							"_manageStamp",
							"_getContainerSize",
							"_getElementOffset",
							"needsResizeLayout",
						],
						e = 0,
						f = d.length;
					f > e;
					e++
				) {
					var g = d[e];
					c.prototype[g] = a(g);
				}
			})(),
			(c.prototype.needsVerticalResizeLayout = function () {
				var b = a(this.isotope.element),
					c = this.isotope.size && b;
				return c && b.innerHeight != this.isotope.size.innerHeight;
			}),
			(c.prototype._getMeasurement = function () {
				this.isotope._getMeasurement.apply(this, arguments);
			}),
			(c.prototype.getColumnWidth = function () {
				this.getSegmentSize("column", "Width");
			}),
			(c.prototype.getRowHeight = function () {
				this.getSegmentSize("row", "Height");
			}),
			(c.prototype.getSegmentSize = function (a, b) {
				var c = a + b,
					d = "outer" + b;
				if ((this._getMeasurement(c, d), !this[c])) {
					var e = this.getFirstItemSize();
					this[c] = (e && e[d]) || this.isotope.size["inner" + b];
				}
			}),
			(c.prototype.getFirstItemSize = function () {
				var b = this.isotope.filteredItems[0];
				return b && b.element && a(b.element);
			}),
			(c.prototype.layout = function () {
				this.isotope.layout.apply(this.isotope, arguments);
			}),
			(c.prototype.getSize = function () {
				this.isotope.getSize(), (this.size = this.isotope.size);
			}),
			(c.modes = {}),
			(c.create = function (a, b) {
				function d() {
					c.apply(this, arguments);
				}
				return (
					(d.prototype = new c()),
					b && (d.options = b),
					(d.prototype.namespace = a),
					(c.modes[a] = d),
					d
				);
			}),
			c
		);
	}),
	(function (a, b) {
		"use strict";
		"function" == typeof define && define.amd
			? define("masonry/masonry", [
					"outlayer/outlayer",
					"get-size/get-size",
					"fizzy-ui-utils/utils",
			  ], b)
			: "object" == typeof exports
			? (module.exports = b(
					require("outlayer"),
					require("get-size"),
					require("fizzy-ui-utils")
			  ))
			: (a.Masonry = b(a.Outlayer, a.getSize, a.fizzyUIUtils));
	})(window, function (a, b, c) {
		var d = a.create("masonry");
		return (
			(d.prototype._resetLayout = function () {
				this.getSize(),
					this._getMeasurement("columnWidth", "outerWidth"),
					this._getMeasurement("gutter", "outerWidth"),
					this.measureColumns();
				var a = this.cols;
				for (this.colYs = []; a--; ) this.colYs.push(0);
				this.maxY = 0;
			}),
			(d.prototype.measureColumns = function () {
				if ((this.getContainerWidth(), !this.columnWidth)) {
					var a = this.items[0],
						c = a && a.element;
					this.columnWidth = (c && b(c).outerWidth) || this.containerWidth;
				}
				var d = (this.columnWidth += this.gutter),
					e = this.containerWidth + this.gutter,
					f = e / d,
					g = d - (e % d),
					h = g && 1 > g ? "round" : "floor";
				(f = Math[h](f)), (this.cols = Math.max(f, 1));
			}),
			(d.prototype.getContainerWidth = function () {
				var a = this.options.isFitWidth
						? this.element.parentNode
						: this.element,
					c = b(a);
				this.containerWidth = c && c.innerWidth;
			}),
			(d.prototype._getItemLayoutPosition = function (a) {
				a.getSize();
				var b = a.size.outerWidth % this.columnWidth,
					d = b && 1 > b ? "round" : "ceil",
					e = Math[d](a.size.outerWidth / this.columnWidth);
				e = Math.min(e, this.cols);
				for (
					var f = this._getColGroup(e),
						g = Math.min.apply(Math, f),
						h = c.indexOf(f, g),
						i = { x: this.columnWidth * h, y: g },
						j = g + a.size.outerHeight,
						k = this.cols + 1 - f.length,
						l = 0;
					k > l;
					l++
				)
					this.colYs[h + l] = j;
				return i;
			}),
			(d.prototype._getColGroup = function (a) {
				if (2 > a) return this.colYs;
				for (var b = [], c = this.cols + 1 - a, d = 0; c > d; d++) {
					var e = this.colYs.slice(d, d + a);
					b[d] = Math.max.apply(Math, e);
				}
				return b;
			}),
			(d.prototype._manageStamp = function (a) {
				var c = b(a),
					d = this._getElementOffset(a),
					e = this.options.isOriginLeft ? d.left : d.right,
					f = e + c.outerWidth,
					g = Math.floor(e / this.columnWidth);
				g = Math.max(0, g);
				var h = Math.floor(f / this.columnWidth);
				(h -= f % this.columnWidth ? 0 : 1), (h = Math.min(this.cols - 1, h));
				for (
					var i = (this.options.isOriginTop ? d.top : d.bottom) + c.outerHeight,
						j = g;
					h >= j;
					j++
				)
					this.colYs[j] = Math.max(i, this.colYs[j]);
			}),
			(d.prototype._getContainerSize = function () {
				this.maxY = Math.max.apply(Math, this.colYs);
				var a = { height: this.maxY };
				return (
					this.options.isFitWidth && (a.width = this._getContainerFitWidth()), a
				);
			}),
			(d.prototype._getContainerFitWidth = function () {
				for (var a = 0, b = this.cols; --b && 0 === this.colYs[b]; ) a++;
				return (this.cols - a) * this.columnWidth - this.gutter;
			}),
			(d.prototype.needsResizeLayout = function () {
				var a = this.containerWidth;
				return this.getContainerWidth(), a !== this.containerWidth;
			}),
			d
		);
	}),
	(function (a, b) {
		"use strict";
		"function" == typeof define && define.amd
			? define("isotope/js/layout-modes/masonry", [
					"../layout-mode",
					"masonry/masonry",
			  ], b)
			: "object" == typeof exports
			? (module.exports = b(
					require("../layout-mode"),
					require("masonry-layout")
			  ))
			: b(a.Isotope.LayoutMode, a.Masonry);
	})(window, function (a, b) {
		"use strict";
		function c(a, b) {
			for (var c in b) a[c] = b[c];
			return a;
		}
		var d = a.create("masonry"),
			e = d.prototype._getElementOffset,
			f = d.prototype.layout,
			g = d.prototype._getMeasurement;
		c(d.prototype, b.prototype),
			(d.prototype._getElementOffset = e),
			(d.prototype.layout = f),
			(d.prototype._getMeasurement = g);
		var h = d.prototype.measureColumns;
		d.prototype.measureColumns = function () {
			(this.items = this.isotope.filteredItems), h.call(this);
		};
		var i = d.prototype._manageStamp;
		return (
			(d.prototype._manageStamp = function () {
				(this.options.isOriginLeft = this.isotope.options.isOriginLeft),
					(this.options.isOriginTop = this.isotope.options.isOriginTop),
					i.apply(this, arguments);
			}),
			d
		);
	}),
	(function (a, b) {
		"use strict";
		"function" == typeof define && define.amd
			? define("isotope/js/layout-modes/fit-rows", ["../layout-mode"], b)
			: "object" == typeof exports
			? (module.exports = b(require("../layout-mode")))
			: b(a.Isotope.LayoutMode);
	})(window, function (a) {
		"use strict";
		var b = a.create("fitRows");
		return (
			(b.prototype._resetLayout = function () {
				(this.x = 0),
					(this.y = 0),
					(this.maxY = 0),
					this._getMeasurement("gutter", "outerWidth");
			}),
			(b.prototype._getItemLayoutPosition = function (a) {
				a.getSize();
				var b = a.size.outerWidth + this.gutter,
					c = this.isotope.size.innerWidth + this.gutter;
				0 !== this.x && b + this.x > c && ((this.x = 0), (this.y = this.maxY));
				var d = { x: this.x, y: this.y };
				return (
					(this.maxY = Math.max(this.maxY, this.y + a.size.outerHeight)),
					(this.x += b),
					d
				);
			}),
			(b.prototype._getContainerSize = function () {
				return { height: this.maxY };
			}),
			b
		);
	}),
	(function (a, b) {
		"use strict";
		"function" == typeof define && define.amd
			? define("isotope/js/layout-modes/vertical", ["../layout-mode"], b)
			: "object" == typeof exports
			? (module.exports = b(require("../layout-mode")))
			: b(a.Isotope.LayoutMode);
	})(window, function (a) {
		"use strict";
		var b = a.create("vertical", { horizontalAlignment: 0 });
		return (
			(b.prototype._resetLayout = function () {
				this.y = 0;
			}),
			(b.prototype._getItemLayoutPosition = function (a) {
				a.getSize();
				var b =
						(this.isotope.size.innerWidth - a.size.outerWidth) *
						this.options.horizontalAlignment,
					c = this.y;
				return (this.y += a.size.outerHeight), { x: b, y: c };
			}),
			(b.prototype._getContainerSize = function () {
				return { height: this.y };
			}),
			b
		);
	}),
	(function (a, b) {
		"use strict";
		"function" == typeof define && define.amd
			? define([
					"outlayer/outlayer",
					"get-size/get-size",
					"matches-selector/matches-selector",
					"fizzy-ui-utils/utils",
					"isotope/js/item",
					"isotope/js/layout-mode",
					"isotope/js/layout-modes/masonry",
					"isotope/js/layout-modes/fit-rows",
					"isotope/js/layout-modes/vertical",
			  ], function (c, d, e, f, g, h) {
					return b(a, c, d, e, f, g, h);
			  })
			: "object" == typeof exports
			? (module.exports = b(
					a,
					require("outlayer"),
					require("get-size"),
					require("desandro-matches-selector"),
					require("fizzy-ui-utils"),
					require("./item"),
					require("./layout-mode"),
					require("./layout-modes/masonry"),
					require("./layout-modes/fit-rows"),
					require("./layout-modes/vertical")
			  ))
			: (a.Isotope = b(
					a,
					a.Outlayer,
					a.getSize,
					a.matchesSelector,
					a.fizzyUIUtils,
					a.Isotope.Item,
					a.Isotope.LayoutMode
			  ));
	})(window, function (a, b, c, d, e, f, g) {
		function h(a, b) {
			return function (c, d) {
				for (var e = 0, f = a.length; f > e; e++) {
					var g = a[e],
						h = c.sortData[g],
						i = d.sortData[g];
					if (h > i || i > h) {
						var j = void 0 !== b[g] ? b[g] : b,
							k = j ? 1 : -1;
						return (h > i ? 1 : -1) * k;
					}
				}
				return 0;
			};
		}
		var i = a.jQuery,
			j = String.prototype.trim
				? function (a) {
						return a.trim();
				  }
				: function (a) {
						return a.replace(/^\s+|\s+$/g, "");
				  },
			k = document.documentElement,
			l = k.textContent
				? function (a) {
						return a.textContent;
				  }
				: function (a) {
						return a.innerText;
				  },
			m = b.create("isotope", {
				layoutMode: "masonry",
				isJQueryFiltering: !0,
				sortAscending: !0,
			});
		(m.Item = f),
			(m.LayoutMode = g),
			(m.prototype._create = function () {
				(this.itemGUID = 0),
					(this._sorters = {}),
					this._getSorters(),
					b.prototype._create.call(this),
					(this.modes = {}),
					(this.filteredItems = this.items),
					(this.sortHistory = ["original-order"]);
				for (var a in g.modes) this._initLayoutMode(a);
			}),
			(m.prototype.reloadItems = function () {
				(this.itemGUID = 0), b.prototype.reloadItems.call(this);
			}),
			(m.prototype._itemize = function () {
				for (
					var a = b.prototype._itemize.apply(this, arguments),
						c = 0,
						d = a.length;
					d > c;
					c++
				) {
					var e = a[c];
					e.id = this.itemGUID++;
				}
				return this._updateItemsSortData(a), a;
			}),
			(m.prototype._initLayoutMode = function (a) {
				var b = g.modes[a],
					c = this.options[a] || {};
				(this.options[a] = b.options ? e.extend(b.options, c) : c),
					(this.modes[a] = new b(this));
			}),
			(m.prototype.layout = function () {
				return !this._isLayoutInited && this.options.isInitLayout
					? void this.arrange()
					: void this._layout();
			}),
			(m.prototype._layout = function () {
				var a = this._getIsInstant();
				this._resetLayout(),
					this._manageStamps(),
					this.layoutItems(this.filteredItems, a),
					(this._isLayoutInited = !0);
			}),
			(m.prototype.arrange = function (a) {
				function b() {
					d.reveal(c.needReveal), d.hide(c.needHide);
				}
				this.option(a), this._getIsInstant();
				var c = this._filter(this.items);
				this.filteredItems = c.matches;
				var d = this;
				this._bindArrangeComplete(),
					this._isInstant ? this._noTransition(b) : b(),
					this._sort(),
					this._layout();
			}),
			(m.prototype._init = m.prototype.arrange),
			(m.prototype._getIsInstant = function () {
				var a =
					void 0 !== this.options.isLayoutInstant
						? this.options.isLayoutInstant
						: !this._isLayoutInited;
				return (this._isInstant = a), a;
			}),
			(m.prototype._bindArrangeComplete = function () {
				function a() {
					b &&
						c &&
						d &&
						e.dispatchEvent("arrangeComplete", null, [e.filteredItems]);
				}
				var b,
					c,
					d,
					e = this;
				this.once("layoutComplete", function () {
					(b = !0), a();
				}),
					this.once("hideComplete", function () {
						(c = !0), a();
					}),
					this.once("revealComplete", function () {
						(d = !0), a();
					});
			}),
			(m.prototype._filter = function (a) {
				var b = this.options.filter;
				b = b || "*";
				for (
					var c = [],
						d = [],
						e = [],
						f = this._getFilterTest(b),
						g = 0,
						h = a.length;
					h > g;
					g++
				) {
					var i = a[g];
					if (!i.isIgnored) {
						var j = f(i);
						j && c.push(i),
							j && i.isHidden ? d.push(i) : j || i.isHidden || e.push(i);
					}
				}
				return { matches: c, needReveal: d, needHide: e };
			}),
			(m.prototype._getFilterTest = function (a) {
				return i && this.options.isJQueryFiltering
					? function (b) {
							return i(b.element).is(a);
					  }
					: "function" == typeof a
					? function (b) {
							return a(b.element);
					  }
					: function (b) {
							return d(b.element, a);
					  };
			}),
			(m.prototype.updateSortData = function (a) {
				var b;
				a ? ((a = e.makeArray(a)), (b = this.getItems(a))) : (b = this.items),
					this._getSorters(),
					this._updateItemsSortData(b);
			}),
			(m.prototype._getSorters = function () {
				var a = this.options.getSortData;
				for (var b in a) {
					var c = a[b];
					this._sorters[b] = n(c);
				}
			}),
			(m.prototype._updateItemsSortData = function (a) {
				for (var b = a && a.length, c = 0; b && b > c; c++) {
					var d = a[c];
					d.updateSortData();
				}
			});
		var n = (function () {
			function a(a) {
				if ("string" != typeof a) return a;
				var c = j(a).split(" "),
					d = c[0],
					e = d.match(/^\[(.+)\]$/),
					f = e && e[1],
					g = b(f, d),
					h = m.sortDataParsers[c[1]];
				return (a = h
					? function (a) {
							return a && h(g(a));
					  }
					: function (a) {
							return a && g(a);
					  });
			}
			function b(a, b) {
				var c;
				return (c = a
					? function (b) {
							return b.getAttribute(a);
					  }
					: function (a) {
							var c = a.querySelector(b);
							return c && l(c);
					  });
			}
			return a;
		})();
		(m.sortDataParsers = {
			parseInt: function (a) {
				return parseInt(a, 10);
			},
			parseFloat: function (a) {
				return parseFloat(a);
			},
		}),
			(m.prototype._sort = function () {
				var a = this.options.sortBy;
				if (a) {
					var b = [].concat.apply(a, this.sortHistory),
						c = h(b, this.options.sortAscending);
					this.filteredItems.sort(c),
						a != this.sortHistory[0] && this.sortHistory.unshift(a);
				}
			}),
			(m.prototype._mode = function () {
				var a = this.options.layoutMode,
					b = this.modes[a];
				if (!b) throw new Error("No layout mode: " + a);
				return (b.options = this.options[a]), b;
			}),
			(m.prototype._resetLayout = function () {
				b.prototype._resetLayout.call(this), this._mode()._resetLayout();
			}),
			(m.prototype._getItemLayoutPosition = function (a) {
				return this._mode()._getItemLayoutPosition(a);
			}),
			(m.prototype._manageStamp = function (a) {
				this._mode()._manageStamp(a);
			}),
			(m.prototype._getContainerSize = function () {
				return this._mode()._getContainerSize();
			}),
			(m.prototype.needsResizeLayout = function () {
				return this._mode().needsResizeLayout();
			}),
			(m.prototype.appended = function (a) {
				var b = this.addItems(a);
				if (b.length) {
					var c = this._filterRevealAdded(b);
					this.filteredItems = this.filteredItems.concat(c);
				}
			}),
			(m.prototype.prepended = function (a) {
				var b = this._itemize(a);
				if (b.length) {
					this._resetLayout(), this._manageStamps();
					var c = this._filterRevealAdded(b);
					this.layoutItems(this.filteredItems),
						(this.filteredItems = c.concat(this.filteredItems)),
						(this.items = b.concat(this.items));
				}
			}),
			(m.prototype._filterRevealAdded = function (a) {
				var b = this._filter(a);
				return (
					this.hide(b.needHide),
					this.reveal(b.matches),
					this.layoutItems(b.matches, !0),
					b.matches
				);
			}),
			(m.prototype.insert = function (a) {
				var b = this.addItems(a);
				if (b.length) {
					var c,
						d,
						e = b.length;
					for (c = 0; e > c; c++)
						(d = b[c]), this.element.appendChild(d.element);
					var f = this._filter(b).matches;
					for (c = 0; e > c; c++) b[c].isLayoutInstant = !0;
					for (this.arrange(), c = 0; e > c; c++) delete b[c].isLayoutInstant;
					this.reveal(f);
				}
			});
		var o = m.prototype.remove;
		return (
			(m.prototype.remove = function (a) {
				a = e.makeArray(a);
				var b = this.getItems(a);
				o.call(this, a);
				var c = b && b.length;
				if (c)
					for (var d = 0; c > d; d++) {
						var f = b[d];
						e.removeFrom(this.filteredItems, f);
					}
			}),
			(m.prototype.shuffle = function () {
				for (var a = 0, b = this.items.length; b > a; a++) {
					var c = this.items[a];
					c.sortData.random = Math.random();
				}
				(this.options.sortBy = "random"), this._sort(), this._layout();
			}),
			(m.prototype._noTransition = function (a) {
				var b = this.options.transitionDuration;
				this.options.transitionDuration = 0;
				var c = a.call(this);
				return (this.options.transitionDuration = b), c;
			}),
			(m.prototype.getFilteredItemElements = function () {
				for (var a = [], b = 0, c = this.filteredItems.length; c > b; b++)
					a.push(this.filteredItems[b].element);
				return a;
			}),
			m
		);
	});

// PACKERY LAYOUT

!(function (a, b) {
	"function" == typeof define && define.amd
		? define("packery/js/rect", b)
		: "object" == typeof module && module.exports
		? (module.exports = b())
		: ((a.Packery = a.Packery || {}), (a.Packery.Rect = b()));
})(window, function () {
	function a(b) {
		for (var c in a.defaults) this[c] = a.defaults[c];
		for (c in b) this[c] = b[c];
	}
	a.defaults = { x: 0, y: 0, width: 0, height: 0 };
	var b = a.prototype;
	return (
		(b.contains = function (a) {
			var b = a.width || 0,
				c = a.height || 0;
			return (
				this.x <= a.x &&
				this.y <= a.y &&
				this.x + this.width >= a.x + b &&
				this.y + this.height >= a.y + c
			);
		}),
		(b.overlaps = function (a) {
			var b = this.x + this.width,
				c = this.y + this.height,
				d = a.x + a.width,
				e = a.y + a.height;
			return this.x < d && b > a.x && this.y < e && c > a.y;
		}),
		(b.getMaximalFreeRects = function (b) {
			if (!this.overlaps(b)) return !1;
			var c,
				d = [],
				e = this.x + this.width,
				f = this.y + this.height,
				g = b.x + b.width,
				h = b.y + b.height;
			return (
				this.y < b.y &&
					((c = new a({
						x: this.x,
						y: this.y,
						width: this.width,
						height: b.y - this.y,
					})),
					d.push(c)),
				e > g &&
					((c = new a({ x: g, y: this.y, width: e - g, height: this.height })),
					d.push(c)),
				f > h &&
					((c = new a({ x: this.x, y: h, width: this.width, height: f - h })),
					d.push(c)),
				this.x < b.x &&
					((c = new a({
						x: this.x,
						y: this.y,
						width: b.x - this.x,
						height: this.height,
					})),
					d.push(c)),
				d
			);
		}),
		(b.canFit = function (a) {
			return this.width >= a.width && this.height >= a.height;
		}),
		a
	);
}),
	(function (a, b) {
		if ("function" == typeof define && define.amd)
			define("packery/js/packer", ["./rect"], b);
		else if ("object" == typeof module && module.exports)
			module.exports = b(require("./rect"));
		else {
			var c = (a.Packery = a.Packery || {});
			c.Packer = b(c.Rect);
		}
	})(window, function (a) {
		function b(a, b, c) {
			(this.width = a || 0),
				(this.height = b || 0),
				(this.sortDirection = c || "downwardLeftToRight"),
				this.reset();
		}
		var c = b.prototype;
		(c.reset = function () {
			this.spaces = [];
			var b = new a({ x: 0, y: 0, width: this.width, height: this.height });
			this.spaces.push(b),
				(this.sorter = d[this.sortDirection] || d.downwardLeftToRight);
		}),
			(c.pack = function (a) {
				for (var b = 0; b < this.spaces.length; b++) {
					var c = this.spaces[b];
					if (c.canFit(a)) {
						this.placeInSpace(a, c);
						break;
					}
				}
			}),
			(c.columnPack = function (a) {
				for (var b = 0; b < this.spaces.length; b++) {
					var c = this.spaces[b],
						d =
							c.x <= a.x &&
							c.x + c.width >= a.x + a.width &&
							c.height >= a.height - 0.01;
					if (d) {
						(a.y = c.y), this.placed(a);
						break;
					}
				}
			}),
			(c.rowPack = function (a) {
				for (var b = 0; b < this.spaces.length; b++) {
					var c = this.spaces[b],
						d =
							c.y <= a.y &&
							c.y + c.height >= a.y + a.height &&
							c.width >= a.width - 0.01;
					if (d) {
						(a.x = c.x), this.placed(a);
						break;
					}
				}
			}),
			(c.placeInSpace = function (a, b) {
				(a.x = b.x), (a.y = b.y), this.placed(a);
			}),
			(c.placed = function (a) {
				for (var b = [], c = 0; c < this.spaces.length; c++) {
					var d = this.spaces[c],
						e = d.getMaximalFreeRects(a);
					e ? b.push.apply(b, e) : b.push(d);
				}
				(this.spaces = b), this.mergeSortSpaces();
			}),
			(c.mergeSortSpaces = function () {
				b.mergeRects(this.spaces), this.spaces.sort(this.sorter);
			}),
			(c.addSpace = function (a) {
				this.spaces.push(a), this.mergeSortSpaces();
			}),
			(b.mergeRects = function (a) {
				var b = 0,
					c = a[b];
				a: for (; c; ) {
					for (var d = 0, e = a[b + d]; e; ) {
						if (e == c) d++;
						else {
							if (e.contains(c)) {
								a.splice(b, 1), (c = a[b]);
								continue a;
							}
							c.contains(e) ? a.splice(b + d, 1) : d++;
						}
						e = a[b + d];
					}
					b++, (c = a[b]);
				}
				return a;
			});
		var d = {
			downwardLeftToRight: function (a, b) {
				return a.y - b.y || a.x - b.x;
			},
			rightwardTopToBottom: function (a, b) {
				return a.x - b.x || a.y - b.y;
			},
		};
		return b;
	}),
	(function (a, b) {
		"function" == typeof define && define.amd
			? define("packery/js/item", ["outlayer/outlayer", "./rect"], b)
			: "object" == typeof module && module.exports
			? (module.exports = b(require("outlayer"), require("./rect")))
			: (a.Packery.Item = b(a.Outlayer, a.Packery.Rect));
	})(window, function (a, b) {
		var c = document.documentElement.style,
			d = "string" == typeof c.transform ? "transform" : "WebkitTransform",
			e = function () {
				a.Item.apply(this, arguments);
			},
			f = (e.prototype = Object.create(a.Item.prototype)),
			g = f._create;
		f._create = function () {
			g.call(this), (this.rect = new b());
		};
		var h = f.moveTo;
		return (
			(f.moveTo = function (a, b) {
				var c = Math.abs(this.position.x - a),
					d = Math.abs(this.position.y - b),
					e =
						this.layout.dragItemCount &&
						!this.isPlacing &&
						!this.isTransitioning &&
						1 > c &&
						1 > d;
				return e ? void this.goTo(a, b) : void h.apply(this, arguments);
			}),
			(f.enablePlacing = function () {
				this.removeTransitionStyles(),
					this.isTransitioning && d && (this.element.style[d] = "none"),
					(this.isTransitioning = !1),
					this.getSize(),
					this.layout._setRectSize(this.element, this.rect),
					(this.isPlacing = !0);
			}),
			(f.disablePlacing = function () {
				this.isPlacing = !1;
			}),
			(f.removeElem = function () {
				this.element.parentNode.removeChild(this.element),
					this.layout.packer.addSpace(this.rect),
					this.emitEvent("remove", [this]);
			}),
			(f.showDropPlaceholder = function () {
				var a = this.dropPlaceholder;
				a ||
					((a = this.dropPlaceholder = document.createElement("div")),
					(a.className = "packery-drop-placeholder"),
					(a.style.position = "absolute")),
					(a.style.width = this.size.width + "px"),
					(a.style.height = this.size.height + "px"),
					this.positionDropPlaceholder(),
					this.layout.element.appendChild(a);
			}),
			(f.positionDropPlaceholder = function () {
				this.dropPlaceholder.style[d] =
					"translate(" + this.rect.x + "px, " + this.rect.y + "px)";
			}),
			(f.hideDropPlaceholder = function () {
				this.layout.element.removeChild(this.dropPlaceholder);
			}),
			e
		);
	}),
	(function (a, b) {
		"function" == typeof define && define.amd
			? define("packery/js/packery", [
					"get-size/get-size",
					"outlayer/outlayer",
					"./rect",
					"./packer",
					"./item",
			  ], b)
			: "object" == typeof module && module.exports
			? (module.exports = b(
					require("get-size"),
					require("outlayer"),
					require("./rect"),
					require("./packer"),
					require("./item")
			  ))
			: (a.Packery = b(
					a.getSize,
					a.Outlayer,
					a.Packery.Rect,
					a.Packery.Packer,
					a.Packery.Item
			  ));
	})(window, function (a, b, c, d, e) {
		function f(a, b) {
			return a.position.y - b.position.y || a.position.x - b.position.x;
		}
		function g(a, b) {
			return a.position.x - b.position.x || a.position.y - b.position.y;
		}
		function h(a, b) {
			var c = b.x - a.x,
				d = b.y - a.y;
			return Math.sqrt(c * c + d * d);
		}
		c.prototype.canFit = function (a) {
			return this.width >= a.width - 1 && this.height >= a.height - 1;
		};
		var i = b.create("packery");
		i.Item = e;
		var j = i.prototype;
		(j._create = function () {
			b.prototype._create.call(this),
				(this.packer = new d()),
				(this.shiftPacker = new d()),
				(this.isEnabled = !0),
				(this.dragItemCount = 0);
			var a = this;
			(this.handleDraggabilly = {
				dragStart: function () {
					a.itemDragStart(this.element);
				},
				dragMove: function () {
					a.itemDragMove(this.element, this.position.x, this.position.y);
				},
				dragEnd: function () {
					a.itemDragEnd(this.element);
				},
			}),
				(this.handleUIDraggable = {
					start: function (b, c) {
						c && a.itemDragStart(b.currentTarget);
					},
					drag: function (b, c) {
						c &&
							a.itemDragMove(b.currentTarget, c.position.left, c.position.top);
					},
					stop: function (b, c) {
						c && a.itemDragEnd(b.currentTarget);
					},
				});
		}),
			(j._resetLayout = function () {
				this.getSize(), this._getMeasurements();
				var a, b, c;
				this._getOption("horizontal")
					? ((a = 1 / 0),
					  (b = this.size.innerHeight + this.gutter),
					  (c = "rightwardTopToBottom"))
					: ((a = this.size.innerWidth + this.gutter),
					  (b = 1 / 0),
					  (c = "downwardLeftToRight")),
					(this.packer.width = this.shiftPacker.width = a),
					(this.packer.height = this.shiftPacker.height = b),
					(this.packer.sortDirection = this.shiftPacker.sortDirection = c),
					this.packer.reset(),
					(this.maxY = 0),
					(this.maxX = 0);
			}),
			(j._getMeasurements = function () {
				this._getMeasurement("columnWidth", "width"),
					this._getMeasurement("rowHeight", "height"),
					this._getMeasurement("gutter", "width");
			}),
			(j._getItemLayoutPosition = function (a) {
				if (
					(this._setRectSize(a.element, a.rect),
					this.isShifting || this.dragItemCount > 0)
				) {
					var b = this._getPackMethod();
					this.packer[b](a.rect);
				} else this.packer.pack(a.rect);
				return this._setMaxXY(a.rect), a.rect;
			}),
			(j.shiftLayout = function () {
				(this.isShifting = !0), this.layout(), delete this.isShifting;
			}),
			(j._getPackMethod = function () {
				return this._getOption("horizontal") ? "rowPack" : "columnPack";
			}),
			(j._setMaxXY = function (a) {
				(this.maxX = Math.max(a.x + a.width, this.maxX)),
					(this.maxY = Math.max(a.y + a.height, this.maxY));
			}),
			(j._setRectSize = function (b, c) {
				var d = a(b),
					e = d.outerWidth,
					f = d.outerHeight;
				(e || f) &&
					((e = this._applyGridGutter(e, this.columnWidth)),
					(f = this._applyGridGutter(f, this.rowHeight))),
					(c.width = Math.min(e, this.packer.width)),
					(c.height = Math.min(f, this.packer.height));
			}),
			(j._applyGridGutter = function (a, b) {
				if (!b) return a + this.gutter;
				b += this.gutter;
				var c = a % b,
					d = c && 1 > c ? "round" : "ceil";
				return (a = Math[d](a / b) * b);
			}),
			(j._getContainerSize = function () {
				return this._getOption("horizontal")
					? { width: this.maxX - this.gutter }
					: { height: this.maxY - this.gutter };
			}),
			(j._manageStamp = function (a) {
				var b,
					d = this.getItem(a);
				if (d && d.isPlacing) b = d.rect;
				else {
					var e = this._getElementOffset(a);
					b = new c({
						x: this._getOption("originLeft") ? e.left : e.right,
						y: this._getOption("originTop") ? e.top : e.bottom,
					});
				}
				this._setRectSize(a, b), this.packer.placed(b), this._setMaxXY(b);
			}),
			(j.sortItemsByPosition = function () {
				var a = this._getOption("horizontal") ? g : f;
				this.items.sort(a);
			}),
			(j.fit = function (a, b, c) {
				var d = this.getItem(a);
				d &&
					(this.stamp(d.element),
					d.enablePlacing(),
					this.updateShiftTargets(d),
					(b = void 0 === b ? d.rect.x : b),
					(c = void 0 === c ? d.rect.y : c),
					this.shift(d, b, c),
					this._bindFitEvents(d),
					d.moveTo(d.rect.x, d.rect.y),
					this.shiftLayout(),
					this.unstamp(d.element),
					this.sortItemsByPosition(),
					d.disablePlacing());
			}),
			(j._bindFitEvents = function (a) {
				function b() {
					d++, 2 == d && c.dispatchEvent("fitComplete", null, [a]);
				}
				var c = this,
					d = 0;
				a.once("layout", b), this.once("layoutComplete", b);
			}),
			(j.resize = function () {
				this.isResizeBound &&
					this.needsResizeLayout() &&
					(this.options.shiftPercentResize
						? this.resizeShiftPercentLayout()
						: this.layout());
			}),
			(j.needsResizeLayout = function () {
				var b = a(this.element),
					c = this._getOption("horizontal") ? "innerHeight" : "innerWidth";
				return b[c] != this.size[c];
			}),
			(j.resizeShiftPercentLayout = function () {
				var b = this._getItemsForLayout(this.items),
					c = this._getOption("horizontal"),
					d = c ? "y" : "x",
					e = c ? "height" : "width",
					f = c ? "rowHeight" : "columnWidth",
					g = c ? "innerHeight" : "innerWidth",
					h = this[f];
				if ((h = h && h + this.gutter)) {
					this._getMeasurements();
					var i = this[f] + this.gutter;
					b.forEach(function (a) {
						var b = Math.round(a.rect[d] / h);
						a.rect[d] = b * i;
					});
				} else {
					var j = a(this.element)[g] + this.gutter,
						k = this.packer[e];
					b.forEach(function (a) {
						a.rect[d] = (a.rect[d] / k) * j;
					});
				}
				this.shiftLayout();
			}),
			(j.itemDragStart = function (a) {
				if (this.isEnabled) {
					this.stamp(a);
					var b = this.getItem(a);
					b &&
						(b.enablePlacing(),
						b.showDropPlaceholder(),
						this.dragItemCount++,
						this.updateShiftTargets(b));
				}
			}),
			(j.updateShiftTargets = function (a) {
				this.shiftPacker.reset(), this._getBoundingRect();
				var b = this._getOption("originLeft"),
					d = this._getOption("originTop");
				this.stamps.forEach(function (a) {
					var e = this.getItem(a);
					if (!e || !e.isPlacing) {
						var f = this._getElementOffset(a),
							g = new c({ x: b ? f.left : f.right, y: d ? f.top : f.bottom });
						this._setRectSize(a, g), this.shiftPacker.placed(g);
					}
				}, this);
				var e = this._getOption("horizontal"),
					f = e ? "rowHeight" : "columnWidth",
					g = e ? "height" : "width";
				(this.shiftTargetKeys = []), (this.shiftTargets = []);
				var h,
					i = this[f];
				if ((i = i && i + this.gutter)) {
					var j = Math.ceil(a.rect[g] / i),
						k = Math.floor((this.shiftPacker[g] + this.gutter) / i);
					h = (k - j) * i;
					for (var l = 0; k > l; l++) this._addShiftTarget(l * i, 0, h);
				} else
					(h = this.shiftPacker[g] + this.gutter - a.rect[g]),
						this._addShiftTarget(0, 0, h);
				var m = this._getItemsForLayout(this.items),
					n = this._getPackMethod();
				m.forEach(function (a) {
					var b = a.rect;
					this._setRectSize(a.element, b),
						this.shiftPacker[n](b),
						this._addShiftTarget(b.x, b.y, h);
					var c = e ? b.x + b.width : b.x,
						d = e ? b.y : b.y + b.height;
					if ((this._addShiftTarget(c, d, h), i))
						for (var f = Math.round(b[g] / i), j = 1; f > j; j++) {
							var k = e ? c : b.x + i * j,
								l = e ? b.y + i * j : d;
							this._addShiftTarget(k, l, h);
						}
				}, this);
			}),
			(j._addShiftTarget = function (a, b, c) {
				var d = this._getOption("horizontal") ? b : a;
				if (!(0 !== d && d > c)) {
					var e = a + "," + b,
						f = -1 != this.shiftTargetKeys.indexOf(e);
					f ||
						(this.shiftTargetKeys.push(e),
						this.shiftTargets.push({ x: a, y: b }));
				}
			}),
			(j.shift = function (a, b, c) {
				var d,
					e = 1 / 0,
					f = { x: b, y: c };
				this.shiftTargets.forEach(function (a) {
					var b = h(a, f);
					e > b && ((d = a), (e = b));
				}),
					(a.rect.x = d.x),
					(a.rect.y = d.y);
			});
		var k = 120;
		(j.itemDragMove = function (a, b, c) {
			function d() {
				f.shift(e, b, c), e.positionDropPlaceholder(), f.layout();
			}
			var e = this.isEnabled && this.getItem(a);
			if (e) {
				(b -= this.size.paddingLeft), (c -= this.size.paddingTop);
				var f = this,
					g = new Date();
				this._itemDragTime && g - this._itemDragTime < k
					? (clearTimeout(this.dragTimeout),
					  (this.dragTimeout = setTimeout(d, k)))
					: (d(), (this._itemDragTime = g));
			}
		}),
			(j.itemDragEnd = function (a) {
				function b() {
					d++,
						2 == d &&
							(c.element.classList.remove("is-positioning-post-drag"),
							c.hideDropPlaceholder(),
							e.dispatchEvent("dragItemPositioned", null, [c]));
				}
				var c = this.isEnabled && this.getItem(a);
				if (c) {
					clearTimeout(this.dragTimeout),
						c.element.classList.add("is-positioning-post-drag");
					var d = 0,
						e = this;
					c.once("layout", b),
						this.once("layoutComplete", b),
						c.moveTo(c.rect.x, c.rect.y),
						this.layout(),
						(this.dragItemCount = Math.max(0, this.dragItemCount - 1)),
						this.sortItemsByPosition(),
						c.disablePlacing(),
						this.unstamp(c.element);
				}
			}),
			(j.bindDraggabillyEvents = function (a) {
				this._bindDraggabillyEvents(a, "on");
			}),
			(j.unbindDraggabillyEvents = function (a) {
				this._bindDraggabillyEvents(a, "off");
			}),
			(j._bindDraggabillyEvents = function (a, b) {
				var c = this.handleDraggabilly;
				a[b]("dragStart", c.dragStart),
					a[b]("dragMove", c.dragMove),
					a[b]("dragEnd", c.dragEnd);
			}),
			(j.bindUIDraggableEvents = function (a) {
				this._bindUIDraggableEvents(a, "on");
			}),
			(j.unbindUIDraggableEvents = function (a) {
				this._bindUIDraggableEvents(a, "off");
			}),
			(j._bindUIDraggableEvents = function (a, b) {
				var c = this.handleUIDraggable;
				a[b]("dragstart", c.start)[b]("drag", c.drag)[b]("dragstop", c.stop);
			});
		var l = j.destroy;
		return (
			(j.destroy = function () {
				l.apply(this, arguments), (this.isEnabled = !1);
			}),
			(i.Rect = c),
			(i.Packer = d),
			i
		);
	}),
	(function (a, b) {
		"function" == typeof define && define.amd
			? define(["isotope-layout/js/layout-mode", "packery/js/packery"], b)
			: "object" == typeof module && module.exports
			? (module.exports = b(
					require("isotope-layout/js/layout-mode"),
					require("packery")
			  ))
			: b(a.Isotope.LayoutMode, a.Packery);
	})(window, function (a, b) {
		var c = a.create("packery"),
			d = c.prototype,
			e = { _getElementOffset: !0, _getMeasurement: !0 };
		for (var f in b.prototype) e[f] || (d[f] = b.prototype[f]);
		var g = d._resetLayout;
		d._resetLayout = function () {
			(this.packer = this.packer || new b.Packer()),
				(this.shiftPacker = this.shiftPacker || new b.Packer()),
				g.apply(this, arguments);
		};
		var h = d._getItemLayoutPosition;
		d._getItemLayoutPosition = function (a) {
			return (a.rect = a.rect || new b.Rect()), h.call(this, a);
		};
		var i = d.needsResizeLayout;
		d.needsResizeLayout = function () {
			return this._getOption("horizontal")
				? this.needsVerticalResizeLayout()
				: i.call(this);
		};
		var j = d._getOption;
		return (
			(d._getOption = function (a) {
				return "horizontal" == a
					? void 0 !== this.options.isHorizontal
						? this.options.isHorizontal
						: this.options.horizontal
					: j.apply(this.isotope, arguments);
			}),
			c
		);
	});

// INFINITE SCROLL

(function (e) {
	if (typeof define === "function" && define.amd) {
		define(["jquery"], e);
	} else {
		e(jQuery);
	}
})(function (e, t) {
	"use strict";
	e.infinitescroll = function (n, r, i) {
		this.element = e(i);
		if (!this._create(n, r)) {
			this.failed = true;
		}
	};
	e.infinitescroll.defaults = {
		loading: {
			finished: t,
			finishedMsg:
				"<em>Congratulations, you've reached the end of the internet.</em>",
			img:
				"data:image/gif;base64,R0lGODlh3AATAPQeAPDy+MnQ6LW/4N3h8MzT6rjC4sTM5r/I5NHX7N7j8c7U6tvg8OLl8uXo9Ojr9b3G5MfP6Ovu9tPZ7PT1+vX2+tbb7vf4+8/W69jd7rC73vn5/O/x+K243ai02////wAAACH/C05FVFNDQVBFMi4wAwEAAAAh+QQECgD/ACwAAAAA3AATAAAF/6AnjmRpnmiqrmzrvnAsz3Rt33iu73zv/8CgcEj0BAScpHLJbDqf0Kh0Sq1ar9isdioItAKGw+MAKYMFhbF63CW438f0mg1R2O8EuXj/aOPtaHx7fn96goR4hmuId4qDdX95c4+RBIGCB4yAjpmQhZN0YGYGXitdZBIVGAsLoq4BBKQDswm1CQRkcG6ytrYKubq8vbfAcMK9v7q7EMO1ycrHvsW6zcTKsczNz8HZw9vG3cjTsMIYqQkCLBwHCgsMDQ4RDAYIqfYSFxDxEfz88/X38Onr16+Bp4ADCco7eC8hQYMAEe57yNCew4IVBU7EGNDiRn8Z831cGLHhSIgdFf9chIeBg7oA7gjaWUWTVQAGE3LqBDCTlc9WOHfm7PkTqNCh54rePDqB6M+lR536hCpUqs2gVZM+xbrTqtGoWqdy1emValeXKzggYBBB5y1acFNZmEvXAoN2cGfJrTv3bl69Ffj2xZt3L1+/fw3XRVw4sGDGcR0fJhxZsF3KtBTThZxZ8mLMgC3fRatCbYMNFCzwLEqLgE4NsDWs/tvqdezZf13Hvk2A9Szdu2X3pg18N+68xXn7rh1c+PLksI/Dhe6cuO3ow3NfV92bdArTqC2Ebd3A8vjf5QWfH6Bg7Nz17c2fj69+fnq+8N2Lty+fuP78/eV2X13neIcCeBRwxorbZrA1ANoCDGrgoG8RTshahQ9iSKEEzUmYIYfNWViUhheCGJyIP5E4oom7WWjgCeBFAJNv1DVV01MAdJhhjdkplWNzO/5oXI846njjVEIqR2OS2B1pE5PVscajkxhMycqLJghQSwT40PgfAl4GqNSXYdZXJn5gSkmmmmJu1aZYb14V51do+pTOCmA40AqVCIhG5IJ9PvYnhIFOxmdqhpaI6GeHCtpooisuutmg+Eg62KOMKuqoTaXgicQWoIYq6qiklmoqFV0UoeqqrLbq6quwxirrrLTWauutJ4QAACH5BAUKABwALAcABADOAAsAAAX/IPd0D2dyRCoUp/k8gpHOKtseR9yiSmGbuBykler9XLAhkbDavXTL5k2oqFqNOxzUZPU5YYZd1XsD72rZpBjbeh52mSNnMSC8lwblKZGwi+0QfIJ8CncnCoCDgoVnBHmKfByGJimPkIwtiAeBkH6ZHJaKmCeVnKKTHIihg5KNq4uoqmEtcRUtEREMBggtEr4QDrjCuRC8h7/BwxENeicSF8DKy82pyNLMOxzWygzFmdvD2L3P0dze4+Xh1Arkyepi7dfFvvTtLQkZBC0T/FX3CRgCMOBHsJ+EHYQY7OinAGECgQsB+Lu3AOK+CewcWjwxQeJBihtNGHSoQOE+iQ3//4XkwBBhRZMcUS6YSXOAwIL8PGqEaSJCiYt9SNoCmnJPAgUVLChdaoFBURN8MAzl2PQphwQLfDFd6lTowglHve6rKpbjhK7/pG5VinZP1qkiz1rl4+tr2LRwWU64cFEihwEtZgbgR1UiHaMVvxpOSwBA37kzGz9e8G+B5MIEKLutOGEsAH2ATQwYfTmuX8aETWdGPZmiZcccNSzeTCA1Sw0bdiitC7LBWgu8jQr8HRzqgpK6gX88QbrB14z/kF+ELpwB8eVQj/JkqdylAudji/+ts3039vEEfK8Vz2dlvxZKG0CmbkKDBvllRd6fCzDvBLKBDSCeffhRJEFebFk1k/Mv9jVIoIJZSeBggwUaNeB+Qk34IE0cXlihcfRxkOAJFFhwGmKlmWDiakZhUJtnLBpnWWcnKaAZcxI0piFGGLBm1mc90kajSCveeBVWKeYEoU2wqeaQi0PetoE+rr14EpVC7oAbAUHqhYExbn2XHHsVqbcVew9tx8+XJKk5AZsqqdlddGpqAKdbAYBn1pcczmSTdWvdmZ17c1b3FZ99vnTdCRFM8OEcAhLwm1NdXnWcBBSMRWmfkWZqVlsmLIiAp/o1gGV2vpS4lalGYsUOqXrddcKCmK61aZ8SjEpUpVFVoCpTj4r661Km7kBHjrDyc1RAIQAAIfkEBQoAGwAsBwAEAM4ACwAABf/gtmUCd4goQQgFKj6PYKi0yrrbc8i4ohQt12EHcal+MNSQiCP8gigdz7iCioaCIvUmZLp8QBzW0EN2vSlCuDtFKaq4RyHzQLEKZNdiQDhRDVooCwkbfm59EAmKi4SGIm+AjIsKjhsqB4mSjT2IOIOUnICeCaB/mZKFNTSRmqVpmJqklSqskq6PfYYCDwYHDC4REQwGCBLGxxIQDsHMwhAIX8bKzcENgSLGF9PU1j3Sy9zX2NrgzQziChLk1BHWxcjf7N046tvN82715czn9Pryz6Ilc4ACj4EBOCZM8KEnAYYADBRKnACAYUMFv1wotIhCEcaJCisqwJFgAUSQGyX/kCSVUUTIdKMwJlyo0oXHlhskwrTJciZHEXsgaqS4s6PJiCAr1uzYU8kBBSgnWFqpoMJMUjGtDmUwkmfVmVypakWhEKvXsS4nhLW5wNjVroJIoc05wSzTr0PtiigpYe4EC2vj4iWrFu5euWIMRBhacaVJhYQBEFjA9jHjyQ0xEABwGceGAZYjY0YBOrRLCxUp29QM+bRkx5s7ZyYgVbTqwwti2ybJ+vLtDYpycyZbYOlptxdx0kV+V7lC5iJAyyRrwYKxAdiz82ng0/jnAdMJFz0cPi104Ec1Vj9/M6F173vKL/feXv156dw11tlqeMMnv4V5Ap53GmjQQH97nFfg+IFiucfgRX5Z8KAgbUlQ4IULIlghhhdOSB6AgX0IVn8eReghen3NRIBsRgnH4l4LuEidZBjwRpt6NM5WGwoW0KSjCwX6yJSMab2GwwAPDXfaBCtWpluRTQqC5JM5oUZAjUNS+VeOLWpJEQ7VYQANW0INJSZVDFSnZphjSikfmzE5N4EEbQI1QJmnWXCmHulRp2edwDXF43txukenJwvI9xyg9Q26Z3MzGUcBYFEChZh6DVTq34AU8Iflh51Sd+CnKFYQ6mmZkhqfBKfSxZWqA9DZanWjxmhrWwi0qtCrt/43K6WqVjjpmhIqgEGvculaGKklKstAACEAACH5BAUKABwALAcABADOAAsAAAX/ICdyQmaMYyAUqPgIBiHPxNpy79kqRXH8wAPsRmDdXpAWgWdEIYm2llCHqjVHU+jjJkwqBTecwItShMXkEfNWSh8e1NGAcLgpDGlRgk7EJ/6Ae3VKfoF/fDuFhohVeDeCfXkcCQqDVQcQhn+VNDOYmpSWaoqBlUSfmowjEA+iEAEGDRGztAwGCDcXEA60tXEiCrq8vREMEBLIyRLCxMWSHMzExnbRvQ2Sy7vN0zvVtNfU2tLY3rPgLdnDvca4VQS/Cpk3ABwSLQkYAQwT/P309vcI7OvXr94jBQMJ/nskkGA/BQBRLNDncAIAiDcG6LsxAWOLiQzmeURBKWSLCQbv/1F0eDGinJUKR47YY1IEgQASKk7Yc7ACRwZm7mHweRJoz59BJUogisKCUaFMR0x4SlJBVBFTk8pZivTR0K73rN5wqlXEAq5Fy3IYgHbEzQ0nLy4QSoCjXLoom96VOJEeCosK5n4kkFfqXjl94wa+l1gvAcGICbewAOAxY8l/Ky/QhAGz4cUkGxu2HNozhwMGBnCUqUdBg9UuW9eUynqSwLHIBujePef1ZGQZXcM+OFuEBeBhi3OYgLyqcuaxbT9vLkf4SeqyWxSQpKGB2gQpm1KdWbu72rPRzR9Ne2Nu9Kzr/1Jqj0yD/fvqP4aXOt5sW/5qsXXVcv1Nsp8IBUAmgswGF3llGgeU1YVXXKTN1FlhWFXW3gIE+DVChApysACHHo7Q4A35lLichh+ROBmLKAzgYmYEYDAhCgxKGOOMn4WR4kkDaoBBOxJtdNKQxFmg5JIWIBnQc07GaORfUY4AEkdV6jHlCEISSZ5yTXpp1pbGZbkWmcuZmQCaE6iJ0FhjMaDjTMsgZaNEHFRAQVp3bqXnZED1qYcECOz5V6BhSWCoVJQIKuKQi2KFKEkEFAqoAo7uYSmO3jk61wUUMKmknJ4SGimBmAa0qVQBhAAAIfkEBQoAGwAsBwAEAM4ACwAABf/gJm5FmRlEqhJC+bywgK5pO4rHI0D3pii22+Mg6/0Ej96weCMAk7cDkXf7lZTTnrMl7eaYoy10JN0ZFdco0XAuvKI6qkgVFJXYNwjkIBcNBgR8TQoGfRsJCRuCYYQQiI+ICosiCoGOkIiKfSl8mJkHZ4U9kZMbKaI3pKGXmJKrngmug4WwkhA0lrCBWgYFCCMQFwoQDRHGxwwGCBLMzRLEx8iGzMMO0cYNeCMKzBDW19lnF9DXDIY/48Xg093f0Q3s1dcR8OLe8+Y91OTv5wrj7o7B+7VNQqABIoRVCMBggsOHE36kSoCBIcSH3EbFangxogJYFi8CkJhqQciLJEf/LDDJEeJIBT0GsOwYUYJGBS0fjpQAMidGmyVP6sx4Y6VQhzs9VUwkwqaCCh0tmKoFtSMDmBOf9phg4SrVrROuasRQAaxXpVUhdsU6IsECZlvX3kwLUWzRt0BHOLTbNlbZG3vZinArge5Dvn7wbqtQkSYAAgtKmnSsYKVKo2AfW048uaPmG386i4Q8EQMBAIAnfB7xBxBqvapJ9zX9WgRS2YMpnvYMGdPK3aMjt/3dUcNI4blpj7iwkMFWDXDvSmgAlijrt9RTR78+PS6z1uAJZIe93Q8g5zcsWCi/4Y+C8bah5zUv3vv89uft30QP23punGCx5954oBBwnwYaNCDY/wYrsYeggnM9B2Fpf8GG2CEUVWhbWAtGouEGDy7Y4IEJVrbSiXghqGKIo7z1IVcXIkKWWR361QOLWWnIhwERpLaaCCee5iMBGJQmJGyPFTnbkfHVZGRtIGrg5HALEJAZbu39BuUEUmq1JJQIPtZilY5hGeSWsSk52G9XqsmgljdIcABytq13HyIM6RcUA+r1qZ4EBF3WHWB29tBgAzRhEGhig8KmqKFv8SeCeo+mgsF7YFXa1qWSbkDpom/mqR1PmHCqJ3fwNRVXjC7S6CZhFVCQ2lWvZiirhQq42SACt25IK2hv8TprriUV1usGgeka7LFcNmCldMLi6qZMgFLgpw16Cipb7bC1knXsBiEAACH5BAUKABsALAcABADOAAsAAAX/4FZsJPkUmUGsLCEUTywXglFuSg7fW1xAvNWLF6sFFcPb42C8EZCj24EJdCp2yoegWsolS0Uu6fmamg8n8YYcLU2bXSiRaXMGvqV6/KAeJAh8VgZqCX+BexCFioWAYgqNi4qAR4ORhRuHY408jAeUhAmYYiuVlpiflqGZa5CWkzc5fKmbbhIpsAoQDRG8vQwQCBLCwxK6vb5qwhfGxxENahvCEA7NzskSy7vNzzzK09W/PNHF1NvX2dXcN8K55cfh69Luveol3vO8zwi4Yhj+AQwmCBw4IYclDAAJDlQggVOChAoLKkgFkSCAHDwWLKhIEOONARsDKryogFPIiAUb/95gJNIiw4wnI778GFPhzBKFOAq8qLJEhQpiNArjMcHCmlTCUDIouTKBhApELSxFWiGiVKY4E2CAekPgUphDu0742nRrVLJZnyrFSqKQ2ohoSYAMW6IoDpNJ4bLdILTnAj8KUF7UeENjAKuDyxIgOuGiOI0EBBMgLNew5AUrDTMGsFixwBIaNCQuAXJB57qNJ2OWm2Aj4skwCQCIyNkhhtMkdsIuodE0AN4LJDRgfLPtn5YDLdBlraAByuUbBgxQwICxMOnYpVOPej074OFdlfc0TqC62OIbcppHjV4o+LrieWhfT8JC/I/T6W8oCl29vQ0XjLdBaA3s1RcPBO7lFvpX8BVoG4O5jTXRQRDuJ6FDTzEWF1/BCZhgbyAKE9qICYLloQYOFtahVRsWYlZ4KQJHlwHS/IYaZ6sZd9tmu5HQm2xi1UaTbzxYwJk/wBF5g5EEYOBZeEfGZmNdFyFZmZIR4jikbLThlh5kUUVJGmRT7sekkziRWUIACABk3T4qCsedgO4xhgGcY7q5pHJ4klBBTQRJ0CeHcoYHHUh6wgfdn9uJdSdMiebGJ0zUPTcoS286FCkrZxnYoYYKWLkBowhQoBeaOlZAgVhLidrXqg2GiqpQpZ4apwSwRtjqrB3muoF9BboaXKmshlqWqsWiGt2wphJkQbAU5hoCACH5BAUKABsALAcABADOAAsAAAX/oGFw2WZuT5oZROsSQnGaKjRvilI893MItlNOJ5v5gDcFrHhKIWcEYu/xFEqNv6B1N62aclysF7fsZYe5aOx2yL5aAUGSaT1oTYMBwQ5VGCAJgYIJCnx1gIOBhXdwiIl7d0p2iYGQUAQBjoOFSQR/lIQHnZ+Ue6OagqYzSqSJi5eTpTxGcjcSChANEbu8DBAIEsHBChe5vL13G7fFuscRDcnKuM3H0La3EA7Oz8kKEsXazr7Cw9/Gztar5uHHvte47MjktznZ2w0G1+D3BgirAqJmJMAQgMGEgwgn5Ei0gKDBhBMALGRYEOJBb5QcWlQo4cbAihZz3GgIMqFEBSM1/4ZEOWPAgpIIJXYU+PIhRG8ja1qU6VHlzZknJNQ6UanCjQkWCIGSUGEjAwVLjc44+DTqUQtPPS5gejUrTa5TJ3g9sWCr1BNUWZI161StiQUDmLYdGfesibQ3XMq1OPYthrwuA2yU2LBs2cBHIypYQPPlYAKFD5cVvNPtW8eVGbdcQADATsiNO4cFAPkvHpedPzc8kUcPgNGgZ5RNDZG05reoE9s2vSEP79MEGiQGy1qP8LA4ZcdtsJE48ONoLTBtTV0B9LsTnPceoIDBDQvS7W7vfjVY3q3eZ4A339J4eaAmKqU/sV58HvJh2RcnIBsDUw0ABqhBA5aV5V9XUFGiHfVeAiWwoFgJJrIXRH1tEMiDFV4oHoAEGlaWhgIGSGBO2nFomYY3mKjVglidaNYJGJDkWW2xxTfbjCbVaOGNqoX2GloR8ZeTaECS9pthRGJH2g0b3Agbk6hNANtteHD2GJUucfajCQBy5OOTQ25ZgUPvaVVQmbKh9510/qQpwXx3SQdfk8tZJOd5b6JJFplT3ZnmmX3qd5l1eg5q00HrtUkUn0AKaiGjClSAgKLYZcgWXwocGRcCFGCKwSB6ceqphwmYRUFYT/1WKlOdUpipmxW0mlCqHjYkAaeoZlqrqZ4qd+upQKaapn/AmgAegZ8KUtYtFAQQAgAh+QQFCgAbACwHAAQAzgALAAAF/+C2PUcmiCiZGUTrEkKBis8jQEquKwU5HyXIbEPgyX7BYa5wTNmEMwWsSXsqFbEh8DYs9mrgGjdK6GkPY5GOeU6ryz7UFopSQEzygOGhJBjoIgMDBAcBM0V/CYqLCQqFOwobiYyKjn2TlI6GKC2YjJZknouaZAcQlJUHl6eooJwKooobqoewrJSEmyKdt59NhRKFMxLEEA4RyMkMEAjDEhfGycqAG8TQx9IRDRDE3d3R2ctD1RLg0ttKEnbY5wZD3+zJ6M7X2RHi9Oby7u/r9g38UFjTh2xZJBEBMDAboogAgwkQI07IMUORwocSJwCgWDFBAIwZOaJIsOBjRogKJP8wTODw5ESVHVtm3AhzpEeQElOuNDlTZ0ycEUWKWFASqEahGwYUPbnxoAgEdlYSqDBkgoUNClAlIHbSAoOsqCRQnQHxq1axVb06FWFxLIqyaze0Tft1JVqyE+pWXMD1pF6bYl3+HTqAWNW8cRUFzmih0ZAAB2oGKukSAAGGRHWJgLiR6AylBLpuHKKUMlMCngMpDSAa9QIUggZVVvDaJobLeC3XZpvgNgCmtPcuwP3WgmXSq4do0DC6o2/guzcseECtUoO0hmcsGKDgOt7ssBd07wqesAIGZC1YIBa7PQHvb1+SFo+++HrJSQfB33xfav3i5eX3Hnb4CTJgegEq8tH/YQEOcIJzbm2G2EoYRLgBXFpVmFYDcREV4HIcnmUhiGBRouEMJGJGzHIspqgdXxK0yCKHRNXoIX4uorCdTyjkyNtdPWrA4Up82EbAbzMRxxZRR54WXVLDIRmRcag5d2R6ugl3ZXzNhTecchpMhIGVAKAYpgJjjsSklBEd99maZoo535ZvdamjBEpusJyctg3h4X8XqodBMx0tiNeg/oGJaKGABpogS40KSqiaEgBqlQWLUtqoVQnytekEjzo0hHqhRorppOZt2p923M2AAV+oBtpAnnPNoB6HaU6mAAIU+IXmi3j2mtFXuUoHKwXpzVrsjcgGOauKEjQrwq157hitGq2NoWmjh7z6Wmxb0m5w66+2VRAuXN/yFUAIACH5BAUKABsALAcABADOAAsAAAX/4CZuRiaM45MZqBgIRbs9AqTcuFLE7VHLOh7KB5ERdjJaEaU4ClO/lgKWjKKcMiJQ8KgumcieVdQMD8cbBeuAkkC6LYLhOxoQ2PF5Ys9PKPBMen17f0CCg4VSh32JV4t8jSNqEIOEgJKPlkYBlJWRInKdiJdkmQlvKAsLBxdABA4RsbIMBggtEhcQsLKxDBC2TAS6vLENdJLDxMZAubu8vjIbzcQRtMzJz79S08oQEt/guNiyy7fcvMbh4OezdAvGrakLAQwyABsELQkY9BP+//ckyPDD4J9BfAMh1GsBoImMeQUN+lMgUJ9CiRMa5msxoB9Gh/o8GmxYMZXIgxtR/yQ46S/gQAURR0pDwYDfywoyLPip5AdnCwsMFPBU4BPFhKBDi444quCmDKZOfwZ9KEGpCKgcN1jdALSpPqIYsabS+nSqvqplvYqQYAeDPgwKwjaMtiDl0oaqUAyo+3TuWwUAMPpVCfee0cEjVBGQq2ABx7oTWmQk4FglZMGN9fGVDMCuiH2AOVOu/PmyxM630gwM0CCn6q8LjVJ8GXvpa5Uwn95OTC/nNxkda1/dLSK475IjCD6dHbK1ZOa4hXP9DXs5chJ00UpVm5xo2qRpoxptwF2E4/IbJpB/SDz9+q9b1aNfQH08+p4a8uvX8B53fLP+ycAfemjsRUBgp1H20K+BghHgVgt1GXZXZpZ5lt4ECjxYR4ScUWiShEtZqBiIInRGWnERNnjiBglw+JyGnxUmGowsyiiZg189lNtPGACjV2+S9UjbU0JWF6SPvEk3QZEqsZYTk3UAaRSUnznJI5LmESCdBVSyaOWUWLK4I5gDUYVeV1T9l+FZClCAUVA09uSmRHBCKAECFEhW51ht6rnmWBXkaR+NjuHpJ40D3DmnQXt2F+ihZxlqVKOfQRACACH5BAUKABwALAcABADOAAsAAAX/ICdyUCkUo/g8mUG8MCGkKgspeC6j6XEIEBpBUeCNfECaglBcOVfJFK7YQwZHQ6JRZBUqTrSuVEuD3nI45pYjFuWKvjjSkCoRaBUMWxkwBGgJCXspQ36Bh4EEB0oKhoiBgyNLjo8Ki4QElIiWfJqHnISNEI+Ql5J9o6SgkqKkgqYihamPkW6oNBgSfiMMDQkGCBLCwxIQDhHIyQwQCGMKxsnKVyPCF9DREQ3MxMPX0cu4wt7J2uHWx9jlKd3o39MiuefYEcvNkuLt5O8c1ePI2tyELXGQwoGDAQf+iEC2xByDCRAjTlAgIUWCBRgCPJQ4AQBFXAs0coT40WLIjRxL/47AcHLkxIomRXL0CHPERZkpa4q4iVKiyp0tR/7kwHMkTUBBJR5dOCEBAVcKKtCAyOHpowXCpk7goABqBZdcvWploACpBKkpIJI1q5OD2rIWE0R1uTZu1LFwbWL9OlKuWb4c6+o9i3dEgw0RCGDUG9KlRw56gDY2qmCByZBaASi+TACA0TucAaTteCcy0ZuOK3N2vJlx58+LRQyY3Xm0ZsgjZg+oPQLi7dUcNXi0LOJw1pgNtB7XG6CBy+U75SYfPTSQAgZTNUDnQHt67wnbZyvwLgKiMN3oCZB3C76tdewpLFgIP2C88rbi4Y+QT3+8S5USMICZXWj1pkEDeUU3lOYGB3alSoEiMIjgX4WlgNF2EibIwQIXauWXSRg2SAOHIU5IIIMoZkhhWiJaiFVbKo6AQEgQXrTAazO1JhkBrBG3Y2Y6EsUhaGn95hprSN0oWpFE7rhkeaQBchGOEWnwEmc0uKWZj0LeuNV3W4Y2lZHFlQCSRjTIl8uZ+kG5HU/3sRlnTG2ytyadytnD3HrmuRcSn+0h1dycexIK1KCjYaCnjCCVqOFFJTZ5GkUUjESWaUIKU2lgCmAKKQIUjHapXRKE+t2og1VgankNYnohqKJ2CmKplso6GKz7WYCgqxeuyoF8u9IQAgA7",
			msg: null,
			msgText: "<em>Loading the next set of posts...</em>",
			selector: null,
			speed: "fast",
			start: t,
		},
		state: {
			isDuringAjax: false,
			isInvalidPage: false,
			isDestroyed: false,
			isDone: false,
			isPaused: false,
			isBeyondMaxPage: false,
			currPage: 1,
		},
		debug: false,
		behavior: t,
		binder: e(window),
		nextSelector: "div.navigation a:first",
		navSelector: "div.navigation",
		contentSelector: null,
		extraScrollPx: 150,
		itemSelector: "div.post",
		animate: false,
		pathParse: t,
		dataType: "html",
		appendCallback: true,
		bufferPx: 40,
		errorCallback: function () {},
		infid: 0,
		pixelsFromNavToBottom: t,
		path: t,
		prefill: false,
		maxPage: t,
	};
	e.infinitescroll.prototype = {
		_binding: function (n) {
			var r = this,
				i = r.options;
			i.v = "2.0b2.120520";
			if (!!i.behavior && this["_binding_" + i.behavior] !== t) {
				this["_binding_" + i.behavior].call(this);
				return;
			}
			if (n !== "bind" && n !== "unbind") {
				this._debug("Binding value  " + n + " not valid");
				return false;
			}
			if (n === "unbind") {
				this.options.binder.unbind("smartscroll.infscr." + r.options.infid);
			} else {
				this.options.binder[n](
					"smartscroll.infscr." + r.options.infid,
					function () {
						r.scroll();
					}
				);
			}
			this._debug("Binding", n);
		},
		_create: function (r, i) {
			var s = e.extend(true, {}, e.infinitescroll.defaults, r);
			this.options = s;
			var o = e(window);
			var u = this;
			if (!u._validate(r)) {
				return false;
			}
			var a = e(s.nextSelector).attr("href");
			if (!a) {
				this._debug("Navigation selector not found");
				return false;
			}
			s.path = s.path || this._determinepath(a);
			s.contentSelector = s.contentSelector || this.element;
			s.loading.selector = s.loading.selector || s.contentSelector;
			s.loading.msg =
				s.loading.msg ||
				e(
					'<div id="infscr-loading"><img alt="Loading..." src="' +
						s.loading.img +
						'" /><div>' +
						s.loading.msgText +
						"</div></div>"
				);
			new Image().src = s.loading.img;
			if (s.pixelsFromNavToBottom === t) {
				s.pixelsFromNavToBottom =
					e(document).height() - e(s.navSelector).offset().top;
				this._debug("pixelsFromNavToBottom: " + s.pixelsFromNavToBottom);
			}
			var f = this;
			s.loading.start =
				s.loading.start ||
				function () {
					e(s.navSelector).hide();
					s.loading.msg.appendTo(s.loading.selector).show(
						s.loading.speed,
						e.proxy(function () {
							this.beginAjax(s);
						}, f)
					);
				};
			s.loading.finished =
				s.loading.finished ||
				function () {
					if (!s.state.isBeyondMaxPage) s.loading.msg.fadeOut(s.loading.speed);
				};
			s.callback = function (n, r, u) {
				if (!!s.behavior && n["_callback_" + s.behavior] !== t) {
					n["_callback_" + s.behavior].call(e(s.contentSelector)[0], r, u);
				}
				if (i) {
					i.call(e(s.contentSelector)[0], r, s, u);
				}
				if (s.prefill) {
					o.bind("resize.infinite-scroll", n._prefill);
				}
			};
			if (r.debug) {
				if (
					Function.prototype.bind &&
					(typeof console === "object" || typeof console === "function") &&
					typeof console.log === "object"
				) {
					[
						"log",
						"info",
						"warn",
						"error",
						"assert",
						"dir",
						"clear",
						"profile",
						"profileEnd",
					].forEach(function (e) {
						console[e] = this.call(console[e], console);
					}, Function.prototype.bind);
				}
			}
			this._setup();
			if (s.prefill) {
				this._prefill();
			}
			return true;
		},
		_prefill: function () {
			function i() {
				return e(n.options.contentSelector).height() <= r.height();
			}
			var n = this;
			var r = e(window);
			this._prefill = function () {
				if (i()) {
					n.scroll();
				}
				r.bind("resize.infinite-scroll", function () {
					if (i()) {
						r.unbind("resize.infinite-scroll");
						n.scroll();
					}
				});
			};
			this._prefill();
		},
		_debug: function () {
			if (true !== this.options.debug) {
				return;
			}
			if (typeof console !== "undefined" && typeof console.log === "function") {
				if (
					Array.prototype.slice.call(arguments).length === 1 &&
					typeof Array.prototype.slice.call(arguments)[0] === "string"
				) {
					console.log(Array.prototype.slice.call(arguments).toString());
				} else {
					console.log(Array.prototype.slice.call(arguments));
				}
			} else if (
				!Function.prototype.bind &&
				typeof console !== "undefined" &&
				typeof console.log === "object"
			) {
				Function.prototype.call.call(
					console.log,
					console,
					Array.prototype.slice.call(arguments)
				);
			}
		},
		_determinepath: function (n) {
			var r = this.options;
			if (!!r.behavior && this["_determinepath_" + r.behavior] !== t) {
				return this["_determinepath_" + r.behavior].call(this, n);
			}
			if (!!r.pathParse) {
				this._debug("pathParse manual");
				return r.pathParse(n, this.options.state.currPage + 1);
			} else if (n.match(/^(.*?)\b2\b(.*?$)/)) {
				n = n.match(/^(.*?)\b2\b(.*?$)/).slice(1);
			} else if (n.match(/^(.*?)2(.*?$)/)) {
				if (n.match(/^(.*?page=)2(\/.*|$)/)) {
					n = n.match(/^(.*?page=)2(\/.*|$)/).slice(1);
					return n;
				}
				n = n.match(/^(.*?)2(.*?$)/).slice(1);
			} else {
				if (n.match(/^(.*?page=)1(\/.*|$)/)) {
					n = n.match(/^(.*?page=)1(\/.*|$)/).slice(1);
					return n;
				} else {
					this._debug(
						"Sorry, we couldn't parse your Next (Previous Posts) URL. Verify your the css selector points to the correct A tag. If you still get this error: yell, scream, and kindly ask for help at infinite-scroll.com."
					);
					r.state.isInvalidPage = true;
				}
			}
			this._debug("determinePath", n);
			return n;
		},
		_error: function (n) {
			var r = this.options;
			if (!!r.behavior && this["_error_" + r.behavior] !== t) {
				this["_error_" + r.behavior].call(this, n);
				return;
			}
			if (n !== "destroy" && n !== "end") {
				n = "unknown";
			}
			this._debug("Error", n);
			if (n === "end" || r.state.isBeyondMaxPage) {
				this._showdonemsg();
			}
			r.state.isDone = true;
			r.state.currPage = 1;
			r.state.isPaused = false;
			r.state.isBeyondMaxPage = false;
			this._binding("unbind");
		},
		_loadcallback: function (r, i, s) {
			var o = this.options,
				u = this.options.callback,
				a = o.state.isDone
					? "done"
					: !o.appendCallback
					? "no-append"
					: "append",
				f;
			if (!!o.behavior && this["_loadcallback_" + o.behavior] !== t) {
				this["_loadcallback_" + o.behavior].call(this, r, i);
				return;
			}
			switch (a) {
				case "done":
					this._showdonemsg();
					return false;
				case "no-append":
					if (o.dataType === "html") {
						i = "<div>" + i + "</div>";
						i = e(i).find(o.itemSelector);
					}
					if (i.length === 0) {
						return this._error("end");
					}
					break;
				case "append":
					var l = r.children();
					if (l.length === 0) {
						return this._error("end");
					}
					f = document.createDocumentFragment();
					while (r[0].firstChild) {
						f.appendChild(r[0].firstChild);
					}
					this._debug("contentSelector", e(o.contentSelector)[0]);
					e(o.contentSelector)[0].appendChild(f);
					i = l.get();
					break;
			}
			o.loading.finished.call(e(o.contentSelector)[0], o);
			if (o.animate) {
				var c =
					e(window).scrollTop() +
					e(o.loading.msg).height() +
					o.extraScrollPx +
					"px";
				e("html,body").animate({ scrollTop: c }, 800, function () {
					o.state.isDuringAjax = false;
				});
			}
			if (!o.animate) {
				o.state.isDuringAjax = false;
			}
			u(this, i, s);
			if (o.prefill) {
				this._prefill();
			}
		},
		_nearbottom: function () {
			var r = this.options,
				i =
					0 + e(document).height() - r.binder.scrollTop() - e(window).height();
			if (!!r.behavior && this["_nearbottom_" + r.behavior] !== t) {
				return this["_nearbottom_" + r.behavior].call(this);
			}
			this._debug("math:", i, r.pixelsFromNavToBottom);
			return i - r.bufferPx < r.pixelsFromNavToBottom;
		},
		_pausing: function (n) {
			var r = this.options;
			if (!!r.behavior && this["_pausing_" + r.behavior] !== t) {
				this["_pausing_" + r.behavior].call(this, n);
				return;
			}
			if (n !== "pause" && n !== "resume" && n !== null) {
				this._debug("Invalid argument. Toggling pause value instead");
			}
			n = n && (n === "pause" || n === "resume") ? n : "toggle";
			switch (n) {
				case "pause":
					r.state.isPaused = true;
					break;
				case "resume":
					r.state.isPaused = false;
					break;
				case "toggle":
					r.state.isPaused = !r.state.isPaused;
					break;
			}
			this._debug("Paused", r.state.isPaused);
			return false;
		},
		_setup: function () {
			var n = this.options;
			if (!!n.behavior && this["_setup_" + n.behavior] !== t) {
				this["_setup_" + n.behavior].call(this);
				return;
			}
			this._binding("bind");
			return false;
		},
		_showdonemsg: function () {
			var r = this.options;
			if (!!r.behavior && this["_showdonemsg_" + r.behavior] !== t) {
				this["_showdonemsg_" + r.behavior].call(this);
				return;
			}
			r.loading.msg
				.find("img")
				.hide()
				.parent()
				.find("div")
				.html(r.loading.finishedMsg)
				.animate({ opacity: 1 }, 2e3, function () {
					e(this).parent().fadeOut(r.loading.speed);
				});
			r.errorCallback.call(e(r.contentSelector)[0], "done");
		},
		_validate: function (n) {
			for (var r in n) {
				if (r.indexOf && r.indexOf("Selector") > -1 && e(n[r]).length === 0) {
					this._debug("Your " + r + " found no elements.");
					return false;
				}
			}
			return true;
		},
		bind: function () {
			this._binding("bind");
		},
		destroy: function () {
			this.options.state.isDestroyed = true;
			this.options.loading.finished();
			return this._error("destroy");
		},
		pause: function () {
			this._pausing("pause");
		},
		resume: function () {
			this._pausing("resume");
		},
		beginAjax: function (r) {
			var i = this,
				s = r.path,
				o,
				u,
				a,
				f;
			r.state.currPage++;
			if (r.maxPage !== t && r.state.currPage > r.maxPage) {
				r.state.isBeyondMaxPage = true;
				this.destroy();
				return;
			}
			o = e(r.contentSelector).is("table, tbody") ? e("<tbody/>") : e("<div/>");
			u =
				typeof s === "function"
					? s(r.state.currPage)
					: s.join(r.state.currPage);
			i._debug("heading into ajax", u);
			a =
				r.dataType === "html" || r.dataType === "json"
					? r.dataType
					: "html+callback";
			if (r.appendCallback && r.dataType === "html") {
				a += "+callback";
			}
			switch (a) {
				case "html+callback":
					i._debug("Using HTML via .load() method");
					o.load(u + " " + r.itemSelector, t, function (t) {
						i._loadcallback(o, t, u);
					});
					break;
				case "html":
					i._debug("Using " + a.toUpperCase() + " via $.ajax() method");
					e.ajax({
						url: u,
						dataType: r.dataType,
						complete: function (t, n) {
							f =
								typeof t.isResolved !== "undefined"
									? t.isResolved()
									: n === "success" || n === "notmodified";
							if (f) {
								i._loadcallback(o, t.responseText, u);
							} else {
								i._error("end");
							}
						},
					});
					break;
				case "json":
					i._debug("Using " + a.toUpperCase() + " via $.ajax() method");
					e.ajax({
						dataType: "json",
						type: "GET",
						url: u,
						success: function (e, n, s) {
							f =
								typeof s.isResolved !== "undefined"
									? s.isResolved()
									: n === "success" || n === "notmodified";
							if (r.appendCallback) {
								if (r.template !== t) {
									var a = r.template(e);
									o.append(a);
									if (f) {
										i._loadcallback(o, a);
									} else {
										i._error("end");
									}
								} else {
									i._debug("template must be defined.");
									i._error("end");
								}
							} else {
								if (f) {
									i._loadcallback(o, e, u);
								} else {
									i._error("end");
								}
							}
						},
						error: function () {
							i._debug("JSON ajax request failed.");
							i._error("end");
						},
					});
					break;
			}
		},
		retrieve: function (r) {
			r = r || null;
			var i = this,
				s = i.options;
			if (!!s.behavior && this["retrieve_" + s.behavior] !== t) {
				this["retrieve_" + s.behavior].call(this, r);
				return;
			}
			if (s.state.isDestroyed) {
				this._debug("Instance is destroyed");
				return false;
			}
			s.state.isDuringAjax = true;
			s.loading.start.call(e(s.contentSelector)[0], s);
		},
		scroll: function () {
			var n = this.options,
				r = n.state;
			if (!!n.behavior && this["scroll_" + n.behavior] !== t) {
				this["scroll_" + n.behavior].call(this);
				return;
			}
			if (
				r.isDuringAjax ||
				r.isInvalidPage ||
				r.isDone ||
				r.isDestroyed ||
				r.isPaused
			) {
				return;
			}
			if (!this._nearbottom()) {
				return;
			}
			this.retrieve();
		},
		toggle: function () {
			this._pausing();
		},
		unbind: function () {
			this._binding("unbind");
		},
		update: function (n) {
			if (e.isPlainObject(n)) {
				this.options = e.extend(true, this.options, n);
			}
		},
	};
	e.fn.infinitescroll = function (n, r) {
		var i = typeof n;
		switch (i) {
			case "string":
				var s = Array.prototype.slice.call(arguments, 1);
				this.each(function () {
					var t = e.data(this, "infinitescroll");
					if (!t) {
						return false;
					}
					if (!e.isFunction(t[n]) || n.charAt(0) === "_") {
						return false;
					}
					t[n].apply(t, s);
				});
				break;
			case "object":
				this.each(function () {
					var t = e.data(this, "infinitescroll");
					if (t) {
						t.update(n);
					} else {
						t = new e.infinitescroll(n, r, this);
						if (!t.failed) {
							e.data(this, "infinitescroll", t);
						}
					}
				});
				break;
		}
		return this;
	};
	var n = e.event,
		r;
	n.special.smartscroll = {
		setup: function () {
			e(this).bind("scroll", n.special.smartscroll.handler);
		},
		teardown: function () {
			e(this).unbind("scroll", n.special.smartscroll.handler);
		},
		handler: function (t, n) {
			var i = this,
				s = arguments;
			t.type = "smartscroll";
			if (r) {
				clearTimeout(r);
			}
			r = setTimeout(
				function () {
					e(i).trigger("smartscroll", s);
				},
				n === "execAsap" ? 0 : 100
			);
		},
	};
	e.fn.smartscroll = function (e) {
		return e
			? this.bind("smartscroll", e)
			: this.trigger("smartscroll", ["execAsap"]);
	};
});

/*! WOW - v1.1.3 - 2016-05-06
 * Copyright (c) 2016 Matthieu Aussaguel;*/ (function () {
	var a,
		b,
		c,
		d,
		e,
		f = function (a, b) {
			return function () {
				return a.apply(b, arguments);
			};
		},
		g =
			[].indexOf ||
			function (a) {
				for (var b = 0, c = this.length; c > b; b++)
					if (b in this && this[b] === a) return b;
				return -1;
			};
	(b = (function () {
		function a() {}
		return (
			(a.prototype.extend = function (a, b) {
				var c, d;
				for (c in b) (d = b[c]), null == a[c] && (a[c] = d);
				return a;
			}),
			(a.prototype.isMobile = function (a) {
				return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
					a
				);
			}),
			(a.prototype.createEvent = function (a, b, c, d) {
				var e;
				return (
					null == b && (b = !1),
					null == c && (c = !1),
					null == d && (d = null),
					null != document.createEvent
						? ((e = document.createEvent("CustomEvent")),
						  e.initCustomEvent(a, b, c, d))
						: null != document.createEventObject
						? ((e = document.createEventObject()), (e.eventType = a))
						: (e.eventName = a),
					e
				);
			}),
			(a.prototype.emitEvent = function (a, b) {
				return null != a.dispatchEvent
					? a.dispatchEvent(b)
					: b in (null != a)
					? a[b]()
					: "on" + b in (null != a)
					? a["on" + b]()
					: void 0;
			}),
			(a.prototype.addEvent = function (a, b, c) {
				return null != a.addEventListener
					? a.addEventListener(b, c, !1)
					: null != a.attachEvent
					? a.attachEvent("on" + b, c)
					: (a[b] = c);
			}),
			(a.prototype.removeEvent = function (a, b, c) {
				return null != a.removeEventListener
					? a.removeEventListener(b, c, !1)
					: null != a.detachEvent
					? a.detachEvent("on" + b, c)
					: delete a[b];
			}),
			(a.prototype.innerHeight = function () {
				return "innerHeight" in window
					? window.innerHeight
					: document.documentElement.clientHeight;
			}),
			a
		);
	})()),
		(c =
			this.WeakMap ||
			this.MozWeakMap ||
			(c = (function () {
				function a() {
					(this.keys = []), (this.values = []);
				}
				return (
					(a.prototype.get = function (a) {
						var b, c, d, e, f;
						for (f = this.keys, b = d = 0, e = f.length; e > d; b = ++d)
							if (((c = f[b]), c === a)) return this.values[b];
					}),
					(a.prototype.set = function (a, b) {
						var c, d, e, f, g;
						for (g = this.keys, c = e = 0, f = g.length; f > e; c = ++e)
							if (((d = g[c]), d === a)) return void (this.values[c] = b);
						return this.keys.push(a), this.values.push(b);
					}),
					a
				);
			})())),
		(a =
			this.MutationObserver ||
			this.WebkitMutationObserver ||
			this.MozMutationObserver ||
			(a = (function () {
				function a() {
					"undefined" != typeof console &&
						null !== console &&
						console.warn("MutationObserver is not supported by your browser."),
						"undefined" != typeof console &&
							null !== console &&
							console.warn(
								"WOW.js cannot detect dom mutations, please call .sync() after loading new content."
							);
				}
				return (a.notSupported = !0), (a.prototype.observe = function () {}), a;
			})())),
		(d =
			this.getComputedStyle ||
			function (a, b) {
				return (
					(this.getPropertyValue = function (b) {
						var c;
						return (
							"float" === b && (b = "styleFloat"),
							e.test(b) &&
								b.replace(e, function (a, b) {
									return b.toUpperCase();
								}),
							(null != (c = a.currentStyle) ? c[b] : void 0) || null
						);
					}),
					this
				);
			}),
		(e = /(\-([a-z]){1})/g),
		(this.WOW = (function () {
			function e(a) {
				null == a && (a = {}),
					(this.scrollCallback = f(this.scrollCallback, this)),
					(this.scrollHandler = f(this.scrollHandler, this)),
					(this.resetAnimation = f(this.resetAnimation, this)),
					(this.start = f(this.start, this)),
					(this.scrolled = !0),
					(this.config = this.util().extend(a, this.defaults)),
					null != a.scrollContainer &&
						(this.config.scrollContainer = document.querySelector(
							a.scrollContainer
						)),
					(this.animationNameCache = new c()),
					(this.wowEvent = this.util().createEvent(this.config.boxClass));
			}
			return (
				(e.prototype.defaults = {
					boxClass: "wow",
					animateClass: "animated",
					offset: 0,
					mobile: !0,
					live: !0,
					callback: null,
					scrollContainer: null,
				}),
				(e.prototype.init = function () {
					var a;
					return (
						(this.element = window.document.documentElement),
						"interactive" === (a = document.readyState) || "complete" === a
							? this.start()
							: this.util().addEvent(document, "DOMContentLoaded", this.start),
						(this.finished = [])
					);
				}),
				(e.prototype.start = function () {
					var b, c, d, e;
					if (
						((this.stopped = !1),
						(this.boxes = function () {
							var a, c, d, e;
							for (
								d = this.element.querySelectorAll("." + this.config.boxClass),
									e = [],
									a = 0,
									c = d.length;
								c > a;
								a++
							)
								(b = d[a]), e.push(b);
							return e;
						}.call(this)),
						(this.all = function () {
							var a, c, d, e;
							for (d = this.boxes, e = [], a = 0, c = d.length; c > a; a++)
								(b = d[a]), e.push(b);
							return e;
						}.call(this)),
						this.boxes.length)
					)
						if (this.disabled()) this.resetStyle();
						else
							for (e = this.boxes, c = 0, d = e.length; d > c; c++)
								(b = e[c]), this.applyStyle(b, !0);
					return (
						this.disabled() ||
							(this.util().addEvent(
								this.config.scrollContainer || window,
								"scroll",
								this.scrollHandler
							),
							this.util().addEvent(window, "resize", this.scrollHandler),
							(this.interval = setInterval(this.scrollCallback, 50))),
						this.config.live
							? new a(
									(function (a) {
										return function (b) {
											var c, d, e, f, g;
											for (g = [], c = 0, d = b.length; d > c; c++)
												(f = b[c]),
													g.push(
														function () {
															var a, b, c, d;
															for (
																c = f.addedNodes || [],
																	d = [],
																	a = 0,
																	b = c.length;
																b > a;
																a++
															)
																(e = c[a]), d.push(this.doSync(e));
															return d;
														}.call(a)
													);
											return g;
										};
									})(this)
							  ).observe(document.body, { childList: !0, subtree: !0 })
							: void 0
					);
				}),
				(e.prototype.stop = function () {
					return (
						(this.stopped = !0),
						this.util().removeEvent(
							this.config.scrollContainer || window,
							"scroll",
							this.scrollHandler
						),
						this.util().removeEvent(window, "resize", this.scrollHandler),
						null != this.interval ? clearInterval(this.interval) : void 0
					);
				}),
				(e.prototype.sync = function (b) {
					return a.notSupported ? this.doSync(this.element) : void 0;
				}),
				(e.prototype.doSync = function (a) {
					var b, c, d, e, f;
					if ((null == a && (a = this.element), 1 === a.nodeType)) {
						for (
							a = a.parentNode || a,
								e = a.querySelectorAll("." + this.config.boxClass),
								f = [],
								c = 0,
								d = e.length;
							d > c;
							c++
						)
							(b = e[c]),
								g.call(this.all, b) < 0
									? (this.boxes.push(b),
									  this.all.push(b),
									  this.stopped || this.disabled()
											? this.resetStyle()
											: this.applyStyle(b, !0),
									  f.push((this.scrolled = !0)))
									: f.push(void 0);
						return f;
					}
				}),
				(e.prototype.show = function (a) {
					return (
						this.applyStyle(a),
						(a.className = a.className + " " + this.config.animateClass),
						null != this.config.callback && this.config.callback(a),
						this.util().emitEvent(a, this.wowEvent),
						this.util().addEvent(a, "animationend", this.resetAnimation),
						this.util().addEvent(a, "oanimationend", this.resetAnimation),
						this.util().addEvent(a, "webkitAnimationEnd", this.resetAnimation),
						this.util().addEvent(a, "MSAnimationEnd", this.resetAnimation),
						a
					);
				}),
				(e.prototype.applyStyle = function (a, b) {
					var c, d, e;
					return (
						(d = a.getAttribute("data-wow-duration")),
						(c = a.getAttribute("data-wow-delay")),
						(e = a.getAttribute("data-wow-iteration")),
						this.animate(
							(function (f) {
								return function () {
									return f.customStyle(a, b, d, c, e);
								};
							})(this)
						)
					);
				}),
				(e.prototype.animate = (function () {
					return "requestAnimationFrame" in window
						? function (a) {
								return window.requestAnimationFrame(a);
						  }
						: function (a) {
								return a();
						  };
				})()),
				(e.prototype.resetStyle = function () {
					var a, b, c, d, e;
					for (d = this.boxes, e = [], b = 0, c = d.length; c > b; b++)
						(a = d[b]), e.push((a.style.visibility = "visible"));
					return e;
				}),
				(e.prototype.resetAnimation = function (a) {
					var b;
					return a.type.toLowerCase().indexOf("animationend") >= 0
						? ((b = a.target || a.srcElement),
						  (b.className = b.className
								.replace(this.config.animateClass, "")
								.trim()))
						: void 0;
				}),
				(e.prototype.customStyle = function (a, b, c, d, e) {
					return (
						b && this.cacheAnimationName(a),
						(a.style.visibility = b ? "hidden" : "visible"),
						c && this.vendorSet(a.style, { animationDuration: c }),
						d && this.vendorSet(a.style, { animationDelay: d }),
						e && this.vendorSet(a.style, { animationIterationCount: e }),
						this.vendorSet(a.style, {
							animationName: b ? "none" : this.cachedAnimationName(a),
						}),
						a
					);
				}),
				(e.prototype.vendors = ["moz", "webkit"]),
				(e.prototype.vendorSet = function (a, b) {
					var c, d, e, f;
					d = [];
					for (c in b)
						(e = b[c]),
							(a["" + c] = e),
							d.push(
								function () {
									var b, d, g, h;
									for (
										g = this.vendors, h = [], b = 0, d = g.length;
										d > b;
										b++
									)
										(f = g[b]),
											h.push(
												(a[
													"" + f + c.charAt(0).toUpperCase() + c.substr(1)
												] = e)
											);
									return h;
								}.call(this)
							);
					return d;
				}),
				(e.prototype.vendorCSS = function (a, b) {
					var c, e, f, g, h, i;
					for (
						h = d(a),
							g = h.getPropertyCSSValue(b),
							f = this.vendors,
							c = 0,
							e = f.length;
						e > c;
						c++
					)
						(i = f[c]), (g = g || h.getPropertyCSSValue("-" + i + "-" + b));
					return g;
				}),
				(e.prototype.animationName = function (a) {
					var b;
					try {
						b = this.vendorCSS(a, "animation-name").cssText;
					} catch (c) {
						b = d(a).getPropertyValue("animation-name");
					}
					return "none" === b ? "" : b;
				}),
				(e.prototype.cacheAnimationName = function (a) {
					return this.animationNameCache.set(a, this.animationName(a));
				}),
				(e.prototype.cachedAnimationName = function (a) {
					return this.animationNameCache.get(a);
				}),
				(e.prototype.scrollHandler = function () {
					return (this.scrolled = !0);
				}),
				(e.prototype.scrollCallback = function () {
					var a;
					return !this.scrolled ||
						((this.scrolled = !1),
						(this.boxes = function () {
							var b, c, d, e;
							for (d = this.boxes, e = [], b = 0, c = d.length; c > b; b++)
								(a = d[b]), a && (this.isVisible(a) ? this.show(a) : e.push(a));
							return e;
						}.call(this)),
						this.boxes.length || this.config.live)
						? void 0
						: this.stop();
				}),
				(e.prototype.offsetTop = function (a) {
					for (var b; void 0 === a.offsetTop; ) a = a.parentNode;
					for (b = a.offsetTop; (a = a.offsetParent); ) b += a.offsetTop;
					return b;
				}),
				(e.prototype.isVisible = function (a) {
					var b, c, d, e, f;
					return (
						(c = a.getAttribute("data-wow-offset") || this.config.offset),
						(f =
							(this.config.scrollContainer &&
								this.config.scrollContainer.scrollTop) ||
							window.pageYOffset),
						(e =
							f +
							Math.min(this.element.clientHeight, this.util().innerHeight()) -
							c),
						(d = this.offsetTop(a)),
						(b = d + a.clientHeight),
						e >= d && b >= f
					);
				}),
				(e.prototype.util = function () {
					return null != this._util ? this._util : (this._util = new b());
				}),
				(e.prototype.disabled = function () {
					return (
						!this.config.mobile && this.util().isMobile(navigator.userAgent)
					);
				}),
				e
			);
		})());
}.call(this));

// IMAGES LOADED

!(function (e, t) {
	"function" == typeof define && define.amd
		? define("ev-emitter/ev-emitter", t)
		: "object" == typeof module && module.exports
		? (module.exports = t())
		: (e.EvEmitter = t());
})("undefined" != typeof window ? window : this, function () {
	function e() {}
	var t = e.prototype;
	return (
		(t.on = function (e, t) {
			if (e && t) {
				var i = (this._events = this._events || {}),
					n = (i[e] = i[e] || []);
				return n.indexOf(t) == -1 && n.push(t), this;
			}
		}),
		(t.once = function (e, t) {
			if (e && t) {
				this.on(e, t);
				var i = (this._onceEvents = this._onceEvents || {}),
					n = (i[e] = i[e] || {});
				return (n[t] = !0), this;
			}
		}),
		(t.off = function (e, t) {
			var i = this._events && this._events[e];
			if (i && i.length) {
				var n = i.indexOf(t);
				return n != -1 && i.splice(n, 1), this;
			}
		}),
		(t.emitEvent = function (e, t) {
			var i = this._events && this._events[e];
			if (i && i.length) {
				(i = i.slice(0)), (t = t || []);
				for (
					var n = this._onceEvents && this._onceEvents[e], o = 0;
					o < i.length;
					o++
				) {
					var r = i[o],
						s = n && n[r];
					s && (this.off(e, r), delete n[r]), r.apply(this, t);
				}
				return this;
			}
		}),
		(t.allOff = function () {
			delete this._events, delete this._onceEvents;
		}),
		e
	);
}),
	(function (e, t) {
		"use strict";
		"function" == typeof define && define.amd
			? define(["ev-emitter/ev-emitter"], function (i) {
					return t(e, i);
			  })
			: "object" == typeof module && module.exports
			? (module.exports = t(e, require("ev-emitter")))
			: (e.imagesLoaded = t(e, e.EvEmitter));
	})("undefined" != typeof window ? window : this, function (e, t) {
		function i(e, t) {
			for (var i in t) e[i] = t[i];
			return e;
		}
		function n(e) {
			if (Array.isArray(e)) return e;
			var t = "object" == typeof e && "number" == typeof e.length;
			return t ? d.call(e) : [e];
		}
		function o(e, t, r) {
			if (!(this instanceof o)) return new o(e, t, r);
			var s = e;
			return (
				"string" == typeof e && (s = document.querySelectorAll(e)),
				s
					? ((this.elements = n(s)),
					  (this.options = i({}, this.options)),
					  "function" == typeof t ? (r = t) : i(this.options, t),
					  r && this.on("always", r),
					  this.getImages(),
					  h && (this.jqDeferred = new h.Deferred()),
					  void setTimeout(this.check.bind(this)))
					: void a.error("Bad element for imagesLoaded " + (s || e))
			);
		}
		function r(e) {
			this.img = e;
		}
		function s(e, t) {
			(this.url = e), (this.element = t), (this.img = new Image());
		}
		var h = e.jQuery,
			a = e.console,
			d = Array.prototype.slice;
		(o.prototype = Object.create(t.prototype)),
			(o.prototype.options = {}),
			(o.prototype.getImages = function () {
				(this.images = []), this.elements.forEach(this.addElementImages, this);
			}),
			(o.prototype.addElementImages = function (e) {
				"IMG" == e.nodeName && this.addImage(e),
					this.options.background === !0 && this.addElementBackgroundImages(e);
				var t = e.nodeType;
				if (t && u[t]) {
					for (var i = e.querySelectorAll("img"), n = 0; n < i.length; n++) {
						var o = i[n];
						this.addImage(o);
					}
					if ("string" == typeof this.options.background) {
						var r = e.querySelectorAll(this.options.background);
						for (n = 0; n < r.length; n++) {
							var s = r[n];
							this.addElementBackgroundImages(s);
						}
					}
				}
			});
		var u = { 1: !0, 9: !0, 11: !0 };
		return (
			(o.prototype.addElementBackgroundImages = function (e) {
				var t = getComputedStyle(e);
				if (t)
					for (
						var i = /url\((['"])?(.*?)\1\)/gi, n = i.exec(t.backgroundImage);
						null !== n;

					) {
						var o = n && n[2];
						o && this.addBackground(o, e), (n = i.exec(t.backgroundImage));
					}
			}),
			(o.prototype.addImage = function (e) {
				var t = new r(e);
				this.images.push(t);
			}),
			(o.prototype.addBackground = function (e, t) {
				var i = new s(e, t);
				this.images.push(i);
			}),
			(o.prototype.check = function () {
				function e(e, i, n) {
					setTimeout(function () {
						t.progress(e, i, n);
					});
				}
				var t = this;
				return (
					(this.progressedCount = 0),
					(this.hasAnyBroken = !1),
					this.images.length
						? void this.images.forEach(function (t) {
								t.once("progress", e), t.check();
						  })
						: void this.complete()
				);
			}),
			(o.prototype.progress = function (e, t, i) {
				this.progressedCount++,
					(this.hasAnyBroken = this.hasAnyBroken || !e.isLoaded),
					this.emitEvent("progress", [this, e, t]),
					this.jqDeferred &&
						this.jqDeferred.notify &&
						this.jqDeferred.notify(this, e),
					this.progressedCount == this.images.length && this.complete(),
					this.options.debug && a && a.log("progress: " + i, e, t);
			}),
			(o.prototype.complete = function () {
				var e = this.hasAnyBroken ? "fail" : "done";
				if (
					((this.isComplete = !0),
					this.emitEvent(e, [this]),
					this.emitEvent("always", [this]),
					this.jqDeferred)
				) {
					var t = this.hasAnyBroken ? "reject" : "resolve";
					this.jqDeferred[t](this);
				}
			}),
			(r.prototype = Object.create(t.prototype)),
			(r.prototype.check = function () {
				var e = this.getIsImageComplete();
				return e
					? void this.confirm(0 !== this.img.naturalWidth, "naturalWidth")
					: ((this.proxyImage = new Image()),
					  this.proxyImage.addEventListener("load", this),
					  this.proxyImage.addEventListener("error", this),
					  this.img.addEventListener("load", this),
					  this.img.addEventListener("error", this),
					  void (this.proxyImage.src = this.img.src));
			}),
			(r.prototype.getIsImageComplete = function () {
				return this.img.complete && this.img.naturalWidth;
			}),
			(r.prototype.confirm = function (e, t) {
				(this.isLoaded = e), this.emitEvent("progress", [this, this.img, t]);
			}),
			(r.prototype.handleEvent = function (e) {
				var t = "on" + e.type;
				this[t] && this[t](e);
			}),
			(r.prototype.onload = function () {
				this.confirm(!0, "onload"), this.unbindEvents();
			}),
			(r.prototype.onerror = function () {
				this.confirm(!1, "onerror"), this.unbindEvents();
			}),
			(r.prototype.unbindEvents = function () {
				this.proxyImage.removeEventListener("load", this),
					this.proxyImage.removeEventListener("error", this),
					this.img.removeEventListener("load", this),
					this.img.removeEventListener("error", this);
			}),
			(s.prototype = Object.create(r.prototype)),
			(s.prototype.check = function () {
				this.img.addEventListener("load", this),
					this.img.addEventListener("error", this),
					(this.img.src = this.url);
				var e = this.getIsImageComplete();
				e &&
					(this.confirm(0 !== this.img.naturalWidth, "naturalWidth"),
					this.unbindEvents());
			}),
			(s.prototype.unbindEvents = function () {
				this.img.removeEventListener("load", this),
					this.img.removeEventListener("error", this);
			}),
			(s.prototype.confirm = function (e, t) {
				(this.isLoaded = e),
					this.emitEvent("progress", [this, this.element, t]);
			}),
			(o.makeJQueryPlugin = function (t) {
				(t = t || e.jQuery),
					t &&
						((h = t),
						(h.fn.imagesLoaded = function (e, t) {
							var i = new o(this, e, t);
							return i.jqDeferred.promise(h(this));
						}));
			}),
			o.makeJQueryPlugin(),
			o
		);
	});

/**
 * bxSlider v4.2.1d
 * Copyright 2013-2017 Steven Wanderski
 * Written while drinking Belgian ales and listening to jazz
 * Licensed under MIT (http://opensource.org/licenses/MIT)
 */
!(function (t) {
	var e = {
		mode: "horizontal",
		slideSelector: "",
		infiniteLoop: !0,
		hideControlOnEnd: !1,
		speed: 500,
		easing: null,
		slideMargin: 0,
		startSlide: 0,
		randomStart: !1,
		captions: !1,
		ticker: !1,
		tickerHover: !1,
		adaptiveHeight: !1,
		adaptiveHeightSpeed: 500,
		video: !1,
		useCSS: !0,
		preloadImages: "visible",
		responsive: !0,
		slideZIndex: 50,
		wrapperClass: "bx-wrapper",
		touchEnabled: !0,
		swipeThreshold: 50,
		oneToOneTouch: !0,
		preventDefaultSwipeX: !0,
		preventDefaultSwipeY: !1,
		ariaLive: !0,
		ariaHidden: !0,
		keyboardEnabled: !1,
		pager: !0,
		pagerType: "full",
		pagerShortSeparator: " / ",
		pagerSelector: null,
		buildPager: null,
		pagerCustom: null,
		controls: !0,
		nextText: "Next",
		prevText: "Prev",
		nextSelector: null,
		prevSelector: null,
		autoControls: !1,
		startText: "Start",
		stopText: "Stop",
		autoControlsCombine: !1,
		autoControlsSelector: null,
		auto: !1,
		pause: 4e3,
		autoStart: !0,
		autoDirection: "next",
		stopAutoOnClick: !1,
		autoHover: !1,
		autoDelay: 0,
		autoSlideForOnePage: !1,
		minSlides: 1,
		maxSlides: 1,
		moveSlides: 0,
		slideWidth: 0,
		shrinkItems: !1,
		onSliderLoad: function () {
			return !0;
		},
		onSlideBefore: function () {
			return !0;
		},
		onSlideAfter: function () {
			return !0;
		},
		onSlideNext: function () {
			return !0;
		},
		onSlidePrev: function () {
			return !0;
		},
		onSliderResize: function () {
			return !0;
		},
		onAutoChange: function () {
			return !0;
		},
	};
	t.fn.bxSlider = function (n) {
		if (0 === this.length) return this;
		if (this.length > 1)
			return (
				this.each(function () {
					t(this).bxSlider(n);
				}),
				this
			);
		var s = {},
			o = this,
			r = t(window).width(),
			a = t(window).height();
		if (!t(o).data("bxSlider")) {
			var l = function () {
					t(o).data("bxSlider") ||
						((s.settings = t.extend({}, e, n)),
						(s.settings.slideWidth = parseInt(s.settings.slideWidth)),
						(s.children = o.children(s.settings.slideSelector)),
						s.children.length < s.settings.minSlides &&
							(s.settings.minSlides = s.children.length),
						s.children.length < s.settings.maxSlides &&
							(s.settings.maxSlides = s.children.length),
						s.settings.randomStart &&
							(s.settings.startSlide = Math.floor(
								Math.random() * s.children.length
							)),
						(s.active = { index: s.settings.startSlide }),
						(s.carousel = s.settings.minSlides > 1 || s.settings.maxSlides > 1),
						s.carousel && (s.settings.preloadImages = "all"),
						(s.minThreshold =
							s.settings.minSlides * s.settings.slideWidth +
							(s.settings.minSlides - 1) * s.settings.slideMargin),
						(s.maxThreshold =
							s.settings.maxSlides * s.settings.slideWidth +
							(s.settings.maxSlides - 1) * s.settings.slideMargin),
						(s.working = !1),
						(s.controls = {}),
						(s.interval = null),
						(s.animProp = "vertical" === s.settings.mode ? "top" : "left"),
						(s.usingCSS =
							s.settings.useCSS &&
							"fade" !== s.settings.mode &&
							(function () {
								for (
									var t = document.createElement("div"),
										e = [
											"WebkitPerspective",
											"MozPerspective",
											"OPerspective",
											"msPerspective",
										],
										i = 0;
									i < e.length;
									i++
								)
									if (void 0 !== t.style[e[i]])
										return (
											(s.cssPrefix = e[i]
												.replace("Perspective", "")
												.toLowerCase()),
											(s.animProp = "-" + s.cssPrefix + "-transform"),
											!0
										);
								return !1;
							})()),
						"vertical" === s.settings.mode &&
							(s.settings.maxSlides = s.settings.minSlides),
						o.data("origStyle", o.attr("style")),
						o.children(s.settings.slideSelector).each(function () {
							t(this).data("origStyle", t(this).attr("style"));
						}),
						d());
				},
				d = function () {
					var e = s.children.eq(s.settings.startSlide);
					o.wrap(
						'<div class="' +
							s.settings.wrapperClass +
							'"><div class="bx-viewport"></div></div>'
					),
						(s.viewport = o.parent()),
						s.settings.ariaLive &&
							!s.settings.ticker &&
							s.viewport.attr("aria-live", "polite"),
						(s.loader = t('<div class="bx-loading" />')),
						s.viewport.prepend(s.loader),
						o.css({
							width:
								"horizontal" === s.settings.mode
									? 1e3 * s.children.length + 215 + "%"
									: "auto",
							position: "relative",
						}),
						s.usingCSS && s.settings.easing
							? o.css(
									"-" + s.cssPrefix + "-transition-timing-function",
									s.settings.easing
							  )
							: s.settings.easing || (s.settings.easing = "swing"),
						s.viewport.css({
							width: "100%",
							overflow: "hidden",
							position: "relative",
						}),
						s.viewport.parent().css({ maxWidth: u() }),
						s.children.css({
							float: "horizontal" === s.settings.mode ? "left" : "none",
							listStyle: "none",
							position: "relative",
						}),
						s.children.css("width", h()),
						"horizontal" === s.settings.mode &&
							s.settings.slideMargin > 0 &&
							s.children.css("marginRight", s.settings.slideMargin),
						"vertical" === s.settings.mode &&
							s.settings.slideMargin > 0 &&
							s.children.css("marginBottom", s.settings.slideMargin),
						"fade" === s.settings.mode &&
							(s.children.css({
								position: "absolute",
								zIndex: 0,
								display: "none",
							}),
							s.children
								.eq(s.settings.startSlide)
								.css({ zIndex: s.settings.slideZIndex, display: "block" })),
						(s.controls.el = t('<div class="bx-controls" />')),
						s.settings.captions && k(),
						(s.active.last = s.settings.startSlide === f() - 1),
						s.settings.video && o.fitVids(),
						"none" === s.settings.preloadImages
							? (e = null)
							: ("all" === s.settings.preloadImages || s.settings.ticker) &&
							  (e = s.children),
						s.settings.ticker
							? (s.settings.pager = !1)
							: (s.settings.controls && C(),
							  s.settings.auto && s.settings.autoControls && T(),
							  s.settings.pager && b(),
							  (s.settings.controls ||
									s.settings.autoControls ||
									s.settings.pager) &&
									s.viewport.after(s.controls.el)),
						null === e ? g() : c(e, g);
				},
				c = function (e, i) {
					var n = e.find('img:not([src=""]), iframe').length,
						s = 0;
					if (0 === n) return void i();
					e.find('img:not([src=""]), iframe').each(function () {
						t(this)
							.one("load error", function () {
								++s === n && i();
							})
							.each(function () {
								(this.complete || "" == this.src) && t(this).trigger("load");
							});
					});
				},
				g = function () {
					if (
						s.settings.infiniteLoop &&
						"fade" !== s.settings.mode &&
						!s.settings.ticker
					) {
						var e =
								"vertical" === s.settings.mode
									? s.settings.minSlides
									: s.settings.maxSlides,
							i = s.children.slice(0, e).clone(!0).addClass("bx-clone"),
							n = s.children.slice(-e).clone(!0).addClass("bx-clone");
						s.settings.ariaHidden &&
							(i.attr("aria-hidden", !0), n.attr("aria-hidden", !0)),
							o.append(i).prepend(n);
					}
					s.loader.remove(),
						m(),
						"vertical" === s.settings.mode && (s.settings.adaptiveHeight = !0),
						s.viewport.height(p()),
						o.redrawSlider(),
						s.settings.onSliderLoad.call(o, s.active.index),
						(s.initialized = !0),
						s.settings.responsive && t(window).on("resize", U),
						s.settings.auto &&
							s.settings.autoStart &&
							(f() > 1 || s.settings.autoSlideForOnePage) &&
							L(),
						s.settings.ticker && O(),
						s.settings.pager && z(s.settings.startSlide),
						s.settings.controls && q(),
						s.settings.touchEnabled && !s.settings.ticker && X(),
						s.settings.keyboardEnabled &&
							!s.settings.ticker &&
							t(document).keydown(B);
				},
				p = function () {
					var e = 0,
						n = t();
					if ("vertical" === s.settings.mode || s.settings.adaptiveHeight)
						if (s.carousel) {
							var o =
								1 === s.settings.moveSlides
									? s.active.index
									: s.active.index * x();
							for (
								n = s.children.eq(o), i = 1;
								i <= s.settings.maxSlides - 1;
								i++
							)
								n =
									o + i >= s.children.length
										? n.add(s.children.eq(i - 1))
										: n.add(s.children.eq(o + i));
						} else n = s.children.eq(s.active.index);
					else n = s.children;
					return (
						"vertical" === s.settings.mode
							? (n.each(function (i) {
									e += t(this).outerHeight();
							  }),
							  s.settings.slideMargin > 0 &&
									(e += s.settings.slideMargin * (s.settings.minSlides - 1)))
							: (e = Math.max.apply(
									Math,
									n
										.map(function () {
											return t(this).outerHeight(!1);
										})
										.get()
							  )),
						"border-box" === s.viewport.css("box-sizing")
							? (e +=
									parseFloat(s.viewport.css("padding-top")) +
									parseFloat(s.viewport.css("padding-bottom")) +
									parseFloat(s.viewport.css("border-top-width")) +
									parseFloat(s.viewport.css("border-bottom-width")))
							: "padding-box" === s.viewport.css("box-sizing") &&
							  (e +=
									parseFloat(s.viewport.css("padding-top")) +
									parseFloat(s.viewport.css("padding-bottom"))),
						e
					);
				},
				u = function () {
					var t = "100%";
					return (
						s.settings.slideWidth > 0 &&
							(t =
								"horizontal" === s.settings.mode
									? s.settings.maxSlides * s.settings.slideWidth +
									  (s.settings.maxSlides - 1) * s.settings.slideMargin
									: s.settings.slideWidth),
						t
					);
				},
				h = function () {
					var t = s.settings.slideWidth,
						e = s.viewport.width();
					if (
						0 === s.settings.slideWidth ||
						(s.settings.slideWidth > e && !s.carousel) ||
						"vertical" === s.settings.mode
					)
						t = e;
					else if (
						s.settings.maxSlides > 1 &&
						"horizontal" === s.settings.mode
					) {
						if (e > s.maxThreshold) return t;
						e < s.minThreshold
							? (t =
									(e - s.settings.slideMargin * (s.settings.minSlides - 1)) /
									s.settings.minSlides)
							: s.settings.shrinkItems &&
							  (t = Math.floor(
									(e + s.settings.slideMargin) /
										Math.ceil(
											(e + s.settings.slideMargin) /
												(t + s.settings.slideMargin)
										) -
										s.settings.slideMargin
							  ));
					}
					return t;
				},
				v = function () {
					var t = 1,
						e = null;
					return (
						"horizontal" === s.settings.mode && s.settings.slideWidth > 0
							? s.viewport.width() < s.minThreshold
								? (t = s.settings.minSlides)
								: s.viewport.width() > s.maxThreshold
								? (t = s.settings.maxSlides)
								: ((e = s.children.first().width() + s.settings.slideMargin),
								  (t =
										Math.floor(
											(s.viewport.width() + s.settings.slideMargin) / e
										) || 1))
							: "vertical" === s.settings.mode && (t = s.settings.minSlides),
						t
					);
				},
				f = function () {
					var t = 0,
						e = 0,
						i = 0;
					if (s.settings.moveSlides > 0) {
						if (!s.settings.infiniteLoop) {
							for (; e < s.children.length; )
								++t,
									(e = i + v()),
									(i +=
										s.settings.moveSlides <= v() ? s.settings.moveSlides : v());
							return i;
						}
						t = Math.ceil(s.children.length / x());
					} else t = Math.ceil(s.children.length / v());
					return t;
				},
				x = function () {
					return s.settings.moveSlides > 0 && s.settings.moveSlides <= v()
						? s.settings.moveSlides
						: v();
				},
				m = function () {
					var t, e, i;
					s.children.length > s.settings.maxSlides &&
					s.active.last &&
					!s.settings.infiniteLoop
						? "horizontal" === s.settings.mode
							? ((e = s.children.last()),
							  (t = e.position()),
							  S(
									-(t.left - (s.viewport.width() - e.outerWidth())),
									"reset",
									0
							  ))
							: "vertical" === s.settings.mode &&
							  ((i = s.children.length - s.settings.minSlides),
							  (t = s.children.eq(i).position()),
							  S(-t.top, "reset", 0))
						: ((t = s.children.eq(s.active.index * x()).position()),
						  s.active.index === f() - 1 && (s.active.last = !0),
						  void 0 !== t &&
								("horizontal" === s.settings.mode
									? S(-t.left, "reset", 0)
									: "vertical" === s.settings.mode && S(-t.top, "reset", 0)));
				},
				S = function (e, i, n, r) {
					var a, l;
					s.usingCSS
						? ((l =
								"vertical" === s.settings.mode
									? "translate3d(0, " + e + "px, 0)"
									: "translate3d(" + e + "px, 0, 0)"),
						  o.css("-" + s.cssPrefix + "-transition-duration", n / 1e3 + "s"),
						  "slide" === i
								? (o.css(s.animProp, l),
								  0 !== n
										? o.on(
												"transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd",
												function (e) {
													t(e.target).is(o) &&
														(o.off(
															"transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd"
														),
														A());
												}
										  )
										: A())
								: "reset" === i
								? o.css(s.animProp, l)
								: "ticker" === i &&
								  (o.css(
										"-" + s.cssPrefix + "-transition-timing-function",
										"linear"
								  ),
								  o.css(s.animProp, l),
								  0 !== n
										? o.on(
												"transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd",
												function (e) {
													t(e.target).is(o) &&
														(o.off(
															"transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd"
														),
														S(r.resetValue, "reset", 0),
														F());
												}
										  )
										: (S(r.resetValue, "reset", 0), F())))
						: ((a = {}),
						  (a[s.animProp] = e),
						  "slide" === i
								? o.animate(a, n, s.settings.easing, function () {
										A();
								  })
								: "reset" === i
								? o.css(s.animProp, e)
								: "ticker" === i &&
								  o.animate(a, n, "linear", function () {
										S(r.resetValue, "reset", 0), F();
								  }));
				},
				w = function () {
					for (var e = "", i = "", n = f(), o = 0; o < n; o++)
						(i = ""),
							(s.settings.buildPager && t.isFunction(s.settings.buildPager)) ||
							s.settings.pagerCustom
								? ((i = s.settings.buildPager(o)),
								  s.pagerEl.addClass("bx-custom-pager"))
								: ((i = o + 1), s.pagerEl.addClass("bx-default-pager")),
							(e +=
								'<div class="bx-pager-item"><a href="" data-slide-index="' +
								o +
								'" class="bx-pager-link">' +
								i +
								"</a></div>");
					s.pagerEl.html(e);
				},
				b = function () {
					s.settings.pagerCustom
						? (s.pagerEl = t(s.settings.pagerCustom))
						: ((s.pagerEl = t('<div class="bx-pager" />')),
						  s.settings.pagerSelector
								? t(s.settings.pagerSelector).html(s.pagerEl)
								: s.controls.el.addClass("bx-has-pager").append(s.pagerEl),
						  w()),
						s.pagerEl.on("click touchend", "a", I);
				},
				C = function () {
					(s.controls.next = t(
						'<a class="bx-next" href="">' + s.settings.nextText + "</a>"
					)),
						(s.controls.prev = t(
							'<a class="bx-prev" href="">' + s.settings.prevText + "</a>"
						)),
						s.controls.next.on("click touchend", P),
						s.controls.prev.on("click touchend", E),
						s.settings.nextSelector &&
							t(s.settings.nextSelector).append(s.controls.next),
						s.settings.prevSelector &&
							t(s.settings.prevSelector).append(s.controls.prev),
						s.settings.nextSelector ||
							s.settings.prevSelector ||
							((s.controls.directionEl = t(
								'<div class="bx-controls-direction" />'
							)),
							s.controls.directionEl
								.append(s.controls.prev)
								.append(s.controls.next),
							s.controls.el
								.addClass("bx-has-controls-direction")
								.append(s.controls.directionEl));
				},
				T = function () {
					(s.controls.start = t(
						'<div class="bx-controls-auto-item"><a class="bx-start" href="">' +
							s.settings.startText +
							"</a></div>"
					)),
						(s.controls.stop = t(
							'<div class="bx-controls-auto-item"><a class="bx-stop" href="">' +
								s.settings.stopText +
								"</a></div>"
						)),
						(s.controls.autoEl = t('<div class="bx-controls-auto" />')),
						s.controls.autoEl.on("click", ".bx-start", M),
						s.controls.autoEl.on("click", ".bx-stop", y),
						s.settings.autoControlsCombine
							? s.controls.autoEl.append(s.controls.start)
							: s.controls.autoEl
									.append(s.controls.start)
									.append(s.controls.stop),
						s.settings.autoControlsSelector
							? t(s.settings.autoControlsSelector).html(s.controls.autoEl)
							: s.controls.el
									.addClass("bx-has-controls-auto")
									.append(s.controls.autoEl),
						D(s.settings.autoStart ? "stop" : "start");
				},
				k = function () {
					s.children.each(function (e) {
						var i = t(this).find("img:first").attr("title");
						void 0 !== i &&
							("" + i).length &&
							t(this).append(
								'<div class="bx-caption"><span>' + i + "</span></div>"
							);
					});
				},
				P = function (t) {
					t.preventDefault(),
						s.controls.el.hasClass("disabled") ||
							(s.settings.auto && s.settings.stopAutoOnClick && o.stopAuto(),
							o.goToNextSlide());
				},
				E = function (t) {
					t.preventDefault(),
						s.controls.el.hasClass("disabled") ||
							(s.settings.auto && s.settings.stopAutoOnClick && o.stopAuto(),
							o.goToPrevSlide());
				},
				M = function (t) {
					o.startAuto(), t.preventDefault();
				},
				y = function (t) {
					o.stopAuto(), t.preventDefault();
				},
				I = function (e) {
					var i, n;
					e.preventDefault(),
						s.controls.el.hasClass("disabled") ||
							(s.settings.auto && s.settings.stopAutoOnClick && o.stopAuto(),
							(i = t(e.currentTarget)),
							void 0 !== i.attr("data-slide-index") &&
								(n = parseInt(i.attr("data-slide-index"))) !== s.active.index &&
								o.goToSlide(n));
				},
				z = function (e) {
					var i = s.children.length;
					if ("short" === s.settings.pagerType)
						return (
							s.settings.maxSlides > 1 &&
								(i = Math.ceil(s.children.length / s.settings.maxSlides)),
							void s.pagerEl.html(e + 1 + s.settings.pagerShortSeparator + i)
						);
					s.pagerEl.find("a").removeClass("active"),
						s.pagerEl.each(function (i, n) {
							t(n).find("a").eq(e).addClass("active");
						});
				},
				A = function () {
					if (s.settings.infiniteLoop) {
						var t = "";
						0 === s.active.index
							? (t = s.children.eq(0).position())
							: s.active.index === f() - 1 && s.carousel
							? (t = s.children.eq((f() - 1) * x()).position())
							: s.active.index === s.children.length - 1 &&
							  (t = s.children.eq(s.children.length - 1).position()),
							t &&
								("horizontal" === s.settings.mode
									? S(-t.left, "reset", 0)
									: "vertical" === s.settings.mode && S(-t.top, "reset", 0));
					}
					(s.working = !1),
						s.settings.onSlideAfter.call(
							o,
							s.children.eq(s.active.index),
							s.oldIndex,
							s.active.index
						);
				},
				D = function (t) {
					s.settings.autoControlsCombine
						? s.controls.autoEl.html(s.controls[t])
						: (s.controls.autoEl.find("a").removeClass("active"),
						  s.controls.autoEl
								.find("a:not(.bx-" + t + ")")
								.addClass("active"));
				},
				q = function () {
					1 === f()
						? (s.controls.prev.addClass("disabled"),
						  s.controls.next.addClass("disabled"))
						: !s.settings.infiniteLoop &&
						  s.settings.hideControlOnEnd &&
						  (0 === s.active.index
								? (s.controls.prev.addClass("disabled"),
								  s.controls.next.removeClass("disabled"))
								: s.active.index === f() - 1
								? (s.controls.next.addClass("disabled"),
								  s.controls.prev.removeClass("disabled"))
								: (s.controls.prev.removeClass("disabled"),
								  s.controls.next.removeClass("disabled")));
				},
				H = function () {
					o.startAuto();
				},
				W = function () {
					o.stopAuto();
				},
				L = function () {
					s.settings.autoDelay > 0
						? setTimeout(o.startAuto, s.settings.autoDelay)
						: (o.startAuto(), t(window).focus(H).blur(W)),
						s.settings.autoHover &&
							o.hover(
								function () {
									s.interval && (o.stopAuto(!0), (s.autoPaused = !0));
								},
								function () {
									s.autoPaused && (o.startAuto(!0), (s.autoPaused = null));
								}
							);
				},
				O = function () {
					var e,
						i,
						n,
						r,
						a,
						l,
						d,
						c,
						g = 0;
					"next" === s.settings.autoDirection
						? o.append(s.children.clone().addClass("bx-clone"))
						: (o.prepend(s.children.clone().addClass("bx-clone")),
						  (e = s.children.first().position()),
						  (g = "horizontal" === s.settings.mode ? -e.left : -e.top)),
						S(g, "reset", 0),
						(s.settings.pager = !1),
						(s.settings.controls = !1),
						(s.settings.autoControls = !1),
						s.settings.tickerHover &&
							(s.usingCSS
								? ((r = "horizontal" === s.settings.mode ? 4 : 5),
								  s.viewport.hover(
										function () {
											(i = o.css("-" + s.cssPrefix + "-transform")),
												(n = parseFloat(i.split(",")[r])),
												S(n, "reset", 0);
										},
										function () {
											(c = 0),
												s.children.each(function (e) {
													c +=
														"horizontal" === s.settings.mode
															? t(this).outerWidth(!0)
															: t(this).outerHeight(!0);
												}),
												(a = s.settings.speed / c),
												(l = "horizontal" === s.settings.mode ? "left" : "top"),
												(d = a * (c - Math.abs(parseInt(n)))),
												F(d);
										}
								  ))
								: s.viewport.hover(
										function () {
											o.stop();
										},
										function () {
											(c = 0),
												s.children.each(function (e) {
													c +=
														"horizontal" === s.settings.mode
															? t(this).outerWidth(!0)
															: t(this).outerHeight(!0);
												}),
												(a = s.settings.speed / c),
												(l = "horizontal" === s.settings.mode ? "left" : "top"),
												(d = a * (c - Math.abs(parseInt(o.css(l))))),
												F(d);
										}
								  )),
						F();
				},
				F = function (t) {
					var e,
						i,
						n,
						r = t || s.settings.speed,
						a = { left: 0, top: 0 },
						l = { left: 0, top: 0 };
					"next" === s.settings.autoDirection
						? (a = o.find(".bx-clone").first().position())
						: (l = s.children.first().position()),
						(e = "horizontal" === s.settings.mode ? -a.left : -a.top),
						(i = "horizontal" === s.settings.mode ? -l.left : -l.top),
						(n = { resetValue: i }),
						S(e, "ticker", r, n);
				},
				N = function (e) {
					var i = t(window),
						n = { top: i.scrollTop(), left: i.scrollLeft() },
						s = e.offset();
					return (
						(n.right = n.left + i.width()),
						(n.bottom = n.top + i.height()),
						(s.right = s.left + e.outerWidth()),
						(s.bottom = s.top + e.outerHeight()),
						!(
							n.right < s.left ||
							n.left > s.right ||
							n.bottom < s.top ||
							n.top > s.bottom
						)
					);
				},
				B = function (t) {
					var e = document.activeElement.tagName.toLowerCase();
					if (null == new RegExp(e, ["i"]).exec("input|textarea") && N(o)) {
						if (39 === t.keyCode) return P(t), !1;
						if (37 === t.keyCode) return E(t), !1;
					}
				},
				X = function () {
					(s.touch = { start: { x: 0, y: 0 }, end: { x: 0, y: 0 } }),
						s.viewport.on("touchstart MSPointerDown pointerdown", Y),
						s.viewport.on("click", ".bxslider a", function (t) {
							s.viewport.hasClass("click-disabled") &&
								(t.preventDefault(), s.viewport.removeClass("click-disabled"));
						});
				},
				Y = function (t) {
					if ("touchstart" === t.type || 0 === t.button)
						if (
							(t.preventDefault(),
							s.controls.el.addClass("disabled"),
							s.working)
						)
							s.controls.el.removeClass("disabled");
						else {
							s.touch.originalPos = o.position();
							var e = t.originalEvent,
								i = void 0 !== e.changedTouches ? e.changedTouches : [e],
								n = "function" == typeof PointerEvent;
							if (n && void 0 === e.pointerId) return;
							(s.touch.start.x = i[0].pageX),
								(s.touch.start.y = i[0].pageY),
								s.viewport.get(0).setPointerCapture &&
									((s.pointerId = e.pointerId),
									s.viewport.get(0).setPointerCapture(s.pointerId)),
								(s.originalClickTarget = e.originalTarget || e.target),
								(s.originalClickButton = e.button),
								(s.originalClickButtons = e.buttons),
								(s.originalEventType = e.type),
								(s.hasMove = !1),
								s.viewport.on("touchmove MSPointerMove pointermove", R),
								s.viewport.on("touchend MSPointerUp pointerup", Z),
								s.viewport.on("MSPointerCancel pointercancel", V);
						}
				},
				V = function (t) {
					t.preventDefault(),
						S(s.touch.originalPos.left, "reset", 0),
						s.controls.el.removeClass("disabled"),
						s.viewport.off("MSPointerCancel pointercancel", V),
						s.viewport.off("touchmove MSPointerMove pointermove", R),
						s.viewport.off("touchend MSPointerUp pointerup", Z),
						s.viewport.get(0).releasePointerCapture &&
							s.viewport.get(0).releasePointerCapture(s.pointerId);
				},
				R = function (t) {
					var e = t.originalEvent,
						i = void 0 !== e.changedTouches ? e.changedTouches : [e],
						n = Math.abs(i[0].pageX - s.touch.start.x),
						o = Math.abs(i[0].pageY - s.touch.start.y),
						r = 0,
						a = 0;
					(s.hasMove = !0),
						3 * n > o && s.settings.preventDefaultSwipeX
							? t.preventDefault()
							: 3 * o > n &&
							  s.settings.preventDefaultSwipeY &&
							  t.preventDefault(),
						"touchmove" !== t.type && t.preventDefault(),
						"fade" !== s.settings.mode &&
							s.settings.oneToOneTouch &&
							("horizontal" === s.settings.mode
								? ((a = i[0].pageX - s.touch.start.x),
								  (r = s.touch.originalPos.left + a))
								: ((a = i[0].pageY - s.touch.start.y),
								  (r = s.touch.originalPos.top + a)),
							S(r, "reset", 0));
				},
				Z = function (e) {
					e.preventDefault(),
						s.viewport.off("touchmove MSPointerMove pointermove", R),
						s.controls.el.removeClass("disabled");
					var i = e.originalEvent,
						n = void 0 !== i.changedTouches ? i.changedTouches : [i],
						r = 0,
						a = 0;
					(s.touch.end.x = n[0].pageX),
						(s.touch.end.y = n[0].pageY),
						"fade" === s.settings.mode
							? (a = Math.abs(s.touch.start.x - s.touch.end.x)) >=
									s.settings.swipeThreshold &&
							  (s.touch.start.x > s.touch.end.x
									? o.goToNextSlide()
									: o.goToPrevSlide(),
							  o.stopAuto())
							: ("horizontal" === s.settings.mode
									? ((a = s.touch.end.x - s.touch.start.x),
									  (r = s.touch.originalPos.left))
									: ((a = s.touch.end.y - s.touch.start.y),
									  (r = s.touch.originalPos.top)),
							  !s.settings.infiniteLoop &&
							  ((0 === s.active.index && a > 0) || (s.active.last && a < 0))
									? S(r, "reset", 200)
									: Math.abs(a) >= s.settings.swipeThreshold
									? (a < 0 ? o.goToNextSlide() : o.goToPrevSlide(),
									  o.stopAuto())
									: S(r, "reset", 200)),
						s.viewport.off("touchend MSPointerUp pointerup", Z),
						s.viewport.get(0).releasePointerCapture &&
							s.viewport.get(0).releasePointerCapture(s.pointerId),
						!1 !== s.hasMove ||
							(0 !== s.originalClickButton &&
								"touchstart" !== s.originalEventType) ||
							t(s.originalClickTarget).trigger({
								type: "click",
								button: s.originalClickButton,
								buttons: s.originalClickButtons,
							});
				},
				U = function (e) {
					if (s.initialized)
						if (s.working) window.setTimeout(U, 10);
						else {
							var i = t(window).width(),
								n = t(window).height();
							(r === i && a === n) ||
								((r = i),
								(a = n),
								o.redrawSlider(),
								s.settings.onSliderResize.call(o, s.active.index));
						}
				},
				j = function (t) {
					var e = v();
					s.settings.ariaHidden &&
						!s.settings.ticker &&
						(s.children.attr("aria-hidden", "true"),
						s.children.slice(t, t + e).attr("aria-hidden", "false"));
				},
				Q = function (t) {
					return t < 0
						? s.settings.infiniteLoop
							? f() - 1
							: s.active.index
						: t >= f()
						? s.settings.infiniteLoop
							? 0
							: s.active.index
						: t;
				};
			return (
				(o.goToSlide = function (e, i) {
					var n,
						r,
						a,
						l,
						d = !0,
						c = 0,
						g = { left: 0, top: 0 },
						u = null;
					if (
						((s.oldIndex = s.active.index),
						(s.active.index = Q(e)),
						!s.working && s.active.index !== s.oldIndex)
					) {
						if (
							((s.working = !0),
							void 0 !==
								(d = s.settings.onSlideBefore.call(
									o,
									s.children.eq(s.active.index),
									s.oldIndex,
									s.active.index
								)) && !d)
						)
							return (s.active.index = s.oldIndex), void (s.working = !1);
						"next" === i
							? s.settings.onSlideNext.call(
									o,
									s.children.eq(s.active.index),
									s.oldIndex,
									s.active.index
							  ) || (d = !1)
							: "prev" === i &&
							  (s.settings.onSlidePrev.call(
									o,
									s.children.eq(s.active.index),
									s.oldIndex,
									s.active.index
							  ) ||
									(d = !1)),
							(s.active.last = s.active.index >= f() - 1),
							(s.settings.pager || s.settings.pagerCustom) && z(s.active.index),
							s.settings.controls && q(),
							"fade" === s.settings.mode
								? (s.settings.adaptiveHeight &&
										s.viewport.height() !== p() &&
										s.viewport.animate(
											{ height: p() },
											s.settings.adaptiveHeightSpeed
										),
								  s.children
										.filter(":visible")
										.fadeOut(s.settings.speed)
										.css({ zIndex: 0 }),
								  s.children
										.eq(s.active.index)
										.css("zIndex", s.settings.slideZIndex + 1)
										.fadeIn(s.settings.speed, function () {
											t(this).css("zIndex", s.settings.slideZIndex), A();
										}))
								: (s.settings.adaptiveHeight &&
										s.viewport.height() !== p() &&
										s.viewport.animate(
											{ height: p() },
											s.settings.adaptiveHeightSpeed
										),
								  !s.settings.infiniteLoop && s.carousel && s.active.last
										? "horizontal" === s.settings.mode
											? ((u = s.children.eq(s.children.length - 1)),
											  (g = u.position()),
											  (c = s.viewport.width() - u.outerWidth()))
											: ((n = s.children.length - s.settings.minSlides),
											  (g = s.children.eq(n).position()))
										: s.carousel && s.active.last && "prev" === i
										? ((r =
												1 === s.settings.moveSlides
													? s.settings.maxSlides - x()
													: (f() - 1) * x() -
													  (s.children.length - s.settings.maxSlides)),
										  (u = o.children(".bx-clone").eq(r)),
										  (g = u.position()))
										: "next" === i && 0 === s.active.index
										? ((g = o
												.find("> .bx-clone")
												.eq(s.settings.maxSlides)
												.position()),
										  (s.active.last = !1))
										: e >= 0 &&
										  ((l = e * parseInt(x())),
										  (g = s.children.eq(l).position())),
								  void 0 !== g &&
										((a =
											"horizontal" === s.settings.mode
												? -(g.left - c)
												: -g.top),
										S(a, "slide", s.settings.speed)),
								  (s.working = !1)),
							s.settings.ariaHidden && j(s.active.index * x());
					}
				}),
				(o.goToNextSlide = function () {
					if ((s.settings.infiniteLoop || !s.active.last) && !0 !== s.working) {
						var t = parseInt(s.active.index) + 1;
						o.goToSlide(t, "next");
					}
				}),
				(o.goToPrevSlide = function () {
					if (
						(s.settings.infiniteLoop || 0 !== s.active.index) &&
						!0 !== s.working
					) {
						var t = parseInt(s.active.index) - 1;
						o.goToSlide(t, "prev");
					}
				}),
				(o.startAuto = function (t) {
					s.interval ||
						((s.interval = setInterval(function () {
							"next" === s.settings.autoDirection
								? o.goToNextSlide()
								: o.goToPrevSlide();
						}, s.settings.pause)),
						s.settings.onAutoChange.call(o, !0),
						s.settings.autoControls && !0 !== t && D("stop"));
				}),
				(o.stopAuto = function (t) {
					s.autoPaused && (s.autoPaused = !1),
						s.interval &&
							(clearInterval(s.interval),
							(s.interval = null),
							s.settings.onAutoChange.call(o, !1),
							s.settings.autoControls && !0 !== t && D("start"));
				}),
				(o.getCurrentSlide = function () {
					return s.active.index;
				}),
				(o.getCurrentSlideElement = function () {
					return s.children.eq(s.active.index);
				}),
				(o.getSlideElement = function (t) {
					return s.children.eq(t);
				}),
				(o.getSlideCount = function () {
					return s.children.length;
				}),
				(o.isWorking = function () {
					return s.working;
				}),
				(o.redrawSlider = function () {
					s.children.add(o.find(".bx-clone")).outerWidth(h()),
						s.viewport.css("height", p()),
						s.settings.ticker || m(),
						s.active.last && (s.active.index = f() - 1),
						s.active.index >= f() && (s.active.last = !0),
						s.settings.pager &&
							!s.settings.pagerCustom &&
							(w(), z(s.active.index)),
						s.settings.ariaHidden && j(s.active.index * x());
				}),
				(o.destroySlider = function () {
					s.initialized &&
						((s.initialized = !1),
						t(".bx-clone", this).remove(),
						s.children.each(function () {
							void 0 !== t(this).data("origStyle")
								? t(this).attr("style", t(this).data("origStyle"))
								: t(this).removeAttr("style");
						}),
						void 0 !== t(this).data("origStyle")
							? this.attr("style", t(this).data("origStyle"))
							: t(this).removeAttr("style"),
						t(this).unwrap().unwrap(),
						s.controls.el && s.controls.el.remove(),
						s.controls.next && s.controls.next.remove(),
						s.controls.prev && s.controls.prev.remove(),
						s.pagerEl &&
							s.settings.controls &&
							!s.settings.pagerCustom &&
							s.pagerEl.remove(),
						t(".bx-caption", this).remove(),
						s.controls.autoEl && s.controls.autoEl.remove(),
						clearInterval(s.interval),
						s.settings.responsive && t(window).off("resize", U),
						s.settings.keyboardEnabled && t(document).off("keydown", B),
						t(this).removeData("bxSlider"),
						t(window).off("blur", W).off("focus", H));
				}),
				(o.reloadSlider = function (e) {
					void 0 !== e && (n = e),
						o.destroySlider(),
						l(),
						t(o).data("bxSlider", this);
				}),
				l(),
				t(o).data("bxSlider", this),
				this
			);
		}
	};
})(jQuery);

/**
 * Swiper 4.5.0
 * Most modern mobile touch slider and framework with hardware accelerated transitions
 * http://www.idangero.us/swiper/
 *
 * Copyright 2014-2019 Vladimir Kharlampidi
 *
 * Released under the MIT License
 *
 * Released on: February 22, 2019
 */
!(function (e, t) {
	"object" == typeof exports && "undefined" != typeof module
		? (module.exports = t())
		: "function" == typeof define && define.amd
		? define(t)
		: ((e = e || self).Swiper = t());
})(this, function () {
	"use strict";
	var f =
			"undefined" == typeof document
				? {
						body: {},
						addEventListener: function () {},
						removeEventListener: function () {},
						activeElement: { blur: function () {}, nodeName: "" },
						querySelector: function () {
							return null;
						},
						querySelectorAll: function () {
							return [];
						},
						getElementById: function () {
							return null;
						},
						createEvent: function () {
							return { initEvent: function () {} };
						},
						createElement: function () {
							return {
								children: [],
								childNodes: [],
								style: {},
								setAttribute: function () {},
								getElementsByTagName: function () {
									return [];
								},
							};
						},
						location: { hash: "" },
				  }
				: document,
		J =
			"undefined" == typeof window
				? {
						document: f,
						navigator: { userAgent: "" },
						location: {},
						history: {},
						CustomEvent: function () {
							return this;
						},
						addEventListener: function () {},
						removeEventListener: function () {},
						getComputedStyle: function () {
							return {
								getPropertyValue: function () {
									return "";
								},
							};
						},
						Image: function () {},
						Date: function () {},
						screen: {},
						setTimeout: function () {},
						clearTimeout: function () {},
				  }
				: window,
		l = function (e) {
			for (var t = 0; t < e.length; t += 1) this[t] = e[t];
			return (this.length = e.length), this;
		};
	function L(e, t) {
		var a = [],
			i = 0;
		if (e && !t && e instanceof l) return e;
		if (e)
			if ("string" == typeof e) {
				var s,
					r,
					n = e.trim();
				if (0 <= n.indexOf("<") && 0 <= n.indexOf(">")) {
					var o = "div";
					for (
						0 === n.indexOf("<li") && (o = "ul"),
							0 === n.indexOf("<tr") && (o = "tbody"),
							(0 !== n.indexOf("<td") && 0 !== n.indexOf("<th")) || (o = "tr"),
							0 === n.indexOf("<tbody") && (o = "table"),
							0 === n.indexOf("<option") && (o = "select"),
							(r = f.createElement(o)).innerHTML = n,
							i = 0;
						i < r.childNodes.length;
						i += 1
					)
						a.push(r.childNodes[i]);
				} else
					for (
						s =
							t || "#" !== e[0] || e.match(/[ .<>:~]/)
								? (t || f).querySelectorAll(e.trim())
								: [f.getElementById(e.trim().split("#")[1])],
							i = 0;
						i < s.length;
						i += 1
					)
						s[i] && a.push(s[i]);
			} else if (e.nodeType || e === J || e === f) a.push(e);
			else if (0 < e.length && e[0].nodeType)
				for (i = 0; i < e.length; i += 1) a.push(e[i]);
		return new l(a);
	}
	function r(e) {
		for (var t = [], a = 0; a < e.length; a += 1)
			-1 === t.indexOf(e[a]) && t.push(e[a]);
		return t;
	}
	(L.fn = l.prototype), (L.Class = l), (L.Dom7 = l);
	var t = {
		addClass: function (e) {
			if (void 0 === e) return this;
			for (var t = e.split(" "), a = 0; a < t.length; a += 1)
				for (var i = 0; i < this.length; i += 1)
					void 0 !== this[i] &&
						void 0 !== this[i].classList &&
						this[i].classList.add(t[a]);
			return this;
		},
		removeClass: function (e) {
			for (var t = e.split(" "), a = 0; a < t.length; a += 1)
				for (var i = 0; i < this.length; i += 1)
					void 0 !== this[i] &&
						void 0 !== this[i].classList &&
						this[i].classList.remove(t[a]);
			return this;
		},
		hasClass: function (e) {
			return !!this[0] && this[0].classList.contains(e);
		},
		toggleClass: function (e) {
			for (var t = e.split(" "), a = 0; a < t.length; a += 1)
				for (var i = 0; i < this.length; i += 1)
					void 0 !== this[i] &&
						void 0 !== this[i].classList &&
						this[i].classList.toggle(t[a]);
			return this;
		},
		attr: function (e, t) {
			var a = arguments;
			if (1 === arguments.length && "string" == typeof e)
				return this[0] ? this[0].getAttribute(e) : void 0;
			for (var i = 0; i < this.length; i += 1)
				if (2 === a.length) this[i].setAttribute(e, t);
				else
					for (var s in e) (this[i][s] = e[s]), this[i].setAttribute(s, e[s]);
			return this;
		},
		removeAttr: function (e) {
			for (var t = 0; t < this.length; t += 1) this[t].removeAttribute(e);
			return this;
		},
		data: function (e, t) {
			var a;
			if (void 0 !== t) {
				for (var i = 0; i < this.length; i += 1)
					(a = this[i]).dom7ElementDataStorage ||
						(a.dom7ElementDataStorage = {}),
						(a.dom7ElementDataStorage[e] = t);
				return this;
			}
			if ((a = this[0])) {
				if (a.dom7ElementDataStorage && e in a.dom7ElementDataStorage)
					return a.dom7ElementDataStorage[e];
				var s = a.getAttribute("data-" + e);
				return s || void 0;
			}
		},
		transform: function (e) {
			for (var t = 0; t < this.length; t += 1) {
				var a = this[t].style;
				(a.webkitTransform = e), (a.transform = e);
			}
			return this;
		},
		transition: function (e) {
			"string" != typeof e && (e += "ms");
			for (var t = 0; t < this.length; t += 1) {
				var a = this[t].style;
				(a.webkitTransitionDuration = e), (a.transitionDuration = e);
			}
			return this;
		},
		on: function () {
			for (var e, t = [], a = arguments.length; a--; ) t[a] = arguments[a];
			var i = t[0],
				r = t[1],
				n = t[2],
				s = t[3];
			function o(e) {
				var t = e.target;
				if (t) {
					var a = e.target.dom7EventData || [];
					if ((a.indexOf(e) < 0 && a.unshift(e), L(t).is(r))) n.apply(t, a);
					else
						for (var i = L(t).parents(), s = 0; s < i.length; s += 1)
							L(i[s]).is(r) && n.apply(i[s], a);
				}
			}
			function l(e) {
				var t = (e && e.target && e.target.dom7EventData) || [];
				t.indexOf(e) < 0 && t.unshift(e), n.apply(this, t);
			}
			"function" == typeof t[1] &&
				((i = (e = t)[0]), (n = e[1]), (s = e[2]), (r = void 0)),
				s || (s = !1);
			for (var d, p = i.split(" "), c = 0; c < this.length; c += 1) {
				var u = this[c];
				if (r)
					for (d = 0; d < p.length; d += 1) {
						var h = p[d];
						u.dom7LiveListeners || (u.dom7LiveListeners = {}),
							u.dom7LiveListeners[h] || (u.dom7LiveListeners[h] = []),
							u.dom7LiveListeners[h].push({ listener: n, proxyListener: o }),
							u.addEventListener(h, o, s);
					}
				else
					for (d = 0; d < p.length; d += 1) {
						var v = p[d];
						u.dom7Listeners || (u.dom7Listeners = {}),
							u.dom7Listeners[v] || (u.dom7Listeners[v] = []),
							u.dom7Listeners[v].push({ listener: n, proxyListener: l }),
							u.addEventListener(v, l, s);
					}
			}
			return this;
		},
		off: function () {
			for (var e, t = [], a = arguments.length; a--; ) t[a] = arguments[a];
			var i = t[0],
				s = t[1],
				r = t[2],
				n = t[3];
			"function" == typeof t[1] &&
				((i = (e = t)[0]), (r = e[1]), (n = e[2]), (s = void 0)),
				n || (n = !1);
			for (var o = i.split(" "), l = 0; l < o.length; l += 1)
				for (var d = o[l], p = 0; p < this.length; p += 1) {
					var c = this[p],
						u = void 0;
					if (
						(!s && c.dom7Listeners
							? (u = c.dom7Listeners[d])
							: s && c.dom7LiveListeners && (u = c.dom7LiveListeners[d]),
						u && u.length)
					)
						for (var h = u.length - 1; 0 <= h; h -= 1) {
							var v = u[h];
							r && v.listener === r
								? (c.removeEventListener(d, v.proxyListener, n), u.splice(h, 1))
								: r &&
								  v.listener &&
								  v.listener.dom7proxy &&
								  v.listener.dom7proxy === r
								? (c.removeEventListener(d, v.proxyListener, n), u.splice(h, 1))
								: r ||
								  (c.removeEventListener(d, v.proxyListener, n),
								  u.splice(h, 1));
						}
				}
			return this;
		},
		trigger: function () {
			for (var e = [], t = arguments.length; t--; ) e[t] = arguments[t];
			for (var a = e[0].split(" "), i = e[1], s = 0; s < a.length; s += 1)
				for (var r = a[s], n = 0; n < this.length; n += 1) {
					var o = this[n],
						l = void 0;
					try {
						l = new J.CustomEvent(r, {
							detail: i,
							bubbles: !0,
							cancelable: !0,
						});
					} catch (e) {
						(l = f.createEvent("Event")).initEvent(r, !0, !0), (l.detail = i);
					}
					(o.dom7EventData = e.filter(function (e, t) {
						return 0 < t;
					})),
						o.dispatchEvent(l),
						(o.dom7EventData = []),
						delete o.dom7EventData;
				}
			return this;
		},
		transitionEnd: function (t) {
			var a,
				i = ["webkitTransitionEnd", "transitionend"],
				s = this;
			function r(e) {
				if (e.target === this)
					for (t.call(this, e), a = 0; a < i.length; a += 1) s.off(i[a], r);
			}
			if (t) for (a = 0; a < i.length; a += 1) s.on(i[a], r);
			return this;
		},
		outerWidth: function (e) {
			if (0 < this.length) {
				if (e) {
					var t = this.styles();
					return (
						this[0].offsetWidth +
						parseFloat(t.getPropertyValue("margin-right")) +
						parseFloat(t.getPropertyValue("margin-left"))
					);
				}
				return this[0].offsetWidth;
			}
			return null;
		},
		outerHeight: function (e) {
			if (0 < this.length) {
				if (e) {
					var t = this.styles();
					return (
						this[0].offsetHeight +
						parseFloat(t.getPropertyValue("margin-top")) +
						parseFloat(t.getPropertyValue("margin-bottom"))
					);
				}
				return this[0].offsetHeight;
			}
			return null;
		},
		offset: function () {
			if (0 < this.length) {
				var e = this[0],
					t = e.getBoundingClientRect(),
					a = f.body,
					i = e.clientTop || a.clientTop || 0,
					s = e.clientLeft || a.clientLeft || 0,
					r = e === J ? J.scrollY : e.scrollTop,
					n = e === J ? J.scrollX : e.scrollLeft;
				return { top: t.top + r - i, left: t.left + n - s };
			}
			return null;
		},
		css: function (e, t) {
			var a;
			if (1 === arguments.length) {
				if ("string" != typeof e) {
					for (a = 0; a < this.length; a += 1)
						for (var i in e) this[a].style[i] = e[i];
					return this;
				}
				if (this[0])
					return J.getComputedStyle(this[0], null).getPropertyValue(e);
			}
			if (2 === arguments.length && "string" == typeof e) {
				for (a = 0; a < this.length; a += 1) this[a].style[e] = t;
				return this;
			}
			return this;
		},
		each: function (e) {
			if (!e) return this;
			for (var t = 0; t < this.length; t += 1)
				if (!1 === e.call(this[t], t, this[t])) return this;
			return this;
		},
		html: function (e) {
			if (void 0 === e) return this[0] ? this[0].innerHTML : void 0;
			for (var t = 0; t < this.length; t += 1) this[t].innerHTML = e;
			return this;
		},
		text: function (e) {
			if (void 0 === e) return this[0] ? this[0].textContent.trim() : null;
			for (var t = 0; t < this.length; t += 1) this[t].textContent = e;
			return this;
		},
		is: function (e) {
			var t,
				a,
				i = this[0];
			if (!i || void 0 === e) return !1;
			if ("string" == typeof e) {
				if (i.matches) return i.matches(e);
				if (i.webkitMatchesSelector) return i.webkitMatchesSelector(e);
				if (i.msMatchesSelector) return i.msMatchesSelector(e);
				for (t = L(e), a = 0; a < t.length; a += 1) if (t[a] === i) return !0;
				return !1;
			}
			if (e === f) return i === f;
			if (e === J) return i === J;
			if (e.nodeType || e instanceof l) {
				for (t = e.nodeType ? [e] : e, a = 0; a < t.length; a += 1)
					if (t[a] === i) return !0;
				return !1;
			}
			return !1;
		},
		index: function () {
			var e,
				t = this[0];
			if (t) {
				for (e = 0; null !== (t = t.previousSibling); )
					1 === t.nodeType && (e += 1);
				return e;
			}
		},
		eq: function (e) {
			if (void 0 === e) return this;
			var t,
				a = this.length;
			return new l(
				a - 1 < e ? [] : e < 0 ? ((t = a + e) < 0 ? [] : [this[t]]) : [this[e]]
			);
		},
		append: function () {
			for (var e, t = [], a = arguments.length; a--; ) t[a] = arguments[a];
			for (var i = 0; i < t.length; i += 1) {
				e = t[i];
				for (var s = 0; s < this.length; s += 1)
					if ("string" == typeof e) {
						var r = f.createElement("div");
						for (r.innerHTML = e; r.firstChild; )
							this[s].appendChild(r.firstChild);
					} else if (e instanceof l)
						for (var n = 0; n < e.length; n += 1) this[s].appendChild(e[n]);
					else this[s].appendChild(e);
			}
			return this;
		},
		prepend: function (e) {
			var t, a;
			for (t = 0; t < this.length; t += 1)
				if ("string" == typeof e) {
					var i = f.createElement("div");
					for (i.innerHTML = e, a = i.childNodes.length - 1; 0 <= a; a -= 1)
						this[t].insertBefore(i.childNodes[a], this[t].childNodes[0]);
				} else if (e instanceof l)
					for (a = 0; a < e.length; a += 1)
						this[t].insertBefore(e[a], this[t].childNodes[0]);
				else this[t].insertBefore(e, this[t].childNodes[0]);
			return this;
		},
		next: function (e) {
			return 0 < this.length
				? e
					? this[0].nextElementSibling && L(this[0].nextElementSibling).is(e)
						? new l([this[0].nextElementSibling])
						: new l([])
					: this[0].nextElementSibling
					? new l([this[0].nextElementSibling])
					: new l([])
				: new l([]);
		},
		nextAll: function (e) {
			var t = [],
				a = this[0];
			if (!a) return new l([]);
			for (; a.nextElementSibling; ) {
				var i = a.nextElementSibling;
				e ? L(i).is(e) && t.push(i) : t.push(i), (a = i);
			}
			return new l(t);
		},
		prev: function (e) {
			if (0 < this.length) {
				var t = this[0];
				return e
					? t.previousElementSibling && L(t.previousElementSibling).is(e)
						? new l([t.previousElementSibling])
						: new l([])
					: t.previousElementSibling
					? new l([t.previousElementSibling])
					: new l([]);
			}
			return new l([]);
		},
		prevAll: function (e) {
			var t = [],
				a = this[0];
			if (!a) return new l([]);
			for (; a.previousElementSibling; ) {
				var i = a.previousElementSibling;
				e ? L(i).is(e) && t.push(i) : t.push(i), (a = i);
			}
			return new l(t);
		},
		parent: function (e) {
			for (var t = [], a = 0; a < this.length; a += 1)
				null !== this[a].parentNode &&
					(e
						? L(this[a].parentNode).is(e) && t.push(this[a].parentNode)
						: t.push(this[a].parentNode));
			return L(r(t));
		},
		parents: function (e) {
			for (var t = [], a = 0; a < this.length; a += 1)
				for (var i = this[a].parentNode; i; )
					e ? L(i).is(e) && t.push(i) : t.push(i), (i = i.parentNode);
			return L(r(t));
		},
		closest: function (e) {
			var t = this;
			return void 0 === e
				? new l([])
				: (t.is(e) || (t = t.parents(e).eq(0)), t);
		},
		find: function (e) {
			for (var t = [], a = 0; a < this.length; a += 1)
				for (var i = this[a].querySelectorAll(e), s = 0; s < i.length; s += 1)
					t.push(i[s]);
			return new l(t);
		},
		children: function (e) {
			for (var t = [], a = 0; a < this.length; a += 1)
				for (var i = this[a].childNodes, s = 0; s < i.length; s += 1)
					e
						? 1 === i[s].nodeType && L(i[s]).is(e) && t.push(i[s])
						: 1 === i[s].nodeType && t.push(i[s]);
			return new l(r(t));
		},
		remove: function () {
			for (var e = 0; e < this.length; e += 1)
				this[e].parentNode && this[e].parentNode.removeChild(this[e]);
			return this;
		},
		add: function () {
			for (var e = [], t = arguments.length; t--; ) e[t] = arguments[t];
			var a, i;
			for (a = 0; a < e.length; a += 1) {
				var s = L(e[a]);
				for (i = 0; i < s.length; i += 1)
					(this[this.length] = s[i]), (this.length += 1);
			}
			return this;
		},
		styles: function () {
			return this[0] ? J.getComputedStyle(this[0], null) : {};
		},
	};
	Object.keys(t).forEach(function (e) {
		L.fn[e] = t[e];
	});
	var e,
		a,
		i,
		s,
		ee = {
			deleteProps: function (e) {
				var t = e;
				Object.keys(t).forEach(function (e) {
					try {
						t[e] = null;
					} catch (e) {}
					try {
						delete t[e];
					} catch (e) {}
				});
			},
			nextTick: function (e, t) {
				return void 0 === t && (t = 0), setTimeout(e, t);
			},
			now: function () {
				return Date.now();
			},
			getTranslate: function (e, t) {
				var a, i, s;
				void 0 === t && (t = "x");
				var r = J.getComputedStyle(e, null);
				return (
					J.WebKitCSSMatrix
						? (6 < (i = r.transform || r.webkitTransform).split(",").length &&
								(i = i
									.split(", ")
									.map(function (e) {
										return e.replace(",", ".");
									})
									.join(", ")),
						  (s = new J.WebKitCSSMatrix("none" === i ? "" : i)))
						: (a = (s =
								r.MozTransform ||
								r.OTransform ||
								r.MsTransform ||
								r.msTransform ||
								r.transform ||
								r
									.getPropertyValue("transform")
									.replace("translate(", "matrix(1, 0, 0, 1,"))
								.toString()
								.split(",")),
					"x" === t &&
						(i = J.WebKitCSSMatrix
							? s.m41
							: 16 === a.length
							? parseFloat(a[12])
							: parseFloat(a[4])),
					"y" === t &&
						(i = J.WebKitCSSMatrix
							? s.m42
							: 16 === a.length
							? parseFloat(a[13])
							: parseFloat(a[5])),
					i || 0
				);
			},
			parseUrlQuery: function (e) {
				var t,
					a,
					i,
					s,
					r = {},
					n = e || J.location.href;
				if ("string" == typeof n && n.length)
					for (
						s = (a = (n = -1 < n.indexOf("?") ? n.replace(/\S*\?/, "") : "")
							.split("&")
							.filter(function (e) {
								return "" !== e;
							})).length,
							t = 0;
						t < s;
						t += 1
					)
						(i = a[t].replace(/#\S+/g, "").split("=")),
							(r[decodeURIComponent(i[0])] =
								void 0 === i[1] ? void 0 : decodeURIComponent(i[1]) || "");
				return r;
			},
			isObject: function (e) {
				return (
					"object" == typeof e &&
					null !== e &&
					e.constructor &&
					e.constructor === Object
				);
			},
			extend: function () {
				for (var e = [], t = arguments.length; t--; ) e[t] = arguments[t];
				for (var a = Object(e[0]), i = 1; i < e.length; i += 1) {
					var s = e[i];
					if (null != s)
						for (
							var r = Object.keys(Object(s)), n = 0, o = r.length;
							n < o;
							n += 1
						) {
							var l = r[n],
								d = Object.getOwnPropertyDescriptor(s, l);
							void 0 !== d &&
								d.enumerable &&
								(ee.isObject(a[l]) && ee.isObject(s[l])
									? ee.extend(a[l], s[l])
									: !ee.isObject(a[l]) && ee.isObject(s[l])
									? ((a[l] = {}), ee.extend(a[l], s[l]))
									: (a[l] = s[l]));
						}
				}
				return a;
			},
		},
		te =
			((i = f.createElement("div")),
			{
				touch:
					(J.Modernizr && !0 === J.Modernizr.touch) ||
					!!(
						0 < J.navigator.maxTouchPoints ||
						"ontouchstart" in J ||
						(J.DocumentTouch && f instanceof J.DocumentTouch)
					),
				pointerEvents: !!(
					J.navigator.pointerEnabled ||
					J.PointerEvent ||
					("maxTouchPoints" in J.navigator && 0 < J.navigator.maxTouchPoints)
				),
				prefixedPointerEvents: !!J.navigator.msPointerEnabled,
				transition:
					((a = i.style),
					"transition" in a || "webkitTransition" in a || "MozTransition" in a),
				transforms3d:
					(J.Modernizr && !0 === J.Modernizr.csstransforms3d) ||
					((e = i.style),
					"webkitPerspective" in e ||
						"MozPerspective" in e ||
						"OPerspective" in e ||
						"MsPerspective" in e ||
						"perspective" in e),
				flexbox: (function () {
					for (
						var e = i.style,
							t = "alignItems webkitAlignItems webkitBoxAlign msFlexAlign mozBoxAlign webkitFlexDirection msFlexDirection mozBoxDirection mozBoxOrient webkitBoxDirection webkitBoxOrient".split(
								" "
							),
							a = 0;
						a < t.length;
						a += 1
					)
						if (t[a] in e) return !0;
					return !1;
				})(),
				observer: "MutationObserver" in J || "WebkitMutationObserver" in J,
				passiveListener: (function () {
					var e = !1;
					try {
						var t = Object.defineProperty({}, "passive", {
							get: function () {
								e = !0;
							},
						});
						J.addEventListener("testPassiveListener", null, t);
					} catch (e) {}
					return e;
				})(),
				gestures: "ongesturestart" in J,
			}),
		I = {
			isIE:
				!!J.navigator.userAgent.match(/Trident/g) ||
				!!J.navigator.userAgent.match(/MSIE/g),
			isEdge: !!J.navigator.userAgent.match(/Edge/g),
			isSafari:
				((s = J.navigator.userAgent.toLowerCase()),
				0 <= s.indexOf("safari") &&
					s.indexOf("chrome") < 0 &&
					s.indexOf("android") < 0),
			isUiWebView: /(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/i.test(
				J.navigator.userAgent
			),
		},
		n = function (e) {
			void 0 === e && (e = {});
			var t = this;
			(t.params = e),
				(t.eventsListeners = {}),
				t.params &&
					t.params.on &&
					Object.keys(t.params.on).forEach(function (e) {
						t.on(e, t.params.on[e]);
					});
		},
		o = { components: { configurable: !0 } };
	(n.prototype.on = function (e, t, a) {
		var i = this;
		if ("function" != typeof t) return i;
		var s = a ? "unshift" : "push";
		return (
			e.split(" ").forEach(function (e) {
				i.eventsListeners[e] || (i.eventsListeners[e] = []),
					i.eventsListeners[e][s](t);
			}),
			i
		);
	}),
		(n.prototype.once = function (a, i, e) {
			var s = this;
			if ("function" != typeof i) return s;
			function r() {
				for (var e = [], t = arguments.length; t--; ) e[t] = arguments[t];
				i.apply(s, e), s.off(a, r), r.f7proxy && delete r.f7proxy;
			}
			return (r.f7proxy = i), s.on(a, r, e);
		}),
		(n.prototype.off = function (e, i) {
			var s = this;
			return (
				s.eventsListeners &&
					e.split(" ").forEach(function (a) {
						void 0 === i
							? (s.eventsListeners[a] = [])
							: s.eventsListeners[a] &&
							  s.eventsListeners[a].length &&
							  s.eventsListeners[a].forEach(function (e, t) {
									(e === i || (e.f7proxy && e.f7proxy === i)) &&
										s.eventsListeners[a].splice(t, 1);
							  });
					}),
				s
			);
		}),
		(n.prototype.emit = function () {
			for (var e = [], t = arguments.length; t--; ) e[t] = arguments[t];
			var a,
				i,
				s,
				r = this;
			return (
				r.eventsListeners &&
					("string" == typeof e[0] || Array.isArray(e[0])
						? ((a = e[0]), (i = e.slice(1, e.length)), (s = r))
						: ((a = e[0].events), (i = e[0].data), (s = e[0].context || r)),
					(Array.isArray(a) ? a : a.split(" ")).forEach(function (e) {
						if (r.eventsListeners && r.eventsListeners[e]) {
							var t = [];
							r.eventsListeners[e].forEach(function (e) {
								t.push(e);
							}),
								t.forEach(function (e) {
									e.apply(s, i);
								});
						}
					})),
				r
			);
		}),
		(n.prototype.useModulesParams = function (a) {
			var i = this;
			i.modules &&
				Object.keys(i.modules).forEach(function (e) {
					var t = i.modules[e];
					t.params && ee.extend(a, t.params);
				});
		}),
		(n.prototype.useModules = function (i) {
			void 0 === i && (i = {});
			var s = this;
			s.modules &&
				Object.keys(s.modules).forEach(function (e) {
					var a = s.modules[e],
						t = i[e] || {};
					a.instance &&
						Object.keys(a.instance).forEach(function (e) {
							var t = a.instance[e];
							s[e] = "function" == typeof t ? t.bind(s) : t;
						}),
						a.on &&
							s.on &&
							Object.keys(a.on).forEach(function (e) {
								s.on(e, a.on[e]);
							}),
						a.create && a.create.bind(s)(t);
				});
		}),
		(o.components.set = function (e) {
			this.use && this.use(e);
		}),
		(n.installModule = function (t) {
			for (var e = [], a = arguments.length - 1; 0 < a--; )
				e[a] = arguments[a + 1];
			var i = this;
			i.prototype.modules || (i.prototype.modules = {});
			var s =
				t.name || Object.keys(i.prototype.modules).length + "_" + ee.now();
			return (
				(i.prototype.modules[s] = t).proto &&
					Object.keys(t.proto).forEach(function (e) {
						i.prototype[e] = t.proto[e];
					}),
				t.static &&
					Object.keys(t.static).forEach(function (e) {
						i[e] = t.static[e];
					}),
				t.install && t.install.apply(i, e),
				i
			);
		}),
		(n.use = function (e) {
			for (var t = [], a = arguments.length - 1; 0 < a--; )
				t[a] = arguments[a + 1];
			var i = this;
			return Array.isArray(e)
				? (e.forEach(function (e) {
						return i.installModule(e);
				  }),
				  i)
				: i.installModule.apply(i, [e].concat(t));
		}),
		Object.defineProperties(n, o);
	var d = {
		updateSize: function () {
			var e,
				t,
				a = this,
				i = a.$el;
			(e = void 0 !== a.params.width ? a.params.width : i[0].clientWidth),
				(t = void 0 !== a.params.height ? a.params.height : i[0].clientHeight),
				(0 === e && a.isHorizontal()) ||
					(0 === t && a.isVertical()) ||
					((e =
						e -
						parseInt(i.css("padding-left"), 10) -
						parseInt(i.css("padding-right"), 10)),
					(t =
						t -
						parseInt(i.css("padding-top"), 10) -
						parseInt(i.css("padding-bottom"), 10)),
					ee.extend(a, {
						width: e,
						height: t,
						size: a.isHorizontal() ? e : t,
					}));
		},
		updateSlides: function () {
			var e = this,
				t = e.params,
				a = e.$wrapperEl,
				i = e.size,
				s = e.rtlTranslate,
				r = e.wrongRTL,
				n = e.virtual && t.virtual.enabled,
				o = n ? e.virtual.slides.length : e.slides.length,
				l = a.children("." + e.params.slideClass),
				d = n ? e.virtual.slides.length : l.length,
				p = [],
				c = [],
				u = [],
				h = t.slidesOffsetBefore;
			"function" == typeof h && (h = t.slidesOffsetBefore.call(e));
			var v = t.slidesOffsetAfter;
			"function" == typeof v && (v = t.slidesOffsetAfter.call(e));
			var f = e.snapGrid.length,
				m = e.snapGrid.length,
				g = t.spaceBetween,
				b = -h,
				w = 0,
				y = 0;
			if (void 0 !== i) {
				var x, T;
				"string" == typeof g &&
					0 <= g.indexOf("%") &&
					(g = (parseFloat(g.replace("%", "")) / 100) * i),
					(e.virtualSize = -g),
					s
						? l.css({ marginLeft: "", marginTop: "" })
						: l.css({ marginRight: "", marginBottom: "" }),
					1 < t.slidesPerColumn &&
						((x =
							Math.floor(d / t.slidesPerColumn) === d / e.params.slidesPerColumn
								? d
								: Math.ceil(d / t.slidesPerColumn) * t.slidesPerColumn),
						"auto" !== t.slidesPerView &&
							"row" === t.slidesPerColumnFill &&
							(x = Math.max(x, t.slidesPerView * t.slidesPerColumn)));
				for (
					var E,
						S = t.slidesPerColumn,
						C = x / S,
						M = Math.floor(d / t.slidesPerColumn),
						z = 0;
					z < d;
					z += 1
				) {
					T = 0;
					var P = l.eq(z);
					if (1 < t.slidesPerColumn) {
						var k = void 0,
							$ = void 0,
							L = void 0;
						"column" === t.slidesPerColumnFill
							? ((L = z - ($ = Math.floor(z / S)) * S),
							  (M < $ || ($ === M && L === S - 1)) &&
									S <= (L += 1) &&
									((L = 0), ($ += 1)),
							  (k = $ + (L * x) / S),
							  P.css({
									"-webkit-box-ordinal-group": k,
									"-moz-box-ordinal-group": k,
									"-ms-flex-order": k,
									"-webkit-order": k,
									order: k,
							  }))
							: ($ = z - (L = Math.floor(z / C)) * C),
							P.css(
								"margin-" + (e.isHorizontal() ? "top" : "left"),
								0 !== L && t.spaceBetween && t.spaceBetween + "px"
							)
								.attr("data-swiper-column", $)
								.attr("data-swiper-row", L);
					}
					if ("none" !== P.css("display")) {
						if ("auto" === t.slidesPerView) {
							var I = J.getComputedStyle(P[0], null),
								D = P[0].style.transform,
								O = P[0].style.webkitTransform;
							if (
								(D && (P[0].style.transform = "none"),
								O && (P[0].style.webkitTransform = "none"),
								t.roundLengths)
							)
								T = e.isHorizontal() ? P.outerWidth(!0) : P.outerHeight(!0);
							else if (e.isHorizontal()) {
								var A = parseFloat(I.getPropertyValue("width")),
									H = parseFloat(I.getPropertyValue("padding-left")),
									N = parseFloat(I.getPropertyValue("padding-right")),
									G = parseFloat(I.getPropertyValue("margin-left")),
									B = parseFloat(I.getPropertyValue("margin-right")),
									X = I.getPropertyValue("box-sizing");
								T = X && "border-box" === X ? A + G + B : A + H + N + G + B;
							} else {
								var Y = parseFloat(I.getPropertyValue("height")),
									V = parseFloat(I.getPropertyValue("padding-top")),
									F = parseFloat(I.getPropertyValue("padding-bottom")),
									R = parseFloat(I.getPropertyValue("margin-top")),
									q = parseFloat(I.getPropertyValue("margin-bottom")),
									W = I.getPropertyValue("box-sizing");
								T = W && "border-box" === W ? Y + R + q : Y + V + F + R + q;
							}
							D && (P[0].style.transform = D),
								O && (P[0].style.webkitTransform = O),
								t.roundLengths && (T = Math.floor(T));
						} else
							(T = (i - (t.slidesPerView - 1) * g) / t.slidesPerView),
								t.roundLengths && (T = Math.floor(T)),
								l[z] &&
									(e.isHorizontal()
										? (l[z].style.width = T + "px")
										: (l[z].style.height = T + "px"));
						l[z] && (l[z].swiperSlideSize = T),
							u.push(T),
							t.centeredSlides
								? ((b = b + T / 2 + w / 2 + g),
								  0 === w && 0 !== z && (b = b - i / 2 - g),
								  0 === z && (b = b - i / 2 - g),
								  Math.abs(b) < 0.001 && (b = 0),
								  t.roundLengths && (b = Math.floor(b)),
								  y % t.slidesPerGroup == 0 && p.push(b),
								  c.push(b))
								: (t.roundLengths && (b = Math.floor(b)),
								  y % t.slidesPerGroup == 0 && p.push(b),
								  c.push(b),
								  (b = b + T + g)),
							(e.virtualSize += T + g),
							(w = T),
							(y += 1);
					}
				}
				if (
					((e.virtualSize = Math.max(e.virtualSize, i) + v),
					s &&
						r &&
						("slide" === t.effect || "coverflow" === t.effect) &&
						a.css({ width: e.virtualSize + t.spaceBetween + "px" }),
					(te.flexbox && !t.setWrapperSize) ||
						(e.isHorizontal()
							? a.css({ width: e.virtualSize + t.spaceBetween + "px" })
							: a.css({ height: e.virtualSize + t.spaceBetween + "px" })),
					1 < t.slidesPerColumn &&
						((e.virtualSize = (T + t.spaceBetween) * x),
						(e.virtualSize =
							Math.ceil(e.virtualSize / t.slidesPerColumn) - t.spaceBetween),
						e.isHorizontal()
							? a.css({ width: e.virtualSize + t.spaceBetween + "px" })
							: a.css({ height: e.virtualSize + t.spaceBetween + "px" }),
						t.centeredSlides))
				) {
					E = [];
					for (var j = 0; j < p.length; j += 1) {
						var U = p[j];
						t.roundLengths && (U = Math.floor(U)),
							p[j] < e.virtualSize + p[0] && E.push(U);
					}
					p = E;
				}
				if (!t.centeredSlides) {
					E = [];
					for (var K = 0; K < p.length; K += 1) {
						var _ = p[K];
						t.roundLengths && (_ = Math.floor(_)),
							p[K] <= e.virtualSize - i && E.push(_);
					}
					(p = E),
						1 < Math.floor(e.virtualSize - i) - Math.floor(p[p.length - 1]) &&
							p.push(e.virtualSize - i);
				}
				if (
					(0 === p.length && (p = [0]),
					0 !== t.spaceBetween &&
						(e.isHorizontal()
							? s
								? l.css({ marginLeft: g + "px" })
								: l.css({ marginRight: g + "px" })
							: l.css({ marginBottom: g + "px" })),
					t.centerInsufficientSlides)
				) {
					var Z = 0;
					if (
						(u.forEach(function (e) {
							Z += e + (t.spaceBetween ? t.spaceBetween : 0);
						}),
						(Z -= t.spaceBetween) < i)
					) {
						var Q = (i - Z) / 2;
						p.forEach(function (e, t) {
							p[t] = e - Q;
						}),
							c.forEach(function (e, t) {
								c[t] = e + Q;
							});
					}
				}
				ee.extend(e, {
					slides: l,
					snapGrid: p,
					slidesGrid: c,
					slidesSizesGrid: u,
				}),
					d !== o && e.emit("slidesLengthChange"),
					p.length !== f &&
						(e.params.watchOverflow && e.checkOverflow(),
						e.emit("snapGridLengthChange")),
					c.length !== m && e.emit("slidesGridLengthChange"),
					(t.watchSlidesProgress || t.watchSlidesVisibility) &&
						e.updateSlidesOffset();
			}
		},
		updateAutoHeight: function (e) {
			var t,
				a = this,
				i = [],
				s = 0;
			if (
				("number" == typeof e
					? a.setTransition(e)
					: !0 === e && a.setTransition(a.params.speed),
				"auto" !== a.params.slidesPerView && 1 < a.params.slidesPerView)
			)
				for (t = 0; t < Math.ceil(a.params.slidesPerView); t += 1) {
					var r = a.activeIndex + t;
					if (r > a.slides.length) break;
					i.push(a.slides.eq(r)[0]);
				}
			else i.push(a.slides.eq(a.activeIndex)[0]);
			for (t = 0; t < i.length; t += 1)
				if (void 0 !== i[t]) {
					var n = i[t].offsetHeight;
					s = s < n ? n : s;
				}
			s && a.$wrapperEl.css("height", s + "px");
		},
		updateSlidesOffset: function () {
			for (var e = this.slides, t = 0; t < e.length; t += 1)
				e[t].swiperSlideOffset = this.isHorizontal()
					? e[t].offsetLeft
					: e[t].offsetTop;
		},
		updateSlidesProgress: function (e) {
			void 0 === e && (e = (this && this.translate) || 0);
			var t = this,
				a = t.params,
				i = t.slides,
				s = t.rtlTranslate;
			if (0 !== i.length) {
				void 0 === i[0].swiperSlideOffset && t.updateSlidesOffset();
				var r = -e;
				s && (r = e),
					i.removeClass(a.slideVisibleClass),
					(t.visibleSlidesIndexes = []),
					(t.visibleSlides = []);
				for (var n = 0; n < i.length; n += 1) {
					var o = i[n],
						l =
							(r +
								(a.centeredSlides ? t.minTranslate() : 0) -
								o.swiperSlideOffset) /
							(o.swiperSlideSize + a.spaceBetween);
					if (a.watchSlidesVisibility) {
						var d = -(r - o.swiperSlideOffset),
							p = d + t.slidesSizesGrid[n];
						((0 <= d && d < t.size) ||
							(0 < p && p <= t.size) ||
							(d <= 0 && p >= t.size)) &&
							(t.visibleSlides.push(o),
							t.visibleSlidesIndexes.push(n),
							i.eq(n).addClass(a.slideVisibleClass));
					}
					o.progress = s ? -l : l;
				}
				t.visibleSlides = L(t.visibleSlides);
			}
		},
		updateProgress: function (e) {
			void 0 === e && (e = (this && this.translate) || 0);
			var t = this,
				a = t.params,
				i = t.maxTranslate() - t.minTranslate(),
				s = t.progress,
				r = t.isBeginning,
				n = t.isEnd,
				o = r,
				l = n;
			0 === i
				? (n = r = !(s = 0))
				: ((r = (s = (e - t.minTranslate()) / i) <= 0), (n = 1 <= s)),
				ee.extend(t, { progress: s, isBeginning: r, isEnd: n }),
				(a.watchSlidesProgress || a.watchSlidesVisibility) &&
					t.updateSlidesProgress(e),
				r && !o && t.emit("reachBeginning toEdge"),
				n && !l && t.emit("reachEnd toEdge"),
				((o && !r) || (l && !n)) && t.emit("fromEdge"),
				t.emit("progress", s);
		},
		updateSlidesClasses: function () {
			var e,
				t = this,
				a = t.slides,
				i = t.params,
				s = t.$wrapperEl,
				r = t.activeIndex,
				n = t.realIndex,
				o = t.virtual && i.virtual.enabled;
			a.removeClass(
				i.slideActiveClass +
					" " +
					i.slideNextClass +
					" " +
					i.slidePrevClass +
					" " +
					i.slideDuplicateActiveClass +
					" " +
					i.slideDuplicateNextClass +
					" " +
					i.slideDuplicatePrevClass
			),
				(e = o
					? t.$wrapperEl.find(
							"." + i.slideClass + '[data-swiper-slide-index="' + r + '"]'
					  )
					: a.eq(r)).addClass(i.slideActiveClass),
				i.loop &&
					(e.hasClass(i.slideDuplicateClass)
						? s
								.children(
									"." +
										i.slideClass +
										":not(." +
										i.slideDuplicateClass +
										')[data-swiper-slide-index="' +
										n +
										'"]'
								)
								.addClass(i.slideDuplicateActiveClass)
						: s
								.children(
									"." +
										i.slideClass +
										"." +
										i.slideDuplicateClass +
										'[data-swiper-slide-index="' +
										n +
										'"]'
								)
								.addClass(i.slideDuplicateActiveClass));
			var l = e
				.nextAll("." + i.slideClass)
				.eq(0)
				.addClass(i.slideNextClass);
			i.loop && 0 === l.length && (l = a.eq(0)).addClass(i.slideNextClass);
			var d = e
				.prevAll("." + i.slideClass)
				.eq(0)
				.addClass(i.slidePrevClass);
			i.loop && 0 === d.length && (d = a.eq(-1)).addClass(i.slidePrevClass),
				i.loop &&
					(l.hasClass(i.slideDuplicateClass)
						? s
								.children(
									"." +
										i.slideClass +
										":not(." +
										i.slideDuplicateClass +
										')[data-swiper-slide-index="' +
										l.attr("data-swiper-slide-index") +
										'"]'
								)
								.addClass(i.slideDuplicateNextClass)
						: s
								.children(
									"." +
										i.slideClass +
										"." +
										i.slideDuplicateClass +
										'[data-swiper-slide-index="' +
										l.attr("data-swiper-slide-index") +
										'"]'
								)
								.addClass(i.slideDuplicateNextClass),
					d.hasClass(i.slideDuplicateClass)
						? s
								.children(
									"." +
										i.slideClass +
										":not(." +
										i.slideDuplicateClass +
										')[data-swiper-slide-index="' +
										d.attr("data-swiper-slide-index") +
										'"]'
								)
								.addClass(i.slideDuplicatePrevClass)
						: s
								.children(
									"." +
										i.slideClass +
										"." +
										i.slideDuplicateClass +
										'[data-swiper-slide-index="' +
										d.attr("data-swiper-slide-index") +
										'"]'
								)
								.addClass(i.slideDuplicatePrevClass));
		},
		updateActiveIndex: function (e) {
			var t,
				a = this,
				i = a.rtlTranslate ? a.translate : -a.translate,
				s = a.slidesGrid,
				r = a.snapGrid,
				n = a.params,
				o = a.activeIndex,
				l = a.realIndex,
				d = a.snapIndex,
				p = e;
			if (void 0 === p) {
				for (var c = 0; c < s.length; c += 1)
					void 0 !== s[c + 1]
						? i >= s[c] && i < s[c + 1] - (s[c + 1] - s[c]) / 2
							? (p = c)
							: i >= s[c] && i < s[c + 1] && (p = c + 1)
						: i >= s[c] && (p = c);
				n.normalizeSlideIndex && (p < 0 || void 0 === p) && (p = 0);
			}
			if (
				((t =
					0 <= r.indexOf(i)
						? r.indexOf(i)
						: Math.floor(p / n.slidesPerGroup)) >= r.length &&
					(t = r.length - 1),
				p !== o)
			) {
				var u = parseInt(
					a.slides.eq(p).attr("data-swiper-slide-index") || p,
					10
				);
				ee.extend(a, {
					snapIndex: t,
					realIndex: u,
					previousIndex: o,
					activeIndex: p,
				}),
					a.emit("activeIndexChange"),
					a.emit("snapIndexChange"),
					l !== u && a.emit("realIndexChange"),
					a.emit("slideChange");
			} else t !== d && ((a.snapIndex = t), a.emit("snapIndexChange"));
		},
		updateClickedSlide: function (e) {
			var t = this,
				a = t.params,
				i = L(e.target).closest("." + a.slideClass)[0],
				s = !1;
			if (i)
				for (var r = 0; r < t.slides.length; r += 1)
					t.slides[r] === i && (s = !0);
			if (!i || !s)
				return (t.clickedSlide = void 0), void (t.clickedIndex = void 0);
			(t.clickedSlide = i),
				t.virtual && t.params.virtual.enabled
					? (t.clickedIndex = parseInt(
							L(i).attr("data-swiper-slide-index"),
							10
					  ))
					: (t.clickedIndex = L(i).index()),
				a.slideToClickedSlide &&
					void 0 !== t.clickedIndex &&
					t.clickedIndex !== t.activeIndex &&
					t.slideToClickedSlide();
		},
	};
	var p = {
		getTranslate: function (e) {
			void 0 === e && (e = this.isHorizontal() ? "x" : "y");
			var t = this.params,
				a = this.rtlTranslate,
				i = this.translate,
				s = this.$wrapperEl;
			if (t.virtualTranslate) return a ? -i : i;
			var r = ee.getTranslate(s[0], e);
			return a && (r = -r), r || 0;
		},
		setTranslate: function (e, t) {
			var a = this,
				i = a.rtlTranslate,
				s = a.params,
				r = a.$wrapperEl,
				n = a.progress,
				o = 0,
				l = 0;
			a.isHorizontal() ? (o = i ? -e : e) : (l = e),
				s.roundLengths && ((o = Math.floor(o)), (l = Math.floor(l))),
				s.virtualTranslate ||
					(te.transforms3d
						? r.transform("translate3d(" + o + "px, " + l + "px, 0px)")
						: r.transform("translate(" + o + "px, " + l + "px)")),
				(a.previousTranslate = a.translate),
				(a.translate = a.isHorizontal() ? o : l);
			var d = a.maxTranslate() - a.minTranslate();
			(0 === d ? 0 : (e - a.minTranslate()) / d) !== n && a.updateProgress(e),
				a.emit("setTranslate", a.translate, t);
		},
		minTranslate: function () {
			return -this.snapGrid[0];
		},
		maxTranslate: function () {
			return -this.snapGrid[this.snapGrid.length - 1];
		},
	};
	var c = {
		setTransition: function (e, t) {
			this.$wrapperEl.transition(e), this.emit("setTransition", e, t);
		},
		transitionStart: function (e, t) {
			void 0 === e && (e = !0);
			var a = this,
				i = a.activeIndex,
				s = a.params,
				r = a.previousIndex;
			s.autoHeight && a.updateAutoHeight();
			var n = t;
			if (
				(n || (n = r < i ? "next" : i < r ? "prev" : "reset"),
				a.emit("transitionStart"),
				e && i !== r)
			) {
				if ("reset" === n) return void a.emit("slideResetTransitionStart");
				a.emit("slideChangeTransitionStart"),
					"next" === n
						? a.emit("slideNextTransitionStart")
						: a.emit("slidePrevTransitionStart");
			}
		},
		transitionEnd: function (e, t) {
			void 0 === e && (e = !0);
			var a = this,
				i = a.activeIndex,
				s = a.previousIndex;
			(a.animating = !1), a.setTransition(0);
			var r = t;
			if (
				(r || (r = s < i ? "next" : i < s ? "prev" : "reset"),
				a.emit("transitionEnd"),
				e && i !== s)
			) {
				if ("reset" === r) return void a.emit("slideResetTransitionEnd");
				a.emit("slideChangeTransitionEnd"),
					"next" === r
						? a.emit("slideNextTransitionEnd")
						: a.emit("slidePrevTransitionEnd");
			}
		},
	};
	var u = {
		slideTo: function (e, t, a, i) {
			void 0 === e && (e = 0),
				void 0 === t && (t = this.params.speed),
				void 0 === a && (a = !0);
			var s = this,
				r = e;
			r < 0 && (r = 0);
			var n = s.params,
				o = s.snapGrid,
				l = s.slidesGrid,
				d = s.previousIndex,
				p = s.activeIndex,
				c = s.rtlTranslate;
			if (s.animating && n.preventInteractionOnTransition) return !1;
			var u = Math.floor(r / n.slidesPerGroup);
			u >= o.length && (u = o.length - 1),
				(p || n.initialSlide || 0) === (d || 0) &&
					a &&
					s.emit("beforeSlideChangeStart");
			var h,
				v = -o[u];
			if ((s.updateProgress(v), n.normalizeSlideIndex))
				for (var f = 0; f < l.length; f += 1)
					-Math.floor(100 * v) >= Math.floor(100 * l[f]) && (r = f);
			if (s.initialized && r !== p) {
				if (!s.allowSlideNext && v < s.translate && v < s.minTranslate())
					return !1;
				if (
					!s.allowSlidePrev &&
					v > s.translate &&
					v > s.maxTranslate() &&
					(p || 0) !== r
				)
					return !1;
			}
			return (
				(h = p < r ? "next" : r < p ? "prev" : "reset"),
				(c && -v === s.translate) || (!c && v === s.translate)
					? (s.updateActiveIndex(r),
					  n.autoHeight && s.updateAutoHeight(),
					  s.updateSlidesClasses(),
					  "slide" !== n.effect && s.setTranslate(v),
					  "reset" !== h && (s.transitionStart(a, h), s.transitionEnd(a, h)),
					  !1)
					: (0 !== t && te.transition
							? (s.setTransition(t),
							  s.setTranslate(v),
							  s.updateActiveIndex(r),
							  s.updateSlidesClasses(),
							  s.emit("beforeTransitionStart", t, i),
							  s.transitionStart(a, h),
							  s.animating ||
									((s.animating = !0),
									s.onSlideToWrapperTransitionEnd ||
										(s.onSlideToWrapperTransitionEnd = function (e) {
											s &&
												!s.destroyed &&
												e.target === this &&
												(s.$wrapperEl[0].removeEventListener(
													"transitionend",
													s.onSlideToWrapperTransitionEnd
												),
												s.$wrapperEl[0].removeEventListener(
													"webkitTransitionEnd",
													s.onSlideToWrapperTransitionEnd
												),
												(s.onSlideToWrapperTransitionEnd = null),
												delete s.onSlideToWrapperTransitionEnd,
												s.transitionEnd(a, h));
										}),
									s.$wrapperEl[0].addEventListener(
										"transitionend",
										s.onSlideToWrapperTransitionEnd
									),
									s.$wrapperEl[0].addEventListener(
										"webkitTransitionEnd",
										s.onSlideToWrapperTransitionEnd
									)))
							: (s.setTransition(0),
							  s.setTranslate(v),
							  s.updateActiveIndex(r),
							  s.updateSlidesClasses(),
							  s.emit("beforeTransitionStart", t, i),
							  s.transitionStart(a, h),
							  s.transitionEnd(a, h)),
					  !0)
			);
		},
		slideToLoop: function (e, t, a, i) {
			void 0 === e && (e = 0),
				void 0 === t && (t = this.params.speed),
				void 0 === a && (a = !0);
			var s = e;
			return (
				this.params.loop && (s += this.loopedSlides), this.slideTo(s, t, a, i)
			);
		},
		slideNext: function (e, t, a) {
			void 0 === e && (e = this.params.speed), void 0 === t && (t = !0);
			var i = this,
				s = i.params,
				r = i.animating;
			return s.loop
				? !r &&
						(i.loopFix(),
						(i._clientLeft = i.$wrapperEl[0].clientLeft),
						i.slideTo(i.activeIndex + s.slidesPerGroup, e, t, a))
				: i.slideTo(i.activeIndex + s.slidesPerGroup, e, t, a);
		},
		slidePrev: function (e, t, a) {
			void 0 === e && (e = this.params.speed), void 0 === t && (t = !0);
			var i = this,
				s = i.params,
				r = i.animating,
				n = i.snapGrid,
				o = i.slidesGrid,
				l = i.rtlTranslate;
			if (s.loop) {
				if (r) return !1;
				i.loopFix(), (i._clientLeft = i.$wrapperEl[0].clientLeft);
			}
			function d(e) {
				return e < 0 ? -Math.floor(Math.abs(e)) : Math.floor(e);
			}
			var p,
				c = d(l ? i.translate : -i.translate),
				u = n.map(function (e) {
					return d(e);
				}),
				h =
					(o.map(function (e) {
						return d(e);
					}),
					n[u.indexOf(c)],
					n[u.indexOf(c) - 1]);
			return (
				void 0 !== h && (p = o.indexOf(h)) < 0 && (p = i.activeIndex - 1),
				i.slideTo(p, e, t, a)
			);
		},
		slideReset: function (e, t, a) {
			return (
				void 0 === e && (e = this.params.speed),
				void 0 === t && (t = !0),
				this.slideTo(this.activeIndex, e, t, a)
			);
		},
		slideToClosest: function (e, t, a) {
			void 0 === e && (e = this.params.speed), void 0 === t && (t = !0);
			var i = this,
				s = i.activeIndex,
				r = Math.floor(s / i.params.slidesPerGroup);
			if (r < i.snapGrid.length - 1) {
				var n = i.rtlTranslate ? i.translate : -i.translate,
					o = i.snapGrid[r];
				(i.snapGrid[r + 1] - o) / 2 < n - o && (s = i.params.slidesPerGroup);
			}
			return i.slideTo(s, e, t, a);
		},
		slideToClickedSlide: function () {
			var e,
				t = this,
				a = t.params,
				i = t.$wrapperEl,
				s =
					"auto" === a.slidesPerView
						? t.slidesPerViewDynamic()
						: a.slidesPerView,
				r = t.clickedIndex;
			if (a.loop) {
				if (t.animating) return;
				(e = parseInt(L(t.clickedSlide).attr("data-swiper-slide-index"), 10)),
					a.centeredSlides
						? r < t.loopedSlides - s / 2 ||
						  r > t.slides.length - t.loopedSlides + s / 2
							? (t.loopFix(),
							  (r = i
									.children(
										"." +
											a.slideClass +
											'[data-swiper-slide-index="' +
											e +
											'"]:not(.' +
											a.slideDuplicateClass +
											")"
									)
									.eq(0)
									.index()),
							  ee.nextTick(function () {
									t.slideTo(r);
							  }))
							: t.slideTo(r)
						: r > t.slides.length - s
						? (t.loopFix(),
						  (r = i
								.children(
									"." +
										a.slideClass +
										'[data-swiper-slide-index="' +
										e +
										'"]:not(.' +
										a.slideDuplicateClass +
										")"
								)
								.eq(0)
								.index()),
						  ee.nextTick(function () {
								t.slideTo(r);
						  }))
						: t.slideTo(r);
			} else t.slideTo(r);
		},
	};
	var h = {
		loopCreate: function () {
			var i = this,
				e = i.params,
				t = i.$wrapperEl;
			t.children("." + e.slideClass + "." + e.slideDuplicateClass).remove();
			var s = t.children("." + e.slideClass);
			if (e.loopFillGroupWithBlank) {
				var a = e.slidesPerGroup - (s.length % e.slidesPerGroup);
				if (a !== e.slidesPerGroup) {
					for (var r = 0; r < a; r += 1) {
						var n = L(f.createElement("div")).addClass(
							e.slideClass + " " + e.slideBlankClass
						);
						t.append(n);
					}
					s = t.children("." + e.slideClass);
				}
			}
			"auto" !== e.slidesPerView ||
				e.loopedSlides ||
				(e.loopedSlides = s.length),
				(i.loopedSlides = parseInt(e.loopedSlides || e.slidesPerView, 10)),
				(i.loopedSlides += e.loopAdditionalSlides),
				i.loopedSlides > s.length && (i.loopedSlides = s.length);
			var o = [],
				l = [];
			s.each(function (e, t) {
				var a = L(t);
				e < i.loopedSlides && l.push(t),
					e < s.length && e >= s.length - i.loopedSlides && o.push(t),
					a.attr("data-swiper-slide-index", e);
			});
			for (var d = 0; d < l.length; d += 1)
				t.append(L(l[d].cloneNode(!0)).addClass(e.slideDuplicateClass));
			for (var p = o.length - 1; 0 <= p; p -= 1)
				t.prepend(L(o[p].cloneNode(!0)).addClass(e.slideDuplicateClass));
		},
		loopFix: function () {
			var e,
				t = this,
				a = t.params,
				i = t.activeIndex,
				s = t.slides,
				r = t.loopedSlides,
				n = t.allowSlidePrev,
				o = t.allowSlideNext,
				l = t.snapGrid,
				d = t.rtlTranslate;
			(t.allowSlidePrev = !0), (t.allowSlideNext = !0);
			var p = -l[i] - t.getTranslate();
			i < r
				? ((e = s.length - 3 * r + i),
				  (e += r),
				  t.slideTo(e, 0, !1, !0) &&
						0 !== p &&
						t.setTranslate((d ? -t.translate : t.translate) - p))
				: (("auto" === a.slidesPerView && 2 * r <= i) || i >= s.length - r) &&
				  ((e = -s.length + i + r),
				  (e += r),
				  t.slideTo(e, 0, !1, !0) &&
						0 !== p &&
						t.setTranslate((d ? -t.translate : t.translate) - p));
			(t.allowSlidePrev = n), (t.allowSlideNext = o);
		},
		loopDestroy: function () {
			var e = this.$wrapperEl,
				t = this.params,
				a = this.slides;
			e
				.children(
					"." +
						t.slideClass +
						"." +
						t.slideDuplicateClass +
						",." +
						t.slideClass +
						"." +
						t.slideBlankClass
				)
				.remove(),
				a.removeAttr("data-swiper-slide-index");
		},
	};
	var v = {
		setGrabCursor: function (e) {
			if (
				!(
					te.touch ||
					!this.params.simulateTouch ||
					(this.params.watchOverflow && this.isLocked)
				)
			) {
				var t = this.el;
				(t.style.cursor = "move"),
					(t.style.cursor = e ? "-webkit-grabbing" : "-webkit-grab"),
					(t.style.cursor = e ? "-moz-grabbin" : "-moz-grab"),
					(t.style.cursor = e ? "grabbing" : "grab");
			}
		},
		unsetGrabCursor: function () {
			te.touch ||
				(this.params.watchOverflow && this.isLocked) ||
				(this.el.style.cursor = "");
		},
	};
	var m = {
			appendSlide: function (e) {
				var t = this,
					a = t.$wrapperEl,
					i = t.params;
				if ((i.loop && t.loopDestroy(), "object" == typeof e && "length" in e))
					for (var s = 0; s < e.length; s += 1) e[s] && a.append(e[s]);
				else a.append(e);
				i.loop && t.loopCreate(), (i.observer && te.observer) || t.update();
			},
			prependSlide: function (e) {
				var t = this,
					a = t.params,
					i = t.$wrapperEl,
					s = t.activeIndex;
				a.loop && t.loopDestroy();
				var r = s + 1;
				if ("object" == typeof e && "length" in e) {
					for (var n = 0; n < e.length; n += 1) e[n] && i.prepend(e[n]);
					r = s + e.length;
				} else i.prepend(e);
				a.loop && t.loopCreate(),
					(a.observer && te.observer) || t.update(),
					t.slideTo(r, 0, !1);
			},
			addSlide: function (e, t) {
				var a = this,
					i = a.$wrapperEl,
					s = a.params,
					r = a.activeIndex;
				s.loop &&
					((r -= a.loopedSlides),
					a.loopDestroy(),
					(a.slides = i.children("." + s.slideClass)));
				var n = a.slides.length;
				if (e <= 0) a.prependSlide(t);
				else if (n <= e) a.appendSlide(t);
				else {
					for (var o = e < r ? r + 1 : r, l = [], d = n - 1; e <= d; d -= 1) {
						var p = a.slides.eq(d);
						p.remove(), l.unshift(p);
					}
					if ("object" == typeof t && "length" in t) {
						for (var c = 0; c < t.length; c += 1) t[c] && i.append(t[c]);
						o = e < r ? r + t.length : r;
					} else i.append(t);
					for (var u = 0; u < l.length; u += 1) i.append(l[u]);
					s.loop && a.loopCreate(),
						(s.observer && te.observer) || a.update(),
						s.loop ? a.slideTo(o + a.loopedSlides, 0, !1) : a.slideTo(o, 0, !1);
				}
			},
			removeSlide: function (e) {
				var t = this,
					a = t.params,
					i = t.$wrapperEl,
					s = t.activeIndex;
				a.loop &&
					((s -= t.loopedSlides),
					t.loopDestroy(),
					(t.slides = i.children("." + a.slideClass)));
				var r,
					n = s;
				if ("object" == typeof e && "length" in e) {
					for (var o = 0; o < e.length; o += 1)
						(r = e[o]),
							t.slides[r] && t.slides.eq(r).remove(),
							r < n && (n -= 1);
					n = Math.max(n, 0);
				} else
					(r = e),
						t.slides[r] && t.slides.eq(r).remove(),
						r < n && (n -= 1),
						(n = Math.max(n, 0));
				a.loop && t.loopCreate(),
					(a.observer && te.observer) || t.update(),
					a.loop ? t.slideTo(n + t.loopedSlides, 0, !1) : t.slideTo(n, 0, !1);
			},
			removeAllSlides: function () {
				for (var e = [], t = 0; t < this.slides.length; t += 1) e.push(t);
				this.removeSlide(e);
			},
		},
		g = (function () {
			var e = J.navigator.userAgent,
				t = {
					ios: !1,
					android: !1,
					androidChrome: !1,
					desktop: !1,
					windows: !1,
					iphone: !1,
					ipod: !1,
					ipad: !1,
					cordova: J.cordova || J.phonegap,
					phonegap: J.cordova || J.phonegap,
				},
				a = e.match(/(Windows Phone);?[\s\/]+([\d.]+)?/),
				i = e.match(/(Android);?[\s\/]+([\d.]+)?/),
				s = e.match(/(iPad).*OS\s([\d_]+)/),
				r = e.match(/(iPod)(.*OS\s([\d_]+))?/),
				n = !s && e.match(/(iPhone\sOS|iOS)\s([\d_]+)/);
			if (
				(a && ((t.os = "windows"), (t.osVersion = a[2]), (t.windows = !0)),
				i &&
					!a &&
					((t.os = "android"),
					(t.osVersion = i[2]),
					(t.android = !0),
					(t.androidChrome = 0 <= e.toLowerCase().indexOf("chrome"))),
				(s || n || r) && ((t.os = "ios"), (t.ios = !0)),
				n && !r && ((t.osVersion = n[2].replace(/_/g, ".")), (t.iphone = !0)),
				s && ((t.osVersion = s[2].replace(/_/g, ".")), (t.ipad = !0)),
				r &&
					((t.osVersion = r[3] ? r[3].replace(/_/g, ".") : null),
					(t.iphone = !0)),
				t.ios &&
					t.osVersion &&
					0 <= e.indexOf("Version/") &&
					"10" === t.osVersion.split(".")[0] &&
					(t.osVersion = e.toLowerCase().split("version/")[1].split(" ")[0]),
				(t.desktop = !(t.os || t.android || t.webView)),
				(t.webView = (n || s || r) && e.match(/.*AppleWebKit(?!.*Safari)/i)),
				t.os && "ios" === t.os)
			) {
				var o = t.osVersion.split("."),
					l = f.querySelector('meta[name="viewport"]');
				t.minimalUi =
					!t.webView &&
					(r || n) &&
					(1 * o[0] == 7 ? 1 <= 1 * o[1] : 7 < 1 * o[0]) &&
					l &&
					0 <= l.getAttribute("content").indexOf("minimal-ui");
			}
			return (t.pixelRatio = J.devicePixelRatio || 1), t;
		})();
	function b() {
		var e = this,
			t = e.params,
			a = e.el;
		if (!a || 0 !== a.offsetWidth) {
			t.breakpoints && e.setBreakpoint();
			var i = e.allowSlideNext,
				s = e.allowSlidePrev,
				r = e.snapGrid;
			if (
				((e.allowSlideNext = !0),
				(e.allowSlidePrev = !0),
				e.updateSize(),
				e.updateSlides(),
				t.freeMode)
			) {
				var n = Math.min(
					Math.max(e.translate, e.maxTranslate()),
					e.minTranslate()
				);
				e.setTranslate(n),
					e.updateActiveIndex(),
					e.updateSlidesClasses(),
					t.autoHeight && e.updateAutoHeight();
			} else
				e.updateSlidesClasses(),
					("auto" === t.slidesPerView || 1 < t.slidesPerView) &&
					e.isEnd &&
					!e.params.centeredSlides
						? e.slideTo(e.slides.length - 1, 0, !1, !0)
						: e.slideTo(e.activeIndex, 0, !1, !0);
			(e.allowSlidePrev = s),
				(e.allowSlideNext = i),
				e.params.watchOverflow && r !== e.snapGrid && e.checkOverflow();
		}
	}
	var w = {
			init: !0,
			direction: "horizontal",
			touchEventsTarget: "container",
			initialSlide: 0,
			speed: 300,
			preventInteractionOnTransition: !1,
			edgeSwipeDetection: !1,
			edgeSwipeThreshold: 20,
			freeMode: !1,
			freeModeMomentum: !0,
			freeModeMomentumRatio: 1,
			freeModeMomentumBounce: !0,
			freeModeMomentumBounceRatio: 1,
			freeModeMomentumVelocityRatio: 1,
			freeModeSticky: !1,
			freeModeMinimumVelocity: 0.02,
			autoHeight: !1,
			setWrapperSize: !1,
			virtualTranslate: !1,
			effect: "slide",
			breakpoints: void 0,
			breakpointsInverse: !1,
			spaceBetween: 0,
			slidesPerView: 1,
			slidesPerColumn: 1,
			slidesPerColumnFill: "column",
			slidesPerGroup: 1,
			centeredSlides: !1,
			slidesOffsetBefore: 0,
			slidesOffsetAfter: 0,
			normalizeSlideIndex: !0,
			centerInsufficientSlides: !1,
			watchOverflow: !1,
			roundLengths: !1,
			touchRatio: 1,
			touchAngle: 45,
			simulateTouch: !0,
			shortSwipes: !0,
			longSwipes: !0,
			longSwipesRatio: 0.5,
			longSwipesMs: 300,
			followFinger: !0,
			allowTouchMove: !0,
			threshold: 0,
			touchMoveStopPropagation: !0,
			touchStartPreventDefault: !0,
			touchStartForcePreventDefault: !1,
			touchReleaseOnEdges: !1,
			uniqueNavElements: !0,
			resistance: !0,
			resistanceRatio: 0.85,
			watchSlidesProgress: !1,
			watchSlidesVisibility: !1,
			grabCursor: !1,
			preventClicks: !0,
			preventClicksPropagation: !0,
			slideToClickedSlide: !1,
			preloadImages: !0,
			updateOnImagesReady: !0,
			loop: !1,
			loopAdditionalSlides: 0,
			loopedSlides: null,
			loopFillGroupWithBlank: !1,
			allowSlidePrev: !0,
			allowSlideNext: !0,
			swipeHandler: null,
			noSwiping: !0,
			noSwipingClass: "swiper-no-swiping",
			noSwipingSelector: null,
			passiveListeners: !0,
			containerModifierClass: "swiper-container-",
			slideClass: "swiper-slide",
			slideBlankClass: "swiper-slide-invisible-blank",
			slideActiveClass: "swiper-slide-active",
			slideDuplicateActiveClass: "swiper-slide-duplicate-active",
			slideVisibleClass: "swiper-slide-visible",
			slideDuplicateClass: "swiper-slide-duplicate",
			slideNextClass: "swiper-slide-next",
			slideDuplicateNextClass: "swiper-slide-duplicate-next",
			slidePrevClass: "swiper-slide-prev",
			slideDuplicatePrevClass: "swiper-slide-duplicate-prev",
			wrapperClass: "swiper-wrapper",
			runCallbacksOnInit: !0,
		},
		y = {
			update: d,
			translate: p,
			transition: c,
			slide: u,
			loop: h,
			grabCursor: v,
			manipulation: m,
			events: {
				attachEvents: function () {
					var e = this,
						t = e.params,
						a = e.touchEvents,
						i = e.el,
						s = e.wrapperEl;
					(e.onTouchStart = function (e) {
						var t = this,
							a = t.touchEventsData,
							i = t.params,
							s = t.touches;
						if (!t.animating || !i.preventInteractionOnTransition) {
							var r = e;
							if (
								(r.originalEvent && (r = r.originalEvent),
								(a.isTouchEvent = "touchstart" === r.type),
								(a.isTouchEvent || !("which" in r) || 3 !== r.which) &&
									!(
										(!a.isTouchEvent && "button" in r && 0 < r.button) ||
										(a.isTouched && a.isMoved)
									))
							)
								if (
									i.noSwiping &&
									L(r.target).closest(
										i.noSwipingSelector
											? i.noSwipingSelector
											: "." + i.noSwipingClass
									)[0]
								)
									t.allowClick = !0;
								else if (!i.swipeHandler || L(r).closest(i.swipeHandler)[0]) {
									(s.currentX =
										"touchstart" === r.type
											? r.targetTouches[0].pageX
											: r.pageX),
										(s.currentY =
											"touchstart" === r.type
												? r.targetTouches[0].pageY
												: r.pageY);
									var n = s.currentX,
										o = s.currentY,
										l = i.edgeSwipeDetection || i.iOSEdgeSwipeDetection,
										d = i.edgeSwipeThreshold || i.iOSEdgeSwipeThreshold;
									if (!l || !(n <= d || n >= J.screen.width - d)) {
										if (
											(ee.extend(a, {
												isTouched: !0,
												isMoved: !1,
												allowTouchCallbacks: !0,
												isScrolling: void 0,
												startMoving: void 0,
											}),
											(s.startX = n),
											(s.startY = o),
											(a.touchStartTime = ee.now()),
											(t.allowClick = !0),
											t.updateSize(),
											(t.swipeDirection = void 0),
											0 < i.threshold && (a.allowThresholdMove = !1),
											"touchstart" !== r.type)
										) {
											var p = !0;
											L(r.target).is(a.formElements) && (p = !1),
												f.activeElement &&
													L(f.activeElement).is(a.formElements) &&
													f.activeElement !== r.target &&
													f.activeElement.blur();
											var c =
												p && t.allowTouchMove && i.touchStartPreventDefault;
											(i.touchStartForcePreventDefault || c) &&
												r.preventDefault();
										}
										t.emit("touchStart", r);
									}
								}
						}
					}.bind(e)),
						(e.onTouchMove = function (e) {
							var t = this,
								a = t.touchEventsData,
								i = t.params,
								s = t.touches,
								r = t.rtlTranslate,
								n = e;
							if ((n.originalEvent && (n = n.originalEvent), a.isTouched)) {
								if (!a.isTouchEvent || "mousemove" !== n.type) {
									var o =
											"touchmove" === n.type
												? n.targetTouches[0].pageX
												: n.pageX,
										l =
											"touchmove" === n.type
												? n.targetTouches[0].pageY
												: n.pageY;
									if (n.preventedByNestedSwiper)
										return (s.startX = o), void (s.startY = l);
									if (!t.allowTouchMove)
										return (
											(t.allowClick = !1),
											void (
												a.isTouched &&
												(ee.extend(s, {
													startX: o,
													startY: l,
													currentX: o,
													currentY: l,
												}),
												(a.touchStartTime = ee.now()))
											)
										);
									if (a.isTouchEvent && i.touchReleaseOnEdges && !i.loop)
										if (t.isVertical()) {
											if (
												(l < s.startY && t.translate <= t.maxTranslate()) ||
												(l > s.startY && t.translate >= t.minTranslate())
											)
												return (a.isTouched = !1), void (a.isMoved = !1);
										} else if (
											(o < s.startX && t.translate <= t.maxTranslate()) ||
											(o > s.startX && t.translate >= t.minTranslate())
										)
											return;
									if (
										a.isTouchEvent &&
										f.activeElement &&
										n.target === f.activeElement &&
										L(n.target).is(a.formElements)
									)
										return (a.isMoved = !0), void (t.allowClick = !1);
									if (
										(a.allowTouchCallbacks && t.emit("touchMove", n),
										!(n.targetTouches && 1 < n.targetTouches.length))
									) {
										(s.currentX = o), (s.currentY = l);
										var d,
											p = s.currentX - s.startX,
											c = s.currentY - s.startY;
										if (
											!(
												t.params.threshold &&
												Math.sqrt(Math.pow(p, 2) + Math.pow(c, 2)) <
													t.params.threshold
											)
										)
											if (
												(void 0 === a.isScrolling &&
													((t.isHorizontal() && s.currentY === s.startY) ||
													(t.isVertical() && s.currentX === s.startX)
														? (a.isScrolling = !1)
														: 25 <= p * p + c * c &&
														  ((d =
																(180 * Math.atan2(Math.abs(c), Math.abs(p))) /
																Math.PI),
														  (a.isScrolling = t.isHorizontal()
																? d > i.touchAngle
																: 90 - d > i.touchAngle))),
												a.isScrolling && t.emit("touchMoveOpposite", n),
												void 0 === a.startMoving &&
													((s.currentX === s.startX &&
														s.currentY === s.startY) ||
														(a.startMoving = !0)),
												a.isScrolling)
											)
												a.isTouched = !1;
											else if (a.startMoving) {
												(t.allowClick = !1),
													n.preventDefault(),
													i.touchMoveStopPropagation &&
														!i.nested &&
														n.stopPropagation(),
													a.isMoved ||
														(i.loop && t.loopFix(),
														(a.startTranslate = t.getTranslate()),
														t.setTransition(0),
														t.animating &&
															t.$wrapperEl.trigger(
																"webkitTransitionEnd transitionend"
															),
														(a.allowMomentumBounce = !1),
														!i.grabCursor ||
															(!0 !== t.allowSlideNext &&
																!0 !== t.allowSlidePrev) ||
															t.setGrabCursor(!0),
														t.emit("sliderFirstMove", n)),
													t.emit("sliderMove", n),
													(a.isMoved = !0);
												var u = t.isHorizontal() ? p : c;
												(s.diff = u),
													(u *= i.touchRatio),
													r && (u = -u),
													(t.swipeDirection = 0 < u ? "prev" : "next"),
													(a.currentTranslate = u + a.startTranslate);
												var h = !0,
													v = i.resistanceRatio;
												if (
													(i.touchReleaseOnEdges && (v = 0),
													0 < u && a.currentTranslate > t.minTranslate()
														? ((h = !1),
														  i.resistance &&
																(a.currentTranslate =
																	t.minTranslate() -
																	1 +
																	Math.pow(
																		-t.minTranslate() + a.startTranslate + u,
																		v
																	)))
														: u < 0 &&
														  a.currentTranslate < t.maxTranslate() &&
														  ((h = !1),
														  i.resistance &&
																(a.currentTranslate =
																	t.maxTranslate() +
																	1 -
																	Math.pow(
																		t.maxTranslate() - a.startTranslate - u,
																		v
																	))),
													h && (n.preventedByNestedSwiper = !0),
													!t.allowSlideNext &&
														"next" === t.swipeDirection &&
														a.currentTranslate < a.startTranslate &&
														(a.currentTranslate = a.startTranslate),
													!t.allowSlidePrev &&
														"prev" === t.swipeDirection &&
														a.currentTranslate > a.startTranslate &&
														(a.currentTranslate = a.startTranslate),
													0 < i.threshold)
												) {
													if (
														!(Math.abs(u) > i.threshold || a.allowThresholdMove)
													)
														return void (a.currentTranslate = a.startTranslate);
													if (!a.allowThresholdMove)
														return (
															(a.allowThresholdMove = !0),
															(s.startX = s.currentX),
															(s.startY = s.currentY),
															(a.currentTranslate = a.startTranslate),
															void (s.diff = t.isHorizontal()
																? s.currentX - s.startX
																: s.currentY - s.startY)
														);
												}
												i.followFinger &&
													((i.freeMode ||
														i.watchSlidesProgress ||
														i.watchSlidesVisibility) &&
														(t.updateActiveIndex(), t.updateSlidesClasses()),
													i.freeMode &&
														(0 === a.velocities.length &&
															a.velocities.push({
																position:
																	s[t.isHorizontal() ? "startX" : "startY"],
																time: a.touchStartTime,
															}),
														a.velocities.push({
															position:
																s[t.isHorizontal() ? "currentX" : "currentY"],
															time: ee.now(),
														})),
													t.updateProgress(a.currentTranslate),
													t.setTranslate(a.currentTranslate));
											}
									}
								}
							} else
								a.startMoving &&
									a.isScrolling &&
									t.emit("touchMoveOpposite", n);
						}.bind(e)),
						(e.onTouchEnd = function (e) {
							var t = this,
								a = t.touchEventsData,
								i = t.params,
								s = t.touches,
								r = t.rtlTranslate,
								n = t.$wrapperEl,
								o = t.slidesGrid,
								l = t.snapGrid,
								d = e;
							if (
								(d.originalEvent && (d = d.originalEvent),
								a.allowTouchCallbacks && t.emit("touchEnd", d),
								(a.allowTouchCallbacks = !1),
								!a.isTouched)
							)
								return (
									a.isMoved && i.grabCursor && t.setGrabCursor(!1),
									(a.isMoved = !1),
									void (a.startMoving = !1)
								);
							i.grabCursor &&
								a.isMoved &&
								a.isTouched &&
								(!0 === t.allowSlideNext || !0 === t.allowSlidePrev) &&
								t.setGrabCursor(!1);
							var p,
								c = ee.now(),
								u = c - a.touchStartTime;
							if (
								(t.allowClick &&
									(t.updateClickedSlide(d),
									t.emit("tap", d),
									u < 300 &&
										300 < c - a.lastClickTime &&
										(a.clickTimeout && clearTimeout(a.clickTimeout),
										(a.clickTimeout = ee.nextTick(function () {
											t && !t.destroyed && t.emit("click", d);
										}, 300))),
									u < 300 &&
										c - a.lastClickTime < 300 &&
										(a.clickTimeout && clearTimeout(a.clickTimeout),
										t.emit("doubleTap", d))),
								(a.lastClickTime = ee.now()),
								ee.nextTick(function () {
									t.destroyed || (t.allowClick = !0);
								}),
								!a.isTouched ||
									!a.isMoved ||
									!t.swipeDirection ||
									0 === s.diff ||
									a.currentTranslate === a.startTranslate)
							)
								return (
									(a.isTouched = !1),
									(a.isMoved = !1),
									void (a.startMoving = !1)
								);
							if (
								((a.isTouched = !1),
								(a.isMoved = !1),
								(a.startMoving = !1),
								(p = i.followFinger
									? r
										? t.translate
										: -t.translate
									: -a.currentTranslate),
								i.freeMode)
							) {
								if (p < -t.minTranslate()) return void t.slideTo(t.activeIndex);
								if (p > -t.maxTranslate())
									return void (t.slides.length < l.length
										? t.slideTo(l.length - 1)
										: t.slideTo(t.slides.length - 1));
								if (i.freeModeMomentum) {
									if (1 < a.velocities.length) {
										var h = a.velocities.pop(),
											v = a.velocities.pop(),
											f = h.position - v.position,
											m = h.time - v.time;
										(t.velocity = f / m),
											(t.velocity /= 2),
											Math.abs(t.velocity) < i.freeModeMinimumVelocity &&
												(t.velocity = 0),
											(150 < m || 300 < ee.now() - h.time) && (t.velocity = 0);
									} else t.velocity = 0;
									(t.velocity *= i.freeModeMomentumVelocityRatio),
										(a.velocities.length = 0);
									var g = 1e3 * i.freeModeMomentumRatio,
										b = t.velocity * g,
										w = t.translate + b;
									r && (w = -w);
									var y,
										x,
										T = !1,
										E =
											20 * Math.abs(t.velocity) * i.freeModeMomentumBounceRatio;
									if (w < t.maxTranslate())
										i.freeModeMomentumBounce
											? (w + t.maxTranslate() < -E &&
													(w = t.maxTranslate() - E),
											  (y = t.maxTranslate()),
											  (T = !0),
											  (a.allowMomentumBounce = !0))
											: (w = t.maxTranslate()),
											i.loop && i.centeredSlides && (x = !0);
									else if (w > t.minTranslate())
										i.freeModeMomentumBounce
											? (w - t.minTranslate() > E && (w = t.minTranslate() + E),
											  (y = t.minTranslate()),
											  (T = !0),
											  (a.allowMomentumBounce = !0))
											: (w = t.minTranslate()),
											i.loop && i.centeredSlides && (x = !0);
									else if (i.freeModeSticky) {
										for (var S, C = 0; C < l.length; C += 1)
											if (l[C] > -w) {
												S = C;
												break;
											}
										w = -(w =
											Math.abs(l[S] - w) < Math.abs(l[S - 1] - w) ||
											"next" === t.swipeDirection
												? l[S]
												: l[S - 1]);
									}
									if (
										(x &&
											t.once("transitionEnd", function () {
												t.loopFix();
											}),
										0 !== t.velocity)
									)
										g = r
											? Math.abs((-w - t.translate) / t.velocity)
											: Math.abs((w - t.translate) / t.velocity);
									else if (i.freeModeSticky) return void t.slideToClosest();
									i.freeModeMomentumBounce && T
										? (t.updateProgress(y),
										  t.setTransition(g),
										  t.setTranslate(w),
										  t.transitionStart(!0, t.swipeDirection),
										  (t.animating = !0),
										  n.transitionEnd(function () {
												t &&
													!t.destroyed &&
													a.allowMomentumBounce &&
													(t.emit("momentumBounce"),
													t.setTransition(i.speed),
													t.setTranslate(y),
													n.transitionEnd(function () {
														t && !t.destroyed && t.transitionEnd();
													}));
										  }))
										: t.velocity
										? (t.updateProgress(w),
										  t.setTransition(g),
										  t.setTranslate(w),
										  t.transitionStart(!0, t.swipeDirection),
										  t.animating ||
												((t.animating = !0),
												n.transitionEnd(function () {
													t && !t.destroyed && t.transitionEnd();
												})))
										: t.updateProgress(w),
										t.updateActiveIndex(),
										t.updateSlidesClasses();
								} else if (i.freeModeSticky) return void t.slideToClosest();
								(!i.freeModeMomentum || u >= i.longSwipesMs) &&
									(t.updateProgress(),
									t.updateActiveIndex(),
									t.updateSlidesClasses());
							} else {
								for (
									var M = 0, z = t.slidesSizesGrid[0], P = 0;
									P < o.length;
									P += i.slidesPerGroup
								)
									void 0 !== o[P + i.slidesPerGroup]
										? p >= o[P] &&
										  p < o[P + i.slidesPerGroup] &&
										  (z = o[(M = P) + i.slidesPerGroup] - o[P])
										: p >= o[P] &&
										  ((M = P), (z = o[o.length - 1] - o[o.length - 2]));
								var k = (p - o[M]) / z;
								if (u > i.longSwipesMs) {
									if (!i.longSwipes) return void t.slideTo(t.activeIndex);
									"next" === t.swipeDirection &&
										(k >= i.longSwipesRatio
											? t.slideTo(M + i.slidesPerGroup)
											: t.slideTo(M)),
										"prev" === t.swipeDirection &&
											(k > 1 - i.longSwipesRatio
												? t.slideTo(M + i.slidesPerGroup)
												: t.slideTo(M));
								} else {
									if (!i.shortSwipes) return void t.slideTo(t.activeIndex);
									"next" === t.swipeDirection &&
										t.slideTo(M + i.slidesPerGroup),
										"prev" === t.swipeDirection && t.slideTo(M);
								}
							}
						}.bind(e)),
						(e.onClick = function (e) {
							this.allowClick ||
								(this.params.preventClicks && e.preventDefault(),
								this.params.preventClicksPropagation &&
									this.animating &&
									(e.stopPropagation(), e.stopImmediatePropagation()));
						}.bind(e));
					var r = "container" === t.touchEventsTarget ? i : s,
						n = !!t.nested;
					if (te.touch || (!te.pointerEvents && !te.prefixedPointerEvents)) {
						if (te.touch) {
							var o = !(
								"touchstart" !== a.start ||
								!te.passiveListener ||
								!t.passiveListeners
							) && { passive: !0, capture: !1 };
							r.addEventListener(a.start, e.onTouchStart, o),
								r.addEventListener(
									a.move,
									e.onTouchMove,
									te.passiveListener ? { passive: !1, capture: n } : n
								),
								r.addEventListener(a.end, e.onTouchEnd, o);
						}
						((t.simulateTouch && !g.ios && !g.android) ||
							(t.simulateTouch && !te.touch && g.ios)) &&
							(r.addEventListener("mousedown", e.onTouchStart, !1),
							f.addEventListener("mousemove", e.onTouchMove, n),
							f.addEventListener("mouseup", e.onTouchEnd, !1));
					} else
						r.addEventListener(a.start, e.onTouchStart, !1),
							f.addEventListener(a.move, e.onTouchMove, n),
							f.addEventListener(a.end, e.onTouchEnd, !1);
					(t.preventClicks || t.preventClicksPropagation) &&
						r.addEventListener("click", e.onClick, !0),
						e.on(
							g.ios || g.android
								? "resize orientationchange observerUpdate"
								: "resize observerUpdate",
							b,
							!0
						);
				},
				detachEvents: function () {
					var e = this,
						t = e.params,
						a = e.touchEvents,
						i = e.el,
						s = e.wrapperEl,
						r = "container" === t.touchEventsTarget ? i : s,
						n = !!t.nested;
					if (te.touch || (!te.pointerEvents && !te.prefixedPointerEvents)) {
						if (te.touch) {
							var o = !(
								"onTouchStart" !== a.start ||
								!te.passiveListener ||
								!t.passiveListeners
							) && { passive: !0, capture: !1 };
							r.removeEventListener(a.start, e.onTouchStart, o),
								r.removeEventListener(a.move, e.onTouchMove, n),
								r.removeEventListener(a.end, e.onTouchEnd, o);
						}
						((t.simulateTouch && !g.ios && !g.android) ||
							(t.simulateTouch && !te.touch && g.ios)) &&
							(r.removeEventListener("mousedown", e.onTouchStart, !1),
							f.removeEventListener("mousemove", e.onTouchMove, n),
							f.removeEventListener("mouseup", e.onTouchEnd, !1));
					} else
						r.removeEventListener(a.start, e.onTouchStart, !1),
							f.removeEventListener(a.move, e.onTouchMove, n),
							f.removeEventListener(a.end, e.onTouchEnd, !1);
					(t.preventClicks || t.preventClicksPropagation) &&
						r.removeEventListener("click", e.onClick, !0),
						e.off(
							g.ios || g.android
								? "resize orientationchange observerUpdate"
								: "resize observerUpdate",
							b
						);
				},
			},
			breakpoints: {
				setBreakpoint: function () {
					var e = this,
						t = e.activeIndex,
						a = e.initialized,
						i = e.loopedSlides;
					void 0 === i && (i = 0);
					var s = e.params,
						r = s.breakpoints;
					if (r && (!r || 0 !== Object.keys(r).length)) {
						var n = e.getBreakpoint(r);
						if (n && e.currentBreakpoint !== n) {
							var o = n in r ? r[n] : void 0;
							o &&
								["slidesPerView", "spaceBetween", "slidesPerGroup"].forEach(
									function (e) {
										var t = o[e];
										void 0 !== t &&
											(o[e] =
												"slidesPerView" !== e || ("AUTO" !== t && "auto" !== t)
													? "slidesPerView" === e
														? parseFloat(t)
														: parseInt(t, 10)
													: "auto");
									}
								);
							var l = o || e.originalParams,
								d = l.direction && l.direction !== s.direction,
								p = s.loop && (l.slidesPerView !== s.slidesPerView || d);
							d && a && e.changeDirection(),
								ee.extend(e.params, l),
								ee.extend(e, {
									allowTouchMove: e.params.allowTouchMove,
									allowSlideNext: e.params.allowSlideNext,
									allowSlidePrev: e.params.allowSlidePrev,
								}),
								(e.currentBreakpoint = n),
								p &&
									a &&
									(e.loopDestroy(),
									e.loopCreate(),
									e.updateSlides(),
									e.slideTo(t - i + e.loopedSlides, 0, !1)),
								e.emit("breakpoint", l);
						}
					}
				},
				getBreakpoint: function (e) {
					if (e) {
						var t = !1,
							a = [];
						Object.keys(e).forEach(function (e) {
							a.push(e);
						}),
							a.sort(function (e, t) {
								return parseInt(e, 10) - parseInt(t, 10);
							});
						for (var i = 0; i < a.length; i += 1) {
							var s = a[i];
							this.params.breakpointsInverse
								? s <= J.innerWidth && (t = s)
								: s >= J.innerWidth && !t && (t = s);
						}
						return t || "max";
					}
				},
			},
			checkOverflow: {
				checkOverflow: function () {
					var e = this,
						t = e.isLocked;
					(e.isLocked = 1 === e.snapGrid.length),
						(e.allowSlideNext = !e.isLocked),
						(e.allowSlidePrev = !e.isLocked),
						t !== e.isLocked && e.emit(e.isLocked ? "lock" : "unlock"),
						t && t !== e.isLocked && ((e.isEnd = !1), e.navigation.update());
				},
			},
			classes: {
				addClasses: function () {
					var t = this.classNames,
						a = this.params,
						e = this.rtl,
						i = this.$el,
						s = [];
					s.push("initialized"),
						s.push(a.direction),
						a.freeMode && s.push("free-mode"),
						te.flexbox || s.push("no-flexbox"),
						a.autoHeight && s.push("autoheight"),
						e && s.push("rtl"),
						1 < a.slidesPerColumn && s.push("multirow"),
						g.android && s.push("android"),
						g.ios && s.push("ios"),
						(I.isIE || I.isEdge) &&
							(te.pointerEvents || te.prefixedPointerEvents) &&
							s.push("wp8-" + a.direction),
						s.forEach(function (e) {
							t.push(a.containerModifierClass + e);
						}),
						i.addClass(t.join(" "));
				},
				removeClasses: function () {
					var e = this.$el,
						t = this.classNames;
					e.removeClass(t.join(" "));
				},
			},
			images: {
				loadImage: function (e, t, a, i, s, r) {
					var n;
					function o() {
						r && r();
					}
					e.complete && s
						? o()
						: t
						? (((n = new J.Image()).onload = o),
						  (n.onerror = o),
						  i && (n.sizes = i),
						  a && (n.srcset = a),
						  t && (n.src = t))
						: o();
				},
				preloadImages: function () {
					var e = this;
					function t() {
						null != e &&
							e &&
							!e.destroyed &&
							(void 0 !== e.imagesLoaded && (e.imagesLoaded += 1),
							e.imagesLoaded === e.imagesToLoad.length &&
								(e.params.updateOnImagesReady && e.update(),
								e.emit("imagesReady")));
					}
					e.imagesToLoad = e.$el.find("img");
					for (var a = 0; a < e.imagesToLoad.length; a += 1) {
						var i = e.imagesToLoad[a];
						e.loadImage(
							i,
							i.currentSrc || i.getAttribute("src"),
							i.srcset || i.getAttribute("srcset"),
							i.sizes || i.getAttribute("sizes"),
							!0,
							t
						);
					}
				},
			},
		},
		x = {},
		T = (function (u) {
			function h() {
				for (var e, t, s, a = [], i = arguments.length; i--; )
					a[i] = arguments[i];
				1 === a.length && a[0].constructor && a[0].constructor === Object
					? (s = a[0])
					: ((t = (e = a)[0]), (s = e[1])),
					s || (s = {}),
					(s = ee.extend({}, s)),
					t && !s.el && (s.el = t),
					u.call(this, s),
					Object.keys(y).forEach(function (t) {
						Object.keys(y[t]).forEach(function (e) {
							h.prototype[e] || (h.prototype[e] = y[t][e]);
						});
					});
				var r = this;
				void 0 === r.modules && (r.modules = {}),
					Object.keys(r.modules).forEach(function (e) {
						var t = r.modules[e];
						if (t.params) {
							var a = Object.keys(t.params)[0],
								i = t.params[a];
							if ("object" != typeof i || null === i) return;
							if (!(a in s && "enabled" in i)) return;
							!0 === s[a] && (s[a] = { enabled: !0 }),
								"object" != typeof s[a] ||
									"enabled" in s[a] ||
									(s[a].enabled = !0),
								s[a] || (s[a] = { enabled: !1 });
						}
					});
				var n = ee.extend({}, w);
				r.useModulesParams(n),
					(r.params = ee.extend({}, n, x, s)),
					(r.originalParams = ee.extend({}, r.params)),
					(r.passedParams = ee.extend({}, s));
				var o = (r.$ = L)(r.params.el);
				if ((t = o[0])) {
					if (1 < o.length) {
						var l = [];
						return (
							o.each(function (e, t) {
								var a = ee.extend({}, s, { el: t });
								l.push(new h(a));
							}),
							l
						);
					}
					(t.swiper = r), o.data("swiper", r);
					var d,
						p,
						c = o.children("." + r.params.wrapperClass);
					return (
						ee.extend(r, {
							$el: o,
							el: t,
							$wrapperEl: c,
							wrapperEl: c[0],
							classNames: [],
							slides: L(),
							slidesGrid: [],
							snapGrid: [],
							slidesSizesGrid: [],
							isHorizontal: function () {
								return "horizontal" === r.params.direction;
							},
							isVertical: function () {
								return "vertical" === r.params.direction;
							},
							rtl:
								"rtl" === t.dir.toLowerCase() || "rtl" === o.css("direction"),
							rtlTranslate:
								"horizontal" === r.params.direction &&
								("rtl" === t.dir.toLowerCase() || "rtl" === o.css("direction")),
							wrongRTL: "-webkit-box" === c.css("display"),
							activeIndex: 0,
							realIndex: 0,
							isBeginning: !0,
							isEnd: !1,
							translate: 0,
							previousTranslate: 0,
							progress: 0,
							velocity: 0,
							animating: !1,
							allowSlideNext: r.params.allowSlideNext,
							allowSlidePrev: r.params.allowSlidePrev,
							touchEvents:
								((d = ["touchstart", "touchmove", "touchend"]),
								(p = ["mousedown", "mousemove", "mouseup"]),
								te.pointerEvents
									? (p = ["pointerdown", "pointermove", "pointerup"])
									: te.prefixedPointerEvents &&
									  (p = ["MSPointerDown", "MSPointerMove", "MSPointerUp"]),
								(r.touchEventsTouch = { start: d[0], move: d[1], end: d[2] }),
								(r.touchEventsDesktop = { start: p[0], move: p[1], end: p[2] }),
								te.touch || !r.params.simulateTouch
									? r.touchEventsTouch
									: r.touchEventsDesktop),
							touchEventsData: {
								isTouched: void 0,
								isMoved: void 0,
								allowTouchCallbacks: void 0,
								touchStartTime: void 0,
								isScrolling: void 0,
								currentTranslate: void 0,
								startTranslate: void 0,
								allowThresholdMove: void 0,
								formElements: "input, select, option, textarea, button, video",
								lastClickTime: ee.now(),
								clickTimeout: void 0,
								velocities: [],
								allowMomentumBounce: void 0,
								isTouchEvent: void 0,
								startMoving: void 0,
							},
							allowClick: !0,
							allowTouchMove: r.params.allowTouchMove,
							touches: {
								startX: 0,
								startY: 0,
								currentX: 0,
								currentY: 0,
								diff: 0,
							},
							imagesToLoad: [],
							imagesLoaded: 0,
						}),
						r.useModules(),
						r.params.init && r.init(),
						r
					);
				}
			}
			u && (h.__proto__ = u);
			var e = {
				extendedDefaults: { configurable: !0 },
				defaults: { configurable: !0 },
				Class: { configurable: !0 },
				$: { configurable: !0 },
			};
			return (
				(((h.prototype = Object.create(
					u && u.prototype
				)).constructor = h).prototype.slidesPerViewDynamic = function () {
					var e = this,
						t = e.params,
						a = e.slides,
						i = e.slidesGrid,
						s = e.size,
						r = e.activeIndex,
						n = 1;
					if (t.centeredSlides) {
						for (
							var o, l = a[r].swiperSlideSize, d = r + 1;
							d < a.length;
							d += 1
						)
							a[d] &&
								!o &&
								((n += 1), s < (l += a[d].swiperSlideSize) && (o = !0));
						for (var p = r - 1; 0 <= p; p -= 1)
							a[p] &&
								!o &&
								((n += 1), s < (l += a[p].swiperSlideSize) && (o = !0));
					} else
						for (var c = r + 1; c < a.length; c += 1)
							i[c] - i[r] < s && (n += 1);
					return n;
				}),
				(h.prototype.update = function () {
					var a = this;
					if (a && !a.destroyed) {
						var e = a.snapGrid,
							t = a.params;
						t.breakpoints && a.setBreakpoint(),
							a.updateSize(),
							a.updateSlides(),
							a.updateProgress(),
							a.updateSlidesClasses(),
							a.params.freeMode
								? (i(), a.params.autoHeight && a.updateAutoHeight())
								: (("auto" === a.params.slidesPerView ||
										1 < a.params.slidesPerView) &&
								  a.isEnd &&
								  !a.params.centeredSlides
										? a.slideTo(a.slides.length - 1, 0, !1, !0)
										: a.slideTo(a.activeIndex, 0, !1, !0)) || i(),
							t.watchOverflow && e !== a.snapGrid && a.checkOverflow(),
							a.emit("update");
					}
					function i() {
						var e = a.rtlTranslate ? -1 * a.translate : a.translate,
							t = Math.min(Math.max(e, a.maxTranslate()), a.minTranslate());
						a.setTranslate(t), a.updateActiveIndex(), a.updateSlidesClasses();
					}
				}),
				(h.prototype.changeDirection = function (a, e) {
					void 0 === e && (e = !0);
					var t = this,
						i = t.params.direction;
					return (
						a || (a = "horizontal" === i ? "vertical" : "horizontal"),
						a === i ||
							("horizontal" !== a && "vertical" !== a) ||
							("vertical" === i &&
								(t.$el
									.removeClass(
										t.params.containerModifierClass + "vertical wp8-vertical"
									)
									.addClass("" + t.params.containerModifierClass + a),
								(I.isIE || I.isEdge) &&
									(te.pointerEvents || te.prefixedPointerEvents) &&
									t.$el.addClass(t.params.containerModifierClass + "wp8-" + a)),
							"horizontal" === i &&
								(t.$el
									.removeClass(
										t.params.containerModifierClass +
											"horizontal wp8-horizontal"
									)
									.addClass("" + t.params.containerModifierClass + a),
								(I.isIE || I.isEdge) &&
									(te.pointerEvents || te.prefixedPointerEvents) &&
									t.$el.addClass(t.params.containerModifierClass + "wp8-" + a)),
							(t.params.direction = a),
							t.slides.each(function (e, t) {
								"vertical" === a ? (t.style.width = "") : (t.style.height = "");
							}),
							t.emit("changeDirection"),
							e && t.update()),
						t
					);
				}),
				(h.prototype.init = function () {
					var e = this;
					e.initialized ||
						(e.emit("beforeInit"),
						e.params.breakpoints && e.setBreakpoint(),
						e.addClasses(),
						e.params.loop && e.loopCreate(),
						e.updateSize(),
						e.updateSlides(),
						e.params.watchOverflow && e.checkOverflow(),
						e.params.grabCursor && e.setGrabCursor(),
						e.params.preloadImages && e.preloadImages(),
						e.params.loop
							? e.slideTo(
									e.params.initialSlide + e.loopedSlides,
									0,
									e.params.runCallbacksOnInit
							  )
							: e.slideTo(
									e.params.initialSlide,
									0,
									e.params.runCallbacksOnInit
							  ),
						e.attachEvents(),
						(e.initialized = !0),
						e.emit("init"));
				}),
				(h.prototype.destroy = function (e, t) {
					void 0 === e && (e = !0), void 0 === t && (t = !0);
					var a = this,
						i = a.params,
						s = a.$el,
						r = a.$wrapperEl,
						n = a.slides;
					return (
						void 0 === a.params ||
							a.destroyed ||
							(a.emit("beforeDestroy"),
							(a.initialized = !1),
							a.detachEvents(),
							i.loop && a.loopDestroy(),
							t &&
								(a.removeClasses(),
								s.removeAttr("style"),
								r.removeAttr("style"),
								n &&
									n.length &&
									n
										.removeClass(
											[
												i.slideVisibleClass,
												i.slideActiveClass,
												i.slideNextClass,
												i.slidePrevClass,
											].join(" ")
										)
										.removeAttr("style")
										.removeAttr("data-swiper-slide-index")
										.removeAttr("data-swiper-column")
										.removeAttr("data-swiper-row")),
							a.emit("destroy"),
							Object.keys(a.eventsListeners).forEach(function (e) {
								a.off(e);
							}),
							!1 !== e &&
								((a.$el[0].swiper = null),
								a.$el.data("swiper", null),
								ee.deleteProps(a)),
							(a.destroyed = !0)),
						null
					);
				}),
				(h.extendDefaults = function (e) {
					ee.extend(x, e);
				}),
				(e.extendedDefaults.get = function () {
					return x;
				}),
				(e.defaults.get = function () {
					return w;
				}),
				(e.Class.get = function () {
					return u;
				}),
				(e.$.get = function () {
					return L;
				}),
				Object.defineProperties(h, e),
				h
			);
		})(n),
		E = { name: "device", proto: { device: g }, static: { device: g } },
		S = { name: "support", proto: { support: te }, static: { support: te } },
		C = { name: "browser", proto: { browser: I }, static: { browser: I } },
		M = {
			name: "resize",
			create: function () {
				var e = this;
				ee.extend(e, {
					resize: {
						resizeHandler: function () {
							e &&
								!e.destroyed &&
								e.initialized &&
								(e.emit("beforeResize"), e.emit("resize"));
						},
						orientationChangeHandler: function () {
							e && !e.destroyed && e.initialized && e.emit("orientationchange");
						},
					},
				});
			},
			on: {
				init: function () {
					J.addEventListener("resize", this.resize.resizeHandler),
						J.addEventListener(
							"orientationchange",
							this.resize.orientationChangeHandler
						);
				},
				destroy: function () {
					J.removeEventListener("resize", this.resize.resizeHandler),
						J.removeEventListener(
							"orientationchange",
							this.resize.orientationChangeHandler
						);
				},
			},
		},
		z = {
			func: J.MutationObserver || J.WebkitMutationObserver,
			attach: function (e, t) {
				void 0 === t && (t = {});
				var a = this,
					i = new z.func(function (e) {
						if (1 !== e.length) {
							var t = function () {
								a.emit("observerUpdate", e[0]);
							};
							J.requestAnimationFrame
								? J.requestAnimationFrame(t)
								: J.setTimeout(t, 0);
						} else a.emit("observerUpdate", e[0]);
					});
				i.observe(e, {
					attributes: void 0 === t.attributes || t.attributes,
					childList: void 0 === t.childList || t.childList,
					characterData: void 0 === t.characterData || t.characterData,
				}),
					a.observer.observers.push(i);
			},
			init: function () {
				var e = this;
				if (te.observer && e.params.observer) {
					if (e.params.observeParents)
						for (var t = e.$el.parents(), a = 0; a < t.length; a += 1)
							e.observer.attach(t[a]);
					e.observer.attach(e.$el[0], {
						childList: e.params.observeSlideChildren,
					}),
						e.observer.attach(e.$wrapperEl[0], { attributes: !1 });
				}
			},
			destroy: function () {
				this.observer.observers.forEach(function (e) {
					e.disconnect();
				}),
					(this.observer.observers = []);
			},
		},
		P = {
			name: "observer",
			params: { observer: !1, observeParents: !1, observeSlideChildren: !1 },
			create: function () {
				ee.extend(this, {
					observer: {
						init: z.init.bind(this),
						attach: z.attach.bind(this),
						destroy: z.destroy.bind(this),
						observers: [],
					},
				});
			},
			on: {
				init: function () {
					this.observer.init();
				},
				destroy: function () {
					this.observer.destroy();
				},
			},
		},
		k = {
			update: function (e) {
				var t = this,
					a = t.params,
					i = a.slidesPerView,
					s = a.slidesPerGroup,
					r = a.centeredSlides,
					n = t.params.virtual,
					o = n.addSlidesBefore,
					l = n.addSlidesAfter,
					d = t.virtual,
					p = d.from,
					c = d.to,
					u = d.slides,
					h = d.slidesGrid,
					v = d.renderSlide,
					f = d.offset;
				t.updateActiveIndex();
				var m,
					g,
					b,
					w = t.activeIndex || 0;
				(m = t.rtlTranslate ? "right" : t.isHorizontal() ? "left" : "top"),
					r
						? ((g = Math.floor(i / 2) + s + o), (b = Math.floor(i / 2) + s + l))
						: ((g = i + (s - 1) + o), (b = s + l));
				var y = Math.max((w || 0) - b, 0),
					x = Math.min((w || 0) + g, u.length - 1),
					T = (t.slidesGrid[y] || 0) - (t.slidesGrid[0] || 0);
				function E() {
					t.updateSlides(),
						t.updateProgress(),
						t.updateSlidesClasses(),
						t.lazy && t.params.lazy.enabled && t.lazy.load();
				}
				if (
					(ee.extend(t.virtual, {
						from: y,
						to: x,
						offset: T,
						slidesGrid: t.slidesGrid,
					}),
					p === y && c === x && !e)
				)
					return (
						t.slidesGrid !== h && T !== f && t.slides.css(m, T + "px"),
						void t.updateProgress()
					);
				if (t.params.virtual.renderExternal)
					return (
						t.params.virtual.renderExternal.call(t, {
							offset: T,
							from: y,
							to: x,
							slides: (function () {
								for (var e = [], t = y; t <= x; t += 1) e.push(u[t]);
								return e;
							})(),
						}),
						void E()
					);
				var S = [],
					C = [];
				if (e) t.$wrapperEl.find("." + t.params.slideClass).remove();
				else
					for (var M = p; M <= c; M += 1)
						(M < y || x < M) &&
							t.$wrapperEl
								.find(
									"." +
										t.params.slideClass +
										'[data-swiper-slide-index="' +
										M +
										'"]'
								)
								.remove();
				for (var z = 0; z < u.length; z += 1)
					y <= z &&
						z <= x &&
						(void 0 === c || e
							? C.push(z)
							: (c < z && C.push(z), z < p && S.push(z)));
				C.forEach(function (e) {
					t.$wrapperEl.append(v(u[e], e));
				}),
					S.sort(function (e, t) {
						return t - e;
					}).forEach(function (e) {
						t.$wrapperEl.prepend(v(u[e], e));
					}),
					t.$wrapperEl.children(".swiper-slide").css(m, T + "px"),
					E();
			},
			renderSlide: function (e, t) {
				var a = this,
					i = a.params.virtual;
				if (i.cache && a.virtual.cache[t]) return a.virtual.cache[t];
				var s = i.renderSlide
					? L(i.renderSlide.call(a, e, t))
					: L(
							'<div class="' +
								a.params.slideClass +
								'" data-swiper-slide-index="' +
								t +
								'">' +
								e +
								"</div>"
					  );
				return (
					s.attr("data-swiper-slide-index") ||
						s.attr("data-swiper-slide-index", t),
					i.cache && (a.virtual.cache[t] = s),
					s
				);
			},
			appendSlide: function (e) {
				if ("object" == typeof e && "length" in e)
					for (var t = 0; t < e.length; t += 1)
						e[t] && this.virtual.slides.push(e[t]);
				else this.virtual.slides.push(e);
				this.virtual.update(!0);
			},
			prependSlide: function (e) {
				var t = this,
					a = t.activeIndex,
					i = a + 1,
					s = 1;
				if (Array.isArray(e)) {
					for (var r = 0; r < e.length; r += 1)
						e[r] && t.virtual.slides.unshift(e[r]);
					(i = a + e.length), (s = e.length);
				} else t.virtual.slides.unshift(e);
				if (t.params.virtual.cache) {
					var n = t.virtual.cache,
						o = {};
					Object.keys(n).forEach(function (e) {
						o[parseInt(e, 10) + s] = n[e];
					}),
						(t.virtual.cache = o);
				}
				t.virtual.update(!0), t.slideTo(i, 0);
			},
			removeSlide: function (e) {
				var t = this;
				if (null != e) {
					var a = t.activeIndex;
					if (Array.isArray(e))
						for (var i = e.length - 1; 0 <= i; i -= 1)
							t.virtual.slides.splice(e[i], 1),
								t.params.virtual.cache && delete t.virtual.cache[e[i]],
								e[i] < a && (a -= 1),
								(a = Math.max(a, 0));
					else
						t.virtual.slides.splice(e, 1),
							t.params.virtual.cache && delete t.virtual.cache[e],
							e < a && (a -= 1),
							(a = Math.max(a, 0));
					t.virtual.update(!0), t.slideTo(a, 0);
				}
			},
			removeAllSlides: function () {
				var e = this;
				(e.virtual.slides = []),
					e.params.virtual.cache && (e.virtual.cache = {}),
					e.virtual.update(!0),
					e.slideTo(0, 0);
			},
		},
		$ = {
			name: "virtual",
			params: {
				virtual: {
					enabled: !1,
					slides: [],
					cache: !0,
					renderSlide: null,
					renderExternal: null,
					addSlidesBefore: 0,
					addSlidesAfter: 0,
				},
			},
			create: function () {
				var e = this;
				ee.extend(e, {
					virtual: {
						update: k.update.bind(e),
						appendSlide: k.appendSlide.bind(e),
						prependSlide: k.prependSlide.bind(e),
						removeSlide: k.removeSlide.bind(e),
						removeAllSlides: k.removeAllSlides.bind(e),
						renderSlide: k.renderSlide.bind(e),
						slides: e.params.virtual.slides,
						cache: {},
					},
				});
			},
			on: {
				beforeInit: function () {
					var e = this;
					if (e.params.virtual.enabled) {
						e.classNames.push(e.params.containerModifierClass + "virtual");
						var t = { watchSlidesProgress: !0 };
						ee.extend(e.params, t),
							ee.extend(e.originalParams, t),
							e.params.initialSlide || e.virtual.update();
					}
				},
				setTranslate: function () {
					this.params.virtual.enabled && this.virtual.update();
				},
			},
		},
		D = {
			handle: function (e) {
				var t = this,
					a = t.rtlTranslate,
					i = e;
				i.originalEvent && (i = i.originalEvent);
				var s = i.keyCode || i.charCode;
				if (
					!t.allowSlideNext &&
					((t.isHorizontal() && 39 === s) || (t.isVertical() && 40 === s))
				)
					return !1;
				if (
					!t.allowSlidePrev &&
					((t.isHorizontal() && 37 === s) || (t.isVertical() && 38 === s))
				)
					return !1;
				if (
					!(
						i.shiftKey ||
						i.altKey ||
						i.ctrlKey ||
						i.metaKey ||
						(f.activeElement &&
							f.activeElement.nodeName &&
							("input" === f.activeElement.nodeName.toLowerCase() ||
								"textarea" === f.activeElement.nodeName.toLowerCase()))
					)
				) {
					if (
						t.params.keyboard.onlyInViewport &&
						(37 === s || 39 === s || 38 === s || 40 === s)
					) {
						var r = !1;
						if (
							0 < t.$el.parents("." + t.params.slideClass).length &&
							0 === t.$el.parents("." + t.params.slideActiveClass).length
						)
							return;
						var n = J.innerWidth,
							o = J.innerHeight,
							l = t.$el.offset();
						a && (l.left -= t.$el[0].scrollLeft);
						for (
							var d = [
									[l.left, l.top],
									[l.left + t.width, l.top],
									[l.left, l.top + t.height],
									[l.left + t.width, l.top + t.height],
								],
								p = 0;
							p < d.length;
							p += 1
						) {
							var c = d[p];
							0 <= c[0] && c[0] <= n && 0 <= c[1] && c[1] <= o && (r = !0);
						}
						if (!r) return;
					}
					t.isHorizontal()
						? ((37 !== s && 39 !== s) ||
								(i.preventDefault ? i.preventDefault() : (i.returnValue = !1)),
						  ((39 === s && !a) || (37 === s && a)) && t.slideNext(),
						  ((37 === s && !a) || (39 === s && a)) && t.slidePrev())
						: ((38 !== s && 40 !== s) ||
								(i.preventDefault ? i.preventDefault() : (i.returnValue = !1)),
						  40 === s && t.slideNext(),
						  38 === s && t.slidePrev()),
						t.emit("keyPress", s);
				}
			},
			enable: function () {
				this.keyboard.enabled ||
					(L(f).on("keydown", this.keyboard.handle),
					(this.keyboard.enabled = !0));
			},
			disable: function () {
				this.keyboard.enabled &&
					(L(f).off("keydown", this.keyboard.handle),
					(this.keyboard.enabled = !1));
			},
		},
		O = {
			name: "keyboard",
			params: { keyboard: { enabled: !1, onlyInViewport: !0 } },
			create: function () {
				ee.extend(this, {
					keyboard: {
						enabled: !1,
						enable: D.enable.bind(this),
						disable: D.disable.bind(this),
						handle: D.handle.bind(this),
					},
				});
			},
			on: {
				init: function () {
					this.params.keyboard.enabled && this.keyboard.enable();
				},
				destroy: function () {
					this.keyboard.enabled && this.keyboard.disable();
				},
			},
		};
	var A = {
			lastScrollTime: ee.now(),
			event:
				-1 < J.navigator.userAgent.indexOf("firefox")
					? "DOMMouseScroll"
					: (function () {
							var e = "onwheel",
								t = e in f;
							if (!t) {
								var a = f.createElement("div");
								a.setAttribute(e, "return;"), (t = "function" == typeof a[e]);
							}
							return (
								!t &&
									f.implementation &&
									f.implementation.hasFeature &&
									!0 !== f.implementation.hasFeature("", "") &&
									(t = f.implementation.hasFeature("Events.wheel", "3.0")),
								t
							);
					  })()
					? "wheel"
					: "mousewheel",
			normalize: function (e) {
				var t = 0,
					a = 0,
					i = 0,
					s = 0;
				return (
					"detail" in e && (a = e.detail),
					"wheelDelta" in e && (a = -e.wheelDelta / 120),
					"wheelDeltaY" in e && (a = -e.wheelDeltaY / 120),
					"wheelDeltaX" in e && (t = -e.wheelDeltaX / 120),
					"axis" in e && e.axis === e.HORIZONTAL_AXIS && ((t = a), (a = 0)),
					(i = 10 * t),
					(s = 10 * a),
					"deltaY" in e && (s = e.deltaY),
					"deltaX" in e && (i = e.deltaX),
					(i || s) &&
						e.deltaMode &&
						(1 === e.deltaMode
							? ((i *= 40), (s *= 40))
							: ((i *= 800), (s *= 800))),
					i && !t && (t = i < 1 ? -1 : 1),
					s && !a && (a = s < 1 ? -1 : 1),
					{ spinX: t, spinY: a, pixelX: i, pixelY: s }
				);
			},
			handleMouseEnter: function () {
				this.mouseEntered = !0;
			},
			handleMouseLeave: function () {
				this.mouseEntered = !1;
			},
			handle: function (e) {
				var t = e,
					a = this,
					i = a.params.mousewheel;
				if (!a.mouseEntered && !i.releaseOnEdges) return !0;
				t.originalEvent && (t = t.originalEvent);
				var s = 0,
					r = a.rtlTranslate ? -1 : 1,
					n = A.normalize(t);
				if (i.forceToAxis)
					if (a.isHorizontal()) {
						if (!(Math.abs(n.pixelX) > Math.abs(n.pixelY))) return !0;
						s = n.pixelX * r;
					} else {
						if (!(Math.abs(n.pixelY) > Math.abs(n.pixelX))) return !0;
						s = n.pixelY;
					}
				else
					s =
						Math.abs(n.pixelX) > Math.abs(n.pixelY) ? -n.pixelX * r : -n.pixelY;
				if (0 === s) return !0;
				if ((i.invert && (s = -s), a.params.freeMode)) {
					a.params.loop && a.loopFix();
					var o = a.getTranslate() + s * i.sensitivity,
						l = a.isBeginning,
						d = a.isEnd;
					if (
						(o >= a.minTranslate() && (o = a.minTranslate()),
						o <= a.maxTranslate() && (o = a.maxTranslate()),
						a.setTransition(0),
						a.setTranslate(o),
						a.updateProgress(),
						a.updateActiveIndex(),
						a.updateSlidesClasses(),
						((!l && a.isBeginning) || (!d && a.isEnd)) &&
							a.updateSlidesClasses(),
						a.params.freeModeSticky &&
							(clearTimeout(a.mousewheel.timeout),
							(a.mousewheel.timeout = ee.nextTick(function () {
								a.slideToClosest();
							}, 300))),
						a.emit("scroll", t),
						a.params.autoplay &&
							a.params.autoplayDisableOnInteraction &&
							a.autoplay.stop(),
						o === a.minTranslate() || o === a.maxTranslate())
					)
						return !0;
				} else {
					if (60 < ee.now() - a.mousewheel.lastScrollTime)
						if (s < 0)
							if ((a.isEnd && !a.params.loop) || a.animating) {
								if (i.releaseOnEdges) return !0;
							} else a.slideNext(), a.emit("scroll", t);
						else if ((a.isBeginning && !a.params.loop) || a.animating) {
							if (i.releaseOnEdges) return !0;
						} else a.slidePrev(), a.emit("scroll", t);
					a.mousewheel.lastScrollTime = new J.Date().getTime();
				}
				return t.preventDefault ? t.preventDefault() : (t.returnValue = !1), !1;
			},
			enable: function () {
				var e = this;
				if (!A.event) return !1;
				if (e.mousewheel.enabled) return !1;
				var t = e.$el;
				return (
					"container" !== e.params.mousewheel.eventsTarged &&
						(t = L(e.params.mousewheel.eventsTarged)),
					t.on("mouseenter", e.mousewheel.handleMouseEnter),
					t.on("mouseleave", e.mousewheel.handleMouseLeave),
					t.on(A.event, e.mousewheel.handle),
					(e.mousewheel.enabled = !0)
				);
			},
			disable: function () {
				var e = this;
				if (!A.event) return !1;
				if (!e.mousewheel.enabled) return !1;
				var t = e.$el;
				return (
					"container" !== e.params.mousewheel.eventsTarged &&
						(t = L(e.params.mousewheel.eventsTarged)),
					t.off(A.event, e.mousewheel.handle),
					!(e.mousewheel.enabled = !1)
				);
			},
		},
		H = {
			update: function () {
				var e = this,
					t = e.params.navigation;
				if (!e.params.loop) {
					var a = e.navigation,
						i = a.$nextEl,
						s = a.$prevEl;
					s &&
						0 < s.length &&
						(e.isBeginning
							? s.addClass(t.disabledClass)
							: s.removeClass(t.disabledClass),
						s[
							e.params.watchOverflow && e.isLocked ? "addClass" : "removeClass"
						](t.lockClass)),
						i &&
							0 < i.length &&
							(e.isEnd
								? i.addClass(t.disabledClass)
								: i.removeClass(t.disabledClass),
							i[
								e.params.watchOverflow && e.isLocked
									? "addClass"
									: "removeClass"
							](t.lockClass));
				}
			},
			onPrevClick: function (e) {
				e.preventDefault(),
					(this.isBeginning && !this.params.loop) || this.slidePrev();
			},
			onNextClick: function (e) {
				e.preventDefault(),
					(this.isEnd && !this.params.loop) || this.slideNext();
			},
			init: function () {
				var e,
					t,
					a = this,
					i = a.params.navigation;
				(i.nextEl || i.prevEl) &&
					(i.nextEl &&
						((e = L(i.nextEl)),
						a.params.uniqueNavElements &&
							"string" == typeof i.nextEl &&
							1 < e.length &&
							1 === a.$el.find(i.nextEl).length &&
							(e = a.$el.find(i.nextEl))),
					i.prevEl &&
						((t = L(i.prevEl)),
						a.params.uniqueNavElements &&
							"string" == typeof i.prevEl &&
							1 < t.length &&
							1 === a.$el.find(i.prevEl).length &&
							(t = a.$el.find(i.prevEl))),
					e && 0 < e.length && e.on("click", a.navigation.onNextClick),
					t && 0 < t.length && t.on("click", a.navigation.onPrevClick),
					ee.extend(a.navigation, {
						$nextEl: e,
						nextEl: e && e[0],
						$prevEl: t,
						prevEl: t && t[0],
					}));
			},
			destroy: function () {
				var e = this,
					t = e.navigation,
					a = t.$nextEl,
					i = t.$prevEl;
				a &&
					a.length &&
					(a.off("click", e.navigation.onNextClick),
					a.removeClass(e.params.navigation.disabledClass)),
					i &&
						i.length &&
						(i.off("click", e.navigation.onPrevClick),
						i.removeClass(e.params.navigation.disabledClass));
			},
		},
		N = {
			update: function () {
				var e = this,
					t = e.rtl,
					s = e.params.pagination;
				if (
					s.el &&
					e.pagination.el &&
					e.pagination.$el &&
					0 !== e.pagination.$el.length
				) {
					var r,
						a =
							e.virtual && e.params.virtual.enabled
								? e.virtual.slides.length
								: e.slides.length,
						i = e.pagination.$el,
						n = e.params.loop
							? Math.ceil((a - 2 * e.loopedSlides) / e.params.slidesPerGroup)
							: e.snapGrid.length;
					if (
						(e.params.loop
							? ((r = Math.ceil(
									(e.activeIndex - e.loopedSlides) / e.params.slidesPerGroup
							  )) >
									a - 1 - 2 * e.loopedSlides && (r -= a - 2 * e.loopedSlides),
							  n - 1 < r && (r -= n),
							  r < 0 && "bullets" !== e.params.paginationType && (r = n + r))
							: (r = void 0 !== e.snapIndex ? e.snapIndex : e.activeIndex || 0),
						"bullets" === s.type &&
							e.pagination.bullets &&
							0 < e.pagination.bullets.length)
					) {
						var o,
							l,
							d,
							p = e.pagination.bullets;
						if (
							(s.dynamicBullets &&
								((e.pagination.bulletSize = p
									.eq(0)
									[e.isHorizontal() ? "outerWidth" : "outerHeight"](!0)),
								i.css(
									e.isHorizontal() ? "width" : "height",
									e.pagination.bulletSize * (s.dynamicMainBullets + 4) + "px"
								),
								1 < s.dynamicMainBullets &&
									void 0 !== e.previousIndex &&
									((e.pagination.dynamicBulletIndex += r - e.previousIndex),
									e.pagination.dynamicBulletIndex > s.dynamicMainBullets - 1
										? (e.pagination.dynamicBulletIndex =
												s.dynamicMainBullets - 1)
										: e.pagination.dynamicBulletIndex < 0 &&
										  (e.pagination.dynamicBulletIndex = 0)),
								(o = r - e.pagination.dynamicBulletIndex),
								(d =
									((l = o + (Math.min(p.length, s.dynamicMainBullets) - 1)) +
										o) /
									2)),
							p.removeClass(
								s.bulletActiveClass +
									" " +
									s.bulletActiveClass +
									"-next " +
									s.bulletActiveClass +
									"-next-next " +
									s.bulletActiveClass +
									"-prev " +
									s.bulletActiveClass +
									"-prev-prev " +
									s.bulletActiveClass +
									"-main"
							),
							1 < i.length)
						)
							p.each(function (e, t) {
								var a = L(t),
									i = a.index();
								i === r && a.addClass(s.bulletActiveClass),
									s.dynamicBullets &&
										(o <= i &&
											i <= l &&
											a.addClass(s.bulletActiveClass + "-main"),
										i === o &&
											a
												.prev()
												.addClass(s.bulletActiveClass + "-prev")
												.prev()
												.addClass(s.bulletActiveClass + "-prev-prev"),
										i === l &&
											a
												.next()
												.addClass(s.bulletActiveClass + "-next")
												.next()
												.addClass(s.bulletActiveClass + "-next-next"));
							});
						else if (
							(p.eq(r).addClass(s.bulletActiveClass), s.dynamicBullets)
						) {
							for (var c = p.eq(o), u = p.eq(l), h = o; h <= l; h += 1)
								p.eq(h).addClass(s.bulletActiveClass + "-main");
							c
								.prev()
								.addClass(s.bulletActiveClass + "-prev")
								.prev()
								.addClass(s.bulletActiveClass + "-prev-prev"),
								u
									.next()
									.addClass(s.bulletActiveClass + "-next")
									.next()
									.addClass(s.bulletActiveClass + "-next-next");
						}
						if (s.dynamicBullets) {
							var v = Math.min(p.length, s.dynamicMainBullets + 4),
								f =
									(e.pagination.bulletSize * v - e.pagination.bulletSize) / 2 -
									d * e.pagination.bulletSize,
								m = t ? "right" : "left";
							p.css(e.isHorizontal() ? m : "top", f + "px");
						}
					}
					if (
						("fraction" === s.type &&
							(i
								.find("." + s.currentClass)
								.text(s.formatFractionCurrent(r + 1)),
							i.find("." + s.totalClass).text(s.formatFractionTotal(n))),
						"progressbar" === s.type)
					) {
						var g;
						g = s.progressbarOpposite
							? e.isHorizontal()
								? "vertical"
								: "horizontal"
							: e.isHorizontal()
							? "horizontal"
							: "vertical";
						var b = (r + 1) / n,
							w = 1,
							y = 1;
						"horizontal" === g ? (w = b) : (y = b),
							i
								.find("." + s.progressbarFillClass)
								.transform(
									"translate3d(0,0,0) scaleX(" + w + ") scaleY(" + y + ")"
								)
								.transition(e.params.speed);
					}
					"custom" === s.type && s.renderCustom
						? (i.html(s.renderCustom(e, r + 1, n)),
						  e.emit("paginationRender", e, i[0]))
						: e.emit("paginationUpdate", e, i[0]),
						i[
							e.params.watchOverflow && e.isLocked ? "addClass" : "removeClass"
						](s.lockClass);
				}
			},
			render: function () {
				var e = this,
					t = e.params.pagination;
				if (
					t.el &&
					e.pagination.el &&
					e.pagination.$el &&
					0 !== e.pagination.$el.length
				) {
					var a =
							e.virtual && e.params.virtual.enabled
								? e.virtual.slides.length
								: e.slides.length,
						i = e.pagination.$el,
						s = "";
					if ("bullets" === t.type) {
						for (
							var r = e.params.loop
									? Math.ceil(
											(a - 2 * e.loopedSlides) / e.params.slidesPerGroup
									  )
									: e.snapGrid.length,
								n = 0;
							n < r;
							n += 1
						)
							t.renderBullet
								? (s += t.renderBullet.call(e, n, t.bulletClass))
								: (s +=
										"<" +
										t.bulletElement +
										' class="' +
										t.bulletClass +
										'"></' +
										t.bulletElement +
										">");
						i.html(s), (e.pagination.bullets = i.find("." + t.bulletClass));
					}
					"fraction" === t.type &&
						((s = t.renderFraction
							? t.renderFraction.call(e, t.currentClass, t.totalClass)
							: '<span class="' +
							  t.currentClass +
							  '"></span> / <span class="' +
							  t.totalClass +
							  '"></span>'),
						i.html(s)),
						"progressbar" === t.type &&
							((s = t.renderProgressbar
								? t.renderProgressbar.call(e, t.progressbarFillClass)
								: '<span class="' + t.progressbarFillClass + '"></span>'),
							i.html(s)),
						"custom" !== t.type &&
							e.emit("paginationRender", e.pagination.$el[0]);
				}
			},
			init: function () {
				var a = this,
					e = a.params.pagination;
				if (e.el) {
					var t = L(e.el);
					0 !== t.length &&
						(a.params.uniqueNavElements &&
							"string" == typeof e.el &&
							1 < t.length &&
							1 === a.$el.find(e.el).length &&
							(t = a.$el.find(e.el)),
						"bullets" === e.type && e.clickable && t.addClass(e.clickableClass),
						t.addClass(e.modifierClass + e.type),
						"bullets" === e.type &&
							e.dynamicBullets &&
							(t.addClass("" + e.modifierClass + e.type + "-dynamic"),
							(a.pagination.dynamicBulletIndex = 0),
							e.dynamicMainBullets < 1 && (e.dynamicMainBullets = 1)),
						"progressbar" === e.type &&
							e.progressbarOpposite &&
							t.addClass(e.progressbarOppositeClass),
						e.clickable &&
							t.on("click", "." + e.bulletClass, function (e) {
								e.preventDefault();
								var t = L(this).index() * a.params.slidesPerGroup;
								a.params.loop && (t += a.loopedSlides), a.slideTo(t);
							}),
						ee.extend(a.pagination, { $el: t, el: t[0] }));
				}
			},
			destroy: function () {
				var e = this,
					t = e.params.pagination;
				if (
					t.el &&
					e.pagination.el &&
					e.pagination.$el &&
					0 !== e.pagination.$el.length
				) {
					var a = e.pagination.$el;
					a.removeClass(t.hiddenClass),
						a.removeClass(t.modifierClass + t.type),
						e.pagination.bullets &&
							e.pagination.bullets.removeClass(t.bulletActiveClass),
						t.clickable && a.off("click", "." + t.bulletClass);
				}
			},
		},
		G = {
			setTranslate: function () {
				var e = this;
				if (e.params.scrollbar.el && e.scrollbar.el) {
					var t = e.scrollbar,
						a = e.rtlTranslate,
						i = e.progress,
						s = t.dragSize,
						r = t.trackSize,
						n = t.$dragEl,
						o = t.$el,
						l = e.params.scrollbar,
						d = s,
						p = (r - s) * i;
					a
						? 0 < (p = -p)
							? ((d = s - p), (p = 0))
							: r < -p + s && (d = r + p)
						: p < 0
						? ((d = s + p), (p = 0))
						: r < p + s && (d = r - p),
						e.isHorizontal()
							? (te.transforms3d
									? n.transform("translate3d(" + p + "px, 0, 0)")
									: n.transform("translateX(" + p + "px)"),
							  (n[0].style.width = d + "px"))
							: (te.transforms3d
									? n.transform("translate3d(0px, " + p + "px, 0)")
									: n.transform("translateY(" + p + "px)"),
							  (n[0].style.height = d + "px")),
						l.hide &&
							(clearTimeout(e.scrollbar.timeout),
							(o[0].style.opacity = 1),
							(e.scrollbar.timeout = setTimeout(function () {
								(o[0].style.opacity = 0), o.transition(400);
							}, 1e3)));
				}
			},
			setTransition: function (e) {
				this.params.scrollbar.el &&
					this.scrollbar.el &&
					this.scrollbar.$dragEl.transition(e);
			},
			updateSize: function () {
				var e = this;
				if (e.params.scrollbar.el && e.scrollbar.el) {
					var t = e.scrollbar,
						a = t.$dragEl,
						i = t.$el;
					(a[0].style.width = ""), (a[0].style.height = "");
					var s,
						r = e.isHorizontal() ? i[0].offsetWidth : i[0].offsetHeight,
						n = e.size / e.virtualSize,
						o = n * (r / e.size);
					(s =
						"auto" === e.params.scrollbar.dragSize
							? r * n
							: parseInt(e.params.scrollbar.dragSize, 10)),
						e.isHorizontal()
							? (a[0].style.width = s + "px")
							: (a[0].style.height = s + "px"),
						(i[0].style.display = 1 <= n ? "none" : ""),
						e.params.scrollbar.hide && (i[0].style.opacity = 0),
						ee.extend(t, {
							trackSize: r,
							divider: n,
							moveDivider: o,
							dragSize: s,
						}),
						t.$el[
							e.params.watchOverflow && e.isLocked ? "addClass" : "removeClass"
						](e.params.scrollbar.lockClass);
				}
			},
			setDragPosition: function (e) {
				var t,
					a = this,
					i = a.scrollbar,
					s = a.rtlTranslate,
					r = i.$el,
					n = i.dragSize,
					o = i.trackSize;
				(t =
					((a.isHorizontal()
						? "touchstart" === e.type || "touchmove" === e.type
							? e.targetTouches[0].pageX
							: e.pageX || e.clientX
						: "touchstart" === e.type || "touchmove" === e.type
						? e.targetTouches[0].pageY
						: e.pageY || e.clientY) -
						r.offset()[a.isHorizontal() ? "left" : "top"] -
						n / 2) /
					(o - n)),
					(t = Math.max(Math.min(t, 1), 0)),
					s && (t = 1 - t);
				var l = a.minTranslate() + (a.maxTranslate() - a.minTranslate()) * t;
				a.updateProgress(l),
					a.setTranslate(l),
					a.updateActiveIndex(),
					a.updateSlidesClasses();
			},
			onDragStart: function (e) {
				var t = this,
					a = t.params.scrollbar,
					i = t.scrollbar,
					s = t.$wrapperEl,
					r = i.$el,
					n = i.$dragEl;
				(t.scrollbar.isTouched = !0),
					e.preventDefault(),
					e.stopPropagation(),
					s.transition(100),
					n.transition(100),
					i.setDragPosition(e),
					clearTimeout(t.scrollbar.dragTimeout),
					r.transition(0),
					a.hide && r.css("opacity", 1),
					t.emit("scrollbarDragStart", e);
			},
			onDragMove: function (e) {
				var t = this.scrollbar,
					a = this.$wrapperEl,
					i = t.$el,
					s = t.$dragEl;
				this.scrollbar.isTouched &&
					(e.preventDefault ? e.preventDefault() : (e.returnValue = !1),
					t.setDragPosition(e),
					a.transition(0),
					i.transition(0),
					s.transition(0),
					this.emit("scrollbarDragMove", e));
			},
			onDragEnd: function (e) {
				var t = this,
					a = t.params.scrollbar,
					i = t.scrollbar.$el;
				t.scrollbar.isTouched &&
					((t.scrollbar.isTouched = !1),
					a.hide &&
						(clearTimeout(t.scrollbar.dragTimeout),
						(t.scrollbar.dragTimeout = ee.nextTick(function () {
							i.css("opacity", 0), i.transition(400);
						}, 1e3))),
					t.emit("scrollbarDragEnd", e),
					a.snapOnRelease && t.slideToClosest());
			},
			enableDraggable: function () {
				var e = this;
				if (e.params.scrollbar.el) {
					var t = e.scrollbar,
						a = e.touchEventsTouch,
						i = e.touchEventsDesktop,
						s = e.params,
						r = t.$el[0],
						n = !(!te.passiveListener || !s.passiveListeners) && {
							passive: !1,
							capture: !1,
						},
						o = !(!te.passiveListener || !s.passiveListeners) && {
							passive: !0,
							capture: !1,
						};
					te.touch
						? (r.addEventListener(a.start, e.scrollbar.onDragStart, n),
						  r.addEventListener(a.move, e.scrollbar.onDragMove, n),
						  r.addEventListener(a.end, e.scrollbar.onDragEnd, o))
						: (r.addEventListener(i.start, e.scrollbar.onDragStart, n),
						  f.addEventListener(i.move, e.scrollbar.onDragMove, n),
						  f.addEventListener(i.end, e.scrollbar.onDragEnd, o));
				}
			},
			disableDraggable: function () {
				var e = this;
				if (e.params.scrollbar.el) {
					var t = e.scrollbar,
						a = e.touchEventsTouch,
						i = e.touchEventsDesktop,
						s = e.params,
						r = t.$el[0],
						n = !(!te.passiveListener || !s.passiveListeners) && {
							passive: !1,
							capture: !1,
						},
						o = !(!te.passiveListener || !s.passiveListeners) && {
							passive: !0,
							capture: !1,
						};
					te.touch
						? (r.removeEventListener(a.start, e.scrollbar.onDragStart, n),
						  r.removeEventListener(a.move, e.scrollbar.onDragMove, n),
						  r.removeEventListener(a.end, e.scrollbar.onDragEnd, o))
						: (r.removeEventListener(i.start, e.scrollbar.onDragStart, n),
						  f.removeEventListener(i.move, e.scrollbar.onDragMove, n),
						  f.removeEventListener(i.end, e.scrollbar.onDragEnd, o));
				}
			},
			init: function () {
				var e = this;
				if (e.params.scrollbar.el) {
					var t = e.scrollbar,
						a = e.$el,
						i = e.params.scrollbar,
						s = L(i.el);
					e.params.uniqueNavElements &&
						"string" == typeof i.el &&
						1 < s.length &&
						1 === a.find(i.el).length &&
						(s = a.find(i.el));
					var r = s.find("." + e.params.scrollbar.dragClass);
					0 === r.length &&
						((r = L(
							'<div class="' + e.params.scrollbar.dragClass + '"></div>'
						)),
						s.append(r)),
						ee.extend(t, { $el: s, el: s[0], $dragEl: r, dragEl: r[0] }),
						i.draggable && t.enableDraggable();
				}
			},
			destroy: function () {
				this.scrollbar.disableDraggable();
			},
		},
		B = {
			setTransform: function (e, t) {
				var a = this.rtl,
					i = L(e),
					s = a ? -1 : 1,
					r = i.attr("data-swiper-parallax") || "0",
					n = i.attr("data-swiper-parallax-x"),
					o = i.attr("data-swiper-parallax-y"),
					l = i.attr("data-swiper-parallax-scale"),
					d = i.attr("data-swiper-parallax-opacity");
				if (
					(n || o
						? ((n = n || "0"), (o = o || "0"))
						: this.isHorizontal()
						? ((n = r), (o = "0"))
						: ((o = r), (n = "0")),
					(n =
						0 <= n.indexOf("%")
							? parseInt(n, 10) * t * s + "%"
							: n * t * s + "px"),
					(o = 0 <= o.indexOf("%") ? parseInt(o, 10) * t + "%" : o * t + "px"),
					null != d)
				) {
					var p = d - (d - 1) * (1 - Math.abs(t));
					i[0].style.opacity = p;
				}
				if (null == l) i.transform("translate3d(" + n + ", " + o + ", 0px)");
				else {
					var c = l - (l - 1) * (1 - Math.abs(t));
					i.transform(
						"translate3d(" + n + ", " + o + ", 0px) scale(" + c + ")"
					);
				}
			},
			setTranslate: function () {
				var i = this,
					e = i.$el,
					t = i.slides,
					s = i.progress,
					r = i.snapGrid;
				e
					.children(
						"[data-swiper-parallax], [data-swiper-parallax-x], [data-swiper-parallax-y]"
					)
					.each(function (e, t) {
						i.parallax.setTransform(t, s);
					}),
					t.each(function (e, t) {
						var a = t.progress;
						1 < i.params.slidesPerGroup &&
							"auto" !== i.params.slidesPerView &&
							(a += Math.ceil(e / 2) - s * (r.length - 1)),
							(a = Math.min(Math.max(a, -1), 1)),
							L(t)
								.find(
									"[data-swiper-parallax], [data-swiper-parallax-x], [data-swiper-parallax-y]"
								)
								.each(function (e, t) {
									i.parallax.setTransform(t, a);
								});
					});
			},
			setTransition: function (s) {
				void 0 === s && (s = this.params.speed);
				this.$el
					.find(
						"[data-swiper-parallax], [data-swiper-parallax-x], [data-swiper-parallax-y]"
					)
					.each(function (e, t) {
						var a = L(t),
							i = parseInt(a.attr("data-swiper-parallax-duration"), 10) || s;
						0 === s && (i = 0), a.transition(i);
					});
			},
		},
		X = {
			getDistanceBetweenTouches: function (e) {
				if (e.targetTouches.length < 2) return 1;
				var t = e.targetTouches[0].pageX,
					a = e.targetTouches[0].pageY,
					i = e.targetTouches[1].pageX,
					s = e.targetTouches[1].pageY;
				return Math.sqrt(Math.pow(i - t, 2) + Math.pow(s - a, 2));
			},
			onGestureStart: function (e) {
				var t = this,
					a = t.params.zoom,
					i = t.zoom,
					s = i.gesture;
				if (
					((i.fakeGestureTouched = !1), (i.fakeGestureMoved = !1), !te.gestures)
				) {
					if (
						"touchstart" !== e.type ||
						("touchstart" === e.type && e.targetTouches.length < 2)
					)
						return;
					(i.fakeGestureTouched = !0),
						(s.scaleStart = X.getDistanceBetweenTouches(e));
				}
				(s.$slideEl && s.$slideEl.length) ||
				((s.$slideEl = L(e.target).closest(".swiper-slide")),
				0 === s.$slideEl.length && (s.$slideEl = t.slides.eq(t.activeIndex)),
				(s.$imageEl = s.$slideEl.find("img, svg, canvas")),
				(s.$imageWrapEl = s.$imageEl.parent("." + a.containerClass)),
				(s.maxRatio = s.$imageWrapEl.attr("data-swiper-zoom") || a.maxRatio),
				0 !== s.$imageWrapEl.length)
					? (s.$imageEl.transition(0), (t.zoom.isScaling = !0))
					: (s.$imageEl = void 0);
			},
			onGestureChange: function (e) {
				var t = this.params.zoom,
					a = this.zoom,
					i = a.gesture;
				if (!te.gestures) {
					if (
						"touchmove" !== e.type ||
						("touchmove" === e.type && e.targetTouches.length < 2)
					)
						return;
					(a.fakeGestureMoved = !0),
						(i.scaleMove = X.getDistanceBetweenTouches(e));
				}
				i.$imageEl &&
					0 !== i.$imageEl.length &&
					((a.scale = te.gestures
						? e.scale * a.currentScale
						: (i.scaleMove / i.scaleStart) * a.currentScale),
					a.scale > i.maxRatio &&
						(a.scale =
							i.maxRatio - 1 + Math.pow(a.scale - i.maxRatio + 1, 0.5)),
					a.scale < t.minRatio &&
						(a.scale =
							t.minRatio + 1 - Math.pow(t.minRatio - a.scale + 1, 0.5)),
					i.$imageEl.transform("translate3d(0,0,0) scale(" + a.scale + ")"));
			},
			onGestureEnd: function (e) {
				var t = this.params.zoom,
					a = this.zoom,
					i = a.gesture;
				if (!te.gestures) {
					if (!a.fakeGestureTouched || !a.fakeGestureMoved) return;
					if (
						"touchend" !== e.type ||
						("touchend" === e.type && e.changedTouches.length < 2 && !g.android)
					)
						return;
					(a.fakeGestureTouched = !1), (a.fakeGestureMoved = !1);
				}
				i.$imageEl &&
					0 !== i.$imageEl.length &&
					((a.scale = Math.max(Math.min(a.scale, i.maxRatio), t.minRatio)),
					i.$imageEl
						.transition(this.params.speed)
						.transform("translate3d(0,0,0) scale(" + a.scale + ")"),
					(a.currentScale = a.scale),
					(a.isScaling = !1),
					1 === a.scale && (i.$slideEl = void 0));
			},
			onTouchStart: function (e) {
				var t = this.zoom,
					a = t.gesture,
					i = t.image;
				a.$imageEl &&
					0 !== a.$imageEl.length &&
					(i.isTouched ||
						(g.android && e.preventDefault(),
						(i.isTouched = !0),
						(i.touchesStart.x =
							"touchstart" === e.type ? e.targetTouches[0].pageX : e.pageX),
						(i.touchesStart.y =
							"touchstart" === e.type ? e.targetTouches[0].pageY : e.pageY)));
			},
			onTouchMove: function (e) {
				var t = this,
					a = t.zoom,
					i = a.gesture,
					s = a.image,
					r = a.velocity;
				if (
					i.$imageEl &&
					0 !== i.$imageEl.length &&
					((t.allowClick = !1), s.isTouched && i.$slideEl)
				) {
					s.isMoved ||
						((s.width = i.$imageEl[0].offsetWidth),
						(s.height = i.$imageEl[0].offsetHeight),
						(s.startX = ee.getTranslate(i.$imageWrapEl[0], "x") || 0),
						(s.startY = ee.getTranslate(i.$imageWrapEl[0], "y") || 0),
						(i.slideWidth = i.$slideEl[0].offsetWidth),
						(i.slideHeight = i.$slideEl[0].offsetHeight),
						i.$imageWrapEl.transition(0),
						t.rtl && ((s.startX = -s.startX), (s.startY = -s.startY)));
					var n = s.width * a.scale,
						o = s.height * a.scale;
					if (!(n < i.slideWidth && o < i.slideHeight)) {
						if (
							((s.minX = Math.min(i.slideWidth / 2 - n / 2, 0)),
							(s.maxX = -s.minX),
							(s.minY = Math.min(i.slideHeight / 2 - o / 2, 0)),
							(s.maxY = -s.minY),
							(s.touchesCurrent.x =
								"touchmove" === e.type ? e.targetTouches[0].pageX : e.pageX),
							(s.touchesCurrent.y =
								"touchmove" === e.type ? e.targetTouches[0].pageY : e.pageY),
							!s.isMoved && !a.isScaling)
						) {
							if (
								t.isHorizontal() &&
								((Math.floor(s.minX) === Math.floor(s.startX) &&
									s.touchesCurrent.x < s.touchesStart.x) ||
									(Math.floor(s.maxX) === Math.floor(s.startX) &&
										s.touchesCurrent.x > s.touchesStart.x))
							)
								return void (s.isTouched = !1);
							if (
								!t.isHorizontal() &&
								((Math.floor(s.minY) === Math.floor(s.startY) &&
									s.touchesCurrent.y < s.touchesStart.y) ||
									(Math.floor(s.maxY) === Math.floor(s.startY) &&
										s.touchesCurrent.y > s.touchesStart.y))
							)
								return void (s.isTouched = !1);
						}
						e.preventDefault(),
							e.stopPropagation(),
							(s.isMoved = !0),
							(s.currentX = s.touchesCurrent.x - s.touchesStart.x + s.startX),
							(s.currentY = s.touchesCurrent.y - s.touchesStart.y + s.startY),
							s.currentX < s.minX &&
								(s.currentX =
									s.minX + 1 - Math.pow(s.minX - s.currentX + 1, 0.8)),
							s.currentX > s.maxX &&
								(s.currentX =
									s.maxX - 1 + Math.pow(s.currentX - s.maxX + 1, 0.8)),
							s.currentY < s.minY &&
								(s.currentY =
									s.minY + 1 - Math.pow(s.minY - s.currentY + 1, 0.8)),
							s.currentY > s.maxY &&
								(s.currentY =
									s.maxY - 1 + Math.pow(s.currentY - s.maxY + 1, 0.8)),
							r.prevPositionX || (r.prevPositionX = s.touchesCurrent.x),
							r.prevPositionY || (r.prevPositionY = s.touchesCurrent.y),
							r.prevTime || (r.prevTime = Date.now()),
							(r.x =
								(s.touchesCurrent.x - r.prevPositionX) /
								(Date.now() - r.prevTime) /
								2),
							(r.y =
								(s.touchesCurrent.y - r.prevPositionY) /
								(Date.now() - r.prevTime) /
								2),
							Math.abs(s.touchesCurrent.x - r.prevPositionX) < 2 && (r.x = 0),
							Math.abs(s.touchesCurrent.y - r.prevPositionY) < 2 && (r.y = 0),
							(r.prevPositionX = s.touchesCurrent.x),
							(r.prevPositionY = s.touchesCurrent.y),
							(r.prevTime = Date.now()),
							i.$imageWrapEl.transform(
								"translate3d(" + s.currentX + "px, " + s.currentY + "px,0)"
							);
					}
				}
			},
			onTouchEnd: function () {
				var e = this.zoom,
					t = e.gesture,
					a = e.image,
					i = e.velocity;
				if (t.$imageEl && 0 !== t.$imageEl.length) {
					if (!a.isTouched || !a.isMoved)
						return (a.isTouched = !1), void (a.isMoved = !1);
					(a.isTouched = !1), (a.isMoved = !1);
					var s = 300,
						r = 300,
						n = i.x * s,
						o = a.currentX + n,
						l = i.y * r,
						d = a.currentY + l;
					0 !== i.x && (s = Math.abs((o - a.currentX) / i.x)),
						0 !== i.y && (r = Math.abs((d - a.currentY) / i.y));
					var p = Math.max(s, r);
					(a.currentX = o), (a.currentY = d);
					var c = a.width * e.scale,
						u = a.height * e.scale;
					(a.minX = Math.min(t.slideWidth / 2 - c / 2, 0)),
						(a.maxX = -a.minX),
						(a.minY = Math.min(t.slideHeight / 2 - u / 2, 0)),
						(a.maxY = -a.minY),
						(a.currentX = Math.max(Math.min(a.currentX, a.maxX), a.minX)),
						(a.currentY = Math.max(Math.min(a.currentY, a.maxY), a.minY)),
						t.$imageWrapEl
							.transition(p)
							.transform(
								"translate3d(" + a.currentX + "px, " + a.currentY + "px,0)"
							);
				}
			},
			onTransitionEnd: function () {
				var e = this.zoom,
					t = e.gesture;
				t.$slideEl &&
					this.previousIndex !== this.activeIndex &&
					(t.$imageEl.transform("translate3d(0,0,0) scale(1)"),
					t.$imageWrapEl.transform("translate3d(0,0,0)"),
					(e.scale = 1),
					(e.currentScale = 1),
					(t.$slideEl = void 0),
					(t.$imageEl = void 0),
					(t.$imageWrapEl = void 0));
			},
			toggle: function (e) {
				var t = this.zoom;
				t.scale && 1 !== t.scale ? t.out() : t.in(e);
			},
			in: function (e) {
				var t,
					a,
					i,
					s,
					r,
					n,
					o,
					l,
					d,
					p,
					c,
					u,
					h,
					v,
					f,
					m,
					g = this,
					b = g.zoom,
					w = g.params.zoom,
					y = b.gesture,
					x = b.image;
				(y.$slideEl ||
					((y.$slideEl = g.clickedSlide
						? L(g.clickedSlide)
						: g.slides.eq(g.activeIndex)),
					(y.$imageEl = y.$slideEl.find("img, svg, canvas")),
					(y.$imageWrapEl = y.$imageEl.parent("." + w.containerClass))),
				y.$imageEl && 0 !== y.$imageEl.length) &&
					(y.$slideEl.addClass("" + w.zoomedSlideClass),
					void 0 === x.touchesStart.x && e
						? ((t =
								"touchend" === e.type ? e.changedTouches[0].pageX : e.pageX),
						  (a = "touchend" === e.type ? e.changedTouches[0].pageY : e.pageY))
						: ((t = x.touchesStart.x), (a = x.touchesStart.y)),
					(b.scale = y.$imageWrapEl.attr("data-swiper-zoom") || w.maxRatio),
					(b.currentScale =
						y.$imageWrapEl.attr("data-swiper-zoom") || w.maxRatio),
					e
						? ((f = y.$slideEl[0].offsetWidth),
						  (m = y.$slideEl[0].offsetHeight),
						  (i = y.$slideEl.offset().left + f / 2 - t),
						  (s = y.$slideEl.offset().top + m / 2 - a),
						  (o = y.$imageEl[0].offsetWidth),
						  (l = y.$imageEl[0].offsetHeight),
						  (d = o * b.scale),
						  (p = l * b.scale),
						  (h = -(c = Math.min(f / 2 - d / 2, 0))),
						  (v = -(u = Math.min(m / 2 - p / 2, 0))),
						  (r = i * b.scale) < c && (r = c),
						  h < r && (r = h),
						  (n = s * b.scale) < u && (n = u),
						  v < n && (n = v))
						: (n = r = 0),
					y.$imageWrapEl
						.transition(300)
						.transform("translate3d(" + r + "px, " + n + "px,0)"),
					y.$imageEl
						.transition(300)
						.transform("translate3d(0,0,0) scale(" + b.scale + ")"));
			},
			out: function () {
				var e = this,
					t = e.zoom,
					a = e.params.zoom,
					i = t.gesture;
				i.$slideEl ||
					((i.$slideEl = e.clickedSlide
						? L(e.clickedSlide)
						: e.slides.eq(e.activeIndex)),
					(i.$imageEl = i.$slideEl.find("img, svg, canvas")),
					(i.$imageWrapEl = i.$imageEl.parent("." + a.containerClass))),
					i.$imageEl &&
						0 !== i.$imageEl.length &&
						((t.scale = 1),
						(t.currentScale = 1),
						i.$imageWrapEl.transition(300).transform("translate3d(0,0,0)"),
						i.$imageEl.transition(300).transform("translate3d(0,0,0) scale(1)"),
						i.$slideEl.removeClass("" + a.zoomedSlideClass),
						(i.$slideEl = void 0));
			},
			enable: function () {
				var e = this,
					t = e.zoom;
				if (!t.enabled) {
					t.enabled = !0;
					var a = !(
						"touchstart" !== e.touchEvents.start ||
						!te.passiveListener ||
						!e.params.passiveListeners
					) && { passive: !0, capture: !1 };
					te.gestures
						? (e.$wrapperEl.on(
								"gesturestart",
								".swiper-slide",
								t.onGestureStart,
								a
						  ),
						  e.$wrapperEl.on(
								"gesturechange",
								".swiper-slide",
								t.onGestureChange,
								a
						  ),
						  e.$wrapperEl.on("gestureend", ".swiper-slide", t.onGestureEnd, a))
						: "touchstart" === e.touchEvents.start &&
						  (e.$wrapperEl.on(
								e.touchEvents.start,
								".swiper-slide",
								t.onGestureStart,
								a
						  ),
						  e.$wrapperEl.on(
								e.touchEvents.move,
								".swiper-slide",
								t.onGestureChange,
								a
						  ),
						  e.$wrapperEl.on(
								e.touchEvents.end,
								".swiper-slide",
								t.onGestureEnd,
								a
						  )),
						e.$wrapperEl.on(
							e.touchEvents.move,
							"." + e.params.zoom.containerClass,
							t.onTouchMove
						);
				}
			},
			disable: function () {
				var e = this,
					t = e.zoom;
				if (t.enabled) {
					e.zoom.enabled = !1;
					var a = !(
						"touchstart" !== e.touchEvents.start ||
						!te.passiveListener ||
						!e.params.passiveListeners
					) && { passive: !0, capture: !1 };
					te.gestures
						? (e.$wrapperEl.off(
								"gesturestart",
								".swiper-slide",
								t.onGestureStart,
								a
						  ),
						  e.$wrapperEl.off(
								"gesturechange",
								".swiper-slide",
								t.onGestureChange,
								a
						  ),
						  e.$wrapperEl.off(
								"gestureend",
								".swiper-slide",
								t.onGestureEnd,
								a
						  ))
						: "touchstart" === e.touchEvents.start &&
						  (e.$wrapperEl.off(
								e.touchEvents.start,
								".swiper-slide",
								t.onGestureStart,
								a
						  ),
						  e.$wrapperEl.off(
								e.touchEvents.move,
								".swiper-slide",
								t.onGestureChange,
								a
						  ),
						  e.$wrapperEl.off(
								e.touchEvents.end,
								".swiper-slide",
								t.onGestureEnd,
								a
						  )),
						e.$wrapperEl.off(
							e.touchEvents.move,
							"." + e.params.zoom.containerClass,
							t.onTouchMove
						);
				}
			},
		},
		Y = {
			loadInSlide: function (e, l) {
				void 0 === l && (l = !0);
				var d = this,
					p = d.params.lazy;
				if (void 0 !== e && 0 !== d.slides.length) {
					var c =
							d.virtual && d.params.virtual.enabled
								? d.$wrapperEl.children(
										"." +
											d.params.slideClass +
											'[data-swiper-slide-index="' +
											e +
											'"]'
								  )
								: d.slides.eq(e),
						t = c.find(
							"." +
								p.elementClass +
								":not(." +
								p.loadedClass +
								"):not(." +
								p.loadingClass +
								")"
						);
					!c.hasClass(p.elementClass) ||
						c.hasClass(p.loadedClass) ||
						c.hasClass(p.loadingClass) ||
						(t = t.add(c[0])),
						0 !== t.length &&
							t.each(function (e, t) {
								var i = L(t);
								i.addClass(p.loadingClass);
								var s = i.attr("data-background"),
									r = i.attr("data-src"),
									n = i.attr("data-srcset"),
									o = i.attr("data-sizes");
								d.loadImage(i[0], r || s, n, o, !1, function () {
									if (null != d && d && (!d || d.params) && !d.destroyed) {
										if (
											(s
												? (i.css("background-image", 'url("' + s + '")'),
												  i.removeAttr("data-background"))
												: (n &&
														(i.attr("srcset", n), i.removeAttr("data-srcset")),
												  o && (i.attr("sizes", o), i.removeAttr("data-sizes")),
												  r && (i.attr("src", r), i.removeAttr("data-src"))),
											i.addClass(p.loadedClass).removeClass(p.loadingClass),
											c.find("." + p.preloaderClass).remove(),
											d.params.loop && l)
										) {
											var e = c.attr("data-swiper-slide-index");
											if (c.hasClass(d.params.slideDuplicateClass)) {
												var t = d.$wrapperEl.children(
													'[data-swiper-slide-index="' +
														e +
														'"]:not(.' +
														d.params.slideDuplicateClass +
														")"
												);
												d.lazy.loadInSlide(t.index(), !1);
											} else {
												var a = d.$wrapperEl.children(
													"." +
														d.params.slideDuplicateClass +
														'[data-swiper-slide-index="' +
														e +
														'"]'
												);
												d.lazy.loadInSlide(a.index(), !1);
											}
										}
										d.emit("lazyImageReady", c[0], i[0]);
									}
								}),
									d.emit("lazyImageLoad", c[0], i[0]);
							});
				}
			},
			load: function () {
				var i = this,
					t = i.$wrapperEl,
					a = i.params,
					s = i.slides,
					e = i.activeIndex,
					r = i.virtual && a.virtual.enabled,
					n = a.lazy,
					o = a.slidesPerView;
				function l(e) {
					if (r) {
						if (
							t.children(
								"." + a.slideClass + '[data-swiper-slide-index="' + e + '"]'
							).length
						)
							return !0;
					} else if (s[e]) return !0;
					return !1;
				}
				function d(e) {
					return r ? L(e).attr("data-swiper-slide-index") : L(e).index();
				}
				if (
					("auto" === o && (o = 0),
					i.lazy.initialImageLoaded || (i.lazy.initialImageLoaded = !0),
					i.params.watchSlidesVisibility)
				)
					t.children("." + a.slideVisibleClass).each(function (e, t) {
						var a = r ? L(t).attr("data-swiper-slide-index") : L(t).index();
						i.lazy.loadInSlide(a);
					});
				else if (1 < o)
					for (var p = e; p < e + o; p += 1) l(p) && i.lazy.loadInSlide(p);
				else i.lazy.loadInSlide(e);
				if (n.loadPrevNext)
					if (1 < o || (n.loadPrevNextAmount && 1 < n.loadPrevNextAmount)) {
						for (
							var c = n.loadPrevNextAmount,
								u = o,
								h = Math.min(e + u + Math.max(c, u), s.length),
								v = Math.max(e - Math.max(u, c), 0),
								f = e + o;
							f < h;
							f += 1
						)
							l(f) && i.lazy.loadInSlide(f);
						for (var m = v; m < e; m += 1) l(m) && i.lazy.loadInSlide(m);
					} else {
						var g = t.children("." + a.slideNextClass);
						0 < g.length && i.lazy.loadInSlide(d(g));
						var b = t.children("." + a.slidePrevClass);
						0 < b.length && i.lazy.loadInSlide(d(b));
					}
			},
		},
		V = {
			LinearSpline: function (e, t) {
				var a,
					i,
					s,
					r,
					n,
					o = function (e, t) {
						for (i = -1, a = e.length; 1 < a - i; )
							e[(s = (a + i) >> 1)] <= t ? (i = s) : (a = s);
						return a;
					};
				return (
					(this.x = e),
					(this.y = t),
					(this.lastIndex = e.length - 1),
					(this.interpolate = function (e) {
						return e
							? ((n = o(this.x, e)),
							  (r = n - 1),
							  ((e - this.x[r]) * (this.y[n] - this.y[r])) /
									(this.x[n] - this.x[r]) +
									this.y[r])
							: 0;
					}),
					this
				);
			},
			getInterpolateFunction: function (e) {
				var t = this;
				t.controller.spline ||
					(t.controller.spline = t.params.loop
						? new V.LinearSpline(t.slidesGrid, e.slidesGrid)
						: new V.LinearSpline(t.snapGrid, e.snapGrid));
			},
			setTranslate: function (e, t) {
				var a,
					i,
					s = this,
					r = s.controller.control;
				function n(e) {
					var t = s.rtlTranslate ? -s.translate : s.translate;
					"slide" === s.params.controller.by &&
						(s.controller.getInterpolateFunction(e),
						(i = -s.controller.spline.interpolate(-t))),
						(i && "container" !== s.params.controller.by) ||
							((a =
								(e.maxTranslate() - e.minTranslate()) /
								(s.maxTranslate() - s.minTranslate())),
							(i = (t - s.minTranslate()) * a + e.minTranslate())),
						s.params.controller.inverse && (i = e.maxTranslate() - i),
						e.updateProgress(i),
						e.setTranslate(i, s),
						e.updateActiveIndex(),
						e.updateSlidesClasses();
				}
				if (Array.isArray(r))
					for (var o = 0; o < r.length; o += 1)
						r[o] !== t && r[o] instanceof T && n(r[o]);
				else r instanceof T && t !== r && n(r);
			},
			setTransition: function (t, e) {
				var a,
					i = this,
					s = i.controller.control;
				function r(e) {
					e.setTransition(t, i),
						0 !== t &&
							(e.transitionStart(),
							e.params.autoHeight &&
								ee.nextTick(function () {
									e.updateAutoHeight();
								}),
							e.$wrapperEl.transitionEnd(function () {
								s &&
									(e.params.loop &&
										"slide" === i.params.controller.by &&
										e.loopFix(),
									e.transitionEnd());
							}));
				}
				if (Array.isArray(s))
					for (a = 0; a < s.length; a += 1)
						s[a] !== e && s[a] instanceof T && r(s[a]);
				else s instanceof T && e !== s && r(s);
			},
		},
		F = {
			makeElFocusable: function (e) {
				return e.attr("tabIndex", "0"), e;
			},
			addElRole: function (e, t) {
				return e.attr("role", t), e;
			},
			addElLabel: function (e, t) {
				return e.attr("aria-label", t), e;
			},
			disableEl: function (e) {
				return e.attr("aria-disabled", !0), e;
			},
			enableEl: function (e) {
				return e.attr("aria-disabled", !1), e;
			},
			onEnterKey: function (e) {
				var t = this,
					a = t.params.a11y;
				if (13 === e.keyCode) {
					var i = L(e.target);
					t.navigation &&
						t.navigation.$nextEl &&
						i.is(t.navigation.$nextEl) &&
						((t.isEnd && !t.params.loop) || t.slideNext(),
						t.isEnd
							? t.a11y.notify(a.lastSlideMessage)
							: t.a11y.notify(a.nextSlideMessage)),
						t.navigation &&
							t.navigation.$prevEl &&
							i.is(t.navigation.$prevEl) &&
							((t.isBeginning && !t.params.loop) || t.slidePrev(),
							t.isBeginning
								? t.a11y.notify(a.firstSlideMessage)
								: t.a11y.notify(a.prevSlideMessage)),
						t.pagination &&
							i.is("." + t.params.pagination.bulletClass) &&
							i[0].click();
				}
			},
			notify: function (e) {
				var t = this.a11y.liveRegion;
				0 !== t.length && (t.html(""), t.html(e));
			},
			updateNavigation: function () {
				var e = this;
				if (!e.params.loop) {
					var t = e.navigation,
						a = t.$nextEl,
						i = t.$prevEl;
					i &&
						0 < i.length &&
						(e.isBeginning ? e.a11y.disableEl(i) : e.a11y.enableEl(i)),
						a &&
							0 < a.length &&
							(e.isEnd ? e.a11y.disableEl(a) : e.a11y.enableEl(a));
				}
			},
			updatePagination: function () {
				var i = this,
					s = i.params.a11y;
				i.pagination &&
					i.params.pagination.clickable &&
					i.pagination.bullets &&
					i.pagination.bullets.length &&
					i.pagination.bullets.each(function (e, t) {
						var a = L(t);
						i.a11y.makeElFocusable(a),
							i.a11y.addElRole(a, "button"),
							i.a11y.addElLabel(
								a,
								s.paginationBulletMessage.replace(/{{index}}/, a.index() + 1)
							);
					});
			},
			init: function () {
				var e = this;
				e.$el.append(e.a11y.liveRegion);
				var t,
					a,
					i = e.params.a11y;
				e.navigation && e.navigation.$nextEl && (t = e.navigation.$nextEl),
					e.navigation && e.navigation.$prevEl && (a = e.navigation.$prevEl),
					t &&
						(e.a11y.makeElFocusable(t),
						e.a11y.addElRole(t, "button"),
						e.a11y.addElLabel(t, i.nextSlideMessage),
						t.on("keydown", e.a11y.onEnterKey)),
					a &&
						(e.a11y.makeElFocusable(a),
						e.a11y.addElRole(a, "button"),
						e.a11y.addElLabel(a, i.prevSlideMessage),
						a.on("keydown", e.a11y.onEnterKey)),
					e.pagination &&
						e.params.pagination.clickable &&
						e.pagination.bullets &&
						e.pagination.bullets.length &&
						e.pagination.$el.on(
							"keydown",
							"." + e.params.pagination.bulletClass,
							e.a11y.onEnterKey
						);
			},
			destroy: function () {
				var e,
					t,
					a = this;
				a.a11y.liveRegion &&
					0 < a.a11y.liveRegion.length &&
					a.a11y.liveRegion.remove(),
					a.navigation && a.navigation.$nextEl && (e = a.navigation.$nextEl),
					a.navigation && a.navigation.$prevEl && (t = a.navigation.$prevEl),
					e && e.off("keydown", a.a11y.onEnterKey),
					t && t.off("keydown", a.a11y.onEnterKey),
					a.pagination &&
						a.params.pagination.clickable &&
						a.pagination.bullets &&
						a.pagination.bullets.length &&
						a.pagination.$el.off(
							"keydown",
							"." + a.params.pagination.bulletClass,
							a.a11y.onEnterKey
						);
			},
		},
		R = {
			init: function () {
				var e = this;
				if (e.params.history) {
					if (!J.history || !J.history.pushState)
						return (
							(e.params.history.enabled = !1),
							void (e.params.hashNavigation.enabled = !0)
						);
					var t = e.history;
					(t.initialized = !0),
						(t.paths = R.getPathValues()),
						(t.paths.key || t.paths.value) &&
							(t.scrollToSlide(0, t.paths.value, e.params.runCallbacksOnInit),
							e.params.history.replaceState ||
								J.addEventListener("popstate", e.history.setHistoryPopState));
				}
			},
			destroy: function () {
				this.params.history.replaceState ||
					J.removeEventListener("popstate", this.history.setHistoryPopState);
			},
			setHistoryPopState: function () {
				(this.history.paths = R.getPathValues()),
					this.history.scrollToSlide(
						this.params.speed,
						this.history.paths.value,
						!1
					);
			},
			getPathValues: function () {
				var e = J.location.pathname
						.slice(1)
						.split("/")
						.filter(function (e) {
							return "" !== e;
						}),
					t = e.length;
				return { key: e[t - 2], value: e[t - 1] };
			},
			setHistory: function (e, t) {
				if (this.history.initialized && this.params.history.enabled) {
					var a = this.slides.eq(t),
						i = R.slugify(a.attr("data-history"));
					J.location.pathname.includes(e) || (i = e + "/" + i);
					var s = J.history.state;
					(s && s.value === i) ||
						(this.params.history.replaceState
							? J.history.replaceState({ value: i }, null, i)
							: J.history.pushState({ value: i }, null, i));
				}
			},
			slugify: function (e) {
				return e
					.toString()
					.replace(/\s+/g, "-")
					.replace(/[^\w-]+/g, "")
					.replace(/--+/g, "-")
					.replace(/^-+/, "")
					.replace(/-+$/, "");
			},
			scrollToSlide: function (e, t, a) {
				var i = this;
				if (t)
					for (var s = 0, r = i.slides.length; s < r; s += 1) {
						var n = i.slides.eq(s);
						if (
							R.slugify(n.attr("data-history")) === t &&
							!n.hasClass(i.params.slideDuplicateClass)
						) {
							var o = n.index();
							i.slideTo(o, e, a);
						}
					}
				else i.slideTo(0, e, a);
			},
		},
		q = {
			onHashCange: function () {
				var e = this,
					t = f.location.hash.replace("#", "");
				if (t !== e.slides.eq(e.activeIndex).attr("data-hash")) {
					var a = e.$wrapperEl
						.children("." + e.params.slideClass + '[data-hash="' + t + '"]')
						.index();
					if (void 0 === a) return;
					e.slideTo(a);
				}
			},
			setHash: function () {
				var e = this;
				if (e.hashNavigation.initialized && e.params.hashNavigation.enabled)
					if (
						e.params.hashNavigation.replaceState &&
						J.history &&
						J.history.replaceState
					)
						J.history.replaceState(
							null,
							null,
							"#" + e.slides.eq(e.activeIndex).attr("data-hash") || ""
						);
					else {
						var t = e.slides.eq(e.activeIndex),
							a = t.attr("data-hash") || t.attr("data-history");
						f.location.hash = a || "";
					}
			},
			init: function () {
				var e = this;
				if (
					!(
						!e.params.hashNavigation.enabled ||
						(e.params.history && e.params.history.enabled)
					)
				) {
					e.hashNavigation.initialized = !0;
					var t = f.location.hash.replace("#", "");
					if (t)
						for (var a = 0, i = e.slides.length; a < i; a += 1) {
							var s = e.slides.eq(a);
							if (
								(s.attr("data-hash") || s.attr("data-history")) === t &&
								!s.hasClass(e.params.slideDuplicateClass)
							) {
								var r = s.index();
								e.slideTo(r, 0, e.params.runCallbacksOnInit, !0);
							}
						}
					e.params.hashNavigation.watchState &&
						L(J).on("hashchange", e.hashNavigation.onHashCange);
				}
			},
			destroy: function () {
				this.params.hashNavigation.watchState &&
					L(J).off("hashchange", this.hashNavigation.onHashCange);
			},
		},
		W = {
			run: function () {
				var e = this,
					t = e.slides.eq(e.activeIndex),
					a = e.params.autoplay.delay;
				t.attr("data-swiper-autoplay") &&
					(a = t.attr("data-swiper-autoplay") || e.params.autoplay.delay),
					(e.autoplay.timeout = ee.nextTick(function () {
						e.params.autoplay.reverseDirection
							? e.params.loop
								? (e.loopFix(),
								  e.slidePrev(e.params.speed, !0, !0),
								  e.emit("autoplay"))
								: e.isBeginning
								? e.params.autoplay.stopOnLastSlide
									? e.autoplay.stop()
									: (e.slideTo(e.slides.length - 1, e.params.speed, !0, !0),
									  e.emit("autoplay"))
								: (e.slidePrev(e.params.speed, !0, !0), e.emit("autoplay"))
							: e.params.loop
							? (e.loopFix(),
							  e.slideNext(e.params.speed, !0, !0),
							  e.emit("autoplay"))
							: e.isEnd
							? e.params.autoplay.stopOnLastSlide
								? e.autoplay.stop()
								: (e.slideTo(0, e.params.speed, !0, !0), e.emit("autoplay"))
							: (e.slideNext(e.params.speed, !0, !0), e.emit("autoplay"));
					}, a));
			},
			start: function () {
				var e = this;
				return (
					void 0 === e.autoplay.timeout &&
					!e.autoplay.running &&
					((e.autoplay.running = !0),
					e.emit("autoplayStart"),
					e.autoplay.run(),
					!0)
				);
			},
			stop: function () {
				var e = this;
				return (
					!!e.autoplay.running &&
					void 0 !== e.autoplay.timeout &&
					(e.autoplay.timeout &&
						(clearTimeout(e.autoplay.timeout), (e.autoplay.timeout = void 0)),
					(e.autoplay.running = !1),
					e.emit("autoplayStop"),
					!0)
				);
			},
			pause: function (e) {
				var t = this;
				t.autoplay.running &&
					(t.autoplay.paused ||
						(t.autoplay.timeout && clearTimeout(t.autoplay.timeout),
						(t.autoplay.paused = !0),
						0 !== e && t.params.autoplay.waitForTransition
							? (t.$wrapperEl[0].addEventListener(
									"transitionend",
									t.autoplay.onTransitionEnd
							  ),
							  t.$wrapperEl[0].addEventListener(
									"webkitTransitionEnd",
									t.autoplay.onTransitionEnd
							  ))
							: ((t.autoplay.paused = !1), t.autoplay.run())));
			},
		},
		j = {
			setTranslate: function () {
				for (var e = this, t = e.slides, a = 0; a < t.length; a += 1) {
					var i = e.slides.eq(a),
						s = -i[0].swiperSlideOffset;
					e.params.virtualTranslate || (s -= e.translate);
					var r = 0;
					e.isHorizontal() || ((r = s), (s = 0));
					var n = e.params.fadeEffect.crossFade
						? Math.max(1 - Math.abs(i[0].progress), 0)
						: 1 + Math.min(Math.max(i[0].progress, -1), 0);
					i.css({ opacity: n }).transform(
						"translate3d(" + s + "px, " + r + "px, 0px)"
					);
				}
			},
			setTransition: function (e) {
				var a = this,
					t = a.slides,
					i = a.$wrapperEl;
				if ((t.transition(e), a.params.virtualTranslate && 0 !== e)) {
					var s = !1;
					t.transitionEnd(function () {
						if (!s && a && !a.destroyed) {
							(s = !0), (a.animating = !1);
							for (
								var e = ["webkitTransitionEnd", "transitionend"], t = 0;
								t < e.length;
								t += 1
							)
								i.trigger(e[t]);
						}
					});
				}
			},
		},
		U = {
			setTranslate: function () {
				var e,
					t = this,
					a = t.$el,
					i = t.$wrapperEl,
					s = t.slides,
					r = t.width,
					n = t.height,
					o = t.rtlTranslate,
					l = t.size,
					d = t.params.cubeEffect,
					p = t.isHorizontal(),
					c = t.virtual && t.params.virtual.enabled,
					u = 0;
				d.shadow &&
					(p
						? (0 === (e = i.find(".swiper-cube-shadow")).length &&
								((e = L('<div class="swiper-cube-shadow"></div>')),
								i.append(e)),
						  e.css({ height: r + "px" }))
						: 0 === (e = a.find(".swiper-cube-shadow")).length &&
						  ((e = L('<div class="swiper-cube-shadow"></div>')), a.append(e)));
				for (var h = 0; h < s.length; h += 1) {
					var v = s.eq(h),
						f = h;
					c && (f = parseInt(v.attr("data-swiper-slide-index"), 10));
					var m = 90 * f,
						g = Math.floor(m / 360);
					o && ((m = -m), (g = Math.floor(-m / 360)));
					var b = Math.max(Math.min(v[0].progress, 1), -1),
						w = 0,
						y = 0,
						x = 0;
					f % 4 == 0
						? ((w = 4 * -g * l), (x = 0))
						: (f - 1) % 4 == 0
						? ((w = 0), (x = 4 * -g * l))
						: (f - 2) % 4 == 0
						? ((w = l + 4 * g * l), (x = l))
						: (f - 3) % 4 == 0 && ((w = -l), (x = 3 * l + 4 * l * g)),
						o && (w = -w),
						p || ((y = w), (w = 0));
					var T =
						"rotateX(" +
						(p ? 0 : -m) +
						"deg) rotateY(" +
						(p ? m : 0) +
						"deg) translate3d(" +
						w +
						"px, " +
						y +
						"px, " +
						x +
						"px)";
					if (
						(b <= 1 &&
							-1 < b &&
							((u = 90 * f + 90 * b), o && (u = 90 * -f - 90 * b)),
						v.transform(T),
						d.slideShadows)
					) {
						var E = p
								? v.find(".swiper-slide-shadow-left")
								: v.find(".swiper-slide-shadow-top"),
							S = p
								? v.find(".swiper-slide-shadow-right")
								: v.find(".swiper-slide-shadow-bottom");
						0 === E.length &&
							((E = L(
								'<div class="swiper-slide-shadow-' +
									(p ? "left" : "top") +
									'"></div>'
							)),
							v.append(E)),
							0 === S.length &&
								((S = L(
									'<div class="swiper-slide-shadow-' +
										(p ? "right" : "bottom") +
										'"></div>'
								)),
								v.append(S)),
							E.length && (E[0].style.opacity = Math.max(-b, 0)),
							S.length && (S[0].style.opacity = Math.max(b, 0));
					}
				}
				if (
					(i.css({
						"-webkit-transform-origin": "50% 50% -" + l / 2 + "px",
						"-moz-transform-origin": "50% 50% -" + l / 2 + "px",
						"-ms-transform-origin": "50% 50% -" + l / 2 + "px",
						"transform-origin": "50% 50% -" + l / 2 + "px",
					}),
					d.shadow)
				)
					if (p)
						e.transform(
							"translate3d(0px, " +
								(r / 2 + d.shadowOffset) +
								"px, " +
								-r / 2 +
								"px) rotateX(90deg) rotateZ(0deg) scale(" +
								d.shadowScale +
								")"
						);
					else {
						var C = Math.abs(u) - 90 * Math.floor(Math.abs(u) / 90),
							M =
								1.5 -
								(Math.sin((2 * C * Math.PI) / 360) / 2 +
									Math.cos((2 * C * Math.PI) / 360) / 2),
							z = d.shadowScale,
							P = d.shadowScale / M,
							k = d.shadowOffset;
						e.transform(
							"scale3d(" +
								z +
								", 1, " +
								P +
								") translate3d(0px, " +
								(n / 2 + k) +
								"px, " +
								-n / 2 / P +
								"px) rotateX(-90deg)"
						);
					}
				var $ = I.isSafari || I.isUiWebView ? -l / 2 : 0;
				i.transform(
					"translate3d(0px,0," +
						$ +
						"px) rotateX(" +
						(t.isHorizontal() ? 0 : u) +
						"deg) rotateY(" +
						(t.isHorizontal() ? -u : 0) +
						"deg)"
				);
			},
			setTransition: function (e) {
				var t = this.$el;
				this.slides
					.transition(e)
					.find(
						".swiper-slide-shadow-top, .swiper-slide-shadow-right, .swiper-slide-shadow-bottom, .swiper-slide-shadow-left"
					)
					.transition(e),
					this.params.cubeEffect.shadow &&
						!this.isHorizontal() &&
						t.find(".swiper-cube-shadow").transition(e);
			},
		},
		K = {
			setTranslate: function () {
				for (
					var e = this, t = e.slides, a = e.rtlTranslate, i = 0;
					i < t.length;
					i += 1
				) {
					var s = t.eq(i),
						r = s[0].progress;
					e.params.flipEffect.limitRotation &&
						(r = Math.max(Math.min(s[0].progress, 1), -1));
					var n = -180 * r,
						o = 0,
						l = -s[0].swiperSlideOffset,
						d = 0;
					if (
						(e.isHorizontal()
							? a && (n = -n)
							: ((d = l), (o = -n), (n = l = 0)),
						(s[0].style.zIndex = -Math.abs(Math.round(r)) + t.length),
						e.params.flipEffect.slideShadows)
					) {
						var p = e.isHorizontal()
								? s.find(".swiper-slide-shadow-left")
								: s.find(".swiper-slide-shadow-top"),
							c = e.isHorizontal()
								? s.find(".swiper-slide-shadow-right")
								: s.find(".swiper-slide-shadow-bottom");
						0 === p.length &&
							((p = L(
								'<div class="swiper-slide-shadow-' +
									(e.isHorizontal() ? "left" : "top") +
									'"></div>'
							)),
							s.append(p)),
							0 === c.length &&
								((c = L(
									'<div class="swiper-slide-shadow-' +
										(e.isHorizontal() ? "right" : "bottom") +
										'"></div>'
								)),
								s.append(c)),
							p.length && (p[0].style.opacity = Math.max(-r, 0)),
							c.length && (c[0].style.opacity = Math.max(r, 0));
					}
					s.transform(
						"translate3d(" +
							l +
							"px, " +
							d +
							"px, 0px) rotateX(" +
							o +
							"deg) rotateY(" +
							n +
							"deg)"
					);
				}
			},
			setTransition: function (e) {
				var a = this,
					t = a.slides,
					i = a.activeIndex,
					s = a.$wrapperEl;
				if (
					(t
						.transition(e)
						.find(
							".swiper-slide-shadow-top, .swiper-slide-shadow-right, .swiper-slide-shadow-bottom, .swiper-slide-shadow-left"
						)
						.transition(e),
					a.params.virtualTranslate && 0 !== e)
				) {
					var r = !1;
					t.eq(i).transitionEnd(function () {
						if (!r && a && !a.destroyed) {
							(r = !0), (a.animating = !1);
							for (
								var e = ["webkitTransitionEnd", "transitionend"], t = 0;
								t < e.length;
								t += 1
							)
								s.trigger(e[t]);
						}
					});
				}
			},
		},
		_ = {
			setTranslate: function () {
				for (
					var e = this,
						t = e.width,
						a = e.height,
						i = e.slides,
						s = e.$wrapperEl,
						r = e.slidesSizesGrid,
						n = e.params.coverflowEffect,
						o = e.isHorizontal(),
						l = e.translate,
						d = o ? t / 2 - l : a / 2 - l,
						p = o ? n.rotate : -n.rotate,
						c = n.depth,
						u = 0,
						h = i.length;
					u < h;
					u += 1
				) {
					var v = i.eq(u),
						f = r[u],
						m = ((d - v[0].swiperSlideOffset - f / 2) / f) * n.modifier,
						g = o ? p * m : 0,
						b = o ? 0 : p * m,
						w = -c * Math.abs(m),
						y = o ? 0 : n.stretch * m,
						x = o ? n.stretch * m : 0;
					Math.abs(x) < 0.001 && (x = 0),
						Math.abs(y) < 0.001 && (y = 0),
						Math.abs(w) < 0.001 && (w = 0),
						Math.abs(g) < 0.001 && (g = 0),
						Math.abs(b) < 0.001 && (b = 0);
					var T =
						"translate3d(" +
						x +
						"px," +
						y +
						"px," +
						w +
						"px)  rotateX(" +
						b +
						"deg) rotateY(" +
						g +
						"deg)";
					if (
						(v.transform(T),
						(v[0].style.zIndex = 1 - Math.abs(Math.round(m))),
						n.slideShadows)
					) {
						var E = o
								? v.find(".swiper-slide-shadow-left")
								: v.find(".swiper-slide-shadow-top"),
							S = o
								? v.find(".swiper-slide-shadow-right")
								: v.find(".swiper-slide-shadow-bottom");
						0 === E.length &&
							((E = L(
								'<div class="swiper-slide-shadow-' +
									(o ? "left" : "top") +
									'"></div>'
							)),
							v.append(E)),
							0 === S.length &&
								((S = L(
									'<div class="swiper-slide-shadow-' +
										(o ? "right" : "bottom") +
										'"></div>'
								)),
								v.append(S)),
							E.length && (E[0].style.opacity = 0 < m ? m : 0),
							S.length && (S[0].style.opacity = 0 < -m ? -m : 0);
					}
				}
				(te.pointerEvents || te.prefixedPointerEvents) &&
					(s[0].style.perspectiveOrigin = d + "px 50%");
			},
			setTransition: function (e) {
				this.slides
					.transition(e)
					.find(
						".swiper-slide-shadow-top, .swiper-slide-shadow-right, .swiper-slide-shadow-bottom, .swiper-slide-shadow-left"
					)
					.transition(e);
			},
		},
		Z = {
			init: function () {
				var e = this,
					t = e.params.thumbs,
					a = e.constructor;
				t.swiper instanceof a
					? ((e.thumbs.swiper = t.swiper),
					  ee.extend(e.thumbs.swiper.originalParams, {
							watchSlidesProgress: !0,
							slideToClickedSlide: !1,
					  }),
					  ee.extend(e.thumbs.swiper.params, {
							watchSlidesProgress: !0,
							slideToClickedSlide: !1,
					  }))
					: ee.isObject(t.swiper) &&
					  ((e.thumbs.swiper = new a(
							ee.extend({}, t.swiper, {
								watchSlidesVisibility: !0,
								watchSlidesProgress: !0,
								slideToClickedSlide: !1,
							})
					  )),
					  (e.thumbs.swiperCreated = !0)),
					e.thumbs.swiper.$el.addClass(e.params.thumbs.thumbsContainerClass),
					e.thumbs.swiper.on("tap", e.thumbs.onThumbClick);
			},
			onThumbClick: function () {
				var e = this,
					t = e.thumbs.swiper;
				if (t) {
					var a = t.clickedIndex,
						i = t.clickedSlide;
					if (
						!(
							(i && L(i).hasClass(e.params.thumbs.slideThumbActiveClass)) ||
							null == a
						)
					) {
						var s;
						if (
							((s = t.params.loop
								? parseInt(
										L(t.clickedSlide).attr("data-swiper-slide-index"),
										10
								  )
								: a),
							e.params.loop)
						) {
							var r = e.activeIndex;
							e.slides.eq(r).hasClass(e.params.slideDuplicateClass) &&
								(e.loopFix(),
								(e._clientLeft = e.$wrapperEl[0].clientLeft),
								(r = e.activeIndex));
							var n = e.slides
									.eq(r)
									.prevAll('[data-swiper-slide-index="' + s + '"]')
									.eq(0)
									.index(),
								o = e.slides
									.eq(r)
									.nextAll('[data-swiper-slide-index="' + s + '"]')
									.eq(0)
									.index();
							s = void 0 === n ? o : void 0 === o ? n : o - r < r - n ? o : n;
						}
						e.slideTo(s);
					}
				}
			},
			update: function (e) {
				var t = this,
					a = t.thumbs.swiper;
				if (a) {
					var i =
						"auto" === a.params.slidesPerView
							? a.slidesPerViewDynamic()
							: a.params.slidesPerView;
					if (t.realIndex !== a.realIndex) {
						var s,
							r = a.activeIndex;
						if (a.params.loop) {
							a.slides.eq(r).hasClass(a.params.slideDuplicateClass) &&
								(a.loopFix(),
								(a._clientLeft = a.$wrapperEl[0].clientLeft),
								(r = a.activeIndex));
							var n = a.slides
									.eq(r)
									.prevAll('[data-swiper-slide-index="' + t.realIndex + '"]')
									.eq(0)
									.index(),
								o = a.slides
									.eq(r)
									.nextAll('[data-swiper-slide-index="' + t.realIndex + '"]')
									.eq(0)
									.index();
							s =
								void 0 === n
									? o
									: void 0 === o
									? n
									: o - r == r - n
									? r
									: o - r < r - n
									? o
									: n;
						} else s = t.realIndex;
						a.visibleSlidesIndexes.indexOf(s) < 0 &&
							(a.params.centeredSlides
								? (s =
										r < s
											? s - Math.floor(i / 2) + 1
											: s + Math.floor(i / 2) - 1)
								: r < s && (s = s - i + 1),
							a.slideTo(s, e ? 0 : void 0));
					}
					var l = 1,
						d = t.params.thumbs.slideThumbActiveClass;
					if (
						(1 < t.params.slidesPerView &&
							!t.params.centeredSlides &&
							(l = t.params.slidesPerView),
						a.slides.removeClass(d),
						a.params.loop)
					)
						for (var p = 0; p < l; p += 1)
							a.$wrapperEl
								.children(
									'[data-swiper-slide-index="' + (t.realIndex + p) + '"]'
								)
								.addClass(d);
					else
						for (var c = 0; c < l; c += 1)
							a.slides.eq(t.realIndex + c).addClass(d);
				}
			},
		},
		Q = [
			E,
			S,
			C,
			M,
			P,
			$,
			O,
			{
				name: "mousewheel",
				params: {
					mousewheel: {
						enabled: !1,
						releaseOnEdges: !1,
						invert: !1,
						forceToAxis: !1,
						sensitivity: 1,
						eventsTarged: "container",
					},
				},
				create: function () {
					var e = this;
					ee.extend(e, {
						mousewheel: {
							enabled: !1,
							enable: A.enable.bind(e),
							disable: A.disable.bind(e),
							handle: A.handle.bind(e),
							handleMouseEnter: A.handleMouseEnter.bind(e),
							handleMouseLeave: A.handleMouseLeave.bind(e),
							lastScrollTime: ee.now(),
						},
					});
				},
				on: {
					init: function () {
						this.params.mousewheel.enabled && this.mousewheel.enable();
					},
					destroy: function () {
						this.mousewheel.enabled && this.mousewheel.disable();
					},
				},
			},
			{
				name: "navigation",
				params: {
					navigation: {
						nextEl: null,
						prevEl: null,
						hideOnClick: !1,
						disabledClass: "swiper-button-disabled",
						hiddenClass: "swiper-button-hidden",
						lockClass: "swiper-button-lock",
					},
				},
				create: function () {
					var e = this;
					ee.extend(e, {
						navigation: {
							init: H.init.bind(e),
							update: H.update.bind(e),
							destroy: H.destroy.bind(e),
							onNextClick: H.onNextClick.bind(e),
							onPrevClick: H.onPrevClick.bind(e),
						},
					});
				},
				on: {
					init: function () {
						this.navigation.init(), this.navigation.update();
					},
					toEdge: function () {
						this.navigation.update();
					},
					fromEdge: function () {
						this.navigation.update();
					},
					destroy: function () {
						this.navigation.destroy();
					},
					click: function (e) {
						var t,
							a = this,
							i = a.navigation,
							s = i.$nextEl,
							r = i.$prevEl;
						!a.params.navigation.hideOnClick ||
							L(e.target).is(r) ||
							L(e.target).is(s) ||
							(s
								? (t = s.hasClass(a.params.navigation.hiddenClass))
								: r && (t = r.hasClass(a.params.navigation.hiddenClass)),
							!0 === t
								? a.emit("navigationShow", a)
								: a.emit("navigationHide", a),
							s && s.toggleClass(a.params.navigation.hiddenClass),
							r && r.toggleClass(a.params.navigation.hiddenClass));
					},
				},
			},
			{
				name: "pagination",
				params: {
					pagination: {
						el: null,
						bulletElement: "span",
						clickable: !1,
						hideOnClick: !1,
						renderBullet: null,
						renderProgressbar: null,
						renderFraction: null,
						renderCustom: null,
						progressbarOpposite: !1,
						type: "bullets",
						dynamicBullets: !1,
						dynamicMainBullets: 1,
						formatFractionCurrent: function (e) {
							return e;
						},
						formatFractionTotal: function (e) {
							return e;
						},
						bulletClass: "swiper-pagination-bullet",
						bulletActiveClass: "swiper-pagination-bullet-active",
						modifierClass: "swiper-pagination-",
						currentClass: "swiper-pagination-current",
						totalClass: "swiper-pagination-total",
						hiddenClass: "swiper-pagination-hidden",
						progressbarFillClass: "swiper-pagination-progressbar-fill",
						progressbarOppositeClass: "swiper-pagination-progressbar-opposite",
						clickableClass: "swiper-pagination-clickable",
						lockClass: "swiper-pagination-lock",
					},
				},
				create: function () {
					var e = this;
					ee.extend(e, {
						pagination: {
							init: N.init.bind(e),
							render: N.render.bind(e),
							update: N.update.bind(e),
							destroy: N.destroy.bind(e),
							dynamicBulletIndex: 0,
						},
					});
				},
				on: {
					init: function () {
						this.pagination.init(),
							this.pagination.render(),
							this.pagination.update();
					},
					activeIndexChange: function () {
						this.params.loop
							? this.pagination.update()
							: void 0 === this.snapIndex && this.pagination.update();
					},
					snapIndexChange: function () {
						this.params.loop || this.pagination.update();
					},
					slidesLengthChange: function () {
						this.params.loop &&
							(this.pagination.render(), this.pagination.update());
					},
					snapGridLengthChange: function () {
						this.params.loop ||
							(this.pagination.render(), this.pagination.update());
					},
					destroy: function () {
						this.pagination.destroy();
					},
					click: function (e) {
						var t = this;
						t.params.pagination.el &&
							t.params.pagination.hideOnClick &&
							0 < t.pagination.$el.length &&
							!L(e.target).hasClass(t.params.pagination.bulletClass) &&
							(!0 === t.pagination.$el.hasClass(t.params.pagination.hiddenClass)
								? t.emit("paginationShow", t)
								: t.emit("paginationHide", t),
							t.pagination.$el.toggleClass(t.params.pagination.hiddenClass));
					},
				},
			},
			{
				name: "scrollbar",
				params: {
					scrollbar: {
						el: null,
						dragSize: "auto",
						hide: !1,
						draggable: !1,
						snapOnRelease: !0,
						lockClass: "swiper-scrollbar-lock",
						dragClass: "swiper-scrollbar-drag",
					},
				},
				create: function () {
					var e = this;
					ee.extend(e, {
						scrollbar: {
							init: G.init.bind(e),
							destroy: G.destroy.bind(e),
							updateSize: G.updateSize.bind(e),
							setTranslate: G.setTranslate.bind(e),
							setTransition: G.setTransition.bind(e),
							enableDraggable: G.enableDraggable.bind(e),
							disableDraggable: G.disableDraggable.bind(e),
							setDragPosition: G.setDragPosition.bind(e),
							onDragStart: G.onDragStart.bind(e),
							onDragMove: G.onDragMove.bind(e),
							onDragEnd: G.onDragEnd.bind(e),
							isTouched: !1,
							timeout: null,
							dragTimeout: null,
						},
					});
				},
				on: {
					init: function () {
						this.scrollbar.init(),
							this.scrollbar.updateSize(),
							this.scrollbar.setTranslate();
					},
					update: function () {
						this.scrollbar.updateSize();
					},
					resize: function () {
						this.scrollbar.updateSize();
					},
					observerUpdate: function () {
						this.scrollbar.updateSize();
					},
					setTranslate: function () {
						this.scrollbar.setTranslate();
					},
					setTransition: function (e) {
						this.scrollbar.setTransition(e);
					},
					destroy: function () {
						this.scrollbar.destroy();
					},
				},
			},
			{
				name: "parallax",
				params: { parallax: { enabled: !1 } },
				create: function () {
					ee.extend(this, {
						parallax: {
							setTransform: B.setTransform.bind(this),
							setTranslate: B.setTranslate.bind(this),
							setTransition: B.setTransition.bind(this),
						},
					});
				},
				on: {
					beforeInit: function () {
						this.params.parallax.enabled &&
							((this.params.watchSlidesProgress = !0),
							(this.originalParams.watchSlidesProgress = !0));
					},
					init: function () {
						this.params.parallax.enabled && this.parallax.setTranslate();
					},
					setTranslate: function () {
						this.params.parallax.enabled && this.parallax.setTranslate();
					},
					setTransition: function (e) {
						this.params.parallax.enabled && this.parallax.setTransition(e);
					},
				},
			},
			{
				name: "zoom",
				params: {
					zoom: {
						enabled: !1,
						maxRatio: 3,
						minRatio: 1,
						toggle: !0,
						containerClass: "swiper-zoom-container",
						zoomedSlideClass: "swiper-slide-zoomed",
					},
				},
				create: function () {
					var i = this,
						t = {
							enabled: !1,
							scale: 1,
							currentScale: 1,
							isScaling: !1,
							gesture: {
								$slideEl: void 0,
								slideWidth: void 0,
								slideHeight: void 0,
								$imageEl: void 0,
								$imageWrapEl: void 0,
								maxRatio: 3,
							},
							image: {
								isTouched: void 0,
								isMoved: void 0,
								currentX: void 0,
								currentY: void 0,
								minX: void 0,
								minY: void 0,
								maxX: void 0,
								maxY: void 0,
								width: void 0,
								height: void 0,
								startX: void 0,
								startY: void 0,
								touchesStart: {},
								touchesCurrent: {},
							},
							velocity: {
								x: void 0,
								y: void 0,
								prevPositionX: void 0,
								prevPositionY: void 0,
								prevTime: void 0,
							},
						};
					"onGestureStart onGestureChange onGestureEnd onTouchStart onTouchMove onTouchEnd onTransitionEnd toggle enable disable in out"
						.split(" ")
						.forEach(function (e) {
							t[e] = X[e].bind(i);
						}),
						ee.extend(i, { zoom: t });
					var s = 1;
					Object.defineProperty(i.zoom, "scale", {
						get: function () {
							return s;
						},
						set: function (e) {
							if (s !== e) {
								var t = i.zoom.gesture.$imageEl
										? i.zoom.gesture.$imageEl[0]
										: void 0,
									a = i.zoom.gesture.$slideEl
										? i.zoom.gesture.$slideEl[0]
										: void 0;
								i.emit("zoomChange", e, t, a);
							}
							s = e;
						},
					});
				},
				on: {
					init: function () {
						this.params.zoom.enabled && this.zoom.enable();
					},
					destroy: function () {
						this.zoom.disable();
					},
					touchStart: function (e) {
						this.zoom.enabled && this.zoom.onTouchStart(e);
					},
					touchEnd: function (e) {
						this.zoom.enabled && this.zoom.onTouchEnd(e);
					},
					doubleTap: function (e) {
						this.params.zoom.enabled &&
							this.zoom.enabled &&
							this.params.zoom.toggle &&
							this.zoom.toggle(e);
					},
					transitionEnd: function () {
						this.zoom.enabled &&
							this.params.zoom.enabled &&
							this.zoom.onTransitionEnd();
					},
				},
			},
			{
				name: "lazy",
				params: {
					lazy: {
						enabled: !1,
						loadPrevNext: !1,
						loadPrevNextAmount: 1,
						loadOnTransitionStart: !1,
						elementClass: "swiper-lazy",
						loadingClass: "swiper-lazy-loading",
						loadedClass: "swiper-lazy-loaded",
						preloaderClass: "swiper-lazy-preloader",
					},
				},
				create: function () {
					ee.extend(this, {
						lazy: {
							initialImageLoaded: !1,
							load: Y.load.bind(this),
							loadInSlide: Y.loadInSlide.bind(this),
						},
					});
				},
				on: {
					beforeInit: function () {
						this.params.lazy.enabled &&
							this.params.preloadImages &&
							(this.params.preloadImages = !1);
					},
					init: function () {
						this.params.lazy.enabled &&
							!this.params.loop &&
							0 === this.params.initialSlide &&
							this.lazy.load();
					},
					scroll: function () {
						this.params.freeMode &&
							!this.params.freeModeSticky &&
							this.lazy.load();
					},
					resize: function () {
						this.params.lazy.enabled && this.lazy.load();
					},
					scrollbarDragMove: function () {
						this.params.lazy.enabled && this.lazy.load();
					},
					transitionStart: function () {
						var e = this;
						e.params.lazy.enabled &&
							(e.params.lazy.loadOnTransitionStart ||
								(!e.params.lazy.loadOnTransitionStart &&
									!e.lazy.initialImageLoaded)) &&
							e.lazy.load();
					},
					transitionEnd: function () {
						this.params.lazy.enabled &&
							!this.params.lazy.loadOnTransitionStart &&
							this.lazy.load();
					},
				},
			},
			{
				name: "controller",
				params: { controller: { control: void 0, inverse: !1, by: "slide" } },
				create: function () {
					var e = this;
					ee.extend(e, {
						controller: {
							control: e.params.controller.control,
							getInterpolateFunction: V.getInterpolateFunction.bind(e),
							setTranslate: V.setTranslate.bind(e),
							setTransition: V.setTransition.bind(e),
						},
					});
				},
				on: {
					update: function () {
						this.controller.control &&
							this.controller.spline &&
							((this.controller.spline = void 0),
							delete this.controller.spline);
					},
					resize: function () {
						this.controller.control &&
							this.controller.spline &&
							((this.controller.spline = void 0),
							delete this.controller.spline);
					},
					observerUpdate: function () {
						this.controller.control &&
							this.controller.spline &&
							((this.controller.spline = void 0),
							delete this.controller.spline);
					},
					setTranslate: function (e, t) {
						this.controller.control && this.controller.setTranslate(e, t);
					},
					setTransition: function (e, t) {
						this.controller.control && this.controller.setTransition(e, t);
					},
				},
			},
			{
				name: "a11y",
				params: {
					a11y: {
						enabled: !0,
						notificationClass: "swiper-notification",
						prevSlideMessage: "Previous slide",
						nextSlideMessage: "Next slide",
						firstSlideMessage: "This is the first slide",
						lastSlideMessage: "This is the last slide",
						paginationBulletMessage: "Go to slide {{index}}",
					},
				},
				create: function () {
					var t = this;
					ee.extend(t, {
						a11y: {
							liveRegion: L(
								'<span class="' +
									t.params.a11y.notificationClass +
									'" aria-live="assertive" aria-atomic="true"></span>'
							),
						},
					}),
						Object.keys(F).forEach(function (e) {
							t.a11y[e] = F[e].bind(t);
						});
				},
				on: {
					init: function () {
						this.params.a11y.enabled &&
							(this.a11y.init(), this.a11y.updateNavigation());
					},
					toEdge: function () {
						this.params.a11y.enabled && this.a11y.updateNavigation();
					},
					fromEdge: function () {
						this.params.a11y.enabled && this.a11y.updateNavigation();
					},
					paginationUpdate: function () {
						this.params.a11y.enabled && this.a11y.updatePagination();
					},
					destroy: function () {
						this.params.a11y.enabled && this.a11y.destroy();
					},
				},
			},
			{
				name: "history",
				params: { history: { enabled: !1, replaceState: !1, key: "slides" } },
				create: function () {
					var e = this;
					ee.extend(e, {
						history: {
							init: R.init.bind(e),
							setHistory: R.setHistory.bind(e),
							setHistoryPopState: R.setHistoryPopState.bind(e),
							scrollToSlide: R.scrollToSlide.bind(e),
							destroy: R.destroy.bind(e),
						},
					});
				},
				on: {
					init: function () {
						this.params.history.enabled && this.history.init();
					},
					destroy: function () {
						this.params.history.enabled && this.history.destroy();
					},
					transitionEnd: function () {
						this.history.initialized &&
							this.history.setHistory(
								this.params.history.key,
								this.activeIndex
							);
					},
				},
			},
			{
				name: "hash-navigation",
				params: {
					hashNavigation: { enabled: !1, replaceState: !1, watchState: !1 },
				},
				create: function () {
					var e = this;
					ee.extend(e, {
						hashNavigation: {
							initialized: !1,
							init: q.init.bind(e),
							destroy: q.destroy.bind(e),
							setHash: q.setHash.bind(e),
							onHashCange: q.onHashCange.bind(e),
						},
					});
				},
				on: {
					init: function () {
						this.params.hashNavigation.enabled && this.hashNavigation.init();
					},
					destroy: function () {
						this.params.hashNavigation.enabled && this.hashNavigation.destroy();
					},
					transitionEnd: function () {
						this.hashNavigation.initialized && this.hashNavigation.setHash();
					},
				},
			},
			{
				name: "autoplay",
				params: {
					autoplay: {
						enabled: !1,
						delay: 3e3,
						waitForTransition: !0,
						disableOnInteraction: !0,
						stopOnLastSlide: !1,
						reverseDirection: !1,
					},
				},
				create: function () {
					var t = this;
					ee.extend(t, {
						autoplay: {
							running: !1,
							paused: !1,
							run: W.run.bind(t),
							start: W.start.bind(t),
							stop: W.stop.bind(t),
							pause: W.pause.bind(t),
							onTransitionEnd: function (e) {
								t &&
									!t.destroyed &&
									t.$wrapperEl &&
									e.target === this &&
									(t.$wrapperEl[0].removeEventListener(
										"transitionend",
										t.autoplay.onTransitionEnd
									),
									t.$wrapperEl[0].removeEventListener(
										"webkitTransitionEnd",
										t.autoplay.onTransitionEnd
									),
									(t.autoplay.paused = !1),
									t.autoplay.running ? t.autoplay.run() : t.autoplay.stop());
							},
						},
					});
				},
				on: {
					init: function () {
						this.params.autoplay.enabled && this.autoplay.start();
					},
					beforeTransitionStart: function (e, t) {
						this.autoplay.running &&
							(t || !this.params.autoplay.disableOnInteraction
								? this.autoplay.pause(e)
								: this.autoplay.stop());
					},
					sliderFirstMove: function () {
						this.autoplay.running &&
							(this.params.autoplay.disableOnInteraction
								? this.autoplay.stop()
								: this.autoplay.pause());
					},
					destroy: function () {
						this.autoplay.running && this.autoplay.stop();
					},
				},
			},
			{
				name: "effect-fade",
				params: { fadeEffect: { crossFade: !1 } },
				create: function () {
					ee.extend(this, {
						fadeEffect: {
							setTranslate: j.setTranslate.bind(this),
							setTransition: j.setTransition.bind(this),
						},
					});
				},
				on: {
					beforeInit: function () {
						var e = this;
						if ("fade" === e.params.effect) {
							e.classNames.push(e.params.containerModifierClass + "fade");
							var t = {
								slidesPerView: 1,
								slidesPerColumn: 1,
								slidesPerGroup: 1,
								watchSlidesProgress: !0,
								spaceBetween: 0,
								virtualTranslate: !0,
							};
							ee.extend(e.params, t), ee.extend(e.originalParams, t);
						}
					},
					setTranslate: function () {
						"fade" === this.params.effect && this.fadeEffect.setTranslate();
					},
					setTransition: function (e) {
						"fade" === this.params.effect && this.fadeEffect.setTransition(e);
					},
				},
			},
			{
				name: "effect-cube",
				params: {
					cubeEffect: {
						slideShadows: !0,
						shadow: !0,
						shadowOffset: 20,
						shadowScale: 0.94,
					},
				},
				create: function () {
					ee.extend(this, {
						cubeEffect: {
							setTranslate: U.setTranslate.bind(this),
							setTransition: U.setTransition.bind(this),
						},
					});
				},
				on: {
					beforeInit: function () {
						var e = this;
						if ("cube" === e.params.effect) {
							e.classNames.push(e.params.containerModifierClass + "cube"),
								e.classNames.push(e.params.containerModifierClass + "3d");
							var t = {
								slidesPerView: 1,
								slidesPerColumn: 1,
								slidesPerGroup: 1,
								watchSlidesProgress: !0,
								resistanceRatio: 0,
								spaceBetween: 0,
								centeredSlides: !1,
								virtualTranslate: !0,
							};
							ee.extend(e.params, t), ee.extend(e.originalParams, t);
						}
					},
					setTranslate: function () {
						"cube" === this.params.effect && this.cubeEffect.setTranslate();
					},
					setTransition: function (e) {
						"cube" === this.params.effect && this.cubeEffect.setTransition(e);
					},
				},
			},
			{
				name: "effect-flip",
				params: { flipEffect: { slideShadows: !0, limitRotation: !0 } },
				create: function () {
					ee.extend(this, {
						flipEffect: {
							setTranslate: K.setTranslate.bind(this),
							setTransition: K.setTransition.bind(this),
						},
					});
				},
				on: {
					beforeInit: function () {
						var e = this;
						if ("flip" === e.params.effect) {
							e.classNames.push(e.params.containerModifierClass + "flip"),
								e.classNames.push(e.params.containerModifierClass + "3d");
							var t = {
								slidesPerView: 1,
								slidesPerColumn: 1,
								slidesPerGroup: 1,
								watchSlidesProgress: !0,
								spaceBetween: 0,
								virtualTranslate: !0,
							};
							ee.extend(e.params, t), ee.extend(e.originalParams, t);
						}
					},
					setTranslate: function () {
						"flip" === this.params.effect && this.flipEffect.setTranslate();
					},
					setTransition: function (e) {
						"flip" === this.params.effect && this.flipEffect.setTransition(e);
					},
				},
			},
			{
				name: "effect-coverflow",
				params: {
					coverflowEffect: {
						rotate: 50,
						stretch: 0,
						depth: 100,
						modifier: 1,
						slideShadows: !0,
					},
				},
				create: function () {
					ee.extend(this, {
						coverflowEffect: {
							setTranslate: _.setTranslate.bind(this),
							setTransition: _.setTransition.bind(this),
						},
					});
				},
				on: {
					beforeInit: function () {
						var e = this;
						"coverflow" === e.params.effect &&
							(e.classNames.push(e.params.containerModifierClass + "coverflow"),
							e.classNames.push(e.params.containerModifierClass + "3d"),
							(e.params.watchSlidesProgress = !0),
							(e.originalParams.watchSlidesProgress = !0));
					},
					setTranslate: function () {
						"coverflow" === this.params.effect &&
							this.coverflowEffect.setTranslate();
					},
					setTransition: function (e) {
						"coverflow" === this.params.effect &&
							this.coverflowEffect.setTransition(e);
					},
				},
			},
			{
				name: "thumbs",
				params: {
					thumbs: {
						swiper: null,
						slideThumbActiveClass: "swiper-slide-thumb-active",
						thumbsContainerClass: "swiper-container-thumbs",
					},
				},
				create: function () {
					ee.extend(this, {
						thumbs: {
							swiper: null,
							init: Z.init.bind(this),
							update: Z.update.bind(this),
							onThumbClick: Z.onThumbClick.bind(this),
						},
					});
				},
				on: {
					beforeInit: function () {
						var e = this.params.thumbs;
						e && e.swiper && (this.thumbs.init(), this.thumbs.update(!0));
					},
					slideChange: function () {
						this.thumbs.swiper && this.thumbs.update();
					},
					update: function () {
						this.thumbs.swiper && this.thumbs.update();
					},
					resize: function () {
						this.thumbs.swiper && this.thumbs.update();
					},
					observerUpdate: function () {
						this.thumbs.swiper && this.thumbs.update();
					},
					setTransition: function (e) {
						var t = this.thumbs.swiper;
						t && t.setTransition(e);
					},
					beforeDestroy: function () {
						var e = this.thumbs.swiper;
						e && this.thumbs.swiperCreated && e && e.destroy();
					},
				},
			},
		];
	return (
		void 0 === T.use &&
			((T.use = T.Class.use), (T.installModule = T.Class.installModule)),
		T.use(Q),
		T
	);
});
//# sourceMappingURL=swiper.min.js.map

/* MAGNIFIC POPUP */

!(function (a) {
	"function" == typeof define && define.amd
		? define(["jquery"], a)
		: a(
				"object" == typeof exports
					? require("jquery")
					: window.jQuery || window.Zepto
		  );
})(function (a) {
	var b,
		c,
		d,
		e,
		f,
		g,
		h = "Close",
		i = "BeforeClose",
		j = "AfterClose",
		k = "BeforeAppend",
		l = "MarkupParse",
		m = "Open",
		n = "Change",
		o = "mfp",
		p = "." + o,
		q = "mfp-ready",
		r = "mfp-removing",
		s = "mfp-prevent-close",
		t = function () {},
		u = !!window.jQuery,
		v = a(window),
		w = function (a, c) {
			b.ev.on(o + a + p, c);
		},
		x = function (b, c, d, e) {
			var f = document.createElement("div");
			return (
				(f.className = "mfp-" + b),
				d && (f.innerHTML = d),
				e ? c && c.appendChild(f) : ((f = a(f)), c && f.appendTo(c)),
				f
			);
		},
		y = function (c, d) {
			b.ev.triggerHandler(o + c, d),
				b.st.callbacks &&
					((c = c.charAt(0).toLowerCase() + c.slice(1)),
					b.st.callbacks[c] &&
						b.st.callbacks[c].apply(b, a.isArray(d) ? d : [d]));
		},
		z = function (c) {
			return (
				(c === g && b.currTemplate.closeBtn) ||
					((b.currTemplate.closeBtn = a(
						b.st.closeMarkup.replace("%title%", b.st.tClose)
					)),
					(g = c)),
				b.currTemplate.closeBtn
			);
		},
		A = function () {
			a.magnificPopup.instance ||
				((b = new t()), b.init(), (a.magnificPopup.instance = b));
		},
		B = function () {
			var a = document.createElement("p").style,
				b = ["ms", "O", "Moz", "Webkit"];
			if (void 0 !== a.transition) return !0;
			for (; b.length; ) if (b.pop() + "Transition" in a) return !0;
			return !1;
		};
	(t.prototype = {
		constructor: t,
		init: function () {
			var c = navigator.appVersion;
			(b.isIE7 = -1 !== c.indexOf("MSIE 7.")),
				(b.isIE8 = -1 !== c.indexOf("MSIE 8.")),
				(b.isLowIE = b.isIE7 || b.isIE8),
				(b.isAndroid = /android/gi.test(c)),
				(b.isIOS = /iphone|ipad|ipod/gi.test(c)),
				(b.supportsTransition = B()),
				(b.probablyMobile =
					b.isAndroid ||
					b.isIOS ||
					/(Opera Mini)|Kindle|webOS|BlackBerry|(Opera Mobi)|(Windows Phone)|IEMobile/i.test(
						navigator.userAgent
					)),
				(d = a(document)),
				(b.popupsCache = {});
		},
		open: function (c) {
			var e;
			if (c.isObj === !1) {
				(b.items = c.items.toArray()), (b.index = 0);
				var g,
					h = c.items;
				for (e = 0; e < h.length; e++)
					if (((g = h[e]), g.parsed && (g = g.el[0]), g === c.el[0])) {
						b.index = e;
						break;
					}
			} else
				(b.items = a.isArray(c.items) ? c.items : [c.items]),
					(b.index = c.index || 0);
			if (b.isOpen) return void b.updateItemHTML();
			(b.types = []),
				(f = ""),
				c.mainEl && c.mainEl.length ? (b.ev = c.mainEl.eq(0)) : (b.ev = d),
				c.key
					? (b.popupsCache[c.key] || (b.popupsCache[c.key] = {}),
					  (b.currTemplate = b.popupsCache[c.key]))
					: (b.currTemplate = {}),
				(b.st = a.extend(!0, {}, a.magnificPopup.defaults, c)),
				(b.fixedContentPos =
					"auto" === b.st.fixedContentPos
						? !b.probablyMobile
						: b.st.fixedContentPos),
				b.st.modal &&
					((b.st.closeOnContentClick = !1),
					(b.st.closeOnBgClick = !1),
					(b.st.showCloseBtn = !1),
					(b.st.enableEscapeKey = !1)),
				b.bgOverlay ||
					((b.bgOverlay = x("bg").on("click" + p, function () {
						b.close();
					})),
					(b.wrap = x("wrap")
						.attr("tabindex", -1)
						.on("click" + p, function (a) {
							b._checkIfClose(a.target) && b.close();
						})),
					(b.container = x("container", b.wrap))),
				(b.contentContainer = x("content")),
				b.st.preloader &&
					(b.preloader = x("preloader", b.container, b.st.tLoading));
			var i = a.magnificPopup.modules;
			for (e = 0; e < i.length; e++) {
				var j = i[e];
				(j = j.charAt(0).toUpperCase() + j.slice(1)), b["init" + j].call(b);
			}
			y("BeforeOpen"),
				b.st.showCloseBtn &&
					(b.st.closeBtnInside
						? (w(l, function (a, b, c, d) {
								c.close_replaceWith = z(d.type);
						  }),
						  (f += " mfp-close-btn-in"))
						: b.wrap.append(z())),
				b.st.alignTop && (f += " mfp-align-top"),
				b.fixedContentPos
					? b.wrap.css({
							overflow: b.st.overflowY,
							overflowX: "hidden",
							overflowY: b.st.overflowY,
					  })
					: b.wrap.css({ top: v.scrollTop(), position: "absolute" }),
				(b.st.fixedBgPos === !1 ||
					("auto" === b.st.fixedBgPos && !b.fixedContentPos)) &&
					b.bgOverlay.css({ height: d.height(), position: "absolute" }),
				b.st.enableEscapeKey &&
					d.on("keyup" + p, function (a) {
						27 === a.keyCode && b.close();
					}),
				v.on("resize" + p, function () {
					b.updateSize();
				}),
				b.st.closeOnContentClick || (f += " mfp-auto-cursor"),
				f && b.wrap.addClass(f);
			var k = (b.wH = v.height()),
				n = {};
			if (b.fixedContentPos && b._hasScrollBar(k)) {
				var o = b._getScrollbarSize();
				o && (n.marginRight = o);
			}
			b.fixedContentPos &&
				(b.isIE7
					? a("body, html").css("overflow", "hidden")
					: (n.overflow = "hidden"));
			var r = b.st.mainClass;
			return (
				b.isIE7 && (r += " mfp-ie7"),
				r && b._addClassToMFP(r),
				b.updateItemHTML(),
				y("BuildControls"),
				a("html").css(n),
				b.bgOverlay.add(b.wrap).prependTo(b.st.prependTo || a(document.body)),
				(b._lastFocusedEl = document.activeElement),
				setTimeout(function () {
					b.content
						? (b._addClassToMFP(q), b._setFocus())
						: b.bgOverlay.addClass(q),
						d.on("focusin" + p, b._onFocusIn);
				}, 16),
				(b.isOpen = !0),
				b.updateSize(k),
				y(m),
				c
			);
		},
		close: function () {
			b.isOpen &&
				(y(i),
				(b.isOpen = !1),
				b.st.removalDelay && !b.isLowIE && b.supportsTransition
					? (b._addClassToMFP(r),
					  setTimeout(function () {
							b._close();
					  }, b.st.removalDelay))
					: b._close());
		},
		_close: function () {
			y(h);
			var c = r + " " + q + " ";
			if (
				(b.bgOverlay.detach(),
				b.wrap.detach(),
				b.container.empty(),
				b.st.mainClass && (c += b.st.mainClass + " "),
				b._removeClassFromMFP(c),
				b.fixedContentPos)
			) {
				var e = { marginRight: "" };
				b.isIE7 ? a("body, html").css("overflow", "") : (e.overflow = ""),
					a("html").css(e);
			}
			d.off("keyup" + p + " focusin" + p),
				b.ev.off(p),
				b.wrap.attr("class", "mfp-wrap").removeAttr("style"),
				b.bgOverlay.attr("class", "mfp-bg"),
				b.container.attr("class", "mfp-container"),
				!b.st.showCloseBtn ||
					(b.st.closeBtnInside && b.currTemplate[b.currItem.type] !== !0) ||
					(b.currTemplate.closeBtn && b.currTemplate.closeBtn.detach()),
				b.st.autoFocusLast && b._lastFocusedEl && a(b._lastFocusedEl).focus(),
				(b.currItem = null),
				(b.content = null),
				(b.currTemplate = null),
				(b.prevHeight = 0),
				y(j);
		},
		updateSize: function (a) {
			if (b.isIOS) {
				var c = document.documentElement.clientWidth / window.innerWidth,
					d = window.innerHeight * c;
				b.wrap.css("height", d), (b.wH = d);
			} else b.wH = a || v.height();
			b.fixedContentPos || b.wrap.css("height", b.wH), y("Resize");
		},
		updateItemHTML: function () {
			var c = b.items[b.index];
			b.contentContainer.detach(),
				b.content && b.content.detach(),
				c.parsed || (c = b.parseEl(b.index));
			var d = c.type;
			if (
				(y("BeforeChange", [b.currItem ? b.currItem.type : "", d]),
				(b.currItem = c),
				!b.currTemplate[d])
			) {
				var f = b.st[d] ? b.st[d].markup : !1;
				y("FirstMarkupParse", f),
					f ? (b.currTemplate[d] = a(f)) : (b.currTemplate[d] = !0);
			}
			e && e !== c.type && b.container.removeClass("mfp-" + e + "-holder");
			var g = b["get" + d.charAt(0).toUpperCase() + d.slice(1)](
				c,
				b.currTemplate[d]
			);
			b.appendContent(g, d),
				(c.preloaded = !0),
				y(n, c),
				(e = c.type),
				b.container.prepend(b.contentContainer),
				y("AfterChange");
		},
		appendContent: function (a, c) {
			(b.content = a),
				a
					? b.st.showCloseBtn && b.st.closeBtnInside && b.currTemplate[c] === !0
						? b.content.find(".mfp-close").length || b.content.append(z())
						: (b.content = a)
					: (b.content = ""),
				y(k),
				b.container.addClass("mfp-" + c + "-holder"),
				b.contentContainer.append(b.content);
		},
		parseEl: function (c) {
			var d,
				e = b.items[c];
			if (
				(e.tagName
					? (e = { el: a(e) })
					: ((d = e.type), (e = { data: e, src: e.src })),
				e.el)
			) {
				for (var f = b.types, g = 0; g < f.length; g++)
					if (e.el.hasClass("mfp-" + f[g])) {
						d = f[g];
						break;
					}
				(e.src = e.el.attr("data-mfp-src")),
					e.src || (e.src = e.el.attr("href"));
			}
			return (
				(e.type = d || b.st.type || "inline"),
				(e.index = c),
				(e.parsed = !0),
				(b.items[c] = e),
				y("ElementParse", e),
				b.items[c]
			);
		},
		addGroup: function (a, c) {
			var d = function (d) {
				(d.mfpEl = this), b._openClick(d, a, c);
			};
			c || (c = {});
			var e = "click.magnificPopup";
			(c.mainEl = a),
				c.items
					? ((c.isObj = !0), a.off(e).on(e, d))
					: ((c.isObj = !1),
					  c.delegate
							? a.off(e).on(e, c.delegate, d)
							: ((c.items = a), a.off(e).on(e, d)));
		},
		_openClick: function (c, d, e) {
			var f =
				void 0 !== e.midClick ? e.midClick : a.magnificPopup.defaults.midClick;
			if (
				f ||
				!(2 === c.which || c.ctrlKey || c.metaKey || c.altKey || c.shiftKey)
			) {
				var g =
					void 0 !== e.disableOn
						? e.disableOn
						: a.magnificPopup.defaults.disableOn;
				if (g)
					if (a.isFunction(g)) {
						if (!g.call(b)) return !0;
					} else if (v.width() < g) return !0;
				c.type && (c.preventDefault(), b.isOpen && c.stopPropagation()),
					(e.el = a(c.mfpEl)),
					e.delegate && (e.items = d.find(e.delegate)),
					b.open(e);
			}
		},
		updateStatus: function (a, d) {
			if (b.preloader) {
				c !== a && b.container.removeClass("mfp-s-" + c),
					d || "loading" !== a || (d = b.st.tLoading);
				var e = { status: a, text: d };
				y("UpdateStatus", e),
					(a = e.status),
					(d = e.text),
					b.preloader.html(d),
					b.preloader.find("a").on("click", function (a) {
						a.stopImmediatePropagation();
					}),
					b.container.addClass("mfp-s-" + a),
					(c = a);
			}
		},
		_checkIfClose: function (c) {
			if (!a(c).hasClass(s)) {
				var d = b.st.closeOnContentClick,
					e = b.st.closeOnBgClick;
				if (d && e) return !0;
				if (
					!b.content ||
					a(c).hasClass("mfp-close") ||
					(b.preloader && c === b.preloader[0])
				)
					return !0;
				if (c === b.content[0] || a.contains(b.content[0], c)) {
					if (d) return !0;
				} else if (e && a.contains(document, c)) return !0;
				return !1;
			}
		},
		_addClassToMFP: function (a) {
			b.bgOverlay.addClass(a), b.wrap.addClass(a);
		},
		_removeClassFromMFP: function (a) {
			this.bgOverlay.removeClass(a), b.wrap.removeClass(a);
		},
		_hasScrollBar: function (a) {
			return (
				(b.isIE7 ? d.height() : document.body.scrollHeight) > (a || v.height())
			);
		},
		_setFocus: function () {
			(b.st.focus ? b.content.find(b.st.focus).eq(0) : b.wrap).focus();
		},
		_onFocusIn: function (c) {
			return c.target === b.wrap[0] || a.contains(b.wrap[0], c.target)
				? void 0
				: (b._setFocus(), !1);
		},
		_parseMarkup: function (b, c, d) {
			var e;
			d.data && (c = a.extend(d.data, c)),
				y(l, [b, c, d]),
				a.each(c, function (a, c) {
					if (void 0 === c || c === !1) return !0;
					if (((e = a.split("_")), e.length > 1)) {
						var d = b.find(p + "-" + e[0]);
						if (d.length > 0) {
							var f = e[1];
							"replaceWith" === f
								? d[0] !== c[0] && d.replaceWith(c)
								: "img" === f
								? d.is("img")
									? d.attr("src", c)
									: d.replaceWith(
											'<img src="' + c + '" class="' + d.attr("class") + '" />'
									  )
								: d.attr(e[1], c);
						}
					} else b.find(p + "-" + a).html(c);
				});
		},
		_getScrollbarSize: function () {
			if (void 0 === b.scrollbarSize) {
				var a = document.createElement("div");
				(a.style.cssText =
					"width: 99px; height: 99px; overflow: scroll; position: absolute; top: -9999px;"),
					document.body.appendChild(a),
					(b.scrollbarSize = a.offsetWidth - a.clientWidth),
					document.body.removeChild(a);
			}
			return b.scrollbarSize;
		},
	}),
		(a.magnificPopup = {
			instance: null,
			proto: t.prototype,
			modules: [],
			open: function (b, c) {
				return (
					A(),
					(b = b ? a.extend(!0, {}, b) : {}),
					(b.isObj = !0),
					(b.index = c || 0),
					this.instance.open(b)
				);
			},
			close: function () {
				return a.magnificPopup.instance && a.magnificPopup.instance.close();
			},
			registerModule: function (b, c) {
				c.options && (a.magnificPopup.defaults[b] = c.options),
					a.extend(this.proto, c.proto),
					this.modules.push(b);
			},
			defaults: {
				disableOn: 0,
				key: null,
				midClick: !1,
				mainClass: "",
				preloader: !0,
				focus: "",
				closeOnContentClick: !1,
				closeOnBgClick: !0,
				closeBtnInside: !0,
				showCloseBtn: !0,
				enableEscapeKey: !0,
				modal: !1,
				alignTop: !1,
				removalDelay: 0,
				prependTo: null,
				fixedContentPos: "auto",
				fixedBgPos: "auto",
				overflowY: "auto",
				closeMarkup:
					'<button title="%title%" type="button" class="mfp-close">&#215;</button>',
				tClose: "Close (Esc)",
				tLoading: "Loading...",
				autoFocusLast: !0,
			},
		}),
		(a.fn.magnificPopup = function (c) {
			A();
			var d = a(this);
			if ("string" == typeof c)
				if ("open" === c) {
					var e,
						f = u ? d.data("magnificPopup") : d[0].magnificPopup,
						g = parseInt(arguments[1], 10) || 0;
					f.items
						? (e = f.items[g])
						: ((e = d), f.delegate && (e = e.find(f.delegate)), (e = e.eq(g))),
						b._openClick({ mfpEl: e }, d, f);
				} else
					b.isOpen && b[c].apply(b, Array.prototype.slice.call(arguments, 1));
			else
				(c = a.extend(!0, {}, c)),
					u ? d.data("magnificPopup", c) : (d[0].magnificPopup = c),
					b.addGroup(d, c);
			return d;
		});
	var C,
		D,
		E,
		F = "inline",
		G = function () {
			E && (D.after(E.addClass(C)).detach(), (E = null));
		};
	a.magnificPopup.registerModule(F, {
		options: {
			hiddenClass: "hide",
			markup: "",
			tNotFound: "Content not found",
		},
		proto: {
			initInline: function () {
				b.types.push(F),
					w(h + "." + F, function () {
						G();
					});
			},
			getInline: function (c, d) {
				if ((G(), c.src)) {
					var e = b.st.inline,
						f = a(c.src);
					if (f.length) {
						var g = f[0].parentNode;
						g &&
							g.tagName &&
							(D || ((C = e.hiddenClass), (D = x(C)), (C = "mfp-" + C)),
							(E = f.after(D).detach().removeClass(C))),
							b.updateStatus("ready");
					} else b.updateStatus("error", e.tNotFound), (f = a("<div>"));
					return (c.inlineElement = f), f;
				}
				return b.updateStatus("ready"), b._parseMarkup(d, {}, c), d;
			},
		},
	});
	var H,
		I = "ajax",
		J = function () {
			H && a(document.body).removeClass(H);
		},
		K = function () {
			J(), b.req && b.req.abort();
		};
	a.magnificPopup.registerModule(I, {
		options: {
			settings: null,
			cursor: "mfp-ajax-cur",
			tError: '<a href="%url%">The content</a> could not be loaded.',
		},
		proto: {
			initAjax: function () {
				b.types.push(I),
					(H = b.st.ajax.cursor),
					w(h + "." + I, K),
					w("BeforeChange." + I, K);
			},
			getAjax: function (c) {
				H && a(document.body).addClass(H), b.updateStatus("loading");
				var d = a.extend(
					{
						url: c.src,
						success: function (d, e, f) {
							var g = { data: d, xhr: f };
							y("ParseAjax", g),
								b.appendContent(a(g.data), I),
								(c.finished = !0),
								J(),
								b._setFocus(),
								setTimeout(function () {
									b.wrap.addClass(q);
								}, 16),
								b.updateStatus("ready"),
								y("AjaxContentAdded");
						},
						error: function () {
							J(),
								(c.finished = c.loadError = !0),
								b.updateStatus(
									"error",
									b.st.ajax.tError.replace("%url%", c.src)
								);
						},
					},
					b.st.ajax.settings
				);
				return (b.req = a.ajax(d)), "";
			},
		},
	});
	var L,
		M = function (c) {
			if (c.data && void 0 !== c.data.title) return c.data.title;
			var d = b.st.image.titleSrc;
			if (d) {
				if (a.isFunction(d)) return d.call(b, c);
				if (c.el) return c.el.attr(d) || "";
			}
			return "";
		};
	a.magnificPopup.registerModule("image", {
		options: {
			markup:
				'<div class="mfp-figure"><div class="mfp-close"></div><figure><div class="mfp-img"></div><figcaption><div class="mfp-bottom-bar"><div class="mfp-title"></div><div class="mfp-counter"></div></div></figcaption></figure></div>',
			cursor: "mfp-zoom-out-cur",
			titleSrc: "title",
			verticalFit: !0,
			tError: '<a href="%url%">The image</a> could not be loaded.',
		},
		proto: {
			initImage: function () {
				var c = b.st.image,
					d = ".image";
				b.types.push("image"),
					w(m + d, function () {
						"image" === b.currItem.type &&
							c.cursor &&
							a(document.body).addClass(c.cursor);
					}),
					w(h + d, function () {
						c.cursor && a(document.body).removeClass(c.cursor),
							v.off("resize" + p);
					}),
					w("Resize" + d, b.resizeImage),
					b.isLowIE && w("AfterChange", b.resizeImage);
			},
			resizeImage: function () {
				var a = b.currItem;
				if (a && a.img && b.st.image.verticalFit) {
					var c = 0;
					b.isLowIE &&
						(c =
							parseInt(a.img.css("padding-top"), 10) +
							parseInt(a.img.css("padding-bottom"), 10)),
						a.img.css("max-height", b.wH - c);
				}
			},
			_onImageHasSize: function (a) {
				a.img &&
					((a.hasSize = !0),
					L && clearInterval(L),
					(a.isCheckingImgSize = !1),
					y("ImageHasSize", a),
					a.imgHidden &&
						(b.content && b.content.removeClass("mfp-loading"),
						(a.imgHidden = !1)));
			},
			findImageSize: function (a) {
				var c = 0,
					d = a.img[0],
					e = function (f) {
						L && clearInterval(L),
							(L = setInterval(function () {
								return d.naturalWidth > 0
									? void b._onImageHasSize(a)
									: (c > 200 && clearInterval(L),
									  c++,
									  void (3 === c
											? e(10)
											: 40 === c
											? e(50)
											: 100 === c && e(500)));
							}, f));
					};
				e(1);
			},
			getImage: function (c, d) {
				var e = 0,
					f = function () {
						c &&
							(c.img[0].complete
								? (c.img.off(".mfploader"),
								  c === b.currItem &&
										(b._onImageHasSize(c), b.updateStatus("ready")),
								  (c.hasSize = !0),
								  (c.loaded = !0),
								  y("ImageLoadComplete"))
								: (e++, 200 > e ? setTimeout(f, 100) : g()));
					},
					g = function () {
						c &&
							(c.img.off(".mfploader"),
							c === b.currItem &&
								(b._onImageHasSize(c),
								b.updateStatus("error", h.tError.replace("%url%", c.src))),
							(c.hasSize = !0),
							(c.loaded = !0),
							(c.loadError = !0));
					},
					h = b.st.image,
					i = d.find(".mfp-img");
				if (i.length) {
					var j = document.createElement("img");
					(j.className = "mfp-img"),
						c.el &&
							c.el.find("img").length &&
							(j.alt = c.el.find("img").attr("alt")),
						(c.img = a(j).on("load.mfploader", f).on("error.mfploader", g)),
						(j.src = c.src),
						i.is("img") && (c.img = c.img.clone()),
						(j = c.img[0]),
						j.naturalWidth > 0 ? (c.hasSize = !0) : j.width || (c.hasSize = !1);
				}
				return (
					b._parseMarkup(d, { title: M(c), img_replaceWith: c.img }, c),
					b.resizeImage(),
					c.hasSize
						? (L && clearInterval(L),
						  c.loadError
								? (d.addClass("mfp-loading"),
								  b.updateStatus("error", h.tError.replace("%url%", c.src)))
								: (d.removeClass("mfp-loading"), b.updateStatus("ready")),
						  d)
						: (b.updateStatus("loading"),
						  (c.loading = !0),
						  c.hasSize ||
								((c.imgHidden = !0),
								d.addClass("mfp-loading"),
								b.findImageSize(c)),
						  d)
				);
			},
		},
	});
	var N,
		O = function () {
			return (
				void 0 === N &&
					(N = void 0 !== document.createElement("p").style.MozTransform),
				N
			);
		};
	a.magnificPopup.registerModule("zoom", {
		options: {
			enabled: !1,
			easing: "ease-in-out",
			duration: 300,
			opener: function (a) {
				return a.is("img") ? a : a.find("img");
			},
		},
		proto: {
			initZoom: function () {
				var a,
					c = b.st.zoom,
					d = ".zoom";
				if (c.enabled && b.supportsTransition) {
					var e,
						f,
						g = c.duration,
						j = function (a) {
							var b = a
									.clone()
									.removeAttr("style")
									.removeAttr("class")
									.addClass("mfp-animated-image"),
								d = "all " + c.duration / 1e3 + "s " + c.easing,
								e = {
									position: "fixed",
									zIndex: 9999,
									left: 0,
									top: 0,
									"-webkit-backface-visibility": "hidden",
								},
								f = "transition";
							return (
								(e["-webkit-" + f] = e["-moz-" + f] = e["-o-" + f] = e[f] = d),
								b.css(e),
								b
							);
						},
						k = function () {
							b.content.css("visibility", "visible");
						};
					w("BuildControls" + d, function () {
						if (b._allowZoom()) {
							if (
								(clearTimeout(e),
								b.content.css("visibility", "hidden"),
								(a = b._getItemToZoom()),
								!a)
							)
								return void k();
							(f = j(a)),
								f.css(b._getOffset()),
								b.wrap.append(f),
								(e = setTimeout(function () {
									f.css(b._getOffset(!0)),
										(e = setTimeout(function () {
											k(),
												setTimeout(function () {
													f.remove(), (a = f = null), y("ZoomAnimationEnded");
												}, 16);
										}, g));
								}, 16));
						}
					}),
						w(i + d, function () {
							if (b._allowZoom()) {
								if ((clearTimeout(e), (b.st.removalDelay = g), !a)) {
									if (((a = b._getItemToZoom()), !a)) return;
									f = j(a);
								}
								f.css(b._getOffset(!0)),
									b.wrap.append(f),
									b.content.css("visibility", "hidden"),
									setTimeout(function () {
										f.css(b._getOffset());
									}, 16);
							}
						}),
						w(h + d, function () {
							b._allowZoom() && (k(), f && f.remove(), (a = null));
						});
				}
			},
			_allowZoom: function () {
				return "image" === b.currItem.type;
			},
			_getItemToZoom: function () {
				return b.currItem.hasSize ? b.currItem.img : !1;
			},
			_getOffset: function (c) {
				var d;
				d = c ? b.currItem.img : b.st.zoom.opener(b.currItem.el || b.currItem);
				var e = d.offset(),
					f = parseInt(d.css("padding-top"), 10),
					g = parseInt(d.css("padding-bottom"), 10);
				e.top -= a(window).scrollTop() - f;
				var h = {
					width: d.width(),
					height: (u ? d.innerHeight() : d[0].offsetHeight) - g - f,
				};
				return (
					O()
						? (h["-moz-transform"] = h.transform =
								"translate(" + e.left + "px," + e.top + "px)")
						: ((h.left = e.left), (h.top = e.top)),
					h
				);
			},
		},
	});
	var P = "iframe",
		Q = "//about:blank",
		R = function (a) {
			if (b.currTemplate[P]) {
				var c = b.currTemplate[P].find("iframe");
				c.length &&
					(a || (c[0].src = Q),
					b.isIE8 && c.css("display", a ? "block" : "none"));
			}
		};
	a.magnificPopup.registerModule(P, {
		options: {
			markup:
				'<div class="mfp-iframe-scaler"><div class="mfp-close"></div><iframe class="mfp-iframe" src="//about:blank" frameborder="0" allowfullscreen></iframe></div>',
			srcAction: "iframe_src",
			patterns: {
				youtube: {
					index: "youtube.com",
					id: "v=",
					src: "//www.youtube.com/embed/%id%?autoplay=1",
				},
				vimeo: {
					index: "vimeo.com/",
					id: "/",
					src: "//player.vimeo.com/video/%id%?autoplay=1",
				},
				gmaps: { index: "//maps.google.", src: "%id%&output=embed" },
			},
		},
		proto: {
			initIframe: function () {
				b.types.push(P),
					w("BeforeChange", function (a, b, c) {
						b !== c && (b === P ? R() : c === P && R(!0));
					}),
					w(h + "." + P, function () {
						R();
					});
			},
			getIframe: function (c, d) {
				var e = c.src,
					f = b.st.iframe;
				a.each(f.patterns, function () {
					return e.indexOf(this.index) > -1
						? (this.id &&
								(e =
									"string" == typeof this.id
										? e.substr(
												e.lastIndexOf(this.id) + this.id.length,
												e.length
										  )
										: this.id.call(this, e)),
						  (e = this.src.replace("%id%", e)),
						  !1)
						: void 0;
				});
				var g = {};
				return (
					f.srcAction && (g[f.srcAction] = e),
					b._parseMarkup(d, g, c),
					b.updateStatus("ready"),
					d
				);
			},
		},
	});
	var S = function (a) {
			var c = b.items.length;
			return a > c - 1 ? a - c : 0 > a ? c + a : a;
		},
		T = function (a, b, c) {
			return a.replace(/%curr%/gi, b + 1).replace(/%total%/gi, c);
		};
	a.magnificPopup.registerModule("gallery", {
		options: {
			enabled: !1,
			arrowMarkup:
				'<button title="%title%" type="button" class="mfp-arrow mfp-arrow-%dir%"></button>',
			preload: [0, 2],
			navigateByImgClick: !0,
			arrows: !0,
			tPrev: "Previous (Left arrow key)",
			tNext: "Next (Right arrow key)",
			tCounter: "%curr% of %total%",
		},
		proto: {
			initGallery: function () {
				var c = b.st.gallery,
					e = ".mfp-gallery",
					g = Boolean(a.fn.mfpFastClick);
				return (
					(b.direction = !0),
					c && c.enabled
						? ((f += " mfp-gallery"),
						  w(m + e, function () {
								c.navigateByImgClick &&
									b.wrap.on("click" + e, ".mfp-img", function () {
										return b.items.length > 1 ? (b.next(), !1) : void 0;
									}),
									d.on("keydown" + e, function (a) {
										37 === a.keyCode ? b.prev() : 39 === a.keyCode && b.next();
									});
						  }),
						  w("UpdateStatus" + e, function (a, c) {
								c.text &&
									(c.text = T(c.text, b.currItem.index, b.items.length));
						  }),
						  w(l + e, function (a, d, e, f) {
								var g = b.items.length;
								e.counter = g > 1 ? T(c.tCounter, f.index, g) : "";
						  }),
						  w("BuildControls" + e, function () {
								if (b.items.length > 1 && c.arrows && !b.arrowLeft) {
									var d = c.arrowMarkup,
										e = (b.arrowLeft = a(
											d.replace(/%title%/gi, c.tPrev).replace(/%dir%/gi, "left")
										).addClass(s)),
										f = (b.arrowRight = a(
											d
												.replace(/%title%/gi, c.tNext)
												.replace(/%dir%/gi, "right")
										).addClass(s)),
										h = g ? "mfpFastClick" : "click";
									e[h](function () {
										b.prev();
									}),
										f[h](function () {
											b.next();
										}),
										b.isIE7 &&
											(x("b", e[0], !1, !0),
											x("a", e[0], !1, !0),
											x("b", f[0], !1, !0),
											x("a", f[0], !1, !0)),
										b.container.append(e.add(f));
								}
						  }),
						  w(n + e, function () {
								b._preloadTimeout && clearTimeout(b._preloadTimeout),
									(b._preloadTimeout = setTimeout(function () {
										b.preloadNearbyImages(), (b._preloadTimeout = null);
									}, 16));
						  }),
						  void w(h + e, function () {
								d.off(e),
									b.wrap.off("click" + e),
									b.arrowLeft &&
										g &&
										b.arrowLeft.add(b.arrowRight).destroyMfpFastClick(),
									(b.arrowRight = b.arrowLeft = null);
						  }))
						: !1
				);
			},
			next: function () {
				(b.direction = !0), (b.index = S(b.index + 1)), b.updateItemHTML();
			},
			prev: function () {
				(b.direction = !1), (b.index = S(b.index - 1)), b.updateItemHTML();
			},
			goTo: function (a) {
				(b.direction = a >= b.index), (b.index = a), b.updateItemHTML();
			},
			preloadNearbyImages: function () {
				var a,
					c = b.st.gallery.preload,
					d = Math.min(c[0], b.items.length),
					e = Math.min(c[1], b.items.length);
				for (a = 1; a <= (b.direction ? e : d); a++)
					b._preloadItem(b.index + a);
				for (a = 1; a <= (b.direction ? d : e); a++)
					b._preloadItem(b.index - a);
			},
			_preloadItem: function (c) {
				if (((c = S(c)), !b.items[c].preloaded)) {
					var d = b.items[c];
					d.parsed || (d = b.parseEl(c)),
						y("LazyLoad", d),
						"image" === d.type &&
							(d.img = a('<img class="mfp-img" />')
								.on("load.mfploader", function () {
									d.hasSize = !0;
								})
								.on("error.mfploader", function () {
									(d.hasSize = !0), (d.loadError = !0), y("LazyLoadError", d);
								})
								.attr("src", d.src)),
						(d.preloaded = !0);
				}
			},
		},
	});
	var U = "retina";
	a.magnificPopup.registerModule(U, {
		options: {
			replaceSrc: function (a) {
				return a.src.replace(/\.\w+$/, function (a) {
					return "@2x" + a;
				});
			},
			ratio: 1,
		},
		proto: {
			initRetina: function () {
				if (window.devicePixelRatio > 1) {
					var a = b.st.retina,
						c = a.ratio;
					(c = isNaN(c) ? c() : c),
						c > 1 &&
							(w("ImageHasSize." + U, function (a, b) {
								b.img.css({
									"max-width": b.img[0].naturalWidth / c,
									width: "100%",
								});
							}),
							w("ElementParse." + U, function (b, d) {
								d.src = a.replaceSrc(d, c);
							}));
				}
			},
		},
	}),
		(function () {
			var b = 1e3,
				c = "ontouchstart" in window,
				d = function () {
					v.off("touchmove" + f + " touchend" + f);
				},
				e = "mfpFastClick",
				f = "." + e;
			(a.fn.mfpFastClick = function (e) {
				return a(this).each(function () {
					var g,
						h = a(this);
					if (c) {
						var i, j, k, l, m, n;
						h.on("touchstart" + f, function (a) {
							(l = !1),
								(n = 1),
								(m = a.originalEvent
									? a.originalEvent.touches[0]
									: a.touches[0]),
								(j = m.clientX),
								(k = m.clientY),
								v
									.on("touchmove" + f, function (a) {
										(m = a.originalEvent ? a.originalEvent.touches : a.touches),
											(n = m.length),
											(m = m[0]),
											(Math.abs(m.clientX - j) > 10 ||
												Math.abs(m.clientY - k) > 10) &&
												((l = !0), d());
									})
									.on("touchend" + f, function (a) {
										d(),
											l ||
												n > 1 ||
												((g = !0),
												a.preventDefault(),
												clearTimeout(i),
												(i = setTimeout(function () {
													g = !1;
												}, b)),
												e());
									});
						});
					}
					h.on("click" + f, function () {
						g || e();
					});
				});
			}),
				(a.fn.destroyMfpFastClick = function () {
					a(this).off("touchstart" + f + " click" + f),
						c && v.off("touchmove" + f + " touchend" + f);
				});
		})(),
		A();
});

/* TYPED JS */

!(function (r) {
	"use strict";
	var o = function (t, s) {
		(this.el = r(t)),
			(this.options = r.extend({}, r.fn.typed.defaults, s)),
			(this.isInput = this.el.is("input")),
			(this.attr = this.options.attr),
			(this.showCursor = !this.isInput && this.options.showCursor),
			(this.elContent = this.attr ? this.el.attr(this.attr) : this.el.text()),
			(this.contentType = this.options.contentType),
			(this.typeSpeed = this.options.typeSpeed),
			(this.startDelay = this.options.startDelay),
			(this.backSpeed = this.options.backSpeed),
			(this.backDelay = this.options.backDelay),
			(this.stringsElement = this.options.stringsElement),
			(this.strings = this.options.strings),
			(this.strPos = 0),
			(this.arrayPos = 0),
			(this.stopNum = 0),
			(this.loop = this.options.loop),
			(this.loopCount = this.options.loopCount),
			(this.curLoop = 0),
			(this.stop = !1),
			(this.cursorChar = this.options.cursorChar),
			(this.shuffle = this.options.shuffle),
			(this.sequence = []),
			this.build();
	};
	(o.prototype = {
		constructor: o,
		init: function () {
			var s = this;
			s.timeout = setTimeout(function () {
				for (var t = 0; t < s.strings.length; ++t) s.sequence[t] = t;
				s.shuffle && (s.sequence = s.shuffleArray(s.sequence)),
					s.typewrite(s.strings[s.sequence[s.arrayPos]], s.strPos);
			}, s.startDelay);
		},
		build: function () {
			var e = this;
			if (
				(!0 === this.showCursor &&
					((this.cursor = r(
						'<span class="typed-cursor">' + this.cursorChar + "</span>"
					)),
					this.el.after(this.cursor)),
				this.stringsElement)
			) {
				(this.strings = []),
					this.stringsElement.hide(),
					console.log(this.stringsElement.children());
				var t = this.stringsElement.children();
				r.each(t, function (t, s) {
					e.strings.push(r(s).html());
				});
			}
			this.init();
		},
		typewrite: function (o, n) {
			if (!0 !== this.stop) {
				var t = Math.round(70 * Math.random()) + this.typeSpeed,
					a = this;
				a.timeout = setTimeout(function () {
					var t = 0,
						s = o.substr(n);
					if ("^" === s.charAt(0)) {
						var e = 1;
						/^\^\d+/.test(s) &&
							((e += (s = /\d+/.exec(s)[0]).length), (t = parseInt(s))),
							(o = o.substring(0, n) + o.substring(n + e));
					}
					if ("html" === a.contentType) {
						var i = o.substr(n).charAt(0);
						if ("<" === i || "&" === i) {
							var r = "";
							for (
								r = "<" === i ? ">" : ";";
								o.substr(n + 1).charAt(0) !== r &&
								(o.substr(n).charAt(0), !(++n + 1 > o.length));

							);
							n++, r;
						}
					}
					a.timeout = setTimeout(function () {
						if (n === o.length) {
							if (
								(a.options.onStringTyped(a.arrayPos),
								a.arrayPos === a.strings.length - 1 &&
									(a.options.callback(),
									a.curLoop++,
									!1 === a.loop || a.curLoop === a.loopCount))
							)
								return;
							a.timeout = setTimeout(function () {
								a.backspace(o, n);
							}, a.backDelay);
						} else {
							0 === n && a.options.preStringTyped(a.arrayPos);
							var t = o.substr(0, n + 1);
							a.attr
								? a.el.attr(a.attr, t)
								: a.isInput
								? a.el.val(t)
								: "html" === a.contentType
								? a.el.html(t)
								: a.el.text(t),
								n++,
								a.typewrite(o, n);
						}
					}, t);
				}, t);
			}
		},
		backspace: function (s, e) {
			if (!0 !== this.stop) {
				var t = Math.round(70 * Math.random()) + this.backSpeed,
					i = this;
				i.timeout = setTimeout(function () {
					if ("html" === i.contentType && ">" === s.substr(e).charAt(0)) {
						for (
							;
							"<" !== s.substr(e - 1).charAt(0) &&
							(s.substr(e).charAt(0), !(--e < 0));

						);
						e--, "<";
					}
					var t = s.substr(0, e);
					i.attr
						? i.el.attr(i.attr, t)
						: i.isInput
						? i.el.val(t)
						: "html" === i.contentType
						? i.el.html(t)
						: i.el.text(t),
						e > i.stopNum
							? (e--, i.backspace(s, e))
							: e <= i.stopNum &&
							  (i.arrayPos++,
							  i.arrayPos === i.strings.length
									? ((i.arrayPos = 0),
									  i.shuffle && (i.sequence = i.shuffleArray(i.sequence)),
									  i.init())
									: i.typewrite(i.strings[i.sequence[i.arrayPos]], e));
				}, t);
			}
		},
		shuffleArray: function (t) {
			var s,
				e,
				i = t.length;
			if (i)
				for (; --i; )
					(s = t[(e = Math.floor(Math.random() * (i + 1)))]),
						(t[e] = t[i]),
						(t[i] = s);
			return t;
		},
		reset: function () {
			clearInterval(this.timeout);
			this.el.attr("id");
			this.el.empty(),
				void 0 !== this.cursor && this.cursor.remove(),
				(this.strPos = 0),
				(this.arrayPos = 0),
				(this.curLoop = 0),
				this.options.resetCallback();
		},
	}),
		(r.fn.typed = function (i) {
			return this.each(function () {
				var t = r(this),
					s = t.data("typed"),
					e = "object" == typeof i && i;
				s && s.reset(),
					t.data("typed", (s = new o(this, e))),
					"string" == typeof i && s[i]();
			});
		}),
		(r.fn.typed.defaults = {
			strings: [
				"These are the default values...",
				"You know what you should do?",
				"Use your own!",
				"Have a great day!",
			],
			stringsElement: null,
			typeSpeed: 0,
			startDelay: 0,
			backSpeed: 0,
			shuffle: !1,
			backDelay: 500,
			loop: !1,
			loopCount: !1,
			showCursor: !0,
			cursorChar: "|",
			attr: null,
			contentType: "html",
			callback: function () {},
			preStringTyped: function () {},
			onStringTyped: function () {},
			resetCallback: function () {},
		});
})(window.jQuery);

// VIDE JS

!(function (e, t) {
	"function" == typeof define && define.amd
		? define(["jquery"], t)
		: "object" == typeof exports
		? t(require("jquery"))
		: t(e.jQuery);
})(this, function (e) {
	"use strict";
	var t = {
			volume: 1,
			playbackRate: 1,
			muted: !0,
			loop: !0,
			autoplay: !0,
			position: "50% 50%",
			posterType: "detect",
			resizing: !0,
			bgColor: "transparent",
			className: "",
		},
		o = "Not implemented";
	function i(e) {
		var t,
			o,
			i,
			r,
			n,
			s,
			a,
			d = {};
		for (
			a = 0,
				s = (n = e
					.replace(/\s*:\s*/g, ":")
					.replace(/\s*,\s*/g, ",")
					.split(",")).length;
			a < s &&
			-1 === (o = n[a]).search(/^(http|https|ftp):\/\//) &&
			-1 !== o.search(":");
			a++
		)
			(t = o.indexOf(":")),
				(i = o.substring(0, t)),
				(r = o.substring(t + 1)) || (r = void 0),
				"string" == typeof r && (r = "true" === r || ("false" !== r && r)),
				"string" == typeof r && (r = isNaN(r) ? r : +r),
				(d[i] = r);
		return null == i && null == r ? e : d;
	}
	function r(r, n, s) {
		if (
			((this.$element = e(r)),
			"string" == typeof n && (n = i(n)),
			s ? "string" == typeof s && (s = i(s)) : (s = {}),
			"string" == typeof n)
		)
			n = n.replace(/\.\w*$/, "");
		else if ("object" == typeof n)
			for (var a in n)
				n.hasOwnProperty(a) && (n[a] = n[a].replace(/\.\w*$/, ""));
		(this.settings = e.extend({}, t, s)), (this.path = n);
		try {
			this.init();
		} catch (e) {
			if (e.message !== o) throw e;
		}
	}
	(r.prototype.init = function () {
		var t,
			i,
			r = this,
			n = r.path,
			s = n,
			a = "",
			d = r.$element,
			p = r.settings,
			c = (function (e) {
				var t,
					o,
					i,
					r = (e = "" + e).split(/\s+/),
					n = "50%",
					s = "50%";
				for (i = 0, t = r.length; i < t; i++)
					"left" === (o = r[i])
						? (n = "0%")
						: "right" === o
						? (n = "100%")
						: "top" === o
						? (s = "0%")
						: "bottom" === o
						? (s = "100%")
						: "center" === o
						? 0 === i
							? (n = "50%")
							: (s = "50%")
						: 0 === i
						? (n = o)
						: (s = o);
				return { x: n, y: s };
			})(p.position),
			u = p.posterType;
		(i = r.$wrapper = e("<div>")
			.addClass(p.className)
			.css({
				position: "absolute",
				"z-index": -1,
				top: 0,
				left: 0,
				bottom: 0,
				right: 0,
				overflow: "hidden",
				"-webkit-background-size": "cover",
				"-moz-background-size": "cover",
				"-o-background-size": "cover",
				"background-size": "cover",
				"background-color": p.bgColor,
				"background-repeat": "no-repeat",
				"background-position": c.x + " " + c.y,
			})),
			"object" == typeof n &&
				(n.poster
					? (s = n.poster)
					: n.mp4
					? (s = n.mp4)
					: n.webm
					? (s = n.webm)
					: n.ogv && (s = n.ogv)),
			"detect" === u
				? (function (t, o) {
						var i = function () {
							o(this.src);
						};
						e('<img src="' + t + '.gif">').on("load", i),
							e('<img src="' + t + '.jpg">').on("load", i),
							e('<img src="' + t + '.jpeg">').on("load", i),
							e('<img src="' + t + '.png">').on("load", i);
				  })(s, function (e) {
						i.css("background-image", "url(" + e + ")");
				  })
				: "none" !== u && i.css("background-image", "url(" + s + "." + u + ")"),
			"static" === d.css("position") && d.css("position", "relative"),
			d.prepend(i),
			"object" == typeof n
				? (n.mp4 && (a += '<source src="' + n.mp4 + '.mp4" type="video/mp4">'),
				  n.webm &&
						(a += '<source src="' + n.webm + '.webm" type="video/webm">'),
				  n.ogv && (a += '<source src="' + n.ogv + '.ogv" type="video/ogg">'),
				  (t = r.$video = e("<video>" + a + "</video>")))
				: (t = r.$video = e(
						'<video><source src="' +
							n +
							'.mp4" type="video/mp4"><source src="' +
							n +
							'.webm" type="video/webm"><source src="' +
							n +
							'.ogv" type="video/ogg"></video>'
				  ));
		try {
			t.prop({
				autoplay: p.autoplay,
				loop: p.loop,
				volume: p.volume,
				muted: p.muted,
				defaultMuted: p.muted,
				playbackRate: p.playbackRate,
				defaultPlaybackRate: p.playbackRate,
			});
		} catch (e) {
			throw new Error(o);
		}
		t
			.css({
				margin: "auto",
				position: "absolute",
				"z-index": -1,
				top: c.y,
				left: c.x,
				"-webkit-transform": "translate(-" + c.x + ", -" + c.y + ")",
				"-ms-transform": "translate(-" + c.x + ", -" + c.y + ")",
				"-moz-transform": "translate(-" + c.x + ", -" + c.y + ")",
				transform: "translate(-" + c.x + ", -" + c.y + ")",
				visibility: "hidden",
				opacity: 0,
			})
			.one("canplaythrough.vide", function () {
				r.resize();
			})
			.one("playing.vide", function () {
				t.css({ visibility: "visible", opacity: 1 }),
					i.css("background-image", "none");
			}),
			d.on("resize.vide", function () {
				p.resizing && r.resize();
			}),
			i.append(t);
	}),
		(r.prototype.getVideoObject = function () {
			return this.$video[0];
		}),
		(r.prototype.resize = function () {
			if (this.$video) {
				var e = this.$wrapper,
					t = this.$video,
					o = t[0],
					i = o.videoHeight,
					r = o.videoWidth,
					n = e.height(),
					s = e.width();
				s / r > n / i
					? t.css({ width: s + 2, height: "auto" })
					: t.css({ width: "auto", height: n + 2 });
			}
		}),
		(r.prototype.destroy = function () {
			delete e.vide.lookup[this.index],
				this.$video && this.$video.off("vide"),
				this.$element.off("vide").removeData("vide"),
				this.$wrapper.remove();
		}),
		(e.vide = { lookup: [] }),
		(e.fn.vide = function (t, o) {
			var i;
			return (
				this.each(function () {
					(i = e.data(this, "vide")) && i.destroy(),
						((i = new r(this, t, o)).index = e.vide.lookup.push(i) - 1),
						e.data(this, "vide", i);
				}),
				this
			);
		}),
		e(document).ready(function () {
			var t = e(window);
			t.on("resize.vide", function () {
				for (var t, o = e.vide.lookup.length, i = 0; i < o; i++)
					(t = e.vide.lookup[i]) && t.settings.resizing && t.resize();
			}),
				t.on("unload.vide", function () {
					return !1;
				}),
				e(document)
					.find("[data-vide-bg]")
					.each(function (t, o) {
						var i = e(o),
							r = i.data("vide-options"),
							n = i.data("vide-bg");
						i.vide(n, r);
					});
		});
});

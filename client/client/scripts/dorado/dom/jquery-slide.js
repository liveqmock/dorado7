/*
 * This file is part of Dorado 7.x (http://dorado7.bsdn.org).
 * 
 * Copyright (c) 2002-2012 BSTEK Corp. All rights reserved.
 * 
 * This file is dual-licensed under the AGPLv3 (http://www.gnu.org/licenses/agpl-3.0.html) 
 * and BSDN commercial (http://www.bsdn.org/licenses) licenses.
 * 
 * If you are unsure which license is appropriate for your use, please contact the sales department
 * at http://www.bstek.com/contact.
 */

(function() {
	// Commented by Benny
	// 下面这段扩展在jQuery 1.7.1下似乎导致动画不能播放

	//fix jquery bug.jQuery不能保证动画队列中的前一个complete一定会在下一个动画的step之前执行。
	/*
	 jQuery.extend({
	 speed: function( speed, easing, fn ) {
	 var opt = speed && typeof speed === "object" ? speed : {
	 complete: fn || !fn && easing ||
	 jQuery.isFunction( speed ) && speed,
	 duration: speed,
	 easing: fn && easing || easing && !jQuery.isFunction(easing) && easing
	 };

	 opt.duration = jQuery.fx.off ? 0 : typeof opt.duration === "number" ? opt.duration :
	 jQuery.fx.speeds[opt.duration] || jQuery.fx.speeds._default;

	 // Queueing
	 opt.old = opt.complete;
	 opt.complete = function() {
	 if ( jQuery.isFunction( opt.old ) ) {
	 opt.old.call( this );
	 }
	 if ( opt.queue !== false ) {
	 jQuery(this).dequeue();
	 }
	 };

	 return opt;
	 }
	 });
	 */

	if (jQuery.Tween) {
		var oldFn = jQuery.Tween.prototype.run;
		jQuery.Tween.prototype.run = function(percent) {
			this.state = percent;

			return oldFn.apply(this, arguments)
		};
	}

	jQuery.fn.region = function(){
		var self = this, element = self[0];
		if(self.length == 1){
			var position = self.offset(), width = element.offsetWidth, height = element.offsetHeight;
			return {
				top: position.top,
				right: position.left + width,
				left: position.left,
				bottom: position.top + height,
				height: height,
				width: width
			};
		}
	};

	jQuery.fn.innerRegion = function(){
		var el = this, element = el[0];
		if(el.length == 1){
			var position = el.offset(), width = el.width(), height = el.height(),
				borderTop = parseInt(el.css("border-left-width"), 10) || 0,
				borderLeft = parseInt(el.css("border-top-width"), 10) || 0,
				paddingLeft = parseInt(el.css("padding-left"), 10) || 0,
				paddingTop = parseInt(el.css("padding-top"), 10) || 0;

			//log.debug("paddingWidth:" + paddingLeft + "\tpaddingHeight:" + paddingTop
			//	+ "\tborderWidth:" + borderTop + "\tborderHeight:" + borderLeft);

			return {
				top: position.top + borderLeft + paddingTop,
				right: position.left + borderTop + paddingLeft + width,
				left: position.left + borderTop + paddingLeft,
				bottom: position.top + borderLeft + paddingTop + height,
				height: height,
				width: width
			};
		}
	};

	var propertyMap = {
		normal: ["position", "visibility", "left", "right", "top", "bottom", "width", "height", "zIndex"],
		safe: ["overflow", "position", "width", "height"],
		child: ["position", "left", "right", "top", "bottom", "width", "height"]
	}, DOCKABLE_STYLE_RESTORE = "dockStyleRestore", DOCK_DATA = "dockData";

	var backupStyle = function(element, type) {
		var props = propertyMap[type || "normal"], object = {};
		if (props) {
			for (var i = 0, j = props.length; i < j; i++) {
				var prop = props[i];
				object[prop] = element.style[prop];
			}
		}
		jQuery.data(element, DOCKABLE_STYLE_RESTORE, object);
	};

	var ratioMap = {top: 1, bottom: -1, left: 1, right: -1}, dockStyleMap = {
		top: { horizontal: "left", vertical: "top", style: {left: 0, top: 0, right: "auto", bottom: "auto"}},
		bottom: { horizontal: "left", vertical: "bottom", style: {left: 0, top: "auto", right: "auto", bottom: 0} },
		left: { horizontal: "left", vertical: "top", style: {left: 0, top: 0, right: "auto", bottom: "auto"} },
		right: { horizontal: "right", vertical: "top", style: {left: "auto", top: 0, right: 0, bottom: "auto"} }
	};

	jQuery.fn.dockable = function(direction, safe, showMask){
		var self = this;
		if (self.length == 1) {
			direction = direction || "bottom";

			var element = self[0], absolute = (self.css("position") == "absolute"),
				leftStart = absolute ? parseInt(self.css("left"), 10) || 0 : 0,
				topStart = absolute ? parseInt(self.css("top"), 10) || 0 : 0;

			backupStyle(element, safe ? "safe" : "normal");
			self.css({ visibility: "hidden", display: "block" });

			var dockConfig = dockStyleMap[direction], hori = dockConfig.horizontal, vert = dockConfig.vertical,
				rect = { width: self.outerWidth(), height: self.outerHeight() }, wrap, mask;

			if (safe) {
				var horiRatio = ratioMap[hori], vertRatio = ratioMap[vert], parentRegion = self.innerRegion(),
					child = element.firstChild, region, childStyle = {}, childEl;

				while (child) {
					childEl = jQuery(child);
					backupStyle(child, "child");
					region = childEl.region();

					childStyle[hori] = horiRatio * (region[hori] - parentRegion[hori]);
					childStyle[vert] = vertRatio * (region[vert] - parentRegion[vert]);
					childEl.css(childStyle).outerWidth(child.offsetWidth).outerHeight(child.offsetHeight);

					child = child.nextSibling;
				}

				if (absolute) {
					self.outerWidth(rect.width).outerHeight(rect.height).css({ overflow: "hidden", visibility: ""}).find("> *").css("position", "absolute");
				} else {
					self.css({ overflow: "hidden", position: "relative", visibility: "" }).find("> *").css("position", "absolute");
				}
			} else {
				wrap = document.createElement("div");
				var wrapEl = jQuery(wrap);
				if (absolute) {
					wrap.style.position = "absolute";
					wrap.style.left = self.css("left");
					wrap.style.top = self.css("top");
					wrapEl.bringToFront();
				} else {
					wrap.style.position = "relative";
					element.style.position = "absolute";
				}

				wrap.style.overflow = "hidden";
				wrapEl.insertBefore(element);
				wrap.appendChild(element);

				var style = dockConfig.style;
				style.visibility = "";
				self.css(style).outerWidth(rect.width).outerHeight(rect.height);
			}
			if (showMask !== false) {
				mask = document.createElement("div");
				var maskEl = jQuery(mask);
				//ie7下必须有背景色，否则无法盖住
				maskEl.css({ position: "absolute", left: 0, top: 0, background: "white", opacity: 0 })
					.bringToFront().outerWidth(rect.width).outerHeight(rect.height);

				if (safe) {
					element.appendChild(mask);
				} else {
					wrap.appendChild(mask);
				}
			}
			jQuery.data(element, DOCK_DATA, {
				rect: rect,
				mask: mask,
				wrap: wrap,
				leftStart: leftStart,
				topStart: topStart
			});
		}
		return this;
	};

	jQuery.fn.undockable = function(safe){
		var self = this;
		if (self.length == 1) {
			var element = self[0], dockData = jQuery.data(element, DOCK_DATA);
			//TODO 已知bug：在某些情况下，dockData为null，但是不清楚如何重现这个问题
			if (dockData == null) {
				return;
			}
			if (safe) {
				self.css(jQuery.data(element, DOCKABLE_STYLE_RESTORE)).find("> *").each(function(index, child){
					var style = jQuery.data(child, DOCKABLE_STYLE_RESTORE);
					if (style != null) {
						jQuery(child).css(style);
					}
					jQuery.data(child, DOCKABLE_STYLE_RESTORE, null);
				});
				jQuery(dockData.mask).remove();
			} else {
				var wrap = dockData.wrap;
				if (wrap) {
					self.css(jQuery.data(element, DOCKABLE_STYLE_RESTORE)).insertAfter(wrap);
					jQuery(wrap).remove();
				}
			}
			jQuery.data(element, DOCK_DATA, null);
			jQuery.data(element, DOCKABLE_STYLE_RESTORE, null);
		}

		return this;
	};

	var slideInDockDirMap = { l2r: "right", r2l: "left", t2b: "bottom", b2t: "top" },
		slideOutDockDirMap = { l2r: "left", r2l: "right", t2b: "top", b2t: "bottom" },
		slideSizeMap = { l2r: "height", r2l: "height", t2b: "width", b2t: "width" };

	var getAnimateConfig = function(type, direction, element, safe) {
		var dockData = jQuery.data(element, DOCK_DATA), rect = dockData.rect,
			leftStart = dockData.leftStart, topStart = dockData.topStart;

		if (safe) {
			if (type == "out") {
				switch (direction) {
					case "t2b":
						return { top: [topStart, topStart + rect.height], height: [rect.height, 0] };
					case "r2l":
						return { width: [rect.width, 0] };
					case "b2t":
						return { height: [rect.height, 0] };
					case "l2r":
						return { left: [leftStart, leftStart + rect.width], width: [rect.width, 0] };
				}
			} else {
				switch (direction) {
					case "t2b":
						return { height: [0, rect.height] };
					case "l2r":
						return { width: [0, rect.width] };
					case "b2t":
						return { top: [topStart + rect.height, topStart], height: [0, rect.height] };
					case "r2l":
						return { left: [leftStart + rect.width, leftStart], width: [0, rect.width] };
				}
			}
		} else {
			var property = slideSizeMap[direction];
			jQuery(dockData.wrap).css(property, dockData.rect[property]);
			if (type == "in") {
				switch (direction) {
					case "t2b":
						return { height: [0, rect.height] };
					case "l2r":
						return { width: [0, rect.width] };
					case "b2t":
						return { top: [topStart + rect.height, topStart], height: [0, rect.height] };
					case "r2l":
						return { left: [leftStart + rect.width, leftStart], width: [0, rect.width] };
				}
			} else if (type == "out") {
				switch (direction) {
					case "t2b":
						return { top: [topStart, topStart + rect.height], height: [rect.height, 0] };
					case "r2l":
						return { width: [rect.width, 0] };
					case "b2t":
						return { height: [rect.height, 0] };
					case "l2r":
						return { left: [leftStart, leftStart + rect.width], width: [rect.width, 0] };
				}
			}
		}
	};

	var slide = function(type, element, options, safe) {
		options = typeof options == "string" ? { direction: options } : options || {};
		var direction = options.direction || "t2b", callback = options.complete, step = options.step,
			start = options.start, animConfig, animElement = element, animEl, delayFunc, inited = false;

		delayFunc = function(direction) {
			if (start) {
				if (type == "in") $fly(element).css("display", "");
				start.call(element);
			}

			$fly(element).dockable(type == "in" ? slideInDockDirMap[direction] : slideOutDockDirMap[direction], safe);

			animConfig = getAnimateConfig(type, direction, element, safe);
			animEl = jQuery(safe ? animElement : jQuery.data(element, DOCK_DATA).wrap);
			for (var prop in animConfig) {
				var value = animConfig[prop];
				animEl.css(prop, value[0]);
			}

			inited = true;
		};

		options.step = function(now, animate) {
			if (!inited) {
				delayFunc(direction);
			}

			var defaultEasing = animate.options.easing || (jQuery.easing.swing ? "swing" : "linear"),
				pos = jQuery.easing[defaultEasing](animate.state, animate.options.duration * animate.state, 0, 1, animate.options.duration);

			var nowStyle = {};

			for(var prop in animConfig){
				var range = animConfig[prop];
				nowStyle[prop] = Math.round(range[0] + (range[1] - range[0]) * pos);
			}

			animEl.css(nowStyle);

			if (step) {
				step.call(animate.elem, nowStyle, animate);
			}
		};

		options.complete = function() {
			$fly(element).undockable(safe);
			$fly(element).css("display", type == "out" ? "none" : "");
			if (typeof callback == "function") {
				callback.apply(null, []);
			}
		};
		options.duration =  options.duration ? options.duration : 300;

		$fly(element).animate({
			dummy: 1
		}, options);
	};

	/**
	 * @name jQuery#slideIn
	 * @function
	 * @description 类似slideDown与slideUp，区别在于这个动画不会真正的去改变动画元素的width和height属性，页面效果看起来更美观。
	 * <p>
	 * 目前FloatControl及其子组件均使用了此动画。
	 * 如果参数为字符串，则表示为direction，不能传入其他参数。如果为json，则根据options中的规则获取配置信息。
	 * </p>
	 * @param {Object} options Json类型的参数。
	 * @param {String} options.direction 要滑动的方向，可选的是t2b、b2t、l2r、r2l。意义分别是从上到下、从下到上、从左到右、从右到左。默认值为t2b。
	 * @param {Function} options.complete 完成后要调用的回调函数。
	 * @param {int} options.duration 动画执行的时间，单位为毫秒。
	 * @param {String} options.easing 是用哪个easing function.
	 * @param {Function} options.step 每步动画完成以后调用的回调函数。
	 * @return {jQuery} 调用此方法的jQuery对象自身。
	 */
	jQuery.fn.slideIn = function(options) {
		var self = this;
		if (self.length == 1) {
			slide("in", self[0], options, false);
		}
		return this;
	};

	/**
	 * @name jQuery#slideOut
	 * @function
	 * @description 类似slideDown与slideUp，区别在于这个动画不会真正的去改变动画元素的width和height属性，页面效果看起来更美观。
	 * <p>
	 * 目前FloatControl以及其子组件使用了此动画。
	 * 如果参数为字符串，则表示为direction，不能传入其他参数。如果为json，则根据options中的规则获取配置信息。
	 * </p>
	 *  @param {Object} options Json类型的参数。
	 * @param {String} options.direction 要滑动的方向，可选的是t2b、b2t、l2r、r2l。意义分别是从上到下、从下到上、从左到右、从右到左。默认值为t2b。
	 * @param {Function} options.complete 完成后要调用的回调函数。
	 * @param {int} options.duration 动画执行的时间，单位为毫秒。
	 * @param {String} options.easing 是用哪个easing function.
	 * @param {Function} options.step 每步动画完成以后调用的回调函数。
	 * @return {jQuery} 调用此方法的jQuery对象自身。
	 */
	jQuery.fn.slideOut = function(options) {
		var self = this;
		if (self.length == 1) {
			slide("out", self[0], options, false);
		}
		return this;
	};

	/**
	 * @name jQuery#safeSlideIn
	 * @function
	 * @param options
	 * @return {jQuery} 调用此方法的jQuery对象自身。
	 * @description 安全滑入动画效果。
	 * 与slideIn的区别在于该动画不会挪动dom元素的位置，可以避免iframe的刷新(非IE浏览器)、滚动条的复位等问题。
	 */
	jQuery.fn.safeSlideIn = function(options){
		var self = this;
		if (self.length == 1) {
			slide("in", self[0], options, true);
		}
		return this;
	};


	/**
	 * @name jQuery#safeSlideOut
	 * @function
	 * @param options
	 * @return {jQuery} 调用此方法的jQuery对象自身。
	 * @description 安全滑出动画。
	 * 与slideOut的区别在于该动画不会挪动dom元素的位置，可以避免iframe的刷新(非IE浏览器)、滚动条的复位等问题。
	 */
	jQuery.fn.safeSlideOut = function(options){
		var self = this;
		if (self.length == 1) {
			slide("out", self[0], options, true);
		}
		return this;
	};

	var zoomCoverPool = new dorado.util.ObjectPool({
		makeObject: function() {
			var cover = document.createElement("div");
			cover.className = "i-animate-zoom-proxy d-animate-zoom-proxy";
			jQuery(document.body).append(cover);

			return cover;
		}
	});

	var zoom = function(type, element, options) {
		var position = options.position, animTarget = options.animateTarget,
			startLeft, startTop, endLeft, endTop, offset, isTypeIn = (type != "out"), elWidth, elHeight;

		if (position) {
			var oldLeft = element.style.left, oldTop = element.style.top;
			position = $fly(element).css(position).offset();
			$fly(element).css({ "left": oldLeft || "", "top": oldTop || "" });
		}

		if (typeof animTarget == "string") {
			animTarget = jQuery(animTarget)[0];
		} else if(animTarget instanceof dorado.widget.Control){
			animTarget = animTarget._dom;
		}
		var elementEl = jQuery(element), animTargetEl = jQuery(animTarget);
		if (type == "in") {
			if (animTarget) {
				offset = animTargetEl.offset();

				startTop = offset.top;
				startLeft = offset.left;
				endTop = position.top;
				endLeft = position.left;
			} else {
				offset = elementEl.offset();
				elWidth = elementEl.outerWidth();
				elHeight = elementEl.outerHeight();

				startTop = offset.top + elHeight / 2;
				startLeft = offset.left + elWidth / 2;
				endTop = position.top;
				endLeft = position.left;
			}
		} else {
			if (animTarget) {
				offset = animTargetEl.offset();
				if (!position) {
					position = elementEl.offset();
				}
				startTop = position.top;
				startLeft = position.left;
				endTop = offset.top;
				endLeft = offset.left;
			} else {
				offset = elementEl.offset();
				elWidth = elementEl.outerWidth();
				elHeight = elementEl.outerHeight();

				startTop = offset.top;
				startLeft = offset.left;
				endTop = offset.top + elHeight / 2;
				endLeft = offset.left + elWidth / 2;
			}
		}

		var cover = zoomCoverPool.borrowObject();

		jQuery(cover).css({
			display: "",
			top: startTop,
			left: startLeft,
			width: isTypeIn ? 0 : elementEl.width(),
			height: isTypeIn ? 0 : elementEl.height()
		}).bringToFront().animate({
				top: endTop,
				left: endLeft,
				width: isTypeIn ? elementEl.width() : 0,
				height: isTypeIn ? elementEl.height() : 0
			}, {
				duration: options.animateDuration || 300,
				easing: options.animateEasing,
				complete: function() {
					cover.style.display = "none";
					zoomCoverPool.returnObject(cover);
					options.complete.apply(null, []);
				}
			});
	};

	jQuery.fn.zoomIn = function(options) {
		var self = this;
		if (self.length == 1) {
			zoom("in", self[0], options);
		}
		return this;
	};

	jQuery.fn.zoomOut = function(options) {
		var self = this;
		if (self.length == 1) {
			zoom("out", self[0], options);
		}
		return this;
	};

	var isFunction = function (value) {
		return ({}).toString.call(value) == "[object Function]";
	};

	var vendor = (/webkit/i).test(navigator.appVersion) ? 'webkit' :
			(/firefox/i).test(navigator.userAgent) ? 'moz' :
				(/trident/i).test(navigator.userAgent) ? 'ms' :
					'opera' in window ? 'o' : '', cssVendor = "-" + vendor + "-",
		TRANSITION = cssVendor + "transition", TRANSFORM = cssVendor + "transform",
		TRANSFORMORIGIN = cssVendor + "transform-origin", BACKFACEVISIBILITY = cssVendor + "backface-visibility";

	var transitionEnd = "transitionEnd";
	if (jQuery.browser.webkit) {
		transitionEnd = "webkitTransitionEnd";
	} else if (jQuery.browser.msie) {
		transitionEnd = "msTransitionEnd";
	} else if (jQuery.browser.mozilla) {
		transitionEnd = "transitionend";
	} else if (jQuery.browser.opera) {
		transitionEnd = "oTransitionEnd";
	}

	jQuery.fn.anim = function(properties, duration, ease, callback){
		var transforms = [], opacity, key, callbackCalled = false;
		for (key in properties)
			if (key === 'opacity') opacity = properties[key];
			else transforms.push(key + '(' + properties[key] + ')');

		var invokeCallback = function() {
			if (!callbackCalled) {
				callback();
				callbackCalled = true;
			}
		};

		if (parseFloat(duration) !== 0 && isFunction(callback)) {
			this.one(transitionEnd, invokeCallback);
			setTimeout(invokeCallback, duration * 1000 + 50);
		} else {
			setTimeout(callback, 0);
		}

		return this.css({ opacity: opacity }).css(TRANSITION, 'all ' + (duration !== undefined ? duration : 0.5) + 's ' + (ease || '')).css(TRANSFORM, transforms.join(' '));
	};

	var modernZoom = function(type, el, options) {
		if (!el) return;
		options = options || {};

		var position = options.position, animTarget = options.animateTarget,
			startLeft, startTop, endLeft, endTop, offset;

		if (typeof animTarget == "string") {
			animTarget = jQuery(animTarget)[0];
		} else if(animTarget instanceof dorado.widget.Control){
			animTarget = animTarget._dom;
		}
		var elementEl = jQuery(el), animTargetEl = jQuery(animTarget);
		if (type == "in") {
			if (animTarget) {
				offset = animTargetEl.offset();

				startTop = offset.top;
				startLeft = offset.left;
				endTop = position.top;
				endLeft = position.left;
			}
		} else {
			if (animTarget) {
				offset = animTargetEl.offset();
				if (!position) {
					position = elementEl.offset();
				}
				startTop = position.top;
				startLeft = position.left;
				endTop = offset.top;
				endLeft = offset.left;
			}
		}

		var fromScale = 1,
			toScale = 1;

		if (type == "out") {
			toScale = 0.01;
		} else {
			fromScale = 0.01;
		}

		if (animTarget) {
			$(el).css({
				left: startLeft,
				top: startTop
			}).css(TRANSFORM, 'scale(' + fromScale + ')').css(TRANSFORMORIGIN, '0 0');
		} else {
			$(el).css(TRANSFORM, 'scale(' + fromScale + ')').css(TRANSFORMORIGIN, '50% 50%');
		}

		var callback = function() {
			if (options.complete) {
				options.complete.apply(null, []);
			}
			$(el).css(TRANSITION, "").css(TRANSFORMORIGIN, "").css(TRANSFORM, "");
		};
		if (animTarget) {
			setTimeout(function() {
				$(el).anim({}, options.animateDuration ? options.animateDuration / 1000 : .3, "ease-in-out", callback).css({
					left: endLeft,
					top: endTop
				}).css(TRANSFORM, 'scale(' + toScale + ')').css(TRANSFORMORIGIN, '0 0');
			}, 5);
		} else {
			setTimeout(function() {
				$(el).anim({}, options.animateDuration ? options.animateDuration / 1000 : .3, "ease-in-out", callback)
					.css(TRANSFORM, 'scale(' + toScale + ')').css(TRANSFORMORIGIN, '50% 50%');
			}, 5);
		}
	};

	var flip = function(type, el, options) {
		if (!el) return;
		options = options || {};
		var callback = function() {
			if (options.complete) {
				options.complete.apply(null, []);
			}
			$(el).css(TRANSITION, "").css(TRANSFORMORIGIN, "").css(TRANSFORM, "").css(BACKFACEVISIBILITY, "");
		};

		var rotateProp = 'Y',
			fromScale = 1,
			toScale = 1,
			fromRotate = 0,
			toRotate = 0;

		if (type == "out") {
			toRotate = -180;
			toScale = 0.8;
		} else {
			fromRotate = 180;
			fromScale = 0.8;
		}

		if (options.direction == 'up' || options.direction == 'down') {
			rotateProp = 'X';
		}

		if (options.direction == 'right' || options.direction == 'left') {
			toRotate *= -1;
			fromRotate *= -1;
		}

		$(el).css(TRANSFORM, 'rotate' + rotateProp + '(' + fromRotate + 'deg) scale(' + fromScale + ')').css(BACKFACEVISIBILITY, 'hidden');

		setTimeout(function() {
			$(el).anim({}, options.animateDuration ? options.animateDuration / 1000 : .3, "linear", callback).
				css(TRANSFORM, 'rotate' + rotateProp + '(' + toRotate + 'deg) scale(' + toScale + ')').css(BACKFACEVISIBILITY, 'hidden');
		}, 5);
	};

	jQuery.fn.modernZoomIn = function(options) {
		var self = this;
		if (self.length == 1) {
			modernZoom("in", self[0], options);
		}
		return this;
	};

	jQuery.fn.modernZoomOut = function(options) {
		var self = this;
		if (self.length == 1) {
			modernZoom("out", self[0], options);
		}
		return this;
	};

	jQuery.fn.flipIn = function(options) {
		var self = this;
		if (self.length == 1) {
			options.direction = "left";
			flip("in", self[0], options);
		}
		return this;
	};

	jQuery.fn.flipOut = function(options) {
		var self = this;
		if (self.length == 1) {
			options.direction = "right";
			flip("out", self[0], options);
		}
		return this;
	};

	var getWin = function(elem) {
		return (elem && ('scrollTo' in elem) && elem['document']) ?
			elem :
			elem && elem.nodeType === 9 ?
				elem.defaultView || elem.parentWindow :
				elem === undefined ?
					window : false;
	}, SCROLL_TO = "scrollTo", DOCUMENT = "document";

	jQuery.fn.scrollIntoView = function(container, top, hscroll) {
		var self = this, elem;
		if (self.length == 1) {
			elem = self[0];
		}

		container = typeof container == "string" ? jQuery(container)[0] : container;
		hscroll = hscroll === undefined ? true : !!hscroll;
		top = top === undefined ? true : !!top;

		// default current window, use native for scrollIntoView(elem, top)
		if (!container || container === window) {
			// 注意：
			// 1. Opera 不支持 top 参数
			// 2. 当 container 已经在视窗中时，也会重新定位
			return elem.scrollIntoView(top);
		}

		// document 归一化到 window
		if (container && container.nodeType == 9) {
			container = getWin(container);
		}

		var isWin = container && (SCROLL_TO in container) && container[DOCUMENT],
			elemOffset = self.offset(),
			containerOffset = isWin ? {
				left: jQuery(container).scrollLeft(),
				top: jQuery(container).scrollTop() }
				: jQuery(container).offset(),

		// elem 相对 container 视窗的坐标
			diff = {
				left: elemOffset["left"] - containerOffset["left"],
				top: elemOffset["top"] - containerOffset["top"]
			},

		// container 视窗的高宽
			ch = isWin ? jQuery(window).height() : container.clientHeight,
			cw = isWin ? jQuery(window).width() : container.clientWidth,

		// container 视窗相对 container 元素的坐标
			cl = jQuery(container).scrollLeft(),
			ct = jQuery(container).scrollTop(),
			cr = cl + cw,
			cb = ct + ch,

		// elem 的高宽
			eh = elem.offsetHeight,
			ew = elem.offsetWidth,

		// elem 相对 container 元素的坐标
		// 注：diff.left 含 border, cl 也含 border, 因此要减去一个
			l = diff.left + cl - (parseInt(jQuery(container).css('borderLeftWidth')) || 0),
			t = diff.top + ct - (parseInt(jQuery(container).css('borderTopWidth')) || 0),
			r = l + ew,
			b = t + eh,

			t2, l2;

		// 根据情况将 elem 定位到 container 视窗中
		// 1. 当 eh > ch 时，优先显示 elem 的顶部，对用户来说，这样更合理
		// 2. 当 t < ct 时，elem 在 container 视窗上方，优先顶部对齐
		// 3. 当 b > cb 时，elem 在 container 视窗下方，优先底部对齐
		// 4. 其它情况下，elem 已经在 container 视窗中，无需任何操作
		if (eh > ch || t < ct || top) {
			t2 = t;
		} else if (b > cb) {
			t2 = b - ch;
		}

		// 水平方向与上面同理
		if (hscroll) {
			if (ew > cw || l < cl || top) {
				l2 = l;
			} else if (r > cr) {
				l2 = r - cw;
			}
		}

		// go
		if (isWin) {
			if (t2 !== undefined || l2 !== undefined) {
				container[SCROLL_TO](l2, t2);
			}
		} else {
			if (t2 !== undefined) {
				container["scrollTop"] = t2;
			}
			if (l2 !== undefined) {
				container["scrollLeft"] = l2;
			}
		}
	};
})();

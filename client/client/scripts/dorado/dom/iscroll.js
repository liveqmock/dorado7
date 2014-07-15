/*!
 * iScroll v4.1.9 ~ Copyright (c) 2011 Matteo Spinelli, http://cubiq.org
 * Released under MIT license, http://cubiq.org/license
 */
(function () {
	var mround = function (r) { return r >> 0; }, vendor = (/webkit/i).test(navigator.appVersion) ? 'webkit' : (/firefox/i).test(navigator.userAgent) ? 'Moz' : (/trident/i).test(navigator.userAgent) ? 'ms' : 'opera' in window ? 'O' : '',
		isAndroid = (/android/gi).test(navigator.appVersion), isIDevice = (/iphone|ipad/gi).test(navigator.appVersion),isTouchPad = (/hp-tablet/gi).test(navigator.appVersion),

		has3d = 'WebKitCSSMatrix' in window && 'm11' in new WebKitCSSMatrix(), hasTouch = 'ontouchstart' in window && !isTouchPad,
		hasTransform = vendor + 'Transform' in document.documentElement.style, hasTransitionEnd = ("on" + vendor == 'Moz' ? '' : vendor + "transitionend") in window,
		transitionEndEvent = (vendor != 'Moz' ? vendor + "T" : "t") + "ransitionEnd",


		nextFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame
			            || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function (callback) { return setTimeout(callback, 1); },

		cancelFrame = window.cancelRequestAnimationFrame || window.webkitCancelAnimationFrame || window.webkitCancelRequestAnimationFrame
			              || window.mozCancelRequestAnimationFrame || window.oCancelRequestAnimationFrame || window.msCancelRequestAnimationFrame || clearTimeout,

	// Events
		START_EV = hasTouch ? 'touchstart' : 'mousedown', MOVE_EV = hasTouch ? 'touchmove' : 'mousemove', END_EV = hasTouch ? 'touchend' : 'mouseup',
		RESIZE_EV = 'onorientationchange' in window ? 'orientationchange' : 'resize', CANCEL_EV = hasTouch ? 'touchcancel' : 'mouseup', WHEEL_EV = vendor == 'Moz' ? 'DOMMouseScroll' : 'mousewheel',

		trnOpen = 'translate' + (has3d ? '3d(' : '('), trnClose = has3d ? ',0)' : ')';

	var RE_DEFAULT_UNIT = /^width|height|top|right|bottom|left|margin.*|padding.*|border-.*$/i, DEFAULT_UNIT = "px";

	var VENDOR_PROPERTY = /^transition|transitionProperty|transitionDuration|transformOrigin|transitionTimingFunction|transform|backgroundClip|boxSizing|borderRadius|transitionDelay$/i;

	var toCamel = function(string){
		return string.replace(/(-\S)/g, function($1){
			return $1.toUpperCase().substring(1, 2);
		});
	};

	var setStyle = vendor == 'ms' ? function(element, styleName, styleValue) {
		if (!element || !styleName) return false;
		if (typeof styleName !== "string") {
			for (var property in styleName) {
				if (!(element && element.nodeType == 1)) {
					return;
				}
				setStyle(element, property, styleName[property]);
			}
			return;
		}
		styleName = toCamel(styleName);
		switch (styleName) {
			case 'opacity':
				element.style["filter"] = "alpha(opacity=" + styleValue * 100 + ")";
				break;
			case "float":
				element.style["styleFloat"] = styleValue;
				break;
			default:
				try {
					if (typeof styleValue == "number" && RE_DEFAULT_UNIT.test(styleName)) {
						styleValue += DEFAULT_UNIT;
					}
					element.style[styleName] = styleValue;
					if (VENDOR_PROPERTY.test(styleName)) {
						styleName = vendor + styleName[0].toUpperCase() + styleName.substr(1);
						element.style[styleName] = styleValue;
					}
				} catch(e) {
				}
		}
	} : function(element, styleName, styleValue) {
		if (!element || !styleName) return false;
		if (typeof styleName !== "string") {
			for (var property in styleName) {
				if (!(element && element.nodeType == 1)) {
					return;
				}
				setStyle(element, property, styleName[property]);
			}
			return;
		}
		styleName = toCamel(styleName);
		switch (styleName) {
			case "float":
				element.style["cssFloat"] = styleValue;
				break;
			default:
				try {
					if (typeof styleValue == "number" && RE_DEFAULT_UNIT.test(styleName)) {
						styleValue += DEFAULT_UNIT;
					}
					element.style[styleName] = styleValue;
					if (VENDOR_PROPERTY.test(styleName)) {
						styleName = vendor + styleName[0].toUpperCase() + styleName.substr(1);
						element.style[styleName] = styleValue;
					}
				} catch(e) {
				}
		}
	};

	var scrollbarProperMap = { 'hori': "horiBar", 'vert': "vertBar" }, directionMap = { "vert": "v", "hori": "h" };

	var merge = function(target, source) {
		if (!target || !source) return;
		for (var prop in source) {
			target[prop] = source[prop];
		}
	};

	var iScroll = function (el, options) {
		var scroll = this, doc = document, i;

		scroll.element = typeof el == 'object' ? el : doc.getElementById(el);
		scroll.element.style.overflow = 'hidden';
		//scroll.scrollTarget = scroll.element.children[0];

		// Default options
		scroll.options = {
			direction: 'auto',//'auto', 'vertical', 'horizontal', or 'both'
			x: 0,
			y: 0,
			bounce: true,
			bounceLock: false,
			momentum: true,
			lockDirection: true,
			useTransform: true,
			useTransition: false,
			topOffset: 0,
			bottomOffset: 0,

			// Scrollbar
			showHoriScrollbar: true,
			showVertScrollbar: true,
			fixedScrollbar: isAndroid,
			hideScrollbar: isIDevice,
			fadeScrollbar: isIDevice && has3d,
			scrollbarClass: '',
			wheelAction: 'scroll',

			// Events
			onRefresh: null,
			onBeforeScrollStart: function (event) {
				event.preventDefault();
			},
			onScrollStart: null,
			onBeforeScrollMove: null,
			onScrollMove: null,
			onScrolling: null,
			onBeforeScrollEnd: null,
			onScrollEnd: null,
			onTouchEnd: null,
			onDestroy: null
		};

		// User defined options
		for (i in options) scroll.options[i] = options[i];

		if (options.scrollSize) {
			scroll.scrollSize = options.scrollSize;
		}

		if (options.viewportSize) {
			scroll.viewportSize = options.viewportSize;
		}

		if (options.resumeHelper) {
			scroll.resumeHelper = options.resumeHelper;
		}

		// Set starting position
		scroll.x = scroll.options.x;
		scroll.y = scroll.options.y;

		// Normalize options
		//hScroll: true, vScroll: true
		scroll.options.horiScrollEnable = scroll.options.direction != "vertical";
		scroll.options.vertScrollEnable = scroll.options.direction != "horizontal";
		scroll.horiBar = {};
		scroll.vertBar = {};

		scroll.options.useTransform = hasTransform ? scroll.options.useTransform : false;
		scroll.options.showHoriScrollbar = scroll.options.horiScrollEnable && scroll.options.showHoriScrollbar;
		scroll.options.showVertScrollbar = scroll.options.vertScrollEnable && scroll.options.showVertScrollbar;
		scroll.options.useTransition = hasTransitionEnd && scroll.options.useTransition;

		// Set some default styles
		var styles = { 'transition-property': scroll.options.useTransform ? '-' + vendor.toLowerCase() + '-transform' : 'top left', 'transition-duration': 0, 'transform-origin': '0 0' };
		if (scroll.scrollTarget) setStyle(scroll.scrollTarget, styles);
		if (scroll.options.useTransition) styles['transition-timing-function'] = 'cubic-bezier(0.33,0.66,0.66,1)';

		if (scroll.options.useTransform)
			styles['transform'] = trnOpen + scroll.x + 'px,' + scroll.y + 'px' + trnClose;
		else if (scroll.options.notMoveElement) {
		} else
			merge(styles, { position: "absolute", top: scroll.y, left: scroll.x });

		if (scroll.options.useTransition) scroll.options.fixedScrollbar = true;

		scroll.updateChildrenStyle(styles);

		scroll.refresh();

		scroll._bind(RESIZE_EV, window);
		scroll._bind(START_EV);
		if (!hasTouch) {
			scroll._bind('mouseout', scroll.element);
			if (scroll.options.wheelAction != 'none')
				scroll._bind(WHEEL_EV);
		}
	};

	iScroll.prototype = {
		enabled: true,
		x: 0,
		y: 0,
		steps: [],
		aniTime: null,
		wheelZoomCount: 0,

		updateChildrenStyle: function(prop, value) {
			var scroll = this, children = scroll.element.children;

			for (var i = 0, l = children.length; i < l; i++) {
				var child = children[i];
				if (child.nodeType == 3 || child.className.indexOf("ignored") != -1 || child.className.indexOf("scroll-bar") != -1) continue;
				setStyle(child, prop, value);
			}
		},

		getChildrenTransform: function() {
			var scroll = this, children = scroll.element.children, result = [];

			for (var i = 0, l = children.length; i < l; i++) {
				var child = children[i];
				if (child.nodeType == 3 || child.className.indexOf("ignored") != -1 || child.className.indexOf("scroll-bar") != -1) continue;
				result.push({
					element: child,
					value: child.style[vendor + "Transform"] || child.style["transform"]
				});
			}

			return result;
		},

		handleEvent: function (event) {
			var scroll = this;
			switch (event.type) {
				case START_EV:
					if (scroll.checkInputs(event.target.tagName)) {
						return;
					}
					if (!hasTouch && event.button !== 0) return;
					scroll._start(event);
					break;
				case MOVE_EV:
					scroll._move(event);
					break;
				case END_EV:
				case CANCEL_EV:
					scroll._end(event);
					break;
				case RESIZE_EV:
					scroll._resize();
					break;
				case WHEEL_EV:
					scroll._wheel(event);
					break;
				case 'mouseout':
					scroll._mouseout(event);
					break;
				case transitionEndEvent:
					scroll._transitionEnd(event);
					break;
			}
		},

		checkInputs: function(tagName) {
			if (tagName === 'INPUT' || tagName === 'TEXTFIELD' || tagName === 'TEXTAREA' || tagName === 'SELECT') {
				return true;
			} else {
				return false;
			}
		},

		_refreshScrollbar: function (direction) {
			var scroll = this, doc = document, dom, bar = scroll[scrollbarProperMap[direction]];

			if (!scroll[direction + 'ScrollEnable']) {
				if (bar.wrapper) {
					if (hasTransform) setStyle(bar.indicator, 'transform', '');
					bar.wrapper.parentNode.removeChild(bar.wrapper);
					bar.wrapper = null;
					bar.indicator = null;
				}

				return;
			}

			if (!bar.wrapper) {
				// Create the scrollbar element
				dom = doc.createElement('div');

				if (scroll.options.scrollbarClass)
					dom.className = scroll.options.scrollbarClass + directionMap[direction].toUpperCase();
				else {
					if (direction == 'hori') {
						setStyle(dom, { position: "absolute", 'z-index': 100, height: '7px', bottom: '1px', left: '2px', right: (scroll.showVertScrollbar ? '7' : '2') + 'px'});
					} else {
						setStyle(dom, { position: "absolute", 'z-index': 100, width: '7px', top: '2px', right: '1px', bottom: (scroll.showHoriScrollbar ? '7' : '2')  + 'px'});
					}
				}

				dom.className += " scroll-bar";

				setStyle(dom, { 'pointer-events': "none",  'transition-property': "opacity", 'transition-duration': (scroll.options.fadeScrollbar ? '350ms' : '0'), 'overflow': "hidden", opacity: (scroll.options.hideScrollbar ? '0' : '1') });

				scroll.element.appendChild(dom);
				bar.wrapper = dom;

				// Create the scrollbar indicator
				dom = doc.createElement('div');
				if (!scroll.options.scrollbarClass) {
					setStyle(dom, { position: "absolute", 'z-index': 100, background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.9)', 'background-clip': 'padding-box', 'box-sizing': 'border-box', 'border-radius': '3px' });
					direction == 'hori' ? setStyle(dom, "height", "100%") : setStyle(dom, "width", "100%");
				}

				setStyle(dom, {
					'posinter-events': "none",
					'transition-property': '-' + vendor.toLowerCase() + '-transform',
					'transition-timing-function': 'cubic-bezier(0.33,0.66,0.66,1)',
					'transition-duration': 0,
					transform: trnOpen + '0,0' + trnClose
				});

				if (scroll.options.useTransition)
					setStyle(dom, { 'transition-timing-function': "cubic-bezier(0.33,0.66,0.66,1)" });

				bar.wrapper.appendChild(dom);
				bar.indicator = dom;
			}

			if (direction == 'hori') {
				bar.size = bar.wrapper.clientWidth;
				bar.indicatorSize = Math.max(mround(bar.size * bar.size / scroll.scrollTargetWidth), 8);
				bar.indicator.style.width = bar.indicatorSize + 'px';
				bar.maxScroll = bar.size - bar.indicatorSize;
				bar.prop = bar.maxScroll / scroll.maxScrollX;
			} else {
				bar.size = bar.wrapper.clientHeight;
				bar.indicatorSize = Math.max(mround(bar.size * bar.size / scroll.scrollTargetHeight), 8);
				bar.indicator.style.height = bar.indicatorSize + 'px';
				bar.maxScroll = bar.size - bar.indicatorSize;
				bar.prop = bar.maxScroll / scroll.maxScrollY;
			}

			// Reset position
			scroll._refreshScrollbarDom(direction, true);
		},

		_refreshScrollbarDom: function (direction, hidden) {
			var scroll = this, position = direction == 'hori' ? scroll.x : scroll.y, size, scrollbarMap = { hori: "showHoriScrollbar", vert: "showVertScrollbar" };

			if (!scroll[scrollbarMap[direction]]) return;

			var bar = scroll[scrollbarProperMap[direction]];

			position = bar.prop * position;

			if (position < 0) {
				if (!scroll.options.fixedScrollbar) {
					size = bar.indicatorSize + mround(position * 3);
					if (size < 8) size = 8;
					bar.indicator.style[direction == 'hori' ? 'width' : 'height'] = size + 'px';
				}
				position = 0;
			} else if (position > bar.maxScroll) {
				if (!scroll.options.fixedScrollbar) {
					size = bar.indicatorSize - mround((position - bar.maxScroll) * 3);
					if (size < 8) size = 8;
					bar.indicator.style[direction == 'hori' ? 'width' : 'height'] = size + 'px';
					position = bar.maxScroll + (bar.indicatorSize - size);
				} else {
					position = bar.maxScroll;
				}
			}

			setStyle(bar.wrapper, { 'transition-delay': 0,  opacity: hidden && scroll.options.hideScrollbar ? '0' : '1' });
			setStyle(bar.indicator, 'transform', trnOpen + (direction == 'hori' ? position + 'px, 0' : '0, ' + position + 'px') + trnClose)
		},

		_resize: function () {
			var scroll = this;
			setTimeout(function () { scroll.refresh(); }, isAndroid ? 200 : 0);
		},

		_pos: function (x, y) {
			x = this.horiScrollEnable ? x : 0;
			y = this.vertScrollEnable ? y : 0;

			if (this.options.useTransform) {
				this.updateChildrenStyle('transform', trnOpen + x + 'px,' + y + 'px' + trnClose);
			} else if (this.options.notMoveElement) {
				x = mround(x);
				y = mround(y);
			} else {
				x = mround(x);
				y = mround(y);
				this.updateChildrenStyle({
					left: x + 'px',
					top: y + 'px'
				});
			}

			this.x = x;
			this.y = y;

			this._refreshScrollbarDom('hori');
			this._refreshScrollbarDom('vert');

			if (this.options.notMoveElement && this.vertBar.wrapper) {
				this.vertBar.wrapper.style["height"] = this.element.clientHeight + "px";
				//this.vertBar.wrapper.style["top"] = this.element.scrollTop + "px";
				this.vertBar.wrapper.style["bottom"] = "";
			}
		},

		_start: function (event) {
			var scroll = this, point = hasTouch ? event.touches[0] : event, matrix, x, y;
			if (point.target.nodeName.toLowerCase() == "input") {
				return;
			}
			if (!scroll.enabled) return;

			if (scroll.options.onBeforeScrollStart) scroll.options.onBeforeScrollStart.call(scroll, event);

			if (scroll.options.useTransition) scroll._transitionTime(0);

			scroll.moved = false;
			scroll.animating = false;
			scroll.distX = 0;
			scroll.distY = 0;
			scroll.absDistX = 0;
			scroll.absDistY = 0;
			scroll.movingX = 0;
			scroll.movingY = 0;

			var firstChild = scroll.element.firstChild;

			while(firstChild && firstChild.nodeType != 1) {
				firstChild = firstChild.nextSibling;
			}

			if (scroll.options.momentum && firstChild) {
				if (scroll.options.useTransform) {
					// Very lame general purpose alternative to CSSMatrix
					matrix = getComputedStyle(firstChild, null)[vendor + 'Transform'].replace(/[^0-9-.,]/g, '').split(',');
					x = matrix[4] * 1;
					y = matrix[5] * 1;
					if (isNaN(x)) x = 0;
					if (isNaN(y)) y = 0;
				} else if (scroll.options.notMoveElement) {
					if (scroll.resumeHelper) {
						var pos = scroll.resumeHelper();
						//console.log("x:" + pos.x + "\ty:" + pos.y);
						x = pos.x;
						y = pos.y;
					}
				} else {
					x = getComputedStyle(firstChild, null).left.replace(/[^0-9-]/g, '') * 1;
					y = getComputedStyle(firstChild, null).top.replace(/[^0-9-]/g, '') * 1;
				}

				if (x != scroll.x || y != scroll.y) {
					if (scroll.options.useTransition) scroll._unbind(transitionEndEvent);
					else cancelFrame(scroll.aniTime);
					scroll.steps = [];
					scroll._pos(x, y);
				}
			}

			scroll.startX = scroll.x;
			scroll.startY = scroll.y;
			scroll.pointX = point.pageX;
			scroll.pointY = point.pageY;

			scroll.startTime = event.timeStamp || Date.now();

			if (scroll.options.onScrollStart) scroll.options.onScrollStart.call(scroll, event);

			scroll._bind(MOVE_EV);
			scroll._bind(END_EV);
			scroll._bind(CANCEL_EV);
		},

		_move: function (event) {
			//TODO 待优化
			//event.stopPropagation();
			var scroll = this, point = hasTouch ? event.touches[0] : event,
				deltaX = point.pageX - scroll.pointX, deltaY = point.pageY - scroll.pointY,
				newX = scroll.x + deltaX, newY = scroll.y + deltaY, timestamp = event.timeStamp || Date.now();

			if (scroll.options.onBeforeScrollMove) scroll.options.onBeforeScrollMove.call(scroll, event);

			scroll.pointX = point.pageX;
			scroll.pointY = point.pageY;

			// Slow down if outside of the boundaries
			if (newX > 0 || newX < scroll.maxScrollX) {
				newX = scroll.options.bounce ? scroll.x + (deltaX / 2) : newX >= 0 || scroll.maxScrollX >= 0 ? 0 : scroll.maxScrollX;
			}

			if (newY > scroll.minScrollY || newY < scroll.maxScrollY) {
				newY = scroll.options.bounce ? scroll.y + (deltaY / 2) : newY >= scroll.minScrollY || scroll.maxScrollY >= 0 ? scroll.minScrollY : scroll.maxScrollY;
			}

			scroll.distX += deltaX;
			scroll.distY += deltaY;
			scroll.absDistX = Math.abs(scroll.distX);
			scroll.absDistY = Math.abs(scroll.distY);

			if (scroll.absDistX < 6 && scroll.absDistY < 6) {
				return;
			}

			// Lock direction
			if (scroll.options.lockDirection) {
				if (scroll.absDistX > scroll.absDistY + 5) {
					newY = scroll.y;
					deltaY = 0;
				} else if (scroll.absDistY > scroll.absDistX + 5) {
					newX = scroll.x;
					deltaX = 0;
				}
			}

			scroll.moved = true;
			scroll._pos(newX, newY);
			scroll.movingX = deltaX > 0 ? -1 : deltaX < 0 ? 1 : 0;
			scroll.movingY = deltaY > 0 ? -1 : deltaY < 0 ? 1 : 0;

			if (timestamp - scroll.startTime > 300) {
				scroll.startTime = timestamp;
				scroll.startX = scroll.x;
				scroll.startY = scroll.y;
			}

			if (scroll.options.onScrollMove) scroll.options.onScrollMove.call(scroll, event);
		},

		_end: function (event) {
			if (hasTouch && event.touches.length != 0) return;

			var scroll = this, point = hasTouch ? event.changedTouches[0] : event,
				target, ev, momentumX = { dist: 0, time: 0 }, momentumY = { dist: 0, time: 0 },
				duration = (event.timeStamp || Date.now()) - scroll.startTime,
				newPosX = scroll.x, newPosY = scroll.y, distX, distY, newDuration;

			scroll._unbindScrollEvent();

			if (scroll.options.onBeforeScrollEnd) scroll.options.onBeforeScrollEnd.call(scroll, event);

			if (!scroll.moved) {
				if (hasTouch) {
					scroll.doubleTapTimer = setTimeout(function () {
						scroll.doubleTapTimer = null;

						// Find the last touched element
						target = point.target;
						while (target.nodeType != 1) target = target.parentNode;

						if (target.tagName != 'SELECT' && target.tagName != 'INPUT' && target.tagName != 'TEXTAREA') {
							ev = document.createEvent('MouseEvents');
							ev.initMouseEvent('click', true, true, event.view, 1, point.screenX, point.screenY, point.clientX, point.clientY, event.ctrlKey, event.altKey, event.shiftKey, event.metaKey, 0, null);
							ev._fake = true;
							target.dispatchEvent(ev);
						}
					}, 0);
				}

				scroll._resetPosition(200);

				if (scroll.options.onTouchEnd) scroll.options.onTouchEnd.call(scroll, event);
				return;
			}

			if (duration < 300 && scroll.options.momentum) {
				momentumX = newPosX ? scroll._momentum(newPosX - scroll.startX, duration, -scroll.x, scroll.scrollTargetWidth - scroll.elementWidth + scroll.x, scroll.options.bounce ? scroll.elementWidth : 0) : momentumX;
				momentumY = newPosY ? scroll._momentum(newPosY - scroll.startY, duration, -scroll.y, (scroll.maxScrollY < 0 ? scroll.scrollTargetHeight - scroll.elementHeight + scroll.y - scroll.minScrollY : 0), scroll.options.bounce ? scroll.elementHeight : 0) : momentumY;

				newPosX = scroll.x + momentumX.dist;
				newPosY = scroll.y + momentumY.dist;

				if ((scroll.x > 0 && newPosX > 0) || (scroll.x < scroll.maxScrollX && newPosX < scroll.maxScrollX)) momentumX = { dist: 0, time: 0 };
				if ((scroll.y > scroll.minScrollY && newPosY > scroll.minScrollY) || (scroll.y < scroll.maxScrollY && newPosY < scroll.maxScrollY)) momentumY = { dist: 0, time: 0 };
			}

			if (momentumX.dist || momentumY.dist) {
				newDuration = Math.max(Math.max(momentumX.time, momentumY.time), 10);
				scroll.scrollTo(mround(newPosX), mround(newPosY), newDuration);
				if (scroll.options.onTouchEnd) scroll.options.onTouchEnd.call(scroll, event);
				return;
			}

			scroll._resetPosition(200);
			if (scroll.options.onTouchEnd) scroll.options.onTouchEnd.call(scroll, event);
		},

		_resetPosition: function (time) {
			var scroll = this,
				resetX = scroll.x >= 0 ? 0 : scroll.x < scroll.maxScrollX ? scroll.maxScrollX : scroll.x,
				resetY = scroll.y >= scroll.minScrollY || scroll.maxScrollY > 0 ? scroll.minScrollY : scroll.y < scroll.maxScrollY ? scroll.maxScrollY : scroll.y;

			if (resetX == scroll.x && resetY == scroll.y) {

				if (scroll.moved) { // 注释此处是为了解决在momentum过程中按下页面不再滚动，然后onScrollEnd不再触发的bug。
					scroll.moved = false;
					if (scroll.options.onScrollEnd)
						scroll.options.onScrollEnd.call(scroll);// Execute custom code on scroll end
				}

				if (scroll.showHoriScrollbar && scroll.options.hideScrollbar) {
					if (vendor == 'webkit')
						setStyle(scroll.horiBar.wrapper, 'transition-delay', '300ms');
					scroll.horiBar.wrapper.style.opacity = '0';
				}

				if (scroll.showVertScrollbar && scroll.options.hideScrollbar) {
					if (vendor == 'webkit')
						setStyle(scroll.vertBar.wrapper, 'transition-delay', '300ms');
					scroll.vertBar.wrapper.style.opacity = '0';
				}

				return;
			}

			scroll.scrollTo(resetX, resetY, time || 0);
		},

		_wheel: function (event) {
			var scroll = this, wheelDeltaX, wheelDeltaY, deltaX, deltaY;

			if ('wheelDeltaX' in event) {
				wheelDeltaX = event.wheelDeltaX / 12;
				wheelDeltaY = event.wheelDeltaY / 12;
			} else if ('wheelDelta' in event) {
				wheelDeltaX = wheelDeltaY = event.wheelDelta / 12;
			} else if ('detail' in event) {
				wheelDeltaX = wheelDeltaY = -event.detail * 3;
			} else {
				return;
			}

			deltaX = scroll.x + wheelDeltaX;
			deltaY = scroll.y + wheelDeltaY;

			if (deltaX > 0)
				deltaX = 0;
			else if (deltaX < scroll.maxScrollX)
				deltaX = scroll.maxScrollX;

			if (deltaY > scroll.minScrollY)
				deltaY = scroll.minScrollY;
			else if (deltaY < scroll.maxScrollY)
				deltaY = scroll.maxScrollY;

			scroll.scrollTo(deltaX, deltaY, 0);
		},

		_mouseout: function (event) {
			var target = event.relatedTarget;
			if (!target) {
				this._end(event);
				return;
			}
			while (target = target.parentNode)
				if (target == this.element)
					return;
			this._end(event);
		},

		_transitionEnd: function (event) {
			var scroll = this;
			if (event.target != scroll.scrollTarget) return;
			scroll._unbind(transitionEndEvent);
			scroll._startAnimate();
		},

		/**
		 * Utilities
		 */
		_startAnimate: function () {
			var scroll = this, startX = scroll.x, startY = scroll.y, startTime = Date.now(), step, easeOut, animate;

			if (scroll.animating) return;

			if (!scroll.steps.length) {
				scroll._resetPosition(200);
				return;
			}

			step = scroll.steps.shift();

			if (step.x == startX && step.y == startY) step.time = 0;

			scroll.animating = true;
			//scroll.moved = true;

			if (scroll.options.useTransition) {
				scroll._transitionTime(step.time);
				scroll._pos(step.x, step.y);
				scroll.animating = false;
				if (step.time)
					scroll._bind(transitionEndEvent);
				else
					scroll._resetPosition(0);
				return;
			}

			animate = function () {
				var now = Date.now(), newX, newY;

				if (now >= startTime + step.time) {
					scroll._pos(step.x, step.y);
					scroll.animating = false;
					if (scroll.options.onScrollingEnd) scroll.options.onScrollingEnd.call(scroll); // Execute custom code on animation end
					scroll._startAnimate();
					return;
				}

				now = (now - startTime) / step.time - 1;
				easeOut = Math.sqrt(1 - now * now);
				newX = (step.x - startX) * easeOut + startX;
				newY = (step.y - startY) * easeOut + startY;
				scroll._pos(newX, newY);
				if (scroll.animating) scroll.aniTime = nextFrame(animate);
				if (scroll.options.onScrolling) scroll.options.onScrolling.call(scroll);
			};

			animate();
		},

		_transitionTime: function (time) {
			time += 'ms';
			this.updateChildrenStyle('transition-duration', time);
			if (this.showHoriScrollbar) setStyle(this.horiBar.indicator, 'transition-duration', time);
			if (this.showVertScrollbar) setStyle(this.vertBar.indicator, 'transition-duration', time);
		},

		_momentum: function (dist, time, maxDistUpper, maxDistLower, size) {
			var deceleration = 0.0006, speed = Math.abs(dist) / time, newDist = (speed * speed) / (2 * deceleration), outsideDist = 0;

			// Proportinally reduce speed if we are outside of the boundaries
			if (dist > 0 && newDist > maxDistUpper) {
				outsideDist = size / (6 / (newDist / speed * deceleration));
				maxDistUpper = maxDistUpper + outsideDist;
				speed = speed * maxDistUpper / newDist;
				newDist = maxDistUpper;
			} else if (dist < 0 && newDist > maxDistLower) {
				outsideDist = size / (6 / (newDist / speed * deceleration));
				maxDistLower = maxDistLower + outsideDist;
				speed = speed * maxDistLower / newDist;
				newDist = maxDistLower;
			}

			newDist = newDist * (dist < 0 ? -1 : 1);

			return { dist: newDist, time: mround(speed / deceleration) };
		},

		_offset: function (el) {
			var left = -el.offsetLeft, top = -el.offsetTop;

			while (el = el.offsetParent) {
				left -= el.offsetLeft;
				top -= el.offsetTop;
			}

			return { left: left, top: top };
		},

		_bind: function (type, el, bubble) {
			(el || this.options.eventElement || this.element).addEventListener(type, this, !!bubble);
		},

		_unbind: function (type, el, bubble) {
			(el || this.options.eventElement || this.element).removeEventListener(type, this, !!bubble);
		},

		_unbindScrollEvent: function() {
			this._unbind(MOVE_EV);
			this._unbind(END_EV);
			this._unbind(CANCEL_EV);
		},

		/**
		 * Public methods
		 */
		destroy: function () {
			var scroll = this;

			scroll.updateChildrenStyle('transform', '');

			// Remove the scrollbars
			scroll.showHoriScrollbar = false;
			scroll.showVertScrollbar = false;
			scroll._refreshScrollbar('hori');
			scroll._refreshScrollbar('vert');

			// Remove the event listeners
			scroll._unbind(RESIZE_EV, window);
			scroll._unbind(START_EV);
			scroll._unbindScrollEvent();

			if (!scroll.options.hasTouch) {
				scroll._unbind('mouseout', scroll.element);
				scroll._unbind(WHEEL_EV);
			}

			if (scroll.options.useTransition) scroll._unbind(transitionEndEvent);
			if (scroll.options.onDestroy) scroll.options.onDestroy.call(scroll);
		},

		viewportSize: function(dir) {
			return (dir == "h" ? this.element.clientWidth : this.element.clientHeight) || 1;
		},

		scrollSize: function(dir) {
			return dir == "h" ? this.element.scrollWidth : this.element.scrollHeight;
		},

		doScrollSize: function(dir) {
			var cache = this.getChildrenTransform();
			this.updateChildrenStyle('transform', '');

			var result = this.scrollSize(dir);

			for (var i = 0; i < cache.length; i++) {
				var config = cache[i];
				setStyle(config.element, 'transform', config.value);
			}

			return result;
		},

		refresh: function () {
			var scroll = this, offset;

			scroll.elementWidth = scroll.viewportSize("h");
			scroll.elementHeight = scroll.viewportSize("v");

			scroll.minScrollY = -scroll.options.topOffset || 0;
			scroll.scrollTargetWidth = mround(scroll.doScrollSize("h"));
			scroll.scrollTargetHeight = mround((scroll.doScrollSize("v") + scroll.minScrollY));
			scroll.maxScrollX = scroll.elementWidth - scroll.scrollTargetWidth;
			scroll.maxScrollY = scroll.elementHeight - scroll.scrollTargetHeight + scroll.minScrollY + ( -scroll.options.bottomOffset || 0 );
			scroll.movingX = 0;
			scroll.movingY = 0;

			if (scroll.options.onRefresh) scroll.options.onRefresh.call(scroll);

			scroll.horiScrollEnable = scroll.options.horiScrollEnable && scroll.maxScrollX < 0;
			scroll.vertScrollEnable = scroll.options.vertScrollEnable && (!scroll.options.bounceLock && !scroll.horiScrollEnable || scroll.scrollTargetHeight > scroll.elementHeight);

			scroll.showHoriScrollbar = scroll.horiScrollEnable && scroll.options.showHoriScrollbar;
			scroll.showVertScrollbar = scroll.vertScrollEnable && scroll.options.showVertScrollbar && scroll.scrollTargetHeight > scroll.elementHeight;

			offset = scroll._offset(scroll.element);
			scroll.elementOffsetLeft = -offset.left;
			scroll.elementOffsetTop = -offset.top;

			// Prepare the scrollbars
			scroll._refreshScrollbar('hori');
			scroll._refreshScrollbar('vert');

			this.updateChildrenStyle('transition-duration', 0);
			scroll._resetPosition(200);
		},

		scrollTo: function (x, y, time, relative) {
			var scroll = this, step = x;

			scroll.stop();

			if (!step.length) step = [ { x: x, y: y, time: time, relative: relative } ];

			for (var i = 0, j = step.length; i < j; i++) {
				if (step[i].relative) {
					step[i].x = scroll.x - step[i].x;
					step[i].y = scroll.y - step[i].y;
				}
				scroll.steps.push({ x: step[i].x, y: step[i].y, time: step[i].time || 0 });
			}

			scroll._startAnimate();
		},

		scrollToElement: function (el, time) {
			var scroll = this, position;
			el = el.nodeType ? el : (scroll.scrollTarget ? scroll.scrollTarget.querySelector(el) : el);
			if (!el) return;

			position = scroll._offset(el);
			position.left += scroll.elementOffsetLeft;
			position.top += scroll.elementOffsetTop;

			position.left = position.left > 0 ? 0 : position.left < scroll.maxScrollX ? scroll.maxScrollX : position.left;
			position.top = position.top > scroll.minScrollY ? scroll.minScrollY : position.top < scroll.maxScrollY ? scroll.maxScrollY : position.top;
			time = time === undefined ? Math.max(Math.abs(position.left) * 2, Math.abs(position.top) * 2) : time;

			scroll.scrollTo(position.left, position.top, time);
		},

		disable: function () {
			this.stop();
			this._resetPosition(0);
			this.enabled = false;

			// If disabled after touchstart we make sure scroll there are no left over events
			this._unbindScrollEvent();
		},

		enable: function () {
			this.enabled = true;
		},

		stop: function () {
			if (this.options.useTransition)
				this._unbind(transitionEndEvent);
			else
				cancelFrame(this.aniTime);
			this.steps = [];
			//this.moved = false;
			this.animating = false;
		},

		isReady: function () {
			return !this.moved && !this.animating;
		}
	};

	window.iScroll = iScroll;

})();

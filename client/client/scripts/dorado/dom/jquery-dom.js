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

(function($) {

	function num(el, prop) {
		return parseInt(jQuery.css(el.jquery ? el[0] : el, prop, true)) || 0;
	};
	
	/**
	 * @name jQuery#left
	 * @function
	 * @param {String|int} [val] style.left值。
	 * @return {int|jQuery} style.left值;或者当此方法用于设置对象的style.left时返回调用此方法的jQuery对象自身。
	 * @description 返回或设置对象的style.left值。
	 */
	/**
	 * @name jQuery#top
	 * @function
	 * @param {String|int} [val] style.top。
	 * @return {int|jQuery} style.top值;或者当此方法用于设置对象的style.top时返回调用此方法的jQuery对象自身。
	 * @description 返回或设置对象的style.top值。
	 */
	/**
	 * @name jQuery#right
	 * @function
	 * @param {String|int} [val] style.right。
	 * @return {int|jQuery} style.right值;或者当此方法用于设置对象的style.right时返回调用此方法的jQuery对象自身。
	 * @description 返回或设置对象的style.right值。
	 */
	/**
	 * @name jQuery#bottom
	 * @function
	 * @param {String|int} [val] style.bottom。
	 * @return {int|jQuery} style.bottom值;或者当此方法用于设置对象的style.bottom时返回调用此方法的jQuery对象自身。
	 * @description 返回或设置对象的style.bottom值。
	 */
	/**
	 * @name jQuery#position
	 * @function
	 * @param {String|int} [left] style.left。
	 * @param {String|int} [top] style.top。
	 * @return {Object|jQuery} 对象坐标;或者当此方法用于设置对象的坐标时返回调用此方法的jQuery对象自身。
	 * 此处返回的对象坐标是一个的JSON对象，其中包含下列子属性：
	 * <ul>
	 * <li>left - style.left的值。</li>
	 * <li>top - style.top的值。</li>
	 * </ul>
	 * @description 返回或设置对象的坐标，即返回或设置对象的style.left和style.top。
	 */
	/**
	 * @name jQuery#outerWidth
	 * @function
	 * @param {String|int} [width] 将要设置的宽度。
	 * 当此处指定的宽度为百分比时，此方法将直接简单的把此参数赋给对象的style.width属性。
	 * @return {int|jQuery} 对象的实际宽度（包含对象的padding、border）;或者当此方法用于设置对象的宽度时返回调用此方法的jQuery对象自身。
	 * @description 返回或设置对象的实际宽度。
	 * <p>
	 * 当我们不定义此方法的width参数时，表示我们需要此方法返回对象的实际宽度； 如果定义了此方法的width参数，表示我们要设置此对象的实际宽度。
	 * </p>
	 */
	/**
	 * @name jQuery#outerHeight
	 * @function
	 * @param {String|int} [height] 将要设置的高度。
	 * 当此处指定的高度为百分比时，此方法将直接简单的把此参数赋给对象的style.height属性。
	 * @return {int|jQuery} 对象的实际高度（包含对象的padding、border）;或者当此方法用于设置对象的高度时返回调用此方法的jQuery对象自身。
	 * @description 返回或设置对象的实际高度。
	 * <p>
	 * 当我们不定义此方法的height参数时，表示我们需要此方法返回对象的实际高度；
	 * 如果定义了此方法的height参数，表示我们要设置此对象的实际高度。
	 * </p>
	 */
	// =====
	
	/**
	 * @name jQuery#bringToFront
	 * @function
	 * @description 将相应元素提到最前面，即为相应元素设置合适的style.zIndex使其不至于被其他元素阻挡。
	 * @return {jQuery} 调用此方法的jQuery对象自身。
	 */
	$.fn.bringToFront = function() {
		return this.css("zIndex", $DomUtils.bringToFront());
	};
	
	// Extend left, top, right, bottom methods
	$.each(["left", "top", "right", "bottom"], function(i, name) {
		$.fn[name] = function(val) {
			return this.css(name, val);
		};
	});
	
	// Extend position method
	var oldPosition = $.fn.position;
	$.fn.position = function(left, top) {
		if (arguments.length) {
			this.css("left", left).css("top", top);
			return this;
		} else {
			return oldPosition.call(this);
		}
	};
	
	// Extend outerHeight and outerWidth methods
	$.each(["Height", "Width"], function(i, name) {
		var tl = i ? "Left" : "Top"; // top or left
		var br = i ? "Right" : "Bottom"; // bottom or right
		var fn = $.fn["outer" + name];

		$.fn["outer" + name] = function(arg) {
			if (arg != null && (arg.constructor != Boolean || arguments.length > 1)) {
				if (arg.constructor == String) {
					if (arg == "auto" || arg.match('%')) {
						return this[name.toLowerCase()](arg);
					} else if (arg == "none") {
						return this.css(name.toLowerCase(), "");
					}
				} else {
					var n = parseInt(arg);
					if (arguments[1] === true) {
						n = n - num(this, "padding" + tl) - num(this, "padding" + br) -
						    num(this, "border" + tl + "Width") - num(this, "border" + br + "Width") -
							num(this, "margin" + tl) - num(this, "margin" + br);
					} else {
						n = n - num(this, "padding" + tl) - num(this, "padding" + br) -
						    num(this, "border" + tl + "Width") - num(this, "border" + br + "Width");
					}
					return this[name.toLowerCase()](n);
				}
				return this;
			}
			return fn.apply(this, arguments);
		};
	});
	
	// Extend edgeLeft edgeTop edgeRight and edgeBottom methods
	$.each(["Left", "Top", "Right", "Bottom"], function(i, name) {
		$.fn["edge" + name] = function(includeMargin) {
			var n = num(this, "padding" + name) +
				num(this, "border" + name + "Width");
			if (includeMargin) {
				n += num(this, "margin" + name);
			}
			return n;
		};
	});
	
	// Extend edgeWidth
	$.fn.edgeWidth = function(includeMargin) {
		return this.edgeLeft(includeMargin) + this.edgeRight(includeMargin);
	}
	
	// Extend edgeHeight
	$.fn.edgeHeight = function(includeMargin) {
		return this.edgeTop(includeMargin) + this.edgeBottom(includeMargin);
	}
	
	/**
	 * @name jQuery#addClassOnHover
	 * @function
	 * @description 当鼠标经过该对象时为该对象添加一个CSS Class，并在鼠标离开后移除该CSS Class。
	 * <p>
	 * 注意：此方法不适用于$fly()方法返回的对象。应使用$()或jQuery()来封装DOM对象。
	 * </p>
	 * @param {String} cls 要设置的CSS Class。
	 * @param {jQuery} [clsOwner] 要将CSS Class设置给哪个对象，如果不指定此参数则将设置给调用此方法的jQuery对象。
	 * @param {Function} [fn] 一个用于判断是否要启用鼠标悬停效果的函数，其返回值的true/false决定是否要启用悬停效果。 该fn的scope即为jQuery对象自身。
	 * @return {jQuery} 调用此方法的jQuery对象自身。
	 */
	$.fn.addClassOnHover = function(cls, clsOwner, fn) {
		var clsOwner = clsOwner || this;
		this.hover(function() {
			if ($DomUtils.isDragging()) return;
			if (typeof fn == "function" && !fn.call(this)) return;
			clsOwner.addClass(cls);
		}, function() {
			clsOwner.removeClass(cls);
		});
		return this;
	};
	
	/**
	 * @name jQuery#addClassOnFocus
	 * @function
	 * @description 当该对象获得焦点时为该对象添加一个CSS Class，并在对象失去焦点后移除该CSS Class。
	 * <p>
	 * 注意：此方法不适用于$fly()方法返回的对象。应使用$()或jQuery()来封装DOM对象。
	 * </p>
	 * @param {String} cls 要设置的CSS Class。
	 * @param {jQuery} [clsOwner] 要将CSS Class设置给哪个对象，如果不指定此参数则将设置给调用此方法的jQuery对象。
	 * @param {Function} [fn] 一个用于判断是否要启用焦点效果的函数，其返回值的true/false决定是否要启用焦点效果。 该fn的scope即为jQuery对象自身。
	 * @return {jQuery} 调用此方法的jQuery对象自身。
	 */
	$.fn.addClassOnFocus = function(cls, clsOwner, fn) {
		var clsOwner = clsOwner || this;
		this.focus(function() {
			if (typeof fn == "function" && !fn.call(this)) return;
			clsOwner.addClass(cls);
		});
		this.blur(function() {
			clsOwner.removeClass(cls);
		});
		return this;
	};
	
	/**
	 * @name jQuery#addClassOnClick
	 * @function
	 * @description 当鼠标在该对象上按下时为该对象添加一个CSS Class，并在鼠标抬起后移除该CSS Class。
	 * <p>
	 * 注意：此方法不适用于$fly()方法返回的对象。应使用$()或jQuery()来封装DOM对象。
	 * </p>
	 * @param {String} cls 要设置的CSS Class。
	 * @param {jQuery} [clsOwner] 要将CSS Class设置给哪个对象，如果不指定此参数则将设置给调用此方法的jQuery对象。
	 * @param {Function} [fn] 一个用于判断是否要启用单击效果的函数，其返回值的true/false决定是否要启用单击效果。 该fn的scope即为jQuery对象自身。
	 * @return {jQuery} 调用此方法的jQuery对象自身。
	 */
	$.fn.addClassOnClick = function(cls, clsOwner, fn) {
		var clsOwner = clsOwner || this;
		this.mousedown(function() {
			if (typeof fn == "function" && !fn.call(this)) return;
			clsOwner.addClass(cls);
			$(document).one("mouseup", function() {
				clsOwner.removeClass(cls);
			});
		});
		return this;
	};
	
	/**
	 * @name jQuery#repeatOnClick
	 * @function
	 * @description 当鼠标在该对象上按下的时候重复执行一个函数，当鼠标抬起以后，则取消执行这段函数。
	 * @param {Function} fn 要执行的函数。
	 * @param {int} interval=100 重复执行的间隔。
	 * @return {jQuery} 调用此方法的jQuery对象自身。
	 */
	$.fn.repeatOnClick = function(fn, interval) {
		this.mousedown(function() {
			var timer;
			if (typeof fn == "function") {
				fn.apply(null, []);
				timer = setInterval(fn, interval || 100);
			}
			$(document).one("mouseup", function() {
				if (timer) {
					clearInterval(timer);
					timer = null;
				}
			});
		});
		return this;
	};
	
	var disableMouseWheel = function(event) {
		event.preventDefault();
	};	
	
	/**
	 * @name jQuery#fullWindow
	 * @function
	 * @description 调用对象应为display为block的元素。
	 * @return {jQuery} 调用此方法的jQuery对象自身。
	 */
	$.fn.fullWindow = function(options) {
		var self = this;
		if (self.length == 1) {
			var dom = self[0], containBlock = dom.parentNode, parentsOverflow = [], parentsPositioned = false, parentsPosition = [];

			function doFilter() {
				if (this == document.body || (/(auto|scroll|hidden)/).test(jQuery.css(this, 'overflow') + jQuery.css(this, 'overflow-y'))) {
					parentsOverflow.push({
						parent: this,
						overflow: jQuery.css(this, "overflow"),
						overflowY: jQuery.css(this, "overflow-y"),
						scrollTop: this.scrollTop
					});
					var overflowValue = this == document.body ? "hidden" : "visible";
					
					var $this = jQuery(this);
					$this.prop("scrollTop", 0).css({
						overflow: overflowValue,
						overflowY: overflowValue
					});
					
					if ($this.mousewheel) {
						$this.mousewheel(disableMouseWheel);
					}
				}

				if (!parentsPositioned  && dorado.Browser.msie && dorado.Browser.version <= 7) {
					if (this == document.body || (/(relative|absolute)/).test(jQuery.css(this, 'position'))) {
						if (jQuery.css(this, "z-index") == "") {
							parentsPosition.push(this);
							parentsPositioned = true;
							jQuery(this).css("z-index", 100);
						}
					}
				}
			}
			
			while (containBlock != document.body) {
				if (jQuery(containBlock).css("position") != "static") {
					break;
				}
				containBlock = containBlock.parentNode;
			}

			options = options || {};
			
			var docWidth = jQuery(window).width(), docHeight = jQuery(window).height();
			
			var isAbs = (self.css("position") == "absolute");
			
			var backupStyle = {
				position: dom.style.position,
				left: dom.style.left,
				top: dom.style.top
				//,zIndex: dom.style.zIndex
			};
			
			var poffset = jQuery(containBlock).offset() || {
				left: 0,
				top: 0
			}, position, left, top;
			
			self.css({
				position: "absolute",
				left: 0,
				top: 0
			});
			
			position = self.position();
			
			left = -1 * (poffset.left + position.left);
			top = -1 * (poffset.top + position.top);

			self.parents().filter(doFilter);

			var targetStyle = {
				position: "absolute",
				left: left,
				top: top
			};
			if (options.modifySize !== false) {
				backupStyle.width = dom.style.width;
				backupStyle.height = dom.style.height;
				targetStyle.width = docWidth;
				targetStyle.height = docHeight;
			}
			
			jQuery.data(dom, "fullWindow.backupStyle", backupStyle);
			jQuery.data(dom, "fullWindow.parentsOverflow", parentsOverflow);
			jQuery.data(dom, "fullWindow.parentsPosition", parentsPosition);
			jQuery.data(dom, "fullWindow.backupSize", {
				width: self.outerWidth(),
				height: self.outerHeight()
			});
			self.css(targetStyle).bringToFront();

			if (dorado.Browser.msie && dorado.Browser.msie <= 7) {
				jQuery(".d-dialog .button-panel").css("visibility", "hidden");
				jQuery(".d-dialog .dialog-footer").css("visibility", "hidden");
			}

			var callback = options.callback;
			if (callback) {
				callback({
					width: docWidth,
					height: docHeight
				});
			}
		}
		return this;
	};
	
	/**
	 * @name jQuery#unfullWindow
	 * @function
	 * @description 调用对象应为display为block的元素。
	 * @return {jQuery} 调用此方法的jQuery对象自身。
	 */
	$.fn.unfullWindow = function(options) {
		var self = this;
		if (self.length == 1) {
			options = options || {};
			var dom = self[0], callback = options.callback;
			var backupStyle = jQuery.data(dom, "fullWindow.backupStyle"), backupSize = jQuery.data(dom, "fullWindow.backupSize"),
				parentsOverflow = jQuery.data(dom, "fullWindow.parentsOverflow"), parentsPosition = jQuery.data(dom, "fullWindow.parentsPosition");
			
			if (backupStyle) {
				self.css(backupStyle);
			}
			
			if (callback) {
				callback(backupSize);
			}
			
			if (parentsOverflow) {
				for (var i = 0, j = parentsOverflow.length; i < j; i++) {
					var parentOverflow = parentsOverflow[i];
					var $parent = jQuery(parentOverflow.parent);
					$parent.css({
						overflow: parentOverflow.overflow,
						overflowY: parentOverflow.overflowY
					}).prop("scrollTop", parentOverflow.scrollTop);
					if ($parent.unmousewhee) {
						$parent.unmousewheel(disableMouseWheel);
					}
				}
			}

			if (parentsPosition) {
				for (var i = 0, j = parentsPosition.length; i < j; i++) {
					var parentPosition = parentsPosition[i];
					jQuery(parentPosition).css("z-index", "");
				}
			}

			if (dorado.Browser.msie && dorado.Browser.msie <= 7) {
				jQuery(".d-dialog .button-panel").css("visibility", "");
				jQuery(".d-dialog .dialog-footer").css("visibility", "");
			}

			jQuery.data(dom, "fullWindow.backupStyle", null);
			jQuery.data(dom, "fullWindow.backupSize", null);
			jQuery.data(dom, "fullWindow.parentsOverflow", null);
		}
		return this;
	};

	var hashTimerInited = false, storedHash;
	
	/**
	 * @name jQuery#hashchange
	 * @description 监听window的onHashChange事件。
	 * @param {Function} 事件方法。
	 * @function
	 * @return {jQuery} 调用此方法的jQuery对象自身。
	 */
	$.fn.hashchange = function(fn) {
		this.bind("hashchange", fn);
		
		if (!hashTimerInited && jQuery.browser.msie && jQuery.browser.version < 8) {
			hashTimerInited = true;
			
			var storedHash = window.location.hash;
			window.setInterval(function() {
				if (window.location.hash != storedHash) {
					storedHash = window.location.hash;
					$(window).trigger("hashchange");
				}
			}, 100);
		}
	}
	
})(jQuery);

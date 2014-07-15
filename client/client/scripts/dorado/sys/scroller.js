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

	var SCROLLER_SIZE = $setting["widget.scrollerSize"] || 4, SCROLLER_EXPANDED_SIZE = $setting["widget.scrollerExpandedSize"] || 16;
	var SCROLLER_PADDING = 0, MIN_SLIDER_SIZE = SCROLLER_EXPANDED_SIZE, MIN_SPILLAGE = 2;

	function insertAfter(element, refElement) {
		var parent = refElement.parentNode;
		if (parent.lastChild == refElement) {
			parent.appendChild(element);
		}
		else {
			parent.insertBefore(element, refElement.nextSibling);
		}
	}

	dorado.util.Dom.ThinScroller = $class({
		// dom, doms, container, direction

		constructor: function(container, direction, options) {
			this.container = container;
			this.direction = direction;
			if (options) dorado.Object.apply(this, options);
		},

		destroy: function() {
			delete this.dom;
			delete this.doms;
			delete this.container;
		},

		createDom: function() {
			var scroller = this, doms = scroller.doms = {}, dom = scroller.dom = $DomUtils.xCreate({
				tagName: "DIV",
				className: "d-modern-scroller",
				style: "position: absolute",
				content: [
					{
						tagName: "DIV",
						contextKey: "track",
						className: "track",
						style: {
							width: "100%",
							height: "100%"
						}
					},
					{
						tagName: "DIV",
						contextKey: "slider",
						className: "slider",
						style: "position: absolute"
					}
				]
			}, null, doms);

			var $dom = $(dom), slider = doms.slider, $slider = $(slider), track = doms.track, $track = $(track);

			var draggableOptions = {
				containment: "parent",
				start: function() {
					scroller.dragging = true;
				},
				stop: function() {
					scroller.dragging = false;
					(scroller.hover) ? scroller.doMouseEnter() : scroller.doMouseLeave();
				},
				drag: function() {
					var container = scroller.container;
					if (scroller.direction == "h") {
						container.scrollLeft = Math.round(slider.offsetLeft * scroller.positionRatio);
					}
					else {
						container.scrollTop = Math.round(slider.offsetTop * scroller.positionRatio);
					}
				}
			}

			if (scroller.direction == "h") {
				dom.style.height = SCROLLER_SIZE + "px";

				slider.style.height = "100%";
				slider.style.top = "0px";

				draggableOptions.axis = "x";
			}
			else {
				dom.style.width = SCROLLER_SIZE + "px";

				slider.style.width = "100%";
				slider.style.left = "0px";

				draggableOptions.axis = "y";
			}
			$slider.draggable(draggableOptions);

			$dom.hover(function() {
				scroller.update();
				scroller.doMouseEnter();
			}, function() {
				scroller.doMouseLeave();
			});

			$track.click(function(evt) {
				var container = scroller.container;
				if (scroller.direction == "h") {
					if (evt.offsetX > slider.offsetLeft) {
						container.scrollLeft += container.clientWidth;
					}
					else {
						container.scrollLeft -= container.clientWidth;
					}
				}
				else {
					if (evt.offsetY > slider.offsetTop) {
						container.scrollTop += container.clientHeight;
					}
					else {
						container.scrollTop -= container.clientHeight;
					}
				}
			});

			$DomUtils.disableUserSelection(dom);
			$DomUtils.disableUserSelection(doms.track);
			return dom;
		},

		doMouseEnter: function() {
			var scroller = this;
			scroller.hover = true;
			if (scroller.dragging) return;

			$fly(scroller.dom).addClass("d-modern-scroller-hover");
			scroller.expand();
		},

		doMouseLeave: function() {
			var scroller = this;
			scroller.hover = false;
			if (scroller.dragging) return;

			$fly(scroller.dom).removeClass("d-modern-scroller-hover");
			scroller.unexpand();
		},

		expand: function() {
			var scroller = this;
			dorado.Toolkits.cancelDelayedAction(scroller, "$expandTimerId");
			if (scroller.expanded) return;

			var animOptions;
			if (scroller.direction == "h") {
				animOptions = {
					height: SCROLLER_EXPANDED_SIZE
				};
			}
			else {
				animOptions = {
					width: SCROLLER_EXPANDED_SIZE
				};
			}

			scroller.expanded = true;

			var $dom = $(scroller.dom);
			$dom.addClass("d-modern-scroller-expand");
			if (dorado.Browser.msie && dorado.Browser.version < 7) {
				$dom.css(animOptions);
			}
			else {
				scroller.duringAnimation = true;
				$dom.animate(animOptions, 0, function() {
					scroller.duringAnimation = false;
				});
			}
		},

		unexpand: function() {
			var scroller = this;
			dorado.Toolkits.setDelayedAction(scroller, "$expandTimerId", function() {
				var animOptions, container = scroller.container;
				if (scroller.direction == "h") {
					animOptions = {
						height: SCROLLER_SIZE
					};
				}
				else {
					animOptions = {
						width: SCROLLER_SIZE
					};
				}

				var $dom = $(scroller.dom);
				if (dorado.Browser.msie && dorado.Browser.version < 7) {
					$dom.css(animOptions);
					scroller.expanded = false;
				}
				else {
					scroller.duringAnimation = true;
					$dom.animate(animOptions, 300, function() {
						scroller.expanded = false;
						scroller.duringAnimation = false;
						$dom.removeClass("d-modern-scroller-expand");
					});
				}
			}, 700);
		},

		update: function() {
			var scroller = this, container = scroller.container;
			if (!container) return;

			var dom = scroller.dom, $container = $(container), scrollerSize = scroller.expanded ? SCROLLER_EXPANDED_SIZE : SCROLLER_SIZE;

			if (scroller.direction == "h") {
				if (container.scrollWidth > (container.clientWidth + MIN_SPILLAGE) && container.clientWidth > 0) {
					if (!dom) {
						dom = scroller.createDom();
						dom.style.zIndex = 9999;
						dom.style.bottom = 0;
						dom.style.left = 0;
						if (!dorado.Browser.msie || dorado.Browser.version != 6) {
							dom.style.width = "100%";
						}
						container.parentNode.appendChild(dom);
					}
					else {
						dom.style.display = "";
					}

					if (dorado.Browser.msie && dorado.Browser.version == 6) {
						dom.style.width = container.offsetWidth + "px";
					}

					var trackSize = container.offsetWidth - SCROLLER_PADDING * 2;
					var slider = scroller.doms.slider;
					var sliderSize = (trackSize * container.clientWidth / container.scrollWidth);
					if (sliderSize < MIN_SLIDER_SIZE) {
						trackSize -= (MIN_SLIDER_SIZE - sliderSize);
						sliderSize = MIN_SLIDER_SIZE;
					}

					scroller.positionRatio = container.scrollWidth / trackSize;
					slider.style.left = Math.round(container.scrollLeft / scroller.positionRatio) + "px";
					slider.style.width = Math.round(sliderSize) + "px";
				}
				else {
					if (dorado.Browser.msie && dorado.Browser.version == 9 && container.offsetWidth > 0) {
						// IE9下有时无法在初始化是取到正确的clientWidth
						setTimeout(function() {
							scroller.update();
						}, 0);
					}
					if (dom) {
						dom.style.display = "none";
					}
				}
			}
			else {
				if (container.scrollHeight > (container.clientHeight + MIN_SPILLAGE) && container.clientHeight > 0) {
					if (!dom) {
						dom = scroller.createDom();
						dom.style.zIndex = 9999;
						dom.style.top = 0;
						dom.style.right = 0;
						if (!dorado.Browser.msie || dorado.Browser.version != 6) {
							dom.style.height = "100%";
						}
						container.parentNode.appendChild(dom);
					}
					else {
						dom.style.display = "";
					}

					if (dorado.Browser.msie && dorado.Browser.version == 6) {
						dom.style.height = container.offsetHeight + "px";
					}

					var trackSize = container.offsetHeight - SCROLLER_PADDING * 2;
					var slider = scroller.doms.slider;
					var sliderSize = (trackSize * container.clientHeight / container.scrollHeight);
					if (sliderSize < MIN_SLIDER_SIZE) {
						trackSize -= (MIN_SLIDER_SIZE - sliderSize);
						sliderSize = MIN_SLIDER_SIZE;
					}

					scroller.positionRatio = container.scrollHeight / trackSize;
					slider.style.top = Math.round(container.scrollTop / scroller.positionRatio) + "px";
					slider.style.height = Math.round(sliderSize) + "px";
				}
				else {
					if (dorado.Browser.msie && dorado.Browser.version == 9 && container.offsetHeight > 0) {
						// IE9下有时无法在初始化是取到正确的clientWidth
						setTimeout(function() {
							scroller.update();
						}, 0);
					}
					if (dom) {
						dom.style.display = "none";
					}
				}
			}
		}
	});

	var ModernScroller = dorado.util.Dom.ModernScroller = $class({
		constructor: function(container, options) {
			this.id = dorado.Core.newId();
			this.container = container;
			this.options = options || {};
			var $container = $(container), options = this.options;

			if (options.listenSize || options.listenContainerSize || options.listenContentSize) {
				addListenModernScroller(this);
			}
		},

		destroy: function() {
			this.destroyed = true;
			var options = this.options;
			if (options.listenSize || options.listenContainerSize || options.listenContentSize) {
				removeListenModernScroller(this);
			}
			delete this.container;
		},

		setScrollLeft: dorado._NULL_FUNCTION,
		setScrollTop: dorado._NULL_FUNCTION,
		scrollToElement: dorado._NULL_FUNCTION
	});

	dorado.util.Dom.DesktopModernScroller = $extend(ModernScroller, {
		// container, xScroller, yScroller

		constructor: function(container, options) {
			$invokeSuper.call(this, arguments);

			var options = this.options;
			$container = $(container),
				parentDom = container.parentNode, $parentDom = $(parentDom);

			var overflowX = $container.css("overflowX"), overflowY = $container.css("overflowY");
			var width = $container.css("width"), height = $container.css("height");
			var xScroller, yScroller;

			if (!(overflowX == "hidden" || overflowX != "scroll" && (width == "" || width == "auto"))) {
				$container.css("overflowX", "hidden");
				xScroller = new dorado.util.Dom.ThinScroller(container, "h", options);
			}
			if (!(overflowY == "hidden" || overflowY != "scroll" && (height == "" || height == "auto"))) {
				$container.css("overflowY", "hidden");
				yScroller = new dorado.util.Dom.ThinScroller(container, "v", options);
			}

			if (!xScroller && !yScroller) throw new dorado.AbortException();

			this.xScroller = xScroller;
			this.yScroller = yScroller;

			var position = $parentDom.css("position");
			if (position != "relative" && position != "absolute") {
				$parentDom.css("position", "relative");
			}

			position = $container.css("position");
			if (position != "relative" && position != "absolute") {
				$container.css("position", "relative");
			}

			this.update();

			var modernScroller = this;
			if ($container.mousewheel) {
				$container.mousewheel(function(evt, delta) {
					if (container.scrollHeight > container.clientHeight) {
						var scrollTop = container.scrollTop - delta * 25;
						if (scrollTop <= 0) {
							scrollTop = 0;
						}
						else if (scrollTop + container.clientHeight > container.scrollHeight) {
							scrollTop = container.scrollHeight - container.clientHeight;
						}
						var gap = container.scrollTop - scrollTop
						if (gap) {
							container.scrollTop = scrollTop;
							if (Math.abs(gap) > MIN_SPILLAGE) {
								return false;
							}
						}
					}
					/*
					 if (container.scrollWidth > container.clientWidth) {
					 var scrollLeft = container.scrollLeft - delta * 25;
					 if (scrollLeft <= 0) {
					 scrollLeft = 0;
					 } else if (scrollLeft + container.clientWidth > container.scrollWidth) {
					 scrollLeft = container.scrollWidth - container.clientWidth;
					 }
					 var gap = container.scrollLeft - scrollLeft
					 if (gap) {
					 container.scrollLeft = scrollLeft;
					 if (Math.abs(gap) > MIN_SPILLAGE) return false;
					 }
					 }
					 */
				});
			}
			$container.bind("scroll",function(evt) {
				modernScroller.update();

				var arg = {
					scrollLeft: container.scrollLeft, scrollTop: container.scrollTop,
					scrollWidth: container.scrollWidth, scrollHeight: container.scrollHeight,
					clientWidth: container.clientWidth, clientHeight: container.clientHeight
				};
				$(container).trigger("modernScrolling", arg).trigger("modernScrolled", arg);
			}).resize(function(evt) {
					modernScroller.update();
				});
		},

		update: function() {
			if (this.destroyed || this.dragging) return;

			if (this.xScroller) this.xScroller.update();
			if (this.yScroller) this.yScroller.update();

			var container = this.container;
			this.currentClientWidth = container.clientWidth;
			this.currentClientHeight = container.clientHeight;
			this.currentScrollWidth = container.scrollWidth;
			this.currentScrollHeight = container.scrollHeight;
		},

		setScrollLeft: function(pos) {
			this.container.scrollLeft = pos;
		},

		setScrollTop: function(pos) {
			this.container.scrollTop = pos;
		},

		scrollToElement: function(dom) {
			var container = this.container, offsetElement = $fly(dom).offset(), offsetContainer = $fly(container).offset();
			var offsetLeft = offsetElement.left - offsetContainer.left, offsetTop = offsetElement.top - offsetContainer.top;
			var offsetRight = offsetLeft + dom.offsetWidth, offsetBottom = offsetTop + dom.offsetHeight;
			var scrollLeft = container.scrollLeft, scrollTop = container.scrollTop;
			var scrollRight = scrollLeft + container.clientWidth, scrollBottom = scrollTop + container.clientHeight;

			if (offsetLeft < scrollLeft) {
				if (offsetRight <= scrollRight) {
					this.setScrollLeft(offsetLeft);
				}
			}
			else if (offsetRight > scrollRight) {
				this.setScrollLeft(offsetRight + dom.offsetWidth);
			}

			if (offsetTop < scrollTop) {
				if (offsetBottom <= scrollBottom) {
					this.setScrollTop(offsetTop);
				}
			}
			else if (offsetBottom > scrollBottom) {
				this.setScrollTop(offsetBottom + dom.offsetHeight);
			}
		},

		destroy: function() {
			$invokeSuper.call(this, arguments);
			if (this.xScroller) this.xScroller.destroy();
			if (this.yScroller) this.yScroller.destroy();
		}
	});

	dorado.util.Dom.IScrollerWrapper = $extend(ModernScroller, {
		// iscroll

		constructor: function(container, options) {
			var $container = $(container);
			var overflowX = $container.css("overflowX"), overflowY = $container.css("overflowY");
			var width = $container.css("width"), height = $container.css("height");

			options = options || {};
			if (options.autoDisable === undefined) options.autoDisable = true;

			/*
			 if ((overflowX == "hidden" || overflowX != "scroll" && (width == "" || width == "auto")) &&
			 (overflowY == "hidden" || overflowY != "scroll" && (height == "" || height == "auto"))) {
			 throw new dorado.AbortException();
			 }
			 */

			var onScrolling = function() {
				var arg = {
					scrollLeft: this.x * -1, scrollTop: this.y * -1,
					scrollWidth: container.scrollWidth, scrollHeight: container.scrollHeight,
					clientWidth: container.clientWidth, clientHeight: container.clientHeight
				};
				$container.trigger("modernScrolling", arg);
			};

			var modernScroller = this, options = modernScroller.options = dorado.Object.apply({
				scrollbarClass: "iscroll",
				hideScrollbar: true,
				fadeScrollbar: true,
				onScrolling: onScrolling,
				onScrollMove: onScrolling,
				onScrollEnd: function() {
					var arg = {
						scrollLeft: this.x * -1, scrollTop: this.y * -1,
						scrollWidth: container.scrollWidth, scrollHeight: container.scrollHeight,
						clientWidth: container.clientWidth, clientHeight: container.clientHeight
					};
					$container.trigger("modernScrolled", arg);
				}
			}, options, false);

			$container.css("overflowX", "hidden").css("overflowY", "hidden");
			setTimeout(function() {
				modernScroller.iscroll = new iScroll(container, modernScroller.options);
				if (options.autoDisable && container.scrollHeight <= (container.clientHeight + 2) && (container.scrollWidth <= container.clientWidth + 2)) {
					modernScroller.iscroll.disable();
				}
			}, 0);

			$invokeSuper.call(modernScroller, [container, modernScroller.options]);

			var $container = $(container);
			$container.bind("scroll",function(evt) {
				modernScroller.update();
			}).resize(function(evt) {
					modernScroller.update();
				});
		},

		update: function() {
			if (!this.iscroll || this.destroyed || this.dragging) return;

			var iscroll = this.iscroll;
			if (this.options.autoDisable) {
				var container = this.container;
				if (container.scrollHeight - (iscroll.y || 0) > (container.clientHeight + 2) ||
					container.scrollWidth - (iscroll.x || 0) > (container.clientWidth + 2)) {
					this.iscroll.enable();
					this.iscroll.refresh();
				}
				else {
					this.iscroll.disable();
					this.iscroll.refresh();
				}
			}
			else {
				this.iscroll.refresh();
			}
		},

		scrollToElement: function(dom) {
			if (this.iscroll) this.iscroll.scrollToElement(dom);
		}
	});

	var listenModernScrollers = new dorado.util.KeyedList(dorado._GET_ID), listenTimerId;

	function addListenModernScroller(modernScroller) {
		listenModernScrollers.insert(modernScroller);
		if (listenModernScrollers.size == 1) {
			listenTimerId = setInterval(function() {
				listenModernScrollers.each(function(modernScroller) {
					var container = modernScroller.container, shouldUpdate = false;
					if (modernScroller.options.listenSize || modernScroller.options.listenContainerSize) {
						if (modernScroller.currentClientWidth != container.clientWidth ||
							modernScroller.currentClientHeight != container.clientHeight) {
							shouldUpdate = true;
						}
					}
					if (modernScroller.options.listenSize || modernScroller.options.listenContentSize) {
						if (modernScroller.currentScrollWidth != container.scrollWidth ||
							modernScroller.currentScrollHeight != container.scrollHeight) {
							shouldUpdate = true;
						}
					}
					if (shouldUpdate) {
						modernScroller.update();
					}
				});
			}, 300);
		}
	}

	function removeListenModernScroller(modernScroller) {
		listenModernScrollers.remove(modernScroller);
		if (listenModernScrollers.size == 0 && listenTimerId) {
			clearInterval(listenTimerId);
			listenTimerId = 0;
		}
	}

	/**
	 * @param {Object} container
	 * @param {Object} [options]
	 * @param {boolean} [options.listenSize]
	 * @param {boolean} [options.listenContainerSize]
	 * @param {boolean} [options.listenContentSize]
	 */
	dorado.util.Dom.modernScroll = function(container, options) {
		var $container = $(container);
		if ($container.data("modernScroller")) return;

		try {
			var modernScroller;
			var parentDom = container.parentNode;
			if (parentDom) {
				if (options && options.scrollerType) {
					modernScroller = new options.scrollerType(container, options);
				}
				else if (dorado.Browser.isTouch || $setting["common.simulateTouch"]) {
					modernScroller = new dorado.util.Dom.IScrollerWrapper(container, options);
				}
				else {
					modernScroller = new dorado.util.Dom.DesktopModernScroller(container, options);
				}
			}

			if (modernScroller) $container.data("modernScroller", modernScroller);
		}
		catch(e) {
			dorado.Exception.processException(e);
		}
		return modernScroller;
	}

	dorado.util.Dom.destroyModernScroll = function(container, options) {
		var modernScroller = $(container).data("modernScroller");
		if (modernScroller) modernScroller.destroy();
	}

})(jQuery);

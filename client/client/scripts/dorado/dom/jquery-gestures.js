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

(function ($, window, document, undefined) {
	if (!(dorado.Browser.isTouch /**&& (dorado.Browser.android || dorado.Browser.iOS)*/ )) return;

	var dataPropertyName = "virtualMouseBindings", touchTargetPropertyName = "virtualTouchID",
		virtualEventNames = "mouseover mousedown mousemove mouseup click mouseout mousecancel".split(" "),
		touchEventProps = "clientX clientY pageX pageY screenX screenY".split(" "),
		mouseHookProps = $.event.mouseHooks ? $.event.mouseHooks.props : [],
		mouseEventProps = $.event.props.concat(mouseHookProps), activeDocHandlers = {}, resetTimerID = 0, startX = 0, startY = 0,
		didScroll = false, clickBlockList = [], blockMouseTriggers = false,
		blockTouchTriggers = false, eventCaptureSupported = "addEventListener" in document, $document = $(document), nextTouchID = 1, lastTouchID = 0;

	$.vmouse = { moveDistanceThreshold:10, clickDistanceThreshold:10, resetTimerDuration:1500 };

	//取得Html的Event
	function getNativeEvent(event) {
		while (event && typeof event.originalEvent !== "undefined") {
			event = event.originalEvent;
		}
		return event;
	}

	//创建一个jQuery event，返回结果被triggerVirtualEvent调用
	function createVirtualEvent(event, eventType) {
		var t = event.type, oe, props, ne, prop, ct, touch, i, j;
		event = $.Event(event);
		event.type = eventType;
		oe = event.originalEvent;
		props = $.event.props;
		if (t.search(/^(mouse|click)/) > -1) {
			props = mouseEventProps;
		}
		if (oe) {
			for (i = props.length, prop; i;) {
				prop = props[--i];
				event[prop] = oe[prop];
			}
		}
		if (t.search(/mouse(down|up)|click/) > -1 && !event.which) {
			event.which = 1;
		}
		if (t.search(/^touch/) !== -1) {
			ne = getNativeEvent(oe);
			t = ne.touches;
			ct = ne.changedTouches;
			touch = (t && t.length) ? t[0] : ((ct && ct.length) ? ct[0] : undefined);
			if (touch) {
				for (j = 0, len = touchEventProps.length; j < len; j++) {
					prop = touchEventProps[j];
					event[prop] = touch[prop];
					//fix draggable not work problem
					event.which = 1;
				}
			}
		}
		var tagName = (event.target && event.target.tagName || "").toLowerCase();
		if (eventType == "click" && (tagName != "a" && tagName != "textarea")) {
			event.isDefaultPrevented = function() {
				return true;
			};
		}
		return event;
	}

	function getMouseEvent(event, eventType) {
		var t = event.type, props, ne, prop, ct, touch, i, j;
		var oe = event, event = document.createEvent('MouseEvents');
		event.type = eventType;
		event.initEvent(eventType, true, true);

		props = $.event.props;
		if (t.search(/^(mouse|click)/) > -1) {
			props = mouseEventProps;
		}
		if (oe) {
			for (i = props.length, prop; i;) {
				prop = props[--i];
				event[prop] = oe[prop];
			}
		}
		if (t.search(/mouse(down|up)|click/) > -1 && !event.which) {
			event.which = 1;
		}
		if (t.search(/^touch/) !== -1) {
			ne = getNativeEvent(oe);
			t = ne.touches;
			ct = ne.changedTouches;
			touch = (t && t.length) ? t[0] : ((ct && ct.length) ? ct[0] : undefined);
			if (touch) {
				for (j = 0, len = touchEventProps.length; j < len; j++) {
					prop = touchEventProps[j];
					event[prop] = touch[prop];
				}
			}
		}
		return event;
	}

	//在Element上判断某个event是否已经注册过，用来优化性能的
	function getVirtualBindingFlags(element) {
		var flags = {}, b, k;
		while (element) {
			b = $.data(element, dataPropertyName);
			for (k in b) {
				if (b[k]) {
					flags[k] = flags.hasVirtualBinding = true;
				}
			}
			element = element.parentNode;
		}
		return flags;
	}

	//取得绑定这个事件的最近的对象
	function getClosestElementWithVirtualBinding(element, eventType) {
		var b;
		while (element) {
			b = $.data(element, dataPropertyName);
			if (b && (!eventType || b[eventType])) {
				return element;
			}
			element = element.parentNode;
		}
		return null;
	}

	function enableTouchBindings() {
		blockTouchTriggers = false;
	}

	function disableTouchBindings() {
		blockTouchTriggers = true;
	}

	function enableMouseBindings() {
		lastTouchID = 0;
		clickBlockList.length = 0;
		blockMouseTriggers = false;
		disableTouchBindings();
	}

	function disableMouseBindings() {
		enableTouchBindings();
	}

	function startResetTimer() {
		clearResetTimer();
		resetTimerID = setTimeout(function () {
			resetTimerID = 0;
			enableMouseBindings();
		}, $.vmouse.resetTimerDuration);
	}

	function clearResetTimer() {
		if (resetTimerID) {
			clearTimeout(resetTimerID);
			resetTimerID = 0;
		}
	}

	function triggerVirtualEvent(eventType, event, flags) {
		var ve;
		if ((flags && flags[eventType]) || (!flags && getClosestElementWithVirtualBinding(event.target, eventType))) {
			var tagName = (event.target && event.target.tagName || "").toLowerCase();
			if (tagName == "a" || tagName == "input" || tagName == "textarea") {
				var mouseEvent = getMouseEvent(event, eventType);
				event.target.dispatchEvent(mouseEvent);
			}

			ve = createVirtualEvent(event, eventType);
			$(event.target).trigger(ve);
		}
		return ve;
	}

	//MouseEvent全部阻止？
	function mouseEventCallback(event) {
		var touchID = $.data(event.target, touchTargetPropertyName);
		if (!blockMouseTriggers && (!lastTouchID || lastTouchID !== touchID)) {
			var ve = triggerVirtualEvent(event.type, event);
			if (ve) {
				if (ve.isDefaultPrevented()) {
					event.preventDefault();
				}
				if (ve.isPropagationStopped()) {
					event.stopPropagation();
				}
				if (ve.isImmediatePropagationStopped()) {
					event.stopImmediatePropagation();
				}
			}
		}
	}

	function handleTouchStart(event) {
		var touches = getNativeEvent(event).touches, target, flags;
		if (touches && touches.length === 1) {
			target = event.target;
			flags = getVirtualBindingFlags(target);
			if (flags.hasVirtualBinding) {
				lastTouchID = nextTouchID++;
				//缓存id到dom上
				$.data(target, touchTargetPropertyName, lastTouchID);
				clearResetTimer();
				disableMouseBindings();
				didScroll = false;
				var t = getNativeEvent(event).touches[0];
				startX = t.pageX;
				startY = t.pageY;
				//triggerVirtualEvent("mouseover", event, flags);
				triggerVirtualEvent("mousedown", event, flags);
			}
		}
	}

	function handleScroll(event) {
		if (blockTouchTriggers) {
			return;
		}
		if (!didScroll) {
			triggerVirtualEvent("mousecancel", event, getVirtualBindingFlags(event.target));
		}
		didScroll = true;
		startResetTimer();
	}

	function handleTouchMove(event) {
		if (blockTouchTriggers) {
			return;
		}
		var t = getNativeEvent(event).touches[0], didCancel = didScroll, moveThreshold = $.vmouse.moveDistanceThreshold;
		didScroll = didScroll || (Math.abs(t.pageX - startX) > moveThreshold || Math.abs(t.pageY - startY) > moveThreshold), flags = getVirtualBindingFlags(event.target);
		if (didScroll && !didCancel) {
			triggerVirtualEvent("mousecancel", event, flags);
		}
		triggerVirtualEvent("mousemove", event, flags);
		startResetTimer();
	}

	function handleTouchEnd(event) {
		if (blockTouchTriggers) {
			return;
		}
		disableTouchBindings();
		var flags = getVirtualBindingFlags(event.target), t;
		triggerVirtualEvent("mouseup", event, flags);
		if (!didScroll) {
			var ve = triggerVirtualEvent("click", event, flags);
			if (ve && ve.isDefaultPrevented()) {
				t = getNativeEvent(event).changedTouches[0];
				clickBlockList.push({touchID:lastTouchID, x:t.clientX, y:t.clientY});
				blockMouseTriggers = true;
			}
		}
		//triggerVirtualEvent("mouseout", event, flags);
		didScroll = false;
		startResetTimer();
	}

	function hasVirtualBindings(ele) {
		var bindings = $.data(ele, dataPropertyName), k;
		if (bindings) {
			for (k in bindings) {
				if (bindings[k]) {
					return true;
				}
			}
		}
		return false;
	}

	function dummyMouseHandler() {
	}

	//jQuery的自定义事件的配置
	function getSpecialEventObject(eventType) {
		return {
			setup:function (data, namespace) {
				if (!hasVirtualBindings(this)) {
					$.data(this, dataPropertyName, {});
				}
				var bindings = $.data(this, dataPropertyName);
				bindings[eventType] = true;
				activeDocHandlers[eventType] = (activeDocHandlers[eventType] || 0) + 1;
				if (activeDocHandlers[ eventType ] === 1) {
					//document.addEventListener(eventType, mouseEventCallback);
				}
				if (eventCaptureSupported) {
					activeDocHandlers["touchstart"] = (activeDocHandlers["touchstart"] || 0) + 1;
					if (activeDocHandlers["touchstart"] === 1) {
						$document.bind("touchstart", handleTouchStart).bind("touchend", handleTouchEnd).bind("touchmove", handleTouchMove);/** .bind("scroll", handleScroll) */
					}
				}
			},
			teardown:function (data, namespace) {
				--activeDocHandlers[eventType];
				if (!activeDocHandlers[ eventType ]) {
					document.removeEventListener(eventType, mouseEventCallback);
				}
				if (eventCaptureSupported) {
					--activeDocHandlers["touchstart"];
					if (!activeDocHandlers["touchstart"]) {
						$document.unbind("touchstart", handleTouchStart).unbind("touchmove", handleTouchMove).unbind("touchend", handleTouchEnd)/**.unbind("scroll", handleScroll)*/;
					}
				}
				var $this = $(this), bindings = $.data(this, dataPropertyName);
				if (bindings) {
					bindings[eventType] = false;
				}
				if (!hasVirtualBindings(this)) {
					$this.removeData(dataPropertyName);
				}
			}
		};
	}

	for (var i = 0; i < virtualEventNames.length; i++) {
		$.event.special[virtualEventNames[i]] = getSpecialEventObject(virtualEventNames[i]);
	}

	if (eventCaptureSupported) {//基本上手机浏览器都支持
		document.addEventListener("click", function (e) {
			var cnt = clickBlockList.length, target = e.target, x, y, ele, i, o, touchID;
			if (cnt) {
				x = e.clientX;
				y = e.clientY;
				threshold = $.vmouse.clickDistanceThreshold;
				ele = target;
				while (ele) {
					for (i = 0; i < cnt; i++) {
						o = clickBlockList[i];
						touchID = 0;
						if ((ele === target && Math.abs(o.x - x) < threshold && Math.abs(o.y - y) < threshold) || $.data(ele, touchTargetPropertyName) === o.touchID) {
							e.preventDefault();
							e.stopPropagation();
							return;
						}
					}
					ele = ele.parentNode;
				}
			}
		}, true);
	}

	jQuery.fn.hover = function() { return this; };

	jQuery.fn.mouseover = function() { return this; };

	jQuery.fn.mouseout = function() { return this; };
})(jQuery, window, document);

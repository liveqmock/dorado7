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

/**
 * @author Frank Zhang (mailto:frank.zhang@bstek.com)
 * @component Base
 * @class 滑动条
 * @extends dorado.widget.Control
 */
dorado.widget.Slider = $extend(dorado.widget.Control, /** @scope dorado.widget.Slider.prototype */ {
	$className: "dorado.widget.Slider",
	selectable: false,
	focusable: true,
    
	ATTRIBUTES: /** @scope dorado.widget.Slider.prototype */{
		className: {
			defaultValue: "d-slider"
		},

		height: {
			independent: true
		},

		/**
		 * 滑动条的方向，可选值为horizontal和vertical，默认值为horizontal
		 * @attribute
		 * @default "horizontal"
		 * @type String
		 */
		orientation: {
			defaultValue: "horizontal"
		},

		/**
		 * 滑动条的最小值，默认为0
		 * @attribute
		 * @default 0
		 * @type int|float|double
		 */
		minValue: {
			defaultValue: 0,
			setter: function(value) {
				var parseValue = parseFloat(value);
				if (isNaN(parseValue)) {
					throw new dorado.ResourceException("dorado.baseWidget.NumberFormatInvalid", value);
				}
				this._minValue = parseValue;
			}
		},

		/**
		 * 滑动条的最大值，默认为100
		 * @attribute
		 * @default 100
		 * @type int|float|double
		 */
		maxValue: {
			defaultValue: 100,
			setter: function(value) {
				var parseValue = parseFloat(value);
				if (isNaN(parseValue)) {
					throw new dorado.ResourceException("dorado.baseWidget.NumberFormatInvalid", value);
				}
				this._maxValue = parseValue;
			}
		},

		/**
		 * 滑动条的当前值
		 * @attribute
		 * @type int|float|double
		 */
		value: {
            setter: function(value){
                var slider = this, minValue = slider._minValue, maxValue = slider._maxValue, parseValue = parseFloat(value);
	            if (isNaN(parseValue)) {
		            throw new dorado.ResourceException("dorado.baseWidget.NumberFormatInvalid", value);
	            }

	            if (parseValue < minValue || parseValue > maxValue) {
		            throw new dorado.ResourceException("dorado.baseWidget.NumberRangeInvalid", minValue, maxValue, value);
	            }

	            value = slider.getValidValue(parseValue);

	            var eventArg = {
		            value: value
	            };

                slider.fireEvent("beforeValueChange", slider, eventArg);
	            if (eventArg.processDefault === false) return;
                slider._value = value;
                slider.fireEvent("onValueChange", slider);
            }
        },

		/**
		 * 滑动条的精度，默认为0。<br />
		 * 该参数的含义是value的取值会取小数点后几位，设置值完毕以后，会根据该设置会进行四舍五入。
		 * @attribute
		 * @default 0
		 * @type int
		 */
		precision: {
			defaultValue: 0
		},

		/**
		 * 滑动条值的每次的增加值，默认为null，默认允许一次可以增加任意值，但仍然会受到precision的约束。<br />
		 * 需要注意的是，当设置该值以后，要保证(maxValue - minValue) / step为整数。
		 * @attribute
		 * @type int|float|double
		 */
		step: {}
	},
    EVENTS: /** @scope dorado.widget.Slider.prototype */{
	    /**
	     * 在Slider的value更改之前触发。
	     * @event
	     * @param {Object} self 触发该事件的Slider。
	     * @param {Object} arg 事件参数。
	     * @param {int|float|double} arg.value 当前value。
	     * @param {boolean} #arg.processDefault=true 是否继续执行后续的触发器动作。
	     */
        beforeValueChange: {},
        /**
         * 在Slider的value更改之后触发。
         * @event
         * @param {Object} self 触发该事件的Slider。
         */
        onValueChange: {}
    },
	constructor: function(config) {
		config = config || {};
		var value = config.value;
		delete config.value;

		$invokeSuper.call(this, arguments);
		if (value) this.set({ value: value });

		//this._value = this.getValidValue(this._value);
	},
	createDom: function() {
		var slider = this, dom, doms = {}, orientation = slider._orientation;
		dom = $DomUtils.xCreate({
			tagName: "div",
			content: [
				{
					tagName: "div",
					className: "slider-start",
					contextKey: "start"
				},
				{
					tagName: "div",
					className: "slider-end",
					contextKey: "end"
				},
				{
					tagName: "div",
					className: "slider-body",
					contextKey: "body"
				},
				{
					tagName: "div",
					className: "slider-current",
					contextKey: "current"
				},
				{
					tagName: "div",
					className: "slider-thumb",
					contextKey: "thumb",
					style: {
						position: "absolute"
					}
				}
			]
		}, null, doms);

		slider._doms = doms;

		var axis = (orientation == "vertical") ? "y" : "x";
		
		var tip;
		if (!dorado.Browser.isTouch) {
			tip = new dorado.widget.Tip({
				animateType: "none"
			});
		}

		jQuery(doms.thumb).addClassOnHover("slider-thumb-hover").addClassOnClick("slider-thumb-click").draggable({
			addClasses: false,
			containment: "parent",
			axis: axis,
			stop: function(event, ui) {
				var helper = ui.helper[0], minValue = slider._minValue, maxValue = slider._maxValue, offset, size, thumbSize;
				if (orientation == "horizontal") {
					thumbSize = doms.thumb.offsetWidth;
					size = $fly(dom).width() - thumbSize;
					offset = parseInt($fly(helper).css("left"), 10);
				}
				else {
					thumbSize = doms.thumb.offsetHeight;
					size = $fly(dom).height() - thumbSize;
					offset = parseInt($fly(helper).css("top"), 10);
				}

                slider.set("value", (maxValue - minValue) * offset / size + minValue);

				if (tip) tip.hide();
			},
			drag: function(event, ui) {
				var helper = ui.helper[0], minValue = slider._minValue, maxValue = slider._maxValue, offset, size, thumbSize;
				if (orientation == "horizontal") {
					thumbSize = doms.thumb.offsetWidth;
					size = $fly(dom).width() - thumbSize;
					offset = parseInt($fly(helper).css("left"), 10);
					$fly(doms.current).css("width", offset);
				} else {
					thumbSize = doms.thumb.offsetHeight;
					size = $fly(dom).height() - thumbSize;
					offset = parseInt($fly(helper).css("top"), 10);
					$fly(doms.current).css("height", offset);
				}

				if (tip) {
					tip.set("text", slider.getValidValue((maxValue - minValue) * offset / size) + minValue);
					tip.refresh();
					if (!tip._dom) return;
				
					if (orientation == "horizontal") {
						$DomUtils.dockAround(tip._dom, slider._doms.thumb, {
							align: "center",
							vAlign: "top",
	                        offsetTop: -10
						});
					} else {
						$DomUtils.dockAround(tip._dom, slider._doms.thumb, {
							align: "right",
							vAlign: "center",
	                        offsetLeft: 10
						});
					}
				}
			},
			start: function(event, ui){
				if (!tip) return;
				tip.set("text", slider._value);
				tip.show({
					anchorTarget: ui.helper[0],
					align: "center",
					vAlign: "top"
				});
			}
		});

		return dom;
	},
	getValidValue: function(value) {
		function formatDecimal(value, precision) {
			if (precision == null) {
				precision = 0;
			}

			var result = value * Math.pow(10, precision);
			if (result - Math.floor(result) >= 0.5) {
				return (Math.floor(result) + 1) / Math.pow(10, precision);
			} else {
				return Math.floor(result) / Math.pow(10, precision);
			}
		}

		var slider = this, step = slider._step, result, minValue = slider._minValue, maxValue = slider._maxValue;
		if (value != undefined) {
			result = formatDecimal(value, slider._precision);

			if (step != null) {
				var total = (maxValue - minValue) / step, left = Math.floor((result - minValue) / step),
					right = left + 1;

				if (right > total) {
					result = formatDecimal(maxValue, slider._precision);
				} else {
					if (Math.abs(minValue + step * right - result) > Math.abs(minValue + step * left - result)) {
						result = formatDecimal(minValue + step * left, slider._precision);
					} else {
						result = formatDecimal(minValue + step * right, slider._precision);
					}
				}
			}

			return result;
		}

		return null;
	},
	onClick: function(event) {
		var target = event.target || event.srcElement;
		if (target.className.indexOf("slider-thumb") != -1) {
			return;
		}

		var slider = this, dom = slider._dom, doms = slider._doms, pageX = event.pageX, pageY = event.pageY,
			position = $fly(dom).offset(), offset, size, thumbSize;

		if (slider._orientation == "horizontal") {
			size = $fly(dom).innerWidth();
			thumbSize = $fly(doms.thumb).outerWidth();
			offset = pageX - position.left;
		} else {
			size = $fly(dom).innerHeight();
			thumbSize = $fly(doms.thumb).outerHeight();
			offset = pageY - position.top;
		}

		var percent = (offset - thumbSize / 2) / (size - thumbSize);
		if (percent < 0) {
			percent = 0;
		} else {
			if (percent > 1) {
				percent = 1;
			}
		}

		slider.set("value", (slider._maxValue - slider._minValue) * percent);
	},
	doOnResize: function() {
		if (!this._ready) return;
		this.refresh();
	},
	refreshDom: function(dom) {
		$invokeSuper.call(this, arguments);

		var slider = this, doms = slider._doms, orientation = slider._orientation, maxValue = slider._maxValue, minValue = slider._minValue,
			value = slider._value, thumbSize, step = slider._step, handleIncrease = (step != null), stepCount;

		$fly(dom).addClass(this._className + "-" + orientation);
		
		if (value == null) {
			value = minValue;
		}

		if (handleIncrease) {
			stepCount = (maxValue - minValue) / step;
			if (stepCount - Math.floor(stepCount) > 0.00000000001) {
				handleIncrease = false;
			}
		}

		if (orientation == "vertical") {
			thumbSize = doms.thumb.offsetHeight;
			var height, startHeight, endHeight;

			height = $fly(dom).innerHeight();
			startHeight = $fly(doms.start).innerHeight();
			endHeight = $fly(doms.end).innerHeight();

			$fly(doms.body).height(height - startHeight - endHeight);
			$fly(doms.thumb).css("top", (height - thumbSize) * (value - minValue) / (maxValue - minValue));
			$fly(doms.current).css("height", (height - thumbSize) * (value - minValue) / (maxValue - minValue));

			if (handleIncrease) {
				$fly(doms.thumb).draggable("option", "grid", [0, (height - thumbSize) / stepCount]);
			}
		} else {
			thumbSize = doms.thumb.offsetWidth;
			var width = $fly(dom).innerWidth();

			$fly(doms.thumb).css("left", (width - thumbSize) * (value - minValue) / (maxValue - minValue));
			$fly(doms.current).css("width", (width - thumbSize) * (value - minValue) / (maxValue - minValue));

			if (handleIncrease) {
				$fly(doms.thumb).draggable("option", "grid", [(width - thumbSize) / stepCount, 0]);
			}
		}
	}
});

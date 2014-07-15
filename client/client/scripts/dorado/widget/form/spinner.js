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

	/**
	 * @author Frank Zhang (mailto:frank.zhang@bstek.com)
	 * @author Benny Bao (mailto:benny.bao@bstek.com)
	 * @class
	 * Spinner右侧的按钮。
	 * @extends dorado.widget.Trigger
	 */
	dorado.widget.SpinnerTrigger = $extend(dorado.widget.Trigger, /** @scope dorado.widget.SpinnerTrigger.prototype */ {
		$className: "dorado.widget.SpinnerTrigger",
		
		ATTRIBUTES: /** @scope dorado.widget.SpinnerTrigger.prototype */ {
			className: {
				defaultValue: "d-trigger d-spinner-trigger"
			}
		},
		
		createTriggerButton: function(editor) {
			var trigger = this, control = new dorado.widget.HtmlContainer({
				exClassName: (trigger._className || ''),
				content: {
					tagName: "div",
					content: [{
						tagName: "div",
						className: "up-button",
						contextKey: "upButton",
						content: {
							tagName: "div",
							className: "icon"
						}
					}, {
						tagName: "div",
						className: "down-button",
						contextKey: "downButton",
						content: {
							tagName: "div",
							className: "icon"
						}
					}]
				}
			});
			
			control.getDom();
			
			jQuery(control.getSubDom("upButton")).repeatOnClick(function() {
				if (!editor._realReadOnly) editor.doStepUp();
			}, 150).addClassOnClick("up-button-click", null, function() {
				return !editor._realReadOnly;
			});
			jQuery(control.getSubDom("downButton")).repeatOnClick(function() {
				if (!editor._realReadOnly) editor.doStepDown();
			}, 150).addClassOnClick("down-button-click", null, function() {
				return !editor._realReadOnly;
			});
			return control;
		}
	});
	
	/**
	 * @author Frank Zhang (mailto:frank.zhang@bstek.com)
	 * @author Benny Bao (mailto:benny.bao@bstek.com)
	 * @class 微调编辑器的抽象类。
	 * @abstract
	 * <p>
	 * 提供step属性以及初始化trigger的方法。
	 * </p>
	 * @extends dorado.widget.AbstractTextBox
	 * @abstract
	 */
	dorado.widget.Spinner = $extend(dorado.widget.AbstractTextBox, /** @scope dorado.widget.Spinner.prototype */ {
		$className: "dorado.widget.Spinner",
		
		focusable: true,
		
		ATTRIBUTES: /** @scope dorado.widget.Spinner.prototype */ {
		
			width: {
				defaultValue: 150
			},
			
			height: {
				independent: true,
				readOnly: true
			},
			
			trigger: {
				getter: function() {
					var triggers = this._trigger;
					if (triggers && !(triggers instanceof Array)) {
						triggers = [triggers];
					}
					var spinnerTriggers = this.getSpinnerTriggers();
					return triggers ? spinnerTriggers.concat(triggers) : spinnerTriggers;
				}
			},
			
			/**
			 * 是否显示微调按钮。
			 * @attribute
			 * @type boolean
			 * @default true
			 */
			showSpinTrigger: {
				defaultValue: true
			},
			
			/**
			 * 点击向上或者向下按钮时，每次变化的大小，默认值为1。
			 * @attribute
			 * @type int
			 * @default 1
			 */
			step: {
				defaultValue: 1
			},
			
			/**
			 * 是否在用户操作Spinner按钮之后自动确认相应编辑框中的内容。
			 * 
			 * @type boolean
			 * @attribute
			 * @default true
			 * @see dorado.widget.AbstractTextEditor#post
			 */
			postValueOnSpin: {
				defaultValue: true
			}
		},
		
		getSpinnerTriggers: function() {
			if (!this._showSpinTrigger) return [];
			if (!this._spinTrigger) {
				var triggers = this._spinTrigger = [], self = this;
				triggers.push(new dorado.widget.SpinnerTrigger({}));
			}
			return this._spinTrigger;
		},
		
		createDom: function() {
			var dom = $invokeSuper.call(this, arguments), self = this;
			jQuery(dom).addClassOnHover(this._className + "-hover", null, function() {
				return !self._realReadOnly;
			});
			return dom;
		}
	});
	
	/**
	 * @author Frank Zhang (mailto:frank.zhang@bstek.com)
	 * @component Form
	 * @class 数字微调编辑器。
	 * @extends dorado.widget.Spinner
	 */
	dorado.widget.NumberSpinner = $extend(dorado.widget.Spinner, /** @scope dorado.widget.NumberSpinner.prototype */ {
		$className: "dorado.widget.NumberSpinner",

		ATTRIBUTES: /** @scope dorado.widget.NumberSpinner.prototype */ {
		
			/**
			 * 最小值。
			 * @type int
			 * @default -2147483648
			 * @attribute
			 */
			min: {
				defaultValue: -2147483648
			},
			
			/**
			 * 最大值。
			 * @type int
			 * @default 2147483648
			 * @attribute
			 */
			max: {
				defaultValue: 2147483648
			},
			
			text: {
				defaultValue: 0
			},
			
			value: {
				getter: function() {
					return parseInt(this.get("text"), 10);
				},
				setter: function(value) {
					value = this.getValidValue(value);
					this._value = value;
					this.doSetText((value != null) ? (value + '') : '');
				}
			},
			
			/**
			 * 是否在获得焦点时自动选中编辑框中的文本。
			 * @type boolean
			 * @default true
			 * @attribute
			 */
			selectTextOnFocus: {
				defaultValue: true
			}
		},
		
		createTextDom: function() {
			var textDom = document.createElement("INPUT");
			textDom.className = "editor";
            textDom.imeMode = "disabled";
			if (dorado.Browser.msie && dorado.Browser.version > 7) {
				textDom.style.top = 0;
				textDom.style.position = "absolute";
			} else {
				textDom.style.padding = 0;
			}
			return textDom;
		},
		
		doGetText: function() {
			return (this._textDom) ? this._textDom.value : this._text;
		},
		
		doSetText: function(text) {
			if (this._textDom) {
				this._textDom.value = text;
			} else {
				this._text = text;
			}
		},
		
		doStepUp: function() {
			var spinner = this;
			var value = parseInt(spinner.get("value"), 10);
			if (!isNaN(value)) {
				value += spinner._step;
				if (this._max !== undefined && value > this._max) return;
				spinner.set("value", value);
				if (spinner._postValueOnSpin) spinner.post();
			}
		},
		
		doStepDown: function() {
			var spinner = this;
			var value = parseInt(spinner.get("value"), 10);
			if (!isNaN(value)) {
				value -= spinner._step;
				if (this._min !== undefined && value < this._min) return;
				spinner.set("value", value);
				if (spinner._postValueOnSpin) spinner.post();
			}
		},
		
		getValidValue: function(value) {
            if (isNaN(value)) {
                value = "";
            } else if (value != null) {
				if (value > this._max) value = this._max;
				else if (value < this._min) value = this._min;
			}
			return value;
		},
		
		post: function(force) {
			var text = this.get("text"), value = text ? parseInt(text, 10) : null;
            if (text != value) this._textDom.value = value;
			var value2 = this.getValidValue(value);
			if (value2 != value) {
				this.set("value", value2);
			}
			$invokeSuper.call(this, arguments);
		},
		
		doOnFocus: function() {
			$invokeSuper.call(this, arguments);
			
			if (this._selectTextOnFocus) {
				$setTimeout(this, function() {
					this._textDom.select();
				}, 0);
			}
		},

        doOnKeyDown: function(event) {
            var spinner = this, retval = true;
            switch (event.keyCode) {
                case 38:
                    // up arrow
                    if (!spinner._realReadOnly) {
                        spinner.doStepUp();
                        retval = false;
                    }
                    break;

                case 40:
                    // down arrow
                    if (!spinner._realReadOnly) {
                        spinner.doStepDown();
                        retval = false;
                    }
                    break;

                case 37: //left
                case 39: //right
                case 8: //tab
                case 9: // backspace
                case 13: //enter
                case 35: //home
                case 36: //end
                case 46: //delete
                    break;

                case 187:
                    // +
                    var text = this.get("text"), value = text ? parseInt(text) : null;
                    if (value) {
                        value = Math.abs(value);
                        spinner._textDom.value = value;
                    }
                    retval = false;
                    break;

                case 189:
                    // -
                    var text = this.get("text"), value = text ? parseInt(text) : null;
                    if (value) {
                        value = 0 - Math.abs(value);
                        spinner._textDom.value = value;
                    }
                    retval = false;
                    break;

                default:
                    // 48-57 96-105
                    if ((event.keyCode >= 48 && event.keyCode <= 57) || (event.keyCode >= 96 && event.keyCode <= 105)) {
                    } else {
                        retval = false;
                    }
                    break;
            }
            return retval;
        }
	});
	
	/**
	 * @author Frank Zhang (mailto:frank.zhang@bstek.com)
	 * @author Benny Bao (mailto:benny.bao@bstek.com)
	 * @class 多槽微调编辑器。
	 * <p>
	 * 该组件与NumberSpinner的区别在于该组件可以微调多个数字，而不是一个。每个被微调数字之间可以有分隔符，可以定义自己的取值范围等。
	 * 另外，该组件的每个槽使用的不是文本编辑框，不能使用光标来编辑每个槽中的文字。
	 * </p>
	 *
	 * <p>
	 * 如果要继承该类，大概有两个参数需要配置。
	 * 第一个是slotConfigs，该属性配置方式如下：
	 * 该配置是一个数组，数组中的每个元素代表一个槽的配置。
	 * 每个槽的配置是一个json对象，可以配置的属性如下：
	 * <ul>
	 * <li>name	-	{String} 该槽的名字。必须配置。</li>
	 * <li>className	-	{String} 该槽使用的className。可选配置。</li>
	 * <li>range	-	{Integer[]} 该槽数值的取值范围。<br>
	 * 此属性的值应是一个长度为2的数组，数组中的第一项表示可接受的最小值，第二项表示最大值。<br>
	 * 如果某一项设置成null，则表示不对此项进行校验。例如：<code>[1, null]</code>表此槽可接受的数值为大于或等于1的整数。<br>
	 * 此属性可选配置项，默认为空，表示忽略对于最大最小值的判断校验。</li>
	 * <li>defaultValue	-	{int} 该槽的默认值。可选配置，此属性的默认值为0。</li>
	 * <li>digit	-	{int} 该槽的数位。当设置了此属性后，如果实际数值的位数小此数位值系统将在显示时自动前置补零。此属性的默认值为0，表示不启用自动补零的功能。</li>
	 * <li>prefix	-	{String} 前缀字符串。可选配置。</li>
	 * <li>suffix	-	{String} 后缀字符串。可选配置。</li>
	 * </ul>
	 * 另外，还有一个参数defaultSlot，该参数的含义是默认的编辑槽的配置。
	 * </p>
	 *
	 * @extends dorado.widget.Spinner
	 * @abstract
	 */
	dorado.widget.MultiSlotSpinner = $extend(dorado.widget.Spinner, /** @scope dorado.widget.MultiSlotSpinner.prototype */ {
		$className: "dorado.widget.MultiSlotSpinner",
		
		/**
		 * 微调槽的配置信息。
		 * <p>
		 * 该属性的是各微调槽的配置信息组成的数组。其中每一个微调槽的配置信息包含以下的子属性：
		 * <ul>
		 * <li>name	-	{String} 该槽的名字。可选配置。</li>
		 * <li>className	-	{String} 该槽使用的CSS class名。可选配置，默认情况下将使用slot作为class名。</li>
		 * <li>range	-	{Integer[]} 该槽数值的取值范围。<br>
		 * 此属性的值应是一个长度为2的数组，数组中的第一项表示可接受的最小值，第二项表示最大值。<br>
		 * 如果某一项设置成null，则表示不对此项进行校验。例如：<code>[1, null]</code>表此槽可接受的数值为大于或等于1的整数。<br>
		 * 此属性可选配置项，默认为空，表示忽略对于最大最小值的判断校验。</li>
		 * <li>defaultValue	-	{int} 该槽的默认值。可选配置，此属性的默认值为0。</li>
		 * <li>digit	-	{int} 该槽的数位。当设置了此属性后，如果实际数值的位数小此数位值系统将在显示时自动前置补零。此属性的默认值为0，表示不启用自动补零的功能。</li>
		 * <li>prefix	-	{String} 前缀字符串。可选配置。</li>
		 * <li>suffix	-	{String} 后缀字符串。可选配置。</li>
		 * </ul>
		 * </p>
		 * @protected
		 * @type Object[]
		 *
		 * @example
		 * // 下面的配置定义了一个用于表示时间的多槽编辑器
		 * slotConfigs: [{
		 *		name: "hours",
		 *		range: [0, 23],
		 *		defaultValue: 0
		 *	}, {
		 *		name: "minutes",
		 *		range: [0, 59],
		 *		defaultValue: 0
		 *	}, {
		 *		name: "seconds",
		 *		range: [0, 59],
		 *		defaultValue: 0
		 *	}]
		 */
		slotConfigs: [{}],
		
		/**
		 * 默认的槽的序号（自零开始计算的序号）或名称。
		 * @protected
		 * @type int|String
		 * @default 0
		 */
		defaultSlot: 0,
		
		constructor: function() {
			if (this.slotConfigs) this.initSlotConfigs();
			this._currentSlotIndex = 0;
			$invokeSuper.call(this, arguments);
		},
		
		initSlotConfigs: function() {
			var slotConfigs = this.slotConfigs, slotMap = this._slotMap = {}, values = this._values = [];
			for (var i = 0, j = slotConfigs.length; i < j; i++) {
				var config = slotConfigs[i], name = config.name;
				config.className = config.className || "slot";
				config.range = config.range || [null, null];
				slotMap[name] = config;
				values[i] = config.defaultValue;
			}
		},
		
		createTextDom: function() {
			var spinner = this, doms = {}, dom = $DomUtils.xCreate({
				tagName: "div",
				className: "editor slots-container",
				contextKey: "editor"
			}, null, doms);
			spinner._doms = doms;
			
			var slotConfigs = spinner.slotConfigs;
			for (var i = 0, j = slotConfigs.length; i < j; i++) {
				var config = slotConfigs[i], name = config.name;
				
				var label = document.createElement("span");
				label.className = config.className;
				label.slotIndex = i;
				
				doms["slot_" + i] = label;
				
				$fly(label).mousedown(function() {
					spinner.doChangeCurrentSlot(parseInt(this.slotIndex));
				});
				if (config.prefix) {
					var spEl = document.createElement("span");
					$fly(spEl).text(config.prefix).prop("class", "text");
					$fly(doms.editor).append(spEl);
				}
				
				$fly(doms.editor).append(label);
				
				if (config.suffix) {
					var spEl = document.createElement("span");
					$fly(spEl).text(config.suffix).prop("class", "text");
					$fly(doms.editor).append(spEl);
				}
			}
			return dom;
		},
		
		doSetFocus: function() {
			dorado.widget.onControlGainedFocus(this);
		},
		
		/**
		 * 取得某个槽的取值范围。
		 * @protected
		 * @param {int|String} slotIndex 要取得值的槽的名称或槽的序号（自零开始计算的序号）。
		 * @return {int[]} 取得的指定的槽的取值范围。
		 */
		doGetSlotRange: function(slotIndex) {
			if (typeof slotIndex == "string") {
				slotIndex = this.getSlotIndexByName(slotIndex);
			}
			return this.slotConfigs[slotIndex].range;
		},
		
		/**
		 * 根据槽的名称返回槽的序号。<br>
		 * 如果槽的名称无效则返回-1。
		 * @protected
		 * @param {String} name 槽的名称。
		 * @return {int} 槽的序号（自零开始计算的序号）。
		 */
		getSlotIndexByName: function(name) {
			var config = this._slotMap[name];
			return config ? this.slotConfigs.indexOf(config) : -1;
		},
		
		/**
		 * 取得某个槽的值。
		 * @protected
		 * @param {int|String} slotIndex 要取得值的槽的名称或槽的序号（自零开始计算的序号）。
		 * @return {int} 取得的指定的槽的值。
		 */
		doGetSlotValue: function(slotIndex) {
			this._slotValueChanged = true;
			if (typeof slotIndex == "string") {
				slotIndex = this.getSlotIndexByName(slotIndex);
			}
			return this._values[slotIndex];
		},
		
		/**
		 * 为某个槽设置值。
		 * @protected
		 * @param {int|String} slotIndex 要取得值的槽的名称或槽的序号（自零开始计算的序号）。
		 * @param {int|String} value 要设置给槽的值。
		 */
		doSetSlotValue: function(slotIndex, value) {
			var spinner = this;
			if (typeof slotIndex == "string") {
				slotIndex = spinner.getSlotIndexByName(slotIndex);
			}
			if (slotIndex < 0) return;
			
			if (value != null) {
				var config = spinner.slotConfigs[slotIndex], range = config.range || [], minValue = range[0], maxValue = range[1];
				value = parseInt(value, 10);
				if (isNaN(value)) {
					value = config.defaultValue || 0;
				}
				if (maxValue != null && value > maxValue) {
					value = maxValue;
				} else if (minValue != null && value < minValue) {
					value = minValue;
				}
			}
			this._values[slotIndex] = value;
			
			dorado.Toolkits.setDelayedAction(spinner, "$refreshDelayTimerId", spinner.refresh, 50);
		},
		
		/**
		 * 取得某个槽的显示值。
		 * @protected
		 * @param {int|String} slotIndex 要取得值的槽的名称或槽的序号（自零开始计算的序号）。
		 * @return {String} 取得的指定的槽的显示值。
		 */
		doGetSlotText: function(slotIndex) {
			var spinner = this;
			if (typeof slotIndex == "string") {
				slotIndex = spinner.getSlotIndexByName(slotIndex);
			}
			if (slotIndex < 0) return "";
			
			var config = spinner.slotConfigs[slotIndex];
			var text = this.doGetSlotValue(slotIndex);
			if (text == null) {
				if (config.digit > 0) {
					text = '';
					for (var i = 0; i < config.digit; i++) 
						text += "&nbsp;";
				} else {
					text = "&nbsp;";
				}
			} else {
				var num = text, negative = (num < 0), text = Math.abs(num) + "";
				if (config.digit > 0 && text.length < config.digit) {
					for (var i = text.length; i <= config.digit - 1; i++) {
						text = '0' + text;
					}
				}
				text = (negative ? '-' : '') + text;
			}
			return text;
		},
		
		/**
		 * 向上微调，当用户点击向上按钮的时候会调用该方法。
		 * @protected
		 */
		doStepUp: function() {
			var spinner = this, currentSlotIndex = spinner._currentSlotIndex;
			if (!currentSlotIndex) {
				currentSlotIndex = spinner.doChangeCurrentSlot();
			}
			
			var value = spinner.doGetSlotValue(currentSlotIndex) + spinner._step;
			var config = spinner.slotConfigs[currentSlotIndex], range = spinner.doGetSlotRange(currentSlotIndex), minValue = range[0], maxValue = range[1];
			if (value == null) value = minValue;
			else if (maxValue != null && value > maxValue) return;
			spinner.doSetSlotValue(currentSlotIndex, value || 0);
			if (spinner._postValueOnSpin) spinner.post();
		},
		
		/**
		 * 向下微调，当用户点击向下按钮的时候会调用该方法。
		 * @protected
		 */
		doStepDown: function() {
			var spinner = this, currentSlotIndex = spinner._currentSlotIndex;
			if (!currentSlotIndex) {
				currentSlotIndex = spinner.doChangeCurrentSlot();
			}
			
			var value = spinner.doGetSlotValue(currentSlotIndex) - spinner._step;
			var config = spinner.slotConfigs[currentSlotIndex], range = spinner.doGetSlotRange(currentSlotIndex), minValue = range[0], maxValue = range[1];
			if (value == null) value = maxValue;
			if (minValue != null && value < minValue) return;
			spinner.doSetSlotValue(currentSlotIndex, value || 0);
			if (spinner._postValueOnSpin) spinner.post();
		},
		
		doOnKeyDown: function(event) {
			var spinner = this, retval = true;
			switch (event.keyCode) {
				case 38:
					// up arrow
					if (!spinner._realReadOnly) {
						spinner.doStepUp();
						retval = false;
					}
					break;
					
				case 40:
					// down arrow
					if (!spinner._realReadOnly) {
						spinner.doStepDown();
						retval = false;
					}
					break;
					
				case 8:
					// backspace
					if (spinner._currentSlotIndex >= 0 && !spinner._realReadOnly) {
						var currentSlotIndex = spinner._currentSlotIndex, value, range = spinner.doGetSlotRange(currentSlotIndex);
						if (spinner._neverEdit) {
							value = 0;
						} else {
							var text = spinner.doGetSlotText(currentSlotIndex);
							value = parseInt(text.substring(0, text.length - 1), 10);
						}
						spinner.doSetSlotValue(currentSlotIndex, value);
					}
					retval = false;
					break;
					
				case 9:
					// tab
					if (event.ctrlKey || !event.shiftKey && spinner._currentSlotIndex == spinner.slotConfigs.length - 1 || event.shiftKey && spinner._currentSlotIndex == 0) {
						retval = true;
					} else {
						spinner.doChangeCurrentSlot(event.shiftKey ? "prev" : "next");
						retval = false;
					}
					break;
					
				case 187:
					// +
					if (spinner._currentSlotIndex >= 0 && !spinner._realReadOnly) {
						var currentSlotIndex = spinner._currentSlotIndex, value = spinner.doGetSlotValue(currentSlotIndex) || 0;
						if (value) {
							value = Math.abs(value);
							spinner.doSetSlotValue(currentSlotIndex, value);
						}
						retval = false;
					}
					break;
					
				case 189:
					// -
					if (spinner._currentSlotIndex >= 0 && !spinner._realReadOnly) {
						var currentSlotIndex = spinner._currentSlotIndex, value = spinner.doGetSlotValue(currentSlotIndex) || 0;
						if (value) {
							value = 0 - Math.abs(value);
							spinner.doSetSlotValue(currentSlotIndex, value);
						}
						retval = false;
					}
					break;
					
				default:
					// 48-57
					if (spinner._currentSlotIndex >= 0 && !spinner._realReadOnly) {
						if ((event.keyCode >= 48 && event.keyCode <= 57) || (event.keyCode >= 96 && event.keyCode <= 105)) {
							var number = event.keyCode >= 96 ? event.keyCode - 96 : event.keyCode - 48, currentSlotIndex = spinner._currentSlotIndex, range = spinner.doGetSlotRange(currentSlotIndex), maxValue = range[1];
							var value = spinner._neverEdit ? 0 : (spinner.doGetSlotValue(currentSlotIndex) || 0), ignore = false;
							var config = spinner.slotConfigs[currentSlotIndex], digit = config.digit;
							if (!digit && maxValue != null) {
								digit = (maxValue + '').length;
							}
							//Modified by Frank 修复http://www.bsdn.org/projects/dorado7/issue/dorado7-2433
							//if (digit && (value + '').length == digit) {
							//	ignore = true;
							//} else {
							value = value * 10 + number;
							if (maxValue != null && value > maxValue) value = number;
								//ignore = (maxValue != null && value > maxValue);
							//}
							if (!ignore) spinner.doSetSlotValue(currentSlotIndex, value);
							retval = false;
						}
					}
					break;
			}
			if (retval === false) spinner._neverEdit = false;
			return retval;
		},
		
		/**
		 * 切换当前编辑的槽。
		 * @protected
		 * @param {int|String} [slotIndex=0] 要切换的槽的name或槽的的序号（自零开始计算的序号）。<br>
		 * 或者如果传入的值是next或prev还可以表示一下含义：next表示切换到下一个槽，prev表示切换到上一个槽。
		 * @return {int} 新的当前槽的序号。
		 */
		doChangeCurrentSlot: function(slotIndex) {
			var spinner = this;
			if (typeof slotIndex == "string") {
				if (slotIndex == "next") {
					slotIndex = (spinner._currentSlotIndex >= 0) ? spinner._currentSlotIndex + 1 : spinner.defaultSlot;
				} else if (slotIndex == "prev") {
					slotIndex = (spinner._currentSlotIndex >= 0) ? spinner._currentSlotIndex - 1 : spinner.defaultSlot;
				} else {
					slotIndex = spinner.getSlotIndexByName(slotIndex);
				}
			}
			slotIndex = slotIndex || 0;
			
			var oldSlotIndex = spinner._currentSlotIndex, doms = spinner._doms;
			var config = spinner.slotConfigs[slotIndex];
			if (config) {
				if (oldSlotIndex >= 0) {
					var oldSlotConfig = spinner.slotConfigs[oldSlotIndex];
					$fly(doms["slot_" + oldSlotIndex]).removeClass(oldSlotConfig.className + "-selected");
					spinner.doAfterSlotBlur(oldSlotIndex);
				}
				
				$fly(doms["slot_" + slotIndex]).addClass(config.className + "-selected");
				spinner._currentSlotIndex = slotIndex;
				return slotIndex;
			} else {
				return oldSlotIndex;
			}
		},
		
		/**
		 * 当某个槽失去焦点以后，会调用此方法。<br>
		 * 此方法会判断失去焦点的槽的值是不是空，如果是空，则把defaultValue赋值给该槽。
		 * @protected
		 * @param {int} slotIndex 失去焦点的槽的序号。
		 */
		doAfterSlotBlur: function(slotIndex) {
			var spinner = this, value = spinner.doGetSlotValue(slotIndex);
			if (value == null) {
				spinner.doSetSlotValue(slotIndex, spinner.slotConfigs[slotIndex].defaultValue);
			}
		},
		
		doOnBlur: function() {
			var spinner = this, currentSlotIndex = spinner._currentSlotIndex, doms = spinner._doms;
			if (currentSlotIndex >= 0) {
				$fly(doms["slot_" + currentSlotIndex]).removeClass(spinner.slotConfigs[currentSlotIndex].className + "-selected");
				spinner.doAfterSlotBlur(currentSlotIndex);
			}
			this.post(true);
		},
		
		doOnFocus: function() {
			var spinner = this, currentSlotIndex = spinner._currentSlotIndex, doms = spinner._doms;
			spinner._neverEdit = true;
			if (currentSlotIndex >= 0 && !spinner._realReadOnly) {
				$fly(doms["slot_" + currentSlotIndex]).addClass(spinner.slotConfigs[currentSlotIndex].className + "-selected");
			}
		},
		
		refreshDom: function() {
			$invokeSuper.call(this, arguments);
			var spinner = this, doms = spinner._doms;
			for (var i = 0; i < spinner.slotConfigs.length; i++) {
				$fly(doms["slot_" + i]).html(spinner.doGetSlotText(i));
			}
		},
		
		doGetText: function() {
			var spinner = this, slotConfigs = spinner.slotConfigs, text = "";
			for (var i = 0; i < slotConfigs.length; i++) {
				var config = slotConfigs[i];
				text += config.prefix || "";
				text += spinner.doGetSlotText(i);
				text += config.suffix || "";
			}
			return text;
		}
	});
	
	function slotAttributeGetter(attr) {
		return this.doGetSlotValue(attr);
	}
	
	function slotAttributeSetter(value, attr) {
		this.doSetSlotValue(attr, value);
	}
	
	var now = new Date();
	
	/**
	 * @author Frank Zhang (mailto:frank.zhang@bstek.com)
	 * @author Benny Bao (mailto:benny.bao@bstek.com)
	 * @component Form
	 * @class 日期时间微调编辑器。
	 * @extends dorado.widget.MultiSlotSpinner
	 */
	dorado.widget.DateTimeSpinner = $extend(dorado.widget.MultiSlotSpinner, /** @scope dorado.widget.DateTimeSpinner.prototype */ {
		$className: "dorado.widget.DateTimeSpinner",
		
		slotConfigTemplate: {
			year: {
				name: "year",
				range: [0, 9999],
				defaultValue: now.getFullYear()
			},
			month: {
				name: "month",
				range: [1, 12],
				defaultValue: now.getMonth() + 1,
				digit: 2,
				prefix: "-"
			},
			date: {
				name: "date",
				range: [1, 31],
				defaultValue: now.getDate(),
				digit: 2,
				prefix: "-"
			},
			hours: {
				name: "hours",
				range: [0, 23],
				digit: 2,
				defaultValue: 0,
				prefix: "|"
			},
			leading_hours: {
				name: "hours",
				range: [0, 23],
				digit: 2,
				defaultValue: 0
			},
			minutes: {
				name: "minutes",
				range: [0, 59],
				digit: 2,
				defaultValue: 0,
				prefix: ":"
			},
			seconds: {
				name: "seconds",
				range: [0, 59],
				digit: 2,
				defaultValue: 0,
				prefix: ":"
			}
		},
		
		ATTRIBUTES: /** @scope dorado.widget.DateTimeSpinner.prototype */ {
		
			/**
			 * 类型。
			 * <p>
			 * 目前支持的值包括:
			 * <ul>
			 * <li>date	-	日期。</li>
			 * <li>time	-	时间。</li>
			 * <li>datetime	-	日期+时间。</li>
			 * <li>hours	-	小时。</li>
			 * <li>minutes	-	小时+分。</li>
			 * <li>dateHours	-	日期+小时。</li>
			 * <li>dateMinutes	-	日期+小时+分。</li>
			 * </ul>
			 * </p>
			 * @attribute writeOnce,writeBeforeReady
			 * @type String
			 * @default "time"
			 */
			type: {
				writeOnce: true,
				writeBeforeReady: true,
				setter: function(type) {
					this._type = type = type || "time";
					this._typeChanged = true;
					var configs, template = this.slotConfigTemplate;
					switch (type) {
						case "date":
							configs = [template.year, template.month, template.date];
							break;
						case "time":
							configs = [template.leading_hours, template.minutes, template.seconds];
							break;
						case "dateTime":
							configs = [template.year, template.month, template.date, template.hours, template.minutes, template.seconds];
							break;
						case "hours":
							configs = [template.leading_hours];
							break;
						case "minutes":
							configs = [template.leading_hours, template.minutes];
							break;
						case "dateHours":
							configs = [template.year, template.month, template.date, template.hours];
							break;
						case "dateMinutes":
							configs = [template.year, template.month, template.date, template.hours, template.minutes];
							break;
					}
					this.slotConfigs = configs;
					this.initSlotConfigs();
				}
			},
			
			/**
			 * 年份。
			 * @attribute
			 * @type int
			 */
			year: {
				getter: slotAttributeGetter,
				setter: slotAttributeSetter
			},
			
			/**
			 * 月份。
			 * @attribute
			 * @type int
			 */
			month: {
				getter: slotAttributeGetter,
				setter: slotAttributeSetter
			},
			
			/**
			 * 日期。
			 * @attribute
			 * @type int
			 */
			date: {
				getter: slotAttributeGetter,
				setter: slotAttributeSetter
			},
			
			/**
			 * 小时。
			 * @attribute
			 * @type int
			 */
			hours: {
				getter: slotAttributeGetter,
				setter: slotAttributeSetter
			},
			
			/**
			 * 分钟。
			 * @attribute
			 * @type int
			 */
			minutes: {
				getter: slotAttributeGetter,
				setter: slotAttributeSetter
			},
			
			/**
			 * 秒数。
			 * @attribute
			 * @type int
			 */
			seconds: {
				getter: slotAttributeGetter,
				setter: slotAttributeSetter
			},
			
			/**
			 * 当前编辑器中的日期时间值。
			 * @attribute
			 * @type Date
			 */
			value: {
				getter: function() {
					var year = this.doGetSlotValue("year") || 1980;
					var month = (this.doGetSlotValue("month") - 1) || 0;
					var date = this.doGetSlotValue("date") || 1;
					var hours = this.doGetSlotValue("hours") || 0;
					var minutes = this.doGetSlotValue("minutes") || 0;
					var seconds = this.doGetSlotValue("seconds") || 0;
					return new Date(year, month, date, hours, minutes, seconds);
				},
				setter: function(d) {
					var year = 0, month = 1, date = 1, hours = 0, minutes = 0, seconds = 0;
					if (d) {
						year = d.getFullYear();
						month = d.getMonth() + 1;
						date = d.getDate();
						hours = d.getHours();
						minutes = d.getMinutes();
						seconds = d.getSeconds();
					}
					this.doSetSlotValue("year", year);
					this.doSetSlotValue("month", month);
					this.doSetSlotValue("date", date);
					this.doSetSlotValue("hours", hours);
					this.doSetSlotValue("minutes", minutes);
					this.doSetSlotValue("seconds", seconds);
					this.setValidationState("none");
				}
			}
		},
		
		constructor: function() {
			this.slotConfigs = [];
			$invokeSuper.call(this, arguments);
		},
		
		createTextDom: function() {
			if (!this._typeChanged) this.set("type", "time");
			return $invokeSuper.call(this, arguments);
		},
		
		doSetSlotValue: function(slotIndex, value) {
			if (value == null) {
				$invokeSuper.call(this, arguments);
				return;
			}
			
			var spinner = this, slotName;
			if (typeof slotIndex == "number") {
				var config = spinner.slotConfigs[slotIndex];
				if (config) slotName = config.name;
			} else {
				slotName = slotIndex;
				slotIndex = spinner.getSlotIndexByName(slotIndex);
			}
			
			if (!slotName || !spinner._slotMap[slotName]) return;
			if (!spinner._slotMap["date"]) {
				$invokeSuper.call(this, arguments);
				return;
			}
			
			var dateSlotIndex = spinner.getSlotIndexByName("date"), date = spinner._values[dateSlotIndex], newDate = 0;
			if (date >= 28) {
				var year = (slotIndex == 0) ? value : spinner._values[0];
				var month = (slotIndex == 1) ? value : spinner._values[1];
				var dayCount = new Date(year, month - 1).getDaysInMonth();
				if (date > dayCount) newDate = dayCount;
			}
			
			if (newDate) {
				if (slotName == "year" || slotName == "month") {
					spinner.doSetSlotValue("date", newDate);
					$invokeSuper.call(this, arguments);
				} else {
					$invokeSuper.call(this, [slotIndex, newDate]);
				}
			} else {
				$invokeSuper.call(this, arguments);
			}
		},
		
		doGetSlotRange: function(slotIndex) {
			var spinner = this, slotName;
			if (typeof slotIndex == "number") {
				slotName = spinner.slotConfigs[slotIndex].name;
			} else {
				slotName = slotIndex;
			}
			if (slotName == "date" && spinner._slotMap["date"]) {
				var year = spinner._values[0], month = spinner._values[1], dayCount = new Date(year, month - 1).getDaysInMonth();
				return [1, dayCount];
			} else {
				return $invokeSuper.call(this, arguments);
			}
		},
		
		doSetText: function(text) {
			var format;
			switch (this._type) {
				case "date":
					format = "Y-m-d";
					break;
				case "time":
					format = "h:i:s";
					break;
				case "dateTime":
					format = "Y-m-d h:i:s";
					break;
				case "hours":
					format = "h";
					break;
				case "minutes":
					format = "h:i";
					break;
				case "dateHours":
					format = "Y-m-d h";
					break;
				case "dateMinutes":
					format = "Y-m-d h:i";
					break;
			}
			this.set("value", format);
		}
	});
	
	/**
	 * @author Benny Bao (mailto:benny.bao@bstek.com)
	 * @component Form
	 * @class 自定义微调编辑器。
	 * @extends dorado.widget.MultiSlotSpinner
	 */
	dorado.widget.CustomSpinner = $extend(dorado.widget.MultiSlotSpinner, /** @scope dorado.widget.CustomSpinner.prototype */ {
		$className: "dorado.widget.CustomSpinner",
		
		ATTRIBUTES: /** @scope dorado.widget.CustomSpinner.prototype */ {
		
			/**
			 * 样式表达式,用于定义各个微调槽配置信息的文本表达式。
			 * <p>
			 * 基本语法是利用[]表示一个微调槽。<br>
			 * []中可以放置该微调槽的取值范围，即range属性（见{@link dorado.widget.MultiSlotSpinner.slotConfigs}）。
			 * 例如<code>[0,99]</code>表示取值范围是0到99。<br>
			 * *可用于代表开发的取值范围，例如<code>[0,*]</code>表示0到无穷大，<code>[*]</code>或<code>[]</code>代表任意的取值。
			 * 除此之外，[]中还可以放置数位的设置，即digit属性（见{@link dorado.widget.MultiSlotSpinner.slotConfigs}）。
			 * 例如<code>[0,99|2]</code>表示取值范围是0到99并且自动补零至两位。
			 * </p>
			 * @attribute writeOnce,writeBeforeReady
			 * @type String
			 * @example
			 * // [0,255].[0,255].[0,255].[0,255] 可用于定义IP地址的编辑器。
			 * // [0,*].[0,999|3]
			 * // ￥[*].[0,99|2]/kg
			 */
			pattern: {
				writeOnce: true,
				writeBeforeReady: true,
				setter: function(pattern) {
					this.parsePattern(pattern);
				}
			},
			
			/**
			 * 当前各槽数值的数组。
			 * @attribute
			 * @type int[]|String
			 */
			value: {
				getter: function() {
					return this._values;
				},
				setter: function(v) {
					var v = v || [];
					if (typeof v == "string") {
						v = v.split(',');
					}
					for (var i = 0; i < this.slotConfigs.length; i++) {
						var n = parseInt(v[i]);
						if (isNaN(n)) n = null;
						this.doSetSlotValue(i, n);
					}
					this.setValidationState("none");
				}
			}
		},
		
		constructor: function(configs) {
			if (configs && configs.pattern) {
				this.parsePattern(configs.pattern);
				delete configs.pattern;
			}
			$invokeSuper.call(this, [configs]);
		},
		
		parsePattern: function(pattern) {
		
			function parseSlotConfig(slotConfig) {
				var slot = {}, sections = slotConfig.split('|');
				if (sections[0] != '*') {
					var range = sections[0].replace(/\*/g, "null");
					slot.range = eval('[' + range + ']');
				}
				if (sections[1]) slot.digit = parseInt(sections[1]);
				slot.defaultValue = slot.defaultValue || 0;
				return slot;
			}
			
			if (!pattern) {
				throw new dorado.ResourceException("dorado.core.AttributeValueRequired", "pattern");
			}
			
			this.slotConfigs = [];
			var i = 0, c, text = "", slotConfig = "", inSlot = false;
			while (i < pattern.length) {
				c = pattern.charAt(i);
				if (inSlot) {
					if (c == ']') {
						var slot = parseSlotConfig(slotConfig);
						if (text) slot.prefix = text;
						this.slotConfigs.push(slot);
						inSlot = false;
						text = slotConfig = "";
					} else {
						slotConfig += c;
					}
				} else {
					if (c == '\\') {
						c = pattern.charAt(++i);
						text += c;
					} else if (c == '[') {
						inSlot = true;
					} else {
						text += c;
					}
				}
				i++;
			}
			if (!this.slotConfigs.length) {
				throw new dorado.ResourceException("dorado.baseWidget.InvalidSpinnerPattern", pattern);
			}
			if (text) this.slotConfigs.peek().suffix = text;
			this.initSlotConfigs();
		},
		
		doSetText: function(text) {
			this.set("value", value);
		}
	});
	
})();

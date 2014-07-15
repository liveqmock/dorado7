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
 * @class 单选框组件。
 * @extends dorado.widget.Control
 */
dorado.widget.RadioButton = $extend(dorado.widget.Control, /** @scope dorado.widget.RadioButton.prototype */ {
	$className: "dorado.widget.RadioButton",
	focusable: true,
	
	ATTRIBUTES: /** @scope dorado.widget.RadioButton.prototype */ {
		className: {
			defaultValue: "d-radio"
		},
		
		height:  {
			independent : true
		},
		
		/**
		 * 单选框显示的文本。
		 * @type String
		 * @attribute
		 */
		text: {},
		
		/**
		 * 单选框的值。
		 * @type String
		 * @attribute
		 */
		value: {},
		
		/**
		 * 单选框是否选中，默认值是false。
		 * @type boolean
		 * @default false
		 * @attribute
		 */
		checked: {},
		
		/**
		 * 单选框是否只读，默认值是false。
		 * @type boolean
		 * @default false
		 * @attribute
		 */
		readOnly: {}
	},
	
	_isReadOnly: function() {
		var radioButton = this, radioGroup = radioButton._radioGroup;
		return radioButton._readOnly || radioGroup._readOnly || radioGroup._readOnly2;
	},
	
	onClick: function(event) {
		var radioButton = this;
		if (event.target == radioButton._dom) return;
		if (!radioButton._isReadOnly()) {
			if (!radioButton._checked) {
				radioButton._checked = true;
				if (radioButton._radioGroup) {
					radioButton._radioGroup._valueChange(radioButton);
				}
			}
		}
	},
	
	refreshDom: function(dom) {
		$invokeSuper.call(this, arguments);
		var radioButton = this, doms = radioButton._doms, checked = radioButton._checked, text = radioButton._text, jDom;
		if (dom) {
			if (checked) {
				$fly(doms.icon).removeClass("unchecked").addClass("checked");
			} else {
				$fly(doms.icon).removeClass("checked").addClass("unchecked");
			}
			$fly(doms.text).html(text);
		}
	},
	
	createDom: function() {
		var radioButton = this, dom, doms = {};
		dom = $DomUtils.xCreate({
			tagName: "div",
			className: radioButton._className,
			content: [{
				tagName: "span",
				className: "icon",
				contextKey: "icon"
			}, {
				tagName: "span",
				className: "text",
				contextKey: "text",
				content: radioButton._text
			}]
		}, null, doms);

		radioButton._doms = doms;

		$fly([doms.icon, doms.text]).hover(function() {
			if (!radioButton._isReadOnly())
				$fly(dom).addClass(radioButton._className + "-hover");
		}, function() {
			if (!radioButton._isReadOnly())
				$fly(dom).removeClass(radioButton._className + "-hover");
		}).mousedown(function(event) {
			if (!radioButton._isReadOnly())
				$fly(dom).addClass(radioButton._className + "-click");
			$(document).one("mouseup", function() {
				if (!radioButton._isReadOnly())
					$fly(dom).removeClass(radioButton._className + "-click");
			});
		});
		
		return dom;
	},
	
	isFocusable: function() {
		return !this._isReadOnly() && $invokeSuper.call(this);
	}
});

/**
 * @author Frank Zhang (mailto:frank.zhang@bstek.com)
 * @component Form
 * @class 单选框组
 * @extends dorado.widget.AbstractDataEditor
 */
dorado.widget.RadioGroup = $extend(dorado.widget.AbstractDataEditor, /** @scope dorado.widget.RadioGroup.prototype */ {
	$className: "dorado.widget.RadioGroup",
	
	ATTRIBUTES: /** @scope dorado.widget.RadioGroup.prototype */ {
		className: {
			defaultValue: "d-radiogroup"
		},
		
		/**
		 * 单选框的排列方式。目前具有以下几种取值:
		 * <ul>
		 *  <li>vertical - 垂直布局。每个单选框各占一行。</li>
		 *  <li>flow - 流式布局。</li>
		 *  <li>grid - 类表格布局，会从左到右依次排列，根据columnCount属性决定有多少行。</li>
		 * </ul>
		 * 默认的布局方式为vertical。
		 * @type String
		 * @default "flow"
		 * @attribute
		 */
		layout: /** @scope dorado.widget.RadioGroup.prototype */ {
			defaultValue: "flow"
		},

		/**
		 * RadioGroup展现的列数，此属性只有当layout属性为grid的时候生效，默认值为3。
		 * @type int
		 * @default 3
		 * @attribute
		 */
		columnCount: {
			defaultValue: 3
		},
		
		/**
		 * RadioGroup中的radioButtons。
		 * @type dorado.widget.RadioButton[]
		 * @attribute
		 */
		radioButtons: {
			setter: function(radioButtons) {
				var radioGroup = this, oldValue = this._radioButtons, dom = radioGroup._dom;
				if (oldValue) {
					radioGroup.clearRadioButtons();
				}
				radioGroup._radioButtons = radioButtons;
				if (radioButtons) {
					for (var i = 0; i < radioButtons.length; i++) {
						var radioButton = radioButtons[i];
						if (!(radioButton instanceof dorado.widget.RadioButton)) {
							radioButtons[i] = radioButton = new dorado.widget.RadioButton(radioButton);
						}
						if (dom) {
							radioButton._radioGroup = radioGroup;
							if (radioButton._value == radioGroup._value) {
								radioGroup.currentRadioButton = radioButton;
								radioButton._checked = true;
							}
							radioButton.render(dom);
						}
						radioGroup.registerInnerControl(radioButton);
					}
				}
				if (radioGroup._rendered && radioGroup.isActualVisible()) radioGroup.doOnResize();
			}
		},
		
		/**
		 * 单选框组的值。
		 * @type String|Number
		 * @attribute
		 */
		value: {
			setter: function(value) {
				this.setValue(value);
			}
		},
		
		/**
		 * 单选框组是否只读。
		 * @type boolean
		 * @attribute
		 */
		readOnly: {}
	},
	
	EVENTS: /** @scope dorado.widget.RadioGroup.prototype */ {
		/**
		 * 当单选框组的value发生变化的时候触发的事件。
		 * @param self 触发事件的单选框组。
		 * @event
		 */
		onValueChange: {}
	},
	
	setValue: function(value) {
		var radioGroup = this, radioButtons = radioGroup._radioButtons;
		if (radioButtons) {
			var found = false;
			for (var i = 0, j = radioButtons.length; i < j; i++) {
				var radioButton = radioButtons[i];
				if ((value + '') == (radioButton._value + '')) {
					found = true;
					radioGroup._setValue(radioButton);
					break;
				}
			}
			if (!found) radioGroup._setValue(null);
		}
		radioGroup._value = value;
		if (!radioGroup._dataSet && radioGroup._rendered) {
			radioGroup._lastPost = value;
		}
	},

	/**
	 * 为RadioGroup添加RadioButton。
	 * @param {Object|dorado.widget.RadioButton} radioButton 要添加的RadioButton。
	 * @param {int} [index] 添加的RadioButton的index。
	 */
	addRadioButton: function(radioButton, index) {
		var radioGroup = this, radioButtons = radioGroup._radioButtons, dom = radioGroup._dom, refDom;
		if (!radioButtons) {
			radioButtons = radioGroup._radioButtons = [];
		}
		if (!(radioButton instanceof dorado.widget.RadioButton)) {
			radioButton = new dorado.widget.RadioButton(radioButton);
		}
		if (typeof index == "number") {
			var refButton = radioButtons[index];
			if (refButton) {
				refDom = refButton._dom;
			}
			radioButtons.insert(radioButton, index);
		} else {
			radioButtons.push(radioButton);
		}
		if (dom) {
			radioButton._radioGroup = radioGroup;
			if (radioButton._value == radioGroup._value) {
				radioGroup.currentRadioButton = radioButton;
				radioButton._checked = true;
			}
			radioButton.render(dom, refDom);
		}
		radioGroup.registerInnerControl(radioButton);
	},

	/**
	 * 删除指定的RadioButton。
	 * @param {int|dorado.widget.RadioButton} radioButton 可以是RadioButton所在的索引，也可以是RadioButton。
	 */
	removeRadioButton: function(radioButton) {
		var radioGroup = this, radioButtons = radioGroup._radioButtons, index;
		if (!radioButtons) return;
		if (typeof radioButton == "number") {
			index = radioButton;
			radioButton = radioButtons[radioButton];
			radioGroup.unregisterInnerControl(radioButton);
			radioButton.destroy();
			radioButtons.removeAt(index);
			if (radioGroup.currentRadioButton == radioButton) {
				radioGroup.currentRadioButton = null;
			}
		} else if (radioButton && radioButton.destroy) {
			radioGroup.unregisterInnerControl(radioButton);
			radioButton.destroy();
			if (radioGroup.currentRadioButton == radioButton) {
				radioGroup.currentRadioButton = null;
			}
		}
	},

	/**
	 * 清空RadioButton。
	 */
	clearRadioButtons: function() {
		var radioGroup = this, radioButtons = radioGroup._radioButtons || [], radioButton;
		for (var i = 0; i < radioButtons.length; i++) {
			radioButton = radioButtons[i];
			radioGroup.unregisterInnerControl(radioButton);
			radioButton.destroy();
		}
		radioGroup._radioButtons = null;
		radioGroup.currentRadioButton = null;
	},
	
	_setValue: function(radioButton) {
		var radioGroup = this, value = radioButton ? radioButton._value : null;
		
		if (radioGroup.currentRadioButton == radioButton) {
			return;
		}
		
		if (radioGroup.currentRadioButton) {
			radioGroup.currentRadioButton._checked = false;
			radioGroup.currentRadioButton.refresh();
		}
		if (radioButton) {
			radioButton._checked = true;
			radioButton.refresh();
		}
		radioGroup.currentRadioButton = radioButton;
	},
	
	_valueChange: function(radioButton) {
		var radioGroup = this, value = radioButton ? radioButton._value : null;
		
		if (radioGroup.currentRadioButton == radioButton || radioGroup._value == value) {
			return;
		}

		var currentValue = radioGroup._value;
		radioGroup._value = value;

		var postResult = radioGroup.post();
		if (postResult == false) {
			radioGroup._value = currentValue;
			if (radioButton) {
				radioButton._checked = false;
				radioButton.refresh();
			}
		}
		
		this._setValue(radioButton);
		radioGroup.fireEvent("onValueChange", radioGroup, {});
	},

	post: function(force, silent) {
		var modified = (this._lastPost != this._value);
		if (!force && !modified) return true;

		var lastPost = this._lastPost;
		try {
			this._lastPost = this._value;
			var eventArg = {
				processDefault: true
			};
			this.fireEvent("beforePost", this, eventArg);
			if (eventArg.processDefault === false) return false;
			if (this.doPost) this.doPost();
			this.fireEvent("onPost", this);
			return true;
		}
		catch (e) {
			this._lastPost =  lastPost;
			var eventArg = {
				exception: e,
				processDefault: true
			};
			this.fireEvent("onPostFailed", this, eventArg);
			if (eventArg.processDefault && !silent) {
				dorado.Exception.processException(e);
			} else {
				dorado.Exception.removeException(e);
			}

			return false;
		}
	},
	
	createDom: function() {
		var radioGroup = this, layout = radioGroup._layout, radioButtons = radioGroup._radioButtons;
		
		var dom = $DomUtils.xCreate({
			tagName: "div",
			className: radioGroup._className
		});
		
		if (radioButtons) {
			for (var i = 0, j = radioButtons.length; i < j; i++) {
				var radioButton = radioButtons[i];
				radioButton._radioGroup = radioGroup;
				if (radioButton._value == radioGroup._value) {
					radioGroup.currentRadioButton = radioButton;
					radioButton._checked = true;
				}
				radioButton.render(dom);
			}
		}
		return dom;
	},
	
	refreshDom: function(dom) {
		$invokeSuper.call(this, arguments);
		
		this.refreshExternalReadOnly();
		
		var group = this, layout = group._layout;
		if (group._dataSet) {
			var value, dirty;
			if (group._property) {
				var bindingInfo = group._bindingInfo;
				if (bindingInfo.entity instanceof dorado.Entity) {
					value = bindingInfo.entity.get(group._property);
					dirty = bindingInfo.entity.isDirty(group._property);
				}
				
				if (bindingInfo.propertyDef) {
					var oldMapping = group._propertyDefMapping, mapping = bindingInfo.propertyDef._mapping;
					if ((oldMapping || mapping) && (oldMapping != mapping)) {
						var radioButtons = [];
						if (mapping) {
							group._propertyDefMapping = mapping;
							for (var i = 0; i < mapping.length; i++) {
								var item = mapping[i];
								radioButtons.push({
									value: item.key,
									text: item.value
								});
							}
						}
						if (radioButtons) group.set("radioButtons", radioButtons);
					}
				}
			}
			group.setValue(value);
			group._lastPost = value;
			group.setDirty(dirty);
		}
		
		if (layout == "flow" || layout == "grid") {
			$fly(dom).addClass(group._className + "-flow");
		} else {
			$fly(dom).removeClass(group._className + "-flow");
		}
	},

	doOnResize: function() {
		var group = this, radioButtons = group._radioButtons, layout = group._layout, columnCount = group._columnCount || 3;
		if (radioButtons) {
			if (layout == "grid") {
				var width = $fly(group._dom).width(), averageWidth = Math.floor(width / columnCount);
				for (var i = 0, j = radioButtons.length; i < j; i++) {
					var radioButton = radioButtons[i];
					radioButton._width = averageWidth;
					radioButton.resetDimension();
				}
			} else {
				for (var i = 0, j = radioButtons.length; i < j; i++) {
					var radioButton = radioButtons[i];
					radioButton._width = "auto";
					radioButton.resetDimension();
				}
			}
		}

		$invokeSuper.call(this, arguments);
	},
	
	doOnKeyDown: function(event) {
		if (event.ctrlKey) {
			return true;
		}
		var group = this, radioButtons = group._radioButtons, currentRadioButton = group.currentRadioButton, currentButtonIndex = currentRadioButton ? radioButtons.indexOf(currentRadioButton) : -1, buttonCount = radioButtons.length, newIndex, newRadioButton, retValue = true;
		
		switch (event.keyCode) {
			case 38://up arrow
			case 37://left arrow
				if (currentButtonIndex == 0) {
					newIndex = buttonCount - 1;
				} else {
					if (currentButtonIndex > 0 && currentButtonIndex < buttonCount) {
						newIndex = currentButtonIndex - 1;
					} else {
						newIndex = 0;
					}
				}
				retValue = false;
				break;
				
			case 39://right arrow
			case 40://down arrow
				if (currentButtonIndex >= 0 && currentButtonIndex < buttonCount - 1) {
					newIndex = currentButtonIndex + 1;
				} else {
					newIndex = 0;
				}
				retValue = false;
				break;
		}
		newRadioButton = radioButtons[newIndex];
		if (newRadioButton) {
			group._valueChange(newRadioButton);
		}
		return retValue;
	}
});

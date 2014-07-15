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
 * @class 标题栏
 * <p>
 * 主要用来显示标题，也可以显示图标和工具按钮，目前被dorado.widget.Panel与dorado.widget.accordion.Section使用。
 * 一般情况下，用户不需要手工添加一个标题栏组件。
 * </p>
 * @extends dorado.widget.Control
 */
dorado.widget.CaptionBar = $extend(dorado.widget.Control, /** @scope dorado.widget.CaptionBar.prototype */ {
	$className: "dorado.widget.CaptionBar",

	ATTRIBUTES: /** @scope dorado.widget.CaptionBar.prototype */ {
		className: {
			defaultValue: "d-caption-bar"
		},
		/**
		 * 标题栏上显示的标题。
		 * @type String
		 * @attribute
		 */
		caption: {},
		
		/**
		 * 标题栏上显示的图标。
		 * @type String
		 * @attribute
		 */
		icon: {},
		
		/**
		 * 标题栏上显示的图标用的className。
		 * @type String
		 * @attribute
		 */
		iconClass: {},
		
		/**
		 * 标题栏右侧的工具按钮。
		 * @type dorado.util.KeyedArray
		 * @attribute
		 */
		buttons: {
			innerComponent: "SimpleIconButton",
			setter: function(value) {
				var bar = this, oldValue = bar._buttons;
				
				if (oldValue) {
					bar.clearButtons();
				}
				if (!bar._buttons) {
					bar._buttons = new dorado.util.KeyedArray(function(value) {
						return value._uniqueId;
					});
				}
				
				if (value instanceof Array) {
					for (var i = 0, j = value.length; i < j; i++) {
						bar._buttons.insert(value[i]);
					}
				} else if (value instanceof dorado.util.KeyedArray) {
					for (var i = 0, j = value.size; i < j; i++) {
						bar._buttons.insert(value.get(i));
					}
				}
			}
		},
		
		height: {
			independent: true,
			readOnly: true
		}
	},
	
	/**
	 * 为标题栏添加按钮。
	 * @param {dorado.widget.SimpleButton} button 标题栏上要添加的按钮。
	 * @param [index] 要添加的按钮的索引，不指定的话添加到最后一个。当index属性大于100的时候，index属性会被当作priority使用，可以保证index属性大的一直显示在最后(Panel、Dialog内置的tools依赖此功能)。
	 */
	addButton: function(button, index) {
		var bar = this, buttons = bar._buttons, doms = bar._doms, refBtn, dom = bar._dom;
		
		if (!bar._buttons) {
			buttons = bar._buttons = new dorado.util.KeyedArray(function(value) {
				return value._uniqueId;
			});
		}
		
		if (index == null) {
			buttons.insert(button);
		} else if (typeof index == "number") {
			if (index > 100) {
				var prevPriority = 0, target = index, insertIndex;
				button._cbPriority = index;
				for (var i = 0, j = buttons.size; i < j; i++) {
					var btn = buttons.get(i), priority = btn._cbPriority || 0;
					if (prevPriority <= target && priority > target) {
						refBtn = btn;
						insertIndex = i;
						break;
					}
					prevPriority = priority;
				}
				buttons.insert(button, insertIndex);
			} else {
				refBtn = buttons.get(index);
				buttons.insert(button, index);
			}
		} else if (typeof index == "string") {
			refBtn = buttons.get(index);
			if (!refBtn) {
				buttons.insert(button);
			} else {
				buttons.insert(button, "before", refBtn);
			}
		}
		
		bar.registerInnerControl(button);
		if (dom) {
			if (!doms.buttonGroup) {
				bar._createButtonGroup();
			}
			button.render(doms.buttonGroup, refBtn ? refBtn._dom : null);
		}
	},
	
	/**
	 * 取得工具栏上的按钮。
	 * @param {String|int|dorado.widget.SimpleButton} button 要取得的按钮的索引、id或者按钮本身。
	 */
	getButton: function(button) {
		var bar = this, buttons = bar._buttons;
		if (buttons && (typeof button == "number" || typeof button == "string")) {
			return buttons.get(button);
		} else {
			return button;
		}
	},
	
	/**
	 * 删除标题栏上指定的按钮
	 * @param {String|int|dorado.widget.SimpleButton} button 要删除的按钮
	 */
	removeButton: function(button) {
		var bar = this, buttons = bar._buttons;
		if (typeof button == "string" || typeof button == "number") {
			button = buttons.get(button);
		}
		if (button) {
			bar.unregisterInnerControl(button);
			button.destroy();
			buttons.remove(button);
		}
	},
	
	/**
	 * 删除标题栏上所有的工具按钮。
	 */
	clearButtons: function() {
		var bar = this, buttons = bar._buttons;
		if (buttons) {
			for (var i = 0, j = buttons.size; i < j; i++) {
				var button = buttons.get(i);
				bar.unregisterInnerControl(button);
				button.destroy();
				buttons.removeAt(0);
			}
		}
	},
	
	_createIcon: function(dom) {
		var bar = this, doms = bar._doms;
		dom = dom ? dom : bar._dom;
		var icon = document.createElement("div");
		icon.className = "caption-bar-icon";
		$fly(icon).insertBefore(doms.caption);
		
		doms.icon = icon;
	},
	
	_createButtonGroup: function(dom) {
		var bar = this, doms = bar._doms;
		dom = dom ? dom : bar._dom;
		var buttonGroup = document.createElement("div");
		buttonGroup.className = "button-group";
		$fly(dom).prepend(buttonGroup);
		
		doms.buttonGroup = buttonGroup;
	},
	
	createDom: function() {
		var bar = this, buttons = bar._buttons, doms = {}, dom = $DomUtils.xCreate({
			tagName: "div",
			content: [{
				tagName: "div",
				className: "caption",
				content: bar._caption,
				contextKey: "caption"
			}]
		}, null, doms);
		
		bar._doms = doms;
		
		if (buttons) {
			bar._createButtonGroup(dom);
			for (var i = 0, j = buttons.size; i < j; i++) {
				var button = buttons.get(i);
				bar.registerInnerControl(button);
				button.render(doms.buttonGroup);
			}
		}
		
		var icon = bar._icon, iconCls = bar._iconClass;
		if (icon || iconCls) {
			bar._createIcon(dom);
			$fly(doms.icon).addClass(iconCls);
			$DomUtils.setBackgroundImage(doms.icon, icon);
		}
		
		return dom;
	},
	
	refreshDom: function() {
        $invokeSuper.call(this, arguments);
		var bar = this, doms = bar._doms;
		
		$fly(doms.caption).text(bar._caption);
		
		var icon = bar._icon, iconCls = bar._iconClass;
		
		if (!icon && !iconCls && doms.icon) {
			$fly(doms.icon).css("display", "none");
		} else {
			if (doms.icon) {
				$fly(doms.icon).prop("className", "caption-bar-icon").css("display", "");
			}
			if ((icon || iconCls) && !doms.icon) {
				bar._createIcon();
			}
			
			if (icon) {
				$DomUtils.setBackgroundImage(doms.icon, icon);
			}
			if (iconCls) {
				$fly(doms.icon).addClass(iconCls);
			}
		}
	}
});

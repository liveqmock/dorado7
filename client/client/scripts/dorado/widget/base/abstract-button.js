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
 * @class 抽象Button。
 * @abstract
 * @extends dorado.widget.Control
 */
dorado.widget.AbstractButton = $extend([dorado.widget.Control, dorado.widget.ActionSupport], /** @scope  dorado.widget.AbstractButton.prototype */ {

	selectable: false,

	ATTRIBUTES: /** @scope dorado.widget.AbstractButton.prototype */ {

		/**
		 * 是否已经被禁用。
		 * @type boolean
		 * @default false
		 * @attribute
		 */
		disabled: {
            setter: function(value) {
                this._disabled = value;
                this.onDisabledChange && this.onDisabledChange();
            }
        },

		/**
		 * 按钮是否可以按下。
		 * @type boolean
		 * @default false
		 * @attribute
		 */
		toggleable: {},

		/**
		 * 绑定的菜单对象
		 * @type String|dorado.widget.Menu
		 * @attribute
		 */
		menu: {
			componentReference: true
		},

		/**
		 * 是否在弹出菜单以后toggle。
		 * 分两种情况来讨论：
		 * <ul>
		 * 		<li>如果按钮有onClick事件，且toggleable为true，则仅仅右边的下拉按钮会被toggle。</li>
		 * 		<li>否则，整个按钮都会toggle。</li>
		 * <ul>
		 * @type boolean
		 * @default true
		 * @attribute
		 */
		toggleOnShowMenu: {
			defaultValue: true
		},

		/**
		 * 按钮是否被按下.
		 * @type boolean
		 * @default true
		 * @attribute  writeBeforeReady
		 */
		toggled: {
			skipRefresh: true,
			setter: function(value) {
				var button = this;
				if (button._toggled != value) {
					button._toggled = value;
					button.fireEvent("onToggle", button);
					button.doSetToggle(value);
				}
			}
		},
		
		tip: {
			getter: function() {
				return this._tip || (this._action && this._action._tip);
			}
		}
	},

	EVENTS: /** @scope dorado.widget.AbstractButton.prototype */ {
		/**
		 * 当按钮被按下时触发的事件。
		 * @param {Object} self 事件的发起者，即控件本身。
		 * @event
		 */
		onToggle: {}
	},

	/**
	 * @protected
	 */
	onClick: function() {
		var button = this, action = button._action;
		if (button.getListenerCount("onClick") == 0 && action) {
			action.execute && action.execute();
		}
		if (button._toggleable) {
			button.set("toggled", !button._toggled);
		}
		return false;
	},
	
	/**
	 * 模拟按钮的点击动作。
	 */
	click: function() {
		this.onClick();
	}
});

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
	var BUTTON_HOVER_CLASS = "-hover", BUTTON_CLICK_CLASS = "-click", BUTTON_TOGGLED_CLASS = "-toggled", BUTTON_TRIGGER_CLASS = "-trigger", ICON_CLASS = "d-icon";

	/**
	 * @author Frank Zhang (mailto:frank.zhang@bstek.com)
	 * @component Base
	 * @class 按钮。
	 * <p>
	 * 可以设定图标、文字，绑定菜单、按下的按钮，按钮的长度可以根据内容自适应，且不是block element, 即不会引起后面组件的换行。<br />
	 * 注意：triggerToggled、showTrigger、splitButton是为了灵活性考虑添加的属性，一般情况下无需设置。
	 * </p>
	 * @extends dorado.widget.AbstractButton
	 */
	dorado.widget.Button = $extend(dorado.widget.AbstractButton, /** @scope dorado.widget.Button.prototype */ {
		$className: "dorado.widget.Button",
		focusable: true,

		ATTRIBUTES: /** @scope dorado.widget.Button.prototype */ {
			className: {
				defaultValue: "d-button"
			},

			/**
			 * 按钮的标题。
			 * @type String
			 * @attribute
			 */
			caption: {},

			/**
			 * 图标所在路径。
			 * @type String
			 * @attribute
			 */
			icon: {},

			/**
			 * 图标使用的className。
			 * @type String
			 * @attribute
			 */
			iconClass: {},

			/**
			 * Trigger是否被按下。<br />
			 * 当button存在onClick事件，且toggleable为true的时候，左边和右边的toggle值使用两个变量来表示:
			 * <ul>
			 *    <li> toggled: 左侧按钮是否被按下。 </li>
			 *    <li> triggerToggled: 右侧按钮是否被按下。 </li>
			 * </ul>
			 * 在绑定了menu且toggleable为true的情况下，如果按钮存在onClick事件，即splitButton效果触发，则按钮的左边两边会分别有自己的toggle效果。<br />
			 * 在显示了右侧箭头，但是toggleable属性为false的情况下，如果triggerToggled设置为true，则会显示为整个按钮的按钮。
			 * @type boolean
			 * @default false
			 * @attribute
			 */
			triggerToggled: {},

			/**
			 * 是否显示右侧按钮。
			 * <p>
			 * 该属性没有默认值，当按钮绑定了菜单以后，则按钮就会显示右侧的Trigger，可以通过设置该属性为false禁用该特性。<br />
			 * 同理，如果按钮没有绑定菜单，又想显示右侧的Trigger，则设置该属性为true就可以。
			 * </p>
			 * @attribute writeBeforeReady
			 * @type boolean
			 */
			showTrigger: {
				writeBeforeReady: true
			},

			/**
			 * 是否分割按钮。
			 * <p>
			 * 当按钮有onClick事件，又显示了右侧的Trigger以后(showTrigger设置true或者按钮绑定了menu且showTrigger没有设置为false)，按钮的splitButton就会自动设置为true。<br />
			 * 在显示效果上，splitButton以后，按钮移动上去、按下或者toggled以后，按钮左右两侧会有不同的效果。<br />
			 * 注意：当showTrigger属性被设置为false以后，即使该属性为true，也不会有效果。
			 * </p>
			 * @attribute writeBeforeReady
			 * @type boolean
			 */
			splitButton: {
				writeBeforeReady: true
			},

			width: {
				independent: true
			},

			height: {
				independent: true,
				readOnly: true
			}
		},

		EVENTS: /** @scope dorado.widget.Button.prototype */ {
			/**
			 * 当右侧按钮被点击时触发的事件。
			 * @param {Object} self 事件的发起者，即组件本身。
			 * @param {Object} arg 事件参数。
			 * @return {boolean} 是否要继续后续事件的触发操作，不提供返回值时系统将按照返回值为true进行处理。
			 * @event
			 */
			onTriggerClick: {}
		},

		/**
		 * 是否需要分割Button的左右事件(hover、click)。 两个条件：
		 * 1. 该button存在onClick的Listener。
		 * 2. 该button绑定了menu。
		 */
		needSplit: function() {
			return this._showTrigger !== false && (this._splitButton === true || (this._splitButton !== false && !!(this.getListenerCount("onClick") && this._menu)));
		},

		doOnKeyDown: function(event) {
			var retValue = true;
			var button = this;
			if (event.keyCode == 32 || event.keyCode == 13) {
				button.fireEvent("onClick", button);
				retValue = false;
			}
			return retValue;
		},

		/**
		 * 被toggle的setter调用。
		 * @protected
		 */
		doSetToggle: function() {
			var button = this, dom = button._dom, doms = button._doms, cls = button._className;
			if (dom) {
				if (button._toggled) {
					$fly(dom).addClass(cls + BUTTON_TOGGLED_CLASS);
					$fly(doms.buttonLeft).addClass("button-left-toggled");
					$fly(doms.buttonRight).addClass(button.needSplit() ? "" : "button-right-toggled");
				}
				else {
					$fly(dom).removeClass(cls + BUTTON_TOGGLED_CLASS);
					$fly(doms.buttonLeft).removeClass("button-left-toggled");
					$fly(doms.buttonRight).removeClass("button-right-toggled");
				}
			}
		},

		/**
		 * 显示出button绑定的menu。
		 * @protected
		 */
		doShowMenu: function() {
			var button = this, menu = button._menu, dom = button._dom, doms = button._doms, cls = button._className;

			if (menu) {
				menu.bind("onShow", function() {
					if (button._toggleOnShowMenu && !button._triggerToggled) {
						if (!button.needSplit()) {
							$fly(dom).addClass(cls + BUTTON_TOGGLED_CLASS);
							$fly(doms.buttonLeft).addClass("button-left-toggled");
							$fly(doms.buttonRight).addClass("button-right-toggled");
						}
						else {
							$fly(doms.buttonRight).addClass("button-right-toggled");
						}
						button._triggerToggled = true;
					}

					//当menu hide的时候, 判断button的toggleOnShowMenu的值，来决定是否去除button的toggle。
					menu.bind("onHide", function() {
						button.doAfterMenuHide();
					}, { once: true });
					if (!menu.doBeforeHide) {
						menu.doBeforeHide = function() {
							button.doBeforeMenuHide && button.doBeforeMenuHide();
						}
					}
				}, { once: true});

				menu._focusParent = button;
				menu.show({
					anchorTarget: button,
					align: "innerleft",
					vAlign: "bottom"
				});
			}
		},

		/**
		 * 当绑定的菜单隐藏以后执行的动作。
		 * @protected
		 */
		doAfterMenuHide: function() {
			var button = this, dom = button._dom;
			if (button._toggleOnShowMenu) {
				if (!button.needSplit()) {
					$fly(dom).removeClass(button._className + BUTTON_TOGGLED_CLASS);
					$fly(button._doms.buttonLeft).removeClass("button-left-toggled");
					$fly(button._doms.buttonRight).removeClass("button-right-toggled");
				}
				else {
					$fly(button._doms.buttonRight).removeClass("button-right-toggled");
				}
				button._triggerToggled = false;
			}
		},

		_createIconSpan: function(dom) {
			var button = this, doms = button._doms, action = button._action || {};
			dom = dom || button._dom;
			if (dom) {
				var icon = document.createElement("span");
				icon.className = ICON_CLASS;
				icon.innerHTML = "&nbsp;";

				$fly(icon).prependTo(doms.buttonLeft).addClass(button._iconClass || action._iconClass);

				$DomUtils.setBackgroundImage(icon, button._icon || action._icon);

				doms.icon = icon;
			}
		},

		onClick: function() {
			var button = this, action = button._action || {}, disabled = button._disabled || action._disabled || action._sysDisabled;
			if (!disabled) {
				$invokeSuper.call(this, arguments);
				if (this._menu && this.getListenerCount("onClick") == 0) {
					this.doShowMenu();
				}
			}
		},
		
		doOnResize: function() {
			if (dorado.Browser.msie && dorado.Browser.version < 7) {
				var button = this, dom = button._dom, width = button.getRealWidth();
				if (dom && width != null) {
					$fly(dom).width(width);
					var leftWidth = dom.offsetWidth - button._doms.buttonRight.offsetWidth -
						parseInt($fly(button._doms.buttonLeft).css("margin-left"), 10);
					//log.debug("margin-left:" + parseInt($fly(button._doms["buttonLeft"]).css("margin-left"), 10));
					if (leftWidth > 0) {
						$fly(button._doms.buttonLeft).outerWidth(leftWidth);
					}
				}
			}
		},

		onDisabledChange: function() {
			var button = this, dom = button._dom, cls = button._className;
			if (dom) {
				$fly(dom).removeClass(cls + BUTTON_HOVER_CLASS).removeClass(cls + "-focused");
				$fly(button._doms.buttonLeft).removeClass("button-left-hover");
				$fly(button._doms.buttonRight).removeClass("button-right-hover");
			}
		},

		createDom: function() {
			var button = this, cls = button._className, doms = {}, action = button._action || {};

			var dom = $DomUtils.xCreate({
				tagName: "span",
				content: [
					{
						tagName: "span",
						className: "button-left",
						contextKey: "buttonLeft",
						content: {
							tagName: "span",
							className: "caption",
							content: button._caption || action._caption,
							contextKey: "caption"
						}
					},
					{
						tagName: "span",
						className: "button-right",
						contextKey: "buttonRight"
					}
				]
			}, null, doms);

			button._doms = doms;

			$fly(doms.buttonLeft).hover(function() {
				var action = button._action || {}, disabled = button._disabled || action._disabled || action._sysDisabled;
				if (!disabled && !button._toggled) {
					$fly(dom).addClass(cls + BUTTON_HOVER_CLASS);
					$fly(doms.buttonLeft).addClass("button-left-hover");
					$fly(doms.buttonRight).addClass(button.needSplit() ? "" : "button-right-hover");
				}
			},function() {
				$fly(dom).removeClass(cls + BUTTON_HOVER_CLASS);
				$fly(doms.buttonLeft).removeClass("button-left-hover");
				$fly(doms.buttonRight).removeClass("button-right-hover");
			}).mousedown(function() {
					var action = button._action || {}, disabled = button._disabled || action._disabled || action._sysDisabled;

					if (!disabled) {
						$fly(dom).addClass(cls + BUTTON_CLICK_CLASS);
						$fly(doms.buttonLeft).addClass("button-left-click");
						$fly(doms.buttonRight).addClass(button.needSplit() ? "" : "button-right-click");
						$fly(document).one("mouseup", function() {
							$fly(dom).removeClass(cls + BUTTON_CLICK_CLASS);
							$fly(doms.buttonLeft).removeClass("button-left-click");
							$fly(doms.buttonRight).removeClass("button-right-click");
						});
					}
				});

			$fly(doms.buttonRight).hover(function() {
				var action = button._action || {}, disabled = button._disabled || action._disabled || action._sysDisabled;
				if (!disabled) {
					$fly(dom).addClass(button.needSplit() ? "" : cls + BUTTON_HOVER_CLASS);
					$fly(doms.buttonLeft).addClass(button.needSplit() ? "" : "button-left-hover");
					$fly(doms.buttonRight).addClass("button-right-hover");
				}
			},function() {
				$fly(dom).removeClass(cls + BUTTON_HOVER_CLASS);
				$fly(doms.buttonLeft).removeClass("button-left-hover");
				$fly(doms.buttonRight).removeClass("button-right-hover");
			}).mousedown(function() {
					var action = button._action || {}, disabled = button._disabled || action._disabled || action._sysDisabled;
					if (!disabled) {
						$fly(dom).addClass(button.needSplit() ? "" : cls + BUTTON_CLICK_CLASS);
						$fly(doms.buttonLeft).addClass(button.needSplit() ? "" : "button-left-click");
						$fly(doms.buttonRight).addClass("button-right-click");
						$fly(document).one("mouseup", function() {
							$fly(dom).removeClass(cls + BUTTON_CLICK_CLASS);
							$fly(doms.buttonLeft).removeClass("button-left-click");
							$fly(doms.buttonRight).removeClass("button-right-click");
						});
					}
				}).click(function(event) {
					var action = button._action || {}, disabled = button._disabled || action._disabled || action._sysDisabled;
					if (!disabled) {
						button.fireEvent("onTriggerClick", button);
						if (button._menu) {
							button.doShowMenu();
						}
						else {
							if (button.onClick(event) === false) return false;
							button.fireEvent("onClick", button, {
								button: event.button,
								event: event
							});
						}
					}
					event.stopImmediatePropagation();
				});

			if (button._toggleable) {
				if (button._toggled) {
					$fly(dom).addClass(button._className + BUTTON_TOGGLED_CLASS);
					$fly(doms.buttonLeft).addClass("button-left-toggled");
					$fly(doms.buttonRight).addClass(button.needSplit() ? "" : "button-right-toggled");
				}
				else {
					$fly(dom).removeClass(button._className + BUTTON_TOGGLED_CLASS);
					$fly(doms.buttonLeft).removeClass("button-left-toggled");
					$fly(doms.buttonRight).removeClass("button-right-toggled");
				}
			}

			$fly(dom).toggleClass("d-button-trigger " + cls + BUTTON_TRIGGER_CLASS, button._showTrigger === true || (!!button._menu && button._showTrigger !== false)).toggleClass(cls + "-disabled", !!(button._disabled || action._disabled || action._sysDisabled));

			var icon = button._icon || action._icon, iconCls = button._iconClass || action._iconClass;

			if (icon || iconCls) {
				button._createIconSpan(dom);
			}

			return dom;
		},

		refreshDom: function(dom) {
			$invokeSuper.call(this, arguments);

			var button = this, cls = button._className, doms = button._doms, action = button._action || {}, disabled = button._disabled || action._disabled || action._sysDisabled;

			$fly(button._doms.caption).html(button._caption || action._caption);
			button._dom.disabled = disabled;

			$fly(dom).toggleClass("d-button-trigger " + cls + BUTTON_TRIGGER_CLASS, button._showTrigger === true || (!!button._menu && button._showTrigger !== false))
				.toggleClass(cls + "-disabled", !!(button._disabled || action._disabled || action._sysDisabled));

			if (button._toggleable) {
				if (button._toggled) {
					$fly(dom).addClass(cls + BUTTON_TOGGLED_CLASS);
					$fly(doms.buttonLeft).addClass("button-left-toggled");
					$fly(doms.buttonRight).addClass(button.needSplit() ? "" : "button-right-toggled");
				}
				else {
					$fly(dom).removeClass(cls + BUTTON_TOGGLED_CLASS);
					$fly(doms.buttonLeft).removeClass("button-left-toggled");
					$fly(doms.buttonRight).removeClass("button-right-toggled");
				}
			}
			else {
				if (!button.needSplit()) {
					$fly(dom).toggleClass(cls + BUTTON_TOGGLED_CLASS, !!button._triggerToggled);
					$fly(doms.buttonLeft).toggleClass("button-left-toggled", !!button._triggerToggled);
					$fly(doms.buttonRight).toggleClass("button-right-toggled", !!button._triggerToggled);
				}
				else {
					$fly(doms.buttonRight).toggleClass("button-right-toggled", !!button._triggerToggled);
				}
			}

			var icon = button._icon || action._icon, iconCls = button._iconClass || action._iconClass;

			if (!icon && !iconCls && doms.icon) {
				$fly(doms.icon).css("display", "none");
			}
			else {
				if (doms.icon) {
					$fly(doms.icon).prop("className", ICON_CLASS).css("display", "");
				}
				if ((icon || iconCls) && !doms.icon) {
					button._createIconSpan();
				}

				if (doms.icon) {
					$DomUtils.setBackgroundImage(doms.icon, icon);
				}

				if (iconCls) {
					$fly(doms.icon).addClass(iconCls);
				}
			}

			button.onResize();
		}
	});
})();

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

(function () {
	var BUTTON_CLICK_CLASS = "-click", BUTTON_HOVER_CLASS = "-hover", BUTTON_TOGGLED_CLASS = "-toggled", BUTTON_DISABLED_CLASS = "-disabled";

	/**
	 * @author Frank Zhang (mailto:frank.zhang@bstek.com)
	 * @component Base
	 * @class 简单按钮。
	 *        <p>
	 *        这种类型的按钮仅由一个div构成，需要用户提供一组className，即可构成一个图标按钮。<br />
	 *        用户需要提供所有的背景图片以及样式，如果不是需要特殊定制的按钮，建议使用dorado.widget.SimpleIconButton，只需要提供一个图标即可实现不错的效果。
	 *        </p>
	 * @extends dorado.widget.AbstractButton
	 */
	dorado.widget.SimpleButton = $extend(dorado.widget.AbstractButton, /** @scope dorado.widget.SimpleButton.prototype */{
		$className: "dorado.widget.SimpleButton",

		ATTRIBUTES: /** @scope dorado.widget.SimpleButton.prototype */ {
			className: {
				defaultValue: "d-simple-button"
			},

			/**
			 * 当用户点击该按钮以后使用的className，不设置则自动根据className后面加上-click。
			 *
			 * @type String
			 * @attribue
			 */
			mouseDownClassName: {},

			/**
			 * 当鼠标移动到按钮上以后使用的className，不设置则自动根据className后面加上-hover。
			 *
			 * @type String
			 * @attribue
			 */
			hoverClassName: {},

			/**
			 * 当按钮的toggled属性为true以后使用的className，不设置则自动根据className后面加上-toggled。
			 *
			 * @type String
			 * @attribue
			 */
			toggledClassName: {},

			/**
			 * 当按钮disabled以后使用的className，不设置则自动根据className后面加上-disabled
			 *
			 * @type String
			 * @attribue
			 */
			disabledClassName: {}
		},

		/**
		 * 被toggle的setter调用。
		 *
		 * @protected
		 */
		doSetToggle: function () {
			var button = this, dom = button._dom, cls = button._className, toggledClass = button._toggledClassName;
			if (dom) {
				$fly(dom).toggleClass("d-toggled " + (toggledClass ? toggledClass : (cls + BUTTON_TOGGLED_CLASS)), !!button._toggled);
			}
		},

		/**
		 * @protected
		 */
		doShowMenu: function () {
			var button = this, menu = button._menu, dom = button._dom, cls = button._className, toggledClass = button._toggledClassName;

			if (menu) {
				menu.bind("onShow", function () {
					if (button._toggleOnShowMenu) {
						$fly(dom).addClass("d-toggled " + (toggledClass ? toggledClass : (cls + BUTTON_TOGGLED_CLASS)));
					}

					// 当menu hide的时候,
					// 判断button的toggleOnShowMenu的值，来决定是否去除button的toggle。
					menu.bind("onHide", function () {
						if (button._toggleOnShowMenu) {
							$fly(dom).removeClass("d-toggled " + (toggledClass ? toggledClass : (cls + BUTTON_TOGGLED_CLASS)));
						}
					}, {
						once: true
					});

				}, {
					once: true
				});

				menu._focusParent = button;
				menu.show({
					anchorTarget: button,
					align: "innerleft",
					vAlign: "bottom"
				});
			}
		},

		onDisabledChange: function () {
			var button = this, dom = button._dom, cls = button._className, hoverClass = button._hoverClassName;
			if (dom) {
				$fly(dom).removeClass("d-hover " + (hoverClass ? hoverClass : (button._className + BUTTON_HOVER_CLASS))).removeClass(cls + "-focused");
			}
		},

		createDom: function () {
			var button = this, dom = document.createElement("div"), hoverClass = button._hoverClassName, mouseDownClass = button._mouseDownClassName;

			dom.className = button._className;

			$fly(dom).hover(function () {
				if (!button._disabled) {
					$fly(dom).addClass("d-hover " + (hoverClass ? hoverClass : (button._className + BUTTON_HOVER_CLASS)));
				}
			},function () {
				$fly(dom).removeClass("d-hover " + (hoverClass ? hoverClass : (button._className + BUTTON_HOVER_CLASS)));
			}).mousedown(function () {
					if (!button._disabled) {
						$fly(dom).addClass("d-click " + (mouseDownClass ? mouseDownClass : (button._className + BUTTON_CLICK_CLASS)));
					}
					$(document).one("mouseup", function () {
						$fly(dom).removeClass("d-click " + (mouseDownClass ? mouseDownClass : (button._className + BUTTON_CLICK_CLASS)));
					});
				});

			return dom;
		},

		refreshDom: function (dom) {
			$invokeSuper.call(this, arguments);

			var button = this, cls = button._className, disabledClass = button._disabledClassName, toggledClass = button._toggledClassName;

			$fly(dom).toggleClass("d-disabled " + (disabledClass ? disabledClass : (cls + BUTTON_DISABLED_CLASS)), !!button._disabled)
				.toggleClass("d-toggled " + (toggledClass ? toggledClass : (cls + BUTTON_TOGGLED_CLASS)), !!button._toggled);
		},

		onClick: function () {
			$invokeSuper.call(this, arguments);
			if (this._menu) {
				this.doShowMenu();
			}
		}

	});

	/**
	 * @component Base
	 * @class 简单的图标按钮。
	 *        <p>
	 *        只需要设置一个icon或者iconClass即可使用的图标按钮。<br />
	 *        在button绑定了menu以后，该按钮的className会在原本的className上添加上"-trigger"，显示效果为右侧显示一个下拉箭头。如果不想使用该效果，设置showTrigger属性为true即可。
	 *        </p>
	 * @extends dorado.widget.SimpleButton
	 */
	dorado.widget.SimpleIconButton = $extend(dorado.widget.SimpleButton, /** @scope dorado.widget.SimpleIconButton.prototype */{
		$className: "dorado.widget.SimpleIconButton",

		ATTRIBUTES: /** @scope dorado.widget.SimpleIconButton.prototype */ {
			className: {
				defaultValue: "d-icon-button"
			},

			width: {
				independent: true
			},

			height: {
				independent: true
			},

			/**
			 * 图标所在路径
			 *
			 * @type String
			 * @attribute
			 */
			icon: {},

			/**
			 * 图标所用的className
			 *
			 * @type String
			 * @attribute
			 */
			iconClass: {},

			/**
			 * 是否显示右侧按钮。
			 * <p>
			 * 该属性没有默认值，当按钮绑定了菜单以后，则按钮就会显示右侧的Trigger，可以通过设置该属性为false禁用该特性。<br />
			 * 同理，如果按钮没有绑定菜单，又想显示右侧的Trigger，则设置该属性为true就可以。
			 * </p>
			 *
			 * @attribute writeBeforeReady
			 * @type boolean
			 */
			showTrigger: {
				writeBeforeReady: true
			}
		},

		createDom: function () {
			this._className = this._showTrigger === true || (this._menu && (this._showTrigger !== false)) ? this._className + "-trigger d-trigger" : this._className;
			var dom = $invokeSuper.call(this, arguments);
			$fly(dom).addClass(this._className).xCreate({
				tagName: "div",
				className: "d-icon"
			});
			return dom;
		},

		refreshDom: function (dom) {
			$invokeSuper.call(this, arguments);
			var button = this, cls = button._className, action = button._action || {}, icon = button._icon || action._icon, iconClass = button._iconClass || action._iconClass;

			var iconEl = dom.firstChild;
			$DomUtils.setBackgroundImage(iconEl, icon);
			if (iconClass) {
				iconEl.className = "d-icon " + iconClass;
			}
			$fly(dom).toggleClass("d-disabled " + cls + BUTTON_DISABLED_CLASS, !!(button._disabled || action._disabled));
		}
	});
})();

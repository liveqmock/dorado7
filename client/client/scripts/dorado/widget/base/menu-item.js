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
	var MENU_ITEM_DISABLED_CLASS = "menu-item-disabled", CHECKED_ICON = "checked-icon", UN_CHECKED_ICON = "unchecked-icon", HAS_GROUP_CLASS = "has-subgroup", MENU_ITEM_OVER_CLASS = "menu-item-hover";

	/**
	 * @name dorado.widget.menu
	 * @namespace
	 */
	dorado.widget.menu = {};

	/**
	 * @author Frank Zhang (mailto:frank.zhang@bstek.com)
	 * @class 基础的菜单项。
	 * @extends dorado.widget.RenderableViewElement
	 */
	dorado.widget.menu.AbstractMenuItem = $extend(dorado.widget.RenderableViewElement, /** @scope dorado.widget.menu.AbstractMenuItem.prototype */ {
		$className: "dorado.widget.menu.AbstractMenuItem",

		ATTRIBUTES: /** @scope dorado.widget.menu.AbstractMenuItem.prototype */ {

			/**
			 * 菜单项的name，可以不指定。但如果需要通过代码获得该菜单项，则必须指定。
			 * @type String
			 * @attribute
			 */
			name: {},

			/**
			 * 父菜单菜单。
			 * @type dorado.widget.Menu
			 * @attribute
			 */
			parent: {
				readOnly: true
			},

			/**
			 * 该MenuItem是否可见。
			 * @type boolean
			 * @default true
			 * @attribute
			 */
			visible: {
				defaultValue: true,
				setter: function(value) {
					var item = this, dom = item._dom;
					item._visible = value;
					if (dom) {
						dom.style.display = value ? "" : "none";
					}
				}
			}
		},

		getTopMenu: function() {
			var menu = this._parent, opener = menu.opener, result;
			while(opener) {
				var parent = opener._parent;
				if (opener instanceof dorado.widget.menu.AbstractMenuItem && parent instanceof dorado.widget.Menu) {
					result = parent;
				}
				opener = parent ? parent.opener : null;
			}
			return result;
		}
	});

	/**
	 * @author Frank Zhang (mailto:frank.zhang@bstek.com)
	 * @class 分割菜单项，用来分割不同种类的菜单项。
	 * @shortTypeName - ; Separator
	 * @extends dorado.widget.menu.AbstractMenuItem
	 */
	dorado.widget.menu.Separator = $extend(dorado.widget.menu.AbstractMenuItem, /** @scope dorado.widget.menu.Separator.prototype */ {
		$className: "dorado.widget.menu.Separator",

		ATTRIBUTES: /** @scope dorado.widget.menu.Separator.prototype */ {
			className: {
				defaultValue: "menu-item-separator"
			}
		},

		createDom: function() {
			var item = this, dom = document.createElement("li");
			dom.className = item._className;
			dom.style.display = item._visible ? "" : "none";
			return dom;
		},

		refreshDom: function(dom) {
			var item = this;
			if (dom) {
				dom.style.display = item._visible ? "" : "none";
			}
		}
	});

	/**
	 * @author Frank Zhang (mailto:frank.zhang@bstek.com)
	 * @class 可以显示文本的菜单项。
	 * @abstract
	 * @extends dorado.widget.menu.AbstractMenuItem
	 * @extends dorado.widget.ActionSupport
	 */
	dorado.widget.menu.TextMenuItem = $extend([dorado.widget.menu.AbstractMenuItem, dorado.widget.ActionSupport], /** @scope dorado.widget.menu.TextMenuItem.prototype */ {
		$className: "dorado.widget.menu.TextMenuItem",

		ATTRIBUTES: /** @scope dorado.widget.menu.TextMenuItem.prototype */ {
			/**
			 * 是否在点击后关闭整个Menu，默认值为True。
			 * @type boolean
			 * @default true
			 * @attribute
			 */
			hideOnClick: {
				defaultValue: true
			},

			className: {
				defaultValue: "menu-item"
			},

			/**
			 * MenuItem是否被禁用，默认值为false。
			 * @type boolean
			 * @default false
			 * @attribute
			 */
			disabled: {},

			/**
			 * MenuItem上显示的文本内容。
			 * @type String
			 * @attribute
			 */
			caption: {},

			/**
			 * 菜单项使用的图标。
			 * @attribute
			 * @type String
			 */
			icon: {},

			/**
			 * 菜单项使用的图标的className。
			 * @attribute
			 * @type String
			 */
			iconClass: {},

			action: {
				componentReference: true
			}
		},

		EVENTS: /** @scope dorado.widget.menu.TextMenuItem.prototype */ {
			/**
			 * 当MenuItem被点击时触发的事件。
			 * @param {Object} self 事件的发起者，即组件本身。
			 * @param {Object} arg 事件参数。
			 * @return {boolean} 是否要继续后续事件的触发操作，不提供返回值时系统将按照返回值为true进行处理。
			 * @event
			 */
			onClick: {}
		},

		doOnRemove: function() {
			this.set("action", null);
			this._dom && $fly(this._dom).remove();
		},

		refreshDom: function(dom) {
			var item = this, action = item._action || {}, disabled = item._disabled || action._disabled || action._sysDisabled, icon = item._icon || action._icon, iconCls = item._iconClass || action._iconClass, doms = item._doms;

			$fly(dom)[disabled ? "addClass" : "removeClass"](MENU_ITEM_DISABLED_CLASS).css("display", item._visible ? "" : "none");
			$fly(doms.caption).text(item._caption || action._caption);
			if (icon) {
				$DomUtils.setBackgroundImage(doms.icon, icon);
			}
			else {
				$fly(doms.icon).css("background-image", "");
			}
			$fly(doms.icon).prop("className", "d-icon");
			if (iconCls) {
				$fly(doms.icon).addClass(iconCls);
			}
		},

		createDom: function() {
			var item = this, action = item._action || {}, doms = {}, dom = $DomUtils.xCreate({
				tagName: "li",
				className: "menu-item",
				content: {
					tagName: "span",
					className: "menu-item-content",
					contextKey: "itemContent",
					content: [
						{
							tagName: "span",
							className: "d-icon",
							contextKey: "icon",
							content: "&nbsp;"
						},
						{
							tagName: "span",
							className: "caption",
							content: item._caption || action._caption,
							contextKey: "caption"
						}
					]
				}
			}, null, doms), disabled = item._disabled || action._disabled || action._sysDisabled, icon = item._icon || action._icon;

			item._doms = doms;

			$fly(dom).css("display", item._visible ? "" : "none").addClass(disabled ? MENU_ITEM_DISABLED_CLASS : "").hover(function() {
				item._parent.focusItem(item, true);
			}, dorado._NULL_FUNCTION);

			if (icon) {
				$DomUtils.setBackgroundImage(doms.icon, icon);
			}
			else {
				$fly(doms.icon).css("background-image", "");
			}

			return dom;
		},

		hideTopMenu: function() {
			var item = this;
			if (item._parent) {
				item._parent.hideTopMenu();
			}
		}
	});

	/**
	 * @author Frank Zhang (mailto:frank.zhang@bstek.com)
	 * @class 绑定control的Menu。
	 * @shortTypeName Control
	 * @extends dorado.widget.menu.TextMenuItem
	 */
	dorado.widget.menu.ControlMenuItem = $extend(dorado.widget.menu.TextMenuItem, /** @scope dorado.widget.menu.ControlMenuItem.prototype*/ {
		$className: "dorado.widget.menu.ControlMenuItem",
		focusable: true,

		ATTRIBUTES: /** @scope dorado.widget.menu.ControlMenuItem.prototype*/ {
			/**
			 * 绑定的组件。
			 * @attribute
			 * @type dorado.widget.FloatControl
			 */
			control: {
				setter: function(control) {
					if (this._control) this.unregisterInnerViewElement(this._control);

					if (!(control instanceof dorado.widget.Control)) {
						control = dorado.Toolkits.createInstance("widget", control, function(type) {
							return dorado.Toolkits.getPrototype("widget");
						});
					}

					if (control) this.unregisterInnerViewElement(control);
					this._control = control;
				}
			},

			view: {
				setter: function(view) {
					$invokeSuper.call(this, arguments);

					if (this._control) this._control.set("view", view);
				}
			}
		},

		createDom: function() {
			var item = this, dom = $invokeSuper.call(this, arguments);

			$fly(dom).click(function(event) {
				item.onClick(event);
			}).addClass(item._control ? HAS_GROUP_CLASS : "");

			return dom;
		},

		hideControl: function() {
			var item = this;
			if (item._showControlTimer) {
				clearTimeout(item._showControlTimer);
				item._showControlTimer = null;
			}
			else if (item._control) {
				item._control.hide();
			}
		},

		onSelect: function() {
			var item = this;
			item.hideControl();
			item.hideTopMenu();
		},

		onClick: function() {
			var item = this, action = item._action || {}, disabled = item._disabled || action._disabled || action._sysDisabled;
			if (!disabled) {
				action.execute && action.execute();
				item.fireEvent("onClick", item);
			}
		},

		onFocus: function() {
			var item = this, dom = item._dom;
			$fly(dom).addClass(MENU_ITEM_OVER_CLASS);
			item.showControl();
		},

		showControl: function() {
			var item = this;
			if (item._control) {
				item._showControlTimer = setTimeout(function() {
					item._control.show({
						anchorTarget: item,
						align: "right",
						vAlign: "innertop",
						delay: 300,
						onHide: function(self) {
							self.opener = null;
						}
					});
					item._control._focusParent = item._parent;
					item._control.opener = item;

					item._showControlTimer = null;
				}, 300);
			}
		},

		onBlur: function() {
			var item = this, dom = item._dom;
			$fly(dom).removeClass(MENU_ITEM_OVER_CLASS);
			item.hideControl();
		}
	});

	/**
	 * @author Frank Zhang (mailto:frank.zhang@bstek.com)
	 * @class 可以有下级子菜单的MenuItem。
	 * @shortTypeName Default
	 * @extends dorado.widget.menu.TextMenuItem
	 */
	dorado.widget.menu.MenuItem = $extend(dorado.widget.menu.TextMenuItem, /** @scope dorado.widget.menu.MenuItem.prototype */ {
		$className: "dorado.widget.menu.MenuItem",

		focusable: true,

		ATTRIBUTES: /** @scope dorado.widget.menu.MenuItem.prototype */ {
			/**
			 * 该Item对象的子菜单项
			 * @type dorado.widget.Menu
			 * @attribute
			 * @private
			 */
			submenu: {
				setter: function(value) {
					if (this._submenu) this.unregisterInnerViewElement(this._submenu);

					var submenu;
					if (!value) {
						submenu = null;
					}
					else if (value.constructor == Object.prototype.constructor) {
						submenu = new dorado.widget.Menu(value);
					}
					else if (value instanceof dorado.widget.Menu) {
						submenu = value;
					}

					if (submenu) this.registerInnerViewElement(submenu);
					this._submenu = submenu;

					var dom = this._dom;
					if (dom) {
						$fly(dom)[this._submenu ? "addClass" : "removeClass"](HAS_GROUP_CLASS);
					}
				}
			},

			/**
			 * 该属性为虚拟属性，指向MenuItem对应的Menu的items属性。
			 * @type dorado.util.KeyedArray
			 * @attribute
			 */
			items: {
				getter: function() {
					if (this._submenu) {
						return this._submenu.get("items");
					}
					return null;
				},
				setter: function(value) {
					var parentItem = this, submenu = parentItem._submenu;
					if (value.constructor == Array.prototype.constructor) {
						var originSkipRefresh;
						if (submenu) {
							originSkipRefresh = submenu._skipRefresh;
							submenu._skipRefresh = true;
						}

						parentItem.clearItems();
						value.each(function(item) {
							parentItem.addItem(item);
						});

						if (submenu) {
							submenu._skipRefresh = originSkipRefresh;
						}
					}
				}
			}
		},

		doGet: function(attr) {
			var c = attr.charAt(0);
			if (c == '#' || c == '&') {
				var itemName = attr.substring(1);
				return this.getItem(itemName);
			}
			else {
				return $invokeSuper.call(this, [attr]);
			}
		},

		/**
		 * MenuItem是否包含子菜单项。
		 * @return {boolean} 是否包含子菜单.
		 */
		hasSubmenu: function() {
			return !!this._submenu;
		},

		/**
		 * 取得MenuItem中的子MenuItem。
		 * @param {String|int} name 可以是Item的name，也可以是item的索引。
		 * @return {dorado.widget.menu.AbstractMenuItem} 找到的MenuItem。
		 */
		getItem: function(name) {
			var menuItem = this, submenu = menuItem._submenu;
			if (submenu) {
				return submenu.getItem(name);
			}
			return null;
		},

		/**
		 * 为子菜单添加菜单项。
		 * @param {Object|dorado.widget.menu.AbstractMenuItem} item 要添加的菜单项或者菜单项的配置信息。
		 * @param {int} [index] 要插入的菜单项的索引，如不指定，则添加到最后。
		 */
		addItem: function(item, index) {
			var menuItem = this, submenu = menuItem._submenu;
			if (item) {
				if (!submenu) {
					submenu = new dorado.widget.Menu();
					menuItem.set("submenu", submenu);
				}
				submenu.addItem(item, index);
			}
		},

		/**
		 * 移除子菜单的菜单项
		 * @param {int|dorado.widget.menu.AbstractMenuItem} item 要移除的菜单项的索引或者菜单项。
		 */
		removeItem: function(item) {
			var menuItem = this, submenu = menuItem._submenu;
			if (item != null && submenu) {
				submenu.removeItem(item);
			}
		},

		/**
		 * 清除子菜单的所有菜单项
		 */
		clearItems: function() {
			var menuItem = this, submenu = menuItem._submenu;
			if (submenu) {
				submenu.clearItems();
			}
		},

		onFocus: function(showSubmenu) {
			var item = this, dom = item._dom;
			$fly(dom).addClass(MENU_ITEM_OVER_CLASS);
			if (item._submenu && showSubmenu) {
				item.showSubmenu();
			}
		},

		onBlur: function() {
			var item = this, dom = item._dom;
			$fly(dom).removeClass(MENU_ITEM_OVER_CLASS);
			if (item._submenu) {
				item.hideSubmenu();
			}
		},

		/**
		 * 显示出子菜单项。
		 * @param {boolean} [focusfirst] 是否使得第一个菜单项获得焦点, 默认值为false。
		 */
		showSubmenu: function(focusfirst) {
			var item = this, submenu = item._submenu;
			if (submenu) {
				item._showSubmenuTimer = setTimeout(function() {
					var owner = item._parent;

					if (owner && owner.getListenerCount("onContextMenu") > 0 && submenu.getListenerCount("onContextMenu") == 0) {
						var handles = item._parent._events["onContextMenu"];
						for(var i = 0, j = handles.length; i < j; i++) {
							var handler = handles[i];
							submenu.bind("onContextMenu", handler.listener, handler.options);
						}
						submenu._inheritContextMenu = true;
					}
					if (submenu._parent != owner) owner.registerInnerControl(submenu);

					submenu.show({
						anchorTarget: item,
						align: "right",
						vAlign: "innertop",
						focusFirst: focusfirst
					});

					submenu._focusParent = item._parent;

					item._showSubmenuTimer = null;
				}, 300);
			}
		},

		onClick: function(event) {
			var item = this, action = item._action || {}, disabled = item._disabled || action._disabled || action._sysDisabled;
			if (!disabled) {
				if (item.hasSubmenu()) {
					action.execute && action.execute();
					item.fireEvent("onClick", item);
					//注：为了修复dorado7-2367把这句给屏蔽了，记不清为什么要添加这句了。
					//event.stopImmediatePropagation();
				}
				else {
					action.execute && action.execute();
					item.fireEvent("onClick", item);
					if (item._hideOnClick) {
						item._parent.hideTopMenu();
					}
				}
			}
		},

		/**
		 * 隐藏子菜单项。
		 */
		hideSubmenu: function() {
			var item = this, submenu = this._submenu;
			if (submenu) {
				if (item._showSubmenuTimer) {
					clearTimeout(item._showSubmenuTimer);
					item._showSubmenuTimer = null;
				}
				else {
					if (submenu._inheritContextMenu) {
						submenu.clearListeners("onContextMenu");
					}
					submenu.hide();
				}
			}
		},

		createDom: function() {
			var item = this, dom = $invokeSuper.call(this, arguments);

			$fly(dom).click(function(event) {
				item.onClick(event);
			}).addClass(item.hasSubmenu() ? HAS_GROUP_CLASS : "");

			return dom;
		}
	});

	dorado.widget.menu.CheckGroupManager = {
		groups: {},

		addCheckItem: function(groupName, item) {
			if (!groupName || !item) return;
			var manager = this, groups = manager.groups, group = groups[groupName];
			if (!group) {
				group = groups[groupName] = {
					current: null,
					items: []
				};
			}
			group.items.push(item);
			if (item._checked) {
				dorado.widget.menu.CheckGroupManager.setGroupCurrent(groupName, item);
			}
		},

		removeCheckItem: function(groupName, item) {
			if (!groupName || !item) return;
			var manager = this, groups = manager.groups, group = groups[groupName];
			if (group) {
				if (group.current == item) {
					group.current = null;
				}
				group.items.remove(item);
			}
		},

		setGroupCurrent: function(groupName, item) {
			if (!groupName || !item) return;
			var manager = this, groups = manager.groups, group = groups[groupName];
			if (group) {
				var current = group.current;
				if (current == item) {
					return;
				}
				if (current instanceof dorado.widget.menu.CheckableMenuItem) {
					current.set("checked", false);
				}
				group.current = item;
			}
		}
	};

	/**
	 * @author Frank Zhang (mailto:frank.zhang@bstek.com)
	 * @class 可以复选的MenuItem。
	 * @shortTypeName Checkable
	 * @extends dorado.widget.menu.TextMenuItem
	 */
	dorado.widget.menu.CheckableMenuItem = $extend(dorado.widget.menu.MenuItem, /** @scope dorado.widget.menu.CheckableMenuItem.prototype */ {
		$className: "dorado.widget.menu.CheckableMenuItem",

		ATTRIBUTES: /** @scope dorado.widget.menu.CheckableMenuItem.prototype */ {
			/**
			 * 是否被选中。
			 * @type boolean
			 * @default false
			 * @attribute
			 */
			checked: {
				setter: function(value) {
					var item = this;
					if (value && item._group) {
						dorado.widget.menu.CheckGroupManager.setGroupCurrent(item._group, item);
					}
					item._checked = value;
				}
			},

			/**
			 * 对应的组，默认为空。设置了组以后，有类似RadioGroup的效果。
			 * @type boolean
			 * @attribute
			 */
			group: {
				setter: function(value) {
					var item = this, oldValue = item._group;
					if (oldValue) {
						dorado.widget.menu.CheckGroupManager.removeCheckItem(oldValue, item);
					}
					if (value) {
						dorado.widget.menu.CheckGroupManager.addCheckItem(value, item);
					}
					item._group = value;
				}
			}
		},

		EVENTS: /** @scope dorado.widget.menu.CheckableMenuItem.prototype */ {
			/**
			 * 当check状态改变的时候触发的事件。
			 * @param {Object} self 事件的发起者，即组件本身。
			 * @param {Object} arg 事件参数。
			 * @return {boolean} 是否要继续后续事件的触发操作，不提供返回值时系统将按照返回值为true进行处理。
			 * @event
			 */
			onCheckedChange: {}
		},

		refreshDom: function(dom) {
			$invokeSuper.call(this, arguments);
			var item = this;
			if (item._dom) {
				if (item._checked) {
					$fly(item._doms.icon).removeClass(UN_CHECKED_ICON).addClass(CHECKED_ICON);
				}
				else {
					$fly(item._doms.icon).removeClass(CHECKED_ICON).addClass(UN_CHECKED_ICON);
				}
			}
		},

		onClick: function() {
			var item = this, parent = item._parent, action = item._action || {}, disabled = item._disabled || action._disabled || action._sysDisabled;
			if (!disabled) {
				action.execute && action.execute();
				item.fireEvent("onClick", item);
				if (!item.hasSubmenu() && item._hideOnClick) {
					parent.hideTopMenu();
				}

				item.set("checked", !item._checked);
				item.fireEvent("onCheckedChange", item);
			}
		},

		createDom: function() {
			var item = this, dom = $invokeSuper.call(this, arguments);

			$fly(item._doms.icon).addClass(item._checked ? CHECKED_ICON : UN_CHECKED_ICON);
			$fly(dom).hover(function() {
				item._parent.focusItem(item, true);
			}, dorado._NULL_FUNCTION);

			return dom;
		}
	});

	dorado.Toolkits.registerPrototype("menu", {
		"-": dorado.widget.menu.Separator,
		Separator: dorado.widget.menu.Separator,
		Checkable: dorado.widget.menu.CheckableMenuItem,
		Control: dorado.widget.menu.ControlMenuItem,
		Default: dorado.widget.menu.MenuItem
	});
})();

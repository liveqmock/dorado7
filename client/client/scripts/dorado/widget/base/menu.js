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
	var GROUP_CONTENT_CLASS = "group-content", GROUP_OVERFLOW_CLASS = "d-menu-overflow";
	var SKIP_REFRESH = false;

	/**
	 * @author Frank Zhang (mailto:frank.zhang@bstek.com)
	 * @class 抽象菜单项组。
	 * @extends dorado.widget.Control
	 * @extends dorado.widget.FloatControl
	 */
	dorado.widget.AbstractMenu = $extend([dorado.widget.Control, dorado.widget.FloatControl], /** @scope dorado.widget.AbstractMenu.prototype */ {
		$className: "dorado.widget.AbstractMenu",
		ATTRIBUTES: {
			/**
			 * 设置的时候以数组形式进行设置，读取的时候得到的属性为dorado.util.KeyedArray。
			 * @type dorado.util.KeyedArray
			 * @attribute
			 */
			items: {
				setter: function(value) {
					var menu = this, items = menu._items, doms = menu._doms, rendered = menu._rendered, i, l;
					if (items) {
						menu.clearItems();
					}
					if (value && value instanceof Array) {
						var originSkipRefresh = menu._skipRefresh;
						menu._skipRefresh = true;
						for (i = 0, l = value.length; i < l; i++) {
							menu.addItem(value[i]);
						}
						menu._skipRefresh = originSkipRefresh;
						if (rendered) menu.refresh();
					}
				}
			}
		},

		doGet: function(attr) {
			var c = attr.charAt(0);
			if (c == '#' || c == '&') {
				var itemName = attr.substring(1);
				return this.getItem(itemName);
			} else {
				return $invokeSuper.call(this, [attr]);
			}
		},

		/**
		 * 为Menu添加MenuItem。
		 * @param {Object|dorado.widget.menu.AbstractMenuItem} item 可以是MenuItem或者MenuItem的Json配置信息。
		 * @param {int} [index] 可以是整数或者MenuItem。
		 *                      如果是整数，代表插入以后该Item的位置。如果是MenuItem，则代表要插入到该MenuItem之前。
		 * @return {dorado.widget.menu.AbstractMenuItem} 返回刚刚添加的MenuItem。
		 */
		addItem: function(item, index) {
			var menu = this, items = menu._items, doms = menu._doms, refItem;
			items = menu._items = items ? menu._items : new dorado.util.KeyedArray(function(value) {
				return value._name;
			});
			if (item.constructor == Object.prototype.constructor || typeof item == "string") {
				item = menu.createMenuItem(item);
			}
			menu.registerInnerViewElement(item);

			if (typeof index == "number") {
				items.insert(item, index);
				refItem = items.get(index + 1);
			} else if (index instanceof dorado.widget.menu.AbstractMenuItem) {
				refItem = items.indexOf(index);
				if (index != -1) {
					items.insert(item, index);
				} else {
					throw new dorado.ResourceException("dorado.base.ItemNotInGroup");
				}
			} else {
				items.insert(item);
			}

			/* Commented by Benny 2014/1/15, 反正后面有refresh()，似乎不需要
			if (menu._rendered) {
				item.render(doms.groupContent, refItem ? refItem._dom : null);
			}
			*/

			if (!menu._skipRefresh) menu.refresh();
			return item;
		},

		/**
		 * 取得Menu中的MenuItem。
		 * @param {String|int} name 可以是Item的name，也可以是item的索引。
		 * @return {dorado.widget.menu.AbstractMenuItem} 找到的MenuItem。
		 */
		getItem: function(name) {
			var menu = this, items = menu._items;
			if (items) {
				if (typeof name == "number" || typeof name == "string") {
					return items.get(name);
				} else {
					return name;
				}
			}
			return null;
		},

		/**
		 * 根据路径描述取得MenuItem，可以是任意级别的item。
		 * 路径使用"/"来分割，如果需要找到name为File的MenuItem下的子菜单中的Name为Open的MenuItem，路径描述符为File/Open
		 * @param {String} path 要查找额MenuItem的路径描述符。
		 * @return {dorado.widget.menu.AbstractMenuItem} 找到的MenuItem。
		 */
		findItem: function(path) {
			var menu = this, items = menu._items, item, itemgroup, i, j;
			if (!items) {
				return null;
			}
			if (typeof path == "string") {
				var index = path.indexOf("/"), mainpath, subpath;
				if (index != -1) {
					mainpath = path.substring(0, index);
					subpath = path.substring(index + 1);
				} else {
					mainpath = path;
				}
				if (subpath) {
					for (i = 0, j = items.size; i < j; i++) {
						item = items.get(i);
						if (item._name == mainpath) {
							itemgroup = item._submenu;
							if (itemgroup) {
								return itemgroup.findItem(subpath);
							}
						}
					}
				} else {
					for (i = 0, j = items.size; i < j; i++) {
						item = items.get(i);
						if (item._name == mainpath) {
							return item;
						}
					}
					return null;
				}
			}
			return null;
		},

		/**
		 * 移除菜单项。
		 * @param {String|int|dorado.widget.menu.AbstractMenuItem} item 要移除的菜单项，可以是菜单项、菜单项的索引以及菜单项的name。
		 * @return  {dorado.widget.menu.AbstractMenuItem} 移除的菜单项。
		 */
		removeItem: function(item) {
			var menu = this, items = menu._items, dom;
			if (items) {
				if (typeof item == "number" || typeof item == "string") {
					item = items.get(item);
				}
				if (item) {
					item.doOnRemove && item.doOnRemove();
					menu.unregisterInnerViewElement(item);
					items.remove(item);
				}
			}
			if (!menu._skipRefresh) menu.refresh();
			return item;
		},

		/**
		 * 删除所有的MenuItem
		 * @param deep 是否删除MenuItem的子菜单项。如果不传入该值，默认为false。
		 */
		clearItems: function(deep) {
			var menu = this, items = menu._items, dom;
			if (items) {
				var originSkipRefresh = menu._skipRefresh;
				menu._skipRefresh = true;
				
				var innerItems = items.items;
				for (var i = innerItems.length - 1; i >= 0; i--) {
					var item = innerItems[i];
					if (deep && item instanceof dorado.widget.menu.MenuItem) {
						var subGroup = item._submenu;
						if (subGroup) {
							subGroup.clearItems(deep);
							subGroup.destroy();
						}
					}
					item.doOnRemove && item.doOnRemove();
					menu.unregisterInnerViewElement(item);
					items.removeAt(i);
				}
				menu._skipRefresh = originSkipRefresh;
				menu.refresh();
			}
		},

		getTopMenu: function() {
			var menu = this, opener = menu.opener, result = menu;
			while (opener) {
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
	 * @class 菜单项组。
	 * @extends dorado.widget.AbstractMenu
	 */
	dorado.widget.Menu = $extend(dorado.widget.AbstractMenu, /** @scope dorado.widget.Menu.prototype */ {
		$className: "dorado.widget.Menu",

		focusable: true,
		selectable: false,

		ATTRIBUTES: /** @scope dorado.widget.Menu.prototype */ {
			className: {
				defaultValue: "d-menu"
			},

			floatingClassName: {
				defaultValue: "d-menu-floating"
			},

			visible: {
				defaultValue: false
			},

			animateType: {
				defaultValue: "slide",
				skipRefresh: true
			},

			hideAnimateType: {
				defaultValue: "fade",
				skipRefresh: true
			},

			/**
			 * 图标的显示位置，可选值：left、top。
			 * @attribute
			 * @default "left"
			 * @type String
			 */
			iconPosition: {
				defaultValue: "left"
			},

			/**
			 * 图标的显示大小，可选值：normal、big。
			 * @default "normal"
			 * @type String
			 */
			iconSize: {
				defaultValue: "normal"
			},

			/**
			 * 只读属性，Menu的当前高亮的MenuItem。<br />
			 * 当遇到Menu的contextMenu的时候，可能需要使用到该属性。
			 * @attribute readOnly
			 * @type dorado.widget.menu.AbstractMenuItem
			 */
			focusItem: {}
		},

		EVENTS: /** @scope dorado.widget.Menu.prototype */ {
			/**
			 * 在Menu的上层菜单被隐藏的时候触发的事件。当菜单项被click的时候，会触发此事件。
			 * @param {Object} self 事件的发起者，即组件本身。
			 * @param {Object} arg 事件参数。
			 * @return {boolean} 是否要继续后续事件的触发操作，不提供返回值时系统将按照返回值为true进行处理。
			 * @event
			 */
			onHideTopMenu: {},

			/**
			 * 当控件被点击时触发的事件。
			 * @param {Object} self 事件的发起者，即组件本身。
			 * @param {Object} arg 事件参数。
			 * @param {int} arg.button 表示用户按下的是哪个按钮，具体请参考DHTML的相关文档。
			 * @param {Event} arg.event DHTML中的事件event参数。
			 * @param {Event} arg.item 点击的MenuItem对象，注意item有可能是空，因为Menu可以定义高度，可以有地方没有MenuItem。
			 * @param {boolean} #arg.returnValue 表示是否要终止该鼠标事件的冒泡处理机制。
			 * 如果返回false相当于调用了系统event的preventDefault()和stopPropagation()方法。
			 * 不定义此参数表示交由系统自行判断。
			 * @return {boolean} 是否要继续后续事件的触发操作，不提供返回值时系统将按照返回值为true进行处理。
			 * @event
			 */
			onClick : {}
		},

		/**
		 * 创建MenuItem。
		 * @param {Object|dorado.widget.menu.AbstractMenuItem} config MenuItem的配置信息、或者MenuItem
		 * @return {dorado.widget.menu.MenuItem} 创建好的MenuItem。
		 * @protected
		 */
		createMenuItem: function(config) {
			if (!config) {
				return null;
			}
			var menu = this, item;
			if (config instanceof dorado.widget.menu.AbstractMenuItem) {
				item = config;
			} else {
				item = dorado.Toolkits.createInstance("menu", config);
			}
			item._parent = menu;
			return item;
		},

		/**
		 * 创建overflow的上下箭头。
		 * @protected
		 */
		createOverflowArrow: function() {
			var menu = this, dom = menu._dom, doms = menu._doms;
			if (dom) {
				var topArrow = $DomUtils.xCreate({
					tagName: "div",
					className: "overflow-top-arrow"
				});

				var bottomArrow = $DomUtils.xCreate({
					tagName: "div",
					className: "overflow-bottom-arrow"
				});

				$fly(dom).prepend(topArrow);
				dom.appendChild(bottomArrow);

				jQuery(topArrow).repeatOnClick(function() {
					menu.doScrollUp();
				}, 120).addClassOnHover("overflow-top-arrow-hover");

				jQuery(bottomArrow).repeatOnClick(function() {
					menu.doScrollDown();
				}, 120).addClassOnHover("overflow-bottom-arrow-hover");

				doms.overflowTopArrow = topArrow;
				doms.overflowBottomArrow = bottomArrow;
			}
		},

		/**
		 * 清除Overflow设置的height与scrollTop。
		 * @protected
		 */
		clearOverflow: function() {
			var menu = this, dom = menu._dom, doms = menu._doms;
			if (dom) {
				menu._overflowing = false;
				if (dorado.Browser.msie && dorado.Browser.version == 6) {
					$fly(dom).css("width", "");
				}
				$fly(dom).css("height", "").removeClass(GROUP_OVERFLOW_CLASS);
				$fly(doms.groupContent).scrollTop(0).css("height", "");
			}
		},

		/**
		 * 处理Group的Overflow。
		 * @param overflowHeight Menu对应的高度
		 * @protected
		 */
		handleOverflow: function(overflowHeight) {
			var menu = this, dom = menu._dom, doms = menu._doms;
			if (dom) {
				$fly(dom).addClass(GROUP_OVERFLOW_CLASS).outerHeight(overflowHeight);
				if (!doms.overflowTopArrow) {
					menu.createOverflowArrow();
				}
				menu._overflowing = true;

				var contentHeight = $fly(dom).innerHeight() - $fly(doms.overflowTopArrow).outerHeight() -
				                    $fly(doms.overflowBottomArrow).outerHeight(), contentWidth = $fly(dom).width();

				if (dorado.Browser.msie && dorado.Browser.version == 6) {
					$fly(dom).width(contentWidth);
					$fly(doms.groupContent).outerHeight(contentHeight);
				} else {
					$fly(doms.groupContent).outerHeight(contentHeight);
				}

				$fly([doms.overflowTopArrow, doms.overflowBottomArrow]).outerWidth(contentWidth);
			}
		},

		/**
		 * 清除获得焦点的MenuItem。
		 * @private
		 */
		clearFocusItem: function() {
			var menu = this, focusItem = menu._focusItem;

			if (focusItem && focusItem.focusable) {
				focusItem.onBlur();
			}

			menu._focusItem = null;
		},

		/**
		 * 取得可获得焦点的菜单项。
		 * 可获得焦点的MenuItem的条件是disabled属性为false。
		 * @param {String} [mode] 要获得可获得焦点的菜单项的模式，默认为next。可选值有：
		 *  1.next 下一个可以获得焦点的MenuItem，如果没有当前获得焦点的MenuItem，则自动转为first。
		 *  2.prev 上一个可以获得焦点的MenuItem，如果没有当前获得焦点的MenuItem，则自动转为last。
		 *  3.first 第一个可以获得焦点的MenuItem。
		 *  4.last 最后一个可获得焦点的MenuItem。
		 * @private
		 */
		getFocusableItem: function(mode) {
			var menu = this, items = menu._items, focusItem = menu._focusItem, focusIndex = -1, result = null, i, j, item;

			if (!items) {
				return null;
			}

			mode = mode || "next";

			if (focusItem) {
				focusIndex = items.indexOf(focusItem);
			}

			if (mode == "next") {
				for (i = focusIndex + 1, j = items.size; i < j; i++) {
					item = items.get(i);
					if (!item._disabled && item._visible && !(item instanceof dorado.widget.menu.Separator)) {
						result = item;
						break;
					}
				}
				if (result == null) {
					mode = "first";
				} else {
					return result;
				}
			} else {
				if (mode == "prev") {
					for (i = focusIndex - 1; i >= 0; i--) {
						item = items.get(i);
						if (!item._disabled && item._visible && !(item instanceof dorado.widget.menu.Separator)) {
							result = item;
							break;
						}
					}
					if (result == null) {
						mode = "last";
					} else {
						return result;
					}
				}
			}

			if (mode == "first") {
				for (i = 0, j = items.size; i < j; i++) {
					item = items.get(i);
					if (!item._disabled && item._visible && !(item instanceof dorado.widget.menu.Separator)) {
						result = item;
						break;
					}
				}
				return result;
			} else if (mode == "last") {
				for (i = items.size - 1; i >= 0; i--) {
					item = items.get(i);
					if (!item._disabled && item._visible && !(item instanceof dorado.widget.menu.Separator)) {
						result = item;
						break;
					}
				}
				return result;
			}
		},

		/**
		 * 使得MenuItem获得焦点。(当鼠标移动到相应的MenuItem上以后，会自动显示子菜单。如果使用键盘，向上向下移动不会自动显示子菜单。)
		 * @param {dorado.widget.menu.AbstractMenuItem} item 要获得焦点的MenuItem
		 * @param {boolean} showSubmenu 获得焦点以后，是否显示子菜单。
		 * @private
		 */
		focusItem: function(item, showSubmenu) {
			var menu = this, focusItem = menu._focusItem;

			if (menu._freeze) return;

			if (item && focusItem !== item) {
				menu._focusItem = item;

				if (menu._overflowing) {
					var itemDom = item._dom, doms = menu._doms, viewTop = $fly(doms.groupContent).prop("scrollTop"), contentTop = $fly(doms.groupContent).prop("offsetTop"), itemTop = itemDom.offsetTop, itemHeight = itemDom.offsetHeight, itemBottom = itemTop + itemHeight, contentHeight = $fly(doms.groupContent).innerHeight(), viewBottom = contentHeight + viewTop;

					if (!dorado.Browser.msie) {
						itemTop = itemTop - contentTop;
						itemBottom = itemTop + itemHeight;
					}

					//log.debug("contentHeight:" + contentHeight + "\titemTop:" + itemTop + "\tviewTop:" + viewTop + "\titemBottom:" + itemBottom + "\tviewBottom:" + viewBottom);
					//log.debug("contentTop:" + contentTop + "\titemTop:" + itemTop + "\titem-offsetTop:" + itemDom.offsetTop + "\tcontent-Top:" + contentTop);

					if (itemTop < viewTop) {//top is not visible
						$fly(doms.groupContent).prop("scrollTop", itemTop);
					} else if (itemBottom > viewBottom) {//bottom is not visible
						$fly(doms.groupContent).prop("scrollTop", itemBottom - contentHeight);
					}
				}

				if (focusItem && focusItem.focusable) {
					focusItem.onBlur();
				}

				if (!item._disabled && item.onFocus) {
					item.onFocus(showSubmenu);
				}
			}
		},

		/**
		 * @protected
		 */
		hideTopMenu: function() {
			var menu = this, opener = menu.opener, parent;
			if (menu._floating) {
				menu.hide();
				menu.fireEvent("onHideTopMenu", menu);
				if (opener) {
					parent = opener._parent;
					parent.hideTopMenu();
				}
			}
		},

		/**
		 * @protected
		 */
		doScrollUp: function() {
			var menu = this, doms = menu._doms, groupContent = doms.groupContent, st = $fly(groupContent).scrollTop(), target = st - 22;

			if (target >= 0) {
				$fly(groupContent).scrollTop(target);
			} else {
				$fly(groupContent).scrollTop(0);
			}
		},

		/**
		 * @protected
		 */
		doScrollDown: function() {
			var menu = this, doms = menu._doms, groupContent = doms.groupContent, st = $fly(groupContent).scrollTop(), target = st + 22, scrollHeight = $fly(groupContent).prop("scrollHeight");
			if (target <= scrollHeight) {
				$fly(groupContent).scrollTop(target);
			} else {
				$fly(groupContent).scrollTop(scrollHeight - $fly(groupContent).innerHeight());
			}
		},

		doOnBlur: function() {
			if (this._floating) {
				this.hide();
			} else {
				this.clearFocusItem();
			}
		},

		/**
		 * 键盘事件主要是针对当前获得焦点的MenuItem，当鼠标移动到可用的菜单项(disable属性为false)上，则此菜单项为获得焦点的MenuItem。
		 *
		 * 处理按键事件，目前支持以下按钮：
		 * <ul>
		 *  <li>
		 *      向上按钮：如果当前获得焦点的MenuItem有上一个菜单项，并且可用，则使上一个菜单项获得焦点。
		 *  </li>
		 *  <li>
		 *      向下按钮: 如果当前获得焦点的MenuItem有下一个菜单项，并且可用，则使下一个菜单项获得焦点。
		 *  </li>
		 *  <li>
		 *      向左按钮: 如果当前获得焦点的MenuItem有上级菜单，则返回上级菜单，并隐藏当前获得焦点的MenuItem。
		 *  </li>
		 *  <li>
		 *      向右按钮: 如果当前获得焦点的MenuItem有下级菜单，则打开下级菜单，否则，什么也不做。
		 *  </li>
		 *  <li>
		 *      回车: 相当于单击当前获得焦点的MenuItem。
		 *  </li>
		 *  <li>
		 *      Esc: 隐藏打开的菜单。
		 *  </li>
		 * </ul>
		 * @param {Object} event dhtml中的event。
		 */
		doOnKeyDown: function(event) {
			var menu = this, opener, focusItem;
			switch (event.keyCode) {
				case 37://left arrow
					if (menu) {
						opener = menu.opener;
						if (opener) {
							opener.hideSubmenu && opener.hideSubmenu();
						}
					}
					break;
				case 38://up arrow
					menu.focusItem(menu.getFocusableItem("prev"));
					break;
				case 39://right arrow
					if (menu._focusItem) {
						menu._focusItem.showSubmenu && menu._focusItem.showSubmenu(true);
					}
					break;
				case 40://down arrow
					menu.focusItem(menu.getFocusableItem("next"));
					break;
				case 13://enter
					focusItem = menu._focusItem;
					if (focusItem) {
						focusItem.onClick && focusItem.onClick();
					}
					return false;
				case 27://esc
					menu.hideTopMenu();
					break;
			}
		},

		/**
		 * 冰冻当前Menu，使得focusItem不能再切换。<br />
		 * 一般情况下，只有菜单的右键菜单才需要使用此方法。
		 * @param {boolean} [deep=true] 是否深度锁定，使得当前Menu的opener都被锁定，默认为true。
		 */
		freeze: function(deep) {
			this._freeze = true;
			if (deep !== false) {
				var opener = this.opener;
				while (opener) {
					var parent = opener._parent;
					if (opener instanceof dorado.widget.menu.AbstractMenuItem && parent instanceof dorado.widget.Menu) {
						parent._freeze = true;
					}

					opener = parent ? parent.opener : null;
				}
			}
		},

		/**
		 * 解冻当前Menu，使得focusItem可以根据用户操作切换。
		 * 一般情况下，只有菜单的右键菜单才需要使用此方法。
		 * @param {boolean} [deep=true] 是否深度解除锁定，使得当前Menu的opener都被解除锁定，默认为true。
		 */
		unfreeze: function(deep) {
			this._freeze = false;
			if (deep !== false) {
				var opener = this.opener;
				while (opener) {
					var parent = opener._parent;
					if (opener instanceof dorado.widget.menu.AbstractMenuItem && parent instanceof dorado.widget.Menu) {
						parent._freeze = false;
					}

					opener = parent ? parent.opener : null;
				}
			}
		},

		createDom: function() {
			var menu = this, doms = {}, dom = $DomUtils.xCreate({
				tagName: "div",
				content: {
					tagName: "ul",
					className: "group-content",
					contextKey: "groupContent"
				}
			}, null, doms), items = menu._items;

			menu._doms = doms;

			var groupContent = doms.groupContent;

			if (items) {
				items.each(function(item) {
					item.render(groupContent);
				});
			}

			$fly(dom).hover(function() {
				menu.notifyOpenerOnMouseEnter();
			}, function() {
				var focusItem = menu._focusItem;

				menu.notifyOpenerOnMouseLeave();

				if (menu._freeze) return;

				if (focusItem) {
					if (focusItem instanceof dorado.widget.menu.MenuItem) {
						if (!focusItem._submenu) {
							menu.clearFocusItem();
						}
					} else if (focusItem instanceof dorado.widget.menu.ControlMenuItem) {
						if (!focusItem._control) {
							menu.clearFocusItem();
						}
					} else {
						//如果是CheckedItem
						menu.clearFocusItem();
					}
				}
			}).click(function(event) {
					if (!menu.processDefaultMouseListener()) return;
					var defaultReturnValue;
					if (menu.onClick) {
						defaultReturnValue = menu.onClick(event);
					}
					var arg = {
						button: event.button,
						event: event,
						returnValue: defaultReturnValue
					}
					var target = event.target, item;
					if (target) {
						var items = menu._items;
						for (var i = 0, j = items.size; i < j; i++) {
							var temp = items.get(i);
							if (temp._dom == target || jQuery.contains(temp._dom, target)) {
								item = temp;
								arg.item = item;
								break;
							}
						}
					}
					menu.fireEvent("onClick", menu, arg);
					event.stopImmediatePropagation();
					return arg.returnValue;
				});

			$fly(groupContent).mousewheel(function(event, delta) {
				if (menu._overflowing) {
					if (delta < 0) {//down
						menu.doScrollDown();
					} else if (delta > 0) {//up
						menu.doScrollUp();
					}
				}
			});

			if (menu._iconPosition == "top") {
				$fly(dom).addClass(menu._className + "-icon-top");
			}

			return dom;
		},

		refreshDom: function(dom) {
			$invokeSuper.call(this, arguments);

			var menu = this, doms = menu._doms, menuContentHeight = $fly(doms.groupContent).outerHeight();
			if (menuContentHeight > dom.offsetHeight) {
				menu.handleOverflow();
			}
			//else {
			//group.clearOverflow();
			//}

			//empty panel
			var items = menu._items || {}, visibleItemCount = 0;
			for (var i = 0, j = items.size; i < j; i++) {
				var item = items.get(i);
				if (item._visible === false) continue;
				visibleItemCount++;
			}

			if (visibleItemCount == 0) {
				if (!menu._noContentEl) {
					menu._noContentEl = document.createElement("div");
					menu._noContentEl.className = "no-content-group";
					menu._noContentEl.innerHTML = "&lt;Empty Panel&gt;";
					dom.appendChild(menu._noContentEl);
				}
				$fly(dom).addClass(menu._className + "-no-content");
			} else {
				if (menu._noContentEl) {
					$fly(dom).removeClass(menu._className + "-no-content");
				}
			}
		},

		getShowPosition: function(options) {
			var menu = this, anchorTarget = options.anchorTarget, dom = menu._dom, fixedElement, result;

			options = options || {};
			options.overflowHandler = function(options) {
				menu.handleOverflow(options.maxHeight);
			};

			if (anchorTarget && anchorTarget instanceof dorado.widget.menu.MenuItem) {
				fixedElement = anchorTarget._dom;

				menu.opener = anchorTarget;
				menu._focusParent = anchorTarget._parent;

				result = $DomUtils.dockAround(dom, fixedElement, options);

				return result;
			} else {
				return $invokeSuper.call(this, arguments);
			}
		},

		doAfterShow: function(options) {
			var menu = this, focusfirst = (options || {}).focusFirst;
			if (focusfirst) {
				var item = menu.getFocusableItem("first");
				if (item) {
					menu.focusItem(item);
				}
			}
			$invokeSuper.call(this, arguments);
		},

		/**
		 * @protected
		 */
		doAfterHide: function() {
			var menu = this, dom = menu._dom;
			if (!dom) {
				return;
			}

			menu.clearFocusItem();

			if (dom) {
				if (menu._overflowing) {
					menu.clearOverflow();
				}
			}
			menu.opener = null;

			$invokeSuper.call(this, arguments);
		},

		notifyOpenerOnMouseEnter: function() {
			var menu = this, focusParent = menu._focusParent;
			if (focusParent instanceof dorado.widget.Menu) {
				focusParent.notifyOpenerOnMouseEnter();
			} else if (focusParent instanceof dorado.widget.AbstractButton) {
				focusParent.doCancelHideMenuOnMouseEnter && focusParent.doCancelHideMenuOnMouseEnter();
			}
		},

		notifyOpenerOnMouseLeave: function() {
			var menu = this, focusParent = menu._focusParent;
			if (focusParent instanceof dorado.widget.Menu) {
				focusParent.notifyOpenerOnMouseLeave();
			} else if (focusParent instanceof dorado.widget.AbstractButton) {
				focusParent.doHideMenuOnMouseLeave && focusParent.doHideMenuOnMouseLeave();
			}
		}
	});
})();

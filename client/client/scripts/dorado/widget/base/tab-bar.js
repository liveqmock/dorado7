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
	var LEFT_BUTTON_CLASS = "left-button", RIGHT_BUTTON_CLASS = "right-button", MENU_BUTTON_CLASS = "menu-button",
		TOP_BUTTON_CLASS = "top-button", BOTTOM_BUTTON_CLASS = "bottom-button";

	/**
	 * @author Frank Zhang (mailto:frank.zhang@bstek.com)
	 * @component Base
	 * @class 标签组，是TabBar与TabColumn的超类。
	 * @extends dorado.widget.Control
	 */
	dorado.widget.TabGroup = $extend(dorado.widget.Control, /** @scope dorado.widget.TabGroup.prototype */{
		$className: "dorado.widget.TabGroup",
		focusable: true,

		tabShortTypeName: "tab",

		ATTRIBUTES: /** @scope dorado.widget.TabGroup.prototype */ {
			/**
			 * TabGroup的当前Tab
			 * @type dorado.widget.tab.Tab
			 * @attribute
			 */
			currentTab: {
				setter: function(value) {
					var tabgroup = this, tabs = tabgroup._tabs, rendered = tabgroup._rendered, realTab;
					if (typeof value == "number" || typeof value == "string") {
						realTab = tabs.get(value);
					}
					else {
						realTab = value;
					}
					if (rendered) {
						if (realTab && !realTab._disabled) {
							tabgroup.doChangeCurrentTab(realTab);
						}
					}
					else {
						if (realTab == null) {
							tabgroup._currentTab = value;
						}
						else {
							tabgroup._currentTab = realTab;
						}
					}
				}
			},

			/**
			 * 当前Tab的序号（自0开始计算）。
			 * @type int
			 * @attribute
			 */
			currentIndex: {
				skipRefresh: true,
				getter: function() {
					var tabgroup = this, tabs = tabgroup._tabs, currentTab = tabgroup._currentTab;
					if (currentTab) {
						if (typeof currentTab == "number") {
							return currentTab;
						}
						else {
							return tabs.indexOf(currentTab);
						}
					}
					return -1;
				},
				setter: function(index) {
					this.set("currentTab", index);
				}
			},

			/**
			 * 可以使用Tab对象或者Tab的配置信息来设置，当设置该属性的时候，原来的tabs会被清空。
			 * 在设置的时候，数据类型为Array，在取得的时候，数据类型为dorado.util.KeyedArray。
			 *
			 * @type dorado.util.KeyedArray|Array
			 * @attribute
			 */
			tabs: {
				setter: function(value) {
					var tabgroup = this, tabs = tabgroup._tabs;
					if (tabs) {
						tabgroup.clearTabs();
					}
					if (value && value instanceof Array) {
						for(var i = 0, j = value.length; i < j; i++) {
							var tab = value[i];
							tabgroup.addTab(tab, null, false);
						}
					}

					var currentTab = tabgroup._currentTab;

					if (typeof currentTab == "number" || typeof currentTab == "string") {
						var result = tabgroup._tabs.get(currentTab);
						if (result) {
							tabgroup._currentTab = result;
						}
					}
				}
			},

			/**
			 * 是否一直显示超出后的导航按钮，默认值为false，也就是说只有在需要的时候才显示。
			 * @type boolean
			 * @default false
			 * @attribute
			 */
			alwaysShowNavButtons: {
				skipRefresh: true,
				setter: function(value) {
					var tabgroup = this;
					tabgroup._alwaysShowNavButtons = value;
					if (value) {
						tabgroup.showNavButtons();
						tabgroup.refreshNavButtons();
					}
					else {
						tabgroup.hideNavButtons();
					}
				}
			},

			tabPlacement: {
				skipRefresh: true,
				setter: function(value) {
					if (this._rendered) {
						this.doChangeTabPlacement(value);
					}
					else {
						this._tabPlacement = value;
					}
				}
			},

			/**
			 * 激活右键菜单的Tab，可能会被激活的右键菜单使用。
			 * @type dorado.widget.tab.Tab
			 * @attribute readOnly
			 */
			contextMenuTab: {
				readOnly: true
			}
		},

		EVENTS: /** @scope dorado.widget.TabGroup.prototype */ {
			/**
			 * 在Tab进行切换之前触发的事件，在这个事件里面currentTab属性还是切换之前的Tab。
			 * 注意：此事件只有当TabGroup渲染以后才会触发。
			 * @param {Object} self 事件的发起者，即组件本身。
			 * @param {Object} arg 事件参数。
			 * @param {dorado.widget.tab.Tab} arg.newTab 要切换到的Tab。
			 * @param {dorado.widget.tab.Tab} arg.oldTab 当前Tab。
			 * @return {boolean} 是否要继续后续事件的触发操作，不提供返回值时系统将按照返回值为true进行处理。
			 * @event
			 */
			beforeTabChange: {},

			/**
			 * 在Tab成功切换之后触发的事件，在这个事件里面currentTab属性已经为要切换到的Tab。
			 * 注意：此事件只有当TabGroup渲染以后才会触发。
			 * @param {Object} self 事件的发起者，即组件本身。
			 * @param {Object} arg 事件参数。
			 * @param {dorado.widget.tab.Tab} arg.newTab 要切换到的Tab。
			 * @param {dorado.widget.tab.Tab} arg.oldTab 切换之前的Tab。
			 * @return {boolean} 是否要继续后续事件的触发操作，不提供返回值时系统将按照返回值为true进行处理。
			 * @event
			 */
			onTabChange: {},

			/**
			 * 在Tab被移除后触发的事件，用户点击关闭按钮或者调用removeTab方法都会触发此事件。
			 * 注意：此事件只有当TabGroup渲染以后才会触发。
			 * @param {Object} self 事件的发起者，即组件本身。
			 * @param {Object} arg 事件参数。
			 * @param {dorado.widget.tab.Tab} arg.tab 被移除的Tab。
			 * @return {boolean} 是否要继续后续事件的触发操作，不提供返回值时系统将按照返回值为true进行处理。
			 * @event
			 */
			onTabRemove: {},

			/**
			 * 在Tab上点击右键触发的事件。
			 * @param {Object} self 事件的发起者，即组件本身。
			 * @param {Object} arg 事件参数。
			 * @param {dorado.widget.tab.Tab} arg.tab 触发该事件的tab。
			 * @param {Event} arg.event DHTML中的事件event参数。
			 * @param {boolean} #arg.processDefault=false 是否要继续系统的默认操作，让系统上下文菜单显示出来。
			 * @return {boolean} 是否要继续后续事件的触发操作，不提供返回值时系统将按照返回值为true进行处理。
			 * @event
			 */
			onTabContextMenu: {}
		},

		constructor: function() {
			this._tabs = new dorado.util.KeyedArray(function(value) {
				return value._name;
			});

			$invokeSuper.call(this, arguments);
		},

		destroy: function() {
			var tabgroup = this, tabs = tabgroup._tabs;
			for(var i = tabs.size - 1; i >= 0; i--) {
				tabs.get(i).destroy();
			}
			tabs.clear();
			$invokeSuper.call(tabgroup);
		},

		doGet: function(attr) {
			var c = attr.charAt(0);
			if (c == '#' || c == '&') {
				var name = attr.substring(1);
				return this.getTab(name);
			}
			else {
				return $invokeSuper.call(this, [attr]);
			}
		},

		/**
		 * 禁用Tab。
		 * 不建议直接使用该方法，如果要禁用某个tab，使用TabGroup的getTab方法拿到该tab后，调用tab.set("disabled", true)即可。
		 * @param {int|String|dorado.widget.tab.Tab} tab 要禁用的Tab(可以为索引、name、Tab)。
		 * @protected
		 */
		disableTab: function(tab) {
			var tabgroup = this, tabDom, navmenu = tabgroup._navmenu, tabs = tabgroup._tabs, index;
			tab = tabgroup.getTab(tab);
			index = tabs.indexOf(tab);
			tabDom = tab._dom;
			tab._disabled = true;
			if (tabDom) {
				$fly(tabDom).addClass("tab-disabled");
				if (tab == tabgroup._currentTab) {
					var newCurrentTab = tabgroup.getAvialableTab(tab);
					tabgroup.doChangeCurrentTab(newCurrentTab);
				}
			}
			if (navmenu) {
				navmenu.getItem(index).set("disabled", true);
			}
		},

		/**
		 * 启用Tab。
		 * 不建议直接使用该方法，如果要启用某个tab，使用TabGroup的getTab拿到该tab后，调用tab.set("disabled", false)即可。
		 * @param {int|String|dorado.widget.tab.Tab} tab 要启用的tab(可以为索引、name、Tab)。
		 * @protected
		 */
		enableTab: function(tab) {
			var tabgroup = this, tabDom, navmenu = tabgroup._navmenu, tabs = tabgroup._tabs, index;
			tab = tabgroup.getTab(tab);
			index = tabs.indexOf(tab);
			tabDom = tab._dom;
			tab._disabled = false;
			if (tabDom) {
				$fly(tabDom).removeClass("tab-disabled");
			}
			if (navmenu) {
				navmenu.getItem(index).set("disabled", false);
			}
		},

		/**
		 * 设置某个tab的显示或者隐藏
		 * @param {int|String|dorado.widget.tab.Tab} tab 要设置的tab(可以为索引、name、Tab)。
		 * @param {boolean} visible 要设置的visible
		 * @protected
		 */
		doSetTabVisible: function(tab, visible) {
			var tabgroup = this, tabDom, navmenu = tabgroup._navmenu, tabs = tabgroup._tabs, index;
			tab = tabgroup.getTab(tab);
			index = tabs.indexOf(tab);
			tabDom = tab._dom;

			if (tab._visible == visible) {
				return;
			}

			if (tabDom) {
				if (visible) {
					tabDom.style.display = "";
				}
				else {
					tabDom.style.display = "none";
					if (tab == tabgroup._currentTab) {
						var newCurrentTab = tabgroup.getAvialableTab(tab);
						tabgroup.doChangeCurrentTab(newCurrentTab);
					}
				}
				tabgroup.refreshNavButtons();
			}

			if (navmenu) {
				navmenu.getItem(index).set("visible", visible);
			}
		},

		/**
		 * 取得TabGroup中的Tab。
		 * @param {int|String|dorado.widget.tab.Tab} tab 可以是Tab的索引，可以是为Tab定义的Name，否则直接返回传入的参数。
		 */
		getTab: function(tab) {
			var tabgroup = this, tabs = tabgroup._tabs;
			if (typeof tab == "number" || typeof tab == "string") {
				return tabs.get(tab);
			}
			else {
				return tab;
			}
		},

		/**
		 * 插入标签页
		 * @param {Object|dorado.widget.tab.Tab} tab 要插入的tab或者tab的配置信息。
		 * @param {int} [index] 插入的tab的索引，不指定则添加到最后。
		 * @param {boolean} [current] 插入的tab是否设置为当前tab。
		 * @return {dorado.widget.tab.Tab} 添加成功的tab，如果添加不成功，返回null。
		 */
		addTab: function(tab, index, current) {
			if (!tab) {
				throw new dorado.ResourceException("dorado.base.TabUndefined");
			}
			var tabgroup = this, tabs = tabgroup._tabs;
			if (tabs) {
				if (!(tab instanceof dorado.widget.tab.Tab)) {
					tab = dorado.Toolkits.createInstance(tabgroup.tabShortTypeName, tab);
				}
				tabgroup.doAddTab(tab, index, current);

				return tab;
			}
			return null;
		},

		doAddTab: function(tab, index, current) {
			var tabgroup = this, tabs = tabgroup._tabs, doms = tabgroup._doms, navmenu = tabgroup._navmenu;
			if (index != null) {
				tabs.insert(tab, index);
			}
			else {
				index = tabs.size;
				tabs.insert(tab);
			}
			if (navmenu) {
				tabgroup.insertNavMenuItem(tab, index);
			}
			tabgroup.registerInnerViewElement(tab);

			if (tabgroup._rendered) {
				tab.render(doms.tabs, index);
				tab.refresh();
			}
			if (current) {
				tabgroup.doChangeCurrentTab(tab);
			}
		},

		/**
		 * 移除指定的tab。
		 * @param {int|String|dorado.widget.tab.Tab} tab 要移除的tab，可以为index、tab的name或者tab本身。
		 */
		removeTab: function(tab) {
			var tabgroup = this, tabs = tabgroup._tabs, navmenu = tabgroup._navmenu, index;
			if (tabs) {
				tab = tabgroup.getTab(tab);
				if (navmenu) {
					index = tabs.indexOf(tab);
					navmenu.removeItem(index);
				}
				tabgroup.unregisterInnerViewElement(tab);

				tabgroup.doRemoveTab(tab);
				tabgroup.fireEvent("onTabRemove", self, { tab: tab });
			}
		},

		/**
		 * 移除指定的tab。
		 * @param {int|String|dorado.widget.tab.Tab} tab 要移除的tab，可以为index、tab的name或者tab本身。
		 * @protected
		 */
		doRemoveTab: function(tab) {
			var tabgroup = this, tabs = tabgroup._tabs;
			if (tab != tabgroup._currentTab) {
				tabs.remove(tab);
				tab.destroy();
			}
			else {
				var avialableTab = tabgroup.getAvialableTab(tab);
				tabs.removeAt(tabs.indexOf(tab));
				tab.destroy();

				tabgroup.doChangeCurrentTab(avialableTab);
			}
			tab.destroy();

			tabgroup.refreshNavButtons();
		},

		/**
		 * @private
		 */
		getAvialableTab: function(tab) {
			var tabgroup = this, tabs = tabgroup._tabs, index, result, i, j;
			if (tabs) {
				if (!tab) {
					index = -1;
				}
				else {
					index = tabs.indexOf(tab);
				}
				for(i = index - 1; i >= 0; i--) {
					result = tabs.get(i);
					if (!result._disabled && result._visible) {
						return result;
					}
				}
				for(i = index + 1, j = tabs.size; i < j; i++) {
					result = tabs.get(i);
					if (!result._disabled && result._visible) {
						return result;
					}
				}
			}
			return null;
		},

		/**
		 * 移除所有的Tab。
		 */
		clearTabs: function() {
			var tabgroup = this, tabs = tabgroup._tabs;
			if (tabs.size) tabgroup._currentTab = null;
			for(var i = 0, j = tabs.size; i < j; i++) {
				tabgroup.removeTab(tabs.get(0));
			}
		},

		/**
		 * 关闭指定的Tab，也可以直接拿到要关闭的tab，调用close方法。
		 * @param {dorado.widget.tab.Tab} tab 要关闭的tab。
		 */
		closeTab: function(tab) {
			if (tab) {
				tab.close();
			}
		},

		/**
		 * 关闭除了某个标签以外的其他标签。
		 * @param {dorado.widget.tab.Tab} tab 除了该标签外，其他都要关闭。
		 * @param {boolean} [force=false] 是否忽视Tab的closeable和disable属性强制关闭。
		 */
		closeOtherTabs: function(tab, force) {
			if (!tab) return;
			var tabgroup = this, tabs = tabgroup.get("tabs").toArray();
			jQuery.each(tabs, function(index, target) {
				if (target != tab && (force || (!target._disabled && target._closeable))) {
					target.close();
				}
			});
		},

		/**
		 * 关闭所有的标签页。
		 * @param {boolean} [force=false] 是否忽视Tab的closeable和disable属性强制关闭。
		 */
		closeAllTabs: function(force) {
			var tabgroup = this, tabs = tabgroup.get("tabs").toArray();
			jQuery.each(tabs, function(index, tab) {
				if (force || (!tab._disabled && tab._closeable)) {
					tab.close();
				}
			});
		},

		doFilterTabs: function(tabs) {
			var result = new dorado.util.KeyedArray(function(value) {
				return value._name;
			});

			for(var i = 0, j = tabs.size; i < j; i++) {
				var tab = tabs.get(i);
				if (tab._visible) {
					result.append(tab);
				}
			}

			return result;
		},

		/**
		 * @private
		 */
		doChangeCurrentTab: function(tab, force) {
			var tabgroup = this, doms = tabgroup._doms || {}, currentTab = tabgroup._currentTab;

			if (force !== true && tab == currentTab) {
				return false;
			}

			var eventArg = {
				newTab: tab,
				oldTab: currentTab
			};
			tabgroup.fireEvent("beforeTabChange", tabgroup, eventArg);
			if (eventArg.processDefault === false) return;

			if (currentTab && currentTab._dom) {
				$fly(currentTab._dom).removeClass("tab-selected");
			}

			if (tab && tab._dom) {
				tabgroup.scrollTabIntoView(tab);
			}

			tabgroup._currentTab = tab;
			tabgroup.doOnTabChange(eventArg);

			return true;
		},

		doOnTabChange: function(eventArg) {
			var tabgroup = this;
			tabgroup.fireEvent("onTabChange", tabgroup, eventArg);
		},

		/**
		 * @private
		 */
		doChangeTabPlacement: function(value) {
			var tabgroup = this, cls = tabgroup._className, doms = tabgroup._doms, tabbarDom = doms.tabbar;
			if (tabbarDom) {
				var oldValue = tabgroup._tabPlacement;
				$fly(tabbarDom).addClass("d-tabbar-" + value + " " + cls + "-" + value);
				if (oldValue) {
					$fly(tabbarDom).removeClass("d-tabbar-" + oldValue + " " + cls + "-" + oldValue);
				}
			}
			tabgroup._tabPlacement = value;

			return true;
		}
	});

	/**
	 * @author Frank Zhang (mailto:frank.zhang@bstek.com)
	 * @component Base
	 * @class 标签栏，纵向的Tab集合。
	 * @extends dorado.widget.TabGroup
	 */
	dorado.widget.TabColumn = $extend(dorado.widget.TabGroup, /** @scope dorado.widget.TabColumn.prototype */{
		$className: "dorado.widget.TabColumn",
		focusable: true,

		ATTRIBUTES: /** @scope dorado.widget.TabColumn.prototype */{
			className: {
				defaultValue: "d-tabcolumn"
			},

			/**
			 * Tab的显示位置，可选值为left、right，默认值为left
			 * @type String
			 * @default left
			 * @attribute
			 */
			tabPlacement: {
				skipRefresh: true,
				defaultValue: "left"
			},

			verticalText: {}
		},

		createDom: function() {
			var tabcolumn = this, tabs = tabcolumn._tabs, doms = {}, dom = $DomUtils.xCreate({
				tagName: "div",
				className: tabcolumn._className,
				contextKey: "tabbar",
				content: [
					{
						tagName: "div",
						className: "tabs-wrap column-tabs-wrap",
						contextKey: "tabsWrap",
						content: {
							tagName: "ul",
							className: "tabs column-tabs",
							contextKey: "tabs"
						}
					}
				]
			}, null, doms), jDom = jQuery(dom);

			tabcolumn._doms = doms;

			if (tabcolumn._verticalText) {
				jDom.addClass(tabcolumn._className + "-vtext");
				if (dorado.Browser.msie && dorado.Browser.version == 6) {
					jDom.addClass(tabcolumn._className + "-vtext-" + tabcolumn._tabPlacement);
				}
			}

			jDom.addClass(tabcolumn._tabPlacement == "left" ? tabcolumn._className + "-left" : tabcolumn._className + "-right");

			if (tabcolumn._alwaysShowNavButtons) {
				tabcolumn.createNavButtons(dom);
			}

			var tabsEl = doms.tabs, currentTab = tabcolumn._currentTab;
			if (tabs) {
				for(var i = 0, j = tabs.size; i < j; i++) {
					var tab = tabs.get(i);
					if (tab._current) {
						currentTab = tab;
					}
					tab.render(tabsEl);
				}
				if (!currentTab) {
					currentTab = tabcolumn.getAvialableTab();
				}
				if (currentTab) {
					tabcolumn.doChangeCurrentTab(currentTab, true);
				}
			}

			$fly(doms.tabsWrap).mousewheel(function(event, delta) {
				if (tabcolumn._overflowing) {
					if (delta < 0) {//right
						tabcolumn.doScrollBottom(false);
					}
					else {
						if (delta > 0) {//left
							tabcolumn.doScrollTop(false);
						}
					}
				}
			});

			return dom;
		},

		refreshTabColumn: function() {
			var tabbar = this, tabs = tabbar._tabs;

			if (tabs) {
				for(var i = 0, j = tabs.size; i < j; i++) {
					var tab = tabs.get(i);
					tab.refreshDom(tab._dom);
				}
			}

			tabbar.onToolButtonVisibleChange();
			tabbar.refreshNavButtons();
		},

		/**
		 * @private
		 */
		doChangeTabPlacement: function(value) {
			var tabgroup = this, cls = tabgroup._className, doms = tabgroup._doms, tabbarDom = doms.tabbar;
			if (tabbarDom) {
				var oldValue = tabgroup._tabPlacement;
				$fly(tabbarDom).addClass(this._className + "-" + value + " " + cls + "-" + value);
				if (oldValue) {
					$fly(tabbarDom).removeClass(this._className + "-" + oldValue + " " + cls + "-" + oldValue);
				}
			}
			tabgroup._tabPlacement = value;

			return true;
		},

		refreshDom: function(dom) {
			$invokeSuper.call(this, arguments);
			this.refreshTabColumn();
		},

		scrollTabIntoView: function(tab) {
			var tabbar = this, doms = tabbar._doms, tabDom = tab._dom, tabsEl = doms.tabs, offsetTop = tabDom.offsetTop,
				offsetHeight = tabDom.offsetHeight, top = (parseInt(tabsEl.style.top, 10) || 0) * -1, viewHeight = $fly(doms.tabsWrap).height();

			$fly(tabDom).addClass("tab-selected");

			if (top > offsetTop) {
				$fly(tabsEl).animate({
					top: -1 * offsetTop
				}, 300, null, function() {
					tabbar.refreshNavButtons();
				});
			}
			else {
				if ((top + viewHeight) < (offsetTop + offsetHeight)) {
					$fly(tabsEl).animate({
						top: -1 * (offsetTop + offsetHeight - viewHeight)
					}, 300, null, function() {
						tabbar.refreshNavButtons();
					});
				}
				else {
					tabbar.refreshNavButtons();
				}
			}
		},

		/**
		 * 刷新上下方向按钮的状态。
		 * @private
		 */
		refreshNavButtons: function() {
			var tabcolumn = this, dom = tabcolumn._dom, tabs = tabcolumn._tabs, doms = tabcolumn._doms;
			if (!dom || !tabs) return;
			var topButton = tabcolumn._topButton, bottomButton = tabcolumn._bottomButton;
			var tabsHeight = tabcolumn.getTabsHeight(), tabsEl = doms.tabs, currentTop = parseInt(tabsEl.style.top || 0, 10);
			var visibleHeight = $fly(doms.tabsWrap).height();

			if (tabsHeight > 0) {
				if (tabcolumn._alwaysShowNavButtons !== true && visibleHeight > tabsHeight) {//没有必要显示NavButtons
					tabcolumn._overflowing = false;
					//如果buttonright已经创建
					if (bottomButton) {
						bottomButton.set("disabled", true);
						if (tabsHeight + currentTop <= visibleHeight) {
							$fly(tabsEl).top(0);
							//hide buttons
							if (!tabcolumn._alwaysShowNavButtons) {
								tabcolumn.hideNavButtons();
							}
						}
					}
				}
				else { // 需要显示NavButtons
					tabcolumn._overflowing = true;

					if (!tabcolumn._alwaysShowNavButtons) { //show buttons
						tabcolumn.showNavButtons();
						visibleHeight = $fly(doms.tabsWrap).innerHeight();
						currentTop = parseInt(tabsEl.style.top, 10);
					}

					if (!bottomButton) {
						bottomButton = tabcolumn._bottomButton;
						topButton = tabcolumn._topButton;
					}

					//由于时序问题把这段逻辑放到最开始
					if (tabsHeight + currentTop > visibleHeight) {//if already scroll to max right
						bottomButton.set("disabled", false);
					}
					else if (tabsHeight + currentTop < visibleHeight) {//if rightbutton is still can push
						$fly(tabsEl).top(visibleHeight - tabsHeight);
						bottomButton.set("disabled", true);
					}
					else if (tabsHeight + currentTop == visibleHeight) {
						bottomButton.set("disabled", true);
					}

					if (parseInt(tabsEl.style.top, 10) < 0) {
						topButton.set("disabled", false);
					}
					else {
						topButton.set("disabled", true);
					}

					if (topButton._disabled && bottomButton._disabled) {//fix alwaysShowNavButtons bug
						$fly(tabsEl).top(0);
					}
				}
			}
		},

		/**
		 * 显示上下导航按钮。
		 * @private
		 */
		showNavButtons: function() {
			var tabcolumn = this, dom = tabcolumn._dom, modifyTop = true, doms = tabcolumn._doms;
			if (dom) {
				if (!doms.topButton) {
					tabcolumn.createNavButtons(dom);
				}
				else if ($fly(doms.topButton).css("display") == "none") {
					$fly([doms.topButton, doms.bottomButton]).css("display", "block");
				}
				else { // 已经显示了的情况下不会去修复left的差值
					modifyTop = false;
				}

				if (modifyTop) {
					var tabsEl = doms.tabs, top = parseInt(tabsEl.style.top, 10) || 0;
					$fly(tabsEl).top(top);
				}

				tabcolumn.onToolButtonVisibleChange();
			}
		},

		/**
		 * 隐藏左右隐藏按钮。
		 * @param {boolean} force 是否强制隐藏NavButtons。
		 * @private
		 */
		hideNavButtons: function(force) {
			var tabcolumn = this, dom = tabcolumn._dom, doms = tabcolumn._doms;
			if (!dom) return;
			var topButton = doms.topButton, bottomButton = doms.bottomButton;
			if (topButton && bottomButton) {
				var tabsHeight = tabcolumn.getTabsHeight(), visibleHeight = $fly(doms.tabsWrap).innerHeight();
				if ((tabsHeight < visibleHeight) || force) {
					$fly(topButton).css("display", "none");
					$fly(bottomButton).css("display", "none");

					tabcolumn.onToolButtonVisibleChange();
				}
			}
		},

		getTabsHeight: function() {
			var tabcolumn = this, tabs = tabcolumn._tabs, lastTab, lastDom;
			if (tabs) {
				lastTab = tabs.get(tabs.size - 1);
				if (lastTab) {
					lastDom = lastTab._dom;
					if (lastDom) {
						return lastDom.offsetTop + $fly(lastDom).outerHeight();
					}
				}
			}
			return 0;
		},

		/**
		 * 为TabColumn创建上下按钮。
		 * @param {HtmlElement} dom TabColumn的dom。
		 * @private
		 */
		createNavButtons: function(dom) {
			var tabcolumn = this;
			if (!dom) {
				return;
			}

			var doms = tabcolumn._doms, tabbarDom = doms.tabbar, topBtn, bottomBtn;

			topBtn = tabcolumn._topButton = new dorado.widget.SimpleButton({
				className: TOP_BUTTON_CLASS,
				listener: {
					onClick: function() {
						tabcolumn.doScrollTop(true);
					}
				}
			});

			bottomBtn = tabcolumn._bottomButton = new dorado.widget.SimpleButton({
				className: BOTTOM_BUTTON_CLASS,
				listener: {
					onClick: function() {
						tabcolumn.doScrollBottom(true);
					}
				}
			});

			tabcolumn.registerInnerControl(topBtn);
			tabcolumn.registerInnerControl(bottomBtn);

			topBtn.render(tabbarDom);
			tabbarDom.insertBefore(topBtn._dom, tabbarDom.firstChild);

			bottomBtn.render(tabbarDom);
			tabbarDom.appendChild(bottomBtn._dom);

			doms.topButton = topBtn._dom;
			doms.bottomButton = bottomBtn._dom;

			$fly(doms.topButton).repeatOnClick(function() {
				tabcolumn.doScrollTop(false, 12);
			}, 30);

			$fly(doms.bottomButton).repeatOnClick(function() {
				tabcolumn.doScrollBottom(false, 12);
			}, 30);
		},

		doScrollTop: function(anim, length) {
			var tabcolumn = this, doms = tabcolumn._doms, tabsEl = doms.tabs, to = parseInt(tabsEl.style.top, 10) + (length > 0 ? length : 100);
			if (anim) {
				$fly(tabsEl).animate({
					top: to > 0 ? 0 : to
				}, 300, null, function() {
					tabcolumn.refreshNavButtons();
				});
			}
			else {
				$fly(tabsEl).top(to > 0 ? 0 : to);
				tabcolumn.refreshNavButtons();
			}
		},

		doScrollBottom: function(anim, length) {
			var tabcolumn = this, doms = tabcolumn._doms, tabs = tabcolumn._tabs, tabsEl = doms.tabs, currentTop = parseInt(tabsEl.style.top || 0, 10);
			length = length > 0 ? length : 100;
			if (tabs) {
				var tabsHeight = tabcolumn.getTabsHeight(), visibleHeight = $fly(doms.tabsWrap).innerHeight(), to = currentTop - length,
					bottomHeight = tabsHeight + currentTop - visibleHeight;
				if (bottomHeight <= 0) {
					return false;
				}
				else {
					if (bottomHeight < length) {
						to = currentTop - bottomHeight;
					}
				}
			}
			if (anim) {
				$fly(tabsEl).animate({
					top: to
				}, 300, null, function() {
					tabcolumn.refreshNavButtons();
				});
			}
			else {
				$fly(tabsEl).top(to);
				tabcolumn.refreshNavButtons();
			}
		},

		onToolButtonVisibleChange: function() {
			var tabcolumn = this, dom = tabcolumn._dom, doms = tabcolumn._doms;
			if (!dom) return;

			var topButton = doms.topButton, bottomButton = doms.bottomButton;
			var topHeight = 0, bottomHeight = 0, menuButtonWidth = 0;
			if (topButton && topButton.style.display != "none") {
				topHeight += $fly(topButton).outerHeight(true);
			}
			if (bottomButton && bottomButton.style.display != "none") {
				bottomHeight += $fly(bottomButton).outerHeight(true);
			}
			$fly(doms.tabsWrap).css({
				height: tabcolumn.getRealHeight() - topHeight - bottomHeight
			});
		}
	});

	/**
	 * @author Frank Zhang (mailto:frank.zhang@bstek.com)
	 * @component Base
	 * @class 标签条，横向的Tab集合。
	 * @extends dorado.widget.TabGroup
	 */
	dorado.widget.TabBar = $extend(dorado.widget.TabGroup, /** @scope dorado.widget.TabBar.prototype */ {
		$className: "dorado.widget.TabBar",
		focusable: true,

		ATTRIBUTES: /** @scope dorado.widget.TabBar.prototype */ {
			className: {
				defaultValue: "d-tabbar"
			},

			/**
			 * 是否显示Tab的菜单按钮，默认值为false，即不显示。
			 * @type boolean
			 * @default false
			 * @attribute
			 */
			showMenuButton: {
				skipRefresh: true,
				setter: function(value) {
					var tabbar = this, dom = tabbar._dom, doms = tabbar._doms;
					if (dom) {
						if (value) {
							if (!doms.menuButton) {
								tabbar.createMenuButton(dom);
							}
							else {
								$fly(doms.menuButton).css("display", "");
							}
						}
						else if (doms.menuButton) {
							$fly(doms.menuButton).css("display", "none");
						}
						tabbar.refreshNavButtons();
						tabbar.onToolButtonVisibleChange();
					}
					tabbar._showMenuButton = value;
				}
			},

			/**
			 * TabBar中每个Tab的最小宽度，该属性只允许设置一次。
			 * @type int
			 * @attribute
			 */
			tabMinWidth: {
				writeOnce: true
			},

			/**
			 * Tab的显示位置，可选值为top、bottom，默认值为top
			 * @type String
			 * @default top
			 * @attribute
			 */
			tabPlacement: {
				defaultValue: "top"
			},

			height: {
				independent: true,
				readOnly: true
			}
		},

		/**
		 * 刷新左右方向按钮的状态。
		 * @private
		 */
		refreshNavButtons: function() {
			var tabbar = this, dom = tabbar._dom, tabs = tabbar._tabs, doms = tabbar._doms;
			if (!dom || !tabs) return;
			var leftButton = tabbar._leftButton, rightButton = tabbar._rightButton;
			var tabsWidth = tabbar.getTabsWidth(), tabsEl = doms.tabs, currentLeft = parseInt(tabsEl.style.left || 0, 10);
			var visibleWidth = $fly(doms.tabsWrap).width();

			if (tabsWidth > 0) {
				if (tabbar._alwaysShowNavButtons !== true && visibleWidth > tabsWidth) {//没有必要显示NavButtons
					tabbar._overflowing = false;
					//如果buttonright已经创建
					if (rightButton) {
						rightButton.set("disabled", true);
						if (tabsWidth + currentLeft <= visibleWidth) {
							$fly(tabsEl).left(0);
							//hide buttons
							if (!tabbar._alwaysShowNavButtons) {
								tabbar.hideNavButtons();
							}
						}
					}
				}
				else { // 需要显示NavButtons
					tabbar._overflowing = true;

					if (!tabbar._alwaysShowNavButtons) { //show buttons
						tabbar.showNavButtons();
						visibleWidth = $fly(doms.tabsWrap).innerWidth();
						currentLeft = parseInt(tabsEl.style.left, 10);
					}

					if (!rightButton) {
						rightButton = tabbar._rightButton;
						leftButton = tabbar._leftButton;
					}

					//由于时序问题把这段逻辑放到最开始
					if (tabsWidth + currentLeft > visibleWidth) {//if already scroll to max right
						rightButton.set("disabled", false);
					}
					else if (tabsWidth + currentLeft < visibleWidth) {//if rightbutton is still can push
						$fly(tabsEl).left(visibleWidth - tabsWidth);
						rightButton.set("disabled", true);
					}
					else if (tabsWidth + currentLeft == visibleWidth) {
						rightButton.set("disabled", true);
					}

					if (parseInt(tabsEl.style.left, 10) < 0) {
						leftButton.set("disabled", false);
					}
					else {
						leftButton.set("disabled", true);
					}

					if (leftButton._disabled && rightButton._disabled) {//fix alwaysShowNavButtons bug
						$fly(tabsEl).left(0);
					}
				}
			}
		},

		/**
		 * 显示左右导航按钮。
		 * @private
		 */
		showNavButtons: function() {
			var tabbar = this, dom = tabbar._dom, modifyLeft = true, doms = tabbar._doms;
			if (dom) {
				if (!doms.leftButton) {
					tabbar.createNavButtons(dom);
				}
				else if ($fly(doms.leftButton).css("display") == "none") {
					$fly([doms.leftButton, doms.rightButton]).css("display", "block");
				}
				else { // 已经显示了的情况下不会去修复left的差值
					modifyLeft = false;
				}

				if (modifyLeft) {
					var tabsEl = doms.tabs, left = parseInt(tabsEl.style.left, 10) || 0, leftButtonWidth = $fly(doms.leftButton).outerWidth(true), rightButtonWidth = $fly(doms.rightButton).outerWidth(true);
					$fly(tabsEl).left(left - leftButtonWidth - rightButtonWidth);
				}

				tabbar.onToolButtonVisibleChange();
			}
		},

		/**
		 * 隐藏左右隐藏按钮。
		 * @param {boolean} force 是否强制隐藏NavButtons。
		 * @private
		 */
		hideNavButtons: function(force) {
			var tabbar = this, dom = tabbar._dom, doms = tabbar._doms;
			if (!dom) return;
			var leftButton = doms.leftButton, rightButton = doms.rightButton;
			if (leftButton && rightButton) {
				var tabsWidth = tabbar.getTabsWidth(), visibleWidth = $fly(doms.tabsWrap).innerWidth();
				if ((tabsWidth < visibleWidth) || force) {
					$fly(leftButton).css("display", "none");
					$fly(rightButton).css("display", "none");

					tabbar.onToolButtonVisibleChange();
				}
			}
		},

		createDom: function() {
			var tabbar = this, tabs = tabbar._tabs, doms = {}, dom = $DomUtils.xCreate({
				tagName: "div",
				className: tabbar._className,
				contextKey: "tabbar",
				content: [
					{
						tagName: "div",
						className: "tabs-wrap bar-tabs-wrap",
						contextKey: "tabsWrap",
						content: {
							tagName: "ul",
							className: "tabs bar-tabs",
							contextKey: "tabs"
						}
					}
				]
			}, null, doms), jDom = jQuery(dom);

			tabbar._doms = doms;

			jDom.addClass(tabbar._tabPlacement == "top" ? tabbar._className + "-top" : tabbar._className + "-bottom");

			if (tabbar._alwaysShowNavButtons) {
				tabbar.createNavButtons(dom);
			}

			if (tabbar._showMenuButton) {
				tabbar.createMenuButton(dom);
			}

			var tabsEl = doms.tabs, currentTab = tabbar._currentTab;
			if (tabs) {
				for(var i = 0, j = tabs.size; i < j; i++) {
					var tab = tabs.get(i);
					if (tab._current) {
						currentTab = tab;
					}
					tab.render(tabsEl);
				}
				if (!currentTab) {
					currentTab = tabbar.getAvialableTab();
				}
				if (currentTab) {
					tabbar.doChangeCurrentTab(currentTab, true);
				}
			}

			$fly(doms.tabsWrap).mousewheel(function(event, delta) {
				if (tabbar._overflowing) {
					if (delta < 0) {//right
						tabbar.doScrollRight(false);
					}
					else {
						if (delta > 0) {//left
							tabbar.doScrollLeft(false);
						}
					}
				}
			});

			var rightToolButtons = tabbar._rightToolButtons;
			if (rightToolButtons) {
				for(var i = 0, j = rightToolButtons.length; i < j; i++) {
					var toolButton = rightToolButtons[i];
					tabbar.registerInnerControl(toolButton);
					toolButton.render(dom);
				}
			}

			return dom;
		},

		refreshTabBar: function() {
			var tabbar = this, tabs = tabbar._tabs;

			if (tabs) {
				for(var i = 0, j = tabs.size; i < j; i++) {
					var tab = tabs.get(i);
					tab.refresh();
				}
			}

			tabbar.onToolButtonVisibleChange();
			tabbar.refreshNavButtons();
		},

		refreshDom: function(dom) {
			$invokeSuper.call(this, arguments);
			this.refreshTabBar();
		},

		doOnTabChange: function(eventArg) {
			var tabbar = this;
			tabbar.fireEvent("onTabChange", tabbar, eventArg);
		},

		/**
		 * 为tabbar创建左右按钮。
		 * @param {HtmlElement} dom tabbar的dom。
		 * @private
		 */
		createNavButtons: function(dom) {
			var tabbar = this;
			if (!dom) {
				return;
			}

			var doms = tabbar._doms, tabbarDom = doms.tabbar, leftBtn, rightBtn;

			leftBtn = tabbar._leftButton = new dorado.widget.SimpleButton({
				className: LEFT_BUTTON_CLASS,
				listener: {
					onClick: function() {
						tabbar.doScrollLeft(true);
					}
				}
			});

			rightBtn = tabbar._rightButton = new dorado.widget.SimpleButton({
				className: RIGHT_BUTTON_CLASS,
				listener: {
					onClick: function() {
						tabbar.doScrollRight(true);
					}
				}
			});

			tabbar.registerInnerControl(leftBtn);
			tabbar.registerInnerControl(rightBtn);

			leftBtn.render(tabbarDom);
			tabbarDom.insertBefore(leftBtn._dom, tabbarDom.firstChild);

			rightBtn.render(tabbarDom);
			tabbarDom.insertBefore(rightBtn._dom, doms.tabsWrap);

			doms.leftButton = leftBtn._dom;
			doms.rightButton = rightBtn._dom;

			$fly(doms.leftButton).repeatOnClick(function() {
				tabbar.doScrollLeft(false, 12);
			}, 30);

			$fly(doms.rightButton).repeatOnClick(function() {
				tabbar.doScrollRight(false, 12);
			}, 30);
		},

		/**
		 * @private
		 */
		doScrollLeft: function(anim, length) {
			var tabbar = this, doms = tabbar._doms, tabsEl = doms.tabs, to = parseInt(tabsEl.style.left, 10) + (length > 0 ? length : 100);
			if (anim) {
				$fly(tabsEl).animate({
					left: to > 0 ? 0 : to
				}, 300, null, function() {
					tabbar.refreshNavButtons();
				});
			}
			else {
				$fly(tabsEl).left(to > 0 ? 0 : to);
				tabbar.refreshNavButtons();
			}
		},

		/**
		 * @private
		 */
		doScrollRight: function(anim, length) {
			var tabbar = this, doms = tabbar._doms, tabs = tabbar._tabs, tabsEl = doms.tabs, currentLeft = parseInt(tabsEl.style.left || 0, 10);
			length = length > 0 ? length : 100;
			if (tabs) {
				var tabsWidth = tabbar.getTabsWidth(), visibleWidth = $fly(doms.tabsWrap).innerWidth(), to = currentLeft - length, rightWidth = tabsWidth + currentLeft - visibleWidth;
				if (rightWidth <= 0) {
					return false;
				}
				else {
					if (rightWidth < length) {
						to = currentLeft - rightWidth;
					}
				}
			}
			if (anim) {
				$fly(tabsEl).animate({
					left: to
				}, 300, null, function() {
					tabbar.refreshNavButtons();
				});
			}
			else {
				$fly(tabsEl).left(to);
				tabbar.refreshNavButtons();
			}
		},

		/**
		 * 为TabBar创建MenuButton
		 * @param {HtmlElement} dom tabbar的dom。
		 * @private
		 */
		createMenuButton: function(dom) {
			var tabbar = this;
			if (!dom) {
				return;
			}

			var wrapEl = dom.lastChild, doms = tabbar._doms, rightButtonEl = doms.rightButton, refEl = wrapEl;
			if (rightButtonEl) {
				refEl = rightButtonEl;
			}

			var navmenu = tabbar._navmenu = new dorado.widget.Menu({
				listener: {
					beforeShow: function(self, configs) {
						if (tabbar._tabPlacement == "top") {
							dorado.Object.apply(configs, {
								anchorTarget: menuBtn,
								align: "innerright",
								vAlign: "bottom"
							});
						}
						else {
							dorado.Object.apply(configs, {
								anchorTarget: menuBtn,
								align: "innerright",
								vAlign: "top"
							});
						}
					}
				}
			}), tabs = tabbar._tabs, tab;

			for(var i = 0, j = tabs.size; i < j; i++) {
				tab = tabs.get(i);
				tabbar.insertNavMenuItem(tab);
			}

			var menuBtn = tabbar._menuButton = new dorado.widget.SimpleButton({
				className: MENU_BUTTON_CLASS,
				menu: navmenu
			});

			menuBtn.render(dom);
			dom.insertBefore(menuBtn._dom, refEl);

			doms.menuButton = menuBtn._dom;
		},

		insertNavMenuItem: function(tab, index) {
			var tabbar = this, navmenu = tabbar._navmenu;
			if (navmenu && tab) {
				navmenu.addItem({
					caption: tab._caption,
					icon: tab._icon,
					iconClass: tab._iconClass,
					disabled: tab._disabled,
					visible: tab._visible,
					listener: {
						onClick: function() {
							tabbar.set("currentTab", tab);
						}
					}
				}, index);
			}
		},

		/**
		 * 取得所有Tab的width。
		 * @return tabs的宽度。
		 * @private
		 */
		getTabsWidth: function() {
			var tabbar = this, tabs = tabbar._tabs, lastTab, lastDom;
			if (tabs) {
				lastTab = tabs.get(tabs.size - 1);
				if (lastTab) {
					lastDom = lastTab._dom;
					if (lastDom) {
						return lastDom.offsetLeft + $fly(lastDom).outerWidth();
					}
				}
			}
			return 0;
		},

		/**
		 * 为TabBar添加右侧Button，主要用于用户自定义。
		 * @param {dorado.widget.SimpleButton|dorado.widget.SimpleIconButton} button 要添加的Button。
		 */
		addRightToolButton: function(button) {
			if (!button) return;
			var tabbar = this, rightToolButtons = tabbar._rightToolButtons;
			if (!rightToolButtons) {
				rightToolButtons = tabbar._rightToolButtons = [];
			}
			rightToolButtons.push(button);
			if (tabbar._rendered) {
				tabbar.registerInnerControl(button);
				button.render(tabbar._dom);

				tabbar.onToolButtonVisibleChange();
			}
		},

		scrollTabIntoView: function(tab) {
			var tabbar = this, doms = tabbar._doms, tabDom = tab._dom, tabsEl = doms.tabs, offsetLeft = tabDom.offsetLeft,
				offsetWidth = tabDom.offsetWidth, left = (parseInt(tabsEl.style.left, 10) || 0) * -1, viewWidth = $fly(doms.tabsWrap).width();

			$fly(tabDom).addClass("tab-selected");

			if (left > offsetLeft) {
				$fly(tabsEl).animate({
					left: -1 * offsetLeft
				}, 300, null, function() {
					tabbar.refreshNavButtons();
				});
			}
			else {
				if ((left + viewWidth) < (offsetLeft + offsetWidth)) {
					$fly(tabsEl).animate({
						left: -1 * (offsetLeft + offsetWidth - viewWidth)
					}, 300, null, function() {
						tabbar.refreshNavButtons();
					});
				}
				else {
					tabbar.refreshNavButtons();
				}
			}
		},

		onToolButtonVisibleChange: function() {
			var tabbar = this, dom = tabbar._dom, doms = tabbar._doms;
			if (!dom) return;

			var leftButton = doms.leftButton, rightButton = doms.rightButton, menuButton = doms.menuButton;
			var leftWidth = 0, rightWidth = 0, menuButtonWidth = 0;
			if (leftButton && leftButton.style.display != "none") {
				leftWidth += $fly(leftButton).outerWidth(true);
			}
			if (rightButton && rightButton.style.display != "none") {
				rightWidth += $fly(rightButton).outerWidth(true);
			}
			if (menuButton) {
				var menuButtonVisible = menuButton.style.display != "none";
				menuButtonWidth = menuButtonVisible ? $fly(menuButton).outerWidth(true) : 0;

				rightWidth += menuButtonWidth;
			}
			var rightToolButtons = tabbar._rightToolButtons, buttonsWidth = menuButtonWidth;
			if (rightToolButtons) {
				var tabsWrapHeight = $fly(doms.tabsWrap).height();
				for(var i = rightToolButtons.length - 1; i >= 0; i--) {
					var toolButton = rightToolButtons[i], toolButtonWidth = $fly(toolButton._dom).outerWidth(true), toolButtonHeight = $fly(toolButton._dom).outerHeight(true);
					$fly(toolButton._dom).css({
						position: "absolute",
						top: tabbar._tabPlacement == "top" ? Math.floor((tabsWrapHeight - toolButtonHeight) / 2) - 2 : Math.floor((tabsWrapHeight - toolButtonHeight) / 2) + 2,
						right: buttonsWidth
					});
					buttonsWidth += toolButtonWidth;
					rightWidth += toolButtonWidth;
				}
			}
			if (rightButton) {
				$fly(rightButton).css("right", buttonsWidth);
			}
			$fly(doms.tabsWrap).css({
				"margin-left": leftWidth,
				"margin-right": rightWidth
			});
		}
	});

	dorado.Toolkits.registerPrototype("tab", {
		Default: dorado.widget.tab.Tab,
		Tab: dorado.widget.tab.Tab,
		IFrame: dorado.widget.tab.IFrameTab,
		Control: dorado.widget.tab.ControlTab
	});
})();

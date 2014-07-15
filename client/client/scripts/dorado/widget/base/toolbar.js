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
 * @namespace dorado.widget.toolbar
 */
dorado.widget.toolbar = {};

/**
 * @author Frank Zhang (mailto:frank.zhang@bstek.com)
 * @component Base
 * @class 工具栏
 * @extends dorado.widget.Control
 */
dorado.widget.ToolBar = $extend(dorado.widget.Control, /** @scope dorado.widget.ToolBar.prototype */ {
	$className: "dorado.widget.ToolBar",

	ATTRIBUTES: /** @scope dorado.widget.ToolBar.prototype */ {
		className: {
			defaultValue: "d-toolbar"
		},
		
		height: {
			independent: true,
			readOnly: true
		},
		
		/**
		 * 工具栏中的子组件集合。可以使用Array、dorado.util.KeyedArray类型的数据来设置，但是取得的值是dorado.util.KeyedArray类型的。
		 * @attribute
		 * @type dorado.util.KeyedArray
		 */
		items: {
			setter: function(value) {
				var toolbar = this, items = toolbar._items, rendered = toolbar._rendered, i, l, item;
				if (items) {
					toolbar.clearItems();
				}
				if (!items) {
					toolbar._items = items = new dorado.util.KeyedArray(function(value) {
						return value._id;
					});
				}
				if (value) {
					if (value.constructor == Array.prototype.constructor) {
						for (i = 0, l = value.length; i < l; i++) {
							item = toolbar.createItem(value[i]);
							items.insert(item);
						}
						if (rendered) {
							toolbar.doRenderItems();
						}
					} else if (value instanceof dorado.util.KeyedArray) {
						for (i = 0, l = value.size; i < l; i++) {
							item = toolbar.createItem(value.get(i));
							items.append(item);
						}
						if (rendered) {
							toolbar.doRenderItems();
						}
					}
				}
			}
		},
		
		/**
		 * 当内容超出以后，固定在右侧的内容是始终显示还是隐藏。
		 * @attribute
		 * @type boolean
		 */
		fixRight: {
			defaultValue: false
		},
		
		/**
		 * 绑定了Menu的dorado.widget.toolbar.Button的元素，是否在鼠标移上去以后就显示菜单。
		 * @type boolean
		 * @default false
		 */
		showMenuOnHover: {}
	},
	
	createDom: function() {
		var toolbar = this, doms = {}, dom = $DomUtils.xCreate({
			tagName: "div",
			className: toolbar._className,
			content: [{
				tagName: "div",
				className: "toolbar-left-wrap",
				contextKey: "toolbarLeftWrap",
				content: [{
					tagName: "div",
					className: "toolbar-left",
					contextKey: "toolbarLeft"
				}]
			}, {
				tagName: "div",
				className: "toolbar-right",
				contextKey: "toolbarRight",
				style: {
					position: "absolute"
				}
			}]
		}, null, doms);
		
		toolbar._doms = doms;
		
		toolbar.doRenderItems();
		
		return dom;
	},
	
	/**
	 * 创建工具栏中的子组件。
	 * @param {Object} config 子组件的配置信息。
	 * @return {dorado.widget.Control} 创建好的Control。
	 * @protected
	 */
	createItem: function(config) {
		if (!config) return null;
		var item;
		if (typeof config == "string" || config.constructor == Object.prototype.constructor) {
			item = dorado.Toolkits.createInstance("toolbar,widget", config);
		} else if (config instanceof dorado.widget.Control) {
			item = config;
		}
        if (dorado.widget.DataPilot && item instanceof dorado.widget.DataPilot) {
            var oldRefreshItems = item.refreshItems;
            item.refreshItems = function() {
                oldRefreshItems.apply(this, arguments);

                if (item._visibleByOverflow == false) {
                    var menuItems = item._bindMenuItems || [];
                    for (var i = 0, j = menuItems.length; i < j; i++) {
                        var menuItem = menuItems[i], control = item._itemObjects[menuItem.itemCode.key];
                        if (control) {
                            menuItem.set({
                                visible: control._visible,
                                icon: control._icon,
                                action: control._action,
                                disabled: control._disabled,
                                iconClass: control._iconClass
                            });
                        }
                    }
                }
            };
        }
		if (item) this.registerInnerControl(item);
		return item;
	},
	
	/**
	 * 为toolbar插入子组件。
	 * @param {Object|dorado.widget.Control} item 要插入的子组件。
	 * @param {int} [index] 要插入的子组件的index，如果不指定，默认会附加到最后。
	 * @return {dorado.widget.Control} 插入成功的Item，如果不成功，返回null。
	 */
	addItem: function(item, index) {
		var toolbar = this, items = toolbar._items;
		if (!item) return null;
		if (!items) {
			items = toolbar._items = new dorado.util.KeyedArray(function(value) {
				return value._id;
			});
		}
		item = toolbar.createItem(item);
		if (toolbar._rendered) {
			var refDom = null, doms = toolbar._doms;
			if (typeof index == "number") {
				var refItem = items.get(index);
				refDom = refItem ? refItem._dom : null;
			}
			items.insert(item, index);
			item.render(doms.toolbarLeft, refDom);
			$fly(item._dom).addClass("d-toolbar-item");
		} else {
			items.insert(item, index);
		}
		
		return item;
	},
	
	/**
	 * 移除工具栏中的子组件。
	 * @param {dorado.widget.Control|int} item 要移除的子组件或者子组件的索引。
	 */
	removeItem: function(item) {
		var toolbar = this, items = toolbar._items;
		if (items && item !== undefined) {
			var realItem = item;
			if (typeof item == "number") {
				realItem = items.get(item);
				items.removeAt(item);
			} else {
				items.remove(item);
			}
			realItem.destroy();
			toolbar.unregisterInnerControl(realItem);
		}
	},
	
	/**
	 * 清除工具栏中所有的子组件。
	 */
	clearItems: function() {
		var toolbar = this, items = toolbar._items, afterFill = false;
		for (var i = 0, j = items.size; i < j; i++) {
			var item = items.get(i);
			if (!(item instanceof dorado.widget.toolbar.Fill)) {
				toolbar.unregisterInnerControl(item);
				item.destroy();
			}
		}
		items.clear();
	},
	
	doRenderItems: function() {
		var toolbar = this, doms = toolbar._doms, items = toolbar._items || {}, afterFill = false;
		for (var i = 0, j = items.size; i < j; i++) {
			var item = items.get(i);
			if (item instanceof dorado.widget.toolbar.Fill) {
				afterFill = true;
			} else {
				toolbar.registerInnerControl(item);
				if (!afterFill) {
					item.render(doms.toolbarLeft);
				} else {
					item.render(doms.toolbarRight);
				}
				$fly(item._dom).addClass("d-toolbar-item");
			}
		}
	},
	
	hideOverflowItem: function(item, overflowMenu, dataPilotItemCode, dataPilot) {
		var menuItem;
        if (dataPilotItemCode) {
            var map = {
                "|<": $resource("dorado.baseWidget.DataPilotFirstPage"),
                "<": $resource("dorado.baseWidget.DataPilotPreviousPage"),
                ">": $resource("dorado.baseWidget.DataPilotNextPage"),
                ">|": $resource("dorado.baseWidget.DataPilotLastPage"),
                "+": $resource("dorado.baseWidget.DataPilotInsert"),
                "-": $resource("dorado.baseWidget.DataPilotDelete"),
                "x": $resource("dorado.baseWidget.DataPilotCancel")
            };
            function addItem(itemCode, innerControl) {
                var menuItem = overflowMenu.addItem({
                    caption: map[itemCode.code],
                    visible: innerControl._visible,
                    icon: innerControl._icon,
                    action: innerControl._action,
                    disabled: innerControl._disabled,
                    iconClass: innerControl._iconClass,
                    listener: {
                        onClick: function() {
                            innerControl.fireEvent("onClick", item);
                        }
                    }
                });
                menuItem.itemCode = itemCode;
                dataPilot._bindMenuItems.push(menuItem);
            }
            switch (dataPilotItemCode.code) {
                case "|<":
                case "<":
                case ">":
                case ">|":
                case "+":
                case "-":
                case "x":
                    addItem(dataPilotItemCode, item);
                    break;
                case "goto":
                case "info":
                    break;
                case "|":
                    //overflowMenu.addItem("-");
                    break;
            }
        } else if (item instanceof dorado.widget.Button) {
			menuItem = overflowMenu.addItem({
				caption: item._caption,
				visible: item._visible,
				submenu: item._menu,
                action: item._action,
				disabled: item._disabled,
				icon: item._icon,
				iconClass: item._iconClass,
				listener: {
					onClick: function() {
						item.fireEvent("onClick", item);
					}
				}
			});
		} else if (item instanceof dorado.widget.toolbar.Separator) {
			overflowMenu.addItem("-");
		} else if (dorado.widget.DataPilot && item instanceof dorado.widget.DataPilot) {
			var compiledItemCodes = item._compiledItemCodes || [], bindMenuItems = [];
            item._bindMenuItems = bindMenuItems;

			for (var i = 0, j = compiledItemCodes.length; i < j; i++) {
				var itemCode = compiledItemCodes[i], innerControl = item._itemObjects[itemCode.key];
				switch (itemCode.code) {
					case "|<":
					case "<":
					case ">":
					case ">|":
					case "+":
					case "-":
					case "x":
						addItem(itemCode, innerControl);
						break;
					case "goto":
					case "info":
						break;
					case "|":
						//overflowMenu.addItem("-");
						break;
				}
			}
		}
		item._visibleByOverflow = false;
		item._bindingMenuItem = menuItem;
		if (dataPilotItemCode || item._hideMode == "visibility") {
			$fly(item._dom).css({
                visibility: "hidden"
			});
		} else {
			$fly(item._dom).css({
                display: "none"
			});
		}
	},
	
	showUnoverflowItem: function(item, dataPilotItem) {
		item._visibleByOverflow = true;
        if (dorado.widget.DataPilot && item instanceof dorado.widget.DataPilot) {
            item._bindMenuItems = [];
        }
		var visible = item._visible;
		item._bindingMenuItem = null;
        if (dataPilotItem) {
            $fly(item._dom).css({
                visibility: ""
            });
        } else if (item._hideMode == "display") {
			$fly(item._dom).css({
				display: visible ? "" : "none"
			});
		} else {
			$fly(item._dom).css({
				visibility: visible ? "" : "hidden"
			});
		}
	},
	
	refreshDom: function(dom) {
		$invokeSuper.call(this, arguments);
		var toolbar = this;
		if (toolbar._fixRight) {
			$fly(dom).addClass(toolbar._className + "-fixright");
		} else {
			$fly(dom).removeClass(toolbar._className + "-fixright");
		}
	},

    /**
     * @private
     * 用来显示DataPilot中所有子组件。
     * @param {dorado.widget.DataPilot} item 要显示子组件的DataPilot。
     */
    showDataPilot: function (item) {
        var compiledItemCodes = item._compiledItemCodes || [];
        item._visibleByOverflow = true;
        for (var i = 0, j = compiledItemCodes.length; i < j; i++) {
            var itemCode = compiledItemCodes[i], innerControl = item._itemObjects[itemCode.key];
            this.showUnoverflowItem(innerControl, true);
        }
    },

    /**
     * @private
     * 用来隐藏DataPilot中不可见的子组件。
     * @param {dorado.widget.DataPilot} item 要隐藏不可见子组件的DataPilot。
     * @param {dorado.widget.Menu} overflowMenu 右侧菜单。
     * @param {int} currentLeft DataPilot的起始left。
     * @param {int} leftVisibleWidth 左侧可见部分的宽度。
     */
    hideDataPilot: function (item, overflowMenu, currentLeft, leftVisibleWidth) {
        var toolbar = this, compiledItemCodes = item._compiledItemCodes || [], startHide = false, bindMenuItems = [];
        item._bindMenuItems = bindMenuItems;
        item._visibleByOverflow = false;
        for (var i = 0, j = compiledItemCodes.length; i < j; i++) {
            var itemCode = compiledItemCodes[i], innerControl = item._itemObjects[itemCode.key];
            toolbar.showUnoverflowItem(innerControl, true);
            if (startHide) {
                toolbar.hideOverflowItem(innerControl, overflowMenu, itemCode, item);
                continue;
            }
            currentLeft += $fly(innerControl._dom).outerWidth(true);
            if (currentLeft >= leftVisibleWidth) {
                startHide = true;
                toolbar.hideOverflowItem(innerControl, overflowMenu, itemCode, item);
            }
        }
    },

    doOnResize: function() {
        $invokeSuper.call(this, arguments);
		
		var toolbar = this, dom = toolbar._dom, doms = toolbar._doms, overflowMenu = toolbar._overflowMenu, overflowButton = toolbar._overflowButton, items = toolbar._items, lastChild = doms.toolbarLeft.lastChild, overflow = false;
		
		if (dorado.Browser.msie && items) {
			items.each(function(item) {
				if (item instanceof dorado.widget.TextEditor) {
					item.resetDimension();
				}
			});
		}

		if (items && lastChild) {
			var leftRealWidth = lastChild.offsetWidth + lastChild.offsetLeft, leftVisibleWidth = dom.offsetWidth - doms.toolbarRight.offsetWidth;
			
			overflow = leftRealWidth > leftVisibleWidth;
		}

		toolbar._overflowItems = [];

		if (overflow) {
			$fly(dom).addClass(toolbar._className + "-overflow");

            if (!overflowMenu) {
                overflowMenu = toolbar._overflowMenu = new dorado.widget.Menu();
				
				overflowButton = toolbar._overflowButton = new dorado.widget.SimpleButton({
					className: "overflow-button",
					menu: overflowMenu
				});
				overflowButton.render(doms.toolbarRight);
				toolbar.registerInnerControl(overflowButton);
			} else {
				overflowMenu.clearItems();
			}
			
			var leftWidthSum = 0, startHideIndex = -1, item, i, j, afterFill;
			
			if (toolbar._fixRight) {
				leftVisibleWidth = dom.offsetWidth - doms.toolbarRight.offsetWidth;
				for (i = 0, j = items.size; i < j; i++) {
					item = items.get(i);
					if (item instanceof dorado.widget.toolbar.Fill) {
						break;
					}

                    toolbar.showUnoverflowItem(item);
                    leftWidthSum += $fly(item._dom).outerWidth(true);
                    if (leftWidthSum >= leftVisibleWidth) {
                        startHideIndex = i;
                        break;
                    }

                    if (dorado.widget.DataPilot && item instanceof dorado.widget.DataPilot) {
                        toolbar.showDataPilot(item);
                    }
				}
				
				if (startHideIndex > -1) {
					for (i = startHideIndex, j = items.size; i < j; i++) {
						item = items.get(i);
						if (item instanceof dorado.widget.toolbar.Fill) {
							break;
						}
                        if (i == startHideIndex && dorado.widget.DataPilot && item instanceof dorado.widget.DataPilot) {
                            var currentLeft = leftWidthSum - $fly(item._dom).outerWidth(true);
                            toolbar.hideDataPilot(item, overflowMenu, currentLeft, leftVisibleWidth);
                        } else {
                            toolbar.hideOverflowItem(item, overflowMenu);
                        }
					}
				}
			} else {
				afterFill = false;
				for (i = 0, j = items.size; i < j; i++) {
					item = items.get(i);
					if (afterFill) {
						if (item._dom && (item._dom.parentNode == doms.toolbarRight)) {
							doms.toolbarLeft.appendChild(item._dom);
						}
					}
					if (item instanceof dorado.widget.toolbar.Fill) {
						afterFill = true;
					}
				}
				
				leftVisibleWidth = dom.offsetWidth - doms.toolbarRight.offsetWidth;
				
				for (i = 0, j = items.size; i < j; i++) {
					item = items.get(i);
					toolbar.showUnoverflowItem(item);

					if (item instanceof dorado.widget.toolbar.Fill) continue;

					leftWidthSum += $fly(item._dom).outerWidth(true);
					if (leftWidthSum >= leftVisibleWidth) {
						startHideIndex = i;
						break;
					}

                    if (dorado.widget.DataPilot && item instanceof dorado.widget.DataPilot) {
                        toolbar.showDataPilot(item);
                    }
				}
				
				if (startHideIndex > -1) {
					for (i = startHideIndex, j = items.size; i < j; i++) {
						item = items.get(i);
						if (item instanceof dorado.widget.toolbar.Fill) continue;
                        if (i == startHideIndex && dorado.widget.DataPilot && item instanceof dorado.widget.DataPilot) {
                            var currentLeft = leftWidthSum - $fly(item._dom).outerWidth(true);
                            toolbar.hideDataPilot(item, overflowMenu, currentLeft, leftVisibleWidth);
                        } else {
                            toolbar.hideOverflowItem(item, overflowMenu);
                        }
					}
				}
			}
		} else {
			$fly(dom).removeClass(toolbar._className + "-overflow");
			if (!items) return;
			if (!toolbar._fixRight) {
				afterFill = false;
				for (i = 0, j = items.size; i < j; i++) {
					item = items.get(i);
					if (afterFill) {
						if (item._dom && (item._dom.parentNode == doms.toolbarLeft)) {
							doms.toolbarRight.appendChild(item._dom);
						}
					}
					if (item instanceof dorado.widget.toolbar.Fill) {
						afterFill = true;
					}
				}
			}
			for (i = 0, j = items.size; i < j; i++) {
				item = items.get(i);
                if (dorado.widget.DataPilot && item instanceof dorado.widget.DataPilot) {
                    toolbar.showDataPilot(item);
                } else {
                    toolbar.showUnoverflowItem(item);
                }
			}
		}
	},
	
	getFocusableSubControls: function() {
		return this._items.toArray();
	}
	
});

/**
 * @author Frank Zhang (mailto:frank.zhang@bstek.com)
 * @component ToolBar
 * @class 工具栏上的分割条。
 * @shortTypeName | ; - ; Separator
 * @extends dorado.widget.Control
 */
dorado.widget.toolbar.Separator = $extend(dorado.widget.Control, {
	$className: "dorado.widget.toolbar.Separator",
	
	ATTRIBUTES: {
		className: {
			defaultValue: "d-toolbar-sep"
		}
	},
	
	createDom: function() {
		var separator = this, dom;
		dom = document.createElement("span");
		dom.className = separator._className;
		return dom;
	}
});

/**
 * @author Frank Zhang (mailto:frank.zhang@bstek.com)
 * @component ToolBar
 * @class 工具栏上的按钮。
 * @shortTypeName Default ; Button
 * @extends dorado.widget.Button
 */
dorado.widget.toolbar.Button = $extend(dorado.widget.Button, {
	$className: "dorado.widget.toolbar.Button",

	constructor: function(config) {
		var items = config ? config.items : null;
		if (items) {
			delete config.items;
		}
		$invokeSuper.call(this, arguments);
		if (items) this.set("items", items);
	},

	ATTRIBUTES: {
		/**
		 * 该属性为虚拟属性，指向MenuBarItem对应的Menu的items属性。
		 * @type dorado.util.KeyedArray
		 * @attribute
		 */
		items: {
			getter: function() {
				if (this._menu) {
					return this._menu.get("items");
				}
				return null;
			},
			setter: function(value) {
				if (value.constructor == Array.prototype.constructor) {
					this._menu = new dorado.widget.Menu({
						items: value
					});
					this.registerInnerControl(this._menu);
				}
			}
		},
		
		/**
		 * 绑定了Menu的dorado.widget.toolbar.Button的元素，是否在鼠标移上去以后就显示菜单。
		 * @type boolean
		 * @default false
		 */
		showMenuOnHover: {},

		/**
		 * 绑定了Menu的dorado.widget.toolbar.Button的元素，是否在鼠标移出Button和Menu后就隐藏菜单。
		 * @type boolean
		 * @default false
		 */
		hideMenuOnMouseLeave: {},

		/**
		 * 在鼠标移出Button和Menu后隐藏菜单的延时，此属性只有在hideMenuOnMouseLeave为true时才起作用，默认为300。
		 * @type int
		 * @default 300
		 */
		hideMenuOnMouseLeaveDelay: {
			defaultValue: 300
		}
	},

	doGet: function(attr) {
		var c = attr.charAt(0);
		if ((c == '#' || c == '&') && this._menu) {
			return this._menu.get(attr);
		} else {
			return $invokeSuper.call(this, [attr]);
		}
	},

	doSet: function(attr, value, skipUnknownAttribute, lockWritingTimes) {
		$invokeSuper.call(this, [attr, value, skipUnknownAttribute, lockWritingTimes]);

		if (this._parent instanceof dorado.widget.ToolBar) {
			var menuItem = this._bindingMenuItem;
			if (menuItem) {
				menuItem.set({
					caption: this._caption,
					visible: this._visible,
					submenu: this._menu,
					action: this._action,
					disabled: this._disabled,
					icon: this._icon,
					iconClass: this._iconClass
				});
			}
		}
	},

	doCancelHideMenuOnMouseEnter: function() {
		if (this._hideMenuOnMouseLeaveTimer) {
			clearTimeout(this._hideMenuOnMouseLeaveTimer);
			this._hideMenuOnMouseLeaveTimer = null;
		}
	},

	doHideMenuOnMouseLeave: function() {
		var button = this;

		if (this._hideMenuOnMouseLeaveTimer) {
			clearTimeout(this._hideMenuOnMouseLeaveTimer);
			this._hideMenuOnMouseLeaveTimer = null;
		}

		button._hideMenuOnMouseLeaveTimer = setTimeout(function() {
			if (button._hideMenuOnMouseLeave && button._menu) {
				button._menu.hide(true);
			}
			button._hideMenuOnMouseLeaveTimer = null;
		}, button._hideMenuOnMouseLeaveDelay || 300);
	},

	createDom: function() {
		var button = this, dom = $invokeSuper.call(button, arguments);
		$fly(dom).mouseenter(function() {
			var menu = button._menu, toolbar = button._parent;
			if (button._hideMenuOnMouseLeave) button.doCancelHideMenuOnMouseEnter();
			if (menu && toolbar && !button._disabled) {
				var activeButton = toolbar._activeMenuButton;
				if (button.willShowMenuOnHover()) {
					if (activeButton && activeButton != button) {
						activeButton._menu.hide(true);
						button.doShowMenu();
					} else if (activeButton != button) {
						button.doShowMenu();
					}
				} else {
					if (activeButton && activeButton != button) {
						activeButton._menu.hide(true);
						button.doShowMenu();
					}
				}
			}
		}).mouseleave(function() {
			if (button._hideMenuOnMouseLeave) button.doHideMenuOnMouseLeave();
		});
		return dom;
	},

	willShowMenuOnHover: function() {
		var button = this, toolbar = button._parent, menu = button._menu;
		if (menu && toolbar && !button._disabled) {
			return button._showMenuOnHover !== undefined ? button._showMenuOnHover : (toolbar._showMenuOnHover !== undefined ? toolbar._showMenuOnHover : undefined);
		}
		return false;
	},
	
	doShowMenu: function() {
		$invokeSuper.call(this, arguments);
		var button = this, menu = button._menu;
		if (menu) {
			var toolbar = button._parent;
			toolbar._activeMenuButton = button;
		}
	},
	
	doBeforeMenuHide: function() {
		var button = this, toolbar = button._parent;
		if (toolbar) {
			toolbar._activeMenuButton = null;
		}
	}
});

/**
 * @author Frank Zhang (mailto:frank.zhang@bstek.com)
 * @component ToolBar
 * @class 工具栏上的填充。
 * <p>
 * 工具栏在渲染的时候，在该组件之前的组件，都在左边渲染，在该组件以后的组件，都在右边渲染。
 * </p>
 * @shortTypeName -> ; Fill
 * @extends dorado.widget.Control
 */
dorado.widget.toolbar.Fill = $extend(dorado.widget.Control, {
	$className: "dorado.widget.toolbar.Fill"
});

/**
 * @author Frank Zhang (mailto:frank.zhang@bstek.com)
 * @component ToolBar
 * @class Label
 * @shortTypeName Label
 * @extends dorado.widget.Control
 */
dorado.widget.toolbar.Label = $extend(dorado.widget.Control, {
	$className: "dorado.widget.toolbar.Label",
	
	ATTRIBUTES: {
		className: {
			defaultValue: "d-toolbar-label"
		},
		text: {}
	},
	
	createDom: function() {
		var label = this, dom = document.createElement("div");
		dom.className = label._className;
		$fly(dom).text(label._text ? label._text : "");
		return dom;
	},
	
	refreshDom: function(dom) {
		$invokeSuper.call(this, arguments);
		var label = this;
		$fly(dom).text(label._text ? label._text : "");
	}
});

dorado.Toolkits.registerPrototype("toolbar", {
	Default: dorado.widget.toolbar.Button,
	Label: dorado.widget.toolbar.Label,
	ToolBarButton: dorado.widget.toolbar.Button,
	"->": dorado.widget.toolbar.Fill,
	Fill: dorado.widget.toolbar.Fill,
	ToolBarLabel: dorado.widget.toolbar.Label,
	"-": dorado.widget.toolbar.Separator,
	"|": dorado.widget.toolbar.Separator,
	Separator: dorado.widget.toolbar.Separator
});

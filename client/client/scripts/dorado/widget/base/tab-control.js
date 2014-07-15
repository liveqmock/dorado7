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
 * @component Base
 * @class 标签页。
 * @extends dorado.widget.TabBar
 */
dorado.widget.TabControl = $extend(dorado.widget.TabBar, /** @scope dorado.widget.TabControl.prototype **/ {
	$className: "dorado.widget.TabControl",

	_inherentClassName: "",

	ATTRIBUTES: /** @scope dorado.widget.TabControl.prototype **/ {
		height: {
			defaultValue: 200,
			independent: false,
			readOnly: false
		}
	},

	constructor: function() {
		this._cardBook = new dorado.widget.CardBook();
		this.registerInnerControl(this._cardBook);

		$invokeSuper.call(this, arguments);
	},

	doOnTabChange: function(eventArg) {
		var tabControl = this, tabs = tabControl._tabs, tab = eventArg.newTab,
			index = typeof tab == "number" ? tab : tabs.indexOf(tab), card = tabControl._cardBook;

		if (card) {
			card.set("currentControl", index);
		}

		$invokeSuper.call(this, arguments);
	},

	doChangeTabPlacement: function(value) {
		var result = $invokeSuper.call(this, arguments);

		if (!result) {
			return false;
		}

		var tabcontrol = this, dom = tabcontrol._dom;
		if (dom) {
			var tabbarDom = tabcontrol._tabbarDom, cardDom = tabcontrol._cardBook._dom;
			if (dorado.Browser.msie && dorado.Browser.version == 6) {
				if (value == "top") {
					dom.appendChild(cardDom);
				}
				else {
					dom.insertBefore(cardDom, tabbarDom);
				}
			}
			else {
				if (value == "top") {
					dom.insertBefore(tabbarDom, cardDom);
				}
				else {
					dom.appendChild(tabbarDom);
				}
			}
		}

		return true;
	},

	doRemoveTab: function(tab) {
		var tabcontrol = this, tabs = tabcontrol._tabs, index = typeof tab == "number" ? tab : tabs.indexOf(tab), card = tabcontrol._cardBook;

		if (card) {
			card.removeControl(index);
		}

		$invokeSuper.call(this, arguments);
	},

	doAddTab: function(tab, index, current) {
		$invokeSuper.call(this, arguments);

		var tabcontrol = this, card = tabcontrol._cardBook, tabs = tabcontrol._tabs;

		if (index == null) {
			index = tabs.indexOf(tab);
		}

		if (card) {
			card.addControl(tab.getControl(), index, current);
		}
	},

	doOnAttachToDocument: function() {
		var className = "";
		if (this._ui) {
			var uis = this._ui.split(',');
			for(var i = 0; i < uis.length; i++) {
				className += (" " + this._className + "-" + uis[i]);
			}
		}
		if (className) $fly(this._tabbarDom).addClass(className);
	},

	createDom: function() {
		var tabcontrol = this, card = tabcontrol._cardBook, dom = document.createElement("div"),
			tabbarDom = $invokeSuper.call(this, arguments), tabPlacement = tabcontrol._tabPlacement;

		if (tabPlacement == "top") {
			dom.appendChild(tabbarDom);
		}

		tabcontrol._tabbarDom = tabbarDom;

		var controls = [], tabs = tabcontrol._tabs;
		for(var i = 0, j = tabs.size; i < j; i++) {
			var tab = tabs.get(i);
			controls.push(tab.getControl());
		}
		var currentTab = tabcontrol._currentTab;
		if (currentTab) {
			card._currentControl = currentTab.getControl();
		}
		//card.set("controls", controls);
		card.render(dom);

		if (tabPlacement == "bottom") {
			dom.appendChild(tabbarDom);
		}

		return dom;
	},

	refreshDom: function(dom) {
		$invokeSuper.call(this, arguments);

		var tabcontrol = this, card = tabcontrol._cardBook, tabbarDom = tabcontrol._tabbarDom, cardDom = tabcontrol._cardBook._dom;
		tabcontrol.refreshTabBar();
		$fly(tabbarDom).css("height", "auto");

		if (tabcontrol._height != null) {
			card._realHeight = tabcontrol.getRealHeight() - $fly(tabbarDom).height();
			card._realWidth = tabcontrol.getRealWidth();
		}

		var tabs = tabcontrol._tabs, currentTab = tabcontrol._currentTab, currentTabIndex = tabs.indexOf(currentTab);

		if (currentTabIndex != -1) {
			card._currentControl = card._controls.get(currentTabIndex);
		}
		card.refreshDom(cardDom);
	},

	getFocusableSubControls: function() {
		return [this._cardBook];
	}
});

/**
 * @author Frank Zhang (mailto:frank.zhang@bstek.com)
 * @component Base
 * @class 纵向标签页。
 * @extends dorado.widget.TabColumn
 */
dorado.widget.VerticalTabControl = $extend(dorado.widget.TabColumn, /** @scope dorado.widget.VerticalTabControl.prototype **/ {
	$className: "dorado.widget.VerticalTabControl",

	_inherentClassName: "",

	ATTRIBUTES: /** @scope dorado.widget.VerticalTabControl.prototype **/ {
		height: {
			defaultValue: 200,
			independent: false,
			readOnly: false
		},

		/**
		 * TabColumn的宽度，默认为200。
		 * @type int
		 * @default 200
		 * @attribute
		 */
		tabColumnWidth: {
			defaultValue: 200
		}
	},

	constructor: function() {
		this._cardBook = new dorado.widget.CardBook();
		this.registerInnerControl(this._cardBook);

		$invokeSuper.call(this, arguments);
	},

	doOnTabChange: function(eventArg) {
		var tabcolumnControl = this, tabs = tabcolumnControl._tabs, tab = eventArg.newTab,
			index = typeof tab == "number" ? tab : tabs.indexOf(tab), card = tabcolumnControl._cardBook;

		if (card) {
			card.set("currentControl", index);
		}

		$invokeSuper.call(this, arguments);
	},

	doChangeTabPlacement: function(value) {
		var result = $invokeSuper.call(this, arguments);

		if (!result) {
			return false;
		}

		var tabcolumnControl = this, dom = tabcolumnControl._dom;
		if (dom) {
			var tabcolumnDom = tabcolumnControl._tabcolumnDom, cardDom = tabcolumnControl._cardBook._dom;
			if (dorado.Browser.msie && dorado.Browser.version == 6) {
				if (value == "left") {
					dom.appendChild(cardDom);
				}
				else {
					dom.insertBefore(cardDom, tabcolumnDom);
				}
			}
			else {
				if (value == "left") {
					dom.insertBefore(tabcolumnDom, cardDom);
				}
				else {
					dom.appendChild(tabcolumnDom);
				}
			}
		}

		return true;
	},

	doRemoveTab: function(tab) {
		var tabcolumnControl = this, tabs = tabcolumnControl._tabs, index = typeof tab == "number" ? tab : tabs.indexOf(tab), card = tabcolumnControl._cardBook;

		if (card) {
			card.removeControl(index);
		}

		$invokeSuper.call(this, arguments);
	},

	doAddTab: function(tab, index, current) {
		$invokeSuper.call(this, arguments);

		var tabcolumnControl = this, card = tabcolumnControl._cardBook, tabs = tabcolumnControl._tabs;

		if (index == null) {
			index = tabs.indexOf(tab);
		}

		if (card) {
			card.addControl(tab.getControl(), index, current);
		}
	},

	doOnAttachToDocument: function() {
		var className = "";
		if (this._ui) {
			var uis = this._ui.split(',');
			for(var i = 0; i < uis.length; i++) {
				className += (" " + this._className + "-" + uis[i]);
			}
		}
		if (className) $fly(this._tabcolumnDom).addClass(className);
	},

	createDom: function() {
		var tabcolumnControl = this, card = tabcolumnControl._cardBook, dom = document.createElement("div"),
			tabcolumnDom = $invokeSuper.call(this, arguments), tabPlacement = tabcolumnControl._tabPlacement;

		if (tabPlacement == "left") {
			dom.appendChild(tabcolumnDom);
		}

		tabcolumnControl._tabcolumnDom = tabcolumnDom;

		var currentTab = tabcolumnControl._currentTab;
		if (currentTab) {
			card._currentControl = currentTab.getControl();
		}
		card.render(dom);

		if (tabPlacement == "right") {
			dom.appendChild(tabcolumnDom);
		}

		return dom;
	},

	refreshDom: function(dom) {
		$invokeSuper.call(this, arguments);
		var tabcolumnControl = this, card = tabcolumnControl._cardBook, tabcolumnDom = tabcolumnControl._tabcolumnDom, cardDom = tabcolumnControl._cardBook._dom;

		tabcolumnControl.refreshTabColumn();

		var tabColumnWidth = tabcolumnControl._tabColumnWidth || 200;

		$fly(tabcolumnDom).css({
			"height": "auto",
			"float": "left"
		}).css("width", tabcolumnControl._verticalText ? "" : tabColumnWidth);

		$fly(cardDom).css("float", "left");

		if (tabcolumnControl._height != null) {
			card._realHeight = tabcolumnControl.getRealHeight();
			card._realWidth = tabcolumnControl.getRealWidth() - $fly(tabcolumnDom).outerWidth(true);
		}

		var tabs = tabcolumnControl._tabs, currentTab = tabcolumnControl._currentTab, currentTabIndex = tabs.indexOf(currentTab);

		if (currentTabIndex != -1) {
			card._currentControl = card._controls.get(currentTabIndex);
		}
		card.refreshDom(cardDom);
	},

	getFocusableSubControls: function() {
		return [this._cardBook];
	},

	setFocus: function() {
		// 放置在IE容器滚动条的意外滚动
		var dom = this._tabcolumnDom;
		if (dom) {
			//			setTimeout(function () {
			try {
				dom.focus();
			}
			catch(e) {
			}
			//			}, 0);
		}
	}
});

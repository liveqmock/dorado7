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
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @class 默认的列表组件的行渲染器。
 * @extends dorado.Renderer
 */
dorado.widget.list.ListBoxRowRenderer = $extend(dorado.Renderer, /** @scope dorado.widget.list.ListBoxRowRenderer.prototype */{
	$className: "dorado.widget.list.ListBoxRowRenderer",
	
	/**
	 * 渲染。
	 * @param {HTMLElement} dom 要渲染的DOM对象。
	 * @param {Object} arg 渲染参数。
	 * @param {String} arg.property 绑定的属性名。见{@link dorado.widget.AbstractListBox#attribute:property}
	 * @param {Object|dorado.Entity} arg.data 行对应的数据。
	 */
	render: function(dom, arg) {
		var item = arg.data, text;
		if (item != null) {
			if (arg.property) {
				if (item instanceof dorado.Entity) {
					text = item.getText(arg.property);
				} else {
					text = item[arg.property];
				}
			} else if (!item.isEmptyItem) {
				text = item;
			}
		}
		dom.innerText = (text === undefined || text === null) ? '' : text;
	}
});

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @class 列表控件的抽象类。
 * @abstract
 * @extends dorado.widget.RowList
 */
dorado.widget.AbstractListBox = $extend(dorado.widget.RowList, /** @scope dorado.widget.AbstractListBox.prototype */ {
	$className: "dorado.widget.AbstractListBox",
	
	ATTRIBUTES: /** @scope dorado.widget.AbstractListBox.prototype */ {
		className: {
			defaultValue: "d-list-box"
		},
		
		width: {
			defaultValue: 200
		},
		
		/**
		 * 数据实体(JSON对象或{@link dorado.Entity}对象)中的某个属性名，表示列表中将显示该属性的属性值。
		 * @type String
		 * @attribute
		 */
		property: {
			setter: function(property) {
				this._property = property;
				this._ignoreItemTimestamp = true;
			}
		},
		
		/**
		 * 行渲染器。
		 * @type dorado.Renderer
		 * @attribute
		 */
		renderer: {}
	},
	
	EVENTS: /** @scope dorado.widget.AbstractListBox.prototype */{
		
		/**
		 * 当列表控件渲染其中的某个行时触发的事件。
		 * @param {Object} self 事件的发起者，即组件本身。
		 * @param {Object} arg 事件参数。
		 * @param {HTMLElement} arg.dom 行对应的DOM对象。
		 * @param {Object} arg.data 行对应的数据。
		 * @param {boolean} #arg.processDefault 是否在事件结束后继续使用系统默认的渲染逻辑。
		 * @return {boolean} 是否要继续后续事件的触发操作，不提供返回值时系统将按照返回值为true进行处理。
		 * @event
		 */
		onRenderRow: {}
	},
	
	doRefreshItemDomData: function(row, item) {
		var processDefault = true, arg = {
			dom: row.firstChild,
			data: item,
			property: this._property,
			processDefault: false
		};
		if (this.getListenerCount("onRenderRow")) {
			this.fireEvent("onRenderRow", this, arg);
			processDefault = arg.processDefault;
		}
		if (processDefault) {
			(this._renderer || $singleton(dorado.widget.list.ListBoxRowRenderer)).render(row.firstChild, arg);
		}
	},
	
	createItemDom: function(item) {
		var row = document.createElement("TR");
		row.className = "row";
		row.style.height = this._rowHeight + "px";
		if (this._scrollMode == "lazyRender" && this._shouldSkipRender) {
			row._lazyRender = true;
			row.style.height = this._rowHeight + "px";
		} else {
			this.createItemDomDetail(row, item);
		}
		return row;
	},
	
	createItemDomDetail: function(dom, item) {
		var cell = document.createElement("TD");
		dom.appendChild(cell);
	},
	
	/**
	 * 根据传入的DHTML Event返回相应的列表项。
	 * <p>此方法一般用于onMouseDown、onClick等事件，用于获得此时鼠标实际操作的列表项。</p>
	 * @param {Event} event DHTML中的Event对象。
	 * @return Object 相应的列表项。
	 */
	getItemByEvent: function(event) {
		var row = this.findItemDomByEvent(event);
		return (row) ? $fly(row).data("item") : null;
	}
	
});

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @component Collection
 * @class 列表控件。
 * @extends dorado.widget.AbstractListBox
 */
dorado.widget.ListBox = $extend(dorado.widget.AbstractListBox, /** @scope dorado.widget.ListBox.prototype */ {
	$className: "dorado.widget.ListBox",
	
	ATTRIBUTES: /** @scope dorado.widget.ListBox.prototype */ {
	
		/**
		 * 当前子元素的行号，此行号是从0开始计算的。
		 * @type int
		 * @attribute
		 */
		currentIndex: {
			skipRefresh: true,
			defaultValue: -1,
			setter: function(index) {
				if (index >= this._itemModel.getItemCount()) index = -1;
				if (this._currentIndex == index) return;
				this._currentIndex = index;
				var row = this.getItemDomByItemIndex(index);
				this.setCurrentRow(row);
				this.scrollCurrentIntoView();
				if (!row) {
					row = this.getItemDomByItemIndex(index);
					this.setCurrentRow(row);
				}
				this.fireEvent("onCurrentChange", this);
			}
		},
		
		/**
		 * 当前数据项。
		 * @type Object
		 * @attribute readOnly
		 */
		currentItem: {
			readOnly: true,
			getter: function() {
				return this.getCurrentItem();
			}
		},
		
		/**
		 * 列表中要显示的数据。
		 * @type Array|dorado.EntityList
		 * @attribute
		 */
		items: {
			setter: function(v) {
				this.set("selection", null);
				this._currentIndex = -1;
				this._itemModel.setItems(v);
			},
			getter: function() {
				return this._itemModel.getItems();
			}
		}
	},
	
	refreshDom: function(dom) {
		$invokeSuper.call(this, arguments);
		
		var currentIndex = this._currentIndex;
		if (currentIndex < 0 && !this._allowNoCurrent && this._itemModel.getItemCount()) {
			currentIndex = 0;
		}
		this.set("currentIndex", currentIndex);
	},
	
	getItemDomByItemIndex: function(index) {
		var itemModel = this._itemModel, row;
		if (index >= itemModel.getItemCount()) index = -1;
		var item = index >= 0 ? itemModel.getItemAt(index) : null;
		if (this._rendered && this._itemDomMap && index >= 0) {
			if (this._rowCache && $fly(this._rowCache).data("item") == item) {
				row = this._rowCache;
				delete this._rowCache;
			} else {
				row = this._itemDomMap[itemModel.getItemId(item)];
			};
		}
		return row;
	},
	
	getCurrentItem: function() {
		if (this._currentIndex >= 0) {
			return this._itemModel.getItemAt(this._currentIndex);
		}
	},
	
	getCurrentItemId: function() {
		return this._currentIndex;
	},
	
	doOnKeyDown: function(evt) {
		var retValue = true;
		switch (evt.keyCode || evt.which) {
			case 36:{ // home
				this.set("currentIndex", 0);
				break;
			}
			case 35:{ // end
				this.set("currentIndex", this._itemModel.getItemCount() - 1);
				break;
			}
			case 38:{ // up
				if (this._currentIndex > 0) this.set("currentIndex", this._currentIndex - 1);
				retValue = false;
				break;
			}
			case 40:{ // down
				if (this._currentIndex < this._itemModel.getItemCount() - 1) this.set("currentIndex", this._currentIndex + 1);
				retValue = false;
				break;
			}
		}
		return retValue;
	},
	
	setCurrentItemDom: function(row) {
		this._rowCache = row;
		this.set("currentIndex", row ? this._itemModel.getItemIndex($fly(row).data("item")) : -1);
		return true;
	},
		
	/**
	 * 高亮指定的列表行。
	 * @param {int} [index] 要高亮的行的序号，如果不指定此参数则表示要高亮当前行。
	 * @param {Object} [options] 高亮选项。见jQuery ui相关文档中关于highlight方法的说明。
	 * @param {Object} [speed] 动画速度。
	 */
	highlightItem: function(index, options, speed) {
		if (index == undefined) index = this._currentIndex;
		var row = this.getItemDomByItemIndex(index);
		if (row) {
			$fly(row).addClass("highlighting-row").effect("highlight", options ||
			{
				color: "#FF8000"
			}, speed || 1500, function() {
				$fly(row).removeClass("highlighting-row");
			});
		}
	}
});

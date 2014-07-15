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

	/**
	 * @author Benny Bao (mailto:benny.bao@bstek.com)
	 * @component Collection
	 * @class 表格控件。
	 * @extends dorado.widget.AbstractGrid
	 */
	dorado.widget.Grid = $extend(dorado.widget.AbstractGrid, /** @scope dorado.widget.Grid.prototype */ {
		$className: "dorado.widget.Grid",
		
		ATTRIBUTES: /** @scope dorado.widget.Grid.prototype */ {
			/**
			 * 当前子元素的行号，此行号是从0开始计算的。
			 * @type int
			 * @attribute skipRefresh
			 */
			currentIndex: {
				skipRefresh: true,
				getter: function(p) {
					return (this._domMode == 2 ? this._fixedInnerGrid : this._innerGrid).get(p);
				},
				setter: function(index, p) {
					if (!this._ready) return;
					if (index >= this._itemModel.getItemCount()) index = -1;
					(this._domMode == 2 ? this._fixedInnerGrid : this._innerGrid).set(p, index);
				}
			},
			
			/**
			 * 当前数据实体。
			 * @type Object|dorado.Entity
			 * @attribute readOnly
			 */
			currentEntity: {
				readOnly: true,
				getter: function() {
					return this._innerGrid.getCurrentItem(0);
				}
			},
			
			/**
			 * 列表中要显示的数据。
			 * @type Object[]|dorado.EntityList
			 * @attribute
			 */
			items: {
				setter: function(items) {
					this.set("selection", null);
					this._itemModel.setItems(items);
				},
				getter: function() {
					return this._itemModel.getItems();
				}
			},
			
			groupProperty: {
				setter: function(v) {
					if (this._groupProperty == v) return;
					this.set("currentIndex", -1);
					$invokeSuper.call(this, arguments);
				}
			}
		},
		
		createInnerGrid: function(fixed) {
			return new dorado.widget.grid.InnerGrid(this, fixed);
		},
		
		refreshDom: function(dom) {
			$invokeSuper.call(this, arguments);
			
			var currentIndex = this._currentIndex;
			if (currentIndex < 0 && !this._allowNoCurrent && this._itemModel.getItemCount()) {
				currentIndex = 0;
			}
			this.set("currentIndex", currentIndex);
		},
		
		_doOnKeyDown: function(evt) {
			var retValue = true;
			var items = this._itemModel.getItems();
			switch (evt.keyCode) {
				case 36:{ /* home */
					if (evt.ctrlKey) {
						this.set("currentIndex", 0);
					} else {
						this.setCurrentColumn(this._columnsInfo.dataColumns[0]);
					}
					break;
				}
				case 35:{ /* end */
					if (evt.ctrlKey) {
						this.set("currentIndex", this._itemModel.getItemCount() - 1);
					} else {
						var columns = this._columnsInfo.dataColumns;
						this.setCurrentColumn(columns[columns.length - 1]);
					}
					break;
				}
				case 38:{ /* up */
					var index = this.get("currentIndex");
					if (index > 0) {
						this.set("currentIndex", index - 1);
					}
					retValue = false;
					break;
				}
				case 40:{ /* down */
					var index = this.get("currentIndex");
					if (index < this._itemModel.getItemCount() - 1) {
						this.set("currentIndex", index + 1);
					}
					retValue = false;
					break;
				}
				case 13:{ /* enter */
					retValue = false;
					var columns = this._columnsInfo.dataColumns, i;
					if (this._currentColumn) {
						i = columns.indexOf(this._currentColumn) || 0;
						if (evt.shiftKey) {
							if (i > 0) i--;
							else {
								var index = this.get("currentIndex");
								if (index > 0) {
									this.set("currentIndex", index - 1);
									i = columns.length - 1;
								} else retValue = true;
							}
						} else {
							if (i < columns.length - 1) i++;
							else {
								var index = this.get("currentIndex");
								if (index < this._itemModel.getItemCount() - 1) {
									this.set("currentIndex", index + 1);
									i = 0;
								} else retValue = true;
							}
						}
					} else {
						i = evt.shiftKey ? (columns.length - 1) : 0;
					}
					this.setCurrentColumn(columns[i]);
					break;
				}
			}
			return retValue;
		},
		
		/**
		 * 刷新与给定的数据实体相关的显示。
		 * <p>一般而言是其具体功能是刷新某数据实体相关的表格行。</p>
		 * @param {Object|dorado.Entity} entity 要刷新的数据实体。
		 */
		refreshEntity: function(entity) {
			var itemId = this._itemModel.getItemId(entity), row, innerGrid;
			if (this._domMode == 2) {
				innerGrid = this._fixedInnerGrid;
				row = innerGrid._itemDomMap[itemId];
				if (row) innerGrid.refreshItemDomData(row, entity);
			}
			innerGrid = this._innerGrid;
			row = innerGrid._itemDomMap[itemId];
			if (row) innerGrid.refreshItemDomData(row, entity);
		},
		
		onCellValueEdit: function(entity, column) {
			this.refreshEntity(entity);
			if (!entity.rowType) this.onEntityChanged(entity, column._property);
			this.refreshSummary();
			$invokeSuper.call(this, arguments);
		},
		
		sort: function(column, desc) {
			$invokeSuper.call(this, arguments);
			this.refresh();
		},
		
		/**
		 * 高亮指定的数据实体对应的表格行。
		 * @param {Object|dorado.Entity|int} entity 要高亮的数据实体或其在表格中的序号（自0开始）。
		 * @param {Object} [options] 高亮选项。见jQuery ui相关文档中关于highlight方法的说明。
		 * @param {Object} [speed] 动画速度。
		 */
		highlightItem: function(entity, options, speed) {
			if (typeof entity == "number") entity = this._itemModel.getItemAt(entity);
			$invokeSuper.call(this, [entity, options, speed]);
		}
	});
	
	var ListBoxPrototype = dorado.widget.ListBox.prototype;
	
	dorado.widget.grid.InnerGrid = $extend(dorado.widget.grid.AbstractInnerGrid, {
		$className: "dorado.widget.grid.InnerGrid",
		
		ATTRIBUTES: {
			currentIndex: {
				skipRefresh: true,
				setter: function(index) {
					if (this._currentIndex == index) return;
					if (this._rendered && this._itemDomMap) {
						var itemModel = this._itemModel, item = itemModel.getItemAt(index);
						if (item && item.rowType) return;
					}
					// 确保先让fixedInnerGrid执行刷新动作，以便于更高效的完成与innerGrid之间的行高同步
					ListBoxPrototype.ATTRIBUTES.currentIndex.setter.apply(this, arguments);
					this.grid.doInnerGridSetCurrentRow(this, index);
				}
			}
		},
		
		getCurrentItem: ListBoxPrototype.getCurrentItem,
		setCurrentItemDom: ListBoxPrototype.setCurrentItemDom,
		getCurrentItemId: ListBoxPrototype.getCurrentItemId,
		refreshItemDom: ListBoxPrototype.refreshItemDom,
		getItemDomByItemIndex: ListBoxPrototype.getItemDomByItemIndex,
		
		setCurrentRowByItemId: function(itemId) {
			if (this._currentIndex != itemId) this.set("currentIndex", itemId);
		}
		
	});
	
})();

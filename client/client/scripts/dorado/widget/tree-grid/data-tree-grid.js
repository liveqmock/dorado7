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
 * @component Collection
 * @class 支持数据绑定的树状表格控件。
 * @extends dorado.widget.TreeGrid
 * @extends dorado.widget.DataTree
 */
dorado.widget.DataTreeGrid = $extend([dorado.widget.TreeGrid, dorado.widget.DataTree], /** @scope dorado.widget.DataTreeGrid.prototype */ {
	$className: "dorado.widget.DataTreeGrid",
	
	ATTRIBUTES: /** @scope dorado.widget.DataTreeGrid.prototype */ {
		/**
		 * 是否自动根据绑定的EntityDataType自动创建其中的表格列。
		 * @type boolean
		 * @default true
		 * @attribute
		 */
		autoCreateColumns: {
			defaultValue: true
		},
		
		selection: {
			setter: function(selection) {
				this.refresh();
				$invokeSuper.call(this, arguments);
			}
		}
	},
	
	onReady: dorado.widget.DataTree.prototype.onReady,
	
	createRootNode: function() {
		return new dorado.widget.tree.DataBindingNode({
			bindingConfig: {}
		});
	},
	
	onCellValueEdited: null,
		
	addColumn: function() {
		var column = $invokeSuper.call(this, arguments);
		if (this._autoCreateColumns && column instanceof dorado.widget.grid.DataColumn && column._property && column._property != "none") {
			var watcher = this.getAttributeWatcher();
			if (watcher.getWritingTimes("autoCreateColumns") == 0) {
				this._autoCreateColumns = false;
			}
		}
		return column;
	},
	
	initColumns: dorado.widget.DataGrid.prototype.initColumns,
	
	refreshDom: function(dom) {
		var bindingConfigs = this.get("bindingConfigs");
		if (!bindingConfigs || !bindingConfigs.length) {
			throw new dorado.Exception("DataTreeGrid " + this._id + ".bindingConfigs is undefined.");
		}
		
		var columnsInited = false;
		if (this._dataSet) {
			var dataType, data = this.getBindingData({
				firstResultOnly: true,
				acceptAggregation: true
			});
			if (data && data.dataType && data.dataType instanceof dorado.AggregationDataType) dataType = data.dataType.getElementDataType("auto");
			if (!dataType) dataType = this.getBindingDataType("auto");
			if (dataType) {
				this.initColumns(dataType);
				columnsInited = true;
			} else if (this._autoCreateColumns && !this._listeningDataTypeRepository) {
				this._columnInited = false;
				this._listeningDataTypeRepository = true;
				var grid = this;
				this.get("dataTypeRepository").bind("onDataTypeRegister", function(self, arg) {
					var dataType = grid.getBindingDataType("never");
					if (dataType) {
						self.unbind("onDataTypeRegister", arguments.callee);
						grid._autoCreateColumns = true;
						grid._listeningDataTypeRepository = false;
						grid.initColumns(dataType);
						grid.refresh(true);
					}
				});
			}
			
			if (!this._root._childrenPrepared || this._data != data ||
				(this._data && this._data.pageNo != (this._pageNo || 0))) {
				this._data = data;
				this._pageNo = (data ? data.pageNo : 0);
				this._root._prepareChildren(dorado._NULL_FUNCTION);
			}
		}
		if (!columnsInited) this.initColumns();
		
		$invokeSuper.call(this, [dom]);
	},
	
	processItemDrop: dorado.widget.DataTree.prototype.processItemDrop,
	filterDataSetMessage: dorado.widget.DataTree.prototype.filterDataSetMessage
});

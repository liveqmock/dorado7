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

	var ItemModel = $extend(dorado.widget.grid.ItemModel, {
		resetFilterEntityOnSetItem: false,
		
		getItemCount: function() {
			var items = this._items;
			if (!items) return 0;
			if (this.groups || this._items instanceof Array) {
				return $invokeSuper.call(this, arguments);
			} else {
				if (!(items.pageSize > 0)) {
					return items.entityCount;
				} else if (this.grid._supportsPaging || items.entityCount < items.pageSize) {
					return items.entityCount;
				} else {
					return items.pageSize;
				}
			}
		},
		
		iterator: function(startIndex) {
			if (!this._items) return this.EMPTY_ITERATOR;
			if (this.groups || this._items instanceof Array) {
				return $invokeSuper.call(this, arguments);
			} else {
				return this._items.iterator({
					simulateUnloadPage: this.grid._supportsPaging,
					currentPage: !this.grid._supportsPaging,
					nextIndex: startIndex || this._startIndex || 0
				});
			}
		},
		
		getItemAt: function(index) {
			if (!this._items || !(index >= 0)) return null;
			if (this.groups || this._items instanceof Array) {
				return $invokeSuper.call(this, arguments);
			} else {
				return this._items.iterator({
					simulateUnloadPage: this.grid._supportsPaging,
					currentPage: !this.grid._supportsPaging,
					nextIndex: index
				}).next();
			}
		},
		
		getItemIndex: function(item) {
			if (!item || item.dummy) return -1;
			if (this.groups || this._items instanceof Array) {
				return $invokeSuper.call(this, arguments);
			} else {
				var entityList = this._items, itemId, page;
				if (item instanceof dorado.Entity) {
					itemId = item.entityId;
					page = item.page;
				} else {
					itemId = item;
					item = entityList.getById(itemId);
					if (item) page = item.page;
				}
				if (!page || page.entityList != entityList) return -1;
				
				var index = 0, entry = page.first, found = false;
				while (entry != null) {
					if (entry.data.entityId == itemId) {
						found = true;
						break;
					}
					if (entry.data.state != dorado.Entity.STATE_DELETED) index++;
					entry = entry.next;
				}
				
				if (found) {
					if (this.grid._supportsPaging) {
						for (var i = page.pageNo - 1; i > 0; i--) {
							index += entityList.getPage(i, false).entityCount;
						}
					}
					return index;
				} else {
					return -1;
				}
			}
		}
	});
	
	/**
	 * @author Benny Bao (mailto:benny.bao@bstek.com)
	 * @component Collection
	 * @class 数据表格控件。
	 * @extends dorado.widget.AbstractGrid
	 * @extends dorado.widget.DataControl
	 */
	dorado.widget.DataGrid = $extend([dorado.widget.AbstractGrid, dorado.widget.DataControl], /** @scope dorado.widget.DataGrid.prototype */ {
		$className: "dorado.widget.DataGrid",
		
		ATTRIBUTES: /** @scope dorado.widget.DataGrid.prototype */ {
		
			/**
			 * 是否自动根据绑定的EntityDataType自动创建其中的表格列。
			 * @type boolean
			 * @default true
			 * @attribute
			 */
			autoCreateColumns: {
				defaultValue: true
			},
			
			/**
			 * 是否支持分页显示及动态的分页数据下载。
			 * @type boolean
			 * @attribute
			 */
			supportsPaging: {},
			
			/**
			 * 当用户在最后一个单元格中按下回车键时是否要自动追加一条新的记录。
			 * @type boolean
			 * @attribute
			 */
			appendOnLastEnter: {},
			
			/**
			 * 数据过滤模式。
			 * <p>
			 * 目前支持以下几种取值：
			 * <ul>
			 * <li>clientSide - 在客户端执行过滤。</li>
			 * <li>serverSide - 在服务端执行过滤。<br>
			 * 在此种模式下，当DataGrid需要过滤其中的数据时会将过滤条件设置到绑定的DataSet的parameter属性中。<br>
			 * 用户输入的过滤条件以数组的形式放入parameter的criteria属性的criterions子属性中，
			 * 数组中的每一个元素是一个JSON对象，该对象中包含下列属性：
			 * 	<ul>
			 * 		<li>property	-	{String} 属性名。</li>
			 * 		<li>expression	-	{String} 用户输入的过滤表达式，例如：">6000"。</li>
			 * 	</ul>
			 * </li>
			 * </ul>
			 * </p>
			 * @type String
			 * @attribute
			 * @default clientSide
			 */
			filterMode: {
				defaultValue: "clientSide"
			},
			
			/**
			 * 数据排序模式。
			 * <p>
			 * 目前支持以下几种取值：
			 * <ul>
			 * <li>clientSide - 在客户端执行排序。</li>
			 * <li>serverSide - 在服务端执行排序。<br>
			 * 在此种模式下，当DataGrid需要过滤其中的数据时会将排序条件设置到绑定的DataSet的parameter属性中。<br>
			 * 用户输入的过滤条件以数组的形式放入parameter的criteria属性的orders子属性中，
			 * 数组中的每一个元素是一个JSON对象，该对象中包含下列属性：
			 * 	<ul>
			 * 		<li>property	-	{String} 属性名。</li>
			 * 		<li>desc	-	{boolean} 是否反向排序。</li>
			 * 	</ul>
			 * </li>
			 * </ul>
			 * </p>
			 * @type String
			 * @attribute
			 * @default clientSide
			 * @dorado.widget.View#attribute:context
			 */
			sortMode: {
				defaultValue: "clientSide"
			},
			
			/**
			 * 将表格中的行选择状态与记录中的哪一个属性关联起来。
			 * <p>
			 * 一旦设置了此属性，Dorado会自动的根据行的选择状态来维护数据实体中的这个属性的值，
			 * 并且当这个属性的值发生变化时也会自动影响到表格的行选择状态。
			 * </p>
			 * <p>
			 * 此属性的数据类型应该为boolean。
			 * 另外，根据{@link dorado.Entity}的定义，如果该属性的名称是以'$'开头的，
			 * 那么该属性值的改变是不会引起数据实体的状态发生变化的。
			 * </p>
			 * @type String
			 * @attribute skipRefresh wirteBeforeReady
			 */
			rowSelectionProperty: {
				skipRefresh: true,
				wirteBeforeReady: true
			},
			
			/**
			 * 当前数据实体。
			 * @type dorado.Entity
			 * @attribute readOnly
			 */
			currentEntity: {
				readOnly: true,
				getter: function() {
					return this.getCurrentEntity();
				}
			}
		},
		
		createItemModel: function() {
			return new ItemModel(this);
		},
		
		createInnerGrid: function(fixed) {
			return new dorado.widget.grid.InnerDataGrid(this, fixed);
		},
		
		/**
		 * 设置某记录对应的数据实体对应的当前行。
		 * @param {dorado.Entity} entity 数据实体。
		 */
		setCurrentEntity: function(entity) {
			var retValue = this._innerGrid.setCurrentEntity(entity);
			if (this._domMode == 2) this._fixedInnerGrid.setCurrentEntity(entity);
			return retValue;
		},
		
		getCurrentEntity: function() {
			return this._innerGrid.getCurrentItem();
		},
		
		addColumn: function() {
			var column = $invokeSuper.call(this, arguments);
			if (this._autoCreateColumns &&
			(column instanceof dorado.widget.grid.DataColumn && column._property && column._property != "none" ||
			column instanceof dorado.widget.grid.ColumnGroup)) {
				var watcher = this.getAttributeWatcher();
				if (watcher.getWritingTimes("autoCreateColumns") == 0) {
					this._autoCreateColumns = false;
				}
			}
			return column;
		},
		
		initColumns: function(dataType) {
		
			function doInitColumns(cols, dataType) {
				for (var i = 0; i < cols.length; i++) {
					var col = cols[i];
					if (col instanceof dorado.widget.grid.ColumnGroup) {
						doInitColumns(col._columns.items, dataType);
					} else if (col._propertyPath) {
						var subDataType = col._propertyPath.getDataType(dataType);
						col._propertyDef = (subDataType) ? subDataType.getPropertyDef(col._subProperty) : null;
					} else {
						col._propertyDef = (col._property) ? dataType.getPropertyDef(col._property) : null;
					}
					
					if (!col._align && col._propertyDef) {
						var dt = col._propertyDef.get("dataType");
						if (dt && dt._code >= dorado.DataType.PRIMITIVE_INT && dt._code <= dorado.DataType.FLOAT) {
							col.set("align", "right");
						}
					}
				}
			}
			
			if (dataType && (this._dataType != dataType || !this._columnInited)) {
				this._columnInited = true;
				this._dataType = dataType;
				if (dataType) {
					/*generate default columns*/
					var columns = this._columns;
					if (this._autoCreateColumns && !this._defaultColumnsGenerated) {
						this._defaultColumnsGenerated = true;
						
						var self = this, columnsClear = false;
						dataType._propertyDefs.each(function(pd) {
							if (!pd._visible) return;
							
							var column = columns.get(pd._name), columnConfig = {};
							if (column) {
								columns.remove(column);
								columns.append(column);
							}
							
							var t = pd.getDataType(true);
							if (t && (!t._code || !(t instanceof dorado.DataType))) return;
							columnConfig.name = columnConfig.property = pd._name;
							
							if (column) {
								column.set(columnConfig, {
									tryNextOnError: true,
									preventOverwriting: true
								});
							} else {
								if (!columnsClear && columns.size == 1 && columns.get(0)._name == "empty") {
									columns.clear();
									columnsClear = true;
								}
								
								self.addColumn(new dorado.widget.grid.DataColumn(columnConfig));
							}
						});
					}
					doInitColumns(columns.items, dataType);
				}
			}
		},
		
		refreshDom: function(dom) {
			var columnsInited = false;
			if (this._dataSet) {
				var entityList = this.getBindingData({
					firstResultOnly: true,
					acceptAggregation: true
				});
				
				if (entityList) {
					if (!(entityList instanceof dorado.EntityList)) {
						throw new dorado.ResourceException("dorado.grid.BindingTypeMismatch", (this._id || this._uniqueId));
					}
				}
				
				var dataType;
				if (entityList && entityList.dataType) dataType = entityList.dataType.getElementDataType("auto");
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
						if (dataType && dataType instanceof dorado.EntityDataType) {
							self.unbind("onDataTypeRegister", arguments.callee);
							grid._autoCreateColumns = true;
							grid._listeningDataTypeRepository = false;
							grid.initColumns(dataType);
							grid.refresh(true);
						}
					});
				}
				
				var oldItems = this._itemModel.getItems();
				if (oldItems != entityList ||
					(entityList && (entityList.pageNo != this._selectionPageNo || entityList.pageSize != this._selectionPageSize))) {
					this._selectionPageNo = entityList ? entityList.pageNo : 0;
					this._selectionPageSize = entityList ? entityList.pageSize : 0;
					if (this._itemModel.criterions && this._filterMode == "clientSide") {
						this.get("filterEntity").clearData();
					}
					if (this._itemModel.footerEntity && this._itemModel.footerEntity.get("$expired") === undefined) {
						this.get("footerEntity").set("$expired", true);
					}
					this._itemModel.setItems(entityList);
					if (!this._rowSelectionProperty) {
						this.set("selection", null);
					}
				}
			}
            if (this._rowSelectionProperty) {
                var selection = [];
                if (entityList) {
                    var it = entityList.iterator(true);
                    while (it.hasNext()) {
                        var entity = it.next();
                        if (entity.get(this._rowSelectionProperty)) selection.push(entity);
                    }
                }
                this.set("selection", selection);
            }

			if (!columnsInited) this.initColumns();
			$invokeSuper.call(this, arguments);
			
			if (!this._ready && this._dataSet && this._dataSet._loadingData) {
				this.showLoadingTip();
			}
		},
		
		/**
		 * 刷新某数据实体对应的表格行。
		 * @param {dorado.Entity} entity 数据实体
		 */
		refreshEntity: function(entity) {
			if (this._domMode == 2) this._fixedInnerGrid.refreshEntity(entity);
			this._innerGrid.refreshEntity(entity);
			if (this._currentCellEditor && this._currentCellEditor.data == entity) {
				this._currentCellEditor.refresh();
			}
		},
		
		onEntityInserted: function(arg) {
			if (this._domMode == 2) this._fixedInnerGrid.onEntityInserted(arg);
			this._innerGrid.onEntityInserted(arg);
			this.updateScroller(this._innerGrid._container);
		},
		
		onEntityDeleted: function(arg) {
			if (this._domMode == 2) this._fixedInnerGrid.onEntityDeleted(arg);
			this._innerGrid.onEntityDeleted(arg);
			this.updateScroller(this._innerGrid._container);
		},
		
		shouldEditing: function(column) {
			var readOnly = false;
			if (this._dataSet) {
				readOnly = this._dataSet.get("readOnly");
			}
			return !readOnly && $invokeSuper.call(this, [column]);
		},
		
		_doOnKeyDown: function(evt) {
			var retValue = true;
			var items = this._itemModel.getItems();
			switch (evt.keyCode) {
				case 36:{ /* home */
					if (evt.ctrlKey) {
						items.first(this._supportsPaging);
					} else {
						this.setCurrentColumn(this._columnsInfo.dataColumns[0]);
					}
					break;
				}
				case 35:{ /* end */
					if (evt.ctrlKey) {
						items.last(this._supportsPaging);
					} else {
						var columns = this._columnsInfo.dataColumns;
						this.setCurrentColumn(columns[columns.length - 1]);
					}
					break;
				}
				case 38:{ /* up */
					items.previous(this._supportsPaging);
					retValue = false;
					break;
				}
				case 40:{ /* down */
					items.next(this._supportsPaging);
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
							else if (items.hasPrevious()) {
								items.previous(this._supportsPaging);
								i = columns.length - 1;
							} else retValue = true;
						} else {
							if (i < columns.length - 1) i++;
							else if (items.hasNext()) {
								items.next(this._supportsPaging);
								i = 0;
							} else if (this._appendOnLastEnter && items.current) {
								items.insert();
								i = 0;
							} else retValue = true;
						}
					} else {
						i = evt.shiftKey ? (columns.length - 1) : 0;
					}
					this.setCurrentColumn(columns[i]);
					break;
				}
				case 45:{ /* insert */
					items.insert();
					break;
				}
				case 46:{ /* delete */
					if (evt.ctrlKey) {
						items.remove();
					}
					break;
				}
			}
			return retValue;
		},
		
		filterDataSetMessage: function(messageCode, arg) {
			var itemModel = this._itemModel;
			var items = itemModel.getItems();
			switch (messageCode) {
				case dorado.widget.DataSet.MESSAGE_REFRESH:{
					return true;
				}
				
				case dorado.widget.DataSet.MESSAGE_CURRENT_CHANGED:{
					return (!items || arg.entityList == items || dorado.DataUtil.isOwnerOf(items, arg.entityList));
				}
				
				case dorado.widget.DataSet.MESSAGE_DATA_CHANGED:
				case dorado.widget.DataSet.MESSAGE_REFRESH_ENTITY:{
					// 此处items._observer != this._dataSet说明当前Grid中的数据已不再属于DataSet
					var b = (!items || items._observer != this._dataSet ||
					arg.entity.parent == items ||
					dorado.DataUtil.isOwnerOf(items, arg.newValue));
					if (!b && this._columnsInfo.propertyPaths) {
						b = dorado.DataUtil.isOwnerOf(arg.entity, items);
						if (b && arg.property) {
							b = this._columnsInfo.propertyPaths.indexOf('.' + arg.property) > 0;
						}
					}
					return b;
				}
				
				case dorado.widget.DataSet.MESSAGE_DELETED:{
					return (arg.entity.parent == items || dorado.DataUtil.isOwnerOf(items, arg.entity));
				}
				
				case dorado.widget.DataSet.MESSAGE_INSERTED:{
					return (arg.entityList == items);
				}
				
				case dorado.widget.DataSet.MESSAGE_ENTITY_STATE_CHANGED:{
					return (arg.entity.parent == items);
				}
				
				case dorado.widget.DataSet.MESSAGE_LOADING_START:
				case dorado.widget.DataSet.MESSAGE_LOADING_END:{
					if (arg.entityList) {
						return (items == arg.entityList || dorado.DataUtil.isOwnerOf(items, arg.entityList));
					} else if (arg.entity) {
						var asyncExecutionTimes = dorado.DataPipe.MONITOR.asyncExecutionTimes;
						this.getBindingData({
							firstResultOnly: true,
							acceptAggregation: true
						});
						if (dorado.DataPipe.MONITOR.asyncExecutionTimes > asyncExecutionTimes) {
							return true;
						} else {
							this.hideLoadingTip();
							return false;
						}
					} else {
						return true;
					}
				}
				
				default:
					{
						return false;
					}
			}
		},
		
		processDataSetMessage: function(messageCode, arg, data) {
			switch (messageCode) {
				case dorado.widget.DataSet.MESSAGE_REFRESH:{
					this.hideCellEditor();
					if (this._itemModel.groups) this._itemModel.refreshItems();
					else this.refresh(true);
					break;
				}
				case dorado.widget.DataSet.MESSAGE_CURRENT_CHANGED:{
					this.hideCellEditor();
					if (arg.entityList == this._itemModel.getItems()) {
						var oldCurrentEntity = this.getCurrentEntity();
						if (!this._supportsPaging &&
							(oldCurrentEntity && oldCurrentEntity.page && oldCurrentEntity.page.pageNo != arg.entityList.pageNo)) {
							if (this._itemModel.criterions && this._filterMode == "clientSide") {
								this.get("filterEntity").clearData();
								this.filter();
							}
							this.refresh(true);
							this.refreshSummary();
						} else {
							this.setCurrentEntity(arg.entityList.current);
						}
					} else {
						this.refresh(true);
					}
					break;
				}
				case dorado.widget.DataSet.MESSAGE_DATA_CHANGED:{
					var items = this._itemModel.getItems();
					if (!items || items._observer != this._dataSet || dorado.DataUtil.isOwnerOf(items, arg.entity)) {
						this.refresh(true);
					} else {
						var entity = arg.entity;
						if (entity.parent == items) {
							if (this._rowSelectionProperty && !this._processingSelectionChange && this._rowSelectionProperty == arg.property) {
								if (!!arg.newValue != !!arg.oldValue) {
									this._processingSelectionChange = true;
									var removed, added;
									switch (this._selectionMode) {
										case "singleRow":{
											if (arg.newValue) added = arg.entity;
											else removed = arg.entity;
											break;
										}
										case "multiRows":{
											if (arg.newValue) added = [arg.entity];
											else removed = [arg.entity];
											break;
										}
									}
									this._innerGrid.replaceSelection(removed, added);
									this._processingSelectionChange = false;
								}
							}
						}
						if (dorado.DataUtil.isOwnerOf(entity, items)) {
							while (entity.parent != items) {
								entity = entity.parent;
							}
						}
						this.refreshEntity(entity);
						if (!entity.rowType) this.onEntityChanged(entity, arg.property);
						this.refreshSummary();
					}
					break;
				}
				case dorado.widget.DataSet.MESSAGE_REFRESH_ENTITY:{
					var items = this._itemModel.getItems();
					if (!items || items._observer != this._dataSet) {
						this.refresh(true);
					} else {
						if (this._itemModel.groups) {
							this._itemModel.refreshItems();
							this.refresh(true);
						}
						else {
							this.refreshEntity(arg.entity);
						}
					}
					break;
				}
				case dorado.widget.DataSet.MESSAGE_ENTITY_STATE_CHANGED:{
					this.refreshEntity(arg.entity);
					break;
				}
				case dorado.widget.DataSet.MESSAGE_DELETED:{
					if (this._itemModel.groups) {
						this._itemModel.refreshItems();
						this.refresh(true);
					} else {
						var items = this._itemModel.getItems();
						if (items == arg.entityList) {
							this.onEntityDeleted(arg);
							this.refreshSummary();
						} else {
							this.refresh(true);
						}
					}
					break;
				}
				case dorado.widget.DataSet.MESSAGE_INSERTED:{
					if (this._itemModel.groups) {
						this._itemModel.refreshItems();
						this.refresh(true);
					}
					else {
						this.onEntityInserted(arg);
						this.refreshSummary();
					}
					break;
				}
				case dorado.widget.DataSet.MESSAGE_LOADING_START:{
					this.showLoadingTip();
					break;
				}
				case dorado.widget.DataSet.MESSAGE_LOADING_END:{
					this.hideLoadingTip();
					break;
				}
			}
		},
		
		_requirePage: function(pageNo, timeout) {
			var requiredPages = this._requiredPages;
			if (!requiredPages) this._requiredPages = requiredPages = [];
			
			var loadingPages = this._loadingPages;
			if (loadingPages && loadingPages.indexOf(pageNo) >= 0) return;
			
			if (this._loadPageTimerId) {
				clearTimeout(this._loadPageTimerId);
				delete this._loadPageTimerId;
			}
			
			if (requiredPages.indexOf(pageNo) < 0) requiredPages.push(pageNo);
			
			this._loadPageTimerId = $setTimeout(this, function() {
				this._loadingPages = requiredPages;
				delete this._requiredPages;
				
				var items = this._itemModel.getItems();
				for (var i = 0; i < requiredPages.length; i++) {
					items.getPage(requiredPages[i], true, dorado._NULL_FUNCTION);
				}
				this._skipScrollCurrentIntoView = true;
			}, timeout || 20);
		},
		
		_getParentEntityInfo: function() {
			var dataSet = this._dataSet;
			if (!dataSet) return;
			
			if (this._dataPath.match(/\.[\w]*$/)) {
				var i = this._dataPath.lastIndexOf('.');
				var parentDataPath = this._dataPath.substring(0, i);
				var subProperty = this._dataPath.substring(i + 1);
				var parentEntity = dataSet.getData(parentDataPath);
				if (parentEntity && parentEntity instanceof dorado.Entity) {
					var parentDataType = parentEntity.dataType;
					if (parentDataType && parentDataType instanceof dorado.EntityDataType) {
						var propertyDef = parentDataType.getPropertyDef(subProperty);
						if (propertyDef && propertyDef instanceof dorado.Reference) {
							return {
								propertyDef: propertyDef,
								parentEntity: parentEntity,
								subProperty: subProperty
							};
						}
					}
				}
			}
		},
		
		filter: function(criterions) {
		
			function criterionToServerCriterion(criterion, column, dataColumns) {
				var serverCriterion = null;
				if (criterion.junction) {
					var criterions = criterion.criterions;
					if (criterions && criterions.length) {
						serverCriterion = {
							junction: criterion.junction,
							criterions: []
						};
						
						for (var i = 0; i < criterions.length; i++) {
							var c = criterions[i];
							if (c != null) serverCriterion.criterions.push(criterionToServerCriterion(c, column, dataColumns));
						}
					}
				} else {
					var property;
					if (!column) {
						if (!criterion.property) {
							throw new dorado.ResourceException("dorado.list.CriterionPropertyUndefined");
						}
						
						property = criterion.property;
						column = getColumn(dataColumns, property);
					}
					else {
						property = column._property;
					}
					
					var dataType = (column ? column.get("dataType") : null), expression = "";
					
					if (criterion.operator && criterion.operator.indexOf("like") < 0) {
						expression += criterion.operator;
					}
					expression += (dataType ? dataType : dorado.$String).toText(criterion.value);
					if (criterion.operator) {
						if (criterion.operator.startsWith("like")) {
							expression = expression + '*';
						}
						if (criterion.operator.endsWith("like")) {
							expression = '*' + expression;
						}
					}
					
					var pd = column._propertyDef;
					var propertyPath = (pd) ? pd._propertyPath : undefined;
					
					serverCriterion = {
						property: property,
						propertyPath: propertyPath,
						dataType: ((!dataType || dataType instanceof dorado.EntityDataType || dataType instanceof dorado.AggregationDataType) ? undefined : dataType._name),
						expression: expression
					};
				}
				return serverCriterion;
			}
			
			function getColumn(dataColumns, property) {
				for (var i = 0; i < dataColumns.length; i++) {
					var column = dataColumns[i]
					if (column._property == property) {
						return column;
					}
				}
				return null;
			}
			
			function verifyCriterion(criterion, column) {
				if (criterion.junction) {
					var criterions = criterion.criterions;
					if (criterions && criterions.length) {
						for (var i = 0; i < criterions.length; i++) {
							var c = criterions[i];
							if (c != null) verifyCriterion(c, column);
						}
					}
				} else {
					verifyCriterion.property = column._property;
				}
			}
			
			if (this._filterMode == "serverSide") {
				var dataSet = this._dataSet;
				if (!dataSet) return;
				
				var serverCriterions = [], dataColumns = this._columnsInfo.dataColumns;
				if (criterions === undefined) {
					var filterEntity = this._itemModel.filterEntity;
					for (var i = 0; i < dataColumns.length; i++) {
						var column = dataColumns[i];
						if (!column._property || column._property == "none") continue;
						
						var criterion = filterEntity.get(column._property);
						if (criterion) {
							var serverCriterion = criterionToServerCriterion(criterion, column, null);
							if (serverCriterion.junction && serverCriterion.junction != "or") {
								serverCriterions = serverCriterions.concat(serverCriterion.criterions);
							} else {
								serverCriterions.push(serverCriterion);
							}
						}
					}
				} else {
					for (var i = 0; i < criterions.length; i++) {
						var serverCriterion = criterionToServerCriterion(criterions[i], null, dataColumns);
						if (serverCriterion.junction && serverCriterion.junction != "or") {
							serverCriterions = serverCriterions.concat(serverCriterion.criterions);
						} else {
							serverCriterions.push(serverCriterion);
						}
					}
				}
				
				var parentEntityInfo, hostObject;
				if (this._dataPath) {
					parentEntityInfo = this._getParentEntityInfo();
					if (!parentEntityInfo) {
						throw new dorado.Exception("Can not perform server side filter on DataPath \"" + this._dataPath + "\"");
					}
					hostObject = parentEntityInfo.propertyDef;
				} else {
					hostObject = dataSet;
				}
				
				var sysParameter = hostObject._sysParameter;
				if (!sysParameter) hostObject._sysParameter = sysParameter = new dorado.util.Map();
				var criteria = sysParameter.get("criteria") || {};
				criteria.criterions = serverCriterions;
				if (!(criteria.criterions || criteria.criterions.length || criteria.orders || criteria.orders.length)) criteria = null;
				sysParameter.put("criteria", criteria);
				
				if (parentEntityInfo) {
					parentEntityInfo.parentEntity.reset(parentEntityInfo.subProperty);
				} else {
					dataSet.flushAsync();
				}
			} else {
				return $invokeSuper.call(this, arguments);
			}
		},
		
		sort: function(column, desc) {
			var itemModel = this._itemModel;
			if (this._sortMode == "serverSide") {
				var dataSet = this._dataSet;
				if (!dataSet) return;
				
				var parentEntityInfo, hostObject;
				if (this._dataPath) {
					parentEntityInfo = this._getParentEntityInfo();
					if (!parentEntityInfo) {
						throw new dorado.Exception("Can not perform server side sort on DataPath \"" + this._dataPath + "\"");
					}
					hostObject = parentEntityInfo.propertyDef;
				} else {
					hostObject = dataSet;
				}
				
				var sysParameter = hostObject._sysParameter;
				if (!sysParameter) hostObject._sysParameter = sysParameter = new dorado.util.Map();
				var criteria = sysParameter.get("criteria") || {};
				if (column) {
					criteria.orders = orders = [{
						property: column._property,
						desc: desc
					}];
				} else if (parameter instanceof dorado.util.Map) {
					delete criteria.orders;
				}
				if (!(criteria.criterions && criteria.criterions.length || criteria.orders && criteria.orders.length)) criteria = null;
				sysParameter.put("criteria", criteria);
				
				var dataColumns = this._columnsInfo.dataColumns, grid = this;
				function setSortFlags() {
					var sortOrderMap = {};
					for (var i = 0; i < orders.length; i++) {
						var order = orders[i];
						if (order.property) sortOrderMap[order.property] = !!order.desc;
					}
					for (var i = 0; i < dataColumns.length; i++) {
						var column = dataColumns[i], desc = sortOrderMap[column._property];
						if (desc === undefined) {
							column.set("sortState", null);
						} else {
							column.set("sortState", desc ? "desc" : "asc");
						}
					}
					grid._skipClearSortFlags = true;
				}
				
				if (parentEntityInfo) {
					parentEntityInfo.parentEntity.reset(parentEntityInfo.subProperty);
					parentEntityInfo.parentEntity.getAsync(parentEntityInfo.subProperty, setSortFlags);
				} else {
					dataSet.flushAsync(setSortFlags);
				}
			} else {
				return $invokeSuper.call(this, arguments);
			}
		}
	});
	
	var DataListBoxProtoType = dorado.widget.DataListBox.prototype;
	
	dorado.widget.grid.InnerDataGrid = $extend(dorado.widget.grid.AbstractInnerGrid, {
		$className: "dorado.widget.grid.InnerDataGrid",
		
		EVENTS: {
			onSelectionChange: {
				interceptor: function(superFire, self, arg) {
					var grid = self.grid;
					if (this._duringRefreshDom || grid._duringRefreshDom) return;

					var retval = superFire(self, arg);
					if (!self.fixed && grid._rowSelectionProperty && !grid._processingSelectionChange) {
						grid._processingSelectionChange = true;
						try {
							var property = grid._rowSelectionProperty, removed = arg.removed, added = arg.added;
							var selectionMode = grid._selectionMode;
							switch (selectionMode) {
								case "singleRow":{
									removed = self.get("selection");
									if (removed) removed.set(property, false);
									if (added) added.set(property, true);
									break;
								}
								case "multiRows":{
									if (removed instanceof Array && removed.length == 0) removed = null;
									if (added instanceof Array && added.length == 0) added = null;
									if (removed == added) return;
									
									if (removed) {
										if (!(removed instanceof Array)) {
											removed = [removed];
										}
										for (var i = 0; i < removed.length; i++) {
											removed[i].set(property, false);
										}
									}
									if (added) {
										for (var i = 0; i < added.length; i++) {
											added[i].set(property, true);
										}
									}
									break;
								}
							}
						}
						finally {
							grid._processingSelectionChange = false;
						}
					}
					return retval;
				}
			}
		},
		
		getCurrentItem: DataListBoxProtoType.getCurrentItem,
		getCurrentItemId: DataListBoxProtoType.getCurrentItemId,
		getRealCurrentItemId: DataListBoxProtoType.getRealCurrentItemId,
		refreshEntity: DataListBoxProtoType.refreshEntity,
		refreshItemDom: DataListBoxProtoType.refreshItemDom,
		onEntityDeleted: DataListBoxProtoType.onEntityDeleted,
		onEntityInserted: DataListBoxProtoType.onEntityInserted,
		
		_adjustBeginBlankRow: DataListBoxProtoType._adjustBeginBlankRow,
		_adjustEndBlankRow: DataListBoxProtoType._adjustEndBlankRow,
		
		setCurrentItemDom: function(row) {
			var entity = (row ? $fly(row).data("item") : null);
			if (entity) {
				if (entity.dummy) {
					this.grid._requirePage(entity.page.pageNo);
				}
				if (entity.rowType) return;
			}
			return DataListBoxProtoType.setCurrentItemDom.apply(this, arguments);
		},
		
		setCurrentRowByItemId: function(itemId) {
			if (!this._itemDomMap) return;
			var row = (itemId == null) ? null : this._itemDomMap[itemId];
			var item = row ? $fly(row).data("item") : null;
			var entityList = this._itemModel.getItems();
			entityList.setCurrent(item);
			if (entityList.current == item) {
				this.setCurrentEntity(item);
			}
		},
		
		setCurrentEntity: function(entity) {
			var retValue = DataListBoxProtoType.setCurrentEntity.apply(this, arguments);
			this.grid.doInnerGridSetCurrentRow(this, entity ? this._itemModel.getItemId(entity) : null);
			return retValue;
		},
		
		doRefreshItemDomData: function(row, item) {
			$invokeSuper.call(this, arguments);
			row.dummy = item.dummy;
			if (row.dummy) {
				row.pageNo = item.page.pageNo;
				if (this._requiredPages) this._requiredPages.push(row.pageNo);
			}
			$fly(row).toggleClass("dummy-row", !!row.dummy);
		},

		refreshContent: function(container) {
			this._requiredPages = [];
			$invokeSuper.call(this, arguments);
			for (var i = 0; i < this._requiredPages.length; i++) {
				this.grid._requirePage(this._requiredPages[i]);
			}
		},
		
		refreshViewPortContent: function(container) {
			this._requiredPages = [];
			$invokeSuper.call(this, arguments);
			for (var i = 0; i < this._requiredPages.length; i++) {
				this.grid._requirePage(this._requiredPages[i]);
			}
		},

		doOnYScroll: function() {
			if (this._scrollMode == "lazyRender") {
				this._requiredPages = [];
				$invokeSuper.call(this, arguments);
				for (var i = 0; i < this._requiredPages.length; i++) {
					this.grid._requirePage(this._requiredPages[i]);
				}
			}
			else {
				$invokeSuper.call(this, arguments);
			}
		}
		
	});
	
})();

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
	 * @name dorado.widget.grid
	 * @namespace 表格控件所使用的一些相关类的命名空间。
	 */
	dorado.widget.grid = {};

	dorado.widget.grid.ColumnList = $extend(dorado.util.KeyedArray, {
		$className: "dorado.widget.grid.ColumnList",

		constructor: function(parent) {
			$invokeSuper.call(this, [dorado._GET_NAME]);
			this.parent = parent;
		},

		destroy: function() {
			var items = this.items;
			for(var i = 0, len = items.length; i < len; i++) {
				items[i].destroy();
			}
		},

		updateGridColumnModelTimestamp: function() {
			var p = this.parent;
			while(p) {
				if (p instanceof dorado.widget.AbstractGrid) {
					p._columnModelTimestamp = dorado.Core.getTimestamp();
					;
					return;
				}
				p = p._parent;
			}
		},

		beforeInsert: function(column) {
			column._parent = this.parent;
			this.updateGridColumnModelTimestamp();
		},

		beforeRemove: function(column) {
			delete column._parent;
			this.updateGridColumnModelTimestamp();
		}
	});

	/**
	 * @author Benny Bao (mailto:benny.bao@bstek.com)
	 * @class 表格的列模型。
	 * <p>表格的列模型是用于辅助表格控件管理其中的列信息的对象。</p>
	 * <p>
	 * ColumnModel的get方法在{@link dorado.AttributeSupport#get}的基础上做了增强。
	 * 除了原有的读取属性值的功能之外，此方法还另外提供了下面的用法。
	 * <ul>
	 *    <li>当传入一个以#开头的字符串时，#后面的内容将被识别成列的名称，表示根据名称获取表格列。参考{@link dorado.widget.grid.ColumnModel#getColumn}。</li>
	 * </ul>
	 * </p>
	 * @abstract
	 * @extends dorado.AttributeSupport
	 */
	dorado.widget.grid.ColumnModel = $extend(dorado.AttributeSupport, /** @scope dorado.widget.grid.ColumnModel.prototype */ {
		$className: "dorado.widget.grid.ColumnModel",

		ATTRIBUTES: /** @scope dorado.widget.grid.ColumnModel.prototype */ {
			/**
			 * 子列集合。
			 * <p>
			 * 此属性在读写时的意义不完全相同。
			 * <ul>
			 * <li>当读取时返回组中的子列的集合，类型为{@link dorado.util.KeyedArray}。</li>
			 * <li>
			 * 当写入时用于向组中添加列。<br>
			 * 此处数组中既可以放入表格列({@link dorado.widget.grid.Column})的实例，又可以放入JSON对象，甚至可以是用字符串描述的列。
			 * 具体请参考{@link dorado.widget.grid.ColumnModel#addColumns}。
			 * </li>
			 * </ul>
			 * </p>
			 * @type dorado.widget.grid.Column[]|dorado.util.KeyedArray
			 * @attribute
			 * @see dorado.widget.grid.ColumnModel#addColumns
			 *
			 * @example
			 * // 向表格中添加两个列
			 * group.set("columns", [ {
			 *	 name : "id",
			 *	 property : "prop1",
			 *	 readOnly : true
			 * }, {
			 *	 name : "name",
			 *	 property : "prop2"
			 * } ]);
			 */
			columns: {
				setter: function(v) {
					this.addColumns(v);
				}
			}
		},

		destroy: function() {
			this._columns.destroy();
		},

		doGet: function(attr) {
			var c = attr.charAt(0);
			if (c == '#' || c == '&') {
				var col = attr.substring(1);
				return this.getColumn(col);
			}
			else {
				return $invokeSuper.call(this, [attr]);
			}
		},

		/**
		 * 添加一个表格列。
		 * <p>
		 * 此处有三种方式可用于定义表格列：
		 *    <ul>
		 *    <li>直接传入一个表格列的实例对象。</li>
		 *    <li>传入含表格列信息的JSON对象。<br>
		 * 此时可以使用子控件类型名称中"dorado.widget.grid"和"Column"之间的部分作为$type的简写。<br>
		 * 另外，如果没有显式的定义$type，系统也会自动判断具体的列类型。
		 *        <ul>
		 *        <li>如果JSON对像中包含columns属性的定义，那么该对象将被实例化为{@link dorado.widget.grid.ColumnGroup}。</li>
		 *        <li>其他情况下该对象将被实例化为{@link dorado.widget.grid.DataColumn}。</li>
		 *        </ul>
		 *    </li>
		 *    <li>传入一个字符串，系统会将此字符床识别为$type，并依次创建具体的表格列。</li>
		 *    </ul>
		 * </p>
		 * @param {dorado.widget.grid.Column|Object|String} columnConfig 表格列或含表格列信息的JSON对象。
		 * @param {String} [insertMode] 插入模式。
		 * @param {dorado.widget.grid.Column} [refColumn] 参照表格列。
		 * @return {dorado.widget.grid.Column} 新插入的表格列。
		 * @see dorado.Toolkits.createInstance
		 * @see dorado.util.KeyedList#insert
		 */
		addColumn: function(columnConfig, insertMode, refColumn) {
			var column;
			if (columnConfig instanceof dorado.widget.grid.Column) {
				column = columnConfig;
			}
			else {
				if (!columnConfig.name && columnConfig.property) {
					var name = columnConfig.property;
					if (this.getColumn(name)) {
						var j = 2;
						while(!this.getColumn(name + '_' + j)) {
							j++;
						}
						name = name + '_' + j;
					}
					columnConfig.name = name;
				}

				column = dorado.Toolkits.createInstance("gridcolumn", columnConfig, function(type) {
					if (type) return dorado.util.Common.getClassType("dorado.widget.grid." + type + "Column", true);
					return (columnConfig.columns && columnConfig.columns.length) ? dorado.widget.grid.ColumnGroup : dorado.widget.grid.DataColumn;
				});
			}
			this._columns.insert(column, insertMode, refColumn);
			if (this._grid) this._grid.registerInnerViewElement(column);
			column.set("grid", this._grid);
			return column;
		},

		/**
		 * 通过包含子列信息的JSON对象自动初始化所有子列。
		 * @param {Object[]} columnConfigs 包含子列信息的JSON对象数组。
		 */
		addColumns: function(columnConfigs) {
			for(var i = 0; i < columnConfigs.length; i++) {
				this.addColumn(columnConfigs[i]);
			}
		},

		/**
		 * 删除一个表格列。
		 * @param {dorado.widget.grid.Column} column 要删除的表格列。
		 */
		removeColumn: function(column) {
			this._columns.remove(column);
			if (this._grid) this._grid.unregisterInnerViewElement(column);
			column.set("grid", null);
		},

		/**
		 * 删除所有表格列。
		 */
		removeAllColumns: function() {
			var columns = this._columns.items;
			for(var i = columns.length - 1; i >= 0; i--) {
				this.removeColumn(columns[i]);
			}
		},

		/**
		 * 根据名称返回相应的表格列。
		 * @param {String} name 表格列的名称。
		 * @return {dorado.widget.grid.Column} 表格列。
		 */
		getColumn: function(name) {
			return this._columns.get(name);
		},

		/**
		 * 按照列名寻找表格列（包含组合列中的子列）。
		 * @param {Object} name 列名。
		 * @return {dorado.widget.grid.Column[]} 找到的表格列的数组。
		 */
		findColumns: function(name) {

			function doFindColumns(column, name, result) {
				var cols = column._columns.items;
				for(var i = 0; i < cols.length; i++) {
					var col = cols[i];
					if (col._name == name) result.push(col);
					if (col instanceof dorado.widget.grid.ColumnGroup) doFindColumns(col, name, result);
				}
			}

			var result = [];
			doFindColumns(this, name, result);
			return result;
		},

		getColumnsInfo: function(fixedColumnCount) {

			function getStructure(structure, cols, row) {
				if (structure.length <= row) {
					structure.push([]);
					if (row >= maxRowCount) maxRowCount = row + 1;
				}

				var cells = structure[row];
				for(var i = 0; i < cols.length; i++) {
					var col = cols[i];
					if (!col._visible) continue;
					idMap[col._uniqueId] = col;
					var cell = {
						column: col,
						row: row,
						colSpan: 1,
						rowSpan: 0,
						topColIndex: topColIndex
					};
					if (col instanceof dorado.widget.grid.ColumnGroup) {
						var oldDataCellCount = dataColCount;
						getStructure(structure, col._columns.items, row + 1);
						cell.colSpan = dataColCount - oldDataCellCount;
						cell.rowSpan = 1;
					}
					else {
						dataColCount++;
						dataColumnInfos.push(cell);
					}
					if (row == 0) topColIndex++;
					cells.push(cell);
				}
			}

			function extractStructure(structure, start, end) {
				var subStruct = [];
				if (end == undefined) end = Number.MAX_VALUE;
				for(var i = 0; i < structure.length; i++) {
					var row = structure[i], subRow = [];
					for(var j = 0; j < row.length; j++) {
						var col = row[j];
						if (col.topColIndex >= start && col.topColIndex <= end) subRow.push(col);
					}
					subStruct.push(subRow);
				}
				return subStruct;
			}

			function extractDataColumns(dataColumnInfos, start, end) {
				var dataCols = [];
				if (end == undefined) end = Number.MAX_VALUE;
				for(var i = 0; i < dataColumnInfos.length; i++) {
					var col = dataColumnInfos[i];
					if (col.topColIndex >= start && col.topColIndex <= end) dataCols.push(col.column);
				}
				return dataCols;
			}

			var cols = this._columns.items, topColIndex = 0, dataColCount = 0, maxRowCount = 0;
			var idMap = {}, fixedColumns, mainColumns = {}, dataColumnInfos = [];

			var tempStruct = [];
			getStructure(tempStruct, cols, 0);

			fixedColumnCount = fixedColumnCount || 0;
			if (fixedColumnCount > 0) {
				fixedColumns = {};
				fixedColumns.structure = extractStructure(tempStruct, 0, fixedColumnCount - 1);
				fixedColumns.dataColumns = extractDataColumns(dataColumnInfos, 0, fixedColumnCount - 1);
			}

			mainColumns.structure = extractStructure(tempStruct, fixedColumnCount);
			mainColumns.dataColumns = extractDataColumns(dataColumnInfos, fixedColumnCount);

			var allDataColumns = [], propertyPaths = [];
			for(var i = 0; i < dataColumnInfos.length; i++) {
				var col = dataColumnInfos[i], column = col.column;
				allDataColumns.push(col.column);
				if (column._property && column._property.indexOf('.') > 0) {
					propertyPaths.push(column._property);
				}
			}

			return {
				idMap: idMap,
				fixed: fixedColumns,
				main: mainColumns,
				dataColumns: allDataColumns,
				propertyPaths: (propertyPaths.length ? propertyPaths.join(',') : undefined)
			};
		}
	});

	/**
	 * @author Benny Bao (mailto:benny.bao@bstek.com)
	 * @class 默认的表格列头渲染器。
	 * @extends dorado.Renderer
	 */
	dorado.widget.grid.DefaultCellHeaderRenderer = $extend(dorado.Renderer, /** @scope dorado.widget.grid.DefaultCellHeaderRenderer.prototype */{

		/**
		 * 渲染。
		 * @param {HTMLElement} dom 表格列头对应的DOM对象。
		 * @param {Object} arg 渲染参数。
		 * @param {dorado.widget.grid.AbstractGrid} arg.grid 对应的表格。
		 * @param {dorado.widget.grid.Column} arg.column 对应的表格列。
		 */
		render: function(dom, arg) {
			var grid = arg.grid, column = arg.column, cell = dom.parentNode, label;
			if (dom.childNodes.length == 1) {
				label = dom.firstChild;
			}
			else {
				$fly(dom).empty();
				label = $DomUtils.xCreate({
					tagName: "LABEL",
					className: "caption"
				});
				dom.appendChild(label);
			}
			label.innerText = column.get("caption") || "";

			if (column instanceof dorado.widget.grid.DataColumn) {
				$fly(label).toggleClass("caption-required", !!column.get("required") && grid.shouldEditing(column));

				var sortState = column.get("sortState"), sortIndicator;
				if (sortState) {
					sortIndicator = $DomUtils.xCreate({
						tagName: "LABEL",
						className: "sort-state sort-state-" + sortState
					});
				}
				if (sortIndicator) dom.appendChild(sortIndicator);
			}
		}
	});

	/**
	 * @author Benny Bao (mailto:benny.bao@bstek.com)
	 * @class 表格列的抽象类。
	 * @abstract
	 * @extends dorado.widget.ViewElement
	 * @param {Object} [config] 包含表格列配置信息的JSON对象。
	 */
	dorado.widget.grid.Column = $extend(dorado.widget.ViewElement, /** @scope dorado.widget.grid.Column.prototype */ {
		$className: "dorado.widget.grid.Column",

		/**
		 * @name dorado.widget.grid.Column#id
		 * @property
		 * @protected
		 * @description 由系统分配的列id。
		 * @type String
		 */
		// =====

		ATTRIBUTES: /** @scope dorado.widget.grid.Column.prototype */ {

			/**
			 * 所属的表格。
			 * @type dorado.widget.grid.AbstractGrid
			 * @attribute readOnly
			 */
			grid: {},

			/**
			 * 列名称。
			 * @type String
			 * @attribute writeOnce
			 */
			name: {
				writeOnce: true
			},

			/**
			 * 列标题。
			 * @type String
			 * @attribute
			 */
			caption: {
				getter: function() {
					var caption = this._caption;
					if (caption == null) caption = this._name;
					return caption;
				}
			},

			/**
			 * 父列。
			 * @type dorado.widget.grid.GroupColumn
			 * @attribute
			 */
			parent: {},

			/**
			 * 列头中内容的水平对齐方式。 取值范围如下：
			 * <ul>
			 * <li>left</li>
			 * <li>center</li>
			 * <li>right</li>
			 * </ul>
			 * @type String
			 * @attribute
			 */
			headerAlign: {
				defaultValue: "center"
			},

			/**
			 * 列头的渲染器。
			 * @type dorado.Renderer
			 * @attribute
			 */
			headerRenderer: {},

			/**
			 * 是否可见。
			 * @type boolean
			 * @attribute
			 * @default true
			 */
			visible: {
				defaultValue: true
			},

			/**
			 * 是否支持选项菜单。
			 * @type boolean
			 * @attribute skipRefresh
			 * @default true
			 */
			supportsOptionMenu: {
				skipRefresh: true,
				defaultValue: true
			}
		},

		EVENTS: /** @scope dorado.widget.grid.Column.prototype */ {
			/**
			 * 当系统渲染列头时触发的事件。
			 * @param {Object} self 事件的发起者，即列本身。
			 * @param {Object} arg 事件参数。
			 * @param {dorado.widget.grid.Column} arg.column 表格列。
			 * @param {HTMLElement} arg.dom 列头对应的DOM对象。
			 * @param {boolean} #arg.processDefault 是否在事件结束后继续使用系统默认的渲染逻辑。
			 * @return {boolean} 是否要继续后续事件的触发操作，不提供返回值时系统将按照返回值为true进行处理。
			 * @event
			 */
			onRenderHeaderCell: {},

			/**
			 * 当用户点击列头时触发的事件。
			 * @param {Object} self 事件的发起者，即组件本身。
			 * @param {Object} arg 事件参数。
			 * @param {dorado.widget.grid.Column} arg.column 表格列。
			 * @param {boolean} #arg.processDefault=true 是否在事件结束后继续执行系统默认的逻辑，即排序逻辑。
			 * @return {boolean} 是否要继续后续事件的触发操作，不提供返回值时系统将按照返回值为true进行处理。
			 * @event
			 */
			onHeaderClick: {}
		},

		constructor: function(config) {
			$invokeSuper.call(this, [config]);
			if (!this._name) this._name = this._uniqueId;
		},

		destroy: function() {
		},

		doSet: function(attr, value) {
			$invokeSuper.call(this, [attr, value]);

			var grid = this._grid;
			if (grid && grid._rendered) {
				var def = this.ATTRIBUTES[attr];
				if (def && !def.skipRefresh) grid.refresh(true);
			}
		}
	});

	/**
	 * @author Benny Bao (mailto:benny.bao@bstek.com)
	 * @class 抽象的表格行渲染器。
	 * @abstract
	 * @extends dorado.Renderer
	 */
	dorado.widget.grid.RowRenderer = $extend(dorado.Renderer, /** @scope dorado.widget.grid.RowRenderer.prototype */ {

		/**
		 * @name dorado.widget.grid.RowRenderer#doRender
		 * @protected
		 * @param {HTMLElement} dom 表格行对应的DOM对象。
		 * @param {Object} arg 渲染参数。
		 * @param {dorado.widget.grid.AbstractGrid} arg.grid 对应的表格。
		 * @param {Object|dorado.Entity} arg.data 对应的数据实体。
		 * 内部的渲染方法，供复写。
		 */
		// =====

		rebuildRow: function(grid, innerGrid, row, rowType) {
			var dataColumns = innerGrid._columnsInfo.dataColumns, len = dataColumns.length, oldRowType = row.rowType, $row = jQuery(row);
			if (oldRowType == "header") $row.empty();
			$row.toggleClass("group-header-row", (rowType == "header")).toggleClass("group-footer-row", (rowType == "footer"));
			if (rowType == "header") {
				$row.empty();
				var cell = innerGrid.createCell();
				cell.colSpan = len;
				row.appendChild(cell);
			}
			else {
				$fly(row).empty();
				for(var i = 0; i < len; i++) {
					$DomUtils.getOrCreateChild(row, i, innerGrid.createCell);
				}
				row.columnModelTimestamp = grid._columnModelTimestamp;
			}
			if (rowType) {
				row.rowType = rowType;
			}
			else {
				row.removeAttribute("rowType");
			}
		},

		/**
		 * 渲染。
		 * <p><b>如有需要应在子类中复写doRender方法，而不是此方法。</b></p>
		 * @param {HTMLElement} dom 表格行对应的DOM对象。
		 * @param {Object} arg 渲染参数。
		 * @param {dorado.widget.grid.AbstractGrid} arg.grid 对应的表格。
		 * @param {Object|dorado.Entity} arg.data 对应的数据实体。
		 * @see dorado.widget.grid.RowRenderer#doRender
		 */
		render: function(row, arg) {
			var grid = arg.grid, innerGrid = arg.innerGrid, entity = arg.data, dataColumns = innerGrid._columnsInfo.dataColumns;
			var shouldRebuild = (row.rowType != entity.rowType || row.columnModelTimestamp != grid._columnModelTimestamp);
			if (!shouldRebuild) {
				shouldRebuild = (entity.rowType != "header" && row.cells.length != dataColumns.length) ||
					(entity.rowType == "header" && row.firstChild.colSpan != dataColumns.length);
			}
			if (shouldRebuild) {
				this.rebuildRow(grid, innerGrid, row, entity.rowType);
			}
			this.doRender(row, arg);
		}
	});

	/**
	 * @author Benny Bao (mailto:benny.bao@bstek.com)
	 * @class 默认的表格行渲染器。
	 * @extends dorado.widget.grid.RowRenderer
	 */
	dorado.widget.grid.DefaultRowRenderer = $extend(dorado.widget.grid.RowRenderer, /** @scope dorado.widget.grid.DefaultRowRenderer.prototype */ {

		/**
		 * 渲染一个单元格。
		 * @protected
		 * @param {dorado.Renderer} cellRenderer 单元格渲染器。
		 * @param {HTMLElement} dom 单元格对应的DOM对象。
		 * @param {Object} arg 渲染参数。
		 * @param {dorado.widget.grid.AbstractGrid} arg.grid 对应的表格。
		 * @param {Object|dorado.Entity} arg.data 对应的数据实体。
		 * @param {dorado.widget.grid.Column} arg.column 对应的表格列。
		 */
		renderCell: function(cellRenderer, dom, arg) {
			var grid = arg.grid, column = arg.column, entity = arg.data, processDefault = true, eventArg = {
				dom: dom,
				data: entity,
				column: column,
				rowType: entity.rowType,
				cellRenderer: cellRenderer,
				processDefault: false
			};
			if (grid.getListenerCount("onRenderCell")) {
				grid.fireEvent("onRenderCell", grid, eventArg);
				processDefault = eventArg.processDefault;
			}
			if (processDefault) {
				cellRenderer = eventArg.cellRenderer;
				if (column.getListenerCount("onRenderCell")) {
					eventArg.processDefault = false;
					column.fireEvent("onRenderCell", column, eventArg);
					processDefault = eventArg.processDefault;
				}
				if (processDefault) {
					cellRenderer = eventArg.cellRenderer;
					dorado.Renderer.render(cellRenderer, dom, arg);
				}
			}
		},

		doRender: function(row, arg) {
			if (row._lazyRender) return;
			var grid = arg.grid, innerGrid = arg.innerGrid, entity = arg.data, dataColumns = innerGrid._columnsInfo.dataColumns;
			var rowHeightInfos = grid._rowHeightInfos, itemId = row._itemId, oldHeight;
			if (grid._dynaRowHeight) {
				if (innerGrid.fixed) {
					/*
					 if (dorado.Browser.webkit || (dorado.Browser.msie && dorado.Browser.version > 8)) {
					 oldHeight = row.firstChild.clientHeight;
					 } else {
					 */
					oldHeight = row.clientHeight;
				}
				else if (rowHeightInfos) {
					oldHeight = rowHeightInfos.rows[itemId];
				}

				row.style.height = "";
				if (dorado.Browser.msie && dorado.Browser.version == 8) {
					$fly(row).addClass("fix-valign-bug");
				}
				/*
				 else if (dorado.Browser.webkit || (dorado.Browser.msie && dorado.Browser.version > 8)) {
				 row.firstChild.style.height = '';
				 }
				 */
			}

			for(var i = 0; i < dataColumns.length; i++) {
				var col = dataColumns[i];
				var cell = row.cells[i];

				var label = cell.firstChild;
				if (grid._dynaRowHeight && col._dynaRowHeight) {
					label.style.overflowY = "visible";
					cell.style.height = grid._rowHeight + "px";
				}
				else {
					cell.style.height = '';
					label.style.height = (grid._rowHeight - 1) + "px";
				}

				if (col instanceof dorado.widget.grid.DataColumn) {
					label.style.width = col._realWidth + "px";
				}

				var align = '', renderer = col._renderer || grid._cellRenderer;
				if (!renderer) {
					var dt = col.get("dataType");
					var dtCode = dt ? dt._code : -1;
					if (dtCode == dorado.DataType.PRIMITIVE_BOOLEAN || dtCode == dorado.DataType.BOOLEAN) {
						var pd = col._propertyDef;
						if (pd && pd._mapping) {
							renderer = $singleton(dorado.widget.grid.DefaultCellRenderer);
						}
						else {
							renderer = $singleton(dorado.widget.grid.CheckBoxCellRenderer);
							align = "center";
						}
					}
					else {
						renderer = $singleton(dorado.widget.grid.DefaultCellRenderer);
					}
				}

				cell.align = col._align || align || "left";
				this.renderCell(renderer, label, {
					grid: grid,
					innerGrid: arg.innerGrid,
					data: entity,
					column: col
				});
				cell.colId = col._uniqueId;
			}

			if (grid._dynaRowHeight) {
				var h = row.clientHeight;
				/*
				 if (dorado.Browser.webkit || (dorado.Browser.msie && dorado.Browser.version > 8)) {
				 h = row.firstChild.scrollHeight;
				 } else {
				 h = row.clientHeight;
				 }
				 */

				if (oldHeight != h) {
					if (!grid.xScroll || !grid.yScroll) grid.notifySizeChange();
				}

				if (grid._realFixedColumnCount && rowHeightInfos) {
					if (innerGrid.fixed) {
						rowHeightInfos.rows[itemId] = h;
						rowHeightInfos.unfound[itemId] = true;
					}
					else if (oldHeight != h) {
						delete rowHeightInfos.unfound[itemId];
						var fh = rowHeightInfos.rows[itemId];
						if (h > fh) {
							rowHeightInfos.rows[itemId] = h;
							rowHeightInfos.unmatched.push(itemId);
							if (!innerGrid._duringRefreshDom) {
								grid._fixedInnerGrid.syncroRowHeight(itemId);
							}
						}
						else if (fh > 0) {
							if (dorado.Browser.msie && dorado.Browser.version == 8) {
								row.style.height = fh + "px";
								$fly(row).toggleClass("fix-valign-bug");
							}
							else {
								row.style.height = fh + "px";
							}
							/*
							 else if (dorado.Browser.webkit || (dorado.Browser.msie && dorado.Browser.version > 8)) {
							 row.firstChild.style.height = fh + "px";
							 }
							 */
						}
					}
				}
			}
		}
	});

	/**
	 * @author Benny Bao (mailto:benny.bao@bstek.com)
	 * @class 抽象的表格单元格渲染器。
	 * @abstract
	 * @extends dorado.Renderer
	 */
	dorado.widget.grid.CellRenderer = $extend(dorado.Renderer, /** @scope dorado.widget.grid.CellRenderer.prototype */{

		/**
		 * @name dorado.widget.grid.RowRenderer#doRender
		 * @protected
		 * @param {HTMLElement} dom 单元格对应的DOM对象。
		 * @param {Object} arg 渲染参数。
		 * @param {dorado.widget.grid.AbstractGrid} arg.grid 对应的表格。
		 * @param {Object|dorado.Entity} arg.data 对应的数据实体。
		 * @param {dorado.widget.grid.Column} arg.column 对应的表格列。
		 * 内部的渲染方法，供复写。
		 */
		// =====

		/**
		 * 返回单元格中要显示的文本。
		 * @protected
		 * @param {Object} entity 对应的数据实体。
		 * @param {Object} column 对应的表格列。
		 * @return {String} 要显示的文本。
		 */
		getText: function(entity, column) {
			var text = '';
			if (entity) {
				if (column._property) {
					var property;
					if (column._propertyPath && !entity.rowType) {
						entity = column._propertyPath.evaluate(entity, true);
						property = column._subProperty;
					}
					else {
						property = column._property;
					}

					if (entity) {
						var dataType = column.get("dataType"), displayFormat = column.get("displayFormat");
						if (displayFormat) {
							var value = (entity instanceof dorado.Entity) ? entity.get(property) : entity[property];
							text = (dataType || dorado.$String).toText(value, displayFormat);
						}
						else {
							text = (entity instanceof dorado.Entity) ? entity.getText(property) : (entity[property] || "");
						}
					}
				}
			}
			if (text && text.replace && !column._wrappable) {
				text = text.replace(/\n/g, ' ');
			}
			return text;
		},

		/**
		 * 当单元格中的数据被修改之前激活的方法。
		 * <p>此处的数据修改操作特指那些用户操作由本渲染器渲染出的DOM对象或控件，从而因此数据被修改的情况。</p>
		 * @protected
		 * @param {Object} entity 对应的数据实体。
		 * @param {dorado.widget.grid.DataColumn} column 对应的表格列。
		 * @param {Object} value 将要写入单元格的新数值。
		 */
		beforeCellValueEdit: function(entity, column, value) {
			column._grid.beforeCellValueEdit(entity, column, value);
		},

		/**
		 * 当单元格中的数据被修改时激活的方法。
		 * <p>此处的数据修改操作特指那些用户操作由本渲染器渲染出的DOM对象或控件，从而因此数据被修改的情况。</p>
		 * @protected
		 * @param {Object} entity 对应的数据实体。
		 * @param {dorado.widget.grid.DataColumn} column 对应的表格列。
		 */
		onCellValueEdit: function(entity, column) {
			column._grid.onCellValueEdit(entity, column);
		},

		renderFlag: function(dom, arg) {
			var entity = arg.data, column = arg.column;
			if (!entity.rowType && entity instanceof dorado.Entity && column._property) {
				var property;
				if (column._propertyPath) {
					entity = column._propertyPath.evaluate(entity, true);
					property = column._subProperty;
				}
				else {
					property = column._property;
				}

				if (entity) {
					var state = entity.getMessageState(property), exCls;
					if (state == "error" || state == "warn") {
						exCls = "cell-flag-" + state;
					}
					else if (entity.isDirty(property)) {
						exCls = "cell-flag-dirty";
					}
					dom.parentNode.className = exCls || "";
				}
			}
		},

		/**
		 * 渲染。
		 * <p><b>如有需要应在子类中复写doRender方法，而不是此方法。</b></p>
		 * @param {HTMLElement} dom 单元格对应的DOM对象。
		 * @param {Object} arg 渲染参数。
		 * @param {dorado.widget.grid.AbstractGrid} arg.grid 对应的表格。
		 * @param {Object|dorado.Entity} arg.data 对应的数据实体。
		 * @param {dorado.widget.grid.Column} arg.column 对应的表格列。
		 * @see dorado.widget.grid.CellRenderer#doRender
		 */
		render: function() {
			this.doRender.apply(this, arguments);
		}
	});

	/**
	 * @author Benny Bao (mailto:benny.bao@bstek.com)
	 * @class 默认的表格单元格渲染器。
	 * @extends dorado.widget.grid.CellRenderer
	 */
	dorado.widget.grid.DefaultCellRenderer = $extend(dorado.widget.grid.CellRenderer, /** @scope dorado.widget.grid.DefaultCellRenderer.prototype */{
		doRender: function(dom, arg) {
			var text = this.getText(arg.data, arg.column);
			dom.innerText = text;
			dom.title = text.length > 5 ? text : "";
			$fly(dom).toggleClass("wrappable", !!arg.column._wrappable);
			this.renderFlag(dom, arg);
		}
	});

	/**
	 * @author Benny Bao (mailto:benny.bao@bstek.com)
	 * @class 默认的表格列脚渲染器。
	 * @extends dorado.widget.grid.CellRenderer
	 */
	dorado.widget.grid.DefaultCellFooterRenderer = $extend(dorado.widget.grid.CellRenderer, /** @scope dorado.widget.grid.DefaultCellFooterRenderer.prototype */{
		doRender: function(dom, arg) {
			var entity = arg.data, expired = !!entity.get("$expired");
			dom.innerText = expired ? (arg.column._summaryType ? '...' : '') : this.getText(entity, arg.column);
		}
	});

	/**
	 * @author Benny Bao (mailto:benny.bao@bstek.com)
	 * @abstract
	 * @class 用于将一个控件填充到表格单元格中单元格渲染器。
	 * @extends dorado.widget.grid.DefaultCellRenderer
	 */
	dorado.widget.grid.SubControlCellRenderer = $extend(dorado.widget.grid.DefaultCellRenderer, /** @scope dorado.widget.grid.SubControlCellRenderer.prototype */{
		/**
		 * @name dorado.widget.grid.SubControlCellRenderer#createSubControl
		 * @function
		 * @description 创建将被填充到表格单元格中的控件。
		 * <ul>
		 * <li>如果此方法返回null那么单元格中将不会显示任何内容。</li>
		 * <li>如果此方法返回undefined那么渲染器将按照默认的方法渲染此单元格。</li>
		 * </ul>
		 * @protected
		 * @param {Object} arg 渲染参数。
		 * @param {dorado.widget.grid.AbstractGrid} arg.grid 对应的表格。
		 * @param {Object|dorado.Entity} arg.data 对应的数据实体。
		 * @param {dorado.widget.grid.Column} arg.column 对应的表格列。
		 * @return {dorado.widget.Control} 将要填充在单元个中的子控件。
		 */
		/**
		 * @name dorado.widget.grid.SubControlCellRenderer#refreshSubControl
		 * @function
		 * @description 刷新单元格中的的控件。
		 * @protected
		 * @param subControl {dorado.widget.Control} 要刷新的控件。
		 * @param {Object} arg 渲染参数。
		 * @param {dorado.widget.grid.AbstractGrid} arg.grid 对应的表格。
		 * @param {Object|dorado.Entity} arg.data 对应的数据实体。
		 * @param {dorado.widget.grid.Column} arg.column 对应的表格列。
		 */
		// =====

		doRender: function(dom, arg) {
			var subControl, data = arg.data;
			if (dom._subControlId && dom.parentNode && dom.parentNode.colId == arg.column._uniqueId) {
				subControl = dorado.widget.ViewElement.ALL[dom._subControlId];
				if (subControl && subControl._gridRowData != data) {
					dom._subControlId = null;
					subControl.destroy();
					subControl = null;
				}
			}
			var attach;
			if (!subControl) {
				if (data && data.rowType != "header" && data.rowType != "footer") {
					subControl = this.createSubControl(arg);
					if (subControl) subControl._gridRowData = data;
				}
				attach = true;
			}

			if (subControl === null) {
				$fly(dom).empty();
				return;
			}
			else if (subControl === undefined) {
				$invokeSuper.call(this, arguments);
				return;
			}

			if (this.refreshSubControl) this.refreshSubControl(subControl, arg);
			if (attach) {
				var controlEl = subControl.getDom();
				if (controlEl.parentNode == dom) {
					subControl.refresh();
				}
				else {
					$fly(dom).empty();
					subControl.render(dom);
					dom._subControlId = subControl._uniqueId;
				}

				jQuery(controlEl).bind("remove", function() {
					var control = dorado.widget.ViewElement.ALL[dom._subControlId];
					dom._subControlId = null;
					if (control) control.destroy();
				});
				arg.innerGrid.registerInnerControl(subControl);
			}

			this.renderFlag(dom, arg);
		}
	});

	/**
	 * @author Benny Bao (mailto:benny.bao@bstek.com)
	 * @class 用于将一个复选框填充到表格单元格中单元格渲染器。
	 * @extends dorado.widget.grid.SubControlCellRenderer
	 */
	dorado.widget.grid.CheckBoxCellRenderer = $extend(dorado.widget.grid.SubControlCellRenderer, /** @scope dorado.widget.grid.CheckBoxCellRenderer.prototype */{

		preventCellEditing: true,

		createSubControl: function(arg) {
			var self = this;
			var checkbox = new dorado.widget.CheckBox({
				iconOnly: true,

				beforePost: function(control, arg) {
					arg.processDefault = self.beforeCellValueEdit(control._cellEntity, control._cellColumn, control.get("value"));
				},

				onPost: function(control) {
					var column = control._cellColumn, entity = control._cellEntity, value = control.get("value"), property;
					if (column._propertyPath) {
						entity = column._propertyPath.evaluate(entity, true);
						if (!entity) return;
						property = column._subProperty;
					}
					else {
						property = column._property;
					}

					(entity instanceof dorado.Entity) ? entity.set(property, value) : entity[property] = value;
					self.onCellValueEdit(entity, column);
				}
			});

			var dt = arg.column.get("dataType");
			if (dt) {
				switch(dt._code) {
					case dorado.DataType.BOOLEAN:
					{
						checkbox.set("triState", true);
						break;
					}
					case dorado.DataType.PRIMITIVE_INT:
					case dorado.DataType.PRIMITIVE_FLOAT:
					{
						checkbox.set({
							offValue: 0,
							onValue: 1
						});
						break;
					}
					case dorado.DataType.INTEGER:
					case dorado.DataType.FLOAT:
					{
						checkbox.set({
							offValue: 0,
							onValue: 1,
							triState: true
						});
						break;
					}
				}
			}
			return checkbox;
		},

		refreshSubControl: function(checkbox, arg) {
			var column = arg.column, entity = arg.data, property;
			if (column._propertyPath) {
				entity = column._propertyPath.evaluate(entity, true);
				if (!entity) return;
				property = column._subProperty;
			}
			else {
				property = column._property;
			}

			var value = (entity instanceof dorado.Entity) ? entity.get(property) : entity[property];
			checkbox._cellEntity = entity;
			checkbox._cellColumn = column;
			checkbox.disableListeners();
			checkbox.set({
				readOnly: !arg.grid.shouldEditing(column),
				value: value
			});
			checkbox.refresh();
			checkbox.enableListeners();
		}
	});

	/**
	 * @author Benny Bao (mailto:benny.bao@bstek.com)
	 * @class 用于将一个单选框组填充到表格单元格中单元格渲染器。
	 * @extends dorado.widget.grid.SubControlCellRenderer
	 */
	dorado.widget.grid.RadioGroupCellRenderer = $extend(dorado.widget.grid.SubControlCellRenderer, /** @scope dorado.widget.grid.RadioGroupCellRenderer.prototype */{

		preventCellEditing: true,

		/**
		 * 返回单选框的数组。
		 * @param {Object} arg 渲染参数。
		 * @param {dorado.widget.grid.AbstractGrid} arg.grid 对应的表格。
		 * @param {Object|dorado.Entity} arg.data 对应的数据实体。
		 * @param {dorado.widget.grid.Column} arg.column 对应的表格列。
		 * @return {Object[]} 单选框数组。数组中的元素是用于描述单选框的JSON对象。
		 */
		getRadioButtons: function(arg) {
			var radioButtons = [];
			var pd = arg.column._propertyDef;
			if (pd && pd._mapping) {
				for(var i = 0; i < pd._mapping.length; i++) {
					var item = pd._mapping[i];
					radioButtons.push({
						value: item.key,
						text: item.value
					});
				}
			}
			return radioButtons;
		},

		createSubControl: function(arg) {
			var self = this;
			return new dorado.widget.RadioGroup({
				width: "100%",
				radioButtons: this.getRadioButtons(arg),

				beforePost: function(control, arg) {
					arg.processDefault = self.beforeCellValueEdit(control._cellEntity, control._cellColumn, control.get("value"));
				},

				onPost: function(control) {
					var column = control._cellColumn, entity = control._cellEntity, value = control.get("value"), property;
					if (column._propertyPath) {
						entity = column._propertyPath.evaluate(entity, true);
						if (!entity) return;
						property = column._subProperty;
					}
					else {
						property = column._property;
					}

					(entity instanceof dorado.Entity) ? entity.set(property, value) : entity[property] = value;
					self.onCellValueEdit(entity, column);
				}
			});
		},

		refreshSubControl: function(radioGroup, arg) {
			var column = arg.column, entity = arg.data, property;
			if (column._propertyPath) {
				entity = column._propertyPath.evaluate(entity, true);
				if (!entity) return;
				property = column._subProperty;
			}
			else {
				property = column._property;
			}

			var value = (entity instanceof dorado.Entity) ? entity.get(property) : entity[property];
			radioGroup._cellEntity = entity;
			radioGroup._cellColumn = column;
			radioGroup.disableListeners();
			radioGroup.set({
				readOnly: !arg.grid.shouldEditing(column),
				value: value
			});
			radioGroup.refresh();
			radioGroup.enableListeners();
		}
	});

	/**
	 * @author Benny Bao (mailto:benny.bao@bstek.com)
	 * @class 用于将一个进度条填充到表格单元格中单元格渲染器。
	 * @extends dorado.widget.grid.SubControlCellRenderer
	 */
	dorado.widget.grid.ProgressBarCellRenderer = $extend(dorado.widget.grid.SubControlCellRenderer, /** @scope dorado.widget.grid.ProgressBarCellRenderer.prototype */{
		createSubControl: function(arg) {
			return new dorado.widget.ProgressBar();
		},

		refreshSubControl: function(progressBar, arg) {
			var column = arg.column, entity = arg.data, property;
			if (column._propertyPath) {
				entity = column._propertyPath.evaluate(entity, true);
				if (!entity) return;
				property = column._subProperty;
			}
			else {
				property = column._property;
			}
			var value = (entity instanceof dorado.Entity) ? entity.get(property) : entity[property];
			progressBar.set("value", parseFloat(value) || 0);
		}
	});

	/**
	 * @author Benny Bao (mailto:benny.bao@bstek.com)
	 * @class 分组标题行的渲染器。
	 * @extends dorado.widget.grid.RowRenderer
	 */
	dorado.widget.grid.GroupHeaderRenderer = $extend(dorado.widget.grid.RowRenderer, /** @scope dorado.widget.grid.GroupHeaderRenderer.prototype */ {
		doRender: function(dom, arg) {
			if (dom._lazyRender) return;

			var grid = arg.grid, entity = arg.data, processDefault = true;
			if (grid.getListenerCount("onRenderCell")) {
				var arg = {
					dom: dom,
					data: entity,
					rowType: entity.rowType,
					processDefault: false
				};
				grid.fireEvent("onRenderCell", grid, arg);
				processDefault = arg.processDefault;
			}
			if (processDefault) {
				dom.firstChild.firstChild.innerText = entity.getText("$groupValue") + " (" + entity.get("$count") + ")";
			}
		}
	});

	/**
	 * @author Benny Bao (mailto:benny.bao@bstek.com)
	 * @class 分组汇总栏行渲染器。
	 * @extends dorado.widget.grid.DefaultRowRenderer
	 */
	dorado.widget.grid.GroupFooterRenderer = $extend(dorado.widget.grid.DefaultRowRenderer, /** @scope dorado.widget.grid.GroupFooterRenderer.prototype */{
		renderCell: function(cellRenderer, dom, arg) {
			var grid = arg.grid, entity = arg.data, processDefault = true;
			if (grid.getListenerCount("onRenderCell")) {
				var arg = {
					dom: dom,
					data: entity,
					column: arg.column,
					rowType: entity.rowType,
					processDefault: false
				};
				grid.fireEvent("onRenderCell", grid, arg);
				processDefault = arg.processDefault;
			}
			if (processDefault) {
				if (!!entity.get("$expired")) {
					dom.innerText = arg.column._summaryType ? '...' : '';
				}
				else {
					dorado.Renderer.render(cellRenderer, dom, arg);
				}
			}
		}
	});

	/**
	 * @author Benny Bao (mailto:benny.bao@bstek.com)
	 * @class 表格控件中单元格编辑器的抽象类。
	 * @abstract
	 * @extends dorado.EventSupport
	 */
	dorado.widget.grid.CellEditor = $class(/** @scope dorado.widget.grid.CellEditor.prototype */{
		$className: "dorado.widget.grid.CellEditor",

		/**
		 * 所属的表格控件。
		 * @name dorado.widget.grid.CellEditor#grid
		 * @property
		 * @type dorado.widget.AbstractGrid
		 */
		/**
		 * 对应的表格单元列。
		 * @name dorado.widget.grid.CellEditor#column
		 * @property
		 * @type dorado.widget.grid.Column
		 */
		/**
		 * 编辑器当前对应的数据对象。
		 * @name dorado.widget.grid.CellEditor#data
		 * @property
		 * @type dorado.Entity|Object
		 */
		/**
		 * 是否要显示边框。
		 * @name dorado.widget.grid.CellEditor#showBorder
		 * @property
		 * @type boolean
		 */
		/**
		 * 最小宽度。
		 * @name dorado.widget.grid.CellEditor#minWidth
		 * @property
		 * @type int
		 */
		/**
		 * 最小高度。
		 * @name dorado.widget.grid.CellEditor#minHeight
		 * @property
		 * @type int
		 */
		/**
		 * 编辑器对应的DOM元素对象是否已初始化。
		 * @name dorado.widget.grid.CellEditor#inited
		 * @property
		 * @type boolean
		 */
		/**
		 * 编辑器是否正处于可见状态。
		 * @name dorado.widget.grid.CellEditor#visible
		 * @property
		 * @type boolean
		 * @readOnly
		 */
		// ====

		/**
		 * 初始化编辑器对应的DOM元素对象。
		 * @name dorado.widget.grid.CellEditor#initDom
		 * @function
		 * @param {HTMLElement} dom 编辑器对应的DOM元素对象。
		 */
		/**
		 * 刷新编辑器中的内容。
		 * @name dorado.widget.grid.CellEditor#refresh
		 * @function
		 */
		/**
		 * 确认单元格编辑器中的修改。
		 * @name dorado.widget.grid.CellEditor#post
		 * @function
		 */
		// =====

		/**
		 * 是否启用缓存。默认为启用。
		 * <p>是使用后系统并不销毁该编辑器，而是将其缓存起来供同一列的其他单元格备用。
		 * 一旦启用了此缓存功能，那么该列中的每一个单元格的编辑器都将是同一个实例。</p>
		 * @type boolean
		 * @default true
		 */
		cachable: true,

		/**
		 * 是否要在编辑过程中隐藏表格单元格中的内容。
		 * @type boolean
		 * @default true
		 */
		hideCellContent: true,

		destroy: function() {
		},

		bindColumn: function(column) {
			this.grid = column._grid;
			this.column = column;
		},

		/**
		 * 创建单元格编辑器对应的DOM对象。
		 * @return {HTMLElement} DOM对象。
		 * @protected
		 */
		createDom: function() {
			return $DomUtils.xCreate({
				tagName: "DIV",
				className: "d-grid-cell-editor" + (this.showBorder ? " d-grid-cell-editor-border" : ''),
				style: {
					position: "absolute"
				}
			});
		},

		/**
		 * 返回单元格编辑器对应的DOM对象。
		 * @return {HTMLElement} DOM对象。
		 */
		getDom: function() {
			if (!this._dom) {
				this._dom = this.createDom();
				var fn = function() {
					return false;
				};
				$fly(this._dom).mousewheel(fn);
				this.grid.getDom().appendChild(this._dom);
			}
			return this._dom;
		},

		/**
		 * 当单元格的尺寸发生变化是被激活的方法。
		 * @protected
		 */
		resize: function() {
			var dom = this.getDom(), cell = this.cell, $gridDom = jQuery(this.grid.getDom());
			if (!dom || !cell) return;

			var offsetGrid = $gridDom.offset(), offsetCell = $fly(cell).offset();
			;
			var l = offsetCell.left - offsetGrid.left - $gridDom.edgeLeft(), t = offsetCell.top - offsetGrid.top - $gridDom.edgeTop(),
				w = cell.offsetWidth, h = cell.offsetHeight;

			//Grid不定义高度情况下将使用浏览器自身的滚动栏
			if (!this.grid._divScroll && $gridDom.scrollLeft() > 0) {
				l += $gridDom.scrollLeft();
			}

			if (this.minWidth && this.minWidth > w) w = this.minWidth;
			if (this.minHeight && this.minHeight > h) h = this.minHeight;
			$fly(dom).css({
				left: l,
				top: t
			}).outerWidth(w).outerHeight(h);
		},

		/**
		 * 用于告知系统某单元格当前是否可以进入编辑状态。
		 * @param {HTMLElement} cell 对应的表格单元格。
		 * @return {boolean} 是否要显示编辑器。
		 */
		shouldShow: function() {
			return this.column && this.column._property;
		},

		/**
		 * 显示该单元格编辑器。
		 * @param {dorado.widget.AbstractGrid} parent 所属的表格控件。
		 * @param {HTMLElement} cell 对应的表格单元格。
		 */
		show: function(parent, cell) {
			this.cell = cell;
			var dom = this.getDom();
			this.grid.getDom().appendChild(dom);
			this.initDom(dom);
			this.refresh();

			var self = this;
			if (dorado.Browser.mozilla) {
				// Moziila BUG, offsetLeft doesn't according to scrollLeft immidately
				setTimeout(function() {
					self.resize();
				}, 0);
			}
			else {
				self.resize();
			}
			$fly(window).one("resize", function() {
				self.hide();
			});
			if (this.hideCellContent) cell.firstChild.style.visibility = "hidden";
			this.visible = true;
		},

		/**
		 * 隐藏该单元格编辑器。
		 * @param {boolean} post 是否要在隐藏的同时尝试确认编辑器中的修改。
		 */
		hide: function(post) {
			var grid = this.grid;
			if (post !== false) {
				if (this.post) this.post();
			}
			else {
				if (this.cancel) this.cancel();
			}
			$DomUtils.getUndisplayContainer().appendChild(this.getDom());
			delete this.data;
			if (grid._currentCellEditor == this) {
				delete grid._currentCellEditor;
			}
			this.visible = false;
			if (this.cell) {
				if (this.hideCellContent) this.cell.firstChild.style.visibility = '';
				this.cell = null;
			}
		},

		/**
		 * 返回单元格编辑器中当前的数值。
		 * @protected
		 */
		getEditorValue: function() {
			return null;
		},

		/**
		 * 当单元格编辑器中的修改将被确认之前激活的方法。
		 * @protected
		 */
		beforePost: function(arg) {
			arg.processDefault = this.grid.beforeCellValueEdit(this.data, this.column, this.getEditorValue());
			;
		},

		/**
		 * 当单元格编辑器中的修改被确认时激活的方法。
		 * @protected
		 */
		onPost: function(arg) {
			if (this.visible) {
				this.grid.onCellValueEdit(this.data, this.column);
			}
		}
	});

	/**
	 * @author Benny Bao (mailto:benny.bao@bstek.com)
	 * @class 控件型的单元格编辑器的抽象类。
	 * <p>此类的基本作用是直接使用一个dorado控件作为具体的单元格编辑器。</p>
	 * @abstract
	 * @extends dorado.widget.grid.CellEditor
	 */
	dorado.widget.grid.ControlCellEditor = $extend(dorado.widget.grid.CellEditor, /** @scope dorado.widget.grid.ControlCellEditor.prototype */ {

		/**
		 * 创建具体的单元格编辑器控件。
		 * @name dorado.widget.grid.ControlCellEditor#createEditorControl
		 * @function
		 * @abstract
		 * @return {dorado.widget.Control} 新创建的单元格编辑器。
		 */
		// ====

		destroy: function() {
			if (this._editorControl) {
				this._editorControl.destroy();
			}
			$invokeSuper.call(this);
		},

		shouldShow: function() {
			var shouldShow = $invokeSuper.call(this);
			if (shouldShow) {
				var column = this.column, dataType = column.get("dataType"), dtCode = dataType ? dataType._code : -1;
				var trigger = column.get("trigger"), pd = column._propertyDef;
				if (!trigger && !(pd && pd._mapping) && (dtCode == dorado.DataType.PRIMITIVE_BOOLEAN || dtCode == dorado.DataType.BOOLEAN)) {
					shouldShow = false;
				}
			}
			return shouldShow;
		},

		/**
		 * 设置具体的单元格编辑器控件。
		 * @param {dorado.widget.Control} editorControl
		 */
		setEditorControl: function(editorControl) {
			if (this._editorControl) {
				this._editorControl.destroy();
			}
			this._editorControl = editorControl;
		},

		getEditorControl: function(create) {
			var editorControl = null;
			if (this._editorControl) {
				editorControl = this._editorControl;
			}
			else {
				if (create === false) return null;

				var column = this.column;
				if (column._editor) {
					editorControl = column._editor;
				}
				else if (column._editorType) {
					if (column._editorType != "None") {
						var cacheKey = "_cache_" + column._editorType;
						editorControl = this[cacheKey];
						if (!editorControl) {
							editorControl = dorado.Toolkits.createInstance("widget", column._editorType);
							this[cacheKey] = editorControl;
						}
					}
				}
				else {
					editorControl = this.createEditorControl();
					if (editorControl) this.grid.registerInnerControl(editorControl);
				}
				if (this.cachable) this._editorControl = editorControl;

				if (editorControl instanceof dorado.widget.TextArea) {
					var attrWatcher = editorControl.getAttributeWatcher();
					this.minWidth = (attrWatcher.getWritingTimes("width")) ? editorControl.get("width") : 120;
					this.minHeight = (attrWatcher.getWritingTimes("height")) ? editorControl.get("height") : 40;
				}
			}

			var column = this.column, cellEditor = this, pd = column._propertyDef;
			var dataType = column.get("dataType"), dtCode = dataType ? dataType._code : -1;
			var trigger = column.get("trigger"), displayFormat = column.get("displayFormat"), typeFormat = column.get("typeFormat");
			if (!dtCode || (pd && pd._mapping)) dataType = undefined;

			if (trigger === undefined) {
				if (pd && pd._mapping) {
					trigger = new dorado.widget.AutoMappingDropDown({
						items: pd._mapping
					});
				}
				else if (dtCode == dorado.DataType.DATE) {
					trigger = "defaultDateDropDown";
				}
				else if (dtCode == dorado.DataType.DATETIME) {
					trigger = "defaultDateTimeDropDown";
				}
			}

			editorControl.set({
				dataType: dataType,
				displayFormat: displayFormat,
				typeFormat: typeFormat,
				trigger: trigger,
				editable: column._editable
			}, {
				skipUnknownAttribute: true,
				tryNextOnError: true,
				preventOverwriting: true,
				lockWritingTimes: true
			});

			if (editorControl && !editorControl._initedForCellEditor) {
				editorControl._initedForCellEditor = true;

				editorControl.bind("onBlur", function(self) {
					if ((new Date() - cellEditor._showTimestamp) > 300) cellEditor.hide();
				})
				if (editorControl instanceof dorado.widget.AbstractEditor) {
					editorControl.bind("beforePost",function(self, arg) {
						cellEditor.beforePost(arg);
					}).bind("onPost", function(self, arg) {
							cellEditor.onPost(arg);
						});
					editorControl._cellEditor = cellEditor; // 主要供DropDown进行判断
					editorControl._propertyDef = column._propertyDef; // 主要供AutoMappingDropDown使用
				}

				this.grid.registerInnerControl(editorControl);
			}
			return editorControl;
		},

		getContainerElement: function(dom) {
			return dom;
		},

		initDom: function(dom) {
			var editorControl = this.getEditorControl();
			var containerElement = this.getContainerElement(dom);
			if (containerElement.firstChild) {
				var originControl = dorado.widget.Control.findParentControl(containerElement.firstChild);
				if (originControl && originControl != editorControl) {
					originControl.unrender();
				}
			}
			if (editorControl && !editorControl._rendered) {
				editorControl.render(containerElement);
			}
		},

		resize: function() {
			var dom = this.getDom(), control = this.getEditorControl();
			var ie6 = (dorado.Browser.msie && dorado.Browser.version < 7);
			if (control) {
				if (ie6) control.getDom().style.display = "none";
			}

			$invokeSuper.call(this);

			if (control) {
				var w = dom.clientWidth, h = dom.clientHeight;
				if (ie6) control.getDom().style.display = '';
				control.set({
					width: w,
					height: h
				}, {
					tryNextOnError: true
				});
				control.refresh();
			}
		},

		show: function(parent, cell) {
			$invokeSuper.call(this, [parent, cell]);

			var control = this.getEditorControl();
			if (!control) return;
			control.set("focusParent", parent);
			control.setActualVisible(true);
			control.setFocus();
		},

		hide: function(post) {
			if (this._processingHide) return;
			this._processingHide = true;
			try {
				$invokeSuper.call(this, [post]);
				var control = this.getEditorControl(false);
				if (control) {
					dorado.widget.onControlGainedFocus(control.get("focusParent"));
					control.set("focusParent", null);
					control.setActualVisible(false);
				}
			}
			finally {
				this._processingHide = false;
			}
		}
	});

	/**
	 * @author Benny Bao (mailto:benny.bao@bstek.com)
	 * @class 较简单的单元格编辑器的抽象类。
	 * @abstract
	 * @extends dorado.widget.grid.ControlCellEditor
	 */
	dorado.widget.grid.SimpleCellEditor = $extend(dorado.widget.grid.ControlCellEditor, /** @scope dorado.widget.grid.SimpleCellEditor.prototype */ {
		refresh: function() {
			var editor = this.getEditorControl();
			if (!editor) return;

			var entity = this.data, column = this.column, property, value;
			if (column._propertyPath) {
				property = column._subProperty;
			}
			else {
				property = column._property;
			}

			if (entity) {
				if (entity instanceof dorado.Entity) {
					if (editor instanceof dorado.widget.AbstractTextEditor) {
						var propertyDef = entity.getPropertyDef(property);
						if (propertyDef && column.get("dataType") && !propertyDef.get("mapping")) {
							value = entity.get(property);
							editor.set("value", value);
						}
						else {
							value = entity.getText(property);
							editor.set("text", value);
						}
						editor.setValidationState(entity.getMessageState(property), entity.getMessages(property));
					}
					else {
						value = entity.get(property);
						editor.set("value", value);
					}
				}
				else {
					value = entity[property];
					editor.set("value", value);
				}
			}
			else {
				editor.set("value", null);
			}
		},

		getEditorValue: function() {
			var editor = this.getEditorControl();
			return editor ? editor.get("value") : null;
		},

		post: function() {
			var editor = this.getEditorControl(false);
			return (editor) ? editor.post() : false;
		},

		onPost: function(arg) {
			var editor = this.getEditorControl(false);
			if (!editor) return;

			var entity = this.data, column = this.column, property, value;
			if (column._propertyPath) {
				property = column._subProperty;
			}
			else {
				property = column._property;
			}

			if (entity) {
				if (entity instanceof dorado.Entity) {
					if (editor instanceof dorado.widget.AbstractTextEditor) {
						// 此处的判断导致一旦Grid中的校验出错后，就再也无法通过Grid来录入内容。因为validationState是在post完成之后才设置的。
						// if (editor.get("validationState") != "error") {
						value = editor.get("value");
						var pd = column._propertyDef;
						if (pd && pd._mapping) {
							entity.setText(property, editor.get("text"));
						}
						else {
							entity.set(property, value);
						}
						// }
					}
					else {
						value = editor.get("value");
						entity.set(property, value);
					}
				}
				else {
					value = editor.get("value");
					entity[property] = value;
				}
			}
			$invokeSuper.call(this, [arg]);
		}
	});

	/**
	 * @author Benny Bao (mailto:benny.bao@bstek.com)
	 * @class 默认的单元格编辑器的抽象类。
	 * @extends dorado.widget.grid.SimpleCellEditor
	 */
	dorado.widget.grid.DefaultCellEditor = $extend(dorado.widget.grid.SimpleCellEditor, /** @scope dorado.widget.grid.DefaultCellEditor.prototype */ {

		createEditorControl: function() {
			var editor, column = this.column, grid = column._grid;
			var dt = column.get("dataType"), dtCode = dt ? dt._code : -1;
			var trigger = column.get("trigger"), displayFormat = column.get("displayFormat"), typeFormat = column.get("typeFormat");
			var pd = column._propertyDef;

			if (trigger === undefined) {
				if (pd && pd._mapping) {
					trigger = new dorado.widget.AutoMappingDropDown({
						items: pd._mapping
					});
				}
				else if (dtCode == dorado.DataType.PRIMITIVE_BOOLEAN || dtCode == dorado.DataType.BOOLEAN) {
					editor = new dorado.widget.CheckBox({
						onValue: true,
						offValue: false,
						triState: (dtCode == dorado.DataType.BOOLEAN)
					});
					$fly(editor.getDom()).addClass("d-checkbox-center");
				}
				else if (dtCode == dorado.DataType.DATE) {
					trigger = "defaultDateDropDown";
				}
				else if (dtCode == dorado.DataType.DATETIME) {
					trigger = "defaultDateTimeDropDown";
				}
			}

			if (editor === undefined) {
				if (column._wrappable) {
					editor = new dorado.widget.TextArea();
				}
				else {
					editor = new dorado.widget.TextEditor();
				}
			}
			return editor;
		},

		show: function(parent, cell) {
			this._showTimestamp = new Date();

			var editor = this.getEditorControl();
			var sameEditor = (dorado.widget.getMainFocusedControl() == editor);
			if (sameEditor && editor) editor.onBlur();
			$invokeSuper.call(this, [parent, cell]);
			if (sameEditor && editor) editor.onFocus();
		}
	});

	/**
	 * @author Benny Bao (mailto:benny.bao@bstek.com)
	 * @class 数据列。
	 * @shortTypeName Default ; Data
	 * @extends dorado.widget.grid.Column
	 */
	dorado.widget.grid.DataColumn = $extend(dorado.widget.grid.Column, /** @scope dorado.widget.grid.DataColumn.prototype */ {
		$className: "dorado.widget.grid.DataColumn",

		ATTRIBUTES: /** @scope dorado.widget.grid.DataColumn.prototype */ {

			/**
			 * 列的宽度。
			 * @type int|String
			 * @default "*"
			 * @attribute
			 */
			width: {
				defaultValue: "*",
				setter: function(width) {
					this._width = width;
					delete this._realWidth;
				}
			},

			dynaRowHeight: {
				defaultValue: true
			},

			caption: {
				getter: function() {
					var caption = this._caption;
					if (caption == null && this._propertyDef) {
						caption = this._propertyDef.get("label");
					}
					if (caption == null) caption = (this._name.charAt(0) == '_' ? this._property : this._name);
					return caption;
				}
			},

			name: {
				setter: function(v) {
					this._name = v;
					if (!this.getAttributeWatcher().getWritingTimes("property") && !this.ATTRIBUTES.property.defaultValue) this._property = v;
				}
			},

			/**
			 * 数据列关联的属性名。
			 * @type String
			 * @attribute writeOnce
			 */
			property: {
				writeOnce: true,
				setter: function(property) {
					this._property = property;

					var i = 0;
					if (property) {
						i = property.lastIndexOf('.');
						if (i > 0) {
							this._propertyPath = dorado.DataPath.create(property.substring(0, i));
							this._subProperty = property.substring(i + 1);
						}
					}

					if (i <= 0) {
						delete this._propertyPath;
						delete this._subProperty;
					}
					if (!this.getAttributeWatcher().getWritingTimes("name") && !this.ATTRIBUTES.name.defaultValue) this._name = property;
				}
			},

			/**
			 * 水平对齐方式。 取值范围如下：
			 * <ul>
			 * <li>left</li>
			 * <li>center</li>
			 * <li>right</li>
			 * </ul>
			 * @type String
			 * @attribute
			 */
			align: {
				setter: function(align) {
					this._align = align;
					if (align) {
						if (!this._footerAlign) this._footerAlign = align;
					}
				}
			},

			/**
			 * 列脚中内容的水平对齐方式。 取值范围如下：
			 * <ul>
			 * <li>left</li>
			 * <li>center</li>
			 * <li>right</li>
			 * </ul>
			 * @type String
			 * @attribute
			 */
			footerAlign: {},

			/**
			 * 列中数据的数据类型。
			 * @type dorado.DataType
			 * @attribute
			 */
			dataType: {
				getter: function() {
					var dt = dorado.LazyLoadDataType.dataTypeGetter.call(this);
					if (!dt && this._propertyDef) dt = this._propertyDef.get("dataType");
					return dt;
				}
			},

			/**
			 * 所属的视图对象使用的数据类型管理器。
			 * @type dorado.DataTypeRepository
			 * @attribute readOnly
			 */
			dataTypeRepository: {
				getter: function() {
					if (this._grid) {
						var view = this._grid.get("view");
						if (view) return view.getDataTypeRepository();
					}
					return null;
				},
				readOnly: true
			},

			/**
			 * 是否只读。
			 * @type boolean
			 * @attribute skipRefresh
			 */
			readOnly: {
				skipRefresh: true,
				getter: function() {
					var readOnly = this._readOnly;
					if (!readOnly && this._propertyDef) {
						readOnly = this._propertyDef.get("readOnly");
					}
					return readOnly;
				}
			},

			/**
			 * 是否必填。
			 * @type boolean
			 * @attribute
			 */
			required: {
				getter: function() {
					var required = this._required;
					if (!required && this._propertyDef) {
						required = this._propertyDef.get("required");
					}
					return required;
				}
			},

			/**
			 * 输入格式。此属性只在定义了dataType时才有效。
			 * @type String
			 * @attribute skipRefresh
			 */
			typeFormat: {
				skipRefresh: true,
				getter: function() {
					var typeFormat = this._typeFormat;
					if (!typeFormat && this._propertyDef) {
						typeFormat = this._propertyDef.get("typeFormat");
					}
					return typeFormat;
				}
			},

			/**
			 * 显示格式。此属性只在定义了dataType时才有效。
			 * @type String
			 * @attribute
			 */
			displayFormat: {
				getter: function() {
					var displayFormat = this._displayFormat;
					if (!displayFormat && this._propertyDef) {
						displayFormat = this._propertyDef.get("displayFormat");
					}
					return displayFormat;
				}
			},

			/**
			 * 此列中的编辑器绑定的下拉框。
			 * @type dorado.widget.form.Trigger
			 * @attribute skipRefresh
			 */
			trigger: {
				skipRefresh: true
			},

			/**
			 * 单元格的文本编辑器是否可以编辑。
			 * 此属性仅在单元格编辑器为TextEditor或TextArea是有效，用于定义文本编辑器是否可以编辑。因为有时我们希望仅允许用户通过下拉框进行选择。
			 * @type boolean
			 * @default true
			 * @attribute
			 */
			editable: {
				defaultValue: true
			},

			/**
			 * 单元格的渲染器。
			 * @type dorado.Renderer
			 * @attribute
			 */
			renderer: {
				setter: function(value) {
					if (typeof value == "string") value = eval("new " + value + "()");
					this._renderer = value;
				}
			},

			/**
			 * 汇总栏的渲染器。
			 * @type dorado.Renderer
			 * @attribute
			 */
			footerRenderer: {
				setter: function(value) {
					if (typeof value == "string") value = eval("new " + value + "()");
					this._footerRenderer = value;
				}
			},

			/**
			 * 过滤栏渲染器。
			 * @type dorado.Renderer
			 * @attribute
			 */
			filterBarRenderer: {
				setter: function(value) {
					if (typeof value == "string") value = eval("new " + value + "()");
					this._filterBarRenderer = value;
				}
			},

			/**
			 * 汇总值计算器的类型。
			 * @type String
			 * @attribute writeOnce
			 * @see dorado.SummaryCalculators
			 */
			summaryType: {
				writeOnce: true
			},

			/**
			 * 表单项类型。
			 * <p>
			 * 此属性的值实质为编辑器控件的$type。<br>
			 * 例如当我们希望其中的编辑器为{@link dorado.widget.TextEditor}时，可以定义此属性的值为TextEditor。
			 * 因为{@link dorado.widget.TextEditor}的$type为TextEditor。<br>
			 * 当我们希望其中的编辑器为{@link dorado.widget.CheckBox}时，可以定义此属性的值为CheckBox。
			 * </p>
			 * <p>
			 * 通过此方法定义编辑器控件具有一定的局限性，很多编辑控件在实际使用时往往需要定义额外的属性。
			 * 如{@link dorado.widget.CustomSpinner}必须定义pattern属性才能正常使用，在这种情况下应该通过editor属性直接声明具体的编辑器。
			 * </p>
			 * @type String
			 * @attribute
			 */
			editorType: {},

			/**
			 * 内部使用的编辑器。
			 * @type dorado.widget.Control
			 * @attribute
			 */
			editor: {
				setter: function(editor) {
					if (!(editor instanceof dorado.widget.Control)) {
						editor = dorado.Toolkits.createInstance("widget", editor, function(type) {
							return dorado.Toolkits.getPrototype("widget", type || "TextEditor");
						});
					}
					this._editor = editor;
				}
			},

			/**
			 * 内部使用的单元格编辑器。
			 * @type dorado.widget.grid.CellEditor
			 * @attribute
			 */
			cellEditor: {
				readOnly: true
			},

			/**
			 * 排序标记。此标记仅用于显示，与实际的排序效果无关。可有如下几种取值：
			 * <ul>
			 * <li>none - 未排序</li>
			 * <li>asc - 升序排序</li>
			 * <li>desc - 降序排序</li>
			 * </ul>
			 * @type String
			 * @attribute
			 */
			sortState: {
				skipRefresh: true
			},

			/**
			 * 是否支持文本换行。
			 * @type boolean
			 * @attribute
			 */
			wrappable: {},

			/**
			 * 返回列关联的属性声明对象。
			 * @type dorado.PropertyDef
			 * @attribute readOnly
			 */
			propertyDef: {
				readOnly: true
			},

			/**
			 * 本列是否支持数据过滤。
			 * @attribute
			 * @default true
			 */
			filterable: {
				defaultValue: true
			},

			/**
			 * 默认的过滤条件比较符。
			 * <p>
			 * 可选的比较符包括：like, like*, *like, =, <>, >, >=, <, <=
			 * </p>
			 * @attribute
			 */
			defaultFilterOperator: {
			},

			/**
			 * 本列是否支持用户调整列宽。
			 * @attribute
			 * @default true
			 */
			resizeable: {
				defaultValue: true
			}
		},

		EVENTS: /** @scope dorado.widget.grid.DataColumn.prototype */ {
			/**
			 * 当系统渲染某个数据单元格时触发的事件。
			 * @param {Object} self 事件的发起者，即列本身。
			 * @param {Object} arg 事件参数。
			 * @param {HTMLElement} arg.dom 对应的DOM对象。
			 * @param {dorado.Entity|Object} arg.data 行对应的数据实体。
			 * @param {String} arg.rowType 行的类型，目前可能的取值包括：
			 * <ul>
			 * <li>null或undefined    -    普通的数据行。</li>
			 * <li>header    -    数据分组模式下的分组标题行，参考{@link dorado.widget.AbstractGrid#attribute:groupProperty}。</li>
			 * <li>footer    -    数据分组模式下的分组汇总行，参考{@link dorado.widget.AbstractGrid#attribute:groupProperty}。</li>
			 * </ul>
			 * @param {dorado.widget.grid.DefaultCellRenderer} #arg.cellRenderer 系统将要使用的单元格渲染器。您可以直接修改或替换该渲染器。
			 * <p>注意：此参数仅对普通数据行中的单元格有效。</p>
			 * @param {boolean} #arg.processDefault 是否在事件结束后继续使用系统默认的渲染逻辑。
			 * @return {boolean} 是否要继续后续事件的触发操作，不提供返回值时系统将按照返回值为true进行处理。
			 * @event
			 */
			onRenderCell: {},

			/**
			 * 当系统渲染列的汇总栏时触发的事件。
			 * @param {Object} self 事件的发起者，即列本身。
			 * @param {Object} arg 事件参数。
			 * @param {HTMLElement} arg.dom 对应的DOM对象。
			 * @param {dorado.Entity} arg.data Grid内部用于保存Footer值的Entity对象。
			 * @param {dorado.widget.grid.DataColumn} arg.column 表格列。
			 * @param {boolean} #arg.processDefault 是否在事件结束后继续使用系统默认的渲染逻辑。
			 * @return {boolean} 是否要继续后续事件的触发操作，不提供返回值时系统将按照返回值为true进行处理。
			 * @event
			 */
			onRenderFooterCell: {},

			/**
			 * 当系统尝试获得某单元格对应的编辑器时触发的事件。
			 * @param {Object} self 事件的发起者，即列本身。
			 * @param {Object} arg 事件的参数。
			 * @param {Object|dorado.Entity} arg.data 当前要编辑的行所对应的数据或数据实体。
			 * @param {dorado.widget.grid.CellEditor} arg.cellEditor 系统默认的单元格编辑器。您可以直接修改或替换该编辑器。
			 * @return {boolean} 是否要继续后续事件的触发操作，不提供返回值时系统将按照返回值为true进行处理。
			 * @event
			 */
			onGetCellEditor: {}
		},

		destroy: function() {
			if (this._cellEditor) {
				this._cellEditor.destroy();
			}
		}

	});

	/**
	 * @author Benny Bao (mailto:benny.bao@bstek.com)
	 * @class 组合列。
	 * @shortTypeName Group
	 * @extends dorado.widget.grid.Column
	 * @extends dorado.widget.grid.ColumnModel
	 */
	dorado.widget.grid.ColumnGroup = $extend([dorado.widget.grid.Column, dorado.widget.grid.ColumnModel], /** @scope dorado.widget.grid.ColumnGroup.prototype */ {
		$className: "dorado.widget.grid.ColumnGroup",

		ATTRIBUTES: /** @scope dorado.widget.grid.ColumnGroup.prototype */ {
			grid: {
				setter: function(grid) {
					var oldGrid = this._grid;
					this._grid = grid;

					this._columns.each(function(column) {
						if (oldGrid) oldGrid.unregisterInnerViewElement(column);
						if (grid) grid.registerInnerViewElement(column);
						column.set("grid", grid);
					});
				}
			}
		},

		constructor: function(config) {
			this._columns = new dorado.widget.grid.ColumnList(this);
			$invokeSuper.call(this, [config]);
		},

		doGet: dorado.widget.grid.ColumnModel.prototype.doGet
	});

	/**
	 * @author Benny Bao (mailto:benny.bao@bstek.com)
	 * @class 指示器列。
	 * <p>一般用于指示行的状态。</p>
	 * @shortTypeName * ; Indicator
	 * @extends dorado.widget.grid.DataColumn
	 */
	dorado.widget.grid.IndicatorColumn = $extend(dorado.widget.grid.DataColumn, /** @scope dorado.widget.grid.IndicatorColumn.prototype */{
		ATTRIBUTES: /** @scope dorado.widget.grid.IndicatorColumn.prototype */{
			width: {
				defaultValue: 16
			},
			dynaRowHeight: {
				defaultValue: false
			},
			caption: {
				defaultValue: "Indicator"
			},
			property: {
				defaultValue: "none"
			},
			resizeable: {
				defaultValue: false
			},
			filterable: {
				defaultValue: false
			},
			headerRenderer: {
				dontEvalDefaultValue: true,
				defaultValue: function(dom, arg) {
					$fly(dom).empty();
					$fly(dom.parentNode).addClass("indicator");
				}
			},
			renderer: {
				dontEvalDefaultValue: true,
				defaultValue: function(dom, arg) {
					if (arg.data.rowType) return;
					var className = "indicator-none";
					if (arg.data instanceof dorado.Entity) {
						var entity = arg.data;
						var messageState = entity.getMessageState();
						if (messageState == "warn" || messageState == "error") {
							className = "indicator-" + messageState;
						}
						else {
							switch(entity.state) {
								case dorado.Entity.STATE_NEW:
									className = "indicator-new";
									break;
								case dorado.Entity.STATE_MODIFIED:
								case dorado.Entity.STATE_MOVED:
									className = "indicator-modified";
									break;
							}
						}
					}
					dom.innerHTML = '';
					dom.className = "cell indicator " + className;
				}
			}
		}
	});

	/**
	 * @author Benny Bao (mailto:benny.bao@bstek.com)
	 * @class 行号列。
	 * @shortTypeName # ; RowNum
	 * @extends dorado.widget.grid.DataColumn
	 */
	dorado.widget.grid.RowNumColumn = $extend(dorado.widget.grid.DataColumn, /** @scope dorado.widget.grid.RowNumColumn.prototype */{
		ATTRIBUTES: /** @scope dorado.widget.grid.RowNumColumn.prototype */{
			width: {
				defaultValue: 16
			},
			dynaRowHeight: {
				defaultValue: false
			},
			caption: {
				defaultValue: "RowNum"
			},
			align: {
				defaultValue: "center"
			},
			property: {
				defaultValue: "none"
			},
			resizeable: {
				defaultValue: false
			},
			filterable: {
				defaultValue: false
			},
			headerRenderer: {
				dontEvalDefaultValue: true,
				defaultValue: function(dom, arg) {
					$fly(dom).empty();
					$fly(dom.parentNode).addClass("row-num");
				}
			},
			renderer: {
				dontEvalDefaultValue: true,
				defaultValue: function(dom, arg) {
					var row = dom.parentNode.parentNode;
					dom.innerHTML = arg.grid._groupProperty ? '' : row.itemIndex + 1;
				}
			}
		}
	});

	dorado.widget.grid.RowSelectorCellRenderer = $extend(dorado.widget.grid.SubControlCellRenderer, {

		ATTRIBUTES: {
			checkboxMap: {}
		},

		cellMouseDownListener: function(arg) {
			if (arg.grid._selectionMode == "multiRows") return false;
		},

		gridOnSelectionChangedListener: function(grid, arg) {
			var itemModel = grid._itemModel;
			var selectionMode = grid._selectionMode, removed = arg.removed, added = arg.added, checkbox;

			if (selectionMode == "multiRows") {
				if (removed) {
					for(var i = 0; i < removed.length; i++) {
						checkbox = this._checkboxMap[itemModel.getItemId(removed[i])];
						if (checkbox) checkbox.set("checked", false);
					}
				}
				if (added) {
					for(var i = 0; i < added.length; i++) {
						checkbox = this._checkboxMap[itemModel.getItemId(added[i])];
						if (checkbox) checkbox.set("checked", true);
					}
				}
			}
			else if (selectionMode == "singleRow") {
				if (removed) {
					checkbox = this._checkboxMap[itemModel.getItemId(removed)];
					if (checkbox) checkbox.set("checked", false);
				}
				if (added) {
					checkbox = this._checkboxMap[itemModel.getItemId(added)];
					if (checkbox) checkbox.set("checked", true);
				}
			}
		},

		createSubControl: function(arg) {
			var self = this;
			if (!this._listenerBinded) {
				this._listenerBinded = true;
				arg.grid.bind("onSelectionChange", $scopify(this, this.gridOnSelectionChangedListener));
			}

			var checkbox = new dorado.widget.CheckBox({
				iconOnly: true,
				onValueChange: function(checkbox) {
					var grid = arg.grid, innerGrid = grid._innerGrid, selectionMode = grid._selectionMode;
					var data = grid.get("itemModel").getItemById(checkbox._selectDataId), checked = checkbox.get("checked");
					var newSelection = (selectionMode == "multiRows") ? [data] : data;
					innerGrid.replaceSelection.apply(innerGrid, checked ? [null, newSelection] : [newSelection, null]);

					var selection = innerGrid._selection;
					var checked;
					if (selection && selection instanceof Array) {
						checked = (selection.indexOf(data) >= 0);
					}
					else {
						checked = (selection == data);
					}
					if (checkbox.get("checked") !== checked) {
						checkbox.disableListeners();
						checkbox.set("checked", checked);
						checkbox.enableListeners();
					}
				},
				onDestroy: function() {
					var id = checkbox._selectDataId;
					if (id != null) delete self._checkboxMap[id];
				}
			});
			$fly(checkbox.getDom()).mousedown(function() {
				return self.cellMouseDownListener(arg);
			});
			return checkbox;
		},

		refreshSubControl: function(checkbox, arg) {
			if (arg.data.rowType) {
				checkbox.destroy();
				return;
			}
			var grid = arg.grid, data = arg.dataForSelection || arg.data, selection = grid._innerGrid._selection, selectionMode = grid._selectionMode, config = {};
			if (selectionMode == "multiRows") {
				config.checked = (selection && selection.indexOf(data) >= 0);
				config.readOnly = false;
			}
			else if (selectionMode == "singleRow") {
				config.checked = (data == selection);
				config.readOnly = false;
			}
			else {
				config.checked = false;
				config.readOnly = true;
			}
			checkbox.set(config);
			checkbox.refresh();
			checkbox._selectDataId = grid._itemModel.getItemId(data);
			if (!this._checkboxMap) {
				this._checkboxMap = {};
			}
			this._checkboxMap[checkbox._selectDataId] = checkbox;
		}
	});

	/**
	 * @author Benny Bao (mailto:benny.bao@bstek.com)
	 * @class 选择器列。
	 * <p>一般用于辅助表格的多选功能。</p>
	 * @shortTypeName [] ; RowSelector
	 * @extends dorado.widget.grid.DataColumn
	 */
	dorado.widget.grid.RowSelectorColumn = $extend(dorado.widget.grid.DataColumn, /** @scope dorado.widget.grid.RowSelectorColumn.prototype */ {
		ATTRIBUTES: /** @scope dorado.widget.grid.RowSelectorColumn.prototype */{
			width: {
				defaultValue: 16
			},
			dynaRowHeight: {
				defaultValue: false
			},
			align: {
				defaultValue: "center"
			},
			caption: {
				defaultValue: "RowSelector"
			},
			property: {
				defaultValue: "none"
			},
			resizeable: {
				defaultValue: false
			},
			filterable: {
				defaultValue: false
			},
			headerRenderer: {
				dontEvalDefaultValue: true,
				defaultValue: function(dom, arg) {

					function getMenu(column) {
						var menu = column._rowSelectorMenu;
						if (!menu) {
							menu = column._rowSelectorMenu = new dorado.widget.Menu({
								items: [
									{
										name: "select-all",
										caption: $resource("dorado.grid.SelectAll"),
										onClick: function(self) {
											grid.selectAll();
										}
									},
									{
										name: "unselect-all",
										caption: $resource("dorado.grid.UnselectAll"),
										onClick: function(self) {
											grid.unselectAll();
										}
									},
									{
										name: "select-invert",
										caption: $resource("dorado.grid.SelectInvert"),
										onClick: function(self) {
											grid.selectInvert();
										}
									}
								]
							});
							grid.registerInnerControl(menu);
						}
						return menu;
					}

					var grid = arg.grid, column = arg.column, cell = dom.parentNode;
					$fly(dom).empty();

					var $cell = $fly(cell);
					$cell.addClass("row-selector");
					if (!$cell.data("selectionMenuBinded")) {
						$cell.data("selectionMenuBinded", true).click(function() {
							if (grid._selectionMode == "multiRows") {
								var menu = getMenu(column);
								menu.show({
									anchorTarget: cell,
									align: "innerright",
									vAlign: "bottom"
								});
							}
							return false;
						});
					}
				}
			},
			renderer: {
				defaultValue: function() {
					return new dorado.widget.grid.RowSelectorCellRenderer();
				}
			}
		}
	});

	/**
	 * @author Benny Bao (mailto:benny.bao@bstek.com)
	 * @class 过滤栏单元格的渲染器。
	 * @extends dorado.widget.grid.SubControlCellRenderer
	 */
	dorado.widget.grid.FilterBarCellRenderer = $extend(dorado.widget.grid.SubControlCellRenderer, /** @scope dorado.widget.grid.FilterBarCellRenderer.prototype */ {
		createFilterExpressionEditor: function(arg) {
			var self = this, column = arg.column, grid = arg.grid;
			var textEditor = new dorado.widget.TextEditor({
				width: "100%",
				onBlur: function(textEditor) {
					var filterEntity = grid.get("filterEntity");
					var criterion = filterEntity.get(column._property);
					textEditor.set("text", criterion ? dorado.widget.grid.DataColumn.criterionToText(criterion, column) : "");
				},
				onPost: function(textEditor) {
					var criterion = dorado.widget.grid.DataColumn.parseCriterion(textEditor.get("text"), column);
					var filterEntity = grid.get("filterEntity");
					filterEntity.disableObservers();
					filterEntity.set(column._property, criterion);
					filterEntity.enableObservers();

					grid.filter();
				},
				onKeyDown: function(textEditor, arg) {
					if (arg.keyCode == 13) {
						textEditor.post(true);
					}
				},
				onTextEdit: function(textEditor) {
					var criterionDropDown = textEditor.get("trigger");
					if (criterionDropDown && criterionDropDown instanceof dorado.widget.Component &&
						criterionDropDown.get("opened") && criterionDropDown.get("editor") == textEditor) {
						criterionDropDown.close();
					}
				}
			});
			textEditor.set("trigger", "defaultCriterionDropDown");
			return textEditor;
		},

		createSubControl: function(arg) {
			var column = arg.column;
			if (column._property && column._filterable) {
				return this.createFilterExpressionEditor(arg);
			}
			else {
				return null;
			}
		},

		refreshSubControl: function(textEditor, arg) {
			var text, entity = arg.data, column = arg.column, property = column._property, criterion = entity.get(property);

			if (criterion) {
				text = dorado.widget.grid.DataColumn.criterionToText(criterion, column);
			}

			textEditor._cellColumn = arg.column;
			textEditor.disableListeners();
			if (text) {
				textEditor.set("text", text);
			}
			else {
				textEditor.set("value", null);
			}
			textEditor.refresh();
			textEditor.enableListeners();
		}
	});

	dorado.Toolkits.registerPrototype("gridcolumn", {
		"Group": dorado.widget.grid.ColumnGroup,
		"*": dorado.widget.grid.IndicatorColumn,
		"#": dorado.widget.grid.RowNumColumn,
		"[]": dorado.widget.grid.RowSelectorColumn
	});

})();

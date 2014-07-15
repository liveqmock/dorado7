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
	var MIN_COL_WIDTH = 8;

	function getEntityValue(entity, property) {
		if (property.indexOf('.') > 0) {
			return dorado.DataPath.create(property).evaluate(entity, true);
		}
		else {
			return (entity instanceof dorado.Entity) ? entity.get(property) : entity[property];
		}
	}

	function getEntityText(entity, property) {
		var i = property.lastIndexOf('.');
		if (i > 0) {
			if (entity instanceof dorado.Entity) {
				var dataPath = dorado.DataPath.create(property.substring(0, i));
				var subProperty = property.substring(i + 1);
				entity = dataPath.evaluate(entity);
				return entity ? entity.getText(subProperty) : "";
			}
			else {
				return dorado.DataPath.create(property).evaluate(entity, true) || "";
			}
		}
		else {
			return (entity instanceof dorado.Entity) ? entity.getText(property) : entity[property];
		}
	}

	GroupedItemIterator = $extend(dorado.util.Iterator, {
		constructor: function(groups, showFooter, nextIndex) {
			this.groups = groups;
			this.showFooter = showFooter;
			if (nextIndex > 0) {
				nextIndex--;
				var g;
				for(var i = 0; i < groups.length; i++) {
					g = groups[i], gs = g.entities.length + 1 + (showFooter ? 1 : 0);
					if (gs <= nextIndex) {
						nextIndex -= gs;
					}
					else {
						this.groupIndex = i;
						this.entityIndex = nextIndex - 1;
						this.isFirst = this.isLast = false;
						this.currentGroup = g;
						break;
					}
				}
			}
			else {
				this.first();
			}
		},

		first: function() {
			this.groupIndex = 0;
			this.entityIndex = -2;
			this.isFirst = true;
			this.isLast = (this.groups.length == 0);
			this.currentGroup = this.groups[this.groupIndex];
		},

		last: function() {
			this.groupIndex = this.groups.length - 1;
			this.entityIndex = this.currentGroup.length + (this.showFooter ? 1 : 0);
			this.isFirst = (this.groups.length == 0);
			this.isLast = true;
			this.currentGroup = this.groups[this.groupIndex];
		},

		hasPrevious: function() {
			if (this.isFirst || this.groups.length == 0) return false;
			if (this.groupIndex <= 0 && this.entityIndex <= -1) return false;
			return true;
		},

		hasNext: function() {
			if (this.isLast || this.groups.length == 0) return false;
			var maxEntityIndex = this.currentGroup.entities.length + (this.showFooter ? 0 : -1);
			if (this.groupIndex >= this.groups.length - 1 && this.entityIndex >= maxEntityIndex) return false;
			return true;
		},

		current: function() {
			if (this.entityIndex == -1) {
				return this.currentGroup.headerEntity;
			}
			else if (this.entityIndex >= this.currentGroup.entities.length) {
				return this.currentGroup.footerEntity;
			}
			else {
				return this.currentGroup.entities[this.entityIndex];
			}
		},

		previous: function() {
			if (this.entityIndex >= 0) {
				this.entityIndex--;
			}
			else if (this.groupIndex > 0) {
				this.currentGroup = this.groups[--this.groupIndex];
				this.entityIndex = this.currentGroup.entities.length + (this.showFooter ? 0 : -1);
			}
			else {
				this.isFirst = true;
				this.entityIndex = -1;
			}
			return (this.isFirst) ? null : this.current();
		},

		next: function() {
			var maxEntityIndex = this.currentGroup.entities.length + (this.showFooter ? 0 : -1);
			if (this.entityIndex < maxEntityIndex) {
				this.entityIndex++;
			}
			else if (this.groupIndex < this.groups.length - 1) {
				this.currentGroup = this.groups[++this.groupIndex];
				this.entityIndex = -1;
			}
			else {
				this.isLast = true;
				this.entityIndex = maxEntityIndex + 1;
			}
			return (this.isLast) ? null : this.current();
		},

		createBookmark: function() {
			return {
				groupIndex: this.groupIndex,
				entityIndex: this.entityIndex,
				currentEntity: this.currentEntity,
				isFirst: this.isFirst,
				isLast: this.isLast
			};
		},

		restoreBookmark: function(bookmark) {
			this.groupIndex = bookmark.groupIndex;
			this.entityIndex = bookmark.entityIndex;
			this.currentEntity = bookmark.currentEntity;
			this.isFirst = bookmark.isFirst;
			this.isLast = bookmark.isLast;
		}
	});

	/**
	 * @author Benny Bao (mailto:benny.bao@bstek.com)
	 * @class 表格数据模型。
	 * <p>表格数据模型是用于辅助表格控件管理数据的对象。</p>
	 * @extends dorado.widget.list.ItemModel
	 * @param {dorado.widget.AbstractGrid} grid 所属的表格。
	 */
	dorado.widget.grid.ItemModel = $extend(dorado.widget.list.ItemModel, /** @scope dorado.widget.grid.ItemModel.prototype */ {
		resetFilterEntityOnSetItem: true,

		constructor: function(grid) {
			this.grid = grid;

			var items = this._items, footerData = {};
			var footerEntity = this.footerEntity = (items instanceof dorado.EntityList) ? items.createChild(footerData, true) : new dorado.Entity(footerData);
			footerEntity.rowType = "footer";
			footerEntity.ignorePropertyPath = true;
			footerEntity.acceptUnknownProperty = true;
			footerEntity.disableEvents = true;
			footerEntity._setObserver({
				grid: grid,
				entityMessageReceived: function(messageCode, arg) {
					if (messageCode == 0 ||
						messageCode == dorado.Entity._MESSAGE_DATA_CHANGED ||
						messageCode == dorado.Entity._MESSAGE_REFRESH_ENTITY) {
						var grid = this.grid;
						if (!grid._innerGrid) return;
						if (grid._domMode == 2) grid._fixedInnerGrid.refreshFrameFooter();
						grid._innerGrid.refreshFrameFooter();
					}
				}
			});

			var filterEntity = this.filterEntity = new dorado.Entity();
			filterEntity.rowType = "filter";
			filterEntity.ignorePropertyPath = true;
			filterEntity.acceptUnknownProperty = true;
			filterEntity.disableEvents = true;
			filterEntity._setObserver({
				grid: grid,
				entityMessageReceived: function(messageCode, arg) {
					if (messageCode == 0 ||
						messageCode == dorado.Entity._MESSAGE_DATA_CHANGED ||
						messageCode == dorado.Entity._MESSAGE_REFRESH_ENTITY) {
						var grid = this.grid;
						if (!grid._innerGrid) return;
						if (grid._domMode == 2) grid._fixedInnerGrid.refreshFilterBar();
						grid._innerGrid.refreshFilterBar();
					}
				}
			});

			var oldSet = filterEntity._set;
			filterEntity._set = function(property, value) {
				if (typeof value == "string") {
					var dataColumns = grid.get("dataColumns"), column;
					for(var i = 0; i < dataColumns.length; i++) {
						if (dataColumns[i]._name == property) {
							column = dataColumns[i];
							break;
						}
					}
					value = dorado.widget.grid.DataColumn.parseCriterion(value, column);
				}
				oldSet.call(this, property, value);
			};

			$invokeSuper.call(this, arguments);
		},

		getItems: function() {
			return this._originItems || this._items;
		},

		setItems: function(items) {
			if ((this._originItems || this._items) == items) return;

			if (this.resetFilterEntityOnSetItem) {
				var filterEntity = this.filterEntity;
				filterEntity.disableObservers();
				filterEntity.clearData();
				filterEntity.enableObservers();
			}

			$invokeSuper.call(this, arguments);

			this.refreshItems();
		},

		clearSortFlags: function() {
			var grid = this.grid;
			if (grid._skipClearSortFlags) {
				delete grid._skipClearSortFlags;
				return;
			}
			if (grid._columnsInfo) {
				var columns = grid._columnsInfo.dataColumns;
				for(var i = 0; i < columns.length; i++) {
					columns[i].set("sortState", null);
				}
			}
		},

		refreshItems: function() {
			var grid = this.grid;
			if (grid._rendered) {
				this.clearSortFlags();
				if (grid._groupProperty) {
					this.group();
				}
				else {
					this.refreshSummary();
				}
			}
		},

		extractSummaryColumns: function(dataColumns) {
			var columns = [];
			for(var i = 0; i < dataColumns.length; i++) {
				var column = dataColumns[i];
				if (!column._summaryType || column._property == "none") continue;
				var cal = dorado.SummaryCalculators[column._summaryType];
				if (cal) {
					columns.push({
						name: column._name,
						property: column._property,
						calculator: cal
					});
				}
			}
			return columns.length ? columns : null;
		},

		initSummary: function(summary) {
			var columns = this._summaryColumns;
			for(var i = 0; i < columns.length; i++) {
				var col = columns[i], cal = col.calculator;
				summary[col.property] = (typeof cal == "function") ? 0 : cal.getInitialValue();
			}
		},

		accumulate: function(entity, summary) {
			var columns = this._summaryColumns;
			for(var i = 0; i < columns.length; i++) {
				var col = columns[i], cal = col.calculator;
				summary[col.property] = ((typeof cal == "function") ? cal : cal.accumulate)(summary[col.property], entity, col.property);
			}
		},

		finishSummary: function(summary) {
			var columns = this._summaryColumns;
			for(var i = 0; i < columns.length; i++) {
				var col = columns[i], cal = col.calculator;
				if (typeof cal != "function") summary[col.property] = cal.getFinalValue(summary[col.property]);
			}
			delete summary.$expired;
		},

		group: function() {

			function getGroupSysEntityObserver(grid) {
				if (!grid._groupSysEntityObserver) {
					grid._groupSysEntityObserver = {
						grid: grid,
						entityMessageReceived: function(messageCode, arg) {
							if (messageCode == 0 ||
								messageCode == dorado.Entity._MESSAGE_DATA_CHANGED ||
								messageCode == dorado.Entity._MESSAGE_REFRESH_ENTITY) {
								if (!this.grid._rendered) return;
								this.grid.refreshEntity(arg.entity);
							}
						}
					};
				}
				return grid._groupSysEntityObserver;
			}

			this.filter(); // unfilter;
			var items = this._items;
			if (!items) return;

			var grid = this.grid, groupProperty = grid._groupProperty;
			var isArray = items instanceof Array;
			var entities = isArray ? items.slice(0) : items.toArray();
			if (grid._groupOnSort) {
				dorado.DataUtil.sort(entities, {
					property: groupProperty
				});
			}
			this.entityCount = entities.length;

			var columns = this._summaryColumns;
			var groups = this.groups = [], groupMap = this.groupMap = {}, entityMap = this.entityMap = {};
			var entity, groupValue, curGroupValue, curGroup, groupEntities, headerEntity, footerEntity, summary, totalSummary = this.footerEntity._data;
			if (columns) this.initSummary(totalSummary);

			for(var i = 0; i < entities.length; i++) {
				entity = entities[i];
				groupValue = getEntityText(entity, groupProperty);
				if (curGroupValue != groupValue) {
					if (curGroup) {
						headerEntity.set("$count", groupEntities.length);
						footerEntity.set("$count", groupEntities.length);
						if (columns) this.finishSummary(summary);
					}
					curGroupValue = groupValue;

					headerEntity = isArray ? new dorado.Entity() : items.createChild(null, true);
					headerEntity.rowType = "header";
					headerEntity.ignorePropertyPath = true;
					headerEntity.acceptUnknownProperty = true;
					headerEntity.disableEvents = true;
					headerEntity.set("$groupValue", groupValue);
					headerEntity._setObserver(getGroupSysEntityObserver(grid));

					footerEntity = isArray ? new dorado.Entity() : items.createChild(null, true);
					footerEntity.rowType = "footer";
					footerEntity.ignorePropertyPath = true;
					footerEntity.acceptUnknownProperty = true;
					footerEntity.disableEvents = true;
					footerEntity.set("$groupValue", groupValue);
					footerEntity._setObserver(getGroupSysEntityObserver(grid));

					groupEntities = [], summary = footerEntity._data;
					curGroup = {
						expanded: true,
						entities: groupEntities,
						headerEntity: headerEntity,
						footerEntity: footerEntity
					};
					if (columns) this.initSummary(summary);

					groups.push(curGroup);
					groupMap[groupValue] = curGroup;
				}

				if (columns) {
					this.accumulate(entity, summary);
					this.accumulate(entity, totalSummary);
				}

				groupEntities.push(entity);
				if (entity instanceof dorado.Entity) entityMap[entity.entityId] = groupValue;
			}
			if (curGroup) {
				headerEntity.set("$count", groupEntities.length);
				footerEntity.set("$count", groupEntities.length);
				if (columns) this.finishSummary(summary);
			}
			if (columns) this.finishSummary(totalSummary);
			this.footerEntity.timestamp = dorado.Core.getTimestamp();
			this.clearSortFlags();
		},

		ungroup: function() {
			delete this.groups;
			delete this.groupMap;
			delete this.entityMap;
			this.clearSortFlags();
		},

		filter: function(criterions, customFilter) {
			var hasParam = (criterions && criterions.length > 0);
			if (hasParam) this.ungroup();
			$invokeSuper.call(this, arguments);
			if (hasParam) this.refreshSummary();
		},

		refreshSummary: function() {
			if (!this._summaryColumns) return;
			var totalSummary = this.footerEntity._data;
			if (this.groups) {
				var groups = this.groups, columns = this._summaryColumns, summary, entity;
				this.initSummary(totalSummary);
				for(var i = 0; i < groups.length; i++) {
					var group = groups[i], entities = group.entities, headerEntity = group.headerEntity, footerEntity = group.footerEntity;
					summary = (footerEntity.get("$expired")) ? footerEntity._data : null;
					if (summary) this.initSummary(summary);
					for(var j = 0; j < entities.length; j++) {
						entity = entities[j];
						if (summary) this.accumulate(entity, summary);
						this.accumulate(entity, totalSummary);
					}
					if (summary) {
						this.finishSummary(summary);

						headerEntity.set("$count", entities.length);
						footerEntity.set("$count", entities.length);
						headerEntity.set("$expired", false);
						footerEntity.set("$expired", false);
					}
				}
				this.finishSummary(totalSummary);
			}
			else {
				this.initSummary(totalSummary);
				if (this._items) {
					var self = this;
					if (this._items instanceof Array) {
						jQuery.each(this._items, function(i, entity) {
							self.accumulate(entity, totalSummary);
						});
					}
					else {
						for(var it = this._items.iterator({ currentPage: true }); it.hasNext();) {
							self.accumulate(it.next(), totalSummary);
						}
					}
				}
				this.finishSummary(totalSummary);
			}
			this.footerEntity.timestamp = dorado.Core.getTimestamp();
			this.footerEntity.sendMessage(0);
		},

		iterator: function() {
			if (this.groups) {
				return new GroupedItemIterator(this.groups, this.grid._showGroupFooter, this._startIndex || 0);
			}
			else {
				return $invokeSuper.call(this, arguments);
			}
		},

		getItemCount: function() {
			if (this.groups) {
				return this.entityCount + this.groups.length * (this.grid._showGroupFooter ? 2 : 1);
			}
			else {
				return $invokeSuper.call(this, arguments);
			}
		},

		getItemAt: function(index) {
			if (this.groups) {
				var grid = this.grid, groupProperty = grid.groupProperty, groups = this.groups, showFooter = grid._showGroupFooter, g;
				for(var i = 0; i < groups.length; i++) {
					g = groups[i], gs = g.entities.length + 1 + (showFooter ? 1 : 0);
					if (gs <= index) {
						index -= gs;
					}
					else {
						if (index == 0) return g.headerEntity;
						if (index <= g.entities.length) return g.entities[index - 1];
						return g.footerEntity;
					}
				}
			}
			else {
				return $invokeSuper.call(this, arguments);
			}
		},

		getItemIndex: function(item) {
			if (this.groups) {
				var grid = this.grid, groupProperty = grid._groupProperty, groups = this.groups, showFooter = grid._showGroupFooter;
				var groupValue;
				if (item.rowType) {
					groupValue = item.get("$groupValue");
				}
				else {
					groupValue = ((item instanceof dorado.Entity) ? this.entityMap[item.entityId] : item[groupProperty]) + '';
				}
				var group = this.groupMap[groupValue], index = 0;
				for(var i = 0; i < groups.length; i++) {
					var g = groups[i];
					if (g == group) break;
					index += g.entities.length + 1;
					if (showFooter) index++;
				}
				var i = group.entities.indexOf(item);
				if (i < 0) i = (item.rowType == "header" ? -1 : group.entities.length);
				index += i + 1;
				return index;
			}
			else {
				return $invokeSuper.call(this, arguments);
			}
		},

		sort: function(sortParams, comparator) {
			if (!this.getItemCount()) return;

			if (!(sortParams instanceof Array)) sortParams = [sortParams];
			var grid = this.grid, columns = grid._columnsInfo.dataColumns, sortParamMap = {};
			for(var i = 0; i < sortParams.length; i++) {
				var sortParam = sortParams[i];
				if (sortParam.property) sortParamMap[sortParam.property] = !!sortParam.desc;
			}
			for(var i = 0; i < columns.length; i++) {
				var column = columns[i], desc = sortParamMap[column._property];
				if (desc === undefined) {
					column.set("sortState", null);
				}
				else {
					column.set("sortState", desc ? "desc" : "asc");
				}
			}

			if (this.groups) {
				var groups = this.groups;
				for(var i = 0; i < groups.length; i++) {
					var group = groups[i];
					dorado.DataUtil.sort(group.entities, sortParams, comparator);
				}
			}
			else {
				var items = this._items;
				if (items instanceof Array) {
					$invokeSuper.call(this, arguments);
				}
				else {
					for(var i = 1; i <= items.pageCount; i++) {
						if (!items.isPageLoaded(i)) continue;
						var page = items.getPage(i);
						var array = page.toArray();
						dorado.DataUtil.sort(array, sortParams, comparator);
						var entry = page.first, j = 0;
						while(entry != null) {
							entry.data = array[j];
							page._registerEntry(entry);
							entry = entry.next;
							j++;
						}
						items.timestamp = dorado.Core.getTimestamp();
					}
				}
			}
		},

		getAllDataEntities: function() {
			var v = [];
			for(var it = this.iterator(); it.hasNext();) {
				var entity = it.next();
				if (!entity.rowType) v.push(entity);
			}
			return v;
		}
	});

	var overrides = {
		constructor: function(itemModel) {
			this._itemModel = itemModel;
		}
	};
	var dp = ["setStartIndex", "setItemDomSize", "setScrollPos", "setItems"];
	dorado.Object.eachProperty(dorado.widget.list.ItemModel.prototype, function(p, v) {
		if (typeof v == "function" && p != "constructor") {
			if (dp.indexOf(p) >= 0) {
				overrides[p] = dorado._NULL_FUNCTION;
			}
			else {
				overrides[p] = new Function("return this._itemModel." + p +
					".apply(this._itemModel, arguments)");
			}
		}
	});

	var PassiveItemModel = $extend(dorado.widget.list.ItemModel, overrides);

	function getCellOffsetTop(cell, rowHeight) {
		return (dorado.Browser.webkit) ? (cell.parentNode.sectionRowIndex * (rowHeight + 1)) : cell.offsetTop;
	}

	/**
	 * @author Benny Bao (mailto:benny.bao@bstek.com)
	 * @class 表格控件的抽象类。
	 * <p>
	 * AbstractGrid的get方法在{@link dorado.AttributeSupport#get}的基础上做了增强。
	 * 除了原有的读取属性值的功能之外，此方法还另外提供了下面的用法。
	 * <ul>
	 *    <li>当传入一个以#开头的字符串时，#后面的内容将被识别成列的名称，表示根据名称获取表格列。参考{@link dorado.widget.AbstractGrid#getColumn}。</li>
	 * </ul>
	 * </p>
	 * @abstract
	 * @extends dorado.widget.AbstractList
	 * @extends dorado.widget.grid.ColumnModel
	 */
	dorado.widget.AbstractGrid = $extend([dorado.widget.AbstractList, dorado.widget.grid.ColumnModel], /** @scope dorado.widget.AbstractGrid.prototype */ {
		$className: "dorado.widget.AbstractGrid",

		ATTRIBUTES: /** @scope dorado.widget.AbstractGrid.prototype */ {

			className: {
				defaultValue: "d-grid"
			},

			/**
			 * 高亮显示当前行。
			 * @type boolean
			 * @attribute skipRefresh
			 * @default true
			 */
			highlightCurrentRow: {
				defaultValue: true,
				skipRefresh: true,
				setter: function(v) {
					this._highlightCurrentRow = v;
					if (this._innerGrid) this._innerGrid.set("highlightCurrentRow", v);
					if (this._fixedInnerGrid) this._fixedInnerGrid.set("highlightCurrentRow", v);
				}
			},

			/**
			 * 高亮显示鼠标悬停的行。
			 * @type boolean
			 * @attribute
			 * @default true
			 */
			highlightHoverRow: {
				defaultValue: true
			},

			/**
			 * 高亮显示多选选中的行。
			 * @type boolean
			 * @attribute
			 * @default true
			 */
			highlightSelectedRow: {
				defaultValue: true
			},

			/**
			 * 默认的行高。
			 * @type int
			 * @attribute
			 * @default 18
			 */
			rowHeight: {
				defaultValue: (dorado.Browser.isTouch || $setting["common.simulateTouch"]) ?
					($setting["touch.Grid.defaultRowHeight"] || 30) :
					($setting["widget.Grid.defaultRowHeight"] || 22)
			},

			/**
			 * 默认的标题栏行高。
			 * @type int
			 * @attribute
			 * @default 22
			 */
			headerRowHeight: {
				defaultValue: (dorado.Browser.isTouch || $setting["common.simulateTouch"]) ?
					($setting["touch.Grid.defaultRowHeight"] || 30) :
					($setting["widget.Grid.defaultRowHeight"] || 22)
			},

			/**
			 * 默认的页脚栏行高。
			 * @type int
			 * @attribute
			 * @default 22
			 */
			footerRowHeight: {
				defaultValue: (dorado.Browser.isTouch || $setting["common.simulateTouch"]) ?
					($setting["touch.Grid.defaultRowHeight"] || 30) :
					($setting["widget.Grid.defaultRowHeight"] || 22)
			},

			/**
			 * 滚动模式。
			 * <p>
			 * 此属性具有如下几种取值：
			 * <ul>
			 * <li>simple - 表示使用简单的滚动模式。在此种滚动模式下"视口"功能将不会被启用。</li>
			 * <li>lazyRender - 懒渲染模式，类似于简单的滚动模式。
			 * 但是对于那些暂时不可见的列表项将只会创建一个空的占位对象，而不会进行具体的渲染，直到该列表项真正变为可见。<br>
			 *  懒渲染模式只在较微小的程度上影响列表控件的操作体验。
			 * </li>
			 * <li>viewport - 表示使用简单的滚动模式。在此种滚动模式下"视口"功能将被启用。<br>
			 * "视口"功能是指不创建在列表中不可见的列表项，以便于最大程度的优化列表控件初始渲染的效率。
			 * "视口"会在一定程度上影响列表控件的操作体验。</li>
			 * </ul>
			 * </p>
			 * @type String
			 * @attribute
			 * @default "lazyRender"
			 */
			scrollMode: {
				defaultValue: "lazyRender"
			},

			/**
			 * 最左边锁定的列数。
			 * <p>
			 * 注意：要使锁定功能生效，必须为表格控件定义高度和宽度。
			 * </p>
			 * @type int
			 * @attribute
			 */
			fixedColumnCount: {
				defaultValue: 0
			},

			/**
			 * 是否显示表格控件的表格头。
			 * @type boolean
			 * @attribute
			 * @default true
			 */
			showHeader: {
				defaultValue: true
			},

			/**
			 * 是否显示表格控件的表格汇总栏。
			 * @type boolean
			 * @attribute
			 */
			showFooter: {},

			/**
			 * 是否只读。
			 * @type boolean
			 * @attribute
			 */
			readOnly: {},

			/**
			 * 是否支持动态行高的功能。
			 * @type boolean
			 * @attribute writeBeforeReady
			 */
			dynaRowHeight: {
				writeBeforeReady: true
			},

			/**
			 * 默认的单元格渲染器。
			 * @type dorado.Renderer
			 * @attribute
			 */
			cellRenderer: {
				setter: function(value) {
					if (typeof value == "string") value = eval("new " + value + "()");
					this._cellRenderer = value;
				}
			},

			/**
			 * 默认的列头渲染器。
			 * @type dorado.Renderer
			 * @attribute
			 */
			headerRenderer: {
				setter: function(value) {
					if (typeof value == "string") value = eval("new " + value + "()");
					this._headerRenderer = value;
				}
			},

			/**
			 * 默认的汇总栏渲染器。
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
			 * 默认的过滤栏渲染器。
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
			 * 默认的行渲染器。
			 * @type dorado.Renderer
			 * @attribute
			 */
			rowRenderer: {},

			/**
			 * 默认的分组标题行渲染器。
			 * @type dorado.Renderer
			 * @attribute
			 */
			groupHeaderRenderer: {},

			/**
			 * 默认的分组汇总栏行渲染器。
			 * @type dorado.Renderer
			 * @attribute
			 */
			groupFooterRenderer: {},

			/**
			 * 当前列。
			 * @type dorado.widget.grid.Column|String|int
			 * @attribute skipRefresh
			 */
			currentColumn: {
				skipRefresh: true,
				setter: function(column) {
					if (!(column instanceof dorado.widget.grid.Column)) {
						column = this.getColumn(column);
					}
					this.setCurrentColumn(column);
				}
			},

			/**
			 * 表格中所有数据列的数组。
			 * 即所有(@link dorado.widget.grid.DataColumn}的数组。
			 * @type dorado.widget.grid.DataColumn[]
			 * @attribute readOnly
			 */
			dataColumns: {
				getter: function() {
					return this._columnsInfo ? this._columnsInfo.dataColumns : [];
				},
				readOnly: true
			},

			/**
			 * 表格当前是否正处于编辑状态。
			 * @type boolean
			 * @attribute readOnly skipRefresh
			 * @default true
			 */
			editing: {
				defaultValue: true,
				readOnly: true,
				skipRefresh: true,
				getter: function(p, v) {
					return this._editing;
				}
			},

			/**
			 * 是否允许用户通过界面操作使表格中没有任何选中项。
			 * <p>
			 * 此属性只在当列表中存在表格项是有意义。
			 * 例如对于表格控件，当此属性为true时，如果用户点击了表格中空白区域后，表格的当前行将被设置为空。
			 * </p>
			 * <p>
			 * 此属性对于那些支持数据绑定的列表型控件可能无效。
			 * </p>
			 * @type boolean
			 * @attribute skipRefresh
			 */
			allowNoCurrent: {
				skipRefresh: true,
				setter: function(v) {
					this._allowNoCurrent = v;
					if (this._fixedInnerGrid) this._fixedInnerGrid.set("allowNoCurrent", v);
					if (this._innerGrid) this._innerGrid.set("allowNoCurrent", v);
				}
			},

			/**
			 * 选择模式。
			 * <p>
			 * 此属性具有如下几种取值：
			 * <ul>
			 * <li>none - 不支持选择模式。</li>
			 * <li>singleRow - 单行选择。</li>
			 * <li>multiRows - 多行选择。</li>
			 * </ul>
			 * </p>
			 * @type String
			 * @attribute skipRefresh
			 * @default "none"
			 */
			selectionMode: {
				defaultValue: "none",
				skipRefresh: true,
				setter: function(v) {
					if (this._innerGrid) this._innerGrid.set("selectionMode", v);
					this._selectionMode = v;
				}
			},

			/**
			 * 表格中的当前选中项。
			 * @type Object|Object[]
			 * @attribute
			 */
			selection: {
				getter: function() {
					if (this._innerGrid) {
						return this._innerGrid.get("selection");
					}
					else if (this._selection) {
						return this._selection;
					}
					else {
						return ("multiRows" == this._selectionMode) ? [] : null;
					}
				},
				setter: function(selection) {
					if (selection == null && ["multiRows", "multiCells"].indexOf(this._selectionMode) >= 0) selection = [];
					if (this._innerGrid) {
						this._innerGrid.set("selection", selection);
					}
					else {
						this._selection = selection;
					}
				}
			},

			/**
			 * 分组属性。
			 * @type String
			 */
			groupProperty: {
				setter: function(v) {
					if (this._groupProperty == v) return;
					this._groupProperty = v;
					if (v != null) {
						this._itemModel.group();
					}
					else {
						this._itemModel.ungroup();
					}
				}
			},

			/**
			 * 是否需要在对数据进行分组之前先进行自动排序。
			 * @type String
			 * @attribute skipRefresh
			 * @default true
			 */
			groupOnSort: {
				defaultValue: true,
				skipRefresh: true
			},

			/**
			 * 是否显示分组汇总栏。
			 * @type boolean
			 * @attribute
			 */
			showGroupFooter: {},

			/**
			 * 表格汇总栏对应的数据实体。
			 * <p>当我们需要手工的设置表格汇总栏中的数据时，应该直接修改此数据实体中相应属性的值。</p>
			 * @type dorado.Entity
			 * @attribute readOnly
			 */
			footerEntity: {
				readOnly: true,
				getter: function(p) {
					return this._itemModel.footerEntity;
				}
			},

			/**
			 * 是否表格过滤栏。
			 * @type boolean
			 * @attribute
			 */
			showFilterBar: {},

			/**
			 * 表格过滤栏对应的数据实体。
			 * <p>当我们需要手工的设置表格过滤栏中的数据时，应该直接修改此数据实体中相应属性的值。</p>
			 * @type dorado.Entity
			 * @attribute readOnly
			 */
			filterEntity: {
				readOnly: true,
				getter: function(p) {
					return this._itemModel.filterEntity;
				}
			},

			/**
			 * 表格列的宽度调整模式。
			 * <p>
			 * 即是否及如何自动调整各列的宽度以适应整个表格的宽度。此属性在fixedColumnCount生效时不起作用。
			 * </p>
			 * <p>
			 * 可选的值包括：
			 * <ul>
			 * <li>off    -    不启用列宽度的自动调整。</li>
			 * <li>stretchableColumns    -    只调整那些可伸缩的列，即那些width属性设置为*的列。</li>
			 * <li>lastColumn    -    只调整最后一列。</li>
			 * <li>allColumns    -    按照各列宽度的权重，对所有列进行调整。</li>
			 * <li>allResizeableColumns    -    按照各列宽度的权重，对所有可调整宽度的列（即resizeable=true的列）进行调整。</li>
			 * </ul>
			 * </p>
			 * @type String
			 * @default "stretchableColumns"
			 * @attribute
			 */
			stretchColumnsMode: {
				defaultValue: "stretchableColumns"
			}
		},

		EVENTS: /** @scope dorado.widget.AbstractGrid.prototype */ {
			/**
			 * 当系统尝试获得某单元格对应的编辑器时触发的事件。
			 * @param {Object} self 事件的发起者，即控件本身。
			 * @param {Object} arg 事件的参数。
			 * @param {Object|dorado.Entity} arg.data 当前要编辑的行所对应的数据或数据实体。
			 * @param {dorado.widget.grid.Column} arg.column 当前要编辑的列。
			 * @param {dorado.widget.grid.CellEditor} arg.cellEditor 系统默认的单元格编辑器。您可以直接修改该编辑器。
			 * @return {boolean} 是否要继续后续事件的触发操作，不提供返回值时系统将按照返回值为true进行处理。
			 * @event
			 */
			onGetCellEditor: {},

			/**
			 * 当数据行被点击时触发的事件。
			 * @param {Object} self 事件的发起者，即控件本身。
			 * @param {Object} arg 事件的参数。
			 * @param {dorado.widget.grid.Column} arg.column 被点中的列。
			 * @param {dorado.Entity|Object} arg.data 行对应的数据实体。
			 * @param {String} arg.rowType 行的类型，目前可能的取值包括：
			 * <ul>
			 * <li>null    -    普通的数据行。</li>
			 * <li>header    -    数据分组模式下的分组标题行，参考{@link dorado.widget.AbstractGrid#attribute:groupProperty}。</li>
			 * <li>footer    -    数据分组模式下的分组汇总行，参考{@link dorado.widget.AbstractGrid#attribute:groupProperty}。</li>
			 * </ul>
			 * @param {Event} arg.event DHTML中的事件event参数。
			 * @return {boolean} 是否要继续后续事件的触发操作，不提供返回值时系统将按照返回值为true进行处理。
			 * @event
			 */
			onDataRowClick: {},

			/**
			 * 当数据行被双击时触发的事件。
			 * @param {Object} self 事件的发起者，即控件本身。
			 * @param {Object} arg 事件参数。
			 * @param {dorado.widget.grid.Column} arg.column 被点中的列。
			 * @param {dorado.Entity|Object} arg.data 行对应的数据实体。
			 * @param {String} arg.rowType 行的类型，目前可能的取值包括：
			 * <ul>
			 * <li>null    -    普通的数据行。</li>
			 * <li>header    -    数据分组模式下的分组标题行，参考{@link dorado.widget.AbstractGrid#attribute:groupProperty}。</li>
			 * <li>footer    -    数据分组模式下的分组汇总行，参考{@link dorado.widget.AbstractGrid#attribute:groupProperty}。</li>
			 * </ul>
			 * @param {Event} arg.event DHTML中的事件event参数。
			 * @return {boolean} 是否要继续后续事件的触发操作，不提供返回值时系统将按照返回值为true进行处理。
			 * @event
			 */
			onDataRowDoubleClick: {},

			/**
			 * 当表格控件渲染其中的某个行时触发的事件。
			 * @param {Object} self 事件的发起者，即组件本身。
			 * @param {Object} arg 事件参数。
			 * @param {HTMLElement} arg.dom 行对应的DOM对象。
			 * @param {dorado.Entity|Object} arg.data 行对应的数据实体。
			 * @param {String} arg.rowType 行的类型，目前可能的取值包括：
			 * <ul>
			 * <li>null    -    普通的数据行。</li>
			 * <li>header    -    数据分组模式下的分组标题行，参考{@link dorado.widget.AbstractGrid#attribute:groupProperty}。</li>
			 * <li>footer    -    数据分组模式下的分组汇总行，参考{@link dorado.widget.AbstractGrid#attribute:groupProperty}。</li>
			 * </ul>
			 * @param {boolean} #arg.processDefault=true 是否在事件结束后继续使用系统默认的渲染逻辑。
			 * @return {boolean} 是否要继续后续事件的触发操作，不提供返回值时系统将按照返回值为true进行处理。
			 * @event
			 */
			onRenderRow: {},

			/**
			 * 当表格控件渲染其中的某个数据单元格时触发的事件。
			 * @param {Object} self 事件的发起者，即组件本身。
			 * @param {Object} arg 事件参数。
			 * @param {HTMLElement} arg.dom 对应的DOM对象。
			 * @param {dorado.Entity|Object} arg.data 行对应的数据实体。
			 * @param {dorado.widget.grid.Column} arg.column 当前要渲染的列，当分组标题行中的单元格触发此事件时此参数的值将是null。
			 * @param {String} arg.rowType 行的类型，目前可能的取值包括：
			 * <ul>
			 * <li>null    -    普通的数据行。</li>
			 * <li>header    -    数据分组模式下的分组标题行，参考{@link dorado.widget.AbstractGrid#attribute:groupProperty}。</li>
			 * <li>footer    -    数据分组模式下的分组汇总行，参考{@link dorado.widget.AbstractGrid#attribute:groupProperty}。</li>
			 * </ul>
			 * @param {boolean} #arg.processDefault 是否在事件结束后继续使用系统默认的渲染逻辑。
			 * @return {boolean} 是否要继续后续事件的触发操作，不提供返回值时系统将按照返回值为true进行处理。
			 * @event
			 */
			onRenderCell: {},

			/**
			 * 当表格控件渲染其中的某列的列头时触发的事件。
			 * @param {Object} self 事件的发起者，即组件本身。
			 * @param {Object} arg 事件参数。
			 * @param {HTMLElement} arg.dom 列头对应的DOM对象。
			 * @param {dorado.Entity|Object} arg.data 行对应的数据实体。
			 * @param {dorado.widget.grid.Column} arg.column 对应的列。
			 * @param {boolean} #arg.processDefault 是否在事件结束后继续使用系统默认的渲染逻辑。
			 * @return {boolean} 是否要继续后续事件的触发操作，不提供返回值时系统将按照返回值为true进行处理。
			 * @event
			 */
			onRenderHeaderCell: {},

			/**
			 * 当表格控件渲染其中的某列的列的汇总栏时触发的事件。
			 * @param {Object} self 事件的发起者，即组件本身。
			 * @param {Object} arg 事件参数。
			 * @param {HTMLElement} arg.dom 列头对应的DOM对象。
			 * @param {dorado.widget.grid.Column} arg.column 对应的列。
			 * @param {boolean} #arg.processDefault 是否在事件结束后继续使用系统默认的渲染逻辑。
			 * @return {boolean} 是否要继续后续事件的触发操作，不提供返回值时系统将按照返回值为true进行处理。
			 * @event
			 */
			onRenderFooterCell: {},

			/**
			 * 当用户点击某个列的列头时触发的事件。
			 * @param {Object} self 事件的发起者，即组件本身。
			 * @param {Object} arg 事件参数。
			 * @param {dorado.widget.grid.Column} arg.column 表格列。
			 * @param {boolean} #arg.processDefault=true 是否在事件结束后继续执行系统默认的逻辑，即排序逻辑。
			 * @return {boolean} 是否要继续后续事件的触发操作，不提供返回值时系统将按照返回值为true进行处理。
			 * @event
			 */
			onHeaderClick: {},

			/**
			 * 当用户将要改变表格中某单元格中的数值之前触发的事件。
			 * <p>
			 * 注意，在此事件中有两种方法可以终止本次确认操作。直接抛出一个异常或者将arg.processDefault参数设置为false。<br>
			 * 我们推荐您在此事件中使用直接抛出一个异常的方式在终止确认操作，因为这样系统可以在终止的同时得到异常信息中包含的具体终止原因。
			 * </p>
			 * @param {Object} self 事件的发起者，即组件本身。
			 * @param {Object} arg 事件参数。
			 * @param {Object|dorado.Entity} arg.entity 用户编辑的数据实体对象。
			 * @param {dorado.widget.grid.DataColumn} arg.column 编辑操作对应的表格列。
			 * @param {Object} arg.value 将要写入单元格的新数值。
			 * @param {boolean} #arg.processDefault=true 是否在事件结束后继续执行系统默认的确认动作。
			 * @return {boolean} 是否要继续后续事件的触发操作，不提供返回值时系统将按照返回值为true进行处理。
			 * @event
			 */
			beforeCellValueEdit: {},

			/**
			 * 当用户改变表格中某单元格中的数值之后触发的事件。
			 * @param {Object} self 事件的发起者，即组件本身。
			 * @param {Object} arg 事件参数。
			 * @param {Object|dorado.Entity} arg.entity 用户编辑的数据实体对象。
			 * @param {dorado.widget.grid.DataColumn} arg.column 编辑操作对应的表格列。
			 * @return {boolean} 是否要继续后续事件的触发操作，不提供返回值时系统将按照返回值为true进行处理。
			 * @event
			 */
			onCellValueEdit: {}
		},

		constructor: function() {
			this._columns = new dorado.widget.grid.ColumnList(this, dorado._GET_NAME);
			this._grid = this; // for ColumnModel
			$invokeSuper.call(this, arguments);
		},

		destroy: function() {
			this._columns.destroy();
			$invokeSuper.call(this);
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

		createItemModel: function() {
			return new dorado.widget.grid.ItemModel(this);
		},

		/**
		 * 返回当前行所对应的数据。
		 * @return {Object|dorado.Entity} 当前子元素所对应的数据。
		 */
		getCurrentItem: function() {
			return this._innerGrid.getCurrentItem();
		},

		notifySizeChange: function() {
			if (!this.xScroll || !this.yScroll) $invokeSuper.call(this, arguments);
		},

		createDom: function() {
			var dom = $invokeSuper.call(this, arguments);
			$fly(dom).mousewheel($scopify(this, function(evt, delta) {
				var divScroll = this._divScroll;
				if (!divScroll) return;
				if (divScroll.scrollHeight > divScroll.clientHeight) {
					var scrollTop = divScroll.scrollTop - delta * this._rowHeight * 2;
					if (scrollTop <= 0) {
						scrollTop = 0;
					}
					else if (scrollTop + divScroll.clientHeight > divScroll.scrollHeight) {
						scrollTop = divScroll.scrollHeight - divScroll.clientHeight;
					}
					if (scrollTop != divScroll.scrollTop) {
						divScroll.scrollTop = scrollTop;
						this.hideCellEditor();
						return false;
					}
				}
			}));
			return dom;
		},

		refreshDom: function(dom) {

			function getDivScroll() {

				if (this._divScroll) {
					return this._divScroll;
				}

				var style;
				if (dorado.Browser.isTouch || $setting["common.simulateTouch"]) {
					style = {
						width: "100%",
						height: "100%",
						overflow: "hidden",
						position: "absolute",
						left: -99999,
						top: -99999
					};
				}
				else {
					style = {
						overflow: "scroll",
						width: "100%",
						height: "100%"
					};
				}

				var div = this._divScroll = $DomUtils.xCreate({
					tagName: "DIV",
					style: style,
					content: "^DIV"
				});

				this._divViewPort = div.firstChild;
				dom.appendChild(div);

				this._modernScroller = $DomUtils.modernScroll(div);
				$fly(div).bind("modernScrolled", $scopify(this, this.onScroll));
				return div;
			}

			function registerInnerControl(innerGrid) {

				function findRowByEvent(grid, innerGrid, event) {
					return $DomUtils.findParent(event.target, function(parentNode) {
						return (parentNode.parentNode == innerGrid._dataTBody);
					});
				}

				function findColumnByEvent(grid, row, event) {
					var column = null;
					if (row) {
						var cell = $DomUtils.findParent(event.target, function(parentNode) {
							return parentNode.parentNode == row;
						}, true);
						column = grid._columnsInfo.idMap[cell.colId];
					}
					return column;
				}

				var grid = this;
				innerGrid.bind("onDataRowClick", function(self, arg) {
					if (grid.getListenerCount("onDataRowClick")) {
						var row = findRowByEvent(grid, innerGrid, arg.event);
						arg.column = findColumnByEvent(grid, row, arg.event);
						arg.data = $fly(row).data("item");
						arg.rowType = row.rowType;
						grid.fireEvent("onDataRowClick", grid, arg);
					}
				});
				innerGrid.bind("onDataRowDoubleClick", function(self, arg) {
					if (grid.getListenerCount("onDataRowDoubleClick")) {
						var row = findRowByEvent(grid, innerGrid, arg.event);
						arg.column = findColumnByEvent(grid, row, arg.event);
						arg.data = $fly(row).data("item");
						arg.rowType = row.rowType;
						grid.fireEvent("onDataRowDoubleClick", grid, arg);
					}
				});
				this.registerInnerControl(innerGrid);
			}

			function getFixedInnerGrid() {
				if (this._fixedInnerGrid) return this._fixedInnerGrid;
				var innerGrid = this._fixedInnerGrid = this.createInnerGrid(true), self = this;
				innerGrid.set({
					allowNoCurrent: this._allowNoCurrent,
					beforeSelectionChange: function(innerGrid, arg) {
						self.fireEvent("beforeSelectionChange", self, arg);
					},
					onSelectionChange: function(innerGrid, arg) {
						self.fireEvent("onSelectionChange", self, arg);
					}
				});
				registerInnerControl.call(this, innerGrid);
				return innerGrid;
			}

			function getInnerGrid() {
				if (this._innerGrid) return this._innerGrid;
				var innerGrid = this._innerGrid = this.createInnerGrid(), self = this;
				innerGrid.set({
					allowNoCurrent: this._allowNoCurrent,
					selectionMode: this._selectionMode,
					selection: this._selection,
					onCurrentChange: function(innerGrid, arg) {
						self.fireEvent("onCurrentChange", self, arg);
					},
					beforeSelectionChange: function(innerGrid, arg) {
						self.fireEvent("beforeSelectionChange", self, arg);
					},
					onSelectionChange: function(innerGrid, arg) {
						self.fireEvent("onSelectionChange", self, arg);
					}
				});
				delete this._selection;

				registerInnerControl.call(this, innerGrid);
				this._innerGridDom = innerGrid.getDom();
				return innerGrid;
			}

			function getFixedInnerGridWrapper() {
				var wrapper = this._fixedInnerGridWrapper;
				if (!wrapper) {
					var wrapper = this._fixedInnerGridWrapper = document.createElement("DIV");
					with(wrapper.style) {
						overflowX = "visible";
						position = "absolute";
						left = top = 0;
						height = "100%";
					}
					dom.appendChild(wrapper);
				}
				return wrapper;
			}

			function getInnerGridWrapper() {
				var wrapper = this._innerGridWrapper;
				if (!wrapper) {
					var wrapper = this._innerGridWrapper = document.createElement("DIV");
					with(wrapper.style) {
						position = "absolute";
						left = top = 0;
						height = "100%";
					}
					dom.appendChild(wrapper);
				}
				return wrapper;
			}

			$invokeSuper.call(this, arguments);

			if (!this._columns.size) {
				this.addColumns([
					{
						name: "empty",
						caption: ''
					}
				]);
			}
			var ignoreItemTimestamp = (this._ignoreItemTimestamp === undefined) ? true : this._ignoreItemTimestamp;

			if (!this.hasRealWidth() || /*!this.hasRealHeight() || */this._groupProperty) {
				this._realFixedColumnCount = 0;
			}
			else {
				this._realFixedColumnCount = this._fixedColumnCount;
				if (this._realFixedColumnCount > this._columns.size) this._realFixedColumnCount = this._columns.size;
			}

			this._realStretchColumnsMode = (this._realFixedColumnCount > 0) ? "off" : this._stretchColumnsMode;
			var columnsInfo = this._columnsInfo = this.getColumnsInfo(this._realFixedColumnCount);
			if (columnsInfo) {
				var cols = columnsInfo.dataColumns;
				// this._forceRefreshRearRows = false;	// TODO: 如果未来为List、Grid提供pianoKey选项，则此处的默认值应考虑改为false
				for(var i = 0; i < cols.length; i++) {
					var col = cols[i];
					col._realWidth = parseInt(col._realWidth || col._width) || 80;
					// if (col instanceof dorado.widget.grid.RowNumColumn) {
					// 	this._forceRefreshRearRows = true;
					// }
				}
			}

			var itemModel = this._itemModel;
			itemModel._summaryColumns = itemModel.extractSummaryColumns(columnsInfo.dataColumns);

			// 检查并创建内容
			if (this._currentCell) $fly(this._currentCell).removeClass("current-cell");
			var menuColumn = this._headerMenuOpenColumn || this._headerHoverColumn;
			if (menuColumn) this.hideHeaderOptionButton(menuColumn);
			this._headerMenuOpenColumn = this._headerHoverColumn = null;

			var divScroll = this._divScroll, fixedInnerGrid = this._fixedInnerGrid, fixedInnerGridWrapper = this._fixedInnerGridWrapper;
			var innerGrid = getInnerGrid.call(this), innerGridWrapper = this._innerGridWrapper;

			var xScroll = this.xScroll = this.hasRealWidth();
			var yScroll = this.yScroll = this.hasRealHeight();
			var domMode;
			if (this._realFixedColumnCount > 0) {
				domMode = xScroll ? 2 : 0;
			}
			else {
				domMode = yScroll ? 1 : 0;
			}

			var oldWidth, oldHeight;
			if (!this.xScroll || !this.yScroll) {
				oldWidth = dom.offsetWidth;
				oldHeight = dom.offsetHeight;
			}

			if (this._domMode != domMode) {
				this._domMode = domMode;
				switch(domMode) {
					case 0:
					{ // no scroller, 1 innerGrid, no width, no height
						with(dom.style) {
							overflowX = overflowY = "hidden";
						}
						if (divScroll) $fly(divScroll).hide();
						if (fixedInnerGridWrapper) $fly(fixedInnerGridWrapper).hide();

						with(this._innerGridDom.style) {
							position = top = left = width = height = '';
						}
						innerGrid.render(dom);
						break;
					}
					case 1:
					{ // scroller, 1 innerGrid
						with(dom.style) {
							overflowX = overflowY = xScroll ? "hidden" : "visible";
						}
						divScroll = getDivScroll.call(this);
						$fly(divScroll).show();
						if (fixedInnerGridWrapper) $fly(fixedInnerGridWrapper).hide();

						var innerGridWrapper = getInnerGridWrapper.call(this);
						innerGridWrapper.style.overflowX = (this.hasRealWidth()) ? "hidden" : "visible";
						innerGridWrapper.style.overflowY = (this.hasRealHeight()) ? "hidden" : "visible";
						with(this._innerGridDom.style) {
							position = top = left = width = '';
						}
						innerGrid.render(innerGridWrapper);
						break;
					}
					case 2:
					{ // scroller, 2 innerGrids
						with(dom.style) {
							overflowX = "hidden";
							// 即使overflow，只要height=100%，也会产生visible的效果，这样设计的目的是为了避免当height为空时，最右侧出现滚动条宽度的白边
							overflowY = "hidden";	//yScroll ? "hidden" : "visible";
						}
						divScroll = getDivScroll.call(this);
						$fly(divScroll).show();

						fixedInnerGridWrapper = getFixedInnerGridWrapper.call(this);
						fixedInnerGridWrapper.style.overflowY = (this.hasRealHeight()) ? "hidden" : "visible";
						$fly(fixedInnerGridWrapper).show();

						fixedInnerGrid = getFixedInnerGrid.call(this);
						fixedInnerGrid.render(fixedInnerGridWrapper);

						innerGridWrapper = getInnerGridWrapper.call(this);
						innerGridWrapper.style.overflowX = (this.hasRealWidth()) ? "hidden" : "visible";
						innerGridWrapper.style.overflowY = (this.hasRealHeight()) ? "hidden" : "visible";
						with(this._innerGridDom.style) {
							position = top = left = width = '';
						}
						innerGrid.render(innerGridWrapper);
						break;
					}
				}
			}

			if (this._currentScrollMode != this._scrollMode && this._scrollMode != "viewport") {
				itemModel.setScrollPos(0);
			}
			if (!this.hasRealHeight()) this._scrollMode = "simple";
			this._currentScrollMode = this._scrollMode;

			// 开始刷新内容
			if (domMode == 2) {
				with(fixedInnerGridWrapper.style) {
					overflowX = width = '';
				}

				fixedInnerGrid._scrollMode = this._scrollMode;
				fixedInnerGrid._rowHeight = this._rowHeight;
				fixedInnerGrid._highlightCurrentRow = this._highlightCurrentRow;
				fixedInnerGrid._highlightHoverRow = this._highlightHoverRow;
				fixedInnerGrid._highlightSelectedRow = this._highlightSelectedRow;
				fixedInnerGrid._selectionMode = this._selectionMode;
				fixedInnerGrid._columnsInfo = columnsInfo.fixed;
				fixedInnerGrid._forceRefreshRearRows = this._forceRefreshRearRows;
				fixedInnerGrid._ignoreItemTimestamp = ignoreItemTimestamp;
				fixedInnerGrid.refreshDom(innerGrid.getDom());

				var scrollLeft = ((dorado.Browser.msie && dorado.Browser.version < 7) ? fixedInnerGridWrapper.firstChild : fixedInnerGridWrapper).offsetWidth;
				if (scrollLeft >= divScroll.clientWidth) {
					with(fixedInnerGridWrapper.style) {
						overflowX = "hidden";
						width = divScroll.clientWidth + "px";
					}
					innerGridWrapper.style.width = 0;
				}
				else {
					with(innerGridWrapper.style) {
						width = (divScroll.clientWidth - scrollLeft) + "px";
					}
					innerGridWrapper.style.left = scrollLeft + "px";
				}
			}
			else {
				if (innerGridWrapper) {
					with(innerGridWrapper.style) {
						left = 0;
						width = divScroll.clientWidth + "px";
					}
				}
			}

			if (domMode != 2) {
				this.stretchColumnsToFit();
				if (innerGrid._itemModel instanceof PassiveItemModel) innerGrid._itemModel = itemModel;
			}
			else {
				if (!(innerGrid._itemModel instanceof PassiveItemModel)) innerGrid._itemModel = new PassiveItemModel(itemModel);
			}
			innerGrid._scrollMode = this._scrollMode;
			innerGrid._rowHeight = this._rowHeight;
			innerGrid._highlightCurrentRow = this._highlightCurrentRow;
			innerGrid._highlightHoverRow = this._highlightHoverRow;
			innerGrid._highlightSelectedRow = this._highlightSelectedRow;
			innerGrid._columnsInfo = columnsInfo.main;
			innerGrid._forceRefreshRearRows = this._forceRefreshRearRows;
			innerGrid._ignoreItemTimestamp = ignoreItemTimestamp;
			innerGrid.refreshDom(innerGrid.getDom());

			if (!this._groupProperty && itemModel.footerEntity && itemModel.footerEntity.get("$expired")) this.refreshSummary();

			if ((!this.xScroll || !this.yScroll) && oldWidth != dom.offsetWidth && oldHeight != dom.offsetHeight) {
				this.notifySizeChange();
			}
		},

		stretchColumnsToFit: function() {
			var WIDTH_ADJUST = 6;

			var stretchColumnsMode = this._realStretchColumnsMode;
			if (stretchColumnsMode == "off") return;

			var columns = this._columnsInfo.dataColumns;
			if (!columns.length) return;

			var clientWidth;
			if (dorado.Browser.msie) {
				clientWidth = (this._domMode == 0) ? this._dom.offsetWidth : this._divScroll.offsetWidth;
			}
			else {
				clientWidth = (this._domMode == 0) ? this._dom.clientWidth : this._divScroll.clientWidth;
			}
			if (!clientWidth) return;

			var totalWidth = 0, column;
			switch(stretchColumnsMode) {
				case "stretchableColumns":
				{
					var stretchableColumns = [];
					for(var i = 0; i < columns.length; i++) {
						column = columns[i];
						if (column._width == '*') {
							stretchableColumns.push(column);
						}
						else {
							totalWidth += (columns[i]._realWidth || 80) + WIDTH_ADJUST;
						}
					}
					for(var i = 0; i < stretchableColumns.length; i++) {
						column = stretchableColumns[i];
						var w = Math.round((clientWidth - totalWidth) / (stretchableColumns.length - i)) - WIDTH_ADJUST;
						if (w < MIN_COL_WIDTH) w = MIN_COL_WIDTH;
						column._realWidth = w;
						totalWidth += (w + WIDTH_ADJUST);
					}
					break;
				}
				case "lastColumn":
				{
					for(var i = 0; i < columns.length; i++) {
						column = columns[i];
						if (i == columns.length - 1) {
							column._realWidth = clientWidth - totalWidth - WIDTH_ADJUST;
							if (column._realWidth < MIN_COL_WIDTH) column._realWidth = MIN_COL_WIDTH;
						}
						else {
							totalWidth += (column._realWidth + WIDTH_ADJUST);
						}
					}
					break;
				}
				case "allColumns":
				{
					var totalWeight = 0;
					for(var i = 0; i < columns.length; i++) {
						totalWeight += (columns[i]._realWidth || 80) + WIDTH_ADJUST;
					}
					var assignedWidth = 0;
					for(var i = 0; i < columns.length; i++) {
						var column = columns[i], weight = (parseInt(column._realWidth) || 80) + WIDTH_ADJUST;
						if (i == columns.length - 1) {
							column._realWidth = clientWidth - assignedWidth - WIDTH_ADJUST;
						}
						else {
							var w = Math.round(clientWidth * weight / totalWeight) - WIDTH_ADJUST;
							if (w < MIN_COL_WIDTH) w = MIN_COL_WIDTH;
							column._realWidth = w;
							assignedWidth += (w + WIDTH_ADJUST);
						}
					}
					break;
				}
				case "allResizeableColumns":
				{
					var totalWeight = 0;
					for(var i = 0; i < columns.length; i++) {
						var column = columns[i];
						if (!column._resizeable) continue;
						totalWeight += (column._realWidth || 80) + WIDTH_ADJUST;
					}
					var assignedWidth = 0;
					for(var i = 0; i < columns.length; i++) {
						var column = columns[i];
						if (!column._resizeable) continue;
						var weight = (parseInt(column._realWidth) || 80) + WIDTH_ADJUST;
						if (i == columns.length - 1) {
							column._realWidth = clientWidth - assignedWidth - WIDTH_ADJUST;
						}
						else {
							var w = Math.round(clientWidth * weight / totalWeight) - WIDTH_ADJUST;
							if (w < MIN_COL_WIDTH) w = MIN_COL_WIDTH;
							column._realWidth = w;
							assignedWidth += (w + WIDTH_ADJUST);
						}
					}
					break;
				}
			}
		},

		syncroRowHeights: function(scrollInfo) {
			if (this._domMode == 2) this._fixedInnerGrid.syncroRowHeights(scrollInfo);
		},

		updateScroller: function(info) {
			if (this._divScroll) {
				var divScroll = this._divScroll, divViewPort = this._divViewPort;
				var ratio = info.clientHeight ? (divScroll.clientHeight / (info.clientHeight || 1)) : 1;
				if (this.yScroll) {
					divViewPort.style.height = Math.round(info.scrollHeight * ratio) + "px";
				}
				else {
					divViewPort.style.height = this._innerGridWrapper.offsetHeight + "px";
				}
				divScroll.scrollTop = this._scrollTop = Math.round(info.scrollTop * ratio);

				//目前已知在动态行高的情况下不需要此行代码
				//if (this._domMode == 2) this._fixedInnerGrid.setYScrollPos(info.scrollTop / info.scrollHeight);
				if (this._innerGridWrapper) {
					var innerGridWrapper = this._innerGridWrapper;
					if (innerGridWrapper.offsetLeft <= divScroll.clientWidth) {
						var ratio = (divScroll.clientWidth / (innerGridWrapper.clientWidth || 1)) || 1;
						var viewPortWidth = Math.round(innerGridWrapper.scrollWidth * ratio);
						divViewPort.style.width = viewPortWidth + "px";
						divScroll.scrollLeft = this._scrollLeft = Math.round(innerGridWrapper.scrollLeft * ratio);
					}
					else {
						divViewPort.style.width = divScroll.scrollLeft = 0;
					}
				}
			}

			if (dorado.Browser.isTouch && this._modernScroller) {
				this._modernScroller.update();
			}
		},

		onClick: dorado._NULL_FUNCTION,
		onDoubleClick: dorado._NULL_FUNCTION,

		doOnResize: function() {
			if (!this._ready) return;
			if (this._domMode != 0) this.refresh(true);
		},

		_watchScroll: function() {
			delete this._watchScrollTimerId;
			if (this._scrollMode == "simple") return;

			var divScroll = this._divScroll;
			if (divScroll.scrollLeft == 0 && divScroll.scrollTop == 0 && divScroll.offsetWidth > 0) {
				divScroll.scrollLeft = this._scrollLeft || 0;
				divScroll.scrollTop = this._scrollTop || 0;

				var innerGrid = this._innerGrid;
				var container = innerGrid._container;
				container.scrollTop = innerGrid._scrollTop;
				container.scrollLeft = innerGrid._scrollLeft;
				if (this._domMode == 2) {
					innerGrid = this._fixedInnerGrid;
					container = innerGrid._container;
					container.scrollTop = innerGrid._scrollTop;
					container.scrollLeft = innerGrid._scrollLeft;
				}
			}
			if (this._scrollTop) {
				this._watchScrollTimerId = $setTimeout(this, this._watchScroll, 300);
			}
		},

		onScroll: function(event, arg) {
			if (this._currentCellEditor) {
				if (dorado.Browser.webkit) { // webkit改变scrollLeft不能立即在onScroll事件的计算逻辑中反映出来
					var self = this;
					setTimeout(function() {
						self._currentCellEditor.resize();
					}, 0);
				}
				else {
					this._currentCellEditor.resize();
				}
			}
			if (this._currentCell) $fly(this._currentCell).removeClass("current-cell");

			if ((this._scrollLeft || 0) != arg.scrollLeft) {
				if (this.onXScroll) this.onXScroll(arg);
			}
			if ((this._scrollTop || 0) != arg.scrollTop) {
				if (this.onYScroll) this.onYScroll(arg);
			}

			if (this._watchScrollTimerId) {
				clearTimeout(this._watchScrollTimerId);
				delete this._watchScrollTimerId;
			}
			if (arg.scrollTop && this._scrollMode != "simple") {
				this._watchScrollTimerId = $setTimeout(this, this._watchScroll, 300);
			}
			this._scrollLeft = arg.scrollLeft;
			this._scrollTop = arg.scrollTop;
		},

		onXScroll: function(arg) {
			if (this._innerGridWrapper) {
				var innerGridWrapper = this._innerGridWrapper;
				var ratio = ((arg.scrollWidth - arg.clientWidth) / (innerGridWrapper.scrollWidth - innerGridWrapper.clientWidth)) || 1;
				innerGridWrapper.scrollLeft = Math.round(arg.scrollLeft / ratio);
			}
		},

		onYScroll: function(arg) {
			if (!this._divScroll) return;

			var ratio = arg.scrollTop / (arg.scrollHeight - arg.clientHeight), innerContainer = this._innerGrid._container;
			if (this._scrollMode == "lazyRender") {
				innerContainer.scrollTop = Math.round((innerContainer.scrollHeight - innerContainer.clientHeight) * ratio);
			}
			else {
				this._innerGrid.setYScrollPos(ratio);
			}
			if (this._domMode == 2) this._fixedInnerGrid._container.scrollTop = innerContainer.scrollTop;

			if (this._scrollMode == "lazyRender") {
				if (this._domMode == 2) this._fixedInnerGrid.doOnYScroll(this._fixedInnerGrid._container);
				var innerGrid = this._innerGrid;
				innerGrid.doOnYScroll(innerGrid._container);
				if (this._rowHeightInfos) this.syncroRowHeights(innerGrid._container);
				this.updateScroller(innerGrid._container);
			}
			else if (this._scrollMode == "viewport") {
				dorado.Toolkits.setDelayedAction(this, "$scrollTimerId", function() {
					if (this._domMode == 2) this._fixedInnerGrid.doOnYScroll(this._fixedInnerGrid._container);
					this._innerGrid.doOnYScroll(this._innerGrid._container);
				}, 300);
			}
		},

		doOnKeyDown: function(evt) {
			var retValue = true;
			switch(evt.keyCode) {
				case 37: // left
					if (evt.ctrlKey && this._currentColumn) {
						var columns = this._columnsInfo.dataColumns;
						var i = columns.indexOf(this._currentColumn);
						if (i > 0) this.setCurrentColumn(columns[i - 1]);
					}
					break;
				case 39: // right
					if (evt.ctrlKey && this._currentColumn) {
						var columns = this._columnsInfo.dataColumns;
						var i = columns.indexOf(this._currentColumn);
						if (i >= 0 && i < columns.length - 1) this.setCurrentColumn(columns[i + 1]);
					}
					break;
				case 27: // esc
					if (this._currentCellEditor) {
						this._editing = false;
						this.hideCellEditor(false);
						dorado.widget.onControlGainedFocus(this);
					}
					break;
				default:
					retValue = this._doOnKeyDown(evt);
					break;
			}
			if (this._editing && !this._currentCellEditor && this._currentColumn) {
				if (dorado.Browser.msie && dorado.Browser.version == 8) {
					$setTimeout(this, function() {
						this.showCellEditor(this._currentColumn);
					}, 0);
				}
				else {
					this.showCellEditor(this._currentColumn);
				}
			}
			return retValue;
		},

		doInnerGridSetCurrentRow: function(innerGrid, itemId) {
			if (this._processingCurrentRow) return;
			this.hideCellEditor();

			this._processingCurrentRow = true, ig = this._innerGrid;
			if (this._domMode == 2) (innerGrid == ig ? this._fixedInnerGrid : ig).setCurrentRowByItemId(itemId);

			if (this._divScroll) {
				var st = Math.round(ig._container.scrollTop / ig._container.scrollHeight * this._divScroll.scrollHeight);
				if (this._scrollMode != "lazyRender") this._scrollTop = st;
				this._divScroll.scrollTop = st;
			}
			this._processingCurrentRow = false;
		},

		onMouseDown: function(evt) {
			this._disableCellEditor = true;
		},

		onClick: function(evt) {
			this._disableCellEditor = false;

			var tbody1 = this._innerGrid._dataTBody, tbody2 = (this._domMode == 2) ? this._fixedInnerGrid._dataTBody : null;
			var self = this, innerGrid;
			var row = $DomUtils.findParent(evt.target, function(parentNode) {
				var p = parentNode.parentNode;
				if (p == tbody1) {
					innerGrid = self._innerGrid;
					return true;
				}
				else if (tbody2 && p == tbody2) {
					innerGrid = self._fixedInnerGrid;
					return true;
				}
			});

			if (row) {
				this._editing = true;
				var column = null;
				if (innerGrid.getCurrentItemDom() == row) {
					var cell = $DomUtils.findParent(evt.target, function(parentNode) {
						return parentNode.parentNode == row;
					}, true);
					if (cell) {
						column = this._columnsInfo.idMap[cell.colId];

						if (this._currentColumn == column && column) {
							this.showCellEditor(column);
						}
						else {
							this.setCurrentColumn(column);
						}
					}
				}
			}
			else {
				var clickOnCellEditor = false;
				if (this._currentCellEditor) {
					var cellEditorDom = this._currentCellEditor.getDom();
					clickOnCellEditor = ($DomUtils.isOwnerOf(evt.target, cellEditorDom));
				}
				if (!clickOnCellEditor) {
					this._editing = false;
					this.setCurrentColumn(null);
				}
			}

			return $invokeSuper.call(this, arguments);
		},

		_getCellByEvent: function(event) {
			var tbody1 = this._innerGrid._dataTBody, tbody2 = (this._domMode == 2) ? this._fixedInnerGrid._dataTBody : null;
			return $DomUtils.findParent(event.target, function(parentNode) {
				var p = parentNode.parentNode;
				if (!p) return;
				p = p.parentNode;
				return (p == tbody1 || tbody2 && p == tbody2);
			});
		},

		/**
		 * 根据传入的DHTML Event返回相应的数据实体。
		 * <p>此方法一般用于onMouseDown、onClick等事件，用于获得此时鼠标实际操作的数据实体。</p>
		 * <p><b>注意：此方法只对表格控件中的数据区有效，在鼠标操作表格的列头、汇总栏等区域时此方法总是返回null。</b></p>
		 * @param {Event} event DHTML中的Event对象。
		 * @return {Object|dorado.Entity} 相应的数据实体。
		 */
		getEntityByEvent: function(event) {
			var cell = this._getCellByEvent(event);
			return (cell) ? $fly(cell.parentNode).data("item") : null;
		},

		/**
		 * 根据传入的DHTML Event返回相应的列。
		 * <p>此方法一般用于onMouseDown、onClick等事件，用于获得此时鼠标实际操作的列。</p>
		 * <p><b>注意：此方法只对表格控件中的数据区有效，在鼠标操作表格的列头、汇总栏等区域时此方法总是返回null。</b></p>
		 * @param {Event} event DHTML中的Event对象。
		 * @return {dorado.widget.grid.DataColumn} 相应的列。
		 */
		getColumnByEvent: function(event) {
			var cell = this._getCellByEvent(event);
			return (cell) ? this._columnsInfo.idMap[cell.colId] : null;
		},

		doOnFocus: function() {
			if (this._currentColumn) {
				dorado.Toolkits.setDelayedAction(this, "$showEditorTimerId", function() {
					if (this._currentColumn && !this._currentCellEditor) this.showCellEditor(this._currentColumn);
				}, 300);
			}
		},

		doOnBlur: function() {
			if (this._currentCell) $fly(this._currentCell).removeClass("current-cell");
			this.hideCellEditor();
		},

		shouldEditing: function(column) {
			return column && !column.get("readOnly") && !this.get("readOnly") &&
				column._property && column._property != "none" && column._property != this._groupProperty;
		},

		setCurrentColumn: function(column) {
			if (this._currentColumn != column) {
				if (this._currentCell) $fly(this._currentCell).removeClass("current-cell");
				this.hideCellEditor();
				this._currentColumn = column;
				if (column) this.showCellEditor(column);
			}
		},

		showCellEditor: function(column) {
			if (this._disableCellEditor) return;
			if (this._domMode == 2) this._fixedInnerGrid.showCellEditor(column);
			this._innerGrid.showCellEditor(column);
		},

		hideCellEditor: function(post) {
			if (this._currentCellEditor) {
				this._currentCellEditor.hide(post);
				delete this._currentCellEditor;
			}
		},

		getCellEditor: function(column, entity) {
			if (entity) {
				var cellEditorCache = this._cellEditorCache;
				if (!cellEditorCache) this._cellEditorCache = cellEditorCache = {};
				var cellEditor = cellEditorCache[column._uniqueId];

				if (cellEditor === undefined) {
					cellEditor = column._cellEditor;
					if (cellEditor === undefined) {
						cellEditor = new dorado.widget.grid.DefaultCellEditor();
					}
					cellEditor.bindColumn(column);
				}
				else if (cellEditor) {
					if (cellEditor.column) {
						if (cellEditor.column != column) throw new ResourceException("dorado.grid.CellEditorShareError");
					}
					else {
						cellEditor.bindColumn(column);
					}
				}

				if (column._propertyPath) {
					entity = column._propertyPath.evaluate(entity, true);
				}

				var eventArg = {
					data: entity,
					column: column,
					cellEditor: cellEditor
				};
				column.fireEvent("onGetCellEditor", column, eventArg);
				this.fireEvent("onGetCellEditor", this, eventArg);

				cellEditor = eventArg.cellEditor;
				if (cellEditor && cellEditor.cachable) cellEditorCache[column._uniqueId] = cellEditor;

				if (cellEditor) cellEditor.data = entity;
				return cellEditor;
			}
			else {
				return null;
			}
		},

		/**
		 * 对指定的列中的数据进行排序。
		 * @param {String|dorado.widget.grid.DataColumn|Object|Object[]} column 要排序的表格列或列的名称。
		 * <p>
		 * 此参数还有另外一种定义方式，如果您传入的数据类型不是String或dorado.widget.grid.DataColumn，
		 * 那么系统会将此参数认作是{@link dorado.widget.list.ItemModel#sort}方法中的sortParams形式的排序条件，并且忽略掉后面的desc参数。
		 * </p>
		 * @param {boolean} [desc] 是否倒序排序。
		 */
		sort: function(column, desc) {
			var sortParams;
			if (typeof column == "string") {
				column = this.getColumn(column);
			}
			if (column instanceof dorado.widget.grid.Column) {
				sortParams = [
					{
						property: column.get("property"),
						desc: desc
					}
				];
			}
			else {
				sortParams = column;
			}
			$invokeSuper.call(this, [sortParams]);
		},

		/**
		 * 数据过滤。
		 * @protected
		 * @param {Object[]} criterions 过滤条件的数组。
		 * @param {String} criterions.property 要过滤的属性名。
		 * @param {String} criterions.operator 比较操作符。如"="、"like"、">"、"<="等。
		 * @param {Object} criterions.value 过滤条件值。
		 * @param {String} criterions.junction 子过滤条件的连接方式，有"and"和"or"两种取值。
		 * <p>
		 * 当此属性的值不为空时criterions.property、criterions.operator、criterions.value这些子属性都将被忽略，系统会进一步处理criterions.criterions属性。
		 * </p>
		 * @param {[Object]} criterions.criterions 子过滤条件数组。此参数仅在criterions.junction不为空时有效。
		 * @see dorado.widget.list.ItemModel#filter
		 *
		 * @example
		 * var criterions = [
		 *    {
		 * 		property:"label",
		 * 		operator:"like",
		 * 		value："apple"
		 * 	}
		 * ];
		 * grid.filter(criterions);
		 *
		 * @example
		 * var criterions = [
		 *    {
		 * 		junction:"or",
		 * 		criterions:[
		 * 		{
		 * 			property:"age",
		 * 			operator:"<",
		 * 			value：20
		 * 		},{
		 * 			property:"age",
		 * 			operator:">",
		 * 			value：50
		 * 		}]
		 * 	}
		 * ];
		 * grid.filter(criterions);
		 */
		filter: function(criterions) {

			function verifyCriterion(criterion, column) {
				if (criterion.junction) {
					var criterions = criterion.criterions;
					if (criterions && criterions.length) {
						for(var i = 0; i < criterions.length; i++) {
							var c = criterions[i];
							if (c != null) verifyCriterion(c, column);
						}
					}
				}
				else {
					verifyCriterion.property = column._property;
				}
			}

			if (criterions === undefined) {
				criterions = [];
				var filterEntity = this._itemModel.filterEntity;
				var dataColumns = this._columnsInfo.dataColumns;
				for(var i = 0; i < dataColumns.length; i++) {
					var column = dataColumns[i];
					if (!column._property || column._property == "none") continue;
					var criterion = filterEntity.get(column._property);
					if (criterion) {
						verifyCriterion(criterion, column);
						if (criterion.junction && criterion.junction != "or") {
							criterions = criterions.concat(criterion.criterions);
						}
						else {
							criterions.push(criterion);
						}
					}
				}
			}

			$invokeSuper.call(this, [criterions]);
		},

		/**
		 * 高亮指定的数据实体对应的表格行。
		 * @param {dorado.Entity} [entity] 要高亮的数据实体，如果不指定此参数则表示要高亮当前行。
		 * @param {Object} [options] 高亮选项。见jQuery ui相关文档中关于highlight方法的说明。
		 * @param {Object} [speed] 动画速度。
		 */
		highlightItem: function(entity, options, speed) {

			function highlight(row) {
				if (!row) return;
				$fly(row).addClass("highlighting-row").effect("highlight", options || {
					color: "#FFFF80"
				}, speed || 1500, function() {
					$fly(row).removeClass("highlighting-row");
				});
			}

			entity = entity || this.getCurrentItem();
			var itemId = this._itemModel.getItemId(entity), innerGrid, row1, row2;
			if (this._domMode == 2) {
				innerGrid = this._fixedInnerGrid;
				row1 = innerGrid._itemDomMap[itemId];
			}
			innerGrid = this._innerGrid;
			row2 = innerGrid._itemDomMap[itemId];

			if (row2) {
				highlight(row1);
				highlight(row2);
			}
			else if (!entity._disableDelayHighlight) {
				var self = this;
				setTimeout(function() {
					entity._disableDelayHighlight = true;
					self.highlightItem(entity, options, speed);
					entity._disableDelayHighlight = false;
				}, 100);
			}
		},

		setHoverHeaderColumn: function(column) {
			if (this._headerHoverColumn == column) return;
			var oldColumn = this._headerHoverColumn;
			if (oldColumn) {
				$fly(oldColumn.headerCell).removeClass("hover-header");
				if (this._headerMenuOpenColumn != oldColumn) this.hideHeaderOptionButton(oldColumn);
			}
			this._headerHoverColumn = column;
			if (column) {
				hideColumnResizeHandler();

				var $cell = jQuery(column.headerCell);
				$cell.addClass("hover-header");
				if (!$cell.data("ui-draggable")) {
					var grid = this;
					var options = dorado.Object.apply({
						appendTo: "body",
						helper: function(evt) {
							return getColumnDragHelper(evt, this);
						},
						draggingInfo: function() {
							var column = grid._columnsInfo.idMap[this.colId];
							return new dorado.DraggingInfo({
								object: column,
								sourceControl: grid,
								options: options,
								tags: ["grid-column"]
							});
						},
						start: function() {
							var column = grid._columnsInfo.idMap[this.colId];
							grid.hideHeaderOptionButton(column);
						}
					}, this.defaultDraggableOptions);
					$cell.draggable(options);
				}
				this.showHeaderOptionButton(column);
			}
		},

		showHeaderOptionButton: function(column) {
			if (!column || !column._supportsOptionMenu || column._property == "none") return;
			var cell = column.headerCell, $cell = jQuery(cell);
			$cell.addClass("menu-open-header");

			var button = this.getHeaderOptionButton(column);
			button.style.display = '';

			var offset = $cell.offset(), offsetParent = $fly(cell.offsetParent).offset();
			var l = offset.left - offsetParent.left + cell.offsetWidth - button.offsetWidth, t = offset.top - offsetParent.top + 1;
			$fly(button).css({
				left: l,
				top: t
			}).outerHeight(cell.offsetHeight - 2);
		},

		hideHeaderOptionButton: function(column) {
			$fly(column.headerCell).removeClass("menu-open-header");
			var button = this.getHeaderOptionButton(column);
			if (button) button.style.display = "none";
		},

		getHeaderOptionButton: function(column) {
			var cell = column.headerCell, button = cell.lastChild;
			if ((!button || button.className != "header-option-button") && cell) {
				button = $DomUtils.xCreate({
					tagName: "DIV",
					className: "header-option-button",
					style: {
						display: "none",
						position: "absolute"
					}
				});
				$DomUtils.disableUserSelection(button);

				var self = this;
				$fly(button).mousedown(function(evt) {
					return false;
				}).click(function() {
						var menu = self.getHeaderOptionMenu(true);
						if (menu.get("visible")) {
							menu.hide();
						}
						else {
							var column = $fly(button).data("gridColumn");
							self.initHeaderOptionMenu(menu, column);

							menu._gridColumn = column;
							menu.bind("onHide", function() {
								var col = self._headerMenuOpenColumn;
								if (col && col != self._headerHoverColumn) {
									self.hideHeaderOptionButton(col);
									self._headerMenuOpenColumn = null;
								}
							}, {
								once: true,
								delay: 0
							});
							menu.show({
								anchorTarget: button,
								align: "innerright",
								vAlign: "bottom"
							});
							self._headerMenuOpenColumn = column;
						}
						return false;
					});
			}
			if (cell && button.parentNode != cell) cell.appendChild(button);
			$fly(button).data("gridColumn", column);
			return button;
		},

		getHeaderOptionMenu: function(create) {
			var menu = this._headerOptionMenu, grid = this;
			if (!menu && create) {
				this._headerOptionMenu = menu = new dorado.widget.Menu({
					items: [
						{
							name: "sortAsc",
							caption: $resource("dorado.grid.OptionMenuSortAscending"),
							iconClass: "d-grid-menu-sort-asc",
							onClick: function(self) {
								if (menu._gridColumn instanceof dorado.widget.grid.DataColumn) {
									grid.sort(menu._gridColumn, false);
								}
							}
						},
						{
							name: "sortDesc",
							caption: $resource("dorado.grid.OptionMenuSortDescending"),
							iconClass: "d-grid-menu-sort-desc",
							onClick: function(self) {
								if (menu._gridColumn instanceof dorado.widget.grid.DataColumn) {
									grid.sort(menu._gridColumn, true);
								}
							}
						},
						new dorado.widget.menu.Separator({
							name: "sortSeprator"
						}),
						{
							name: "fix",
							caption: $resource("dorado.grid.OptionMenuFix"),
							iconClass: "d-grid-menu-fix",
							onClick: function(self) {
								grid.set("fixedColumnCount", menu._columnIndex + 1);
							}
						},
						{
							name: "unfix",
							caption: $resource("dorado.grid.OptionMenuUnfix"),
							onClick: function(self) {
								grid.set("fixedColumnCount", 0);
							}
						},
						new dorado.widget.menu.Separator({
							name: "fixSeprator"
						}),
						{
							name: "group",
							caption: $resource("dorado.grid.OptionMenuGroup"),
							iconClass: "d-grid-menu-group",
							onClick: function(self) {
								var column = menu._gridColumn, grid = column._grid;
								grid.set("groupProperty", column.get("property"));
								grid.refresh();
							}
						},
						{
							name: "ungroup",
							caption: $resource("dorado.grid.OptionMenuUngroup"),
							onClick: function(self) {
								var column = menu._gridColumn, grid = column._grid;
								grid.set("groupProperty", null);
								grid.refresh();
							}
						},
						new dorado.widget.menu.Separator({
							name: "groupSeprator"
						}),
						{
							$type: "Checkable",
							name: "toggleFilterBar",
							caption: $resource("dorado.grid.OptionMenuToggleFilterBar"),
							checked: !!grid.get("showFilterBar"),
							onClick: function(self) {
								grid.set("showFilterBar", !grid.get("showFilterBar"));
							}
						},
						new dorado.widget.menu.Separator({
							name: "filterSeprator"
						}),
						{
							name: "groupColumn",
							caption: $resource("dorado.grid.OptionMenuGroupColumn"),
							onClick: function(self) {
								dorado.MessageBox.prompt($resource("dorado.grid.InputNewGroupName"), function(text) {
									var column = menu._gridColumn, parentColumn = column._parent, grid = column._grid;
									var i = parentColumn.get("columns").remove(column);
									if (i >= 0) {
										parentColumn.addColumn(new dorado.widget.grid.ColumnGroup({
											caption: text,
											columns: [column]
										}), i);
										grid.refresh();
									}
								});
							}
						},
						{
							name: "ungroupColumns",
							caption: $resource("dorado.grid.OptionMenuUngroupColumns"),
							onClick: function(self) {
								var column = menu._gridColumn, parentColumn = column._parent, grid = column._grid;
								var i = parentColumn.get("columns").remove(column);
								if (i >= 0) {
									column.get("columns").each(function(subColumn) {
										parentColumn.addColumn(subColumn, i);
										i++;
									});
									;
									grid.refresh();
								}
							}
						},
						new dorado.widget.menu.Separator({
							name: "groupColumnSeprator"
						}),
						{
							name: "columns",
							caption: $resource("dorado.grid.OptionMenuColumns"),
							iconClass: "d-grid-menu-column",
							items: []
						}
					]
				});
				this.registerInnerControl(menu);
			}
			return menu;
		},

		initHeaderOptionMenu: function(menu, column) {

			function crreateColumnItems(columnsItem, columns) {
				columns.each(function(column) {
					var item = new dorado.widget.menu.CheckableMenuItem({
						$type: "Checkable",
						caption: column.get("caption") || column.get("name"),
						checked: column.get("visible"),
						hideOnClick: false,
						onCheckedChange: function(self) {
							var col = self._column;
							col.set("visible", !col.get("visible"));
							col._grid.refresh();
						}
					});
					item._column = column;
					if (column instanceof dorado.widget.grid.ColumnGroup) {
						crreateColumnItems(item, column.get("columns"));
					}
					columnsItem.addItem(item);
				});
			}

			var isDataColumn = column instanceof dorado.widget.grid.DataColumn;
			var sortState = isDataColumn ? column.get("sortState") : null;
			menu.findItem("sortAsc").set("disabled", !isDataColumn);
			menu.findItem("sortDesc").set("disabled", !isDataColumn);

			var columns = this.get("columns");
			var isTopColumn = (column.get("parent") == this), fixed = false;
			if (isTopColumn) {
				menu._columnIndex = columns.indexOf(column);
				fixed = (this._realFixedColumnCount > 0 && (menu._columnIndex + 1) == this._realFixedColumnCount);
			}
			menu.findItem("fix").set("disabled", !isTopColumn || fixed || this._groupProperty);
			menu.findItem("unfix").set("disabled", this._realFixedColumnCount == 0 || this._groupProperty);
			menu.findItem("toggleFilterBar").set("checked", this._showFilterBar);
			menu.findItem("ungroupColumns").set("disabled", isDataColumn);
			menu.findItem("group").set("disabled", !isDataColumn);
			menu.findItem("ungroup").set("disabled", !this._groupProperty);

			var columnsItem = menu.findItem("columns");
			columnsItem.clearItems();
			crreateColumnItems(columnsItem, columns);
		},

		/**
		 * 全选。
		 * 此方法仅在selectionMode为"multiRows"有效。
		 */
		selectAll: function() {
			if (this._selectionMode != "multiRows") return;
			var added = this._itemModel.getAllDataEntities();
			var selection = this.get("selection");
			if (selection.length && added.length) {
				for(var i = 0; i < selection.length; i++) {
					added.remove(selection[i]);
				}
			}
			this._innerGrid.replaceSelection(null, added);
		},

		/**
		 * 全部不选。
		 */
		unselectAll: function() {
			this._innerGrid.replaceSelection(this.get("selection"), null);
		},

		/**
		 * 反向选择。
		 * 此方法仅在selectionMode为"multiRows"有效。
		 */
		selectInvert: function() {
			if (this._selectionMode != "multiRows") return;
			var selection = this.get("selection"), removed = [], added = [];
			jQuery.each(this._itemModel.getAllDataEntities(), function(i, item) {
				if (selection.indexOf(item) >= 0) {
					removed.push(item);
				}
				else {
					added.push(item);
				}
			});
			this._innerGrid.replaceSelection(removed, added);
		},

		/**
		 * 刷新（即重新计算）表格中的汇总数据。
		 */
		refreshSummary: function() {
			this._itemModel.footerEntity.set("$expired", true);
			dorado.Toolkits.setDelayedAction(this, "$refreshSummaryTimerId", function() {
				this._itemModel.refreshSummary();
			}, 300);
		},

		onEntityChanged: function(entity, property) {
			var itemModel = this._itemModel;
			if (itemModel.groups) {
				var groupProperty = this._groupProperty;
				var groupValue = ((entity instanceof dorado.Entity) ? itemModel.entityMap[entity.entityId] : entity[groupProperty]) + '';
				if (property == groupProperty && entity instanceof dorado.Entity && entity.getText(groupProperty) != groupValue) {
					this._itemModel.refreshItems();
					this.refresh(true);
					return false;
				}

				var group = itemModel.groupMap[groupValue];
				if (group) {
					group.headerEntity.set("$expired", true);
					group.footerEntity.set("$expired", true);
				}
			}
			return true;
		},

		getFloatFilterPanel: function() {
			var floatFilterPanel = this._floatFilterPanel;
			if (!floatFilterPanel) {
				this._floatFilterPanel = floatFilterPanel = $DomUtils.xCreate({
					tagName: "DIV",
					className: "float-filter-panel"
				});
				var self = this;
				$fly(floatFilterPanel).mouseenter(function() {
					self.showFilterPanel();
				}).mouseleave(function() {
						dorado.Toolkits.setDelayedAction(self, "$filterPanelTimerId", self.hideFilterPanel, 500);
					});

				var button;
				button = new dorado.widget.SimpleIconButton({
					exClassName: "filter-button",
					onClick: function() {
						self.filter();
					}
				});
				this.registerInnerControl(button);
				button.render(floatFilterPanel);

				button = new dorado.widget.SimpleIconButton({
					exClassName: "reset-button",
					onClick: function() {
						self.get("filterEntity").clearData();
						self.filter();
					}
				});
				this.registerInnerControl(button);
				button.render(floatFilterPanel);

				this.getDom().appendChild(floatFilterPanel);
			}
			return floatFilterPanel;
		},

		showFilterPanel: function() {
			if (!dorado.Toolkits.cancelDelayedAction(this, "$filterPanelTimerId")) {
				var panel = this.getFloatFilterPanel(), filterBar = this._innerGrid._filterBarRow;
				var $panel = $fly(panel);
				$panel.hide().top(filterBar.offsetTop + filterBar.offsetHeight - 1);
				if (dorado.Browser.msie && dorado.Browser.version < 7) {
					$panel.show();
				}
				else {
					$panel.slideDown("fast");
				}
			}
		},

		hideFilterPanel: function() {
			dorado.Toolkits.cancelDelayedAction(this, "$filterPanelTimerId");
			var panel = this.getFloatFilterPanel(), filterBar = this._innerGrid._filterBarRow;
			if (dorado.Browser.msie && dorado.Browser.version < 7) {
				$fly(panel).hide();
			}
			else {
				$fly(panel).slideUp("slow");
			}
		},

		getDraggableOptions: function(dom) {
			var options = $invokeSuper.call(this, arguments);
			if (dom == this._dom) {
				options.handle = ":first-child";
			}
			return options;
		},

		findItemDomByEvent: function(evt) {
			var target = evt.srcElement || evt.target;
			var target = target || evt;
			var innerTbody = this._innerGrid._dataTBody, fixedInnerTBody;
			if (this._domMode == 2) fixedInnerTBody = this._fixedInnerGrid._dataTBody;
			return $DomUtils.findParent(target, function(parentNode) {
				return parentNode.parentNode == innerTbody ||
					(fixedInnerTBody && parentNode.parentNode == fixedInnerTBody);
			});
		},

		getDraggingInsertIndicator: dorado.widget.AbstractList.prototype.getDraggingInsertIndicator,

		onDragStart: function() {
			$invokeSuper.call(this, arguments);
			this.hideCellEditor();
		},

		findItemDomByPosition: function(pos) {
			pos.y -= this._innerGrid._frameTBody.offsetTop - this._innerGrid._container.scrollTop;
			return this._innerGrid.findItemDomByPosition.call(this._innerGrid, pos);
		},

		showDraggingInsertIndicator: function(draggingInfo, insertMode, itemDom) {
			var insertIndicator = dorado.widget.AbstractList.getDraggingInsertIndicator();
			if (insertMode) {
				var dom = this._dom;
				var width = dom.firstChild.offsetWidth;
				var top = this._innerGrid._frameTBody.offsetTop - this._innerGrid._container.scrollTop +
					((insertMode == "before") ? itemDom.offsetTop : (itemDom.offsetTop + itemDom.offsetHeight));
				if (dom.firstChild.clientWidth < width) width = dom.firstChild.clientWidth;
				$fly(insertIndicator).width(width).height(2).left(0).top(top - 1).show();
				dom.appendChild(insertIndicator);
			}
			else {
				$fly(insertIndicator).hide();
			}
		},

		setDraggingOverItemDom: function(itemDom) {
			this._innerGrid.setDraggingOverItemDom(itemDom);
			if (this._fixedInnerGrid) {
				if (itemDom) itemDom = this._fixedInnerGrid._itemDomMap[itemDom._itemId];
				this._fixedInnerGrid.setDraggingOverItemDom(itemDom);
			}
		},

		onHeaderDragMove: function(draggingInfo, evt) {

			function findDropPosition(columns) {
				for(var i = 0; i < columns.length; i++) {
					var column = columns[i];
					var cell = column.headerCell;
					if (!cell || !column.get("visible")) continue;

					if (offsetParent != cell.offsetParent) {
						offsetParent = cell.offsetParent;
						parentOffset = $fly(offsetParent).offset();
					}

					var left = parentOffset.left + cell.offsetLeft;
					if (left <= evt.pageX && left + cell.offsetWidth >= evt.pageX) {
						if (column instanceof dorado.widget.grid.ColumnGroup) {
							var top = parentOffset.top + getCellOffsetTop(cell, this._headerRowHeight);
							if (evt.pageY > top + cell.offsetHeight) {
								return findDropPosition.call(this, column._columns.items);
							}
						}
						return {
							before: evt.pageX < left + cell.offsetWidth / 2,
							column: column
						};
					}
				}
				return null;
			}

			var column = draggingInfo.get("object");
			if (column) {
				var offsetParent, parentOffset, dropPosition = findDropPosition.call(this, this._columns.items);
				if (dropPosition != null) {
					if (dropPosition.column == column) {
						dropPosition = null;
					}
					else {
						var oldColumns = column._parent._columns;
						if (dropPosition.column == oldColumns.items[oldColumns.indexOf(column) + (dropPosition.before ? 1 : -1)]) {
							dropPosition = null;
						}
					}
				}
				showColumnDropIndicator(this, dropPosition);
				draggingInfo.dropPosition = dropPosition;
				draggingInfo.set("accept", dropPosition != null);
			}
		},

		onDraggingSourceMove: function(draggingInfo, evt) {
			var pos = this.getMousePosition(evt);
			if (pos.y < this._innerGrid._frameTBody.offsetTop) {
				var column = draggingInfo.get("object");
				if (draggingInfo.isDropAcceptable(["grid-column"]) && column && this == column.get("grid")) {
					this.showDraggingInsertIndicator();
					this.onHeaderDragMove(draggingInfo, evt);
				}
				else {
					draggingInfo.set("accept", false);
				}
			}
			else {
				hideColumnDropIndicator();
				return dorado.widget.AbstractList.prototype.onDraggingSourceMove.apply(this, arguments);
			}
		},

		doOnDraggingSourceMove: dorado.widget.AbstractList.prototype.doOnDraggingSourceMove,

		onDraggingSourceOut: function(draggingInfo, evt) {
			hideColumnDropIndicator();
			return dorado.widget.AbstractList.prototype.onDraggingSourceOut.apply(this, arguments);
		},

		onHeaderDragDrop: function(draggingInfo, evt) {
			var dropPosition = draggingInfo.dropPosition;
			if (dropPosition) {
				var ind = window._colDropIndicator;
				if (ind) {
					var column = draggingInfo.get("object");
					var refColumn = dropPosition.column;

					hideColumnDropIndicator();

					var oldColumns = column._parent._columns;
					var columns = refColumn._parent._columns;
					if (columns != oldColumns && oldColumns.size <= 1) {
						setTimeout(function() {
							throw new dorado.ResourceException("dorado.grid.RemoveTheOnlyColumn", (grid._id || grid._uniqueId));
						}, 100);
						return;
					}

					var oldGrid = column.get("grid");
					oldColumns.remove(column);
					columns.insert(column, columns.indexOf(refColumn) + (dropPosition.before ? 0 : 1));

					this._ignoreItemTimestamp = true;
					this.refresh();

					if (oldGrid != this) {
						oldGrid._ignoreItemTimestamp = true;
						oldGrid.refresh();
					}
				}
			}
			else {
				hideColumnDropIndicator();
			}
			return true;
		},

		onDraggingSourceDrop: function(draggingInfo, evt) {
			var pos = this.getMousePosition(evt);
			if (pos.y < this._innerGrid._frameTBody.offsetTop) {
				this.onHeaderDragDrop(draggingInfo, evt);
			}
			else {
				dorado.widget.AbstractList.prototype.onDraggingSourceDrop.apply(this, arguments);
			}
		},

		processItemDrop: dorado.widget.AbstractList.prototype.processItemDrop,

		initDraggingIndicator: function() {
		},

		beforeCellValueEdit: function(entity, column, value) {
			var arg = {
				entity: entity,
				column: column,
				value: value,
				processDefault: true
			};
			this.fireEvent("beforeCellValueEdit", this, arg);
			return arg.processDefault;
		},

		onCellValueEdit: function(entity, column) {
			this.fireEvent("onCellValueEdit", this, {
				entity: entity,
				column: column
			});
		},

		showLoadingTip: dorado.widget.AbstractList.prototype.showLoadingTip,
		hideLoadingTip: dorado.widget.AbstractList.prototype.hideLoadingTip
	});

	dorado.widget.grid.AbstractInnerGrid = $extend(dorado.widget.RowList, {
		$className: "dorado.widget.grid.AbstractInnerGrid",

		focusable: false,

		ATTRIBUTES: {
			selection: {
				getter: function(p, v) {
					if (this.fixed) {
						return this.grid.get(p);
					}
					else {
						if (this._selectionMode == "multiRows") {
							return this._selection ? this._selection.slice(0) : [];
						}
						else {
							return this._selection;
						}
					}
				}
			}
		},

		constructor: function(grid, fixed) {
			this.grid = grid;
			this.fixed = fixed;

			$invokeSuper.call(this, []);

			this._itemModel = grid._itemModel;

			if (fixed) {
				this._className = "fixed-inner-grid";
				this._skipProcessBlankRows = true;
				this.setScrollingIndicator = dorado._NULL_FUNCTION;
			}
			else {
				this._className = "inner-grid";
			}
		},

		createItemModel: dorado._NULL_FUNCTION,

		createDom: function() {
			this._container = $DomUtils.xCreate({
				tagName: "DIV",
				style: {
					overflow: "hidden",
					height: "100%",
					position: "relative"
				}
			});
			var tableFrame = $DomUtils.xCreate({
				tagName: "TABLE",
				className: "frame-table",
				cellSpacing: 0,
				cellPadding: 0,
				style: {
					// width: "100%",
					position: "relative"
				},
				content: ["^THEAD", {
					tagName: "TR",
					content: {
						tagName: "TD",
						vAlign: "top",
						content: this._container
					}
				}, "^TFOOT"]
			});
			this._frameTHead = tableFrame.tHead;
			this._frameTBody = tableFrame.tBodies[0];
			this._frameTFoot = tableFrame.tFoot;
			return tableFrame;
		},

		refreshDom: function(dom) {
			if (!this._columnsInfo) return;
			dorado.widget.Control.prototype.refreshDom.apply(this, arguments);

			this.refreshFrameHeader();
			this.refreshFrameFooter();
			this.updateContainerHeight(this._container);
			this.refreshFrameBody(this._container);
			this._scrollMode = this._scrollMode;

			var grid = this.grid;
			if (!this.fixed) {
				if (!grid._skipScrollCurrentIntoView) {
					if (this._currentRow) {
						this.scrollItemDomIntoView(this._currentRow);
					}
					else {
						this.scrollCurrentIntoView();
					}
				}
				delete grid._skipScrollCurrentIntoView;

				if (grid._rowHeightInfos) {
					with(grid._rowHeightInfos) {
						var p = (dorado.Browser.mozilla || dorado.Browser.opera) ? "offsetHeight" : "clientHeight";
						if (this._beginBlankRow) rows["beginBlankRow"] = (this._beginBlankRow.parentNode.style.display == "none") ? 0 : this._beginBlankRow.firstChild[p];
						if (this._endBlankRow) rows["endBlankRow"] = (this._endBlankRow.parentNode.style.display == "none") ? 0 : this._endBlankRow.firstChild[p];
						rowHeightAverage = this._rowHeightAverage;
						startIndex = this.startIndex;
					}
				}
				if (grid._rowHeightInfos) grid.syncroRowHeights(this._container);
				var oldScrollTop = grid._scrollTop || 0;
				grid.updateScroller(this._container);
			}
		},

		refreshFrameHeader: function() {
			var grid = this.grid, tableFrameHeader = this._frameTHead;
			var $tableFrameHeader = jQuery(tableFrameHeader);
			if (grid._showHeader) {
				var headerTable = this._headerTable;
				var headerTBody = this._headerTBody;
				if (!headerTable) {
					headerTable = this._headerTable = $DomUtils.xCreate({
						tagName: "TABLE",
						className: "header-table",
						cellSpacing: 0,
						cellPadding: 0,
						style: {
							width: "100%"	// IE下必须
						},
						content: "^TBODY"
					});

					tableFrameHeader.appendChild($DomUtils.xCreate({
						tagName: "TR",
						style: {
							height: "1px"
						},
						content: {
							tagName: "TD",
							content: headerTable
						}
					}));
					headerTBody = this._headerTBody = headerTable.tBodies[0];

					var self = this;
					$fly(headerTBody).mousemove(function() {
						return self.onHeaderMouseMove.apply(self, arguments);
					}).mouseleave(function() {
							return self.onHeaderMouseLeave.apply(self, arguments);
						});

					var options = dorado.Object.apply({
						doradoDroppable: grid
					}, grid.defaultDroppableOptions);
					$fly(headerTable).droppable(options);
				}

				if (headerTable.columnModelTimestamp && headerTable.columnModelTimestamp != grid._columnModelTimestamp) {
					$fly(headerTBody).empty();
				}
				headerTable.columnModelTimestamp = grid._columnModelTimestamp;

				var structure = this._columnsInfo.structure;
				for(var i = 0; i < structure.length; i++) {
					var cellInfos = structure[i];
					var row = $DomUtils.getOrCreateChild(headerTBody, i, function() {
						var row = document.createElement("TR"), offset = 0;
						;
						$DomUtils.disableUserSelection(row);
						if (dorado.Browser.msie && dorado.Browser.version < 8 && cellInfos.length == 0) {
							offset = structure.length * 2;
						}
						row.style.height = (grid._headerRowHeight + offset) + "px";
						if (dorado.Browser.msie && dorado.Browser.version < 7) {
							row.style.position = "static";
						}
						return row;
					});

					var self = this;
					for(var j = 0; j < cellInfos.length; j++) {
						var cellInfo = cellInfos[j];
						var col = cellInfo.column;
						var cell = col.headerCell = $DomUtils.getOrCreateChild(row, j, function() {
							var cell = self.createCell();
							$fly(cell).click(function() {
								var column = grid._columnsInfo.idMap[cell.colId];
								if (column) {
									var eventArg = {
										column: column,
										processDefault: true
									};
									grid.fireEvent("onHeaderClick", grid, eventArg);
									if (eventArg.processDefault) {
										column.fireEvent("onHeaderClick", column, eventArg);
									}

									if (eventArg.processDefault) {
										if (column instanceof dorado.widget.grid.DataColumn &&
											column._property != "none" && column._supportsOptionMenu) {
											var sortState = column.get("sortState");
											try {
												grid.sort(column, !(sortState == null || sortState == "desc"));
											}
											catch(e) {
												dorado.Exception.removeException(e);
											}
										}
									}
								}
							});
							return cell;
						});
						cell.className = "header";
						cell.colSpan = cellInfo.colSpan;
						cell.rowSpan = cellInfo.rowSpan || (structure.length - i);
						if (dorado.Browser.msie && dorado.Browser.version < 7) {
							cell.style.position = "static";
						}
						cell.align = col._headerAlign;

						var $cell = $fly(cell);
						if ($cell.data("selectionMenuBinded")) {
							$cell.removeData("selectionMenuBinded");
							$cell.unbind("click");
						}

						var label = cell.firstChild;
						if (col instanceof dorado.widget.grid.DataColumn) {
							if (col.get("sortState")) $fly(cell).addClass("sorted-header");
							label.style.width = col._realWidth + "px";
						}
						else {
							var w = 0;
							col._columns.each(function(subCol) {
								if (subCol._visible) w += (subCol._realWidth || 0);
							});
							if (w) label.style.width = w + "px";
						}

						var processDefault = true, arg = {
							dom: label,
							column: col,
							processDefault: false
						};
						if (grid.getListenerCount("onRenderHeaderCell")) {
							grid.fireEvent("onRenderHeaderCell", this, arg);
							processDefault = arg.processDefault;
						}
						if (processDefault) {
							if (col.getListenerCount("onRenderHeaderCell")) {
								arg.processDefault = false;
								col.fireEvent("onRenderHeaderCell", col, arg);
								processDefault = arg.processDefault;
							}
							if (processDefault) {
								dorado.Renderer.render(col._headerRenderer || grid._headerRenderer || $singleton(dorado.widget.grid.DefaultCellHeaderRenderer), label, {
									grid: grid,
									innerGrid: this,
									column: col
								});
							}
						}
						cell.colId = col._uniqueId;
						if (grid._headerMenuOpenColumn == col) grid.showHeaderOptionButton(col);
					}
					$DomUtils.removeChildrenFrom(row, cellInfos.length);
				}
				$DomUtils.removeChildrenFrom(headerTBody, structure.length);

				var filterBarRow = this._filterBarRow, filterBarHeight = 0;
				var tFoot = headerTable.tFoot;
				if (grid._showFilterBar) {
					if (!filterBarRow) {
						tFoot = document.createElement("TFOOT");
						this._filterBarRow = filterBarRow = document.createElement("TR");
						filterBarRow.className = "filter-bar";
						$fly(filterBarRow).mouseenter(function() {
							grid.showFilterPanel();
						}).mouseleave(function() {
								dorado.Toolkits.setDelayedAction(grid, "$filterPanelTimerId", grid.hideFilterPanel, 500);
							});
						tFoot.appendChild(filterBarRow);
						headerTable.appendChild(tFoot);
					}
					else {
						tFoot = filterBarRow.parentNode;
						$fly(tFoot).show();
					}
					this.refreshFilterBar();
					filterBarHeight = tFoot.offsetHeight;
				}
				else if (tFoot) {
					$fly(tFoot).hide();
				}

				/*
				 if (!(dorado.Browser.mozilla || dorado.Browser.opera)) {
				 headerTable.style.height = ((grid._headerRowHeight + (dorado.Browser.msie ? 2 : 1)) * structure.length + filterBarHeight + 1) + "px";
				 }
				 */
				$tableFrameHeader.show();
			}
			else {
				$tableFrameHeader.hide();
			}
		},

		refreshFilterBar: function() {
			var grid = this.grid, filterBarRow = this._filterBarRow, filterEntity = grid._itemModel.filterEntity;
			var dataColumns = this._columnsInfo.dataColumns;
			for(var i = 0; i < dataColumns.length; i++) {
				var column = dataColumns[i];
				var cell = $DomUtils.getOrCreateChild(filterBarRow, i, this.createCell), label = cell.firstChild;
				cell.className = "filter-bar-cell";
				label.style.width = column._realWidth + "px";

				var renderer = grid._filterBarRenderer || column._filterBarRenderer || $singleton(dorado.widget.grid.FilterBarCellRenderer);
				dorado.Renderer.render(renderer, label, {
					grid: grid,
					innerGrid: this,
					data: filterEntity,
					column: column
				});
				cell.colId = column._uniqueId;
			}
			$DomUtils.removeChildrenFrom(filterBarRow, dataColumns.length);
		},

		refreshFrameFooter: function() {
			var grid = this.grid, tableFrameFooter = this._frameTFoot;
			var $tableFrameFooter = jQuery(tableFrameFooter);
			if (grid._showFooter) {
				var footerTable = this._footerTable;
				var footerRow = this._footerRow;
				if (!footerTable) {
					footerTable = this._footerTable = $DomUtils.xCreate({
						tagName: "TABLE",
						className: "footer-table",
						cellSpacing: 0,
						cellPadding: 0,
						style: {
							width: "100%"	// IE下必须
						},
						content: "^TR"
					});
					tableFrameFooter.appendChild($DomUtils.xCreate({
						tagName: "TR",
						style: {
							height: "1px"
						},
						content: {
							tagName: "TD",
							content: footerTable
						}
					}));
					footerRow = this._footerRow = footerTable.tBodies[0].childNodes[0];
				}
				footerRow.style.height = grid._footerRowHeight + "px";

				if (footerTable.columnModelTimestamp && footerTable.columnModelTimestamp != grid._columnModelTimestamp) {
					$fly(footerRow).empty();
				}
				footerTable.columnModelTimestamp = grid._columnModelTimestamp;

				var dataColumns = this._columnsInfo.dataColumns;
				for(var i = 0; i < dataColumns.length; i++) {
					var col = dataColumns[i];
					var cell = $DomUtils.getOrCreateChild(footerRow, i, this.createCell);
					cell.className = "footer";
					if (col._footerAlign) {
						cell.align = col._footerAlign;
					}
					else {
						cell.removeAttribute("align");
					}

					var label = cell.firstChild;
					if (col instanceof dorado.widget.grid.DataColumn) {
						label.style.width = col._realWidth + "px";
					}

					var processDefault = true, arg = {
						dom: label,
						data: grid._itemModel.footerEntity,
						column: col,
						processDefault: false
					};
					if (grid.getListenerCount("onRenderFooterCell")) {
						grid.fireEvent("onRenderFooterCell", this, arg);
						processDefault = arg.processDefault;
					}
					if (processDefault) {
						if (col.getListenerCount("onRenderFooterCell")) {
							arg.processDefault = false;
							col.fireEvent("onRenderFooterCell", col, arg);
							processDefault = arg.processDefault;
						}
						if (processDefault) {
							dorado.Renderer.render(col._footerRenderer || grid._footerRenderer || $singleton(dorado.widget.grid.DefaultCellFooterRenderer), label, {
								grid: grid,
								innerGrid: this,
								column: col,
								data: grid._itemModel.footerEntity
							});
						}
					}
					cell.colId = col._uniqueId;
				}
				$DomUtils.removeChildrenFrom(footerRow, dataColumns.length);

				$tableFrameFooter.show();
			}
			else {
				$tableFrameFooter.hide();
			}
		},

		refreshFrameBody: function(container) {
			this._cols = this._columnsInfo.dataColumns.length;
			if (this._scrollMode == "viewport") {
				this.refreshViewPortContent(container);
			}
			else {
				this.refreshContent(container);
			}
			if (this._scrollMode && this._scrollMode != this._scrollMode && !this.getCurrentItemId()) {
				this.onYScroll(this._divScroll);
			}
		},

		updateContainerHeight: function(container) {
			if (this.grid.hasRealHeight()) {
				var tableFrame = this.getDom();
				var h = (tableFrame.parentNode.offsetHeight -
					(this._headerTable ? this._headerTable.offsetHeight : 0) -
					(this._footerTable ? this._footerTable.offsetHeight : 0));
				if (h >= 0) container.style.height = h + "px";
			}
			else {
				container.style.height = '';
			}
		},

		notifySizeChange: function() {
			if (!this._parent || !this._rendered || this.fixed) return;
			this.grid.notifySizeChange();
		},

		doRefreshItemDomData: function(row, entity) {
			var grid = this.grid, processDefault = true;
			if (grid.getListenerCount("onRenderRow")) {
				var arg = {
					dom: row,
					data: entity,
					rowType: entity.rowType,
					processDefault: true
				};
				grid.fireEvent("onRenderRow", grid, arg);
				processDefault = arg.processDefault;
			}
			if (processDefault) {
				var renderer;
				if (entity.rowType == "header") {
					renderer = grid._groupHeaderRenderer || $singleton(dorado.widget.grid.GroupHeaderRenderer);
				}
				else if (entity.rowType == "footer") {
					renderer = grid._groupFooterRenderer || $singleton(dorado.widget.grid.GroupFooterRenderer);
				}
				else {
					renderer = grid._rowRenderer || $singleton(dorado.widget.grid.DefaultRowRenderer);
				}
				dorado.Renderer.render(renderer, row, {
					grid: grid,
					innerGrid: this,
					data: entity
				});
			}
		},

		createCell: function() {
			var label = document.createElement("DIV");
			label.className = "cell";
			label.style.overflow = "hidden";
			var cell = document.createElement("TD");
			cell.appendChild(label);
			return cell;
		},

		createItemDom: function(item) {
			var grid = this.grid;
			var row = document.createElement("TR");
			row.className = "row";
			if (this._scrollMode == "lazyRender" && this._shouldSkipRender) {
				row._lazyRender = true;
				row.style.height = grid._rowHeight + "px";
			}
			return row;
		},

		createItemDomDetail: function(row, item) {
			row.style.height = '';
		},

		refreshItemDoms: function(tbody, reverse, fn) {
			var grid = this.grid;
			if (this.fixed) {
				grid._rowHeightInfos = {
					rows: {},
					unmatched: [],
					unfound: {}
				};
			}

			if (grid._domMode == 2) {
				var rows;
				if (this.fixed) {
					rows = $invokeSuper.call(this, arguments);
				}
				else {
					var i = 0;
					var visibleRows = grid._rowHeightInfos ? grid._rowHeightInfos.visibleRows : Number.MAX_VALUE;
					rows = $invokeSuper.call(this, [tbody, reverse, (function(row) {
						var b = fn ? fn(row) : true;
						return b && ((++i) < visibleRows);
					})]);
				}
				if (grid._rowHeightInfos) grid._rowHeightInfos.visibleRows = rows;
				return rows;
			}
			else {
				return $invokeSuper.call(this, arguments);
			}
		},

		setFocus: dorado._NULL_FUNCTION,
		doOnResize: dorado._NULL_FUNCTION,

		onScroll: function(event, arg) {
			var grid = this.grid;
			if (grid._innerGrid == this) {
				grid.onScroll(event, arg);
			}
		},

		doOnKeyDown: function() {
			return true;
		},

		syncroRowHeights: function(scrollInfo) {
			with(this.grid._rowHeightInfos) {
				if (this.grid._dynaRowHeight) {
					for(var i = 0; i < unmatched.length; i++) {
						var row = this._itemDomMap[unmatched[i]];
						if (row) {
							var h = rows[unmatched[i]];
							if (dorado.Browser.msie && dorado.Browser.version == 8) {
								row.style.height = h + "px";
								$fly(row).toggleClass("fix-row-bug");
							}
							else {
								row.style.height = h + "px";
							}
							/*
							 else if (dorado.Browser.webkit || (dorado.Browser.msie && dorado.Browser.version > 8)) {
							 row.firstChild.style.height = h + "px";
							 }
							 */
						}
					}
					unmatched = [];

					if (this._itemDomCount > visibleRows) {
						for(var itemId in unfound) {
							if (unfound.hasOwnProperty(itemId)) {
								var row = this._itemDomMap[itemId];
								if (row) this.removeItemDom(row);
							}
						}
						unfound = {};
					}
				}

				if (this._beginBlankRow) {
					with(this._beginBlankRow) {
						var beginBlankRow = rows["beginBlankRow"];
						if (beginBlankRow) {
							firstChild.colSpan = this._cols;
							firstChild.style.height = beginBlankRow + "px";
							parentNode.style.display = "";
						}
						else {
							parentNode.style.display = "none";
						}
					}
				}
				if (this._endBlankRow) {
					with(this._endBlankRow) {
						var endBlankRow = rows["endBlankRow"];
						if (endBlankRow) {
							firstChild.colSpan = this._cols;
							firstChild.style.height = endBlankRow + "px";
							parentNode.style.display = "";
						}
						else {
							parentNode.style.display = "none";
						}
					}
				}

				this._itemDomCount = visibleRows;
				this._rowHeightAverage = rowHeightAverage;
				this.startIndex = startIndex;
				this._container.scrollTop = this._scrollTop = scrollInfo.scrollTop;
			}
		},

		syncroRowHeight: function(itemId) {
			var row = this._itemDomMap[itemId];
			if (!row) return;
			var h = this.grid._rowHeightInfos.rows[itemId];
			if (dorado.Browser.msie && dorado.Browser.version == 8) {
				row.style.height = h + "px";
				$fly(row).toggleClass("fix-row-bug");
			}
			else {
				row.style.height = h + "px";
			}
			/*
			 else if (dorado.Browser.webkit || (dorado.Browser.msie && dorado.Browser.version > 8)) {
			 row.firstChild.style.height = h + "px";
			 }
			 */
		},

		setYScrollPos: function(ratio) {
			var container = this._container, scrollTop = Math.round((container.scrollHeight - container.clientHeight) * ratio);
			if (scrollTop != container.scrollTop) {
				container.scrollTop = scrollTop;

				// 防止Grid的onScroll中的某些逻辑被触发导致死锁
				this.onYScroll(container);

				dorado.Toolkits.cancelDelayedAction(this._container, "$scrollTimerId");
				this._container.$scrollTimerId = 1; // 加一个假的timerId以避免row-list.js的onYScroll方法中判断出错
			}
		},

		setScrollingIndicator: function(text) {
			var indicator = this.getScrollingIndicator();
			$fly(indicator).text(text).show();
			$DomUtils.placeCenterElement(indicator, this.grid.getDom());
		},

		setHoverRow: function(row) {
			if (row && row.rowType) row = null;

			row = (row == null) ? null : ((row && row.nodeType) ? row : this._itemDomMap[row]);
			$invokeSuper.call(this, arguments);

			var grid = this.grid;
			if (row && grid._draggable && grid._dragMode != "control") {
				grid.applyDraggable(row);
			}

			if (grid._domMode != 2 || grid._processingSetHoverRow) return;
			grid._processingSetHoverRow = true;
			(this == grid._innerGrid ? grid._fixedInnerGrid : grid._innerGrid).setHoverRow(row ? row._itemId : null);
			grid._processingSetHoverRow = false;
		},

		showCellEditor: function(column) {
			var grid = this.grid;
			var row = this._currentRow;
			if (!row) return;

			if (grid._currentCell) $fly(grid._currentCell).removeClass("current-cell");
			for(var i = 0; i < row.cells.length; i++) {
				var cell = row.cells[i];
				if (cell.colId == column._uniqueId) {
					if (grid._divScroll) {
						var offset1 = $fly(grid._divScroll).offset(), offset2 = $fly(cell).offset();
						var t = offset2.top - offset1.top;
						if ((t + cell.offsetHeight) > grid._divScroll.clientHeight || t < 0) {
							return;
						}
					}

					// scroll the cell into view
					var gridDom = grid.getDom();
					if (gridDom.scrollWidth > gridDom.clientWidth ||
						gridDom.scrollHeight > gridDom.clientHeight) {
						var offset1 = $fly(gridDom).offset(), offset2 = $fly(cell).offset();
						with(gridDom) {
							var l = offset2.left - offset1.left;
							if ((l + cell.offsetWidth) > clientWidth) {
								scrollLeft -= clientWidth - (l + cell.offsetWidth);
							}
							else if (l < 0) {
								scrollLeft += l;
							}
						}
					}
					else if (grid._divScroll) {
						var container = this.getDom().parentNode;
						if (container.scrollWidth > container.clientWidth) {
							var scrollPos = -1, ratio;
							with(container) {
								if ((cell.offsetLeft + cell.offsetWidth) > (scrollLeft + clientWidth)) {
									scrollPos = cell.offsetLeft + cell.offsetWidth - clientWidth;
								}
								else if (cell.offsetLeft < scrollLeft) {
									scrollPos = cell.offsetLeft;
								}
								ratio = scrollPos / (scrollWidth - clientWidth);
							}
							if (scrollPos >= 0) {
								var divScroll = grid._divScroll;
								divScroll.scrollLeft = ratio * (divScroll.scrollWidth - divScroll.clientWidth);
							}
						}
					}

					grid._currentCell = cell;
					$fly(cell).addClass("current-cell");
					if (grid._focused && !(column._renderer && column._renderer.preventCellEditing) && grid._editing && grid.shouldEditing(column)) {
						var currentItem = this.getCurrentItem(), cellEditor;
						if (currentItem) cellEditor = grid._currentCellEditor = grid.getCellEditor(column, currentItem);
						if (cellEditor) {
							if (cellEditor.shouldShow()) {
								cellEditor.show(this, cell);
							}
						}
						else {
							var fc = dorado.widget.findFocusableControlInElement(cell);
							if (fc) {
								if (!fc.get("focused")) fc.setFocus();
							}
							else {
								if (!grid.get("focused")) grid.setFocus();
							}
						}
					}
					break;
				}
			}
		},

		onHeaderMouseMove: function(evt) {
			if ($DomUtils.isDragging()) return;
			var grid = this.grid, headerTable = this._headerTable;
			var offset = $fly(headerTable).offset(), action;

			var dataColumns = this._columnsInfo.dataColumns;
			for(var i = 0; i < dataColumns.length; i++) {
				var col = dataColumns[i];
				var headerCell = col.headerCell;
				if (col._resizeable && Math.abs((headerCell.offsetLeft + headerCell.offsetWidth) - (evt.pageX - offset.left)) < 2 &&
					(evt.pageY - offset.top) > getCellOffsetTop(headerCell, grid._headerRowHeight)) {
					action = "resize";
					showColumnResizeHandler(col);
					break;
				}
			}

			if (!action) {
				var headerCell = $DomUtils.findParent(evt.target, function(node) {
					return node.nodeName == "TD" && node.parentNode.parentNode.parentNode == headerTable;
				}, true);
				if (headerCell) {
					var column = grid._columnsInfo.idMap[headerCell.colId];
					if (column) {
						grid.setHoverHeaderColumn(column);
					}
				}
			}
			return !action;
		},

		onHeaderMouseLeave: function() {
			if ($DomUtils.isDragging()) return;
			var grid = this.grid;
			grid.setHoverHeaderColumn(null);
			return true;
		},

		getSelection: function() {
			if (this.fixed) {
				return this.grid._innerGrid.getSelection();
			}
			else {
				return $invokeSuper.call(this);
			}
		},

		setSelection: function(selection) {
			if (this.fixed) {
				this.grid._innerGrid._selection = selection;
			}
			else {
				this._selection = selection;
			}
		},

		toggleItemSelection: function(item, selected) {
			var grid = this.grid;
			if (!grid._highlightSelectedRow) return;

			$invokeSuper.call(this, arguments);

			if (grid._domMode != 2 || grid._processingToggleItemSelection) return;
			grid._processingToggleItemSelection = true;
			((this == grid._fixedInnerGrid) ? grid._innerGrid : grid._fixedInnerGrid).toggleItemSelection(item, selected);
			grid._processingToggleItemSelection = false;
		}

	});

	function getColumnDragHelper(evt, draggableElement) {
		// TODO: 待优化
		var cell = draggableElement;
		var ind = window._dragColIndicator;
		if (!ind) {
			window._dragColIndicator = ind = $DomUtils.xCreate({
				tagName: "DIV",
				className: "d-grid-col-drag-helper",
				style: {
					position: "absolute",
					tabIndex: -1
				},
				content: {
					tagName: "TABLE",
					style: {
						width: "100%",
						height: "100%"
					},
					content: {
						tagName: "TR",
						content: "^TD"
					}
				}
			});
			document.body.appendChild(ind);
		}
		if (cell) {
			$fly(ind).outerWidth(cell.offsetWidth).outerHeight(cell.offsetHeight).show().bringToFront();
			$fly(ind).find(">TABLE>TBODY>TR>TD").empty().attr("align", cell.align).append(cell.firstChild.cloneNode(true));
		}
		return ind;
	}

	function showColumnDropIndicator(grid, dropPosition) {
		if (!dropPosition) {
			hideColumnDropIndicator();
			return;
		}

		var ind = window._colDropIndicator;
		if (!ind) {
			var ind1 = $DomUtils.xCreate({
				tagName: "DIV",
				className: "d-grid-col-drag-top",
				style: {
					position: "absolute"
				}
			});
			var ind2 = $DomUtils.xCreate({
				tagName: "DIV",
				className: "d-grid-col-drag-bottom",
				style: {
					position: "absolute"
				}
			});
			var ind3 = $DomUtils.xCreate({
				tagName: "DIV",
				className: "d-grid-col-drop-indicator",
				style: {
					width: 1,
					position: "absolute"
				}
			});
			document.body.appendChild(ind1);
			document.body.appendChild(ind2);
			document.body.appendChild(ind3);

			window._colDropIndicator = ind = [ind1, ind2, ind3];
		}

		var cacheId = dropPosition.column._uniqueId + dropPosition.before;
		if (cacheId != window._colDropPosition) {
			window._colDropPosition = cacheId;

			var cell = dropPosition.column.headerCell;
			var offset = $fly(cell).offset();
			var cellOffsetTop = getCellOffsetTop(cell, grid._headerRowHeight);
			offset.top = $fly(cell.offsetParent).offset().top + cellOffsetTop;

			var arrowHeight = $setting["GridColDropIndicatorSize"] || 9;
			$fly(ind[0]).top(offset.top - arrowHeight);
			var top2 = $fly(cell.offsetParent).offset().top + cell.offsetParent.offsetHeight;
			$fly(ind[1]).top(top2);
			var widthAdj = dropPosition.before ? 0 : cell.offsetWidth;
			$fly([ind[0], ind[1]]).left(offset.left - 1 + widthAdj - parseInt(arrowHeight / 2));
			$fly(ind[2]).position(offset.left - 1 + widthAdj - parseInt(ind[2].offsetWidth / 2), offset.top).height(top2 - offset.top);

			if (ind[0].parentNode != document.body) {
				document.body.appendChild(ind[0]);
				document.body.appendChild(ind[1]);
				document.body.appendChild(ind[2]);
			}

			$fly(ind).show().bringToFront();
		}
	}

	function hideColumnDropIndicator() {
		window._colDropPosition = undefined;
		var ind = window._colDropIndicator;
		if (ind) $fly(ind).hide();
	}

	function showColumnResizeHandler(column) {
		var handler = window._colResizingHanlder, minSize = 5;
		if (!handler) {
			window._colResizingHanlder = handler = $DomUtils.xCreate({
				tagName: "DIV",
				className: "d-grid-col-resize-handler",
				style: {
					position: "absolute",
					width: 6,
					tabIndex: -1
				},
				onmouseleave: function() {
					$fly(handler).hide();
				}
			});
			document.body.appendChild(handler);
			$DomUtils.disableUserSelection(handler);
			$fly(handler).draggable({
				distence: 3,
				helper: getColumnResizeHelper,
				axis: "x",
				start: function(evt, ui) {
					var column = $fly(handler).data("column");
					var grid = column.get("grid");
					if (grid._currentCellEditor) {
						grid.hideCellEditor();
						dorado.widget.onControlGainedFocus(grid);
					}

					var cell = column.headerCell;
					var tableOffset = $fly(cell.offsetParent).offset();
					var cellOffsetTop = getCellOffsetTop(cell, grid._headerRowHeight);
					var cellOffset = $fly(cell).offset();
					cellOffset.top = tableOffset.top + cellOffsetTop;

					this._originLeft = cellOffset.left;
					this._originWidth = evt.pageX - cellOffset.left;
					var height = ((grid._domMode == 0) ? (grid.getDom()) : (grid._divScroll)).clientHeight - cellOffsetTop;
					ui.helper.show().bringToFront().position(this._originLeft, cellOffset.top).height(height);
				},
				drag: function(evt, ui) {
					ui.position.left = this._originLeft;
					if (evt.pageX - this._originLeft > minSize) {
						ui.helper.width(evt.pageX - this._originLeft);
					}
				},
				stop: function(evt, ui) {
					var width = evt.pageX - this._originLeft;
					if (width < minSize) width = minSize;
					if (width != this._originWidth) {
						var column = $fly(handler).data("column");
						var grid = column.get("grid");
						column._realWidth = column._width = column._realWidth + (width - this._originWidth);
						grid._ignoreItemTimestamp = true;
						grid.stretchColumnsToFit();
						grid.refresh();
					}
					return true;
				}
			});
		}
		var columnCell = column.headerCell, $columnCell = $fly(columnCell);
		var offset = $columnCell.offset();
		$fly(handler).data("column", column).bringToFront().top(offset.top).left(offset.left + columnCell.offsetWidth - 3).height(columnCell.offsetHeight).show();
		return handler;
	}

	function hideColumnResizeHandler() {
		var handler = window._colResizingHanlder;
		if (handler) $fly(handler).hide();
	}

	function getColumnResizeHelper() {
		if (!window._colResizeHelper) {
			window._colResizeHelper = $fly(document.body).xCreate({
				tagName: "DIV",
				style: {
					position: "absolute"
				},
				content: {
					tagName: "DIV",
					className: "d-grid-col-resize-helper",
					style: {
						height: "100%"
					}
				}
			}, null, {
				returnNewElements: true
			});
		}
		return window._colResizeHelper;
	}

})();

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

	valueComparators = {};
	
	/**
	 * @author Benny Bao (mailto:benny.bao@bstek.com)
	 * @class 列表数据模型。
	 * <p>列表数据模型是用于辅助列表控件管理列表数据的对象。</p>
	 */
	dorado.widget.list.ItemModel = $class(/** @scope dorado.widget.list.ItemModel.prototype */{
		$className: "dorado.widget.list.ItemModel",
		
		EMPTY_ITERATOR: new dorado.util.ArrayIterator([]),
		
		_itemDomSize: 0,
		_viewPortSize: 0,
		_scrollSize: 0,
		_scrollPos: 0,
		_startIndex: 0,
		_reverse: false,
		
		/**
		 * 列表控件中每一个列表元素显示时的大小。
		 * @param {int} itemDomSize 列表元素的大小。
		 */
		setItemDomSize: function(itemDomSize) {
			this._itemDomSize = itemDomSize;
		},
		
		/**
		 * 返回迭代数据的起始位置。
		 * @return {int} 起始位置。
		 * @see dorado.widget.list.ItemModel#setStartIndex
		 */
		getStartIndex: function() {
			return (this._startIndex > this.getItemCount()) ? 0 : this._startIndex;
		},
		
		/**
		 * 列表控件的可视区域中第一个可见列表项的位置序号，即迭代数据的起始位置。此序号是从0开始计算的。
		 * @param {int} startIndex 起始位置。
		 */
		setStartIndex: function(startIndex) {
			this._startIndex = startIndex;
		},
		
		/**
		 * 是否要以逆向对象数据进行迭代。
		 * @return {boolean} 是否逆向。
		 */
		isReverse: function() {
			return this._reverse;
		},
		
		/**
		 * 设置是否要以逆向对象数据进行迭代。
		 * @param {boolean} reverse 是否逆向。
		 */
		setReverse: function(reverse) {
			this._reverse = reverse;
		},
		
		/**
		 * 设置可视区域和滚动区域的大小。
		 * @param {int} viewPortSize 可视区域的大小。
		 * @param {int} scrollSize 滚动区域的大小。
		 */
		setScrollSize: function(viewPortSize, scrollSize) {
			this._viewPortSize = viewPortSize;
			this._scrollSize = scrollSize;
		},
		
		/**
		 * 设置可视区域当前的滚动位置。
		 * @param {int} scrollPos 滚动位置。
		 */
		setScrollPos: function(scrollPos) {
			var itemCount = this.getItemCount();
			if (itemCount > 0) {
				var itemDomSize = this._scrollSize / itemCount;
				if (scrollPos / (this._scrollSize - this._viewPortSize) > 0.5) {
					this._startIndex = itemCount - 1 - (Math.round((this._scrollSize - this._viewPortSize - scrollPos) / itemDomSize) || 0);
					if (this._startIndex > itemCount - 1) this._startIndex = itemCount - 1;
					this._reverse = true;
				} else {
					this._startIndex = Math.round(scrollPos / itemDomSize) || 0;
					this._reverse = false;
				}
			} else {
				this._startIndex = 0;
				this._reverse = false;
			}
		},
		
		/**
		 * 返回列表中要显示的数据。
		 * @return {Object[]|dorado.EntityList} data 数据。
		 */
		getItems: function() {
			return this._originItems || this._items;
		},
		
		/**
		 * 设置列表中要显示的数据。
		 * @param {Object[]|dorado.EntityList} items 数据。
		 */
		setItems: function(items) {
			if (this._filterParams) this.filter();
			this._items = items;
		},
		
		/**
		 * 返回一个从startIndex位置开始的数据迭代器。
		 * @param {int} [startIndex] 起始的迭代位置。
		 * 如果不定义此参数将从ItemModel的startIndex属性指定的位置开始迭代。
		 * @return {dorado.util.Iterator} 数据迭代器。
		 * @see dorado.widget.list.ItemModel#startIndex
		 */
		iterator: function(startIndex) {
			var items = this._items;
			if (!items) return this.EMPTY_ITERATOR;
			var index = startIndex || this._startIndex || 0;
			if (items instanceof Array) {
				return new dorado.util.ArrayIterator(this._items, index);
			} else {
				return items.iterator({
					currentPage: true,
					nextIndex: index
				});
			}
		},
		
		/**
		 * 返回总的列表数据实体的个数。
		 * @return {int} 数据实体的个数。
		 */
		getItemCount: function() {
			var items = this._items;
			if (!items) return 0;
			return (items instanceof Array) ? items.length : ((items.pageSize > 0) ? items.getPageEntityCount() : items.entityCount);
		},
		
		/**
		 * 根据传入的序号返回相应的列表数据实体，此序号是从0开始计算的。
		 * @param {int} index 列表数据实体的序号。
		 * @return {Object|dorado.Entity} 数据实体。
		 */
		getItemAt: function(index) {
			if (!this._items || !(index >= 0)) return null;
			if (this._items instanceof Array) {
				return this._items[index];
			} else {
				var entityList = this._items;
				return entityList.iterator({
					nextIndex: index
				}).next();
			}
		},
		
		/**
		 * 根据传入的Id返回相应的列表数据实体。
		 * @param {String|int} itemId 数据实体的Id。
		 * @return {Object|dorado.Entity} 数据实体。
		 */
		getItemById: function(itemId) {
			var items = this._items;
			if (items instanceof Array) {
				return items[itemId];
			} else {
				return items.getById(itemId);
			}
		},
		
		/**
		 * 根据传入的列表数据实体返回其在整个列表中的位置序号，此序号是从0开始计算的。
		 * @param {Object|dorado.Entity} item 数据实体。
		 * @return {int} index 数据实体的序号。
		 */
		getItemIndex: function(item) {
			if (!this._items || !item) return -1;
			if (this._items instanceof Array) {
				return this._items.indexOf(item);
			} else {
				var entityList = this._items, itemId = item.entityId, page = item.page;
				if (page.entityList != entityList) return -1;
				
				var index = 0, entry = page.first;
				while (entry != null) {
					if (entry.data.entityId == itemId) return index;
					if (entry.data.state != dorado.Entity.STATE_DELETED) index++;
					entry = entry.next;
				}
				return -1;
			}
		},
		
		getItemId: function(item, index) {
			if (this._items instanceof Array || !(item instanceof dorado.Entity)) {
				return (index >= 0) ? index : this.getItemIndex(item);
			} else {
				return item.entityId;
			}
		},
		
		/**
		 * 对所有数据实体进行排序。详见{@link dorado.DataUtil.sort}。
		 * @param {Object|Object[]} sortParams 排序参数或排序参数的数组。
		 * @param {String} sortParams.property 要排序的属性名。
		 * @param {boolean} sortParams.desc 是否逆向排序。
		 * @param {Function} comparator 比较器。
		 * @see dorado.DataUtil.sort
		 */
		sort: function(sortParams, comparator) {
			if (!this.getItemCount()) return;
			
			var items = this.toArray();
			dorado.DataUtil.sort(items, sortParams, comparator);
			if (!(this._items instanceof Array)) this._items = items;
		},
		
		/**
		 * 对所有数据实体进行过滤。
		 * @param {Object[]} filterParams 过滤条件的数组。
		 * @param {Function} [customFilter] 自定义过滤方法。
		 * @param {String} filterParams.property 要过滤的属性名。
		 * @param {String} filterParams.operator 比较操作符。如"="、"like"、">"、"<="等。
		 * @param {Object} filterParams.value 过滤条件值。
		 * @param {String} filterParams.junction 子过滤条件的连接方式，有"and"和"or"两种取值。
		 * <p>
		 * 当此属性的值不为空时filterParams.property、filterParams.operator、filterParams.value这些子属性都将被忽略，系统会进一步处理filterParams.criterions属性。
		 * </p>
		 * @param {[Object]} filterParams.filterParams 子过滤条件数组。此参数仅在filterParams.junction不为空时有效。
		 */
		filter: function(filterParams, customFilter) {
		
			function getValueComparator(op) {
				var comparator = valueComparators[escape(op)];
				if (!comparator) {
					if (!op || op == '=') op = "==";
					else if (op == '<>') op = "!=";
					valueComparators[escape(op)] = comparator = new Function("v1,v2", "return v1" + op + "v2");
				}
				return comparator;
			}
			
			function filterItem(item, filterParam) {
				var value;
				if (filterParam.property) {
					value = (item instanceof dorado.Entity) ? item.get(filterParam.property) : item[filterParam.property];
				} else {
					value = item;
				}
				
				var op = filterParam.operator;
				if (op == "like") {
					var s = (filterParam.value + '').toLowerCase();
					return (value + '').toLowerCase().indexOf(s) >= 0;
				} else if (op == "like*") {
					var s = (filterParam.value + '').toLowerCase();
					return (value + '').toLowerCase().startsWith(s);
				} else if (op == "*like") {
					var s = (filterParam.value + '').toLowerCase();
					return (value + '').toLowerCase().endsWith(s);
				} else {
					return getValueComparator(op)(value, filterParam.value);
				}
			}
			
			function processFilterParams(filterParams, junction) {
				var passed = (junction == "or") ? false : true;
				for (var i = 0; i < filterParams.length; i++) {
					var filterParam = filterParams[i], b;
					if (filterParam.junction) {
						b = processFilterParams(filterParam.criterions, filterParam.junction);
					}
					else {
						b = filterItem(item, filterParams[i]);
					}
					
					if (junction == "or" && b) {
						passed = true;
						break;
					}
					else if (junction == "and" && !b) {
						passed = false;
						break;
					}
				}
				return passed;
			}

			if (filterParams && filterParams.length > 0) {
				if (this._originItems) this._items = this._originItems;
				else this._originItems = this._items;
				var filtered = [];
				for (var it = this.iterator(0); it.hasNext();) {
					var item = it.next(), passed = undefined;
					if (customFilter) {
						passed = customFilter(item, filterParams);
					}
					if (passed === undefined || passed === null) {
						passed = processFilterParams(filterParams, "and");
					}
					if (passed) filtered.push(item);
				}
				this.filtered = true;
				this._items = filtered;
				this._filterParams = filterParams;
			} else if (this._originItems) {
				this.filtered = false;
				this._items = this._originItems;
				delete this._originItems;
				delete this._filterParams;
			}
		},
		
		/**
		 * 将列表数据模型中的数据导出到一个数组中。
		 * @return {Object[]} 数据实体数组。
		 */
		toArray: function() {
			if (this._items instanceof Array) {
				return this._items;
			} else if (this._items instanceof dorado.EntityList) {
				return this._items.toArray();
			} else {
				var v = [];
				for (var it = this.iterator(0); it.hasNext();) {
					v.push(it.next());
				}
				return v;
			}
		}
	});
	
})();

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
 * @class 键值对数组，即支持通过键值对元素进行快速定位的数组。
 * @param {Function} [getKeyFunction] 用于从元素中提取元素键值的函数，此函数应该返回一个String作为键值。
 *
 * @example
 * var keyedArray = new dorado.util.KeyedArray();
 *
 * @example
 * var keyedArray = new dorado.util.KeyedArray( function(obj) {
 * 	// 此处的参数obj为数组中的某个元素，返回值为与该元素匹配的键值。
 * 		return obj.id;
 * 	});
 */
dorado.util.KeyedArray = $class(/** @scope dorado.util.KeyedArray.prototype */{
	$className: "dorado.util.KeyedArray",
	
	// TODO: DOC for beforeInsert\afterInsert\beforeRemove\afterRemove
	// =====
	
	constructor: function(getKeyFunction) {
		/**
		 * @name dorado.util.KeyedArray#items
		 * @property
		 * @description 键值对数组中的所有元素。
		 * @type Array
		 */
		this.items = [];
		
		this._keyMap = {};
		this._getKeyFunction = getKeyFunction;
	},
	
	/**
	 * 键值对数组的大小，即数组中的元素个数。
	 * @type int
	 */
	size: 0,
	
	_getKey: function(data) {
		var key = this._getKeyFunction ? this._getKeyFunction(data) : null;
		return key + '';
	},
	
	/**
	 * 向键值对数组中添加一个对象。
	 * @param {Object} data 要添加的对象。
	 * @param {int|String} [insertMode] 对象的插入位置或插入模式。如果不定义此参数表示将对象添加到集合的末尾。
	 * 此参数具有两种可能的含义:
	 * <ul>
	 * <li>当此参数是一个数字时，表示新对象在集合中的最终位置。</li>
	 * <li>当此参数是一个字符串时，表示新对象的插入模式。
	 * 插入方式，包含下列四种取值：
	 * <ul>
	 * <li>begin - 在链表的起始位置插入。</li>
	 * <li>before - 在refData参数指定的参照对象之前插入。</li>
	 * <li>after - 在refData参数指定的参照对象之后插入。</li>
	 * <li>end - 在链表的末尾插入。</li>
	 * </ul>
	 * </li>
	 * </ul>
	 * @param {Object} [refData] 插入位置的参照对象。此参数仅在insertMode参数为字符串时有意义。
	 */
	insert: function(data, insertMode, refData) {
		var ctx;
		if (this.beforeInsert) ctx = this.beforeInsert(data); 
		if (!isFinite(insertMode) && insertMode) {
			switch (insertMode) {
				case "begin":{
					insertMode = 0;
					break;
				}
				case "before":{
					insertMode = this.items.indexOf(refData);
					if (insertMode < 0) insertMode = 0;
					break;
				}
				case "after":{
					insertMode = this.items.indexOf(refData) + 1;
					if (insertMode >= this.items.length) insertMode = null;
					break;
				}
				default:
					insertMode = null;
					break;
			}
		}
		
		if (insertMode != null && isFinite(insertMode) && insertMode >= 0) {
			this.items.insert(data, insertMode);
		} else {
			this.items.push(data);
		}
		
		this.size++;
		var key = this._getKey(data);
		if (key) this._keyMap[key] = data;
		if (this.afterInsert) this.afterInsert(data, ctx); 
	},
	
	/**
	 * 向键值对数组中追加一个对象。
	 * @param {Object} data 要追加的对象。
	 */
	append: function(data) {
		this.insert(data);
	},
	
	/**
	 * 从键值对数组中移除一个对象。
	 * @param {Object} data 要移除的对象。
	 * @return {int} 被移除元素的下标位置。
	 */
	remove: function(data) {
		var ctx;
		if (this.beforeRemove) ctx = this.beforeRemove(data); 
		var i = this.items.remove(data);
		if (i >= 0) {
			this.size--;
			var key = this._getKey(data);
			if (key) delete this._keyMap[key];
		}
		if (this.afterRemove) this.afterRemove(data, ctx); 
		return i;
	},
	
	/**
	 * 从键值对数组中移除指定位置的元素。
	 * @param {int} i 要移除元素的下标位置。
	 * @return {Object} 返回从数组中移除移除的对象.
	 */
	removeAt: function(i) {
		if (i >= 0 && i < this.size) {
			var data = this.items[i], ctx;
			if (data) {
				if (this.beforeRemove) ctx = this.beforeRemove(data); 
				var key = this._getKey(data);
				if (key) delete this._keyMap[key];
			}
			this.items.removeAt(i);
			this.size--;
			if (data && this.afterRemove) this.afterRemove(data, ctx); 
			return data;
		}
		return null;
	},
	
	/**
	 * 根据对象返回其在键值对数组中的下标位置。如果指定的对象不在键值对数组中将返回-1。
	 * @param {Object} data 查找的对象。
	 * @return {int} 下标位置。
	 */
	indexOf: function(data) {
		return this.items.indexOf(data);
	},
	
	/**
	 * 替换键值对数组的某一项。
	 * @param {Object} oldData 将被替换的对象。
	 * @param {Object} newData 新的对象。
	 * @return {int} 发生替换动作下标位置。如果返回-1则表示被替换的对象并不存在于该数组中。
	 */
	replace: function(oldData, newData) {
		var i = this.indexOf(oldData);
		if (i >= 0) {
			this.removeAt(i);
			this.insert(newData, i);
		}
		return i;
	},
	
	/**
	 * 根据传入的下标位置或键值返回匹配的对象。
	 * @param {int|String} k 下标位置或键值。
	 * @return {Object} 匹配的对象。
	 */
	get: function(k) {
		return (typeof k == "number") ? this.items[k] : this._keyMap[k];
	},
	
	/**
	 * 清除集合中的所有对象。
	 */
	clear: function() {
		for (var i = this.size - 1; i >= 0; i--) this.removeAt(i);
	},
	
	/**
	 * 返回数组的迭代器。
	 * @param {Object} [from] 从哪一个元素所在的位置开始迭代。
	 * @return {dorado.util.Iterator} 数组迭代器。
	 */
	iterator: function(from) {
		var start = this.items.indexOf(from);
		if (start < 0) start = 0;
		return new dorado.util.ArrayIterator(this.items, start);
	},
	
	/**
	 * 针对键值对数组中的每一个元素执行指定的函数。此方法可用于替代对数组的遍历代码。
	 * @param {Function} fn 针对每一个元素执行的函数。
	 * @param {Object} [scope] 函数脚本的宿主，即函数脚本中this的含义。如果此参数为空则表示this为数组中的某个对象。
	 *
	 * @example
	 * // 将每一个数组元素的name属性连接成为一个字符串。
	 * var names = "";
	 * var keyedArray = new dorado.util.KeyedArray();
	 * ... ... ...
	 * keyedArray.each(function(obj){
	 * 	names += obj.name;
	 * });
	 */
	each: function(fn, scope) {
		var array = this.items;
		for (var i = 0; i < array.length; i++) {
			if (fn.call(scope || array[i], array[i], i) === false) {
				return i;
			}
		}
	},
	
	/**
	 * 将集成从所有的对象导出至一个数组中。
	 * @return {Array} 包含所有集合元素的数组。
	 */
	toArray: function() {
		return this.items.slice(0);
	},
	
	/**
	 * 浅度克隆本键值对数组。
	 * @return {dorado.util.KeyedArray} 克隆的数组。
	 */
	clone: function() {
		var cloned = dorado.Core.clone(this);
		cloned.items = dorado.Core.clone(this.items);
		cloned._keyMap = dorado.Core.clone(this._keyMap);
		return cloned;
	},
	
	/**
	 * 深度克隆本键值对数组。
	 * @return {dorado.util.KeyedArray} 克隆的数组。
	 */
	deepClone: function() {
		var cloned = new dorado.util.KeyedArray(this._getKeyFunction);
		for (var i = 0; i < this.items.length; i++) {
			cloned.append(dorado.Core.clone(this.items[i]));
		}
		return cloned;
	}
});

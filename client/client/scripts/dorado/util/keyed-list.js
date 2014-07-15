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
 * @class 键值对集合，即支持通过键值对元素进行快速定位的集合。
 * 该集合的本质是一个双向链表，集合中的元素都被封装在一个个的链表元素中，链表元素对象包含下列子属性：
 * <ul>
 * <li>data - 该链表元素中封装的对象。</li>
 * <li>previous - 该链表元素的前一个链表元素。</li>
 * <li>next - 该链表元素的下一个链表元素。</li>
 * </ul>
 * @param {Function} [getKeyFunction] 用于从元素中提取元素键值的函数，此函数应该返回一个String作为键值。
 * 
 * @example
 * var keyedList = new dorado.util.KeyedList();
 *
 * @example
 * var keyedList = new dorado.util.KeyedList( function(obj) {
 *	 	// 此处的参数obj为数组中的某个元素，返回值为与该元素匹配的键值。
 *		return obj.id;
 *	 });
 */
dorado.util.KeyedList = $class(/** @scope dorado.util.KeyedList.prototype */{
	$className: "dorado.util.KeyedList",
	
	constructor: function(getKeyFunction) {
		this._keyMap = {};
		this._getKeyFunction = getKeyFunction;
	},
	
	/**
	 * @name dorado.util.KeyedList#first
	 * @property
	 * @description 链表中的第一个元素。
	 * @type Object
	 */
	/**
	 * @name dorado.util.KeyedList#last
	 * @property
	 * @description 链表中的最后一个元素。
	 * @type Object
	 */
	// =====
	/**
	 * 集合的大小，即集合中的元素个数。
	 * @type int
	 */
	size: 0,
	
	_getKey: function(data) {
		return this._getKeyFunction ? this._getKeyFunction(data) : null;
	},
	
	_registerEntry: function(entry) {
		var key = this._getKey(entry.data);
		if (key != null) this._keyMap[key] = entry;
	},
	
	_unregisterEntry: function(entry) {
		var key = this._getKey(entry.data);
		if (key != null) delete this._keyMap[key];
	},
	
	_unregisterAllEntries: function() {
		this._keyMap = {};
	},
	
	insertEntry: function(entry, insertMode, refEntry) {
		var e1, e2;
		switch (insertMode) {
			case "begin":
				e1 = null;
				e2 = this.first;
				break;
			case "before":
				e1 = (refEntry) ? refEntry.previous : null;
				e2 = refEntry;
				break;
			case "after":
				e1 = refEntry;
				e2 = (refEntry) ? refEntry.next : null;
				break;
			default:
				e1 = this.last;
				e2 = null;
				break;
		}
		
		entry.previous = e1;
		entry.next = e2;
		if (e1) e1.next = entry;
		else this.first = entry;
		if (e2) e2.previous = entry;
		else this.last = entry;
		
		this._registerEntry(entry);
		this.size++;
	},
	
	removeEntry: function(entry) {
		var e1, e2;
		e1 = entry.previous;
		e2 = entry.next;
		if (e1) e1.next = e2;
		else this.first = e2;
		if (e2) e2.previous = e1;
		else this.last = e1;
		
		this._unregisterEntry(entry);
		this.size--;
	},
	
	findEntry: function(data) {
		if (data == null) return null;
		
		var key = this._getKey(data);
		if (key != null) {
			return this._keyMap[key];
		} else {
			var entry = this.first;
			while (entry) {
				if (entry.data === data) {
					return entry;
				}
				entry = entry.next;
			}
		}
		return null;
	},
	
	/**
	 * 向集合中插入一个对象。
	 * @param {Object} data 要插入的对象。
	 * @param {String} [insertMode] 插入方式，包含下列四种取值：
	 * <ul>
	 * <li>begin - 在链表的起始位置插入。</li>
	 * <li>before - 在refData参数指定的参照对象之前插入。</li>
	 * <li>after - 在refData参数指定的参照对象之后插入。</li>
	 * <li>end - 在链表的末尾插入。</li>
	 * </ul>
	 * @param {Object} [refData] 插入位置的参照对象。
	 */
	insert: function(data, insertMode, refData) {
		var refEntry = null;
		if (refData != null) {
			refEntry = this.findEntry(refData);
		}
		var entry = {
			data: data
		};
		this.insertEntry(entry, insertMode, refEntry);
	},
	
	/**
	 * 向集合中追加一个对象。
	 * @param {Object} data 要集合的对象。
	 */
	append: function(data) {
		this.insert(data);
	},
	
	/**
	 * 从集合中移除一个对象。
	 * @param {Object} data 要移除的对象。
	 * @return {boolean} 是否成功的移除了对象。
	 */
	remove: function(data) {
		var entry = this.findEntry(data);
		if (entry != null) this.removeEntry(entry);
		return (entry != null);
	},
	
	/**
	 * 根据传入的键值从集合中移除匹配的对象。
	 * @param {String} key 键值。
	 * @return {Object} 被移除的匹配的对象。
	 */
	removeKey: function(key) {
		var entry = this._keyMap[key];
		if (entry) {
			this.removeEntry(entry);
			return entry.data;
		}
		return null;
	},
	
	/**
	 * 根据传入的键值返回匹配的对象。
	 * @param {String} key 键值。
	 * @return {Object} 匹配的对象。
	 */
	get: function(key) {
		var entry = this._keyMap[key];
		if (entry) {
			return entry.data;
		}
		return null;
	},
	
	/**
	 * 清除集合中的所有对象。
	 */
	clear: function() {
		var entry = this.first;
		while (entry) {
			if (entry.data) delete entry.data;
			entry = entry.next;
		}
		
		this._unregisterAllEntries();
		this.first = null;
		this.last = null;
		this.size = 0;
	},
	
	/**
	 * 返回键值对集合的迭代器。
	 * @param {Object} [from] 从哪一个元素所在的位置开始迭代。迭代时不包含传入的元素，而是从该元素的上一个或下一个开始。
	 * @return {dorado.util.KeyedListIterator} 键值对集合的迭代器。
	 */
	iterator: function(from) {
		return new dorado.util.KeyedListIterator(this, from);
	},
	
	/**
	 * 针对集合的每一个元素执行指定的函数。此方法可用于替代对集合的遍历代码，示例如下：
	 * @param {Function} fn 针对每一个元素执行的函数
	 * @param {Object} [scope] 函数脚本的宿主，即函数脚本中this的含义。如果此参数为空则表示this为集合中的某个对象。
	 * 
	 * @example
	 * // 将每一个集合元素的name属性连接成为一个字符串。
	 * var names = "";
	 * var keyedList = new dorado.util.KeyedList();
	 * ... ... ...
	 * keyedList.each(function(obj){
	 *	 names += obj.name;
	 * });
	 */
	each: function(fn, scope) {
		var entry = this.first, i = 0;
		while (entry != null) {
			if (fn.call(scope || entry.data, entry.data, i++) === false) {
				break;
			}
			entry = entry.next;
		}
	},
	
	/**
	 * 将集成从所有的对象导出至一个数组中。
	 * @return {Array} 包含所有集合元素的数组。
	 */
	toArray: function() {
		var v = [], entry = this.first;
		while (entry != null) {
			v.push(entry.data);
			entry = entry.next;
		}
		return v;
	},
	
	/**
	 * 返回集合中的第一个对象。
	 * @return {Object} 集合中的第一个对象。
	 */
	getFirst: function() {
		return this.first ? this.first.data : null;
	},
	
	/**
	 * 返回集合中的最后一个对象。
	 * @return {Object} 集合中的最后一个对象。
	 */
	getLast: function() {
		return this.last ? this.last.data : null;
	},
	
	/**
	 * 浅度克隆本键值对集合。
	 * @return {dorado.util.KeyedList} 克隆的集合。
	 */
	clone: function() {
		var cloned = new dorado.util.KeyedList(this._getKeyFunction);
		var entry = this.first;
		while (entry != null) {
			cloned.append(entry.data);
			entry = entry.next;
		}
		return cloned;
	},
	
	/**
	 * 深度克隆本键值对集合。
	 * @return {dorado.util.KeyedArray} 克隆的集合。
	 */
	deepClone: function() {
		var cloned = new dorado.util.KeyedList(this._getKeyFunction);
		var entry = this.first;
		while (entry != null) {
			cloned.append(dorado.Core.clone(entry.data));
			entry = entry.next;
		}
		return cloned;
	}
});

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @class 键值对集合的迭代器。
 * @extends dorado.util.Iterator
 * @param {dorado.util.KeyedList} list 要迭代的键值对集合。
 */
dorado.util.KeyedListIterator = $extend(dorado.util.Iterator, /** @scope dorado.util.KeyedListIterator.prototype */ {
	$className: "dorado.util.KeyedListIterator",
	
	constructor: function(list, from) {
		this._list = list;
		this.current = null;
		if (from) this.current = list.findEntry(from);
		
		this.isFirst = (this.current == null);
		this.isLast = false;
	},
	
	first: function() {
		this.isFirst = true;
		this.isLast = false;
		this.current = null;
	},
	
	last: function() {
		this.isFirst = false;
		this.isLast = true;
		this.current = null;
	},
	
	hasNext: function() {
		if (this.isFirst) {
			return (this._list.first != null);
		} else if (this.current != null) {
			return (this.current.next != null);
		} else {
			return false;
		}
	},
	
	hasPrevious: function() {
		if (this.isLast) {
			return (this._list.last != null);
		} else if (this.current != null) {
			return (this.current.previous != null);
		} else {
			return false;
		}
	},
	
	next: function() {
		var current = this.current;
		if (this.isFirst) {
			current = this._list.first;
		} else if (current != null) {
			current = current.next;
		} else {
			current = null;
		}
		this.current = current;
		
		this.isFirst = false;
		if (current != null) {
			this.isLast = false;
			return current.data;
		} else {
			this.isLast = true;
			return null;
		}
	},
	
	previous: function() {
		var current = this.current;
		if (this.isLast) {
			current = this._list.last;
		} else if (current != null) {
			current = current.previous;
		} else {
			current = null;
		}
		this.current = current;
		
		this.isLast = false;
		if (current != null) {
			this.isFirst = false;
			return current.data;
		} else {
			this.isFirst = true;
			return null;
		}
	},
	
	current: function() {
		return (this.current) ? this.current.data : null;
	},
	
	createBookmark: function() {
		return {
			isFirst: this.isFirst,
			isLast: this.isLast,
			current: this.current
		};
	},
	
	restoreBookmark: function(bookmark) {
		this.isFirst = bookmark.isFirst;
		this.isLast = bookmark.isLast;
		this.current = bookmark.current;
	}
});

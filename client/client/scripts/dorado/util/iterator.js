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
	 * @class 迭代器的通用接口。
	 * @abstract
	 */
	dorado.util.Iterator = $class(/** @scope dorado.util.Iterator.prototype */{
		$className: "dorado.util.Iterator",
		
		/**
		 * 将迭代器迭代位置设置到起始位置。
		 * @function
		 */
		first: dorado._NULL_FUNCTION,
		
		/**
		 * 将迭代器迭代位置设置到结束位置。
		 * @function
		 */
		last: dorado._NULL_FUNCTION,
		
		/**
		 * 返回迭代器中是否还存在上一个元素。
		 * @function
		 * @return {boolean} 是否还存在上一个元素。
		 */
		hasPrevious: dorado._NULL_FUNCTION,
		
		/**
		 * 返回迭代器中是否还存在下一个元素。
		 * @function
		 * @return {boolean} 是否还存在下一个元素。
		 */
		hasNext: dorado._NULL_FUNCTION,
		
		/**
		 * 返回迭代器中的上一个元素。
		 * @function
		 * @return {Object} 上一个元素。
		 */
		previous: dorado._NULL_FUNCTION,
		
		/**
		 * 返回迭代器中的下一个元素。
		 * @function
		 * @return {Object} 下一个元素。
		 */
		next: dorado._NULL_FUNCTION,
		
		/**
		 * 返回之前最后一次利用next()或previous()返回的元素。
		 * @function
		 * @return {Object} 当前元素。
		 */
		current: dorado._NULL_FUNCTION,
		
		/**
		 * 创建并返回一个书签对象。
		 * @function
		 * @return {Object} 书签对象。
		 */
		createBookmark: dorado._UNSUPPORTED_FUNCTION(),
		
		/**
		 * 根据传入的书签对象将迭代器的当前位置还原到书签对象所指示的位置。
		 * @function
		 * @param {Object} bookmark 书签对象。
		 */
		restoreBookmark: dorado._UNSUPPORTED_FUNCTION()
	});
	
	/**
	 * @author Benny Bao (mailto:benny.bao@bstek.com)
	 * @class 用于迭代JavaScript数组的迭代器。
	 * @extends dorado.util.Iterator
	 * @param {Array} v 将被迭代的数组。
	 * @param {int} [nextIndex] 下一个返回元素的下标。
	 */
	dorado.util.ArrayIterator = $extend(dorado.util.Iterator, /** @scope dorado.util.ArrayIterator.prototype */ {
		$className: "dorado.util.ArrayIterator",
		
		constructor: function(v, nextIndex) {
			this._v = v;
			this._current = (nextIndex || 0) - 1;
		},
		
		first: function() {
			this._current = -1;
		},
		
		last: function() {
			this._current = this._v.length;
		},
		
		hasPrevious: function() {
			return this._current > 0;
		},
		
		hasNext: function() {
			return this._current < (this._v.length - 1);
		},
		
		previous: function() {
			return (this._current < 0) ? null : this._v[--this._current];
		},
		
		next: function() {
			return (this._current >= this._v.length) ? null : this._v[++this._current];
		},
		
		current: function() {
			return this._v[this._current];
		},
		
		/**
		 * 设置迭代器的起始位置，即下一次调用next()时所返回的元素的下标。
		 * @param nextIndex {int} 下一个返回元素的下标。
		 */
		setNextIndex: function(nextIndex) {
			this._current = nextIndex - 1;
		},
		
		createBookmark: function() {
			return this._current;
		},
		
		restoreBookmark: function(bookmark) {
			this._current = bookmark;
		}
	});
	
})();

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
	// provide innerText supports to Element for Mozilla
	try {
		if (HTMLElement && !HTMLElement.prototype.innerText) {
		
			HTMLElement.prototype.__defineGetter__("innerText", function() {
				var text = this.textContent;
				if (text) {
					text = text.replace(/<BR>/g, "\n");
				}
				return text;
			});
			
			HTMLElement.prototype.__defineSetter__("innerText", function(text) {
				if (text && text.constructor == String) {
					var sections = text.split("\n");
					if (sections.length > 1) {
						this.innerHTML = "";
						for (var i = 0; i < sections.length; i++) {
							if (i > 0) this.appendChild(document.createElement("BR"));
							this.appendChild(document.createTextNode(sections[i]));
						}
						return;
					}
				}
				this.textContent = text;
			});
		}
	} 
	catch (ex) {
	}
	
	if (!String.prototype.startsWith) {
		String.prototype.startsWith = function(str) {
			return this.slice(0, str.length) == str;
		};
	}
	if (!String.prototype.endsWith) {
		String.prototype.endsWith = function(str) {
			return this.slice(-str.length) == str;
		};
	}
	
	
	/**
	 * @name Array
	 * @class 为系统的数组提供的prototype扩展。
	 * <p>
	 * <b>注意：此处的文档只描述了扩展的部分，并未列出数组对象所支持的所有属性方法。</b>
	 * </p>
	 */
	// ====
	
	// provide push, indexOf, removeAt, remove, insert supports to Array
	if (!Array.prototype.push) {
		/**
		 * 向数组的末尾追加一个元素。
		 * <p>
		 * <b>大部分浏览器中JavaScript引擎已经支持此方法，dorado扩展的目的仅针对那些原本不支持此方法的浏览器。</b>
		 * </p>
		 * @param {Object} element 要追加的元素。
		 */
		Array.prototype.push = function(element) {
			this[this.length] = element;
		};
	}
	
	if (!Array.prototype.indexOf) {
		/**
		 * 返回某元素在数组中第一次出现的下标位置。
		 * <p>
		 * <b>大部分浏览器中JavaScript引擎已经支持此方法，dorado扩展的目的仅针对那些原本不支持此方法的浏览器。</b>
		 * </p>
		 * @param {Object} element 要寻找的元素。
		 * @return {int} 元素的下标位置。
		 */
		Array.prototype.indexOf = function(element) {
			for (var i = 0; i < this.length; i++) {
				if (this[i] == element) {
					return i;
				}
			}
			return -1;
		};
	}
	
	if (!Array.prototype.remove) {
		/**
		 * 从数组删除某元素。
		 * <p>
		 * 如果要删除的元素并不存在于数组中，那么此方法什么都不会做，并且返回值为-1。<br>
		 *  如果要删除的元素在于数组中出现多次，那么此方法只删除元素第一次出现的位置，并返回该位置的下标。
		 * </p>
		 * @param {Object} element 要删除的元素。
		 * @return {int} 被删除元素原先的下标位置。
		 */
		Array.prototype.remove = function(element) {
			var i = this.indexOf(element);
			if (i >= 0) this.splice(i, 1);
			return i;
		};
	}
	
	if (!Array.prototype.removeAt) {
		/**
		 * 从数组删除某下标位置处的元素。
		 * <p>
		 * 此方法删除某下标位置后，后面的元素会自动递补，最终数组的长度会缩小1个单位。
		 * </p>
		 * @param {int} i 要删除的下标位置。
		 */
		Array.prototype.removeAt = function(i) {
			this.splice(i, 1);
		};
	}
	
	if (!Array.prototype.insert) {
		/**
		 * 向数组中的指定位置插入一个元素。
		 * <p>
		 * 插入元素后，原插入位置开始的元素会自动后退，最终数组的长度会增加1个单位。
		 * </p>
		 * @param {Object} element 要插入的元素。
		 * @param {Object} [i=0] 要插入的下标位置。
		 */
		Array.prototype.insert = function(element, i) {
			this.splice(i || 0, 0, element);
		};
	}
	
	if (!Array.prototype.peek) {
	
		/**
		 * 返回数组中的最后一个元素。
		 * @return {Object} 最后一个元素。
		 */
		Array.prototype.peek = function() {
			return this[this.length - 1];
		};
	}
	
	if (!Array.prototype.each) {
	
		/**
		 * 遍历数组。
		 * @param {Function} fn 针对数组中每一个元素的回调函数。此函数支持下列两个参数:
		 * <ul>
		 * <li>item - {Object} 当前遍历到的数据元素。</li>
		 * <li>[i] - {int} 当前遍历到的数据下标。</li>
		 * </ul>
		 * 另外，此函数的返回值可用于通知系统是否要终止整个遍历操作。
		 * 返回true或不返回任何数值表示继续执行遍历操作，返回false表示终止整个遍历操作。<br>
		 * 此回调函数中的this指向正在被遍历的数组。
		 *
		 * @example
		 * var s = '';
		 * ['A', 'B', 'C'].each(function(item) {
		 * 	s += item;
		 * });
		 * // s == "ABC"
		 */
		Array.prototype.each = function(fn) {
			for (var i = 0; i < this.length; i++) {
				if (fn.call(this, this[i], i) === false) break;
			}
		};
	}

	if (!Function.prototype.bind) {
		Function.prototype.bind = function (target) {
			var fn = this;
			return function () {
				return fn.apply(target, arguments);
			};
		};
	}
})();

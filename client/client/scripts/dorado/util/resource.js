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
 * @class 资源集合对象，主要用于实现国际化等功能。
 * @static
 * @see $resource
 */
dorado.util.Resource = {
	
	strings: {},

	/**
	 * 向dorado资源集合中添加一组资源。
	 * <p>
	 * 需要特别注意的是，此方法的传入参数具有多态性，当我们只为此方法传入一个参数并且这个参数不是String时， 系统会将这个参数识别为items。
	 * </p>
	 * @param {String} namespace 命名空间。传入null代表不指定命名空间。
	 * @param {Object} items 以JSON对象方式定义的一组资源。
	 * 
	 * @example
	 * // 向默认的命名空间中资源集合一次性的添加3项资源
	 * dorado.util.Resource.append( {
	 *	 property1 : "value1",
	 *	 property2 : "value2",
	 *	 property3 : "value3"
	 * });
	 * 
	 * @example
	 * // 向资源集合一次性的想命名空间"xxx.yyy.zzz"中添加3项资源
	 * dorado.util.Resource.append("xxx.yyy.zzz"， {
	 *	 property1 : "value1",
	 *	 property2 : "value2",
	 *	 property3 : "value3"
	 * });
	 */
	append: function(namespace, items) {
		if (arguments.length == 1 && namespace && namespace.constructor != String) {
			items = namespace;
			namespace = null;
		}		
		for (var p in items) {
			if (items.hasOwnProperty(p)) {
				if (namespace) {
					this.strings[namespace + '.' + p] = items[p];
				}
				else {
					this.strings[p] = items[p];
				}
			}
		}
	},

	sprintf: function() {
		var num = arguments.length;
		var s = arguments[0];
		for ( var i = 1; i < num; i++) {
			var pattern = "\\{" + (i - 1) + "\\}";
			var re = new RegExp(pattern, "g");
			s = s.replace(re, arguments[i]);
		}
		return s;
	},

	/**
	 * 根据给定的资源路径和一组参数返回资源字符串。此方法的具体使用方法请参考{@link $resource}的说明。
	 * @param {String} path 由命名空间+资源项名称组成的资源路径。
	 * @param {Object} [args...] 一到多个参数。
	 * @return {String} 资源字符串。
	 * @see $resource
	 */
	get: function(path) {
		var str = this.strings[path];
		if (arguments.length > 1 && str) {
			arguments[0] = str;
			return this.sprintf.apply(this, arguments);
		}
		else {
			return str;
		}
	}
};

/**
 * @name $resource
 * @function
 * @description dorado.util.Resource.get()的快捷方式。根据给定的资源路径和一组参数返回资源字符串。
 * @param {String} path 由命名空间+资源项名称组成的资源路径。
 * @param {Object} [args...] 一到多个参数。
 * @return {String} 资源字符串。
 * @see dorado.util.Resource#get
 * 
 * @example
 * // 提取名默认命名空间中的property1代表的字符串
 * var text = $resource("property1");
 * 
 * @example
 * // 提取名为命名空间xxx.yyy.zzz中的property1代表的字符串
 * var text = $resource("xxx.yyy.zzz.property1");
 * 
 * @example
 * // 假设xxx.yyy.zzz.property1所代表的资源字符串是"My name is {0}, I'm {1} years old."，
 * // 此方法将返回"My name is John, I'm 5 years old."
 * var text = $resource("xxx.yyy.zzz.property1", "John", 5);
 */
window.$resource = function(path, args) {
	return dorado.util.Resource.get.apply(dorado.util.Resource, arguments);
};

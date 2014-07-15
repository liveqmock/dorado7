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

	function f(n) {
		return n < 10 ? '0' + n : n;
	}
	
	Date.prototype.toJSON = function(key) {
		return this.getFullYear() + '-' + f(this.getMonth() + 1) + '-' + f(this.getDate()) + 'T' +
			f(this.getHours()) + ':' + f(this.getMinutes()) + ':' + f(this.getSeconds()) + 'Z';
	};
	
	/**
	 * @author Benny Bao (mailto:benny.bao@bstek.com)
	 * @class 用于实现一些与JSON相关功能的对象。
	 * @static
	 */
	dorado.JSON = {
	
		/**
		 * 将一段JSON字符串解析成JSON对象。
		 * @param {Object} text 要解析的JSON字符串。
		 * @param {boolean} [untrusty] 服务器返回的Response信息是否是不可信的。默认为false，即Response信息是可信的。<br>
		 * 此参数将决定dorado通过何种方式来解析服务端返回的JSON字符串，为了防止某些嵌入在JSON字符串中的黑客代码对应用造成伤害，
		 * dorado可以使用安全的方式来解析JSON字符串，但是这种安全检查会带来额外的性能损失。
		 * 因此，如果您能够确定访问的服务器是安全的，其返回的JSON字符串不会嵌入黑客代码，那么就不必开启此选项。
		 * @return {Object} 得到的JSON对象。
		 */
		parse: function(text, untrusty) {
			return text ? ((untrusty) ? JSON.parse(text) : eval('(' + text + ')')) : null;
		},
		
		/**
		 * 将给定的JSON对象、实体对象({@link dorado.Entity})或实体集合({@link dorado.EntityList})转换成JSON字符串。
		 * @param {Object} value 要转换的数据。
		 * @param {Object} [options] 转换选项。
		 * @param {String[]} [options.properties] 属性名数组，表示只转换该数组中列举过的属性。如果不指定此属性表示转换实体对象中的所有属性。
		 * @param {boolean} [options.includeReferenceProperties] 是否转换实体对象中{@link dorado.Reference}类型的属性。默认按false进行处理。
		 * @param {boolean} [options.includeLookupProperties] 是否转换实体对象中{@link dorado.Lookup}类型的属性。默认按false进行处理。
		 * @param {boolean} [options.includeUnloadPage] 是否转换{@link dorado.EntityList}中尚未装载的页中的数据。默认按false进行处理。
		 * @return {String} 得到的JSON字符串。
		 */
		stringify: function(value, options) {
			if (value != null) {
				if (value instanceof dorado.Entity || value instanceof dorado.EntityList) {
					value = value.toJSON(options);
				}
			}
			return JSON.stringify(value, (options != null) ? options.replacer : null);
		},
		
		/**
		 * 对JSON数据模板进行求值。
		 * <p>
		 * JSON数据模板事实上指包含function型值的JSON对象。 对JSON数据模板进行求值，就是执行这些function并且得到最终的返回值。
		 * </p>
		 * @param {Object} template JSON数据模板。
		 * @return 求值后得到的最终JSON数据。
		 *
		 * @example
		 * // 这是一个JSON数据模板，如下：
		 * {
		 * 	property1: "value1",
		 * 	property2: function() {
		 * 		return 100 + 200;
		 * 	}
		 * }
		 *
		 * // 经过求值，我们将得到一个新的JSON对象，如下：
		 * {
		 * 	property1: "value1",
		 * 	property2: 300
		 * }
		 */
		evaluate: function(template) {
		
			function toJSON(obj) {
				if (typeof obj == "function") {
					obj = obj.call(dorado.$this || this);
				} else if (obj instanceof dorado.util.Map) {
					obj = obj.toJSON();
				}
				
				var json;
				if (obj instanceof dorado.Entity || obj instanceof dorado.EntityList) {
					json = obj.toJSON({
						generateDataType: true
					});
				} else if (obj instanceof Array) {
					json = [];
					for (var i = 0; i < obj.length; i++) {
						json.push(toJSON(obj[i]));
					}
				} else if (obj instanceof Object && !(obj instanceof Date)) {
					if (typeof obj.toJSON == "function") {
						json = obj.toJSON();
					} else {
						json = {};
						for (var p in obj) {
							if (obj.hasOwnProperty(p)) {
								v = obj[p];
								if (v === undefined) continue;
								if (v != null) v = toJSON.call(obj, v);
								json[p] = v;
							}
						}
					}
				} else {
					json = obj;
				}
				return json;
			}
			
			return toJSON(template);
		}
	};
	
})();

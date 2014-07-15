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
 * @name dorado.util.Common
 * @class 一些实现通用功能的工具方法。
 * @static
 */
dorado.util.Common = {

	/**
	 * 用于注册URL预设变量的JSON对象。
	 * @type {Object}
	 * @see dorado.util.Common.translateURL
	 * @see $url
	 */
	URL_VARS: {},

	concatURL: function () {
		var url = "";
		for (var i = 0; i < arguments.length; i++) {
			var section = arguments[i];
			if (typeof section == "string" && section) {
				section = jQuery.trim(section);
				var e = (url.charAt(url.length - 1) == '/');
				var s = (section.charAt(0) == '/');
				if (s == e) {
					if (s) {
						url += section.substring(1);
					}
					else {
						url += '/' + section;
					}
				}
				else {
					url += section;
				}
			}
		}
		return url;
	},

	/**
	 * 将一段给定URL转换为最终的可以使用的URL。
	 * <p>
	 * 此方法允许用户在定义一个URL时利用">"在URL中植入特定的内容。<br>
	 * 例如：">images/loading.gif"表示应用的根路径下的"images/loading.gif"。
	 * 如果此时应用的根路径是"/sampleApp"，那么此方法最终返回的URL将是"/sampleApp/images/loading.gif"。（应用的根路径通过{@link $setting}中的"common.contextPath"项设定）
	 * </p>
	 * <p>
	 * 另外，此方法还支持在URL中植入预设变量。<br>
	 * 例如："skin>button.css"表示系统当前皮肤根路径中的button.css。其中的"skin>"就代表一个名为skin的预设变量。此方法会将预设变量的值替换的URL中。<br>
	 * 假设skin变量的值为"/sampleApp/skins/nature/"，那么上述URL的最终转换结果为"/sampleApp/skins/nature/button.css"。
	 * </p>
	 * <p>
	 * 此方法中使用的预设变量都需要注册在{@link dorado.Toolkits.URL_VARS}中，系统默认情况下只提供一个名为skin的预设变量。开发人员可以根据自己的需要向URL_VARS中注册自己的预设变量。
	 * </p>
	 * @param {String} url 要转换的URL。
	 * @return {String} 转换后得到的URL。
	 * @see $url
	 * @see dorado.Toolkits.URL_VARS
	 */
	translateURL: function (url) {
		if (!url) return url;

		var reg = /^.+\>/, m = url.match(reg);
		if (m) {
			m = m[0];
			var varName = m.substring(0, m.length - 1);
			if (varName.charAt(0) == '>') varName = varName.substring(1);
			var s1 = this.URL_VARS[varName] || "", s2 = url.substring(m.length);
			url = this.concatURL(s1, s2);
		}
		else if (url.charAt(0) == '>') {
			url = this.concatURL($setting["common.contextPath"], url.substring(1));
		}
		return url;
	},

	parseExponential: function(n) {
		n = n + '';
		var cv = n.split("e-");
		var leadingZero = "";
		var fl = parseInt(cv[1]);
		for(var i = 0; fl > 1 && i < fl-1; i++){
			leadingZero +="0";
		}
		
		var es = cv[0];
		var pi = es.indexOf(".");
		if (pi > 0){
			es = es.substring(0, pi) + es.substring(pi+1);
		}
		n = "0."+leadingZero + es;
		return n;
	},
	
	/**
	 * 格式化输出数字的方法。
	 * <p>
	 * 此方法的format参数是一个格式化字符串，用于指定数字的格式化方式。 其语法中包含下面的几种具有特定含义的字符或组合:
	 * <ul>
	 * <li># - 用于表示一个非强制输出的数字字符。即如果在此位置有可用的数字则输出该数字，否则不输出任何内容。</li>
	 * <li>0 - 用于表示一个强制输出的数字字符。即如果在此位置有可用的数字则输出该数字，否则将输出0来占位。</li>
	 * <li>#, - 用于表示以123,456,这样的方式向左输出所有的剩余数字。</li>
	 * </ul>
	 * </p>
	 * @param {float} n 要转换的浮点数。
	 * @param {String} format 格式化字符串。
	 * @return {String} 格式化后得到的字符串。
	 *
	 * @example
	 * var $formatFloat = dorado.util.Common.formatFloat;
	 * $formatFloat(123456789.789, "#,##0.00"); // 123,456,789.79
	 * $formatFloat(123456789.789, "#"); // 123456790
	 * $formatFloat(123456789.789, "0"); // 123456790
	 * $formatFloat(123, "#.##"); // 123
	 * $formatFloat(123, "0.00"); // 123.00
	 * $formatFloat(0.123, "0.##"); // 0.12
	 * $formatFloat(0.123, "#.##"); // .12
	 * $formatFloat(-0.123, "0.##"); // -0.12
	 * $formatFloat(-0.123, "#.##"); // -.12
	 * $formatFloat(1234.567, "$#,##0.00/DAY"); // $1,234.57/DAY
	 * $formatFloat(02145375683, "(###)########"); // (021)45375683
	 */
	formatFloat: function(n, format) {
	
		function formatInt(n, format, dec) {
			if (!format) {
				return (parseInt(n.substring(0, nfs.length), 10) + 1) + '';
			}
			
			var c, f, r = '', j = 0, prefix = '';
			var fv = format.split('');
			for (var i = 0; i < fv.length; i++) {
				f = fv[i];
				if (f == '#' || f == '0' || f == '`') {
					fv = fv.slice(i);
					break;
				}
				prefix += f;
			}
			fv = fv.reverse();
			var cv = n.split('').reverse();
			for (var i = 0; i < fv.length; i++) {
				f = fv[i];
				if (f == '#') {
					if (j < cv.length) {
						if (n == '0') {
							j = cv.length;
						} else if (n == '-0') {
							if (dec) r += '-';
							j = cv.length;
						} else {
							r += cv[j++];
						}
					}
				} else if (f == '0') {
					if (j < cv.length) {
						r += cv[j++];
					} else {
						r += f;
					}
				} else if (f == '`') {
					var commaCount = 3;
					while (j < cv.length) {
						var c = cv[j++];
						if (commaCount == 3 && c != '-') {
							r += ',';
							commaCount = 0;
						}
						r += c;
						commaCount++;
					}
				} else {
					r += f;
				}
			}
			
			while (j < cv.length) {
				r += cv[j++];
			}
			return prefix + r.split('').reverse().join('');
		}
	
		function formatDecimal(n, format) {
			var nfs = (format) ? format.match(/[\#0]/g) : null;
			if (nfs === null) {
				return [format, (n && n.charAt(0) > '4')];
			} else if (n && n.length > nfs.length && n.charAt(nfs.length) > '4') {
				var n = n.substring(0, nfs.length);
				n = (parseInt(n, 10) + 1) + '';
				var overflow = n.length > nfs.length;
				if (overflow) {
					n = n.substring(n.length - nfs.length);
				} else {
					var leadingZero = '';
					for (var i = n.length; i < nfs.length; i++) {
						leadingZero += '0';
					}
					n = leadingZero + n;
				}
			}
			
			var f, r = '', j = 0;
			for (var i = 0; i < format.length; i++) {
				f = format.charAt(i);
				if (f == '#' || f == '0') {
					if (n && j < n.length) {
						r += n.charAt(j++);
					} else if (f == '0') {
						r += f;
					}
				} else {
					r += f;
				}
			}
			return [r, overflow];
		}
		
		if (n == null || isNaN(n)) return "";
		n = n + '';
		if (n.indexOf("e-") > 0){
			n = dorado.util.Common.parseExponential(n);
		}
		if (!format) return n;
		var n1, n2, f1, f2, i;
		i = n.indexOf('.');
		if (i > 0) {
			n1 = n.substring(0, i);
			n2 = n.substring(i + 1);
		} else {
			n1 = n;
		}
		
		i = format.indexOf('.');
		if (i > 0) {
			f1 = format.substring(0, i);
			f2 = format.substring(i + 1);
		} else {
			f1 = format;
		}
		f1 = f1.replace(/\#,/g, '`');
		
		var r = formatDecimal(n2, f2);
		var dec = r[0];
		if (r[1]) {
			n1 = (parseInt(n1, 10) + ((n1.charAt(0) == '-') ? -1 : 1)) + '';
		}
		return formatInt(n1, f1, dec) + ((dec) ? ('.' + dec) : '');
	},	
	
	/**
	 * 尝试将一段字符串中包含的数字转换成一个浮点数。 如果转换失败将返回Number.NaN。
	 * @param {String} s 要转换的字符串。
	 * @return {float} 转换后得到的浮点数。
	 */
	parseFloat: function(s) {
		if (s === 0) return 0;
		if (!s) return Number.NaN;		
		s = s + '';
		if (s.indexOf("e-") > 0){
			s = dorado.util.Common.parseExponential(s);
		}
		var ns = s.match(/[-\d\.]/g);
		if (!ns) return Number.NaN;
		var n = parseFloat(ns.join(''));
		if (n > 9007199254740991) {
			throw new dorado.ResourceException("dorado.data.ErrorNumberOutOfRangeG");
		}
		else if (n < -9007199254740991) {
			throw new dorado.ResourceException("dorado.data.ErrorNumberOutOfRangeL");
		}
		return n;
	},

	_classTypeCache: {},
	
	/**
	 * 根据给定的Class类型的名称返回具体的Class的构造器。
	 * @param {String} type Class类型的名称。
	 * @param {boolean} [silence] 是否已安静的方式执行。即当此方法的执行过程中发生异常时，是否要抛出异常。
	 * @return {Function} 具体的Class的构造器。
	 */
	getClassType: function(type, silence) {
		var classType = null;
		try {
			classType = this._classTypeCache[type];
			if (classType === undefined) {
				var path = type.split('.'), obj = window, i = 0, len = path.length;
				for (; i < len && obj; i++) {
					obj = obj[path[i]];
				}
				if (i == len) classType = obj;
				this._classTypeCache[type] = (classType || null);
			}
		}
		catch (e) {
			if (!silence) throw new dorado.ResourceException("dorado.core.UnknownType", type);
		}
		return classType;
	},
	
	singletonInstance: {},
	
	/**
	 * 返回一个单例对象。
	 * @param {String|Function} factory 单例对象的类型名或创建工厂。
	 * @return {Object} 单例对象的实例。
	 *
	 * @see $singleton
	 *
	 * @example
	 * // 利用类型名
	 * var renderer = dorado.util.Common.getSingletonInstance("dorado.widget.grid.DefaultCellRenderer");
	 *
	 * @example
	 * // 利用创建工厂
	 * var renderer = dorado.util.Common.getSingletonInstance(function() {
	 * 	return dorado.widget.grid.DefaultCellRenderer();
	 * });
	 */
	getSingletonInstance: function(factory) {
		var typeName;
		if (typeof factory == "string") typeName = factory;
		else {
			typeName = factory._singletonId;
			if (!typeName) {
				factory._singletonId = typeName = dorado.Core.newId();
			}
		}
		
		var instance = this.singletonInstance[typeName];
		if (!instance) {
			if (typeof factory == "string") {
				var classType = dorado.util.Common.getClassType(typeName);
				instance = new classType();
			}
			else {
				instance = new factory();
			}
			this.singletonInstance[typeName] = instance;
		}
		return instance;
	}
};

/**
 * @name $url
 * @function
 * @description dorado.Toolkits.translateURL()方法的快捷方式。
 * 详细用法请参考dorado.Toolkits.translateURL()的说明。
 * @see dorado.Toolkits.translateURL
 */
window.$url = function (url) {
	return dorado.util.Common.translateURL(url);
};

dorado.util.Common.URL_VARS.skin = $url($setting["widget.skinRoot"] + ($setting["widget.skin"] ? ($setting["widget.skin"] + '/') : ''));

/**
 * @name $singleton
 * @function
 * @description dorado.util.Common.getSingletonInstance()方法的快捷方式。
 * @param {String|Object} factory 单例对象的类型名或创建工厂。
 * @return {Object} 单例对象的实例。
 * @see dorado.util.Common.getSingletonInstance
 */
window.$singleton = function(factory) {
	return dorado.util.Common.getSingletonInstance(factory);
};


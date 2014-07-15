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
 * @namespace dorado的根命名空间。
 */
var dorado = {
	id: '_' + parseInt(Math.random() * Math.pow(10, 8)),

	_ID_SEED: 0,
	_TIMESTAMP_SEED: 0,

	_GET_ID: function(obj) {
		return obj._id;
	},

	_GET_NAME: function(obj) {
		return obj._name;
	},

	_NULL_FUNCTION: function() {
	},

	_UNSUPPORTED_FUNCTION: function() {
		return function() {
			throw new dorado.ResourceException("dorado.core.OperationNotSupported", dorado.getFunctionDescription(arguments.callee));
		};
	},

	/**
	 * @name dorado.Browser
	 * @class 用于获取当前浏览器信息的静态对象。
	 * @static
	 */
	Browser: (function() {
		var browser = {};
		for(var p in jQuery.browser) {
			if (jQuery.browser.hasOwnProperty(p)) browser[p] = jQuery.browser[p];
		}

		function detect(ua) {
			var os = {}, android = ua.match(/(Android)\s+([\d.]+)/), android_40 = ua.match(/(Android)\s+(4.0)/),
				ipad = ua.match(/(iPad).*OS\s([\d_]+)/), iphone = !ipad && ua.match(/(iPhone\sOS)\s([\d_]+)/), miui = ua.match(/(MiuiBrowser)\/([\d.]+)/i);

			if (android) {
				os.android = true;
				os.version = android[2];
			} else if (iphone) {
				os.ios = true;
				os.version = iphone[2].replace(/_/g, '.');
				os.iphone = true;
			} else if (ipad) {
				os.ios = true;
				os.version = ipad[2].replace(/_/g, '.');
				os.ipad = true;
			}
			if (miui) {
				os.miui = true;
			}
			if (android_40) {
				os.android_40 = true;
			}
			return os;
		}

		var ua = navigator.userAgent, os = detect(ua);
		if (os.iphone) {
			browser.isPhone = os.iphone;
		} else if (os.android) {
			var screenSize = window.screen.width;
			if (screenSize > window.screen.height) screenSize = window.screen.height;
			browser.isPhone = (screenSize / window.devicePixelRatio) < 768;
			if (os.miui) {
				browser.miui = true;
			}
		}

		browser.android = os.android;
		browser.android_40 = os.android_40;
		browser.iOS = os.ios;
		browser.osVersion = os.version;

		browser.isTouch = (browser.android || browser.iOS) && !!("ontouchstart" in window || (window["$setting"] && $setting["common.simulateTouch"]));
		browser.version = parseInt(browser.version);
		return browser;
	})(),

	/**
	 * @name dorado.Browser.version
	 * @property
	 * @type Number
	 * @description 返回浏览器的版本号。
	 */
	/**
	 * @name dorado.Browser.safari
	 * @property
	 * @type boolean
	 * @description 返回是否Safari浏览器。
	 */
	/**
	 * @name dorado.Browser.chrome
	 * @property
	 * @type boolean
	 * @description 返回是否Chrome浏览器。
	 */
	/**
	 * @name dorado.Browser.opera
	 * @property
	 * @type boolean
	 * @description 返回是否Opera浏览器。
	 */
	/**
	 * @name dorado.Browser.msie
	 * @property
	 * @type boolean
	 * @description 返回是否IE浏览器。
	 */
	/**
	 * @name dorado.Browser.mozilla
	 * @property
	 * @type boolean
	 * @description 返回是否Mozilla浏览器。
	 */
	/**
	 * @name dorado.Browser.webkit
	 * @property
	 * @type boolean
	 * @description 返回是否Webkit浏览器。
	 */
	/**
	 * @name dorado.Browser.isTouch
	 * @property
	 * @type boolean
	 * @description 返回是否手持设备中的浏览器。
	 */
	// =====

	/**
	 * 注册一个在Dorado将要初始化之前触发的监听器。
	 * @param {Function} listener 监听器。
	 */
	beforeInit: function(listener) {
		if (this.beforeInitFired) {
			throw new dorado.Exception("'beforeInit' already fired.");
		}

		if (!this.beforeInitListeners) {
			this.beforeInitListeners = [];
		}
		this.beforeInitListeners.push(listener);
	},

	fireBeforeInit: function() {
		if (this.beforeInitListeners) {
			this.beforeInitListeners.each(function(listener) {
				return listener.call(dorado);
			});
			delete this.beforeInitListeners;
		}
		this.beforeInitFired = true;
	},

	/**
	 * 注册一个在Dorado初始化之后触发的监听器。
	 * @param {Function} listener 监听器。
	 */
	onInit: function(listener) {
		if (this.onInitFired) {
			throw new dorado.Exception("'onInit' already fired.");
		}

		if (!this.onInitListeners) {
			this.onInitListeners = [];
		}
		this.onInitListeners.push(listener);
	},

	fireOnInit: function() {
		if (this.onInitListeners) {
			this.onInitListeners.each(function(listener) {
				return listener.call(dorado);
			});
			delete this.onInitListeners;
		}
		this.onInitFired = true;
	},

	afterInit: function(listener) {
		if (this.afterInitFired) {
			throw new dorado.Exception("'afterInit' already fired.");
		}

		if (!this.afterInitListeners) {
			this.afterInitListeners = [];
		}
		this.afterInitListeners.push(listener);
	},

	fireAfterInit: function() {
		if (this.afterInitListeners) {
			this.afterInitListeners.each(function(listener) {
				return listener.call(dorado);
			});
			delete this.afterInitListeners;
		}
		this.afterInitFired = true;
	},

	defaultToString: function(obj) {
		var s = obj.constructor.className || "[Object]";
		if (obj.id) s += (" id=" + obj.id);
		if (obj.name) s += (" name=" + obj.name);
	},

	/**
	 * 返回一个方法的描述信息。
	 * @param {Function} fn 要描述的方法。
	 * @return {String} 方法的描述信息。
	 */
	getFunctionDescription: function(fn) {
		var defintion = fn.toString().split('\n')[0], name;
		if (fn.methodName) {
			var className;
			if (fn.declaringClass) className = fn.declaringClass.className;
			name = (className ? (className + '.') : "function ") +
				fn.methodName;
		}
		else {
			var regexpResult = defintion.match(/^function (\w*)/);
			name = "function " + (regexpResult && regexpResult[1] || "anonymous");
		}

		var regexpResult = defintion.match(/\((.*)\)/);
		return name + (regexpResult && regexpResult[0]);
	},

	/**
	 * 返回一个方法名称\参数信息。
	 * @param {Function} fn 要描述的方法。
	 * @return {Object} 方法的名称\参数信息。
	 */
	getFunctionInfo: function(fn) {
		var defintion = fn.toString().substring(8), len = defintion.length, name = "", signature = "";
		var inSignatrue = false;
		for(var i = 0; i < len; i++) {
			var c = defintion.charAt(i);
			if (c === ' ' || c === '\t' || c === '\n' || c === '\r') {
				continue;
			}
			else if (c === '(') {
				inSignatrue = true;
			}
			else if (c === ')') {
				break;
			}
			else if (inSignatrue) {
				signature += c;
			}
			else {
				name += c;
			}
		}
		return {
			name: name,
			signature: signature
		};
	}
};

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @class dorado核心类，其中包含了若干最常用的工具方法。
 * @static
 */
dorado.Core = {

	/**
	 * 返回dorado的版本号。
	 * @type String
	 */
	VERSION: "%version%",

	/**
	 * 生成一个新的id。
	 * @return {String} 新生成的id。
	 */
	newId: function() {
		return "_uid_" + (++dorado._ID_SEED);
	},

	/**
	 * 生成新的时间戳。<br>
	 * 此处的时间戳事实上只是一个自动递增的整数，并不代表当前的时间。
	 * @return {int} 新时间戳。
	 */
	getTimestamp: function() {
		return ++dorado._TIMESTAMP_SEED;
	},

	/**
	 * 为一个函数指定其调用时的scope，即指定该函数在调用时this对象的指向。
	 * @param {Object} scope 调用时this对象。
	 * @param {Function|String} fn 要处理的函数或文本形式表示的代码片段。
	 * @return {Function} 代理函数。
	 *
	 * @see $scopify
	 *
	 * @example
	 * var s = "hello!";
	 * dorado.Core.scopify(s, "alert(this)")(); // should say "hello!";
	 *
	 * @example
	 * var s = "hello!";
	 * dorado.Core.scopify(s, function(){
	 *	 alert(this);
	 * })(); // should say "hello"
	 */
	scopify: function(scope, fn) {
		if (typeof fn == "function") {
			return function() {
				return fn.apply(scope, arguments);
			};
		}
		else {
			return function() {
				return eval("(function(){return(" + fn + ")}).call(scope)");
			};
		}
	},

	/**
	 * 设定一个延时任务，同时指定该延时任务在调用时的scope。 该方法的功能类似于window.setTimeout。
	 * @param {Object} scope 调用时this对象。
	 * @param {Function|String} fn 要处理的函数或文本形式表示的代码片段。
	 * @param {int} timeMillis 延时的时长（毫秒数）。
	 * @return {int} 延时任务的id。
	 *
	 * @see dorado.Core.scopify
	 * @see $setInterval
	 *
	 * @example
	 * // should say "hello!" after one second.
	 * var s = "hello!";
	 * dorado.Core.setTimeout(s, function() {
	 *	 alert(this);
	 * }, 1000);
	 */
	setTimeout: function(scope, fn, timeMillis) {
		if (dorado.Browser.mozilla && dorado.Browser.version >= 8) {
			// FF8莫名其妙的向setTimeout、setInterval的闭包函数中传入timerID
			return window.setTimeout(function() {
				(dorado.Core.scopify(scope, fn))();
			}, timeMillis);
		}
		else {
			return setTimeout(dorado.Core.scopify(scope, fn), timeMillis);
		}
	},

	/**
	 * 设定一个定时任务，同时指定该定时任务在调用时的scope。 该方法的功能类似于window.setInterval。
	 * @param {Object} scope 调用时this对象。
	 * @param {Function|String} fn 要处理的函数或文本形式表示的代码片段。
	 * @param {int} timeMillis 定时任务的间隔（毫秒数）。
	 * @return {int} 定时任务的id。
	 *
	 * @see dorado.Core.scopify
	 * @see $setInterval
	 */
	setInterval: function(scope, fn, timeMillis) {
		if (dorado.Browser.mozilla && dorado.Browser.version >= 8) {
			// FF8莫名其妙的向setTimeout、setInterval的闭包函数中传入timerID
			return setInterval(function() {
				(dorado.Core.scopify(scope, fn))();
			}, timeMillis);
		}
		else {
			return setInterval(dorado.Core.scopify(scope, fn), timeMillis);
		}
	},

	/**
	 * 克隆一个对象。
	 * <p>
	 * 如果被克隆的对象本身支持clone()方法，那么此处将直接使用该对象自身的clone()来完成克隆。
	 * 否则会使用默认的规则，按照类似属性反射的方式对对象进行浅克隆。
	 * </p>
	 * @param {Object} obj 将被克隆的对象。
	 * @param {boolean} [deep] 是否执行深度克隆。
	 * @return {Object} 对象的克隆。
	 */
	clone: function(obj, deep) {

		function doClone(obj, deep) {
			if (obj == null || typeof(obj) != "object") return obj;
			if (typeof obj.clone == "function") {
				return obj.clone(deep);
			}
			if (obj instanceof Date) {
				return new Date(obj.getTime());
			}
			else {
				var constr = obj.constructor;
				var cloned = new constr();
				for(var attr in obj) {
					if (cloned[attr] === undefined) {
						var v = obj[attr];
						if (deep) v = doClone(v, deep);
						cloned[attr] = v;
					}
				}
				return cloned;
			}
		}

		return doClone(obj, deep);
	}
};

(function() {

	/**
	 * @name $create
	 * @function
	 * @description document.createElement()方法的快捷方式。
	 * @param {String} tagName 要创建的DOM元素的标签名。
	 * @return {HTMLElement} 新创建的DOM元素。
	 *
	 * @example
	 * var div = $create("DIV"); // 相当于document.createElement("DIV")
	 */
	window.$create = (dorado.Browser.msie && dorado.Browser.version < 9) ? document.createElement : function(arg) {
		return document.createElement(arg);
	};

	/**
	 * @name $scopify
	 * @function
	 * @description dorado.Core.scopify()方法的快捷方式。
	 * @param {Object} scope 调用时this对象。
	 * @param {Function|String} fn 要处理的函数或文本形式表示的代码片段。
	 * @return {Function} 代理函数。
	 *
	 * @see dorado.Core.scopify
	 *
	 * @example
	 * var s = "hello!";
	 * $scopify(s, "alert(this)")(); // should say "hello!"
	 *
	 * @example
	 * var s = "hello!";
	 * $scopify(s, function(){
	 *	 alert(this);
	 * })(); // should say "hello!"
	 */
	window.$scopify = dorado.Core.scopify;

	/**
	 * @name $setTimeout
	 * @function
	 * @description dorado.Core.setTimeout()方法的快捷方式。
	 * @param {Object} scope 调用时this对象。
	 * @param {Function|String} fn 要处理的函数或文本形式表示的代码片段。
	 * @param {int} timeMillis 延时的时长（毫秒数）。
	 * @return {int} 延时任务的id。
	 *
	 * @see dorado.Core.setTimeout
	 *
	 * @example
	 * // should say "hello!" after one second.
	 * var s = "hello!";
	 * $setTimeout(s, function() {
	 *	 alert(this);
	 * }, 1000);
	 */
	window.$setTimeout = dorado.Core.setTimeout;

	/**
	 * @name $setInterval
	 * @function
	 * @description dorado.Core.setInterval()方法的快捷方式。
	 * @param {Object} scope 调用时this对象。
	 * @param {Function|String} fn 要处理的函数或文本形式表示的代码片段。
	 * @param {int} timeMillis 定时任务的间隔（毫秒数）。
	 * @return {int} 定时任务的id。
	 *
	 * @see dorado.Core.setInterval
	 */
	window.$setInterval = dorado.Core.setInterval;

})();

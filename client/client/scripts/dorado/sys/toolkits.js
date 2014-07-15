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
 * @class 工具方法集。
 * @static
 */
dorado.Toolkits = {
	typesRegistry: {},
	typeTranslators: {},

	/**
	 * 向系统中注册一个类型的简写名。
	 * <p>
	 * 此注册的目的是为了将一种对象类型跟一个简写名关联起来，简化创建对象的操作。<br>
	 * 例如用户可以直接通过JSON对象中的$type属性指定该JSON对象最终应被实例化成哪种类型的实例。
	 * 见{@link dorado.Toolkits.createInstance}。
	 * </p>
	 * <p>
	 * dorado并不要求所有支持此种简化创建过程的类型都必须通过此方法注册到系统中。
	 * 事实上，对于大多数的类而言系统都支持根据一定的规则自动确定其类型简写名。
	 * 具体的缩写规则由各处的处理代码自行决定，例如{@link dorado.widget.Container#attribute:children}。
	 * </p>
	 * @param {String} namespace 命名空间。
	 * @param {String|Object} name 类型名简写。此参数支持下列两种定义方式：
	 * <ul>
	 * <li>传入一个String代表类型名简写。</li>
	 * <li>传入一个JSON对象表示要一次性的注册一组类型。
	 * 此时系统将忽略type参数，并将此JSON对象中的属性名认作类型名简写，属性值认作要注册的对象类型。</li>
	 * </ul>
	 * @param {Prototype} constr 对象的构造函数。
	 * @see dorado.Toolkits.createInstance
	 */
	registerPrototype: function(namespace, name, constr) {

		function register(namespace, name, constr) {
			this.typesRegistry[namespace + '.' + name] = constr;
		}

		if (typeof name == "object") {
			for(var p in name) {
				if (name.hasOwnProperty(p)) register.call(this, namespace, p, name[p]);
			}
		}
		else {
			register.call(this, namespace, name, constr);
		}
	},

	registerTypeTranslator: function(namespace, typeTranslator) {
		this.typeTranslators[namespace] = typeTranslator;
	},

	/**
	 * 根据传入的类型简写名返回匹配的对象的构造函数。
	 * @param {String} namespace 命名空间。
	 * 此处可以定义多个命名空间，以","隔开，表示依次在这些命名空间寻找注册的类型。
	 * @param {String|Object} name 类型名简写。
	 * @return {Prototype} 对象的构造函数。
	 */
	getPrototype: function(namespace, name) {
		var ns = namespace.split(",");
		for(var i = 0; i < ns.length; i++) {
			var n = ns[i], constr = this.typesRegistry[n + '.' + (name || "Default")];
			if (!constr) {
				var typeTranslator = this.typeTranslators[n];
				if (typeTranslator && typeof typeTranslator == "function") {
					constr = typeTranslator(name);
				}
			}
			if (constr) return constr;
		}
	},

	/**
	 * 此方法用于根据JSON配置对象中的$type属性指定的对象类型来实例化一个新的对象。
	 * <p>
	 * 在具体的执行过程中首先根据{$link dorado.Toolkits.registerPrototype}注册的简写名来识别$type。<br>
	 * 如果上面的步骤未能找到匹配项，则开始根据typeTranslator中定义的规则继续尝试识别$type。<br>
	 * 如果通过typeTranslator中定义的规则仍未能找到匹配项，那么此方法会将$type当作对象类型的全名进行识别。
	 * </p>
	 * @param {String} namespace 命名空间。
	 * 此处可以定义多个命名空间，以","隔开，表示依次在这些命名空间寻找注册的类型。
	 * @param {Object|String} config JSON配置对象。
	 * <ul>
	 * <li>当参数类型为Object时表示JSON配置对象。</li>
	 * <li>当参数类型为String时表示$type的值。</li>
	 * <li></li>
	 * </ul>
	 * @param {Function|String} [typeTranslator] 此参数有两种定义形式：
	 * <ul>
	 * <li>当参数类型为Function时表示用于将$type的值转换为具体对象类型的回调函数。</li>
	 * <li>当参数类型为String时表示对象类型名的前缀。在运行时附加到$type属性之前形成完整的对象名称。</li>
	 * <li></li>
	 * </ul>
	 * 对象类型名的前缀。在运行时附加到$type属性之前形成完整的对象名称。
	 * @return {Object} 创建得到的新对象。
	 * @see dorado.Toolkits.registerPrototype
	 *
	 * @example
	 * // 根据JSON配置创建一个Button对象。
	 * var button = dorado.Toolkits.createInstance("widget", {
	 * 	$type: "dorado.widget.Button",
	 * 	id: "button1",
	 * 	caption: "TestButton"
	 * });
	 *
	 * @example
	 * // 利用typeTranslator参数，简化$type属性中的定义。
	 * var button = dorado.Toolkits.createInstance("widget", {
	 * 	$type: "Button",
	 * 	id: "button1",
	 * 	caption: "TestButton"
	 * }, function(type) {
	 * 	switch (type) {
	 * 		case "Panel": return dorado.widget.Panel;
	 * 		case "Button": return dorado.widget.Button;
	 * 		case "Input": return dorado.widget.TextEditor;
	 * 		default: return dorado.widget.Control;
	 * 	}
	 * });
	 *
	 * @example
	 * // 利用typeTranslator参数，简化$type属性中的定义。
	 * var button = dorado.Toolkits.createInstance("widget", {
	 * 	$type: "Button",
	 * 	id: "button1",
	 * 	caption: "TestButton"
	 * }, "dorado.widget.");
	 *
	 * @example
	 * // 直接传入一个String作为$type的值。
	 * var button = dorado.Toolkits.createInstance("widget", "Button");
	 */
	createInstance: function(namespace, config, typeTranslator) {
		var type;
		if (typeof config == "string") {
			type = config;
			config = null;
		}
		else {
			type = config ? config.$type : undefined;
		}

		var constr = this.getPrototype(namespace, type);
		if (!constr) {
			if (typeTranslator && typeTranslator.constructor == String) {
				type = typeTranslator;
			}
			if (!constr) {
				if (typeTranslator && typeof typeTranslator == "function") {
					constr = typeTranslator(type);
				}
				if (!constr) {
					if (type) {
						constr = dorado.util.Common.getClassType(type);
					}
					else {
						throw new dorado.ResourceException("dorado.core.TypeUndefined");
					}
				}
			}

			if (constr && type) {
				this.registerPrototype(namespace, type, constr);
			}
		}
		if (!constr) {
			throw new dorado.ResourceException("dorado.core.UnknownType", type);
		}
		return new constr(config);
	},

	setDelayedAction: function(owner, actionId, fn, timeMillis) {
		actionId = actionId || dorado.Core.newId();
		this.cancelDelayedAction(owner, actionId);
		owner[actionId] = $setTimeout(owner, fn, timeMillis);
	},

	cancelDelayedAction: function(owner, actionId) {
		if (owner[actionId]) {
			clearTimeout(owner[actionId]);
			owner[actionId] = undefined;
			return true;
		}
		return false;
	},

	STATE_CODE: {
		info: 0,
		ok: 1,
		warn: 2,
		error: 3,
		validating: 99
	},

	getTopMessage: function(messages) {
		if (!messages) return null;
		var topMessage = null, topStateCode = -1;
		for(var i = 0; i < messages.length; i++) {
			var message = messages[i];
			var code = this.STATE_CODE[message.state];
			if (code > topStateCode) {
				topStateCode = code;
				topMessage = message;
			}
		}
		return topMessage;
	},

	getTopMessageState: function(messages) {
		if (!messages) return null;
		var topMessage = this.getTopMessage(messages);
		return topMessage ? topMessage.state : null;
	},

	trimSingleMessage: function(message, defaultState) {
		if (!message) return null;
		if (typeof message == "string") {
			message = {
				state: defaultState,
				text: message
			};
		}
		else {
			message.state = message.state || defaultState;
		}
		return message;
	},

	trimMessages: function(message, defaultState) {
		if (!message) return null;
		var result;
		if (message instanceof Array) {
			var array = [];
			for(var i = 0; i < message.length; i++) {
				var m = this.trimSingleMessage(message[i], defaultState);
				if (!m) continue;
				array.push(m);
			}
			result = (array.length) ? array : null;
		}
		else {
			result = [this.trimSingleMessage(message, defaultState)];
		}
		return result;
	}
};

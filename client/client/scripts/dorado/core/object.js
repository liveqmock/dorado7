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

(function () {

	var CLASS_REPOSITORY = {};
	var UNNAMED_CLASS = "#UnnamedClass";

	function newClassName(prefix) {
		var i = 1;
		while (CLASS_REPOSITORY[prefix + i])
			i++;
		return prefix + i;
	}

	function adapterFunction(fn) {
		var adapter = function () {
			return fn.apply(this, arguments);
		};
		adapter._doradoAdapter = true;
		return adapter;
	}

	function cloneDefintions(defs) {
		var newDefs = {};
		for (var p in defs) {
			if (defs.hasOwnProperty(p)) {
				newDefs[p] = dorado.Object.apply({}, defs[p]);
			}
		}
		return newDefs;
	}

	function overrideDefintions(subClass, defProp, defs, overwrite) {
		if (!defs) return;
		var sdefs = subClass.prototype[defProp];
		if (!sdefs) {
			subClass.prototype[defProp] = cloneDefintions(defs);
		} else {
			for (var p in defs) {
				if (defs.hasOwnProperty(p)) {
					var odef = defs[p];
					if (odef === undefined) return;
					var cdef = sdefs[p];
					if (cdef === undefined) sdefs[p] = cdef = {};
					for (var m in odef) {
						if (odef.hasOwnProperty(m) && (overwrite || cdef[m] === undefined)) {
							var odefv = odef[m];
							if (typeof odefv == "function") {
								// if (odefv.declaringClass) odefv = adapterFunction(odefv);
								if (!odefv.declaringClass) {
									odefv.declaringClass = subClass;
									odefv.methodName = m;
									odefv.definitionType = defProp;
									odefv.definitionName = p;
								}
							}
							cdef[m] = odefv;
						}
					}
				}
			}
		}
	}

	function override(subClass, overrides, overwrite) {
		if (!overrides) return;
		if (overwrite === undefined) overwrite = true;

		var subp = subClass.prototype;
		for (var p in overrides) {
			var override = overrides[p];
			if (p == "ATTRIBUTES" || p == "EVENTS") {
				overrideDefintions(subClass, p, override, overwrite);
				continue;
			}
			/*
			 // for debug
			 if (!overwrite && subp[p] !== undefined && overrides[p] !== undefined && subp[p] != overrides[p]) {
			 window._skipedOverWriting = (window._skipedOverWriting || 0) + 1;
			 if (window._skipedOverWriting < 10) alert(subClass.className + ",  " + p + ",  " + overrides.constructor.className + "\n=============\n" + subp[p] + "\n=============\n" + overrides[p]);
			 }
			 */
			if (subp[p] === undefined || overwrite) {
				if (typeof override == "function") {
					// if (override.declaringClass) override = adapterFunction(override);
					if (!override.declaringClass) {
						override.declaringClass = subClass;
						override.methodName = p;
					}
				}
				subp[p] = override;
			}
		}
	};

	/**
	 * @author Benny Bao (mailto:benny.bao@bstek.com)
	 * @class 用于封装一些对象操作的类。
	 * @static
	 */
	dorado.Object = {

		/**
		 * 创建一个命名空间。
		 * @param {String} name 命名空间的名称。例如"dorado.sample"。
		 * @see $namespace
		 *
		 * @example
		 * // 创建新的名为"dorado.sample"的命名空间。
		 * dorado.Object.createNamespace("dorado.sample");
		 *
		 * // 使用新创建的命名空间。
		 * dorado.sample.MyClass = function() {
		 * };
		 */
		createNamespace: function (name) {
			var names = name.split('.');
			var parent = window;
			for (var i = 0; i < names.length; i++) {
				var n = names[i];
				var p = parent[n];
				if (p === undefined) {
					parent[n] = p = {};
				}
				parent = p;
			}
			return parent;
		},

		/**
		 * 创建并返回一个新的类。
		 * @param {Object} p 新类的prototype。 在该参数的子属性中有下列几个需特别注意：
		 * <ul>
		 * <li>constructor - 其中新类的构造方法可利用此属性来定义。</li>
		 * <li>$className - 类的名称。该名称并不会对类的执行逻辑造成影响，但是定义一个有效的名称对于JavaScript的调试将有很重要的意义。 </li>
		 * </ul>
		 * @return {Object} 新的类。
		 * @see $class
		 *
		 * @example
		 * var MyClass = dorado.Object.createClass( {
		 * 	$className : "MyClass",
		 *
		 * 	// 构造方法
		 * 	constructor : function(message) {
		 * 		this.message = message;
		 * 	},
		 * 	getMessage : function() {
		 * 		return this.message;
		 * 	}
		 * });
		 * var foo = new Foo("Hello world!");
		 * alert(foo.getMessage()); // should say "Hello world!"
		 */
		createClass: function (p) {
			var constr = p.constructor;
			if (constr === Object) constr = new Function();
			constr.className = p.$className || newClassName(UNNAMED_CLASS);
			delete p.$className;

			for (var m in p) {
				if (p.hasOwnProperty(m)) {
					var v = p[m];
					if (typeof v == "function") {
						// if (v.declaringClass) p[m] = v = adapterFunction(v);
						if (!v.declaringClass) {
							v.declaringClass = constr;
							v.methodName = m;
						}
					}
				}
			}

			constr.prototype = p;
			CLASS_REPOSITORY[constr.className] = constr;
			return constr;
		},

		/**
		 * 将一个类或对象中的所有属性和方法改写到另一个类中。
		 * @function
		 * @param {Object} subClass 被改写的类。
		 * @param {Object} overrides 包含要改写的属性和方法的类或对象。
		 * @param {boolean} [overwrite=true] 是否允许覆盖subClass中已存在的同名属性或方法。默认为不允许覆盖。
		 */
		override: override,

		/**
		 * 从指定的父类派生出一个新的子类。
		 * <p>
		 * 通过此方法继承出的子类具有以下的扩展属性：
		 * <ul>
		 * <li>superClass - {Prototype} 第一个父类。</li>
		 * <li>superClasses - {Prototype[]} 所有父类的数组。</li>
		 * </ul>
		 * 上述属性的具体用法请参见示例。
		 * </p>
		 * @function
		 * @param {Prototype|Prototype[]} superClass 父类或父类的数组。
		 * 如果此处定义了多个父类，那么dorado将以数组中的第一个父类作为主要的父类，新类的superClass属性将指向第一个父类。
		 * 而其他父类中属性和方法将被继承到新类中，且后面父类中的方法和属性不会覆盖前面的同名方法或属性。
		 * @param {Object} [overrides] 包含一些属性和方法的类或对象，这些属性和方法将被改写进新生成的子类。 在该参数的子属性中有下列几个需特别注意：
		 * <ul>
		 * <li>constructor - 其中新类的构造方法可利用此属性来定义。</li>
		 * <li>$className -
		 * 类的名称。该名称并不会对类的执行逻辑造成影响，但是定义一个有效的名称对于JavaScript的调试将有很重要的意义。 </li>
		 * </ul>
		 * @return {Prototype} 新的子类。
		 *
		 * @see $extend
		 *
		 * @example
		 * // 从SuperClass派生并得到MyClass。
		 * var MyClass = dorado.Object.extend(SuperClass, {
		 * 	$className : "MyClass",
		 * 	//constructor是一个特殊的方法用于声明子类的构造方法。
		 * 	constructor : function() {
		 * 		//调用父类的构造方法。
		 * 		SubClass.superClass.constructor.call(this, arguments);
		 * 		this.children = [];
		 * },
		 *
		 * // 这是一个子类自有的方法。
		 * 	getChildren : function() {
		 * 		return this.children;
		 * 	}
		 * });
		 */
		extend: (function () {
			var oc = Object.prototype.constructor;
			return function (superClass, overrides) {
				var sc, scs;
				if (superClass instanceof Array) {
					scs = superClass;
					sc = superClass[0];
				} else {
					sc = superClass;
				}

				var subClass = (overrides && overrides.constructor != oc) ? overrides.constructor : function () {
					sc.apply(this, arguments);
				};

				var fn = new Function();
				var sp = fn.prototype = sc.prototype;

				// 当某超类不是通过dorado的方法声明的时，确保其能够符合dorado的基本规范。
				if (!sc.className) {
					sp.constructor = sc;
					sc.className = newClassName(UNNAMED_CLASS);
					sc.declaringClass = sp;
					sc.methodName = "constructor";
				}

				var subp = subClass.prototype = new fn();
				subp.constructor = subClass;
				subClass.className = overrides.$className || newClassName((sc.$className || UNNAMED_CLASS) + '$');
				subClass.superClass = sc;
				subClass.declaringClass = subClass;
				subClass.methodName = "constructor";

				delete overrides.$className;
				delete overrides.constructor;

				// process attributes, dirty code
				var attrs = subp["ATTRIBUTES"];
				if (attrs) {
					subp["ATTRIBUTES"] = cloneDefintions(attrs);
				}

				// process avents, dirty code
				var events = subp["EVENTS"];
				if (events) {
					subp["EVENTS"] = cloneDefintions(events);
				}

				var ps = [sc];
				if (scs) {
					for (var i = 1, p; i < scs.length; i++) {
						p = scs[i].prototype;
						override(subClass, p, false);
						ps.push(scs[i]);
					}
				}
				subClass.superClasses = ps;

				override(subClass, overrides, true);

				CLASS_REPOSITORY[subClass.className] = subClass;
				return subClass;
			};
		})(),

		/**
		 * 迭代给定对象的每一个属性。
		 * @param {Object} object 要迭代的对象。
		 * @param {Function} fn 用于监听每一个属性的迭代方法。<br>
		 * 该方法具有下列两个参数：
		 * <ul>
		 * <li>p - {String} 当前迭代的属性名。</li>
		 * <li>v - {Object} 当前迭代的属性值。 </li>
		 * </ul>
		 * 该方法中的this对象即为被迭代的对象。
		 */
		eachProperty: function (object, fn) {
			if (object && fn) {
				for (var p in object)
					fn.call(object, p, object[p]);
			}
		},

		/**
		 * 将源对象中所有的属性复制（覆盖）到目标对象中。
		 * @param {Object} target 目标对象。
		 * @param {Object} source 源对象。
		 * @param {boolean|Function} [options] 选项。
		 * 此参数具有如下两种定义方式：
		 * <ul>
		 * <li>此值的类型是逻辑值时，表示是否覆盖目标对象中原有的属性值。
		 * 如果设置此参数为false，那么只有当目标对象原有的属性值未定义或值为undefined时，才将源对象中的属性值写入目标对象。
		 * 如果不定义此选项则系统默认按照覆盖方式处理。</li>
		 * <li>此值的类型是Function时，表示用于监听每一个属性的赋值动作的拦截方法。</li>
		 * </ul>
		 * @return {Object} 返回目标对象。
		 *
		 * @example
		 * // p, v参数即当前正在处理的属性名和属性值。
		 * function listener(p, v) {
		 * 	if (p == "prop2") {
		 * 		this[p] = v * 2; // this即apply方法的target参数对象。
		 * 		return false; // 返回false表示通知apply方法跳过对此属性的后续处理。
		 * 	}
		 * 	else if (p == "prop3") {
		 * 		return false; // 返回false表示通知apply方法跳过对此属性的后续处理。
		 * 	}
		 * }
		 *
		 * var target = {};
		 * var source = {
		 * 	prop1 : 100,
		 * 	prop2 : 200,
		 * 	prop3 : 300
		 * };
		 * dorado.Object.apply(target, source, listener);
		 * //此时，target应为 { prop1: 100, prop2: 400 }
		 */
		apply: function (target, source, options) {
			if (source) {
				for (var p in source) {
					if (typeof options == "function" && options.call(target, p, source[p]) === false) continue;
					if (options === false && target[p] !== undefined) continue;
					target[p] = source[p];
				}
			}
			return target;
		},

		/**
		 * 判断一个对象实例是否某类或接口的实例。
		 * <p>
		 * 提供此方法的原因是因为dorado的对象集成机制是支持多重继承的，
		 * 而Javascript中原生的instanceof操作符只能支持对多重继承中第一个超类型的判断。
		 * 因此，当我们需要判断多重继承中的后几个超类型时，必须使用此方法。<br>
		 * 需要注意的是instanceof操作符的运行效率远高于此方法。
		 * </p>
		 * @param {Object} object 要判断的对象实例。
		 * @param {Function} type 类或接口。注意：此处传入的超类或接口必须是通过dorado定义的。
		 * @return {boolean} 是否是给定类或接口的实例。
		 */
		isInstanceOf: function (object, type) {
			function hasSuperClass(superClasses) {
				if (!superClasses) return false;
				if (superClasses.indexOf(type) >= 0) return true;
				for (var i = 0; i < superClasses.length; i++) {
					if (hasSuperClass(superClasses[i].superClasses)) return true;
				}
				return false;
			}

			if (!object) return false;
			var b = false;
			if (type.className) b = object instanceof type;
			if (!b) {
				var t = object.constructor;
				if (t) b = hasSuperClass(t.superClasses);
			}
			return b;
		},

		/**
		 * 对一个对象进行浅度克隆。
		 * @param {Object} object 要克隆的对象。
		 * @param {Object} [options] 执行选项。
		 * @param {Function} [options.onCreate] 用于创建克隆对象的回调函数。
		 * @param {Function} [options.onCopyProperty] 用于拦截每一个属性复制的回调函数。
		 * @return {Object} 新的克隆对象。
		 */
		clone: function (object, options) {
			if (typeof object == "object") {
				var objClone, options = options || {};
				if (options.onCreate) objClone = new options.onCreate(object);
				else objClone = new object.constructor();
				for (var p in object) {
					if (!options.onCopyProperty || options.onCopyProperty(p, object, objClone)) {
						objClone[p] = object[p];
					}
				}
				objClone.toString = object.toString;
				objClone.valueOf = object.valueOf;
				return objClone;
			} else {
				return object;
			}
		},

		hashCode: function (object) {
			if (object == null) return 0;

			var strKey = (typeof object) + '|' + dorado.JSON.stringify(object), hash = 0;
			for (i = 0; i < strKey.length; i++) {
				var c = strKey.charCodeAt(i);
				hash = ((hash << 5) - hash) + c;
				hash = hash & hash; // Convert to 32bit integer
			}
			return hash;
		}

	};

	/**
	 * @name $namespace
	 * @function
	 * @description dorado.Object.createNamespace()方法的快捷方式。
	 * 详细用法请参考dorado.Object.createNamespace()的说明。
	 * @see dorado.Object.createNamespace
	 *
	 * @example
	 * // 创建新的名为"dorado.sample"的命名空间。
	 * $namespace("dorado.sample");
	 *
	 * // 使用新创建的命名空间。
	 * dorado.sample.MyClass = function() {
	 * };
	 */
	window.$namespace = dorado.Object.createNamespace;

	/**
	 * @name $class
	 * @function
	 * @description dorado.Object.createClass()方法的快捷方式。
	 * 详细用法请参考dorado.Object.createClass()的说明。
	 * @see dorado.Object.createClass
	 *
	 * @example
	 * var MyClass = $class("MyClass"， {
	 * 		// 构造方法
	 * 		constructor: function(message) {
	 * 			this.message = message;
	 * 		},
	 * 		getMessage: function() {
	 * 			return this.message;
	 * 		}
	 * 	});
	 * var foo = new Foo("Hello world!");
	 * alert(foo.getMessage());    // should say "Hello world!";
	 */
	window.$class = dorado.Object.createClass;

	/**
	 * @name $extend
	 * @function
	 * @description dorado.Object.extend()方法的快捷方式。
	 * 详细用法请参考dorado.Object.extend()的说明。
	 * @see dorado.Object.extend
	 *
	 * @example
	 * // 从SuperClass派生并得到MyClass。
	 * var MyClass = $extend("MyClass", SuperClass, {
	 * 	// constructor是一个特殊的方法用于声明子类的构造方法。
	 * 	constructor : function() {
	 * 		// 调用父类的构造方法。
	 * 		SubClass.superClass.constructor.call(this, arguments);
	 * 		this.children = [];
	 * 	},
	 *
	 * 	// 这是一个子类自有的方法。
	 * 	getChildren : function() {
	 * 		return this.children;
	 * 	}
	 * });
	 */
	window.$extend = dorado.Object.extend;

	/**
	 * @name $getSuperClass
	 * @function
	 * @description 返回当前对象的超类。对于多重继承而言，此方法返回第一个超类。
	 * <p>
	 * 注意：此方法的调用必须放在类方法内部才有效。
	 * </p>
	 * @return {Function} 超类。
	 */
	var getSuperClass = window.$getSuperClass = function () {
		var fn = getSuperClass.caller, superClass;
		if (fn.declaringClass) superClass = fn.declaringClass.superClass;
		return superClass || {};
	};

	/**
	 * @name $getSuperClasses
	 * @function
	 * @description 返回当前对象的超类的数组。
	 * <p>
	 * 注意：此方法的调用必须放在类方法内部才有效。
	 * </p>
	 * @return {Prototype[]} 超类的数组。
	 */
	var getSuperClasses = window.$getSuperClasses = function () {
		var fn = getSuperClasses.caller, superClass;
		if (dorado.Browser.opera && dorado.Browser.version < 10) fn = fn.caller;
		if (fn.caller && fn.caller._doradoAdapter) fn = fn.caller;

		if (fn.declaringClass) superClasses = fn.declaringClass.superClasses;
		return superClasses || [];
	};

	/**
	 * @name $invokeSuper
	 * @function
	 * @description 调用当前方法在超类中的实现逻辑。
	 * <p>
	 * 注意此方法的调用必须放在类方法内部才有效。<br>
	 * 另外，此方法必须通过call语法进行调用，见示例。
	 * </p>
	 * @param {Object} scope 调用超类方法时的宿主对象。一般应直接传入this。
	 * @param {Object[]} [args] 调用超类方法时的参数数组。很多情况下我们可以直接传入arguments。
	 *
	 * @example
	 * $invokeSuper.call(this, arguments); // 较简单的调用方式
	 * $invokeSuper.call(this, [ "Sample Arg", true ]); // 自定义传给超类方法的参数数组
	 */
	var invokeSuper = window.$invokeSuper = function (args) {
		var fn = invokeSuper.caller;
//		if (dorado.Browser.opera && dorado.Browser.version < 10) fn = fn.caller;
		if (fn.caller && fn.caller._doradoAdapter) fn = fn.caller;

		if (fn.declaringClass) {
			var superClasses = fn.declaringClass.superClasses;
			if (!superClasses) return;

			var superClass, superFn;
			for (var i = 0; i < superClasses.length; i++) {
				superClass = superClasses[i].prototype;
				if (fn.definitionType) {
					superFn = superClass[fn.definitionType][fn.definitionName][fn.methodName];
				} else {
					superFn = superClass[fn.methodName];
				}
				if (superFn) {
					return superFn.apply(this, args || []);
				}
			}
		}
	};
	invokeSuper.methodName = "$invokeSuper";

})();

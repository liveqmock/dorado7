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

	dorado.AttributeException = $extend(dorado.ResourceException, {
		$className: "dorado.AttributeException"
	});

	/**
	 * @author Benny Bao (mailto:benny.bao@bstek.com)
	 * @class 支持get/set属性的对象的通用接口。
	 *        <p>
	 *        对于实现了此接口的子对象，用户可在其prototype的ATTRIBUTES中定义若干个属性。
	 *        然后，用后可利用此接口提供的get、set方法来读取和设置属性值。
	 *        </p>
	 *        <p>
	 *        此种对象通过一个名为ATTRIBUTES的特殊属性来声明的给类支持的属性。
	 *        声明时，每一个被声明的属性应作为ATTRIBUTES对象的一个子属性，该属性的值为一个用于描述属性的JSON对象。该JSON对象中支持下列子属性：
	 *        <ul>
	 *        <li>getter - {Function} 该属性对应的getter方法。
	 *        该方法具有一个传入参数，为属性名。方法的返回值为外界读取到的属性值。</li>
	 *        <li>setter - {Function} 该属性对应的setter方法。
	 *        该方法具有两个传入参数，依次为要设置的属性值和属性名。</li>
	 *        <li>readOnly - {boolean} 该属性是否只读。</li>
	 *        <li>writeOnly - {boolean} 该属性是否只写。</li>
	 *        <li>writeOnce - {boolean} 该属性是否只允许被写入一次。</li>
	 *        <li>defaultValue - {Object|Function} 该属性的默认值。
	 *        如果默认值是一个Function，那么系统将调用该Function，以其返回值作为属性的默认值。</li>
	 *        见:{@link dorado.AttributeSupport#getAttributeWatcher},
	 *        {@link dorado.AttributeWatcher}</li>
	 *        </ul>
	 *        </p>
	 *
	 * @abstract
	 *
	 * @example
	 * // 读写类属性。
	 * oop.set("visible", true); // 设置一个属性
	 * oop.get("visible"); // 读取一个属性
	 *
	 * @example
	 * // 声明类属性。
	 * var SampleClass = $class({
	 * 	ATTRIBUTES: {
	 * 		visible: {}, // 声明一个简单的属性
	 * 		label: { // 声明一个带有getter方法的属性
	 * 			getter: function(attr) {
	 * 				... ...
	 * 			}
	 * 		},
	 * 		status: { // 声明一个带有setter方法的只读属性
	 * 			readOnly: true,
	 * 			setter: function(value, attr) {
	 * 				... ...
	 * 			}
	 * 		}
	 * 	}
	 * });
	 */
	dorado.AttributeSupport = $class(/** @scope dorado.AttributeSupport.prototype */
		{
			$className: "dorado.AttributeSupport",

			/**
			 * 用于声明该对象中所支持的所有Attribute。<br>
			 * 此属性中的对象一般由dorado系统自动生成，且往往一个类型的所有实例都共享同一个EVENTS对象。
			 * 因此，如无特殊需要，我们不应该在运行时手动的修改此对象中的内容。
			 *
			 * @type Object
			 *
			 * @example
			 * // 获取某对象的caption属性的声明。
			 * var attributeDef = oop.ATTRIBUTES.caption。
			 * // 判断该属性是否只读
			 * if (attributeDef.readOnly) { ... ... }
			 */
			ATTRIBUTES: /** @scope dorado.AttributeSupport.prototype */
			{
				/**
				 * 对象的标签。
				 * <p>
				 * 开发人员可以为一个对象定义一到多个String型的标签，以便于后面快速的查找到一个或一批具有指定标签的对象。
				 * </p>
				 *
				 * @type String|String[]
				 * @attribute
				 * @see dorado.TagManager
				 */
				tags: {
					setter: function(tags) {
						if (typeof tags == "string") {
							tags = tags.split(',');
						}
						if (this._tags) {
							dorado.TagManager.unregister(this);
						}
						this._tags = tags;
						if (tags) {
							dorado.TagManager.register(this);
						}
					}
				}
			},

			EVENTS: /** @scope dorado.AttributeSupport.prototype */
			{

				/**
				 * 当对象中的某属性值被改变时触发的事件。
				 *
				 * @param {Object}
				 *            self 事件的发起者，即对象本身。
				 * @param {Object}
				 *            arg 事件参数。
				 * @param {String}
				 *            arg.attribute 发生改变的属性名。
				 * @param {Object}
				 *            arg.value 新的属性值。
				 * @return {boolean} 是否要继续后续事件的触发操作，不提供返回值时系统将按照返回值为true进行处理。
				 * @event
				 */
				onAttributeChange: {}
			},

			constructor: function() {
				var defs = this.ATTRIBUTES;
				for(var p in defs) {
					var def = defs[p];
					if (def && def.defaultValue != undefined && this['_' + p] == undefined) {
						var dv = def.defaultValue;
						this['_' + p] = (typeof dv == "function" && !def.dontEvalDefaultValue) ? dv() : dv;
					}
				}
			},

			/**
			 * 返回与该对象关联的属性观察者。
			 *
			 * @return {dorado.AttributeWatcher} 属性观察者。
			 */
			getAttributeWatcher: function() {
				if (!this.attributeWatcher) {
					this.attributeWatcher = new dorado.AttributeWatcher();
				}
				return this.attributeWatcher;
			},

			/**
			 * 读取指定的属性值。
			 * <p>
			 * 此方法还支持迭代式的属性读取，即通过"."来分割一组属性名，交由此方法一层层向下挖掘并返回最终结果。<br>
			 * 当进行迭代式的读取时，系统会自动判断前一个属性返回的对象是dorado.AttributeSupport的实例还是普通JSON对象，并藉此决定如何进一步执行读取操作。
			 * 如果碰到的中间对象dorado.AttributeSupport的实例，系统会自动读取它的Attribute；
			 * 如果碰到的中间对象是普通的JSON对象，系统会直接读取它的属性。
			 * </p>
			 *
			 * @param {String}
			 *            attr 属性名。
			 * @return {Object} 读取到的属性值。
			 *
			 * @example
			 * oop.get("label");
			 *
			 * @example
			 * oop.get("address.postCode"); // 迭代式的属性读取
			 * // 如果address的属性值是一个dorado.AttributeSupport的实例，那么此行命令的效果相当于oop.get("address").get("postCode")。
			 * // 如果address的属性值是一个JSON对象，那么此行命令的效果相当于oop.get("address").postCode
			 */
			get: function(attr) {
				var i = attr.indexOf('.');
				if (i > 0) {
					var result = this.doGet(attr.substring(0, i));
					if (result) {
						var subAttr = attr.substring(i + 1);
						if (typeof result.get == "function") {
							result = result.get(subAttr);
						}
						else {
							var as = subAttr.split('.');
							for(var i = 0; i < as.length; i++) {
								var a = as[i];
								result = (typeof result.get == "function") ? result.get(a) : result[a];
								if (!result) break;
							}
						}
					}
					return result;
				}
				else {
					return this.doGet(attr);
				}
			},

			doGet: function(attr) {
				var def = this.ATTRIBUTES[attr] || (this.PRIVATE_ATTRIBUTES && this.PRIVATE_ATTRIBUTES[attr]);
				if (def) {
					if (def.writeOnly) {
						throw new dorado.AttributeException(
							"dorado.core.AttributeWriteOnly", attr);
					}

					var result;
					if (def.getter) {
						result = def.getter.call(this, attr);
					}
					else if (def.path) {
						var sections = def.path.split('.'), owner = this;
						for(var i = 0; i < sections.length; i++) {
							var section = sections[i];
							if (section.charAt(0) != '_' && typeof owner.get == "function") {
								owner = owner.get(section);
							}
							else {
								owner = owner[section];
							}
							if (owner == null || i == sections.length - 1) {
								result = owner;
								break;
							}
						}
					}
					else {
						result = this['_' + attr];
					}
					return result;
				}
				else {
					throw new dorado.AttributeException("dorado.core.UnknownAttribute", attr);
				}
			},

			/**
			 * 设置属性值。
			 *
			 * @param {String|Object}
			 *            attr 此参数具有下列两种设置方式：
			 *            <ul>
			 *            <li>当attr为String时，系统会将attr的作为要设置属性名处理。属性值为value参数代表的值。</li>
			 *            <li>当attr为Object时，系统会将忽略value参数。此时，可以通过attr参数的JSON对象定义一组要设置的属性值。
			 *            注意：当通过此方式为对象设置一系列属性时，系统只会跳过那些设置出错的属性，并不会给出错误信息，也不会中断正在执行的设置操作。</li>
			 *            </ul>
			 *            <p>
			 *            如同{@link dorado.AttributeSupport#get}方法，set方法也支持对属性进行迭代式的设置。
			 *            即通过"."来分割一组属性名，交由此方法一层层向下挖掘，直到挖掘到倒数第二个子对象时停止并记录下一个子属性名，然后对该子对象的属性进行复制操作，请参考后面的例程。
			 *            </p>
			 *            <p>
			 *            set方法不但可以用于为对象的属性赋值，同时也可以用于为对象中的事件添加事件监听器。
			 *            <ul>
			 *            <li>直接以事件名称作为属性，以事件监听器作为属性值，进行赋值操作。</li>
			 *            <li>为对象listener属性赋值，具体方法请参考{@link dorado.EventSupport#attribute:listener}。</li>
			 *            </ul>
			 *            虽然上述两种方法都可以实现添加事件监听器的功能，并且第一种方法看起来更加方便易用。但第二种方法却较第一种更为灵活。
			 *            例如：当我们需要一次性的为同一个事件绑定多个监听器，第一种方法是不能胜任的；
			 *            或者我们当我们批量的设置一组属性值和事件监听器时，第二种方法总是确保事件监听器首先被绑定然后才处理该操作中剩余的属性值的赋值（在绝大多数的场景的这样的顺序是更加合理的），
			 *            而此时如果使用第一种方法，监听器和属性值的处理顺序是难以预知的。
			 *            </p>
			 * @param {Object}
			 *            [value] 此参数具有多重含义：要设置的属性值。当attr为Object时，此参数将被忽略。
			 *            <ul>
			 *            <li>当attr为String时，此参数代表要设置的属性值。</li>
			 *            <li>当attr为Object时，此参数可代表一组执行选项，见option参数的说明。</li>
			 *            </ul>
			 * @param {Object}
			 *            [options] 执行选项。此参数仅在attr参数为Object时有效。
			 * @param {boolean}
			 *            [options.skipUnknownAttribute=false] 是否忽略未知的属性。
			 * @param {boolean}
			 *            [options.tryNextOnError=false] 是否在发生错误后继续尝试后续的属性设置操作。
			 * @param {boolean}
			 *            [options.preventOverwriting=false] 是否组织本次赋值操作覆盖对象中原有的属性值。
			 *            即对于那些已拥有值(曾经通过set方法写入过值)的属性跳过本次的赋值操作，而只对那些未定义过的属性进行赋值。
			 * @return {dorado.AttributeSupport} 返回对象自身。
			 *
			 * @example
			 * oop.set("label", "Sample Text"); oop.set("visible", true);
			 *
			 * @example
			 * oop.set( { label : "Sample Text", visible : true });
			 *
			 * @example
			 * // 利用属性迭代的特性为子对象中的属性赋值。
			 * oop.set("address.postCode", "7232-00124");
			 * ... ...
			 * oop.set({
			 * 	"name" : "Toad",
			 * 	"address.postCode" : "7232-00124"
			 * });
			 * // 上面的两行命令相当于
			 * oop.get("address").set("postCode", "7232-00124")
			 *
			 * @example
			 * // 使用上文中提及的第一种方法为label属性赋值，同时为onClick事件绑定一个监听器。
			 * oop.set({
			 *  label : "Sample Text",
			 *  onClick : function(self, arg) {
			 *  	... ...
			 *  }
			 * });
			 */
			set: function(attr, value, options) {
				var skipUnknownAttribute, tryNextOnError, preventOverwriting, lockWritingTimes;
				if (attr && typeof attr == "object") options = value;
				if (options && typeof options == "object") {
					skipUnknownAttribute = options.skipUnknownAttribute;
					tryNextOnError = options.tryNextOnError;
					preventOverwriting = options.preventOverwriting;
					lockWritingTimes = options.lockWritingTimes;
				}

				if (attr.constructor != String) {
					var attrInfos = [];
					for(var p in attr) {
						if (attr.hasOwnProperty(p)) {
							var v = attr[p], attrInfo = {
								attr: p,
								value: v
							};
							if (p == "listener" || typeof v == "function") {
								attrInfos.insert(attrInfo);
							}
							else if (p == "DEFINITION") {
								if (v) {
									if (v.ATTRIBUTES) {
										if (!this.PRIVATE_ATTRIBUTES) this.PRIVATE_ATTRIBUTES = {};
										for(var defName in v.ATTRIBUTES) {
											if (v.ATTRIBUTES.hasOwnProperty(defName)) {
												var def = v.ATTRIBUTES[defName];
												overrideDefinition(this.PRIVATE_ATTRIBUTES, def, defName);
												if (def && def.defaultValue != undefined && this['_' + p] == undefined) {
													var dv = def.defaultValue;
													this['_' + p] = (typeof dv == "function" && !def.dontEvalDefaultValue) ? dv() : dv;
												}
											}
										}
									}
									if (v.EVENTS) {
										if (!this.PRIVATE_EVENTS) this.PRIVATE_EVENTS = {};
										for(var defName in v.EVENTS) {
											if (v.EVENTS.hasOwnProperty(defName)) {
												overrideDefinition(this.PRIVATE_EVENTS, v.EVENTS[defName], defName);
											}
										}
									}
								}
							}
							else {
								attrInfos.push(attrInfo);
							}
						}
					}

					if (preventOverwriting) watcher = this.getAttributeWatcher();
					for(var i = 0; i < attrInfos.length; i++) {
						var attrInfo = attrInfos[i];
						if (preventOverwriting && watcher.getWritingTimes(attrInfo.attr)) continue;

						try {
							this.doSet(attrInfo.attr, attrInfo.value, skipUnknownAttribute, lockWritingTimes);
						}
						catch(e) {
							if (!tryNextOnError) {
								throw e;
							}
							else if (e instanceof dorado.Exception) {
								dorado.Exception.removeException(e);
							}
						}
					}
				}
				else {
					if (preventOverwriting) {
						if (this.getAttributeWatcher().getWritingTimes(attr)) return;
					}

					try {
						this.doSet(attr, value, skipUnknownAttribute, lockWritingTimes);
					}
					catch(e) {
						if (!tryNextOnError) {
							throw e;
						}
						else if (e instanceof dorado.Exception) {
							dorado.Exception.removeException(e);
						}
					}
				}
				return this;
			},

			/**
			 * 用于实现为单个属性赋值的内部方法。
			 *
			 * @param {String}
			 *            attr 要设置的属性名。
			 * @param {Object}
			 *            value 属性值。
			 * @param {boolean}
			 *            [skipUnknownAttribute] 是否忽略未知的属性。
			 * @protected
			 */
			doSet: function(attr, value, skipUnknownAttribute, lockWritingTimes) {
				if (attr.charAt(0) == '$') return;

				var path, def;
				if (attr.indexOf('.') > 0) {
					path = attr;
				}
				else {
					def = this.ATTRIBUTES[attr] || (this.PRIVATE_ATTRIBUTES && this.PRIVATE_ATTRIBUTES[attr]);
					if (def) path = def.path;
				}

				if (path) {
					var sections = path.split('.'), owner = this;
					for(var i = 0; i < sections.length - 1 && owner != null; i++) {
						var section = sections[i];
						if (section.charAt(0) !== '_' && typeof owner.get === "function") {
							owner = owner.get(section);
						}
						else {
							owner = owner[section];
						}
					}
					if (owner != null) {
						var section = sections[sections.length - 1];
						(section.charAt(0) == '_') ? (owner[section] = value)
							: owner.set(section, value);
					}
					else {
						this['_' + attr] = value;
					}
				}
				else {
					if (def) {
						if (def.readOnly) {
							throw new dorado.AttributeException("dorado.core.AttributeReadOnly", attr);
						}

						var attributeWatcher = this.getAttributeWatcher();
						if (def.writeOnce && attributeWatcher.getWritingTimes(attr) > 0) {
							throw new dorado.AttributeException(
								"dorado.core.AttributeWriteOnce", attr);
						}
						if (!lockWritingTimes) {
							attributeWatcher.incWritingTimes(attr);
						}

						if (def.setter) {
							def.setter.call(this, value, attr);
						}
						else {
							this['_' + attr] = value;
						}

						if (this.fireEvent && this.getListenerCount("onAttributeChange")) {
							this.fireEvent("onAttributeChange", this, {
								attribute: attr,
								value: value
							});
						}
					}
					else {
						if (value instanceof Object && this.EVENTS && (this.EVENTS[attr] || (this.PRIVATE_EVENTS && this.PRIVATE_EVENTS[attr]))) {
							if (typeof value === "function") {
								this.addListener(attr, value);
							}
							else if (value.listener) this.addListener(attr, value.listener, value.options);
						}
						else if (!skipUnknownAttribute) {
							throw new dorado.AttributeException("dorado.core.UnknownAttribute", attr);
						}
					}
				}
			},

			/**
			 * 判断对象中是否定义了某个标签值。
			 *
			 * @param {String}
			 *            tag 要判断的标签值。
			 * @return {boolean} 是否具有该标签值。
			 */
			hasTag: function(tag) {
				if (this._tags) {
					return this._tags.indexOf(tag) >= 0;
				}
				else {
					return false;
				}
			}
		});

	/**
	 * @author Benny Bao (mailto:benny.bao@bstek.com)
	 * @class 属性的观察者。
	 */
	dorado.AttributeWatcher = $class(/** @scope dorado.AttributeWatcher.prototype */ {
		$className: "dorado.AttributeWatcher",

		/**
		 * 返回某属性的被写入次数。
		 *
		 * @param {String}
		 *            attr 属性名
		 * @return {int} 属性的被写入次数。
		 */
		getWritingTimes: function(attr) {
			return this[attr] || 0;
		},
		incWritingTimes: function(attr) {
			this[attr] = (this[attr] || 0) + 1;
		},
		setWritingTimes: function(attr, n) {
			this[attr] = n;
		}
	});

	function overrideDefinition(targetDefs, def, name) {
		if (!def) return;
		var targetDef = targetDefs[name];
		if (targetDef) {
			dorado.Object.apply(targetDef, def);
		}
		else {
			targetDefs[name] = dorado.Object.apply({}, def);
		}
	}

})();

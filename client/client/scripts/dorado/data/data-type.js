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

	/**
	 * @author Benny Bao (mailto:benny.bao@bstek.com)
	 * @class 数据类型。数据类型是对所有系统中可能使用到的数据类型的抽象。
	 * <p>
	 * 此参数具有多态性，当我们传入一个String类型的参数时，该String值表示数据类型的name。
	 * 当我们传入的参数是一个JSON对象时，系统会自动将该JSON对象中的属性复制到数据类型中。 <br>
	 * 如果没有在此步骤中没有为组件指定name，那么系统会自动为其分配一个name。
	 * </p>
	 * @abstract
	 * @extends dorado.AttributeSupport
	 * @param {String|Object} [config] 配置信息。
	 */
	dorado.DataType = $extend(dorado.AttributeSupport, /** @scope dorado.DataType.prototype */
		{
			/**
			 * @function
			 * @name dorado.DataType#parse
			 * @description 尝试将一个任意类型的值转换成本数据类型所描述的类型。
			 * @param {Object} data 要转换的数据。
			 * @param {Object} [argument] 转换时可能需要用到的参数。
			 * @return {Object} 转换后得到的数据。
			 */
			// =====

			$className: "dorado.DataType",

			ATTRIBUTES: /** @scope dorado.DataType.prototype */
			{

				/**
				 * 数据类型的名称。
				 * @type String
				 * @attribute readOnly
				 */
				name: {
					readOnly: true
				},

				/**
				 * 用于在后端定位服务的id。如无特殊需要请不要修改。
				 * @type String
				 * @attribute writeOnce
				 */
				id: {
					writeOnce: true
				},

				/**
				 * 隶属的数据类型管理器。
				 * @type dorado.DataTypeRepository
				 * @attribute readOnly
				 */
				dataTypeRepository: {
					readOnly: true
				},

				/**
				 * 返回所属的视图。
				 * @type dorado.widget.View
				 * @attribute readOnly
				 */
				view: {
					path: "_dataTypeRepository._view"
				},

				/**
				 * 用户自定义数据。
				 * @type Object
				 * @attribute skipRefresh
				 */
				userData: {
					skipRefresh: true
				}
			},

			constructor: function (config) {
				$invokeSuper.call(this, arguments);

				var name;
				if (config && config.constructor == String) {
					name = config;
					config = null;
				} else if (config) {
					name = config.name;
					delete config.name;
					this.set(config);
				}
				this._name = name ? name : dorado.Core.newId();
				if (!this._id) this._id = this._name;

				if (this.id) {
					if (window[this.id] === undefined) {
						window[this.id] = this;
					} else {
						var v = window[this.id];
						if (v instanceof Array) {
							v.push(this);
						} else {
							window[this.id] = [v, this];
						}
					}
				}
			},

			getListenerScope: function () {
				return this.get("view");
			},

			/**
			 * 尝试将一个任意类型的值转换成本文本值。<br>
			 * 如需在子类中改变其逻辑其复写{@link dorado.DataType#doToText}方法。
			 * @param {Object} data 要转换的数据。
			 * @param {Object} [argument] 转换时可能需要用到的参数。
			 * @return {String} 转换后得到的文本。
			 * @final
			 * @see dorado.DataType#doToText
			 */
			toText: function (data, argument) {
				if (typeof argument == "string" && argument.indexOf("call:") == 0) {
					var func = argument.substring(5);
					func = window[func];
					if (typeof func == "function") {
						return func(data);
					}
				}
				return this.doToText.apply(this, arguments);
			},

			/**
			 * 将一个任意类型的值转换成本文本值。此方法供子类复写。
			 * @param {Object} data 要转换的数据。
			 * @param {Object} [argument] 转换时可能需要用到的参数。
			 * @return {String} 转换后得到的文本。
			 * @protected
			 * @see dorado.DataType#toText
			 */
			doToText: function (data, argument) {
				if (data === null || data === undefined || (typeof data !== "string" && typeof data !== "object" && isNaN(data))) {
					return '';
				} else {
					return data + '';
				}
			}
		});

	dorado.DataType.getSubName = function (name) {
		var complexDataTypeNameRegex = /^[\w\/.$:@#\-|]*\[[\w\/\[\]\..$:@#\-|]*\]$/;
		return (name.match(complexDataTypeNameRegex)) ? name.substring(name.indexOf('[') + 1, name.length - 1) : null;
	};

	/**
	 * @author Benny Bao (mailto:benny.bao@bstek.com)
	 * @class 聚合类型。
	 * @extends dorado.DataType
	 * @see dorado.EntityDataType
	 */
	dorado.AggregationDataType = $extend(dorado.DataType, /** @scope dorado.AggregationDataType.prototype */
		{
			$className: "dorado.AggregationDataType",

			ATTRIBUTES: /** @scope dorado.AggregationDataType.prototype */
			{
				/**
				 * 聚合元素的数据类型。
				 * @return {dorado.DataType}
				 * @attribute writeOnce
				 */
				elementDataType: {
					getter: function () {
						return this.getElementDataType("always");
					},
					writeOnce: true
				},

				/**
				 * 对数据进行分页浏览时每页的记录数。
				 * @type int
				 * @attribute
				 */
				pageSize: {
					defaultValue: 0
				}
			},

			constructor: function (config, elementDataType) {
				$invokeSuper.call(this, arguments);
				if (elementDataType)
					this._elementDataType = elementDataType;
			},

			getElementDataType: function (loadMode) {
				var dataType = this._elementDataType;
				if (dataType != null) {
					dataType = dorado.LazyLoadDataType.dataTypeTranslator.call(this, dataType, loadMode);
					if (dataType instanceof dorado.DataType) this._elementDataType = dataType;
				}
				return dataType;
			},
			/**
			 * 将传入的数据转换为集合。
			 * @param {Object|Object[]} data 要转换的数据。
			 * @return {dorado.EntityList} 转换后得到的集合。
			 */
			parse: function (data) {
				if (data != null) {
					var elementDataType = this.getElementDataType("always");
					if (elementDataType && elementDataType._code) {
						var array = [];
						if (!(data instanceof Array)) data = [data];
						for (var i = 0; i < data.length; i++) {
							array.push(elementDataType.parse(data[i]));
						}
						return array;
					} else {
						return (data instanceof dorado.EntityList) ? data : new dorado.EntityList(data, this._dataTypeRepository, this);
					}
				} else {
					return null;
				}
			}
		});

	/**
	 * @author Benny Bao (mailto:benny.bao@bstek.com)
	 * @name dorado.EntityDataType
	 * @class 实体类型。
	 * <p>
	 * EntityDataType的get方法在{@link dorado.AttributeSupport#get}的基础上做了增强。
	 * 除了原有的读取属性值的功能之外，此方法还另外提供了下面的用法。
	 * <ul>
	 *    <li>当传入一个以#开头的字符串时，#后面的内容将被识别成属性声明的名称，表示根据名称获取属性声明。参考{@link dorado.EntityDataType#getPropertyDef}。</li>
	 * </ul>
	 * </p>
	 * @extends dorado.DataType
	 * @extends dorado.EventSupport
	 * @see dorado.PropertyDef
	 * @see dorado.Reference
	 * @see dorado.Lookup
	 */
	dorado.EntityDataType = $extend([dorado.DataType, dorado.EventSupport], /** @scope dorado.EntityDataType.prototype */
		{
			$className: "dorado.EntityDataType",

			ATTRIBUTES: /** @scope dorado.EntityDataType.prototype */
			{

				/**
				 * 是否允许外界访问实体中尚未声名的属性。
				 * @type boolean
				 * @attribute
				 */
				acceptUnknownProperty: {},

				/**
				 * 默认的显示属性。
				 * <p>
				 * 当系统需要将一个属于此类型的数据实体转换成用于显示的文本时（即相当于调用{@link dorado.Entity#toText}方法时），
				 * 如果此时数据类型中定义了此值，那么系统将直接使用此值所代表的属性的属性值作为整个数据实体的显示文本。
				 * </p>
				 * <p>
				 * 例如一个Employee类型中有id、name、sex、phone等很多属性，如果我们定义了Employee类型的defaultDisplayProperty=name，
				 * 那么系统会将直接用name属性的值作为其隶属的数据实体的显示文本。
				 * </p>
				 * @type String
				 * @attribute
				 */
				defaultDisplayProperty: {},

				/**
				 * 当数据实体需要确认其中的内容修改时，最高可以接受哪个级别的验证信息。
				 * 出此处给定的默认值ok之外，通常可选的值还有warn。info和error则一般不会作为此属性的值。
				 * @type String
				 * @default "ok"
				 * @attribute
				 * @see dorado.validator.Validator#validate
				 * @see dorado.Entity#getValidationResults
				 */
				acceptValidationState: {
					defaultValue: "ok"
				},

				/**
				 * 是否禁用其中所有的数据验证器。包括所有属性上的数据验证器。
				 * @type boolean
				 * @attribute
				 */
				validatorsDisabled: {},

				/**
				 * 属性声明的集合。
				 * <p>
				 * 此属性在读写时的意义不完全相同。
				 * <ul>
				 * <li>当读取时返回实体类型中属性声明的集合，类型为{@link dorado.util.KeyedArray}。</li>
				 * <li>当写入时用于添加属性声明。<br>
				 * 此处数组中既可以放入属性声明的实例，又可以放入JSON对象。
				 * 具体请参考{@link dorado.EntityDataType#addPropertyDef}。</li>
				 * </ul>
				 * </p>
				 * @type Object[]|dorado.PropertyDef[]
				 * @attribute
				 */
				propertyDefs: {
					setter: function (value) {
						this.removeAllPropertyDef();
						if (value) {
							for (var i = 0; i < value.length; i++) {
								this.addPropertyDef(value[i]);
							}
						}
					}
				}
			},

			EVENTS: /** @scope dorado.EntityDataType.prototype */
			{
				/**
				 * 当某个此类型的{@link dorado.EntityList}中的当前数据实体将要被改变前触发的事件。
				 * @param {Object} self 事件的发起者，即EntityDataType本身。
				 * @param {Object} arg 事件参数。
				 * @param {dorado.EntityList} arg.entityList 触发事件的实体对象集合。
				 * @param {dorado.Entity} arg.oldCurrent 原先的当前数据实体。
				 * @param {dorado.Entity} arg.newCurrent 新的当前数据实体。
				 * @param {boolean} #arg.processDefault=true 用于通知系统是否要继续完成后续动作。
				 * @return {boolean} 是否要继续后续事件的触发操作，不提供返回值时系统将按照返回值为true进行处理。
				 * @event
				 * @see dorado.EntityList#current
				 * @see dorado.EntityList#setCurrent
				 */
				beforeCurrentChange: {},

				/**
				 * 当某个此类型的{@link dorado.EntityList}中的当前数据实体被改变后触发的事件。
				 * @param {Object} self 事件的发起者，即EntityDataType本身。
				 * @param {Object} arg 事件参数。
				 * @param {dorado.EntityList} arg.entityList 触发事件的实体对象集合。
				 * @param {dorado.Entity} arg.oldCurrent 原先的当前数据实体。
				 * @param {dorado.Entity} arg.newCurrent 新的当前数据实体。
				 * @return {boolean} 是否要继续后续事件的触发操作，不提供返回值时系统将按照返回值为true进行处理。
				 * @event
				 * @see dorado.EntityList#current
				 * @see dorado.EntityList#setCurrent
				 */
				onCurrentChange: {},

				/**
				 * 当某个此类型的{@link dorado.EntityList}中的将要插入一个新的数据实体前触发的事件。
				 * @param {Object} self 事件的发起者，即EntityDataType本身。
				 * @param {Object} arg 事件参数。
				 * @param {dorado.EntityList} arg.entityList 触发事件的实体对象集合。
				 * @param {dorado.Entity} arg.entity 将要插入的数据实体。
				 * @param {String} arg.insertMode 插入方式。
				 * @param {dorado.Entity} arg.refEntity 插入位置的参照数据实体。
				 * @param {boolean} #arg.processDefault=true 用于通知系统是否要继续完成后续动作。
				 * @return {boolean} 是否要继续后续事件的触发操作，不提供返回值时系统将按照返回值为true进行处理。
				 * @event
				 * @see dorado.EntityList#insert
				 */
				beforeInsert: {},

				/**
				 * 当某个此类型的{@link dorado.EntityList}中的插入一个新的数据实体后触发的事件。
				 * @param {Object} self 事件的发起者，即EntityDataType本身。
				 * @param {Object} arg 事件参数。
				 * @param {dorado.EntityList} arg.entityList 触发事件的实体对象集合。
				 * @param {dorado.Entity} arg.entity 新插入的数据实体。
				 * @param {String} arg.insertMode 插入方式。
				 * @param {dorado.Entity} arg.refEntity 插入位置的参照数据实体。
				 * @return {boolean} 是否要继续后续事件的触发操作，不提供返回值时系统将按照返回值为true进行处理。
				 * @event
				 * @see dorado.EntityList#insert
				 */
				onInsert: {},

				/**
				 * 当某个此类型的{@link dorado.EntityList}中的将要删除的一个数据实体前触发的事件。
				 * @param {Object} self 事件的发起者，即EntityDataType本身。
				 * @param {Object} arg 事件参数。
				 * @param {dorado.EntityList} arg.entityList 触发事件的实体对象集合。
				 * @param {dorado.Entity} arg.entity 将被删除的数据实体。
				 * @param {boolean} #arg.processDefault=true 用于通知系统是否要继续完成后续动作。
				 * @return {boolean} 是否要继续后续事件的触发操作，不提供返回值时系统将按照返回值为true进行处理。
				 * @event
				 * @see dorado.EntityList#remove
				 */
				beforeRemove: {},

				/**
				 * 当某个此类型的{@link dorado.EntityList}中的删除了一个数据实体后触发的事件。
				 * @param {Object} self 事件的发起者，即EntityDataType本身。
				 * @param {Object} arg 事件参数。
				 * @param {dorado.EntityList} arg.entityList 触发事件的实体对象集合。
				 * @param {dorado.Entity} arg.entity 被删除的数据实体。
				 * @return {boolean} 是否要继续后续事件的触发操作，不提供返回值时系统将按照返回值为true进行处理。
				 * @event
				 * @see dorado.EntityList#remove
				 */
				onRemove: {},

				/**
				 * 当某个此类型的{@link dorado.Entity}中的属性值将要被改变前触发的事件。
				 * @param {Object} self 事件的发起者，即EntityDataType本身。
				 * @param {Object} arg 事件参数。
				 * @param {dorado.Entity} arg.entity 触发事件的实体对象。
				 * @param {String} arg.property 将要被改变的属性名。
				 * @param {Object} arg.oldValue 原先的属性值。
				 * @param {Object} #arg.newValue 将要写入的值。
				 * @param {boolean} #arg.processDefault=true 用于通知系统是否要继续完成后续动作。
				 * @return {boolean} 是否要继续后续事件的触发操作，不提供返回值时系统将按照返回值为true进行处理。
				 * @event
				 * @see dorado.Entity#set
				 */
				beforeDataChange: {},

				/**
				 * 当某个此类型的{@link dorado.Entity}中的属性值被改变后触发的事件。
				 * @param {Object} self 事件的发起者，即EntityDataType本身。
				 * @param {Object} arg 事件参数。
				 * @param {dorado.Entity} arg.entity 触发事件的实体对象。
				 * @param {String} arg.property 被改变的属性名。
				 * @param {Object} arg.oldValue 原先的属性值。
				 * @param {Object} arg.newValue 将要写入的值。
				 * @return {boolean} 是否要继续后续事件的触发操作，不提供返回值时系统将按照返回值为true进行处理。
				 * @event
				 * @see dorado.Entity#set
				 */
				onDataChange: {},

				/**
				 * 当某个此类型的{@link dorado.Entity}的状态将要被改变前触发的事件。
				 * @param {Object} self 事件的发起者，即EntityDataType本身。
				 * @param {Object} arg 事件参数。
				 * @param {dorado.Entity} arg.entity 触发事件的实体对象。
				 * @param {int} arg.oldState 原先的状态代码。
				 * @param {int} arg.newState 新的状态代码。
				 * @param {boolean} #arg.processDefault=true 用于通知系统是否要继续完成后续动作。
				 * @return {boolean} 是否要继续后续事件的触发操作，不提供返回值时系统将按照返回值为true进行处理。
				 * @event
				 * @see dorado.Entity#state
				 * @see dorado.Entity#setState
				 */
				beforeStateChange: {},

				/**
				 * 当某个此类型的{@link dorado.Entity}的状态被改变后触发的事件。
				 * @param {Object} self 事件的发起者，即EntityDataType本身。
				 * @param {Object} arg 事件参数。
				 * @param {dorado.Entity} arg.entity 触发事件的实体对象。
				 * @param {int} arg.oldState 原先的状态代码。
				 * @param {int} arg.newState 新的状态代码。
				 * @return {boolean} 是否要继续后续事件的触发操作，不提供返回值时系统将按照返回值为true进行处理。
				 * @event
				 * @see dorado.Entity#state
				 * @see dorado.Entity#setState
				 */
				onStateChange: {},

				/**
				 * 当某个此类型的{@link dorado.Entity}的被装载是触发的事件。<br>
				 * 此处所说的装载一般指数据实体从服务端被装载到客户端，在客户端添加一个数据实体不会触发此事件。
				 * @param {Object} self 事件的发起者，即EntityDataType本身。
				 * @param {Object} arg 事件参数。
				 * @param {dorado.Entity} arg.entity 触发事件的实体对象
				 * @return {boolean} 是否要继续后续事件的触发操作，不提供返回值时系统将按照返回值为true进行处理。
				 * @event
				 */
				onEntityLoad: {},

				/**
				 * 当某个此类型的{@link dorado.Entity}的额外信息被改变后触发的事件。
				 * @param {Object} self 事件的发起者，即EntityDataType本身。
				 * @param {Object} arg 事件参数。
				 * @param {dorado.Entity} arg.entity 触发事件的实体对象。
				 * @return {boolean} 是否要继续后续事件的触发操作，不提供返回值时系统将按照返回值为true进行处理。
				 * @event
				 * @see dorado.Entity#getMessages
				 * @see dorado.Entity#getMessageState
				 * @see dorado.Entity#setMessages
				 */
				onMessageChange: {},

				/**
				 * 系统尝试将一个数据实体对象转换成一段用于显示的文本时触发的事件。
				 * @param {Object} self 事件的发起者，即EntityDataType本身。
				 * @param {Object} arg 事件参数。
				 * @param {dorado.Entity} arg.entity 触发事件的实体对象。
				 * @param {String} #arg.text 转换得到的用于显示的文本。
				 * @param {boolean} #arg.processDefault=false 用于通知系统是否要继续完成后续动作。
				 * @return {boolean} 是否要继续后续事件的触发操作，不提供返回值时系统将按照返回值为true进行处理。
				 * @event
				 * @see dorado.Entity#state
				 * @see dorado.Entity#setState
				 */
				onEntityToText: {}
			},

			constructor: function (config) {
				this._propertyDefs = new dorado.util.KeyedArray(function (propertyDef) {
					return propertyDef._name;
				});
				$invokeSuper.call(this, arguments);
			},

			doGet: function (attr) {
				var c = attr.charAt(0);
				if (c == '#' || c == '&') {
					var propertyName = attr.substring(1);
					return this.getPropertyDef(propertyName);
				} else {
					return $invokeSuper.call(this, [attr]);
				}
			},

			fireEvent: function () {
				// 对于那些Ajax懒装载的DataType，其中view可能是空的
				var view = this.get("view"), oldView = window.view;
				window.view = view;
				try {
					return $invokeSuper.call(this, arguments);
				}
				finally {
					window.view = oldView;
				}
			},

			/**
			 * 向实体类型中添加一个属性声明。
			 * <p>
			 * 此处数组中可放置两种类型的属性声明定义：
			 *    <ul>
			 *    <li>直接放入一个属性声明的实例对象。</li>
			 *    <li>放入含属性声明信息的JSON对象。<br>
			 * 此时可以使用子控件类型名称中"dorado."和"PropertyDef"之间的部分作为$type的简写。
			 * 如果$type为空或不指定$type，系统将会按照{@link dorado.PropertyDef}来实例化。
			 *    </li>
			 *    </ul>
			 * </p>
			 * @param {dorado.PropertyDef|Object} propertyDef 要添加的属性声明或含属性声明信息的JSON对象。
			 * @return dorado.PropertyDef 添加的属性声明。
			 * @see dorado.PropertyDef
			 * @see dorado.Reference
			 * @see dorado.Toolkits.createInstance
			 */
			addPropertyDef: function (propertyDef) {
				if (propertyDef instanceof dorado.PropertyDef) {
					if (propertyDef._parent) {
						var parent = propertyDef._parent;
						if (parent.getPropertyDef(propertyDef._name) == propertyDef) {
							parent._propertyDefs.remove(propertyDef);
						}
					}
				} else {
					propertyDef = dorado.Toolkits.createInstance("propertydef", propertyDef);
				}

				propertyDef._parent = this;
				this._propertyDefs.append(propertyDef);

				if (this._wrapperType) this.updateWrapperType();
				return propertyDef;
			},

			/**
			 * 从实体类型中删除一个属性声明。
			 * @param {dorado.PropertyDef} propertyDef 要删除的属性声明。
			 */
			removePropertyDef: function (propertyDef) {
				propertyDef._parent = null;
				this._propertyDefs.remove(propertyDef);
			},

			/**
			 * 从实体类型中删除所有属性声明。
			 */
			removeAllPropertyDef: function() {
				if (this._propertyDefs.size == 0) return;
				this._propertyDefs.each(function (propertyDef) {
					propertyDef._parent = null;
				});
				this._propertyDefs.clear();
			},

			/**
			 * 根据属性名从实体类型返回相应的属性声明。
			 * @param {String} name 属性名。
			 * @return {dorado.PropertyDef} 属性声明。
			 */
			getPropertyDef: function (name) {
				return this._propertyDefs.get(name);
			},

			/**
			 * 将传入的数据转换为一个实体对象。
			 * @param {Object} data 要转换的数据
			 * @return {dorado.Entity} 转换后得到的实体。
			 */
			parse: function (data) {
				if (data != null) {
					if (data instanceof dorado.Entity) {
						return data
					} else {
						var oldProcessDefaultValue = SHOULD_PROCESS_DEFAULT_VALUE;
						SHOULD_PROCESS_DEFAULT_VALUE = false;
						try {
							return new dorado.Entity(data, this._dataTypeRepository, this);
						}
						finally {
							SHOULD_PROCESS_DEFAULT_VALUE = oldProcessDefaultValue;
						}
					}
				} else {
					return null;
				}
			},

			/**
			 * 扩展本实体数据类型。即以当前的实体数据类型为模板，创建一个相似的、全新的实体数据类型。
			 * @param {String|Object} config 新的实体数据类型的名称或构造参数。
			 * <p>
			 * 此参数具有多态性，当我们传入一个String类型的参数时，该String值表示数据类型的name。
			 * 当我们传入的参数是一个JSON对象时，系统会自动将该JSON对象中的属性复制到数据类型中。 <br>
			 * 如果没有在此步骤中没有为组件指定name，那么系统会自动为其分配一个name。
			 * </p>
			 * @return {dorado.EntityDataType} 新的实体数据类型。
			 */
			extend: function (config) {
				if (typeof config == "string") {
					config = {
						name: config
					};
				} else
					config = config || {};
				var self = this;
				jQuery(["acceptUnknownProperty", "tag"]).each(function (i, p) {
					if (config[p] === undefined)
						config[p] = self.get(p);
				});
				var newDataType = new this.constructor(config);
				newDataType._events = dorado.Core.clone(this._events);
				this._propertyDefs.each(function (pd) {
					newDataType.addPropertyDef(dorado.Core.clone(pd));
				});
				return newDataType;
			},

			updateWrapperType: function () {
				var wrapperType = this._wrapperType, wrapperPrototype = wrapperType.prototype;
				this._propertyDefs.each(function (pd) {
					var name = pd._name;
					if (wrapperType._definedProperties[name]) return;
					wrapperType._definedProperties[name] = true;

					var getter = function () {
						var value;
						if (this._textMode) {
							value = this._entity.getText(name);
						}
						else {
							value = this._entity.get(name);
						}
						if (value instanceof dorado.Entity || value instanceof dorado.EntityList) {
							value = value.getWrapper(this._options);
						}
						return value;
					};
					var setter = function (value) {
						if (this._readOnly) {
							throw new dorado.Exception("Wrapper is readOnly.");
						}
						this._entity.set(name, value);
					};

					try {
						wrapperPrototype.__defineGetter__(name, getter);
						wrapperPrototype.__defineSetter__(name, setter);
					} catch (e) {
						Object.defineProperty(wrapperPrototype, name, {
							get: getter,
							set: setter
						});
					}
				});
			},

			getWrapperType: function () {
				if (!this._wrapperType) {
					this._wrapperType = function (entity, options) {
						this._entity = entity;
						this._options = options;
						this._textMode = options && options.textMode;
						this._readOnly = options && options.readOnly;
					};
					this._wrapperType._definedProperties = {};
					this.updateWrapperType();
				}
				return this._wrapperType;
			}
		});

	/**
	 * @name dorado.datatype
	 * @namespace 包含各种常用数据类型声明的命名空间。
	 */
	dorado.datatype = {};

	var DataType = dorado.DataType;
	DataType.STRING = 1;
	DataType.PRIMITIVE_INT = 2;
	DataType.INTEGER = 3;
	DataType.PRIMITIVE_FLOAT = 4;
	DataType.FLOAT = 5;
	DataType.PRIMITIVE_BOOLEAN = 6;
	DataType.BOOLEAN = 7;
	DataType.DATE = 8;
	DataType.TIME = 9;
	DataType.DATETIME = 10;
	DataType.PRIMITIVE_CHAR = 11;
	DataType.CHARACTER = 12;

	/**
	 * @class 字符串类型。
	 * @extends dorado.DataType
	 */
	dorado.datatype.StringDataType = $extend(DataType, /** @scope dorado.datatype.StringDataType.prototype */
		{
			$className: "dorado.datatype.StringDataType",

			_code: DataType.STRING,

			parse: function (data, argument) {
				return (data == null) ? null : (data + '');
			},
			doToText: function (data, argument) {
				return (data == null) ? '' : data + '';
			}
		});

	/**
	 * 默认的字符串类型的实例。
	 * @type dorado.datatype.StringDataType
	 * @constant
	 */
	dorado.$String = new dorado.datatype.StringDataType("String");

	$parseFloat = dorado.util.Common.parseFloat;
	$parseInt = function (s) {
		var n = Math.round($parseFloat(s));
		if (n > 9007199254740991) {
			throw new dorado.ResourceException("dorado.data.ErrorNumberOutOfRangeG");
		}
		else if (n < -9007199254740991) {
			throw new dorado.ResourceException("dorado.data.ErrorNumberOutOfRangeL");
		}
		return n;
	};
	$formatFloat = dorado.util.Common.formatFloat;

	/**
	 * @class 原生整数类型。
	 * @extends dorado.DataType
	 */
	dorado.datatype.PrimitiveIntDataType = $extend(DataType, /** @scope dorado.datatype.PrimitiveIntDataType.prototype */
		{
			$className: "dorado.datatype.PrimitiveIntDataType",

			_code: DataType.PRIMITIVE_INT,

			parse: function (data, argument) {
				var n = $parseInt(data);
				return (isNaN(n)) ? 0 : n;
			},
			/**
			 * 尝试将一个整数转换成本文本值。
			 * @param {int} data 要转换的数据。
			 * @param {String} [argument] 转换时可能需要用到的参数。此处为数字的格式化字符串。
			 * @return {String} 转换后得到的文本。
			 * @see $formatFloat
			 */
			doToText: $formatFloat
		});

	/**
	 * 默认的原生整数类型的实例。
	 * @type dorado.datatype.PrimitiveIntDataType
	 * @constant
	 */
	dorado.$int = new dorado.datatype.PrimitiveIntDataType("int");

	/**
	 * @class 整数对象类型。
	 * @extends dorado.DataType
	 */
	dorado.datatype.IntegerDataType = $extend(DataType, /** @scope dorado.datatype.IntegerDataType.prototype */
		{
			$className: "dorado.datatype.IntegerDataType",

			_code: DataType.INTEGER,

			parse: function (data, argument) {
				var n = $parseInt(data);
				return (isNaN(n)) ? null : n;
			},
			/**
			 * 尝试将一个整数对象转换成本文本值。
			 * @param {int} data 要转换的数据。
			 * @param {String} [argument] 转换时可能需要用到的参数。此处为数字的格式化字符串。
			 * @return {String} 转换后得到的文本。
			 * @see $formatFloat
			 */
			doToText: $formatFloat
		});

	/**
	 * 默认的整数对象类型的实例。
	 * @type dorado.datatype.IntegerDataType
	 * @constant
	 */
	dorado.$Integer = new dorado.datatype.IntegerDataType("Integer");

	/**
	 * @class 原生浮点类型。
	 * @extends dorado.DataType
	 */
	dorado.datatype.PrimitiveFloatDataType = $extend(DataType, /** @scope dorado.datatype.PrimitiveFloatDataType.prototype */
		{
			$className: "dorado.datatype.PrimitiveFloatDataType",

			_code: DataType.PRIMITIVE_FLOAT,

			parse: function (data, argument) {
				var n = $parseFloat(data);
				return (isNaN(n)) ? 0 : n;
			},
			/**
			 * 尝试将一个浮点数转换成本文本值。
			 * @param {float} data 要转换的数据。
			 * @param {String} [argument] 转换时可能需要用到的参数。此处为数字的格式化字符串。
			 * @return {String} 转换后得到的文本。
			 * @see $formatFloat
			 */
			doToText: $formatFloat
		});

	/**
	 * 默认的原生浮点类型的实例。
	 * @type dorado.datatype.PrimitiveFloatDataType
	 * @constant
	 */
	dorado.$float = new dorado.datatype.PrimitiveFloatDataType("float");

	/**
	 * @class 浮点对象类型。
	 * @extends dorado.DataType
	 */
	dorado.datatype.FloatDataType = $extend(DataType, /** @scope dorado.datatype.FloatDataType.prototype */
		{
			$className: "dorado.datatype.FloatDataType",

			_code: DataType.FLOAT,

			parse: function (data, argument) {
				var n = $parseFloat(data);
				return (isNaN(n)) ? null : n;
			},
			/**
			 * 尝试将一个浮点数对象转换成本文本值。
			 * @param {float} data 要转换的数据。
			 * @param {String} [argument] 转换时可能需要用到的参数。此处为数字的格式化字符串。
			 * @return {String} 转换后得到的文本。
			 * @see $formatFloat
			 */
			doToText: $formatFloat
		});

	/**
	 * 默认的浮点对象类型的实例。
	 * @type dorado.datatype.FloatDataType
	 * @constant
	 */
	dorado.$Float = new dorado.datatype.FloatDataType("Float");

	function parseBoolean(data, argument) {
		if (argument == null) {
			if (data == null) return false;
			if (data.constructor == String) {
				return (data.toLowerCase() == "true");
			} else {
				return !!data;
			}
		} else {
			return (data === argument);
		}
	}

	/**
	 * @class 原生逻辑类型。
	 * @extends dorado.DataType
	 */
	dorado.datatype.PrimitiveBooleanDataType = $extend(DataType, /** @scope dorado.datatype.PrimitiveBooleanDataType.prototype */
		{
			$className: "dorado.datatype.PrimitiveBooleanDataType",

			_code: DataType.PRIMITIVE_BOOLEAN,

			/**
			 * 尝试将一个任意类型的值转换逻辑值。
			 * @param {String|int} data 要转换的数据。
			 * @param {String} [argument] 代表逻辑true的值，即如果指定了该参数，那么当传入的数据与该值相等时将被转换为逻辑true。
			 * @return {boolean} 转换后得到的逻辑值。
			 */
			parse: parseBoolean
		});

	/**
	 * 默认的原生逻辑类型的实例。
	 * @type dorado.datatype.PrimitiveBooleanDataType
	 * @constant
	 */
	dorado.$boolean = new dorado.datatype.PrimitiveBooleanDataType("boolean");

	/**
	 * @class 逻辑对象类型。
	 * @extends dorado.DataType
	 */
	dorado.datatype.BooleanDataType = $extend(DataType, /** @scope dorado.datatype.BooleanDataType.prototype */
		{
			$className: "dorado.datatype.BooleanDataType",

			_code: DataType.BOOLEAN,

			/**
			 * 尝试将一个任意类型的值转换逻辑对象。
			 * @param {String|int} data 要转换的数据。
			 * @param {String} [argument] 代表逻辑true的值，即如果指定了该参数，那么当传入的数据与该值相等时将被转换为逻辑true。
			 * @return {boolean} 转换后得到的逻辑对象。
			 */
			parse: function (data, argument) {
				if (data === undefined || data === null) return null;
				return parseBoolean(data, argument);
			}
		});

	/**
	 * 默认的逻辑对象类型的实例。
	 * @type dorado.datatype.BooleanDataType
	 * @constant
	 */
	dorado.$Boolean = new dorado.datatype.BooleanDataType("Boolean");

	/**
	 * @class 日期类型。
	 * @extends dorado.DataType
	 */
	dorado.datatype.DateDataType = $extend(DataType, /** @scope dorado.datatype.DateDataType.prototype */
		{
			$className: "dorado.datatype.DateDataType",

			_code: DataType.DATE,

			/**
			 * 尝试将一个任意类型的值转换日期值。
			 * @param {String|int} data 要转换的数据。
			 * @param {String} [argument] 如果传入的数据为日期字符创，那么此参数可用于指定日期格式。
			 * @return {Date} 转换后得到的日期值。
			 */
			parse: function (data, argument) {
				if (data == null) return null;
				if (typeof data == "string") data = jQuery.trim(data);
				if (data == '') return null;

				if (data instanceof Date) return data;
				if (isFinite(data)) {
					var date = new Date(data);
					if (!isNaN(date.getTime())) {
						return date;
					}
					else {
						date = null;
					}
				}

				if (typeof data == "string") {
					var date = Date.parseDate(data, "Y-m-d\\TH:i:s\\Z");
					if (date == null) {
						var format = argument || $setting["common.defaultDateFormat"];
						var date = Date.parseDate(data, format);
						if (date == null) {
							format = $setting["common.defaultTimeFormat"];
							if (format) {
								date = Date.parseDate(data, format);
								if (date == null) {
									var format = $setting["common.defaultDateTimeFormat"];
									if (format) {
										date = Date.parseDate(data, format);
										if (date == null) data = new Date(data);
									}
								}
							}
						}
					}
				}

				if (date == null) {
					throw new dorado.ResourceException("dorado.data.BadDateFormat", data);
				}
				return date;
			},

			/**
			 * 尝试将一个日期值转换成本文本值。
			 * @param {Date} data 要转换的数据。
			 * @param {String} [argument] 转换时可能需要用到的参数。
			 * @return {String} 转换后得到的文本。
			 * @see Date
			 */
			doToText: function (data, argument) {
				return (data != null && data instanceof Date) ? data.formatDate(argument || $setting["common.defaultDisplayDateFormat"]) : '';
			}
		});

	/**
	 * 默认的日期类型的实例。
	 * @type dorado.datatype.DateDataType
	 * @constant
	 */
	dorado.$Date = new dorado.datatype.DateDataType("Date");

	/**
	 * 默认的时间类型的实例。
	 * @type dorado.datatype.DateDataType
	 * @constant
	 */
	var time = dorado.$Time = new dorado.datatype.DateDataType("Time");
	time._code = DataType.TIME;
	time.doToText = function (data, argument) {
		return (data != null && data instanceof Date) ? data.formatDate(argument || $setting["common.defaultDisplayTimeFormat"]) : '';
	};

	/**
	 * 默认的日期时间类型的实例。
	 * @type dorado.datatype.DateDataType
	 * @constant
	 */
	var datetime = dorado.$DateTime = new dorado.datatype.DateDataType("DateTime");
	datetime._code = DataType.DATETIME;
	datetime.doToText = function (data, argument) {
		return (data != null && data instanceof Date) ? data.formatDate(argument || $setting["common.defaultDisplayDateTimeFormat"]) : '';
	};

	/**
	 * @class 原生字符对象类型。
	 * @extends dorado.DataType
	 */
	dorado.datatype.PrimitiveCharDataType = $extend(DataType, /** @scope dorado.datatype.PrimitiveCharDataType.prototype */
		{
			$className: "dorado.datatype.PrimitiveCharDataType",

			_code: DataType.PRIMITIVE_CHAR,

			parse: function (data, argument) {
				var s = (data == null) ? '\0' : (data + '\0');
				return s.charAt(0);
			}
		});
	/**
	 * 默认的原生字符对象类型的实例。
	 * @type dorado.datatype.PrimitiveCharDataType
	 * @constant
	 */
	dorado.$char = new dorado.datatype.PrimitiveCharDataType("char");

	/**
	 * @class 字符对象类型。
	 * @extends dorado.DataType
	 */
	dorado.datatype.CharacterDataType = $extend(DataType, /** @scope dorado.datatype.CharacterDataType.prototype */
		{
			$className: "dorado.datatype.CharacterDataType",

			_code: DataType.CHARACTER,

			parse: function (data, argument) {
				var s = (data == null) ? '' : (data + '');
				return (s.length > 0) ? s.charAt(0) : null;
			}
		});
	/**
	 * 默认的字符对象类型的实例。
	 * @type dorado.datatype.CharacterDataType
	 * @constant
	 */
	dorado.$Character = new dorado.datatype.CharacterDataType("Character");

})();

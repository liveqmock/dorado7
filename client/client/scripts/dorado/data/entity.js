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

var SHOULD_PROCESS_DEFAULT_VALUE = true;

(function() {
	var DEFAULT_VALIDATION_RESULT_STATE = "error";

	var STATE_CODE = dorado.Toolkits.STATE_CODE;
	var VALIDATION_RESULT_CODE = {
		ok : 0,
		invalid : 1,
		executing : 2
	};
	
	function addMessage2Context(context, entity, property, message) {
		var state = message.state || "error";
		context[state].push({
			entity : entity,
			property : property,
			state : message.state,
			text : message.text
		});
	}
	
	function addMessages2Context(context, entity, property, messages) {
		for (var i = 0; i < messages.length; i++) {
			addMessage2Context(context, entity, property, messages[i]);
		}
	}
	
	function mergeValidationContext(context, state, subContext) {
		var subContextMessages = subContext[state];
		if (!subContextMessages) return;
		for (var i = 0; i < subContextMessages.length; i++) {
			context[state].push(subContextMessages[i]);
		}
	}
	
	function mergeValidationContexts(context, subContext) {
		mergeValidationContext(context, "info", subContext);
		mergeValidationContext(context, "ok", subContext);
		mergeValidationContext(context, "warn", subContext);
		mergeValidationContext(context, "error", subContext);
		mergeValidationContext(context, "executing", subContext);
	}

	function doDefineProperty(proto, property) {
		var getter = function () {
			var value;
			if (this._textMode) {
				value = this._entity.getText(property);
			}
			else {
				value = this._entity.get(property);
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
			this._entity.set(property, value);
		};

		try {
			proto.__defineGetter__(property, getter);
			proto.__defineSetter__(property, setter);
		} catch (e) {
			Object.defineProperty(proto, property, {
				get: getter,
				set: setter
			});
		}
	}

	/**
	 * @author Benny Bao (mailto:benny.bao@bstek.com)
	 * @class 实体对象。
	 *        <p>
	 *        在创建一个实体对象时，我们既可以为其指定实体数据类型，也可以不指定。<br>
	 *        如果指定了实体数据类型，那么访问该实体对象的属性，这些属性必须存在于{@link dorado.EntityDataType}的{@link dorado.PropertyDef}中。<br>
	 *        如果为指定实体数据类型，就可以随意的访问实体对象中的任意属性。
	 *        </p>
	 *        <p>
	 *        为实体对象指定实体数据类型的方法有两种:<br>
	 *        一是利用构造方法中的dataType参数直接指定，此时dorado.Entity的三个构造参数中只有dataType是必须指定的。<br>
	 *        二是利用被封装的JSON对象中的$dataType属性，此时dorado.Entity的三个构造参数中的data和dataTypeRepository是必须指定的。
	 *        例如以下的JSON对象说明其对应的数据类型应为"Employee"。
	 * 
	 * <pre class="symbol-example code">
	 * <code class="javascript">
	 * {
	 * 	$dataType : &quot;Employee&quot;,
	 * 	id : &quot;0001&quot;,
	 * 	name : &quot;John&quot;,
	 * 	sex : true
	 * }
	 * </code>
	 * </pre>
	 * 
	 * </p>
	 *        <p>
	 *        注意：一旦我们将某个JSON数据对象封装为实体对象，那么这个JSON数据对象将将会被实际对象完全接管。
	 *        实体对象会根据自己的需要修改其中的属性、甚至增加属性。因此该JSON数据对象的有效性和完整性将不再得到保障。
	 *        </p>
	 * @param {Object}
	 *            [data] 要封装JSON数据对象。
	 * @param {dorado.DataTypeRepository}
	 *            [dataTypeRepository] 数据类型的管理器。
	 * @param {dorado.EntityDataType}
	 *            [dataType] 实体对象的数据类型。
	 * 
	 * @example // 创建一个空的实体对象，由于未指定实体数据类型，我们可以随意的访问实体对象中的任意属性。 var entity = new
	 *          dorado.Entity(); entity.set("property1, "value1");
	 * 
	 * @example // 将一个JSON对象封装为实体对象，同时利用$dataType指定实体数据类型。 var employee = {
	 *          $dataType : "Employee", id : "0001", name : "John", sex : true };
	 *          var entity = new dorado.Entity(employee,
	 *          view.dataTypeRepository); entity.get("name"); //
	 *          只能访问Employee类型中存在属性。
	 * 
	 * @example var employee = { id : "0001", name : "John", sex : true };
	 * 
	 * var Employee = new EntityDataType("Employee");
	 * Employee.addPropertyDef(new PropertyDef("id"));
	 * Employee.addPropertyDef(new PropertyDef("name"));
	 * Employee.addPropertyDef(new PropertyDef("sex"));
	 *  // 将一个JSON对象封装为实体对象，同时利用dataType参数指定实体数据类型。 var entity = new
	 * dorado.Entity(employee, null, Employee); entity.get("name"); //
	 * 只能访问Employee类型中存在属性。
	 *  // 创建一个空的、类型为Employee的实体对象。 var entity = new dorado.Entity(null, null,
	 * Employee); entity.set("name", "Mike"); // 只能访问Employee类型中存在属性。
	 */
	dorado.Entity = function(data, dataTypeRepository, dataType) {

		/**
		 * 实体对象的id。
		 * 
		 * @type long
		 */
		this.entityId = dorado.Core.getTimestamp() + '';

		/**
		 * 实体对象的时间戳。
		 * <p>
		 * 每当实体对象中的数据或状态发生了改变，实体对象都会更新自己的时间戳，
		 * 因此，时间戳可以可以用来判断实体对象中的数据或状态在一段时间内有没有被修改过。
		 * </p>
		 * 
		 * @type int
		 */
		this.timestamp = dorado.Core.getTimestamp();

		/**
		 * 该实体对象中的数据类型所属的数据类型管理器。
		 * 
		 * @type dorad.DataRepository
		 */
		this.dataTypeRepository = dataTypeRepository;
		
		this._propertyInfoMap = {};
		if (data) {
			this._data = data;
			if (dataType == null) {
				if (dataTypeRepository && data.$dataType) dataType = dataTypeRepository.get(data.$dataType);
			} else {
				data.$dataType = dataType._id;
			}
			if (data.$state) this.state = data.$state;
		} else {
			this._data = data = {};
			if (dataType) this._data.$dataType = dataType._id;
		}

		/**
		 * 该实体对象对应的实体数据类型。
		 * 
		 * @type dorado.EntityDataType
		 */
		this.dataType = dataType;

		if (dataType) {
			this._propertyDefs = dataType._propertyDefs;
			this._propertyDefs.each(function(pd) {
				if (SHOULD_PROCESS_DEFAULT_VALUE && pd._defaultValue != undefined && data[pd._name] == undefined) {
					data[pd._name] = (typeof pd._defaultValue == "function") ? pd._defaultValue.call(this) : pd._defaultValue;
				}

				if (data[pd._name] == null) {
					var dataType = pd.get("dataType");
					if (dataType) {
						switch (dataType._code) {
							case dorado.DataType.PRIMITIVE_INT:
							case dorado.DataType.PRIMITIVE_FLOAT:
								data[pd._name] = 0;
								break;
							case dorado.DataType.PRIMITIVE_BOOLEAN:
								data[pd._name] = false;
								break;
						}
					}
				}
			});
		} else {
			this._propertyDefs = null;
		}
		if (this.acceptUnknownProperty == null) {
			this.acceptUnknownProperty = (dataType) ? dataType._acceptUnknownProperty : true;
		}
	};
	
	/**
	 * 实体对象的状态常量 - 无状态。
	 * 
	 * @type int
	 */
	dorado.Entity.STATE_NONE = 0;

	/**
	 * 实体对象的状态常量 - 新增状态。
	 * 
	 * @type int
	 */
	dorado.Entity.STATE_NEW = 1;

	/**
	 * 实体对象的状态常量 - 已修改状态。
	 * 
	 * @type int
	 */
	dorado.Entity.STATE_MODIFIED = 2;

	/**
	 * 实体对象的状态常量 - 已删除状态。
	 * 
	 * @type int
	 */
	dorado.Entity.STATE_DELETED = 3;

	/**
	 * 实体对象的状态常量 - 被移动状态。 通产指该对象被从一个位置移动到了另一个位置，这包括其父对象的改变或仅仅是顺序被改变。
	 * 
	 * @type int
	 */
	dorado.Entity.STATE_MOVED = 4;

	dorado.Entity._MESSAGE_DATA_CHANGED = 3;
	dorado.Entity._MESSAGE_ENTITY_STATE_CHANGED = 4;
	dorado.Entity._MESSAGE_REFRESH_ENTITY = 5;
	
	dorado.Entity._MESSAGE_LOADING_START = 10;
	dorado.Entity._MESSAGE_LOADING_END = 11;

	/**
	 * @name dorado.Entity#dataProvider
	 * @property
	 * @type dorado.DataProvider
	 * @description 获取为实体对象提供数据的数据提供者。
	 */
	/**
	 * @name dorado.Entity#parameter
	 * @property
	 * @type Object
	 * @description 装载数据使用的附加参数。
	 */
	// =====

	$class(/** @scope dorado.Entity.prototype */
	{
		$className : "dorado.Entity",

		constructor : dorado.Entity,

		/**
		 * 实体对象的状态。
		 * 
		 * @type int
		 * @default dorado.Entity.STATE_NONE
		 */
		state : dorado.Entity.STATE_NONE,

		_observer : null,
		_disableObserversCounter : 0,
		_messages : null,

		_setObserver: function(observer) {
			this._observer = observer;
			var data = this._data;
			for(p in data) {
				if (data.hasOwnProperty(p)) {
					var v = data[p];
					if (v == null) continue;
					if ( v instanceof dorado.Entity || v instanceof dorado.EntityList) {
						v._setObserver(observer);
					}
				}
			}
		},
		
		/**
		 * 禁止dorado.Entity将消息发送给其观察者。
		 * <p>
		 * 该方法的主要作用是阻止与该实体对象关联的数据控件自动根据实体对象的变化刷新自身的显示内容，
		 * 这样做的目的一般是为了提高对实体对象连续进行操作时的运行效率。
		 * </p>
		 */
		disableObservers: function() {
			this._disableObserversCounter++;
		},
		
		/**
		 * 允许dorado.Entity将消息发送给其观察者。
		 */
		enableObservers: function() {
			if (this._disableObserversCounter > 0) this._disableObserversCounter--;
		},
		
		/**
		 * 通知dorado.Entity的观察者刷新数据。
		 */
		notifyObservers: function() {
			this.sendMessage(0);
		},
		
		sendMessage: function(messageCode, arg) {
			if (this._disableObserversCounter == 0 && this._observer) {
				this._observer.entityMessageReceived(messageCode, arg);
			}
		},
		
		/**
		 * 设置实体对象的状态。
		 * 
		 * @param {int}
		 *            state 状态。
		 */
		setState: function(state) {
			if (this.state == state) return;

			var eventArg = {
				entity : this,
				oldState : this.state,
				newState : state,
				processDefault : true
			};

			var dataType = this.dataType;
			if (dataType && !this.disableEvents)
				dataType.fireEvent("beforeStateChange", dataType, eventArg);
			if (!eventArg.processDefault) return;

			if (this.state == dorado.Entity.STATE_NONE && (state == dorado.Entity.STATE_MODIFIED || state == dorado.Entity.STATE_MOVED)) {
				this.storeOldData();
			}

			this.state = state;
			this.timestamp = dorado.Core.getTimestamp();
			
			var entityList = this.parent;
			if (entityList && entityList instanceof dorado.EntityList) {
				var page = this.page;
				if (eventArg.oldState == dorado.Entity.STATE_DELETED) {
					entityList.changeEntityCount(page, 1);
				}
				else if (eventArg.newState == dorado.Entity.STATE_DELETED) {
					entityList.changeEntityCount(page, -1);
				}
			}

			if (dataType && !this.disableEvents) dataType.fireEvent("onStateChange", dataType, eventArg);
			this.sendMessage(dorado.Entity._MESSAGE_ENTITY_STATE_CHANGED, eventArg);
		},
		
		_get: function(property, propertyDef, callback, loadMode) {

			function transferAndReplaceIf(entity, propertyDef, value, replaceValue) {
				if (value && typeof (value instanceof dorado.Entity || value instanceof dorado.EntityList) && value.parent == entity) return value;
				
				var dataType = propertyDef.get("dataType");
				if (dataType == null) return value;

				var originValue = value; 
				value = dataType.parse(originValue, propertyDef.get("typeFormat"));
				replaceValue = replaceValue &&
					((value instanceof dorado.Entity || value instanceof dorado.EntityList) && value.parent !== entity);

				if ((value instanceof dorado.Entity || value instanceof dorado.EntityList) && value.parent != this) {
					value.parent = entity;
					value.timestamp = dorado.Core.getTimestamp();
					value.parentProperty = property;
					value._setObserver(entity._observer);
				}

				if (replaceValue) {
					var oldValue = entity._data[propertyDef._name];
					if (oldValue !== value)  {
						if (oldValue && oldValue.isDataPipeWrapper) {
							oldValue = oldValue.value;
						}
						if (oldValue instanceof dorado.Entity || oldValue instanceof dorado.EntityList) {
							oldValue.parent = null;
							oldValue.timestamp = dorado.Core.getTimestamp();
							oldValue._setObserver(null);
						}

						entity._data[propertyDef._name] = value;
					}
					
					var eventArg = {};
					if (value instanceof dorado.Entity) {
						eventArg.entity = value;
						dataType.fireEvent("onEntityLoad", dataType, eventArg);
					}
					else if (value instanceof dorado.EntityList) {
						var elementDataType = dataType.get("elementDataType");
						if (elementDataType) {
							for (var it = value.iterator(); it.hasNext();) {
								eventArg.entity = it.next();
								elementDataType.fireEvent("onEntityLoad", dataType, eventArg);
							}
						}
					}
				}
				return value;
			}
			
			var value = this._data[property], invokeCallback = true;
			if (value === undefined) {
				if (propertyDef) {
					var dataPipeWrapper = null;
					if (loadMode != "never" && propertyDef.getDataPipe) {
						var pipe;
						if (propertyDef instanceof dorado.Reference) {
							if (this.state != dorado.Entity.STATE_NEW || propertyDef._activeOnNewEntity) {
								pipe = propertyDef.getDataPipe(this);
							}
						} else {
							pipe = propertyDef.getDataPipe(this);
						}
						if (pipe) {
							var eventArg = {
								entity : this,
								property: property,
								pageNo: 1
							};
							propertyDef.fireEvent("beforeLoadData", propertyDef, eventArg);
							if (eventArg.processDefault === false) {
								if (callback) $callback(callback, false);
								return;
							}

							if (callback || loadMode == "auto") {
								var isNewPipe = (pipe.runningProcNum == 0);
								pipe.getAsync({
									scope : this,
									callback: function(success, result) {
										var dummyData = this._data[property], dummyValue;
										if (dummyData.isDataPipeWrapper) {
											dummyValue = dummyData.value;
										}
										this._data[property] = dummyValue || null;

										if (isNewPipe) {
											this.sendMessage(dorado.Entity._MESSAGE_LOADING_END, eventArg);
										}
												
										if (success) {
											eventArg.data = result;

											if (isNewPipe) {
												if (result === null &&
													(dummyValue instanceof dorado.EntityList || dummyValue instanceof dorado.Entity) &&
													dummyValue.isNull) {
													if (dummyData.isDataPipeWrapper) {
														result =  this._data[property];
													}
												}
												else {
													result = transferAndReplaceIf(this, propertyDef, result, true);
												}

												propertyDef.fireEvent("onLoadData", propertyDef, eventArg);
											}

											this.sendMessage(dorado.Entity._MESSAGE_DATA_CHANGED, {
												entity: this,
												property: property,
												newValue: result
											});

											if (propertyDef.getListenerCount("onGet")) {
												eventArg = {
													entity : this,
													value : result
												};
												propertyDef.fireEvent("onGet", propertyDef, eventArg);
												result = eventArg.value;
											}
										}
										else if (isNewPipe) {
											this._data[property] = null;
										}
										if (callback) $callback(callback, success, result);
									}
								});
								
								this._data[property] = dataPipeWrapper = {
									isDataPipeWrapper : true,
									pipe : pipe
								};	
								if (isNewPipe) this.sendMessage(dorado.Entity._MESSAGE_LOADING_START, eventArg);
								invokeCallback = false;
							} else {
								value = pipe.get();

								eventArg.data = value;
								propertyDef.fireEvent("onLoadData", propertyDef, eventArg);

								value = transferAndReplaceIf(this, propertyDef, value, true);
							}
						}
					}

					if ((value === undefined || value === null) && dorado.Entity.ALWAYS_RETURN_VALID_ENTITY_LIST) {
						var aggregationDataType = propertyDef.get("dataType");
						if (aggregationDataType instanceof dorado.AggregationDataType) {
							value = transferAndReplaceIf(this, propertyDef, [], false);
							value.isNull = true;;
							
							if (dataPipeWrapper) {
								dataPipeWrapper.value = value;
							} else if (loadMode != "never") {
								this._data[property] = value;
							}
						}
					}
				}
			} else if (value != null && value.isDataPipeWrapper) {
				var pipe = value.pipe;
				if (loadMode != "never") {
					if (loadMode == "auto" || callback) {
						pipe.getAsync(callback);
						value = undefined;
						invokeCallback = false;
					} else {
						var shouldAbortAsyncProcedures = dorado.Setting["common.abortAsyncLoadingOnSyncLoading"];
						if (pipe.runningProcNum > 0 && !shouldAbortAsyncProcedures) {
							throw new dorado.ResourceException("dorado.data.GetDataDuringLoading", "Entity");
						}
						
						try {
							value = pipe.get();
							pipe.abort(true, value);
						} 
						catch (e) {
							pipe.abort(false, e);
							throw e;
						}
					}
				}
			} else if (propertyDef) {
				if (value === null) {
					if (dorado.Entity.ALWAYS_RETURN_VALID_ENTITY_LIST) {
						var aggregationDataType = propertyDef.get("dataType");
						if (aggregationDataType instanceof dorado.AggregationDataType) {
							value = transferAndReplaceIf(this, propertyDef, [], false);
							value.isNull = true;
							this._data[property] = value;
						}
					}
				} else {
					value = transferAndReplaceIf(this, propertyDef, value, true);
				}
			}

			if (propertyDef && propertyDef.getListenerCount("onGet")) {
				eventArg = {
					entity : this,
					value : value
				};
				propertyDef.fireEvent("onGet", propertyDef, eventArg);
				value = eventArg.value;
			}
			if (invokeCallback && callback) $callback(callback, true, value);
			return value;
		},
		
		/**
		 * 根据名称返回某属性对应的PropertyDef。
		 * 
		 * @param {String}
		 *            property
		 * @return {dorado.PropertyDef} 得到的属性值。
		 */
		getPropertyDef: function(property) {
			var propertyDef = null;
			if (this._propertyDefs) {
				propertyDef = this._propertyDefs.get(property);
				if (!propertyDef && !this.acceptUnknownProperty) {
					throw new dorado.ResourceException("dorado.data.UnknownProperty", property);
				}
			}
			return propertyDef;
		},
		
		/**
		 * 获取属性值。
		 * <p>
		 * 此方法还支持迭代式的属性读取，及通过"."来分割一组属性名，交由此方法一层层向下挖掘并返回最终结果。<br>
		 * 当进行迭代式的读取时，系统会自动判断前一个属性返回的对象是dorado.Entity的派生类还是普通JSON对象，并藉此决定如何进一步执行读取操作。
		 * </p>
		 * 
		 * @param {String}
		 *            property 要获取的属性名。
		 * @param {String}
		 *            [loadMode="always"] 数据装载模式。<br>
		 *            包含下列三种取值:
		 *            <ul>
		 *            <li>always - 如果有需要总是装载尚未装载的延时数据。</li>
		 *            <li>auto - 如果有需要则自动启动异步的数据装载过程，但对于本次方法调用将返回数据的当前值。</li>
		 *            <li>never - 不会激活数据装载过程，直接返回数据的当前值。</li>
		 *            </ul>
		 * @return {Object} 得到的属性值。
		 */
		get: function(property, loadMode) {
			loadMode = loadMode || "always";
			var result;
			if (this.ignorePropertyPath) {
				var propertyDef = this.getPropertyDef(property);
				result = this._get(property, propertyDef, null, loadMode);
			} else {
				var properties = property.split('.');
				for (var i = 0; i < properties.length; i++) {
					property = properties[i];
					if (i == 0) {
						var propertyDef = this.getPropertyDef(property);
						result = this._get(property, propertyDef, null, loadMode);
					} else {
						if (!result) break;
						result = (result instanceof dorado.Entity) ? result.get(property) : result[property];
					}
				}
			}
			return result;
		},
		
		/**
		 * 以异步操作的方式获取属性值。
		 * <p>
		 * 此方法还支持迭代式的属性读取，及通过"."来分割一组属性名，交由此方法一层层向下挖掘并返回最终结果。<br>
		 * 当进行迭代式的读取时，系统会自动判断前一个属性返回的对象是dorado.Entity的派生类还是普通JSON对象，并藉此决定如何进一步执行读取操作。
		 * </p>
		 * 
		 * @param {String}
		 *            property 要获取的属性名。
		 * @param {Function|dorado.Callback}
		 *            callback 回调对象，传入回调对象的参数即为得到的属性值。
		 * @param {String}
		 *            [loadMode="always"] 数据装载模式。<br>
		 *            包含下列三种取值:
		 *            <ul>
		 *            <li>always - 如果有需要总是装载尚未装载的延时数据。</li>
		 *            <li>auto - 对于异步操作而言此选项没有实际意义，系统内部的处理方法将与always完全一致。</li>
		 *            <li>never - 不会激活数据装载过程，直接返回数据的当前值。</li>
		 *            </ul>
		 */
		getAsync: function(property, callback, loadMode) {

			function _getAsync(entity, property, callback, loadMode) {
				var i = property.indexOf('.');
				if (i > 0 && !entity.ignorePropertyPath) {
					var p1 = property.substring(0, i);
					var p2 = property.substring(i + 1);
					if ( entity instanceof dorado.Entity) {
						entity.getAsync(p1, {
							callback: function(success, result) {
								if (success && result && ( result instanceof Object)) {
									_getAsync(result, p2, callback, loadMode);
								} else {
									$callback(callback, success, result);
								}
							}
						}, loadMode);
					} else {
						var subEntity = entity[p1];
						if (subEntity && ( subEntity instanceof Object)) {
							_getAsync(subEntity, p2, callback, loadMode);
						}
					}
				} else {
					if ( entity instanceof dorado.Entity) {
						entity._get(property, entity.getPropertyDef(property), callback, loadMode);
					} else {
						var result = entity[property];
						$callback(callback, true, result);
					}
				}
			}

			loadMode = loadMode || "always";
			_getAsync(this, property, callback || dorado._NULL_FUNCTION, loadMode);
		},
		
		doGetText: function(property, callback, loadMode) {
			function toText(value, propertyDef) {
				var text;
				if (propertyDef) {
					var dataType = propertyDef.get("dataType");
					text = (dataType || dorado.$String).toText(value, propertyDef._displayFormat);
					if (text && propertyDef._mapping)
						text = propertyDef.getMappedValue(text) || "";
				} else {
					text = dorado.$String.toText(value);
				}
				return text;
			}

			var propertyDef = this.getPropertyDef(property);
			if (callback) {
				var entity = this;
				this._get(property, propertyDef, function(value) {
					var text = toText(value, propertyDef);
					if (propertyDef && propertyDef.getListenerCount("onGetText")) {
						eventArg = {
							entity : entity,
							text : text
						};
						propertyDef.fireEvent("onGetText", propertyDef, eventArg);
						text = eventArg.text;
					}
					$callback(callback, true, text);
				}, loadMode);
			} else {
				var value = this._get(property, propertyDef, null, loadMode);
				var text = toText(value, propertyDef);
				if (propertyDef && propertyDef.getListenerCount("onGetText")) {
					eventArg = {
						entity : this,
						text : text
					};
					propertyDef.fireEvent("onGetText", propertyDef, eventArg);
					text = eventArg.text;
				}
				return text;
			}
		},
		
		/**
		 * 获取属性的文本值。
		 * <p>
		 * 该值可用于界面显示，例如：对于一个日期类型属性，是此方法可以得到经格式化处理之后的日期字符串。 具体的格式化方式由相应{@link dorado.PropertyDef}中的displayFormat属性决定。
		 * </p>
		 * 
		 * @param {String}
		 *            property 要获取的属性名。
		 * @param {String}
		 *            [loadMode="always"] 数据装载模式。<br>
		 *            包含下列三种取值:
		 *            <ul>
		 *            <li>always - 如果有需要总是装载尚未装载的延时数据。</li>
		 *            <li>auto - 如果有需要则自动启动异步的数据装载过程，但对于本次方法调用将返回数据的当前值。</li>
		 *            <li>never - 不会激活数据装载过程，直接返回数据的当前值。</li>
		 *            </ul>
		 * @return {String} 属性的文本值。
		 */
		getText: function(property, loadMode) {
			loadMode = loadMode || "always";
			var result;
			if (this.ignorePropertyPath) {
				result = this.doGetText(property, null, loadMode);
			} else {
				var properties = property.split('.'), result = this;
				for (var i = 0; i < properties.length; i++) {
					property = properties[i];
					if (i == (properties.length - 1)) {
						result = result.doGetText(property, null, loadMode);
					} else {
						result = (result instanceof dorado.Entity) ? result.get(property) : result[property];
					}
					if (result == null) break;
				}
			}
			return result;
		},
		
		/**
		 * 以异步方式获取属性的文本值。
		 * 
		 * @param {String}
		 *            property 要获取的属性名。
		 * @param {Function|dorado.Callback}
		 *            callback 回调对象，传入回调对象的参数即为得到的属性的文本值。
		 * @param {String}
		 *            [loadMode="always"] 数据装载模式。<br>
		 *            包含下列三种取值:
		 *            <ul>
		 *            <li>always - 如果有需要总是装载尚未装载的延时数据。</li>
		 *            <li>auto - 对于异步操作而言此选项没有实际意义，系统内部的处理方法将与always完全一致。</li>
		 *            <li>never - 不会激活数据装载过程，直接返回数据的当前值。</li>
		 *            </ul>
		 * @see dorado.Entity#getText
		 */
		getTextAsync: function(property, callback, loadMode) {

			function _getTextAsync(entity, property, callback, loadMode) {
				var i = property.indexOf('.');
				if (i > 0 && !entity.ignorePropertyPath) {
					var p1 = property.substring(0, i);
					var p2 = property.substring(i + 1);
					if ( entity instanceof dorado.Entity) {
						entity.getAsync(p1, {
							callback: function(success, result) {
								if (success && result && ( result instanceof Object)) {
                                    _getTextAsync(result, p2, callback, loadMode);
								} else {
									$callback(callback, success, result);
								}
							}
						}, loadMode);
					} else {
						var subEntity = entity[p1];
						if (subEntity && ( subEntity instanceof Object)) {
							_getTextAsync(subEntity, p2, callback, loadMode);
						}
					}
				} else {
					if ( entity instanceof dorado.Entity) {
						entity.doGetText(property, callback, loadMode);
					} else {
						var result = entity[property];
						$callback(callback, true, result);
					}
				}
			}

			loadMode = loadMode || "always";
			_getTextAsync(this, property, callback || dorado._NULL_FUNCTION, loadMode);
		},
		
		storeOldData: function() {
			if (this._oldData) return;
			var data = this._data, oldData = this._oldData = {};
			for(var p in data) {
				if (data.hasOwnProperty(p)) {
					var value = data[p];
					if (value != null && value.isDataPipeWrapper) continue;
					oldData[p] = value;
				}
			}
		},
		
		_validateProperty: function(dataType, propertyDef, propertyInfo, value, preformAsyncValidator) {
			var messages = [], property = propertyDef._name, validating, propertyDataType = propertyDef.get("dataType");
			if (propertyDef._required && !dataType._validatorsDisabled) {
				var hasRequiredValidator = false;
				if (propertyDef._validators) {
					for (var i = 0; i < propertyDef._validators.length; i++) {
						if (propertyDef._validators[i] instanceof dorado.validator.RequiredValidator) {
							hasRequiredValidator = true;
							break;
						}
					}
				}
				
				if (!hasRequiredValidator) {
					var v = value;
					if (typeof value == "string") v = jQuery.trim(v);
					var blank = false;				
					if (v === undefined || v === null || v === "") {
						if (propertyDataType && propertyDataType._code == dorado.DataType.STRING) {
							blank = !v;
						}
						else {
							blank = true;
						}
					}
					else if (v instanceof dorado.EntityList && propertyDataType instanceof dorado.AggregationDataType) {
						blank = !v.entityCount;
					}
					
					if (blank) {
						messages.push({
							state: "error",
							text: $resource("dorado.data.ErrorContentRequired")
						});
					}
				}
			}

			if (propertyDef._mapping && value !== undefined && value !== null && value !== "") {
				var mappedValue = propertyDef.getMappedValue(value);
				if (!propertyDef._acceptUnknownMapKey && mappedValue === undefined) {
					messages.push({
						state: "error",
						text: $resource("dorado.data.UnknownMapKey", value)
					});
				}
			}
			
			if (propertyDef._validators && !dataType._validatorsDisabled) {
				var entity = this, currentValue = value, validateArg = {
					property: property,
					entity: entity
				}, oldData = this._oldData;
				
				var valueForValidator = entity.get(property, "never");
				propertyInfo.validating = propertyInfo.validating || 0;
				for (var i = 0; i < propertyDef._validators.length; i++) {
					var validator = propertyDef._validators[i];
					if (!validator._revalidateOldValue && oldData && currentValue == oldData[property]) {
						continue;
					}
					
					if (validator instanceof dorado.validator.RemoteValidator && validator._async && preformAsyncValidator) {
						propertyInfo.validating++;
						validator.validate(valueForValidator, validateArg, {
							callback: function(success, result) {
								if (propertyInfo.validating <= 0) return;
								
								propertyInfo.validating--;
								if (propertyInfo.validating <= 0) {
									propertyInfo.validating = 0;
									propertyInfo.validated = true;
								}
								
								if (success) {
									if (entity._data[property] != currentValue) return;
									
									var originMessages = propertyInfo.messages;
									var messages = dorado.Toolkits.trimMessages(result, DEFAULT_VALIDATION_RESULT_STATE);
									if (originMessages) {
										messages = originMessages.concat(messages);
									}
									entity.doSetMessages(property, messages);
								}
								
								if (entity._data[property] == currentValue) {
									entity.sendMessage(dorado.Entity._MESSAGE_DATA_CHANGED, {
										entity: entity,
										property: property
									});
								}
							}
						});
					} else {
						var msgs = validator.validate(valueForValidator, validateArg);
						if (msgs) {
							messages = messages.concat(msgs);
							var state = dorado.Toolkits.getTopMessageState(msgs);
							var acceptState = dataType.get("acceptValidationState");
							if (STATE_CODE[state || "info"] > STATE_CODE[acceptState || "ok"]) {
								asyncValidateActions = [];
								break;
							}
						}
					}
				}
			}
			
			this.doSetMessages(property, messages);
			
			if (!propertyInfo.validating) {
				propertyInfo.validated = true;
			}
			return messages;
		},
		
		_set: function(property, value, propertyDef) {
			var oldValue = this._data[property];
			if (oldValue && oldValue instanceof dorado.Entity && value && !(value instanceof dorado.Entity) && typeof value == "object") {
				oldValue.set(value);
				return;
			}
			
			var eventArg = {
				entity : this,
				property : property,
				oldValue : oldValue,
				newValue : value,
				processDefault : true
			};

			var dataType = this.dataType;
			if (dataType && !this.disableEvents && dataType.fireEvent("beforeDataChange", dataType, eventArg)) {
				value = eventArg.newValue;
			}
			if (!eventArg.processDefault) return;

			// 保存原始值
			if (this.state == dorado.Entity.STATE_NONE) this.storeOldData();

			if (oldValue && oldValue.isDataPipeWrapper) oldValue = oldValue.value;
			if (oldValue instanceof dorado.Entity || oldValue instanceof dorado.EntityList) {
				oldValue.parent = null;
				oldValue.timestamp = dorado.Core.getTimestamp();
				oldValue._setObserver(null);
			}

			var propertyInfoMap = this._propertyInfoMap, propertyInfo = propertyInfoMap[property];
			if (!propertyInfo) propertyInfoMap[property] = propertyInfo = {};

			if (value instanceof dorado.Entity || value instanceof dorado.EntityList) {
				if (value.parent != null) {
					throw new dorado.ResourceException("dorado.data.ValueNotFree", (( value instanceof dorado.Entity) ? "Entity" : "EntityList"));
				}
				value.parent = this;
				value.timestamp = dorado.Core.getTimestamp();
				value.parentProperty = property;
				value._setObserver(this._observer);

				propertyInfo.isDirty = true;
			} else {
				var ov = this._oldData ? this._oldData[property] : oldValue;
				propertyInfo.isDirty = (ov != value);
				
				if (value && typeof value == "object" && value.$state === undefined && propertyDef && propertyDef.get("dataType") instanceof dorado.EntityDataType) {
					value = dorado.Object.apply({
						$state: dorado.Entity.STATE_NEW
					}, value);
				}
			}

			eventArg.value = value;
			if (propertyDef && propertyDef.getListenerCount("onSet")) {
				propertyDef.fireEvent("onSet", propertyDef, eventArg);
				value = eventArg.value;
			}

			this._data[property] = value;
			this.timestamp = dorado.Core.getTimestamp();

			if (property.charAt(0) != '$') {
				var messages;
				if (propertyDef) {
					messages = this._validateProperty(dataType, propertyDef, propertyInfo, value, true);
				}
				else {
					messages = null;
				}

				if (!(messages && messages.length) && !propertyInfo.validating) {
					messages = [{
						state : "ok"
					}];
				}
				this.doSetMessages(property, messages);				

				if (this.state == dorado.Entity.STATE_NONE) {
					this.setState(dorado.Entity.STATE_MODIFIED);
				}
			}

			if (dataType && !this.disableEvents) dataType.fireEvent("onDataChange", dataType, eventArg);
			this.sendMessage(dorado.Entity._MESSAGE_DATA_CHANGED, eventArg);
		},
		
		_dispatchOperationToSubEntity: function(property, create, method, args) {
			var i = property.indexOf('.');
			var property1 = property.substring(0, i), property2 = property.substring(i + 1);
			var subEntity = this.get(property1);
			if (subEntity == null && create) subEntity = this.createChild(property1);
			if (subEntity != null) {
				return subEntity[method].apply(subEntity, [property2].concat(args));
			}
		},
		
		/**
		 * 设置属性值。
		 * 
		 * @param {String}
		 *            property 此参数具有下列两种设置方式：
		 *            <ul>
		 *            <li>当property为String时，系统会将property的作为要设置属性名处理。属性值为value参数代表的值。</li>
		 *            <li>
		 *            当property为Object时，系统会将忽略value参数。此时，可以通过attr参数的JSON对象定义一组要设置的属性值。
		 *            <p>
		 *            在此种使用方法中，有一种情况需要注意。见下面的这种代码：
		 * 
		 * <pre class="symbol-example code">
		 * 	<code class="javascript">
		 * employee.set({
		 * 	name : &quot;John&quot;,
		 * 	contact : {
		 * 		mobile : &quot;253466-436&quot;,
		 * 		msn : &quot;asgee@xmail.com&quot;
		 * 	}
		 * });
		 * </code>
		 * 	</pre>
		 * 
		 * <ul>
		 *            <li>
		 *            如果当前employee的contact属性为null，那么Dorado会自动添加一个新的Contact实体，并设置好其中的mobile和msn这两个子属性的值。
		 *            完成后，子Contact对象的状态将是NEW。 </li>
		 *            <li>
		 *            如果当前employee的contact属性不为null，那么Dorado会直接修改这个已存在的Contact实体的mobile和msn这两个子属性的值。
		 *            完成后，子Contact对象的状态将是MODIFIED或NEW。 </li>
		 *            </ul>
		 *            </p>
		 *            </li>
		 *            </ul>
		 * @param {Object}
		 *            value 要设置的属性值。
		 * @return
		 */
		set: function(property, value) {
			
			function doSet(entity, property, value) {
				if (!entity.ignorePropertyPath && property.indexOf('.') > 0) {
					entity._dispatchOperationToSubEntity(property, true, "set", [value]);
				} else {
					var propertyDef = entity.getPropertyDef(property);
					if (propertyDef) {
						var dataType = propertyDef.get("dataType");
						if (dataType) {
							value = dataType.parse(value, propertyDef._typeFormat);
						}
					}
					entity._set(property, value, propertyDef);
				}
			}
			
			if (property.constructor != String) {
				this.disableObservers();
				try {
					for (var p in property) {
						if (property.hasOwnProperty(p)) {
							doSet(this, p, property[p]);
						}
					}
				}
				finally {
					this.enableObservers();
					this.sendMessage(dorado.Entity._MESSAGE_REFRESH_ENTITY, {
						entity: this
					});
				}
			}
			else {
				doSet(this, property, value);
			}
			return this;
		},
		
		/**
		 * 以文本方式设置属性的值。
		 * <p>
		 * 此处的文本值是指用于界面显示的文本，例如：对于一个日期类型属性，通过此方法设置时应传入与displayFormat属性匹配的日期格式文本。
		 * </p>
		 * 
		 * @param {String}
		 *            property 要设置的属性名。
		 * @param {String}
		 *            text 要设置的属性值。
		 */
		setText: function(property, text) {
			if (!this.ignorePropertyPath && property.indexOf('.') > 0) {
				this._dispatchOperationToSubEntity(property, true, "setText", [text]);
			} else {
				var propertyDef = this.getPropertyDef(property), value = text;
				if (propertyDef) {
					if (propertyDef._mapping && text != null) {
						value = propertyDef.getMappedKey(text);
						if (value === undefined) value = text;
					}
					var dataType = propertyDef.get("dataType");
					if (dataType) value = dataType.parse(value, propertyDef._displayFormat);
				}
				this._set(property, value, propertyDef);
			}
		},
		
		/**
		 * 取消对当前数据实体的各种数据操作。
		 * <ul>
		 * <li>如果此数据实体的状态是dorado.Entity.STATE_NEW，那么此操作将会删除此数据实体。</li>
		 * <li>如果此数据实体的状态是dorado.Entity.STATE_MODIFIED，那么此操作将会还原数据实体中的数据，并重置状态。</li>
		 * <li>如果此数据实体的状态是dorado.Entity.STATE_DELETE，那么此操作将会还原数据实体，并重置状态。</li>
		 * <li>如果此数据实体的状态是dorado.Entity.STATE_NONE，那么什么都不会发生。</li>
		 * <li>如果此数据实体的状态是dorado.Entity.STATE_MOVED，那么此操作将会还原数据实体，但不会重置状态。</li>
		 * </ul>
		 * 
		 * @param {boolean}
		 *            deep 是否执行深度撤销。即一并撤销所有子实体（包括子实体中的子实体）的修改。
		 */
		cancel: function(deep) {
			
			function deepCancel(entity) {
				var data = entity._data;
				for(var p in data) {
					if (data.hasOwnProperty(p)) {
						var value = data[p];
						if (value && (value instanceof dorado.Entity || value instanceof dorado.EntityList)) {
							value.cancel(true);
						}
					}
				}
			}
			
			if (this.state == dorado.Entity.STATE_NEW) {
				this.remove();
			} else if (this.state != dorado.Entity.STATE_NONE) {
				var data = this._data, oldData = this._oldData;
				if (oldData) {
					for (var p in data) {
						if (data.hasOwnProperty(p)) {
							var value = data[p];
							if (value != null && value.isDataPipeWrapper) continue;
							delete data[p];
						}
					}
					for (var p in oldData) {
						if (oldData.hasOwnProperty(p)) {
							data[p] = oldData[p];
						}
					}
				}
				
				var oldState = this.state;
				
				if (deep) deepCancel(this);
				
				if (oldState != dorado.Entity.STATE_MOVED) this.resetState();
				if (oldState == dorado.Entity.STATE_DELETED && this.parent && this.parent instanceof dorado.EntityList) {
					var entityList = this.parent;
					if (entityList.current == null) {
						entityList.disableObservers();
						entityList.setCurrent(this);
						entityList.enableObservers();
					}
				}
				this.sendMessage(0);
			} else if (deep) {
				deepCancel(this);
			}
		},
		
		resetState: function() {
			this._propertyInfoMap = {};
			delete this._messages;
			delete this._messageState;
			this.setState(dorado.Entity.STATE_NONE);
			delete this._oldData;
		},
		
		/**
		 * 重设实体对象。
		 * <p>
		 * 此方法不会改变Entity的状态。但会重置那些通过引用属性(ReferencePropertyDef)装载的关联数据，引起这些关联数据的重新装载。
		 * </p>
		 * 
		 * @param {String}
		 *            [property] 要重置的引用属性的属性名。如果需要定义多个，可以用“,”分隔。
		 */
		reset: function(property) {
			var data = this._data;
			if (property) {
				var props = property.split(',');
				for (var i = 0; i < props.length; i++) {
					var prop = props[i];
					if (data[prop] != undefined) {
						var propertyDef = (this._propertyDefs) ? this._propertyDefs.get(prop) : null;
						if (propertyDef && propertyDef instanceof dorado.Reference) {
							var oldValue = data[prop];
							if (oldValue instanceof dorado.Entity || oldValue instanceof dorado.EntityList) {
								oldValue.parent = null;
								oldValue.timestamp = dorado.Core.getTimestamp();
								oldValue._setObserver(null);
							}
							delete data[prop];
						}
					}

					this.doSetMessages(prop, null);

					var propertyInfo = this._propertyInfoMap[prop];
					delete propertyInfo.validating;
					delete propertyInfo.validated;
				}
				this.timestamp = dorado.Core.getTimestamp();
			} else {
				this._propertyDefs.each(function(propertyDef) {
					if (propertyDef instanceof dorado.Reference) {
						var oldValue = data[propertyDef._name];
						if (oldValue instanceof dorado.Entity || oldValue instanceof dorado.EntityList) {
							oldValue.parent = null;
							oldValue.timestamp = dorado.Core.getTimestamp();
							oldValue._setObserver(null);
						}
						delete data[propertyDef._name];
					}
				});

				this._propertyInfoMap = {};
				delete this._messages;
				delete this._messageState;
			}
			this.sendMessage(0);
		},
		
		/**
		 * 创建并返回一个兄弟实体对象。即创建一个与本实体对象相同类型的新实体对象。
		 * 
		 * @param {Object|dorado.Entity}
		 *            [data] 新创建的实体对象要封装JSON数据对象，可以不指定此参数。
		 * @param {boolean}
		 *            [detached] 是否需要返回一个游离的实体对象。
		 *            如果本实体对象已经隶属于一个实体集合，那么默认情况下此方法会将新创建的实体对象追加到该集合中。
		 *            通过detached参数可以指定本方法不将新的实体对象追加到集合；<br>
		 *            如果本实体对象不隶属于实体集合，那么detached参数将没有实际作用，新的实体对象将总是游离的。
		 * @return {dorado.Entity} 新创建的实体对象。
		 */
		createBrother: function(data, detached) {
			if (data instanceof dorado.Entity) data = data.getData();
			
			var brother = new dorado.Entity(null, this.dataTypeRepository, this.dataType);
			if (data) brother.set(data);
			if (!detached && this.parent instanceof dorado.EntityList) {
				this.parent.insert(brother);
			}
			return brother;
		},
		
		/**
		 * 创建并返回一个子实体对象。
		 * 
		 * @param {String}
		 *            property 子实体对象对应的属性名。
		 * @param {Object|dorado.Entity}
		 *            [data] 新创建的实体对象要封装JSON数据对象，可以不指定此参数。
		 * @param {boolean}
		 *            [detached] 是否需要返回一个游离的实体对象。
		 *            默认情况下，新创建的子实体对象会直接被设置到本实体对象的属性中。
		 *            通过detached参数可以指定本方法不将新的子实体对象附着到本实体对象中。<br>
		 *            需要注意的是，如果子属性的数据类型为集合类型({@link dorado.AggregationDataType})。
		 *            那么，新创建的子实体对象会被追加到该属性对应的实体集合中。如果属性的值为空，则测方法还会自动为该属性创建一个匹配的实体集合。
		 * @return {dorado.Entity} 新创建的实体对象。
		 */
		createChild: function(property, data, detached) {
			if (data instanceof dorado.Entity) data = data.getData();
			
			var child = null;
			if (this.dataType) {
				var propertyDef = this.getPropertyDef(property);
				if (!propertyDef) {
					throw new dorado.ResourceException("dorado.data.UnknownProperty", property);
				}
				var elementDataType = propertyDef.get("dataType"), aggregationDataType;
				if (elementDataType && elementDataType instanceof dorado.AggregationDataType) {
					aggregationDataType = elementDataType;
					elementDataType = elementDataType.getElementDataType();
				}
				if (elementDataType && !( elementDataType instanceof dorado.EntityDataType)) {
					throw new ResourceException("dorado.data.EntityPropertyExpected", property);
				}
				child = new dorado.Entity(null, this.dataTypeRepository, elementDataType);
				if (data) child.set(data);
				if (!detached) {
					if (aggregationDataType) {
						var list = this._get(property, propertyDef);
						list.insert(child);
					} else {
						this._set(property, child, propertyDef);
					}
				}
			} else {
				child = new dorado.Entity();
				if (data) child.set(data);
				if (!detached) {
					var oldChild = this.get(property);
					if (oldChild instanceof dorado.EntityList) {
						oldChild.insert(child);
					} else if (oldChild instanceof Array) {
						oldChild.push(child);
					} else {
						this.set(property, child);
					}
				}
			}
			return child;
		},
		
		/**
		 * 返回与当前数据实体平级的前一个数据实体。
		 * <p>
		 * 注意：此方法不会导致集合的自动装载动作。如果本数据实体不在某个实体集合中,那么此方法将直接返回null。
		 * </p>
		 * 
		 * @return {dorado.Entity} 前一个数据实体。
		 */
		getPrevious: function() {
			var entityList = this.parent;
			if (!entityList || !(entityList instanceof dorado.EntityList)) return null;
			
			var page = this.page;
			var entry = page.findEntry(this);
			entry = entityList._findPreviousEntry(entry);
			return (entry) ? entry.data : null;
		},
		
		/**
		 * 返回与当前数据实体平级的下一个数据实体。
		 * <p>
		 * 注意：此方法不会导致集合的自动装载动作。如果本数据实体不在某个实体集合中,那么此方法将直接返回null。
		 * </p>
		 * 
		 * @return {dorado.Entity} 下一个数据实体。
		 */
		getNext: function() {
			var entityList = this.parent;
			if (!entityList || !(entityList instanceof dorado.EntityList)) return null;
			
			var page = this.page;
			var entry = page.findEntry(this);
			entry = entityList._findNextEntry(entry);
			return (entry) ? entry.data : null;
		},
		
		/**
		 * 将此数据实体设置为其目前所在的实体集合中的当前实体。
		 * <p>
		 * <b>一个数据实体某一时刻最多只能隶属于一个实体集合。</b><br>
		 * 如果此数据实体目前不属于任何实体集合，则此方法什么也不做。
		 * </p>
		 * 
		 * @param {boolean}
		 *            [cascade] 是否同时要将此数据实体之上的每一级父对象都设置为当前数据实体。
		 * @see dorado.EntityList#setCurrent
		 */
		setCurrent: function(cascade) {
			var parentEntity;
			if (this.parent instanceof dorado.EntityList) {
				this.parent.setCurrent(this);
				parentEntity = this.parent.parent;
			} else {
				parentEntity = this.parent;
			}
			
			if (cascade && parentEntity && parentEntity instanceof dorado.Entity) {
				parentEntity.setCurrent(true);
			}
		},
		
		/**
		 * 清空本数据实体中所有的数据。
		 */
		clearData: function() {
			var data = this._data;
			for(var property in data) {
				if (!data.hasOwnProperty(property)) continue;
				delete data[property];
			}
			this.timestamp = dorado.Core.getTimestamp();
			this.sendMessage(0);
		},
		
		/**
		 * 将给定的JSON对象中的数据转换成为数据实体。
		 * 
		 * @param {Object}
		 *            json 要转换的JSON对象。
		 */
		fromJSON: function(json) {
			if (this.dataType) json.$dataType = this.dataType._id;
			this._data = json;
			delete this._oldData;
			this.state = dorado.Entity.STATE_NONE;
			this.timestamp = dorado.Core.getTimestamp();
			this.sendMessage(0);
		},
		
		/**
		 * 将实体对象转换成一个JSON数据对象。
		 * 
		 * @param {Object}
		 *            [options] 转换选项。
		 * @param {String[]}
		 *            [options.properties]
		 *            属性名数组，表示只转换该数组中列举过的属性。如果不指定此属性表示转换实体对象中的所有属性。
		 * @param {boolean}
		 *            [options.includeUnsubmittableProperties=true]
		 *            是否转换实体对象中那么submittable=false的属性（见{@link dorado.PropertyDef#attribute:submittable}）。默认按true进行处理。
		 * @param {boolean}
		 *            [options.includeReferenceProperties=true] 是否转换实体对象中{@link dorado.Reference}类型的属性。默认按true进行处理。
		 * @param {String}
		 *            [options.loadMode="never"]
		 *            数据装载模式，此属性仅在options.includeReferenceProperties=true为true时有效。<br>
		 *            包含下列三种取值:
		 *            <ul>
		 *            <li>always - 如果有需要总是装载尚未装载的延时数据。</li>
		 *            <li>auto - 如果有需要则自动启动异步的数据装载过程，但对于本次方法调用将返回数据的当前值。</li>
		 *            <li>never - 不会激活数据装载过程，直接返回数据的当前值。</li>
		 *            </ul>
		 * @param {boolean}
		 *            [options.includeUnloadPage=true] 是否转换{@link dorado.EntityList}中尚未装载的页中的数据。
		 *            此属性对于{@link dorado.Entity}的toJSON而言是没有意义的，但是由于options参数会自动被传递到实体对象内部{@link dorado.EntityList}的toJSON方法中，
		 *            因此它会影响内部{@link dorado.EntityList}的处理过程。 默认按true进行处理。
		 * @param {boolean}
		 *            [options.includeDeletedEntity] 是否转换那些被标记为"已删除"的数据实体。 此属性对于{@link dorado.Entity}的toJSON而言是没有意义的，但是由于options参数会自动被传递到实体对象内部{@link dorado.EntityList}的toJSON方法中，
		 *            因此它会影响内部{@link dorado.EntityList}的处理过程。 默认按false进行处理。
		 * @param {boolean}
		 *            [options.simplePropertyOnly] 是否只生成简单类型的属性到JSON中。
		 * @param {boolean}
		 *            [options.generateDataType]
		 *            是否在JSON对象中生成DataType信息，生成的DataType信息将被放置在名为$dataType的特殊子属性中。
		 *            注意：此属性的只对顶层JSON对象有效，即此方法永远不会为子JSON对象生成DataType信息。
		 * @param {boolean}
		 *            [options.generateState]
		 *            是否在JSON对象中生成实体对象的状态信息(即新增、已更改等状态)，生成的状态信息将被放置在名为$state的特殊子属性中。
		 * @param {boolean}
		 *            [options.generateEntityId]
		 *            是否在JSON对象中生成实体对象的ID，生成的状态信息将被放置在名为$entityId的特殊子属性中。
		 * @param {boolean}
		 *            [options.generateOldData]
		 *            是否在JSON对象中生成旧数据，生成的状态信息将被放置在名为$oldData的特殊子属性中。
		 * @param {Function}
		 *            [options.entityFilter]
		 *            用户自定义的数据实体过滤函数，返回true/false表示是否需要将此当前数据实体转换到JSON中。
		 *            此函数的传入参数如下：
		 * @param {dorado.Entity}
		 *            [options.entityFilter.entity] 当前正被过滤的数据实体。
		 * @return {Object} 得到的JSON数据对象。
		 */
		toJSON: function(options, context) {
			var result = {};
			var includeUnsubmittableProperties, includeReferenceProperties, simplePropertyOnly, generateDataType, generateState, generateEntityId, generateOldData, properties, entityFilter;
			includeUnsubmittableProperties = includeReferenceProperties = true, loadMode = "never";
			simplePropertyOnly = generateDataType = generateState = generateEntityId = generateOldData = false;
			properties = entityFilter = null;
			
			if (options != null) {
				if (options.includeUnsubmittableProperties === false) includeUnsubmittableProperties = false;
				if (options.includeReferenceProperties === false) includeReferenceProperties = false;
				if (options.loadMode) loadMode = options.loadMode;
				simplePropertyOnly = options.simplePropertyOnly;
				generateDataType = options.generateDataType;
				generateState = options.generateState;
				generateEntityId = options.generateEntityId;
				generateOldData = !!(options.generateOldData && this._oldData);
				properties = options.properties;
				entityFilter = options.entityFilter;
				if (properties != null && properties.length == 0) properties = null;
			}

			var data = this._data, oldData = this._oldData, oldDataHolder;
			for(var property in data) {
				if (!data.hasOwnProperty(property)) continue;
				if (property.charAt(0) == '$') continue;
				if (properties && properties.indexOf(property) < 0) continue;
				
				var propertyDef = (this._propertyDefs) ? this._propertyDefs.get(property) : null;
				if (propertyDef && simplePropertyOnly) {
					var pdt = propertyDef.getDataType("never");
					if (pdt && (pdt instanceof dorado.EntityDataType || pdt instanceof dorado.AggregationDataType)) continue;
				}
				
				if (!includeUnsubmittableProperties && propertyDef && !propertyDef._submittable) continue;
				if (propertyDef instanceof dorado.Reference) {
					if (!includeReferenceProperties) continue;
				}
				
				var value = this._get(property, propertyDef, null, loadMode);
				if (value != null) {
					if (value instanceof dorado.Entity) {
						if (simplePropertyOnly) continue;
					
						if (!entityFilter || entityFilter(value)) {
							value = value.toJSON(options, context);
						} else {
							value = null;
						}
					} else if (value instanceof dorado.EntityList) {
						value = value.toJSON(options, context);
					}
					else if (value instanceof Object && value.isDataPipeWrapper) {
						value = undefined;
					}
				}
				if (generateOldData && propertyDef && oldData != null) {
					if (!oldDataHolder) oldDataHolder = {};
					oldDataHolder[property] = oldData[property];
				}
				
				result[property] = value;
			}

			if (generateDataType && data.$dataType) result.$dataType = data.$dataType;
			if (generateState && this.state != dorado.Entity.STATE_NONE) result.$state = this.state;
			if (generateEntityId) result.$entityId = this.entityId;
			if (oldDataHolder) result.$oldData = oldDataHolder;

			if (context && context.entities) context.entities.push(this);
			return result;
		},
		
		/**
		 * 将实体对象转换成一个可以以类似JSON方式来读写的代理对象。
		 * 
		 * @param {Object}
		 *            [options] 转换选项。
		 * @param {boolean}
		 *            [options.textMode=false]
		 *            是否代理Entity的getText方法。该选项默认值为false，表示代理Entity的get方法。
		 * @param {boolean}
		 *            [options.readOnly=false] 是否以只读方式代理Entity。该选项默认值为false。
		 * @param {boolean}
		 *            [options.includeUnloadPage=false] 是否处理{@link dorado.EntityList}中尚未装载的页中的数据。
		 *            此属性对于{@link dorado.Entity}的getWrapper而言是没有意义的，但是由于options参数会自动被传递到实体对象内部{@link dorado.EntityList}的getWrapper方法中，
		 *            因此它会影响内部{@link dorado.EntityList}的处理过程。 默认按false进行处理。
		 * @return {Object} 得到的代理对象。
		 */
		getWrapper: function(options) {
			var wrapperType;
			if (this.acceptUnknownProperty) {
				wrapperType = function(entity, options) {
					this._entity = entity;
					this._options = options;
					this._textMode = options && options.textMode;
					this._readOnly = options && options.readOnly;
				};

				var wrapperPrototype = wrapperType.prototype;
				
				var data = this._data;
				for (var property in data) {
					if (!data.hasOwnProperty(property)) continue;

					doDefineProperty(wrapperPrototype, property);
				}
			}
			else {
				wrapperType = this.dataType.getWrapperType();
			}
			return new wrapperType(this, options);
		},
		
		getData: function() {
			return this._data;
		},
		
		/**
		 * 返回数据实体内部用于保存原有属性值的JSON对象。
		 * 
		 * @return {Object} JSON对象。<br>
		 *         注意：该对象可能并不存在。
		 */
		getOldData: function() {
			return this._oldData;
		},
		
		/**
		 * 返回当前数据实体关联的额外信息的数组。
		 * 
		 * @param {String}
		 *            [property] 属性名。
		 *            <p>
		 *            如果在调用时指定了这个参数，这表示要读取跟某个属性关联的额外信息。否则表示读取跟整个数据实体关联的额外信息。
		 *            </p>
		 * @return [Object] 额外信息的数组。数组中的每一个元素是一个JSON对象，该JSON对象包含以下属性：
		 *         <ul>
		 *         <li>state - {String}
		 *         信息级别。取值范围包括：info、ok、warn、error。默认值为error。</li>
		 *         <li>text - {String} 信息内容。</li>
		 *         </ul>
		 */
		getMessages: function(property) {
			var results;
			if (property) {
				var obj = this._propertyInfoMap[property]
				results = ((obj) ? obj.messages : null);
			} else {
				results = this._messages;
			}
			return results;
		},
		
		doSetMessages: function(property, messages) {

			function getMessageState(entity) {
				var state = null, stateCode = -1;
				if (entity._messages) {
					state = dorado.Toolkits.getTopMessageState(entity._messages);
					if (state)
						stateCode = STATE_CODE[state];
				}
				var map = entity._propertyInfoMap;
				for(var p in map) {
					var obj = map[p];
					var code = STATE_CODE[obj.state];
					if (code > stateCode) {
						stateCode = code;
						state = obj.state;
					}
				}
				return state;
			}

			var retval = false;
			if (messages === undefined) {
				messages = property;
				messages = dorado.Toolkits.trimMessages(messages, DEFAULT_VALIDATION_RESULT_STATE);
				if (this._messages == messages) return false;
				this._messages = messages;
				
				// if (dorado.Toolkits.getTopMessageState(messages) !=
				// this._messageState) {
				this._messageState = getMessageState(this);
				retval = true;
				// }
			} else {
				var map = this._propertyInfoMap;
				messages = dorado.Toolkits.trimMessages(messages, DEFAULT_VALIDATION_RESULT_STATE);
				var propertyInfo = map[property];
				if (propertyInfo && !propertyInfo.validating && propertyInfo.messages == messages) return false;
				
				var state = dorado.Toolkits.getTopMessageState(messages);
				if (!propertyInfo) map[property] = propertyInfo = {};
				propertyInfo.state = state;
				propertyInfo.messages = messages;
				
				// if (state != this._messageState || state != (propertyInfo ?
				// propertyInfo.state : null)) {
				this._messageState = getMessageState(this);
				retval = true;
				// }
			}

			var dataType = this.dataType;
			if (dataType) {
				dataType.fireEvent("onMessageChange", dataType, {
					entity : this,
					property : property,
					messages : messages
				});
			}
			return retval;
		},
		
		/**
		 * 设置当前数据实体关联的额外信息的数组。
		 * <p>
		 * 此方法有两种调用方式：
		 * <ul>
		 * <li>当我们为此方法传递一个传入参数时，表示要将传入的额外信息关联到整个数据实体上。</li>
		 * <li>当我们为此方法传递两个传入参数时，表示要将额外信息关联到数据实体的某个具体属性上。
		 * 此时第一个参数将被认为是属性名，第二个参数被认为是额外信息。</li>
		 * </ul>
		 * </p>
		 * 
		 * @param {String}
		 *            [property] 属性名。
		 * @param {String|Object|[String]|[Object]}
		 *            [messages] 额外信息。
		 *            <p>
		 *            调用此方法时，既可以传入单个的信息，也可以传入信息的数组。
		 *            对于每一个信息既可以是一个描述信息完整信息的JSON对象，也可以是一个简单的字符窜（此时系统会自动将其信息级别处理为error）。
		 *            </p>
		 */
		setMessages: function(property, messages) {
			var retval = this.doSetMessages(property, messages);
			if (retval) {
				this.timestamp = dorado.Core.getTimestamp();
				if (property) {
					this.sendMessage(dorado.Entity._MESSAGE_DATA_CHANGED, {
						entity : this,
						property : property
					});
				} else {
					this.sendMessage(0);
				}
			}
			return retval;
		},
		
		/**
		 * 返回当前数据实体中最高的信息级别。即系统认为error高于warn高于ok高于info。
		 * 
		 * @param {String}
		 *            [property] 属性名。
		 *            <p>
		 *            如果在调用时指定了这个参数，这表示要返回跟某个属性的最高信息级别。否则表示读取跟整个数据实体关联的最高信息级别。
		 *            </p>
		 * @return {String} 最高的验证信息级别。取值包括: error、warn、ok、info。
		 */
		getMessageState: function(property) {
			if (property) {
				var map = this._propertyInfoMap;
				return map[property] ? map[property].state : null;
			} else {
				return this._messageState;
			}
		},
		
		/**
		 * 返回数据实体中某属性校验状态。
		 * 
		 * @param {Object}
		 *            property 属性名。
		 * @return {String} 校验状态。取值包括:
		 *         <ul>
		 *         <li>unvalidate - 尚未校验。</li>
		 *         <li>validating - 正在校验，指正有异步的校验过程仍未结束。</li>
		 *         <li>ok - 校验通过。</li>
		 *         <li>warn - 校验的返回信息中包含警告。</li>
		 *         <li>error - 校验未通过或校验失败。</li>
		 *         </ul>
		 */
		getValidateState: function(property) {
			var state = "unvalidate", map = this._propertyInfoMap;
			if (map) {
				var propertyInfo = map[property];
				if (propertyInfo) {
					if (propertyInfo.validating) {
						state = "validating";
					} else if (propertyInfo.validated) {
						state = this.getMessageState(property);
						if (!state || state == "info")
							state = "ok";
					}
				}
			}
			return state;
		},
		
		/**
		 * 验证此数据实体中的数据当前是否是有效的，即是否可以被提交保存。
		 * <p>
		 * 关于是否有效的判断会与{@link dorado.EntityDataType#attribute:acceptValidationResult}的设置相关。
		 * </p>
		 * 
		 * @param {String|boolean|Object}
		 *            [options=true] 此参数有如下三种使用方式：
		 *            <ul>
		 *            <li>当传入一个String类型的值时，表示要校验的子属性，如果不指定则表示校验所有属性。</li>
		 *            <li>当传入一个boolean类型的值时，表示是否强制重新验证所有子属性及校验器。默认为true。</li>
		 *            <li>当传入一个JSON对象时，其中有可以包含如下的更多选项。</li>
		 *            </ul>
		 * @param {String}
		 *            [options.property] 要校验的子属性，如果不指定则表示校验所有属性。
		 * @param {boolean}
		 *            [options.force=true] 是否强制重新验证所有子属性及校验器。
		 * @param {boolean}
		 *            [options.validateSimplePropertyOnly=true]
		 *            只验证简单数据类型的属性中的数据，如String、boolean、int、Date等数据类型。
		 *            设置此属性产生的实际结果是验证逻辑将忽略对此数据实体中的所有子数据实体的有效性验证。
		 * @param {boolean}
		 *            [options.preformAsyncValidator] 是否重新执行那些异步的校验器。
		 * @param {Object}
		 *            [options.context] 验证上下文。<br>
		 *            传入此参数的目的通常是用于获得更加验证详尽的验证结果。此上下文对象中可以包含如下的返回属性：
		 *            <ul>
		 *            <li>result - {String} 验证结果。等同于此方法的返回值。</li>
		 *            <li>info - {[Object]}
		 *            包含所有info级别验证结果的数组。数组中的每一个元素是一个JSON对象，该JSON对象包含以下属性：
		 *            <ul>
		 *            <li>entity - {dorado.Entity} 相关的数据实体。</li>
		 *            <li>property - {String} 相关的数据实体属性。</li>
		 *            <li>state - {String}
		 *            信息级别。取值范围包括：info、ok、warn、error。默认值为error。</li>
		 *            <li>text - {String} 信息内容。</li>
		 *            </ul>
		 *            </li>
		 *            <li>ok - {[Object]} 包含所有ok级别验证结果的数组。同上。</li>
		 *            <li>warn - {[Object]} 包含所有warn级别验证结果的数组。同上。</li>
		 *            <li>error - {[Object]} 包含所有error级别验证结果的数组。同上。</li>
		 *            <li>executing - {[Object]}
		 *            尚未完成的异步验证过程描述信息的数组。数组中的每一个元素是一个JSON对象，该JSON对象包含以下属性：
		 *            <ul>
		 *            <li>entity - {dorado.Entity} 相关的数据实体。</li>
		 *            <li>property - {String} 相关的数据实体属性。</li>
		 *            <li>num - {int} 正在执行的验证过程的个数。</li>
		 *            </ul>
		 *            </li>
		 *            <li>executingValidationNum - {int} 总的正在执行的验证过程的个数。</li>
		 *            </ul>
		 * @return {String} 验证结果，可能会有如下3种返回值：
		 *         <ul>
		 *         <li>invalid - 表示本数据实体未通过数据验证，不能被提交。</li>
		 *         <li>ok - 表示本数据实体已通过验证，可以提交。</li>
		 *         </ul>
		 */
		validate: function(options) {
			if (typeof options == "string") {
				options = {
					property: options
				};
			}
			else if (typeof options == "boolean") {
				options = {
					force: options
				};
			}
			var property = options && options.property;
			var force = (options && options.force === false) ? false : true;
			var simplePropertyOnly =  (options && options.validateSimplePropertyOnly === false) ? false : true;
			var preformAsyncValidator = (options ? options.preformAsyncValidator : false);
			var context = options ? options.context : null;
			var result, topResult, resultCode, topResultCode = -1, hasValidated = false;
			
			if (force) {
				if (property) {
					delete this._propertyInfoMap[property];
				}
				else {
					this._propertyInfoMap = {};
					delete this._messages;
					delete this._messageState;
				}
			}

			var dataType = this.dataType, propertyInfoMap = this._propertyInfoMap;
			if (context) {
				context.info = [];
				context.ok = [];
				context.warn = [];
				context.error = [];
				context.executing = [];
				context.executingValidationNum = 0;
			}
			
			if (dataType) {
				var entity = this;
				var doValidate = function(pd) {
					var property = pd._name, propertyInfo = propertyInfoMap[property];
					if (property.charAt(0) == '$') return;
					
					if (propertyInfo) {
						if (propertyInfo.validating) {
							if (context) {
								context.executingValidationNum = (context.executingValidationNum || 0) + propertyInfo.validating;
								var executing = context.executing = context.executing || [];
								executing.push({
									entity: entity,
									property: property,
									num: propertyInfo.validating
								});
							}
							return;
						} else if (propertyInfo.validated) {
							if (context && propertyInfo.messages) {
								addMessages2Context(context, entity, property, propertyInfo.messages);
							}
							return;
						}
					} else {
						propertyInfoMap[property] = propertyInfo = {};
					}
					
					var value = entity._data[property];
					hasValidated = true;
					var messages = entity._validateProperty(dataType, pd, propertyInfo, value, preformAsyncValidator);
					if (context && messages) {
						addMessages2Context(context, entity, property, messages);
					}
				};
				
				if (property) {
					var pd = this.getPropertyDef(property);
					if (pd) doValidate(pd);
				} else {
					dataType._propertyDefs.each(doValidate);
				}
			}
			
			if (!simplePropertyOnly) {
				var data = this._data;
				var doValidateEntity = function(p) {
					var value = data[p];
					if (value instanceof dorado.Entity) {
						if (context) options.context = {};
						result = value.validate(options);
						if (context) {
							mergeValidationContexts(context, options.context);
							options.context = context;
						}
						resultCode = VALIDATION_RESULT_CODE[result];
						if (resultCode > topResultCode) {
							topResultCode = resultCode;
							topResult = result;
						}
					} else if (value instanceof dorado.EntityList) {
						var it = value.iterator();
						while (it.hasNext()) {
							if (context) options.context = {};
							result = it.next().validate(options);
							if (context) {
								mergeValidationContexts(context, options.context);
								options.context = context;
							}
							resultCode = VALIDATION_RESULT_CODE[result];
							if (resultCode > topResultCode) {
								topResultCode = resultCode;
								topResult = result;
							}
						}
					}
				};
				
				if (property) {
					doValidateEntity(property);
				} else {
					for (var p in data) {
						if (!data.hasOwnProperty(p) || p.charAt(0) == '$') continue;
						doValidateEntity(p);
					}
				}
			}
			
			state = this.getMessageState(property);
			var acceptState = dataType ? dataType.get("acceptValidationState") : null;
			if (STATE_CODE[state || "info"] <= STATE_CODE[acceptState || "ok"]) {
				result = "ok";
			} else {
				result = "invalid";
			}
			resultCode = VALIDATION_RESULT_CODE[result];
			if (resultCode > topResultCode) {
				topResultCode = resultCode;
				topResult = result;
			}
			
			if (context) context.result = topResult;
			if (hasValidated) this.sendMessage(0);
			return topResult;
		},
		
		/**
		 * 判断数据实体或数据实体中某属性中是否包含未提交的信息。
		 * @param {String} [property] 要判断的属性。如果不定义则表示希望判断整个数据实体是否包含未提交的信息。
		 * @return {boolean} 是否包含未提交的信息。
		 */
		isDirty: function(property) {
			if (this.state == dorado.Entity.STATE_NONE)
				return false;
			if (property) {
				var propertyInfo = this._propertyInfoMap[property];
				return (propertyInfo) ? propertyInfo.isDirty : false;
			} else {
				return this.state != dorado.Entity.STATE_NONE;
			}
		},
		
		/**
		 * 迭代式的判断该数据实体及其所有子数据实体中是否是否包含任何未提交的信息。
		 * @return {boolean} 是否包含未提交的信息。
		 */
		isCascadeDirty: function() {
			function isDirty(entity) {
				var dirty = (entity.state != dorado.Entity.STATE_NONE);
				if(!dirty) {
					var data = entity._data;
					for(var p in data) {
						var v = data[p];
						if (v instanceof dorado.Entity) {
							dirty = isDirty(v);
						} else if (v instanceof dorado.EntityList) {
							var it = v.iterator(true);
							while(it.hasNext()) {
								dirty = isDirty(it.next());
								if(dirty) break;
							}
						}
						if(dirty) break;
					}
				}
				return dirty;
			}
			
			return isDirty(this);
		},
		
		/**
		 * 重新装载当前实体中的数据。
		 */
		flush: function(callback) {

			function checkResult(result) {
				if ( result instanceof Array && result.length > 1) {
					throw new dorado.ResourceException("dorado.data.TooMoreResult");
				}
			}

			if (!this.dataType || !this.dataProvider) {
				throw new dorado.ResourceException("dorado.data.DataProviderUndefined");
			}

			var arg = {
				parameter : this.parameter
			}, oldSupportsEntity = this.dataProvider.supportsEntity;
			this.dataProvider.supportsEntity = false;
			try {
				if (callback) {
					this.dataProvider.getResultAsync(arg, {
						scope: this,
						callback: function(success, result) {
							if (success) this.fromJSON(result);
							$callback(callback, success, ((success) ? this : result));
						}
					});
				} else {
					var result = this.dataProvider.getResult(arg);
					this.fromJSON(result);
				}
			}
			finally {
				this.dataProvider.supportsEntity = oldSupportsEntity;
			}
		},
		
		/**
		 * 以异步方式重新装载实体中的数据。
		 * 
		 * @param {Function|dorado.Callback}
		 *            callback 回调对象。
		 */
		flushAsync: function(callback) {
			this.flush(callback || dorado._NULL_FUNCTION);
		},
		
		/**
		 * 从所属的实体集合{@link dorado.EntityList}中删除本实体对象。
		 * 如果本实体对象尚不属于任何实体集合，则此方法不会产生实际的作用。
		 * 
		 * @param {boolean}
		 *            [detach] 是否彻底断开被删除的数据实体与集合之间的关联。默认为不断开。<br>
		 *            在通常情况下，当我们从集合中删除一个数据实体时，dorado只是在内部处理中将数据实体的状态标记为已删除状态而并没有真正的将数据实体从合集中移除掉。
		 *            这样做的目的是为了便于在今后提交时能够清晰的掌握集合中的元素究竟做过哪些改变。
		 */
		remove: function(detach) {
			if (this.parent instanceof dorado.EntityList) {
				this.parent.remove(this, detach);
			}
		},
		
		toString: function() {
			var text;
			if (this.dataType) {
				var dataType = this.dataType;
				var eventArg = {
					entity : this,
					processDefault : true
				};
				if (!this.disableEvents && dataType.getListenerCount("onEntityToText")) {
					eventArg.processDefault = false;
					dataType.fireEvent("onEntityToText", dataType, eventArg);
				}
				if (eventArg.processDefault) {
					if (dataType._defaultDisplayProperty) {
						text = this.getText(dataType._defaultDisplayProperty, "never");
					}
					if (text === undefined)
						text = "Entity@" + this.entityId;
				}
			} else {
				text = "Entity@" + this.entityId;
			}
			return text;
		},
		
		clone: function(deep) {
			var newData, data = this._data;
			if (deep) {
				newData = dorado.Core.clone(data, deep);
			} else {
				newData = {};
				for(var attr in data) {
					var v = data[attr];
					if (v instanceof dorado.Entity || v instanceof dorado.EntityList) {
						continue;
					}
					newData[attr] = v;
				}
			}
			return new dorado.Entity(newData, this.dataTypeRepository, this.dataType);
		}
	});

	dorado.Entity.ALWAYS_RETURN_VALID_ENTITY_LIST = true;

	var dummyEntityMap = {};

	dorado.Entity.getDummyEntity = function(pageNo) {
		var entity = dummyEntityMap[pageNo];
		if (!entity) {
			dummyEntityMap[pageNo] = entity = new dorado.Entity();
			entity.get = entity.set = dorado._NULL_FUNCTION;
			entity.dummy = true;
			entity.page = {
				pageNo : pageNo
			};
		}
		return entity;
	};
})();

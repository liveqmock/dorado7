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
	var hasRespositoryListener = false;
	
	function newAggDataType(name, subId) {
		var dataType = new AggregationDataType(name, dorado.LazyLoadDataType.create(this, subId));
		this.register(dataType);
		return dataType;
	}
	
	/**
	 * @author Benny Bao (mailto:benny.bao@bstek.com)
	 * @class 用于实现{@link dorado.DataType}信息延时装载的类。
	 * @param {dorado.DataTypeRepository} dataTypeRepository 对应的DataType所隶属的数据类型的管理器。
	 * @param {String} id DataType对应的服务端id。
	 */
	dorado.LazyLoadDataType = $class(/** @scope dorado.LazyLoadDataType.prototype */{
		$className: "dorado.LazyLoadDataType",
		
		constructor: function(dataTypeRepository, id) {
			/**
			 * @name dorado.LazyLoadDataType#dataTypeRepository
			 * @type dorado.DataTypeRepository
			 * @description 隶属的数据类型的管理器。
			 */
			this.dataTypeRepository = dataTypeRepository;
			
			/**
			 * @name dorado.LazyLoadDataType#id
			 * @type String
			 * @description DataType对应的服务端id。
			 */
			this.id = id;
		},
		
		/**
		 * 以同步操作的方式装载DataType的详细信息。
		 * @param {String} [loadMode="always"] 装载模式。<br>
		 * 包含下列三种取值:
		 * <ul>
		 * <li>always	-	如果有需要总是装载尚未装载的DataType。</li>
		 * <li>auto	-	如果有需要则自动启动异步的DataType装载过程，但对于本次方法调用将返回undefined。</li>
		 * <li>never	-	不会激活DataType的装载过程。</li>
		 * </ul>
		 * @return {dorado.DataType} 装载到的DataType。
		 */
		get: function(loadMode) {
			return this.dataTypeRepository.get(this.id, loadMode);
		},
		
		/**
		 * 以异步操作的方式装载DataType的详细信息。
		 * @param {String} [loadMode="always"] 装载模式。<br>
		 * 包含下列三种取值:
		 * <ul>
		 * <li>always	-	如果有需要总是装载尚未装载的DataType。</li>
		 * <li>auto	-	对于异步操作而言此选项没有实际意义，系统内部的处理方法将与always完全一致。</li>
		 * <li>never	-	不会激活DataType的装载过程。</li>
		 * </ul>
		 * @param {dorado.Callback} callback 回调对象，传入回调对象的参数即为装载到的DataType。
		 */
		getAsync: function(loadMode, callback) {
			this.dataTypeRepository.getAsync(this.id, callback, loadMode);
		},
		
		toString: function() {
			return dorado.defaultToString(this);
		}
	});
	
	dorado.LazyLoadDataType.create = function(dataTypeRepository, id) {
		var name = dorado.DataUtil.extractNameFromId(id);
		var origin = dataTypeRepository._get(name);
		if (origin instanceof dorado.DataType) {
			return origin;
		} else {
			if (origin && origin != DataTypeRepository.UNLOAD_DATATYPE) {
				return dataTypeRepository.get(name);
			} else {
				var subId = dorado.DataType.getSubName(id);
				if (subId) {
					var aggDataType = newAggDataType.call(dataTypeRepository, name, subId);
					aggDataType.set("id", id);
					return aggDataType;
				} else {
					dataTypeRepository.register(name);
					return new dorado.LazyLoadDataType(dataTypeRepository, id);
				}
			}
		}
	};
	
	dorado.LazyLoadDataType.dataTypeTranslator = function(dataType, loadMode) {
		if (dataType.constructor == String) {
			var repository;
			if (this.getDataTypeRepository) {
				repository = this.getDataTypeRepository();
			} else if (this.ATTRIBUTES && this.ATTRIBUTES.dataTypeRepository) {
				repository = this.get("dataTypeRepository");
			}
			if (!repository) repository = dorado.DataTypeRepository.ROOT;
			
			if (repository) {
				dataType = dorado.LazyLoadDataType.create(repository, dataType);
			} else {
				throw new dorado.ResourceException("dorado.data.RepositoryUndefined");
			}
		}
		
		loadMode = loadMode || "always";
		if (loadMode == "always") {
			if (dataType instanceof dorado.AggregationDataType) {
				dataType.getElementDataType();
			} else if (dataType instanceof dorado.LazyLoadDataType) dataType = dataType.get();
		} else if (loadMode == "auto") {
			if (dataType instanceof dorado.AggregationDataType) {
				dataType.getElementDataType();
			} else if (dataType instanceof dorado.LazyLoadDataType) dataType.getAsync();
		}
		if (!(dataType instanceof dorado.DataType)) dataType = null;
		return dataType;
	};
	
	dorado.LazyLoadDataType.dataTypeGetter = function() {
		var dataType = this._dataType;
		if (dataType != null) {
			dataType = dorado.LazyLoadDataType.dataTypeTranslator.call(this, dataType);
			if (this._dataType != dataType && dataType instanceof dorado.DataType) {
				this._dataType = dataType;
			}
		}
		return dataType;
	};
	
	dorado.DataTypePipe = $extend(dorado.DataPipe, {
		constructor: function(dataTypeRepository, id) {
			this.dataTypeRepository = dataTypeRepository || $dataTypeRepository;
			this.loadOptions = dataTypeRepository.loadOptions;
			this.id = id;
			this.name = dorado.DataUtil.extractNameFromId(id);
		},
		
		getAjaxOptions: function() {
			var dataTypeRepository = this.dataTypeRepository;
			return dorado.Object.apply({
				jsonData: {
					action: "load-datatype",
					dataType: [this.id],
					context: (dataTypeRepository._view ? dataTypeRepository._view.get("context") : null)
				}
			}, this.loadOptions);
		},
		
		doGet: function() {
			return this.doGetAsync();
		},
		
		doGetAsync: function(callback) {
			var ajax = dorado.util.AjaxEngine.getInstance(this.loadOptions), dataTypeRepository = this.dataTypeRepository;
			if (callback) {
				dataTypeRepository.register(this.name, this);
				ajax.request(this.getAjaxOptions(), {
					scope: this,
					callback: function(success, result) {
						if (success) {
							var json = result.getJsonData(), dataTypeJson, context;
							if (json.$context) {
								dataTypeJson = json.data;
								context = json.$context;
							} else {
								dataTypeJson = json;
							}
							
							if (dataTypeRepository.parseJsonData(dataTypeJson) > 0) {
								var dataType = dataTypeRepository._dataTypeMap[this.name];
								$callback(callback, true, dataType, {
									scope: this
								});
							}
							
							if (context && dataTypeRepository._view) {
								dataTypeRepository._view.set("context", context);
							}
						} else {
							$callback(callback, false, result.error, {
								scope: this
							});
						}
					}
				});
			} else {
				dataTypeRepository.unregister(this.name);
				var result = ajax.requestSync(this.getAjaxOptions());
				var jsonData = result.getJsonData(), dataType;
				if (jsonData && dataTypeRepository.parseJsonData(jsonData) > 0) {
					dataType = dataTypeRepository._dataTypeMap[this.name];
				}
				if (!dataType) {
					throw new dorado.ResourceException("dorado.data.DataTypeLoadFailed", this.name);
				}
				return dataType;
			}
		}
	});
	
	/**
	 * @author Benny Bao (mailto:benny.bao@bstek.com)
	 * @class 数据类型的管理器。
	 * <p>
	 * 子数据类型的管理器总是会继承父管理器中所有的数据类型。当外界尝试从子管理器获取某个数据类型时，
	 * 如果该类型不存在与子管理器中，那么子管理器将会继续尝试到父管理器查找。
	 * </p>
	 * @param {dorado.DataTypeRepository} parent 父数据类型的管理器。
	 */
	dorado.DataTypeRepository = DataTypeRepository = $extend(dorado.EventSupport, /** @scope dorado.DataTypeRepository.prototype */ {
		$className: "dorado.DataTypeRepository",
		
		EVENTS: /** @scope dorado.DataTypeRepository.prototype */ {
		
			/**
			 * 每当有新的数据类型被注册到该管理器或其父管理器中是触发的事件。
			 * @param {Object} self 事件的发起者，即控件本身。
			 * @param {Object} arg 事件参数。
			 * @param {dorado.DataType} arg.dataType 新注册的数据类型。
			 * @return {boolean} 是否要继续后续事件的触发操作，不提供返回值时系统将按照返回值为true进行处理。
			 * @event
			 */
			onDataTypeRegister: {
				interceptor: function(superFire, self, arg) {
					var retval = superFire(self, arg);
					if (retval !== false) {
						for (var i = 0; i < this.children.length; i++) {
							this.children[i].fireEvent(self, arg);
						}
					}
					return retval;
				}
			}
		},
		
		constructor: function(parent) {
			this._dataTypeMap = {};
			
			/**
			 * @name dorado.DataTypeRepository#parent
			 * @type dorado.DataTypeRepository
			 * @description 父数据类型的管理器。
			 */
			this.parent = parent;
			if (parent) parent.children.push(this);
			
			/**
			 * @name dorado.DataTypeRepository#children
			 * @type dorado.DataTypeRepository[]
			 * @description 子数据类型的管理器的数组。
			 */
			this.children = [];
			
			/**
			 * @name dorado.DataTypeRepository#loadOptions
			 * @type Object
			 * @see dorado.util.AjaxEngine#request
			 * @see dorado.util.AjaxEngine#requestSync
			 * @description 进行数据类型装载操作时传入{@link dorado.util.AjaxEngine}的执行选项。
			 * <p>
			 * 如果要修改此属性的内容，您应该为loadOptions属性赋一个新的对象，
			 * 而不是直接修改原loadOptions对象中的子属性，因为这样很可能导致其他的其它DataTypeRepository实例的loadOptions被意外改变。
			 * </p>
			 */
			this.loadOptions = dorado.Object.apply({}, $setting["ajax.dataTypeRepositoryOptions"]);
		},
		
		destroy: function() {
			if (this.parent) this.parent.children.remove(this);
		},
		
		bind: function() {
			hasRespositoryListener = true;
			return $invokeSuper.call(this, arguments);
		},
		
		parseSingleDataType: function(jsonData) {
			var dataType, name = jsonData.name, type = jsonData.$type;
			delete jsonData.name;
			delete jsonData.$type;
			if (type == "Aggregation") {
				dataType = new dorado.AggregationDataType(name);
			} else {
				dataType = new dorado.EntityDataType(name);
			}
			if (dataType) {
				dataType.loadFromServer = true;
				dataType._dataTypeRepository = this;
				dataType.set(jsonData);
			}
			return dataType;
		},
		
		parseJsonData: function(jsonData) {
			var n = 0, dataTypeMap = this._dataTypeMap, dataType;
			if (jsonData instanceof Array) {
				n = jsonData.length;
				for (var i = 0; i < n; i++) {
					this.register(this.parseSingleDataType(jsonData[i]));
				}
			} else {
				this.register(this.parseSingleDataType(jsonData));
				n++;
			}
			return n;
		},
		
		/**
		 * 向管理器中注册一个数据类型。 注意此方法的多态参数。
		 * @param {String|dorado.DataType} name 此参数是一个多态参数。
		 * <ul>
		 * <li>当参数类型为String时代表要注册的数据类型的名称，此时还必须通过dataType参数来指定要注册的具体数据类型。</li>
		 * <li>当参数类型为{@link dorado.DataType}时代表要注册的数据类型，此时系统将忽略dataType参数。</li>
		 * </ul>
		 * @param {dorado.DataType} [dataType] 要注册的数据类型。
		 */
		register: function(name, dataType) {
			if (name.constructor == String) {
				dataType = dataType || DataTypeRepository.UNLOAD_DATATYPE;
			} else {
				dataType = name;
				name = name._name;
			}
			
			if (this._dataTypeMap[name] instanceof dorado.DataType) return;
			this._dataTypeMap[name] = dataType;
			if (dataType instanceof dorado.DataType) {
				dataType._dataTypeRepository = this;
				if (hasRespositoryListener) {
					this.fireEvent("onDataTypeRegister", this, {
						dataType: dataType
					});
				}
			}
		},
		
		/**
		 * 从管理器中注销一个数据类型。
		 * @param {Object} name 此参数是一个多态参数。
		 * <ul>
		 * <li>当参数类型为String时代表要注销的数据类型的名称。</li>
		 * <li>当参数类型为{@link dorado.DataType}时代表要注销的数据类型。</li>
		 * </ul>
		 */
		unregister: function(name) {
			delete this._dataTypeMap[name];
		},
		
		_get: function(name) {
			var dataType = this._dataTypeMap[name];
			if (!dataType && this.parent) {
				dataType = this.parent._get(name);
			}
			return dataType;
		},
		
		/**
		 * 根据名称从管理器中获取相应的数据类型。<br>
		 * 如果该数据类型的详细信息尚不存于客户端，那么管理将自动从服务端装载该数据类型的详细信息。
		 * @param {String} name 数据类型的名称。
		 * @param {String} [loadMode="always"] 装载模式。<br>
		 * 包含下列三种取值:
		 * <ul>
		 * <li>always	-	如果有需要总是装载尚未装载的DataType。</li>
		 * <li>auto	-	如果有需要则自动启动异步的DataType装载过程，但对于本次方法调用将返回undefined。</li>
		 * <li>never	-	不会激活DataType的装载过程。</li>
		 * </ul>
		 * @return {dorado.DataType} 数据类型。
		 */
		get: function(name, loadMode) {
			var id = name, name = dorado.DataUtil.extractNameFromId(id);
			var dataType = this._get(name);
			if (dataType == DataTypeRepository.UNLOAD_DATATYPE) { // 已认识但尚未下载的
				var subId = dorado.DataType.getSubName(id);
				if (subId) {
					dataType = newAggDataType.call(this, name, subId);
					dataType.set("id", id);
				} else {
					loadMode = loadMode || "always";
					if (loadMode == "always") {
						var pipe = new dorado.DataTypePipe(this, id);
						dataType = pipe.get();
					} else {
						if (loadMode == "auto") this.getAsync(id);
						dataType = null;
					}
				}
			} else if (dataType instanceof dorado.DataTypePipe) { // 正在下载的
				var pipe = dataType;
				if (loadMode == "always") dataType = pipe.get(callback);
				else dataType = null;
			} else if (!dataType) { // 不认识的
				var subId = dorado.DataType.getSubName(id);
				if (subId) {
					dataType = newAggDataType.call(this, name, subId);
					dataType.set("id", id);
				}
			}
			return dataType;
		},
		
		/**
		 * 以异步方式、根据名称从管理器中获取相应的数据类型。<br>
		 * 如果该数据类型的详细类型尚不存于客户端，那么管理将自动从服务端装载该数据类型的详细信息。
		 * @param {String} name 数据类型的名称。
		 * @param {Function|dorado.Callback} callback 回调对象，传入回调对象的参数即为获得的DataType。
		 * @param {String} [loadMode="always"] 装载模式。<br>
		 * 包含下列三种取值:
		 * <ul>
		 * <li>always	-	如果有需要总是装载尚未装载的DataType。</li>
		 * <li>auto	-	对于异步操作而言此选项没有实际意义，系统内部的处理方法将与always完全一致。</li>
		 * <li>never	-	不会激活DataType的装载过程。</li>
		 * </ul>
		 */
		getAsync: function(name, callback, loadMode) {
			var id = name, name = dorado.DataUtil.extractNameFromId(id);
			var dataType = this._get(name);
			if (dataType == DataTypeRepository.UNLOAD_DATATYPE) {
				var subId = dorado.DataType.getSubName(id);
				if (subId) {
					dataType = newAggDataType.call(this, name, subId);
					dataType.set("id", id);
				} else {
					loadMode = loadMode || "always";
					if (loadMode != "never") {
						var pipe = new dorado.DataTypePipe(this, id);
						pipe.getAsync(callback);
						return;
					}
				}
			} else if (dataType instanceof dorado.DataTypePipe) {
				var pipe = dataType;
				if (loadMode != "never") {
					pipe.getAsync(callback);
					return;
				}
			} else if (!dataType) {
				var subId = dorado.DataType.getSubName(id);
				if (subId) {
					dataType = newAggDataType.call(this, name, subId);
					dataType.set("id", id);
				}
			}
			$callback(callback, true, dataType);
		},
		
		getLoadedDataTypes: function() {
		
			function collect(dataTypeRepository, nameMap) {
				var map = dataTypeRepository._dataTypeMap;
				for (var name in map) {
					var dt = map[name];
					if (dt.loadFromServer && !(dt instanceof dorado.AggregationDataType)) nameMap[name] = true;
				}
				if (dataTypeRepository.parent) collect(dataTypeRepository.parent, nameMap);
			}
			
			var nameMap = {}, result = [];
			collect(this, nameMap);
			for (var name in nameMap) 
				result.push(name);
			return result;
		}
	});
	
	var DataType = dorado.DataType;
	var root = new DataTypeRepository();
	
	/**
	 * 客户端的根数据类型管理器。
	 * @name dorado.DataTypeRepository.ROOT
	 * @type {dorado.DataTypeRepository}
	 * @constant
	 */
	DataTypeRepository.ROOT = root;
	DataTypeRepository.UNLOAD_DATATYPE = {};
	
	/**
	 * dorado.DataTypeRepository.ROOT的快捷方式。
	 * @type dorado.DataTypeRepository
	 * @constant
	 * @see dorado.DataTypeRepository.ROOT
	 */
	window.$dataTypeRepository = DataTypeRepository.ROOT;
	
	function cloneDataType(dataType, name) {
		var newDataType = dorado.Object.clone(dataType);
		newDataType._name = name;
		return newDataType;
	}
	
	root.register(dorado.$String);
	root.register(dorado.$char);
	root.register(dorado.$Character);
	
	dataType = dorado.$int;
	root.register("int", dataType);
	root.register("byte", cloneDataType(dataType, "byte"));
	root.register("short", cloneDataType(dataType, "short"));
	root.register("long", cloneDataType(dataType, "long"));
	
	dataType = dorado.$Integer;
	root.register("Integer", dataType);
	root.register("Byte", cloneDataType(dataType, "Byte"));
	root.register("Short", cloneDataType(dataType, "Short"));
	root.register("Long", cloneDataType(dataType, "Long"));
	
	dataType = dorado.$float;
	root.register("float", dataType);
	root.register("double", cloneDataType(dataType, "double"));
	
	dataType = dorado.$Float;
	root.register("Float", dataType);
	root.register("Double", cloneDataType(dataType, "Double"));
	root.register("BigDecimal", cloneDataType(dataType, "BigDecimal"));
	
	root.register(dorado.$boolean);
	root.register(dorado.$Boolean);
	
	dataType = dorado.$Date;
	root.register("Date", dataType);
	root.register("Calendar", cloneDataType(dataType, "Calendar"));
	
	root.register("Time", dorado.$Time);
	root.register("DateTime", dorado.$DateTime);
	
	var AggregationDataType = dorado.AggregationDataType;
	root.register(new AggregationDataType("List"));
	root.register(new AggregationDataType("Set"));
	root.register(new AggregationDataType("Array"));
	
	var EntityDataType = dorado.EntityDataType;
	root.register(new EntityDataType("Bean"));
	root.register(new EntityDataType("Map"));
	root.register(new EntityDataType("Entity"));
})();

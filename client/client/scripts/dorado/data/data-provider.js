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

	/**
	 * @author Benny Bao (mailto:benny.bao@bstek.com)
	 * @class 数据提供者。
	 * <p>
	 * 此对象一般只用于配合dorado服务端的开发模式中。在纯使用dorado客户端功能的开发模式下一般应使用@{link dorado.AjaxDataProvider}。
	 * </p>
	 * <p>
	 * 通常我们不建议您通过<pre>new dorado.DataProvider("xxx");</pre>的方式来创建数据提供者，而应该用{@link dorado.DataProvider.create}来代替。
	 * 这是因为用{@link dorado.DataProvider.create}支持缓存功能，利用此方法来获得数据提供者的效率往往更高。
	 * </p>
	 * @param {String} id 数据提供者的服务id。通常此id也会被直接认为是数据提供者的name。
	 */
	dorado.DataProvider = $class(/** @scope dorado.DataProvider.prototype */{
		$className: "dorado.DataProvider",
		
		/**
		 * @property
		 * @name dorado.DataProvider#dataTypeRepository
		 * @type dorado.DataTypeRepository
		 * @description 解析返回数据时可能需要用到的数据类型管理器。
		 */
		/**
		 * @property
		 * @name dorado.DataProvider#dataType
		 * @type dorado.LazyLoadDataType|dorado.DataType
		 * @description 返回数据的数据类型。
		 */
		/**
		 * @property
		 * @name dorado.DataProvider#message
		 * @type String
		 * @description 当此DataProvider正在执行时希望系统显示给用户的提示信息。
		 * <p>
		 * 此属性目前仅在以异步模式执行时有效。
		 * </p>
		 */
		// =====
		
		/**
		 * 是否支持Dorado的数据实体。
		 * <p>
		 * 如果选择是，那么当有数据从服务端返回时，系统自动判断该数据在服务端的形态。
		 * 如果该数据在服务端是Entity/EntityList的形式，那么系统也会在客户端将他们转换成Entity/EntityList的形式。<br>
		 * 如果选择否，那么不管这些数据在服务端是怎样的，到了客户端将变成JSON形式。
		 * </p>
		 * @type boolean
		 * @default true
		 */
		supportsEntity: true,
		
		shouldFireEvent: true,
		
		constructor: function(id) {
			this.id = id;
			this.name = dorado.DataUtil.extractNameFromId(id);
		},
		
		/**
		 * @name dorado.DataProvider#id
		 * @decription 数据提供者的服务id。
		 * @type String
		 */
		/**
		 * @name dorado.DataProvider#name
		 * @decription 数据提供者的名称。
		 * @type String
		 */
		// =====
		
		/**
		 * 进行数据装载操作时传入{@link dorado.util.AjaxEngine}的执行选项。
		 * @protected
		 * @return {Object} 执行选项。
		 * @see dorado.util.AjaxEngine#request
		 * @see dorado.util.AjaxEngine#requestSync
		 */
		getAjaxOptions: function(arg) {
			var jsonData = {
				action: "load-data",
				dataProvider: this.id,
				supportsEntity: this.supportsEntity
			};
			if (arg) {
				jsonData.parameter = arg.parameter;
				jsonData.sysParameter = arg.sysParameter;
				if (arg.dataType) {
					var dataType = arg.dataType;
					if (dataType instanceof dorado.DataType) dataType = dataType.get("id");
					else if (typeof dataType == "string") dataType = dataType;
					else dataType = dataType.id;
					jsonData.resultDataType = dataType;
				}
				jsonData.pageSize = arg.pageSize;
				jsonData.pageNo = arg.pageNo;
				jsonData.context = arg.view ? arg.view.get("context") : null;
			}
			if (this.supportsEntity && this.dataTypeRepository) {
				jsonData.loadedDataTypes = this.dataTypeRepository.getLoadedDataTypes();
			}
			return dorado.Object.apply({
				jsonData: jsonData
			}, $setting["ajax.dataProviderOptions"]);
		},
		
		convertEntity: function(data, dataTypeRepository, dataType, ajaxOptions) {
			if (data == null) return data;
			
			var oldFireEvent = dorado.DataUtil.FIRE_ON_ENTITY_LOAD;
			dorado.DataUtil.FIRE_ON_ENTITY_LOAD = this.shouldFireEvent;
			try {
				data = dorado.DataUtil.convertIfNecessary(data, dataTypeRepository, dataType);
			}
			finally {
				dorado.DataUtil.FIRE_ON_ENTITY_LOAD = oldFireEvent;
			}
			
			if (data instanceof dorado.EntityList) {
				data.dataProvider = this;
				data.parameter = ajaxOptions.jsonData.parameter;
				data.sysParameter = ajaxOptions.jsonData.sysParameter;
				data.pageSize = ajaxOptions.jsonData.pageSize;
			} else if (data instanceof dorado.Entity) {
				data.dataProvider = this;
				data.parameter = ajaxOptions.jsonData.parameter;
				data.sysParameter = ajaxOptions.jsonData.sysParameter;
			}
			return data;
		},
		
		/**
		 * 用于以同步方式提取数据的方法。
		 * @param {Object} [arg] 提取数据时的选项。
		 * @param {Object} [arg.parameter] 提取数据时使用的参数。
		 * @param {int} [arg.pageNo] 提取分页数据时请求的页号。
		 * @param {int} [arg.pageSize] 提取分页数据时每页的记录数。
		 * @return {dorado.Entity|dorado.EntityList} 提取到的数据。
		 * @throws {Error}
		 */
		getResult: function(arg) {
			var ajaxOptions = this.getAjaxOptions(arg), ajax = dorado.util.AjaxEngine.getInstance(ajaxOptions);
			var result = ajax.requestSync(ajaxOptions);
			if (result.success) {
				var json = result.getJsonData(), data;
				if (json && (json.$dataTypeDefinitions || json.$context)) {
					data = json.data;
					if (json.$dataTypeDefinitions) this.dataTypeRepository.parseJsonData(json.$dataTypeDefinitions);
					if (json.$context && arg && arg.view) {
						var context = arg.view.get("context");
						context.clear();
						context.put(json.$context);
					}
				} else {
					data = json;
				}
				if (data && this.supportsEntity) {
					data = this.convertEntity(data, this.dataTypeRepository, this.dataType, ajaxOptions);
				}
				return data;
			} else {
				throw result.error;
			}
		},
		
		/**
		 * 用于以异步方式提取数据的方法。
		 * @param {Object} arg 提取数据时的选项。
		 * @param {Object} [arg.parameter] 提取数据时使用的参数。
		 * @param {int} [arg.pageNo] 提取分页数据时请求的页号。
		 * @param {int} [arg.pageSize] 提取分页数据时每页的记录数。
		 * @param {Function|dorado.Callback} callback 回调对象，传入回调对象的参数即为提取到的数据。
		 */
		getResultAsync: function(arg, callback) {
			var ajaxOptions = this.getAjaxOptions(arg), ajax = dorado.util.AjaxEngine.getInstance(ajaxOptions);
			var dataType = this.dataType, supportsEntity = this.supportsEntity, dataTypeRepository = this.dataTypeRepository;
			
			var message = this.message;
			if (message == null) message = ajaxOptions.message;
			if (message === undefined) message = $resource("dorado.data.DataProviderTaskIndicator");
			if (message) ajaxOptions.message = message;

			ajax.request(ajaxOptions, {
				scope: this,
				callback: function(success, result) {
					if (success) {
						var json = result.getJsonData(), data;
						if (json && (json.$dataTypeDefinitions || json.$context)) {
							data = json.data;
							if (json.$dataTypeDefinitions) this.dataTypeRepository.parseJsonData(json.$dataTypeDefinitions);
							if (json.$context && arg && arg.view) {
								var context = arg.view.get("context");
								context.clear();
								context.put(json.$context);
							}
						} else {
							data = json;
						}
						if (data && supportsEntity) {
							data = this.convertEntity(data, dataTypeRepository, dataType, ajaxOptions);
						}
						$callback(callback, true, data, {
							scope: this
						});
					} else {
						$callback(callback, false, result.exception, {
							scope: this
						});
					}
				}
			});
		}
	});
	
	/**
	 * @class 通过Ajax引擎获取数据的数据提供者。
	 * <p>
	 * 此对象一般只用于纯使用dorado客户端功能开发模式中。在配合dorado服务端的开发模式下一般应使用@{link dorado.DataProvider}。
	 * </p>
	 * @extends dorado.DataProvider
	 * @param {Object|String} options 默认的进行数据装载操作时传入{@link dorado.util.AjaxEngine}的执行选项。
	 * @see dorado.util.AjaxEngine
	 */
	dorado.AjaxDataProvider = $extend(dorado.DataProvider, {
		$className: "dorado.AjaxDataProvider",
		
		constructor: function(options) {
			if (typeof options == "string") {
				options = {
					url: options
				};
			}
			this._baseOptions = options || {};
		},
		
		getAjaxOptions: function(arg) {
			var options = dorado.Object.apply({}, this._baseOptions), jsonData = options.jsonData = {};
			if (this._baseOptions.jsonData) dorado.Object.apply(jsonData, this._baseOptions.jsonData);
			if (arg) {
				jsonData.parameter = arg.parameter;
				jsonData.sysParameter = arg.sysParameter;
				jsonData.pageSize = arg.pageSize;
				jsonData.pageNo = arg.pageNo;
			}
			return options;
		}
	});
	
	var dataProviders = {};
	
	/**
	 * 创建一个数据提供者。
	 * @param {String} id 数据提供者的服务id。
	 * @return {dorado.DataProvider} 新创建的数据提供者。
	 */
	dorado.DataProvider.create = function(id) {
		var provider = dataProviders[id];
		if (provider === undefined) {
			dataProviders[id] = provider = new dorado.DataProvider(id);
		}
		return provider;
	};
	
	dorado.DataProviderPipe = $extend(dorado.DataPipe, {
		$className: "dorado.DataProviderPipe",
		
		getDataProvider: function() {
			return this.dataProvider;
		},
		
		doGet: function() {
			return this.doGetAsync();
		},
		
		doGetAsync: function(callback) {
			var dataProvider = this.getDataProvider();
			if (dataProvider) {
				var dataProviderArg = this.getDataProviderArg()
				dataProvider.dataTypeRepository = this.dataTypeRepository;
				dataProvider.dataType = this.dataType;
				dataProvider.shouldFireEvent = this.shouldFireEvent;
				if (callback) {
					dataProvider.getResultAsync(dataProviderArg, callback);
				} else {
					return dataProvider.getResult(dataProviderArg);
				}
			}
			else {
				if (callback) {
					$callback(callback, true, null);
				}
				else {
					return null;
				}
			}
		}
	});
	
})();

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
	 * @class 数据处理器。
	 *  <p>
	 * 此对象一般只用于配合dorado服务端的开发模式中。在纯使用dorado客户端功能的开发模式下一般应使用@{link dorado.AjaxDataResolver}。
	 * </p>
	 * <p>
	 * 通常我们不建议您通过<pre>new dorado.DataResolver("xxx");</pre>的方式来创建数据处理器，而应该用{@link dorado.DataResolver.create}来代替。
	 * 这是因为用{@link dorado.DataResolver.create}支持缓存功能，利用此方法来获得数据处理器的效率往往更高。
	 * </p>
	 * @param {String} id 数据处理器的服务id。通常此id也会被直接认为是数据处理器的name。
	 */
	dorado.DataResolver = $class(/** @scope dorado.DataResolver.prototype */{
		$className: "dorado.DataResolver",
		
		supportsEntity: true,

		constructor: function(id) {
			this.id = id;
			this.name = dorado.DataUtil.extractNameFromId(id);
		},

		/**
		 * @name dorado.DataProvider#id
		 * @decription 数据处理器的服务id。
		 * @type String
		 */
		/**
		 * @name dorado.DataResolver#name
		 * @type String
		 * @decription 数据处理器的名称。
		 */
		/**
		 * @property
		 * @name dorado.DataResolver#dataTypeRepository
		 * @type dorado.DataTypeRepository
		 * @description 解析返回数据时可能需要用到的数据类型管理器。
		 */
		/**
		 * @property
		 * @name dorado.DataResolver#message
		 * @type String
		 * @description 当此DataResolver正在执行时希望系统显示给用户的提示信息。
		 * <p>
		 * 此属性目前仅在以异步模式执行时有效。
		 * </p>
		 */
		// =====

		/**
		 * 进行数据提交操作时传入{@link dorado.util.AjaxEngine}的执行选项。
		 * @return {Object} 执行选项。
		 * @see dorado.util.AjaxEngine#request
		 * @see dorado.util.AjaxEngine#requestSync
		 */
		getAjaxOptions: function(arg) {
			var jsonData = {
				action: "resolve-data",
				dataResolver: this.id,
				supportsEntity: this.supportsEntity
			};
			if (arg) {
				jsonData.dataItems = arg.dataItems;
				jsonData.parameter = arg.parameter;
				jsonData.sysParameter = arg.sysParameter;
				jsonData.context = arg.view ? arg.view.get("context") : null;
			}
			if (this.supportsEntity && this.dataTypeRepository) {
				jsonData.loadedDataTypes = this.dataTypeRepository.getLoadedDataTypes();
			}
			return dorado.Object.apply({
				jsonData: jsonData
			}, $setting["ajax.dataResolverOptions"]);
		},

		/**
		 * 用于以同步方式调用后台数据处理的方法。
		 * @param {Object} [arg] 处理数据时的选项。
		 * @param {Object[]} [arg.dataItems] 要提交的数据项的数组。
		 * 其中每一个数据项又是一个子对象，该子对象应包含以下两个子属性:
		 * <ul>
		 * <li>name - {String} 数据项的名称（键值）。</li>
		 * <li>data - {Object} 具体的数据。</li>
		 * </ul>
		 * @param {Object} [arg.parameter] 提交数据时附带的参数。
		 * @return {Object} 数据处理完成后得到的返回结果。
		 * @throws {Error}
		 */
		resolve: function(arg) {
			var ajaxOptions = this.getAjaxOptions(arg), ajax = dorado.util.AjaxEngine.getInstance(ajaxOptions);
			var result = ajax.requestSync(ajaxOptions);
			if (result.success) {
				var result = result.getJsonData(), returnValue = (result ? result.returnValue : null);
				if (returnValue && (returnValue.$dataTypeDefinitions || returnValue.$context)) {
					if (returnValue.$dataTypeDefinitions) this.dataTypeRepository.parseJsonData(returnValue.$dataTypeDefinitions);
					if (returnValue.$context && arg && arg.view) {
						var context = arg.view.get("context");
						context.clear();
						context.put(returnValue.$context);
					}
					returnValue = returnValue.data;
				}
				if (returnValue && this.supportsEntity) {
					returnValue = dorado.DataUtil.convertIfNecessary(returnValue, this.dataTypeRepository);
				}
				return {
					returnValue: returnValue,
					entityStates: result.entityStates
				};
			} else {
				throw result.exception;
			}
		},

		/**
		 * 用于以异步方式调用后台数据处理的方法。
		 * @param {Object} arg 处理数据时的选项。见{@link dorado.DataResolver#resolve}中arg参数的说明。
		 * @param {Function|dorado.Callback} callback 回调对象，传入回调对象的参数即为数据处理完成后的结果。
		 * @see dorado.DataResolver#resolve
		 */
		resolveAsync: function(arg, callback) {
			var ajaxOptions = this.getAjaxOptions(arg), supportsEntity = this.supportsEntity, ajax = dorado.util.AjaxEngine.getInstance(ajaxOptions);
			
			var message = this.message;
			if (message == null) message = ajaxOptions.message;
			if (message === undefined) message = $resource("dorado.data.DataResolverTaskIndicator");
			if (message) ajaxOptions.message = message;
			if (ajaxOptions.modal == null) ajaxOptions.modal = this.modal;
			
			ajax.request(ajaxOptions, {
				scope: this,
				callback: function(success, result) {
					if (success) {
						var result = result.getJsonData(), returnValue = (result ? result.returnValue : null);
						if (returnValue && (returnValue.$dataTypeDefinitions || returnValue.$context)) {
							if (returnValue.$dataTypeDefinitions) this.dataTypeRepository.parseJsonData(returnValue.$dataTypeDefinitions);
							if (returnValue.$context && arg && arg.view) {
								var context = arg.view.get("context");
								context.clear();
								context.put(returnValue.$context);
							}
							returnValue = returnValue.data;
						}
						if (returnValue && supportsEntity) {
							returnValue = dorado.DataUtil.convertIfNecessary(returnValue, this.dataTypeRepository);
						}
						$callback(callback, true, {
							returnValue: returnValue,
							entityStates: result.entityStates
						}, {
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

	dorado.AjaxDataResolver = $extend(dorado.DataResolver, {
		$className: "dorado.AjaxDataResolver",

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
			jsonData.action = "resolve-data";
			jsonData.dataResolver = this.name;
			if (arg) {
				jsonData.dataItems = arg.dataItems;
				jsonData.parameter = arg.parameter;
				jsonData.sysParameter = arg.sysParameter;
				jsonData.context = arg.view ? arg.view.get("context") : null;
			}
			return options;
		}
	});

	var dataResolvers = {};

	/**
	 * 创建一个数据处理器。
	 * @param {String} id 数据处理器的服务id。
	 * @return {dorado.DataProvider} 新创建的数据处理器。
	 */
	dorado.DataResolver.create = function(id) {
		var resolver = dataResolvers[id];
		if (resolver === undefined) {
			dataResolvers[id] = resolver = new dorado.DataResolver(id);
		}
		return resolver;
	};

})();

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

	var VALIDATION_RESULT_CODE = {
		ok: 0,
		invalid: 1,
		executing: 2
	};

	/**
	 * @author Benny Bao (mailto:benny.bao@bstek.com)
	 * @component Action
	 * @class 用于执行远程过程的动作控件。
	 * <p>
	 * 此控件仅在配合Dorado服务端的开发模式中有意义。
	 * </p>
	 * @extends dorado.widget.AsyncAction
	 * @see dorado.DataResolver
	 */
	dorado.widget.AjaxAction = $extend(dorado.widget.AsyncAction, /** @scope dorado.widget.AjaxAction.prototype */
		{
			$className: "dorado.widget.AjaxAction",

			ATTRIBUTES: /** @scope dorado.widget.AjaxAction.prototype */
			{

				/**
				 * 是否默认情况下使用异步方式执行。
				 * @type boolean
				 * @attribute
				 * @default true
				 */
				async: {
					defaultValue: true
				},

				/**
				 * Dorado服务端暴露给客户端的某个服务的名称。
				 * @type String
				 * @attribute
				 */
				service: {},

				/**
				 * 以毫秒为单位的超时时长。此特性在同步模式下不生效。
				 * @type int
				 * @attribute
				 */
				timeout: {},

				/**
				 * 是否支持自动批量请求模式。此特性在同步模式下不生效。
				 * @type boolean
				 * @attribute
				 * @default true
				 */
				batchable: {
					defaultValue: true
				},

				/**
				 * 是否支持Dorado的数据实体。
				 * <p>
				 * 如果选择是，那么当有数据从服务端返回时，系统自动判断该数据在服务端的形态。
				 * 如果该数据在服务端是Entity/EntityList的形式，那么系统也会在客户端将他们转换成Entity/EntityList的形式。<br>
				 * 如果选择否，那么不管这些数据在服务端是怎样的，到了客户端将变成JSON形式。
				 * </p>
				 * @type boolean
				 * @attribute
				 * @default true
				 */
				supportsEntity: {
					defaultValue: true
				}
			},

			getAjaxOptions: function() {
				var jsonData = {
					action: "remote-service",
					service: this._service,
					supportsEntity: this._supportsEntity,
					parameter: dorado.JSON.evaluate(this._parameter),
					sysParameter: this._sysParameter ? this._sysParameter.toJSON() : undefined,
					context: (this._view ? this._view.get("context") : null)
				};
				if (this._supportsEntity) {
					jsonData.loadedDataTypes = this.get("dataTypeRepository").getLoadedDataTypes();
				}
				return dorado.Object.apply({
					jsonData: jsonData,
					timeout: this._timeout,
					batchable: this._batchable
				}, $setting["ajax.remoteServiceOptions"]);
			},

			doExecuteSync: function() {
				var ajaxOptions = this.getAjaxOptions(), ajax = dorado.util.AjaxEngine.getInstance(ajaxOptions);
				var result = ajax.requestSync(ajaxOptions);
				if (result.success) {
					var result = result.getJsonData(), dataTypeRepository = this.get("dataTypeRepository"), data;
					if (result && typeof result == "object" && (result.$dataTypeDefinitions || result.$context)) {
						data = result.data;
						if (result.$dataTypeDefinitions) dataTypeRepository.parseJsonData(result.$dataTypeDefinitions);
						if (result.$context && this._view) {
							var context = this._view.get("context");
							context.clear();
							context.put(result.$context);
						}
					}
					if (data && this._supportsEntity) {
						data = dorado.DataUtil.convertIfNecessary(data, dataTypeRepository);
					}
					return data;
				}
				else {
					throw result.exception;
				}
			},

			doExecuteAsync: function(callback) {
				var ajaxOptions = this.getAjaxOptions(), ajax = dorado.util.AjaxEngine.getInstance(ajaxOptions);
				ajax.request(ajaxOptions, {
					scope: this,
					callback: function(success, result) {
						if (success) {
							var data;
							result = result.getJsonData(), dataTypeRepository = this.get("dataTypeRepository");
							if (result && (result.$dataTypeDefinitions || result.$context)) {
								data = result.data;
								if (result.$dataTypeDefinitions) dataTypeRepository.parseJsonData(result.$dataTypeDefinitions);
								if (result.$context && this._view) {
									var context = this._view.get("context");
									context.clear();
									context.put(result.$context);
								}
							}
							if (data && this._supportsEntity) {
								data = dorado.DataUtil.convertIfNecessary(data, dataTypeRepository);
							}
							$callback(callback, true, data);
						}
						else {
							$callback(callback, false, result.exception);
						}
					}
				});
			}
		});

	dorado.DataPath.registerInterceptor("CASCADE_DIRTY", function(data) {
		if (data instanceof dorado.Entity) {
			if (!data.isCascadeDirty()) data = null;
		}
		else if (data instanceof dorado.EntityList) {
			var it = data.iterator(true);
			var data = [];
			while(it.hasNext()) {
				var e = it.next();
				if (e.isCascadeDirty()) data.push(e);
			}
		}
		else {
			data = null;
		}
		return data;
	}, function(dataType) {
		return dataType;
	});
	var CASCADE_NOT_DRITY_ENTITYS;

	dorado.DataPath.registerInterceptor("DIRTY_TREE", function(data) {

		function gothrough(entity, ignoreSelf) {
			var isDirty = entity.isDirty();

			var data = entity._data;
			for(var property in data) {
				if (!data.hasOwnProperty(property)) continue;
				if (property.charAt(0) == '$') continue;
				var propertyDef = (entity._propertyDefs) ? entity._propertyDefs.get(property) : null;
				if (!propertyDef || !propertyDef._submittable) continue;

				var value = entity.get(property, "never");
				if (value instanceof dorado.EntityList) {
					var it = value.iterator(true);
					while(it.hasNext()) {
						if (gothrough(it.next())) isDirty = true;
					}
				}
				else if (value instanceof dorado.Entity) {
					if (gothrough(value, true)) isDirty = true;
				}
			}
			if (!isDirty && !ignoreSelf) CASCADE_NOT_DRITY_ENTITYS[entity.entityId] = true;
			return isDirty;
		}

		CASCADE_NOT_DRITY_ENTITYS = {};
		if (data instanceof dorado.Entity) {
			if (!gothrough(data)) data = null;
		}
		else if (data instanceof dorado.EntityList) {
			var it = data.iterator(true);
			data = [];
			while(it.hasNext()) {
				var entity = it.next();
				if (gothrough(entity)) data.push(entity);
			}
		}
		return data;
	}, function(dataType) {
		return dataType;
	});

	function filterCascadeDrityEntity(entity) {
		return !CASCADE_NOT_DRITY_ENTITYS[entity.entityId];
	}

	/**
	 * @author Benny Bao (mailto:benny.bao@bstek.com)
	 * @component Action
	 * @class 提交动作控件。
	 * @extends dorado.widget.AsyncAction
	 * @see dorado.DataResolver
	 */
	dorado.widget.UpdateAction = $extend(dorado.widget.AsyncAction, /** @scope dorado.widget.UpdateAction.prototype */
		{
			$className: "dorado.widget.UpdateAction",

			ATTRIBUTES: /** @scope dorado.widget.UpdateAction.prototype */
			{

				/**
				 * 是否默认情况下使用异步方式执行。
				 * @type boolean
				 * @attribute
				 * @default true
				 */
				async: {
					defaultValue: true
				},

				/**
				 * 数据处理器的名称。
				 * @type dorado.DataResolver
				 * @attribute
				 */
				dataResolver: {
					setter: function(v) {
						this._dataResolver = (v && v.constructor === String) ? dorado.DataResolver.create(v) : v;
					}
				},

				/**
				 * 更新项的数组。
				 * 更新项即要提交的DataSet的信息。数组中的每一个子对象包含下列子属性：
				 * <ul>
				 * <li>dataSet - {dorado.widget.DataSet|String} DataSet或DataSet的ID。</li>
				 * <li>alias - {String} 用于描述这些被提交数据的别名，默认情况下系统会直接使用DataSet的id作为该属性名。</li>
				 * <li>dataPath - {String="!DIRTY_TREE"} 用于描述希望提交DataSet中哪些数据的数据路径。
				 * <p>此属性常用的写法有如下三种：!DIRTY_TREE、!CASCADE_DIRTY、[#dirty]。</p>
				 * <p>
				 * CASCADE_DIRTY和DIRTY_TREE都是UpdateAction特别注册到DataPath中的一种自定义片段。
				 * 普通的[#dirty]状态判断只判断数据实体自身的状态是否"脏"状态；
				 * 而CASCADE_DIRTY会进一步判断数据实体中级联子数据实体的状态，只要有任何一个子数据实体的状态为"脏"则该数据实体也将被认为是脏数据。
				 * 此时该数据实体包括其下属的所有子数据实体都将被提交。
				 * </p>
				 * <p>
				 * DIRTY_TREE从字面上可以理解为是由所有脏数据构成的一棵树，只不过为维护这棵树结构的正确性有时我们还必须一同提交一些并不处于脏状态的数据。
				 * 所以DIRTY_TREE提交的是一颗尽可能精简的由脏数据构成的树。<br>
				 * DIRTY_TREE也可以视作是在CASCADE_DIRTY基础上提供的另一种选择，由于CASCADE_DIRTY计算规则，在执行提交的信息中通常会包含大量实际状态为"未修改"的数据实体。
				 * DIRTY_TREE正式在此基础上对提交信息进行进一步的精简后的结果，具体做法是在保留数据关系的前提下剔除那些状态为"未修改"的数据实体。<br>
				 * 例如，当数据树中某个节点的数据为"脏"时，系统将只提交该节点及其每一层的父节点，且在提交时维持他们之间原有的从属关系。
				 * </p>
				 * <p>
				 * [#dirty]也是一种常用的dataPath定义方式，此表达式与CASCADE_DIRTY的不同点是只判断数据实体自身的状态，而忽略其中的级联子数据实体。
				 * </p>
				 * </li>
				 * <li>refreshMode - {String="value"} 提交完成后如何刷新客户端提交的数据实体。支持如下4种模式：
				 *    <ul>
				 *        <li>none    -    不对提交的数据实体进行刷新。这意味着不论提交成功与否，这些数据实体都会保持提交之前的状态。</li>
				 *        <li>state    -    只刷新数据实体的状态。</li>
				 *        <li>value    -    刷新数据实体中的数据和状态，但会忽略数据实体中的级联子数据实体。</li>
				 *        <li>cascade    -    刷新数据实体中的数据和状态，包括数据实体中的级联子数据实体的数据和状态。</li>
				 *    </ul>
				 * </li>
				 * <li>firstResultOnly - {boolean} 用于传递给内部将使用到的{@link dorado.DataPath#evaluate}方法的options.firstResultOnly参数。
				 * 表示是否只提交dataPath返回结果中的第一个对象。</li>
				 * <li>submitSimplePropertyOnly - {boolean} 只提交简单数据类型的属性，如String、boolean、int、Date等数据类型。
				 * 设置此属性起到的效果大致相当于只提交DataPath返回的结果中顶层的数据实体。</li>
				 * <li>submitOldData - {boolean} 对于那些被修改的数据实体是否提交其原有的属性值。</li>
				 * <li>options - {Object} 用于传递给内部将使用到的{@link dorado.DataPath#evaluate}方法、{@link dorado.EntityList#toJSON}方法和{@link dorado.EntityList#toJSON}方法的执行选项。
				 * 其中所支持的子属性为以上3个方法的选项参数所支持的子属性的合集。</li>
				 * <li>autoResetEntityState    -    {boolean=true} 是否自动重置所有提交到服务端的数据实体的状态。</li>
				 * </ul>
				 * @type Object[]
				 * @attribute
				 */
				updateItems: {
					getter: function() {
						var updateItems = this._updateItems;
						if (updateItems) {
							var self = this;
							jQuery.each(updateItems, function(i, updateItem) {
								if (updateItem.refreshMode == null) updateItem.refreshMode = "value";
								if (updateItem.autoResetEntityState == null) updateItem.autoResetEntityState = true;

								if (updateItem.dataSet == null) return;
								if (typeof updateItem.dataSet == "string") {
									updateItem.dataSet = self.get("view").id(updateItem.dataSet);
								}
								else if (!(updateItem.dataSet instanceof dorado.widget.DataSet)) {
									var ref = updateItem.dataSet;
									updateItem.dataSet = ref.view.id(ref.component);
								}
							});
						}
						return updateItems;
					}
				},

				/**
				 * 是否总是尝试执行命令，不论是否存在需要提交的数据。<br>
				 * 默认情况下，如果未收集到需要提交的数据此命令的execute()方法将不会执行实际的操作而是直接返回false。
				 * @type boolean
				 * @attribute
				 */
				alwaysExecute: {},

				/**
				 * 当前是否有需要提交的数据。
				 * @type boolean
				 * @attribute readOnly
				 */
				hasUpdateData: {
					readOnly: true,
					getter: function() {
						if (!this._updateItems.length) {
							return false;
						}
						else {
							try {
								var context = this.getResolveContext();
								return context.hasUpdateData;
							}
							catch(e) {
								if (e instanceof dorado.widget.UpdateAction.ValidateException) {
									dorado.Exception.removeException(e);
									return true;
								}
							}
						}
					}
				},

				executingMessage: {
					defaultValue: $resource("dorado.baseWidget.SubmitingData")
				}
			},

			EVENTS: /** @scope dorado.widget.UpdateAction.prototype */
			{
				beforeExecute: {
					interceptor: function(superFire, self, arg) {
						var retval = superFire(self, arg);
						this._realExecutingMessage = this._executingMessage;
						this._executingMessage = "none";
						this._realConfirmMessage = this._confirmMessage;
						this._confirmMessage = "none";
						return retval;
					}
				},

				/**
				 * 当数据将要被提交给Server之前触发的事件。
				 * @param {Object} self 事件的发起者，即组件本身。
				 * @param {Object} arg 事件参数。
				 * @param {Object[]} arg.dataItems 将要提交的数据。<br>
				 * 此数组中的每一个子对象对应了UpdateAction.updateItems属性中定义的一个更新项，即从相应的DataSet中提取出来的信息。该信息对象包含两个子属性：
				 * <ul>
				 * <li>alias    -    {String} 更新项的名称。</li>
				 * <li>data    -    {Object|Object[]} 以JSON或Array作为载体的提交数据。</li>
				 * </ul>
				 * @param {Object} arg.parameter 随本次操作一起被发送的提交参数。
				 * @param {boolean} #arg.processDefault=true 用于通知系统是否要继续完成后续动作。
				 * @return {boolean} 是否要继续后续事件的触发操作，不提供返回值时系统将按照返回值为true进行处理。
				 * @event
				 */
				beforeUpdate: {},

				/**
				 * 当数据Server完成了对提交数据的处理之后触发的事件。
				 * @param {Object} self 事件的发起者，即组件本身。
				 * @param {Object} arg 事件参数。
				 * @param {Object} arg.dataItems 提交的数据。<br>
				 * 此数组中的每一个子对象对应了UpdateAction.updateItems属性中定义的一个更新项，即从相应的DataSet中提取出来的信息。该信息对象包含两个子属性：
				 * <ul>
				 * <li>alias    -    {String} 更新项的名称。</li>
				 * <li>data    -    {Object|Object[]} 以JSON或Array作为载体的提交数据。</li>
				 * </ul>
				 * @param {Object} arg.parameter 随本次操作一起被发送的提交参数。
				 * @return {boolean} 是否要继续后续事件的触发操作，不提供返回值时系统将按照返回值为true进行处理。
				 * @event
				 */
				onUpdate: {},

				/**
				 * 当UpdateAction尝试获取每个UpdateItem对应的提交数据时触发的事件。<br>
				 * 此事件在提交过程中会针对每一个UpdateItem触发一次。
				 * @param {Object} self 事件的发起者，即组件本身。
				 * @param {Object} arg 事件参数。
				 * @param {Object} arg.updateItem 更新项。参考{@link dorado.widget.UpdateAction#attribute:updateItems}。
				 * @param {Object} #arg.data 要提交的数据。设置此参数就可以直接指定该更新想对应的提交数据。
				 * @return {boolean} 是否要继续后续事件的触发操作，不提供返回值时系统将按照返回值为true进行处理。
				 * @event
				 */
				onGetUpdateData: {}
			},

			constructor: function(id) {
				this._updateItems = [];
				$invokeSuper.call(this, arguments);
			},

			getResolveContext: function() {

				function mergeValidateContext(context, contextForMerge) {
					if (!context) return contextForMerge;

					if (VALIDATION_RESULT_CODE[contextForMerge.result] > VALIDATION_RESULT_CODE[context.result]) {
						context.result = contextForMerge.result;
					}
					context.info = context.info.concat(contextForMerge.info);
					context.ok = context.ok.concat(contextForMerge.ok);
					context.warn = context.warn.concat(contextForMerge.warn);
					context.error = context.error.concat(contextForMerge.error);
					context.executing = context.executing.concat(contextForMerge.executing);
					context.executingValidationNum += contextForMerge.executingValidationNum;
					return context;
				}

				function validateEntity(validateContext, entity, validateOptions, validateSubEntities) {
					if (entity.isDirty() && entity.state != dorado.Entity.STATE_DELETED) {
						validateOptions.context = {};
						entity.validate(validateOptions);
						validateContext = mergeValidateContext(validateContext, validateOptions.context);
					}

					if (validateSubEntities) {
						for(var p in entity._data) {
							if (p.charAt(0) == '$') continue;
							var v = entity._data[p];
							if (!v) continue;

							if (v instanceof dorado.Entity) {
								validateContext = validateEntity(validateContext, v, validateOptions, validateSubEntities)
							}
							else if (v instanceof dorado.EntityList) {
								var it = v.iterator();
								while(it.hasNext()) {
									var e = it.next();
									validateContext = validateEntity(validateContext, e, validateOptions, validateSubEntities)
								}
							}
						}
					}
					return validateContext;
				}

				var dataItems = [], updateInfos = [], aliasMap = {}, hasUpdateData = false, updateItems = this.get("updateItems");
				for(var i = 0; i < updateItems.length; i++) {
					var updateItem = updateItems[i];
					var dataSet = updateItem.dataSet;

					var options = updateItem.options;
					if (!options && options instanceof Object) {
						if (options.loadMode !== false) options.loadMode = true;
						if (options.includeUnsubmittableProperties !== true) options.includeUnsubmittableProperties = false;
						if (options.generateDataType !== false) options.generateDataType = true;
						if (options.generateState !== false) options.generateState = true;
						if (options.generateEntityId !== false) options.generateEntityId = true;
					}
					else {
						options = {
							loadMode: "never",
							includeUnsubmittableProperties: false,
							generateDataType: true,
							generateState: true,
							generateEntityId: true
						};
					}
					updateItem.options = options;

					options.firstResultOnly = updateItem.firstResultOnly;
					options.generateOldData = updateItem.submitOldData;
					options.simplePropertyOnly = updateItem.submitSimplePropertyOnly;

					var alias = updateItem.alias;
					if (dataSet) {
						alias = alias || dataSet._id;
						aliasMap[alias] = dataSet;
					}
					else if (!alias) {
						alias = "$alias" + i;
					}

					var dataPath = updateItem.dataPath || "!DIRTY_TREE";
					if (dataPath.indexOf("!DIRTY_TREE") >= 0) {
						options.entityFilter = filterCascadeDrityEntity;
						options.includeDeletedEntity = true;
						CASCADE_NOT_DRITY_ENTITYS = {};
					}
					else if (updateItem.submitSimplePropertyOnly) {
						options.entityFilter = filterCascadeDrityEntity;
						CASCADE_NOT_DRITY_ENTITYS = {};
					}
					var entityFilter = options.entityFilter;

					var data;
					if (dataSet) {
						dataSet.post();
						data = dataSet.queryData(dataPath, options);
					}
					var eventArg = {
						updateItem: updateItem,
						data: data
					};
					this.fireEvent("onGetUpdateData", this, eventArg);
					data = eventArg.data;

					if (data) {
						// validaton
						var validateContext, validateOptions = {
							force: false,
							validateSimplePropertyOnly: updateItem.submitSimplePropertyOnly
						};
						var validateSubEntities = !updateItem.submitSimplePropertyOnly;

						if (data instanceof Array) {
							for(var j = 0; j < data.length; j++) {
								var entity = data[j];
								if (entity instanceof dorado.Entity) {
									validateContext = validateEntity(validateContext, entity, validateOptions, validateSubEntities);
								}
							}
						}
						else if (data instanceof dorado.EntityList) {
							for(var it = data.iterator(); it.hasNext();) {
								var entity = it.next();
								validateContext = validateEntity(validateContext, entity, validateOptions, validateSubEntities);
							}
						}
						else if (data instanceof dorado.Entity) {
							validateContext = validateEntity(validateContext, data, validateOptions, validateSubEntities);
						}
					}

					dataItems.push({
						updateItem: updateItem,
						alias: alias,
						data: data,
						refreshMode: updateItem.refreshMode,
						autoResetEntityState: updateItem.autoResetEntityState
					});
				}

				if (validateContext) {
					if (validateContext.result == "invalid") {
						var errorMessage = $resource("dorado.baseWidget.SubmitInvalidData") + '\n';
						if (validateContext.error.length + validateContext.warn.length == 1) {
							if (validateContext.error.length) {
								errorMessage += validateContext.error[0].text;
							}
							else {
								errorMessage += validateContext.warn[0].text;
							}
						}
						else {
							errorMessage += $resource("dorado.baseWidget.SubmitValidationSummary", validateContext.error.length, validateContext.warn.length);
						}
						throw new dorado.widget.UpdateAction.ValidateException(errorMessage, validateContext);
					}
					else if (validateContext.executing.length > 0) {
						throw new dorado.ResourceException("dorado.baseWidget.SubmitValidatingData", validateContext.executing.length);
					}
				}

				for(var i = 0; i < dataItems.length; i++) {
					var dataItem = dataItems[i], updateItem = dataItem.updateItem, data = dataItem.data, options = updateItem.options;
					delete dataItem.updateItem;

					var entities = [], context = {
						entities: []
					};

					if (data) {
						if (data instanceof Array) {
							var v = data, data = [];
							hasUpdateData = hasUpdateData || (v.length > 0);
							for(var j = 0; j < v.length; j++) {
								var entity = v[j];
								if (entity instanceof dorado.Entity) {
									entities.push(entity);
									data.push(entity.toJSON(options, context));
								}
							}
						}
						else if (data instanceof dorado.EntityList || data instanceof dorado.Entity) {
							hasUpdateData = true;
							if (updateItem.refreshMode == "cascade") {
								if (data instanceof dorado.Entity) {
									if (updateItem.refreshMode == "cascade") entities.push(data);
								}
								else {
									for(var it = data.iterator(); it.hasNext();) {
										var entity = it.next();
										if (updateItem.refreshMode == "cascade") entities.push(entity);
									}
								}
							}
							data = data.toJSON(options, context);
						}
					}

					if ((!data || !data.$isWrapper) && updateItem.dataSet) {
						options.acceptAggregationDataType = true;
						var dataType = updateItem.dataSet.getDataType(updateItem.dataPath, options);
						if (dataType) {
							if (dataType instanceof dorado.AggregationDataType && !data && !(data instanceof Array)) {
								dataType = dataType.get("elementDataType");
							}
							data = {
								$isWrapper: true,
								$dataType: dataType._id,
								data: data
							}
						}
					}
					dataItem.data = data;

					updateInfos.push({
						alias: dataItem.alias,
						refreshMode: updateItem.refreshMode,
						entities: ((updateItem.refreshMode == "cascade") ? entities : context.entities)
					});
				}

				return {
					aliasMap: aliasMap,
					updateInfos: updateInfos,
					dataResolverArg: {
						dataItems: dataItems,
						parameter: this._parameter,
						sysParameter: this._sysParameter ? this._sysParameter.toJSON() : undefined,
						view: this._view
					},
					hasUpdateData: hasUpdateData
				};
			},

			doExecuteSync: function() {
				return this.doExecuteAsync();
			},

			doExecuteAsync: function(callback) {
				var confirmMessage = this._realConfirmMessage, executingMessage = this._realExecutingMessage;

				this._executingMessage = executingMessage;
				delete this._realExecutingMessage;
				this._confirmMessage = confirmMessage;
				delete this._realConfirmMessage;

				function processEntityStates(entityStates, context) {

					function processEntity(entity, entityStates, refreshMode) {
						if (!entity.entityId) return;

						var b;
						if (refreshMode != "cascade") {
							var data = entity.getData();
							for(var p in data) {
								if (!data.hasOwnProperty(p)) continue;
								var v = data[p];
								if (v instanceof Object && v.entityId) {
									b = processEntity(v, entityStates) || b;
								}
							}
						}

						entity.disableEvents = true;
						try {
							var state = entityStates[entity.entityId] || dorado.Entity.STATE_NONE;
							if (state.constructor == Number) {
								delete entity._oldData;
								if (state == dorado.Entity.STATE_DELETED) {
									entity.remove(true);
								}
								else if (entity.state == state) {
									return b;
								}
								else if (state == dorado.Entity.STATE_NONE) {
									entity.resetState();
								}
								else {
									entity.setState(state);
								}
							}
							else {
								var s = state.$state || dorado.Entity.STATE_NONE;
								delete state.$state;
								if (refreshMode == "cascade") {
									for(var p in state) {
										if (state.hasOwnProperty(p)) {
											var pd = entity.getPropertyDef(p);
											if (pd && !pd._submittable) delete state[p];
										}
									}
									entity.fromJSON(state);
								}
								else {
									var dataType = entity.dataType;
									if (dataType) {
										dataType.set("validatorsDisabled", true);
									}
									for(var p in state) {
										if (state.hasOwnProperty(p)) {
											var pd = entity.getPropertyDef(p);
											if (pd && pd._submittable) {
												var dt = pd.get("dataType");
												if (dt instanceof dorado.AggregationDataType || dt instanceof dorado.EntityDataType) continue;
												entity.set(p, state[p]);
											}
										}
									}
									if (dataType) {
										dataType.set("validatorsDisabled", false);
									}
								}
								delete entity._oldData;

								if (s == dorado.Entity.STATE_NONE) {
									entity.resetState();
								}
								else {
									entity.setState(s);
								}
							}
						}
						finally {
							entity.disableEvents = false;
						}
						return true;
					}

					function processUpdateInfo(updateInfo, entityStates) {
						if (updateInfo.refreshMode == "none") return false;
						var b = false, entities = updateInfo.entities;
						if (updateInfo.refreshMode == "cascade") {
							var map = {};
							for(var i = 0; i < entities.length; i++) {
								var entity = entities[i];
								map[entity.entityId] = entity;
							}
							for(var entityId in entityStates) {
								if (entityStates.hasOwnProperty(entityId)) {
									var entity = map[entityId];
									if (entity) {
										b = processEntity(entity, entityStates, updateInfo.refreshMode) || b;
									}
								}
							}
						}
						else {
							for(var i = 0; i < entities.length; i++) {
								var entity = entities[i];
								b = processEntity(entity, entityStates, updateInfo.refreshMode) || b;
							}
						}
						return b;
					}

					var updateInfos = context.updateInfos, changedDataSets = [];
					for(var i = 0; i < updateInfos.length; i++) {
						var updateInfo = updateInfos[i], alias = updateInfo.alias, dataSet = context.aliasMap[alias];
						if (!dataSet && updateInfo.entities.length) {
							dataSet = dorado.widget.DataSet.getOwnerDataSet(updateInfo.entities[0]);
						}

						if (dataSet) dataSet.disableObservers();
						try {
							if (processUpdateInfo(updateInfos[i], entityStates) && dataSet) {
								changedDataSets.push(dataSet);
							}
						}
						finally {
							if (dataSet) dataSet.enableObservers();
						}
					}

					jQuery.each(changedDataSets, function(i, dataSet) {
						dataSet.notifyObservers();
					});
				}

				function doUpdate(context, dataResolverArg) {
					var eventArg = {
						dataItems: dataResolverArg.dataItems,
						parameter: dataResolverArg.parameter,
						processDefault: true
					};
					this.fireEvent("beforeUpdate", this, eventArg);
					if (eventArg.processDefault && this._dataResolver) {
						var dataResolver = this._dataResolver;
						dataResolver.supportsEntity = this._supportsEntity;
						dataResolver.dataTypeRepository = this.get("dataTypeRepository");
						dataResolver.message = executingMessage ? executingMessage : "";
						dataResolver.modal = this._modal;
						if (callback) {
							return dataResolver.resolveAsync(dataResolverArg, {
								scope: this,
								callback: function(success, result) {
									if (success) processEntityStates.call(this, result.entityStates, context);
									$callback(callback, success, (success) ? result.returnValue : result);
									this.fireEvent("onUpdate", this, eventArg);
								}
							});
						}
						else {
							var result = dataResolver.resolve(dataResolverArg);
							processEntityStates.call(this, result.entityStates, context);
							this.fireEvent("onUpdate", this, eventArg);
							return result.returnValue;
						}
					}
					else {
						$callback(callback, true);
					}
				}

				var context;
				try {
					context = this.getResolveContext();
				}
				catch(e) {
					if (e instanceof dorado.widget.UpdateAction.ValidateException) {
						dorado.Exception.removeException(e);
						var eventArg = {
							success: false,
							error: e,
							processDefault: true
						};
						this.fireEvent("onFailure", this, eventArg);
						if (eventArg.processDefault) {
							if (dorado.widget.UpdateAction.alertException) {
								dorado.widget.UpdateAction.alertException(e);
							}
							else {
								throw e;
							}
						}
						throw new dorado.AbortException();
					}
					else {
						throw e;
					}
				}

				var dataResolverArg = context.dataResolverArg;
				if (this._alwaysExecute || !this._updateItems.length || context.hasUpdateData) {
					if (confirmMessage && confirmMessage != "none") {
						var self = this;
						dorado.MessageBox.confirm(confirmMessage, {
							detailCallback: function(buttonId) {
								if (buttonId == "yes") {
									return doUpdate.call(self, context, dataResolverArg);
								}
								else {
									$callback(callback, false);
								}
							}
						});
					}
					else {
						return doUpdate.call(this, context, dataResolverArg);
					}
				}
				else {
					if (!this._alwaysExecute && this._updateItems.length && !context.hasUpdateData) {
						dorado.widget.NotifyTipManager.notify($resource("dorado.baseWidget.NoDataToSubmit"));
					}

					if (callback) {
						$callback(callback, false);
					}
					else {
						return false;
					}
				}
			}
		});

	dorado.widget.UpdateAction.ValidateException = $extend(dorado.Exception, {
		constructor: function(message, validateContext) {
			$invokeSuper.call(this, arguments);
			this.validateContext = validateContext;
		}
	});
})();

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

( function() {

	/**
	 * @author Benny Bao (mailto:benny.bao@bstek.com)
	 * @component General
	 * @class 数据集。
	 * <p>
	 * 用于封装一组数据（指实体对象或实体集合）的控件。
	 * </p>
	 * @extends dorado.widget.Component
	 */
	dorado.widget.DataSet = $extend(dorado.widget.Component, /** @scope dorado.widget.DataSet.prototype */
	{
		$className: "dorado.widget.DataSet",

		ATTRIBUTES: /** @scope dorado.widget.DataSet.prototype */
		{

			/**
			 * 数据集中数据的自动装载方式。
			 * <p>
			 * 该属性具有下列两中可能的取值，默认情况下系统将按照lazy的方式来进行处理：
			 * <ul>
			 * <li>onReady - 当数据集的状态变为ready时自动开始装载数据。注意：此处所指的的异步装载方式。</li>
			 * <li>lazy - 当数据集的getData()或getDataAsync()方法第一次被调用时开始装载数据。</li>
			 * <li>manual - 当数据集的flush()或flushAsync()方法被调用时才开始装载数据。</li>
			 * </ul>
			 * </p>
			 * @type String
			 * @attribute
			 * @default lazy
			 */
			loadMode: {
				writeBeforeReady: true,
				defaultValue: "lazy"
			},

			/**
			 * 数据集中数据的数据类型。
			 * <p>
			 * 此属性对于数据集而言并非必须定义的，很多时候系统可以根据dataProvider的设置自行获得数据的数据类型。
			 * 但当一个数据集并不与任何dataProvider关系时，改属性往往是必须定义的。<br>
			 * 另外，如果为此属性指定的数据类型，那么必须保证该数据类型与dataProvider返回的数据的数据类型是一致的。
			 * </p>
			 * @type dorado.DataType
			 * @attribute
			 */
			dataType: {
				getter: function() {
					return this.getDataType();
				}
			},

			/**
			 * 数据集中封装的数据。
			 * @type Object|dorado.Entity|dorado.EntityList
			 * @attribute
			 * @see dorado.widget.DataSet#getData
			 */
			data: {
				getter: function() {
					return this.getData();
				},
				setter: function(data) {
					if (data && data instanceof Object && !(data instanceof Array)) {
						data.$state = dorado.Entity.STATE_NONE;
					}
					if (this._ready) this.setData(data);
					else this._data = data;
				}
			},

			/**
			 * 数据提供器。
			 * @type dorado.DataProvider
			 * @attribute
			 */
			dataProvider: {
				setter: function(dp) {
					this._dataProvider = (dp && dp.constructor === String) ? dorado.DataProvider.create(dp) : dp;
				}
			},

			/**
			 * 装载数据时使用的参数，及传递给数据提供器的参数。
			 * @type Object
			 * @attribute
			 */
			parameter: {
				setter: function(parameter) {
					if (this._parameter instanceof dorado.util.Map && parameter instanceof dorado.util.Map) {
						this._parameter.put(parameter);
					}
					else {
						this._parameter = parameter;
					}
				}
			},

			/**
			 * 装载数据时使用的分页大小，即按照每页多少条记录来进行分页装载。
			 * @type int
			 * @attribute
			 */
			pageSize: {
				defaultValue: 0
			},

			/**
			 * 初始状态下要装载的数据页号。从1开始的数字。
			 * @type int
			 * @attribute
			 * @default 1
			 */
			pageNo: {
				defaultValue: 1
			},

			/**
			 * 数据集是否已完成了初始的数据装载过程。
			 * @type boolean
			 * @attribute readOnly
			 */
			dataLoaded: {
				readOnly: true
			},

			/**
			 * 数据集是否只读。
			 * @type boolean
			 * @attribute
			 */
			readOnly: {
				notifyObservers: true
			},
			
			/**
			 * 是否要根据parameter参数将每次装载的数据缓存起来。
			 * @type boolean
			 * @attribute
			 */
			cacheable: {}
		},

		EVENTS: /** @scope dorado.widget.DataSet.prototype */
		{
			/**
			 * 当DataSet将要尝试数据装载之前触发的事件。
			 * @param {Object} self 事件的发起者，即控件本身。
			 * @param {Object} arg 事件参数。
			 * @param {int} arg.pageNo 当前装载的页号。
			 * @param {Object} #arg.processDefault = true 用于通知系统是否要继续完成后续动作。
			 * @return {boolean} 是否要继续后续事件的触发操作，不提供返回值时系统将按照返回值为true进行处理。
			 * @event
			 */
			beforeLoadData: {},

			/**
			 * 当数据装载完成时触发的事件。
			 * <p>
			 * 注意：当数据完成装载并不代表就一定有数据被装载到本地，此事件仅仅表示成功的完成了一次数据装载的动作。
			 * </p>
			 * @param {Object} self 事件的发起者，即控件本身。
			 * @param {Object} arg 事件参数。
			 * @param {int} arg.pageNo 当前装载的页号。
			 * @return {boolean} 是否要继续后续事件的触发操作，不提供返回值时系统将按照返回值为true进行处理。
			 * @event
			 */
			onLoadData: {},
			
			/**
			 * @deprecated
			 * @event
			 */
			onDataLoad: {}
		},

		_disableObserversCounter: 0,

		constructor: function(configs) {
			this._dataPathCache = {};
			this._observers = [];
			$invokeSuper.call(this, arguments);
		},
		
		/**
		 * 读取指定的属性值或提取DataSet中的数据。
		 * <p>
		 * 此方法在{@link dorado.AttributeSupport#get}的基础上做了增强。
		 * 除了原有的读取属性值的功能之外，此方法还另外提供了下面的用法。
		 * <ul>
		 * 	<li>当传入一个以data:开头的字符串时，data:后面的所有内容将被识别成DataPath。</li>
		 * </ul>
		 * </p>
		 * <p>
		 * <b>需要注意的是，此处的data:语法不能被使用在DataSet的set方法中！</b>
		 * </p>
		 * @param {Object} attr 属性值或其他表达式。
		 * @return {Object} 读取到的属性值或提取到的子对象
		 * @see dorado.AttributeSupport#get
		 * 
		 * @example
		 * //上面的两句代码功能相同
		 * var employees = ds.get("data:#.employees");
		 * var employees = ds.queryData("#.employees");
		 */
		get: function(attr) {
			if (attr.substring(0, 5) === "data:") {
				var dataPath = attr.substring(5);
				return this.queryData(dataPath);
			} else {
				return $invokeSuper.call(this, [attr]);
			}
		},
		
		doSet: function(attr, value, skipUnknownAttribute, lockWritingTimes) {
			$invokeSuper.call(this, [attr, value, skipUnknownAttribute, lockWritingTimes]);
			if (!this._ready) return;
			var def = this.ATTRIBUTES[attr];
			if (def && def.notifyObservers) {
				dorado.Toolkits.setDelayedAction(this, "$refreshDelayTimerId", this.notifyObservers, 50);
			}
		},

		onReady: function() {
			$invokeSuper.call(this);
			
			if (this._observers.length > 0) {
				for (var i = 0; i < this._observers; i++) {
					this.retrievePreloadConfig(this._observers[i]);
				}
				
				if (this._data) {
					this.setData(this._data);
				} else {
					this.sendMessage(0);
				}
			}
			if (this._loadMode == "onReady") {
				if (this._view) this._view._loadingDataSet.push(this);
				this.getDataAsync();
			}
		},

		/**
		 * 设置数据集封装的数据。
		 * @param {Object|dorado.Entity|dorado.EntityList} data 数据。
		 */
		setData: function(data) {
			var dataType = this.getDataType(null, true), oldData = this._data;
			if (dataType || this._getDataCalled) {
				if (data != null) {
					if (!(data instanceof dorado.EntityList || data instanceof dorado.Entity)) {
						var state = data.$state;
						data = dorado.DataUtil.convert(data, this.getDataTypeRepository(), dataType);
						data.dataProvider = this._dataProvider;
						if (data instanceof dorado.Entity && state == null) data.setState(dorado.Entity.STATE_NEW);
					}
				}
				else if (dataType instanceof dorado.AggregationDataType) {
					data = dorado.DataUtil.convert([], this.getDataTypeRepository(), dataType);
				}

				if (oldData && (oldData instanceof dorado.EntityList || oldData instanceof dorado.Entity)) {
					oldData._setObserver(null);
				}

				if (data) {
					if (data.dataType == null) {
						data.dataType = dataType;
					}
					else if (dataType && dataType != data.dataType) {
						var mismatch = true;
						if (dataType instanceof dorado.EntityDataType && data.dataType) {
							mismatch = (data.dataType.getElementDataType() != dataType);
						}
						if (mismatch) {
							throw new dorado.ResourceException("dorado.widget.DataTypeNotAccording", this._id);
						}
					}
				}
				this._data = data;
				this._dataLoaded = true;
			}
			else {
				if (data && !(data instanceof dorado.Entity || data instanceof dorado.EntityList)) {
					if (data instanceof Array) {
						data = new dorado.EntityList(data);
					}
					else if (data instanceof Object && !(data instanceof Date)) {
						data = new dorado.Entity(data);
					}
				}
				this._data = data;
			}

			if (data && (data instanceof dorado.EntityList || data instanceof dorado.Entity)) {
				data._setObserver(this);
				this._dataPathCache = {};
			}
			if (oldData != data) this.sendMessage(0);
		},
		
		/**
		 * 向数据集中添加一条顶层记录。
		 * <li>如果数据集的数据类型是集合，那么此方法表示向顶层集合中添加一条记录。</li>
		 * <li>如果数据集的数据类型是实体类型，那么此方法表示直接新建一条记录并将其设置为数据集的顶层数据。
		 * 如果在执行此方法之前数据集的顶层数据不是空，那么此方法将会报错。</li>
		 * @param {dorado.Entity|Object} [data] 可以通过此参数传入一个JSON来初始化新增的记录，也可以直接传入要新增的Entity。
		 * @return {dorado.Entity} 新创建的数据实体。
		 */
		insert: function(data) {
			var dataType = this.getDataType(null, true), entity;
			if (dataType instanceof dorado.AggregationDataType) {
				if (this._data == null) {
					this.setData([]);
				}
				var entityList = this.getData();
				entity = entityList.insert(data);
			}
			else if (dataType instanceof dorado.EntityDataType) {
				if (this._data == null) {
					if (data instanceof dorado.Entity) {
						entity = data;
					} else {
						entity = new dorado.Entity(data, this.getDataTypeRepository(), dataType);
						entity.setState(dorado.Entity.STATE_NEW);
					}
					this.setData(entity);
				}
				else {
					throw new dorado.ResourceException("dorado.widget.DataSetNotEmptyException", this._id);
				}
			}
			else if (dataType) {
				throw new dorado.ResourceException("dorado.widget.DataSetNotSupportInsert", this._id);
			}
			else {
				var data = this.getData();
				if (data instanceof dorado.EntityList) {
					entity = data.insert();
				}
				else {
					entity = new dorado.Entity();
					this.setData(entity);
				}
			}
			return entity;
		},

		doLoad: function(callback, flush) {
			var data = this._data, shouldFireOnLoadData = false;
			
			var dataCache, hashCode;
			if (this._cacheable) {
				dataCache = this._dataCache;
				if (!dataCache) {
					this._dataCache = dataCache = {};
				}
				hashCode = dorado.Object.hashCode(this._parameter) + '-' + dorado.Object.hashCode(this._sysParameter);
				data = dataCache[hashCode];
				this.setData(data);
			}
			
			if (data === undefined || flush) {
				if (this._dataProvider) {
					data = this._dataPipe;
					if (!data) {
						data = this._dataPipe = new dorado.DataSetDataPipe(this);
						shouldFireOnLoadData = true;
					}
				}
				else {
					this.setData(null);
				}
			}
			
			if (data instanceof dorado.DataPipe) {
				var arg = {
					dataSet: this,
					pageNo: 1
				};
				
				this.fireEvent("beforeLoadData", this, arg);
				if (arg.processDefault === false) {
                    delete this._dataPipe;
                    if (callback) $callback(callback, false);
                    return;
                }

				if (flush) this.discard();
				
				var pipe = data;
				if (callback) {
					var isNewPipe = (pipe.runningProcNum == 0);
					pipe.getAsync( {
						scope: this,
						callback: function(success, result) {
							delete this._dataPipe;
							if (isNewPipe) {
								this._data = null;
								this.sendMessage(DataSet.MESSAGE_LOADING_END, arg);
								this._loadingData = false;
								delete this._data;
							}

							if (success) {
								if (shouldFireOnLoadData) {
									this.setData(result);
									if (this._cacheable) {
										dataCache[hashCode] = this.getData();
									}
									
									/* @deprecated */
									this.fireEvent("onDataLoad", this, arg);
									
									this.fireEvent("onLoadData", this, arg);
								}
							}
							else {
								if (shouldFireOnLoadData) this.setData(null);
							}
							
							$callback(callback, success);
						}
					});
					if (isNewPipe) {
						this._loadingData = true;
						this.sendMessage(DataSet.MESSAGE_LOADING_START, arg);
					}
					return;
				}
				else {
					var shouldAbortAsyncProcedures = dorado.Setting["common.abortAsyncLoadingOnSyncLoading"];
					if (pipe.runningProcNum > 0 && !shouldAbortAsyncProcedures) {
						throw new dorado.ResourceException("dorado.widget.GetDataDuringLoading", this._id);
					}
					
					try {
						var data = pipe.get();
						this.setData(data);
						pipe.abort(true, data);
					}
					catch (e) {
						pipe.abort(false, e);
						this.setData(null);
						throw e;
					}
					
					delete this._dataPipe;
					if (this._cacheable) {
						dataCache[hashCode] = this.getData();
					}
					
					/* @deprecated */
					this.fireEvent("onDataLoad", this);
					
					this.fireEvent("onLoadData", this);
				}
			}
			else {
				if (flush) this.discard();
				if (callback) $callback(callback, true);
			}
		},

		/**
		 * 以同步方式装载数据集中的数据。
		 * <p>
		 * 如果数据集并不支持数据装载操作，则此方法不会产生任何效果。
		 * </p>
		 * @private
		 */
		load: function() {
			return this.doLoad();
		},

		/**
		 * 以异步步方式装载数据集中的数据。
		 * <p>
		 * 如果数据集并不支持数据装载操作，则此方法不会产生任何效果。
		 * </p>
		 * @private
		 * @param {dorado.Callback|Function} callback 回调对象。
		 */
		loadAsync: function(callback) {
			this.doLoad(callback || dorado._NULL_FUNCTION);
		},

		doGetData: function(path, options, callback) {
			
			function pollEvaluate(data, dataPath, option, callback) {
				var totalAsyncExecutionTimes = dorado.DataPipe.MONITOR.asyncExecutionTimes;
				var data = dataPath.evaluate(data, options);
				if (dorado.DataPipe.MONITOR.asyncExecutionTimes - totalAsyncExecutionTimes > 0) {
					setTimeout(function() {
						pollEvaluate(data, dataPath, option, callback);
					}, 60);
				}
				else {
					$callback(callback, true, data);
				}
			}

			function evaluatePath(path, options, callback) {
				var data = this._data;
				if (data instanceof dorado.DataPipe) return null;
				
				if (data) {
					if (!(data instanceof dorado.EntityList || data instanceof dorado.Entity)) {
						this.setData(data);
						data = this._data;
					}

					if (!(path && (path.charAt(0) == '!' || path.indexOf(".!")))) {
						var key = (path || "$EMPTY") + '~' + optionsCode;
						var cachedData = this._dataPathCache[key];
						if (cachedData !== undefined) {
							// 下面两行是为了确保MESSAGE_LOADING_START消息总是能被正确的处理
							dorado.DataPipe.MONITOR.asyncExecutionTimes += (cachedData.asyncExecutionTimes || 0);
							dorado.DataPipe.MONITOR.executionTimes += (cachedData.asyncExecutionTimes || 0);
							if (callback) {
								$callback(callback, true, cachedData.data);
								return;
							} else {
								return cachedData.data;
							}
						}
					}
					
					var totalAsyncExecutionTimes = dorado.DataPipe.MONITOR.asyncExecutionTimes;
					var dataPath = dorado.DataPath.create(path);
					if (data) data = dataPath.evaluate(data, options);
					
					var asyncExecutionTimes = dorado.DataPipe.MONITOR.asyncExecutionTimes - totalAsyncExecutionTimes;
					this._dataPathCache[key] = {
						data: data,
						asyncExecutionTimes: asyncExecutionTimes
					};
					
					if (callback) {
						if (asyncExecutionTimes < 1) {
							$callback(callback, true, data);
						}
						else {
							var pollOption = dorado.Core.clone(option);
							pollOption.loadMode = "always";
							setTimeout(function() {
								pollEvaluate(data, dataPath, pollOption, callback);
							}, 100);
						}
					}
					else {
						return data;
					}
				} else if (!path) {
					var dataType = this.getDataType(null, true);
					if (dataType instanceof dorado.AggregationDataType) {
						this.setData([]);
						data = this._data;
					}
					
					if (callback) {
						$callback(callback, true, data);
					}
					else {
						return data;
					}
				}
			}

			if (typeof options == "string") {
				options = {
					loadMode: options
				};
			}
			else options = options || {};

			var optionsCode, loadMode = options.loadMode;
			if (!loadMode) {
				if (this._loadMode == "manual") {
					loadMode = "never";
				}
				else {
					loadMode = "always";
				}
			}
			optionsCode = loadMode;
			if (options.firstResultOnly) optionsCode += 'F';
			if (options.acceptAggregation) optionsCode += 'A';

			this._getDataCalled = true;
			if ((options.flush || this._data === undefined) && loadMode != "never") {
				var sysParameter;			
				if (this._preloadConfigsMap) {
					var preloadConfigs = this._preloadConfigsMap[path || "#EMPTY"];
					if (preloadConfigs) {
						sysParameter = this._sysParameter;
						if (!sysParameter) this._sysParameter = sysParameter = new dorado.util.Map();
						sysParameter.put("preloadConfigs", preloadConfigs);
					}
				}
				
				if (callback) {
					this.doLoad( {
						scope: this,
						callback: function(success, result) {
							if (success) result = evaluatePath.call(this, path, options, callback);
						}
					}, options.flush);
					if (sysParameter) sysParameter.remove("preloadConfigs");
					return;
				}
				else {
					if (loadMode == "auto") {
						this.doLoad(dorado._NULL_FUNCTION, options.flush);
						if (sysParameter) sysParameter.remove("preloadConfigs");
						return;
					}
					else {
						this.doLoad(null, options.flush);
						if (sysParameter) sysParameter.remove("preloadConfigs");
					}
				}
			}

			if (callback) {
				evaluatePath.call(this, path, options, callback);
			}
			else {
				return evaluatePath.call(this, path, options, null);
			}
		},

		/**
		 * 返回数据集封装的数据。
		 * <p>
		 * 如果指定了数据路径(path)参数，此方法将利用DataPath来对DataSet中的数据进行提取。
		 * 不过在默认情况下将启用{@link dorado.DataPath.evaluate}的firstResultOnly和acceptAggregation这两个选项。
		 * </p>
		 * @param {String} [path] 数据路径。
		 * @param {String|Object} [options] 选项。
		 * <p>
		 * 此参数具有两种设定方式。当直接传入字符串时，dorado会将此逻辑值直接认为是针对loadMode子属性的值；
		 * 当传入的是一个对象时，dorado将尝试识别该对象中的子属性。 其支持的子属性请参考{@link dorado.DataPath.evaluate}方法的执行选项。
		 * 除此之外options还支持一些额外的选项，见下面的参数说明。
		 * </p>
		 * @param {String} options.loadMode="always" 数据装载模式。<br>
		 * 包含下列三种取值:
		 * <ul>
		 * <li>always - 如果有需要总是装载尚未装载的延时数据。</li>
		 * <li>auto - 如果有需要则自动启动异步的数据装载过程，但对于本次方法调用将返回数据的当前值。</li>
		 * <li>never - 不会激活数据装载过程，直接返回数据的当前值。</li>
		 * </ul>
		 * @param {boolean} options.flush 是否要清除DataSet中原有的数据并重新提取数据。
		 * @return {dorado.Entity|dorado.EntityList|any}
		 * @see dorado.DataPath#evaluate
		 * @see dorado.widget.DataSet#queryData
		 */
		getData: function(path, options) {
			options = options || {};
			if (options.firstResultOnly == null) options.firstResultOnly = true;
			if (options.acceptAggregation == null) options.acceptAggregation = true;
			return this.doGetData(path, options);
		},

		/**
		 * 以异步操作的方式获得数据集封装的数据。
		 * <p>
		 * 如果指定了数据路径(path)参数，此方法将利用DataPath来对DataSet中的数据进行提取。
		 * 不过在默认情况下将启用{@link dorado.DataPath.evaluate}的firstResultOnly和acceptAggregation这两个选项。
		 * </p>
		 * @param {String} [path] 数据路径。
		 * @param {Function|dorado.Callback} callback 回调对象，传入回调对象的参数即为提取到的数据。
		 * @param {String|Object} [options] 选项。
		 * <p>
		 * 此参数具有两种设定方式。当直接传入字符串时，dorado会将此逻辑值直接认为是针对loadMode子属性的值；
		 * 当传入的是一个对象时，dorado将尝试识别该对象中的子属性。 其支持的子属性请参考{@link dorado.DataPath.evaluate}方法的执行选项。
		 * 除此之外options还支持一些额外的选项，见下面的参数说明。
		 * </p>
		 * @param {String} options.loadMode="always" 数据装载模式。<br>
		 * 包含下列三种取值:
		 * <ul>
		 * <li>always - 如果有需要总是装载尚未装载的延时数据。</li>
		 * <li>auto - 对于异步操作而言此选项没有实际意义，系统内部的处理方法将与always完全一致。</li>
		 * <li>never - 不会激活数据装载过程，直接返回数据的当前值。</li>
		 * </ul>
		 * @param {boolean} options.flush 是否要清除DataSet中原有的数据并重新提取数据。
		 * @see #getData
		 * @see dorado.DataPath#evaluate
		 * @see dorado.widget.DataSet#queryDataAsync
		 */
		getDataAsync: function(path, callback, options) {
			options = options || {};
			if (options.firstResultOnly == null) options.firstResultOnly = true;
			if (options.acceptAggregation == null) options.acceptAggregation = true;
			this.doGetData(path, options, callback || dorado._NULL_FUNCTION);
		},
		
		/**
		 * 利用DataPath来查询数据集中的数据。
		 * @param {String} path 数据路径。
		 * @param {String|Object} [options] 选项。
		 * <p>
		 * 此参数具有两种设定方式。当直接传入字符串时，dorado会将此逻辑值直接认为是针对loadMode子属性的值；
		 * 当传入的是一个对象时，dorado将尝试识别该对象中的子属性。 其支持的子属性请参考{@link dorado.DataPath.evaluate}方法的执行选项。
		 * 除此之外options还支持一些额外的选项，见下面的参数说明。
		 * </p>
		 * @param {String} options.loadMode="always" 数据装载模式。<br>
		 * 包含下列三种取值:
		 * <ul>
		 * <li>always - 如果有需要总是装载尚未装载的延时数据。</li>
		 * <li>auto - 如果有需要则自动启动异步的数据装载过程，但对于本次方法调用将返回数据的当前值。</li>
		 * <li>never - 不会激活数据装载过程，直接返回数据的当前值。</li>
		 * </ul>
		 * @param {boolean} options.flush 是否要清除DataSet中原有的数据并重新提取数据。
		 * @return {dorado.Entity|[dorado.Entity]}
		 * @see dorado.DataPath#evaluate
		 * @see dorado.widget.DataSet#getData
		 */
		queryData: function(path, options) {
			return this.doGetData(path, options);
		},
		
		/**
		 * 利用DataPath来查询数据集中的数据。
		 * @param {String} path 数据路径。
		 * @param {Function|dorado.Callback} callback 回调对象，传入回调对象的参数即为提取到的数据。
		 * @param {Stringed|Object} [options] 选项。
		 * <p>
		 * 此参数具有两种设定方式。当直接传入字符串时，dorado会将此逻辑值直接认为是针对loadMode子属性的值；
		 * 当传入的是一个对象时，dorado将尝试识别该对象中的子属性。 其支持的子属性请参考{@link dorado.DataPath.evaluate}方法的执行选项。
		 * 除此之外options还支持一些额外的选项，见下面的参数说明。
		 * </p>
		 * @param {String} options.loadMode="always" 数据装载模式。<br>
		 * 包含下列三种取值:
		 * <ul>
		 * <li>always - 如果有需要总是装载尚未装载的延时数据。</li>
		 * <li>auto - 对于异步操作而言此选项没有实际意义，系统内部的处理方法将与always完全一致。</li>
		 * <li>never - 不会激活数据装载过程，直接返回数据的当前值。</li>
		 * </ul>
		 * @param {boolean} options.flush 是否要清除DataSet中原有的数据并重新提取数据。
		 * @see #getData
		 * @see dorado.DataPath#evaluate
		 * @see dorado.widget.DataSet#getDataAsync
		 */
		queryDataAsync: function(path, callback, options) {
			this.doGetData(path, options, callback || dorado._NULL_FUNCTION);
		},
		
		/**
		 * 以同步方式刷新DataSet中的数据。即清除DataSet中原有的数据并重新提取。
		 * 其作用等同于<pre>dataSet.getData(null, { flush: true });</pre>
		 * @see dorado.widget.DataSet#flushAsync
		 * @see dorado.widget.DataSet#getData
		 */
		flush: function() {
			this.getData(null, {
				flush: true,
				loadMode: "always"
			});
		},
		
		/**
		 * 以异步方式刷新DataSet中的数据。即清除DataSet中原有的数据并重新提取。
		 * 其作用等同于<pre>dataSet.getDataAsync(null, null, { flush: true });</pre>
		 * @param {Function|Object} [options] 执行选项。
		 * 此参数有两种定义方式：
		 * <ul>
		 * 	<li>当参数的类型是Function时，系统会将其解释为下面提及的options.callback参数。<li>
		 * 	<li>当参数的类型是Object时，系统会将其解释可能包含更多子设置的执行选项。具体支持的子设置见下面的描述。<li>
		 * </ul>
		 * @param {Function|dorado.Callback} [options.callback] 回调对象，传入回调对象的参数即为提取到的数据。
		 * @param {boolean} [options.modal] 是否要在刷新动作执行期间显示模态操作的提示信息。
		 * @param {String} [options.executingMessage] 如果要显示模态操作的提示信息，那么应该显示怎样的文字提示。
		 * @see dorado.widget.DataSet#flush
		 * @see dorado.widget.DataSet#getDataAsync
		 */
		flushAsync: function(options) {
			if (options && typeof options == "function") {
				options = {
					callback: options
				};
			} else {
				options = options || {};
			}
			var callback = options.callback, modal = options.modal, executingMessage = options.executingMessage;
			var self = this, taskId;
			
			if (modal) {
				taskId = dorado.util.TaskIndicator.showTaskIndicator(executingMessage || $resource("dorado.data.DataProviderTaskIndicator"), "main");
			}
			try {
				this.getDataAsync(null, {
					callback: function(success, result) {
						if (taskId) dorado.util.TaskIndicator.hideTaskIndicator(taskId);
						$callback(callback, success, result, {
							scope: self._view
						});
					}
				}, {
					flush: true,
					loadMode: "always"
				});
			}
			finally {
				if (taskId) dorado.util.TaskIndicator.hideTaskIndicator(taskId);
			}
		},

		/**
		 * 返回数据集的数据类型。如果指定了数据路径(path)参数，此方法将提取数据路径所对应的数据类型。
		 * <p>
		 * 需要特别注意的是，此方法默认情况下总是会返回实体数据类型({@link dorado.EntityDataType})，而不是({@link dorado.AggregationDataType})。<br>
		 * 例如：假设DataSet的实际数据类型为"[Employee]"，此时调用DataSet的getDataType()方法，我们将得到数据类型Employee，而不是[Employee]。<br>
		 * 如果我们确实需要获得数据类型[Employee]，应使用options来改变此方法的执行行为。
		 * </p>
		 * @param {String} [path] 数据路径。
		 * @param {Object} [options] 传递给{@link dorado.DataPath.getDataType}方法的选项参数。
		 * @return {dorado.DataType} 取得的数据类型。
		 * @see dorado.DataPath#getDataType
		 */
		getDataType: function(path, options) {
			var loadMode;
			if (typeof options == "string") {
				loadMode = options;
			}
			else {
				loadMode = options ? options.loadMode : undefined;
			}

			var dataType = dorado.LazyLoadDataType.dataTypeGetter.call(this);
			if (!dataType && this._data) dataType = this._data.dataType;

			if (dataType) {
				return dorado.DataPath.create(path).getDataType(dataType, options);
			}
			else {
				return null;
			}
		},

		/**
		 * @private
		 * 清除数据集中当前的所有数据。
		 * 这样当我们下次调用数据集的getData()等方法时，数据集会尝试重新从相应的DataProvider中提取数据。
		 */
		discard: function() {
			delete this._data;
		},
		
		/**
		 * 清除数据集中当前的所有数据。
		 */
		clear: function() {
			this.setData(null);
		},
		
		retrievePreloadConfig: function(observer) {
			if (dorado.widget.DataTree && dorado.Object.isInstanceOf(observer, dorado.widget.DataTree)) {
				var bindingConfigs = observer.get("bindingConfigs");
				if (bindingConfigs) {
					var preloadConfigsMap = this._preloadConfigsMap, dataPath = observer._dataPath || "#EMPTY";
					if (!preloadConfigsMap) {
						this._preloadConfigsMap = preloadConfigsMap = {};
					}
					var preloadConfigs = preloadConfigsMap[dataPath] ||	[];
					for (var i = 0; i < bindingConfigs.length; i++) {
						var configs = dorado.widget.DataTree.bindingConfigToPreloadConfig(bindingConfigs[i]);
						if (configs) preloadConfigs = preloadConfigs.concat(configs);
					}
					if (preloadConfigs.length) preloadConfigsMap[dataPath] = preloadConfigs;
				}
			}
		},
		
		/*
		onReady: function() {
			this.sendMessage(0);
		},
		*/

		/**
		 * 向数据集中添加一个消息的监听器。
		 * @param {dorado.widget.DataSetObserver} observer 要添加的消息监听器。
		 */
		addObserver: function(observer) {
			this._observers.push(observer);
			if (this._ready && observer._ready) {
				this.retrievePreloadConfig(observer);
				observer.dataSetMessageReceived(this, DataSet.MESSAGE_REFRESH);
			}
		},

		/**
		 * 从数据集中移除一个消息的监听器。
		 * @param {dorado.widget.DataSetObserver} observer 要移除的消息监听器。
		 */
		removeObserver: function(observer) {
			this._observers.remove(observer);
		},

		entityMessageReceived: function(messageCode, args) {
			this._dataPathCache = {};
			if (this._ready) this.sendMessage(messageCode, args);
		},

		/**
		 * @name dorado.widget.DataSet#disableObservers
		 * @function
		 * @description 禁止DataSet将消息发送给其观察者。
		 * <p>
		 * 该方法的主要作用是阻止与该DataSet关联的数据控件自动根据DataSet中的数据变化刷新自身的显示内容，
		 * 这样做的目的一般是为了提高对DataSet连续进行操作时的运行效率。
		 * </p>
		 */
		disableObservers: dorado.Entity.prototype.disableObservers,

		/**
		 * @name dorado.widget.DataSet#enableObservers
		 * @function
		 * @description 允许DataSet将消息发送给其观察者。
		 */
		enableObservers: dorado.Entity.prototype.enableObservers,

		/**
		 * @name dorado.widget.DataSet#notifyObservers
		 * @function
		 * @description 通知DataSet的所有观察者刷新数据。
		 */
		notifyObservers: function() {
			dorado.Toolkits.cancelDelayedAction(this, "$refreshDelayTimerId");
			this._dataPathCache = {};
			this.sendMessage(0);
		},

		sendMessage: function(messageCode, args) {
			if (this._disableObserversCounter > 0) return;
			var observers = this._observers;
			for (var i = 0; i < observers.length; i++) {
				var observer = observers[i];
				observer.dataSetMessageReceived.call(observer, messageCode, args);
			}
		},
		
		post: function() {
			var observers = this._observers;
			for (var i = 0; i < observers.length; i++) {
				var observer = observers[i];
				if (dorado.Object.isInstanceOf(observer, dorado.widget.AbstractEditor)) {
					if (observer.get("rendered")) observer.post();
				}
			}
		}
	});

	dorado.DataSetDataPipe = $extend(dorado.DataProviderPipe, {
		$className: "dorado.DataSetDataPipe",

		constructor: function(dataSet) {
			this.dataSet = dataSet;
			this.dataType = dataSet._dataType;
			this.dataTypeRepository = dataSet.get("dataTypeRepository");
			this.view = dataSet.get("view");
		},

		getDataProviderArg: function() {
			var dataSet = this.dataSet, parameter = dorado.$this = this.dataSet._parameter;
			return {
				pageSize: dataSet._pageSize,
				pageNo: dataSet._pageNo,
				parameter: dorado.JSON.evaluate(parameter),
				sysParameter: dataSet._sysParameter ? dataSet._sysParameter.toJSON() : undefined,
				dataType: this.dataType,
				view: this.view
			};
		},

		getDataProvider: function() {
			return this.dataSet._dataProvider;
		}
	});

	var DataSet = dorado.widget.DataSet;

	/**
	 * @name dorado.widget.DataSet.MESSAGE_REFRESH
	 * @description 通知监听器需要进行数据刷新的消息。
	 * <p>
	 * 与此种消息对应的消息参数为null。
	 * </p>
	 * @type int
	 * @constant
	 */
	DataSet.MESSAGE_REFRESH = 0;

	/**
	 * @name dorado.widget.DataSet.MESSAGE_DATA_CHANGED
	 * @description 表示数据实体中的属性值发生变化的消息。
	 * <p>
	 * 与此种消息对应的消息参数具有下列子属性：
	 * <ul>
	 * <li>entity - {dorado.Entity} 发生改变的数据实体。</li>
	 * <li>property - {String} 被改变属性名。</li>
	 * <li>oldValue - {Object} 原先的值。</li>
	 * <li>newValue - {Object} 新的值。</li>
	 * </ul>
	 * </p>
	 * @type int
	 * @constant
	 */
	DataSet.MESSAGE_DATA_CHANGED = dorado.Entity._MESSAGE_DATA_CHANGED;

	/**
	 * @name dorado.widget.DataSet.MESSAGE_ENTITY_STATE_CHANGED
	 * @description 表示数据实体的状态变化的消息。
	 * <p>
	 * 与此种消息对应的消息参数具有下列子属性：
	 * <ul>
	 * <li>entity - {dorado.Entity} 发生改变的数据实体。</li>
	 * <li>oldState - {int} 原先的状态。</li>
	 * <li>newState - {int} 新的状态。</li>
	 * </ul>
	 * </p>
	 * @type int
	 * @constant
	 * @see dorado.Entity#attribute:state
	 */
	DataSet.MESSAGE_ENTITY_STATE_CHANGED = dorado.Entity._MESSAGE_ENTITY_STATE_CHANGED;

	/**
	 * @name dorado.widget.DataSet.MESSAGE_DELETED
	 * @description 表示实体集合中有数据实体被删除的消息。
	 * <p>
	 * 与此种消息对应的消息参数具有下列子属性：
	 * <ul>
	 * <li>entityList - {dorado.EntityList} 发生的实体集合。</li>
	 * <li>entity - {dorado.Entity} 被删除的数据实体。</li>
	 * </ul>
	 * </p>
	 * @type int
	 * @constant
	 * @see dorado.EntityList#remove
	 */
	DataSet.MESSAGE_DELETED = dorado.EntityList._MESSAGE_DELETED;

	/**
	 * @name dorado.widget.DataSet.MESSAGE_INSERTED
	 * @description 表示实体集合中添加了新数据实体的消息。
	 * <p>
	 * 与此种消息对应的消息参数具有下列子属性：
	 * <ul>
	 * <li>entityList - {dorado.EntityList} 发生的实体集合。</li>
	 * <li>entity - {dorado.Entity} 被添加的数据实体。</li>
	 * <li>insertMode - {dorado.Entity} 插入方式。</li>
	 * <li>refEntity - {dorado.Entity} 插入位置的参照数据实体。</li>
	 * </ul>
	 * </p>
	 * @type int
	 * @constant
	 * @see dorado.EntityList#insert
	 */
	DataSet.MESSAGE_INSERTED = dorado.EntityList._MESSAGE_INSERTED;

	/**
	 * @name dorado.widget.DataSet.MESSAGE_CURRENT_CHANGED
	 * @description 表示实体集合中当前数据实体发生改变的消息。
	 * <p>
	 * 与此种消息对应的消息参数具有下列子属性：
	 * <ul>
	 * <li>entityList - {dorado.EntityList} 发生的实体集合。</li>
	 * <li>oldCurrent - {dorado.Entity} 原先的当前数据实体。</li>
	 * <li>newCurrent - {dorado.Entity} 新的当前数据实体。</li>
	 * </ul>
	 * </p>
	 * @type int
	 * @constant
	 * @see dorado.EntityList#insert
	 */
	DataSet.MESSAGE_CURRENT_CHANGED = dorado.EntityList._MESSAGE_CURRENT_CHANGED;

	/**
	 * @name dorado.widget.DataSet.MESSAGE_REFRESH_ENTITY
	 * @description 通知监听器需要针对某个数据实体进行数据刷新的消息。
	 * <p>
	 * 与此种消息对应的消息参数具有下列子属性：
	 * <ul>
	 * <li>entity - {dorado.Entity} 需要刷新的数据实体。</li>
	 * </ul>
	 * </p>
	 * @type int
	 * @constant
	 */
	DataSet.MESSAGE_REFRESH_ENTITY = dorado.Entity._MESSAGE_REFRESH_ENTITY;
	
	DataSet.MESSAGE_LOADING_START = dorado.Entity._MESSAGE_LOADING_START;
	DataSet.MESSAGE_LOADING_END = dorado.Entity._MESSAGE_LOADING_END;
	
	/**
	 * @function
	 * @name dorado.widget.DataSet.getOwnerDataSet
	 * @description 返回某数据实体或实体集合当前所隶属的DataSet。
	 * @param {dorado.Entity|dorado.EntityList} data 数据实体或实体集合。
	 * @return {dorado.widget.DataSet} 隶属的DataSet。
	 */
	DataSet.getOwnerDataSet = function(data) {
		return (data._observer instanceof dorado.widget.DataSet) ? data._observer : null;
	};

	/**
	 * @author Benny Bao (mailto:benny.bao@bstek.com)
	 * @class 数据集消息的监听器。
	 * @abstract
	 */
	dorado.widget.DataSetObserver = $class(/** @scope dorado.widget.DataSetObserver.prototype */
	{
		$className: "dorado.widget.DataSetObserver",

		/**
		 * 当监听器接受到来自数据集的消息时被激活的方法。
		 * @param {int} messageCode 消息代码。
		 * @param {Object} arg 消息参数，此参数的具体形式需参照每一种数据集消息的说明。
		 * @see dorado.widget.DataSet.MESSAGE_REFRESH
		 * @see dorado.widget.DataSet.MESSAGE_DATA_CHANGED
		 * @see dorado.widget.DataSet.MESSAGE_ENTITY_STATE_CHANGED
		 * @see dorado.widget.DataSet.MESSAGE_DELETED
		 * @see dorado.widget.DataSet.MESSAGE_INSERTED
		 * @see dorado.widget.DataSet.MESSAGE_CURRENT_CHANGED
		 * @see dorado.widget.DataSet.MESSAGE_REFRESH_ENTITY
		 */
		dataSetMessageReceived: function(messageCode, arg) {
		}
	});

})();

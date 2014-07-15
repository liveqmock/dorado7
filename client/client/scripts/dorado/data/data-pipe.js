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
 * @class 数据管道。
 * <p>
 * 数据管道是一种用于向外界提供数据的对象。 该对象一般仅在dorado的内部被使用，有时我们可以直接将数据管道视为一种特殊的数据，
 * 因为数据管道本身就是用来代表一组数据的，只不过这组数据需要经由一些逻辑才能获得。 例如：dorado的一些处理中将{@link dorado.DataProvider}封装成数据管道。
 * 这样，当外界尝试利用该数据管道来获取数据时，数据管道内部会通过封装的{@link dorado.DataProvider}来获得最终的数据。
 * </p>
 * @abstract
 */
dorado.DataPipe = $class(/** @scope dorado.DataPipe.prototype */{
	$className: "dorado.DataPipe",
	
	/**
	 * @property
	 * @name dorado.DataPipe#dataTypeRepository
	 * @type dorado.DataTypeRepository
	 * @description 解析返回数据时可能需要用到的数据类型管理器。
	 */
	/**
	 * @property
	 * @name dorado.DataPipe#dataType
	 * @type dorado.LazyLoadDataType|dorado.DataType
	 * @description 返回数据的数据类型。
	 */
	// =====
	
	/**
	 * @name dorado.DataPipe#doGet
	 * @function
	 * @protected
	 * @description 用于提取数据的同步方法。
	 * <p>
	 * 当我们需要在子类中改写提取数据的同步方法时，我们应该覆盖DataPipe的doGet()方法，而不是get()方法。
	 * </p>
	 * @return {dorado.Entity|dorado.EntityList} 提取到的数据。
	 */
	/**
	 * @name dorado.DataPipe#doGetAsync
	 * @function
	 * @protected
	 * 用于提取数据的异步方法。
	 * <p>
	 * 当我们需要在子类中改写提取数据的异步方法时，我们应该覆盖DataPipe的doGetAsync()方法，而不是getAsync()方法。
	 * </p>
	 * @param {Function|dorado.Callback} callback 回调对象，传入回调对象的参数即为提取到的数据。
	 */
	// =====
	
	/**
	 * 正在执行的数据装载的过程的个数。
	 * @type int
	 */
	runningProcNum: 0,
	
	shouldFireEvent: true,
	
	convertIfNecessary: function(data, dataTypeRepository, dataType) {
		var oldFireEvent = dorado.DataUtil.FIRE_ON_ENTITY_LOAD;
		dorado.DataUtil.FIRE_ON_ENTITY_LOAD = this.shouldFireEvent;
		try {
			return dorado.DataUtil.convertIfNecessary(data, dataTypeRepository, dataType);
		}
		finally {
			dorado.DataUtil.FIRE_ON_ENTITY_LOAD = oldFireEvent;
		}
	},
	
	/**
	 * 用于提取数据的同步方法。
	 * <p>
	 * 请不要在子类中改写此方法，如需改写应将改写的逻辑放在doGet()中。
	 * </p>
	 * @return {dorado.Entity|dorado.EntityList} 提取到的数据
	 * @see dorado.DataPipe#doGet
	 */
	get: function() {
		dorado.DataPipe.MONITOR.executionTimes++;
		dorado.DataPipe.MONITOR.syncExecutionTimes++;
		return this.convertIfNecessary(this.doGet(), this.dataTypeRepository, this.dataType);
	},
	
	/**
	 * 用于提取数据的异步方法。
	 * <p>
	 * 请不要在子类中改写此方法，如需改写应将改写的逻辑放在doGetAsync()中。
	 * </p>
	 * @param {dorado.Callback} callback 回调对象，传入回调对象的参数即为提取到的数据。
	 * @see dorado.DataPipe#doGetAsync
	 */
	getAsync: function(callback) {
		dorado.DataPipe.MONITOR.executionTimes++;
		dorado.DataPipe.MONITOR.asyncExecutionTimes++;
		
		callback = callback || dorado._NULL_FUNCTION;
		var callbacks = this._waitingCallbacks;
		if (callbacks) {
			callbacks.push(callback);
		} else {
			this._waitingCallbacks = callbacks = [callback];
			this.runningProcNum++;
			
			this.doGetAsync({
				scope: this,
				callback: function(success, result) {
					if (success) {
						result = this.convertIfNecessary(result, this.dataTypeRepository, this.dataType);
					}
					
					var errors, callbacks = this._waitingCallbacks;
					delete this._waitingCallbacks;
					this.runningProcNum = 0;
					
					if (callbacks) {
						for (var i = 0; i < callbacks.length; i++) {
							try {
								$callback(callbacks[i], success, result);
							} 
							catch (e) {
								if (errors === undefined) errors = [];
								errors.push(e);
							}
						}
					}
					if (errors) throw ((errors.length > 1) ? errors : errors[0]);
				}
			});
		}
	},
	
	abort: function(success, result) {
		var callbacks = this._waitingCallbacks;
		delete this._waitingCallbacks;
		this.runningProcNum = 0;
		
		if (!callbacks) return;
		
		var errors;
		for (var i = 0; i < callbacks.length; i++) {
			try {
				$callback(callbacks[i], success, result);
			} 
			catch (e) {
				if (errors === undefined) errors = [];
				errors.push(e);
			}
		}
		if (errors) throw ((errors.length > 1) ? errors : errors[0]);
	}
});

dorado.DataPipe.MONITOR = {
	executionTimes: 0,
	asyncExecutionTimes: 0,
	syncExecutionTimes: 0
};

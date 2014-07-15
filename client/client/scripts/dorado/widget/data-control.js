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
 * @class 数据控件。
 * <p>
 * 数据控件可与数据集({@link dorado.widget.DataSet})进行绑定，用于控制或显示数据集中的数据。
 * 主要用于跟DataSet中的数据实体{@link dorado.Entity}或数据实体的集合{@link dorado.EntityList}进行绑定。
 * </p>
 * @abstract
 * @extends dorado.widget.DataSetObserver
 * @see dorado.widget.DataSet
 */
dorado.widget.DataControl = $extend(dorado.widget.DataSetObserver, /** @scope dorado.widget.DataControl.prototype */ {
	$className: "dorado.widget.DataControl",
	
	ATTRIBUTES: /** @scope dorado.widget.DataControl.prototype */ {
		/**
		 * 数据控件绑定的数据集。
		 * @type dorado.widget.DataSet
		 * @attribute
		 */
		dataSet: {
			componentReference: true,
			setter: function(dataSet) {
				if (this._dataSet) this._dataSet.removeObserver(this);
				this._dataSet = dataSet;
				if (dataSet) dataSet.addObserver(this);
			}
		},
		
		/**
		 * 数据路径，用于指定数据控件与数据集中的哪些数据节点进行关联。
		 * @type String
		 * @attribute
		 * @see dorado.DataPath
		 */
		dataPath: {}
	},
	
	EVENTS: /** @scope dorado.widget.DataControl.prototype */ {
	
		/**
		 * 当数据绑定控件尝试获得绑定的数据时触发的事件。开发人员可以通过此事件来定制实际与控件绑定的数据。
		 * <p>
		 * 一旦定义了此事件dataPath属性将会失效，控件直接以此事件中指定的数据作为绑定数据。
		 * 需要注意的是，此事件中的指定的绑定数据必须取自控件绑定的数据集{@link dorado.widget.DataSet}，否则系统将会报错。
		 * </p>
		 * @param {Object} self 事件的发起者，即控件本身。
		 * @param {Object} arg 事件参数。
		 * @param {Object} arg.options 传递给getBindingData()方法的options参数。
		 * @param {dorado.EntityList|dorado.Entity} #arg.data 将该控件实际绑定的数据写入此属性中。
		 * @param {boolean} #arg.processDefault=true 是否在事件结束后继续执行系统默认的获取数据的逻辑。
		 * @return {boolean} 是否要继续后续事件的触发操作，不提供返回值时系统将按照返回值为true进行处理。
		 * @event
		 */
		onGetBindingData: {},
		
		/**
		 * 当数据绑定控件尝试获得绑定的数据类型时触发的事件。
		 * 对于很多数据控件而言，都可能需要在获取实际的绑定数据之前事先获知其绑定的具体数据类型。
		 * 如数据表格等，其可能需要事先获得具体数据类型已初始化表格列的信息。
		 * <p>
		 * 默认情况下，数据控件会自动根据dataPath属性来确定绑定的数据类型。
		 * 然而，当我们为控件定义了onGetBindingData事件后dataPath属性将会失效。
		 * 而此时如果通过onGetBindingData事件取得的绑定数据为null时，数据控件将无法获知其绑定的具体数据类型。
		 * 在此种情形下，数据控件将通过本事件来尝试获知其绑定的具体数据类型。
		 * </p>
		 * @param {Object} self 事件的发起者，即控件本身。
		 * @param {Object} arg 事件参数。
		 * @param {dorado.DataType} #arg.dataType 将该控件实际绑定的数据类型写入此属性中。
		 * @param {boolean} #arg.processDefault=true 是否在事件结束后继续执行系统默认的获取数据类型的逻辑。
		 * @return {boolean} 是否要继续后续事件的触发操作，不提供返回值时系统将按照返回值为true进行处理。
		 * @event
		 */
		onGetBindingDataType: {}
	},
	
	_disableBindingCounter: 0,
	
	/**
	 * 禁止控件接收来自数据集的消息。
	 */
	disableBinding: function() {
		this._disableBindingCounter++;
	},
	
	/**
	 * 允许控件接收来自数据集的消息。
	 */
	enableBinding: function() {
		if (this._disableBindingCounter > 0) this._disableBindingCounter--;
	},
	
	/**
	 * 返回控件实际绑定的数据。
	 * @param {Object|boolean} [options] 传递给内部{@link dorado.widget.DataSet#getData}方法的选项参数。
	 * @return {dorado.EntityList|dorado.Entity} 控件实际绑定的数据。
	 * @see dorado.widget.DataSet#getData
	 */
	getBindingData: function(options) {
		if (!options) options = {};
		if (options.loadMode == null) options.loadMode = "auto";
		
		var eventArg = {
			options: options,
			processDefault: true
		};
		if (this.getListenerCount("onGetBindingData") > 0) {
			this.fireEvent("onGetBindingData", this, eventArg);
		}
		
		var data = null;
		if (this._dataSet && eventArg.processDefault) {
			data = this._dataSet.getData(this._dataPath, options);
		}
		else {
			data = eventArg.data;
		}
		return data;
	},
	
	/**
	 * 返回控件实际绑定的数据类型。
	 * @return {dorado.DataType} 控件实际绑定的数据类型。
	 * @param {Object|boolean} [options] 传递给内部{@link dorado.widget.DataSet#getDataType}方法的选项参数。
	 */
	getBindingDataType: function(options) {
		if (!options) options = {};
		if (options.loadMode == null) options.loadMode = "auto";
		
		var eventArg = {
			options: options,
			processDefault: true
		};
		if (this.getListenerCount("onGetBindingDataType") > 0) {
			this.fireEvent("onGetBindingDataType", this, eventArg);
		}
		
		var dataType = null;
		if (this._dataSet && eventArg.processDefault) {
			dataType = this._dataSet.getDataType(this._dataPath, options);
		}
		else {
			dataType = eventArg.dataType;
		}
		return dataType;
	},
	
	/**
	 * 当控件接收到的数据集消息被激活的方法。
	 * @param {Object} messageCode 消息代码。
	 * @param {Object} arg 消息参数。
	 */
	dataSetMessageReceived: function(messageCode, arg) {
		if (this._disableBindingCounter == 0 && (!(this instanceof dorado.widget.Control) || this._ready)) {
			if (this.filterDataSetMessage(messageCode, arg)) {
				this.processDataSetMessage(messageCode, arg);
			}
		}
	},
	
	/**
	 * 对接收到的数据集消息进行过滤。
	 * 如果此方法返回true，则表示接受这一消息，并进一步调用processDataSetMessage()对消息进行处理。
	 * @param {int} messageCode 消息代码。
	 * @param {Object} [arg] 消息参数。
	 * @return {boolean} 用于表示是否接受此消息的逻辑值。
	 * @protected
	 */
	filterDataSetMessage: function(messageCode, arg) {
		return true;
	},
	
	/**
	 * @function
	 * @description 处理接收到的来自数据集的消息。
	 * <p>
	 * 此处可能接受到的消息包括：
	 * <ul>
	 * <li>{@link dorado.widget.DataSet.MESSAGE_REFRESH}</li>
	 * <li>{@link dorado.widget.DataSet.MESSAGE_CURRENT_CHANGED}</li>
	 * <li>{@link dorado.widget.DataSet.MESSAGE_DATA_CHANGED}</li>
	 * <li>{@link dorado.widget.DataSet.MESSAGE_REFRESH_ENTITY}</li>
	 * <li>{@link dorado.widget.DataSet.MESSAGE_ENTITY_STATE_CHANGED}</li>
	 * <li>{@link dorado.widget.DataSet.MESSAGE_INSERTED}</li>
	 * <li>{@link dorado.widget.DataSet.MESSAGE_DELETED}</li>
	 * </ul>
	 * </p>
	 * @param {int} messageCode 消息代码。
	 * @param {Object} [arg] 消息参数。
	 * @protected
	 */
	processDataSetMessage: dorado._NULL_FUNCTION
});

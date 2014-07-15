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
 * @class 组件的抽象类。
 * @abstract
 * @extends dorado.widget.ViewElement
 * @param {String|Object} [config] 配置信息。
 * <p>
 * 此参数具有多态性，当我们传入一个String类型的参数时，该String值表示组件的id。
 * 当我们传入的参数是一个JSON对象时，系统会自动将该JSON对象中的属性设置到组件中。 <br>
 * 如果没有在此步骤中没有为组件指定id，那么系统会自动为其分配一个id。
 * </p>
 */
dorado.widget.Component = $extend(dorado.widget.ViewElement, /** @scope dorado.widget.Component.prototype */ {
	$className: "dorado.widget.Component",

	ATTRIBUTES: /** @scope dorado.widget.Component.prototype */ {

		/**
		 * 组件当前是否已激活。
		 * @type boolean
		 * @attribute readOnly
		 */
		ready: {
			readOnly: true
		},

		/**
		 * 父控件。
		 * @type dorado.widget.Component
		 * @attribute readOnly
		 */
		parent: {
			readOnly: true
		},

		/**
		 * 此视图对象使用的数据类型管理器。
		 * @type dorado.DataTypeRepository
		 * @attribute readOnly
		 */
		dataTypeRepository: {
			readOnly: true,
			getter: function() {
				var view = this.get("view") || $topView;
				return view.get("dataTypeRepository");
			}
		}
	},

	EVENTS: /** @scope dorado.widget.Component.prototype */ {
		/**
		 * 当组件被激活（即真正可用时）时触发的事件。
		 * @param {Object} self 事件的发起者，即组件本身。
		 * @param {Object} arg 事件参数。
		 * @return {boolean} 是否要继续后续事件的触发操作，不提供返回值时系统将按照返回值为true进行处理。
		 * @event
		 */
		onReady: {}
	},

	constructor: function(config) {
		$invokeSuper.call(this, [config]);

		if (AUTO_APPEND_TO_TOPVIEW && window.$topView) {
			$topView.addChild(this);
		}
	},

	/**
	 * 当组件的状态已变为可用时被激活的方法。
	 * @protected
	 */
	onReady: function() {
		if (this._ready) return;
		this._ready = true;

		if (this._prependingView) {
			delete this._prependingView;
		}

		this.fireEvent("onReady", this);
	},

	getDataTypeRepository: function() {
		var view = this.get("view") || this._prependingView;
		return view ? view._dataTypeRepository : null;
	},

	fireEvent: function() {
		var optimized = (AUTO_APPEND_TO_TOPVIEW === false);
		if (optimized) AUTO_APPEND_TO_TOPVIEW = true;
		var retVal = $invokeSuper.call(this, arguments);
		if (optimized) AUTO_APPEND_TO_TOPVIEW = false;
		return retVal;
	},

	doSetParentViewElement: function(parentViewElement) {
		this._parent = parentViewElement;
	}

});
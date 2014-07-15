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
 * @class 对象缓存池。用于对对象进行缓存、池化管理的容器。
 * @description 构造器。
 * @param {Object} factory 可池化对象的工厂。
 * @param {Function} factory.makeObject (<b>必须指定</b>) 创建一个新的对象，该方法的返回值即为新创建的对象。
 * @param {Function} factory.destroyObject 销毁一个对象。
 * @param {Function} factory.activateObject 当一个对象被激活（被租借）时触发的方法。
 * @param {Function} factory.passivateObject 当一个对象被钝化（被归还）时触发的方法。
 *
 * @example
 * // 结合XMLHttpRequest创建过程的简陋示例：
 * // 声明XMLHttpRequest的创建工厂
 * var factory = {
 * 	makeObject: function() {
 * 		// 创建XMLHttpRequset对象
 * 		// 注：这里的创建方法不够健壮，勿学！
 * 		if (window.ActiveXObject){
 * 			return new ActiveXObject("Microsoft.XMLHTTP");
 * 		}
 * 		else {
 * 			return new XMLHttpRequest();
 * 		}
 * 	},	passivateObject: function(xhr) {
 * 		// 重置XMLHttpRequset对象
 * 		xhr.onreadystatechange = {};
 * 		xhr.abort();
 * 	}
 * };
 * var pool = new ObjectPool(factory); // 创建对象池
 * ......
 * var xhr = pool.borrowObject(); // 获得一个XMLHttpRequest对象
 * xhr.onreadystatechange = function() {
 * 	if (xhr.readyState == 4) {
 * 		......
 * 		pool.returnObject(xhr); // 归还XMLHttpRequest对象
 * 	}
 * };
 * xhr.open(method, url, true);
 * ......
 */
dorado.util.ObjectPool = $class(/** @scope dorado.util.ObjectPool.prototype */
{
	$className : "dorado.util.ObjectPool",

	constructor : function(factory) {
		dorado.util.ObjectPool.OBJECT_POOLS.push(this);

		this._factory = factory;
		this._idlePool = [];
		this._activePool = [];
	},
	/**
	 * 从对象池中租借一个对象。
	 * @return {Object} 返回租借到的对象实例。
	 */
	borrowObject : function() {
		var object = null;
		var factory = this._factory;
		if(this._idlePool.length > 0) {
			object = this._idlePool.pop();
		} else {
			object = factory.makeObject();
		}
		if(object != null) {
			this._activePool.push(object);
			if(factory.activateObject) {
				factory.activateObject(object);
			}
		}
		return object;
	},
	/**
	 * 向对象池归还一个先前租借的对象。
	 * @param {Object} object 要归还的对象。
	 */
	returnObject : function(object) {
		if(object != null) {
			var factory = this._factory;
			var i = this._activePool.indexOf(object);
			if(i < 0)
				return;
			if(factory.passivateObject) {
				factory.passivateObject(object);
			}
			this._activePool.removeAt(i);
			this._idlePool.push(object);
		}
	},
	/**
	 * 返回对象池中的激活对象的个数。
	 * @return {int} 激活对象的个数。
	 */
	getNumActive : function() {
		return this._activePool.length;
	},
	/**
	 * 返回对象池中的空闲对象的个数。
	 * @return {int} 空闲对象的个数。
	 */
	getNumIdle : function() {
		return this._idlePool.length;
	},
	/**
	 * 销毁对象池及其中管理的所有对象。
	 */
	destroy : function() {
		if(!!this._destroyed) return;

		var factory = this._factory;

		function returnObject(object) {
			if(factory.passivateObject) {
				factory.passivateObject(object);
			}
		}

		function destroyObject(object) {
			if(factory.destroyObject) {
				factory.destroyObject(object);
			}
		}

		var activePool = this._activePool;
		for(var i = 0; i < activePool.length; i++) {
			var object = activePool[i];
			returnObject(object);
			destroyObject(object);
		}

		var idlePool = this._idlePool;
		for(var i = 0; i < idlePool.length; i++) {
			var object = idlePool[i];
			destroyObject(object);
		}

		this._factory = null;
		this._destroyed = true;
	}
});

dorado.util.ObjectPool.OBJECT_POOLS = [];

// jQuery(window).unload(function() {
// var pools = dorado.util.ObjectPool.OBJECT_POOLS;
// for ( var i = 0; i < pools.length; i++)
// pools[i].destroy();
// });

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
 * @class 仿Map对象。用于维护若干组键值对。
 * <p>
 * 此对象最经常被使用的场景是在DataSet、Action、Reference等对象的parameter属性中。
 * 因为很多时候我们会希望将这写地方的parameter参数设置成类似Map的形式，以便于利用Map的特性在parameter中维护若干个子参数，每一个自参数保存在Map的一个键值下。
 * 这样就可以比较方便的在逻辑代码中根据实际需要增删Map中的子参数。<br>
 * 当然，这一功能通过标准的JSON对象完全可以实现，这里的Map对象只是可以让这种使用方法变得更加简单而已。
 * </p>
 * <p>
 * 假设您通过Dorado的IDE将某Action的parameter属性定义成一个Entity，且其中包含了两个属性值a和b作为两个子参数。
 * 当该属性被Dorado引擎自动生成到客户端时，Dorado会自动将其创建为一个Map对象。
 * 如果在实际的运行过程中您又有两个额外的子参数c和d需要添加到这个Map对象中时，你只需要调用如下的方法：
 * <pre class="symbol-example code">
 * <code class="javascript">
 * action.set("parameter", $map({ c: "xxx", d: true }));
 * </code>
 * </pre>
 * Dorado就会自动将c和d合并到parameter属性原有的Map中，而不是直接用这个只包含c和d的Map替换之。<br>\
 * 之所以这样是因为，对于上述提及的这些parameter属性Dorado都已内置了针对Map的特殊处理逻辑。
 * 只要某属性原先的值类型是一个Map，当通过set方法为其设置一个新的Map时，Dorado会自动将新的Map中的键值对合并到原Map中。<br>
 * 当某属性原有的值和将要写入的值中有任何一个不是Map类型时，Dorado将只会使用最简单的属性写入逻辑。即将原有的值完整的替换掉。
 * </p>
 * @param {Object|dorado.util.Map} [config] 用于初始化Map键值对的参数。
 * 此参数应是一个JSON对象，其中定义的所有属性会自动的被添加到Map中。
 * @see $map
 */
dorado.util.Map = $class(/** @scope dorado.util.Map.prototype */{
	$className: "dorado.util.Map",
	
	constructor: function(config) {
		this._map = {};
		if (config && config instanceof Object) this.put(config);
	},
	
	/**
	 * 向Map中添加一到多个键值对。
	 * <p>
	 * 此方法有如下两种使用方式：
	 * <ul>
	 * 	<li>添加一组键值对，以String的形式定义key参数，同时定义value参数。</li>
	 * 	<li>一次性的添加多组键值对，以JSON/dorado.util.Map的形式定义key参数。此时不需要定义value参数。</li>
	 * </ul>
	 * </p>
	 * @param {String|Object|dorado.util.Map} key 要设置的键或者以JSON/dorado.util.Map方式定义的若干组键值对。
	 * @param {Object} [value] 键值。
	 */
	put: function(k, v) {
		if (!k) return;
		if (v === undefined && k instanceof Object) {
			var obj = k;
			if (obj instanceof dorado.util.Map) {
				obj = obj._map;
			}
			if (obj) {
				var map = this._map;
				for (var p in obj) {
					if (obj.hasOwnProperty(p)) map[p] = obj[p];
				}
			}
		} else {
			this._map[k] = v;
		}
	},
	
	/**
	 * 此方法与{@link dorado.util.Map#put}的作用和用法完全相同，
	 * 提供该方法目的主要是为了使之与Dorado中的其他对象的使用方法形成统一。
	 * @see dorado.util.Map#put
	 */
	set: function() {
		this.put.apply(this, arguments);
	},
	
	/**
	 * 根据给定的键返回相应的值。
	 * @param {String} key 要读取的键。
	 * @return {Object} 相应的值。
	 */
	get: function(k) {
		return this._map[k];
	},
	
	/**
	 * 返回是否为空。
	 * @return {boolean} 是否为空。
	 */
	isEmpty: function() {
		var map = this._map;
		for (var k in map) {
			if (map.hasOwnProperty(k)) return false;
		}
		return true;
	},
	
	/**
	 * 删除Map中的某个键值对。
	 * @param {String} key 要删除的键。
	 */
	remove: function(k) {
		delete this._map[k];
	},
	
	/**
	 * 清空Map中所有的键值对。
	 */
	clear: function() {
		this._map = {};
	},
	
	/**
	 * 将此Map对象转换为标准的JSON对象并返回。
	 * @return {Object} 包含Map中所有键值对的JSON对象。
	 */
	toJSON: function() {
		return this._map;
	},
	
	/**
	 * 返回包含Map中所有键值的数组。
	 * @return {String[]} 键值数组。
	 */
	keys: function() {
		var map = this._map, keys = [];
		for (var k in map) {
			if (map.hasOwnProperty(k)) keys.push(k);
		}
		return keys;
	},
	
	/**
	 * 遍历所有键值对。
	 * @param {Function} fn 针对数组中每一个元素的回调函数。此函数支持下列两个参数:
	 * <ul>
	 * <li>key - {String} 当前遍历到的键。</li>
	 * <li>value - {Object} 当前遍历到的键值。</li>
	 * </ul>
	 * 另外，此函数的返回值可用于通知系统是否要终止整个遍历操作。
	 * 返回true或不返回任何数值表示继续执行遍历操作，返回false表示终止整个遍历操作。<br>
	 * 此回调函数中的this指向正在被遍历的数组。
	 * 
	 * @example
	 * map.each(function(key, value) {
	 * 	// your code
	 * });
	 */
	eachKey: function(fn) {
		if (!fn) return;
		var map = this._map;
		for (var k in map) {
			if (map.hasOwnProperty(k)) fn.call(this, k, map[k]);
		}
	},
	
	toString: function() {
		return "dorado.util.Map";
	}
});

/**
 * @name $map
 * @function
 * @param {Object} 用于初始化Map键值对的参数。
 * 此参数应是一个JSON对象，其中定义的所有属性会自动的被添加到Map中。
 * @return {dorado.util.Map} 仿Map对象。
 * @description 用于将一个JSON对象包装成dorado的仿Map对象。
 * @see dorado.util.Map
 */
window.$map = function(obj) {
	return new dorado.util.Map(obj);
};

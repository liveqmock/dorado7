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
 * @class 标签管理器。
 * <p>
 * 通过此对象可以方便的管理所以支持标签的对象，提取拥有某一标签的所以对象实例。
 * </p>
 * @static
 *
 * @see dorado.AttributeSupport
 * @see dorado.AttributeSupport@attribute:tags
 */
dorado.TagManager = {

	_map: {},
	
	_register: function(tag, object) {
		if (!object._id) object._id = dorado.Core.newId();
		var info = this._map[tag];
		if (info) {
			if (!info.idMap[object._id]) {
				info.list.push(object);
				info.idMap[object._id] = object;
			}
		} else {
			this._map[tag] = info = {
				list: [object],
				idMap: {}
			};
			info.idMap[object._id] = object;
		}
	},
	
	_unregister: function(tag, object) {
		var info = this._map[tag];
		if (info) {
			if (info.idMap[object._id]) {
				delete info.idMap[object._id];
				info.list.remove(object);
			}
		}
	},
	
	_regOrUnreg: function(object, remove) {
		var tags = object._tags;
		if (tags) {
			if (typeof tags == "string") tags = tags.split(',');
			if (tags instanceof Array) {
				for (var i = 0; i < tags.length; i++) {
					var tag = tags[i];
					if (typeof tag == "string" && tag.length > 0) {
						remove ? this._unregister(tag, object) : this._register(tag, object);
					}
				}
			}
		}
	},
	
	/**
	 * 向标签管理器中注册一个对象。
	 * <p>此方法一般由系统内部自动调用，如无特殊需要不必自行调用此方法。</p>
	 * @param {dorado.AttributeSupport} object
	 */
	register: function(object) {
		this._regOrUnreg(object);
	},
	
	/**
	 * 从标签管理器中注销一个对象。
	 * <p>此方法一般由系统内部自动调用，如无特殊需要不必自行调用此方法。</p>
	 * @param {dorado.AttributeSupport} object
	 */
	unregister: function(object) {
		this._regOrUnreg(object, true);
	},
	
	/**
	 * 返回所有具有某一指定标签的对象的对象组。
	 * @param {String} tags 标签值。
	 * @return {dorado.ObjectGroup} 对象组。
	 *
	 * @see dorado.ObjectGroup
	 * @see $tags
	 *
	 * @example
	 * // 寻找所有具有limited标签的对象，并统一设置他们的readOnly属性。
	 * dorado.TagManager.find("limited").set("readOnly", true);
	 */
	find: function(tags) {
		var info = this._map[tags];
		return new dorado.ObjectGroup(info ? info.list : null);
	}
};

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @class 对象组。
 * <p>用于将一批对象组合在一起，以便于方便的进行统一处理，例如统一的设置属性或调用方法。</p>
 * @param {Object[]} objects 要进行的组合的对象的数组。
 */
dorado.ObjectGroup = $class(/** @scope dorado.ObjectGroup.prototype */{
	/**
	 * @name dorado.AttributeSupport#objects
	 * @property
	 * @type dorado.AttributeSupport[]
	 * @description 对象数组。
	 */
	// =====
	
	constructor: function(objects) {
		if (objects && !(objects instanceof Array)) {
			objects = [objects];
		}
		this.objects = objects || [];
	},
	
	/**
	 * 对组中的所有对象进行属性赋值操作。
	 * <p>如果对象组中的某个对象不支持此处将设置属性，该方法会跳过该对象这一个操作并继续后续处理。
	 * 此方法的使用方法与(@link dorado.AttributeSupport#set)方法非常类似，具体使用说明请参考(@link dorado.AttributeSupport#set)方法的说明。</p>
	 * @param {String|Object} attr 属性名或包含多个属性值对的JSON对象。
	 * @param {Object} [value] 属性值。
	 * @return {dorado.AttributeSupport} 返回对象组自身。
	 *
	 * @see dorado.AttributeSupport#set
	 */
	set: function(attr, value) {
		if (!this.objects) return;
		for (var i = 0; i < this.objects.length; i++) {
			var object = this.objects[i];
			if (object) object.set(attr, value, true);
		}
		return this;
	},
	
	/**
	 * 读取组中每一个对象的属性，并将所有结果集合成一个新组返回。
	 * @param {String} attr 属性名。
	 * @return {dorado.ObjectGroup} 由读取到的结果组成的对象组。
	 */
	get: function(attr) {
		var attrs = attr.split('.'), objects = this.objects;
		for (var i = 0; i < attrs.length; i++) {
			var a = attrs[i], results = [];
			for (var j = 0; j < objects.length; j++) {
				var object = objects[j], result;
				if (!object) continue;
				if (typeof object.get == "function") {
					result = object.get(a);
				}
				else {
					result = object[a];
				}
				if (result != null) results.push(result);
			}
			objects = results;
		}
		return new dorado.ObjectGroup(objects);
	},

	/**
	 * 添加一个事件监听器。
	 * @deprecated
	 * @see dorado.EventSupport#bind
	 */
	addListener: function (name, listener, options) {
		return this.bind(name, listener, options);
	},

	/**
	 * 移除一个事件监听器。
	 * @deprecated
	 * @see dorado.EventSupport#unbind
	 */
	removeListener: function (name, listener) {
		return this.unbind(name, listener);
	},
	
	/**
	 * 为组中的所有对象绑定事件。
	 * <p>如果对象组中的某个对象不支持事件，该方法会跳过该对象这一个操作并继续后续处理。
	 * 此方法的使用方法与(@link dorado.EventSupport#bind)方法非常类似，具体使用说明请参考(@link dorado.EventSupport#bind)方法的说明。</p>
	 * @param {String} name 事件名称，可支持别名。
	 * @param {Function} listener 事件监听方法。
	 * @param {Object} [options] 监听选项。
	 * @return {dorado.AttributeSupport} 返回对象组自身。
	 *
	 * @see dorado.EventSupport#bind
	 */
	bind: function(name, listener, options) {
		if (!this.objects) return;
		for (var i = 0; i < this.objects.length; i++) {
			var object = this.objects[i];
			if (object && typeof object.bind == "function") {
				object.bind(name, listener, options);
			}
		}
	},
	
	/**
	 * 从组中的所有对象中移除一个事件。
	 * <p>如果对象组中的某个对象不支持事件，该方法会跳过该对象这一个操作并继续后续处理。
	 * 此方法的使用方法与(@link dorado.EventSupport#unbind)方法非常类似，具体使用说明请参考(@link dorado.EventSupport#unbind)方法的说明。</p>
	 * @param {String} name 事件名称，可支持别名。
	 * @param {Function} [listener] 事件监听器。如果不指定此参数则表示移除该事件中的所有监听器
	 * @return {dorado.AttributeSupport} 返回对象组自身。
	 *
	 * @see dorado.EventSupport#unbind
	 */
	unbind: function(name, listener) {
		if (!this.objects) return;
		for (var i = 0; i < this.objects.length; i++) {
			var object = this.objects[i];
			if (object && object.unbind) {
				object.unbind(name, listener);
			}
		}
	},
	
	/**
	 * 调用组中的所有对象的某个方法。
	 * @param {String} methodName 要调用的方法名。
	 * @param {Object...} [arg] 调用方法时传入的参数。
	 *
	 * @example
	 * // 同时调用3个按钮的set方法，将他们的disabled属性设置为true。
	 * var group = new dorado.ObjectGroup([button1, button2, button3]);
	 * group.invoke("set", "disabled", true);
	 */
	invoke: function(methodName) {
		if (!this.objects) return;
		for (var i = 0; i < this.objects.length; i++) {
			var object = this.objects[i];
			if (object) {
				var method = object[methodName];
				if (typeof method == "function") method.apply(object, Array.prototype.slice.call(arguments, 1));
			}
		}
	},
	
	/**
	 * 遍历对象。
	 * @param {Function} fn 针对组中每一个对象的回调函数。此函数支持下列两个参数:
	 * <ul>
	 * <li>object - {dorado.AttributeSupport} 当前遍历到的对象。</li>
	 * <li>[i] - {int} 当前遍历到的对象的下标。</li>
	 * </ul>
	 * 另外，此函数的返回值可用于通知系统是否要终止整个遍历操作。
	 * 返回true或不返回任何数值表示继续执行遍历操作，返回false表示终止整个遍历操作。<br>
	 * 此回调函数中的this指向正在被遍历的对象数组。
	 */
	each: function(callback) {
		if (!this.objects) return;
		this.objects.each(callback);
	}
});

/**
 * @name $group
 * @function
 * @description 创建一个对象组。new dorado.ObjectGroup()操作的快捷方式。
 * @param {Object..} objects 要进行的组合的对象的数组。
 * @return {dorado.ObjectGroup} 新创建的对象组。
 *
 * @see dorado.ObjectGroup
 */
window.$group = function() {
	return new dorado.ObjectGroup(Array.prototype.slice.call(arguments));
};

/**
 * @name $tag
 * @function
 * @description 返回所有具有某一指定标签的对象的对象组。dorado.TagManager.find()方法的快捷方式。
 * @param {String} tags 标签值。
 * @return {dorado.ObjectGroup} 对象组。
 *
 * @see dorado.TagManager.find
 *
 * @example
 * // 寻找所有具有limited标签的对象，并统一设置他们的readOnly属性。
 * $tag("limited").set("readOnly", true);
 */
window.$tag = function(tags) {
	return dorado.TagManager.find(tags);
};

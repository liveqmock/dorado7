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
 * @name dorado.Callback
 * @static
 * @class 异步方法的回调参数对象。
 * <p>
 * <font color="red"><b> 注意：这是一个虚拟的对象，在实际的运行状态中并不存在这样一个类型，因此您不能尝试实例化此类型。 </b></font>
 * </p>
 * <p>
 * 在dorado的客户端中，所有的异步执行方法都包含有一个相同类型的callback参数，该参数既可以是一个Function也可以是一个JavaScript对象。
 * <ul>
 * <li>当callback参数是一个Function时，那么该方法的声明应是如下形式：
 * <pre class="symbol-example code">
 * <code class="javascript">
 * function (obj) {
 *	 ... ...
 * }
 * </code>
 * </pre>
 *
 * 其中obj参数即为异步操作获得结果。 </li>
 * <li>当callback参数是一个对象时，该对象的结构应是一个与此处dorado.Callback匹配的JavaScript对象。 </li>
 * </ul>
 * </p>
 *
 * @example
 * // 以Function形式定义回调参数时
 * dataPipe.getAsync(function(obj) {
 *	 alert("获得的数据为：" + obj);
 * });
 *
 * @example
 * // 以JavaScript对象形式定义回调参数，并使用success和failure子方法时
 * dataPipe.getAsync({
 *	 success : function(obj) {
 *		 alert("获得的数据为：" + obj);
 *	 },
 *
 *	 failure : function(e) {
 *		 alert("发生异常：" + e);
 *	 }
 * });
 *
 * @example
 * // 以JavaScript对象形式定义回调参数，并使用callback子方法时
 * dataPipe.getAsync({
 *	 callback : function(success, obj) {
 *		 if (success) {
 *			 alert("执行成功！获得的数据为：" + obj);
 *		 }
 *		 else {
 *			 alert("执行失败！发生异常：" + obj);
 *		 }
 *	 }
 * });
 */
dorado.Callback = {};

/**
 * @name dorado.Callback#callback
 * @function
 * @description 当提取数据操作执行成功时触发的回调函数.
 * @param {boolean} [success] 异步操作被是否成功的执行了。
 * @param {Object} [obj] 异步操作获得返回结果或抛出的异常对象。
 */
/**
 * @name dorado.Callback#success
 * @function
 * @description 当提取数据操作执行成功时触发的回调函数。
 * @param {Object} [obj] 异步操作获得返回结果。
 */
/**
 * @name dorado.Callback#failure
 * @function
 * @description 当提取数据操作执行失败时触发的回调函。
 * @param {Object} [e] 异步操作执行过程中抛出的异常对象。
 */
/**
 * @name dorado.Callback.invokeCallback
 * @function
 * @description 对回调方法或对象进行调用。
 * @param {Object|Function} callback 要调用的回调方法或对象。
 * @param {Object} [success=false] 回调方法或对象监听的过程是否执行成功。
 * @param {Object} [arg] 调用回调方法时传入方法的参数。
 * @param {Object} [options] 监听选项。
 * @param {Object} [options.scope] 事件方法脚本的宿主，即事件脚本中this的含义。如果此参数为空则表示this为触发该事件的对象。
 * @param {int} [options.delay] 延时执行此事件方法的毫秒数。如果不指定此参数表示不对事件进行延时处理。
 * @see $callback
 */
/**
 * @name $callback
 * @function
 * @description {@link dorado.Callback#invokeCallback}的快捷方式。
 * @see dorado.Callback#invokeCallback
 */
window.$callback = dorado.Callback.invokeCallback = function (callback, success, arg, options) {

	function invoke(fn, args) {
		if (delay > 0) {
			setTimeout(function () {
				fn.apply(scope, args);
			}, delay);
		} else {
			fn.apply(scope, args);
		}
	}

	if (!callback) return;
	if (success == null) success = true;

	var scope, delay;
	if (options) {
		scope = options.scope;
		delay = options.delay;
	}

	if (typeof callback == "function") {
		if (!success) return;
		invoke(callback, [arg]);
	} else {
		scope = callback.scope || scope || window;
		delay = callback.delay || delay;

		if (typeof callback.callback == "function") {
			invoke(callback.callback, [success, arg]);
		}

		var name = (success) ? "success" : "failure";
		if (typeof callback[name] == "function") {
			invoke(callback.callback, [arg]);
		}
	}
};

// 用于同时触发一组异步操作，并且等待所有的异步操作全部完成之后再激活所有相应的回调方法。
dorado.Callback.simultaneousCallbacks = function (tasks, callback) {

	function getSimultaneousCallback(task) {
		var fn = function () {
			suspendedTasks.push({
				task: task,
				scope: this,
				args: arguments
			});

			if (taskReg[task.id]) {
				delete taskReg[task.id];
				taskNum--;
				if (taskNum == 0) {
					jQuery.each(suspendedTasks, function (i, suspendedTask) {
						suspendedTask.task.callback.apply(suspendedTask.scope, suspendedTask.args);
					});
					$callback(callback, true);
				}
			}
		};
		return fn;
	}

	var taskReg = {}, taskNum = tasks.length, suspendedTasks = [];
	if (taskNum > 0) {
		jQuery.each(tasks, function (i, task) {
			if (!task.id) task.id = dorado.Core.newId();
			var simCallback = getSimultaneousCallback(task);
			taskReg[task.id] = callback;
			task.run(simCallback);
		});
	} else {
		$callback(callback, true);
	}
};

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @class 支持事件触发机制的对象的通用接口。
 * <p>
 * 声明时事件时，每一个被声明的事件应作为EVENTS对象的一个子属性，该属性的值为一个用于描述属性的JSON对象。该JSON对象中支持下列子属性：
 * <ul>
 * <li>interceptor - {Function} 对该事件的触发动作（即{@link dorado.EventSupport#fireEvent}方法）的拦截方法。
 * 该方法的第一个传入参数是一个用于完成用默认的事件的触发动作的Function对象，从第二个参数开始与事件监听器的参数一致，方法的返回值即为相应的为外界读取到的{@link dorado.EventSupport#fireEvent}方法的返回值。
 * 再此拦截方法中，可以调用第一个参数所代表的Function来调用默认的事件的触发动作，传递给该方法的参数即最终传递给事件监听器的参数。</li>
 * <li>delay - {int} 延时触发事件的毫秒数。</li>
 * <li>processException - {boolean} 是否要在系统触发事件的过程中处理事件代码中抛出的异常，以避免这些异常进一步的被抛向外界从而干扰系统代码的执行。</li>
 * <li>disallowMultiListeners - {boolean} 是否禁止在该事件中绑定一个以上的监听器。</li>
 * </ul>
 * </p>
 *
 * @abstract
 *
 * @example
 * var SampleClass = $class({
 * 	EVENTS: {
 * 		onReady: {}, // 声明一个简单的事件
 * 		onClick: { // 声明一个带有拦截方法方法的属性
 * 			interceptor: function(superFire, self, arg) {
 * 				var retval = superFire(self, arg);
 * 				... ...
 * 				return retval;
 * 			},
 * 			
 * 			delay: 50 // 延时50毫秒后触发事件
 * 		}
 * 	}
 * });
 */
dorado.EventSupport = $class(/** @scope dorado.EventSupport.prototype */{
	$className: "dorado.EventSupport",

	ATTRIBUTES: /** @scope dorado.EventSupport.prototype */ {
		/**
		 * 用于简化为对象添加监听器操作的虚拟属性，该属性不支持读取操作。
		 * <p>
		 * 此属性的具有多态性：
		 * <ul>
		 * <li>当要赋的值为单个的JSON对象时，我们可以以事件名作为JSON对象的属性名，以事件方法作为属性值。
		 * 在此JSON对象中关联一到多个事件。</li>
		 * <li>当要赋的值为数组时，数组中的每一个JSON对象都用于描述一个事件监听器。
		 * 监听器的描述对象是一个可包含下列3个子属性的JSON对象：
		 * <ul>
		 * <li>name - {String} 要监听的事件名称。</li>
		 * <li>listener - {Function} 事件监听方法。</li>
		 * <li>[options] - {Object} 监听选项。见{@link dorado.EventSupport#bind}中的options参数的说明。</li>
		 * </ul>
		 * 采用此种方式定义的目的一般是为了同时某一个事件关联多个监听器，或者为了指定事件监听器的选项。 </li>
		 * </ul>
		 * </p>
		 * <p>
		 * 注意：此属性只在那些实现了{@link dorado.AttributeSupport}接口的子类中有效。
		 * </p>
		 * @type Object|Object[]
		 * @attribute writeOnly
		 *
		 * @example
		 * // sample 1
		 * oop.set("listener", {
		 *	 onFocus: function(button) {
		 *		 ... ...
		 *	 },
		 *	 onBlur: function(button) {
		 *		 ... ...
		 *	 }
		 * });
		 *
		 * @example
		 * // sample 2
		 * // 利用数组一次性定义两个监听器
		 * oop.set("listener", {
		 * 	onFocus: [
		 * 		{
		 * 			fn: function(button) {
		 * 				... ...
		 * 			},
		 * 			options:{ once: true }
		 * 		},
		 * 		function: (button) {
		 * 			... ...
		 * 		}
		 * });
		 */
		listener: {
			setter: function (v) {
				if (!v) return;
				for (var p in v) {
					if (v.hasOwnProperty(p)) {
						var listener = v[p];
						if (listener) {
							if (listener instanceof Array) {
								for (var i = 0; i < listener.length; i++) {
									var l = listener[i];
									if (typeof l == "function") {
										this.bind(p, l);
									}
									else if (typeof l.fn == "function") {
										this.bind(p, l.fn, l.options);
									}
								}
							} else if (typeof listener == "function") {
								this.bind(p, listener);
							} else if (typeof listener.fn == "function") {
								this.bind(p, listener.fn, listener.options);
							}
						}
					}
				}
			},
			writeOnly: true
		}
	},

	/**
	 * 用于声明该对象中所支持的所有事件。<br>
	 * 此属性中的对象一般由dorado系统自动生成，且往往一个类型的所有实例都共享同一个EVENTS对象。
	 * 因此，如无特殊需要，我们不应该在运行时手动的修改此对象中的内容。
	 * @type Object
	 *
	 * @example
	 * // 获取某对象的onClick事件的声明。
	 * var eventDef = oop.ENENTS.onClick。
	 */
	EVENTS: {},

	_disableListenersCounter: 0,

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
	 * 添加一个事件监听器。
	 * @param {String} name 事件名称。
	 * <p>此处允许您通过特殊的语法为添加的事件监听器定义别名，以便于在未来可以更加方便的删除该事件监听器。</p>
	 * <p>例如当您使用<pre>"onClick.system"</pre>这样的名称来绑定事件，这相当于为onClick事件定义了一个别名为system的事件监听器。
	 * 当您想要移除该事件监听器时，只要这样调用<pre>button.unbind("onClick.system")</pre>就可以了。</p>
	 * @param {Function} listener 事件监听方法。
	 * @param {Object} [options] 监听选项。
	 * @param {Object} [options.scope] 事件方法脚本的宿主，即事件脚本中this的含义。如果此参数为空则表示this为触发该事件的对象。
	 * @param {boolean} [options.once] 该事件是否只支持执行一次，即当事件第一次触发之后时间监听器将被自动移除。
	 * @param {int} [options.delay] 延时多少毫秒后触发。
	 * @return {Object} 返回宿主对象自身。
	 */
	bind: function (name, listener, options) {
		var i = name.indexOf('.'), alias;
		if (i > 0) {
			alias = name.substring(i + 1);
			name = name.substring(0, i);
		}

		var def = this.EVENTS[name] || (this.PRIVATE_EVENTS && this.PRIVATE_EVENTS[name]);
		if (!def) throw new dorado.ResourceException("dorado.core.UnknownEvent", name);

		var handler = dorado.Object.apply({}, options);
		handler.alias = alias;
		handler.listener = listener;
		handler.options = options;
		if (!this._events) this._events = {};
		var handlers = this._events[name];
		if (handlers) {
			if (def.disallowMultiListeners && handlers.length) {
				new dorado.ResourceException("dorado.core.MultiListenersNotSupport", name);
			}
			handlers.push(handler);
		} else this._events[name] = [handler];
		return this;
	},

	/**
	 * 移除一个事件监听器。
	 * @param {String} name 事件名称。
	 * <p>此处允许您通过特殊的语法来根据别名删除某个事件监听器。</p>
	 * @param {Function} [listener] 事件监听器。如果不指定此参数则表示移除该事件中的所有监听器。
	 */
	unbind: function (name, listener) {
		var i = name.indexOf('.'), alias;
		if (i > 0) {
			alias = name.substring(i + 1);
			name = name.substring(0, i);
		}

		var def = this.EVENTS[name] || (this.PRIVATE_EVENTS && this.PRIVATE_EVENTS[name]);
		if (!def) throw new dorado.ResourceException("dorado.core.UnknownEvent", name);

		if (!this._events) return;
		if (listener) {
			var handlers = this._events[name];
			if (handlers) {
				for (var i = handlers.length - 1; i >= 0; i--) {
					if (handlers[i].listener == listener && (!alias || handlers[i].alias == alias)) {
						handlers.removeAt(i);
					}
				}
			}
		}
		else if (alias) {
			var handlers = this._events[name];
			if (handlers) {
				for (var i = handlers.length - 1; i >= 0; i--) {
					if (handlers[i].alias == alias) {
						handlers.removeAt(i);
					}
				}
			}
		}
		else {
			delete this._events[name];
		}
	},

	/**
	 * 清除事件中的所有事件监听器。
	 * @param {String} name 事件名称。
	 */
	clearListeners: function (name) {
		if (!this._events) return;
		this._events[name] = null;
	},

	/**
	 * 禁用所有事件的监听器。
	 */
	disableListeners: function () {
		this._disableListenersCounter++;
	},

	/**
	 * 启用所有事件的监听器。
	 */
	enableListeners: function () {
		if (this._disableListenersCounter > 0) this._disableListenersCounter--;
	},

	/**
	 * 触发一个事件。
	 * @param {String} name 事件名称。
	 * @param {Object} [args...] 0到n个事件参数。
	 * @return {boolean} 返回事件队列的触发过程是否正常的执行结束。
	 */
	fireEvent: function (name) {
		var def = this.EVENTS[name] || (this.PRIVATE_EVENTS && this.PRIVATE_EVENTS[name]);
		if (!def) throw new dorado.ResourceException("dorado.core.UnknownEvent", name);

		var handlers = (this._events) ? this._events[name] : null;
		if ((!handlers || !handlers.length) && !def.interceptor) return;

		var self = this;
		var superFire = function () {
			if (handlers) {
				for (var i = 0; i < handlers.length;) {
					var handler = handlers[i];
					if (handler.once) handlers.removeAt(i);
					else i++;
					if (self.notifyListener(handler, arguments) === false) return false;
				}
			}
			return true;
		};

		try {
			var interceptor = (typeof def.interceptor == "function") ? def.interceptor : null;
			if (interceptor) {
				arguments[0] = superFire;
				return interceptor.apply(this, arguments);
			} else if (handlers && this._disableListenersCounter == 0) {
				return superFire.apply(this, Array.prototype.slice.call(arguments, 1));
			}
		}
		catch (e) {
			if (def.processException) {
				dorado.Exception.processException(e);
			} else {
				throw e;
			}
		}
		return true;
	},

	/**
	 * 返回某事件中 已定义的事件监听器的个数。
	 * @param {String} name 事件名称。
	 * @return {int} 已定义的事件监听器的个数。
	 */
	getListenerCount: function (name) {
		if (this._events) {
			var handlers = this._events[name];
			return (handlers) ? handlers.length : 0;
		}
		else {
			return 0;
		}
	},

	notifyListener: function (handler, args) {
		var listener = handler.listener;
		var scope = handler.scope;
		if (!scope && this.getListenerScope) {
			scope = this.getListenerScope();
		}
		scope = scope || this;

		// 自动参数注入
		if (handler.autowire !== false) {
			if (handler.signature === undefined) {
				var info = dorado.getFunctionInfo(handler.listener);
				if (!info.signature || info.signature == "self,arg") {
					handler.signature = null;
				}
				else {
					handler.signature = info.signature.split(',');
				}
			}
			if (handler.signature) {
				var customArgs = [];
				if (dorado.widget && dorado.widget.View && scope instanceof dorado.widget.View) {
					for (var i = 0; i < handler.signature.length; i++) {
						var param = handler.signature[i];
						if (param == "self") {
							customArgs.push(args[0]);
						}
						else if (param == "arg") {
							customArgs.push(args[1]);
						}
						else if (param == "view") {
							customArgs.push(scope);
						}
						else {
							var object = scope.id(param);
							if (object == null) {
								object = scope.getDataType(param);
							}
							if (!object) {
								if (i == 0) object = args[0];
								else if (i == 1) object = args[1];
							}
							customArgs.push(object);
						}
					}
				}
				else{
					for (var i = 0; i < handler.signature.length; i++) {
						var param = handler.signature[i];
						if (param == "self") {
							customArgs.push(args[0]);
						}
						else if (param == "arg") {
							customArgs.push(args[1]);
						}
						else {
							customArgs = null;
							break;
						}
					}
				}
				if (customArgs) args = customArgs;
			}
		}

		var delay = handler.delay;
		if (delay >= 0) {
			/* ignore delayed listener's result */
			setTimeout(function () {
				listener.apply(scope, args);
			}, delay);
		} else {
			return listener.apply(scope, args);
		}
	}
});

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

(function () {

	/**
	 * @author Benny Bao (mailto:benny.bao@bstek.com)
	 * @component Action
	 * @class 动作控件。
	 * @extends dorado.widget.Component
	 */
	dorado.widget.Action = $extend(dorado.widget.Component, /** @scope dorado.widget.Action.prototype */ {
		$className: "dorado.widget.Action",

		ATTRIBUTES: /** @scope dorado.widget.Action.prototype */ {

			/**
			 * 名称。
			 * @type String
			 * @attribute
			 */
			caption: {},

			/**
			 * 图标。
			 * @type String
			 * @attribute
			 */
			icon: {},

			/**
			 * 图标元素的CSS Class。
			 * @type String
			 * @attribute
			 */
			iconClass: {},

			/**
			 * 提示信息。
			 * @type String
			 * @attribute
			 */
			tip: {},

			/**
			 * 是否被禁用。
			 * @type boolean
			 * @attribute
			 */
			disabled: {
				getter: function () {
					return this._disabled || this._sysDisabled;
				}
			},

			/**
			 * 动作在执行时附带的参数。
			 * @type Object
			 * @attribute
			 */
			parameter: {
				setter: function (parameter) {
					if (this._parameter instanceof dorado.util.Map && parameter instanceof dorado.util.Map) {
						this._parameter.put(parameter);
					} else {
						this._parameter = parameter;
					}
				}
			},

			/**
			 * 动作执行执行完成后返回的数据。
			 * @type Object
			 * @attribute readOnly
			 */
			returnValue: {
				readOnly: true
			},

			/**
			 * 热键。
			 * @type String
			 * @attribute
			 *
			 * @example
			 * action.set("hotkey", "f1");
			 * action.set("hotkey", "ctrl+s");
			 * action.set("hotkey", "alt+s");
			 * action.set("hotkey", "shift+s");
			 * action.set("hotkey", "ctrl+alt+shift+s");
			 * action.set("hotkey", "space");
			 * action.set("hotkey", "backspace");
			 * action.set("hotkey", "left");
			 * action.set("hotkey", "right");
			 * action.set("hotkey", "up");
			 * action.set("hotkey", "down");
			 */
			hotkey: {
				writeBeforeReady: true,
				setter: function (hotkey) {
					this._hotkey = hotkey;
					var self = this;
					if (hotkey) jQuery(document).bind("keydown", hotkey, function () {
						self.execute();
						return false;
					});
				}
			},

			/**
			 * 当此Action将要执行之前自动提示用户进行确认操作的提示信息。
			 * <p>
			 * 如果定义了此属性，在Action将要执行之前系统会自动向用户确认是否继续执行。
			 * </p>
			 * @type String
			 * @attribute
			 */
			confirmMessage: {},

			/**
			 * 当此Action执行成功之后自动提示的信息。
			 * @type String
			 * @attribute
			 */
			successMessage: {}
		},

		EVENTS: /** @scope dorado.widget.Action.prototype */ {
			/**
			 * 当命令将要执行之前触发的事件。
			 * @param {Object} self 事件的发起者，即组件本身。
			 * @param {Object} arg 事件参数。
			 * @param {boolean} #arg.processDefault=true 用于通知系统是否要继续完成后续动作。
			 * @return {boolean} 是否要继续后续事件的触发操作，不提供返回值时系统将按照返回值为true进行处理。
			 * @event
			 */
			beforeExecute: {},

			/**
			 * 当命令执行之后触发的事件。无论执行成功与否此事件都会被执行到。
			 * @param {Object} self 事件的发起者，即组件本身。
			 * @param {Object} arg 事件参数。
			 * @param {boolean} arg.success 命令是否执行成功。
			 * @param {Object|dorado.Exception|Error} arg.result 如果命令执行成功，此属性中的数值为命令的执行的返回值；
			 * 如果命令执行失败，此属性中的数值为异常对象。
			 * @return {boolean} 是否要继续后续事件的触发操作，不提供返回值时系统将按照返回值为true进行处理。
			 * @event
			 */
			onExecute: {},

			/**
			 * 当命令成功的被执行之后触发的事件。
			 * @param {Object} self 事件的发起者，即组件本身。
			 * @param {Object} arg 事件参数。
			 * @param {Object} arg.result 命令的执行的返回值。
			 * @param {boolean} #arg.processDefault=true 用于通知系统是否要继续完成后续动作。
			 * @return {boolean} 是否要继续后续事件的触发操作，不提供返回值时系统将按照返回值为true进行处理。
			 * @event
			 */
			onSuccess: {},

			/**
			 * 当命令成功的失败之后触发的事件。
			 * @param {Object} self 事件的发起者，即组件本身。
			 * @param {Object} arg 事件参数。
			 * @param {dorado.Exception|Error} arg.error 异常对象。
			 * @param {boolean} #arg.processDefault=true 用于通知系统是否要继续完成后续动作。
			 * @return {boolean} 是否要继续后续事件的触发操作，不提供返回值时系统将按照返回值为true进行处理。
			 * @event
			 */
			onFailure: {}
		},

		constructor: function () {
			this._bindingObjects = new dorado.ObjectGroup();
			$invokeSuper.call(this, arguments);
			this.bind("onAttributeChange", function (self, arg) {
				self.notifyBindingObjects(arg.attribute, arg.value);
			});
		},

		notifyBindingObjects: function(attr, value) {
			var self = this;
			dorado.Toolkits.setDelayedAction(self, "$actionStateChangeTimerId", function () {
				if ((attr == "icon") || (attr == "iconClass")) {
					self._bindingObjects.set(attr, value, {
						skipUnknownAttribute: true
					});
				} else {
					self._bindingObjects.invoke("onActionStateChange");
				}
			}, 20);
		},

		doAddBindingObject: function (object) {
			this._bindingObjects.objects.push(object);
		},

		doRemoveBindingObject: function (object) {
			this._bindingObjects.objects.remove(object);
		},

		/**
		 * 内部的执行方法。
		 * @function
		 * @abstract
		 * @protected
		 * @return {Object} 命令执行后的返回结果。
		 */
		doExecute: dorado._NULL_FUNCTION,

		/**
		 * 执行命令。
		 * @function
		 * @param {Function|dorado.Callback} callback 回调对象，传入回调对象的参数即为命令执行后的返回结果。
		 * @return {Object} 命令执行后的返回结果。
		 */
		execute: function (callback) {
			var self = this, retval;

			function realCall() {
				var eventArg = {};
				var success = false, result;
				try {
					self._returnValue = result = self.doExecute();
					success = true;
				}
				catch (e) {
					self._returnValue = result = e;
				}

				eventArg.success = success;
				eventArg[success ? "result" : "error"] = result;
				self.fireEvent("onExecute", self, eventArg);
				eventArg.processDefault = true;
				self.fireEvent((success) ? "onSuccess" : "onFailure", self, eventArg);

				if (!success) {
					if (eventArg.processDefault) {
						if (result) throw result;
					}
					else {
						if (result) dorado.Exception.removeException(result);
					}
				}
				if (success && eventArg.processDefault && self._successMessage) {
					dorado.widget.NotifyTipManager.notify(self._successMessage);
				}
				return result;
			}

			var eventArg = {
				processDefault: true
			};
			self.fireEvent("beforeExecute", self, eventArg);
			if (eventArg.processDefault) {
				if (self._confirmMessage) {
					dorado.MessageBox.confirm(self._confirmMessage, function () {
						var retval = realCall.call(self);
						$callback(callback, retval);
					});
				} else {
					retval = realCall.call(self);
					$callback(callback, retval);
				}
			}
			return retval;
		}

	});

	/**
	 * 支持异步执行的Action。
	 * @class
	 * @abstract
	 * @extends dorado.widget.Action
	 */
	dorado.widget.AsyncAction = $extend(dorado.widget.Action, /** @scope dorado.widget.AsyncAction.prototype */ {
		$className: "dorado.widget.AsyncAction",

		ATTRIBUTES: /** @scope dorado.widget.AsyncAction.prototype */ {

			/**
			 * 是否默认情况下使用异步方式执行。
			 * <p>
			 * 注意：异步的执行方式仅对Ajax类的Action有意义，例如AjaxAction和UpdateAction。
			 * </p>
			 * @type boolean
			 * @attribute
			 */
			async: {},

			/**
			 * 是否以模态方式在执行。
			 * 即一次异步调用的执行尚未执行结束之前，不能再一次调用该Action。
			 * @type boolean
			 * @attribute
			 * @default true
			 */
			modal: {
				defaultValue: true
			},

			/**
			 * 当此Action正在执行时希望系统显示给用户的提示信息。
			 * <p>
			 * 此属性目前仅在Action以异步模式执行时有效。
			 * </p>
			 * @type String
			 * @attribute
			 */
			executingMessage: {}
		},

		/**
		 * 内部以同步方式执行的抽象方法。
		 * @function
		 * @abstract
		 * @protected
		 * @return {Object} 命令执行后的返回结果。<br>
		 * 此返回值对于异步的方式而言可能没有任何意义。
		 */
		doExecuteSync: dorado._NULL_FUNCTION,

		/**
		 * 内部以异步方式执行的抽象方法。
		 * @function
		 * @abstract
		 * @protected
		 * @param {Function|dorado.Callback} callback 回调对象，传入回调对象的参数即为命令执行后的返回结果。
		 */
		doExecuteAsync: function (callback) {
			$callback(callback);
		},

		/**
		 * 执行命令。系统将根据async来决定使用同步还是异步方式执行命令。
		 * <p>
		 * 需要注意的是如果定义了此方法的callback参数，即使选择使用同步方式执行回调机制仍可以在执行成功的情况下生效。
		 * </p>
		 * @function
		 * @param {Function|dorado.Callback} callback 回调对象，传入回调对象的参数即为命令执行后的返回结果。
		 * @return {Object} 命令执行后的返回结果，此返回值对于异步的执行方式而言可能没有任何意义。<br>
		 * 注意：此方法返回值的含义可能会在派生类中被改变。
		 */
		execute: function (callback) {
			if (this._disabled) {
				throw new dorado.ResourceException("dorado.baseWidget.ErrorCallDisabledAction", this._id);
			}
			if (this._sysDisabled) {
				throw new dorado.ResourceException("dorado.baseWidget.ErrorCallSysDisabledAction", this._id);
			}

			var self = this, retval;

			function realCall(callback) {
				var eventArg = {
					processDefault: true
				};
				if (self._async) {
					var taskId;
					if (self._executingMessage || this._modal) {
						var message = self._executingMessage || $resource("dorado.core.DefaultTaskMessage");
						if (message && message != "none") {
							taskId = dorado.util.TaskIndicator.showTaskIndicator(message, this._modal ? "main" : "daemon");
						}
						else {
							taskId = 0;
						}
					}

					var hasIcon, oldIcon, oldIconClass;
					if (self._modal) {
						self._sysDisabled = true;
						self.notifyBindingObjects();
					}

					try {
						self.doExecuteAsync({
							callback: function (success, result) {
								if (taskId) dorado.util.TaskIndicator.hideTaskIndicator(taskId);
								if (self._modal) {
									self._sysDisabled = false;
									self.notifyBindingObjects();
								}

								self._returnValue = result;
								$callback(callback, success, result, {
									scope: self._view
								});

								eventArg.success = success;
								eventArg[success ? "result" : "error"] = result;
								self.fireEvent("onExecute", self, eventArg);
								self.fireEvent((success) ? "onSuccess" : "onFailure", self, eventArg);

								if (!success && !eventArg.processDefault) {
									dorado.Exception.removeException(eventArg.error);
								}
								if (success && eventArg.processDefault && self._successMessage) {
									dorado.widget.NotifyTipManager.notify(self._successMessage);
								}
							}
						});
					}
					catch (e) {
						if (taskId) dorado.util.TaskIndicator.hideTaskIndicator(taskId);

						if (self._modal) {
							self._sysDisabled = false;
							self.notifyBindingObjects();
						}

						if (!(e instanceof dorado.AbstractException)) {
							throw e;
						}
					}
				} else {
					var success = false, result;
					try {
						self._returnValue = result = self.doExecuteSync();
						success = true;
						$callback(callback, true, result, {
							scope: self._view
						});
					}
					catch (e) {
						self._returnValue = result = e;
					}

					eventArg.success = success;
					eventArg[success ? "result" : "error"] = result;
					self.fireEvent("onExecute", self, eventArg);
					self.fireEvent((success) ? "onSuccess" : "onFailure", self, eventArg);

					if (!success) {
						if (eventArg.processDefault) {
							if (result) throw result;
						}
						else {
							dorado.Exception.removeException(eventArg.error);
						}
					}
					if (success && eventArg.processDefault && self._successMessage) {
						dorado.widget.NotifyTipManager.notify(self._successMessage);
					}
					return result;
				}
			}

			var eventArg = {
				processDefault: true
			};
			self.fireEvent("beforeExecute", self, eventArg);
			if (eventArg.processDefault) {
				if (this._confirmMessage && this._confirmMessage != "none") {
					var self = this;
					dorado.MessageBox.confirm(this._confirmMessage, function () {
						realCall.call(self, callback);
					});
				} else {
					retval = realCall.call(this, callback);
				}
			}
			return retval;
		}
	});

	var listenedAttrs = ["caption", "icon", "iconClass", "tip", "disabled"];

	/**
	 * @author Benny Bao (mailto:benny.bao@bstek.com)
	 * @class 可与动作控件绑定的对象抽象类。
	 * @abstract
	 */
	dorado.widget.ActionSupport = $class({
		$className: "dorado.widget.ActionSupport",

		ATTRIBUTES: /** @scope dorado.widget.ActionSupport.prototype */ {

			/**
			 * 绑定的动作控件。
			 * @type dorado.widget.Action
			 * @attribute
			 */
			action: {
				componentReference: true,
				setter: function (action) {
					if (this._action instanceof dorado.widget.Action) {
						this._action.doRemoveBindingObject(this);
					}
					if (action && !(action instanceof dorado.widget.Action)) {
						var ref = action;
						action = ref.view.id(ref.component);
					}
					this._action = action;
					if (action) {
						action.doAddBindingObject(this);
					}
				}
			}
		},

		/**
		 * 当绑定的{@link dorado.widget.Action}的属性发现变化需要本对象进行相应的刷新时被激活的内部方法。
		 * @protected
		 */
		onActionStateChange: function () {
			if (this.refresh) this.refresh(true);
		},

		destroy: function () {
			if (this._destroyed) return;
			this.set("action", null);
			$invokeSuper.call(this, arguments);
		}
	});

})();

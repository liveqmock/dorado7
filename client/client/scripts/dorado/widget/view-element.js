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

	/**
	 * @name dorado.widget
	 * @namespace 包含dorado中各种界面组件的命名空间。
	 */
	dorado.widget = {};

	/**
	 * @author Benny Bao (mailto:benny.bao@bstek.com)
	 * @component General
	 * @class 视图元素。可视化控件或可视化控件元素的抽象实现。
	 * @extends AttributeSupport
	 * @extends dorado.EventSupport
	 */
	dorado.widget.ViewElement = $extend([dorado.AttributeSupport, dorado.EventSupport], /** @scope dorado.widget.ViewElement.prototype */ {
		$className: "dorado.widget.ViewElement",

		ATTRIBUTES: /** @scope dorado.widget.ViewElement.prototype */ {
			/**
			 * 组件的id。
			 * @type String
			 * @attribute writeBeforeReady
			 */
			id: {
				readOnly: true
			},

			/**
			 * 组件当前是否已被销毁。
			 * @type boolean
			 * @attribute readOnly
			 */
			destroyed: {
				readOnly: true
			},

			/**
			 * 父组件。
			 * @type dorado.widget.ViewElement
			 * @attribute readOnly
			 */
			parentViewElement: {
				readOnly: true
			},

			/**
			 * 组件所属的视图。
			 * @type dorado.widget.View
			 * @attribute readOnly
			 */
			view: {
				skipRefresh: true,
				setter: function(view) {
					if (this._view == view) return;
					if (this._view && this._id) this._view.unregisterViewElement(this._id);
					this._view = view;
					if (view && this._id) view.registerViewElement(this._id, this);

					if (this._innerViewElements) {
						this._innerViewElements.each(function(viewElement) {
							viewElement.set("view", view);
						});
					}
				}
			},

			/**
			 * 用户自定义数据。
			 * @type Object
			 * @attribute skipRefresh
			 */
			userData: {
				skipRefresh: true
			}
		},

		EVENTS: /** @scope dorado.widget.ViewElement.prototype */ {
			/**
			 * 当组件被创建时触发的事件。
			 * <p>
			 * 与其他事件不同，onCreate事件中的this是个例外，它并不指向控件所属的View对象，而是指向$view（见{@link $view}）。
			 * 之所以这样是因此，该事件是在控件创建的过程中触发的，而在此时控件还没有被添加到具体的（最终的）View中。
			 * 因此在触发此事件系统无法得知此控件应该属于哪个View。<br>
			 * {@link dorado.widget.View}对象的onCreate事件又是这个例外规则中的例外。
			 * 因为View对象的onCreate事件中的this总是指向自身的，因此View对象的onCreate事件与其他事件中的this并没有什么不同。
			 * </p>
			 * @param {Object} self 事件的发起者，即组件本身。
			 * @param {Object} arg 事件参数。
			 * @return {boolean} 是否要继续后续事件的触发操作，不提供返回值时系统将按照返回值为true进行处理。
			 * @event
			 */
			onCreate: {},

			/**
			 * 当组件被销毁时触发的事件。
			 * @param {Object} self 事件的发起者，即组件本身。
			 * @param {Object} arg 事件参数。
			 * @return {boolean} 是否要继续后续事件的触发操作，不提供返回值时系统将按照返回值为true进行处理。
			 * @event
			 */
			onDestroy: {}
		},

		constructor: function(config) {
			var id;
			if (config && config.constructor == String) {
				id = config;
				config = null;
			}
			else if (config) {
				id = config.id;
				delete config.id;
			}
			this._uniqueId = dorado.Core.newId();
			dorado.widget.ViewElement.ALL[this._uniqueId] = this;
			if (id) {
				id = id + '';
				if (!(/^[a-zA-Z_$][a-z0-9A-Z_$]*$/.exec(id))) {
					throw new dorado.ResourceException("dorado.widget.InvalidComponentId", id);
				}
				this._id = id;
			}
			this._prependingView = config && config.$prependingView;

			$invokeSuper.call(this);
			if (config) this.set(config, { skipUnknownAttribute: true });

			if (!(this._skipOnCreateListeners > 0) && this.getListenerCount("onCreate")) {
				this.fireEvent("onCreate", this);
			}
		},

		/**
		 * 销毁组件。
		 */
		destroy: function() {
			if (this._destroyed) return;
			this._destroyed = true;
			this.fireEvent("onDestroy", this);

			if (this._innerViewElements) {
				var viewElements = this._innerViewElements.slice(0);
				for(var i = 0, len = viewElements.length; i < len; i++) {
					viewElements[i].destroy();
				}
				delete this._innerViewElements;
			}

			if (!dorado.windowClosed) {
				if (this._view && this._id) this._view.unregisterViewElement(this._id);
				delete dorado.widget.ViewElement.ALL[this._uniqueId];
			}
		},

		doSet: function(attr, value, skipUnknownAttribute, lockWritingTimes) {
			var def = this.ATTRIBUTES[attr];
			if (def) {
				if (this._ready && def.writeBeforeReady) {
					throw new dorado.AttributeException("dorado.widget.AttributeWriteBeforeReady", attr);
				}
				if (def.componentReference) {
					var component = null, allPrepared = false;
					if (value) {
						if (value instanceof Array) {
							if (value.length > 0) {
								component = [], allPrepared = true;
								for(var i = 0; i < value.length; i++) {
									component[i] = dorado.widget.ViewElement.getComponentReference(this, attr, value[i]);
									if (!(component[i] instanceof dorado.widget.Component)) allPrepared = false;
								}
							}
						}
						else {
							component = dorado.widget.ViewElement.getComponentReference(this, attr, value);
							allPrepared = (component instanceof dorado.widget.Component);
						}
					}
					return $invokeSuper.call(this, [attr, (allPrepared ? component : null), skipUnknownAttribute, lockWritingTimes]);
				}
				else if (def.innerComponent != null) {
					if (value) {
						var defaultType = "dorado.widget." + def.innerComponent;
						if (value instanceof Array) {
							var components = [];
							for(var i = 0; i < value.length; i++) {
								components.push(this.createInnerComponent(value[i], defaultType));
							}
							value = components;
						}
						else {
							value = this.createInnerComponent(value, defaultType);
						}
					}
				}
			}
			return $invokeSuper.call(this, [attr, value, skipUnknownAttribute, lockWritingTimes]);
		},

		getListenerScope: function() {
			return this.get("view") || $topView;
		},

		fireEvent: function() {
			if (this._destroyed) return false;
			return $invokeSuper.call(this, arguments);
		},

		createInnerComponent: function(config, typeTranslator) {
			if (!config) return null;
			if (config instanceof dorado.widget.Component) return config;

			var component = null;
			if (typeof config == "object") {
				config.$prependingView = (this instanceof dorado.widget.View) ? this : this._prependingView;
				component = dorado.Toolkits.createInstance("widget", config, typeTranslator);
			}
			return component;
		},

		/**
		 * 将一个给定控件注册为本控件的内部控件。
		 * <p>
		 * 内部控件与{@link dorado.widget.Container}中的子控件是不同的概念。
		 * 内部控件是父控件自身的组成部分，例如RadioGroup控件本身就是由其中的一到多个RadioButton构成的。
		 * </p>
		 * <p>
		 * registerInnerViewElement方法一般也不应该被外部程序调用，而是应该有控件自身的代码在createDom或refreshDom等方法中调用。
		 * 利用registerInnerViewElement方法注册内部控件的目的是为了正确向这些控件传播系统消息，管理这些控件的状态。<br>
		 * 完成注册后的内部控件的parent和focusParent属性都将指向本控件。
		 * </p>
		 * @param {dorado.widget.ViewElement} viewElement 内部控件。
		 * @protected
		 */
		registerInnerViewElement: function(viewElement) {
			if (!this._innerViewElements) this._innerViewElements = [];
			this._innerViewElements.push(viewElement);
			viewElement._parentViewElement = this;
			if (viewElement.doSetParentViewElement) viewElement.doSetParentViewElement(this);
			viewElement.set("view", (this instanceof dorado.widget.View) ? this : this.get("view"));
			if (viewElement.parentChanged) viewElement.parentChanged();
		},

		/**
		 * 注销一个给定的内部控件。
		 * @param {dorado.widget.ViewElement} viewElement 内部控件。
		 * @protected
		 */
		unregisterInnerViewElement: function(viewElement) {
			if (!this._innerViewElements) return;
			this._innerViewElements.remove(viewElement);
			viewElement._parentViewElement = null;
			if (viewElement.doSetParentViewElement) viewElement.doSetParentViewElement(null);
			viewElement.set("view", null);
			if (viewElement.parentChanged) viewElement.parentChanged();
		}
	});

	dorado.widget.RenderableViewElement = $extend([dorado.widget.ViewElement, dorado.RenderableElement], {
		doSet: function(attr, value) {
			dorado.widget.ViewElement.prototype.doSet.call(this, attr, value);
			var def = this.ATTRIBUTES[attr];
			if (this._rendered && this.refresh && this._ignoreRefresh < 1 && def && !def.skipRefresh) {
				this.refresh(true);
			}
		}
	});

	dorado.widget.ViewElement.getComponentReference = function(object, attr, value) {
		if (!value) return value;
		if (value instanceof dorado.widget.Component) {
			return value;
		}
		else {
			var component, view;
			if (typeof value == "string") {
				if (object.getListenerScope) {
					view = object._prependingView || object.getListenerScope();
				}
				else {
					view = $topView;
				}
				component = view.id(value);
				if (component) return component;
				value = {
					view: view,
					component: value
				};
			}
			else if (typeof value == "object" && value.$type) {
				if (object.getListenerScope) {
					view = object._prependingView || object.getListenerScope();
				}
				else {
					view = $topView;
				}
				value.$prependingView = view;
				return dorado.Toolkits.createInstance("widget", value);

			}

			view = value.view, componentId = value.component;
			component = (view._prependingChild && view._prependingChild[componentId]) || view.id(componentId);
			if (component) return component;

			var wantedComponents = view._wantedComponents;
			if (!wantedComponents) {
				view._wantedComponents = wantedComponents = {
					count: 0
				};
				view.bind("onComponentRegistered._getComponentReference", viewOnComponentRegisteredListener);
			}
			var wanters = wantedComponents[componentId];
			if (!wanters) {
				wantedComponents[componentId] = wanters = [];
				wantedComponents.count++;
			}
			wanters.push({
				object: object,
				attribute: attr
			});

			var idProperty = '_' + attr + "_id";
			if (!object[idProperty]) {
				object[idProperty] = componentId;
			}
			else {
				var ids = object[idProperty];
				if (typeof ids == "string") object[idProperty] = ids = [object[idProperty]];
				ids.push(componentId);
			}
			return componentId;
		}
	}

	function viewOnComponentRegisteredListener(view, arg) {
		var wantedComponents = view._wantedComponents;
		var wanters = wantedComponents[arg.component._id];
		if (wanters) {
			var component = arg.component;
			delete wantedComponents[component._id];
			wantedComponents.count--;
			if (wantedComponents.count == 0) {
				view.unbind("onComponentRegistered._getComponentReference");
				delete view._wantedComponents;
			}
			for(var i = 0; i < wanters.length; i++) {
				var wanter = wanters[i], object = wanter.object, attribute = wanter.attribute;
				var ids = object['_' + attribute + "_id"];
				if (ids) {
					if (typeof ids == "string") {
						if (ids == component._id) {
							object.set(attribute, component, {
								lockWritingTimes: true
							});
						}
					}
					else {
						var index = ids.indexOf(component._id);
						if (index >= 0) {
							ids[index] = component;
							var allComponentPrepared = true;
							for(var j = 0; j < ids.length; j++) {
								if (typeof ids[j] == "string") {
									allComponentPrepared = false;
									break;
								}
							}
							if (allComponentPrepared) {
								object.set(attribute, ids, {
									lockWritingTimes: true
								});
							}
						}
					}
				}
			}
		}
	}

	/**
	 * 根据给定的DOM对象查找其所属的视图元素。
	 * <p>
	 * 注意：此查找动作的范围是跨越浏览器的框架的，亦即可以通过此方法查找父页面（父框架）中的视图元素。
	 * </p>
	 * @param {HTMLElement} element 作为查找起点的DOM对象。
	 * @param {Prototype|String} [type] 要查找的目标控件的类型。可以是具体的Prototype或类名。
	 * 如果不指定参数则表示包含此DOM对象且距离此此DOM对象最近的视图元素。
	 * @return {dorado.widget.ViewElement} 视图元素。
	 *
	 * @example
	 * // 查找某Element所属的控件。
	 * var control = dorado.widget.ViewElement.findParentViewElement(div);
	 *
	 * @example
	 * // 查找某Element元素所属的Dialog控件。
	 * var dialog = dorado.widget.ViewElement.findParentViewElement(div, dorado.widget.Dialog);
	 */
	dorado.widget.ViewElement.findParentViewElement = function(element, type) {

		function find(win, dom, className) {
			var control = null;
			do {
				var viewElement;
				if (dom.doradoUniqueId) {
					viewElement = win.dorado.widget.ViewElement.ALL[dom.doradoUniqueId];
				}
				if (viewElement) {
					var match = false;
					if (className) {
						if (viewElement.constructor.className === className) {
							match = true;
						}
						else {
							while(!viewElement._isDoradoControl) {
								viewElement = viewElement._parentViewElement;
								if (viewElement && viewElement.constructor.className === className) {
									match = true;
									break;
								}
							}
						}
					}
					else {
						match = true;
					}

					if (match) {
						break;
					}
				}
				dom = dom.parentNode;
			} while(dom != null);

			if (!viewElement && win.parent) {
				var parentFrames;
				try {
					parentFrames = win.parent.frames;
				}
				catch(e) {
					// do nothing;
				}

				if (parentFrames && parentFrames.length) {
					var frame;
					for(var i = 0; i < parentFrames.length; i++) {
						if (parentFrames[i].contentWindow == win) {
							frame = parentFrames[i];
							break;
						}
						;
					}
					if (frame) {
						viewElement = find(win.parent, frame, className);
					}
				}
			}
			return viewElement;
		}

		var className;
		if (typeof type == "function") {
			className = type.className;
		}
		else if (type) {
			className = type + '';
		}
		return find(window, element, className);
	}

	dorado.widget.ViewElement.ALL = {};

	dorado.Toolkits.registerTypeTranslator("widget", function(type) {
		return dorado.util.Common.getClassType("dorado.widget." + type, true);
	});

})();
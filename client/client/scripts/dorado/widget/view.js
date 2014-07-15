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

var AUTO_APPEND_TO_TOPVIEW = true;

(function() {

	var ALL_VIEWS = [];

	/**
	 * @author Benny Bao (mailto:benny.bao@bstek.com)
	 * @class 视图对象。
	 * <p>
	 * View对象的get方法在{@link dorado.AttributeSupport#get}的基础上做了很多增强。
	 * 除了原有的读取属性值的功能之外，此方法还另外提供了下面的几种用法。
	 * <ul>
	 *    <li>当传入一个以#开头的字符串时，#后面的内容将被识别成id，表示根据id获取View中的子控件。参考{@link dorado.widget.View#id}。</li>
	 *    <li>当传入一个以^开头的字符串时，^后面的内容将被识别成tag，表示根据tag查找View中的子对象。参考{@link dorado.widget.View#tag}。</li>
	 *    <li>当传入一个以@开头的字符串时，@后面的内容将被识别成DataType的名称，表示根据名称获取DataType。参考{@link dorado.widget.View#getDataType}。</li>
	 * </ul>
	 * </p>
	 * @extends dorado.widget.Container
	 */
	dorado.widget.View = $extend(dorado.widget.Container, /** @scope dorado.widget.View.prototype */ {
		$className: "dorado.widget.View",

		ATTRIBUTES: /** @scope dorado.widget.View.prototype */ {

			dataTypeRepository: {
				getter: function(p) {
					return this['_' + p] || $dataTypeRepository;
				}
			},

			className: {
				defaultValue: "d-view"
			},

			width: {
				defaultValue: "100%"
			},

			height: {
				defaultValue: "100%"
			},

			/**
			 * 视图的名称。此属性仅在配合Dorado服务端的开发模式中有意义。
			 * @type String
			 * @attribute writeBeforeReady
			 */
			name: {
				writeBeforeReady: true
			},

			/**
			 * 视图的渲染模式，即渲染时机。这个设定通常与性能优化相关。取值范围包括：
			 * <ul>
			 * <li>onCreate - 当视图被创建后就自动渲染。</li>
			 * <li>onDataLoaded - 当视图完成首批DataSet数据装载之后渲染。通常需要将部分DataSet的loadMode设置为onReady，才能产生实际效果。</li>
			 * <li>manual - 手工渲染。即需要开发者自行调用View的render()方法来完成渲染。</li>
			 * </ul>
			 * 此属性对于Dorado ClientEdition而言是无效的。
			 * @type String
			 * @attribute writeBeforeReady
			 */
			renderMode: {
				defaultValue: "onCreate"
			},

			view: {
				setter: function(view) {
					dorado.widget.Component.prototype.ATTRIBUTES.view.setter.call(this, view);
				}
			},

			/**
			 * 与此视图关联的上下文。
			 * <p>
			 * 此上下文对象通常仅在Standard Edtiion的开发中有效，开发者可以通过此上下文与服务端进行一些数据和状态的传递。
			 * </p>
			 * @type dorado.util.Map
			 * @attribute writeBeforeReady
			 */
			context: {
				writeBeforeReady: true,
				getter: function() {
					if (this._context == null) this._context = $map();
					return this._context;
				},
				setter: function(context) {
					this._context = (context == null) ? null : $map(context);
				}
			},

			children: {
				setter: function(children, attr) {
					this._prependingChild = {};
					$invokeSuper.call(this, [children, attr]);
					delete this._prependingChild;
				}
			}
		},

		EVENTS: /** @scope dorado.widget.View.prototype */ {
			/**
			 * 当组件对应的根DOM对象被创建时触发的事件。
			 * @param {Object} self 事件的发起者，即组件本身。
			 * @param {Object} arg 事件参数。
			 * @return {boolean} 是否要继续后续事件的触发操作，不提供返回值时系统将按照返回值为true进行处理。
			 * @event
			 * @see dorado.widget.DataSet#loadMode
			 */
			onDataLoaded: {},

			/**
			 * 当一个子组件被注册到视图中时触发的事件。
			 * <p>
			 * 这里所说的子组件并不单指视图控件中的子控件，还包括子控件中的子控件，但不包含子视图中的子控件。
			 * </p>
			 * @param {Object} self 事件的发起者，即组件本身。
			 * @param {Object} arg 事件参数。
			 * @param {dorado.widget.ViewElement} arg.viewElement 被注册的子组件。
			 * @return {boolean} 是否要继续后续事件的触发操作，不提供返回值时系统将按照返回值为true进行处理。
			 * @event
			 */
			onViewElementRegistered: {},

			/**
			 * 当一个子组件被从视图中注消时触发的事件。
			 * <p>
			 * 这里所说的子组件并不单指视图控件中的子控件，还包括子控件中的子控件，但不包含子视图中的子控件。
			 * </p>
			 * @param {Object} self 事件的发起者，即组件本身。
			 * @param {Object} arg 事件参数。
			 * @param {dorado.widget.ViewElement} arg.viewElement 被注消的子组件。
			 * @return {boolean} 是否要继续后续事件的触发操作，不提供返回值时系统将按照返回值为true进行处理。
			 * @event
			 */
			onViewElementUnregistered: {},

			/**
			 * @see dorado.widget.View#event:onViewElementRegistered
			 * @event
			 * @deprecated
			 */
			onComponentRegistered: {},

			/**
			 * @see dorado.widget.View#event:onViewElementUnregistered
			 * @event
			 * @deprecated
			 */
			onComponentUnregistered: {}
		},

		constructor: function(configs) {
			ALL_VIEWS.push(this);

			this._identifiedViewElements = {};
			this._loadingDataSet = [];

			if (configs == "$TOP_VIEW") {
				this._dataTypeRepository = dorado.DataTypeRepository.ROOT;
			}
			else {
				this._dataTypeRepository = new dorado.DataTypeRepository(dorado.DataTypeRepository.ROOT);
			}
			this._dataTypeRepository._view = this;

			$invokeSuper.call(this, [configs]);

			if (this._id) {
				this._identifiedViewElements[this._id] = this;
				
				var oldValue = window[this._id];
				if (oldValue !== undefined) {
					var errorMesssage;
					if (oldValue instanceof dorado.widget.View) {
						errorMesssage = "dorado.widget.UnsafeViewId";
					}
					else {
						errorMesssage = "dorado.widget.UniqueViewId";
					}
					new dorado.ResourceException(errorMesssage, this._id);
				}
				else {
					window[this._id] = this;
				}
			}
		},

		loadData: function() {
			if (this._renderMode !== "onDataLoaded") return;

			this._children.each(function (child) {
				if (!(child instanceof dorado.widget.Control) && !child._ready) child.onReady();
			});
			$waitFor(this._loadingDataSet, $scopify(this, this.onDataLoaded));
			this._loadingDataSet = [];
		},

		onReady: function() {
			$invokeSuper.call(this);
			if (this._renderMode !== "onDataLoaded") {
				$waitFor(this._loadingDataSet, $scopify(this, this.onDataLoaded));
				this._loadingDataSet = [];
			}
		},

		destroy: function() {
			ALL_VIEWS.remove(this);
			$invokeSuper.call(this);
		},

		createDefaultLayout: function() {
			if (this._id != "$TOP_VIEW") $invokeSuper.call(this);
		},

		parentChanged: function() {
			if (this._parent) {
				var container = this._parent;
				do {
					if (container instanceof dorado.widget.View) {
						this._dataTypeRepository.parent = container._dataTypeRepository;
						break;
					}
					container = container._parent;
				}
				while(container != null);
			}
			else {
				this._dataTypeRepository.parent = dorado.DataTypeRepository.ROOT;
			}
		},

		registerViewElement: function(id, comp) {
			if (!id) return;

			if (this._identifiedViewElements[id]) {
				throw new dorado.ResourceException("dorado.widget.ComponentIdNotUnique", id, this._id);
			}
			this._identifiedViewElements[id] = comp;
			if (this.getListenerCount("onViewElementRegistered")) {
				this.fireEvent("onViewElementRegistered", this, {
					viewElement: comp
				});
			}

			/**
			 * @deprecated
			 */
			if (this.getListenerCount("onComponentRegistered")) {
				this.fireEvent("onComponentRegistered", this, {
					component: comp
				});
			}
		},

		unregisterViewElement: function(id) {
			if (!id) return;

			if (this.getListenerCount("onViewElementUnregistered")) {
				var comp = this._identifiedViewElements[id];
				this.fireEvent("onViewElementUnregistered", this, {
					component: comp
				});
			}

			/**
			 * @deprecated
			 */
			if (this.getListenerCount("onComponentUnregistered")) {
				var comp = this._identifiedViewElements[id];
				this.fireEvent("onComponentUnregistered", this, {
					component: comp
				});
			}
			delete this._identifiedViewElements[id];
		},

		/**
		 * @deprecated
		 */
		registerComponent: function(id, comp) {
			this.registerViewElement(id, comp);
		},

		/**
		 * @deprecated
		 */
		unregisterComponent: function(id) {
			this.unregisterViewElement(id);
		},

		getListenerScope: function() {
			return this;
		},

		doGet: function(attr) {
			var c = attr.charAt(0);
			if (c == '#') {
				var id = attr.substring(1);
				var result = this.id(id);
				if (!result) result = this.getDataType(id);
				return result;
			}
			else if (c == '^') {
				var tag = attr.substring(1);
				return this.tag(tag);
			}
			else if (c == '@') {
				var dataTypeName = attr.substring(1);
				return this.getDataType(dataTypeName);
			}
			else {
				return $invokeSuper.call(this, [attr]);
			}
		},

		/**
		 * 根据传入的id返回View中的某个组件。
		 * @param {String} id 子对象的ID。
		 * @return {dorado.widget.Component} ID所指的子对象。
		 */
		id: function(id) {
			var viewElement = this._identifiedViewElements[id];
			if (!viewElement && dorado.widget.View.DEFAULT_COMPONENTS) {
				viewElement = dorado.widget.View.getDefaultComponent(this, id);
				if (viewElement) this.registerViewElement(id, viewElement);
			}
			return viewElement;
		},

		/**
		 * 返回本视图中具有某一指定标签的对象的对象组。
		 * @param {String} tags 标签值。
		 * @return {dorado.ObjectGroup} 对象组。
		 *
		 * @see $tag
		 */
		tag: function(tags) {
			var group = dorado.TagManager.find(tags), allObjects = group.objects, objects = [];
			for(var i = 0; i < allObjects.length; i++) {
				var object = allObjects[i];
				if (object._view == this || object.view == this ||
					(object.ATTRIBUTES.view && object.get("view") == this) ||
					(object.getListenerScope && object.getListenerScope() == this)) {
					objects.push(object);
				}
			}
			return new dorado.ObjectGroup(objects);
		},

		getComponentReference: function(id) {
			var comp = this.id(id);
			return comp ||
			{
				view: this,
				component: id
			};
		},

		/**
		 * 根据名称以同步方式返回View中的DataType。
		 * @param {String} name 数据类型的名称。
		 * @return {dorado.DataType} 数据类型。
		 */
		getDataType: function(name) {
			return this._dataTypeRepository.get(name);
		},

		/**
		 * 根据名称以异步方式返回View中的DataType。
		 * @param {String} name 数据类型的名称。
		 * @param {Function|dorado.Callback} callback 回调对象，传入回调对象的参数即为得到数据类型。
		 */
		getDataTypeAsync: function(name, callback) {
			return this._dataTypeRepository.getAsync(name, callback);
		},

		onReady: function() {
			$invokeSuper.call(this);
			$waitFor(this._loadingDataSet, $scopify(this, this.onDataLoaded));
			this._loadingDataSet = [];
		},

		/**
		 * 当那些loadMode属性为onReady的数据集全部完成数据装载时触发的方法。
		 * @protected
		 * @see dorado.widget.DataSet#loadMode
		 */
		onDataLoaded: function() {
			if (this._renderMode == "onDataLoaded") {
				this.render();
			}
			this.fireEvent("onDataLoaded", this);
		},

		render: function(containerElement) {
			var bodyWidth;
			if (containerElement == document.body) bodyWidth = document.body.clientWidth;
			$invokeSuper.call(this, [containerElement]);
			if (bodyWidth && bodyWidth > document.body.clientWidth) this.onResize();
		},

		doRenderToOrReplace: function(replace, element, nextChildElement) {
			this._rendering = true;
			$invokeSuper.call(this, [replace, element, nextChildElement]);
			this._rendering = false;
		},

		/**
		 * 根据绑定表达式，为View中的控件或子对象绑定事件监听器。
		 * @param {String} expression 表达式。
		 * @param {Function} listener 事件监听器。
		 * @param {Object} [options] 监听选项。
		 */
		bindByExpression: function(expression, listener, options) {
			var i = expression.lastIndexOf('.'), objectsExpression, eventName;
			if (i > 0) {
				objectsExpression = expression.substring(0, i);
				eventName = expression.substring(i + 1);
			}

			if (i <= 0 || !eventName) {
				throw new dorado.Exception("Invalid binding expression \"" + expression + "\".");
			}

			var objects;
			if (objectsExpression == "view") {
				objects = this;
			}
			else {
				objects = this.get(objectsExpression);
			}

			if (objects) {
				if (dorado.Object.isInstanceOf(objects, dorado.EventSupport)) {
					if (eventName == "onCreate") {
						objects.notifyListener(dorado.Object.apply({
							listener: listener
						}, options), [objects]);
					}
					objects.bind(eventName, listener, options);
				}
				else if (objects instanceof dorado.ObjectGroup) {
					if (eventName == "onCreate") {
						objects.each(function(object) {
							object.notifyListener(dorado.Object.apply({
								listener: listener
							}, options), [object]);
						});
					}
					objects.bind(eventName, listener, options);
				}
			}
		}

	});

	dorado.widget.View.registerDefaultComponent = function(id, component) {
		var comps = this.DEFAULT_COMPONENTS = this.DEFAULT_COMPONENTS || {};
		comps[id] = component;
	};

	dorado.widget.View.getDefaultComponent = function(view, id) {
		var comps = this.DEFAULT_COMPONENTS;
		if (!comps || !comps[id]) return;
		var comp = comps[id];
		if (typeof comp == "function") comp = comp(view);
		return comp;
	};

	/**
	 * @name $id
	 * @function
	 * @description 返回某给定的id，返回当前页面的所有视图(View)中于此id匹配的控件所组成的对象组。
	 * @param {String} id 要查找的id。
	 * @return {dorado.ObjectGroup} 对象组。
	 */
	window.$id = function(id) {
		var viewElements = [];
		for(var i = 0; i < ALL_VIEWS.length; i++) {
			var view = ALL_VIEWS[i];
			var viewElement = view.id(id);
			if (viewElement) viewElements.push(viewElement);
		}
		return new dorado.ObjectGroup(viewElements);
	};

	/**
	 * @name dorado.widget.View.waitFor
	 * @function
	 * @description 等待一个或一组异步操作过程全部执行完毕之后再触发指定的回调方法。
	 * @param {Function[]|Function|dorado.widget.DataSet[]|dorado.widget.DataSet} tasks 一个或一组要等待的异步过程。
	 * <p>
	 * 此处定义异步操作过程时既可以传入单个的过程也可以传入以数组封装的多个过程。 目前可支持的异步操作过程包括下列两种定义形式:
	 * <ul>
	 * <li>直接传入某个{@link dorado.DataSet}，此方法会自动调用其getDataAsync()方法。 </li>
	 * <li>直接传入某个{@link dorado.widget.AsyncAction}，此方法会自动调用其execute()方法。</li>
	 * <li>传入异步操作描述对象。异步操作描述对象是用于定义异步操作的JSON对象，其中包含下列子属性：
	 * <ul>
	 * <li>run - {Function} 包含对调用异步操作进行调用的Function。</li>
	 * <li>callback - {Function|dorado.Callback} 异步操作的回调方法或回调对象。</li>
	 * </ul>
	 * </li>
	 * <li>传入一个包含异步操作的Function，该Function的有且只能有一个传入参数，该参数其中异步操作的回调方法。 </li>
	 * </ul>
	 * </p>
	 * @param {Function|dorado.Callback} callback 回调方法或回调对象。
	 * @see $waitFor
	 */
	/**
	 * @name $waitFor
	 * @function
	 * @description {@link dorado.widget.View.waitFor}的快捷方式。
	 * @see dorado.widget.View.waitFor
	 */
	window.$waitFor = dorado.widget.View.waitFor = function(tasks, callback) {
		if (!(tasks instanceof Array)) tasks = [tasks];
		var simTasks = [];
		jQuery.each(tasks, function(i, task) {
			if (task instanceof dorado.widget.DataSet) {
				simTasks.push({
					callback: dorado._NULL_FUNCTION,
					run: function(callback) {
						task.loadAsync(callback);
					}
				});
			}
			else if (task instanceof dorado.widget.AsyncAction) {
				simTasks.push({
					callback: dorado._NULL_FUNCTION,
					run: function(callback) {
						task.execute(callback);
					}
				});
			}
			else if (typeof task == "function") {
				simTasks.push({
					callback: dorado._NULL_FUNCTION,
					run: task
				});
			}
			else {
				simTasks.push(task);
			}
		});
		dorado.Callback.simultaneousCallbacks(simTasks, callback);
	};

	var resizeCallbacks = [];
	dorado.bindResize = function(callback) {
		if (typeof callback != "function") return;
		resizeCallbacks.push(callback);
	};

	dorado.fireResizeCallback = function(keyboardVisible) {
		for(var i = 0, j = resizeCallbacks.length; i < j; i++) {
			var callback = resizeCallbacks[i];
			callback.call(null, keyboardVisible);
		}
	};

	dorado.unbindResize = function(callback) {
		if (typeof callback != "function") return;
		var index = resizeCallbacks.indexOf(callback);
		if (index != -1) {
			resizeCallbacks.removeAt(index);
		}
	};

	var topView = new dorado.widget.View("$TOP_VIEW");

	/**
	 * 根视图对象。<br>
	 * 该视图对象是所有其它尚未被添加到容器中的视图对象的默认容器。
	 * @type dorado.widget.View
	 * @constant
	 */
	dorado.widget.View.TOP = topView;

	/**
	 * dorado.widget.View.TOP的快捷方式。
	 * @type dorado.widget.View
	 * @constant
	 * @see dorado.widget.View.TOP
	 */
	window.$topView = topView;

	jQuery().ready(function() {

		function getControlByElement(el) {
			var node = $DomUtils.findParent(el, function(node) {
				return (!!node.doradoUniqueId);
			});
			var control = null;
			if (node) control = dorado.widget.ViewElement.ALL[node.doradoUniqueId];
			return control;
		}

		dorado.fireBeforeInit();

		var lastFocusedControl;
		$fly(document).mousedown(function(evt) {
			var element = evt.target;
			if (!element || !element.style || element.style.tabIndex < 0) return;

			var nodeName = element.nodeName.toLowerCase();
			var ignorePhyscialFocus = (nodeName == "input" || nodeName == "textarea" || nodeName == "select")

			var control = getControlByElement(element);
			if (control == null) {
				dorado.widget.setFocusedControl(null, ignorePhyscialFocus);
			}
			else {
				dorado.widget.setFocusedControl(control, ignorePhyscialFocus);
			}
		});
		if (!dorado.Browser.isTouch) {
			$fly(document).keydown(function(evt) {
				var b, c = dorado.widget.getFocusedControl();
				if (c) b = c.onKeyDown(evt);

				if ((dorado.widget.HtmlContainer && c instanceof dorado.widget.HtmlContainer) ||
					(dorado.widget.TemplateField && c instanceof dorado.widget.TemplateField)) {
					return true;
				}

				if (b === false) {
					evt.preventDefault();
					evt.cancelBubble = true;
					return false;
				}
				else {
					if ($setting["common.preventBackspace"]) {
						switch(evt.keyCode || evt.which) {
							case 8:
								var doPrevent = false;
								var d = evt.srcElement || evt.target;
								if ((d.tagName.toLowerCase() === 'input' && (d.type.toLowerCase() === 'text' || d.type.toLowerCase() === 'password' || d.type.toLowerCase() === 'file'))
									|| d.tagName.toLowerCase() === 'textarea') {
									doPrevent = d.readOnly || d.disabled;
								}
								else {
									doPrevent = true;
								}

								if (doPrevent) {
									evt.preventDefault();
									evt.cancelBubble = true;
									return false;
								}
								break;
						}
					}

					if (b === true) {
						switch(evt.keyCode || evt.which) {
							case 8:
							{	// Backspace
								if (evt.srcElement) {
									var nodeName = evt.srcElement.nodeName.toLowerCase();
									if (!((nodeName == 'input' || nodeName == "textarea") && !evt.srcElement.readOnly && !evt.srcElement.disabled)) {
										return false;
									}
								}
								break;
							}
							case 13:
							{ // Enter
								if ($setting["common.enterAsTab"]) {
									var c = (evt.shiftKey) ? dorado.widget.findPreviousFocusableControl() : dorado.widget.findNextFocusableControl();
									if (c) c.setFocus();
									evt.preventDefault();
									evt.cancelBubble = true;
									return false;
								}
								break;
							}
							case 9:
							{ // Tab
								var c = (evt.shiftKey) ? dorado.widget.findPreviousFocusableControl() : dorado.widget.findNextFocusableControl();
								if (c) c.setFocus();
								evt.preventDefault();
								evt.cancelBubble = true;
								return false;
							}
						}
					}
					return true;
				}
			}).keypress(function(evt) {
					var b, c = dorado.widget.getFocusedControl();
					if (c) b = c.onKeyPress(evt);
					if (b === false) {
						evt.preventDefault();
						evt.cancelBubble = true;
						return false;
					}
					else {
						return true;
					}
				});
		}

		var cls = "d-unknown-browser", b = dorado.Browser, v = b.version;
		if (b.isTouch) {
			if (b.android) {
				cls = "d-android";
			}
			else if (b.iOS) {
				cls = "d-ios";
			}
			
			if (b.androidNative) {
				cls += " d-android-native";
			}
		}
		else {
			if (b.msie) {
				cls = "d-ie";
			}
			else if (b.mozilla) {
				cls = "d-mozilla";
			}
			else if (b.chrome) {
				cls = "d-chrome";
			}
			else if (b.safari) {
				cls = "d-safari";
			}
			else if (b.opera) {
				cls = "d-opera";
			}

			if ($setting["common.simulateTouch"]) {
				cls += " d-touch";
			}
		}
		if (v) {
			cls += " " + cls + v;
		}
		if (b.android_40) {
			cls += " d-android-40";
		}

		$fly(document.body).addClass(cls + " d-rendering");
		if (!dorado.Browser.isTouch) {
			$fly(document.body).focusin(function(evt) {
				if (dorado.widget.Control.IGNORE_FOCUSIN_EVENT) return;
				var control = getControlByElement(evt.target);
				if (control) {
					dorado.widget.onControlGainedFocus(control);
				}
			});
		}

		var resizeTopView = function() {
			if (topView.onResizeTimerId) {
				clearTimeout(topView.onResizeTimerId);
				delete topView.onResizeTimerId;
			}

			topView.onResizeTimerId = setTimeout(function() {
				dorado.fireResizeCallback();
				rootViewport.updateBodySize();
				delete topView.onResizeTimerId;
				topView._children.each(function(child) {
					if (child.resetDimension && child._rendered && child._visible) child.resetDimension();
				});
			}, 100);
		};

		var isInIFrame = false;
		try {
			isInIFrame = !!(top != window || window.frameElement);
		}
		catch(e) {
			isInIFrame = true;
		}

		var doInitDorado = function() {
			dorado.fireOnInit();

			topView.onReady();

			var oldWidth = $fly(window).width(), oldHeight = $fly(window).height();

			$fly(window).unload(function() {
				dorado.windowClosed = true;
				if (!topView._destroyed) topView.destroy();
			});

			var oldResize = window.onresize, keyboardVisible;

			window.onresize = function() {
				oldResize && oldResize.apply(window, arguments);
				if (dorado.Browser.isTouch) {
					var width = $fly(window).width(), height = $fly(window).height();
					if ((oldWidth === undefined && oldHeight === undefined) || (width !== oldWidth && height !== oldHeight)) {
						resizeTopView();
					} else if (dorado.Browser.miui && !keyboardVisible && Math.abs(height - oldHeight) < 100) {
						resizeTopView();
					} else if (dorado.Browser.android && Math.abs(height - oldHeight) > 100) {
						keyboardVisible = height - oldHeight < 0;
						dorado.fireResizeCallback(keyboardVisible);
					}
					oldWidth = width;
					oldHeight = height;
				}
				else {
					resizeTopView();
				}
			};

			if (dorado.Browser.isTouch) {
				$fly(window).bind("orientationchange", function() {
					resizeTopView();
				});

				$fly(document).bind("touchmove", function (event) {
					event.preventDefault();
				});v
			}

			dorado.fireAfterInit();
			setTimeout(function() {
				$fly(document.body).removeClass("d-rendering");
			}, 500);
		};

		var rootViewport = {
			init: function(fn, scope) {
				var me = this, stretchSize = Math.max(window.innerHeight, window.innerWidth) * 2,
					body = document.body;

				this.initialHeight = window.innerHeight;

				jQuery(body).height(stretchSize);

				this.scrollToTop();

				setTimeout(function() {
					me.scrollToTop();
					setTimeout(function() {
						me.scrollToTop();
						me.initialHeight = Math.max(me.initialHeight, window.innerHeight);

						me.updateBodySize();
						if (fn) {
							fn.apply(scope || window);
						}
					}, 50);
				}, 50);
			},
			scrollToTop: function() {
				if (!dorado.Browser.isPhone) return;
				if (dorado.Browser.iOS) {
					if (dorado.Browser.isPhone) {
						document.body.scrollTop = document.body.scrollHeight;
					}
				}
				else {
					window.scrollTo(0, 1);
				}
			},
			updateBodySize: function() {
				if (isInIFrame) return;
				var $body = $fly(document.body), width = jQuery(window).width(), height = jQuery(window).height();
				$body.height(height).width(width);
			}
		};

		if (dorado.Browser.isTouch) {
			if (isInIFrame) {
				setTimeout(doInitDorado, 10);
			}
			else {
				rootViewport.init(function() {
					doInitDorado();
				});
			}
			return;
		}

		if (dorado.Browser.chrome) {
			setTimeout(doInitDorado, 10);
		}
		else {
			doInitDorado();
		}
	});

})();

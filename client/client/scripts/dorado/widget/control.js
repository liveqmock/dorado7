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

	var lastMouseDownTarget, lastMouseDownTimestamp = 0;

	/**
	 * @author Benny Bao (mailto:benny.bao@bstek.com)
	 * @component General
	 * @class 基本控件。 控件是指可用于在屏幕上显示的组件，例如：按钮、表格等。
	 * @extends dorado.widget.Component
	 * @extends dorado.RenderableElement
	 * @extends dorado.Draggable
	 * @extends dorado.Droppable
	 */
	dorado.widget.Control = $extend([dorado.widget.Component, dorado.RenderableElement, dorado.Draggable, dorado.Droppable], /** @scope dorado.widget.Control.prototype */
		{
			$className: "dorado.widget.Control",

			_isDoradoControl: true,
			_ignoreRefresh: 1,
			_parentActualVisible: true,

			/**
			 * @protected
			 * @type boolean
			 * @description 用于指示该种控件是否支持获得控制焦点。
			 */
			focusable: false,

			/**
			 * @protected
			 * @type boolean
			 * @default true
			 * @description 该控件（包含其中的子控件）是否允许被鼠标选中。
			 */
			selectable: true,

			/**
			 * @name dorado.widget.Control#doOnFocus
			 * @function
			 * @protected
			 * @description 当控件获得控制焦点时被激活的内部方法。
			 */
			/**
			 * @name dorado.widget.Control#doOnBlur
			 * @function
			 * @protected
			 * @description 当控件失去控制焦点时被激活的内部方法。
			 */
			/**
			 * @name dorado.widget.Control#doOnAttachToDocument
			 * @function
			 * @protected
			 * @description 当控件所对应的HTML元素被真正的添加(相当于appendChild)到HTML的dom树中时激活的方法。
			 * @see dorado.widget.Control#onAttachToDocument
			 */
			/**
			 * @name dorado.widget.Control#doOnDetachFromDocument
			 * @function
			 * @protected
			 * @description 当控件所对应的HTML元素被从(相当于removeChild)到HTML的dom树中分离时激活的方法。
			 * @see dorado.widget.Control.prototype#onDetachFromDocument
			 */
			// =====

			ATTRIBUTES: /** @scope dorado.widget.Control.prototype */
			{
				className: {
					writeBeforeReady: true,
					defaultValue: "d-control"
				},

				exClassName: {},

				ui: {
					defaultValue: "default",
					skipRefresh: true,
					setter: function(ui) {
						if (ui == this._ui) return;

						if (this._dom) {
							if (this._ui) {
								var classNames = [];
								var uis = this._ui.split(',');
								for(var i = 0; i < uis.length; i++) {
									classNames.push(this._className + "-" + uis[i]);
								}
								$fly(this._dom).removeClass(classNames.join(' '));
							}
						}

						this._ui = ui;

						if (this._dom) {
							if (ui) {
								var classNames = [];
								var uis = ui.split(',');
								for(var i = 0; i < uis.length; i++) {
									classNames.push(this._className + "-" + uis[i]);
								}
								$fly(this._dom).addClass(classNames.join(' '));
							}
						}
					}
				},

				/**
				 * 宽度。
				 * @type int|String
				 * @attribute
				 */
				width: {
					setter: function(v) {
						this._width = isFinite(v) ? parseInt(v) : v;
						delete this._realWidth;
						this._fixedWidth = !(typeof v == "string" && v.match('%')) || v == "auto";
					}
				},

				/**
				 * 高度。
				 * @type int|String
				 * @attribute
				 */
				height: {
					setter: function(v) {
						this._height = isFinite(v) ? parseInt(v) : v;
						delete this._realHeight;
						this._fixedHeight = !(typeof v == "string" && v.match('%')) || v == "auto";
					}
				},

				/**
				 * 用于指定该控件在创建后自动渲染到指定到网页中的什么位置中的属性。最终控件将被渲染目标位置对象的内部。
				 * <p>
				 * 该属性的内容是CSS Selector的表达式（用于确定渲染的目标位置）或直接传入目标位置的DOM对象。
				 * </p>
				 * <p>
				 * 注意：此属性的值只能在控件的构造参数中指定，当控件创建完成后再通过set方法修改将是没有任何意义的。
				 * </p>
				 * <p>
				 * 注意：如果同时定义了控件的renderTo和renderOn属性，那么系统将会忽略renderOn中的值。
				 * </p>
				 * @type String|HTMLElement
				 * @attribute writeOnce,writeBeforeReady
				 * @see dorado.widget.Control#attribute:renderOn
				 *
				 * @example // 指定此按钮自动渲染到id为divButtonHolder的DOM元素中。
				 * new dorado.widget.Button({
				 * 	caption: "Test Button",
				 * 	renderTo: "#divButtonHolder"
				 * });
				 */
				renderTo: {
					writeOnce: true,
					writeBeforeReady: true
				},

				/**
				 * 用于指定该控件在创建后自动渲染到指定到网页中的什么位置中的属性。最终控件将直接替换掉目标位置对象。
				 * <p>
				 * 该属性的内容是CSS Selector的表达式（用于确定渲染的目标位置）或直接传入目标位置的DOM对象。
				 * </p>
				 * <p>
				 * 注意：此属性的值只能在控件的构造参数中指定，当控件创建完成后再通过set方法修改将是没有任何意义的。
				 * </p>
				 * <p>
				 * 注意：如果同时定义了控件的renderTo和renderOn属性，那么系统将会忽略renderOn中的值。
				 * </p>
				 * @type String|HTMLElement
				 * @attribute writeOnce,writeBeforeReady
				 * @see dorado.widget.Control#attribute:renderTo
				 *
				 * @example // 指定此按钮自动渲染并替换掉id为myButton的DOM元素。
				 * new dorado.widget.Button({
				 * 	caption: "Test Button",
				 * 	renderOn: "#myButton"
				 * });
				 */
				renderOn: {
					writeOnce: true,
					writeBeforeReady: true
				},

				/**
				 * 是否可见。
				 * @type Boolean
				 * @attribute
				 * @default true
				 */
				visible: {
					defaultValue: true,
					skipRefresh: true,
					setter: function(visible) {
						if (visible == null) visible = true;

						if (this._visible != visible) {
							this._visible = visible;
							this.onActualVisibleChange();
						}
					}
				},

				/**
				 * 用于表述此控件当前是否真实可见。
				 * <p>
				 * 除控件的visible属性可以改变本控件的可见状态之外，父控件被隐藏、面板收起、窗口最小化等原因都可能造成某控件实际处于不可见状态。
				 * 因此visible为true的控件，其actualVisible属性未必也返回true。
				 * </p>
				 * @type boolean
				 * @attribute readOnly
				 */
				actualVisible: {
					readOnly: true,
					getter: function() {
						return this.isActualVisible() && this._attached && this._rendered;
					}
				},

				/**
				 * 隐藏模式，表示当用户将该控件的visible属性设置为false时，系统应通过怎样的方式隐藏它。取值范围如下：
				 * <ul>
				 * <li>visibility    -    仅将此控件的设置为不可见，它仍将占用布局控件。</li>
				 * <li>display    -    将此控件从布局中抹去，且其他控件可以占用它空出的位置。</li>
				 * </ul>
				 * @type boolean
				 * @default "visibility"
				 * @attribute skipRefresh writeBeforeReady
				 */
				hideMode: {
					skipRefresh: true,
					writeBeforeReady: true,
					defaultValue: "visibility"
				},

				/**
				 * 指示控件所对应的HTML元素被真正的添加(相当于appendChild)到HTML的dom树中。
				 * @type boolean
				 * @attribute readOnly
				 */
				attached: {
					readOnly: true
				},

				/**
				 * 指示控件当前是否拥有控制焦点
				 * @type boolean
				 * @attribute readOnly
				 */
				focused: {
					readOnly: true
				},

				/**
				 * 用表示控件在处理控制焦点是的上下级关系。
				 * <p>
				 * 在通常情况下，控件的focusParent与parent是一致的，只有在个别情况下例外。
				 * 例如：我们创建了一个TextEditor控件使其作为Grid控件的单元格编辑器， 由于Grid控件并不是一个{@link dorado.widget.Container}的子类，因此TextEditor的parent不可能是Grid。
				 * 然后TextEditor与Grid又确实具有上下级的关系，尤其是在处理控制焦点时，此时系统会将TextEditor的focusParent属性设置为Grid。
				 * </p>
				 * @type dorado.widget.Control
				 * @attribute skipRefresh
				 */
				focusParent: {
					skipRefresh: true,
					getter: function() {
						return this._focusParent || this._parent;
					}
				},

				/**
				 * 提示信息。
				 * @type String
				 * @attribute skipRefresh
				 */
				tip: {
					skipRefresh: true
				},

				/**
				 * 控件使用的布局条件。
				 * <p>
				 * 此属性只会在控件被添加到布局管理器后才会产生实际效果。<br>
				 * 除了通过此方法为控件定义布局条件之外，也可以直接通过{@link dorado.widget.Container#addChild}方法的layoutConstraint参数。
				 * addChild方法会自动将传入的layoutConstaint参数的值（如果确实定义了该参数值的话）自动赋值给相应控件的layoutConstaint属性。
				 * </p>
				 * @type Object
				 * @attribute
				 * @see dorado.widget.Control#attribute:lc
				 * @see dorado.widget.Container#addChild
				 */
				layoutConstraint: {
					setter: function(layoutConstraint) {
						if (this._layoutConstraint != layoutConstraint || this._visible || this._hideMode != "display") {
							this._layoutConstraint = layoutConstraint;
							if (this._rendered && this._parent && this._parent._layout) {
								this._parent._layout.refreshControl(this);
							}
							if (this._layoutConstraint == dorado.widget.layout.Layout.NONE_LAYOUT_CONSTRAINT || layoutConstraint == dorado.widget.layout.Layout.NONE_LAYOUT_CONSTRAINT) {
								this.onActualVisibleChange();
							}
						}
					}
				},

				view: {
					skipRefresh: true,
					setter: function(view) {
						if (this._view == view) return;

						$invokeSuper.call(this, [view]);

						if (this._innerControls) {
							this._innerControls.each(function(control) {
								control.set("view", view);
							});
						}
					}
				}
			},

			EVENTS: /** @scope dorado.widget.Control.prototype */
			{

				/**
				 * 当组件对应的根DOM对象被创建时触发的事件。
				 * @param {Object} self 事件的发起者，即组件本身。
				 * @param {Object} arg 事件参数。
				 * @param {HTMLElement} arg.dom 组件对应的根DOM对象。
				 * @return {boolean} 是否要继续后续事件的触发操作，不提供返回值时系统将按照返回值为true进行处理。
				 * @event
				 */
				onCreateDom: {},

				/**
				 * 当组件将要刷新其对应的DOM对象之前触发的事件。
				 * @param {Object} self 事件的发起者，即组件本身。
				 * @param {Object} arg 事件参数。
				 * @param {HTMLElement} arg.dom 组件对应的根DOM对象。
				 * @param {boolean} #arg.processDefault=false 是否要继续系统默认的刷新操作。
				 * @return {boolean} 是否要继续后续事件的触发操作，不提供返回值时系统将按照返回值为true进行处理。
				 * @event
				 */
				beforeRefreshDom: {},

				/**
				 * 当组件刷新其对应的DOM对象时触发的事件。
				 * <p>
				 * 在实际的使用过程中，{@link dorado.widget.Control#event:beforeRefreshDom}可能是更加常用的事件。
				 * </P>
				 * @param {Object} self 事件的发起者，即组件本身。
				 * @param {Object} arg 事件参数。
				 * @param {HTMLElement} arg.dom 组件对应的根DOM对象。
				 * @return {boolean} 是否要继续后续事件的触发操作，不提供返回值时系统将按照返回值为true进行处理。
				 * @event
				 * @see dorado.widget.Control#event:beforeRefreshDom
				 */
				onRefreshDom: {},

				/**
				 * 当控件被点击时触发的事件。
				 * @param {Object} self 事件的发起者，即组件本身。
				 * @param {Object} arg 事件参数。
				 * @param {int} arg.button 表示用户按下的是哪个按钮，具体请参考DHTML的相关文档。
				 * @param {Event} arg.event DHTML中的事件event参数。
				 * @param {boolean} #arg.returnValue 表示是否要终止该鼠标事件的冒泡处理机制。
				 * 如果返回false相当于调用了系统event的preventDefault()和stopPropagation()方法。
				 * 不定义此参数表示交由系统自行判断。
				 * @return {boolean} 是否要继续后续事件的触发操作，不提供返回值时系统将按照返回值为true进行处理。
				 * @event
				 */
				onClick: {},

				/**
				 * 当控件被双击时触发的事件。
				 * @param {Object} self 事件的发起者，即组件本身。
				 * @param {Object} arg 事件参数。
				 * @param {int} arg.button 表示用户按下的是哪个按钮，具体请参考DHTML的相关文档。
				 * @param {Event} arg.event DHTML中的事件event参数。
				 * @param {boolean} #arg.returnValue 表示是否要终止该鼠标事件的冒泡处理机制。
				 * 如果返回false相当于调用了系统event的preventDefault()和stopPropagation()方法。
				 * 不定义此参数表示交由系统自行判断。
				 * @return {boolean} 是否要继续后续事件的触发操作，不提供返回值时系统将按照返回值为true进行处理。
				 * @event
				 */
				onDoubleClick: {},

				/**
				 * 当鼠标在控件中按下时触发的事件。
				 * @param {Object} self 事件的发起者，即组件本身。
				 * @param {Object} arg 事件参数。
				 * @param {int} arg.button 表示用户按下的是哪个按钮，具体请参考DHTML的相关文档。
				 * @param {Event} arg.event DHTML中的事件event参数。
				 * @param {boolean} #arg.returnValue 表示是否要终止该鼠标事件的冒泡处理机制。
				 * 如果返回false相当于调用了系统event的preventDefault()和stopPropagation()方法。
				 * 不定义此参数表示交由系统自行判断。
				 * @return {boolean} 是否要继续后续事件的触发操作，不提供返回值时系统将按照返回值为true进行处理。
				 * @event
				 */
				onMouseDown: {},

				/**
				 * 当鼠标在控件中抬起时触发的事件。
				 * @param {Object} self 事件的发起者，即组件本身。
				 * @param {Object} arg 事件参数。
				 * @param {int} arg.button 表示用户按下的是哪个按钮，具体请参考DHTML的相关文档。
				 * @param {Event} arg.event DHTML中的事件event参数。
				 * @param {boolean} #arg.returnValue 表示是否要终止该鼠标事件的冒泡处理机制。
				 * 如果返回false相当于调用了系统event的preventDefault()和stopPropagation()方法。
				 * 不定义此参数表示交由系统自行判断。
				 * @return {boolean} 是否要继续后续事件的触发操作，不提供返回值时系统将按照返回值为true进行处理。
				 * @event
				 */
				onMouseUp: {},

				/**
				 * 当控件中的系统上下文菜单将要显示时触发的事件。
				 * @param {Object} self 事件的发起者，即组件本身。
				 * @param {Object} arg 事件参数。
				 * @param {Event} arg.event DHTML中的事件event参数。
				 * @param {boolean} #arg.processDefault=false
				 * 是否要继续系统的默认操作，让系统上下文菜单显示出来。
				 * @return {boolean} 是否要继续后续事件的触发操作，不提供返回值时系统将按照返回值为true进行处理。
				 * @event
				 */
				onContextMenu: {},

				/**
				 * 当控件获得控制焦点时触发的事件。
				 * @param {Object} self 事件的发起者，即组件本身。
				 * @param {Object} arg 事件参数。
				 * @return {boolean} 是否要继续后续事件的触发操作，不提供返回值时系统将按照返回值为true进行处理。
				 * @event
				 */
				onFocus: {},

				/**
				 * 当控件失去控制焦点时触发的事件。
				 * @param {Object} self 事件的发起者，即组件本身。
				 * @param {Object} arg 事件参数。
				 * @return {boolean} 是否要继续后续事件的触发操作，不提供返回值时系统将按照返回值为true进行处理。
				 * @event
				 */
				onBlur: {},

				/**
				 * 当控件拥有焦点并且有按键被按下时触发的事件。
				 * @param {Object} self 事件的发起者，即控件本身。
				 * @param {Object} arg 事件参数。
				 * @param {int} arg.keyCode 按键对应的keyCode。
				 * @param {boolean} arg.shiftKey Shift键是否按下。
				 * @param {boolean} arg.ctrlKey Ctrl键是否按下。
				 * @param {boolean} arg.altKey Alt键是否按下。
				 * @param {Event} arg.event DHTML中的事件event参数。
				 * @param {Boolean} #arg.returnValue=undefined 用于通知系统如何进行下一步处理的返回值。<br>
				 * 有下列三种可能结果:
				 * <ul>
				 * <li>true - 表示允许将此键盘消息进一步通知给上层控件（指此控件的focusParent属性指向的控件）。</li>
				 * <li>false - 表示禁止将此键盘消息进一步通知给上层控件，同时终止浏览器对此键盘操作的默认响应处理。</li>
				 * <li>不定义返回值 - 表示禁止将此键盘消息进一步通知给上层控件。</li>
				 * </ul>
				 * @return {boolean} 是否要继续后续事件的触发操作，不提供返回值时系统将按照返回值为true进行处理。
				 * @event
				 */
				onKeyDown: {},

				/**
				 * 当控件拥有焦点并且有ASCII码的按键被按下时触发的事件。
				 * @param {Object} self 事件的发起者，即控件本身。
				 * @param {Object} arg 事件参数。
				 * @param {int} arg.keyCode 按键对应的keyCode。
				 * @param {boolean} arg.shiftKey Shift键是否按下。
				 * @param {boolean} arg.ctrlKey Ctrl键是否按下。
				 * @param {boolean} arg.altKey Alt键是否按下。
				 * @param {Event} arg.event DHTML中的事件event参数。
				 * @param {Boolean} #arg.returnValue=undefined 用于通知系统如何进行下一步处理的返回值。<br>
				 * 有下列三种可能结果:
				 * <ul>
				 * <li>true - 表示允许将此键盘消息进一步通知给上层控件（指此控件的focusParent属性指向的控件）。</li>
				 * <li>false - 表示禁止将此键盘消息进一步通知给上层控件，同时终止浏览器对此键盘操作的默认响应处理。</li>
				 * <li>不定义返回值 - 表示禁止将此键盘消息进一步通知给上层控件。</li>
				 * </ul>
				 * @return {boolean} 是否要继续后续事件的触发操作，不提供返回值时系统将按照返回值为true进行处理。
				 * @event
				 */
				onKeyPress: {},

				onTap: {},
				onDoubleTap: {},
				onTapHold: {},
				onSwipe: {}
			},

			constructor: function(config) {
				this._actualVisible = !dorado.Object.isInstanceOf(this, dorado.widget.FloatControl);

				dorado.widget.Component.prototype.constructor.call(this, config);

				if (dorado.Object.isInstanceOf(this, dorado.widget.FloatControl) && this._floating) {
					this._actualVisible = false;
				}

				if (this._renderTo || this._renderOn) {
					$setTimeout(this, function() {
						if (this._rendered) return;
						this.render();
					}, 0);
				}
			},

			onReady: function() {
				$invokeSuper.call(this);

				if (this._innerControls) {
					jQuery.each(this._innerControls, function(i, control) {
						if (!( control instanceof dorado.widget.Control) && !control._ready) {
							control.onReady();
						}
					});
				}
			},

			destroy: function() {
				if (this._destroyed) return;
				dorado.Toolkits.cancelDelayedAction(this, "$refreshDelayTimerId");

				if (this._innerControls) {
					var controls = this._innerControls.slice(0);
					for(var i = 0, len = controls.length; i < len; i++) {
						controls[i].destroy();
					}
					delete this._innerControls;
				}

				var isClosed = (window.closed || dorado.windowClosed);
				if (!isClosed) {
					if (this._focused) {
						dorado.widget.onControlGainedFocus(this.get("focusParent"));
					}
					if (this._parent) {
						if (this._isInnerControl) {
							this._parent.unregisterInnerControl(this);
						}
						else {
							this._parent.removeChild(this);
						}
					}
				}

				if (this._modernScroller) {
					this._modernScroller.destroy();
				}

				var dom = this._dom;
				if (dom) {
					delete this._dom;
					try {
						dom.doradoUniqueId = null;
					}
					catch(e) {
						// do nothing
					}

					if (dorado.windowClosed) {
						$fly(dom).unbind();
					}
					else {
						$fly(dom).remove();
					}
				}

				dorado.RenderableElement.prototype.destroy.call(this);
				$invokeSuper.call(this);
			},

			doSet: function(attr, value, skipUnknownAttribute, lockWritingTimes) {
				var def = this.ATTRIBUTES[attr];
				if (def && def.innerComponent != null && def.autoRegisterInnerControl !== false) {
					var originComponent = this.doGet(attr);
					if (originComponent) {
						if (originComponent instanceof Array) {
							for(var i = 0; i < originComponent.length; i++) {
								var c = originComponent[i];
								if (c instanceof dorado.widget.Control) {
									this.unregisterInnerControl(c);
								}
							}
						}
						else if (originComponent instanceof dorado.widget.Control) {
							this.unregisterInnerControl(originComponent);
						}
					}
				}

				$invokeSuper.call(this, [attr, value, skipUnknownAttribute, lockWritingTimes]);

				if (def) {
					if (def.innerComponent != null && def.autoRegisterInnerControl !== false) {
						var component = this.doGet(attr);
						if (component) {
							if (component instanceof Array) {
								for(var i = 0; i < component.length; i++) {
									var c = component[i];
									if (c instanceof dorado.widget.Control) {
										this.registerInnerControl(c);
									}
								}
							}
							else if (component.each || typeof component.each == "function") {
								var self = this;
								component.each(function(c) {
									if (c instanceof dorado.widget.Control) {
										self.registerInnerControl(c);
									}
								});
							}
							else if (component instanceof dorado.widget.Control) {
								this.registerInnerControl(component);
							}
						}
					}

					if (!this._rendered) return;
					if (!this._duringRefreshDom && this._ignoreRefresh < 1 && def && !def.skipRefresh) {
						this.refresh(true);
					}
				}
			},

			setActualVisible: function(actualVisible) {
				if (this._actualVisible != actualVisible) {
					this._actualVisible = actualVisible;
					this.onActualVisibleChange();
				}
			},

			isActualVisible: function() {
				var actualVisible = this._visible && this._actualVisible;
				if (!actualVisible) return false;

				if (this._floating && dorado.Object.isInstanceOf(this, dorado.widget.FloatControl)) {
					return true;
				}
				else {
					return this._parentActualVisible &&
						this._layoutConstraint != dorado.widget.layout.Layout.NONE_LAYOUT_CONSTRAINT;
				}
			},

			onActualVisibleChange: function() {

				function notifyChildren(control, parentActualVisible) {
					if (control._innerControls) {
						jQuery.each(control._innerControls, function(i, child) {
							if (child._parentActualVisible == parentActualVisible || !(child instanceof dorado.widget.Control)) return;
							child._parentActualVisible = parentActualVisible;
							child.onActualVisibleChange();
						});
					}
				}

				var actualVisible = this.isActualVisible();
				if (this._parentLayout) {
					if (this._hideMode == "display") {
						this._parentLayout.refreshControl(this);
						if (actualVisible && this._rendered && this._shouldRefreshOnVisible && !dorado.widget.Control.SKIP_REFRESH_ON_VISIBLE) {
							this.refresh();
						}
					}
					else {
						if (!actualVisible || this._rendered && this._shouldRefreshOnVisible && !dorado.widget.Control.SKIP_REFRESH_ON_VISIBLE) {
							this.refresh();
						}
					}
				}
				else {
					this.refresh();
				}
				notifyChildren(this, actualVisible);
			},

			refresh: function(delay) {
				if (this._duringRefreshDom || !this._rendered || !this._attached) return;

				if (!this.isActualVisible() && !this._forceRefresh
					&& !(this._currentVisible !== undefined && this._currentVisible != this._visible)) {
					this._shouldRefreshOnVisible = !!this._rendered;
					return;
				}
				this._shouldRefreshOnVisible = false;

				if (delay) {
					dorado.Toolkits.setDelayedAction(this, "$refreshDelayTimerId", function() {
						this._duringRefreshDom = true;
						try {
							dorado.Toolkits.cancelDelayedAction(this, "$refreshDelayTimerId");

							if (!this.isActualVisible() && !this._forceRefresh
								&& !(this._currentVisible !== undefined && this._currentVisible != this._visible)) {
								this._shouldRefreshOnVisible = true;
								return;
							}
							this._shouldRefreshOnVisible = false;

							var dom = this.getDom(), arg = {
								dom: dom,
								processDefault: true
							};
							if (this.getListenerCount("beforeRefreshDom")) {
								arg.processDefault = false;
								this.fireEvent("beforeRefreshDom", this, arg);
							}
							if (arg.processDefault) {
								this.refreshDom(dom);
								this.onResize();
								this.fireEvent("onRefreshDom", this, arg);
							}

							this.updateModernScroller();
						}
						finally {
							this._duringRefreshDom = false;
						}
					}, 50);
				}
				else {
					this._duringRefreshDom = true;
					try {
						dorado.Toolkits.cancelDelayedAction(this, "$refreshDelayTimerId");

						var dom = this.getDom(), arg = {
							dom: dom,
							processDefault: true
						};
						if (this.getListenerCount("beforeRefreshDom")) {
							arg.processDefault = false;
							this.fireEvent("beforeRefreshDom", this, arg);
						}
						if (arg.processDefault) {
							this.refreshDom(dom);
							this.onResize();
							this.fireEvent("onRefreshDom", this, arg);
						}

						this.updateModernScroller();
					}
					finally {
						this._duringRefreshDom = false;
					}
				}
			},

			_refreshDom: function(dom) {
				dom.doradoUniqueId = this._uniqueId;
				if (this._currentVisible !== undefined) {
					if (this._currentVisible != this._visible) {
						if (this._hideMode == "display") {
							if (this._visible) {
								dom.style.display = this._oldDisplay;
							}
							else {
								this._oldDisplay = dom.style.display;
								dom.style.display = "none";
							}
						}
						else {
							dom.style.visibility = (this._visible) ? '' : "hidden";
						}
					}
				}
				else {
					if (!this._visible) {
						if (this._hideMode == "display") {
							this._oldDisplay = dom.style.display;
							dom.style.display = "none";
						}
						else {
							dom.style.visibility = "hidden";
						}
					}
				}

				var tip = this.get("tip");
				if (tip) {
					this._currentTip = tip;
					dorado.TipManager.initTip(dom, {
						text: tip
					});
				}
				else if (this._currentTip) {
					dorado.TipManager.deleteTip(dom);
				}
			},

			/**
			 * 根据控件自身的属性设定来刷新DOM对象。
			 * <p>
			 * 此方法会在控件每一次被刷新时调用，因此那些设置DOM对象的颜色、字体、尺寸的代码适合放置在此方法中。
			 * </p>
			 * @param {HTMLElement} dom 控件对应的DOM对象。
			 */
			refreshDom: function(dom) {
				if (!this.selectable) $DomUtils.disableUserSelection(dom);

				try {
					this._refreshDom(dom);
				}
				catch(e) {
					// do nothing
				}

				var floatClassName = "d-floating";
				if (this._floatingClassName) floatClassName += (" " + this._floatingClassName);
				$fly(dom).toggleClass(floatClassName, !!this._floating);

				this.applyDraggable(dom);
				this.applyDroppable(dom);
				$invokeSuper.call(this, [dom]);

				this._currentVisible = !!this._visible;
			},

			updateModernScroller: function(delay) {
				if (!this._modernScroller) return;

				if (delay) {
					dorado.Toolkits.setDelayedAction(this, "$updateModernScrollerTimerId", function() {
						if (this._modernScroller) {
							this._modernScroller.update();
						}
					}, 50);
				}
				else {
					this._modernScroller.update();
				}
			},

			getRealWidth: function() {
				if (this._width == "none") return null;
				return (this._realWidth == null) ? this._width : this._realWidth;
			},

			getRealHeight: function() {
				if (this._height == "none") return null;
				return (this._realHeight == null) ? this._height : this._realHeight;
			},

			doResetDimension: function(force) {
				return dorado.RenderableElement.prototype.resetDimension.call(this, force);
			},

			resetDimension: function(forced) {
				if (this._skipResetDimension || !this.isActualVisible()) return;

				var changed = this.doResetDimension(forced) || !this._fixedWidth || !this._fixedHeight;
				if (!this._duringRefreshDom && (changed || !this._currentVisible)) {
					this._skipResetDimension = true;
					this.onResize();
					this._skipResetDimension = false;
				}
				return changed;
			},

			/**
			 * 向控件所在的布局管理器通知本控件的尺寸已经发生了变化。
			 * @param {boolean} delay
			 * @param {boolean} force 是否强制通知父容器
			 * @protected
			 */
			notifySizeChange: function(delay, force) {
				if (this._parentLayout) {
					this._parentLayout.onControlSizeChange(this, delay, force);
				}
			},

			/**
			 * 返回控件对应的DOM对象。
			 * @return {HTMLElement} 控件对应的DOM对象。
			 */
			getDom: function() {
				if (this._destroyed) return null;
				if (!this._dom) {
					var dom = this._dom = this.createDom(), $dom = $fly(this._dom);

					if (!dom.id) {
						dom.id = "d_" + (this._id || this._uniqueId);
					}

					var className = ((this._inherentClassName) ? this._inherentClassName : this.ATTRIBUTES.className.defaultValue) || "";
					if (this._className && this._className != className) className += (" " + this._className);
					if (this._exClassName) className += (" " + this._exClassName);
					if (this._ui) {
						var uis = this._ui.split(',');
						for(var i = 0; i < uis.length; i++) {
							className += (" " + this._className + "-" + uis[i]);
						}
					}
					if (className) $dom.addClass(className);

					this.applyStyle(dom);

					if (this.focusable) dom.tabIndex = 1;

					var self = this;
					$dom.mousedown(function(evt) {
						if (!self._eventBinded) {
							self._eventBinded = true;

							jQuery(this).click(function(evt) {
								if (!self.processDefaultMouseListener()) return;
								var defaultReturnValue;
								if (self.onClick) {
									defaultReturnValue = self.onClick(evt);
								}
								var arg = {
									button: evt.button,
									event: evt,
									returnValue: defaultReturnValue
								}
								self.fireEvent("onClick", self, arg);
								return arg.returnValue;
							}).bind("dblclick",function(evt) {
									if (!self.processDefaultMouseListener()) return;
									var defaultReturnValue;
									if (self.onDoubleClick) {
										defaultReturnValue = self.onDoubleClick(evt);
									}
									var arg = {
										button: evt.button,
										event: evt,
										returnValue: defaultReturnValue
									}
									self.fireEvent("onDoubleClick", self, arg);
									return arg.returnValue;
								}).mouseup(function(evt) {
									if (!self.processDefaultMouseListener()) return;
									var defaultReturnValue;
									if (self.onMouseUp) {
										defaultReturnValue = self.onMouseUp(evt);
									}
									var arg = {
										button: evt.button,
										event: evt,
										returnValue: defaultReturnValue
									}
									self.fireEvent("onMouseUp", self, arg);
									return arg.returnValue;
								}).bind("contextmenu", function(evt) {
									evt = jQuery.event.fix(evt || window.event);
									var eventArg = {
										event: evt,
										processDefault: true
									};
									if (self.getListenerCount("onContextMenu")) {
										eventArg.processDefault = false;
										self.fireEvent("onContextMenu", self, eventArg);
									}
									if (!eventArg.processDefault) {
										evt.preventDefault();
										evt.returnValue = false;
										return false;
									}
								});
						}

						if (evt.srcElement != lastMouseDownTarget || (new Date() - lastMouseDownTimestamp) > 500) {
							if (dorado.Browser.msie) {
								var nodeName = evt.srcElement && evt.srcElement.nodeName.toLowerCase();
								if (nodeName != "input" && nodeName != "textarea" && nodeName != "select") {
									dorado.widget.setFocusedControl(self);
								}
							}
							else {
								dorado.widget.setFocusedControl(self);
							}
							lastMouseDownTarget = evt.srcElement;
							lastMouseDownTimestamp = new Date();
						}
						if (!self.processDefaultMouseListener()) return;
						var defaultReturnValue;
						if (self.onMouseDown) {
							defaultReturnValue = self.onMouseDown(evt);
						}
						var arg = {
							button: evt.button,
							event: evt,
							returnValue: defaultReturnValue
						}
						self.fireEvent("onMouseDown", self, arg);
						return arg.returnValue;
					});

					if (this.getListenerCount("onCreateDom")) {
						this.fireEvent("onCreateDom", this, {
							dom: dom
						});
					}
				}
				return this._dom;
			},

			processDefaultMouseListener: function() {
				return !this._disabled;
			},

			doRenderToOrReplace: function(replace, element, nextChildElement) {
				var dom = this.getDom();
				if (!dom) return;

				if (replace) {
					if (!element.parentNode) return;
					element.parentNode.replaceChild(dom, element);
				}
				else {
					if (!element) element = document.body;
					if (dom.parentNode != element || (nextChildElement && dom.nextSibling != nextChildElement)) {
						if (nextChildElement) {
							element.insertBefore(dom, nextChildElement);
						}
						else {
							element.appendChild(dom);
						}
					}
				}

				if (this._attached) this.refreshDom(dom);
				this._rendered = true;

				var attached = false, renderTarget = this._renderTo || this._renderOn;
				if (!renderTarget && this._parent && this._parent._rendered && this._parent != dorado.widget.View.TOP) {
					attached = this._parent._attached;
				}
				else {
					var body = dom.ownerDocument.body;
					var node = dom.parentNode;
					while(node) {
						if (node == body) {
							attached = true;
							break;
						}
						node = node.parentNode;
					}
				}

				if (attached) {
					this.onAttachToDocument();
				}
				else if (this._attached) {
					this.onDetachFromDocument();
				}
			},

			/**
			 * 将本对象渲染到指定的DOM容器中。
			 * @param {HTMLElement} [containerElement] 作为容器的DOM元素。
			 * <li>如果此参数为空，将根据renderTo或renderOn属性来决定渲染位置。</li>
			 * <li>如果renderTo不为空，将以renderTo指向的DOM对象作为容器。</li>
			 * <li>如果renderOn不为空，将替换renderOn指向的DOM对象。</li>
			 * <li>如果renderTo和renderOn均为空，将以document.body作为容器。</li>
			 * @param {HTMLElement} [nextChildElement] 指定新的DOM元素要在那个子元素之前插入，即通过此参数可以指定新的DOM元素的插入位置。
			 */
			render: function(containerElement, nextChildElement) {
				if (containerElement) {
					this.doRenderToOrReplace(false, containerElement, nextChildElement);
				}
				else if (this._renderTo) {
					var container = this._renderTo;
					if (typeof container == "string") container = jQuery(container)[0];
					this.doRenderToOrReplace(false, container);
				}
				else if (this._renderOn) {
					var placeHolder = this._renderOn;
					if (typeof placeHolder == "string") placeHolder = jQuery(placeHolder)[0];
					if (placeHolder) {
						this.doRenderToOrReplace(true, placeHolder);
					}
				}
				else {
					this.doRenderToOrReplace(false);
				}
			},

			/**
			 * 本对象并替换指定的DOM对象。
			 * @param {HTMLElement} [containerElement] 要替换的DOM元素。如果此参数为空，将以替换renderOn属性所指向的对象。
			 * 如果renderTo属性也是空，将以document.body作为容器。
			 */
			replace: function(elmenent) {
				this.doRenderToOrReplace(true, elmenent);
			},

			unrender: function() {
				if (this._focused) {
					var focusParent = this.get("focusParent");
					// if (focusParent) focusParent.setFocus();
					// else dorado.widget.setFocusedControl(null);
					dorado.widget.setFocusedControl(focusParent);
				}
				$invokeSuper.call(this);
			},

			/**
			 * 当控件所对应的HTML元素被真正的添加(相当于appendChild)到HTML的dom树中时激活的方法。
			 * <p>
			 * 当控件的createDom()方法执行时，控件所对应的HTML元素处于游离状态。此时我们调用HTML元素的offsetWidth、currentStyle属性都是无效的。
			 * 只有当该HTML元素最终被添加到HTML的dom树后，这些属性才会生效。
			 * </p>
			 * <p>
			 * 当HTML元素通过appendChild方法被添加为某个父HTML元素中后，并不一定意味着游离状态的结束。
			 * 如果父HTML元素是游离状态的，那么其中的所有各层子元素都是游离状态的。
			 * 同理，当父HTML元素最终被添加到HTML的dom树后，其中的所有各层子元素都将结束游离状态。
			 * </p>
			 * <p>
			 * 如无特殊需要，一般请不要复写此方法，而应复写doOnAttachToDocument。
			 * </p>
			 * @protected
			 * @see dorado.widget.Control#doOnDetachFromDocument
			 */
			onAttachToDocument: function() {
				if (this._rendered && !this._attached) {
					var view = this._view;
					if (view && view != $topView && !view._ready && !view._rendering) {
						view.onReady();
					}

					var dom = this.getDom();
					this._attached = true;
					this._ignoreRefresh--;

					this._duringRefreshDom = true;
					this._skipResize = true;
					var arg = {
						dom: dom,
						processDefault: true
					};
					if (this.getListenerCount("beforeRefreshDom")) {
						arg.processDefault = false;
						this.fireEvent("beforeRefreshDom", this, arg);
					}
					if (arg.processDefault) {
						this.refreshDom(dom);
						this.fireEvent("onRefreshDom", this, arg);
					}
					this._duringRefreshDom = false;
					this._skipResize = false;

					if (this.doOnAttachToDocument) this.doOnAttachToDocument();

					if (this._innerControls) {
						jQuery.each(this._innerControls, function(i, control) {
							control.onAttachToDocument();
						});
					}

					// TODO: 导致contrainer中的layout重新布局，交价太高
					this.onResize();

					this.updateModernScroller();

					if (!this._ready) {
						this.onReady();
					}
				}
			},

			/**
			 * 当控件所对应的HTML元素被从(相当于removeChild)到HTML的dom树中分离时激活的方法。
			 * <p>
			 * 如无特殊需要，一般请不要复写此方法，而应复写doOnDetachFromDocument。
			 * </p>
			 * @protected
			 * @see dorado.widget.Control#onAttachToDocument
			 * @see dorado.widget.Control#doOnDetachFromDocument
			 */
			onDetachFromDocument: function() {
				if (this._rendered && this._attached) {
					this._attached = false;
					this._ignoreRefresh++;
					if (this.doOnDetachFromDocument) this.doOnDetachFromDocument();

					if (this._innerControls) {
						jQuery.each(this._innerControls, function(i, control) {
							control.onDetachFromDocument();
						});
					}
				}
			},

			/**
			 * 将一个给定控件注册为本控件的内部控件。
			 * <p>
			 * 内部控件与{@link dorado.widget.Container}中的子控件是不同的概念。
			 * 内部控件是父控件自身的组成部分，例如RadioGroup控件本身就是由其中的一到多个RadioButton构成的。
			 * </p>
			 * <p>
			 * registerInnerControl方法一般也不应该被外部程序调用，而是应该有控件自身的代码在createDom或refreshDom等方法中调用。
			 * 利用registerInnerControl方法注册内部控件的目的是为了正确向这些控件传播系统消息，管理这些控件的状态。<br>
			 * 完成注册后的内部控件的parent和focusParent属性都将指向本控件。
			 * </p>
			 * @param {dorado.widget.Control} control 内部控件。
			 * @protected
			 */
			registerInnerControl: function(control) {
				if (!this._innerControls) this._innerControls = [];
				this._innerControls.push(control);
				if (this._attached) control.onAttachToDocument();
				control._isInnerControl = true;

				if (control._parent == window.$topView) {
					window.$topView.removeChild(control);
				}
				control._parent = control._focusParent = this;
				control.set("view", (this instanceof dorado.widget.View) ? this : this.get("view"));

				if (control.parentChanged) control.parentChanged();
			},

			/**
			 * 注销一个给定的内部控件。
			 * @param {dorado.widget.Control} control 内部控件。
			 * @protected
			 */
			unregisterInnerControl: function(control) {
				if (!this._innerControls) return;
				control.onDetachFromDocument();
				this._innerControls.remove(control);
				control._parent = control._focusParent = null;
				control.set("view", null);
				delete control._isInnerControl;

				if (control.parentChanged) control.parentChanged();
			},

			parentChanged: function() {
				if (!this._ready || this._floating && dorado.Object.isInstanceOf(this, dorado.widget.FloatControl)) return;

				var parent = this._parent;
				var parentActualVisible = (parent) ? parent.isActualVisible() : true;
				if (parentActualVisible != this._parentActualVisible) this.onActualVisibleChange();
			},

			/**
			 * @name dorado.widget.Control#onResize
			 * @function
			 * @protected
			 * @description 当控件自身的尺寸发生改变时激活的方法。
			 * <p>
			 * 例如：对于容器类控件而言，当其自身的尺寸发生改变时，我们往往需要对容器内部的布局和子控件进行相应的处理，
			 * 以使这些对象能够正确的使用尺寸的改变。此时，我们可以将这些处理逻辑放置在onResize方法中。
			 * </p>
			 */
			onResize: function() {
				if (this._skipResize) return;

				if (!this.isActualVisible()) {
					this._shouldRefreshOnVisible = true;
					return;
				}

				if (this.doOnResize) this.doOnResize.apply(this, arguments);
			},

			/**
			 * 根据给定的类型需要最靠近此控件的父控件。
			 * @param {Prototype} type 要需要的父控件的类型。
			 * @return {dorado.widget.Container} 找到的父控件。
			 *
			 * @example
			 * // 寻找某按钮所隶属的Dialog控件。
			 * var dialog = button1.findParent(dorado.widget.Dialog);
			 */
			findParent: function(type) {
				var parent = this._parent;
				while(parent) {
					if (dorado.Object.isInstanceOf(parent, type)) {
						return parent;
					}
					parent = parent._parent;
				}
				return null;
			},

			/**
			 * 返回可聚焦的子控件的集合。
			 * @return {[dorado.widget.Control]} 可聚焦的子控件的集合。
			 */
			getFocusableSubControls: dorado._NULL_FUNCTION,

			/**
			 * 返回控件当前是否可以接收控制焦点成为当前控件。
			 * @param {boolean} [deep] 是否要分析控件各层父控件已确定该控件自身当前是否可以获得焦点。默认为false。
			 * 例如：当某个Panel对象被设置为不可用时，那么该Panel中所包含所有控件都将无法接受控制焦点。
			 * @return {boolean} 是否可以接收控制焦点。
			 */
			isFocusable: function(deep) {
				if (!this.focusable || !this._rendered || !this.isActualVisible() || !this.getDom() || this._disabled) {
					return false;
				}
				var dom = this.getDom();
				if (dom.disabled || dom.offsetWidth <= 0) {
					return false;
				}

				if (dorado.ModalManager._controlStack.length > 0) {
					if (isFloating = dorado.Object.isInstanceOf(this, dorado.widget.FloatControl) && this._floating) {
						if (dom.style.zIndex < dorado.ModalManager.getMask().style.zIndex) {
							return false;
						}
					}
					else if (!this.findParent(dorado.widget.FloatControl)) {
						return false;
					}
				}

				if (deep) {
					var child = this, parent = child._parent;
					while(parent && parent != $topView) {
						if (!parent._rendered) {
							break;
						}
						if (!parent.isFocusable()) {
							var focusableSubControls = parent.getFocusableSubControls();
							return (focusableSubControls) ? (focusableSubControls.indexOf(child) >= 0) : false;
						}
						if (dorado.Object.isInstanceOf(parent, dorado.widget.FloatControl) && parent._floating) {
							break;
						}
						child = parent;
						parent = child._parent;
					}
				}
				return true;
			},

			/**
			 * 使控件获得控制焦点。
			 */
			setFocus: function() {
				var control = this;
				dorado._LAST_FOCUS_CONTROL = control;
				dorado.Toolkits.setDelayedAction(window, "$setFocusTimerId", function() {
					if (dorado._LAST_FOCUS_CONTROL === control && dorado.widget.focusedControl.peek() !== self) {
						try {
							control.doSetFocus();
							dorado.widget.onControlGainedFocus(control);
						}
						catch(e) {
							// do nothing
						}
					}
					dorado._LAST_FOCUS_CONTROL = null;
				}, 10);
			},

			doSetFocus: function() {
				var dom = this._dom;
				if (dom) {
					dom.focus();
				}
			},

			/**
			 * 当控件获得控制焦点时被激活的方法。
			 * @protected
			 */
			onFocus: function() {
				this._focused = true;
				if (this.doOnFocus) this.doOnFocus();
				if (this._className) $fly(this.getDom()).addClass("d-focused " + this._className + "-focused");
				this.fireEvent("onFocus", this);
			},

			/**
			 * 当控件失去控制焦点时被激活的方法。
			 * @protected
			 */
			onBlur: function() {
				this._focused = false;
				if (this.doOnBlur) this.doOnBlur();
				$fly(this.getDom()).removeClass("d-focused " + this._className + "-focused");
				this.fireEvent("onBlur", this);
			},

			/**
			 * 当控件拥有控制焦点，并且用户按下任何键盘键（包括系统按钮，如箭头键和功能键）时被激活的方法。
			 * @param {Event} evt DHTML事件中的Event对象。
			 * @return {boolean} 用于通知系统如何进行下一步处理的返回值。<br>
			 * 有下列三种可能结果:
			 * <ul>
			 * <li>true - 表示允许将此事件进一步通知给上层控件（指此控件的focusParent属性指向的控件）。</li>
			 * <li>false - 表示禁止将此事件进一步通知给上层控件，同时终止浏览器对此键盘操作的默认响应处理。</li>
			 * <li>不定义返回值 - 表示禁止将此事件进一步通知给上层控件，但不中断浏览器对此键盘操作的默认响应处理。</li>
			 * </ul>
			 * @protected
			 */
			onKeyDown: function(evt) {
				var b = true;
				if (this.getListenerCount("onKeyDown")) {
					var arg = {
						keyCode: evt.keyCode,
						shiftKey: evt.shiftKey,
						ctrlKey: evt.ctrlKey,
						altlKey: evt.altlKey,
						event: evt
					};
					this.fireEvent("onKeyDown", this, arg);
					b = arg.returnValue;
				}
				if (!b) return b;

				var b = this.doOnKeyDown ? this.doOnKeyDown(evt) : true;
				if (!b) return b;

				var p = this.get("parent");
				if (p && !dorado.widget.disableKeyBubble) b = p.onKeyDown(evt);
				return b;
			},

			/**
			 * 当控件拥有控制焦点，并且用户按下并放开任何字母数字键时被激活的方法。
			 * @param {Event} evt DHTML事件中的Event对象。
			 * @return {boolean} 用于通知系统如何进行下一步处理的返回值。<br>
			 * 有下列三种可能结果:
			 * <ul>
			 * <li>true - 表示允许将此事件进一步通知给上层控件（指此控件的focusParent属性指向的控件）。</li>
			 * <li>false - 表示禁止将此事件进一步通知给上层控件，同时终止浏览器对此键盘操作的默认响应处理。</li>
			 * <li>不定义返回值 - 表示禁止将此事件进一步通知给上层控件，但不中断浏览器对此键盘操作的默认响应处理。</li>
			 * </ul>
			 * @protected
			 */
			onKeyPress: function(evt) {
				var b = true;
				if (this.getListenerCount("onKeyPress")) {
					var arg = {
						keyCode: evt.keyCode,
						shiftKey: evt.shiftKey,
						ctrlKey: evt.ctrlKey,
						altlKey: evt.altlKey,
						event: evt
					};
					this.fireEvent("onKeyPress", this, arg);
					b = arg.returnValue;
				}
				if (!b) return b;

				var b = this.doOnKeyPress ? this.doOnKeyPress(evt) : true;
				if (!b) return b;

				var p = this.get("parent");
				if (p && !dorado.widget.disableKeyBubble) b = p.onKeyPress(evt);
				return b;
			},

			initDraggingInfo: function(draggingInfo, evt) {
				$invokeSuper.call(this, arguments);
				draggingInfo.set({
					object: this,
					sourceControl: this
				});
			},

			onDraggingSourceOver: function(draggingInfo, evt) {
				draggingInfo.set({
					targetObject: this,
					targetControl: this
				});
				return $invokeSuper.call(this, arguments);
			},

			onDraggingSourceOut: function(draggingInfo, evt) {
				var retval = $invokeSuper.call(this, arguments);
				draggingInfo.set({
					targetObject: null,
					targetControl: null
				});
				return retval;
			},

			/**
			 * 将此控件滚动到可见区域内。
			 * 此方法可能导致该控件的每一级父控件发生滚动（如果有需要的话），以便于尽可能的是该控件可见。
			 */
			scrollIntoView: function() {

				function doScrollIntoView(container, dom) {
					if (container instanceof dorado.widget.Container) {
						var contentContainer = container.getContentContainer();
						if (contentContainer && $DomUtils.isOwnerOf(dom, contentContainer)) {
							container._modernScroller && container._modernScroller.scrollToElement(dom);
						}
					}

					var parent = container._parent;
					if (parent) doScrollIntoView(parent, dom);
				}

				if (!this.isActualVisible() || !this._rendered) return;

				var container = this._parent;
				if (container) doScrollIntoView(container, this._dom);
			}
		});

	dorado.widget.disableKeyBubble = false;
	dorado.widget.focusedControl = [];

	dorado.widget.onControlGainedFocus = function(control) {
		if (dorado.widget.focusedControl.peek() === control) return;

		var ov = dorado.widget.focusedControl;
		var nv = [];
		if (control) {
			var c = control;
			while(c) {
				nv.push(c);
				var focusParent = c.get("focusParent");
				if (!focusParent) break;
				c = focusParent;
			}
			nv = nv.reverse();
		}

		var i = ov.length - 1;
		for(; i >= 0; i--) {
			var o = ov[i];
			if (o == nv[i]) break;
			if (o.onBlur) o.onBlur();
		}

		dorado.widget.focusedControl = nv;
		i++;
		for(; i < nv.length; i++) {
			if (nv[i].onFocus) nv[i].onFocus();
		}
	};

	dorado.widget.setFocusedControl = function(control, ignorePhyscialFocus, skipGlobalBoardcast) {
		if (dorado.widget.focusedControl.peek() === control) return;
		if (!skipGlobalBoardcast) {
			var topDomainWindow = window;
			do {
				try {
					var parent = topDomainWindow.parent;
					if (parent == null || parent == topDomainWindow) break; // IE8下使用===判断会失败
					if (parent.frames.length >= 0) {
						topDomainWindow = parent;
					}
				}
				catch(e) {
					// do nothing
					break;
				}
			} while(topDomainWindow);

			function setFrameBlur(win) {
				try {
					if (win !== window && win.dorado.widget.Control) {
						win.dorado.widget.setFocusedControl(null, true, true);
					}
				}
				catch(e) {
					// do nothing
				}
				for(var i = 0; i < win.frames.length; i++) {
					setFrameBlur(win.frames[i]);
				}
			}

			setFrameBlur(topDomainWindow);
		}

		if (dorado.Browser.msie && document.activeElement) {
			var activeControl = dorado.widget.Control.findParentControl(document.activeElement);
			if (activeControl && !(activeControl instanceof dorado.widget.View)) {
				var nodeName = document.activeElement.nodeName.toLowerCase();
				if (nodeName == "input" || nodeName == "textarea" || nodeName == "select") return;
			}
		}
		while(control && !control.isFocusable()) {
			control = control.get("focusParent");
		}
		if (control) {
			if (!ignorePhyscialFocus) control.setFocus();
		}
		else {
			if (document.body) {
				setTimeout(function() {
					if (dorado._LAST_FOCUS_CONTROL === null) {
						if (!ignorePhyscialFocus) document.body.focus();
						dorado.widget.onControlGainedFocus(null);
					}
				}, 0);
			}
		}
	};

	dorado.widget.getMainFocusedControl = function() {
		var v = dorado.widget.focusedControl;
		for(var i = v.length - 1; i >= 0; i--) {
			if (!v[i]._focusParent) return v[i];
		}
		return v[0];
	};

	dorado.widget.getFocusedControl = function() {
		var v = dorado.widget.focusedControl;
		return v.peek();
	};

	dorado.widget.findFocusableControlInElement = function(element) {

		function findInChildren(element) {
			var el = element.firstChild, control = null;
			while(el) {
				control = findInChildren(el);
				if (control) break;
				if (el.doradoUniqueId) {
					var c = dorado.widget.ViewElement.ALL[el.doradoUniqueId];
					if (c && c.isFocusable()) {
						control = c;
						break;
					}
				}
				el = el.nextSibling;
			}
			return control;
		}

		return findInChildren(element);
	};

	function findFocusableControl(control, options) {
		var focusableControls, subControls = control.getFocusableSubControls();
		if (control.isFocusable()) {
			focusableControls = [control];
		}
		if (subControls && subControls.length) {
			if (focusableControls) {
				focusableControls = subControls.concat(focusableControls);
			}
			else {
				focusableControls = subControls;
			}
		}

		var focusableControl = null;
		if (focusableControls) {
			var reverse = false, from = null;
			if (options) {
				reverse = options.reverse;
				from = options.from;
			}

			if (reverse) focusableControls.reverse();
			var start = 0;
			if (from) start = focusableControls.indexOf(from) + 1;

			for(var i = start; i < focusableControls.length; i++) {
				var c = focusableControls[i];
				if (c && c instanceof dorado.widget.Control) {
					if (c != control && dorado.Object.isInstanceOf(c, dorado.widget.FloatControl) && c._floating) {
						continue;
					}

					if (c == control) {
						focusableControl = c;
					}
					else {
						focusableControl = findFocusableControl(c, {
							reverse: reverse
						});
					}
					if (focusableControl) break;
				}
			}
		}
		return focusableControl;
	};

	function findNext(from) {
		var control = null, parent = from._focusParent || from._parent;
		if (parent) {
			control = findFocusableControl(parent, {
				from: from
			});
		}
		return control;
	};

	function findPrevious(from) {
		var control = null, parent = from._focusParent || from._parent;
		if (parent) {
			control = findFocusableControl(parent, {
				from: from,
				reverse: true
			});
		}
		return control;
	};

	dorado.widget.findNextFocusableControl = function(from) {
		var from = from || dorado.widget.getFocusedControl();
		while(from) {
			var control = findNext(from);
			if (control) control = findFocusableControl(control);
			if (control) return control;
			from = from._focusParent || from._parent;
		}

		var floatControls = dorado.widget.FloatControl.VISIBLE_FLOAT_CONTROLS;
		for(var i = 0; i < floatControls.length; i++) {
			from = floatControls[i];
			var control = findFocusableControl(from);
			if (control) return control;
		}

		return findFocusableControl($topView);
	};

	dorado.widget.findPreviousFocusableControl = function(control) {
		var from = from || dorado.widget.getFocusedControl(), control;

		control = findFocusableControl(from, {
			from: from,
			reverse: true
		});
		if (control) return control;

		while(from) {
			control = findPrevious(from);
			if (control) return control;
			from = from._focusParent || from._parent;
		}

		var floatControls = dorado.widget.FloatControl.VISIBLE_FLOAT_CONTROLS;
		for(var i = floatControls.length - 1; i >= 0; i--) {
			from = floatControls[i];
			control = findFocusableControl(from, {
				reverse: true
			});
			if (control) return control;
		}

		return findFocusableControl($topView, {
			reverse: true
		});
	};

	/**
	 * 根据给定的DOM对象查找其所属的Dorado控件。
	 * <p>
	 * 注意：此查找动作的范围是跨越浏览器的框架的，亦即可以通过此方法查找父页面（父框架）中的Dorado控件。
	 * </p>
	 * @param {HTMLElement} element 作为查找起点的DOM对象。
	 * @param {Prototype|String} [type] 要查找的目标控件的类型。可以是具体的Prototype或类名。
	 * 如果不指定参数则表示包含此DOM对象且距离此此DOM对象最近的Dorado控件。
	 * @return {dorado.widget.Control} Dorado控件。
	 *
	 * @example
	 * // 查找某Element所属的控件。
	 * var control = dorado.widget.Control.findParentControl(div);
	 *
	 * @example
	 * // 查找某Element元素所属的Dialog控件。
	 * var dialog = dorado.widget.Control.findParentControl(div, dorado.widget.Dialog);
	 */
	dorado.widget.Control.findParentControl = function(element, type) {

		function find(win, dom, className) {
			var control = null;
			do {
				var control;
				if (dom.doradoUniqueId) {
					control = win.dorado.widget.ViewElement.ALL[dom.doradoUniqueId];
				}
				if (control) {
					if (className) {
						if (control.constructor.className === className) {
							break;
						}
					}
					else {
						break;
					}
				}
				dom = dom.parentNode;
			} while(dom != null);

			if (!control && win.parent) {
				var parentFrames;
				try {
					parentFrames = win.parent.jQuery("iframe,frame");
				}
				catch(e) {
					// do nothing;
				}

				if (parentFrames) {
					var frame;
					parentFrames.each(function() {
						if (this.contentWindow == win) {		// IE8下使用===判断会失败
							frame = this;
							return false;
						}
					});
					if (frame) {
						control = find(win.parent, frame, className);
					}
				}
			}
			return control;
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

	/**
	 * @Deprecated
	 * @Function
	 */
	dorado.widget.findParentControl = dorado.widget.Control.findParentControl;

})();

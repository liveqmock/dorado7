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
dorado._queueObject = {};

dorado.queue = function(namespace, fn) {
	if (!namespace) return;
	var queue = dorado._queueObject[namespace];
	if (!queue) {
		queue = dorado._queueObject[namespace] = [];
	}
	queue.push(fn);
	if (!queue.processing) {
		dorado.dequeue(namespace);
	}
};

dorado.dequeue = function(namespace) {
	if (!namespace) return true;
	var queue = dorado._queueObject[namespace];
	if (queue) {
		if (queue.length > 0) {
			queue.processing = true;
			var fn = queue.shift();
			fn.call(null, []);
		} else {
			queue.processing = false;
		}
	}
};

(function() {
	var SHOWHIDE_SUFFIX = "_SHOWHIDE";

	//在Touch项目中使用了新的方式来防止幽灵点击，所以此处needUseModal强制设置为false，当Touch的新方式证明稳定以后会移除相关代码。
	var queue = [], needUseModal = false/**dorado.Browser.isTouch && (dorado.Browser.iOS || dorado.Browser.android)*/, modalKey = "DORADO_TOUCH_MODAL";
	jQuery(function() {
		document.onclick = function() {
			if (queue.length > 0) {
				queue.forEach(function(fn) {
					setTimeout(function() {
						fn && fn();
					}, 400);
				});
				queue.splice(0, queue.length);
			}
		};
	});

	dorado.doOnBodyClick = function(fn) {
		queue.push(fn);
	};

	var layerModalPool = new dorado.util.ObjectPool({
		makeObject: function() {
			var dom = document.createElement("div");
			$fly(dom).css({
				position: "absolute",
				left: 0,
				top: 0,
				width: "100%",
				height: "100%",
				opacity: 0.5,
				background: "transparent",
				zIndex: 1000,
				display: "none"
			}).click(function() {
				layerModalPool.returnObject(this);
			});

			document.body.appendChild(dom);

			return dom;
		},
		passivateObject: function(dom) {
			var control = jQuery.data(dom, modalKey);
			if (control) {
				control._modalDom = null;
			}
			$fly(dom).css("display", "none");
		}
	});

	/**
	 * @class 浮动控件的接口。
	 * <p>
	 * 浮动控件是一种比较特殊的可视化控件。例如：菜单、下拉框、对话框等控件。 初始情况下这些控件是不可见的，直到其render()方法被调用。
	 * 一般而言，浮动控件在渲染时不受布局管理器的约束。除非我们显式的为其指定布局条件。
	 * </p>
	 * @abstract
	 */
	dorado.widget.FloatControl = $class(/** @scope dorado.widget.FloatControl.prototype */{
		$className: "dorado.widget.FloatControl",
		
		ATTRIBUTES: /** @scope dorado.widget.FloatControl.prototype */ {
		
			/**
			 * 是否浮动，默认为true。
			 * @attribute writeBeforeReady
			 * @type boolean
			 * @default true
			 */
			floating: {
				defaultValue: true,
				writeBeforeReady: true,
				setter: function(floating) {
					if (this._floating == floating) return;
					
					var attributeWatcher = this.getAttributeWatcher();
					if (attributeWatcher.getWritingTimes("visible") == 0) {
						this._visible = !floating;
					}
					this._actualVisible = !floating;
					this._floating = floating;
					this.onActualVisibleChange();
				}
			},
			
			/**
			 * 如果浮动，则会为组件的dom添加上该className。
			 * @attribute writeBeforeReady
			 * @type String
			 */
			floatingClassName: {
				writeBeforeReady: true
			},
			
			visible: {
				defaultValue: false,
				setter: function(visible) {
					if (visible == null) visible = !this._floating;
					$invokeSuper.call(this, [visible]);
				}
			},
			
			/**
			 * 当组件显示或者隐藏的时候要使用的动画类型。
			 * <p>
			 * 一般情况下组件的显示或者隐藏是同一类型的，则无需另外设置showAnimateType或者hideAnimateType。反之，则设置。
			 * 需要说明的是，在显示的时候，showAnimateType的优先级会高于animateType，在隐藏的时候，hideAnimateType的优先级会高于animateType。
			 * </p>
			 * <p>
			 * 目前可选值：zoom、slide、safeSlide、fade、none。
			 * 对几个动画进行一个简单的说明。
			 * <ol>
			 *  <li>none：不使用动画，直接显示或者隐藏。</li>
			 *  <li>zoom：使用一个灰色的html element的放大或者缩小来展示组件的显示或者隐藏。目前被Dialog使用。</li>
			 *  <li>slide：通过四个方向(从上到下，从下到上，从左到右，从右到左)四个方向展示组件的显示与隐藏，目前被Menu的showAnimateType使用。</li>
			 *  <li>safeSlide：在非IE浏览器下，如果组件内部包含IFrame组件时，使用slide类型的动画，会导致IFrame重新加载，在这种情况下，应该使用safeSlide类型的动画替换之。
			 *  另外，如果想保留组件中某些组件的滚动条，也需要使用safeSlide替换slide类型的动画。</li>
			 *  <li>fade：通过改变组件的html element的透明度来展示组件的显示或者隐藏，目前被Tip使用。</li>
			 * </ol>
			 * </p>
			 * @attribute skipAutoRefresh
			 * @default "zoom"
			 * @type String
			 */
			animateType: {
				defaultValue: "zoom",
				skipRefresh: true
			},
			
			/**
			 * 默认值为空，当显示的时候，取显示要使用的动画，优先级会高于animateType。<br/>
			 *
			 * 可选值：zoom、slide、safeSlide、fade、none。
			 * 关于动画的说明，参考animateType的说明。
			 * @attribute skipAutoRefresh
			 * @type String
			 */
			showAnimateType: {
				skipRefresh: true
			},
			
			/**
			 * 默认值为空，当隐藏的时候，取隐藏要使用的动画，优先级会高于animateType。 <br />
			 *
			 * 可选值：zoom、slide、safeSlide、fade、none。
			 * 关于动画的说明，参考animateType的说明。
			 * @attribute skipAutoRefresh
			 * @type String
			 */
			hideAnimateType: {
				skipRefresh: true
			},
			
			/**
			 * 动画开始时的目标来源，目前仅在animateType为zoom的时候会使用，用来确定动画开始的位置。
			 *
			 * @attribute skipAutoRefresh
			 * @type dorado.widget.Control|String|HTMLElement
			 */
			animateTarget: {
				skipRefresh: true
			},
			
			/**
			 * 组件在屏幕上的左偏移。
			 * @attribute
			 * @type Integer
			 */
			left: {},
			
			/**
			 * 组件在屏幕上的上偏移。
			 * @attribute
			 * @type Integer
			 */
			top: {},
			
			/**
			 * 是否居中显示组件。
			 * @attribute skipAutoRefresh
			 * @default false
			 * @type boolean
			 */
			center: {
				skipRefresh: true
			},
			
			/**
			 * 锚定对象，如果是window，则表示该要停靠的DOM元素相对于当前可视范围进行停靠。<br />
			 * 如果是组件或者HTMLElement，则是相对于组件的dom元素或HTMLElement进行停靠。
			 * @attribute
			 * @type {HtmlElement|window|dorado.RenderableElement}
			 */
			anchorTarget: {
				skipRefresh: true
			},
			
			/**
			 * 使用align、vAlign计算出组件的位置或者指定的位置的水平偏移量，可以为正，可以为负。
			 * @attribute
			 * @type int
			 */
			offsetLeft: {
				skipRefresh: true
			},
			
			/**
			 * 使用align、vAlign计算出组件的位置或者指定的位置的垂直偏移量，可以为正，可以为负。
			 * @attribute
			 * @type int
			 */
			offsetTop: {
				skipRefresh: true
			},
			
			/**
			 * 在水平方向上，组件停靠在anchorTarget的位置。可选值为left、innerleft、center、innerright、right。
			 * @attribute
			 * @type String
			 */
			align: {
				skipRefresh: true
			},
			
			/**
			 * 在垂直方向上，停靠的DOM对象停靠在固定位置的DOM对象的位置。可选值为top、innertop、center、innerbottom、bottom。
			 * @attribute
			 * @type String
			 */
			vAlign: {
				skipRefresh: true
			},
			
			/**
			 * 当使用默认的align、vAlign计算的位置超出屏幕可见范围以后，是否要对停靠DOM对象的位置进行调整，默认为true，即进行调整。
			 * @attribute
			 * @type boolean
			 * @default true
			 */
			autoAdjustPosition: {
				skipRefresh: true,
				defaultValue: true
			},
			
			/**
			 * 当自动调整以后也无法使得组件显示在屏幕范围以内以后，就认为停靠的DOM对象的超出触发了，该属性用来标示是否对这种情况进行处理，默认会对这种情况进行处理。
			 * @attribute
			 * @type boolean
			 * @default true
			 */
			handleOverflow: {
				skipRefresh: true,
				defaultValue: true
			},
			
			/**
			 * 是否模态显示组件。
			 * @attribute skipAutoRefresh
			 * @default false
			 * @type boolean
			 */
			modal: {
				skipRefresh: true
			},
			
			/**
			 * 模态以后显示的模态背景的类型。<br />
			 * 可选值: dark、transparent。<br />
			 * 每一种类型对应一个className，如果要扩展，可以扩展dorado.widget.FloatControl.modalTypeClassName对象。<br />
			 * @attribute
			 * @type String
			 */
			modalType: {
				skipRefresh: true,
				defaultValue: "dark"
			},
			
			/**
			 * 组件的阴影的阴影使用的模式。<br />
			 *
			 * 可选值：drop、sides、frame、none。
			 * @attribute
			 * @default "sides"
			 * @type String
			 */
			shadowMode: {
				defaultValue: "sides"
			},
			
			/**
			 * 是否在显示之后自动获得焦点，默认值为true。
			 * @attribute
			 * @default true
			 * @type boolean
			 */
			focusAfterShow: {
				defaultValue: true
			},
			
			/**
			 * 是否在显示之后延续之前的焦点管理状态，默认值是由Modal属性决定的，当modal为true的时候，continuedFocus为true，反之亦然。
			 * <p>
			 * 此属性仅在focusAfterShow为true是有实际意义。
			 * <ul>
			 * 	<li>
			 * 	如果此属性为true，那么当此控件显示之后，Dorado并不会令之前拥有焦点的控件失去焦点，即使此控件在显示之后获得了控制焦点。
			 * 	</li>
			 * 	<li>
			 * 	如果此属性为false，那么当此控件显示之后之前拥有焦点的控件将失去焦点。
			 * 	</li>
			 * </ul>
			 * </p>
			 * @attribute
			 * @type boolean
			 */
			continuedFocus: {}
		},
		
		EVENTS: /** @scope dorado.widget.FloatControl.prototype */ {
			/**
			 * 在显示之前触发。
			 * @param {Object} self 事件的发起者，即控件本身。
			 * @param {Object} arg 事件参数。
			 * @return {boolean} 是否要继续后续事件的触发操作，不提供返回值时系统将按照返回值为true进行处理。
			 * @event
			 */
			beforeShow: {},
			
			/**
			 * 在显示之后触发。
			 * @param {Object} self 事件的发起者，即控件本身。
			 * @param {Object} arg 事件参数。
			 * @event
			 */
			onShow: {},
			
			/**
			 * 在onShow的动画完成之后触发。
			 * @param {Object} self 事件的发起者，即控件本身。
			 * @param {Object} arg 事件参数。
			 * @event
			 */
			afterShow: {},
			
			/**
			 * 在隐藏之前触发。
			 * @param {Object} self 事件的发起者，即控件本身。
			 * @param {Object} arg 事件参数。
			 * @return {boolean} 是否要继续后续事件的触发操作，不提供返回值时系统将按照返回值为true进行处理。
			 * @event
			 */
			beforeHide: {},
			
			/**
			 * 在隐藏之后触发。
			 * @param {Object} self 事件的发起者，即组件本身。
			 * @param {Object} arg 事件参数。
			 * @return {boolean} 是否要继续后续事件的触发操作，不提供返回值时系统将按照返回值为true进行处理。
			 * @event
			 */
			onHide: {},
			
			/**
			 * 在onHide的动画完成之后触发。
			 * @param {Object} self 事件的发起者，即控件本身。
			 * @param {Object} arg 事件参数。
			 * @event
			 */
			afterHide: {},
			
			/**
			 * 在组件关闭之前触发。
			 * @param {Object} self 事件的发起者，即组件本身。
			 * @param {Object} arg 事件参数。
			 * @return {boolean} 是否要继续后续事件的触发操作，不提供返回值时系统将按照返回值为true进行处理。
			 * @event
			 */
			beforeClose: {},
			
			/**
			 * 在组件关闭之后触发。
			 * @param {Object} self 事件的发起者，即组件本身。
			 * @param {Object} arg 事件参数。
			 * @return {boolean} 是否要继续后续事件的触发操作，不提供返回值时系统将按照返回值为true进行处理。
			 * @event
			 */
			onClose: {}
		},
		
		/**
		 * 显示浮动控件。
		 * <p>
		 * 如无特殊需要请不要复写此方法，而应该复写doShow方法。
		 * </p>
		 * <p>
		 * 目前支持三种方式来决定位置：
		 * <ol>
		 * 	<li>指定anchorTarget</li>
		 *  <li>指定position</li>
		 *  <li>指定event</li>
		 * 	<li>指定left、top</li>
		 * </ol>
		 * 指定anchorTarget以后，anchorTarget会作为fixedElement传入dockAround方法，除了dockAround方法用到的参数，其他参数会被忽略。<br />
		 * 指定position以后，position会作为参数传入locateIn方法，除了locateIn方法用到的参数，其他参数会被忽略。<br />
		 * 指定event以后，显示的位置则等于event.pageX和event.pageY<br />
		 * 若不指定anchorTarget，也不指定position，则会判断用户是不是设置了center、left、top属性，根据这几个属性计算出组件显示的位置。
		 * </p>
		 *
		 * @param {Object|Function} [options] 传入的Json参数，下面的参数不会被设置为组件的显示属性。<br />
		 *        如果组件每次显示使用的都是不同的参数，不建议使用组件属性里面的显示参数，建议每次在调用show方法的时候动态指定Json参数。<br />
		 *        如果options类型为Function，则会被当做options.callback使用，与onShow事件调用的时间相同。
		 * @param {Object} [options.position] 组件显示的位置，该参数应该为Object，用left、top属性表示绝对值。
		 * @param {HTMLElement|dorado.widget.Control} [options.anchorTarget] 锚定对象，如果是window，则表示该要停靠的DOM元素相对于当前可视范围进行停靠。<br />
		 *              如果是组件或者HTMLElement，则是相对于组件的dom元素或HTMLElement进行停靠。
		 * @param {Event} [options.event] jQuery绑定的事件中传入的event。
		 * @param {String} [options.align=innerleft] 在水平方向上，组件停靠在anchorTarget的位置。可选值为left、innerleft、center、innerright、top。
		 * @param {String} [options.vAlign=innertop] 在垂直方向上，组件停靠在anchorTarget的位置。可选值为top、innertop、center、innerbottom、bottom。
		 * @param {int} [options.gapX=0] 在水平方向上，停靠的DOM对象与固定位置的DOM对象之间的间隙大小，可以为正，可以为负。
		 * @param {int} [options.gapY=0] 在垂直方向上，停靠的DOM对象与固定位置的DOM对象之间的间隙大小，可以为正，可以为负。
		 * @param {int} [options.offsetLeft=0] 使用align计算出组件的位置的水平偏移量，可以为正，可以为负。
		 * @param {int} [options.offsetTop=0] 使用vAlign计算出组件的位置的垂直偏移量，可以为正，可以为负。
		 * @param {boolean} [options.autoAdjustPosition=true] 当使用默认的align、vAlign计算的位置超出屏幕可见范围以后，是否要对停靠DOM对象的位置进行调整，默认为true，即进行调整。
		 * @param {boolean} [options.handleOverflow=true] 当自动调整以后也无法使得组件显示在屏幕范围以内以后，认为组件的超出触发了，该属性用来标示是否对这种情况进行处理，默认会对这种情况进行处理。
		 * @param {Function} [options.overflowHandler] 当组件的超出触发以后，要触发的函数，如果不指定，会去判断组件是否存在doHandleOverflow方法，如果存在，则会触发改方法。
		 * @param {String} [options.animateType] 动画类型。
		 * @param {Function} [options.callback] 在FloatControl显示完成之后，调用的回调函数，与onShow事件调用的时间相同。
		 */
		show: function(options) {
			if (typeof options == "function") {
				var callback = options;
				options = {
					callback: callback
				};
			} else {
				options = options || {};
			}
			var control = this;

			/* Frank屏蔽，会导致某些控件显示不正确。并且屏蔽后已不会重现当初此段代码修复的BUG
			var oldVisible = control._visible, oldActualVisible = control._actualVisible;
			control._visible = true;
			dorado.widget.Control.SKIP_REFRESH_ON_VISIBLE = true;
			control.setActualVisible(true);
			control.refresh();
			control._visible = oldVisible;
			dorado.widget.Control.SKIP_REFRESH_ON_VISIBLE = false;
			control.setActualVisible(oldActualVisible);
			*/
			
			var attrs = ["center", "autoAdjustPosition", "handleOverflow", "gapX", "gapY", "offsetLeft", "offsetTop", "align", "vAlign", "handleOverflow", "anchorTarget"];
			for (var i = 0; i < attrs.length; i++) {
				var attr = attrs[i], value = options[attr];
				if (value === undefined) {
					options[attr] = control["_" + attr];
				}
			}
			
			if (!options.overflowHandler && control.doHandleOverflow) {
				options.overflowHandler = $scopify(control, control.doHandleOverflow);
			}
			
			dorado.queue(control._id + SHOWHIDE_SUFFIX, function() {
				options = options || {};
				if (!control._rendered) {
					var renderTo = control._renderTo;
					if (renderTo) {
						if (renderTo instanceof dorado.widget.Container) renderTo = renderTo.get("containerDom");
						else if (renderTo instanceof dorado.widget.Control) renderTo = renderTo.getDom();
						else if (typeof renderTo == "string") renderTo = jQuery(document.body).find(renderTo)[0];
						else if (!renderTo.nodeName) renderTo = null;
					}

					var oldVisible = control._visible, oldActualVisible = control._actualVisible;
					control._visible = true;
					dorado.widget.Control.SKIP_REFRESH_ON_VISIBLE = true;
					control.setActualVisible(true);
					control.render(renderTo);
					control._visible = oldVisible;
					dorado.widget.Control.SKIP_REFRESH_ON_VISIBLE = false;
					control.setActualVisible(oldActualVisible);
				}
				if (dorado.Browser.msie)
					control.initObjectShimForIE();
				control.doShow.apply(control, [options]);
			});
		},

		initObjectShimForIE: function() {
			if (!dorado.useObjectShim || this._objectShimInited) return;
			var iframe = $DomUtils.xCreate({
				tagName: "iframe",
				style: {
					position: "absolute",
					visibility: "inherit",
					top: 0,
					left: 0,
					width: "100%",
					height: "100%",
					zIndex: -1,
					filter: "progid:DXImageTransform.Microsoft.Alpha(style=0,opacity=0)"
				},
				src: "about:blank"
			});
			this._dom.appendChild(iframe);
			this._objectShimInited = true;
		},

		/**
		 * 该方法在动画播放之前调用，会确定组件显示的位置，在位置确定以后，会按照组件属性的设置执行动画。
		 * 如果需要在动画播放之前执行一些动作，请覆写该方法。
		 *
		 * @param {Object} options Json类型的参数，同show方法。
		 * @protected
		 */
		doShow: function(options) {
			var control = this, dom = control.getDom(), anim = true, handleModal = true;
			
			//移动到屏幕之外，避免对Document的宽高产生影响
			$fly(dom).css({
				display: "",
				visibility: "hidden",
				left: -99999,
				top: -99999
			});
			
			var arg = {};
			control.fireEvent("beforeShow", control, arg);
			if (arg.processDefault === false) {
				dorado.dequeue(control._id + SHOWHIDE_SUFFIX);
				return;
			}
			
			if (control._visible) {
				//anim = false;
				handleModal = false;
			}

			control._visible = true;
			control.setActualVisible(true);
			var $dom = $fly(dom);
			$dom.css({
				display: "",
				visibility: "hidden"
			});
			if (control._shadowMode != "none") {
				$dom.shadow({
					mode: control._shadowMode || "sides"
				});
			}
	
			var position = control.getShowPosition(options);
			
			options.position = position;
			options.animateTarget = control._animateTarget;

			if (needUseModal) {
				if (!control._modalDom) {
					control._modalDom = layerModalPool.borrowObject();
					jQuery.data(control._modalDom, modalKey, control);
				}

				control._modalDom.style.display = "";
			}

			if (handleModal && control._modal) {
				dorado.ModalManager.show(dom, dorado.widget.FloatControl.modalTypeClassName[control._modalType]);
			}
			
			var animateType = options.animateType || control._showAnimateType || control._animateType;
			if (anim && animateType != "none") {
				control.fireEvent("onShow", control);
				if (options.callback) {
					options.callback.apply(control.get("view"), [control]);
				}
				var behavior = dorado.widget.FloatControl.behaviors[animateType];
				if (typeof behavior.show == "function") {
					behavior.show.apply(control, [options]);
				}
			} else {
				$fly(dom).css(position);
				control.fireEvent("onShow", control);
				if (options.callback) {
					options.callback.apply(control.get("view"), [control]);
				}
				control.doAfterShow.apply(control, [options]);
			}
		},
		
		/**
		 * 在动画完成之后会调用此方法。
		 * 该方法会根据组件的设置，为组件添加阴影、移到最前、获得焦点等。
		 * 在该方法的最后，会触发onShow方法。
		 * @protected
		 */
		doAfterShow: function() {
			var control = this, dom = control.getDom();
			if (dorado.widget.FloatControl.VISIBLE_FLOAT_CONTROLS.indexOf(control) < 0) {
				dorado.widget.FloatControl.VISIBLE_FLOAT_CONTROLS.push(control);
			}
			
			if (dom) {
				jQuery(dom).css({
					visibility: "",
					display: ""
				}).bringToFront();

				var continuedFocus = control._continuedFocus === undefined ? control._modal : !!control._continuedFocus;

				if (continuedFocus) {
					var focusParent = dorado.widget.getFocusedControl();
					var parent = focusParent;
					while (parent) {
						if (parent == control) {
							focusParent = parent.get("focusParent");
							break;
						}
						parent = parent.get("focusParent");
					}
					control._focusParent = focusParent;
				}
				
				if (control._focusAfterShow || control._modal) {
					control.setFocus();
				}
				
				control.fireEvent("afterShow", control);
			}
			dorado.dequeue(control._id + SHOWHIDE_SUFFIX);
		},
		
		/**
		 * 取得组件显示的位置。
		 * @param {Object} options Json类型的参数，同show方法。
		 * @protected
		 */
		getShowPosition: function(options) {
			var control = this, anchorTarget = options.anchorTarget, position = options.position, dom = control.getDom(), event = options.event, fixedElement, result;

			if (anchorTarget) {
				if (anchorTarget instanceof dorado.widget.Control) {
					fixedElement = anchorTarget._dom;
				} else if (dorado.Object.isInstanceOf(anchorTarget, dorado.RenderableElement)) {
					fixedElement = anchorTarget._dom;
				} else if (typeof anchorTarget == "string") {
					fixedElement = jQuery(anchorTarget)[0];
				} else {
					fixedElement = anchorTarget;
				}
				
				result = $DomUtils.dockAround(dom, fixedElement, options);
			} else if (position) {
				result = $DomUtils.locateIn(dom, options);
			} else if (event) {
				options.position = {
					left: event.pageX,
					top: event.pageY
				};
				
				result = $DomUtils.locateIn(dom, options);
			} else {
				if (options.center && control._left == undefined && control._top == undefined) {
					var docSize = {
						width: $fly(window).width(),
						height: $fly(window).height()
					};
					
					control._left = (docSize.width - $fly(dom).width()) / 2 + jQuery(window).scrollLeft();
					control._top = (docSize.height - $fly(dom).height()) / 2 + jQuery(window).scrollTop();
				}
				
				options.position = {
					left: control._left || 0,
					top: control._top || 0
				};
				
				result = $DomUtils.locateIn(dom, options);
			}
			
			return result;
		},
		
		/**
		 * 隐藏浮动控件。
		 * <p>
		 * 如无特殊需要请不要复写此方法，而应该复写doHide方法。
		 * </p>
		 * @param {Object} options Json类型的参数
		 */
		hide: function(options) {
			var control = this, args = arguments;
			if (!control._visible) {
				dorado.dequeue(control._id + SHOWHIDE_SUFFIX);
				return;
			}
			
			dorado.queue(control._id + SHOWHIDE_SUFFIX, function() {
				var arg = {};
				
				control.fireEvent("beforeHide", control, arg);
				if (arg.processDefault === false) {
					dorado.dequeue(control._id + SHOWHIDE_SUFFIX);
					return;
				} else {
					if (control.doBeforeHide) control.doBeforeHide();
				}
				
				var focused = control._focused;
				if (focused) {
					var focusParent = control._focusParent || control._parent;
					while (focusParent) {
						if (focusParent.isFocusable()) {
							dorado.widget.setFocusedControl(focusParent);
							break;
						}
						focusParent = focusParent._focusParent || focusParent._parent;
					}
				}
				
				if (focused && dorado.Browser.msie) dorado.widget.Control.IGNORE_FOCUSIN_EVENT = true;
				if (control.doHide) {
					control.doHide.apply(control, args);
				}
				if (focused && dorado.Browser.msie) dorado.widget.Control.IGNORE_FOCUSIN_EVENT = false;
			});
		},
		
		/**
		 * 该方法在动画播放之前调用，会按照组件属性的设置执行动画。
		 * 如果需要在动画播放之前执行一些动作，请覆写该方法。
		 * @param {Object} options Json类型的参数，同hide方法。
		 * @protected
		 */
		doHide: function(options) {
			var control = this, dom = control._dom;
			if (dom) {
				options = options || {};
				
				if (control._modal) {
					dorado.ModalManager.hide(dom);
				}

				if (needUseModal) {
					var hideModalLayer = function() {
						if (control._modalDom) {
							control._modalDom.style.display = "none";
							layerModalPool.returnObject(control._modalDom);
							control._modalDom = null;
						}
					};
					dorado.doOnBodyClick(hideModalLayer);
					//此处是为了解决用户没有点击页面上的按钮而隐藏了FloatControl的导致无法隐藏穿透层问题，比如嵌入某个App
					setTimeout(hideModalLayer, 1000);
				}
				control._visible = false;
				control.setActualVisible(false);
				
				dorado.widget.FloatControl.VISIBLE_FLOAT_CONTROLS.remove(control);
				
				var animateType = options.animateType || control._hideAnimateType || control._animateType;
				options.animateTarget = control._animateTarget;
				if (animateType != "none") {
					var behavior = dorado.widget.FloatControl.behaviors[animateType];
					if (typeof behavior.hide == "function") {
						behavior.hide.apply(control, [options]);
					}
				} else {
					control.doAfterHide();
				}
			}
		},
		
		/**
		 * 在动画完成之后会调用此方法。
		 * 在该方法的最后，会触发onHide方法。
		 * @protected
		 */
		doAfterHide: function() {
			var control = this, dom = control._dom;
			control.fireEvent("onHide", control);
			jQuery(dom).unshadow().css({
				visibility: "hidden",
				display: "none"
			});
			control._currentVisible = false;
			control.fireEvent("afterHide", control);
			dorado.dequeue(control._id + SHOWHIDE_SUFFIX);
			//log.debug("dorado.dequeue after hide：" + control._id);

			var continuedFocus = control._continuedFocus === undefined ? control._modal : !!control._continuedFocus;

			if (continuedFocus) {
				control._focusParent = null;
			}
		}
	});
	
	dorado.widget.FloatControl.VISIBLE_FLOAT_CONTROLS = [];

	dorado.widget.FloatControl.layerModalPool = layerModalPool;

	var slideShow = function(options, safe) {
		var control = this, align = options.align, vAlign = options.vAlign, direction = options.direction, dom = control._dom;
		$fly(dom).css("visibility", "");
		
		if (!direction && (vAlign && align)) {
			if (vAlign.indexOf("inner") != -1) { //说明是submenu
				direction = align.indexOf("right") != -1 ? "l2r" : "r2l";
			} else { //说明是button
				direction = vAlign.indexOf("bottom") != -1 ? "t2b" : "b2t";
			}
		}
		
		direction = direction || "t2b";
		
		control._slideInDir = direction;
		
		var position = options.position || {};
		
		jQuery(dom).css(position).bringToFront()[safe ? "safeSlideIn" : "slideIn"]({
			duration: options.animateDuration || 200,
			easing: options.animateEasing,
			direction: direction,
			complete: function() {
				control.doAfterShow.apply(control, [options]);
				dom.style.display = "";
			}
		});
	};
	
	var slideHide = function(options, safe) {
		var control = this, dom = control._dom, direction = control._slideInDir;
		switch (direction) {
			case "l2r":
				direction = "r2l";
				break;
			case "r2l":
				direction = "l2r";
				break;
			case "b2t":
				direction = "t2b";
				break;
			case "t2b":
				direction = "b2t";
				break;
		}
		control._slideInDir = null;
		
		jQuery(dom)[safe ? "safeSlideOut" : "slideOut"]({
			direction: direction,
			duration: options.animateDuration || 200,
			easing: options.animateEasing,
			complete: function() {
				control.doAfterHide.apply(control, arguments);
			}
		});
	};
	
	dorado.widget.FloatControl.modalTypeClassName = {
		dark: "d-modal-mask",
		transparent: "d-modal-mask-transparent"
	};
	
	dorado.widget.FloatControl.behaviors = {
		zoom: {
			show: function(options) {
				var control = this, dom = control._dom;
				jQuery(dom).zoomIn(jQuery.extend(options, {
					duration: options.animateDuration || 200,
					easing: options.animateEasing,
					complete: function() {
						control.doAfterShow.apply(control, [options]);
					}
				}));
			},
			hide: function(options) {
				var control = this, dom = control._dom;
				jQuery(dom).css("visibility", "hidden").zoomOut(jQuery.extend(options, {
					duration: options.animateDuration || 200,
					easing: options.animateEasing,
					complete: function() {
						control.doAfterHide.apply(control, arguments);
					}
				}));
			}
		},
		
		flip: {
			show: function(options) {
				var control = this, dom = control._dom;
				jQuery(dom).css("visibility", "").flipIn(jQuery.extend(options, {
					duration: options.animateDuration || 200,
					easing: options.animateEasing,
					complete: function() {
						control.doAfterShow.apply(control, [options]);
					}
				}));
			},
			hide: function(options) {
				var control = this, dom = control._dom;
				jQuery(dom).flipOut(jQuery.extend(options, {
					duration: options.animateDuration || 200,
					easing: options.animateEasing,
					complete: function() {
						control.doAfterHide.apply(control, arguments);
					}
				}));
			}
		},
		
		modernZoom: {
			show: function(options) {
				var control = this, dom = control._dom;
				jQuery(dom).css("visibility", "").modernZoomIn(jQuery.extend(options, {
					duration: options.animateDuration || 200,
					easing: options.animateEasing,
					complete: function() {
						control.doAfterShow.apply(control, [options]);
					}
				}));
			},
			hide: function(options) {
				var control = this, dom = control._dom;
				jQuery(dom).modernZoomOut(jQuery.extend(options, {
					duration: options.animateDuration || 200,
					easing: options.animateEasing,
					complete: function() {
						control.doAfterHide.apply(control, arguments);
					}
				}));
			}
		},
		
		slide: {
			show: function(options) {
				slideShow.apply(this, [options]);
			},
			hide: function(options) {
				slideHide.apply(this, [options]);
			}
		},
		
		safeSlide: {
			show: function(options) {
				slideShow.apply(this, [options, true]);
			},
			hide: function(options) {
				slideHide.apply(this, [options, true]);
			}
		},
		
		fade: {
			show: function(options) {
				var control = this, dom = control._dom;
				jQuery(dom).bringToFront().css({
					visibility: "",
					opacity: 0
				}).animate({
					opacity: 1
				}, {
					duration: options.animateDuration || 200,
					easing: options.animateEasing,
					complete: function() {
						$fly(dom).css({
							opacity: ""
						});
						control.doAfterShow.apply(control, [options]);
					}
				});
			},
			hide: function(options) {
				var control = this, dom = control._dom;
				jQuery(dom).animate({
					opacity: 0
				}, {
					duration: options.animateDuration || 200,
					easing: options.animateEasing,
					complete: function() {
						$fly(dom).css({
							opacity: ""
						});
						control.doAfterHide.apply(control, arguments);
					}
				});
			}
		}
	};
})();

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
	 * @author Benny Bao (mailto:benny.bao@bstek.com)
	 * @class 拖拽信息。
	 * @extends dorado.AttributeSupport
	 * @param {Object} options 配置信息。
	 * <p>
	 * 系统会自动将该JSON对象中的属性设置到组件中。
	 * </p>
	 */
	dorado.DraggingInfo = $extend(dorado.AttributeSupport, /** @scope dorado.DraggingInfo.prototype */ {
		$className: "dorado.DraggingInfo",
		
		ATTRIBUTES: /** @scope dorado.DraggingInfo.prototype */ {
		
			/**
			 * 被拖拽的对象。
			 * @attribute
			 * @type Object
			 */
			object: {
				setter: function(object) {
					this._object = object;
					this._insertMode = null;
					this._refObject = null;
				}
			},
			
			/**
			 * 被拖拽的对象对应的HTMLElement。
			 * @attribute
			 * @type HTMLElement
			 */
			element: {},
			
			/**
			 * 被拖拽对象的拖拽标签数组。
			 * @attribute
			 * @type String[]
			 */
			tags: {},
			
			/**
			 * 拖拽操作始于哪个控件。
			 * @attribute
			 * @type dorado.widget.Control
			 */
			sourceControl: {},
			
			
			/**
			 * 对象被拖放到了哪个对象中。
			 * @attribute
			 * @type Object
			 */
			targetObject: {},
			
			/**
			 * 对象被拖放到了哪个控件中。
			 * @attribute
			 * @type dorado.widget.Control
			 */
			targetControl: {},
			
			/**
			 * 插入模式。
			 * @attribute
			 * @type String
			 */
			insertMode: {},
			
			/**
			 * 插入参考对象。
			 * @attribute
			 * @type Object
			 */
			refObject: {},
			
			/**
			 * 当前拖放位置是否可接受的正在拖拽的对象。
			 * @attribute
			 * @type boolean
			 */
			accept: {
				getter: function() {
					return jQuery.ui.ddmanager.accept;
				},
				setter: function(accept) {
					if (this._indicator) this._indicator.set("accept", accept);
					jQuery.ui.ddmanager.accept = accept;
				}
			},
			
			/**
			 * 拖拽指示器。
			 * @attribute
			 * @type dorado.DraggingIndicator
			 */
			indicator: {},
			
			/**
			 * 实际传递给jQuery.draggable方法的options参数。
			 * @attribute
			 * @type Object
			 */
			options: {}
		},
		
		constructor: function(options) {
			if (options) this.set(options);
			if (!this._tags) this._tags = [];
		},
		
		/**
		 * 根据给定的拖放标签数组判断对于当前正拖拽的对象是否可被接受。
		 * @param {String[]} droppableTags 拖放标签数组
		 * @return {boolean} 是否可接受。
		 */
		isDropAcceptable: function(droppableTags) {
			if (droppableTags && droppableTags.length && this._tags.length) {
				for (var i = 0; i < droppableTags.length; i++) {
					if (this._tags.indexOf(droppableTags[i]) >= 0) return true;
				}
			}
			return false;
		}
	});
	
	dorado.DraggingInfo.getFromJQueryUI = function(ui) {
		return $fly(ui.draggable[0]).data("ui-draggable").draggingInfo;
	};
	
	dorado.DraggingInfo.getFromElement = function(element) {
		element = (element instanceof jQuery) ? element : $fly(element);
		return element.data("ui-draggable").draggingInfo;
	};
	
	/**
	 * @author Benny Bao (mailto:benny.bao@bstek.com)
	 * @class 可拖拽对象的通用接口。
	 * @see dorado.Droppable
	 */
	dorado.Draggable = $class( /** @scope dorado.Draggable.prototype */{
		$className: "dorado.Draggable",
		
		defaultDraggableOptions: {
			distance: 5,
			revert: "invalid",
			cursorAt: {
				left: 8,
				top: 8
			}
		},
		
		ATTRIBUTES: /** @scope dorado.Draggable.prototype */ {
		
			/**
			 * 是否可拖拽。
			 * @type boolean
			 * @attribute
			 */
			draggable: {},
			
			/**
			 * 拖拽标签。
			 * <p>
			 * 声明拖拽标签可用用标签数组或是以','分隔的标签字符串。
			 * </p>
			 * <p>
			 * 当系统发现被拖拽对象的标签数组与鼠标移经的可接受拖拽对象的标签数组之间的交集不为空时，
			 * 系统将认为被拖拽对象可以被放置到该可接受拖拽对象中。（这只是一个大致的判断，具体的运行结果还可能受相关对象的事件定义所影响。）
			 * </p>
			 * @type String|String[]
			 * @attribute skipRefresh
			 * @see dorado.Droppable#attribute:droppableTags
			 */
			dragTags: {
				skipRefresh: true,
				setter: function(v) {
					if (typeof v == "string") v = v.split(',');
					this._dragTags = v || [];
				}
			}
		},
		
		EVENTS: /** @scope dorado.Draggable.prototype */ {
		
			/**
			 * 当此对象开始进入拖拽状态之初，系统尝试相应的拖拽指示光标时触发的事件。
			 * @param {Object} self 事件的发起者，即对象本身。
			 * @param {Object} arg 事件参数。
			 * @param {dorado.DraggingIndicator|HTMLElement} #arg.indicator 系统将要使用的默认拖拽指示光标。
			 * <p>
			 * 您可以直接修改此光标对象，也可以用新的实例替换掉此光标。甚至可以返回一个自己创建好的HTMLElement作用拖拽光标。
			 * </p>
			 * @param {Event} arg.event 系统Event对象。
			 * @param {HTMLElement} arg.draggableElement 被拖拽对象对应的HTMLElement。
			 * @return {boolean} 是否要继续后续事件的触发操作，不提供返回值时系统将按照返回值为true进行处理。
			 * @event
			 */
			onGetDraggingIndicator: {},
			
			/**
			 * 当此对象将要进入拖拽状态时触发的事件。
			 * @param {Object} self 事件的发起者，即对象本身。
			 * @param {Object} arg 事件参数。
			 * @param {dorado.DraggingInfo} arg.draggingInfo 拖拽信息对象。
			 * @param {Event} arg.event 系统Event对象。
			 * @param {boolean} #arg.processDefault=true 用于通知系统是否要继续完成后续动作。
			 * 即返回true表示允许此对象开始被拖拽，返回false则禁止此对象被拖拽。
			 * @return {boolean} 是否要继续后续事件的触发操作，不提供返回值时系统将按照返回值为true进行处理。
			 * @event
			 */
			onDragStart: {},
			
			/**
			 * 当此对象的拖拽操作结束时触发的事件。
			 * 拖拽对象被成功的放置或拖拽操作被取消时都会触发此事件。
			 * @param {Object} self 事件的发起者，即对象本身。
			 * @param {Object} arg 事件参数。
			 * @param {dorado.DraggingInfo} arg.draggingInfo 拖拽信息对象。
			 * @param {Event} arg.event 系统Event对象。
			 * @return {boolean} 是否要继续后续事件的触发操作，不提供返回值时系统将按照返回值为true进行处理。
			 * @event
			 */
			onDragStop: {},
			
			/**
			 * 当此对象被拖动时触发的事件。
			 * 即当此对象处于被拖拽状态时伴随着鼠标的移动系统会不停的触发此事件。
			 * @param {Object} self 事件的发起者，即对象本身。
			 * @param {Object} arg 事件参数。
			 * @param {dorado.DraggingInfo} arg.draggingInfo 拖拽信息对象。
			 * @param {Event} arg.event 系统Event对象。
			 * @return {boolean} 是否要继续后续事件的触发操作，不提供返回值时系统将按照返回值为true进行处理。
			 * @event
			 */
			onDragMove: {}
		},
		
		/**
		 * 返回当系统将此对象初始化为可拖拽对象时将要传递给{@link jQuery.draggable}方法的options参数。
		 * @param {HTMLElement} dom 将要初始化的HTMLElement。
		 * @protected
		 * return {Object} options参数。
		 */
		getDraggableOptions: function(dom) {
			var options = dorado.Object.apply({
				doradoDraggable: this
			}, this.defaultDraggableOptions);
			return options;
		},
		
		applyDraggable: function(dom, options) {
			if (dom._currentDraggable !== this._draggable) {
				if (this._draggable) {
					options = options || this.getDraggableOptions(dom);
					$fly(dom).draggable(options);
				} else if ($fly(dom).data("ui-draggable")) {
					$fly(dom).draggable("destroy");
				}
				dom._currentDraggable = this._draggable;
			}
		},
		
		/**
		 * 创建当此对象进入被拖拽状态后与之相关联的拖拽信息对象。
		 * @protected
		 * @param {HTMLElement} dom 将要拖拽的HTMLElement。
		 * @param {Object} dom 传递给{@link jQuery.draggable}方法的options参数。
		 * return {dorado.DraggingInfo} 拖拽信息对象。
		 */
		createDraggingInfo: function(dom, options) {
			var info = new dorado.DraggingInfo({
				sourceControl: this,
				options: options,
				tags: this._dragTags
			});
			return info;
		},
		
		/**
		 * 初始化给定的拖拽信息对象。
		 * @protected
		 * @param {dorado.DraggingInfo} draggingInfo 拖拽信息对象。
		 * @param {Event} evt 系统Event对象。
		 */
		initDraggingInfo: function(draggingInfo, evt) {
		},
		
		/**
		 * 初始化给定的拖拽光标对象。
		 * @protected
		 * @param {dorado.DraggingIndicator|HTMLElement} indicator 拖拽光标对象。
		 * @param {dorado.DraggingInfo} draggingInfo 拖拽信息对象。
		 * @param {Event} evt 系统Event对象。
		 */
		initDraggingIndicator: function(indicator, draggingInfo, evt) {
		},
		
		onGetDraggingIndicator: function(indicator, evt, draggableElement) {
			if (!indicator) indicator = dorado.DraggingIndicator.create();
			var eventArg = {
				indicator: indicator,
				event: evt,
				draggableElement: draggableElement
			};
			this.fireEvent("onGetDraggingIndicator", this, eventArg);
			indicator = eventArg.indicator;
			
			if (indicator instanceof dorado.DraggingIndicator) {
				if (!indicator.get("rendered")) indicator.render();
				var dom = indicator.getDom();
				$fly(dom).bringToFront();
			}
			return indicator;
		},
		
		onDragStart: function(draggingInfo, evt) {
			var eventArg = {
				draggingInfo: draggingInfo,
				event: evt,
				processDefault: true
			};
			this.fireEvent("onDragStart", this, eventArg);
			return eventArg.processDefault;
		},
		
		onDragStop: function(draggingInfo, evt) {
			var eventArg = {
				draggingInfo: draggingInfo,
				event: evt,
				processDefault: true
			};
			this.fireEvent("onDragStop", this, eventArg);
			return eventArg.processDefault;
		},
		
		onDragMove: function(draggingInfo, evt) {
			var eventArg = {
				draggingInfo: draggingInfo,
				event: evt
			};
			this.fireEvent("onDragMove", this, eventArg);
		}
		
	});
	
	/**
	 * @author Benny Bao (mailto:benny.bao@bstek.com)
	 * @class  可接受拖放对象的通用接口。
	 * @see dorado.Draggable
	 */
	dorado.Droppable = $class(/** @scope dorado.Droppable.prototype */{
		$className: "dorado.Droppable",
		
		defaultDroppableOptions: {
			accept: "*",
			greedy: true,
			tolerance: "pointer"
		},
		
		ATTRIBUTES: /** @scope dorado.Droppable.prototype */ {
		
			/**
			 * 是否可接受拖放。
			 * @type boolean
			 * @attribute
			 */
			droppable: {},
			
			/**
			 * 可接受的拖拽标签。
			 * <p>
			 * 声明拖拽标签可用用标签数组或是以','分隔的标签字符串。
			 * </p>
			 * @type String|String[]
			 * @attribute skipRefresh
			 * @see dorado.Draggable#attribute:dragTags
			 */
			droppableTags: {
				skipRefresh: true,
				setter: function(v) {
					if (typeof v == "string") v = v.split(',');
					this._droppableTags = v || [];
				}
			}
		},
		
		EVENTS: /** @scope dorado.Droppable.prototype */ {
		
			/**
			 * 当有某被拖拽对象进入此对象的区域时触发的事件。
			 * @param {Object} self 事件的发起者，即对象本身。
			 * @param {Object} arg 事件参数。
			 * @param {dorado.DraggingInfo} arg.draggingInfo 拖拽信息对象。
			 * @param {Event} arg.event 系统Event对象。
			 * @param {boolean} #arg.accept 是否可接受此拖拽对象。
			 * @return {boolean} 是否要继续后续事件的触发操作，不提供返回值时系统将按照返回值为true进行处理。
			 * @event
			 */
			onDraggingSourceOver: {},
			
			/**
			 * 当有某被拖拽对象离开此对象的区域时触发的事件。
			 * @param {Object} self 事件的发起者，即对象本身。
			 * @param {Object} arg 事件参数。
			 * @param {dorado.DraggingInfo} arg.draggingInfo 拖拽信息对象。
			 * @param {Event} arg.event 系统Event对象。
			 * @return {boolean} 是否要继续后续事件的触发操作，不提供返回值时系统将按照返回值为true进行处理。
			 * @event
			 */
			onDraggingSourceOut: {},
			
			/**
			 * 当有某被拖拽对象在此对象的区域内移动时触发的事件。
			 * @param {Object} self 事件的发起者，即对象本身。
			 * @param {Object} arg 事件参数。
			 * @param {dorado.DraggingInfo} arg.draggingInfo 拖拽信息对象。
			 * @param {Event} arg.event 系统Event对象。
			 * @return {boolean} 是否要继续后续事件的触发操作，不提供返回值时系统将按照返回值为true进行处理。
			 * @event
			 */
			onDraggingSourceMove: {},
			
			/**
			 * 当有某被拖拽对象在此对象的区域内被释放之前触发的事件。
			 * @param {Object} self 事件的发起者，即对象本身。
			 * @param {Object} arg 事件参数。
			 * @param {dorado.DraggingInfo} arg.draggingInfo 拖拽信息对象。
			 * @param {Event} arg.event 系统Event对象。
			 * @param {boolean} #arg.processDefault=true 是否要继续系统默认的操作。
			 * @return {boolean} 是否要继续后续事件的触发操作，不提供返回值时系统将按照返回值为true进行处理。
			 * @event
			 */
			beforeDraggingSourceDrop: {},
			
			/**
			 * 当有某被拖拽对象在此对象的区域内被释放时触发的事件。
			 * @param {Object} self 事件的发起者，即对象本身。
			 * @param {Object} arg 事件参数。
			 * @param {dorado.DraggingInfo} arg.draggingInfo 拖拽信息对象。
			 * @param {Event} arg.event 系统Event对象。
			 * @return {boolean} 是否要继续后续事件的触发操作，不提供返回值时系统将按照返回值为true进行处理。
			 * @event
			 */
			onDraggingSourceDrop: {}
		},
		
		/**
		 * 返回当系统将此对象初始化为可接受拖拽对象时将要传递给{@link jQuery.droppable}方法的options参数。
		 * @param {HTMLElement} dom 将要初始化的HTMLElement。
		 * @protected
		 * return {Object} options参数。
		 */
		getDroppableOptions: function(dom) {
			var options = dorado.Object.apply({
				doradoDroppable: this
			}, this.defaultDroppableOptions);
			return options;
		},
		
		applyDroppable: function(dom, options) {
			if (dom._currentDroppable !== this._droppable) {
				if (this._droppable) {
					options = options || this.getDroppableOptions(dom);
					$fly(dom).droppable(options);
				} else if ($fly(dom).data("ui-droppable")) {
					$fly(dom).droppable("destroy");
				}
				dom._currentDroppable = this._droppable;
			}
		},
		
		onDraggingSourceOver: function(draggingInfo, evt) {
			var accept = draggingInfo.isDropAcceptable(this._droppableTags);
			var eventArg = {
				draggingInfo: draggingInfo,
				event: evt,
				accept: accept
			};
			this.fireEvent("onDraggingSourceOver", this, eventArg);
			draggingInfo.set("accept", eventArg.accept);
			return eventArg.accept;
		},
		
		onDraggingSourceOut: function(draggingInfo, evt) {
			var eventArg = {
				draggingInfo: draggingInfo,
				event: evt
			};
			this.fireEvent("onDraggingSourceOut", this, eventArg);
			draggingInfo.set({
				targetObject: null,
				insertMode: null,
				refObject: null,
				accept: false
			});
		},
		
		onDraggingSourceMove: function(draggingInfo, evt) {
			var eventArg = {
				draggingInfo: draggingInfo,
				event: evt
			};
			this.fireEvent("onDraggingSourceMove", this, eventArg);
		},
		
		beforeDraggingSourceDrop: function(draggingInfo, evt) {
			var eventArg = {
				draggingInfo: draggingInfo,
				event: evt,
				processDefault: true
			};
			this.fireEvent("beforeDraggingSourceDrop", this, eventArg);
			return eventArg.processDefault;
		},
		
		onDraggingSourceDrop: function(draggingInfo, evt) {
			var eventArg = {
				draggingInfo: draggingInfo,
				event: evt
			};
			this.fireEvent("onDraggingSourceDrop", this, eventArg);
		},
		
		getMousePosition: function(evt) {
			var offset = $fly(this.getDom()).offset();
			return {
				x: evt.pageX - offset.left,
				y: evt.pageY - offset.top
			};
		}
		
	});
	
})();

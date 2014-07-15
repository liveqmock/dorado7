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
	var CONST_MOUSE_POS_ADJ_X = 5, CONST_MOUSE_POS_ADJ_Y = 15, TOOLTIP_KEY = "dorado.tooltip", DOMS_KEY = "dorado.tip.doms";
	
	var elementMouseEnter = function(event) {
		var element = this, tip = dorado.TipManager.getTip(element);
		
		// $log("tip._text:" + tip._text + "\ttip._visible:" + tip._visible);
		if ((tip._text || tip._content) && !tip._visible) {
			dorado.TipManager.showTip(element, tip._showDelay || 0, event);
		}
		
		event.stopImmediatePropagation();
	};
	
	var elementMouseMove = function(event) {
		var element = this, tip = dorado.TipManager.getTip(element);
		if (tip) {
			if (tip._showTimer) {
				tip._latestEvent = event;
				event.stopImmediatePropagation();
			}
			if (tip._trackMouse && tip._dom && ($fly(tip._dom).css("display") != "none")) {
				tip._updatePosition(event);
			}
		}
	};
	
	var elementMouseLeave = function() {
		var element = this, tip = dorado.TipManager.getTip(element);
		if (tip) {
			//$log("element mouse leave; tip._showTimer:" + tip._showTimer);
			if (tip._showTimer) {
				clearTimeout(tip._showTimer);
				tip._showTimer = null;
			}
			if (tip._autoHide) {
				dorado.TipManager.hideTip(tip, tip._hideDelay || 0);
			}
		}
	};
	
	var tipCanUsePool = [];
	
	/**
	 * @author Frank Zhang (mailto:frank.zhang@bstek.com)
	 * @component Base
	 * @class 系统提示信息组件。<br />
	 * 显示为一个长方形的小弹出面板，该面板在用户将指针悬停在一个控件上时显示有关该控件用途的简短说明。<br />
	 * 该组件与dorado.widget.Tip的区别主要在于该组件的显示依赖于用户的鼠标移动操作，而且会被dorado.widget.ToolTipManager管理。
	 * 如果要为某一组件显示一个与用户的鼠标动作无关的提示信息，请使用dorado.widget.Tip。<br />
	 * 该组件被dorado.widget.ToolTipManager管理，不建议直接创建，那样会造成不可预知的问题。
	 *
	 * @extends dorado.widget.Tip
	 */
	dorado.widget.ToolTip = $extend(dorado.widget.Tip, /** @scope dorado.widget.ToolTip.prototype */ {
		$className: "dorado.widget.ToolTip",
		
		ATTRIBUTES: /** @scope  dorado.widget.ToolTip.prototype */ {
		
			/**
			 * 鼠标的偏移值。<br />
			 * ToolTip不是直接显示在鼠标的位置，而是有一定的偏移，默认值为横向为5像素，纵向为15像素。
			 * @attribute
			 * @type Array
			 * @default [5, 15]
			 */
			mouseOffset: {
				defaultValue: [CONST_MOUSE_POS_ADJ_X, CONST_MOUSE_POS_ADJ_Y]
			},
			
			/**
			 * 定位是根据anchorTarget定位，还是根据鼠标定位，默认为false，使用鼠标定位。
			 * @attribute
			 * @type boolean
			 * @default true
			 */
			anchorToTarget: {
				defaultValue: false,
				skipRefresh: true,
				setter: function(value) {
					this._anchorToTarget = value;
					if (this._ready) {
						if (value === false) {
							this.unbindTarget();
						} else {
							this.bindTarget();
						}
					}
				}
			},
			
			anchorTarget: {
				skipRefresh: true,
				setter: function(value) {
					var oldValue = this._anchorTarget;
					if (oldValue && this._anchorTargetBinded) {
						this.unbindTarget();
					}
					this._anchorTarget = value;
					if (this._ready && value) {
						this.bindTarget();
					}
				}
			},
			
			/**
			 * ToolTip显示延时的毫秒数，默认为500。
			 * @attribute
			 * @default 500
			 * @type int
			 */
			showDelay: {
				skipRefresh: true,
				defaultValue: 500
			},
			
			/**
			 * ToolTip隐藏延时的毫秒数，默认为300。
			 * @attribute
			 * @default 300
			 * @type int
			 */
			hideDelay: {
				skipRefresh: true,
				defaultValue: 300
			},
			
			/**
			 * ToolTip是否在鼠标移开anchorTarget后自动隐藏，默认为自动隐藏。
			 * @attribute
			 * @default true
			 * @type boolean
			 */
			autoHide: {
				defaultValue: true
			},
			
			/**
			 * ToolTip是否对鼠标的移动进行跟踪，默认不进行跟踪。
			 * @attribute
			 * @default false
			 * @type boolean
			 */
			trackMouse: {}
		},
		
		getShowPosition: function(options) {
			var tip = this, dom = tip.getDom(), event = tip._latestEvent || options.event;
			
			if (tip._anchorToTarget === true) {
				return $invokeSuper.call(this, arguments);
			} else if (tip._anchorToTarget !== true && event) {
				var mouseOffset = tip._mouseOffset || [CONST_MOUSE_POS_ADJ_X, CONST_MOUSE_POS_ADJ_Y];
				$DomUtils.locateIn(dom, {
					position: {
						left: event.pageX + mouseOffset[0],
						top: event.pageY + mouseOffset[1]
					}
				});
				tip._latestEvent = null;
			}
			
			return {
				left: $fly(dom).left(),
				top: $fly(dom).top()
			};
		},
		
		doClose: function(closeEl) {
			var target = jQuery.data(closeEl.parentNode, TOOLTIP_KEY);
			target.hide();
		},
		
		getDom: function() {
			var dom = this._dom;
			if (!dom) {
				dom = tipCanUsePool.pop();
				
				if (dom) {
					this._doms = jQuery.data(dom, DOMS_KEY);
					this._dom = dom;
					//sync visible.
					if (this._visible) {
						$fly(dom).css({
							display: "",
							visibility: "hidden",
							left: -99999,
							top: -99999
						});
					} else {
						$fly(dom).css({
							display: "none"
						});
					}
					jQuery.data(dom, TOOLTIP_KEY, this);
					
					return dom;
				} else {
					dom = $invokeSuper.call(this, arguments);
					document.body.appendChild(dom);
					jQuery.data(dom, TOOLTIP_KEY, this);
					
					return dom;
				}
			} else {
				return dom;
			}
		},
		
		/**
		 * 更新Tip的位置。
		 * @param {Event} event dom event.
		 * @protected
		 */
		_updatePosition: function(event) {
			var tip = this;
			if (event) {
				var mouseOffset = tip._mouseOffset || [CONST_MOUSE_POS_ADJ_X, CONST_MOUSE_POS_ADJ_Y];
				$DomUtils.locateIn(tip._dom, {
					position: {
						left: event.pageX + mouseOffset[0],
						top: event.pageY + mouseOffset[1]
					}
				});
			}
		},
		
		/**
		 * 当anchorToTarget设置为false的时候，绑定用户指定的anchorTarget。
		 * @protected
		 */
		bindTarget: function() {
			var element = this._anchorTarget;
			if (element && !this._anchorTargetBinded) {
				$fly(element).hover(elementMouseEnter, elementMouseLeave).mousemove(elementMouseMove);
				this._anchorTargetBinded = true;
			}
			
		},
		
		/**
		 * 当anchorToTarget设置为false的时候，取消绑定用户指定的anchorTarget。
		 * @protected
		 */
		unbindTarget: function() {
			var element = this._anchorTarget;
			if (element && this._anchorTargetBinded) {
				$fly(element).unbind("mousemove", elementMouseMove).unbind("mouseenter", elementMouseEnter).unbind("mouseleave", elementMouseLeave);
				this._anchorTargetBinded = false;
			}
		},
		
		hide: function() {
			var tip = this;
			if (tip._showTimer) {
				clearTimeout(tip._showTimer);
				tip._showTimer = null;
				tip._visible = false;
				
				return;
			}
			
			$invokeSuper.call(this, arguments);
		},
		
		show: function() {
			var tip = this;
			if (tip._hideTimer) {
				clearTimeout(tip._hideTimer);
				tip._hideTimer = null;
				tip._visible = true;
				
				return;
			}
			
			$invokeSuper.call(this, arguments);
		},
		
		/**
		 * 隐藏ToolTip。
		 * @protected
		 */
		doAfterHide: function() {
			var tip = this;
			
			$invokeSuper.call(tip, arguments);
			
			tipCanUsePool.push(tip._dom);
			jQuery.data(tip._dom, DOMS_KEY, tip._doms);
			jQuery.data(tip._dom, TOOLTIP_KEY, null);
			
			tip._rendered = false;
			tip._dom = null;
			tip._doms = null;
		}
	});
	
	/**
	 * @author Frank Zhang (mailto:frank.zhang@bstek.com)
	 * @class 提示信息管理器。
	 * @static
	 */
	dorado.TipManager = {
		_previousTip: null,
		
		/**
		 * 判断某个Html元素是否绑定了ToolTip。
		 * @param {dorado.RenderableElement|HtmlElement} element 要判断是否有ToolTip的HtmlElement。
		 * @return {boolean} 该Html元素是否绑定了ToolTip。
		 */
		hasTip: function(element) {
			return !!dorado.TipManager.getTip(element);
		},
		
		/**
		 * 根据给定的Html元素取得该元素的ToolTip。
		 * @param {dorado.RenderableElement|HtmlElement} element 要取得ToolTip的HtmlElement。
		 * @return {dorado.widget.ToolTip} 取得的ToolTip。
		 */
		getTip: function(element) {
			var result;
			if (element) {
				result = jQuery.data(element, TOOLTIP_KEY);
			}
			return result;
		},
		
		/**
		 * @private
		 */
		allocTip: function(element, options) {
			var result;
			options = options || {};
			options.anchorTarget = element;
			result = new dorado.widget.ToolTip(options);
			result.bindTarget();
			jQuery.data(element, TOOLTIP_KEY, result);
		},
		
		/**
		 * 初始化指定的Html元素的ToolTip的配置信息，如果已经存在过配置信息，则会调用updateTip;如果options为空，则会删除该Html元素绑定的ToolTip。
		 * @param {dorado.RenderableElement|HtmlElement} element 要初始化Tip的HtmlElement。如果类型为dorado.RenderableElement，则会取得其dom属性。
		 * @param {Object} options tip的配置信息。
		 */
		initTip: function(element, options) {
			var manager = this;
			if (element) {
				if (dorado.Object.isInstanceOf(element, dorado.RenderableElement)) {
					element = element._dom;
					if (!element) return;
				}
				if (!options) {
					manager.deleteTip(element);
				} else {
					if (manager.hasTip(element)) {
						manager.updateTip(element, options);
					} else {
						manager.allocTip(element, options);
					}
				}
			}
		},
		
		/**
		 * 更新指定的HtmlElement的tip的配置信息。
		 * @param {dorado.RenderableElement|HtmlElement} element 要初始化Tip的HtmlElement。如果类型为dorado.RenderableElement，则会取得其dom属性。
		 * @param {Object} options tip的配置信息。
		 */
		updateTip: function(element, options) {
			if (dorado.Object.isInstanceOf(element, dorado.RenderableElement)) {
				element = element._dom;
				if (!element) return;
			}
			var tip = dorado.TipManager.getTip(element);
			tip.set(options, options);
		},
		
		/**
		 * 删除指定的HtmlElement的tip。
		 * @param {dorado.RenderableElement|HtmlElement} element 要删除ToolTip的HtmlElement。
		 *          如果类型为dorado.RenderableElement，则会取得其dom属性。
		 */
		deleteTip: function(element) {
			if (dorado.Object.isInstanceOf(element, dorado.RenderableElement)) {
				element = element._dom;
				if (!element) return;
			}
			var tip = dorado.TipManager.getTip(element);
			if (tip) {
				dorado.TipManager.hideTip(tip, false);
				tip.unbindTarget();
				jQuery.data(element, TOOLTIP_KEY, null);
			}
		},
		
		/**
		 * 显示指定的HtmlElement的tip。
		 * @param {HtmlElement} element 要显示系统提示信息的HtmlElement。
		 * @param {int} delay 显示延时，以毫秒作单位。
		 * @param {Event} event 浏览器的event。
		 */
		showTip: function(element, delay, event) {
			var manager = this, tip = dorado.TipManager.getTip(element);
			
			if (tip._autoHide === false && !tip._visible) {
				if (delay) {
					tip._showTimer = setTimeout(function() {
						tip.show({
							element: element,
							event: event
						});
						tip._showTimer = null;
					}, delay);
				} else {
					tip.show({
						element: element,
						event: event
					});
				}
			} else {
				var oldPrevTip = manager._previousTip;
				if (oldPrevTip && oldPrevTip != tip) {
					oldPrevTip.hide();
				}
				if (delay) {
					tip._showTimer = setTimeout(function() {
						tip.show({
							element: element,
							event: event
						});
						tip._showTimer = null;
					}, delay);
				} else {
					tip.show({
						element: element,
						event: event
					});
				}
				manager._previousTip = tip;
			}
			
			return tip;
		},
		
		/**
		 * 隐藏指定的tip。
		 * @param {dorado.widget.ToolTip} tip 要隐藏的tip。
		 * @param {int} delay 隐藏的延时，用毫秒作单位。
		 */
		hideTip: function(tip, delay) {
			var manager = this;
			if (tip) {
				if (manager._previousTip == tip) {
					manager._previousTip = null;
				}
				if (delay) {
					tip._hideTimer = setTimeout(function() {
						tip.hide();
						tip._hideTimer = null;
					}, delay);
				} else {
					tip.hide();
				}
			}
		}
	};
})();

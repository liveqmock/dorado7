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
 * @class 可渲染对象的通用接口。
 * @abstract
 * @extends dorado.AttributeSupport
 */
dorado.RenderableElement = $extend(dorado.AttributeSupport, /** @scope dorado.RenderableElement.prototype */ {
	$className: "dorado.RenderableElement",

	_ignoreRefresh: 0,

	ATTRIBUTES: /** @scope dorado.RenderableElement.prototype */ {

		/**
		 * CSS类名。
		 * @type String
		 * @attribute writeBeforeReady
		 */
		className: {
			writeBeforeReady: true
		},

		/**
		 * 扩展CSS类名。
		 * @type String
		 * @attribute
		 */
		exClassName: {
			skipRefresh: true,
			setter: function(v) {
				if (this._rendered && this._exClassName) {
					$fly(this.getDom()).removeClass(this._exClassName);
				}
				this._exClassName = v;
				if (this._rendered && v) {
					$fly(this.getDom()).addClass(v);
				}
			}
		},

		/**
		 * 宽度。
		 * @type int
		 * @attribute
		 */
		width: {
			setter: function(v) {
				this._width = isFinite(v) ? parseInt(v) : v;
			}
		},

		/**
		 * 高度。
		 * @type int
		 * @attribute
		 */
		height: {
			setter: function(v) {
				this._height = isFinite(v) ? parseInt(v) : v;
			}
		},

		/**
		 * 用于简化DOM元素style属性设置过程的虚拟属性。
		 * 此处用于赋值给style属性的对象是一个结构与HTMLElement的style相似的JavaScript对象。
		 * @type Object|String
		 * @attribute
		 *
		 * @example
		 * // 当我们需要为DOM元素指定背景色和字体颜色时可以使用这样的style
		 * renderable.set("style", {
		 * 	color : "yellow",
		 * 	backgroundColor : "blue"
		 * });
		 *
		 * @example
		 * renderable.set("style", "color: yellow; background-color: blue");
		 */
		style: {
			setter: function(v) {
				if (typeof v == "string" || !this._style) {
					this._style = v;
				}
				else if (v) {
					dorado.Object.apply(this._style, v);
				}
			}
		},

		/**
		 * 指示此对象是否已经渲染过。
		 * @type boolean
		 * @attribute readOnly
		 */
		rendered: {
			readOnly: true
		}
	},

	destroy: function() {
		var dom = this._dom;
		if (dom) {
			delete this._dom;
			if (dorado.windowClosed) {
				$fly(dom).unbind();
			}
			else {
				$fly(dom).remove();
			}
		}
		$invokeSuper.call(this);
	},

	doSet: function(attr, value) {
		$invokeSuper.call(this, [attr, value]);

		var def = this.ATTRIBUTES[attr];
		if (this._rendered && this._ignoreRefresh < 1 && def && !def.skipRefresh) {
			dorado.Toolkits.setDelayedAction(this, "$refreshDelayTimerId", this.refresh, 50);
		}
	},

	/**
	 * 创建对象对应的DOM元素。
	 * <p>
	 * 此方法只会在对象第一次渲染时执行一次。 所以一般而言，不应该在此放置初始化DOM元素的代码。例如那些设置DOM元素的颜色、字体、尺寸的代码。
	 * 而那些而DOM元素绑定事件监听器的代码则适合放置在此方法中。
	 * </p>
	 * @return {HTMLElement} 新创建的DOM元素。
	 */
	createDom: function() {
		return document.createElement("DIV");
	},

	/**
	 * 根据对象自身的属性设定来刷新DOM元素。
	 * <p>
	 * 此方法会在对象每一次被刷新时调用，因此那些设置DOM元素的颜色、字体、尺寸的代码适合放置在此方法中。
	 * </p>
	 * @param {HTMLElement} dom 对应的DOM元素。
	 */
	refreshDom: function(dom) {
		if (dom.nodeType != 3) {
			this.applyStyle(dom);
			this.resetDimension();
		}
	},

	/**
	 * 重设对象的尺寸。
	 * @protected
	 * @param {boolean} [forced] 是否强制重设对象的尺寸，忽略对于宽高值是否发生过改变的判断。
	 * @return {boolean} 本次操作是否改变了对象的尺寸设置。
	 */
	resetDimension: function(forced) {
		var dom = this.getDom(), $dom = $fly(dom), changed = false;
		var width = this.getRealWidth();
		var height = this.getRealHeight();
		if (forced || width && this._currentWidth != width) {
			if (width < 0) {
				this._currentWidth = null;
				dom.style.width = "";
			}
			else {
				this._currentWidth = width;
				if (this._useInnerWidth) {
					$dom.width(width);
				}
				else {
					$dom.outerWidth(width);
				}
			}
			changed = true;
		}
		if (forced || height && this._currentHeight != height) {
			if (height < 0) {
				this._currentHeight = null;
				dom.style.height = "";
			}
			else {
				this._currentHeight = height;
				if (this._useInnerHeight) {
					$dom.height(height);
				}
				else {
					$dom.outerHeight(height);
				}
			}
			changed = true;
		}
		return changed;
	},

	/**
	 * 获得渲染时实际应该采用的宽度值。
	 * <p>
	 * 通过width属性设置的宽度值并不总是该对象实际渲染时所使用的值，实际的宽度常常会受布局管理器或其他类似的功能控制。
	 * 此方法的作用就是返回渲染时实际应该采用的宽度值。
	 * </p>
	 * @return {int|String} 宽度。
	 */
	getRealWidth: function() {
		return (this._realWidth == null) ? this._width : this._realWidth;
	},

	/**
	 * 获得渲染时实际应该采用的高度值。
	 * <p>
	 * 通过width属性设置的高度值并不总是该对象实际渲染时所使用的值，实际的高度常常会受布局管理器或其他类似的功能控制。
	 * 此方法的作用就是返回渲染时实际应该采用的高度值。
	 * </p>
	 * @return {int|String} 宽度。
	 */
	getRealHeight: function() {
		return (this._realHeight == null) ? this._height : this._realHeight;
	},

	applyStyle: function(dom) {
		if (this._style) {
			var style = this._style;
			if (typeof this._style == "string") {
				// 此段处理不能用jQuery.attr("style", style)替代，原因是该方法会覆盖DOM原有的inliine style设置。
				var map = {};
				jQuery.each(style.split(';'), function(i, section) {
					var i = section.indexOf(':');
					if (i > 0) {
						var attr = jQuery.trim(section.substring(0, i));
						var value = jQuery.trim(section.substring(i + 1));
						if (dorado.Browser.msie && attr.toLowerCase() == "filter") {
							dom.style.filter = value;
						}
						else {
							map[attr] = value;
						}
					}
				});
				style = map;
			}
			$fly(dom).css(style);
			delete this._style;
		}
	},

	/**
	 * 返回对象对应的DOM元素。
	 * @return {HTMLElement} 控件对应的DOM元素。
	 */
	getDom: function() {
		if (!this._dom) {
			this._dom = this.createDom();
			var $dom = $fly(this._dom);

			var className = (this._inherentClassName) ? this._inherentClassName : "";
			if (this._className) className += (" " + this._className);
			if (this._exClassName) className += (" " + this._exClassName);
			if (className) $dom.addClass(className);

			this.applyStyle(this._dom);
		}
		return this._dom;
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

		this.refreshDom(dom);
		this._rendered = true;
	},

	/**
	 * 将本对象渲染到指定的DOM容器中。
	 * @param {HTMLElement} containerElement 作为容器的DOM元素。如果此参数为空，将以document.body作为容器。
	 * @param {HTMLElement} [nextChildElement] 指定新的DOM元素要在那个子元素之前插入，即通过此参数可以指定新的DOM元素的插入位置。
	 */
	render: function(containerElement, nextChildElement) {
		this.doRenderToOrReplace(false, containerElement, nextChildElement);
	},

	/**
	 * 本对象并替换指定的DOM对象。
	 * @param {HTMLElement} elmenent 要替换的DOM对象。
	 */
	replace: function(elmenent) {
		this.doRenderToOrReplace(true, elmenent);
	},

	/**
	 * 将对象的DOM节点从其父节点中移除。
	 */
	unrender: function() {
		var dom = this.getDom();
		if (dom && dom.parentNode) dom.parentNode.removeChild(dom);
	},

	/**
	 * 刷新此对象的显示。
	 * @param {boolean} delay 是否允许此次refresh动作延时执行。设置成true有利于系统对refresh动作进行优化处理。
	 */
	refresh: function(delay) {
		if (!this._rendered) return;
		if (delay) {
			dorado.Toolkits.setDelayedAction(this, "$refreshDelayTimerId", function() {
				dorado.Toolkits.cancelDelayedAction(this, "$refreshDelayTimerId");
				this.refreshDom(this.getDom());
			}, 50);
		}
		else {
			dorado.Toolkits.cancelDelayedAction(this, "$refreshDelayTimerId");
			this.refreshDom(this.getDom());
		}
	}
});

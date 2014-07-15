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
 * @class 拖拽指示光标。
 * @extends dorado.RenderableElement
 */
dorado.DraggingIndicator = $extend(dorado.RenderableElement, /** @scope dorado.DraggingIndicator.prototype */ {
	$className: "dorado.DraggingIndicator",
	
	ATTRIBUTES: /** @scope dorado.DraggingIndicator.prototype */ {
	
		className: {
			defaultValue: "d-dragging-indicator"
		},
		
		/**
		 * 当前正被拖拽的对象是否可被放置在当前悬停的位置。
		 * @type boolean
		 * @attribute
		 */
		accept: {
			skipRefresh: true,
			setter: function(v) {
				if (this._accept != v) {
					this._accept = v;
					this.refresh();
				}
			}
		},
		
		/**
		 * 用于指示可放置状态的图标。
		 * @type String
		 * @attribute
		 */
		icon: {},
		
		/**
		 * 用于指示可放置状态的图标的CSS Class。
		 * @type String
		 * @attribute
		 */
		iconClass: {},
		
		/**
		 * 拖拽光标中拖拽内容区域的水平显示偏移值。
		 * @type int
		 * @attribute
		 */
		contentOffsetLeft: {
			defaultValue: 20
		},
		
		/**
		 * 拖拽光标中拖拽内容区域的垂直显示偏移值。
		 * @type int
		 * @attribute
		 */
		contentOffsetTop: {
			defaultValue: 20
		},
		
		/**
		 * 拖拽光标中拖拽内容区域的内容。
		 * @type HTMLElement|jQuery
		 * @attribute writeOnly
		 */
		content: {
			writeOnly: true,
			setter: function(content) {
				if (content instanceof jQuery) {
					content = content[0];
				}
				if (content) {
					content.style.position = "";
					content.style.left = 0;
					content.style.top = 0;
					content.style.right = 0;
					content.style.bottom = 0;
				}
				this._content = content;
			}
		}
	},
	
	constructor: function(config) {
		$invokeSuper.call(this, arguments);
		if (config) this.set(config);
	},
	
	createDom: function() {
		var dom = $DomUtils.xCreate({
			tagName: "div",
			content: [{
				tagName: "div",
				className: "content-container"
			}, {
				tagName: "div"
			}]
		});
		this._contentContainer = dom.firstChild;
		this._iconDom = dom.lastChild;
		return dom;
	},
	
	refreshDom: function(dom) {
		$invokeSuper.call(this, arguments);
		var contentContainer = this._contentContainer, $contentContainer = $fly(this._contentContainer), content = this._content;
		$contentContainer.toggleClass("default-content", (content == null)).left(this._contentOffsetLeft || 0).top(this._contentOffsetTop || 0);
		if (content) {
			if (content.parentNode != contentContainer) $contentContainer.empty().append(content);
		} else {
			$contentContainer.empty();
		}
		
		var w = contentContainer.offsetWidth + (this._contentOffsetLeft || 0);
		var h = contentContainer.offsetHeight + (this._contentOffsetTop || 0);
		$fly(dom).width(w).height(h);
		
		var iconDom = this._iconDom;
		$fly(iconDom).attr("class", "icon");
		var icon = this._icon, iconClass = this._iconClass;
		if (!icon && !iconClass) {
			iconClass = this._accept ? "accept-icon" : "denied-icon";
		}
		if (icon) {
			$DomUtils.setBackgroundImage(iconDom, icon);
		} else if (iconClass) {
			$fly(iconDom).addClass(iconClass);
		}
	}
});

dorado.DraggingIndicator.create = function() {
	return new dorado.DraggingIndicator();
};

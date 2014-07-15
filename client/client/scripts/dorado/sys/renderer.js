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
 * @class 渲染器的通用接口。
 * @abstract
 */
dorado.Renderer = $class(/** @scope dorado.Renderer.prototype */{
	$className: "dorado.Renderer",
	
	/**
	 * 渲染指定的DOM对象。
	 * @param {HTMLElement} dom 要渲染的DOM对象。
	 * @param {Object} arg 渲染参数。
	 */
	render: function(dom, arg) {
	}
});

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @class 空的渲染器。该渲染器不完成任何实际的渲染操作。
 * @static
 */
dorado.Renderer.NONE_RENDERER = new dorado.Renderer();

dorado.Renderer.render = function(renderer, dom, arg) {
	if (renderer instanceof dorado.Renderer) {
		renderer.render(dom, arg);
	} else if (typeof renderer == "function") {
		renderer(dom, arg);
	}
};

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
 * @name jQuery#shadow
 * @function
 * @description 为HTML元素添加阴影效果。
 * <p>
 * 注意：此功能不支持低版本IE（即IE6、7、8）。
 * </p>
 * @param {Object} [options] 选项。
 * @param {String} [options.mode="drop"] 阴影类型，目前有drop、sides、frame这三种类型供选择。
 * @return {jQuery} 调用此方法的jQuery对象自身。
 * @see jQuery#unshadow
 */
jQuery.fn.shadow = function(options) {	
	if (dorado.Browser.msie && dorado.Browser.version < 9) return this;
	
	options = options || {};
	var mode = options.mode || "drop";
	switch (mode.toLowerCase()) {
		case "drop":
			this.addClass("d-shadow-drop");
			break;
		case "sides":
			this.addClass("d-shadow-sides");
			break;
		case "frame":
			this.addClass("d-shadow-frame");
			break;
	}
	return this;
};

/**
 * @name jQuery#unshadow
 * @function
 * @description 移除HTML元素上的阴影效果。
 * @return {jQuery} 调用此方法的jQuery对象自身。
 * @see jQuery#shadow
 */
jQuery.fn.unshadow = function(options) {
	if (dorado.Browser.msie && dorado.Browser.version < 9) return this;
	
	options = options || {};
	var mode = options.mode || "drop";
	switch (mode.toLowerCase()) {
		case "drop":
			this.removeClass("d-shadow-drop");
			break;
		case "sides":
			this.removeClass("d-shadow-sides");
			break;
		case "frame":
			this.removeClass("d-shadow-frame");
			break;
	}
	return this;
};

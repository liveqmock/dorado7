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
 * @name jQuery#xCreate
 * @function
 * @param {Object|Array} template JSON形式定义的组件的模板信息。
 * @param {Object} [arg] JSON形式定义的模板参数。
 * @param {Object} [options] 执行选项。
 * @param {boolean} [options.insertBefore] 是否已插入而不是追加的方式将新创建的元素添加到父对象中。xCreate默认是以appendChild的模式添加新元素的。
 * @param {HTMLElement} [options.refNode] 当使用insertBefore方式添加新元素时，应将新元素插入到哪一个原有的子元素之前。如果不定义此参数，则将插入所有子元素之前。
 * @param {boolean} [options.returnNewElements] 指定此方法是否返回新创建的元素，否则方法返回的是调用者自身。
 * @param {Object} [options.context] 上下文对象，见{@link dorado.util.Dom.xCreate}中的context参数。
 * @return {jQuery} jQuery对象或新创建的元素。
 * @description 根据以JSON形式定义的组件的模板信息快速的插入批量元素。<br>
 * 更多的例子请参考{@link dorado.Dom.xCreate}的文档。
 * @see dorado.util.Dom.xCreate
 *
 * @example
 * // 创建并插入一个按钮
 * jQuery("body").xCreate({
 * 	tagName: "button",
 * 	content: "Click Me",	// 定义按钮的标题
 * 	style: {	// 定义按钮的style
 * 		border: "1px black solid",
 * 		backgroundColor: "white"
 * 	}
 * 	onclick: function() {	// 定义onclick事件
 * 		alert("Button clicked.");
 * 	}
 * });
 */
jQuery.fn.xCreate = function(template, arg, options) {
	var parentEl = this[0];
	var element = $DomUtils.xCreate(template, arg, (options ? options.context : null));
	if (element) {
		var insertBef = false, returnNewElements = false, refNode = null;
		if (options instanceof Object) {
			insertBef = options.insertBefore;
			refNode = (options.refNode) ? options.refNode : parentEl.firstChild;
			returnNewElements = options.returnNewElements;
		}
		
		var elements = (element instanceof Array) ? element : [element];
		for (var i = 0; i < elements.length; i++) {
			if (insertBef && refNode) {
				parentEl.insertBefore(elements[i], refNode);
			} else {
				parentEl.appendChild(elements[i]);
			}
		}
	}
	return returnNewElements ? jQuery(elements) : this;
};

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
 * @component Trigger
 * @class 自定义下拉框。
 * @extends dorado.widget.DropDown
 */
dorado.widget.CustomDropDown = $extend(dorado.widget.DropDown,/** @scope dorado.widget.CustomDropDown.prototype */ {
	$className: "dorado.widget.CustomDropDown",
	
	ATTRIBUTES: /** @scope dorado.widget.CustomDropDown.prototype */ {
	
		/**
		 * 要显示在自定义下拉框中的控件。
		 * @type dorado.widget.Control
		 * @attribute writeBeforeReady
		 */
		control: {
			writeBeforeReady: true,
			innerComponent: ""
		},
			
		view: {
			setter: function(view) {
				if (this._view == view) return;
				$invokeSuper.call(this, [view]);
				if (view && this._control) {
					this._control.set("view", view);
				}
			}
		}
	},
	
	createDropDownBox: function() {
		var box = $invokeSuper.call(this, arguments);
		var control = this._control;
		box.set("control", control);
		box.bind("beforeShow", function() {
			var $box = jQuery(box.getDom().firstChild), boxWidth = $box.width(), boxHeight = $box.height();
			var $dom = jQuery(control.getDom()), realWidth = $dom.outerWidth(), realHeight = $dom.outerHeight(), shouldRefresh;
			if (realWidth < boxWidth) {
				control.set("width", boxWidth);
				shouldRefresh = true;
			}
			if (realHeight < boxHeight) {
				control.set("height", boxHeight);
				shouldRefresh = true;
			}
			if (shouldRefresh) control.refresh();    
		});
		return box;
	}
});




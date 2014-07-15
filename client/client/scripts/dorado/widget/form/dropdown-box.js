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
dorado.widget.DropDownBox = $extend(dorado.widget.FloatContainer, /** @scope dorado.widget.DropDownBox.prototype */ {
	$className: "dorado.widget.DropDownBox",
	_useInnerWidth: true,
	_useInnerHeight: true,

	ATTRIBUTES: /** @scope dorado.widget.DropDownBox.prototype */ {
		className: {
			defaultValue: "d-drop-down-box"
		},

		showAnimateType: {
			defaultValue: "safeSlide"
		},

		hideAnimateType: {
			defaultValue: "none"
		},

		focusAfterShow: {
			defaultValue: false
		},

		continuedFocus: {
			defaultValue: true
		},

		editor: {},

		dropDown: {},

		control: {
			writeOnce: true,
			setter: function(control) {
				if (this._control == control) return;
				this._control = control;
				this.removeAllChildren();
				this.addChild(control);
			}
		}
	},

	EVENTS: /** @scope dorado.widget.DropDownBox.prototype */ {
		onDropDownBoxShow: {}
	},

	constructor: function(config) {
		$invokeSuper.call(this, arguments);
		// this._contentOverflow = "visible"; Commented by Benny for ISSUE 5992
		if (dorado.Browser.msie && dorado.Browser.version < 9) {
			this._showAnimateType = "none";
		}
	},

	doAfterShow: function(editor) {
		$invokeSuper.call(this, arguments);
		this.fireEvent("onDropDownBoxShow", this);
	}
});

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
 * @component General
 * @class 用于容纳一个子视图的控件。
 * @extends dorado.widget.Control
 */
dorado.widget.SubViewHolder = $extend(dorado.widget.Control, /** @scope dorado.widget.SubViewHolder.prototype */ {
	$className: "dorado.widget.SubViewHolder",
	
	ATTRIBUTES: /** @scope dorado.widget.SubViewHolder.prototype */ {
	
		/**
		 * 子视图。
		 * @attribute writeBeforeReady
		 * @type dorado.widget.View
		 */
		subView: {
			writeBeforeReady: true
		}
	},
	
	createDom: function(dom) {
		var dom = document.createElement("DIV");
		var subView = this._subView;
		if (subView) {
			this.registerInnerControl(subView);
			subView.render(dom);
		}
		return dom;
	},
	
	doOnResize: function() {
		if (!this._ready) return;
		var subView = this._subView;
		if (subView) {
			subView._realWidth = this._dom.offsetWidth;
			subView._realHeight = this._dom.offsetHeight;
			subView.resetDimension();
		}
	}

});

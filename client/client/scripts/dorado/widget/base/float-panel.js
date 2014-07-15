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
 * @author Frank Zhang (mailto:frank.zhang@bstek.com)
 * @component Base
 * @class 浮动面板
 * @extends dorado.widget.Panel
 * @extends dorado.widget.FloatControl
 */
dorado.widget.FloatPanel = $extend([dorado.widget.Panel, dorado.widget.FloatControl], /** @scope dorado.widget.FloatPanel.prototype */ {
	$className: "dorado.widget.FloatPanel",
	focusable: true,
	
	ATTRIBUTES: /** @scope dorado.widget.FloatPanel.prototype */ {
		visible: {
			defaultValue: false
		}
	},

    doClose: function(){
        var panel = this;
        panel.hide && panel.hide();
    },

	doShow: function() {
		var panel = this, doms = panel._doms;
		$fly([doms.contentPanel, doms.buttonPanel]).css("display", "");
		
		$invokeSuper.call(this, arguments);
	},
	
	doAfterShow: function() {
		var panel = this;
		panel._minimized = false;
		$invokeSuper.call(this, arguments);
	}
});

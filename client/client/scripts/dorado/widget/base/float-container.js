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
 * @component Base
 * @class 浮动容器。
 * @extend dorado.widget.Container
 * @extend dorado.widget.FloatControl
 */
dorado.widget.FloatContainer = $extend([dorado.widget.Container, dorado.widget.FloatControl], {
	$className: "dorado.widget.FloatContainer",
	focusable: true,

	ATTRIBUTES: {
		visible: {
			defaultValue: false
		}
	}

});

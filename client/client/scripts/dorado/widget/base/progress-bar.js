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
 * @component Base
 * @class 进度条
 * @extends dorado.widget.Control
 */
dorado.widget.ProgressBar = $extend(dorado.widget.Control, /** @scope dorado.widget.ProgressBar.prototype */ {
	$className: "dorado.widget.ProgressBar",
	selectable: false,
	
	ATTRIBUTES: /** @scope dorado.widget.ProgressBar.prototype */ {
		className: {
			defaultValue: "d-progress-bar"
		},
		height: {
			independent: true
		},
        /**
         * 该进度条显示范围的最小值，默认为0。
         * @attribute
         * @default 0
         * @type int|float
         */
		minValue: {
			defaultValue: 0
		},
        /**
         * 该进度条显示范围的最大值，默认为100。
         * @attribute
         * @default 100
         * @type int|float
         */
		maxValue: {
			defaultValue: 100
		},
        /**
         * 该进度条是否显示文字，默认为true。
         * @attribute
         * @default true
         * @type boolean
         */
		showText: {
			defaultValue: true
		},
        /**
         * 进度条当前值
         * @attribute
         * @type int|float
         */
		value: {},
        /**
         * 该进度条限制文本的格式，进度使用{percent}来替换，默认值为{percent}%。
         * @attribute
         * @default "{percent}%"
         * @type String
         */
		textPattern: {
			defaultValue: "{percent}%"
		}
	},

	createDom: function() {
		var bar = this, doms = {}, dom = $DomUtils.xCreate({
			tagName: "div",
			className: bar._className,
			content: [
				{
					tagName: "span",
					className: "msg",
					contextKey: "msg"
				},
				{
					tagName: "span",
					className: "bar",
					contextKey: "bar",
					content: {
						tagName: "span",
						className: "bar-msg",
						contextKey: "barMsg"
					}
				}
			]
		}, null, doms);

		bar._doms = doms;

		return dom;
	},
    
	refreshDom: function(dom) {
		$invokeSuper.call(this, arguments);
		var bar = this, min = bar._minValue, max = bar._maxValue, value = bar._value || 0, doms = bar._doms,
			percent = value / (max - min), showText = bar._showText, pattern = bar._textPattern || "";

		if (percent == 0) {
			$fly(dom).addClass("d-rendering");
		}
		
		if (percent >= 0 && percent <= 1) {
			$fly(doms.bar).css("width", percent * 100 + "%");
		}

		var $msg = $fly([doms.msg, doms.barMsg]).css("width", dom.offsetWidth);
		if (showText) {
			$msg.text(pattern.replace("{percent}", parseInt(percent * 100, 10)));
		} else {
			$msg.empty();
        }
		
		if (percent == 0) {
			$fly(dom).removeClass("d-rendering");
		}
	}
});

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
 * @class FieldSet。
 * <p>
 * 对Html中的FieldSet的封装。
 * </p>
 * @extends dorado.widget.AbstractPanel
 */
dorado.widget.FieldSet = $extend(dorado.widget.AbstractPanel, /** @scope dorado.widget.FieldSet.prototype */{
	$className: "dorado.widget.FieldSet",

    ATTRIBUTES: /** @scope dorado.widget.FieldSet.prototype */ {

        caption: {
            skipRefresh: false
        },

		className: {
			defaultValue: "d-field-set"
		},

        /**
		 * 是否可折叠
		 * @type boolean
		 * @default true
		 * @attribute
		 */
        collapseable: {
	        defaultValue: true,
	        skipRefresh: true,
	        setter: function(value) {
		        this._collapseable = value;
		        if (value) {
			        if (this._rendered) {
				        if (!this._doms.icon) {
					        this._createCollapseButton();
				        } else {
					        $fly(this._doms.icon).css("display", "");
				        }
			        }
		        } else if (this._doms && this._doms.icon) {
			        $fly(this._doms.icon).css("display", "none");
		        }
	        }
        }
	},

	createDom: function() {
		var fieldset = this, doms = {}, dom = $DomUtils.xCreate({
			tagName: "fieldset",
			content: [{
					tagName: "legend",
					className: "field-set-legend",
					contextKey: "captionContainer",
					content: [
						{
							tagName: "span",
                            className: "caption",
							contextKey: "caption",
							content: fieldset._caption
						}
					]
				},
				{
					tagName: "div",
					className: "body",
					contextKey: "body",
					content: {
						contextKey: "contentPanel",
						tagName: "div",
						className: "content-panel"
					}
				}
			]
		}, null, doms);

		fieldset._doms = doms;

		fieldset.initButtons(dom);
		
		if (fieldset._collapsed) {
			$fly(dom).addClass(fieldset._className + "-collapsed");
			$fly(doms.body).css("display", "none");
		}
		if (fieldset._collapseable) {
			fieldset._createCollapseButton();
		}
		 
		// if (fieldset._collapsed) {
		// fieldset._children.each(function(child) {
		// if (child instanceof dorado.widget.Control) {
		// child.setActualVisible(false);
		// }
		// });
		// var buttons = fieldset._buttons;
		// if (buttons) {
		// for (var i = 0, j = buttons.length; i < j; i++) {
		// var button = buttons[i];
		// button.setActualVisible(false);
		// }
		// }
		// $fly(doms.body).css("display", "none");
		// }
		return dom;
	},

    _createCollapseButton: function() {
        var fieldset = this, doms = fieldset._doms, button = document.createElement("span");
        button.className = "collapse-button";
        doms.icon = button;

        jQuery(doms.icon).click(function() {
			fieldset.toggleCollapsed(true);
	    }).addClassOnHover("collapse-button-hover").addClassOnClick("collapse-button-click");

        doms.captionContainer.insertBefore(button, doms.caption);
    },

	refreshDom: function(dom) {
		var fieldset = this;
		$fly(dom)[fieldset._collapsed ? "addClass" : "removeClass"]("i-field-set-collapsed " + fieldset._className + "-collapsed");
		$fly(fieldset._doms.caption).html(fieldset._caption || "&nbsp;");
		$invokeSuper.call(this, arguments);
	},

	_doOnResize: function(collapsed) {
		var fieldset = this, dom = fieldset._dom, doms = fieldset._doms, height = fieldset.getRealHeight();
		if (typeof height == "number" && height > 0) {
			if (collapsed == undefined) {
				collapsed = fieldset._collapsed;
			}
			if (collapsed) {
				$fly(dom).height("auto");
			} else {
                if (collapsed === false && fieldset._heightBeforeCollapse) {
                    height = fieldset._heightBeforeCollapse;
                    fieldset._heightBeforeCollapse = null;
                }
				var buttonPanelHeight = 0, captionCtHeight = 0;
				if (doms.buttonPanel) {
					buttonPanelHeight = $fly(doms.buttonPanel).outerHeight(true);
				}
				if (doms.captionContainer) {
					captionCtHeight = $fly(doms.captionContainer).outerHeight(true);
				}
				var $dom = jQuery(dom), edgeHeight = $dom.edgeHeight();
				$fly(doms.contentPanel).outerHeight(height - captionCtHeight - buttonPanelHeight - edgeHeight);
				$fly(dom).height("auto");
			}
		}
	},

	getContentContainer: function() {
		return this._doms.contentPanel;
	}
});

/**
 * @component Base
 * @class GroupBox
 * <p>
 * 一种风格独特的分组框。
 * </p>
 * @extends dorado.widget.AbstractPanel
 */
dorado.widget.GroupBox = $extend(dorado.widget.AbstractPanel, /** @scope dorado.widget.GroupBox.prototype */{
    $className: "dorado.widget.GroupBox",

	ATTRIBUTES: /** @scope dorado.widget.GroupBox.prototype */{
		className: {
			defaultValue: "d-group-box"
		},

        caption: {
            skipRefresh: false
        },

        /**
		 * 是否可折叠
		 * @type boolean
		 * @default true
		 * @attribute
		 */
        collapseable: {
            defaultValue: true,
	        skipRefresh: true,
	        setter: function(value) {
		        this._collapseable = value;
		        if (value) {
			        if (this._rendered) {
				        if (!this._doms.icon) {
					        this._createCollapseButton();
				        } else {
					        $fly(this._doms.icon).css("display", "");
				        }
			        }
		        } else if (this._doms && this._doms.icon) {
			        $fly(this._doms.icon).css("display", "none");
		        }
	        }
        }
	},

	createDom: function() {
		var groupBox = this, doms = {}, dom = $DomUtils.xCreate({
			tagName: "div",
			className: groupBox._className,
			content: [
				{
					tagName: "div",
					className: "caption-bar",
					contextKey: "captionContainer",
					content: [
						{
							tagName: "div",
							className: "caption",
							content: groupBox._caption,
							contextKey: "caption"
						},
                        {
                            tagName: "div",
                            className: "bar-right"
                        }
					]
				},
				{
					tagName: "div",
					className: "body",
					contextKey: "body",
					content: {
						contextKey: "contentPanel",
						tagName: "div",
						className: "content-panel"
					}
				}
			]
		}, null, doms);

		groupBox._doms = doms;

		groupBox.initButtons(dom);

		if (groupBox._collapsed) {
			$fly(dom).addClass(groupBox._className + "-collapsed");
			$fly(doms.body).css("display", "none");
		}
		if (groupBox._collapseable) {
			groupBox._createCollapseButton();
		}

		// if (groupBox._collapsed) {
		// groupBox._children.each(function(child) {
		// if (child instanceof dorado.widget.Control) {
		// child.setActualVisible(false);
		// }
		// });
		// var buttons = groupBox._buttons;
		// if (buttons) {
		// for (var i = 0, j = buttons.length; i < j; i++) {
		// var button = buttons[i];
		// button.setActualVisible(false);
		// }
		// }
		// $fly(doms.body).css("display", "none");
		// }

		return dom;
	},

    _createCollapseButton: function() {
        var groupbox = this, doms = groupbox._doms;
        var button = document.createElement("div");
        button.className = "collapse-button";
        doms.icon = button;

        jQuery(doms.icon).click(function() {
			groupbox.toggleCollapsed(true);
		}).addClassOnHover("collapse-button-hover").addClassOnClick("collapse-button-click");

        doms.captionContainer.insertBefore(button, doms.caption);
    },

	refreshDom: function(dom){
		var groupBox = this;
	    $fly(dom)[groupBox._collapsed ? "addClass" : "removeClass"](groupBox._className + "-collapsed");
		$fly(groupBox._doms.caption).text(groupBox._caption);
        $invokeSuper.call(this, arguments);
		groupBox._doOnResize();
	},

	_doOnResize: function(collapsed) {
		var groupbox = this, dom = groupbox._dom, doms = groupbox._doms, height = groupbox.getRealHeight();
		if (typeof height == "number" && height > 0) {
			if (collapsed == undefined) {
				collapsed = groupbox._collapsed;
			}
			if (collapsed) {
				$fly(dom).height("auto");
			} else {
                if (collapsed === false && groupbox._heightBeforeCollapse) {
                    height = groupbox._heightBeforeCollapse;
                    groupbox._heightBeforeCollapse = null;
                }
				var buttonPanelHeight = 0, captionCtHeight = 0;
				if (doms.buttonPanel) {
					buttonPanelHeight = $fly(doms.buttonPanel).outerHeight(true);
				}
				if (doms.captionContainer) {
					captionCtHeight = $fly(doms.captionContainer).outerHeight(true);
				}
				$fly(doms.contentPanel).outerHeight(height - captionCtHeight - buttonPanelHeight);
                $fly(dom).height("auto");
			}
		}
	},

	getContentContainer: function() {
		return this._doms.contentPanel;
	}
});

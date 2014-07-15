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

(function(){
    var icons = {
		WARNING: "warning-icon",
		ERROR: "error-icon",
		INFO: "info-icon",
		QUESTION: "question-icon",
        "warning-icon": "warning-icon",
		"error-icon": "error-icon",
		"info-icon": "info-icon",
		"question-icon": "question-icon"
	};
    
    /**
     * @author Frank Zhang (mailto:frank.zhang@bstek.com)
     * @class 信息提示框。
     * <p>
     * 提供确认对话框、信息对话框、单行输入对话框，多行输入对话框。<br />
     * 信息提示框在同一个页面中任意时刻只有一个实例，所以无法做到同时显示几个信息提示框的效果。
     * </p>
     * @static
     */
    dorado.MessageBox = {
        _runStack: [],

        /**
         * 对话框的默认标题。
         */
        defaultTitle: "",

        /**
         * 对话框的最小宽度。
         */
        minWidth: 300,

        /**
         * 对话框的最大宽度。
         */
        maxWidth: 800,

        OK: ["ok"],
        CANCEL: ["cancel"],
        OKCANCEL: ["ok", "cancel"],
        YESNO: ["yes", "no"],
        YESNOCANCEL: ["yes", "no", "cancel"],

        WARNING_ICON: "warning-icon",
        ERROR_ICON: "error-icon",
        INFO_ICON: "info-icon",
        QUESTION_ICON: "question-icon",

        SINGLE_EDITOR: null,

        buttonText: {
            ok: "dorado.baseWidget.MessageBoxButtonOK",
            cancel: "dorado.baseWidget.MessageBoxButtonCancel",
            yes: "dorado.baseWidget.MessageBoxButtonYes",
            no: "dorado.baseWidget.MessageBoxButtonNo"
        },
        
        highlightButtons: ["ok", "yes"],
        declineButtons: [],

        onButtonClick: function(buttonIndex) {
            //log.debug("run stack length:" + dorado.MessageBox._runStack.length);
            var buttonId;
            if (dorado.MessageBox._runStack.length > 0) {
                var config = dorado.MessageBox._runStack[0];

                if (buttonIndex == "close") {
                    if (config.closeAction) {
                        buttonId = config.closeAction;
                    } else {
                        buttonIndex = config.buttons[config.buttons.length - 1];
                    }
                }

                if (typeof config.detailCallback == "function" || typeof config.callback == "function") {
                    if (!buttonId) {
                        buttonId = config.buttons[buttonIndex];
                    }
                    var text = null;
                    if (config.editor != "none") {
                        if (buttonId != "ok") {
                            text = "";
                        } else {
                            switch (config.editor) {
                                case "singleLine":
                                    text = dorado.MessageBox.SINGLE_EDITOR.get("value");
                                    break;
                                case "multiLines":
                                    text = dorado.MessageBox.TEXTAREA.get("value");
                                    break;
                            }
                        }
                    }
                    dorado.MessageBox._callbackConfig = {
                        callback: config.callback,
                        detailCallback: config.detailCallback,
                        buttonId: buttonId,
                        text: text
                    };
                }

                dorado.MessageBox._runStack.splice(0, 1);
            }
            dorado.MessageBox._dialog && dorado.MessageBox._dialog.hide();
        },

        executeCallback: function() {
            if (!dorado.MessageBox._callbackConfig) return;
            var config = dorado.MessageBox._callbackConfig, buttonId = config.buttonId, text = config.text;
            if (typeof config.callback == "function" && (buttonId == "yes" || buttonId == "ok")) {
                config.callback.apply(null, [text]);
            }
            if (typeof config.detailCallback == "function") {
                config.detailCallback.apply(null, [buttonId, text]);
            }
            dorado.MessageBox._callbackConfig = null;
        },

        getDialog: function() {
            if (!dorado.MessageBox._dialog) {
                dorado.MessageBox.defaultTitle = $resource("dorado.baseWidget.MessageBoxDefaultTitle");
                dorado.MessageBox._dialog = new dorado.widget.Dialog({
                    focusAfterShow: false,
                    anchorTarget: window,
                    align: "center",
                    vAlign: "center",
                    width: dorado.MessageBox.maxWidth,
                    resizeable: false,
                    exClassName: "d-message-box",
                    modal: true,
                    modalType: $setting["widget.MessageBox.defaultModalType"] || "transparent",
                    closeAction: "hide",
                    buttons: [ {
                        width: 60,
                        listener: {
                            onClick: function() {
                                dorado.MessageBox.onButtonClick(0);
                            }
                        }
                    }, {
                        width: 60,
                        listener: {
                            onClick: function() {
                                dorado.MessageBox.onButtonClick(1);
                            }
                        }
                    }, {
                        width: 60,
                        listener: {
                            onClick: function() {
                                dorado.MessageBox.onButtonClick(2);
                            }
                        }
                    }]
                });

                dorado.MessageBox._dialog.doOnAttachToDocument = function() {
                    var dialog = this, dom = dialog.getContentContainer(), doms = dialog._doms;
                    dorado.widget.Dialog.prototype.doOnAttachToDocument.apply(dialog, []);
                    if (dom) {
                        dom.appendChild($DomUtils.xCreate({
                            tagName: "div",
                            className: "msg-content",
                            contextKey: "msgContent",
                            content: [ {
                                tagName: "span",
                                className: "msg-icon",
                                contextKey: "msgIcon"
                            }, {
                                tagName: "span",
                                className: "msg-text",
                                contextKey: "msgText",
                                content: dorado.MessageBox._lastText
                            }]
                        }, null, doms));

                        var editorWrap = $DomUtils.xCreate({ tagName: "div", className: "editor-wrap" });

                        doms.editorWrap = editorWrap;

                        var editor = new dorado.widget.TextEditor();
                        editor.render(editorWrap);
                        $fly(editor._dom).css("display", "none");
                        dorado.MessageBox.SINGLE_EDITOR = editor;
                        dialog.registerInnerControl(editor);

                        dom.appendChild(editorWrap);

                        var textareaWrap = $DomUtils.xCreate({
                            tagName: "div",
                            className: "textarea-wrap"
                        });

                        doms.textareaWrap = textareaWrap;

                        var textarea = new dorado.widget.TextArea();
                        textarea.render(textareaWrap);
                        $fly(textarea._dom).css("display", "none");
                        dorado.MessageBox.TEXTAREA = textarea;
                        dialog.registerInnerControl(textarea);

                        dom.appendChild(textareaWrap);

                        dorado.MessageBox.updateText(dorado.MessageBox._lastText, dorado.MessageBox._lastIcon, dorado.MessageBox._lastEditor, dorado.MessageBox._lastValue);
                    }

                    dialog.bind("beforeShow", function(self) {
                        var dom = self._dom;
                        $fly(dom).width(dorado.MessageBox.maxWidth);

                        var doms = self._doms, contentWidth = $fly(doms.msgText).outerWidth(true) + $fly(doms.msgContent).outerWidth() - $fly(doms.msgContent).width();

                        if (contentWidth < dorado.MessageBox.minWidth) {
                            contentWidth = dorado.MessageBox.minWidth;
                        } else if (contentWidth > dorado.MessageBox.maxWidth) {
                            contentWidth = dorado.MessageBox.maxWidth;
                        }
                        var dialogWidth = $fly(dom).width(), panelWidth = $fly(doms.contentPanel).width();
                        self._width = contentWidth + dialogWidth - panelWidth;
                        $fly(dom).width(self._width);
                        self._height = null;
                        self.doOnResize();

                        var options = dorado.MessageBox._runStack[0];
                        var buttons = options.buttons || [], buttonCount = buttons.length, editor = options.editor || "none",
                            dlgButtons = self._buttons;

                        if (editor != "none") {
                            dorado.MessageBox.resetEditorWidth(editor);
                        }

                        for (var i = 0; i < 3; i++) {
                            var button = buttons[i], dlgButton = dlgButtons[i];
                            if (i >= buttonCount) {
                                $fly(dlgButton._dom).css("display", "none");
                            }
                            else {
                                var caption;
                                if (dorado.MessageBox.buttonText[button]) {
                                    caption = $resource(dorado.MessageBox.buttonText[button]);
                                } else {
                                    caption = button;
                                }
                                dlgButton.set("caption", caption);
                                
                                var ui;
                                if (dorado.MessageBox.highlightButtons.indexOf(button) >= 0) {
                                	ui = "highlight";
                                }
                                else if (dorado.MessageBox.declineButtons.indexOf(button) >= 0) {
                                	ui = "decline";
                                }
                                else {
                                	ui = "default";
                                }
                                dlgButton.set("ui", ui);
                                
                                dlgButton.refresh();
                                $fly(dlgButton._dom).css("display", "");
                            }
                        }
                    });

                    dialog.bind("afterShow", function(self) {
                        var buttons = self._buttons, button;
                        if(buttons){
                            button = buttons[0];
                            if(button && button._dom.style.display != "none") {
                                button.setFocus();
                            }
                        }
                    });

                    dialog.bind("beforeHide", function(self, arg) {
                        if (dorado.MessageBox._runStack.length > 0) {
                            arg.processDefault = false; //通知系统不再执行默认的后续动作。
                            dorado.MessageBox.executeCallback();
                            dorado.MessageBox.doShow(dorado.MessageBox._runStack[0]);
                        }
                    });

                    dialog.bind("afterHide", function() {
                        dorado.MessageBox.executeCallback();
                    });

                    dialog.bind("beforeClose", function(self, arg) {
                        dorado.MessageBox.onButtonClick("close");
                        arg.processDefault = false;
                    });
                };

            }
            return dorado.MessageBox._dialog;
        },

        /**
         * 显示提示对话框。
         * @param {String} msg 要显示的提示信息。
         * @param {Object|Function} options 如果提供一个Function类型的参数，则会被当作callback，即用户点击yes、ok后执行的回调函数。
         * 									如果是json类型，则里面的配置选项与show方法一样。
         * @see dorado.MessageBox.show
         */
        alert: function(msg, options) {
            if (typeof options == "function") {
                var callback = options;
                options = {
                    callback: callback
                };
            } else {
                options = options || {};
            }
            options.icon = options.icon == null ? dorado.MessageBox.INFO_ICON : options.icon;
            options.message = msg;
            options.buttons = dorado.MessageBox.OK;
            options.closeAction = "ok";
            dorado.MessageBox.show(options);
        },

        /**
         * 显示确认对话框。
         * @param {String} msg 要显示的提示信息。
         * @param {Object|Function} options 如果提供一个Function类型的参数，则会被当作callback，即用户点击yes、ok后执行的回调函数。
         * 									如果是json类型，则里面的配置选项与show方法一样。
         * @see dorado.MessageBox.show
         */
        confirm: function(msg, options) {
            if (typeof options == "function") {
                var callback = options;
                options = {
                    callback: callback
                };
            } else {
                options = options || {};
            }
            options.icon = options.icon == null ? dorado.MessageBox.QUESTION_ICON : options.icon;
            options.message = msg;
            options.buttons = dorado.MessageBox.YESNO;
            options.closeAction = "no";
            dorado.MessageBox.show(options);
        },

        /**
         * 显示单行输入对话框。
         * @param {String} msg 要显示的提示信息。
         * @param {Object|Function} options 如果提供一个Function类型的参数，则会被当作callback，即用户点击yes、ok后执行的回调函数。
         * 									如果是json类型，则里面的配置选项与show方法一样。
         * @see dorado.MessageBox.show
         */
        prompt: function(msg, options) {
            if (typeof options == "function") {
                var callback = options;
                options = {
                    callback: callback
                };
            } else {
                options = options || {};
            }
            options.message = msg;
            options.buttons = dorado.MessageBox.OKCANCEL;
            options.closeAction = "cancel";
            options.editor = "singleLine";
            dorado.MessageBox.show(options);
        },

        /**
         * 显示多行输入对话框。
         * @param {String} msg 要显示的提示信息。
         * @param {Object|Function} options 如果提供一个Function类型的参数，则会被当作callback，即用户点击yes、ok后执行的回调函数。
         * 									如果是json类型，则里面的配置选项与show方法一样。
         * @see dorado.MessageBox.show
         */
        promptMultiLines: function(msg, options) {
            if (typeof options == "function") {
                var callback = options;
                options = {
                    callback: callback
                };
            } else {
                options = options || {};
            }
            options.message = msg;
            options.buttons = dorado.MessageBox.OKCANCEL;
            options.closeAction = "cancel";
            options.editor = "multiLines";
            dorado.MessageBox.show(options);
        },

        resetEditorWidth: function(editor) {
            var dialog = dorado.MessageBox.getDialog(), doms = dialog._doms, width;
            if (editor == "multiLines" && dorado.MessageBox.TEXTAREA) {
                width = $fly(doms.textareaWrap).outerWidth();
                dorado.MessageBox.TEXTAREA.set("width", width);
            } else if (editor == "singleLine" && dorado.MessageBox.SINGLE_EDITOR) {
                width = $fly(doms.editorWrap).outerWidth();
                dorado.MessageBox.SINGLE_EDITOR.set("width", width);
            }
        },

        updateText: function(text, icon, editor, value) {
            var dialog = dorado.MessageBox.getDialog(), doms = dialog._doms;

            dorado.MessageBox._lastText = text;
            dorado.MessageBox._lastIcon = icon;
            dorado.MessageBox._lastEditor = editor;
            dorado.MessageBox._lastValue = value;

            if (!doms) return;

            text += '';
            if (text) {
                text = text.replace(/&/g, "&amp;").replace(/[<>\"\n]/g, function($1) {
                    switch ($1) {
                        case "<":
                            return "&lt;";
                        case ">":
                            return "&gt;";
                        case "\n":
                            return "<br/>";
                        case "\"":
                            return "&quot;";
                    }
                });
            }

            $fly(doms.msgText).html(text || "&nbsp;");
            $fly(doms.msgIcon).prop("className", "msg-icon");

            if (icon in icons) {
            	icon = icons[icon];
            }
            if (icon) {
                if (icon) $fly(doms.msgIcon).addClass(icon);
                else $fly(doms.msgIcon).css("background-image", "");

                $fly(doms.msgIcon).css("display", "");
                $fly(doms.msgContent).addClass("msg-content-hasicon");
            } else {
                $fly(doms.msgIcon).css("display", "none");
                $fly(doms.msgContent).removeClass("msg-content-hasicon");
            }
            if (dorado.MessageBox.SINGLE_EDITOR) {
                switch (editor) {
                    case "none":
                        $fly(doms.editorWrap).css("display", "none");
                        $fly(dorado.MessageBox.SINGLE_EDITOR._dom).css("display", "none");
                        $fly(dorado.MessageBox.TEXTAREA._dom).css("display", "none");
                        break;
                    case "singleLine":
                        $fly(doms.editorWrap).css("display", "");
                        $fly(dorado.MessageBox.SINGLE_EDITOR._dom).css("display", "");
                        $fly(dorado.MessageBox.TEXTAREA._dom).css("display", "none");
                        dorado.MessageBox.SINGLE_EDITOR.set("value", value || "");
                        break;
                    case "multiLines":
                        $fly(doms.editorWrap).css("display", "");
                        $fly(dorado.MessageBox.SINGLE_EDITOR._dom).css("display", "none");
                        $fly(dorado.MessageBox.TEXTAREA._dom).css("display", "");
                        dorado.MessageBox.TEXTAREA.set("value", value || "");
                        break;
                }
            }
        },

        /**
         * 通过自定义参数显示对话框。
         * @param {Object} options 显示参数。
         * @param {String} options.title dialog显示的标题，如果不配置，取dorado.MessageBox.defaultTitle。
         * @param {String} options.message 要显示的提示信息。
         * @param {String} options.defaultText 如果显示单行或者多行文本框，为文本框的默认值。
         * @param {String} options.icon 目前可选值：WARNING、ERROR、INFO、QUESTION，也可以像其他组件的icon属性一样使用。
         * @param {String} options.editor 目前可选值:single、multiple、none。分别代表单行输入框、多行输入框、无输入框。
         * @param {String[]} options.buttons 要显示的按钮，数组形式。目前最多支持显示3个按钮，每个按钮使用不同的id来显示，目前支持ok(确定)、cancel(取消)、yes(是)、no(否)。
         * @param {String} options.closeAction 如果点击dialog的关闭按钮，对应的buttonId是什么，如果不传入这个值，默认取最后一个button。
         * @param {Function} options.detailCallback 当用户点击不同的按钮的时候执行的回调函数，会传入两个参数：buttonId与text。
         * @param {Function} options.callback 当用户点击yes、ok后执行的回调函数，仅传入一个参数：text。
         */
        show: function(options) {
            dorado.MessageBox._runStack.push(options);
            if (dorado.MessageBox._runStack.length > 1) {
                return;
            }
            dorado.MessageBox.doShow(options);
        },

        doShow: function(options) {
            options = options || {};

            var dialog = dorado.MessageBox.getDialog(), msg = options.message, defaultText = options.defaultText,
                title = options.title || dorado.MessageBox.defaultTitle, icon = options.icon,
                editor = options.editor || "none";

            dorado.MessageBox.updateText(msg, icon, editor, defaultText);

            dialog.set({ caption: title });
            dialog.show();
        }
    };
})();

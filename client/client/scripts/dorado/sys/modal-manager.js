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
 * @class dorado浮动组件模态管理器。
 * <p>
 * 当需要为绝对定位元素显示模态背景的时候，可以调用该类的show和hide方法。
 * </p>
 * <p>
 * 该类有一个堆栈来保存调用模态背景的顺序，这样可以支持已经模态的组件弹出另外一个模态的组件这种复杂的情况。
 * </p>
 * @static
 */
dorado.ModalManager = {
    _controlStack : [],
    /**
     * @private
     */
    getMask : function() {
        var manager = dorado.ModalManager, maskDom = manager._dom;
        if (!maskDom) {
            maskDom = manager._dom = document.createElement("div");
            $fly(maskDom).mousedown(function(evt) {
                var repeat = function(fn, times, delay) {
                    var first = true;
                    return function() {
                        if (times-- >= 0) {
                            if (first) {
                                first = false;
                            } else {
                                fn.apply(null, arguments);
                            }
                            var args = Array.prototype.slice.call(arguments);
                            var self = arguments.callee;
                            setTimeout(function() {
                                self.apply(null, args)
                            }, delay);
                        }
                    };
                };
                if (!dorado.Browser.msie && evt.target == maskDom) {
                    var stack = manager._controlStack, stackEl = stack[stack.length - 1], dom;
                    if (stackEl)
                        dom = stackEl.dom;
                    if (dom) {
                        var control = dorado.widget.Control.findParentControl(dom);
                        if (control) {
                            var count = 1, fn = repeat(function() {
                                dorado.widget.setFocusedControl(count++ % 2 == 1 ? control : null);
                            }, 3, 100);
                            fn();
                        }
                    }
                }
				
				evt.stopPropagation();
				evt.preventDefault();
				evt.returnValue = false;
				return false;
            }).mouseenter(function(evt) {
				evt.stopPropagation();
				evt.preventDefault();
				evt.returnValue = false;
				return false;
			}).mouseleave(function(evt) {
				evt.stopPropagation();
				evt.preventDefault();
				evt.returnValue = false;
				return false;
			});
            $fly(document.body).append(maskDom);
        }
        manager.resizeMask();

        return maskDom;
    },

    resizeMask : function() {
        var manager = dorado.ModalManager, maskDom = manager._dom;
        if (maskDom) {
            var doc = maskDom.ownerDocument, bodyHeight = $fly(doc).height(), bodyWidth;
            if (dorado.Browser.msie) {
                if (dorado.Browser.version == 6) {
                    bodyWidth = $fly(doc).width()
                        - (parseInt($fly(doc.body).css("margin-left"), 10) || 0)
                        - (parseInt($fly(doc.body).css("margin-right"), 10) || 0);
                    $fly(maskDom).width(bodyWidth - 2).height(bodyHeight - 4);
                } else if (dorado.Browser.version == 7) {
                    $fly(maskDom).height(bodyHeight);
                } else {
                    $fly(maskDom).height(bodyHeight - 4);
                }
            } else {
                $fly(maskDom).height(bodyHeight - 4);
            }
        }
    },

    /**
     * 为一个html element显示模态背景。<br />
     * 当一个html element需要显示模态背景的时候，就需要调用该方法，即使目前已经显示了模态背景。
     *
     * @param {HtmlElement} dom 要显示模态背景的元素
     * @param {String}  [maskClass="d-modal-mask"] 显示的模态背景使用的className
     */
    show: function(dom, maskClass) {
        var manager = dorado.ModalManager, stack = manager._controlStack, maskDom = manager.getMask();
        if (dom) {
            maskClass = maskClass || "d-modal-mask";
            $fly(maskDom).css({
                display : ""
            }).bringToFront();

            stack.push({
                dom: dom,
                maskClass: maskClass,
                zIndex : maskDom.style.zIndex
            });

            $fly(dom).bringToFront();
            setTimeout(function() {
                $fly(maskDom).prop("class", maskClass);
            }, 0);
        }
    },

    /**
     * 隐藏一个html element的模态背景。<br />
     * 在一个显示了模态背景的html element隐藏后，需要调用该方法，该方法会根据是否还有其他显示模态背景的html
     * element显示，自动决定是否隐藏模态背景。
     *
     * @param {HtmlElement} dom 要隐藏模态背景的元素
     */
    hide: function(dom) {
        var manager = dorado.ModalManager, stack = manager._controlStack, maskDom = manager.getMask();
        if (dom) {
            if (stack.length > 0) {
                var target = stack[stack.length - 1];
                if (target && target.dom == dom) {
                    stack.pop();
                } else {
                    for (var i = 0, j = stack.length; i < j; i++) {
                        if (dom == (stack[i] || {}).dom) {
                            stack.removeAt(i);
                            break;
                        }
                    }
                }

                if (stack.length == 0) {
                    $fly(maskDom).prop("class", "").css("display", "none");
                } else {
                    target = stack[stack.length - 1];
                    $fly(maskDom).css({
                        zIndex : target.zIndex
                    }).prop("class", target.maskClass);
                }
            }
        }
    }
};

$fly(window).bind("resize", function() {
    if (dorado.ModalManager.onResizeTimerId) {
        clearTimeout(dorado.ModalManager.onResizeTimerId);
        delete dorado.ModalManager.onResizeTimerId;
    }

    dorado.ModalManager.onResizeTimerId = setTimeout(function() {
        delete dorado.ModalManager.onResizeTimerId;
        dorado.ModalManager.resizeMask();
    }, 20);
});

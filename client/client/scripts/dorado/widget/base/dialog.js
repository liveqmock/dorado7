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

(function() {
	var handleConfigMap = {
		"dialog-header-left": { cursor: "nw-resize", horiStyle: "left width", vertStyle: "top height", widthRatio: -1, heightRatio: -1},
		"dialog-header-right": { cursor: "ne-resize", horiStyle: "width", vertStyle: "top height", widthRatio: 1, heightRatio: -1 },
		"dialog-header-center": { cursor: "n-resize", horiStyle: "", vertStyle: "top height", widthRatio: 1, heightRatio: -1},
		"dialog-body-left": { cursor: "w-resize", horiStyle: "left width", vertStyle: "", widthRatio: -1, heightRatio: 1 },
		"dialog-body-right": { cursor: "e-resize", horiStyle: "width", vertStyle: "", widthRatio: 1, heightRatio: 1 },
		"dialog-footer-left": { cursor: "sw-resize", horiStyle: "left width", vertStyle: "height", widthRatio: -1, heightRatio: 1 },
		"dialog-footer-right": { cursor: "se-resize", horiStyle: "width", vertStyle: "height", widthRatio: 1, heightRatio: 1 },
		"dialog-footer-center": { cursor: "s-resize", horiStyle: "", vertStyle: "height", widthRatio: 1, heightRatio: 1 }
	};

	var useDraggingFakeDialog = (dorado.Browser.msie && dorado.Browser.version < 9);
	var fakeDialog, fullWindowDialogs = [];

	dorado.bindResize(function() {
		var docWidth = jQuery(window).width(), docHeight = jQuery(window).height();
		for(var i = 0, j = fullWindowDialogs.length; i < j; i++) {
			var dialog = fullWindowDialogs[i];
			if (dialog && !dialog._maximizeTarget) {
				dialog.set({ width: docWidth, height: docHeight });
			}
		}
	});

	/**
	 * @author Frank Zhang (mailto:frank.zhang@bstek.com)
	 * @component Base
	 * @class 对话框
	 * <p>
	 * 默认提供了最大化、最小化、标题拖动、拖拽大小的功能，以及有自己的皮肤。<br />
	 * 如果不需要这些功能，可以考虑使用FloatPanel实现。
	 * </p>
	 * @extends dorado.widget.FloatPanel
	 */
	dorado.widget.Dialog = $extend(dorado.widget.FloatPanel, /** @scope dorado.widget.Dialog.prototype */ {
		$className: "dorado.widget.Dialog",
		_inherentClassName: "i-dialog",

		ATTRIBUTES: /** @scope dorado.widget.Dialog.prototype */ {
			className: {
				defaultValue: "d-dialog"
			},

			/**
			 * 对话框的最小宽度，建议不要小于200。<br />
			 * 注意：该属性不会在通过设置width、height的时候生效，只会在resize的生效。
			 * @attribute
			 * @default 200
			 * @type int
			 */
			minWidth: {
				defaultValue: 200
			},

			/**
			 * 对话框的最小高度，建议不要小于100。<br />
			 * 注意：该属性不会在通过设置width、height的时候生效，只会在resize的生效。
			 * @attribute
			 * @default 100
			 * @type int
			 */
			minHeight: {
				defaultValue: 100
			},

			/**
			 * 对话框的最大宽度，默认不限制。<br />
			 * 注意：该属性不会在通过设置width、height的时候生效，只会在resize的生效。
			 * @attribute
			 * @type int
			 */
			maxWidth: {},

			/**
			 * 对话框的最大高度，默认不限制。<br />
			 * 注意：该属性不会在通过设置width、height的时候生效，只会在resize的生效。
			 * @attribute
			 * @type int
			 */
			maxHeight: {},

			/**
			 * 对话框是否可拖拽。
			 * @attribute
			 * @default true
			 * @type boolean
			 */
			draggable: {
				defaultValue: true
			},

			/**
			 * 对话框是否可以拖出window。
			 * 该属性在7.3.0版本以后，在对话框进行resize的时候，也可以控制对话框是否可以拖出当前窗口。
			 * @attribute writeBeforeReady
			 * @type boolean
			 */
			dragOutside: {
				defaultValue: false
			},

			center: {
				defaultValue: true
			},

			modal: {
				defaultValue: true
			},

			/**
			 * 对话框是否可以改变尺寸。
			 * @attribute
			 * @default true
			 * @type boolean
			 */
			resizeable: {
				defaultValue: true,
                setter: function(value) {
                    this._resizeable = value;
                    if (this._dom)
                        if (this._resizeable) {
                            $fly(this._dom).addClass("i-dialog-resizeable d-dialog-resizeable").find(".dialog-resize-handle").draggable("enable");
                        } else {
                            $fly(this._dom).removeClass("i-dialog-resizeable d-dialog-resizeable").find(".dialog-resize-handle").draggable("disable");
                        }
                }
            },

			/**
			 * 默认为window对象，可以是dorado的组件、dom对象、dom对象的jQuery选择符。
			 * @attribute
			 * @type String|Object|dorado.RenderableElement
			 */
			maximizeTarget: {},

			/**
			 * 是否显示最小化按钮.
			 * @attribute
			 * @default false
			 * @type boolean
			 */
			minimizeable: {
				defaultValue: false,
				setter: function(value) {
					var dialog = this, captionBar = dialog._captionBar, button;
					dialog._minimizeable = value;
					if (captionBar) {
						if (value) {
							button = captionBar.getButton(dialog._uniqueId + "_minimize");
							if (button) {
								$fly(button._dom).css("display", "");
							}
							else {
								dialog._createMinimizeButton();
							}
						}
						else {
							button = captionBar.getButton(dialog._uniqueId + "_minimize");
							if (button) {
								$fly(button._dom).css("display", "none");
							}
						}
					}
				}
			},

			/**
			 * 对话框是否已经最小化。
			 * @attribute
			 * @default false
			 * @type boolean
			 */
			minimized: {
				setter: function(value) {
					this._minimized = value;
					if (this._minimizeable) {
						if (value) {
							this.minimize();
						}
						else {
							this.show();
						}
					}
				}
			},

			closeable: {
				defaultValue: true
			},

			shadowMode: {
				defaultValue: "frame",
				skipRefresh: true
			},

			animateType: {
				defaultValue: dorado.Browser.msie ? "none" : "zoom"
			}
		},

		EVENTS: /** @scope dorado.widget.Dialog.prototype */ {
			/**
			 * 在对话框最大化之前触发此事件。
			 * @param {Object} self 事件的发起者，即组件本身。
			 * @param {Object} arg 事件参数。
			 * @return {boolean} 是否要继续后续事件的触发操作，不提供返回值时系统将按照返回值为true进行处理。
			 * @event
			 */
			beforeMaximize: {},

			/**
			 * 在对话框最大化之后触发此事件。
			 * @param {Object} self 事件的发起者，即组件本身。
			 * @param {Object} arg 事件参数。
			 * @return {boolean} 是否要继续后续事件的触发操作，不提供返回值时系统将按照返回值为true进行处理。
			 * @event
			 */
			onMaximize: {},

			/**
			 * 在对话框最小化之前触发此事件。
			 * @param {Object} self 事件的发起者，即组件本身。
			 * @param {Object} arg 事件参数。
			 * @return {boolean} 是否要继续后续事件的触发操作，不提供返回值时系统将按照返回值为true进行处理。
			 * @event
			 */
			beforeMinimize: {},

			/**
			 * 在对话框最小化之后触发此事件。
			 * @param {Object} self 事件的发起者，即组件本身。
			 * @param {Object} arg 事件参数。
			 * @return {boolean} 是否要继续后续事件的触发操作，不提供返回值时系统将按照返回值为true进行处理。
			 * @event
			 */
			onMinimize: {}
		},

		doSetFocus: function() {
			var dialog = this;
			if (dialog._dom) {
				//下面这句话有可能会导致IE8下无法bringToFront
				try {
					dialog._dom.focus();
				}
				catch(e) {
				}
			}
		},

		applyDraggable: function() {
			// do nothing
		},

		doOnAttachToDocument: function() {
			$invokeSuper.call(this, arguments);
		},

		doHandleOverflow: function(options) {
			var dialog = this;
			dialog._height = options.maxHeight;
		},

		maximizeRestore: function() {
			var dialog = this, dom = dialog._dom, doms = dialog._doms;
			if (dom) {
				$fly(doms.contentPanel).css("display", "");

				if (dialog._maximizedDirty || dialog._maximized) {
					dialog._maximized = false;
					dialog._width = dialog._originalWidth;
					dialog._height = dialog._originalHeight;
					dialog._left = dialog._originalLeft;
					dialog._top = dialog._originalTop;
					dialog.refresh();

					if (dialog._left !== undefined && dialog._top !== undefined) {
						$fly(dom).css({ left: dialog._left, top: dialog._top });
					}

					var captionBar = dialog._captionBar;
					if (captionBar) {
						var button = captionBar.getButton(dialog._uniqueId + "_maximize");
						if (button) {
							$fly(button._dom).prop("className", "d-maximize-button");
							button._className = "d-maximize-button";
						}
					}

					var $dom = jQuery(dom);
					if (dialog._resizeable) {
						$dom.addClass("d-dialog-resizeable").find(".dialog-resize-handle").draggable("enable");
					}

					if (dialog._draggable) {
						$dom.addClass("d-dialog-draggable").draggable("enable");
					}

					fullWindowDialogs.remove(dialog);
				}
			}
		},

		maximize: function() {
			var dialog = this, dom = dialog._dom;
			if (dom) {
				var eventArg = {};
				dialog.fireEvent("beforeMaximize", dialog, eventArg);
				if (eventArg.processDefault === false) {
					return;
				}

				dialog._maximized = true;
				dialog._originalWidth = dialog._width;
				dialog._originalHeight = dialog._height;
				dialog._originalLeft = dialog._left;
				dialog._originalTop = dialog._top;

				var maximizeTarget = dialog._maximizeTarget, originalMaimizeTarget = maximizeTarget;
				if (maximizeTarget == "parent") {//为floating为false的Dialog提供最大化的功能。
					maximizeTarget = dialog._dom.parentNode;
				}
				else if (typeof maximizeTarget == "String") {
					maximizeTarget = jQuery(maximizeTarget)[0];
				}
				else if (maximizeTarget && dorado.Object.isInstanceOf(maximizeTarget, dorado.RenderableElement)) {
					maximizeTarget = maximizeTarget._dom;
				}

				if (maximizeTarget) {
					dialog._width = $fly(maximizeTarget).outerWidth(true);
					dialog._height = $fly(maximizeTarget).outerHeight(true);
				}
				else {
					dialog._width = $fly(window).width();
					dialog._height = $fly(window).height();
				}

				var captionBar = dialog._captionBar;
				if (captionBar) {
					var button = captionBar.getButton(dialog._uniqueId + "_maximize");
					if (button) {
						$fly(button._dom).prop("className", "d-restore-button");
						button._className = "d-restore-button";
					}
				}

				//TODO 这个算法有问题，待优化。
				var targetOffset;
				if (originalMaimizeTarget == "parent") {
					targetOffset = {left: 0, top: 0};
				}
				else {
					targetOffset = $fly(maximizeTarget).offset() || {left: 0, top: 0};
				}

				dialog._left = targetOffset.left;
				dialog._top = targetOffset.top;

				var domEl = jQuery(dom);
				domEl.css(targetOffset);

				if (dialog._resizeable) {
					domEl.removeClass("d-dialog-resizeable").find(".dialog-resize-handle").draggable("disable");
				}

				if (dialog._draggable) {
					domEl.removeClass("d-dialog-draggable").draggable("disable");
				}

				dialog.refresh();

				fullWindowDialogs.push(dialog);
				dialog.fireEvent("onMaximize", dialog);
			}
		},

		minimize: function() {
			var dialog = this, dom = dialog._dom;
			if (dom) {
				var eventArg = { processDefault: true };
				dialog.fireEvent("beforeMinimize", dialog, eventArg);
				if (!eventArg.processDefault) return;
				dialog._minimized = true;
				dialog.hide();
				dialog.fireEvent("onMinimize", dialog);
			}
		},

		doSetCollapsed: function(collapsed) {
			$invokeSuper.call(this, arguments);
			var dialog = this;
			if (dialog._resizeable) {
				if (collapsed) {
					jQuery(dialog._dom).removeClass("d-dialog-resizeable").find(".dialog-resize-handle").draggable("disable");
				}
				else {
					jQuery(dialog._dom).addClass("d-dialog-resizeable").find(".dialog-resize-handle").draggable("enable");
				}
			}
		},

		_doOnResize: function(collapsed) {
			var dialog = this, dom = dialog._dom, doms = dialog._doms, height = dialog.getRealHeight(), width = dialog.getRealWidth();

			if (typeof width == "string") {
				if (width.indexOf("%") == -1) {
					width = parseInt(width, 10);
				}
				else {
					width = jQuery(window).width() * parseInt(width.replace("%", ""), 10) / 100;
				}
			}

			if (typeof height == "string") {
				if (height.indexOf("%") == -1) {
					height = parseInt(height, 10);
				}
				else {
					height = $fly(window).height() * parseInt(height.replace("%", ""), 10) / 100;
				}
			}

			if (typeof height == "number" && height > 0) {
				if (collapsed === undefined) {
					collapsed = dialog._collapsed;
				}
				if (collapsed) {
					$fly(dom).height("auto");
				}
				else {
					var headerHeight = $fly(doms.header).outerHeight(true), footerHeight = $fly(doms.footer).outerHeight(true),
						captionBarHeight = 0, buttonPanelHeight = 0;

					if (doms.captionBar) {
						captionBarHeight = $fly(doms.captionBar).outerHeight(true)
					}

					if (doms.buttonPanel) {
						buttonPanelHeight = $fly(doms.buttonPanel).outerHeight(true);
					}

					$fly(doms.contentPanel).outerHeight(height - headerHeight - footerHeight - captionBarHeight - buttonPanelHeight);
					//$fly(doms.bodyWrap).outerHeight(height - headerHeight - bottomHeight);
					if (dorado.Browser.msie && dorado.Browser.version == 6) {
						$fly([doms.bodyWrap, doms.header, dialog.footer, doms.headerCenter, doms.bodyLeft, doms.bodyRight]).css("zoom", "").css("zoom", 1);
					}
				}
			}
			else {
				$fly(doms.contentPanel).css("height", "");
				if (dorado.Browser.msie && dorado.Browser.version == 6) {
					$fly([doms.bodyWrap, doms.header, dialog.footer, doms.headerCenter, doms.bodyLeft, doms.bodyRight]).css("zoom", "").css("zoom", 1);
				}
			}
			$fly(dom).css("height", "");

			if (typeof width == "number" && width > 0) {
				$fly(dom).outerWidth(width);
			}
		},

		_createMinimizeButton: function() {
			var dialog = this, captionBar = dialog._captionBar;
			if (captionBar) {
				captionBar.addButton(new dorado.widget.SimpleButton({
					className: "d-minimize-button",
					onCreate: function() {
						this._uniqueId = dialog._uniqueId + "_minimize";
					},
					onClick: function() {
						if (!dialog._minimized) {
							dialog.minimize();
						}
					}
				}), 102);
			}
		},

		createDom: function() {
			var dialog = this, doms = {}, dom = $DomUtils.xCreate({
				tagName: "div",
				className: dialog._className,
				style: {
					visibility: dialog._visible ? "visible" : "hidden"
				},
				content: [
					{
						tagName: "div",
						className: "dialog-header",
						contextKey: "header",
						content: [
							{
								tagName: "div",
								className: "dialog-header-left dialog-resize-handle",
								contextKey: "headerLeft"
							},
							{
								tagName: "div",
								className: "dialog-header-right dialog-resize-handle",
								contextKey: "headerRight"
							},
							{
								tagName: "div",
								className: "dialog-header-center dialog-resize-handle",
								contextKey: "headerCenter"
							}
						]
					},
					{
						tagName: "div",
						className: "dialog-body-wrap",
						contextKey: "bodyWrap",
						content: [
							{
								tagName: "div",
								className: "dialog-body-left dialog-resize-handle",
								contextKey: "bodyLeft"
							},
							{
								tagName: "div",
								className: "dialog-body-right dialog-resize-handle",
								contextKey: "bodyRight"
							},
							{
								tagName: "div",
								className: "dialog-body",
								contextKey: "body",
								content: {
									tagName: "div",
									className: "content-panel",
									contextKey: "contentPanel"
								}
							}
						]
					},
					{
						tagName: "div",
						className: "dialog-footer",
						contextKey: "footer",
						content: [
							{
								tagName: "div",
								className: "dialog-footer-left dialog-resize-handle",
								contextKey: "footerLeft"
							},
							{
								tagName: "div",
								className: "dialog-footer-right dialog-resize-handle",
								contextKey: "footerRight"
							},
							{
								tagName: "div",
								className: "dialog-footer-center dialog-resize-handle",
								contextKey: "footerCenter"
							}
						]
					}
				]
			}, null, doms);

			dialog._doms = doms;

			var showCaptionBar = dialog._showCaptionBar;

			if (showCaptionBar !== false) {
				var tools = dialog._tools, toolButtons = [];

				if (tools instanceof Array) {
					for(var i = 0, j = tools.length; i < j; i++) {
						var tool = tools[i];
						if (tool) {
							toolButtons.push(tool);
						}
					}
				}

				var captionBar = dialog._captionBar = new dorado.widget.CaptionBar({
					className: "d-dialog-caption-bar",
					caption: dialog.get("caption") || dialog._caption,
					icon: dialog._icon,
					iconClass: dialog._iconClass,
					buttons: toolButtons
				});
				dialog.registerInnerControl(captionBar);
				captionBar.render(doms.body.parentNode, doms.body);

				doms.captionBar = captionBar._dom;
				$DomUtils.disableUserSelection(doms.captionBar);
			}

			dialog.initButtons();

			if (dialog._minimizeable) {
				dialog._createMinimizeButton();
			}

			if (dialog._maximizeable) {
				dialog._createMaximizeButton();
			}

			if (dialog._closeable) {
				dialog._createCloseButton();
			}

			if (dialog._collapseable) {
				dialog._createCollapseButton();
			}

			if (dialog._draggable && showCaptionBar !== false) {
				jQuery(dom).addClass("d-dialog-draggable").css("position", "absolute").draggable({
					iframeFix: true,
					addClasses: false,
					handle: ".d-dialog-caption-bar",
					cursor: "move",
					distance: 10,
					containment: dialog._dragOutside ? null : "parent",
					helper: function() {
						if (useDraggingFakeDialog) {
							if (!fakeDialog) {
								fakeDialog = new dorado.widget.Dialog({ exClassName: "d-dialog-helper", visible: true, animateType: "none", shadowMode: "none" });
								fakeDialog.render(dialog._dom.parentNode);
							}
							fakeDialog.render(dialog._dom.parentNode);
							$fly(fakeDialog._dom).css("display", "");

							var height = dialog.getRealHeight();
							if (height == null) {
								height = $fly(dom).height();
							}
							fakeDialog.set({
								width: dom.offsetWidth,
								height: height,
								caption: dialog.get("caption"),
								icon: dialog._icon,
								iconClass: dialog._iconClass,
								minimizeable: dialog._minimizeable,
								maximizeable: dialog._maximizeable,
								closeable: dialog._closeable,
								collapseable: dialog._collapseable,
								left: dialog._left,
								top: dialog._top,
								collapsed: dialog._collapsed
							});
							fakeDialog.refresh();
							return fakeDialog._dom;
						}
						else {
							return dom;
						}
					},
					start: function(event, ui) {
						if (useDraggingFakeDialog) {
							var helper = ui.helper;
							helper.css({ display: "", visibility: "" }).bringToFront();
							$fly(dom).addClass("d-dialog-dragging").css("visibility", "hidden");
						}
					},
					stop: function(event, ui) {
						if (useDraggingFakeDialog) {
							var helper = ui.helper, left = parseInt(helper.css("left"), 10), top = parseInt(helper.css("top"), 10);
							$fly(dom).removeClass("d-dialog-dragging").css({
								visibility: "",
								left: left,
								top: top
							});
							dialog._left = left;
							dialog._top = top;

							/* this is the big hack that breaks encapsulation */
							$.ui.ddmanager.current.cancelHelperRemoval = true;

							ui.helper.css("display", "none");
						}
					}
				});
			}

			if (dialog._resizeable) {
				var dialogXY, dialogSize, dialogHelperOffset, bodyRect;

				jQuery(dom).addClass("d-dialog-resizeable").find(".dialog-resize-handle").each(function(index, handle) {
					var className = handle.className.split(" ")[0], config = handleConfigMap[className];
					if (!config) return;
					jQuery(handle).draggable({
						iframeFix: true,
						cursor: config.cursor,
						addClasses: false,
						containment: "parent",
						helper: function() {
							var proxy = document.createElement("div");
							proxy.className = "d-dialog-drag-proxy";
							proxy.style.position = "absolute";

							var $dom = $fly(dom);
							dialogXY = $dom.offset();

							dialogSize = [$dom.width(), $dom.height()];

							proxy.style.left = (dialog._left || 0) + "px";
							proxy.style.top = (dialog._top || 0) + "px";

							dom.parentNode.appendChild(proxy);

							var helperOffset = $fly(proxy).offset();
							dialogHelperOffset = {
								left: (dialog._left || 0) - helperOffset.left,
								top: (dialog._top || 0) - helperOffset.top
							};

							$fly(proxy).bringToFront().outerWidth(dialogSize[0]).outerHeight(dialogSize[1]).css("cursor", config.cursor);

							return proxy;
						},

						start: function(event, ui) {
							var bodyEl = $fly(document.body), width = bodyEl.outerWidth(true), height = bodyEl.outerHeight(true), offset = bodyEl.offset();
							bodyRect = {
								left: offset.left,
								top: offset.top,
								right: offset.left + width,
								bottom: offset.top + height
							};
						},

						drag: function(event, ui) {
							var horiStyle = config.horiStyle, vertStyle = config.vertStyle, heightRatio = config.heightRatio, widthRatio = config.widthRatio,
								minWidth = dialog._minWidth || 200, minHeight = dialog._minHeight || 100, maxWidth = dialog._maxWidth, maxHeight = dialog._maxHeight;

							ui.position = {
								left: $fly(dom).offset().left,
								top: $fly(dom).offset().top
							};

							var inst = jQuery.data(this, "ui-draggable"), horiChange = event.pageX - inst.originalPageX,
								vertChange = event.pageY - inst.originalPageY, width, height, horiOverflowOffset, vertOverflowOffset;

							var helper = ui.helper, position = ui.position, widthFlag = false, heightFlag = false;

							position.left += dialogHelperOffset.left;
							position.top += dialogHelperOffset.top;

							if (horiStyle.indexOf("width") != -1) {
								width = dialogSize[0] + widthRatio * horiChange;
								if (width < minWidth) {
									horiOverflowOffset = width - minWidth;
									width = minWidth;
									widthFlag = true;
								}

								if (maxWidth && width > maxWidth) {
									horiOverflowOffset = width - maxWidth;
									width = maxWidth;
									widthFlag = true;
								}
							}

							if (vertStyle.indexOf("height") != -1) {
								height = dialogSize[1] + heightRatio * vertChange;
								if (height < minHeight) {
									vertOverflowOffset = height - minHeight;
									height = minHeight;
									heightFlag = true;
								}

								if (maxHeight && height > maxHeight) {
									vertOverflowOffset = height - maxHeight;
									height = maxHeight;
									heightFlag = true;
								}
							}

							if (horiStyle.indexOf("left") != -1) {
								if (!widthFlag) {
									position.left = dialogXY.left + horiChange;
								}
								else {
									position.left = dialogXY.left + horiChange + horiOverflowOffset;
								}
							}

							if (vertStyle.indexOf("top") != -1) {
								if (!heightFlag) {
									position.top = dialogXY.top + vertChange;
								}
								else {
									position.top = dialogXY.top + vertChange + vertOverflowOffset;
								}
							}

							if (!dialog._dragOutside) {
								var helperRect = {
									left: position.left,
									top: position.top,
									right: position.left + width,
									bottom: position.top + height
								};

								if (helperRect.left < bodyRect.left) {
									position.left = bodyRect.left;
									width = helperRect.right - bodyRect.left;
								}
								else if (helperRect.right >= bodyRect.right) {
									width = bodyRect.right - helperRect.left;
								}

								if (helperRect.top < bodyRect.top) {
									position.top = bodyRect.top;
									height = helperRect.bottom - bodyRect.top;
								}
								else if (helperRect.bottom >= bodyRect.bottom) {
									height = bodyRect.bottom - helperRect.top;
								}
							}

							helper.outerWidth(width).outerHeight(height);
						},

						stop: function(event, ui) {
							var wrapEl = ui.helper, offset = wrapEl.offset();
							offset.left += dialogHelperOffset.left;
							offset.top += dialogHelperOffset.top;
							dialog._left = offset.left;
							dialog._top = offset.top;
							dialog._width = wrapEl.outerWidth();
							dialog._height = wrapEl.outerHeight();
							dialog.refresh();
							$fly(dialog._dom).css(offset);
						}
					});
				});
			}

			return dom;
		},

		getShowPosition: function(options) {
			var dialog = this;
			if (dialog._maximized) {
				var result = { left: 0, top: 0 };
				$fly(dialog._dom).css(result);
				return result;
			}
			else {
				return $invokeSuper.call(dialog, arguments);
			}
		}
	});

})();

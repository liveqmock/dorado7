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
	var directionReverse = {
		left: "right",
		right: "left",
		top: "bottom",
		bottom: "top"
	};

	var mouseEnterfunc = function(event) {
		var panel = event.data.panel;
		if (panel._hidePreviewTimer) {
			clearTimeout(panel._hidePreviewTimer);
		}
	};

	var mouseLeavefunc = function(event) {
		var panel = event.data.panel;
		panel._delayHidePreview();
	};

	var documentMouseDown = function(event) {
		$fly(document).unbind("click", documentMouseDown);
		var panel = event.data.panel;
		panel._closePreview();
	};
	
	/**
     * @author Frank Zhang (mailto:frank.zhang@bstek.com)
     * @component Base
	 * @class 分割面板
	 * <p>
	 * 用来布局的一个组件。使用该组件需要指定一个边组件，一个主组件，边组件可以被收缩起来，并且可以指定边组件的宽度或者高度的最大值和最小值。
	 * </p>
	 * <p>
	 * 该组件的边组件也有预览的功能，该功能的含义是在边组件收缩以后，如果预览功能开启，则会在边组件的位置上显示一个横向或者竖向的工具条，
	 * 当点击该工具条上的预览按钮以后，会显示出边组件，当点击了文档的其他位置或者鼠标移出工具条或者边组件的显示范围，则边组件则会收缩回去。
	 * </p>
	 * @extends dorado.widget.Control
	 */
	dorado.widget.SplitPanel = $extend(dorado.widget.Control, /** @scope dorado.widget.SplitPanel.prototype*/ {
		$className: "dorado.widget.SplitPanel",
		
		ATTRIBUTES: /** @scope dorado.widget.SplitPanel.prototype*/ {
			className: {
				defaultValue: "d-split-panel"
			},
            
			/**
			 * 边组件的显示的位置。
			 * 可选值：left、right、top、bottom，默认值left。
			 * @attribute 
			 * @default "left"
			 * @type String
			 */
			direction: {
				defaultValue: "left",
				setter: function(value) {
					if (this._collapseable && this._sideControl instanceof dorado.widget.AbstractPanel) {
						var collapseButton = this._sideControl._collapseButton;
						if (collapseButton) {
							collapseButton.set("iconClass", this._collapsed ? ("expand-icon-" + value) : ("collapse-icon-" + value));
						}
					}
					this._direction = value;
				}
			},
            
			/**
			 * 边组件的最大的尺寸，如果不指定，则表示不限制。
			 * 如果direction是left、right，则尺寸指的是宽，如果direction是top、bottom，则尺寸指的是高。
			 * @attribute
			 * @type int
			 */
			maxPosition: {},

			/**
			 * 边组件的最小的尺寸，如果不指定，默认值为50。
			 * 如果direction是left、right，则尺寸指的是宽，如果direction是top、bottom，则尺寸指的是高。
			 * @attribute
			 * @type int
			 */
			minPosition: {
				defaultValue: 50
			},

			/**
			 * 边组件的当前位置。
			 * 如果direction是left、right，则尺寸指的是宽，如果direction是top、bottom，则尺寸指的是高。
			 * @attribute
			 * @default 100
			 * @type int
			 */
			position: {
				defaultValue: 100,
                setter: function(value) {
                    this._position = value;
                }
			},

			/**
			 * 边组件。
			 * @attribute
			 * @type dorado.widget.Control
			 */
			sideControl: {
				writeBeforeReady: true,
				writeOnce: true,
				innerComponent: ""
			},

			/**
			 * 主组件。
			 * @attribute
			 * @type dorado.widget.Control
			 */
			mainControl: {
				writeBeforeReady: true,
				writeOnce: true,
				innerComponent: ""
			},

			/**
			 * 是否可更改边组件大小，边组件的大小更改以后，主组件的大小也会做相应的改变。
			 * @attribute
			 * @default true
			 * @type boolean
			 */
			resizeable: {
				defaultValue: true
			},

			/**
			 * 是否已经收缩边组件，默认值为false。
			 * @attribute
			 * @default false
			 * @type boolean
			 */
			collapsed: {
				setter: function(value) {
					this.doSetCollapsed(value);
				}
			},

            /**
             * 是否可以折叠，这个属性会决定折叠按钮是否显示。
             * @attribute
             * @default true
             * @type boolean
             */
            collapseable: {
                defaultValue: true
            },

            /**
             * 是否可以预览，这个属性会决定是否在sideControl折叠以后显示一个竖向或者横向的工具条。
             * @attribute
             * @default false
             * @type boolean
             */
			previewable: {
				defaultValue: false
			}
		},

		EVENTS: /** @scope dorado.widget.SplitPanel.prototype*/ {
			/**
			 * 在容器折叠或者展开之前触发，只有当collapseable为true的时候才会触发该事件。
			 *
			 * @param {Object} self 事件的发起者，即组件本身。
			 * @param {Object} arg 事件参数。
			 * @return {boolean} 是否要继续后续事件的触发操作，不提供返回值时系统将按照返回值为true进行处理。
			 * @event
			 */
			beforeCollapsedChange: {},
			/**
			 * 在容器折叠或者展开之后触发，只有当collapseable为true的时候才会触发该事件。
			 *
			 * @param {Object} self 事件的发起者，即组件本身。
			 * @param {Object} arg 事件参数。
			 * @return {boolean} 是否要继续后续事件的触发操作，不提供返回值时系统将按照返回值为true进行处理。
			 * @event
			 */
			onCollapsedChange: {}
		},

		_openPreview: function() {
			var panel = this, dom = panel._dom, doms = panel._doms, direction = panel._direction, sidePanelCss = {},
				animConfig, width = $fly(dom).innerWidth(), height = $fly(dom).innerHeight(),
				collapseBarWidth = $fly(doms.collapseBar).outerWidth(),
				collapseBarHeight = $fly(doms.collapseBar).outerHeight();

			if (panel._previewOpened) {
				return;
			}

			panel._previewOpened = true;

            var position = panel.getPixelPosition();

			switch (direction) {
				case "left":
					animConfig = {
						left: collapseBarWidth
					};
					sidePanelCss.left = position * -1;
					break;

				case "top":
					animConfig = {
						top: collapseBarHeight
					};
					sidePanelCss.top = position * -1;
					break;

				case "right":
					animConfig = {
						left: width - position - collapseBarWidth
					};
					sidePanelCss.left = width;
					break;

				case "bottom":
					animConfig = {
						top: height - position - collapseBarHeight
					};
					sidePanelCss.top = height;
					break;
			}

			$fly(doms.sidePanel).css(sidePanelCss).bringToFront().animate(animConfig, {
				complete: function() {
                    if (panel._sideControl) {
                        panel._sideControl.setActualVisible(true);
                    }
				}
			});
			$fly(document).bind("click", {panel: panel}, documentMouseDown);

			$fly([doms.sidePanel, doms.collapseBar]).bind("mouseenter", {panel: panel}, mouseEnterfunc).bind("mouseleave", {panel: panel}, mouseLeavefunc);
		},

		_closePreview: function() {
			var panel = this, dom = panel._dom, doms = panel._doms, direction = panel._direction,
				animConfig, width = $fly(dom).innerWidth(), height = $fly(dom).innerHeight(),
				collapseBarWidth = $fly(doms.collapseBar).outerWidth(),
				collapseBarHeight = $fly(doms.collapseBar).outerHeight();

			if (!panel._previewOpened) {
				return;
			}

			panel._previewOpened = false;

            var position = panel.getPixelPosition();

			switch (direction) {
				case "left":
					animConfig = {
						left: position * -1 + collapseBarWidth
					};
					break;

				case "top":
					animConfig = {
						top: position * -1 + collapseBarHeight
					};
					break;

				case "right":
					animConfig = {
						left: width - collapseBarWidth
					};
					break;

				case "bottom":
					animConfig = {
						top: height - collapseBarHeight
					};
					break;
			}
			$fly(doms.sidePanel).animate(animConfig, {
				complete: function() {
					$fly(doms.sidePanel).css("z-index", "");
                    panel._sideControl.setActualVisible(false);
				}
			});
			$fly([doms.sidePanel, doms.collapseBar]).unbind("mouseenter", mouseEnterfunc).unbind("mouseleave", mouseLeavefunc);
		},

		_togglePreview: function() {
			var panel = this;

			if (panel._previewOpened) {//close
				panel._closePreview();
			} else {
				panel._openPreview();
			}
		},

		_delayHidePreview: function() {
			var panel = this;
			if (panel._hidePreviewTimer) {
				clearTimeout(panel._hidePreviewTimer);
			}
			panel._hidePreviewTimer = setTimeout(function() {
				panel._hidePreviewTimer = null;
				panel._closePreview();
				$fly(document).unbind("click", documentMouseDown);
			}, 500);
		},

		_createCollapseBar: function() {
			var panel = this, doms = panel._doms, bar = $DomUtils.xCreate({
				tagName: "div",
				className: "collapse-bar",
				contextKey: "collapseBar",
				content: {
					tagName: "div",
					className: "button",
					contextKey: "collapseBarButton"
				}
			}, null, doms);

			jQuery(doms.collapseBar).addClass("collapse-bar-" + panel._direction)
				.addClassOnHover("collapse-bar-hover").click(function(event) {
				panel._togglePreview();
				event.stopImmediatePropagation();
			});

			jQuery(doms.collapseBarButton).click(function(event) {
				panel.doSetCollapsed(false);
				event.stopImmediatePropagation();
			}).addClassOnHover("button-hover");

			$fly(panel._dom).append(doms.collapseBar);

			return bar;
		},

		createDom: function() {
			var panel = this, doms = {}, dom = $DomUtils.xCreate({
				tagName: "div",
				content: [
					{
						tagName: "div",
						className: "side-panel",
						contextKey: "sidePanel"
					},
					{
						tagName: "div",
						className: "splitter",
						content: {
							tagName: "div",
							className: "button",
							contextKey: "button"
						},
						contextKey: "splitter"
					},
					{
						tagName: "div",
						className: "main-panel",
						contextKey: "mainPanel"
					}
				]
			}, null, doms), direction = panel._direction, axis = (direction == "left" || direction == "right") ? "x" : "y";

			panel._doms = doms;

			$DomUtils.disableUserSelection(doms.splitter);
            var splitterPosition, containment;
			$fly(doms.splitter).addClass("splitter-" + panel._direction).draggable({
				addClasses: false,
				//containment: "parent",
				axis: axis,
				helper: "clone",
                iframeFix: true,
				start: function(event, ui){
					var helper = ui.helper;
					if(helper){
						helper.addClass("d-splitter-dragging").bringToFront().find("> .button").css("display", "none");
					}
                    splitterPosition = $fly(doms.splitter).position();
                    var vertical = direction == "top" || direction == "bottom";
                    if (panel._maxPosition != null || panel._minPosition != null) {
                        var width = $fly(dom).width(), height = $fly(dom).height(),
                            min = panel._minPosition || 50, max, sideMin, sideMax, range;
                        if (vertical) {
                            max = panel._maxPosition || height - 50;
                        } else {
                            max = panel._maxPosition || width - 50;
                        }

                        if (panel._direction == "left") {
                            sideMin = min;
                            sideMax = max;
                        } else if (panel._direction == "right") {
                            sideMin = width - max;
                            sideMax = width - min;
                        } else if (panel._direction == "top") {
                            sideMin = min;
                            sideMax = max;
                        } else if (panel._direction == "bottom") {
                            sideMin = height - max;
                            sideMax = height - min;
                        }

                        if (vertical) {
                            containment = [0, sideMin, 0, sideMax];
                        } else {
                            containment = [sideMin, 0, sideMax, 0];
                        }
                    }
				},
                drag: function(event, ui) {
                    var inst = jQuery.data(this, "ui-draggable"), horiChange = event.pageX - inst.originalPageX, vertChange = event.pageY - inst.originalPageY;

                    ui.position = {
                        left: splitterPosition.left,
                        top: splitterPosition.top
                    };

                    var left, top;

                    if (panel._direction == "left" || panel._direction == "right") {
                        left = splitterPosition.left + horiChange;
                        if (left < containment[0]) {
                            left = containment[0];
                        } else if (left > containment[2]) {
                            left = containment[2];
                        }
                        ui.position.left = left;
                    } else {
                        top = splitterPosition.top + vertChange;
                        if (top < containment[1]) {
                            top = containment[1];
                        } else if (top > containment[3]) {
                            top = containment[3];
                        }
                        ui.position.top = top;
                    }

                    ui.helper.css(ui.position);
                },
				stop: function(event, ui) {
					var position = ui.position;
					switch (panel._direction) {
						case "left":
							panel.set("position", position.left);
							break;
						case "right":
							panel.set("position", $fly(dom).width() - position.left - $fly(doms.splitter).outerWidth(true));
							break;
						case "top":
							panel.set("position", position.top);
							break;
						case "bottom":
							panel.set("position", $fly(dom).height() - position.top - $fly(doms.splitter).outerHeight(true));
							break;
					}
				}
			});

			$fly(doms.button).click(function() {
				panel.doSetCollapsed(!panel._collapsed);
			});

			$fly(doms.sidePanel).click(function(event) {
				event.stopImmediatePropagation();
			});

			return dom;
		},

		initObjectShimForIE: function() {
			if (!dorado.Browser.msie || !dorado.useObjectShim || this._objectShimInited) return;
			var iframe = $DomUtils.xCreate({
				tagName: "iframe",
				style: {
					position: "absolute",
					visibility: "inherit",
					top: 0,
					left: 0,
					width: "100%",
					height: "100%",
					zIndex: -1,
					filter: "progid:DXImageTransform.Microsoft.Alpha(style=0,opacity=0)"
				},
				src: "about:blank"
			});
			this._doms.splitter.appendChild(iframe);
			this._objectShimInited = true;
		},

		doSetCollapsed: function(collapsed, callback, slience) {
			var panel = this, dom = panel._dom, doms = panel._doms, eventArg = {};
			panel.fireEvent("beforeCollapsedChange", panel, eventArg);
			if (eventArg.processDefault === false) return;

			if (dom) {
				var width = $fly(dom).width(), height = $fly(dom).height(), direction = panel._direction, left;

				var onCollapsedChange = function() {
					if (panel._sideControl) {
						panel._sideControl.setActualVisible(!collapsed);
					}
					panel._collapsed = collapsed;
					panel.refresh();
					panel.fireEvent("onCollapsedChange", panel);
					$fly(doms.sidePanel).css("z-index", "");
					if (typeof callback == "function") {
						callback.apply(null, []);
					}
				};

				var animConfig, position = panel.getPixelPosition();

				if (collapsed) {
					switch (direction) {
						case "left":
							animConfig = {
								left: position * -1
							};
							break;

						case "top":
							animConfig = {
								top: position * -1
							};
							break;

						case "right":
							animConfig = {
								left: width
							};
							break;

						case "bottom":
							animConfig = {
								top: height
							};
							break;
					}
					$fly(doms.sidePanel).animate(animConfig, {
						complete: function() {
							onCollapsedChange();
						}
					});
				} else {
					if (panel._previewOpened) {
						$fly([doms.sidePanel, doms.collapseBar]).unbind("mouseenter", mouseEnterfunc).unbind("mouseleave", mouseLeavefunc);
						$fly(document).unbind("click", documentMouseDown);
						panel._previewOpened = false;

						onCollapsedChange();
					} else {
						var sidePanelCss = {};
						switch (direction) {
							case "left":
								animConfig = {
									left: 0
								};
								sidePanelCss.left = position * -1;
								break;

							case "top":
								animConfig = {
									top: 0
								};
								sidePanelCss.top = position * -1;
								break;

							case "right":
								animConfig = {
									left: width - position
								};
								sidePanelCss.left = width;
								break;

							case "bottom":
								animConfig = {
									top: height - position
								};
								sidePanelCss.top = height;
								break;
						}
						$fly(doms.sidePanel).css(sidePanelCss).bringToFront().animate(animConfig, {
							complete: function() {
								onCollapsedChange();
							}
						});
					}
				}
			} else {
				panel._collapsed = collapsed;
				panel.fireEvent("onCollapsedChange", panel);
			}

			if (slience !== true) {
				if (panel._sideControl instanceof dorado.widget.AbstractPanel) {
					panel._sideControl._splitPanelCascade = true;
					panel._sideControl.set("collapsed", collapsed);
					panel._sideControl._splitPanelCascade = false;
				}
			}
		},

        getPixelPosition: function() {
            var panel = this, position = panel._position, dir = panel._direction;
            if (typeof position == "string") {
                if (position.indexOf("%") == -1) {
                    position = parseInt(position, 10);
                } else {
                    position = (dir == "left" || dir == "right" ? panel.getRealWidth() : panel.getRealHeight()) * parseInt(position.replace("%", ""), 10) / 100;
                }
            }
            return position;
        },

		doOnAttachToDocument: function() {
			var panel = this, sideControl = panel._sideControl, mainControl = panel._mainControl, doms = panel._doms;
			if (sideControl) {
				sideControl.render(doms.sidePanel);
                sideControl.setActualVisible(!panel._collapsed);
			}

			if (mainControl) {
				mainControl.render(doms.mainPanel);
			}
			panel.initObjectShimForIE();
		},

		refreshDom: function(dom) {
			$invokeSuper.call(this, arguments);

			var panel = this, doms = panel._doms, width = $fly(dom).width(), height = $fly(dom).height(),
				splitterWidth = $fly(doms.splitter).width(), splitterHeight = $fly(doms.splitter).height(),
				direction = panel._direction, previewable = panel._previewable && panel._collapseable,
				vertical = direction == "top" || direction == "bottom";

            if(panel._collapseable){
                if (panel._collapsed) {
                    $fly(dom).addClass(panel._className + "-collapsed");
                    $fly(doms.splitter).draggable("disable");
                } else {
                    $fly(dom).removeClass(panel._className + "-collapsed");
                    $fly(doms.splitter).draggable("enable");
                }
            }

            if(panel._collapseable){
                $fly(doms.button).css("display", "");
            } else {
                $fly(doms.button).css("display", "none");
            }

			$fly(doms.splitter).removeClass("splitter-h-resizeable splitter-v-resizeable");
			if (panel._resizeable) {
				$fly(doms.splitter).addClass(vertical ? "splitter-v-resizeable" : "splitter-h-resizeable");
			}

			var sidePanelStyle, splitterStyle, mainPanelStyle, mainControlStyle, sideControlStyle, collapseBarStyle,
				collapseBarWidth = 0, collapseBarHeight = 0;

            var position = panel.getPixelPosition();

			if (panel._collapseable && panel._collapsed) {
				if (previewable) {
					if (!doms.collapseBar) {
						panel._createCollapseBar();
					}
					$fly(doms.collapseBar).css({
							display: "",
							width: "",
							height: ""
						}).removeClass("collapse-bar-left collapse-bar-right collapse-bar-top collapse-bar-bottom")
						.addClass("collapse-bar-" + direction);

					//must use outerWidth outerHeight
					if (direction == "top" || direction == "bottom") {
						$fly(doms.collapseBar).outerWidth(width);
					} else if (direction == "left" || direction == "right") {
						$fly(doms.collapseBar).outerHeight(height);
					}

					collapseBarWidth = $fly(doms.collapseBar).outerWidth();
					collapseBarHeight = $fly(doms.collapseBar).outerHeight();

					switch(direction) {
						case "left":
							collapseBarStyle = {
								left: 0,
								top: 0
							};
							break;
						case "right":
							collapseBarStyle = {
								left: width - collapseBarWidth,
								top: 0
							};
							break;
						case "top":
							collapseBarStyle = {
								left: 0,
								top: 0
							};
							break;
						case "bottom":
							collapseBarStyle = {
								top: height - collapseBarHeight,
								left: 0
							};
							break;
					}

					$fly(doms.collapseBar).css(collapseBarStyle);
				}

				$fly(doms.splitter).removeClass("splitter-left splitter-right splitter-top splitter-bottom").addClass("splitter-" + directionReverse[direction]);
				splitterWidth = $fly(doms.splitter).width();
				splitterHeight = $fly(doms.splitter).height();
				switch(panel._direction) {
					case "left":
						splitterStyle = {
							left: collapseBarWidth,
							top: 0
						};
						break;
					case "right":
						splitterStyle = {
							left: width - splitterWidth - collapseBarWidth,
							top: 0
						};
						break;
					case "top":
						splitterStyle = {
							top: collapseBarHeight,
							left: 0
						};
						break;
					case "bottom":
						splitterStyle = {
							top: height - splitterHeight - collapseBarHeight,
							left: 0
						};
						break;
				}
				$fly(doms.splitter).css(splitterStyle);

				switch (direction) {
					case "left":
						sidePanelStyle = {
							left: position * -1,
							top: 0,
							height: height
						};
						mainPanelStyle = {
							left: splitterWidth + collapseBarWidth,
							top: 0,
							width: width - splitterWidth - collapseBarWidth,
							height: height
						};
						mainControlStyle = {
							width: width - splitterWidth - collapseBarWidth,
							height: height
						};
						sideControlStyle = {
							width: position,
							height: height
						};
						break;
					case "right":
						sidePanelStyle = {
							left: width,
							top: 0,
							height: height
						};
						mainPanelStyle = {
							left: 0,
							top: 0,
							width: width - splitterWidth - collapseBarWidth,
							height: height
						};
						mainControlStyle = {
							width: width - splitterWidth - collapseBarWidth,
							height: height
						};
						sideControlStyle = {
							width: position,
							height: height
						};
						break;
					case "top":
						sidePanelStyle = {
							top: position * -1,
							left: 0,
							width: width
						};
						mainPanelStyle = {
							top: splitterHeight + collapseBarHeight,
							left: 0,
							width: width,
							height: height - splitterHeight - collapseBarHeight
						};
						mainControlStyle = {
							width: width,
							height: height - splitterHeight - collapseBarHeight
						};
						sideControlStyle = {
							width: width,
							height: position
						};
						break;
					case "bottom":
						sidePanelStyle = {
							top: height,
							left: 0,
							width: width
						};
						mainPanelStyle = {
							top: 0,
							left: 0,
							width: width,
							height: height - splitterHeight - collapseBarHeight
						};
						mainControlStyle = {
							width: width,
							height: height - splitterHeight - collapseBarHeight
						};
						sideControlStyle = {
							width: width,
							height: position
						};
						break;
				}
				$fly(doms.sidePanel).css(sidePanelStyle);
				$fly(doms.mainPanel).css(mainPanelStyle);
				if (panel._sideControl) {
					panel._sideControl.set(sideControlStyle);
				}
				if (panel._mainControl) {
					panel._mainControl.set(mainControlStyle);
				}
			} else {
				if (previewable) {
					$fly(doms.collapseBar).css("display", "none");
				}

				$fly(doms.splitter).removeClass("splitter-left splitter-right splitter-top splitter-bottom").addClass("splitter-" + direction);
				splitterWidth = $fly(doms.splitter).width();
				splitterHeight = $fly(doms.splitter).height();
				switch(panel._direction) {
					case "left":
						splitterStyle = {
							left: position,
							top: 0
						};
						break;
					case "right":
						splitterStyle = {
							left: width - position - splitterWidth,
							top: 0
						};
						break;
					case "top":
						splitterStyle = {
							top: position,
							left: 0
						};
						break;
					case "bottom":
						splitterStyle = {
							top: height - position - splitterHeight,
							left: 0
						};
						break;
				}
				$fly(doms.splitter).css(splitterStyle);

				switch (panel._direction) {
					case "left":
						sidePanelStyle = {
							left: 0,
							top: 0,
							width: position,
							height: height
						};
						sideControlStyle = {
							width: position,
							height: height
						};
						mainPanelStyle = {
							left: position + splitterWidth,
							top: 0,
							width: width - position - splitterWidth,
							height: height
						};
						mainControlStyle = {
							width: width - position - splitterWidth,
							height: height
						};
						break;

					case "right":
						sidePanelStyle = {
							left: width - position,
							top: 0,
							width: position,
							height: height
						};
						sideControlStyle = {
							width: position,
							height: height
						};
						mainPanelStyle = {
							left: 0,
							top: 0,
							width: width - position - splitterWidth,
							height: height
						};
						mainControlStyle = {
							width: width - position - splitterWidth,
							height: height
						};
						break;

					case "top":
						sidePanelStyle = {
							top: 0,
							left: 0,
							width: width,
							height: position
						};
						sideControlStyle = {
							width: width,
							height: position
						};
						mainPanelStyle = {
							top: position + splitterHeight,
							left: 0,
							width: width,
							height: height - position - splitterHeight
						};
						mainControlStyle = {
							width: width,
							height: height - position - splitterHeight
						};
						break;

					case "bottom":
						sidePanelStyle = {
							top: height - position,
							left: 0,
							width: width,
							height: position
						};
						sideControlStyle = {
							width: width,
							height: position
						};
						mainPanelStyle = {
							top: 0,
							left: 0,
							width: width,
							height: height - position - splitterHeight
						};
						mainControlStyle = {
							width: width,
							height: height - position - splitterHeight
						};
						break;
				}
				if (panel._sideControl) {
					panel._sideControl.set(sideControlStyle);
					panel._sideControl.refresh();
				}
				if (panel._mainControl) {
					panel._mainControl.set(mainControlStyle);
					panel._mainControl.refresh();
				}
				$fly(doms.sidePanel).css(sidePanelStyle);
				$fly(doms.mainPanel).css(mainPanelStyle);
			}

			//set draggable range

            $fly(doms.splitter).draggable(panel._resizeable ? "enable" : "disable");
		},
	
		getFocusableSubControls: function() {
			var direction = this._direction;
			if (direction == "left" || direction == "top") {
				return [this._sideControl, this._mainControl];
			}
			else {
				return [this._mainControl, this._sideControl];
			}
		}
	});
})();

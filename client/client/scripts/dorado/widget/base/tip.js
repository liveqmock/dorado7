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
	var ANCHOR_OFFSET_ADJ_HORIZENTAL = 5, ANCHOR_OFFSET_ADJ_VERTICAL = 5;
	
	var icons = {
		WARNING: "warning-icon",
		ERROR: "error-icon",
		INFO: "info-icon",
		QUESTION: "question-icon"
	};

	/**
	 * @author Frank Zhang (mailto:frank.zhang@bstek.com)
	 * @component Base
	 * @class 提示信息组件。<br />
	 * 该组件主要用来展示与用户的鼠标动作无关的提示信息，通过指定位置或者锚定对象来显示。<br />
	 * 如果要使用与用户鼠标动作有关的提示信息，请使用dorado.widget.ToolTip替换。
	 *
	 * @extends dorado.widget.Control
	 * @extends dorado.widget.FloatControl
	 */
	dorado.widget.Tip = $extend([dorado.widget.Control, dorado.widget.FloatControl], /** @scope dorado.widget.Tip.prototype */ {
		$className: "dorado.widget.Tip",
		
		ATTRIBUTES: /** @scope dorado.widget.Tip.prototype */ {			
			className: {
				defaultValue: "d-tip"
			},
			
			height: {
				independent: true
			},
			
			visible: {
				defaultValue: false
			},
			
			shadowMode: {
				defaultValue: "none",
				skipRefresh: true
			},
			
			animateType: {
				defaultValue: dorado.Browser.msie ? "none" : "fade",
				skipRefresh: true
			},
			
			focusAfterShow: {
				defaultValue: false
			},
			
			/**
			 * 显示的标题。
			 * @attribute
			 * @type String
			 */
			caption: {},
			
			/**
			 * Tip显示的文本。
			 * <p>
			 * 如果用户同时定义了content属性，那么此属性的值将被忽略。
			 * </p>
			 * @attribute
			 * @type String
			 */
			text: {},
			
			/**
			 * Tip显示的内容。此属性有如下四种可能的定义方式：
			 * <ul>
			 * 	<li>String	-	表示以HTML方式定义Tip的内容。</li>
			 * 	<li>Object	-	表示该参数是将要传递给{@link $DomUtils.xCreate}的参数，即利用JSON定义的HTML。</li>
			 * 	<li>HTMLElement	-	表示直接将此Dom对象作为Tip的内容。</li>
			 * 	<li>dorado.widget.Control	-	表示直接将此Control渲染到Tip中作为其内容。</li>
			 * </ul>
			 * @attribute
			 * @type String|Object|HTMLElement|dorado.widget.Control
			 */
			content: {},
			
			/**
			 * 图标所在路径。
			 * 可以使用WARNING、ERROR、INFO、QUESTION四个默认值，分别代表警告、错误、信息、问题。也可以自定义，自定义推荐48*48的图片大小。
			 * @attribute
			 * @type String
			 */
			icon: {},
			
			/**
			 * 图标使用的className。
			 * @attribute
			 * @type String
			 */
			iconClass: {},
			
			/**
			 * Tip是否可以关闭，默认不可以关闭。
			 * @attribute
			 * @default false
			 * @type boolean
			 */
			closeable: {},
			
			/**
			 * Tip显示指向箭头的位置，可以为left、right、top、bottom、none，默认为none，即不显示指向箭头。
			 * <p>该属性指的是tip的箭头的相对于自身Box的位置，而不是Tip的显示位置。</p>
			 * @attribute
			 * @type String
			 * @default "none"
			 */
			arrowDirection: {},
			
			/**
			 * 箭头的横向或者纵向排列位置。<br />
			 * 当arrowDirection为left、right的时候，可选值为left、right、center。<br />
			 * 当arrowDirection为top、bottom的时候，可选值为top、bottom、center。
			 * @attribute
			 * @type String
			 * @default "center"
			 */
			arrowAlign: {
				defaultValue: "center"
			},
			
			/**
			 * 显示的箭头的偏移量，这个偏移量是想对于计算出来的箭头的位置而言。
			 * @attribute
			 * @type int
			 */
			arrowOffset: {},
			
			/**
			 * 提示信息自动隐藏时间，单位为秒，默认为空，则不会自动隐藏。
			 * @attribute
			 * @type int
			 */
			showDuration: {}
		},
		
		createDom: function() {
			var tip = this, dom, doms = {};
			dom = $DomUtils.xCreate({
				tagName: "div",
				content: {
					tagName: "div",
					className: "tip-cm",
					contextKey: "tipCenter",
					content: {
						tagName: "div",
						contextKey: "tipContent",
						className: "tip-content",
						content: [{
							tagName: "span",
							className: "tip-icon",
							contextKey: "tipIcon"
						}, {
							tagName: "span",
							className: "tip-text",
							contextKey: "tipText"
						}]
					}
				}
			}, null, doms);
			
			tip._doms = doms;

			$fly(dom).hover(function() {
				if (tip._showDurationTimer) {
					clearTimeout(tip._showDurationTimer);
					tip._showDurationTimer = null;
				}
			}, function() {
				if (tip._showDuration) {
					tip._showDurationTimer = setTimeout(function() {
						tip.hide();
						tip._showDurationTimer = null;
					}, tip._showDuration * 1000);
				}
			});
			
			return dom;
		},
		
		doAfterShow: function() {
			var tip = this;
			$invokeSuper.call(tip, arguments);
			if (tip._showDuration) {
				tip._showDurationTimer = setTimeout(function() {
					tip.hide();
					tip._showDurationTimer = null;
				}, tip._showDuration * 1000);
			}
		},
		
		/**
		 * 点击Tip上的关闭按钮会触发的方法。
		 * @protected
		 */
		doClose: function() {
			this.hide();
		},
		
		getShowPosition: function(options) {
			var tip = this, arrowDirection = tip._arrowDirection, doms = tip._doms;
			
			if (arrowDirection && (options.offsetLeft == null && options.offsetTop == null)) {
				var arrowAlign = tip._arrowAlign;
				if (arrowAlign) {
					if (arrowDirection == "left") {
						options.offsetLeft = doms.arrow.offsetWidth;
					} else if (arrowDirection == "right") {
						options.offsetLeft = -1 * doms.arrow.offsetWidth;
					} else if (arrowDirection == "top") {
						options.offsetTop = doms.arrow.offsetHeight;
					} else {
						options.offsetHeight = -1 * doms.arrow.offsetHeight;
					}
				}
			}
			
			return $invokeSuper.call(this, arguments);
		},
		
		refreshDom: function(dom) {
			$invokeSuper.call(this, arguments);
			
			var tip = this, text = (tip._text == undefined) ? "" : tip._text, doms = tip._doms, arrowDirection = tip._arrowDirection, cls = tip._className, content = this._content;			
			var $tipText = $fly(doms.tipText);
			if (content) {
				if (typeof content == "string") {
					$tipText.html(content);
				} else if (content instanceof dorado.widget.Control) {
                    if (!content._rendered) {
                        $tipText.empty();
                        content.render(doms.tipText);
                    }
				} else if (content.nodeType && content.nodeName) {
					$tipText.empty().append(content);
				} else {
					$tipText.empty().xCreate(content);
				}
			} else {
				if (/<[^<]+?>/g.test(text)) {
					$tipText.html(text);
				} else {
					$tipText.text(text);
				}
			}
			
			$fly(dom).shadow({
				mode: tip._shadowMode
			});
			
			if (arrowDirection && arrowDirection != "none") {
				if (doms.arrow == null) {
					var arrowEl = document.createElement("div");
					arrowEl.className = "arrow";
					$fly(dom).append(arrowEl);
					doms.arrow = arrowEl;
				}
				
				$fly(dom).addClass("d-tip-arrow-" + arrowDirection);
			} else {
				$fly(dom).removeClass("d-tip-arrow-top").removeClass("d-tip-arrow-bottom").removeClass("d-tip-arrow-left").removeClass("d-tip-arrow-right");
			}
			
			var captionDom = doms.caption;
			
			if (tip._caption || tip._closeable) {
				var caption = tip._caption || $resource("dorado.baseWidget.DefaultTipCaption");
				if (captionDom == null) {
					doms.caption = captionDom = document.createElement("div");
					captionDom.className = "caption";
					$fly(doms.tipCenter).prepend(captionDom);
					$fly(captionDom).html(caption);
				} else {
					$fly(captionDom).css("display", "").html(caption);
				}
			} else if (captionDom != null) {
				$fly(captionDom).css("display", "none");
			}
			
			if (tip._closeable) {
				if (doms.close == null) {
					var closeEl = document.createElement("div");
					closeEl.className = "close";
					$fly(dom).append(closeEl);
					
					doms.close = closeEl;
					
					jQuery(closeEl).click(function() {
						tip.doClose(this);
					}).addClassOnHover("close-hover").addClassOnClick("close-click");
				} else {
					$fly(doms.close).css("display", "");
				}
			} else if (doms.close) {
				$fly(doms.close).css("display", "none");
			}
			
			var icon = tip._icon, iconClass = tip._iconClass || "", exClassName;
			if (icon in icons) {
				exClassName = icons[icon];
				icon = null;
			}
			$fly(doms.tipIcon).prop("className", "tip-icon");
			if (icon || iconClass || exClassName) {
				if (exClassName) $fly(doms.tipIcon).addClass(exClassName);
				if (iconClass) $fly(doms.tipIcon).addClass(iconClass);
				if (icon) $DomUtils.setBackgroundImage(doms.tipIcon, icon);
				else $fly(doms.tipIcon).css("background-image", "");
				
				$fly(doms.tipContent).addClass("tip-content-hasicon");
			} else {
				$fly(doms.tipContent).removeClass("tip-content-hasicon");
			}
			
			$fly(doms.arrow).css({
				left: "",
				top: ""
			});
			if (arrowDirection && !tip._trackMouse) {
				var arrowAlign = tip._arrowAlign, arrowOffset = tip._arrowOffset || 0;
				if (arrowAlign) {
					if (arrowDirection == "left" || arrowDirection == "right") {
						if (arrowAlign == "center") {
							$fly(doms.arrow).css("top", (dom.offsetHeight - doms.arrow.offsetHeight) / 2 + arrowOffset);
						} else if (arrowAlign == "top") {
							$fly(doms.arrow).css("top", ANCHOR_OFFSET_ADJ_VERTICAL + arrowOffset);
						} else if (arrowAlign == "bottom") {
							$fly(doms.arrow).css("top", dom.offsetHeight - doms.arrow.offsetHeight - ANCHOR_OFFSET_ADJ_VERTICAL + arrowOffset);
						}
					} else {
						if (arrowAlign == "center") {
							$fly(doms.arrow).css("left", (dom.offsetWidth - doms.arrow.offsetWidth) / 2 + arrowOffset);
						} else if (arrowAlign == "left") {
							$fly(doms.arrow).css("left", ANCHOR_OFFSET_ADJ_HORIZENTAL + arrowOffset);
						} else if (arrowAlign == "right") {
							$fly(doms.arrow).css("left", dom.offsetWidth - doms.arrow.offsetWidth - ANCHOR_OFFSET_ADJ_HORIZENTAL + arrowOffset);
						}
					}
				}
			}
		}
		
	});
	
	/**
	 * @author Frank Zhang (mailto:frank.zhang@bstek.com)
	 * @component Base
	 * @class NotifyTip
	 * <p>
	 * 提醒提示信息，主要用来通知用户某个动作已经完成。
	 * 当动作完成不是那么重要，只需要给用户一个不屏蔽用户操作的提醒的时候，可以考虑使用该组件。
	 * 该组件默认在左下角显示，如果显示不开，会按照从下到上，从右到左的优先级来依次排列。
	 * </p>
	 * @extends dorado.widget.Tip
	 */
	dorado.widget.NotifyTip = $extend(dorado.widget.Tip, {
		$className: "dorado.widget.NotifyTip",
		
		ATTRIBUTES: {
			width: {
				defaultValue: (dorado.Browser.isTouch ? 200: 300)
			},
			
			closeable: {
				defaultValue: true
			},
			
			/**
			 * 图标路径。
			 * @attribute
			 * @type String
			 */
			icon: {},
			
			/**
			 * 图标使用的className。
			 * @attribute
			 * @type String
			 */
			iconClass: {},
			
			/**
			 * 显示时间，默认为3s，3s后自动隐藏。
			 * @attribute
			 * @type int
			 * @default 3
			 */
			showDuration: {
				defaultValue: 3
			}
		},
		
		getShowPosition: function() {
			return dorado.widget.NotifyTipManager.getAvialablePosition(this);
		},
		
		doAfterHide: function() {
			$invokeSuper.call(this, arguments);
			dorado.NotifyTipPool.returnObject(this);
		}
	});
	
	dorado.NotifyTipPool = new dorado.util.ObjectPool({
		makeObject: function() {
			return new dorado.widget.NotifyTip();
		},
		passivateObject: function(object) {
			var attrs = ["caption" ,"text", "content", "icon", "iconClass", "arrowDirection", "arrowAlign", "arrowOffset"];
			for (var i = 0, j = attrs.length; i < j; i++) {
				var attr = attrs[i];
				delete object["_" + attr];
			}
			object._showDuration = 3;
			object._closeable = true;
		}
	});
	
	var getRegionOffsets = function(region1, region2) {
		return {
			top: Math.max(region1['top'], region2['top']),
			right: Math.min(region1['right'], region2['right']),
			bottom: Math.min(region1['bottom'], region2['bottom']),
			left: Math.max(region1['left'], region2['left'])
		};
	};
	
	var intersect = function(element1, element2) {
		var region1 = $fly(element1).region(), region2;
		if (element2.nodeType) {
			region2 = $fly(element2).region();
		} else {
			region2 = element2;
		}
		var offset = getRegionOffsets(region1, region2);
		return offset['bottom'] >= offset['top'] && offset['right'] >= offset['left'];
	};
	
	/**
	 * @author Frank Zhang (mailto:frank.zhang@bstek.com)
	 * @class 提醒信息管理器。
	 * @static
	 */
	dorado.widget.NotifyTipManager = {
		offsetLeft: -10,
		offsetTop: 10,
		padding: 10,
		notifyWidth: dorado.Browser.isTouch ? 200: 300,
		//tl,tr,bl,br
		position: "br",
		alignPriority: "vertical",
		
		/**
		 * 在屏幕上显示一个提示信息。
		 * @param {String|Object} msg 此参数有两种使用方法:
		 * <ul>
		 * 	<li>当此参数的类型为String时，Dorado7将其识别成提醒信息，并且您可以通过此方法的第二个参数来对通知消息进行更多的定制。</li>
		 * 	<li>当此参数的类型为Object时，Dorado7将其识别成选项参数，即传递给dorado.widget.NotifyTip的构造参数，此时方法的第二个参数将被忽略。</li>
		 * </ul>
		 * @param {Object} [options] 选项。
		 * @return {dorado.widget.NotifyTip} 内部创建的Tip对象。
		 */
		notify: function(msg, options) {
			if (typeof msg == "string") {
				options = dorado.Object.apply({}, options);
				options.text = msg;
			} else if (typeof msg == "object") {
				options = dorado.Object.apply({}, msg);
			}
			options.caption = options.caption || $resource("dorado.baseWidget.NotifyTipDefaultCaption") || "Dorado7"
			if (options.autoHide === false) options.showDuration = 0;
			delete options.autoHide;
			
			var tip = dorado.NotifyTipPool.borrowObject();
			tip.set(options);
			tip.show();
			return tip;
		},
		
		/**
		 * 为要定位的tip根据现有显示的其他tip找到一个可用的region。就是引用tip的
		 * @param refTip 参考tip，拿到的是该tip的下一个tip。
		 * @param tip 要取得可能region的tip，也就是要定位的tip
		 * @private
		 */
		nextRegion: function(refTip, tip) {
			var left, top, dom = tip._dom, width = dom.offsetWidth, height = dom.offsetHeight, position = this.position;
			var docWidth = $fly(window).width(), docHeight = $fly(window).height();
			
			if (this.alignPriority == "vertical") {
				if (position == "tr") {
					left = parseInt($fly(refTip._dom).css("left"), 10);
					top = $fly(refTip._dom).outerHeight() + parseInt($fly(refTip._dom).css("top"), 10) + this.padding;
					
					if (top + height > docHeight) {
						left = left - this.notifyWidth - this.padding;
						top = this.padding;
					}
				} else if (position == "br") {
					left = parseInt($fly(refTip._dom).css("left"), 10);
					top = parseInt($fly(refTip._dom).css("top"), 10) - $fly(refTip._dom).outerHeight() - this.padding;
					
					if (top < 0) {
						left = left - this.notifyWidth - this.padding;
						top = docHeight - height - this.padding;
					}
				} else if (position == "tl") {
					left = parseInt($fly(refTip._dom).css("left"), 10);
					top = parseInt($fly(refTip._dom).css("top"), 10) + $fly(refTip._dom).outerHeight() + this.padding;
					
					if (top + height > docHeight) {
						left = left + this.notifyWidth + this.padding;
						top = this.padding;
					}
				} else if (position == "bl") {
					left = parseInt($fly(refTip._dom).css("left"), 10);
					top = parseInt($fly(refTip._dom).css("top"), 10) - $fly(refTip._dom).outerHeight() - this.padding;
					
					if (top < 0) {
						left = left + this.notifyWidth + this.padding;
						top = docHeight - height - this.padding;
					}
				}
			} else {
				if (position == "tr") {
					left = parseInt($fly(refTip._dom).css("left"), 10) - this.notifyWidth - this.padding;
					top = parseInt($fly(refTip._dom).css("top"), 10);
					
					if (left < 0) {
						left = docWidth - this.padding - this.notifyWidth;
						top = top + $fly(refTip._dom).outerHeight() + this.padding;
					}
				} else if (position == "br") {
					left = parseInt($fly(refTip._dom).css("left"), 10) - this.notifyWidth - this.padding;
					top = parseInt($fly(refTip._dom).css("top"), 10);
					
					if (left < 0) {
						left = docWidth - this.padding - this.notifyWidth;
						top = top - $fly(refTip._dom).outerHeight() - this.padding;
					}
				} else if (position == "tl") {
					left = parseInt($fly(refTip._dom).css("left"), 10) + $fly(refTip._dom).outerWidth() + this.padding;
					top = parseInt($fly(refTip._dom).css("top"), 10);
					
					if (left + width > docWidth) {
						left = this.padding;
						top = top + $fly(refTip._dom).outerHeight() + this.padding;
					}
				} else if (position == "bl") {
					left = parseInt($fly(refTip._dom).css("left"), 10) + $fly(refTip._dom).outerWidth() + this.padding;
					top = parseInt($fly(refTip._dom).css("top"), 10);
					
					if (left + width > docWidth) {
						left = this.padding;
						top = top - $fly(refTip._dom).outerHeight() - this.padding;
					}
				}
			}
			
			return {
				left: left,
				top: top,
				bottom: top + height,
				right: left + width
			};
		},
		
		/**
		 * 判断一个tip的region是否会与其他region重合
		 * @param tip 要判断是否重合的tip
		 * @param region 要判断的tip的假设region
		 * @private
		 */
		avialable: function(tip, region) {
			var passed = true, activePool = dorado.NotifyTipPool._activePool;
			for (var k = 0, l = activePool.length; k < l; k++) {
				if (activePool[k] != tip) {
					var intersected = intersect(activePool[k]._dom, region);
					if (intersected) {
						passed = false;
					}
				}
			}
			return passed;
		},
		
		/**
		 * 为tip取得一个可行的位置。
		 * @param tip 要取得位置的tip。
		 * @private
		 */
		getAvialablePosition: function(tip) {
			var docWidth = $fly(window).width(), dom = tip._dom, width = dom.offsetWidth, height = dom.offsetHeight, left, top, region, position = this.position;
			
			if (position == "tr") {
				left = docWidth - this.padding - width;
				top = this.padding;
			} else if (position == "br") {
				left = docWidth - this.padding - width;
				top = $fly(window).height() - height - this.padding;
			} else if (position == "tl") {
				left = this.padding;
				top = this.padding;
			} else if (position == "bl") {
				left = this.padding;
				top = $fly(window).height() - height - this.padding;
			}
			
			region = {
				left: left,
				top: top,
				bottom: top + height,
				right: left + width
			};
			
			if (this.avialable(tip, region)) {
				dorado.NotifyTipPool._activePool.remove(tip);
				dorado.NotifyTipPool._activePool.unshift(tip);
				$fly(dom).css({
					left: left,
					top: top
				});
				return {
					left: left,
					top: top
				};
			}
			
			if (dorado.NotifyTipPool.getNumActive() > 1) {
				var activePool = dorado.NotifyTipPool._activePool;
				for (var i = 0, j = activePool.length; i < j; i++) {
					var curTip = activePool[i];
					if (curTip != tip) {
						region = this.nextRegion(curTip, tip);
						if (this.avialable(tip, region)) {
							dorado.NotifyTipPool._activePool.remove(tip);
							dorado.NotifyTipPool._activePool.insert(tip, dorado.NotifyTipPool._activePool.indexOf(curTip) + 1);
							$fly(tip._dom).css({
								left: region.left,
								top: region.top
							});
							return {
								left: region.left,
								top: region.top
							};
						}
					}
				}
			}
		}
	};
})();
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

	var maxZIndex = 9999;
	
	/**
	 * @name $DomUtils
	 * @property
	 * @description dorado.util.Dom的快捷方式。
	 * @see dorado.util.Dom
	 */
	/**
	 * @author Benny Bao (mailto:benny.bao@bstek.com)
	 * @author Frank Zhang (mailto:frank.zhang@bstek.com)
	 * @name dorado.util.Dom
	 * @class 提供DOM相关操作的工具类。
	 * @static
	 */
	window.$DomUtils = dorado.util.Dom = {
	
		/**
		 * 返回一个不可见的DIV节点。
		 * <p>
		 * 此处的不可见并非是指利用style.display或style.visibility设置成为不可见的DIV。
		 * 而一个本质可见却位于屏幕之外而无法被看到的DIV。
		 * </p>
		 * <p>
		 * 本方法最多只会创建一个不可见的DIV节点，因此每一次调用此方法我们都会得到相同的返回结果。
		 * </p>
		 * @return {HTMLElement} DIV节点。
		 */
		getInvisibleContainer: function() {
			var id = "_dorado_invisible_div";
			var div = document.getElementById(id);
			if (!div) {
				div = this.xCreate({
					tagName: "DIV",
					id: id,
					style: {
						position: "absolute",
						width: 100,
						height: 100,
						left: -200,
						top: -200,
						overflow: "hidden"
					}
				});
				document.body.appendChild(div);
			}
			return div;
		},
		
		getUndisplayContainer: function() {
			var id = "_dorado_undisplay_div";
			var div = document.getElementById(id);
			if (!div) {
				div = this.xCreate({
					tagName: "DIV",
					id: id,
					style: {
						visibility: "hidden",
						display: "none"
					}
				});
				document.body.appendChild(div);
			}
			return div;
		},
		
		/**
		 * 根据传入的节点返回节点所属的window对象。
		 * @param {HTMLElement} node HTML元素或节点。
		 * @return {Window} window对象。
		 */
		getOwnerWindow: function(node) {
			return dorado.Browser.msie ? node.ownerDocument.parentWindow : node.ownerDocument.defaultView;
		},
		
		/**
		 * 判断owner参数代表的节点是否是node参数代表的节点的上级节点。
		 * @param {HTMLElement} node 要判断的节点。
		 * @param {HTMLElement} owner 上级节点。
		 * @return {boolean} 是否上级节点。
		 */
		isOwnerOf: function(node, owner) {
			while (true) {
				node = node.parentNode;
				if (node == null) return false;
				if (node == owner) return true;
			}
		},
		
		/**
		 * 根据fn函数所代表的匹配规则，查找第一个匹配的父节点。
		 * @param {HTMLElement} node 子节点。
		 * @param {Function} fn 用于描述匹配规则的函数。
		 * @param {boolean} [includeSelf=true] 查找范围中是否包含node参数指定的子节点自身，默认为true。
		 * @return {HTMLElement} 找到的父节点。
		 *
		 * @example
		 * // 查找并返回node节点的&lt;DIV&gt;类型的父节点
		 * var parentDiv = dorado.util.Dom.findParent(node, function(parentNode) {
		 * 	return parentNode.tagName.toLowerCase() == "div";
		 * });
		 */
		findParent: function(node, fn, includeSelf) {
			if (includeSelf !== false) {
				if (fn(node)) return node;
			}
			while (true) {
				node = node.parentNode;
				if (!node) break;
				if (fn(node)) return node;
			}
			return null;
		},
		
		/**
		 * 根据以JSON形式定义的组件的模板信息快速的创建DOM元素。
		 * @param {Object|Object[]} template JSON形式定义的组件的模板信息。
		 * @param {Object} [arg] JSON形式定义的模板参数。
		 * @param {Object} [context] 用于在创建过程中搜集子元素引用的上下文对象。
		 * 对于那些模板信息中带有contextKey属性的子元素，本方法会自动将相应的子元素的引用添加到context的属性中。
		 * @return {HTMLElement|HTMLElement[]} 新创建的HTML元素或HTML元素的数组。
		 *
		 * @example
		 * // 创建一个按钮
		 * $DomUtils.xCreate({
		 * 	tagName: "button",
		 * 	content: "Click Me",	// 定义按钮的标题
		 * 	style: {	// 定义按钮的style
		 * 		border: "1px black solid",
		 * 		backgroundColor: "white"
		 * 	},
		 * 	onclick: function() {	// 定义onclick事件
		 * 		alert("Button clicked.");
		 * 	}
		 * });
		 * 
		 * @example
		 * // 创建一个按钮
		 * $DomUtils.xCreate({
		 * 	tagName: "DIV",
		 * 	contentText: "<Input>"	// contentText属性类似于content，但contentText中的文本内容不会被识别成为HTML
		 * });
		 *
		 * @example
		 * // 创建两个DIV, 同时将两个DIV注册到上下文中
		 * var context = {};
		 * $DomUtils.xCreate([
		 * 	{
		 * 		tagName: "div",
		 * 		content: "Content of DIV1",
		 * 		contextKey: "div1"
		 * 	},
		 * 	{
		 * 		tagName: "div",
		 * 		content: "Content of DIV2",
		 * 		contextKey: "div2"
		 * 	}
		 * ], null, context);
		 * var div1 = context.div1;
		 * var div2 = context.div2;
		 *
		 * @example
		 * // 一个表格
		 * $DomUtils.xCreate(
		 * 	{
		 * 		tagName: "table",
		 * 		content: [
		 * 			{
		 * 				tagName: "tr",
		 * 				content: [
		 * 					{
		 * 						tagName: "td"
		 * 						content: "1.1"
		 * 					},
		 * 					{
		 * 						tagName: "td"
		 * 						content: "1.2"
		 * 					}
		 * 				]
		 * 			},
		 * 			{
		 * 				tagName: "tr",
		 * 				content: [
		 * 					{
		 * 						tagName: "td"
		 * 						content: "2.1"
		 * 					},
		 * 					{
		 * 						tagName: "td"
		 * 						content: "2.2"
		 * 					}
		 * 				]
		 * 			}
		 * 		]
		 * 	}
		 * );
		 *
		 * @example
		 * // 使用带参数的模板
		 * var template = function(arg) {
		 * 	return [ {
		 * 		tagName : "button",
		 * 		content : arg.buttonText1
		 * 	}, {
		 * 		tagName : "button",
		 * 		content : arg.buttonText2
		 * 	} ]
		 * };
		 * var arg = {
		 * 	buttonText1 : "Button 1",
		 * 	buttonText2 : "Button 2"
		 * };
		 * $DomUtils.xCreate(template, arg);
		 */
		xCreate: function(template, arg, context) {
		
			function setAttrs(el, attrs, jqEl) {
				//attrName is not global. modified by frank
				var $el = jQuery(el);
				for (var attrName in attrs) {
					var attrValue = attrs[attrName];
					switch (attrName) {
						case "style":
							if (attrValue.constructor == String) {
								$el.attr("style", attrValue);
							} else {
								for (var styleName in attrValue) {
									var v = attrValue[styleName];
									if (styleName.match(/^width$|^height$|^top$|^left$|^right$|^bottom$/)) {
										if (isFinite(v)) v += "px";
									}
									el.style[styleName] = v;
								}
							}
							break;
							
						case "outerWidth":
							jqEl.outerWidth(attrValue);
							break;
							
						case "outerHeight":
							jqEl.outerHeight(attrValue);
							break;
							
						case "tagName":
						case "content":
						case "contentText":
							continue;
							
						case "contextKey":
							if (context instanceof Object && attrValue && typeof attrValue == "string") {
								context[attrValue] = el;
							}
							continue;
						
						case "data":
							$el.data(attrValue);
							break;
							
						default:
							if (attrName.substr(0, 2) == "on") { // event?
								var event = attrName.substr(2);
								if (typeof attrValue != "function") attrValue = new Function(attrValue);
								jqEl.bind(event, attrValue);
							} else {
								el[attrName] = attrValue;
							}
					}
				}
				return el;
			}
			
			function setText(el, content, jqEl, isText) {
				var isHtml = /(<\S[^><]*>)|(&.+;)/g;
				if (isText !== true && content.match(isHtml) != null && el.tagName.toUpperCase() != "TEXTAREA") {
					el.innerHTML = content;
				} else {
					if (dorado.Browser.mozilla) {
						el.innerHTML = content.replace(/&/g, '&amp;').replace(/>/g, '&gt;').replace(/</g, '&lt;').replace(/\n/g, "<br />\n");
					}
					else {
						el.innerText = content;
					}
				}
				return el;
			}
			
			function appendChild(parentEl, el) {
				if (/* dorado.Core.msie && */parentEl.nodeName.toUpperCase() == "TABLE" &&
				el.nodeName.toUpperCase() == "TR") {
					var tbody;
					if (parentEl && parentEl.tBodies[0]) {
						tbody = parentEl.tBodies[0];
						
					} else {
						tbody = parentEl.appendChild(document.createElement("tbody"));
					}
					parentEl = tbody;
				}
				parentEl.appendChild(el);
			}
			
			if (typeof template == "function") {
				template = template(arg || window);
			}
			
			if (template instanceof Array) {
				var elements = [];
				for (var i = 0; i < template.length; i++) {
					elements.push(this.xCreate(template[i], arg, context));
				}
				return elements;
			}
			
			var tagName = template.tagName || "DIV";
			tagName = tagName.toUpperCase();
			var content = template.content;
			
			var el;
			if (dorado.Core.msie && tagName == "INPUT" && template.type) {
				el = document.createElement("<" + tagName + " type=\"" + template.type + "\"/>");
				
			} else {
				el = document.createElement(tagName);
			}
			var jqEl = jQuery(el);
			el = setAttrs(el, template, jqEl);
			
			if (content != null) {
				if (content.constructor == String) {
					if (content.charAt(0) == '^') {
						appendChild(el, document.createElement(content.substring(1)));
					} else {
						el = setText(el, content, jqEl);
					}
				} else {
					if (content instanceof Array) {
						for (var i = 0; i < content.length; i++) {
							var c = content[i];
							if (c.constructor == String) {
								if (c.charAt(0) == '^') {
									appendChild(el, document.createElement(c.substring(1)));
								} else {
									appendChild(el, document.createTextNode(c));
								}
							} else {
								appendChild(el, this.xCreate(c, arg, context));
							}
						}
					} else if (content.nodeType) {
						appendChild(el, content);
					} else {
						appendChild(el, this.xCreate(content, arg, context));
					}
				}
			}
			else {
				var contentText = template.contentText;
				if (contentText != null && contentText.constructor == String) {
					el = setText(el, contentText, jqEl, true);
				}
			}
			return el;
		},
		
		BLANK_IMG: dorado.Setting["common.contextPath"] + "dorado/client/resources/blank.gif",
		
		setImgSrc: function(img, src) {
			src = $url(src) || BLANK_IMG;
			if (img.src != src) img.src = src;
		},
		
		setBackgroundImage: function(el, url) {
			if (url) {
				var reg = /url\(.*\)/i, m = url.match(reg);
				if (m) {
					m = m[0];
					var realUrl = jQuery.trim(m.substring(4, m.length - 1));
					realUrl = $url(realUrl);
					el.style.background = url.replace(reg, "url(" + realUrl + ")");
					return;
				}
				url = $url(url);
				url = "url(" + url + ")";
			} else {
				url = "";
			}
			if (el.style.backgroundImage != url) {
				el.style.backgroundImage = url;
				el.style.backgroundPosition = "center";
			}
		},
		
		placeCenterElement: function(element, container) {
			var offset = $fly(container).offset();
			element.style.left = (offset.left + (container.offsetWidth - element.offsetWidth) / 2) + "px";
			element.style.top = (offset.top + (container.offsetHeight - element.offsetHeight) / 2) + "px";
		},
		
		getOrCreateChild: function(parentNode, index, tagName, fn) {
			var child, refChild;
			if (index < parentNode.childNodes.length) {
				child = refChild = parentNode.childNodes[index];
				if (fn && fn(child) === false) child = null;
			}
			if (!child) {
				child = (typeof tagName == "function") ? tagName(index) : ((tagName.constructor == String) ? document.createElement(tagName) : this.xCreate(tagName));
				(refChild) ? parentNode.insertBefore(child, refChild) : parentNode.appendChild(child);
			}
			return child;
		},
		
		removeChildrenFrom: function(parentNode, from, fn) {
			var toRemove = [];
			for (var i = parentNode.childNodes.length - 1; i >= from; i--) {
				var child = parentNode.childNodes[i];
				if (fn && fn(child) === false) continue;
				toRemove.push(child);
			}
			if (toRemove.length > 0) $fly(toRemove).remove();
		},
		
		isDragging: function() {
			var currentDraggable = jQuery.ui.ddmanager.current;
			return (currentDraggable && currentDraggable._mouseStarted);
		},
		
		/**
		 * 取得触发事件的表格单元格。
		 * @param {Event} event 浏览器的event对象。
		 * @return {Object} 触发事件的表格单元格，包含row、column、element属性。
		 */
		getCellPosition: function(event) {
			var element = event.srcElement || event.target, row = -1, column = -1;
			while (element && element != element.ownerDocument.body) {
				var tagName = element.tagName.toLowerCase();
				if (tagName == "td") {
					row = element.parentNode.rowIndex;
					column = element.cellIndex;
					break;
				}
				element = element.parentNode;
			}
			if (element != element.ownerDocument.body) {
				return {
					"row": row,
					"column": column,
					"element": element
				};
			}
			return null;
		},
		
		/**
		 * 将一个DOM对象一环绕的方式停靠在另一个固定位置DOM对象的周围。
		 * <p>
		 * 该方法把固定位置的DOM对象的横向和纵向进行了区域划分。<br />
		 * 横向可以分为五个区域，分别是left、innerleft、center、innerright、top。<br />
		 * 纵向也可以分为5个区域，分别是top、innertop、center、innerbottom、bottom。<br />
		 * 如下图所示（橙色方块代表fixedElement，从fixedElement的左上角作为原点坐标，可以为水平和垂直方向分别划分5个区域，该图主要展示水平和垂直区域的划分）：
		 * </p>
		 * <img class="clip-image" src="images/dock-around-1.jpg">
		 * <p>
		 * 根据水平方向五个区域，垂直方向五个区域，那么对水平方向和垂直方向进行组合，则可以得出25中组合，如下图所示：
		 * </p>
		 * <img class="clip-image" src="images/dock-around-2.jpg">
		 * <p>
		 * 这些组合基本上可以满足用户的大部分需求，如果计算出来的位置需要微调，可以使用offsetLeft、offsetTop进行微调。
		 * </p>
		 *
		 * <p>
		 * 另外，此方法在设定停靠位置的同时会尽可能使DOM对象位于屏幕的可见区域内。
		 * 该方法会先判断出该组件是横向超出，还是纵向超出，然后根据要停靠的DOM对象的align和vAlign设置，进行一个合理的方向的调整。
		 * 如果该方向可以显示在屏幕范围内，则使用该位置。<br />
		 * 如果仍然不能显示在屏幕范围内，我们就认为该组件的超出触发，会调用该组件的overflowHandler来处理组件的超出。
		 * </p>
		 * @param {HTMLElement} element 要停靠的DOM对象。
		 *     此DOM对象是绝对定位的(style.position=absolute)并且其DOM树处于顶层位置(即其父节点是document.body)。
		 * @param {HTMLElement|window} fixedElement 固定位置的DOM对象，如果是window，则表示该要停靠的DOM元素相对于当前可视范围进行停靠。
		 * @param {Object} options 以JSON方式定义的选项。
		 * @param {String} [options.align=innerleft] 在水平方向上，停靠的DOM对象停靠在固定位置的DOM对象的位置。可选值为left、innerleft、center、innerright、top。
		 * @param {String} [options.vAlign=innertop] 在垂直方向上，停靠的DOM对象停靠在固定位置的DOM对象的位置。可选值为top、innertop、center、innerbottom、bottom。
		 * @param {int} [options.gapX=0] 在水平方向上，停靠的DOM对象与固定位置的DOM对象之间的间隙大小，可以为正，可以为负。
		 * @param {int} [options.gapY=0] 在垂直方向上，停靠的DOM对象与固定位置的DOM对象之间的间隙大小，可以为正，可以为负。
		 * @param {int} [options.offsetLeft=0] 使用align计算出组件的位置的水平偏移量，可以为正，可以为负。
		 * @param {int} [options.offsetTop=0] 使用vAlign计算出组件的位置的垂直偏移量，可以为正，可以为负。
		 * @param {boolean} [options.autoAdjustPosition=true] 当使用默认的align、vAlign计算的位置超出屏幕可见范围以后，是否要对停靠DOM对象的位置进行调整，默认为true，即进行调整。
		 * @param {boolean} [options.handleOverflow=true] 当组件无法显示在屏幕范围以内以后，就认为停靠的DOM对象的超出触发了，该属性用来标示是否对这种情况进行处理，默认会对这种情况进行处理。
		 * @param {Function} [options.overflowHandler] 当停靠的DOM的超出触发以后，要调用的函数。
		 *
		 * @return {Object} 计算出来的位置。
		 */
		dockAround: function(element, fixedElement, options) {
			options = options || {};
			var align = options.align || "innerleft", vAlign = options.vAlign || "innertop",
				offsetLeft = options.offsetLeft || 0, offsetTop = options.offsetTop || 0,
				autoAdjustPosition = options.autoAdjustPosition, handleOverflow = options.handleOverflow,
				offsetParentEl = $fly(element.offsetParent), offsetParentWidth = offsetParentEl.width(),
				offsetParentHeight = offsetParentEl.height(), offsetParentBottom, offsetParentRight, overflowTrigger = false,
				offsetParentOffset = offsetParentEl.offset() || { left: 0, top: 0 }, maxWidth, maxHeight, adjustLeft, adjustTop;

			offsetParentRight = offsetParentWidth + offsetParentOffset.left;
			offsetParentBottom = offsetParentHeight + offsetParentOffset.top;

			var position = jQuery(fixedElement == window ? document.body : fixedElement).offset(),
				left = position.left, top = position.top, rect, newAlign, vAlignPrefix, overflowRect;

			if (fixedElement) {
				rect = getRect(fixedElement);
				if (options.gapX) {
					rect.left -= options.gapX;
					rect.right += options.gapX;
				}
				if (options.gapY) {
					rect.top -= options.gapY;
					rect.bottom += options.gapY;
				}

				if (align) {
					left = getLeft(rect, element, align);

					if ((left + element.offsetWidth > offsetParentRight) || (left < 0)) {
						if (!(autoAdjustPosition === false)) {
							if (align != "center") {
								if (align.indexOf("left") != -1) {
									newAlign = align.replace("left", "right");
								} else if (align.indexOf("right") != -1) {
									newAlign = align.replace("right", "left");
								}
								adjustLeft = getLeft(rect, element, newAlign);
								if ((adjustLeft + element.offsetWidth > offsetParentRight) || (adjustLeft < 0)) {
									left = 0;
									overflowTrigger = true;
									maxWidth = offsetParentWidth;
								} else {
									left = adjustLeft;
									align = newAlign;
								}
							} else if (align == "center") {
								if (left < 0) {
									left = 0;
									overflowTrigger = true;
									maxWidth = offsetParentWidth;
								}
							}
						} else {
							overflowTrigger = true;
						}
					}
				}

				if (vAlign) {
					top = getTop(rect, element, vAlign);

					if ((top + element.offsetHeight > offsetParentBottom) || (top < 0)) {
						if (!(autoAdjustPosition === false)) {
							if (vAlign != "center") {
								if (vAlign.indexOf("top") != -1) {
									vAlign = vAlign.replace("top", "bottom");
									vAlignPrefix = vAlign.replace("top", "");
								} else if (vAlign.indexOf("bottom") != -1) {
									vAlign = vAlign.replace("bottom", "top");
									vAlignPrefix = vAlign.replace("bottom", "");
								}

								adjustTop = getTop(rect, element, vAlign);

								if (adjustTop + element.offsetHeight > offsetParentBottom) {//超出的情况下才会触发这个
									//overflow trigger
									overflowTrigger = true;
									if (adjustTop < (offsetParentHeight / 2)) {
										top = adjustTop;
										maxHeight = offsetParentHeight - top;
										vAlign = vAlignPrefix + "bottom";
									} else {
										maxHeight = element.offsetHeight + top;
										vAlign = vAlignPrefix + "top";
									}
								} else if (adjustTop < 0) {//top < 0的情形下才会触发这个
									//overflow trigger
									overflowTrigger = true;
									if (top > (offsetParentHeight / 2)) {
										top = 0;
										maxHeight = element.offsetHeight + adjustTop;
										vAlign = vAlignPrefix + "top";
									} else {
										maxHeight = offsetParentHeight - top;
										vAlign = vAlignPrefix + "bottom";
									}
								} else {
									top = adjustTop;
								}
							} else if (vAlign == "center") {
								if (top < 0) {
									overflowTrigger = true;
									top = 0;
									maxHeight = offsetParentHeight;
								}
							}
						} else {
							overflowTrigger = true;
						}
					}
				}
			}

			//console.log("overflowTrigger:" + overflowTrigger);
			options.align = align;
			options.vAlign = vAlign;

			var finalLeft = left + offsetLeft /**+ $fly(element.offsetParent).scrollLeft()*/,
				finalTop = top + offsetTop /**+ $fly(element.offsetParent).scrollTop() */;

			$fly(element).offset({ left: finalLeft, top: finalTop });

			finalLeft = parseInt($fly(element).css("left"), 10);
			finalTop = parseInt($fly(element).css("top"), 10);

			if (!(handleOverflow === false) && overflowTrigger) {
				if (typeof options.overflowHandler == "function") {
					overflowRect = {
						left: finalLeft,
						top: finalTop,
						align: align,
						vAlign: vAlign,
						maxHeight: maxHeight,
						maxWidth: maxWidth
					};
					options.overflowHandler.call(null, overflowRect);
				}
			}

			return {
				left: finalLeft,
				top: finalTop,
				0: finalLeft,
				1: finalTop
			};
		},

		/**
		 * 将一个绝对定位(style.position=absolute)的DOM对象放置在屏幕或另一个DOM对象的可见区域内。
		 *
		 * @param {HTMLElement} element 要放置的DOM对象。
		 *     此DOM对象是绝对定位的(style.position=absolute)并且其DOM树处于顶层位置(即其父节点是document.body)。
		 * @param {Object} options 以JSON方式定义的选项。
		 * @param {HTMLElement} options.parent 作为容器的DOM对象（并不是指DOM结构上的父节点，仅指视觉上的关系）。如果不指定此属性则表示放置在屏幕可见区域内。
		 * @param {int} options.offsetLeft 水平偏移量，可以为正，可以为负。
		 * @param {int} options.offsetTop 垂直偏移量，可以为正，可以为负。
		 * @param {boolean} options.autoAdjustPosition 当使用指定的position计算的位置超出屏幕可见范围以后，是否要对停靠DOM对象的位置进行调整，默认为true，即进行调整。
		 * @param {boolean} options.handleOverflow 当组件无法显示在屏幕范围以内以后，认为停靠的DOM的超出触发了，该属性用来标示是否对这种情况进行处理，默认会对这种情况进行处理。
		 * @param {Function} options.overflowHandler 当停靠的DOM的超出触发以后，要调用的函数。
		 *
		 * @return {Object} 计算出来的位置。
		 */
		locateIn: function(element, options) {
			options = options || {};
			var offsetLeft = options.offsetLeft || 0, offsetTop = options.offsetTop || 0, handleOverflow = options.handleOverflow,
				parent = options.parent, offsetParentEl = $fly(element.offsetParent), offsetParentWidth = offsetParentEl.width(),
				offsetParentHeight = offsetParentEl.height(), adjustLeft, adjustTop, overflowTrigger = false, maxWidth, maxHeight,
				position = options.position, left = position ? position.left : 0, top = position ? position.top : 0,
				autoAdjustPosition = options.autoAdjustPosition;

			if (parent) {
				var parentPos = $fly(parent).offset();
				left += parentPos.left;
				top += parentPos.top;
			}

			if (!(autoAdjustPosition === false)) {
				if (top < 0) {
					top = 0;
				}
				if (left < 0) {
					left = 0;
				}
				if (left + element.offsetWidth > offsetParentWidth) {
					if (!(handleOverflow === false)) {
						adjustLeft = left - element.offsetWidth;
						if (adjustLeft > 0) {
							left = adjustLeft;
						} else {
							left = 0;
							overflowTrigger = true;
							maxWidth = offsetParentWidth;
						}
					} else {
						overflowTrigger = true;
					}
				}
				if (top + element.offsetHeight >= offsetParentHeight) {
					if (!(handleOverflow === false)) {
						adjustTop = top - element.offsetHeight;
						if (adjustTop < 0) {
							top = 0;
							overflowTrigger = true;
							maxHeight = offsetParentHeight;
						} else {
							top = adjustTop;
						}
					} else {
						overflowTrigger = true;
					}
				}
			}

			var finalLeft = left + offsetLeft, finalTop = top + offsetTop;
			$fly(element).left(finalLeft).top(finalTop);

			if (handleOverflow !== false && overflowTrigger) {
				if (typeof options.overflowHandler == "function") {
					var overflowRect = {
						left: finalLeft,
						top: finalTop,
						maxHeight: maxHeight,
						maxWidth: maxWidth
					};
					options.overflowHandler.call(null, overflowRect);
				}
			}

			return {
				left: finalLeft,
				top: finalTop,
				0: finalLeft,
				1: finalTop
			};
		},
		
		/**
		 * 禁止某DOM对象（包含其中的子元素）被鼠标选中。
		 * @param {HTMLElement} element DOM对象。
		 */
		disableUserSelection: function(element) {
			if (dorado.Browser.msie) {
				$fly(element).bind("selectstart.disableUserSelection", onSelectStart);
			} else {
				element.style.MozUserSelect = "none";
				element.style.KhtmlUserSelect = "none";
				element.style.webkitUserSelect = "none";
				element.style.OUserSelect = "none";
				element.unselectable = "on";
			}
		},
		
		/**
		 * 允许某DOM对象（包含其中的子元素）被鼠标选中。
		 * @param {HTMLElement} element DOM对象。
		 */
		enableUserSelection: function(element) {
			if (dorado.Browser.msie) {
				$fly(element).unbind("selectstart.disableUserSelection");
			} else {
				element.style.MozUserSelect = "";
				element.style.KhtmlUserSelect = "";
				element.style.webkitUserSelect = "";
				element.style.OUserSelect = "";
				element.unselectable = "";
			}
		},
		
		/**
		 * 将相应元素提到最前面，即为相应元素设置合适的style.zIndex使其不至于被其他元素阻挡。
		 * @param {HTMLElement} element DOM对象。
		 * @return {int} 该DOM对象获得的新的zIndex的值。
		 */
		bringToFront: function(dom) {
			if (dorado.Browser.msie) maxZIndex += 2;
			else maxZIndex += 1;
			if (dom) dom.style.zIndex = maxZIndex;
			return maxZIndex;
		}
	};
	
	function onSelectStart() {
		return false;
	}
	
	function getRect(element) {
		if (element) {
			var width, height;
			if (element == window) {
				var $win = $fly(window), left = $win.scrollLeft(), top = $win.scrollTop();
				
				width = $win.width();
				height = $win.height();
				
				return {
					left: left,
					top: top,
					right: left + width,
					bottom: top + height
				};
			}
			
			var offset = $fly(element).offset();
			if (element == document.body) {
				width = $fly(window).width();
				height = $fly(window).height();
			} else {
				width = $fly(element).outerWidth();
				height = $fly(element).outerHeight();
			}
			return {
				left: offset.left,
				top: offset.top,
				right: offset.left + width,
				bottom: offset.top + height
			};
		}
		return null;
	}
	
	//获取相对触发元素的left
	function getLeft(rect, dom, align) {
		switch (align.toLowerCase()) {
			case "left":
				return rect.left - dom.offsetWidth;
			case "innerleft":
				return rect.left;
			case "center":
				return (rect.left + rect.right - dom.offsetWidth) / 2;
			case "innerright":
				return rect.right - dom.offsetWidth;
			case "right":
			default:
				return rect.right;
		}
	}
	
	//获取相对触发元素的top
	function getTop(rect, dom, vAlign) {
		switch (vAlign.toLowerCase()) {
			case "top":
				return rect.top - dom.offsetHeight;
			case "innertop":
				return rect.top;
			case "center":
				return (rect.top + rect.bottom - dom.offsetHeight) / 2;
			case "innerbottom":
				return rect.bottom - dom.offsetHeight;
			case "bottom":
			default:
				return rect.bottom;
		}
	}
	
	function findValidContent(container) {
		//performance issue modified by frank
		var childNodes = container.childNodes;
		for (var i = 0, j = childNodes.length; i < j; i++) {
			var child = childNodes[i];
			with (child.style) {
				if (display != "none" && (position == '' || position == "static")) {
					return child;
				}
			}
		}
		return null;
	}
	
})();
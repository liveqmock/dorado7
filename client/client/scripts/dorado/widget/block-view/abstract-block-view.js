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

	/**
	 * @name dorado.widget.blockview
	 * @namespace 块状列表控件所使用的一些相关类的命名空间。
	 */
	dorado.widget.blockview = {};
	
	/**
	 * @author Benny Bao (mailto:benny.bao@bstek.com)
	 * @class 块状列表控件的数据模型。
	 *        <p>
	 *        用于辅助块状列表控件管理数据的对象。
	 *        </p>
	 * @extends dorado.widget.list.ItemModel
	 */
	dorado.widget.blockview.BlockItemModel = $extend(dorado.widget.list.ItemModel, /** @scope dorado.widget.blockview.BlockItemModel.prototype */ {
		_lineSize: 1,
		
		/**
		 * 设置每一行或列中包含的块的个数。
		 *
		 * @param {Object}
		 *            lineSize 块的个数。
		 */
		setLineSize: function(lineSize) {
			this._lineSize = lineSize;
		},
		
		/**
		 * 返回总的行数或列数。 return {int} 行数或列数。
		 */
		getLineCount: function() {
			return parseInt((this.getItemCount() - 1) / this._lineSize + 1);
		},
		
		setScrollPos: function(scrollPos) {
			var itemCount = this.getItemCount(), lineCount = this.getLineCount();
			if (lineCount > 0) {
				this._startIndex = parseInt(((scrollPos / this._scrollSize) || 0) * lineCount) * this._lineSize;
			} else {
				this._startIndex = 0;
			}
		}
	});
	
	/**
	 * @author Benny Bao (mailto:benny.bao@bstek.com)
	 * @class 默认的块渲染器。
	 * @extends dorado.Renderer
	 */
	dorado.widget.blockview.DefaultBlockRenderer = $extend(dorado.Renderer, /** @scope dorado.widget.blockview.DefaultBlockRenderer.prototype */ {
	
		/**
		 * 渲染。
		 *
		 * @param {HTMLElement}
		 *            dom 块对应的DOM对象。
		 * @param {Object}
		 *            arg 渲染参数。
		 * @param {Object|dorado.Entity}
		 *            arg.data 对应的数据实体。
		 */
		render: function(dom, arg) {
			var data = arg.data;
			dom.innerText = dom.itemIndex + ": " + data;
		}
	});
	
	/**
	 * @author Benny Bao (mailto:benny.bao@bstek.com)
	 * @class 图片块的渲染器。
	 * @extends dorado.widget.blockview.DefaultBlockRenderer
	 * @param {Object}
	 *            [options] 包含配置信息的JSON对象。<br>
	 *            该对象中的子属性将在初始化的过程中被复制到渲染器中，此处支持的具体的属性见本对象文档的Properties段落。
	 */
	dorado.widget.blockview.ImageBlockRenderer = $extend(dorado.widget.blockview.DefaultBlockRenderer, /** @scope dorado.widget.blockview.ImageBlockRenderer.prototype */ {
	
		/**
		 * 用于从数据实体中读取图片文字标签的属性名。
		 *
		 * @type String
		 * @default "caption"
		 */
		captionProperty: "caption",
		
		/**
		 * 用于从数据实体中读取图片URL的属性名。
		 *
		 * @type String
		 * @default "image"
		 */
		imageProperty: "image",
		
		/**
		 * 用于从数据实体中读取提示信息的属性名。
		 *
		 * @type String
		 */
		tipProperty: null,
		
		/**
		 * 当数据实体中没有具体的图片可显示时使用的默认图片的URL。
		 *
		 * @type String
		 * @default ">dorado/client/resources/blank.gif"
		 */
		blankImage: ">dorado/client/resources/blank.gif",
		
		/**
		 * 块内部的留白的大小，像素值。
		 *
		 * @type int
		 * @default 2
		 */
		padding: 2,
		
		/**
		 * 图片与图片文字标签之间的留白的大小，像素值。
		 *
		 * @type int
		 * @default 2
		 */
		spacing: 2,
		
		/**
		 * 文字标签的高度。 如果此高度设置为0则表示不显示文字标签。
		 *
		 * @type int
		 * @default 17
		 */
		labelHeight: 17,
		
		/**
		 * 是否拉伸图片以填充块的空间。
		 *
		 * @type boolean
		 */
		stretchImage: false,
		
		constructor: function(options) {
			dorado.Object.apply(this, options);
		},
		
		getImageDom: function(dom) {
			var img = dom.firstChild;
			if (img == null) {
				img = $DomUtils.xCreate({
					tagName: "IMG",
					style: {
						position: "absolute"
					}
				});
				dom.appendChild(img);
			}
			return img;
		},
		
		getLabelDom: function(dom) {
			var label = dom.lastChild;
			if (label == null || label.nodeName != "CENTER") {
				label = $DomUtils.xCreate({
					tagName: "CENTER",
					style: {
						position: "absolute"
					},
					content: "^LABEL"
				});
				dom.appendChild(label);
			}
			return label;
		},
		
		render: function(dom, arg) {
			var imageDom = this.getImageDom(dom), entity = arg.data;
			
			var labelHeight = 0;
			if (this.captionProperty && this.labelHeight > 0) {
				labelHeight = this.labelHeight;
				var labelDom = this.getLabelDom(dom);
				var label = (entity instanceof dorado.Entity) ? entity.get(this.captionProperty) : entity[this.captionProperty];
				$fly(labelDom).css({
					bottom: this.padding,
					width: dom.clientWidth - this.padding * 2,
					height: labelHeight
				});
				labelDom.firstChild.innerText = label;
			}
			
			if (this.tipProperty && dorado.TipManager) {
				var tip = (entity instanceof dorado.Entity) ? entity.get(this.tipProperty) : entity[this.tipProperty];
				if (tip) {
					dorado.TipManager.initTip(dom, {
						text: tip
					});
				} else {
					dorado.TipManager.deleteTip(dom);
				}
			}
			
			var self = this;
			var maxWidth = dom.clientWidth - this.padding * 2;
			var maxHeight = dom.clientHeight - labelHeight - this.spacing - this.padding * 2;
			if (this.stretchImage) {
				$fly(imageDom).css({
					left: this.padding,
					top: this.padding,
					width: maxWidth,
					height: maxHeight
				});
			} else {
				$fly(imageDom).bind("load", function() {
					var left, top, width = imageDom.offsetWidth, height = imageDom.offsetHeight;
					if (width > maxWidth) {
						height = Math.round(maxWidth * height / width);
						width = maxWidth;
					}
					if (height > maxHeight) {
						width = parseInt(maxHeight * width / height);
						height = maxHeight;
					}
					left = Math.round((dom.clientWidth - width) / 2);
					top = Math.round((dom.clientHeight - labelHeight - self.spacing - height) / 2);
					$fly(imageDom).css({
						left: left,
						top: top,
						width: width,
						height: height
					});
				});
			}
			var image = (entity instanceof dorado.Entity) ? entity.get(this.imageProperty) : entity[this.imageProperty];
			$DomUtils.setImgSrc(imageDom, image || this.blankImage);
		}
	});
	
	/**
	 * @author Benny Bao (mailto:benny.bao@bstek.com)
	 * @class 模板块的渲染器。
	 * @extends dorado.widget.blockview.DefaultBlockRenderer
	 * @param {Object}
	 *            [options] 包含配置信息的JSON对象。
	 */
	dorado.widget.blockview.TemplateBlockRenderer = $extend(dorado.widget.blockview.DefaultBlockRenderer, /** @scope dorado.widget.blockview.ImageBlockRenderer.prototype */ {
	
		/**
		 * 用于从数据实体中读取图片文字标签的属性名。
		 *
		 * @type String
		 * @default "caption"
		 */
		template: "Template",
		
		constructor: function(options) {
			dorado.Object.apply(this, options);
		},
		
		render: function(dom, arg) {
			var item = arg.data, html = '', context = {
				control: arg.control,
				dom: dom,
				item: item
			};
			if (item != null) {
				if (item instanceof dorado.Entity) {
					context.data = item.getWrapper({ textMode: true, readOnly: true });
				} else {
					context.data = item;
				}
				html = _.template(this.template, context);
			}
			dom.innerHTML = html;
		}
	});
	
	/**
	 * @author Benny Bao (mailto:benny.bao@bstek.com)
	 * @class 块状列表控件的抽象类。
	 * @abstract
	 * @extends dorado.widget.ViewPortList
	 */
	dorado.widget.AbstractBlockView = $extend(dorado.widget.ViewPortList, /** @scope dorado.widget.AbstractBlockView.prototype */ {
		$className: "dorado.widget.AbstractBlockView",
		
		ATTRIBUTES: /** @scope dorado.widget.AbstractBlockView.prototype */ {
			className: {
				defaultValue: "d-block-view"
			},
			
			/**
			 * 块的布局方式。 目前支持两种定义方式：
			 * <ul>
			 * <li>vertical - 垂直方向布局，由上向下。</li>
			 * <li>horizontal - 水平方向布局，由左向右。</li>
			 * </ul>
			 *
			 * @type String
			 * @attribute writeBeforeReady
			 * @default "vertical"
			 */
			blockLayout: {
				writeBeforeReady: true,
				defaultValue: "vertical"
			},
			
			/**
			 * 每行或列显示的块的个数。
			 * <p>
			 * 如果不设置此属性或设置为0表示有系统自动判断每行或列显示的块个数。
			 * </p>
			 *
			 * @type int
			 * @attribute
			 */
			lineSize: {},
			
			/**
			 * 默认的数据块的宽度。
			 *
			 * @type int
			 * @attribute
			 * @default 80
			 */
			blockWidth: {
				defaultValue: 80
			},
			
			/**
			 * 默认的数据块的高度。
			 *
			 * @type int
			 * @attribute
			 * @default 80
			 */
			blockHeight: {
				defaultValue: 80
			},
			
			/**
			 * 是否自动调整块的宽度或高度以充满整个行或列。
			 *
			 * @type boolean
			 * @attribute
			 */
			fillLine: {},
			
			/**
			 * 块渲染器。
			 *
			 * @type dorado.Renderer
			 * @attribute
			 */
			renderer: {
				setter: function(value) {
					if (typeof value == "string") value = eval("new " + value + "()");
					this._renderer = value;
				}
			},
			
			/**
			 * 水平方向上块与块之间空隙的大小。
			 *
			 * @type int
			 * @attribute
			 * @default 8
			 */
			horiSpacing: {
				defaultValue: 8
			},
			
			/**
			 * 垂直方向上块与块之间空隙的大小。
			 *
			 * @type int
			 * @attribute
			 * @default 8
			 */
			vertSpacing: {
				defaultValue: 8
			},
			
			/**
			 * 块状列表边界与块之间水平空隙的大小。
			 *
			 * @type int
			 * @attribute
			 * @default 8
			 */
			horiPadding: {
				defaultValue: 8
			},
			
			/**
			 * 块状列表边界与块之间垂直空隙的大小。
			 *
			 * @type int
			 * @attribute
			 * @default 8
			 */
			vertPadding: {
				defaultValue: 8
			},
			
			/**
			 * 块装饰器的大小。
			 * <p>
			 * 块装饰器是用于显示当前块或鼠标选定等特殊状态是使用的装饰对象。
			 * </p>
			 * <p>
			 * 此值是一个相对值，表示装饰器在每个方向上比块的尺寸大出的部分的大小。<br>
			 * 例如块的大小是80*80，而blockDecoratorSize=4，那么实际的块装饰器的大小将是88*88。
			 * </p>
			 *
			 * @type int
			 * @attribute
			 * @default 4
			 */
			blockDecoratorSize: {
				defaultValue: 4
			},

            /**
             * 高亮显示多选选中的行。
             * @type boolean
             * @attribute
             * @default true
             */
            highlightSelectedBlock: {
                defaultValue: true
            }
        },
		
		EVENTS: /** @scope dorado.widget.AbstractBlockView.prototype */ {
		
			/**
			 * 当块状列表渲染块时触发的事件。
			 *
			 * @param {Object}
			 *            self 事件的发起者，即组件本身。
			 * @param {Object}
			 *            arg 事件参数。
			 * @param {HTMLElement}
			 *            arg.dom 块对应的DOM对象。
			 * @param {Object|dorado.Entity}
			 *            arg.data 块对应的数据实体。
			 * @param {boolean}
			 *            #arg.processDefault 是否在事件结束后继续使用系统默认的渲染逻辑。
			 * @return {boolean}
			 *         是否要继续后续事件的触发操作，不提供返回值时系统将按照返回值为true进行处理。
			 * @event
			 */
			onRenderBlock: {},
			
			/**
			 * 当鼠标在某个块中按下时触发的事件。
			 *
			 * @param {Object}
			 *            self 事件的发起者，即组件本身。
			 * @param {Object}
			 *            arg 事件参数。
			 * @param {Object|dorado.Entity}
			 *            arg.data 块对应的数据实体。
			 * @return {boolean}
			 *         是否要继续后续事件的触发操作，不提供返回值时系统将按照返回值为true进行处理。
			 * @event
			 */
			onBlockMouseDown: {},
			
			/**
			 * 当鼠标在某个块中抬起时触发的事件。
			 *
			 * @param {Object}
			 *            self 事件的发起者，即组件本身。
			 * @param {Object}
			 *            arg 事件参数。
			 * @param {Object|dorado.Entity}
			 *            arg.data 块对应的数据实体。
			 * @return {boolean}
			 *         是否要继续后续事件的触发操作，不提供返回值时系统将按照返回值为true进行处理。
			 * @event
			 */
			onBlockMouseUp: {},
			
			/**
			 * 当某个块被点击时触发的事件。
			 *
			 * @param {Object}
			 *            self 事件的发起者，即组件本身。
			 * @param {Object}
			 *            arg 事件参数。
			 * @param {Object|dorado.Entity}
			 *            arg.data 块对应的数据实体。
			 * @return {boolean}
			 *         是否要继续后续事件的触发操作，不提供返回值时系统将按照返回值为true进行处理。
			 * @event
			 */
			onBlockClick: {},
			
			/**
			 * 当某个块被双击时触发的事件。
			 *
			 * @param {Object}
			 *            self 事件的发起者，即组件本身。
			 * @param {Object}
			 *            arg 事件参数。
			 * @param {Object|dorado.Entity}
			 *            arg.data 块对应的数据实体。
			 * @return {boolean}
			 *         是否要继续后续事件的触发操作，不提供返回值时系统将按照返回值为true进行处理。
			 * @event
			 */
			onBlockDoubleClick: {},
			
			onBlockTap: {},
			onBlockTapHold: {}
		},
		
		createItemModel: function() {
			return new dorado.widget.blockview.BlockItemModel();
		},
		
		createDom: function() {
			var dom = $DomUtils.xCreate({
				tagName: "DIV",
				content: {
					tagName: "DIV",
					style: {
						width: "100%",
						height: "100%"
					},
					content: "^DIV"
				}
			});

			var blockView = this;
			var scroller = blockView._scroller = dom.firstChild;
			var container = blockView._container = scroller.firstChild;
			blockView._modernScroller = dorado.util.Dom.modernScroll(scroller);

			var $scroller = $(scroller);
			$scroller.bind("modernScrolled", $scopify(blockView, blockView.onScroll));
			
			if (dorado.Browser.isTouch || $setting["common.simulateTouch"]) {
                $fly(blockView._container).css("position", "relative");
				$fly(dom).bind("tap", function(evt) {
					var blockDom = blockView._findBlockDom(evt);
					if (blockDom) {
						var data = $fly(blockDom).data("item");
						if (data) {
							blockView.fireEvent("onBlockTap", blockView, {
								data: data
							});
						}
					}
				}).bind("taphold", function(evt) {
					var blockDom = blockView._findBlockDom(evt);
					if (blockDom) {
						var data = $fly(blockDom).data("item");
						if (data) {
							blockView.fireEvent("onBlockTapHold", blockView, {
								data: data
							});
						}
					}
				});
			}
			else {
				$scroller.mouseover($scopify(blockView, function(evt) {
					if ($DomUtils.isDragging()) return;
					var blockDom = $DomUtils.findParent(evt.target, function(node) {
						return node.parentNode == container &&
						$fly(node).hasClass("block");
					});
					blockView.setHoverBlock(blockDom);
				})).mouseleave($scopify(blockView, function(evt) {
					blockView.setHoverBlock(null);
				}));
			}
			return dom;
		},
		
		refreshDom: function(dom) {
			var dynaSize, oldSize;
			if (this._blockLayout == "vertical") {
				dynaSize = this.hasRealHeight();
				if (dynaSize) oldSize = dom.offsetHeight;
			}
			else {
				dynaSize = this.hasRealWidth();
				if (dynaSize) oldSize = dom.offsetWidth;
			}
			
			$invokeSuper.call(this, arguments);
			
			var lineSize = this._lineSize, blockWidth = this._blockWidth, blockHeight = this._blockHeight;
			if (this._blockLayout == "vertical") {
				if (!(lineSize > 0)) {
					lineSize = (dom.clientWidth - this._horiPadding * 2) / (this._blockWidth + this._horiSpacing);
				}
			} else {
				if (!(lineSize > 0)) {
					lineSize = (dom.clientHeight - this._vertPadding * 2) / (this._blockHeight + this._vertSpacing);
				}
			}
			this._realLineSize = lineSize = (lineSize < 1) ? 1 : parseInt(lineSize);
			this._itemModel.setLineSize(lineSize);
			this._lineCount = this._itemModel.getLineCount();
			
			var width, height, container = this._container, $container = jQuery(container);			
			var pos = this._getContainerSize();
			if (this._blockLayout == "vertical") {
				$container.height(pos[1]).width(dom.clientWidth);
				if (this._lineSize > 0 && this._fillLine) {
					blockWidth = (dom.clientWidth - this._horiPadding * 2 - this._horiSpacing * (lineSize - 1)) / lineSize;
				}
			} else {
				$container.width(pos[0]).height(dom.clientHeight);
				if (this._lineSize > 0 && this._fillLine) {
					blockHeight = (dom.clientHeight - this._vertPadding * 2 - this._vertSpacing * (lineSize - 1)) / lineSize;
				}
			}
			
			this._realBlockWidth = blockWidth = (blockWidth < 1) ? 1 : parseInt(blockWidth);
			this._realBlockHeight = blockHeight = (blockHeight < 1) ? 1 : parseInt(blockHeight);
			
			if (this._scrollMode == "viewport") {
				this.refreshViewPortContent(this._container);
			} else {
				this.refreshContent(this._container);
			}
			
			if (dynaSize) {
				if (this._blockLayout == "vertical") {
					if (oldSize != dom.offsetHeight) this.notifySizeChange();
				}
				else {
					if (oldSize != dom.offsetWidth) this.notifySizeChange();
				}
			}
		},
		
		_getVisibleBlockRange: function() {
			var scroller = this._scroller, blockSize, end;
			if (this._blockLayout == "vertical") {
				blockSize = this._blockHeight + this._vertSpacing;
				start = parseInt((scroller.scrollTop - this._vertPadding) / blockSize);
				end = start + Math.round((scroller.clientHeight - this._vertPadding) / blockSize + 0.5);
			} else {
				blockSize = this._blockWidth + this._horiSpacing;
				start = parseInt((scroller.scrollLeft - this._horiPadding) / blockSize);
				end = start + Math.round((scroller.clientWidth - this._horiPadding) / blockSize + 0.5);
			}
			return [start * this._realLineSize, (end+1) * this._realLineSize];
		},
		
		refreshContent: function(container) {
			var fn;
			if (this._scrollMode == "lazyRender") {
				var count = this._getVisibleBlockRange()[1], i = 0;
				fn = function(row) {
					i++;
					return i < count;
				};
			}
			this.refreshItemDoms(container, false, fn);
			this._itemDomCount = this._itemModel.getItemCount();
		},
		
		refreshViewPortContent: function(container) {
			var itemModel = this._itemModel, itemCount = itemModel.getItemCount(), scroller = this._scroller;
			var topOrLeft, bottomOrRight;
			if (this._blockLayout == "vertical") {
				topOrLeft = scroller.scrollTop;
				bottomOrRight = scroller.scrollTop + scroller.clientHeight;
			} else {
				topOrLeft = scroller.scrollLeft;
				bottomOrRight = scroller.scrollLeft + scroller.clientWidth;
			}
			var itemDomCount, self = this;
			if (bottomOrRight > topOrLeft) {
				itemDomCount = this.refreshItemDoms(container, itemModel.isReverse(), function(itemDom) {
					if (itemDom.subIndex == self._realLineSize - 1) {
						return ((self._blockLayout == "vertical") ? (itemDom.offsetTop + itemDom.offsetHeight + self._vertSpacing) : (itemDom.offsetLeft + itemDom.offsetWidth + self._horiSpacing)) < bottomOrRight;
					}
					return true;
				}, true);
			} else {
				itemDomCount = viewPortHeight = 0;
			}
			this._itemDomCount = itemDomCount;
			
			if (this._blockLayout == "vertical") {
				itemModel.setScrollSize(this._dom.clientHeight, container.clientHeight);
			} else {
				itemModel.setScrollSize(this._dom.clientWidth, container.clientWidth);
			}
		},
		
		refreshItemDoms: function(itemDomContainer) {
			var currentDecorator = this._currentDecorator, hoverDecorator = this._hoverDecorator;
			if (currentDecorator) itemDomContainer.removeChild(currentDecorator);
			if (hoverDecorator) itemDomContainer.removeChild(hoverDecorator);
			
			$invokeSuper.call(this, arguments);
			
			if (hoverDecorator) itemDomContainer.insertBefore(hoverDecorator, itemDomContainer.firstChild);
			if (currentDecorator) itemDomContainer.insertBefore(currentDecorator, itemDomContainer.firstChild);
			
			var currentItemId = this.getRealCurrentItemId();
			if (currentItemId !== undefined && currentItemId !== null) {
				var itemDom = this._itemDomMap[currentItemId];
				if (itemDom) this.setCurrentBlock(itemDom);
			}
			else {
				this.setCurrentBlock(null);
			}
		},
		
		_getBlockPos: function(index) {
			var lineIndex = parseInt(index / this._realLineSize);
			var subIndex = index % this._realLineSize;
			var left, top;
			if (this._blockLayout == "vertical") {
				left = this._horiPadding + (this._realBlockWidth + this._horiSpacing) * subIndex;
				top = this._vertPadding + (this._realBlockHeight + this._vertSpacing) * lineIndex;
			} else {
				left = this._horiPadding +
				(this._realBlockWidth + this._horiSpacing) * lineIndex;
				top = this._vertPadding + (this._realBlockHeight + this._vertSpacing) * subIndex;
			}
			return [left, top, lineIndex, subIndex];
		},
		
		removeItemDom: function(blockDom) {
			$invokeSuper.call(this, arguments);
			this._itemDomCount--;
			this._lineCount = parseInt((this._itemDomCount - 1) / this._realLineSize + 1);
		},
		
		refreshItemDom: function(itemDomContainer, item, index, prepend) {
			var flag = prepend ? -1 : 1;
			if (index < 0) flag = -flag;
			index = (this._itemModel.getStartIndex() || 0) + index * flag;
            var itemDom, itemId;

            var currentDecorator = this._currentDecorator, hoverDecorator = this._hoverDecorator;
            var itemDoms = new Array();
            for (var i=0; i < itemDomContainer.childNodes.length; i++){
                var subItemDom = itemDomContainer.childNodes[i];
                if (currentDecorator && subItemDom === currentDecorator) continue;
                if (hoverDecorator && subItemDom === hoverDecorator) continue;
                itemDoms.push(subItemDom);
            }

            if (index >= 0 && index < itemDoms.length) {
                var i = index;
                if (prepend) i = itemDoms.length - i - 1;
                itemDom = itemDoms[i];
                if (this._itemDomMap[itemDom._itemId] == itemDom) delete this._itemDomMap[itemDom._itemId];
                itemId = this._itemModel.getItemId(item, index);
            } else {
                itemId = this._itemModel.getItemId(item, index);
                itemDom = this._itemDomMap[itemId];
            }
            if (!itemDom) {
                itemDom = this.createItemDom(item);
                itemDomContainer.appendChild(itemDom);
            }
            this._itemDomMap[itemId] = itemDom;
            itemDom._itemId = itemId;
			itemDom.itemIndex = index;
			
			var pos = this._getBlockPos(index);
			itemDom.lineIndex = pos[2];
			itemDom.subIndex = pos[3];
			$fly(itemDom).data("item", item).css({
				left: pos[0],
				top: pos[1]
			}).outerWidth(this._realBlockWidth).outerHeight(this._realBlockHeight);
			this._lineCount = parseInt((this._itemDomCount - 1) / this._realLineSize + 1);
			
			this.refreshItemDomData(itemDom, item);
			return itemDom;
		},
		
		createItemDom: function(item) {
			var blockDom = $DomUtils.xCreate({
				tagName: "DIV",
				className: "block",
				style: {
					position: "absolute",
					overflow: "hidden"
				}
			});
			blockDom._isBlock = true;
			if (this._scrollMode == "lazyRender" &&
			this._shouldSkipRender) {
				blockDom._lazyRender = true;
			}
			return blockDom;
		},
		
		createItemDomDetail: dorado._NULL_FUNCTION,
		
		refreshItemDomData: function(blockDom, item) {
			if (blockDom._lazyRender) return;
			
			var processDefault = true;
			var eventArg = {
				dom: blockDom,
				data: item,
				processDefault: false
			};
			
			if (this.getListenerCount("onRenderBlock") &&
			this.fireEvent("onRenderBlock", this, eventArg)) {
				processDefault = eventArg.processDefault;
			}
			if (processDefault) {
				var timestamp = (item instanceof dorado.Entity) ? item.timestamp : -1;
				if (this._ignoreItemTimestamp || timestamp <= 0 ||
				blockDom.timestamp != timestamp) {
					(this._renderer || $singleton(dorado.widget.blockview.DefaultBlockRenderer)).render(blockDom, {
						blockView: this,
						data: item
					});
					blockDom.timestamp = timestamp;
				}
			}
		},
		
		getHoverBlockDecorator: function() {
			var decorator = this._hoverDecorator;
			if (!decorator) {
				decorator = $DomUtils.xCreate({
					tagName: "DIV",
					className: "block-decorator block-decorator-hover"
				});
				this._container.insertBefore(decorator, this._container.firstChild);
				this._hoverDecorator = decorator;
			}
			return decorator;
		},
		
		setHoverBlock: function(itemDom) {
			if (itemDom) {
				if (this._draggable && this._dragMode != "control") {
					this.applyDraggable(itemDom);
				}
				$fly(itemDom).addClass("block-hover");
			}
			if (this._hoverBlock == itemDom) return;
			if (this._hoverBlock) $fly(this._hoverBlock).removeClass("block-hover");
			this._hoverBlock = itemDom;
			
			var decorator = this.getHoverBlockDecorator();
			if (itemDom && this._currentBlock != itemDom) {
				$fly(decorator).outerWidth(itemDom.offsetWidth + this._blockDecoratorSize * 2)
					.outerHeight(itemDom.offsetHeight + this._blockDecoratorSize * 2)
					.css({
						left: itemDom.offsetLeft - this._blockDecoratorSize,
						top: itemDom.offsetTop - this._blockDecoratorSize
					}).show();
			} else {
				$fly(decorator).hide();
			}
		},
		
		getCurrentBlockDecorator: function() {
			var decorator = this._currentDecorator;
			if (!decorator) {
				decorator = $DomUtils.xCreate({
					tagName: "DIV",
					className: "block-decorator block-decorator-current"
				});
				this._container.insertBefore(decorator, this._container.firstChild);
				this._currentDecorator = decorator;
			}
			return decorator;
		},
		
		setCurrentBlock: function(itemDom) {
			if (this._currentBlock == itemDom) return;
			if (this._currentBlock) $fly(this._currentBlock).removeClass("block-current");
			this._currentBlock = itemDom;
			if (itemDom) $fly(itemDom).addClass("block-current");

            var hoverBlockDecorator = this.getHoverBlockDecorator();
            $fly(hoverBlockDecorator).hide();

			var decorator = this.getCurrentBlockDecorator();
			if (itemDom) {
				$fly(decorator).outerWidth(itemDom.offsetWidth + this._blockDecoratorSize * 2)
					.outerHeight(itemDom.offsetHeight + this._blockDecoratorSize * 2)
					.css({
						left: itemDom.offsetLeft - this._blockDecoratorSize,
						top: itemDom.offsetTop - this._blockDecoratorSize
					}).show();
			} else {
				$fly(decorator).hide();
			}
		},

		onScroll: function(event, arg) {
			var blockView = this;

			function process(p1, p2) {
				if (scroller[p1] == (scroller[p2] || 0)) return;
				if (scroller._scrollTimerId) {
					clearTimeout(scroller._scrollTimerId);
					scroller._scrollTimerId = undefined;
				} else {
					scroller[p2] = scroller[p1];
				}
				scroller._scrollTimerId = setTimeout(function() {
					blockView.doOnScroll(arg);
				}, 300);
			}

			if (blockView._scrollMode == "viewport") {
				if (blockView._blockLayout == "vertical") {
					if ((blockView._scrollTop || 0) != arg.scrollTop) {
						process.call(blockView, "scrollTop", "_scrollTop");
					}
				} else {
					if ((blockView._scrollLeft || 0) != arg.scrollLeft) {
						process.call(blockView, "scrollLeft", "_scrollLeft");
					}
				}
				blockView._scrollLeft = arg.scrollLeft;
				blockView._scrollTop = arg.scrollTop;
			} else if (blockView._scrollMode == "lazyRender") {
				var range = blockView._getVisibleBlockRange(), childNodes = blockView._container.childNodes;
				for (var i = range[0]; i <= range[1] &&
					i < childNodes.length; i++) {
					var blockDom = childNodes[i];
					if (blockDom._lazyRender) {
						var item = $fly(blockDom).data("item");
						blockView.createItemDomDetail(blockDom, item);
						delete blockDom._lazyRender;
						blockView.refreshItemDomData(blockDom, item);
					}
				}
			}
		},

		doOnScroll: function(arg) {
			var scroller = this._scroller;
			if (scroller._scrollTimerId) {
				clearTimeout(scroller._scrollTimerId);
				scroller._scrollTimerId = undefined;
			}
			this._itemModel.setScrollPos((this._blockLayout == "vertical") ? arg.scrollTop : arg.scrollLeft);
			this.refreshViewPortContent(this._container);
		},
		
		_findBlockDom: function(evt) {
			var container = this._container;
			return $DomUtils.findParent(evt.target, function(parentNode) {
				return parentNode.parentNode == container;
			});
		},
		
		onMouseDown: function(evt) {
            var blockDom = this._findBlockDom(evt);
            if (blockDom || this._allowNoCurrent) {
                if (blockDom && evt.shiftKey) $DomUtils.disableUserSelection(blockDom);

                var data = blockDom ? $fly(blockDom).data("item") : null;
                this.fireEvent("onBlockMouseDown", this, {data:data});

                var oldCurrentItem = this.getCurrentItem();
                if (this.setCurrentItemDom(blockDom)) {
                    var clickedItem = (blockDom ? $fly(blockDom).data("item") : null), selection = this.getSelection();
                    if (this._selectionMode == "singleRow") {
                        if (evt.ctrlKey || evt.shiftKey) this.replaceSelection(null, clickedItem);
                    } else if (this._selectionMode == "multiRows") {
                        var removed = [], added = [];
                        if (evt.altKey || evt.ctrlKey && evt.shiftKey) {
                            removed = selection;
                        } else if (evt.ctrlKey) {
                            this.addOrRemoveSelection(selection, clickedItem, removed, added);
                        } else if (evt.shiftKey) {
                            var si = -1, ei, itemModel = this._itemModel;
                            if (oldCurrentItem) {
                                si = itemModel.getItemIndex(oldCurrentItem);
                            }

                            if (oldCurrentItem) {
                                if (si < 0) si = itemModel.getItemIndex(oldCurrentItem);
                                ei = itemModel.getItemIndex(clickedItem);
                                if (si > ei) {
                                    var i = si;
                                    si = ei, ei = i;
                                }

                                removed = selection.slice(0);
                                removed.remove(oldCurrentItem);
                                removed.remove(clickedItem);

                                selection = [];

                                var c = ei - si + 1, i = 0;
                                var it = itemModel.iterator(si);
                                while (it.hasNext() && i < c) {
                                    added.push(it.next());
                                    i++;
                                }
                            } else {
                                this.addOrRemoveSelection(selection, clickedItem, removed, added);
                            }
                        }
                        this.replaceSelection(removed, added);
                    }
                }
            }
		},
		
		onMouseUp: function(evt) {
			var blockDom = this._findBlockDom(evt);
			if (blockDom) {
				var data = $fly(blockDom).data("item");
				if (data) {
					this.fireEvent("onBlockMouseUp", this, {
						data: data
					});
				}
			}
		},

        getSelection: function() {
            var selection = this._selection;
            if (this._selectionMode == "multiRows") {
                if (!selection) selection = [];
            }
            return selection;
        },

        setSelection: function(selection) {
            this._selection = selection;
        },

        replaceSelection: function(removed, added, silence) {
            if (removed == added) return;

            switch (this._selectionMode) {
                case "singleRow":{
                    removed = this.get("selection");
                    break;
                }
                case "multiRows":{
                    if (removed instanceof Array && removed.length == 0) removed = null;
                    if (added instanceof Array && added.length == 0) added = null;
                    if (removed == added) return;

                    if (removed && !(removed instanceof Array)) {
                        removed = [removed];
                    }
                    if (added && !(added instanceof Array)) {
                        added = [added];
                    }
                    break;
                }
            }

            var eventArg = {
                removed: removed,
                added: added
            };
            if (!silence) {
                this.fireEvent("beforeSelectionChange", this, eventArg);
                removed = eventArg.removed;
                added = eventArg.added;
            }

            switch (this._selectionMode) {
                case "singleRow":{
                    if (removed) this.toggleItemSelection(removed, false);
                    if (added) this.toggleItemSelection(added, true);
                    this.setSelection(added);
                    break;
                }
                case "multiRows":{
                    var selection = this.get("selection");
                    if (removed && selection) {
                        if (removed == selection) {
                            removed = selection.slice(0);
                            for (var i = 0; i < selection.length; i++) {
                                this.toggleItemSelection(selection[i], false);
                            }
                            selection = null;
                        } else {
                            for (var i = 0; i < removed.length; i++) {
                                selection.remove(removed[i]);
                                this.toggleItemSelection(removed[i], false);
                            }
                        }
                    }
                    if (selection == null) this.setSelection(selection = []);
                    if (added) {
                        for (var i = 0; i < added.length; i++) {
                            if (selection.indexOf(added[i]) >= 0) continue;
                            selection.push(added[i]);
                            this.toggleItemSelection(added[i], true);
                        }
                    }
                    this.setSelection(selection);
                    break;
                }
            }
            if (!silence) {
                eventArg.removed = removed;
                eventArg.added = added;
                this.fireEvent("onSelectionChange", this, eventArg);
            }
        },

        addOrRemoveSelection: function(selection, clickedObj, removed, added) {
            if (!selection || selection.indexOf(clickedObj) < 0) added.push(clickedObj);
            else removed.push(clickedObj);
        },

        toggleItemSelection: function(item, selected) {
            if (!this._highlightSelectedBlock || !this._itemDomMap) return;
            var blockDom = this._itemDomMap[this._itemModel.getItemId(item)];
            if (blockDom) $fly(blockDom).toggleClass("selected-block", selected);
        },

        onClick: function(evt) {
			var blockDom = this._findBlockDom(evt);
			if (blockDom) {
				var data = $fly(blockDom).data("item");
				if (data) {
					this.fireEvent("onBlockClick", this, {
						data: data
					});
				}
			}
		},
		
		onDoubleClick: function(evt) {
			var blockDom = this._findBlockDom(evt);
			if (blockDom) {
				var data = $fly(blockDom).data("item");
				if (data) {
					this.fireEvent("onBlockDoubleClick", this, {
						data: data
					});
				}
			}
		},

		scrollCurrentIntoView: function() {
			if (dorado.Browser.isTouch || $setting["common.simulateTouch"]) {
				return;
			}

			var currentItemId = this.getCurrentItemId();
			var itemDom = this._itemDomMap[currentItemId], scroller = this._scroller, itemIndex;
			if (itemDom) {
				itemIndex = itemDom.itemIndex;
				if (itemIndex >= this.startIndex &&
					itemIndex <= (this.startIndex + this.itemDomCount)) {
					if (this._blockLayout == "vertical") {
						if (itemDom.offsetTop < scroller.scrollTop) {
							scroller.scrollTop = this._scrollTop = itemDom.offsetTop - this._vertSpacing;
						} else if ((itemDom.offsetTop + itemDom.offsetHeight) > (scroller.scrollTop + scroller.clientHeight)) {
							scroller.scrollTop = this._scrollTop = itemDom.offsetTop + itemDom.offsetHeight
								- scroller.clientHeight + this._vertSpacing;
						}
					} else {
						if (itemDom.offsetLeft < scroller.scrollLeft) {
							scroller.scrollLeft = this._scrollLeft = itemDom.offsetLeft - this._horiSpacing;
						} else if ((itemDom.offsetLeft + itemDom.offsetWidth) > (scroller.scrollLeft + scroller.clientWidth)) {
							scroller.scrollLeft = this._scrollLeft = itemDom.offsetLeft + itemDom.offsetWidth
								- scroller.clientWidth + this._horiSpacing;
						}
					}
					return;
				}
			} else {
				var item = this.getCurrentItem();
				if (item) itemIndex = this._itemModel.getItemIndex(item);
			}
			var lineIndex = parseInt(itemIndex / this._realLineSize);
			if (itemIndex < this.startIndex) {
				if (this._blockLayout == "vertical") {
					scroller.scrollTop = this._scrollTop = lineIndex * (this._blockHeight + this._vertSpacing)
						+ this._vertPadding - this._vertSpacing;
				} else {
					scroller.scrollLeft = this._scrollLeft = lineIndex * (this._blockWidth + this._horiSpacing)
						+ this._horiPadding - this._horiSpacing;
				}
			} else if (itemIndex > (this.startIndex + this.itemDomCount - 1)) {
				if (this._blockLayout == "vertical") {
					scroller.scrollTop = this._scrollTop = (lineIndex + 1) * (this._blockHeight + this._vertSpacing)
						+ this._vertPadding - scroller.clientHeight;
				} else {
					scroller.scrollLeft = this._scrollLeft = (lineIndex + 1) * (this._blockWidth + this._horiSpacing)
						+ this._horiPadding - scroller.clientWidth;
				}
			}
		},
		
		_getContainerSize: function() {
			var width = -1, height = -1, result;
			var lineCount = this._itemModel.getLineCount();
			var dom = this._dom, contrainer = this._container, hasScroller;
			var blockWidth = this._blockWidth, blockHeight = this._blockHeight;
			if (this._blockLayout == "vertical") {
				hasScroller = dom.scrollHeight > dom.clientHeight;
				height = this._vertPadding * 2 + (blockHeight + this._vertSpacing) * lineCount - this._vertSpacing;
				result = (height > dom.clientHeight) ^ hasScroller;
			} else {
				hasScroller = dom.scrollWidth > dom.clientWidth;
				width = this._horiPadding * 2 + (blockWidth + this._horiSpacing) * lineCount - this._horiSpacing;
				result = (width > dom.clientWidth) ^ hasScroller;
			}
			return [width, height, result];
		},
		
		_arrangeBlockDoms: function(from, move) {
			var container = this._container;
			var blockDom = container.firstChild;
			while (blockDom) {
				if (blockDom.itemIndex >= from) {
					blockDom.itemIndex = blockDom.itemIndex + move;
					var pos = this._getBlockPos(blockDom.itemIndex);
					$fly(blockDom).css({
						left: pos[0],
						top: pos[1]
					});
				}
				blockDom = blockDom.nextSibling;
			}
		},
		
		doOnResize: function() {
			if (!this._ready) return;
			
			if (this._lineSize && this._fillLine) {
				this.refresh();
			} else {
				this._arrangeBlockDoms();
			}
		},
		
		findItemDomByEvent: function(evt) {
			var target = evt.srcElement || evt.target;
			var target = target || evt, container = this._container;
			return $DomUtils.findParent(target, function(parentNode) {
				return parentNode.parentNode == container;
			});
		},
		
		findItemDomByPosition: function(pos) {
			var dom = this._dom, x = pos.x + dom.scrollLeft, y = pos.y +
			dom.scrollTop;
			var xIndex = parseInt((x - this._horiPadding - this._horiSpacing / 2) /
			(this._realBlockWidth + this._horiSpacing));
			var yIndex = parseInt((y - this._vertPadding - this._vertSpacing / 2) /
			(this._realBlockHeight + this._vertSpacing));
			var index = -1;
			if (this._blockLayout == "vertical") {
				if (xIndex > this._realLineSize - 1) xIndex = this._realLineSize - 1;
				index = this._realLineSize * yIndex + xIndex;
			} else {
				if (yIndex > this._realLineSize - 1) yIndex = this._realLineSize - 1;
				index = this._realLineSize * xIndex + yIndex;
			}
			if (index >= 0 && index < this._itemModel.getItemCount()) {
				var itemModel = this._itemModel, item = itemModel.getItemAt(index);
				var blockDom = this._itemDomMap[itemModel.getItemId(item)];
				if (blockDom) {
					blockDom._dropX = x - blockDom.offsetLeft;
					blockDom._dropY = y - blockDom.offsetTop;
				}
				return blockDom;
			} else {
				return null;
			}
		},
		
		initDraggingIndicator: function(indicator, draggingInfo, evt) {
			if (this._dragMode != "control") {
				var itemDom = draggingInfo.get("element");
				if (itemDom) {
					var contentDom = $DomUtils.xCreate({
						tagName: "div",
						className: "d-block-view-dragging-item"
					});
					$fly(itemDom).clone().css({
						left: 0,
						top: 0,
						position: "relative"
					}).appendTo(contentDom);
					indicator.set("content", contentDom);
				}
			}
		},
		
		setDraggingOverBlockDom: function(blockDom) {
			if (this._draggingOverBlockDom == blockDom) return;
			if (this._draggingOverBlockDom) $fly(this._draggingOverBlockDom).removeClass("block-drag-over");
			this._draggingOverBlockDom = blockDom;
			if (blockDom) $fly(blockDom).addClass("block-drag-over");
		},
		
		onDraggingSourceMove: function(draggingInfo, evt) {
			var dropMode = this._dropMode;
			var targetObject = draggingInfo.get("targetObject");
			var insertMode, refObject, itemDom;
			if (dropMode != "onControl") {
				var pos = this.getMousePosition(evt);
				blockItem = this.findItemDomByPosition(pos);
				if (blockItem &&
				$fly(blockItem).data("item") ==
				draggingInfo.get("object")) {
					blockItem = null;
				}
				
				if (blockItem) {
					if (dropMode == "insertItems") {
						if (this._blockLayout == "vertical") insertMode = (blockItem._dropX < (this._realBlockWidth / 2)) ? "before" : "after";
						else insertMode = (blockItem._dropY < (this._realBlockHeight / 2)) ? "before" : "after";
					} else if (dropMode == "onOrInsertItems") {
						if (this._blockLayout == "vertical") {
							if (blockItem._dropX < 4) insertMode = "before";
							else if (blockItem._dropX > (this._realBlockWidth - 4)) insertMode = "after";
						} else {
							if (blockItem._dropY < 4) insertMode = "before";
							else if (blockItem._dropY > (this._realBlockHeight - 4)) insertMode = "after";
						}
					}
				}
				refObject = blockItem ? $fly(blockItem).data("item") : null;
				if (!refObject) {
					targetObject = (dropMode == "onAnyWhere") ? this : null;
				} else {
					targetObject = refObject;
				}
			}
			
			var accept = (draggingInfo.isDropAcceptable(this._droppableTags) &&
			!(dropMode == "onItem" && targetObject == null));
			draggingInfo.set({
				targetObject: targetObject,
				insertMode: insertMode,
				refObject: refObject,
				accept: accept
			});
			
			var eventArg = {
				draggingInfo: draggingInfo,
				event: evt,
				processDefault: true
			};
			this.fireEvent("onDraggingSourceMove", this, eventArg);
			
			if (accept && eventArg.processDefault) {
				this.setDraggingOverBlockDom(blockItem);
				this.showDraggingInsertIndicator(draggingInfo, insertMode, blockItem);
			}
			return eventArg.processDefault;
		},
		
		onDraggingSourceOut: function(draggingInfo, evt) {
			$invokeSuper.call(this, arguments);
			this.setDraggingOverBlockDom();
			this.showDraggingInsertIndicator();
		},
		
		showDraggingInsertIndicator: function(draggingInfo, insertMode, blockDom) {
			var insertIndicator = dorado.widget.blockview.getDraggingInsertIndicator(this._blockLayout);
			var $insertIndicator = $fly(insertIndicator);
			if (insertMode) {
				var container = this._container;
				if (this._blockLayout == "vertical") {
					var left;
					if (insertMode == "before") {
						left = blockDom.offsetLeft -
						parseInt(this._horiSpacing / 2);
					} else {
						left = blockDom.offsetLeft +
						blockDom.offsetWidth +
						parseInt(this._horiSpacing / 2);
					}
					$insertIndicator.height(blockDom.offsetHeight).left(left - 1).top(blockDom.offsetTop);
				} else {
					var top;
					if (insertMode == "before") {
						top = blockDom.offsetTop -
						parseInt(this._vertSpacing / 2);
					} else {
						top = blockDom.offsetTop +
						blockDom.offsetHeight +
						parseInt(this._vertSpacing / 2);
					}
					$insertIndicator.width(blockDom.offsetWidth).top(top - 1).left(blockDom.offsetLeft);
				}
				$insertIndicator.show().appendTo(container);
			} else {
				$insertIndicator.hide().appendTo($DomUtils.getUndisplayContainer());
			}
		},
		
		onDraggingSourceDrop: function(draggingInfo, evt) {
			this.showDraggingInsertIndicator();
			dorado.widget.AbstractList.prototype.onDraggingSourceDrop.apply(this, arguments);
		},
		
		processItemDrop: dorado.widget.AbstractList.prototype.processItemDrop
	});
	
	var draggingIndicatorHolder = {};
	dorado.widget.blockview.getDraggingInsertIndicator = function(direction) {
		var code = (direction == "horizontal") ? 'h' : 'v';
		var indicator = draggingIndicatorHolder["_draggingInsertIndicator-" + code];
		if (indicator == null) {
			indicator = $DomUtils.xCreate({
				tagName: "div",
				className: "d-block-view-dragging-insert-indicator-" + code
			});
			draggingIndicatorHolder["_draggingInsertIndicator-" + code] = indicator;
		}
		return indicator;
	};
	
})();

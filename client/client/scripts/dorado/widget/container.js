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

	var fireParentChanged = true;

	/**
	 * @author Benny Bao (mailto:benny.bao@bstek.com)
	 * @component General
	 * @class 容器控件。
	 * @extends dorado.widget.Control
	 */
	dorado.widget.Container = $extend(dorado.widget.Control, /** @scope dorado.widget.Container.prototype */ {
		$className: "dorado.widget.Container",

		ATTRIBUTES: /** @scope dorado.widget.Container.prototype */ {

			className: {
				defaultValue: "d-container"
			},

			/**
			 * 容器控件使用的布局管理器。
			 * <p>
			 * 在设置布局管理器时，既可以向方法中传入布局管理器的实例，也可以传入当以JSON配置对象描述的布局管理器，设置是一个代表$type简写的字符串。
			 * 当以JSON配置对象描述的子控件时，可以使用子控件类型名称中"dorado.widget."和"Layout"之间的部分作为$type的简写。
			 * 例如以Dock作为dorado.widget.layout.DockLayout的简写。
			 * </p>
			 * <p>
			 * 绝大部分容器的默认布局管理器都是{@link dorado.widget.layout.DockLayout}。
			 * </p>
			 * @attribute
			 * @type dorado.widget.layout.Layout
			 */
			layout: {
				setter: function(layout) {
					var oldLayout = this._layout, controls;
					if (oldLayout) {
						oldLayout.disableRendering();
						oldLayout.set("container", null);

						controls = [];
						oldLayout._regions.each(function(region) {
							controls.push(region.control);
						});
						oldLayout.removeAllControls();

						oldLayout.enableRendering();
						oldLayout.onDetachFromDocument();
					}

					if (layout && !(layout instanceof dorado.widget.layout.Layout)) {
						layout = dorado.Toolkits.createInstance("layout", layout, function(type) {
							type = type || "Dock";
							return dorado.util.Common.getClassType("dorado.widget.layout." + type + "Layout", true);
						});
					}
					this._layout = layout;
					if (layout) {
						layout.set("container", this);

						if (controls && controls.length) {
							layout.disableRendering();
							controls.each(function(control) {
								layout.addControl(control);
							});
							layout.enableRendering();
						}
						if (this._attached && layout._regions.size == 0 && !layout._rendered) {
							layout.onAttachToDocument(this.getContentContainer());
						}
					}
				},
				getter: function() {
					if (this._layout === undefined) {
						this._ignoreRefresh++;
						try {
							this.createDefaultLayout();
						}
						finally {
							this._ignoreRefresh--;
						}
					}
					return this._layout;
				}
			},

			/**
			 * 此属性在读取和写入时具有不同的含义。
			 * <ul>
			 * <li>读取时返回的是容器控件中子组件的集合。返回的对象是{@link dorado.util.KeyedList}，该集合的键为组件的id，值为相应的组件。</li>
			 * <li>而写入时则是作为用于简化为容器添加子控件操作的虚拟属性。
			 * 写入的数值应该是一个数组，数组中的每一个元素是子控件的实例（{@link dorado.widget.Component}）或以JSON配置对象描述的子控件。</li>
			 * </ul>
			 * <p>
			 * 当以JSON配置对象描述的子控件时，可以使用子控件类型名称中"dorado.widget."后面的部分作为$type的简写。
			 * 例如以Button作为dorado.widget.Button的简写。请参考后面的示例。
			 * </p>
			 * @type dorado.util.KeyedList|Array
			 * @attribute
			 * @see dorado.Toolkits.createInstance
			 *
			 * @example
			 * var container = new dorado.widget.Container();
			 * container.set("children", [
			 *    new dorado.widget.Panel(),    // 简单的向容器中添加一个子控件
			 *
			 *    {
			 * 		$type: "Button",
			 * 		caption: "Test Button"
			 * 	},    // 简单的向容器中添加一个子控件，以JSON配置对象的方式
			 *
			 *    new dorado.widget.TextEditor({
			 * 		layoutConstraint: { width: "100%" }
			 * 	}),    // 添加一个子控件的同时指定布局条件
			 *
			 *    {
			 * 		$type: "TextEditor",
			 * 		required: true,
			 * 		layoutConstraint: { width: "100%" }
			 * 	}    // 以JSON配置对象的方式添加一个子控件的同时指定布局条件
			 * ]);
			 */
			children: {
				skipRefresh: true,
				setter: function(children) {
					if (!children || children.length < 1) return;

					var container = this;
					var optimized = (AUTO_APPEND_TO_TOPVIEW === false);
					if (!optimized) AUTO_APPEND_TO_TOPVIEW = false;
					var layout = container._layout;
					if (layout) layout.disableRendering();
					
					if (container._children.length) {
						container._children.each(function(child) {
							container.removeChild(child);
						});
					}

					for(var i = 0; i < children.length; i++) {
						var child = children[i];
						if (child instanceof dorado.widget.Component) {
							container.addChild(child);
						}
						else if (child.$type) {
							container.addChild(this.createInnerComponent(child));
						}
					}

					if (!optimized) AUTO_APPEND_TO_TOPVIEW = true;
					if (layout) {
						layout.enableRendering();
						layout.refresh();
					}
				}
			},

			/**
			 * 容器控件中的内容超出了以后的处理方法。
			 * <p>
			 * 该值默认为auto，可选值为visible, hidden, scroll, auto。<br />
			 * 该值的含义与CSS中overflow的属性的意义相同，在实现上也仅仅是把这个值添加到内容容器上。
			 * </p>
			 * @attribute 
			 * @type String
			 */
			contentOverflow: {
			},

			/**
			 * 容器控件中的内容在水平方向上超出了以后的处理方法。
			 * @attribute
			 * @type String
			 */
			contentOverflowX: {
			},

			/**
			 * 容器控件中的内容在垂直方向上超出了以后的处理方法。
			 * @attribute
			 * @type String
			 */
			contentOverflowY: {
			},

			view: {
				setter: function(view) {
					if (this._view == view) return;

					var container = this;
					$invokeSuper.call(container, [view]);
					container._children.each(function(child) {
						if (container._view) child.set("view", null);
						child.set("view", view);
					});
				}
			},

			containerDom: {
				readOnly: true,
				getter: function() {
					if (!this._dom) this.getDom();
					return this.getContentContainer();
				}
			},

			containerUi: {
				defaultValue: "default"
			}
		},

		constructor: function(config) {
			this._contentContainerVisible = true;
			this._children = new dorado.util.KeyedList(dorado._GET_ID);

			var childrenConfig;
			if (config && config.children) {
				childrenConfig = config.children;
				delete config.children;
			}

			this._skipOnCreateListeners = (this._skipOnCreateListeners || 0) + 1;
			$invokeSuper.call(this, [config]);
			this._skipOnCreateListeners--;

			if (childrenConfig) {
				config.children = childrenConfig;
				this.set("children", childrenConfig);
			}

			if (!(this._skipOnCreateListeners > 0) && this.getListenerCount("onCreate")) {
				this.fireEvent("onCreate", this);
			}
		},

		createDefaultLayout: function() {
			this.set("layout", new dorado.widget.layout.DockLayout());
		},

		onReady: function() {
			this._children.each(function(child) {
				if (!(child instanceof dorado.widget.Control) && !child._ready) child.onReady();
			});

			$invokeSuper.call(this);

			this._children.each(function(child) {
				if (child._floating && dorado.Object.isInstanceOf(child, dorado.widget.FloatControl) && !child._ready && child._visible) {
					child.show();
				}
			});
		},

		destroy: function() {
			var children = this._children.toArray();
			for(var i = 0; i < children.length; i++) {
				children[i].destroy();
			}
			$invokeSuper.call(this);
		},

		onActualVisibleChange: function() {

			function notifyChildren(control, parentActualVisible) {
				control._children.each(function(child) {
					if (child._parentActualVisible == parentActualVisible || !(child instanceof dorado.widget.Control)) {
						return;
					}
					child._parentActualVisible = parentActualVisible;
					child.onActualVisibleChange();
				});
			}

			$invokeSuper.call(this);
			notifyChildren(this, this.isActualVisible());
		},

		doRenderToOrReplace: function(replace, element, nextChildElement) {
			if (replace && this._children.size == 0 && element.childNodes.length > 0) {
				var children = [];
				for(var i = 0; i < element.childNodes.length; i++) {
					children.push(element.childNodes[i]);
				}

				if (dorado.widget.HtmlContainer) {
					var htmlContrainer = new dorado.widget.HtmlContainer({
						content: children
					});
					this.addChild(htmlContrainer);
				}
				else {
					$fly(this.getContentContainer()).append(children);
				}
			}

			if (!this._ready) {
				this._children.each(function(child) {
					if (!(child instanceof dorado.widget.Control) && !child._ready) child.onReady();
				});
			}

			$invokeSuper.call(this, [replace, element, nextChildElement]);
		},

		/**
		 * 向容器中添加一个组件。
		 * @param {dorado.widget.Component} component 要添加的组件。
		 */
		addChild: function(component) {
			if (component._parent) {
				fireParentChanged = false;
				if (component._parent.removeChild) {
					component._parent.removeChild(component);
				}
				fireParentChanged = true;
			}

			this._children.insert(component);
			component._parent = this;
			component.set("view", (this instanceof dorado.widget.View) ? this : this.get("view"));
			if (fireParentChanged && component.parentChanged) component.parentChanged();

			if (component instanceof dorado.widget.Control) {
				var parentActualVisible = this.isActualVisible();
				if (component._parentActualVisible != parentActualVisible) {
					component._parentActualVisible = parentActualVisible;
					component.onActualVisibleChange();
				}

				var layout = this.get("layout");
				if (layout) {
					if (!(dorado.Object.isInstanceOf(component, dorado.widget.FloatControl) && component._floating)) {
						var shouldFireOnAttach = (this._attached && layout._regions.size == 0 && !layout._rendered);
						layout.addControl(component);
						if (shouldFireOnAttach) layout.onAttachToDocument(this.getContentContainer());
					}
				}
				if (this._rendered) {
					this.updateModernScroller(true);
				}
			}

			if (!(component instanceof dorado.widget.Control) && !component._ready && this._ready) {
				component.onReady.call(component);
			}
		},

		/**
		 * 从容器中移除一个组件。
		 * @param {Component} component 要移除的组件。
		 */
		removeChild: function(component) {
			this._children.remove(component);
			component.set("view", null);

			component._parent = null;
			if (fireParentChanged && component.parentChanged) component.parentChanged();

			if (component instanceof dorado.widget.Control) {
				var layout = this._layout;
				if (layout) layout.removeControl(component);
				if (this._rendered) {
					this.updateModernScroller(true);
				}
			}
		},

		/**
		 * 从容器中移除所有子组件。
		 */
		removeAllChildren: function() {
			var layout = this._layout;
			if (layout) layout._disableRendering = true;

			this._children.each(function(child) {
				this.removeChild(child);
			}, this);

			if (layout) {
				layout._disableRendering = false;
				layout.refresh();
			}
		},

		createDom: function() {
			var dom = $DomUtils.xCreate({
				tagName: "DIV",
				content: {
					tagName: "DIV",
					style: {
						width: "100%",
						height: "100%"
					}
				}
			});
			this._container = dom.firstChild;
			return dom;
		},

		/**
		 * 返回用于容纳子控件的DOM对象。
		 * @return {HTMLElement} DOM对象。
		 */
		getContentContainer: function() {
			return this._container || this.getDom();
		},

		// for performance
		getContentContainerSize: function () {
			if (this._className == "d-container" && !this._exClassName) {
				var width = this.getRealWidth(), height = this.getRealHeight();
				if (typeof width === "string" && width.endsWith("px")) width = parseInt(width);
				if (typeof height === "string" && height.endsWith("px")) height = parseInt(height);
				if (width >= 0 && height >= 0) {
					return [width, height];
				}

				var contentContainer = this.getContentContainer();
				if (!(width >= 0)) {
					width = contentContainer.style.width || -1;
					if (typeof width === "string" && width.endsWith("px")) width = parseInt(width);
					if (!(width >= 0)) {
						// IE下，在floatControl中此时取得的clientWidth可能是0，但offsetWidth是正确的
						width = contentContainer.clientWidth || contentContainer.offsetWidth;
					}
				}
				if (!(height >= 0)) {
					height = contentContainer.style.height || -1;
					if (typeof height === "string" && height.endsWith("px")) height = parseInt(height);
					if (!(height >= 0)) {
						// IE下，在floatControl中此时取得的clientWidth可能是0，但offsetWidth是正确的
						height = contentContainer.clientHeight || contentContainer.offsetHeight;
					}
				}
				return [width, height];
			}
			else {
				var contentContainer = this.getContentContainer();
				var width = contentContainer.style.width || -1;
				if (typeof width === "string" && width.endsWith("px")) width = parseInt(width);
				if (!(width >= 0)) {
					// IE下，在floatControl中此时取得的clientWidth可能是0，但offsetWidth是正确的
					width = contentContainer.clientWidth || contentContainer.offsetWidth;
				}
				var height = contentContainer.style.height || -1;
				if (typeof height === "string" && height.endsWith("px")) height = parseInt(height);
				if (!(height >= 0)) {
					// IE下，在floatControl中此时取得的clientWidth可能是0，但offsetWidth是正确的
					height = contentContainer.clientHeight || contentContainer.offsetHeight;
				}
				return [width, height];
			}
		},

		setContentContainerVisible: function(visible) {
			this._children.each(function(child) {
				if (child instanceof dorado.widget.Control) {
					child.setActualVisible(visible);
				}
			});
			this._contentContainerVisible = visible;

			var layout = this._layout;
			if (layout && visible && !(layout._regions.size == 0 && !layout._rendered)) {
				layout.onAttachToDocument(this.getContentContainer());
			}
		},

		doOnAttachToDocument: function () {
			var overflowX = (!this._contentOverflowX) ? this._contentOverflow : this._contentOverflowX;
			var overflowY = (!this._contentOverflowY) ? this._contentOverflow : this._contentOverflowY;
			overflowX = overflowX || "auto";
			overflowY = overflowY || "auto";

			var contentCt = this.getContentContainer();
			if (contentCt) {
				if (contentCt.nodeType && contentCt.nodeType == 1 &&
					(overflowX == "auto" || overflowY == "auto" || overflowX == "scroll" || overflowY == "scroll")) {
					contentCt.style.overflowX = overflowX;
					contentCt.style.overflowY = overflowY;
					this._modernScroller = $DomUtils.modernScroll(contentCt, {
						autoDisable: true
					});
				}

				if (dorado.Browser.msie && dorado.Browser.version < 8) {
					$fly(contentCt).addClass("d-relative");
				}

				if (this._containerUi) {
					$fly(contentCt).addClass("d-container-ui-" + this._containerUi);
				}
			}

			var layout = this._layout;
			if (this._contentContainerVisible && layout && !(layout._regions.size == 0 && !layout._rendered)) {
				layout.onAttachToDocument(contentCt);
			}
		},

		doOnDetachToDocument: function() {
			var layout = this._layout;
			if (layout) layout.onDetachToDocument();
		},

		doResetDimension: function(force) {
			var changed = $invokeSuper.call(this, [force]);
			this._useOriginalWidth = this._useOriginalHeight = true;
			return changed;
		},

		doOnResize: function() {
			var container = this;
			dorado.Toolkits.cancelDelayedAction(container, "$notifySizeChangeTimerId");

			var layout = container._layout;
			if (container._contentContainerVisible && layout && layout._attached) {
				layout.onResize();
			}
			this.processContentSize();
		},

		onContentSizeChange: function() {
			if (!this._rendered || !this._layout || !this._layout._attached) return;
			this.processContentSize();
			this.updateModernScroller();
		},

		processContentSize: function() {
			if (!this._layout) return;

			var dom = this._dom, containerDom = this.getContentContainer(), layoutDom = this._layout.getDom();
			var overflowX = (!this._contentOverflowX) ? this._contentOverflow : this._contentOverflowX;
			var overflowY = (!this._contentOverflowY) ? this._contentOverflow : this._contentOverflowY;

			var newWidth, newHeight, containerDomSize;
			if (overflowX == "visible" || !this.getRealWidth()) {
				containerDomSize = this.getContentContainerSize();
				var edgeWidth = dom.offsetWidth - containerDom.offsetWidth;
				var width = layoutDom.offsetWidth + edgeWidth;
				if (layoutDom.offsetWidth > containerDomSize[0]) {
					newWidth = width;
				}
				else if (!this._useOriginalWidth && width < this._currentOffsetWidth) {
					var parent = this._parent, containerToRefresh = this;
					while(parent) {
						if (!parent._useOriginalWidth) {
							containerToRefresh = parent;
							parent = parent._parent;
						}
						else {
							break;
						}
					}
					if (containerToRefresh) {
						containerToRefresh.refresh();
						return;
					}
				}
			}
			if (overflowY == "visible" || !this.getRealHeight()) {
				if (!containerDomSize) {
					containerDomSize = this.getContentContainerSize();
				}
				var edgeHeight = dom.offsetHeight - containerDom.offsetHeight;
				var height = layoutDom.offsetHeight + edgeHeight;
				if (layoutDom.offsetHeight > containerDomSize[1]) {
					newHeight = height;
				} else if (!this._useOriginalHeight && height < this._currentOffsetHeight) {
					var parent = this._parent, containerToRefresh = this;
					while (parent) {
						if (!parent._useOriginalHeight) {
							containerToRefresh = parent;
							parent = parent._parent;
						}
						else {
							break;
						}
					}
					if (containerToRefresh) {
						containerToRefresh.refresh();
						return;
					}
				}
			}

			var sizeChanged = false, $dom = $fly(dom);
			if (newWidth !== undefined) {
				$dom.outerWidth(newWidth);
				sizeChanged = true;
				this._useOriginalWidth = false;
			}
			else {
				newWidth = $dom.outerWidth();
				sizeChanged = (this._useOriginalWidth != newWidth);
			}
			this._currentOffsetWidth = newWidth;

			if (newHeight !== undefined) {
				$dom.outerHeight(newHeight);
				sizeChanged = true;
				this._useOriginalHeight = false;
			}
			else {
				newHeight = $dom.outerHeight();
				if (this._currentOffsetHeight != newHeight) sizeChanged = true;
			}
			this._currentOffsetHeight = newHeight;

			if (sizeChanged) {
				this.notifySizeChange();
			}
		},

		getFocusableSubControls: function() {
			return this._children.toArray();
		}

	});

})();

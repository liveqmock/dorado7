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
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @class 树节点的渲染器。
 * @extends dorado.Renderer
 */
dorado.widget.tree.TreeNodeRenderer = $extend(dorado.Renderer, {
	createIconDom: function(tree) {
		var icon = document.createElement("LABEL");
		icon.className = "node-icon";
		icon.style.display = "inline-block";
		icon.innerHTML = "&nbsp;";
		return icon;
	},

	/**
	 * 返回树节点的文本标签值。
	 * @protected
	 * @param {dorado.widget.tree.BaseNode} node 树节点。
	 * @return {String} 文本标签值。
	 */
	getLabel: function(node, arg) {
		return node.get("label");
	},

	/**
	 * 渲染树节点中的文本标签部分。
	 * @protected
	 * @param {HTMLElement} labelDom 对应的DOM对象。
	 * @param {String} label 树节点的文本标签值。
	 * @param {dorado.widget.tree.BaseNode} node 树节点。
	 */
	renderLabel: function(labelDom, label, node) {
		var tree = node._tree, arg = {
			dom: labelDom,
			label: label,
			node: node,
			processDefault: (tree.getListenerCount("onRenderNode") == 0)
		};
		if (tree) tree.fireEvent("onRenderNode", tree, arg);
		if (arg.processDefault) {
			labelDom.innerText = label;
			labelDom.title = node.get("tip") || '';
		}
	},

	createCheckboxDom: function(tree) {
		return new dorado.widget.CheckBox({
			iconOnly: true,
			triState: true,
			onValueChange: function(self, arg) {
				var row = tree.findItemDomByEvent(self.getDom());
				var node = $fly(row).data("item");
				var checked = self.get("checked");
				node.set("checked", (checked == null || checked)); // 由于是triState CheckBox，所以逻辑有点怪
				self.set("checked", node.get("checked"));
			}
		});
	},

	/**
	 * @name dorado.widget.tree.TreeNodeRenderer#doRender
	 * @protected
	 * @param {HTMLElement} dom 对应的DOM对象。
	 * @param {dorado.widget.tree.BaseNode} node 树节点。
	 * 内部的渲染方法，供复写。
	 */
	doRender: function(cell, node, arg) {
		// 判断子节点对应的EntityList是否已被Entity.reset
		if (node._expanded && node._nodesData && !node._nodesData._observer) {
			node.resetChildren();
			node._expanded = false;
			setTimeout(function() {
				node.expandAsync();
			}, 0);
		}

		var tree = node._tree, level = node.get("level"), hasChild = node.get("hasChild");	
		var container = (cell.tagName.toLowerCase() == "div") ? cell : cell.firstChild;	
		container.style.paddingLeft = ((level - 1) * tree._indent) + "px";
		
		if (tree._showLines) {
			var linesContainer = container.firstChild, lines = [];
			linesContainer.style.width = (level * tree._indent) + "px";
			linesContainer.style.height = tree._rowHeight + "px";
			
			var n = node, i = 0;
			while (n && n._parent) {
				var p = n._parent, pNodes = p._nodes;
				if (i == 0) {
					if (pNodes.get(pNodes.size - 1) == n) {
						lines.push(hasChild ? 31 : 3);
					}
					else if (pNodes.get(0) == n && level == 1) {
						lines.push(hasChild ? 11 : 1);
					} 
					else {
						lines.push(hasChild ? 21 : 2);
					} 
				}
				else if (pNodes.get(pNodes.size - 1) != n) {
					lines.push(4);
				}
				else {
					lines.push(0);
				}
				i++;
				n = p;
			}
			
			for (var i = 0; i < level; i++) {
				var line = $DomUtils.getOrCreateChild(linesContainer, i, function() {
					var line = $DomUtils.xCreate({
						tagName: "LABEL",
						style: {
							background: "no-repeat center center",
							display: "inline-block",
							width: tree._indent,
							height: "100%"
						}
					});
					return line;
				});
				var lineType = lines[level - i - 1];
				if (lineType) {
					line.style.backgroundImage = "url(" + $url("skin>tree/tree-line" + lineType + ".gif") + ")";
				} else {
					line.style.backgroundImage = "";
				}
				$DomUtils.removeChildrenFrom(linesContainer, level);
			}
		}
		
		var cls = ["collapse-button", "expand-button"], buttonDomIndex = (tree._showLines) ? 1: 0
		var buttonDom = container.childNodes[buttonDomIndex], $buttonDom = jQuery(buttonDom);
		if (hasChild) {
			if (node._expanded) cls.reverse();
			$buttonDom.removeClass(cls[0]).addClass(cls[1]);
		} else {
			$buttonDom.removeClass(cls[0]).removeClass(cls[1]);
		}
		$buttonDom.toggleClass("button-expanding", !!node._expanding);
		
		var icon, iconClass;
		if (node._expanded) {
			icon = node.get("expandedIcon") || tree._defaultExpandedIcon;
			iconClass = node.get("expandedIconClass") || tree._defaultExpandedIconClass;
		}
		icon = icon || node.get("icon") || tree._defaultIcon;
		iconClass = iconClass || node.get("iconClass") || tree._defaultIconClass;

		var iconDomIndex = buttonDomIndex + 1;
		if (container.doradoHasIcon) {
			if (!icon && !iconClass) {
				$fly(container.childNodes[iconDomIndex]).remove();
				container.doradoHasIcon = false;
			}
		} else if (icon || iconClass) {
			container.insertBefore(this.createIconDom(tree), container.childNodes[iconDomIndex]);
			container.doradoHasIcon = true;
		}

		var iconDom = container.childNodes[iconDomIndex];
		if (icon) {
			$DomUtils.setBackgroundImage(iconDom, icon);
		}
		else if (iconClass) {
			iconDom.className = "node-icon " + iconClass;
		}

		var checkable = node.get("checkable"), checkbox;
		if (container.subCheckboxId) {
			checkbox = dorado.widget.ViewElement.ALL[container.subCheckboxId];
			if (!checkable) {
				checkbox.destroy();
				container.subCheckboxId = null;
			}
		} else if (checkable) {
			checkbox = this.createCheckboxDom(tree), checkboxIndex = container.doradoHasIcon ? iconDomIndex + 1 : iconDomIndex;
			checkbox.render(container, container.childNodes[checkboxIndex]);
			tree.registerInnerControl(checkbox);
			container.subCheckboxId = checkbox._uniqueId;
		}
		if (checkable && checkbox) {
			checkbox.set("checked", node.get("checked"));
			checkbox.refresh();
		}
		
		this.renderLabel(container.lastChild, this.getLabel(node, arg), node);
	},

	/**
	 * 渲染。
	 * <p><b>如有需要应在子类中复写doRender方法，而不是此方法。</b></p>
	 * @param {HTMLElement} dom 表格行对应的DOM对象。
	 * @param {HTMLElement} dom 对应的DOM对象。
	 * @param {dorado.widget.tree.BaseNode} node 树节点。
	 * @see dorado.widget.tree.TreeNodeRenderer#doRender
	 */
	render: function(row, node, arg) {
		this.doRender(row.firstChild, node, arg);
	}
});

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @class 树状列表。
 * @abstract
 * @extends dorado.widget.RowList
 */
dorado.widget.AbstractTree = $extend(dorado.widget.RowList, /** @scope dorado.widget.AbstractTree.prototype */ {
	$className: "dorado.widget.AbstractTree",

	selectable: false,

	ATTRIBUTES: /** @scope dorado.widget.AbstractTree.prototype */ {
		
		rowHeight: {
			defaultValue: dorado.Browser.isTouch ? 
					($setting["touch.Tree.defaultRowHeight"] || 30) : 
					($setting["widget.Tree.defaultRowHeight"] || 22)
		},
		
		/**
		 * 根节点。此节点时树状列表内部的顶层节点，其不可显示。
		 * @type dorado.widget.tree.BaseNode
		 * @attribute readOnly
		 */
		root: {
			readOnly: true
		},

		/**
		 * 子节点集合。
		 * <p>
		 * 此属性在读写时的意义不完全相同。
		 * <ul>
		 * <li>当读取时树状列表中的子节点集合，类型为{@link dorado.util.KeyedList}。</li>
		 * <li>
		 * 当写入时用于向树状列表中添加子节点。<br>
		 * 此处数组中既可以放入子节点的实例，又可以放入JSON对象。
		 * 具体请参考{@link dorado.widget.tree.BaseNode#addNodes}。
		 * </li>
		 * </ul>
		 * </p>
		 * @type dorado.util.KeyedList|[Object]|[dorado.widget.tree.BaseNode]
		 * @see dorado.widget.tree.BaseNode#addNodes
		 * @attribute
		 */
		nodes: {
			setter: function(nodes) {
				this._root.clearChildren();
				this._root.addNodes(nodes);
			},
			getter: function() {
				return this._root._nodes;
			}
		},

		/**
		 * 当前节点。
		 * @type dorado.widget.tree.BaseNode
		 * @attribute skipRefresh
		 */
		currentNode: {
			skipRefresh: true,
			setter: function(node) {
				if (this._currentNode == node) return;
				if (node == this._root) node = null;
				var eventArg = {
					oldCurrent: this._currentNode,
					newCurrent: node,
					processDefault: true
				};
				this.fireEvent("beforeCurrentChange", this, eventArg);
				if (!eventArg.processDefault) return;
				this._currentNode = node;
				this.fireEvent("onCurrentChange", this, eventArg);
				if (this._rendered) {
					$setTimeout(this, function() {
						var row = node ? this._itemDomMap[node._uniqueId] :null;
						this.setCurrentRow(row);
						if (row) this.scrollCurrentIntoView();
					}, 50);
				}
			}
		},

		/**
		 * 每一层子节点相对于父节点的缩进距离。
		 * @type int
		 * @attribute
		 * @default 18
		 */
		indent: {
			defaultValue: 18
		},

		/**
		 * 默认的节点展开模式。
		 * <p>目前支持下列两种取值：
		 * <ul>
		 * <li>async	-	异步模式。</li>
		 * <li>sync	-	同步模式。</li>
		 * </ul>
		 * </p>
		 * @type String
		 * @attribute skipRefresh
		 * @default "async"
		 */
		expandingMode: {
			defaultValue: "async",
			skipRefresh: true
		},

		/**
		 * 拖放模式。
		 * <p>
		 * 此属性具有如下几种取值：
		 * <ul>
		 * <li>control - 只能将目标拖放到整个控件上。</li>
		 * <li>onItem - 只能将目标拖放到某个树节点上。</li>
		 * <li>insertItems - 此项对于树而言没有实际意义，系统会自动将此项按照onOrInsertItems来处理。</li>
		 * <li>onOrInsertItems - 可以将目标拖放到某个某个树节点上或以顺序敏感的方式插入到树节点中。</li>
		 * <li>onAnyWhere - 可以将目标拖放以上的所有位置。</li>
		 * </ul>
		 * </p>
		 * @type String
		 * @attribute writeBeforeReady
		 * @default "onItem"
		 */
		dropMode: {
			defaultValue: "onItem",
			setter: function(v) {
				if (v == "insertItems") v = "onOrInsertItems";
				this._dropMode = v;
			}
		},

		/**
		 * 是否启用节点展开收缩时的动画效果。
		 * <p>注意：此动画效果对于scrollMode为viewport的树形列表控件时无效的。</p>
		 * @type boolean
		 * @attribute skipRefresh
		 * @default true
		 */
		expandingAnimated: {
			defaultValue: true,
			skipRefresh: true
		},

		/**
		 * 默认的节点图标URL。
		 * @type String
		 * @attribute
		 */
		defaultIcon: {},

		/**
		 * 默认的节点图标元素的CSS Class。
		 * @type String
		 * @attribute
		 */
		defaultIconClass: {},

		/**
		 * 默认的节点展开后的图标URL。
		 * 如果此属性未定义则直接使用icon属性中定义的图标作为展开后的图标。
		 * @type String
		 * @attribute
		 */
		defaultExpandedIcon: {},

		/**
		 * 默认的节点展开后图标元素的CSS Class。
		 * @type String
		 * @attribute
		 */
		defaultExpandedIconClass: {},
		
		/**
		 * 是否显示连接树节点的线。
		 * @type boolean
		 * @attribute writeBeforeReady
		 */
		showLines: {
			writeBeforeReady: true
		},

		/**
		 * 返回树中的第一个有效节点。
		 * @type dorado.widget.tree.BaseNode
		 * @attribute readOnly
		 */
		firstNode: {
			readOnly: true,
			getter: function() {
				return this._root.get("firstNode");
			}
		},

		view: {
			setter: function (view) {
				if (this._view == view) return;

				$invokeSuper.call(this, [view]);

				var nodes = this._identifiedNodes, oldView = this._view;
				for (var p in nodes) {
					if (nodes.hasOwnProperty(p)) {
						var node = nodes[p];
						if (oldView) oldView.unregisterViewElement(node._id);
						if (view) view.registerViewElement(node._id, node);
					}
				}
			}
		}
	},

	EVENTS: /** @scope dorado.widget.AbstractTree.prototype */ {

		/**
		 * 当一个节点将被展开之前触发的事件。
		 * <p>
		 * 此事件比较常见的使用场景是用于在节点展开之前为该节点创建下级子节点，以达到动态构造树结构的目的。<br>
		 * 不过，由于节点的展开动作有同步和异步两种执行方式（见{@link dorado.widget.tree.BaseNode#expand}、{@link dorado.widget.tree.BaseNode#expandAsync}）。
		 * 因此如果要让自己的事件代码支持异步的执行方式，就必须在代码中提供一些特别的异步操作支持。
		 * 主要是必须在异步过程结束之后主动的激活系统提供arg.callback回调对象，见示例代码。<br>
		 * <b>需要特别注意的是，不论自己的异步过程的执行成功与否你都应该激活系统提供的arg.callback回调对象，否则系统会一直认为该节点的展开过程没有结束。</b>
		 * </p>
		 * @param {Object} self 事件的发起者，即组件本身。
		 * @param {Object} arg 事件参数。
		 * @param {boolean} arg.async 是否正以异步方式执行展开操作。
		 * @param {dorado.widget.tree.BaseNode} arg.node 要展开的节点。
		 * @param {Function} arg.callDefault 直接调用此事件的系统后续处理逻辑，在同步方式的执行过程中此参数无效。<br>
		 * 此处的arg.callDefault方法还支持两个传入参数：
		 * @param {boolean} [arg.callDefault.success=true] 用于通知系统本次展开节点的操作是否成功。
		 * @param {Object|Error|dorado.Exception} [arg.callDefault.exception] 如果展开节点的操作是失败的，那么可以使用此参数向系统传递具体的错误信息。
		 * @param {boolean} #arg.processDefault=true 用于通知系统是否要继续完成节点展开的后续动作。
		 * @return {boolean} 是否要继续后续事件的触发操作，不提供返回值时系统将按照返回值为true进行处理。
		 * @see dorado.widget.AbstractTree#attribute:expandingMode
		 * @see dorado.widget.tree.BaseNode#expand
		 * @see dorado.widget.tree.BaseNode#expandAsync
		 * @event
		 *
		 * @example
		 * tree.bind("beforeExpand", function(self, arg) {
		 * 	var ajaxOptions = {
		 * 		url: "/get-nodes.do",
		 * 		method: "POST",
		 * 		jsonData: arg.node.get("userData.id")
		 * 	};
		 * 	if (arg.async) {
		 * 		// 以下代码用以支持异步的展开模式
		 * 		$ajax.request(ajaxOptions, function(result) {
		 * 			if (result.success) {
		 * 				arg.node.set("nodes", result.getJsonData());
		 * 				arg.callDefault(true);	// 通知系统展开过程已成功完成
		 * 			}
		 * 			else {
		 * 				arg.callDefault(false, result.error);	// 通知系统展开过程失败，同时传入异常信息。
		 * 			}
		 * 		});
		 * 	}
		 * 	else {
		 * 		// 以下代码用以支持同步的展开模式
		 * 		var result = $ajax.requestSync(ajaxOptions);
		 * 		arg.node.set("nodes", result.getJsonData());
		 * 	}
		 * });
		 */
		beforeExpand: {
			disallowMultiListeners: true
		},

		/**
		 * 当一个节点将被展开之后触发的事件。
		 * @param {Object} self 事件的发起者，即组件本身。
		 * @param {Object} arg 事件参数。
		 * @param {dorado.widget.tree.BaseNode} arg.node 展开的节点。
		 * @return {boolean} 是否要继续后续事件的触发操作，不提供返回值时系统将按照返回值为true进行处理。
		 * @event
		 */
		onExpand: {},

		/**
		 * 当一个节点将被收缩之前触发的事件。
		 * @param {Object} self 事件的发起者，即组件本身。
		 * @param {Object} arg 事件参数。
		 * @param {dorado.widget.tree.BaseNode} arg.node 相关的节点。
		 * @param {boolean} #arg.processDefault=true 用于通知系统是否要继续完成节点收起的后续动作。
		 * @return {boolean} 是否要继续后续事件的触发操作，不提供返回值时系统将按照返回值为true进行处理。
		 * @event
		 */
		beforeCollapse: {},

		/**
		 * 当一个节点将被收缩之后触发的事件。
		 * @param {Object} self 事件的发起者，即组件本身。
		 * @param {Object} arg 事件参数。
		 * @param {dorado.widget.tree.BaseNode} arg.node 相关的节点。
		 * @return {boolean} 是否要继续后续事件的触发操作，不提供返回值时系统将按照返回值为true进行处理。
		 * @event
		 */
		onCollapse: {},

		/**
		 * 当一个节点被附着到树状列表之后触发的事件。
		 * @param {Object} self 事件的发起者，即组件本身。
		 * @param {Object} arg 事件参数。
		 * @param {dorado.widget.tree.BaseNode} arg.node 相关的节点。
		 * @return {boolean} 是否要继续后续事件的触发操作，不提供返回值时系统将按照返回值为true进行处理。
		 * @event
		 */
		onNodeAttached: {},

		/**
		 * 当一个节点离开树状列表（即失去附着状态）之后触发的事件。
		 * @param {Object} self 事件的发起者，即组件本身。
		 * @param {Object} arg 事件参数。
		 * @param {dorado.widget.tree.BaseNode} arg.node 相关的节点。
		 * @return {boolean} 是否要继续后续事件的触发操作，不提供返回值时系统将按照返回值为true进行处理。
		 * @event
		 */
		onNodeDetached: {},

		/**
		 * 当前节点改变之前触发的事件。
		 * @param {Object} self 事件的发起者，即组件本身。
		 * @param {Object} arg 事件参数。
		 * @param {dorado.widget.tree.BaseNode} arg.oldCurrent 目前的当前节点。
		 * @param {dorado.widget.tree.BaseNode} arg.newCurrent 新的的当前节点，将要被设置为当前节点的节点。
		 * @param {boolean} #arg.processDefault=true 用于通知系统是否要继续完成设置当前节点的后续动作。
		 * @return {boolean} 是否要继续后续事件的触发操作，不提供返回值时系统将按照返回值为true进行处理。
		 * @event
		 */
		beforeCurrentChange: {},

		/**
		 * 当前节点改变之后触发的事件。
		 * @param {Object} self 事件的发起者，即组件本身。
		 * @param {Object} arg 事件参数。
		 * @param {dorado.widget.tree.BaseNode} arg.oldCurrent 目前的当前节点。
		 * @param {dorado.widget.tree.BaseNode} arg.newCurrent 新的的当前节点，将要被设置为当前节点的节点。
		 * @return {boolean} 是否要继续后续事件的触发操作，不提供返回值时系统将按照返回值为true进行处理。
		 * @event
		 */
		onCurrentChange: {},

		/**
		 * 当树状列表渲染树节点时触发的事件。
		 * @param {Object} self 事件的发起者，即组件本身。
		 * @param {Object} arg 事件参数。
		 * @param {HTMLElement} arg.dom 树节点对应的DOM对象。
		 * @param {String} arg.label 节点标题文本。
		 * @param {dorado.widget.tree.BaseNode} arg.node 渲染的节点。
		 * @param {boolean} #arg.processDefault 是否在事件结束后继续使用系统默认的渲染逻辑。
		 * @return {boolean} 是否要继续后续事件的触发操作，不提供返回值时系统将按照返回值为true进行处理。
		 * @event
		 */
		onRenderNode: {},

		/**
		 * 当某个树节点的勾选状态将要被改变时触发的事件。
		 * @param {Object} self 事件的发起者，即组件本身。
		 * @param {Object} arg 事件参数。
		 * @param {dorado.widget.tree.BaseNode} arg.node 相应的节点。
		 * @return {boolean} 是否要继续后续事件的触发操作，不提供返回值时系统将按照返回值为true进行处理。
		 * @event
		 */
		beforeNodeCheckedChange: {},

		/**
		 * 当某个树节点的勾选状态将要被改变后触发的事件。
		 * @param {Object} self 事件的发起者，即组件本身。
		 * @param {Object} arg 事件参数。
		 * @param {dorado.widget.tree.BaseNode} arg.node 相应的节点。
		 * @return {boolean} 是否要继续后续事件的触发操作，不提供返回值时系统将按照返回值为true进行处理。
		 * @event
		 */
		onNodeCheckedChange: {}
	},

	constructor: function() {
		this._identifiedNodes = {};

		var root = this._root = this.createRootNode();
		root._setTree(this);
		root._expanded = true;

		this._autoRefreshLock = 0;
		this._expandingCounter = 0;
		$invokeSuper.call(this, arguments);
	},

	destroy: function() {
		if (this._scrollMode != "viewport") this._root._setTree(null);
		$invokeSuper.call(this, arguments);
	},

	createRootNode: function() {
		return new dorado.widget.tree.BaseNode({
			label: "<ROOT>"
		});
	},
	
	/**
	 * 清除树中的所有树节点。
	 */
	clearNodes: function() {
		this._root.clearChildren();
	},

	createItemModel: function() {
		var im = new dorado.widget.tree.ItemModel();
		im.setItems(this._root);
		return im;
	},

	createItemDom: function(node) {
		var row = node._dom;
		if (!row || row.parentNode != null) {
			row = document.createElement("TR");
			row.className = "row";
			row.style.height = this._rowHeight + "px";

			if (this._scrollMode == "lazyRender" && this._shouldSkipRender) {
				row._lazyRender = true;
			} else {
				this.createItemDomDetail(row, node);
			}
		}
		return row;
	},

	createItemDomDetail: function(row, node) {
		var tree = node._tree, rowHeight = tree._rowHeight + "px";
		var cellConfig = {
			tagName: "TD",
			className: "d-tree-node",
			vAlign: "center",
			content: {
				tagName: "DIV",
				style: {
					position: "relative",
					height: rowHeight,
					lineHeight: rowHeight
				},
				content: [{
					tagName: "LABEL",
					contextKey: "buttonDom",
					doradoType: "tree-button",
					className: "node-button",
					style: {
						display: "inline-block",
						position: "relative"
					},
					content: {
						tagName: "div",
						className: "spinner"
					}
				}, {
					tagName: "LABEL",
					className: "node-label",
					style: {
						display: "inline-block"
					}
				}]
			}
		};
		if (tree._showLines) {
			cellConfig.content.content.insert({
				tagName: "DIV",
				className: "lines",
				style: {
					position: "absolute",
					left: 0,
					top: 0,
					height: "100%"
				}
			}, 0);
		}
		
		var context = {}, cell = $DomUtils.xCreate(cellConfig, null, context);
		var buttonDom = context.buttonDom, $buttonDom = jQuery(buttonDom), self = this;
		$buttonDom.mousedown(function() {
			return false;
		}).click(function() {
			var row = $DomUtils.findParent(buttonDom, function(parentNode) {
				return parentNode.tagName.toLowerCase() == "tr";
			});
			var node = $fly(row).data("item");
			if (node.get("hasChild")) {
				node._expandingAnimationEnabled = true;
				if (node._expanded) node.collapse();
				else if (self._expandingMode == "sync") node.expand();
				else node.expandAsync();
				node._expandingAnimationEnabled = false;
				$buttonDom.removeClass("expand-button-hover collapse-button-hover");
			}
			return false;
		}).hover(function() {
			if ($buttonDom.hasClass("expand-button")) $buttonDom.addClass("expand-button-hover");
			if ($buttonDom.hasClass("collapse-button")) $buttonDom.addClass("collapse-button-hover");
		}, function() {
			$buttonDom.removeClass("expand-button-hover collapse-button-hover");
		});
		row.appendChild(cell);
	},

	doRefreshItemDomData: function(row, node) {
		(this._renderer || $singleton(dorado.widget.tree.TreeNodeRenderer)).render(row, node);
	},

	getItemTimestamp: function(node) {
		return node.getTimestamp();
	},

	onNodeAttached: function(node) {
		if (!this._skipProcessCurrentNode && this._itemModel) {
			this._itemModel.onNodeAttached(node);
			if (this._root != node) {
				this.fireEvent("onNodeAttached", this, {
					node: node
				});
				
				if (!this.get("currentNode") && !this._allowNoCurrent) {
					this.set("currentNode", node);
				}
			}
		}
	},

	onNodeDetached: function(node) {
		if (!this._skipProcessCurrentNode && this._itemModel) {
			if (this.get("currentNode") == node) {
				this.set("currentNode", null);
			}
			
			this._itemModel.onNodeDetached(node);
			if (this._root != node) {
				this.fireEvent("onNodeDetached", this, {
					node: node
				});
			}
		}
	},
	
	refreshItemDoms: function(tbody, reverse, fn) {
		if (this._duringAnimation) return;
		return $invokeSuper.call(this, arguments);
	},

	/**
	 * 刷新某树节点的显示。
	 * @param {dorado.widget.tree.BaseNode} node 要刷新的节点。
	 */
	refreshNode: function(node) {
		if (node) dorado.Toolkits.cancelDelayedAction(node, "$refreshDelayTimerId");
		if (this._autoRefreshLock > 0 || !this._itemDomMap) return;
		var row = this._itemDomMap[node._uniqueId];
		if (row) this.refreshItemDomData(row, node);
	},

	/**
	 * 禁止树状列表自动根据作用在树节点上的自动刷新显示。
	 */
	disableAutoRefresh: function() {
		this._autoRefreshLock++;
	},

	/**
	 * 允许树状列表自动根据作用在树节点上的自动刷新显示。
	 */
	enableAutoRefresh: function() {
		this._autoRefreshLock--;
		if (this._autoRefreshLock < 0) this._autoRefreshLock = 0;
	},

	/**
	 * 根据传入的DHTML Event返回相应的树节点。
	 * <p>此方法一般用于onMouseDown、onClick等事件，用于获得此时鼠标实际操作的树节点。</p>
	 * @param {Event} event DHTML中的Event对象。
	 * @return {dorado.widget.tree.BaseNode} 相应的树节点。
	 */
	getNodeByEvent: function(event) {
		var row = this.findItemDomByEvent(event);
		return (row) ? $fly(row).data("item") : null;
	},

	/**
	 * 返回树中所有被勾选选中的节点的数组。
	 * @param {boolean} [includeHalfChecked] 是否包含那些半选状态的节点。
	 * @return {dorado.widget.tree.BaseNode[]} 节点数组。
	 */
	getCheckedNodes: function(includeHalfChecked) {
		var it = new dorado.widget.tree.TreeNodeIterator(this._root, {
			includeInvisibleNodes: true
		}), nodes = [];
		while (it.hasNext()) {
			var node = it.next();
			var checked = node.get("checked");
			if (includeHalfChecked) {
				if (checked !== false) nodes.push(node);
			}
			else {
				if (checked) nodes.push(node);
			}
		}
		return nodes;
	},

	/**
	 * 高亮指定的树节点。
	 * @param {dorado.widget.tree.BaseNode} [node] 要高亮的树节点，如果不指定此参数则表示要高亮当前树节点。
	 * @param {Object} [options] 高亮选项。见jQuery ui相关文档中关于highlight方法的说明。
	 * @param {Object} [speed] 动画速度。
	 */
	highlightItem: function(node, options, speed) {
		node = node || this.get("currentNode");
		if (!node || node._tree != this) return;
		var row = this._itemDomMap[node._uniqueId];
		if (row) {
			$fly(row.firstChild).effect("highlight", options|| {
					color: "#FFFF80"
				}, speed || 1500);
		}
		else if (!node._disableDelayHighlight) {
			var self = this;
			setTimeout(function() {
				node._disableDelayHighlight = true;
				self.highlightItem(node, options, speed);
				node._disableDelayHighlight = false;
			}, 100);
		}
	},

    findItemDomByPosition: function(pos) {
        pos.y += this._container.scrollTop;
        return $invokeSuper.call(this, [pos]);
    },

    initDraggingIndicator: function(indicator, draggingInfo, evt) {
		if (this._dragMode != "control") {
			var itemDom = draggingInfo.get("element");
			if (itemDom) {
				var cell = itemDom.firstChild;
				var nodeDom = cell.firstChild;
				var contentDom = $DomUtils.xCreate({
					tagName: "div",
					className: "d-list-dragging-item " + cell.className
				});
				var children = [];
				for (var i = 1; i < nodeDom.childNodes.length; i++) {
					var child = nodeDom.childNodes[i];
					children.push(child);
				}
				$fly(children).clone().appendTo(contentDom);
				indicator.set("content", contentDom);
			}
		}
	},

	doOnDraggingSourceMove: function(draggingInfo, evt, targetObject, insertMode, refObject, itemDom) {
		var oldInsertMode = insertMode;

		if (itemDom) {
			if (insertMode) {
				var dom = this._dom, node = $fly(itemDom).data("item");
				if (insertMode == "after" && node._expanded && node._nodes.size) {
					targetObject = node;
					insertMode = "before";
					refObject = node.get("firstNode");
				} else {
					targetObject = node._parent;
				}
			}

			if (draggingInfo.get("sourceControl") == this) {
				var node = targetObject;
				while (node) {
					if (node == draggingInfo.get("object")) {
						targetObject = null;
						itemDom = null;
						break;
					}
					node = node._parent;
				}
			}
		}
		if (itemDom) {
			return $invokeSuper.call(this, [draggingInfo, evt, targetObject, oldInsertMode, refObject, itemDom]);
		} else {
			return false;
		}
	},

	showDraggingInsertIndicator: function(draggingInfo, insertMode, itemDom) {

		function getNodeContentOffsetLeft(nodeDom) {
			return nodeDom.firstChild.firstChild.offsetLeft;
		}

		if (insertMode) {
			var insertIndicator = dorado.widget.AbstractList.getDraggingInsertIndicator();
			var dom = this._dom, node = $fly(itemDom).data("item");

			var left = getNodeContentOffsetLeft(itemDom);
			if (draggingInfo.get("targetObject") == $fly(itemDom).data("item")) {
				left += this._indent;
			}
			var width = dom.offsetWidth;
			if (dom.clientWidth < width) width = dom.clientWidth;
			width -= left;

			var top = (insertMode == "before") ? itemDom.offsetTop : (itemDom.offsetTop + itemDom.offsetHeight);
			$fly(insertIndicator).width(width).height(2).left(left).top(top - 1).show();
			dom.appendChild(insertIndicator);
		} else {
			$invokeSuper.call(this, arguments);
		}
	},

	processItemDrop: function(draggingInfo, evt) {
		var object = draggingInfo.get("object");
		var targetObject = draggingInfo.get("targetObject");
		var insertMode = draggingInfo.get("insertMode");
		var refObject = draggingInfo.get("refObject");
		if (object instanceof dorado.widget.tree.BaseNode && targetObject instanceof dorado.widget.tree.BaseNode) {
			this._skipProcessCurrentNode = (object._tree == this);
			object.remove();
			delete this._skipProcessCurrentNode;
			targetObject.addNode(object, insertMode, refObject);
			
			if (targetObject.get("expanded")) {
				this.set("currentNode", object);
				this.highlightItem(object);
			}
			else {
				this.set("currentNode", targetObject);
			}
			return true;
		}
		return false;
	}
});

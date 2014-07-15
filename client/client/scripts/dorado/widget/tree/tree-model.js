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
 * @name dorado.widget.tree
 * @namespace 树状列表控件所使用的一些相关类的命名空间。
 */
dorado.widget.tree = {};

dorado.widget.tree.BaseNodeList = $extend(dorado.util.KeyedArray, {
	$className: "dorado.widget.tree.BaseNodeList",
	
	constructor: function(parent, getKeyFunction) {
		$invokeSuper.call(this, [getKeyFunction]);
		this.parent = parent;
	},
	
	beforeInsert: function(node) {
		var parentNode = node._parent = this.parent;
		var originHasChild = parentNode.get("hasChild");
		node._setTree(parentNode._tree);
		return {
			parentNode: parentNode,
			originHasChild: originHasChild
		};
	},
	
	afterInsert: function(node, ctx) {
		var parentNode = ctx.parentNode, originHasChild = ctx.originHasChild, tree = parentNode._tree;
		parentNode._changeVisibleChildNodeCount(1 + ((node._expanded) ? node._visibleChildNodeCount : 0));
		if (tree && (parentNode._expanded || !originHasChild) && tree._rendered && tree._attached && tree._autoRefreshLock < 1) {
			tree._nodeInserted(node);
		}
	},
	
	beforeRemove: function(node) {
		var tree = node._tree, parentNode = this.parent, index = this.indexOf(node);
		if (tree && node == tree.get("currentNode") && parentNode) {
			var newCurrent;
			var size = parentNode._nodes.size;
			if (size == 1) {
				newCurrent = (parentNode == tree._root) ? null : parentNode;
			} else {
				var i = 0;
				if (index < size - 1) i = index + 1;
				else if (index > 0) i = index - 1;
				newCurrent = parentNode._nodes.get(i);
			}
			tree.set("currentNode", newCurrent);
		}
		
		node._setTree(null);
		delete node._parent;
		return {
			parentNode: parentNode,
			index: index
		};
	},
	
	afterRemove: function(node, ctx) {
		var parentNode = ctx.parentNode, index = ctx.index, tree = parentNode._tree;
		parentNode._changeVisibleChildNodeCount(-1 - ((node._expanded) ? node._visibleChildNodeCount : 0));
		if (tree && parentNode._expanded && tree._rendered && tree._attached && tree._autoRefreshLock < 1) {
			tree._nodeRemoved(node, parentNode, index);
		}
	},
	
	clone: function() {
		var cloned = $invokeSuper.call(this);
		delete cloned.parent;
		return cloned;
	}
});

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @class 树状列表的节点。
 * @abstract
 * @extends dorado.widget.ViewElement
 * @param {String|Object} [config] 配置信息。
 * <p>
 * 此参数具有多态性。当传入的数值为String时，系统会将此参数识别为节点的文字标签。
 * 当我们传入的参数是一个JSON对象时，系统会自动将该JSON对象中的属性设置到节点中。
 * </p>
 */
dorado.widget.tree.BaseNode = $extend(dorado.widget.ViewElement, /** @scope dorado.widget.tree.BaseNode.prototype */ {
	$className: "dorado.widget.tree.BaseNode",
	
	_visibleChildNodeCount: 0,
	
	ATTRIBUTES: /** @scope dorado.widget.tree.BaseNode.prototype */ {
		/**
		 * 该节点所隶属的柱状列表。
		 * @type dorado.widget.Tree
		 * @attribute readOnly
		 */
		tree: {
			readOnly: true
		},

		/**
		 * 该节点所隶属父节点。
		 * @type dorado.widget.tree.BaseNode
		 * @attribute readOnly
		 */
		parent: {},
		
		/**
		 * 子节点的集合。
		 * <p>
		 * 此属性在读写时的意义不完全相同。
		 * <ul>
		 * <li>当读取时树状列表中的子节点集合，类型为{@link dorado.util.KeyedArray}。</li>
		 * <li>
		 * 当写入时用于向树状列表中添加子节点。<br>
		 * 传入的数据应是数组，此数组中既可以放入子节点的实例，又可以放入JSON对象。
		 * </li>
		 * </ul>
		 * </p>
		 * @type dorado.util.KeyedArray|[Object]|[dorado.widget.tree.BaseNode]
		 * @attribute
		 */
		nodes: {
			setter: function(nodes) {
				this.clearChildren();
				this.addNodes.call(this, nodes);
			}
		},
		
		/**
		 * 返回第一个有效的子节点。
		 * @type dorado.widget.tree.BaseNode
		 * @attribute readOnly
		 */
		firstNode: {
			readOnly: true,
			getter: function() {
				return this._expanded ? this._nodes.get(0) : null;
			}
		},
		
		/**
		 * 节点标题文字。
		 * @type String
		 * @attribute
		 */
		label: {},
		
		/**
		 * 节点图标URL。
		 * @type String
		 * @attribute
		 */
		icon: {},
		
		/**
		 * 图标元素的CSS Class。
		 * @type String
		 * @attribute
		 */
		iconClass: {},
		
		/**
		 * 节点展开后的图标URL。
		 * 如果此属性未定义则直接使用icon属性中定义的图标作为展开后的图标。
		 * @type String
		 * @attribute
		 */
		expandedIcon: {},
		
		/**
		 * 节点展开后图标元素的CSS Class。
		 * @type String
		 * @attribute
		 */
		expandedIconClass: {},
		
		/**
		 * 该节点上是否要显示一个复选框。
		 * @type boolean
		 * @attribute
		 */
		checkable: {},
		
		/**
		 * 该节点上是否已被复选选中。
		 * <p>此属性支持3中状态：true、false、null。其中null表示半勾选状态。</p>
		 * @type Boolean
		 * @attribute
		 * @default false
		 */
		checked: {
			defaultValue: false,
			setter: function(checked) {
				if (this._checked === checked) return;
				
				var tree = this._tree, arg = {
					node: this,
					processDefault: true
				};
				if (tree) {
					tree.fireEvent("beforeNodeCheckedChange", tree, arg);
					if (!arg.processDefault) return;
				}
				this._checked = checked;
				if (tree) {
					tree.fireEvent("onNodeCheckedChange", tree, arg);
				}
				
				if (this.get("checkable")) this._nodeCheckedChanged(this._checked, true, true);
			}
		},
		
		/**
		 * 是否自动根据本节点的勾选状态来维护所有子节点的勾选状态。
		 * @type boolean
		 * @attribute
		 * @default true
		 */
		autoCheckChildren: {
			defaultValue: true
		},
		
		/**
		 * 提示信息。
		 * @type String
		 * @attribute
		 */
		tip: {},
		
		/**
		 * 可任意设定的与该节点关联在一起的数据。
		 * @type Object
		 * @attribute
		 */
		data: {},
		
		/**
		 * 该节点是否拥有子节点。
		 * @type boolean
		 * @attribute
		 */
		hasChild: {
			getter: function() {
				return (this._nodes.size > 0) || this._hasChild;
			}
		},
		
		/**
		 * 该节点当前是否已展开。
		 * @type boolean
		 * @attribute
		 */
		expanded: {
			skipRefresh: true,
			setter: function(expanded) {
				if (this._tree) {
					(expanded) ? this.expandAsync() : this.collapse();
				} else {
					this._expanded = expanded;
				}
			}
		},
		
		/**
		 * 该节点当前是否正处于展开状态。
		 * 一般而言只要当树正在等待从远端装载子节点数据时会处于此状态。
		 * @type boolean
		 * @attribute readOnly
		 */
		expanding: {
			readOnly: true
		},
		
		/**
		 * 用于判断此节点当前是否可见的属性。
		 * <p>
		 * 节点是否可见主要与其父节点是否处于展开状态相关。
		 * 另外，对于尚未被关联到树中的节点其可见状态总是false。
		 * </p>
		 * @type boolean
		 * @attribute readOnly
		 */
		visible: {
			readOnly: true,
			getter: function() {
				if (!this._tree) return false;
				var parent = this._parent;
				while (parent) {
					if (!parent._expanded) return false;
					parent = parent._parent;
				}
				return true;
			}
		},
		
		/**
		 * 用户自定义数据。
		 * @type Object
		 * @attribute
		 */
		userData: {},
		
		/**
		 * 树节点当前所处的层数。
		 * <p>
		 * 对于我们在树中可见的顶层节点，其level为1；其中的子节点的level为2。
		 * </p>
		 * @type int
		 * @attribute readOnly
		 */
		level: {
			readOnly: true,
			getter: function() {
				var n = this, level = -1;
				while (n) {
					level++;
					n = n._parent;
				}
				return level;
			}
		}
	},
	
	constructor: function(config) {
		this._uniqueId = dorado.Core.newId();
		this._nodes = new dorado.widget.tree.BaseNodeList(this, function(element) {
			return element._uniqueId;
		});
		if (config && config.constructor == String) {
			this._label = config;
		}
		$invokeSuper.call(this, arguments);
	},
	
	_setTree: function(tree) {
		if (this._tree != tree) {
			var oldTree = this._tree;
			if (oldTree != null && oldTree.onNodeDetached) oldTree.onNodeDetached(this);
			if (oldTree) oldTree.unregisterInnerViewElement(this);

			this._tree = tree;
			if (tree != null && tree.onNodeAttached) tree.onNodeAttached(this);
			if (tree) tree.registerInnerViewElement(this);
			
			this._nodes.each(function(child) {
				child._setTree(tree);
			});
		}
	},
	
	_changeVisibleChildNodeCount: function(diff) {
		if (isNaN(diff)) return;
		this._visibleChildNodeCount += diff;
		if (this._expanded) this._timestamp = dorado.Core.getTimestamp();
		var n = this, p = n._parent;
		while (p && n._expanded) {
			p._visibleChildNodeCount += diff;
			n = p, p = p._parent;
		}
	},
	
	doSet: function(attr, value) {
		$invokeSuper.call(this, arguments);
		var def = this.ATTRIBUTES[attr];
		if (def && !def.skipRefresh) {
			this._timestamp = dorado.Core.getTimestamp();
			this.refresh();
		}
	},
	
	getTimestamp: function() {
		return this._timestamp;
	},
	
	_nodeCheckedChanged: function(checked, processChildren, processParent) {
		var tree = this._tree;
		if (!tree) return;
		
		if (processChildren && this.get("autoCheckChildren")) {
			if (!tree._autoChecking) tree._autoCheckingChildren = true;
			if (tree._autoCheckingChildren) {
				tree._autoCheckingParent = false;
				tree._autoChecking = true;
				this._nodes.each(function(child) {
					if (child.get("checkable")) child.set("checked", checked);
				});
				tree._autoChecking = false;
			}
		}
		
		if (processParent) {
			var parent = this._parent;
			if (parent.get("autoCheckChildren")) {
				if (!tree._autoChecking) tree._autoCheckingParent = true;
				if (tree._autoCheckingParent && parent && parent.get("checkable")) {
					tree._autoCheckingChildren = false;
					var checkedCount = 0, checkableCount = 0, halfCheck = false, self = this;
					parent._nodes.each(function(child) {
						if (child.get("checkable")) {
							checkableCount++;
							var c = (child == self) ? checked : child.get("checked");
							if (c === true) checkedCount++;
							else if (c == null) halfCheck = true;
						}
					});
					if (checkableCount) {
						tree._autoChecking = true;
						var c = null;
						if (!halfCheck) {
							c = (checkedCount == 0) ? false : ((checkedCount == checkableCount) ? true : null)
						}
						parent.set("checked", c);
						tree._autoChecking = false;
					}
				}
			}
		}
	},
	
	/**
	 * 刷新节点的显示。
	 */
	refresh: function() {
		var tree = this._tree;
		if (tree && tree._rendered && tree._attached && tree._ignoreRefresh < 1 && tree._autoRefreshLock < 1) {
			dorado.Toolkits.setDelayedAction(this, "$refreshDelayTimerId", function() {
				tree.refreshNode(this);
			}, 50);
		}
	},
	
	createChildNode: function(config) {
		return new dorado.widget.tree.Node(config);
	},
	
	/**
	 * 向节点中插入一个子节点。
	 * @param {dorado.widget.tree.BaseNode|Object} data 要插入的子节点。此处也可以传入描述子节点信息的JSON对象。
	 * @param {int|String} [insertMode] 对象的插入位置或插入模式。
	 * @param {Object} [refData] 插入位置的参照对象。
	 * @return {dorado.widget.tree.BaseNode} 新插入的树节点。
	 * @see dorado.util.KeyedArray#insert
	 */
	addNode: function(node, insertMode, refData) {
		if (node instanceof dorado.widget.tree.BaseNode) {
			this._nodes.insert(node, insertMode, refData);
		} else {
			node = this.createChildNode(node);
			this._nodes.insert(node, insertMode, refData);
		}
		if (node.get("checkable")) node._nodeCheckedChanged(node.get("checked"), false, true);
		return node;
	},
	
	/**
	 * 向节点中插入一批子节点。
	 * @param {dorado.widget.tree.BaseNode[]|Object[]} nodeConfigs 子节点数组或包含子节点信息的JSON对象数组。
	 */
	addNodes: function(nodeConfigs) {
		for (var i = 0; i < nodeConfigs.length; i++) {
			this.addNode(nodeConfigs[i]);
		}
	},
	
	/**
	 * 从父节点中删除本节点。
	 */
	remove: function() {
		if (this._parent) {
			if (this.get("checkable")) this._nodeCheckedChanged(false, false, true);
			this._parent._nodes.remove(this);
		}
	},
	
	/**
	 * 清除本节点的所有子节点。
	 */
	clearChildren: function() {
		this._nodes.clear();
	},
	
	_expand: function(callback) {
		this._expanded = true;
		this._expanding = false;
		this._timestamp = dorado.Core.getTimestamp();
		if (this._parent) {
			this._parent._changeVisibleChildNodeCount(this._visibleChildNodeCount);
		}
		this._tree._nodeExpanded(this, callback);
		this._hasExpanded = true;
	},
	
	/**
	 * 展开节点，此方法可供子类复写。
	 * @protected
	 * @param {Function|Callback} callback 回调对象。
	 * @see dorado.widget.tree.BaseNode#expand
	 */
	doExpand: function(callback) {
		this._expand(callback);
	},
	
	/**
	 * 以异步处理的方式展开节点，此方法可供子类复写。
	 * @protected
	 * @param {Function|Callback} callback 回调对象。
	 * @see dorado.widget.tree.BaseNode#expandAsync
	 */
	doExpandAsync: function(callback) {
		this._expand(callback);
	},
	
	/**
	 * 展开节点。
	 * <p>此方法通常不应被子类复写，如有需要子类应复写doExpand方法。</p>
	 * <p>此方法是以同步模式执行的，因此在通常情况下我们并不需要利用回调机制来感知展开动作是否完成。
	 * 因此只要此方法结束展开动作事实就已经结束了，不过此时展开节点的动画效果可能并未结束。
	 * 为了满足某些特殊场景的需求，此方法特别提供的回调参数以响应节点展开动画的结束事件。</p>
	 * @param {Function|Callback} [callback] 回调对象。
	 * @see dorado.widget.tree.BaseNode#doExpand
	 */
	expand: function(callback) {
		if (this._expanded || !this._tree) {
			$callback(callback);
			return;
		}
		
		var tree = this._tree;
		var eventArg = {
			async: false,
			node: this,
			processDefault: true
		};
		tree.fireEvent("beforeExpand", tree, eventArg);
		if (!eventArg.processDefault) return;
		this._expandingCounter ++;
		try {
			if (this.doExpand) this.doExpand(callback);
		}
		finally {
			this._expandingCounter --;
		}
		tree.fireEvent("onExpand", tree, eventArg);
	},
	
	/**
	 * 以异步处理的方式展开节点。
	 * <p>此方法通常不应被子类复写，如有需要子类应复写doExpandAsync方法。</p>
	 * @param {Function|Callback} callback 回调对象。
	 * @see dorado.widget.tree.BaseNode#doExpandAsync
	 */
	expandAsync: function(callback) {
		if (this._expanded || !this._tree) {
			$callback(callback);
			return;
		}
		
		var tree = this._tree, self = this, called = false;
		var callDefault = function(success, result) {
			if (called) return;
			called = true;
			
			self._expanding = false;
			tree._expandingCounter --;
			if (success === false) {
				$callback(callback, false, result);
			} else {
				self.doExpandAsync({
					callback: function(success, result) {
						$callback(callback, success, result);
						delete eventArg.callback;
						tree.fireEvent("onExpand", tree, eventArg);
					}
				});
			}
		};
		
		this._expanding = true;
		this._timestamp = dorado.Core.getTimestamp();
		tree.refreshNode(this);
		
		var eventArg = {
			async: true,
			node: this,
			callDefault: callDefault,
			processDefault: true
		};
		if (tree.getListenerCount("beforeExpand")) {
			tree.fireEvent("beforeExpand", tree, eventArg);
			if (!eventArg.processDefault) {
				this._expanding = false;
				this._timestamp = dorado.Core.getTimestamp();
				tree.refreshNode(this);
			}
		} else {
			this._expandingCounter ++;
			callDefault();
		}
	},
	
	/**
	 * 收起节点。此方法可供子类复写。
	 * @protected
	 * @see dorado.widget.tree.BaseNode#collapse
	 */
	doCollapse: function() {
		this._expanded = false;
		this._timestamp = dorado.Core.getTimestamp();
		if (this._parent) {
			this._parent._changeVisibleChildNodeCount(-this._visibleChildNodeCount);
		}
		this._tree._nodeCollapsed(this);
	},
	
	/**
	 * 收起节点。
	 * <p>此方法通常不应被子类复写，doCollapse。</p>
	 * @see dorado.widget.tree.BaseNode#doCollapse
	 */
	collapse: function() {
		if (!this._expanded) return;
		var tree = this._tree;
		var eventArg = {
			node: this,
			processDefault: true
		};
		if (tree) tree.fireEvent("beforeCollapse", tree, eventArg);
		if (!eventArg.processDefault) return;
		this.doCollapse();
		if (tree) tree.fireEvent("onCollapse", tree, eventArg);
	},
	
	/**
	 * 高亮树节点。
	 * @param {Object} [options] 高亮选项。见jQuery ui相关文档中关于highlight方法的说明。
	 * @param {Object} [speed] 动画速度。
	 * @see dorado.widget.Tree#highlightItem
	 */
	highlight: function(options, speed) {
		if (this._tree) this._tree.highlightItem(this, options, speed);
	},
	
	/**
	 * 展开此节点的每一级父节点，以便于该节点可以处于可见状态。
	 * <p>
	 * 此方法不负责将该节点设置为当前节点。
	 * </p>
	 */
	expandParents: function() {
		var parent = this._parent;
		while (parent) {
			if (!parent.get("expanded")) parent.expand();
			parent = parent._parent;
		}
	},
	
	clone: function() {
		var cloned = $invokeSuper.call(this);
		delete cloned._tree;
		delete cloned._parent;
		this._nodes.each(function(node) {
			cloned.addNode(node.clone());
		});
		return cloned;
	}
});

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @class 支持定义id和事件的树节点。
 * @extends dorado.widget.tree.BaseNode
 * @extends dorado.EventSupport
 */
dorado.widget.tree.Node = $extend([dorado.widget.tree.BaseNode, dorado.EventSupport], /** @scope dorado.widget.tree.Node.prototype */ {
	$className: "dorado.widget.tree.Node",

	_setTree: function(tree) {
		if (this._tree !== tree && this._id) {
			var oldTree = this._tree, oldView, newView;
			if (oldTree) {
				delete oldTree._identifiedNodes[this._id];
				oldView = oldTree.get("view");
			}

			if (tree) {
				tree._identifiedNodes[this._id] = this;
				newView = tree.get("view");
			}

			if (oldView !== newView) {
				$invokeSuper.call(this, [tree]);
				return;
			}
		}
		$invokeSuper.call(this, [tree]);
	},

	getListenerScope: function() {
		var tree = this.get("view");
		return (tree && tree.get("view")) || $topView;
	}
});

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @class 与一个数据实体对应的树节点。
 * @extends dorado.widget.tree.BaseNode
 */
dorado.widget.tree.DataNode = $extend(dorado.widget.tree.BaseNode, /** @scope dorado.widget.tree.DataNode.prototype */ {
	$className: "dorado.widget.tree.DataNode",
	
	ATTRIBUTES: /** @scope dorado.widget.tree.DataNode.prototype */ {
	
		/**
		 * 对应的数据实体。
		 * @type Object|dorado.Entity
		 * @attribute
		 */
		data: {
			setter: function(data) {
				if (this._data) delete this._data._node;
				
				if (!(data instanceof dorado.Entity)) data = new dorado.Entity(data);
				data._node = this;
				this._data = data;
			}
		}
	},
	
	createChildNode: function(config) {
		return new dorado.widget.tree.DataNode(config);
	},
	
	getTimestamp: function() {
		return ((this._data) ? this._data.timestamp : 0) + this._timestamp;
	},
	
	_getEntityProperty: function(entity, property) {
		if (!entity || !property) return null;
		return (entity instanceof dorado.Entity) ? entity.get(property) : entity[property];
	},
	
	_getEntityPropertyText: function(entity, property) {
		if (!entity || !property) return null;
		return (entity instanceof dorado.Entity) ? entity.getText(property) : entity[property];
	}
});

dorado.widget.tree.TreeNodeIterator = $extend(dorado.util.Iterator, {
	$className: "dorado.widget.tree.TreeNodeIterator",
	
	constructor: function(root, options) {
		var nextIndex = (options && options.nextIndex > 0) ? options.nextIndex : 0;
		var includeInvisibleNodes = this.includeInvisibleNodes = options ? !!options.includeInvisibleNodes : false;
		this._iterators = [root._nodes.iterator()];
		
		if (nextIndex > 0) {
			var skiped = 0, it = this._iterators.peek();
			while (skiped < nextIndex) {
				var node = it.next(), processChildren = false;
				if (node) {
					var tmpSkiped = skiped +
					((node._expanded || includeInvisibleNodes) ? (1 + node._visibleChildNodeCount) : 1);
					if (tmpSkiped < nextIndex) skiped = tmpSkiped;
					else if (tmpSkiped == nextIndex) {
						while ((node._expanded || includeInvisibleNodes) && node._nodes.size > 0) {
							it = node._nodes.iterator();
							it.last();
							this._iterators.push(it);
							node = node._nodes.get(node._nodes.size - 1);
						}
						break;
					} else {
						processChildren = true;
						skiped++;
					}
				} else {
					processChildren = true;
				}
				
				if (processChildren) {
					var node = it.current();
					if (!node || (!node._expanded && !includeInvisibleNodes) || node._nodes.size == 0) break;
					it = node._nodes.iterator();
					this._iterators.push(it);
				}
			}
		}
	},
	
	// 寻找node中的最后一个节点。
	_findLastSubNode: function(node) {
		var its = this._iterators;
		while ((node._expanded || this.includeInvisibleNodes) && node._nodes.size > 0) {
			var it = node._nodes.iterator();
			it.last();
			its.push(it);
			node = it.previous();
		}
		return node;
	},
	
	first: function() {
		var its = this._iterators;
		its.splice(1, its.length - 1);
		its[0].first();
	},
	
	last: function() {
		var its = this._iterators;
		its.splice(1, its.length - 1);
		its[0].last();
		var node = its[0].previous();
		if (node) {
			this._findLastSubNode(node);
			its.peek().last();
		}
	},
	
	hasPrevious: function() {
		return (this._iterators.length > 1 || this._iterators[0].hasPrevious());
	},
	
	hasNext: function() {
		var its = this._iterators;
		
		var current = its.peek().current();
		if (current && current._nodes.size > 0 && (current._expanded || this.includeInvisibleNodes)) return true;
		
		for (var i = its.length - 1; i >= 0; i--) {
			if (its[i].hasNext()) return true;
		}
		return false;
	},
	
	previous: function() {
		var its = this._iterators;
		var node = its.peek().previous();
		if (node) {
			node = this._findLastSubNode(node);
		} else if (its.length > 1) {
			its.pop();
			node = its.peek().current();
		} else {
			node = null;
		}
		return node;
	},
	
	next: function() {
		var node, current, its = this._iterators;
		
		current = its.peek().current();
		if (current && current._nodes.size > 0 && (current._expanded || this.includeInvisibleNodes)) {
			its.push(current._nodes.iterator());
		}
		
		for (var i = its.length - 1; i >= 0; i--) {
			node = its[i].next();
			if (node) break;
			if (its.length > 1) its.pop();
		}
		return node;
	},
	
	createBookmark: function() {
		var subBookmarks = [];
		for (var i = 0; i < this._iterators.length; i++) {
			subBookmarks.push(this._iterators[i].createBookmark());
		}
		return {
			subIterators: this._iterators.slice(0),
			subBookmarks: subBookmarks
		};
	},
	
	restoreBookmark: function(bookmark) {
		this._iterators = bookmark.subIterators;
		for (var i = 0; i < this._iterators.length; i++) {
			this._iterators[i].restoreBookmark(bookmark.subBookmarks[i]);
		}
	}
});

dorado.widget.tree.TreeNodeIterator.getNodeIndex = function(node) {
	var index = -1, p = node._parent;
	while (p) {
		if (!p._expanded && !this.includeInvisibleNodes) return -1;
		var it = p._nodes.iterator();
		index++;
		while (it.hasNext()) {
			var n = it.next();
			if (n == node) break;
			index++;
			if (n._expanded || this.includeInvisibleNodes) index += n._visibleChildNodeCount;
		}
		node = p;
		p = node._parent;
	}
	return index;
};

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @class 树状列表的数据模型。
 * <p>用于辅助树状列表管理数据的对象。</p>
 * @extends dorado.widget.list.ItemModel
 */
dorado.widget.tree.ItemModel = $extend(dorado.widget.list.ItemModel, {
	$className: "dorado.widget.tree.ItemModel",
	
	constructor: function() {
		this._itemMap = {};
		$invokeSuper.call(this, arguments);
	},
	
	onNodeAttached: function(node) {
		this._itemMap[node._uniqueId] = node;
	},
	
	onNodeDetached: function(node) {
		delete this._itemMap[node._uniqueId];
	},
	
	iterator: function(startIndex) {
		var index = startIndex;
		if (index === undefined) index = this._startIndex || 0;
		var it = new dorado.widget.tree.TreeNodeIterator(this._root, {
			nextIndex: index
		});
		return it;
	},
	
	getItems: function() {
		return this._root;
	},
	
	setItems: function(root) {
		this._root = root;
	},
	
	getItemCount: function() {
		var root = this._root;
		return (root._expanded) ? root._visibleChildNodeCount : 0;
	},
	
	getItemAt: function(index) {
		return new dorado.widget.tree.TreeNodeIterator(this._root, {
			nextIndex: index
		}).next();
	},
	
	getItemIndex: dorado.widget.tree.TreeNodeIterator.getNodeIndex,
	
	getItemId: function(node) {
		return node._uniqueId;
	},
	
	getItemById: function(itemId) {
		return this._itemMap[itemId];
	}
});

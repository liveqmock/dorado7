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
 * @class 支持数据绑定的树节点。
 * @extends dorado.widget.tree.DataNode
 */
dorado.widget.tree.DataBindingNode = $extend(dorado.widget.tree.DataNode, /** @scope dorado.widget.tree.DataBindingNode.prototype */ {
	$className: "dorado.widget.tree.DataBindingNode",

	ATTRIBUTES: /** @scope dorado.widget.tree.DataBindingNode.prototype */ {

		/**
		 * 此节点相关的绑定配置对象。
		 * <p>
		 * 即此节点是根据哪个绑定配置对象生成的。
		 * 具体使用方法见{@link dorado.widget.DataTree#attribute:bindingConfigs}
		 * </p>
		 * @type Object
		 * @attribute writeOnce
		 * @see dorado.widget.DataTree#attribute:bindingConfigs
		 */
		bindingConfig: {
			writeOnce: true
		},

		/**
		 * 子绑定配置对象的数组。此属性一般仅供内部使用。
		 * @ignore
		 * @type Object[]
		 * @attribute writeOnce
		 * @see dorado.widget.DataTree#attribute:bindingConfigs
		 */
		childBindingConfigs: {
			writeOnce: true,
			setter: function(v) {
				this._bindingConfig.childBindingConfigs = v;
			},
			getter: function() {
				return this._bindingConfig.childBindingConfigs;
			}
		},
		
		/**
		 * 子节点是否已创建。
		 * <p>
		 * 通常，对于DataTree而言，子节点都是在父节点第一次展开时懒创建的。因此此属性大致也表示该节点是否曾经展开过。
		 * </p>
		 * @type boolean
		 * @attribute readOnly
		 */
		childrenPrepared: {},

		hasChild: {
			getter: function() {

				function ifHasChild(entity, property) {
					if (!property) return false;
					var hasChild = false, value;
					if (entity instanceof dorado.Entity) {
						value = entity._data[property]
						if (value === undefined) {
							if (entity.dataType) {
								var pd = entity.dataType.getPropertyDef(property);
								hasChild = (pd.getDataPipe && pd.getDataPipe(entity) != null);
							}
						} else if (value) {
							if (value instanceof dorado.EntityList) {
								hasChild = (!value.isNull && value.entityCount);
							}
							else if (value.isDataPipeWrapper || typeof value == "object" && !(value instanceof Date)) {
								hasChild = true;
							}
						}
					}
					else {
						value = entity[property];
						if (value && typeof value == "object" && !(value instanceof Date)) {
							hasChild = true;
						}
					}
					return hasChild;
				}

				if (this._nodes.size > 0) return true;
				if (this._hasChild != undefined) return this._hasChild;
				if (this._bindingConfig.hasChildProperty != undefined) {
					return this._getEntityProperty(this._data, this._bindingConfig.hasChildProperty);
				}

				var hasChild = false, entity = this._data;
				if (entity && entity instanceof dorado.Entity) {
					if (this._bindingConfig.recursive) {
						hasChild = ifHasChild(entity, this._bindingConfig.childrenProperty);
					}
					
					if (!hasChild && this._bindingConfig.childBindingConfigs) {
						var childBindingConfigs = this._bindingConfig.childBindingConfigs;
						if (childBindingConfigs) {
							for (var i = 0; i < childBindingConfigs.length; i++) {
								hasChild = ifHasChild(entity, childBindingConfigs[i].childrenProperty);
								if (hasChild) break;
							}
						}
					}
				}
				return hasChild;
			}
		},

		label: {
			getter: function() {
				if (this._label) return this._label;
				return this._getEntityPropertyText(this._data, this._bindingConfig.labelProperty);
			}
		},

		icon: {
			getter: function() {
				if (this._icon) return this._icon;
				var bg = this._bindingConfig;
				if (bg.icon) return bg.icon;
				return this._getEntityProperty(this._data, bg.iconProperty);
			}
		},

		iconClass: {
			getter: function() {
				if (this._iconClass) return this._iconClass;
				var bg = this._bindingConfig;
				if (bg.iconClass) return bg.iconClass;
				return this._getEntityProperty(this._data, bg.iconClassProperty);
			}
		},

		expanededIcon: {
			getter: function() {
				if (this._expanededIcon) return this._expanededIcon;
				var bg = this._bindingConfig;
				if (bg.expanededIcon) return bg.expanededIcon;
				return this._getEntityProperty(this._data, bg.expanededIconProperty);
			}
		},

		expanededIconClass: {
			getter: function() {
				if (this._expanededIconClass) return this._expanededIconClass;
				var bg = this._bindingConfig;
				if (bg.expanededIconClass) return bg.expanededIconClass;
				return this._getEntityProperty(this._data, bg.expanededIconClassProperty);
			}
		},
		
		checkable: {
			getter: function() {
				return (this._checkable === undefined) ? this._bindingConfig.checkable : this._checkable;
			}
		},
		
		autoCheckChildren: {
			getter: function() {
				if (this._bindingConfig.autoCheckChildren != null) {
					return this._bindingConfig.autoCheckChildren;
				}
				else {
					return this._autoCheckChildren;
				}
			}
		},

		checked: {
			getter: function() {
				var bg = this._bindingConfig;
				if (bg.checkedProperty && this._data) {
					this._checked = this._getEntityProperty(this._data, bg.checkedProperty);
				}
				if (this._checked != undefined) return this._checked;
				return bg.checked;
			},
			setter: function(checked) {
				var currentChecked = this._checked, bg = this._bindingConfig;
				if (currentChecked == undefined) currentChecked = bg.checked;
				if (currentChecked === checked) return;
				$invokeSuper.call(this, arguments);
				var entity = this._data, property = bg.checkedProperty;
				if (entity && property) {
					(entity instanceof dorado.Entity) ? entity.set(property, checked) : entity[property] = checked;
				}
			}
		},

		tip: {
			getter: function() {
				if (this._tip) return this._tip;
				return this._getEntityPropertyText(this._data, this._bindingConfig.tipProperty);
			}
		}
	},

	_prepareChildren: function(callback) {

		function processBindingConfig(bindingConfig, entity, startIndex, processDefaultExpand) {

			function addNode(entity) {
				var eventArg = {
					data: entity,
					processDefault: true
				};
				tree.fireEvent("beforeDataNodeCreate", tree, eventArg);
				if (!eventArg.processDefault) return;

				var node = null, oldNode = null;
				if (startIndex < nodes.size) {
					node = nodes.get(startIndex);
					if (node._data != entity) {
						oldNode = node;
						node = null;
					}
				}

				if (!node) {
					node = new dorado.widget.tree.DataBindingNode({
						bindingConfig: bindingConfig,
						data: entity,
						tags: bindingConfig.tags
					});
					if (oldNode) {
						nodes.replace(oldNode, node);
					} else {
						nodes.insert(node);
					}
				} else {
					node._parent._changeVisibleChildNodeCount(1);
				}

				eventArg.node = node;
				tree.fireEvent("onDataNodeCreate", tree, eventArg);

				var expanded = expandedNodes[entity.entityId];
				
				if (expanded === true || node._expanded) {
					node._expanded = false;
					node.expandAsync();
				} else if (processDefaultExpand) {
					if (!bindingConfig.recursive) {
						if (!bindingConfig.recursive && bindingConfig.expandLevel) {
							node.expandAsync();
						}
					}
					else if (bindingConfig.expandLevel) {
						var parentNode = node._parent, i = 0;
						while (parentNode && parentNode._bindingConfig == bindingConfig) {
							parentNode = parentNode._parent;
							i++;
						}
						if (i < bindingConfig.expandLevel) {
							node.expandAsync();
						}
					}
				}
			}

			var tree = this._tree, nodes = this._nodes, expandedNodes = {}, currentNode = tree.get("currentNode");
			if (currentNode && currentNode._parent == this) tree.set("currentNode", (this == tree._root) ? null : this);
			
			for (var it = nodes.iterator(); it.hasNext();) {
				var node = it.next();
				if (node._data) expandedNodes[node._data.entityId] = !!node._expanded;
			}

			this._nodesData = entity;
			if (entity instanceof dorado.EntityList) {
				for (var it = entity.iterator({ currentPage: true }); it.hasNext();) {
					var d = it.next();
					addNode(d);
					startIndex++;
				}
				return startIndex;
			} else if (entity instanceof dorado.Entity) {
				addNode(entity);
				startIndex++;
			}
			return startIndex;
		}

		function setPreloadConfigs(entity, property, preloadConfig) {
			if (entity.dataType) {
				var propertyDef = entity.dataType.getPropertyDef(property);
				if (propertyDef) {
					var sysParameter = propertyDef._sysParameter;
					if (!sysParameter) propertyDef._sysParameter = sysParameter = new dorado.util.Map();
					sysParameter.put("preloadConfig", preloadConfig);
				}
			}
		}
		
		function clearPreloadConfigs(entity, property) {
			if (entity.dataType) {
				var propertyDef = entity.dataType.getPropertyDef(property);
				if (propertyDef) {
					var sysParameter = propertyDef._sysParameter;
					if (sysParameter) sysParameter.remove("preloadConfig");
				}
			}
		}

		this._childrenPrepared = true;
		var bindingConfig = this._bindingConfig, tree = this._tree;
		var isRoot = (this == tree._root), data = this._data;
		if (isRoot && tree) {
			this._data = data = tree.getBindingData({
				firstResultOnly: true,
				acceptAggregation: true
			});
		}
		if (!data) {
			this.clearChildren();
			return;
		}

		var asyncTasks = [], self = this;
		if (callback && data instanceof dorado.Entity) {
			var processPreload = (this._parent == tree._root);	
			if (bindingConfig.recursive && !isRoot) {
				asyncTasks.push(function(callback) {
					if (processPreload) {
						var preloadConfigs = dorado.widget.DataTree.bindingConfigToPreloadConfig(bindingConfig, 0);
						if (preloadConfigs) setPreloadConfigs(data, bindingConfig.childrenProperty, preloadConfigs);
					}
					data.getAsync(bindingConfig.childrenProperty, callback);
					clearPreloadConfigs(data, bindingConfig.childrenProperty);
				});
			}
			if (bindingConfig.childBindingConfigs) {			
				for (var i = 0; i < bindingConfig.childBindingConfigs.length; i++) {
					var childBindingConfig = bindingConfig.childBindingConfigs[i];
					var childrenProperty = childBindingConfig.childrenProperty;
					asyncTasks.push(function(callback) {
						if (processPreload) {
							var preloadConfigs = dorado.widget.DataTree.bindingConfigToPreloadConfig(childBindingConfig, 0);
							if (preloadConfigs) setPreloadConfigs(data, childrenProperty, preloadConfigs);
						}
						data.getAsync(childrenProperty, callback);
						clearPreloadConfigs(data, childrenProperty);						
					});
				}
			}
		}

		$waitFor(asyncTasks, {
			callback: function(success, result) {
				var nodesTimestamp = 0, infos = [];
				if (data instanceof dorado.Entity) {
					if (bindingConfig.recursive) {
						var e = (isRoot) ? data : data.get(bindingConfig.childrenProperty, callback ? "auto" : "always");
						if (e) {
							nodesTimestamp += e.timestamp;
							infos.push({
								bindingConfig: bindingConfig,
								data: e
							});
						}
					}
					if (bindingConfig.childBindingConfigs) {
						for (var i = 0; i < bindingConfig.childBindingConfigs.length; i++) {
							var childBindingConfig = bindingConfig.childBindingConfigs[i];
							var e = data.get(childBindingConfig.childrenProperty, callback ? "auto" : "always");
							if (!e) continue;
							nodesTimestamp += e.timestamp;
							infos.push({
								bindingConfig: childBindingConfig,
								data: e
							});
						}
					}
				} else if (isRoot) {
					var childBindingConfigs = bindingConfig.childBindingConfigs;
					if (childBindingConfigs && childBindingConfigs.length == 1) {
						nodesTimestamp += data.timestamp;
						infos.push({
							bindingConfig: childBindingConfigs[0],
							data: data
						});
					}
				}

				if (self._nodesTimestamp != nodesTimestamp) {
					self._nodesTimestamp = nodesTimestamp;
					self._visibleChildNodeCount = 0;
					var startIndex = 0;

					if (tree) tree.disableAutoRefresh();
					try {
						for (var i = 0; i < infos.length; i++) {
							var info = infos[i];
							startIndex = processBindingConfig.call(self, info.bindingConfig, info.data, startIndex, !self._hasExpanded);
						}
						var nodes = self._nodes;
						for (var i = nodes.size - 1; i >= startIndex; i--) {
							nodes.removeAt(i);
						}
						//if (startIndex == 0) self._hasChild = false;
					}
					finally {
						if (tree) {
							tree.enableAutoRefresh();
                            tree._skipScrollCurrentIntoView = true;
							tree.refresh(true);
						}
					}
				}
				if (callback) $callback(callback, success, result);
			}
		});
	},

	resetChildren: function() {
		this._nodes.clear();
		delete this._nodesTimestamp;
		this._childrenPrepared = false;
	},

	doExpand: function() {
		if (!this._childrenPrepared) this._prepareChildren();
		$invokeSuper.call(this, arguments);
	},

	doExpandAsync: function(callback) {
		if (!this._childrenPrepared) {
			var self = this, superClass = $getSuperClass();
			this._prepareChildren({
				callback: function(success, result) {
					/*if (!self._expanded)*/superClass.prototype.doExpandAsync.call(self, callback);
				}
			});
		} else {
			$invokeSuper.call(this, arguments);
		}
	},

	doCollapse: function() {
		$invokeSuper.call(this, arguments);
		this.resetChildren();
	}
});

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @component Collection
 * @class 支持数据绑定的树状列表。
 * @extends dorado.widget.Tree
 * @extends dorado.widget.DataControl
 */
dorado.widget.DataTree = $extend([dorado.widget.Tree, dorado.widget.DataControl], /** @scope dorado.widget.DataTree.prototype */ {
	$className: "dorado.widget.DataTree",

	ATTRIBUTES: /** @scope dorado.widget.DataTree.prototype */ {

		/**
		 * 配置对象或配置对象的数组。
		 * <p>
		 * 配置对象的作用是定义数据树与数据之间的绑定关系，使数据树能够自动的根据这些设置生成树节点的结构。
		 * </p>
		 * <p>
		 * 每个配置对象中可包含下列子属性：
		 * <ul>
		 * <li>name	-	{String} 绑定配置对象的名称。此名称可任意定义，无实际含义。</li>
		 * <li>childrenProperty	-	{String} 对应的数据实体取自父数据实体的哪个属性。</li>
		 * <li>recursive	-	{boolean} 是否递归的处理此绑定配置对象。</li>
		 * <li>expandLevel	-	{int} 该类型节点在初始化时自动展开的层数。对于recursive=false的绑定配置而言，expandLevel如果大于1实际都将按照1来进行处理。</li>
		 * <li>labelProperty	-	{String} 用于从数据实体中读取节点标题的属性名。</li>
		 * <li>icon	-	{String} 节点图标的URL。</li>
		 * <li>iconProperty	-	{String} 用于从数据实体中读取节点图标的URL的属性名。</li>
		 * <li>iconClass	-	{String} 图标元素的CSS Class。</li>
		 * <li>expandedIcon	-	{String} 展开节点图标的URL。</li>
		 * <li>expandedIconProperty	-	{String} 用于从数据实体中读取展开节点图标URL的属性名。</li>
		 * <li>expandedIconClass	-	{String} 展开节点的图标元素的CSS Class。</li>
		 * <li>checkable	-	{boolean} 节点是否是支持勾选的。</li>
		 * <li>checkedProperty	-	{String} 用于从数据实体中读取节点是否支持勾选的属性名。</li>
		 * <li>autoCheckChildren	-	{boolean} 是否自动根据本节点的勾选状态来维护所有子节点的勾选状态。。默认为true。</li>
		 * <li>tipProperty	-	{String} 用于读取节点提示信息的属性名。</li>
		 * <li>hasChild	-	{boolean} 节点中是否支持子节点。</li>
		 * <li>hasChildProperty	-	{String} 用于从数据实体中读取节点是否支持子节点的属性名。</li>
		 * <li>tags	-	{String|String[]} 将要设置给树节点的标签或标签数组。</li>
		 * <li>childBindingConfigs	-	{Object|Object[]} 子配置对象或子配置对象的数组。</li>
		 * </ul>
		 * </p>
		 * @type Object|Object[]
		 * @attribute writeBeforeReady
		 */
		bindingConfigs: {
			writeBeforeReady: true,
			setter: function(bindingConfigs) {
				this._root.set("childBindingConfigs", bindingConfigs);
			},
			getter: function() {
				return this._root.get("childBindingConfigs");
			}
		},

		/**
		 * 自动注册到DataPath中的自定义片段的名称。
		 * <p>
		 * 该自定义DataPath片段将用于获取当前树节点对应的数据实体。
		 * 当用户定义了此属性之后，系统会自动向DataPath中注册一个同名的自定义片段。
		 * 同时，当此树的当前节点改变之后，也会自动的通知绑定的DataSet广播数据刷新的消息。
		 * </p>
		 * @type String
		 * @attribute writeBeforeReady
		 *
		 * @see dorado.DataPath
		 * @see dorado.DataPath.registerInterceptor
		 *
		 * @example
		 * // 例如：我们设定此属性的值为CURRENT_NODE。
		 * // 那么用户就可以通过对此树绑定的DataSet调用下面的方法用于获取当前树节点对应的数据实体。
		 * dataSet.queryData("!CURRENT_NODE");
		 */
		currentNodeDataPath: {
			writeBeforeReady: true
		},

		/**
		 * 当前数据实体。即当前树节点对应的数据实体。
		 * @type dorado.Entity
		 * @attribute
		 */
		currentEntity: {
			setter: function(currentEntity) {
				var node = this.findNode(currentEntity);
				this.set("currentNode", node);
			},
			getter: function() {
				if (this._currentNode) {
					var data = this._currentNode._data;
					return (data instanceof dorado.Entity) ? data : null
				}
				return null;
			}
		}
	},

	EVENTS: /** @scope dorado.widget.DataTree.prototype */ {

		/**
		 * 当数据树根据绑定的数据将要自动创建一个新的节点前触发的事件。
		 * @param {Object} self 事件的发起者，即组件本身。
		 * @param {Object} arg 事件参数。
		 * @param {dorado.Entity} arg.data 与新节点关联的数据实体。
		 * @param {boolean} #arg.processDefault=true 用于通知系统是否要继续完成创建新节点的后续动作。
		 * 如果返回false，那么对于当前的数据实体树中将不会有相应的树节点。
		 * @return {boolean} 是否要继续后续事件的触发操作，不提供返回值时系统将按照返回值为true进行处理。
		 * @event
		 */
		beforeDataNodeCreate: {},

		/**
		 * 当数据树根据绑定的数据自动创建一个新的节点之后触发的事件。
		 * @param {Object} self 事件的发起者，即组件本身。
		 * @param {Object} arg 事件参数。
		 * @param {dorado.Entity} arg.data 与新节点关联的数据实体。
		 * @param {dorado.widget.tree.DataBindingNode} arg.node 新创建的树节点。
		 * @return {boolean} 是否要继续后续事件的触发操作，不提供返回值时系统将按照返回值为true进行处理。
		 * @event
		 */
		onDataNodeCreate: {}
	},

	constructor: function() {
		this._entityMap = {};
		$invokeSuper.call(this, arguments);
	},
	
	getCurrentItem: function() {
		return this._currentNode;
	},

	onReady: function() {
		if (this._currentNodeDataPath) {
			var self = this;
			dorado.DataPath.registerInterceptor(this._currentNodeDataPath, function(data) {
				return self.get("currentNode.data");
			}, function(dataType) {
				var entity = self.get("currentNode.data");
				return entity ? entity.dataType : dataType;
			});

			this.bind("onCurrentChange", function() {
				self.disableBinding();
				self.get("dataSet").notifyObservers();
				self.enableBinding();
			});
		}

		$invokeSuper.call(this, arguments);
	},

	createRootNode: function() {
		return new dorado.widget.tree.DataBindingNode({
			label: "<ROOT>",
			bindingConfig: {}
		});
	},

	syncCurrentEntity: function() {
		var path = [];
		var entity = this.get("currentEntity");
		while (entity && entity.parent) {
			path.push({
				entityList: entity.parent,
				entity: entity
			});
			entity = entity.parent.parent;
		}
		jQuery.each(path.reverse(), function(i, section) {
			if (section.entityList.current != section.entity) {
				section.entityList.setCurrent(section.entity);
			}
		});
	},

	onNodeAttached: function(node) {
		$invokeSuper.call(this, arguments);
		if (node._data) this._entityMap[node._data.entityId] = node;
	},

	onNodeDetached: function(node) {
		$invokeSuper.call(this, arguments);
		if (node._data) delete this._entityMap[node._data.entityId];
	},

	refreshDom: function(dom) {
		var bindingConfigs = this.get("bindingConfigs");
		if (!bindingConfigs || !bindingConfigs.length) {
			throw new dorado.Exception("DataTree " + this._id + ".bindingConfigs is undefined.");
		}
		
		if (this._dataSet) {
			var data = this.getBindingData({
				firstResultOnly: true,
				acceptAggregation: true
			});
			
			if (!this._root._childrenPrepared || this._data != data ||
				(this._data && this._data.pageNo != (this._pageNo || 0))) {
				this._data = data;
				this._pageNo = (data ? data.pageNo : 0);
				this._root._prepareChildren(dorado._NULL_FUNCTION);
			}
		}

		$invokeSuper.call(this, [dom]);
	},

	filterDataSetMessage: function(messageCode, arg) {
		switch (messageCode) {
			case dorado.widget.DataSet.MESSAGE_REFRESH:
			case dorado.widget.DataSet.MESSAGE_DATA_CHANGED:
			case dorado.widget.DataSet.MESSAGE_REFRESH_ENTITY:
			case dorado.widget.DataSet.MESSAGE_DELETED:
			case dorado.widget.DataSet.MESSAGE_INSERTED:
			case dorado.widget.DataSet.MESSAGE_ENTITY_STATE_CHANGED:
				return true;

			case dorado.widget.DataSet.MESSAGE_CURRENT_CHANGED:
				if (this._data) {
					if (dorado.DataUtil.isOwnerOf(this._data, arg.entityList)) return true;
					if (this._data == arg.entityList && this._pageNo != arg.entityList.pageNo) return true;
				}
				return false;
				
			case dorado.widget.DataSet.MESSAGE_LOADING_START:
			case dorado.widget.DataSet.MESSAGE_LOADING_END:
				if (arg.entityList) {
					return (this._data == arg.entityList || dorado.DataUtil.isOwnerOf(this._data, arg.entityList));
				} else {
					return true;
				}
				

			default:
				return false;
		}
	},

	processDataSetMessage: function(messageCode, arg, data) {
		switch (messageCode) {
			case dorado.widget.DataSet.MESSAGE_REFRESH: {
				this.refresh(true);
				break;
			}
			
			case dorado.widget.DataSet.MESSAGE_CURRENT_CHANGED:{
				this.refresh(true);
				break;
			}
			
			case dorado.widget.DataSet.MESSAGE_DATA_CHANGED:
			case dorado.widget.DataSet.MESSAGE_REFRESH_ENTITY:{
				if (this.getBindingData() != this._data) {
					this.refresh(true);
				}
				else {
					this.refreshNodeByEntity(arg.entity);
				}
				break;
			}
			
			case dorado.widget.DataSet.MESSAGE_ENTITY_STATE_CHANGED: {
				this.refreshNodeByEntity(arg.entity);
				break;
			}

			case dorado.widget.DataSet.MESSAGE_DELETED:{
				var node = this.findNode(arg.entity);
				if (node) node.remove();
				break;
			}

			case dorado.widget.DataSet.MESSAGE_INSERTED:{
				var parentEntity = arg.entity.parent, parentEntityList;
				if (parentEntity) {
					if (parentEntity instanceof dorado.EntityList) {
						parentEntityList = parentEntity;
						parentEntity = parentEntity.parent;
					}
				}

				var parentNode;
				if (parentEntity instanceof dorado.Entity) parentNode = this.findNode(parentEntity);
				if (!parentNode && parentEntityList == this._root._data) {
					parentNode = this._root;
				}
				
				if (parentNode && parentNode._expanded) {
					this.disableAutoRefresh();
					parentNode._prepareChildren();
					this.enableAutoRefresh();
					this.refresh(true);
				}
				break;
			}

			case dorado.widget.DataSet.MESSAGE_LOADING_START:{
				if (!this._expandingCounter) {
					this.showLoadingTip();
				}
				break;
			}

			case dorado.widget.DataSet.MESSAGE_LOADING_END:{
				this.hideLoadingTip();
				break;
			}
		}
	},

	refreshNodeByEntity: function(entity) {
		var node = this.findNode(entity);
		if (!node) return;
		this.refreshNode(node);
	},

	processItemDrop: function(draggingInfo, evt) {
		var object = draggingInfo.get("object");
		var targetObject = draggingInfo.get("targetObject");
		var insertMode = draggingInfo.get("insertMode");
		var refObject = draggingInfo.get("refObject");
		if (object instanceof dorado.widget.tree.DataBindingNode &&
			targetObject instanceof dorado.widget.tree.DataBindingNode) {
			var sourceNode = object, targetNode = targetObject;
			var sourceEntity = sourceNode.get("data"), targetEntity = targetNode.get("data");

			var refNode, refEntity;
			if (refObject instanceof dorado.widget.tree.DataBindingNode) {
				refNode = refObject;
				refEntity = refNode.get("data");
			}

			var sourceBindingConfig = sourceNode.get("bindingConfig");
			var bindingConfig = targetNode.get("bindingConfig");
			var childBindingConfigs = targetNode.get("childBindingConfigs") || [];
			var childBindingConfig;
			if (sourceBindingConfig == bindingConfig || bindingConfig.recursive &&
				childBindingConfigs.indexOf(sourceBindingConfig) >= 0) {
				childBindingConfig = sourceBindingConfig;
			}
			else if (childBindingConfigs.length == 1 && !bindingConfig.recursive) {
				childBindingConfig = childBindingConfigs[0];
			}
			else if (childBindingConfigs.length == 0 && bindingConfig.recursive) {
				childBindingConfig = bindingConfig;
			}

			if (childBindingConfig) {
				var entityList;
				if (targetEntity instanceof dorado.EntityList) {
					entityList = targetEntity;
				} else {
					entityList = targetEntity.get(childBindingConfig.childrenProperty, "always");
				}
				if (entityList instanceof dorado.EntityList) {
					this._skipProcessCurrentNode = (object._tree == this);
					var originState = sourceEntity.state;
					sourceEntity.remove(true);
					delete this._skipProcessCurrentNode;
					
					if (originState != dorado.Entity.STATE_NEW) sourceEntity.setState(dorado.Entity.STATE_MOVED);
					entityList.insert(sourceEntity, insertMode, refEntity);
					
					if (targetObject.get("expanded")) {
						var newNode = this.findNode(sourceEntity);
						if (newNode) {
							this.set("currentNode", newNode);
							this.highlightItem(newNode);
						}
					}
					else {
						this.set("currentNode", targetObject);
					}
				}
			}
		}
		return true;
	},
	
	findNode: function(entity) {
		if (entity) return this._entityMap[entity.entityId];
		return null;
	}
});

dorado.widget.DataTree.bindingConfigToPreloadConfig = function(bindingConfig, level) {
	
	function toPreloadConfig(bindingConfig, level) {
		var preloadConfig = {
			property: bindingConfig.childrenProperty,
			recursiveLevel: bindingConfig.recursive ? (bindingConfig.expandLevel - level - 1) : 0
		};
		
		var childConfigs = getChildPreloadConfigs.call(this, bindingConfig, level);
		if (childConfigs) preloadConfig.childPreloadConfigs = childConfigs;
		return preloadConfig;
	}
	
	function getChildPreloadConfigs(bindingConfig, level) {
		if (!(level > 0)) return null;
		
		var preloadConfigs = [];
		if (bindingConfig.childBindingConfigs) {
			for (var i = 0; i < bindingConfig.childBindingConfigs.length; i++) {
				var config = toPreloadConfig.call(this, bindingConfig.childBindingConfigs[i], level - 1);
				preloadConfigs.push(config);
			}
		}
		return (preloadConfigs.length) ? preloadConfigs : null;
	}
	
	level = level || 0;
	var preloadConfigs = [];
	if (bindingConfig.recursive || bindingConfig.expandLevel > 0) {
		if (bindingConfig.recursive) {
			if (bindingConfig.expandLevel > level) {
				var config = toPreloadConfig.call(this, bindingConfig, level);
				preloadConfigs.push(config);
			}
		}
		var childConfigs = getChildPreloadConfigs.call(this, bindingConfig, level);
		if (childConfigs) preloadConfigs = preloadConfigs.concat(childConfigs);
	}
	return preloadConfigs;
}

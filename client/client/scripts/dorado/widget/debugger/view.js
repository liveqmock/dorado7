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

dorado.debug.initProcedures.push(function() {
	var ENTITY_STATE_MAP = {
		0: "none",
		1: "new",
		2: "modified",
		3: "deleted"
	};

	var mixIf = function(target, source) {
		if (target && source) {
			for (var prop in source) {
				if (target[prop] === undefined) {
					target[prop] = source[prop];
				}
			}
		}
		return target;
	};

	function isCollection(object) {
		return object instanceof Array || object instanceof dorado.util.KeyedArray || object instanceof dorado.util.KeyedList ||
			object instanceof dorado.EntityList || object instanceof dorado.Entity;
	}

	var getFnBody = function(text) {
		var entire = typeof text == "function" ? text.toString() : text; // this part may fail!
		return jQuery.trim(entire.substring(entire.indexOf("{") + 1, entire.lastIndexOf("}")));
	};

	/**
	 * @author Frank Zhang (mailto:frank.zhang@bstek.com)
	 * @class dorado.debug.AttrGrid
	 * @extends dorado.widget.TreeGrid
	 */
	dorado.debug.AttrGrid = $extend(dorado.widget.TreeGrid, /** @scope dorado.debug.AttrGrid.prototype */{
		$className: "dorado.debug.AttrGrid",
		ATTRIBUTES: /** @scope dorado.debug.AttrGrid.prototype */{
			/**
			 * 该表格列举的属性的来源。
			 * @attribute
			 * @type Object
			 */
			sourceObject: {
				setter: function(value) {
					var attrGrid = this;
					attrGrid.disableAutoRefresh();
					attrGrid._root.clearChildren();
					attrGrid._root.addNodes(this.getTreeGridNodes(value));
					attrGrid.enableAutoRefresh();
					attrGrid.refresh();

					this._sourceObject = value;
				}
			}
		},
		constructor: function(config) {
			config = config || {};

			mixIf(config, {
				expandingMode: "sync",
				stretchColumnsMode: "lastColumn",
				columns: [{
					name: "name",
					property: "name",
					width: 200
				}, {
					name: "value",
					property: "value"
				}],
				treeColumn: "name",
				beforeExpand: function(self, arg) {
					var node = arg.node, id = node.get("data.label"), value = node.get("data.value");
					if (node.get("userData") || !id) {
					} else {
						node.set("userData", true);
						node.addNodes(self.getTreeGridNodes(value));
					}
				},
				onCellValueEdit: function(self, arg) {
					var entity = arg.entity;
					if (entity) {
						var name = entity.get("label"), value = entity.get("value"), sourceObject = self._sourceObject;
						if (sourceObject && dorado.Object.isInstanceOf(sourceObject, dorado.AttributeSupport)) {
							if (isFinite(value)) {
								value = parseFloat(value);
							} else if (["true", "false"].indexOf(value) >= 0) {
								value = (value === "true") ? true : false;
							}
							sourceObject.set(name, value);
						}
					}
				}
			});

			$invokeSuper.call(this, [config]);
		},
		getTreeGridNodes: function(object) {
			var prop, value, hasChild, nodes = [];
			if (object instanceof dorado.Entity) {
				nodes.push({
					label: "State",
					hasChild: false,
					data: {
						label: ENTITY_STATE_MAP[object.state],
						value: ENTITY_STATE_MAP[object.state]
					}
				});
				var data = object.getData();
				if (data) {
					for (prop in data) {
						if (prop != "$dataType") {
							value = data[prop];
							nodes.push({
								label: prop,
								hasChild: false,
								data: {
									label: prop,
									value: value
								}
							});
						}
					}
				}
			} else if (object && dorado.Object.isInstanceOf(object, dorado.AttributeSupport)) {
				for (prop in object.ATTRIBUTES) {
					if (prop in
					{
						"view": true,
						"parent": true
					}) {
						continue;
					}
					value = object["_" + prop];
					if (isCollection(value)) continue;
					hasChild = value && typeof value == "object";
					nodes.push({
						label: prop,
						hasChild: hasChild,
						data: {
							label: prop,
							value: value
						}
					});
				}
			} else {
				for (prop in object) {
					if (prop in
					{
						"view": true,
						"parent": true
					}) {
						continue;
					}
					value = object[prop];
					if (typeof value == "function" || isCollection(value)) continue;
					hasChild = value && typeof value == "object";
					nodes.push({
						label: prop,
						hasChild: hasChild,
						data: {
							label: prop,
							value: value
						}
					});
				}
			}

			nodes.sort(function(a, b) {
				return a.label > b.label ? 1 : -1;
			});

			return nodes;
		}
	});

	/**
	 * @author Frank Zhang (mailto:frank.zhang@bstek.com)
	 * @class ControlsPanel
	 * @extends dorado.widget.Panel
	 */
	dorado.debug.ControlsPanel = $extend(dorado.widget.Panel, /** @scope dorado.debug.ControlsPanel.prototype */{
		$className: "dorado.debug.ControlsPanel",
		EVENTS: /** @scope dorado.debug.ControlsPanel.prototype */{
			/**
			 * 当组件树上的当前节点发生改变的时候触发的事件。。
			 * @param {Object} self 事件的发起者，即组件本身。
			 * @param {Object} arg 事件参数。
			 * @return {boolean} 是否要继续后续事件的触发操作，不提供返回值时系统将按照返回值为true进行处理。
			 * @event
			 */
			onTreeCurrentChange: {}
		},
		constructor: function(config) {
			config = config || {};

			var panel = this;

			var controlsTree = new dorado.widget.Tree({
				expandingMode: "sync",
				$type: "Tree",
				style: "borderStyle:none",
				beforeExpand: function(self, arg) {
					var node = arg.node, value = node.get("data.value");
					if (node.get("userData") || !value) {
					} else {
						node.set("userData", true);
						node.addNodes(panel.getTreeNodes(value, false));
					}
				},
				onCurrentChange: function(self, arg) {
					panel.fireEvent("onTreeCurrentChange", self, arg);
				}
			});

			panel._controlsTree = controlsTree;

			mixIf(config, {
				caption: "View",
				tools: [{
					$type: "SimpleIconButton",
					iconClass: "d-debugger-view-export-icon",
					listener: {
						onClick: function() {
							var current = controlsTree.get("currentNode");
							if (!current) {
								dorado.MessageBox.alert($resource("dorado.baseWidget.DebuggerVariableNodeRequired"));
							} else {
								dorado.MessageBox.prompt($resource("dorado.baseWidget.DebuggerVariableExportInput"), function(text) {
									if (text) {
										window[text] = current.get("data.value");
									} else {
										dorado.MessageBox.alert($resource("dorado.baseWidget.DebuggerVariableNameRequired"));
									}
								});
							}
						}
					}
				}, {
					$type: "SimpleIconButton",
					iconClass: "d-debugger-view-refresh-icon",
					listener: {
						onClick: function() {
							panel.reload();
						}
					}
				}],
				children: [controlsTree]
			});

			$invokeSuper.call(this, [config]);
		},
		/**
		 * 重新加载所有的组件。
		 */
		reload: function() {
			var panel = this, controlsTree = panel._controlsTree,
				topView = $topView, nodes = panel.getTreeNodes(topView._children, true);

			controlsTree.disableAutoRefresh();
			controlsTree._root.clearChildren();
			controlsTree._root.addNodes(nodes);
			controlsTree.enableAutoRefresh();
			controlsTree.refresh();
		},
		getTreeNodes: function(object, onlyview) {
			function isCollectionHasElement(object) {
				var result = false, firstObject;
				if (object instanceof Array) {
					firstObject = object[0];
				} else if (object instanceof dorado.util.KeyedArray) {
					firstObject = object.get(0);
				} else if (object instanceof dorado.util.KeyedList) {
					firstObject = object.getFirst();
				} else if (object instanceof dorado.EntityList) {
					firstObject = object.first();
				} else if (object instanceof dorado.Entity) {
					var data = object.getData(), prop, value, hasChild = false;
					for (prop in data) {
						try {
							value = object.get(prop);
						}
						catch (e) {
							dorado.Exception.removeException(e);
							value = data[prop];
						}
						if (value instanceof dorado.EntityList || value instanceof dorado.Entity) {
							hasChild = true;
						}
					}
					return hasChild;
				}
				if (firstObject && (firstObject instanceof dorado.Entity ||
					dorado.Object.isInstanceOf(firstObject, dorado.AttributeSupport))) {
					return true;
				}
				return result;
			}

			function isHasChild(object) {
				var prop, value;
				if (object && dorado.Object.isInstanceOf(object, dorado.AttributeSupport)) {
					for (prop in object.ATTRIBUTES) {
						value = object["_" + prop];
						if (isCollectionHasElement(value)) {
							return true;
						}
					}
				} else {
					for (prop in object) {
						value = object[prop];
						if (isCollectionHasElement(value)) {
							return true;
						}
					}
				}

				return false;
			}

			function getObjectChildren(object, onlyview) {
				var prop, value, nodes = [], temp = [];
				if (object && dorado.Object.isInstanceOf(object, dorado.AttributeSupport)) {
					for (prop in object.ATTRIBUTES) {
						value = object["_" + prop];
						if (isCollectionHasElement(value)) {
							temp.push({
								label: prop,
								hasChild: true,
								data: {
									value: value
								}
							});
						}
					}
					if (temp.length != 1) {//reserve the nodes if more than one child.
						nodes = temp;
					} else {//get first node if only one child
						return getCollectionChildren(temp[0].data.value, onlyview);
					}
				} else {
					for (prop in object) {
						value = object[prop];
						if (isCollectionHasElement(value)) {
							nodes.push({
								label: prop,
								hasChild: true,
								data: {
									value: value
								}
							});
						}
					}
				}

				return nodes;
			}

			function getCollectionChildren(object, onlyview) {
				var nodes = [];

				function doGetNodes(obj) {
					if (onlyview) {
						if (obj._parent && obj._parent != $topView) {
							//console.log("filter:" + obj.constructor.className);
							return;
						}
					}
					var className = obj.constructor.className || "", $type = className.replace("dorado.widget.", "");
					var label = $type;
					if (obj._id && obj._id.indexOf("_uid") == -1) {
						label = $type + "(" + obj._id + ")";
					}
					nodes.push({
						label: label,
						hasChild: isHasChild(obj),
						data: {
							value: obj
						}
					});
				}

				var data, prop, value;
				if (object instanceof dorado.Entity) {
					data = object.getData();
					for (prop in data) {
						try {
							value = object.get(prop);
						}
						catch (e) {
							dorado.Exception.removeException(e);
							value = data[prop];
						}
						if (value instanceof dorado.EntityList || value instanceof dorado.Entity) {
							nodes.push({
								label: prop,
								hasChild: true,
								data: {
									value: value
								}
							});
						}
					}
				} else if (object instanceof dorado.EntityList) {
					object.each(function(entity) {
						nodes.push({
							label: "Entity",
							hasChild: isCollectionHasElement(entity),
							data: {
								value: entity
							}
						});
					});
				} else if (object && object.each) {
					object.each(doGetNodes);
				} else {
					for (var i = 0; i < object.length; i++) {
						doGetNodes(object[i]);
					}
				}

				return nodes;
			}

			var result;
			if (isCollection(object)) {
				result = getCollectionChildren(object, onlyview);
			} else {
				result = getObjectChildren(object, onlyview);
			}

			return result;
		}
	});

	/**
	 * @author Frank Zhang (mailto:frank.zhang@bstek.com)
	 * @class EventsPanel
	 * @extends dorado.widget.Panel
	 */
	dorado.debug.EventsPanel = $extend(dorado.widget.Panel, /** @scope dorado.debug.EventsPanel.prototype */{
		$className: "dorado.debug.EventsPanel",
		ATTRIBUTES: /** @scope dorado.debug.EventsPanel.prototype */{
			/**
			 * 事件列表的来源对象。
			 * @attribute
			 * @type Object
			 */
			sourceObject: {
				setter: function(value) {
					var eventsTree = this._eventsTree;
					eventsTree.disableAutoRefresh();
					eventsTree._root.clearChildren();
					eventsTree._root.addNodes(this.getEventNodes(value));
					eventsTree.enableAutoRefresh();
					eventsTree.refresh();

					this._sourceObject = value;
				}
			},
			/**
			 * 事件预览面板。
			 * @attribute
			 * @type dorado.widget.HtmlContainer
			 */
			eventPreviewPanel: {}
		},
		constructor: function(config) {
			config = config || {};
			var panel = this;
			var eventsTree = new dorado.widget.Tree({
				expandingMode: "sync",
				beforeExpand: function(self, arg) {
					var node = arg.node, id = node.get("data.label"), value = node.get("data.value");
					if (node.get("userData") || !id) {
					} else {
						node.set("userData", true);
						node.addNodes(panel.getEventNodes(value));
					}
				},
				onCurrentChange: function(self, arg) {
					var current = arg.newCurrent, value, content = "", preview = panel._eventPreviewPanel;

					if (current) {
						value = current.get("data.value");
						if (value && typeof value.listener == "function") {
							content = dorado.Debugger.format2HTML(getFnBody(value.listener));
						}
					}
					if (preview._dom) preview._dom.innerHTML = content;
				}
			});
			panel._eventsTree = eventsTree;

			mixIf(config, {
				$type: "Panel",
				caption: "Event Panel",
				border: "none",
				tools: [{
					$type: "SimpleIconButton",
					iconClass: "d-debugger-view-add-icon",
					listener: {
						onClick: function() {
							var current = eventsTree.get("currentNode");
							if ( current && current.get("level") == 1) {
								var name = current.get("label"), object = current.get("data.object");
								dorado.MessageBox.promptMultiLines($resource("dorado.baseWidget.DebuggerInputListenerCode"), function(text) {
									object.bind(name, new Function("self", "arg", text));

									current.clearChildren();
									current.addNodes(panel.getEventNodes(current.get("data.value")));
								});
							}
						}
					}
				}, {
					$type: "SimpleIconButton",
					iconClass: "d-debugger-view-delete-icon",
					listener: {
						onClick: function() {
							var current = eventsTree.get("currentNode");
							if ( current && current.get("level") == 2) {
								var fn = current.get("data.value"), parent = current.get("parent"),
									name = parent.get("label"), object = parent.get("data.object");

								object.unbind(name, fn.listener);
								current.remove();
							}
						}
					}
				}, {
					$type: "SimpleIconButton",
					iconClass: "d-debugger-view-edit-icon",
					listener: {
						onClick: function() {
							var current = eventsTree.get("currentNode");
							if ( current && current.get("level") == 2) {
								var fn = current.get("data.value"), parent = current.get("parent"),
									object = parent.get("data.object");

								dorado.MessageBox.promptMultiLines($resource("dorado.baseWidget.DebuggerInputListenerCode"), {
									callback: function(text) {
										fn.listener = new Function("self", "arg", text);
										var preview = panel._eventPreviewPanel;
										preview._dom.innerHTML = dorado.Debugger.format2HTML(getFnBody(fn.listener));
									},
									defaultText: getFnBody(fn.listener)
								});
							}
						}
					}
				}],
				children: [eventsTree]
			});

			$invokeSuper.call(this, [config]);
		},
		getEventNodes: function(object) {
			var nodes = [], value, hasChild;
			if (object && object.EVENTS) {
				var events = object._events || {};
				for (var prop in object.EVENTS) {
					value = events[prop];
					hasChild = value && value.length > 0;
					nodes.push({
						label: prop,
						hasChild: hasChild,
						data: {
							label: prop,
							value: value,
							object: object
						}
					});
				}
			} else if (object && object instanceof Array) {
				for (var i = 0; i < object.length; i++) {
					value = object[i];
					nodes.push({
						label: i,
						hasChild: false,
						data: {
							label: i,
							value: value
						}
					});
				}
			}
			return nodes;
		}
	});

	/**
	 * @author Frank Zhang (mailto:frank.zhang@bstek.com)
	 * @class ViewPanel
	 * @extends dorado.widget.SplitPanel
	 */
	dorado.debug.ViewPanel = $extend(dorado.widget.SplitPanel, {
		$className: "dorado.debug.ViewPanel",
		constructor: function(config) {
			config = config || {};

			var panel = this;

			var eventsPanel = new dorado.debug.EventsPanel({
				layoutConstraint: "right",
				width: 200
			});

			var eventPreviewPanel = new dorado.widget.HtmlContainer({});
			eventsPanel._eventPreviewPanel = eventPreviewPanel;

			var attrGrid = new dorado.debug.AttrGrid();

			var controlTreePanel = new dorado.debug.ControlsPanel({
				layoutConstraint: {
					type: "left",
					height: "100%"
				},
				listener: {
					onTreeCurrentChange: function(self, arg) {
						var current = arg.newCurrent;
						if (current) {
							attrGrid.set("sourceObject", current.get("data.value"));
							eventsPanel.set("sourceObject", current.get("data.value"));
						}
					}
				}
			});

			panel._controlTreePanel = controlTreePanel;

			mixIf(config, {
				position: 200,
				sideControl: controlTreePanel,
				mainControl: {
					$type: "TabControl",
					tabs: [{
						$type: "Control",
						caption: "Attributes",
						control: attrGrid
					}, {
						$type: "Control",
						caption: "Events",
						control: {
							$type: "Container",
							layout: {
								$type: "Dock",
								regionPadding: 1
							},
							children: [eventsPanel, eventPreviewPanel]
						}
					}]
				}
			});

			$invokeSuper.call(this, [config]);
		}
	});

	var viewChildrenLoaded = false, viewPanel = new dorado.debug.ViewPanel();

	dorado.Debugger.registerModule({
		$type: "Control",
		name: "view",
		caption: "View",
		control: viewPanel,
		onActive: function() {
			if (!viewChildrenLoaded) {
				setTimeout(function() {
					viewPanel._controlTreePanel.reload();
				}, 0);
				viewChildrenLoaded = true;
			}
		}
	});
});

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

	DropDownFilterTrigger = $extend(dorado.widget.Trigger, {
		$className: "dorado.widget.DropDownFilterTrigger",
		ATTRIBUTES: {
			iconClass: {
				defaultValue: "d-trigger-icon-filter"
			}
		},
		execute: function(editor) {
			var dropDown = this._dropDown;
			if (dropDown) dropDown.onFilterItems(editor.doGetText());
		}
	});
	
	DropDownResetFilterTrigger = $extend(dorado.widget.Trigger, {
		$className: "dorado.widget.DropDownResetFilterTrigger",
		ATTRIBUTES: {
			iconClass: {
				defaultValue: "d-trigger-icon-reset"
			}
		},
		execute: function(editor) {
			var dropDown = this._dropDown;
			if (dropDown) dropDown.onFilterItems();
		}
	});
	
	var globalFilterTrigger;
	function getDropDownFilterTrigger() {
		if (!globalFilterTrigger) {
			globalFilterTrigger = new DropDownFilterTrigger();
		}
		return globalFilterTrigger;
	}
	
	var globalResetFilterTrigger;
	function getDropDownResetFilterTrigger() {
		if (!globalResetFilterTrigger) {
			globalResetFilterTrigger = new DropDownResetFilterTrigger();
		}
		return globalResetFilterTrigger;
	}
	
	/**
	 * @author Benny Bao (mailto:benny.bao@bstek.com)
	 * @class 数据列表型下拉框的抽象类。
	 * @extends dorado.widget.DropDown
	 * @abstract
	 */
	dorado.widget.RowListDropDown = $extend(dorado.widget.DropDown,/** @scope dorado.widget.RowListDropDown.prototype */ {
		$className: "dorado.widget.RowListDropDown",
		
		ATTRIBUTES: /** @scope dorado.widget.RowListDropDown.prototype */ {
		
			/**
			 * 数据实体(JSON对象或{@link dorado.Entity}对象)中的某个属性名，表示下拉框实际的下拉数值来自于哪个属性。
			 * @type String
			 * @attribute
			 */
			property: {},
			
			/**
			 * 数据实体(JSON对象或{@link dorado.Entity}对象)中的某个属性名，表示下拉框用于显示的数值来自于哪个属性。
			 * 如果不定义此属性则系统将按照property中定义的属性来处理。
			 * @type String
			 * @attribute
			 */
			displayProperty: {},
			
			/**
			 * 以JSON型的数据表示的列对象的定义。
			 * @type Object[]|dorado.widget.grid.Column[]
			 * @attribute writeBeforeReady
			 * @see dorado.widget.AbstractGrid#attribute:columns
			 */
			columns: {
				writeBeforeReady: true
			},
			
			/**
			 * 是否启用动态数据过滤的功能。
			 * @type boolean
			 * @attribute
			 */
			dynaFilter: {
			},
			
			editable: {
				getter: function() {
					return this._editable || this._dynaFilter;
				}
			},
			
			/**
			 * 是否要在下拉框打开时自动根据编辑框中的内容执行一次数据过滤。
			 * @type boolean
			 * @attribute
			 */
			filterOnOpen: {},
			
			/**
			 * 是否随着用户在编辑框中的输入动作自动的对下拉列表中的数据进行过滤。
			 * 如果不启用此功能，则在下拉框打开之后会在编辑框中自动显示出一个过滤按钮，用户可以手工的点击此按钮对数据进行过滤。
			 * @type boolean
			 * @attribute
			 * @default true
			 */
			filterOnTyping: {
				defaultValue: true
			},
			
			/**
			 * 执行数据筛选的最短时间间隔。
			 * @type int
			 * @attribute
			 * @default 240
			 */
			minFilterInterval: {
				defaultValue: 240
			},
			
			/**
			 * 是否要自动添加一个空的下拉选项。
			 * @type boolean
			 * @attribute writeBeforeReady
			 */
			useEmptyItem: {
				writeBeforeReady: true
			}
		},
		
		EVENTS: /** @scope dorado.widget.RowListDropDown.prototype */ {
		
			/**
			 * 当下拉框尝试对下拉数据项进行过滤时触发的事件。
			 * @param {Object} self 事件的发起者，即控件本身。
			 * @param {Object} arg 事件参数。
			 * @param {String} #arg.filterOperator=like* 过滤比较符。
			 * @param {String} #arg.filterValue 过滤条件。
			 * @param {boolean} #arg.processDefault=true 是否继续使用系统默认的过滤处理逻辑。
			 * @return {boolean} 是否要继续后续事件的触发操作，不提供返回值时系统将按照返回值为true进行处理。
			 * @event
			 */
			onFilterItems: {},
			
			/**
			 * 当下拉框尝试对下拉中的某一个数据项进行过滤时触发的事件。
			 * @param {Object} self 事件的发起者，即控件本身。
			 * @param {Object} arg 事件参数。
			 * @param {Object|dorado.Entity} arg.value 将被过滤的数据项。
			 * @param {String} arg.filterValue 过滤条件。
			 * @param {boolean} #arg.accept 该数据项是否通过过滤，即该数据项是否可被接受。
			 * @return {boolean} 是否要继续后续事件的触发操作，不提供返回值时系统将按照返回值为true进行处理。
			 * @event
			 */
			onFilterItem: {}
		},
		
		constructor: function() {
			$import("list", dorado._NULL_FUNCTION);
			$invokeSuper.call(this, arguments);
		},
		
		getSelectedValue: function() {
			var rowList = this.get("box.control");
			if (!this._rowSelected) return;
			
			var value = rowList.getCurrentItem();
			if (value && this._property) {
				if (value instanceof dorado.Entity) {
					value = value.get(this._property);
				} else {
					value = value[this._property];
				}
				if (value === undefined) value = null;
			}
			return value;
		},
		
		getEntityForAssignment: function() {
			var rowList = this.get("box.control");
			return rowList.getCurrentItem();
		},
		
		createDropDownBox: function() {
			var dropDown = this, box = $invokeSuper.call(this, arguments), rowList;
			var config = {
				style: "border: none",
				onDataRowClick: function(self) {
					self.set("highlightCurrentRow", dropDown._rowSelected = true);
					dropDown.close(dropDown.getSelectedValue());
				},
				onFilterItem: function(self, arg) {
                    if (arg && arg.criterions && arg.criterions.length > 0){
                        arg.filterValue = arg.criterions[0].value;
                    }
					dropDown.fireEvent("onFilterItem", dropDown, arg);
				}
			};
			if (this._columns) {
				if (!dorado.widget.Grid) {
					throw new dorado.ResourceException("dorado.core.packageMissingError", "grid");
				}
				
				config.stretchColumnsMode = "stretchableColumns";
				config.columns = this._columns;
				config.readOnly = true;
				rowList = new dorado.widget.Grid(config);
			} else {
				rowList = new dorado.widget.ListBox(config);
			}
			box.set({
				control: rowList
			});
			return box;
		},
		
		initDropDownData: function(box, editor) {
			var rowList = box.get("control");
			var items = this.getDropDownItems() || [];
			if (rowList instanceof dorado.widget.AbstractListBox) {
				rowList.set("property", this._displayProperty || this._property);
			}
			rowList.set("items", items);
			
			var text = editor.doGetText();
			if (text && text.length > 0 && this._filterOnOpen) {
				this.onFilterItems(text);
			}
			
			var value = editor.get("value"), currentIndex = -1;
			if (items && value) {
				if (items instanceof Array) {
					if (!this._property) {
						currentIndex = items.indexOf(value);
					} else {
						for (var i = 0; i < items.length; i++) {
							var item = items[i];
							if (item === null || item === undefined) continue;
							if (item instanceof dorado.Entity) {
								if (item.get(this._property) == value) {
									currentIndex = i;
									break;
								}
							} else {
								if (item[this._property] == value) {
									currentIndex = i;
									break;
								}
							}
						}
					}
				}
			}
			rowList.set("currentIndex", currentIndex);
		},
		
		initDropDownBox: function(box, editor) {
			$invokeSuper.call(this, arguments);
			
			var rowList = box.get("control");
			if (!this._boxVisible && this.initDropDownData) {
				rowList._ignoreRefresh++;
				this.initDropDownData(box, editor);
				rowList._ignoreRefresh--;
			}
			rowList.set("highlightCurrentRow", this._rowSelected = !!rowList.getCurrentItem());
			var itemCount = rowList._itemModel.getItemCount();
			var cellCount = itemCount;
			if (dorado.widget.AbstractGrid && rowList instanceof dorado.widget.AbstractGrid) {
				cellCount = rowList.get("dataColumns").length * itemCount;
			}
			
			if (!this._height) {
				var useMaxHeight = true, refreshed = false;
				if (this._realMaxHeight && (!itemCount || (this._realMaxHeight / (rowList._rowHeight + 1) > (itemCount + 1)))) {
					rowList.set({
						height: "auto",
						scrollMode: "simple"
					});
					
					rowList._forceRefresh = true;
					rowList.refresh();
					rowList._forceRefresh = false;
					
					refreshed = true;
					var height = $fly(rowList._dom).outerHeight();
					if (height <= this._realMaxHeight) useMaxHeight = false;
				}
				
				if (useMaxHeight && this._realMaxHeight) {
					rowList.set({
						height: this._realMaxHeight - (this._edgeHeight || 0),
						scrollMode: ((cellCount > 300) ? "viewport" : "lazyRender")
					});
					
					rowList._forceRefresh = true;
					rowList.refresh();
					rowList._forceRefresh = false;
					
					refreshed = true;
				}
				
				if (!refreshed) rowList.refresh();
			} else {
				rowList.set({
					height: this._height - (this._edgeHeight || 0),
					scrollMode: ((cellCount > 300) ? "viewport" : "lazyRender")
				});
				rowList.refresh();
			}
		},
		
		onDropDownBoxShow: function() {
			var rowList = this.get("box.control");
			
			var editor = this._editor;
			if (this._dynaFilter && editor instanceof dorado.widget.AbstractTextBox) {
				var dropDown = this;
				editor.bind("onTextEdit._filter", function() {
					if (dropDown._filterOnTyping && dropDown.get("opened")) {
						dorado.Toolkits.setDelayedAction(dropDown, "$filterTimeId", function() {
							if (!dropDown._rowSelected) dropDown.onFilterItems(editor.doGetText());
						}, dropDown._minFilterInterval);
					}
				});
			}
		},
		
		open: function(editor) {
			$invokeSuper.call(this, arguments);
			
			if (this._dynaFilter && !this._filterOnTyping) {
				var triggers = editor.get("trigger");
				if (!(triggers instanceof Array)) triggers = [triggers];
				
				var resetFilterTrigger = getDropDownResetFilterTrigger();
				var filterTrigger = getDropDownFilterTrigger();
				triggers.insert(resetFilterTrigger);
				triggers.insert(filterTrigger);
				resetFilterTrigger._dropDown = this;
				filterTrigger._dropDown = this;
				editor.set("trigger", triggers);
			}
		},
		
		close: function(selectedValue) {
			var editor = this._editor;
			
			if (this._dynaFilter && !this._filterOnTyping) {
				var triggers = editor.get("trigger");
				if (!(triggers instanceof Array)) triggers = [triggers];
				
				var resetFilterTrigger = getDropDownResetFilterTrigger();
				var filterTrigger = getDropDownFilterTrigger();
				triggers.remove(filterTrigger);
				triggers.remove(resetFilterTrigger);
				filterTrigger._dropDown = null;
				resetFilterTrigger._dropDown = null;
				editor.set("trigger", triggers);
			}
			
			if (editor instanceof dorado.widget.AbstractTextBox) {
				editor.unbind("onTextEdit._filter");
			}
			$invokeSuper.call(this, arguments);
		},
		
		/**
		 * 对下拉数据项进行过滤。
		 * @protected
		 * @param {String} filterValue
		 */
		onFilterItems: function(filterValue) {
			var rowList = this.get("box.control");
			if (!rowList) return;
			
			var arg = {
				filterOperator: "like*",
				filterValue: filterValue,
				processDefault: true
			};
			this.fireEvent("onFilterItems", this, arg);
			if (!arg.processDefault) return;
			
			var realFilterValue;
			if (filterValue != arg.filterValue) {
				realFilterValue = arg.filterValue
			} else if (filterValue) {
				realFilterValue = filterValue.toLowerCase();
			}
			
			var filterParams;
			if (realFilterValue && filterValue.length > 0) {
				var property = this._displayProperty || this._property;
				filterParams = [{
					property: property,
					operator: arg.filterOperator,
					value: realFilterValue
				}];
			}
			rowList.set("highlightCurrentRow", this._rowSelected = false);
			rowList.filter(filterParams);
			
			var box = this.get("box");
			if (box && box.get("visible")) {
				this.locate();
			}
		},

		doOnEditorKeyDown: function(editor, evt) {

			function assignValue(dropdown, rowList) {
				var property = dropdown._displayProperty || dropdown._property;
				var value = rowList.getCurrentItem();
				if (value && property) {
					if (value instanceof dorado.Entity) {
						value = value.get(property);
					} else {
						value = value[property];
					}
				}
				var eventArg = {
					editor : editor,
					selectedValue : value,
					processDefault : true
				};
				dropdown.fireEvent("onValueSelect", dropdown, eventArg);
				var entityForAssignment;
				if (dropdown.getEntityForAssignment) {
					entityForAssignment = dropdown.getEntityForAssignment();
				}
				if (eventArg.processDefault && eventArg.selectedValue !== undefined) {
					dropdown.assignValue(editor, entityForAssignment, eventArg);
				}
			}

			var dropdown = this, retValue = true;
			if (this.get("opened")) {
				var rowList = this.get("box.control");
				switch (evt.keyCode) {
					case 38: // up
					case 40:{ // down
						if (!rowList._highlightCurrentRow) {
							rowList.set("highlightCurrentRow", dropdown._rowSelected = true);
							assignValue(dropdown, rowList);
							retValue = false;
						} else {
							rowList.addListener("onCurrentChange", function() {
								assignValue(dropdown, rowList);
							}, {
								once: true
							});
							retValue = rowList.onKeyDown(evt);
						}
						break;
					}
					case 13: // enter
						this.close(this.getSelectedValue());
						retValue = false;
						break;
					case 27: // esc
						this.close();
						retValue = false;
						break;
					default:
						if (dropdown._rowSelected) {
							rowList = dropdown.get("box.control");
							rowList.set("highlightCurrentRow", dropdown._rowSelected = false);
						}
						retValue = rowList.onKeyDown(evt);
				}
			}
			if (retValue) retValue = $invokeSuper.call(this, arguments);
			return retValue;
		}
	});
	
	/**
	 * @author Benny Bao (mailto:benny.bao@bstek.com)
	 * @component Trigger
	 * @class 列表型下拉框。
	 * @extends dorado.widget.RowListDropDown
	 */
	dorado.widget.ListDropDown = $extend(dorado.widget.RowListDropDown,/** @scope dorado.widget.ListDropDown.prototype */ {
		$className: "dorado.widget.ListDropDown",
		
		ATTRIBUTES: /** @scope dorado.widget.ListDropDown.prototype */ {
		
			/**
			 * 列表下拉框中要显示的数据。
			 * @type Object[]|dorado.EntityList
			 * @attribute
			 */
			items: {
				setter: function(items) {
					if (this._useEmptyItem) {
						if (items instanceof Array) {
							var emptyItem = items[0];
							if (!emptyItem || !emptyItem.isEmptyItem) {
								items.insert({
									isEmptyItem: true
								}, 0);
							}
						} else if (items instanceof dorado.EntityList) {
							var emptyItem = items.getFirst();
							if (!emptyItem || !emptyItem.isEmptyItem) {
								emptyItem = items.insert({}, "begin");
								emptyItem.isEmptyItem = true;
							}
						} else if (items == null) {
							items = [{
								isEmptyItem: true
							}];
						}
					}
					this._items = items;
				}
			}
		},
		
		constructor: function(configs) {
			var items = configs.items;
			delete configs.items;
			$invokeSuper.call(this, [configs]);
			if (items) this.set("items", items);
		},
		
		getDropDownItems: function() {
			return this._items;
		}
	});
	
	/**
	 * @author Benny Bao (mailto:benny.bao@bstek.com)
	 * @component Trigger
	 * @class 可自动将属性声明{@link dorado.PropertyDef}中的mapping转换成下拉数据的下拉框。
	 * <p>
	 * 大部分情况下，我们不必在每次使用此对象时创建一个新的实例。多个编辑框可以共享同一个dorado.widget.AutoMappingDropDown实例。
	 * 基于这个特性，dorado会在View中自动创建一个id为"autoMappingDropDown1"的dorado.widget.AutoMappingDropDown实例。
	 * 因此，一般而言，我们只需要直接引用这个id为"autoMappingDropDown1"的下拉框即可。
	 * </p>
	 * @extends dorado.widget.RowListDropDown
	 */
	dorado.widget.AutoMappingDropDown = $extend(dorado.widget.RowListDropDown,/** @scope dorado.widget.AutoMappingDropDown.prototype */ {
		$className: "dorado.widget.AutoMappingDropDown",
		
		ATTRIBUTES: /** @scope dorado.widget.AutoMappingDropDown.prototype */ {
			dynaFilter: {
				defaultValue: true
			}
		},
		
		getDropDownItems: function() {
			var editor = this._editor, pd = editor._propertyDef;
			var items = editor.get("mapping");
			if (!items) {
				if (!pd) {
					if (dorado.Object.isInstanceOf(editor, dorado.widget.PropertyDataControl)) {
						var dataType = editor.getBindingDataType();
						if (dataType) pd = dataType.getPropertyDef(editor.get("property"));
					}
				}
				if (!pd) {
					var entity = editor.get("entity");
					if (entity instanceof dorado.Entity) {
						pd = entity.getPropertyDef(editor.get("property"));
					}
				}
				if (pd) {
					items = pd.get("mapping");
				}
				this._property = "value";
				this._displayProperty = null;
			} else {
				this._property = "key";
				this._displayProperty = "value";
			}
			if (this._useEmptyItem) {
				items = new dorado.EntityList(items);
				items.insert({
					key: null,
					value: null
				}, "begin");
			}
			return items;
		}
	});
	
	dorado.widget.View.registerDefaultComponent("autoMappingDropDown1", function() {
		return new dorado.widget.AutoMappingDropDown();
	});
	dorado.widget.View.registerDefaultComponent("autoMappingDropDown2", function() {
		return new dorado.widget.AutoMappingDropDown({
			useEmptyItem: true
		});
	});
	dorado.widget.View.registerDefaultComponent("autoOpenMappingDropDown1", function() {
		return new dorado.widget.AutoMappingDropDown({
			autoOpen: true
		});
	});
	dorado.widget.View.registerDefaultComponent("autoOpenMappingDropDown2", function() {
		return new dorado.widget.AutoMappingDropDown({
			autoOpen: true,
			useEmptyItem: true
		});
	});
	
})();

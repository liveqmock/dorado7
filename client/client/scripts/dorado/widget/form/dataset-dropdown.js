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
 * @component Trigger
 * @class 支持数据绑定的下拉框。
 * @extends dorado.widget.ListDropDown
 */
dorado.widget.DataSetDropDown = $extend(dorado.widget.ListDropDown,/** @scope dorado.widget.DataSetDropDown.prototype */ {
	$className: "dorado.widget.DataSetDropDown",
	
	ATTRIBUTES: /** @scope dorado.widget.DataSetDropDown.prototype */ {
		/**
		 * 绑定的数据集。
		 * @type dorado.widget.DataSet
		 * @attribute
		 */
		dataSet: {
			componentReference: true
		},
		
		/**
		 * 数据路径，用于指定下拉框与数据集中的哪些数据节点进行关联。
		 * @type String
		 * @attribute
		 * @see dorado.DataPath
		 */
		dataPath: {},
		
		/**
		 * 是否在下拉框与DataSet之间建立数据绑定。
		 * <p>
		 * 如果设置为true，表示下拉框中创建的将是数据控件与DataSet建立数据绑定，这样下拉框中可以实时的反应DataSet中的数据变化。
		 * 并且如果在这种情况下启用数据过滤功能，实际的数据过滤动作也将交由DataSet来完成，即利用绑定DataSet的数据重装载功能。
		 * 此时如果发生数据过滤，onFilterItem事件是不会被触发的。
		 * </p>
		 * <p>
		 * 如果设置为false，表示下拉框只在初始化是从DataSet中一次性的读取下拉数据，之后与DataSet不再产生关系。
		 * 并且后续的数据过滤等操作也将与{@link dorado.widget.ListDropDown}的实现方式一致。
		 * 此时如果发生数据过滤，onSetFilterParameter事件是不会被触发的。
		 * </p>
		 * @type boolean
		 * @attribute
		 * @default true
		 */
		useDataBinding: {
			defaultValue: true
		},
		
		/**
		 * 数据过滤模式。
		 * <p>
		 * 目前支持以下几种取值：
		 * <ul>
		 * <li>clientSide - 在客户端执行过滤。</li>
		 * <li>serverSide - 在服务端执行过滤。此模式仅在useDataBinding为true是有效。</li>
		 * </ul>
		 * </p>
		 * @type String
		 * @attribute
		 * @default clientSide
		 */
		filterMode: {
			defaultValue: "serverSide"
		},
		
		/**
		 * 是否要在每次下拉框打开时重新装载数据。
		 * @type boolean
		 * @attribute
		 */
		reloadDataOnOpen: {},
		
		/**
		 * 是否启用动态数据过滤的功能。
		 * <p>根据useDataBinding属性的设置，数据过滤功能将有两种实现方式，详见useDataBinding属性的描述</p>
		 * @type boolean
		 * @attribute
		 */
		dynaFilter: {},
		
		/**
		 * 是否随着用户在编辑框中的输入动作自动的对下拉列表中的数据进行过滤。
		 * 如果不启用此功能，则在下拉框打开之后会在编辑框中自动显示出一个过滤按钮，用户可以手工的点击此按钮对数据进行过滤。
		 * @type boolean
		 * @attribute
		 * @default false
		 */
		filterOnTyping: {
			defaultValue: false
		}
	},
	
	EVENTS: /** @scope dorado.widget.DataSetDropDown.prototype */ {
		/**
		 * 当数据过滤动作发生之前，下拉框为绑定的DataSet这是过滤参数时触发的事件。
		 * 此事件在useDataBinding=false时不会被触发。
		 * @param {Object} self 事件的发起者，即控件本身。
		 * @param {Object} arg 事件参数。
		 * @param {dorado.widget.DataSet} arg.dataSet 绑定的DataSet。
		 * @param {Object} #arg.filterValue 过滤条件。
		 * @return {boolean} 是否要继续后续事件的触发操作，不提供返回值时系统将按照返回值为true进行处理。
		 * @event
		 */
		onSetFilterParameter: {}
	},
	
	open: function(editor) {
		var dropdown = this, dataSet = dropdown._dataSet, superClass = $getSuperClass();
		
		var doOpen = function(flush) {
			if (dropdown._useDataBinding) {
				if (dropdown._useDataBinding && dropdown._useEmptyItem) {
					dataSet.bind("onLoadData._insertEmptyItem", function(self, arg) {
						if (arg.pageNo == 1) {
							var items = self.getData(self._dataPath);
							if (items instanceof dorado.EntityList) {
								var emptyItem = items.insert(null, "begin");
								emptyItem.isEmptyItem = true;
							}
						}
					});
				}
				dataSet.bind("onLoadData._relocate", function() {
					if (dropdown._duringShowAnimation) {
						dropdown._shouldRelocate = true;
					} else {
						dropdown.locate();
					}
				});
				dropdown.bind("onClose", function() {
					if (dropdown._useDataBinding && dropdown._useEmptyItem) {
						dataSet.unbind("onLoadData._insertEmptyItem");
					}
					dataSet.unbind("onLoadData._relocate");
				}, {
					once: true
				});
			}
			
			dataSet.getDataAsync(dropdown._dataPath, function(data) {
				if (!dropdown._useDataBinding) {
					dropdown.set("items", data);
				} else if (!flush && dropdown._useEmptyItem && data && data instanceof dorado.EntityList) {
					var emptyItem = data.getFirst();
					if (!emptyItem || !emptyItem.isEmptyItem) {
						emptyItem = data.insert({}, "begin");
						emptyItem.isEmptyItem = true;
					}
				}
				superClass.prototype.open.call(dropdown, editor);
			}, {
				loadMode: "always",
				flush: flush
			});
		};

		if (this._useDataBinding && this._filterOnOpen) {
			var filterValue = (this._lastFilterValue) ? this._lastFilterValue : editor.get("text");
			this.onFilterItems(filterValue, function() {
				doOpen(false);
			});
		} else {
			var lastFilterValue;
			if (this._filterOnOpen) {
				lastFilterValue = this._lastFilterValue;
			} else {
				delete this._lastFilterValue;
				dataSet._sysParameter && dataSet._sysParameter.remove("filterValue");
			}
			doOpen(this._reloadDataOnOpen || lastFilterValue != null);
		}
	},
	
	createDropDownBox: function() {
		if (this._useDataBinding) {
			var dropDown = this, box = dorado.widget.DropDown.prototype.createDropDownBox.call(this), rowList;
			var config = {
				dataSet: this._dataSet,
				dataPath: this._dataPath,
				style: "border: none",
				onDataRowClick: function(rowList) {
					rowList.set("highlightCurrentRow", dropDown._rowSelected = true);
					dropDown.close(dropDown.getSelectedValue());
				},
				onFilterItem: function(rowList, arg) {
                    if (arg && arg.criterions && arg.criterions.length > 0){
                        arg.filterValue = arg.criterions[0].value;
                    }
					dropDown.fireEvent("onFilterItem", dropDown, arg);
				}
			};
			if (this._columns) {
				config.stretchColumnsMode = "stretchableColumns";
				config.columns = this._columns;
				config.readOnly = true;
				rowList = new dorado.widget.DataGrid(config);
			} else {
				config.width = "100%";
				rowList = new dorado.widget.DataListBox(config);
			}
			box.set({
				style: {
					overflow: "hidden"
				},
				control: rowList
			});
			return box;
		} else {
			return $invokeSuper.call(this, arguments);
		}
	},
	
	initDropDownData: function(box, editor) {
		if (!this._useDataBinding) {
			$invokeSuper.call(this, arguments);
		}
		else {
			var rowList = box.get("control");
			if (rowList instanceof dorado.widget.AbstractListBox) {
				rowList.set("property", this._displayProperty || this._property);
			}
		}
	},
	
	getDropDownItems: function() {
		return this._items;
	},
	
	onFilterItems: function(filterValue, callback) {
		var dataSet = this._dataSet;
		if (this._useDataBinding) {
			var arg = {
				filterValue: filterValue,
				processDefault: true
			};
			this.fireEvent("onFilterItems", this, arg);
			if (arg.processDefault) {
				if (this._filterMode == "clientSide") {
					$invokeSuper.call(this, [filterValue, callback]);
					this._lastFilterValue = filterValue;
				} else {
					arg = {
						dataSet: dataSet,
						filterValue: filterValue
					};
					if (this.getListenerCount("onSetFilterParameter") > 0) {
						this.fireEvent("onSetFilterParameter", this, arg);
						filterValue = arg.filterValue;
					}
					
					var sysParameter = dataSet._sysParameter;
					if (!sysParameter) dataSet._sysParameter = sysParameter = new dorado.util.Map();
					if (filterValue) {
						sysParameter.put("filterValue", filterValue);
					} else {
						sysParameter.remove("filterValue");
					}
					
					dataSet.clear();
					var dropdown = this;
					dataSet.flushAsync(function() {
						dropdown._lastFilterValue = filterValue;
						$callback(callback);
					});
				}
			}
		} else {
			$invokeSuper.call(this, [filterValue, callback]);
			this._lastFilterValue = filterValue;
		}
	},
	
	onDropDownBoxShow: function() {
		if (this._useDataBinding) {
			var filterOnOpen = this._filterOnOpen;
			this._filterOnOpen = false;
			$invokeSuper.call(this, arguments);
			this._filterOnOpen = filterOnOpen;
		} else {
			$invokeSuper.call(this, arguments);
		}
	},
	
	doOnEditorKeyDown: function(editor, evt) {
		if (evt.keyCode == 13 && this.get("dynaFilter")) {
			var filterValue = editor.get("text");
			if (!this._rowSelected && (this._lastFilterValue || "") != filterValue) {
				this.onFilterItems(filterValue);
				return false;
			}
		}
		return $invokeSuper.call(this, arguments);
	}
	
});

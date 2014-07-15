var current_process, maxSpendTime = 0, category, maxLength = 0;
var DefaultCellRenderer = $extend(
		dorado.widget.grid.DefaultCellRenderer,
		{
			getValue : function(entity, column) {
				var value;
				if (entity) {
					if (column._property) {
						var property;
						if (column._propertyPath && !entity.rowType) {
							entity = column._propertyPath
									.evaluate(entity, true);
							property = column._subProperty;
						} else {
							property = column._property;
						}

						if (entity) {
							var dataType = column.get("dataType"), displayFormat = column
									.get("displayFormat");
							value = (entity instanceof dorado.Entity) ? entity
									.get(property) : entity[property];
						}
					}
				}
				if (value && value.replace && !column._wrappable) {
					value = value.replace(/\n/g, ' ');
				}
				return value;
			},
			doRender : function(dom, arg) {
				var value = this.getValue(arg.data, arg.column), text = this
						.format(value);
				dom.innerText = text;
				if (text.length > 5)
					dom.title = text;
				$fly(dom.parentNode).toggleClass("wrappable",
						!!arg.column._wrappable);
				this.renderFlag(dom, arg);
			},
			format : function(value) {
				return value;
			}
		});
var StatusCellRenderer = $extend(DefaultCellRenderer, {
	doRender : function(dom, arg) {
		var value = this.getValue(arg.data, arg.column), text = this
				.format(value);
		if (value) {
			dom.style.backgroundColor = '#F8E0E6';
		}
		dom.innerText = text;
		if (text.length > 5)
			dom.title = text;
		$fly(dom.parentNode).toggleClass("wrappable", !!arg.column._wrappable);
		this.renderFlag(dom, arg);
	},
	format : function(value) {
		var text = value ? '${res.monitored}' : '${res.unmonitored}';
		return text;
	}
});
var TimeLengthCellRenderer = $extend(DefaultCellRenderer, {
	format : function(text) {
		return dorado.console.util.formatTimeLength(text);
	}
});

var DateCellRenderer = $extend(DefaultCellRenderer, {
	format : function(text) {
		return dorado.console.util.formatTime(text);
	}
});

var MemoryCellRenderer = $extend(DefaultCellRenderer, {
	format : function(text) {
		return dorado.console.util.formatFileSize(text);
	}
});

var OperationCellRenderer = $extend(
		dorado.widget.grid.SubControlCellRenderer,
		{
			createSubControl : function(arg) {
				var container = new dorado.widget.Container({
					layout : "dorado.widget.layout.AnchorLayout"
				});
				container
						.set(
								"children",
								[ {
									$type : "Button",
									left : '10px',
									userData : 'viewBtn',
									onClick : function(self) {
										var entity = arg.data, name = entity
												.get('name'), action = view
												.get('#getCategoryAction'), status = entity
												.get('status');
										current_process = entity;
										action.set('parameter', {
											name : name
										});
										action.execute();
										var container = view
												.get('#historyProcessListContainer');
										container.set('visible', status);
										container.refresh();

										view.get('#processDetailDialog').show();
										view.get('#processNameLabel').set(
												'text', name);
									}

								} ]);
				return container;
			},
			refreshSubControl : function(self, arg) {
				self.get('children').each(function(btn) {
					btn.set('caption', '${res.viewDetail}')
				});
			}
		});
// =========================================================================================

var SelectCellRenderer = $extend(
		dorado.widget.grid.RowSelectorCellRenderer,
		{
			refreshSubControl : function(checkbox, arg) {
				if (arg.data.rowType) {
					checkbox.destroy();
					return;
				}
				var grid = arg.grid, data = arg.dataForSelection || arg.data, selection = grid._innerGrid._selection, selectionMode = grid._selectionMode, config = {};
				if (selectionMode == "multiRows") {
					config.checked = (selection && selection.indexOf(data) >= 0);
					config.readOnly = false;
				} else if (selectionMode == "singleRow") {
					config.checked = (data == selection);
					config.readOnly = false;
				} else {
					config.checked = false;
					config.readOnly = true;
				}
				checkbox.set(config);
				checkbox.refresh();
				checkbox.set({

					visible : !arg.data.get('status')
				});
				if (!this._checkboxMap) {
					this._checkboxMap = {};
				}
				checkbox._selectDataId = grid._itemModel.getItemId(data);
				this._checkboxMap[checkbox._selectDataId] = checkbox;
			}

		});

var SelectCellHeaderRenderer = $extend(
		dorado.widget.grid.CheckBoxCellRenderer,
		{
			render : function(dom, arg) {

				function getMenu(column) {
					var menu = column._rowSelectorMenu;
					if (!menu) {
						menu = column._rowSelectorMenu = new dorado.widget.Menu(
								{
									items : [
											{
												name : "select-all",
												caption : $resource("dorado.grid.SelectAll"),
												onClick : function(self) {
													var parentGrid = self
															.get('parent.parent');
													if (parentGrid._selectionMode != "multiRows")
														return;
													var added = parentGrid._itemModel
															.getAllDataEntities(), selectable = [];
													if (added.length) {
														for ( var i = 0; i < added.length; i++) {
															if (!added[i]
																	.get('status')) {
																selectable
																		.push(added[i]);
															}
														}
													}
													var selection = parentGrid
															.get("selection");
													if (selection.length
															&& selectable.length) {
														for ( var i = 0; i < selection.length; i++) {
															selectable
																	.remove(selection[i]);
														}
													}
													parentGrid._innerGrid
															.replaceSelection(
																	null,
																	selectable);
												}
											},
											{
												name : "unselect-all",
												caption : $resource("dorado.grid.UnselectAll"),
												onClick : function(self) {
													grid.unselectAll();
												}
											},
											{
												name : "select-invert",
												caption : $resource("dorado.grid.SelectInvert"),
												onClick : function(self) {
													var parentGrid = self
															.get('parent.parent');
													if (parentGrid._selectionMode != "multiRows")
														return;
													var selection = parentGrid
															.get("selection"), removed = [], selectable = [], added = [];
													var all = parentGrid._itemModel
															.getAllDataEntities();
													if (all.length) {
														for ( var i = 0; i < all.length; i++) {
															if (!all[i]
																	.get('status')) {
																selectable
																		.push(all[i]);
															}
														}
													}

													jQuery
															.each(
																	selectable,
																	function(i,
																			item) {
																		if (selection
																				.indexOf(item) >= 0)
																			removed
																					.push(item);
																		else
																			added
																					.push(item);
																	});
													parentGrid._innerGrid
															.replaceSelection(
																	removed,
																	added);
												}
											} ]
								});
						grid.registerInnerControl(menu);
					}
					return menu;
				}

				var grid = arg.grid, column = arg.column, cell = dom.parentNode;
				$fly(dom).empty();

				var $cell = $fly(cell);
				$cell.addClass("row-selector");
				if (!$cell.data("selectionMenuBinded")) {
					$cell.data("selectionMenuBinded", true).click(function() {
						if (grid._selectionMode == "multiRows") {
							var menu = getMenu(column);
							menu.show({
								anchorTarget : cell,
								align : "innerright",
								vAlign : "bottom"
							});
						}
						return false;
					});
				}
			}
		});

// =====================================================================================

/** @Global */
function createTimeBar(value, width) {
	var css = 'width:700px;';
	if (width) {
		css = 'width:' + width + ';';
	}
	return $DomUtils.xCreate({
		tagName : 'DIV',
		style : css,
		className : 'time_bar',
		content : {
			tagName : 'DIV',
			style : 'width: '
					+ dorado.console.util.percent(value, maxSpendTime)
					+ ';background-color: #006030;'
		}
	});
}
function createCountDom(category, lastProcess) {
	var totalTime = lastProcess.get('time') - category.firstProcess.time, frequency = dorado.console.util
			.formatTimeLength(totalTime / category.count);
	return $DomUtils.xCreate({
		tagName : "tr",
		content : [ {
			tagName : "td",
			width : "80px",
			content : {
				tagName : 'span',
				className : 'lable',
				contentText : '${res.count}：'
			}
		}, {
			tagName : "td",
			width : "100px",
			content : {
				tagName : 'span',
				className : 'content',
				contentText : category.count + ''
			}
		}, {
			tagName : "td",
			width : "700px",
			content : {
				tagName : 'div',
				content : [ {
					tagName : 'span',
					className : 'label',
					contentText : '${res.frequency}：'
				}, {
					tagName : 'span',
					className : 'content',
					contentText : frequency
				} ]
			}
		} ]
	});
}
/** @Global */
function createTimeInfoDom(arg) {
	return $DomUtils.xCreate({
		tagName : "tr",
		content : [
				{
					tagName : "td",
					width : "80px",
					content : {
						tagName : 'span',
						className : 'lable',
						content : arg.label
					}
				},
				{
					tagName : "td",
					width : "100px",
					content : {
						tagName : 'span',
						className : 'content',
						content : dorado.console.util
								.formatTimeLength(arg.value)
					}
				},
				{
					tagName : "td",
					width : "700px",
					content : {
						tagName : 'div',
						className : 'time_bar',
						content : {
							tagName : 'div',
							style : 'width: '
									+ dorado.console.util.percent(arg.value,
											arg.maxValue)
									+ ';background-color: ' + arg.color + ';'
						}
					}
				} ]
	});
}
function createProcessDom(arg) {
	return $DomUtils
			.xCreate({
				tagName : 'div',
				className : 'process_info',
				content : {
					tagName : "table",
					content : [ {
						tagName : "tr",
						content : [
								{
									tagName : "td",
									content : [
											{
												tagName : 'span',
												className : 'label',
												content : '${res.time}：'
											},
											{
												tagName : 'span',
												content : dorado.console.util
														.formatTime(arg.time)
											} ]
								},
								{
									tagName : "td",
									content : [
											{
												tagName : 'span',
												className : 'label',
												content : '${res.spendTime}:'
											},
											{
												tagName : 'span',
												content : dorado.console.util
														.formatTimeLength(arg.spendTime)
											} ]
								},
								{
									tagName : "td",
									content : [
											{
												tagName : 'span',
												className : 'label',
												content : '${res.freeMemory}:'
											},
											{
												tagName : 'span',
												content : dorado.console.util
														.formatFileSize(arg.freeMemory)
											} ]
								} ]
					} ]
				}
			});
}

// =====================================================================================

/** @Global */
function renderingPerformanceDom(arg, status) {
	view.get('#changeALGBtn').set({
		'userData' : status,
		'caption' : status ? "${res.excludeFirst}" : "${res.includeFirst}"
	});
	var firstTime = arg.firstProcess.spendTime, maxTime = arg.excludeFirstMaxProcess ? arg.excludeFirstMaxProcess.spendTime
			: 0;
	maxSpendTime = firstTime > maxTime ? firstTime : maxTime;
	var maxTimeDom = createTimeInfoDom({
		label : '${res.maxSpendTime}',
		value : arg.maxTimeProcess.spendTime,
		maxValue : maxSpendTime,
		color : '#FF0000'
	}), minTimeDom = createTimeInfoDom({
		label : '${res.minSpendTime}',
		value : arg.minTimeProcess.spendTime,
		maxValue : maxSpendTime,
		color : '#006030'
	}), avgTimeDom = createTimeInfoDom({
		label : '${res.avgSpendTime}',
		value : arg.avgTime,
		maxValue : maxSpendTime,
		color : '#7E3D76'
	}), firstTimeDom = createTimeInfoDom({
		label : '${res.firstSpendTime}',
		value : arg.firstProcess.spendTime,
		maxValue : maxSpendTime,
		color : '#000093'
	}), countDom = createCountDom(arg, current_process);
	var dom = '<table  class="time_list" width:"100%">' + countDom.outerHTML
			+ maxTimeDom.outerHTML + avgTimeDom.outerHTML
			+ minTimeDom.outerHTML + firstTimeDom.outerHTML + '</table>';
	view.get('#timeLengthContainer').set('content', dom);
	view.get('#lastTimeProcessContainer').set('content', createProcessDom({
		time : current_process.get('time'),
		freeMemory : current_process.get('freeMemory'),
		spendTime : current_process.get('spendTime')
	}));

	view.get('#maxTimeProcessContainer').set('content',
			createProcessDom(arg.maxTimeProcess));
	view.get('#minTimeProcessContainer').set('content',
			createProcessDom(arg.minTimeProcess));
	view.get('#firstTimeProcessContainer').set('content',
			createProcessDom(arg.firstProcess));
	if (current_process.get('status')) {
		var dataset = view.get('#dsHistoryProcess');
		dataset.set('parameter', {
			name : current_process.get('name')
		});

		dataset.flush();
	}
}
// @Bind #getCategoryAction.onSuccess
!function(self, arg) {
	category = arg.result;
	renderingPerformanceDom(category, true);
}

// @Bind #dataTabControl.beforeTabChange
!function(self, arg) {
	var name = arg.newTab.get('name');
	if (name == 'targetTab') {
		view.get('#dsMonitoredTarget').flush();
	} else {
		view.get('#dsLastProcess').flush();
	}
}

// @Bind #changeALGBtn.onClick
!function(self, arg) {
	doChangeButton();
}
/** @Global */
function doChangeButton() {
	var count = category.count, btn = view.get('#changeALGBtn'), status = btn
			.get('userData');
	if (status) {
		if (count > 1) {
			var process = dorado.Core.clone(category, false);
			process.maxTimeProcess = category.excludeFirstMaxProcess;
			process.avgTime = category.excludeFirstAvgTime;
			process.count = count - 1;
			renderingPerformanceDom(process, !status);
		} else {
			dorado.widget.NotifyTipManager.notify("${res.onlyOnceRequest}");
		}
	} else {
		renderingPerformanceDom(category, !status);
	}
}

// @Bind #dsMonitoredTarget.onDataLoad
!function(self, arg) {
	var data = self.get('data'), avgTime;
	maxSpendTime = 0;
	data.each(function(item) {
		avgTime = item.get('avgTime');
		maxSpendTime = avgTime >= maxSpendTime ? avgTime : maxSpendTime;
	});
	maxSpendTime = maxSpendTime * 1.5;
}

// @Bind #dsLastProcess.onDataLoad
!function(self, arg) {
	var data = self.get('data'), spendTime;
	maxSpendTime = 0;
	data.each(function(item) {
		spendTime = item.get('spendTime');
		maxSpendTime = spendTime >= maxSpendTime ? spendTime : maxSpendTime;
	});
	maxSpendTime = maxSpendTime * 1.5;
}
// @Bind #flushDsMonitoredTarget.onClick
!function(self, arg) {

	view.get('#dsMonitoredTarget').flush();
}

// @Bind #flushDsLastProcess.onClick
!function(self, arg) {
	view.get('#dsLastProcess').flush();
}

// @Bind #gridLastProcess.onCreate
!function(self) {
	self.set("&status.renderer", new StatusCellRenderer());
	self.set("&select.renderer", new SelectCellRenderer());
	self.set("&select.headerRenderer", new SelectCellHeaderRenderer());
	self.set("&time.renderer", new DateCellRenderer());
	self.set("&spendTime.renderer", new TimeLengthCellRenderer());
	self.set("&freeMemory.renderer", new MemoryCellRenderer());
	self.set("&operation.renderer", new OperationCellRenderer());
}

// @Bind #gridTarget.onCreate
!function(self) {
	self.set("&minTime.renderer", new TimeLengthCellRenderer());
	self.set("&maxTime.renderer", new TimeLengthCellRenderer());
	self.set("&avgTime.renderer", new TimeLengthCellRenderer());
	self.set("&operation.renderer", new OperationCellRenderer());
	self.set("&frequency.renderer", new TimeLengthCellRenderer());
}

// @Bind #gridHistory.onCreate
!function(self) {
	self.set("&time.renderer", new DateCellRenderer());
	self.set("&spendTime.renderer", new TimeLengthCellRenderer());
	self.set("&freeMemory.renderer", new MemoryCellRenderer());
}

function renderTimeLength(value, arg) {
	var dom = createTimeBar(value, '200px');
	jQuery(arg.dom).empty();
	jQuery(arg.dom).xCreate({
		tagName : "span",
		content : dom
	});
}
// @Bind #gridTarget.#type.onRenderCell
!function(self, arg) {
	var value = arg.data.get('avgTime');
	renderTimeLength(value, arg);
}
// @Bind #gridLastProcess.#type.onRenderCell
!function(self, arg) {
	var value = arg.data.get('spendTime');
	renderTimeLength(value, arg);
}
// @Bind #gridHistory.#operation.onRenderCell
!function(self, arg) {
	var value = arg.data.get('spendTime');
	var dom = createTimeBar(value);
	jQuery(arg.dom).empty();
	jQuery(arg.dom).xCreate({
		tagName : "span",
		content : dom
	});
}
// @Bind #addTargetsAction.onGetUpdateData
!function(self, arg, gridLastProcess) {
	arg.data = gridLastProcess.get("selection");
}
// @Bind #removeTargetsAction.onGetUpdateData
!function(self, arg, gridTarget) {
	arg.data = gridTarget.get("selection");
}

// @Bind #addTargetsAction.onSuccess
!function(self, arg, dataTabControl) {
	dataTabControl.set('currentIndex', 1);
}
// @Bind #removeTargetsAction.onSuccess
!function(self, arg) {
	view.get('#dsMonitoredTarget').flush();
}
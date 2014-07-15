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

	var TABLE_HEIGHT_ADJUST = (dorado.Browser.msie) ? -1 : 0;
	
	/**
	 * @author Benny Bao (mailto:benny.bao@bstek.com)
	 * @class 具有行集特征的列表控件的抽象类。
	 * @abstract
	 * @extends dorado.widget.ViewPortList
	 */
	dorado.widget.RowList = $extend(dorado.widget.ViewPortList, /** @scope dorado.widget.RowList.prototype */ {
		$className: "dorado.widget.RowList",
		
		ATTRIBUTES: /** @scope dorado.widget.RowList.prototype */ {
			/**
			 * 默认的行高。
			 * @type int
			 * @attribute
			 */
			rowHeight: {
				defaultValue: dorado.Browser.isTouch ? 
						($setting["touch.ListBox.defaultRowHeight"] || 30) : 
						($setting["widget.ListBox.defaultRowHeight"] || 22)
			},
			
			/**
			 * 高亮显示当前行。
			 * @type boolean
			 * @attribute skipRefresh
			 * @default true
			 */
			highlightCurrentRow: {
				defaultValue: true,
				skipRefresh: true,
				setter: function(v) {
					this._highlightCurrentRow = v;
					if (this._currentRow) {
						$fly(this._currentRow).toggleClass("current-row", !!v);
					}
				}
			},
			
			/**
			 * 高亮显示鼠标悬停的行。
			 * @type boolean
			 * @attribute
			 * @default true
			 */
			highlightHoverRow: {
				defaultValue: true
			},
			
			/**
			 * 高亮显示多选选中的行。
			 * @type boolean
			 * @attribute
			 * @default true
			 */
			highlightSelectedRow: {
				defaultValue: true
			}
		},
		
		EVENTS: /** @scope dorado.widget.RowList.prototype */ {
		
			/**
			 * 当数据行被点击时触发的事件。
			 * @param {Object} self 事件的发起者，即控件本身。
			 * @param {Object} arg 事件参数。
			 * @param {Event} arg.event DHTML中的事件event参数。
			 * @return {boolean} 是否要继续后续事件的触发操作，不提供返回值时系统将按照返回值为true进行处理。
			 * @event
			 */
			onDataRowClick: {},
			
			/**
			 * 当数据行被双击时触发的事件。
			 * @param {Object} self 事件的发起者，即控件本身。
			 * @param {Object} arg 事件参数。
			 * @param {Event} arg.event DHTML中的事件event参数。
			 * @return {boolean} 是否要继续后续事件的触发操作，不提供返回值时系统将按照返回值为true进行处理。
			 * @event
			 */
			onDataRowDoubleClick: {}
		},
		
		constructor: function() {
			$invokeSuper.call(this, arguments);
			if (this._itemModel) this._itemModel.setItemDomSize(this._rowHeight);
		},
		
		getIndexByItemId: function(itemId) {
			if (typeof itemId == "number") return itemId;
			else {
				var itemModel = this._itemModel;
				return itemModel.getItemIndex(itemModel.getItemById(itemId));
			}
		},
		
		getCurrentItemDom: function() {
			return this._currentRow;
		},
		
		getDraggableOptions: function(dom) {
			var options = $invokeSuper.call(this, arguments);
			if (dom == this._dom) {
				options.handle = ":first-child";
			}
			return options;
		},
		
		createDataTable: function() {
			var table = this._dataTable = $DomUtils.xCreate({
				tagName: "TABLE",
				cellSpacing: 0,
				cellPadding: 0,
				className: "data-table",
				content: {
					tagName: "TBODY"
				}
			});
			var tbody = this._dataTBody = table.tBodies[0];
			
			var self = this;
			$fly(table).mouseover(function(evt) {
				if ($DomUtils.isDragging() || !self._highlightHoverRow) return;
				dorado.Toolkits.cancelDelayedAction(self, "$hoverOutTimerId");
				self.setHoverRow(self.findItemDomByEvent(evt));
			}).mouseout(function(evt) {
				dorado.Toolkits.setDelayedAction(self, "$hoverOutTimerId", function() {
					self.setHoverRow(null);
				}, 50);
			});
			return table;
		},
		
		findItemDomByEvent: function(evt) {
			var target = evt.srcElement || evt.target;
			var target = target || evt, tbody = this._dataTBody;
			return $DomUtils.findParent(target, function(parentNode) {
				return parentNode.parentNode == tbody;
			});
		},
		
		onMouseDown: function(evt) {
			var row = this.findItemDomByEvent(evt);
			if (row || this._allowNoCurrent) {
				if (row && evt.shiftKey) $DomUtils.disableUserSelection(row);
				
				var oldCurrentItem = this.getCurrentItem();
				if (this.setCurrentItemDom(row)) {
					var clickedItem = (row ? $fly(row).data("item") : null), selection = this.getSelection();
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
						/*
						 else {
						 removed = selection;
						 added.push(clickedItem);
						 this._oldCurrentItem = this.getCurrentItem();
						 }
						 */
						this.replaceSelection(removed, added);
					}
				}
				
				if (dorado.Browser.msie) {
					var tbody = this._dataTBody;
					try {
						var cell = $DomUtils.findParent(evt.target, function(parentNode) {
							return parentNode.parentNode.parentNode == tbody;
						}, true);
						if (cell) ((cell.firstChild && cell.firstChild.nodeType == 1) ? cell.firstChild : cell).focus();
					} 
					catch (e) {
						evt.target.focus();
					}
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
			if (!this._highlightSelectedRow || !this._itemDomMap) return;
			var row = this._itemDomMap[this._itemModel.getItemId(item)];
			if (row) $fly(row).toggleClass("selected-row", selected);
		},
		
		onClick: function(evt) {
			if (this.findItemDomByEvent(evt)) {
				this.fireEvent("onDataRowClick", this, {
					event: evt
				});
			}
		},
		
		onDoubleClick: function(evt) {
			if (this.findItemDomByEvent(evt)) {
				this.fireEvent("onDataRowDoubleClick", this, {
					event: evt
				});
			}
		},
		
		setHoverRow: function(row) {
			if (row) {
				if (this._draggable && this._dragMode != "control") {
					this.applyDraggable(row);
				}
				$fly(row).addClass("hover-row");
			}
			if (this._hoverRow == row) return;
			if (this._hoverRow) $fly(this._hoverRow).removeClass("hover-row");
			this._hoverRow = row;
		},
		
		setCurrentRow: function(row) {
			if (this._currentRow == row) return;
			this.setHoverRow(null);
			if (this._currentRow) $fly(this._currentRow).removeClass("current-row");
			this._currentRow = row;
			if (row && this._highlightCurrentRow) $fly(row).addClass("current-row");
		},
		
		getItemTimestamp: function(item) {
			return (item instanceof dorado.Entity) ? item.timestamp : -1;
		},
		
		refreshItemDoms: function(tbody, reverse, fn) {
			if (this._scrollMode == "viewport") this.setCurrentRow(null);
			this._duringRefreshAll = true;
			this._selectionCache = this.get("selection");
			try {
				return $invokeSuper.call(this, arguments);
			}
			finally {
				delete this._selectionCache;
				this._duringRefreshAll = false;
			}
		},
		
		getRealCurrentItemId: function() {
			return this.getCurrentItemId();
		},
		
		refreshItemDom: function(tbody, item, index, prepend) {
			var row;
			if (index >= 0 && index < tbody.childNodes.length) {
				var i = index;
				if (prepend) i = tbody.childNodes.length - i - 1;
				row = tbody.childNodes[i];
				if (this._itemDomMap[row._itemId] == row) delete this._itemDomMap[row._itemId];
			} else {
				row = this.createItemDom(item);
				prepend ? tbody.insertBefore(row, tbody.firstChild) : tbody.appendChild(row);
			}
			
			var flag = prepend ? -1 : 1;
			if (index < 0) flag = -flag;
			index = this._itemModel.getStartIndex() + index * flag;
			var itemId = this._itemModel.getItemId(item, index);
			this._itemDomMap[itemId] = row;
			row.itemIndex = index;
			row._itemId = itemId;
			
			var $row = $fly(row);
			$row.data("item", item);
			
			if (!this._shouldSkipRender && row._lazyRender) {
				this.createItemDomDetail(row, item);
				row._lazyRender = undefined;
			}
			
			if (!row._lazyRender) {
				$row.toggleClass("odd-row", (!this._itemModel.groups && (index % 2) == 1));
				if (itemId == this.getRealCurrentItemId()) {
					this.setCurrentRow(row);
				}
				if (this._selectionMode != "none") {
					var selection = this._selectionCache || this.get("selection");
					switch (this._selectionMode) {
						case "singleRow":{
							$row.toggleClass("selected-row", (selection == item) && this._highlightSelectedRow);
							break;
						}
						case "multiRows":{
							$row.toggleClass("selected-row", !!(selection && selection.indexOf(item) >= 0) && this._highlightSelectedRow);
							break;
						}
					}
				}
				this.refreshItemDomData(row, item);
			}
			return row;
		},
		
		refreshItemDomData: function(row, item) {
			if (row._lazyRender) return;
			var timestamp = this.getItemTimestamp(item);
			if (this._ignoreItemTimestamp || timestamp <= 0 || row.timestamp != timestamp) {
				this.doRefreshItemDomData(row, item);
				row.timestamp = timestamp;
			}
		},
		
		refreshContent: function(container) {
			if (!this._dataTable) {
				var table = this.createDataTable();
				container.appendChild(table);
			}
			if (this._currentScrollMode == "viewport") {
				var beginBlankRow = this._beginBlankRow;
				var endBlankRow = this._endBlankRow;
				if (beginBlankRow) beginBlankRow.parentNode.style.display = "none";
				if (endBlankRow) endBlankRow.parentNode.style.display = "none";
				this._itemModel.setScrollPos(0);
			}
			
			var fn;
			if (this._scrollMode == "lazyRender" && container.clientHeight > 0) {
				var count = parseInt(container.clientHeight / this._rowHeight), i = 0;
				fn = function(row) {
					i++;
					return i <= count;
				};
			}

			this.refreshItemDoms(this._dataTBody, false, fn);
		},
		
		refreshViewPortContent: function(container) {
			var beginBlankRow = this._beginBlankRow;
			var endBlankRow = this._endBlankRow;
			
			if (!this._dataTable) container.appendChild(this.createDataTable());
			if (!beginBlankRow) {
				this._beginBlankRow = beginBlankRow = $DomUtils.xCreate({
					tagName: "TR",
					className: "preparing-area",
					content: "^TD"
				});
				var thead = document.createElement("THEAD");
				thead.appendChild(beginBlankRow);
				container.firstChild.appendChild(thead);
			}
			if (!endBlankRow) {
				this._endBlankRow = endBlankRow = $DomUtils.xCreate({
					tagName: "TR",
					className: "preparing-area",
					content: "^TD"
				});
				var tfoot = document.createElement("TFOOT");
				tfoot.appendChild(endBlankRow);
				container.firstChild.appendChild(tfoot);
			}
			
			var tbody = this._dataTBody;
			var itemModel = this._itemModel, itemCount = itemModel.getItemCount();
			var clientHeight = (container.scrollWidth > container.clientWidth) ? container.offsetHeight : container.clientHeight;
			var viewPortHeight, itemDomCount, self = this;
			
			if (clientHeight) {
				viewPortHeight = TABLE_HEIGHT_ADJUST;
				itemDomCount = this.refreshItemDoms(tbody, itemModel.isReverse(), function(row) {
					viewPortHeight += row.offsetHeight;
					if (dorado.Browser.safari) viewPortHeight -= 2;
					return viewPortHeight <= (clientHeight + 0/*self._rowHeight*/);
				});
			} else {
				itemDomCount = viewPortHeight = 0;
			}
			this._itemDomCount = itemDomCount;
			
			if (!this._skipProcessBlankRows) {
				var startIndex = this.startIndex;
				var cols = this._cols || 1;
				var rowHeightAverage = (itemDomCount > 0) ? viewPortHeight / itemDomCount : this._rowHeight;
				with (beginBlankRow) {
					if (startIndex > 0) {
						firstChild.colSpan = cols;
						firstChild.style.height = Math.round(startIndex * rowHeightAverage) + "px";
						parentNode.style.display = "";
					} else {
						parentNode.style.display = "none";
						firstChild.style.height = "0px";
					}
				}
				with (endBlankRow) {
					if ((itemDomCount + startIndex) < itemCount) {
						firstChild.colSpan = cols;
						firstChild.style.height = Math.round((itemCount - itemDomCount - startIndex) * rowHeightAverage) + "px";
						parentNode.style.display = "";
					} else {
						parentNode.style.display = "none";
						firstChild.style.height = "0px";
					}
				}
				
				var st;
				if (this.startIndex >= itemModel.getStartIndex()) {
					st = this._dataTBody.offsetTop;
				} else {
					st = this._dataTBody.offsetTop + this._dataTBody.offsetHeight - container.clientHeight;
				}
				container.scrollTop = this._scrollTop = st;
				
				var scrollHeight = container.scrollHeight;
				itemModel.setScrollSize(container.clientHeight, scrollHeight);
				this._rowHeightAverage = rowHeightAverage;
			}
		},

		_watchScroll: function(arg) {
			delete this._watchScrollTimerId;
			if (this._scrollMode == "simple") return;

			var container = this._container;
			if (container.scrollLeft == 0 && container.scrollTop == 0 && container.offsetWidth > 0) {
				container.scrollLeft = this._scrollLeft || 0;
				container.scrollTop = this._scrollTop || 0;
			}
			if (this._scrollTop) {
				this._watchScrollTimerId = $setTimeout(this, this._watchScroll, 300);
			}
		},

		onScroll: function(event, arg) {
			var rowList = this;
			if (rowList._scrollMode == "simple") return;

			var container = rowList._container;
			if ((rowList._scrollLeft || 0) != arg.scrollLeft) {
				if (rowList.onXScroll) rowList.onXScroll(arg);
			}
			if ((rowList._scrollTop || 0) != arg.scrollTop) {
				rowList.onYScroll(arg);
			}

			if (rowList._watchScrollTimerId) {
				clearTimeout(rowList._watchScrollTimerId);
				delete rowList._watchScrollTimerId;
			}

			if (arg.scrollTop) {
				rowList._watchScrollTimerId = setTimeout(function() {
					rowList._watchScroll(arg);
				}, 300);
			}

			rowList._scrollLeft = arg.scrollLeft;
			rowList._scrollTop = arg.scrollTop;
		},

		onYScroll: function(arg) {
			var container = this._container;
			if (arg.scrollTop == (container._scrollTop || 0)) return;

			if (this._scrollMode == "viewport") {
				if (dorado.Toolkits.cancelDelayedAction(container, "$scrollTimerId")) {
					if (Math.abs(arg.scrollTop - container._scrollTop) > (arg.clientHeight / 4)) {
						var itemCount = this._itemModel.getItemCount();
						var rowHeight = arg.scrollHeight / itemCount;
						this.setScrollingIndicator((Math.round(arg.scrollTop / rowHeight) + 1) + "/" + itemCount);
					}
				} else {
					container._scrollTop = arg.scrollTop;
				}
				var self = this;
				dorado.Toolkits.setDelayedAction(container, "$scrollTimerId", function() {
					self.doOnYScroll(arg);
				}, 300);
			} else {
				container._scrollTop = arg.scrollTop;
				this.doOnYScroll(arg);
			}
		},

		doOnYScroll: function(arg) {
			if (this._scrollMode == "viewport") {
				dorado.Toolkits.cancelDelayedAction(this._container, "$scrollTimerId");
				this._itemModel.setScrollPos(arg.scrollTop);
				this.setHoverRow(null);
				this.refresh();
				this.hideScrollingIndicator();
			} else if (this._scrollMode == "lazyRender") {
				var rows = this._dataTBody.rows;
				var i = parseInt(arg.scrollTop / this._rowHeight) || 0;
				if (i >= rows.length) i = rows.length - 1;
				var row = rows[i];
				if (!row) return;
				while (row && row.offsetTop > arg.scrollTop) {
					i--;
					row = rows[i];
				}
				var bottom = arg.scrollTop + arg.clientHeight;
				while (row && row.offsetTop < bottom) {
					if (row._lazyRender) {
						var item = $fly(row).data("item");
						this.createItemDomDetail(row, item);
						row._lazyRender = undefined;
						this.refreshItemDomData(row, item);
					}
					i++;
					row = rows[i];
				}
			}
		},

		createDom: function() {
			var dom = $invokeSuper.call(this, arguments);
			if (dorado.Browser.msie && dorado.Browser.version >= 8) dom.hideFocus = true;
			$fly(this._container).bind("modernScrolled", $scopify(this, this.onScroll));
			return dom;
		},
		
		refreshDom: function(dom) {
			var hasRealWidth = !!this._width, hasRealHeight = !!this._height, oldWidth, oldHeight;
			if (!hasRealWidth || !hasRealHeight) {
				oldWidth = dom.offsetWidth;
				oldHeight = dom.offsetHeight;
			}
			
			$invokeSuper.call(this, arguments);
			
			var container = this._container;
			if (this._scrollMode == "viewport") {
				this.refreshViewPortContent(container);
			} else {
				this.refreshContent(container);
			}

			if (this._currentScrollMode && this._currentScrollMode != this._scrollMode && !this.getCurrentItemId()) {
				this.doOnYScroll(container);
			}
			this._currentScrollMode = this._scrollMode;

			if (!this._skipScrollCurrentIntoView) {
				if (this._currentRow) {
					this.scrollItemDomIntoView(this._currentRow);
				}
				else {
					this.scrollCurrentIntoView();
				}
			}
			delete this._skipScrollCurrentIntoView;
			
			if ((!hasRealWidth || !hasRealHeight) && (oldWidth != dom.offsetWidth || oldHeight != dom.offsetHeight)) {
				this.notifySizeChange();
			}
			
			delete this._ignoreItemTimestamp;
		},
		
		scrollItemDomIntoView: function(row) {
			with (this._container) {
				var st = -1;
				if ((row.offsetTop + row.offsetHeight) > (scrollTop + clientHeight)) {
					st = row.offsetTop + row.offsetHeight - clientHeight;
				} else if (row.offsetTop < scrollTop) {
					st = row.offsetTop;
				}
				if (st >= 0) {
					if (this._scrollMode != "lazyRender") this._scrollTop = st;
					scrollTop = st;
				}
			}
		},

		scrollCurrentIntoView: function() {
			var currentItemId = this.getRealCurrentItemId();
			if (currentItemId != null) {
				var row = this._currentRow;
				if (row) {
					this.scrollItemDomIntoView(row);
				} else if (this._scrollMode == "viewport") {
					var itemModel = this._itemModel;
					var index = this.getIndexByItemId(currentItemId);
					if (index < 0) index = 0;
					itemModel.setStartIndex(index);
					var oldReverse = itemModel.isReverse();
					itemModel.setReverse(index >= this.startIndex);
					this.refresh();
					itemModel.setReverse(oldReverse);
				} else {
					row = this._itemDomMap[currentItemId];
					if (row) this.setCurrentItemDom(row);
				}
			}
		},
		
		findItemDomByPosition: function(pos) {
			var dom = this._dom, y = pos.y + dom.scrollTop, row = null;
			var rows = this._dataTBody.rows, rowHeight = this._rowHeightAverage || this._rowHeight, i;
			if (this._scrollMode == "viewport") {
				var relativeY = y;
				if (this._beginBlankRow) relativeY -= this._beginBlankRow.offsetHeight;
				i = parseInt(relativeY / rowHeight);
			} else {
				i = parseInt(y / rowHeight);
			}
			
			if (i < 0) i = 0;
			else if (i >= rows.length) i = rows.length - 1;
			row = rows[i];
			while (row) {
				if (row.offsetTop > y) {
					row = row.previousSibling;
				} else if (row.offsetTop + row.offsetHeight < y) {
					if (row.nextSibling) {
						row = row.nextSibling;
					} else {
						row._dropY = y - row.offsetTop;
						break;
					}
				} else {
					row._dropY = y - row.offsetTop;
					break;
				}
			}
			return row;
		}
	});
	
})();

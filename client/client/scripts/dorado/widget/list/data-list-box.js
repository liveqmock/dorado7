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
 * @component Collection
 * @class 支持数据绑定的列表控件。
 * @extends dorado.widget.AbstractListBox
 * @extends dorado.widget.DataControl
 */
dorado.widget.DataListBox = $extend([dorado.widget.AbstractListBox, dorado.widget.DataControl], /** @scope dorado.widget.DataListBox.prototype */ {
	$className: "dorado.widget.DataListBox",
	
	ATTRIBUTES: /** @scope dorado.widget.DataListBox.prototype */ {
		selection: {
			setter: function(selection) {
				this.refresh();
				$invokeSuper.call(this, arguments);
			}
		}
	},
	
	getCurrentItem: function() {
		return (this._currentRow) ? $fly(this._currentRow).data("item") : null;
	},
	
	getCurrentItemId: function(item, index) {
		var current = this.getCurrentItem();
		return current ? this._itemModel.getItemId(current) : null;
	},
	
	getRealCurrentItemId: function() {
		var current = this._itemModel.getItems() ? this._itemModel.getItems().current : null;
		return current ? this._itemModel.getItemId(current) : null;
	},
	
	setCurrentItemDom: function(row) {
		var item = (row ? $fly(row).data("item") : null);
		if (item) {
			var entityList = this._itemModel.getItems();
			entityList.setCurrent(item);
			if (entityList.current == item) {
				this.setCurrentEntity(item);
				return true;
			}
		}
		return false;
	},
	
	/**
	 * 刷新某数据实体对应的行中的数据。
	 * @param {dorado.Entity} entity 数据实体
	 */
	refreshEntity: function(entity) {
		var row = this._itemDomMap[this._itemModel.getItemId(entity)];
		if (row) this.refreshItemDomData(row, entity);
	},
	
	refreshDom: function(dom) {
		var entityList = this.getBindingData({
			firstResultOnly: true,
			acceptAggregation: true
		});
		if (entityList && !(entityList instanceof dorado.EntityList)) {
			throw new dorado.ResourceException(dorado.list.BindingTypeMismatch);
		}
		
		var oldItems = this._itemModel.getItems();
		if (oldItems != entityList) {
			this._itemModel.setItems(entityList);
			this.set("selection", null);
		}
		$invokeSuper.call(this, arguments);
	},
	
	/**
	 * 设置某记录对应的数据实体对应的行为当前行。
	 * @param {dorado.Entity} entity 数据实体。
	 */
	setCurrentEntity: function(entity) {
		var currentItem = this._currentRow ? $fly(this._currentRow).data("item") : null;
		if (currentItem == entity) return;
		
		var itemId = entity ? this._itemModel.getItemId(entity) : null;
		var row = this._itemDomMap[itemId];
		this.setCurrentRow(row);
		this.scrollCurrentIntoView();
		this.fireEvent("onCurrentChange", this);
		return !!row;
	},
	
	doOnKeyDown: function(evt) {
		var retValue = true;
		var items = this._itemModel.getItems();
		switch (evt.keyCode) {
			case 36: // home
				items.first();
				break;
			case 35: // end
				items.last();
				break;
			case 38: // up
				items.previous();
				retValue = false;
				break;
			case 40: // down
				items.next();
				retValue = false;
				break;
		}
		return retValue;
	},
	
	_adjustBeginBlankRow: function() {
		this._ignoreOnScroll++;
		
		var itemModel = this._itemModel;
		var container = this.getDom();
		var beginBlankRow = this._beginBlankRow;
		var adj = container.scrollTop - beginBlankRow.offsetHeight;
		beginBlankRow.firstChild.style.height = this.startIndex * this._rowHeightAverage + "px";
		container.scrollTop = beginBlankRow.offsetHeight + adj;
		itemModel.setScrollSize(container.clientHeight, container.scrollHeight);
		
		$setTimeout(this, function() {
			this._ignoreOnScroll--;
		}, 0);
	},
	
	_adjustEndBlankRow: function() {
		var itemModel = this._itemModel;
		var container = this.getDom();
		var endBlankRow = this._endBlankRow;
		endBlankRow.firstChild.style.height = (itemModel.getItemCount() - this.startIndex - this.itemDomCount) * this._rowHeightAverage + "px";
		itemModel.setScrollSize(container.clientHeight, container.scrollHeight);
	},
	
	/**
	 * 当列表对应的数据实体集合中的某个数据实体被删除时激活的方法。
	 * @param {Object} arg 用于描述本事件的参数对象，见{@link dorado.widget.DataSet.MESSAGE_DELETED}中描述的消息参数。
	 * @protected
	 * @see dorado.widget.DataSet.MESSAGE_DELETED
	 */
	onEntityDeleted: function(arg) {
		var entity = arg.entity;
		this.replaceSelection(entity, null);
		
		var row = this._itemDomMap[this._itemModel.getItemId(entity)], tbody = this._dataTBody;
		if (this._scrollMode != "viewport") {
			if (row) {
				var nextRow = row.nextSibling;
				this.removeItemDom(row);
				if (this._forceRefreshRearRows !== false) {
					while (nextRow) {
						this.refreshItemDom(tbody, $fly(nextRow).data("item"), nextRow.sectionRowIndex);
						nextRow = nextRow.nextSibling;
					}
				}
				this.notifySizeChange();
			}
		} else {
			var itemModel = this._itemModel;
			if (row) {
				if (row == tbody.firstChild) {
					itemModel.setStartIndex(itemModel.getStartIndex() - 1);
					if (itemModel.getStartIndex() < 0) itemModel.setStartIndex(0);
				} else {
					this.removeItemDom(row);
				}
				this.refresh(true);
			} else {
				var i = itemModel.getItemIndex(entity);
				if (i >= 0) {
					if (i < itemModel.getStartIndex()) {
						this.startIndex--;
						itemModel.setStartIndex(itemModel.getStartIndex() - 1);
						this._adjustBeginBlankRow();
					} else {
						this._adjustEndBlankRow();
					}
				}
			}
		}
	},
	
	/**
	 * 当列表对应的数据实体集合中的插入了新的数据实体时激活的方法。
	 * @param {Object} arg 用于描述本事件的参数对象，见{@link dorado.widget.DataSet.MESSAGE_INSERTED}中描述的消息参数。
	 * @protected
	 * @see dorado.widget.DataSet.MESSAGE_INSERTED
	 */
	onEntityInserted: function(arg) {
		
		function findFontNearestRow(entity) {
			var entity = entity.getPrevious(), row, itemDomMap = this._itemDomMap, itemModel = this._itemModel;
			while (entity) {
				row = itemDomMap[itemModel.getItemId(entity)];
				if (row) return row;
				entity = entity.getPrevious();
			}
		}
		
		function findBackNearestRow(entity) {
			var entity = entity.getNext(), row, itemDomMap = this._itemDomMap, itemModel = this._itemModel;
			while (entity) {
				row = itemDomMap[itemModel.getItemId(entity)];
				if (row) return row;
				entity = entity.getNext();
			}
		}
		
		var entity = arg.entity;
		var mode = arg.insertMode;
		var refEntity = arg.refEntity;
		
		var tbody = this._dataTBody, itemDomMap = this._itemDomMap, itemModel = this._itemModel;
		if (this._scrollMode != "viewport") {
			var row;
			switch (mode) {
				case "begin":{
					row = this.createItemDom(entity);
					tbody.insertBefore(row, tbody.firstChild);
					break;
				}
				
				case "before": {
					row = this.createItemDom(entity);
				    var refRow = itemDomMap[itemModel.getItemId(refEntity)], inserted;
				    if (!refRow) {
				    	refRow = findBackNearestRow.call(this, refEntity);
				    	if (!refRow) {
				    		tbody.appendChild(row);
				    		inserted = true;
				    	}
				    }
				    if (!inserted) tbody.insertBefore(row, refRow);
				    break;
				}
				
				case "after": {
					row = this.createItemDom(entity);
					var refRow = itemDomMap[itemModel.getItemId(refEntity)], inserted;
					if (!refRow) {
						refRow = findFontNearestRow.call(this, refEntity);
				    	if (!refRow) {
				    		tbody.insertBefore(row, tbody.firstChild);
				    		inserted = true;
				    	}
					}
					
					if (!inserted) {
						if (refRow.nextSibling) {
							tbody.insertBefore(row, refRow.nextSibling);
						}
						else {
				    		tbody.appendChild(row);
						}
					}
					break;
				}
				
				default:
					{
						row = this.createItemDom(entity);
						tbody.appendChild(row);
					}
			}
			
			this.refreshItemDom(tbody, entity, row.sectionRowIndex);
			
			if (this._forceRefreshRearRows != false) {
				row = row.nextSibling;
				while (row) {
					this.refreshItemDom(tbody, $fly(row).data("item"), row.sectionRowIndex);
					row = row.nextSibling;
				}
			}
			this.notifySizeChange();
		} else {
			var i = itemModel.getItemIndex(entity);
			if (i >= 0) {
				if (i < this.startIndex) {
					this.startIndex++;
					itemModel.setStartIndex(itemModel.getStartIndex() + 1);
					this._adjustBeginBlankRow();
				} else if (i >= this.startIndex) {
					if (i < this.startIndex + this.itemDomCount) {
						var row = tbody.lastChild;
						var nextRow = tbody.childNodes[i - this.startIndex];
						tbody.insertBefore(row, nextRow);
						this.refresh(true);
					} else {
						this._adjustEndBlankRow();
					}
				}
			}
		}
	},
	
	filterDataSetMessage: function(messageCode, arg) {
		var itemModel = this._itemModel;
		var items = itemModel.getItems();
		switch (messageCode) {
			case dorado.widget.DataSet.MESSAGE_REFRESH:
				return true;
				
			case dorado.widget.DataSet.MESSAGE_CURRENT_CHANGED:
				return (!items || arg.entityList == items || dorado.DataUtil.isOwnerOf(items, arg.entityList));
				
			case dorado.widget.DataSet.MESSAGE_DATA_CHANGED:
			case dorado.widget.DataSet.MESSAGE_REFRESH_ENTITY:
				return (!items || items._observer != this._dataSet || arg.entity.parent == items || dorado.DataUtil.isOwnerOf(items, arg.entity));
				
			case dorado.widget.DataSet.MESSAGE_DELETED:
				return (arg.entity.parent == items || dorado.DataUtil.isOwnerOf(items, arg.entity));
				
			case dorado.widget.DataSet.MESSAGE_INSERTED:
				return (arg.entityList == items);
				
			case dorado.widget.DataSet.MESSAGE_ENTITY_STATE_CHANGED:
				return (arg.entity.parent == items);
				
			case dorado.widget.DataSet.MESSAGE_LOADING_START:
			case dorado.widget.DataSet.MESSAGE_LOADING_END:
				if (arg.entityList) {
					return (items == arg.entityList || dorado.DataUtil.isOwnerOf(items, arg.entityList));
				} else if (arg.entity) {
					var asyncExecutionTimes = dorado.DataPipe.MONITOR.asyncExecutionTimes;
					this.getBindingData({
						firstResultOnly: true,
						acceptAggregation: true
					});
					if (dorado.DataPipe.MONITOR.asyncExecutionTimes > asyncExecutionTimes) {
						return true;
					}
					else {
						this.hideLoadingTip();
						return false;
					}
				} else {
					return true;
				}
				
			default:
				return false;
		}
	},
	
	processDataSetMessage: function(messageCode, arg, data) {
		switch (messageCode) {
			case dorado.widget.DataSet.MESSAGE_REFRESH:
				this.refresh(true);
				break;
				
			case dorado.widget.DataSet.MESSAGE_CURRENT_CHANGED:
				if (!this.setCurrentEntity(arg.entityList.current)) {
					this.refresh(true);
				}
				break;
				
			case dorado.widget.DataSet.MESSAGE_DATA_CHANGED:
			case dorado.widget.DataSet.MESSAGE_REFRESH_ENTITY:
				var items = this._itemModel.getItems();
				if (!items || items._observer != this._dataSet || arg.entity.parent == items || dorado.DataUtil.isOwnerOf(items, arg.newValue)) {
					this.refresh(true);
				} else {
					this.refreshEntity(arg.entity);
				}
				break;
				
			case dorado.widget.DataSet.MESSAGE_ENTITY_STATE_CHANGED:
				this.refreshEntity(arg.entity);
				break;
				
			case dorado.widget.DataSet.MESSAGE_DELETED:
				this.onEntityDeleted(arg);
				break;
				
			case dorado.widget.DataSet.MESSAGE_INSERTED:
				this.onEntityInserted(arg);
				break;
				
			case dorado.widget.DataSet.MESSAGE_LOADING_START:
				this.showLoadingTip();
				break;
				
			case dorado.widget.DataSet.MESSAGE_LOADING_END:
				this.hideLoadingTip();
				break;
		}
	},
	
	/**
	 * 高亮指定的数据实体对应的行。
	 * @param {dorado.Entity} [entity] 要高亮的数据实体，如果不指定此参数则表示要高亮当前行。
	 * @param {Object} [options] 高亮选项。见jQuery ui相关文档中关于highlight方法的说明。
	 * @param {Object} [speed] 动画速度。
	 */
	highlightItem: function(entity, options, speed) {
		entity = entity || this.getCurrentItem();
		var row = this._itemDomMap[this._itemModel.getItemId(entity)];
		if (row) {
			$fly(row).addClass("highlighting-row").effect("highlight", options ||
			{
				color: "#FF8000"
			}, speed || 1500, function() {
				$fly(row).removeClass("highlighting-row");
			});
		}
	}
});

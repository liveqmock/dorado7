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
	var DateHelper = {
		getWeekCountOfYear: function(date) {
			var begin = new Date(date.getFullYear(), 0, 1);
			var day = begin.getDay();
			if (day == 0) {
				day = 7;
			}
			var duration = date.getTime() - begin.getTime() + (day - 1) * 3600 * 24 * 1000;
			return Math.ceil(duration / 3600 / 24 / 1000 / 7);
		},
		//取得某个月的天数
		getDayCountOfMonth: function(year, month) {
			if (month == 3 || month == 5 || month == 8 || month == 10) {
				return 30;
			}
			if (month == 1) {
				if (year % 4 == 0 && year % 100 != 0 || year % 400 == 0) {
					return 29;
				} else {
					return 28;
				}
			}
			return 31;
		},
		getFirstDayOfMonth: function(date) {
			var temp = new Date(date.getTime());
			temp.setDate(1);
			return temp.getDay();
		}
	};

	var CELL_UNSELECTABLE_CLASS = "unselectable", CELL_SELECTED_CLASS = "selected-date", PREV_MONTH_CLASS = "pre-month", NEXT_MONTH_CLASS = "next-month";

	/**
	 * @author Frank Zhang (mailto:frank.zhang@bstek.com)
	 * @class DatePicker
	 * @extends dorado.widget.Control
	 */
	dorado.widget.DatePicker = $extend(dorado.widget.Control, /** @scope dorado.widget.DatePicker.prototype */ {
		$className: "dorado.widget.DatePicker",
		focusable: true,
		
		ATTRIBUTES: /** @scope dorado.widget.DatePicker.prototype */ {
			width: {
				independent: true,
				readOnly: true
			},
			
			height: {
				independent: true,
				readOnly: true
			},
			
			className: {
				defaultValue: "d-date-picker"
			},
			
			/**
			 * DataPicker对应的日期。
			 * @attribute
			 * @default new Date()
			 * @type Date
			 */
			date: {
				defaultValue: function() {
					return new Date();
				},
				setter: function(value) {
					this._date = value;
					this.refreshButtonOnFilterDate();
				}
			},

			/**
			 * 选择模式。
			 * <p>
			 * 此属性具有如下几种取值：
			 * <ul>
			 * <li>singleDate - 单个日期选择。</li>
			 * <li>multiDate - 多个日期选择。</li>
			 * </ul>
			 * </p>
			 * @attribute
			 * @type String
			 * @default "singleDate"
			 */
			selectionMode: {
				defaultValue: "singleDate",
				skipRefresh: true,
				writeBeforeReady: true
			},

			/**
			 * DatePicker中的选中项，单选模式下请使用date属性。
			 * @type Date|Date[]
			 * @attribute
			 */
			selection: {
				getter: function() {
					if (this._selection) {
						return this._selection;
					} else {
						return ("multiDate" == this._selectionMode) ? [] : this._date;
					}
				},
				setter: function(selection) {
					if (selection == null && this._selectionMode == "multiDate") selection = [];
					this._selection = selection;
				}
			},

			/**
			 * 是否显示TimeSpinner。
			 * @attribute
			 * @default false
			 * @type boolean
			 */
			showTimeSpinner: {
				defaultValue: false
			},
			
			/**
			 * 是否显示今天按钮，仅在渲染前设置有效。
			 * @attribute writeBeforeReady
			 * @default true
			 * @type boolean
			 */
			showTodayButton: {
				defaultValue: true
			},
			
			/**
			 * 是否显示清除按钮，仅在渲染前设置有效。
			 * @attribute writeBeforeReady
			 * @default true
			 * @type boolean
			 */
			showClearButton: {
				defaultValue: true
			},
			
			/**
			 * 是否显示取消按钮，仅在渲染前设置有效。
			 * @attribute writeBeforeReady
			 * @type boolean
			 */
			showCancelButton: {
				defaultValue: false
			},
			
			/**
			 * 是否显示确定按钮，仅在渲染前设置有效。
			 * @attribute writeBeforeReady
			 * @default true
			 * @type boolean
			 */
			showConfirmButton: {
				defaultValue: true
			},

			/**
			 * DatePicker上方中间显示的年月的格式，只支持两个变量：Y代表年，m代表月。
			 * 默认为m &nbsp;&nbsp; Y，可以通过修改$setting["widget.datepicker.defaultYearMonthFormat"]来全局修改。
			 * @attribute
			 * @type String
			 */
			yearMonthFormat: {
			}
		},
		
		EVENTS: /** @scope dorado.widget.DatePicker.prototype */ {
			/**
			 * 当用户点击日期表格上的日期时触发此事件。
			 * 注意：也就是说onPick无法捕获点击『确定』按钮时的操作，也无法捕获点击『清除』按钮时的操作。
			 * @param {Object} self 事件的发起者，即组件本身。
			 * @param {Object} arg 事件参数。
			 * @param {Object} arg.date 用户选择的日期。
			 * @return {boolean} 是否要继续后续事件的触发操作，不提供返回值时系统将按照返回值为true进行处理。
			 * @event
			 */
			onPick: {},

			/**
			 * 当用户点击Clear按钮的时候触发的事件。
			 * @param {Object} self 事件的发起者，即组件本身。
			 * @param {Object} arg 事件参数。
			 * @return {boolean} 是否要继续后续事件的触发操作，不提供返回值时系统将按照返回值为true进行处理。
			 * @event
			 */
			onClear: {},

			/**
			 * 当用户点击确定按钮时触发此事件。
			 * @param {Object} self 事件的发起者，即组件本身。
			 * @param {Object} arg 事件参数。
			 * @param {Object} arg.date 用户选择的日期。
			 * @return {boolean} 是否要继续后续事件的触发操作，不提供返回值时系统将按照返回值为true进行处理。
			 * @event
			 */
			onConfirm: {},

			/**
			 * 当用户不选择日期，点击取消按钮后触发此事件
			 * @param {Object} self 事件的发起者，即组件本身。
			 * @param {Object} arg 事件参数。
			 * @return {boolean} 是否要继续后续事件的触发操作，不提供返回值时系统将按照返回值为true进行处理。
			 * @event
			 */
			onCancel: {},
			
			/**
			 * 当日期单元格要刷新的时候会触发此事件。
			 * @param {Object} self 事件的发起者，即组件本身。
			 * @param {Object} arg 事件参数。
			 * @param {HtmlElement} arg.cell 要刷新的cell的dom。
			 * @param {Date} arg.date 要刷新的cell的日期。
			 * @return {boolean} 是否要继续后续事件的触发操作，不提供返回值时系统将按照返回值为true进行处理。
			 * @event
			 */
			onRefreshDateCell: {},

			/**
			 * 当日期需要判断是否可选择的时候会触发此事件。
			 * @param {Object} self 事件的发起者，即组件本身。
			 * @param {Object} arg 事件参数。
			 * @param {Date} arg.date 要过滤的日期。
			 * @param {Date} arg.selectable 该日期是否可选，默认为true，如果要过滤该日期，返回false即可。
			 * @return {boolean} 是否要继续后续事件的触发操作，不提供返回值时系统将按照返回值为true进行处理。
			 * @event
			 */
			onFilterDate: {}
		},

		addSelection: function(date) {
			var selection = this._selection;
			if (!selection) selection = this._selection = [];
			selection.push(date);
		},

		removeSelection: function(date) {
			var selection = this._selection;
			if (!selection || !date) return;
			var targetIndex = null;
			selection.forEach(function(item, index) {
				if (item && item.getTime() == date.getTime())
					targetIndex = index;
			});
			if (targetIndex) selection.removeAt(targetIndex);
		},

		clearSelections: function() {
			var selection = this._selection;
			this._selection = [];
			this.refreshDate();
		},

		/**
		 * 设置Picker的年份。
		 * @param {int|String} year 如果直接指定数字，则为要设置的年份，注意为完整年份。如果是字符串，目前只支持prev和next。
		 * @param {boolean} refresh 是否要刷新，默认为false。
		 * @private
		 */
		setYear: function(year, refresh, animate) {
			var picker = this, date = picker._date, oldDay = date.getDate(), oldMonth = date.getMonth(), oldYear = date.getFullYear();
			
			var source = new Date(date.getTime());
			
			if (year == "prev") {
				year = oldYear - 1;
			} else {
				if (year == "next") {
					year = oldYear + 1;
				}
			}
			
			if (oldMonth == 1 && oldDay == 29) {
				var newMonthDay = DateHelper.getDayCountOfMonth(year, date.getMonth());
				
				if (oldDay > newMonthDay) {
					date.setDate(newMonthDay);
				}
			}
			
			date.setFullYear(year);
			
			if (refresh) {
				if (animate === false) {
					picker.refresh();
				} else {
					picker.doMonthAnimate(source, date);
				}
			}

			picker.refreshButtonOnFilterDate();
		},
		
		/**
		 * @param {Date} source
		 * @param {Date} target
		 * @return {String} the type of animate. l2r, r2l, t2b, b2t
		 * @private
		 */
		getMonthAnimateType: function(source, target) {
			if (source && target) {
				var syear = source.getFullYear(), tyear = target.getFullYear(), smonth = source.getMonth(), tmonth = target.getMonth();
				if (syear == tyear && smonth == tmonth) return null;
				if (syear == tyear) {
					return smonth > tmonth ? "r2l" : "l2r";
				} else {
					return syear > tyear ? "t2b" : "b2t";
				}
			}
			return null;
		},
		
		/**
		 * @param {Date} source
		 * @param {Date} target
		 * @private
		 */
		doMonthAnimate: function(source, target) {
			var picker = this, animateType = picker.getMonthAnimateType(source, target);
			if (picker._doMonthAnimating) {
				return;
			}
			if (animateType == null) {
				picker.refresh();
				return;
			}
			
			var dateTable = picker._doms.dateTable, dateBlock = picker._doms.dateBlock, dateTableWidth = dateBlock.offsetWidth, dateTableHeight = dateBlock.offsetHeight;
			var sourceRegion, targetRegion, style, animConfig;
			
			switch (animateType) {
				case "l2r":
					sourceRegion = 1;
					targetRegion = 2;
					style = {
						width: dateTableWidth * 2,
						left: 0,
						top: 0
					};
					animConfig = {
						left: -1 * dateTableWidth
					};
					break;
				case "r2l":
					sourceRegion = 2;
					targetRegion = 1;
					style = {
						width: dateTableWidth * 2,
						left: -1 * dateTableWidth,
						top: 0
					};
					animConfig = {
						left: 0
					};
					break;
				case "b2t":
					sourceRegion = 1;
					targetRegion = 3;
					style = {
						width: dateTableWidth * 2,
						left: 0,
						top: 0
					};
					animConfig = {
						top: -1 * dateTableHeight
					};
					break;
				case "t2b":
					sourceRegion = 3;
					targetRegion = 1;
					style = {
						width: dateTableWidth * 2,
						left: 0,
						top: -1 * dateTableHeight
					};
					animConfig = {
						top: 0
					};
					break;
			}
			
			picker.refreshDate(source, sourceRegion);
			picker.refreshDate(target, targetRegion);
			
			$fly(dateTable).css(style);
			
			picker._visibleDateRegion = targetRegion;
			
			picker._doMonthAnimating = true;
			$fly(dateTable).animate(animConfig, {
				complete: function() {
					picker._doMonthAnimating = false;
					picker.refreshYearMonth();
				}
			});
		},
		
		/**
		 * 设置月份。
		 * @param {int|String} month 如果是数字，则为要设置的月份，从0开始计算。如果是字符串，目前只支持prev和next。
		 * @param {boolean} refresh 是否要刷新。
		 * @private
		 */
		setMonth: function(month, refresh, animate) {
			var picker = this, date = picker._date, oldDay = date.getDate(), oldYear = date.getFullYear(), oldMonth = date.getMonth();
			
			var source = new Date(date.getTime());
			
			if (month == "prev") {
				if (oldMonth != 0) {
					month = oldMonth - 1;
				} else {
					picker.setYear(oldYear - 1);
					month = 11;
				}
			} else if (month == "next") {
				if (oldMonth != 11) {
					month = oldMonth + 1;
				} else {
					picker.setYear(oldYear + 1);
					month = 0;
				}
			}
			
			if (oldDay >= 29) {
				var newMonthDay = DateHelper.getDayCountOfMonth(oldYear, month);
				
				if (oldDay > newMonthDay) {
					date.setDate(newMonthDay);
				}
			}
			
			date.setMonth(month);
			
			if (refresh) {
				if (animate === false) {
					picker.refresh();
				} else {
					picker.doMonthAnimate(source, date);
				}
			}

			picker.refreshButtonOnFilterDate();
		},
		
		/**
		 * 设置日期。
		 * @param {int|String} day 如果是数字，则为要设置的日期，从0开始。如果不是数字，支持prev、next、nextweek、prevweek。
		 * @param {boolean} refresh 是否要刷新。
		 */
		setDate: function(day, refresh) {
			var picker = this, date = picker._date;
			switch (day) {
				case "next":
					date.setDate(date.getDate() + 1);
					break;
				case "prev":
					date.setDate(date.getDate() - 1);
					break;
				case "nextweek":
					date.setDate(date.getDate() + 7);
					break;
				case "prevweek":
					date.setDate(date.getDate() - 7);
					break;
				default:
					if (!isNaN(day)) {
						date.setDate(day);
					}
					break;
			}
			if (refresh) {
				picker.refresh();
			}

			picker.refreshButtonOnFilterDate();
		},

		refreshButtonOnFilterDate: function () {
			if (this.isActualVisible()) {
				if (this._todayButton) {
					this._todayButton.set("disabled", !this.isDateSelectable(new Date()));
				}
				if (this._confirmButton) {
					this._confirmButton.set("disabled", !this.isDateSelectable(this._date));
				}
			}
		},

		refreshDateCell: function (date, cell) {
			var picker = this;
			picker.fireEvent("onRefreshDateCell", picker, {
				date: date,
				cell: cell
			});

			var selectable = picker.isDateSelectable(date);

			if (selectable) {
				$fly(cell).removeClass(CELL_UNSELECTABLE_CLASS);
			} else {
				$fly(cell).addClass(CELL_UNSELECTABLE_CLASS);
			}

			if (picker._selectionMode == "multiDate") {
				var selection = this._selection;
				if (!selection || !date) return;
				var targetIndex = null;
				selection.forEach(function(item, index) {
					if (item && item.getTime() == date.getTime()) {
						targetIndex = index;
					}
				});
				if (targetIndex != null){
					$fly(cell).addClass(CELL_SELECTED_CLASS);
				} else {
					$fly(cell).removeClass(CELL_SELECTED_CLASS);
				}
			}
		},

		/**
		 * @protected
		 * 判断某个日期是否可以选择。
		 * @param {Date} date 要判断的日期。
		 * @returns {boolean} 返回传入的日期是否可以选择。
		 */
		isDateSelectable: function(date) {
			var picker = this, filterArg = {
				date: date,
				selectable: true
			};
			picker.fireEvent("onFilterDate", picker, filterArg);

			return filterArg.selectable;
		},

		refreshDate: function(target, region) {
			var picker = this, doms = picker._doms, date = target || picker._date, count = 1, day = DateHelper.getFirstDayOfMonth(date), maxDay = DateHelper.getDayCountOfMonth(date.getFullYear(), date.getMonth()), dateTable = doms.dateTable, selectDay = date.getDate(), lastMonthDay = DateHelper.getDayCountOfMonth(date.getFullYear(), (date.getMonth() == 0 ? 11 : date.getMonth() - 1));
			
			day = (day == 0 ? 7 : day);

			var isSingleSelect = picker._selectionMode != "multiDate";

			var startI = 0, startJ = 0;
			region = region || picker._visibleDateRegion;
			
			switch (region) {
				case 2:
					startJ = 7;
					break;
				case 3:
					startI = 6;
					break;
				case 4:
					startI = 6;
					startJ = 7;
					break;
			}
			
			for (var i = startI; i < startI + 6; i++) {
				for (var j = startJ; j < startJ + 7; j++) {
					var cell = dateTable.rows[i].cells[j];
					if (i == startI) {
						if (j - startJ >= day) {
							cell.innerHTML = count++;
							this.refreshDateCell(new Date(date.getFullYear(), date.getMonth(), parseInt(cell.innerHTML, 10)), cell);
							if (isSingleSelect) {
								if (count - 1 == selectDay) {
									if (!$fly(cell).hasClass(CELL_UNSELECTABLE_CLASS)) {
										cell.className = CELL_SELECTED_CLASS;
									} else {
										cell.className = CELL_UNSELECTABLE_CLASS;
									}
								} else {
									$fly(cell).removeClass(CELL_SELECTED_CLASS).removeClass(NEXT_MONTH_CLASS).removeClass(PREV_MONTH_CLASS);
								}
							}
						} else {
							cell.innerHTML = lastMonthDay - (day - j % 7) + 1;
							
							cell.className = PREV_MONTH_CLASS;
							this.refreshDateCell(new Date(date.getFullYear(), date.getMonth() - 1, parseInt(cell.innerHTML, 10)), cell);
						}
					} else {
						if (count <= maxDay) {
							cell.innerHTML = count++;
							this.refreshDateCell(new Date(date.getFullYear(), date.getMonth(), parseInt(cell.innerHTML, 10)), cell);
							if (isSingleSelect) {
								if (count - 1 == selectDay) {
									if (!$fly(cell).hasClass(CELL_UNSELECTABLE_CLASS)) {
										cell.className = CELL_SELECTED_CLASS;
									} else {
										cell.className = CELL_UNSELECTABLE_CLASS;
									}
								} else {
									$fly(cell).removeClass(CELL_SELECTED_CLASS).removeClass(NEXT_MONTH_CLASS).removeClass(PREV_MONTH_CLASS);
								}
							}
						} else {
							cell.innerHTML = count++ - maxDay;
							cell.className = NEXT_MONTH_CLASS;
							this.refreshDateCell(new Date(date.getFullYear(), date.getMonth() + 1, parseInt(cell.innerHTML, 10)), cell);
						}
					}
				}
			}
		},
		
		/**
		 * 刷新月份和年份。
		 * @private
		 */
		refreshYearMonth: function() {
			var picker = this, doms = picker._doms, date = picker._date;
			var format = this._yearMonthFormat || $setting["widget.datepicker.defaultYearMonthFormat"];
			doms.yearMonthLabel.innerHTML = format.replace("Y", date.getFullYear()).replace("m", date.getMonth() + 1);
		},
		
		refreshSpinner: function() {
			var picker = this, spinner = picker._timeSpinner, date = picker._date;
			if (picker._showTimeSpinner && spinner) {
				spinner.set({
					hours: date.getHours(),
					minutes: date.getMinutes(),
					seconds: date.getSeconds()
				});
			}
		},
		
		refreshDom: function(dom) {
			var picker = this;
			picker.refreshDate();
			picker.refreshYearMonth();
			picker.refreshButtonOnFilterDate();

			if (picker._showTimeSpinner) {
				picker.doShowTimeSpinner();
				picker.refreshSpinner();
			} else {
				picker.doHideTimeSpinner();
			}
			
			$invokeSuper.call(this, arguments);
		},
		
		createDom: function() {
			var allWeeks = $resource("dorado.baseWidget.AllWeeks") || $resource("dorado.core.AllWeeks") || "", weeks = allWeeks.split(",");
			
			var dateRows = [];
			
			for (var i = 0; i < 12; i++) {
				dateRows.push({
					tagName: "tr",
					content: [{
						tagName: "td"
					}, {
						tagName: "td"
					}, {
						tagName: "td"
					}, {
						tagName: "td"
					}, {
						tagName: "td"
					}, {
						tagName: "td"
					}, {
						tagName: "td"
					}, {
						tagName: "td"
					}, {
						tagName: "td"
					}, {
						tagName: "td"
					}, {
						tagName: "td"
					}, {
						tagName: "td"
					}, {
						tagName: "td"
					}, {
						tagName: "td"
					}]
				});
			}
			
			var picker = this, doms = {}, dom = $DomUtils.xCreate({
				tagName: "div",
				content: [{
					tagName: "div",
					className: "year-month-block",
					content: [{
						tagName: "div",
						className: "pre-button-div",
						contextKey: "prevButtonDiv"
					}, {
						tagName: "div",
						className: "next-button-div",
						contextKey: "nextButtonDiv"
					}, {
						tagName: "div",
						className: "year-month-label",
						contextKey: "yearMonthLabel"
					}]
				}, {
					tagName: "table",
					cellPadding: 0,
					cellSpacing: 0,
					border: 0,
					className: "date-header",
					contextKey: "dateHeader",
					content: [{
						tagName: "tr",
						className: "header",
						content: [{
							tagName: "td",
							content: weeks[0]
						}, {
							tagName: "td",
							content: weeks[1]
						}, {
							tagName: "td",
							content: weeks[2]
						}, {
							tagName: "td",
							content: weeks[3]
						}, {
							tagName: "td",
							content: weeks[4]
						}, {
							tagName: "td",
							content: weeks[5]
						}, {
							tagName: "td",
							content: weeks[6]
						}]
					}]
				}, {
					tagName: "div",
					className: "date-block",
					contextKey: "dateBlock",
					content: {
						tagName: "table",
						cellPadding: 0,
						cellSpacing: 0,
						border: 0,
						className: "date-table",
						contextKey: "dateTable",
						content: dateRows
					}
				}, {
					contextKey: "buttonBlock",
					className: "button-block"
				}, {
					tagName: "div",
					contextKey: "spinnerBlock",
					className: "spinner-block"
				}]
			}, null, doms);
			
			picker._doms = doms;
			
			if (picker._showTodayButton) {
				var todayButton = new dorado.widget.Button({
					caption: $resource("dorado.baseWidget.DatePickerToday"),
					listener: {
						onClick: function() {
							var now = new Date(), oldDate = picker._date;
							picker.set("date", now);
							if (now.getFullYear() === oldDate.getFullYear() && now.getMonth() === oldDate.getMonth()) {
								picker.fireEvent("onPick", picker, {
									date: picker._showTimeSpinner ? new Date(now.getTime()) : new Date(now.getFullYear(), now.getMonth(), now.getDate())
								});
							}
						}
					}
				});
				todayButton.render(doms.buttonBlock);
				picker._todayButton = todayButton;
				picker.registerInnerControl(todayButton);
			}
			
			if (picker._showClearButton) {
				var clearButton = new dorado.widget.Button({
					caption: $resource("dorado.baseWidget.DatePickerClear"),
					listener: {
						onClick: function() {
							picker.fireEvent("onClear", picker, {});
						}
					}
				});
				clearButton.render(doms.buttonBlock);
				picker.registerInnerControl(clearButton);
			}
			
			if (picker._showCancelButton) {
				var cancelButton = new dorado.widget.Button({
					caption: $resource("dorado.baseWidget.DatePickerCancel"),
					listener: {
						onClick: function() {
							picker.fireEvent("onCancel", picker);
						}
					}
				});
				cancelButton.render(doms.buttonBlock);
				picker._cancelButton = cancelButton;
				picker.registerInnerControl(cancelButton);
			}
			
			if (picker._showConfirmButton) {
				var confirmButton = new dorado.widget.Button({
					caption: $resource("dorado.baseWidget.DatePickerConfirm"),
					ui: "highlight",
					listener: {
						onClick: function() {
							var date, pickerDate = picker._date;
							if (picker._showTimeSpinner && picker._timeSpinner) {
								var spinner = picker._timeSpinner;
								date = new Date(pickerDate.getFullYear(), pickerDate.getMonth(), pickerDate.getDate(), spinner.get("hours"), spinner.get("minutes"), spinner.get("seconds"))
							} else {
								date = new Date(pickerDate.getFullYear(), pickerDate.getMonth(), pickerDate.getDate());
							}
							picker.fireEvent("onConfirm", picker, {
								date: date
							});
						}
					}
				});
				confirmButton.render(doms.buttonBlock);
				picker._confirmButton = confirmButton;
				picker.registerInnerControl(confirmButton);
			}
			
			var dateTable = doms.dateTable;
			var isSingleSelect = picker._selectionMode != "multiDate";

			$fly(dateTable).click(function(event) {
				var position = $DomUtils.getCellPosition(event), element = position.element, date = picker._date;
				
				if (position && element) {
					var className = element.className;
					if (className.indexOf(CELL_UNSELECTABLE_CLASS) != -1) return;
					if (className.indexOf("next-month") != -1) {
						picker.setMonth(date.getMonth() + 1);
					} else {
						if (className.indexOf("pre-month") != -1) {
							picker.setMonth(date.getMonth() - 1);
						}
					}

					if (isSingleSelect) {
						picker.setDate(parseInt(element.innerHTML, 10), true);

						picker.fireEvent("onPick", picker, {
							date: new Date(date.getTime())
						});
					} else {
						if (className.indexOf("next-month") != -1  || className.indexOf("pre-month") != -1) {
							picker.setDate(parseInt(element.innerHTML, 10), true);
							return;
						}
						var selectDate = new Date(date.getFullYear(), date.getMonth(), parseInt(element.innerHTML, 10));
						if (className.indexOf(CELL_SELECTED_CLASS) != -1) {
							picker.removeSelection(selectDate);
							$fly(element).removeClass(CELL_SELECTED_CLASS);
						} else {
							picker.addSelection(selectDate);
							$fly(element).addClass(CELL_SELECTED_CLASS);
						}
					}
				}
			}).dblclick(function(event) {
				if (picker._showTimeSpinner == false) return;
				var position = $DomUtils.getCellPosition(event), element = position.element, date = picker._date;

				if (position && element) {
					var className = element.className;
					if (className.indexOf(CELL_UNSELECTABLE_CLASS) != -1) return;
					if (className.indexOf("next-month") != -1 || className.indexOf("pre-month") != -1) {
						return;
					}
					picker.setDate(parseInt(element.innerHTML, 10), true);

					picker.fireEvent("onConfirm", picker, {
						date: new Date(date.getTime())
					});
				}
			});
			
			var prevYearButton = new dorado.widget.SimpleIconButton({
				iconClass: "pre-year-button",
				listener: {
					onClick: function() {
						picker.setYear("prev", true);
					}
				}
			});
			
			var prevMonthButton = new dorado.widget.SimpleIconButton({
				iconClass: "pre-month-button",
				listener: {
					onClick: function() {
						picker.setMonth("prev", true);
					}
				}
			});
			
			prevYearButton.render(doms.prevButtonDiv);
			prevMonthButton.render(doms.prevButtonDiv);
			
			var nextMonthButton = new dorado.widget.SimpleIconButton({
				iconClass: "next-month-button",
				listener: {
					onClick: function() {
						picker.setMonth("next", true);
					}
				}
			});
			
			var nextYearButton = new dorado.widget.SimpleIconButton({
				iconClass: "next-year-button",
				listener: {
					onClick: function() {
						picker.setYear("next", true);
					}
				}
			});
			
			nextMonthButton.render(doms.nextButtonDiv);
			nextYearButton.render(doms.nextButtonDiv);
			
			picker.registerInnerControl(prevYearButton);
			picker.registerInnerControl(prevMonthButton);
			picker.registerInnerControl(nextMonthButton);
			picker.registerInnerControl(nextYearButton);
			
			$fly(doms.yearMonthLabel).click(function() {
				picker.showYMPicker();
			});
			
			picker._visibleDateRegion = 1;
			
			return dom;
		},
		
		/**
		 * @private
		 */
		doShowTimeSpinner: function() {
			var picker = this, spinner = picker._timeSpinner;
			if (!spinner) {
				spinner = picker._timeSpinner = new dorado.widget.DateTimeSpinner({
					type: "time",
					width: 100,
					listener: {
						//此事件暂时不生效
						onPost: function() {
							var date = picker._date;
							date.setHours(spinner.get("hours"));
							date.setMinutes(spinner.get("minutes"));
							date.setSeconds(spinner.get("seconds"));
						}
					}
				});
				spinner.render(picker._doms.spinnerBlock);
				picker.registerInnerControl(spinner);
			}
			$fly(spinner._dom).css("display", "");
		},
		
		/**
		 * @private
		 */
		doHideTimeSpinner: function() {
			var picker = this, spinner = picker._timeSpinner;
			if (spinner) {
				$fly(spinner._dom).css("display", "none");
			}
		},
		
		/**
		 * 显示年份和月份选择器。
		 * 每个日期选择器都会对应一个年份和月份选择器。
		 * @private
		 */
		showYMPicker: function() {
			var picker = this, dom = picker._dom, ymPicker = picker._yearMonthPicker;
			if (!ymPicker && dom) {
				ymPicker = picker._yearMonthPicker = new dorado.widget.YearMonthPicker({
					style: {
						display: "none"
					},
					listener: {
						onPick: function() {
							var ymPicker = picker._yearMonthPicker, year = ymPicker.get("year"), month = ymPicker.get("month");
							picker.setYear(year, false, false);
							picker.setMonth(month, true, false);
							
							picker.hideYMPicker();
						},
						onCancel: function() {
							picker.hideYMPicker();
						}
					}
				});
				ymPicker.render(dom);
				picker.registerInnerControl(ymPicker);
			}
			
			ymPicker.updateDate(picker._date);
			
			if (!ymPicker._rendered) {
				ymPicker.render(document.body);
			}
			
			ymPicker._opened = true;
			$fly(ymPicker._dom).css("display", "").slideIn("t2b");
		},
		
		/**
		 * 隐藏日期选择器。
		 * @param {boolean} animate 是否使用动画效果。
		 * @private
		 */
		hideYMPicker: function(animate) {
			var picker = this, ymPicker = picker._yearMonthPicker;
			if (ymPicker) {
				if (animate === false) {
					$fly(ymPicker._dom).css("display", "none");
				} else {
					$fly(ymPicker._dom).slideOut("b2t");
				}
				
				ymPicker._opened = false;
				
				dorado.widget.setFocusedControl(picker);
			}
		},
		
		doOnKeyDown: function(event) {
			var picker = this, date, ymPicker = picker._yearMonthPicker;
			if (ymPicker && ymPicker._opened) {
				ymPicker.onKeyDown(event);
			} else {
				date = picker._date;
				switch (event.keyCode) {
					case 89: //Y
						if (event.ctrlKey) {
							picker.showYMPicker();
						}
						break;
					case 37://left arrow
						if (!event.ctrlKey) {
							picker.setDate("prev", true);
						} else {
							picker.setMonth("prev", true);
						}
						break;
					case 38://up arrow
						if (!event.ctrlKey) {
							picker.setDate("prevweek", true);
						} else {
							picker.setYear("prev", true);
						}
						break;
					case 39://right arrow
						if (!event.ctrlKey) {
							picker.setDate("next", true);
						} else {
							picker.setMonth("next", true);
						}
						
						break;
					case 40://down arrow
						if (!event.ctrlKey) {
							picker.setDate("nextweek", true);
						} else {
							picker.setYear("next", true);
						}
						break;
					case 13://enter
						if (picker.isDateSelectable(picker._date)) {
							picker.fireEvent("onConfirm", picker, { date: new Date(picker._date.getTime()) });
						}
						return false;
					case 27://esc
						if (ymPicker && ymPicker._opened) {
							return false;
						}
						break;
				}
			}
		}
	});
	
	/**
	 * @component Trigger
	 * @class DateDropDown
	 * @extends dorado.widget.DropDown
	 */
	dorado.widget.DateDropDown = $extend(dorado.widget.DropDown, /** @scope dorado.widget.DateDropDown.prototype */ {
		$className: "dorado.widget.DateDropDown",
		
		ATTRIBUTES: /** @scope dorado.widget.DateDropDown.prototype */ {
			width: {
				defaultValue: 260
			},
			
			iconClass: {
				defaultValue: "d-trigger-icon-date"
			},
			
			/**
			 * 是否显示TimeSpinner。
			 * @attribute
			 * @default false
			 * @type boolean
			 */
			showTimeSpinner: {
				setter: function(showTimeSpinner) {
					this._showTimeSpinner = showTimeSpinner;
					if (this._picker) this._picker.set("showTimeSpinner", showTimeSpinner);
				}
			},

			/**
			 * 是否显示今天按钮，仅在渲染前设置有效。
			 * @attribute writeBeforeReady
			 * @default true
			 * @type boolean
			 */
			showTodayButton: {
				defaultValue: true,
				path: "_picker.showTodayButton"
			},

			/**
			 * 是否显示确定按钮，仅在渲染前设置有效。
			 * @attribute writeBeforeReady
			 * @default true
			 * @type boolean
			 */
			showConfirmButton: {
				defaultValue: true,
				path: "_picker.showConfirmButton"
			},

			/**
			 * 选择模式。
			 * <p>
			 * 此属性具有如下几种取值：
			 * <ul>
			 * <li>singleDate - 单个日期选择。</li>
			 * <li>multiDate - 多个日期选择。</li>
			 * </ul>
			 * </p>
			 * @attribute
			 * @type String
			 * @default "singleDate"
			 */
			selectionMode: {
				defaultValue: "singleDate",
				path: "_picker.selectionMode"
			},

			/**
			 * DatePicker中的选中项，单选模式下请使用date属性。
			 * @type Date|Date[]
			 * @attribute
			 */
			selection: {
				path: "_picker.selection"
			}
		},

		EVENTS:  /** @scope dorado.widget.DateDropDown.prototype */ {

			/**
			 * 当日期需要判断是否可选择的时候会触发此事件。
			 * @param {Object} self 事件的发起者，即组件本身。
			 * @param {Object} arg 事件参数。
			 * @param {Date} arg.date 要过滤的日期。
			 * @param {Date} arg.selectable 该日期是否可选，默认为true，如果要过滤该日期，返回false即可。
			 * @return {boolean} 是否要继续后续事件的触发操作，不提供返回值时系统将按照返回值为true进行处理。
			 * @event
			 */
			onFilterDate: {}
		},
		
		createDropDownBox: function() {
			var dropDown = this, box = $invokeSuper.call(this, arguments), picker = new dorado.widget.DatePicker({
				showClearButton: false,
				showCancelButton: true,
				showTodayButton: this._showTodayButton,
				showConfirmButton: this._showConfirmButton,
				selectionMode: this._selectionMode,
				showTimeSpinner: this._showTimeSpinner,
				listener: {
					onPick: function(self, arg) {
						if (!dropDown._showTimeSpinner)
							dropDown.close(arg.date);
					},
					onClear: function(self) {
						dropDown.close(null);
					},
					onConfirm: function(self, arg) {
						dropDown.close(arg.date);
					},
					onCancel: function() {
						dropDown.close();
					},
					onFilterDate: function(self, arg) {
						dropDown.fireEvent("onFilterDate", dropDown, arg);
					}
				}
			});
			dropDown._picker = picker;
			
			box.set("control", picker);
			return box;
		},

		doOnEditorKeyDown: function(editor, evt) {
			var dropDown = this, retValue = true, datePicker = dropDown.get("box.control");
			if (this.get("opened")) {
				switch (evt.keyCode) {
					case 27: // esc
						dropDown.close();
						retValue = false;
						break;
					default:
						var ymPicker = datePicker._yearMonthPicker;
						if (!ymPicker || !ymPicker._opened) {
							retValue = datePicker.onKeyDown(evt);
						} else {
							retValue = ymPicker.onKeyDown(evt);
						}
						break;
				}
			}
			if (retValue) retValue = $invokeSuper.call(dropDown, arguments);
			return retValue;
		},
		
		initDropDownBox: function(box, editor) {
			var dropDown = this, datePicker = dropDown.get("box.control");
			if (datePicker) {
				var date = editor.get("value");
				if (date && date instanceof Date)
					datePicker.set("date", new Date(date.getTime()));
				else
					datePicker.set("date", new Date());

				if (datePicker._yearMonthPicker && datePicker._yearMonthPicker._opened) {
					datePicker.hideYMPicker(false);
				}
			}
		}
	});
	
	dorado.widget.View.registerDefaultComponent("defaultDateDropDown", function() {
		return new dorado.widget.DateDropDown({});
	});
	dorado.widget.View.registerDefaultComponent("defaultDateTimeDropDown", function() {
		return new dorado.widget.DateDropDown({
			showTimeSpinner: true
		});
	});
})();

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

	var operatorItemsInited = false;
	var operators = ["like", "like*", "*like", "=", "<>", ">", ">=", "<", "<="], operatorsForParse = ["like", "like*", "*like", "=", ">", ">=", "<", "<=", "<>"];
	var operatorItems = [];
	
	function getOperatorItems() {
		if (!operatorItemsInited) {
			operatorItemsInited = true;
			var texts = $resource("dorado.grid.FilterExpressionOperators").split(',');
			for (var i = 0; i < operators.length; i++) {
				var operator = operators[i];
				operatorItems.push({
					key: operator,
					value: texts[i]
				});
			}
		}
		return operatorItems;
	}
	
	var numberTypeCodes = [dorado.DataType.INTEGER, dorado.DataType.PRIMITIVE_INT, dorado.DataType.FLOAT, dorado.DataType.PRIMITIVE_FLOAT, dorado.DataType.DATE, dorado.DataType.TIME, dorado.DataType.DATETIME];
	var mappingOperatorDropDown, numberOperatorDropDown, stringOperatorDropDown, booleanOperatorDropDow;
	
	function getOperatorDropDown(column) {
		var dropDown, operatorItems = getOperatorItems();
		var pd = column._propertyDef;
		if (pd && pd._mapping) {
			if (!mappingOperatorDropDown) {
				mappingOperatorDropDown = new dorado.widget.ListDropDown({
					items: operatorItems.slice(3, 5),
					property: "key",
					displayProperty: "value",
					autoOpen: true
				});
			}
			dropDown = mappingOperatorDropDown;
		} else {
			var dataType = column.get("dataType");
			
			if (dataType && dataType._code) {
				if (numberTypeCodes.indexOf(dataType._code) >= 0) {
					if (!numberOperatorDropDown) {
						numberOperatorDropDown = new dorado.widget.ListDropDown({
							items: operatorItems.slice(3),
							property: "key",
							displayProperty: "value",
							autoOpen: true
						});
					}
					dropDown = numberOperatorDropDown;
				} else if ([dorado.DataType.PRIMITIVE_BOOLEAN, dorado.DataType.BOOLEAN].indexOf(dataType._code) >= 0) {
					if (!booleanOperatorDropDow) {
						booleanOperatorDropDow = new dorado.widget.ListDropDown({
							items: operatorItems.slice(3, 5),
							property: "key",
							displayProperty: "value",
							autoOpen: true
						});
					}
					dropDown = booleanOperatorDropDow;
				}
			}
			
			if (!dropDown) {
				stringOperatorDropDown = new dorado.widget.ListDropDown({
					items: operatorItems.slice(0, 5),
					property: "key",
					displayProperty: "value",
					autoOpen: true
				});
				dropDown = stringOperatorDropDown;
			}
		}
		return dropDown;
	}
	
	var booleanMapping;
	function getBooleanMapping() {
		if (!booleanMapping) {
			booleanMapping = [{
				key: true,
				value: $resource("dorado.core.BooleanTrue")
			}, {
				key: false,
				value: $resource("dorado.core.BooleanFalse")
			}];
		}
		return booleanMapping;
	}
	
	function splitCriterions(text, column) {
		var criterions = [], criterion = "", contentBegin = false, contentEnd = false, inQuote = false, escape = false;
		var c;
		for (var i = 0, len = text.length; i < len; i++, escape = false) {
			c = text.charAt(i);
			if (c === ',' || c === ';') {
				if (contentBegin) {
					if (!inQuote) {
						if (operators.indexOf(criterion) < 0) {
							criterions.push(criterion);
							criterion = "";
							contentBegin = false;
							contentEnd = false;
							inQuote = false;
						}
						continue;
					}
				} else {
					continue;
				}
			} else if (c === '\\') {
				escape = true;
			} else if ((c === '\'' || c === '"') && !escape) {
				if (!inQuote) {
					inQuote = c;
					continue;
				} else if (c === inQuote) {
					contentEnd = true;
					inQuote = null;
					continue;
				}
			} else if (contentEnd) {
				throw new dorado.ResourceException("dorado.grid.InvalidFilterExpression", text);
			}
			criterion += c;
			contentBegin = true;
		}
		
		if (criterion) {
			criterions.push(criterion);
		}
		return criterions;
	}
	
	function parseSingleCriterion(criterionText, column) {
		var criterion = {};
		for (var i = operatorsForParse.length - 1; i >= 0; i--) {
			var operator = operatorsForParse[i];
			if (criterionText.startsWith(operator)) {
				criterion.operator = operator;
				criterion.value = criterionText.substring(operator.length);
				break;
			}
		}
		
		if (!criterion.operator) {
			var defaultOperator = dorado.widget.grid.DataColumn.getDefaultOperator(column), len = criterionText.length;
			if (len > 1) {
				var firstChar = criterionText.charAt(0), lastChar = criterionText.charAt(len - 1);
				if (len > 2 && criterionText.charAt(len - 2) == '\\') {
					lastChar = 0;
				}
				
				if (firstChar != '*' && firstChar != '%') {
					firstChar = 0;
				}
				if (lastChar != '*' && lastChar != '%') {
					lastChar = 0;
				}
				
				if (firstChar) {
					if (lastChar) {
						if (len > 2) {
							criterion.operator = "like";
							criterion.value = criterionText.substring(1, len - 1);
						} else {
							criterion.operator = "=";
							criterion.value = criterionText;
						}
					} else {
						criterion.operator = "*like";
						criterion.value = criterionText.substring(1);
					}
				} else if (lastChar) {
					criterion.operator = "like*";
					criterion.value = criterionText.substring(0, len - 1);
				}
			}
			
			if (!criterion.operator) {
				criterion.operator = defaultOperator;
				criterion.value = criterionText;
			}
		}
		
		criterion.property = column._property;
		if (criterion.value && criterion.value.indexOf('\\') >= 0) {
			criterion.value = eval('"' + criterion.value + '"');
		}
		
		var pd = column._propertyDef;
		if (pd) {
			criterion.propertyPath = pd._propertyPath;
			if (pd._mapping) {
				criterion.value = pd.getMappedKey(criterion.value);
			}
		}
		
		var dataType = column.get("dataType");
		if (dataType) {
			criterion.value = dataType.parse(criterion.value, column.get("displayFormat"));
		}
		return criterion;
	}
	
	dorado.widget.grid.DataColumn.getDefaultOperator = function(column) {
		if (column._defaultFilterOperator) return column._defaultFilterOperator;
		
		var dataType = column.get("dataType"), pd = column._propertyDef;
		if (pd && pd._mapping || dataType &&
			(dataType._code && numberTypeCodes.indexOf(dataType._code) >= 0 || [dorado.DataType.PRIMITIVE_BOOLEAN, dorado.DataType.BOOLEAN].indexOf(dataType._code) >= 0)) {
			return "=";
		} else {
			return "like";
		}
	};	
	
	dorado.widget.grid.DataColumn.parseCriterion = function(text, column) {
		
		function parseCriterions(text, column) {
			var criterions = [], criterionTexts = splitCriterions(text, column);
			for (var i = 0; i < criterionTexts.length; i++) {
				criterions.push(parseSingleCriterion(jQuery.trim(criterionTexts[i]), column));
			}
			return criterions;
		};
		
		text = jQuery.trim(text);
		if (!text) return null;
		var criterion = {};
		if (text.charAt(0) == '[' && text.charAt(text.length - 1) == ']') {
			criterion.junction = "or";
			text = text.substring(1, text.length - 1);
		}
		else {
			criterion.junction = "and";
		}
		criterion.criterions = parseCriterions(text, column);
		return criterion;
	};
	
	dorado.widget.grid.DataColumn.criterionToText = function(criterion, column) {
		
		function criterionsToText(criterions, column) {
			var text = "", pd = column._propertyDef, dataType = column.get("dataType");		
			var defaultOperator = dorado.widget.grid.DataColumn.getDefaultOperator(column);	
			for (var i = 0; i < criterions.length; i++) {
				var criterion = criterions[i], operator = criterion.operator;
				if (!criterion.value && criterion.value != 0) continue;
				if (text != "") text += ", ";
				
				if (operator && operator != defaultOperator && operator.indexOf("like") < 0) {
					text += operator;
				}
				
				var valueText;
				if (pd && pd._mapping) {
					valueText = pd.getMappedValue(criterion.value);
				} else {
					var dataType = column.get("dataType");
					if (dataType) {
						valueText = dataType.toText(criterion.value, column.get("typeFormat"));
					} else {
						valueText = criterion.value + '';
					}
				}
				
				if (operator && operator != defaultOperator) {
					if (operator.startsWith("like")) {
						valueText = valueText + '*';
					}
					if (operator.endsWith("like")) {
						valueText = '*' + valueText;
					}
				}
				
				if (typeof valueText == "string" &&
					(valueText.indexOf(',') >= 0 || valueText.indexOf(';') >= 0)) {
					text += ('"' + valueText + '"');
				} else {
					text += valueText;
				}
			}
			return text;
		}
		
		if (!criterion) return null;
		var text = "";
		if (criterion.junction == "or") text += "[ ";
		text += criterionsToText(criterion.criterions, column);
		if (criterion.junction == "or") text += " ]";
		return text;
	};
	
	/**
	 * @author Benny Bao (mailto:benny.bao@bstek.com)
	 * @component Trigger
	 * @class 自定义下拉框。
	 * @extends dorado.widget.DropDown
	 */
	dorado.widget.grid.CriterionDropDown = $extend(dorado.widget.DropDown, /** @scope dorado.widget.grid.CriterionDropDown.prototype */ {
		$className: "dorado.widget.grid.CriterionDropDown",
		
		ATTRIBUTES: /** @scope dorado.widget.grid.CriterionDropDown.prototype */ {
			maxWidth: {
				defaultValue: 330
			},
			
			/**
			 * 是否支持多个匹配条件。
			 * @type boolean
			 * @default true
			 * @attribute
			 */
			supportsMultiCriterions: {
				defaultValue: true
			},
			
			/**
			 * 是否支持连接条件。
			 * @type boolean
			 * @default true
			 * @attribute
			 */
			supportsJunction: {
				defaultValue: true
			},
			
			/**
			 * 是否可支持的比较操作符的数组。
			 * <p>
			 * 可选的比较操作符包括：like, like*, *like, =, <>, >, >=, <, <=
			 * </p>
			 * @type String[]
			 * @attribute
			 */
			avialableOperators: {				
			},
			
			criterion: {
				defaultValue: [],
				setter: function(criterion) {
					criterion = criterion || {};
					var criterion = this._criterion = dorado.Core.clone(criterion, true);
					if (!criterion.criterions) criterion.criterions = [];
					var criterions = criterion.criterions;
					for (var i = 0; i < criterions.length; i++) {
						var c = criterions[i];
						if (!c.id) c.id = dorado.Core.newId();
					}
				}
			}
		},
		
		constructor: function() {
			this._criterionMap = {};
			this._criterionControlCache = [];
			$invokeSuper.call(this, arguments);
		},
		
		destroy: function() {
			for (var i = 0; i < this._criterionControlCache.length; i++) {
				var criterionControl = this._criterionControlCache[i];
				if (!criterionControl._destroyed) criterionControl.destroy();
			}
			$invokeSuper.call(this);
		},
		
		createDropDownBox: function() {
			var dropdown = this, box = $invokeSuper.call(dropdown, arguments);
			
			var containerElement = box.get("containerDom"), doms = {};
			$fly(containerElement).xCreate({
				tagName: "DIV",
				className: "d-criterion-panel",
				content: [{
					tagName: "DIV",
					contextKey: "criterionsContainer"
				}, {
					tagName: "TABLE",
					style: {
						width: "100%"
					},
					content: {
						tagName: "TR",
						content: [{
							tagName: "TD",
							contextKey: "junctionContainer"
						}, {
							tagName: "TD",
							className: "d-buttons-container",
							contextKey: "buttonsContainer",
							style: {
								width: 150
							}
						}]
					}
				}]
			}, null, {
				context: doms
			});
			dropdown._criterionsContainer = doms.criterionsContainer;
			
			if (dropdown._supportsJunction && dropdown._supportsMultiCriterions) {
				var junctionRadio = new dorado.widget.RadioGroup({
					value: "and",
					radioButtons: [{
						value: "and",
						text: $resource("dorado.core.And")
					}, {
						value: "or",
						text: $resource("dorado.core.Or")
					}],
					onPost: function(self) {
						dropdown._criterion.junction = self.get("value");
					}
				});
				box.registerInnerControl(junctionRadio);
				junctionRadio.render(doms.junctionContainer);
				dropdown._junctionRadio = junctionRadio;
			}
			
			if (this._supportsMultiCriterions) {
				var addButton = new dorado.widget.Button({
					iconClass: "d-icon-add",
					style: "margin-right:2px",
					onClick: function() {
						dropdown.addCriterion(box);
					}
				});
				box.registerInnerControl(addButton);
				addButton.render(doms.buttonsContainer);
			}
			
			var okButton = new dorado.widget.Button({
				caption: $resource("dorado.baseWidget.MessageBoxButtonOK"),
				onClick: function() {
					var editor = dropdown._editor, column = editor._cellColumn, criterion = dropdown._criterion, grid = column._grid;
					var text = dorado.widget.grid.DataColumn.criterionToText(criterion, column);
					dropdown.close(text);
					grid.filter();
				}
			});
			box.registerInnerControl(okButton);
			okButton.render(doms.buttonsContainer);
			
			return box;
		},
		
		open: function(editor) {
			editor.post();
			var column = editor._cellColumn, grid = column._grid;
			var filterEntity = grid.get("filterEntity");
			var criterion = filterEntity.get(column._property);
			if (criterion && criterion instanceof Array) {
				criterion = {
					junction: "and",
					criterions: criterion
				};
			}
			this.set("criterion", criterion);
			
			return $invokeSuper.call(this, arguments);
		},
		
		initDropDownBox: function(box, editor) {
			$invokeSuper.call(this, arguments);
			
			var dropdown = this, criterion = dropdown._criterion, criterions = criterion.criterions, criterionsContainer = dropdown._criterionsContainer, i = 0;
			var column = editor._cellColumn;
			
			if (criterions.length == 0) {
				criterions.push({
					id: dorado.Core.newId(),
					operator: dorado.widget.grid.DataColumn.getDefaultOperator(column)
				});
			}
			
			criterions.each(function(criterion) {
				var criterionControl, criterionDom = criterionsContainer.childNodes[i];
				if (criterionDom) {
					criterionControl = dorado.widget.Control.findParentControl(criterionDom, CriterionControl);
				}
				if (criterionControl) {
					criterionControl.set({
						column: column,
						criterion: criterion
					});
				} else {
					criterionControl = dropdown.getCriterionControl(box, criterion);
					criterionControl.render(dropdown._criterionsContainer);
				}
				dropdown._criterionMap[criterion.id] = criterionControl;
				i++;
			});
			
			var criterionControls = criterionsContainer.childNodes, criterionControlsNum = criterionControls.length;
			for (; i < criterionControlsNum; i++) {
				var criterionControl = dorado.widget.Control.findParentControl(criterionsContainer.lastChild, CriterionControl);
				var criterion = criterionControl._criterion;
				delete dropdown._criterionMap[criterion.id];
				criterionControl.unrender();
				dropdown._criterionControlCache.push(criterionControl);
			}
			
			if (dropdown._junctionRadio) {
				dropdown._junctionRadio.set("value", criterion.junction || "and");
			}
		},
		
		getCriterionControl: function(box, criterion) {
			var criterionControl = this._criterionControlCache.pop();
			if (!criterionControl) {
				criterionControl = new CriterionControl(this, box);
			}
			
			var column = box._editor._cellColumn;
			criterionControl.set({
				column: column,
				criterion: criterion
			});
			return criterionControl;
		},
		
		addCriterion: function(box) {
			var dropdown = this, column = box._editor._cellColumn, criterion = {
				id: dorado.Core.newId(),
				operator: dorado.widget.grid.DataColumn.getDefaultOperator(column)
			};
			var criterionControl = dropdown.getCriterionControl(box, criterion);
			criterionControl.render(dropdown._criterionsContainer);
			dropdown._criterionMap[criterion.id] = criterionControl;
			dropdown._criterion.criterions.push(criterion);
			
			dropdown.locate();
		},
		
		removeCriterion: function(box, criterion) {
			var dropdown = this, criterionControl = dropdown._criterionMap[criterion.id];
			criterionControl.unrender();
			dropdown._criterionControlCache.push(criterionControl);
			delete dropdown._criterionMap[criterion.id];
			dropdown._criterion.criterions.remove(criterion);
			
			dropdown.locate();
			
			setTimeout(function() {
				if (dropdown._criterion.criterions.length == 0) {
					dropdown.addCriterion(box);
				}
			}, 100);
		}
	});
	
	var CriterionControl = $extend(dorado.widget.Control, {
		$className: "dorado.widget.grid.CriterionControl",
		
		ATTRIBUTES: {
			column: {},
			
			criterion: {}
		},
		
		constructor: function(dropDown, dropDownBox) {
			$invokeSuper.call(this);
			
			this._dropDown = dropDown;
			this._dropDownBox = dropDownBox;
			dropDownBox.registerInnerControl(this);
		},
		
		createDom: function() {
			var criterionControl = this, doms = {}, dom = $DomUtils.xCreate({
				tagName: "TABLE",
				className: "d-criterion",
				content: {
					tagName: "TR",
					content: [{
						tagName: "TD",
						className: "operator-container",
						contextKey: "operatorContainer"
					}, {
						tagName: "TD",
						className: "value-container",
						contextKey: "valueContainer"
					}, {
						tagName: "TD",
						className: "button-container",
						contextKey: "buttonContainer"
					}]
				}
			}, null, doms);
			
			var dropDownBox = criterionControl._dropDownBox;
			var operatorEditor = criterionControl._operatorEditor = new dorado.widget.TextEditor({
				width: 100,
				mapping: getOperatorItems(),
				onPost: function(self) {
					criterionControl._criterion.operator = self.get("value");
				}
			});
			criterionControl.registerInnerControl(operatorEditor);
			operatorEditor.render(doms.operatorContainer);
			
			var valueEditor = criterionControl._valueEditor = new dorado.widget.TextEditor({
				width: 180,
				onPost: function(self) {
					criterionControl._criterion.value = self.get("value");
				}
			});
			criterionControl.registerInnerControl(valueEditor);
			valueEditor.render(doms.valueContainer);
			
			var delButton = criterionControl._delButton = new dorado.widget.SimpleButton({
				className: "delete-button",
				onClick: function() {
					var dropdown = criterionControl._dropDown, criterion = criterionControl._criterion;
					dropdown.removeCriterion(dropDownBox, criterion);
				}
			});
			criterionControl.registerInnerControl(delButton);
			delButton.render(doms.buttonContainer);
			
			this._doms = doms;
			return dom;
		},
		
		refreshDom: function(dom) {
			$invokeSuper.call(this, [dom]);
			
			var column = this._column, pd = column._propertyDef;
			var dataType = column.get("dataType"), dtCode = dataType ? dataType._code : -1;
			var trigger = column.get("trigger"), mapping = null, displayFormat = column.get("displayFormat"), typeFormat = column.get("typeFormat");
			if (!dtCode || (pd && pd._mapping)) dataType = undefined;
			
			var operatorEditor = this._operatorEditor, valueEditor = this._valueEditor, doms = this._doms;
			
			var operatorDropDown = getOperatorDropDown(column);
			if (this._avialableOperators) {
				var operatorItems = operatorDropDown.get("items"), newItems = [];
				for (var i = 0; i < operatorItems.length; i++) {
					var operatorItem = operatorItems[i];
					if (this._avialableOperators.indexOf(operatorItem.key) >= 0) {
						newItems.push(operatorItem);
					}					
				}
				
				operatorDropDown = this._operatorDropDown;
				if (!operatorDropDown) {
					this._operatorDropDown = operatorDropDown = new dorado.widget.ListDropDown({
						items: newItems,
						property: "key",
						displayProperty: "value",
						autoOpen: true
					});
				}
			}
			
			operatorEditor.set({
				trigger: operatorDropDown,
				value: this._criterion && this._criterion.operator
			});
			
			if (!trigger) {
				if (pd && pd._mapping) {
					trigger = "autoMappingDropDown2";
					mapping = pd._mapping;
				} else if (dtCode == dorado.DataType.PRIMITIVE_BOOLEAN) {
					trigger = "autoOpenMappingDropDown1";
					mapping = getBooleanMapping();
				} else if (dtCode == dorado.DataType.BOOLEAN) {
					trigger = "autoOpenMappingDropDown2";
					mapping = getBooleanMapping();
				} else if (dtCode == dorado.DataType.DATE) {
					trigger = "defaultDateDropDown";
				} else if (dtCode == dorado.DataType.DATETIME) {
					trigger = "defaultDateTimeDropDown";
				}
			} else if (pd && pd._mapping) {
				mapping = pd._mapping;
			}
			
			valueEditor.set({
				dataType: dataType || null,
				displayFormat: displayFormat,
				typeFormat: typeFormat,
				trigger: trigger,
				mapping: mapping,
				editable: column._editable
			}, {
				skipUnknownAttribute: true,
				tryNextOnError: true
			});
			valueEditor.set("value", this._criterion && this._criterion.value);
		}
	});
	
	dorado.widget.View.registerDefaultComponent("defaultCriterionDropDown", function() {
		return new dorado.widget.grid.CriterionDropDown();
	});
	
})();






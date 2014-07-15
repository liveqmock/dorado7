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
 * @class 用于与数据实体中某个属性进行绑定的数据控件的基类。
 * <p>
 * 此种的数据控件的dataPath属性默认为"#"，表示与数据集中当前数据实体进行绑定。 主要用于跟DataSet中数据实体{@link dorado.Entity}的某个属性进行绑定。
 * </p>
 * @abstract
 * @extends dorado.widget.DataControl
 */
dorado.widget.PropertyDataControl = $extend(dorado.widget.DataControl, /** @scope dorado.widget.PropertyDataControl.prototype */ {
	$className: "dorado.widget.PropertyDataControl",
	
	ATTRIBUTES: /** @scope dorado.widget.PropertyDataControl.prototype */ {
	
		/**
		 * 数据路径，用于指定数据控件与数据集中的哪些数据节点进行关联。
		 * @type String
		 * @attribute
		 * @default "#"
		 * @see dorado.DataPath
		 */
		dataPath: {
			defaultValue: '#',
			setter: function(dataPath) {
				this._dataPath = this._realDataPath = dataPath;
				this.processComplexProperty();
			}
		},
		
		/**
		 * 数据控件绑定的属性名。
		 * @type String
		 * @attribute
		 * @see dorado.DataPath
		 */
		property: {
			setter: function(property) {
				this._property = this._realProperty = property;
				this.processComplexProperty();
			}
		}
	},
	
	processComplexProperty: function() {
		var dataPath = this._realDataPath;
		var property = this._realProperty;
		if (property) {
			var i = property.lastIndexOf('.');
			if (i > 0 && i < property.length - 1) {
				var property1 = property.substring(0, i);
				var property2 = property.substring(i + 1);
				if (dataPath) {
					dataPath += ('.' + property1);
				} else {
					dataPath = "#." + property1;
				}
				this._dataPath = dataPath;
				this._property = property2;
			}
		}
	},
	
	filterDataSetMessage: function(messageCode, arg, data) {
		var b = true;
		switch (messageCode) {
			case dorado.widget.DataSet.MESSAGE_DATA_CHANGED:
				b = (arg.property == this._property)
				if (!b) {
					var bindingData = this.getBindingData();
					b = (bindingData == arg.newValue) || dorado.DataUtil.isOwnerOf(bindingData, arg.newValue);
				}
				break;
			case dorado.widget.DataSet.MESSAGE_DELETED:
			case dorado.widget.DataSet.MESSAGE_INSERTED:
				b = false;
				break;
		}
		return b;
	},
	
	getBindingData: function(options) {
		var realOptions = {
			firstResultOnly: true,
			acceptAggregation: false
		};
		if (typeof options == "String") {
			realOptions.loadMode = options;
		} else {
			dorado.Object.apply(realOptions, options);
		}
		return $invokeSuper.call(this, [realOptions]);
	},
	
	getBindingPropertyDef: function() {
		if (!this._property) return null;
		
		var entityDataType = this.getBindingDataType(), pd;
		if (entityDataType) {
			var properties = this._property.split('.'), i = 0;
			while (entityDataType) {
				pd = entityDataType.getPropertyDef(properties[i]);
				if (pd) {
					if (i == properties.length - 1) {
						break;
					} else {
						entityDataType = pd.getDataType();
						if (!entityDataType || !(entityDataType instanceof dorado.EntityDataType)) {
							pd = null;
							break;
						}
					}
				}
				else {
					break;
				}
				i++;
			}
		}
		return pd;
	},
	
	getBindingPropertyValue: function() {
		var entity = this.getBindingData();
		return (entity) ? entity.get(this._property) : null;
	},
	
	getBindingPropertyText: function() {
		var entity = this.getBindingData();
		return (entity) ? entity.getText(this._property) : '';
	}
});

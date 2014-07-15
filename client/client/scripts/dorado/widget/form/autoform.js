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
 * @name dorado.widget.autoform
 * @namespace 自动表单所使用的一些相关类的命名空间。
 */
dorado.widget.autoform = {};

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @class 自动表单中的表单元素。
 * <p>此控件一般不应被单独使用，而应该与AutoForm控件配合使用。</p>
 * @extends dorado.widget.FormElement
 * @see dorado.widget.AutoForm
 */
dorado.widget.autoform.AutoFormElement = $extend(dorado.widget.FormElement, /** @scope dorado.widget.autoform.AutoFormElement.prototype */ {
	$className: "dorado.widget.autoform.AutoFormElement",

	ATTRIBUTES: /** @scope dorado.widget.autoform.AutoFormElement.prototype */ {

		width: {
			independent: false
		},

		/**
		 * 表单元素的名称。
		 * @type String
		 * @attribute writeOnce
		 */
		name: {
			writeOnce: true,
			setter: function(name) {
				this._name = name;
				if (name && !this.getAttributeWatcher().getWritingTimes("property") && !name.startsWith("_unnamed")) {
					this._property = name;
				}
			}
		}
	}
});

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @component Form
 * @class 自动表单。
 * <p>
 * AutoForm的get方法在{@link dorado.AttributeSupport#get}的基础上做了增强。
 * 除了原有的读取属性值的功能之外，此方法还另外提供了下面的用法。
 * <ul>
 *    <li>当传入一个以#开头的字符串时，#后面的内容将被识别成AutoFormElement的名称，表示根据名称获取AutoFormElement。参考{@link dorado.widget.AutoForm#getElement}。</li>
 * </ul>
 * </p>
 * @extends dorado.widget.Control
 * @extends dorado.widget.FormProfile
 * @extends dorado.widget.FormProfileSupport
 */
dorado.widget.AutoForm = $extend([dorado.widget.Control, dorado.widget.FormProfile, dorado.widget.FormProfileSupport], /** @scope dorado.widget.AutoForm.prototype */ {
	$className: "dorado.widget.AutoForm",

	ATTRIBUTES: /** @scope dorado.widget.AutoForm.prototype */ {

		className: {
			defaultValue: "d-auto-form"
		},

		/**
		 * 绑定的表单配置。
		 * @type dorado.widget.FormPorfile
		 * @attribute
		 */
		formProfile: {
			componentReference: true,
			setter: function(formProfile) {
				if (this._formProfile === formProfile) return;

				if (dorado.Object.isInstanceOf(this._formProfile, dorado.widget.FormProfile)) {
					this._formProfile.removeBindingElement(this);
				}
				this._formProfile = formProfile;
				if (dorado.Object.isInstanceOf(formProfile, dorado.widget.FormProfile)) {
					formProfile.addBindingElement(this);
					this.onProfileChange();
				}
			}
		},

		/**
		 * 表单布局的分栏方式。
		 * @type String
		 * @attribute
		 * @see dorado.widget.layout.FormLayout#attribute:cols
		 */
		cols: {
			skipRefresh: true,
			setter: function(cols) {
				this._cols = cols;
				if (this._rendered) this.refreshFormLayout();
			}
		},

		/**
		 * 默认的行高。
		 * @type int
		 * @attribute
		 * @default 22
		 * @see dorado.widget.layout.FormLayout#attribute:rowHeight
		 */
		rowHeight: {
			defaultValue: 22
		},

		/**
		 * 表单列之间的留白大小。像素值。
		 * @type int
		 * @attribute
		 * @default 6
		 * @see dorado.widget.layout.FormLayout#attribute:colPadding
		 */
		colPadding: {
			defaultValue: 6
		},

		/**
		 * 表单行之间的留白大小。像素值。
		 * @type int
		 * @attribute
		 * @default 6
		 * @see dorado.widget.layout.FormLayout#attribute:rowPadding
		 */
		rowPadding: {
			defaultValue: 6
		},

		/**
		 * 是否将表单的宽度自动扩展为撑满容器。
		 * @type boolean
		 * @attribute
		 * @see dorado.widget.layout.FormLayout#attribute:stretchWidth
		 */
		stretchWidth: {},

		/**
		 * 表单四周的留白大小。像素值。
		 * @type int
		 * @default 8
		 * @attribute
		 * @see dorado.widget.layout.FormLayout#attribute:padding
		 */
		padding: {
			defaultValue: 8
		},

		/**
		 * 此属性只影响自动创建表单元素的功能，即我们可以指定一个实体数据类型让表单根据此数据类型自动创建其中的表单元素。
		 * @type dorado.data.EntityDataType
		 * @attribute
		 * @see dorado.widget.AutoForm#attribute:autoCreateElements
		 */
		dataType: {
			getter: dorado.LazyLoadDataType.dataTypeGetter
		},

		/**
		 * 是否自动根据绑定的EntityDataType自动创建其中的表单元素。
		 * @type boolean
		 * @attribute
		 */
		autoCreateElements: {},

		/**
		 * 表单元素的集合。
		 * <p>
		 * 此属性在读取和写入时的数据类型是不同的。
		 * <ul>
		 * <li>在写入时应该传入一个表单元素数组或包含表单元素配置信息的数组。</li>
		 * <li>在读取时此方法返回一个包含所有表单元素的{@link dorado.util.KeyedArray}集合。</li>
		 * <li></li>
		 * </ul>
		 * </p>
		 * @type Control[]|dorado.util.KeyedArray
		 * @attribute skipRefresh
		 */
		elements: {
			skipRefresh: true,
			setter: function(elements) {
				if (this._rendered) {
					var container = this._container, layout;
					if (container) {
						layout = container.get("layout");
						layout.disableRendering();
					}
					try {
						if (container) {
							this._elements.each(function(element) {
								container.removeChild(element);
							});
						}
						this._elements.clear();

						if (!elements) return;
						for(var i = 0; i < elements.length; i++) {
							this.addElement(elements[i]);
						}
					}
					finally {
						if (container) {
							layout.enableRendering();
							container.refresh(true);
						}
					}
				}
				else {
					this._elementConfigs = elements;
				}
			}
		},

		/**
		 * 是否要自动创建一个私有的Entity，否则AutoForm将尝试使用关联的FormProfile中的Entity。
		 * <p>
		 * 此属性在createPrivateDataSet为true时将失去意义。
		 * </p>
		 * @boolean
		 * @attribute
		 * @default true
		 */
		createOwnEntity: {
			defaultValue: true
		},

		/**
		 * 是否要在AutoForm没有实际绑定DataSet时自动创建一个私有的DataSet用于管理表单数据。
		 * <p>
		 * 由于Dorado中有很多类似于数据校验、键值映射这样的功能都依赖于DataSet，所以如果仅仅使用简单的Entity绑定，AutoForm必然是失去一些功能特性。
		 * 启用本属性可以让AutoForm自动创建一个私有的DataSet，以便于使用上述各项功能。
		 * </p>
		 * @boolean
		 * @attribute writeBeforeReady
		 */
		createPrivateDataSet: {
			writeBeforeReady: true
		},

		entity: {
			getter: function() {
				if (this._dataSet && this._dataSet._ready) {
					var entity = this._dataSet.getData(this._dataPath, {
						loadMode: "auto",
						firstResultOnly: true
					});
					if (entity && entity instanceof dorado.EntityList) {
						entity = entity.current;
					}
					return entity;
				}
				else {
					return this._entity;
				}
			},
			setter: function(entity) {
				if (this._dataSet && this._dataSet._ready && this._dataSet.get("userData") == "autoFormPrivateDataSet") {
					this._dataSet.set("data", entity);
				}
				else {
					this._entity = entity;
				}
			}
		}
	},

	constructor: function() {
		var autoform = this;
		autoform._elements = new dorado.util.KeyedArray(function(element) {
			return (element instanceof dorado.widget.autoform.AutoFormElement) ? element._name : element._id;
		});

		var container = autoform._container = new dorado.widget.Container({
			layout: "Form",
			contentOverflow: "visible",
			style: {
				width: "100%",
				height: "100%"
			}
		});
		var ie7 = (dorado.Browser.msie && dorado.Browser.version <= 7);
		if (ie7) {
			container.get("style").height = "auto";
		}

		var notifySizeChange = container.notifySizeChange;
		container.notifySizeChange = function() {
			notifySizeChange.apply(container, arguments);
			autoform.notifySizeChange.apply(autoform, arguments);
		}

		autoform.registerInnerControl(autoform._container);
		autoform._bindingElements = new dorado.ObjectGroup();

		autoform._skipOnCreateListeners = (autoform._skipOnCreateListeners || 0) + 1;
		$invokeSuper.call(autoform, arguments);
		autoform._skipOnCreateListeners--;

		if (autoform._createOwnEntity && autoform.getAttributeWatcher().getWritingTimes("entity") == 0) {
			var defaultEntity = new dorado.widget.FormProfile.DefaultEntity();
			autoform.set("entity", defaultEntity);
		}

		if (autoform._elementConfigs) {
			var configs = autoform._elementConfigs;
			for(var i = 0; i < configs.length; i++) {
				autoform.addElement(configs[i]);
			}
			delete autoform._elementConfigs;
		}

		autoform.bind("onAttributeChange", function(self, arg) {
			var attr = arg.attribute;
			if (attr == "readOnly") {
				var readOnly = self._readOnly, objects = self._bindingElements.objects;
				for(var i = 0; i < objects.length; i++) {
					var object = objects[i];
					if (object instanceof dorado.widget.FormElement) {
						object._realReadOnly = readOnly;
						object.resetEditorReadOnly();
					}
				}
			}
			else if (!dorado.widget.Control.prototype.ATTRIBUTES[attr] &&
				dorado.widget.FormConfig.prototype.ATTRIBUTES[attr]) {
				if (self._config) delete self._config;
				dorado.Toolkits.setDelayedAction(self, "$profileChangeTimerId", function() {
					self._bindingElements.invoke("onProfileChange");
				}, 20);
			}
		});

		if (!(autoform._skipOnCreateListeners > 0) && autoform.getListenerCount("onCreate")) {
			autoform.fireEvent("onCreate", autoform);
		}
	},

	doGet: function(attr) {
		var c = attr.charAt(0);
		if (c == '#' || c == '&') {
			var elementName = attr.substring(1);
			return this.getElement(elementName);
		}
		else {
			return $invokeSuper.call(this, [attr]);
		}
	},

	addBindingElement: function(element) {
		if (!this._privateDataSetInited) {
			this._privateDataSetInited = true;

			if (!this._dataSet && this._createPrivateDataSet) {
				var dataType = this.get("dataType");
				var dataSet = new dorado.widget.DataSet({
					dataType: dataType,
					userData: "autoFormPrivateDataSet",
					onReady: {
						listener: function(self) {
							self.insert();
						},
						options: {
							once: true
						}
					}
				});
				var parentControl = this.get("parent") || $topView;
				if (parentControl && parentControl instanceof dorado.widget.Container) {
					parentControl.addChild(dataSet);
				}
				dataSet.onReady();
				this.set({
					dataSet: dataSet,
					dataPath: null
				});
			}
		}

		$invokeSuper.call(this, [element]);
	},

	/**
	 * 添加一个表单元素。
	 * @param {Object|dorado.widget.Control} element 表单元素或可用于创建表单元素的JSON对象。
	 * @return {dorado.widget.Control} 新添加的表单元素。
	 */
	addElement: function(element) {
		var elements = this._elements, config = {}, constraint;
		if (!config.name) {
			var name = config.property || "_unnamed";
			if (elements.get(name)) {
				var j = 2;
				while(elements.get(name + '_' + j)) {
					j++;
				}
				name = name + '_' + j;
			}
			config.name = name;
		}

		if (!(element instanceof dorado.widget.Control)) {
			dorado.Object.apply(config, element);
			if (element) {
				constraint = element._layoutConstraint;
				element = this.createInnerComponent(config, function(type) {
					if (!type) return dorado.widget.autoform.AutoFormElement;
				});
			}
			else {
				element = new dorado.widget.Control(config);
			}
		}
		element.set("formProfile", this, {
			skipUnknownAttribute: true,
			tryNextOnError: true,
			preventOverwriting: true,
			lockWritingTimes: true
		});
		elements.append(element);

		if (this._container) this._container.addChild(element);
		return element;
	},

	/**
	 * 移除一个的表单元素。
	 * @param {dorado.widget.Control} element 移除的表单元素。
	 */
	removeElement: function(element) {
		this._elements.remove(element);
		if (this._container) this._container.removeChild(element);
	},

	/**
	 * 根据名称或序号获得一个的表单元素。
	 * @param {String|int} name 表单元素的名称或序号（自0开始）。
	 * @return {dorado.widget.Control} 表单元素。
	 */
	getElement: function(name) {
		return this._elements.get(name);
	},

	createDom: function() {
		var attrWatcher = this.getAttributeWatcher();
		if (!this._formProfile && attrWatcher.getWritingTimes("formProfile") == 0) {
			var view = this.get("view") || dorado.widget.View.TOP;
			this.set("formProfile", view.id("defaultFormProfile"));
		}
		return $invokeSuper.call(this, arguments);
	},

	refreshDom: function(dom) {
		$invokeSuper.call(this, arguments);

		var container = this._container;
		if (!container._rendered) {
			if (this._autoCreateElements && !this._defaultElementsGenerated) {
				this.generateDefaultElements();
			}
			this.initLayout(container.get("layout"));
			container.render(dom);
		}
	},

	doOnResize: function() {
		var dom = this.getDom(), container = this._container;
		// container._realWidth = dom.offsetWidth;
		// container._realHeight = dom.offsetHeight;
		container.onResize();
	},

	refreshFormLayout: function() {
		var container = this._container, layout = container.get("layout");
		container.refresh();
		this.initLayout(layout);
		layout.refresh();
	},

	initLayout: function(layout) {
		configs = {};
		if (this._cols) configs.cols = this._cols;
		if (this._rowHeight >= 0) configs.rowHeight = this._rowHeight;
		if (this._colPadding >= 0) configs.colPadding = this._colPadding;
		if (this._rowPadding >= 0) configs.rowPadding = this._rowPadding;
		if (this._stretchWidth) configs.stretchWidth = this._stretchWidth;
		if (this._padding >= 0) configs.padding = this._padding;
		layout.set(configs);
	},

	generateDefaultElements: function() {
		var dataType = this.get("dataType");
		if (!dataType && this._dataSet) {
			var dataPath = dorado.DataPath.create(this._dataPath);
			dataType = dataPath.getDataType(this._dataSet.get("dataType"));
		}
		if (!dataType && this._entity) {
			dataType = this._entity.dataType;
		}

		if (dataType && dataType instanceof dorado.EntityDataType) {
			this._defaultElementsGenerated = true;

			var container = this._container, layout;
			if (container) {
				layout = container.get("layout");
				layout.disableRendering();
			}
			var self = this, elements = self._elements, config;
			dataType.get("propertyDefs").each(function(propertyDef) {
				if (!propertyDef._visible) return;

				var name = propertyDef._name, element = elements.get(name);
				if (!element) {
					config = {
						name: name,
						dataSet: self._dataSet,
						dataPath: self._dataPath,
						property: name
					};
				}
				else {
					config = {
						property: name
					};
					self.removeElement(element);
					self.addElement(element);
				}

				var propertyDataType = propertyDef.get("dataType");
				if (propertyDataType instanceof dorado.EntityDataType || propertyDataType instanceof dorado.AggregationDataType) {
					return;
				}

				if (!element) {
					element = self.addElement(config);
				}
				else {
					element.set(config, {
						skipUnknownAttribute: true,
						tryNextOnError: true,
						preventOverwriting: true,
						lockWritingTimes: true
					});
				}
			});
			if (container) {
				layout.enableRendering();
				container.refresh(true);
			}
		}
	},

	/**
	 * 验证表单中所有编辑器中的数据。
	 * @param {boolean} [silent] 是否要在验证失败时禁止Dorado7抛出异常信息。
	 * @return {boolean} 返回本次验证结果是否全部正确。
	 */
	validate: function(silent) {
		var result = true, elements = this._elements, errorMessages;
		this._elements.each(function(element) {
			if (element instanceof dorado.widget.FormElement) {
				var editor = element.get("editor");
				if (editor && editor instanceof dorado.widget.AbstractTextBox) {
					if (editor.get("validationState") == "none") {
						editor.post(false, true);
					}
					if (result && editor.get("validationState") == "error") {
						result = false;
						errorMessages = editor.get("validationMessages");
					}
				}
			}
		});

		if (!result && !silent) {
			throw new dorado.widget.editor.PostException(errorMessages);
		}
		return result;
	},

	/**
	 * 刷新其中编辑器中的数据。
	 * <p>
	 * 该方法通常只对那么未通过DataSet建立数据绑定的使用场景有效。
	 * 例如我们将一个AutoForm与一个数据实体进行了数据关联，当数据实体中的属性值发生变化时AutoForm并不会自动刷新。
	 * 此时我们需要调用refreshData()方法，手工的通知AutoForm进行数据刷新。
	 * </p>
	 */
	refreshData: function() {
		this._elements.each(function(element) {
			if (element instanceof dorado.widget.AbstractFormElement) {
				element.refreshData();
			}
		});
	},

	getFocusableSubControls: function() {
		return [this._container];
	}
});

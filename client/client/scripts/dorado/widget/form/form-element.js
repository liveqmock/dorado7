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

	var specialFormConfigProps = ["view", "tags", "formProfile", "width", "height", "className", "exClassName", "visible", "hideMode", "layoutConstraint", "readOnly", "style"];

	var DEFAULT_OK_MESSAGES = [
		{
			state: "ok"
		}
	];

	/**
	 * @author Benny Bao (mailto:benny.bao@bstek.com)
	 * @class 包含表单项中主要配置信息的抽象类。
	 * @abstract
	 */
	dorado.widget.FormConfig = $class(/** @scope dorado.widget.FormConfig.prototype */{
		$className: "dorado.widget.FormConfig",

		ATTRIBUTES: /** @scope dorado.widget.FormConfig.prototype */ {

			/**
			 * 宽度。
			 * @type int
			 * @attribute
			 */
			width: {},

			/**
			 * 高度。
			 * @type int
			 * @attribute
			 */
			height: {},

			/**
			 * CSS类名。
			 * @type String
			 * @attribute
			 */
			className: {},

			/**
			 * 扩展CSS类名。
			 * @type String
			 * @attribute
			 */
			exClassName: {},

			ui: {},

			/**
			 * 表单项类型。
			 * <p>
			 * 此属性的值实质为编辑器控件的$type。<br>
			 * 例如当我们希望其中的编辑器为{@link dorado.widget.TextEditor}时，可以定义此属性的值为TextEditor。
			 * 因为{@link dorado.widget.TextEditor}的$type为TextEditor。<br>
			 * 当我们希望其中的编辑器为{@link dorado.widget.CheckBox}时，可以定义此属性的值为CheckBox。<br>
			 * 当我们希望其中的编辑器为{@link dorado.widget.Label}时，可以定义此属性的值为Label。
			 * 由于Label并不是一个继承自{@link dorado.widget.AbstractEditor}，因此FormElement将不具备数据编辑的功能。
			 * </p>
			 * <p>
			 * 通过此方法定义编辑器控件具有一定的局限性，很多编辑控件在实际使用时往往需要定义额外的属性。
			 * 如{@link dorado.widget.CustomSpinner}必须定义pattern属性才能正常使用，在这种情况下应该通过editor属性直接声明具体的编辑器。
			 * </p>
			 * @type String
			 * @attribute writeBeforeReady
			 */
			editorType: {
				writeBeforeReady: true
			},

			/**
			 * 绑定的数据实体。
			 * @type Object|dorado.Entity
			 * @attribute
			 * @see dorado.widget.AbstractEditor#attribute:entity
			 */
			entity: {},

			/**
			 * 绑定的数据集。
			 * @type dorado.widget.DataSet
			 * @attribute writeBeforeReady
			 */
			dataSet: {
				componentReference: true
			},

			/**
			 * 数据路径，用于指定数据控件与数据集中的哪些数据节点进行关联。
			 * @type String
			 * @attribute writeBeforeReady
			 * @see dorado.DataPath
			 */
			dataPath: {
				writeBeforeReady: true
			},

			/**
			 * 文本标签与编辑器之间的分隔字符。
			 * @type String
			 * @attribute
			 */
			labelSeparator: {},

			/**
			 * 文本标签是否可见。
			 * @type boolean
			 * @attribute writeBeforeReady
			 * @default true
			 */
			showLabel: {
				defaultValue: true,
				writeBeforeReady: true
			},

			/**
			 * 文本标签的宽度。
			 * @type int
			 * @attribute writeBeforeReady
			 * @default 80
			 */
			labelWidth: {
				defaultValue: 80,
				writeBeforeReady: true
			},

			/**
			 * 文本标签与编辑框之间空隙的宽度。
			 * @type int
			 * @attribute writeBeforeReady
			 * @default 3
			 */
			labelSpacing: {
				defaultValue: 3,
				writeBeforeReady: true
			},

			/**
			 * 文本标签的显示位置。
			 * <p>
			 * 目前支持以下几种取值：
			 * <ul>
			 * <li>left - 左侧。</li>
			 * <li>top - 上方。</li>
			 * </ul>
			 * </p>
			 * @type String
			 * @attribute writeBeforeReady
			 */
			labelPosition: {
				writeBeforeReady: true
			},

			/**
			 * 文本标签的水平对齐方式。
			 * <p>
			 * 目前支持以下几种取值：
			 * <ul>
			 * <li>left - 左对齐。</li>
			 * <li>right - 右对齐。</li>
			 * </ul>
			 * </p>
			 * @type String
			 * @attribute writeBeforeReady
			 */
			labelAlign: {
				writeBeforeReady: true
			},

			/**
			 * 编辑器的宽度。
			 * @type int
			 * @attribute writeBeforeReady
			 */
			editorWidth: {
				writeBeforeReady: true
			},

			/**
			 * 是否显示提示信息区。
			 * @type boolean
			 * @attribute writeBeforeReady
			 * @default true
			 */
			showHint: {
				writeBeforeReady: true,
				defaultValue: true
			},

			/**
			 * 提示信息区的宽度。
			 * @type int
			 * @attribute writeBeforeReady
			 * @default 22
			 */
			hintWidth: {
				defaultValue: 22,
				writeBeforeReady: true
			},

			/**
			 * 提示信息区与编辑框之间的空隙的宽度。
			 * @type int
			 * @attribute writeBeforeReady
			 * @default 3
			 */
			hintSpacing: {
				defaultValue: 3,
				writeBeforeReady: true
			},

			/**
			 * 是否将提示信息的文本消息直接显示在界面中。
			 * <p>
			 * 否则见只在提示信息区显示图标形式的表单项状态。
			 * </p>
			 * @type boolean
			 * @attribute writeBeforeReady
			 */
			showHintMessage: {
				writeBeforeReady: true
			},

			/**
			 * 提示信息区的显示位置。
			 * <p>
			 * 目前支持以下几种取值：
			 * <ul>
			 * <li>right - 右侧。</li>
			 * <li>bottom - 下方。</li>
			 * </ul>
			 * </p>
			 * @type String
			 * @attribute writeBeforeReady
			 */
			hintPosition: {
				writeBeforeReady: true
			},

			/**
			 * 内部使用的信息提示控件。
			 * @type dorado.widget.dorado.widget.DataMessage
			 * @attribute readOnly
			 */
			hintControl: {
				readOnly: true
			},

			/**
			 * 是否只读。
			 * @type boolean
			 * @attribute
			 */
			readOnly: {}
		}
	});

	/**
	 * @author Benny Bao (mailto:benny.bao@bstek.com)
	 * @class 支持绑定表单配置的对象的抽象类。
	 * @abstract
	 */
	dorado.widget.FormProfileSupport = $class(/** @scope dorado.widget.FormProfileSupport.prototype */{
		onProfileChange: function() {
			var formProfile = this._formProfile;
			if (dorado.Object.isInstanceOf(formProfile, dorado.widget.FormProfile)) {
				var readOnly = formProfile.get("readOnly");
				if (this._realReadOnly != readOnly) {
					this._realReadOnly = readOnly;
				}

				this.set(formProfile.getConfig(), {
					skipUnknownAttribute: true,
					tryNextOnError: true,
					preventOverwriting: true,
					lockWritingTimes: (this instanceof dorado.widget.FormElement)
				});
			}
		}
	});

	/**
	 * @author Benny Bao (mailto:benny.bao@bstek.com)
	 * @component Form
	 * @class 表单配置。
	 * <p>
	 * 此控件并不用于显示，其目的是为了方便为一批表单元素统一的定义表单属性。
	 * 例如：我们可以在View中添加一个FormProfile控件，并在其中定义好labelWidth=120。 然后在后面定义具体的{@link dorado.widget.FormElement}的过程中，我们只要将其与这个FormProfile控件进行绑定，那么该FormElement就会自动的获得labelWidth=120的设置。
	 * </p>
	 * <p>
	 * 另外，为了进一步的简化操作。{@link dorado.widget.FormElement}还会在创建的过程中自动的在View中寻找是否存在id为"defaultFormProfile"的FormProfile控件。
	 * 如果找到则将自动建立与其的绑定关系。
	 * 因此，在很多情况下，我们只要声明一个id为"defaultFormProfile"的FormProfile控件，并且将需要的表单属性设置在其中。
	 * 然后，这个View中所有的FormElement在默认情况下，都将自动从中读取配置信息。
	 * </p>
	 * @extends dorado.widget.Component
	 * @extends dorado.widget.FormConfig
	 * @see dorado.widget.FormElement
	 */
	dorado.widget.FormProfile = $extend([dorado.widget.Component, dorado.widget.FormConfig], /** @scope dorado.widget.FormConfig.prototype */ {
		$className: "dorado.widget.FormProfile",

		ATTRIBUTES: /** @scope dorado.widget.FormProfile.prototype */ {
			/**
			 * 绑定的数据实体。
			 * @type Object|dorado.Entity
			 * @attribute
			 * @see dorado.widget.AbstractEditor#attribute:entity
			 */
			entity: {
				defaultValue: function() {
					return new dorado.widget.FormProfile.DefaultEntity();
				}
			}
		},

		constructor: function() {
			this._bindingElements = new dorado.ObjectGroup();
			$invokeSuper.call(this, arguments);
			this.bind("onAttributeChange", function(self, arg) {
				var attr = arg.attribute;
				if (!dorado.widget.Control.prototype.ATTRIBUTES[attr] &&
					dorado.widget.FormConfig.prototype.ATTRIBUTES[attr]) {
					if (self._config) delete self._config;
					dorado.Toolkits.setDelayedAction(self, "$profileChangeTimerId", function() {
						self._bindingElements.invoke("onProfileChange");
					}, 20);
				}
			});
		},

		addBindingElement: function(element) {
			this._bindingElements.objects.push(element);
		},

		removeBindingElement: function(element) {
			this._bindingElements.objects.push(element);
		},

		getConfig: function() {
			if (this._config) return this._config;

			var formProfile = this;
			var attrs = formProfile.ATTRIBUTES, attrWatcher = formProfile.getAttributeWatcher(), config = formProfile._config = {};
			for(var attr in attrs) {
				if (!attrs.hasOwnProperty(attr)) {
					continue;
				}

				var def = attrs[attr];
				if (def.readOnly || def.writeOnly || (!attrWatcher.getWritingTimes(attr) && typeof def.defaultValue != "function")) {
					continue;
				}

				if (specialFormConfigProps.indexOf(attr) >= 0 && formProfile instanceof dorado.widget.Control) {
					continue;
				}

				var value = formProfile.get(attr);
				if (def.componentReference && !(value instanceof dorado.widget.Component)) {
					continue;
				}

				if (value !== undefined) config[attr] = value;
			}

			if (config.dataSet) delete config.entity;
			return config;
		}
	});

	dorado.widget.FormProfile.DefaultEntity = $class({});

	/**
	 * @author Benny Bao (mailto:benny.bao@bstek.com)
	 * @class 表单元素。
	 * <p>
	 * 表单元素是一种组合式的控件，提供此组件的目的是为了使表单的定义变得更加简单。 一般而言，一个表单元素包含文本标签、编辑器、提示信息三个部分。
	 * 我们在实际应用中所见的大部分输入域都是由这三个部分组成的。
	 * </p>
	 * <p>
	 * 由于表单元素的属性较多，并且往往一组表单元素都拥有相似的属性设置。
	 * 为了使用户能够更加方便的对表单元素的属性进行批量的设置，dorado特别提供了FormProfile组件来对表单元素进行增强。 其具体用法请参考{@link dorado.widget.FormProfile}的说明。
	 * </p>
	 * @extends dorado.widget.Control
	 * @extends dorado.widget.PropertyDataControl
	 * @extends dorado.widget.FormProfileSupport
	 * @abstract
	 * @see dorado.widget.FormProfile
	 */
	dorado.widget.AbstractFormElement = $extend([dorado.widget.Control, dorado.widget.PropertyDataControl, dorado.widget.FormProfileSupport], /** @scope dorado.widget.AbstractFormElement.prototype */ {
		/**
		 * @name dorado.widget.AbstractFormElement#resetBinding
		 * @function
		 * @protected
		 * @description 重置表单元素内部的绑定关系。
		 */

		/**
		 * @name dorado.widget.AbstractFormElement#refreshData
		 * @function
		 * @protected
		 * @description 刷新其中表单元素中的数据。
		 * <p>
		 * 该方法通常只对那么未通过DataSet建立数据绑定的使用场景有效。
		 * 例如我们将一个FormElement与一个数据实体进行了数据关联，当数据实体中的属性值发生变化时FormElement并不会自动刷新。
		 * 此时我们需要调用refreshData()方法，手工的通知FormElement进行数据刷新。
		 * </p>
		 */

		ATTRIBUTES: /** @scope dorado.widget.AbstractFormElement.prototype */ {
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
					if (formProfile && !dorado.Object.isInstanceOf(formProfile, dorado.widget.FormProfile)) {
						var ref = formProfile;
						formProfile = ref.view.id(ref.component);
					}
					this._formProfile = formProfile;
					if (dorado.Object.isInstanceOf(formProfile, dorado.widget.FormProfile)) {
						formProfile.addBindingElement(this);
						this.onProfileChange();
					}
				}
			},

			dataSet: {
				setter: function(dataSet, attr) {
					dorado.widget.DataControl.prototype.ATTRIBUTES.dataSet.setter.call(this, dataSet, attr);
					delete this._propertyDef;
					this.resetBinding();
				}
			},

			dataPath: {
				setter: function(v) {
					this._dataPath = v;
					delete this._propertyDef;
					this.resetBinding();
				}
			},

			/**
			 * 绑定的属性名。
			 * @type String
			 * @attribute writeBeforeReady
			 * @see dorado.widget.AbstractEditor#attribute:property
			 */
			property: {
				writeBeforeReady: true,
				setter: function(v) {
					this._property = v;
					delete this._propertyDef;
					this.resetBinding();
				}
			},

			entity: {}
		},

		constructor: function(config) {
			var formProfile = config && config.formProfile;
			if (formProfile) delete config.formProfile;
			$invokeSuper.call(this, arguments);
			if (formProfile) this.set("formProfile", formProfile);
		},

		destroy: function() {
			if (this._destroyed) return;
			this.set("formProfile", null);
			$invokeSuper.call(this, arguments);
		}
	});

	/**
	 * @author Benny Bao (mailto:benny.bao@bstek.com)
	 * @class 表单元素。
	 * <p>
	 * 表单元素是一种组合式的控件，提供此组件的目的是为了使表单的定义变得更加简单。 一般而言，一个表单元素包含文本标签、编辑器、提示信息三个部分。
	 * 我们在实际应用中所见的大部分输入域都是由这三个部分组成的。
	 * </p>
	 * <p>
	 * 由于表单元素的属性较多，并且往往一组表单元素都拥有相似的属性设置。
	 * 为了使用户能够更加方便的对表单元素的属性进行批量的设置，dorado特别提供了FormProfile组件来对表单元素进行增强。 其具体用法请参考{@link dorado.widget.FormProfile}的说明。
	 * </p>
	 * @extends dorado.widget.AbstractFormElement
	 * @extends dorado.widget.FormConfig
	 * @see dorado.widget.FormProfile
	 */
	dorado.widget.FormElement = $extend([dorado.widget.AbstractFormElement, dorado.widget.FormConfig], /** @scope dorado.widget.FormElement.prototype */ {
		$className: "dorado.widget.FormElement",

		ATTRIBUTES: /** @scope dorado.widget.FormElement.prototype */ {
			/**
			 * 宽度。
			 * @type int
			 * @attribute writeBeforeReady
			 * @default 260
			 */
			width: {
				defaultValue: 260,
				writeBeforeReady: true
			},

			/**
			 * 高度。
			 * @type int
			 * @attribute writeBeforeReady
			 */
			height: {
				writeBeforeReady: true
			},

			className: {
				defaultValue: "d-form-element"
			},

			/**
			 * 文本标签的内容。
			 * @type String
			 * @attribute
			 */
			label: {},

			/**
			 * 提示信息的内容。
			 * <p>
			 * 此属性在写入时可以传入单独的消息文本、消息对象或消息数组等多种形式的参数。
			 * 但在读取时系统会统一的返回消息数组的形式。
			 * 该数组中的每一项是一个JSON对象，包含下列两个子属性：
			 * <ul>
			 * <li>state    -    {String} 信息级别。取值范围包括：info、warn、error。默认值为error。</li>
			 * <li>text    -    {String} 信息内容。</li>
			 * </ul>
			 * </p>
			 * @type String|Object|[String]|[Object]
			 * @attribute
			 */
			hint: {
				setter: function(hint) {

					function trimSingleHint(hint) {
						if (!hint) return null;
						if (typeof hint == "string") {
							hint = [
								{
									state: "info",
									text: hint
								}
							];
						}
						else {
							hint.state = hint.state || "info";
							hint = [hint];
						}
						return hint;
					}

					function trimHints(hint) {
						if (!hint) return null;
						if (hint instanceof Array) {
							var array = [];
							for(var i = 0; i < hint.length; i++) {
								var h = trimSingleHint(hint[i]);
								if (!h) continue;
								array.push(h);
							}
							hint = (array.length) ? array : null;
						}
						else {
							hint = trimSingleHint(hint);
						}
						return hint;
					}

					this._hint = trimHints(hint);
					var hintControl = this.getHintControl(true);
					if (hintControl) {
						hintControl.set("messages", this._hint);
					}
				}
			},

			/**
			 * 内部使用的编辑器。
			 * @type dorado.widget.Control
			 * @attribute writeBeforeReady
			 */
			editor: {
				writeBeforeReady: true,
				innerComponent: "TextEditor"
			},

			/**
			 * 关联的编辑框触发器。下拉框也是一种特殊的编辑框触发器。
			 * @type dorado.widget.EditorTrigger
			 * @attribute
			 */
			trigger: {},

			/**
			 * 关联的文本编辑器是否可以编辑。
			 * 此属性仅在关联的编辑器为TextEditor或TextArea是有效，用于定义文本编辑器是否可以编辑。因为有时我们希望仅允许用户通过下拉框进行选择。
			 * @type boolean
			 * @default true
			 * @attribute
			 */
			editable: {
				defaultValue: true
			},

			/**
			 * 内部使用的编辑器的值。 此属性相当于一个访问内部使用的编辑器中值的快捷方式。
			 * @type Object
			 * @attribute
			 */
			value: {
				path: "editor.value"
			},

			entity: {
				setter: function(entity) {
					this._entity = entity;
					if (this._rendered) {
						var hintControl = this.getHintControl(false);
						if (hintControl) {
							hintControl.set("messages", null);
						}
					}
				}
			},

			readOnly: {
				skipRefresh: true,
				setter: function(v) {
					this._readOnly = v;
					this.resetEditorReadOnly();
				}
			}
		},

		createDom: function() {
			var attrWatcher = this.getAttributeWatcher();
			if (!this._formProfile && attrWatcher.getWritingTimes("formProfile") == 0) {
				var view = this.get("view") || dorado.widget.View.TOP;
				this.set("formProfile", view.id("defaultFormProfile"));
			}

			var config = [], content = [];

			if (this._showLabel) {
				var labelClass = " form-label-align-" + (this._labelAlign || "left");

				if (this._labelPosition == "top") {
					config.push({
						contextKey: "labelEl",
						tagName: "DIV",
						className: "form-label form-label-top" + labelClass
					});
				}
				else {
					config.push({
						contextKey: "labelEl",
						tagName: "DIV",
						className: "form-label form-label-left" + labelClass
					});
				}
			}

			if (this._labelPosition == "top") {
				var contentConfig = {
					contextKey: "contentEl",
					tagName: "DIV",
					className: "form-content form-content-bottom",
					content: content
				};
				config.push(contentConfig);
			}
			else {
				var contentConfig = {
					contextKey: "contentEl",
					tagName: "DIV",
					className: "form-content form-content-right",
					content: content
				};
				config.push(contentConfig);
			}

			if (this._hintPosition == "bottom") {
				content.push({
					contextKey: "editorEl",
					tagName: "DIV",
					className: "form-editor form-editor-top"
				});
			}
			else {
				content.push({
					contextKey: "editorEl",
					tagName: "DIV",
					className: "form-editor form-editor-left"
				});
			}

			if (this._showHint) {
				if (this._hintPosition == "bottom") {
					content.push({
						contextKey: "hintEl",
						tagName: "DIV",
						className: "form-hint form-hint-bottom"
					});
				}
				else {
					content.push({
						contextKey: "hintEl",
						tagName: "DIV",
						className: "form-hint form-hint-right"
					});
				}
			}

			var doms = {}, dom = $DomUtils.xCreate({
				tagName: "DIV",
				content: config
			}, null, doms);
			this._labelEl = doms.labelEl;
			this._contentEl = doms.contentEl;
			this._editorEl = doms.editorEl;
			this._hintEl = doms.hintEl;
			return dom;
		},

		setFocus: function() {
			var editor = this.getEditor(false);
			if (editor) {
				editor.setFocus();
			}
			else {
				$invokeSuper.call(this);
			}
		},

		createEditor: function(editorType) {
			var editor = dorado.Toolkits.createInstance("widget", editorType, function() {
				return dorado.Toolkits.getPrototype("widget", editorType) || dorado.widget.TextEditor;
			});
			return editor;
		},

		getEditor: function(create) {
			var control = this._editor;
			if (this._controlRegistered) {
				var config1 = {}, config2 = {}, attrs = control.ATTRIBUTES;
				this.initEditorConfig(config1);
				for(var attr in config1) {
					if (!attrs[attr] || attrs[attr].writeOnly) continue;
					if (config1[attr] != null) config2[attr] = config1[attr];
				}
				control.set(config2, {
					skipUnknownAttribute: true,
					tryNextOnError: true,
					preventOverwriting: true,
					lockWritingTimes: true
				});
				return control;
			}

			if (!control && create) {
				var propertyDef = this.getBindingPropertyDef();
				if (propertyDef) {
					if (!this._editorType) {
						var propertyDataType = propertyDef.get("dataType");
						if (propertyDataType) {
							if (propertyDataType._code == dorado.DataType.PRIMITIVE_BOOLEAN || propertyDataType._code == dorado.DataType.BOOLEAN) {
								this._editorType = (!propertyDef._mapping) ? "CheckBox" : "RadioGroup";
							}
						}
					}

					if (this._trigger === undefined && propertyDef._mapping) {
						if ((!this._editorType || this._editorType == "TextEditor")) {
							this._trigger = new dorado.widget.AutoMappingDropDown({
								items: propertyDef._mapping
							});
						}
					}
				}

				var originEditor = this._editor;
				this._editor = control = this.createEditor(this._editorType);
				if (originEditor != control) {
					if (originEditor) this.unregisterInnerControl(originEditor);
					if (control) this.registerInnerControl(control);
				}
			}

			if (control) {
				var config = {};
				this.initEditorConfig(config);
				control.set(config, {
					skipUnknownAttribute: true,
					tryNextOnError: true,
					preventOverwriting: true,
					lockWritingTimes: true
				});

				this._controlRegistered = true;
				if (this._showHint && control instanceof dorado.widget.AbstractEditor) {
					if (control instanceof dorado.widget.AbstractTextBox) {
						control.bind("onValidationStateChange", $scopify(this, this.onEditorStateChange));
						control.bind("onPost", $scopify(this, this.onEditorPost));
					}
					control.bind("onPostFailed", $scopify(this, this.onEditorPostFailed));
				}
			}
			return control;
		},

		getHintControl: function(create) {
			var control = this._hintControl;
			if (!control && create) {
				var config = {
					width: this._hintWidth,
					showIconOnly: !this._showHintMessage,
					messages: this._hint
				};
				if (this._dataPath) config.dataPath = this._dataPath;
				if (this._dataSet && this._property) {
					config.dataSet = this._dataSet;
					config.property = this._property;
				}

				this._hintControl = control = new dorado.widget.DataMessage(config);
			}

			if (control && !this._hintControlRegistered) {
				this._hintControlRegistered = true;
				this.registerInnerControl(control);
			}
			return control;
		},

		initEditorConfig: function(config) {
			if (this._trigger !== undefined) config.trigger = this._trigger;
			if (this._editable !== undefined) config.editable = this._editable;
			config.readOnly = this._readOnly || this._realReadOnly;
			if (this._dataSet && this._property) {
				config.dataSet = this._dataSet;
			}
			else if (this._entity) {
				config.entity = this._entity;
			}
			if (this._dataPath) config.dataPath = this._dataPath;
			if (this._property) config.property = this._property;
		},

		resetEditorReadOnly: function() {
			if (this._editor && this._editor instanceof dorado.widget.AbstractEditor) {
				this._editor.set("readOnly", this._readOnly || this._realReadOnly);
			}
		},

		onEditorStateChange: function(editor, arg) {
			var hintControl = this.getHintControl(false);
			if (hintControl) hintControl.set("messages", editor.get("validationMessages"));
		},

		onEditorPost: function(editor, arg) {
			var hintControl = this.getHintControl(false);
			if (hintControl) {
				messages = editor.get("validationMessages");
				hintControl.set("messages", messages || DEFAULT_OK_MESSAGES);
			}
		},

		onEditorPostFailed: function(editor, arg) {
			if (!this._dataSet && !this._property) {
				var exception = arg.exception;
				if (exception instanceof dorado.widget.editor.PostException) {
					var hintControl = this.getHintControl(false);
					if (hintControl) hintControl.set("messages", exception.messages);
				}
			}
			arg.processDefault = false;
		},

		getBindingPropertyDef: function() {
			var p = this._propertyDef;
			if (p === undefined) {
				this._propertyDef = p = ($invokeSuper.call(this) || null);
			}
			return p;
		},

		getLabel: function() {
			var label = this._label;
			if (!label && this._dataSet && this._property) {
				var p = this.getBindingPropertyDef();
				if (p) label = p._label || p._name;
			}
			return label || this._property || "";
		},

		isRequired: function() {
			var p;
			if (this._dataSet && this._property) p = this.getBindingPropertyDef();
			var required = p ? p._required : false;
			if (!required) {
				var editor = this._editor;
				required = (editor &&
					editor instanceof dorado.widget.TextEditor &&
					editor.get("required"));
			}
			return required;
		},

		resetBinding: function() {
			if (!this._ready) return;

			var config = {
				dataSet: this._dataSet,
				dataPath: this._dataPath,
				property: this._property
			};
			var editor = this.getEditor(false), hintControl = this.getHintControl(false);
			if (editor) editor.set(config);
			if (hintControl) hintControl.set(config);
		},

		refreshDom: function(dom) {
			var height = this._height || this._realHeight;
			$invokeSuper.call(this, arguments);

			var dom = this._dom, labelEl = this._labelEl, contentEl = this._contentEl, editorEl = this._editorEl, hintEl = this._hintEl;
			var heightDefined = this.getAttributeWatcher().getWritingTimes("height");
			if (labelEl) {
				var label = this.getLabel();
				labelEl.innerText = label + ((this._labelSeparator && label) ? this._labelSeparator : '');

				if (this._labelPosition == "top") {
					if (heightDefined) {
						contentEl.style.height = (dom.offsetHeight - labelEl.offsetHeight) + "px";
					}
				}
				else {
					$fly(labelEl).outerWidth(this._labelWidth);
					if (dorado.Browser.msie && dorado.Browser.version < 7) {
						contentEl.style.marginLeft = this._labelWidth + "px";
					}
					else {
						contentEl.style.marginLeft = (this._labelWidth + this._labelSpacing) + "px";
					}
				}
			}

			if (hintEl) {
				var hintControl = this.getHintControl(true);
				if (this._hintPosition == "bottom") {
					if (heightDefined) {
						editorEl.style.height = (contentEl.offsetHeight - hintEl.offsetHeight) + "px";
					}
				}
				else {
					hintEl.style.width = this._hintWidth + "px";
					editorEl.style.marginRight = (this._hintWidth + this._hintSpacing) + "px";
				}
				if (!hintControl.get("rendered")) hintControl.render(hintEl);
			}

			var editor = this.getEditor(true);
			if (editor) {
				var attrWatcher = editor.getAttributeWatcher();
				var autoWidth = !editor.ATTRIBUTES.width.independent && !attrWatcher.getWritingTimes("width");
				var autoHeight = !editor.ATTRIBUTES.height.independent && !attrWatcher.getWritingTimes("height") && heightDefined;
				if (this._labelPosition == "top") {
					autoHeight = (height && autoHeight);
				}

				if (autoWidth) {
					// for performance
					var editorWidth = 0;
					if (this._realWidth > 0) {
						editorWidth = this._realWidth;
						if (this._showLabel && this._labelPosition != "top") {
							editorWidth -= (this._labelWidth + this._labelSpacing);
							if (this._showHint && this._hintPosition != "bottom") {
								editorWidth -= (this._hintWidth + this._hintSpacing);
							}
							else {
								editorWidth = 0;
							}
						}
						else {
							editorWidth = 0;
						}
					}
					editor._realWidth = (editorWidth > 0) ? editorWidth : editorEl.offsetWidth;
				}
				if (this._editorWidth > 0 && editor._realWidth > 0 && this._editorWidth < editor._realWidth) {
					editor._realWidth = this._editorWidth;
				}
				if (autoHeight) editor._realHeight = editorEl.offsetHeigh; // 可能导致IE9下自定义Editor的高度异常

				if (!editor.get("rendered")) {
					editor.render(editorEl);
				}
				else {
					editor.refresh();
				}
			}
			
			if (labelEl) {
				var required = !!this.isRequired();
				if (required && editor) {
					required = !editor._readOnly && !editor._readOnly2;
				}
				$fly(labelEl).toggleClass("form-label-required", required);
			}
		},

		refreshData: function() {
			var editor = this.getEditor(false);
			if (editor != null && dorado.Object.isInstanceOf(editor, dorado.widget.AbstractEditor)) {
				editor.refreshData();
			}
		},

		isFocusable: function() {
			var editor = this._editor;
			return $invokeSuper.call(this) && editor && editor.isFocusable();
		},

		getFocusableSubControls: function() {
			return [this._editor];
		}
	});

	dorado.widget.View.registerDefaultComponent("defaultFormProfile", function() {
		return new dorado.widget.FormProfile();
	});

})();

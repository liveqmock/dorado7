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

	function isInputOrTextArea(dom) {
		return ["input", "textarea"].indexOf(dom.tagName.toLowerCase()) >= 0;
	}

	var attributesRelativeWithTrigger = ["dataSet", "dataType", "trigger", "dataPath", "property"];

	/**
	 * @author Benny Bao (mailto:benny.bao@bstek.com)
	 * @class 来自外部系统的异常信息。
	 * @extends dorado.Exception
	 * @param [object] messages 校验信息的数组。数组中的每一个元素是一个JSON对象，该JSON对象包含以下属性：
	 * <ul>
	 * <li>state    -    {String} 信息级别。取值范围包括：info、ok、warn、error。默认值为error。</li>
	 * <li>text    -    {String} 信息内容。</li>
	 * </ul>
	 */
	dorado.widget.editor.PostException = $extend(dorado.Exception, {
		$className: "dorado.widget.editor.PostException",

		/**
		 * 校验信息的数组。
		 * @name dorado.widget.editor.PostException#validationMessages
		 * @property
		 * @type [object]
		 */
		// =====

		constructor: function(messages) {
			$invokeSuper.call(this, [dorado.Toolkits.getTopMessage(messages).text]);
			this.messages = messages;
		}
	});

	/**
	 * @author Benny Bao (mailto:benny.bao@bstek.com)
	 * @class 抽象的具有文本框特征的编辑器。
	 * @abstract
	 * @extends dorado.widget.AbstractDataEditor
	 */
	dorado.widget.AbstractTextBox = $extend(dorado.widget.AbstractDataEditor, /** @scope dorado.widget.AbstractTextBox.prototype */ {
		$className: "dorado.widget.AbstractTextBox",
		_triggerChanged: true,
		_realEditable: true,

		ATTRIBUTES: /** @scope dorado.widget.AbstractTextBox.prototype */ {
			className: {
				defaultValue: "d-text-box"
			},

			/**
			 * 文本编辑器中的文本内容。
			 * @type String
			 * @attribute
			 */
			text: {
				skipRefresh: true,
				getter: function() {
					return this.doGetText();
				},
				setter: function(text) {
					this.doSetText(text);
				}
			},

			value: {
				skipRefresh: true,
				getter: function() {
					var text = this.doGetText();
					if (this._value !== undefined && text === this._valueText) {
						return this._value;
					}
					else {
						if (text === undefined) text = null;
						return text;
					}
				},
				setter: function(value) {
					/*
					 * _value将在doPost之后被自动清空，并且当modified==true时，系统也不会将_value的值作为value属性的只返回给外界。
					 */
					this._value = value;
					var text = this._valueText = this._lastObserve = dorado.$String.toText(value);
					this.doSetText(text);
				}
			},

			/**
			 * 编辑框中的文本是否允许编辑。
			 * <p>
			 * <b>editable和readOnly属性都可以用于控制编辑框中的文本是否可编辑。
			 * 他们的不同点在于，当editable=false时，虽然编辑框不可编辑但其关联的{@link dorado.widget.EditorTrigger}仍可操作；
			 * 而当readOnly=true时，不但编辑框不可编辑其关联的{@link dorado.widget.EditorTrigger}也将不能使用。</b>
			 * </p>
			 * @type boolean
			 * @attribute
			 * @default true
			 * @see dorado.widget.AbstractEditor#attribute:readOnly
			 */
			editable: {
				defaultValue: true
			},

			readOnly: {},

			modified: {
				getter: function() {
					return (this._focused) ? (this._lastPost != this.get("text")) : false;
				}
			},

			/**
			 * 编辑器中当前的数据校验状态。
			 * <ul>
			 * <li>none    -    未知或尚未校验。</li>
			 * <li>warn    -    数据包含警告信息。</li>
			 * <li>error    -    数据不合法。</li>
			 * </ul>
			 * @type String
			 * @attribute readOnly
			 */
			validationState: {
				readOnly: true,
				defaultValue: "none"
			},

			/**
			 * 编辑器中当前的数据校验信息的数组。
			 * @type [Object] 校验信息的数组。数组中的每一个元素是一个JSON对象，该JSON对象包含以下属性：
			 * <ul>
			 * <li>state    -    {String} 信息级别。取值范围包括：info、ok、warn、error。默认值为error。</li>
			 * <li>text    -    {String} 信息内容。</li>
			 * </ul>
			 * @attribute readOnly
			 */
			validationMessages: {
				readOnly: true
			},

			/**
			 * 关联的编辑框触发器。下拉框也是一种特殊的编辑框触发器。
			 * <p>此处既可以传入一个触发器，也可以传入多个触发器组成的数组。</p>
			 * @type dorado.widget.Trigger|dorado.widget.Trigger[]
			 * @attribute
			 */
			trigger: {
				componentReference: true,
				setter: function(v) {
					if (v instanceof Array && v.length == 0) v = null;
					this._trigger = v;
				}
			}
		},

		EVENTS: /** @scope dorado.widget.AbstractTextBox.prototype */ {
			/**
			 * 当编辑器中的内容被修改时触发的事件。
			 * @param {Object} self 事件的发起者，即控件本身。
			 * @param {Object} arg 事件参数。
			 * @return {boolean} 是否要继续后续事件的触发操作，不提供返回值时系统将按照返回值为true进行处理。
			 * @see dorado.widget.AbstractTextBox#textEdited
			 * @event
			 */
			onTextEdit: {},

			/**
			 * 当编辑器中的触发按钮被点击时触发的事件。
			 * @param {Object} self 事件的发起者，即控件本身。
			 * @param {Object} arg 事件参数。
			 * @param {boolean} #arg.processDefault=true 用于通知系统是否要继续完成后续动作。
			 * @return {boolean} 是否要继续后续事件的触发操作，不提供返回值时系统将按照返回值为true进行处理。
			 * @event
			 */
			onTriggerClick: {},

			/**
			 * 当编辑器的状态发生改变时触发的事件。
			 * @param {Object} self 事件的发起者，即控件本身。
			 * @param {Object} arg 事件参数。
			 * @return {boolean} 是否要继续后续事件的触发操作，不提供返回值时系统将按照返回值为true进行处理。
			 * @event
			 */
			onValidationStateChange: {}
		},

		/**
		 * @name dorado.widget.AbstractTextBox#doValidate
		 * @function
		 * @protected
		 * @description 内部的校验文本的处理方法。
		 * @param {String} text 要校验的文本。如果数据未通过校验应抛出异常信息。
		 */
		/**
		 * @name dorado.widget.AbstractTextBox#doGetText
		 * @function
		 * @protected
		 * @description 返回编辑框中的文本。
		 * @return {String} 编辑框中的文本。
		 */
		/**
		 * @name dorado.widget.AbstractTextBox#doSetText
		 * @function
		 * @protected
		 * @description 设置编辑框中的文本。
		 * @parem text {String} 编辑框中的文本。
		 */
		// =====

		doSet: function(attr, value, skipUnknownAttribute, lockWritingTimes) {
			if (attributesRelativeWithTrigger.indexOf(attr) >= 0) this._triggerChanged = true;
			return $invokeSuper.call(this, [attr, value, skipUnknownAttribute, lockWritingTimes]);
		},

		createDom: function() {
			var textDom = this._textDom = this.createTextDom();
			textDom.style.width = "100%";
			textDom.style.height = "100%";

			var dom = $DomUtils.xCreate({
				tagName: "div",
				content: {
					tagName: "div",
					className: "editor-wrapper",
					content: textDom
				}
			});
			this._editorWrapper = dom.firstChild;

			var self = this;
			jQuery(dom).addClassOnHover(this._className + "-hover", null,function() {
				return !self._realReadOnly;
			}).mousedown(function(evt) {
					evt.stopPropagation();
				});

			if (this._text) this.doSetText(this._text);
			return dom;
		},

		refreshTriggerDoms: function() {
			var triggerButtons = this._triggerButtons, triggerButton;
			if (triggerButtons) {
				for(var i = 0; i < triggerButtons.length; i++) {
					triggerButton = triggerButtons[i];
					triggerButton.destroy();
				}
			}

			var triggerWidth = $setting["widget.TextEditor.triggerWidth"] || 18;
			var triggersWidth = 0;
			var triggers = this.get("trigger");
			if (triggers) {
				if (!(triggers instanceof Array)) triggers = [triggers];
				this._triggerButtons = triggerButtons = [];
				for(var i = triggers.length - 1, trigger; i >= 0; i--) {
					trigger = triggers[i];
					triggerButton = trigger.createTriggerButton(this);
					if (triggerButton) {
						triggerButtons.push(triggerButton);
						this.registerInnerControl(triggerButton);
						triggerButton.set("style", "right:" + triggersWidth + "px");
						triggerButton.render(this._dom);
						triggersWidth += triggerWidth;
					}
				}
			}
		},

		getTriggerButton: function(trigger) {
			var triggerButtons = this._triggerButtons, triggerButton;
			if (triggerButtons) {
				for(var i = 0; i < triggerButtons.length; i++) {
					triggerButton = triggerButtons[i];
					if (triggerButton._trigger == trigger) {
						return triggerButton;
					}
				}
			}
		},

		refreshDom: function(dom) {
			$invokeSuper.call(this, [dom]);

			this.refreshExternalReadOnly();
			this.resetReadOnly();

			if (this._dataSet) {
				var value, dirty, timestamp = 0;
				this._entity = null;
				if (this._property) {
					var bindingInfo = this._bindingInfo, propertyDef = bindingInfo.propertyDef, state, messages;
					if (propertyDef) {
						var watcher = this.getAttributeWatcher();
						if (!watcher.getWritingTimes("displayFormat")) this._displayFormat = propertyDef._displayFormat;
						if (!watcher.getWritingTimes("inputFormat")) this._inputFormat = propertyDef._inputFormat;
						if (!propertyDef._mapping && !watcher.getWritingTimes("dataType")) this._dataType = propertyDef._dataType;
					}

					timestamp = bindingInfo.timestamp;
					if (bindingInfo.entity instanceof dorado.Entity) {
						var e = this._entity = bindingInfo.entity;
						if (this._dataType) {
							value = e.get(this._property);
						}
						else {
							value = e.getText(this._property);
						}
						dirty = e.isDirty(this._property);
						state = e.getMessageState(this._property);
						messages = e.getMessages(this._property);
					}

					if (timestamp != this.timestamp) {
						this.set("value", value);
						this._lastPost = this.get("text");
						this.timestamp = timestamp;
					}
					this.setValidationState(state, messages);
					this.setDirty(dirty);
				}
			}

			if (this._triggerChanged) {
				this._triggerChanged = false;
				this.refreshTriggerDoms();
			}
		},

		validate: function(text) {
			if (this._skipValidate) return null;
			if (this.doValidate) return this.doValidate(text);
		},

		setValidationState: function(state, messages) {
			state = state || "none";
			if (this._validationState == state) return;
			this._validationState = state;
			this._validationMessages = dorado.Toolkits.trimMessages(messages, "error");
			if (this._rendered) {
				var dom = this._dom, warnCls = this._className + "-warn", errorCls = this._className + "-error";
				$fly(dom).toggleClass(warnCls, state == "warn").toggleClass(errorCls, state == "error");

				if (dorado.TipManager) {
					if ((state == "warn" || state == "error") && messages) {
						var message = dorado.Toolkits.getTopMessage(messages);
						dorado.TipManager.initTip(dom, {
							text: message.text
						});
					}
					else {
						dorado.TipManager.deleteTip(dom);
					}
				}
			}
			this.fireEvent("onValidationStateChange", this);
		},

		onMouseDown: function() {
			if (this._realReadOnly) return;
			var triggers = this.get("trigger");
			if (triggers) {
				if (!(triggers instanceof Array)) triggers = [triggers];
				var self = this;
				jQuery.each(triggers, function(i, trigger) {
					if (trigger.onEditorMouseDown) trigger.onEditorMouseDown(self);
				});
			}
		},

		doSetFocus: function() {
			if (!dorado.Browser.isTouch && this._textDom) this._textDom.focus();
		},

		doOnFocus: function() {
			// if (dorado.Browser.msie && dorado.Browser.version < 9) this._textDom.readOnly = !!this._realEditable;
			if (this._realReadOnly) return;

			this._focusTime = new Date();

			this._editorFocused = true;
			this._lastPost = this._lastObserve = this.get("text");
			if (this._useBlankText) this.doSetText('');

			dorado.Toolkits.setDelayedAction(this, "$editObserverTimerId", function() {
				var text = this.get("text");
				if (this._lastObserve != text) {
					this._lastObserve = text;
					this.textEdited();
				}
				dorado.Toolkits.setDelayedAction(this, "$editObserverTimerId", arguments.callee, 50);
			}, 50);

			var triggers = this.get("trigger");
			if (triggers) {
				if (!(triggers instanceof Array)) triggers = [triggers];
				for(var i = 0; i < triggers.length; i++) {
					var trigger = triggers[i];
					if (trigger.onEditorFocus) trigger.onEditorFocus(this);
				}
			}
		},

		doOnBlur: function() {
			// if (dorado.Browser.msie && dorado.Browser.version < 9) this._textDom.readOnly = false;
			if (this._realReadOnly) return;

			dorado.Toolkits.cancelDelayedAction(this, "$editObserverTimerId");
			this.post();

			this._editorFocused = false;
			if (this._blankText) {
				this.doSetText(this.doGetText());
			}
		},

		resetReadOnly: function() {
			if (!this._rendered) return;

			var readOnly = !!(this._readOnly || this._readOnly2);

			this._realReadOnly = readOnly;
			$fly(this.getDom()).toggleClass("d-readonly " + this._className + "-readonly", readOnly);

			if (readOnly && !this._realEditable == readOnly) {
				return;
			}

			var textDomReadOnly = true;
			if (!readOnly && this._editable) {
				var realEditable = true;
				if (isInputOrTextArea(this._textDom)) {
					var triggers = this.get("trigger"), realEditable = true;
					if (triggers && !(triggers instanceof Array)) triggers = [triggers];
					if (triggers) {
						for(var i = 0; i < triggers.length; i++) {
							var trigger = triggers[i];
							if (!trigger.get("editable")) {
								realEditable = false;
								break;
							}
						}
					}
				}
				textDomReadOnly = !realEditable;
			}
			this._realEditable = !textDomReadOnly;
			//if (!(dorado.Browser.msie && dorado.Browser.version < 9)) {
			this._textDom.readOnly = textDomReadOnly;
			//}
		},

		/**
		 * 当编辑器中的触发按钮被点击是激活的方法。
		 * @param {dorado.widget.Trigger} trigger 被点击的触发器。
		 */
		onTriggerClick: function(trigger) {
			if (this._realReadOnly) return;

			var eventArg = {
				processDefault: true
			}
			this.fireEvent("onTriggerClick", this, eventArg)
			if (eventArg.processDefault) {
				trigger.execute(this);
			}

			if (!dorado.Browser.isTouch) {
				$setTimeout(this, function() {
					this._textDom.focus();
				}, 0);
			}
		},

		doOnKeyDown: function(evt) {

			function forwardKeyDownEvent(trigger, editor) {
				if (trigger) {
					if (trigger instanceof Array) {
						for(var i = 0; i < trigger.length; i++) {
							var t = trigger[i];
							if (t.onEditorKeyDown) {
								var result = t.onEditorKeyDown(editor, evt);
								if (result === false) {
									return false;
								}
								else if (!result) {
									break;
								}
							}
						}
					}
					else if (trigger.onEditorKeyDown) {
						if (trigger.onEditorKeyDown(editor, evt) === false) return false;
					}
				}
				return true;
			}

			var retValue = true, trigger = this.get("trigger"), firstTrigger;
			if (trigger) firstTrigger = (trigger instanceof Array) ? trigger[0] : trigger;

			switch(evt.keyCode) {
				case 36: // home
				case 35: // end
				case 38: // up
				case 27:
				{ // esc
					retValue = forwardKeyDownEvent(trigger, this);
					break;
				}
				case 40: // down
					retValue = forwardKeyDownEvent(trigger, this);
					if (retValue && evt.altKey && firstTrigger) {
						this.onTriggerClick(firstTrigger);
						retValue = false;
					}
					break;
				case 118: // F7
					retValue = forwardKeyDownEvent(trigger, this);
					if (retValue && firstTrigger) {
						this.onTriggerClick(firstTrigger);
						retValue = false;
					}
					break;
				case 13: // enter
					retValue = forwardKeyDownEvent(trigger, this);
					if (retValue) {
						var b = this.post();
						retValue = (b === true || b == null);
					}
					break;
				default:
					retValue = forwardKeyDownEvent(trigger, this);
			}
			return retValue;
		},

		/**
		 * 当确认编辑器中的文本被修改(这些修改的内容此时尚未通过确认)时激活的方法。
		 * 例如：当用户在编辑器中键入文本时，不必等到编辑器失去焦点，此方法就会立刻被触发。
		 */
		textEdited: function() {
			this.fireEvent("onTextEdit", this);
			if (this._dataSet && this._entity && this._property && !this._entity.isDirty()) {
				this._entity.setState(dorado.Entity.STATE_MODIFIED);
			}
		},

		setDirty: function(dirty) {
			if (!this._supportsDirtyFlag) return;

			if (!dorado.Browser.isTouch) {
				var dirtyFlag = this._dirtyFlag;
				if (dirty) {
					if (!dirtyFlag) {
						this._dirtyFlag = dirtyFlag = $DomUtils.xCreate({
							tagName: "LABEL",
							className: "d-dirty-flag"
						});
						this._dom.appendChild(dirtyFlag);
					}
					dirtyFlag.style.display = '';
				}
				else {
					if (dirtyFlag) dirtyFlag.style.display = 'none';
				}
			}
			else {
				$invokeSuper.call(this, arguments);
			}
		},

		/**
		 * 当系统尝试确认编辑器中的编辑内容时执行的内部方法。
		 * @param {boolean} [force] 是否强制确认，即忽略对编辑框中内容有没有被修改过的判断，直接确认其中的内容。
		 * @param {boolean} [silent] 是否要在确认数据失败是禁止Dorado7抛出异常信息。
		 * @return boolean 编辑器中的内容是否得到了确认。
		 */
		post: function(force, silent) {
			try {
				var text = this.get("text"), state, result, modified = (this._lastPost != text), validationResults;
				if (force || modified || (this._validationState == "none" && text == '')) {
					this._lastPost = text;
					var eventArg = {
						processDefault: true
					};
					if (force || modified) this.fireEvent("beforePost", this, eventArg);
					if (eventArg.processDefault === false) return false;
					validationResults = this.validate(text);
					if (validationResults) {
						var topValidationResult = dorado.Toolkits.getTopMessage(validationResults);
						if (topValidationResult) {
							state = topValidationResult.state;
							if (state == "error") {
								throw new dorado.widget.editor.PostException(validationResults);
							}
						}
					}

					if (force || modified) {
						this.doPost();
						this.fireEvent("onPost", this);
						result = true;
					}
				}
				if (result) this.setValidationState(state, validationResults);
				return result;
			}
			catch(e) {
				if (e instanceof dorado.widget.editor.PostException) {
					this.setValidationState("error", e.messages);
				}

				var eventArg = {
					exception: e,
					processDefault: true
				};
				this.fireEvent("onPostFailed", this, eventArg);
				if (eventArg.processDefault && !silent) {
					dorado.Exception.processException(e);
				}
				else {
					dorado.Exception.removeException(e);
				}
				return false;
			}
		}
	});

	/**
	 * @author Benny Bao (mailto:benny.bao@bstek.com)
	 * @class 抽象的文本编辑器。
	 * @abstract
	 * @extends dorado.widget.AbstractTextBox
	 */
	dorado.widget.AbstractTextEditor = $extend(dorado.widget.AbstractTextBox, /** @scope dorado.widget.AbstractTextEditor.prototype */ {
		$className: "dorado.widget.AbstractTextEditor",

		ATTRIBUTES: /** @scope dorado.widget.AbstractTextEditor.prototype */ {

			value: {
				skipRefresh: true,
				getter: function() {
					var text = this.get("text");
					if (this._value !== undefined && text === this._valueText) {
						return this._value;
					}
					else {
						if (text === undefined) text = null;
						return text;
					}
				},
				setter: function(value) {
					this._value = value;
					var text = dorado.$String.toText(value);
					this._skipValidateEmpty = true;
					this.validate(text);
					this._text = this._valueText = this._lastObserve = text;
					this.doSetText(text);
					this.setValidationState(null);
				}
			},

			text: {
				skipRefresh: true,
				setter: function(text) {
					this.validate(text);
					this._text = text;
					this.doSetText(text);
					this.setValidationState(null);
				}
			},

			/**
			 * 当文本编辑框中没有任何实际内容时显示的文本。
			 * @type String
			 * @attribute
			 */
			blankText: {},

			/**
			 * 是否非空。
			 * @type boolean
			 * @attribute
			 */
			required: {},

			/**
			 * 最小文本长度。用于对输入值进行校验。默认值为undefined表示不校验最小文本长度。
			 * @type int
			 * @attribute skipRefresh
			 */
			minLength: {
				skipRefresh: true
			},

			/**
			 * 最大文本长度。用于对输入值进行校验。默认值为undefined表示不校验最大文本长度。
			 * @type int
			 * @attribute skipRefresh
			 */
			maxLength: {
				skipRefresh: true
			},

			/**
			 * 是否在获得焦点时自动选中编辑框中的文本。
			 * @type boolean
			 * @default true
			 * @attribute
			 */
			selectTextOnFocus: {
				defaultValue: !dorado.Browser.isTouch
			},

			/**
			 * 数据校验器的数组。
			 * <p>
			 * 此处数组中可放置两种类型的校验器定义：
			 *    <ul>
			 *    <li>直接放入一个校验器的实例对象。</li>
			 *    <li>放入含校验器信息的JSON对象。<br>
			 * 此时可以使用子控件类型名称中"dorado.validator."和"Validator"之间的部分作为$type的简写。
			 *    </li>
			 *    <li>直接放入一个字符串代表$type的简写。</li>
			 *    </ul>
			 * </p>
			 * @type dorado.validator.Validator[]|Object[]|String[]
			 * @attribute
			 * @see dorado.validator.Validator
			 * @see dorado.Toolkits.createInstance
			 */
			validators: {
				setter: function(value) {
					var validators = [];
					for(var i = 0; i < value.length; i++) {
						var v = value[i];
						if (!(v instanceof dorado.validator.Validator)) {
							v = dorado.Toolkits.createInstance("validator", v, function(type) {
								return dorado.util.Common.getClassType("dorado.validator." + type + "Validator", true);
							});
						}
						validators.push(v);
					}
					this._validators = validators;
				}
			}
		},

		createDom: function() {
			var text = this._text, dom = $invokeSuper.call(this);
			if (!text) this.doSetText('');
			return dom;
		},

		/**
		 * 返回编辑框中的文本。
		 * @protected
		 * @return {String} 编辑框中的文本。
		 */
		doGetText: function() {
			if (this._useBlankText) return '';
			return (this._textDom) ? this._textDom.value : this._text;
		},

		/**
		 * 设置编辑框中的文本。
		 * @protected
		 * @parem text {String} 编辑框中的文本。
		 */
		doSetText: function(text) {
			this._useBlankText = (!this._focused && text == '' && this._blankText);
			if (this._textDom) {
				if (this._useBlankText) {
					if (dorado.Browser.msie && dorado.Browser.version < 9 && this._textDom.getAttribute("type") == "password") {
						this._useBlankText = false;
					}
					else {
						text = this._blankText;
					}
				}

				$fly(this._textDom).toggleClass("blank-text", !!this._useBlankText);
				if (this._useBlankText && this._textDom.getAttribute("type") == "password") {
					this._textDom.setAttribute("type", "");
					this._isPassword = true;
				}
				else if (!this._useBlankText && this._isPassword) {
					this._textDom.setAttribute("type", "password");
					delete this._isPassword;
				}
				this._textDom.value = text || '';
			}
			else {
				this._text = text;
			}
		},

		doValidate: function(text) {
			var validationResults = [];
			var skipValidateEmpty = this._skipValidateEmpty;
			this._skipValidateEmpty = false;
			if (!skipValidateEmpty && this._required && text.length == 0) {
				validationResults.push({
					state: "error",
					text: $resource("dorado.data.ErrorContentRequired")
				});
			}
			if (text.length) {
				var validator = $singleton(dorado.validator.LengthValidator);
				validator.set({
					minLength: this._minLength,
					maxLength: this._maxLength
				});
				var results = validator.validate(text);
				if (results) validationResults = validationResults.concat(results);

				if (this._validators) {
					jQuery.each(this._validators, function(i, validator) {
						results = validator.validate(text);
						if (results) validationResults = validationResults.concat(results);
					});
				}
			}
			return validationResults;
		},

		doRefreshData: function() {
			var p = this._property, e = this._entity;
			if (e instanceof dorado.Entity) {
				if (this._dataType) {
					this.set("value", e.get(p));
				}
				else {
					this.set("text", e.getText(p));
				}
			}
			else {
				this.set("value", e[p]);
			}
			this.setDirty(false);
		},

		doPost: function() {
			var p = this._property, e = this._entity;
			if (!p || !e) return false;

			if (this._dataSet) {
				var bindingInfo = this.getBindingInfo();
				if (this._mapping) {
					e.set(p, this.get("value"));
				}
				else if (bindingInfo.propertyDef && bindingInfo.propertyDef._mapping) {
					e.setText(p, this.get("value"));
				}
				else if (bindingInfo.dataType) {
					if (this._dataType == bindingInfo.dataType) {
						e.set(p, this.get("value"));
					}
					else {
						e.setText(p, this.get("text"));
					}
				}
				else {
					e.set(p, this.get("value"));
				}
				//this.timestamp = this._entity.timestamp;
			}
			else {
				if (e instanceof dorado.Entity) {
					var v = this.get("value");
					if (v instanceof dorado.Entity) {
						e.set(p, v);
					}
					else {
						e.setText(p, this.get("text"));
					}
					this.setDirty(e.isDirty(p));
				}
				else {
					e[p] = this.get("value");
					this.setDirty(true);
				}
			}
			return true;
		},

		doOnFocus: function() {
			$invokeSuper.call(this);
			if (this._selectTextOnFocus && this._realEditable) {
				if (this.get("focused") && this._editorFocused) {
					try {
						this._textDom.select();
					}
					catch(e) {
						// do nothing
					}
				}
			}
		}

	});

	/**
	 * @author Benny Bao (mailto:benny.bao@bstek.com)
	 * @component Form
	 * @class 文本编辑器。
	 * @extends dorado.widget.AbstractTextEditor
	 */
	dorado.widget.TextEditor = $extend(dorado.widget.AbstractTextEditor, /** @scope dorado.widget.TextEditor.prototype */ {
		$className: "dorado.widget.TextEditor",

		ATTRIBUTES: /** @scope dorado.widget.TextEditor.prototype */ {

			width: {
				defaultValue: 150
			},

			height: {
				independent: true,
				readOnly: true
			},

			/**
			 * 一组用于定义改变属性编辑框中文字显示方式的"代码"/"名称"键值对。
			 * @type Object[]
			 * @attribute
			 *
			 * @example
			 * // 例如对于一个以逻辑型表示性别的属性，我们可能希望在显示属性值时将true显示为"男"、将false显示为"女"。
			 * textEditor.set("mapping", [
			 *    {
			 * 		key : "true",
			 * 		value : "男"
			 * 	},
			 *    {
			 * 		key : "false",
			 * 		value : "女"
			 * 	}
			 * ]);
			 */
			mapping: {
				setter: function(mapping) {
					this._mapping = mapping;
					if (mapping && mapping.length > 0) {
						var index = this._mappingIndex = {};
						for(var i = 0; i < mapping.length; i++) {
							var key = mapping[i].key;
							if (key == null) {
								key = "${null}";
							}
							else if (key === '') key = "${empty}";
							index[key + ''] = mapping[i].value || null;
						}
					}
					else {
						delete this._mappingIndex;
					}
					delete this._mappingRevIndex;
				}
			},

			value: {
				skipRefresh: true,
				getter: function() {
					var text = (this._editorFocused) ? this.doGetText() : this._text;
					if (this._value !== undefined && text === this._valueText) {
						return this._value;
					}
					else {
						if (text && this._mapping) text = this.getMappedKey(text);
						if (text === undefined) text = null;

						var dataType = this.get("dataType");
						if (dataType) {
							try {
								var value = this._value = dataType.parse(text, this._editorFocused ? this._typeFormat : this._displayFormat);
								this._valueText = text;
								return value;
							}
							catch(e) {
								dorado.Exception.removeException(e);
								return null;
							}
						}
						else {
							return text;
						}
					}
				},
				setter: function(value) {
					this._value = value;
					var valueText, text;
					var dataType = this.get("dataType");
					if (dataType) {
						text = dataType.toText(value, this._editorFocused ? this._typeFormat : this._displayFormat);
						valueText = (this._editorFocused) ? text : dataType.toText(value, this._typeFormat);
					}
					else {
						valueText = text = dorado.$String.toText(value);
					}
					if (text && this._mapping) text = this.getMappedValue(text);
					this._skipValidateEmpty = true;
					this.validate(valueText);
					this._valueText = valueText;
					this._text = this._lastObserve = text;
					this.doSetText(text);
					this.setValidationState(null);
				}
			},

			text: {
				skipRefresh: true,
				getter: function() {
					return ((!this.get("dataType") || this._editorFocused) ? this.doGetText() : this._text) || '';
				},
				setter: function(text) {
					var t = text;
					var dataType = this.get("dataType");
					if (dataType) {
						try {
							if (!this._editorFocused) {
								var value = dataType.parse(t, this._typeFormat);
								t = dataType.toText(value, this._displayFormat);
							}
						}
						catch(e) {
							// do nothing
						}
					}
					this.validate(t);
					this._text = text;
					if (!this._editorFocused) this._lastObserve = text;
					this.doSetText(t);
					this.setValidationState(null);
				}
			},

			/**
			 * 编辑器对应的数据类型。主要用于对编辑器中的文本进行校验和格式化。
			 * @type dorado.data.DataType
			 * @attribute
			 */
			dataType: {
				getter: function() {
					var dataType;
					if (this._dataType) {
						dataType = dorado.LazyLoadDataType.dataTypeGetter.call(this);
					}
					else if (this._property && this._dataSet) {
						var bindingInfo = this._bindingInfo || this.getBindingInfo();
						if (bindingInfo && !(bindingInfo.propertyDef && bindingInfo.propertyDef._mapping)) dataType = bindingInfo.dataType;
					}
					return dataType;
				}

			},

			/**
			 * 是否密码模式。
			 * @type boolean
			 * @attribute
			 * @deprecated
			 */
			password: {},

			/**
			 * 显示格式。此属性只在定义了dataType时才有效。
			 * @type String
			 * @attribute
			 */
			displayFormat: {},

			/**
			 * 输入格式。此属性只在定义了dataType时才有效。
			 * @type String
			 * @attribute skipRefresh
			 */
			typeFormat: {
				skipRefresh: true
			},

			modified: {
				getter: function() {
					return (this._editorFocused) ? (this._lastPost == this.doGetText()) : false;
				}
			},

			trigger: {
				getter: function(p, v) {
					var trigger = this._trigger;
					if (trigger === undefined && this._view) {
						var dataType = this.get("dataType"), dtCode = dataType ? dataType._code : 0;
						if (dtCode == dorado.DataType.DATE) {
							trigger = this._view.id("defaultDateDropDown");
						}
						else if (dtCode == dorado.DataType.DATETIME) trigger = this._view.id("defaultDateTimeDropDown");
					}
					return trigger;
				}
			}
		},

		createTextDom: function() {
			var textDom = document.createElement("INPUT");
			textDom.className = "editor";
			if (this._password) {
				textDom.type = "password";
			}
			else {
				var dataType = this.get("dataType");
				if (dataType && dataType.code >= dorado.DataType.PRIMITIVE_INT && dataType.code <= dorado.DataType.FLOAT) {
					textDom.type = "number";
				}
			}

			if (dorado.Browser.msie && dorado.Browser.version > 7) {
				textDom.style.top = 0;
				textDom.style.position = "absolute";
			}
			else {
				textDom.style.padding = 0;
			}

			if (dorado.Browser.isTouch) {
				textDom.setAttribute("form", dorado.widget.editor.GET_DEAMON_FORM().id);
			}

			return textDom;
		},

		doValidate: function(text) {
			var validationResults = [];
			try {
				if (text.length) {
					if (this._mapping && this.getMappedKey(text) === undefined) {
						validationResults.push({
							state: "error",
							text: $resource("dorado.form.InputTextOutOfMapping")
						});
					}
				}

				var dataType = this.get("dataType");
				if (dataType) dataType.parse(text, this._typeFormat);
				validationResults = $invokeSuper.call(this, arguments);
			}
			catch(e) {
				dorado.Exception.removeException(e);
				validationResults = [
					{
						state: "error",
						text: dorado.Exception.getExceptionMessage(e)
					}
				];
			}
			return validationResults;
		},

		/**
		 * 将给定的数值翻译成显示值。
		 * @param {String} key 要翻译的键值。
		 * @return {Object} 显示值。
		 * @see dorado.widget.AbstractTextEditor#attribute:mapping
		 */
		getMappedValue: function(key) {
			if (key == null) {
				key = "${null}";
			}
			else if (key === '') key = "${empty}";
			return this._mappingIndex ? this._mappingIndex[key + ''] : undefined;
		},

		/**
		 * 根据给定的显示值返回与其匹配的键值。
		 * @param {Object} value 要翻译的显示值。
		 * @return {String} 键值。
		 * @see dorado.widget.AbstractTextEditor#attribute:mapping
		 */
		getMappedKey: function(value) {
			if (!this._mappingRevIndex) {
				var index = this._mappingRevIndex = {}, mapping = this._mapping;
				for(var i = 0; i < mapping.length; i++) {
					var v = mapping[i].value;
					if (v == null) {
						v = "${null}";
					}
					else if (v === '') v = "${empty}";
					index[v + ''] = mapping[i].key;
				}
			}
			if (value == null) {
				value = "${null}";
			}
			else if (value === '') value = "${empty}";
			return this._mappingRevIndex[value + ''];
		},

		doOnFocus: function() {
			var maxLength = this._maxLength || 0;
			if (!this._realReadOnly && !this._mapping) {
				var dataType = this.get("dataType");
				if (dataType) {
					if (this._validationState != "error") {
						var text = dataType.toText(this.get("value"), this._typeFormat);
						this.doSetText(text);
					}
					var dCode = dataType._code;
					if (dCode == dorado.DataType.PRIMITIVE_CHAR || dCode == dorado.DataType.CHARACTER) {
						maxLength = 1;
					}
				}
			}
			if (maxLength) {
				this._textDom.setAttribute("maxLength", maxLength);
			}
			else {
				this._textDom.removeAttribute("maxLength");
			}

			$invokeSuper.call(this);
		},

		doOnBlur: function() {
			if (this._realReadOnly) {
				$invokeSuper.call(this);
			}
			else {
				this._text = this.doGetText();
				try {
					$invokeSuper.call(this);
				}
				finally {
					var text, dataType = this.get("dataType");
					if (dataType && !this._mapping && this._validationState != "error") {
						text = dataType.toText(this.get("value"), this._displayFormat);
					}
					else {
						text = this._text;
					}
					this.doSetText(text);
				}
			}
		},

		doOnKeyPress: function(evt) {
			var dataType = this.get("dataType");
			if (!dataType) return true;

			var k = (evt.keyCode || evt.which);
			if (dorado.Browser.mozilla) {
				// backspace, left, top, right, bottom
				if ([8, 37, 38, 39, 40].indexOf(k) >= 0) return true;
			}

			var b = true, $d = dorado.DataType;
			switch(dataType._code) {
				case $d.INTEGER:
				case $d.PRIMITIVE_INT:
					b = (k == 44 || k == 45 || (k >= 48 && k <= 57));
					break;
				case $d.FLOAT:
				case $d.PRIMITIVE_FLOAT:
					b = (k == 44 || k == 45 || k == 46 || (k >= 48 && k <= 57));
					break;
			}
			return b;
		}
	});

	/**
	 * @author Benny Bao (mailto:benny.bao@bstek.com)
	 * @component Form
	 * @class 密码编辑器。
	 * @extends dorado.widget.AbstractTextEditor
	 */
	dorado.widget.PasswordEditor = $extend(dorado.widget.AbstractTextEditor, /** @scope dorado.widget.PasswordEditor.prototype */ {
		$className: "dorado.widget.PasswordEditor",

		ATTRIBUTES: /** @scope dorado.widget.PasswordEditor.prototype */ {

			width: {
				defaultValue: 150
			},

			height: {
				independent: true,
				readOnly: true
			}
		},

		createTextDom: function() {
			var textDom = document.createElement("INPUT");
			textDom.className = "editor";
			textDom.type = "password";
			if (dorado.Browser.msie && dorado.Browser.version > 7) {
				textDom.style.top = 0;
				textDom.style.position = "absolute";
			}
			else {
				textDom.style.padding = 0;
			}
			return textDom;
		},

		doOnFocus: function() {
			var maxLength = this._maxLength || 0;
			if (maxLength) {
				this._textDom.setAttribute("maxLength", maxLength);
			}
			else {
				this._textDom.removeAttribute("maxLength");
			}

			$invokeSuper.call(this);
		}
	});
})();

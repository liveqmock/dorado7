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
 * @author Frank Zhang (mailto:frank.zhang@bstek.com)
 * @component Form
 * @class 复选框组件
 * <p>
 * 复选框组件，并非对系统的checkbox进行的包装，因此支持三态。
 * </p>
 * <p>
 * 该组件有三种状态：on、off、mixed，对应的值分别为复选框的onValue、offValue、mixedValue属性的值，对应的checked的值为true、false、null。
 * </p>
 * <p>
 * triState属性主要影响的是用户操作层面，即使triState=false，通过设置 value=mixedValue或checked=null，仍可以使CheckBox进入第三态。但是在triState=false时用户不能通过 鼠标点击令CheckBox进入第三态；而当triState=true时点击CheckBox，其状态在on、off、mixed三种状态中循环变化。
 * </p>
 * @extends dorado.widget.AbstractDataEditor
 */
dorado.widget.CheckBox = $extend(dorado.widget.AbstractDataEditor, /** @scope dorado.widget.CheckBox.prototype */ {
	$className: "dorado.widget.CheckBox",
	
	ATTRIBUTES: /** @scope dorado.widget.CheckBox.prototype */ {
		className: {
			defaultValue: "d-checkbox"
		},
		
		height: {
			independent: true
		},
		
		/**
		 * 是否只显示图标、不显示文字。主要在Grid和Tree中作为编辑器的时候被使用。
		 * @attribute writeBeforeReady
		 * @default false
		 * @type boolean
		 */
		iconOnly: {
			writeBeforeReady: true
		},
		
		/**
		 * 当复选框被选中的时候的value值。
		 * @type int|boolean|Object
		 * @default true
		 * @attribute
		 */
		onValue: {
			defaultValue: true
		},
		
		/**
		 * 当复选框未被选中的时候的value值。
		 * @type int|boolean|Object
		 * @default false
		 * @attribute
		 */
		offValue: {
			defaultValue: false
		},
		
		/**
		 * 当复选框处于第三态时的value值。
		 * @type int|boolean|Object
		 * @attribute
		 */
		mixedValue: {},
		
		/**
		 * 复选框右侧显示的文本。
		 * @type String
		 * @attribute
		 */
		caption: {},
		
		/**
		 * 复选框的值。
		 * @type int|boolean|Object
		 * @attribute
		 */
		value: {
			defaultValue: false,
			getter: function() {
				return this._checked ? this._onValue : ((this._checked === null || this._checked === undefined) ? this._mixedValue : this._offValue);
			},
			setter: function(v) {
				if (this._onValue === v) {
					this._checked = true;
				} 
				else if (this._offValue === v) {
					this._checked = false;
				} else {
					this._checked = null;
				}
				if (!this._dataSet && this._rendered) {
					this._lastPost = this._checked;
				}
			}
		},
		
		/**
		 * 复选框是否被选中。
		 * @type Boolean
		 * @default false
		 * @attribute
		 */
		checked: {
			defaultValue: false,
			setter: function(value) {
				if (this._triState) {
					this._checked = value;
				} else {
					this._checked = !!value;
				}
			}
		},
		
		/**
		 * 是否3态复选框，即是否启用复选框的mixed状态。
		 * @type boolean
		 * @default false
		 * @attribute
		 */
		triState: {
			defaultValue: false
		}
	},
	
	EVENTS: /** @scope dorado.widget.CheckBox.prototype */ {
		/**
		 * 当复选框的value发生变化的时候触发的事件。
		 * @param {Object} self 事件的发起者，即组件本身。
		 * @param {Object} arg 事件参数。
		 * @return {boolean} 是否要继续后续事件的触发操作，不提供返回值时系统将按照返回值为true进行处理。
		 * @event
		 */
		onValueChange: {}
	},

    //event: 传入true强制执行onClick，用来响应键盘事件。
	onClick: function(event) {
		var checkBox = this;
		
		if (checkBox._readOnly || this._readOnly2) {
			return;
		}

        if (event !== true && event.target == checkBox._dom) return;

		var checked = checkBox._checked;
		if (checkBox._triState) {
			if (checkBox._checked === null || checkBox._checked === undefined) {
				checkBox._checked = true;
			} else if (checkBox._checked === true) {
				checkBox._checked = false;
			} else {
				checkBox._checked = null;
			}
		} else {
			checkBox._checked = !checkBox._checked;
		}

		var postResult = checkBox.post();
		if (postResult == false) {
			checkBox._checked = checked;
		}

		checkBox.refresh();
		checkBox.fireEvent("onValueChange", checkBox);
	},

	post: function() {
		var modified = (this._lastPost !== this._checked);
		if (!modified) return true;

		var lastPost = this._lastPost;
		try {
			this._lastPost = this._checked;
			var eventArg = {
				processDefault: true
			};
			this.fireEvent("beforePost", this, eventArg);
			if (eventArg.processDefault === false) return false;
			if (this.doPost) this.doPost();
			this.fireEvent("onPost", this);
			return true;
		}
		catch (e) {
			this._lastPost = lastPost;
			dorado.Exception.processException(e);
			return false;
		}
	},

	refreshDom: function(dom) {
		$invokeSuper.call(this, arguments);
		
		var checkBox = this, checked = checkBox._checked, caption = checkBox._caption || '';
		
		this.refreshExternalReadOnly();

		$fly(dom).toggleClass(checkBox._className + "-icononly", !!checkBox._iconOnly)
			.toggleClass(checkBox._className + "-readonly", (checkBox._readOnly || checkBox._readOnly2));

		if (checkBox._dataSet) {
			checked = undefined;
			var value, dirty;
			if (checkBox._property) {
				var bindingInfo = checkBox._bindingInfo;
				var dt = bindingInfo.dataType;
				if (dt) {
					var config;
					switch (dt._code) {
						case dorado.DataType.BOOLEAN:{
							config = {
								triState: true
							};
							break;
						}
						case dorado.DataType.PRIMITIVE_INT:
						case dorado.DataType.PRIMITIVE_FLOAT:{
							config = {
								offValue: 0,
								onValue: 1
							};
							break;
						}
						case dorado.DataType.INTEGER:
						case dorado.DataType.FLOAT:{
							config = {
								offValue: 0,
								onValue: 1,
								triState: true
							};
							break;
						}
					}
					if (config) {
						this.set(config, {
							preventOverwriting: true
						});
					}
				}
				
				if (bindingInfo.entity instanceof dorado.Entity) {
					value = bindingInfo.entity.get(checkBox._property);
					dirty = bindingInfo.entity.isDirty(checkBox._property);
				}
			}
			
			value += '';
			if (value == (checkBox._onValue + '')) {
				checked = true;
			} else if (value == (checkBox._offValue + '')) {
				checked = false;
			}
			checkBox._checked = checked;
            checkBox._lastPost = checked;
			checkBox.setDirty(dirty);
		}
		
		var iconEl = dom.firstChild;
		if (checked) {
			$fly(iconEl).removeClass("unchecked halfchecked").addClass("checked");
		} else if (checked == null && checkBox._triState) {
			$fly(iconEl).removeClass("checked unchecked").addClass("halfchecked");
		} else {
			$fly(iconEl).removeClass("checked halfchecked").addClass("unchecked");
		}
		
		if (!checkBox._iconOnly) {
			iconEl.nextSibling.innerText = caption;
		}
	},
	
	createDom: function() {
		var checkBox = this, dom, doms = {};
		if (checkBox._iconOnly) {
			dom = $DomUtils.xCreate({
				tagName: "SPAN",
				className: checkBox._className,
				content: {
					tagName: "SPAN",
					className: "icon"
				}
			});
		} else {
			dom = $DomUtils.xCreate({
				tagName: "SPAN",
				className: checkBox._className,
				content: [{
					tagName: "SPAN",
					className: "icon",
                    contextKey: "icon"
				}, {
					tagName: "SPAN",
					className: "caption",
                    contextKey: "caption",
					content: checkBox._caption || ''
				}]
			});
		}
		
		$fly(dom).hover(function() {
			if (!(checkBox._readOnly || checkBox._readOnly2)) {
				if (checkBox._checked) {
					$fly(dom).removeClass("d-checkbox-checked").addClass("d-checkbox-hover");
				} else if (checkBox._checked == null) {
					$fly(dom).removeClass("d-checkbox-halfchecked").addClass("d-checkbox-hover");
				} else {
					$fly(dom).removeClass("d-checkbox-unchecked").addClass("d-checkbox-hover");
				}
			}
		}, function() {
			$fly(dom).removeClass("d-checkbox-hover");
			if (checkBox._checked) {
				$fly(dom).addClass("d-checkbox-checked");
			} else if (checkBox._checked === null || checkBox._checked === undefined) {
				$fly(dom).addClass("d-checkbox-halfchecked");
			} else {
				$fly(dom).addClass("d-checkbox-unchecked");
			}
		});		
		return dom;
	},
	
	doOnKeyDown: function(evt) {
		var retValue = true;
		switch (evt.keyCode) {
			case 32:
				// space
				this.onClick(true);
				retValue = false;
				break;
		}
		return retValue;
	}
});

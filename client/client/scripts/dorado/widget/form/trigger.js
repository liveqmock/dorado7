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
 * @component Trigger
 * @class 与编辑框相关联的触发器。
 * @extends dorado.widget.Component
 */
dorado.widget.Trigger = $extend(dorado.widget.Component, /** @scope dorado.widget.Trigger.prototype */ {
	$className: "dorado.widget.Trigger",
	
	ATTRIBUTES: /** @scope dorado.widget.Trigger.prototype */ {
	
		/**
		 * CSS类名。
		 * @type String
		 * @attribute writeBeforeReady
		 */
		className: {
			defaultValue: "d-trigger",
			writeBeforeReady: true
		},
		
		/**
		 * 扩展CSS类名。
		 * @type String
		 * @attribute
		 */
		exClassName: {
			skipRefresh: true,
			setter: function(v) {
				if (this._rendered && this._exClassName) {
					$fly(this.getDom()).removeClass(this._exClassName);
				}
				this._exClassName = v;
				if (this._rendered && v) {
					$fly(this.getDom()).addClass(v);
				}
			}
		},
		
		/**
		 * 图标。
		 * @type String
		 * @attribute
		 */
		icon: {
			writeBeforeReady: true
		},
		
		/**
		 * 图标元素的CSS Class。
		 * @type String
		 * @attribute
		 * @default "d-trigger-icon-custom"
		 */
		iconClass: {
			writeBeforeReady: true,
			defaultValue: "d-trigger-icon-custom"
		},
		
		/**
		 * 是否允许用在相应的编辑框中进行文本输入。
		 * @type boolean
		 * @attribute
		 * @default true
		 */
		editable: {
			defaultValue: true
		},
		
		/**
		 * 其在对应编辑框上的触发按钮是否可见。
		 * @type boolean
		 * @attribute
		 * @default true
		 */
		buttonVisible: {
			defaultValue: true
		}
	},
	
	EVENTS: /** @scope dorado.widget.Trigger.prototype */ {
	
		/**
		 * 当触发器被触发之前激活的事件。
		 * <p>
		 * 即当用户点击关联在编辑框上的触发器按钮时，本事件将被触发。
		 * </p>
		 * @param {Object} self 事件的发起者，即控件本身。
		 * @param {Object} arg 事件参数。
		 * @param {dorado.widget.AbstractTextEditor} arg.editor 激活此触发器的编辑框。
		 * @param {boolean} #arg.processDefault=true 是否继续执行后续的触发器动作。
		 * @return {boolean} 是否要继续后续事件的触发操作，不提供返回值时系统将按照返回值为true进行处理。
		 * @event
		 */
		beforeExecute: {},
		
		/**
		 * 当触发器被触发时激活的事件。
		 * <p>
		 * 即当用户点击关联在编辑框上的触发器按钮时，本事件将被触发。
		 * </p>
		 * @param {Object} self 事件的发起者，即控件本身。
		 * @param {Object} arg 事件参数。
		 * @param {dorado.widget.AbstractTextEditor} arg.editor 激活此触发器的编辑框。
		 * @return {boolean} 是否要继续后续事件的触发操作，不提供返回值时系统将按照返回值为true进行处理。
		 * @event
		 */
		onExecute: {}
	},
	
	/**
	 * 当鼠标在绑定了此触发器的编辑框中按下时触发的事件。
	 * @dorado.widget.Trigger#onEditorMouseDown
	 * @function
	 * @abstract
	 * @param {dorado.widget.AbstractTextEditor} editor 鼠标操作的编辑框。
	 * @protected
	 */
	/**
	 * 当绑定了此触发器的编辑框获得控制焦点时触发的事件。
	 * @dorado.widget.Trigger#onEditorFocus
	 * @function
	 * @abstract
	 * @param {dorado.widget.AbstractTextEditor} editor 获得焦点的编辑框。
	 * @protected
	 */
	/**
	 * 当绑定了此触发器的编辑框失去控制焦点时触发的事件。
	 * @dorado.widget.Trigger#onEditorBlur
	 * @function
	 * @abstract
	 * @param {dorado.widget.AbstractTextEditor} editor 失去焦点的编辑框。
	 * @protected
	 */
	/**
	 *当绑定了此触发器的编辑框在拥有控制焦点时并有按键被被按下时触发的事件。
	 * @dorado.widget.Trigger#onEditorKeyDown
	 * @function
	 * @abstract
	 * @param {dorado.widget.AbstractTextEditor} editor 激活此方法的编辑框。
	 * @param {Event} evt 系统事件中的Event对象。
	 * @protected
	 */
	// =====
	
	/**
	 * 创建用于显示在关联的编辑框中的触发按钮。
	 * @param {dorado.widget.AbstractTextEditor} editor 创建的触发按钮将被用于现在哪个编辑框中。
	 * @return {dorado.widget.Control} 作为触发按钮的控件。
	 */
	createTriggerButton: function(editor) {
		var trigger = this;
		if (!trigger._buttonVisible) return;
		
		var control = new dorado.widget.SimpleIconButton({
			exClassName: (trigger._className || '') + " " + (trigger._exClassName || ''),
			icon: trigger._icon,
			iconClass: (trigger._icon ? null : trigger._iconClass),
			onMouseDown: function(self, arg) {
				dorado.widget.setFocusedControl(self);
				arg.returnValue = false;
			},
			onClick: function(self, arg) {
				editor.onTriggerClick(trigger);
				arg.returnValue = false;
			}
		});
		jQuery(control.getDom()).addClassOnClick("d-trigger-down", null, function() {
			return !editor.get("readOnly");
		});
		return control;
	},
	
	/**
	 * 执行该触发器。此方法一般应由系统内部调用。
	 * @param {dorado.widget.AbstractTextEditor} editor 激活此触发器的编辑框。
	 */
	execute: function(editor) {
		this.fireEvent("onExecute", this, {
			editor: editor
		});
	}
});

dorado.widget.View.registerDefaultComponent("triggerClear", function() {
	return new dorado.widget.Trigger({
		exClassName : "d-trigger-clear",
		iconClass : "d-trigger-icon-clear",
		onExecute : function(self, arg) {
			arg.editor.set("text", "");
			arg.editor.post();
		}
	});
});

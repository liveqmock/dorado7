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
 * @class dorado.debug.DebugPanel
 * @extends dorado.widget.Panel
 */

dorado.debug.initProcedures.push(function(){
	dorado.debug.DebugPanel = $extend(dorado.widget.Panel, /** @scope dorado.debug.DebugPanel.prototype */{
		$className: "dorado.debug.DebugPanel",
		EVENTS: /** @scope dorado.debug.DebugPanel.prototype */{
			/**
			 * 当代码执行错误的时候触发的事件。
			 * @param {Object} self 事件的发起者，即组件本身。
			 * @param {Object} arg 事件参数。
			 * @return {boolean} 是否要继续后续事件的触发操作，不提供返回值时系统将按照返回值为true进行处理。
			 * @event
			 */
			onRunCodeError: {}
		},
		constructor: function(config) {
			config = config || {};
	
			var panel = this;
	
			var codeTextArea = new dorado.widget.TextArea({
				width: "100%",
				layoutConstraint: "center"
			});
	
			config.children = [{
				$type: "ToolBar",
				items: [{
					caption: "Run",
					iconClass: "d-debugger-script-run-icon",
					tip: "Run Code",
					listener: {
						onClick: function() {
							var code = "var $it = $topView._children.iterator(), view; while($it.hasNext()) { var control = $it.next(); if (control instanceof dorado.widget.View) { view = control; break; } }"
							code += codeTextArea.get("text");
							if (dorado.Debugger.trapError) {
								try {
									eval(code);
								}
								catch (e) {
									var errorMsg;
									if (!dorado.Browser.msie) {
										errorMsg = "name: " + e.name + "\nmessage: " + e.message + "\nstack: " + e.stack;
									} else {
										errorMsg = "name: " + e.name + "\nerrorNumber: " + (e.number & 0xFFFF) + "\nmessage: " + e.message;
									}
									panel.fireEvent("onRunCodeError", panel, {
										errorMsg: errorMsg
									});
							}
							} else {
								eval(code);
							}
						}
					}
				}, {
					caption: "Clear",
					tip: "Clear Code",
					iconClass: "d-debugger-script-clear-icon",
					listener: {
						onClick: function() {
							codeTextArea.set("text", "");
						}
					}
				}, "->", {
					$type: "CheckBox",
					caption: "Trap Error",
					width: 100,
					checked: dorado.Debugger.trapError,
					listener: {
						onValueChange: function(self) {
							dorado.Debugger.trapError = self._checked;
						}
					}
				}],
				layoutConstraint: "top"
			}, codeTextArea];
	
			$invokeSuper.call(this, [config]);
		}
	});
	
	dorado.Debugger.registerModule({
		$type: "Control",
		caption: "Script",
		control: new dorado.debug.DebugPanel({
			border: "none",
			layout: new dorado.widget.layout.DockLayout({
				padding: 0
			}),
			onRunCodeError: function(self, arg) {
				var errorMsg = arg.errorMsg;
				//find TabControl
				self._parent._parent.set("currentTab", "console");
				var logDom = dorado.Debugger.log(errorMsg, "error");
			}
		})
	});
});

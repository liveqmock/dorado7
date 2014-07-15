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
	var DEBUGGER_SHOW_ON_VISIBLE_KEY = "dorado.Debugger.showOnVisible";

	function setCookie(name, value, expire) {
		var exp = new Date();
		exp.setTime(exp.getTime() + expire);
		document.cookie = name + "=" + escape(value) + ";expires=" + exp.toGMTString();
	}
	
	function getCookie(name) {
		var arr = document.cookie.match(new RegExp("(^| )" + name + "=([^;]*)(;|$)"));
		if (arr != null) return unescape(arr[2]);
		return null;
	}
	
	function delCookie(name) {
		var exp = new Date();
		exp.setTime(exp.getTime() - 1);
		var cval = getCookie(name);
		if (cval != null) document.cookie = name + "=" + cval + ";expires=" + exp.toGMTString();
	}

	/**
	 * @name dorado.debug
	 * @namespace Debugger使用的命名空间。
	 */
	dorado.debug = {
		initProcedures: []
	};

	/**
	 * @author Frank Zhang (mailto:frank.zhang@bstek.com)
	 * @class dorado.Debugger
	 * @static
	 */
	dorado.Debugger = {
		inited: false,
		initTabs: [],
		moduleActiveEvent: {},
		trapError: true,

		/**
		 * 把文本转换成html。
		 * @param {String} text 要转换成html的文本。
		 */
		format2HTML: function(text) {
			var reg1 = new RegExp("&", "g"), pattern = new RegExp("[<>\"\n\t]", "g"), map = {
				"<": "&lt;",
				">": "&gt;",
				"\n": "<br/>",
				"\t": "&nbsp;&nbsp;",
				"\"": "&quot;"
			};

			return text.replace(reg1, "&amp;").replace(pattern, function(string) {
				return map[string];
			});
		},

		/**
		 * @private
		 */
		init: function() {
			var tabControl = new dorado.widget.TabControl({
				$type: "TabControl",
				tabs: dorado.Debugger.initTabs,
				onTabChange: function(self, arg) {
					var tab = arg.newTab;
					if (tab && tab._name){
						var callback = dorado.Debugger.moduleActiveEvent[tab._name];
						if (callback) {
							callback.apply(this, arguments);
						}
					}
				}
			});

			var dialog = new dorado.widget.Dialog({
				layout: {
					$type: "Dock",
					padding: 1
				},
				caption: "Dorado Debugger(" +  dorado.Core.VERSION + ")",
				width: 800,
				height: 500,
				dragOutside: true,
				center: true,
				maximizeable: true,
				exClassName: "d-debugger",
				contentOverflow: "hidden",

				children: [tabControl, {
					$type: "Container",
					layout: {
						$type: "Dock",
						padding: 4
					},
					layoutConstraint: "bottom",
					height: 30,
					children: [{
						$type: "CheckBox",
						caption: "Visible on load",
						checked: !!getCookie(DEBUGGER_SHOW_ON_VISIBLE_KEY),
						listener: {
							onValueChange: function(self) {
								if (self._value) {
									setCookie(DEBUGGER_SHOW_ON_VISIBLE_KEY, true, 3600 * 24 * 365 * 1000);
								} else {
									delCookie(DEBUGGER_SHOW_ON_VISIBLE_KEY);
								}
							}
						}
					}]
				}]
			});

			this.tabControl = tabControl;
			this.dialog = dialog;

			this.inited = true;
		},

		/**
		 * 为dorado.Debugger增加方法和属性。
		 * @param {Object} source 要增加的方法和属性的json。
		 */
		extend: function(source) {
			for (var prop in source) {
				dorado.Debugger[prop] = source[prop];
			}
		},

		/**
		 * 为dorado.Debugger注册模块。
		 * @param {Object} config 注册模块信息，该信息其实为TabControl中的Tab的配置信息。
		 */
		registerModule: function(config) {
			var deb = dorado.Debugger;
			config = config || {};
			if (config.name && config.onActive) {
				deb.moduleActiveEvent[config.name] = config.onActive;
				delete config.onActive;
			}
			if (!deb.inited) {
				deb.initTabs.push(config);
			} else {
				this.tabControl.addTab(config);
			}
		},

		/**
		 * 显示dorado.Debugger。
		 */
		show: function() {
			$import("tree-grid", function() {
				if (dorado.debug.initProcedures) {
					dorado.debug.initProcedures.each(function(proc) {
						proc.call();
					});
					delete dorado.debug.initProcedures;
				}
				
				var deb = dorado.Debugger;
				if (!deb.inited) {
					deb.init();
				}
				deb.dialog.show();
			});
		}
	};

	jQuery(document).ready(function() {
		var showOnVisible = getCookie(DEBUGGER_SHOW_ON_VISIBLE_KEY);
		if (showOnVisible) {
			dorado.Debugger.show();
		}
		
		var $document = jQuery(document);
		$document.bind("keydown", "f2", function() {
			dorado.Debugger.show();
		});
		$document.bind("keydown", "ctrl+f12", function() {
			dorado.Debugger.show();
		});
	});

})();

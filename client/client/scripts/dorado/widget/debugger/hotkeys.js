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

dorado.debug.initProcedures.push(function(){
	function HotKey(config) {
		for (var prop in config) {
			this[prop] = config[prop];
		}
	}

	HotKey.prototype.toString = function() {
		return this.key + "(" + this.type + ")";
	};

	/**
	 * @author Frank Zhang (mailto:frank.zhang@bstek.com)
	 * @class dorado.debug.HotkeysPanel
	 * @extends dorado.widget.SplitPanel
	 */
	dorado.debug.HotkeysPanel = $extend(dorado.widget.SplitPanel, /** @scope dorado.debug.HotkeysPanel.prototype */{
		$className: "dorado.debug.HotkeysPanel",
		constructor: function(config) {
			config = config || {};

			var panel = this;

			var codePreview = new dorado.widget.HtmlContainer({
				width: "100%",
				height: "100%",
				style: "display: block"
			});

			var keyList = new dorado.widget.ListBox({
				style: "border: 0",
				onCurrentChange: function(self, arg) {
					var item = self.getCurrentItem(), code = "";
					if (item && item.callback) {
						code = item.callback.cb.toString();
					}
					codePreview._dom.innerHTML = "<pre>" + code +"</pre>"
				}
			});

			this._keyList = keyList;

			config = {
				position: 200,
				sideControl: {
					$type: "Panel",
					caption: "Hotkey",
					tools: [{
						$type: "SimpleIconButton",
						iconClass: "d-debugger-hotkey-refresh-icon",
						listener: {
							onClick: function() {
								panel.reload();
							}
						}
					}],
					children: [keyList]
				},
				mainControl: codePreview
			};

			$invokeSuper.call(this, [config]);
		},
		/**
		 * 重新加载Hotkeys的数据。
		 */
		reload: function() {
			var result = [];
			if (hotkeys && hotkeys.triggersMap) {
				var triggersMap = hotkeys.triggersMap;
				for (var prop in triggersMap) {
					var target = triggersMap[prop];
					for (var type in target) {
						var keyList = target[type];
						for (var key in keyList) {
							var callbacks = keyList[key] || [];
							for (var i =0, j = callbacks.length; i < j; i++) {
								result.push(new HotKey({
									type: type,
									key: key,
									callback: callbacks[i]
								}));
							}
						}
					}
				}

				this._keyList.set("items", result);
			}
			this._keyList.refresh();
		}
	});

	var hotkeysPanel = new dorado.debug.HotkeysPanel(), loaded = false;

	dorado.Debugger.registerModule({
		$type: "Control",
		name: "hotkey",
		caption: "Hotkey",
		control: hotkeysPanel,
		onActive: function() {
			if (!loaded) {
				hotkeysPanel.reload();

				loaded = true;
			}
		}
	});
});

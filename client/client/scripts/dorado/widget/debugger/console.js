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

dorado.debug.initProcedures.push(function() {
	var LOG_LEVELS = {
		debug: 10,
		info: 9,
		warn: 8,
		error: 7,
		10: "debug",
		9: "info",
		8: "warn",
		7: "error"
	};

	/**
	 * @author Frank Zhang (mailto:frank.zhang@bstek.com)
	 * @class dorado.debug.Logger
	 * @extends dorado.widget.Control
	 */
	dorado.debug.Logger = $extend(dorado.widget.Control, /** @scope dorado.debug.Logger.prototype */{
		$className: "dorado.debug.Logger",

		ATTRIBUTES: /** @scope dorado.debug.Logger.prototype */{
			className: {
				defaultValue: "d-debugger-logger"
			},

			/**
			 * 是否锁定滚动条，默认为false。
			 * @attribute
			 * @type boolean
			 */
			lockScrollBar: {},

			/**
			 * 显示的日志的level，可选值debug,info,warn,error。
			 * @attribute
			 * @type String
			 * @default "debug"
			 */
			level: {
				defaultValue: "debug",
				setter: function(value) {
					var logger = this, oldValue = logger._level, dom = logger._dom, i;
					value = value || "debug";
					if (oldValue && dom) {
						if (LOG_LEVELS[oldValue] > LOG_LEVELS[value]) {//set some type hide
							for (i = LOG_LEVELS[value] + 1; i <= LOG_LEVELS[oldValue]; i++) {
								$fly(dom).find(".log-" + LOG_LEVELS[i]).css("display", "none");
							}
						} else if (LOG_LEVELS[oldValue] < LOG_LEVELS[value]) {//set some type show
							for (i = LOG_LEVELS[oldValue] + 1; i <= LOG_LEVELS[value]; i++) {
								$fly(dom).find(".log-" + LOG_LEVELS[i]).css("display", "");
							}
						}
						if (!logger._lockScrollBar) {
							logger.scrollToEnd();
						}
					}
					this._level = value;
				}
			}
		},

		/**
		 * 清除所有的日志。
		 */
		clear: function() {
			var logger = this, logs = logger._logs;
			if (logs) {
				logs = [];
				var dom = logger._dom;
				if (dom) dom.innerHTML = "";
			}
		},

		/**
		 * 在Logger上使用指定的level来记录日志。
		 * @param {String} msg 要记录的日志字符串。
		 * @param {String} [level="debug"] 要记录的日志的level。
		 */
		log: function(msg, level) {
			var logger = this, logs = logger._logs;
			level = level in LOG_LEVELS ? level : "debug";
			msg = msg ? msg : "";
			if (!logs) {
				logs = logger._logs = [];
			}

			msg = dorado.Debugger.format2HTML("" + msg);

			logs.push(level + ":" + msg);

			if (logger._rendered) {
				var dom = logger._dom, logDom = $DomUtils.xCreate({
					tagName: "div",
					className: "log log-" + level,
					style: {
						display: LOG_LEVELS[level] > LOG_LEVELS[logger._level] ? "none" : ""
					},
					content: [{
						tagName: "div",
						className: "icon"
					}, {
						tagName: "div",
						className: "msg",
						content: msg
					}]
				});
				dom.appendChild(logDom);
				if (dom.style.display != "none" && !logger._lockScrollBar) {
					$fly(logDom).scrollIntoView(dom);
				}
				return logDom;
			}
		},

		/**
		 * 在Logger上列出指定对象的所有属性。
		 * @param {Object} target 要列出属性的对象。
		 * @param {String} [level="debug"] 要记录的日志的level。
		 */
		dir: function(target, level) {
			var buffer = "{\n";
			for (var prop in target) {
				buffer += "\t" + prop + ": " + target[prop] + "\n";
			}
			buffer += "}\n";
			this.log(buffer, level);
		},

		/**
		 * @private
		 */
		scrollToEnd: function() {
			var logger = this, dom = logger._dom;
			if (dom && dom.style.display != "none") {
				var scrollHeight = dom.scrollHeight, offsetHeight = dom.offsetHeight;
				dom.scrollTop = scrollHeight - offsetHeight;
			}
		},

		createDom: function() {
			var logger = this, dom = $DomUtils.xCreate({
				tagName: "div"
			}), logs = logger._logs, logDom;
			if (logs) {
				for (var i = 0, j = logs.length; i < j; i++) {
					var log = logs[i], semicolonIndex = log.indexOf(":"), level = log.substring(0, semicolonIndex),
						msg = log.substr(semicolonIndex + 1);

					logDom = $DomUtils.xCreate({
						tagName: "div",
						className: "log log-" + level,
						style: {
							display: LOG_LEVELS[level] > LOG_LEVELS[logger._level] ? "none" : ""
						},
						content: [{
							tagName: "div",
							className: "icon"
						}, {
							tagName: "div",
							className: "msg",
							content: msg
						}]
					});

					dom.appendChild(logDom);
				}
				if (!logger._lockScrollBar) {
					logger.scrollToEnd();
				}
			}
			return dom;
		},

		refreshDom: function(dom) {
			var logger = this;
			$invokeSuper.call(this, arguments);
			if (!logger._lockScrollBar) {
				logger.scrollToEnd();
			}
		}
	});

	/**
	 * @author Frank Zhang (mailto:frank.zhang@bstek.com)
	 * @class dorado.debug.ConsolePanel
	 * @extends dorado.widget.Container
	 */
	dorado.debug.ConsolePanel = $extend(dorado.widget.Container, /** @scope dorado.debug.ConsolePanel.prototype */{
		$className: "dorado.debug.ConsolePanel",
		constructor: function(config) {
			config = config || {};

			var panel = this, logger = new dorado.debug.Logger();

			var debugButton = new dorado.widget.SimpleIconButton({
				toggleable: true,
				iconClass: "d-debugger-log-debug-icon",
				toggled: true,
				tip: "Set log level to debug",
				listener: {
					onClick: function() {
						panel.setLogLevel("debug");
					}
				}
			});

			var infoButton = new dorado.widget.SimpleIconButton({
				iconClass: "d-debugger-log-info-icon",
				toggleable: true,
				tip: "Set log level to info",
				listener: {
					onClick: function() {
						panel.setLogLevel("info");
					}
				}
			});

			var warnButton = new dorado.widget.SimpleIconButton({
				iconClass: "d-debugger-log-warn-icon",
				toggleable: true,
				tip: "Set log level to warn",
				listener: {
					onClick: function() {
						panel.setLogLevel("warn");
					}
				}
			});

			var errorButton = new dorado.widget.SimpleIconButton({
				iconClass: "d-debugger-log-error-icon",
				toggleable: true,
				tip: "Set log level to error",
				listener: {
					onClick: function() {
						panel.setLogLevel("error");
					}
				}
			});

			this._debugButton = debugButton;
			this._infoButton = infoButton;
			this._warnButton = warnButton;
			this._errorButton = errorButton;
			this._logger = logger;

			config.children = [{
				$type: "ToolBar",
				items: [{
					caption: "Clear",
					iconClass: "d-debugger-log-clear-icon",
					tip: "Clear log console",
					listener: {
						onClick: function() {
							logger.clear();
						}
					}
				}, {
					caption: "Lock",
					iconClass: "d-debugger-log-lock-icon",
					tip: "Lock log console",
					toggleable: true,
					toggled: logger._lockScrollBar,
					listener: {
						onToggle: function(self) {
							logger._lockScrollBar = self._toggled;
						}
					}
				}, "-", debugButton, infoButton, warnButton, errorButton],
				layoutConstraint: "top"
			}, logger];

			$invokeSuper.call(this, [config]);
		},

		/**
		 * 设置日志level。
		 * @param {String} level 要设置的日志level。
		 */
		setLogLevel: function(level) {
			if (level in LOG_LEVELS) {
				this._logger.set("level", level);

				this._debugButton.set("toggled", level == "debug");
				this._infoButton.set("toggled", level == "info");
				this._warnButton.set("toggled", level == "warn");
				this._errorButton.set("toggled", level == "error");
			}
		},

		/**
		 * 在Logger上使用指定的level来记录日志。
		 * @param {String} msg 要记录的日志字符串。
		 * @param {String} [level="debug"] 要记录的日志的level。
		 */
		log: function(msg, level) {
			return this._logger.log(msg, level);
		},

		/**
		 * 在Logger上列出指定对象的所有属性。
		 * @param {Object} target 要列出属性的对象。
		 * @param {String} [level="debug"] 要记录的日志的level。
		 */
		dir: function(target, level) {
			return this._logger.dir(target, level);
		}
	});

	var consolePanel = new dorado.debug.ConsolePanel({
		layout: {
			$type: "Dock",
			padding: 0
		}
	});

	dorado.Debugger.registerModule({
		$type: "Control",
		name: "console",
		caption: "Console",
		control: consolePanel
	});

	dorado.Debugger.extend(/** @scope dorado.Debugger */{
		consolePanel: consolePanel,

		/**
		 * 在Logger上使用指定的level来记录日志。
		 * @param {String} msg 要记录的日志字符串。
		 * @param {String} [level="debug"] 要记录的日志的level。
		 */
		log: function(msg, level) {
			var deb = dorado.Debugger;
			if (!deb.inited) {
				deb.init();
			}
			return deb.consolePanel.log(msg, level);
		},

		/**
		 * 在Logger上列出指定对象的所有属性。
		 * @param {Object} target 要列出属性的对象。
		 * @param {String} [level="debug"] 要记录的日志的level。
		 */
		dir: function(target, level) {
			var deb = dorado.Debugger;
			if (!deb.inited) {
				deb.init();
			}
			return deb.consolePanel.dir(target, level);
		}
	});
	
	window.$log = dorado.Debugger.log;
    window.$dir = dorado.Debugger.dir;

    if (!window.console) {
        window.console = {
            log: function() {
                $log.apply(null, arguments);
            },
            dir: function() {
                $dir.apply(null, arguments);
            }
        }
    }
});

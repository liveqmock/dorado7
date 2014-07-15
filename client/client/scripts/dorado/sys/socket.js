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

(function () {

	dorado.SocketProtocol = $class(/** @scope dorado.SocketProtocol.prototype */ {
		$className: "dorado.SocketProtocol"
	});

	dorado.LongPollingProtocol = $extend(dorado.SocketProtocol, /** @scope dorado.LongPollingProtocol.prototype */  {
		$className: "dorado.LongPollingProtocol",
		serviceAction: "long-polling",

		constructor: function () {
			this._sockets = new dorado.util.KeyedArray(function (socket) {
				return socket._socketId;
			});
			this._socketIds = [];
			this._pollingOptions = $setting["longPolling.pollingOptions"];
			this._sendingOptions = $setting["longPolling.sendingOptions"];
		},

		connect: function (socket, callback) {
			var self = this;
			if (!self._pollingAjaxEngine || !self._sendingAjaxEngine) {
				self._pollingAjaxEngine = dorado.util.AjaxEngine.getInstance(self._pollingOptions);
				self._sendingAjaxEngine = dorado.util.AjaxEngine.getInstance(self._sendingOptions);
			}

			socket._setState("connecting");
			if (self._connecting && !self._groupId) {
				if (!self._pendingConnects) {
					self._pendingConnects = [];
				}
				self._pendingConnects.push({
					socket: socket,
					callback: callback
				});
			}
			else {
				self.doConnection(socket, callback);
			}
		},

		doConnection: function(socket, callback) {
			var self = this;
			
			self._sendingAjaxEngine.bind("beforeConnect", function() {
				self._connecting = true;
			}, {
				once: true
			}).bind("onDisconnect", function() {
				self._connecting = false;
				
				if (self._polling) {
					self.stopPoll();
				}
				
				if (self._pendingConnects) {
					var pendingConnects = self._pendingConnects;
					delete self._pendingConnects;
					pendingConnects.each(function(c) {
						self.doConnection(c.socket, c.callback);
					});
				}
			}, {
				once: true
			});
			
			self._sendingAjaxEngine.request({
				jsonData: {
					action: self.serviceAction,
					subAction: "hand-shake",
					groupId: self._groupId,
					service: socket._service,
					parameter: socket._parameter,
					responseDelay: ((socket._responseDelay >= 0) ? socket._responseDelay : -1)
				}
			}, {
				callback: function (success, result) {
					if (success) {
						var data = result.getJsonData();
						self._groupId = data.groupId;

						socket._connected(data.socketId);
						self._sockets.append(socket);
						self._socketIds.push(socket._socketId);

						if (!self._polling) {
							self._pollingErrorTimes = 0;
							self.poll();
						}
						
						$callback(callback, success, data.returnValue);
					}
					else {
						$callback(callback, success, result.exception);
					}
				}
			});
		},

		disconnect: function (socket, callback) {
			var self = this;

			socket._setState("disconnecting");
			self._sockets.remove(socket);
			self._socketIds.remove(socket._socketId);

			self._sendingAjaxEngine.request({
				jsonData: {
					action: self.serviceAction,
					subAction: "disconnect",
					socketId: socket._socketId
				}
			}, {
				callback: function (success, result) {
					if (success) {
						socket._disconnected();
					}
					$callback(callback, success, result);
				}
			});
		},

		destroy: function() {
			this._sockets.each(function(socket) {
				socket._disconnected();
			});
		},

		poll: function (callback) {
			var self = this;
			if (!self._groupId) {
				throw new dorado.Exception("Polling groupId undefined.");
			}

			self._polling = true;
			self._pollingAjaxEngine.request({
				jsonData: {
					action: self.serviceAction,
					subAction: "poll",
					groupId: self._groupId,
					socketIds: self._socketIds
				}
			}, {
				callback: function (success, result) {
					if (!success) self._pollingErrorTimes++;
					if (self._pollingErrorTimes < 5 && self._sockets.size) {
						self.poll(callback);
					}
					else {
						self._polling = false;
					}
					
					if (!success && result.exception instanceof dorado.util.AjaxException && result.status == 0) {
						dorado.Exception.removeException(result.exception);
					}

					if (success && result) {
						var messages = result.getJsonData();
						messages.each(function (wrapper) {
							var socket = self._sockets.get(wrapper.socketId);
							if (socket && socket._state == "connected") {
								try {
									var message = wrapper.message;
									if (message.type == "$terminate") {
										socket._disconnected();
										return;
									}
									socket._received(message.type, message.data);
								}
								catch (e) {
									dorado.Exception.processException(e);
								}
							}
						});
					}
					$callback(callback, success, result);
				}
			});
		},
		
		stopPoll: function (callback) {
			var self = this;
			if (!self._groupId) {
				throw new dorado.Exception("Polling groupId undefined.");
			}

			self._sendingAjaxEngine.request({
				jsonData: {
					action: self.serviceAction,
					subAction: "stop-poll",
					groupId: self._groupId
				}
			}, {
				callback: function (success, result) {
					if (success) {
						$callback(callback, success, result.getJsonData());
					}
					else {
						$callback(callback, success, result.exception);
					}
				}
			});
		},

		send: function (socket, type, data, callback) {
			var self = this;
			self._sendingAjaxEngine.request({
				jsonData: {
					action: self.serviceAction,
					subAction: "send",
					socketId: socket._socketId,
					type: type,
					data: data
				}
			}, {
				callback: function (success, result) {
					if (success) {
						$callback(callback, success, result.getJsonData());
					}
					else {
						$callback(callback, success, result.exception);
					}
				}
			});
		}
	});


	dorado.Socket = $extend([dorado.AttributeSupport, dorado.EventSupport], /** @scope dorado.Socket.prototype */ {
		$className: "dorado.Socket",

		ATTRIBUTES: /** @scope dorado.Socket.prototype */ {
			service: {
			},

			parameter: {
			},

			protocol: {
				readOnly: true
			},

			/**
			 * disconnected, connecting, connected, disconnecting
			 */
			state: {
				readOnly: true,
				defaultValue: "disconnected"
			},

			connected: {
				readOnly: true,
				getter: function () {
					return this._state == "connected";
				}
			}
		},

		EVENTS: /** @scope dorado.Socket.prototype */ {
			onConnect: {},
			onDisconnect: {},
			onStateChange: {},
			onReceive: {},
			onSend: {}
		},

		constructor: function (options) {
			this._protocol = this.getSocketProtocol();
			$invokeSuper.call(this, [options]);
			if (options) this.set(options);
		},

		_setState: function (state) {
			if (this._state != state) {
				var oldState = this._state;
				this._state = state;
				this.fireEvent("onStateChange", this, {
					oldState: oldState,
					state: state
				});
			}
		},

		_received: function (type, data) {
			var socket = this;
			socket.fireEvent("onReceive", socket, {
				type: type,
				data: data
			});
		},

		connect: function (callback) {
			var socket = this;
			if (socket._state != "disconnected") {
				throw new dorado.Exception("Illegal socket state.");
			}
			socket._protocol.connect(socket, callback);
		},

		_connected: function (socketId) {
			var socket = this;
			socket._socketId = socketId;
			socket._setState("connected");
			socket.fireEvent("onConnect", socket);
		},

		disconnect: function (callback) {
			var socket = this;
			if (socket._state != "connected") {
				throw new dorado.Exception("Not connected yet.");
			}
			socket._protocol.disconnect(socket, callback);
		},

		_disconnected: function () {
			var socket = this;
			socket._setState("disconnected");
			socket.fireEvent("onDisconnect", socket);
			delete socket._socketId;
		},

		send: function (type, data, callback) {
			var socket = this;
			if (socket._state != "connected") {
				throw new dorado.Exception("Not connected yet.");
			}

			socket._protocol.send(socket, type, data, {
				callback: function (success, packet) {
					if (success) {
						socket.fireEvent("onSend", socket, {
							type: type,
							data: data
						});
					}
					$callback(callback, success, packet);
				}
			});
		}
	});

	var defaultSocketProtocol;

	dorado.LongPollingSocket = $extend(dorado.Socket, {
		ATTRIBUTES: /** @scope dorado.LongPollingSocket.prototype */ {
			responseDelay: {
				defaultValue: -1
			}
		},

		getSocketProtocol: function () {
			if (!defaultSocketProtocol) {
				defaultSocketProtocol = new dorado.LongPollingProtocol();
			}
			return defaultSocketProtocol;
		}
	});

	dorado.Socket.connect = function (options, callback) {
		var socket = new dorado.LongPollingSocket(options);
		socket.connect(callback);
		return socket;
	};

	jQuery(window).unload(function(){
		if (defaultSocketProtocol) {
			defaultSocketProtocol.destroy();
		}
	});

})();

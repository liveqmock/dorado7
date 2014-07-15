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

dorado.util.AjaxConnectionPool = new dorado.util.ObjectPool({
	activeX: ["MSXML2.XMLHTTP.6.0", "MSXML2.XMLHTTP.5.0", "MSXML2.XMLHTTP.4.0", "MSXML2.XMLHTTP.3.0", "MSXML2.XMLHTTP", "Microsoft.XMLHTTP"],

	_createXMLHttpRequest: function() {
		try {
			return new XMLHttpRequest();
		}
		catch(e) {
			for(var i = 0; i < this.activeX.length; ++i) {
				try {
					return new ActiveXObject(this.activeX[i]);
				}
				catch(e) {
				}
			}
		}
	},
	makeObject: function() {
		return {
			conn: this._createXMLHttpRequest()
		};
	},
	passivateObject: function(connObj) {
		delete connObj.url;
		delete connObj.method;
		delete connObj.options;

		var conn = connObj.conn;
		conn.onreadystatechange = dorado._NULL_FUNCTION;
		conn.abort();
	}
});

/**
 *
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @class Ajax引擎的客户端。
 * <p>
 * dorado中的Ajax引擎具备如下两个与众不同的特性：
 * <ul>
 * <li> <b>支持XMLHttpRequest对象池</b> -
 * AjaxEngine引擎并不会为每一次的请求创建全新的XMLHttpRequest对象，而是会为XMLHttpRequest建立一个对象池。
 * 每当AjaxEngine将要发出一个Ajax请求(包括利用AjaxEngine发出的同步请求)时，AjaxEngine会首先尝试到对象池租借一个空闲的XMLHttpRequest，
 * 只有当无法得到一个空闲XMLHttpRequest时，dorado才会创建一个新的XMLHttpRequest。 <br>
 * 同样，当一次请求的处理完成后，dorado也不会立刻销毁相应的XMLHttpRequest，而将他放入到对象池中备用。 <br>
 * 通过上述实现方式，可以有效的降低带有大量Ajax操作的页面的系统消耗，提高页面的响应速度。 </li>
 * <li> <b>支持自动批量请求的功能</b> -
 * 远程过程访问常常被认为是Ajax应用的运行过程中较为消耗时间的一个环节，因此如果能够尽可能减少远程过程访问(即向Server发出请求)的次数，
 * 应当可以使页面的效率得到提高。 <br>
 * AjaxEngine支持自动收集极短时间内连续向Server发出的请求，并且把它们打包成一次批量操作的请求发往服务器。 <br>
 * 此功能的生效须满足一些前提条件，例如这些批量请求的URL必须是一样的，不能带有Parameter，而且此功能需要服务器上的执行逻辑提供适当的支持。 </li>
 * </ul>
 * </p>
 * @extends dorado.EventSupport
 * @see $ajax
 */
dorado.util.AjaxEngine = $extend([dorado.AttributeSupport, dorado.EventSupport], /** @scope dorado.util.AjaxEngine.prototype */
	{
		$className: "dorado.util.AjaxEngine",

		constructor: function(options) {
			this._requests = [];
			this._connectionPool = dorado.util.AjaxConnectionPool;
			$invokeSuper.call(this);
			if (options) this.set(options);
		},

		ATTRIBUTES: /** @scope dorado.util.AjaxEngine.prototype */
		{
			/**
			 * 默认的执行选项。 执行选项中可包含下列一些属性：
			 * <ul>
			 * <li>url - {String} 请求的URL。</li>
			 * <li>method - {String} 请求时的HttpMethod，可选的值包括GET、POST、PUT、DELETE。默认将按照GET来处理。</li>
			 * <li>header - {Object} 请求时包含在HttpRequest中的头信息 所有的头信息以属性的方式存放在json对象中。
			 * 最终在请求发出时所包含的头信息是此处的头信息和方法的options参数中的头信息的合集，如二者之间的属性定义有冲突，则以方法的options参数中头信息的为准。</li>
			 * <li>xmlData - {String} 请求时以POST方法发往服务器的XML信息。</li>
			 * <li>jsonData - {Object|Object[]} 请求时以POST方法发往服务器的JSON信息。</li>
			 * <li>message - {String} 当请求尚未结束时希望系统显示给用户的提示信息。此属性目前仅在以异步模式执行时有效，如果设置此属性为none或null则表示不显示提示信息。</li>
			 * </ul>
			 * 上述属性中xmlData和jsonData在定义时只可选择其一。如果同时定义了这两个属性将只有xmlData会生效。
			 * @type Object
			 * @attribute writeOnce
			 *
			 * @example
			 * ajaxEngine.set("defaultOptions", {
		 *		 url: "/xxx.do"
		 *		 method: "POST",
		 *		 headers: {
		 *			 "content-type": "test/xml",
		 *			 "sample-header": "xxxxx"
		 *		 }
		 *	 });
			 */
			defaultOptions: {
				writeOnce: true
			},

			/**
			 * 是否启用自动批量请求的功能。默认值为false。
			 * <p>
			 * 此功能一般须配合minConnectInterval、maxBatchSize、defaultOptions等属性一同使用。
			 * 如果autoBatchEnabled属性为true，当AjaxEngine开始侦测到某一次发往服务器的请求时，
			 * 会暂时搁置该请求及之后发生的请求并开始计时，直到minConnectInterval属性指定时间耗尽或被搁置的请求的数量达到maxBatchSize属性设定的上限。
			 * 然后AjaxEngine会将这些请求进行打包合并，最后一次批量请求的方式发往服务器。
			 * </p>
			 * @type boolean
			 * @attribute
			 * @see dorado.util.AjaxEngine#setAutoBatchEnabled
			 */
			autoBatchEnabled: {
				setter: function(value) {
					if (value && !(this._defaultOptions && this._defaultOptions.url)) {
						throw new dorado.ResourceException("dorado.core.BatchUrlUndefined");
					}
					this._autoBatchEnabled = value;
				}
			},

			/**
			 * 最小的与服务器建立的连接的时间间隔(毫秒数)。此属性仅在autoBatchEnabled属性为true时生效。
			 * @type int
			 * @attribute
			 * @default 50
			 */
			minConnectInterval: {
				defaultValue: 50
			},

			/**
			 * 每一次批量请求中允许的最大子请求数量。此属性仅在autoBatchEnabled属性为true时生效。
			 * @type int
			 * @attribute
			 * @default 20
			 */
			maxBatchSize: {
				defaultValue: 20
			}
		},

		EVENTS: /** @scope dorado.util.AjaxEngine.prototype */
		{
			/**
			 * 当AjaxEngine将要发出以个请求时触发的事件。
			 * @param {Object} self 事件的发起者，即AjaxEngine本身。
			 * @param {Object} arg 事件参数。
			 * @param {boolean} arg.async 是否异步操作。
			 * @param {Object} arg.options 执行选项，见{@link dorado.util.AjaxEngine#request}中的options参数。
			 * @return {boolean} 是否要继续后续事件的触发操作，不提供返回值时系统将按照返回值为true进行处理。
			 * @event
			 * @event
			 */
			beforeRequest: {},

			/**
			 * 当AjaxEngine某个请求执行结束后(包含因失败而结束的情况)触发的事件。
			 * @param {Object} self 事件的发起者，即AjaxEngine本身。
			 * @param {Object} arg 事件参数。
			 * @param {boolean} arg.async 是否异步操作。
			 * @param {Object} arg.options 本次请求得到的返回结果。，见{@link dorado.util.AjaxResult}。
			 * @return {boolean} result  是否要继续后续事件的触发操作，不提供返回值时系统将按照返回值为true进行处理。
			 * @event
			 */
			onResponse: {},

			/**
			 * 当AjaxEngine将要与服务器建立连接时触发的事件。
			 * @param {Object} self 事件的发起者，即AjaxEngine本身。
			 * @param {Object} arg 事件参数。
			 * @param {boolean} arg.async 是否异步操作。
			 * @param {Object} arg.options 执行选项，见{@link dorado.util.AjaxEngine#request}中的options参数。
			 * @return {boolean} result  是否要继续后续事件的触发操作，不提供返回值时系统将按照返回值为true进行处理。
			 * @event
			 */
			beforeConnect: {},

			/**
			 * 当AjaxEngine断开与服务器建立连接时触发的事件。
			 * @param {Object} self 事件的发起者，即AjaxEngine本身。
			 * @param {Object} arg 事件参数。
			 * @param {boolean} arg.async 是否异步操作。
			 * @param {Object} arg.options 本次请求得到的返回结果。，见{@link dorado.util.AjaxResult}。
			 * @return {boolean} result  是否要继续后续事件的触发操作，不提供返回值时系统将按照返回值为true进行处理。
			 * @event
			 */
			onDisconnect: {}
		},

		/**
		 * 发起一个异步的请求。
		 * @param {String|Object} [options] 执行选项。
		 * <p>
		 * 此参数有两种定义方式:
		 * <ul>
		 * <li>当此参数的类型是String时，系统直接将此参数作为请求的URL。</li>
		 * <li>当此参数的类型是JSON对象时，系统将此参数执行选项，并处理其中的子属性。</li>
		 * </ul>
		 * </p>
		 * <p>
		 * 需要注意的是，下面的xmlData和jsonData子参数在定义时只可选择其一。如果同时定义了这两个属性将只有xmlData会生效。
		 * </p>
		 * @param {String} [options.url] 请求的URL，如果此属性未指定则使用defaultOptions.url的定义。
		 * @param {String} [options.method="GET"] 请求时的HttpMethod，可选值包括GET、POST、PUT、DELETE。如果此属性未指定则使用defaultOptions.method的定义。
		 * @param {String} [options.parameter] 请求是附带的参数。
		 * 这些参数以子属性值的方式保存在此JSON对象中。
		 * <b>对于POST方法的请求而言，如果在定义了parameter的同时又定义了xmlData或jsonData，那么parameter将被添加到url中以类似GET请求的方式发送。、
		 * 真正通过POST方法发送的数据将是xmlData或jsonData。</b>
		 * @param {int} [options.timeout] 以毫秒为单位的超时时长。此特性在同步模式下不生效。
		 * @param {boolean} [options.batchable] 是否支持自动批量请求模式。此特性在同步模式下不生效。
		 * @param {String} [options.header] 请求时包含在HttpRequest中的头信息。
		 * 这些头信息以子属性值的方式保存在此JSON对象中。
		 * 最终在请求发出时所包含的头信息是defaultOptions.header和此处header属性的合集，如二者之间的属性定义有冲突，则以此处header属性中的为准。
		 * @param {String} [options.xmlData] 请求时以POST方法发往服务器的XML信息。
		 * @param {Object} [options.jsonData] 请求时以POST方法发往服务器的JSON信息。
		 * @param {String} [options.message] 当请求尚未结束时希望系统显示给用户的提示信息。此属性目前仅以异步模式执行时有效。
		 * @param {Function|dorado.Callback} [callback] 回调对象。传入回调对象的结果参数是{@link dorado.util.AjaxResult}对象。
		 * @throws {dorado.util.AjaxException}
		 * @throws {Error}
		 *
		 * @example
		 * // 发起一个Ajax异步请求，使用Function作为回调对象。
		 * var ajax = new AjaxEngine();
		 * ajax.request({
		 * 	url: "/delete-employee.do",
		 * 	method: "POST",
		 * 	jsonData: ["0001", "0002", "0005"]
		 * 	// 定义要提交给服务器的信息。
		 * }, function(result) {
		 * 	alert(result.responseText);
		 * });
		 *
		 * @example
		 * <pre>
		 * // 发起一个Ajax异步请求，并声明一个回调对象。
		 * var ajax = new AjaxEngine();
		 * ajax.request({
		 * 	timeout: parseInt("30000"), // 设置Ajax操作的超时时间为30秒
		 * 	url: "/delete-employee.do",
		 * 	method: "POST",
		 * 	xmlData: "&lt;xml&gt;&lt;id&gt;0001&lt;/id&gt;&lt;id&gt;0002&lt;/id&gt;&lt;id&gt;0005&lt;/id&gt;&lt;/xml&gt;"
		 * }, {
		 * 	success: function(result) {
		 * 		alert("操作成功：" + result.responseText);
		 * 	},
		 * 	failure: function(e) {
		 * 		alert("操作失败：" + e);
		 * 	}
		 * });
		 * </pre>
		 *
		 * @example
		 * // 使用自动批量请求功能。
		 * // 以上的三个请求最终将被AjaxEngine打包成一个批量请求，并发往服务器。
		 * var ajax = new AjaxEngine();
		 * ajax.set("options", {
		 * 	// 每一个支持批量操作的请求的url都必须是一致的。
		 * 	url: "/delete-employee.do",
		 *
		 * 	// 每一个支持批量操作的请求的method都必须是一致的。
		 * 	method: "POST"
		 * });
		 *
		 * // 启用自动批量请求功能。
		 * ajax.setAutoBatchEnabled(true);
		 *
		 * ajax.request({
		 * 	jsonData: "0001"
		 * }, function(result) {
		 * 	alert(result.responseText);
		 * });
		 *
		 * ajax.request({
		 * 	jsonData: "0002"
		 * }, function(result) {
		 * 	alert(result.responseText);
		 * });
		 *
		 * ajax.request({
		 * 	jsonData: "0005"
		 * }, function(result) {
		 * 	alert(result.responseText);
		 * });
		 */
		request: function(options, callback) {
			if (typeof options == "string") {
				options = {
					url: options
				};
			}

			var id = dorado.Core.newId();
			dorado.util.AjaxEngine.ASYNC_REQUESTS[id] = true;
			
			var callbackWrapper = {
					callback: function(success, result) {
						var timerId = dorado.util.AjaxEngine.ASYNC_REQUESTS[id];
						if (timerId) {
							if (typeof timerId == "number") clearTimeout(timerId);
							delete dorado.util.AjaxEngine.ASYNC_REQUESTS[id];
							$callback(callback, success, result);
						}
					}
				};
			
			var useBatch = this._autoBatchEnabled && (options.batchable === true);
			if (useBatch) {
				if (options) {
					if (options.url && options.url != this._defaultOptions.url || options.method && options.method != "POST" || options.timeout) {
						useBatch = false;
					}
					if (useBatch && options.headers) {
						for(var prop in options.headers) {
							if (options.headers.hasOwnProperty(prop)) {
								useBatch = false;
								break;
							}
						}
					}
				}

				var requests = this._requests;
				if (requests.length == 0) {
					this._batchTimerId = $setTimeout(this, function() {
						this._requestBatch();
					}, this._minConnectInterval);
				}

				this.fireEvent("beforeRequest", this, {
					async: true,
					options: options
				});

				var message = options.message, taskId;
				if (message && message != "none") {
					taskId = dorado.util.TaskIndicator.showTaskIndicator(message, options.modal ? "main" : "daemon");
				}
				
				if (callback && options && options.timeout) {
					dorado.util.AjaxEngine.ASYNC_REQUESTS[id] = $setTimeout(this, function() {
						var result = new dorado.util.AjaxResult(options);
						result._setException(new dorado.util.AjaxTimeoutException($resource("dorado.core.AsyncRequestTimeout", options.timeout)));
						$callback(callbackWrapper, false, result, {
							scope: this
						});
					}, options.timeout);
				}

				requests.push({
					options: options,
					callback: callbackWrapper,
					taskId: taskId
				});

				if (requests.length >= this._maxBatchSize) {
					this._requestBatch();
				}
			}
			else {
				this.requestAsync(options, callbackWrapper);
			}
		},

		_requestBatch: function() {
			if (this._batchTimerId) {
				clearTimeout(this._batchTimerId);
				this._batchTimerId = 0;
			}

			var requests = this._requests;
			if (requests.length == 0) return;
			this._requests = [];

			var batchCallback = {
				scope: this,
				callback: function(success, batchResult) {
					function createAjaxResult(options) {
						var result = new dorado.util.AjaxResult(options);
						result._init(batchResult._connObj);
						return result;
					}

					if (success) {
						var xmlDoc = jQuery(batchResult.getXmlDocument());

						var i = 0;
						xmlDoc.find("result>request").each($scopify(this, function(index, elem) {
							var request = requests[i];
							if (request.taskId) {
								dorado.util.TaskIndicator.hideTaskIndicator(request.taskId);
							}

							var result = createAjaxResult(request.options);

							var el = jQuery(elem);
							var exceptionEl = el.children("exception");
							var success = (exceptionEl.size() == 0);
							if (success) {
								var responseEl = el.children("response");
								result.text = responseEl.text();
							}
							else {
								result.text = exceptionEl.text();
								if (exceptionEl.attr("type") == "runnable") {
									result._parseRunnableException(result.text);
								}
								else {
									result._setException(result._parseException(result.text, batchResult._connObj));
								}
							}
							$callback(request.callback, success, result);

							this.fireEvent("onResponse", this, {
								async: true,
								result: result
							});
							i++;
						}));
					}
					else {
						for(var i = 0; i < requests.length; i++) {
							var request = requests[i];
							if (request.taskId) {
								dorado.util.TaskIndicator.hideTaskIndicator(request.taskId);
							}

							var result = createAjaxResult(request.options);
							result._setException(batchResult.exception);
							$callback(request.callback, false, result);

							this.fireEvent("onResponse", this, {
								async: true,
								result: result
							});
						}
					}
				}
			};

			var sendData = ["<batch>\n"];
			for(var i = 0; i < requests.length; i++) {
				var request = requests[i];
				var options = request.options;
				var type = "";
				if (options) {
					if (options.xmlData) {
						type = "xml";
					}
					else if (options.jsonData) {
						type = "json";
					}
				}

				sendData.push("<request type=\"" + type + "\"><![CDATA[");

				var data = this._getSendData(options);
				if (data) data = data.replace(/]]>/g, "]]]]><![CDATA[>");
				sendData.push(data);

				sendData.push("]]></request>\n");
			}
			sendData.push("</batch>");

			var batchOptions = {
				isBatch: true,
				xmlData: sendData.join('')
			};
			this.requestAsync(batchOptions, batchCallback);
		},
		
		/**
		 * 发起一个异步的请求。
		 * <p>
		 * 此方法看起来与request()完成的功能是很像的，不同点在于此方法会忽略掉autoBatchEnabled的设置。
		 * 即利用此方法发出的请求不会被自动批量请求功能搁置，而总是会立刻发往服务器。<br>
		 * <b>在通常情况下，我们不建议您直接使用此方法，而应该用request()方法替代。</b>
		 * </p>
		 * @protected
		 * @param {Object} [options] 执行选项，请参考本类中request()方法的options参数的描述。
		 * @param {Function|dorado.Callback} [callback] 回调对象。
		 * @throws {dorado.util.AjaxException}
		 * @throws {Error}
		 * @see dorado.util.AjaxEngine#request
		 */
		requestAsync: function(options, callback) {
			var connObj = this._connectionPool.borrowObject();
			this._init(connObj, options, true);

			var eventArg = {
				async: true,
				options: options
			};
			if (options == null || !options.isBatch) {
				this.fireEvent("beforeRequest", this, eventArg);
			}
			this.fireEvent("beforeConnect", this, eventArg);

			var conn = connObj.conn;

			var message = options.message, taskId;
			if (message && message != "none") {
				taskId = dorado.util.TaskIndicator.showTaskIndicator(message, options.modal ? "main" : "daemon");
			}
			
			if (callback && options && options.timeout) {
				connObj.timeoutTimerId = $setTimeout(this, function() {
					try {
						if (taskId) {
							dorado.util.TaskIndicator.hideTaskIndicator(taskId);
						}

						var result = new dorado.util.AjaxResult(options);
						try {
							result._init(connObj);
						}
						catch(e) {
							// do nothing
						}
						result._setException(new dorado.util.AjaxTimeoutException($resource("dorado.core.AsyncRequestTimeout", options.timeout), null, connObj));
						$callback(callback, false, result, {
							scope: this
						});

						var eventArg = {
							async: true,
							result: result
						};

						this.fireEvent("onDisconnect", this, eventArg);
						if (options == null || !options.isBatch) {
							this.fireEvent("onResponse", this, eventArg);
						}
					}
					finally {
						this._connectionPool.returnObject(connObj);
					}
				}, options.timeout);
			}

			conn.onreadystatechange = $scopify(this, function() {
				if (conn.readyState == 4) {
					try {
						if (taskId) dorado.util.TaskIndicator.hideTaskIndicator(taskId);
						if (callback && options && options.timeout) {
							clearTimeout(connObj.timeoutTimerId);
						}
						var result = new dorado.util.AjaxResult(options, connObj);

						var eventArg = {
							async: true,
							result: result
						};
						this.fireEvent("onDisconnect", this, eventArg);

						$callback(callback, result.success, result, {
							scope: this
						});

						if (options == null || !options.isBatch) {
							this.fireEvent("onResponse", this, eventArg);
						}
					}
					finally {
						this._connectionPool.returnObject(connObj);
					}
				}
			});
			conn.send(this._getSendData(options));
		},

		_setHeader: function(connObj, options) {

			function setHeaders(conn, headers) {
				if (!headers) return;
				for(var prop in headers) {
					if (headers.hasOwnProperty(prop)) {
						var value = headers[prop];
						if (value != null) {
							conn.setRequestHeader(prop, value);
						}
					}
				}
			}

			if (this._defaultOptions) {
				setHeaders(connObj.conn, this._defaultOptions.headers);
			}
			if (options) {
				setHeaders(connObj.conn, options.headers);
			}
		},

		_init: function(connObj, options, async) {

			function urlAppend(url, p, s) {
				if (s) {
					return url + (url.indexOf('?') === -1 ? '?' : '&') + p + '=' + encodeURI(s);
				}
				return url;
			}

			var url, method;
			if (options) {
				url = options.url;
				method = options.method;

				if (!options.headers) {
					options.headers = {};
				}
				if (options.xmlData) {
					options.headers["content-type"] = "text/xml";
					method = "POST";
				}
				else if (options.jsonData) {
					options.headers["content-type"] = "text/javascript";
					method = "POST";
				}
			}

			var defaultOptions = (this._defaultOptions) ? this._defaultOptions : {};
			url = url || defaultOptions.url;
			method = method || defaultOptions.method || "GET";

			var parameter = options.parameter;
			if (parameter && (method == "GET" || options.xmlData || options.jsonData)) {
				for(var p in parameter) {
					if (parameter.hasOwnProperty(p)) {
						url = urlAppend(url, p, parameter[p]);
					}
				}
			}

			connObj.url = url = $url(url);
			connObj.method = method;
			connObj.options = options;

			connObj.conn.open(method, url, async);
			this._setHeader(connObj, options);
		},

		_getSendData: function(options) {
			if (!options) {
				return null;
			}
			var data = null;
			if (options.xmlData) {
				data = options.xmlData;
			}
			else if (options.jsonData) {
				data = dorado.JSON.stringify(options.jsonData, {
					replacer: function(key, value) {
						return (typeof value == "function") ? value.call(this) : value;
					}
				});
			}
			else if (options.parameter) {
				var parameter = options.parameter;
				data = '';
				var i = 0;
				for(var p in parameter) {
					if (parameter.hasOwnProperty(p)) {
						data += (i > 0 ? '&' : '') + p + '=' + encodeURI(parameter[p]);
						i++;
					}
				}
			}
			return data;
		},
		/**
		 * 发起一个同步的请求。
		 * @param {String|Object} [options] 执行选项，请参考本类中request()方法的options参数的描述。
		 * @param {boolean} [alwaysReturn] 即使发生错误也返回一个包含异常信息的{@link dorado.util.AjaxResult}，而不是抛出异常信息。默认值为false，即允许抛出异常。
		 * @return {dorado.util.AjaxResult} 执行结果。
		 * @throws {dorado.util.AjaxException}
		 * @throws {Error}
		 *
		 * @example
		 * var ajax = new AjaxEngine();
		 * var result = ajax.requestSync({
		 * 	url: "/delete-employee.do",
		 * 	method: "POST",
		 * 	jsonData: ["0001", "0002", "0005"]
		 * 	// 定义要提交给服务器的信息
		 * });
		 * alert(result.responseText);
		 */
		requestSync: function(options, alwaysReturn) {
			if (typeof options == "string") {
				options = {
					url: options
				};
			}

			var connObj = this._connectionPool.borrowObject();
			try {
				var eventArg = {
					async: false,
					options: options
				};
				this.fireEvent("beforeRequest", this, eventArg);
				this.fireEvent("beforeConnect", this, eventArg);

				var exception = null;
				try {
					this._init(connObj, options, false);
					connObj.conn.send(this._getSendData(options));
				}
				catch(e) {
					exception = e;
				}

				var result = new dorado.util.AjaxResult(options);
				if (exception != null) {
					result._init(connObj);
					result._setException(exception);
				}
				else {
					result._init(connObj, true);
				}
				eventArg = {
					async: true,
					result: result
				};
				this.fireEvent("onDisconnect", this, eventArg);
				this.fireEvent("onResponse", this, eventArg);

				if (!alwaysReturn && exception != null) {
					throw exception;
				}
				return result;
			}
			finally {
				this._connectionPool.returnObject(connObj);
			}
		}
	});

dorado.util.AjaxEngine._parseXml = function(xml) {
	var xmlDoc = null;
	try {
		if (dorado.Browser.msie) {
			var activeX = ["MSXML2.DOMDocument", "MSXML.DOMDocument"];
			for(var i = 0; i < activeX.length; ++i) {
				try {
					xmlDoc = new ActiveXObject(activeX[i]);
					break;
				}
				catch(e) {
					// do nothing
				}
			}
			xmlDoc.loadXML(xml);
		}
		else {
			var parser = new DOMParser();
			xmlDoc = parser.parseFromString(xml, "text/xml");
		}
	}
	finally {
		return xmlDoc;
	}
};

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @class 用于描述Ajax操作(包含同步请求)过程中发生的异常信息的对象。
 * @extends dorado.Exception
 * @param {String} [message] 异常消息。
 * @param {String} [description] 异常的描述信息。
 * @param {XMLHttpRequest} [connObj] 用于实现远程访问的XMLHttpRequest对象。
 */
dorado.util.AjaxException = $extend(dorado.Exception, /** @scope dorado.util.AjaxException.prototype */ {
	$className: "dorado.util.AjaxException",

	constructor: function(message, description, connObj) {
		/**
		 * 异常消息。
		 * @type String
		 */
		this.message = message || "Unknown Exception.";

		/**
		 * 异常的描述信息。
		 * @type String
		 */
		this.description = description;

		if (connObj != null) {
			/**
			 * 请求的URL。
			 * @type String
			 */
			this.url = connObj.url;
	
			/**
			 * 发起请求时使用的HttpMethod。
			 * @type String
			 * @default "GET"
			 */
			this.method = connObj.method;
	
			/**
			 * 服务器返回的Http状态码。<br>
			 * 如：200表示正常返回、404表示请求的资源不存在等，详情请参考Http协议说明。
			 * @type int
			 */
			this.status = connObj.conn.status;
	
			/**
			 * 服务器返回的Http状态描述。<br>
			 * 如：OK表示正常返回、NOT_MODIFIED表示资源未发生任何改变等，详情请参考Http协议说明。
			 * @type String
			 */
			this.statusText = connObj.conn.statusText;
	
			// IE - #1450: sometimes returns 1223 when it should be 204
			if (this.status === 1223) {
				this.status = 204;
			}
		}

		$invokeSuper.call(this, arguments);
	},

	toString: function() {
		var text = this.message;
		if (this.url) {
			text += "\nURL: " + this.url;
		}
		if (this.status) {
			text += "\nStatus: " + this.statusText + '(' + this.status + ')';
		}
		if (this.description) {
			text += '\n' + this.description;
		}
		return text;
	}
});

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @class Ajax操作的超时异常。
 * @extends dorado.util.AjaxException
 * @param {String} [message] 异常消息。
 * @param {String} [description] 异常的描述信息。
 * @param {XMLHttpRequest} [connObj] 用于实现远程访问的XMLHttpRequest对象。
 */
dorado.util.AjaxTimeoutException = $extend(dorado.util.AjaxException, /** @scope dorado.util.AjaxTimeoutException.prototype */ {
	$className: "dorado.util.AjaxTimeoutException"
});

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @class 用于封装Ajax请求(包含同步请求)返回结果的对象。
 * @description 构造器。
 * @param {Object} options 发起请求时使用的请求选项。
 * @param {XMLHttpRequest} [connObj] 用于实现远程访问的XMLHttpRequest对象。
 */
dorado.util.AjaxResult = $class(/** @scope dorado.util.AjaxResult.prototype */
	{
		$className: "dorado.util.AjaxResult",

		constructor: function(options, connObj) {
			/**
			 * @name dorado.util.AjaxResult#options
			 * @property
			 * @description 发起请求时使用的请求选项。
			 * @type Object
			 */
			this.options = options;

			if (connObj != null) {
				this._init(connObj, true);
			}
		},
		/**
		 * Ajax请求是否执行成功。
		 * @type boolean
		 * @default true
		 */
		success: true,

		_init: function(connObj, parseResponse) {
			this._connObj = connObj;

			/**
			 * 请求的URL。
			 * @type String
			 */
			this.url = connObj.url;

			/**
			 * 发起请求时使用的HttpMethod。
			 * @type String
			 */
			this.method = connObj.method;

			var conn = connObj.conn;

			/**
			 * 服务器返回的Http状态码。<br>
			 * 如：200表示正常返回、404表示请求的资源不存在等，详情请参考Http协议说明。
			 * @type int
			 */
			this.status = conn.status;

			/**
			 * 服务器返回的Http状态描述。<br>
			 * 如：OK表示正常返回、NOT_MODIFIED表示资源未发生任何改变等，详情请参考Http协议说明。
			 * @type String
			 */
			this.statusText = conn.statusText;

			/**
			 * 包含所有的Response头信息的字符串。<br>
			 * 其格式为：header1=value1;header2=value2;...
			 * @type String
			 */
			this.allResponseHeaders = conn.getAllResponseHeaders();

			if (parseResponse) {
				/**
				 * 服务器返回的原始文本信息。
				 * @type String
				 */
				this.text = conn.responseText;

				var exception, contentType = this.getResponseHeaders()["content-type"];
				if (contentType && contentType.indexOf("text/dorado-exception") >= 0) {
					exception = this._parseException(conn.responseText, connObj);
				}
				else if (contentType && contentType.indexOf("text/runnable") >= 0) {
					exception = this._parseRunnableException(conn.responseText, connObj);
				}
				else if (conn.status < 200 || conn.status >= 400) {
					if (dorado.windowClosed && conn.status == 0) {
						exception = new dorado.AbortException();
					}
					else {
						exception = new dorado.util.AjaxException("HTTP " + conn.status + " " + conn.statusText, null, connObj);
						if (conn.status == 0) {
							exception._processDelay = 1000;
						}
					}
				}
				if (exception) this._setException(exception);
			}
		},

		_setException: function(exception) {
			this.success = false;

			/**
			 * 请求过程中发生的异常。
			 * @type Error
			 */
			this.exception = exception;
		},

		_parseException: function(text) {
			var json = dorado.JSON.parse(text);
			return new dorado.RemoteException(json.message, json.exceptionType, json.stackTrace);
		},

		_parseRunnableException: function(text) {
			return new dorado.RunnableException(text);
		},

		/**
		 * 返回一个包含所有的Response头信息的对象。<br>
		 * 所有的Response头信息以属性的形式存放在该对象中，其形式如下：<br>
		 * <pre class="symbol-example code">
		 * <code class="javascript">
		 * {
	 *	 "content-type": "text/xml",
	 *	 "header1": "value1",
	 *	 "header2": "value2",
	 *	 ... ... ...
	 * }
		 * </code>
		 * </pre>
		 * @return {Object} 包含所有的Response头信息的对象。
		 */
		getResponseHeaders: function() {
			var responseHeaders = this._responseHeaders;
			if (responseHeaders === undefined) {
				responseHeaders = {};
				this._responseHeaders = responseHeaders;
				try {
					var headerStr = this.allResponseHeaders;
					var headers = headerStr.split('\n');
					for(var i = 0; i < headers.length; i++) {
						var header = headers[i];
						var delimitPos = header.indexOf(':');
						if (delimitPos != -1) {
							responseHeaders[header.substring(0, delimitPos).toLowerCase()] = header.substring(delimitPos + 2);
						}
					}
				}
				catch(e) {
					// do nothing
				}
			}
			return responseHeaders;
		},

		/**
		 * 以XmlDocument的形式获得服务器返回的Response信息。
		 * @return {XMLDocument} XmlDocument。
		 */
		getXmlDocument: function() {
			var responseXML = this._responseXML;
			if (responseXML === undefined) {
				responseXML = dorado.util.AjaxEngine._parseXml(this.text);
				this._responseXML = responseXML;
			}
			return responseXML;
		},

		/**
		 * 以JSON数据的形式获得服务器返回的Response信息。
		 * @param {boolean} [untrusty] 服务器返回的Response信息是否是不可信的。默认为false，即Response信息是可信的。<br>
		 * 此参数将决定dorado通过何种方式来解析服务端返回的JSON字符串，为了防止某些嵌入在JSON字符串中的黑客代码对应用造成伤害，
		 * dorado可以使用安全的方式来解析JSON字符串，但是这种安全检查会带来额外的性能损失。
		 * 因此，如果您能够确定访问的服务器是安全的，其返回的JSON字符串不会嵌入黑客代码，那么就不必开启此选项。
		 * @return {Object} JSON数据。
		 */
		getJsonData: function(untrusty) {
			var jsonData = this._jsonData;
			if (jsonData === undefined) {
				this._jsonData = jsonData = dorado.JSON.parse(this.text, untrusty);
			}
			return jsonData;
		}
	});

dorado.util.AjaxEngine.SHARED_INSTANCES = {};
dorado.util.AjaxEngine.ASYNC_REQUESTS = {};

dorado.util.AjaxEngine.getInstance = function(options) {
	var defaultOptions = $setting["ajax.defaultOptions"];
	if (defaultOptions) {
		defaultOptions = dorado.Object.apply({}, defaultOptions);
		options = dorado.Object.apply(defaultOptions, options);
	}
	var key = (options.url || "#EMPTY") + '|' + (options.batchable || false);
	var ajax = dorado.util.AjaxEngine.SHARED_INSTANCES[key];
	if (ajax === undefined) {
		ajax = new dorado.util.AjaxEngine({
			defaultOptions: options,
			autoBatchEnabled: options.autoBatchEnabled || options.batchable
		});
		dorado.util.AjaxEngine.SHARED_INSTANCES[key] = ajax;
	}
	return ajax;
}

/**
 * @name $ajax
 * @property
 * @description 默认的dorado.util.AjaxEngine实例。
 * <p>
 * 很多情况下，我们建议您直接利用$ajax来完成Ajax操作，这样就不必频繁的创建dorado.util.AjaxEngine的对象实例了。
 * </p>
 * @see dorado.util.AjaxEngine
 *
 * @example
 * // 发起一个Ajax异步请求，使用Function作为回调对象。
 * $ajax.request( {
 * 	url : "/delete-employee.do",
 * 	method : "POST",
 * 	jsonData : [ "0001", "0002", "0005" ] // 定义要提交给服务器的信息
 * }, function(result) {
 * 	alert(result.responseText);
 * });
 */
window.$ajax = new dorado.util.AjaxEngine();

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
 * @name $packagesConfig
 * @type Object
 * @description 用于为$import方法定义参数和待装载的包的对象。
 * 该对象中包含下列子属性：
 * <ul>
 * <li>contextPath - {String} 应用的根路径。</li>
 * <li>defaultContentType - {String} 资源默认的content-type头信息，即用于表示资源类型的字符串。
 * 目前支持的资源类型包括："text/javascript"、"text/css"。此属性的默认值为"text/javascript"。</li>
 * <li>defaultCharset - {String} 资源默认的字符集。默认值为空，即不对资源的字符集做任何处理。</li>
 * <li>patterns - {Object} 用于定义一些可命名的资源路径的格式(Pattern)，以便于为一组相似的资源提供统一的配置。当我们要启用资源文件的合并装载功能时，Pattern也将被系统用于判断究竟哪些资源是可以被合并在一起下载的。
 * 每一个Pattern都是一个子对象，该对象又可包含下列子属性：
 * <ul>
 * <li>name - {String} 某个Pattern的名称。注意：此名称在定义时并不是作为Pattern对象的name属性存在的，它事实上是patterns的一个属性，见示例。<br>
 * 另外，如果定义了一个名为"default"的Pattern，那么该Pattern将被作为默认的Pattern应用到那些未明确引用Pattern的Package上。</li>
 * <li>url - {String} 资源路径的格式，其中可以${fileName}代替实际的文件名或子路径。</li>
 * <li>contentType - {String} 所有引用此资源路径的包文件的默认content-type头信息。
 * 此属性的默认值是text/javascript，因此对于JavaScript文件而言不需要特别指定此属性，而对于CSS文件而言则必须指定为text/css。</li>
 * <li>charset - {String} 所有引用此资源路径的包文件的默认字符集。</li>
 * <li>mergeRequests - {boolean} 是否要将引用此资源路径的、相邻的各个包合并成为一个Http请求，此功能可用于优化网络通讯，但需服务器提供相应的支持。</li>
 * </ul>
 * </li>
 * <li>packages - {Object} 用于定义所有资源包(Package)。
 * 每一个资源包可以包含一个或多个资源文件，但必须同类型的文件。例如我们不能把JavaScript文件和CSS文件定义在一个资源包中。
 * 每一个的资源包的配置都是一个子对象，该对象又可包含下列子属性：
 * <ul>
 * <li>name - {String} 某个Package的名称。注意：此名称在定义时并不是作为Package对象的name属性存在的，它事实上是packages的一个属性，见示例。</li>
 * <li>fileName - {String|String[]} 此Package的实际文件名或路径。默认值与Package的名称相同。
 * 如果此Package引用了某个Pattern，那么该属性的值最终将被替换到Pattern的url属性中，并以替换后的字符串作为最终的资源路径。</li>
 * <li>pattern - {String 此Package引用的Pattern。如果不指定此参数则将引用默认的Pattern。</li>
 * <li>contentType - {String} Package文件的content-type头信息。</li>
 * <li>charset - {String} Package文件的字符集 。</li>
 * <li>depends - {String|String[]} 依赖的Package的名称，即该Package依赖于哪些其他的Package。如用String来定义，多个Package的名称之间用","分隔。
 * 如果一个Package A依赖于Package B，那么当我们指定装载Package A时，$import()会首先自动装载Package B。</li>
 * </ul>
 * </li>
 * </ul>
 * <p>
 * $import方法并不要求所有的资源包都必须在packages中定义，当我们尝试引入一个未定义的Package时，$import会认为其fileName就是Package的名称，并且引用默认的Pattern。
 * </p>
 *
 * @see $import
 *
 * @example
 * $packagesConfig.defaultCharset = "UTF-8";
 *
 * @example
 * $packagesConfig.patterns = {
 *	 "js": { url: "/lib/javascript/${fileName}.js" },
 *	 "css": { url: "/lib/css/${fileName}.css", contentType: "text/css" }
 * };
 *
 * $packagesConfig.packages = {
 *	 "skin": { pattern: "css" },
 *	 "jquery": { pattern: "js", fileName: "jquery-1.2.6" },
 *	 "jquery.ui": { pattern: "js", depends: "jquery,skin" },
 * };
 *
 * // 将一同装载skin.css、jquery-1.2.6.js、jquery.ui.js这三个文件
 * $import("jquery.ui");
 *
 * @example
 * // 本段示例的效果同上一段完全一致
 * $packagesConfig.patterns = {
 *	 "default": { url: "/lib/javascript/${fileName}" },
 *	 "css": { url: "/lib/css/${fileName}", contentType: "text/css" }
 * };
 *
 * $packagesConfig.packages = {
 *	 "skin.css": { pattern: "css" },
 *	 "jquery.js": { fileName: "jquery-1.2.6.js" },
 *	 "jquery.ui.js": { depends: ["jquery.js", "skin.css"] },
 * };
 *
 * // 将一同装载skin.css、jquery-1.2.6.js、jquery.ui.js这三个文件
 * $import("jquery.ui.js");
 *
 * @example
 * // 使用未定义的package
 * $packagesConfig.patterns = {
 *	 "default" : {
 *		 url : "/lib/javascript/${fileName}"
 *	 }
 * };
 *
 * // 将装载/lib/javascript/core.js、/lib/javascript/utils.js这两个文件。
 * $import("core.js,utils.js");
 *
 * @example
 * // 使用根路径的配置，配合路径中">"符简化路径的定义方式。
 * $packagesConfig.contextPath = "/dorado";
 * $packagesConfig.patterns = {
 *	 "default" : {
 * 		url : ">/lib/javascript/${fileName}"
 *	 }
 * }
 * // 将装载/lib/javascript/core.js、/lib/javascript/utils.js这两个文件。
 * $import("core.js,utils.js");
 */
var $import, $load, $packagesConfig = window.$packagesConfig || {};
$packagesConfig.defaultContentType = $packagesConfig.defaultContentType || "text/javascript";

var _NULL_FUNCTION = function(){};

(function() {

	var failsafe = {};

	var Browser = {};
	var ua = navigator.userAgent.toLowerCase(), s;
	(s = ua.match(/msie ([\d.]+)/)) ? Browser.msie = s[1] : (s = ua.match(/firefox\/([\d.]+)/)) ? Browser.mozilla = s[1] : (s = ua.match(/chrome\/([\d.]+)/)) ? Browser.chrome = s[1] : (s = ua.match(/opera.([\d.]+)/)) ? Browser.opera = s[1] : (s = ua.match(/version\/([\d.]+).*safari/)) ? Browser.safari = s[1] : 0;

	var activeX = ["MSXML2.XMLHTTP.6.0", "MSXML2.XMLHTTP.5.0", "MSXML2.XMLHTTP.4.0", "MSXML2.XMLHTTP.3.0", "MSXML2.XMLHTTP", "Microsoft.XMLHTTP"];
	function createXMLHttpRequest() {
		try {
			return new XMLHttpRequest();
		} catch (e) {
			for(var i = 0; i < this.activeX.length; ++i) {
				try {
					return new ActiveXObject(this.activeX[i]);
				} catch (e) {
				}
			}
		}
	}
	
	function getContentViaAjax(url, callback) {
		var xmlHttp = createXMLHttpRequest();
		if (callback) {
			xmlHttp.onReadyStateChange = function() {
				if (xmlHttp.readyState == 4) {
					xmlHttp.onreadystatechange = _NULL_FUNCTION;
					
					if (xmlHttp.status == 200 || xmlHttp.status == 304) {
						callback(xmlHttp.responseText);
					} else {
						alert('XML request error: ' + xmlHttp.statusText + ' (' + xmlHttp.status + ')');
					}
				}
			}
			xmlHttp.open("GET", url, true); 
			xmlHttp.send(null);
		}
		else {
			xmlHttp.open("GET", url, false); 
			xmlHttp.send(null);
			if (xmlHttp.status == 200 || xmlHttp.status == 304) {
				return xmlHttp.responseText;
			}
			else {
				alert('XML request error: ' + xmlHttp.statusText + ' (' + xmlHttp.status + ')');
				return "";
			}
		}
	}

	var head;

	function findHead() {
		head = document.getElementsByTagName("head")[0] || document.documentElement;
	}

	var loadedPackages = {};

	function getNeededs(pkgs) {
		function findNeededs(pkgs, context) {
			for (var i = 0; i < pkgs.length; i++) {
				var pkg = pkgs[i];
				var def = packages[pkg];
				if (def && def.depends) {
					var depends = def.depends;
					findNeededs(depends instanceof Array ? depends : depends.split(','), context);
				}

				if (!loadedPackages[pkg] && !context.added[pkg]) {
					context.added[pkg] = true;
					context.needed.push(pkg);
				}
			}
		}

		var packages = $packagesConfig.packages || failsafe, context = {
			added: {},
			needed: []
		};

		findNeededs(pkgs, context);
		return context.needed;
	}

	function getRequests(pkgs) {

		function mergePkgs(request) {
			var pattern = request.pattern;
			var fileNames = request["package"].join(',');
			request.url = pattern.url.replace(/\$\{fileName\}/g, encodeURI(fileNames).replace(/\//g, '^'));
		}

		var patterns = $packagesConfig.patterns || failsafe;
		var packages = $packagesConfig.packages || failsafe;
		var defaultPattern = patterns["default"] || failsafe;
		var tempRequests = [], toLast;
		for (var i = 0; i < pkgs.length; i++) {
			var pkg = pkgs[i];
			var def = packages[pkg], pattern, fileNames, contentType, charset;
			if (def) {
				pattern = patterns[def.pattern];
				fileNames = def.fileName;
				contentType = def.contentType;
				charset = def.charset;
			} else {
				alert("Unknown package [" + pkg + "].");
				continue;
			}
			pattern = pattern || defaultPattern;
			if (!fileNames) fileNames = pkg;
			if (!contentType) contentType = pattern.contentType || $packagesConfig.defaultContentType;
			if (!charset) charset = pattern.charset || $packagesConfig.defaultCharset;

			if (typeof fileNames == "string") fileNames = fileNames.split(',');
			for (var j = 0; j < fileNames.length; j++) {
				var fileName = fileNames[j];
				if (fileName.indexOf("(none)") >= 0) continue;
				var request = {
					id: "_package_" + pkg,
					"package": pkg,
					url: (pattern.url ? pattern.url.replace(/\$\{fileName\}/g, fileName) : fileName),
					contentType: contentType,
					charset: charset,
					pattern: pattern
				};

				if (isJavaScript(request.contentType)) {
					tempRequests.push(request);
				} else {
					if (!toLast) toLast = [];
					toLast.push(request);
				}
			}
		}
		if (toLast) tempRequests.push.apply(tempRequests, toLast);

		var requests = [], mergedRequest;
		for (var i = 0; i < tempRequests.length; i++) {
			var request = tempRequests[i];
			if (mergedRequest && mergedRequest.pattern != request.pattern) {
				mergePkgs(mergedRequest);
				mergedRequest = null;
			}

			if (request.pattern.mergeRequests) {
				var pkg = request["package"];
				if (!mergedRequest) {
					mergedRequest = request;
					delete mergedRequest.id;
					request["package"] = [];
					requests.push(request);
				}
				mergedRequest["package"].push(pkg);
			} else {
				requests.push(request);
			}
		}
		if (mergedRequest) mergePkgs(mergedRequest);

		for (var i = 0; i < requests.length; i++) {
			var request = requests[i];
			if (request.url.charAt(0) == '>') {
				var s1 = $packagesConfig.contextPath || "/", s2 = request.url.substring(1);
				if (s1) {
					if (s1.charAt(s1.length - 1) == '/') {
						if (s2.charAt(0) == '/') s2 = s2.substring(1);
					}
					else if (s2.charAt(0) != '/') s2 = '/' + s2;
				}
				request.url = s1 + s2;
			}
		}
		return requests;
	}

	var $readyState;
	if ((Browser.mozilla || Browser.opera) && document.readyState != "loading") {
		function onLoad() {
			$readyState = "complete";
			document.removeEventListener("DOMContentLoaded", onLoad, false);
		}

		$readyState = "loading";
		document.addEventListener("DOMContentLoaded", onLoad, false);
	}

	function isStyleSheet(contentType) {
		return contentType == "text/css";
	}
	
	function isJavaScript(contentType) {
		return contentType == "text/javascript";
	}

	function markRequestLoaded(request) {
		var pkg = request["package"];
		if (pkg instanceof Array) {
			for (var j = 0; j < pkg.length; j++)
				loadedPackages[pkg[j]] = true;
		} else {
			loadedPackages[pkg] = true;
		}
	}

	function loadResourceAsync(request, options, callback) {
		function onLoaded(element) {
			element.onreadystatechange = element.onload = null;
			head.removeChild(element);
		}

		var element;
		if (isStyleSheet(request.contentType)) {
			element = document.createElement("link");
			if (request.id) element.id = request.id;
			element.rel = "stylesheet";
			element.type = request.contentType;
			element.href = request.url;
			if (callback) callback(request);
		} else if (isJavaScript(request.contentType)) {
			element = document.createElement("script");
			if (Browser.msie) {
				element.onreadystatechange = function() {
					if (/loaded|complete/.test(this.readyState)) {
						if (callback) callback(request);
						onLoaded(this);
					}
				};
			} else {
				element.onload = function() {
					if (callback) callback(request);
					onLoaded(this);
				};
			}
			if (request.id) element.id = request.id;
			element.type = request.contentType;
			element.charset = request.charset;
			element.src = request.url;
		}
		else {
			element = document.createElement("script");
			if (request.id) element.id = request.id;
			element.type = request.contentType;
			element.charset = request.charset;
			
			getContentViaAjax(request.url, function(content) {
				element.text = content;
				if (callback) callback(content);
			});
		}
		head.insertBefore(element, head.firstChild);
		markRequestLoaded(request);
	}

	function loadResourcesAsync(requests, options, callback) {
		function scriptCallback(request) {
			if (++loaded < requests.length) {
				loadResourceAsync(requests[loaded], options, scriptCallback);
			} else {
				callback.call(scope);
			}
		}

		var scope = options ? options.scope : null, loaded = 0;
		findHead();
		loadResourceAsync(requests[loaded], options, scriptCallback);
	}

	function loadResource(request, options) {
		var typeAndCharset = "type=\"" + request.contentType + "\" " + (request.charset ? "charset=\"" + request.charset + "\" " : '');
		var attrs = request.id ? ("id=\"" + request.id + "\" ") : ""; 
		if (isStyleSheet(request.contentType)) {
			document.writeln("<link " + attrs + "rel=\"stylesheet\" " + typeAndCharset + "href=\"" + request.url + "\" />");
		} else if (isJavaScript(request.contentType)) {
			document.writeln("<script " + attrs + typeAndCharset + "src=\"" + request.url + "\"><\/script>");
		}
		else {
			findHead();
			var element = document.createElement("script");
			if (request.id) element.id = request.id;
			element.type = request.contentType;
			element.charset = request.charset;
			element.text = getContentViaAjax(request.url);
			head.insertBefore(element, head.firstChild);
		}
		markRequestLoaded(request);
	}

	function doLoadResources(requests, options) {
		for (var i = 0; i < requests.length; i++) {
			var request = requests[i];
			loadResource(request, options);
		}
	}

	function loadResources(requests, options, callback) {
		try {
			if (callback) {
				var scope = options ? options.scope : null;
				if (requests.length) {
					loadResourcesAsync(requests, options, callback);
				} else {
					callback.call(options ? options.scope : null);
				}
			} else if (requests.length) {
				if (!(/loaded|complete/.test($readyState || document.readyState))) {
					doLoadResources(requests, options);
				} else {
					throw new Error("Can not load script synchronous after the document is ready.");
				}
			}
		}
		catch (e) {
			alert(e.description || e);
		}
	}

	/**
	 * @author Benny Bao (mailto:benny.bao@bstek.com)
	 * @name $import
	 * @function
	 * @description 根据包名导入(装载)一个或一组来自服务端的资源，此处的资源一般指JavaScript库文件或CSS文件。
	 * <p>
	 * $import可以支持同步和异步两种方式来装载服务端的资源。
	 * $import使用同步还是异步方式来装载资源取决于是否在调用时为方法提供了回调方法。当提供了回调方法时$import将按照异步方式执行，否则将以同步方式执行。
	 * 但是，在这两种装载方式中，您并不能完全随意的进行自主选择。<br>
	 * 当我们在页面装载完毕之前调用$import时，即在window.onload事件触发之前调用$import时，您可以根据需要选择同步和异步方式来装载资源。
	 * 一般而言，对于在页面初始过程中就要用到javascript库或css文件，我们建议您使用同步方式。<br>
	 * 当我们在页面装载完毕之后调用$import时，即在window.onload事件触发之后或直接在window.onload事件中调用$import时，您只能使用异步方式来装载资源。
	 * 尽管在技术上，确实有方法可以在此时利用同步方式来装载资源，但是受制于浏览器自身的缺陷，此时以同步方式装载的资源无法正常的支持开发阶段的JavaScript调试。
	 * 为了避免由此导致的调试陷阱令项目陷入困境，我们不得不放弃了对此种模式的支持。
	 * </p>
	 * <p>
	 * 注意：当您在网页中引入boot.js时，应该确保其对应的script标记位于所有其他直接引入javascript库的script标记之前。<br>
	 * 例如，必须确保boot.js先于jquery.js被引入到网页中，否则可能导致$import方法无法正确的判断页面是否装载完毕的状态。<br>
	 * 当然，一般而言，如果您已经使用了boot.js，我们建议你将其他所有需要引入的javascript库都设置为通过$import而不是script标记来装载。
	 * </p>
	 * <p>
	 * $import方法并不总是为每一个资源发起一个Http请求，利用{@link $packagesConfig}中的设置，我们可以将一组资源包装成一个Http请求以优化对网络的使用。
	 * 不过这一功能需要服务器端提供相应的支持才能正常运作。
	 * </p>
	 * <p>
	 * $import方法可以管理各个资源的装载状态，您不必担心因为调用$import的方式不合理而导致资源被重复装载。
	 * </p>
	 * @param {String} pkgs 要导入(装载)的包名。通过以","分隔的字符串方式也可以定义多个包名。
	 * @param {Function|Object} [options] 回调函数或执行选项。
	 * <p>
	 * 此参数具有两种定义方式:
	 * <ul>
	 * <li>如果定义此参数为回调函数，那么该函数将在装载过程完成之后被激活。</li>
	 * <li>如果定义此参数为执行选项，那么该选项对象中可包含一系列子属性。</li>
	 * </ul>
	 * 如果$import方法在options参数中找到了回调函数，或者options参数本身就是回调函数，那么$import方法将按照异步的方式来装载资源，
	 * 否则，$import方法将按照同步的方式来装载资源。
	 * <p>
	 * @param {Function} [options.callback] 回调函数。
	 * @param {Object} [options.scope] 回调函数的调用宿主。即回调函数在执行时，其中this的指向。
	 *
	 * @see $packagesConfig
	 *
	 * @example
	 * <script lang="javascript">
	 * // 同步模式装载一个名为"dorado.core"的package
	 * $import("dorado.core");
	 * // 由于浏览器内部实现机制的原因，在这里我们暂时仍不能使用"dorado.core"中的内容，尽管我们使用的同步装载模式。
	 * </script>
	 * <script lang="javascript">
	 * // 此处可使用"dorado.core"中的内容
	 * </script>
	 *
	 * @example
	 * // 我们不推荐以下面的方式调用$import方法：
	 * $import("dorado.core");
	 * $import("dorado.data");
	 *
	 * // 应该采用如下的同步方式：
	 * $import("dorado.core,dorado.data");
	 * // 或如下的异步方式：
	 * $import("dorado.core,dorado.data", function() {
	 *	 ... ... ...
	 * });
	 *
	 * // 这样做的目的有两个：
	 * // 1. 便于$import对Http请求进行优化
	 * // 2. 如果我们使用异步方式来装载一组资源，这应该是唯一可行的使用方法。
	 *
	 * @example
	 * // 异步模式装载名为"dorado.core"和"dorado.data"的两个package
	 * $import("dorado.core,dorado.data", function() {
	 *	 // 此处即可使用"dorado.core"或"dorado.data中的内容
	 *	 });
	 * // 此处不可以使用"dorado.core"或"dorado.data中的内容
	 */
	$import = function(pkgs, options) {
		function getOption(p) {
			return ((!options || typeof options[p] == "undefined") ? options : $packagesConfig)[p];
		}
		var callback;
		if (typeof options == "function") {
			callback = options;
			options = null;
		} else if (typeof options == "object") {
			callback = options.callback;
		}

		if (!pkgs) {
			if (callback) callback.call(options ? options.scope : null);
			return;
		}

		if (pkgs instanceof Array) {
			var v = [];
			for (var i = 0; i < pkgs.length; i++) {
				v.concat(pkgs[i].split(','));
			}
			pkgs = v;
		} else {
			pkgs = pkgs.split(',');
		}

		pkgs = getNeededs(pkgs);
		loadResources(getRequests(pkgs), options, callback);
	};

	/**
	 * @author Benny Bao (mailto:benny.bao@bstek.com)
	 * @name $load
	 * @function
	 * @description 直接根据url装载一个或一组JavaScript库文件或CSS文件。
	 * <p>
	 * $load可以支持同步和异步两种方式来装载服务端的资源。但是，在这两种装载方式中，您并不能完全随意的进行自主选择。<br>
	 * 当我们在页面装载完毕之前调用$load时，即在window.onload事件触发之前调用$load时，您可以根据需要选择同步和异步方式来装载资源。
	 * 一般而言，对于在页面初始过程中就要用到javascript库或css文件，我们建议您使用同步方式。<br>
	 * 当我们在页面装载完毕之后调用$load时，即在window.onload事件触发之后或直接在window.onload事件中调用$load时，您只能使用异步方式来装载资源。
	 * 尽管在技术上，确实有方法可以在此时利用同步方式来装载资源，但是受制于浏览器自身的缺陷，此时已同步方式装载的资源无法正常的支持开发阶段的JavaScript调试。
	 * 为了避免由此导致的调试陷阱令项目陷入困境，我们不得不放弃了对此种模式的支持。
	 * </p>
	 * @param {String|String[]} urls 要装载的资源的url或url的数组。通过以","分隔的字符串方式也可以定义多个资源。
	 * <p>通常情况下，系统可以自动的根据某资源url的后缀是否js或css来判断该资源是JavaScript库还是CSS文件。
	 * 但在部分场景中此方法可能不能正确的判断资源的具体类型，此时我们可以通过options参数来指定资源类型。</p>
	 * @param {String|Function|Object} [options] 资源类型或回调函数或执行选项。
	 * <p>
	 * 此参数具有三种定义方式:
	 * <ul>
	 * <li>如果定义此参数为字符串，那么此参数将被识别为资源的类型。</li>
	 * <li>如果定义此参数为回调函数，那么该函数将在装载过程完成之后被激活。</li>
	 * <li>如果定义此参数为执行选项，那么该选项对象中可包含一系列子属性。</li>
	 * </ul>
	 * 如果$import方法在options参数中找到了回调函数，或者options参数本身就是回调函数，那么$import方法将按照异步的方式来装载资源，
	 * 否则，$import方法将按照同步的方式来装载资源。
	 * <p>
	 * @param {String} [options.type="js"] 资源类型。取值包括：js、css。
	 * @param {String} [options.contentType="text/javascript"] 资源的content-type头信息。如果定义了此参数，那么options.type参数的值将会失效。
	 * @param {String} [options.charset] 资源的字符集。
	 * @param {Function} [options.callback] 回调函数。
	 * @param {Object} [options.scope] 回调函数的调用宿主。即回调函数在执行时，其中this的指向。
	 *
	 * @example
	 * // 装载两个javascript文件和一个css文件
	 * $load("scripts/jquery.js,scripts/json2.js,styles/skin.css");
	 *
	 * @example
	 * // 装载两个javascript文件和一个css文件
	 * $load(["scripts/jquery.js", "scripts/json2.js", "styles/skin.css"]);
	 *
	 * @example
	 * // 通过options参数指定资源类型
	 * $load(["load-css.do?res=common", "load-css.do?res=skin"], "css");
	 */
	$load = function(urls, options) {
		if (urls instanceof Array) {
			var v = [];
			for (var i = 0; i < urls.length; i++) {
				v.concat(urls[i].split(','));
			}
			urls = v;
		} else {
			urls = urls.split(',');
		}

		var type, callback;
		if (typeof options == "string") {
			type = options;
			options = null;
		}
		else if (typeof options == "function") {
			callback = options;
			options = null;
		} else if (options instanceof Object) {
			callback = options.callback;
		}

		var requests = [], options = options || {};
		for (var i = 0; i < urls.length; i++) {
			var url = urls[i], contentType;
			if (!url) continue;

			if (type == "css" || url.toLowerCase().match("css$") == "css") {
				contentType = "text/css";
			}
			requests.push({
				url: url,
				charset: options.charset || $packagesConfig.defaultCharset,
				contentType: contentType || options.contentType || $packagesConfig.defaultContentType
			});
		}
		loadResources(requests, options, callback);
	};
})();

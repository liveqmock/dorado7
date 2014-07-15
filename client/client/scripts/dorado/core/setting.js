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

	/**
	 * @author Benny Bao (mailto:benny.bao@bstek.com)
	 * @name dorado.Setting
	 * @class dorado的配置对象，用于维护一组dorado运行时所需的参数。
	 * @static
	 * @see $setting
	 *
	 * @example
	 * var debugEnabled = dorado.Setting["common.debugEnabled"]; // 取得一个参数值
	 */
	// =====
	
	var doradoServierURI = ">dorado/view-service";
	
	/**
	 * @author Benny Bao (mailto:benny.bao@bstek.com)
	 * @name $setting
	 * @property
	 * @description dorado.Setting的快捷方式。
	 * @type dorado.Setting
	 * @see dorado.Setting
	 *
	 * @example
	 * var debugEnabled = $setting["common.debugEnabled"]; // 相当于dorado.Setting["common.debugEnabled"]
	 */
	dorado.Setting = {
		"common.defaultDateFormat": "Y-m-d",
		"common.defaultTimeFormat": "H:i:s",
		"common.defaultDateTimeFormat": "Y-m-d H:i:s",

		"common.defaultDisplayDateFormat": "Y-m-d",
		"common.defaultDisplayTimeFormat": "H:i:s",
		"common.defaultDisplayDateTimeFormat": "Y-m-d H:i:s",
		
		"ajax.defaultOptions": {
			batchable: true
		},
		"ajax.dataTypeRepositoryOptions": {
			url: doradoServierURI,
			method: "POST",
			batchable: true
		},
		"ajax.dataProviderOptions": {
			url: doradoServierURI,
			method: "POST",
			batchable: true
		},
		"ajax.dataResolverOptions": {
			url: doradoServierURI,
			method: "POST",
			batchable: true
		},
		"ajax.remoteServiceOptions": {
			url: doradoServierURI,
			method: "POST",
			batchable: true
		},
		"longPolling.pollingOptions": {
			url: doradoServierURI,
			method: "GET",
			batchable: false
		},
		"longPolling.sendingOptions": {
			url: doradoServierURI,
			method: "POST",
			batchable: true
		},
		"dom.useCssShadow": true,
		"widget.skin": "~current",
		"widget.panel.useCssCurveBorder": true,
		"widget.datepicker.defaultYearMonthFormat": "m &nbsp;&nbsp; Y"
	};
	
	if (window.$setting instanceof Object) {
		dorado.Object.apply(dorado.Setting, $setting);
	}
	
	var contextPath = dorado.Setting["common.contextPath"];
	if (contextPath) {
		if (contextPath.charAt(contextPath.length - 1) != '/') contextPath += '/';
	}
	else {
		contextPath = '/';
	}
	dorado.Setting["common.contextPath"] = contextPath;
	
	window.$setting = dorado.Setting;
})();

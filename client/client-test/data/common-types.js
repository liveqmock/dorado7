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

/*
 * DataType - Phone
 */
var dataTypePhone = new dorado.EntityDataType({
	name: "Phone",
	propertyDefs: [
		{ name: "product", label: "型号", required: true },
		{ name: "manufacturer", label: "生产商" },
		{ name: "type", label: "机型",
			mapValues: [
				{ key: "A", value: "直板" },
				{ key: "B", value: "翻盖" },
				{ key: "C", value: "滑盖" },
				{ key: "D", value: "旋盖" },
				{ key: "Z", value: "其它" }
			]
		},
		{ name: "price", label: "价格", dataType: "float", displayFormat: "￥#,##0.00" },
		{ name: "length", label: "长", dataType: "float", displayFormat: "0.0mm" },
		{ name: "width", label: "宽", dataType: "float", displayFormat: "0.0mm" },
		{ name: "height", label: "高", dataType: "float", displayFormat: "0.0mm" },
		{ name: "screen", label: "屏幕", dataType: "float", displayFormat: "0.0\"" },
		{ name: "touchScreen", label: "触摸屏", dataType: "boolean" },
		{ name: "cpu", label: "CPU" },
		{ name: "os", label: "操作系统" },
		{ name: "comment", label: "备注" }
	]
});
$dataTypeRepository.register(dataTypePhone);

/*
 * DataType - File
 */			
 
// 供 File中chilldren属性使用的数据装载器。
dorado.FilesDataProvider = $extend(dorado.AjaxDataProvider, {
	getLoadOptions: function(arg) {
		var options = $invokeSuper.call(this, arguments);
		options.url = "data/file-structure/" + options.jsonData.parameter + ".js";
		delete options.jsonData;
		return options;
	}
});

var dataTypeFile = new dorado.EntityDataType({
	name: "File",
	propertyDefs: [
		{ name: "id", visible: false },
		{ name: "name", label: "文件名", required: true, defaultValue: "<New File>" },
		{ name: "isDirectory", dataType: "boolean", visible: false },
		{ name: "lastModified", label: "最后修改时间", dataType: "Date", displayFormat: "Y-m-d H:n:s", readOnly: true,
		
			/**
			 * Function形式定义的默认值。运行时系统会自动调用该Function以获得实际的默认值。
			 */
			defaultValue: function() {
				return new Date();
			}
		},
		{ name: "length", label: "文件大小", dataType: "int", readOnly: true },
		{ name: "canWrite", label: "可写", dataType: "boolean" },
		{ name: "canRead", label: "可读", dataType: "boolean" },
		{ name: "canExecute", label: "可执行", dataType: "boolean" },
		{ name: "isHidden", label: "隐藏", dataType: "boolean" },
		
		/**
		 * 这是一个支持数据延时装载的特殊属性。
		 * 此处定义了通过FilesDataProvider装载数据，并且每次装载时传入当前数据实体的id属性值作为DataProvider的参数。
		 * FilesDataProvider会设法将参数值转换成具体的数据文件的URL，并装载数据。
		 */
		{ $type: "Reference", name: "children", dataType: "[File]",
			dataProvider: new dorado.FilesDataProvider(),
			parameter: function() {
				return this.get("id");
			}
		}
	]
});
$dataTypeRepository.register(dataTypeFile);

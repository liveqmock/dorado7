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

var Test = {
	_indexOfLastDelim: function(path) {
		for (var i = path.length - 2; i >= 0; i--) {
			var c = path.charAt(i);
			if (c == '/' || c == '\\') return i;
		}
		return -1;
	},

	CONTEXT_PATH: "/client-test",
	ROOT: "/client-test/workspace/client/client-test/",

	getJSON: function(path) {
		var xmlHttp = window.ActiveXObject ? new ActiveXObject("Microsoft.XMLHTTP") : new XMLHttpRequest();
		xmlHttp.open("GET", path, false);
		xmlHttp.send(null);
		return JSON.parse(xmlHttp.responseText);
		// return eval('(' + xmlHttp.responseText + ')')
	},

	_ASYNC_PROCEDURES: [],

	preloadAsyncTests: function(tests) {
		if (!tests instanceof Array) {
			tests = [tests];
		}

		setUpPageStatus = "running";
		for (var i = 0; i < tests.length; i++) {
			var test = tests[i];
			test.load();
		}

		if (this._ASYNC_PROCEDURES.length == 0) {
			if (this._asyncProcedureRegistered) {
				setUpPageStatus = "complete";
			} else {
				alert("No async procedure found.");
				return;
			}
		}
	},

	asyncProcBegin: function(id) {
		this._ASYNC_PROCEDURES.push(id);
		this._asyncProcedureRegistered = true;
	},

	asyncProcEnd: function(id) {
		this._ASYNC_PROCEDURES.remove(id);
		if (this._ASYNC_PROCEDURES.length == 0) setUpPageStatus = "complete";
	}
}

function getDepartmentDataTypes() {
	var employeeType, departmentType, employeesDataType, departmentsDataType;
	var p;

	employeeType = new dorado.EntityDataType("EmployeeDataType");
	p = new dorado.PropertyDef("id", dorado.$String);
	employeeType.addPropertyDef(p);

	p = new dorado.PropertyDef("name");
	p.set({
		label: "员工姓名",
		required: true
	});
	employeeType.addPropertyDef(p);

	p = new dorado.PropertyDef({
		name: "sex",
		label: "性别",
		mapping: [{
			key: "female",
			value: "女"
		}, {
			key: "male",
			value: "男"
		}]
	});
	employeeType.addPropertyDef(p);

	p = new dorado.PropertyDef("salary", dorado.$float);
	employeeType.addPropertyDef(p);

	departmentType = new dorado.EntityDataType("DepartmentDataType");
	p = new dorado.PropertyDef("id", dorado.$String);
	departmentType.addPropertyDef(p);

	p = new dorado.PropertyDef("name");
	departmentType.addPropertyDef(p);

	departmentsDataType = new dorado.AggregationDataType("DepartmentsDataType", departmentType);
	p = new dorado.PropertyDef("departments", departmentsDataType);
	departmentType.addPropertyDef(p);

	employeesDataType = new dorado.AggregationDataType("EmployeesDataType", employeeType);
	p = new dorado.PropertyDef("employees", employeesDataType);
	departmentType.addPropertyDef(p);
	return [departmentType, departmentsDataType];
}

function getDepartmentDataType() {
	return getDepartmentDataTypes()[0];
}

function getDepartmentsDataType() {
	return getDepartmentDataTypes()[1];
}

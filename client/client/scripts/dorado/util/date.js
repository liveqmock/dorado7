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
	 * @name Date
	 * @class 为系统日期对象提供格式化输入输出支持的prototype扩展。
	 * <p>
	 * <b>注意：此处的文档只描述了扩展的部分，并未列出日期对象所支持的所有属性方法。</b>
	 * </p>
	 * <p>
	 * 格式化输入输出日期值时，都需要使用格式化字符串。此处的格式化字符串支持下列具有特殊含义的字符：
	 * <ul>
	 * <li>d - 补足到两位的以数字表示的日期，即年月日中的日。</li>
	 * <li>D - 以文字缩写表示的星期几。</li>
	 * <li>j - 以数字表示日期，即年月日中的日。</li>
	 * <li>l - 以文字表示的星期几。</li>
	 * <li>S - 当前时间对象中天的英文序数后缀，返回值为 'st', 'nd', 'rd' 或 'th'。</li>
	 * <li>w - 以数字表示的星期几。</li>
	 * <li>z - 日期是当年中的第几天。</li>
	 * <li>W - 日期在当年中的第几周。</li>
	 * <li>F - 以文字表示的月份。</li>
	 * <li>m - 补足到两位的以数字表示的月份。</li>
	 * <li>M - 以文字缩写表示的月份。</li>
	 * <li>n - 以数字表示的月份。</li>
	 * <li>t - 日期是当月中的第几天。</li>
	 * <li>L - 以1和0表示是否闰年。</li>
	 * <li>Y - 年份。</li>
	 * <li>y - 年份的缩写。</li>
	 * <li>a - 以am、pm表示的上午、下午。</li>
	 * <li>A - 以AM、PM表示的上午、下午。</li>
	 * <li>g - 以数字表示的12进制小时。</li>
	 * <li>G - 以数字表示的24进制小时。</li>
	 * <li>h - 补足到两位的以数字表示的12进制小时。</li>
	 * <li>H - 补足到两位的以数字表示的24进制小时。</li>
	 * <li>i - 补足到两位的以数字表示的分钟。</li>
	 * <li>s - 补足到两位的以数字表示的秒数。</li>
	 * <li>O - 时区偏移字符串，格式如：'+0800'。</li>
	 * <li>T - 时区名，如 'CST', 'PDT', 'EDT' 等。</li>
	 * <li>Z - 以秒钟表示的与格林威治时间的时差。</li>
	 * </ul>
	 * </p>
	 */
		// ====

	Date.parseFunctions = {
		count: 0
	};
	Date.parseRegexes = [];
	Date.formatFunctions = {
		count: 0
	};

	/**
	 * 格式化输出日期值。
	 * @param {String} format 格式化字符串。
	 * @return {String} 格式化后的日期字符串。
	 *
	 * @example
	 * var date = new Date();
	 * date.formatDate("Y-m-d");    // 返回类似"2000-09-25"的字符串
	 * date.formatDate("H:i:s");    // 返回类似"23:10:30"的字符串
	 * date.formatDate("Y年m月d日 H点i分s秒");    // 返回类似"2000年09月25日 23点10分30秒"的字符串
	 */
	Date.prototype.formatDate = function(format) {
		if (Date.formatFunctions[format] == null) {
			Date.createNewFormat(format);
		}
		var func = Date.formatFunctions[format];
		return this[func]();
	};

	Date.createNewFormat = function(format) {
		var funcName = "format" + Date.formatFunctions.count++;
		Date.formatFunctions[format] = funcName;
		var code = "Date.prototype." + funcName + " = function(){return ";
		var special = false;
		var ch = '';
		for(var i = 0; i < format.length; ++i) {
			ch = format.charAt(i);
			if (!special && ch == "\\") {
				special = true;
			}
			else if (special) {
				special = false;
				code += "'" + String.escape(ch) + "' + ";
			}
			else {
				code += Date.getFormatCode(ch);
			}
		}
		eval(code.substring(0, code.length - 3) + ";}");
	};

	Date.getFormatCode = function(character) {
		switch(character) {
			case "d":
				return "String.leftPad(this.getDate(), 2, '0') + ";
			case "D":
				return "getDayNames()[this.getDay()].substring(0, 3) + ";
			case "j":
				return "this.getDate() + ";
			case "l":
				return "getDayNames()[this.getDay()] + ";
			case "S":
				return "this.getSuffix() + ";
			case "w":
				return "this.getDay() + ";
			case "z":
				return "this.getDayOfYear() + ";
			case "W":
				return "this.getWeekOfYear() + ";
			case "F":
				return "getMonthNames()[this.getMonth()] + ";
			case "m":
				return "String.leftPad(this.getMonth() + 1, 2, '0') + ";
			case "M":
				return "getMonthNames()[this.getMonth()].substring(0, 3) + ";
			case "n":
				return "(this.getMonth() + 1) + ";
			case "t":
				return "this.getDaysInMonth() + ";
			case "L":
				return "(this.isLeapYear() ? 1 : 0) + ";
			case "Y":
				return "this.getFullYear() + ";
			case "y":
				return "('' + this.getFullYear()).substring(2, 4) + ";
			case "a":
				return "(this.getHours() < 12 ? 'am' : 'pm') + ";
			case "A":
				return "(this.getHours() < 12 ? 'AM' : 'PM') + ";
			case "g":
				return "((this.getHours() %12) ? this.getHours() % 12 : 12) + ";
			case "G":
				return "this.getHours() + ";
			case "h":
				return "String.leftPad((this.getHours() %12) ? this.getHours() % 12 : 12, 2, '0') + ";
			case "H":
				return "String.leftPad(this.getHours(), 2, '0') + ";
			case "i":
				return "String.leftPad(this.getMinutes(), 2, '0') + ";
			case "s":
				return "String.leftPad(this.getSeconds(), 2, '0') + ";
			case "O":
				return "this.getGMTOffset() + ";
			case "T":
				return "this.getTimezone() + ";
			case "Z":
				return "(this.getTimezoneOffset() * -60) + ";
			default:
				return "'" + String.escape(character) + "' + ";
		}
	};

	/**
	 * 根据给定的格式尝试将一段日期字符串解析为日期值。
	 * @param {String} input 要解析的日期字符串。
	 * @param {String} format 格式化字符串。
	 * @return {Date} 日期值。
	 *
	 * @example
	 * var date1 = Date.parseDate("2000-09-25", "Y-m-d");
	 * var date2 = Date.parseDate("20000925", "Ymd");
	 * var date3 = Date.parseDate("2000-09-25 23:10:30", "Y-m-d H:i:s");
	 */
	Date.parseDate = function(input, format) {
		if (Date.parseFunctions[format] == null) {
			Date.createParser(format);
		}
		var func = Date.parseFunctions[format];
		return Date[func](input);
	};

	Date.createParser = function(format) {
		var funcName = "parse" + Date.parseFunctions.count++;
		var regexNum = Date.parseRegexes.length;
		var currentGroup = 1;
		Date.parseFunctions[format] = funcName;

		var code = "Date." + funcName + " = function(input){\n" + "var y = -1, m = -1, d = -1, h = -1, i = -1, s = -1;\n" +
			"var d = new Date();\n" +
			"y = d.getFullYear();\n" +
			"m = d.getMonth();\n" +
			"d = d.getDate();\n" +
			"var results = input.match(Date.parseRegexes[" +
			regexNum +
			"]);\n" +
			"if (results && results.length > 0) {";

		var regex = "";

		var special = false;
		var ch = '';
		for(var i = 0; i < format.length; ++i) {
			ch = format.charAt(i);
			if (!special && ch == "\\") {
				special = true;
			}
			else if (special) {
				special = false;
				regex += String.escape(ch);
			}
			else {
				obj = Date.formatCodeToRegex(ch, currentGroup);
				currentGroup += obj.g;
				regex += obj.s;
				if (obj.g && obj.c) {
					code += obj.c;
				}
			}
		}

		code += "if (y > 0 && m >= 0 && d > 0 && h >= 0 && i >= 0 && s >= 0)\n" + "{return new Date(y, m, d, h, i, s);}\n" +
			"else if (y > 0 && m >= 0 && d > 0 && h >= 0 && i >= 0)\n" +
			"{return new Date(y, m, d, h, i);}\n" +
			"else if (y > 0 && m >= 0 && d > 0 && h >= 0)\n" +
			"{return new Date(y, m, d, h);}\n" +
			"else if (y > 0 && m >= 0 && d > 0)\n" +
			"{return new Date(y, m, d);}\n" +
			"else if (y > 0 && m >= 0)\n" +
			"{return new Date(y, m);}\n" +
			"else if (y > 0)\n" +
			"{return new Date(y);}\n" +
			"}return null;}";

		Date.parseRegexes[regexNum] = new RegExp("^" + regex + "$");
		eval(code);
	};

	Date.formatCodeToRegex = function(character, currentGroup) {
		switch(character) {
			case "D":
				return {
					g: 0,
					c: null,
					s: "(?:Sun|Mon|Tue|Wed|Thu|Fri|Sat)"
				};
			case "j":
			case "d":
				return {
					g: 1,
					c: "d = parseInt(results[" + currentGroup + "], 10);\n",
					s: "(\\d{1,2})"
				};
			case "l":
				return {
					g: 0,
					c: null,
					s: "(?:" + getDayNames().join("|") + ")"
				};
			case "S":
				return {
					g: 0,
					c: null,
					s: "(?:st|nd|rd|th)"
				};
			case "w":
				return {
					g: 0,
					c: null,
					s: "\\d"
				};
			case "z":
				return {
					g: 0,
					c: null,
					s: "(?:\\d{1,3})"
				};
			case "W":
				return {
					g: 0,
					c: null,
					s: "(?:\\d{2})"
				};
			case "F":
				return {
					g: 1,
					c: "m = parseInt(Date.monthNumbers[results[" + currentGroup + "].substring(0, 3)], 10);\n",
					s: "(" + getMonthNames().join("|") + ")"
				};
			case "M":
				return {
					g: 1,
					c: "m = parseInt(Date.monthNumbers[results[" + currentGroup + "]], 10);\n",
					s: "(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)"
				};
			case "n":
			case "m":
				return {
					g: 1,
					c: "m = parseInt(results[" + currentGroup + "], 10) - 1;\n",
					s: "(\\d{1,2})"
				};
			case "t":
				return {
					g: 0,
					c: null,
					s: "\\d{1,2}"
				};
			case "L":
				return {
					g: 0,
					c: null,
					s: "(?:1|0)"
				};
			case "Y":
				return {
					g: 1,
					c: "y = parseInt(results[" + currentGroup + "], 10);\n",
					s: "(\\d{4})"
				};
			case "y":
				return {
					g: 1,
					c: "var ty = parseInt(results[" + currentGroup + "], 10);\n" +
						"y = ty > Date.y2kYear ? 1900 + ty : 2000 + ty;\n",
					s: "(\\d{1,2})"
				};
			case "a":
				return {
					g: 1,
					c: "if (results[" + currentGroup + "] == 'am') {\n" + "if (h == 12) { h = 0; }\n" +
						"} else { if (h < 12) { h += 12; }}",
					s: "(am|pm)"
				};
			case "A":
				return {
					g: 1,
					c: "if (results[" + currentGroup + "] == 'AM') {\n" + "if (h == 12) { h = 0; }\n" +
						"} else { if (h < 12) { h += 12; }}",
					s: "(AM|PM)"
				};
			case "g":
			case "G":
			case "h":
			case "H":
				return {
					g: 1,
					c: "h = parseInt(results[" + currentGroup + "], 10);\n",
					s: "(\\d{1,2})"
				};
			case "i":
				return {
					g: 1,
					c: "i = parseInt(results[" + currentGroup + "], 10);\n",
					s: "(\\d{2})"
				};
			case "s":
				return {
					g: 1,
					c: "s = parseInt(results[" + currentGroup + "], 10);\n",
					s: "(\\d{2})"
				};
			case "O":
				return {
					g: 0,
					c: null,
					s: "[+-]\\d{4}"
				};
			case "T":
				return {
					g: 0,
					c: null,
					s: "[A-Z]{3}"
				};
			case "Z":
				return {
					g: 0,
					c: null,
					s: "[+-]\\d{1,5}"
				};
			default:
				return {
					g: 0,
					c: null,
					s: String.escape(character)
				};
		}
	};

	Date.prototype.getTimezone = function() {
		return this.toString().replace(/^.*? ([A-Z]{3}) [0-9]{4}.*$/, "$1").replace(/^.*? [0-9]{4}.* \(([A-Z]{3})\)$/g, "$1").replace(/^.*?\(([A-Z])[a-z]+ ([A-Z])[a-z]+ ([A-Z])[a-z]+\)$/, "$1$2$3");
	};

	Date.prototype.getGMTOffset = function() {
		return (this.getTimezoneOffset() > 0 ? "-" : "+") +
			String.leftPad(Math.floor(Math.abs(this.getTimezoneOffset() / 60)), 2, "0") +
			String.leftPad(this.getTimezoneOffset() % 60, 2, "0");
	};

	Date.prototype.getDayOfYear = function() {
		var num = 0;
		Date.daysInMonth[1] = this.isLeapYear() ? 29 : 28;
		for(var i = 0; i < this.getMonth(); ++i) {
			num += Date.daysInMonth[i];
		}
		return num + this.getDate() - 1;
	};

	Date.prototype.getWeekOfYear = function() {
		// Skip to Thursday of this week
		var now = this.getDayOfYear() + (4 - this.getDay());
		// Find the first Thursday of the year
		var jan1 = new Date(this.getFullYear(), 0, 1);
		var then = (7 - jan1.getDay() + 4);
		return String.leftPad(((now - then) / 7) + 1, 2, "0");
	};

	Date.prototype.isLeapYear = function() {
		var year = this.getFullYear();
		return ((year & 3) == 0 && (year % 100 || (year % 400 == 0 && year)));
	};

	Date.prototype.getFirstDayOfMonth = function() {
		var day = (this.getDay() - (this.getDate() - 1)) % 7;
		return (day < 0) ? (day + 7) : day;
	};

	Date.prototype.getLastDayOfMonth = function() {
		var day = (this.getDay() + (Date.daysInMonth[this.getMonth()] - this.getDate())) % 7;
		return (day < 0) ? (day + 7) : day;
	};

	Date.prototype.getDaysInMonth = function() {
		Date.daysInMonth[1] = this.isLeapYear() ? 29 : 28;
		return Date.daysInMonth[this.getMonth()];
	};

	Date.prototype.getSuffix = function() {
		switch(this.getDate()) {
			case 1:
			case 21:
			case 31:
				return "st";
			case 2:
			case 22:
				return "nd";
			case 3:
			case 23:
				return "rd";
			default:
				return "th";
		}
	};

	String.escape = function(string) {
		return string.replace(/('|\\)/g, "\\$1");
	};

	String.leftPad = function(val, size, ch) {
		var result = new String(val);
		if (ch == null) {
			ch = " ";
		}
		while(result.length < size) {
			result = ch + result;
		}
		return result;
	};

	Date.daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
	Date.y2kYear = 50;
	Date.monthNumbers = {
		Jan: 0,
		Feb: 1,
		Mar: 2,
		Apr: 3,
		May: 4,
		Jun: 5,
		Jul: 6,
		Aug: 7,
		Sep: 8,
		Oct: 9,
		Nov: 10,
		Dec: 11
	};
	Date.patterns = {
		ISO8601LongPattern: "Y-m-d H:i:s",
		ISO8601ShortPattern: "Y-m-d",
		ShortDatePattern: "n/j/Y",
		LongDatePattern: "l, F d, Y",
		FullDateTimePattern: "l, F d, Y g:i:s A",
		MonthDayPattern: "F d",
		ShortTimePattern: "g:i A",
		LongTimePattern: "g:i:s A",
		SortableDateTimePattern: "Y-m-d\\TH:i:s",
		UniversalSortableDateTimePattern: "Y-m-d H:i:sO",
		YearMonthPattern: "F, Y"
	};

	function getMonthNames() {
		if (!Date.monthNames) {
			Date.monthNames = ($resource("dorado.core.AllMonths") || "January,February,March,April,May,June,July,August,September,October,November,December").split(",");
		}
		return Date.monthNames;
	}

	function getDayNames() {
		if (!Date.dayNames) {
			Date.dayNames = ($resource("dorado.core.AllWeeks") || "Sunday,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday").split(",");
		}
		return Date.dayNames;
	}

})();
dorado.console = {};
/**
 * Dorado 控制台辅助 Alex Tong (mailto:alex.tong@bstek.com)
 */
dorado.console.util = {
	/**
	 * 格式化文件大小
	 * @param {Number} value 文件大小。
	 * @return {String} 格式化后得到的字符串。
	 * @example
	 * var $formatFileSize = dorado.console.util.formatFileSize;
	 * $formatFileSize(1024); // 1KB
	 * $formatFileSize(1048576); // 1MB
	 * $formatFileSize(1073741824); // 1GB
	 * 
	 */
	formatFileSize : function(value) {
		function _format(value, unit) {
			return (value.toFixed(1) + ' ' + unit).replace('.0', '');
		}
		var K = 1024, M = K * K, G = M * K, T = G * K;
		var dividers = [ T, G, M, K, 1 ], units = [ 'TB', 'GB', 'MB', 'KB', 'B' ];
		if (value == 0) {
			return '0B';
		} else if (value < 0) {
			return 'Invalid size';
		}

		var result = '', temp = 0;
		for ( var i = 0; i < dividers.length; i++) {
			var divider = dividers[i];
			if (value >= divider) {
				temp = value / divider;
				if (temp < 1.05) {
					result = _format(value,
							units[((i + 1) < units.length) ? (i + 1) : i]);
				} else {
					result = _format(temp, units[i]);
				}
				break;
			}
		}
		return result;
	},
	/**
	 * 格式化日期
	 * @param {Date} date 日期。
	 * @param {String} format 格式化字符串。
	 * @return {String} 格式化后得到的字符串。
	 * @example
	 * var $formatDate = dorado.console.util.formatDate;
	 * var date=new Date();
	 * $formatDate(date,"yyyy-MM-dd hh:mm:ss.S"); // 2013-01-02 08:09:04.423
	 * $formatDate(date,"yyyy-M-d h:m:s.S"); // 2013-1-2 8:9:4.18
	 */
	formatDate : function(date, fmt) {
		var o = {
			"M+" : date.getMonth() + 1,
			"d+" : date.getDate(),
			"h+" : date.getHours(),
			"m+" : date.getMinutes(),
			"s+" : date.getSeconds(),
			"q+" : Math.floor((date.getMonth() + 3) / 3),
			"S" : date.getMilliseconds()
		};
		if (/(y+)/.test(fmt))
			fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "")
					.substr(4 - RegExp.$1.length));
		for ( var k in o)
			if (new RegExp("(" + k + ")").test(fmt))
				fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k])
						: (("00" + o[k]).substr(("" + o[k]).length)));
		return fmt;
	},
	/**
	 * 格式化时间
	 * <p>
	 * 默认格式化格式位yyyy-M-d h:m:s.S
	 * </p>
	 * @param {String/Number/Date} time 时间。
	 * @return {String} 格式化后得到的字符串。
	 * @example
	 * var $formatTime = dorado.console.util.formatTime;
	 * var date=new Date();
	 * $formatTime(date); //2013-1-2 8:9:4.18
	 */
	formatTime : function(time) {
		var format = "yyyy-MM-dd hh:mm:ss.S";
		return this.formatDate(new Date(time), format);
	},
	/**
	 * 格式化时间长度
	 * @param {Number} time 时间。
	 * @return {String} 格式化后得到的字符串。
	 * @example
	 * var $formatTimeLength = dorado.console.util.formatTimeLength;
	 * $formatTimeLength(45); //45s
	 * $formatTimeLength(105); //1m45s
	 * $formatTimeLength(3645); //1h0m45s
	 */
	formatTimeLength : function(time) {
		time = Math.round(time);
		var tmpTime = Math.floor(time / 1000), h, m, s, sf, value;
		h = Math.floor(tmpTime / 3600);
		m = Math.floor((tmpTime % 3600) / 60);
		s = Math.floor((tmpTime % 3600 % 60));
		sf = (time - h * 60 * 60 * 1000 - m * 60 * 1000 - s * 1000) / 1000;
		value = h > 0 ? h + 'h' + m + 'm' : '';
		value = h <= 0 && m > 0 ? m + 'm' : '';
		value = value + (s + sf) + 's';
		return value;
	},
	/**
	 * 求数组平均值
	 * @param {Array} nums 数组。
	 * @return {String} 平均值。
	 */
	avg : function(nums) {
		var sum = 0;
		for ( var i = 0; i < nums.length; i++) {
			sum += nums[i];
		}
		var value = (nums.length == 0 ? '0' : sum / nums.length) + '';
		return value.indexOf(".") > 0 ? value.substring(0, value.indexOf("."))
				: value;
	},
	/**
	 * 求百分比函数
	 * @param {Number} num 除数
	 * @param {Number} total 合计
	 * @return {String} 保留两位小数点
	 */
	percent : function(num, total) {
		num = parseFloat(num);
		total = parseFloat(total);
		if (isNaN(num) || isNaN(total)) {
			return "-";
		}
		return total <= 0 ? "0%"
				: (Math.round(num / total * 10000) / 100.00 + "%");
	}
}


/**
 * 解决小数科学计数法的问题
 */
String.prototype.expandExponential = function() {
	return this
			.replace(
					/^([+-])?(\d+).?(\d*)[eE]([-+]?\d+)$/,
					function(x, s, n, f, c) {
						var l = +c < 0, i = n.length + +c, x = (l ? n : f).length, c = ((c = Math
								.abs(c)) >= x ? c - x + l : 0), z = (new Array(
								c + 1)).join("0"), r = n + f;
						return (s || "")
								+ (l ? r = z + r : r += z).substr(0,
										i += l ? z.length : 0)
								+ (i < r.length ? "." + r.substr(i) : "");
					});
};
/** @Global */
function parseString(value) {
	if (value == null) {
		return "";
	}
	if (typeof value == "number") {
		return value.toString().expandExponential();
	}
	return value.toString();
}
/**
 * 解决小数科学计数法的问题，重写解析string的方法
 */
Number.prototype.old_toString = Number.prototype.toString;
Number.prototype.toString = function() {
	return this.old_toString().expandExponential();
}

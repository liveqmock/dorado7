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
 * @name dorado.validator
 * @namespace 各种数据校验器的命名空间。
 */
dorado.validator = {};

dorado.validator.defaultOkMessage = [{
	state : "ok"
}];

dorado.Toolkits.registerTypeTranslator("validator", function(type) {
	return dorado.util.Common.getClassType("dorado.validator." + type + "Validator", true);
});
/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @class 数据校验器的抽象类。
 * @abstract
 * @extends dorado.AttributeSupport
 * @extends dorado.EventSupport
 */
dorado.validator.Validator = $extend([dorado.AttributeSupport, dorado.EventSupport], /** @scope dorado.validator.Validator.prototype */
{
	className : "dorado.validator.Validator",

	ATTRIBUTES : /** @scope dorado.validator.Validator.prototype */
	{
		/**
		 * 名称
		 * @type String
		 * @attribute
		 */
		name: {},

		/**
		 * 校验未通过时给出的信息的默认级别。
		 * <p>
		 * 取值范围包括：info、ok、warn、error。默认值为error。
		 * </p>
		 * @type String
		 * @attribute
		 * @default "error"
		 */
		defaultResultState : {
			defaultValue : "error"
		},
		
		/**
		 * 是否重新校验旧的数值。
		 * <p>
		 * 即当用户将某Field的数值修改回原始值时，是否要重新执行此校验器。
		 * </p>
		 * @type Boolean
		 * @attribute
		 * @default true
		 */
		revalidateOldValue: {
			defaultValue : true
		}
	},

	/**
	 * @name dorado.validator.Validator#doValidate
	 * @function
	 * @protected
	 * @param {Object} data 要验证的数据。
	 * @return {String|Object|[String]|[Object]} 验证结果。
	 * 此处的返回值可以是单独的消息文本、消息对象等。最终Validator会将各种类型的返回值自动的转换成标准的形式。
	 * @description 内部的验证数据逻辑。
	 * @see dorado.validator.Validator#validate
	 */
	// =====

	constructor : function(config) {
		$invokeSuper.call(this, arguments);
		if(config) this.set(config);
	},
	
	getListenerScope : function() {
		return (this._propertyDef) ? this._propertyDef.get("view") : dorado.widget.View.TOP;
	},
	
	/**
	 * 验证数据。
	 * @param {Object} data 要验证的数据。
	 * @param {Object} [arg] 验证参数。通常可能包含两个子属性。
	 * @param {Object} [arg.property] 当前被修改的属性名。
	 * @param {Object} [arg.entity] 当前被修改的数据实体。
	 * @return {[Object]} 验证结果。
	 * 不返回任何验证结果表示通过验证，但返回验证结果并不一定表示未通过验证。
	 * <p>
	 * 返回的验证结果应该是由0到多个验证消息构成的数组。每一个验证结果是一个JSON对象，该JSON对象包含以下属性：
	 * <ul>
	 * <li>state	-	{String} 信息级别。取值范围包括：info、ok、warn、error。默认值为error。</li>
	 * <li>text	-	{String} 信息内容。</li>
	 * </ul>
	 * </p>
	 * <p>
	 * 不过在实际的使用过程中可以根据需要以更加简洁的方式来定义验证结果。<br>
	 * 例如您只想返回一条单一的信息，那么就可以直接返回一个JSON对象而不必将其封装到数组中。<br>
	 * 甚至可以直接返回一个字符串，此时系统认为您希望返回一条单一的信息，该字符串将被视作信息的文本，
	 * 信息的级别则由{@link dorado.validator.Validator#defaultResultState}决定。
	 * </p>
	 * @see dorado.Entity#getPropertyMessages
	 */
	validate : function(data, arg) {
		var result = this.doValidate(data, arg);
		return dorado.Toolkits.trimMessages(result, this._defaultResultState) || dorado.validator.defaultOkMessage;
	}
});

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @class 远程校验器。
 * @extends dorado.validator.Validator
 * @abstract
 */
dorado.validator.RemoteValidator = $extend(dorado.validator.Validator, /** @scope dorado.validator.RemoteValidator.prototype */
{
	className : "dorado.validator.RemoteValidator",

	ATTRIBUTES : /** @scope dorado.validator.RemoteValidator.prototype */
	{
		/**
		 * 是否以异步的方式来执行验证。
		 * @type boolean
		 * @attribute
		 * @default true
		 */
		async : {
			defaultValue : true
		},

		/**
		 * 当此校验器正在执行时希望系统显示给用户的提示信息。
		 * <p>
		 * 此属性目前仅在校验器以异步模式执行时有效。
		 * </p>
		 * @type String
		 * @attribute
		 */
		executingMessage : {}
	},

	/**
	 * @name dorado.validator.RemoteValidator#doValidate
	 * @function
	 * @protected
	 * @param {Object} data 要验证的数据。
	 * @param {Object} [arg] 验证参数。通常可能包含两个子属性。
	 * @param {Object} [arg.property] 当前被修改的属性名。
	 * @param {Object} [arg.entity] 当前被修改的数据实体。
	 * @param {Function|dorado.Callback} callback 回调方法或对象。
	 * @return {String|Object|[String]|[Object]} 验证结果。
	 * <ul>
	 * <li>对于同步的验证方式，验证结果将直接通过方法的返回值返回。</li>
	 * <li>对于异步的验证方式，验证结果将通过回调方法的参数传给外界。</li>
	 * </ul>
	 * @description 内部的验证数据逻辑。
	 * @see dorado.validator.RemoteValidator#validate
	 */
	// =====

	/**
	 * @name dorado.validator.RemoteValidator.Validator#validate
	 * @function
	 * @param {Object} data 要验证的数据。
	 * @param {Object} [arg] 验证参数。通常可能包含两个子属性。
	 * @param {Object} [arg.property] 当前被修改的属性名。
	 * @param {Object} [arg.entity] 当前被修改的数据实体。
	 * @param {Function|dorado.Callback} callback 回调方法或对象。此参数对于同步或异步两种验证方式都有效。
	 * @return {[Object]} 验证结果。
	 * <ul>
	 * <li>对于同步的验证方式，验证结果将直接通过方法的返回值返回。</li>
	 * <li>对于异步的验证方式，验证结果将通过回调方法的参数传给外界。</li>
	 * </ul>
	 * @description 验证数据。
	 */
	validate : function(data, arg, callback) {
		if(this._async) {
			this.doValidate(data, arg, {
				scope : this,
				callback : function(success, result) {
					if(success) {
						result = dorado.Toolkits.trimMessages(result, this._defaultResultState);
					} else {
						result = dorado.Toolkits.trimMessages(dorado.Exception.getExceptionMessage(result), "error");
					}
					result = result || dorado.validator.defaultOkMessage;
					$callback(callback, true, result);
				}
			});
		} else {
			var result = $invokeSuper.call(this, arguments);
			if(callback) {
				$callback(callback, true, result);
			}
			return result;
		}
	}
});

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @class 简单校验器的抽象类。
 * @extends dorado.validator.Validator
 * @abstract
 */
dorado.validator.BaseValidator = $extend(dorado.validator.Validator, /** @scope dorado.validator.BaseValidator.prototype */
{
	className : "dorado.validator.BaseValidator",

	ATTRIBUTES : /** @scope dorado.validator.BaseValidator.prototype */
	{

		/**
		 * 默认的验证信息内容。
		 * @type String
		 * @attribute
		 */
		resultMessage : {}
	},

	validate : function(data, arg) {
		var result = this.doValidate(data, arg);
		if(this._resultMessage && result && typeof result == "string") result = this._resultMessage;
		return dorado.Toolkits.trimMessages(result, this._defaultResultState);
	}
});

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @class 非空校验器。
 * @shortTypeName Required
 * @extends dorado.validator.BaseValidator
 */
dorado.validator.RequiredValidator = $extend(dorado.validator.BaseValidator, /** @scope dorado.validator.RequiredValidator.prototype */
{
	className : "dorado.validator.RequiredValidator",

	ATTRIBUTES : /** @scope dorado.validator.RequiredValidator.prototype */
	{

		/**
		 * 是否针对trim之后的文本进行非空校验。此属性只对String类型的数值有效。
		 * @type boolean
		 * @attribute
		 * @default true
		 */
		trimBeforeValid : {
			defaultValue : true
		},

		/**
		 * 是否认为0或false是有效的数值。此属性只对数字或逻辑类型的数值有效。
		 * @type boolean
		 * @attribute
		 */
		acceptZeroOrFalse : {
			defaultValue : false
		}
	},

	doValidate: function(data, arg) {
		var valid = (data !== null && data !== undefined && data !== ""), message = '';
		if (valid) {
			if (this._trimBeforeValid && typeof data == "string") {
				valid = jQuery.trim(data) != "";
			} else if (typeof data == "number" || typeof data == "boolean") {
				valid = (!!data || this._acceptZeroOrFalse);
			}
		}
		if (!valid) {
			message = $resource("dorado.data.ErrorContentRequired");
		}
		return message;
	}
});

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @class 文本长度校验器。
 * @shortTypeName Length
 * @extends dorado.validator.BaseValidator
 */
dorado.validator.LengthValidator = $extend(dorado.validator.BaseValidator, /** @scope dorado.validator.LengthValidator.prototype */
{
	className : "dorado.validator.LengthValidator",

	ATTRIBUTES : /** @scope dorado.validator.LengthValidator.prototype */
	{

		/**
		 * 最小合法长度。如果设置为-1则表示忽略对于最小合法长度的校验。
		 * @type int
		 * @attribute
		 * @default -1
		 */
		minLength : {
			defaultValue : -1
		},

		/**
		 * 最大合法长度。如果设置为-1则表示忽略对于最大合法长度的校验。
		 * @type int
		 * @attribute
		 * @default -1
		 */
		maxLength : {
			defaultValue : -1
		}
	},

	doValidate: function(data, arg) {
		if (typeof data == "number") {
			data += '';
		}
		if (typeof data != "string") return;
		var invalid, message = '', len = data.length;
		if (this._minLength > 0 && len < this._minLength) {
			invalid = true;
			message += $resource("dorado.data.ErrorContentTooShort", this._minLength);
		}
		if (this._maxLength > 0 && len > this._maxLength) {
			invalid = true;
			if (message) message += '\n';
			message += $resource("dorado.data.ErrorContentTooLong", this._maxLength);
		}
		return message;
	}
});

/**
 * @author William (mailto:william.jiang@bstek.com)
 * @class 字节长度校验器。
 * @shortTypeName CharLength
 * @extends dorado.validator.BaseValidator
 */
dorado.validator.CharLengthValidator = $extend(dorado.validator.BaseValidator, /** @scope dorado.validator.CharLengthValidator.prototype */
{
	className : "dorado.validator.CharLengthValidator",

	ATTRIBUTES : /** @scope dorado.validator.CharLengthValidator.prototype */
	{

		/**
		 * 最小合法长度。如果设置为-1则表示忽略对于最小合法长度的校验。
		 * @type int
		 * @attribute
		 * @default -1
		 */
		minLength : {
			defaultValue : -1
		},

		/**
		 * 最大合法长度。如果设置为-1则表示忽略对于最大合法长度的校验。
		 * @type int
		 * @attribute
		 * @default -1
		 */
		maxLength : {
			defaultValue : -1
		}
	},
	
	doValidate: function(data, arg) {
		function getBytesLength(data) {    
			var str = escape(data);    
			for(var i = 0, length = 0;i < str.length; i++, length++) {    
				if(str.charAt(i) == "%") {    
					if(str.charAt(++i) == "u") {    
						i += 3;    
						length++;    
					}    
					i++;    
				}    
			}    
			return length;    
		}
		
		if (typeof data == "number") {
			data += '';
		}
		if (typeof data != "string") return;
		var invalid, message = '', len = getBytesLength(data);
		if (this._minLength > 0 && len < this._minLength) {
			invalid = true;
			message += $resource("dorado.data.ErrorContentTooShort", this._minLength);
		}
		if (this._maxLength > 0 && len > this._maxLength) {
			invalid = true;
			if (message) message += '\n';
			message += $resource("dorado.data.ErrorContentTooLong", this._maxLength);
		}
		return message;
	}
});

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @class 数值区间校验器。
 * @shortTypeName Range
 * @extends dorado.validator.BaseValidator
 */
dorado.validator.RangeValidator = $extend(dorado.validator.BaseValidator, /** @scope dorado.validator.RangeValidator.prototype */
{
	className : "dorado.validator.RangeValidator",

	ATTRIBUTES : /** @scope dorado.validator.RangeValidator.prototype */
	{

		/**
		 * 最小值。
		 * @type float
		 * @attribute
		 * @see dorado.validator.RangeValidator#attribute:minValueValidateMode
		 */
		minValue : {},

		/**
		 * 最小值的校验方式。
		 * <p>
		 * 目前支持如下几种取值:
		 * <ul>
		 * <li>ignore	-	忽略对于最小值的校验。</li>
		 * <li>allowEquals	-	被校验的数据必须大于或等于设定的最小值。</li>
		 * <li>notAllowEquals	-	被校验的数据必须大于设定的最小值。</li>
		 * </ul>
		 * </p>
		 * @type String
		 * @attribute
		 * @default "ignore"
		 * @see dorado.validator.RangeValidator#attribute:minValue
		 */
		minValueValidateMode : {
			defaultValue : "ignore"
		},

		/**
		 * 最大值。
		 * @type float
		 * @attribute
		 * @see dorado.validator.RangeValidator#attribute:maxValueValidateMode
		 */
		maxValue : {},

		/**
		 * 最大值的校验方式。
		 * <p>
		 * 目前支持如下几种取值:
		 * <ul>
		 * <li>ignore	-	忽略对于最大值的校验。</li>
		 * <li>allowEquals	-	被校验的数据必须小于或等于设定的最大值。</li>
		 * <li>notAllowEquals	-	被校验的数据必须小于设定的最大值。</li>
		 * </ul>
		 * </p>
		 * @type String
		 * @attribute
		 * @default "ignore"
		 * @see dorado.validator.RangeValidator#attribute:maxValue
		 */
		maxValueValidateMode : {
			defaultValue : "ignore"
		}
	},

	doValidate : function(data, arg) {
		var invalidMin, invalidMax, message = '', subMessage = '', data = ( typeof data == "number") ? data : parseFloat(data);
		if(this._minValueValidateMode != "ignore") {
			if(data == this._minValue && this._minValueValidateMode != "allowEquals") {
				invalidMin = true;
			}
			if(data < this._minValue) {
				invalidMin = true;
			}
			if (this._minValueValidateMode == "allowEquals")  {
				subMessage = $resource("dorado.data.ErrorOrEqualTo");
			} else {
				subMessage = '';
			}
			if(invalidMin) {
				message += $resource("dorado.data.ErrorNumberTooLess", subMessage, this._minValue);
			}
		}
		if(this._maxValueValidateMode != "ignore") {
			if(data == this._maxValue && this._maxValueValidateMode != "allowEquals") {
				invalidMax = true;
			}
			if(data > this._maxValue) {
				invalidMax = true;
			}
			if (this._maxValueValidateMode == "allowEquals")  {
				subMessage = $resource("dorado.data.ErrorOrEqualTo");
			} else {
				subMessage = '';
			}
			if(invalidMax) {
				if(message) message += '\n';
				message += $resource("dorado.data.ErrorNumberTooGreat", subMessage, this._maxValue);
			}
		}
		if(invalidMin || invalidMax) return message;
	}
});

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @class 枚举值校验器。
 * <p>
 * 即允许用户设置一个合法值的列表，只有处于合法值的列表中的数值才能通过此校验。
 * </p>
 * @shortTypeName Enum
 * @extends dorado.validator.BaseValidator
 */
dorado.validator.EnumValidator = $extend(dorado.validator.BaseValidator, /** @scope dorado.validator.EnumValidator.prototype */
{
	className : "dorado.validator.EnumValidator",

	ATTRIBUTES : /** @scope dorado.validator.EnumValidator.prototype */
	{

		/**
		 * 合法值的数组。
		 * @type Object[]
		 * @attribute
		 */
		enumValues : {}
	},

	doValidate : function(data, arg) {
		if (data == null) return;
		if(this._enumValues instanceof Array && this._enumValues.indexOf(data) < 0) {
			return $resource("dorado.data.ErrorValueOutOfEnumRange");
		}
	}
});

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @class 正则表达式校验器。
 * @shortTypeName RegExp
 * @extends dorado.validator.BaseValidator
 */
dorado.validator.RegExpValidator = $extend(dorado.validator.BaseValidator, /** @scope dorado.validator.RegExpValidator.prototype */
{
	className : "dorado.validator.RegExpValidator",

	ATTRIBUTES : /** @scope dorado.validator.RegExpValidator.prototype */
	{

		/**
		 * 白表达式。即用于描述怎样的数值是合法值的表达式。
		 * @attribute
		 * @type String
		 */
		whiteRegExp : {},

		/**
		 * 黑表达式。即用于描述怎样的数值是非法值的表达式。
		 * @attribute
		 * @type String
		 */
		blackRegExp : {},

		/**
		 * 校验模式，此属性用于决定黑白两种表达式哪一个的优先级更高。
		 * 该属性支持两种取值:
		 * <ul>
		 * <li>whiteBlack	-	先白后黑，即首先校验白表达式，即表示最终黑表达式的优先级更高。</li>
		 * <li>blackWhite	-	先黑后白，即首先校验黑表达式，即表示最终白表达式的优先级更高。</li>
		 * </ul>
		 * @attribute
		 * @type String
		 * @default "whiteBlack"
		 */
		validateMode : {
			defaultValue : "whiteBlack"
		}
	},

	doValidate: function(data, arg) {
		function toRegExp(text) {
			var regexp = null;
			if (text) {
				regexp = (text.charAt(0) == '/') ? eval(text) : new RegExp(text);
			}
			return regexp;
		}
		
		if (typeof data != "string" || data == '') return;
		var whiteRegExp = toRegExp(this._whiteRegExp), blackRegExp = toRegExp(this._blackRegExp);
		var whiteMatch = whiteRegExp ? data.match(whiteRegExp) : false;
		var blackMatch = blackRegExp ? data.match(blackRegExp) : false;
		
		var valid;
		if (this._validateMode == "whiteBlack") {
			valid = whiteRegExp ? whiteMatch : true;
			if (valid && blackRegExp) {
				valid = !blackMatch;
			}
		} else {
			valid = blackRegExp ? !blackMatch : true;
			if (valid && whiteRegExp) {
				valid = whiteMatch;
			}
		}
		if (!valid) return $resource("dorado.data.ErrorBadFormat", data);
	}
});

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @class 通过Ajax操作执行的远程校验器。
 * @shortTypeName Ajax
 * @extends dorado.validator.RemoteValidator
 */
dorado.validator.AjaxValidator = $extend(dorado.validator.RemoteValidator, /** @scope dorado.validator.AjaxValidator.prototype */
{
	className : "dorado.validator.AjaxValidator",

	ATTRIBUTES : /** @scope dorado.validator.AjaxValidator.prototype */
	{
		/**
		 * Dorado服务端暴露给客户端的某个服务的名称。
		 * @type String
		 * @attribute
		 */
		service : {},
		
		/**
		 * 直接绑定一个已有的AjaxAction。
		 * @type dorado.widget.AjaxAction
		 * @attribute
		 */
		ajaxAction: {
			setter: function(ajaxAction) {
				this._ajaxAction = dorado.widget.ViewElement.getComponentReference(this, "ajaxAction", ajaxAction);
			}
		}
	},
	
	EVENTS : /** @scope dorado.validator.AjaxValidator.prototype */
	{

		/**
		 * 当校验器将要发出数据校验的请求之前触发的事件。
		 * @param {Object} self 事件的发起者，即本校验器对象。
		 * @param {Object} arg 事件参数。
		 * @param {Object} arg.data 当前将要校验的数据，默认是用户在界面中刚刚编辑的数据。
		 * @param {String} arg.property 用户当前编辑的属性名。
		 * @param {dorado.Entity} arg.entity 用户当前编辑的数据实体。
		 * @param {Object} #arg.parameter 要传递给服务端的数据。
		 * <p>
		 * 此参数就是AjaxValidator稍后即将通过AjaxAction发送到服务端的信息。
		 * 默认情况parameter是一个JSON对象，其中包含一个名为data的属性，其值为用户在界面中刚刚编辑的数据。
		 * </p>
		 * <p>
		 * 如果您需要自定定义发往服务端的信息，既可以直接修改此JSON对象，也可以直接为arg.parameter赋以新值。
		 * </p>
		 * @return {boolean} 是否要继续后续事件的触发操作，不提供返回值时系统将按照返回值为true进行处理。
		 * @event
		 */
		beforeExecute: {}
	},

	constructor : function(config) {
		if(!dorado.widget || !dorado.widget.AjaxAction) {
			this._disabled = true;
			throw new dorado.Exception("'dorado.validator.AjaxValidator' is disabled because the 'dorado.widget.AjaxAction' is not available.");
		}
		$invokeSuper.call(this, arguments);
	},
	
	doValidate : function(data, arg, callback) {
		var eventArg = {
			data: data,
			property: arg.property,
			entity: arg.entity,
			parameter: data
		};
		this.fireEvent("beforeExecute", this, eventArg);
		
		var ajaxAction = this._ajaxAction;
		if (!ajaxAction) {
			this._ajaxAction = ajaxAction = new dorado.widget.AjaxAction();
		}
		
		var config = {
			modal: false,
			async: this._async
		};
		if (this._executingMessage) config.executingMessage = this._executingMessage;
		if (this._service) config.service = this._service;
		config.parameter = eventArg.parameter;
		
		ajaxAction.set(config);
		var retval = ajaxAction.execute(this._async ? callback : null);
		if (retval && !this._async) {
			return ajaxAction.get("returnValue");
		}
	}
});

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @class 用户自定义数据校验器。
 * @shortTypeName Custom
 * @extends dorado.validator.Validator
 */
dorado.validator.CustomValidator = $extend(dorado.validator.Validator, /** @scope dorado.validator.CustomValidator.prototype */
{
	className : "dorado.validator.CustomValidator",

	EVENTS : /** @scope dorado.validator.CustomValidator.prototype */
	{

		/**
		 * 当校验器执行数据校验时触发的事件。
		 * @param {Object} self 事件的发起者，即本校验器对象。
		 * @param {Object} arg 事件参数。
		 * @param {Object} arg.data 要校验的数据。
		 * @param {String} arg.property 用户当前编辑的属性名。
		 * @param {dorado.Entity} arg.entity 用户当前编辑的数据实体。
		 * @param {String|Object|[String]|[Object]} #arg.result 验证结果。
		 * 不返回任何验证结果表示通过验证，但返回验证结果并不一定表示未通过验证。
		 * <p>
		 * 标准验证结果应该是由0到多个验证消息构成的数组。每一个验证结果是一个JSON对象，该JSON对象包含以下属性：
		 * <ul>
		 * <li>state	-	{String} 信息级别。取值范围包括：info、ok、warn、error。默认值为error。</li>
		 * <li>text	-	{String} 信息内容。</li>
		 * </ul>
		 * </p>
		 * <p>
		 * 不过在实际的使用过程中可以根据需要以更加简洁的方式来定义验证结果。<br>
		 * 例如您只想返回一条单一的信息，那么就可以直接返回一个JSON对象而不必将其封装到数组中。<br>
		 * 甚至可以直接返回一个字符串，此时系统认为您希望返回一条单一的信息，该字符串将被视作信息的文本，
		 * 信息的级别则由{@link dorado.validator.Validator#defaultResultState}决定。
		 * </p>
		 * <p>
		 * 除了使用arg.result参数，您还可以以直接抛出异常的方式向外界返回验证信息，该异常的消息被视作验证信息的文本，
		 * 信息的级别则由{@link dorado.validator.Validator#defaultResultState}决定。
		 * </p>
		 * @return {boolean} 是否要继续后续事件的触发操作，不提供返回值时系统将按照返回值为true进行处理。
		 * @event
		 *
		 * @example
		 * // 以抛出异常的方式返回验证结果
		 * new dorado.validator.CustomValidator({
		 * 	onValidate: function(self, arg) {
		 * 		if ((arg.data + '') === '') {
		 * 			throw new dorado.Exception("内容不能为空.");
		 * 		}
		 * 	}
		 * });
		 *
		 * @example
		 * // 以arg.result的方式返回验证结果
		 * new dorado.validator.CustomValidator({
		 * 	onValidate: function(self, arg) {
		 * 		if ((arg.data + '').length < 10) {
		 * 			arg.result = {
		 * 				text: "长度不能小于10.",
		 * 				state: "warn"
		 * 			};
		 * 		}
		 * 	}
		 * });
		 */
		onValidate : {}
	},

	doValidate : function(data, arg) {
		var result;
		try {
			var eventArg = {
				data : data,
				property: arg ? arg.property : null,
				entity: arg ? arg.entity : null
			};
			this.fireEvent("onValidate", this, eventArg);
			result = eventArg.result;
		} catch(e) {
			dorado.Exception.removeException(e);
			result = dorado.Exception.getExceptionMessage(e);
		}
		return result;
	}
});

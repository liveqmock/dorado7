dorado.Entity.prototype._validateProperty = function(dataType, propertyDef,
		propertyInfo, value, preformAsyncValidator) {
	var messages = [], property = propertyDef._name, validating, propertyDataType = propertyDef
			.get("dataType");
	if (propertyDef._required && !dataType._validatorsDisabled) {
		var blank = false;
		if (typeof value == "string") value = jQuery.trim(value);
		if (value === undefined || value === null || value === "") {
			if (propertyDataType
					&& propertyDataType._code == dorado.DataType.STRING) {
				blank = !value;
			} else {
				blank = true;
			}
		}
		if (blank) {
			messages.push({
				state : "error",
				text : $resource("dorado.data.ErrorContentRequired")
			});
		}
	}
	if (propertyDef._mapping && value !== undefined && value !== null
			&& value !== "") {
		var mappedValue = propertyDef.getMappedValue(value);
		if (propertyDef._acceptUnknownMapKey && mappedValue === undefined) {
			messages.push({
				state : "error",
				text : $resource("dorado.data.UnknownMapKey", value)
			});
		}
	}
	if (propertyDef._validators && !dataType._validatorsDisabled) {
		var entity = this, currentValue = value, validateArg = {
			property : property,
			entity : entity
		}, oldData = this._oldData;
		propertyInfo.validating = propertyInfo.validating || 0;
		for ( var i = 0; i < propertyDef._validators.length; i++) {
			var validator = propertyDef._validators[i];
			if (!validator._revalidateOldValue && oldData
					&& value == oldData[property]) {
				continue;
			}
			if (validator instanceof dorado.validator.RemoteValidator
					&& validator._async && preformAsyncValidator) {
				propertyInfo.validating++;
				validator.validate(value, validateArg, {
					callback : function(success, result) {
						if (propertyInfo.validating <= 0) {
							return;
						}
						propertyInfo.validating--;
						if (propertyInfo.validating <= 0) {
							propertyInfo.validating = 0;
							propertyInfo.validated = true;
						}
						if (success) {
							if (entity._data[property] != currentValue) {
								return;
							}
							entity.doSetMessages(property, result);
						}
						if (entity._data[property] == currentValue) {
							entity.sendMessage(
									dorado.Entity._MESSAGE_DATA_CHANGED, {
										entity : entity,
										property : property
									});
						}
					}
				});
			} else {
				var msgs = validator.validate(value, validateArg);
				if (msgs) {
					messages = messages.concat(msgs);
					var state = dorado.Toolkits.getTopMessageState(msgs);
					var acceptState = dataType.get("acceptValidationState");
					if (STATE_CODE[state || "info"] > STATE_CODE[acceptState
							|| "ok"]) {
						asyncValidateActions = [];
						break;
					}
				}
			}
		}
	}
	this.doSetMessages(property, messages);
	if (!propertyInfo.validating) {
		propertyInfo.validated = true;
	}
	return messages;
}
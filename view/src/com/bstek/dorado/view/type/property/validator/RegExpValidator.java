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

package com.bstek.dorado.view.type.property.validator;

import java.util.regex.Pattern;

import org.apache.commons.lang.StringUtils;

import com.bstek.dorado.annotation.ClientObject;
import com.bstek.dorado.annotation.XmlNode;
import com.bstek.dorado.core.resource.ResourceManager;
import com.bstek.dorado.core.resource.ResourceManagerUtils;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2010-7-27
 */
@XmlNode(fixedProperties = "type=regExp")
@ClientObject(prototype = "dorado.validator.RegExpValidator",
		shortTypeName = "RegExp")
public class RegExpValidator extends BaseValidator {
	private static final ResourceManager resourceManager = ResourceManagerUtils
			.get(RegExpValidator.class);

	private String whiteRegExp;
	private String blackRegExp;
	private RegExpValidatorMode validateMode = RegExpValidatorMode.whiteBlack;

	public String getWhiteRegExp() {
		return whiteRegExp;
	}

	public void setWhiteRegExp(String whiteRegExp) {
		this.whiteRegExp = whiteRegExp;
	}

	public String getBlackRegExp() {
		return blackRegExp;
	}

	public void setBlackRegExp(String blackRegExp) {
		this.blackRegExp = blackRegExp;
	}

	public RegExpValidatorMode getValidateMode() {
		return validateMode;
	}

	public void setValidateMode(RegExpValidatorMode validateMode) {
		this.validateMode = validateMode;
	}

	protected boolean match(String regExp, String s) {
		return Pattern.matches(regExp, s);
	}

	@Override
	protected Object doValidate(Object value) throws Exception {
		if (!(value instanceof String)) {
			return null;
		}

		String s = (String) value;
		if (StringUtils.isEmpty(s)) {
			return null;
		}

		boolean valid = false;
		if (validateMode == RegExpValidatorMode.whiteBlack) {
			valid = StringUtils.isNotEmpty(blackRegExp)
					&& match(whiteRegExp, s)
					|| StringUtils.isNotEmpty(whiteRegExp)
					&& !match(whiteRegExp, s);
		} else {
			valid = StringUtils.isNotEmpty(whiteRegExp)
					&& !match(whiteRegExp, s)
					|| StringUtils.isNotEmpty(blackRegExp)
					&& match(whiteRegExp, s);
		}
		if (valid) {
			return resourceManager.getString("dorado.data/errorBadFormat", s);
		}
		return null;
	}

}

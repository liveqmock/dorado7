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

import com.bstek.dorado.annotation.ClientObject;
import com.bstek.dorado.annotation.ClientProperty;
import com.bstek.dorado.annotation.XmlNode;
import com.bstek.dorado.core.resource.ResourceManager;
import com.bstek.dorado.core.resource.ResourceManagerUtils;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2010-7-27
 */
@XmlNode(fixedProperties = "type=length")
@ClientObject(prototype = "dorado.validator.LengthValidator", shortTypeName = "Length")
public class LengthValidator extends BaseValidator {
	private static final ResourceManager resourceManager = ResourceManagerUtils
			.get(LengthValidator.class);

	private int minLength = -1;
	private int maxLength = -1;

	@ClientProperty(escapeValue = "-1")
	public int getMinLength() {
		return minLength;
	}

	public void setMinLength(int minLength) {
		this.minLength = minLength;
	}

	@ClientProperty(escapeValue = "-1")
	public int getMaxLength() {
		return maxLength;
	}

	public void setMaxLength(int maxLength) {
		this.maxLength = maxLength;
	}

	@Override
	protected Object doValidate(Object value) throws Exception {
		if (value instanceof String) {
			int len = ((String) value).length();
			if (minLength > 0 && len < minLength) {
				return resourceManager.getString(
						"dorado.data/errorContentTooShort", minLength);
			}
			if (maxLength > 0 && len > maxLength) {
				return resourceManager.getString(
						"dorado.data/errorContentTooLong", maxLength);
			}
		}
		return null;
	}
}

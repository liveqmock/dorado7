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
import com.bstek.dorado.annotation.XmlNode;
import com.bstek.dorado.core.resource.ResourceManager;
import com.bstek.dorado.core.resource.ResourceManagerUtils;

/**
 * @author William Jiang (mailto:william.jiang@bstek.com)
 * @since 2013-1-8
 */
@XmlNode(fixedProperties = "type=charLength")
@ClientObject(prototype = "dorado.validator.CharLengthValidator",
		shortTypeName = "CharLength")
public class CharLengthValidator extends BaseValidator {
	private static final ResourceManager resourceManager = ResourceManagerUtils
			.get(CharLengthValidator.class);

	private int minLength = -1;
	private int maxLength = -1;

	public int getMinLength() {
		return minLength;
	}

	public void setMinLength(int minLength) {
		this.minLength = minLength;
	}

	public int getMaxLength() {
		return maxLength;
	}

	public void setMaxLength(int maxLength) {
		this.maxLength = maxLength;
	}

	@Override
	protected Object doValidate(Object value) throws Exception {
		if (value instanceof String) {
			int len = ((String) value).getBytes().length;
			if (minLength > 0 && len < minLength) {
				return resourceManager.getString("data/errorContentTooShort",
						minLength);
			}
			if (maxLength > 0 && len > maxLength) {
				return resourceManager.getString("data/errorContentTooLong",
						maxLength);
			}
		}
		return null;
	}
}

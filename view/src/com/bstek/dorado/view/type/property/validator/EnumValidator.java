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

import java.util.List;

import com.bstek.dorado.annotation.ClientObject;
import com.bstek.dorado.annotation.ClientProperty;
import com.bstek.dorado.annotation.IdeProperty;
import com.bstek.dorado.annotation.XmlNode;
import com.bstek.dorado.annotation.XmlProperty;
import com.bstek.dorado.core.resource.ResourceManager;
import com.bstek.dorado.core.resource.ResourceManagerUtils;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2010-7-27
 */
@XmlNode(fixedProperties = "type=enum")
@ClientObject(prototype = "dorado.validator.EnumValidator",
		shortTypeName = "Enum")
public class EnumValidator extends BaseValidator {
	private static final ResourceManager resourceManager = ResourceManagerUtils
			.get(EnumValidator.class);

	private List<?> enumValues;

	@XmlProperty
	@ClientProperty
	@IdeProperty(editor = "collection[value]", highlight = 1)
	public List<?> getEnumValues() {
		return enumValues;
	}

	public void setEnumValues(List<?> enumValues) {
		this.enumValues = enumValues;
	}

	@Override
	protected Object doValidate(Object value) throws Exception {
		if (enumValues == null || enumValues.isEmpty() || value == null) {
			return null;
		}
		if (enumValues.indexOf(value) < 0) {
			return resourceManager.getString("dorado.data/errorValueOutOfEnumRange");
		}
		return null;
	}
}

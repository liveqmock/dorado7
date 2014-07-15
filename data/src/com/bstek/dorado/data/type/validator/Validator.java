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

package com.bstek.dorado.data.type.validator;

import java.util.List;

import com.bstek.dorado.annotation.XmlNode;
import com.bstek.dorado.annotation.XmlProperty;
import com.bstek.dorado.common.Namable;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2010-7-12
 */
@XmlNode(nodeName = "Validator",
	icon = "/com/bstek/dorado/view/type/property/validator/Validator.png",
	properties = @XmlProperty(propertyName = "name",
		parser = "spring:dorado.staticPropertyParser",
		attributeOnly = true))
public interface Validator extends Namable {
	List<ValidationMessage> validate(Object value) throws Exception;
}

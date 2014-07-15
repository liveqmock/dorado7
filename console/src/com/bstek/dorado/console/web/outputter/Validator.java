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

package com.bstek.dorado.console.web.outputter;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Iterator;
import java.util.List;

import com.bstek.dorado.data.type.validator.ValidatorTypeRegisterInfo;
import com.bstek.dorado.data.type.validator.ValidatorTypeRegistry;
import com.bstek.dorado.web.DoradoContext;
/**
 * 
 *
 * @author Alex Tong(mailto:alex.tong@bstek.com)
 * @since  2013-3-4
 */
public class Validator extends Category {
	private final static String CATEGORY_NAME = "Validator";

	public Validator() {
		super(CATEGORY_NAME);
		// TODO Auto-generated constructor stub
	}

	@Override
	public List<Node> initNodes() {
		ValidatorTypeRegistry registry = (ValidatorTypeRegistry) DoradoContext
				.getAttachedWebApplicationContext().getBean(
						"dorado.validatorTypeRegistry");
		Collection<ValidatorTypeRegisterInfo> registerInfos = registry
				.getTypes();
		Iterator<ValidatorTypeRegisterInfo> iterator = registerInfos.iterator();
		List<Node> nodes = new ArrayList<Node>();
		Node node;
		while (iterator.hasNext()) {
			ValidatorTypeRegisterInfo registerInfo = (ValidatorTypeRegisterInfo) iterator
					.next();
			node = new Node();
			node.setName(registerInfo.getType());
			node.setBeanName(registerInfo.getClassType().getName());
			node.initProperties();
			nodes.add(node);
		}
		return nodes;
	}
}
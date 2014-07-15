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
import java.util.Collections;
import java.util.Iterator;
import java.util.List;

import com.bstek.dorado.view.registry.ComponentTypeRegisterInfo;
import com.bstek.dorado.view.registry.ComponentTypeRegistry;
import com.bstek.dorado.web.DoradoContext;
/**
 * Component
 *
 * @author Alex Tong(mailto:alex.tong@bstek.com)
 * @since  2013-3-4
 */
public class Component extends Category {
	private final static String CATEGORY_NAME = "Component";

	public Component() {
		super(CATEGORY_NAME);
	}

	@Override
	public List<Node> initNodes() {
		ComponentTypeRegistry registry = (ComponentTypeRegistry) DoradoContext
				.getAttachedWebApplicationContext().getBean(
						"dorado.componentTypeRegistry");
		Collection<ComponentTypeRegisterInfo> registerInfos = registry
				.getRegisterInfos();
		Iterator<ComponentTypeRegisterInfo> iterator = registerInfos.iterator();
		List<Node> nodes = new ArrayList<Node>();
		Node node;
		while (iterator.hasNext()) {
			ComponentTypeRegisterInfo registerInfo = (ComponentTypeRegisterInfo) iterator
					.next();
			node = new Node();
			node.setName(registerInfo.getName());
			node.setBeanName(registerInfo.getClassType().getName());
			node.initProperties();
			nodes.add(node);
		}
		Collections.sort(nodes, new ComparatorNode());

		return nodes;
	}

}

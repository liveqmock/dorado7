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
import java.util.List;

import com.bstek.dorado.view.DefaultView;
/**
 * 
 *
 * @author Alex Tong(mailto:alex.tong@bstek.com)
 * @since  2013-3-4
 */
public class Other extends Category {

	private final static String CATEGORY_NAME = "Other";

	public Other() {
		super(CATEGORY_NAME);
		// TODO Auto-generated constructor stub
	}

	@Override
	public List<Node> initNodes() {
		List<Node> list = new ArrayList<Node>();

		Node node = new Node();
		node.setName("DefaultView");
		node.setBeanName(DefaultView.class.getName());
		node.initProperties();
		list.add(node);
       
		return list;
	}

}

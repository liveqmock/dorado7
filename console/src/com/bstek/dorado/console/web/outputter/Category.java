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

import java.text.Collator;
import java.util.Comparator;
import java.util.List;
/**
 * @author Alex Tong(mailto:alex.tong@bstek.com)
 * @since  2013-3-4
 */
public abstract class Category {
	private String name;
	private List<Node> nodes;

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public Category(String name) {
		this.name = name;
		nodes = initNodes();
	}

	public List<Node> getNodes() {

		return nodes;
	}

	public void setNodes(List<Node> nodes) {
		this.nodes = nodes;
	}

	public abstract List<Node> initNodes();
}

class ComparatorNode implements Comparator<Node> {
	@SuppressWarnings({ "unchecked", "rawtypes" })
	public int compare(Node o1, Node o2) {
		Comparator cmp = Collator.getInstance(java.util.Locale.ENGLISH);
		return cmp.compare(o1.getName(), o2.getName());
	}
}

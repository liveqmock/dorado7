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

package com.bstek.dorado.view.widget.tree;

import java.util.ArrayList;
import java.util.List;

import com.bstek.dorado.annotation.ClientObject;
import com.bstek.dorado.annotation.ClientProperty;
import com.bstek.dorado.annotation.IdeProperty;
import com.bstek.dorado.annotation.XmlSubNode;
import com.bstek.dorado.view.annotation.Widget;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2009-9-30
 */
@Widget(name = "Tree", category = "Collection", dependsPackage = "tree")
@ClientObject(prototype = "dorado.widget.Tree", shortTypeName = "Tree")
public class Tree extends AbstractTree implements NodeHolder {
	private List<BaseNode> nodes;

	@XmlSubNode
	@ClientProperty
	@IdeProperty(highlight = 1)
	public List<BaseNode> getNodes() {
		if (nodes == null)
			nodes = new ArrayList<BaseNode>();
		return nodes;
	}

	public void addNode(BaseNode node) {
		getNodes().add(node);
	}
}

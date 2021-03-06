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

package com.bstek.dorado.view.widget.treegrid;

import java.util.ArrayList;
import java.util.List;

import com.bstek.dorado.annotation.ClientObject;
import com.bstek.dorado.annotation.ClientProperty;
import com.bstek.dorado.annotation.IdeProperty;
import com.bstek.dorado.annotation.XmlNodeWrapper;
import com.bstek.dorado.annotation.XmlSubNode;
import com.bstek.dorado.view.annotation.Widget;
import com.bstek.dorado.view.widget.tree.BaseNode;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2010-8-10
 */
@Widget(name = "TreeGrid", category = "Collection", dependsPackage = "tree-grid")
@ClientObject(prototype = "dorado.widget.TreeGrid", shortTypeName = "TreeGrid")
public class TreeGrid extends AbstractTreeGrid {
	private List<BaseNode> nodes;

	@XmlSubNode(wrapper = @XmlNodeWrapper(nodeName = "Nodes", icon = "/com/bstek/dorado/view/widget/treegrid/Nodes.png"))
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

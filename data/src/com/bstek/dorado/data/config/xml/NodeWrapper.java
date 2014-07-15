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

package com.bstek.dorado.data.config.xml;

import org.w3c.dom.Node;

import com.bstek.dorado.core.io.Resource;

/**
 * 节点的包装器。
 * <p>
 * 用于在预解析的过程中将全局节点的信息放入
 * {@link com.bstek.dorado.data.config.xml.DataParseContext}
 * 的configuredDataTypes和configuredDataProviders属性中。
 * </p>
 * 
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Feb 21, 2007
 */
public class NodeWrapper {
	private Node node;
	private Resource resource;

	/**
	 * @param node
	 *            节点。
	 * @param resource
	 *            节点所属的文档资源。
	 */
	public NodeWrapper(Node node, Resource resource) {
		this.node = node;
		this.resource = resource;
	}

	/**
	 * 返回节点。
	 */
	public Node getNode() {
		return node;
	}

	/**
	 * 返回节点所属的文档资源。
	 */
	public Resource getResource() {
		return resource;
	}
}

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

package com.bstek.dorado.common.event;

import org.apache.commons.lang.StringUtils;
import org.w3c.dom.CharacterData;
import org.w3c.dom.Comment;
import org.w3c.dom.Element;
import org.w3c.dom.EntityReference;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import com.bstek.dorado.config.ParseContext;
import com.bstek.dorado.config.definition.CreationContext;
import com.bstek.dorado.config.definition.DefinitionUtils;
import com.bstek.dorado.config.definition.Operation;
import com.bstek.dorado.config.xml.ConfigurableDispatchableXmlParser;
import com.bstek.dorado.config.xml.XmlConstants;
import com.bstek.dorado.core.el.Expression;
import com.bstek.dorado.util.Assert;

/**
 * 客户端事件节点的解析器。
 * 
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Apr 11, 2008
 */
public class ClientEventParser extends ConfigurableDispatchableXmlParser {

	public static class AddClientEventOperation implements Operation {
		private ClientEventDefinition event;

		public AddClientEventOperation(ClientEventDefinition event) {
			this.event = event;
		}

		public void execute(Object object, CreationContext context)
				throws Exception {
			if (object instanceof ClientEventSupported) {
				ClientEventSupported owner = (ClientEventSupported) object;
				ClientEvent clientEvent = (ClientEvent) DefinitionUtils
						.getRealValue(event, context);
				owner.addClientEventListener(event.getName(), clientEvent);
			}
		}
	}

	protected String getTextValue(Element element) {
		StringBuffer value = new StringBuffer(32);
		NodeList nl = element.getChildNodes();
		int len = nl.getLength();
		for (int i = 0; i < len; ++i) {
			Node item = nl.item(i);
			if ((((!(item instanceof CharacterData)) || (item instanceof Comment)))
					&& (!(item instanceof EntityReference))) {
				continue;
			}
			value.append(item.getNodeValue());
		}
		return value.toString();
	}

	@Override
	protected Object doParse(Node node, ParseContext context) throws Exception {
		ClientEventDefinition event = new ClientEventDefinition();
		Element element = (Element) node;
		String name = element.getAttribute(XmlConstants.ATTRIBUTE_NAME);
		Assert.notEmpty(name);
		event.setName(name);

		String signature = element.getAttribute("signature");
		event.setSignature(signature);

		String script = getTextValue(element);
		if (StringUtils.isNotEmpty(script)) {
			Expression expression = getExpressionHandler().compile(script);
			if (expression != null) {
				event.setScript(expression);
			} else {
				event.setScript(script);
			}
		}
		return new AddClientEventOperation(event);
	}
}

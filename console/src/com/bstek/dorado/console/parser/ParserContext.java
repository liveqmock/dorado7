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

package com.bstek.dorado.console.parser;

import java.util.HashSet;
import java.util.Iterator;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;

import com.bstek.dorado.config.Parser;
import com.bstek.dorado.config.xml.DispatchableXmlParser;
import com.bstek.dorado.config.xml.XmlParser;
import com.bstek.dorado.config.xml.XmlParserHelper;
import com.bstek.dorado.core.Context;
/**
 * 
 *
 * @author Alex Tong(mailto:alex.tong@bstek.com)
 * @since  2013-3-4
 */
class ParserContext {
	private Context doradoContext;
	private Set<Parser> doneParsers;

	public ParserContext() {
		doradoContext = Context.getCurrent();
		doneParsers = new HashSet<Parser>();
	}

	private XmlParserHelper xmlParserHelper;
	public XmlParserHelper getXmlParserHelper() throws Exception {
		if (xmlParserHelper == null) {
			xmlParserHelper = (XmlParserHelper)doradoContext.getServiceBean("xmlParserHelper");
		}
		return xmlParserHelper;
	}
	
	public ParserContext createSubContext() {
		ParserContext subCtx = new ParserContext();
		subCtx.doneParsers.addAll(this.doneParsers);
		return subCtx;
	}

	public Context getDoradoContext() {
		return doradoContext;
	}

	public void children(Node parentNode) throws Exception {
		if (parentNode.parserObject == null)
			return;

		Parser parentParser = parentNode.parserObject;
		if (parentParser instanceof DispatchableXmlParser) {
			DispatchableXmlParser dispatchParser = (DispatchableXmlParser) parentParser;
			Map<String, XmlParser> parsers = dispatchParser.getSubParsers();
			if (parsers.isEmpty())
				return;

			Iterator<Entry<String, XmlParser>> entryItr = parsers.entrySet()
					.iterator();
			while (entryItr.hasNext()) {
				Entry<String, XmlParser> entry = entryItr.next();
				String name = entry.getKey();
				XmlParser parser = entry.getValue();

				Node node = new Node(parser, name);
				node.initProperties();
				parentNode.getChildren().add(node);

				if (this.accept(parser)) {
					this.addDoneParser(name, parser);
					this.createSubContext().children(node);
				}
			}
		}
	}

	public boolean accept(Parser parser) {
		if (doneParsers.contains(parser)) {
			return false;
		}
		return true;
	}

	public	void addDoneParser(String tag, Parser parser) {
		doneParsers.add(parser);
	}
}

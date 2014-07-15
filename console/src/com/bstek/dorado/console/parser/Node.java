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

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;

import com.bstek.dorado.config.Parser;
import com.bstek.dorado.config.xml.CollectionToPropertyParser;
import com.bstek.dorado.config.xml.DispatchableXmlParser;
import com.bstek.dorado.config.xml.ObjectParser;
import com.bstek.dorado.config.xml.XmlParser;
import com.bstek.dorado.config.xml.SubNodeToPropertyParser;
/**
 * 
 *
 * @author Alex Tong(mailto:alex.tong@bstek.com)
 * @since  2013-3-4
 */
public class Node {
	private String name;
	private String component;
	Parser parserObject;
	private List<KeyValue> properties = new ArrayList<KeyValue>();
	private List<Node> children = new ArrayList<Node>();

	public Node(){}
	public Node(String name){
		this(null, name);
	}
	public Node(Parser parserObject, String name) {
		this.parserObject = parserObject;
		this.name = name;
	}
	
	public String getName() {
		return name;
	}

	public String getParser() {
		return (parserObject == null)? null : parserObject.getClass().getName();
	}
	
	public String getComponent() {
		return component;
	}
	public void setComponent(String component) {
		this.component = component;
	}
	
	public List<KeyValue> getProperties() {
		return properties;
	}
	public void setProperties(List<KeyValue> properties) {
		this.properties = properties;
	}
	public void addProperty(String key, String value) {
		KeyValue kv = new KeyValue(key, value);
		properties.add(kv);
	}

	void initProperties() throws Exception {
		if (this.parserObject == null) {
			return;
		}

		Parser parser = this.parserObject;
		if (parser instanceof CollectionToPropertyParser) {
			CollectionToPropertyParser collectionParser = (CollectionToPropertyParser) parser;
			Class<?> elementType = collectionParser.getElementType();
			if (elementType != null) {
				this.setComponent(elementType.getName());
			}
		} else if (parser instanceof SubNodeToPropertyParser) {
			SubNodeToPropertyParser subParser = (SubNodeToPropertyParser) parser;
			Class<?> elementType = subParser.getElementType();
			if (elementType != null) {
				this.setComponent(elementType.getName());
			}
		} else if (parser instanceof ObjectParser) {
			ObjectParser objectParser = (ObjectParser) parser;
			this.setComponent(objectParser.getImpl());
		}
		
		if (parser instanceof DispatchableXmlParser) {
			DispatchableXmlParser dispatchParser = (DispatchableXmlParser) parser;
			Map<String, XmlParser> parsers = dispatchParser.getPropertyParsers();
			if (parsers.isEmpty())
				return;

			Iterator<Entry<String, XmlParser>> entryItr = parsers.entrySet()
					.iterator();
			while (entryItr.hasNext()) {
				Entry<String, XmlParser> entry = entryItr.next();
				String key = entry.getKey();
				XmlParser p = entry.getValue();
				this.addProperty(key, p.getClass().getName());
			}
		}
	}
	
	public List<Node> getChildren() {
		return children;
	}
	public void setChildren(List<Node> children) {
		this.children = children;
	}
	
	public static class KeyValue {
		private String key;
		private String value;
		
		public KeyValue() {}
				
		public KeyValue(String key, String value) {
			this.key = key;
			this.value = value;
		}

		public String getKey() {
			return key;
		}
		public void setKey(String key) {
			this.key = key;
		}

		public String getValue() {
			return value;
		}
		public void setValue(String value) {
			this.value = value;
		}
	}
}

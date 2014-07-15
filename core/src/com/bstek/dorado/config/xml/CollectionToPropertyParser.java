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

package com.bstek.dorado.config.xml;

import java.util.ArrayList;
import java.util.Collection;
import java.util.HashSet;
import java.util.List;

import org.apache.commons.beanutils.PropertyUtils;
import org.w3c.dom.Element;
import org.w3c.dom.Node;

import com.bstek.dorado.config.ParseContext;
import com.bstek.dorado.config.definition.CreationContext;
import com.bstek.dorado.config.definition.Definition;
import com.bstek.dorado.config.definition.DefinitionInitOperation;
import com.bstek.dorado.config.definition.DefinitionSupportedList;
import com.bstek.dorado.config.definition.Operation;
import com.bstek.dorado.util.Assert;
import com.bstek.dorado.util.clazz.ClassUtils;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2009-12-27
 */
public class CollectionToPropertyParser extends
		ConfigurableDispatchableXmlParser {
	private String property;
	private Class<?> elementType;

	/**
	 * @return the property
	 */
	public String getProperty() {
		return property;
	}

	/**
	 * @param property
	 *            the property to set
	 */
	public void setProperty(String property) {
		this.property = property;
	}

	public void setElementType(Class<?> elementType) {
		this.elementType = elementType;
	}

	public void setElementType(String elementType)
			throws ClassNotFoundException, LinkageError {
		this.elementType = ClassUtils.forName(elementType);
	}

	public Class<?> getElementType() {
		return elementType;
	}

	@Override
	protected Object doParse(Node node, ParseContext context) throws Exception {
		List<?> list = dispatchChildElements((Element) node, context);
		return (list != null && !list.isEmpty()) ? new AddElementsOperation(
				property, list) : null;
	}
}

class AddElementsOperation implements DefinitionInitOperation {
	private String property;
	private List<?> elements;

	public AddElementsOperation(String property, List<?> elements) {
		Assert.notEmpty(property);
		this.property = property;
		this.elements = elements;
	}

	@SuppressWarnings({ "unchecked", "rawtypes" })
	public void execute(Object object, CreationContext context)
			throws Exception {
		Collection collection = null;
		boolean useNativeProperty = false, isDefinition = false, shouldSetCollection = false;
		if (object instanceof Definition) {
			isDefinition = true;
			try {
				useNativeProperty = Collection.class
						.isAssignableFrom(PropertyUtils.getPropertyType(object,
								property));
			} catch (Exception e) {
				// do nothing
			}

			if (!useNativeProperty) {
				collection = (Collection) ((Definition) object)
						.getProperty(property);
				if (collection == null) {
					collection = new DefinitionSupportedList();
					shouldSetCollection = true;
				}
			}
		} else {
			useNativeProperty = true;
		}

		if (useNativeProperty) {
			collection = (Collection) PropertyUtils.getSimpleProperty(object,
					property);
			if (collection == null) {
				if (List.class.isAssignableFrom(PropertyUtils.getPropertyType(
						object, property))) {
					collection = new ArrayList();
				} else {
					collection = new HashSet();
				}
				shouldSetCollection = true;
			}
		}

		if (collection != null) {
			if (isDefinition) {
				for (Object element : elements) {
					if (element instanceof Operation) {
						if (element instanceof DefinitionInitOperation) {
							((DefinitionInitOperation) element).execute(object,
									context);
						} else {
							((Definition) object)
									.addInitOperation((Operation) element);
						}
					} else {
						collection.add(element);
					}
				}
			} else {
				collection.addAll(elements);
			}

			if (shouldSetCollection && !collection.isEmpty()) {
				if (useNativeProperty) {
					PropertyUtils.setSimpleProperty(object, property,
							collection);
				} else {
					((Definition) object).setProperty(property, collection);
				}
			}
		}
	}
}

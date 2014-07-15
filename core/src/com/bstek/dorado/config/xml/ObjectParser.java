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

import java.util.List;
import java.util.Map;

import org.apache.commons.lang.StringUtils;
import org.w3c.dom.Element;
import org.w3c.dom.Node;

import com.bstek.dorado.config.ParseContext;
import com.bstek.dorado.config.definition.Definition;
import com.bstek.dorado.config.definition.DefinitionInitOperation;
import com.bstek.dorado.config.definition.DefinitionReference;
import com.bstek.dorado.config.definition.ObjectDefinition;
import com.bstek.dorado.config.definition.Operation;
import com.bstek.dorado.core.bean.Scope;
import com.bstek.dorado.util.clazz.ClassUtils;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2009-12-30
 */
public class ObjectParser extends ConfigurableDispatchableXmlParser {
	private Class<? extends ObjectDefinition> definitionType = ObjectDefinition.class;
	private Class<?> annotationOwnerType;
	private String impl;
	private boolean scopable;
	private boolean inheritable;

	public Class<?> getAnnotationOwnerType() {
		return annotationOwnerType;
	}

	public void setAnnotationOwnerType(Class<?> annotationOwnerType) {
		this.annotationOwnerType = annotationOwnerType;
	}

	/**
	 * 设置要生成配置声明对象的实现类类型。例如:com.bstek.dorado.data.config.definition.
	 * DataTypeDefinition 。
	 * 
	 * @throws ClassNotFoundException
	 */
	@SuppressWarnings("unchecked")
	public void setDefinitionType(String definitionType)
			throws ClassNotFoundException {
		setDefinitionType(ClassUtils.forName(definitionType));
	}

	public void setDefinitionType(
			Class<? extends ObjectDefinition> definitionType)
			throws ClassNotFoundException {
		this.definitionType = definitionType;
	}

	public Class<? extends ObjectDefinition> getDefinitionType() {
		return definitionType;
	}

	/**
	 * 设置配置声明对象生成的最终对象的实例化方式。<br>
	 * 注意，有些配置声明对象并不支持复杂的实例化方式。如果将{@link #setSupportsExpressionImpl(boolean)}
	 * 属性设置为false， 那么此解析器将仅支持直接以Class名描述的实例化方式。
	 * 
	 * @see com.bstek.dorado.data.config.definition.ObjectDefinition#setImpl(String)
	 */
	public void setImpl(String impl) {
		this.impl = impl;
	}

	public String getImpl() {
		return impl;
	}

	/**
	 * 设置是否允许用户通过XML节点中的scope属性来指定最终对象的作用范围。
	 */
	public void setScopable(boolean scopable) {
		this.scopable = scopable;
	}

	public boolean isScopable() {
		return scopable;
	}

	/**
	 * 设置是否允许用户通过XML节点中的parent属性来指定配置声明对象的继承关系。
	 */
	public void setInheritable(boolean inheritable) {
		this.inheritable = inheritable;
	}

	public boolean isInheritable() {
		return inheritable;
	}

	/**
	 * 返回默认的最终对象作用范围。
	 */
	protected Scope getDefaultScope() {
		return null;
	}

	/**
	 * 将parent属性中的配置信息转换成一组指向具体配置声明对象的引用。<br>
	 * 例如根据parent="hr.Employee,hr.Manager"，可得到两个分别指向hr.Employee和hr.
	 * Manager这两个配置声明对象的引用。
	 * 
	 * @param parentNameText
	 *            parent属性的配置信息
	 * @param context
	 *            解析上下文
	 * @return 一组指向具体配置声明对象的引用。
	 * @throws Exception
	 */
	protected DefinitionReference<? extends Definition>[] getParentDefinitionReferences(
			String parentNameText, ParseContext context) throws Exception {
		return null;
	}

	/**
	 * 创建一个新的配置声明对象。
	 * 
	 * @param element
	 *            当前节点
	 * @param context
	 *            解析上下文
	 * @return 新的配置声明对象
	 * @throws Exception
	 */
	protected ObjectDefinition createDefinition(Element element,
			ParseContext context) throws Exception {
		return definitionType.newInstance();
	}

	/**
	 * 初始化一个配置声明对象。
	 * 
	 * @param definition
	 *            配置声明对象
	 * @param element
	 *            当前节点
	 * @param context
	 *            解析上下文
	 * @throws Exception
	 */
	protected void initDefinition(ObjectDefinition definition, Element element,
			ParseContext context) throws Exception {
		definition.setResource(context.getResource());

		String realImpl = StringUtils.defaultIfEmpty(
				element.getAttribute(XmlConstants.ATTRIBUTE_IMPL), impl);
		String parent = element.getAttribute(XmlConstants.ATTRIBUTE_PARENT);
		if (StringUtils.isNotEmpty(realImpl)) {
			/*
			 * if (StringUtils.isNotEmpty(parent)) { throw new
			 * XmlParseException("[" + XmlConstants.ATTRIBUTE_PARENT +
			 * "] attribute should be empty", element, context); }
			 */
			ClassUtils.forName(realImpl);
			definition.setImpl(realImpl);
		}

		if (StringUtils.isNotEmpty(parent)) {
			if (!inheritable) {
				throw new XmlParseException("[" + XmlConstants.ATTRIBUTE_PARENT
						+ "] attribute not supported.", element, context);
			}

			DefinitionReference<? extends Definition>[] parentReferences = getParentDefinitionReferences(
					parent, context);
			if (parentReferences != null) {
				definition.setParentReferences(parentReferences);
			}
		}

		if (scopable) {
			String scope = element.getAttribute(XmlConstants.ATTRIBUTE_SCOPE);
			if (StringUtils.isEmpty(scope)) {
				definition.setScope(getDefaultScope());
			} else {
				definition.setScope(Scope.valueOf(scope));
			}
		}

		Map<String, Object> properties = parseProperties(element, context);
		definition.setProperties(properties);

		List<?> results = dispatchChildElements(element, context);
		if (results != null) {
			for (Object result : results) {
				if (result instanceof DefinitionInitOperation) {
					((DefinitionInitOperation) result)
							.execute(definition, null);
				} else if (result instanceof Operation) {
					definition.addInitOperation((Operation) result);
				}
			}
		}
	}

	protected Object internalParse(Node node, ParseContext context)
			throws Exception {
		Element element = (Element) node;
		ObjectDefinition definition = createDefinition(element, context);
		initDefinition(definition, element, context);
		return definition;
	}

	@Override
	protected Object doParse(Node node, ParseContext context) throws Exception {
		return internalParse(node, context);
	}

}

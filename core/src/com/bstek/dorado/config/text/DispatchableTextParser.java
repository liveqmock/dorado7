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

package com.bstek.dorado.config.text;

import java.util.HashMap;
import java.util.Map;

import org.apache.commons.lang.StringUtils;

import com.bstek.dorado.util.Assert;

/**
 * 字符串分派解析器的抽象类。<br>
 * 所解析的字符串的基本形式：
 *
 * <pre>
 * 头信息 属性名1:属性值1; 属性名2:属性值2; 属性名3:属性值3
 * </pre>
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Feb 28, 2008
 */
public abstract class DispatchableTextParser implements TextParser {
	/**
	 * 返回的解析结果中用于保存头信息的特殊属性的属性名。
	 */
	public static final String HEADER_ATTRIBUTE = "$header";

	private static final int BEFORE_HEADER = 0;
	private static final int IN_HEADER = 1;
	private static final int AFTER_HEADER = 2;
	private static final int BEFORE_ATTRIBUTE_NAME = 3;
	private static final int IN_ATTRIBUTE_NAME = 4;
	private static final int AFTER_ATTRIBUTE_NAME = 5;
	private static final int BEFORE_ATTRIBUTE_VALUE = 6;

	/**
	 * 默认解析器的约束条件。<br>
	 * 该约束条件表示如果根据某约束条件无法找到匹配的解析器，那么就使用与WILDCARD相关的解析器。
	 */
	public static final String WILDCARD = "*";

	private Map<String, TextParser> attributeParsers = new HashMap<String, TextParser>();
	private Map<String, TextParser> subParsers = new HashMap<String, TextParser>();

	/**
	 * 返回要解析的字符串是否包含一个头信息。<br>
	 * 如果解析的字符串中包含头信息，那么在默认情况下头信息中的值将被处理为$header属性的值。
	 */
	public boolean supportsHeader() {
		return false;
	}

	/**
	 * 向当前解析器中注册一个属性解析器。
	 * @param constraint 要注册的属性解析器的约束条件。如果此参数的值为null，那么系统将使用{@link #WILDCARD}
	 *            作为内部使用的约束条件。
	 * @param parser 属性解析器
	 */
	public void registerAttributeParser(String constraint, TextParser parser) {
		Assert.notNull(parser, "[parser] is required");
		constraint = StringUtils.defaultString(constraint, WILDCARD);
		attributeParsers.put(constraint, parser);
	}

	/**
	 * 返回所有已注册的属性解析器。其中Map的键值是约束条件，值是属性解析器。
	 * @return 属性解析器的Map集合。
	 */
	public Map<String, TextParser> getAttributeParsers() {
		return attributeParsers;
	}

	/**
	 * 根据约束条件返回一个匹配的属性解析器。
	 * @param constraint 约束条件。
	 *            如果无法直接通过约束条件找到一个匹配的子解析器，那么此方法将尝试返回WILDCARD相关的子解析器。
	 */
	protected TextParser findAttributeParser(String constraint) {
		constraint = StringUtils.defaultString(constraint, WILDCARD);
		TextParser parser = attributeParsers.get(constraint);
		if (parser == null && !WILDCARD.equals(constraint)) {
			parser = attributeParsers.get(WILDCARD);
		}
		return parser;
	}

	/**
	 * 向当前解析器中注册一个子解析器。
	 * @param constraint 要注册的子解析器的约束条件。 如果此参数的值为null，那么系统将使用WILDCARD作为内部使用的约束条件。
	 * @param parser 子解析器
	 */
	public void registerSubParser(String constraint, TextParser parser) {
		Assert.notNull(parser, "[parser] is required");
		constraint = StringUtils.defaultString(constraint, WILDCARD);
		subParsers.put(constraint, parser);
	}

	/**
	 * 返回所有已注册的子解析器。 其中Map的键值是约束条件，值是子解析器。
	 * @return 子解析器的Map集合。
	 */
	public Map<String, TextParser> getSubParsers() {
		return subParsers;
	}

	/**
	 * 根据约束条件返回一个匹配的子解析器。
	 * @param constraint 约束条件。
	 *            如果无法直接通过约束条件找到一个匹配的子解析器，那么此方法将尝试返回WILDCARD相关的子解析器。\\
	 * @param context
	 * @return 匹配的子解析器。
	 * @throws Exception
	 */
	protected TextParser findSubParser(String constraint,
			TextParseContext context) throws Exception {
		constraint = StringUtils.defaultString(constraint, WILDCARD);
		TextParser parser = subParsers.get(constraint);
		if (parser == null && !WILDCARD.equals(constraint)) {
			parser = subParsers.get(WILDCARD);
		}
		return parser;
	}

	/**
	 * 判断某字符是否一个有效的属性名称字符。
	 */
	protected boolean isValidPropertyNameChar(char c) {
		return (c >= '0' && c <= '9' || c >= 'A' && c <= 'Z' || c >= 'a'
				&& c <= 'z' || c == '-' || c == '_' || c == '$');
	}

	/**
	 * 判断某字符是否一个应被忽略的字符。<br>
	 * 当解析属性值的内容时不会作此判断。
	 */
	protected boolean isIgnoredChar(char c) {
		return (c == ' ' || c == '\n' || c == '\r' || c == '\t');
	}

	/**
	 * 解析给定的字符串，并将解析到的所有属性及值保存到Map集合中返回。
	 */
	public Object parse(char[] charArray, TextParseContext context)
			throws Exception {
		return parseToAttributes(charArray, context);
	}

	/**
	 * 将文本解析成一个包含各个属性值的Map集合。其中Map的键位属性名，值为属性值。 如果文本包含头信息的话，那么头信息将被包存在
	 * {@link #HEADER_ATTRIBUTE}代表的特殊属性名中。
	 */
	protected Map<String, Object> parseToAttributes(char[] charArray,
			TextParseContext context) throws Exception {
		Map<String, Object> attributes = new HashMap<String, Object>();
		int status;

		if (supportsHeader()) {
			String header = parseHeader(charArray, context);
			if (header != null) attributes.put(HEADER_ATTRIBUTE, header);
		}

		status = BEFORE_ATTRIBUTE_NAME;
		StringBuffer nameStack = new StringBuffer();
		for (int currentIndex = context.getCurrentIndex(); currentIndex < charArray.length; currentIndex++) {
			char c = charArray[currentIndex];
			context.setCurrentIndex(currentIndex);

			switch (status) {
			case BEFORE_ATTRIBUTE_NAME:
				if (isValidPropertyNameChar(c)) {
					status = IN_ATTRIBUTE_NAME;
					nameStack.append(c);
				}
				else if (isIgnoredChar(c)) {
					continue;
				}
				else if (c == ':') {
					throw new TextParseException(charArray, context);
				}
				break;
			case IN_ATTRIBUTE_NAME:
				if (isValidPropertyNameChar(c)) {
					nameStack.append(c);
				}
				else if (isIgnoredChar(c)) {
					status = AFTER_ATTRIBUTE_NAME;
					continue;
				}
				else if (c == ':') {
					status = BEFORE_ATTRIBUTE_VALUE;
					continue;
				}
				else if (c == ';') {
					throw new TextParseException(charArray, context);
				}
				break;
			case AFTER_ATTRIBUTE_NAME:
				if (isValidPropertyNameChar(c)) {
					throw new TextParseException(charArray, context);
				}
				else if (isIgnoredChar(c)) {
					continue;
				}
				else if (c == ':') {
					status = BEFORE_ATTRIBUTE_VALUE;
					continue;
				}
				else if (c == ';') {
					throw new TextParseException(charArray, context);
				}
				break;
			case BEFORE_ATTRIBUTE_VALUE:
				if (nameStack.length() == 0) {
					throw new TextParseException(
							"Attribute name can not be empty.", charArray,
							context);
				}
				else {
					String name = nameStack.toString();
					char firstC = name.charAt(0);
					if (firstC >= '0' && firstC <= '9') {
						throw new TextParseException("Attribute name [" + name
								+ "] can not start with number.");
					}

					Object value = dispatchAttribute(name, charArray, context);
					attributes.put(name, value);

					currentIndex = context.getCurrentIndex();
					status = BEFORE_ATTRIBUTE_NAME;
					nameStack.setLength(0);
				}
				break;
			}
		}

		if (nameStack.length() > 0) {
			throw new TextParseException(charArray, context);
		}
		return attributes;
	}

	protected String parseHeader(char[] charArray, TextParseContext context)
			throws TextParseException {
		int status;
		status = BEFORE_HEADER;
		StringBuffer headerStack = new StringBuffer();
		int startIndex = context.getCurrentIndex();
		for (int currentIndex = startIndex; currentIndex < charArray.length
				&& status != AFTER_HEADER; currentIndex++) {
			char c = charArray[currentIndex];
			context.setCurrentIndex(currentIndex);

			switch (status) {
			case BEFORE_HEADER:
				if (isIgnoredChar(c)) {
					continue;
				}
				else if (c == ':' || c == ';') {
					throw new TextParseException(charArray, context);
				}
				else {
					headerStack.append(c);
					status = IN_HEADER;
				}
				break;
			case IN_HEADER:
				if (isIgnoredChar(c)) {
					status = AFTER_HEADER;
				}
				else if (c == ':' || c == ';') {
					headerStack.setLength(0);
					status = AFTER_HEADER;
				}
				else {
					headerStack.append(c);
				}
				break;
			}
		}

		if (status != AFTER_HEADER) {
			context.increaseCurrentIndex();
		}
		String header = null;
		if (headerStack.length() > 0) {
			header = headerStack.toString();
		}
		else {
			context.setCurrentIndex(startIndex);
		}
		return header;
	}

	/**
	 * 根据传入的约束条件将字符串中某属性的解析任务分发给匹配的子解析器。
	 * @param constraint 约束条件。
	 * @param charArray 要解析字符串。
	 * @param context 解析的上下文对象。
	 * @return 解析结果
	 * @throws Exception
	 */
	protected Object dispatchAttribute(String constraint, char[] charArray,
			TextParseContext context) throws Exception {
		TextParser parser = findAttributeParser(constraint);
		if (parser != null) {
			return parser.parse(charArray, context);
		}
		else {
			return null;
		}
	}

}

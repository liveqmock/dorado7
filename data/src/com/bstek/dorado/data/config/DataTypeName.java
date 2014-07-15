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

package com.bstek.dorado.data.config;

import java.util.ArrayList;
import java.util.List;

import com.bstek.dorado.data.config.xml.DataXmlConstants;

/**
 * 用于解析DataType的引用表达式的类。
 * 
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Mar 24, 2007
 */
public class DataTypeName {
	public static final char BRACKET_LEFT = '[';
	public static final char BRACKET_RIGHT = ']';
	public static final char SEPARATOR = ',';

	private String fullName;
	private String originDataType;
	private String dataType;
	private String[] subDataTypes;

	/**
	 * @param fullName
	 *            DataType的引用表达式。
	 */
	public DataTypeName(String fullName) {
		this.fullName = fullName;

		int bracketDeepth = 0;
		boolean topBracketClosed = false;
		List<String> subTypes = new ArrayList<String>();

		StringBuffer buffer = new StringBuffer();
		for (char c : fullName.toCharArray()) {
			if (c == ' ') {
				throwInvalidFormatException(fullName);
			} else if (c == BRACKET_LEFT) {
				if (bracketDeepth == 0) {
					originDataType = buffer.toString();
					if (buffer.length() > 0) {
						dataType = originDataType;
						buffer.setLength(0);
					} else {
						dataType = com.bstek.dorado.data.Constants.DEFAULT_COLLECTION_TYPE;
					}
				} else {
					buffer.append(c);
				}
				bracketDeepth++;
			} else if (c == BRACKET_RIGHT) {
				if (bracketDeepth == 0) {
					throwInvalidFormatException(fullName);
				} else if (bracketDeepth == 1) {
					if (buffer.length() > 0) {
						subTypes.add(buffer.toString());
						buffer.setLength(0);
						topBracketClosed = true;
					} else {
						throwInvalidFormatException(fullName);
					}

					if (subTypes.isEmpty()) {
						throwInvalidFormatException(fullName);
					}
				} else {
					buffer.append(c);
				}
				bracketDeepth--;
			} else if (c == SEPARATOR) {
				if (bracketDeepth == 0) {
					throwInvalidFormatException(fullName);
				} else if (bracketDeepth == 1) {
					if (buffer.length() > 0) {
						subTypes.add(buffer.toString());
						buffer.setLength(0);
					} else {
						throwInvalidFormatException(fullName);
					}
				} else {
					buffer.append(c);
				}
			} else {
				if (topBracketClosed) {
					throwInvalidFormatException(fullName);
				} else {
					buffer.append(c);
				}
			}
		}

		if (bracketDeepth != 0) {
			throwInvalidFormatException(fullName);
		}

		if (subTypes.isEmpty()) {
			if (buffer.length() > 0) {
				dataType = buffer.toString();
			} else {
				throwInvalidFormatException(fullName);
			}
		}

		subDataTypes = new String[subTypes.size()];
		subTypes.toArray(subDataTypes);
	}

	private void throwInvalidFormatException(String dataTypeName)
			throws IllegalArgumentException {
		throw new IllegalArgumentException("Invalid ["
				+ DataXmlConstants.DATA_TYPE + "] name [" + dataTypeName + "]!");
	}

	/**
	 * 返回被引用的主DataType。
	 */
	public String getDataType() {
		return dataType;
	}

	public String getOriginDataType() {
		return originDataType;
	}

	/**
	 * 返回是否存在下级DataType。
	 */
	public boolean hasSubDataType() {
		return (subDataTypes != null && subDataTypes.length > 0);
	}

	/**
	 * 返回下级DataType的数组。
	 */
	public String[] getSubDataTypes() {
		return subDataTypes;
	}

	/**
	 * 返回完整的DataType的引用表达式。
	 */
	public String getFullName() {
		return fullName;
	}

	@Override
	public String toString() {
		return getFullName();
	}
}

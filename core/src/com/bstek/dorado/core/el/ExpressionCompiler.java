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

package com.bstek.dorado.core.el;

import java.util.ArrayList;
import java.util.List;

import org.apache.commons.lang.StringUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;


public class ExpressionCompiler {
	private static final Log logger = LogFactory.getLog(ExpressionCompiler.class);
	
	private final static char ESCAPE_CHAR = '\\';
	private final static char SPECIAL_CHAR = '$';
	private final static char BRACKET_BEGIN = '{';
	private final static char BRACKET_END = '}';
	
	private ExpressionHandler handler;
	public ExpressionCompiler(ExpressionHandler handler) {
		super();
		this.handler = handler;
	}
	
	public List<Object> compileSections(String text) {
		if (StringUtils.isEmpty(text) || text.indexOf(SPECIAL_CHAR) < 0) {
			return null;
		}
		
		List<Object> sections = new ArrayList<Object>();
		String middleText = text;
		while (middleText != null) {
			MiddleExpression me = this.middleCompile(middleText);
			if (me == null) {
				sections.add(middleText);
				middleText = null;
			} else {
				sections.add(me.expression);
				middleText = me.nextText;
			}
		}
		
		return sections;
	}
	
	private MiddleExpression middleCompile(String text) {
		MiddleExpression me = null;
		if (text.startsWith("$${")) {
			me = nextMiddleExpression(text.substring(3));
		} else if (text.startsWith("${")){
			me = nextMiddleExpression(text.substring(2));
		} else {
			me = nextString(text);
		}
		return me;
	}
	
	private MiddleExpression nextMiddleExpression(String text) {
		boolean stringed = false;
		boolean escaped = false;
		short bracketBeginCharFound = 0;//在section中出现的{为配对的次数
		
		try {
			StringBuffer section = new StringBuffer(text.length());
			char[] chars = text.toCharArray();
			for (int i=0; i<chars.length; i++) {
				char c = chars[i];
				if (!escaped) {
					if ('\'' == c || '\"' == c) {
						stringed = !stringed;
						section.append(c);
						continue;
					} else
					if (c == ESCAPE_CHAR) {
						escaped = true;
						continue;
					}
				}
				
				if (stringed) {
					section.append(c);
					escaped = false;
				} else
				if (escaped) {
					if (SPECIAL_CHAR == c || BRACKET_BEGIN == c || BRACKET_END == c) {
						section.append(c);
					} else {
						section.append(ESCAPE_CHAR);
						section.append(c);
					}
					escaped = false;
				} else 
				if (BRACKET_BEGIN == c) {
					bracketBeginCharFound ++;
					section.append(c);
				} else
				if (BRACKET_END == c) {
					if (bracketBeginCharFound == 0) {
						Object expression = this.handler.getJexlEngine().createExpression(
								section.toString());
						MiddleExpression me = new MiddleExpression();
						me.expression = expression;
						if (i != chars.length-1) {
							me.nextText = text.substring(i + 1);
						}
						return me;
					} else {
						bracketBeginCharFound --;
						section.append(c);
					}
				} else {
					section.append(c);
				}
			}
		} catch (Exception e) {
			logger.error(e, e);
		}
		
		return null;
	}
	
	private MiddleExpression nextString(String text) {
		boolean escaped = false;
		boolean specialCharFound = false;
		
		StringBuffer section = new StringBuffer(text.length());
		char[] chars = text.toCharArray();
		for (int i=0; i<chars.length; i++) {
			char c = chars[i];
			if (!escaped) {
				if ('\'' == c || '\"' == c) {
					section.append(c);
					continue;
				} else
				if (c == ESCAPE_CHAR) {
					escaped = true;
					continue;
				}
			}
			
			if (escaped) {
				if (SPECIAL_CHAR == c || BRACKET_BEGIN == c || BRACKET_END == c) {
					section.append(c);
				} else {
					section.append(ESCAPE_CHAR);
					section.append(c);
				}
				escaped = false;
			} else 
			if (specialCharFound) {
				if (BRACKET_BEGIN == c) {
					MiddleExpression me = new MiddleExpression();
					me.expression = section.toString();
					me.nextText = text.substring(i-1);
					return me;
				} else {
					specialCharFound = false;
					section.append(SPECIAL_CHAR);
					section.append(c);
				}
			} else {
				if (SPECIAL_CHAR == c) {
					specialCharFound = true;
				} else {
					section.append(c);
				}
			}
		}
		
		MiddleExpression me = new MiddleExpression();
		me.expression = section.toString();
		return me;
	}
	
	private static class  MiddleExpression {
		private Object expression;
		private String nextText;
	}
}

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

package com.bstek.dorado.view.output;

import java.io.IOException;
import java.io.Writer;
import java.lang.reflect.Array;

import org.apache.commons.lang.StringEscapeUtils;

import com.bstek.dorado.data.IllegalJsonFormatException;

/**
 * 用于辅助JSON对象输出的工具类。
 * 
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Oct 6, 2008
 */
public class JsonBuilder {
	private static final int MAXDEPTH = 100;

	private Writer writer;
	private boolean reuseable;
	private boolean comma;
	private boolean prettyFormat;
	private char state;
	private char stack[];
	private char escapeStack[];
	private String escapeKeyStack[];
	private int top;
	private int escapeTop;
	private int leadingTab;

	public JsonBuilder(Writer w) {
		comma = false;
		state = 'i';
		stack = new char[MAXDEPTH];
		escapeStack = new char[MAXDEPTH];
		escapeKeyStack = new String[MAXDEPTH];
		top = 0;
		escapeTop = 0;
		writer = w;
	}

	public JsonBuilder(Writer w, boolean reuseable) {
		this(w);
		this.reuseable = reuseable;
	}

	/**
	 * 返回内部使用Writer。
	 */
	public Writer getWriter() {
		return writer;
	}

	public boolean isPrettyFormat() {
		return prettyFormat;
	}

	public void setPrettyFormat(boolean prettyFormat) {
		this.prettyFormat = prettyFormat;
	}

	public int getLeadingTab() {
		return leadingTab;
	}

	public void setLeadingTab(int leadingTab) {
		this.leadingTab = leadingTab;
	}

	private void write(char c) throws IOException {
		writer.write(c);
	}

	private void write(String s) throws IOException {
		writer.write(s);
	}

	private JsonBuilder append(String s, boolean skipNull, boolean quote) {
		if (state == 'o' && s == null) {
			throw new IllegalJsonFormatException("Null pointer");
		}
		if (state == 'i' || state == 'o' || state == 'k' || state == 'a'
				|| state == 'v') {
			try {
				if (state == 'a') {
					if (comma) {
						write(',');
					}
					outputLeadingTab();
				}
				if (s != null) {
					if (quote) {
						write('\"');
						write(s);
						write('\"');
					} else {
						write(s);
					}
				} else if (!skipNull) {
					write("null");
				}
			} catch (IOException e) {
				throw new IllegalJsonFormatException(e);
			}
			comma = (top > 0);
			return this;
		}
		throw new IllegalJsonFormatException("Value out of sequence.");
	}

	private JsonBuilder end(char m, char c) {
		if (state != m) {
			String msg;
			switch (m) {
			case 'o':
				msg = "Misplaced endObject.";
				break;
			case 'a':
				msg = "Misplaced endArray.";
				break;
			default:
				msg = "Misplaced endValue.";
				break;
			}
			throw new IllegalJsonFormatException(msg);
		}
		pop(m);
		try {
			if (c != 0) {
				outputLeadingTab();
				write(c);
			}
		} catch (IOException e) {
			throw new IllegalJsonFormatException(e);
		}
		comma = (top > 0);
		return this;
	}

	private void outputLeadingTab() throws IOException {
		if (prettyFormat) {
			write('\n');
			for (int i = 0; i < leadingTab; i++) {
				write('\t');
			}
		}
	}

	private void push(char c) {
		if (top >= MAXDEPTH) {
			throw new IllegalJsonFormatException("Nesting too deep.");
		}
		stack[top] = c;
		state = c;
		top++;
	}

	private void pop(char c) {
		if (top <= 0 || stack[top - 1] != c) {
			throw new IllegalJsonFormatException("Nesting error.");
		}
		top--;
		state = top == 0 ? (reuseable ? 'i' : 'd') : stack[top - 1];
	}

	private void pushEscapeablePart(char c, String s) {
		escapeStack[escapeTop] = c;
		escapeKeyStack[escapeTop] = s;
		escapeTop++;
	}

	private boolean popEscapeablePart(char c) {
		boolean escaped = false;
		if (escapeTop > 0) {
			char m = escapeStack[escapeTop - 1];
			if (m != c) {
				String msg;
				switch (c) {
				case 'o':
					msg = "Misplaced endObject.";
					break;
				case 'a':
					msg = "Misplaced endArray.";
					break;
				default:
					msg = "Misplaced endValue.";
					break;
				}
				throw new IllegalJsonFormatException(msg);
			} else {
				escapeTop--;
				if (escapeTop > 0) {
					escapeKeyStack[escapeTop] = null;
				}
				escaped = true;

			}
		}
		return escaped;
	}

	private void writeEscapeableParts() {
		int num = escapeTop;
		escapeTop = 0;
		for (int i = 0; i < num; i++) {
			char c = escapeStack[i];
			switch (c) {
			case 'a':
				array();
				break;
			case 'o':
				object();
				break;
			case 'k':
				key(escapeKeyStack[i]);
				escapeKeyStack[i] = null;
				break;
			}
		}
	}

	public boolean inEscapeableParts() {
		return escapeTop > 0;
	}

	/**
	 * 开始输出数组。
	 */
	public JsonBuilder array() {
		writeEscapeableParts();
		if (state == 'i' || state == 'k' || state == 'a' || state == 'v') {
			append("[", true, false);
			push('a');
			comma = false;
			if (prettyFormat) {
				leadingTab++;
			}
			return this;
		}
		throw new IllegalJsonFormatException("Misplaced array.");
	}

	public JsonBuilder escapeableArray() {
		pushEscapeablePart('a', null);
		return this;
	}

	/**
	 * 结束数组的输出。
	 */
	public JsonBuilder endArray() {
		if (!popEscapeablePart('a')) {
			if (prettyFormat) {
				leadingTab--;
			}
			end('a', ']');
		}
		return this;
	}

	/**
	 * 开始输出对象。
	 */
	public JsonBuilder object() {
		writeEscapeableParts();
		if (state == 'i' || state == 'k' || state == 'a' || state == 'v') {
			append("{", true, false);
			push('o');
			if (prettyFormat) {
				leadingTab++;
			}
			comma = false;
			return this;
		}
		throw new IllegalJsonFormatException("Misplaced object.");
	}

	public JsonBuilder escapeableObject() {
		pushEscapeablePart('o', null);
		return this;
	}

	/**
	 * 结束对象的输出。
	 */
	public JsonBuilder endObject() {
		if (!popEscapeablePart('o')) {
			if (prettyFormat) {
				leadingTab--;
			}
			end('o', '}');
		}
		return this;
	}

	/**
	 * 输出一个JSON对象的键。
	 */
	public JsonBuilder key(String s) {
		if (s == null) {
			throw new IllegalJsonFormatException("Null key.");
		}
		writeEscapeableParts();
		if (state == 'o') {
			try {
				if (comma) {
					write(',');
				}
				outputLeadingTab();

				// write(JsonUtils.quote(s));
				write('"');
				write(s); // for Performance 2012/05/15
				write('"');

				write(':');

				comma = false;
				state = 'k';
				return this;
			} catch (IOException e) {
				throw new IllegalJsonFormatException(e);
			}
		}
		throw new IllegalJsonFormatException("Misplaced key.");
	}

	public JsonBuilder escapeableKey(String s) {
		pushEscapeablePart('k', s);
		return this;
	}

	public JsonBuilder endKey() {
		popEscapeablePart('k');
		return this;
	}

	/**
	 * 输出一个逻辑值。
	 */
	public JsonBuilder value(boolean b) {
		return outputValue(b ? "true" : "false", false);
	}

	/**
	 * 输出一个双精度数值。
	 */
	public JsonBuilder value(double d) {
		return outputValue(Double.toString(d), false);
	}

	/**
	 * 输出一个长整值。
	 */
	public JsonBuilder value(long l) {
		return outputValue(Long.toString(l), false);
	}

	/**
	 * 输出一个对象型的数值。
	 */
	public JsonBuilder value(Object o) {
		if (o == null) {
			outputValue("null", false);
		} else if (o instanceof Number || o instanceof Boolean) {
			if (o instanceof Float && (Float.isNaN((Float) o))) {
				outputValue("undefined", false);
			}
			if (o instanceof Double && (Double.isNaN((Double) o))) {
				outputValue("undefined", false);
			} else {
				outputValue(o.toString(), false);
			}
		} else if (o.getClass().isArray()) {
			array();
			int len = Array.getLength(o);
			for (int i = 0; i < len; i++) {
				value(Array.get(o, i));
			}
			endArray();
		} else {
			String s = o.toString();
			if (s.length() == 0) {
				outputValue("\"\"", false);
			} else {
				outputValue(StringEscapeUtils.escapeJavaScript(s), true);
			}
		}
		return this;
	}

	private JsonBuilder outputValue(String s, boolean quote) {
		writeEscapeableParts();
		if (state == 'k' || state == 'a' || state == 'i') {
			append(s, true, quote);
			if (state == 'k') {
				state = 'o';
			}
			return this;
		}
		throw new IllegalJsonFormatException("Misplaced value.");
	}

	/**
	 * 开始一个自定义数值的输出。此方法仅在调用者自行在数组中输出了一个数值之前需要调用。
	 */
	public JsonBuilder beginValue() {
		writeEscapeableParts();
		if (state == 'k' || state == 'a') {
			append(null, true, false);
			push('v');
			return this;
		}
		throw new IllegalJsonFormatException("Misplaced beginValue.");
	}

	/**
	 * 结束自定义数值的输出。此方法仅在调用者自行输出了一个数值之后需要调用。
	 */
	public JsonBuilder endValue() {
		return end('v', '\0');
	}

	/**
	 * @return the state
	 */
	public char getState() {
		return state;
	}
}

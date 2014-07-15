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

package com.bstek.dorado.view.config.attachment;

import java.io.BufferedReader;
import java.io.EOFException;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.apache.commons.lang.StringUtils;

import com.bstek.dorado.core.io.Resource;
import com.bstek.dorado.util.Assert;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2012-5-31
 */
public class JavaScriptParser {
	private final static char ESCAPE_CHAR = '\\';
	private final static char QUOTE1 = '\'';
	private final static char QUOTE2 = '"';

	private final static char BLOCK_START = '{';
	private final static char BLOCK_END = '}';
	private final static char BRACKET_START = '(';
	private final static char BRACKET_END = ')';

	private final static char BACKSLASH = '/';
	private final static char STAR = '*';
	private final static char SPACE = ' ';
	private final static char TAB = '\t';
	private final static char RETURN = '\n';

	private final static char ANONYMOUS_FUNCTION_PREFIX = '!';

	private final static String FUNCTION = "function";
	private final static int FUNCTION_LEN = FUNCTION.length();

	private final static String ANONYMOUS_FUNCTION = "!function";
	private final static int ANONYMOUS_FUNCTION_LEN = ANONYMOUS_FUNCTION
			.length();

	private final static String VALID_NAME_CHARS = "$_";

	private static final String CONTROLLER_ANNOTATION = "@Controller";
	private static final String BIND_ANNOTATION = "@Bind";
	private static final String GLOBAL_ANNOTATION = "@Global";
	private static final String VIEW_ANNOTATION = "@View";

	private static final String AUTO_FUNCTION_NAME_PREFIX = "_anonymous_";

	private List<String> extractComment(CodeReader reader, boolean isLineComment)
			throws IOException {
		List<String> comments = null;
		boolean inContent = false, inSpace = false;
		StringBuffer contentLine = new StringBuffer(8);
		StringBuffer contentBuf = new StringBuffer();
		while (true) {
			char c = reader.read();
			if (c == RETURN) {
				if (contentBuf.length() > 0) {
					contentLine.append(contentBuf);
					if (contentLine.length() > 0) {
						if (comments == null) {
							comments = new ArrayList<String>();
						}
						comments.add(contentLine.toString());
						inContent = false;
						contentBuf.setLength(0);
						contentLine.setLength(0);
					}
				}
				if (isLineComment) {
					break;
				} else {
					continue;
				}
			} else if (c == STAR && !isLineComment) {
				char lastChar = c;
				c = reader.read();
				if (c == BACKSLASH) {
					break;
				} else {
					c = lastChar;
					reader.moveCursor(-1);
				}
			}

			if (!inContent) {
				if (c == SPACE || c == TAB || c == STAR) {
					// do nothing
				} else {
					inContent = true;
					contentBuf.append(c);
				}
			} else {
				if (c == SPACE || c == TAB || c == STAR) {
					inSpace = true;
					int bufLen = contentBuf.length();
					if (bufLen > 0) {
						contentLine.append(contentBuf);
						contentBuf.setLength(0);
					}
				} else {
					if (inSpace) {
						contentBuf.append(SPACE);
						inSpace = false;
					}
					contentBuf.append(c);
				}
			}
		}

		if (contentLine.length() > 0) {
			if (comments == null) {
				comments = new ArrayList<String>();
			}
			comments.add(contentLine.toString());
		}
		return comments;
	}

	private void skipComment(CodeReader reader, boolean isLineComment)
			throws IOException {
		while (true) {
			char c = reader.read();
			if (isLineComment) {
				if (c == RETURN) {
					break;
				}
			} else if (c == STAR) {
				c = reader.read();
				if (c == BACKSLASH) {
					break;
				}
			}
		}
	}

	private boolean checkAnnotation(String commentLine, String annot) {
		return commentLine.equals(annot) || commentLine.startsWith(annot + ' ');
	}

	private void parseComment(CodeReader reader, boolean isLineComment,
			JavaScriptContext context) throws IOException {
		List<String> comments = extractComment(reader, isLineComment);
		if (comments != null) {
			for (String line : comments) {
				if (checkAnnotation(line, BIND_ANNOTATION)) {
					String expression = line
							.substring(BIND_ANNOTATION.length() + 1);
					if (StringUtils.isNotEmpty(expression)) {
						BindingInfo bindingInfo = context
								.getCurrentBindingInfo();
						if (bindingInfo == null) {
							bindingInfo = new BindingInfo();
							context.setCurrentBindingInfo(bindingInfo);
						}
						bindingInfo.addExpression(expression);
					}
				} else if (checkAnnotation(line, CONTROLLER_ANNOTATION)) {
					context.setIsController(true);
				} else if (checkAnnotation(line, GLOBAL_ANNOTATION)) {
					context.setCurrentShouldRegisterToGlobal(true);
				} else if (checkAnnotation(line, VIEW_ANNOTATION)) {
					context.setCurrentShouldRegisterToView(true);
				}
			}
		}
	}

	private String extractFunctionName(CodeReader reader) throws IOException {
		StringBuffer content = new StringBuffer();
		while (true) {
			char c = reader.read();
			if (c >= 'a' && c <= 'z' || c >= 'A' && c <= 'Z' || c >= '0'
					&& c <= '9' || VALID_NAME_CHARS.indexOf(c) >= 0) {
				content.append(c);
			} else if ((c == SPACE || c == TAB || c == RETURN)
					&& content.length() == 0) {
				// do nothing
			} else {
				break;
			}
		}
		return content.toString();
	}

	private void skipString(CodeReader reader, char endToken)
			throws IOException {
		while (true) {
			char c = reader.read();
			if (c == ESCAPE_CHAR) {
				reader.moveCursor(1);
			} else if (c == endToken) {
				break;
			}
		}
	}

	private void skipBlock(CodeReader reader, char endToken) throws IOException {
		while (true) {
			char c = reader.read();
			if (c == BACKSLASH) {
				c = reader.read();
				if (c == BACKSLASH || c == STAR) {
					skipComment(reader, (c == BACKSLASH));
					continue;
				}
			}

			if (c == QUOTE1 || c == QUOTE2) {
				skipString(reader, c);
			} else if (c == BLOCK_START) {
				skipBlock(reader, BLOCK_END);
			} else if (c == BRACKET_START) {
				skipBlock(reader, BRACKET_END);
			} else if (c == endToken) {
				break;
			}
		}
	}

	private JavaScriptContent parse(StringBuffer source,
			JavaScriptContext context) throws IOException {
		StringBuffer reserveWord = new StringBuffer(8), modifiedSource = null;
		int autoNameSeed = 0, copyStart = 0;
		Boolean isController = context.getIsController();
		CodeReader reader = new CodeReader(source);
		try {
			while (true) {
				char c = reader.read();
				if (c >= 'a' && c <= 'z' || c >= 'A' && c <= 'Z' || c >= '0'
						&& c <= '9' || VALID_NAME_CHARS.indexOf(c) >= 0) {
					reserveWord.append(c);
				} else if (c == RETURN) {
					// do nothing
				} else if (c == ANONYMOUS_FUNCTION_PREFIX) {
					reserveWord.setLength(0);
					reserveWord.append(c);
				} else {
					int len = reserveWord.length();
					if (len > 0) {
						if (len == FUNCTION_LEN
								&& reserveWord.toString().equals(FUNCTION)) {
							reader.moveCursor(-1);
							String functionName = extractFunctionName(reader);
							if (StringUtils.isNotEmpty(functionName)) {
								if (context.isHasAnnotation()) {
									FunctionInfo functionInfo = new FunctionInfo(
											functionName);
									functionInfo.setBindingInfo(context
											.getCurrentBindingInfo());
									functionInfo
											.setShouldRegisterToGlobal(context
													.getCurrentShouldRegisterToGlobal());
									functionInfo
											.setShouldRegisterToView(context
													.getCurrentShouldRegisterToView());
									context.addFunctionInfo(functionInfo);
								}
							}
						} else if (len == ANONYMOUS_FUNCTION_LEN
								&& reserveWord.toString().equals(
										ANONYMOUS_FUNCTION)) {
							reader.moveCursor(-1);
							int copyEnd = reader.getCurrentPos()
									- ANONYMOUS_FUNCTION_LEN;
							String functionName = extractFunctionName(reader);
							if (StringUtils.isEmpty(functionName)
									&& context.isHasAnnotation()) {
								BindingInfo currentBindingInfo = context
										.getCurrentBindingInfo();
								if (currentBindingInfo != null) {
									functionName = AUTO_FUNCTION_NAME_PREFIX
											+ (++autoNameSeed);

									if (modifiedSource == null) {
										modifiedSource = new StringBuffer(
												source.length());
									}

									modifiedSource
											.append(source.substring(copyStart,
													copyEnd)).append(FUNCTION)
											.append(SPACE).append(functionName);
									copyStart = reader.getCurrentPos() - 1;

									FunctionInfo functionInfo = new FunctionInfo(
											functionName);
									functionInfo.setBindingInfo(context
											.getCurrentBindingInfo());
									context.addFunctionInfo(functionInfo);
								}
							}
						}

						if (context.isHasAnnotation()) {
							context.reset();
						}
						reserveWord.setLength(0);
					} else {
						if (c == BACKSLASH) {
							c = reader.read();
							if (c == BACKSLASH || c == STAR) {
								parseComment(reader, (c == BACKSLASH), context);
								isController = context.getIsController();
								if (isController != null && !isController) {
									break;
								}
								continue;
							}
						}

						if (isController == null && c != SPACE && c != TAB
								&& c != RETURN) {
							context.setIsController(false);
							break;
						}

						if (c == QUOTE1 || c == QUOTE2) {
							skipString(reader, c);
						} else if (c == BLOCK_START) {
							skipBlock(reader, BLOCK_END);
						} else if (c == BRACKET_START) {
							skipBlock(reader, BRACKET_END);
						}
					}
				}
			}
		} catch (EOFException e) {
			// do nothing
		}

		if (modifiedSource != null) {
			modifiedSource.append(source.substring(copyStart));
			source = modifiedSource;
		}

		JavaScriptContent javaScriptContent = new JavaScriptContent();
		javaScriptContent.setContent(source.toString());
		javaScriptContent.setIsController(context.getIsController());
		javaScriptContent.setFunctionInfos(context.getFunctionInfos());
		return javaScriptContent;
	}

	public JavaScriptContent parse(Resource resource, String charset,
			boolean asControllerInDefault) throws IOException {
		InputStream in = resource.getInputStream();
		try {
			InputStreamReader reader;
			if (StringUtils.isNotEmpty(charset)) {
				reader = new InputStreamReader(in, charset);
			} else {
				reader = new InputStreamReader(in);
			}
			BufferedReader br = new BufferedReader(reader);

			StringBuffer source = new StringBuffer();
			String line;
			while ((line = br.readLine()) != null) {
				source.append(line).append('\n');
			}
			br.close();
			reader.close();

			JavaScriptContext context = new JavaScriptContext();
			if (asControllerInDefault) {
				context.setIsController(true);
			}
			return parse(source, context);
		} finally {
			in.close();
		}
	}

}

class CodeReader {
	private StringBuffer buf;
	private int cursor;

	public CodeReader(StringBuffer buf) {
		this.buf = buf;
	}

	public char read() throws EOFException {
		if (cursor > buf.length() - 1) {
			throw new EOFException();
		} else {
			return buf.charAt(cursor++);
		}
	}

	public int moveCursor(int distence) {
		cursor += distence;
		if (cursor < 0) {
			return distence + (0 - cursor);
		} else if (cursor > buf.length() - 1) {
			return distence - (cursor - buf.length() - 1);
		} else {
			return distence;
		}
	}

	public int getCurrentPos() {
		return cursor;
	}
}

class JavaScriptContext {
	private boolean hasAnnotation;
	private Boolean isController;
	private BindingInfo currentBindingInfo;
	private boolean currentShouldRegisterToGlobal;
	private boolean currentShouldRegisterToView;
	private List<FunctionInfo> functionInfos;
	private Set<String> functionNames;

	public Boolean getIsController() {
		return isController;
	}

	public void setIsController(Boolean isController) {
		this.isController = isController;
	}

	public BindingInfo getCurrentBindingInfo() {
		return currentBindingInfo;
	}

	public void setCurrentBindingInfo(BindingInfo currentBindingInfo) {
		this.currentBindingInfo = currentBindingInfo;
		hasAnnotation = true;
	}

	public boolean getCurrentShouldRegisterToGlobal() {
		return currentShouldRegisterToGlobal;
	}

	public void setCurrentShouldRegisterToGlobal(
			boolean currentShouldRegisterToGlobal) {
		this.currentShouldRegisterToGlobal = currentShouldRegisterToGlobal;
		hasAnnotation = true;
	}

	public boolean getCurrentShouldRegisterToView() {
		return currentShouldRegisterToView;
	}

	public void setCurrentShouldRegisterToView(
			boolean currentShouldRegisterToView) {
		this.currentShouldRegisterToView = currentShouldRegisterToView;
		hasAnnotation = true;
	}

	public List<FunctionInfo> getFunctionInfos() {
		return functionInfos;
	}

	public void addFunctionInfo(FunctionInfo functionInfo) {
		if (functionNames != null
				&& functionNames.contains(functionInfo.getFunctionName())) {

		}

		if (functionInfos == null) {
			functionInfos = new ArrayList<FunctionInfo>();
			functionNames = new HashSet<String>();
		}
		functionInfos.add(functionInfo);
		reset();
	}

	public boolean isHasAnnotation() {
		return hasAnnotation;
	}

	public void reset() {
		currentBindingInfo = null;
		currentShouldRegisterToGlobal = false;
		currentShouldRegisterToView = false;
		hasAnnotation = false;
	}

};

class FunctionInfo {
	private String functionName;
	private BindingInfo bindingInfo;
	private boolean shouldRegisterToGlobal;
	private boolean shouldRegisterToView;

	public FunctionInfo(String functionName) {
		this.functionName = functionName;
	}

	public String getFunctionName() {
		return functionName;
	}

	public BindingInfo getBindingInfo() {
		return bindingInfo;
	}

	public void setBindingInfo(BindingInfo bindingInfo) {
		this.bindingInfo = bindingInfo;
	}

	public boolean getShouldRegisterToGlobal() {
		return shouldRegisterToGlobal;
	}

	public void setShouldRegisterToGlobal(boolean shouldRegisterToGlobal) {
		this.shouldRegisterToGlobal = shouldRegisterToGlobal;
	}

	public boolean getShouldRegisterToView() {
		return shouldRegisterToView;
	}

	public void setShouldRegisterToView(boolean shouldRegisterToView) {
		this.shouldRegisterToView = shouldRegisterToView;
	}
};

class BindingInfo {
	private List<String> expressions = new ArrayList<String>();
	private boolean loose;

	public void addExpression(String expression) {
		Assert.notEmpty(expression);
		int i = expression.indexOf('.');
		if (i > 0) {
			String objects = expression.substring(0, i);
			String eventName = expression.substring(i + 1);
			Assert.notEmpty(objects);
			Assert.notEmpty(eventName);
		} else {
			throw new IllegalArgumentException("Invalid Bind expression \""
					+ expression + "\".");
		}
		expressions.add(expression);
	}

	public List<String> getExpressions() {
		return expressions;
	}

	public boolean isLoose() {
		return loose;
	}

	public void setLoose(boolean loose) {
		this.loose = loose;
	}

}

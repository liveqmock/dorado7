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

import java.lang.reflect.Method;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javassist.ClassPool;
import javassist.CtClass;
import javassist.CtMethod;
import javassist.CtNewMethod;

import org.apache.commons.jexl2.JexlContext;
import org.apache.commons.jexl2.JexlEngine;
import org.apache.commons.jexl2.MapContext;
import org.apache.commons.lang.ArrayUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

import com.bstek.dorado.core.Context;

/**
 * 默认的EL表达式处理器的实现类。
 * 
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Mar 4, 2007
 */
public class DefaultExpressionHandler implements ExpressionHandler {

	private static final Log logger = LogFactory
			.getLog(ExpressionHandler.class);

	private final static String DORADO_VAR = "dorado";
	private final static String CONTEXT_ATTRIBUTE_KEY = DefaultExpressionHandler.class
			.getName();
	private static final String DORADO_EXPRESSION_UTILS_TYPE = "com.bstek.dorado.core.el.$DoradoExpressionUtils";

	private static ThreadLocal<JexlEngine> threadLocal = new ThreadLocal<JexlEngine>();
	private static Object doradoExpressionUtilsBean;

	private List<ContextVarsInitializer> contextInitializers;

	/**
	 * 设置所有的隐式变量初始化器。
	 */
	public void setContextInitializers(
			List<ContextVarsInitializer> contextInitializers) {
		this.contextInitializers = contextInitializers;
	}

	/**
	 * 返回所有的隐式变量初始化器。
	 */
	public List<ContextVarsInitializer> getContextInitializers() {
		return contextInitializers;
	}

	public Expression compile(String text) {
		List<Object> sections = new ExpressionCompiler(this)
				.compileSections(text);
		if (sections != null && sections.size() > 0) {
			for (Object section : sections) {
				if (section instanceof org.apache.commons.jexl2.Expression) {
					EvaluateMode evaluateMode = text.startsWith("$${") ? EvaluateMode.onRead
							: EvaluateMode.onInstantiate;
					Expression expression = this.createExpression(sections,
							evaluateMode);
					if (expression instanceof ExpressionHandlerAware) {
						((ExpressionHandlerAware) expression)
								.setExpressionHandler(this);
					}
					return expression;
				}
			}
		}
		return null;
	}

	/**
	 * 根据与解析的结果创建具体的表达式对象。
	 * 
	 * @param sections
	 * @param evaluateMode
	 * @return
	 */
	protected Expression createExpression(List<Object> sections,
			EvaluateMode evaluateMode) {
		Expression expression;
		if (sections.size() == 1) {
			expression = new SingleExpression(
					(org.apache.commons.jexl2.Expression) sections.get(0),
					evaluateMode);

		} else {
			expression = new CombinedExpression(sections, evaluateMode);
		}
		return expression;
	}

	public JexlEngine getJexlEngine() throws Exception {
		JexlEngine engine = threadLocal.get();
		if (engine == null) {
			engine = new JexlEngine();
			engine.setCache(50);
			engine.setSilent(true);
			threadLocal.set(engine);
		}
		return engine;
	}

	public JexlContext getJexlContext() {
		Context context = Context.getCurrent();
		JexlContext ctx = (JexlContext) context.getAttribute(Context.THREAD,
				CONTEXT_ATTRIBUTE_KEY);
		if (ctx == null) {
			ctx = new MapContext();
			if (contextInitializers != null) {
				try {
					Map<String, Method> utilMethods = new HashMap<String, Method>();

					Map<String, Object> vars = new HashMap<String, Object>();
					for (ContextVarsInitializer initializer : contextInitializers) {
						initializer.initializeContext(vars);
					}
					for (Map.Entry<String, Object> entry : vars.entrySet()) {
						String key = entry.getKey();
						Object value = entry.getValue();
						if (value instanceof Method) {
							utilMethods.put(key, (Method) value);
						} else {
							ctx.set(key, value);
						}
					}

					if (!utilMethods.isEmpty()) {
						ctx.set(DORADO_VAR,
								createDoradoExpressionUtilsBean(utilMethods));
					}
				} catch (Exception e) {
					logger.error(e, e);
				}
			}

			try {
				context.setAttribute(Context.THREAD, CONTEXT_ATTRIBUTE_KEY, ctx);
			} catch (NullPointerException e) {
				// do nothing
			}
		}
		return ctx;
	}

	protected synchronized static Object createDoradoExpressionUtilsBean(
			Map<String, Method> utilMethods) throws Exception {
		if (doradoExpressionUtilsBean == null) {
			ClassPool pool = ClassPool.getDefault();
			CtClass ctClass = null;
			try {
				ctClass = pool.get(DORADO_EXPRESSION_UTILS_TYPE);
			} catch (Exception e) {
				// do nothing
			}
			if (ctClass == null) {
				ctClass = pool.makeClass(DORADO_EXPRESSION_UTILS_TYPE);
			}
			for (Map.Entry<String, Method> entry : utilMethods.entrySet()) {
				String name = entry.getKey();
				Method method = entry.getValue();
				int methodIndex = ArrayUtils.indexOf(method.getDeclaringClass()
						.getMethods(), method);

				StringBuffer buf = new StringBuffer();
				StringBuffer args = new StringBuffer();
				buf.append("public ").append("Object").append(' ').append(name)
						.append('(');
				Class<?>[] parameterTypes = method.getParameterTypes();
				for (int i = 0; i < parameterTypes.length; i++) {
					if (i > 0) {
						buf.append(',');
						args.append(',');
					}
					buf.append("Object").append(' ').append("p" + i);
					args.append("p" + i);
				}
				buf.append(")");
				if (method.getExceptionTypes().length > 0) {
					buf.append(" throws ");
					int i = 0;
					for (Class<?> exceptionType : method.getExceptionTypes()) {
						if (i > 0)
							buf.append(',');
						buf.append(exceptionType.getName());
						i++;
					}
				}
				buf.append("{\n")
						.append("return Class.forName(\""
								+ method.getDeclaringClass().getName())
						.append("\").getMethods()[").append(methodIndex)
						.append("].invoke(null, new Object[]{").append(args)
						.append("});").append("\n}");
				CtMethod delegator = CtNewMethod.make(buf.toString(), ctClass);
				delegator.setName(name);
				ctClass.addMethod(delegator);
			}
			Class<?> cl = ctClass.toClass();
			doradoExpressionUtilsBean = cl.newInstance();
		}
		return doradoExpressionUtilsBean;
	}
}

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
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.List;

import org.apache.commons.lang.StringUtils;

import net.sf.ehcache.Ehcache;
import net.sf.ehcache.Element;

import com.bstek.dorado.core.el.Expression;
import com.bstek.dorado.core.el.ExpressionHandler;
import com.bstek.dorado.core.io.DefaultRefreshableResource;
import com.bstek.dorado.core.io.RefreshableResource;
import com.bstek.dorado.core.io.Resource;
import com.bstek.dorado.view.el.CombinedExpression;
import com.bstek.dorado.view.output.OutputContext;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2012-5-29
 */
public class AttachedResourceManager {
	private ExpressionHandler expressionHandler;
	private boolean supportsExpression = true;
	private Ehcache cache;
	private String charset;

	public ExpressionHandler getExpressionHandler() {
		return expressionHandler;
	}

	public void setExpressionHandler(ExpressionHandler expressionHandler) {
		this.expressionHandler = expressionHandler;
	}

	public boolean isSupportsExpression() {
		return supportsExpression;
	}

	public void setSupportsExpression(boolean supportsExpression) {
		this.supportsExpression = supportsExpression;
	}

	public Ehcache getCache() {
		return cache;
	}

	public void setCache(Ehcache cache) {
		this.cache = cache;
	}

	public String getCharset() {
		return charset;
	}

	public void setCharset(String charset) {
		this.charset = charset;
	}

	public Object getContent(Resource resource) throws Exception {
		Element element = cache.get(resource);
		if (element == null) {
			Object content = parseContent(resource);
			if (!(resource instanceof RefreshableResource)) {
				resource = new DefaultRefreshableResource(resource);
			}
			element = new ResourceCacheElement((RefreshableResource) resource,
					content);
			cache.put(element);
		}
		return element.getObjectValue();
	}

	public void outputContent(OutputContext context, Object content)
			throws Exception {
		if (content instanceof Expression) {
			content = ((Expression) content).evaluate();
		}
		context.getWriter().write(String.valueOf(content));
	}

	protected Object parseContent(Resource resource) throws Exception {
		InputStream in = resource.getInputStream();
		try {
			InputStreamReader reader;
			if (StringUtils.isNotEmpty(charset)) {
				reader = new InputStreamReader(in, charset);
			} else {
				reader = new InputStreamReader(in);
			}
			BufferedReader br = new BufferedReader(reader);

			List<Object> sections = new ArrayList<Object>();
			boolean hasExpression = false;
			int length = 0;
			String line;
			while ((line = br.readLine()) != null) {
				if (supportsExpression) {
					Expression expression = expressionHandler.compile(line);
					if (expression != null) {
						sections.add(expression);
						hasExpression = true;
						continue;
					}
				}
				sections.add(line);
				length += line.length();
			}

			br.close();
			reader.close();

			if (hasExpression) {
				return new CombinedExpression(sections);
			} else {
				StringBuffer buf = new StringBuffer(length + sections.size());
				for (Object l : sections) {
					buf.append((String) l).append('\n');
				}
				return buf.toString();
			}
		} finally {
			in.close();
		}
	}
}

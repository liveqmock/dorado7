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

package com.bstek.dorado.common.proxy;

import org.aopalliance.intercept.MethodInterceptor;
import org.aopalliance.intercept.MethodInvocation;
import org.apache.commons.lang.StringUtils;

import com.bstek.dorado.util.PathUtils;
import com.bstek.dorado.util.proxy.MethodInterceptorFilter;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2011-7-8
 */
public class PatternMethodInterceptorFilter implements MethodInterceptorFilter {
	private String targetName;

	public PatternMethodInterceptorFilter(String targetName) {
		this.targetName = targetName;
	}

	public boolean filter(MethodInterceptor methodInterceptor,
			MethodInvocation methodInvocation) {
		boolean accept = true;
		if (methodInterceptor instanceof PatternMethodInterceptor) {
			PatternMethodInterceptor patternMethodInterceptor = (PatternMethodInterceptor) methodInterceptor;
			String pattern = patternMethodInterceptor.getPattern();
			if (StringUtils.isNotEmpty(pattern)) {
				accept = PathUtils.match(pattern, targetName);
			}
			if (accept) {
				String excludePattern = patternMethodInterceptor
						.getExcludePattern();
				if (StringUtils.isNotEmpty(excludePattern)) {
					accept = !PathUtils.match(excludePattern, targetName);
				}
			}
		}
		return accept;
	}
}

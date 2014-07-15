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

import java.util.Comparator;
import java.util.TreeSet;

import org.aopalliance.intercept.MethodInterceptor;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2011-7-8
 */
public class SortableMethodInterceptorSet extends TreeSet<MethodInterceptor> {
	private static final long serialVersionUID = 3741367835627942263L;
	private static final int DEFAULT_ORDER = 999;

	public SortableMethodInterceptorSet() {
		super(new Comparator<MethodInterceptor>() {
			public int compare(MethodInterceptor o1, MethodInterceptor o2) {
				int order1 = (o1 instanceof PatternMethodInterceptor) ? ((PatternMethodInterceptor) o1)
						.getOrder() : DEFAULT_ORDER;
				int order2 = (o2 instanceof PatternMethodInterceptor) ? ((PatternMethodInterceptor) o2)
						.getOrder() : DEFAULT_ORDER;
				int result = order1 - order2;
				if (result == 0) {
					result = o1.hashCode() - o2.hashCode();
					if (result == 0)
						result = -1;
				}
				return result;
			}
		});
	}

}

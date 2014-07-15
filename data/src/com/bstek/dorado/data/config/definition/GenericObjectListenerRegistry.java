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

package com.bstek.dorado.data.config.definition;

import java.util.Collection;
import java.util.Comparator;
import java.util.Set;
import java.util.TreeSet;

import com.bstek.dorado.data.listener.GenericObjectListener;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2011-7-10
 */
public final class GenericObjectListenerRegistry {
	private GenericObjectListenerRegistry() {
	}

	@SuppressWarnings("rawtypes")
	private static Set<GenericObjectListener<?>> listeners = new TreeSet<GenericObjectListener<?>>(
			new Comparator<GenericObjectListener>() {
				private static final int DEFAULT_ORDER = 999;

				public int compare(GenericObjectListener o1,
						GenericObjectListener o2) {
					int order1 = (o1 instanceof GenericObjectListener) ? o1
							.getOrder() : DEFAULT_ORDER;
					int order2 = (o2 instanceof GenericObjectListener) ? o2
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

	public static void addListener(GenericObjectListener<?> listener) {
		listeners.add(listener);
	}

	public static Collection<GenericObjectListener<?>> getListeners() {
		return listeners;
	}
}

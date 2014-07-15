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

import org.aopalliance.intercept.MethodInterceptor;
import org.apache.commons.lang.StringUtils;

import com.bstek.dorado.common.proxy.SortableMethodInterceptorSet;
import com.bstek.dorado.config.definition.DefaultDefinitionManager;
import com.bstek.dorado.config.definition.DefinitionManager;
import com.bstek.dorado.util.Assert;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Apr 29, 2009
 */
public class DataResolverDefinitionManager extends
		DefaultDefinitionManager<DataResolverDefinition> {
	private SortableMethodInterceptorSet dataResolverMethodInterceptors = new SortableMethodInterceptorSet();

	public DataResolverDefinitionManager() {
		super();
	}

	public DataResolverDefinitionManager(
			DefinitionManager<DataResolverDefinition> parent) {
		super(parent);
	}

	@Override
	public void registerDefinition(String name,
			DataResolverDefinition definition) {
		Assert.notEmpty(name);

		if (StringUtils.isEmpty(definition.getId())) {
			definition.setId(name);
		}

		if (super.getDefinition(name) != null) {
			throw new IllegalStateException("The DataResolver [" + name
					+ "] is already registered!");
		}
		super.registerDefinition(name, definition);
	}

	public void addDataResolverMethodInterceptor(
			MethodInterceptor methodInterceptor) {
		dataResolverMethodInterceptors.add(methodInterceptor);
	}

	public MethodInterceptor[] getDataResolverMethodInterceptors() {
		MethodInterceptor[] methodInterceptors = null;
		if (!dataResolverMethodInterceptors.isEmpty()) {
			methodInterceptors = dataResolverMethodInterceptors
					.toArray(new MethodInterceptor[0]);
		}
		DefinitionManager<DataResolverDefinition> parent = getParent();
		if (parent != null && parent instanceof DataResolverDefinitionManager) {
			MethodInterceptor[] parentMethodInterceptors = ((DataResolverDefinitionManager) parent)
					.getDataResolverMethodInterceptors();
			if (parentMethodInterceptors != null) {
				if (methodInterceptors != null) {
					MethodInterceptor[] finalMethodInterceptors = new MethodInterceptor[parentMethodInterceptors.length
							+ methodInterceptors.length];
					System.arraycopy(parentMethodInterceptors, 0,
							finalMethodInterceptors, 0,
							parentMethodInterceptors.length);
					System.arraycopy(methodInterceptors, 0,
							finalMethodInterceptors,
							parentMethodInterceptors.length,
							methodInterceptors.length);
					methodInterceptors = finalMethodInterceptors;
				} else {
					methodInterceptors = parentMethodInterceptors;
				}
			}
		}
		return methodInterceptors;
	}

}

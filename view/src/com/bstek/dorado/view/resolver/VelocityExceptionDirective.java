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

package com.bstek.dorado.view.resolver;

import java.io.IOException;
import java.io.Writer;

import org.apache.velocity.context.InternalContextAdapter;
import org.apache.velocity.exception.MethodInvocationException;
import org.apache.velocity.exception.ParseErrorException;
import org.apache.velocity.exception.ResourceNotFoundException;
import org.apache.velocity.runtime.directive.Directive;
import org.apache.velocity.runtime.parser.node.Node;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2011-1-24
 */
public class VelocityExceptionDirective extends Directive {
	public static final String EXCEPTION_ATTRIBUTE = "exception";

	@Override
	public String getName() {
		return "outputException";
	}

	@Override
	public int getType() {
		return LINE;
	}

	@Override
	public boolean render(InternalContextAdapter contextAdapter, Writer writer,
			Node node) throws IOException, ResourceNotFoundException,
			ParseErrorException, MethodInvocationException {
		Exception e = (Exception) contextAdapter.get(EXCEPTION_ATTRIBUTE);
		if (e != null) {
			Throwable throwable = e;
			while (throwable.getCause() != null) {
				throwable = throwable.getCause();
			}
			PageOutputUtils.outputException(writer, throwable);
		}
		return true;
	}

}

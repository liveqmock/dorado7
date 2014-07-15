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

import java.io.Writer;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.apache.velocity.context.InternalContextAdapter;
import org.apache.velocity.runtime.directive.Directive;

public abstract class AbstractDirective extends Directive {
	protected static final Log logger = LogFactory
			.getLog(AbstractDirective.class);

	protected void processException(InternalContextAdapter contextAdapter,
			Writer writer, Exception e) {
		contextAdapter.put(VelocityExceptionDirective.EXCEPTION_ATTRIBUTE, e);
		logger.error(e, e);
	}

}

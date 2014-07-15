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

import org.apache.velocity.VelocityContext;
import org.apache.velocity.app.VelocityEngine;
import org.apache.velocity.context.Context;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2011-5-14
 */
public class SimpleVelocityHelper extends VelocityHelper {
	private VelocityEngine velocityEngine;

	public SimpleVelocityHelper(VelocityEngine velocityEngine) {
		this.velocityEngine = velocityEngine;
	}

	@Override
	protected Context createContext() throws Exception {
		return new VelocityContext();
	}

	@Override
	public VelocityEngine getVelocityEngine() throws Exception {
		return velocityEngine;
	}

}

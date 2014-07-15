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

package com.bstek.dorado.web.resolver;

import java.io.FileNotFoundException;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2011-7-18
 */
public class PageNotFoundException extends FileNotFoundException {
	private static final long serialVersionUID = -7660289430597209704L;

	public PageNotFoundException(String message) {
		super(message);
	}

	public PageNotFoundException(Throwable cause) {
		this(cause.getMessage());
		this.initCause(cause);
	}

	public PageNotFoundException(String message, Throwable cause) {
		this(message);
		this.initCause(cause);
	}
}

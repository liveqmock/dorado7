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

package com.bstek.dorado.data;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2011-10-15
 */
public class IllegalJsonFormatException extends RuntimeException {
	private static final long serialVersionUID = 5987781189952481383L;

	public IllegalJsonFormatException() {
		super();
	}

	public IllegalJsonFormatException(String message, Throwable cause) {
		super(message, cause);
	}

	public IllegalJsonFormatException(String message) {
		super(message);
	}

	public IllegalJsonFormatException(Throwable cause) {
		super(cause);
	}

}

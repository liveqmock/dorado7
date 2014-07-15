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

package com.bstek.dorado.console.security;
/**
 * Dorado Console AccessDeniedException
 * 
 * @author Alex Tong(mailto:alex.tong@bstek.com)
 * 
 */
public class AccessDeniedException extends RuntimeException {

	private static final long serialVersionUID = -7136350916222027464L;
	
	public static final String LOGIN_TIME_OUT_MESSAGE="登陆已超时！";

	/**
     * Constructs an <code>AccessDeniedException</code> with the specified
     * message.
     *
     * @param msg the detail message
     */
    public AccessDeniedException(String msg) {
        super(msg);
    }

    /**
     * Constructs an <code>AccessDeniedException</code> with the specified
     * message and root cause.
     *
     * @param msg the detail message
     * @param t root cause
     */
    public AccessDeniedException(String msg, Throwable t) {
        super(msg, t);
    }
}

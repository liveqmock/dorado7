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

package com.bstek.dorado.console;

import com.bstek.dorado.console.authentication.AuthenticationManager;

/**
 * Dorado Console Setting
 * 
 * @author Alex Tong (mailto:alex.tong@bstek.com)
 * @since 2012-12-27
 */
public final class Setting {

	private static AuthenticationManager authenticationManager;
	private static long startTime;
	private static boolean listenerActiveState = false;
	/**
	 * @return the authenticationManager
	 */
	public static AuthenticationManager getAuthenticationManager() {
		return authenticationManager;
	}
	/**
	 * @param authenticationManager the authenticationManager to set
	 */
	public static void setAuthenticationManager(
			AuthenticationManager authenticationManager) {
		Setting.authenticationManager = authenticationManager;
	}
	/**
	 * @return the startTime
	 */
	public static long getStartTime() {
		return startTime;
	}
	/**
	 * @param startTime the startTime to set
	 */
	public static void setStartTime(long startTime) {
		Setting.startTime = startTime;
	}
	/**
	 * @return the listenerActiveState
	 */
	public static boolean getListenerActiveState() {
		return listenerActiveState;
	}
	/**
	 * @param listenerActiveState the listenerActiveState to set
	 */
	public static void setListenerActiveState(boolean listenerActiveState) {
		Setting.listenerActiveState = listenerActiveState;
	}
	
	

}

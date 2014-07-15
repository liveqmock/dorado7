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

package com.bstek.dorado.common;

import org.apache.commons.lang.ArrayUtils;
import org.apache.commons.lang.StringUtils;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2012-11-20
 */
public final class ClientType {
	public static final String CURRENT_CLIENT_TYPE_KEY = ClientType.class
			.getName() + ".current";

	public static final int DESKTOP = 0x00000001;

	public static final int TOUCH = 0x00000002;

	public static final String DESKTOP_NAME = "desktop";

	public static final String TOUCH_NAME = "touch";

	public static int ALL_CLIENT_TYPES = DESKTOP + TOUCH;

	public static boolean supports(int types, int targetType) {
		return types == 0 || (types & targetType) != 0;
	}

	public static boolean supportsDesktop(int types) {
		return types == 0 || (types & DESKTOP) != 0;
	}

	public static boolean supportsTouch(int types) {
		return types == 0 || (types & TOUCH) != 0;
	}

	public static int parseClientTypes(String clientTypes) {
		int clientTypesValue = 0;
		if (StringUtils.isNotBlank(clientTypes)) {
			String[] clientTypeArray = StringUtils.split(
					clientTypes.toLowerCase(), ",; ");
			if (ArrayUtils.indexOf(clientTypeArray, DESKTOP_NAME) >= 0) {
				clientTypesValue += ClientType.DESKTOP;
			}
			if (ArrayUtils.indexOf(clientTypeArray, TOUCH_NAME) >= 0) {
				clientTypesValue += ClientType.TOUCH;
			}
		}
		return clientTypesValue;
	}

	public static int parseClientTypes(int[] clientTypes) {
		int clientTypesValue = 0;
		if (clientTypes != null) {
			for (int clientType : clientTypes) {
				clientTypesValue |= clientType;
			}
		}
		return clientTypesValue;
	}

	public static String toString(int clientTypes) {
		StringBuffer s = new StringBuffer();
		if (supportsDesktop(clientTypes)) {
			s.append(DESKTOP_NAME);
		}
		if (supportsTouch(clientTypes)) {
			if (s.length() > 0) {
				s.append(',');
			}
			s.append(TOUCH_NAME);
		}
		return (s.length() > 0) ? s.toString() : null;
	}
}

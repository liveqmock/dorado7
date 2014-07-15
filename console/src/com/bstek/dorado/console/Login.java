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

import com.bstek.dorado.annotation.Expose;
import com.bstek.dorado.console.authentication.AuthenticationManager;
import com.bstek.dorado.view.View;
import com.bstek.dorado.web.DoradoContext;

/**
 * 登陆服务接口
 * 
 * @author Alex Tong(mailto:alex.tong@bstek.com)
 * @since 2012-12-24
 * 
 */
public class Login {

	@Expose
	public boolean login(String name, String password) {
		AuthenticationManager authenticationManager = Setting.getAuthenticationManager();
		return authenticationManager.authenticate(name, password);
	}

	public void onViewInit(View view) {
		
	}

	@Expose
	public void logout() {
		DoradoContext.getCurrent().removeAttribute(DoradoContext.SESSION,
				Constants.S_DORADO_CONSOLE_LOGIN_STATUS);
	}
}

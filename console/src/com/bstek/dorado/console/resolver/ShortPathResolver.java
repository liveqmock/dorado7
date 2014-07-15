/**
 * 
 */
package com.bstek.dorado.console.resolver;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.web.servlet.ModelAndView;

import com.bstek.dorado.console.Setting;
import com.bstek.dorado.console.authentication.AuthenticationManager;
import com.bstek.dorado.core.Configure;
import com.bstek.dorado.web.resolver.SimpleUrlResolver;

/**
 * 
 * @author Alex Tong(mailto:alex.tong@bstek.com)
 * @since 2013-12-31
 */
public class ShortPathResolver extends SimpleUrlResolver {
	private String welcomeUrl;
	private String mainUrl;
	private String loginUrl;

	public void setWelcomeUrl(String welcomeUrl) {
		this.welcomeUrl = welcomeUrl;
	}

	public void setMainUrl(String mainUrl) {
		this.mainUrl = mainUrl;
	}

	public void setLoginUrl(String loginUrl) {
		this.loginUrl = loginUrl;
	}

	@Override
	public ModelAndView handleRequest(HttpServletRequest request,
			HttpServletResponse response) throws Exception {
		boolean consoleEnabled = Configure.getBoolean("console.enabled", false);
		String url = welcomeUrl;
		if (consoleEnabled) {
			AuthenticationManager authentication = Setting
					.getAuthenticationManager();
			boolean isLogin = authentication.isAuthenticated(request);
			url = isLogin ? mainUrl : loginUrl;
		}
		return new ModelAndView("forward:" + url);
	}

}

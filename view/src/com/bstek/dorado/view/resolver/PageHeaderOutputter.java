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
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Set;

import org.apache.commons.lang.StringEscapeUtils;
import org.apache.commons.lang.StringUtils;

import com.bstek.dorado.common.ClientType;
import com.bstek.dorado.core.Configure;
import com.bstek.dorado.core.Constants;
import com.bstek.dorado.core.resource.LocaleResolver;
import com.bstek.dorado.data.variant.VariantUtils;
import com.bstek.dorado.view.View;
import com.bstek.dorado.view.config.attachment.AttachedResourceManager;
import com.bstek.dorado.view.config.attachment.JavaScriptContent;
import com.bstek.dorado.view.output.OutputContext;
import com.bstek.dorado.view.output.Outputter;
import com.bstek.dorado.web.DoradoContext;
import com.bstek.dorado.web.resolver.CacheBusterUtils;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2011-1-26
 */
public class PageHeaderOutputter implements Outputter {
	private Outputter topViewOutputter;
	private LocaleResolver localeResolver;
	private AttachedResourceManager javaScriptResourceManager;
	private AttachedResourceManager styleSheetResourceManager;
	private SkinSettingManager skinSettingManager;
	private SkinResolver skinResolver;
	private List<ClientSettingsOutputter> clientSettingsOutputters = new ArrayList<ClientSettingsOutputter>();

	public PageHeaderOutputter() {
		addClientSettingsOutputter(new DefaultClientSettingsOutputter());
	}

	public void setTopViewOutputter(Outputter topViewOutputter) {
		this.topViewOutputter = topViewOutputter;
	}

	/**
	 * 设置用于确定国际化区域、语种信息的处理器。
	 */
	public void setLocaleResolver(LocaleResolver localeResolver) {
		this.localeResolver = localeResolver;
	}

	public void setJavaScriptResourceManager(
			AttachedResourceManager javaScriptResourceManager) {
		this.javaScriptResourceManager = javaScriptResourceManager;
	}

	public void setStyleSheetResourceManager(
			AttachedResourceManager styleSheetResourceManager) {
		this.styleSheetResourceManager = styleSheetResourceManager;
	}

	public void setSkinSettingManager(SkinSettingManager skinSettingManager) {
		this.skinSettingManager = skinSettingManager;
	}

	public void setSkinResolver(SkinResolver skinResolver) {
		this.skinResolver = skinResolver;
	}

	public void addClientSettingsOutputter(
			ClientSettingsOutputter clientSettingsOutputter) {
		clientSettingsOutputters.add(clientSettingsOutputter);
	}

	protected String getBasePackageNames(DoradoContext context, int clientType,
			String skin) throws Exception {
		String clientTypeName = ClientType.toString(clientType);

		StringBuffer buf = new StringBuffer(12);
		buf.append(clientTypeName).append("-support,");
		buf.append("widget");

		SkinSetting skinSetting = skinSettingManager.getSkinSetting(context,
				skin);
		if (skinSetting != null) {
			String dependedPackages = skinSetting.getDependedPackages();
			if (StringUtils.isNotEmpty(dependedPackages)) {
				buf.append(',').append(dependedPackages);
			}

		}

		return buf.toString();
	}

	public void output(Object object, OutputContext context) throws Exception {
		DoradoContext doradoContext = DoradoContext.getCurrent();
		View view = (View) object;

		String skin = skinResolver.determineSkin(doradoContext, view);
		doradoContext.setAttribute("view.skin", skin);

		int currentClientType = VariantUtils.toInt(doradoContext
				.getAttribute(ClientType.CURRENT_CLIENT_TYPE_KEY));
		if (currentClientType == 0) {
			currentClientType = ClientType.DESKTOP;
		}

		Writer writer = context.getWriter();

		writer.append(
				"<meta http-equiv=\"Content-Type\" content=\"text/html; charset=")
				.append(Constants.DEFAULT_CHARSET).append("\" />\n");

		if (StringUtils.isNotEmpty(view.getTitle())) {
			writer.append("<title>")
					.append(StringEscapeUtils.escapeHtml(view.getTitle()))
					.append("</title>\n");
		}

		Locale locale = localeResolver.resolveLocale();
		String contextPath = Configure.getString("web.contextPath");
		if (StringUtils.isEmpty(contextPath)) {
			contextPath = DoradoContext.getAttachedRequest().getContextPath();
		}
		writer.append(
				"<script language=\"javascript\" type=\"text/javascript\" charset=\"UTF-8\" src=\"")
				.append(contextPath)
				.append("/dorado/client/boot.dpkg?clientType=")
				.append(ClientType.toString(currentClientType))
				.append("&skin=")
				.append(skin)
				.append("&cacheBuster=")
				.append(CacheBusterUtils
						.getCacheBuster((locale != null) ? locale.toString()
								: null))
				.append("\"></script>\n")
				.append("<script language=\"javascript\" type=\"text/javascript\">\n");

		writer.append("window.$setting={\n");
		for (ClientSettingsOutputter clientSettingsOutputter : clientSettingsOutputters) {
			clientSettingsOutputter.output(writer);
		}
		writer.append("\n};\n");

		writer.append("$import(\"")
				.append(getBasePackageNames(doradoContext, currentClientType,
						skin))
				.append("\");\n</script>\n")
				.append("<script language=\"javascript\" type=\"text/javascript\">\n");
		topViewOutputter.output(view, context);
		writer.append("</script>\n");

		Set<Object> javaScriptContents = context.getJavaScriptContents();
		if (javaScriptContents != null && !javaScriptContents.isEmpty()) {
			writer.append("<script language=\"javascript\" type=\"text/javascript\">\n");
			for (Object content : javaScriptContents) {
				if (content instanceof JavaScriptContent
						&& !((JavaScriptContent) content).getIsController()) {
					javaScriptResourceManager.outputContent(context, content);
				}
				writer.append('\n');
			}
			writer.append("</script>\n");
		}

		Set<Object> styleSheetContents = context.getStyleSheetContents();
		if (styleSheetContents != null && !styleSheetContents.isEmpty()) {
			writer.append("<style type=\"text/css\">\n");
			for (Object content : styleSheetContents) {
				styleSheetResourceManager.outputContent(context, content);
				writer.append('\n');
			}
			writer.append("</style>\n");
		}
	}
}

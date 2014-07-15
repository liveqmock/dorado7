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

import java.util.regex.Pattern;

import org.apache.commons.lang.StringUtils;

import com.bstek.dorado.common.ClientType;
import com.bstek.dorado.data.variant.VariantUtils;
import com.bstek.dorado.view.View;
import com.bstek.dorado.web.DoradoContext;
import com.bstek.dorado.web.WebConfigure;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2014-3-2
 */
public class DefaultSkinResolver implements SkinResolver {
	private final static String DEFAULT_SKIN = "default";
	private final static String MSIE = "MSIE";
	private final static String CHROME_FRAME = "chromeframe";
	private final static Pattern MSIE_VERSION_PATTERN = Pattern
			.compile("^.*?MSIE\\s+(\\d+).*$");

	private SkinSettingManager skinSettingManager;

	public void setSkinSettingManager(SkinSettingManager skinSettingManager) {
		this.skinSettingManager = skinSettingManager;
	}

	protected String doDetermineSkin(DoradoContext context, String skins)
			throws Exception {
		int currentClientType = VariantUtils.toInt(context
				.getAttribute(ClientType.CURRENT_CLIENT_TYPE_KEY));
		boolean isIE = false, isIE6 = false, isOldIE = false;
		String ieVersion = null;
		if (currentClientType == 0) {
			String ua = context.getRequest().getHeader("User-Agent");
			if (ua.indexOf(CHROME_FRAME) < 0) {
				isIE = (ua != null && ua.indexOf(MSIE) != -1);
				if (isIE) {
					ieVersion = MSIE_VERSION_PATTERN.matcher(ua).replaceAll(
							"$1");
					if (StringUtils.isNotEmpty(ieVersion) && ieVersion.length() == 1) {
						if ("9".compareTo(ieVersion) > 0) {
							isOldIE = true;
							if ("7".compareTo(ieVersion) > 0) {
								isIE6 = true;
							}
						}
					}
				}
			}
		}

		if (skins != null) {
			skins += (',' + DEFAULT_SKIN);
		} else {
			skins = DEFAULT_SKIN;
		}

		String realSkin = null;
		String[] skinArray = StringUtils.split(skins, ',');
		for (String skin : skinArray) {
			SkinSetting skinSetting;
			if (currentClientType != 0) {
				String tempSkin = skin + '.'
						+ ClientType.toString(currentClientType);

				skinSetting = skinSettingManager.getSkinSetting(context,
						tempSkin);
				if (skinSetting != null) {
					if (ClientType.supports(skinSetting.getClientTypes(),
							currentClientType)) {
						realSkin = tempSkin;
						break;
					}
				}
			}

			if (isIE6) {
				String tempSkin = skin + ".ie6";

				skinSetting = skinSettingManager.getSkinSetting(context,
						tempSkin);
				if (skinSetting != null) {
					String skinUserAgent = skinSetting.getUserAgent();
					if (StringUtils.isEmpty(skinUserAgent)
							|| skinUserAgent.indexOf("-ie") < 0) {
						realSkin = tempSkin;
						break;
					}
				}
			}

			skinSetting = skinSettingManager.getSkinSetting(context, skin);
			if (skinSetting != null) {
				if (currentClientType != 0) {
					if (!ClientType.supports(skinSetting.getClientTypes(),
							currentClientType)) {
						break;
					}
				}
				if (isOldIE) {
					String skinUserAgent = skinSetting.getUserAgent();
					if (StringUtils.isNotEmpty(skinUserAgent)) {
						int i = skinUserAgent.indexOf("-ie");
						if (i >= 0) {
							i += 3;
							String version = "";
							int len = skinUserAgent.length();
							while (i < len) {
								char c = skinUserAgent.charAt(i);
								i++;
								if (c >= '0' && c <= '9' || c == '.') {
									version += c;
								} else {
									break;
								}
							}

							if (ieVersion.compareTo(version) <= 0) {
								continue;
							}
						}
					}
				}
				realSkin = skin;
				break;
			}
		}

		if (realSkin == null) {
			realSkin = DEFAULT_SKIN;
			if (isOldIE) {
				realSkin += ".ie6";
			} else if (currentClientType > ClientType.DESKTOP) {
				realSkin += '.' + ClientType.toString(currentClientType);
			}
		}
		return realSkin;
	}

	public String determineSkin(DoradoContext context, View view)
			throws Exception {
		String skins = view.getSkin();
		if (StringUtils.isEmpty(skins)) {
			skins = WebConfigure.getString("view.skin");
		}
		return doDetermineSkin(context, skins);
	}

}

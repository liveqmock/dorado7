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

import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;

import org.apache.commons.beanutils.BeanUtils;
import org.apache.commons.lang.StringUtils;
import org.codehaus.jackson.map.ObjectMapper;
import org.codehaus.jackson.type.TypeReference;

import com.bstek.dorado.common.ClientType;
import com.bstek.dorado.core.Configure;
import com.bstek.dorado.core.io.Resource;
import com.bstek.dorado.data.variant.VariantUtils;
import com.bstek.dorado.util.PathUtils;
import com.bstek.dorado.web.DoradoContext;
import com.bstek.dorado.web.WebConfigure;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2014-2-2
 */
public class SkinSettingManager {
	private static final String SKINS = "skins";
	private static final String META_INFO_FILE = "meta-info.json";
	private static final String RESOURCE_PREFIX_DELIM = ";,\n\r";
	private static final SkinSetting NULL_SKIN_SETTING = new SkinSetting();

	private ObjectMapper objectMapper = new ObjectMapper();
	private Map<String, SkinSetting> skinSettingMap = new HashMap<String, SkinSetting>();

	protected synchronized SkinSetting doGetSkinSetting(DoradoContext context,
			String skin) throws Exception {
		SkinSetting skinSetting = skinSettingMap.get(skin);
		if (skinSetting == null) {
			boolean shouldCache = true;
			String metaInfoPath = null;
			String customSkinPath = WebConfigure.getString("view.skin." + skin);
			if (StringUtils.isNotEmpty(customSkinPath)) {
				metaInfoPath = PathUtils.concatPath(customSkinPath,
						META_INFO_FILE);
			} else {
				String libraryRoot = Configure.getString("view.libraryRoot");

				if ("debug".equals(Configure.getString("core.runMode"))
						&& libraryRoot != null
						&& StringUtils.indexOfAny(libraryRoot,
								RESOURCE_PREFIX_DELIM) >= 0) {
					String[] roots = StringUtils.split(libraryRoot,
							RESOURCE_PREFIX_DELIM);
					for (String root : roots) {
						String tempPath = PathUtils.concatPath(root, SKINS,
								skin, META_INFO_FILE);
						if (context.getResource(tempPath).exists()) {
							metaInfoPath = tempPath;
							break;
						}
					}
				} else {
					metaInfoPath = PathUtils.concatPath(libraryRoot, SKINS,
							skin, META_INFO_FILE);
				}
			}

			if (StringUtils.isNotEmpty(metaInfoPath)) {
				Resource metaInfoResource = context.getResource(metaInfoPath);
				if (metaInfoResource.exists()) {
					InputStream in = metaInfoResource.getInputStream();
					try {
						Map<String, Object> map = objectMapper.readValue(in,
								new TypeReference<Map<String, Object>>() {
								});

						if (VariantUtils.toBoolean(map.remove("tempSkin"))) {
							shouldCache = false;
						}

						skinSetting = new SkinSetting();

						String clientTypes = (String) map.remove("clientType");
						if (StringUtils.isNotEmpty(clientTypes)) {
							skinSetting.setClientTypes(ClientType
									.parseClientTypes(clientTypes));
						} else {
							skinSetting.setClientTypes(ClientType.DESKTOP);
						}

						BeanUtils.copyProperties(skinSetting, map);
					} finally {
						in.close();
					}
				}
			}

			if (shouldCache) {
				if (skinSetting == null) {
					skinSettingMap.put(skin, NULL_SKIN_SETTING);
				} else {
					skinSettingMap.put(skin, skinSetting);
				}
			}
		} else if (skinSetting == NULL_SKIN_SETTING) {
			skinSetting = null;
		}
		return skinSetting;
	}

	public synchronized SkinSetting getSkinSetting(DoradoContext context,
			String skin) throws Exception {
		return doGetSkinSetting(context, skin);
	}
}

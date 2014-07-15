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

import java.io.FileNotFoundException;
import java.util.HashSet;
import java.util.Set;

import org.apache.commons.lang.StringUtils;

import com.bstek.dorado.core.io.Resource;
import com.bstek.dorado.util.PathUtils;
import com.bstek.dorado.web.DoradoContext;
import com.bstek.dorado.web.WebConfigure;

public class LibraryFileResolver extends PackageFileResolver {
	private static final String I18N_PREFIX = "resources/i18n/";
	private static final String SKIN_URI_PREFIX = "/dorado/client/skins/";

	@Deprecated
	private static final String INHERENT_SKIN = "inherent";

	private static final String DEFAULT_SKIN = "default";
	private static final String DEFAULT_SKIN_PREFIX = DEFAULT_SKIN + '.';
	private static final String CURRENT_SKIN = "~current";
	private static final String CURRENT_SKIN_PREFIX = "skins/" + CURRENT_SKIN
			+ '/';

	private Set<String> absolutePaths = new HashSet<String>();

	private String getDefaultPlatformSkin(String currentSkin) {
		int i = currentSkin.indexOf('.');
		if (i > 0) {
			return DEFAULT_SKIN_PREFIX
					+ StringUtils.substringAfter(currentSkin, ".");
		} else {
			return DEFAULT_SKIN;
		}
	}

	@Override
	protected Resource[] doGetResourcesByFileName(DoradoContext context,
			String resourcePrefix, String fileName, String resourceSuffix)
			throws Exception {
		return doGetResourcesByFileName(context, resourcePrefix, fileName,
				resourceSuffix, false);
	}

	protected Resource[] doGetResourcesByFileName(DoradoContext context,
			String resourcePrefix, String fileName, String resourceSuffix,
			boolean dontRecordAbsolutePath) throws Exception {
		if (StringUtils.isNotEmpty(resourcePrefix)) {
			Resource[] resources = null;
			if (absolutePaths.contains(fileName + resourceSuffix)) {
				resources = super.getResourcesByFileName(context, null,
						fileName, resourceSuffix);
			} else {
				resources = super.getResourcesByFileName(context,
						resourcePrefix, fileName, resourceSuffix);
				Resource resource = resources[0];
				if (!resource.exists()) {
					if (!dontRecordAbsolutePath) {
						absolutePaths.add(fileName + resourceSuffix);
					}
					resources = super.getResourcesByFileName(context, null,
							fileName, resourceSuffix);
				}
			}
			return resources;
		} else {
			return super.getResourcesByFileName(context, resourcePrefix,
					fileName, resourceSuffix);
		}
	}

	@Override
	protected Resource[] getResourcesByFileInfo(DoradoContext context,
			FileInfo fileInfo, String resourcePrefix, String resourceSuffix)
			throws Exception {
		String fileName = fileInfo.getFileName();
		if (JAVASCRIPT_SUFFIX.equals(resourceSuffix)) {
			if (fileName.indexOf(I18N_PREFIX) >= 0
					|| I18N.equals(fileInfo.getFileType())) { // 国际化资源
				return getI18NResources(context, fileInfo, resourcePrefix,
						resourceSuffix);
			} else {
				return getJavaScriptResources(context, fileInfo,
						resourcePrefix, resourceSuffix);
			}
		} else if (STYLESHEET_SUFFIX.equals(resourceSuffix)) {
			return getStyleSheetResources(context, fileInfo, resourcePrefix,
					resourceSuffix);

		} else {
			return doGetResourcesByFileName(context, resourcePrefix, fileName,
					resourceSuffix);
		}
	}

	@Override
	protected Resource doGetI18NResource(DoradoContext context,
			String resourcePrefix, String fileName, String localeSuffix)
			throws Exception, FileNotFoundException {
		Resource resource = doGetResourcesByFileName(context, resourcePrefix,
				fileName, localeSuffix + I18N_FILE_SUFFIX, true)[0];
		if (resource == null || !resource.exists()) {
			if (StringUtils.isNotEmpty(localeSuffix)) {
				resource = doGetResourcesByFileName(context, resourcePrefix,
						fileName, I18N_FILE_SUFFIX)[0];
				if (resource == null || !resource.exists()) {
					throw new FileNotFoundException("File ["
							+ PathUtils.concatPath(resourcePrefix, fileName)
							+ localeSuffix + I18N_FILE_SUFFIX + "] or ["
							+ PathUtils.concatPath(resourcePrefix, fileName)
							+ I18N_FILE_SUFFIX + "] not found.");
				}
			} else {
				throw new FileNotFoundException("File ["
						+ PathUtils.concatPath(resourcePrefix, fileName)
						+ I18N_FILE_SUFFIX + "] not found.");
			}
		}
		return resource;
	}

	@Override
	protected Resource[] getJavaScriptResources(DoradoContext context,
			FileInfo fileInfo, String resourcePrefix, String resourceSuffix)
			throws Exception {
		String fileName = fileInfo.getFileName();
		boolean useMinJs = WebConfigure
				.getBoolean("view.useMinifiedJavaScript");
		boolean isSkinFile = fileName.startsWith(CURRENT_SKIN_PREFIX);
		String skin = null;
		if (isSkinFile) {
			skin = context.getRequest().getParameter("skin");
		}

		Resource[] resources = null;
		if (isSkinFile) {
			String customSkinPath = WebConfigure.getString("view.skin." + skin);
			if (StringUtils.isNotEmpty(customSkinPath)) {
				resources = doGetJavaScriptResources(context, customSkinPath,
						resourceSuffix,
						fileName.substring(CURRENT_SKIN_PREFIX.length()),
						useMinJs);
			} else {
				resources = doGetJavaScriptResources(context, resourcePrefix,
						resourceSuffix, fileName.replace(CURRENT_SKIN, skin),
						useMinJs);
			}
		} else {
			resources = doGetJavaScriptResources(context, resourcePrefix,
					resourceSuffix, fileName, useMinJs);
		}
		if (resources.length == 0 || !resources[0].exists()) {
			resources = null;
		}

		if (isSkinFile && resources == null) {
			if (!skin.equals(DEFAULT_SKIN)
					&& !skin.startsWith(DEFAULT_SKIN_PREFIX)) {
				String defaultPlatformSkin = getDefaultPlatformSkin(skin);
				fileName = fileInfo.getFileName().replace(CURRENT_SKIN,
						defaultPlatformSkin);
				resources = doGetJavaScriptResources(context, resourcePrefix,
						resourceSuffix, fileName, useMinJs);
				if (resources.length == 0 || !resources[0].exists()) {
					resources = null;
				}
			}
		}
		return resources;
	}

	private Resource[] doGetJavaScriptResources(DoradoContext context,
			String resourcePrefix, String resourceSuffix, String fileName,
			boolean useMinJs) throws Exception {
		Resource[] resources = null;
		if (useMinJs) {
			resources = doGetResourcesByFileName(context, resourcePrefix,
					fileName, MIN_JAVASCRIPT_SUFFIX);
			if (resources.length == 0 || !resources[0].exists()) {
				resources = null;
			}
		}
		if (resources == null) {
			resources = doGetResourcesByFileName(context, resourcePrefix,
					fileName, resourceSuffix);
		}
		return resources;
	}

	@Override
	protected Resource[] getStyleSheetResources(DoradoContext context,
			FileInfo fileInfo, String resourcePrefix, String resourceSuffix)
			throws Exception {
		String uri = context.getRequest().getRequestURI();
		int i = uri.indexOf(SKIN_URI_PREFIX);
		if (i >= 0) {
			String fileName = fileInfo.getFileName();
			String skin, subUri;

			subUri = uri.substring(i + SKIN_URI_PREFIX.length());
			i = subUri.indexOf(PathUtils.PATH_DELIM);
			if (i > 0) {
				skin = subUri.substring(0, i);

				boolean useMinCss = WebConfigure
						.getBoolean("view.useMinifiedStyleSheet");
				String customSkinPath = WebConfigure.getString("view.skin."
						+ skin);
				String subSkinPath = fileName.substring(CURRENT_SKIN_PREFIX
						.length());

				return doGetStyleSheetResources(context, skin, resourcePrefix,
						fileName, customSkinPath, subSkinPath, resourceSuffix,
						useMinCss);
			} else {
				return null;
			}
		} else {
			return super.getStyleSheetResources(context, fileInfo,
					resourcePrefix, resourceSuffix);
		}
	}

	private Resource[] doGetStyleSheetResources(DoradoContext context,
			String skin, String resourcePrefix, String fileName,
			String customSkinPath, String subSkinPath, String resourceSuffix,
			boolean useMinCss) throws Exception, FileNotFoundException {
		Resource[] resources;
		String originFileName = fileName;
		if (originFileName.indexOf(CURRENT_SKIN) >= 0) {
			fileName = originFileName.replace(CURRENT_SKIN, INHERENT_SKIN);
			Resource[] inherentResources = null;
			if (useMinCss) {
				inherentResources = doGetResourcesByFileName(context,
						resourcePrefix, fileName, MIN_STYLESHEET_SUFFIX);
				if (inherentResources.length == 0
						|| !inherentResources[0].exists()) {
					inherentResources = null;
				}
			}
			if (inherentResources == null) {
				inherentResources = doGetResourcesByFileName(context,
						resourcePrefix, fileName, resourceSuffix);
			}

			Resource[] concreteResources = null;
			if (StringUtils.isEmpty(customSkinPath)) {
				fileName = originFileName.replace(CURRENT_SKIN, skin);
				if (useMinCss) {
					concreteResources = doGetResourcesByFileName(context,
							resourcePrefix, fileName, MIN_STYLESHEET_SUFFIX);
					if (concreteResources.length == 0
							|| !concreteResources[0].exists()) {
						concreteResources = null;
					}
				}
				if (concreteResources == null) {
					concreteResources = doGetResourcesByFileName(context,
							resourcePrefix, fileName, resourceSuffix);
				}
			} else {
				if (useMinCss) {
					concreteResources = doGetResourcesByFileName(context,
							customSkinPath, subSkinPath, MIN_STYLESHEET_SUFFIX);
					if (concreteResources.length == 0
							|| !concreteResources[0].exists()) {
						concreteResources = null;
					}
				}
				if (concreteResources == null) {
					concreteResources = doGetResourcesByFileName(context,
							customSkinPath, subSkinPath, resourceSuffix);
				}
			}

			Resource inherentResource = null;
			if (inherentResources.length > 0 && inherentResources[0].exists()) {
				inherentResource = inherentResources[0];
			}
			Resource concreteResource = null;
			if (concreteResources.length > 0 && concreteResources[0].exists()) {
				concreteResource = concreteResources[0];
			}

			if (!skin.equals(DEFAULT_SKIN) && concreteResource == null) {
				boolean shouldTryDefaultSkin = true;
				if (!skin.startsWith(DEFAULT_SKIN_PREFIX)) {
					String defaultPlatformSkin = getDefaultPlatformSkin(skin);
					fileName = originFileName.replace(CURRENT_SKIN,
							defaultPlatformSkin);
					Resource[] defaultResources = null;
					if (useMinCss) {
						defaultResources = doGetResourcesByFileName(context,
								resourcePrefix, fileName, MIN_STYLESHEET_SUFFIX);
						if (defaultResources.length == 0
								|| !defaultResources[0].exists()) {
							defaultResources = null;
						}
					}
					if (defaultResources == null) {
						defaultResources = doGetResourcesByFileName(context,
								resourcePrefix, fileName, resourceSuffix);
					}
					if (defaultResources.length > 0
							&& defaultResources[0].exists()) {
						shouldTryDefaultSkin = false;
						concreteResource = defaultResources[0];
					}
				}

				if (shouldTryDefaultSkin) {
					fileName = originFileName.replace(CURRENT_SKIN,
							DEFAULT_SKIN);
					Resource[] defaultResources = null;
					if (useMinCss) {
						defaultResources = doGetResourcesByFileName(context,
								resourcePrefix, fileName, MIN_STYLESHEET_SUFFIX);
						if (defaultResources.length == 0
								|| !defaultResources[0].exists()) {
							defaultResources = null;
						}
					}
					if (defaultResources == null) {
						defaultResources = doGetResourcesByFileName(context,
								resourcePrefix, fileName, resourceSuffix);
					}
					if (defaultResources.length > 0
							&& defaultResources[0].exists()) {
						concreteResource = defaultResources[0];
					}
				}
			}

			if (concreteResource == null) {
				throw new FileNotFoundException(
						"Can not found a valid css resource for [" + fileName
								+ "].");
			}

			if (inherentResource != null) {
				resources = new Resource[] { inherentResource, concreteResource };
			} else {
				resources = new Resource[] { concreteResource };
			}
		} else {
			Resource[] minCssResources = null, cssRresources = null;
			if (useMinCss) {
				minCssResources = doGetResourcesByFileName(context,
						resourcePrefix, fileName, MIN_STYLESHEET_SUFFIX);
				if (minCssResources.length == 0 || !minCssResources[0].exists()) {
					cssRresources = doGetResourcesByFileName(context,
							resourcePrefix, fileName, resourceSuffix);
					if (cssRresources.length == 0 || !cssRresources[0].exists()) {
						throw new FileNotFoundException("Neither ["
								+ PathUtils.concatPath(resourcePrefix,
										fileName, resourceSuffix)
								+ "] nor ["
								+ PathUtils.concatPath(resourcePrefix,
										fileName, MIN_STYLESHEET_SUFFIX)
								+ "] could be found.");
					}
				} else {
					cssRresources = minCssResources;
				}
			} else {
				cssRresources = doGetResourcesByFileName(context,
						resourcePrefix, fileName, resourceSuffix);
				if (cssRresources.length == 0 || !cssRresources[0].exists()) {
					throw new FileNotFoundException("File ["
							+ PathUtils.concatPath(resourcePrefix, fileName,
									resourceSuffix) + "] not found.");
				}
			}
			resources = cssRresources;
		}
		return resources;
	}
}

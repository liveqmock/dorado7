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

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStreamWriter;
import java.io.Writer;
import java.net.URL;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

import javax.servlet.http.HttpServletRequest;

import org.apache.commons.beanutils.PropertyUtils;
import org.apache.commons.lang.StringUtils;

import com.bstek.dorado.common.ClientType;
import com.bstek.dorado.core.Configure;
import com.bstek.dorado.core.io.FileResource;
import com.bstek.dorado.core.io.Resource;
import com.bstek.dorado.core.resource.LocaleResolver;
import com.bstek.dorado.util.PathUtils;
import com.bstek.dorado.util.TempFileUtils;
import com.bstek.dorado.view.loader.Package;
import com.bstek.dorado.view.loader.PackagesConfig;
import com.bstek.dorado.view.loader.PackagesConfigManager;
import com.bstek.dorado.view.loader.Pattern;
import com.bstek.dorado.view.output.JsonBuilder;
import com.bstek.dorado.view.output.OutputUtils;
import com.bstek.dorado.web.DoradoContext;
import com.bstek.dorado.web.WebConfigure;
import com.bstek.dorado.web.resolver.CacheBusterUtils;
import com.bstek.dorado.web.resolver.ResourcesWrapper;
import com.bstek.dorado.web.resolver.WebFileResolver;

/**
 * 用于向客户端输出初始启动信息的处理器。
 * 
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Sep 26, 2008
 */
public class BootPackagesResolver extends WebFileResolver {
	private static final String JAVASCRIPT_SUFFIX = ".js";
	private static final String MIN_JAVASCRIPT_SUFFIX = ".min.js";
	private static final String CLIENT_PACKAGES_CONFIG = "$packagesConfig";
	private PackagesConfigManager packagesConfigManager;
	private LocaleResolver localeResolver;
	private String bootFile;

	private static class PackageResource implements Resource {
		protected Resource adapteeResource;
		private PackagesConfig packagesConfig;
		private String skin;
		private int clientType;
		private Locale locale;

		public PackageResource(PackagesConfig packagesConfig, String skin,
				int clientType, Locale locale) throws Exception {
			this.packagesConfig = packagesConfig;
			this.clientType = clientType;
			this.skin = skin;
			this.locale = locale;

			if (TempFileUtils.isSupportsTempFile()) {
				StringBuffer buf = new StringBuffer("packages-config-");
				buf.append(ClientType.toString(clientType)).append('-')
						.append(skin).append('-');
				if (WebConfigure.getBoolean("view.useMinifiedJavaScript")) {
					buf.append("min-");
				}
				File file = TempFileUtils.createTempFile(buf.toString(),
						JAVASCRIPT_SUFFIX);

				FileOutputStream fos = new FileOutputStream(file);
				Writer writer = new OutputStreamWriter(fos);
				try {
					outputPackagesConfig(writer, packagesConfig, clientType);
				} finally {
					writer.flush();
					writer.close();
					fos.flush();
					fos.close();
				}

				adapteeResource = new FileResource(file);
			}
		}

		/**
		 * 向客户端输出资源包的配置信息。
		 * 
		 * @throws IOException
		 */
		protected void outputPackagesConfig(Writer writer,
				PackagesConfig packagesConfig, int targetClientType)
				throws Exception {
			String contextPath = Configure.getString("web.contextPath");
			if (StringUtils.isEmpty(contextPath)) {
				contextPath = DoradoContext.getAttachedRequest()
						.getContextPath();
			}
			writer.append(CLIENT_PACKAGES_CONFIG + ".contextPath=\""
					+ contextPath + "\";\n");

			outputProperty(writer, CLIENT_PACKAGES_CONFIG, packagesConfig,
					"defaultCharset", null);
			outputProperty(writer, CLIENT_PACKAGES_CONFIG, packagesConfig,
					"defaultContentType", null);

			JsonBuilder jsonBuilder = new JsonBuilder(writer);
			jsonBuilder.setPrettyFormat(Configure
					.getBoolean("view.outputPrettyJson"));
			Map<String, Pattern> patterns = packagesConfig.getPatterns();
			if (patterns != null) {
				writer.append(CLIENT_PACKAGES_CONFIG).append(".patterns=");
				jsonBuilder.object();
				for (Map.Entry<String, Pattern> entry : patterns.entrySet()) {
					jsonBuilder.key(entry.getKey());
					outputPattern(jsonBuilder, entry.getValue(), skin);
				}
				jsonBuilder.endObject();
				writer.append(";\n");
			}

			jsonBuilder = new JsonBuilder(writer);
			jsonBuilder.setPrettyFormat(Configure
					.getBoolean("view.outputPrettyJson"));
			Map<String, Package> packages = packagesConfig.getPackages();
			if (packages != null) {
				writer.append(CLIENT_PACKAGES_CONFIG).append(".packages=");
				jsonBuilder.object();
				for (Map.Entry<String, Package> entry : packages.entrySet()) {
					Package pkg = entry.getValue();
					if (pkg.getClientType() != 0) {
						if (!ClientType.supports(pkg.getClientType(),
								targetClientType)) {
							continue;
						}
					}
					jsonBuilder.key(entry.getKey());
					outputPackage(jsonBuilder, packagesConfig, pkg,
							targetClientType);
				}
				jsonBuilder.endObject();
				writer.append(";\n");
			}
		}

		protected void outputPattern(JsonBuilder jsonBuilder, Pattern pattern,
				String skin) throws Exception {
			jsonBuilder.object();
			if (!OutputUtils.isEscapeValue(pattern.getContentType())) {
				jsonBuilder.key("contentType").value(pattern.getContentType());
			}
			if (!OutputUtils.isEscapeValue(pattern.getCharset())) {
				jsonBuilder.key("charset").value(pattern.getCharset());
			}

			StringBuffer parameters = new StringBuffer();
			String patternName = pattern.getName();
			if (patternName.equals("dorado-js")) {
				parameters.append("skin=").append(skin).append('&');
			}
			parameters.append("cacheBuster=").append(
					CacheBusterUtils.getCacheBuster((locale != null) ? locale
							.toString() : null));

			String baseUri = pattern.getBaseUri();
			if (baseUri != null && patternName.equals("dorado-css")) {
				baseUri = baseUri.replace("~current", skin);
			}
			jsonBuilder.key("url").value(
					PathUtils.concatPath(baseUri, "${fileName}.dpkg?"
							+ parameters));
			if (pattern.isMergeRequests()) {
				jsonBuilder.escapeableKey("mergeRequests").value(
						pattern.isMergeRequests());
			}
			jsonBuilder.endObject();
		}

		protected void outputPackage(JsonBuilder jsonBuilder,
				PackagesConfig packagesConfig, Package pkg, int targetClientType)
				throws Exception {
			jsonBuilder.object();
			if (!OutputUtils.isEscapeValue(pkg.getContentType())) {
				jsonBuilder.key("contentType").value(pkg.getContentType());
			}
			if (!OutputUtils.isEscapeValue(pkg.getCharset())) {
				jsonBuilder.key("charset").value(pkg.getCharset());
			}
			if (!OutputUtils.isEscapeValue(pkg.getPattern())) {
				jsonBuilder.key("pattern").value(pkg.getPattern());
			}
			Set<String> depends = pkg.getDepends();
			if (depends != null && depends.size() > 0) {
				Map<String, Package> packageMap = packagesConfig.getPackages();
				jsonBuilder.key("depends").array();
				for (String depend : depends) {
					Package dependPkg = packageMap.get(depend);
					if (dependPkg.getClientType() != 0) {
						if (!ClientType.supports(dependPkg.getClientType(),
								targetClientType)) {
							continue;
						}
					}
					jsonBuilder.value(depend);
				}
				jsonBuilder.endArray();
			}
			if (!pkg.isMergeRequests()
					&& !OutputUtils.isEscapeValue(pkg.getFileNames())) {
				jsonBuilder.key("fileNames").value(pkg.getFileNames());
			}
			jsonBuilder.endObject();
		}

		private void outputProperty(Writer writer, String owner, Object object,
				String property, Object escapeValue) throws Exception {
			Object value = PropertyUtils.getProperty(object, property);
			if (value == escapeValue
					|| (escapeValue != null && escapeValue.equals(value))) {
				return;
			}

			writer.append(owner).append('.').append(property).append('=');
			if (value == null) {
				writer.append("null");
			} else {
				writer.append("\"").append(value.toString()).append("\"");
			}
			writer.append(";\n");
		}

		public Resource createRelative(String relativePath) throws IOException {
			if (adapteeResource != null) {
				return adapteeResource.createRelative(relativePath);
			} else {
				throw new UnsupportedOperationException();
			}
		}

		public boolean exists() {
			return (adapteeResource != null) ? adapteeResource.exists() : true;
		}

		public String getDescription() {
			return (adapteeResource != null) ? adapteeResource.getDescription()
					: null;
		}

		public File getFile() throws IOException {
			return (adapteeResource != null) ? adapteeResource.getFile() : null;
		}

		public String getFilename() {
			return (adapteeResource != null) ? adapteeResource.getFilename()
					: null;
		}

		public InputStream getInputStream() throws IOException {
			if (TempFileUtils.isSupportsTempFile()) {
				return adapteeResource.getInputStream();
			} else {
				ByteArrayOutputStream baos = new ByteArrayOutputStream();
				Writer writer = new OutputStreamWriter(baos);
				try {
					outputPackagesConfig(writer, packagesConfig, clientType);
				} catch (IOException ex) {
					throw ex;
				} catch (Exception ex) {
					throw new IOException(ex);
				} finally {
					writer.flush();
					writer.close();
					baos.flush();
					baos.close();
				}

				return new ByteArrayInputStream(baos.toByteArray());
			}
		}

		public String getPath() {
			return (adapteeResource != null) ? adapteeResource.getPath() : null;
		}

		public long getTimestamp() throws IOException {
			return (adapteeResource != null) ? adapteeResource.getTimestamp()
					: 0L;
		}

		public URL getURL() throws IOException {
			return (adapteeResource != null) ? adapteeResource.getURL() : null;
		}
	}

	public BootPackagesResolver() {
		setUseResourcesCache(true);
	}

	/**
	 * 设置用于确定国际化区域、语种信息的处理器。
	 */
	public void setLocaleResolver(LocaleResolver localeResolver) {
		this.localeResolver = localeResolver;
	}

	public void setBootFile(String bootFile) {
		this.bootFile = bootFile;
	}

	@Override
	protected String getResourceCacheKey(HttpServletRequest request)
			throws Exception {
		StringBuffer buf = new StringBuffer(getRelativeRequestURI(request));
		buf.append('-').append(request.getParameter("clientType")).append('-')
				.append(request.getParameter("skin")).append('-')
				.append(Configure.getString("view.useMinifiedJavaScript"));
		return buf.toString();
	}

	/**
	 * 返回资源包配置的管理器。
	 * 
	 * @throws Exception
	 */
	protected PackagesConfigManager getPackagesConfigManager() throws Exception {
		if (packagesConfigManager == null) {
			DoradoContext context = DoradoContext.getCurrent();
			packagesConfigManager = (PackagesConfigManager) context
					.getServiceBean("packagesConfigManager");
		}
		return packagesConfigManager;
	}

	@Override
	protected Resource[] getResourcesByFileName(DoradoContext context,
			String resourcePrefix, String fileName, String resourceSuffix)
			throws Exception {
		if (WebConfigure.getBoolean("view.useMinifiedJavaScript")) {
			resourceSuffix = MIN_JAVASCRIPT_SUFFIX;
		}
		return super.getResourcesByFileName(context, resourcePrefix, fileName,
				resourceSuffix);
	}

	@Override
	protected ResourcesWrapper createResourcesWrapper(
			HttpServletRequest request, DoradoContext context) throws Exception {
		String clientTypeText = request.getParameter("clientType");
		int clientType = ClientType.parseClientTypes(clientTypeText);
		if (clientType == 0) {
			clientType = ClientType.DESKTOP;
		}
		String skin = request.getParameter("skin");
		
		StringBuffer buf = new StringBuffer("packages-config-");
		buf.append(ClientType.toString(clientType)).append('-').append(skin)
				.append('-');
		if (WebConfigure.getBoolean("view.useMinifiedJavaScript")) {
			buf.append("min-");
		}

		String resourcePrefix = getResourcePrefix();
		Resource[] bootResourceArray = getResourcesByFileName(context,
				resourcePrefix, bootFile, JAVASCRIPT_SUFFIX);

		Resource[] resourceArray = new Resource[bootResourceArray.length + 1];
		System.arraycopy(bootResourceArray, 0, resourceArray, 0,
				bootResourceArray.length);

		PackagesConfig packagesConfig = getPackagesConfigManager()
				.getPackagesConfig();
		Resource resource = new PackageResource(packagesConfig, skin,
				clientType, localeResolver.resolveLocale());
		resourceArray[bootResourceArray.length] = resource;

		ResourcesWrapper resourcesWrapper = new ResourcesWrapper(resourceArray,
				getResourceTypeManager().getResourceType(JAVASCRIPT_SUFFIX));
		resourcesWrapper.setReloadable(false);
		return resourcesWrapper;
	}
}

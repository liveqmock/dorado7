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

package com.bstek.dorado.web.resolver;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Hashtable;
import java.util.Locale;
import java.util.Map;
import java.util.SimpleTimeZone;
import java.util.zip.GZIPOutputStream;
import java.util.zip.ZipOutputStream;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.beans.BeansException;
import org.springframework.beans.factory.BeanFactory;
import org.springframework.beans.factory.BeanFactoryAware;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.web.servlet.ModelAndView;

import com.bstek.dorado.core.io.Resource;
import com.bstek.dorado.web.DoradoContext;

public abstract class AbstractWebFileResolver extends AbstractResolver
		implements BeanFactoryAware, InitializingBean {
	private static Log logger = LogFactory.getLog(WebFileResolver.class);

	private static final int BUFFER_SIZE = 1024 * 2;
	private static final int ONE_SECOND = 1000;
	private static final int MIN_RETRIEVE_LAST_MODIFIED_INTERVAL = ONE_SECOND * 10;
	private static final SimpleTimeZone GMT_TIME_ZONE = new SimpleTimeZone(0,
			"GMT");

	private static final ResourcesWrapper FILE_NOT_FOUND_RESOURCES_WRAPPER = new ResourcesWrapper(
			HttpServletResponse.SC_NOT_FOUND);
	private static final ResourcesWrapper FORBIDDEN_RESOURCES_WRAPPER = new ResourcesWrapper(
			HttpServletResponse.SC_FORBIDDEN);

	private BeanFactory beanFactory;
	private ResourceTypeManager resourceTypeManager;
	private Map<String, ResourcesWrapper> resourcesCache = new Hashtable<String, ResourcesWrapper>();
	private boolean useResourcesCache;
	private boolean checkResourceType;

	protected ResourceTypeManager getResourceTypeManager() {
		return resourceTypeManager;
	}

	public void setBeanFactory(BeanFactory beanFactory) throws BeansException {
		this.beanFactory = beanFactory;
	}

	public void afterPropertiesSet() throws Exception {
		resourceTypeManager = (ResourceTypeManager) beanFactory
				.getBean("dorado.resourceTypeManager");
	}

	protected String getResourceExtName(String path) {
		int i = path.lastIndexOf(".");
		if (i > 0 && i < path.length() - 1) {
			return path.substring(i).toLowerCase();
		}
		return "";
	}

	protected String getUriSuffix(HttpServletRequest request) {
		return getResourceExtName(request.getRequestURI());
	}

	protected boolean shouldCompress(ResourcesWrapper resourcesWrapper) {
		ResourceType resourceType = resourcesWrapper.getResourceType();
		return (resourceType != null) ? resourceType.isCompressible() : false;
	}

	public boolean isUseResourcesCache() {
		return useResourcesCache;
	}

	public void setUseResourcesCache(boolean useResourcesCache) {
		this.useResourcesCache = useResourcesCache;
	}

	public boolean isCheckResourceType() {
		return checkResourceType;
	}

	public void setCheckResourceType(boolean checkResourceType) {
		this.checkResourceType = checkResourceType;
	}

	protected String getContentType(ResourcesWrapper resourcesWrapper) {
		ResourceType resourceType = resourcesWrapper.getResourceType();
		return (resourceType != null) ? resourceType.getContentType()
				: HttpConstants.CONTENT_TYPE_OCTET_STREAM;
	}

	protected OutputStream getOutputStream(HttpServletRequest request,
			HttpServletResponse response, ResourcesWrapper resourcesWrapper)
			throws IOException {
		int encodingType = 0;
		String encoding = request.getHeader(HttpConstants.ACCEPT_ENCODING);
		if (encoding != null) {
			encodingType = (encoding.indexOf(HttpConstants.GZIP) >= 0) ? 1
					: (encoding.indexOf(HttpConstants.COMPRESS) >= 0 ? 2 : 0);
		}

		OutputStream out = response.getOutputStream();
		if (encodingType > 0 && shouldCompress(resourcesWrapper)) {
			try {
				if (encodingType == 1) {
					response.setHeader(HttpConstants.CONTENT_ENCODING,
							HttpConstants.GZIP);
					out = new GZIPOutputStream(out);
				} else if (encodingType == 2) {
					response.setHeader(HttpConstants.CONTENT_ENCODING,
							HttpConstants.COMPRESS);
					out = new ZipOutputStream(out);
				}
			} catch (IOException e) {
				// do nothing
			}
		}
		return out;
	}

	protected void outputFile(OutputStream out, Resource resource)
			throws IOException {
		InputStream in = resource.getInputStream();
		try {
			byte[] buffer = new byte[BUFFER_SIZE];
			int len = in.read(buffer);
			while (len != -1) {
				out.write(buffer, 0, len);
				len = in.read(buffer);
			}
		} catch (IOException e) {
			// do nothing
		} finally {
			in.close();
		}
	}

	protected ResourcesWrapper getResourcesWrapper(HttpServletRequest request,
			DoradoContext context) throws Exception {
		String cacheKey = getResourceCacheKey(request);
		ResourcesWrapper resourcesWrapper = null;
		boolean useResourcesCache = isUseResourcesCache();
		if (useResourcesCache && cacheKey != null) {
			resourcesWrapper = resourcesCache.get(cacheKey);
		}
		if (resourcesWrapper != null) {
			if (resourcesWrapper.isReloadable()
					&& System.currentTimeMillis()
							- resourcesWrapper.getLastAccessed() > MIN_RETRIEVE_LAST_MODIFIED_INTERVAL) {
				resourcesWrapper.updateLastModified();
			}
			resourcesWrapper.updateLastAccessed();
		} else {
			try {
				resourcesWrapper = createResourcesWrapper(request, context);
				if (checkResourceType
						&& resourcesWrapper.getResourceType() == null) {
					resourcesWrapper = FORBIDDEN_RESOURCES_WRAPPER;
				} else {
					Resource[] resources = resourcesWrapper.getResources();
					if (resources != null && resources.length > 0) {
						for (int i = 0; i < resources.length; i++) {
							Resource resource = resources[i];
							if (!resource.exists()) {
								throw new FileNotFoundException(resource
										+ " does not exist.");
							}
						}
					}
				}

				if (useResourcesCache && cacheKey != null
						&& resourcesWrapper.isCacheable()) {
					resourcesCache.put(cacheKey, resourcesWrapper);
				}
			} catch (FileNotFoundException e) {
				logger.error(e, e);
				resourcesWrapper = FILE_NOT_FOUND_RESOURCES_WRAPPER;
			} catch (IllegalAccessException e) {
				logger.error(e, e);
				resourcesWrapper = FORBIDDEN_RESOURCES_WRAPPER;
			}
		}
		if (resourcesWrapper == null) {
			resourcesWrapper = FILE_NOT_FOUND_RESOURCES_WRAPPER;
		}
		return resourcesWrapper;
	}

	protected String getResourceCacheKey(HttpServletRequest request)
			throws Exception {
		return getRelativeRequestURI(request);
	}

	protected ResourcesWrapper createResourcesWrapper(
			HttpServletRequest request, DoradoContext context) throws Exception {
		String path = getRelativeRequestURI(request);
		String resourceSuffix = getUriSuffix(request);
		Resource[] resources = context.getResources(path);
		return new ResourcesWrapper(resources, getResourceTypeManager()
				.getResourceType(resourceSuffix));
	}

	@Override
	protected ModelAndView doHandleRequest(HttpServletRequest request,
			HttpServletResponse response) throws Exception {
		DoradoContext context = DoradoContext.getCurrent();
		ResourcesWrapper resourcesWrapper = getResourcesWrapper(request,
				context);
		outputResourcesWrapper(resourcesWrapper, request, response);
		return null;
	}

	protected void outputResourcesWrapper(ResourcesWrapper resourcesWrapper,
			HttpServletRequest request, HttpServletResponse response)
			throws Exception {
		if (resourcesWrapper.getHttpStatus() != 0) {
			response.setStatus(resourcesWrapper.getHttpStatus());
		} else {
			// 获取Client端缓存资源的最后修改时间，如果尚没有缓存将返回-1
			long cachedLastModified = request
					.getDateHeader(HttpConstants.IF_MODIFIED_SINCE);

			// 获取Server端资源的最后修改时间
			long lastModified = resourcesWrapper.getLastModified();

			// 判断是否利用Client端缓存
			if (lastModified != 0 && cachedLastModified != 0
					&& Math.abs(lastModified - cachedLastModified) < ONE_SECOND) {
				// 通知浏览器Server端的资源没有改变，可以使用Client端的缓存
				response.setStatus(HttpServletResponse.SC_NOT_MODIFIED);
			} else {
				String contentType = getContentType(resourcesWrapper);
				response.setContentType(contentType);

				// 告知Client端此资源的最后修改时间
				SimpleDateFormat dateFormat = new SimpleDateFormat(
						"EEE, dd MMM yyyy HH:mm:ss z", Locale.ENGLISH);
				dateFormat.setTimeZone(GMT_TIME_ZONE);

				response.addHeader(HttpConstants.LAST_MODIFIED,
						dateFormat.format(new Date(lastModified)));

				Resource[] resources = resourcesWrapper.getResources();
				OutputStream out = getOutputStream(request, response,
						resourcesWrapper);
				try {
					for (int i = 0; i < resources.length; i++) {
						if (i > 0 && contentType.contains("text")) {
							out.write("\n".getBytes(response
									.getCharacterEncoding()));
						}
						outputFile(out, resources[i]);
					}
				} finally {
					try {
						out.close();
					} catch (IOException e) {
						// do nothing
					}
				}
			}
		}
	}
}

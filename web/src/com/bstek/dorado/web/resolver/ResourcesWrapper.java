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

import java.io.IOException;

import com.bstek.dorado.core.DoradoAbout;
import com.bstek.dorado.core.io.Resource;

public class ResourcesWrapper {
	private Resource[] resources;
	private ResourceType resourceType;
	private long lastModified;
	private long lastAccessed;
	private boolean reloadable;
	private int httpStatus;
	private boolean cacheable = true;
	private Object userData;

	public ResourcesWrapper(Resource[] resources, ResourceType resourceType) {
		this.resources = resources;
		this.resourceType = resourceType;
		reloadable = true;
		updateLastModified();
		updateLastAccessed();
	}

	public ResourcesWrapper(int httpStatus) {
		this.httpStatus = httpStatus;
	}

	public ResourceType getResourceType() {
		return resourceType;
	}

	public Resource[] getResources() {
		return resources;
	}

	public long getLastModified() {
		return lastModified;
	}

	protected long updateLastModified() {
		long lastModified = 0;
		if (resources != null) {
			for (int i = 0; i < resources.length; i++) {
				Resource resource = resources[i];
				long timestamp;
				try {
					timestamp = resource.getTimestamp();
					if (timestamp < 946656000000L) {
						timestamp = DoradoAbout.getInstantiationTime();
					}
				} catch (IOException ex) {
					timestamp = DoradoAbout.getInstantiationTime();
				}
				lastModified = (lastModified + timestamp) / (i + 1);
			}
		}
		this.lastModified = lastModified;
		return lastModified;
	}

	public long getLastAccessed() {
		return lastAccessed;
	}

	public long updateLastAccessed() {
		return lastAccessed = System.currentTimeMillis();
	}

	public boolean isReloadable() {
		return reloadable;
	}

	public void setReloadable(boolean reloadable) {
		this.reloadable = reloadable;
	}

	public int getHttpStatus() {
		return httpStatus;
	}

	public boolean isCacheable() {
		return cacheable;
	}

	public void setCacheable(boolean cacheable) {
		this.cacheable = cacheable;
	}

	public Object getUserData() {
		return userData;
	}

	public void setUserData(Object userData) {
		this.userData = userData;
	}
}

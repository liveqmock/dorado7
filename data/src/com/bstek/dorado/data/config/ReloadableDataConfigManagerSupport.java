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

package com.bstek.dorado.data.config;

import java.io.IOException;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.Set;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

import com.bstek.dorado.core.io.DefaultRefreshableResource;
import com.bstek.dorado.core.io.RefreshableResource;
import com.bstek.dorado.core.io.Resource;

/**
 * 支持数据配置文件自动重装载的管理器的抽象支持类。
 * <p>
 * 该管理器在initialize()之后会启动一个定时线程，定期的验证所有已装载的配置文件的有效性和时间戳。
 * 如果某文件已发生了改变或已不存在，那么管理器会重新装载或卸载相应的配置文件。<br>
 * 注意：该管理器不会自动装载符合通配路径的新配置文件，要支持新配置文件的自动装载需要使用
 * {@link com.bstek.dorado.data.config.ConfigurableDataConfigManager}。
 * </p>
 * 
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Dec 10, 2007
 * @see com.bstek.dorado.data.config.ConfigurableDataConfigManager
 */
public abstract class ReloadableDataConfigManagerSupport extends
		DataConfigManagerSupport {
	private final static long ONE_SECOND = 1000L;

	private static Log logger = LogFactory
			.getLog(ReloadableDataConfigManagerSupport.class);

	private class ValidateThread extends Thread {
		private boolean shouldStop = false;

		public ValidateThread() {
			setDaemon(true);
		}

		public void kill() {
			shouldStop = true;
		}

		@Override
		public void run() {
			try {
				while (autoReloadEnabled) {
					sleep(validateThreadIntervalSeconds * ONE_SECOND);
					if (!shouldStop) {
						validateAndReloadConfigs();
					}
				}
			} catch (InterruptedException ex) {
				ex.printStackTrace();
			}
		}
	}

	private boolean autoReloadEnabled = true;
	private boolean useAutoReloadThread;
	private long validateThreadIntervalSeconds = 5;
	private long minResourceValidateSeconds = 2;

	private ValidateThread validateThread;
	private Set<RefreshableResource> refreshableResources;

	/**
	 * 返回是否启用配置文件的自动重装载。
	 */
	public boolean isAutoReloadEnabled() {
		return autoReloadEnabled;
	}

	/**
	 * 设置是否启用配置文件的自动重装载。
	 */
	public void setAutoReloadEnabled(boolean autoReloadEnabled) {
		this.autoReloadEnabled = autoReloadEnabled;
	}

	public boolean isUseAutoReloadThread() {
		return useAutoReloadThread;
	}

	public void setUseAutoReloadThread(boolean useAutoReloadThread) {
		this.useAutoReloadThread = useAutoReloadThread;
	}

	/**
	 * 返回检查所有配置文件是否需要重新装载的线程的执行间隔。
	 */
	public long getValidateThreadIntervalSeconds() {
		return validateThreadIntervalSeconds;
	}

	/**
	 * 设置检查所有配置文件是否需要重新装载的线程的执行间隔。
	 */
	public void setValidateThreadIntervalSeconds(
			long validateThreadIntervalSeconds) {
		this.validateThreadIntervalSeconds = validateThreadIntervalSeconds;
	}

	/**
	 * 返回最短的执行配置文件时间戳验证的时间间隔。
	 */
	public long getMinResourceValidateSeconds() {
		return minResourceValidateSeconds;
	}

	/**
	 * 设置最短的执行配置文件时间戳验证的时间间隔。
	 */
	public void setMinResourceValidateSeconds(long minResourceValidateSeconds) {
		this.minResourceValidateSeconds = minResourceValidateSeconds;
	}

	@Override
	public synchronized void loadConfigs(Resource[] resources,
			boolean throwOnError) throws Exception {
		super.loadConfigs(resources, throwOnError);
		refreshableResources = getRefreshableResources();
	}

	@Override
	public synchronized void unloadConfigs(Resource[] resources)
			throws Exception {
		super.unloadConfigs(resources);
		refreshableResources = getRefreshableResources();
	}

	/**
	 * 将当前已装载的配置文件资源描述对象包装成可支持资源重装载的资源描述对象并返回。
	 * 如果某个资源本身已是可支持资源重装载的资源描述对象，那么此函数会跳过对这个对象的处理。
	 */
	protected Set<RefreshableResource> getRefreshableResources()
			throws IOException {
		Set<Resource> resources = getResources();
		synchronized (resources) {
			Set<RefreshableResource> refreshableResources = new LinkedHashSet<RefreshableResource>(resources.size());
			for (Resource resource : resources) {
				RefreshableResource refreshableResource;
				if (resource instanceof RefreshableResource) {
					refreshableResource = (RefreshableResource) resource;
				} else {
					refreshableResource = new DefaultRefreshableResource(
							resource);
				}

				if (refreshableResource.getTimestamp() != 0) {
					refreshableResource
							.setMinValidateSeconds(minResourceValidateSeconds);
					refreshableResources.add(refreshableResource);
				}
			}
			return refreshableResources;
		}
	}

	/**
	 * 验证所有当前已装载的配置文件的有效性，如有文件被改变或被移除将重新装载或卸载该配置文件。
	 * 
	 * @return 返回的逻辑值表示此过程是否实际发生了重新装载或卸载的动作。
	 */
	public synchronized boolean validateAndReloadConfigs() {
		boolean configsChanged = false;
		if (refreshableResources != null) {
			for (RefreshableResource refreshableResource : refreshableResources) {
				Set<RefreshableResource> resourceToUnload = null;
				Set<RefreshableResource> resourceToReload = null;

				if (!refreshableResource.isValid()) {
					if (resourceToUnload == null) {
						resourceToUnload = new HashSet<RefreshableResource>();
					}
					resourceToUnload.add(refreshableResource);

					if (refreshableResource.exists()) {
						if (resourceToReload == null) {
							resourceToReload = new HashSet<RefreshableResource>();
						}
						resourceToReload.add(refreshableResource);
					}
				}

				try {
					if (resourceToUnload != null) {
						Resource[] resource = new Resource[resourceToUnload
								.size()];
						resourceToUnload.toArray(resource);
						configsChanged = true;
						unloadConfigs(resource);
					}
				} catch (Exception e) {
					logger.error(e, e);
				}

				try {
					if (resourceToReload != null) {
						Resource[] resource = new Resource[resourceToReload
								.size()];
						resourceToReload.toArray(resource);
						configsChanged = true;
						loadConfigs(resource, false);
					}
				} catch (Exception e) {
					logger.error(e, e);
				}
			}
		}
		return configsChanged;
	}

	/**
	 * 启动验证并执行配置文件动态装载的线程。
	 */
	protected synchronized void startValidateThead() {
		if (validateThread != null && validateThread.isAlive()) {
			throw new IllegalStateException("Validate thead is alread started.");
		}

		stopValidateThead();

		validateThread = new ValidateThread();
		validateThread.start();
	}

	/**
	 * 终止验证并执行配置文件动态装载的线程。
	 */
	protected synchronized void stopValidateThead() {
		if (validateThread != null) {
			validateThread.kill();
			validateThread = null;
		}
	}
}

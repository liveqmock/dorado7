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

package com.bstek.dorado.web.loader;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.StringWriter;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Properties;
import java.util.Timer;
import java.util.TimerTask;

import javax.servlet.ServletContext;

import org.apache.commons.jexl2.JexlContext;
import org.apache.commons.jexl2.MapContext;
import org.apache.commons.lang.ArrayUtils;
import org.apache.commons.lang.StringUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.web.util.WebUtils;

import com.bstek.dorado.core.Configure;
import com.bstek.dorado.core.ConfigureStore;
import com.bstek.dorado.core.Context;
import com.bstek.dorado.core.DoradoAbout;
import com.bstek.dorado.core.EngineStartupListenerManager;
import com.bstek.dorado.core.el.DefaultExpressionHandler;
import com.bstek.dorado.core.el.Expression;
import com.bstek.dorado.core.el.ExpressionHandler;
import com.bstek.dorado.core.io.LocationTransformerHolder;
import com.bstek.dorado.core.io.Resource;
import com.bstek.dorado.core.io.ResourceLoader;
import com.bstek.dorado.core.io.ResourceUtils;
import com.bstek.dorado.core.pkgs.PackageConfigurer;
import com.bstek.dorado.core.pkgs.PackageInfo;
import com.bstek.dorado.core.pkgs.PackageListener;
import com.bstek.dorado.core.pkgs.PackageManager;
import com.bstek.dorado.util.TempFileUtils;
import com.bstek.dorado.web.ConsoleUtils;
import com.bstek.dorado.web.DoradoContext;
import com.bstek.dorado.web.servlet.ServletContextResourceLoader;

public class DoradoLoader {
	private static final Log logger = LogFactory.getLog(DoradoLoader.class);

	private static final String CORE_PROPERTIES_LOCATION_PREFIX = "classpath:com/bstek/dorado/core/";
	private static final String HOME_LOCATION_PREFIX = "home:";
	private static final int HOME_LOCATION_PREFIX_LEN = HOME_LOCATION_PREFIX
			.length();

	private static final String DEFAULT_DORADO_HOME = "/WEB-INF/dorado-home";
	private static final String RESOURCE_LOADER_PROPERTY = "core.resourceLoader";
	private static final String BYTE_CODE_PROVIDER_PROPERTY = "core.defaultByteCodeProvider";

	private static final String HOME_PROPERTY = "core.doradoHome";
	private static final String CONTEXT_CONFIG_PROPERTY = "core.contextConfigLocation";
	private static final String SERVLET_CONTEXT_CONFIG_PROPERTY = "core.servletContextConfigLocation";

	private static final String CONTEXT_CONFIG_LOCATION = "contextConfigLocation";
	private static final String SERVLET_CONTEXT_CONFIG_LOCATION = "servletContextConfigLocation";

	private static final String CONTEXT_FILE_EXT = ".xml";
	private static final String HOME_CONTEXT_PREFIX = HOME_LOCATION_PREFIX
			+ "context";
	private static final String HOME_CONTEXT_XML = HOME_CONTEXT_PREFIX
			+ CONTEXT_FILE_EXT;
	private static final String HOME_SERVLET_CONTEXT_PREFIX = HOME_LOCATION_PREFIX
			+ "servlet-context";
	private static final String HOME_SERVLET_CONTEXT_XML = HOME_SERVLET_CONTEXT_PREFIX
			+ CONTEXT_FILE_EXT;

	private boolean preloaded;
	private boolean loaded;
	private String doradoHome;
	private List<String> contextLocations = new ArrayList<String>();
	private List<String> servletContextLocations = new ArrayList<String>();

	private DoradoLoader() {
	}

	private static class SingletonHolder {
		public static DoradoLoader instance = new DoradoLoader();
	}

	public static DoradoLoader getInstance() {
		return SingletonHolder.instance;
	}

	public String[] getRealResourcesPath(List<String> locations)
			throws IOException {
		if (locations == null || locations.isEmpty()) {
			return null;
		}
		List<String> result = new ArrayList<String>();
		for (String location : locations) {
			if (StringUtils.isNotEmpty(location)) {
				result.add(location);
			}
		}
		return result.toArray(new String[0]);
	}

	private void pushLocation(List<String> locationList, String location) {
		if (StringUtils.isNotEmpty(location)) {
			location = LocationTransformerHolder.transformLocation(location);
			locationList.add(location);
		}
	}

	private void pushLocations(List<String> locationList, String locations) {
		if (StringUtils.isNotEmpty(locations)) {
			for (String location : org.springframework.util.StringUtils
					.tokenizeToStringArray(
							locations,
							ConfigurableApplicationContext.CONFIG_LOCATION_DELIMITERS)) {
				pushLocation(locationList, location);
			}
		}
	}

	private void loadConfigureProperties(ConfigureStore configureStore,
			ResourceLoader resourceLoader, String configureLocation,
			boolean silence) throws IOException {
		// 装载附加的基本配置信息
		ConsoleUtils.outputLoadingInfo("Loading configure from ["
				+ configureLocation + "]...");
		if (StringUtils.isNotEmpty(configureLocation)) {
			Resource resource = resourceLoader.getResource(configureLocation);
			if (!resource.exists()) {
				if (silence) {
					logger.warn("Can not found resource [" + configureLocation
							+ "].");
					return;
				} else {
					throw new IOException("Can not found resource ["
							+ configureLocation + "].");
				}
			}
			InputStream in = resource.getInputStream();
			Properties properties = new Properties();
			try {
				properties.load(in);
			} finally {
				in.close();
			}

			ExpressionHandler expressionHandler = new DefaultExpressionHandler() {
				@Override
				public JexlContext getJexlContext() {
					JexlContext elContext = new MapContext();
					elContext.set("env", System.getenv());
					return elContext;
				}
			};

			for (Map.Entry<?, ?> entry : properties.entrySet()) {
				String text = (String) entry.getValue();
				Object value = text;
				if (StringUtils.isNotEmpty(text)) {
					Expression expression = expressionHandler.compile(text);
					if (expression != null) {
						value = expression.evaluate();
					}
				}
				configureStore.set((String) entry.getKey(), value);
			}
		}
	}

	public boolean isPreloaded() {
		return preloaded;
	}

	public boolean isLoaded() {
		return loaded;
	}

	public String getDoradoHome() {
		return doradoHome;
	}

	public List<String> getContextLocations(boolean toRealPath) {
		return contextLocations;
	}

	public List<String> getServletContextLocations(boolean toRealPath) {
		return servletContextLocations;
	}

	public synchronized void preload(ServletContext servletContext,
			boolean processOriginContextConfigLocation) throws Exception {
		if (preloaded) {
			throw new IllegalStateException(
					"Dorado base configurations already loaded.");
		}
		preloaded = true;

		// 输出版本信息
		ConsoleUtils.outputLoadingInfo("Initializing "
				+ DoradoAbout.getProductTitle() + " engine...");
		ConsoleUtils.outputLoadingInfo("[Vendor: " + DoradoAbout.getVendor()
				+ "]");

		ConfigureStore configureStore = Configure.getStore();
		doradoHome = System.getenv("DORADO_HOME");

		// 处理DoradoHome
		String intParam;
		intParam = servletContext.getInitParameter("doradoHome");
		if (intParam != null) {
			doradoHome = intParam;
		}
		if (doradoHome == null) {
			doradoHome = DEFAULT_DORADO_HOME;
		}

		configureStore.set(HOME_PROPERTY, doradoHome);
		ConsoleUtils
				.outputLoadingInfo("[Home: "
						+ StringUtils.defaultString(doradoHome,
								"<not assigned>") + "]");

		// 创建一个临时的ResourceLoader
		ResourceLoader resourceLoader = new ServletContextResourceLoader(
				servletContext) {
			@Override
			public Resource getResource(String resourceLocation) {
				if (resourceLocation != null
						&& resourceLocation.startsWith(HOME_LOCATION_PREFIX)) {
					resourceLocation = ResourceUtils.concatPath(doradoHome,
							resourceLocation
									.substring(HOME_LOCATION_PREFIX_LEN));
				}
				return super.getResource(resourceLocation);
			}
		};

		String runMode = null;
		if (StringUtils.isNotEmpty(doradoHome)) {
			String configureLocation = HOME_LOCATION_PREFIX
					+ "configure.properties";
			loadConfigureProperties(configureStore, resourceLoader,
					configureLocation, false);
		}

		runMode = configureStore.getString("core.runMode");

		if (StringUtils.isNotEmpty(runMode)) {
			loadConfigureProperties(configureStore, resourceLoader,
					CORE_PROPERTIES_LOCATION_PREFIX + "configure-" + runMode
							+ ".properties", true);

			if (StringUtils.isNotEmpty(doradoHome)) {
				loadConfigureProperties(configureStore, resourceLoader,
						HOME_LOCATION_PREFIX + "configure-" + runMode
								+ ".properties", true);
			}
		}

		ConsoleUtils.outputConfigureItem("core.runMode");
		ConsoleUtils.outputConfigureItem("core.addonLoadMode");

		File tempDir;
		String tempDirPath = configureStore.getString("core.tempDir");
		if (StringUtils.isNotBlank(tempDirPath)) {
			tempDir = new File(tempDirPath);
		} else {
			tempDir = new File(WebUtils.getTempDir(servletContext), ".dorado");
		}

		boolean supportsTempFile = configureStore
				.getBoolean("core.supportsTempFile");
		TempFileUtils.setSupportsTempFile(supportsTempFile);
		if (supportsTempFile) {
			if ((tempDir.exists() && tempDir.isDirectory()) || tempDir.mkdir()) {
				TempFileUtils.setTempDir(tempDir);
			}
			ConsoleUtils.outputLoadingInfo("[TempDir: "
					+ TempFileUtils.getTempDir().getPath() + "]");
		} else {
			ConsoleUtils.outputLoadingInfo("Temp file is forbidden.");
		}

		// 选择一个存储目录
		File storeDir;
		String storeDirSettring = configureStore.getString("core.storeDir");
		if (StringUtils.isNotEmpty(storeDirSettring)) {
			storeDir = new File(storeDirSettring);
			File testFile = new File(storeDir, ".test");
			if (!testFile.mkdirs()) {
				throw new IllegalStateException("Store directory ["
						+ storeDir.getAbsolutePath()
						+ "] is not writable in actually.");
			}
			testFile.delete();
		} else {
			storeDir = new File(tempDir, "dorado-store");
			configureStore.set("core.storeDir", storeDir.getAbsolutePath());
		}
		ConsoleUtils.outputConfigureItem("core.storeDir");

		// gothrough packages
		String addonLoadMode = Configure.getString("core.addonLoadMode");
		String[] enabledAddons = StringUtils.split(
				Configure.getString("core.enabledAddons"), ",; \n\r");
		String[] disabledAddon = StringUtils.split(
				Configure.getString("core.disabledAddon"), ",; \n\r");

		Collection<PackageInfo> packageInfos = PackageManager
				.getPackageInfoMap().values();
		int addonNumber = 0;
		for (PackageInfo packageInfo : packageInfos) {
			String packageName = packageInfo.getName();
			if (packageName.equals("dorado-core")) {
				continue;
			}

			if (addonNumber > 9999) {
				packageInfo.setEnabled(false);
			} else if (StringUtils.isEmpty(addonLoadMode)
					|| "positive".equals(addonLoadMode)) {
				packageInfo.setEnabled(!ArrayUtils.contains(disabledAddon,
						packageName));
			} else {
				// addonLoadMode == negative
				packageInfo.setEnabled(ArrayUtils.contains(enabledAddons,
						packageName));
			}

			if (packageInfo.isEnabled()) {
				addonNumber++;
			}
		}

		// print packages
		int i = 0;
		for (PackageInfo packageInfo : packageInfos) {
			ConsoleUtils.outputLoadingInfo(StringUtils.rightPad(
					String.valueOf(++i) + '.', 4)
					+ "Package ["
					+ packageInfo.getName()
					+ " - "
					+ StringUtils.defaultIfBlank(packageInfo.getVersion(),
							"<Unknown Version>")
					+ "] found."
					+ ((packageInfo.isEnabled() ? "" : " #DISABLED# ")));
		}

		// load packages
		for (PackageInfo packageInfo : packageInfos) {
			if (!packageInfo.isEnabled()) {
				pushLocations(contextLocations,
						packageInfo.getComponentLocations());
				continue;
			}

			PackageListener packageListener = packageInfo.getListener();
			if (packageListener != null) {
				packageListener.beforeLoadPackage(packageInfo, resourceLoader);
			}

			PackageConfigurer packageConfigurer = packageInfo.getConfigurer();

			if (StringUtils.isNotEmpty(packageInfo.getPropertiesLocations())) {
				for (String location : org.springframework.util.StringUtils
						.tokenizeToStringArray(
								packageInfo.getPropertiesLocations(),
								ConfigurableApplicationContext.CONFIG_LOCATION_DELIMITERS)) {
					loadConfigureProperties(configureStore, resourceLoader,
							location, false);
				}
			}

			String[] locations;
			if (packageConfigurer != null) {
				locations = packageConfigurer
						.getPropertiesConfigLocations(resourceLoader);
				if (locations != null) {
					for (String location : locations) {
						loadConfigureProperties(configureStore, resourceLoader,
								location, false);
					}
				}
			}

			// 处理Spring的配置文件
			pushLocations(contextLocations, packageInfo.getContextLocations());
			if (packageConfigurer != null) {
				locations = packageConfigurer
						.getContextConfigLocations(resourceLoader);
				if (locations != null) {
					for (String location : locations) {
						pushLocation(contextLocations, location);
					}
				}
			}

			pushLocations(servletContextLocations,
					packageInfo.getServletContextLocations());
			if (packageConfigurer != null) {
				locations = packageConfigurer
						.getServletContextConfigLocations(resourceLoader);
				if (locations != null) {
					for (String location : locations) {
						pushLocation(servletContextLocations, location);
					}
				}
			}

			packageInfo.setLoaded(true);
		}

		// 再次装载dorado-home下的properties，以覆盖addon中的设置。
		if (StringUtils.isNotEmpty(doradoHome)) {
			String configureLocation = HOME_LOCATION_PREFIX
					+ "configure.properties";
			loadConfigureProperties(configureStore, resourceLoader,
					configureLocation, true);
			if (StringUtils.isNotEmpty(runMode)) {
				loadConfigureProperties(configureStore, resourceLoader,
						CORE_PROPERTIES_LOCATION_PREFIX + "configure-"
								+ runMode + ".properties", true);
				loadConfigureProperties(configureStore, resourceLoader,
						HOME_LOCATION_PREFIX + "configure-" + runMode
								+ ".properties", true);
			}
		}

		Resource resource;

		// context
		if (processOriginContextConfigLocation) {
			intParam = servletContext.getInitParameter(CONTEXT_CONFIG_LOCATION);
			if (intParam != null) {
				pushLocations(contextLocations, intParam);
			}
		}

		resource = resourceLoader.getResource(HOME_CONTEXT_XML);
		if (resource.exists()) {
			pushLocations(contextLocations, HOME_CONTEXT_XML);
		}

		if (StringUtils.isNotEmpty(runMode)) {
			String extHomeContext = HOME_CONTEXT_PREFIX + '-' + runMode
					+ CONTEXT_FILE_EXT;
			resource = resourceLoader.getResource(extHomeContext);
			if (resource.exists()) {
				pushLocations(contextLocations, extHomeContext);
			}
		}

		// servlet-context
		intParam = servletContext
				.getInitParameter(SERVLET_CONTEXT_CONFIG_LOCATION);
		if (intParam != null) {
			pushLocations(servletContextLocations, intParam);
		}
		resource = resourceLoader.getResource(HOME_SERVLET_CONTEXT_XML);
		if (resource.exists()) {
			pushLocations(servletContextLocations, HOME_SERVLET_CONTEXT_XML);
		}

		if (StringUtils.isNotEmpty(runMode)) {
			String extHomeContext = HOME_SERVLET_CONTEXT_PREFIX + '-' + runMode
					+ CONTEXT_FILE_EXT;
			resource = resourceLoader.getResource(extHomeContext);
			if (resource.exists()) {
				pushLocations(servletContextLocations, extHomeContext);
			}
		}

		ConsoleUtils.outputConfigureItem(RESOURCE_LOADER_PROPERTY);
		ConsoleUtils.outputConfigureItem(BYTE_CODE_PROVIDER_PROPERTY);

		String contextLocationsFromProperties = configureStore
				.getString(CONTEXT_CONFIG_PROPERTY);
		if (contextLocationsFromProperties != null) {
			pushLocations(contextLocations, contextLocationsFromProperties);
		}
		configureStore.set(CONTEXT_CONFIG_PROPERTY,
				StringUtils.join(getRealResourcesPath(contextLocations), ';'));
		ConsoleUtils.outputConfigureItem(CONTEXT_CONFIG_PROPERTY);

		String serlvetContextLocationsFromProperties = configureStore
				.getString(SERVLET_CONTEXT_CONFIG_PROPERTY);
		if (serlvetContextLocationsFromProperties != null) {
			pushLocations(servletContextLocations,
					serlvetContextLocationsFromProperties);
		}
		configureStore.set(SERVLET_CONTEXT_CONFIG_PROPERTY, StringUtils.join(
				getRealResourcesPath(servletContextLocations), ';'));
		ConsoleUtils.outputConfigureItem(SERVLET_CONTEXT_CONFIG_PROPERTY);

		// 初始化WebContext
		DoradoContext context = DoradoContext.init(servletContext, false);
		Context.setFailSafeContext(context);
	}

	public synchronized void load(ServletContext servletContext)
			throws Exception {
		if (!preloaded) {
			throw new IllegalStateException(
					"Can not load dorado services before base configurations loaded.");
		}

		if (loaded) {
			throw new IllegalStateException("Dorado services already loaded.");
		}
		loaded = true;

		EngineStartupListenerManager.notifyStartup();

		ConsoleStartedMessagesOutputter consoleStartedMessagesOutputter = (ConsoleStartedMessagesOutputter) DoradoContext
				.getCurrent().getServiceBean("consoleStartedMessagesOutputter");
		StringWriter buffer = new StringWriter();
		try {
			consoleStartedMessagesOutputter.output(buffer);
		} finally {
			buffer.close();
		}
		DoradoContext.dispose();

		Timer timer = new Timer();
		timer.schedule(new ConsoleMessageTimerTask(buffer.toString()), 500L);
	}
}

class ConsoleMessageTimerTask extends TimerTask {
	private static final Log logger = LogFactory
			.getLog(ConsoleMessageTimerTask.class);

	private String content;

	public ConsoleMessageTimerTask(String content) {
		this.content = content;
	}

	@Override
	public void run() {
		try {
			System.out.print(content);
		} catch (Exception e) {
			logger.error(e, e);
		}
	}
}

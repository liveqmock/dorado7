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

package com.bstek.dorado.idesupport;

import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStreamWriter;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Properties;

import org.apache.commons.jexl2.JexlContext;
import org.apache.commons.jexl2.MapContext;
import org.apache.commons.lang.StringUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.context.ConfigurableApplicationContext;

import com.bstek.dorado.core.CommonContext;
import com.bstek.dorado.core.Configure;
import com.bstek.dorado.core.ConfigureStore;
import com.bstek.dorado.core.Constants;
import com.bstek.dorado.core.Context;
import com.bstek.dorado.core.DoradoAbout;
import com.bstek.dorado.core.EngineStartupListenerManager;
import com.bstek.dorado.core.el.DefaultExpressionHandler;
import com.bstek.dorado.core.el.Expression;
import com.bstek.dorado.core.el.ExpressionHandler;
import com.bstek.dorado.core.io.BaseResourceLoader;
import com.bstek.dorado.core.io.LocationTransformerHolder;
import com.bstek.dorado.core.io.Resource;
import com.bstek.dorado.core.io.ResourceLoader;
import com.bstek.dorado.core.io.ResourceUtils;
import com.bstek.dorado.core.pkgs.PackageInfo;
import com.bstek.dorado.core.pkgs.PackageManager;
import com.bstek.dorado.idesupport.output.RuleSetOutputter;
import com.bstek.dorado.web.ConsoleUtils;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2011-9-6
 */
public class StandaloneRuleSetExporter {
	private static final Log logger = LogFactory
			.getLog(StandaloneRuleSetExporter.class);

	private static final String RUN_MODE = "export-rules";
	private static final String CORE_PROPERTIES_LOCATION_PREFIX = "classpath:com/bstek/dorado/core/";
	private static final String HOME_LOCATION_PREFIX = "home:";
	private static final int HOME_LOCATION_PREFIX_LEN = HOME_LOCATION_PREFIX
			.length();
	private static final String HOME_PROPERTY = "core.doradoHome";
	private static final String CONTEXT_CONFIG_PROPERTY = "core.contextConfigLocation";

	private static final String HOME_COMPONENT_CONTEXT_FILE = HOME_LOCATION_PREFIX
			+ "components-context.xml";

	private String doradoHome;

	private StandaloneRuleSetExporter(String doradoHome) {
		this.doradoHome = doradoHome;
	}

	private RuleTemplateBuilder getRuleTemplateBuilder() throws Exception {
		Context context = Context.getCurrent();
		return (RuleTemplateBuilder) context
				.getServiceBean("idesupport.ruleTemplateBuilder");
	}

	private RuleSetOutputter getRuleSetOutputter() throws Exception {
		Context context = Context.getCurrent();
		return (RuleSetOutputter) context
				.getServiceBean("idesupport.ruleSetOutputter");
	}

	private String getRealResourcePath(String location) {
		if (location != null && location.startsWith(HOME_LOCATION_PREFIX)) {
			location = ResourceUtils.concatPath(doradoHome,
					location.substring(HOME_LOCATION_PREFIX_LEN));
		}
		return location;
	}

	private String[] getRealResourcesPath(List<String> locations)
			throws IOException {
		if (locations == null || locations.isEmpty()) {
			return null;
		}
		List<String> result = new ArrayList<String>();
		for (String location : locations) {
			location = getRealResourcePath(location);
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
			Resource resource = resourceLoader
					.getResource(getRealResourcePath(configureLocation));
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

	private void exportRuleSet(PrintWriter writer) throws Exception {
		// 输出版本信息
		ConsoleUtils.outputLoadingInfo("Initializing "
				+ DoradoAbout.getProductTitle() + " engine...");
		ConsoleUtils.outputLoadingInfo("[Vendor: " + DoradoAbout.getVendor()
				+ "]");

		ConfigureStore configureStore = Configure.getStore();

		// 处理DoradoHome
		configureStore.set(HOME_PROPERTY, doradoHome);
		ConsoleUtils
				.outputLoadingInfo("[Home: "
						+ StringUtils.defaultString(doradoHome,
								"<not assigned>") + "]");

		// 创建一个临时的ResourceLoader
		ResourceLoader resourceLoader = new BaseResourceLoader();

		if (StringUtils.isNotEmpty(doradoHome)) {
			String configureLocation = HOME_LOCATION_PREFIX
					+ "configure.properties";
			loadConfigureProperties(configureStore, resourceLoader,
					configureLocation, false);
		}

		configureStore.set("core.runMode", RUN_MODE);

		loadConfigureProperties(configureStore, resourceLoader,
				CORE_PROPERTIES_LOCATION_PREFIX + "configure-" + RUN_MODE
						+ ".properties", true);

		if (StringUtils.isNotEmpty(doradoHome)) {
			loadConfigureProperties(configureStore, resourceLoader,
					HOME_LOCATION_PREFIX + "configure-" + RUN_MODE
							+ ".properties", true);
		}

		List<String> contextLocations = new ArrayList<String>();
		// findPackages
		for (PackageInfo packageInfo : PackageManager.getPackageInfoMap()
				.values()) {
			String packageName = packageInfo.getName();
			ConsoleUtils.outputLoadingInfo("Package [" + packageName + " - "
					+ packageInfo.getVersion() + "] found.");

			// 处理Spring的配置文件
			String addonVersion = packageInfo.getAddonVersion();
			if (StringUtils.isEmpty(addonVersion)
					|| "2.0".compareTo(addonVersion) > 0) {
				pushLocations(contextLocations,
						packageInfo.getContextLocations());
			} else {
				pushLocations(contextLocations,
						packageInfo.getComponentLocations());
			}
		}

		String contextLocationsFromProperties = configureStore
				.getString(CONTEXT_CONFIG_PROPERTY);
		if (contextLocationsFromProperties != null) {
			pushLocations(contextLocations, contextLocationsFromProperties);
		}

		Resource resource;
		resource = resourceLoader
				.getResource(getRealResourcePath(HOME_COMPONENT_CONTEXT_FILE));
		if (resource.exists()) {
			pushLocations(contextLocations, HOME_COMPONENT_CONTEXT_FILE);
		}

		configureStore.set(CONTEXT_CONFIG_PROPERTY,
				StringUtils.join(getRealResourcesPath(contextLocations), ';'));
		ConsoleUtils.outputConfigureItem(CONTEXT_CONFIG_PROPERTY);

		CommonContext.init();
		try {
			// TODO: 此句可考虑删除
			EngineStartupListenerManager.notifyStartup();

			RuleTemplateManager ruleTemplateManager = getRuleTemplateBuilder()
					.getRuleTemplateManager();
			getRuleSetOutputter().output(writer, ruleTemplateManager);
		} finally {
			CommonContext.dispose();
		}
	}

	public static void main(String[] args) throws Exception {
		String ruleSetFile = null;
		String doradoHome = null;
		if (args.length >= 2) {
			ruleSetFile = args[0];
			doradoHome = args[1];
		} else {
			throw new IllegalArgumentException();
		}

		if (StringUtils.isEmpty(doradoHome)) {
			doradoHome = System.getenv("DORADO_HOME");
		}

		StandaloneRuleSetExporter instance = new StandaloneRuleSetExporter(
				doradoHome);

		FileOutputStream fos = new FileOutputStream(ruleSetFile);
		PrintWriter writer = new PrintWriter(new OutputStreamWriter(fos,
				Constants.DEFAULT_CHARSET));
		try {
			instance.exportRuleSet(writer);
		} finally {
			writer.flush();
			writer.close();
			fos.close();
		}
	}
}

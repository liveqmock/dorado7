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

import java.util.ArrayList;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.apache.commons.lang.StringUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.w3c.dom.Document;
import org.w3c.dom.Element;

import com.bstek.dorado.config.ParseContext;
import com.bstek.dorado.config.xml.XmlParser;
import com.bstek.dorado.core.Context;
import com.bstek.dorado.core.io.Resource;
import com.bstek.dorado.core.io.ResourceUtils;
import com.bstek.dorado.core.xml.XmlDocumentBuilder;
import com.bstek.dorado.data.config.definition.DataProviderDefinition;
import com.bstek.dorado.data.config.definition.DataProviderDefinitionManager;
import com.bstek.dorado.data.config.definition.DataResolverDefinition;
import com.bstek.dorado.data.config.definition.DataResolverDefinitionManager;
import com.bstek.dorado.data.config.definition.DataTypeDefinition;
import com.bstek.dorado.data.config.definition.DataTypeDefinitionManager;
import com.bstek.dorado.data.config.xml.DataParseContext;

/**
 * 默认的数据配置文件的管理器实现类。该管理器可以支持自动装载符合通配路径的新配置文件。
 * 
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Feb 20, 2007
 */
public class ConfigurableDataConfigManager extends
		ReloadableDataConfigManagerSupport {
	private static final String[] EMPTY_LOCATION_ARRAY = new String[0];
	private static final String XML_SUFFIX = ".xml";
	private static final String MODEL_XML_SUFFIX = ".model" + XML_SUFFIX;
	private static final long ONE_SECOND = 1000L;
	private static final char WILDCARD = '*';

	private static Log logger = LogFactory
			.getLog(ConfigurableDataConfigManager.class);

	private class RecalculateThread extends Thread {
		public RecalculateThread() {
			setDaemon(true);
		}

		@Override
		public void run() {
			try {
				while (true) {
					sleep(recalcLocationsThreadIntervalSeconds * ONE_SECOND);
					recalcConfigLocations();
				}
			} catch (InterruptedException ex) {
				ex.printStackTrace();
			}
		}
	}

	private static class DocumentWrapper {
		private Object documentObject;
		private Resource resource;

		DocumentWrapper(Object documentObject, Resource resource) {
			this.documentObject = documentObject;
			this.resource = resource;
		}

		Object getDocumentObject() {
			return documentObject;
		}

		Resource getResource() {
			return resource;
		}

	}

	private XmlDocumentBuilder xmlDocumentBuilder;
	private XmlParser preloadParser;
	private List<String> configLocations;
	private String[] configLocationArray;
	private DataTypeDefinitionManager dataTypeDefinitionManager;
	private DataProviderDefinitionManager dataProviderDefinitionManager;
	private DataResolverDefinitionManager dataResolverDefinitionManager;
	private XmlParser dataObjectParserDispatcher;
	private boolean autoRecalculatePaths;
	private long recalcLocationsThreadIntervalSeconds;

	/**
	 * 设置XML配置文件构建类。
	 */
	public void setXmlDocumentBuilder(XmlDocumentBuilder xmlDocumentBuilder) {
		this.xmlDocumentBuilder = xmlDocumentBuilder;
	}

	/**
	 * 设置用于完成XML预解析的解析器。
	 */
	public void setPreloadParser(XmlParser preloadParser) {
		this.preloadParser = preloadParser;
	}

	/**
	 * 设置要自动装载的配置文件。<br>
	 * 此操作执行前将首先清除原先已添加的所有配置文件。
	 * 
	 * @param configLocations
	 *            此参数是文件路径的集合，每个文件路径都是String类型的路径描述。
	 */
	public void setConfigLocations(List<String> configLocations) {
		this.configLocations = null;
		addConfigLocations(configLocations);
	}

	public void addConfigLocation(String configLocation) {
		if (this.configLocations == null) {
			this.configLocations = new ArrayList<String>();
		}
		this.configLocations.add(StringUtils.trim(configLocation));
		configLocationArray = null;
	}

	/**
	 * 添加要自动装载的配置文件。
	 * 
	 * @param configLocations
	 *            此参数是文件路径的集合，每个文件路径都是String类型的路径描述。
	 */
	public void addConfigLocations(List<String> configLocations) {
		if (this.configLocations == null) {
			this.configLocations = new ArrayList<String>();
		}
		for (String location : configLocations) {
			this.configLocations.add(StringUtils.trim(location));
		}
		configLocationArray = null;
	}

	/**
	 * 设置DataType声明对象的管理器。
	 */
	public void setDataTypeDefinitionManager(
			DataTypeDefinitionManager dataTypeDefinitionManager) {
		this.dataTypeDefinitionManager = dataTypeDefinitionManager;
	}

	/**
	 * 设置DataProvider声明对象的管理器。
	 */
	public void setDataProviderDefinitionManager(
			DataProviderDefinitionManager dataProviderDefinitionManager) {
		this.dataProviderDefinitionManager = dataProviderDefinitionManager;
	}

	/**
	 * 设置DataResolver声明对象的管理器。
	 */
	public void setDataResolverDefinitionManager(
			DataResolverDefinitionManager dataResolverDefinitionManager) {
		this.dataResolverDefinitionManager = dataResolverDefinitionManager;
	}

	public void setDataObjectParserDispatcher(
			XmlParser dataObjectParserDispatcher) {
		this.dataObjectParserDispatcher = dataObjectParserDispatcher;
	}

	public boolean isAutoRecalculatePaths() {
		return autoRecalculatePaths;
	}

	public void setAutoRecalculatePaths(boolean autoRecalculatePaths) {
		this.autoRecalculatePaths = autoRecalculatePaths;
	}

	/**
	 * 返回重新计算所有配置文件路径的线程的执行间隔。
	 */
	public long getRecalcLocationsThreadIntervalSeconds() {
		return recalcLocationsThreadIntervalSeconds;
	}

	/**
	 * 返回重新计算所有配置文件路径的线程的执行间隔。
	 */
	public void setRecalcLocationsThreadIntervalSeconds(
			long recalcLocationsThreadIntervalSeconds) {
		this.recalcLocationsThreadIntervalSeconds = recalcLocationsThreadIntervalSeconds;
	}

	/**
	 * 初始化方法。装载配置在configLocations属性中的配置文件，同时启动相关的用于完成配置文件动态装载的线程。
	 * 
	 * @throws Exception
	 */
	public void initialize() throws Exception {
		boolean shouldStartRecalculateThread = false;

		if (configLocations != null) {
			if (autoRecalculatePaths) {
				for (String location : configLocations) {
					if (location.indexOf(WILDCARD) >= 0) {
						shouldStartRecalculateThread = true;
					}
				}
			}

			String[] locations = new String[configLocations.size()];
			configLocations.toArray(locations);
			loadConfigs(ResourceUtils.getResources(locations), true);
		}

		if (isUseAutoReloadThread() && isAutoReloadEnabled()) {
			startValidateThead();

			if (autoRecalculatePaths && shouldStartRecalculateThread) {
				RecalculateThread recalculateThread = new RecalculateThread();
				recalculateThread.start();
			}
		}
	}

	@Override
	protected boolean internalLoadConfig(Resource[] resources) throws Exception {
		// 将所有Resource解析为文件对象
		DocumentWrapper[] documents = getDocuments(resources);

		DataParseContext parseContext = new DataParseContext();
		parseContext.setDataTypeDefinitionManager(dataTypeDefinitionManager);
		parseContext
				.setDataProviderDefinitionManager(dataProviderDefinitionManager);
		parseContext
				.setDataResolverDefinitionManager(dataResolverDefinitionManager);
		boolean changed = false;

		// 预解析，目的是挖掘出所有的全局DataType和DataProvider
		for (DocumentWrapper wrapper : documents) {
			Resource resource = wrapper.getResource();
			parseContext.setResource(resource);

			String path = resource.getPath(), resourceName = null;
			if (StringUtils.isNotEmpty(path)) {
				if (path.endsWith(MODEL_XML_SUFFIX)) {
					resourceName = path.substring(0, path.length()
							- MODEL_XML_SUFFIX.length());
				} else if (path.endsWith(XML_SUFFIX)) {
					resourceName = path.substring(0,
							path.length() - XML_SUFFIX.length());
				}
			}
			parseContext.setResourceName(resourceName);

			Object documentObject = wrapper.getDocumentObject();
			if (documentObject instanceof Document) {
				preloadConfig((Document) documentObject, parseContext);
			}
		}

		dataObjectParserDispatcher.parse(null, parseContext);

		Map<String, DataTypeDefinition> parsedDataTypes = parseContext
				.getParsedDataTypes();
		if (!parsedDataTypes.isEmpty()) {
			StringBuffer message = new StringBuffer();
			boolean needComma = false;
			message.append("Registered DataTypes: [");
			synchronized (dataTypeDefinitionManager) {
				for (Map.Entry<String, DataTypeDefinition> entry : parsedDataTypes
						.entrySet()) {
					String name = entry.getKey();
					dataTypeDefinitionManager.registerDefinition(name,
							entry.getValue());

					if (needComma) {
						message.append(", ");
					}
					needComma = true;
					message.append(name);
				}

				for (DataTypeDefinition dataTypeDefinition : parsedDataTypes
						.values()) {
					try {
						dataTypeDefinitionManager
								.registerMatchType(dataTypeDefinition);
					} catch (Exception e) {
						logger.warn(e, e);
					}
				}
			}
			message.append("]");
			logger.info(message.toString());
		}

		Map<String, DataProviderDefinition> parsedDataProviders = parseContext
				.getParsedDataProviders();
		if (!parsedDataProviders.isEmpty()) {
			StringBuffer message = new StringBuffer();
			boolean needComma = false;
			message.append("Registered DataProviders: [");
			synchronized (dataProviderDefinitionManager) {
				for (Map.Entry<String, DataProviderDefinition> entry : parsedDataProviders
						.entrySet()) {
					String name = entry.getKey();
					dataProviderDefinitionManager.registerDefinition(name,
							entry.getValue());

					if (needComma) {
						message.append(", ");
					}
					needComma = true;
					message.append(name);
				}
			}
			message.append("]");
			logger.info(message.toString());
		}

		Map<String, DataResolverDefinition> parsedDataResolvers = parseContext
				.getParsedDataResolvers();
		if (!parsedDataResolvers.isEmpty()) {
			StringBuffer message = new StringBuffer();
			boolean needComma = false;
			message.append("Registered DataResolvers: [");
			synchronized (dataResolverDefinitionManager) {
				for (Map.Entry<String, DataResolverDefinition> entry : parsedDataResolvers
						.entrySet()) {
					String name = entry.getKey();
					dataResolverDefinitionManager.registerDefinition(name,
							entry.getValue());

					if (needComma) {
						message.append(", ");
					}
					needComma = true;
					message.append(name);
				}
			}
			message.append("]");
			logger.info(message.toString());
		}
		return changed;
	}

	private DocumentWrapper[] getDocuments(Resource[] resources)
			throws Exception {
		List<DocumentWrapper> documentList = new ArrayList<DocumentWrapper>();
		for (Resource resource : resources) {
			if (resource.exists()) {
				String filename = resource.getFilename().toLowerCase();
				if (filename.endsWith(XML_SUFFIX)) {
					Document document = xmlDocumentBuilder
							.loadDocument(resource);
					documentList.add(new DocumentWrapper(document, resource));
				} else {
					logger.warn("Unsupported data configure - [" + resource
							+ "]");
				}
			} else {
				logger.warn("File not exists - [" + resource + "]");
			}
		}
		return documentList.toArray(new DocumentWrapper[0]);
	}

	/**
	 * 预装载配置文件中的配置信息。 此项操作的目的是发掘出配置文件中所有的全局对象，以便于在后续的处理中建立对象之间的绑定和依赖关系。
	 * 
	 * @param document
	 *            XML文档的DOM对象。
	 * @param parseContext
	 *            解析上下文。
	 * @throws Exception
	 */
	protected void preloadConfig(Document document, ParseContext context)
			throws Exception {
		Element documentElement = document.getDocumentElement();
		preloadParser.parse(documentElement, context);
	}

	@Override
	protected boolean internalUnloadConfigs(Resource[] resources)
			throws Exception {
		Set<Resource> resourceSet = new HashSet<Resource>();
		for (Resource resouce : resources) {
			resourceSet.add(resouce);
		}

		// 移除相关的DataType
		Set<DataTypeDefinition> dataTypesForRemove = new HashSet<DataTypeDefinition>();
		DataTypeDefinitionManager dataTypeDefinitionManager = dataTypeManager
				.getDataTypeDefinitionManager();
		Map<String, DataTypeDefinition> dataTypes = dataTypeDefinitionManager
				.getDefinitions();
		for (DataTypeDefinition dataType : dataTypes.values()) {
			if (resourceSet.contains(dataType.getResource())) {
				dataTypesForRemove.add(dataType);
			}
		}

		for (DataTypeDefinition dataType : dataTypesForRemove) {
			dataTypeDefinitionManager.unregisterDefinition(dataType.getName());
		}

		// 移除相关的DataProvider
		Set<DataProviderDefinition> dataProvidersForRemove = new HashSet<DataProviderDefinition>();
		DataProviderDefinitionManager dataProviderDefinitionManager = dataProviderManager
				.getDataProviderDefinitionManager();
		Map<String, DataProviderDefinition> dataProviders = dataProviderDefinitionManager
				.getDefinitions();
		for (DataProviderDefinition dataProvider : dataProviders.values()) {
			if (resourceSet.contains(dataProvider.getResource())) {
				dataProvidersForRemove.add(dataProvider);
			}
		}

		for (DataProviderDefinition dataProvider : dataProvidersForRemove) {
			dataProviderDefinitionManager.unregisterDefinition(dataProvider
					.getName());
		}

		// 移除相关的DataResolver
		Set<DataResolverDefinition> dataResolversForRemove = new HashSet<DataResolverDefinition>();
		DataResolverDefinitionManager dataResolverDefinitionManager = dataResolverManager
				.getDataResolverDefinitionManager();
		Map<String, DataResolverDefinition> dataResolvers = dataResolverDefinitionManager
				.getDefinitions();
		for (DataResolverDefinition dataResolver : dataResolvers.values()) {
			if (resourceSet.contains(dataResolver.getResource())) {
				dataResolversForRemove.add(dataResolver);
			}
		}

		for (DataResolverDefinition dataResolver : dataResolversForRemove) {
			dataResolverDefinitionManager.unregisterDefinition(dataResolver
					.getName());
		}

		return (!dataTypesForRemove.isEmpty() || !dataProvidersForRemove
				.isEmpty());
	}

	/**
	 * 重新计算所有配置文件路径，如果发现有新的配置文件则立即装载这些文件。
	 * 
	 * @return 返回的逻辑值表示此过程是否实际发生了装载配置文件的动作。
	 */
	public synchronized boolean recalcConfigLocations() {
		boolean configsChanged = false;
		try {
			Context context = Context.getCurrent();
			if (context == null) {
				return configsChanged;
			}

			if (configLocationArray == null) {
				if (configLocations != null) {
					configLocationArray = new String[configLocations.size()];
					configLocations.toArray(configLocationArray);
				} else {
					configLocationArray = EMPTY_LOCATION_ARRAY;
				}
			}

			Set<Resource> resources = ResourceUtils
					.getResourceSet(configLocationArray);
			Set<Resource> loadedResources = getResources();
			Set<Resource> newResources = null, removedResources = null;

			for (Resource resource : loadedResources) {
				if (!resources.contains(resource)) {
					if (newResources == null) {
						newResources = new LinkedHashSet<Resource>();
					}
					newResources.add(resource);
				}
			}

			for (Resource resource : resources) {
				if (!loadedResources.contains(resource)) {
					if (removedResources == null) {
						removedResources = new LinkedHashSet<Resource>();
					}
					removedResources.add(resource);
				}
			}

			if (removedResources != null) {
				configsChanged = true;
				Resource[] removedResourceArray = new Resource[removedResources
						.size()];
				removedResources.toArray(removedResourceArray);
				unloadConfigs(removedResourceArray);
			}

			if (newResources != null) {
				configsChanged = true;
				Resource[] newResourceArray = new Resource[newResources.size()];
				newResources.toArray(newResourceArray);
				loadConfigs(newResourceArray, false);
			}
		} catch (Exception e) {
			logger.error(e, e);
		}
		return configsChanged;
	}
}

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

package com.bstek.dorado.core.store;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.sql.CallableStatement;
import java.sql.Connection;
import java.util.List;
import java.util.Properties;

import javax.sql.DataSource;

import org.apache.commons.dbcp.BasicDataSource;
import org.apache.commons.lang.StringUtils;
import org.springframework.beans.factory.BeanNameAware;

import com.bstek.dorado.core.Constants;
import com.bstek.dorado.core.Context;
import com.bstek.dorado.core.io.Resource;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2012-12-9
 */
public abstract class SqlBaseStoreSupport implements SqlBaseStore,
		BeanNameAware {
	private static final String BEAN_NAME_PREFIX = "dorado.sqlBaseStore.";

	protected String namespace;
	protected int version;
	protected List<String> initScriptFiles;
	protected String scriptFileCharset;

	protected Boolean defaultAutoCommit;
	protected String defaultCatalog;
	protected Boolean defaultReadOnly;
	protected Integer defaultTransactionIsolation;
	protected String driverClassName;
	protected Integer maxActive;
	protected Integer maxIdle;
	protected Integer minIdle;
	protected Integer initialSize;
	protected Long maxWait;
	protected Long timeBetweenEvictionRunsMillis;
	protected Long minEvictableIdleTimeMillis;
	protected String password;
	protected String username;
	protected Properties connectionProperties;

	private DataSource dataSource;

	public void setBeanName(String name) {
		if (StringUtils.isEmpty(namespace) && name.startsWith(BEAN_NAME_PREFIX)) {
			namespace = StringUtils.substringAfterLast(name, ".");
		}
	}

	public String getNamespace() {
		return namespace;
	}

	public void setNamespace(String namespace) {
		this.namespace = namespace;
	}

	public int getVersion() {
		return version;
	}

	public void setVersion(int version) {
		this.version = version;
	}

	public List<String> getInitScriptFiles() {
		return initScriptFiles;
	}

	public void setInitScriptFiles(List<String> initScriptFiles) {
		this.initScriptFiles = initScriptFiles;
	}

	public String getScriptFileCharset() {
		return scriptFileCharset;
	}

	public void setScriptFileCharset(String scriptFileCharset) {
		this.scriptFileCharset = scriptFileCharset;
	}

	public Boolean getDefaultAutoCommit() {
		return defaultAutoCommit;
	}

	public void setDefaultAutoCommit(Boolean defaultAutoCommit) {
		this.defaultAutoCommit = defaultAutoCommit;
	}

	public String getDefaultCatalog() {
		return defaultCatalog;
	}

	public void setDefaultCatalog(String defaultCatalog) {
		this.defaultCatalog = defaultCatalog;
	}

	public Boolean getDefaultReadOnly() {
		return defaultReadOnly;
	}

	public void setDefaultReadOnly(Boolean defaultReadOnly) {
		this.defaultReadOnly = defaultReadOnly;
	}

	public Integer getDefaultTransactionIsolation() {
		return defaultTransactionIsolation;
	}

	public void setDefaultTransactionIsolation(
			Integer defaultTransactionIsolation) {
		this.defaultTransactionIsolation = defaultTransactionIsolation;
	}

	public String getDriverClassName() {
		return driverClassName;
	}

	public void setDriverClassName(String driverClassName) {
		this.driverClassName = driverClassName;
	}

	public Integer getMaxActive() {
		return maxActive;
	}

	public void setMaxActive(Integer maxActive) {
		this.maxActive = maxActive;
	}

	public Integer getMaxIdle() {
		return maxIdle;
	}

	public void setMaxIdle(Integer maxIdle) {
		this.maxIdle = maxIdle;
	}

	public Integer getMinIdle() {
		return minIdle;
	}

	public void setMinIdle(Integer minIdle) {
		this.minIdle = minIdle;
	}

	public Integer getInitialSize() {
		return initialSize;
	}

	public void setInitialSize(Integer initialSize) {
		this.initialSize = initialSize;
	}

	public Long getMaxWait() {
		return maxWait;
	}

	public void setMaxWait(Long maxWait) {
		this.maxWait = maxWait;
	}

	public Long getTimeBetweenEvictionRunsMillis() {
		return timeBetweenEvictionRunsMillis;
	}

	public void setTimeBetweenEvictionRunsMillis(
			Long timeBetweenEvictionRunsMillis) {
		this.timeBetweenEvictionRunsMillis = timeBetweenEvictionRunsMillis;
	}

	public Long getMinEvictableIdleTimeMillis() {
		return minEvictableIdleTimeMillis;
	}

	public void setMinEvictableIdleTimeMillis(Long minEvictableIdleTimeMillis) {
		this.minEvictableIdleTimeMillis = minEvictableIdleTimeMillis;
	}

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}

	public String getUsername() {
		return username;
	}

	public void setUsername(String username) {
		this.username = username;
	}

	public Properties getConnectionProperties() {
		return connectionProperties;
	}

	public void setConnectionProperties(Properties connectionProperties) {
		this.connectionProperties = connectionProperties;
	}

	protected synchronized DataSource getDataSource() throws Exception {
		if (dataSource != null) {
			return dataSource;
		}

		if (StringUtils.isBlank(namespace)) {
			throw new IllegalArgumentException(
					"The namespace of store cannot be empty. ");
		}

		prepareNamespace();

		BasicDataSource pds = new BasicDataSource();
		dataSource = pds;

		pds.setDriverClassName(driverClassName);
		pds.setUrl(getConnectionUrl());
		pds.setUsername(username);
		pds.setPassword(password);
		pds.setDefaultCatalog(defaultCatalog);

		if (defaultAutoCommit != null) {
			pds.setDefaultAutoCommit(defaultAutoCommit.booleanValue());
		}
		if (defaultReadOnly != null) {
			pds.setDefaultReadOnly(defaultReadOnly.booleanValue());
		}
		if (defaultTransactionIsolation != null) {
			pds.setDefaultTransactionIsolation(defaultTransactionIsolation
					.intValue());
		}
		if (maxActive != null) {
			pds.setMaxActive(maxActive.intValue());
		}
		if (maxIdle != null) {
			pds.setMaxIdle(maxIdle.intValue());
		}
		if (minIdle != null) {
			pds.setMinIdle(minIdle.intValue());
		}
		if (initialSize != null) {
			pds.setInitialSize(initialSize.intValue());
		}
		if (maxWait != null) {
			pds.setMaxWait(maxWait.longValue());
		}
		if (timeBetweenEvictionRunsMillis != null) {
			pds.setTimeBetweenEvictionRunsMillis(timeBetweenEvictionRunsMillis
					.longValue());
		}
		if (minEvictableIdleTimeMillis != null) {
			pds.setMinEvictableIdleTimeMillis(minEvictableIdleTimeMillis
					.longValue());
		}
		return dataSource;
	}

	protected void initNamespace(Connection conn) throws Exception {
		if (initScriptFiles != null && !initScriptFiles.isEmpty()) {
			Context context = Context.getCurrent();
			for (String initScriptFile : initScriptFiles) {
				Resource resource = context.getResource(initScriptFile);
				runInitScriptFile(conn, resource);
			}
		}
	}

	protected void runInitScriptFile(Connection conn, Resource initScriptFile)
			throws Exception {
		InputStream is = initScriptFile.getInputStream();
		try {
			InputStreamReader isr = new InputStreamReader(is,
					StringUtils.defaultIfEmpty(scriptFileCharset,
							Constants.DEFAULT_CHARSET));
			BufferedReader br = new BufferedReader(isr);

			StringBuffer scripts = new StringBuffer();
			String line = br.readLine();
			while (line != null) {
				scripts.append(line).append('\n');
				line = br.readLine();
			}

			if (scripts.length() > 0) {
				CallableStatement prepareCall = conn.prepareCall(scripts
						.toString());
				try {
					prepareCall.execute();
				} finally {
					prepareCall.close();
				}
			}

			br.close();
			isr.close();
		} finally {
			is.close();
		}
	}

	protected abstract String getConnectionUrl() throws Exception;

	protected abstract void prepareNamespace() throws Exception;

	public Connection getConnection() throws Exception {
		return getDataSource().getConnection();
	}

}
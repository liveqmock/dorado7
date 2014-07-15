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

package com.bstek.dorado.core.pkgs;

import java.io.InputStream;
import java.net.URL;
import java.net.URLConnection;
import java.util.ArrayList;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Properties;

import javax.servlet.ServletContextListener;

import org.apache.commons.lang.BooleanUtils;
import org.apache.commons.lang.StringUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

import com.bstek.dorado.util.clazz.ClassUtils;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2011-7-22
 */
public final class PackageManager {
	private static final Log logger = LogFactory.getLog(PackageManager.class);

	private static final String PACKAGE_PROPERTIES_LOCATION = "META-INF/dorado-package.properties";

	private static final String AGPL = "AGPL";
	private static final String BSDN_MEMBER = "BSDN-Member";
	private static final String BSDN_COMMERCIAL = "BSDN-Commercial";
	private static final String INHERITED = "Inherited";
	private static final String[] LICENSE_INHERITED = new String[] { AGPL,
			BSDN_MEMBER, BSDN_COMMERCIAL };

	private static final Map<String, PackageInfo> packageInfosMap = new LinkedHashMap<String, PackageInfo>();
	private static boolean packageInfoBuilded = false;

	private static class DependsVersion {
		private boolean includeMinVersion = true;
		private String minVersion;
		private boolean includeMaxVersion = true;
		private String maxVersion;

		public boolean isIncludeMinVersion() {
			return includeMinVersion;
		}

		public void setIncludeMinVersion(boolean includeMinVersion) {
			this.includeMinVersion = includeMinVersion;
		}

		public String getMinVersion() {
			return minVersion;
		}

		public void setMinVersion(String minVersion) {
			this.minVersion = minVersion;
		}

		public boolean isIncludeMaxVersion() {
			return includeMaxVersion;
		}

		public void setIncludeMaxVersion(boolean includeMaxVersion) {
			this.includeMaxVersion = includeMaxVersion;
		}

		public String getMaxVersion() {
			return maxVersion;
		}

		public void setMaxVersion(String maxVersion) {
			this.maxVersion = maxVersion;
		}
	}

	private PackageManager() {
	}

	private static String trimDependsVersion(String version) {
		if ("*".equals(version)) {
			return null;
		} else if (version.indexOf('*') >= 0) {
			throw new IllegalArgumentException();
		}
		return version;
	}

	private static DependsVersion parseDependsVersion(String text) {
		DependsVersion dependsVersion = new DependsVersion();

		boolean beforeContent = true, afterContent = false, inVersion = false, commaFound = false;
		StringBuffer version = new StringBuffer(16);
		char c;
		for (int i = 0, len = text.length(); i < len; i++) {
			c = text.charAt(i);
			if (c == ' ') {
				if (inVersion) {
					throw new IllegalArgumentException();
				}
				continue;
			} else if (afterContent) {
				throw new IllegalArgumentException();
			} else if (c == '[' || c == '(') {
				if (!beforeContent) {
					throw new IllegalArgumentException();
				}
				beforeContent = false;
				dependsVersion.setIncludeMinVersion(c == '[');
			} else if (c == ']' || c == ')') {
				if (beforeContent) {
					throw new IllegalArgumentException();
				}
				afterContent = true;
				dependsVersion.setIncludeMaxVersion(c == ']');
			} else if (c == ',') {
				if (beforeContent || commaFound) {
					throw new IllegalArgumentException();
				}
				if (version.length() > 0) {
					String v = trimDependsVersion(version.toString());
					dependsVersion.setMinVersion(v);
					version.setLength(0);
				}
			} else if (c >= '0' && c <= '9' || c >= 'a' && c <= 'z' || c >= 'A'
					&& c <= 'A' || c == '.' || c == '-' || c == '*') {
				version.append(c);
			} else {
				throw new IllegalArgumentException();
			}
		}

		if (version.length() > 0) {
			String v = trimDependsVersion(version.toString());
			if (commaFound) {
				dependsVersion.setMaxVersion(v);
			} else {
				dependsVersion.setMinVersion(v);
				dependsVersion.setMaxVersion(v);
			}
		}
		return dependsVersion;
	}

	private static int compareVersionSection(String section1, String section2) {
		if (StringUtils.isNumeric(section1) && StringUtils.isNumeric(section2)) {
			return Integer.valueOf(section1) - Integer.valueOf(section2);
		} else {
			return section1.compareTo(section2);
		}
	}

	private static int compareVersion(String version1, String version2) {
		String[] sections1 = StringUtils.split(version1, ".-");
		String[] sections2 = StringUtils.split(version2, ".-");
		for (int i = 0; i < sections1.length; i++) {
			if (i >= sections2.length) {
				break;
			}
			String section1 = sections1[i], section2 = sections2[i];
			int result = compareVersionSection(section1, section2);
			if (result != 0) {
				return result;
			}
		}
		return 0;
	}

	private static void calculateDepends(PackageInfo packageInfo,
			List<PackageInfo> calculatedPackages,
			Map<String, PackageInfo> packageMap) throws Exception {
		Dependence[] dependences = packageInfo.getDepends();
		if (dependences == null || dependences.length == 0) {
			pushPackageInfo(calculatedPackages, packageInfo);
			return;
		}

		for (Dependence dependence : dependences) {
			PackageInfo dependedPackageInfo = packageMap.get(dependence
					.getPackageName());
			if (dependedPackageInfo == null) {
				throw new IllegalArgumentException("Package  \""
						+ dependence.getPackageName()
						+ "\" not found, Which is depended by \""
						+ packageInfo.getName() + "\".");
			}

			if (StringUtils.isNotEmpty(dependence.getVersion())) {
				String dependedPackageVersion = dependedPackageInfo
						.getVersion();

				DependsVersion dependsVersion;
				try {
					dependsVersion = parseDependsVersion(dependence
							.getVersion());
				} catch (IllegalArgumentException e) {
					throw new IllegalArgumentException(
							"Invalid depends version \""
									+ dependence.getVersion()
									+ "\" found in Package \""
									+ packageInfo.getName() + "\".");
				}

				boolean versionMatch = true;
				if (StringUtils.isNotEmpty(dependsVersion.getMinVersion())) {
					int i = compareVersion(dependsVersion.getMinVersion(),
							dependedPackageVersion);
					if (i > 0 || i == 0
							&& !dependsVersion.isIncludeMinVersion()) {
						versionMatch = false;
					}
				}

				if (StringUtils.isNotEmpty(dependsVersion.getMaxVersion())) {
					int i = compareVersion(dependsVersion.getMaxVersion(),
							dependedPackageVersion);
					if (i < 0 || i == 0
							&& !dependsVersion.isIncludeMaxVersion()) {
						versionMatch = false;
					}
				}

				if (!versionMatch) {
					throw new IllegalArgumentException(
							"Depended version mismatch. Expect \""
									+ dependence.getVersion() + "\" but \""
									+ dependedPackageVersion + "\" found.");
				}
			}

			calculateDepends(dependedPackageInfo, calculatedPackages,
					packageMap);
		}
		pushPackageInfo(calculatedPackages, packageInfo);
	}

	private static void pushPackageInfo(List<PackageInfo> calculatedPackages,
			PackageInfo packageInfo) {
		if (!calculatedPackages.contains(packageInfo)) {
			String packageName = packageInfo.getName();
			if (packageName.equals("dorado-hibernate")
					|| packageName.equals("dorado-jdbc")) {
				calculatedPackages.add(1, packageInfo);
			} else {
				calculatedPackages.add(packageInfo);
			}
		}
	}

	private static Dependence parseDependence(String text) {
		Dependence dependence = new Dependence();

		String packageName = "", version = "";
		boolean versionFound = false;
		char c;
		for (int i = 0, len = text.length(); i < len; i++) {
			c = text.charAt(i);
			if (!versionFound) {
				if (c == '[' || c == '(') {
					versionFound = true;
					version += c;
				} else {
					packageName += c;
				}
			} else {
				version += c;
			}
		}

		if (StringUtils.isEmpty(packageName)) {
			throw new IllegalArgumentException(
					"Depended packageName undefined.");
		}
		dependence.setPackageName(packageName);

		if (version != null) {
			dependence.setVersion(version);
		}
		return dependence;
	}

	private static void doBuildPackageInfos() throws Exception {
		Map<String, PackageInfo> packageMap = new HashMap<String, PackageInfo>();

		Enumeration<URL> defaultContextFileResources = org.springframework.util.ClassUtils
				.getDefaultClassLoader().getResources(
						PACKAGE_PROPERTIES_LOCATION);
		while (defaultContextFileResources.hasMoreElements()) {
			URL url = defaultContextFileResources.nextElement();
			InputStream in = null;
			try {
				URLConnection con = url.openConnection();
				con.setUseCaches(false);
				in = con.getInputStream();
				Properties properties = new Properties();
				properties.load(in);

				String packageName = properties.getProperty("name");
				if (StringUtils.isEmpty(packageName)) {
					throw new IllegalArgumentException(
							"Package name undefined.");
				}

				PackageInfo packageInfo = new PackageInfo(packageName);

				packageInfo.setAddonVersion(properties
						.getProperty("addonVersion"));
				packageInfo.setVersion(properties.getProperty("version"));

				String dependsText = properties.getProperty("depends");
				if (StringUtils.isNotBlank(dependsText)) {
					List<Dependence> dependences = new ArrayList<Dependence>();
					for (String depends : StringUtils.split(dependsText, "; ")) {
						if (StringUtils.isNotEmpty(depends)) {
							Dependence dependence = parseDependence(depends);
							dependences.add(dependence);
						}
					}
					if (!dependences.isEmpty()) {
						packageInfo.setDepends(dependences
								.toArray(new Dependence[0]));
					}
				}

				String license = StringUtils.trim(properties
						.getProperty("license"));
				if (StringUtils.isNotEmpty(license)) {
					if (INHERITED.equals(license)) {
						packageInfo.setLicense(LICENSE_INHERITED);
					} else {
						String[] licenses = StringUtils.split(license);
						licenses = StringUtils.stripAll(licenses);
						packageInfo.setLicense(licenses);
					}
				}

				packageInfo.setLoadUnlicensed(BooleanUtils.toBoolean(properties
						.getProperty("loadUnlicensed")));

				packageInfo.setClassifier(properties.getProperty("classifier"));
				packageInfo.setHomePage(properties.getProperty("homePage"));
				packageInfo.setDescription(properties
						.getProperty("description"));

				packageInfo.setPropertiesLocations(properties
						.getProperty("propertiesConfigLocations"));
				packageInfo.setContextLocations(properties
						.getProperty("contextConfigLocations"));
				packageInfo.setComponentLocations(properties
						.getProperty("componentConfigLocations"));
				packageInfo.setServletContextLocations(properties
						.getProperty("servletContextConfigLocations"));

				String configurerClass = properties.getProperty("configurer");
				if (StringUtils.isNotBlank(configurerClass)) {
					Class<?> type = ClassUtils.forName(configurerClass);
					packageInfo.setConfigurer((PackageConfigurer) type
							.newInstance());
				}

				String listenerClass = properties.getProperty("listener");
				if (StringUtils.isNotBlank(listenerClass)) {
					Class<?> type = ClassUtils.forName(listenerClass);
					packageInfo.setListener((PackageListener) type
							.newInstance());
				}

				String servletContextListenerClass = properties
						.getProperty("servletContextListener");
				if (StringUtils.isNotBlank(servletContextListenerClass)) {
					Class<?> type = ClassUtils
							.forName(servletContextListenerClass);
					packageInfo
							.setServletContextListener((ServletContextListener) type
									.newInstance());
				}

				if (packageMap.containsKey(packageName)) {
					PackageInfo conflictPackageInfo = packageMap
							.get(packageName);
					StringBuffer conflictInfo = new StringBuffer(20);
					conflictInfo.append('[')
							.append(conflictPackageInfo.getName())
							.append(" - ")
							.append(conflictPackageInfo.getVersion())
							.append(']');
					conflictInfo.append(" and ");
					conflictInfo.append('[').append(packageInfo.getName())
							.append(" - ").append(packageInfo.getVersion())
							.append(']');

					Exception e = new IllegalArgumentException(
							"More than one package \"" + packageName
									+ "\" found. They are "
									+ conflictInfo.toString());
					logger.warn(e, e);
				}

				packageMap.put(packageName, packageInfo);
			} catch (Exception e) {
				throw new IllegalArgumentException(
						"Error occured during parsing \"" + url.getPath()
								+ "\".", e);
			} finally {
				if (in != null) {
					in.close();
				}
			}
		}

		List<PackageInfo> calculatedPackages = new ArrayList<PackageInfo>();
		for (PackageInfo packageInfo : packageMap.values()) {
			calculateDepends(packageInfo, calculatedPackages, packageMap);
		}

		packageInfosMap.clear();
		for (PackageInfo packageInfo : calculatedPackages) {
			packageInfosMap.put(packageInfo.getName(), packageInfo);
		}
	}

	private static void buildPackageInfos() throws Exception {
		if (!packageInfoBuilded) {
			packageInfoBuilded = true;
			doBuildPackageInfos();
		}
	}

	public static Map<String, PackageInfo> getPackageInfoMap() throws Exception {
		buildPackageInfos();
		return packageInfosMap;
	}
}

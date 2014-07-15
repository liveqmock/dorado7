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

package com.bstek.dorado.view.registry;

import java.util.Collection;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.Map;
import java.util.Set;

import org.apache.commons.collections.set.UnmodifiableSet;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

import com.bstek.dorado.util.clazz.ClassTypeRegistry;
import com.bstek.dorado.view.widget.Component;

/**
 * 默认的组件类型信息注册管理器。
 * 
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Jan 21, 2008
 */
public class DefaultComponentTypeRegistry implements ComponentTypeRegistry {
	private static final Log logger = LogFactory
			.getLog(DefaultComponentTypeRegistry.class);

	private ClassTypeRegistry<ComponentTypeRegisterInfo> classTypeRegistry = new ClassTypeRegistry<ComponentTypeRegisterInfo>();
	private Map<String, ComponentTypeRegisterInfo> registerInfoMap = new HashMap<String, ComponentTypeRegisterInfo>();
	private Set<ComponentTypeRegisterInfo> registerInfoSet = new LinkedHashSet<ComponentTypeRegisterInfo>();

	public void registerType(ComponentTypeRegisterInfo registerInfo) {
		registerInfoMap.put(registerInfo.getName(), registerInfo);
		Class<? extends Component> classType = registerInfo.getClassType();
		if (classType != null) {
			classTypeRegistry.registerType(classType, registerInfo);
		}
		registerInfoSet.add(registerInfo);
	}

	private ComponentTypeRegisterInfo initializeRefisterInfo(
			ComponentTypeRegisterInfo registerInfo) {
		try {
			if (registerInfo instanceof LazyInitailizeComponentTypeRegistryInfo) {
				LazyInitailizeComponentTypeRegistryInfo lazyRegistryInfo = (LazyInitailizeComponentTypeRegistryInfo) registerInfo;
				if (!lazyRegistryInfo.isInitialized()) {
					lazyRegistryInfo.initialize();
				}
			}
			return registerInfo;
		} catch (Exception e) {
			logger.error(e, e);
			return null;
		}
	}

	public ComponentTypeRegisterInfo getRegisterInfo(String componentName) {
		ComponentTypeRegisterInfo registerInfo = registerInfoMap
				.get(componentName);
		return initializeRefisterInfo(registerInfo);
	}

	public ComponentTypeRegisterInfo getRegisterInfo(Class<?> componentType) {
		ComponentTypeRegisterInfo registerInfo = classTypeRegistry
				.getMatchingValue(componentType);
		return initializeRefisterInfo(registerInfo);
	}

	@SuppressWarnings("unchecked")
	public Collection<ComponentTypeRegisterInfo> getRegisterInfos() {
		for (ComponentTypeRegisterInfo registerInfo : registerInfoSet) {
			initializeRefisterInfo(registerInfo);
		}
		return UnmodifiableSet.decorate(registerInfoSet);
	}
}

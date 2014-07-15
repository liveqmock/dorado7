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

package com.bstek.dorado.common.event;

import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

import org.apache.commons.collections.map.UnmodifiableMap;
import org.apache.commons.lang.StringUtils;

import com.bstek.dorado.annotation.ClientEvents;
import com.bstek.dorado.common.ClientType;

/**
 * 客户端事件的注册管理器。
 * 
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Apr 10, 2008
 */
public class ClientEventRegistry {
	private static Map<Class<?>, Map<String, ClientEventRegisterInfo>> typeMap = new HashMap<Class<?>, Map<String, ClientEventRegisterInfo>>();
	private static Map<Class<?>, Map<String, ClientEventRegisterInfo>> typeMapCache = new HashMap<Class<?>, Map<String, ClientEventRegisterInfo>>();
	private static Set<Class<?>> processedTypes = new HashSet<Class<?>>();

	private static Map<String, ClientEventRegisterInfo> EMPTY_MAP = Collections
			.emptyMap();

	/**
	 * 注册一个客户端事件。
	 * 
	 * @param clientEventRegisterInfo
	 *            客户端事件的注册信息
	 */
	public static void registerClientEvent(
			ClientEventRegisterInfo clientEventRegisterInfo) {
		Class<?> type = clientEventRegisterInfo.getType();
		if (type == null) {
			throw new NullPointerException("[type] should not be null.");
		}

		Map<String, ClientEventRegisterInfo> eventMap = typeMap.get(type);
		if (eventMap == null) {
			eventMap = new HashMap<String, ClientEventRegisterInfo>();
			typeMap.put(type, eventMap);
		}

		String eventName = clientEventRegisterInfo.getName();
		if (StringUtils.isEmpty(eventName)) {
			throw new IllegalArgumentException(
					"[eventName] should not be empty.");
		}

		if (eventMap.containsKey(eventName)) {
			throw new IllegalArgumentException("Client event ["
					+ type.getName() + "," + eventName
					+ "] is already registered.");
		}

		eventMap.put(eventName, clientEventRegisterInfo);
	}

	public static Map<String, ClientEventRegisterInfo> getOwnClientEventRegisterInfos(
			Class<?> type) {
		collectClientEventRegisterInfosFromSingleType(type);
		return typeMap.get(type);
	}

	private static void collectClientEventRegisterInfos(
			Map<String, ClientEventRegisterInfo> eventMap, Class<?> type) {
		Class<?> superType = type.getSuperclass();
		if (superType != null) {
			collectClientEventRegisterInfos(eventMap, superType);
		}

		Class<?>[] interfaces = type.getInterfaces();
		for (int i = 0; i < interfaces.length; i++) {
			Class<?> interfaceType = interfaces[i];
			collectClientEventRegisterInfos(eventMap, interfaceType);
		}

		collectClientEventRegisterInfosFromSingleType(type);

		Map<String, ClientEventRegisterInfo> selfEventMap = typeMap.get(type);
		if (selfEventMap != null) {
			eventMap.putAll(selfEventMap);
		}
	}

	protected static void collectClientEventRegisterInfosFromSingleType(
			Class<?> type) {
		if (!processedTypes.contains(type)) {
			processedTypes.add(type);

			ClientEvents clientEvents = type.getAnnotation(ClientEvents.class);
			if (clientEvents != null && clientEvents.value() != null) {
				for (com.bstek.dorado.annotation.ClientEvent clientEvent : clientEvents
						.value()) {
					String[] signature = clientEvent.signature();
					if (signature.length == 1
							&& StringUtils.isEmpty(signature[0])) {
						signature = null;
					}
					ClientEventRegisterInfo clientEventRegisterInfo = new ClientEventRegisterInfo(
							type, clientEvent.name(), signature);
					clientEventRegisterInfo.setDeprecated(clientEvent
							.deprecated());

					int clientTypes = ClientType.parseClientTypes(clientEvent
							.clientTypes());
					if (clientTypes > 0) {
						clientEventRegisterInfo.setClientTypes(clientTypes);
					}

					ClientEventRegistry
							.registerClientEvent(clientEventRegisterInfo);
				}
			}
		}
	}

	/**
	 * 根据事件宿主的Class类型返回所有其支持的客户端事件的注册信息。
	 * 
	 * @param type
	 *            事件宿主的Class类型
	 * @return 客户端事件注册信息的Map集合。其中Map集合的键为事件名，值为相应的事件注册信息。
	 */
	@SuppressWarnings("unchecked")
	public static Map<String, ClientEventRegisterInfo> getClientEventRegisterInfos(
			Class<? extends ClientEventSupported> type) {
		synchronized (type) {
			Map<String, ClientEventRegisterInfo> eventMap = typeMapCache
					.get(type);
			if (eventMap == null) {
				eventMap = new HashMap<String, ClientEventRegisterInfo>();
				collectClientEventRegisterInfos(eventMap, type);
				eventMap = (eventMap.isEmpty()) ? EMPTY_MAP : UnmodifiableMap
						.decorate(eventMap);
				typeMapCache.put(type, eventMap);
			}
			return eventMap;
		}
	}

	/**
	 * 根据事件宿主的Class类型和事件名返回相应的事件的注册信息。
	 * 
	 * @param type
	 *            事件宿主的Class类型
	 * @param eventName
	 *            事件名
	 * @return 事件注册信息
	 */
	public static ClientEventRegisterInfo getClientEventRegisterInfo(
			Class<? extends ClientEventSupported> type, String eventName) {
		Map<String, ClientEventRegisterInfo> eventMap = getClientEventRegisterInfos(type);
		return (eventMap != null) ? eventMap.get(eventName) : null;
	}
}

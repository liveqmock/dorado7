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

package com.bstek.dorado.view.service;

import java.io.Writer;
import java.lang.reflect.Type;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

import org.apache.commons.lang.StringUtils;
import org.codehaus.jackson.node.ObjectNode;

import com.bstek.dorado.common.service.ExposedServiceDefintion;
import com.bstek.dorado.core.Configure;
import com.bstek.dorado.data.JsonConvertContext;
import com.bstek.dorado.data.JsonUtils;
import com.bstek.dorado.util.Assert;
import com.bstek.dorado.view.longpolling.LongPollingGroup;
import com.bstek.dorado.view.longpolling.LongPollingManager;
import com.bstek.dorado.view.longpolling.LongPollingSocket;
import com.bstek.dorado.view.output.OutputContext;
import com.bstek.dorado.view.socket.Message;
import com.bstek.dorado.view.socket.Socket;
import com.bstek.dorado.web.DoradoContext;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2014-1-22
 */
public class LongPollingServiceProcessor extends AbstractRemoteServiceProcessor {
	private static final Type[] REQUIRED_PARAMETER_TYPES = new Type[] { Socket.class };
	private static final String[] REQUIRED_PARAMETER_NAMES = new String[] { "socket" };
	private static final long ONE_SECOND = 1000;
	private static final String NEW_SOCKET_GROUP_ID_KEY = LongPollingServiceProcessor.class
			.getName() + ".newGroupId";

	private static final String HAND_SHAKE = "hand-shake";
	private static final String SEND = "send";
	private static final String POLL = "poll";
	private static final String STOP_POLL = "stop-poll";
	private static final String DISCONNECT = "disconnect";

	private boolean inited;
	private LongPollingManager longPollingManager;
	private Map<String, LongPollingGroup> longPollingGroups;
	private long pollDuration;
	private long defaultResponseDelay;
	private long minResponseDelay;

	public void setLongPollingManager(LongPollingManager longPollingManager) {
		this.longPollingManager = longPollingManager;
	}

	protected void doExecute(Writer writer, ObjectNode objectNode,
			DoradoContext context) throws Exception {
		synchronized (this) {
			if (!inited) {
				inited = true;
				longPollingGroups = new ConcurrentHashMap<String, LongPollingGroup>();
				pollDuration = Configure.getLong("view.longPolling.duration",
						20) * ONE_SECOND;
				defaultResponseDelay = Configure.getLong(
						"view.longPolling.defaultResponseDelay", 200);
				minResponseDelay = Configure.getLong(
						"view.longPolling.minResponseDelay", 50);
			}
		}

		// hand-shake、send、poll、disconnect
		String subAction = JsonUtils.getString(objectNode, "subAction");
		Object result = null;

		if (POLL.equals(subAction)) {
			result = processPoll(writer, objectNode, context);
		} else if (STOP_POLL.equals(subAction)) {
			result = processStopPoll(writer, objectNode, context);
		} else if (SEND.equals(subAction)) {
			result = processSend(writer, objectNode, context);
		} else if (HAND_SHAKE.equals(subAction)) {
			result = processHandShake(writer, objectNode, context);
		} else if (DISCONNECT.equals(subAction)) {
			result = processDisconnect(writer, objectNode, context);
		} else {
			throw new IllegalArgumentException(
					"Unrecognized long-polling action [" + subAction + "].");
		}

		OutputContext outputContext = new OutputContext(writer);
		outputContext.setUsePrettyJson(Configure
				.getBoolean("view.outputPrettyJson"));
		getDataOutputter().output(result, outputContext);
	}

	protected Object processHandShake(Writer writer, ObjectNode objectNode,
			DoradoContext context) throws Exception {
		String serviceName = JsonUtils.getString(objectNode, "service");
		Assert.notEmpty(serviceName);

		String groupId = JsonUtils.getString(objectNode, "groupId");
		long responseDelay = JsonUtils.getLong(objectNode, "responseDelay");

		ExposedServiceDefintion exposedService = getExposedServiceManager()
				.getService(serviceName);
		if (exposedService == null) {
			throw new IllegalArgumentException("Unknown ExposedService ["
					+ serviceName + "].");
		}

		Object parameter = jsonToJavaObject(objectNode.get("parameter"), null,
				null, false);

		LongPollingSocket socket = longPollingManager.connect(serviceName);
		if (responseDelay >= 0) {
			socket.setResponseDelay(responseDelay);
		}

		Object returnValue = invokeRemoteService(writer, context, serviceName,
				parameter, REQUIRED_PARAMETER_NAMES, REQUIRED_PARAMETER_TYPES,
				new Object[] { socket });

		if (StringUtils.isEmpty(groupId)) {
			groupId = (String) context.getAttribute(DoradoContext.THREAD,
					NEW_SOCKET_GROUP_ID_KEY);
			if (StringUtils.isEmpty(groupId)) {
				groupId = UUID.randomUUID().toString();
				context.setAttribute(DoradoContext.THREAD,
						NEW_SOCKET_GROUP_ID_KEY, groupId);
			}
		}

		Map<String, Object> result = new HashMap<String, Object>();
		result.put("socketId", socket.getId());
		result.put("groupId", groupId);
		result.put("returnValue", returnValue);
		return result;
	}

	protected LongPollingSocket getSocket(ObjectNode objectNode) {
		String socketId = JsonUtils.getString(objectNode, "socketId");
		return longPollingManager.getSocket(socketId);
	}

	protected Object processSend(Writer writer, ObjectNode objectNode,
			DoradoContext context) throws Exception {
		LongPollingSocket socket = getSocket(objectNode);

		String type = JsonUtils.getString(objectNode, "type");

		JsonConvertContext jsonContext = new JsonConvertContextImpl(false,
				false, null);
		Object data = JsonUtils.toJavaObject(objectNode.get("data"), null,
				null, false, jsonContext);
		socket.push(new Message(type, data));
		return null;
	}

	protected Object processPoll(Writer writer, ObjectNode objectNode,
			DoradoContext context) throws Exception {
		String groupId = JsonUtils.getString(objectNode, "groupId");

		LongPollingGroup longPollingGroup = new LongPollingGroup();
		longPollingGroups.put(groupId, longPollingGroup);

		try {
			long responseDelay = -1;
			String[] socketIds = JsonUtils.get(objectNode, "socketIds",
					String[].class);
			for (String socketId : socketIds) {
				LongPollingSocket socket = longPollingManager
						.getSocket(socketId);
				if (socket != null) {
					long socketResponseDelay = socket.getResponseDelay();
					if (socketResponseDelay >= 0
							&& socketResponseDelay < responseDelay) {
						responseDelay = socketResponseDelay;
					}
					longPollingGroup.addSocket(socket);
					socket.updateLastAccess();
				}
			}

			if (responseDelay < 0) {
				responseDelay = defaultResponseDelay;
			} else if (responseDelay < minResponseDelay) {
				responseDelay = minResponseDelay;
			}
			return longPollingGroup.polling(pollDuration, responseDelay);
		} finally {
			synchronized (longPollingGroups) {
				if (longPollingGroups.get(groupId) == longPollingGroup) {
					longPollingGroups.remove(groupId);
				}
			}
		}
	}

	protected Object processStopPoll(Writer writer, ObjectNode objectNode,
			DoradoContext context) throws Exception {
		String groupId = JsonUtils.getString(objectNode, "groupId");

		LongPollingGroup longPollingGroup = longPollingGroups.get(groupId);
		if (longPollingGroup != null) {
			longPollingGroup.terminate();
			longPollingGroup = null;
		}
		return null;
	}

	protected Object processDisconnect(Writer writer, ObjectNode objectNode,
			DoradoContext context) throws Exception {
		LongPollingSocket socket = getSocket(objectNode);
		socket.disconnect(false);
		return null;
	}

}

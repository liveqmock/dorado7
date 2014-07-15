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

package com.bstek.dorado.view.task;

import java.lang.reflect.Method;
import java.lang.reflect.Type;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

import org.apache.commons.beanutils.BeanUtils;
import org.apache.commons.lang.StringUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

import com.bstek.dorado.common.service.ExposedServiceDefintion;
import com.bstek.dorado.common.service.ExposedServiceManager;
import com.bstek.dorado.core.bean.BeanFactoryUtils;
import com.bstek.dorado.core.resource.ResourceManager;
import com.bstek.dorado.core.resource.ResourceManagerUtils;
import com.bstek.dorado.data.ParameterWrapper;
import com.bstek.dorado.data.method.MethodAutoMatchingException;
import com.bstek.dorado.data.method.MethodAutoMatchingUtils;
import com.bstek.dorado.data.method.MoreThanOneMethodsMatchsException;
import com.bstek.dorado.util.WeakHashSet;
import com.bstek.dorado.view.longpolling.LongPollingManager;
import com.bstek.dorado.view.socket.Socket;
import com.bstek.dorado.web.DoradoContext;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2014-1-26
 */
public class LongTaskSocketServer implements SocketLongTaskConnectorListener {
	public static final String LONG_TASK_KEY_PREFIX = DefaultTaskScheduler.class
			.getName() + '.';
	public static final String TASK_SCHEDULER_KEY_PREFIX = TaskScheduler.class
			.getName() + '.';
	public static final String TASK_CONNECTOR_KEY_PREFIX = SocketLongTaskConnector.class
			.getName() + '.';

	public static class TaskStatePacket extends TaskStateInfo {
		private long transferTimestamp = System.currentTimeMillis();
		private long waitingStartTime;
		private long runningStartTime;

		public TaskStatePacket(LongTaskThread taskThread) throws Exception {
			BeanUtils.copyProperties(this, taskThread.getTask().getStateInfo());
			setWaitingStartTime(taskThread.getWaitingStartTime());
			setRunningStartTime(taskThread.getRunningStartTime());
		}

		public long getTransferTimestamp() {
			return transferTimestamp;
		}

		public void setTransferTimestamp(long transferTimestamp) {
			this.transferTimestamp = transferTimestamp;
		}

		public long getWaitingStartTime() {
			return waitingStartTime;
		}

		public void setWaitingStartTime(long waitingStartTime) {
			this.waitingStartTime = waitingStartTime;
		}

		public long getRunningStartTime() {
			return runningStartTime;
		}

		public void setRunningStartTime(long runningStartTime) {
			this.runningStartTime = runningStartTime;
		}
	}

	private static final Log logger = LogFactory
			.getLog(LongTaskSocketServer.class);

	private static final ResourceManager resourceManager = ResourceManagerUtils
			.get(LongTaskSocketServer.class);

	private static final Object[] EMPTY_ARGS = new Object[0];
	private static final String[] EMPTY_NAMES = new String[0];
	private static final Class<?>[] EMPTY_TYPES = new Class[0];

	protected static final class AbortException extends RuntimeException {
		private static final long serialVersionUID = 796823157518443055L;
	}

	private ExposedServiceManager exposedServiceManager;
	private LongPollingManager longPollingManager;
	private Map<String, SocketLongTaskConnector> connectorMap = new ConcurrentHashMap<String, SocketLongTaskConnector>();

	public void setExposedServiceManager(
			ExposedServiceManager exposedServiceManager) {
		this.exposedServiceManager = exposedServiceManager;
	}

	public void setLongPollingManager(LongPollingManager longPollingManager) {
		this.longPollingManager = longPollingManager;
	}

	@SuppressWarnings("unchecked")
	public TaskStatePacket connectLongTask(DoradoContext context,
			Socket socket, String taskName) throws Exception {
		ExposedServiceDefintion exposedService = exposedServiceManager
				.getService(taskName);
		if (exposedService == null) {
			throw new IllegalArgumentException("Unknown ExposedService ["
					+ taskName + "].");
		}

		LongTaskDefinition taskDefinition = (LongTaskDefinition) exposedService
				.getExDefinition();
		String threadAttributeKey = LONG_TASK_KEY_PREFIX + taskName;
		String scope = (taskDefinition != null && taskDefinition.getScope() == LongTaskScope.application) ? DoradoContext.APPLICATION
				: DoradoContext.SESSION;

		TaskStatePacket taskStatePacket = null;
		LongTaskThread taskThread = (LongTaskThread) context.getAttribute(
				scope, threadAttributeKey);
		if (taskThread != null && taskThread.isAlive()) {
			taskStatePacket = new TaskStatePacket(taskThread);
		}

		String socketId = socket.getId();
		SocketLongTaskConnector connector = connectorMap.get(socketId);
		if (connector == null) {
			connector = new SocketLongTaskConnector(socket);
			if (taskThread != null) {
				connector.setTaskThread(taskThread);
			}
			connector.addListener(this);
			connectorMap.put(socketId, connector);

			synchronized (this) {
				String connectorAttributeKey = TASK_CONNECTOR_KEY_PREFIX
						+ taskName;
				Set<SocketLongTaskConnector> connectors = (Set<SocketLongTaskConnector>) context
						.getAttribute(scope, connectorAttributeKey);
				if (connectors == null) {
					connectors = new WeakHashSet<SocketLongTaskConnector>();
					context.setAttribute(scope, connectorAttributeKey,
							connectors);
				}
				connectors.add(connector);
			}
		}
		return taskStatePacket;
	}

	@SuppressWarnings("unchecked")
	public void startLongTask(DoradoContext context,
			Map<String, Object> parameter) throws Exception {
		String taskName = (String) parameter.get("taskName");
		String socketId = (String) parameter.get("socketId");
		Object realParameter = parameter.get("parameter");

		ExposedServiceDefintion exposedService = exposedServiceManager
				.getService(taskName);
		if (exposedService == null) {
			throw new IllegalArgumentException("Unknown ExposedService ["
					+ taskName + "].");
		}

		Socket socket = longPollingManager.getSocket(socketId);
		if (socket == null) {
			throw new IllegalArgumentException("Unrecognized socketId ["
					+ socketId + "].");
		}

		String threadAttributeKey = LONG_TASK_KEY_PREFIX + taskName;
		LongTaskDefinition taskDefinition = (LongTaskDefinition) exposedService
				.getExDefinition();
		String scope = (taskDefinition != null && taskDefinition.getScope() == LongTaskScope.application) ? DoradoContext.APPLICATION
				: DoradoContext.SESSION;

		LongTaskThread currentTaskThread = (LongTaskThread) context
				.getAttribute(scope, threadAttributeKey);
		if (currentTaskThread != null) {
			if (currentTaskThread.getState() == Thread.State.TERMINATED) {
				currentTaskThread = null;
				context.removeAttribute(scope, threadAttributeKey);
			} else {
				throw new IllegalStateException(resourceManager.getString(
						"dorado.view/errorLongTaskRunning", taskName));
			}
		}

		LongTask task = getLongTask(context, exposedService, realParameter);

		LongTaskThread taskThread = new LongTaskThread(task);
		taskThread.setName(taskName);

		String connectorAttributeKey = TASK_CONNECTOR_KEY_PREFIX + taskName;
		Set<SocketLongTaskConnector> connectors = (Set<SocketLongTaskConnector>) context
				.getAttribute(scope, connectorAttributeKey);
		if (connectors != null) {
			Iterator<SocketLongTaskConnector> it = connectors.iterator();
			while (it.hasNext()) {
				SocketLongTaskConnector connector = it.next();
				if (connector.isClosed()) {
					it.remove();
				} else {
					connector.setTaskThread(taskThread);
				}
			}
		}

		TaskScheduler scheduler = getTaskScheduler(context, taskName,
				exposedService);
		scheduler.queueTask(context, taskThread);
		context.setAttribute(scope, threadAttributeKey, taskThread);
	}

	protected synchronized TaskScheduler getTaskScheduler(
			DoradoContext context, String taskName,
			ExposedServiceDefintion exposedService) throws Exception {
		String schedulerAttributeKey = TASK_SCHEDULER_KEY_PREFIX + taskName;
		TaskScheduler scheduler = (TaskScheduler) context.getAttribute(
				DoradoContext.APPLICATION, schedulerAttributeKey);
		if (scheduler == null) {
			LongTaskDefinition taskDefinition = (LongTaskDefinition) exposedService
					.getExDefinition();
			if (taskDefinition == null) {
				taskDefinition = new LongTaskDefinition(taskName);
			}

			String schedularImpl = taskDefinition.getSchedular();
			if (StringUtils.isNotEmpty(schedularImpl)) {
				scheduler = (TaskScheduler) BeanFactoryUtils
						.getBean(schedularImpl);
			} else {
				scheduler = new DefaultTaskScheduler();
			}
			scheduler.setTaskDefinition(taskDefinition);

			context.setAttribute(DoradoContext.APPLICATION,
					schedulerAttributeKey, scheduler);
		}
		return scheduler;
	}

	public void onClose(SocketLongTaskConnector connector) {
		Socket socket = connector.getSocket();
		if (socket.isConnected()) {
			connector.setTaskThread(null);
		} else {
			connectorMap.remove(socket.getId());
		}
	}

	protected LongTask getLongTask(DoradoContext context,
			ExposedServiceDefintion exposedService, Object parameter)
			throws Exception {
		Object serviceBean = BeanFactoryUtils.getBean(exposedService.getBean());
		String methodName = exposedService.getMethod();
		Method[] methods = MethodAutoMatchingUtils.getMethodsByName(
				serviceBean.getClass(), methodName);
		if (methods.length == 0) {
			throw new NoSuchMethodException("Method [" + methodName
					+ "] not found in [" + exposedService.getBean() + "].");
		}

		LongTask returnValue = null;

		boolean methodInvoked = false;
		MethodAutoMatchingException[] exceptions = new MethodAutoMatchingException[4];
		int i = 0;
		try {
			try {
				returnValue = invokeByParameterName(serviceBean, methods,
						parameter, false);
				methodInvoked = true;
			} catch (MoreThanOneMethodsMatchsException e) {
				throw e;
			} catch (MethodAutoMatchingException e) {
				exceptions[i++] = e;
			} catch (AbortException e) {
				// do nothing
			}

			if (!methodInvoked) {
				try {
					returnValue = invokeByParameterName(serviceBean, methods,
							parameter, true);
					methodInvoked = true;
				} catch (MoreThanOneMethodsMatchsException e) {
					throw e;
				} catch (MethodAutoMatchingException e) {
					exceptions[i++] = e;
				} catch (AbortException e) {
					// do nothing
				}
			}

			if (!methodInvoked) {
				try {
					returnValue = invokeByParameterType(serviceBean, methods,
							parameter, false);
					methodInvoked = true;
				} catch (MoreThanOneMethodsMatchsException e) {
					throw e;
				} catch (MethodAutoMatchingException e) {
					exceptions[i++] = e;
				} catch (AbortException e) {
					// do nothing
				}
			}

			if (!methodInvoked) {
				try {
					returnValue = invokeByParameterType(serviceBean, methods,
							parameter, true);
					methodInvoked = true;
				} catch (MoreThanOneMethodsMatchsException e) {
					throw e;
				} catch (MethodAutoMatchingException e) {
					exceptions[i++] = e;
				} catch (AbortException e) {
					// do nothing
				}
			}
		} catch (MethodAutoMatchingException e) {
			exceptions[i++] = e;
		}

		if (methodInvoked) {
			return returnValue;
		} else {
			for (MethodAutoMatchingException e : exceptions) {
				if (e == null) {
					break;
				}
				logger.error(e.getMessage());
			}
			throw new IllegalArgumentException(resourceManager.getString(
					"dorado.common/noMatchingMethodError", serviceBean
							.getClass().getName(), methodName));
		}
	}

	protected LongTask invokeByParameterName(Object serviceBean,
			Method[] methods, Object parameter, boolean disassembleParameter)
			throws MethodAutoMatchingException, Exception {
		Map<String, Object> sysParameter = null;
		if (parameter instanceof ParameterWrapper) {
			ParameterWrapper parameterWrapper = (ParameterWrapper) parameter;
			parameter = parameterWrapper.getParameter();
			sysParameter = parameterWrapper.getSysParameter();
		}

		if (disassembleParameter
				&& (parameter == null && !(parameter instanceof Map<?, ?>))) {
			throw new AbortException();
		}

		String[] parameterParameterNames = EMPTY_NAMES;
		Object[] parameterParameters = EMPTY_ARGS;
		if (parameter != null && parameter instanceof Map<?, ?>) {
			if (disassembleParameter) {
				Map<?, ?> map = (Map<?, ?>) parameter;
				parameterParameterNames = new String[map.size()];
				parameterParameters = new Object[parameterParameterNames.length];

				int i = 0;
				for (Map.Entry<?, ?> entry : map.entrySet()) {
					parameterParameterNames[i] = (String) entry.getKey();
					parameterParameters[i] = entry.getValue();
					i++;
				}
			} else {
				parameterParameterNames = new String[] { "parameter" };
				parameterParameters = new Object[] { parameter };
			}
		} else {
			parameterParameterNames = new String[] { "parameter" };
			parameterParameters = new Object[] { parameter };
		}

		String[] optionalParameterNames = new String[parameterParameterNames.length];
		Object[] optionalParameters = new Object[optionalParameterNames.length];
		System.arraycopy(parameterParameterNames, 0, optionalParameterNames, 0,
				parameterParameterNames.length);
		System.arraycopy(parameterParameters, 0, optionalParameters, 0,
				parameterParameters.length);

		String[] extraParameterNames = null;
		Object[] extraParameters = null;
		if (sysParameter != null && !sysParameter.isEmpty()) {
			extraParameterNames = new String[sysParameter.size()];
			extraParameters = new Object[extraParameterNames.length];

			int i = 0;
			for (Map.Entry<?, ?> entry : sysParameter.entrySet()) {
				extraParameterNames[i] = (String) entry.getKey();
				extraParameters[i] = entry.getValue();
				i++;
			}
		}

		return (LongTask) MethodAutoMatchingUtils.invokeMethod(methods,
				serviceBean, null, null, optionalParameterNames,
				optionalParameters, extraParameterNames, extraParameters);
	}

	protected LongTask invokeByParameterType(Object serviceBean,
			Method[] methods, Object parameter, boolean disassembleParameter)
			throws MethodAutoMatchingException, Exception {
		Map<String, Object> sysParameter = null;
		if (parameter instanceof ParameterWrapper) {
			ParameterWrapper parameterWrapper = (ParameterWrapper) parameter;
			parameter = parameterWrapper.getParameter();
			sysParameter = parameterWrapper.getSysParameter();
		}

		if (disassembleParameter
				&& (parameter == null && !(parameter instanceof Map<?, ?>))) {
			throw new AbortException();
		}

		Type[] optionalParameterTypes = EMPTY_TYPES;
		Object[] optionalParameters = EMPTY_ARGS;
		if (parameter != null) {
			if (parameter instanceof Map<?, ?>) {
				if (disassembleParameter) {
					Map<?, ?> map = (Map<?, ?>) parameter;
					optionalParameterTypes = new Class[map.size()];
					optionalParameters = new Object[optionalParameterTypes.length];

					int i = 0;
					for (Object value : map.values()) {
						if (value != null) {
							optionalParameterTypes[i] = MethodAutoMatchingUtils
									.getTypeForMatching(value);
							optionalParameters[i] = value;
							i++;
						}
					}
				} else {
					optionalParameterTypes = new Type[] { MethodAutoMatchingUtils
							.getTypeForMatching(parameter) };
					optionalParameters = new Object[] { parameter };
				}
			} else {
				optionalParameterTypes = new Type[] { MethodAutoMatchingUtils
						.getTypeForMatching(parameter) };
				optionalParameters = new Object[] { parameter };
			}
		} else {
			optionalParameterTypes = new Type[] { Object.class };
			optionalParameters = new Object[] { null };
		}

		Type[] exactArgTypes = null;
		Object[] exactArgs = null;
		Map<Type, Object> extraArgMap = new HashMap<Type, Object>();
		if (sysParameter != null && !sysParameter.isEmpty()) {
			for (Map.Entry<?, ?> entry : sysParameter.entrySet()) {
				Object value = entry.getValue();
				if (value != null) {
					extraArgMap.put(
							MethodAutoMatchingUtils.getTypeForMatching(value),
							value);
				}
			}

			if (!extraArgMap.isEmpty()) {
				exactArgTypes = new Class[extraArgMap.size()];
				exactArgs = new Object[exactArgTypes.length];
				int i = 0;
				for (Map.Entry<?, ?> entry : extraArgMap.entrySet()) {
					exactArgTypes[i] = (Class<?>) entry.getKey();
					exactArgs[i] = entry.getValue();
					i++;
				}
			}
		}

		return (LongTask) MethodAutoMatchingUtils.invokeMethod(methods,
				serviceBean, null, null, exactArgTypes, exactArgs,
				optionalParameterTypes, optionalParameters, LongTask.class);
	}

}

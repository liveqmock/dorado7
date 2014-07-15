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

package com.bstek.dorado.console;

import org.apache.commons.lang.StringUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogConfigurationException;
import org.apache.commons.logging.LogFactory;

import com.bstek.dorado.core.Configure;

/**
 * Dorado Console Logger
 * 
 * <pre>
 * Dorado 控制台单独管理日志，
 * 用户可在Dorado 配置文件中单独配置控制台日志级别
 * 默认日志级别与运行模式有关如果是production模式下则直接关闭的
 * 其它模式下默认级别为debug
 * 例子：
 * configure.properties[dorado.console.logLevel=debug]
 * 则输出日志级别>=debug日志
 * 也可通过configure.properties[dorado.console.logLevel=off]完全关闭
 * 日志级别分类[all,trace,debug,info,warn,error,fatal,off]
 * </pre>
 * 
 * @author Alex Tong(mailto:alex.tong@bstek.com)
 * 
 */
public class Logger {
	/** "Trace" level logging. */
	public static final int LOG_LEVEL_TRACE = 1;
	/** "Debug" level logging. */
	public static final int LOG_LEVEL_DEBUG = 2;
	/** "Info" level logging. */
	public static final int LOG_LEVEL_INFO = 3;
	/** "Warn" level logging. */
	public static final int LOG_LEVEL_WARN = 4;
	/** "Error" level logging. */
	public static final int LOG_LEVEL_ERROR = 5;
	/** "Fatal" level logging. */
	public static final int LOG_LEVEL_FATAL = 6;

	/** Enable all logging levels */
	public static final int LOG_LEVEL_ALL = (LOG_LEVEL_TRACE - 1);

	/** Enable no logging levels */
	public static final int LOG_LEVEL_OFF = (LOG_LEVEL_FATAL + 1);
	/** org.apache.commons.logging.Log */
	private Log logger;

	private static int logLevel = LOG_LEVEL_OFF;
	static {
		String level = Configure.getString("dorado.console.logLevel"), runMode = Configure
				.getString("core.runMode");
		if (StringUtils.isNotEmpty(level)) {
			level = level.toUpperCase().trim();
		} else {
			level = StringUtils.isNotEmpty(runMode)
					&& !"production".equalsIgnoreCase(runMode) ? "DEBUG"
					: "OFF";
		}

		if (level.equals("TRACE"))
			logLevel = LOG_LEVEL_TRACE;
		if (level.equals("DEBUG"))
			logLevel = LOG_LEVEL_DEBUG;
		if (level.equals("INFO"))
			logLevel = LOG_LEVEL_INFO;
		if (level.equals("WARN"))
			logLevel = LOG_LEVEL_WARN;
		if (level.equals("ALL"))
			logLevel = LOG_LEVEL_ALL;
		if (level.equals("OFF"))
			logLevel = LOG_LEVEL_OFF;
	}

	private Logger() {
	}
    
	public static int getLogLevel() {
		return logLevel;
	}

	/**
	 * Convenience method to return a named logger, without the application
	 * having to care about factories.
	 * 
	 * @param clazz
	 *            Class from which a log name will be derived
	 * 
	 * @exception LogConfigurationException
	 *                if a suitable <code>Log</code> instance cannot be returned
	 */
	public static Logger getLog(Class<?> clazz) throws LogConfigurationException {
		Logger log = new Logger();
		log.setLogger(LogFactory.getLog(clazz));
		return log;

	}

	/**
	 * Convenience method to return a named logger, without the application
	 * having to care about factories.
	 * 
	 * @param name
	 *            Logical name of the <code>Log</code> instance to be returned
	 *            (the meaning of this name is only known to the underlying
	 *            logging implementation that is being wrapped)
	 * 
	 * @exception LogConfigurationException
	 *                if a suitable <code>Log</code> instance cannot be returned
	 */
	public static Logger getLog(String name) throws LogConfigurationException {
		Logger log = new Logger();
		log.setLogger(LogFactory.getLog(name));
		return log;
	}

	public Log getLogger() {
		return logger;
	}

	public void setLogger(Log logger) {
		this.logger = logger;
	}

	/**
	 * <p>
	 * Do the actual logging. This method assembles the message and then calls
	 * </p>
	 * 
	 * @param type
	 *            One of the LOG_LEVEL_XXX constants defining the log level
	 * @param message
	 *            The message itself (typically a String)
	 * @param t
	 *            The exception whose stack trace should be logged
	 */
	protected void log(int type, Object message, Throwable t) {
		if (type >= logLevel) {
			switch (type) {
			case LOG_LEVEL_TRACE:
				logger.trace(message, t);
				break;
			case LOG_LEVEL_DEBUG:
				logger.debug(message, t);
				break;
			case LOG_LEVEL_INFO:
				logger.info(message, t);
				break;
			case LOG_LEVEL_WARN:
				logger.warn(message, t);
				break;
			case LOG_LEVEL_ERROR:
				logger.error(message, t);
				break;
			case LOG_LEVEL_FATAL:
				logger.fatal(message, t);
				break;
			}
		}

	}

	// -------------------------------------------------------- Logging Methods

	/**
	 * <p>
	 * Log a message with trace log level.
	 * </p>
	 * 
	 * @param message
	 *            log this message
	 */
	public void trace(Object message) {
		log(LOG_LEVEL_TRACE, message, null);
	}

	/**
	 * <p>
	 * Log an error with trace log level.
	 * </p>
	 * 
	 * @param message
	 *            log this message
	 * @param t
	 *            log this cause
	 */
	public void trace(Object message, Throwable t) {
		log(LOG_LEVEL_TRACE, message, t);
	}

	/**
	 * <p>
	 * Log a message with debug log level.
	 * </p>
	 * 
	 * @param message
	 *            log this message
	 */
	public void debug(Object message) {
		log(LOG_LEVEL_DEBUG, message, null);
	}

	/**
	 * <p>
	 * Log an error with debug log level.
	 * </p>
	 * 
	 * @param message
	 *            log this message
	 * @param t
	 *            log this cause
	 */
	public void debug(Object message, Throwable t) {
		log(LOG_LEVEL_DEBUG, message, t);
	}

	/**
	 * <p>
	 * Log a message with info log level.
	 * </p>
	 * 
	 * @param message
	 *            log this message
	 */
	public void info(Object message) {
		log(LOG_LEVEL_INFO, message, null);
	}

	/**
	 * <p>
	 * Log an error with info log level.
	 * </p>
	 * 
	 * @param message
	 *            log this message
	 * @param t
	 *            log this cause
	 */
	public void info(Object message, Throwable t) {
		log(LOG_LEVEL_INFO, message, t);
	}

	/**
	 * <p>
	 * Log a message with warn log level.
	 * </p>
	 * 
	 * @param message
	 *            log this message
	 */
	public void warn(Object message) {
		log(LOG_LEVEL_WARN, message, null);
	}

	/**
	 * <p>
	 * Log an error with warn log level.
	 * </p>
	 * 
	 * @param message
	 *            log this message
	 * @param t
	 *            log this cause
	 */
	public void warn(Object message, Throwable t) {
		log(LOG_LEVEL_WARN, message, t);
	}

	/**
	 * <p>
	 * Log a message with error log level.
	 * </p>
	 * 
	 * @param message
	 *            log this message
	 */
	public void error(Object message) {
		log(LOG_LEVEL_ERROR, message, null);
	}

	/**
	 * <p>
	 * Log an error with error log level.
	 * </p>
	 * 
	 * @param message
	 *            log this message
	 * @param t
	 *            log this cause
	 */
	public void error(Object message, Throwable t) {
		log(LOG_LEVEL_ERROR, message, t);
	}

	/**
	 * <p>
	 * Log a message with fatal log level.
	 * </p>
	 * 
	 * @param message
	 *            log this message
	 */
	public void fatal(Object message) {
		log(LOG_LEVEL_FATAL, message, null);
	}

	/**
	 * <p>
	 * Log an error with fatal log level.
	 * </p>
	 * 
	 * @param message
	 *            log this message
	 * @param t
	 *            log this cause
	 */
	public void fatal(Object message, Throwable t) {
		log(LOG_LEVEL_FATAL, message, t);
	}

}

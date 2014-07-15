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

package com.bstek.dorado.console.system.log.file;

import java.io.File;
import java.io.FileFilter;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Properties;
import java.util.UUID;

import javassist.NotFoundException;

import org.apache.commons.lang.StringUtils;

import com.bstek.dorado.annotation.DataProvider;
import com.bstek.dorado.annotation.Expose;
import com.bstek.dorado.console.Constants;
import com.bstek.dorado.console.system.log.ExpirableLogBuffer;
import com.bstek.dorado.console.system.log.ExpirablePublisher;
import com.bstek.dorado.console.system.log.LogLine;
import com.bstek.dorado.core.Configure;
import com.bstek.dorado.core.io.Resource;
import com.bstek.dorado.core.io.ResourceLoader;
import com.bstek.dorado.core.io.ResourceUtils;
import com.bstek.dorado.view.View;
import com.bstek.dorado.web.DoradoContext;
import com.bstek.dorado.web.servlet.ServletContextResourceLoader;

/**
 * File Reader Service
 * 
 * @author Alex tong (mailto:alex.tong@bstek.com)
 * @since 2012-11-22
 */
public class FileReaderController {
	private FileReaderManager fileReaderManager;

	public void setFileReaderManager(FileReaderManager fileReaderManager) {
		this.fileReaderManager = fileReaderManager;
	}

	public void onReady(View view) {
			Map<String, Object> map = new HashMap<String, Object>();
			//map.put("fileNames", this.getFileNameList());
			map.put("uuid", UUID.randomUUID().toString());
			view.setUserData(map);
	}

	@Expose
	public Map<String, Object> getFileContent(String fileName, int lineSize,
			Boolean isNext, String uuid, String charsetName)
			throws IOException, NotFoundException {
		String path = getLogDirectoryPath() + File.separator + fileName;
		FileReader fileReader = fileReaderManager.getReader(uuid);
		if (fileReader == null) {
			fileReader = new FileReader(getFile(path));
		}

		List<String> liens = isNext ? fileReader.getNextContent(lineSize,
				charsetName) : fileReader.getPrevContent(lineSize, charsetName);

		fileReaderManager.registerReader(uuid, fileReader);
		Map<String, Object> map = new HashMap<String, Object>();
		map.put("logs", liens);
		map.put("currentStartPointer", fileReader.getCurrentStartPointer());
		map.put("currentEndPointer", fileReader.getCurrentEndPointer());
		return map;
	}

	private Map<String, FileTailWork> map = new HashMap<String, FileTailWork>();
	private String listenerIdKey = "LISTENER_ID_KEY";

	/**
	 * 获取日志文件目录
	 * 
	 * @return
	 * @throws IOException
	 */
	public static String getLogDirectoryPath() throws IOException {
		String runMode = Configure.getString("core.runMode");
		String fileName = "console.properties";
		if (StringUtils.isNotEmpty(runMode)) {
			fileName = "configure-" + runMode + ".properties";
		}
		String log_directory_path = Configure
				.getString(Constants.LOG_DIRECTORY_PATH);
		if (StringUtils.isEmpty(log_directory_path)) {
			// 创建一个临时的ResourceLoader
			ResourceLoader resourceLoader = new ServletContextResourceLoader(
					DoradoContext.getAttachedServletContext());
			String path = ResourceUtils.concatPath(
					Configure.getString("core.doradoHome"), fileName);
			Resource resource = resourceLoader.getResource(path);

			InputStream in = resource.getInputStream();
			if (in != null) {
				Properties properties = new Properties();
				try {
					properties.load(in);
				} finally {
					in.close();
				}
				log_directory_path = (String) properties
						.get(Constants.LOG_DIRECTORY_PATH);
			}

		}
		return log_directory_path;
	}

	@Expose
	public Collection<String> getFileNameList() throws IOException {
		String dir = FileReaderController.getLogDirectoryPath();
		List<String> nameList = new ArrayList<String>();
		if (StringUtils.isEmpty(dir)) {
			return nameList;
		}
		File file = new File(dir);

		File[] files = file.listFiles(new FileFilter() {
			public boolean accept(File tmpFile) {
				if (!tmpFile.isDirectory()) {
					return true;
				}
				return false;
			}
		});

		for (int i = 0; i < files.length; i++) {
			nameList.add(files[i].getName());
		}

		return nameList;

	}

	/**
	 * 获得文件内容
	 * 
	 * @param fileName
	 * @return
	 * @throws NotFoundException
	 */
	@DataProvider
	public List<LogLine> last(String fileName) throws NotFoundException {
		DoradoContext ctx = DoradoContext.getCurrent();
		String listenerId = (String) ctx.getAttribute(DoradoContext.SESSION,
				listenerIdKey);

		FileTailWork tail = map.get(fileName);
		if (tail == null) {
			tail = new FileTailWork(getFile(fileName), "UTF-8");
		}
		synchronized (tail) {
			if (!tail.isOnWork()) {
				tail.startWork();
				map.put(fileName, tail);
			}
		}
		ExpirablePublisher publisher = tail.getPublisher();

		ExpirableLogBuffer logBuffer = null;
		if (StringUtils.isNotEmpty(listenerId)) {
			logBuffer = publisher.find(listenerId);
		}

		if (logBuffer == null) {
			logBuffer = publisher.create();
			publisher.register(logBuffer);
		}

		if (StringUtils.isEmpty(listenerId)) {

			listenerId = publisher.listenerId(logBuffer);
			ctx.setAttribute(DoradoContext.SESSION, listenerIdKey, listenerId);
		}

		return logBuffer.getLastLines();
	}

	public File getFile(String fileName) throws NotFoundException {
		File file = new File(fileName);
		if (!file.exists()) {
			throw new NotFoundException("文件不存在,请重新设置文件！");
		}

		return file;
	}
}

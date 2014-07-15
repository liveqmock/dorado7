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

import java.util.Hashtable;
import java.util.Map;

import org.apache.commons.collections.map.UnmodifiableMap;

/**
 * 文件读取器管理
 * 
 * @author Alex Tong(mailto:alex.tong@bstek.com)
 * @since 2012-12-29
 */
public class FileReaderManager {
	private Map<String, FileReader> readerMap = new Hashtable<String, FileReader>();

	public FileReader getReader(String key) {
		return readerMap.get(key);
	}

	public void registerReader(String key, FileReader fileReader) {
		readerMap.put(key, fileReader);
	}

	@SuppressWarnings("unchecked")
	public Map<String, FileReader> getReaders() {
		return UnmodifiableMap.decorate(readerMap);
	}

}

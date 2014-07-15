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

package com.bstek.dorado.view.resolver;

import java.util.HashMap;
import java.util.Map;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2012-5-4
 */
public class ClientI18NFileRegistry {

	public static class FileInfo {
		private String path;
		private boolean replace;

		public FileInfo(String path, boolean replace) {
			this.path = path;
			this.replace = replace;
		}

		public String getPath() {
			return path;
		}

		public boolean isReplace() {
			return replace;
		}
	}

	private Map<String, FileInfo> fileMap;

	public synchronized void register(String packageName, String path,
			boolean replace) {
		if (fileMap == null) {
			fileMap = new HashMap<String, FileInfo>();
		}
		fileMap.put(packageName, new FileInfo(path, replace));
	}

	public FileInfo getFileInfo(String packageName) {
		return (fileMap != null) ? fileMap.get(packageName) : null;
	}
}

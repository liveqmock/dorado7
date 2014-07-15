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

package com.bstek.dorado.util;

import java.io.File;
import java.io.IOException;

public final class FileUtils {
	private FileUtils() {
	}

	public static void clearDirectory(File dir) throws IOException {
		if (!dir.isDirectory()) {
			return;
		}

		for (File subFile : dir.listFiles()) {
			if (subFile.isFile()) {
				if (!subFile.delete()) {
					throw new IOException("Can not delete \""
							+ subFile.getAbsolutePath() + "\".");
				}
			} else if (subFile.isDirectory()) {
				removeDirectory(subFile);
			}
		}
	}

	public static void removeDirectory(File dir) throws IOException {
		if (!dir.isDirectory()) {
			return;
		}

		clearDirectory(dir);
		if (!dir.delete()) {
			throw new IOException("Can not delete \"" + dir.getAbsolutePath()
					+ "\".");
		}
	}
}

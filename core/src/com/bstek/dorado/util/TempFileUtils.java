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
import java.io.RandomAccessFile;
import java.nio.channels.FileChannel;
import java.nio.channels.FileLock;
import java.nio.channels.OverlappingFileLockException;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2012-2-23
 */
public final class TempFileUtils {
	private static final String TEMP_DIR_PREFIX = "instance-";
	private static final String LOCK_FILE = "lock";

	private static boolean supportsTempFile = true;

	private static File rootDir;
	private static File tempDir;

	private TempFileUtils() {
	}

	public static boolean isSupportsTempFile() {
		return supportsTempFile;
	}

	public static void setSupportsTempFile(boolean supportsTempFile) {
		TempFileUtils.supportsTempFile = supportsTempFile;
	}

	private static File getRootDir() throws IOException {
		if (rootDir == null) {
			rootDir = new File(System.getProperty("java.io.tmpdir")
					+ File.separator + ".dorado.tmp");
			if (!rootDir.exists()) {
				if (!rootDir.mkdirs()) {
					throw new IOException("Make directory \""
							+ rootDir.getAbsolutePath() + "\" failed.");
				}
			} else if (!rootDir.isDirectory()) {
				throw new IOException("\"" + rootDir.getAbsolutePath()
						+ "\" is not a directory.");
			}
		}
		return rootDir;
	}

	private static void clearRootDir(File rootDir) {
		for (File file : rootDir.listFiles()) {
			try {
				if (file.isFile()) {
					file.delete();
				} else if (file.getName().startsWith(TEMP_DIR_PREFIX)) {
					File lockFile = new File(file, LOCK_FILE);
					if (lockFile.exists()) {
						try {
							RandomAccessFile raf = new RandomAccessFile(
									lockFile, "rw");
							FileChannel channel = raf.getChannel();
							try {
								FileLock lock = channel.tryLock();
								if (lock == null) {
									continue;
								}

								lock.release();
							} catch (OverlappingFileLockException e) {
								continue;
							} finally {
								raf.close();
								channel.close();
							}
						} catch (IOException e) {
							continue;
						}

						if (!lockFile.delete()) {
							continue;
						}
					}
					FileUtils.removeDirectory(file);
				} else {
					FileUtils.removeDirectory(file);
				}
			} catch (Exception e) {
				// do nothing
			}
		}
	}

	public static void setTempDir(File tempDir) {
		TempFileUtils.tempDir = tempDir;
	}

	public static File getTempDir() throws IOException {
		if (!supportsTempFile) {
			throw new IOException("Temp file is forbidden.");
		}

		if (tempDir == null) {
			File rootDir = getRootDir();

			try {
				clearRootDir(rootDir);
			} catch (Exception e) {
				// do nothing
			}

			int seed = 1;
			do {
				tempDir = new File(rootDir, TEMP_DIR_PREFIX + (seed++));
			} while (tempDir.exists());

			if (!tempDir.mkdirs()) {
				throw new IOException("Make directory \""
						+ tempDir.getAbsolutePath() + "\" failed.");
			} else {
				File lockFile = new File(tempDir, LOCK_FILE);
				RandomAccessFile raf = new RandomAccessFile(lockFile, "rw");
				FileChannel channel = raf.getChannel();
				FileLock lock = null;
				try {
					lock = channel.tryLock();
					if (lock == null) {
						throw new IllegalStateException("Lock file \""
								+ tempDir + "\" failed.");
					}
				} catch (OverlappingFileLockException e) {
					throw new IllegalStateException("\"" + tempDir
							+ "\" is already locked.", e);
				} finally {
					raf.close();
				}
			}
		}
		return tempDir;
	}

	public static File createTempFile(String fileNamePrefix,
			String fileNamesuffix) throws IOException {
		if (!supportsTempFile) {
			throw new IOException("Temp file is forbidden.");
		}

		File file = File.createTempFile(fileNamePrefix, fileNamesuffix,
				getTempDir());
		file.deleteOnExit();
		return file;
	}

}

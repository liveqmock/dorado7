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
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.LineNumberReader;
import java.io.RandomAccessFile;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

/**
 * 日志文件读取器
 * <p>
 * （支持超大文件的分批分行读取）
 * </p>
 * 
 * @author Alex.tong(mailto:alex.tong@bstek.com)
 * @since 2012-11-29
 */
public class FileReader {
	/**
	 * 目标文件
	 */
	private File logfile;

	public FileReader(File file) {
		this.logfile = file;
	}

	private long currentStartPointer = 0;
	private long currentEndPointer = 0;

	/**
	 * 获得所读取文件
	 * 
	 * @return
	 */
	public File getLogfile() {
		return logfile;
	}

	/**
	 * 获得文件当前读取块的开始指针
	 * 
	 * @return
	 */
	public long getCurrentStartPointer() {
		return currentStartPointer;
	}

	/**
	 * 获得文件当前读取块的结束指针
	 * 
	 * @return
	 */
	public long getCurrentEndPointer() {
		return currentEndPointer;
	}

	/**
	 * 读取文本上一块内容
	 * <p>
	 * 如果是首次读取：从文件尾部读取
	 * </p>
	 * @param lineSize 行数
	 * @param charsetName 文件编码
	 * @return
	 */
	public List<String> getPrevContent(int lineSize, String charsetName) {
		boolean isflag = true;
		List<String> lines = new ArrayList<String>();
		RandomAccessFile rFile = null;
		try {
			
			rFile = new RandomAccessFile(logfile, "r");
			long fileLength = rFile.length();
			// 计算结束指针位置
			long endPointer = currentStartPointer == 0 ? fileLength
					: currentStartPointer;
			// 计算开始指针位置
			long startPointer = 0;
			Map<Integer, Long> pointerMap = new HashMap<Integer, Long>();
			int startIndex = 0, endIndex = 0;
			while (isflag) {
				startPointer = endPointer < 1024 * 2 ? 0
						: endPointer - 1024 * 2;
				rFile.seek(startPointer);
				startIndex = pointerMap.size();
				long lineStartPointer = startPointer, lineEndPointer;
				int i = 0;
				while (rFile.readLine() != null) {
					lineEndPointer = rFile.getFilePointer();
					if (++i > 1 || lineStartPointer == 0) {
						pointerMap.put(pointerMap.size(), lineEndPointer);
					}
					if (lineEndPointer >= endPointer) {
						break;
					}
					lineStartPointer = lineEndPointer;
				}
				endIndex = pointerMap.size() - 1;
				endPointer = startPointer;
				isflag = pointerMap.size() < lineSize;
			}

			currentEndPointer = currentStartPointer == 0 ? fileLength
					: currentStartPointer;

			currentStartPointer = pointerMap.size() > lineSize ? pointerMap
					.get(startIndex + (endIndex - lineSize)) : startPointer;

			lines = readSubFile(currentStartPointer, currentEndPointer,
					charsetName);
		} catch (Exception e) {
		} finally {
			try {
				if (rFile != null)
					rFile.close();
			} catch (IOException e) {
			}

		}

		return lines;
	}

	/**
	 * 读取文本下一块内容
	 * <p>
	 * 如果是首次读取则从文件开头读取
	 * </p>
	 * @param lineSize 行数
	 * @param charsetName 文件编码
	 * @return
	 * @throws IOException
	 */
	public List<String> getNextContent(int lineSize, String charsetName)
			throws IOException {
		RandomAccessFile rFile = null;
		List<String> lines = null;
		try {
			rFile = new RandomAccessFile(logfile, "r");
			long fileLength = rFile.length();
			currentStartPointer = currentEndPointer;
			rFile.seek(currentStartPointer);
			int i = 0;
			while (rFile.readLine() != null) {
				if (++i >= lineSize || rFile.getFilePointer() >= fileLength)
					break;
			}
			currentEndPointer = rFile.getFilePointer();

			lines = readSubFile(currentStartPointer, currentEndPointer,
					charsetName);
		} catch (Exception e) {
		} finally {
			try {
				if (rFile != null)
					rFile.close();
			} catch (IOException e) {
			}

		}
		return lines;
	}

	private List<String> readSubFile(long starPointer, long endPointer,
			String charsetName) {
		LinkedList<String> lines = new LinkedList<String>();
		RandomAccessFile rFile = null;
		RandomAccessFile wFile = null;
		File tmpFile = null;
		LineNumberReader lineReader = null;
		try {
			rFile = new RandomAccessFile(logfile, "r");
			String java_io_tmpdir = System.getProperty("java.io.tmpdir");
			String path = java_io_tmpdir + File.separator + "fragment";
			tmpFile = new File(path);
			if (!tmpFile.exists()) {
				tmpFile.mkdirs();
			}
			tmpFile = new File(path + File.separator
					+ System.currentTimeMillis() + ".log");

			wFile = new RandomAccessFile(tmpFile.getPath(), "rw");

			int readcount;

			rFile.seek(starPointer);
			while ((readcount = rFile.read()) != -1) {
				wFile.write(readcount);
				if (rFile.getFilePointer() >= endPointer)
					break;
			}
			wFile.close();
			rFile.close();
			if (charsetName == null) {
				lineReader = new LineNumberReader(new InputStreamReader(
						new FileInputStream(tmpFile)));
			} else {
				lineReader = new LineNumberReader(new InputStreamReader(
						new FileInputStream(tmpFile), charsetName));
			}

			String line = null;
			while ((line = lineReader.readLine()) != null) {
				lines.add(line);
			}
		} catch (Exception e) {

		} finally {
			try {
				if (rFile != null)
					rFile.close();
				if (wFile != null)
					wFile.close();
				if (lineReader != null)
					lineReader.close();
				if (tmpFile != null) {
					tmpFile.delete();
				}

			} catch (IOException e) {
			}

		}
		return lines;
	}


}
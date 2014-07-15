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
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.LineNumberReader;
import java.io.UnsupportedEncodingException;

import com.bstek.dorado.console.system.log.AbstractWork;
import com.bstek.dorado.console.system.log.Event;
import com.bstek.dorado.console.system.log.LogLine;

/**
 * 
 *
 * @author Alex Tong(mailto:alex.tong@bstek.com)
 * @since  2013-3-4
 */
public class FileTailWork extends AbstractWork {

	enum From {
		FIRST,
		CURRENT
	}
	
	private File file;
	private String charsetName;
	private From from = From.FIRST;
	
	private LineNumberReader lineReader = null;
	
	
	private long idleTime = 2 * 1000;
	
	private Thread publisherThread;
	
	private boolean publishAble = false;
	
	public FileTailWork(String fileName){
		this(fileName, null);
	}
	
	public  FileTailWork(File file) {
		this(file, null);
	}
	
	public FileTailWork(String fileName, String charsetName) {
		this(new File(fileName), charsetName);
	}
	
	public FileTailWork(File file, String charsetName) {
		this.file = file;
		this.charsetName = charsetName;
	}
	
	public void setFrom(From m) {
		this.from = m;
	}
	
	public From getFrom() {
		return this.from;
	}
	
	public File getFile() {
		return file;
	}

	@Override
	protected void doStartWork() {
		InputStreamReader isReader = null;
		try {
			FileInputStream fstream = new FileInputStream(file);
			if (this.getFrom() == From.CURRENT) {
				if (file.length()>0) {
					fstream.skip(file.length());
				}
			}
			
			if (charsetName == null) {
				isReader = new InputStreamReader(fstream);
			} else {
				isReader = new InputStreamReader(fstream, charsetName);
			}
		} catch (FileNotFoundException e) {
			throw new RuntimeException(e);
		} catch (UnsupportedEncodingException e) {
			throw new RuntimeException(e);
		} catch (IOException e) {
			throw new RuntimeException(e);
		} 
		
		lineReader = new LineNumberReader(isReader);
		
		publishAble = true;
		publisherThread = new Thread(new Runnable() {
			public void run() {
				while(publishAble) {
					doWork();
					try {
						Thread.sleep(idleTime);
					} catch (InterruptedException e) {
					}
				}
				
				try {
					lineReader.close();
				} catch (IOException e) {
				}
			}
			
		});
		publisherThread.start();
	}
	
	protected void doWork() {
		try {
			String line = null;
			while ((line = lineReader.readLine()) != null) {
				LogLine obj = new LogLine(line, "file");
				Event event = new Event(this, obj);
				getPublisher().publish(event);
			}
		} catch (IOException e) {
			throw new RuntimeException(e);
		}
	}

	@Override
	protected void doStopWork() {
		publishAble = false;
		publisherThread = null;
	}
	
}

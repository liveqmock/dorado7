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

import java.io.IOException;
import java.util.Collection;
import java.util.Map;

import javassist.NotFoundException;

import org.junit.Before;
import org.junit.Test;

import com.bstek.dorado.core.ContextTestCase;
import com.bstek.dorado.view.MockView;
import com.bstek.dorado.view.View;

/**
 * 
 * @author Alex Tong(mailto:alex.tong@bstek.com)
 * @since 2013-3-4
 */
public class FileReaderControllerTest extends ContextTestCase {
	FileReaderController controller = null;
	String uuid = null;

	/*
	 * (non-Javadoc)
	 * 
	 * @see com.bstek.dorado.core.ContextTestCase#setUp()
	 */
	@Before
	protected void setUp() throws Exception {
		super.setUp();
		controller = new FileReaderController();
		controller.setFileReaderManager(new FileReaderManager());

	}

	/**
	 * Test method for
	 * {@link com.bstek.dorado.console.system.log.file.FileReaderController#onReady(com.bstek.dorado.view.View)}
	 * .
	 */
	@Test
	public void testOnReady() {
		View view = new MockView(null);
		controller.onReady(view);
		@SuppressWarnings("unchecked")
		Map<String, Object> userData = (Map<String, Object>) view.getUserData();
		uuid = (String) userData.get("uuid");
		System.out.println(uuid);
	}

	/**
	 * Test method for
	 * {@link com.bstek.dorado.console.system.log.file.FileReaderController#getFileContent(java.lang.String, int, java.lang.Boolean, java.lang.String, java.lang.String)}
	 * .
	 */
	@Test
	public void testGetFileContent() {
		try {
			Map<String, Object>  map=	controller.getFileContent("addto-startup.py", 20, true, "uuid", "utf-8");
			System.out.println(map);
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (NotFoundException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}


	/**
	 * Test method for
	 * {@link com.bstek.dorado.console.system.log.file.FileReaderController#getFileNameList()}
	 * .
	 */
	@Test
	public void testGetFileNameList() {
		try {
		Collection<String> files=	controller.getFileNameList();
		System.out.println(files.size());
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}



}

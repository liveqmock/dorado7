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

package com.bstek.dorado.core.io;

import java.io.IOException;

import com.bstek.dorado.core.io.BaseResourceLoader;
import com.bstek.dorado.core.io.Resource;

import junit.framework.TestCase;

public class DefaultResourceLoaderTest extends TestCase {
	private static final String CONFIGURE_LOCATION = "com/bstek/dorado/core/configure.properties";

	private BaseResourceLoader resourceLoader = null;

	@Override
	protected void setUp() throws Exception {
		super.setUp();
		resourceLoader = new BaseResourceLoader();
	}

	@Override
	protected void tearDown() throws Exception {
		resourceLoader = null;
		super.tearDown();
	}

	public void testGetClassLoader() {
		assertNotNull(resourceLoader.getClassLoader());
	}

	public void testGetResource() throws IOException {
		Resource resource = null;
		resource = resourceLoader.getResource(CONFIGURE_LOCATION);
		assertTrue(resource.exists());
		assertTrue(resource.getTimestamp() != 0);
		assertEquals(resource.getFilename(), "configure.properties");

		resource = resourceLoader
				.getResource("classpath:" + CONFIGURE_LOCATION);
		assertTrue(resource.exists());

		resource = resourceLoader.getResource("classpath:java/util/List.class");
		assertTrue(resource.exists());
	}

	public void testGetResources() throws IOException {
		Resource[] resources = null;

		resources = resourceLoader.getResources(CONFIGURE_LOCATION);
		assertTrue(resources.length == 1);

		resources = resourceLoader
				.getResources("classpath:com/bstek/dorado/core/*.class");
		assertTrue(resources.length > 0);

		resources = resourceLoader
				.getResources("classpath*:com/bstek/dorado/core/*.class");
		assertTrue(resources.length > 0);

		resources = resourceLoader.getResources("com/bstek/dorado/core/*.class");
		assertTrue(resources.length > 0);
	}

}

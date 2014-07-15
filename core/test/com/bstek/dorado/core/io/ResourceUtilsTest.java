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


import com.bstek.dorado.core.ContextTestCase;
import com.bstek.dorado.core.io.Resource;
import com.bstek.dorado.core.io.ResourceUtils;

public class ResourceUtilsTest extends ContextTestCase {

	public void testGetResources() throws IOException {
		String location1 = "com/bstek/dorado/core/config/core-context.xml";
		String location2 = "com/bstek/dorado/data/config/xml/invalid-resource.xml";

		String[] resourceLocations = new String[] { location1, location2,
				location1 };
		Resource[] resources = ResourceUtils.getResources(resourceLocations);

		assertEquals(resources.length, 2);
		for (int i = 0; i < resources.length; i++) {
			Resource resource = resources[i];
			assertTrue(resource.getFilename().endsWith(".xml"));
		}
	}

}

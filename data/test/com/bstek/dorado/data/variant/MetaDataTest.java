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

package com.bstek.dorado.data.variant;

import java.util.Date;

import com.bstek.dorado.data.config.ConfigManagerTestSupport;
import com.bstek.dorado.data.variant.MetaData;

public class MetaDataTest extends ConfigManagerTestSupport {
	private MetaData metaData = null;

	private static final String key1 = "key1";

	@Override
	protected void setUp() throws Exception {
		super.setUp();
		metaData = new MetaData();
	}

	@Override
	protected void tearDown() throws Exception {
		metaData = null;
		super.tearDown();
	}

	public void testString() {
		assertNull(metaData.getString(key1), null);

		metaData.setString(key1, "string1");
		assertEquals(metaData.getString(key1), "string1");

		metaData.put(key1, new Integer(1024));
		assertEquals(metaData.getString(key1), "1024");

		metaData.put(key1, Boolean.TRUE);
		assertEquals(metaData.getString(key1), Boolean.toString(true));
	}

	public void testBoolean() {
		assertFalse(metaData.getBoolean(key1));

		metaData.setBoolean(key1, true);
		assertTrue(metaData.getBoolean(key1));

		metaData.setString(key1, "1");
		assertTrue(metaData.getBoolean(key1));

		metaData.put(key1, Boolean.TRUE);
		assertTrue(metaData.getBoolean(key1));

		metaData.put(key1, Boolean.FALSE);
		assertFalse(metaData.getBoolean(key1));
	}

	public void testInt() {
		assertTrue(metaData.getInt(key1) == 0);

		metaData.setInt(key1, 100);
		assertTrue(metaData.getInt(key1) == 100);

		metaData.setDouble(key1, 200.123);
		assertTrue(metaData.getInt(key1) == 200);

		metaData.setString(key1, "256");
		assertTrue(metaData.getInt(key1) == 256);
	}

	public void testLong() {
		assertTrue(metaData.getLong(key1) == 0);

		metaData.setInt(key1, 100);
		assertTrue(metaData.getLong(key1) == 100);

		metaData.setLong(key1, 20000);
		assertTrue(metaData.getLong(key1) == 20000);

		metaData.setString(key1, "2561");
		assertTrue(metaData.getLong(key1) == 2561);

		metaData.setDouble(key1, 500.123);
		assertTrue(metaData.getLong(key1) == 500);
	}

	public void testFloat() {
		assertTrue(metaData.getFloat(key1) == 0);

		metaData.setFloat(key1, 100.123F);
		assertTrue(metaData.getFloat(key1) == 100.123F);

		metaData.setLong(key1, 20000);
		assertTrue(metaData.getFloat(key1) == 20000F);

		metaData.setString(key1, "2561.45");
		assertTrue(metaData.getFloat(key1) == 2561.45F);

		metaData.setDouble(key1, 500.123);
		assertTrue(metaData.getFloat(key1) == 500.123F);
	}

	public void testDouble() {
		assertTrue(metaData.getDouble(key1) == 0);

		metaData.setFloat(key1, 100.123F);
		assertTrue(metaData.getDouble(key1) == 100.123F);

		metaData.setLong(key1, 20000);
		assertTrue(metaData.getDouble(key1) == 20000D);

		metaData.setString(key1, "2561.45");
		assertTrue(metaData.getDouble(key1) == 2561.45D);

		metaData.setDouble(key1, 500.123);
		assertTrue(metaData.getDouble(key1) == 500.123D);
	}

	public void testBigDecimal() {
		assertNull(metaData.getBigDecimal(key1));

		metaData.setFloat(key1, 100.123F);
		assertTrue(metaData.getBigDecimal(key1).floatValue() == 100.123F);

		metaData.setLong(key1, 20000);
		assertTrue(metaData.getBigDecimal(key1).longValue() == 20000);

		metaData.setString(key1, "2561.45");
		assertTrue(metaData.getBigDecimal(key1).doubleValue() == 2561.45D);

		metaData.setDouble(key1, 500.123);
		assertTrue(metaData.getBigDecimal(key1).doubleValue() == 500.123D);
	}

	public void testDate() {
		assertNull(metaData.getDate(key1));

		metaData.setLong(key1, System.currentTimeMillis());
		assertNotNull(metaData.getDate(key1));

		metaData.setString(key1, "2002-06-14");
		assertTrue(metaData.getDate(key1).toString().indexOf("2002") >= 0);

		metaData.setString(key1, "2003-06-14 08:12:46");
		assertTrue(metaData.getDate(key1).toString().indexOf("2003") >= 0);
		assertTrue(metaData.getDate(key1).toString().indexOf("12") >= 0);

		Date date = new Date();
		metaData.setDate(key1, date);
		assertEquals(metaData.getDate(key1), date);
	}

}

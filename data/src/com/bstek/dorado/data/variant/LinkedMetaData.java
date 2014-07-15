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

import java.math.BigDecimal;
import java.util.Date;
import java.util.LinkedHashMap;
import java.util.Map;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

/**
 * 有序的元数据对象。
 * 
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since May 12, 2009
 */
public class LinkedMetaData extends LinkedHashMap<String, Object> implements
		VariantSet {
	private static final long serialVersionUID = -5206947024602715722L;
	private static final Log logger = LogFactory.getLog(MetaData.class);
	private static VariantConvertor variantConvertor;

	private static VariantConvertor getVariantConvertor() {
		try {
			variantConvertor = VariantUtils.getVariantConvertor();
		} catch (Exception e) {
			logger.error(e, e);
		}
		return variantConvertor;
	}

	public LinkedMetaData() {
	}

	public LinkedMetaData(Map<String, ?> map) {
		super(map);
	}

	public String getString(String key) {
		return getVariantConvertor().toString(super.get(key));
	}

	public void setString(String key, String s) {
		put(key, s);
	}

	public boolean getBoolean(String key) {
		return getVariantConvertor().toBoolean(super.get(key));
	}

	public void setBoolean(String key, boolean b) {
		put(key, Boolean.valueOf(b));
	}

	public int getInt(String key) {
		return getVariantConvertor().toInt(super.get(key));
	}

	public void setInt(String key, int i) {
		put(key, new Integer(i));
	}

	public long getLong(String key) {
		return getVariantConvertor().toLong(super.get(key));
	}

	public void setLong(String key, long l) {
		put(key, new Long(l));
	}

	public float getFloat(String key) {
		return getVariantConvertor().toFloat(super.get(key));
	}

	public void setFloat(String key, float f) {
		put(key, new Float(f));
	}

	public double getDouble(String key) {
		return getVariantConvertor().toDouble(super.get(key));
	}

	public void setDouble(String key, double d) {
		put(key, new Double(d));
	}

	public BigDecimal getBigDecimal(String key) {
		return getVariantConvertor().toBigDecimal(super.get(key));
	}

	public void setBigDecimal(String key, BigDecimal bd) {
		put(key, bd);
	}

	public Date getDate(String key) {
		return getVariantConvertor().toDate(super.get(key));
	}

	public void setDate(String key, Date date) {
		put(key, date);
	}

	public Object get(String key) {
		return super.get(key);
	}

	public void set(String key, Object value) {
		put(key, value);
	}

	public Map<String, Object> toMap() {
		return this;
	}
}

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

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

import com.bstek.dorado.core.Context;
import com.bstek.dorado.data.config.DataConfigManagerEvent;
import com.bstek.dorado.data.config.DataConfigManagerListener;
import com.bstek.dorado.data.type.DataType;
import com.bstek.dorado.data.type.manager.DataTypeManager;
import com.bstek.dorado.util.Assert;

/**
 * 默认的数据转换器实现类。
 * 
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Jan 17, 2008
 */
public class DefaultVariantConvertor implements VariantConvertor,
		DataConfigManagerListener {
	private static final Log logger = LogFactory
			.getLog(DefaultVariantConvertor.class);

	private static class DataTypeReference {
		private static DataTypeManager dataTypeManager;
		private Class<?> type;
		private DataType dataType;

		public DataTypeReference(Class<?> type) {
			this.type = type;
		}

		private DataTypeManager getDataTypeManager() throws Exception {
			if (dataTypeManager == null) {
				Context context = Context.getCurrent();
				dataTypeManager = (DataTypeManager) context
						.getServiceBean("dataTypeManager");
			}
			return dataTypeManager;
		}

		private DataType getDataType() {
			if (dataType == null) {
				try {
					dataType = getDataTypeManager().getDataType(type);
					Assert.notNull(dataType, "Can not get DataType for Type ["
							+ type + "].");
				} catch (Exception e) {
					logger.error(e, e);
				}
			}
			return dataType;
		}

		public void clearCache() {
			dataType = null;
		}

		public Object convertFromObject(Object value) {
			return getDataType().fromObject(value);
		}
	}

	private DataTypeReference stringDateType;
	private DataTypeReference booleanDateType;
	private DataTypeReference intDateType;
	private DataTypeReference longDateType;
	private DataTypeReference floatDateType;
	private DataTypeReference doubleDateType;
	private DataTypeReference bigDecimalDateType;
	private DataTypeReference dateDateType;

	public DefaultVariantConvertor() throws Exception {
		stringDateType = new DataTypeReference(String.class);
		booleanDateType = new DataTypeReference(boolean.class);
		intDateType = new DataTypeReference(int.class);
		longDateType = new DataTypeReference(long.class);
		floatDateType = new DataTypeReference(float.class);
		doubleDateType = new DataTypeReference(double.class);
		bigDecimalDateType = new DataTypeReference(BigDecimal.class);
		dateDateType = new DataTypeReference(Date.class);
	}

	private void clearDataTypeCaches() {
		stringDateType.clearCache();
		booleanDateType.clearCache();
		intDateType.clearCache();
		longDateType.clearCache();
		floatDateType.clearCache();
		doubleDateType.clearCache();
		bigDecimalDateType.clearCache();
		dateDateType.clearCache();
	}

	public void onConfigChanged(DataConfigManagerEvent event) {
		clearDataTypeCaches();
	}

	public String toString(Object object) {
		return (String) stringDateType.convertFromObject(object);
	}

	public boolean toBoolean(Object object) {
		Boolean b = (Boolean) booleanDateType.convertFromObject(object);
		return b.booleanValue();
	}

	public int toInt(Object object) {
		Number n = (Number) intDateType.convertFromObject(object);
		return n.intValue();
	}

	public long toLong(Object object) {
		Number n = (Number) longDateType.convertFromObject(object);
		return n.longValue();
	}

	public float toFloat(Object object) {
		Number n = (Number) floatDateType.convertFromObject(object);
		return n.floatValue();
	}

	public double toDouble(Object object) {
		Number n = (Number) doubleDateType.convertFromObject(object);
		return n.doubleValue();
	}

	public BigDecimal toBigDecimal(Object object) {
		return (BigDecimal) bigDecimalDateType.convertFromObject(object);
	}

	public Date toDate(Object object) {
		return (Date) dateDateType.convertFromObject(object);
	}

}

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

package com.bstek.dorado.core.store;

import java.sql.CallableStatement;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;

import org.apache.commons.lang.StringUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

import com.bstek.dorado.core.Configure;
import com.bstek.dorado.util.PathUtils;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2012-12-9
 */
public class H2BaseStore extends SqlBaseStoreSupport {
	private static final Log logger = LogFactory.getLog(H2BaseStore.class);

	@Override
	protected String getConnectionUrl() throws Exception {
		String storeDir = Configure.getString("core.storeDir");
		if (StringUtils.isEmpty(storeDir)) {
			throw new IllegalArgumentException("\"core.storeDir\" undefined. ");
		}
		return "jdbc:h2:file:"
				+ PathUtils.concatPath(storeDir, "db", namespace);
	}

	protected void prepareNamespace() throws Exception {
		Class.forName(driverClassName);
		Connection conn = DriverManager.getConnection(getConnectionUrl(),
				username, password);
		try {
			int storeVersion = 0;
			CallableStatement prepareCall = conn
					.prepareCall("SELECT @storeVersion");
			ResultSet resultSet = prepareCall.executeQuery();
			try {
				if (resultSet.first()) {
					storeVersion = resultSet.getInt("@storeVersion");
				}
			} finally {
				resultSet.close();
				prepareCall.close();
			}

			if (storeVersion < version) {
				logger.info("Initializing store \"" + namespace + "\".");

				prepareCall = conn
						.prepareCall("SET @storeVersion = " + version);
				try {
					prepareCall.execute();
				} finally {
					prepareCall.close();
				}

				initNamespace(conn);
			}
		} finally {
			conn.close();
		}
	}

}

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

package com.bstek.dorado.view.registry;

import org.apache.commons.lang.StringUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.beans.factory.InitializingBean;

import com.bstek.dorado.common.ClientType;
import com.bstek.dorado.spring.RemovableBean;
import com.bstek.dorado.view.widget.layout.Layout;
import com.bstek.dorado.view.widget.layout.LayoutConstraintSupport;

/**
 * 用于配置在Spring文件中的布局管理器类型信息的注册器。
 * 
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Sep 16, 2008
 */
public class LayoutTypeRegister implements InitializingBean, RemovableBean {
	private static final Log logger = LogFactory
			.getLog(LayoutTypeRegister.class);

	private LayoutTypeRegistry layoutTypeRegistry;
	private String type;
	private String classType;
	private String constraintClassType;
	private String clientTypes;

	/**
	 * 返回布局管理器类型的注册管理器。
	 */
	public void setLayoutTypeRegistry(LayoutTypeRegistry layoutTypeRegistry) {
		this.layoutTypeRegistry = layoutTypeRegistry;
	}

	/**
	 * 设置布局管理器的类型。
	 */
	public void setType(String type) {
		this.type = type;
	}

	/**
	 * 设置布局管理器的实现类。
	 */
	public void setClassType(String classType) {
		this.classType = classType;
	}

	public void setConstraintClassType(String constraintClassType) {
		this.constraintClassType = constraintClassType;
	}

	public void setClientTypes(String clientTypes) {
		this.clientTypes = clientTypes;
	}

	@SuppressWarnings("unchecked")
	public void afterPropertiesSet() throws Exception {
		try {
			Class<? extends Layout> cl = null;
			if (StringUtils.isNotEmpty(classType)) {
				cl = (Class<? extends Layout>) Class.forName(classType);
			}

			Class<? extends LayoutConstraintSupport> constraintCl = null;
			if (StringUtils.isNotEmpty(constraintClassType)) {
				constraintCl = (Class<? extends LayoutConstraintSupport>) Class
						.forName(constraintClassType);
			}

			LayoutTypeRegisterInfo registerInfo = new LayoutTypeRegisterInfo(
					type, cl, constraintCl);

			int clientTypesValue = ClientType.parseClientTypes(clientTypes);
			if (clientTypesValue > 0) {
				registerInfo.setClientTypes(clientTypesValue);
			}

			layoutTypeRegistry.registerType(registerInfo);
		} catch (ClassNotFoundException e) {
			logger.equals(e);
		}
	}
}

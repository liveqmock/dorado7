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

package com.bstek.dorado.console.web.outputter;

import java.util.List;

import com.bstek.dorado.view.output.ClientObjectOutputter;
import com.bstek.dorado.view.output.ClientOutputHelper;
import com.bstek.dorado.view.output.Outputter;
import com.bstek.dorado.web.DoradoContext;
/**
 * 
 *
 * @author Alex Tong(mailto:alex.tong@bstek.com)
 * @since  2013-3-4
 */
public class Node {
	private String name;
	private String beanName;
	private String shortTypeName;
	private String prototype;
	private List<PropertyConfig> propertyConfigs;

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getBeanName() {
		return beanName;
	}

	public void setBeanName(String beanName) {
		this.beanName = beanName;
	}

	public List<PropertyConfig> getPropertyConfigs() {
		return propertyConfigs;
	}

	public void setPropertyConfigs(List<PropertyConfig> propertyConfigs) {
		this.propertyConfigs = propertyConfigs;
	}

	public String getShortTypeName() {
		return shortTypeName;
	}

	public void setShortTypeName(String shortTypeName) {
		this.shortTypeName = shortTypeName;
	}

	public String getPrototype() {
		return prototype;
	}

	public void setPrototype(String prototype) {
		this.prototype = prototype;
	}

	public void initProperties() {
		if (beanName != null) {
			ClientOutputHelper clientOutputHelper = (ClientOutputHelper) DoradoContext
					.getAttachedWebApplicationContext().getBean(
							"dorado.clientOutputHelper");
			try {
				Outputter outputter = clientOutputHelper.getOutputter(Class
						.forName(beanName));
				if (outputter instanceof ClientObjectOutputter) {
					ClientObjectOutputter clientObjectOutputter = (ClientObjectOutputter) outputter;
					this.shortTypeName = clientObjectOutputter
							.getShortTypeName();
					this.prototype = clientObjectOutputter.getPrototype();
				}

			} catch (ClassNotFoundException e) {
				// TODO Auto-generated catch block
				// e.printStackTrace();
			} catch (Exception e) {
				// TODO Auto-generated catch block
				// e.printStackTrace();
			}

		}
	}

}

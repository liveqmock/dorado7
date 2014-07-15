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

import com.bstek.dorado.config.Parser;
import com.bstek.dorado.view.output.Outputter;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2010-7-5
 */
public class VirtualPropertyDescriptor {
	private String name;
	private Class<?> type;
	private VirtualPropertyAvialableAt avialableAt = VirtualPropertyAvialableAt.server;
	private String referenceComponentType;
	private Object defaultValue;
	private Parser parser;
	private Outputter outputter;

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public Class<?> getType() {
		return type;
	}

	public void setType(Class<?> type) {
		this.type = type;
	}

	public VirtualPropertyAvialableAt getAvialableAt() {
		return avialableAt;
	}

	public void setAvialableAt(VirtualPropertyAvialableAt avialableAt) {
		this.avialableAt = avialableAt;
	}

	public String getReferenceComponentType() {
		return referenceComponentType;
	}

	public void setReferenceComponentType(String referenceComponentType) {
		this.referenceComponentType = referenceComponentType;
	}

	public Object getDefaultValue() {
		return defaultValue;
	}

	public void setDefaultValue(Object defaultValue) {
		this.defaultValue = defaultValue;
	}

	public Parser getParser() {
		return parser;
	}

	public void setParser(Parser parser) {
		this.parser = parser;
	}

	public Outputter getOutputter() {
		return outputter;
	}

	public void setOutputter(Outputter outputter) {
		this.outputter = outputter;
	}
}

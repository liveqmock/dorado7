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

package com.bstek.dorado.console.web;

import java.util.LinkedHashSet;
import java.util.Set;

import com.bstek.dorado.view.loader.Package;

/**
 * Dorado Package
 * 
 * @author Alex Tong (mailto:alex.tong@bstek.com)
 * @since 2012-12-27
 */

public class PackageVO extends Package {
	private Set<String> depends = new LinkedHashSet<String>();
	private Set<String> dependedBy = new LinkedHashSet<String>();

	public PackageVO() {
		super(null);
	}

	public void setDepends(Set<String> depends) {
		this.depends = depends;
	}

	public void setDependedBy(Set<String> dependedBy) {
		this.dependedBy = dependedBy;
	}

	/**
	 * 返回此资源包依赖的其他资源包的集合。集合中的项为依赖的资源包的名称。
	 */
	public Set<String> getDepends() {
		return depends;
	}

	public Set<String> getDependedBy() {
		return dependedBy;
	}

	public PackageVO(Package package1) {
		super(package1.getName());
		this.setBaseUri(package1.getBaseUri());
		this.setCharset(package1.getCharset());
		this.setContentType(package1.getContentType());
		this.setFileNames(package1.getFileNames());
		this.setPattern(package1.getPattern());
		this.setDepends(package1.getDepends());
		this.setDependedBy(package1.getDependedBy());
	}
}

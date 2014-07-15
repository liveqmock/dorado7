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

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.net.URL;

import com.bstek.dorado.core.Configure;

/**
 * 默认的资源描述对象的实现类。
 * 
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Feb 16, 2007
 */
public class DefaultResource implements Resource {
	private org.springframework.core.io.Resource adaptee;
	private String path;
	private boolean isClassPathResource = false;
	private boolean classPathResourceReloadable = false;

	public DefaultResource(org.springframework.core.io.Resource adaptee) {
		this.adaptee = adaptee;

		classPathResourceReloadable = Configure
				.getBoolean("core.classPathResourceReloadable");
		if (adaptee instanceof org.springframework.core.io.ClassPathResource) {
			path = ((org.springframework.core.io.ClassPathResource) adaptee)
					.getPath();
			isClassPathResource = true;
		} else if (adaptee instanceof org.springframework.core.io.FileSystemResource) {
			path = ((org.springframework.core.io.FileSystemResource) adaptee)
					.getPath();
		} else {
			try {
				URL url = adaptee.getURL();
				if (url != null) {
					path = url.getPath();
				}
			} catch (Exception e) {
				// do nothing
			}
		}
	}

	public org.springframework.core.io.Resource getAdaptee() {
		return adaptee;
	}

	public Resource createRelative(String relativePath) throws IOException {
		return new DefaultResource(adaptee.createRelative(relativePath));
	}

	public String getPath() {
		return path;
	}

	public boolean exists() {
		return adaptee.exists();
	}

	public String getDescription() {
		return adaptee.getDescription();
	}

	public File getFile() throws IOException {
		return adaptee.getFile();
	}

	public String getFilename() {
		return adaptee.getFilename();
	}

	public long getTimestamp() throws IOException {
		if (!isClassPathResource || classPathResourceReloadable) {
			File file = null;
			try {
				file = adaptee.getFile();
			} catch (FileNotFoundException e) {
				// do nothing
			}
			if (file != null && file.exists()) {
				return file.lastModified();
			}
		}
		return 0L;
	}

	public InputStream getInputStream() throws IOException {
		if (isClassPathResource && classPathResourceReloadable) {
			File file = null;
			try {
				file = adaptee.getFile();
			} catch (FileNotFoundException e) {
				// do nothing
			}
			if (file != null && file.exists()) {
				return new FileInputStream(file);
			}
		}
		return adaptee.getInputStream();
	}

	public URL getURL() throws IOException {
		return adaptee.getURL();
	}

	@Override
	public String toString() {
		return adaptee.toString();
	}

	@Override
	public boolean equals(Object obj) {
		boolean b = (obj == this);
		if (!b) {
			if (obj instanceof DefaultResource) {
				b = adaptee.equals(((DefaultResource) obj).adaptee);
			}
			if (obj instanceof Resource) {
				b = getDescription().equals(((Resource) obj).getDescription());
			}
		}
		return b;
	}

	@Override
	public int hashCode() {
		Object desc = adaptee.getDescription();
		if (desc == null && path != null) {
			desc = path;
		}

		return (desc != null) ? desc.hashCode() : super.hashCode();
	}
}

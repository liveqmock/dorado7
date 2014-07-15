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
import java.io.IOException;
import java.io.InputStream;
import java.net.URL;

/**
 * 资源描述对象的接口。
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Feb 16, 2007
 */
public interface Resource {

	/**
	 * 返回原始的资源路径。
	 */
	String getPath();

	/**
	 * 返回该资源是否真实存在。
	 */
	boolean exists();

	/**
	 * 返回该资源的时间戳。 类似于文件的最后修改时间，对于classpath等类型的资源可能无法取得真正的资源时间戳，在这种情况下将返回0。
	 * @throws IOException
	 */
	long getTimestamp() throws IOException;

	/**
	 * 返回该资源的InputStream。
	 * @throws IOException
	 */
	InputStream getInputStream() throws IOException;

	/**
	 * 返回该资源的URL。如果该资源无法通过URL描述将抛出IOException异常。
	 * @throws IOException
	 */
	URL getURL() throws IOException;

	/**
	 * 返回该资源对应的文件对象。如果该资源不能映射到具体的文件将抛出IOException异常。
	 * @throws IOException
	 */
	File getFile() throws IOException;

	/**
	 * 根据本资源的相对路径创建一个新的资源描述对象。
	 * @param relativePath 相对于本资源的相对路径
	 * @return 新的资源描述对象
	 * @throws IOException
	 */
	Resource createRelative(String relativePath) throws IOException;

	/**
	 * 返回该资源的文件名。此处的文件名是不包含文件路径的，例如："myfile.xml"。
	 */
	String getFilename();

	/**
	 * 返回该资源的描述信息，该信息可用于发生异常时的错误信息输出。<br>
	 * 该方法也将被用于toString()方法的内部实现。
	 * @see java.lang.Object#toString
	 */
	String getDescription();

}

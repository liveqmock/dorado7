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

/**
 * 可支持资源重装载的资源描述对象的接口。
 * <p>
 * 此种资源最重要的方法是isValid()，用于返回上次读取资源时的时间戳与该资源当前的时间戳是否一致。
 * 由于提取资源的时间戳涉及到物理资源的读取，因此是一个比较耗时的操作。为了避免程序过于频繁的执行isValid()而导致应用性能下降，
 * RefreshableResource通过其minValidateSeconds属性来限制提取资源时间戳的操作频率。
 * 如果isValid()方法被快速的连续调用，他们之间的时间间隔短于minValidateSeconds属性所设定的时间，
 * 那么除第一次之外的后续操作都不会执行真正的提取资源时间戳的操作，而仅仅是返回最后一次执行该提取时获得的结果。
 * 当某一次调用的时间距离最后一次执行提取资源时间戳操作的间隔已大于minValidateSeconds属性所设定的时间时，
 * 当此调用将执行真正的提取资源时间戳操作，并且从本次开始重新开始计时。
 * </p>
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Feb 19, 2007
 */
public interface RefreshableResource extends Resource {
	/**
	 * 返回最短的执行真正的资源时间戳验证时间间隔。
	 */
	long getMinValidateSeconds();

	/**
	 * 设置最短的执行真正的资源时间戳验证时间间隔。
	 */
	void setMinValidateSeconds(long minValidateSeconds);

	/**
	 * 返回上次读取资源时的时间戳与该资源当前的时间戳是否一致。
	 */
	boolean isValid();
}

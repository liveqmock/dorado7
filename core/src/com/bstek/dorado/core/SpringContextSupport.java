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

package com.bstek.dorado.core;

import org.springframework.context.ApplicationContext;

/**
 * 实现了获取Spring中配置的JavaBean实例功能的上下文抽象支持类。
 * <p>
 * 在默认的实现机制中，Dorado使用的核心服务都是配置在Spring的配置文件中的，并且所有的Bean都被冠以<b>dorado.</b>前缀。<br>
 * 例如：
 * 
 * <pre>
 * &lt;bean id=&quot;dorado.xmlDocumentBuilder&quot; ....&gt;
 * </pre>
 * 
 * </p>
 * <p>
 * 如果用户需要以自己的Bean替换掉某服务的默认实现类，那么他应当在其Spring配置文件中配置同名的Bean，
 * 且使用不同的配置。此时用户自行定义的Bean将会覆盖Dorado默认的配置。<br>
 * 注意：相同名称的Bean的定义不能出现在同一个配置文件中。后装载的配置文件中的Bean将会覆盖先前装载的配置文件中的同名的Bean。
 * 参考/com/bstek/dorado/core/configure.properties中的core.configLocation和core.
 * extensionConfigLocation参数，
 * dorado总是先尝试装载core.configLocation中定义的配置文件，然后在装载core.
 * extensionConfigLocation中定义的文件。
 * </p>
 * <p>
 * 需要注意的是，当我们通过{@link com.bstek.dorado.core.Context}来获取某个服务类时，并不需要指定Bean的前缀。<br>
 * 例如当我们试图获取上面提到的<code>xmlDocumentBuilder</code>服务时，相应的代码应为：
 * 
 * <pre>
 * context.getServiceBean(&quot;xmlDocumentBuilder&quot;);
 * </pre>
 * 
 * Dorado将自动根据配置查找名为<b>dorado.xmlDocumentBuilder</b>的Bean。
 * </p>
 * 
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Feb 20, 2007
 * @see com.bstek.dorado.core.Context
 * @see org.springframework.context.ApplicationContext
 */
public abstract class SpringContextSupport extends ContextSupport {
	private static final String BEAN_PREFIX = "dorado.";
	private static final char SPECIAL_SERVICE_PREFIX_CHAR = '&';

	public abstract ApplicationContext getApplicationContext() throws Exception;

	/**
	 * 获取某个核心服务类的实例。 在目前的实现方式中，服务类都是注册在Spring的配置文件中的。
	 * 
	 * @param name
	 *            服务名称
	 * @return 服务类的实例
	 * @throws Exception
	 */
	@Override
	public Object getServiceBean(String name) throws Exception {
		ApplicationContext applicationContext = getApplicationContext();
		if (applicationContext == null) {
			throw new ApplicationContextNotInitException(
					"Application Context not initialized yet, you may call this method too early.");
		}
		if (name.charAt(0) == SPECIAL_SERVICE_PREFIX_CHAR) {
			return applicationContext.getBean(name.substring(1));
		} else {
			return applicationContext.getBean(BEAN_PREFIX + name);
		}
	}

}

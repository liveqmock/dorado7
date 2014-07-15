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

package com.bstek.dorado.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Inherited;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2011-11-11
 */
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.TYPE)
@Inherited
public @interface XmlNode {
	String nodeName() default "";

	String label() default "";

	String icon() default "";

	/**
	 * 使用类的完全限定名，其中可以包含*
	 */
	String[] implTypes() default "";

	String definitionType() default "";

	boolean scopable() default false;

	boolean inheritable() default false;

	boolean isPublic() default true;

	int[] clientTypes() default {};

	boolean deprecated() default false;

	String parser() default "";

	String fixedProperties() default "";

	XmlProperty[] properties() default @XmlProperty();

	XmlSubNode[] subNodes() default @XmlSubNode();
}

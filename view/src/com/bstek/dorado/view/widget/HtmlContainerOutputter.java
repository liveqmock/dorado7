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

package com.bstek.dorado.view.widget;

import org.apache.commons.lang.StringUtils;

import com.bstek.dorado.common.event.DefaultClientEvent;
import com.bstek.dorado.view.output.OutputContext;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2011-5-13
 */
public class HtmlContainerOutputter extends ContainerOutputter {

	@Override
	public void output(Object object, OutputContext context) throws Exception {
		HtmlContainer htmlContainer = (HtmlContainer) object;
		if (StringUtils.isNotEmpty(htmlContainer.getContentFile())) {
			String calloutId = "html_" + context.getCalloutId();
			context.addCalloutHtml(htmlContainer, calloutId);

			StringBuffer script = new StringBuffer();
			script.append("self.assignDom(document.getElementById(\"")
					.append(calloutId).append("\"));");

			htmlContainer.addClientEventListener("onCreate",
					new DefaultClientEvent(script.toString()));
		}
		super.output(object, context);
	}

}

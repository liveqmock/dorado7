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

package com.bstek.dorado.view.widget.layout;

import java.util.HashMap;
import java.util.Map;

import org.apache.commons.lang.StringUtils;
import org.springframework.beans.BeanUtils;

import com.bstek.dorado.config.text.DispatchableTextParser;
import com.bstek.dorado.config.text.TextParseContext;
import com.bstek.dorado.config.text.TextParseException;
import com.bstek.dorado.config.text.TextParser;
import com.bstek.dorado.config.text.TextParserHelper;
import com.bstek.dorado.view.config.definition.LayoutDefinition;
import com.bstek.dorado.view.registry.LayoutTypeRegisterInfo;
import com.bstek.dorado.view.registry.LayoutTypeRegistry;

/**
 * 默认的布局管理器的文本配置信息的解析分派器。
 * 
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Apr 3, 2008
 */
public class LayoutTextParserDispatcher extends DispatchableTextParser {
	private LayoutTypeRegistry layoutTypeRegistry;
	private TextParserHelper textParserHelper;

	/**
	 * 设置布局管理器类型的注册管理器。
	 */
	public void setLayoutTypeRegistry(LayoutTypeRegistry layoutTypeRegistry) {
		this.layoutTypeRegistry = layoutTypeRegistry;
	}

	public void setTextParserHelper(TextParserHelper textParserHelper) {
		this.textParserHelper = textParserHelper;
	}

	@Override
	@SuppressWarnings("unchecked")
	public Object parse(char[] charArray, TextParseContext context)
			throws Exception {
		LayoutDefinition layout = null;
		String layoutType = parseHeader(charArray, context);
		if (StringUtils.isEmpty(layoutType)) {
			layoutType = layoutTypeRegistry.getDefaultType();
		}
		LayoutTypeRegisterInfo info = layoutTypeRegistry
				.getRegisterInfo(layoutType);
		if (info != null) {
			layout = new LayoutDefinition();
			layout.setType(info.getType());
			Class<? extends Layout> classType = info.getClassType();
			layout.setImplType(classType);
			TextParser layoutParser = textParserHelper.getTextParser(info
					.getClassType());

			Map<String, Object> attributes = (Map<String, Object>) layoutParser
					.parse(charArray, context);

			Map<String, Object> style = null;

			for (Map.Entry<String, Object> entry : attributes.entrySet()) {
				String key = entry.getKey();
				if (BeanUtils.getPropertyDescriptor(classType, key) != null) {
					layout.setProperty(key, entry.getValue());
				} else {
					if (style == null) {
						style = new HashMap<String, Object>();
					}
					style.put(key, entry.getValue());
				}
			}

			if (style != null) {
				layout.setProperty("style", style);
			}
		} else {
			throw new TextParseException("Unrecognized layout definition ["
					+ layoutType + "].");
		}
		return layout;
	}
}

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

package com.bstek.dorado.view.widget.form;

import com.bstek.dorado.view.widget.Align;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2010-8-10
 */
public interface FormConfig {
	String getWidth();

	void setWidth(String width);

	String getHeight();

	void setHeight(String height);

	String getClassName();

	void setClassName(String className);

	String getExClassName();

	void setExClassName(String exClassName);
	
	String getUi();

	void setUi(String ui);

	String getLabelSeparator();

	void setLabelSeparator(String labelSeparator);

	boolean isShowLabel();

	void setShowLabel(boolean showLabel);

	int getLabelWidth();

	void setLabelWidth(int labelWidth);

	int getLabelSpacing();

	void setLabelSpacing(int labelSpacing);

	FormElementLabelPosition getLabelPosition();

	void setLabelPosition(FormElementLabelPosition labelPosition);

	Align getLabelAlign();

	void setLabelAlign(Align labelAlign);

	int getEditorWidth();

	void setEditorWidth(int editorWidth);

	boolean isShowHint();

	void setShowHint(boolean showHint);

	int getHintWidth();

	void setHintWidth(int hintWidth);

	int getHintSpacing();

	void setHintSpacing(int hintSpacing);

	boolean isShowHintMessage();

	void setShowHintMessage(boolean showHintMessage);

	FormElementHintPosition getHintPosition();

	void setHintPosition(FormElementHintPosition hintPosition);

	boolean isReadOnly();

	void setReadOnly(boolean readOnly);
}

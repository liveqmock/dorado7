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

import java.util.Properties;

import com.bstek.dorado.annotation.ClientObject;
import com.bstek.dorado.annotation.ClientProperty;
import com.bstek.dorado.annotation.IdeProperty;
import com.bstek.dorado.annotation.XmlNode;
import com.bstek.dorado.common.ClientType;
import com.bstek.dorado.view.annotation.ComponentReference;
import com.bstek.dorado.view.annotation.Widget;
import com.bstek.dorado.view.widget.Align;
import com.bstek.dorado.view.widget.Component;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2010-8-10
 */
@Widget(name = "FormProfile", category = "Form", dependsPackage = "base-widget")
@ClientObject(prototype = "dorado.widget.FormProfile", shortTypeName = "FormProfile")
@XmlNode(clientTypes = { ClientType.DESKTOP, ClientType.TOUCH })
public class FormProfile extends Component implements FormConfig {
	private String width;
	private String height;
	private String className;
	private String exClassName;
	private String ui;
	private FormElementType type = FormElementType.text;
	private String trigger;
	private String labelSeparator;
	private boolean showLabel = true;
	private int labelWidth;
	private int labelSpacing;
	private FormElementLabelPosition labelPosition = FormElementLabelPosition.left;
	private Align labelAlign = Align.left;
	private int editorWidth;
	private Properties editorConfig;
	private boolean showHint = true;
	private int hintWidth;
	private int hintSpacing;
	private boolean showHintMessage;
	private FormElementHintPosition hintPosition;
	private boolean readOnly;

	private String dataSet;
	private String dataPath;

	public String getWidth() {
		return width;
	}

	public void setWidth(String width) {
		this.width = width;
	}

	public String getHeight() {
		return height;
	}

	public void setHeight(String height) {
		this.height = height;
	}

	public String getClassName() {
		return className;
	}

	public void setClassName(String className) {
		this.className = className;
	}

	public String getExClassName() {
		return exClassName;
	}

	public void setExClassName(String exClassName) {
		this.exClassName = exClassName;
	}

	public String getUi() {
		return ui;
	}

	public void setUi(String ui) {
		this.ui = ui;
	}

	@ClientProperty(escapeValue = "text")
	public FormElementType getType() {
		return type;
	}

	public void setType(FormElementType type) {
		this.type = type;
	}

	@ComponentReference("Trigger")
	@IdeProperty(enumValues = "triggerClear,autoMappingDropDown1,autoMappingDropDown2,defaultDateDropDown,defaultDateTimeDropDown,defaultYearMonthDropDown,defaultYearDropDown,defaultMonthDropDown")
	public String getTrigger() {
		return trigger;
	}

	public void setTrigger(String trigger) {
		this.trigger = trigger;
	}

	public String getLabelSeparator() {
		return labelSeparator;
	}

	public void setLabelSeparator(String labelSeparator) {
		this.labelSeparator = labelSeparator;
	}

	@ClientProperty(escapeValue = "true")
	public boolean isShowLabel() {
		return showLabel;
	}

	public void setShowLabel(boolean showLabel) {
		this.showLabel = showLabel;
	}

	public int getLabelWidth() {
		return labelWidth;
	}

	public void setLabelWidth(int labelWidth) {
		this.labelWidth = labelWidth;
	}

	public int getLabelSpacing() {
		return labelSpacing;
	}

	public void setLabelSpacing(int labelSpacing) {
		this.labelSpacing = labelSpacing;
	}

	@ClientProperty(escapeValue = "left")
	public FormElementLabelPosition getLabelPosition() {
		return labelPosition;
	}

	public void setLabelPosition(FormElementLabelPosition labelPosition) {
		this.labelPosition = labelPosition;
	}

	@ClientProperty(escapeValue = "left")
	public Align getLabelAlign() {
		return labelAlign;
	}

	public void setLabelAlign(Align labelAlign) {
		this.labelAlign = labelAlign;
	}

	public int getEditorWidth() {
		return editorWidth;
	}

	public void setEditorWidth(int editorWidth) {
		this.editorWidth = editorWidth;
	}

	public Properties getEditorConfig() {
		return editorConfig;
	}

	public void setEditorConfig(Properties editorConfig) {
		this.editorConfig = editorConfig;
	}

	@ClientProperty(escapeValue = "true")
	public boolean isShowHint() {
		return showHint;
	}

	public void setShowHint(boolean showHint) {
		this.showHint = showHint;
	}

	public int getHintWidth() {
		return hintWidth;
	}

	public void setHintWidth(int hintWidth) {
		this.hintWidth = hintWidth;
	}

	public int getHintSpacing() {
		return hintSpacing;
	}

	public void setHintSpacing(int hintSpacing) {
		this.hintSpacing = hintSpacing;
	}

	public boolean isShowHintMessage() {
		return showHintMessage;
	}

	public void setShowHintMessage(boolean showHintMessage) {
		this.showHintMessage = showHintMessage;
	}

	public FormElementHintPosition getHintPosition() {
		return hintPosition;
	}

	public void setHintPosition(FormElementHintPosition hintPosition) {
		this.hintPosition = hintPosition;
	}

	public boolean isReadOnly() {
		return readOnly;
	}

	public void setReadOnly(boolean readOnly) {
		this.readOnly = readOnly;
	}

	@ComponentReference("DataSet")
	@IdeProperty(highlight = 1)
	public String getDataSet() {
		return dataSet;
	}

	public void setDataSet(String dataSet) {
		this.dataSet = dataSet;
	}

	@IdeProperty(highlight = 1)
	public String getDataPath() {
		return dataPath;
	}

	public void setDataPath(String dataPath) {
		this.dataPath = dataPath;
	}

}

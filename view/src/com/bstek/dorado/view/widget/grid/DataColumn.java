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

package com.bstek.dorado.view.widget.grid;

import com.bstek.dorado.annotation.ClientProperty;
import com.bstek.dorado.annotation.IdeObject;
import com.bstek.dorado.annotation.IdeProperty;
import com.bstek.dorado.annotation.XmlNodeWrapper;
import com.bstek.dorado.annotation.XmlProperty;
import com.bstek.dorado.annotation.XmlSubNode;
import com.bstek.dorado.data.type.DataType;
import com.bstek.dorado.view.annotation.ComponentReference;
import com.bstek.dorado.view.widget.Align;
import com.bstek.dorado.view.widget.Control;
import com.bstek.dorado.view.widget.InnerElementReference;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2009-9-28
 */
@IdeObject(labelProperty = "name,property")
public class DataColumn extends AbstractDataColumn {
	private String property;
	private DataType dataType;
	private Align align;
	private boolean readOnly;
	private boolean required;
	private String displayFormat;
	private String typeFormat;
	private String summaryType;
	private String trigger;
	private boolean editable = true;
	private SortState sortState = SortState.none;
	private boolean wrappable;
	private boolean filterable = true;
	private String defaultFilterOperator;

	private String editorType = "TextEditor";
	private InnerElementReference<Control> editorRef = new InnerElementReference<Control>(
			this);

	@IdeProperty(highlight = 1)
	public String getProperty() {
		return property;
	}

	public void setProperty(String property) {
		this.property = property;
	}

	@XmlProperty(parser = "spring:dorado.dataTypePropertyParser")
	@ClientProperty
	public DataType getDataType() {
		return dataType;
	}

	public void setDataType(DataType dataType) {
		this.dataType = dataType;
	}

	@Override
	@ClientProperty
	public Align getAlign() {
		return align;
	}

	@Override
	public void setAlign(Align align) {
		this.align = align;
	}

	public boolean isReadOnly() {
		return readOnly;
	}

	public void setReadOnly(boolean readOnly) {
		this.readOnly = readOnly;
	}

	public boolean isRequired() {
		return required;
	}

	public void setRequired(boolean required) {
		this.required = required;
	}

	public String getDisplayFormat() {
		return displayFormat;
	}

	public void setDisplayFormat(String displayFormat) {
		this.displayFormat = displayFormat;
	}

	public String getTypeFormat() {
		return typeFormat;
	}

	public void setTypeFormat(String typeFormat) {
		this.typeFormat = typeFormat;
	}

	@IdeProperty(enumValues = "sum,average,count,max,min")
	public String getSummaryType() {
		return summaryType;
	}

	public void setSummaryType(String summaryType) {
		this.summaryType = summaryType;
	}

	@ComponentReference("Trigger")
	@IdeProperty(
			enumValues = "triggerClear,autoMappingDropDown1,autoMappingDropDown2,autoOpenMappingDropDown1,autoOpenMappingDropDown2,defaultDateDropDown,defaultDateTimeDropDown,defaultYearMonthDropDown,defaultYearDropDown,defaultMonthDropDown")
	public String getTrigger() {
		return trigger;
	}

	public void setTrigger(String trigger) {
		this.trigger = trigger;
	}

	@ClientProperty(escapeValue = "true")
	public boolean isEditable() {
		return editable;
	}

	public void setEditable(boolean editable) {
		this.editable = editable;
	}

	@ClientProperty(escapeValue = "none")
	public SortState getSortState() {
		return sortState;
	}

	public void setSortState(SortState sortState) {
		this.sortState = sortState;
	}

	public boolean isWrappable() {
		return wrappable;
	}

	public void setWrappable(boolean wrappable) {
		this.wrappable = wrappable;
	}

	@ClientProperty(escapeValue = "true")
	public boolean isFilterable() {
		return filterable;
	}

	public void setFilterable(boolean filterable) {
		this.filterable = filterable;
	}

	@ClientProperty(escapeValue = "TextEditor")
	@IdeProperty(
			highlight = 1,
			enumValues = "None,TextEditor,PasswordEditor,TextArea,CheckBox,RadioGroup,NumberSpinner")
	public String getEditorType() {
		return editorType;
	}

	public void setEditorType(String editorType) {
		this.editorType = editorType;
	}

	@XmlSubNode(wrapper = @XmlNodeWrapper(nodeName = "Editor",
			icon = "/com/bstek/dorado/view/widget/grid/Editor.png"))
	@ClientProperty
	public Control getEditor() {
		return editorRef.get();
	}

	public void setEditor(Control editor) {
		editorRef.set(editor);
	}

	public String getDefaultFilterOperator() {
		return defaultFilterOperator;
	}

	@IdeProperty(enumValues = "like,like*,*like,=,<>,>,>=,<,<=")
	public void setDefaultFilterOperator(String defaultFilterOperator) {
		this.defaultFilterOperator = defaultFilterOperator;
	}
}

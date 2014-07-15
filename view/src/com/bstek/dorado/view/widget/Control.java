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

import java.util.Map;

import com.bstek.dorado.annotation.ClientEvent;
import com.bstek.dorado.annotation.ClientEvents;
import com.bstek.dorado.annotation.ClientObject;
import com.bstek.dorado.annotation.ClientProperty;
import com.bstek.dorado.annotation.XmlNode;
import com.bstek.dorado.annotation.XmlProperty;
import com.bstek.dorado.common.ClientType;

/**
 * 控件的抽象类。
 * 
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since Feb 4, 2008
 */
@XmlNode(definitionType = "com.bstek.dorado.view.config.definition.ControlDefinition", parser = "spring:dorado.controlParser")
@ClientObject(prototype = "dorado.widget.Control", shortTypeName = "Control", outputter = "spring:dorado.controlOutputter")
@ClientEvents({
		@ClientEvent(name = "onCreateDom"),
		@ClientEvent(name = "beforeRefreshDom"),
		@ClientEvent(name = "onRefreshDom"),
		@ClientEvent(name = "onClick", clientTypes = ClientType.DESKTOP),
		@ClientEvent(name = "onDoubleClick", clientTypes = ClientType.DESKTOP),
		@ClientEvent(name = "onMouseDown"),
		@ClientEvent(name = "onMouseUp"),
		@ClientEvent(name = "onFocus"),
		@ClientEvent(name = "onBlur"),
		@ClientEvent(name = "onKeyDown"),
		@ClientEvent(name = "onKeyPress"),
		@ClientEvent(name = "onContextMenu"),
		@ClientEvent(name = "onGetDraggingIndicator"),
		@ClientEvent(name = "onDragStart"),
		@ClientEvent(name = "onDragStop"),
		@ClientEvent(name = "onDragMove"),
		@ClientEvent(name = "onDraggingSourceOver"),
		@ClientEvent(name = "onDraggingSourceOut"),
		@ClientEvent(name = "onDraggingSourceMove"),
		@ClientEvent(name = "beforeDraggingSourceDrop"),
		@ClientEvent(name = "onDraggingSourceDrop"),
		@ClientEvent(name = "onTap", clientTypes = ClientType.TOUCH),
		@ClientEvent(name = "onDoubleTap", clientTypes = ClientType.TOUCH),
		@ClientEvent(name = "onTapHold", clientTypes = ClientType.TOUCH),
		@ClientEvent(name = "onSwipe", clientTypes = ClientType.TOUCH) })
public abstract class Control extends Component implements HtmlElement,
		RenderableElement {
	private Object layoutConstraint;
	private String width;
	private String height;
	private String className;

	private String exClassName;
	private String ui = "default";
	private Map<String, Object> style;
	private String renderTo;
	private String renderOn;
	private String tip;
	private Boolean visible;
	private HideMode hideMode = HideMode.visibility;
	private boolean draggable;
	private String dragTags;
	private boolean droppable;
	private String droppableTags;

	@XmlProperty(parser = "spring:dorado.layoutConstraintParser")
	@ClientProperty(outputter = "spring:dorado.layoutConstraintPropertyOutputter")
	public Object getLayoutConstraint() {
		return layoutConstraint;
	}

	public void setLayoutConstraint(Object layoutConstraint) {
		this.layoutConstraint = layoutConstraint;
	}

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

	@ClientProperty(escapeValue = "default")
	public String getUi() {
		return ui;
	}

	public void setUi(String ui) {
		this.ui = ui;
	}

	@XmlProperty(parser = "spring:dorado.styleParser", composite = true)
	@ClientProperty(outputter = "spring:dorado.stylePropertyOutputter")
	public Map<String, Object> getStyle() {
		return style;
	}

	public void setStyle(Map<String, Object> style) {
		this.style = style;
	}

	public String getRenderTo() {
		return renderTo;
	}

	public void setRenderTo(String renderTo) {
		this.renderTo = renderTo;
	}

	public String getRenderOn() {
		return renderOn;
	}

	public void setRenderOn(String renderOn) {
		this.renderOn = renderOn;
	}

	public String getTip() {
		return tip;
	}

	public void setTip(String tip) {
		this.tip = tip;
	}

	public Boolean getVisible() {
		return visible;
	}

	public void setVisible(Boolean visible) {
		this.visible = visible;
	}

	@ClientProperty(escapeValue = "visibility")
	public HideMode getHideMode() {
		return hideMode;
	}

	public void setHideMode(HideMode hideMode) {
		this.hideMode = hideMode;
	}

	public boolean isDraggable() {
		return draggable;
	}

	public void setDraggable(boolean draggable) {
		this.draggable = draggable;
	}

	public String getDragTags() {
		return dragTags;
	}

	public void setDragTags(String dragTags) {
		this.dragTags = dragTags;
	}

	public boolean isDroppable() {
		return droppable;
	}

	public void setDroppable(boolean droppable) {
		this.droppable = droppable;
	}

	public String getDroppableTags() {
		return droppableTags;
	}

	public void setDroppableTags(String droppableTags) {
		this.droppableTags = droppableTags;
	}
}

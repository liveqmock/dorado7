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

package com.bstek.dorado.view.widget.base;

import com.bstek.dorado.annotation.ClientObject;
import com.bstek.dorado.annotation.ClientProperty;
import com.bstek.dorado.annotation.IdeProperty;
import com.bstek.dorado.view.annotation.Widget;
import com.bstek.dorado.view.widget.FloatControl;
import com.bstek.dorado.view.widget.FloatControlAlign;
import com.bstek.dorado.view.widget.FloatControlAnimateType;
import com.bstek.dorado.view.widget.FloatControlShadowMode;
import com.bstek.dorado.view.widget.FloatControlVAlign;
import com.bstek.dorado.view.widget.ModalType;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2010-6-2
 */
@Widget(name = "FloatPanel", category = "Floatable",
		dependsPackage = "base-widget-desktop")
@ClientObject(prototype = "dorado.widget.FloatPanel",
		shortTypeName = "FloatPanel")
public class FloatPanel extends Panel implements FloatControl {
	private FloatControlAnimateType animateType = FloatControlAnimateType.zoom;
	private FloatControlAnimateType showAnimateType;
	private FloatControlAnimateType hideAnimateType;
	private String animateTarget;
	private boolean center;
	private boolean modal;
	private ModalType modalType = ModalType.dark;
	private FloatControlShadowMode shadowMode = FloatControlShadowMode.sides;
	private boolean focusAfterShow = true;
	private boolean continuedFocus = true;

	private boolean floating = true;
	private String floatingClassName;
	private int left;
	private int top;
	private int offsetLeft;
	private int offsetTop;
	private String anchorTarget;
	private FloatControlAlign align;
	private FloatControlVAlign vAlign;
	private boolean autoAdjustPosition = true;
	private boolean handleOverflow = true;

	public FloatPanel() {
		setVisible(null);
	}

	@Override
	public Boolean getVisible() {
		return super.getVisible();
	}

	@ClientProperty(escapeValue = "zoom")
	public FloatControlAnimateType getAnimateType() {
		return animateType;
	}

	public void setAnimateType(FloatControlAnimateType animateType) {
		this.animateType = animateType;
	}

	public FloatControlAnimateType getShowAnimateType() {
		return showAnimateType;
	}

	public void setShowAnimateType(FloatControlAnimateType showAnimateType) {
		this.showAnimateType = showAnimateType;
	}

	public FloatControlAnimateType getHideAnimateType() {
		return hideAnimateType;
	}

	public void setHideAnimateType(FloatControlAnimateType hideAnimateType) {
		this.hideAnimateType = hideAnimateType;
	}

	@IdeProperty(visible = false)
	@Deprecated
	public String getAnimateTarget() {
		return animateTarget;
	}

	@Deprecated
	public void setAnimateTarget(String animateTarget) {
		this.animateTarget = animateTarget;
	}

	@IdeProperty(highlight = 1)
	public boolean isCenter() {
		return center;
	}

	public void setCenter(boolean center) {
		this.center = center;
	}

	@IdeProperty(highlight = 1)
	public boolean isModal() {
		return modal;
	}

	public void setModal(boolean modal) {
		this.modal = modal;
	}

	public ModalType getModalType() {
		return modalType;
	}

	public void setModalType(ModalType modalType) {
		this.modalType = modalType;
	}

	@ClientProperty(escapeValue = "sides")
	public FloatControlShadowMode getShadowMode() {
		return shadowMode;
	}

	public void setShadowMode(FloatControlShadowMode shadowMode) {
		this.shadowMode = shadowMode;
	}

	@ClientProperty(escapeValue = "true")
	public boolean isFocusAfterShow() {
		return focusAfterShow;
	}

	public void setFocusAfterShow(boolean focusAfterShow) {
		this.focusAfterShow = focusAfterShow;
	}

	@ClientProperty(escapeValue = "true")
	public boolean isContinuedFocus() {
		return continuedFocus;
	}

	public void setContinuedFocus(boolean continuedFocus) {
		this.continuedFocus = continuedFocus;
	}

	/**
	 * @return the floating
	 */
	@ClientProperty(escapeValue = "true")
	public boolean isFloating() {
		return floating;
	}

	/**
	 * @param floating
	 *            the floating to set
	 */
	public void setFloating(boolean floating) {
		this.floating = floating;
	}

	/**
	 * @return the floatingClassName
	 */
	public String getFloatingClassName() {
		return floatingClassName;
	}

	/**
	 * @param floatingClassName
	 *            the floatingClassName to set
	 */
	public void setFloatingClassName(String floatingClassName) {
		this.floatingClassName = floatingClassName;
	}

	/**
	 * @return the left
	 */
	public int getLeft() {
		return left;
	}

	/**
	 * @param left
	 *            the left to set
	 */
	public void setLeft(int left) {
		this.left = left;
	}

	/**
	 * @return the top
	 */
	public int getTop() {
		return top;
	}

	/**
	 * @param top
	 *            the top to set
	 */
	public void setTop(int top) {
		this.top = top;
	}

	/**
	 * @return the offsetLeft
	 */
	public int getOffsetLeft() {
		return offsetLeft;
	}

	/**
	 * @param offsetLeft
	 *            the offsetLeft to set
	 */
	public void setOffsetLeft(int offsetLeft) {
		this.offsetLeft = offsetLeft;
	}

	/**
	 * @return the offsetTop
	 */
	public int getOffsetTop() {
		return offsetTop;
	}

	/**
	 * @param offsetTop
	 *            the offsetTop to set
	 */
	public void setOffsetTop(int offsetTop) {
		this.offsetTop = offsetTop;
	}

	/**
	 * @return the anchorTarget
	 */
	@IdeProperty(visible = false)
	@Deprecated
	public String getAnchorTarget() {
		return anchorTarget;
	}

	/**
	 * @param anchorTarget
	 *            the anchorTarget to set
	 */
	@Deprecated
	public void setAnchorTarget(String anchorTarget) {
		this.anchorTarget = anchorTarget;
	}

	/**
	 * @return the align
	 */
	@IdeProperty(visible = false)
	@Deprecated
	public FloatControlAlign getAlign() {
		return align;
	}

	/**
	 * @param align
	 *            the align to set
	 */
	@Deprecated
	public void setAlign(FloatControlAlign align) {
		this.align = align;
	}

	/**
	 * @return the vAlign
	 */
	@IdeProperty(visible = false)
	@Deprecated
	public FloatControlVAlign getvAlign() {
		return vAlign;
	}

	/**
	 * @param vAlign
	 *            the vAlign to set
	 */
	@Deprecated
	public void setvAlign(FloatControlVAlign vAlign) {
		this.vAlign = vAlign;
	}

	/**
	 * @return the autoAdjustPosition
	 */
	@ClientProperty(escapeValue = "true")
	public boolean isAutoAdjustPosition() {
		return autoAdjustPosition;
	}

	/**
	 * @param autoAdjustPosition
	 *            the autoAdjustPosition to set
	 */
	public void setAutoAdjustPosition(boolean autoAdjustPosition) {
		this.autoAdjustPosition = autoAdjustPosition;
	}

	/**
	 * @return the handleOverflow
	 */
	@ClientProperty(escapeValue = "true")
	@IdeProperty(visible = false)
	@Deprecated
	public boolean isHandleOverflow() {
		return handleOverflow;
	}

	/**
	 * @param handleOverflow
	 *            the handleOverflow to set
	 */
	@Deprecated
	public void setHandleOverflow(boolean handleOverflow) {
		this.handleOverflow = handleOverflow;
	}

}

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

package com.bstek.dorado.view.widget.blockview;

import com.bstek.dorado.annotation.ClientEvent;
import com.bstek.dorado.annotation.ClientEvents;
import com.bstek.dorado.annotation.ClientProperty;
import com.bstek.dorado.common.ClientType;
import com.bstek.dorado.view.widget.list.AbstractList;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2010-2-11
 */
@ClientEvents({
		@ClientEvent(name = "onRenderBlock"),
		@ClientEvent(name = "onBlockClick", clientTypes = ClientType.DESKTOP),
		@ClientEvent(name = "onBlockDoubleClick", clientTypes = ClientType.DESKTOP),
		@ClientEvent(name = "onBlockMouseDown"),
		@ClientEvent(name = "onBlockMouseUp"),
		@ClientEvent(name = "onBlockTap", clientTypes = ClientType.TOUCH),
		@ClientEvent(name = "onBlockTapHold", clientTypes = ClientType.TOUCH) })
public abstract class AbstractBlockView extends AbstractList {
	private BlockLayout blockLayout = BlockLayout.vertical;
	private int lineSize;
	private boolean fillLine;
	private int blockWidth = 80;
	private int blockHeight = 80;
	private String renderer;
	private int horiSpacing = 8;
	private int vertSpacing = 8;
	private int horiPadding = 8;
	private int vertPadding = 8;
	private int blockDecoratorSize = 4;

	@ClientProperty(escapeValue = "vertical")
	public BlockLayout getBlockLayout() {
		return blockLayout;
	}

	public void setBlockLayout(BlockLayout blockLayout) {
		this.blockLayout = blockLayout;
	}

	public int getLineSize() {
		return lineSize;
	}

	public void setLineSize(int lineSize) {
		this.lineSize = lineSize;
	}

	public boolean isFillLine() {
		return fillLine;
	}

	public void setFillLine(boolean fillLine) {
		this.fillLine = fillLine;
	}

	@ClientProperty(escapeValue = "80")
	public int getBlockWidth() {
		return blockWidth;
	}

	public void setBlockWidth(int blockWidth) {
		this.blockWidth = blockWidth;
	}

	@ClientProperty(escapeValue = "80")
	public int getBlockHeight() {
		return blockHeight;
	}

	public void setBlockHeight(int blockHeight) {
		this.blockHeight = blockHeight;
	}

	public String getRenderer() {
		return renderer;
	}

	public void setRenderer(String renderer) {
		this.renderer = renderer;
	}

	@ClientProperty(escapeValue = "8")
	public int getHoriSpacing() {
		return horiSpacing;
	}

	public void setHoriSpacing(int spacing) {
		horiSpacing = spacing;
	}

	@ClientProperty(escapeValue = "8")
	public int getVertSpacing() {
		return vertSpacing;
	}

	public void setVertSpacing(int spacing) {
		vertSpacing = spacing;
	}

	@ClientProperty(escapeValue = "8")
	public int getHoriPadding() {
		return horiPadding;
	}

	public void setHoriPadding(int padding) {
		horiPadding = padding;
	}

	@ClientProperty(escapeValue = "8")
	public int getVertPadding() {
		return vertPadding;
	}

	public void setVertPadding(int padding) {
		vertPadding = padding;
	}

	@ClientProperty(escapeValue = "4")
	public int getBlockDecoratorSize() {
		return blockDecoratorSize;
	}

	public void setBlockDecoratorSize(int blockDecoratorSize) {
		this.blockDecoratorSize = blockDecoratorSize;
	}
}

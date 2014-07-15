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

package com.bstek.dorado.view.widget.advance;

import com.bstek.dorado.annotation.ClientObject;
import com.bstek.dorado.annotation.ClientProperty;
import com.bstek.dorado.annotation.IdeProperty;
import com.bstek.dorado.view.annotation.Widget;
import com.bstek.dorado.view.widget.form.AbstractDataEditor;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2013-12-4
 */
@Widget(name = "ColorEditor", category = "Form", dependsPackage = "color-picker")
@ClientObject(prototype = "dorado.widget.ColorEditor", shortTypeName = "ColorEditor")
public class ColorEditor extends AbstractDataEditor {
	private String color;
	private boolean showInput;
	private boolean showInitial;
	private boolean allowEmpty;
	private boolean showAlpha;
	private boolean disabled;
	private boolean showPalette;
	private boolean showPaletteOnly;
	private boolean showButtons = true;
	private PreferredFormat preferredFormat = PreferredFormat.name;
	private String[] palette;

	public String getColor() {
		return color;
	}

	public void setColor(String color) {
		this.color = color;
	}

	public boolean isShowInput() {
		return showInput;
	}

	public void setShowInput(boolean showInput) {
		this.showInput = showInput;
	}

	public boolean isShowInitial() {
		return showInitial;
	}

	public void setShowInitial(boolean showInitial) {
		this.showInitial = showInitial;
	}

	public boolean isAllowEmpty() {
		return allowEmpty;
	}

	public void setAllowEmpty(boolean allowEmpty) {
		this.allowEmpty = allowEmpty;
	}

	public boolean isShowAlpha() {
		return showAlpha;
	}

	public void setShowAlpha(boolean showAlpha) {
		this.showAlpha = showAlpha;
	}

	public boolean isDisabled() {
		return disabled;
	}

	public void setDisabled(boolean disabled) {
		this.disabled = disabled;
	}

	public boolean isShowPalette() {
		return showPalette;
	}

	public void setShowPalette(boolean showPalette) {
		this.showPalette = showPalette;
	}

	public boolean isShowPaletteOnly() {
		return showPaletteOnly;
	}

	public void setShowPaletteOnly(boolean showPaletteOnly) {
		this.showPaletteOnly = showPaletteOnly;
	}

	@ClientProperty(escapeValue = "true")
	public boolean isShowButtons() {
		return showButtons;
	}

	public void setShowButtons(boolean showButtons) {
		this.showButtons = showButtons;
	}

	@ClientProperty(escapeValue = "name")
	public PreferredFormat getPreferredFormat() {
		return preferredFormat;
	}

	public void setPreferredFormat(PreferredFormat preferredFormat) {
		this.preferredFormat = preferredFormat;
	}

	@IdeProperty(enumValues = "#sixteen,#websafe,#named")
	public String[] getPalette() {
		return palette;
	}

	public void setPalette(String[] palette) {
		this.palette = palette;
	}
}

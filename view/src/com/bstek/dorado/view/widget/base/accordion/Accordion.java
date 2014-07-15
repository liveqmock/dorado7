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

package com.bstek.dorado.view.widget.base.accordion;

import java.util.List;

import com.bstek.dorado.annotation.ClientEvent;
import com.bstek.dorado.annotation.ClientEvents;
import com.bstek.dorado.annotation.ClientObject;
import com.bstek.dorado.annotation.ClientProperty;
import com.bstek.dorado.annotation.ResourceInjection;
import com.bstek.dorado.annotation.XmlSubNode;
import com.bstek.dorado.view.annotation.Widget;
import com.bstek.dorado.view.widget.Control;
import com.bstek.dorado.view.widget.InnerElementList;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2010-8-9
 */
@Widget(name = "Accordion", category = "General",
		dependsPackage = "base-widget-desktop")
@ClientObject(prototype = "dorado.widget.Accordion",
		shortTypeName = "Accordion")
@ClientEvents({ @ClientEvent(name = "beforeCurrentSectionChange"),
		@ClientEvent(name = "onCurrentSectionChange") })
@ResourceInjection(subObjectMethod = "getSection")
public class Accordion extends Control {
	private List<Section> sections = new InnerElementList<Section>(this);
	private int currentSection;
	private boolean animate;

	public void addSection(Section section) {
		sections.add(section);
	}

	public Section getSection(String name) {
		for (Section section : sections) {
			if (name.equals(section.getName())) {
				return section;
			}
		}
		return null;
	}

	@XmlSubNode
	@ClientProperty
	public List<Section> getSections() {
		return sections;
	}

	public int getCurrentSection() {
		return currentSection;
	}

	public void setCurrentSection(int currentSection) {
		this.currentSection = currentSection;
	}

	public void setCurrentSection(Section currentSection) {
		int i = sections.indexOf(currentSection);
		if (i >= 0) {
			setCurrentSection(i);
		} else {
			throw new IllegalArgumentException(
					"The current Section must belongs to this SectionControl.");
		}
	}

	public void setCurrentSection(String currentSectionName) {
		int i = 0;
		for (Section section : sections) {
			if (currentSectionName.equals(section.getName())) {
				setCurrentSection(i);
				return;
			}
			i++;
		}
		throw new IllegalArgumentException("No such Section ["
				+ currentSectionName + "] in SectionControl.");
	}

	public boolean isAnimate() {
		return animate;
	}

	public void setAnimate(boolean animate) {
		this.animate = animate;
	}
}

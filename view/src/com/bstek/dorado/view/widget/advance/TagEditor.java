package com.bstek.dorado.view.widget.advance;

import com.bstek.dorado.annotation.ClientEvent;
import com.bstek.dorado.annotation.ClientEvents;
import com.bstek.dorado.annotation.ClientObject;
import com.bstek.dorado.annotation.ClientProperty;
import com.bstek.dorado.annotation.IdeProperty;
import com.bstek.dorado.view.annotation.ComponentReference;
import com.bstek.dorado.view.annotation.Widget;
import com.bstek.dorado.view.widget.form.AbstractTextEditor;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2012-7-6
 */
@Widget(name = "TagEditor", category = "Form", dependsPackage = "tag-editor")
@ClientObject(prototype = "dorado.widget.TagEditor", shortTypeName = "TagEditor")
@ClientEvents({ @ClientEvent(name = "beforeUnknownTagAccept"),
		@ClientEvent(name = "onUnknownTagAccept"),
		@ClientEvent(name = "beforeTagRemove"),
		@ClientEvent(name = "onTagRemove"),
		@ClientEvent(name = "beforeTagAdd"),
		@ClientEvent(name = "onTagAdd") })
public class TagEditor extends AbstractTextEditor {
	private String textSeperator = ",";
	private String[] availableTags;
	private String[] requiredTags;
	private String availableTagsDataSet;
	private String availableTagsDataPath;
	private boolean acceptUnknownTag = true;
	private boolean showAvailableTags = true;
    private boolean highlightRequiredTags= true;
	@ClientProperty(escapeValue = ",")
	public String getTextSeperator() {
		return textSeperator;
	}

	public void setTextSeperator(String textSeperator) {
		this.textSeperator = textSeperator;
	}

	@ClientProperty
	@IdeProperty(highlight = 1)
	public String[] getAvailableTags() {
		return availableTags;
	}

	public void setAvailableTags(String[] availableTags) {
		this.availableTags = availableTags;
	}

	@ClientProperty
	@IdeProperty(highlight = 1)
	public String[] getRequiredTags() {
		return requiredTags;
	}

	public void setRequiredTags(String[] requiredTags) {
		this.requiredTags = requiredTags;
	}

	@ComponentReference("DataSet")
	@IdeProperty(highlight = 1)
	public String getAvailableTagsDataSet() {
		return availableTagsDataSet;
	}

	public void setAvailableTagsDataSet(String availableTagsDataSet) {
		this.availableTagsDataSet = availableTagsDataSet;
	}

	@IdeProperty(highlight = 1)
	public String getAvailableTagsDataPath() {
		return availableTagsDataPath;
	}

	public void setAvailableTagsDataPath(String availableTagsDataPath) {
		this.availableTagsDataPath = availableTagsDataPath;
	}

	@ClientProperty(escapeValue = "true")
	public boolean isAcceptUnknownTag() {
		return acceptUnknownTag;
	}

	public void setAcceptUnknownTag(boolean acceptUnknownTag) {
		this.acceptUnknownTag = acceptUnknownTag;
	}

	@ClientProperty(escapeValue = "true")
	public boolean isShowAvailableTags() {
		return showAvailableTags;
	}

	public void setShowAvailableTags(boolean showAvailableTags) {
		this.showAvailableTags = showAvailableTags;
	}
	
	@ClientProperty(escapeValue = "true")
	public boolean isHighlightRequiredTags() {
		return highlightRequiredTags;
	}

	public void setHighlightRequiredTags(boolean highlightRequiredTags) {
		this.highlightRequiredTags = highlightRequiredTags;
	}
	
}

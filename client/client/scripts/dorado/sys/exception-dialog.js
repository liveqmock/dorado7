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

(function(){
	var exceptionStack = [], currentException;
	
	var exceptionDialog, exceptionDialogOpening = false;
	var exceptionDialogMinWidth = 300;
	var exceptionDialogMaxWidth = 800;
	var exceptionDialogMaxHeight = 500;
	
	var exceptionDetailDialog, exceptionDetailDialogOpening = false;
	
	dorado.Exception.alertException = function(e) {
		exceptionStack.push(e);
		if (!exceptionDialogOpening) doShowExceptionDialog();
	}
	
	function doShowExceptionDialog() {
		currentException = exceptionStack.pop();
		if (!currentException) return;
		
		var dialog = getExceptionDialog();
		dialog.set({
			caption: $resource("dorado.baseWidget.ExceptionDialogTitle"),
			left: undefined,
			top: undefined,
			width: exceptionDialogMaxWidth,
			height: undefined
		});
		dialog._textDom.innerText = dorado.Exception.getExceptionMessage(currentException);
		dialog.show();
	}
	
	function getExceptionDialog() {
		if (!exceptionDialog) {
			var doms = {};
			var contentDom = $DomUtils.xCreate({
				tagName: "DIV",
				className: "d-exception-content",
				content: [{
					tagName: "SPAN",
					className: "d-exception-icon",
					contextKey: "iconDom"
				}, {
					tagName: "SPAN",
					className: "d-exception-text",
					contextKey: "textDom"
				}]
			}, null, doms);
			
			var buttons = [];
			if ($setting["common.showExceptionStackTrace"]) {
				buttons.push({
					caption: $resource("dorado.baseWidget.ExceptionDialogDetail"),
					width: 80,
					onClick: function() {
						showExceptionDetailDialog(currentException);
					}
				});
			}
			
			buttons.push({
				caption: $resource("dorado.baseWidget.ExceptionDialogOK"),
				ui: "highlight",
				width: 85,
				onClick: function() {
					exceptionDialog.hide();
				}
			});
			
			exceptionDialog = new dorado.widget.Dialog({
				center: true,
				modal: true,
				resizeable: false,
				contentOverflow: "visible",
				layout: {
					$type: "Native"
				},
				buttonAlign: "right",
				buttons: buttons,
				beforeShow: function() {
					exceptionDialogOpening = true;
					
					var dom = exceptionDialog._dom;
					var $dom = jQuery(dom), $contentDom = jQuery(contentDom);
					
					var contentWidth = $fly(doms.iconDom).outerWidth() + $fly(doms.textDom).outerWidth();
					if (contentWidth < exceptionDialogMinWidth) {
						contentWidth = exceptionDialogMinWidth;
					} else if (contentWidth > exceptionDialogMaxWidth) {
						contentWidth = exceptionDialogMaxWidth;
					}
					var dialogWidth = $dom.width(), panelWidth = $contentDom.width();
					exceptionDialog._width = contentWidth + dialogWidth - panelWidth;
					
					var contentHeight = $contentDom.outerHeight();
					if (contentHeight > exceptionDialogMaxHeight) {
						contentHeight = exceptionDialogMaxHeight;
					} else {
						contentHeight = null;
					}
					if (contentHeight) {
						var dialogHeight = $dom.height(), panelHeight = $contentDom.height();
						exceptionDialog._height = contentHeight + dialogHeight - panelHeight;
					}
					
					exceptionDialog.refresh();
				},
				onHide: function() {
					setTimeout(function() {
						exceptionDialogOpening = false;
						doShowExceptionDialog(); // Show next exception
					}, 0);
				}
			});
			
			var containerDom = exceptionDialog.get("containerDom");
			containerDom.appendChild(contentDom);
			
			exceptionDialog._contentDom = contentDom;
			exceptionDialog._iconDom = doms.iconDom;
			exceptionDialog._textDom = doms.textDom;
		}
		return exceptionDialog;
	}
	
	function showExceptionDetailDialog(e) {
		if (!exceptionDetailDialogOpening) {
			var dialog = getExceptionDetailDialog();
			dialog._messsageTextArea.set("text", dorado.Exception.getExceptionMessage(e));
			
			var tabControl = dialog._tabControl, tab, currentTab;
			tab = tabControl.getTab("CallStack");
			tab.set("disabled", !e.stack);
			if (e.stack) {
				tab.get("control").set("text", dorado.Exception.formatStack(e.stack));
				currentTab = tab;
			}
			
			tab = tabControl.getTab("SystemStack");
			tab.set("disabled", !e.systemStack);
			if (e.systemStack) {
				tab.get("control").set("text", dorado.Exception.formatStack(e.systemStack));
				if (!currentTab) currentTab = tab;
			}
			
			tab = tabControl.getTab("RemoteStack");
			tab.set("disabled", !e.remoteStack);
			if (e.remoteStack) {
				tab.get("control").set("text", dorado.Exception.formatStack(e.remoteStack));
				if (!currentTab) currentTab = tab;
			}
			
			tabControl.set("currentTab", currentTab);
			dialog.show();
		}
	}
	
	function getExceptionDetailDialog() {
		if (!exceptionDetailDialog) {
			var messsageTextArea = new dorado.widget.TextArea({
				readOnly: true,
				selectTextOnFocus: false
			});
			var tabControl = new dorado.widget.TabControl({
				tabs: [{
					$type: "Control",
					name: "CallStack",
					caption: $resource("dorado.baseWidget.ExceptionDialogDetailCallStack"),
					control: {
						$type: "TextArea",
						readOnly: true,
						selectTextOnFocus: false
					}
				}, {
					$type: "Control",
					name: "SystemStack",
					caption: $resource("dorado.baseWidget.ExceptionDialogDetailSystemStack"),
					control: {
						$type: "TextArea",
						readOnly: true,
						selectTextOnFocus: false
					}
				}, {
					$type: "Control",
					name: "RemoteStack",
					caption: $resource("dorado.baseWidget.ExceptionDialogDetailRemoteStack"),
					control: {
						$type: "TextArea",
						readOnly: true,
						selectTextOnFocus: false
					}
				}]
			});
			
			exceptionDetailDialog = new dorado.widget.Dialog({
				caption: $resource("dorado.baseWidget.ExceptionDialogDetailTitle"),
				width: 800,
				height: 560,
				center: true,
				resizeable: true,
				maximizeable: true,
				layout: {
					regionPadding: 8
				},
				children: [{
					$type: "Container",
					height: 60,
					children: [{
						$type: "FormElement",
						width: "100%",
						showHint: false,
						label: $resource("dorado.baseWidget.ExceptionDialogDetailMessage"),
						editor: messsageTextArea
					}]
				}, tabControl],
				beforeShow: function() {
					exceptionDialogDetailOpening = true;
				},
				onHide: function() {
					exceptionDialogDetailOpening = false;
				}
			});
			
			exceptionDetailDialog._messsageTextArea = messsageTextArea;
			exceptionDetailDialog._tabControl = tabControl;
		}
		return exceptionDetailDialog;
	}
})();

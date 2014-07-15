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

(function() {
	var currentException, exceptionDialog, detailExceptionDialog;
	var exceptionDialogMinWidth = 300;
	var exceptionDialogMaxWidth = 800;
	var exceptionDialogMaxHeight = 500;

	dorado.widget.UpdateAction.alertException = function(e) {
		currentException = e;

		$import("grid", function() {
			var dialog = getExceptionDialog();
			dialog.set({
				caption: $resource("dorado.baseWidget.ExceptionDialogTitle"),
				left: undefined,
				top: undefined,
				width: exceptionDialogMaxWidth,
				height: undefined
			});
			dialog._textDom.innerText = dorado.Exception.getExceptionMessage(e) + '\n';
			dialog.show();
		});
	}

	function getExceptionDialog() {
		if (!exceptionDialog) {
			var doms = {};
			var contentDom = $DomUtils.xCreate({
				tagName: "DIV",
				className: "d-exception-content",
				content: [
					{
						tagName: "SPAN",
						className: "d-exception-icon",
						contextKey: "iconDom"
					},
					{
						tagName: "SPAN",
						className: "d-exception-text",
						contextKey: "textDom"
					}
				]
			}, null, doms);

			exceptionDialog = new dorado.widget.Dialog({
				center: true,
				modal: true,
				resizeable: false,
				contentOverflow: "visible",
				layout: {
					$type: "Native"
				},
				buttonAlign: "right",
				buttons: [
					{
						caption: $resource("dorado.baseWidget.ExceptionDialogOK"),
						width: 85,
						onClick: function() {
							exceptionDialog.hide();
						}
					}
				],
				afterShow: function(dialog) {
					var buttons = dialog._buttons, button;
					if (buttons) {
						button = buttons[0];
						if (button && button._dom.style.display != "none") {
							button.setFocus();
						}
					}
				},
				beforeShow: function(dialog) {
					getDetailLink().render(dialog._textDom);

					var dom = dialog._dom;
					var $dom = jQuery(dom), $contentDom = jQuery(contentDom);

					var contentWidth = $fly(doms.iconDom).outerWidth() + $fly(doms.textDom).outerWidth();
					if (contentWidth < exceptionDialogMinWidth) {
						contentWidth = exceptionDialogMinWidth;
					}
					else if (contentWidth > exceptionDialogMaxWidth) {
						contentWidth = exceptionDialogMaxWidth;
					}
					var dialogWidth = $dom.width(), panelWidth = $contentDom.width();
					dialog._width = contentWidth + dialogWidth - panelWidth;

					var contentHeight = $contentDom.outerHeight();
					if (contentHeight > exceptionDialogMaxHeight) {
						contentHeight = exceptionDialogMaxHeight;
					}
					else {
						contentHeight = null;
					}
					if (contentHeight) {
						var dialogHeight = $dom.height(), panelHeight = $contentDom.height();
						dialog._height = contentHeight + dialogHeight - panelHeight;
					}

					dialog.doOnResize();
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

	var detailLink, detailDialog;

	function getDetailLink() {
		if (!detailLink) {
			detailLink = new dorado.widget.Link({
				text: $resource("dorado.baseWidget.ShowSubmitValidationDetail"),
				onClick: function(self, arg) {
					arg.returnValue = false;
					try {
						showDetailExceptionDialog(currentException);
					}
					catch(e) {
						dorado.Exception.processException(e);
					}
				}
			});
		}
		return detailLink;
	}

	function showDetailExceptionDialog(e) {

		function translateMessage(items, messages) {
			messages.each(function(message) {
				var item = dorado.Object.clone(message);
				if (item.entity && item.property) {
					var pd = item.entity.getPropertyDef(item.property);
					if (pd) item.propertyCaption = pd.get("label");
				}
				items.push(item);
			});
		}

		var dialog = getDetailExceptionDialog();
		var items = [], validateContext = e.validateContext;

		if (validateContext) {
			if (validateContext.error) translateMessage(items, validateContext.error);
			if (validateContext.warn) translateMessage(items, validateContext.warn);
		}

		dialog._grid.set("items", items);
		dialog.show();
	}

	function getDetailExceptionDialog() {
		if (!detailExceptionDialog) {
			var grid = new dorado.widget.Grid({
				readOnly: true,
				dynaRowHeight: true,
				columns: [
					{
						property: "state",
						caption: $resource("dorado.baseWidget.SubmitValidationDetailState"),
						width: 36,
						align: "center",
						onRenderCell: function(self, arg) {
							var iconClass;
							switch(arg.data.state) {
								case "error":
								{
									iconClass = "d-update-action-icon-error";
									break;
								}
								case "warn":
								{
									iconClass = "d-update-action-icon-warn";
									break;
								}
							}

							var $dom = $fly(arg.dom);
							$dom.empty().xCreate({
								tagName: "LABEL",
								className: iconClass,
								style: {
									width: 16,
									height: 16,
									display: "inline-block"
								}
							});
							arg.processDefault = false;
						}
					},
					{
						property: "text",
						caption: $resource("dorado.baseWidget.SubmitValidationDetailMessage"),
						wrappable: true
					},
					{
						property: "property",
						caption: $resource("dorado.baseWidget.SubmitValidationDetailProperty"),
						width: 200,
						resizeable: true,
						onRenderCell: function(self, arg) {
							if (arg.data.propertyCaption && arg.data.propertyCaption != arg.data.property) {
								arg.dom.innerText = arg.data.propertyCaption + "(" + arg.data.property + ")";
								arg.processDefault = false;
							}
							else {
								arg.processDefault = true;
							}
						}
					}
				],
				onDataRowDoubleClick: function(self, arg) {
					var currentItem = self.get("currentEntity");
					if (currentItem && currentItem.entity) {
						currentItem.entity.setCurrent(true);
					}
				}
			});

			detailExceptionDialog = new dorado.widget.Dialog({
				caption: $resource("dorado.baseWidget.ShowSubmitValidationDetail"),
				width: 800,
				height: 280,
				center: true,
				modal: true,
				resizeable: true,
				layout: {
					regionPadding: 8
				},
				children: [
					{
						$type: "ToolTip",
						text: $resource("dorado.baseWidget.SubmitValidationDetailTip"),
						floating: false,
						arrowDirection: "bottom",
						arrowAlign: "left"
					},
					grid
				]
			});

			detailExceptionDialog._grid = grid;
		}
		return detailExceptionDialog;
	}
})();

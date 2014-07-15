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

	var skin = "default";

	var testLibsBefore = [
		"client/scripts/json/json2.js",

		"client/scripts/jquery/jquery-1.8.0.js",
		"client/scripts/jquery/jquery-template-1.0.0.js",
		"client/scripts/jquery/jquery.easing.1.3.js",
		"client/scripts/jquery/jquery.mousewheel.js",
		"client/scripts/jquery/aop.js",
		"client/scripts/jquery/jquery.hotkeys.js",
		"client/scripts/jquery/jquery.swfobject.1-1-1.js",
		"client/scripts/jquery/jquery-ui-1.8.22.custom.js",

		"client-test/lib/jsunit/app/jsUnitCore.js",

		"client-test/lib/test-setting.js"
	];

	var doradoLibs = [
		"core/lang.js",
		"core/jquery-redefine.js",
		"core/core.js",
		"core/object.js",
		"core/setting.js",
		"core/exception.js",
		"core/attribute.js",
		"core/event.js",
		"core/tag-manager.js",
		"core/renderer.js",
		"core/renderable-element.js",
		"core/toolkits.js",

		"util/util.js",
		"util/date.js",
		"util/common.js",
		"util/resource.js",
		"util/iterator.js",
		"util/keyed-array.js",
		"util/keyed-list.js",
		"util/object-pool.js",
		"util/json.js",
		"util/ajax.js",
		"util/map.js",

		"data/data-pipe.js",
		"data/data-provider.js",
		"data/data-resolver.js",
		"data/data-type.js",
		"data/data-type-repository.js",
		"data/property-def.js",
		"data/entity.js",
		"data/entity-list.js",
		"data/validator.js",
		"data/data-path.js",
		"data/data-util.js",

		"dom/dom.js",
		"dom/shadow.js",
		"dom/modal-manager.js",
		"dom/jquery-dom.js",
		"dom/jquery-x-create.js",
        "dom/jquery-slide.js",
		"dom/jquery-dragdrop.js",
        "dom/modal-manager.js",
        "dom/task-indicator.js",

		"drag-drop/dragging-indicator.js",
		"drag-drop/drag-drop.js",

		"widget/component.js",
		"widget/control.js",
		"widget/float-control.js",

		"widget/layout/layout.js",
		"widget/layout/anchor-layout.js",
		"widget/layout/dock-layout.js",
		"widget/layout/box-layout.js",
		"widget/layout/form-layout.js",

		"widget/container.js",
		"widget/view.js",
		"widget/data-set.js",
		"widget/sub-view-holder.js",
		"widget/html-container.js",

		"widget/action/action.js",
        "widget/action/form-action.js",
		"widget/action/rpc-action.js",

        "widget/base/abstract-button.js",
        "widget/base/simple-button.js",
		"widget/base/button.js",
        "widget/base/iframe.js",
		"widget/base/caption-bar.js",
		"widget/base/panel.js",
		"widget/base/group-box.js",
		"widget/base/float-panel.js",
        "widget/base/dialog.js",
		"widget/base/float-container.js",

		"widget/base/card-book.js",
        "widget/base/tab.js",
        "widget/base/tab-bar.js",
		"widget/base/tab-control.js",

        "widget/base/msgbox.js",
        "widget/base/split-panel.js",
        "widget/base/progress-bar.js",
        "widget/base/slider.js",
        "widget/base/tip.js",
        "widget/base/accordion.js",
        "widget/base/toolbar.js",

		"widget/base/float-container.js",
		"widget/base/float-panel.js",
        "widget/base/dialog.js",
        "widget/base/menu-item.js",
        "widget/base/menu.js",

		"widget/data-control/data-control.js",
		"widget/data-control/property-data-control.js",

		"widget/form/label.js",
		"widget/form/abstract-editor.js",
		"widget/form/trigger.js",
		"widget/form/dropdown.js",
		"widget/form/list-dropdown.js",
		"widget/form/dataset-dropdown.js",
		"widget/form/custom-dropdown.js",
		"widget/form/text-editor.js",
		"widget/form/text-area.js",
        "widget/form/check-box.js",
        "widget/form/radio-button.js",
        "widget/form/year-month-dropdown.js",
        "widget/form/date-dropdown.js",
		"widget/form/data-message.js",
        "widget/form/form-element.js",
        "widget/form/autoform.js",
		"widget/form/spinner.js",

		"widget/data-control/data-pilot.js",

		"widget/list/abstract-list.js",
		"widget/list/item-model.js",
		"widget/list/row-list.js",
		"widget/list/list-box.js",
		"widget/list/data-list-box.js",

		"widget/grid/column-model.js",
		"widget/grid/abstract-grid.js",
		"widget/grid/grid.js",
		"widget/grid/data-grid.js",

		"widget/tree/tree-model.js",
		"widget/tree/abstract-tree.js",
		"widget/tree/tree.js",
		"widget/tree/data-tree.js",

		"widget/block-view/abstract-block-view.js",
		"widget/block-view/block-view.js",
		"widget/block-view/data-block-view.js",

		"widget/tree-grid/tree-grid.js",
		"widget/tree-grid/data-tree-grid.js",

		"widget/debugger/debugger.js",
		"widget/debugger/console.js",
	    "widget/debugger/script.js",
		"widget/debugger/view.js",
		"widget/debugger/hotkeys.js",
		"widget/debugger/ajax.js",

		"widget/advance/portal.js",
		"widget/advance/image-canvas.js",

        "widget/html-editor/ueditor_all.js",
        "widget/html-editor/color-picker.js",
		"widget/html-editor/face-picker.js",
        "widget/html-editor/html-editor.js",
        "widget/html-editor/html-editor-plugins.js"
	];
	
	var addOnLibs = [
		"chart/client/scripts/dorado/chart.js",
		"chart/client/scripts/dorado/model.js",
		"chart/client/scripts/dorado/binding.js",
		"chart/client/scripts/dorado/axis.js",
		"chart/client/scripts/dorado/element.js",
		
		"desktop/client/scripts/dorado/app.js",
		"desktop/client/scripts/dorado/desktop.js",
		"desktop/client/scripts/dorado/taskbar.js",
		"desktop/client/scripts/dorado/shell.js",
		
		"tag-editor/client/scripts/dorado/tag-editor.js"
	];

	var locale = "zh_CN"
	var testLibsAfter = [
		"client/skins/" + skin + "/support.js",

		"bin/resources/i18n/core." + locale + ".js",
		"bin/resources/i18n/data." + locale + ".js",
		"bin/resources/i18n/widget." + locale + ".js",
		"bin/resources/i18n/base-widget." + locale + ".js",
		"bin/resources/i18n/list." + locale + ".js",
		"bin/resources/i18n/grid." + locale + ".js",
		"bin/resources/i18n/tree." + locale + ".js",

		"client-test/lib/test-utils.js"
	];

    var inherentStyleSheets = [
        "common.css",
        "widget.css",
        "trigger.css",
        "text-editor.css",
        "spinner.css",
        "list.css",
        "grid.css",
        "tree.css"
    ];
	
	var addOnStyleSheets = [
 		"desktop/client/skins/" + skin + "/desktop.css",
 		"tag-editor/client/skins/inherent/tag-editor.css",
 		"tag-editor/client/skins/" + skin + "/tag-editor.css"
 	];

	var cacheBuster = "";
	if ((location + "").substring(0, 4) == "http") {
		cacheBuster = "?cacheBuster=" + parseInt(new Date().getTime() / 10000);
	}

	var WORKSPACE_ROOT = "/client-test/workspace/";
	var CLIENT_ROOT = WORKSPACE_ROOT + "client/";

    writeIncludeStyleSheet(CLIENT_ROOT + "bin/skins/inherent/all.css");
    writeIncludeStyleSheet(CLIENT_ROOT + "bin/skins/default/all.css");

    for (var i = 0; i < addOnStyleSheets.length; i++) {
		writeIncludeStyleSheet(WORKSPACE_ROOT + addOnStyleSheets[i]);
	}

	for (var i = 0; i < testLibsBefore.length; i++) {
		writeIncludeScriptlet(CLIENT_ROOT + testLibsBefore[i]);
	}

	for (var i = 0; i < doradoLibs.length; i++) {
		writeIncludeScriptlet(CLIENT_ROOT + "client/scripts/dorado/" + doradoLibs[i]);
	}

	for (var i = 0; i < addOnLibs.length; i++) {
		writeIncludeScriptlet(WORKSPACE_ROOT + addOnLibs[i]);
	}

	for (var i = 0; i < testLibsAfter.length; i++) {
		writeIncludeScriptlet(CLIENT_ROOT + testLibsAfter[i]);
	}

	function writeIncludeScriptlet(file) {
		document.writeln("<script language=\"JavaScript\" type=\"text/javascript\" src=\"" + file /*+ cacheBuster*/ + "\" charset=\"utf-8\"></script>");
	}

	function writeIncludeStyleSheet(file) {
		document.writeln("<link rel=\"stylesheet\" type=\"text/css\" href=\"" + file /*+ cacheBuster*/ + "\" />");
	}
})();

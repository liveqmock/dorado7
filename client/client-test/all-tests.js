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

var ALL_JS_CASES = [
	"client/client-test/core/lang-test.jsunit.html",
	"client/client-test/core/core-test.jsunit.html",
	"client/client-test/core/attribute-test.jsunit.html",
	"client/client-test/core/event-test.jsunit.html",
	"client/client-test/core/object-test.jsunit.html",
	"client/client-test/core/toolkits-test.jsunit.html",

	"client/client-test/util/date-test.jsunit.html",
	"client/client-test/util/common-test.jsunit.html",
	"client/client-test/util/resource-test.jsunit.html",
	"client/client-test/util/iterator-test.jsunit.html",
	"client/client-test/util/keyed-array-test.jsunit.html",
	"client/client-test/util/keyed-list-test.jsunit.html",
	"client/client-test/util/object-pool-test.jsunit.html",
	"client/client-test/util/ajax-test.jsunit.html",
	"client/client-test/util/dom-test.jsunit.html",

	"client/client-test/data/data-type-test.jsunit.html",
	"client/client-test/data/data-type-repository-test.jsunit.html",
	"client/client-test/data/data-provider-test.jsunit.html",
	"client/client-test/data/data-resolver-test.jsunit.html",
	"client/client-test/data/data-pipe-test.jsunit.html",
	"client/client-test/data/entity-test.jsunit.html",
	"client/client-test/data/entity-list-test.jsunit.html",
	"client/client-test/data/data-path-test.jsunit.html",
	"client/client-test/data/data-util-test.jsunit.html",

	"client/client-test/data/load-data-service-test.jsunit.html",
	"client/client-test/data/data-provider-service-test.jsunit.html",
	"client/client-test/data/entity-service-test.jsunit.html",
	"client/client-test/data/entity-list-service-test.jsunit.html",
	"client/client-test/data/data-type-service-test.jsunit.html",

	"client/client-test/widget/layout/layout-test.jsunit.html",

	"client/client-test/widget/container-test.jsunit.html",
	"client/client-test/widget/view-test.jsunit.html",
	"client/client-test/widget/view-service-test.jsunit.html",
	"client/client-test/widget/html-container-test.html",
	"client/client-test/widget/data-set-test.jsunit.html",

	"client/client-test/widget/action/action-support-test.jsunit.html",
	"client/client-test/widget/action/update-action-test.jsunit.html",

	"client/client-test/widget/grid/column-model-test.html",

	"client/client-test/widget/tree/tree-model-test.jsunit.html",

	"client/client-test/misc/test-utils-test.jsunit.html",
	"client/client-test/misc/misc-test.jsunit.html"
];

var ALL_JS_PAGES = [
	"client/client-test/core/boot-test.html",

	"client/client-test/jquery/jquery-x-create-test.html",
	"client/client-test/util/shadow-test.html",

	"client/client-test/drag-drop/drag-indicator-test.html",

	"client/client-test/widget/action/form-submit-action-test.html",

	"client/client-test/widget/layout/anchor-layout-test.html",
	"client/client-test/widget/layout/dock-layout-test.html",
	"client/client-test/widget/layout/hbox-layout-test.html",
	"client/client-test/widget/layout/vbox-layout-test.html",
	"client/client-test/widget/layout/form-layout-test.html",

	"client/client-test/widget/sub-view-test.html",
	"client/client-test/widget/html-container-test.html",

	"client/client-test/widget/base/button-test.html",
    "client/client-test/widget/base/menu-test.html",
	"client/client-test/widget/base/toolbar-test.html",
	"client/client-test/widget/base/menubar-test.html",

	"client/client-test/widget/base/captionbar-test.html",
	"client/client-test/widget/base/panel-test.html",
	"client/client-test/widget/base/float-panel-test.html",
	"client/client-test/util/task-indicator-test.html",
	"client/client-test/widget/base/groupbox-test.html",
	"client/client-test/widget/base/accordion-test.html",

    "client/client-test/widget/base/dialog-test.html",
    "client/client-test/widget/base/msgbox-test.html",
	"client/client-test/widget/base/notifytip-test.html",

	"client/client-test/widget/base/tabbar-test.html",
	"client/client-test/widget/base/card-book-test.html",
    "client/client-test/widget/base/tabcontrol-test.html",

    "client/client-test/widget/base/splitpanel-test.html",
    "client/client-test/widget/base/progressbar-test.html",
    "client/client-test/widget/base/slider-test.html",
    "client/client-test/widget/base/tip-test.html",

	"client/client-test/widget/form/data-label-test.html",
	"client/client-test/widget/form/text-editor-test.html",
	"client/client-test/widget/form/data-text-editor-test.html",
	"client/client-test/widget/form/text-area-test.html",
	"client/client-test/widget/form/list-dropdown-test.html",
    "client/client-test/widget/form/check-box-test.html",
    "client/client-test/widget/form/radio-button-test.html",
	"client/client-test/widget/form/auto-mapvalues-dropdown-test.html",
    "client/client-test/widget/form/ym-dropdown-test.html",
    "client/client-test/widget/form/date-dropdown-test.html",
	"client/client-test/widget/form/form-element-test.html",
	"client/client-test/widget/form/data-form-element-test.html",
	"client/client-test/widget/form/autoform-test.html",
	"client/client-test/widget/form/spinner-test.html",
	"client/client-test/widget/form/data-message-test.html",
	"client/client-test/widget/form/tag-editor-test.html",
	
	"client/client-test/widget/data-control/data-pilot-test.html",

	"client/client-test/widget/list/list-box-test.html",
	"client/client-test/widget/list/data-list-box-test.html",

	"client/client-test/widget/grid/column-model-test.html",
	"client/client-test/widget/grid/grid1-test.html",
	"client/client-test/widget/grid/grid2-test.html",
	"client/client-test/widget/grid/grid3-test.html",
	"client/client-test/widget/grid/grid4-test.html",
	"client/client-test/widget/grid/data-grid-test.html",

	"client/client-test/widget/tree/tree-test.html",
	"client/client-test/widget/tree/data-tree-test.html",

	"client/client-test/widget/block-view/block-view-test.html",
	"client/client-test/widget/block-view/image-block-view-test.html",
	"client/client-test/widget/block-view/data-block-view-test.html",

	"client/client-test/widget/tree-grid/tree-grid-test.html",
	"client/client-test/widget/tree-grid/data-tree-grid-test.html",

	/**
	"client/client-test/widget/chart/area-chart-test.html",
	"client/client-test/widget/chart/radar-chart-test.html",
	"client/client-test/widget/chart/custom-chart-test.html",
	"client/client-test/widget/chart/line-chart-test.html",
	"client/client-test/widget/chart/column-chart-test.html",
	"client/client-test/widget/chart/bar-chart-test.html",
	"client/client-test/widget/chart/stacked-chart-test.html",
	"client/client-test/widget/chart/candle-chart-test.html",
	"client/client-test/widget/chart/pie-chart-test.html",
	"client/client-test/widget/chart/sketch-chart-test.html",
	"client/client-test/widget/chart/scatter-chart-test.html",
	"client/client-test/widget/chart/shape-chart-test.html",
	"client/client-test/widget/chart/tags-test.html",
	 **/

	"client/client-test/widget/advance/portal-test.html",
	"client/client-test/widget/advance/image-canvas-test.html",
	"client/client-test/widget/advance/web-desktop-test.html",
	"client/client-test/widget/advance/html-editor-test.html",
    "client/client-test/widget/advance/u-editor-test.html"
];

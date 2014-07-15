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

function testPagingEntityList() {
	var dataProvider = dorado.DataProvider.create("providerPagingData1");
	var dataType = new dorado.AggregationDataType("TestPagingList");

	var entityList = new dorado.EntityList(null, dorado.DataTypeRepository.ROOT, dataType);
	entityList.dataProvider = dataProvider;
	entityList.parameter = "Entity";
	entityList.pageSize = 10;
	entityList.pageCount = 11;

	entityList.gotoPage(1);
	var count = 0;
	entityList.each(function(entity) {
		count++;
		assertEquals("Entity-" + count, entity.get("key"));
	});
	assertEquals(10, count);

	entityList.gotoPage(3);
	count = 0;
	entityList.each(function(entity) {
		count++;
		if (count > 10) {
			assertEquals("Entity-" + (10 + count), entity.get("key"));
		}
	});
	assertEquals(20, count);

	var iteratorOption = {
		includeUnloadPage: true
	};
	count = 0;
	for ( var it = entityList.iterator(iteratorOption); it.hasNext();) {
		var entity = it.next();
		count++;
		assertEquals("Entity-" + count, entity.get("key"));
	}
	assertEquals(108, count);
}

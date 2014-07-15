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

function test() {
	var factory = {
		counter: 0,

		makeObject: function() {
			return {
				id: ++this.counter
			};
		},

		activateObject: function(object) {
			object.activated = true;
		},

		passivateObject: function(object) {
			object.activated = false;
		},

		destroyObject: function(object) {
			object.destroyed = true;
		}
	};

	var pool = new dorado.util.ObjectPool(factory);

	// borrowObject object1
	var object1 = pool.borrowObject();
	assertEquals(1, object1.id);
	assertTrue(object1.activated);
	assertEquals(1, factory.counter);
	assertEquals(1, pool.getNumActive());
	assertEquals(0, pool.getNumIdle());

	// borrowObject object2
	var object2 = pool.borrowObject();
	assertEquals(2, object2.id);
	assertTrue(object2.activated);
	assertEquals(2, factory.counter);
	assertEquals(2, pool.getNumActive());
	assertEquals(0, pool.getNumIdle());

	// borrowObject object3
	var object3 = pool.borrowObject();
	assertEquals(3, object3.id);
	assertTrue(object3.activated);
	assertEquals(3, factory.counter);
	assertEquals(3, pool.getNumActive());
	assertEquals(0, pool.getNumIdle());

	// returnObject object2
	pool.returnObject(object2);
	assertFalse(object2.activated);
	assertEquals(3, factory.counter);
	assertEquals(2, pool.getNumActive());
	assertEquals(1, pool.getNumIdle());

	// returnObject object3
	pool.returnObject(object3);
	assertFalse(object3.activated);
	assertEquals(1, pool.getNumActive());
	assertEquals(2, pool.getNumIdle());

	// returnObject object1
	pool.returnObject(object1);
	assertFalse(object1.activated);
	assertEquals(0, pool.getNumActive());
	assertEquals(3, pool.getNumIdle());

	// destroy the pool
	pool.destroy();
	assertTrue(object1.destroyed);
	assertTrue(object2.destroyed);
	assertTrue(object3.destroyed);
}

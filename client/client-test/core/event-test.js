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

TestClass = $extend(dorado.EventSupport, {
	EVENTS: {
		event1: {},
		event2: {},
		event3: {
			interceptor: function(superFire, arg1, arg2) {
				event3InterceptorCount++;
				return superFire(arg1, arg2);
			}
		}

	}
});

var event2InterceptorCount = event3InterceptorCount = 0;

function setUpPage() {
	Test.preloadAsyncTests( [ SimultaneousCallbacks ]);
}

function testBaseEvent() {
	function onEvent1() {
		event1Counter++;
		assertEquals(foo, this);
	}

	function onEvent2() {
		event2Counter++;
		assertEquals(document.body, this);
	}

	function onEvent3() {
		event3Counter++;
	}

	var foo = new TestClass();
	var event1Counter = event2Counter = event3Counter = 0;

	foo.addListener("event1", onEvent1);
	foo.fireEvent("event1");
	assertEquals(1, event1Counter);

	// event1
	foo.addListener("event1", onEvent1);
	foo.fireEvent("event1"); // event1 should be fired twice here.
	assertEquals(2, event1Counter);

	foo.clearListeners("event1");
	foo.fireEvent("event1");
	assertEquals(2, event1Counter);

	// event2
	foo.addListener("event2", onEvent2, {
		scope: document.body
	});
	foo.fireEvent("event2");
	assertEquals(1, event2Counter);

	// disableListeners and enableListeners
	foo.disableListeners();
	foo.disableListeners();
	foo.enableListeners();

	foo.fireEvent("event2");
	assertEquals(1, event2Counter);

	foo.enableListeners();
	foo.fireEvent("event2");
	assertEquals(2, event2Counter);

	// delay
	foo.addListener("event3", onEvent3, {
		delay: 100
	});
	foo.fireEvent("event3");
	assertEquals(0, event3Counter);

	// this test not reach in jsunit.
	setTimeout(function() {
		assertEquals(1, event3Counter);
	}, 200);
}

function testEventDef() {

	function onEvent3_1(arg1, arg2) {
		assertEquals("ABC", arg1);
		assertEquals(123, arg2);
	}

	function onEvent3_2(arg1, arg2) {
		assertEquals("ABC", arg1);
		assertEquals(123, arg2);
	}

	var foo = new TestClass();

	foo.addListener("event3", onEvent3_1);
	foo.addListener("event3", onEvent3_2);

	var oldCount = event3InterceptorCount;
	foo.fireEvent("event3", "ABC", 123);
	assertEquals(1, event3InterceptorCount - oldCount);
}

var SimultaneousCallbacks = {
	load: function() {
		var task1 = {
			counter: 0,

			callback: function() {
				this.counter++;
			},

			run: function(callback) {
				setTimeout(callback, 300);
			}
		};

		var task2 = {
			counter: 0,

			callback: function() {
				this.counter++;
			},

			run: function(callback) {
				setTimeout(callback, 200);
			}
		};

		var task3 = {
			counter: 0,

			callback: function(callback) {
				this.counter++;
			},

			run: function(callback) {
				setTimeout(callback, 100);
			}
		};

		Test.asyncProcBegin("SimultaneousCallbacks");
		dorado.Callback.simultaneousCallbacks( [ task1, task2, task3 ], function() {
			Test.asyncProcEnd("SimultaneousCallbacks");
		});
	},

	run: function() {
		assertEquals(task1.counter, 1);
		assertEquals(task2.counter, 1);
		assertEquals(task3.counter, 1);
	}
};

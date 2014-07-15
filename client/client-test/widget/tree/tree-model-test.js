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

var NODES = [ {
	label: "node1"
}, {
	label: "node2",
	nodes: [ {
		label: "node21"
	}, {
		label: "node22"
	}, {
		label: "node23"
	} ]
}, {
	label: "node3"
}, {
	label: "node4",
	nodes: [ {
		label: "node41"
	}, {
		label: "node42"
	}, {
		label: "node43"
	} ]
}, {
	label: "node5",
	nodes: [ {
		label: "node51"
	}, {
		label: "node52",
		nodes: [ {
			label: "node521",
			nodes: [ {
				label: "node5211"
			}, {
				label: "node5212"
			}, {
				label: "node5213"
			} ]
		}, {
			label: "node522"
		}, {
			label: "node523",
			nodes: [ {
				label: "node5231"
			}, {
				label: "node5232"
			}, {
				label: "node5233"
			} ]
		} ]
	}, {
		label: "node53"
	} ]
} ];

function getRootNode() {
	var ATTRIBUTE_EXPANDED = dorado.widget.tree.Node.prototype.ATTRIBUTES.expanded;
	var oldDefaultValue = ATTRIBUTE_EXPANDED.defaultValue;
	ATTRIBUTE_EXPANDED.defaultValue = true;
	try {
		var root = new dorado.widget.tree.Node("<ROOT>");
		assertFalse(!!root.get("hasChild"));
		root.addNodes(NODES);
		return root;
	}
	finally {
		ATTRIBUTE_EXPANDED.defaultValue = oldDefaultValue;
	}
}

function testTreeNode() {
	var root = getRootNode();

	assertEquals(true, root.get("hasChild"));
	assertEquals(5, root.get("nodes").size);

	var nodes = root.get("nodes");
	var node2 = nodes.toArray()[1];

	assertNotNull(node2);
	assertEquals("node2", node2.get("caption"));
	assertEquals(3, node2.get("nodes").size);

	node2.addNode(new dorado.widget.tree.Node());
	node2.addNode(new dorado.widget.tree.Node());
	assertEquals(5, node2.get("nodes").size);

	node2.remove();
	assertEquals(4, root.get("nodes").size);
}

function testIterator1() {
	var root = getRootNode();

	var counter = 0, lastNode = null;
	var it = new dorado.widget.tree.TreeNodeIterator(root);
	while (it.hasNext()) {
		var node = it.next();
		assertNotNull(node);
		assertNotEquals(lastNode, node);
		lastNode = node;
		counter++;
	}
	assertEquals(23, counter);

	counter = 0, lastNode = null;
	var it = new dorado.widget.tree.TreeNodeIterator(root);
	it.last();
	while (it.hasPrevious()) {
		var node = it.previous();
		assertNotNull(node);
		assertNotEquals(lastNode, node);
		lastNode = node;
		counter++;
	}
	assertEquals(23, counter);
}

function testIteratorReverse() {
	var root = getRootNode();

	var s1, s2, s3;
	var it = new dorado.widget.tree.TreeNodeIterator(root);
	while (it.hasNext()) {
		var node = it.next();
		if (node.get("caption") == "node521") {
			s1 = true;

			node = it.previous();
			assertEquals("node52", node.get("caption"));

			node = it.previous();
			assertEquals("node51", node.get("caption"));

			node = it.next();
			assertEquals("node52", node.get("caption"));

			node = it.next();
			assertEquals("node521", node.get("caption"));
		}
		else if (node.get("caption") == "node5213") {
			s2 = true;

			node = it.previous();
			assertEquals("node5212", node.get("caption"));

			node = it.previous();
			assertEquals("node5211", node.get("caption"));

			node = it.previous();
			assertEquals("node521", node.get("caption"));

			node = it.next();
			assertEquals("node5211", node.get("caption"));

			node = it.next();
			assertEquals("node5212", node.get("caption"));

			node = it.next();
			assertEquals("node5213", node.get("caption"));
		}
		else if (node.get("caption") == "node53") {
			s3 = true;

			node = it.previous();
			assertEquals("node5233", node.get("caption"));

			node = it.previous();
			assertEquals("node5232", node.get("caption"));

			node = it.next();
			assertEquals("node5233", node.get("caption"));

			node = it.next();
			assertEquals("node53", node.get("caption"));
		}
	}
	assertTrue(!!s1);
	assertTrue(!!s2);
	assertTrue(!!s3);
}

function testIteratorNextIndex() {
	var root = getRootNode(), node, it;
	
	it = new dorado.widget.tree.TreeNodeIterator(root, {
		nextIndex: 0
	});
	node = it.next();
	assertEquals("node1", node.get("caption"));

	it = new dorado.widget.tree.TreeNodeIterator(root, {
		nextIndex: 1
	});
	node = it.next();
	assertEquals("node2", node.get("caption"));

	it = new dorado.widget.tree.TreeNodeIterator(root, {
		nextIndex: 2
	});
	node = it.next();
	assertEquals("node21", node.get("caption"));

	it = new dorado.widget.tree.TreeNodeIterator(root, {
		nextIndex: 5
	});
	node = it.next();
	assertEquals("node3", node.get("caption"));

	it = new dorado.widget.tree.TreeNodeIterator(root, {
		nextIndex: 9
	});
	node = it.next();
	assertEquals("node43", node.get("caption"));

	it = new dorado.widget.tree.TreeNodeIterator(root, {
		nextIndex: 20
	});
	node = it.next();
	assertEquals("node5232", node.get("caption"));

	var counter = 0, lastNode = null;
	it = new dorado.widget.tree.TreeNodeIterator(root, {
		nextIndex: 7
	});
	while (it.hasNext()) {
		var node = it.next();
		assertNotNull(node);
		assertNotEquals(lastNode, node);
		lastNode = node;
		counter++;
	}
	assertEquals(16, counter);
}

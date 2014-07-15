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

function testFormat1() {
	var n = 123456789.789;
	assertEquals("123456790", dorado.util.Common.formatFloat(n, "0"));
	assertEquals("123456790", dorado.util.Common.formatFloat(n, "#"));
	assertEquals("123456789.79", dorado.util.Common.formatFloat(n, "0.00"));
	assertEquals("123,456,789.789", dorado.util.Common.formatFloat(n, "#,##0.###"));
	assertEquals("123,456,790", dorado.util.Common.formatFloat(n, "#,###"));
	assertEquals("123,456,789.79", dorado.util.Common.formatFloat(n, "#,##0.00"));
}

function testFormat2() {
	var n = 123;
	assertEquals("123", dorado.util.Common.formatFloat(n, "#.##"));
	assertEquals("123.00", dorado.util.Common.formatFloat(n, "#.00"));
	assertEquals("123.00", dorado.util.Common.formatFloat(n, "#,##0.00"));
}

function testFormat3() {
	var n = 0.123;
	assertEquals(".12", dorado.util.Common.formatFloat(n, "#.##"));
	assertEquals("", dorado.util.Common.formatFloat(n, "#"));
}

function testFormat4() {
	var n = -0.123;
	assertEquals("-.12", dorado.util.Common.formatFloat(n, "#.##"));
	assertEquals("", dorado.util.Common.formatFloat(n, "#"));
}

function testFormat5() {
	var n = -123456789.789;
	assertEquals("-123456790", dorado.util.Common.formatFloat(n, "0"));
	assertEquals("-123456790", dorado.util.Common.formatFloat(n, "#"));
	assertEquals("-123456789.79", dorado.util.Common.formatFloat(n, "0.00"));
	assertEquals("-123,456,789.789", dorado.util.Common.formatFloat(n, "#,##0.###"));
	assertEquals("-123,456,790", dorado.util.Common.formatFloat(n, "#,###"));
	assertEquals("-123,456,789.79", dorado.util.Common.formatFloat(n, "#,##0.00"));
}

function testFormat6() {
	var n = -123456789.789;
	assertEquals("$-123456790/M", dorado.util.Common.formatFloat(n, "$0/M"));
	assertEquals("$-123,456,789.79/M", dorado.util.Common.formatFloat(n, "$#,##0.00/M"));
}

function testFormat7() {
	var n = "02145375683";
	assertEquals("(021)45375683", dorado.util.Common.formatFloat(n, "(###)########"));
	assertEquals("(0021)45375683", dorado.util.Common.formatFloat(n, "(0000)00000000"));
}

function testParse1() {
	var s = "AA-BB01234CC567D.E890FF";
	assertEquals(-1234567.89, dorado.util.Common.parseFloat(s));
}

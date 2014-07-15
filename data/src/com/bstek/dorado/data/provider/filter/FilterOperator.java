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

package com.bstek.dorado.data.provider.filter;

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @since 2012-3-1
 */
public enum FilterOperator {
	eq {
		@Override
		public String toString() {
			return "=";
		}
	},
	ne {
		@Override
		public String toString() {
			return "<>";
		}
	},
	gt {
		@Override
		public String toString() {
			return ">";
		}
	},
	lt {
		@Override
		public String toString() {
			return "<";
		}
	},
	le {
		@Override
		public String toString() {
			return "<=";
		}
	},
	ge {
		@Override
		public String toString() {
			return ">=";
		}
	},
	like, likeStart {
		@Override
		public String toString() {
			return "like*";
		}
	},
	likeEnd {
		@Override
		public String toString() {
			return "*like";
		}
	},
	between, in
}

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

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @component General
 * @class 可完全通过HTML/DHTML自定义渲染方式的容器控件。
 * @extends dorado.widget.Container
 */
dorado.widget.HtmlContainer = $extend(dorado.widget.Container, /** @scope dorado.widget.HtmlContainer.prototype */ {
	$className: "dorado.widget.HtmlContainer",
	focusable: false,

	ATTRIBUTES: /** @scope dorado.widget.HtmlContainer.prototype */ {

		className: {
			defaultValue: "d-html-container"
		},

		/**
		 * 子控件的内容。
		 * <p>
		 * 此属性支持以下4中定义方式:
		 * <ul>
		 * <li>String - 通过一段HTML字符串来指定控件的内容。</li>
		 * <li>HTMLElement - 直接指定一个DOM对象作为控件的内容。</li>
		 * <li>Object - JSON形式定义的组件的模板信息。{@link dorado.util.Dom.xCreate}。</li>
		 * <li>Object[] - JSON形式定义的组件的模板信息(同上)或DOM对象的数组。</li>
		 * </ul>
		 * </p>
		 * @param {String|HTMLElement|Object|Object[]} content 控件的内容。
		 * @attribute
		 * @see dorado.util.Dom.xCreate
		 */
		content: {
			skipRefresh: true,
			setter: function(content) {
				this._content = content;
				if (this._ready && this._rendered) {
					this.applyContent(this._dom, content);
				}
			}
		},

		/**
		 * 作为子控件容器的子DOM对象的CSS选择表达式。
		 * @type String
		 * @attribute writeBeforeReady
		 *
		 * @example
		 * 例如HtmlControl自身的DOM结构为:
		 * <table><tr><td class="cell1"><td><td class="cell2"><td></tr></table>
		 * 为了指定其中的<td class="cell2"><td>作为子控件的容器，可以指定containerExpression属性为：td.cell2
		 */
		containerExpression: {
			writeBeforeReady: true
		}
	},

	destroy: function() {
		if (this._divFormInnerHtml)  {
			$fly(this._divFormInnerHtml).remove();
			delete this._divFormInnerHtml;
		}
		$invokeSuper.call(this);
	},

	assignDom: function(dom) {
		this._dom = dom;
		if (dom) {
			try {
				dom.style.display = "";
			}
			catch(e) {
				// do nothing
			}
		}
	},

	createDom: function() {
		var dom = document.createElement("SPAN");
		if (this._content) {
			this.applyContent(dom, this._content);
		}
		return dom;
	},

	applyContent: function(dom, content) {
		var layoutDom;
		if (this._layout && this._layout._dom) {
			layoutDom = this._layout._dom;
			layoutDom.parentNode.removeChild(layoutDom);
		}

		if (content) {
			this._xCreateContext = {};
			var doms = [];
			this.pushHtmlElement(doms, this._content);
			$fly(dom).empty().append(doms);
		}
		else {
			$fly(dom).empty();
		}

		var container = dom;
		if (this._containerExpression) {
			var jq = $fly(container).find(this._containerExpression);
			if (jq && jq.length > 0) container = jq[0];
		}
		this._container = container;

		if (container && layoutDom) {
			container.appendChild(layoutDom);
		}

		if (this._ready && this._rendered) {
			this.updateModernScroller();
		}
	},

	pushHtmlElement: function(doms, content) {

		function doPush(doms, content, context) {
			if (!content) return;

			if (content.constructor == String) {
				var div = this._divFormInnerHtml;
				if (!div) this._divFormInnerHtml = div = document.createElement("DIV");
				div.innerHTML = content;
				while(div.firstChild) {
					var node = div.firstChild;
					div.removeChild(node);
					if (dorado.Browser.msie && node.nodeType == 3) { // IE may crash on div.appendChild(#text)
						var span = document.createElement("SPAN");
						span.appendChild(node);
						node = span;
					}
					doms.push(node);
				}
			}
			else if (content.nodeType) {
				doms.push(content);
			}
			else {
				doms.push($DomUtils.xCreate(content, null, context));
			}
		}

		if (content instanceof Array) {
			for(var i = 0; i < content.length; i++)
				doPush(doms, content[i], this._xCreateContext);
		}
		else {
			doPush(doms, content, this._xCreateContext);
		}
	},

	refreshDom: function(dom) {
		if (this.getRealHeight() || this._children.size) dom.style.display = "inline-block";
		$invokeSuper.call(this, [dom]);
	},

	/**
	 * 根据contextKey返回一个内部的子DOM元素。
	 * <p>此方法仅当content属性是通过Object或Object[]方式定义是有效，
	 * 即此时HTMLContainer中的DOM元素是通过{@link dorado.util.Dom.xCreate}方法创建的来的。</p>
	 * @param {String} contextKey 子DOM元素对应的contextKey。
	 * @return {HTMLElement} 子DOM元素。
	 * @see {@link dorado.util.Dom.xCreate}
	 */
	getSubDom: function(contextKey) {
		this.getDom();
		return this._xCreateContext ? this._xCreateContext[contextKey] : null;
	}
});

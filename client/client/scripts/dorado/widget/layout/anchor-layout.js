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

	/**
	 * @author Benny Bao (mailto:benny.bao@bstek.com)
	 * @class 锚定式布局管理器。
	 *        <p>
	 *        锚定布局的基本思路就是设定控件的边界与容器或其它控件之间的距离，最终得出希望得到的局部效果。
	 *        锚定式布局类似于绝对定位的布局，但其功能比绝对定位布局要丰富的多。
	 *        </p>
	 *        <p>
	 *        首先，锚定式布局不仅支持对left和top边的定位，还支持对right和bottom边的定位。如下图中的Control3。
	 *        </p>
	 *        <p>
	 *        其次，不仅可以将容器的边界作为锚定目标进行定位，还支持将其他控件的边界作为锚定目标进行定位。如下图中的Control2和Control4。
	 *        不过在AnchorLayout中，并不允许一个控件将任意的其他控件设定为锚定目标。<br>
	 *        AnchorLayout只允许将上一个控件设定为锚定目标，即按照各控件被添加到布局管理器中的顺序来计算的上一个控件。
	 *        </p>
	 *        <img class="clip-image" src="images/anchor-layout-1.gif">
	 *        <p>
	 *        当为一个控件同时指定了left和right的锚定或top和bottom的锚定时，其产生的效果是该控件的尺寸将会随着容器尺寸的改变而改变。<br>
	 *        下图中的Control1由于其left和right同时设定的锚定，因此其宽度会随容器的改变而改变。<br>
	 *        下图中的Control2 由于其4个边同时设定的锚定，因此其宽度和高度会随容器的改变而改变。
	 *        </p>
	 *        <img class="clip-image" src="images/anchor-layout-2.gif">
	 *        <p>
	 *        AnchorLayout不但支持以数值作为锚定值，也支持以百分比作为锚定值。<br>
	 *        而当AnchorLayout在百分比的锚定值时，会在总距离中事先扣除控件本身的宽度或高度。<br>
	 *        下图中Control1的left锚定值为50%，因此其实际产生的效果是另Control1在水平方向上居中。<br>
	 *        下图中Control2的top锚定值为50%，因此其实际产生的效果是另Control2在垂直方向上居中。<br>
	 *        下图中Control3的left锚定值为100%，由于事先扣除了控件本身的宽度。这并不会使Control3超出右边界，其实际产生的效果与将其right锚定值设置为0是一样的。
	 *        </p>
	 *        <p>
	 *        AnchorLayout的布局条件支持的具体子属性包括:
	 *        <ul>
	 *        <li>anchorLeft - {String}
	 *        锚定方式，该属性只在left属性中定义了实际内容时才有效（0也表示实际有效的内容）。有3种取值：
	 *        <ul>
	 *        <li>none - 表示忽略left属性中设置的任何数值。</li>
	 *        <li>container - 将left处理为距离容器左边界的距离。</li>
	 *        <li>previous - 将left处理为距离布局管理器中前一个对象的左边界距离。</li>
	 *        </ul>
	 *        </li>
	 *        <li>left - {String|int} 左边界距离。</li>
	 *        <li>anchorTop - {String} 参考anchorLeft。</li>
	 *        <li>top - {String|int} 参考left。</li>
	 *        <li>anchorRight - {String} 参考anchorLeft。</li>
	 *        <li>right - {String|int} 参考left。</li>
	 *        <li>anchorBottom - {String} 参考anchorLeft。</li>
	 *        <li>bottom - {String|int} 参考left。</li>
	 *        <li>leftOffset - {int} 左边界偏移量，即根据其他所条件计算出布局区间的位置之后，再加上这个值作为最终的布局位置。</li>
	 *        <li>topOffset - {int} 上边界偏移量。参考leftOffset。</li>
	 *        <li>widthOffset - {int} 宽度偏移量。参考leftOffset。</li>
	 *        <li>heightOffset - {int} 高度偏移量。参考leftOffset。</li>
	 *        </ul>
	 *        </p>
	 *        <img class="clip-image" src="images/anchor-layout-3.gif">
	 * @shortTypeName Anchor
	 * @extends dorado.widget.layout.Layout
	 */
	dorado.widget.layout.AnchorLayout = $extend(dorado.widget.layout.Layout, /** @scope dorado.widget.layout.AnchorLayout.prototype */
		{
			$className: "dorado.widget.layout.AnchorLayout",
			_className: "d-anchor-layout",

			createDom: function() {
				var dom = document.createElement("DIV");
				dom.className = this._className;
				return dom;
			},

			refreshDom: function(dom) {
				dom.style.width = "100%";
				dom.style.height = "100%";
				this.doRefreshDom(dom);
			},

			doRefreshDom: function(dom) {
				this._maxRagionRight = this._maxRagionBottom = 0;
				for(var it = this._regions.iterator(); it.hasNext();) {
					var region = it.next();
					var constraint = region.constraint;
					if (constraint == dorado.widget.layout.Layout.NONE_LAYOUT_CONSTRAINT) continue;

					var realignArg = this.adjustRegion(region);
					if (realignArg) this.realignRegion(region, realignArg);
				}
				if (this.processOverflow(dom)) this.calculateRegions();
			},

			recordMaxRange: function(region) {
				var controlDom = region.control.getDom();
				if (controlDom.style.position == "absolute") {
					if (region.right === undefined) {
						var right = (region.left || 0) + region.realWidth + region.regionPadding;
						if (right > this._maxRagionRight) this._maxRagionRight = right;
					}

					if (region.bottom === undefined) {
						var bottom = (region.top || 0) + region.realHeight + region.regionPadding;
						if (bottom > this._maxRagionBottom) this._maxRagionBottom = bottom;
					}
				}
			},

			processOverflow: function(dom) {
				var overflowed = false, padding = parseInt(this._padding) || 0;
				var containerSize = this._container.getContentContainerSize();
				
				var width = this._maxRagionRight;
				if (width < dom.scrollWidth) width = dom.scrollWidth;
				if (width > 0 && (width > containerSize[0] || (width == dom.offsetWidth && dom.style.width == ""))) {
					dom.style.width = (width + padding) + "px";
					overflowed = true;
				}

				var height = this._maxRagionBottom;
				if (height < dom.scrollHeight) height = dom.scrollHeight;
				if (height > 0 && (height > containerSize[1] || (height == dom.offsetHeight && dom.style.height == ""))) {
					dom.style.height = (height + padding) + "px";
					overflowed = true;
				}
				return overflowed;
			},

			onAddControl: function(control) {
				if (!this._attached) return;
				var region = this._regions.get(control._uniqueId);
				if (region) {
					var realignArg = this.adjustRegion(region, true);
					if (this._disableRendering) return;
					if (realignArg) this.realignRegion(region, realignArg);
					if (this.processOverflow(this.getDom())) this.calculateRegions();
				}
			},

			onRemoveControl: function(control) {
				if (!this._attached) return;
				var region = this._regions.get(control._uniqueId);
				if (region) {
					this.getDom().removeChild(control.getDom());
					if (this._disableRendering) return;
					var nextRegion = this.getNextRegion(region);
					if (nextRegion) this.calculateRegions(nextRegion);
				}
			},

			doOnControlSizeChange: function(control) {
				this.refreshControl(control);
			},

			doRefreshRegion: function(region) {
				var control = region.control, controlDom = control.getDom(), dom = this.getDom();
				var hidden = (region.constraint == dorado.widget.layout.Layout.NONE_LAYOUT_CONSTRAINT), visibilityChanged = false;
				if (hidden) {
					if (controlDom.parentNode == dom) {
						dom.removeChild(controlDom);
						this.refresh();
					}
				}
				else {
					var oldWidth = region.realWidth, oldHeight = region.realHeight;
					var $controlDom = $fly(controlDom);
					if (controlDom.parentNode != dom || $controlDom.outerWidth() != oldWidth || $controlDom.outerHeight() != oldHeight) {
						this.refresh();
					}
				}
			},

			calculateRegions: function(fromRegion) {
				var regions = this._regions;
				if (regions.size == 0) return;
				var found = !fromRegion;
				regions.each(function(region) {
					if (!found) {
						found = (fromRegion == region);
						if (!found) return;
					}
					if (region.constraint == dorado.widget.layout.Layout.NONE_LAYOUT_CONSTRAINT) return;
					var realignArg = this.adjustRegion(region);
					if (realignArg) this.realignRegion(region, realignArg);
				}, this);
			},

			adjustRegion: function(region) {

				function getAnchorRegion(region, p) {
					var anchor = constraint[p];
					if (anchor) {
						if (anchor.constructor == String) {
							if (anchor == "previous") {
								anchor = this.getPreviousRegion(region);
							}
							else {
								anchor = null;
							}
						}
						else if (typeof anchor == "function") {
							anchor = anchor.call(this, region);
						}
					}
					return anchor;
				}

				var constraint = region.constraint, realignArg;
				var containerDom = this._dom.parentNode, controlDom = region.control.getDom();

				var left, right, width, top, bottom, height;
				left = right = width = top = bottom = height = -1;
				var lp, rp, tp, bp, wp, hp;
				lp = rp = tp = bp = wp = hp = 0;

				var padding = (parseInt(this._padding) || 0);
				var regionPadding = (parseInt(this._regionPadding) || 0) + (parseInt(constraint.padding) || 0);

				var clientSize = this._container.getContentContainerSize();
				var clientWidth = clientSize[0], clientHeight = clientSize[1];
				if (clientWidth > 10000) clientWidth = 0;
				if (clientHeight > 10000) clientHeight = 0;

				var realContainerWidth = clientWidth - padding * 2, realContainerHeight = clientHeight - padding * 2;

				if (constraint.anchorLeft == "previous" && constraint.left == null) constraint.left = 0;
				if (constraint.left != null && constraint.anchorLeft != "none") {
					var l = constraint.left;
					if (l.constructor == String && l.match('%')) {
						var rate = lp = parseInt(l);
						if (!isNaN(rate)) {
							left = rate * realContainerWidth / 100 + regionPadding;
						}
					}
					if (left < 0) {
						var anchorRegion = getAnchorRegion.call(this, region, "anchorLeft");
						if (anchorRegion) {
							var anchorDom = anchorRegion.control.getDom();
							left = anchorDom.offsetLeft + anchorRegion.realWidth + regionPadding + parseInt(l);
						}
						else {
							left = parseInt(l) + padding + regionPadding;
						}
					}
				}

				if (constraint.anchorRight == "previous" && constraint.right == null) constraint.right = 0;
				if (constraint.right != null && constraint.anchorRight != "none") {
					var r = constraint.right;
					if (r.constructor == String && r.match('%')) {
						var rate = rp = parseInt(r);
						if (!isNaN(rate)) {
							right = rate * realContainerWidth / 100 + regionPadding;
						}
					}
					if (right < 0) {
						var anchorRegion = getAnchorRegion.call(this, region, "anchorRight");
						if (anchorRegion) {
							var anchorDom = anchorRegion.control.getDom();
							right = clientWidth - anchorDom.offsetLeft + regionPadding + parseInt(r);
						}
						else {
							right = parseInt(r) + padding + regionPadding;
						}
					}
				}

				if (constraint.anchorTop == "previous" && constraint.top == null) constraint.top = 0;
				if (constraint.top != null && constraint.anchorTop != "none") {
					var t = constraint.top;
					if (t.constructor == String && t.match('%')) {
						var rate = tp = parseInt(t);
						if (!isNaN(rate)) {
							top = rate * realContainerHeight / 100 + regionPadding;
						}
					}
					if (top < 0) {
						var anchorRegion = getAnchorRegion.call(this, region, "anchorTop");
						if (anchorRegion) {
							var anchorDom = anchorRegion.control.getDom();
							top = anchorDom.offsetTop + anchorRegion.realHeight + regionPadding + parseInt(t);
						}
						else {
							top = parseInt(t) + padding + regionPadding;
						}
					}
				}

				if (constraint.anchorBottom == "previous" && constraint.bottom == null) constraint.bottom = 0;
				if (constraint.bottom != null && constraint.anchorBottom != "none") {
					var b = constraint.bottom;
					if (b.constructor == String && b.match('%')) {
						var rate = bp = parseInt(b);
						if (!isNaN(rate)) {
							bottom = rate * realContainerWidth / 100 + regionPadding;
						}
					}
					if (bottom < 0) {
						var anchorRegion = getAnchorRegion.call(this, region, "anchorBottom");
						if (anchorRegion) {
							var anchorDom = anchorRegion.control.getDom();
							bottom = clientHeight - anchorDom.offsetTop + regionPadding + parseInt(b);
						}
						else {
							bottom = parseInt(b) + padding + regionPadding;
						}
					}
				}

				var useControlWidth = region.control.getAttributeWatcher().getWritingTimes("width");
				if (useControlWidth || left < 0 || right < 0) {
					var w = region.control._width;
					if (w && w.constructor == String && w.match('%')) {
						var rate = wp = parseInt(w);
						if (!isNaN(rate)) {
							width = rate * realContainerWidth / 100;
						}
					}
					else {
						width = parseInt(w);
					}

					if (left >= 0 && right >= 0) {
						right = -1;
						rp = false;
					}
				}
				else if (left >= 0 && right >= 0) {
					if (lp && rp) {
						width = clientWidth - left - right;
						right = -1;
						lp = rp = false;
					}
					else {
						width = clientWidth;
						if (lp) {
							left = -1;
							width -= right;
						}
						if (rp) {
							right = -1;
							width -= left;
						}
						if (!lp && !rp) {
							width -= (left + right);
							right = -1;
						}
					}
				}

				var useControlHeight = region.control.getAttributeWatcher().getWritingTimes("height");
				if (useControlHeight || top < 0 || bottom < 0) {
					var h = region.control._height;
					if (h && h.constructor == String && h.match('%')) {
						var rate = hp = parseInt(h);
						if (!isNaN(rate)) {
							height = rate * realContainerHeight / 100;
						}
					}
					else {
						height = parseInt(h);
					}

					if (top >= 0 && bottom >= 0) {
						bottom = -1;
						bp = false;
					}
				}
				else if (top >= 0 && bottom >= 0) {
					if (tp && bp) {
						height = clientHeight - top - bottom;
						bottom = -1;
						tp = bp = false;
					}
					else {
						height = clientHeight;
						if (tp) {
							top = -1;
							height -= bottom;
						}
						if (bp) {
							bottom = -1;
							height -= top;
						}
						if (!tp && !bp) {
							height -= (top + bottom);
							bottom = -1;
						}
					}
				}

				if (lp || rp || tp || bp || wp || hp) {
					region.realignArg = realignArg = {
						left: lp,
						right: rp,
						top: tp,
						bottom: bp,
						width: wp,
						height: hp
					};
				}

				if (left >= 0 || right >= 0 || top >= 0 || bottom >= 0) {
					if (padding > 0) {
						if ((left >= 0 || right >= 0) && top < 0 && bottom < 0) top = padding + regionPadding;
						if ((top >= 0 || bottom >= 0) && left < 0 && right < 0) left = padding + regionPadding;
					}
				}
				else if (padding > 0) {
					left = top = padding + regionPadding;
				}
				region.left = (left >= 0) ? left + (parseInt(constraint.leftOffset) || 0) : undefined;
				region.right = (right >= 0) ? right - (parseInt(constraint.leftOffset) || 0) : undefined;
				region.top = (top >= 0) ? top + (parseInt(constraint.topOffset) || 0) : undefined;
				region.bottom = (bottom >= 0) ? bottom - (parseInt(constraint.topOffset) || 0) : undefined;
				region.width = (width >= 0) ? width + (parseInt(constraint.widthOffset) || 0) : undefined;
				region.height = (height >= 0) ? height + (parseInt(constraint.heightOffset) || 0) : undefined;
				region.regionPadding = regionPadding || 0;

				var dom = this._dom;
				if (region.right >= 0 && !dom.style.width) {
					dom.style.width = (clientWidth) ? (clientWidth + "px") : "";
				}
				if (region.bottom >= 0 && !dom.style.height) {
					dom.style.height = (clientHeight) ? (clientHeight + "px") : "100%";
				}
				this.renderControl(region, dom, true, true);

				var controlDom = region.control.getDom();
				if (controlDom) {
					var $controlDom = $fly(controlDom);
					region.realWidth = $controlDom.outerWidth();
					region.realHeight = $controlDom.outerHeight();
				}
				else {
					region.realWidth = region.control.getRealWidth() || 0;
					region.realHeight = region.control.getRealHeight() || 0;
				}
				
				if (!realignArg) {
					this.recordMaxRange(region);
				}

				return realignArg;
			},

			realignRegion: function(region, realignArg) {
				var controlDom = region.control.getDom();

				var left, right, width, top, bottom, height;
				left = right = width = top = bottom = height = -1;

				var constraint = region.constraint, containerDom = this._dom.parentNode;
				var padding = (parseInt(this._padding) || 0);
				var regionPadding = region.regionPadding;

				var clientSize = this._container.getContentContainerSize();
				var clientWidth = clientSize[0], clientHeight = clientSize[1], realContainerWidth, realContainerHeight;
				if (clientWidth > 10000) {
					clientWidth = realContainerWidth = 0;
				}
				else {
					realContainerWidth = clientWidth - padding * 2;
				}
				if (clientHeight > 10000) {
					clientHeight = realContainerHeight = 0;
				}
				else {
					realContainerHeight = clientHeight - padding * 2;
				}

				if (realignArg.left) {
					left = Math.round((realContainerWidth - region.realWidth -
						(region.right > 0 ? region.right : 0)) *
						realignArg.left / 100) + padding + regionPadding + (parseInt(constraint.leftOffset) || 0);
				}
				else if (realignArg.right) {
					right = Math.round((realContainerWidth - region.realWidth -
						(region.left > 0 ? region.left : 0)) *
						realignArg.right / 100) + padding + regionPadding + (parseInt(constraint.rightOffset) || 0);
				}
				if (realignArg.top) {
					top = Math.round((realContainerHeight - region.realHeight -
						(region.bottom > 0 ? region.bottom : 0)) *
						realignArg.top / 100) + padding + regionPadding + (parseInt(constraint.topOffset) || 0);
				}
				else if (realignArg.bottom) {
					bottom = Math.round((realContainerHeight - region.realHeight -
						(region.top > 0 ? region.top : 0)) *
						realignArg.bottom / 100) + padding + regionPadding + (parseInt(constraint.bottomOffset) || 0);
				}

				var style = controlDom.style;
				if (left >= 0) {
					region.left = left;
					style.left = left + "px";
				}
				if (right >= 0) {
					region.right = right;
					style.right = right + "px";
				}
				if (top >= 0) {
					region.top = top;
					style.top = top + "px";
				}
				if (bottom >= 0) {
					region.bottom = bottom;
					style.bottom = bottom + "px";
				}
				
				this.recordMaxRange(region);
			},

			resetControlDimension: function(region, layoutDom, autoWidth, autoHeight) {
				var control = region.control, controlDom = control.getDom();
				var style = controlDom.style;
				if (region.left >= 0 || region.top >= 0 || region.right >= 0 || region.bottom >= 0) {
					style.position = "absolute";
				}
				style.left = (region.left >= 0) ? (region.left + "px") : '';
				style.right = (region.right >= 0) ? (region.right + "px") : '';
				style.top = (region.top >= 0) ? (region.top + "px") : '';
				style.bottom = (region.bottom >= 0) ? (region.bottom + "px") : '';

				$invokeSuper.call(this, [region, layoutDom, autoWidth, autoHeight]);
			}

		});
})();

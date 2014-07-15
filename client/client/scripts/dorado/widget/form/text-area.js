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
	 * @component Form
	 * @class 多行文本编辑器。
	 * @extends dorado.widget.AbstractTextEditor
	 */
	dorado.widget.TextArea = $extend(dorado.widget.AbstractTextEditor, /** @scope dorado.widget.TextArea.prototype */ {
		$className: "dorado.widget.TextArea",
		
		ATTRIBUTES: /** @scope dorado.widget.TextArea.prototype */ {
			width: {
				independent: false,
				defaultValue: 150
			},
			
			height: {
				independent: false,
				defaultValue: 60
			},
			
			className: {
				defaultValue: "d-text-area"
			},
			
			selectTextOnFocus: {
				defaultValue: false
			}
		},
		
		createDom: function() {
			var doms = this._doms = {};
			var dom = $DomUtils.xCreate({
				tagName: "DIV",
				style: {
					position: "relative",
					whiteSpace: "nowrap",
					overflow: "hidden"
				},
				content: {
					tagName: "DIV",
					contextKey: "textDomWrapper",
					style: {
						width: "100%",
						height: "100%"
					},
					content: {
						tagName: "TEXTAREA",
						contextKey: "textDom",
						className: "textarea",
						style: {
							width: "100%",
							height: "100%"
						}
					}
				}
			}, null, doms);
			
			this._textDomWrapper = doms.textDomWrapper;
			this._textDom = doms.textDom;
			
			var self = this;
			jQuery(dom).addClassOnHover(this._className + "-hover", null, function() {
				return !self._realReadOnly;
			}).mousedown(function(evt) {
				evt.stopPropagation();
			});
			
			if (this._text) this.doSetText(this._text);
			
			if (!dorado.Browser.isTouch) {
				this._modernScroller = $DomUtils.modernScroll(this._textDom, {
					listenContentSize: true
				});
			}
			if (dorado.Browser.msie && dorado.Browser.version < 8) {
				this.doOnAttachToDocument = this.doOnResize;
			}
			return dom;
		},

		doOnAttachToDocument: function() {
			$invokeSuper.call(this, arguments);
			var textarea = this;
			if (dorado.Browser.isTouch) {
				if (dorado.Browser.android && dorado.Browser.chrome) {
					$fly(textarea._textDom).css("overflow", "hidden");
				}
				textarea._modernScroller = $DomUtils.modernScroll(textarea._textDom.parentNode, {
					updateBeforeScroll: true,
					scrollSize: function(dir, container, content) {
						return dir == "h" ?  content.scrollWidth : content.scrollHeight;
					},
					render: function(left, top) {
						if (this.content && !this._renderScrollAttr) {
							this.content.scrollTop = top;
							this.content.scrollLeft = left;
						}
					},
					autoHide: false,
					bouncing: false
				});
				$fly(textarea._textDom).bind("scroll", function() {
					textarea._modernScroller._renderScrollAttr = true;
					textarea._modernScroller.update();
					textarea._modernScroller.scrollTo(this.scrollLeft, this.scrollTop, false);
					textarea._modernScroller._renderScrollAttr = false;
				}).bind("focus", function() {
					textarea._modernScroller.showScrollbar();
				}).bind("blur", function() {
					textarea._modernScroller.hideScrollbar();
				});
			}
		},

		refreshTriggerDoms: function() {
			var triggerButtons = this._triggerButtons, triggerButton, triggerPanel = this._triggerPanel;
			if (triggerButtons && triggerPanel) {
				for (var i = 0; i < triggerButtons.length; i++) {
					triggerButton = triggerButtons[i];
					triggerButton.destroy();
				}
			}

			var triggers = this.get("trigger");
			if (triggers) {
				if (!triggerPanel) {
					triggerPanel = this._triggerPanel = $create("DIV");
					triggerPanel.className = "d-trigger-panel";
					this._dom.appendChild(triggerPanel);
				}
				triggerPanel.style.display = "";

				if (!(triggers instanceof Array)) triggers = [triggers];
				var trigger;
				this._triggerButtons = triggerButtons = [];
				for (var i = 0; i < triggers.length; i++) {
					trigger = triggers[i];
					triggerButton = trigger.createTriggerButton(this);
					triggerButtons.push(triggerButton);
					this.registerInnerControl(triggerButton);
					triggerButton.render(triggerPanel);
				}
				this._triggersArranged = false;
				this.doOnResize = this.resizeTextDom;
				this.resizeTextDom();
			} else {
				if (triggerPanel) triggerPanel.style.display = "none";
				if (dorado.Browser.msie && dorado.Browser.version < 9) {
					this.doOnResize = this.resizeTextDom;
					this.resizeTextDom();
				} else {
					this._textDomWrapper.style.width = "100%";
					delete this.doOnResize;
				}
			}
		},
		
		resizeTextDom: function() {
			if (!this._attached || !this.isActualVisible()) return;
			
			var w = this._dom.clientWidth, h = this._dom.clientHeight;
			if (this._triggerPanel) {
				w -= this._triggerPanel.offsetWidth;
			}
			this._textDomWrapper.style.width = (w < 0 ? 0 : w) + "px";
			this._textDomWrapper.style.height = h + "px";
			
			if (dorado.Browser.msie && dorado.Browser.version < 8) {
				this._textDom.style.height = h + "px";
			}
		},
		
		doOnKeyDown: function(evt) {
			if (evt.ctrlKey) return true;
			if (evt.keyCode == 13) return;
			return $invokeSuper.call(this, arguments);
		},
		
		doOnFocus: function() {
			if (this._useBlankText) this.doSetText('');
			var maxLength = this._maxLength || 0;
			if (maxLength) {
				this._textDom.setAttribute("maxLength", maxLength);
			} else {
				this._textDom.removeAttribute("maxLength");
			}
			$invokeSuper.call(this, arguments);
		},
		
		doOnBlur: function() {
			if (this._realReadOnly) return;
			try {
				$invokeSuper.call(this, arguments);
			}
			finally {
				this.doSetText(this.doGetText());
			}
		}
	});
	
})();

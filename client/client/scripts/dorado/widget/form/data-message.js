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

(function () {

	var DEFAULT_OK_MESSAGES = [
		{
			state: "ok"
		}
	];

	var DEFAULT_VALIDATING_MESSAGES = [
		{
			state: "validating"
		}
	];

	dorado.widget.DataMessage = $extend([dorado.widget.Control, dorado.widget.PropertyDataControl], /** @scope dorado.widget.PropertyHint.prototype */ {
		$className: "dorado.widget.DataMessage",

		ATTRIBUTES: /** @scope dorado.widget.PropertyHint.prototype */ {
			className: {
				defaultValue: "d-data-message"
			},

			/**
			 * @type boolean
			 * @attribute writeBeforeReady
			 */
			showIconOnly: {
				writeBeforeReady: true
			},

			/**
			 * @type boolean
			 * @attribute writeBeforeReady
			 */
			showMultiMessage: {
				writeBeforeReady: true
			},

			/**
			 * 要显示的信息数组。
			 * <p>在建立数据绑定的使用场景中此属性的属性值会被数据机制接管，如果此时设置此属性的值可能不会得到正确的结果。</p>
			 * @type [Object] 校验信息的数组。数组中的每一个元素是一个JSON对象，该JSON对象包含以下属性：
			 * <ul>
			 * <li>state    -    {String} 信息级别。取值范围包括：info、ok、warn、error。默认值为error。</li>
			 * <li>text    -    {String} 信息内容。</li>
			 * </ul>
			 * @attribute
			 */
			messages: {
				setter: function (messages) {
					this._messages = dorado.Toolkits.trimMessages(messages, "info");
				}
			}
		},

		processDataSetMessage: function (messageCode, arg, data) {
			switch (messageCode) {
				case dorado.widget.DataSet.MESSAGE_REFRESH:
				case dorado.widget.DataSet.MESSAGE_DATA_CHANGED:
				case dorado.widget.DataSet.MESSAGE_CURRENT_CHANGED:
				case dorado.widget.DataSet.MESSAGE_ENTITY_STATE_CHANGED:
					this._messages = null;
					this.refresh(true);
					break;
			}
		},

		createMessageDom: function () {
			return $DomUtils.xCreate({
				tagName: "DIV",
				content: [
					{
						tagName: "DIV",
						content: {
							tagName: "DIV",
							className: "spinner"
						}
					},
					{
						tagName: "DIV",
						className: "text"
					}
				]
			});
		},

		refreshSingleMessageDom: function (dom, message) {
			var state, text;
			if (message) {
				state = message.state;
				text = message.text;
			}

			dom.className = "d-message d-message-" + (state || "none");

			var iconDom = dom.firstChild, textDom = dom.lastChild;
			iconDom.className = "icon icon-" + (state || "none");

			if (!this._showIconOnly) {
				textDom.innerText = text || "";
				textDom.style.display = "";
			} else {
				textDom.style.display = "none";
				if (dorado.TipManager) {
					if (text) {
						dorado.TipManager.initTip(dom, {
							text: text
						});
					} else {
						dorado.TipManager.deleteTip(dom);
					}
				}
			}
		},

		refreshDom: function (dom) {
			$invokeSuper.call(this, arguments);

			var entity, messages = this._messages;
			if (!messages && this._dataSet) {
				var entity = this.getBindingData();
				if (entity instanceof dorado.Entity) {
					messages = entity.getMessages(this._property);
				} else {
					entity = null;
				}

				if (entity && this._property) {
					var state = entity.getValidateState(this._property);
					if (state == "validating") {
						messages = DEFAULT_VALIDATING_MESSAGES;
					} else if (!messages || messages.length == 0) {
						if (state == "ok") {
							messages = DEFAULT_OK_MESSAGES;
						} else {
							var propertyDef = this.getBindingPropertyDef();
							if (propertyDef && propertyDef._description) {
								messages = [
									{
										state: "info",
										text: propertyDef._description
									}
								];
							}
						}
					}
				}
			}

			if (!this._showMultiMessage) {
				var message = dorado.Toolkits.getTopMessage(messages);
				var messageDom = dom.firstChild;
				if (!messageDom) {
					messageDom = this.createMessageDom();
					dom.appendChild(messageDom);
				}
				this.refreshSingleMessageDom(messageDom, message);
			} else {
			}
		}
	});

})();

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

dorado.widget.LabelRenderer = $extend(dorado.Renderer, {
	render: function(dom, arg) {
		dom.innerText = arg.text || '';
	}
});

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @component Form
 * @class 文本标签。<br>
 *        用于展示一段文本或数据集中某个数据项的数据的文本标签。
 * @extends dorado.widget.Control
 * @extends dorado.widget.PropertyDataControl
 */
dorado.widget.Label = $extend([dorado.widget.Control, dorado.widget.PropertyDataControl], /** @scope dorado.widget.Label.prototype */ {
	$className: "dorado.widget.Label",
	
	ATTRIBUTES: /** @scope dorado.widget.Label.prototype */ {
		className: {
			defaultValue: "d-label"
		},
		
		width: {
		},
		
		/**
		 * 显示的文本。
		 * 
		 * @type String
		 * @attribute
		 */
		text: {},
		
		/**
		 * 渲染器。
		 * 
		 * @type dorado.Renderer
		 * @attribute
		 */
		renderer: {
			setter: function(value) {
				if (typeof value == "string") value = eval("new " + value + "()");
				this._renderer = value;
			}
		}
	},
	
	processDataSetMessage: function(messageCode, arg, data) {
		switch (messageCode) {
			case dorado.widget.DataSet.MESSAGE_REFRESH:
			case dorado.widget.DataSet.MESSAGE_REFRESH_ENTITY:
			case dorado.widget.DataSet.MESSAGE_DATA_CHANGED:
			case dorado.widget.DataSet.MESSAGE_CURRENT_CHANGED:
				this.refresh(true);
				break;
		}
	},
	
	refreshDom: function(dom) {
		$invokeSuper.call(this, arguments);
		
		var renderer = this._renderer || $singleton(dorado.widget.LabelRenderer);
		var entity = this.getBindingData(true);
		if (entity) {
			var timestamp = entity.timestamp;
			if (timestamp != this._timestamp) {
				renderer.render(dom, {
					text: ((this._property && entity != null) ? entity.getText(this._property) : ''),
					entity: entity,
					property: this._property
				});
				this._timestamp = timestamp;
			}
		}
		else {
			renderer.render(dom, {
				text: this._text
			});
		}
	}
});

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @component Form
 * @class 超链接。
 * @extends dorado.widget.Label
 */
dorado.widget.Link = $extend(dorado.widget.Label, /** @scope dorado.widget.Link.prototype */ {
	$className: "dorado.widget.Link",
	
	ATTRIBUTES: /** @scope dorado.widget.Link.prototype */ {
		className: {
			defaultValue: "d-link"
		},
		
		/**
		 * 目标地址。
		 * 
		 * @type String
		 * @attribute
		 */
		href: {
			setter: function(v) {
				this._href = v;
				if (!this._text) this._text = v;
			}
		},
		
		/**
		 * 目标框架。
		 * 
		 * @type String
		 * @attribute
		 */
		target: {}
	},
	
	EVENTS: /** @scope dorado.widget.Link.prototype */ {
	
		/**
		 * 当控件被点击时触发的事件。
		 * 
		 * @param {Object}
		 *            self 事件的发起者，即组件本身。
		 * @param {Object}
		 *            arg 事件参数。
		 * @param {int}
		 *            arg.button 表示用户按下的是哪个按钮，具体请参考DHTML的相关文档。
		 * @param {Event}
		 *            arg.event DHTML中的事件event参数。
		 * @param {boolean}
		 *            #arg.returnValue=false 是否继续执行超链接默认的跳转动作。
		 * @return {boolean} 是否要继续后续事件的触发操作，不提供返回值时系统将按照返回值为true进行处理。
		 * @event
		 */
		onClick: {
			interceptor: function(superFire, self, arg) {
				if (this.getListenerCount("onClick") > 0) {
					arg.returnValue == false;
					superFire(self, arg);
					return !!arg.returnValue;
				}
			}
		}
	},
	
	createDom: function() {
		return document.createElement("A");
	},
	
	refreshDom: function(dom) {
		$invokeSuper.call(this, arguments);
		dom.href = this._href;
		dom.target = this._target || "_self";
	}
});

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @component Form
 * @class 图片。
 * @extends dorado.widget.Control
 * @extends dorado.widget.PropertyDataControl
 */
dorado.widget.Image = $extend([dorado.widget.Control, dorado.widget.PropertyDataControl], /** @scope dorado.widget.Image.prototype */ {
	$className: "dorado.widget.Image",
	
	ATTRIBUTES: /** @scope dorado.widget.Image.prototype */ {
		className: {
			defaultValue: "d-image"
		},
		
		/**
		 * 图片的url。
		 * 
		 * @type String
		 * @attribute
		 */
		image: {},
		
		/**
		 * 图片拉伸方式，可选值：fitWidth, fitHeight, keepRatio，stretch, none。
		 *
		 * 根据拉伸模式的不同，图片的大小会有所不同。不同的模式的拉伸方式见下：
		 * <ul>
		 *  <li> fitWidth - 图片的宽度与组件相同，图片垂直方向的位置由packMode决定。</li>
		 *  <li> fitHeight - 图片的高度与组件相同，图片水平方向的位置由packMode决定。</li>
		 *  <li>
		 *   keepRatio - 图片会完全在组件的可见区域中，根据组件的大小、图片的大小不同，有可能图片的宽度与组件相同，也有可能图片的高度与组件相同。
		 *   也就是说有可能是fitWidth模式，也有可能是fitHeight模式。
		 *  </li>
		 *  <li> stretch - 图片的大小和组件的大小完全相同，不会保持图片原本的宽高比。</li>
		 *  <li> none - 不对图片进行拉伸，保持图片的原大小。</li>
		 * <ul>
		 * @type String
		 * @attribute writeBeforeReady
		 * @default "keepRatio"
		 */
		stretchMode: {
			writeBeforeReady: true,
			defaultValue: "keepRatio"
		},

		/**
		 * 图片在某个方向拉伸后在其对应的垂直方向上的对齐方式，可选值：start、center、end。
		 * <p>
		 * 不同的stretchMode，packMode的start、center、end的含义不同。
		 * <ul>
		 *  <li>fitWidth则start、end表示的是垂直方向的对齐，修改的是top的值。</li>
		 *  <li>fitHeight则start、end表示的是水平方向的对齐，修改的是left的值。</li>
		 *  <li>keepRatio则有可能修改的是top的值，也有可能是left的值，和图片的宽高比有关系。</li>
		 * </ul>
		 * <p>
		 * @type String
		 * @attribute writeBeforeReady
		 * @default "center"
		 */
		packMode: {
			writeBeforeReady: true,
			defaultValue: "center"
		},

		/**
		 * 空白图片。
		 * 
		 * @type String
		 */
		blankImage: {
			defaultValue: ">dorado/client/resources/blank.gif"
		}
	},

	doStretchAndPack: function () {
		if (!this._srcLoaded) return;
		var image = this, dom = image._dom, imageDom = dom.firstChild,
			stretchMode = image._stretchMode, packMode = image._packMode || "center",
			controlWidth = dom.clientWidth, controlHeight = dom.clientHeight, left = 0, top = 0,
			imageWidth = image._originalWidth, imageHeight = image._originalHeight;

		if (stretchMode == "keepRatio" || stretchMode == "fitWidth") {
			if (imageWidth > controlWidth) {
				imageHeight = Math.round(controlWidth * imageHeight / imageWidth);
				imageWidth = controlWidth;
			}
		}

		if (stretchMode == "keepRatio" || stretchMode == "fitHeight") {
			if (imageHeight > controlHeight) {
				imageWidth = parseInt(controlHeight * imageWidth / imageHeight);
				imageHeight = controlHeight;
			}
		}

		if (packMode == "center") {
			left = Math.round((controlWidth - imageWidth) / 2);
			top = Math.round((controlHeight - imageHeight) / 2);
		} else if (packMode == "end") {
			left = Math.round(controlWidth - imageWidth);
			top = Math.round(controlHeight - imageHeight);
		}

		$fly(imageDom).css({
			left: left,
			top: top,
			width: imageWidth,
			height: imageHeight,
			visibility: ""
		});
	},

	createDom: function() {
		var image = this, dom = $DomUtils.xCreate({
			tagName: "DIV",
			content: {
				tagName: "IMG"
			},
			style: {
				position: "relative"
			}
		});

		var imageDom = image._imageDom = dom.firstChild, $imageDom = $fly(imageDom), stretchMode = image._stretchMode;

		if (stretchMode == "keepRatio" || stretchMode == "fitWidth" || stretchMode == "fitHeight") {
			$imageDom.css({
				position: "absolute",
				width: "",
				height: "",
				visibility: "hidden"
			}).bind("load", function() {
				image._srcLoaded = true;
				image._originalWidth = imageDom.offsetWidth;
				image._originalHeight = imageDom.offsetHeight;
				image.doStretchAndPack();
			});
		}
		else if (stretchMode == "stretch" || stretchMode == "fit") {	// fit is deprecated
			$imageDom.css({
				position: "",
				width: "100%",
				height: "100%"
			});
		}
		return dom;
	},
	
	processDataSetMessage: function(messageCode, arg, data) {
		switch (messageCode) {
			case dorado.widget.DataSet.MESSAGE_REFRESH:
			case dorado.widget.DataSet.MESSAGE_REFRESH_ENTITY:
			case dorado.widget.DataSet.MESSAGE_DATA_CHANGED:
			case dorado.widget.DataSet.MESSAGE_CURRENT_CHANGED:
				this.refresh(true);
				break;
		}
	},

	doOnResize: function() {
		$invokeSuper.call(this, arguments);
		this.doStretchAndPack();
	},
	
	refreshDom: function(dom) {
		var imgUrl;
		var entity = this.getBindingData(true);
		if (entity) {
			var timestamp = entity.timestamp;
			if (timestamp == this._timestamp) return;
			imgUrl = ((this._property && entity != null) ? entity.get(this._property) : "") || this._blankImage;
			this._timestamp = timestamp;
		}
		else {
			imgUrl = this._image || this._blankImage;
		}
		
		var $imageDom = $fly(this._imageDom);
		if (this._stretchMode == "keepRatio") {
			$imageDom.css({
				position: "absolute",
				width: "",
				height: ""
			});
		}
		if (this._lastImgUrl != imgUrl) {
			this._lastImgUrl = imgUrl;
			this._srcLoaded = false;
			this._originalWidth = null;
			this._originalHeight = null;
		}
		$imageDom.attr("src", $url(imgUrl));

		$invokeSuper.call(this, arguments);
	}
});

/**
 * @author Benny Bao (mailto:benny.bao@bstek.com)
 * @component Form
 * @class 数据模板。
 * @extends dorado.widget.Control
 * @extends dorado.widget.DataControl
 */
dorado.widget.TemplateField = $extend([dorado.widget.Control, dorado.widget.DataControl], /** @scope dorado.widget.TemplateField.prototype */ {
	$className: "dorado.widget.TemplateField",
	
	ATTRIBUTES: /** @scope dorado.widget.TemplateField.prototype */ {
		className: {
			defaultValue: "d-template-field"
		},
		
		dataPath: {
			defaultValue: '#'
		},
		
		/**
		 * Html模板
		 * @type String
		 * @attribute
		 */
		template: {},
		
		/**
		 * 绑定的数据实体。
		 * @type Object|dorado.Entity
		 * @attribute
		 */
		entity: {}
	},
	
	getBindingData: function(options) {
		var realOptions = {
			firstResultOnly: true,
			acceptAggregation: false
		};
		if (typeof options == "String") {
			realOptions.loadMode = options;
		} else {
			dorado.Object.apply(realOptions, options);
		}
		return $invokeSuper.call(this, [realOptions]);
	},
	
	processDataSetMessage: function(messageCode, arg, data) {
		switch (messageCode) {
			case dorado.widget.DataSet.MESSAGE_REFRESH:
			case dorado.widget.DataSet.MESSAGE_REFRESH_ENTITY:
			case dorado.widget.DataSet.MESSAGE_DATA_CHANGED:
			case dorado.widget.DataSet.MESSAGE_CURRENT_CHANGED:
				this.refresh(true);
				break;
		}
	},
	
	refreshDom: function(dom) {
		$invokeSuper.call(this, arguments);
		
		var entity = this.getBindingData(true) || this._entity;
		if (entity) {
			var timestamp = entity.timestamp;
			if (timestamp == this._timestamp) return;
			this._timestamp = timestamp;
		}
		
		if (this._template) {
			var html, context = {
				view: this.get("view"),
				control: this,
				entity: entity
			};
			context.data = entity ? entity.getWrapper({ textMode: true, readOnly: true }) : {};
			html = _.template(this._template, context);
			dom.innerHTML = html;
		}
		else {
			dom.innerHTML = "";
		}
	}
});


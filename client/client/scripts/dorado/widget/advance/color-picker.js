(function () {

	var PALETTES = {
		"#sixteen": [
			["#000000", "#000084", "#0000ff", "#840000"],
			["#840084", "#008200", "#ff0000", "#008284"],
			["#ff00ff", "#848200", "#848284", "#00ff00"],
			["#ffa600", "#00ffff", "#c6c3c6", "#ffff00"],
			["#ffffff"]
		],

		"#websafe": [
			["#000", "#300", "#600", "#900", "#c00", "#f00"],
			["#003", "#303", "#603", "#903", "#c03", "#f03"],
			["#006", "#306", "#606", "#906", "#c06", "#f06"],
			["#009", "#309", "#609", "#909", "#c09", "#f09"],
			["#00c", "#30c", "#60c", "#90c", "#c0c", "#f0c"],
			["#00f", "#30f", "#60f", "#90f", "#c0f", "#f0f"],
			["#030", "#330", "#630", "#930", "#c30", "#f30"],
			["#033", "#333", "#633", "#933", "#c33", "#f33"],
			["#036", "#336", "#636", "#936", "#c36", "#f36"],
			["#039", "#339", "#639", "#939", "#c39", "#f39"],
			["#03c", "#33c", "#63c", "#93c", "#c3c", "#f3c"],
			["#03f", "#33f", "#63f", "#93f", "#c3f", "#f3f"],
			["#060", "#360", "#660", "#960", "#c60", "#f60"],
			["#063", "#363", "#663", "#963", "#c63", "#f63"],
			["#066", "#366", "#666", "#966", "#c66", "#f66"],
			["#069", "#369", "#669", "#969", "#c69", "#f69"],
			["#06c", "#36c", "#66c", "#96c", "#c6c", "#f6c"],
			["#06f", "#36f", "#66f", "#96f", "#c6f", "#f6f"],
			["#090", "#390", "#690", "#990", "#c90", "#f90"],
			["#093", "#393", "#693", "#993", "#c93", "#f93"],
			["#096", "#396", "#696", "#996", "#c96", "#f96"],
			["#099", "#399", "#699", "#999", "#c99", "#f99"],
			["#09c", "#39c", "#69c", "#99c", "#c9c", "#f9c"],
			["#09f", "#39f", "#69f", "#99f", "#c9f", "#f9f"],
			["#0c0", "#3c0", "#6c0", "#9c0", "#cc0", "#fc0"],
			["#0c3", "#3c3", "#6c3", "#9c3", "#cc3", "#fc3"],
			["#0c6", "#3c6", "#6c6", "#9c6", "#cc6", "#fc6"],
			["#0c9", "#3c9", "#6c9", "#9c9", "#cc9", "#fc9"],
			["#0cc", "#3cc", "#6cc", "#9cc", "#ccc", "#fcc"],
			["#0cf", "#3cf", "#6cf", "#9cf", "#ccf", "#fcf"],
			["#0f0", "#3f0", "#6f0", "#9f0", "#cf0", "#ff0"],
			["#0f3", "#3f3", "#6f3", "#9f3", "#cf3", "#ff3"],
			["#0f6", "#3f6", "#6f6", "#9f6", "#cf6", "#ff6"],
			["#0f9", "#3f9", "#6f9", "#9f9", "#cf9", "#ff9"],
			["#0fc", "#3fc", "#6fc", "#9fc", "#cfc", "#ffc"],
			["#0ff", "#3ff", "#6ff", "#9ff", "#cff", "#fff"]
		],

		"#named": [
			["White", "Ivory", "Snow", "LightYellow", "MintCream", "Azure", "FloralWhite", "Honeydew", "GhostWhite", "Seashell", "Cornsilk", "AliceBlue", "LemonChiffon", "LightCyan"],
			["OldLace", "LightGoldenrodYellow", "LavenderBlush", "WhiteSmoke", "Beige", "Linen", "PapayaWhip", "BlanchedAlmond", "AntiqueWhite", "MistyRose", "Bisque", "Lavender", "Moccasin", "PaleGoldenrod"],
			["NavajoWhite", "Yellow", "PeachPuff", "Wheat", "Khaki", "Gainsboro", "PaleTurquoise", "Pink", "Aquamarine", "LightGray", "PowderBlue", "PaleGreen", "GreenYellow", "LightPink"],
			["LightBlue", "Gold", "Thistle", "LightGreen", "LightSteelBlue", "Silver", "LightSkyBlue", "BurlyWood", "SkyBlue", "Chartreuse", "Plum", "LawnGreen", "Tan", "LightSalmon"],
			["SandyBrown", "Cyan", "Aqua", "DarkKhaki", "Violet", "Turquoise", "Orange", "YellowGreen", "DarkSalmon", "MediumAquamarine", "DarkSeaGreen", "DarkGray", "MediumTurquoise", "Goldenrod"],
			["MediumSpringGreen", "SpringGreen", "Salmon", "LightCoral", "Coral", "DarkOrange", "HotPink", "RosyBrown", "Orchid", "Lime", "PaleVioletRed", "Peru", "DarkTurquoise", "CornflowerBlue"],
			["Tomato", "DeepSkyBlue", "LimeGreen", "CadetBlue", "MediumSeaGreen", "DarkGoldenrod", "MediumPurple", "LightSeaGreen", "LightSlateGray", "MediumOrchid", "Gray", "Chocolate", "IndianRed", "SlateGray"],
			["MediumSlateBlue", "DodgerBlue", "OliveDrab", "SteelBlue", "OrangeRed", "Olive", "SlateBlue", "RoyalBlue", "Magenta", "Fuchsia", "SeaGreen", "DimGray", "DeepPink", "Sienna"],
			["DarkOrchid", "DarkCyan", "ForestGreen", "DarkOliveGreen", "BlueViolet", "Teal", "MediumVioletRed", "Crimson", "SaddleBrown", "Brown", "FireBrick", "Red", "Green", "DarkSlateBlue"],
			["DarkSlateGray", "DarkViolet", "DarkGreen", "DarkMagenta", "Purple", "DarkRed", "Maroon", "Indigo", "MidnightBlue", "Blue", "MediumBlue", "DarkBlue", "Navy", "Black"]
		]
	};

	/**
	 * @author Benny Bao (mailto:benny.bao@bstek.com)
	 * @class 包含颜色选取器中主要配置信息的抽象类。
	 * @abstract
	 */
	dorado.widget.ColorPickerSupport = $class(/** @scope dorado.widget.ColorPickerSupport.prototype */{
		$className: "dorado.widget.ColorPickerSupport",

		ATTRIBUTES: /** @scope dorado.widget.ColorPickerSupport.prototype */ {
			color: {
			},
			showInput: {
				spectrumAttr: true
			},
			showInitial: {
				spectrumAttr: true
			},
			allowEmpty: {},
			showAlpha: {
				spectrumAttr: true
			},
			disabled: {
				spectrumAttr: true
			},
			showPalette: {
				spectrumAttr: true
			},
			showPaletteOnly: {
				spectrumAttr: true
			},
			showButtons: {
				defaultValue: true,
				writeBeforeReady: true
			},
			preferredFormat: {
				writeBeforeReady: true
			},
			palette: {
				defaultValue: PALETTES["#sixteen"],
				writeBeforeReady: true
			}
		}
	});

	/**
	 * @author Benny Bao (mailto:benny.bao@bstek.com)
	 * @class 颜色选取器。
	 * @extends dorado.widget.Control
	 * @extends dorado.widget.ColorPickerSupport
	 * @abstract
	 */
	dorado.widget.ColorPicker = $extend([dorado.widget.Control, dorado.widget.ColorPickerSupport], /** @scope dorado.widget.ColorPicker.prototype */ {
		$className: "dorado.widget.ColorPicker",
		focusable: true,

		ATTRIBUTES: /** @scope dorado.widget.ColorPicker.prototype */ {
			className: {
				defaultValue: "d-color-picker"
			},

			width: {
				independent: true
			},

			height: {
				independent: true
			},

			color: {
				skipRefresh: true,
				getter: function () {
					if (this._spectrum) {
						var rudeColor = this._spectrum.spectrum("get");
						return rudeColor.toString(this._preferredFormat);
					}
					else {
						return this._color;
					}
				},
				setter: function (color) {
					if (this._spectrum) {
						this._spectrum.spectrum("set", color);
					}
					else {
						this._color = color;
					}
				}
			}
		},

		EVENTS: /** @scope dorado.widget.ColorPicker.prototype */ {
			onColorChange: {},
			onCursorMove: {}
		},

		doSet: function (attr, value, skipUnknownAttribute, lockWritingTimes) {
			$invokeSuper.call(this, [attr, value, skipUnknownAttribute, lockWritingTimes]);
			if (this._spectrum) {
				var def = this.ATTRIBUTES[attr];
				if (def.spectrumAttr) {
					this._spectrum.spectrum("option", attr, value);
				}
			}
		},

		getBaseSpectrumOption: function () {
			return {
				flat: true
			};
		},

		createDom: function () {
			var colorPicker = this, inputDom = $DomUtils.xCreate({
				tagName: "INPUT"
			});
			$DomUtils.getInvisibleContainer().appendChild(inputDom);

			colorPicker._spectrum = jQuery(inputDom);
			var options = colorPicker.getBaseSpectrumOption();

			var palette = colorPicker._palette;
			if (palette && palette.length == 1 && PALETTES[palette[0]]) {
				palette = PALETTES[palette[0]];
			}

			var $container = colorPicker._spectrum.spectrum(dorado.Object.apply(options, {
				color: colorPicker._color,
				showInput: colorPicker._showInput,
				showInitial: colorPicker._showInitial,
				allowEmpty: colorPicker._allowEmpty,
				showAlpha: colorPicker._showAlpha,
				disabled: colorPicker._disabled,
				showPalette: colorPicker._showPalette,
				showPaletteOnly: colorPicker._showPaletteOnly,
				showButtons: colorPicker._showButtons,
				preferredFormat: colorPicker._preferredFormat,
				palette: palette,
				show: function () {
					setTimeout(function() {
						$container.bringToFront();;
					}, 0);
				},
				move: function (rudeColor) {
					colorPicker.onCursorMove(rudeColor.toString(colorPicker._preferredFormat));
				},
				change: function (rudeColor) {
					colorPicker.onColorChange(rudeColor.toString(colorPicker._preferredFormat));
				}
			})).spectrum("container");
			
			var dom = inputDom.nextSibling;
			$DomUtils.getInvisibleContainer().removeChild(inputDom);
			
			$container[0].doradoUniqueId = this._uniqueId;

			colorPicker._originalButtonCancel = $container.find(".sp-cancel");
			colorPicker._originalButtonOk = $container.find(".sp-choose");

			if (this._showButtons) {
				buttonCancel = new dorado.widget.Button({
					exClassName: "button-cancel",
					caption: $resource("dorado.baseWidget.MessageBoxButtonCancel"),
					renderOn: colorPicker._originalButtonCancel[0],
					onClick: function () {
						colorPicker._originalButtonCancel.click();
					}
				});
				colorPicker.registerInnerControl(buttonCancel);
				buttonCancel.render();

				buttonOk = new dorado.widget.Button({
					exClassName: "button-ok",
					ui: "highlight",
					caption: $resource("dorado.baseWidget.MessageBoxButtonOK"),
					renderOn: colorPicker._originalButtonOk[0],
					onClick: function () {
						colorPicker._originalButtonOk.click();
					}
				});
				colorPicker.registerInnerControl(buttonOk);
				buttonOk.render();
			}
			return dom;
		},

		onCursorMove: function (color) {
			this.fireEvent("onCursorMove", this, {
				color: color
			});
		},

		onColorChange: function (color) {
			this.fireEvent("onColorChange", this, {
				color: color
			});
		}
	});

	/**
	 * @author Benny Bao (mailto:benny.bao@bstek.com)
	 * @class 颜色编辑器。
	 * @extends dorado.widget.ColorPicker
	 * @extends dorado.widget.AbstractDataEditor
	 */
	dorado.widget.ColorEditor = $extend([dorado.widget.ColorPicker, dorado.widget.AbstractDataEditor], /** @scope dorado.widget.ColorEditor.prototype */ {
		$className: "dorado.widget.ColorEditor",
		_triggerChanged: true,

		ATTRIBUTES: /** @scope dorado.widget.ColorEditor.prototype */ {
			className: {
				defaultValue: "d-color-editor"
			},

			value: {
				skipRefresh: true,
				path: "color"
			}
		},

		EVENTS: /** @scope dorado.widget.ColorPicker.prototype */ {
			onValueChange: {}
		},

		getBaseSpectrumOption: function () {
			return {
				flat: false
			};
		},

		createDom: function () {
			var dom = $invokeSuper.call(this, arguments);
			this._spectrum.spectrum("container").shadow({
				mode: "sides"
			});
			return dom;
		},

		refreshDom: function (dom) {
			dorado.widget.AbstractDataEditor.prototype.refreshDom.call(this, dom);

			var colorEditor = this;
			if (colorEditor._dataSet) {
				if (colorEditor._property) {
					var bindingInfo = colorEditor._bindingInfo;
					if (bindingInfo.entity instanceof dorado.Entity) {
						var color = bindingInfo.entity.get(colorEditor._property);
						colorEditor.set("color", color);
					}
				}
			}
		},

		onColorChange: function (color) {
			$invokeSuper.call(this, arguments);
			this.post();
		},
		
		doOnBlur: function() {
			this._originalButtonCancel.click();
		}
	});


})();

(function () {

    var TagsDropDown = $extend(dorado.widget.RowListDropDown, {
        $className: "dorado.widget.TagsDropDown",

        ATTRIBUTES: {
            buttonVisible: {
                defaultValue: false
            },

            dynaFilter: {
                defaultValue: true
            },

            filterOnOpen: {
                defaultValue: true
            }
        },

        constructor: function (tagEditor, configs) {
            this._tagEditor = tagEditor;
            $invokeSuper.call(this, [configs]);
        },

        assignValue: function (editor, entityForAssignment, eventArg) {
            var value = eventArg.selectedValue;
            if (value) value = [value];
            editor.addTags(value, true);
        },

        open: function (editor) {
            var items = this._items = this.getAvailableTags();
            if (!items || !items.length) return;
            $invokeSuper.call(this, [editor]);
        },

        getAvailableTags: function () {
            var allTags = this._tagEditor.getAvailableTags();
            var tags = this._tagEditor._value;
            if (tags && tags.length) {
                var availableTags = allTags.slice(0);
                for (var i = 0; i < tags.length; i++) {
                    availableTags.remove(tags[i]);
                }
                return availableTags;
            } else {
                return allTags;
            }
        },

        getDropDownItems: function () {
            return this._items;
        }
    });

    /**
     * @author Benny Bao (mailto:benny.bao@bstek.com)
     * @class 标签编辑器。
     * @extends dorado.widget.AbstractTextBox
     * @abstract
     */
    dorado.widget.TagEditor = $extend(dorado.widget.AbstractTextBox, /** @scope dorado.widget.TagEditor.prototype */ {
        $className: "dorado.widget.TagEditor",
        _triggerChanged: true,

        ATTRIBUTES: /** @scope dorado.widget.TagEditor.prototype */ {
            className: {
                defaultValue: "d-tag-editor"
            },

            //TODO 支持宽度自适应
            // width: {
            // defaultValue: 150,
            // independent: true
            //  },

            height: {
                independent: true
            },

            /**
             * 文本形式的标签值，各标签之间以textSeperator属性所设定的分隔符分隔。
             * @type String
             * @attribute
             */
            text: {
                getter: function () {
                    var value = this.get("value") || [];
                    if (this._editorFocused) {
                        var editingText = jQuery.trim(this._inputDom.value);
                        if (editingText) {
                            value = value.slice(0);
                            value.push(editingText);
                        }
                    }
                    return value.join(this._textSeperator);
                },
                setter: function (text) {
                    var text = jQuery.trim(text), value;
                    if (text) {
                        value = text.split(this._textSeperator);
                    } else {
                        value = null;
                    }
                    this.set("value", value);
                }
            },

            /**
             * 标签数组。
             * @type String[]
             * @attribute
             */
            value: {
                skipRefresh: false,
                getter: function () {
                    return this._value;
                },
                setter: function (tags) {
                    if (typeof tags == "string") {
                        this.set("text", tags);
                    } else {
                        this._value = tags;
                        this._lastPost = this.get("text");
                        delete this._unknowns;
                    }
                }
            },

            /**
             * 当以文本形式读写标签值时各标签键的分隔符。
             * @type String
             * @default ","
             * @attribute
             */
            textSeperator: {
                defaultValue: ","
            },

            /**
             * 可用的标签数组。
             * @type String[]
             * @attribute
             */
            availableTags: {
                skipRefresh: true
                
            },

            /**
             * 必选的标签数组。
             * @type String[]
             * @attribute
             */
            requiredTags: {
                skipRefresh: true,
                writeBeforeReady: true
            },

            /**
             * 用于获得可用标签的DataSet。
             * <p>
             * 此属性在availableTags有值时无效。
             * </p>
             * @type dorado.widget.DataSet
             * @attribute
             */
            availableTagsDataSet: {
                componentReference: true
            },
            /**
             * 用于获得可用标签的DataPath。
             * <p>
             * 此属性须配合availableTagsDataSet使用，且在availableTags有值时无效。
             * </p>
             * @type dorado.widget.DataSet
             * @attribute
             */
            availableTagsDataPath: {
            },

            /**
             * 是否允许用户输入“可用标签”之外标签值。
             * @type boolean
             * @attribute
             * @default true
             */
            acceptUnknownTag: {
                defaultValue: true,
                skipRefresh: true
            },
            /**
             * 是否要在用户进行输入时自动显示可用标签。
             * @type boolean
             * @attribute
             * @default true
             */
            showAvailableTags: {
                defaultValue: true,
                skipRefresh: true
            },
            /**
             * 是否高亮必选标签
             * @type boolean
             * @attribute
             * @default true
             */
            highlightRequiredTags:{
            	 defaultValue: true,
                 skipRefresh: true
            }
        },

        EVENTS: /** @scope dorado.widget.TagEditor.prototype */ {
            /**
             * 当编辑器将要接受一个未知的标签值（即可用标签之前的标签值）之前触发的事件。
             * <p>
             * 注意，事件仅在acceptUnknownTag属性为true时有效。
             * </p>
             * @param {Object} self 事件的发起者，即控件本身。
             * @param {Object} arg 事件的参数。
             * @param {String} tag 将要接受的标签值。
             * @param {boolean} arg.processDefault=true 是否接受当前的标签值。
             * @return {boolean} 是否要继续后续事件的触发操作，不提供返回值时系统将按照返回值为true进行处理。
             * @event
             */
            beforeUnknownTagAccept: {},

            /**
             * 当编辑器接受一个未知的标签值（即可用标签之前的标签值）之后触发的事件。
             * <p>
             * 注意，事件仅在acceptUnknownTag属性为true时有效。
             * </p>
             * @param {Object} self 事件的发起者，即控件本身。
             * @param {Object} arg 事件的参数。
             * @param {String} tag 被接受的标签值。
             * @return {boolean} 是否要继续后续事件的触发操作，不提供返回值时系统将按照返回值为true进行处理。
             * @event
             */
            onUnknownTagAccept: {},
            /**
             * 当编辑器移除一个标签值之前触发的事件。
             * @param {Object} self 事件的发起者，即控件本身。
             * @param {Object} arg 事件的参数。
             * @param {String} tag 将要接受的标签值。
             * @param {boolean} arg.processDefault=true 是否移除当前的标签值。
             * @return {boolean} 是否要继续后续事件的触发操作，不提供返回值时系统将按照返回值为true进行处理。
             * @event
             */
            beforeTagRemove: {},
            /**
             * 当编辑器删除一个标签值之后触发的事件。
             * @param {Object} self 事件的发起者，即控件本身。
             * @param {Object} arg 事件的参数。
             * @param {String} tag 将要接受的标签值。
             * @return {boolean} 是否要继续后续事件的触发操作，不提供返回值时系统将按照返回值为true进行处理。
             * @event
             */
            onTagRemove: {},
            /**
             * 当编辑器添加一个标签值之前触发的事件。
             * @param {Object} self 事件的发起者，即控件本身。
             * @param {Object} arg 事件的参数。
             * @param {String} tag 将要接受的标签值。
             * @param {boolean} arg.processDefault=true 是否添加当前的标签值。
             * @return {boolean} 是否要继续后续事件的触发操作，不提供返回值时系统将按照返回值为true进行处理。
             * @event
             */
            beforeTagAdd: {},
            /**
             * 当编辑器添加一个标签值之后触发的事件。
             * @param {Object} self 事件的发起者，即控件本身。
             * @param {Object} arg 事件的参数。
             * @param {String} tag 将要接受的标签值。
             * @return {boolean} 是否要继续后续事件的触发操作，不提供返回值时系统将按照返回值为true进行处理。
             * @event
             */
            onTagAdd: {}
        },

        constructor: function () {
            this._tagDoms = [];
            $invokeSuper.call(this, arguments);
            this._triggerChanged = true;
        },

        createDom: function () {
            var context = {}, dom = $DomUtils.xCreate({
                tagName: "DIV",
                style: {
                    position: "relative",
                    whiteSpace: "nowrap"
                },
                content: [
                    {
                        tagName: "DIV",
                        className: "tag-container",
                        contextKey: "textDom",
                        style: {
                            height: "100%"
                        }
                    }
                ],
                mousedown: function (evt) {
                    evt.stopPropagation();
                }
            }, null, context);
            this._textDom = context.textDom;
            //TODO 跟进dorado-core 7.3.2版本
            this._editorWrapper = dom.firstChild; 
            var inputDom = this._inputDom = this.createTextDom();
            this._textDom.appendChild(inputDom);

            var self = this;
            jQuery(dom).addClassOnHover(this._className + "-hover", null, function () {
                return !self._realReadOnly;
            });
            return dom;
        },

        createTextDom: function () {
            var tagEditor = this, editorConfig = {
                tagName: "INPUT",
                className: "editor",
                size: 1,
                style: {},
                onfocus: function (evt) {
                    if (tagEditor._realReadOnly) return;

                    if (tagEditor._defaultTrigger && !tagEditor._defaultTrigger.get("opened")) {
                        dorado.Toolkits.setDelayedAction(tagEditor, "$autoOpenDropDownOnEditTimerId", function () {
                            tagEditor._defaultTrigger.open(tagEditor);
                        }, 60);
                    }
                },
                onkeydown: function (evt) {
                    if (tagEditor._realReadOnly || tagEditor._realEditable) return;

                    switch (evt.keyCode || evt.which) {
                        case 8:
                        { // backspace
                            if (tagEditor._inputDom.value == "") {
                                var tags = tagEditor._value;
                                if (tags && tags.length) {
                                    tags.removeAt(tags.length - 1);
                                    tagEditor.doSetValue(tags, true);
                                }
                            }
                            break;
                        }
                        case 13:
                        { // enter
                            var defaultTrigger = tagEditor._defaultTrigger, shouldPost = true;
                            if (defaultTrigger && defaultTrigger.get("opened")) {
                                var value = defaultTrigger.getSelectedValue();
                                defaultTrigger.close(value);
                                shouldPost = !value;
                            }

                            try {
                                if (shouldPost) tagEditor.postEditingTag();
                            }
                            finally {
                                evt.stopPropagation();
                                return false;
                            }
                            break;
                        }
                    }
                }
            };
            editorConfig.style.padding = 0;

            return $DomUtils.xCreate(editorConfig);
        },

        addTagDom: function (index) {
            var tagDom = $DomUtils.xCreate({
                tagName: "DIV",
                className: "tag",
                content: [
                    {
                        tagName: "SPAN",
                        className: "tag-label"
                    },
                    {
                        tagName: "SPAN",
                        className: "close"
                    }
                ]
            });

            var tagEditor = this;
            jQuery(tagDom.lastChild).mousedown(function () {
                if (tagEditor._value) {
                      //TODO 修复#dorado-tag-editor-addon-17
                      var tag=$(this).prev().text();
                      setTimeout(function () {
                          tagEditor.removeTags([tag]);
                      }, 0);
                      //setTimeout(function () {
                      //    tagEditor.removeTags([tagDom.firstChild.innerText]);
                      // }, 0);
                }
            }).addClassOnHover("close-hover");

            jQuery(tagDom).addClassOnHover("tag-hover");

            this._textDom.insertBefore(tagDom, this._inputDom);
            return tagDom;
        },

        getTagDom: function (index) {
            var tagDom = this._textDom.childNodes[index];
            if (tagDom && tagDom.tagName.toUpperCase() == "DIV") {
                return tagDom;
            }
        },

        doGetText: function () {
            if (this._useBlankText || !this._inputDom) return '';
            return this._inputDom.value;
        },

        doSetText: function (text) {
            this._useBlankText = (!this._focused && text == '' && this._blankText);
            if (this._inputDom) {
                if (this._useBlankText) text = this._blankText;
                $fly(this._inputDom).toggleClass("blank-text", !!this._useBlankText);
                this._inputDom.value = text || '';
            }
        },

        doSetValue: function (value, refresh) {
            this._value = value;
            if (refresh) this.refreshTagDoms();
        },

        doSetFocus: function () {
            if (this._inputDom) this._inputDom.focus();
        },

        onMouseDown: function () {
            $invokeSuper.call(this);
            $setTimeout(this, function () {
                this.doSetFocus();
            }, 0);
        },

        onDoubleClick: function () {
            $invokeSuper.call(this);

            var tagEditor = this;
            if (!tagEditor._realReadOnly && tagEditor._defaultTrigger && !tagEditor._defaultTrigger.get("opened")) {
                dorado.Toolkits.setDelayedAction(tagEditor, "$autoOpenDropDownOnEditTimerId", function () {
                    tagEditor._defaultTrigger.open(tagEditor);
                }, 60);
            }
        },

        refreshDom: function () {
            if (!this._ready && (this._availableTags || this._availableTagsDataSet) && this._showAvailableTags) {
                this._defaultTrigger = new TagsDropDown(this);
                this.set("trigger", this._defaultTrigger, {
                    preventOverwriting: true,
                    lockWritingTimes: true
                });
            }

            $invokeSuper.call(this, arguments);

            this.refreshTagDoms();
            this.resetReadOnly();
        },

        refreshTagDoms: function () {
            if (!this._rendered) return;

            var inputDom = this._inputDom, tags = this._value || [];
            inputDom.value = "";
            inputDom.style.width = "";

            var i = 0, tagDom,
                unknowns = this._unknowns || [],
                requiredTags = this._requiredTags || [];
            for (; i < tags.length; i++) {
                var tag = tags[i];
                tagDom = this.getTagDom(i);
                if (!tagDom) tagDom = this.addTagDom(i);
                $fly(tagDom).toggleClass("tag-readonly", this._realReadOnly).toggleClass("tag-error", (unknowns.indexOf(tag) >= 0));
                if (requiredTags.indexOf(tag) >= 0) {
                    $fly(tagDom).toggleClass("tag-readonly", true).toggleClass("tag-required", this._highlightRequiredTags);
                }
                //TODO 修复#dorado-tag-editor-addon-17
                $(tagDom.firstChild).text(tag);

                //tagDom.firstChild.innerText = tag;
            }

            tagDom = this.getTagDom(i);
            while (tagDom) {
                $fly(tagDom).unbind().remove();
                tagDom = this.getTagDom(i);
            }
        },

        postEditingTag: function () {
            if (!this._rendered) return;

            dorado.Toolkits.cancelDelayedAction(this, "$autoOpenDropDownOnEditTimerId");

            var editingText = jQuery.trim(this._inputDom.value);

            this._inputDom.value = "";
            this._inputDom.size = 1;

            if (editingText) {
                var newTags = editingText.split(this._textSeperator);
                this.addTags(newTags, true);
            }
        },

        doPost: function () {
            this.postEditingTag(true);

            var value = this._value, unknowns = this._unknowns;
            if (value && value.length && unknowns && unknowns.length) {
                for (var i = value.length - 1; i >= 0; i--) {
                    if (unknowns.indexOf(value[i]) >= 0) {
                        value.removeAt(i);
                    }
                }
                this.doSetValue(value);
            }

            var p = this._property, e = this._entity;
            if (!p || !e) return false;

            var pd = (e.getPropertyDef) ? e.getPropertyDef(p) : e._getPropertyDef(p);	// 兼容7.1.6之前的版本
            var useValue = false;
            if (pd) {
                var dataType = pd.getDataType("always");
                useValue = (dataType && dataType instanceof dorado.AggregationDataType);
            }

            if (this._dataSet) {
                (useValue) ? e.set(p, this.get("value")) : e.setText(p, this.get("text"));
                this.timestamp = this._entity.timestamp;
            } else {
                if (e instanceof dorado.Entity) {
                    (useValue) ? e.set(p, this.get("value")) : e.setText(p, this.get("text"));
                    this.setDirty(e.isDirty(p));
                } else {
                    e[p] = (useValue) ? this.get("value") : this.get("text");
                    this.setDirty(true);
                }
            }
            return true;
        },

        getAvailableTags: function () {
            if (this._availableTags) {
                return this._availableTags;
            }
            else if (this._availableTagsDataSet) {
                var tags = this._availableTagsDataSet.queryData(this._availableTagsDataPath);
                if (tags instanceof Array) {
                    if (tags.length && (typeof tags[0] != "string")) {
                        tags = null;
                    }
                }
                else {
                    tags = null;
                }
                return tags;
            }
        },

        addTags: function (newTags, shouldCheck) {
            var value = this._value || [], indexs = [], unknowns = this._unknowns || [], availableTags = this.getAvailableTags();
            for (var i = 0; i < newTags.length; i++) {
                var tag = newTags[i], isUnknown = false, eventArg = {
                    tag: tag,
                    processDefault: true
                };

                if (shouldCheck && availableTags && availableTags.length) {
                    isUnknown = (availableTags.indexOf(tag) < 0);
                }

                if (isUnknown) {
                    this.fireEvent("beforeUnknownTagAccept", this, eventArg);
                    if (!eventArg.processDefault)   continue;
                    if (!this._acceptUnknownTag) unknowns.push(tag);
                }

                this.fireEvent("beforeTagAdd", this, eventArg);

                if (!eventArg.processDefault) continue;

                delete  eventArg['processDefault'];
                var index = value.indexOf(tag);
                if (index < 0) {
                    indexs.push(value.length);
                    value.push(tag)
                } else {
                    indexs.push(index);
                }

                isUnknown && this.fireEvent("onUnknownTagAccept", this, eventArg);
                this.fireEvent("onTagAdd", this, eventArg);

            }
            this._unknowns = unknowns;

            this.doSetValue(value, true);

            var doms = [];
            for (var i = 0; i < indexs.length; i++) {
                var dom = this.getTagDom(indexs[i]);
                if (dom) doms.push(dom);
            }
            jQuery(doms).effect("highlight", {
                color: "#ff9900"
            }, 1000);
        },
        doRemoveTag: function (tag) {
            var tagEditor = this, value = tagEditor._value || [];
            var index = value.indexOf(tag);
            if (index >= 0) {
                var eventArg = {
                    tag: tag,
                    processDefault: true
                };
                tagEditor.fireEvent("beforeTagRemove", tagEditor, eventArg);
                if (!eventArg.processDefault)   return false;
                value.removeAt(index);
                var tagDom = this.getTagDom(index);
                tagDom && jQuery(tagDom).animate({
                    opacity: "toggle",
                    width: "toggle",
                    marginLeft: "toggle",
                    marginRight: "toggle",
                    paddingLeft: "toggle",
                    paddingRight: "toggle"
                }, function () {
                    $fly(this).remove();
                    tagEditor.doSetValue(value);
                });
                tagEditor.fireEvent("onTagRemove", tagEditor, eventArg);
            }

        },
        removeTags: function (deleteTags) {
            for (var i = 0; i < deleteTags.length; i++) {
                var tag = deleteTags[i];
                this.doRemoveTag(tag);
            }
        },

        textEdited: function () {
            var tagEditor = this;
            tagEditor._inputDom.size = tagEditor._inputDom.value.length + 1;

            if (tagEditor._inputDom.value && tagEditor._defaultTrigger && !tagEditor._defaultTrigger.get("opened")) {
                dorado.Toolkits.setDelayedAction(tagEditor, "$autoOpenDropDownOnEditTimerId", function () {
                    tagEditor._defaultTrigger.open(tagEditor);
                }, 300);
            } else {
                dorado.Toolkits.cancelDelayedAction(tagEditor, "$autoOpenDropDownOnEditTimerId");
            }

            $invokeSuper.call(tagEditor);
        },

        resetReadOnly: function () {
            if (!this._rendered) return;

            var readOnly = !!(this._readOnly || this._readOnly2);
            // if (readOnly && this._realEditable == readOnly) {
            //     return;
            // }
            this._realReadOnly = readOnly;
            $fly(this.getDom()).toggleClass(this._className + "-readonly", readOnly);

            var textDomReadOnly = true;
            if (!readOnly && this._editable) {
                var triggers = this.get("trigger"), realEditable = true;
                if (triggers && !(triggers instanceof Array)) triggers = [triggers];
                if (triggers) {
                    for (var i = 0; i < triggers.length; i++) {
                        var trigger = triggers[i];
                        if (!trigger.get("editable")) {
                            realEditable = false;
                            break;
                        }
                    }
                }
                textDomReadOnly = !realEditable;
            }
            this._realEditable = !textDomReadOnly;
            this._inputDom.readOnly = textDomReadOnly;
        }
    });

})();
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
	var form_prefix = "form_submit_action_", form_seed = 1;

    var dateToJSON = function(date) {
        function f(n) {
            // Format integers to have at least two digits.
            return n < 10 ? '0' + n : n;
        }

        return date.getUTCFullYear() + '-' + f(date.getUTCMonth() + 1) + '-' + f(date.getUTCDate()) + 'T'
                + f(date.getUTCHours()) + ':' + f(date.getUTCMinutes()) + ':' + f(date.getUTCSeconds()) + 'Z';
    };

	/**
	 * @author Frank Zhang (mailto:frank.zhang@bstek.com)
	 * @component Action
	 * @class 表单提交动作控件。
	 * @extends dorado.widget.Action
	 */
	dorado.widget.FormSubmitAction = $extend(dorado.widget.Action, /** @scope dorado.widget.FormSubmitAction.prototype */ {
        $className: "dorado.widget.FormSubmitAction",

		ATTRIBUTES: /** @scope dorado.widget.FormSubmitAction.prototype */ {
			/**
             * 表单的action属性。
			 * @attribute
			 * @type String
			 */
			action: {},

			/**
             * 表单的target属性。
			 * @attribute
			 * @type String
             * @default "_self"
			 */
			target: {
                defaultValue: "_self"
            },

			/**
             * 表单的method属性。
			 * @attribute
			 * @type String
             * @defaultValue "post"
			 */
			method: {
                defaultValue: "post"
            }
		},
		/**
         * submit data to form.
		 * @param {Object} data the data to submit.
		 * @private
		 */
		doSubmitData: function(data) {
			var action = this, form = document.createElement("form");
			form.name = form_prefix + form_seed++;
			form.style.display = "none";
			form.action = dorado.util.Common.translateURL(action._action);
			form.target = action._target || "_self";
			form.method = action._method || "post";

			for (var param in data) {
				var input = document.createElement("input"), value = data[param], string = "";
                if (value !== undefined) {
                    if (value instanceof Date) {
                        string = dateToJSON(value);
                    } else if (value.toString) {
                        string = value.toString();
                    }
                }
				input.type = "hidden";
				input.value = string;
                input.name = param;

				form.appendChild(input);
			}

            document.body.appendChild(form);
			form.submit();
            document.body.removeChild(form);
		},

		doExecute: function() {
			var action = this, parameter = dorado.JSON.evaluate(action._parameter), data = {};
			if (parameter && parameter instanceof dorado.Entity) {
				data = parameter.toJSON();
			} else if (parameter) {
				data = parameter;
			}
			action.doSubmitData(data);
		}

	});
})();

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

	var BREAK_ALL = {};
	var BREAK_LEVEL = {};
	var ENTITY_PATH_CACHE = {};

	/**
	 * @author Benny Bao (mailto:benny.bao@bstek.com)
	 * @class 数据路径的处理器。
	 * <p>
	 * 数据路径表达式是用于描述如何提取、挖掘数据的表达式。其作用比较类似于XML中所使用的XPath。
	 * </p>
	 * <p>
	 * 以具有以下结构的EntityList+Entity数据为例，其中包含Department和Employee两种实体类型，其中Department支持递归嵌套:
	 * <pre class="symbol-example code">
	 * <code class="javascript">
	 * [
	 * {
	 * 	id: "D1",
	 * 	name: "XX部1",
	 * 	departments: [
	 * 		{
	 * 			id: "D11",
	 * 			name: "XX部2",
	 * 			employees: [
	 * 				{
	 * 					id: "0001",
	 * 					name: "John",
	 * 					sex: "male",
	 * 					salary: 5000
	 * 				},
	 * 				...
	 * 			]
	 * 		},
	 * 		...
	 * 	]
	 * },
	 * ...
	 * ]
	 * </code>
	 * </pre>
	 * </p>
	 * <p>
	 * 基本结构说明：属性名1(参数1,参数2,..)[逻辑表达式1,逻辑表达式2,..].属性名2(参数1,参数,..2)[逻辑表达式1,逻辑表达式2,..].属性名n..<br>
	 * 符号说明:
	 * <ul>
	 * <li>. - 用于分隔不同层级间对象的属性。例如:<code>employee.id</code>表示employee子对象的id属性。</li>
	 * <li>* - 用于表示某一层级中所有的对象，一般仅用于表示顶层集合中的对象，且可以省略。例如:<code>*.id</code>表示所有顶层对象的id属性。</li>
	 * <li>() - 用于定义一组表达式执行参数，多个参数之间以","分割。目前支持的参数包括：
	 * <ul>
	 * <li>repeat - 重复的执行当前的表达式片段直到无法找到更多的子对象为止。可简写为"R"。</li>
	 * <li>leaf - 重复的执行当前的表达式片段找出所有的叶子对象。可简写为"L"。</li>
	 * <li>数字 - 表示仅返回找到的前n个对象。</li>
	 * </ul>
	 * 例如:<code>.employees(repeat)</code>或<code>.employees(R)</code>表示所有employees属性中的对象的集合，这些对象会被提取出来被平行的放置到一个返回的数组中。
	 * </li>
	 * <li>@ - 用于逻辑表达式中，表示当前正被过滤的数据对象。</li>
	 * <li>[] - 用于定义一组逻辑表达式以对数据进行过滤，其中如果要定义多个逻辑表达式可以以","进行区隔。
	 * 例如:<code>employees[@.get("sex")=="male"]</code>表示筛选出性别为男性的员工。</li>
	 * <li>#current等 - 一种特殊的逻辑表达式，用于声明对Entity对象的过滤方式。具有如下几种取值:
	 * <ul>
	 * <li>#current - 表示集合中的当前Entity对象。</li>
	 * <li>#dirty - 表示集合中所有在客户端被改变过的（包含被删除的）Entity对象。</li>
	 * <li>#none - 表示集合中所有在客户端未被改变过的Entity对象。</li>
	 * <li>#all - 表示集合中所有状态的（包含被删除的）Entity对象。</li>
	 * <li>#new - 表示集合中所有在客户端新增的Entity对象。</li>
	 * <li>#modified - 表示集合中所有在客户端被修改过的Entity对象。</li>
	 * <li>#deleted - 表示集合中所有在客户端被标记为已删除的Entity对象。</li>
	 * <li>#move - 表示集合中所有在客户端被标记为已被移动的Entity对象。</li>
	 * </ul>
	 * 例如:<code>employees[#current]</code>表示返回employees集合中的当前Employee对象。
	 * </li>
	 * <li># - #current的简式。例如<code>#employees</code>与<code>employees[#current]</code>具有完全相同的语义。</li>
	 * <li>! - 表示后面是一段自定义的数据路径片段。例如<code>!CURRENT_NODE.children</code>中的CURRENT_NODE就是一个自定义片段。
	 * 见{@link dorado.DataPath.registerInterceptor}的说明。</li>
	 * </ul>
	 * </p>
	 * <p>
	 * 更多的表达式示例：
	 * <ul>
	 * <li>null - 相当于直接返回被查询的数据。表示顶层集合中所有的（不包含被删除的）Department。</li>
	 * <li>* - 同上。</li>
	 * <li># - 表示顶层集合中的当前Department。 </li>
	 * <li>[#current] - 同上。</li>
	 * <li>[#dirty] - 表示顶层集合中所有在客户端被改变过的（包含被删除的）Department。 </li>
	 * <li>#.employees - 表示顶层集合中当前Department中所有的Employee。</li>
	 * <li>#.#employees - 表示顶层集合中当前Department中的当前Employee。 </li>
	 * <li>#.#departments.#employees -
	 * 表示顶层集合中当前Department中的当前Department中的当前Employee。 </li>
	 * <li>*.departments - 表示所有第二层的Department。 </li>
	 * <li>.departments - 同上。 </li>
	 * <li>departments(repeat) -
	 * 表示所有Department的集合。注意：示例数据的顶层是一个集合，而在正常情况下是不能利用表达式来获取集合属性的。除非当一个具有repeat或leaf特性的表达式片段被应用于顶层集合时。引擎允许这样的特例，在此种情况下引擎会暂时忽略表达式片段中的属性名。</li>
	 * <li>.departments(R) - 表示除顶层Department外所有其它Department的集合。 </li>
	 * <li>.#departments(R) - 表示除顶层Department外所有其它各层中当前Department的集合。</li>
	 * <li>#departments(R) - 表示各层当前Department的集合。 </li>
	 * <li>#departments(leaf) -
	 * 表示最末端的当前Department。即通过不断的尝试获取当前Department中的当前Department，直到最末端那个Department。
	 * </li>
	 * <li>#departments(L) - 同上。</li>
	 * <li>#departments(L).#employees -
	 * 表示最末端的当前Department中的当前Employee。此表达式返回的结果是所有匹配Employee组成的数组。 </li>
	 * <li>.employees(R) - 表示所有employees属性中的对象的集合，即所有的Employee对象。</li>
	 * <li>.#employees(R) -
	 * 表示所有Department中的当前Employee，将以数组的形式返回这些Employee实体的集合。 </li>
	 * <li>.employees(R)[@.get("sex")=="male"] -
	 * 表示所有Department中的男性Employee，将以数组的形式返回这些Employee实体的集合。 </li>
	 * <li>.employees(R)[#dirty,@.get("sex")=="male"] -
	 * 表示所有Department中的状态为已修改的男性Employee，将以数组的形式返回这些Employee实体的集合。 </li>
	 * <li>.employees(R)[@.get("salary")>3500 && @.get("sex")=="male"] - 同上。
	 * </li>
	 * <li>.employees(R)[@.get("salary")>3500,@.get("sex")=="male"] -
	 * 表示所有Department中的薪水高于3500的男性Employee，将以数组的形式返回这些Employee实体的集合。 </li>
	 * <li>.employees(R).id - 表示返回所有Employee对象的id属性值的集合，即所有的Employee对象的id。</li>
	 * </ul>
	 * </p>
	 * @description 构造器。
	 * <p>
	 * 通常我们不建议您通过
	 * <pre class="symbol-example code">
	 * <code class="javascript">
	 * new dorado.DataPath("xxx");
	 * </code>
	 * </pre>
	 * 的方式来创建数据路径的处理器， 而应该用{@link dorado.DataPath.create}来代替。 这是因为用{@link dorado.DataPath.create}支持缓存功能，利用此方法来获得数据路径的处理器的效率往往更高。
	 * </p>
	 * @param {String} path 数据路径表达式。
	 * @see dorado.DataPath.create
	 */
	dorado.DataPath = $class(/** @scope dorado.DataPath.prototype */
	{

		$className : "dorado.DataPath",

		_VISIBLE : [{
			visibility : 0
		}],
		
		_ALL : [{
			visibility : 1
		}],

		_CURRENT : [{
			visibility : 2
		}],
		
		_REPEAT_VISIBLE : [{
			visibility : 0,
			repeat : true
		}],

		_REPEAT_ALL : [{
			visibility : 1,
			repeat : true
		}],

		constructor : function(path) {
			this.path = (path != null) ? $.trim(path) : path;
		},
		
		_throw : function(message, position) {
			var text = "DataPath syntax error";
			if(message) {
				text += (":\n" + message + "in:\n");
			} else {
				text += " in:\n";
			}

			var path = this.path;
			text += path;
			if(isFinite(position)) {
				position = parseInt(position);
				text += "\nat char " + position;
			}
			throw new SyntaxError(text);
		},
		
		/**
		 * 编译数据路径表达式。
		 * @throws {SyntaxError}
		 */
		compile : function() {

			function isUnsignedInteger(s) {
				return (s.search(/^[0-9]+$/) == 0);
			}

			var path = this.path;
			if(path == null || path == "" || path == "*") {
				this._compiledPath = this._VISIBLE;
				return;
			}
			if(path == "#" || path == "[#current]") {
				this._compiledPath = this._CURRENT;
				this._compiledPath.singleResult = true;
				return;
			}

			var _path = path.toLowerCase();
			if(_path == "(repeat)" || _path == "(r)") {
				this._compiledPath = this._REPEAT_VISIBLE;
				return;
			}

			var compiledPath = [];
			var property = "";
			var args = null;
			var arg;
			var conditions = null;
			var condition;

			var quotation = null;
			var inArgs = false;
			var afterArgs = false;
			var inCondition = false;
			var afterCondition = false;
			var escapeNext = false;

			// 对表达式的初次解析
			for(var i = 0; i < path.length; i++) {
				var c = path.charAt(i);
				if(escapeNext) {
					property += c;
					escapeNext = false;
					continue;
				}
				if(afterArgs && afterCondition && c != '.')
					this._throw(null, i);

				switch (c) {
					case '.': {
						if(!quotation && !inArgs && !inCondition) {
							compiledPath.push({
								property : property,
								args : args,
								conditions : conditions
							});
							property = "";
							args = null;
							arg = "";
							conditions = null;
							condition = "";
							c = null;
							quotation = null;
							inArgs = false;
							afterArgs = false;
							inCondition = false;
							afterCondition = false;
						}
						break;
					}
					case ',': {
						if(!inArgs && !inCondition)
							this._throw(null, i);

						if(!quotation) {
							if(inArgs) {
								args.push(arg);
								arg = "";
							} else if(inCondition) {
								conditions.push(condition);
								condition = "";
							}
							c = null;
						}
						break;
					}
					case '\'':
					case '"': {
						if(!inArgs && !inCondition)
							this._throw(null, i);

						if(!quotation) {
							quotation = c;
						} else if(quotation == c) {
							quotation = null;
						}
						break;
					}
					case '[': {
						if(inArgs || afterCondition)
							this._throw(null, i);

						if(!inCondition) {
							inCondition = true;
							conditions = [];
							condition = "";
							c = null;
						}
						break;
					}
					case ']': {
						if(inCondition) {
							if(condition.length > 0) {
								conditions.push(condition);
							}
							inCondition = false;
							afterCondition = true;
							c = null;
						} else {
							this._throw(null, i);
						}
						break;
					}
					case '(': {
						if(!inCondition) {
							if(inArgs || afterArgs)
								this._throw(null, i);
							inArgs = true;
							args = [];
							arg = "";
							c = null;
						}
						break;
					}
					case ')': {
						if(!inCondition && afterArgs)
							this._throw(null, i);

						if(inArgs) {
							if(arg.length > 0) {
								args.push(arg);
							}
							inArgs = false;
							afterArgs = true;
							c = null;
						}
						break;
					}
					case '@': {
						c = "$this";
						break;
					}
					default:
						escapeNext = (c == '\\');
				}

				if(!escapeNext && c != null) {
					if(inCondition) {
						condition += c;
					} else if(inArgs) {
						arg += c;
					} else {
						property += c;
					}
				}
			}

			if(property.length > 0 || (args && args.length > 0) || (conditions && conditions.length > 0)) {
				compiledPath.push({
					property : property,
					args : args,
					conditions : conditions
				});
			}

			// 对初次解析的结果进行整理
			var singleResult = (compiledPath.length > 0);
			for(var i = 0; i < compiledPath.length; i++) {
				var section = compiledPath[i];
				if((!section.property || section.property == '*') && !section.args && !section.conditions) {
					section = this._VISIBLE;
					compiledPath[i] = section;
					singleResult = false;
				} else {
					var property = section.property;
					if(property) {
						if(property.charAt(0) == '#') {
							section.visibility = 2;
							section.property = property = property.substring(1);
						}
						if(property.charAt(0) == '!') {
							section.visibility = 1; // all
							section.interceptor = property.substring(1);
						}
					}

					var args = section.args;
					if(args) {
						for(var j = 0; j < args.length; j++) {
							var arg = args[j].toLowerCase();
							if(arg == "r" || arg == "repeat") {
								section.repeat = true;
							} else if(arg == "l" || arg == "leaf") {
								section.repeat = true;
								section.leaf = true;
							} else if(isUnsignedInteger(arg)) {
								section.max = parseInt(arg);
							}
						}
					}

					var conditions = section.conditions;
					if(conditions) {
						for(var j = conditions.length - 1; j >= 0; j--) {
							var condition = conditions[j];
							if(condition && condition.charAt(0) == '#' && !(section.visibility > 0)) {
								if (condition == "#all") {
									section.visibility = 1;
								} else if (condition == "#current") {
									section.visibility = 2;
								} else if (condition == "#dirty") {
									section.visibility = 3;
								} else if (condition == "#new") {
									section.visibility = 4;
								} else if (condition == "#modified") {
									section.visibility = 5;
								} else if (condition == "#deleted") {
									section.visibility = 6;
								} else if (condition == "#moved") {
									section.visibility = 7;
								} else if (condition == "#none") {
									section.visibility = 8;
								} else if (condition == "#visible") {
									section.visibility = 9;
								} else {
									this._throw("Unknown token \"" + condition + "\".");
								}
								conditions.removeAt(j);
							}
						}
					}
					singleResult = (section.visibility == 2 && (section.leaf || !section.repeat));
				}
			}
			compiledPath.singleResult = singleResult;
			this._compiledPath = compiledPath;
		},
		
		_selectEntityIf : function(context, entity, isLeaf) {
			var section = context.section;
			if(!section.leaf || isLeaf) {
				var sections = context.sections;
				if(section == sections[sections.length - 1]) {
					context.addResult(entity);
				} else {
					this._evaluateSectionOnEntity(context, entity, true);
				}
			}
		},
		
		_evaluateSectionOnEntity : function(context, entity, nextSection) {
			var oldLevel = context.level;
			if(nextSection) {
				if(context.level >= (context.sections.length - 1)) {
					return;
				}
				context.setCurrentLevel(context.level + 1);
			}

			var oldLastSection = context.lastSection;
			var section = context.section;
			context.lastSection = section;
			try {
				var result;
				if(section.interceptor) {
					var interceptors = dorado.DataPath.interceptors[section.interceptor];
					if(interceptors && interceptors.dataInterceptor) {
						result = interceptors.dataInterceptor.call(this, entity, section.interceptor);
					} else {
						throw new dorado.Exception("DataPath interceptor \"" + section.interceptor + "\" not found.");
					}
				} else if(section.property) {
					if( entity instanceof dorado.Entity) {
						dorado.Entity.ALWAYS_RETURN_VALID_ENTITY_LIST = !section.leaf;
						try {
							result = entity.get(section.property, context.loadMode);
						} finally {
							dorado.Entity.ALWAYS_RETURN_VALID_ENTITY_LIST = true;
						}
					} else {
						result = entity[section.property];
					}
					if(result == null && section.leaf && section == oldLastSection) {
						this._selectEntityIf(context, entity, true);
					}
				} else {
					result = entity;
				}

				if( result instanceof dorado.EntityList || result instanceof Array) {
					this._evaluateSectionOnAggregation(context, result);
				} else if(result != null) {
					this._selectEntityIf(context, result);
					if(result != null && section.repeat) {
						this._evaluateSectionOnEntity(context, entity);
					}
				}
			} finally {
				context.lastSection = oldLastSection;
				context.setCurrentLevel(oldLevel);
			}
		},
		
		_evaluateSectionOnAggregation : function(context, entities, isRoot) {

			function selectEntityIf(entity) {
				var b = true;
				switch (section.visibility) {
					case 1:
						// all
						b = true;
						break;
					case 3:
						// dirty
						b = entity.state != dorado.Entity.STATE_NONE;
						break;
					case 4:
						// new
						b = entity.state == dorado.Entity.STATE_NEW;
						break;
					case 5:
						// modified
						b = entity.state == dorado.Entity.STATE_MODIFIED;
						break;
					case 6:
						// delete
						b = entity.state == dorado.Entity.STATE_DELETED;
						break;
					case 7:
						// moved
						b = entity.state == dorado.Entity.STATE_MOVED;
						break;
					case 8:
						// none
						b = entity.state == dorado.Entity.STATE_NONE;
						break;
					default:
						// visible
						b = entity.state != dorado.Entity.STATE_DELETED;
				}

				if(b) {
					var conditions = section.conditions;
					if(conditions) {
						var $this = entity;
						for(var i = 0; i < conditions.length; i++) {
							b = eval(conditions[i]);
							if(!b)
								break;
						}
					}
				}

				if(b) this._selectEntityIf(context, entity);
				if(section.repeat) {
					this._evaluateSectionOnEntity(context, entity);
				}
			}

			try {
				context.possibleMultiResult = true;
				var section = context.section;

				if(section.interceptor) {
					var interceptors = dorado.DataPath.interceptors[section.interceptor];
					if(interceptors && interceptors.dataInterceptor) {
						entities = interceptors.dataInterceptor.call(this, entities, section.interceptor);
						if(entities == null)
							return;
					} else {
						throw new dorado.Exception("DataPath interceptor \"" + section.interceptor + "\" not found.");
					}
				}

				if( entities instanceof dorado.EntityList || entities instanceof Array) {
					if(context.acceptAggregation && !(section.visibility > 0)/* VISIBLE */ && !section.conditions) {
						var sections = context.sections;
						if(section == sections[sections.length - 1]) {
							context.addResult(entities);
							throw BREAK_LEVEL;
						}
					}
				} else {
					entities = [entities];
				}

				if( entities instanceof dorado.EntityList) {
					if(section.visibility == 2) {// current
						if(entities.current)
							selectEntityIf.call(this, entities.current);
					} else {
						var includeDeleted = (section.visibility == 1/*all*/ || section.visibility == 3/*dirty*/ || section.visibility == 6/*delete*/);
						var it = entities.iterator(includeDeleted);
						while(it.hasNext()) {
							selectEntityIf.call(this, it.next());
						}
					}
				} else {
					for(var i = 0; i < entities.length; i++) {
						selectEntityIf.call(this, entities[i]);
					}
				}
			} catch (e) {
				if(e != BREAK_LEVEL) throw e;
			}
		},
		
		/**
		 * 针对传入的数据应用(执行)路径表达式，并返回表达式的执行结果。
		 * @param {Object} data 将被应用(执行)的数据。
		 * @param {boolean|Object} [options] 执行选项。
		 * <p>
		 * 此参数具有两种设定方式。当直接传入逻辑值true/false时，dorado会将此逻辑值直接认为是针对上述firstResultOnly子属性的值；
		 * 当传入的是一个对象时，dorado将尝试识别该对象中的其中子属性。
		 * </p>
		 * @param {boolean} [options.firstResultOnly] 是否只返回找到的第一个结果。
		 * @param {boolean} [options.acceptAggregation] 是否接受聚合型的结果对象。。
		 * 默认情况下，当DataPath的执行器得到一个聚合型的结果(即dorado.EntityList或Array类型的结)时，
		 * 会将其拆散，并将其中的结果压入DataPath的返回结果数组中。
		 * 如果指定了此属性为true，执行器将直接把得到的dorado.EntityList或Array压入DataPath的返回结果数组中。
		 * @param {String} [options.loadMode="always"] 数据装载模式。<br>
		 * 包含下列三种取值:
		 * <ul>
		 * <li>always	-	如果有需要总是装载尚未装载的延时数据。</li>
		 * <li>auto	-	如果有需要则自动启动异步的数据装载过程，但对于本次方法调用将返回数据的当前值。</li>
		 * <li>never	-	不会激活数据装载过程，直接返回数据的当前值。</li>
		 * </ul>
		 * @return {dorado.Entity|dorado.EntityList|any} 表达式的执行结果。
		 */
		evaluate : function(data, options) {
			var firstResultOnly, acceptAggregation = false, loadMode;
			if(options === true) {
				firstResultOnly = options;
			} else if( options instanceof Object) {
				firstResultOnly = options.firstResultOnly;
				acceptAggregation = options.acceptAggregation;
				loadMode = options.loadMode;
			}
			loadMode = loadMode || "always";

			if(this._compiledPath === undefined) this.compile();
			firstResultOnly = firstResultOnly || this._compiledPath.singleResult;

			var context = new dorado.DataPathContext(this._compiledPath, firstResultOnly);
			context.acceptAggregation = acceptAggregation;
			context.loadMode = loadMode;
			context.possibleMultiResult = false;
			try {
				if(data != null) {
					if( data instanceof dorado.EntityList || data instanceof Array) {
						this._evaluateSectionOnAggregation(context, data, true);
					} else {
						this._evaluateSectionOnEntity(context, data);
					}
				}
				if(!context.possibleMultiResult && context.results) {
					if (context.results.length == 0) {
						context.results = null;
					}
					else if (context.results.length == 1) {
						context.results = context.results[0];
					}
				}
				return context.results;
			} catch (e) {
				if(e == BREAK_ALL) {
					return (firstResultOnly) ? context.result : context.results;
				} else {
					throw e;
				}
			}
		},
		
		/**
		 * 返回某数据路径所对应的子数据类型。
		 * @param {dorado.DataType} dataType 根数据类型。
		 * @param {boolean|Object} [options] 执行选项。
		 * <p>
		 * 此参数具有两种设定方式。当直接传入逻辑值true/false时，dorado会将此逻辑值直接认为是针对上述acceptAggregationDataType子属性的值；
		 * 当传入的是一个对象时，dorado将尝试识别该对象中的其中的子属性。
		 * </p>
		 * @param {boolean} [options.acceptAggregationDataType]  是否允许返回聚合类型。默认为不返回聚合类型。
		 * 如果设置为不允许返回聚合类型，那么当通过数据路径的计算最终得到一个聚合类型时，系统会尝试返回该聚合类型中聚合元素的数据类型。
		 * @param {String} [options.loadMode="always"] 数据类型装载模式。<br>
		 * 包含下列三种取值:
		 * <ul>
		 * <li>always	-	如果有需要总是装载尚未装载的延时数据。</li>
		 * <li>auto	-	如果有需要则自动启动异步的数据装载过程，但对于本次方法调用将返回数据的当前值。</li>
		 * <li>never	-	不会激活数据装载过程，直接返回数据的当前值。</li>
		 * </ul>
		 * @return {dorado.DataType} 子数据类型。
		 */
		getDataType : function(dataType, options) {
			if(!dataType) return null;

			var acceptAggregationDataType, loadMode;
			if(options === true) {
				acceptAggregationDataType = options;
			} else if( options instanceof Object) {
				acceptAggregationDataType = options.acceptAggregationDataType;
				loadMode = options.loadMode;
			}
			loadMode = loadMode || "always";

			var cache = dataType._subDataTypeCache;
			if(cache) {
				var dt = cache[this.path];
				if(dt !== undefined) {
					if(!acceptAggregationDataType && dt instanceof dorado.AggregationDataType) {
						dt = dt.getElementDataType(loadMode);
					}
					if( dt instanceof dorado.DataType)
						return dt;
				}
			} else {
				dataType._subDataTypeCache = cache = {};
			}

			if( dataType instanceof dorado.LazyLoadDataType) {
				dataType = dataType.get(loadMode);
			}

			if (this._compiledPath === undefined) {
				this.compile();
			}

			if (dataType) {
				var compiledPath = this._compiledPath;
				for (var i = 0; i < compiledPath.length; i++) {
					var section = compiledPath[i];
					
					if (section.interceptor) {
						var interceptors = dorado.DataPath.interceptors[section.interceptor];
						if (interceptors && interceptors.dataTypeInterceptor) {
							dataType = interceptors.dataTypeInterceptor.call(this, dataType, section.interceptor);
						} else {
							dataType = null;
						}
					} else if (section.property) {
						if (dataType instanceof dorado.AggregationDataType) {
							dataType = dataType.getElementDataType(loadMode);
						}
						var p = dataType.getPropertyDef(section.property);
						dataType = (p) ? p.get("dataType") : null;
					}
					if (!dataType) {
						break;
					}
				}
			}

			cache[this.path] = dataType;
			if(dataType instanceof dorado.AggregationDataType && (this._compiledPath.singleResult || !acceptAggregationDataType)) {
				dataType = dataType.getElementDataType(loadMode);
			}
			return dataType;
		},
		
		_section2Path : function(section) {
			var path = (section.visibility == 2) ? '#' : '';
			path += (section.property) ? section.property : '';

			var args = section.args;
			if(args && args.length > 0) {
				path += '(' + args.join(',') + ')';
			}

			var conditions = section.conditions;
			if(conditions && conditions.length > 0) {
				path += '[' + conditions.join(',') + ']';
			}
			return (path) ? path : '*';
		},
		
		_compiledPath2Path : function() {
			var compiledPath = this._compiledPath;
			var sections = [];
			for(var i = 0; i < compiledPath.length; i++) {
				sections.push(this._section2Path(compiledPath[i]));
			}
			return sections.join('.');
		},
		
		toString : function() {
			this.compile();
			return this._compiledPath2Path();
		}
	});

	/**
	 * 创建一个数据路径的处理器。
	 * @param {String} path 数据路径表达式。
	 * @return {dorado.DataPath} 数据路径的处理器。
	 */
	dorado.DataPath.create = function(path) {
		var key = path || "$EMPTY";
		var dataPath = ENTITY_PATH_CACHE[key];
		if(dataPath == null) ENTITY_PATH_CACHE[key] = dataPath = new dorado.DataPath(path);
		return dataPath;
	};
	
	/**
	 * 对给定数据应用(执行)路径表达式，并返回表达式的执行结果。
	 * @param {Object} data 将被应用(执行)的数据。
	 * @param {String} path 数据路径。
	 * @param {boolean|Object} [options] 执行选项。
	 * @return {dorado.Entity|dorado.EntityList|any} 表达式的执行结果。
	 * @see dorado.DataPath#evaluate
	 */
	dorado.DataPath.evaluate = function(data, path, options) {
		var dataPath = dorado.DataPath.create(path);
		return dataPath.evaluate();
	};

	dorado.DataPath.interceptors = {};

	/**
	 * 向系统中注册一个数据路径片段的拦截处理器，用以自定义某种片段的执行规则。
	 * <p>
	 * 自定义的片段在使用时须在前面加一个"!"作为标识。
	 * 例如我们注册了一个名为CURRENT_NODE的自定义片段，在实际编写数据路径时须这样使用<code>!CURRENT_NODE.children</code>。
	 * </p>
	 * @param {String} section 要拦截的片段。
	 * @param {Function} dataIntercetor 数据运算的拦截方法。
	 * 此方法支持如下两个参数：
	 * <ul>
	 * <li>data	-	{Object} 数据路径在运算时当前正在处理的数据。
	 * 例如对于#employees.!DESCRIPTION，由于在!DESCRIPTION之前的#employees的含义是当前Employee对象。
	 * 因此，当DESCRIPTION的拦截器被触发时，data参数的值就是当前Employee对象。</li>
	 * <li>section	-	{String} 当前正在处理的自定义数据路径片段。
	 * 仍以#employees.!DESCRIPTION为例，section参数的值应该是DESCRIPTION。</li>
	 * </ul>
	 * 此方法中的this关键字指向当前的dorado.DataPath实例。
	 * 此方法的返回值就是该自定义数据路径片段的执行结果。
	 * @param {Function} [dataTypeIntercetor] 数据类型运算的拦截方法。
	 * 见{@link dorado.DataPath#getDataType}的说明。
	 * 此方法支持如下两个参数：
	 * <ul>
	 * <li>dataType	-	{Object} 数据路径在运算时当前正在处理的数据类型。</li>
	 * <li>section	-	{String} 当前正在处理的自定义数据路径片段。</li>
	 * </ul>
	 * 此方法中的this关键字指向当前的dorado.DataPath实例。
	 * 此方法的返回值就是该自定义数据路径片段的执行结果。
	 *
	 * @example
	 * // 此例注册了一个自定义片段CURRENT_DIR，用于表示树状列表控件treeDir中当前选中的节点对应的数据。
	 * // 假设treeDir是一个棵用于显示文件目录的树。这样，!CURRENT_DIR.childFiles就可以表示当前选中的目录中的所有子文件的集合。
	 * dorado.DataPath.registerInterceptor("CURRENT_DIR", function() {
	 * 	var data = null, node = treeDir.get("currentNode");
	 * 	if (node) data = node.get("data");
	 * 	return data;
	 * }, function() {
	 * 	return dataTypeFile;
	 * });
	 */
	dorado.DataPath.registerInterceptor = function(section, dataInterceptor, dataTypeInterceptor) {
		dorado.DataPath.interceptors[section] = {
			dataInterceptor : dataInterceptor,
			dataTypeInterceptor : dataTypeInterceptor
		};
	};

	dorado.DataPathContext = $class({
		$className : "dorado.DataPathContext",

		constructor : function(sections, firstResultOnly) {
			this.sections = sections;
			this.firstResultOnly = firstResultOnly;
			this.level = -1;
			this.levelInfos = [];

			if(firstResultOnly) {
				this.result = null;
			} else {
				this.results = [];
			}

			this.lastSection = sections[sections.length - 1];
			this.setCurrentLevel(0);
		},
		setCurrentLevel : function(level) {
			if(level > this.level) {
				this.levelInfos[level] = this.levelInfo = {
					count : 0
				};
			} else {
				this.levelInfo = this.levelInfos[level];
			}
			this.level = level;
			this.section = this.sections[level];
		},
		addResult : function(result) {
			if(this.firstResultOnly) {
				this.result = result;
				throw BREAK_ALL;
			} else {
				var section = this.section;
				if(section.max > 0 && this.levelInfo.count >= section.max) {
					throw BREAK_LEVEL;
				}
				this.results.push(result);
				this.levelInfo.count++;
			}
		}
	});

})();

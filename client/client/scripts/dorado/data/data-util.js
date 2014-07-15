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
	 * @class 与数据处理相关的工具函数。
	 * @static
	 */
	dorado.DataUtil = {
		
		extractNameFromId: function(id) {
			
			function extractName(id) {
				if (id.indexOf("v:") == 0) {
					var i = id.indexOf('$');
					if (i > 0) {
						return id.substring(i + 1);
					}
				}
				return id;
			}
			
			var name = id;
			var subId = dorado.DataType.getSubName(id);
			if (subId) {
				var subName = this.extractNameFromId(subId);
				if (subName != subId) name = name.replace(subId, subName);
			}
			return extractName(name);
		},
		
		FIRE_ON_ENTITY_LOAD: true,
	
		/**
		 * 如果定义了明确的数据类型，则将传入的数据转换成该数据类型。
		 * <p>
		 * 此处的数据类型既可以直接通过dataType参数来指定，也可以在data参数对应的JSON对象的$dataType属性中指定。
		 * </p>
		 * @param {Object} data 要转换的数据。
		 * @param {dorado.DataRepository} [dataTypeRepository] 数据类型的管理器。
		 * @param {dorado.DataType|dorado.LazyLoadDataType|String} [dataType] 要将数据转换为什么类型。
		 * @return {Object} 转换后的数据。
		 * @see dorado.DataType
		 */
		convertIfNecessary: function(data, dataTypeRepository, dataType) {
			if (data == null) return data;
						
			if (dataType) {
				if (dataType instanceof dorado.LazyLoadDataType) {
					dataType = dataType.get();
				} else if (typeof dataType == "string" && dataTypeRepository) {
					dataType = dataTypeRepository.get(dataType);
				}
			}
			
			if (data instanceof dorado.Entity || data instanceof dorado.EntityList) {
				if (!dataType || data.dataType == dataType) return data;
				if (data.dataType instanceof dorado.AggregationDataType && data.dataType.get("elementDataType") == dataType) return data;
				data = data.toJSON();
			}			
			if (data.$dataType && !dataType && dataTypeRepository) {
				dataType = dataTypeRepository.get(data.$dataType);
			}
			
			if (dataType) {
				var realData = (data.$isWrapper) ? data.data : data;
				if (data.$isWrapper) {
					realData = data.data;
					realData.entityCount = data.entityCount;
					realData.pageCount = data.pageCount;
				}
				else {
					realData = data;
				}
				
				if (dataType instanceof dorado.EntityDataType && realData instanceof Array) {
					dataType = new dorado.AggregationDataType({
						elementDataType: dataType
					});
				}
				if (dataType instanceof dorado.DataType) {
					var rudeData = data;
					data = dataType.parse(data);
					
					if (this.FIRE_ON_ENTITY_LOAD) {
						var eventArg = {};
						if (data instanceof dorado.Entity) {
							eventArg.entity = data;
							dataType.fireEvent("onEntityLoad", dataType, eventArg);
						} else if (data instanceof dorado.EntityList) {
							if (rudeData.$isWrapper) {
								data.pageSize = rudeData.pageSize;
								data.pageNo = rudeData.pageNo;
							}
							
							var elementDataType = dataType.get("elementDataType");
							if (elementDataType) {
								for (var it = data.iterator(); it.hasNext();) {
									eventArg.entity = it.next();
									elementDataType.fireEvent("onEntityLoad", dataType, eventArg);
								}
							}
						}
					}
				}
			}
			return data;
		},
		
		/**
		 * 将给定的JSON数据装转换成dorado中的数据封装形式。
		 * @param {Object} data 要转换的数据。
		 * @param {dorado.DataRepository} [dataTypeRepository] 数据类型的管理器。
		 * @param {dorado.DataType} [dataType] 要将数据转换为什么类型。
		 * @return {Object} 转换后的数据。
		 * @see dorado.DataType
		 */
		convert: function(data, dataTypeRepository, dataType) {
			if (data == null) return data;
			var result = this.convertIfNecessary(data, dataTypeRepository, dataType);
			if (result == data) {
				if (data instanceof Array) {
					result = new dorado.EntityList(data, dataTypeRepository, dataType);
				} else if (data instanceof Object) {
					result = new dorado.Entity(data, dataTypeRepository, dataType);
				}
			}
			return result;
		},
		
		/**
		 * 判断一个owner参数代表的数据是否data参数代表的数据的宿主。即data是否是owner中的子数据。
		 * @param {dorado.Entity|dorado.EntityList} data 要判断的数据。
		 * @param {dorado.Entity|dorado.EntityList} owner 宿主数据。
		 * @return {boolean} 是否宿主。
		 */
		isOwnerOf: function(data, owner) {
			if (data == null) return false;
			while (true) {
				data = data.parent;
				if (data == null) return false;
				if (data == owner) return true;
			}
		},
		
		DEFAULT_SORT_PARAMS: [{
			desc: false
		}],
		
		/**
		 * 排序。
		 * @param {Object[]} array 要排序的数组。
		 * @param {Object|Object[]} sortParams 排序参数或排序参数的数组。
		 * @param {String} sortParams.property 要排序的属性名。
		 * @param {boolean} sortParams.desc 是否逆向排序。
		 * @param {Function} [comparator] 比较器。
		 * 比较器是一个具有三个输入参数的Function，三个参数依次为：
		 * <ul>
		 * <li>item1	-	{Object} 要比较的对象1。</li>
		 * <li>item2	-	{Object} 要比较的对象2。</li>
		 * <li>sortParams	-	{Object|Object[]} 排序参数或排序参数的数组。</li> 
		 * </ul>
		 * 比较器的返回值表示对象1和对象2的比较结果：
		 * <ul>
		 * <li>返回大于0的数字表示对象1>对象2。</li>
		 * <li>返回小于0的数字表示对象1<对象2。</li>
		 * <li>返回等于0的数字表示对象1和对象2的比较结果相等。</li>
		 * </ul>
		 * 
		 * @example
		 * // 根据salary属性的值进行逆向排序
		 * dorado.DataUtil.sort(dataArray, { property: "salary", desc: true });
		 * 
		 * @example
		 * // 根据comparator自定义排序的规则
		 * dorado.DataUtil.sort(dataArray, null, function(item1, item2, sortParams) {
		 * 	... ...
		 * });
		 */
		sort: function(array, sortParams, comparator) {			
			array.sort(function(item1, item2) {
				if (comparator) {
					return comparator(item1, item2, sortParams);
				}
				
				var result1, result2;
				if (!(sortParams instanceof Array)) sortParams = [sortParams];
				for (var i = 0; i < sortParams.length; i++) {
					var sortParam = sortParams[i], property = sortParam.property;
					var value1, value2;
					if (property) {
						value1 = (item1 instanceof dorado.Entity) ? item1.get(property) : item1[property];
						value2 = (item2 instanceof dorado.Entity) ? item2.get(property) : item2[property];
					} else {
						value1 = item1;
						value2 = item2;
					}
					if (value1 > value2) {
						return (sortParam.desc) ? -1 : 1;
					} else if (value1 < value2) {
						return (sortParam.desc) ? 1 : -1;
					}
				}
				return 0;
			});
		}
	};
	
	
	function getValueForSummary(entity, property) {
		var value;
		if (property.indexOf('.') > 0) {
			value = dorado.DataPath.create(property).evaluate(entity);
		}
		else {
			value = (entity instanceof dorado.Entity) ? entity.get(property) : entity[property];
		}
		return parseFloat(value) || 0;
	}
	
	/**
	 * @author Benny Bao (mailto:benny.bao@bstek.com)
	 * @class 用于管理各种统计计算方法的对象。
	 * <p>
	 * 每一种统计计算方法都以属性值的方法注册在此对象中，dorado默认提供了count、sum、average等常用的统计计算方法。
	 * 默认支持的全部统计计算方法见本对象文档的Properties段落。
	 * </p>
	 * <p>
	 * 统计计算方法有两种定义形式：
	 * <ul>
	 * <li>
	 * 对于一些较简单的计算方法，可以直接以一个符合特定规范的Function来定义。
	 * <br>
	 * 例如sum（合计）的定义如下。
	 * <pre class="symbol-example code">
	 * <code class="javascript">
	 * // 此方法会在统计过程中针对每一个被统计对象执行一次。
	 * // 3个参数的含义分别是：当前统计结果（初始值为0），当前正被处理的数据实体，当前正统计的属性名。
	 * function(value, entity, property) {
	 * 	return value + parseFloat(entity[property]) || 0;
	 * }
	 * </code>
	 * </pre>
	 * </li>
	 * <li>
	 * 对于一些较复杂的计算方法，无法以一个Function来完成定义。此时可以采用一个包含3个方法的JSON对象来完成定义。
	 * <br>
	 * 例如average（平均值）的定义如下。
	 * <pre class="symbol-example code">
	 * <code class="javascript">
	 * {
	 * 	// 初始方法，用于初始化统计值。此方法只在统计开始前执行一次。
	 * 	getInitialValue: function() {
	 * 		return {
	 * 			sum: 0,
	 * 			count: 0
	 * 		};
	 * 	},
	 * 
	 * 	// 累计方法，此方法会在统计过程中针对每一个被统计对象执行一次。类似于上面提到简单定义中的那个Function。
	 * 	// 此处的value参数即是getInitialValue()返回的那个对象。
	 * 	accumulate: function(value, entity, property) {
	 * 		value.sum += getValueForSummary(entity, property);
	 * 		value.count++;
	 * 		return value;
	 * 	},
	 * 
	 * 	// 用于计算最终的统计值的方法，此方法只在统计完成前执行一次。
	 * 	getFinalValue: function(value) {
	 * 		return value.count ? value.sum / value.count : 0;
	 * 	}
	 * }
	 * </code>
	 * </pre>
	 * </li>
	 * </ul>
	 * </p>
	 * @static
	 */
	dorado.SummaryCalculators = {
		/**
		 * @name dorado.SummaryCalculators.count
		 * @property
		 * @type {Function|Object}
		 * @description "总数量"计算方法。
		 */
		
		/**
		 * @name dorado.SummaryCalculators.sum
		 * @property
		 * @type {Function|Object}
		 * @description "合计值"计算方法。
		 */
		// =====
		
		count: function(value, entity, property) {
			return value + 1;
		},
		
		sum: function(value, entity, property) {
			return value + getValueForSummary(entity, property);
		},
		
		/**
		 * "平均值"计算方法。
		 * @property
		 * @type {Function|Object}
		 */
		average: {
			getInitialValue: function() {
				return {
					sum: 0,
					count: 0
				};
			},
			accumulate: function(value, entity, property) {
				value.sum += getValueForSummary(entity, property);
				value.count++;
				return value;
			},
			getFinalValue: function(value) {
				return value.count ? value.sum / value.count : 0;
			}
		},
		
		/**
		 * "最大值"计算方法。
		 * @property
		 * @type {Function|Object}
		 */
		max: {
			getInitialValue: function() {
				return null;
			},
			accumulate: function(value, entity, property) {
				var v = getValueForSummary(entity, property);
                if (value == null) return v;
				return (v < value) ? value : v;
			},
            getFinalValue: function(value) {
                return value;
            }
		},
		
		/**
		 * "最小值"计算方法。
		 * @property
		 * @type {Function|Object}
		 */
		min: {
			getInitialValue: function() {
				return null;
			},
			accumulate: function(value, entity, property) {
				var v = getValueForSummary(entity, property);
                if (value == null) return v;
				return (v > value) ? value : v;
			},
            getFinalValue: function(value) {
                return value;
            }
		}
	};
	
})();

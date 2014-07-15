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
 * @class 任务指示器。
 * <p>
 * 任务提示器要正确执行就要先定义任务组，任务组的目的是为了将相似任务的信息合并到同一个任务提示框中。
 * </p>
 * <p>
 * 任务提示器已经预先定义好下列两个任务组:
 * 1. daemon:取义幽灵线程，用于显示大部分的Ajax后台操作。
 * 2. main:取义主线程，用于显示数据保存等操作，此类操作大都在执行时需要屏蔽用户的操作。
 * </p>
 * @static
 */
dorado.util.TaskIndicator = {
		
	type: null,

	idseed: 0,
	
	_taskGroups: {},
	
	init: function() {
		if (this.inited) return;
		this.inited = true;
		
		var mainType = $setting["common.taskIndicator.main.type"] || "panel";
		var daemonType = $setting["common.taskIndicator.daemon.type"] || "panel";
		
		// Main
		var taskGroupConfig =  {
			type: mainType,
			modal: true
		}
		if (mainType == "icon") {
			taskGroupConfig.showOptions = {
				align: "center",
				vAlign: "center"
			};
			taskGroupConfig.className = "d-main-task-indicator";
		}
		else if (mainType == "panel") {
			taskGroupConfig.showOptions = {
				align: "center",
				vAlign: "center"
			};
			taskGroupConfig.className = "d-main-task-indicator";
		}
		this.registerTaskGroup("main", taskGroupConfig);

		// Daemon
		taskGroupConfig =  {
			type: daemonType
		}
		if (daemonType == "icon") {
			taskGroupConfig.showOptions = {
				align: "innerright",
				vAlign: "innertop",
				offsetLeft: -15,
				offsetTop: 15
			};
			taskGroupConfig.className = "d-daemon-task-indicator";
		}
		else if (mainType == "panel") {
			taskGroupConfig.showOptions = {
				align: "innerright",
				vAlign: "innertop",
				offsetLeft: -15,
				offsetTop: 15
			};
			taskGroupConfig.className = "d-daemon-task-indicator";
		}
		this.registerTaskGroup("daemon", taskGroupConfig);
	},
	
	/**
	 * 注册一个任务提示组。
	 * @param {String} groupName 任务组的名称。
	 * @param {Object} [options] 任务组显示选项。
	 */
	registerTaskGroup: function(groupName, options) {
		var indicator = this, taskGroups = indicator._taskGroups;
		if (taskGroups[groupName]) {
			//task has registered already.
		} else {
			options = options || {};
			taskGroups[groupName] = options;
		}
	},
	
	/**
	 * 显示任务提示框。
	 * @example
	 * var taskId = dorado.util.TaskIndicator.showTaskIndicator("保存所有数据");
	 *  command.execute(function() {
	 * 	dorado.util.TaskIndicator.hideTaskIndicator(taskId);
	 * });
	 * @param {String} [taskInfo] 任务描述信息。如果不定义则显示一个默认的任务名称。
	 * @param {String} [groupName] 任务组的名称。如果不定义此参数，默认值为daemon。
	 * @param {Date} [startTime] 任务的开始时间
	 * @return {String} taskId 任务id。
	 */
	showTaskIndicator: function(taskInfo, groupName, startTime) {
		this.init();
		
		var indicator = this, taskGroups = indicator._taskGroups, taskGroupConfig;
		groupName = groupName || "daemon";
		taskGroupConfig = taskGroups[groupName];
		
		if (taskGroupConfig) {
			var groupPanel = taskGroupConfig.groupPanel;
			
			if (!groupPanel) {
				groupPanel = taskGroupConfig.groupPanel = new dorado.util.TaskGroupPanel(taskGroupConfig);
			}
			
			var taskId = groupName + "@" + ++indicator.idseed;
			groupPanel.show();
			groupPanel.addTask(taskId, taskInfo, startTime);
			
			return taskId;
		} else {
			//no register.
			return null;
		}
	},

	/**
	 * 更新某任务的提示信息。
	 * @param {String} taskId 任务id。
	 * @param {String} taskInfo 任务描述信息。
	 * @param {Date} [startTime] 任务的开始时间。
	 */
	updateTaskIndicator: function(taskId, taskInfo, startTime) {
		var indicator = this, taskGroups = indicator._taskGroups, taskGroupName, taskGroupConfig;

		taskGroupName = taskId.substring(0, taskId.indexOf("@"));
		taskGroupConfig = taskGroups[taskGroupName];

		if (taskGroupConfig) {
			var groupPanel = taskGroupConfig.groupPanel;
			if (groupPanel) {
				groupPanel.updateTask(taskId, taskInfo, startTime);
			}
		}
	},
	
	/**
	 * 隐藏任务提示框。
	 * @param {String} taskId 任务id。
	 */
	hideTaskIndicator: function(taskId) {
		var indicator = this, taskGroups = indicator._taskGroups, taskGroupName, taskGroupConfig;
		
		taskGroupName = taskId.substring(0, taskId.indexOf("@"));
		taskGroupConfig = taskGroups[taskGroupName];
		
		if (taskGroupConfig) {
			var groupPanel = taskGroupConfig.groupPanel;
			if (groupPanel) {
				groupPanel.removeTask(taskId);
			}
		}
	}
	
};

/**
 * @class TaskGroupPanel
 * <p>
 * 一般情况下，不需要单独使用该类。该类被TaskIndicator中的每个Group使用，每个Group对应一个TaskGroupPanel.
 * </p>
 */
dorado.util.TaskGroupPanel = $extend(dorado.RenderableElement, { /** @scope dorado.util.TaskGroupPanel.prototype */
	$className: "dorado.util.TaskGroupPanel",
	tasks: null,
	taskGroupConfig: null,
	_intervalId: null,
	
	ATTRIBUTES: /** @scope dorado.util.TaskGroupPanel.prototype */ {
		className: {
			defaultValue: "d-task-group"
		}
	},
	
	constructor: function(taskGroupConfig) {
		$invokeSuper.call(this);
		var panel = this;
		if (!taskGroupConfig) {
			throw new dorado.Exception("taskGrooupRequired");
		}
		panel.taskGroupConfig = taskGroupConfig;
		
		panel.tasks = new dorado.util.KeyedArray(function(object) {
			return object.taskId;
		});
	},
	
	createDom: function() {
		var panel = this, dom, doms = {}, taskGroupConfig = panel.taskGroupConfig;
		if (taskGroupConfig.type == "bar") {
			dom = null;
		}
		else if (taskGroupConfig.type == "icon") {
			dom = $DomUtils.xCreate({
				tagName: "div",
				className: panel._className + " " + panel._className + "-" + taskGroupConfig.type + " " + taskGroupConfig.className,
				content: {
					tagName: "div",
					className: "icon",
					content: {
						tagName: "div",
						className: "spinner"
					}
				}
			});
		}
		else {
			dom = $DomUtils.xCreate({
				tagName: "div",
				className: panel._className + " " + panel._className + "-" + taskGroupConfig.type + " " + taskGroupConfig.className,
				content: [{
					tagName: "div",
					className: "icon",
					content: {
						tagName: "div",
						className: "spinner"
					}
				},{
					tagName: "div",
					className: "count-info",
					contextKey: "countInfo"
				}, {
					tagName: "ul",
					className: "task-list",
					contextKey: "taskList",
					content: {
						tagName: "li",
						className: "more",
						content: "... ... ...",
						contextKey: "more",
						style: "display: none"
					}
				}]
			}, null, doms);
			panel._doms = doms;
			
			taskGroupConfig.caption = taskGroupConfig.caption ? taskGroupConfig.caption : $resource("dorado.core.DefaultTaskCountInfo");
			taskGroupConfig.executeTimeCaption = taskGroupConfig.executeTimeCaption ? taskGroupConfig.executeTimeCaption : $resource("dorado.core.DefaultTaskExecuteTime");
		}
		
		return dom;
	},
	
	/**
	 * 添加任务
	 * @param {int} taskId 任务Id。
	 * @param {String} taskInfo 任务的提示信息
	 * @param {Date} [startTime] 任务的开始时间
	 */
	addTask: function (taskId, taskInfo, startTime) {
		startTime = (startTime || new Date()).getTime();
		var time = (new Date()).getTime();
		var panel = this, taskGroupConfig = panel.taskGroupConfig;
		
		if (taskGroupConfig.type == "panel") {
			var listDom = panel._doms.taskList, li = $DomUtils.xCreate({
				tagName: "li",
				className: "task-item",
				content: [{
					tagName: "span",
					className: "interval-span",
					content: taskGroupConfig.executeTimeCaption.replace("${taskExecuteTime}", parseInt((time - startTime) / 1000, 10))
				}, {
					tagName: "span",
					className: "caption-span",
					content: taskInfo
				}]
			});
			
			if (panel.tasks.size >= (panel.taskGroupConfig.showOptions.maxLines || 3)) {
				li.style.display = "none";
				panel._doms.more.style.display = "";
			}
			listDom.insertBefore(li, panel._doms.more);

			if (panel.tasks.size == 0) {
				panel._intervalId = setInterval(function() {
					panel.refreshInterval();
				}, 500);
			}
		}
		
		panel.tasks.append({
			taskId: taskId,
			dom: li,
			startTime: startTime
		});
		
		if (taskGroupConfig.type == "panel") {
			$fly(panel._doms.countInfo).text(taskGroupConfig.caption.replace("${taskNum}", panel.tasks.size));
		}
	},

	/**
	 * 更新某任务的提示信息
	 * @param {String} taskInfo 任务的提示信息
	 * @param {int} taskId 任务Id
	 * @param {Date} [startTime] 任务的开始时间
	 */
	updateTask: function(taskId, taskInfo, startTime) {
		var panel = this, target = panel.tasks.get(taskId), taskGroupConfig = panel.taskGroupConfig;
		if (target){
			if (startTime) target.startTime = startTime;

			if (taskGroupConfig.type == "panel") {
				if (target.dom) {
					$fly(target.dom).find(">.caption-span")[0].innerText = taskInfo;
				}
			}
		}
	},
	
	/**
	 * 移除任务。
	 * @param {int} taskId 分配给该任务的id。
	 */
	removeTask: function(taskId) {
		var panel = this, target = panel.tasks.get(taskId), taskGroupConfig = panel.taskGroupConfig;
		if (target) {
			if (taskGroupConfig.type == "bar" || taskGroupConfig.type == "icon") {
				panel.tasks.remove(target);
				if (panel.tasks.size == 0) {
					panel.hide();
				}
			}
			else if (taskGroupConfig.type == "panel") {
				setTimeout(function() {
					$fly(target.dom).remove();
					panel.tasks.remove(target);
					
					var maxLines = panel.taskGroupConfig.showOptions.maxLines || 3;
					if (panel.tasks.size > maxLines) {
						var i = 0;
						panel.tasks.each(function(task) {
							task.dom.style.display = "";
							if (++i == maxLines) return false;
						});
					}
					else {
						panel._doms.more.style.display = "none";
						if (panel.tasks.size == 0) {
							clearInterval(panel._intervalId);
							panel._intervalId = null;
							panel.hide();
						}
						else {
							panel.tasks.each(function(task) {
								task.dom.style.display = "";
							});
						}
					}
					$fly(panel._doms.countInfo).text(taskGroupConfig.caption.replace("${taskNum}", panel.tasks.size));
				}, 500);
			}
		}
	},
	
	/**
	 * 刷新所有正在执行任务的执行时间。
	 * @protected
	 */
	refreshInterval: function() {
		var panel = this, time = new Date().getTime();
		panel.tasks.each(function(task) {
			var el = task.dom, startTime = task.startTime;
			if (el && startTime) {
				var interval = parseInt((time - startTime) / 1000, 10);
				$fly(el).find(".interval-span").text(panel.taskGroupConfig.executeTimeCaption.replace("${taskExecuteTime}", interval));
			}
		});
	},
	
	/**
	 * 显示任务面板
	 * @param {Object} options 注册任务组的时候的配置信息中的showOptions选项。
	 */
	show: function(options) {
		var panel = this, taskGroupConfig = panel.taskGroupConfig;
		options = options || taskGroupConfig.showOptions;
		if (panel._hideTimer) {
			clearTimeout(panel._hideTimer);
			panel._hideTimer = null;
			return;
		}
		
		if (taskGroupConfig.type == "bar") {
			if (!panel._rendered) {
				panel._rendered = true;
				NProgress.configure({
					positionUsing: (dorado.Browser.isTouch && dorado.Browser.version < "535.0") ? "margin" : "",
					showSpinner: false
				});
				panel._dom = NProgress.render(true);
			}
			NProgress.start();
		}
		else {
			if (!panel._rendered) {
				panel.render(document.body);
			} else {
				$fly(panel._dom).css("display", "").css("visibility", "");
			}
		}
		
		if (panel.tasks.size == 0 && taskGroupConfig.modal) {
			dorado.ModalManager.show(panel._dom);
		}
		$fly(panel._dom).bringToFront();
		
		if (options) {
			$DomUtils.dockAround(panel._dom, document.body, options);
		}
	},
	
	/**
	 * 隐藏任务面板
	 */
	hide: function() {
		var panel = this;
		var taskGroupConfig = panel.taskGroupConfig;
		
		if (taskGroupConfig.type == "bar") {
			NProgress.done();
		}
		else {
			if (panel._rendered) {
				jQuery(panel._dom).css("display", "none").css("visibility", "hidden");
			}
		}
		
		if (taskGroupConfig.modal) {
			dorado.ModalManager.hide(panel._dom);
		}
	}
});

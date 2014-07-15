var log = '', logCount = 0, isNext = true, uuid;
// @Bind view.onReady
!function(self, arg) {
	var userData = view.get('userData');
	uuid = userData.uuid;
	view.get('#getFileNameListAction').execute();
	
}

// @Bind #getFileNameListAction.onSuccess
!function(self,arg){
	var names=arg.result;
	if(names.length==0){
		dorado.widget.NotifyTipManager.notify("${res.configTipContent}");
	}
	view.get("#fileNameDropDown").set("items", names);
}


// @Bind #getFileContentAction.beforeExecute
!function(self, arg) {
	var lineSize = view.get('#lineSize').get('value'), fileName = view.get(
			'#fileName').get('value'), charsetName = view.get('#charsetName')
			.get('value');
	if (fileName) {
		self.set('parameter', {
			fileName : fileName,
			lineSize : lineSize,
			isNext : isNext,
			uuid : uuid,
			charsetName : charsetName
		});
	} else {
		dorado.widget.NotifyTipManager.notify("${res.fileNameTipContent}");
		arg.processDefault = false;
	}

}

// @Bind #prevContentBtn.onClick
!function(self, arg, getFileContentAction) {
	isNext = false;
	getFileContentAction.execute();

}

// @Bind #nextContent.onClick
!function(self, arg, getFileContentAction) {
	isNext = true;
	getFileContentAction.execute();
}

// @Bind #getFileContentAction.onSuccess
!function(self, arg, fileName) {
	var data = arg.result.logs, startPointer = arg.result.currentStartPointer, log;
	data.each(function(text) {
		if (log) {
			log = log + '</br>' + text;
		} else {
			log = text;
		}

	});
	var logBox = view.get("#logBox").getDom();
	$(logBox).empty();
	$(logBox).xCreate([ {
		tagName : "PRE",
		content : log
	} ]);

	logBox.scrollTop = logBox.scrollHeight - logBox.clientHeight;
	view.get('#prevContentBtn').set('disabled', startPointer == 0);
	if (!fileName.get('readOnly')) {
		fileName.set('readOnly', true);
		parent.setTabName(fileName.get('value'));
	}

}

// @Bind #dataSetLog.beforeLoadData
!function(self, arg) {
	var fileName = view.get('#fileName').get('value');
	if (fileName) {
		self.set('parameter', {
			fileName : view.get('#fileName').get('value')
		});

	} else {
		arg.processDefault = false;
	}

}

// @Bind #fileToolBar.onContextMenu
!function(self, arg) {
	parent.showReaderTabContextMenu(arg);
}
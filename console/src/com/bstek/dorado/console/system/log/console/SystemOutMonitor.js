
var logArray = new Array(), logArrayMaxLength = 1000, isAutoFlush = false;

// @Bind view.onReady
!function(self, arg) {
	var listenerActiveState = view.get('userData').listenerActiveState, tip = view
			.get('#listeneTip');
	if (!listenerActiveState) {
		tip.set("anchorTarget", view.get('#logPanel'));
		tip.show();
	}
	view.get('#outCheckBox').set('value', true);
	view.get('#errCheckBox').set('value', true);
	logArrayMaxLength = view.get('#maxLineSize').get('text');
	view.get("#retrieveLogAction").execute();

}

// @Bind #retrieveLogAction.onSuccess
!function(self, arg) {
	var log = '', logs = arg.result;
	$(logs).each(function(index) {
		logArray.push(logs[index]);
		if (logArray.length > logArrayMaxLength) {
			var sz = logArray.length, gap = sz - logArrayMaxLength;
			for ( var i = 0; i < gap; i++) {
				logArray.shift();
			}
		}
	});

	$(logArray).each(
			function(index) {
				var logLine = logArray[index];
				log = log + '<li class="' + logLine['level'] + '">'
						+ logLine['line'] + '</li>';
			});

	var logBox = view.get("#logBox").getDom();
	$(logBox).empty();
	$(logBox).xCreate([ {
		tagName : "PRE",
		content : log
	} ]);
	onSysErrVisible(view.get('#errCheckBox').get('value'));
	onSysOutVisible(view.get('#outCheckBox').get('value'));

	logBox.scrollTop = logBox.scrollHeight - logBox.clientHeight;

	if (isAutoFlush) {
		setTimeout(function() {
			self.execute()
		}, 10000);
	}
}

// @Bind #flushBtn.onClick
!function(self, arg) {
	logArrayMaxLength = view.get('#maxLineSize').get('text');
	view.get("#retrieveLogAction").execute();
}
// @Bind #autoFlushBtn.onClick
!function(self, arg) {
	logArrayMaxLength = view.get('#maxLineSize').get('text');
	isAutoFlush = !isAutoFlush;
	view.get('#flushBtn').set('disabled', isAutoFlush);
	if (isAutoFlush) {
		self.set('caption', '${res.stopRefresh}');
		view.get("#retrieveLogAction").execute();
	} else {
		self.set('caption', '${res.autoRefresh}');
	}

}

/** @Global */
function onSysOutVisible(arg) {
	if (!arg) {
		$('.sysout').css('display', 'none');
	} else {
		$('.sysout').css('display', 'block');
	}
}
// @Bind #outCheckBox.onValueChange
!function(self, arg) {
	onSysOutVisible(self.get("value"));
}

/** @Global */
function onSysErrVisible(arg) {
	if (!arg) {
		$('.syserr').css('display', 'none');
	} else {
		$('.syserr').css('display', 'block');
	}
}

// @Bind #errCheckBox.onValueChange
!function(self, arg) {
	onSysErrVisible(self.get("value"));
}

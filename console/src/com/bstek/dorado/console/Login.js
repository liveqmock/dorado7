var homePage = './dorado/console';
// @Bind view.onReady
!function(self, arg) {
	if (window != top) {
		top.location.href = homePage;
	} else {
		view.get('#loginDialog').show();
	}
}

// @Bind #loginAction.beforeExecute
!function(self, arg) {
	var password = view.get('#user_password').get("value");
	var name = view.get('#user_name').get('value');
	self.set('parameter', {
		name : name,
		password : password
	});

}
// @Bind #loginAction.onSuccess
!function(self, arg) {
	if (arg.result) {
		var reg = /\/dorado\/console$/;
		if (reg.exec(window.location.href)) {
			window.location.reload();
		} else {
			top.location.href = homePage;
		}
	} else {
		dorado.widget.NotifyTipManager.notify("${res.failed_login}");
	}

}

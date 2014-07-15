/**
 * @author Alex tong (mailto:alex.tong@bstek.com)
 * @since 2012-11-22
 */
var userDate, systemInfo, runtime;

// @Bind view.onReady
!function(self, arg) {
	userData = view.get("userData"), params = userData.params,
			keys = userData.keys;
	var elid = '';
	keys.each(function(key) {
		elid = '#' + key;
		 if (key.indexOf('Memory') >= 0) {
			$(elid).html(dorado.console.util.formatFileSize(params[key]));
		} else {
			$(elid).html(params[key]);
		}
	});

}

// @Bind #reloadBtn.onClick
!function(self, arg) {
	window.location.reload();
}

// @Bind #forceGCBtn.onClick
!function(self, arg) {
	view.get('#forceGCAction').execute();
}

// @Bind #forceGCAction.onSuccess
!function(self, arg) {
	window.location.reload();
}
var userData;
// @Bind view.onReady
!function(self, arg) {
	// view.get('#getDoradoConfigAction').execute();
	userData = view.get('userData');
	$.each(userData, function(key, value) {
		view.get('#' + key).set('value', value);
	});
}
// @Bind #buttonSave.onClick
!function(self, arg, dsConfig, saveAction) {
	dsConfig.clear();
	var map = new dorado.util.Map();

	$.each(userData, function(key, value) {
		var el = view.get('#' + key);
		var label = el.get('label');
		map.put(label, el.get('value'));

	});
	dsConfig.insert(map);
	saveAction.execute();
}

// @Bind #resetAction.onSuccess
!function(self, arg) {
	var map = arg.result;
	window.location.reload();
}
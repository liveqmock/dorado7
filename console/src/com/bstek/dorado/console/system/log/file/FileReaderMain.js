/** @Global */
function setTabName(name) {
	view.get('#fileReaderTab').get('currentTab').set({
		name : name,
		caption : name
	});
}
/** @Global */
function showReaderTabContextMenu(arg) {
	view.get('#readerTabContextMenu').show({
		event : arg.event
	});
}
// @Bind view.onReady
!function(self, arg) {
	view.get('#fileReaderTab').addRightToolButton(new dorado.widget.Button({
		icon : 'url(>skin>common/icons.gif) -100px -20px',
		caption : '${res.operation}',
		showTrigger : true,
		menu : view.get('#readerTabContextMenu')
	}));
}
// @Bind view.onContextMenu
!function(self, arg) {
	showReaderTabContextMenu(arg);
}

/**
 * @author Alex Tong (mailto:alex.tong@bstek.com)
 * @since Nov 20,2012
 */
// @Bind view.onReady
!function(self, arg) {
	userData = view.get("userData");
	view.get('#startupTimeValue').set("text", userData.startTime);
	view.get('#buttonLogout').set("visible", !userData.isOpen);
	if (userData.isOpen) {
		view.get('#startupTimeValue').set('style', "right:10px;");
		view.get('#startupTimeLabel').set('style', "right:130px;");
	}
	view.get('#framePanel').set('caption', "${res.homePage}")
}
//@Bind ^menuBtn.onCreate
!function(self, arg) {
	self.set("renderer", new dorado.widget.blockview.ImageBlockRenderer({
		captionProperty : "label",
		imageProperty : "icon"
	}));
}


// @Bind ^menuBtn.onBlockClick
!function(self, arg) {
	var label = arg.data.label, parentCaption = self
			.get('parent.parent.caption');
	view.get('#framePanel').set('caption', parentCaption + '->' + label)
	var path = '>com.bstek.dorado.console.' + arg.data.path;
	view.get('#detailInfoSubView').set('path', path)
}

// @Bind #logoutAction.onSuccess
!function(self, arg) {
	window.location.reload();
}


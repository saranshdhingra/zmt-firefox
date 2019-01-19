let prevSubscribedChannel='';

//open options page on Icon click
browser.browserAction.onClicked.addListener(function(){
	browser.tabs.create({
		url: "options.html"
	});
});

//whenever extension is loaded
browser.runtime.onInstalled.addListener(function () {
	refreshSettings();
	//check if user has seen the changelog
	browser.storage.local.get("last_seen_version", function (result) {
		var version = result['last_seen_version'],
			cur_version = browser.runtime.getManifest().version;

		//don't show anything if last seen version is same as current version
		if (version != cur_version) {
			browser.browserAction.setBadgeText({
				text: 'NEW'
			});

		}
	});
});


//whenever the storage is changed,
//we make sure to refresh it here
browser.storage.onChanged.addListener(function (changes, namespace) {
	if (Object.keys(changes).indexOf("zmt_settings") != -1) {
		refreshSettings();
	}
});

//function that fetches the current settings from localstorage
function refreshSettings(callback){
	browser.storage.local.get("zmt_settings", function (result) {
		if (result.zmtSettings !== undefined) {
			window.zmtSettings = JSON.parse(result.zmtSettings);


			//unsubscribe from the prev pubnub channel, just to stay updated
			//i.e if anything changes like the user logs out, or someone else logs in!
			pubnub.unsubscribe({
				channels: [prevSubscribedChannel]
			});

			if (zmtSettings.user !== undefined && zmtSettings.user.verified && zmtSettings.user.channel !== undefined && pubnub !== undefined && zmtSettings.showNotifications) {
				pubnub.subscribe({
					channels: ['global', zmtSettings.user.channel],
				});

				//update the channel that was subscribed last
				prevSubscribedChannel = zmtSettings.user.channel;
			}
		}

		if (callback !== undefined)
			callback();
	});
}
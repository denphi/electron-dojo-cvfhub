require([
	"./app/App.js",
	"dojo/domReady!"
 ], function(App) {
	// create the BorderContainer and attach it to our appLayout div
	var appLayout = new App({
		design: "headline"
	}, "appLayout");

	appLayout.startup();
 });

define([
    "dojo/_base/declare",
    "dojo/_base/lang",
	"dojox/layout/ContentPane", 
	"dijit/form/Button",
	"dojo/domReady!"
], function(
    declare,
    lang,
	ContentPane,
	Button	
) {
    return declare("ResultsPane", [ContentPane], {
		button : undefined,
        constructor: function(/*Object*/ kwArgs) {
            lang.mixin(this, kwArgs);	
			this.button = new Button({				
				label: "Execute new analysis",
			});
        },
		
        postCreate: function(){
			this.addChild(this.button);
        },
    });    
});
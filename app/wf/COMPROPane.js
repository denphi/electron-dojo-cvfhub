define([
    "dojo/_base/declare",
    "dojo/_base/lang",
	"dijit/form/TextBox",	
	"dijit/form/NumberTextBox",
	"dijit/form/NumberSpinner",
	"dojox/layout/ContentPane", 
	"dojox/layout/TableContainer", 
	"dojo/domReady!"
], function(
    declare,
    lang,
	TextBox, 
	NumberTextBox, 
	NumberSpinner, 
	ContentPane,	
	TableContainer,	
) {
    return declare("COMPROPane", [ContentPane], {		
        constructor: function(/*Object*/ kwArgs) {
            lang.mixin(this, kwArgs);	
        },
		
        postCreate: function() {
			var programmatic = new TableContainer(
			{
			  cols: 1,
			  "labelWidth": "150"
			}, dojo.byId("putWidgetHere"));

			this.addChild(programmatic);
        },		
    });    
});
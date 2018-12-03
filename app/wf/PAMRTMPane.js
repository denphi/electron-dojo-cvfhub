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
    return declare("PAMRTMPane", [ContentPane], {		
		inlet_temperature : undefined,
		ambient_temperature : undefined,
		inlet_pressure : undefined,
        constructor: function(/*Object*/ kwArgs) {
            lang.mixin(this, kwArgs);	
			this.inlet_temperature = new NumberSpinner({
				label: "Resin inlet temperature",
				value: "150" ,
				required : "true",
				placeHolder: "150"
			});		
			this.ambient_temperature = new NumberSpinner({
				label: "Ambient temperature (C)",
				value: "50",
				required : "true",
				placeHolder: "50"
			});		
			this.inlet_pressure = new TextBox({
				label: "Inlet pressure (Pa)",
				value: "1e6",
				required : "true",
				placeHolder: "1e6"
			});		
        },
		
        postCreate: function() {
			var programmatic = new TableContainer({
			  cols: 1,
			  "labelWidth": "150"
			});

			programmatic.addChild(this.inlet_temperature);	
			programmatic.addChild(this.ambient_temperature);	
			programmatic.addChild(this.inlet_pressure);	
			this.addChild(programmatic);
        },		
    });    
});
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
    return declare("PAMFORMPane", [ContentPane], {		
		modulus : undefined,
		bendingstiffness : undefined,
		FORM_filename : undefined,
        constructor: function(/*Object*/ kwArgs) {
            lang.mixin(this, kwArgs);	
			this.modulus = new NumberSpinner({
				label: "Tow modulus(GPa)",
				value: "20" ,
				required : "true",
				placeHolder: "20"
			});		
			this.bendingstiffness = new NumberTextBox({
				label: "Bending Stiffness (N/mm)",
				value: "0.06",
				required : "true",
				placeHolder: "0.06"
			});		
			this.FORM_filename = new TextBox({
				label: "FORM filename",
				value: "hemisphere",
				required : "true",
				placeHolder: "hemisphere"
			});		
        },
		
        postCreate: function() {
			var programmatic = new TableContainer({
			  cols: 1,
			  "labelWidth": "150"
			});

			programmatic.addChild(this.modulus);	
			programmatic.addChild(this.bendingstiffness);	
			programmatic.addChild(this.FORM_filename);
			this.addChild(programmatic);
        },		
    });    
});
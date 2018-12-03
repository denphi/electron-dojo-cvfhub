define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/_base/Deferred", 
	"dojo/request",
    "dojo/domReady!"
], function(
    declare,
    lang,
    Deferred,
	request
) {
   return declare("OrdersController", [], {
		authenticated : false,
        constructor: function(kwArgs) {
            lang.mixin(this, kwArgs);
        },
        
        addOrder: function(data){
			
        }
    });     
});	
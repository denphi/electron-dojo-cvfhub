define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/on",
    "dojo/dom",
    "dojo/Evented",	
	"dijit/layout/ContentPane", 
	"dojo/store/Memory",
    "dijit/tree/ObjectStoreModel", 
	"dijit/Tree",
	"dojox/widget/Standby",
    "dojo/domReady!"
], function(
    declare,
    lang,
    on,
    dom,
	Evented,
	ContentPane,
	Memory, 
	ObjectStoreModel,
	Tree,
	Standby	
) {
    return declare("TreePane", [ContentPane, Evented], {		
        constructor: function(/*Object*/ kwArgs) {
            lang.mixin(this, kwArgs);
			this.class = "edgePanel"
        },
        
        postCreate: function() {
			this.standby = new Standby({'target':this.domNode});
        },
		
		loadTree : function( base, data ){
			this.standby.show();
			var self = this
			var children = this.getChildren();
			if (children.length>0)
				this.removeChild(children[0])
			var myStore = new Memory({
				'data': data,
				'getChildren': function(object){
					return this.query({parent: object.id});
				}
			});

			// Create the model
			var myModel = new ObjectStoreModel({
				'store': myStore,
				'query': {root: true},
				'mayHaveChildren': function(obj){
					  return 'children' in obj && obj.children;
				},				
			});

			// Create the Tree, specifying an onClick method
			var tree = new Tree({
				'model': myModel,
				'onClick': function(item){
					self.emit("selected_order", {'id' : item.id, 'name' : item.name, 'parent' : item.parent});
				},
				'getIconClass':function(item, opened){
					if (item.parent && item.parent!="root"){
						if(item.state == "SUCCESSFUL")
							return "dijitL5 dijitCircle";
						else if(item.state == "INCOMPLETE")
							return "dijitL4 dijitCircle";
						else if(item.state == "FAILED")
							return "dijitL1 dijitCircle";
						else
							return "dijitL0 dijitCircle";
					} else {
						return (opened ? "dijitFolderOpened" : "dijitFolderClosed");
					}
				},
				'getTooltip': function( item ) { 
					return item.state; 
				},
				'getLabel': function( item ) { 
					if (item.parent)
						return item.parent+","+item.id + " ("+item.name + ")"; 
					return item.name
				} 
			})

			this.addChild(tree);
			this.resize();
			this.standby.hide();			
		}        
    });    
});
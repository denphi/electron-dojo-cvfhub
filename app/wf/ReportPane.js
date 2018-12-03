define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/Evented",		
	"dijit/layout/TabContainer", 
	"dojox/layout/ContentPane", 
	'dojox/grid/EnhancedGrid',
	'dojo/data/ItemFileWriteStore',
	"dijit/form/TextBox",
	"dijit/form/Button",
	"dojo/_base/array",
	"dojox/widget/Standby",	
	"dojo/domReady!"
], function(
    declare,
    lang,
	Evented,
	TabContainer,
	ContentPane,
	EnhancedGrid,
	ItemFileWriteStore,
	TextBox,
	Button,
	array,
	Standby
) {
    return declare("ReportPane", [ContentPane, Evented], {
		grid : undefined,
		store : undefined,
        constructor: function(/*Object*/ kwArgs) {
            lang.mixin(this, kwArgs);	
			var data = {
					  identifier: "id",
			  items: []
			};			
			this.store = new ItemFileWriteStore({data: data});
		    var layout = [[
			  {'name': 'Variable', 'field': 'col1', width:"200px",editable: false},
			  {'name': 'Value', 'field': 'col2', width:"auto",editable: false}
			]];
			this.grid = new EnhancedGrid({
				'store': this.store,
				'structure': layout,
				'rowSelector': '20px',
				'title' : "parameters"				
			});
			this.mainPane = new TabContainer({
			})
        },
		loadParams: function( params ) {
			this.standby.show();
			var self = this
			array.forEach(params, function(entry, i){
				var tb = {
					'id': (i+1),
					'col1': entry.name,
					'col2': entry.value
				};
				self.store.newItem(tb);
			});
			this.grid.startup();						
			this.standby.hide();
		},	

		addLog: function( log ) {
			var log = new ContentPane({
				title : "log",
				content : log
			});
			this.mainPane.addChild(log);
		},
		humanFileSize: function (bytes) {
			var thresh = 1000;
			if(Math.abs(bytes) < thresh) {
				return bytes + ' B';
			}
			var units = ['kB','MB','GB','TB','PB','EB','ZB','YB'];
			var u = -1;
			do {
				bytes /= thresh;
				++u;
			} while(Math.abs(bytes) >= thresh && u < units.length - 1);
			return bytes.toFixed(1)+' '+units[u];
		},	
		
		addFiles: function( files ) {
			var self = this;
			var buttonFormatter = function(value, row_id, cell){
				if (value == 'download') {
					var new_button = new Button({ 
						showLabel: false,
						iconClass: "dijitEditorIcon dijitEditorIconSave",
						'class': 'gridButton',
						onClick: function () {  
							var row = cell.grid.getItem(row_id);
							self.emit("selected_file", {'file':row['col1'][0]});							
                        }
					});
					new_button._destroyOnRemove = true;
					return new_button;
				}
				return null;
			};			
			var data = {
				identifier: "id",
				items: []
			};			
			var store = new ItemFileWriteStore({data: data});
		    var layout = [[
			  {'name': 'Path', 'field': 'col1', width:"auto",editable: false},
			  {'name': 'Filename', 'field': 'col2', width:"auto",editable: false},
			  {'name': 'Filesize', 'field': 'col3', width:"auto",editable: false},
			  {'name': 'Extension', 'field': 'col4', width:"auto",editable: false},
			  {'name': 'Download', 'field': 'col5', width:"auto", formatter: buttonFormatter},
			]];
			array.forEach(files, function(file, i){
				var tb = {
					'id': (i+1),
					'col1': file.path,
					'col2': file.name,
					'col3': self.humanFileSize(file.size),
					'col4': file.extension,
					'col5': "download",
				};
				store.newItem(tb);
			});
			
			var grid = new EnhancedGrid({
				'store': store,
				'structure': layout,
				'rowSelector': '20px',
				'title' : "files"
			});
			this.mainPane.addChild(grid);
			grid.startup();			
		},		
        postCreate: function() {
			this.standby = new Standby({'target':this.domNode});			
			this.mainPane.addChild(this.grid)
			this.addChild(this.mainPane);
        },	
		onClose: function () {
			this.getParent().removeChild(this);
			this.destroyRecursive();
		}		
	});    
});
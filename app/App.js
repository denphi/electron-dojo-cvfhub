define([
    "dojo/_base/declare",
    "dojo/_base/lang",
	"dijit/layout/BorderContainer",
	"dijit/layout/TabContainer", 
	"dijit/layout/ContentPane", 
    "dijit/Dialog",
	"dojo/_base/array",
	"dojo/dom",
	"dojo/dom-style",
	"./app/TreePane.js",
	"./app/LoginDialog.js",
	"./app/LoginController.js",
	"./app/wf/wf.js",
	"dojo/domReady!"
 ], function(
    declare,
    lang, 
	BorderContainer, 
	TabContainer,
	ContentPane,
	Dialog,
	array,
	dom,
	domStyle,
	TreePane,
	LoginDialog, 
	LoginController,
	wf
) {
    return declare("App", [BorderContainer], {	
		treepane : undefined,
		contentTabs : undefined,
		contentTop : undefined,
		loginDialog : undefined,
		errorDialog : undefined,
		loadingDialog : undefined,
		loginController : undefined,
		jobschedulerId : undefined,		
        constructor: function(/*Object*/ kwArgs) {			
            lang.mixin(this, kwArgs);
			this.jobschedulerId = "DESKTOP-8UDIT28_40444"
			this.contentTabs = new TabContainer({
				region: "center",
				id: "contentTabs",
				tabPosition: "top",
				"class": "centerPanel"
			});
			this.overlayNode = dom.byId("loadingOverlay");
			// create and add the BorderContainer edge regions
			this.treepane = new TreePane({
				splitter: true, 			
				region: "left",
				id: "leftCol" 
			});
			
			this.contentTop = new ContentPane({
					region: "top",
					"class": "edgePanel",
					content: ""
				})
				

			this.loginController = new LoginController();		
			this.loginDialog = new LoginDialog({controller: this.loginController});

			this.loginDialog.startup();
			this.loginDialog.show();

			this.errorDialog = new Dialog({
				'title' : "Error Message",
				'content' : "",
				'class' : "errorDialog",
				'closable' : true
			});
			
			this.errorDialog.startup();

			this.wf = new wf({
				title: "New Analysis",
				closable: false,
				selected:true,
				style:"width: 150px;",
				app:this,
			})

			
		},
        
        postCreate: function() {
			var self = this;
            this.inherited(arguments);
			this.addChild( this.contentTabs );
			this.addChild( this.treepane );
			this.addChild( this.contentTop );
			this.loginDialog.on("success", function( event ) { 
				self.accessToken = event['accessToken'];
				self.token_req = event['token_req'];
				self.wf.loadOrders()
			});			
			
			this.resize();

			this.wf.on("orders", function( orders ){
				nodes = [];
				nodes.push({"id":self.wf.job_chain, "name": self.wf.job_chain, "root": true}) ;
				array.forEach(orders['orders'], function(entry, i){
					nodes.push({
						"id": entry.orderId, 
						"name": entry.historyId,
						"startTime": entry.startTime, 
						"endTime": entry.endTime, 
						"state": entry.state["_text"],
						"parent" : self.wf.job_chain
					}) ;
				});
				self.treepane.loadTree( self.wf.job_chain, nodes );
			});			

			this.wf.on("login_error", function( message ) {
				self.loginDialog.set("message", message['message']);
				self.loginDialog.show();
			});	
			
			self.treepane.on('selected_order', function( order ) {
				if (order.parent == "/wf/wf"){
					self.wf.getOrder(order.id, order.name);
				}

			});	
			
			this.contentTabs.startup(); 
			this.contentTabs.addChild(this.wf);

            domStyle.set(this.overlayNode,'display','none');
			this.loginDialog.autoAuth('root', 'p0p01234')
		},
		
		loadOrder: function( order ){
			this.contentTabs.addChild(order);
			this.selectOrder(order);
		},
		
		selectOrder: function( order ){
			this.contentTabs.selectChild(order);
		},

		show_error: function( error_message ){
			this.errorDialog.set('content', error_message);
			this.errorDialog.show();
		},
		token_req: function(){
			this.loginController.token_req;
		},
    });    
});

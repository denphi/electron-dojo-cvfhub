define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/Evented",	
    "dijit/layout/TabContainer", 
	"./app/FileSaver.js",	
	"./app/wf/PAMFORMPane.js",
	"./app/wf/PAMRTMPane.js",
	"./app/wf/COMPROPane.js",
	"./app/wf/ResultsPane.js",
	"./app/wf/ReportPane.js",
    "dojo/_base/Deferred", 
	"dojo/request",	
	"dojo/json", 
	"dojox/widget/Standby",	
	"dojo/domReady!"
], function(
    declare,
    lang,
	Evented,
	TabContainer, 
	FileSaver,
	PAMFORMPane,	
	PAMRTMPane,	
	COMPROPane,	
	ResultsPane,
	ReportPane,
	Deferred, 
	request,
	JSON,
	Standby
) {
    return declare("wf", [TabContainer, Evented], {	
		token_req : undefined,
        constructor: function(/*Object*/ kwArgs) {
            lang.mixin(this, kwArgs);
			this.nested = true;
			this.tabPosition = "rigth-h";
			this.job_chain = "/wf/wf";
			this.pamformpane = new PAMFORMPane({
				title: "PAMFORM",
				style:"margin-left: 130px; border: 1px solid #759dc0 !important",
			});
			this.pamrtmpane = new PAMRTMPane({
				title:"PAMRTM",
				style:"margin-left: 130px; border: 1px solid #759dc0 !important",
			}); 
			this.compropane = new COMPROPane({
				title:"COMPRO",
				style:"margin-left: 130px; border: 1px solid #759dc0 !important",
			});
			this.resultspane = new ResultsPane({
				title:"RUN",
				style:"margin-left: 130px; border: 1px solid #759dc0 !important",
			});
		},
		
        postCreate: function() {
			var self = this;
			this.standby = new Standby({'target':this.domNode});						
			this.addChild(this.pamformpane);
			this.addChild(this.pamrtmpane);
			this.addChild(this.compropane);
			this.addChild(this.resultspane);
			this.resultspane.button.onClick = function(){
				self.createOrder( )
			}
        },
		
		createOrder: function( ){
			this.standby.show()
			var self = this;			
			if (self.app == undefined){
				self.emit("login_error", {'message':'App undefined'});
			} else {
				var data = {
					"jobschedulerId": self.app.jobschedulerId, 
					"orders": [{ 					
						"jobChain": self.job_chain, 
						"state": "100", 
						"endState" : "300",
						"params": [ 
							{"name" : "modulus", "value" : self.pamformpane.modulus.getValue()},
							{"name" : "bendingstiffness", "value" : self.pamformpane.bendingstiffness.getValue()},
							{"name" : "FORM_filename", "value" : self.pamformpane.FORM_filename.getValue()},
							{"name" : "inlet_temperature", "value" : self.pamrtmpane.inlet_temperature.getValue()},
							{"name" : "ambient_temperature", "value" : self.pamrtmpane.ambient_temperature.getValue()},
							{"name" : "inlet_pressure", "value" : self.pamrtmpane.inlet_pressure.getValue()},
						]
					}] 
				}
				var header_token = {
					"x-access-token": self.app.accessToken,
					"Accept": "application/json",
					"Content-Type": "application/json",
				}			
				var options = {
					"handleAs" : "json",
					"headers" : header_token,
					"method" : "POST",
					"data" : JSON.stringify(data)
				}
				var url = "http://localhost/jobscheduler/joc/api/orders/add"
				request(url, options).then(function(json_return){
					if (json_return['ok'] == true){
						setTimeout(lang.hitch(this, function() {
							self.emit("new_order", {'message':json_return['orders'][0]["orderId"]});
							self.loadOrders();
							this.standby.hide()	
						}), 1000);						
					} else {
						self.emit("login_error", {'message':json_return['message']});
						this.standby.hide()	
					}
				}, function(json_return){
					if (json_return['response']){			
						self.emit("login_error", {'message':json_return['response']['data']['message']});
					} else {
						self.emit("login_error", {'message':'Unexpected error'});
					}
					this.standby.hide()			
				});
			}
		},
		
		loadOrders: function( ){
			var self = this;						
			if (self.app == undefined){
				self.emit("login_error", {'message':'App undefined'});
			} else {
				var self = this;			
				var data = {
					"jobschedulerId": self.app.jobschedulerId, 
					"compact": true, 
					"orders": [{ 					
						"jobChain": self.job_chain
					}] 
				}
				var header_token = {
					"x-access-token": self.app.accessToken,
					"Accept": "application/json",
					"Content-Type": "application/json",
				}			
				var options = {
					"handleAs" : "json",
					"headers" : header_token,
					"method" : "POST",
					"data" : JSON.stringify(data)
				}
				var url = "http://localhost/jobscheduler/joc/api/orders/history"
				request(url, options).then(function(json_return){
					self.emit("orders", {'orders':json_return['history']});
				}, function(json_return){
					if (json_return['response']){			
						self.emit("login_error", {'message':json_return['response']['data']['message']});
					} else {
						self.emit("login_error", {'message':'Unexpected error'});
					}
				});
			}
		},		
		getOrder: function( order_id, order_history ){
			var self = this;	
			if (self.app == undefined){
				self.emit("login_error", {'message':'App undefined'});
			} else {
				var self = this;			
				var myWidget = dijit.byId(self.job_chain + "," + order_id);
				if (myWidget){
					self.app.selectOrder(myWidget);
					return;
				}
				var data = {
					"jobschedulerId" : self.app.jobschedulerId, 
					"historyId" : order_history,
					"orders": [{ 					
						"jobChain": self.job_chain,
						"orderId" : order_id,
					}]
				}
				var header_token = {
					"x-access-token": self.app.accessToken,
					"Accept": "application/json",
					"Content-Type": "application/json",
				}			
				var options = {
					"handleAs" : "json",
					"headers" : header_token,
					"method" : "POST",
					"data" : JSON.stringify(data)
				}
				var url = "http://localhost/jobscheduler/joc/api/audit_log "
				request(url, options).then(function(json_return){
					var tab = new ReportPane({
						'title' : self.job_chain + "(" + order_id + ")",
						'id' : self.job_chain + "," + order_id,
						'closable' : true,
						'disabled' : false,
						'style' : "width: 150px;",
					})
					if (json_return.auditLog && json_return.auditLog.length > 0){
						self.app.loadOrder(tab);
						var parameters = JSON.parse(json_return.auditLog[0].parameters);
						tab.loadParams(parameters['params']);
						self.getOrderLog(tab, order_id, order_history);
						self.getOrderFiles(tab, order_id, order_history);						
					} else {
						tab.destroyRecursive();
						self.app.show_error("This order does not have any history report")
					}
				}, function(json_return){
					if (json_return['response']){			
						self.emit("login_error", {'message':json_return['response']['data']['message']});
					} else {
						self.emit("login_error", {'message':'Unexpected error'});
					}
				});
			}
		},
		getOrderLog: function(report, order_id, order_history ){
			var self = this;	
			if (self.app == undefined){
				self.emit("login_error", {'message':'App undefined'});
			} else {
				var self = this;			
				var data = {
					"jobschedulerId" : self.app.jobschedulerId, 
					"jobChain": self.job_chain,
					"historyId" : order_history,
					"orderId" : order_id,
					"mime" : "HTML"
				}
				var header_token = {
					"x-access-token": self.app.accessToken,
					"Accept": "application/json",
					"Content-Type": "application/json",
				}			
				var options = {
					"handleAs" : "html",
					"headers" : header_token,
					"method" : "POST",
					"data" : JSON.stringify(data)
				}
				var url = "http://localhost/jobscheduler/joc/api/order/log "
				request(url, options).then(function(json_return){
					report.addLog(json_return);
				}, function(json_return){
					if (json_return['response']){			
						self.emit("login_error", {'message':json_return['response']['data']['message']});
					} else {
						self.emit("login_error", {'message':'Unexpected error'});
					}
				});
			}			
		},
		getOrderFiles: function(report, order_id, order_history ){
			var self = this;	
			if (self.app == undefined){
				self.emit("login_error", {'message':'App undefined'});
			} else {
				var self = this;			
				var data = {
					"jobschedulerId" : self.app.jobschedulerId, 
					"jobChain": self.job_chain,
					"historyId" : order_history,
					"orderId" : order_id
				}
				var header_token = {
					"Authorization": self.app.token_req,
					"Accept": "application/json",
					"Content-Type": "application/json"
				}						
				var options = {
					"handleAs" : "json",
					"headers" : header_token,
					"method" : "POST",
					"data" : JSON.stringify(data)
				}
				var url = "http://localhost/sessions/list_files"
				request(url, options).then(function(json_return){
					if (json_return){
						report.addFiles(json_return['files']);
						report.on("selected_file", function( message ) {
							var toLocalPath = path.resolve(app.getPath("downloads"))								
							//var userChosenPath = dialog.showSaveDialog({ defaultPath: toLocalPath });
							var userChosenPath = dialog.showOpenDialog({properties: ['openDirectory']});
							if(userChosenPath){
								var data_file = {
									"jobschedulerId" : self.app.jobschedulerId, 
									"jobChain": self.job_chain,
									"historyId" : order_history,
									"orderId" : order_id,
									"file" : message['file']
								}	
								var options_file = {
									"handleAs" : "blob",
									"headers" : header_token,
									"method" : "POST",
									"data" : JSON.stringify(data_file)
								}
								var url_file = "http://localhost/sessions/get_file";							
								console.log(userChosenPath);							
								var file_request = request(url_file, options_file);
								file_request.response.then(function(blob){
									var reader = new FileReader();
									reader.onload = function() {
										var buffer = Buffer.from(reader.result);
										var disposition = blob.getHeader('Content-Disposition');									
										var filename = 'data.dat'
										if (disposition && disposition.indexOf('attachment') !== -1) {
											var filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
											var matches = filenameRegex.exec(disposition);
											if (matches != null && matches[1]) { 
											  filename = matches[1].replace(/['"]/g, '');
											}
										}									
										var path = userChosenPath[0] + '/' + filename;
										fs.writeFile(path, buffer, {}, (err, res) => {
											if(err){
												console.error(err)
												return
											}
										})									

									}
									reader.readAsArrayBuffer(blob.data)
								});						
							}
						});	
					}						
				}, function(json_return){
					if (json_return['response']){			
						self.emit("login_error", {'message':json_return['response']['data']['message']});
					} else {
						self.emit("login_error", {'message':'Unexpected error'});
					}
				});
			}			
		}
		
    });    
});
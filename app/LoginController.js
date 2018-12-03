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
   return declare("LoginController", [], {
		authenticated : false,
        constructor: function(kwArgs) {
            lang.mixin(this, kwArgs);
        },
        
        login: function(data) {
			var self = this
			var user = data.username
			var pwd = data.password
			var token_req = "Basic " + btoa(user + ":" + pwd)
			var header_token = {
				"Authorization": token_req,
				"Accept": "application/json",
				"Content-Type": "application/json"
			}			
			var options = {
				"handleAs" : "json",
				"headers" : header_token,
				"method" : "POST"
			}
			var url = "http://localhost/jobscheduler/joc/api/security/login"
            var def = new Deferred();
			request(url, options).then(function(json_return){
				self.authenticated = false
				if (json_return['isAuthenticated'] == true){					
					def.resolve({'loginSuccess':true, 'message':'', 'accessToken':json_return['accessToken'], 'token_req':token_req});
					self.authenticated = true
				} else {
					deferred.progress(json_return['message']);				
					def.resolve({'loginSuccess':false, 'message':json_return['message']});					
				}
			}, function(json_return){
				self.authenticated = false
				if (json_return['response']){
					def.resolve({'loginSuccess':false, 'message':json_return['response']['data']['message']});					
				} else {
					def.resolve({'loginSuccess':false, 'message':'Unexpected error'});					
				}
			});
			return def;
        }
    });     
});	
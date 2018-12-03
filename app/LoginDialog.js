define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/on",
    "dojo/dom",
    "dojo/Evented",
    "dojo/_base/Deferred",
    "dojo/json",
    "dijit/_Widget",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "dijit/Dialog",
    "dijit/form/Form",
    "dijit/form/ValidationTextBox",
    "dijit/form/Button",
], function(
    declare,
    lang,
    on,
    dom,
    Evented,
    Deferred,
    JSON,        
    _Widget,
    _TemplatedMixin, 
    _WidgetsInTemplateMixin,        
     Dialog
) {

    return declare("LoginDialog", [Dialog, Evented], {        
        READY: 0,
        BUSY: 1,        
        title: "Login Dialog",
        message: "",
        busyLabel: "Working...",        
        attributeMap: lang.delegate(dijit._Widget.prototype.attributeMap, {
            message: {
                node: "messageNode",
                type: "innerHTML"               
            }            
        }),        
        constructor: function(/*Object*/ kwArgs) {
            lang.mixin(this, kwArgs);        
			this.closable = false
			this.class = "loginDialog"
            var dialogTemplate = `<div style="width:300px;">
				<div class="dijitDialogPaneContentArea"><div data-dojo-attach-point="contentNode">{form}</div></div> 
				<div class="dijitDialogPaneActionBar">
					<div class="message" data-dojo-attach-point="messageNode"></div>      
					<button data-dojo-type="dijit.form.Button" data-dojo-props="" data-dojo-attach-point="submitButton">OK</button>            
				</div>      
			</div>`; 
            var formTemplate = `<form data-dojo-type="dijit.form.Form" data-dojo-attach-point="form">      
				<table class="form">
					<tr><td>Username</td>
						<td>
							<input data-dojo-type="dijit.form.ValidationTextBox"
								data-dojo-props='
								name: "username",
								required: true,
								maxLength: 64,
								trim: true,
								style: "width: 200px;"
								'/>
						</td>
					</tr>
					
					<tr>
						<td>Password</td>
						<td>
							<input data-dojo-type="dijit.form.ValidationTextBox"
								type="password"
								data-dojo-props='
									name: "password",
									required: true,
									style: "width: 200px;"
									'
							/>
						</td>
					</tr>            
				</table>
			</form>`;
            var template = lang.replace(dialogTemplate, {
                form: formTemplate                
            });

            var contentWidget = new (declare(
                [_Widget, _TemplatedMixin, _WidgetsInTemplateMixin],
                {
                    templateString: template                   
                }
            )); 
            contentWidget.startup();
            var content = this.content = contentWidget;
            this.form = content.form;
            this.submitButton = content.submitButton;
            this.messageNode = content.messageNode;
        },
        
        postCreate: function() {
            this.inherited(arguments);
            
            this.readyState= this.READY;
            this.okLabel = this.submitButton.get("label");
            
            this.connect(this.submitButton, "onClick", "onSubmit");
            
            this.watch("readyState", lang.hitch(this, "_onReadyStateChange"));
            
            this.form.watch("state", lang.hitch(this, "_onValidStateChange"));
            this._onValidStateChange();
        },
        
        onSubmit: function() {
            this.set("readyState", this.BUSY);
            this.set("message", ""); 
            var data = this.form.get("value");
            
            var auth = this.controller.login(data);
            
            Deferred.when(auth, lang.hitch(this, function(loginSuccess) {
                if (loginSuccess['loginSuccess'] === true) {
                    this.onLoginSuccess(loginSuccess['message'], loginSuccess['accessToken'], loginSuccess['token_req']);
                    return;                    
                }
                this.onLoginError(loginSuccess['message']);
            }));
        },
		
		autoAuth: function(usr, pwd) {
            this.set("readyState", this.BUSY);
            this.set("message", ""); 
            var data = {"username":usr, "password":pwd}            
            var auth = this.controller.login(data);            
            Deferred.when(auth, lang.hitch(this, function(loginSuccess) {
                if (loginSuccess['loginSuccess'] === true) {
                    this.onLoginSuccess(loginSuccess['message'], loginSuccess['accessToken'], loginSuccess['token_req']);
                    return;                    
                }
                this.onLoginError(loginSuccess['message']);
            }));
        },
            
        onLoginSuccess: function( message, accessToken, token_req ) {
            this.set("readyState", this.READY);
            this.set("message", message + ". Login sucessful.");
            this.emit("success", {"accessToken":accessToken, "token_req":token_req});
			this.hide();
        },
        
        onLoginError: function( message ) {
            this.set("readyState", this.READY);
            this.set("message", message + ". Please try again.");
            this.emit("error");         
        },
        
        _onValidStateChange: function() {
            this.submitButton.set("disabled", !!this.form.get("state").length);
        },

        _onReadyStateChange: function() {
            var isBusy = this.get("readyState") == this.BUSY;
            this.submitButton.set("label", isBusy ? this.busyLabel : this.okLabel);
            this.submitButton.set("disabled", isBusy);
        },	
		
		_onKey : function() { 
			//Disable the escape key by overwriting its parent method
		}
    });     
});
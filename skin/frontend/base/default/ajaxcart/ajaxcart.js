var ajaxcart = {
    g: new Growler(),
    initialize: function() {
        this.g = new Growler();		
        this.bindEvents();
    },
    bindEvents: function () {
        this.addSubmitEvent();

        $$('a[href*="/checkout/cart/delete/"]').each(function(e){
            $(e).observe('click', function(event){
                setLocation($(e).readAttribute('href'));
                Event.stop(event);
            });
        });
    },
    ajaxCartSubmit: function (obj) {
        var _this = this;
        if(Modalbox !== 'undefined' && Modalbox.initialized)Modalbox.hide();

        try {
            if(typeof obj == 'string') {
                var url = obj;

                new Ajax.Request(url, {
                    onCreate	: function() {
                        _this.g.warn("Processing", {
                            life: 5
                        });
                    },
                    onSuccess	: function(response) {
                        // Handle the response content...
                        try{
                            var res = response.responseText.evalJSON();
                            if(res) {
                                //check for group product's option
                                if(res.configurable_options_block) {
                                    if(res.r == 'success') {
                                        //show group product options block
                                        _this.showPopup(res.configurable_options_block);
                                    } else {
                                        if(typeof res.messages != 'undefined') {
                                            _this.showError(res.messages);
                                        } else {
                                            _this.showError("Something bad happened");
                                        }
                                    }
                                } else {
                                    if(res.r == 'success') {
                                        if(res.message) {
                                            _this.showSuccess(res.message);
                                        } else {
                                            _this.showSuccess('Item was added into cart.');
                                        }

                                        //update all blocks here
                                        _this.updateBlocks(res.update_blocks);

                                    } else {
                                        if(typeof res.messages != 'undefined') {
                                            _this.showError(res.messages);
                                        } else {
                                            _this.showError("Something bad happened");
                                        }
                                    }
                                }
                            } else {
                                document.location.reload(true);
                            }
                        } catch(e) {
                        //window.location.href = url;
                        //document.location.reload(true);
                        }
                    }
                });
            } else {
                if(typeof obj.form.down('input[type=file]') != 'undefined') {

                    //use iframe

                    obj.form.insert('<iframe id="upload_target" name="upload_target" src="" style="width:0;height:0;border:0px solid #fff;"></iframe>');

                    var iframe = $('upload_target');
                    iframe.observe('load', function(){
                        // Handle the response content...
                        try{
                            var doc = iframe.contentDocument ? iframe.contentDocument : (iframe.contentWindow.document || iframe.document);
                            console.log(doc);
                            var res = doc.body.innerText ? doc.body.innerText : doc.body.textContent;
                            res = res.evalJSON();

                            if(res) {
                                if(res.r == 'success') {
                                    if(res.message) {
                                        _this.showSuccess(res.message);
                                    } else {
                                        _this.showSuccess('Item was added into cart.');
                                    }

                                    //update all blocks here
                                    _this.updateBlocks(res.update_blocks);

                                } else {
                                    if(typeof res.messages != 'undefined') {
                                        _this.showError(res.messages);
                                    } else {
                                        _this.showError("Something bad happened");
                                    }
                                }
                            } else {
                                _this.showError("Something bad happened");
                            }
                        } catch(e) {
                            console.log(e);
                            _this.showError("Something bad happened");
                        }
                    });

                    obj.form.target = 'upload_target';

                    //show loading
                    _this.g.warn("Processing", {
                        life: 5
                    });

                    obj.form.submit();
                    return true;

                } else {
                    //use ajax

                    var url	 = 	obj.form.action,
                    data =	obj.form.serialize();

                    new Ajax.Request(url, {
                        method		: 'post',
                        postBody	: data,
                        onCreate	: function() {
                            _this.g.warn("Processing", {
                                life: 5
                            });
                        },
                        onSuccess	: function(response) {
                            // Handle the response content...
                            try{
                                var res = response.responseText.evalJSON();

                                if(res) {
                                    if(res.r == 'success') {
                                        if(res.message) {
                                            _this.showSuccess(res.message);
                                        } else {
                                            _this.showSuccess('Item was added into cart.');
                                        }

                                        //update all blocks here
                                        _this.updateBlocks(res.update_blocks);

                                    } else {
                                        if(typeof res.messages != 'undefined') {
                                            _this.showError(res.messages);
                                        } else {
                                            _this.showError("Something bad happened");
                                        }
                                    }
                                } else {
                                    _this.showError("Something bad happened");
                                }
                            } catch(e) {
                                console.log(e);
                                _this.showError("Something bad happened");
                            }
                        }
                    });
                }
            }
        } catch(e) {
            console.log(e);
            if(typeof obj == 'string') {
                window.location.href = obj;
            } else {
                document.location.reload(true);
            }
        }
    },
    
    getConfigurableOptions: function(url) {
        var _this = this;
        new Ajax.Request(url, {
            onCreate	: function() {
                _this.g.warn("Processing", {
                    life: 5
                });
            },
            onSuccess	: function(response) {
                // Handle the response content...
                try{
                    var res = response.responseText.evalJSON();
                    if(res) {
                        if(res.r == 'success') {
                            
                            //show configurable options popup
                            _this.showPopup(res.configurable_options_block);

                        } else {
                            if(typeof res.messages != 'undefined') {
                                _this.showError(res.messages);
                            } else {
                                _this.showError("Something bad happened");
                            }
                        }
                    } else {
                        document.location.reload(true);
                    }
                } catch(e) {
                window.location.href = url;
                //document.location.reload(true);
                }
            }
        });
    },

    showSuccess: function(message) {
        this.g.info(message, {
            life: 5
        });
    },

    showError: function (error) {
        var _this = this;

        if(typeof error == 'string') {
            _this.g.error(error, {
                life: 5
            });
        } else {
            error.each(function(message){
                _this.g.error(message, {
                    life: 5
                });
            });
        }
    },

    addSubmitEvent: function () {

        if(typeof productAddToCartForm != 'undefined') {
            var _this = this;
            productAddToCartForm.submit = function(url){
                if(this.validator && this.validator.validate()){
                    _this.ajaxCartSubmit(this);
                }
                return false;
            }

            productAddToCartForm.form.onsubmit = function() {
                productAddToCartForm.submit();
                return false;
            };
        }
    },

    updateBlocks: function(blocks) {
        var _this = this;

        if(blocks) {
            try{
                blocks.each(function(block){
                    if(block.key) {
                        var dom_selector = block.key;
                        if($$(dom_selector)) {
                            $$(dom_selector).each(function(e){
                                $(e).replace(block.value);
                            });
                        }
                    }
                });
                _this.bindEvents();

                // show details tooltip
                truncateOptions();
            } catch(e) {
                console.log(e);
            }
        }

    },
    
    showPopup: function(block) {
        try {
            var _this = this;
            //$$('body')[0].insert({bottom: new Element('div', {id: 'modalboxOptions'}).update(block)});
            var element = new Element('div', {
                id: 'modalboxOptions'
            }).update(block);
            
            var viewport = document.viewport.getDimensions();
            Modalbox.show(element,
            {
                title: 'Please Select Options', 
                width: 510,
                height: viewport.height,
                afterLoad: function() {
                    _this.extractScripts(block);
                    _this.bindEvents();
                }
            });
        } catch(e) {
            console.log(e)
        }
    },
    
    extractScripts: function(strings) {
        var scripts = strings.extractScripts();
        scripts.each(function(script){
            try {
                eval(script.replace(/var /gi, ""));
            }
            catch(e){
                console.log(e);
            }
        });
    }

};

var oldSetLocation = setLocation;
var setLocation = (function() {
    return function(url){
        if( url.search('checkout/cart/add') != -1 ) {
            //its simple/group/downloadable product
            ajaxcart.ajaxCartSubmit(url);
        } else if( url.search('checkout/cart/delete') != -1 ) {
            ajaxcart.ajaxCartSubmit(url);
        } else if( url.search('options=cart') != -1 ) {
            //its configurable/bundle product
            url += '&ajax=true';
            ajaxcart.getConfigurableOptions(url);
        } else {
            oldSetLocation(url);
        }
    };
})();

setPLocation = setLocation;

document.observe("dom:loaded", function() {
    ajaxcart.initialize();
});
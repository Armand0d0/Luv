browser.runtime.onMessage.addListener(function(request, sender, callback) {
    if(request === "inject"){
    
	        browser.tabs.query( {active:true,currentWindow:true}).then(function(tabs){
	        var tab = null;
	            if(sender.tab != null){
	                tab =  sender.tab.id;
	            }else if(tabs != null && tabs.length > 0){
	                tab = tabs[0].id;
	            }
	            if(tab == null){
	                console.log("tab is null");
	                return;
	            }
                browser.tabs.executeScript(tab , {
                   code: ''
                 }
                
                ,function() {
                    browser.tabs.executeScript(tab, {
		                file: 'inject.js',
		                runAt: 'document_end'
		            });
	            });   
            });
	    
    }
});


browser.runtime.onMessage.addListener(function(request, sender, callback) {
    if(request === "inject"){
        if(sender.tab != null){
            browser.tabs.executeScript(sender.tab.id , {
		            file: 'inject.js',
		            runAt: 'document_end'
	            });
	    }else{
	        browser.tabs.query( {active:true,currentWindow:true}).then(function(tabs){
                browser.tabs.executeScript(tabs[0].id , {
		            file: 'inject.js',
		            runAt: 'document_end'
	            });   
            });
	    }
    }
});


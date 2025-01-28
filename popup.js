document.getElementById("clickMe").addEventListener("click", () => {
    browser.tabs.query({active:true,currentWindow:true}).then(function(tabs){
      browser.tabs.executeScript(tabs[0].id, {
		    file: 'inject.js',
		    runAt: 'document_end'
	    });

        //var currentTabUrl = tabs[0].url;
    });

});

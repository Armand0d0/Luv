console.log("running background script !");



browser.runtime.onMessage.addListener(function (message, sender, sendResponse) {
	if (message === "inject") {

		browser.tabs.query({ active: true, currentWindow: true }).then(function (tabs) {
			var tab = null;
			if (sender.tab != null) {
				tab = sender.tab.id;
			} else if (tabs != null && tabs.length > 0) {
				tab = tabs[0].id;
			}
			if (tab == null) {
				console.log("tab is null");
				return;
			}
			
			browser.tabs.executeScript(tab, {
				code: '',
				runAt: 'document_end'

			}
				, function () {
					browser.tabs.executeScript(tab, {
						file: 'inject.js',
						runAt: 'document_end'
					});
				});
		});

	}else if(message.request === "getLuvWordInfo"){
		db.transaction(["words"], "readonly").objectStore("words")
		.get(message.word).onsuccess = (event) => {
			  sendResponse(event.target.result);
		};

	}else if(db != undefined && message.request === "setLuvWordInfo"){
		const wordsObjectStore = db.transaction(["words"], "readwrite").objectStore("words");
		const request = wordsObjectStore.put(message.wordInfo);
		request.onerror = (event) => {
			console.error("db update request error : " , event);
	 	};

	} else {
		console.log("unknown message recieved !");
	}
	return true;
});

let db;
const request = indexedDB.open("LuvDatabase");
request.onerror = (event) => {
	console.error("error in db request");
};
request.onsuccess = (event) => {
	db = event.target.result;	
	
};
request.onupgradeneeded = (event) => {
	db = event.target.result;
	db.onerror = (event) => {
		console.error(`Database error: ${event.target.error?.message}`);
	};
	console.log("datbase upgrade");
	const objectStore = db.createObjectStore("words", { keyPath: "word" });

};


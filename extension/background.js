function withDependencies(cb, code) {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
  	chrome.tabs.executeScript(tabs[0].id, {code: code}, function(result) {
	    if (!result[0]) {
	    	console.log("LOADING EVERYTHING");
	      chrome.tabs.insertCSS(tabs[0].id, {file:"mystyles.css"}, function(){
		  	  chrome.tabs.insertCSS(tabs[0].id, {file:"third-party/jquery-ui-1.12.1.custom/jquery-ui.min.css"}, function(){
		  	  	chrome.tabs.executeScript(tabs[0].id, {file:"third-party/jquery-1.12.0.min.js"}, function(){
		  	  	  chrome.tabs.executeScript(tabs[0].id, {file:"third-party/jquery-ui-1.12.1.custom/jquery-ui.min.js"}, function(){
		  	  	  	addedDependencies = true;
		  	  	  	cb(tabs[0].id);
		  	  	  });
		  	  	});
		  	  });
		  });
  	    } else {
  		  cb(tabs[0].id);
  	    }
	});
  });
}

chrome.browserAction.onClicked.addListener(function(tab) {
  withDependencies(function(id) {
  	chrome.tabs.executeScript(id, {file:"myscript.js"});
  }, "window.emojiPetDependenciesLoaded");
});
chrome.browserAction.onClicked.addListener(function(tab) {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
  	  chrome.tabs.insertCSS(tabs[0].id, {file:"mystyles.css"}, function(){
  	  	chrome.tabs.executeScript(tabs[0].id, {file:"third-party/jquery-1.12.0.min.js"}, function(){
  	  		chrome.tabs.executeScript(tabs[0].id, {file:"myscript.js"})
  	  	});
  	  });
	});
});
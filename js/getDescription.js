window.onload = function() {
    chrome.runtime.onMessage.addListener(function(msg, _, sendResponse) {
        console.log('onMessage', msg);
        if (msg.greeting == "hello") {
            sendResponse({farewell: "goodbye"});
        } else{
           sendResponse({});
        }
    });
};
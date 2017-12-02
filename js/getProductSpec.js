var data;

chrome.runtime.onMessage.addListener((request, sender, sendResponse)=> {
    //console.log('"'+request.greeting+'"', sender.tab ? "from a content script:" + sender.tab.url : "from the extension");
    data = request.data
    console.log(data);
    if (request.greeting == "hello")
      sendResponse({farewell: "goodbye"});
});
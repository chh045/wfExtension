document.addEventListener('DOMContentLoaded', function() {

    var data;
    var pos = [];
    var LTL = [];
    var UPS = [];
    readTextFile("../productSpec/productSpecSheet.json", function(text){
        // console.log(text);
        var data = JSON.parse(text);
        console.log(data);
        // sendDataToTab(data);


        // runScriptInActiveTab('js/getProductSpec.js');
    });

    //sendMessageToActiveTab();


    var uploadCRWButton = document.getElementById('upload-CRW');
    uploadCRWButton.addEventListener('click', ()=>{
        var myFile = $('#fileinput').prop('files')[0];
        // var fileToLoad = $('#fileinput').files;
        var fileReader = new FileReader();
        fileReader.onload = (fileLoadedEvent)=>{
            // console.log(fileLoadedEvent.target.result);
            var textFromFileLoaded = fileLoadedEvent.target.result;

            var lines = fileLoadedEvent.target.result.split('\n');
            lines.forEach((line)=>{
                pos.push(line.trim());
            });
            // sendDataToTab(pos);

            // runScriptInActiveTab('js/.js');

            $('#check-UPS').prop('disabled', false);
            $('#check-LTL').prop('disabled', false);

        }
        fileReader.readAsText(myFile, "UTF-8");
    });

    var checkUPSButton = document.getElementById('check-UPS');
    checkUPSButton.addEventListener('click', ()=>{


        sendDataToTab(pos, (response)=>{
            if(response.foundPOs !== undefined){
                // console.log(response.foundPOs);
                UPS = response.foundPOs;
                $('#download-UPS').prop('disabled', false);
            }
        });


        runScriptInActiveTab('js/getUPSPOs.js');
    });

    var checkLTLButton = document.getElementById('check-LTL');
    checkLTLButton.addEventListener('click', ()=>{
    
        sendDataToTab(pos, (response)=>{
            if(response.foundPOs !== undefined){
                // console.log(response.foundPOs);
                LTL = response.foundPOs;
                $('#download-LTL').prop('disabled', false);
            }
        });
        runScriptInActiveTab('js/getLTLPOs.js');

  });

    var downloadLTLButton = document.getElementById('download-LTL');
    downloadLTLButton.addEventListener('click', ()=>{
        exportFile(LTL);
    });

    var testButton = $("#test");
    testButton.on('click', ()=>{
        console.log("I clicked test!");
        recieveMessageByActiveTab();
    });
});



    function readTextFile(file, callback) {
        var rawFile = new XMLHttpRequest();
        rawFile.overrideMimeType("application/json");
        rawFile.open("GET", file, true);
        rawFile.onreadystatechange = function() {
            if (rawFile.readyState === 4 && rawFile.status == "200") {
                callback(rawFile.responseText);
            }
        }
        rawFile.send(null);
    }



    function sendDataToTab(data, callback){
        chrome.tabs.query({active: true, currentWindow: true}, (tabs)=>{
            chrome.tabs.sendMessage(tabs[0].id, {data: data}, callback
            //     (response)=>{
            //     console.log("son of bitch:", response);
            // }
            );
        });
        // runScriptInActiveTab("js/getMessage.js");
    }    


    function sendMessageToActiveTab(){
        // chrome.tabs.query({active: true, currentWindow: true}, (tabs)=>{
        //     chrome.tabs.sendMessage(tabs[0].id, {greeting: "bitch, be humble"}, (response)=>{
        //         console.log(response);
        //     });
        // });
        console.log("why??");

        var port = chrome.runtime.connect({name: "knockknock"});
        port.postMessage({joke: "Knock knock"});

        console.log("send from port: ", port);
        console.log("chrome.runtime.Port: ", chrome.runtime.Port);

        port.onMessage.addListener(function(msg) {
            console.log("msg content: ", msg);
            if (msg.question == "Who's there?")
                port.postMessage({answer: "Madame"});
            else if (msg.question == "Madame who?")
                port.postMessage({answer: "Madame... Bovary"});
        });

        console.log("send: ", chrome.runtime);
    }

    // this code is run in the tab, not in popup!
    function recieveMessageByActiveTab(){
        // var data;
        // chrome.runtime.onMessage.addListener((request, sender, sendResponse)=> {
        //     data = request.data
        //     console.log(data);
        // });
        console.log("recieve:", chrome.runtime);
        chrome.runtime.onConnect.addListener(function(port) {
            console.log("recieve:", port);
          console.assert(port.name == "knockknock");
          // console.log("recieve:", port);
          port.onMessage.addListener(function(msg) {
            console.log(msg);
            if (msg.joke == "Knock knock"){
              port.postMessage({question: "Who's there?"});
            }
            else if (msg.answer == "Madame"){
              port.postMessage({question: "Madame who?"});
            }
            else if (msg.answer == "Madame... Bovary"){
              port.postMessage({question: "I don't get it."});
            }
        });
});
    }


    function runCodeInActiveTab(code) {
        chrome.tabs.executeScript({
            code: code
        }, (result) =>{
            console.log("code injected successfully.");
        });
    }

    function runScriptInActiveTab(scriptFile){
        chrome.tabs.executeScript({
            file: scriptFile
            //code: 'jQuery(document)'
        }, (result) => {
            console.log('Popup script');
        });
    }



    function modifyDOM() {
        //You can play with your DOM here or check URL against your regex
        console.log('Tab script:');
        console.log(document.body);
        return document.body.innerHTML;
    }

    //We have permission to access the activeTab, so we can call chrome.tabs.executeScript:
    function getDOMFromActiveTab(){
        chrome.tabs.executeScript({
            code: '(' + modifyDOM + ')();' //argument here is a string but function.toString() returns function's code
        }, (results) => {
            //Here we have just the innerHTML and not DOM structure
            console.log('Popup script:', results)
            //console.log(results[0]);
        });
    }

    //exportFile();
    function exportFile(content) {
        console.log(content);
        
        downloadFileFromText('download.xls',content.map(line => line+'\n'));
    }

    function downloadFileFromText(filename, content) {
        var a = document.createElement('a');
        var blob = new Blob(content, {type : "text/plain;charset=UTF-8"});
        a.href = window.URL.createObjectURL(blob);
        a.download = filename;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click(); //this is probably the key - simulating a click on a download link
        delete a;// we don't need this anymore
    }





$(function() {

  // We can attach the `fileselect` event to all file inputs on the page
  $(document).on('change', ':file', function() {
    var input = $(this),
        numFiles = input.get(0).files ? input.get(0).files.length : 1,
        label = input.val().replace(/\\/g, '/').replace(/.*\//, '');
    input.trigger('fileselect', [numFiles, label]);
  });

  // We can watch for our custom `fileselect` event like this
  $(document).ready( function() {
      $(':file').on('fileselect', function(event, numFiles, label) {


        console.log("numFiles:", numFiles);

          var input = $(this).parents('.input-group').find(':text'),
              log = numFiles > 1 ? numFiles + ' files selected' : label;


          if( input.length ) {
              input.val(log);
          } else {
              if( log ) alert(log);
          }

      });
    });
});
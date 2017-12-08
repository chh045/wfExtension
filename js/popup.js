document.addEventListener('DOMContentLoaded', function() {

    var dimension;
    var pos = {};
    var LTL;
    var UPS;
    readTextFile("../productSpec/productSpecSheet.json", function(text){
        // console.log(text);
        dimension = JSON.parse(text);
        console.log(dimension);
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
                // line.split(/ */);
                var po_so = line.trim().split(/\s+/);
                pos[po_so[0]] = po_so[1];
                // console.log(line, line.split(/\s+/));
                // pos.push(line.trim());
            });
            // sendDataToTab(pos);
            console.log(pos);
            // runScriptInActiveTab('js/.js');

            $('#check-UPS').prop('disabled', false);
            $('#check-LTL').prop('disabled', false);
            $('#check-dimension').prop('disabled', false);

        }
        fileReader.readAsText(myFile, "UTF-8");
        // fileReader.readAsText(myFile);
    });

    var checkUPSButton = document.getElementById('check-UPS');
    checkUPSButton.addEventListener('click', ()=>{


        sendDataToTab({data:pos}, (response)=>{
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
    
        sendDataToTab({data:pos}, (response)=>{
            if(response.foundPOs !== undefined){
                console.log(response.foundPOs);
                LTL = response.foundPOs;
                $('#download-LTL').prop('disabled', false);
            }
        });
        runScriptInActiveTab('js/getLTLPOs.js');

  });

    var downloadLTLButton = document.getElementById('download-LTL');
    downloadLTLButton.addEventListener('click', ()=>{
        exportFile("download_LTL_PO", LTL);
    });

    var downloadUPSButton = $('#download-UPS');
    downloadUPSButton.on('click', ()=>{
        exportFile("download_UPS_PO", UPS);
    });


    var checkDimensionButton = $('#check-dimension');
    checkDimensionButton.on('click', ()=>{
        console.log("I clicked checkDimensionButton");
        console.log(dimension);
        sendDataToTab({
            dict: dimension,
            pos: pos
        });
        runScriptInActiveTab('js/checkDimension.js');
    });


    var testButton = $("#test");
    testButton.on('click', ()=>{
        console.log("I clicked test!");
        // recieveMessageByActiveTab();
        runScriptInActiveTab('js/date.js');
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
            chrome.tabs.sendMessage(tabs[0].id, data, callback);
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
            console.log("code injected successfully.", result);
        });
    }

    function runScriptInActiveTab(scriptFile){
        chrome.tabs.executeScript({
            file: scriptFile
            //code: 'jQuery(document)'
        }, (result) => {
            console.log('Popup script', result);
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
    function exportFile(filename, content) {

        // console.log(typeof(content));
        var flatContent = ["oe_po_no\tord_no\tpage\t"], 
            line, 
            unsorted = {};
        content.forEach((po_so, p)=>{
            line = po_so[0] + '\t' + po_so[1] + '\t' + String(p+1);

            // console.log(line);
            if(po_so.length === 3){
                line = line + '\t' + po_so[2];
            }
            // console.log(line);
            unsorted[po_so[1]] = [line+'\n', (p+1)];
            // flatContent.push(line + '\n');
        });
        line = "";
        var sorted = sortObject(unsorted);
        for (e in sorted){
            // console.log(e);
            flatContent.push(sorted[e][0]);
            line += sorted[e][1]+','
        }

        // sortObject(sorted).forEach((e)=>{
        //     // console.log(e[0]);
        //     flatContent.push(e[0]);
        //     line += e[1]+','
        // });
        flatContent[0] += line.slice(0, -1) + '\n';
        // downloadFileFromText('download.xls',content.map(line => line+'\n'));
        downloadFileFromText(filename+'.xls', flatContent);
    }

    function sortObject(obj){
        var sorted = {};
        Object.keys(obj).sort().forEach((key)=>{
            // console.log(key);
            sorted[key] = obj[key];
        });
        return sorted;
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

        // TODO:
        $('#upload-CRW').prop('disabled', false);

          if( input.length ) {
              input.val(log);
          } else {
              if( log ) alert(log);
          }

      });
    });
});
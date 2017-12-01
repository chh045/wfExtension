document.addEventListener('DOMContentLoaded', function() {

    var data;
    readTextFile("../productSpec/productSpecSheet.json", function(text){
        // console.log(text);
        var data = JSON.parse(text);
        console.log(data);
        sendDataToTab(data);
    });

    sendMessageToActiveTab();

    var checkUPSButton = document.getElementById('check-UPS');
    checkUPSButton.addEventListener('click', ()=>{

        runScriptInActiveTab('js/getUPSPOs.js');
    })

    var checkLTLButton = document.getElementById('check-LTL');
    checkLTLButton.addEventListener('click', ()=>{
    

        //sendMessageToActiveTab();

        runScriptInActiveTab('js/getLTLPOs.js');
        //runCodeInActiveTab();

        // var data = JSON.parse(data);
        // console.log(data["items"][0]);


  }, false);
}, false);



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

    //usage:


    function sendDataToTab(data){
        chrome.tabs.query({active: true, currentWindow: true}, (tabs)=>{
            chrome.tabs.sendMessage(tabs[0].id, {data: data}, (response)=>{
                console.log(response);
            });
        });
    }    


    function sendMessageToActiveTab(){

        chrome.tabs.query({active: true, currentWindow: true}, (tabs)=>{
            chrome.tabs.sendMessage(tabs[0].id, {greeting: "bitch, be humble"}, (response)=>{
                console.log(response.farewell);
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

    //exportInputs();
    function exportInputs() {
        downloadFileFromText('asshole.csv',['dummy content!!\n', 'bitch\n', 'asshole\n'])
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
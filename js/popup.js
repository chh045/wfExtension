document.addEventListener('DOMContentLoaded', function() {

    var data;
    readTextFile("../productSpec/productSpecSheet.json", function(text){
        // console.log(text);
        var data = JSON.parse(text);
        console.log(data);
        sendDataToTab(data);
        runScriptInActiveTab('js/getProductSpec.js');
    });

    sendMessageToActiveTab();


    var uploadCRWButton = document.getElementById('upload-CRW');
    uploadCRWButton.addEventListener('click', ()=>{
        var myFile = $('#fileinput').prop('files')[0];
        // var fileToLoad = $('#fileinput').files;
        var fileReader = new FileReader();
        fileReader.onload = (fileLoadedEvent)=>{
            var textFromFileLoaded = fileLoadedEvent.target.result;
            console.log(textFromFileLoaded);
        }
        fileReader.readAsText(myFile, "UTF-8");
        // console.log(fileToLoad);
        // console.log(myFile);

        // handleFileSelect();

        function handleFileSelect(){
            if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
                alert('The File APIs are not fully supported in this browser.');
                return;
            }
            var input = document.getElementById('fileinput');
            if (!input) {
              alert("Um, couldn't find the fileinput element.");
            }
            else if (!input.files) {
              alert("This browser doesn't seem to support the `files` property of file inputs.");
            }
            else if (!input.files[0]) {
              alert("Please select a file before clicking 'Load'");               
            }
            else {
              var file = input.files[0];
              var fr = new FileReader();
              //fr.onload = receivedText;
              fr.onload = $('#editor').append(document.createTextNode(fr.result));
              //fr.readAsText(file);
              fr.readAsDataURL(file);
              console.log(file);
              console.log(fr);
            }
        }
        function receivedText() {
            document.getElementById('editor').appendChild(document.createTextNode(fr.result));
        }   
    });

    var checkUPSButton = document.getElementById('check-UPS');
    checkUPSButton.addEventListener('click', ()=>{

        runScriptInActiveTab('js/getUPSPOs.js');
    });

    var checkLTLButton = document.getElementById('check-LTL');
    checkLTLButton.addEventListener('click', ()=>{
    
        runScriptInActiveTab('js/getLTLPOs.js');
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
                console.log(response);
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
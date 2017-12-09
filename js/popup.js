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
            if(response.result !== undefined){
                // console.log(response.foundPOs);
                UPS = response.result;
                $('#download-UPS').prop('disabled', false);
            }
        });


        runScriptInActiveTab('js/getUPSPOs.js');
    });

    var checkLTLButton = document.getElementById('check-LTL');
    checkLTLButton.addEventListener('click', ()=>{
    
        sendDataToTab({
                dict: dimension,
                pos: pos
            }, (response)=>{
                if(response.result !== undefined){
                    // console.log(response.foundPOs);
                    LTL = response.result;
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

    $('#online2pdf').on('click', ()=>{
        var url = "https://online2pdf.com/rearrange-pdf-pages-and-change-page-order";
        chrome.tabs.create({url:url});
    });


    var testButton = $("#test");
    testButton.on('click', ()=>{
        console.log("I clicked test!");
        // recieveMessageByActiveTab();
        runScriptInActiveTab('js/date.js');
    });

});


    function sendDataToTab(data, callback){
        chrome.tabs.query({active: true, currentWindow: true}, (tabs)=>{
            chrome.tabs.sendMessage(tabs[0].id, data, callback);
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
        }, (result) => {
            console.log(result);
        });
    }

    function exportFile(filename, content) {
        var flatContent = ["oe_po_no\tord_no\tpage\t"], 
            line, 
            unsorted = {};
        content.forEach((po_so, p)=>{
            line = "";
            for(var i = 0; i < po_so.length; i++){
                line += po_so[i] + '\t';
                if(i==1)
                    line += String(p+1) +'\t';
            }
            unsorted[po_so[1]] = [line+'\n', (p+1)];
        });
        line = "";
        var sorted = sortObject(unsorted);
        for (e in sorted){
            flatContent.push(sorted[e][0]);
            line += sorted[e][1]+','
        }
        flatContent[0] += line.slice(0, -1) + '\n';
        downloadFileFromText(filename+'.xls', flatContent);
    }

    function sortObject(obj){
        var sorted = {};
        Object.keys(obj).sort().forEach((key)=>{
            sorted[key] = obj[key];
        });
        return sorted;
    }

    function readTextFile(filename, callback) {
        var rawFile = new XMLHttpRequest();
        rawFile.overrideMimeType("application/json");
        rawFile.open("GET", filename, true);
        rawFile.onreadystatechange = function() {
            if (rawFile.readyState === 4 && rawFile.status == "200") {
                callback(rawFile.responseText);
            }
        }
        rawFile.send(null);
    }

    function downloadFileFromText(filename, content) {
        var a = document.createElement('a');
        var blob = new Blob(content, {type : "text/plain;charset=UTF-8"});
        a.href = window.URL.createObjectURL(blob);
        a.download = filename;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        delete a;
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
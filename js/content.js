$(document).ready(()=>{
    var dimension, 
    LTL, UPS,
    pos = {},
    sendDataToTab = function(data, callback){
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
            chrome.tabs.sendMessage(tabs[0].id, data, callback);
        });
    },
    runCodeInActiveTab = function(code){
        chrome.tabs.executeScript({
            code: code
        }, (result) =>{
            console.log("code injected successfully.", result);
        });
    },
    runScriptInActiveTab = function(scriptFile){
        chrome.tabs.executeScript({
            file: scriptFile
        }, (result) => {
            console.log(result);
        });
    },
    exportFile = function(filename, content){
        var flatContent = ["oe_po_no\tord_no\tpage\t"], 
            line, 
            unsorted = {};
        content.forEach((po_so, p)=>{
            line = "";
            for(var i = 0; i < po_so.length; i++){
                line += po_so[i] + '\t';
                if(i==1){
                    line += String(p+1) +'\t';
                }
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
    },
    sortObject = function(obj){
        var sorted = {};
        Object.keys(obj).sort().forEach((key)=>{
            sorted[key] = obj[key];
        });
        return sorted;
    },
    readTextFile = function(filename, callback){
        var rawFile = new XMLHttpRequest();
        rawFile.overrideMimeType("application/json");
        rawFile.open("GET", filename, true);
        rawFile.onreadystatechange = function() {
            if (rawFile.readyState === 4 && rawFile.status == "200") {
                callback(rawFile.responseText);
            }
        }
        rawFile.send(null);
    },
    downloadFileFromText = function(filename, content){
        var a = document.createElement('a');
        var blob = new Blob(content, {type : "text/plain;charset=UTF-8"});
        a.href = window.URL.createObjectURL(blob);
        a.download = filename;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        delete a;
    }

    readTextFile("../src/productSpecSheet.json", function(text){
        dimension = JSON.parse(text);
        console.log(dimension)
    });

    $(document).on('change', ':file', function(){
        var input = $(this),
            numFiles = input.get(0).files ? input.get(0).files.length : 1,
            label = input.val().replace(/\\/g, '/').replace(/.*\//, '');
        input.trigger('fileselect', [numFiles, label]);
    });

    $(':file').on('fileselect', function(event, numFiles, label) {
        var input = $(this).parents('.input-group').find(':text'),
            log = numFiles > 1 ? numFiles + ' files selected' : label;
        $('#upload-CRW').prop('disabled', false);
        if(input.length){
            input.val(log); 
        }
        else if(log){
            alert(log);
        }
    });

    $('#upload-CRW').on('click', function(){
        var myFile = $('#fileinput').prop('files')[0];
        var fileReader = new FileReader();
        fileReader.onload = (fileLoadedEvent)=>{
            var textFromFileLoaded = fileLoadedEvent.target.result;
            var lines = fileLoadedEvent.target.result.split('\n');
            lines.forEach((line)=>{
                var po_so = line.trim().split(/\s+/);
                pos[po_so[0]] = po_so[1];
            });
            $('#check-UPS').prop('disabled', false);
            $('#check-LTL').prop('disabled', false);
            $('#check-dimension').prop('disabled', false);
        }
        fileReader.readAsText(myFile);
    });

    $('#check-UPS').on('click', function(){
        sendDataToTab({data:pos}, (response)=>{
            if(response.result !== undefined){
                UPS = response.result;
                $('#download-UPS').prop('disabled', false);
            }
        });
        runScriptInActiveTab('js/getPOs.js');
    });

    $('#check-LTL').on('click', function(){
        sendDataToTab({
                dict: dimension,
                pos: pos
            }, (response)=>{
                if(response.result !== undefined){
                    LTL = response.result;
                    $('#download-LTL').prop('disabled', false);
                }
            });
        runScriptInActiveTab('js/getPOs.js');
    });

    $('#download-LTL').on('click', function(){
        exportFile("download_LTL_PO", LTL);
    });

    $('#download-UPS').on('click', function(){
        exportFile("download_UPS_PO", UPS);
    });

    $('#check-dimension').on('click', function(){
        sendDataToTab({
            dict: dimension,
            pos: pos
        });
        runScriptInActiveTab('js/checkDimension.js');
    });

    $('#online2pdf').on('click', function(){
        var url = "https://online2pdf.com/rearrange-pdf-pages-and-change-page-order";
        chrome.tabs.create({url:url});
    });

    $("#test").on('click', function(){
        console.log("I clicked test!");
        // runScriptInActiveTab('../js/date.js');
    });
});



    
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
            line, seq,
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
        // flatContent[0] += line.slice(0, -1) + '\n';
        // line = pagination(line.slice(0, -1));
        seq = pagination(line.slice(0, -1), 100);
        for (var i = 0; i <seq.length; i++){
            flatContent[i] =  flatContent[i].trim() + '\t\t\t'+seq[i]+'\n';
        }
        // flatContent[0] += pagination(line.slice(0, -1)) + '\n';
        downloadFileFromText(filename+'.xls', flatContent);
    },
    sortObject = function(obj){
        var sorted = {};
        Object.keys(obj).sort().forEach((key)=>{
            sorted[key] = obj[key];
        });
        return sorted;
    },
    pagination = function(pageStr, limit){
        var page = pageStr.split(','),
            pre = 0,
            res = page[pre],
            seq = [];
        for(var i = 1; i < page.length; i++){
            if(Number(page[i]) !== Number(page[i-1])+1){
                if(i === pre+1){
                    if((res+","+page[i]).length > limit){
                        seq.push(res);
                        res = page[i];
                    } else {
                        res += ","+page[i];
                    }
                } else {
                    if((res+"-"+page[i-1]+","+page[i]).length > limit){
                        seq.push(res);
                        res = page[pre+1]+"-"+page[i-1]+","+page[i];
                    } else{
                        res += "-"+page[i-1]+","+page[i];
                    }
                }
                pre = i;
            }
            else if(i === page.length-1){
                if((res+"-"+page[i]).length > limit){
                    seq.push(res);
                    res = page[pre+1] + "-" +page[i];
                } else {
                    res += "-"+page[i];
                }
            }
        }
        seq.push(res);
        return seq;
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
        $('#inject-config').prop('disabled', false);

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

            chrome.runtime.sendMessage({
                address: "background/config",
                type: "/config", 
                data: {
                    dict: dimension,
                    pos: pos
                }
            }, function(response){
                if(response.success){
                    console.log("call back success");
                }
            });

        }
        fileReader.readAsText(myFile);
    });

    $('#check-UPS').on('click', function(){

        console.log("I clicked ups.");

        sendDataToTab({
            address: "content/check-ups",
            // type: "check-ups",
            data: {
                pos: pos
            }
        }, (response)=>{
            if(response.success){
                UPS = response.data;
                $('#download-UPS').prop('disabled', false);
            }
        });
    });

    $('#check-LTL').on('click', function(){


        sendDataToTab({
            address: "content/check-ltl",
            // type: "check-ltl",
            data: {
                pos: pos,
                items: dimension.items
            }
        }, (response)=>{
            if(response.success){
                LTL = response.data;
                $('#download-LTL').prop('disabled', false);
            }
        });
    });

    $('#check-dimension').on('click', function(){

        sendDataToTab({
            address: "content/check-dimension",
            data: {
                pos: pos,
                items: dimension.items
            }
        }, (response)=>{
            if(response.success){
                console.log("all dimension checked.");
            }
        });

    });

    $('#download-LTL').on('click', function(){
        exportFile("download_LTL_PO", LTL);
    });

    $('#download-UPS').on('click', function(){
        exportFile("download_UPS_PO", UPS);
    });


    //-------------------------- version 2 ------------------------------
    $("#inject-config").on('click', function(){
        var myFile = $('#fileinput').prop('files')[0];
        var fileReader = new FileReader();
        fileReader.onload = (fileLoadedEvent)=>{
            var textFromFileLoaded = fileLoadedEvent.target.result;
            var lines = fileLoadedEvent.target.result.split('\n');
            lines.forEach((line)=>{
                var po_so = line.trim().split(/\s+/);
                pos[po_so[0]] = po_so[1];
            });
            console.log("click inject-config.");

            sendDataToTab({
                address: "content/config",
                data: {
                    pos: pos,
                    items: dimension.items
                }
            }, (response)=>{
                if(response.success){
                    console.log("Injection success.");
                }
            });

        }
        fileReader.readAsText(myFile);
    });
});



    
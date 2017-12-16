$(document).ready(()=>{
    var dimension, timeframe,
    LTL, UPS,
    pos = {},
    sendDataToTab = function(data, callback){
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
            chrome.tabs.sendMessage(tabs[0].id, data, callback);
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
        seq = pagination(line.slice(0, -1), 100);
        for (var i = 0; i <seq.length; i++){
            flatContent[i] =  flatContent[i].trim() + '\t\t\t'+seq[i]+'\n';
        }
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
    },
    onload = function(){
        var $modal = $('.js-loading-bar'),
            $bar = $modal.find('.progress-bar');
        $modal.modal('show');
        timeframe = setInterval(function(){
            $bar.toggleClass('animate');
        }, 1500);
    },
    offload = function(){
        var $modal = $('.js-loading-bar'),
            $bar = $modal.find('.progress-bar');
        clearInterval(timeframe);
        $bar.removeClass('animate');
        $modal.modal('hide');
    },
    showRed = function(selector, text){
        $(selector).css("color", "#e60000");
        $(selector).text(text);
        $(selector).show();
    },
    showGreen = function(selector, text){
        $(selector).css("color", "#00cc00");
        $(selector).text(text);
        $(selector).show();
    }

    readTextFile("../src/productSpecSheet.json", function(text){
        dimension = JSON.parse(text);
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
        $('#file-modal-submit').prop('disabled', false);
        $('#file-modal-dimension').prop('disabled', false);

        if(input.length){
            input.val(log); 
        }
        else if(log){
            alert(log);
        }
    });

    $('#check-UPS').on('click', function(){
        onload();
        sendDataToTab({
            path: "content/check-ups",
            data: {
                pos: pos
            }
        }, (response)=>{
            offload();
            if(!response){
                showRed('#popup-info1', 'No UPS found');
            }
            else if(response.success){
                UPS = response.data;
                var ground=0, air=0;
                UPS.forEach(function(ups){
                    if(ups.length > 2){
                        air += 1;
                    } else {
                        ground += 1;
                    }
                });
                showGreen('#popup-info1', "Found "+ground+" ground UPS, "+air+" Express UPS");
                $('#download-UPS').prop('disabled', false);
            }
        });
    });

    $('#check-LTL').on('click', function(){
        onload();
        sendDataToTab({
            path: "content/check-ltl",
            data: {
                pos: pos,
                items: dimension.items
            }
        }, (response)=>{
            offload();
            if(!response){
                showRed('#popup-info1', 'No LTL found');
            }
            else if(response.success){
                LTL = response.data;
                showGreen('#popup-info1', "Found "+LTL.length+" LTL");
                $('#download-LTL').prop('disabled', false);
            }
        });
    });

    $('#download-LTL').on('click', function(){
        exportFile("download_ltl_po", LTL);
    });

    $('#download-UPS').on('click', function(){
        exportFile("download_ups_po", UPS);
    });

    /*-------------------------- version 2 ------------------------------*/

    $("#inject-config").on('click', function(){
        sendDataToTab({
            path: "content/config",
            data: {
                pos: pos,
                items: dimension.items
            }
        }, (response)=>{
            if(!response){
                showRed('#popup-info1', 'Plug-in failed');
            }
            else if(response.success){
            	showGreen('#popup-info1', "Plug-in buttons success");
            }
        });
    });    

    $('.js-loading-bar').modal({
        backdrop: 'static',
        show: false
    });


    /*-------------------------- version 3 ------------------------------*/

    $('#file-modal-submit').on('click', function(){
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
            $("#inject-config").prop('disabled', false);
            showGreen('#popup-info1', 'upload success, plug-in enabled');
        }
        fileReader.readAsText(myFile);
    });

    $('#file-modal-dimension').on('click', function(){
        var myFile = $('#fileinput').prop('files')[0];
        var fileReader = new FileReader();
        fileReader.onload = (fileLoadedEvent)=>{
            var textFromFileLoaded = fileLoadedEvent.target.result;
            var lines = fileLoadedEvent.target.result.split('\n');
            lines.forEach((line)=>{
                var po_so = line.trim().split(/\s+/);
                pos[po_so[0]] = po_so[1];
            });
            onload();
	        sendDataToTab({
	            path: "content/check-dimension",
	            data: {
	                pos: pos,
	                items: dimension.items
	            }
	        }, (response)=>{
	            offload();
	            if(!response){
	                showRed('#popup-info1', 'No dimension found');
	            }
	            else if(response.success){
	                var data = response.data;
	                var text = "";
	                data.pagination.forEach((page, p)=>{
	                    text += "_print_"+(p+1)+" ["+page+"]\n";
	                });
	                $('#form-control').text(text);
	                $('#form-control').show();
	                showGreen('#popup-info1', data.count+" dimension checked");
	            }
	        });
        }
        fileReader.readAsText(myFile);
    });

    $('#file-modal').on('show.bs.modal', function(event){
    	$('.modal-btn').hide();
    	console.log(event);
    	console.log("show");
    	var button = $(event.relatedTarget);
    	var modal = $(this);
    	switch(button.data('type')){
    		case "upload":
    			modal.find('.modal-title').html('upload  <strong>Crystal Report</strong> text file');
    			$('#file-modal-submit').show();
    			break;
    		case "dimension":
    			modal.find('.modal-title').html('upload  <strong>LTL Download</strong> file');
    			$('#file-modal-dimension').show();
    			break;
    	}
    });

    $('#version-1-btn').on('click', function(){
    	$('.version-1-btn-group').toggle('show');
    });
});



    
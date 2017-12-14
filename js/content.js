$(function(){
    Date.prototype.dateToStringDMYFormat = function (){
        var dd = this.getDate();
        var mm = this.getMonth()+1;
        var yyyy = this.getFullYear();
        if(dd<10){
            dd='0'+dd;
        }
        if(mm<10){
            mm='0'+mm;
        }
        return mm+'/'+dd+'/'+yyyy;
    }
    Date.prototype.getWeek = function () {
        var target  = new Date(this.valueOf());
        var dayNr   = (this.getDay() + 6) % 7;
        target.setDate(target.getDate() - dayNr + 3);
        var firstThursday = target.valueOf();
        target.setMonth(0, 1);
        if (target.getDay() != 4) {
            target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
        }
        return 1 + Math.ceil((firstThursday - target) / 604800000);
    }
    Date.prototype.getHoliday = function(){
        var holidays = {
            byWeek: {
                "4,5,1": "Memorial Day",
                "8,1,1": "Labor Day",
                "10,3,4": "Thanksgiving Day"    
                },
            byDate:{
                "0,1": "New Year's Day",
                "6,4": "Independence Day",
                "11,25": "Christmas Day"
                }};
        var holiday = holidays.byWeek[this.getMonth() + "," + this.getWeekOfMonth() + "," + this.getDay()];
        holiday = holiday || holidays.byDate[this.getMonth()+ "," + this.getDate()];
        return holiday;
    }
    Date.prototype.getWeekOfMonth = function(){
      var day = this.getDate()
      day-=(this.getDay()==0?6:this.getDay()-1);
      day+=7;
      prefixes = [0, 1, 2, 3, 4, 5];
      return prefixes[0 | (day) / 7];
    }
    

    $(document).ready(()=>{

        //--------------------version 1------------------------
        var totalUPS, totalLTL, count = 0;
        //--------------------version 2------------------------
        var UPSTotal, LTLtotal, _config = false;
        //-----------------------------------------------------

        chrome.runtime.onMessage.addListener((request, sender, sendResponse)=>{

            var package = request.address.split('/'),
                address = package[0],
                type    = package[1], 
                data    = request.data;
            
            console.log("address: ", address, " type: ", type);

            if(address === "content"){
                if(type === "config"){

                    if(!_config){
                        injectUI(data.pos, data.items);
                        sendResponse({success: true});
                    }
                }
                else if(type === "check-ups"){
                    count += 1;
                    totalUPS = getUPSPOs(data.pos);
                    sendResponse({success: true, data: totalUPS});
                    console.log("clicked "+count+" times");
                }
                else if(type === "check-ltl"){
                    totalLTL = getLTLPOs(data.pos, data.items);
                    sendResponse({success: true, data: totalLTL});
                }
                else if(type === "check-dimension"){
                    checkDimension(data.pos, data.items);
                    sendResponse({success: true});
                }
                

            }
            return true; 
        });

        function injectUI(pos, items){
            var div = $('<div>', {id: 'injected-div'});
            div.append('<p class="injected-p"> <button class="injected-button" id="set-date">Set Date</button> </p>');
            div.append('<p class="check-ups injected-p"> <button class="injected-button" id="ups-btn">Check UPS</button> <span class="injected-info"></span> <button class="injected-button download-btn" id="ups-download">Download UPS</button></p>');
            div.append('<p class="check-ltl injected-p"> <button class="injected-button" id="ltl-btn">Check LTL</button> <span class="injected-info"></span> <button class="injected-button download-btn" id="ltl-download">Download LTL</button></p>');
            div.append('<p class="search-all injected-p"><button class="injected-button" id="search-all-btn">Search All</button> <span class="injected-info"></span> </p>');
            $('div.search.clearfix').append(div);
            $('.injected-info').hide();
            $('#ups-download').hide();
            $('#ltl-download').hide();
            $('#set-date').hide();

            $('.js-search-button').on('click', function(){
                $('.injected-info').hide();
                $('#ups-download').hide();
                $('#ltl-download').hide();
            });

            $('.js-modal-close').on('click', function(){
                _config = false;
            });

            $('#search-all-btn').on('click', function(){
                var total = $('.dataTables_info').text().split(' ')[5];
                $('.modal-packing-slips .maincontent').find('select').append($('<option>', {value: Number(total),text: total}));
                $('p.search-all').find('.injected-info').text('You can select '+total+' now');
                $('p.search-all').find('.injected-info').show();
            });

            $('#set-date').on('click', function(){
                $('input.date_picker.js-po-date-from.hasDatepicker').val('12/08/2017');
                $('input.date_picker.js-po-date-to.hasDatepicker').val('12/11/2017');
            });

            $('#ups-btn').on('click', function(){
                UPSTotal = getUPSPOs(pos);
                var ground=0, air=0;
                UPSTotal.forEach(function(ups){
                    if(ups.length > 2){
                        air += 1;
                    } else {
                        ground += 1;
                    }
                });

                $('p.check-ups').find('.injected-info').text("Found "+ground+" ground UPS, "+air+" Express UPS");
                $('p.check-ups').find('.injected-info').show();
                if(UPSTotal.length !== 0){
                    $('#ups-download').show();
                }

            });
            $('#ltl-btn').on('click', function(){
                LTLtotal = getLTLPOs(pos, items);
                $('p.check-ltl').find('.injected-info').text("Found "+LTLtotal.length+" LTL");
                $('p.check-ltl').find('.injected-info').show();
                if(LTLtotal.length !== 0){
                    $('#ltl-download').show();
                }
            });
            $('#ltl-download').on('click', function(){
                exportFile("download_LTL_PO", LTLtotal);
            });

            $('#ups-download').on('click', function(){
                exportFile("download_UPS_PO", UPSTotal);
            });
            _config = true;
        }
        function exportFile(filename, content){
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
        }
        function sortObject(obj){
            var sorted = {};
            Object.keys(obj).sort().forEach((key)=>{
                sorted[key] = obj[key];
            });
            return sorted;
        }
        function pagination(pageStr, limit){
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
        }        
        function downloadFileFromText(filename, content){
            var a = document.createElement('a');
            var blob = new Blob(content, {type : "text/plain;charset=UTF-8"});
            a.href = window.URL.createObjectURL(blob);
            a.download = filename;
            a.style.display = 'none';
            document.body.appendChild(a);
            a.click();
            delete a;
        }
        function getUPSPOs(pos){
            console.log("Finding UPS POs..");
            var UPS = [],
                container = $('.modal-packing-slips .maincontent');
            $.each(container.find('.js-orders tbody tr'), function(){
                var checkbox = $(this).find('input[type="checkbox"]'),
                    poNum = checkbox.data('full-po-num'),
                    shippingMethod = $('.js-delivery-method-'+poNum).text(),
                    carrier = $('.js-carrier-name-label-' + poNum).html();

                if (!(poNum in pos)){
                    return;
                }
                if (!shippingMethod ||!carrier){
                    alert("PO "+poNum+" in text file has no packing slip. Please make sure the display number equals the total number.");
                    return false;
                }                
                if (shippingMethod !== "LTL"){
                    if(carrier.includes('Air')){
                        UPS.push([poNum, pos[poNum], carrier]);
                    }
                    else{
                        UPS.push([poNum, pos[poNum]]);
                    }
                    checkbox.prop('checked', true);
                }
            });
            console.log("UPS:", UPS);
            return UPS;
        }


        function getLTLPOs(pos, items){
            console.log("Finding LTL POs..");
            var LTL = [], LTLItem,
                container = $('.modal-packing-slips .maincontent');

            $.each(container.find('.js-orders tbody tr'), function(){
                var checkbox = $(this).find('input[type="checkbox"]');
                var poNum = checkbox.data('full-po-num');
                var shippingMethod = $('.js-delivery-method-'+poNum).text();
                if(!(poNum in pos)){
                    return;
                }
                if (!shippingMethod){
                    alert("PO "+poNum+" in text file has no packing slip. Please make sure the display number equals the total number.");
                    return false;
                }                
                if(shippingMethod === "LTL"){
                    LTLItem = [poNum, pos[poNum]];
                    var identifierList = $('#' + poNum + '_identifierlist').val().split(/\s*,\s*/);
                    if (identifierList.length) {
                        identifierList.forEach(function(identifier) {
                            var itemID = $('#' + poNum + '_' + identifier + '_item_part_number').val();
                            items.forEach((item)=>{
                                if(item["ItemNum"] === itemID && item["GW"]==="0"){
                                    LTLItem.push(itemID);
                                }
                            });
                        });
                    }
                    LTL.push(LTLItem);
                    checkbox.prop('checked', true);
                }
            });
            console.log("LTL: ", LTL);
            return LTL;
        }


        function checkDimension(pos, items){
            var today = new Date();
            var special = {};
            var nextPickUpDate = today.getHours()>=12 ? getNextWeekday(getNextWeekday(today)) : getNextWeekday(today);
            // var nextPickUpDate = getNextWeekday(today).dateToStringDMYFormat();
            for (poNum in pos){
                var shippingMethod = $('.js-delivery-method-'+poNum).text();
                if(shippingMethod === 'LTL'){
                    select(poNum);
                    $('#calendar_' + poNum + '_pickup').val(nextPickUpDate.dateToStringDMYFormat());
                    var identifierList = $('#' + poNum + '_identifierlist').val().split(/\s*,\s*/);
                    if (identifierList.length){
                        identifierList.forEach(function(identifier) {
                            var itemQty = Number($('#' + poNum + '_' + identifier + '_item_qty').val());
                            var itemID = $('#' + poNum + '_' + identifier + '_item_part_number').val();
                            items.forEach((item)=>{
                                if(item["ItemNum"] === itemID){
                                    if(Number(item["GW"])!==0){
                                        $('#' + poNum + '_' + identifier + '_weight').val(Number(item["GW"]));
                                    }
                                    $('#' + poNum + '_' + identifier + '_boxcount').val(itemQty*Number(item["CtnNum"]));
                                }
                                if(Number($('#' + poNum + '_' + identifier + '_carton_class').val()) === 0){
                                    $('#' + poNum + '_' + identifier + '_carton_class').val(125);
                                }
                            });
                        });
                    }
                    updateTotalWeight(poNum);
                }   
            }
        }
        function getNextWeekday(date) {
            var tomorrow = new Date(date.setDate(date.getDate() + 1));
            return (tomorrow.getDay() % 6 && tomorrow.getHoliday() === undefined) ? tomorrow : getNextWeekday(tomorrow);
        }
        function getSecondNextWeekday(date) {
            var tomorrow = new Date(date.setDate(date.getDate() + 2));
            return (tomorrow.getDay() % 6 && tomorrow.getHoliday() === undefined) ? tomorrow : getNextWeekday(tomorrow);
        }    
        function select(poNum) {
            $('#' + poNum + '_row').removeClass('hidden-node');
            $('#' + poNum + '_iteminfo').removeClass('hidden-node');
            $('#' + poNum + '_rollup_row').addClass('hidden-node');
            $('#' + poNum + '_response_row').addClass('hidden-node');
            $('#' + poNum + '_update').prop('disabled', false);
            $('#' + poNum + '_tracking_number').prop('disabled', false);
            $('#calendar_' + poNum).prop('disabled', false);
            $('#' + poNum + '_update').prop('checked', true);
            $('#' + poNum + '_edit_order').prop('disabled', false);
            $('#' + poNum + '_packaging').prop('disabled', false);
            if ($('#' + poNum + '_trackingNumber').length) {
                $('#' + poNum + '_trackingNumber').prop('disabled', false);
            }
            $('#' + poNum + '_date').prop('disabled', false);
            $('#calendar_' + poNum + '_pickup').prop('disabled', false);
            $('#' + poNum + '_warehouse').prop('disabled', false);
            $('#' + poNum + '_delivery_method').prop('disabled', false);
            var identifierList = $('#' + poNum + '_identifierlist').val().split(/\s*,\s*/);
            $.each(identifierList, function() {
                if (this.length === 0) {
                    return true;
                }
                $('#' + poNum + '_' + this + '_weight').prop('disabled', false);
                $('#' + poNum + '_' + this + '_boxcount').prop('disabled', false);
                $('[name="' + poNum + '_' + this + '_piecetype"]').prop('disabled', false);
                $('#' + poNum + '_' + this + '_carton_nmfc').prop('disabled', false);
                $('#' + poNum + '_' + this + '_carton_class').prop('disabled', false);
                $('#' + poNum + '_' + this + '_boxcount').prop('disabled', false);
                $('#' + poNum + '_' + this + '_piecetype').prop('disabled', false);
                $('#' + poNum + '_is_palletized').prop('disabled', false);
                $('#' + poNum + '_palletCount').prop('disabled', false);
                $('#' + poNum + '_palletWeight').prop('disabled', false);
            });
        }
        function cartonWeightFeatureOn(){
            return document.getElementById('carton-weight-feature-on') !== null;
        }
        function updateTotalWeight(poNum) {
            var unitWeight = 0
              , cartonWeight = 0
              , itemQty = 0
              , boxCount = 0
              , itemTotalWeight = 0
              , totalWeight = 0;
            var identifierList = $('#' + poNum + '_identifierlist').val().split(/\s*,\s*/);
            $.each(identifierList, function() {
                if (this.length === 0) {
                    return true;
                }
                itemQty = $('#' + poNum + '_' + this + '_item_qty');
                if (itemQty.length) {
                    boxCount = Number($('#' + poNum + '_' + this + '_boxcount').val());
                    if (cartonWeightFeatureOn()) {
                        if (boxCount === 0) {
                            boxCount = 1;
                        }
                        var expectedBoxCount = Number(document.getElementById(poNum + '_' + this + '_expected_box_count').value);
                        if (expectedBoxCount === boxCount) {
                            boxCount = Number(document.getElementById(poNum + '_' + this + '_default_unique_boxes').value);
                        }
                        cartonWeight = 0;
                        for (var x = 0; x < boxCount; x++) {
                            var weightMultiplier = Number(document.getElementById(poNum + '_' + this + '_weight_multiplier_' + (x + 1)).firstChild.nodeValue);
                            cartonWeight += Number($('#' + poNum + '_' + this + '_weight_' + (x + 1)).val().replace(',', '.')) * weightMultiplier;
                        }
                        itemTotalWeight = cartonWeight;
                        $('#' + poNum + '_' + this + '_totalweight').html(Math.round(itemTotalWeight * 10) / 10);
                    } else {
                        unitWeight = Number($('#' + poNum + '_' + this + '_weight').val().replace(',', '.'));
                        itemTotalWeight = unitWeight * Number(itemQty.val());
                        $('#' + poNum + '_' + this + '_totalweight').html(itemTotalWeight);
                    }
                    totalWeight += Number(itemTotalWeight);
                }
            });
            $('#' + poNum + 'weight').val(totalWeight);
            $('#' + poNum + '_totalweighttotal').html(Math.round(totalWeight * 10) / 10);
            updateShippingInfo(poNum);
        }
        function updateShippingInfo(poNum) {
            var deliveryMethod = parseInt($('#' + poNum + '_shipspeed').val(), 10)
              , palletCount = $('#' + poNum + '_palletCount').val()
              , palletWeight = 0
              , boxCount = 0
              , totalWeight = 0
              , boxCountLabel = ''
              , boxType = ''
              , identifierList = $('#' + poNum + '_identifierlist').val().split(/\s*,\s*/);
            $.each(identifierList, function() {
                if (this.length === 0) {
                    return true;
                }
                boxCount += Number($('#' + poNum + '_' + this + '_boxcount').val());
                boxType = $('#' + poNum + '_' + this + '_piecetype').val();
                if (boxCountLabel.indexOf(boxType) < 0) {
                    boxCountLabel += boxType + ', ';
                }
                totalWeight += Number($('#' + poNum + '_' + this + '_totalweight').html());
            });
            palletWeight = Number($('#' + poNum + '_palletWeight').val()) * Number($('#' + poNum + '_palletCount').val());
            totalWeight += palletWeight;
            if (palletCount > 1) {
                boxCountLabel += palletCount + ' Pallets';
            } else {
                boxCountLabel += palletCount + ' Pallet';
            }
            $('#' + poNum + '_piece_count_total').html(boxCount + ' ' + boxCountLabel);
            $('#' + poNum + '_total_weight_total').html(Math.round(totalWeight * 10) / 10);
        }
    });
});

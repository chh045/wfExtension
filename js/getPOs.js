if(typeof($) == 'undefined')
    alert("Something is wrong, please refresh the page.");
else{
    console.log("call success");
    $(function(){
        chrome.runtime.onMessage.addListener(function _data(request, sender, response){
            if(request.dict){
                response({result: getLTLPOs(request.pos, request.dict.items)});
            }
            else{
                response({result: getUPSPOs(request.data)});
            }
            chrome.runtime.onMessage.removeListener(_data);
        });
        function getUPSPOs(pos){
            console.log("Finding UPS POs..");
            var UPS = [],
                container = $('.modal-packing-slips .maincontent');
            $.each(container.find('.js-orders tbody tr'), function(){
                var checkbox = $(this).find('input[type="checkbox"]'),
                    poNum = checkbox.data('full-po-num'),
                    shippingMethod = $('.js-delivery-method-'+poNum).text(),
                    carrier = $('.js-carrier-name-label-' + poNum).html();
                if (!shippingMethod ||!carrier){
                    alert("Please make sure the display number equals the total number.");
                    return false;
                }
                if (!(poNum in pos))
                    return;
                if (shippingMethod !== "LTL"){
                    if(carrier.includes('Air'))
                        UPS.push([poNum, pos[poNum], carrier]);
                    else
                        UPS.push([poNum, pos[poNum]]);
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
                if (!shippingMethod){
                    alert("Please make sure the display number equals the total number.");
                    return false;
                }
                if(!(poNum in pos))
                    return;
                if(shippingMethod === "LTL"){
                    LTLItem = [poNum, pos[poNum]];
                    var identifierList = $('#' + poNum + '_identifierlist').val().split(/\s*,\s*/);
                    if (identifierList.length) {
                        identifierList.forEach(function(identifier) {
                            var itemID = $('#' + poNum + '_' + identifier + '_item_part_number').val();
                            items.forEach((item)=>{
                                if(item["ItemNum"] === itemID && item["GW"]==="0")
                                    LTLItem.push(itemID);
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
    });
}

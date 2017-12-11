if(typeof($) == 'undefined')
    alert("Something is wrong, please refresh the page.");
else{
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
    $(function(){
		chrome.runtime.onMessage.addListener(function _data(request, sender, response){
			checkDimension(request.pos, request.dict.items);
			chrome.runtime.onMessage.removeListener(_data);
		});
		function getNextWeekday(date) {
			var tomorrow = new Date(date.setDate(date.getDate() + 1));
			return (tomorrow.getDay() % 6 && tomorrow.getHoliday() === undefined) ? tomorrow : getNextWeekday(tomorrow);
		}
		function checkDimension(pos, items){
			var today = new Date();
			var special = {};
			var nextPickUpDate = getNextWeekday(today).dateToStringDMYFormat();
			for (poNum in pos){
				var shippingMethod = $('.js-delivery-method-'+poNum).text();
				if(shippingMethod === 'LTL'){
					enable(poNum);
					$('#calendar_' + poNum + '_pickup').val(nextPickUpDate);
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
		function enable(poNum) {
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
}
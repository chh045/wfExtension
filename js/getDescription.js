function enable(poNum) {
                jQuery('.available_actions').popover('hide');
                jQuery('#' + poNum + '_row').removeClass('hidden-node');
                jQuery('#' + poNum + '_iteminfo').removeClass('hidden-node');
                jQuery('#' + poNum + '_rollup_row').addClass('hidden-node');
                jQuery('#' + poNum + '_response_row').addClass('hidden-node');
                jQuery('#' + poNum + '_expand').attr('src', window.STTCommon + 'st4/stores/common/extranet/collapse.gif');
                jQuery('#' + poNum + '_update').prop('disabled', false);
                jQuery('#' + poNum + '_tracking_number').prop('disabled', false);
                jQuery('#calendar_' + poNum).prop('disabled', false);
                jQuery('#' + poNum + '_update').prop('checked', true);
                jQuery('#' + poNum + '_edit_order').prop('disabled', false);
                jQuery('#' + poNum + '_packaging').prop('disabled', false);
                if (jQuery('#' + poNum + '_trackingNumber').length) {
                    jQuery('#' + poNum + '_trackingNumber').prop('disabled', false);
                }
                toggle(poNum, false);
            }

function toggle(poNum, disable) {
                jQuery('#' + poNum + '_date').prop('disabled', disable);
                jQuery('#calendar_' + poNum + '_pickup').prop('disabled', disable);
                jQuery('#' + poNum + '_warehouse').prop('disabled', disable);
                jQuery('#' + poNum + '_delivery_method').prop('disabled', disable);
                var identifierList = jQuery('#' + poNum + '_identifierlist').val().split(/\s*,\s*/);
                console.log(identifierList);
                jQuery.each(identifierList, function() {
                    console.log("this:", this);
                    identifier = this
                    if (this.length === 0) {
                        return true;
                    }
                    jQuery('#' + poNum + '_' + this + '_boxcount').prop('disabled', disable);
                    jQuery('[name="' + poNum + '_' + this + '_piecetype"]').prop('disabled', disable);
                    jQuery('#' + poNum + '_' + this + '_carton_nmfc').prop('disabled', disable);
                    jQuery('#' + poNum + '_' + this + '_carton_class').prop('disabled', disable);
                    jQuery('#' + poNum + '_' + this + '_boxcount').prop('disabled', disable);
                    jQuery('#' + poNum + '_' + this + '_piecetype').prop('disabled', disable);
                    // if (_view.cartonWeightFeatureOn) {
                    //     var boxCount = jQuery('#' + poNum + '_' + this + '_boxcount').val();
                    //     for (var x = 0; x < boxCount; x++) {
                    //         jQuery('#' + poNum + '_' + this + '_weight_' + (x + 1)).prop('disabled', disable);
                    //         jQuery('#' + poNum + '_' + this + '_height_' + (x + 1)).prop('disabled', disable);
                    //         jQuery('#' + poNum + '_' + this + '_width_' + (x + 1)).prop('disabled', disable);
                    //         jQuery('#' + poNum + '_' + this + '_depth_' + (x + 1)).prop('disabled', disable);
                    //     }
                    // } else {
                    //     jQuery('#' + poNum + '_' + this + '_weight').prop('disabled', disable);
                    // }
                    jQuery('#' + poNum + '_is_palletized').prop('disabled', disable);
                    jQuery('#' + poNum + '_palletCount').prop('disabled', disable);
                    jQuery('#' + poNum + '_palletWeight').prop('disabled', disable);
                });
            }
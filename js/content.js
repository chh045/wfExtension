console.log("you have a nice mom!");

function enable(poNum) {
                $('.available_actions').popover('hide');
                $('#' + poNum + '_row').removeClass('hidden-node');
                $('#' + poNum + '_iteminfo').removeClass('hidden-node');
                $('#' + poNum + '_rollup_row').addClass('hidden-node');
                $('#' + poNum + '_response_row').addClass('hidden-node');
                $('#' + poNum + '_expand').attr('src', window.STTCommon + 'st4/stores/common/extranet/collapse.gif');
                $('#' + poNum + '_update').prop('disabled', false);
                $('#' + poNum + '_tracking_number').prop('disabled', false);
                $('#calendar_' + poNum).prop('disabled', false);
                $('#' + poNum + '_update').prop('checked', true);
                $('#' + poNum + '_edit_order').prop('disabled', false);
                $('#' + poNum + '_packaging').prop('disabled', false);
                if ($('#' + poNum + '_trackingNumber').length) {
                    $('#' + poNum + '_trackingNumber').prop('disabled', false);
                }
                toggle(poNum, false);
            }

function toggle(poNum, disable) {
                $('#' + poNum + '_date').prop('disabled', disable);
                $('#calendar_' + poNum + '_pickup').prop('disabled', disable);
                $('#' + poNum + '_warehouse').prop('disabled', disable);
                $('#' + poNum + '_delivery_method').prop('disabled', disable);
                var identifierList = $('#' + poNum + '_identifierlist').val().split(/\s*,\s*/);
                console.log(identifierList);
                $.each(identifierList, function() {
                    console.log("this:", this);
                    identifier = this
                    if (this.length === 0) {
                        return true;
                    }
                    $('#' + poNum + '_' + this + '_boxcount').prop('disabled', disable);
                    $('[name="' + poNum + '_' + this + '_piecetype"]').prop('disabled', disable);
                    $('#' + poNum + '_' + this + '_carton_nmfc').prop('disabled', disable);
                    $('#' + poNum + '_' + this + '_carton_class').prop('disabled', disable);
                    $('#' + poNum + '_' + this + '_boxcount').prop('disabled', disable);
                    $('#' + poNum + '_' + this + '_piecetype').prop('disabled', disable);
                    // if (_view.cartonWeightFeatureOn) {
                    //     var boxCount = $('#' + poNum + '_' + this + '_boxcount').val();
                    //     for (var x = 0; x < boxCount; x++) {
                    //         $('#' + poNum + '_' + this + '_weight_' + (x + 1)).prop('disabled', disable);
                    //         $('#' + poNum + '_' + this + '_height_' + (x + 1)).prop('disabled', disable);
                    //         $('#' + poNum + '_' + this + '_width_' + (x + 1)).prop('disabled', disable);
                    //         $('#' + poNum + '_' + this + '_depth_' + (x + 1)).prop('disabled', disable);
                    //     }
                    // } else {
                    //     $('#' + poNum + '_' + this + '_weight').prop('disabled', disable);
                    // }
                    $('#' + poNum + '_is_palletized').prop('disabled', disable);
                    $('#' + poNum + '_palletCount').prop('disabled', disable);
                    $('#' + poNum + '_palletWeight').prop('disabled', disable);
                });
            }

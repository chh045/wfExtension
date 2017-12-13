var _packingSlip = {
    URL: {
        get_orders: '/ajax/get_orders_for_packing_slip.php',
        print: '/print_shipping_docs.php?print=1&printPackingSlips=1&download=0',
        download: '/download.php?type=shipping_document&file_name='
    },
    init: function init() {
        $('#js-print-packing-slip').on('click', function() {
            _packingSlip.printModal.show();
        });
    },
    printModal: function() {
        var modal;
        var container;
        var datatable;
        var poNumList = [];
        var show = function show() {
            $.extranet.template.load('order_management/modal-print-packing-slip', {}, function(html) {
                $.wfModal({
                    content: html,
                    overlayClose: false,
                    userClass: 'modal-print-packing-slip'
                }, function(data) {
                    modal = data;
                    container = modal.objModalContent.find('.container');
                    var date = new Date();
                    $('.js-po-date-to').datepicker().datepicker('setDate', date);
                    date.setDate(date.getDate() - 30);
                    $('.js-po-date-from').datepicker().datepicker('setDate', date);
                    search();
                    container.find('.js-search-button').on('click', search);
                    container.find('.js-print-button').on('click', printSlip);
                    container.find('.js-check-all').on('click', function() {
                        var checked = $(this).prop('checked');
                        container.find('.js-orders tbody input[type="checkbox"]').prop('checked', checked);
                    });
                });
            });
        };
        var search = function search() {
            container.find('.maincontent').addClass('wait');
            $.ajax({
                url: _packingSlip.URL.get_orders + '?' + container.find('.search form').serialize(),
                type: 'GET',
                dataType: 'json',
                cache: false
            }).done(function(data) {
                $('.modal-packing-slips .maincontent').removeClass('hidden-node');
                $('.modal-packing-slips .js-print-button').removeClass('hidden-node');
                $('.modal-packing-slips .partition-content').empty();
                $('.modal-packing-slips .partition-content').addClass('hidden-node');
                load(data);
            }).fail(function() {
                container.find('.maincontent').removeClass('wait');
                emptyTable();
            });
        };
        var printSlip = function printSlip() {
            var checkedList = []
              , tdList = datatable.$('.js-select-checkbox', {
                'page': 'all'
            });
            tdList.each(function() {
                var checkbox = $(this).find('input[type="checkbox"]');
                if (checkbox.prop('checked') === true) {
                    checkedList.push(checkbox.data('full-po-num'));
                }
            });
            if (checkedList.length === 0) {
                return;
            }
            var packingSlipPOs = checkedList.join(',');
            container.find('.maincontent').addClass('wait');
            container.find('.js-print-button').prop('disabled', true);
            $.ajax({
                url: _packingSlip.URL.print,
                type: 'POST',
                dataType: 'json',
                data: {
                    'PackingSlipPOs': packingSlipPOs
                }
            }).done(function(data) {
                container.find('.maincontent').removeClass('wait');
                container.find('.js-print-button').prop('disabled', false);
                var partitionsNum = data.file_names.length;
                var packingSlipsNum = checkedList.length;
                if (partitionsNum > 1) {
                    var partitionLinksHTML = $('<ul>');
                    var start = 1;
                    var end = data.partition_size;
                    $.each(data.file_names, function(partitionIndex) {
                        var listItem = $('<li>');
                        var link = $('<a>');
                        if (partitionIndex > 0) {
                            end += data.partition_size * partitionIndex;
                            if (end > packingSlipsNum) {
                                end = packingSlipsNum;
                            }
                        }
                        $(link).html($.extranet.languageResources.PackingSlipsPartitionTitle + ' ' + start + ' - ' + end);
                        $(link).attr('href', _packingSlip.URL.download + this);
                        $(link).attr('target', '_blank');
                        $(listItem).append(link);
                        $(partitionLinksHTML).append(listItem);
                        start = end + 1;
                    });
                    $('.modal-packing-slips .maincontent').addClass('hidden-node');
                    $('.modal-packing-slips .js-print-button').addClass('hidden-node');
                    $('.modal-packing-slips .partition-content').html(partitionLinksHTML);
                    $('.modal-packing-slips .partition-content').removeClass('hidden-node');
                } else {
                    window.open(_packingSlip.URL.download + data.file_names, '_blank');
                }
            });
        };
        var load = function load(data) {
            poNumList = data.full_po_num_list;
            $.extranet.template.load('order_management/modal-print-packing-slip', data, function(html) {
                container.find('.maincontent').removeClass('wait');
                emptyTable();
                container.find('.js-orders tbody').html($(html).find('.js-orders tbody').html());
                createTable();
                modal.position();
            });
        };
        var createTable = function createTable() {
            datatable = container.find('.js-orders').DataTable({
                oLanguage: $.extranet.datatable.language,
                aoColumnDefs: [{
                    'bSortable': false,
                    'sClass': 'js-select-checkbox',
                    'aTargets': [0]
                }],
                fnDrawCallback: function fnDrawCallback() {
                    var allChecked = true;
                    $.each(container.find('.js-orders tbody input[type="checkbox"]'), function() {
                        if ($(this).prop('checked') === false) {
                            allChecked = false;
                            return false;
                        }
                    });
                    $('.js-check-all').attr('checked', allChecked);
                }
            });
        };
        var emptyTable = function emptyTable() {
            if (datatable === undefined) {
                return;
            }
            datatable.destroy();
            container.find('.js-check-all').prop('checked', false);
        };
        return {
            show: show
        };
    }()
};


$('.dataTables_info').on('change', function(){
    alert('you changed me!!!');
});
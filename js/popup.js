document.addEventListener('DOMContentLoaded', function() {

  var checkLTLButton = document.getElementById('check-LTL');
  checkLTLButton.addEventListener('click', function() {


    //var content = $('h6').text()
    //console.log(content);


// chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
//     var tab = tabs[0];
//     console.log(tab.url, tab.title);
//     chrome.tabs.getSelected(null, function(tab) {
//         chrome.tabs.sendMessage(tab.id, {greeting: "hello"}, function(msg) {
//             msg = msg || {};
//             console.log('onResponse', msg.farewell);
//         });
//     });
// });


    runScriptInActiveTab();

    function runScriptInActiveTab(){
        chrome.tabs.executeScript({
            file: 'js/content.js'
        });
    }


    function modifyDOM() {
        //You can play with your DOM here or check URL against your regex
        console.log('Tab script:');
        console.log(document.body);
        return document.body.innerHTML;
    }

    //We have permission to access the activeTab, so we can call chrome.tabs.executeScript:
    function getDOMFromActiveTab(){
        chrome.tabs.executeScript({
            code: '(' + modifyDOM + ')();' //argument here is a string but function.toString() returns function's code
        }, (results) => {
            //Here we have just the innerHTML and not DOM structure
            console.log('Popup script:', results)
            //console.log(results[0]);
        });
    }









    // chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    //   var tab = tabs[0];
    //   console.log(tab.url, tab.title);
    //   chrome.tabs.getSelected(null, function(tab) {
    //     chrome.tabs.sendMessage(tab.id, {greeting: "hello"}, function(msg) {
    //         msg = msg || {};
    //         console.log('onResponse', msg.farewell);
    //     });
    //   });
    // });






    // var checkedList = [];
    // var crList = [];
    // var LTL = [];
    // var UPS = [];
    // var container = $('.modal-packing-slips .maincontent');

    // $.each(container.find('.js-orders tbody tr'), function(){
    //   var checkbox = $(this).find('input[type="checkbox"]')
    //   var poNum = checkbox.data('full-po-num');
    //   var cr = $('#' + poNum + '_crid').val();
    //   var shippingMethod = $('.js-delivery-method-'+poNum).text()
    //   if (shippingMethod === "LTL"){
    //     LTL.push({"poNum": poNum});
    //     //console.log(checkbox.prop('checked', false));
    //   } else {
    //     UPS.push({"poNum": poNum, "Air":$('.js-carrier-name-label-' + poNum).text().includes('Air')});
    //     checkbox.prop('checked', true)
    //     console.log("poNum:", poNum);
    //   }
    //   checkedList.push(poNum);
    //   crList.push({
    //     "poNum": poNum,
    //     "carrier": cr,
    //     "Express": $('.js-carrier-name-label-' + poNum).text().includes('Air')
    //   });
    // });

    // console.log(crList);
   



    //exportInputs();
    function exportInputs() {
        downloadFileFromText('asshole.csv',['dummy content!!\n', 'bitch\n', 'asshole\n'])
    }

    function downloadFileFromText(filename, content) {
        var a = document.createElement('a');
        var blob = new Blob(content, {type : "text/plain;charset=UTF-8"});
        a.href = window.URL.createObjectURL(blob);
        a.download = filename;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click(); //this is probably the key - simulating a click on a download link
        delete a;// we don't need this anymore
    }





  }, false);
}, false);
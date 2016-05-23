console.log('highlight background working');
/*
    handle click event when user click our icon.
    what we want is when user click icon, we switch between two status: off and on.
    
*/
var flag = 0;
chrome.browserAction.onClicked.addListener(function(tab) { 

    if (flag == 0){
        // change icon
        chrome.browserAction.setIcon({path: 'images/38-black.png'});

        // tell content script
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
            chrome.tabs.sendMessage(tabs[0].id, {status: "off"}, function(response) {});  
        }); 

        //change flag
        flag = 1;
    } else {
        chrome.browserAction.setIcon({path: 'images/38.png'});

        chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
            chrome.tabs.sendMessage(tabs[0].id, {status: "on"}, function(response) {});  
        }); 

        flag = 0;
    }

});


/*
    默认图标表示的是当前状态: 禁用
    content script 跑得动那就是说明我们当前在想注入的页，
    那么就切换图标为启用
*/
// chrome.runtime.onMessage.addListener(function(message,sender,sendResponse){
//   if (message.hey == "you are enable") {
//     chrome.browserAction.setIcon({path: 'images/38.png'});
//   }
// });



chrome.tabs.onActivated.addListener(function a(){

    chrome.tabs.getSelected(null, function(tab) {

        console.log(localStorage.getItem('status'));
        // if ( localStorage.getItem('status') == 'off' ){
        //    $(newDiv).hide();
        // }
        // var url = tab.url;

        // //http://stackoverflow.com/questions/736513/how-do-i-parse-a-url-into-hostname-and-path-in-javascript
        // var parser = document.createElement('a');
        // parser.href = url;
        // if(parser.hostname == 'www.youtube.com'){
        // // if(parser.hostname == 'www.youtube.com' && parser.pathname == '/watch'){
        //     chrome.browserAction.setIcon({path: '19-white.png'});
        // } else {
        //     chrome.browserAction.setIcon({path: '19-gray.png'});
        // }
   });

})



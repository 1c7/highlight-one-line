console.log('= Chrome Extenstion "Hightlight Single Line" is running');
console.log('= If this page got display problem, maybe you should try to turn off this extension. and then debug. it may help.');
/*
Author             :   Github @1c7
Bug & Suggestion   :   guokrfans#gmail.com

========================================
    How this code work?
========================================
    Premise:
        there no API in Javascript or Browser can let you easily get one line text.
        there are many website that have many different way to layout text.
        some just <p>text</p>  some are <div> <a> text <a> </div> .. etc..
        this is annoying.

    So our solution is:
        1. when User click on text, get all text first,
        and then break that big chunk of text into word by split(" "), and wrap it with <span>
        now we get many <span> element
        and then foreach <span>, use some clever trick.
        and then, each <span class='line'> is one line text

        2. create a position:absolute <div>, append to <body>
        <div> content is one line text we get from previous step

        3. put that div on page to *overlay* origin text.


========================================
    How do i store last read position?
========================================
        localStorage + JSON.stringify

*/
// var count = 0; // count for test
var prev_version = "";

$('p, div, h1, h2, h3, h4, h5, h6, a').click(function(e){

    if ( localStorage.getItem('status') == 'off' ){
        return;
    }

    // count ++;
    // console.log('------------------ ' + count +' -------------------');

    var x = e.clientX; // this would change every time you click
    var y = e.clientY;

    // =====================================================
    //    1 
    //    in some case, we don't want highlight that line
    // =====================================================
    var parentTagName = $(e.target).parent()[0].tagName; // get current element tag name
    if (parentTagName == "BUTTON"){
        return;
    }

    var tagName = $(e.target)[0].tagName; // get current element tag name
    if (tagName == "A" || tagName == "CODE"){
        // seem strange why we listen click event on <a> tag, and return?
        // because when user click link, we don't want highlight that.
        return;
    }
    if (tagName == "DIV" && $(this)[0].children.length != 0){
        // there are div only contain text, and div contain child element. two type div.
        // that is a problem.
        // so by children.length != 0
        // we can know if this div contain child element.
        // != 0 mean there are child element.

        // if so, we return;
        console.log('HightLight: div contain element, return');
        return;
    }

    e.stopPropagation(); 
    // Prevent repeat call,  this line is very important
    
    prev_version = $(e.target).html(); // Save origin html before change

    // =====================================================
    //    2 
    //    wrapLines
    // =====================================================
    wrapLines($(e.target));  

    var that_element = $(document.elementFromPoint(x, y)); 
    var p = that_element[0].getBoundingClientRect();
    // 解决了区块的问题, 就是把那一整段的文字都拿到了, 而不是我们想要的一句.
    // 你可以去掉这行试试效果就知道了, 会得到多行的文字. 而不是点击的那一行的文字.
    if( that_element.hasClass('line') == false ){
        return;
    }
    var bodyRect = document.body.getBoundingClientRect(),
    elemRect = p;
    offset   = elemRect.top - bodyRect.top;
    // Calculate top distance

    var that_line = that_element.text(); 
    var that_size = that_element.css('font-size');  // 30px for example
    var ft_family = that_element.css('font-family');  
    var ft_weight = that_element.css('font-weight');  
    var ft_style = that_element.css('font-style'); 

    // if float div already exist, we use it, if not, we create it.
    if ($('#chrome-ext-hightlight').length > 0){
        var float_div = $('#chrome-ext-hightlight').show();
        float_div.text(that_line);
        var newDiv = float_div[0];
    } else {
        var newDiv = document.createElement("div");             
        var newContent = document.createTextNode(that_line); 
        newDiv.appendChild(newContent); // text node
        newDiv.id = "chrome-ext-hightlight";
    }

    // ======================================================
    //       3 
    //       now set property for correct style and position
    // ======================================================
    var that_left = p.left;

    var cs = 'top: ' + offset + "px; ";
     cs += 'padding-left: ' + that_left + "px; ";
     cs += 'font-size: ' + that_size + ';';
     cs += 'font-family: ' + ft_family + ';';
     cs += 'font-weight: ' + ft_weight + ';';
     cs += 'font-style: ' + ft_style + ';';

    newDiv.style.cssText = cs;
    $(newDiv).addClass('chrome-ext-hightlight-box'); // css/inject.css
    $('html').append(newDiv); 
    // some people give <body> element padding-left, that cause display problem.
    // so we append <html>

    // ==============================================================
    //     3
    //     store last read position, 
    //     if user refresh or come back this page after few day, that line still exists
    // =============================================================
    var lastRead = {}; 
    lastRead.text = that_line; 
    lastRead.top = offset; 
    lastRead.left = that_left; 
    lastRead.font_size = that_size; 
    lastRead.font_family = ft_family; 
    lastRead.font_weight = ft_weight; 
    lastRead.font_style = ft_style; 
    var url = window.location.href;
    localStorage.setItem( url, JSON.stringify(lastRead) ); 

    // ==============================================================
    //     4 
    //     recover, very important, prevent break origin page.
    // =============================================================
    $(e.target).html(prev_version); 
    return;
     
});

// The following "wrapLines" function come from stackoverflow
// http://stackoverflow.com/questions/16223213/how-to-capture-one-line-of-text-in-a-div
// Thanks to Pevara
function wrapLines($container) {

    var text = $container.text();
    var words = text.split(' ');
    
    // wrap each word in a span and add it to a tmp
    var tmp = '';
    $.each(words, function(i, word) {
        tmp += '<span>' + word + '</span> ';
    });
    
    // remove the text from the container, and replace it with the wrapped words
    $container.text('').append($(tmp));
    
    // prepare the offset variable and tmp
    var tmp = '';
    var top = null;
    $container.find('span').each(function(index, word) {
        $word = $(word);
        // if this is the first iteration
        if (top == null) {
            // set the top
            top = $word.position().top;
            // open the first line
            tmp = '<span class="line">';
        }
        
        // if this is a new line (top is bigger then the previous word)
        if (top < $word.position().top) {
            // close the previous line and start a new one
            tmp += '</span><span class="line">';
            // change the top
            top = $word.position().top;            
        }
        
        // add the content of the word node + a space
        tmp += $word.text() + ' ';
    });
    // close the last line
    tmp += '</span>';
    
    // remove the content of the conatiner, and replace it with the wrapped lines
    $container.html($(tmp));    
}

// recover last read position
$(function(){
    var url = window.location.href;
    if( localStorage.getItem(url) != null){

        lastRead = JSON.parse( localStorage.getItem(url) );

        var newDiv = document.createElement("div");             
        var newContent = document.createTextNode(lastRead.text); 
        newDiv.appendChild(newContent); // text node
        newDiv.id = "chrome-ext-hightlight";

        var cs = 'top: ' + lastRead.top + "px; ";
        cs += 'padding-left: ' + lastRead.left + "px; ";
        cs += 'font-size: ' + lastRead.font_size + ';';
        cs += 'font-family: ' + lastRead.font_family + ';';
        cs += 'font-weight: ' + lastRead.font_weight + ';';
        cs += 'font-style: ' + lastRead.font_style + ';';

        newDiv.style.cssText = cs;
        $(newDiv).addClass('chrome-ext-hightlight-box');

        if ( localStorage.getItem('status') == 'off' ){
           $(newDiv).hide();
        } else {
            // jump to last time read position temperly diable in this version.
            // var lastReadDiv = document.createElement("div");             
            // var lastReadDivContent = document.createTextNode('Click here go to last time read position'); 
            // lastReadDiv.appendChild(lastReadDivContent); // text node
            // $(lastReadDiv).addClass('chrome-ext-highlight-lastTime-box');
            // lastReadDiv.id = "chrome-ext-highlight-lastTime";
            // $('html').append(lastReadDiv); 
        }
        
        $('html').append(newDiv); 

    }

    // last time read click event
    $('#chrome-ext-highlight-lastTime').click(function(e){
        $(this).fadeOut();
        $('html,body').animate({scrollTop: $('#chrome-ext-hightlight').offset().top - 100}, 
            400);
        e.stopPropagation(); 
    });
});

// background page would handle click event on top right extention icon
// and here we receive message from background page
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.status == "off"){
        $('#chrome-ext-hightlight').hide();
        localStorage.setItem('status', 'off'); 
        // 似乎不是全局存储, 所以导致了状态不一样的问题
        // 取消点击事件还没做
    } else {
        $('#chrome-ext-hightlight').show();
        localStorage.setItem('status', 'on'); 
    }
});
/*
    key press
    还蛮麻烦的，不知道咋做
*/
/*$(document).on('keypress', function(e) {
    var tag = e.target.tagName.toLowerCase();
    console.log(e.which);
    if ( (e.which === 87 || e.which === 119) && tag != 'input' && tag != 'textarea'){
    // W or w
         // console.log('W');
    } else if ( (e.which === 83 || e.which === 115) && tag != 'input' && tag != 'textarea'){
    // S or s
         // console.log('S');
    }
       
});*/
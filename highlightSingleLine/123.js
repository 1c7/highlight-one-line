console.log('Hightlight Single Line working~');
/*
    1 开启, 关闭功能，因为有些网站比如 Google 不需要
    // disable hightlight on this website.

    3 记忆阅读功能
    // 先做这个
*/
/*
Author: Github @1c7
Bug & Suggestion: guokrfans#gmail.com
========================================
        How this code work?
========================================
    Premise:
        there no API in Javascript or Browser can let you easily get one line text.
        that is annoying.

    So our solution is:
        1. when User click on text, break that big chunk text into word by split(), and wrap it with <span>
        now we get many <span class='line'> element 
        each <span> is one line text

        2. create a position:absolute <div>, append to <body>
        <div> text content is one line text we get from previous step

        3. put that div on page to *overlay* origin text.



        文字元素上级 = body， 所以这个管用，

*/
var count = 0; // count for test
var prev_version = "";


// $(window).on("load scroll resize", function() {
//   var viewportOffset = getViewportOffset($("#element"));
//   $("#log").text("left: " + viewportOffset.left + ", top: " + viewportOffset.top + ", insideViewport: " + viewportOffset.insideViewport);
// });        

var cumulativeOffset = function(element) {
    var top = 0, left = 0;
    do {
        top += element.offsetTop  || 0;
        left += element.offsetLeft || 0;
        element = element.offsetParent;
    } while(element);

    return {
        top: top,
        left : left
    };
}; 

$(window).click(function(e){

});
$('p, div, h1, h2, h3, h4, h5, h6, a').click(function(e){
    count ++;
    console.log('------------------ ' + count +' -------------------');

    var parentTagName = $(e.target).parent()[0].tagName;
    // console.log(parentTagName);

    var tagName = $(e.target)[0].tagName; // get current element tag name
    // console.log(tagName);
    if (tagName == "A" || tagName == "CODE"){
        return;
    }
    if (tagName == "DIV" && $(this)[0].children.length != 0){
        // there are div only contain text, and div contain child element. two type div.
        // that is a problem.
        // so by children.length != 0
        // we can know if this div contain child element.
        // != 0 mean there are child element.

        // if so, we return;
        return;
    }

    prev_version = $(e.target).html(); // save before change
    console.log(prev_version);

    // ==========================================  wrapLines  ===================================
    wrapLines($(e.target));  

    var x = e.clientX; // this would change every time you click
    var y = e.clientY;
    console.log('click x', x);
    console.log('click y', y);


    var that_element = $(document.elementFromPoint(x, y)); 



    console.log(that_element);
    var p = that_element[0].getBoundingClientRect();
    console.log(p);
    console.log(p.left);
    // 解决了区块的问题, 就是把那一整段的文字都拿到了, 而不是我们想要的一句.
    // 你可以去掉这行试试效果就知道了, 会得到多行的文字. 而不是点击的那一行的文字.
    if( that_element.hasClass('line') == false ){
        return;
    }
     var bodyRect = document.body.getBoundingClientRect(),
    elemRect = p;
    // var offset = that_element.offset();
    // var that_top = offset.top - $(window).scrollTop();
    // var that_left = offset.left - $(window).scrollLeft(); 

    // var that_top = that_element.scrollTop()
    // var that_left = that_element.scrollLeft(); 

    // 100 是哪里来的？？

    var viewportOffset = getViewportOffset(that_element);
    // var that_top = viewportOffset.top + that_element.scrollTop(); 

    var that_top = viewportOffset.top + that_element.position().top; 
    console.log(viewportOffset.top);
    console.log(that_element.position().top);
    // console.log(viewportOffset.insideViewport);

    
    


    // var that_left = that_element.position().left;

    // var rect = that_element.getBoundingClientRect();
    // console.log(rect.top, rect.right, rect.bottom, rect.left);   



    // var that_top = that_element.position().top;
    // var that_left = that_element.position().left;


  // $("#log").text("left: " + viewportOffset.left + ", top: " + viewportOffset.top + ", insideViewport: " + viewportOffset.insideViewport);
     

    console.log('toooooooop:  ',that_top);
    // console.log(that_left);
    var that_line = that_element.text(); 

    var that_size = that_element.css('font-size');  // 30px for example
    var ft_family = that_element.css('font-family');  
    var ft_weight = that_element.css('font-weight');  
    var ft_style = that_element.css('font-style'); 

    // ==============================================================
    // recover, very important, prevent break origin page.
    // =============================================================
   



    if ($('#chrome-ext-hightlight').length > 0){
        var float_div = $('#chrome-ext-hightlight');
        float_div.text(that_line);
        var newDiv = float_div[0];
    } else {
        var newDiv = document.createElement("div");             
        var newContent = document.createTextNode(that_line); 
        newDiv.id = "chrome-ext-hightlight";
    }
    // $("#chrome-ext-hightlight").remove();

    // ===================================
    // 
    // now create a elment
    // 
    // ====================================



    offset   = elemRect.top - bodyRect.top;

// alert('Element is ' + offset + ' vertical pixels from <body>');

    var that_top = p.top;
    var that_left = p.left;
    var cs = 'position:absolute; background-color:#3e3e3e; color:#E8E8E8; '; 
     cs += 'top: ' + offset + "px; ";
     cs += 'padding-left: ' + that_left + "px; text-align: left;";
     cs += 'font-size: ' + that_size + ';';
     cs += 'width:100%;';
     cs += 'line-height: initial;';
     cs += 'font-family: ' + ft_family + ';';
     cs += 'font-weight: ' + ft_weight + ';';
     cs += 'font-style: ' + ft_style + ';';


    newDiv.style.cssText = cs;
    newDiv.appendChild(newContent); // text node
    // $(newDiv).removeCSS
    $('body').append(newDiv);


    e.stopPropagation(); 
        // without stopPropagation would cause some problem. 
        // like var that_left = that_element.position().left; would get 0 for unknow reason
    $(e.target).html(prev_version); 
    return;
     
});

// http://stackoverflow.com/questions/16223213/how-to-capture-one-line-of-text-in-a-div
// Thanks to Pevara
// btw: I didn't post that question, I just copy & paste that useful code
function wrapLines($container) {
    // get the text from the conatiner
    var text = $container.text();
    
    // split the text into words
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



function getViewportOffset($e) {
  var $window = $(window),
    scrollLeft = $window.scrollLeft(),
    scrollTop = $window.scrollTop(),
    offset = $e.offset(),
    rect1 = { x1: scrollLeft, y1: scrollTop, x2: scrollLeft + $window.width(), y2: scrollTop + $window.height() },
    rect2 = { x1: offset.left, y1: offset.top, x2: offset.left + $e.width(), y2: offset.top + $e.height() };
  return {
    left: offset.left - scrollLeft,
    top: offset.top - scrollTop,
    insideViewport: rect1.x1 < rect2.x2 && rect1.x2 > rect2.x1 && rect1.y1 < rect2.y2 && rect1.y2 > rect2.y1
  };
}



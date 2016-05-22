console.log('= Chrome Extenstion "Hightlight Single Line" is running');
console.log('= If this page got display problem, maybe you should try to turn off this extension. and then debug. it may help.');
/*
    1 开启, 关闭功能，因为有些网站比如 Google 不需要
    // disable hightlight on some website.

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

*/
// var count = 0; // count for test
var prev_version = "";

$('p, div, h1, h2, h3, h4, h5, h6, a').click(function(e){
    

    // count ++;
    // console.log('------------------ ' + count +' -------------------');

    var x = e.clientX; // this would change every time you click
    var y = e.clientY;

    // ===================================
    //    in some case, we don't want highlight that line
    // ===================================
    var parentTagName = $(e.target).parent()[0].tagName; // get current element tag name
    if (parentTagName == "BUTTON"){
        return;
    }

    var tagName = $(e.target)[0].tagName; // get current element tag name
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

    e.stopPropagation(); // prevent repeat call
    
    prev_version = $(e.target).html(); // save before change

    // ==========================================  wrapLines  ===================================
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

    // console.log('toooooooop:  ',that_top);
    var that_line = that_element.text(); 

    var that_size = that_element.css('font-size');  // 30px for example
    var ft_family = that_element.css('font-family');  
    var ft_weight = that_element.css('font-weight');  
    var ft_style = that_element.css('font-style'); 


    if ($('#chrome-ext-hightlight').length > 0){
        var float_div = $('#chrome-ext-hightlight');
        float_div.text(that_line);
        var newDiv = float_div[0];
    } else {
        var newDiv = document.createElement("div");             
        var newContent = document.createTextNode(that_line); 
        newDiv.appendChild(newContent); // text node
        newDiv.id = "chrome-ext-hightlight";
    }


    // ===================================
    //       now create a elment
    // ===================================
    
    var that_left = p.left;

    var cs = 'position:absolute; background-color:#3e3e3e !important; color:#E8E8E8 !important; '; 
     cs += 'top: ' + offset + "px; ";
     cs += 'padding-left: ' + that_left + "px; text-align: left;";
     cs += 'font-size: ' + that_size + ';';
     cs += 'width:100%;';
     cs += 'line-height: initial;';
     cs += 'font-family: ' + ft_family + ';';
     cs += 'font-weight: ' + ft_weight + ';';
     cs += 'font-style: ' + ft_style + ';';

    newDiv.style.cssText = cs;
    $('body').append(newDiv);

    // ==============================================================
    //     recover, very important, prevent break origin page.
    // =============================================================
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
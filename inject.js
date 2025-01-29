function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/*-------------------------------------------------------------------------------------------------------------------------------------*/
function keepTrackOf(elementName, selector, action){
    var selected = true;
    var elem = selector(elementName);
    selected = (elem != null);
        if(selected){
            elem.setAttribute("luvTracking", "true");
            action(elem);
        }
        
        const config = { childList: true, subtree: true};
        const callback = (mutationList, observer) => {
           mutationList.forEach(function(mutation) {
               if(selected){
                    var removedNodesArr = Array.from(mutation.removedNodes);           
                    if (removedNodesArr.indexOf(elem) > -1 || removedNodesArr.some(parent => parent.contains(elem))) { // if node removed
                      selected = false;
                    }
               }     
           });
           
           if(!selected){// if node not selected, search for it
                    elem  = selector(elementName);
                    selected = (elem != null);
                    if(selected){
                       elem.setAttribute("luvTracking", "true");
                       action(elem);
                   }
           }
           
        };
        const observer = new MutationObserver(callback);
        observer.observe(document.body, config);
}

(function (){        
        
        //showWindow();
        
        
        keepTrackOf("caption-window-1",str => document.getElementById(str) , alignSubtitles);
        keepTrackOf("span.ytp-caption-segment:not([id='luvWord'], [luvTracking = 'true'])",str => document.querySelector(str) , handleCaptionSegment);
        keepTrackOf("span.ytp-caption-segment:not([id='luvWord'], [luvTracking = 'true'])",str => document.querySelector(str) , handleCaptionSegment);
})();

function alignSubtitles(captionWindow){
        var textAlign = captionWindow.style.textAlign;
        if(captionWindow && textAlign != undefined){
            if(textAlign === "right"){
                  let el = document.createElement('style');
                  el.type = 'text/css';
                  el.innerText = ".html5-video-player .caption-visual-line .ytp-caption-segment:last-child { padding-left: .25em; padding-right: 0;}";
                  document.head.appendChild(el);
            }else if(textAlign === "left"){
                  let el = document.createElement('style');
                  el.type = 'text/css';
                  el.innerText = ".html5-video-player .caption-visual-line .ytp-caption-segment:last-child { padding-left: 0; padding-right: .25em;}";
                  document.head.appendChild(el);
            }
        }
}

function splitSegment(segment,text,modifying){

     if(segment != null && text != undefined){
            var separator = ' '
            
            wordsWithEmptyStrings = text.replaceAll(' ',separator).split(separator);
            
            var words = [];
            wordsWithEmptyStrings.forEach(function(w){//remove empty strings
                if(!(w==="")){
	                 words.push( w);
	             }
            });
            
	        words.forEach(function(w,i){
	                 if(w===""){
	                     return;
	                 }
	                 var txt = w;
	                 /*if( i != words.length - 1){
	                    txt = w.concat(separator);
	                 }
	                 if(i == 0){
	                    txt = "".concat(separator,w);
	                 }*/

	             

	             var newWord = segment.cloneNode(true);
	             makeLuvWord(newWord, txt);
	                             //newWord.style.whiteSpace = 'normal';
	             if(!modifying){
	                newWord.style.backgroundColor = 'blue';
	             }
	             segment.parentNode.appendChild(newWord);
	         });
	         segment.style.display = 'none';
	        
	     }    
}

function cleanupSplitWords(segment){
    segment.parentNode.childNodes.forEach(function (w){
        if((w.id === 'luvWord')){
            w.remove();
            
        }
    });
    
}

function handleCaptionSegment(segment){
        if(segment.id === 'luvWord'){
	            console.log("abort handle luv word");
	             return;
	    }

       makeCaptionsNotDragable();
       splitSegment(segment, segment.innerText, false);
       new MutationObserver( (mutationList) => {
            for (const mutation of mutationList) {

                if(mutation.addedNodes[0].nodeType == Node.TEXT_NODE){
                    //console.log(mutation.addedNodes[0].nodeValue);
                    var w = mutation.addedNodes[0].nodeValue;
                    splitSegment(segment,w, true);
                }
            }
       }).observe(segment,{ childList: true, subtree: true, characterData : true});
    
}



/*---------------------------------------------------------------------------------------------------------------------------------*/
function showWindow(){
    var div = document.createElement('div');
    div.id = "LuvWindow";
    div.innerText = "Luv is All";
    var prev = document.getElementById("LuvWindow");
    while(prev != null){
        prev.remove();
        prev = document.getElementById("LuvWindow");
    }
    div.style.height = window.innerHeight/3 + "px" ;
    div.style.width = window.innerWidth + "px";
    document.body.appendChild(div);
}/*-------------------------------------------------------------------------------------------------------------------------------------*/
function makeLuvWord(w, text){
        
	    w.style.display = "inline-block";
	    w.style.backgroundColor = 'green';
	    w.innerText = text;
	    w.id = 'luvWord';
        w.style.border='solid';
        w.style.borderWidth = '0px 0.15em';
        w.style.borderColor = 'transparent';
        w.addEventListener("mousedown", function (event) {
            //showWindow();
            console.log(w.innerText);
            event.stopPropagation(); 
        }, true);
        
        w.addEventListener("mouseover", function (event) {
            w.style.borderWidth = '0.12em 0.15em';
            w.style.borderColor = 'yellow'; 
        }, true);
         w.addEventListener("mouseout", function (event) {
            w.style.borderWidth = '0px 0.15em';
            w.style.borderColor = 'transparent'; ; 
        }, true);
}
function makeCaptionsNotDragable(){
     elem=document.querySelector("div.caption-window");
    if(elem!=null){
        elem.setAttribute("draggable", "false");
        elem.style.userSelect="none";
        elem.style.cursor="default";
    }
}

	console.log("injected !! ");
	
/*  
        TODOLIST :
-handle 1st space issue
-refaire l'apparence des mot selectioné
-get display style of modified segment (in splitSegment)
-ne pas attendre un event pour modifier un texte
-rendre la modification pour tous les texts de la page
-gerer la ponctuation : d' . - ... 
-acceder a la traduction fournie par yt


cd dev/Luv
git add .
git commit -m "solved right text align padding problem and added a tracker to udate it automatically"

*/

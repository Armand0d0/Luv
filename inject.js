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
        observer.observe(document.getElementById('luvFrame').contentWindow.document.body, config);

}

function onLuvFrameLoad(luvFrame){

      keepTrackOf("caption-window-1",str => luvFrame.contentWindow.document.getElementById(str) , alignSubtitles);
      keepTrackOf("span.ytp-caption-segment:not([id='luvWord'], [luvTracking = 'true'])",str => luvFrame.contentWindow.document.querySelector(str) , handleCaptionSegment);
      keepTrackOf("span.ytp-caption-segment:not([id='luvWord'], [luvTracking = 'true'])",str => luvFrame.contentWindow.document.querySelector(str) , handleCaptionSegment);
}


(function (){        
        for (const c of document.body.children){
          c.remove()
        }

         var luvFrame = document.createElement("iframe");
        luvFrame.id = "luvFrame";
        //console.log(location.href);
        luvFrame.setAttribute("src",location.href);
        luvFrame.onload  = (() => onLuvFrameLoad(luvFrame));
        luvFrame.style.width = "50vw";
        luvFrame.style.height = "100vh";
        document.body.prepend(luvFrame);
         
        /*var intervalId = setInterval(waitLuvFrame, 5000);
        function waitLuvFrame(){
            console.log("waiting");
            if(document.getElementById('luvFrame').contentWindow.document.body != null){
                var n = document.getElementById('luvFrame').contentWindow.document.body.children.length;
                    if(n > 0){
                        console.log("loaded",n);
                        clearInterval(intervalId);
                        
                    }
            }
        }*/

})();

/*(function(){
      setInterval(printCap, 1000);
      function printCap(){
        console.log(document.getElementById('luvFrame').contentWindow.document.querySelector("span.ytp-caption-segment:not([id='luvWord'], [luvTracking = 'true'])"));
      }
})();//*/


function alignSubtitles(captionWindow){
        var textAlign = captionWindow.style.textAlign;
        var old = document.getElementById('luvFrame').contentWindow.document.getElementById("luvTextAlign");
        if(old){
            old.remove();
        }
        if(captionWindow && textAlign != undefined){
            if(textAlign === "right"){
                  let el = document.getElementById('luvFrame').contentWindow.document.createElement('style');
                  el.type = 'text/css';
                  el.id = 'luvTextAlign';
                  el.innerText = ".html5-video-player .caption-visual-line .ytp-caption-segment:last-child { padding-left: .25em; padding-right: 0; "+
                  "border-style: solid; border-color : transparent; border-width: 0px 0.15em}";
                  document.getElementById('luvFrame').contentWindow.document.head.appendChild(el);
            }else if(textAlign === "left"){
                  let el = document.getElementById('luvFrame').contentWindow.document.createElement('style');
                  el.type = 'text/css';
                  el.id = 'luvTextAlign';
                  el.innerText = ".html5-video-player .caption-visual-line .ytp-caption-segment:last-child { padding-left: 0; padding-right: .25em; " + 
                  "border-style: solid; border-color : transparent; border-width: 0px 0.15em}";
                  document.getElementById('luvFrame').contentWindow.document.head.appendChild(el);
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
	             var newWord = segment.cloneNode(true);
	             makeLuvWord(newWord, w);
	             
	             /*if(!modifying){
	                newWord.style.backgroundColor = 'blue';
	             }*/
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
	             return;
	    }

       makeCaptionsNotDragable();
       splitSegment(segment, segment.innerText, false);
       new MutationObserver( (mutationList) => {
            for (const mutation of mutationList) {

                if(mutation.addedNodes[0].nodeType == Node.TEXT_NODE){
                    var w = mutation.addedNodes[0].nodeValue;
                    splitSegment(segment,w, true);
                }
            }
       }).observe(segment,{ childList: true, subtree: true, characterData : true});
    
}

function makeLuvWord(w, text){
        
	    w.style.display = "inline-block";
	    //w.style.backgroundColor = 'green';
	    w.innerText = text;
	    w.id = 'luvWord';
        w.style.border='solid';
        w.style.borderWidth = '0px 0.15em';
        w.style.borderColor = 'transparent';
        w.addEventListener("mousedown", function (event) {
            
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
     elem= document.getElementById('luvFrame').contentWindow.document.querySelector("div.caption-window");
    if(elem!=null){
        elem.setAttribute("draggable", "false");
        elem.style.userSelect="none";
        elem.style.cursor="default";
    }
}

	console.log("injected !! ");
	
/*  
        TODOLIST :

-refaire l'apparence des mot selectioné
-get display style of modified segment (in splitSegment)
-ne pas attendre un event pour modifier un texte
-rendre la modification pour tous les texts de la page
-gerer la ponctuation : d' . - ... 
-gerer les autres alphabets
-acceder a la traduction fournie par yt


cd dev/Luv
git add .
git commit -m "cleanup"

*/

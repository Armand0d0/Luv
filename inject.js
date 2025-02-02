function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}



/*-------------------------------------------------------------------------------------------------------------------------------------*/
function keepTrackOf(doc, selector, action){
    var selected = true;
    var elem = selector(doc);
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
                    elem  = selector(doc);
                    selected = (elem != null);
                    if(selected){
                       elem.setAttribute("luvTracking", "true");
                       action(elem);
                   }
           }
           
        };
        const observer = new MutationObserver(callback);
        observer.observe(doc.body, config);

}

function onLuvFrameLoad(luvFrame){

      keepTrackOf(luvFrame.contentWindow.document, (doc) => doc.getElementById("caption-window-1") , alignSubtitles);
      keepTrackOf(luvFrame.contentWindow.document, (doc) => doc.querySelector("span.ytp-caption-segment:not([id='luvWord'], [luvTracking = 'true'])") , handleCaptionSegment);
      keepTrackOf(luvFrame.contentWindow.document, (doc) => doc.querySelector("span.ytp-caption-segment:not([id='luvWord'], [luvTracking = 'true'])") , handleCaptionSegment);
      
      luvFrame.contentWindow.document.body.onmousedown = function(e){
            console.log(e.target);
            var url = e.target.href;
            if(url == null){
                url = e.target.baseURI;
            }
            if(url != window.location.href){
                console.log("new url : " + url);
            }
      };

}


(function (){        
        for (const c of document.body.children){
          c.remove()
        }
        var youtube = true;
        if(youtube){
            keepTrackOf(document, (doc) => doc.getElementsByTagName("ytd-app")[0],  function(n){
                //console.log("yt app hidden", n);
                n.style.display = "none";//setAttribute("style","display: none");
                //n.remove();
            });
            keepTrackOf(document, (doc) => doc.getElementById("watch-page-skeleton"),  function(n){
                //console.log("yt app hidden", n);
                n.style.display = "none";//setAttribute("style","display: none");
                //n.remove();
            });
        }
        cleanUp(document.getElementById("luvFrame"));

            var luvFrame = document.createElement("iframe");
            luvFrame.id = "luvFrame";
            //console.log(location.href);
            luvFrame.setAttribute("src",location.href);
            luvFrame.onload  = (() => onLuvFrameLoad(luvFrame));
            luvFrame.style.width = "100vw";
            luvFrame.style.height = "100vh";
            luvFrame.setAttribute("sandbox","allow-top-navigation allow-same-origin allow-scripts");
            document.body.appendChild(luvFrame);
        
        
        cleanUp(document.getElementById("luvPannelFrame"));

            var luvPannelFrame = document.createElement("div");
            luvPannelFrame.id = "luvPannelFrame";
            luvPannelFrame.style.position = "fixed";
            luvPannelFrame.style.right = "0px";
            luvPannelFrame.style.top = "0px";
            luvPannelFrame.style.width = "0vw";
            luvPannelFrame.style.height = "100vh";
            luvPannelFrame.setAttribute("isOpened","false");

            var wiktionary = document.createElement("iframe");
            wiktionary.setAttribute("src","https://www.wiktionary.org/wiki/");
            wiktionary.style.width = "100%";
            wiktionary.style.height = "100%";
            wiktionary.id = "wiktionary";
            
            var menuBar = document.createElement("div");
            menuBar.id = "menuBar";
            //menuBar.style.position = "fixed";
            menuBar.style.right = "0px";
            menuBar.style.top = "0px";
            menuBar.style.width = "100%";
            menuBar.style.height = "20px";
            
            var cross = document.createElement("button");
            cross.id = "cross";
           // cross.style.position = "absolute";
            /*cross.style.left = "0px";
            cross.style.top = "0px";*/
            cross.style.width = "25px";
            cross.style.height = menuBar.style.height;
            cross.style.backgroundColor = "red";
            cross.style.border = "solid red 2px"
            cross.innerText = "x";
            cross.addEventListener("click", closeLuvPannel);

            var slider = document.createElement("div");
            slider.id = "slider";
            slider.style.position = "absolute";
            slider.style.top = "0px";
            slider.style.left = "0px";
            slider.style.width = "5px";
            slider.style.height = "100%";
            slider.style.backgroundColor = "black";

            luvPannelFrame.appendChild(menuBar);
            menuBar.appendChild(cross);
            luvPannelFrame.appendChild(slider);
            luvPannelFrame.appendChild(wiktionary);
            document.body.appendChild(luvPannelFrame);
        
            makeSlider(slider);

        

})();

function makeSlider(elmnt) {
    var pos1 = 0, pos2 = 0;
    elmnt.style.cursor="col-resize";
    elmnt.onmousedown = dragMouseDown;
    var luvPannelFrame = document.getElementById("luvPannelFrame");
    var luvFrame = document.getElementById("luvFrame");

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        pos2 = e.clientX;

        document.onmouseup = closeDragElement;
        luvFrame.contentWindow.document.addEventListener("mouseup",closeDragElement);
        document.onmousemove = elementDrag;
        luvFrame.contentWindow.document.addEventListener("mousemove",elementDrag);

      }
      function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();

        pos1 = pos2 - e.clientX;
        pos2 = e.clientX;

        pos1 = pos1/window.innerWidth *100;
        luvPannelFrame.style.width = (parseFloat(luvPannelFrame.style.width)+pos1) + "vw";
        luvFrame.style.width = (parseFloat(luvFrame.style.width)-pos1) + "vw";

      }
    
      function closeDragElement() {
        document.onmouseup = null;
        luvFrame.contentWindow.document.removeEventListener("mouseup",closeDragElement);
        document.onmousemove = null;
        luvFrame.contentWindow.document.removeEventListener("mousemove",elementDrag);
      }
    
}

function closeLuvPannel(){
        document.getElementById("luvPannelFrame").setAttribute("isOpened","false");
        document.getElementById("luvPannelFrame").style.width = "0vw";
        document.getElementById("luvFrame").style.width = "100vw";
}
function openLuvPannel(word){
        
        var video = document.getElementById("luvFrame").contentWindow.document.getElementsByTagName("video")[0];
        if(video != null){
            video.pause();
        }
        if(document.fullScreen || document.mozFullScreen || document.webkitIsFullScreen){
            document.getElementById("luvFrame").contentWindow.document.exitFullscreen();
        }
        wiktionary = document.getElementById("wiktionary");
        wiktionary.setAttribute("src","https://www.wiktionary.org/wiki/" + word);
        var luvPannelFrame = document.getElementById("luvPannelFrame");
        if(luvPannelFrame.getAttribute("isOpened") === "false"){
            luvPannelFrame.setAttribute("isOpened","true");
            var defaultViewWidth = 30;
            luvPannelFrame.style.width = defaultViewWidth + "vw";
            document.getElementById("luvFrame").style.width = 100-defaultViewWidth + "vw";
        }
}

/*(function(){
      setInterval(printCap, 1000);
      function printCap(){
        console.log(document.getElementById('luvFrame').contentWindow.document.querySelector("span.ytp-caption-segment:not([id='luvWord'], [luvTracking = 'true'])"));
      }
})();//*/
function cleanUp(old){
    if(old){
            old.remove();
    }
}

function alignSubtitles(captionWindow){
        var textAlign = captionWindow.style.textAlign;
        cleanUp(document.getElementById('luvFrame').contentWindow.document.getElementById("luvTextAlign"));
    
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
            openLuvPannel(w.innerText);
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
-store defaultViewWidth
-keepTrackOfAll
-open luv pannel next to a fullscreen video
-make navigation possible in iframe 
-when click on yt link check if it the same viedo with a slightly difrent url (split &)
-refaire l'apparence des mot selectioné
-netflix 
-get display style of modified segment (in splitSegment)
-make evry text on the page clickable
-handle punctuation : d' . - ... 
-handle other alphabets
-get the yt translation


cd dev/Luv
git add .
git commit -m "made click on a luv word pause, exitfullscreen and search the word in a wiktionary iframe"

*/

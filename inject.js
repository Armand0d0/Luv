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
var ytPlayerResponse;
var ytCaptionsNodes;
function onLuvFrameLoad(luvFrame){

        


        keepTrackOf(luvFrame.contentWindow.document, (doc) => doc.getElementById("caption-window-1") , alignSubtitles);
        keepTrackOf(luvFrame.contentWindow.document, (doc) => doc.querySelector("span.ytp-caption-segment:not([name='luvWord'], [luvTracking = 'true'])") , handleCaptionSegment);
        keepTrackOf(luvFrame.contentWindow.document, (doc) => doc.querySelector("span.ytp-caption-segment:not([name='luvWord'], [luvTracking = 'true'])") , handleCaptionSegment);
      
        luvFrame.contentWindow.document.body.onmousedown = function(e){
                //console.log(e.target, e.target.getAttribute("name"));
                var w = e.target;
                if(w.getAttribute("name") === "luvWord"){
                        openLuvPannel(w.innerText);//, wordInfo);
                        e.stopPropagation(); 
                }
                /*var url = e.target.href;
                if(url == null){
                    url = e.target.baseURI;
                }
                if(url != window.location.href){
                    //console.log("new url : " + url);
                }*/
        };
        
        luvFrame.contentWindow.document.body.ontouchend = luvFrame.contentWindow.document.body.onmousedown;
        
        luvFrame.contentWindow.document.body.addEventListener("mouseover", function(e){
            var w = e.target;
            if(w.getAttribute("name") === "luvWord"){
                
                w.style.borderWidth = '0.12em 0.15em';
                w.style.borderColor = 'yellow'; 
            }
        }, true);
        luvFrame.contentWindow.document.body.addEventListener("mouseout", function(e){
            var w = e.target;
            if(w.getAttribute("name") === "luvWord"){
                w.style.borderWidth = '0px 0.15em';
                w.style.borderColor = 'transparent'; ; 
            }
        },true);
       
}

async function onSubmit(e){
    e.preventDefault();
    var wordInfosDoc = document.getElementById("wordInfos").contentWindow.document;
    var word = wordInfosDoc.getElementById("selectedWord").innerText;
    var wordInfo = await getLuvWordInfo(word);
    wordInfo.translation = wordInfosDoc.getElementById("translation").value;
    wordInfo.pronunciation = wordInfosDoc.getElementById("pronunciation").value;

    for(var i = 0; i<6; i++){
        if( wordInfosDoc.getElementById("status" + i).checked){
            wordInfo.knowledge = wordInfosDoc.getElementById("status" + i).value;
        }
    }

    updateStyleAll(wordInfo);
    saveLuvWordInfo(wordInfo);
}
//-------------------------------------------------------------------------------------------------------------------------------------------------
(async function (){
   

        for (const c of document.body.children){
          //c.remove();
          c.style.display = "none";
        }
        var youtube = true;
        if(youtube){
            keepTrackOf(document, (doc) => doc.getElementsByTagName("ytd-app")[0],  function(n){

                n.style.display = "none";
                //n.remove();
            });
            keepTrackOf(document, (doc) => doc.getElementById("watch-page-skeleton"),  function(n){
                n.style.display = "none";
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
            /*luvFrame.onload = function(){
                                
            };*/
            document.body.appendChild(luvFrame);
            
        
        
        cleanUp(document.getElementById("luvPannelFrame"));

            var luvPannelFrame = document.createElement("div");
            luvPannelFrame.id = "luvPannelFrame";
            luvPannelFrame.style.position = "fixed";
            luvPannelFrame.style.right = "0px";
            luvPannelFrame.style.top = "0px";
            luvPannelFrame.style.width = "0vw";
            luvPannelFrame.style.height = "100vh";
            luvPannelFrame.style.backgroundColor ="white";
            luvPannelFrame.setAttribute("isOpened","false");

            var wiktionary = document.createElement("iframe");
            wiktionary.setAttribute("src","https://www.wiktionary.org/wiki/");
            wiktionary.style.width = "100%";
            wiktionary.style.height = "50%";
            wiktionary.id = "wiktionary";
            
            var menuBar = document.createElement("div");
            menuBar.id = "menuBar";
            menuBar.style.right = "0px";
            menuBar.style.top = "0px";
            menuBar.style.width = "100%";
            menuBar.style.height = "20px";
            
            var cross = document.createElement("button");
            cross.id = "cross";
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
            slider.style.backgroundColor = "grey";
            slider.style.border = "solid black 2px";
            
            var wordInfos = document.createElement("iframe");
            var wordInfosUrl = browser.runtime.getURL("wordInfos.html");
            wordInfos.setAttribute("src",wordInfosUrl) ;
            wordInfos.style.width = "100%";
            wordInfos.style.height = "50%";
            wordInfos.id = "wordInfos";
            wordInfos.onload = function (){
                wordInfos.contentWindow.document.getElementById("wordForm").addEventListener("submit",onSubmit); 
            };

            luvPannelFrame.appendChild(menuBar);
            menuBar.appendChild(cross);
            luvPannelFrame.appendChild(slider);
            luvPannelFrame.appendChild(wordInfos);
            luvPannelFrame.appendChild(wiktionary);
            document.body.appendChild(luvPannelFrame);
        
            makeSlider(slider);

            
            ytPlayerResponse = getYtPlayerResponse();
            ytCaptionsNodes =  await getYtCaptionsNodes();

            

})();
//--------------------------------------------------------------------------------------------------------
var currentCaption = null;
async function onCaptionChange(newCaption){
    if(currentCaption){
        words = currentCaption.textContent.split(" ");
        for(const w of words) {
            var wordInfo = await getLuvWordInfo(w);
            if(wordInfo){
                wordInfo.seen++;
                //saveOccurence(w,videoId,captionId,timecode)
                saveLuvWordInfo(wordInfo);
            }else{//new word 
                saveLuvWordInfo({word: w, seen: 1, translation: "", pronunciation: "", knowledge: 0});
            } 
        }
        //saveCaption(currentCaption,videoId,timecode);
    }
    
    currentCaption = newCaption;
}
//--------------------------------------------------------------------------------------------------------
function checkCurrentCaption(){
    var newCaption = getCurrentCaption();
    if(!newCaption){
        console.log("failed getCurrentCaption !!");
        return;
    }
    if(currentCaption == null || newCaption.attributes.start.value != currentCaption.attributes.start.value){
        onCaptionChange(newCaption);
    }
}
function getCurrentCaption(){
    if(!ytCaptionsNodes){
        return null;
    }
    var video = document.getElementById("luvFrame").contentWindow.document.getElementsByTagName("video")[0];
    if(!video){
        return null;
    }

    var res = null;
    ytCaptionsNodes.forEach((cap) => {
        var start = parseFloat(cap.attributes.start.value);
        var dur = parseFloat(cap.attributes.dur.value);
        if(video.currentTime >= start && video.currentTime < start + dur){
            res = cap;
        }
        
    });
    return res;
}

async function getYtCaptionsNodes(){
    if(!ytPlayerResponse){
        return null;
    }
    let subsUrl = ytPlayerResponse.captions.playerCaptionsTracklistRenderer.captionTracks[0].baseUrl;
    let subs = await (await fetch(subsUrl)).text();
    let xml = new DOMParser().parseFromString(subs,"text/xml");
    textNodes = [...xml.getElementsByTagName('text')];
    textNodes.forEach(x => {
        x.textContent = x.textContent.replaceAll('&#39;',"'");
    });
    console.log("get yt captions : ",textNodes[0].textContent);
    return textNodes;
}

function getYtPlayerResponse(){
    var scriptContent =`document.body.setAttribute("data-playerResponse", JSON.stringify(  document.getElementsByTagName("ytd-app")[0].data.playerResponse ));`;
    //var luvFrameDoc = document.getElementById("luvFrame").contentWindow.document;
    var script_tag = document.createElement('script');
    script_tag.appendChild(document.createTextNode(scriptContent));
    
    (document.body || document.head || document.documentElement).appendChild(script_tag);
    const playerResponse_json = document.body.getAttribute('data-playerResponse');
    return JSON.parse(playerResponse_json);
}

async function openLuvPannel(text){ 
        
        var wordInfo = await getLuvWordInfo(text);

        //open iframe
        var video = document.getElementById("luvFrame").contentWindow.document.getElementsByTagName("video")[0];
        if(video != null){
            video.pause();
        }
        if(document.fullScreen || document.mozFullScreen || document.webkitIsFullScreen){
            document.getElementById("luvFrame").contentWindow.document.exitFullscreen();
        }
        wiktionary = document.getElementById("wiktionary");
        wiktionary.setAttribute("src","https://www.wiktionary.org/wiki/" + text);
        var luvPannelFrame = document.getElementById("luvPannelFrame");
        if(luvPannelFrame.getAttribute("isOpened") === "false"){
            luvPannelFrame.setAttribute("isOpened","true");
            var defaultViewWidth = 30;
            luvPannelFrame.style.width = defaultViewWidth + "vw";
            document.getElementById("luvFrame").style.width = 100-defaultViewWidth + "vw";
        }

        //load data
        var wordInfosDoc = document.getElementById("wordInfos").contentWindow.document;
        wordInfosDoc.getElementById("selectedWord").innerText = text;
        if(wordInfo.seen != undefined){
            wordInfosDoc.getElementById("seen").innerText ="Seen " + wordInfo.seen + " times.";
        }else{
            wordInfo.seen = 1;
            wordInfosDoc.getElementById("seen").innerText ="Seen 1 times.";
        }
        if(wordInfo.translation == undefined){
            wordInfo.translation = "";
        }
        if(wordInfo.pronunciation == undefined){
            wordInfo.pronunciation = "";
        }
        if(wordInfo.knowledge == undefined){
            wordInfo.knowledge = 0;
        }
        wordInfosDoc.getElementById("translation").value = wordInfo.translation;
        wordInfosDoc.getElementById("pronunciation").value = wordInfo.pronunciation;
        if(wordInfo.knowledge >0){
            wordInfosDoc.getElementById("status" + wordInfo.knowledge).checked = "true";
        }
        
        var seenColor = getSeenColor(wordInfo.seen);
        document.getElementById("wordInfos").contentWindow.document
        .getElementById("status0style").innerText = 
        "input[type=\"radio\"].status0 + label{ "+
            "background-color: " + seenColor + ";" +
            "border: 2px solid " + seenColor + ";" +
        "}";


}

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


/*(function(){
      setInterval(printCap, 1000);
      function printCap(){
        console.log(document.getElementById('luvFrame').contentWindow.document.querySelector("span.ytp-caption-segment:not([name='luvWord'], [luvTracking = 'true'])"));
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
                  el.innerText = ".html5-video-player .caption-visual-line .ytp-caption-segment:last-child {padding-left: 0; padding-right: 0; "+//.25em
                  "border-radius: 5px; border-style: solid; border-color : transparent; border-width: 0px 0.15em}";
                  document.getElementById('luvFrame').contentWindow.document.head.appendChild(el);
            }else if(textAlign === "left"){
                  let el = document.getElementById('luvFrame').contentWindow.document.createElement('style');
                  el.type = 'text/css';
                  el.id = 'luvTextAlign';
                  el.innerText = ".html5-video-player .caption-visual-line .ytp-caption-segment:last-child { padding-left: 0; padding-right: 0; " + 
                  "border-radius: 5px; border-style: solid; border-color : transparent; border-width: 0px 0.15em}";
                  //padding-top: .15em; padding-bottom: .15em; color: black; background: cyan
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
        if((w.name === 'luvWord')){
            w.remove();
            
        }
    });
    
}

function handleCaptionSegment(segment){
        if(segment.name === 'luvWord'){
	             return;
	    }
        checkCurrentCaption();
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
function saveLuvWordInfo(data){
    if(data.word == undefined || data.word == null){
        console.error("saveLuvWordInfo() was called on data without any word property");
        return null;
    }
    return browser.runtime.sendMessage({request: "setLuvWordInfo", wordInfo : data});
}
function getLuvWordInfo(word){

   return browser.runtime.sendMessage({request: "getLuvWordInfo", word : word})
            .then((e) => { return e;}, (e) => {
                console.log("response error ",e);
                return null;
            });//.then((e) => {return e;});
}

async function makeLuvWord(w, text){

	    w.style.display = "inline-block";
	    w.style.backgroundColor = 'cyan';
        w.style.color = 'black';//*/
	    w.innerText = text;
	    w.setAttribute("name", 'luvWord');
        w.style.border = 'solid';
        w.style.borderWidth = '0px 0.15em';
        w.style.borderColor = 'transparent';
        w.style.borderRadius= '5px';

        
        var wordInfo = await getLuvWordInfo(text);

        if(wordInfo){
            updateStyle(w,wordInfo);
            saveLuvWordInfo(wordInfo);
        }else{//new word 
            saveLuvWordInfo({word: text, seen: 1, translation: "", pronunciation: "", knowledge: 0});
        }

}
function updateStyleAll(wordInfo){
    var luvWords = document.getElementById("luvFrame").contentWindow.document.getElementsByName("luvWord");

    luvWords.forEach((domWord) => {
        if(domWord.innerText === wordInfo.word){
            updateStyle(domWord,wordInfo);
        }
    } );
}
function max(x,y){
    return x >= y ? x : y;
}
function getSeenColor(seen){
    return  "rgba(0,255," + max(255 - seen,160) + ")";
}

function updateStyle(domWord,wordInfo){
    knowledgeColors = ['rgb(255,99,63)','rgb(255, 133, 20)','rgb(255, 174, 0)', "rgb(255, 227, 0)", "rgb(118,230,6)" ];
    var seenColor = getSeenColor(wordInfo.seen);
    if(wordInfo.knowledge >0){
        domWord.style.backgroundColor = knowledgeColors[wordInfo.knowledge - 1];

    }else if(wordInfo.seen){
        domWord.style.backgroundColor = seenColor;
        
    }else{
        domWord.style.backgroundColor = 'cyan';
    }

}


function makeCaptionsNotDragable(){
     elem= document.getElementById('luvFrame').contentWindow.document.querySelector("div.caption-window");
    if(elem!=null){
        elem.setAttribute("draggable", "false");
        elem.style.userSelect = "none";
        elem.style.cursor = "default";
    }
}

	console.log("injected !! ");
	
/*  
        TODOLIST :
-
-keepTrackOfAll
-handle punctuation : d' . - ... 
-remake selected word style
-get current caption in the right language


-ytd-app issue: remove it (can block page from loading) or put display style to none (possible duplicate audible)
-make navigation possible in iframe 
-when click on yt link check if it the same viedo with a slightly difrent url (split &)

-get the yt translation
-make several words selectable 
-fix slider onrelase/mouseout issue
-shortcut ctrl + enter
-handle diffent background from browser theme
-make stored data exporatble and importable ,data loss  warning when storage limit is reach and when extension is uninstalled
-store defaultViewWidth
-open luv pannel next to a fullscreen video


-make evry text on the page clickable
-get display style of modified segment (in splitSegment)
-netflix 

-handle other alphabets
-split on custom prefix

*/

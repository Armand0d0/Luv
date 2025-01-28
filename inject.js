function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/*-------------------------------------------------------------------------------------------------------------------------------------*/
function keepTrackOf(elementName, selector, action){
    var selected = true;
    var elem = selector(elementName);
    selected = (elem != null);
        if(selected){
            action(elem);
            //console.log('An element ' + elementName + ' was found! ');
        }else{
          //console.log('!! No ' + elementName + ' was found!');
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
                       action(elem);
                       //console.log('An element ' + elementName + ' was found! ');
                   }
           }
           
        };
        const observer = new MutationObserver(callback);
        observer.observe(document.body, config);
}

(function (){
        //onload...
        
        
        //showWindow();

        //custom subtitles
        //keepTrackOf("ytp-caption-window-container", str => document.getElementById(str) , watchContainer);

        //generated subtitles
        //keepTrackOf("span.captions-text",str => document.querySelector(str) , watchSubs);
        keepTrackOf("ytp-caption-segment",str => document.getElementsByClassName(str)[0] , handleCaptionSegment);
        
        
})();
function handleCaptionSegment(segment){

        if(segment != null && segment.innerText != undefined){
        console.log("here");
            words = segment.innerText.split(' ');
	        words.forEach(function(w,i){
	             if(w===""){
	                 return;
	             }
	             var newWord = segment.cloneNode(true);
	             newWord.style.backgroundColor = 'black';
	             newWord.innerText = w+" ";
	             newWord.id = 'luvWord';
	             makeWord(newWord);
	             segment.parentNode.appendChild(newWord);
	         });
	         segment.style.display = 'none';
	     }    

    //watchCaption(segment);
    
}


/*-------------------------------------------------------------------------------------------------------------------------------------*/
function watchContainer(captionContainer){

        const config = { childList: true, subtree: true ,characterData : true};

        const callback = (mutationList, observer) => {
          for (const mutation of mutationList) {
                if(mutation.type === "childList" && mutation.addedNodes.length != 0){
                    makeCaptionsNotDragable();
                    mutation.addedNodes.forEach(function(n){
                        if(n.childNodes.length !=0){
                            lines = n.childNodes[0].childNodes
                            lines.forEach(attachSub);
                        }
                        
                    });
                }
          }
        };
        const observer = new MutationObserver(callback);
        observer.observe(captionContainer, config);
}
function watchSubs(targetCaptions){
    const config = { childList: true, subtree: true};
        const callback = (mutationList, observer) => {
          for (const mutation of mutationList) {
                if (mutation.type === "childList") {
                    mutation.addedNodes.forEach(function(line){
                        attachSub(line);
                        if(line.children != undefined && line.children.length !=0){
                            watchCaption(line.children[0]);
                        }
                    });
                }
          }
        };

        const observer = new MutationObserver(callback);
        observer.observe(targetCaptions, config);
        
}


function watchCaption(cap){
//console.log(cap);

        const configSub = { childList: true, subtree: true ,characterData : true};

        const callbackSub = (mutationList, observer) => {
          for (const mutation of mutationList) {
                if(mutation.type === "childList" && mutation.addedNodes.length != 0){
                   makeCaptionsNotDragable();
                   modifyText(mutation.target, cap.innerText);
                }
          }
        };
        const observerSub = new MutationObserver(callbackSub);
        observerSub.observe(cap, configSub);
}
    



function attachSub(line){
                if(line != null && line.children[0] != undefined){
                    sub = line.children[0];
    
                    if(sub != null && sub.innerText != undefined){


	                    words = sub.innerText.split(' ');
	                    words.forEach(function(w,i){
	                        if(w===""){
	                            return;
	                        }
	                        var newWord = sub.cloneNode(true);
	                        //newWord.style.backgroundColor = 'black';
	                        newWord.innerText = w+" ";
	                        newWord.id = 'luvWord';
	                        makeWord(newWord);
	                        line.appendChild(newWord);
	                    });
	                sub.style.display = 'none';
	                }
	            }
}
function modifyText(sub, txt){
                    console.log("HHHH");
	                var prefix = null;
	                if(!document.getElementById("captionPrefix")){
	                    var prefix = sub.cloneNode(true);
	                    prefix.style.display = 'none';
	                    prefix.id = "captionPrefix";
	                    prefix.innerText = "" ;
	                    sub.parentNode.appendChild(prefix);
                        
                        document.querySelectorAll('[id=luvWord]').forEach(function(e){
                            if(e.parentNode == sub.parentNode){
                                e.remove();
                            }
                        });

	                }else{
	                    prefix = document.getElementById("captionPrefix");
	                }
	                
	                newTextSize = txt.length - prefix.innerText.length;
	                difference = txt.slice(-newTextSize);
	                if(newTextSize == 0){
	                difference = "";

	                }

	                words = difference.split(' ');
	                words.forEach(function(w){
	                    if(w===""){
	                       return;
	                    }          
	                    newWord = sub.cloneNode(true);
	                    newWord.style.backgroundColor = 'blue';
	                    newWord.innerText = w + " " ;
	                    newWord.style.display = 'inline-block';
	                    makeWord(newWord);
	                    sub.parentNode.appendChild(newWord);
	                });
	                
	                prefix.innerText = txt;

}
/*-------------------------------------------------------------------------------------------------------------------------------------*/
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
function makeWord(w){
        w.style.border='solid';
        w.style.borderWidth = '0px 2px';
        w.style.borderColor = 'transparent';
        w.addEventListener("mousedown", function (event) {
            //showWindow();
            console.log(w.innerText);
            event.stopPropagation(); 
        }, true);
        
        w.addEventListener("mouseover", function (event) {
            w.style.borderWidth = '0.12em 2px';
            w.style.borderColor = 'yellow'; 
        }, true);
         w.addEventListener("mouseout", function (event) {
            w.style.borderWidth = '0px 2px';
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
-refaire l'apparence du mot selectioné
-ne pas attendre un event pour modifier un txt
-checker la création de nouveaux noeuds
-rendre la modification pour tous les texts de la page
-gerer la ponctuation : d' . - ... 
-acceder a la traduction fournie par yt


*/

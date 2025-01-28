function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/*-------------------------------------------------------------------------------------------------------------------------------------*/
function keepTrackOf(elementName, selector, action){
    var elem = selector(elementName);
        if(elem == null){
            console.log('!! No ' + elementName + ' was found!');
            return;
        }
        console.log('An element ' + elementName + ' was found!');
        action(elem);
        const config = { childList: true, subtree: true};
        const callback = (mutationList, observer) => {
           mutationList.forEach(function(mutation) {
                var nodes = Array.from(mutation.removedNodes);
                var directMatch = nodes.indexOf(elem) > -1
                var parentMatch = nodes.some(parent => parent.contains(elem));
                if (directMatch || parentMatch) {
                  console.log('node' +  elementName + ' was removed!');
                  elem = selector(elementName);
                  if(elem != null){
                     console.log('New ' + elementName + ' was found!');   
                        action(elem);
                  }else{
                     console.log('!! No ' + elementName + ' was found!');
                  }
                }
           });
        };
        const observer = new MutationObserver(callback);
        observer.observe(document.body, config);
}

(function (){
        //onload...

        //custom subtitles
        keepTrackOf("ytp-caption-window-container", str => document.getElementById(str) , watchContainer);

        //generated subtitles
        keepTrackOf("span.captions-text",str => document.querySelector(str) , watchSubs);
       
        
})();



/*-------------------------------------------------------------------------------------------------------------------------------------*/
function watchContainer(captionContainer){

        const config = { childList: true, subtree: true ,characterData : true};

        const callback = (mutationList, observer) => {
          for (const mutation of mutationList) {
                if(mutation.type === "childList" && mutation.addedNodes.length != 0){
                    makeWindowNotDragable();
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

        const configSub = { childList: true, subtree: true ,characterData : true};

        const callbackSub = (mutationList, observer) => {
          for (const mutation of mutationList) {
                if(mutation.type === "childList" && mutation.addedNodes.length != 0){
                   modifyText(mutation.target, cap.innerText);
                }
          }
        };
        const observerSub = new MutationObserver(callbackSub);
        observerSub.observe(cap, configSub);
}
    



function attachSub(line){
                if(line.children != undefined){
                    sub = line.children[0];

                    if(sub != null){
                        
	                    words = sub.innerText.split(' ');
	                    words.forEach(function(w,i){
	                        if(w===""){
	                            return;
	                        }
	                        var newWord = sub.cloneNode(true);
	                        //newWord.style.backgroundColor = 'black';
	                        newWord.innerText = w;
	                        newWord.id = 'greenWord';
	                        makeWord(newWord);
	                        line.appendChild(newWord);
	                    });
	                sub.style.display = 'none';
	                }
	            }
}
function modifyText(sub, txt){

	                var prefix = null;
	                if(!document.getElementById("captionPrefix")){
	                    var prefix = sub.cloneNode(true);
	                    prefix.style.display = 'none';
	                    prefix.id = "captionPrefix";
	                    prefix.innerText = "" ;
	                    sub.parentNode.appendChild(prefix);
                        
                        document.querySelectorAll('[id=greenWord]').forEach(function(e){
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
	                    //newWord.style.backgroundColor = 'blue';
	                    newWord.innerText = w;
	                    newWord.style.display = 'inline-block';
	                    makeWord(newWord);
	                    sub.parentNode.appendChild(newWord);
	                });
	                
	                prefix.innerText = txt;

}

function makeWord(w){
        w.style.border='solid';
        w.style.borderWidth = '0px 2px';
        w.style.borderColor = 'transparent';
        w.addEventListener("mousedown", function (event) {
            console.log(w.innerText);
            event.stopPropagation(); 
        }, true);
        
        w.addEventListener("mouseover", function (event) {
            w.style.borderWidth = '0.15em 2px';
            w.style.borderColor = 'yellow'; 
        }, true);
         w.addEventListener("mouseout", function (event) {
            w.style.borderWidth = '0px 2px';
            w.style.borderColor = 'transparent'; ; 
        }, true);
}
function makeWindowNotDragable(){
     elem=document.querySelector("div.caption-window");
    if(elem!=null){
        elem.setAttribute("draggable", "false");
        elem.style.userSelect="none";
        elem.style.cursor="default";
    }
}

	console.log("Loaded");
	
/*  
        TODOLIST :
-ne pas attendre un event pour modifier un txt
-si pas de noeud trouvé checker la création de nouveaux noeuds
-rendre la modification pour tous les tests de la page
-executer au chargement de la page
-github
-gerer la ponctuation : d' . - ... 
-acceder a la traduction fournie par yt

*/

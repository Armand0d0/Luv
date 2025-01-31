console.log("content script loaded");
browser.runtime.sendMessage("inject");
/*
browser.runtime.onMessage.addListener(function(request, sender, callback) {
        if(request === "embed"){

        }            console.log(location.href);
});*/
 /*console.log(location.href);
  wikiUrl = "https://fr.wikipedia.org/wiki/Wikip%C3%A9dia:Accueil_principal";
 var em = document.createElement("iframe");
 em.setAttribute("src",wikiUrl);
 em.style.width = "50%";
 em.style.height = "100%";

 //src="http://www.example.com" style="width:500px; height: 300px;"

 /*for (const c of document.body.children){
    c.remove()
 
 }
document.body.appendChild(em);*/
//*/
//showWindow();

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
}

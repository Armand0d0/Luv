console.log("popup script loaded");
inject();
document.getElementById("refresh").addEventListener("click", inject);


function inject(){
    browser.runtime.sendMessage("inject");
}

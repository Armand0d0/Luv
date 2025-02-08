console.log("popup script loaded");
//inject();
//document.getElementById("refresh").addEventListener("click", inject);

    browser.runtime.sendMessage("embed");

function inject(){
    browser.runtime.sendMessage("inject");
}

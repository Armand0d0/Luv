console.log("popup script loaded");
//inject();
//document.getElementById("refresh").addEventListener("click", inject);



(async function(){
    script1 = document.createElement('script');
    script1.src = 'https://unpkg.com/dexie@3.2.2';
    document.body.appendChild(script1);
    script2 = document.createElement('script');
    script2.src = 'https://unpkg.com/dexie-export-import@1.0.3';
    document.body.appendChild(script2);
    theDBName = 'LuvDatabase';

    
})().then(async () => {
    theDB = new Dexie(theDBName);
    let {verno, tables} = await theDB.open();
    theDB.close();
    theDB = new Dexie(theDBName);
    theDB.version(verno).stores(tables.reduce((p,c) => {p[c.name] = c.schema.primKey.keyPath || ""; return p;}, {}));
    theBlob = await theDB.export();
    console.log(theBlob);
});



   // browser.runtime.sendMessage("embed");

function inject(){
    browser.runtime.sendMessage("inject");
}

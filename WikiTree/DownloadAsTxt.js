//Page: https://en.wikipedia.org/wiki/Portal:Mathematics
//WikiTree3 [https://gist.github.com/MathEnthusiast314/cf5ee1cc5c3ce9cb0739d9e354b0c88c]
counter=-1;
//Divide and Rule with Promises
function series(items, fn) {
  let result = [];
  return items.reduce((acc, item) => {
    acc = acc.then(() => {
      return fn(item).then(res => result.push(res));
    });
    return acc;
  }, Promise.resolve())
    .then(() => result);
}
function all(items, fn) {
  const promises = items.map(item => fn(item));
  return Promise.allSettled(promises);
}
function splitToChunks(items, chunkSize = 50) {
  const result = [];
  for (let i = 0; i < items.length; i+= chunkSize) {
    result.push(items.slice(i, i + chunkSize));
  }
  return result;
}
function chunks(items, fn, chunkSize = 50) {
  let result = [];
  const chunks = splitToChunks(items, chunkSize);
  return series(chunks, chunk => {
    return all(chunk, fn)
      .then(res => result = result.concat(res))
  })
    .then(() => result);
}
//Get Tree
async function Node(StartNode){
    options=encodeURI('{"mode":0,"hideprefix":20,"showcount":true,"namespaces":false,"notranslations":true,"depth":2}')
    get=await fetch("https://en.wikipedia.org/w/api.php?action=categorytree&format=json&category="+StartNode+"&options="+options+"&uselang=en&formatversion=2", {
  "headers": {
    "accept": "application/json, text/javascript, */*; q=0.01",
    "accept-language": "en-US,en;q=0.9",
    "sec-ch-ua-arch": "\"x86\"",
    "sec-ch-ua-bitness": "\"64\"",
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-model": "",
    "sec-ch-ua-platform-version": "\"8.0.0\"",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "x-requested-with": "XMLHttpRequest"
  },
  "referrer": "https://en.wikipedia.org/wiki/Portal:Mathematics",
  "referrerPolicy": "origin-when-cross-origin",
  "body": null,
  "method": "GET",
  "mode": "cors",
  "credentials": "include"
}).then(res=>{return res.json()}).then(x=>x.categorytree.html);
    counter++;
    return get;
}
//calculations
Array.prototype.join2 = function(all, last) {
    var arr = this.slice();
    var lastItem = arr.splice(-1);
    arr = arr.length ? [arr.join(all)] : [];
    arr.push(lastItem);
    return arr.join(last);
}
//
function strip(input){
    return Array.from(input).map(x=>(((x.children[0]||{}).children||[])[1]||{}).text)
}
function appendTreeStr(str0,amount){
    sp=str0.split('\n');
    lastind=sp.findLastIndex(x=>x.includes('── ')==false);
    return(sp.map((x,index)=>x.includes('── ')?('|   ').repeat(amount)+x:'|   '.repeat(amount-1)+(index==lastind?'└── ':'├── ')+x).join('\n'))}
//
function tree(s){
    return(Array.from($(s)).flatMap(x=>[x.children[0].children[1].text,['',...strip(x.children[1].children)].join2('\n├── ','\n└── ').substring(1)]).join('\n'))
}
function finalTree(tree0,node){
    return(node+'\n'+appendTreeStr(tree0,1))
}
function layer(tree0,n){
    return (tree0.split('\n').filter(x=>(x.substring(4*n).length>0&&(x.startsWith('|   '.repeat(n-1)+'└── ')||x.startsWith('|   '.repeat(n-1)+'├── ')))).join('\n'))
}
theTREE='\n'+finalTree(tree(await Node('Mathematics')),'Mathematics')+'\n'

//
function download(data, filename, type) { // from https://github.com/SlimRunner/desmos-scripts-addons/blob/master/graph-archival-script/
    var file = new Blob([data], {
        type: type
    });
    if (window.navigator.msSaveOrOpenBlob) // IE10+
        window.navigator.msSaveOrOpenBlob(file, filename);
    else { // Others
        var a = document.createElement("a"),
            url = URL.createObjectURL(file);
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(function() {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 0);
    }
}
async function ExpandLevel(level){
    l2=(layer(theTREE,level)).split('\n');
    l2=[...new Set(l2)]
    console.log('length: '+l2.length);
    listD=chunks(l2.map(x=>x.substring(4*level).replaceAll(' ','_')),Node,100);
    DATA=(await listD).map(item=>item.value);
    for (var i=0; i<l2.length; i++){
        if (DATA[i]!=''){
            theTREE=theTREE.replaceAll('\n'+l2[i]+'\n','\n'+l2[i]+'\n'+appendTreeStr(tree(DATA[i]),level+1)+'\n');
        }
    }
    console.log('level='+level+' ✔️')
    //thanks https://stackoverflow.com/a/36047989
    theTREE2=theTREE.replace(/(?<=^\1└── .*(?:\n\1\|.*)*$\n((?:\|   )*))\|/gm,' ');
    theTREE2=theTREE2.replace(/\n^.*└── $/gm,'')
    download(new Date() + "\n"+ theTREE2 , "wikitree.txt", "text/plain; charset=UTF-8");
}
//execute
await ExpandLevel(2);
await ExpandLevel(4);

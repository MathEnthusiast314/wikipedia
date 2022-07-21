//https://en.wikipedia.org/wiki/Portal:Mathematics
//WikiTree2 [https://gist.github.com/MathEnthusiast314/bbf692a8356bebfb9ecd267fc4035f2a]
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
async function ExpandNodes(children){
    console.log('length: '+children.length);
    var listD=chunks(children.map(z=>z.children[0].childNodes[2].childNodes[0].textContent.replaceAll(' ','_')),Node,100);
    DATA=(await listD).map(item=>item.value);
    for (var j=0;j<children.length;j++){
        children[j].children[1].outerHTML='<div class="CategoryTreeChildren">'+DATA[j]+'</div'
    }
}
function extractLevel(arr, level) {
    return level <= 1 
        ? Array.from(arr)
        : extractLevel(arr,level-1).filter(x=>((x.children[1].children[0]||{}).children||[]).length==2).flatMap(x=>Array.from(x.children[1].children))
}
async function ExpandLevel(level){
    await ExpandNodes(extractLevel(document.getElementsByClassName('div-col')[0].children, level))
    console.log('level='+level+' ✔️')
}
document.getElementsByClassName('div-col')[0].innerHTML=await Node('Mathematics')
//execute if depth=1 in 'options'
await ExpandLevel(1);
await ExpandLevel(2);
//execute if depth=2 in 'options'
await ExpandLevel(2);
await ExpandLevel(4);

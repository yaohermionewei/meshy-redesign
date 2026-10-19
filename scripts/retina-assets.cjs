const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const {promisify}=require('node:util');
const {execFile}=require('node:child_process');
const {dependency,chromeExecutable}=require('./runtime.cjs');
const {chromium}=require(dependency('playwright'));
const run=promisify(execFile);

async function prepareRetinaAssets(){
 process.chdir(path.resolve(__dirname,'..'));
 const manifest=JSON.parse(fs.readFileSync('public/assets-manifest.json','utf8'));
 const byFile=new Map(manifest.files.map(a=>['/'+a.file,a]));
 const variants=new Map();
 const browser=await chromium.launch({headless:true,executablePath:chromeExecutable(chromium)});
 const page=await browser.newPage();
 const files=['src/desktop.html','src/tablet.html','src/mobile.html'];
 const rewritten={};
 for(const file of files){
  const result=await page.evaluate(({html,assets})=>{
   const doc=new DOMParser().parseFromString(html,'text/html');
   const requests=[];
   for(const img of doc.images){
    const source=assets[img.getAttribute('src')]?.url;
    if(!source?.includes('/ti_w:'))continue;
    let widths,sizes;
    if(/\/publish\/cover-|\/cms\/banners\/images\//.test(source)){
     widths=[384,750,1080];
     sizes=source.includes('/cms/banners/')?'(max-width: 767px) calc(50vw - 5px), 360px':'330px';
    }else if(img.alt==='try-image')widths=[32,48];
    else continue;
    const candidates=widths.map((width,i)=>{
     const url=source.replace(/\/ti_w:\d+/, '/ti_w:'+width);
     requests.push(url);
     return {url,descriptor:sizes?width+'w':(i+1)+'x'};
    });
    img.setAttribute('data-local-srcset',JSON.stringify(candidates));
    if(sizes)img.setAttribute('sizes',sizes);
   }
   return{html:doc.querySelector('main').outerHTML,requests};
  },{html:fs.readFileSync(file,'utf8'),assets:Object.fromEntries(byFile)});
  rewritten[file]=result.html;
  for(const url of result.requests)if(!variants.has(url)){
   const old=manifest.files.find(f=>f.url===url);
   const name=decodeURIComponent(new URL(url).pathname.split('/').pop()).replace(/[^a-zA-Z0-9._-]/g,'-').slice(-85);
   const file=old?.file||'assets/'+crypto.createHash('sha256').update(url).digest('hex').slice(0,12)+'-'+name;
   variants.set(url,file);
  }
 }
 let next=0;const entries=[...variants];
 await Promise.all(Array.from({length:6},async()=>{
  while(next<entries.length){const [url,file]=entries[next++];
   if(!fs.existsSync('public/'+file))await run('curl',['-fsSL','-x',process.env.CAPTURE_PROXY||'http://127.0.0.1:7897','--retry','2','--max-time','60',url,'-o','public/'+file]);
   if(!manifest.files.some(f=>f.url===url))manifest.files.push({url,file,bytes:fs.statSync('public/'+file).size});
  }
 }));
 for(const [file,html] of Object.entries(rewritten)){
  const output=await page.evaluate(({html,map})=>{
   const doc=new DOMParser().parseFromString(html,'text/html');
   for(const img of doc.querySelectorAll('[data-local-srcset]')){
    const entries=JSON.parse(img.getAttribute('data-local-srcset'));
    img.srcset=entries.map(e=>'/'+map[e.url]+' '+e.descriptor).join(', ');
    img.removeAttribute('data-local-srcset');
   }
   return doc.querySelector('main').outerHTML;
  },{html,map:Object.fromEntries(variants)});
  fs.writeFileSync(file,output);
 }
 fs.writeFileSync('public/assets-manifest.json',JSON.stringify(manifest,null,2));
 await browser.close();
 console.log(`Responsive image variants ready. ${manifest.files.length} total local assets.`);
}
module.exports={prepareRetinaAssets};
if(require.main===module)prepareRetinaAssets().catch(e=>{console.error(e);process.exit(1)});

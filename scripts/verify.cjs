const fs=require('node:fs');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const {dependency,chromeExecutable}=require('./runtime.cjs');
const {chromium}=require(dependency('playwright'));
const {PNG}=require(dependency('pngjs'));

(async()=>{
 process.chdir(path.resolve(__dirname,'..'));fs.mkdirSync('verification',{recursive:true});
 const {default:pixelmatch}=await import(pathToFileURL(dependency('pixelmatch')).href);
 const browser=await chromium.launch({executablePath:chromeExecutable(chromium),headless:true});
 const context=await browser.newContext({viewport:{width:1440,height:1000},deviceScaleFactor:1,locale:'zh-CN',colorScheme:'dark'});
 const page=await context.newPage();
 const baseURL=process.env.VERIFY_URL||'http://localhost:5173';
 const errors=[],remoteRequests=[],failedResponses=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('request',r=>{if(!r.url().startsWith(new URL(baseURL).origin)&&!r.url().startsWith('data:'))remoteRequests.push(r.url())});
 page.on('response',r=>{if(r.status()>=400)failedResponses.push({url:r.url(),status:r.status()})});
 await page.goto(baseURL,{waitUntil:'networkidle'});
 await page.evaluate(()=>document.fonts.ready);
 const comparisons=[],metrics=[];
 for(const size of [{width:1440,height:1000},{width:1920,height:1080},{width:1024,height:900},{width:390,height:844}]){
  await page.setViewportSize(size);await page.waitForTimeout(300);
  const scroller=page.locator('[data-radix-scroll-area-viewport]').first();
  for(const position of ['top','scroll','bottom']){
   await scroller.evaluate((e,pos)=>{e.scrollTop=pos==='top'?0:pos==='scroll'?750:e.scrollHeight},position);
   await page.waitForTimeout(100);
   const suffix=position==='top'?'':'-'+position;
   const name=`${size.width}${suffix}`;
   const actual=`verification/local-${name}.png`;
   await page.screenshot({path:actual});
   const a=PNG.sync.read(fs.readFileSync(`reference/original-${name}.png`));
   const b=PNG.sync.read(fs.readFileSync(actual));
   const diff=new PNG({width:a.width,height:a.height});
   const pixels=pixelmatch(a.data,b.data,diff.data,a.width,a.height,{threshold:0.1,includeAA:false});
   fs.writeFileSync(`verification/diff-${name}.png`,PNG.sync.write(diff));
   let absolute=0;for(let i=0;i<a.data.length;i+=4)for(let c=0;c<3;c++)absolute+=Math.abs(a.data[i+c]-b.data[i+c]);
   const row={viewport:size,position,differentPixels:pixels,totalPixels:a.width*a.height,differencePercent:100*pixels/(a.width*a.height),meanChannelDifference:absolute/(a.width*a.height*3)};
   comparisons.push(row);console.log(JSON.stringify(row));
  }
  metrics.push(await page.evaluate(()=>({width:innerWidth,documentWidth:document.documentElement.scrollWidth,grid:[...document.querySelectorAll('[data-testid="community-showcases-grid"]')].map(e=>({rect:e.getBoundingClientRect().toJSON(),children:[...e.children].map(c=>({rect:c.getBoundingClientRect().toJSON(),style:c.getAttribute('style')}))})),images:[...document.images].filter(i=>!i.complete||!i.naturalWidth).map(i=>i.src)})));
 }
 await browser.close();
 const tolerance=0.01;
 const passed=comparisons.every(c=>c.differencePercent<=tolerance)&&!errors.length&&!remoteRequests.length&&!failedResponses.length&&metrics.every(m=>!m.images.length&&m.documentWidth===m.width);
 const report={checkedAt:new Date().toISOString(),passed,tolerancePercent:tolerance,pixelmatch:{threshold:0.1,includeAA:false,deviceScaleFactor:1},comparisons,errors,remoteRequests:[...new Set(remoteRequests)],failedResponses,metrics};
 fs.writeFileSync('verification/report.json',JSON.stringify(report,null,2));
 console.log('Errors:',errors,'External requests:',remoteRequests.length,'Failed responses:',failedResponses.length);
 if(!passed)process.exitCode=1;
})().catch(e=>{console.error(e);process.exit(1)});

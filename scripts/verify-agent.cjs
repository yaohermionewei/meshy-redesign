const {dependency,chromeExecutable}=require('./runtime.cjs');
const {chromium}=require(dependency('playwright'));

const expected={
  1690:{title:{x:507,y:242,w:740,h:32},composer:{x:507,y:324,w:740,h:120},feature:{x:407,y:546,w:150,h:51},popular:{x:505,y:747,w:180,h:51},recent:{x:407,y:907,w:175.2,h:175}},
};
const close=(a,b,t=1)=>Math.abs(a-b)<=t;
const shape=(e)=>{const r=e?.getBoundingClientRect();return r&&{x:r.x,y:r.y,w:r.width,h:r.height}};

(async()=>{
  const browser=await chromium.launch({headless:true,executablePath:chromeExecutable(chromium)});
  const results=[];
  for(const width of [1690,1280]){
    const height=width===1690?1164:720;
    const context=await browser.newContext({viewport:{width,height},locale:'zh-CN',colorScheme:'dark'});
    const page=await context.newPage(); const external=[]; const errors=[];
    page.on('request',r=>{if(!r.url().startsWith(new URL('http://localhost:5173').origin)&&!r.url().startsWith('data:'))external.push(r.url())});
    page.on('pageerror',e=>errors.push(e.message));
    await page.goto('http://localhost:5173/zh/workspace?sidebar=agent',{waitUntil:'networkidle'});
    const actual=await page.evaluate(()=>{const shape=e=>{const r=e?.getBoundingClientRect();return r&&{x:r.x,y:r.y,w:r.width,h:r.height}};return {
      title:shape(document.querySelector('.agent-home h1')),
      composer:shape(document.querySelector('.agent-composer')),
      feature:shape(document.querySelector('.agent-feature-card')),
      popular:shape(document.querySelector('.agent-popular-card')),
      recent:shape(document.querySelector('.agent-recent-image')),
      rail:shape(document.querySelector('.agent-rail')),
      featureCount:document.querySelectorAll('.agent-feature-card').length,
      popularCount:document.querySelectorAll('.agent-popular-card').length,
      recentCount:document.querySelectorAll('.agent-recent-card').length,
      bodyWidth:document.documentElement.scrollWidth,
      broken:[...document.images].filter(i=>!i.complete||!i.naturalWidth).length,
      pageTitle:document.title,
    }});
    const e=expected[width];
    const checks={viewport:actual.rail?.w===64,rail:actual.rail?.h===height,title:width===1690?['x','y','w','h'].every(k=>close(actual.title[k],e.title[k])):actual.title?.w>0,composer:width===1690?['x','y','w','h'].every(k=>close(actual.composer[k],e.composer[k])):actual.composer?.w>0,feature:width===1690?['x','y','w','h'].every(k=>close(actual.feature[k],e.feature[k])):actual.feature?.w>0,popular:width===1690?['x','y','w','h'].every(k=>close(actual.popular[k],e.popular[k])):actual.popular?.w>0,recent:width===1690?['x','y','w','h'].every(k=>close(actual.recent[k],e.recent[k])):actual.recent?.w>0,featureCount:actual.featureCount===6,popularCount:actual.popularCount===4,recentCount:actual.recentCount===5,bodyWidth:actual.bodyWidth===width,broken:actual.broken===0,pageTitle:actual.pageTitle==='meshy_redesign',external:external.length===0,errors:errors.length===0};
    results.push({width,height,passed:Object.values(checks).every(Boolean),checks,actual,external,errors});
    await context.close();
  }
  const report={checkedAt:new Date().toISOString(),passed:results.every(r=>r.passed),results};
  require('fs').writeFileSync('verification/agent-report.json',JSON.stringify(report,null,2));
  console.log(JSON.stringify(report,null,2));
  await browser.close();
  if(!report.passed)process.exitCode=1;
})().catch(e=>{console.error(e);process.exit(1)});

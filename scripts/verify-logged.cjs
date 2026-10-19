const {dependency,chromeExecutable}=require('./runtime.cjs');
const {chromium}=require(dependency('playwright'));
const fs=require('node:fs');

const expected={
  1094:{sidebar:64,hero:{x:219,y:242,w:720,h:120},community:{x:88,y:510},grid:{x:88,y:574,w:982}},
  1588:{sidebar:64,hero:{x:466,y:242,w:720,h:120},community:{x:96,y:510},grid:{x:96,y:574,w:1460}},
};
const close=(a,b,t=1)=>Math.abs(a-b)<=t;

(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:chromeExecutable(chromium)});
 const baseURL=process.env.VERIFY_URL||'http://localhost:5173';
 const results=[];
 for(const width of Object.keys(expected).map(Number)){
  const context=await browser.newContext({viewport:{width,height:950},locale:'zh-CN',colorScheme:'dark'});
  const page=await context.newPage();const external=[],errors=[];
  page.on('request',r=>{if(!r.url().startsWith(new URL(baseURL).origin)&&!r.url().startsWith('data:'))external.push(r.url())});
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(baseURL+'/zh/discover',{waitUntil:'networkidle'});await page.waitForTimeout(250);
  const actual=await page.evaluate(()=>{const r=e=>{const b=e?.getBoundingClientRect();return b&&{x:b.x,y:b.y,w:b.width,h:b.height}};const grid=document.querySelector('[data-testid="community-showcases-grid"]');return{viewport:{w:innerWidth,h:innerHeight},sidebar:r(document.querySelector('.logged-sidebar')),hero:r(document.querySelector('[data-design4-input]')),community:r(document.querySelector('h2')),grid:r(grid),cards:document.querySelectorAll('[data-testid="community-post-card"]').length,greeting:document.querySelector('[data-logged-greeting]')?.textContent,heading:document.querySelector('h1')?.textContent,broken:[...document.images].filter(i=>!i.complete||!i.naturalWidth).length,documentWidth:document.documentElement.scrollWidth,generateDisabled:document.querySelector('[data-replica-generate]')?.disabled}});
  await page.screenshot({path:`verification/logged-local-${width}.png`});
  const e=expected[width];const checks={viewport:actual.viewport.w===width,sidebar:actual.sidebar?.w===e.sidebar,hero:['x','y','w','h'].every(k=>close(actual.hero[k],e.hero[k])),community:close(actual.community.x,e.community.x)&&close(actual.community.y,e.community.y),grid:['x','y','w'].every(k=>close(actual.grid[k],e.grid[k])),cards:actual.cards>=15,greeting:actual.greeting==='嗨，yaohermione！',heading:actual.heading==='你要在 3D 中创建什么？',broken:actual.broken===0,documentWidth:actual.documentWidth===width,generateDisabled:actual.generateDisabled===true,external:external.length===0,errors:errors.length===0};
  results.push({width,passed:Object.values(checks).every(Boolean),checks,actual,external,errors});await context.close();
 }
 const report={checkedAt:new Date().toISOString(),reference:'Logged-in Meshy page read from the user-authenticated in-app browser',passed:results.every(r=>r.passed),expected,results};fs.writeFileSync('verification/logged-report.json',JSON.stringify(report,null,2));
 console.log(JSON.stringify(report,null,2));if(!report.passed)process.exitCode=1;await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});

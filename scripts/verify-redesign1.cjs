const {dependency,chromeExecutable}=require('./runtime.cjs');
const {chromium}=require(dependency('playwright'));
const fs=require('node:fs');
const assert=require('node:assert/strict');
const base=process.env.VERIFY_URL||'http://localhost:5173';
const output=process.env.VERIFY_OUTPUT||'verification/redesign1';
fs.mkdirSync(output,{recursive:true});
const results=[];
const check=(name,passed,detail)=>{results.push({name,passed,detail});assert.ok(passed,name+' '+JSON.stringify(detail||''))};
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:chromeExecutable(chromium)});
 const errors=[],failed=[],external=[];
 try {
 for(const width of [1440,1920,768,390]){
  const context=await browser.newContext({viewport:{width,height:width===1920?1200:1000},locale:'zh-CN',colorScheme:'dark'});
  const page=await context.newPage();
  page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
  page.on('response',r=>{if(r.status()>=400)failed.push(r.url())});
  page.on('request',r=>{if(!r.url().startsWith(new URL(base).origin)&&!r.url().startsWith('data:'))external.push(r.url())});
  await page.goto(base+'/redesign/1',{waitUntil:'networkidle'});
  await page.evaluate(()=>document.fonts.ready);
  check(`${width}: original ambient animations remain frozen`,await page.evaluate(()=>document.getAnimations().filter(a=>a instanceof CSSAnimation).length===0));
  const before=await page.evaluate(()=>{
   window.__r1Nodes={grid:document.querySelector('[data-testid="community-showcases-grid"]'),cards:[...document.querySelectorAll('[data-testid="community-post-card"]')],images:[...document.images],scroller:document.querySelector('[data-radix-scroll-area-viewport]')};
   const rect=e=>{const r=e.getBoundingClientRect();return{x:r.x,y:r.y,w:r.width,h:r.height}};
   return{title:document.title,mode:document.documentElement.dataset.redesignMode,url:location.href,history:history.length,resources:performance.getEntriesByType('resource').length,cards:window.__r1Nodes.cards.length,rects:['h1','.r1-mode-tabs','.r1-input-stage'].map(s=>rect(document.querySelector(s))),nav:[...document.querySelectorAll('.replica-rail-entry')].map(e=>e.getAttribute('aria-label'))};
  });
  check(`${width}: route, default and navigation`,before.title==='meshy_redesign1'&&before.mode==='quick'&&before.cards>=15&&before.nav.join(',')==='创作,skills,资产,图像,模型,打印,动画',before);
  await page.screenshot({path:`${output}/quick-${width}.png`});
  await page.getByRole('tab',{name:'Agent 模式'}).click();
  await page.waitForTimeout(520);
  const after=await page.evaluate(()=>{
   const rect=e=>{const r=e.getBoundingClientRect();return{x:r.x,y:r.y,w:r.width,h:r.height}};
   const exp=document.querySelector('.r1-agent-expansion');
   return{url:location.href,history:history.length,resources:performance.getEntriesByType('resource').length,mode:document.documentElement.dataset.redesignMode,rects:['h1','.r1-mode-tabs','.r1-input-stage'].map(s=>rect(document.querySelector(s))),height:exp.clientHeight,realHeight:exp.firstElementChild.getBoundingClientRect().height,same:window.__r1Nodes.grid===document.querySelector('[data-testid="community-showcases-grid"]')&&window.__r1Nodes.cards.every((e,i)=>e===document.querySelectorAll('[data-testid="community-post-card"]')[i]),skills:[...document.querySelectorAll('.r1-skill-card')].map(e=>e.textContent),projects:[...document.querySelectorAll('.r1-project-name')].map(e=>e.textContent),blankY2K:!document.querySelectorAll('.r1-project-cover')[2].querySelector('img'),broken:[...document.images].filter(i=>!i.complete||!i.naturalWidth).length,overflow:document.documentElement.scrollWidth>innerWidth||window.__r1Nodes.scroller.scrollWidth>innerWidth,modules:document.querySelectorAll('.r1-agent-modules').length};
  });
  check(`${width}: stable title, tabs and input footprint`,after.rects.every((r,i)=>Object.keys(r).every(k=>Math.abs(r[k]-before.rects[i][k])<=1)),{before:before.rects,after:after.rects});
  check(`${width}: local state, persistent DOM and resources`,after.url===before.url&&after.history===before.history&&after.resources===before.resources&&after.same,after);
  check(`${width}: complete content, measured expansion, no overflow`,after.mode==='agent'&&after.skills.length===5&&after.projects.join(',')==='新建项目,点我！借东西小人游戏,Y2K,类双人成行,图片问题'&&after.blankY2K&&after.modules===1&&Math.abs(after.height-after.realHeight)<1&&after.broken===0&&!after.overflow,after);
  await page.screenshot({path:`${output}/agent-${width}.png`});
  if(width===390){await page.locator('.r1-recent').scrollIntoViewIfNeeded();await page.screenshot({path:`${output}/agent-${width}-projects.png`});await page.evaluate(()=>window.__r1Nodes.scroller.scrollTop=0)}
  await page.getByRole('tab',{name:'快速生成'}).click();await page.waitForTimeout(400);
  check(`${width}: collapse completes`,await page.locator('.r1-agent-expansion').evaluate(el=>el.getBoundingClientRect().height===0));
  await context.close();
 }
 const context=await browser.newContext({viewport:{width:1440,height:1000},locale:'zh-CN'});
 const page=await context.newPage();
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base+'/redesign/1',{waitUntil:'networkidle'});
 const timing=await page.evaluate(async()=>{
  const exp=document.querySelector('.r1-agent-expansion');
  const community=document.querySelector('[data-testid="community-showcases-grid"]');
  const agent=document.querySelector('#r1-tab-agent'),quick=document.querySelector('#r1-tab-quick');
  const sample=duration=>new Promise(resolve=>{const values=[],start=performance.now();function frame(now){const rect=exp.getBoundingClientRect();values.push({t:now-start,h:rect.height,bottom:rect.bottom,y:community.getBoundingClientRect().y});if(now-start<duration)requestAnimationFrame(frame);else resolve(values)}requestAnimationFrame(frame)});
  agent.click();const open=await sample(500);quick.click();const close=await sample(400);
  agent.click();await new Promise(r=>setTimeout(r,85));const reverseFrom=exp.getBoundingClientRect().height;quick.click();const reverse=await sample(400);
  for(let i=0;i<17;i++){(i%2?quick:agent).click();await new Promise(r=>setTimeout(r,18))}
  await new Promise(r=>setTimeout(r,600));
  return{open,close,reverseFrom,reverse,finalMode:document.documentElement.dataset.redesignMode,finalHeight:exp.getBoundingClientRect().height,realHeight:exp.firstElementChild.getBoundingClientRect().height,indicatorCount:document.querySelectorAll('.r1-tab-indicator').length};
 });
 check('Expansion and collapse interpolate with document flow',timing.open.length>8&&timing.close.length>8&&timing.open.some(s=>s.h>5&&s.h<timing.realHeight-5)&&timing.close.some(s=>s.h>5&&s.h<timing.realHeight-5)&&timing.open.every((s,i,a)=>!i||s.h>=a[i-1].h-.5)&&timing.close.every((s,i,a)=>!i||s.h<=a[i-1].h+.5)&&timing.open.every((s,i,a)=>!i||Math.abs((s.y-a[0].y)-(s.bottom-a[0].bottom))<1));
 check('Mid-animation reversal and rapid clicks settle on latest state',timing.reverseFrom>0&&timing.reverseFrom<timing.realHeight&&timing.reverse.at(-1).h===0&&timing.finalMode==='agent'&&Math.abs(timing.finalHeight-timing.realHeight)<1&&timing.indicatorCount===1);
 fs.writeFileSync(`${output}/animation-samples.json`,JSON.stringify(timing,null,2));
 const draft='一座有苔藓的微缩城堡，保留这个草稿。';
 await page.getByRole('textbox',{name:'告诉 Meshy 你想创造什么'}).fill(draft);
 await page.evaluate(()=>{window.__persistentGrid=document.querySelector('[data-testid="community-showcases-grid"]');window.__persistentCards=[...window.__persistentGrid.children]});
 for(const width of [390,768,1920,1440]){
  await page.setViewportSize({width,height:1000});await page.waitForTimeout(520);
  check(`Resize ${width}: preserves draft, mode, DOM and measured height`,await page.evaluate(draft=>{const exp=document.querySelector('.r1-agent-expansion');return document.documentElement.dataset.redesignMode==='agent'&&document.querySelector('textarea').value===draft&&window.__persistentGrid===document.querySelector('[data-testid="community-showcases-grid"]')&&window.__persistentCards.every((n,i)=>n===window.__persistentGrid.children[i])&&Math.abs(exp.clientHeight-exp.firstElementChild.clientHeight)<1&&document.documentElement.scrollWidth===innerWidth},draft));
 }
 await page.getByRole('tab',{name:'快速生成'}).click();await page.waitForTimeout(380);
 await page.getByRole('tab',{name:'快速生成'}).press('ArrowRight');await page.waitForTimeout(520);
 check('Keyboard arrows select and focus Agent',await page.evaluate(()=>document.activeElement.id==='r1-tab-agent'&&document.activeElement.getAttribute('aria-selected')==='true'&&document.querySelector('textarea').value==='一座有苔藓的微缩城堡，保留这个草稿。'));
 await page.getByRole('tab',{name:'Agent 模式'}).press('Home');await page.waitForTimeout(380);
 check('Keyboard Home returns to quick',await page.evaluate(()=>document.activeElement.id==='r1-tab-quick'&&document.documentElement.dataset.redesignMode==='quick'));
 const scroll=await page.evaluate(async()=>{const s=document.querySelector('[data-radix-scroll-area-viewport]');s.scrollTop=300;await new Promise(r=>requestAnimationFrame(r));const before=s.scrollTop;document.querySelector('#r1-tab-agent').click();await new Promise(r=>setTimeout(r,520));const opened=s.scrollTop;document.querySelector('#r1-tab-quick').click();await new Promise(r=>setTimeout(r,400));return{before,opened,closed:s.scrollTop}});
 check('Switching preserves scroll position',scroll.before===300&&scroll.opened===300&&scroll.closed===300,scroll);
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.evaluate(()=>document.querySelector('#r1-tab-agent').click());
 await page.waitForTimeout(30);
 check('Reduced motion switches without animation',await page.evaluate(()=>{const el=document.querySelector('.r1-agent-expansion');return getComputedStyle(el).transitionDuration==='0s'&&Math.abs(el.clientHeight-el.firstElementChild.clientHeight)<1&&document.getAnimations().length===0}));
 await page.reload({waitUntil:'networkidle'});
 check('Direct route refresh retains title and default',await page.title()==='meshy_redesign1'&&await page.locator('html').getAttribute('data-redesign-mode')==='quick');
 await context.close();
 check('No console errors, failed assets or external requests',!errors.length&&!failed.length&&!external.length,{errors,failed,external});
 } finally {
  fs.writeFileSync(`${output}/report.json`,JSON.stringify({checkedAt:new Date().toISOString(),base,passed:results.every(r=>r.passed),results,errors,failed,external},null,2));
  await browser.close();
 }
 console.log(`Redesign 1: ${results.length} checks passed. Screenshots and report: ${output}/`);
})().catch(e=>{console.error(e);process.exitCode=1});

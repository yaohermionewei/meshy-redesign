const {dependency,chromeExecutable}=require('./runtime.cjs');
const {chromium}=require(dependency('playwright'));
const fs=require('node:fs');
const assert=require('node:assert/strict');
const base=process.env.VERIFY_URL||'http://localhost:5173';
const output=process.env.VERIFY_OUTPUT||'verification/redesign2';
fs.mkdirSync(output,{recursive:true});
const results=[],errors=[],failed=[],external=[];
const check=(name,passed,detail)=>{results.push({name,passed,detail});assert.ok(passed,name+' '+JSON.stringify(detail||''))};
const inspect=()=>{
 const rect=e=>{const r=e.getBoundingClientRect();return{x:r.x,y:r.y,w:r.width,h:r.height}};
 const expansion=document.querySelector('.r2-mode-content');
 const visible=document.documentElement.dataset.redesignMode==='quick'?document.querySelector('.r2-quick-content'):document.querySelector('.r1-agent-modules');
 return{title:document.title,mode:document.documentElement.dataset.redesignMode,url:location.href,history:history.length,resources:performance.getEntriesByType('resource').length,rects:['h1','.r1-mode-tabs','.r1-input-stage'].map(s=>rect(document.querySelector(s))),expansion:rect(expansion),content:rect(visible),cards:document.querySelectorAll('[data-testid="community-post-card"]').length,sidebar:rect(document.querySelector('.logged-sidebar')),nav:[...document.querySelectorAll('.replica-rail-entry')].map(e=>({name:e.getAttribute('aria-label'),direction:getComputedStyle(e).flexDirection})),projects:[...document.querySelectorAll('.r2-project-list :is(button,a)')].map(e=>e.textContent),projectHref:document.querySelector('.r2-project-list a')?.getAttribute('href'),bannerLabels:[...document.querySelectorAll('.r2-banner-name')].map(e=>e.textContent),utilities:[...document.querySelectorAll('.r1-utilities button')].map(e=>e.textContent),homeColor:getComputedStyle(document.querySelector('.r1-create-icon')).color,recent:document.querySelectorAll('.r1-recent').length,broken:[...document.images].filter(e=>!e.complete||!e.naturalWidth).length,overflow:document.documentElement.scrollWidth>innerWidth||document.querySelector('[data-radix-scroll-area-viewport]').scrollWidth>innerWidth,clippedText:[...document.querySelectorAll('.r2-banner-name,.r2-banner-desc,.r1-skill-card')].filter(e=>e.scrollWidth>e.clientWidth+2).map(e=>e.textContent)};
};
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:chromeExecutable(chromium)});
 try{
 for(const width of [1440,1920,768,390]){
  const context=await browser.newContext({viewport:{width,height:width===1920?1200:1100},locale:'zh-CN',colorScheme:'dark'});
  const page=await context.newPage();
  page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
  page.on('response',r=>{if(r.status()>=400)failed.push(r.url())});
  page.on('request',r=>{if(!r.url().startsWith(new URL(base).origin)&&!r.url().startsWith('data:'))external.push(r.url())});
  await page.goto(base+'/redesign/2',{waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready);
  await page.waitForTimeout(350);
  const quick=await page.evaluate(inspect);
  check(`${width}: scheme two, horizontal navigation and sidebar projects`,quick.title==='meshy_redesign2'&&quick.mode==='quick'&&quick.nav.map(e=>e.name).join(',')==='创作,skills,资产'&&quick.nav.every(e=>e.direction==='row')&&quick.projects.join(',')==='点我！借东西小人游戏,Y2K,类双人成行,图片问题'&&quick.projectHref==='/redesign/2/project/arrietty',quick);
  check(`${width}: four tool entries and scheme one styling retained`,quick.bannerLabels.join(',')==='图像生成,3D 模型,3D 打印,动画'&&quick.utilities.join(',')==='商店,开发者,资源'&&quick.homeColor==='rgb(197, 249, 85)'&&quick.recent===0,quick);
  check(`${width}: quick layout and assets`,!quick.overflow&&!quick.broken&&!quick.clippedText.length&&quick.cards===20&&Math.abs(quick.expansion.h-quick.content.h)<1,quick);
  await page.screenshot({path:`${output}/quick-${width}.png`});
  await page.evaluate(()=>{window.__r2={grid:document.querySelector('[data-testid="community-showcases-grid"]'),cards:[...document.querySelectorAll('[data-testid="community-post-card"]')],banners:[...document.querySelectorAll('.r2-banner')]}});
  await page.getByRole('tab',{name:'Agent 模式'}).click();await page.waitForTimeout(520);
  const agent=await page.evaluate(inspect);
  check(`${width}: anchored composer, no navigation or reloaded resources`,agent.rects.every((r,i)=>Object.keys(r).every(k=>Math.abs(r[k]-quick.rects[i][k])<=1))&&agent.url===quick.url&&agent.history===quick.history&&agent.resources===quick.resources,agent);
  check(`${width}: Agent skills, no recent projects, no overflow`,agent.mode==='agent'&&agent.recent===0&&!agent.overflow&&!agent.broken&&!agent.clippedText.length&&Math.abs(agent.expansion.h-agent.content.h)<1&&await page.locator('.r1-skill-card').count()===5,agent);
  check(`${width}: community and banners retain DOM`,await page.evaluate(()=>window.__r2.grid===document.querySelector('[data-testid="community-showcases-grid"]')&&window.__r2.cards.every((c,i)=>c===document.querySelectorAll('[data-testid="community-post-card"]')[i])&&window.__r2.banners.every((c,i)=>c===document.querySelectorAll('.r2-banner')[i])));
  check(`${width}: community controls do not overlap`,await page.locator('[data-replica-toolbar]').evaluate(toolbar=>{const buttons=[...toolbar.querySelectorAll('button')].filter(b=>!b.closest('[aria-hidden="true"]')&&b.getBoundingClientRect().width>0);return buttons.every((b,i)=>buttons.slice(i+1).every(c=>{const a=b.getBoundingClientRect(),d=c.getBoundingClientRect();return Math.min(a.right,d.right)-Math.max(a.left,d.left)<=1||Math.min(a.bottom,d.bottom)-Math.max(a.top,d.top)<=1}))}));
  await page.screenshot({path:`${output}/agent-${width}.png`});
  if(width===390){
   await page.locator('.r2-mobile-project-toggle').click();
   check('Mobile projects expand without navigation',await page.locator('.r2-sidebar-projects').isVisible()&&await page.locator('.r2-mobile-project-toggle').getAttribute('aria-expanded')==='true');
   await page.screenshot({path:`${output}/mobile-projects.png`});
   await page.keyboard.press('Escape');
   check('Mobile project panel closes with Escape',!await page.locator('.r2-sidebar-projects').isVisible()&&await page.locator('.r2-mobile-project-toggle').getAttribute('aria-expanded')==='false');
  }
  await page.getByRole('tab',{name:'快速生成'}).click();await page.waitForTimeout(400);
  check(`${width}: returns to all four banners`,await page.evaluate(()=>document.documentElement.dataset.redesignMode==='quick'&&!document.querySelector('.r2-quick-content').inert&&document.querySelector('.r1-agent-modules').inert&&Math.abs(document.querySelector('.r2-mode-content').clientHeight-document.querySelector('.r2-quick-content').clientHeight)<1));
  await context.close();
 }
 const page=await browser.newPage({viewport:{width:1440,height:1100},locale:'zh-CN'});
 await page.goto(base+'/redesign/2',{waitUntil:'networkidle'});await page.waitForTimeout(350);
 const animation=await page.evaluate(async()=>{
  const exp=document.querySelector('.r2-mode-content'),grid=document.querySelector('[data-testid="community-showcases-grid"]');
  const sample=duration=>new Promise(resolve=>{const frames=[],start=performance.now();function frame(t){const r=exp.getBoundingClientRect();frames.push({t:t-start,h:r.height,bottom:r.bottom,y:grid.getBoundingClientRect().y});if(t-start<duration)requestAnimationFrame(frame);else resolve(frames)}requestAnimationFrame(frame)});
  const quickHeight=exp.clientHeight;
  document.querySelector('#r1-tab-agent').click();const forward=await sample(500);const agentHeight=exp.clientHeight;
  document.querySelector('#r1-tab-quick').click();const backward=await sample(400);
  document.querySelector('#r1-tab-agent').click();await new Promise(r=>setTimeout(r,80));const middle=exp.clientHeight;
  document.querySelector('#r1-tab-quick').click();const reverse=await sample(400);
  for(let i=0;i<17;i++){document.querySelector(i%2?'#r1-tab-quick':'#r1-tab-agent').click();await new Promise(r=>setTimeout(r,18))}
  await new Promise(r=>setTimeout(r,550));
  return{quickHeight,agentHeight,forward,backward,middle,reverse,finalMode:document.documentElement.dataset.redesignMode,finalHeight:exp.clientHeight};
 });
 const interpolates=a=>a.some(s=>s.h>animation.agentHeight+2&&s.h<animation.quickHeight-2);
 check('Measured mode transitions move community continuously',interpolates(animation.forward)&&interpolates(animation.backward)&&animation.forward.every((s,i,a)=>!i||Math.abs((s.y-a[0].y)-(s.bottom-a[0].bottom))<1));
 check('Interrupted transitions and rapid toggles settle correctly',animation.middle>animation.agentHeight&&animation.middle<animation.quickHeight&&Math.abs(animation.reverse.at(-1).h-animation.quickHeight)<1&&animation.finalMode==='agent'&&animation.finalHeight===animation.agentHeight);
 fs.writeFileSync(`${output}/animation-samples.json`,JSON.stringify(animation,null,2));
 await page.getByRole('textbox').fill('保留方案二的项目草稿');
 await page.evaluate(()=>window.__r2Grid=document.querySelector('[data-testid="community-showcases-grid"]'));
 for(const width of [390,768,1920,1440]){
  await page.setViewportSize({width,height:1100});await page.waitForTimeout(520);
  check(`Resize ${width}: retains mode, draft, cards and measured height`,await page.evaluate(()=>document.documentElement.dataset.redesignMode==='agent'&&document.querySelector('textarea').value==='保留方案二的项目草稿'&&window.__r2Grid===document.querySelector('[data-testid="community-showcases-grid"]')&&Math.abs(document.querySelector('.r2-mode-content').clientHeight-document.querySelector('.r1-agent-modules').clientHeight)<1&&document.documentElement.scrollWidth===innerWidth));
 }
 await page.getByRole('tab',{name:'Agent 模式'}).press('Home');await page.waitForTimeout(400);
 await page.getByRole('tab',{name:'快速生成'}).press('ArrowRight');await page.waitForTimeout(520);
 check('Keyboard mode switch keeps draft and selection',await page.evaluate(()=>document.activeElement.id==='r1-tab-agent'&&document.activeElement.getAttribute('aria-selected')==='true'&&document.querySelector('textarea').value==='保留方案二的项目草稿'));
 const scroll=await page.evaluate(async()=>{const s=document.querySelector('[data-radix-scroll-area-viewport]');s.scrollTop=300;const before=s.scrollTop;document.querySelector('#r1-tab-quick').click();await new Promise(r=>setTimeout(r,400));const quick=s.scrollTop;document.querySelector('#r1-tab-agent').click();await new Promise(r=>setTimeout(r,520));return{before,quick,agent:s.scrollTop}});
 check('Mode switching preserves scroll position',scroll.before===300&&scroll.quick===300&&scroll.agent===300,scroll);
 await page.emulateMedia({reducedMotion:'reduce'});await page.evaluate(()=>document.querySelector('#r1-tab-quick').click());await page.waitForTimeout(40);
 check('Reduced motion remains supported',await page.evaluate(()=>getComputedStyle(document.querySelector('.r2-mode-content')).transitionDuration==='0s'&&document.getAnimations().length===0));
 await page.reload({waitUntil:'networkidle'});check('Direct route refresh',await page.title()==='meshy_redesign2'&&await page.locator('html').getAttribute('data-redesign-mode')==='quick');
 await page.close();
 check('No console errors, failed images or external resources',!errors.length&&!failed.length&&!external.length,{errors,failed,external});
 }finally{await browser.close();fs.writeFileSync(`${output}/report.json`,JSON.stringify({checkedAt:new Date().toISOString(),base,passed:results.length>0&&results.every(r=>r.passed),results,errors,failed,external},null,2))}
 console.log(`Redesign 2: ${results.length} checks passed. ${output}/report.json`);
})().catch(e=>{console.error(e);process.exitCode=1});

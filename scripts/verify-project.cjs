const {dependency,chromeExecutable}=require('./runtime.cjs');
const {chromium}=require(dependency('playwright'));
const fs=require('node:fs');
const assert=require('node:assert/strict');
const base=process.env.VERIFY_URL||'http://localhost:5173';
const output=process.env.VERIFY_OUTPUT||'verification/project';
const geometry=JSON.parse(fs.readFileSync('reference/project/geometry.json'));
const route='/redesign/1/project/arrietty';
fs.mkdirSync(output,{recursive:true});
const checks=[],errors=[],failed=[],external=[];
const check=(name,passed,detail)=>{checks.push({name,passed,detail});assert.ok(passed,name+': '+JSON.stringify(detail||''))};
const close=(a,b)=>Math.abs(a-b)<=1;
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:chromeExecutable(chromium)});
 try{
 for(const width of [1802,1920,1440,768,390]){
  const height=width===1802?1164:width===1920?1200:1000;
  const page=await browser.newPage({viewport:{width,height},locale:'zh-CN',colorScheme:'dark'});
  page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
  page.on('response',r=>{if(r.status()>=400)failed.push(r.url())});
  page.on('request',r=>{if(!r.url().startsWith(new URL(base).origin)&&!r.url().startsWith('data:'))external.push(r.url())});
  await page.goto(base+route,{waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready);
  const state=await page.evaluate(()=>{
   const r=e=>{const b=e.getBoundingClientRect();return{x:b.x,y:b.y,width:b.width,height:b.height}};
   const chat=document.querySelector('.p1-chat-flow');
   const composer=document.querySelector('.p1-composer');
   const first=document.querySelector('[data-testid="canvas-card"]');
   const firstRect=first.getBoundingClientRect();
   const cards=[...document.querySelectorAll('[data-testid="canvas-card"]')];
   return{ready:document.documentElement.dataset.projectReady,title:document.title,nav:[...document.querySelectorAll('.replica-rail-entry')].map(e=>e.getAttribute('aria-label')),rail:r(document.querySelector('.logged-sidebar')),projects:r(document.querySelector('.p1-projects')),chat:r(document.querySelector('.p1-chat-panel')),canvas:r(document.querySelector('[data-testid="canvas-stage"]')),assets:r(document.querySelector('.p1-assets')),firstAsset:r(document.querySelector('.p1-asset-card')),firstCard:r(first),canvasCount:cards.length,assetCount:document.querySelectorAll('.p1-asset-card').length,empty:Boolean(chat.querySelector('.p1-msg-user'))&&Boolean(document.querySelector('[data-testid="agent-assistant-message"]'))&&document.querySelector('textarea').value==='',mode:document.querySelector('.p1-asset-tabs [aria-selected="true"]').textContent,overflow:document.documentElement.scrollWidth>innerWidth||document.documentElement.scrollHeight>innerHeight,broken:[...document.images].filter(i=>!i.complete||!i.naturalWidth).map(i=>i.src),canvasMatches:cards.every((card,i)=>{const v=card.getBoundingClientRect(),s=window.MeshyProjectScene.canvas[i],scale=new DOMMatrix(getComputedStyle(document.querySelector('.p1-scene')).transform).a;return Math.abs((v.x-firstRect.x)/scale-s.x)<.1&&Math.abs((v.y-firstRect.y)/scale-s.y)<.1&&card.querySelector('img').getAttribute('src')===s.src}),composer:r(composer),projectNames:[...document.querySelectorAll('.p1-project-row')].map(e=>e.textContent.trim())};
  });
  check(`${width}: route, shared scheme-one rail and title`,state.ready==='true'&&state.title==='meshy_redesign1'&&state.nav.join(',')==='创作,skills,资产,图像,模型,打印,动画',state);
  check(`${width}: conversation excerpt shown with empty composer`,state.empty&&await page.locator('textarea[aria-label="项目对话输入"]').count()===1,state.composer);
  check(`${width}: all original canvas and asset images present`,state.canvasCount===52&&state.assetCount===20&&state.canvasMatches&&state.mode==='模型'&&!state.broken.length,state);
  check(`${width}: no page overflow`,!state.overflow,state);
  if(width===1802){
   check('Reference: project and chat panel geometry',Object.keys(geometry.projectPanel).every(k=>close(state.projects[k],geometry.projectPanel[k]))&&Object.keys(geometry.chatPanel).every(k=>close(state.chat[k],geometry.chatPanel[k])),state);
   check('Reference: canvas and asset panel geometry',Object.keys(state.canvas).every(k=>close(state.canvas[k],geometry.canvas[k]))&&Object.keys(state.assets).every(k=>close(state.assets[k],geometry.assets[k])),state);
   // Rows now leave room for object names, so the first card keeps the reference x and size but sits higher.
   check('Reference: first canvas and asset card geometry',close(state.firstCard.x,geometry.canvas.firstCard.x)&&close(state.firstCard.y,72)&&close(state.firstCard.width,geometry.canvas.firstCard.size)&&close(state.firstAsset.x,geometry.assets.firstCard.x)&&close(state.firstAsset.y,geometry.assets.firstCard.y)&&close(state.firstAsset.width,geometry.assets.firstCard.size),state);
  }
  await page.screenshot({path:`${output}/workspace-${width}.png`});
  if(width<=1100){
   await page.getByRole('button',{name:'显示对话',exact:true}).click();
   check(`${width}: compact chat panel is accessible`,await page.locator('.p1-chat-panel').isVisible());
   await page.getByRole('textbox',{name:'项目对话输入'}).fill('保留这个项目草稿');
   await page.keyboard.press('Escape');
   check(`${width}: Escape closes compact chat`,!await page.locator('.p1-chat-panel').isVisible());
   await page.getByRole('button',{name:'显示对话',exact:true}).click();
   check(`${width}: draft survives closing the panel`,await page.getByRole('textbox',{name:'项目对话输入'}).inputValue()==='保留这个项目草稿');
   await page.screenshot({path:`${output}/chat-${width}.png`});
   await page.keyboard.press('Escape');
   await page.getByRole('button',{name:'显示项目',exact:true}).click();
   check(`${width}: all projects available in compact panel`,await page.locator('.p1-projects').isVisible()&&state.projectNames.length===15);
   await page.keyboard.press('Escape');
  }
  if(width===1802){
   await page.getByRole('textbox',{name:'项目对话输入'}).fill('收起再展开，保留项目草稿');
   await page.getByRole('button',{name:'隐藏项目栏',exact:true}).click();
   await page.waitForTimeout(300);
   check('Collapsed sidebar restores from the chat header',await page.locator('.p1-chat-header').getByRole('button',{name:'显示侧边栏',exact:true}).isVisible()&&await page.locator('.p1-projects').getAttribute('aria-hidden')==='true');
   check('Collapsed chat has four rounded corners and occupies the left edge',await page.locator('.p1-chat-panel').evaluate(el=>{const s=getComputedStyle(el);return ['borderTopLeftRadius','borderTopRightRadius','borderBottomLeftRadius','borderBottomRightRadius'].every(k=>s[k]==='12px')&&Math.abs(el.getBoundingClientRect().left-64)<1}));
   await page.getByRole('button',{name:'折叠资产栏',exact:true}).click();
   check('Asset list collapses to a named expansion button',!await page.locator('.p1-assets').isVisible()&&await page.getByRole('button',{name:'展开我的资产',exact:true}).isVisible()&&await page.getByRole('button',{name:'展开我的资产',exact:true}).innerText()==='我的资产');
   await page.screenshot({path:`${output}/panels-collapsed.png`});
   await page.getByRole('button',{name:'展开我的资产',exact:true}).click();
   check('Asset list shows the first batch of models',await page.locator('.p1-assets').isVisible()&&await page.locator('.p1-asset-card').count()===30&&await page.getByRole('button',{name:'折叠资产栏',exact:true}).getAttribute('aria-expanded')==='true');
   const collapsedX=await page.locator('.p1-chat-panel').evaluate(el=>el.getBoundingClientRect().left);
   await page.getByRole('button',{name:'显示侧边栏',exact:true}).press('Enter');
   const slide=await page.evaluate(()=>new Promise(resolve=>{const samples=[],start=performance.now();const frame=now=>{samples.push(document.querySelector('.p1-chat-panel').getBoundingClientRect().left);if(now-start<300)requestAnimationFrame(frame);else resolve(samples)};requestAnimationFrame(frame)}));
   check('Desktop project panel slides back and retains the draft',await page.locator('.p1-projects').isVisible()&&slide.some(x=>x>collapsedX+1&&x<347-1)&&Math.abs(slide.at(-1)-347)<1&&await page.getByRole('textbox',{name:'项目对话输入'}).inputValue()==='收起再展开，保留项目草稿',slide);
   await page.getByRole('textbox',{name:'项目对话输入'}).fill('');
   const zoom=await page.getByRole('button',{name:'缩放级别',exact:true}).textContent();
   await page.getByRole('button',{name:'放大',exact:true}).click();
   check('Canvas zoom responds',await page.getByRole('button',{name:'缩放级别',exact:true}).textContent()!==zoom);
   await page.getByRole('button',{name:'显示全部内容',exact:true}).click();
   check('Canvas returns to initial view',await page.getByRole('button',{name:'缩放级别',exact:true}).textContent()===zoom);
   const camera=()=>page.locator('.p1-scene').evaluate(el=>{const m=new DOMMatrix(getComputedStyle(el).transform),r=el.parentElement.getBoundingClientRect();return{scale:m.a,x:m.e,y:m.f,left:r.left,top:r.top,viewport:visualViewport.scale}});
   const fitCamera=await camera();
   await page.mouse.move(1000,150);await page.mouse.wheel(0,-120);await page.waitForTimeout(60);
   const startCamera=await camera();
   check('Unmodified wheel pans the canvas without changing zoom',startCamera.scale===fitCamera.scale&&startCamera.y!==fitCamera.y);
   await page.keyboard.down('Meta');await page.mouse.wheel(0,-120);await page.waitForTimeout(60);await page.keyboard.up('Meta');
   const zoomedCamera=await camera();
   check('Cmd wheel zooms canvas around the pointer without zooming the page',zoomedCamera.scale>startCamera.scale&&zoomedCamera.viewport===1&&Math.abs((1000-startCamera.left-startCamera.x)/startCamera.scale-(1000-zoomedCamera.left-zoomedCamera.x)/zoomedCamera.scale)<.01&&Math.abs((150-startCamera.top-startCamera.y)/startCamera.scale-(150-zoomedCamera.top-zoomedCamera.y)/zoomedCamera.scale)<.01,{startCamera,zoomedCamera});
   await page.keyboard.down('Meta');await page.mouse.wheel(0,120);await page.waitForTimeout(60);await page.keyboard.up('Meta');
   check('Cmd wheel zooms back out',Math.abs((await camera()).scale-startCamera.scale)<.001);
   await page.keyboard.down('Control');await page.mouse.wheel(0,-60);await page.waitForTimeout(60);await page.keyboard.up('Control');
   check('Control wheel also supports trackpad pinch events',(await camera()).scale>startCamera.scale);
   const beforeFold=await camera();
   await page.getByRole('button',{name:'折叠资产栏',exact:true}).click();await page.waitForTimeout(300);
   await page.getByRole('button',{name:'展开我的资产',exact:true}).click();await page.waitForTimeout(300);
   check('Panel toggles preserve manual canvas zoom and pan',JSON.stringify(await camera())===JSON.stringify(beforeFold));
   await page.getByRole('button',{name:'显示全部内容',exact:true}).click();
   const before=await page.locator('.p1-scene').getAttribute('style');
   await page.mouse.move(1000,150);await page.mouse.down();await page.mouse.move(1050,175,{steps:4});await page.mouse.up();
   check('Dragging empty canvas without Space does not pan',before===await page.locator('.p1-scene').getAttribute('style'));
   await page.locator('[data-testid="canvas-stage"]').focus();await page.keyboard.down('Space');
   await page.mouse.move(1000,150);await page.mouse.down();await page.mouse.move(1050,175,{steps:4});await page.mouse.up();await page.keyboard.up('Space');
   check('Space + drag pans the canvas without recreating cards',before!==await page.locator('.p1-scene').getAttribute('style')&&await page.locator('[data-testid="canvas-card"]').count()===52);
   await page.getByRole('button',{name:'显示全部内容',exact:true}).click();
   await page.getByRole('searchbox',{name:'搜索模型'}).fill('挂钟');
   check('Asset search filters local models',await page.locator('.p1-asset-card:visible').count()===3);
   await page.getByRole('searchbox',{name:'搜索模型'}).fill('');
   check('Clearing search restores the first batch of assets',await page.locator('.p1-asset-card:visible').count()===30);
   await page.emulateMedia({reducedMotion:'reduce'});
   await page.getByRole('button',{name:'隐藏项目栏',exact:true}).click();
   check('Reduced motion restores sidebar without sliding',await page.locator('.p1-shell').evaluate(el=>getComputedStyle(el).transitionDuration==='0s')&&await page.getByRole('button',{name:'显示侧边栏',exact:true}).isVisible());
   await page.getByRole('button',{name:'显示侧边栏',exact:true}).click();
  }
  await page.reload({waitUntil:'networkidle'});
  check(`${width}: direct route refresh`,await page.locator('html').getAttribute('data-project-ready')==='true');
  await page.close();
 }
 const page=await browser.newPage({viewport:{width:1440,height:1000},locale:'zh-CN'});
 await page.goto(base+'/redesign/1',{waitUntil:'networkidle'});
 await page.getByRole('tab',{name:'Agent 模式'}).click();await page.waitForTimeout(500);
 await page.getByRole('link',{name:/^点我！借东西小人游戏/}).click();
 await page.waitForURL('**'+route);
 check('First named project opens from redesign one home',await page.locator('html').getAttribute('data-project-ready')==='true');
 await page.getByRole('button',{name:'创作',exact:true}).click();await page.waitForURL('**/redesign/1');
 check('Shared home navigation returns to scheme one',await page.title()==='meshy_redesign1'&&await page.getByRole('tab',{name:'快速生成'}).getAttribute('aria-selected')==='true');
 await page.close();
 check('No external requests, broken assets or console errors',errors.length===0&&failed.length===0&&external.length===0,{errors,failed,external});
 }finally{await browser.close();fs.writeFileSync(`${output}/report.json`,JSON.stringify({checkedAt:new Date().toISOString(),base,passed:checks.every(x=>x.passed),checks,errors,failed,external},null,2));}
 console.log(`Project workspace: ${checks.length} checks passed. ${output}/report.json`);
})().catch(e=>{console.error(e);process.exitCode=1});

const {dependency,chromeExecutable}=require('./runtime.cjs');
const {chromium}=require(dependency('playwright'));
const fs=require('node:fs');
const assert=require('node:assert/strict');
const base=process.env.VERIFY_URL||'http://localhost:5173';
const output=process.env.VERIFY_OUTPUT||'verification/project';
const toolbar=JSON.parse(fs.readFileSync('reference/project/toolbar.json'));
const results=[],measurements=[];
const check=(name,passed,detail)=>{results.push({name,passed,detail});assert.ok(passed,name)};
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:chromeExecutable(chromium)});
 try {
  for(const width of [1802,1440]) {
   const page=await browser.newPage({viewport:{width,height:1164}});
   await page.goto(base+'/redesign/1/project/arrietty',{waitUntil:'networkidle'});
   const tools=await page.locator('.p1-top-tools').evaluate(el=>{
    const read=e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);return{width:r.width,height:r.height,x:r.x,background:s.backgroundColor,borderRadius:s.borderRadius}};
    return{...read(el),items:[...el.children].map(e=>({...read(e),svg:e.querySelector('svg')?read(e.querySelector('svg')):null}))};
   });
   check(`${width}: toolbar matches authenticated source geometry and colors`,tools.width===toolbar.group.width&&tools.height===toolbar.group.height&&tools.items.every((v,i)=>{
    const r=toolbar.items[i];return v.width===r.width&&v.height===r.height&&v.background===r.background&&Math.abs(v.x-tools.x-(r.x-toolbar.group.x))<.1&&(!v.svg||v.svg.width===r.svg.width&&v.svg.height===r.svg.height);
   }),tools);
   async function move(mode,reverse=false) {
    return page.evaluate(async({mode,reverse})=>{
     const chat=document.querySelector('.p1-chat-panel'),title=document.querySelector('.p1-chat-title'),restore=document.querySelector('.p1-projects-restore'),stage=document.querySelector('.p1-canvas-stage');
     let resizes=0;
     const observer=new ResizeObserver(()=>resizes++);observer.observe(stage);
     await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
     resizes=0;
     const start=performance.now();
     const sample=()=>({t:performance.now()-start,chat:chat.getBoundingClientRect().x,title:title.getBoundingClientRect().x,iconDisplay:getComputedStyle(restore).display,iconOpacity:+getComputedStyle(restore).opacity,width:stage.clientWidth});
     const control=mode==='open'?restore:document.querySelector('.p1-project-header [data-toggle="projects"]');
     const before=sample();control.click();const immediate=sample();
     const frames=[];let reversal;
     await new Promise(resolve=>{const frame=()=>{
      frames.push(sample());
      if(reverse&&!reversal&&performance.now()-start>=85){const before=sample();restore.click();reversal={before,after:sample()};}
      if(performance.now()-start<440)requestAnimationFrame(frame);else resolve();
     };requestAnimationFrame(frame)});
     observer.disconnect();
     return{mode,before,immediate,frames,resizes,reversal,finalHidden:document.querySelector('main').classList.contains('p1-projects-hidden')};
    },{mode,reverse});
   }
   const close=await move('close'),open=await move('open');
   for(const value of [close,open]) {
    const direction=value.mode==='open'?1:-1;
    check(`${width}: ${value.mode} keeps title fixed in the click frame`,Math.abs(value.immediate.title-value.before.title)<.1&&Math.abs(value.immediate.chat-value.before.chat)<.1,value);
    check(`${width}: ${value.mode} title moves continuously in one direction`,value.frames.length>=7&&value.frames.every((f,i)=>!i||(f.title-value.frames[i-1].title)*direction>=-.2)&&value.frames.some(f=>Math.abs(f.chat-value.before.chat)>2&&Math.abs(f.chat-value.frames.at(-1).chat)>2),value);
    check(`${width}: ${value.mode} does not resize the canvas every frame`,value.resizes<=2&&value.frames.every(f=>f.width===value.frames.at(-1).width),{resizes:value.resizes});
   }
   check(`${width}: opening icon stays mounted and fades`,open.immediate.iconDisplay!=='none'&&open.immediate.iconOpacity>.99&&open.frames.some(f=>f.iconOpacity>0&&f.iconOpacity<1)&&open.frames.at(-1).iconOpacity===0);
   const reverse=await move('close',true);
   check(`${width}: mid-animation reversal has no title jump`,Math.abs(reverse.reversal.before.title-reverse.reversal.after.title)<.1&&!reverse.finalHidden&&Math.abs(reverse.frames.at(-1).chat-(width===1802?347:288))<.1,reverse.reversal);
   const rapid=await page.evaluate(async()=>{
    for(let i=0;i<10;i++){document.querySelector('main').classList.contains('p1-projects-hidden')?document.querySelector('.p1-projects-restore').click():document.querySelector('.p1-project-header [data-toggle="projects"]').click();await new Promise(r=>setTimeout(r,22));}
    await new Promise(r=>setTimeout(r,350));
    return{hidden:document.querySelector('main').classList.contains('p1-projects-hidden'),x:document.querySelector('.p1-chat-panel').getBoundingClientRect().x,animations:document.querySelector('.p1-chat-panel').getAnimations().length};
   });
   check(`${width}: rapid clicks settle without queued animation`,!rapid.hidden&&Math.abs(rapid.x-(width===1802?347:288))<.1&&rapid.animations===0,rapid);
   measurements.push({width,close,open,reverse,rapid});
   await page.locator('.p1-top-tools').screenshot({path:`${output}/toolbar-${width}.png`});
   await page.close();
  }
 }finally{
  fs.mkdirSync(output,{recursive:true});
  fs.writeFileSync(`${output}/motion-report.json`,JSON.stringify({passed:results.every(x=>x.passed),checkedAt:new Date().toISOString(),base,results,measurements},null,2));
  await browser.close();
 }
 console.log(`Project motion: ${results.length} checks passed.`);
})().catch(error=>{console.error(error);process.exitCode=1});

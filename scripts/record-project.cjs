const {dependency,chromeExecutable}=require('./runtime.cjs');
const {chromium}=require(dependency('playwright'));
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const {execFileSync}=require('node:child_process');
(async()=>{
 const output=path.resolve('verification/project');
 const frames=fs.mkdtempSync(path.join(os.tmpdir(),'meshy-project-motion-'));
 const browser=await chromium.launch({headless:true,executablePath:chromeExecutable(chromium)});
 try {
  const context=await browser.newContext({viewport:{width:1440,height:1000},locale:'zh-CN'});
  const page=await context.newPage();
  await page.goto('http://localhost:5173/redesign/1/project/arrietty',{waitUntil:'networkidle'});
  const cdp=await context.newCDPSession(page),captured=[];
  cdp.on('Page.screencastFrame',event=>{
   const file=path.join(frames,`frame-${String(captured.length).padStart(5,'0')}.jpg`);
   fs.writeFileSync(file,Buffer.from(event.data,'base64'));
   captured.push({file,time:event.metadata.timestamp});
   cdp.send('Page.screencastFrameAck',{sessionId:event.sessionId}).catch(()=>{});
  });
  await cdp.send('Page.startScreencast',{format:'jpeg',quality:95,maxWidth:1440,maxHeight:1000,everyNthFrame:1});
  const begin=Date.now(),timeline=[];
  const toggle=async hold=>{
   timeline.push((Date.now()-begin)/1000);
   await page.evaluate(()=>{const hidden=document.querySelector('main').classList.contains('p1-projects-hidden');document.querySelector(hidden?'.p1-projects-restore':'.p1-project-header [data-toggle="projects"]').dispatchEvent(new MouseEvent('click',{bubbles:true,detail:1}))});
   await page.waitForTimeout(hold);
  };
  await page.waitForTimeout(600);
  await toggle(900);await toggle(1000);
  await toggle(85);await toggle(1000);
  for(let i=0;i<6;i++)await toggle(45);
  await page.waitForTimeout(900);
  await page.getByRole('button',{name:'折叠资产栏',exact:true}).click();await page.waitForTimeout(650);
  await page.getByRole('button',{name:'展开我的资产',exact:true}).click();await page.waitForTimeout(650);
  await toggle(850);await toggle(900);
  await cdp.send('Page.stopScreencast');
  const duration=(Date.now()-begin)/1000;
  let concat='';
  captured.forEach((frame,i)=>{const span=i+1<captured.length?captured[i+1].time-frame.time:Math.max(.1,duration-(frame.time-captured[0].time));concat+=`file '${frame.file}'\nduration ${Math.max(.001,span)}\n`});
  concat+=`file '${captured.at(-1).file}'\n`;
  fs.writeFileSync(path.join(frames,'frames.txt'),concat);
  execFileSync('ffmpeg',['-hide_banner','-loglevel','error','-y','-f','concat','-safe','0','-i',path.join(frames,'frames.txt'),'-vf','fps=60','-c:v','libx264','-preset','medium','-crf','18','-pix_fmt','yuv420p','-movflags','+faststart',path.join(output,'sidebar-motion.mp4')]);
  await page.screenshot({path:path.join(output,'controls-refined.png'),clip:{x:0,y:0,width:1440,height:210}});
  fs.writeFileSync(path.join(output,'sidebar-recording.json'),JSON.stringify({duration,capturedFrames:captured.length,timeline},null,2));
  console.log(`Recorded ${captured.length} frames: verification/project/sidebar-motion.mp4`);
 }finally{await browser.close();fs.rmSync(frames,{recursive:true,force:true})}
})().catch(error=>{console.error(error);process.exitCode=1});

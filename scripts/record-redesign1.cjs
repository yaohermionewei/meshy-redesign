// Records the running local app's actual rendered frames, including interrupted
// transitions. This isolated Chromium instance does not use the user's session.
const {dependency,chromeExecutable}=require('./runtime.cjs');
const {chromium}=require(dependency('playwright'));
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const {execFileSync}=require('node:child_process');
(async()=>{
 const version=process.env.REDESIGN_VERSION==='2'?'2':'1';
 const output=path.resolve(`verification/redesign${version}`);
 fs.mkdirSync(output,{recursive:true});
 const frames=fs.mkdtempSync(path.join(os.tmpdir(),'meshy-r1-record-'));
 const browser=await chromium.launch({headless:true,executablePath:chromeExecutable(chromium)});
 const context=await browser.newContext({viewport:{width:1440,height:1100},locale:'zh-CN',colorScheme:'dark'});
 const page=await context.newPage();
 await page.goto(`http://localhost:5173/redesign/${version}`,{waitUntil:'networkidle'});
 await page.evaluate(()=>document.fonts.ready);
 const cdp=await context.newCDPSession(page);
 const captured=[];
 cdp.on('Page.screencastFrame',event=>{
  const file=path.join(frames,`frame-${String(captured.length).padStart(5,'0')}.jpg`);
  fs.writeFileSync(file,Buffer.from(event.data,'base64'));
  captured.push({file,time:event.metadata.timestamp});
  cdp.send('Page.screencastFrameAck',{sessionId:event.sessionId}).catch(()=>{});
 });
 await cdp.send('Page.startScreencast',{format:'jpeg',quality:95,maxWidth:1440,maxHeight:1100,everyNthFrame:1});
 const timeline=[];
 const begin=Date.now();
 async function choose(mode,hold){timeline.push({time:(Date.now()-begin)/1000,mode});await page.locator(`#r1-tab-${mode}`).click();await page.waitForTimeout(hold)}
 await page.waitForTimeout(1100);
 await choose('agent',1500);
 await choose('quick',1200);
 await choose('agent',100);
 await choose('quick',100);
 await choose('agent',1400);
 for(const mode of ['quick','agent','quick','agent','quick','agent'])await choose(mode,45);
 await page.waitForTimeout(1200);
 await choose('quick',1200);
 await choose('agent',1200);
 await cdp.send('Page.stopScreencast');
 const duration=(Date.now()-begin)/1000;
 await browser.close();
 let concat='';
 captured.forEach((frame,i)=>{const span=i+1<captured.length?captured[i+1].time-frame.time:Math.max(.1,duration-(frame.time-captured[0].time));concat+=`file '${frame.file}'\nduration ${Math.max(.001,span)}\n`});
 concat+=`file '${captured.at(-1).file}'\n`;
 fs.writeFileSync(path.join(frames,'frames.txt'),concat);
 execFileSync('ffmpeg',['-hide_banner','-loglevel','error','-y','-f','concat','-safe','0','-i',path.join(frames,'frames.txt'),'-vf','fps=60','-c:v','libx264','-preset','medium','-crf','18','-pix_fmt','yuv420p','-movflags','+faststart',path.join(output,'switching.mp4')]);
 fs.writeFileSync(path.join(output,'recording.json'),JSON.stringify({viewport:{width:1440,height:1100},duration,capturedFrames:captured.length,timeline},null,2));
 fs.rmSync(frames,{recursive:true,force:true});
 console.log(`Recorded ${captured.length} rendered frames over ${duration.toFixed(2)}s: verification/redesign${version}/switching.mp4`);
})().catch(error=>{console.error(error);process.exit(1)});

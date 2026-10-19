/* Preserve the public visual assets and markup of the requested page.
 * Application bundles, account code, advertising, and API calls are excluded.
 */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const {execFile} = require('node:child_process');
const {promisify} = require('node:util');
const run = promisify(execFile);
const {dependency,chromeExecutable} = require('./runtime.cjs');
const {chromium} = require(dependency('playwright'));
const root = path.resolve(__dirname,'..');
process.chdir(root);
const assets = new Map();
const pending = new Map();
const proxy = process.env.CAPTURE_PROXY || 'http://127.0.0.1:7897';
const freezeCSS='*,*::before,*::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}';
function localPath(url){
 const u=new URL(url);
 let name=decodeURIComponent(u.pathname.split('/').pop()||'asset').replace(/[^a-zA-Z0-9._-]/g,'-').slice(-85);
 if(!path.extname(name)) name+='.bin';
 // Meshy serves optimized WebP responses at PNG/JPG URLs. Keep the URL name;
 // browsers detect the actual image format without any conversion or quality loss.
 return 'assets/'+crypto.createHash('sha256').update(url).digest('hex').slice(0,12)+'-'+name;
}
async function download(url){
 if(!url || /^(data:|blob:|#)/.test(url))return url;
 if(pending.has(url))return pending.get(url);
 const job=(async()=>{
  const relative=localPath(url), dest=path.join('public',relative);
  if(!fs.existsSync(dest))await run('curl',['-fsSL','-x',proxy,'--retry','2','--connect-timeout','15','--max-time','60',url,'-o',dest],{maxBuffer:1024*1024});
  assets.set(url,relative);
  return '/'+relative;
 })();
 pending.set(url,job);return job;
}
async function pool(items,fn,limit=6){let next=0;await Promise.all(Array.from({length:Math.min(limit,items.length)},async()=>{while(next<items.length){const item=items[next++];await fn(item)}}));}
async function snapshot(page){
 return page.evaluate(()=>{
  const root=document.documentElement.cloneNode(true);
  const originals=[...document.images],copies=[...root.querySelectorAll('img')];
  for(let i=0;i<originals.length;i++){
   copies[i].setAttribute('src',originals[i].currentSrc||originals[i].src);
   copies[i].removeAttribute('srcset');copies[i].removeAttribute('sizes');copies[i].loading='eager';
  }
  for(const child of [...root.querySelector('body').children])if(!['MAIN','svg'].includes(child.tagName))child.remove();
  root.querySelectorAll('script,iframe,noscript,next-route-announcer,link[rel="preload"],link[rel="prefetch"],link[rel="preconnect"],link[rel="dns-prefetch"],link[rel="manifest"],link[rel="alternate"],link[rel="canonical"]').forEach(e=>e.remove());
  root.querySelectorAll('head style').forEach(s=>s.remove());
  root.querySelectorAll('link[rel="stylesheet"]').forEach(l=>{if(!l.href.includes('cdn.meshy.ai'))l.remove()});
  root.querySelectorAll('link[href]').forEach(l=>l.setAttribute('href',l.href));
  root.querySelectorAll('meta[name="next-size-adjust"],meta[name="google-site-verification"]').forEach(e=>e.remove());
  root.querySelectorAll('*').forEach(e=>{for(const a of [...e.attributes])if(/^on/i.test(a.name))e.removeAttribute(a.name)});
  const header=root.querySelector('header');header.setAttribute('data-replica-header','');
  const toolbar=root.querySelector('h2').closest('.sticky');toolbar.setAttribute('data-replica-toolbar','');
  const hero=root.querySelector('h1').parentElement.parentElement.parentElement;hero.setAttribute('data-replica-hero','');
  const refs=[...root.querySelectorAll('img')].map(i=>i.src);
  for(const e of root.querySelectorAll('[style]'))for(const m of e.getAttribute('style').matchAll(/url\(["']?([^"')]+)["']?\)/g))if(m[1].startsWith('https:'))refs.push(m[1]);
  const og=root.querySelector('meta[property="og:image"]')?.content;if(og)refs.push(og);
  return {html:'<!DOCTYPE html>\n'+root.outerHTML,main:root.querySelector('main').outerHTML,header:header.outerHTML,toolbar:toolbar.outerHTML,modal:root.querySelector('#modal-root').outerHTML,images:refs,icons:[...root.querySelectorAll('link[rel*="icon"]')].map(l=>l.href),styles:[...root.querySelectorAll('link[rel="stylesheet"]')].map(l=>l.href),svgCount:root.querySelectorAll('svg').length};
 });
}
async function main(){
 fs.mkdirSync('public/assets',{recursive:true});fs.mkdirSync('src',{recursive:true});fs.mkdirSync('reference/css',{recursive:true});
 const browser=await chromium.launch({headless:true,executablePath:chromeExecutable(chromium),proxy:{server:proxy}});
 const context=await browser.newContext({viewport:{width:1440,height:1000},deviceScaleFactor:1,locale:'zh-CN',colorScheme:'dark'});
 const page=await context.newPage();
 const cssURLs=new Set();
 page.on('response',r=>{if(r.request().resourceType()==='stylesheet'&&r.url().includes('cdn.meshy.ai'))cssURLs.add(r.url())});
 await page.addInitScript(()=>{
  window.__captureIntervals=[];
  const interval=window.setInterval;
  window.setInterval=(...args)=>{const id=interval(...args);window.__captureIntervals.push(id);return id};
  window.__captureObservers=[];
  const Observer=window.IntersectionObserver;
  window.IntersectionObserver=class extends Observer{constructor(...args){super(...args);window.__captureObservers.push(this)}};
 });
 await page.goto('https://www.meshy.ai/zh/discover',{waitUntil:'domcontentloaded',timeout:90000});
 await page.waitForSelector('[data-testid="community-post-card"]',{timeout:60000});
 await page.waitForTimeout(15000);
 await page.addStyleTag({content:freezeCSS});
 await page.evaluate(()=>{
  window.__captureIntervals.forEach(clearInterval);
  window.__captureObservers.forEach(o=>o.disconnect());
  for(const img of document.images)img.loading='eager';
  const banner=document.querySelector('[data-feed-banner-cell]');
  const scroller=banner?.querySelector('[class*="snap-x"]');
  if(scroller)scroller.scrollLeft=0;
 });
 await page.evaluate(()=>Promise.all([...document.images].filter(i=>i.src.includes('meshy')).map(i=>i.decode().catch(()=>{}))));
 await page.evaluate(()=>document.fonts.ready);
 await page.keyboard.press('Escape');
 await page.locator('h1').click({position:{x:5,y:5}});
 await page.mouse.move(0,0);
 await page.waitForTimeout(300);
 console.log('Reference loaded. Capturing responsive layouts.');
 const captures={},states={},reports=[];
 for(const size of [{width:1440,height:1000},{width:1920,height:1080},{width:1024,height:900},{width:390,height:844}]){
  const mode=size.width<768?'mobile':size.width<1040?'tablet':'desktop';
  await page.setViewportSize(size);await page.waitForTimeout(700);
  const scroller=page.locator('[data-radix-scroll-area-viewport]').first();
  await scroller.evaluate(e=>{e.scrollTop=0});
  await page.evaluate(()=>{
   window.__captureObservers.forEach(o=>o.disconnect());
   for(const img of document.images)img.loading='eager';
   const s=document.querySelector('[data-feed-banner-cell] [class*="snap-x"]');if(s)s.scrollLeft=0;
  });
  await page.evaluate(()=>Promise.all([...document.images].filter(i=>i.src.includes('meshy')).map(i=>i.decode().catch(()=>{}))));
  await page.waitForTimeout(300);
  const top=await snapshot(page);
  if(!captures[mode])captures[mode]=top;
  states[mode]??={};states[mode].top={header:top.header,toolbar:top.toolbar,modal:top.modal};
  await page.screenshot({path:`reference/original-${size.width}.png`});
  const metrics=await page.evaluate(()=>({grids:[...document.querySelectorAll('[data-testid="community-showcases-grid"]')].map(e=>({rect:e.getBoundingClientRect().toJSON(),children:[...e.children].map(c=>({rect:c.getBoundingClientRect().toJSON(),style:c.getAttribute('style')}))}))}));
  reports.push({size,...metrics});
  await scroller.evaluate(e=>{e.scrollTop=750});await page.waitForTimeout(400);
  await page.screenshot({path:`reference/original-${size.width}-scroll.png`});
  const scroll=await snapshot(page);
  states[mode].scroll={header:scroll.header,toolbar:scroll.toolbar,modal:scroll.modal};
  fs.writeFileSync(`reference/scroll-source-${size.width}.html`,scroll.html);
  await scroller.evaluate(e=>{e.scrollTop=e.scrollHeight});await page.waitForTimeout(400);
  await page.screenshot({path:`reference/original-${size.width}-bottom.png`});
  const count=await page.locator('[data-testid="community-post-card"]').count();
  console.log(`${size.width}px: ${count} cards, ${top.images.length} image references`);
 }
 fs.writeFileSync('reference/metrics.json',JSON.stringify(reports,null,2));
 const captured=captures.desktop;
 fs.writeFileSync('reference/visual-source.html',captured.html);
 const assetURLs=new Set(Object.values(captures).flatMap(c=>[...c.images,...c.icons]));
 const cssSource=[];
 for(const url of [...new Set([...captured.styles,...cssURLs])]){
  const file=await download(url);
  const rawPath='reference/css/'+path.basename(new URL(url).pathname);
  const css=fs.readFileSync(fs.existsSync(rawPath)?rawPath:'public'+file,'utf8');
  fs.writeFileSync(rawPath,css);
  cssSource.push({url,file,css});
  for(const match of css.matchAll(/url\((?:["']?)([^)"']+)(?:["']?)\)/g)){
   if(match[1].startsWith('#'))continue;
   const resolved=new URL(match[1],url);
   if(/^https?:$/.test(resolved.protocol))assetURLs.add(resolved.href);
  }
 }
 console.log(`Downloading ${assetURLs.size} images, icons and font files, plus ${cssSource.length} stylesheets.`);
 let downloaded=0;
 await pool([...assetURLs],async url=>{await download(url);downloaded++;if(downloaded%25===0)console.log(`Assets: ${downloaded}/${assetURLs.size}`)});
 for(const {url,file,css} of cssSource){
  const local=css.replace(/url\((?:["']?)([^)"']+)(?:["']?)\)/g,(all,ref)=>{
   if(ref.startsWith('#'))return all;
   const resolved=new URL(ref,url);
   if(!/^https?:$/.test(resolved.protocol))return all;
   const target=assets.get(resolved.href);
   if(!target)throw Error('Unresolved CSS asset: '+ref);
   return 'url("/'+target+'")';
  });
  fs.writeFileSync('public'+file,local);
 }
 function localize(html){for(const [url,file] of assets){html=html.split(url.replaceAll('&','&amp;')).join('/'+file);html=html.split(url).join('/'+file)}return html}
 let html=localize(captured.html);
 for(const mode of ['tablet','mobile'])html=html.replace('</body>',`<template id="layout-${mode}">${localize(captures[mode].main)}</template></body>`);
 for(const [mode,c] of Object.entries(captures))fs.writeFileSync(`src/${mode}.html`,localize(c.main));
 fs.writeFileSync('public/layout-states.js','window.REPLICA_STATES = '+localize(JSON.stringify(states))+';\n');
 html=html.replace('</head>','<link rel="stylesheet" href="/styles.css">\n<script src="/layout-states.js" defer></script>\n<script src="/layout.js" defer></script>\n</head>');
 fs.writeFileSync('index.html',html);
 let shell=html;
 for(const mode of ['desktop','tablet','mobile'])shell=shell.replace(localize(captures[mode].main),`<!-- REPLICA_${mode.toUpperCase()} -->`);
 fs.writeFileSync('src/document.html',shell);
 fs.writeFileSync('public/assets-manifest.json',JSON.stringify({source:'https://www.meshy.ai/zh/discover',capturedAt:new Date().toISOString(),inlineSVGs:captured.svgCount,files:[...assets].map(([url,file])=>({url,file,bytes:fs.statSync('public/'+file).size}))},null,2));
 console.log('Capture complete:',assets.size,'local assets;',captured.svgCount,'inline SVGs.');
 await browser.close();
 await require('./retina-assets.cjs').prepareRetinaAssets();
 const {renderPage}=await import('./render.mjs');
 fs.writeFileSync('index.html',await renderPage());
}
main().catch(e=>{console.error(e);process.exit(1)});

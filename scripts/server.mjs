import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {renderPage} from './render.mjs';

const project=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const root=process.argv.includes('--dist')?path.join(project,'dist'):project;
const port=Number(process.env.PORT||5173);
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.svg':'image/svg+xml','.ico':'image/x-icon','.woff':'font/woff','.woff2':'font/woff2','.ttf':'font/ttf','.mp4':'video/mp4','.webm':'video/webm'};

http.createServer(async(req,res)=>{
 try{
  const url=new URL(req.url,'http://localhost');
  let pathname=decodeURIComponent(url.pathname);
  const projectPage = Number(pathname.match(/^\/redesign\/([12])\/project\/arrietty\/?$/)?.[1]) || false;
  const redesign = Number(pathname.match(/^\/redesign\/([12])\/?$/)?.[1]) || false;
  const assetsPage = Number(pathname.match(/^\/redesign\/([12])\/assets\/?$/)?.[1]) || false;
  const projectsPage = Number(pathname.match(/^\/redesign\/([12])\/projects\/?$/)?.[1]) || false;
  if(projectPage) pathname=root===project?'/index.html':`/redesign/${projectPage}/project/arrietty/index.html`;
  if(redesign) pathname=root===project?'/index.html':`/redesign/${redesign}/index.html`;
  if(assetsPage) pathname=root===project?'/index.html':`/redesign/${assetsPage}/assets/index.html`;
  if(projectsPage) pathname=root===project?'/index.html':`/redesign/${projectsPage}/projects/index.html`;
  if(pathname==='/'||pathname==='/zh/discover'||pathname==='/zh/discover/'||pathname==='/zh/workspace'||pathname==='/zh/workspace/')pathname='/index.html';
  else if(pathname.endsWith('/'))pathname+='index.html';
  const isPublic=pathname.startsWith('/assets/')||pathname==='/assets-manifest.json'||pathname==='/layout-states.js';
  const base=isPublic&&root===project?path.join(project,'public'):root;
  const target=path.resolve(base,'.'+pathname);
  if(!target.startsWith(base+path.sep)){res.writeHead(403);return res.end('Forbidden')}
  const body=root===project&&pathname==='/index.html'?Buffer.from(await renderPage({redesign:projectPage||assetsPage||projectsPage||redesign,scheme:projectPage||assetsPage||projectsPage||redesign,project:Boolean(projectPage),assets:Boolean(assetsPage),projects:Boolean(projectsPage)})):await fs.readFile(target);
  res.writeHead(200,{'Content-Type':types[path.extname(target)]||'application/octet-stream','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'});
  res.end(body);
 }catch(error){res.writeHead(error.code==='ENOENT'?404:500);res.end('File not found')}
}).listen(port,'0.0.0.0',()=>console.log(`Meshy visual replica: http://localhost:${port}`));

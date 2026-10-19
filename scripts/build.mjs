import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {renderPage} from './render.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const dist=path.join(root,'dist');
await fs.rm(dist,{recursive:true,force:true});
await fs.mkdir(dist,{recursive:true});
await fs.writeFile(path.join(root,'index.html'),await renderPage());
for(const file of ['index.html','styles.css','layout.js','redesign1.css','redesign1.js','redesign2.css','redesign2.js','redesign1-project.css','redesign1-project.js','redesign-assets.css','redesign-assets.js','redesign-projects.css','redesign-projects.js','asset-picker.css','asset-picker.js'])await fs.copyFile(path.join(root,file),path.join(dist,file));
for (const version of [1,2]) {
  await fs.mkdir(path.join(dist,`redesign/${version}/assets`),{recursive:true});
  await fs.mkdir(path.join(dist,`redesign/${version}/projects`),{recursive:true});
  await fs.writeFile(path.join(dist,`redesign/${version}/projects/index.html`),await renderPage({redesign:version,projects:true}));
  await fs.writeFile(path.join(dist,`redesign/${version}/index.html`),await renderPage({redesign:version}));
  await fs.writeFile(path.join(dist,`redesign/${version}/assets/index.html`),await renderPage({redesign:version,assets:true}));
}
await fs.mkdir(path.join(dist,'redesign/1/project/arrietty'),{recursive:true});
await fs.writeFile(path.join(dist,'redesign/1/project/arrietty/index.html'),await renderPage({redesign:1,project:true}));
await fs.mkdir(path.join(dist,'redesign/2/project/arrietty'),{recursive:true});
await fs.writeFile(path.join(dist,'redesign/2/project/arrietty/index.html'),await renderPage({redesign:2,project:true}));
await fs.cp(path.join(root,'public'),dist,{recursive:true});
console.log('Built dist/: HTML, original stylesheets, fonts, SVGs and images.');

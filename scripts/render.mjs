import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');

export async function renderPage({redesign = false, project = false, assets = false, projects = false, scheme = redesign} = {}) {
  let page=await fs.readFile(path.join(root,'src/document.html'),'utf8');
  for(const mode of ['desktop','tablet','mobile']) {
    const content=await fs.readFile(path.join(root,`src/${mode}.html`),'utf8');
    page=page.replace(`<!-- REPLICA_${mode.toUpperCase()} -->`,content);
  }
  if (redesign) {
    const version = redesign === 2 ? 2 : 1;
    const extension = version === 2 ? '<link rel="stylesheet" href="/redesign2.css">\n<script src="/redesign2.js" defer></script>\n' : '';
    page = page.replace('<html ', `<html data-redesign="${version}" data-redesign-mode="quick" `)
      .replace('<title>meshy_redesign</title>', `<title>meshy_redesign${scheme === 2 ? 2 : version}</title>`)
      .replace('<script src="/layout.js', `<link rel="stylesheet" href="/redesign1.css">\n<link rel="stylesheet" href="/asset-picker.css">\n${extension}<script src="/redesign1.js" defer></script>\n<script src="/asset-picker.js" defer></script>\n<script src="/layout.js`);
  }
  if (project || assets || projects) {
    // Workspace routes keep only the logo source; the scheme navigation is rebuilt at runtime.
    const desktop = await fs.readFile(path.join(root,'src/desktop.html'),'utf8');
    const logo = desktop.match(/<a\b[^>]*aria-label="Meshy"[^>]*>[\s\S]*?(<svg[\s\S]*?<\/svg>)/)?.[1];
    if (!logo) throw new Error('Meshy navigation logo is missing');
    page = page.slice(0,page.indexOf('<body')) + `<body class="group/body logged-in-replica"><main><header><a aria-label="Meshy">${logo}</a></header></main></body></html>`;
  }
  if (project) {
    page = page.replace('<html ', '<html data-project-workspace="arrietty" ')
      .replace('<script src="/layout.js', '<link rel="stylesheet" href="/redesign1-project.css">\n<script src="/assets/redesign1/project/scene.js" defer></script>\n<script src="/assets/assets-page/data.js" defer></script>\n<script src="/assets/assets-page/names.js" defer></script>\n<script src="/redesign1-project.js" defer></script>\n<script src="/layout.js');
  }
  if (assets) {
    page = page.replace('<html ', '<html data-assets-workspace="models" ')
      .replace('<script src="/layout.js', '<link rel="stylesheet" href="/redesign-assets.css">\n<script src="/assets/assets-page/data.js" defer></script>\n<script src="/assets/assets-page/names.js" defer></script>\n<script src="/redesign-assets.js" defer></script>\n<script src="/layout.js');
  }
  if (projects) {
    page = page.replace('<html ', '<html data-projects-workspace="all" ')
      .replace('<script src="/layout.js', '<link rel="stylesheet" href="/redesign-projects.css">\n<script src="/redesign-projects.js" defer></script>\n<script src="/layout.js');
  }
  return page;
}

/* Project workspace presentation. Reuses scheme one's actual navigation. */
(() => {
  if (!document.documentElement.dataset.projectWorkspace) return;
  const scene = window.MeshyProjectScene;
  // Both schemes open this workspace; links and the tab title stay in the scheme of the URL.
  const scheme = location.pathname.match(/^\/redesign\/([12])/)?.[1] || '1';
  const home = `/redesign/${scheme}`;
  // Scheme two's wide sidebar already lists projects and this project's chats,
  // so its workspace drops the separate project column.
  const withProjects = scheme !== '2';
  const sprite = '/assets/redesign1/project/icons.svg#';
  const icon = (name, cls = '') => `<svg viewBox="0 0 24 24" aria-hidden="true" class="${cls}"><use href="${sprite}${name}"></use></svg>`;
  const custom = paths => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
  const cursor = custom('<path d="m4 3 16 7-7 3-3 7-6-17Z"/>');
  const sidebar = custom('<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M9 4v16"/>');
  const assetsExpand = custom('<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M15 4v16m-4-10-2 2 2 2"/>');
  const attachmentIcons = {
    photoPlus: custom('<path d="M15 8h.01"/><path d="M12.5 21h-6.5a3 3 0 0 1-3-3v-12a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v6.5"/><path d="M3 16l5-5c.928-.893 2.072-.893 3 0l4 4"/><path d="M14 14l1-1c.67-.644 1.45-.824 2.182-.54"/><path d="M16 19h6M19 16v6"/>'),
    cubePlus: custom('<path d="M21 12.5V7.991a1.98 1.98 0 0 0-1-1.717l-7-4.008a2.016 2.016 0 0 0-2 0L5 6.273a1.98 1.98 0 0 0-1 1.718v8.018a1.98 1.98 0 0 0 1 1.717l7 4.008a2.016 2.016 0 0 0 2 0M12 22V12M12 12l8.73-5.04M3.27 6.96 12 12M16 19h6M19 16v6"/>'),
    grid: custom('<path d="M4 4m0 1a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1zM14 4m0 1a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1zM4 14m0 1a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1zM14 14m0 1a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1z"/>')
  };
  const texture = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M19.51 3.08 3.08 19.51c.09.34.27.65.51.9.25.24.56.42.9.51L20.93 4.49c-.19-.69-.73-1.23-1.42-1.41ZM11.88 3 3 11.88v2.83L14.71 3h-2.83ZM5 3c-1.1 0-2 .9-2 2v2l4-4H5Zm14 18c.55 0 1.05-.22 1.41-.59.37-.36.59-.86.59-1.41v-2l-4 4h2Zm-9.71 0h2.83L21 12.12V9.29L9.29 21Z"/></svg>';
  const running = '<svg viewBox="0 0 20 20" aria-hidden="true"><use href="/assets/redesign1/navigation.svg#animate"></use></svg>';
  const mesh = icon('model-mesh');
  const button = (label, content, cls = '', attrs = '') => `<button type="button" class="p1-icon-button ${cls}" aria-label="${label}" title="${label}" ${attrs}>${content}</button>`;

  function mount({rail, icons, utilities, emptyCover}) {
    const main = document.querySelector('main');
    main.className = `p1-workspace${withProjects?'':' p1-scheme2'}`;
    main.replaceChildren(rail);
    utilities.remove();
    document.body.classList.add('p1-project-body');
    rail.setAttribute('aria-label','主导航');
    rail.querySelector('[aria-label="创作"]').addEventListener('click',()=>{location.href=home});
    const logo = rail.querySelector('.replica-rail-logo');
    logo.setAttribute('role','link'); logo.tabIndex = 0;
    // Scheme two puts its collapse button inside the logo; only the logo itself goes home.
    logo.addEventListener('click',event=>{if(!event.target.closest('.r2-sidebar-toggle'))location.href=home});
    logo.addEventListener('keydown',event=>{if(event.key==='Enter'&&event.target===logo)location.href=home});
    const projectRows = [
      ['Y2K',''], ['类双人成行游戏','recent-y2k'], ['图片问题','recent-friends'],
      ['游戏角色白膜建模与贴图',''], ['帮我绑定骨骼',''], ['Unity Unreal 与 Blender 插件下载',''],
      ['Codex调用生成能力的MCP',''], ['游戏动画角色模型',''], ['3D游戏',''],
      ['做成游戏3d角色，后续要绑定骨骼的',''], ['游戏主角3D模型',''], ['低面数角色面部优化','recent-face'], ['未命名',''], ['3D资产拆件与骨骼绑定','']
    ].map(([name,image])=>`<button type="button" class="p1-project-row" title="${name}"><span class="p1-project-avatar">${image?`<img src="/assets/agent/${image}.webp" alt="">`:emptyCover}</span><span>${name}</span></button>`).join('');
    const projectPanel = `<aside class="p1-projects" id="p1-projects" aria-label="项目导航"><div class="p1-project-header"><span>Agent</span>${button('隐藏项目栏',icon('layout-sidebar-right-collapse'),'','data-toggle="projects" aria-controls="p1-projects"')}</div><button type="button" class="p1-new-project">${icon('plus')}<span>新建项目</span></button><div class="p1-project-scroll"><h2>项目</h2><button type="button" class="p1-project-row p1-current-project"><span class="p1-project-avatar"><img src="/assets/agent/recent-arrietty.webp" alt=""></span><span>点我！借东西小人游戏</span></button><div class="p1-chat-list">${['道具生成','角色和动画','场景测试'].map((name,i)=>`<button type="button" class="p1-chat-link ${i===0?'is-current':''}" ${i===0?'aria-current="page"':''}>${icon('message-circle')}<span>${name}</span></button>`).join('')}</div>${projectRows}</div></aside>`;
    const attachmentMenuHtml = `<div class="r1-attachment-menu" id="p1-attachment-menu" role="menu" aria-label="添加附件" hidden><button type="button" role="menuitem" data-attachment-action="image">${attachmentIcons.photoPlus}<span>上传图片</span><span class="r1-attachment-help">支持的格式：.png, .jpg, .jpeg, .webp　最大大小：20MB</span></button><button type="button" role="menuitem" data-attachment-action="model">${attachmentIcons.cubePlus}<span>上传模型</span><span class="r1-attachment-help">支持的文件格式：.fbx / .obj / .stl / .gltf / .glb　最大文件大小：100MB</span></button><button type="button" role="menuitem" data-attachment-action="assets">${attachmentIcons.grid}<span>从资产中选择</span></button></div><input class="r1-file-input p1-file-input" type="file" tabindex="-1" aria-hidden="true" accept="image/png,image/jpeg,image/webp"><input class="r1-file-input p1-file-input p1-model-input" type="file" tabindex="-1" aria-hidden="true" accept=".fbx,.obj,.stl,.gltf,.glb">`;
    const composer = `<div class="r1-composer p1-composer"><div class="p1-composer-refs" aria-label="已引用的画布对象" hidden></div><textarea aria-label="项目对话输入" placeholder="写点什么，或输入 / 查看技能。" spellcheck="false"></textarea><div class="r1-composer-footer"><div class="r1-composer-left">${button('添加附件',icons.plus,'r1-add','aria-haspopup="menu" aria-expanded="false" aria-controls="p1-attachment-menu"')}<span class="p1-composer-sep"></span>${button('技能',icons.book)}</div><div class="r1-composer-right"><button type="button" class="r1-model-control">Meshy 7.1 ${icons.down}</button><button type="button" class="r1-behavior-control">无需通知 ${icons.down}</button>${button('语音输入',icons.mic)}<button type="button" class="r1-send" aria-label="发送" disabled>${icons.send}</button></div></div>${attachmentMenuHtml}</div>`;
    // An excerpt of the original thread (its latest turn), so the panel reads as a real conversation.
    const canvasImage = i => `/assets/redesign1/project/canvas-${String(i).padStart(2,'0')}.webp`;
    const chevronRight = custom('<path d="m9 6 6 6-6 6"/>');
    const step = (label, images) => `<div class="p1-msg-step"><button type="button" class="p1-msg-step-label">${label}${chevronRight}</button><div class="p1-msg-thumbs">${images.map(([i,name])=>`<img src="${canvasImage(i)}" alt="${name}" title="${name}" width="64" height="64" loading="lazy">`).join('')}</div></div>`;
    const refChip = (i, name) => `<span class="p1-msg-ref" title="${name}"><img src="${canvasImage(i)}" alt=""><span>${name}</span></span>`;
    const msgActions = `<div class="p1-msg-actions">${button('复制',custom('<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>'))}${button('有帮助',custom('<path d="M7 11v8a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1h3Zm0 0 4-7a2 2 0 0 1 3 2l-1 4h5a2 2 0 0 1 2 2.3l-1.2 6A2 2 0 0 1 16.8 20H7"/>'))}${button('没帮助',custom('<path d="M7 13V5a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h3Zm0 0 4 7a2 2 0 0 0 3-2l-1-4h5a2 2 0 0 0 2-2.3l-1.2-6A2 2 0 0 0 16.8 4H7"/>'))}</div>`;
    const chatFlow = `<p class="p1-msg-more">更早的消息</p>
      <div class="p1-msg p1-msg-user"><div class="p1-msg-bubble">${refChip(43,'ghibli-wall-pendulum-clock-concept')}${refChip(41,'ghibli-dollhouse-mansion-concept')}<span>把这两个做完</span></div></div>
      <div class="p1-msg p1-msg-agent" data-testid="agent-assistant-message">
        ${step('已优化图片',[[45,'挂钟 · 正视图']])}
        <p>我现在将按照我们的专属管线，对提取好的纯净挂钟概念图和洋楼摆件概念图并行执行智能拓扑重建，生成目标面数为 5,000 面左右的纯净低模资产与白模。</p>
        ${step('已生成智能拓扑模型',[[46,'挂钟 · 智能拓扑'],[48,'挂钟 · 拓扑白模'],[47,'洋楼 · 智能拓扑'],[49,'洋楼 · 拓扑白模']])}
        <p>我现在将使用对应的纯净概念图作为风格参考，分别对挂钟与洋楼摆件的未贴图白模执行阶段 3 的水彩风贴图（Retexture）。</p>
        ${step('已应用新贴图',[[50,'挂钟 · 拓扑贴图'],[51,'洋楼 · 拓扑贴图']])}
        <p>男主角房间的两件关键道具已全部按照我们的专属管线制作完成：</p>
        <ol>
          <li><strong>复古挂墙摆钟</strong>（<code>glb_ghibli-clock-retexture_7b223ae5</code>，5,150 面）：<ul><li>提取纯净正视图后经智能拓扑解耦白模，重贴图消除了塑料假反光；深色橡木雕花结构清晰，黄铜钟盘罗马数字与下方钟摆质感扎实，木纹带有细腻的水彩沉淀感。</li></ul></li>
          <li><strong>两层尖顶洋楼摆件</strong>（<code>glb_ghibli-mansion-retexture_14220e0f</code>，4,185 面）：<ul><li>严格控制在 WebGL 性能预算内（约 4.1k 面），微缩建筑的石砌墙角、深灰蓝色尖顶瓦片与二楼栏杆走廊呈现温润哑光的手绘模型质感。</li></ul></li>
        </ol>
        <p>两个模型均已在右侧 Canvas 生成独立卡片，你可以直接在模型卡片上方点击 <strong>Download</strong> 下载 GLB，或点击 ⋮ <strong>菜单</strong> 执行后续操作。</p>
        ${msgActions}
      </div>`;
    const chatPanel = `<section class="p1-chat-panel" aria-label="Agent 对话"><header class="p1-chat-header"><div class="p1-chat-heading">${withProjects?`${button('显示侧边栏',sidebar,'p1-projects-restore','data-toggle="projects" aria-controls="p1-projects" aria-expanded="true"')}<span class="p1-divider p1-projects-restore-divider"></span>`:''}<button type="button" class="p1-chat-title"><span>道具生成</span>${icons.down}</button></div><div class="p1-chat-actions">${button('新聊天',icons.plus)}${button('分享聊天',icon('share'))}${button('更多聊天操作',icon('dots'))}</div></header><div class="p1-chat-flow" aria-label="对话内容" tabindex="0">${chatFlow}</div>${composer}</section>`;
    // Every object keeps its name visible above it, so each row of the original
    // layout gets extra room for one label line.
    const rowGap = 24;
    const rows = [...new Set(scene.canvas.map(item=>item.y))].sort((a,b)=>a-b);
    const items = scene.canvas.map((item,i)=>({...item,index:i,y:item.y+rows.indexOf(item.y)*rowGap}));
    const sceneWidth = 720;
    const sceneHeight = Math.max(...items.map(item=>item.y))+scene.cardSize;
    const modelTypes = {textured:['贴图模型',texture],geometry:['几何模型',mesh]};
    const viewModel = custom('<path d="M4 8V6a2 2 0 0 1 2-2h2M4 16v2a2 2 0 0 0 2 2h2M16 4h2a2 2 0 0 1 2 2v2M16 20h2a2 2 0 0 0 2-2v-2"/><path d="M7 12c3.3-4.7 6.7-4.7 10 0-3.3 4.7-6.7 4.7-10 0Z"/><circle cx="12" cy="12" r="1"/>');
    // "物体 · 版本": when the label is too narrow the object part shrinks first,
    // keeping the version that tells similar cards apart.
    const labelParts = name => {const [object,version]=name.split(' · ');return version?`<span class="p1-label-object">${object} · </span><span class="p1-label-version">${version}</span>`:`<span class="p1-label-version">${object}</span>`};
    const cards = items.map(item=>{
      const model = item.kind==='model';
      const [typeName,typeIcon] = model?modelTypes[item.type]:[];
      const hover = model?`<span class="p1-card-hover"><button type="button" class="p1-card-view" aria-label="查看模型 ${item.name}" title="查看模型" tabindex="-1">${viewModel}</button><span class="p1-card-meta" title="${typeName} · ${item.createdAt}"><span class="p1-card-meta-icon" aria-label="${typeName}">${typeIcon}</span><span aria-hidden="true">·</span><span>${item.createdAt}</span></span></span>`:'';
      return `<div class="p1-canvas-card ${model?'is-model':'is-image'}" data-testid="canvas-card" data-kind="${item.kind}" data-index="${item.index}" role="button" tabindex="0" aria-pressed="false" aria-label="${item.name}，${model?'3D 模型':'图像'}" title="${item.name}" style="left:${item.x}px;top:${item.y}px"><div class="p1-card-media"><img src="${item.src}" alt="${item.name}${model?'模型':'参考图'}" width="180" height="180" draggable="false"></div><div class="p1-card-ui"><span class="p1-card-label">${labelParts(item.name)}</span><span class="p1-card-frame"><i></i><i></i><i></i><i></i></span>${hover}</div></div>`;
    }).join('');
    const tool = (label, content, cls = '') => `<button type="button" class="p1-object-tool ${cls}" aria-label="${label}" title="${label}">${content}</button>`;
    const caret = custom('<path d="m8 10 4 4 4-4"/>');
    const sep = '<span class="p1-object-sep"></span>';
    const objectIcons = {
      edit: custom('<path d="M12 20a8 8 0 1 0-7.1-4.3L4 20l4.3-.9A8 8 0 0 0 12 20Z"/><path d="M9 12h6m-3-3v6"/>'),
      eraser: custom('<path d="M19 20H8.5l-4.2-4.3a1 1 0 0 1 0-1.4l10-10a1 1 0 0 1 1.4 0l5 5a1 1 0 0 1 0 1.4L11.5 20"/><path d="m18 13.3-6.3-6.3"/>'),
      download: custom('<path d="M4 17v2a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-2M7 11l5 5 5-5M12 4v12"/>'),
      regenerate: custom('<path d="M20 11A8.1 8.1 0 0 0 4.5 9M4 5v4h4m-4 4a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4"/>'),
      retexture: custom('<path d="m4 11 7-7M4 17 17 4m-7 16 2-2"/><path d="M13.5 17.5a3.5 3.5 0 1 0 3.5-3.5h-1.5m1.5-2-2 2 2 2"/>'),
      remesh: custom('<path d="M12 3 19.8 7.5v9L12 21l-7.8-4.5v-9L12 3Z"/><path d="M12 3v6m0 0 7.8-1.5M12 9 4.2 7.5M12 9l-4.5 8.5M12 9l4.5 8.5m-9 0h9m-9 0-3.3-1m12.3 1 3.3-1"/>'),
      texture,
      palette: custom('<path d="M12 21a9 9 0 0 1 0-18c5 0 9 3.6 9 8 0 1-.5 2-1.3 2.8-.8.8-2 1.2-3.2 1.2H14a2 2 0 0 0-1 3.8 1.3 1.3 0 0 1-1 2.2"/><circle cx="7.5" cy="10.5" r="1"/><circle cx="12" cy="7.5" r="1"/><circle cx="16.5" cy="10.5" r="1"/>'),
      send: custom('<path d="M10 14 21 3m0 0-6.5 18a.6.6 0 0 1-1 0L10 14l-7-3.5a.6.6 0 0 1 0-1L21 3Z"/>'),
      plug: custom('<path d="m9.8 6 8.2 8.2-2 2.1a5.8 5.8 0 1 1-8.3-8.3L9.8 6ZM4 20l3.5-3.5M15 4l-3.5 3.5M20 9l-3.5 3.5"/>'),
      exportFile: custom('<path d="M8 9H7a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-1m-4 5V3M9 6l3-3 3 3"/>'),
      modelEdit: custom('<path d="M20 10V7.5L12 3 4 7.5v9l8 4.5 1-.6"/><path d="m4 7.5 8 4.5 8-4.5M12 12v9"/><path d="m18.4 14.6 1 1a1 1 0 0 1 0 1.4L16 20.4h-2.4V18l3.4-3.4a1 1 0 0 1 1.4 0Z"/>'),
      print: '<svg viewBox="0 0 20 20" aria-hidden="true"><use href="/assets/redesign1/navigation.svg#print"></use></svg>',
      animate: running
    };
    // Matches the original canvas: textured models and white models offer different actions.
    const modelTail = `${sep}${tool('发送到',objectIcons.send+caret,'has-caret')}${sep}${tool('连接插件',objectIcons.plug+caret,'has-caret')}${tool('导出',objectIcons.exportFile+caret,'has-caret')}${tool('下载模型',objectIcons.download,'is-primary')}`;
    const regenerate = tool('重新生成（剩余 4 次）',objectIcons.regenerate+'<sup>x4</sup>');
    const objectToolbar = `<div class="p1-object-toolbar" role="toolbar" aria-label="对象操作" hidden><div class="p1-object-group" data-for="image">${tool('快捷编辑',objectIcons.edit)}${sep}${tool('橡皮工具',objectIcons.eraser)}${sep}${tool('下载',objectIcons.download)}</div><div class="p1-object-group" data-for="textured">${regenerate}${sep}${tool('重新贴图',objectIcons.retexture)}${sep}${tool('重拓扑',objectIcons.remesh)}${sep}${tool('纹理编辑',objectIcons.palette)}${modelTail}</div><div class="p1-object-group" data-for="geometry">${regenerate}${sep}${tool('生成贴图',objectIcons.texture)}${modelTail}</div><div class="p1-object-group" data-for="textured geometry"><button type="button" class="p1-object-tool" aria-label="模型编辑" title="模型编辑" disabled>${objectIcons.modelEdit}</button>${sep}${tool('3D 打印',objectIcons.print)}${sep}${tool('动画',objectIcons.animate)}</div></div>`;
    // The panel lists the whole model library, newest first, grouped by day; names match the canvas.
    const library = window.MeshyAssetLibrary?.models || [];
    const assetNames = window.MeshyAssetNames?.list || [];
    const assetDay = text => { const m = (text || '').match(/^(\d{2})\/(\d{2})\/(\d{4})/); return m ? `${m[3]}-${m[1]}-${m[2]}` : '示例与模板'; };
    const assetCard = i => { const item = library[i], name = assetNames[i]; return `<div class="p1-asset-item"><button type="button" class="p1-asset-card" aria-label="${name}" data-asset-index="${i}"><img src="${item.src}" alt="" width="112" height="112" loading="lazy" draggable="false">${item.badge ? `<span class="p1-asset-badge">${item.badge === 'animated' ? running : mesh}</span>` : ''}${item.sample ? `<span class="p1-asset-pill">${item.sample}</span>` : item.synced ? `<span class="p1-asset-retry">${icon('cloud-check')}</span>` : ''}</button><span class="p1-asset-name" title="${name}">${name}</span></div>`; };
    const assetPanel = `<aside class="p1-assets" id="p1-assets" aria-label="我的资产"><div class="p1-asset-tabs" role="tablist" aria-label="资产类型"><button type="button" role="tab" aria-selected="false">${icon('photo')}<span>图像</span></button><button type="button" role="tab" aria-selected="true">${icon('cube')}<span>模型</span></button></div><div class="p1-assets-toolbar"><div class="p1-asset-filters" role="group" aria-label="模型类型">${button('全部模型',icon('grid-dots'),'is-active','data-asset-type="all"')}${button('几何模型',icon('cube'),'','data-asset-type="geometry"')}${button('贴图模型',texture,'','data-asset-type="textured"')}${button('动画模型',running,'','data-asset-type="animated"')}<span class="p1-divider"></span>${button('筛选',icon('filter'))}</div><label class="p1-asset-search">${icon('search')}<input type="search" placeholder="搜索模型" aria-label="搜索模型"></label>${button('选择资产',custom('<rect x="3" y="3" width="18" height="18" rx="2"/><path d="m8 12 3 3 5-6"/>'))}</div><div class="p1-assets-scroll"><div class="p1-asset-groups" data-asset-list></div><div class="p1-assets-sentinel" aria-hidden="true"></div></div></aside>`;
    main.insertAdjacentHTML('beforeend',`<div class="p1-shell">${withProjects?projectPanel:''}${chatPanel}<section class="p1-canvas" aria-label="项目画布"><div class="p1-canvas-stage" data-testid="canvas-stage" tabindex="0" aria-label="素材画布，可拖动查看"><div class="p1-scene" style="width:${sceneWidth}px;height:${sceneHeight}px">${cards}</div><svg class="p1-snap-guides" aria-hidden="true"></svg>${objectToolbar}</div><div class="p1-top-tools">${button('帮助',icon('help'))}${button('Agent 设置',icon('settings'))}<span class="p1-divider"></span>${button('折叠资产栏','<span class="p1-assets-toggle-label">我的资产</span>'+icon('layout-sidebar-right-collapse'),'p1-assets-toggle','data-toggle="assets" aria-controls="p1-assets" aria-expanded="true"')}</div>${assetPanel}<div class="p1-canvas-tools" role="toolbar" aria-label="画布工具">${button('显示全部内容',icon('arrows-maximize'),'','data-camera="fit"')}<span class="p1-divider"></span>${button('选择',cursor,'p1-pointer-tool')}<span class="p1-divider"></span>${button('缩小',icon('minus'),'','data-camera="out"')}<button type="button" class="p1-zoom-label" aria-label="缩放级别">34%</button>${button('放大',icon('plus'),'','data-camera="in"')}</div></section></div><div class="p1-compact-tools">${withProjects?`${button('显示项目',icon('message-circle'),'','data-toggle="projects"')}<span>项目</span>`:''}${button('显示对话',icon('book-2'),'','data-toggle="chat"')}<span>对话</span></div><button type="button" class="p1-scrim" aria-label="关闭面板" hidden></button>`);
    let camera = {scale:1,x:0,y:0,manual:false};
    const stage = main.querySelector('.p1-canvas-stage');
    const layer = stage.firstElementChild;
    const assetsPanel = main.querySelector('.p1-assets');
    const projectsPanel = main.querySelector('.p1-projects');
    const projectsRestore = main.querySelector('.p1-projects-restore');
    const projectsCollapse = projectsPanel?.querySelector('[data-toggle="projects"]');
    const chatPanelElement = main.querySelector('.p1-chat-panel');
    const zoom = main.querySelector('.p1-zoom-label');
    const sizeQuery = matchMedia('(max-width: 1100px)');
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
    let panelAnimations = [];
    function paintCamera() {
      const rect=stage.getBoundingClientRect();
      if(!camera.manual){
        const availableWidth=innerWidth<768?rect.width-40:rect.width-(main.classList.contains('p1-assets-hidden')?0:assetsPanel.clientWidth)-32;
        const availableHeight=innerWidth<768?rect.height*.47-48:rect.height-140;
        camera.scale=Math.max(.15,Math.min(1,innerWidth>=1600?1:availableWidth/sceneWidth,availableHeight/sceneHeight));
        camera.x=24;
        camera.y=innerWidth<768?52:Math.max(72,(rect.height-sceneHeight*camera.scale)/2-18);
      }
      layer.style.transform=`translate(${camera.x}px,${camera.y}px) scale(${camera.scale})`;
      layer.style.setProperty('--zoom',camera.scale);
      // Labels and hover details stay at screen size; hide labels only when
      // the rows are too close together for a readable line.
      const cardScreen=scene.cardSize*camera.scale;
      layer.classList.toggle('is-labels-off',(rowGap+5)*camera.scale<15);
      layer.classList.toggle('is-detail-full',cardScreen>=128);
      zoom.textContent=`${Math.round(33.73*camera.scale)}%`;
      placeToolbar();
    }
    const toolbar=main.querySelector('.p1-object-toolbar');
    const refs=main.querySelector('.p1-composer-refs');
    const composerElement=main.querySelector('.p1-composer');
    const attachmentButton=composerElement.querySelector('.r1-add');
    const attachmentMenu=composerElement.querySelector('.r1-attachment-menu');
    const imageInput=composerElement.querySelector('.p1-file-input:not(.p1-model-input)');
    const modelInput=composerElement.querySelector('.p1-model-input');
    const setAttachmentMenu=open=>{
      // As on the original: left edge aligned with the plus button, 4px above it.
      if(open){
        const box=composerElement.getBoundingClientRect(), plus=attachmentButton.getBoundingClientRect();
        attachmentMenu.style.left=`${plus.left-box.left-composerElement.clientLeft}px`;
        attachmentMenu.style.bottom=`${box.bottom-composerElement.clientTop-plus.top+4}px`;
      }
      attachmentMenu.hidden=!open;
      attachmentMenu.inert=!open;
      attachmentButton.setAttribute('aria-expanded',String(open));
      attachmentButton.classList.toggle('is-open',open);
    };
    attachmentButton.addEventListener('click',event=>{
      event.stopPropagation();
      setAttachmentMenu(attachmentMenu.hidden);
    });
    attachmentMenu.addEventListener('click',event=>{
      const item=event.target.closest('[data-attachment-action]');
      if(!item)return;
      const action=item.dataset.attachmentAction;
      setAttachmentMenu(false);
      if(action==='image')imageInput.click();
      else if(action==='model')modelInput.click();
      else if(action==='assets')window.MeshyAssetPicker?.open({onPick:addAssetRef});
    });
    document.addEventListener('pointerdown',event=>{
      if(!composerElement.contains(event.target))setAttachmentMenu(false);
    });
    document.addEventListener('keydown',event=>{
      if(event.key==='Escape'&&!attachmentMenu.hidden){
        setAttachmentMenu(false);
        attachmentButton.focus({preventScroll:true});
      }
    });
    const removeIcon=custom('<path d="M18 6 6 18M6 6l12 12"/>');
    let selected=null;
    const syncRefs=()=>{refs.hidden=!refs.children.length;composerElement.classList.toggle('has-refs',!refs.hidden)};
    // Assets picked in the dialog join the conversation as references next to the canvas one.
    function addAssetRef(asset) {
      if(!asset||refs.querySelector(`[data-ref="asset"][data-src="${CSS.escape(asset.src)}"]`))return;
      const chip=document.createElement('span');
      chip.className='p1-ref-chip';chip.dataset.ref='asset';chip.dataset.src=asset.src;chip.title=asset.name;
      chip.innerHTML=`<img src="${asset.src}" alt=""><span></span><button type="button" title="移除引用">${removeIcon}</button>`;
      chip.querySelector('span').textContent=asset.name;
      chip.querySelector('button').setAttribute('aria-label',`移除引用 ${asset.name}`);
      chip.querySelector('button').addEventListener('click',()=>{chip.remove();syncRefs();composerElement.querySelector('textarea').focus()});
      refs.append(chip);syncRefs();
    }
    function placeToolbar() {
      if(!selected){toolbar.hidden=true;return}
      const item=items[selected.dataset.index];
      const size=scene.cardSize*camera.scale;
      const left=camera.x+item.x*camera.scale, top=camera.y+item.y*camera.scale;
      const width=stage.clientWidth, height=stage.clientHeight;
      if(left+size<0||left>width||top+size<0||top>height){toolbar.hidden=true;return}
      toolbar.hidden=false;
      const assetsOpen=innerWidth>=768&&!main.classList.contains('p1-assets-hidden');
      const limit=assetsOpen?width-assetsPanel.offsetWidth-16:width-8;
      const toolbarWidth=toolbar.offsetWidth, toolbarHeight=toolbar.offsetHeight;
      const x=Math.max(8,Math.min(left+size/2-toolbarWidth/2,limit-toolbarWidth));
      let y=top-(layer.classList.contains('is-labels-off')?0:18)-10-toolbarHeight;
      if(y<8)y=top+size+12;
      toolbar.style.transform=`translate(${Math.round(x)}px,${Math.round(y)}px)`;
    }
    // A selected object becomes the conversation's reference, like an attachment.
    function select(card) {
      if(selected===card)return;
      if(selected){selected.classList.remove('is-selected');selected.setAttribute('aria-pressed','false')}
      selected=card;
      refs.querySelector('[data-ref="canvas"]')?.remove();
      if(card){
        const item=items[card.dataset.index];
        card.classList.add('is-selected');card.setAttribute('aria-pressed','true');
        layer.append(card);
        toolbar.dataset.kind=item.kind==='model'?item.type:'image';
        refs.insertAdjacentHTML('afterbegin',`<span class="p1-ref-chip" data-ref="canvas" title="${item.name}"><img src="${item.src}" alt=""><span>${item.name}</span><button type="button" aria-label="移除引用 ${item.name}" title="移除引用">${removeIcon}</button></span>`);
        refs.querySelector('[data-ref="canvas"] button').addEventListener('click',()=>select(null));
      }
      syncRefs();
      placeToolbar();
    }
    const scrim=main.querySelector('.p1-scrim');
    function syncProjects() {
      if(!projectsPanel)return;
      const visible = sizeQuery.matches ? main.classList.contains('p1-show-projects') : !main.classList.contains('p1-projects-hidden');
      projectsPanel.inert = !visible;
      projectsPanel.setAttribute('aria-hidden',String(!visible));
      const canRestore = sizeQuery.matches || !visible;
      projectsRestore.inert = !canRestore;
      projectsRestore.setAttribute('aria-hidden',String(!canRestore));
      main.querySelectorAll('[data-toggle="projects"]').forEach(control=>control.setAttribute('aria-expanded',String(visible)));
    }
    function stopPanelAnimations(){panelAnimations.forEach(animation=>animation.cancel());panelAnimations=[];}
    function toggleDesktopProjects(restoreKeyboardFocus) {
      // Capture the current visible positions even when reversing an animation.
      // Layout changes once; only compositor transforms run between frames.
      const moving=[chatPanelElement,stage];
      const before=moving.map(element=>element.getBoundingClientRect().left);
      stopPanelAnimations();
      const hidden=main.classList.toggle('p1-projects-hidden');
      camera.manual=true;
      syncProjects();
      const after=moving.map(element=>element.getBoundingClientRect().left);
      if(!reducedMotion.matches)panelAnimations=moving.map((element,index)=>element.animate([
        {transform:`translateX(${before[index]-after[index]}px)`},
        {transform:'translateX(0px)'}
      ],{duration:260,easing:'cubic-bezier(.22,1,.36,1)'}));
      // The restoration icon stays mounted while its opacity transitions out.
      if(restoreKeyboardFocus)(hidden?projectsRestore:projectsCollapse).focus({preventScroll:true});
    }
    function closeDrawers(){main.classList.remove('p1-show-projects','p1-show-chat');scrim.hidden=true;syncProjects();}
    main.querySelectorAll('[data-toggle]').forEach(control=>control.addEventListener('click',event=>{
      const target=control.dataset.toggle;
      if(target==='assets'){
        const hidden=main.classList.toggle('p1-assets-hidden');
        control.setAttribute('aria-expanded',String(!hidden));
        control.setAttribute('aria-label',hidden?'展开我的资产':'折叠资产栏');
        control.title=hidden?'展开我的资产':'折叠资产栏';
        control.querySelector('svg').outerHTML=hidden?assetsExpand:icon('layout-sidebar-right-collapse');
        assetsPanel.inert=hidden;
        paintCamera();
      }else if(target==='projects'&&!sizeQuery.matches){
        toggleDesktopProjects(event.detail===0);
      }else{
        const open=!main.classList.contains(`p1-show-${target}`);closeDrawers();
        if(open){main.classList.add(`p1-show-${target}`);scrim.hidden=false;}
        syncProjects();
      }
    }));
    scrim.addEventListener('click',closeDrawers);
    document.addEventListener('keydown',event=>{
      if(event.key!=='Escape')return;
      if(main.matches('.p1-show-projects,.p1-show-chat'))closeDrawers();else select(null);
    });
    sizeQuery.addEventListener('change',()=>{stopPanelAnimations();closeDrawers()});
    reducedMotion.addEventListener('change',()=>{if(reducedMotion.matches)stopPanelAnimations()});
    main.querySelectorAll('[data-camera]').forEach(control=>control.addEventListener('click',()=>{
      const action=control.dataset.camera;
      if(action==='fit')camera.manual=false;
      else{camera.manual=true;camera.scale=Math.max(.15,Math.min(3,camera.scale*(action==='in'?1.15:1/1.15)))}
      paintCamera();
    }));
    // Keep the scene point beneath the pointer fixed; cancel browser page zoom
    // only for modifier-wheel gestures that originate on the canvas itself.
    // A plain wheel or two-finger scroll pans the canvas.
    stage.addEventListener('wheel',event=>{
      event.preventDefault();
      const unit=event.deltaMode===1?16:event.deltaMode===2?stage.clientHeight:1;
      if(!event.metaKey&&!event.ctrlKey){
        camera.manual=true;camera.x-=event.deltaX*unit;camera.y-=event.deltaY*unit;paintCamera();return;
      }
      const delta=Math.max(-160,Math.min(160,event.deltaY*unit));
      const next=Math.max(.15,Math.min(3,camera.scale*Math.exp(-delta*.002)));
      const ratio=next/camera.scale;
      const rect=stage.getBoundingClientRect();
      const x=event.clientX-rect.left,y=event.clientY-rect.top;
      camera.x=x-(x-camera.x)*ratio;
      camera.y=y-(y-camera.y)*ratio;
      camera.scale=next;
      camera.manual=true;
      paintCamera();
    },{passive:false});
    // The default pointer selects and drags objects. Holding Space (or the
    // middle button) switches to the hand and pans the whole canvas.
    let drag, spaceHeld=false;
    const setSpace=held=>{spaceHeld=held;stage.classList.toggle('is-space',held)};
    document.addEventListener('keydown',event=>{
      if(event.code!=='Space'||event.target.closest?.('textarea,input,[contenteditable="true"]'))return;
      if(event.target!==document.body&&!stage.contains(event.target))return;
      event.preventDefault();
      if(!event.repeat)setSpace(true);
    });
    document.addEventListener('keyup',event=>{if(event.code==='Space')setSpace(false)});
    addEventListener('blur',()=>setSpace(false));
    stage.addEventListener('pointerdown',event=>{
      const pan=spaceHeld||event.button===1;
      if((!pan&&event.button!==0)||event.target.closest('.p1-object-toolbar,.p1-card-view'))return;
      if(event.button===1)event.preventDefault();
      const card=!pan&&event.target.closest('.p1-canvas-card');
      const item=card&&items[card.dataset.index];
      stage.setPointerCapture(event.pointerId);
      drag={x:event.clientX,y:event.clientY,pan,card,item,startX:item?item.x:camera.x,startY:item?item.y:camera.y,moved:false};
      if(pan)stage.classList.add('is-dragging');
    });
    stage.addEventListener('pointermove',event=>{
      if(!drag)return;
      const dx=event.clientX-drag.x, dy=event.clientY-drag.y;
      if(!drag.moved){
        if(Math.hypot(dx,dy)<3)return;
        drag.moved=true;
        if(drag.card){select(drag.card);drag.card.classList.add('is-moving');stage.classList.add('is-moving-object')}
      }
      if(drag.card){
        const snapped=snap(drag.item,drag.startX+dx/camera.scale,drag.startY+dy/camera.scale,event.metaKey||event.ctrlKey);
        drag.item.x=snapped.x;drag.item.y=snapped.y;
        drag.card.style.left=`${drag.item.x}px`;drag.card.style.top=`${drag.item.y}px`;
        placeToolbar();
      }else if(drag.pan){camera.manual=true;camera.x=drag.startX+dx;camera.y=drag.startY+dy;paintCamera()}
    });
    // Figma-style snapping: while dragging, the object's left / center / right
    // and top / middle / bottom snap to other objects' matching lines within a
    // few screen pixels, and blue guides show every alignment. Cmd/Ctrl skips it.
    const guides=main.querySelector('.p1-snap-guides');
    const svgNS='http://www.w3.org/2000/svg';
    function snap(item,x,y,bypass) {
      guides.replaceChildren();
      if(bypass)return{x,y};
      const size=scene.cardSize, threshold=6/camera.scale, others=items.filter(other=>other!==item);
      const lines=v=>[v,v+size/2,v+size];
      const best=(value,axis)=>{
        let offset=null;
        for(const other of others)for(const target of lines(other[axis]))for(const anchor of lines(value)){
          const delta=target-anchor;
          if(Math.abs(delta)<=threshold&&(offset===null||Math.abs(delta)<Math.abs(offset)))offset=delta;
        }
        return offset??0;
      };
      x+=best(x,'x');y+=best(y,'y');
      drawGuides({x,y},others,size);
      return{x,y};
    }
    function drawGuides(moving,others,size) {
      const screen=(v,axis)=>(axis==='x'?camera.x:camera.y)+v*camera.scale;
      const add=(tag,attrs)=>{const el=document.createElementNS(svgNS,tag);for(const key in attrs)el.setAttribute(key,attrs[key]);guides.append(el)};
      const cross=(cx,cy)=>add('path',{d:`M${cx-3} ${cy-3}l6 6m0-6-6 6`,class:'p1-snap-mark'});
      for(const [axis,cross_] of [['x','y'],['y','x']]){
        for(let k=0;k<3;k++){
          const value=moving[axis]+size*k/2;
          const aligned=others.filter(other=>[0,1,2].some(j=>Math.abs(other[axis]+size*j/2-value)<.01));
          if(!aligned.length)continue;
          const group=[moving,...aligned];
          const from=Math.min(...group.map(card=>card[cross_])), to=Math.max(...group.map(card=>card[cross_]+size));
          const line=screen(value,axis)+.5, a=screen(from,cross_), b=screen(to,cross_);
          add('line',axis==='x'?{x1:line,y1:a,x2:line,y2:b}:{x1:a,y1:line,x2:b,y2:line});
          for(const card of group)for(const edge of [card[cross_],card[cross_]+size]){
            const point=screen(edge,cross_);
            axis==='x'?cross(line,point):cross(point,line);
          }
        }
      }
    }
    const release=event=>{
      if(drag&&!drag.moved&&!drag.pan&&event.type==='pointerup')select(drag.card||null);
      drag?.card?.classList?.remove('is-moving');
      drag=null;stage.classList.remove('is-dragging','is-moving-object');
      guides.replaceChildren();
    };
    stage.addEventListener('pointerup',release);stage.addEventListener('pointercancel',release);
    layer.addEventListener('keydown',event=>{
      const card=event.target.closest('.p1-canvas-card');
      if(card&&event.key==='Enter'){event.preventDefault();select(selected===card?null:card)}
    });
    const observer=new ResizeObserver(paintCamera);observer.observe(stage);
    // Asset panel: type chips and search narrow the library; batches load as the end nears.
    const assetList = main.querySelector('[data-asset-list]');
    const assetScroll = main.querySelector('.p1-assets-scroll');
    const assetState = {type: 'all', query: '', limit: 30};
    const assetMatches = () => library.map((item, i) => i).filter(i => (assetState.type === 'all' || library[i].type === assetState.type) && (!assetState.query || assetNames[i].includes(assetState.query)));
    function renderAssets() {
      const all = assetMatches();
      const groups = [];
      for (const i of all.slice(0, assetState.limit)) {
        const day = assetDay(library[i].date);
        if (!groups.length || groups[groups.length - 1].day !== day) groups.push({day, items: []});
        groups[groups.length - 1].items.push(i);
      }
      assetList.innerHTML = groups.length ? groups.map(group => `<section class="p1-asset-group"><h3>${group.day}</h3><div class="p1-assets-grid">${group.items.map(assetCard).join('')}</div></section>`).join('') : '<p class="p1-asset-empty">没有找到匹配的模型。</p>';
    }
    const restartAssets = () => { assetState.limit = 30; renderAssets(); assetScroll.scrollTop = 0; };
    new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting) && assetState.limit < assetMatches().length) { assetState.limit += 30; renderAssets(); }
    }, {root: assetScroll, rootMargin: '0px 0px 360px 0px'}).observe(main.querySelector('.p1-assets-sentinel'));
    main.querySelector('.p1-asset-filters').addEventListener('click', event => {
      const chip = event.target.closest('[data-asset-type]');
      if (!chip) return;
      assetState.type = chip.dataset.assetType;
      main.querySelectorAll('[data-asset-type]').forEach(button => button.classList.toggle('is-active', button === chip));
      restartAssets();
    });
    main.querySelector('.p1-asset-search input').addEventListener('input', event => { assetState.query = event.target.value.trim(); restartAssets(); });
    renderAssets();
    syncProjects();
    paintCamera();
    const flow=main.querySelector('.p1-chat-flow');flow.scrollTop=flow.scrollHeight;
    document.documentElement.dataset.projectReady='true';
  }
  window.MeshyProjectWorkspace={mount};
})();

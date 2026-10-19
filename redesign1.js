/* Scheme one: a single persistent page, with two local composer modes. */
(() => {
  if (!['1', '2'].includes(document.documentElement.dataset.redesign)) return;
  // Every project, newest first. Shared by the scheme-two sidebar and the all-projects page.
  // [name, cover, updated, cut-out cover?]; cut-out covers sit on a neutral tile.
  window.MeshyProjectList = [
    ['点我！借东西小人游戏', '/assets/agent/recent-arrietty.webp', '2026年10月18日'],
    ['Y2K', null, '2026年10月18日'],
    ['类双人成行游戏', '/assets/agent/recent-y2k.webp', '2026年10月13日'],
    ['图片问题', '/assets/agent/recent-friends.webp', '2026年10月10日'],
    ['游戏角色白膜建模与贴图', '/assets/redesign1/project/asset-01.webp', '2026年10月9日', true],
    ['帮我绑定骨骼', '/assets/redesign1/project/asset-04.webp', '2026年10月9日', true],
    ['Unity Unreal 与 Blender 插件下载', '/assets/redesign1/project/canvas-00.webp', '2026年9月23日'],
    ['Codex调用生成能力的MCP', '/assets/redesign1/project/asset-05.webp', '2026年9月22日', true],
    ['游戏动画角色模型', '/assets/17c90fd776d2-01978af4-3ca3-7640-9ea5-448d57ba9753.webp', '2026年9月19日', true],
    ['3D游戏', '/assets/2ad0310cd782-019dd6a9-303a-71d6-b9ec-ba6df72238e2.webp', '2026年9月18日', true],
    ['做成游戏3d角色，后续要绑定骨骼的', '/assets/redesign1/project/asset-02.webp', '2026年9月17日', true],
    ['游戏主角3D模型', '/assets/2489a0bbc3bb-019e0138-c932-7029-a071-9e56f2bfaad7.webp', '2026年9月17日', true],
    ['低面数角色面部优化', '/assets/agent/recent-face.webp', '2026年9月16日'],
    ['未命名', '/assets/08d21cf2f27d-019a0576-1835-761a-8f76-897208dc3e42.webp', '2026年9月15日', true],
    ['3D资产拆件与骨骼绑定', '/assets/redesign2/print-skeleton-wolf.webp', '2026年9月12日', true]
  ];
  const root = document.documentElement;
  // Mock conversation. The composer's message travels to the project page through
  // sessionStorage; every Agent turn there is the same canned reply.
  const cubeThumb = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect width="48" height="48" rx="10" fill="#2a2a2a"/><path d="M24 12 35 18v12l-11 6-11-6V18Z" fill="none" stroke="#c5f955" stroke-width="2" stroke-linejoin="round"/><path d="M13 18l11 6 11-6M24 24v12" fill="none" stroke="#c5f955" stroke-width="2" stroke-linejoin="round"/></svg>')}`;
  window.MeshyMockChat = {
    key: 'meshy-mock-message',
    reply: '对话是模拟的，可以去体验整体框架、资产和项目哦~',
    // Local files become references: images are shrunk to a small preview, models get a cube icon.
    async fileRef(file) {
      if (!file.type.startsWith('image/')) return {kind: 'model', name: file.name, src: cubeThumb};
      try {
        const bitmap = await createImageBitmap(file);
        const scale = Math.min(1, 256 / Math.max(bitmap.width, bitmap.height));
        const canvas = Object.assign(document.createElement('canvas'), {width: Math.round(bitmap.width * scale), height: Math.round(bitmap.height * scale)});
        canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
        return {kind: 'image', name: file.name, src: canvas.toDataURL('image/webp', .85)};
      } catch { return {kind: 'image', name: file.name, src: cubeThumb}; }
    },
    save(message) { try { sessionStorage.setItem(this.key, JSON.stringify(message)); } catch {} },
    take() {
      try { const value = sessionStorage.getItem(this.key); sessionStorage.removeItem(this.key); return value ? JSON.parse(value) : null; }
      catch { return null; }
    }
  };
  const icon = (paths, extra = '') => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${extra}>${paths}</svg>`;
  const icons = {
    image: '<svg viewBox="0 0 24 24" aria-hidden="true"><use href="/assets/redesign1/navigation.svg#image"></use></svg>',
    model: '<svg viewBox="0 0 24 24" aria-hidden="true"><use href="/assets/redesign1/navigation.svg#model"></use></svg>',
    print: '<svg viewBox="0 0 24 24" aria-hidden="true"><use href="/assets/redesign1/navigation.svg#print"></use></svg>',
    animate: '<svg viewBox="0 0 20 20" aria-hidden="true"><use href="/assets/redesign1/navigation.svg#animate"></use></svg>',
    plus: icon('<path d="M12 5v14M5 12h14"/>'),
    book: icon('<path d="M19 4H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12V4ZM19 16H7a2 2 0 0 0-2 2M9 8h6"/>'),
    down: icon('<path d="m7 10 5 5 5-5"/>'),
    mic: icon('<rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10v2a7 7 0 0 0 14 0v-2M12 19v3M9 22h6"/>'),
    send: icon('<path d="M12 19V5m-6 6 6-6 6 6"/>'),
    photoPlus: icon('<path d="M15 8h.01"/><path d="M12.5 21h-6.5a3 3 0 0 1-3-3v-12a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v6.5"/><path d="M3 16l5-5c.928-.893 2.072-.893 3 0l4 4"/><path d="M14 14l1-1c.67-.644 1.45-.824 2.182-.54"/><path d="M16 19h6M19 16v6"/>'),
    cubePlus: icon('<path d="M21 12.5V7.991a1.98 1.98 0 0 0-1-1.717l-7-4.008a2.016 2.016 0 0 0-2 0L5 6.273a1.98 1.98 0 0 0-1 1.718v8.018a1.98 1.98 0 0 0 1 1.717l7 4.008a2.016 2.016 0 0 0 2 0M12 22V12M12 12l8.73-5.04M3.27 6.96 12 12M16 19h6M19 16v6"/>'),
    grid: icon('<path d="M4 4m0 1a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1zM14 4m0 1a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1zM4 14m0 1a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1zM14 14m0 1a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1z"/>')
  };
  let mounted = false;

  function mount() {
    if (mounted) return;
    mounted = true;
    // The tab title follows the scheme in the URL, so every route inside a scheme keeps it.
    document.title = `meshy_redesign${location.pathname.match(/^\/redesign\/([12])/)?.[1] || root.dataset.redesign}`;
    const rail = document.querySelector('.logged-sidebar');
    const entry = label => rail.querySelector(`[aria-label="${label}"]`);
    const home = entry('创建');
    home.setAttribute('aria-label', '创作');
    home.setAttribute('aria-current', 'page');
    home.querySelector('.replica-rail-label').textContent = '创作';
    home.querySelector('.replica-rail-icon').innerHTML = icon('<circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/>', 'class="r1-create-icon"');
    const skills = entry('模板');
    skills.setAttribute('aria-label', 'skills');
    skills.querySelector('.replica-rail-label').textContent = 'skills';
    skills.querySelector('.replica-rail-icon').innerHTML = icons.book;
    const utilities = document.createElement('nav');
    utilities.className = 'r1-utilities';
    utilities.setAttribute('aria-label', '更多资源');
    for (const label of ['商店','开发者','资源']) {
      const item = entry(label);
      // These are intentionally presentation-only entries in this prototype.
      const button = document.createElement('button');
      button.type = 'button'; button.innerHTML = item.innerHTML;
      button.setAttribute('aria-label', label);
      utilities.append(button); item.remove();
    }
    document.querySelector('main').append(utilities);
    entry('社区').remove();
    const railScroll = rail.querySelector('.replica-rail-scroll');
    const primary = rail.querySelector('.replica-rail-group');
    const divider = document.createElement('span');
    divider.className = 'replica-rail-separator';
    const creation = document.createElement('div');
    creation.className = 'replica-rail-group';
    for (const [key, label] of [['image','图像'],['model','模型'],['print','打印'],['animate','动画']]) {
      creation.insertAdjacentHTML('beforeend', `<button type="button" class="replica-rail-entry" aria-label="${label}"><span class="replica-rail-icon">${icons[key]}</span><span class="replica-rail-label">${label}</span></button>`);
    }
    railScroll.replaceChildren(primary, divider, creation);
    // Remove baseline destinations: this scheme introduces mode switching only.
    rail.querySelectorAll('a').forEach(a => { a.removeAttribute('href'); a.setAttribute('role','button'); a.tabIndex = 0; });
    // 资产 is the one rail destination: it opens this scheme's asset library.
    const scheme = location.pathname.match(/^\/redesign\/([12])/)?.[1] || root.dataset.redesign;
    const assets = entry('资产');
    assets.removeAttribute('role'); assets.removeAttribute('tabindex');
    assets.href = `/redesign/${scheme}/assets`;
    assets.dataset.navLink = 'assets';
    // Keep the mode that was active when the asset library was opened so the
    // library's back button can restore the same composer state after a full
    // page navigation. The storage entry is consumed on the next home mount.
    assets.addEventListener('click', () => {
      if (scheme !== '1') return;
      try { sessionStorage.setItem('meshy-redesign1-return-mode', root.dataset.redesignMode || 'quick'); } catch {}
    });

    // Projects without a cover show a muted, monochrome Meshy logo instead of an empty tile.
    const logo = rail.querySelector('.replica-rail-logo svg')?.cloneNode(true);
    logo?.removeAttribute('class');
    const emptyCover = `<span class="r1-cover-empty" aria-hidden="true">${logo ? logo.outerHTML : ''}</span>`;

    const workspace = window.MeshyProjectWorkspace || window.MeshyAssetsWorkspace || window.MeshyProjectsWorkspace;
    if (workspace) {
      window.MeshyRedesignVariant?.mountSidebar({rail, icons, emptyCover});
      workspace.mount({rail, icons, utilities, emptyCover, scheme});
      root.dataset.redesignReady = 'true';
      return;
    }

    const hero = document.querySelector('[data-replica-hero]');
    const prompt = hero.querySelector('[data-design4-input]');
    const chrome = prompt.parentElement;
    chrome.classList.add('r1-chrome');
    const oldTabRow = chrome.firstElementChild;
    const oldTabs = oldTabRow.firstElementChild;
    const buttons = [...oldTabs.children];
    const tablist = document.createElement('div');
    tablist.className = 'r1-mode-tabs';
    tablist.setAttribute('role', 'tablist');
    tablist.setAttribute('aria-label', '生成模式');
    tablist.innerHTML = '<span class="r1-tab-indicator" aria-hidden="true"></span>';
    buttons.forEach((button, index) => {
      const mode = index === 0 ? 'quick' : 'agent';
      button.className = 'r1-mode-tab';
      button.removeAttribute('aria-pressed');
      button.querySelector('span.absolute.inset-0')?.remove();
      button.querySelectorAll('.transition-opacity').forEach(el => { el.className = 'r1-mode-icon'; });
      button.type = 'button';
      button.id = `r1-tab-${mode}`;
      button.dataset.mode = mode;
      button.setAttribute('role', 'tab');
      button.setAttribute('aria-controls', `r1-panel-${mode}`);
      button.setAttribute('aria-selected', String(index === 0));
      button.tabIndex = index === 0 ? 0 : -1;
      tablist.append(button);
    });
    oldTabs.replaceWith(tablist);
    oldTabRow.className = 'r1-tab-row';
    const parameters = prompt.nextElementSibling;
    parameters.classList.add('r1-quick-parameters');
    const stage = document.createElement('div');
    stage.className = 'r1-input-stage';
    const quick = document.createElement('section');
    quick.className = 'r1-input-panel r1-quick-panel';
    quick.id = 'r1-panel-quick';
    quick.setAttribute('role','tabpanel');
    quick.setAttribute('aria-labelledby','r1-tab-quick');
    prompt.before(stage);
    quick.append(prompt, parameters);
    const agent = document.createElement('section');
    agent.className = 'r1-input-panel r1-agent-panel';
    agent.id = 'r1-panel-agent';
    agent.setAttribute('role','tabpanel');
    agent.setAttribute('aria-labelledby','r1-tab-agent');
    agent.setAttribute('aria-hidden','true');
    agent.inert = true;
    agent.innerHTML = `<div class="r1-composer-wrap"><div class="r1-composer"><div class="r1-composer-refs" aria-label="已引用的资产" hidden></div><textarea aria-label="告诉 Meshy 你想创造什么" placeholder="上传一张图片——我会把它变成 3D 模型。或输入 / 查看技能。" spellcheck="false"></textarea><div class="r1-composer-footer"><div class="r1-composer-left"><button type="button" class="r1-add" aria-label="添加附件" aria-haspopup="menu" aria-expanded="false" aria-controls="r1-attachment-menu">${icons.plus}</button><button type="button" class="r1-skills-control">${icons.book}<span>技能</span></button></div><div class="r1-composer-right"><button type="button" class="r1-model-control">Meshy 7.1 ${icons.down}</button><button type="button" class="r1-behavior-control">无需通知 ${icons.down}</button><button type="button" class="r1-mic" aria-label="语音输入">${icons.mic}</button><button type="button" class="r1-send" aria-label="发送" disabled>${icons.send}</button></div></div></div><div class="r1-attachment-menu" id="r1-attachment-menu" role="menu" aria-label="添加附件" hidden><button type="button" role="menuitem" data-attachment-action="image">${icons.photoPlus}<span>上传图片</span><span class="r1-attachment-help">支持的格式：.png, .jpg, .jpeg, .webp　最大大小：20MB</span></button><button type="button" role="menuitem" data-attachment-action="model">${icons.cubePlus}<span>上传模型</span><span class="r1-attachment-help">支持的文件格式：.fbx / .obj / .stl / .gltf / .glb　最大文件大小：100MB</span></button><button type="button" role="menuitem" data-attachment-action="assets">${icons.grid}<span>从资产中选择</span></button></div><input class="r1-file-input" type="file" tabindex="-1" aria-hidden="true" accept="image/png,image/jpeg,image/webp"><input class="r1-file-input r1-model-input" type="file" tabindex="-1" aria-hidden="true" accept=".fbx,.obj,.stl,.gltf,.glb"></div>`;
    stage.append(quick, agent);

    const composerWrap = agent.querySelector('.r1-composer-wrap');
    const add = agent.querySelector('.r1-add');
    const attachmentMenu = agent.querySelector('.r1-attachment-menu');
    const imageInput = agent.querySelector('.r1-file-input');
    // Assets picked in the dialog appear above the prompt as removable references.
    const refs = agent.querySelector('.r1-composer-refs');
    const draft = agent.querySelector('textarea');
    const send = agent.querySelector('.r1-send');
    const syncSend = () => { send.disabled = !draft.value.trim() && !refs.children.length; };
    const syncRefs = () => { refs.hidden = !refs.children.length; refs.parentElement.classList.toggle('has-refs', !refs.hidden); syncSend(); };
    function addAssetRef(asset) {
      if (!asset || [...refs.children].some(chip => chip.dataset.src === asset.src)) return;
      const chip = document.createElement('span');
      chip.className = `r1-ref-chip${asset.kind === 'skill' ? ' is-skill' : ''}`;
      chip.dataset.src = asset.src;
      chip.dataset.kind = asset.kind || 'asset';
      chip.title = asset.name;
      chip.innerHTML = `<img src="${asset.src}" alt=""><span></span><button type="button" title="移除引用"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg></button>`;
      chip.querySelector('span').textContent = asset.name;
      chip.querySelector('button').setAttribute('aria-label', `移除引用 ${asset.name}`);
      chip.querySelector('button').addEventListener('click', () => { chip.remove(); syncRefs(); agent.querySelector('textarea').focus(); });
      refs.append(chip);
      syncRefs();
    }
    const modelInput = agent.querySelector('.r1-model-input');
    for (const input of [imageInput, modelInput]) input.addEventListener('change', async () => {
      for (const file of input.files) addAssetRef(await window.MeshyMockChat.fileRef(file));
      input.value = '';
      draft.focus({preventScroll: true});
    });
    // 发送 opens the project with the message (mock: no request is made).
    function sendMessage() {
      if (send.disabled) return;
      window.MeshyMockChat.save({text: draft.value.trim(), refs: [...refs.children].map(chip => ({name: chip.title, src: chip.dataset.src, kind: chip.dataset.kind}))});
      location.href = `/redesign/${scheme}/project/arrietty`;
    }
    draft.addEventListener('input', syncSend);
    draft.addEventListener('keydown', event => { if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) { event.preventDefault(); sendMessage(); } });
    send.addEventListener('click', sendMessage);
    const setAttachmentMenu = open => {
      attachmentMenu.hidden = !open;
      attachmentMenu.inert = !open;
      add.setAttribute('aria-expanded', String(open));
      add.classList.toggle('is-open', open);
    };
    add.addEventListener('click', event => {
      event.stopPropagation();
      setAttachmentMenu(attachmentMenu.hidden);
    });
    attachmentMenu.addEventListener('click', event => {
      const item = event.target.closest('[data-attachment-action]');
      if (!item) return;
      const action = item.dataset.attachmentAction;
      setAttachmentMenu(false);
      if (action === 'image') imageInput.click();
      else if (action === 'model') modelInput.click();
      else if (action === 'assets') window.MeshyAssetPicker?.open({onPick: addAssetRef});
    });
    document.addEventListener('pointerdown', event => {
      if (!composerWrap.contains(event.target)) setAttachmentMenu(false);
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && !attachmentMenu.hidden) {
        setAttachmentMenu(false);
        add.focus({preventScroll:true});
      }
    });

    const skillCards = [
      ['中世纪游戏道具','/assets/203853ccb523-0197ad56-7090-7030-a5ef-a60b8706d035.webp',true],
      ['角色动画','/assets/redesign1/project/asset-04.webp',true],
      ['游戏场景搭建','/assets/agent/home-batch-models.webp',false],
      ['草图转手办','/assets/agent/home-sketch-to-figurine.webp',false],
      ['冰箱贴','/assets/redesign1/project/asset-00.webp',true]
    ];
    const features = skillCards.map(([name, image, cutout]) => `<button type="button" class="r1-skill-card"><img src="${image}" alt="" width="40" height="40"${cutout ? ' class="r1-skill-cutout"' : ''}><span>${name}</span></button>`).join('');
    const projects = [
      ['新建项目', null], ['点我！借东西小人游戏','recent-arrietty'], ['Y2K', null], ['类双人成行','recent-y2k'], ['图片问题','recent-friends']
    ].map(([name, image], i) => {
      const destination = root.dataset.redesign === '1' && i === 1;
      const tag = destination ? 'a' : 'button';
      const attributes = destination ? `href="/redesign/${location.pathname.match(/^\/redesign\/([12])/)?.[1] || root.dataset.redesign}/project/arrietty" data-project-entry="arrietty"` : 'type="button"';
      return `<${tag} ${attributes} class="r1-project-card"><span class="r1-project-cover ${i === 0 ? 'r1-project-new' : ''}">${image ? `<img src="/assets/agent/${image}.webp" alt="" width="176" height="176">` : i === 0 ? icons.plus : emptyCover}</span><span class="r1-project-name">${name}</span>${i ? '<span class="r1-project-date">更新于 2026年10月16日</span>' : ''}</${tag}>`;
    }).join('');
    const expansion = document.createElement('div');
    expansion.className = 'r1-agent-expansion';
    expansion.setAttribute('aria-hidden','true');
    expansion.inert = true;
    expansion.innerHTML = `<div class="r1-agent-modules"><section class="r1-featured" aria-labelledby="r1-skills-heading"><h2 id="r1-skills-heading">精选 skills</h2><div class="r1-skills-grid">${features}</div><button type="button" class="r1-skills-more">更多 ${icon('<path d="m9 6 6 6-6 6"/>')}</button></section><section class="r1-recent" aria-labelledby="r1-recent-heading"><div class="r1-section-head"><h2 id="r1-recent-heading">最近项目</h2><a class="r1-section-more" href="/redesign/${root.dataset.redesign}/projects" data-nav-link="projects" aria-label="全部项目">全部 ${icon('<path d="m9 6 6 6-6 6"/>')}</a></div><div class="r1-projects-grid">${projects}</div></section></div>`;
    hero.append(expansion);
    // A featured skill joins the composer as a reference with its prompt template.
    expansion.querySelector('.r1-skills-grid')?.addEventListener('click', event => {
      const card = event.target.closest('.r1-skill-card');
      if (!card) return;
      addAssetRef({name: card.querySelector('span').textContent, src: card.querySelector('img').getAttribute('src'), kind: 'skill'});
      draft.value = '这里是skills的提示词模板';
      syncSend();
      draft.focus({preventScroll: true});
    });
    // 全部 opens the all-projects page; like the asset library, remember the mode
    // so 返回 (or the browser's back) lands on Agent again.
    expansion.querySelector('.r1-section-more')?.addEventListener('click', () => {
      try { sessionStorage.setItem('meshy-redesign1-return-mode', root.dataset.redesignMode || 'quick'); } catch {}
    });
    const modules = expansion.firstElementChild;
    const variant = window.MeshyRedesignVariant?.mount({ rail, hero, modules, expansion, icons, emptyCover });
    let current = 'quick';
    const indicator = tablist.querySelector('.r1-tab-indicator');

    function measure() {
      // The quick form supplies the stable footprint in both modes and at every
      // breakpoint. The expanded height comes from the real, wrapping content.
      const agentHeight = agent.getBoundingClientRect().height;
      const stageHeight = Math.max(quick.getBoundingClientRect().height, agentHeight);
      stage.style.height = `${stageHeight}px`;
      // Reclaim the quick form's unused parameter space below the Agent input,
      // keeping the title, tabs and composer anchored during mode changes.
      hero.style.setProperty('--r1-composer-clearance', `${stageHeight - agentHeight}px`);
      expansion.style.height = variant ? `${variant.measureHeight(current)}px` : current === 'agent' ? `${modules.getBoundingClientRect().height}px` : '0px';
      const selected = buttons[current === 'quick' ? 0 : 1];
      indicator.style.width = `${selected.offsetWidth}px`;
      indicator.style.transform = `translateX(${selected.offsetLeft - 2}px)`;
    }

    function selectMode(mode, focus = false) {
      if (mode === current) { if (focus) buttons[mode === 'quick' ? 0 : 1].focus({preventScroll:true}); return; }
      current = mode;
      root.dataset.redesignMode = mode;
      buttons.forEach(button => {
        const selected = button.dataset.mode === mode;
        button.setAttribute('aria-selected',String(selected));
        button.tabIndex = selected ? 0 : -1;
        if (focus && selected) button.focus({preventScroll:true});
      });
      for (const [panel, visible] of [[quick,mode === 'quick'],[agent,mode === 'agent'],[expansion,mode === 'agent']]) {
        panel.inert = !visible;
        panel.setAttribute('aria-hidden',String(!visible));
      }
      variant?.selectMode(mode);
      // CSS transitions retarget from the rendered height/opacity on interruption;
      // there are no timers or completion callbacks that can finish an old mode.
      measure();
    }
    tablist.addEventListener('click', event => {
      const button = event.target.closest('[role="tab"]');
      if (button) selectMode(button.dataset.mode);
    });
    tablist.addEventListener('keydown', event => {
      if (!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
      event.preventDefault();
      selectMode(event.key === 'Home' ? 'quick' : event.key === 'End' ? 'agent' : current === 'quick' ? 'agent' : 'quick', true);
    });
    const observer = new ResizeObserver(measure);
    for (const element of [quick, agent, modules, tablist, ...(variant?.observedElements || [])]) observer.observe(element);
    document.fonts.ready.then(measure);
    // A return from the asset library can request Agent explicitly, or restore
    // the mode that was active when the library was opened.
    const requestedMode = new URLSearchParams(location.search).get('mode');
    let returnMode = requestedMode === 'agent' || requestedMode === 'quick' ? requestedMode : null;
    if (root.dataset.redesign === '1') {
      try {
        const stored = sessionStorage.getItem('meshy-redesign1-return-mode');
        if (!returnMode && (stored === 'agent' || stored === 'quick')) returnMode = stored;
        sessionStorage.removeItem('meshy-redesign1-return-mode');
      } catch {}
    }
    if (requestedMode) {
      const url = new URL(location.href);
      url.searchParams.delete('mode');
      history.replaceState(null, '', url);
    }
    if (returnMode) selectMode(returnMode);
    measure();
    root.dataset.redesignReady = 'true';
  }

  function updateSticky(scroller) {
    const toolbar = document.querySelector('[data-replica-toolbar]');
    if (!toolbar) return;
    const top = innerWidth < 768 ? 106 : 56;
    toolbar.style.top = `${top}px`;
    toolbar.classList.toggle('r1-toolbar-stuck', scroller.scrollTop > 200 && toolbar.getBoundingClientRect().top <= top + 1);
    document.querySelector('.r1-utilities')?.classList.toggle('r1-utilities-scrolled', scroller.scrollTop > 24);
  }
  window.MeshyRedesign1 = { mount, updateSticky, sidebarWidth: window.MeshyRedesignVariant?.sidebarWidth };
})();

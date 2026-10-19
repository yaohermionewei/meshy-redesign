/* Scheme two extends the shared page and mode controller from scheme one. */
(() => {
  if (document.documentElement.dataset.redesign !== '2') return;
  const svg = paths => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
  const chat = svg('<path d="M5 4h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9l-5 3v-3a2 2 0 0 1-2-2V7a3 3 0 0 1 3-3Z"/><path d="M7 9h10M7 13h6"/>');
  const arrow = svg('<path d="M6 18 18 6M6 6h12v12"/>');
  const panel = svg('<rect x="3" y="4" width="18" height="16" rx="2.5"/><path d="M9.5 4v16"/>');

  // Sidebar: draggable width on tablet/desktop, collapsible to a 64px icon rail.
  const root = document.documentElement;
  const RAIL = 64;
  const store = {
    get(key) { try { return localStorage.getItem(key); } catch { return null; } },
    set(key, value) { try { localStorage.setItem(key, value); } catch {} }
  };
  // The cap keeps the credits card and account row compact at the widest setting.
  const limits = () => innerWidth < 1100 ? {min: 180, max: 248, base: 192} : {min: 200, max: 280, base: 224};
  let customWidth = Number(store.get('r2-sidebar-width')) || null;
  let collapsed = store.get('r2-sidebar-collapsed') === '1';
  const expandedWidth = () => {
    const {min, max, base} = limits();
    return Math.round(Math.min(max, Math.max(min, customWidth || base)));
  };
  const sidebarWidth = () => innerWidth < 768 ? 0 : collapsed ? RAIL : expandedWidth();
  root.dataset.r2Sidebar = collapsed ? 'collapsed' : 'expanded';

  function applySidebarWidth() {
    const width = `${sidebarWidth()}px`;
    root.style.setProperty('--r2-sidebar', width);
    document.querySelector('[data-slot="scroll-area"]')?.style.setProperty('--sidebar-w', width);
  }

  function setupSidebar(rail) {
    const mac = /Mac|iPhone|iPad/.test(navigator.platform);
    const shortcut = mac ? '⌘B' : 'Ctrl+B';
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'r2-sidebar-toggle';
    toggle.innerHTML = panel;
    rail.querySelector('.replica-rail-logo').append(toggle);
    const handle = document.createElement('div');
    handle.className = 'r2-resize-handle';
    handle.tabIndex = 0;
    handle.setAttribute('role','separator');
    handle.setAttribute('aria-orientation','vertical');
    handle.setAttribute('aria-label','调整侧边栏宽度');
    rail.append(handle);

    // One tooltip element, positioned beside whatever is hovered or focused.
    const tooltip = document.createElement('div');
    tooltip.className = 'r2-tooltip';
    tooltip.setAttribute('role','tooltip');
    document.body.append(tooltip);
    const tipTargets = '.r2-sidebar-toggle, [data-r2-tip]';
    const tipFor = el => el.classList.contains('r2-sidebar-toggle') ? [toggle.getAttribute('aria-label'), shortcut] : [el.dataset.r2Tip];
    const showTip = el => {
      // Icon-only controls always explain themselves; labelled ones only when folded.
      if (!el.matches('.r2-sidebar-toggle, .r2-head-action') && !collapsed) return;
      const [label, keys] = tipFor(el);
      tooltip.innerHTML = `<span>${label}</span>${keys ? `<kbd>${keys}</kbd>` : ''}`;
      const box = el.getBoundingClientRect();
      const below = el.classList.contains('r2-sidebar-toggle') && !collapsed;
      tooltip.style.left = `${below ? box.left : box.right + 10}px`;
      tooltip.style.top = `${below ? box.bottom + 8 : box.top + box.height / 2}px`;
      tooltip.dataset.side = below ? 'bottom' : 'right';
      tooltip.classList.add('r2-tooltip-visible');
    };
    const hideTip = () => tooltip.classList.remove('r2-tooltip-visible');
    rail.addEventListener('pointerover', event => { const el = event.target.closest(tipTargets); if (el && rail.contains(el)) showTip(el); });
    rail.addEventListener('pointerout', event => { const el = event.target.closest(tipTargets); if (el && !el.contains(event.relatedTarget)) hideTip(); });
    rail.addEventListener('focusin', event => { const el = event.target.closest(tipTargets); if (el && el.matches(':focus-visible')) showTip(el); });
    rail.addEventListener('focusout', hideTip);
    rail.addEventListener('pointerdown', hideTip);
    for (const el of rail.querySelectorAll('.replica-rail-entry, .r2-head-action, .r2-project-list .r2-project-entry, .replica-rail-action, .replica-avatar')) {
      el.dataset.r2Tip = el.getAttribute('aria-label') || el.textContent.trim();
    }

    function sync() {
      root.dataset.r2Sidebar = collapsed ? 'collapsed' : 'expanded';
      toggle.setAttribute('aria-label', collapsed ? '显示侧边栏' : '隐藏侧边栏');
      toggle.setAttribute('aria-expanded', String(!collapsed));
      handle.setAttribute('aria-valuemin', String(RAIL));
      handle.setAttribute('aria-valuemax', String(limits().max));
      handle.setAttribute('aria-valuenow', String(sidebarWidth()));
      applySidebarWidth();
    }
    function setCollapsed(next) {
      collapsed = next;
      store.set('r2-sidebar-collapsed', next ? '1' : '0');
      hideTip();
      sync();
    }
    function setWidth(width) {
      const {min, max} = limits();
      customWidth = Math.round(Math.min(max, Math.max(min, width)));
      store.set('r2-sidebar-width', String(customWidth));
      if (collapsed) setCollapsed(false); else sync();
    }
    toggle.addEventListener('click', () => setCollapsed(!collapsed));
    document.addEventListener('keydown', event => {
      if (event.key.toLowerCase() !== 'b' || !(mac ? event.metaKey : event.ctrlKey) || event.altKey || event.shiftKey || innerWidth < 768) return;
      event.preventDefault();
      setCollapsed(!collapsed);
    });

    // Dragging past the collapse threshold folds the rail; dragging out of a
    // folded rail reopens it. Transitions are paused while the pointer moves.
    const COLLAPSE_AT = 140;
    handle.addEventListener('pointerdown', event => {
      if (event.button !== 0) return;
      event.preventDefault();
      handle.setPointerCapture(event.pointerId);
      root.classList.add('r2-sidebar-resizing');
      const move = moveEvent => {
        const x = moveEvent.clientX;
        if (x < COLLAPSE_AT) { if (!collapsed) setCollapsed(true); return; }
        const {min} = limits();
        if (collapsed && x < min) return;
        setWidth(x);
      };
      const end = () => {
        root.classList.remove('r2-sidebar-resizing');
        handle.removeEventListener('pointermove', move);
        handle.removeEventListener('pointerup', end);
        handle.removeEventListener('pointercancel', end);
      };
      handle.addEventListener('pointermove', move);
      handle.addEventListener('pointerup', end);
      handle.addEventListener('pointercancel', end);
    });
    handle.addEventListener('dblclick', () => { customWidth = null; store.set('r2-sidebar-width', ''); if (collapsed) setCollapsed(false); else sync(); });
    handle.addEventListener('keydown', event => {
      const step = event.shiftKey ? 48 : 16;
      if (event.key === 'ArrowLeft') { event.preventDefault(); collapsed ? null : expandedWidth() - step < limits().min ? setCollapsed(true) : setWidth(expandedWidth() - step); }
      else if (event.key === 'ArrowRight') { event.preventDefault(); collapsed ? setCollapsed(false) : setWidth(expandedWidth() + step); }
      else if (event.key === 'Enter') { event.preventDefault(); setCollapsed(!collapsed); }
    });
    addEventListener('resize', sync, {passive: true});
    sync();
    requestAnimationFrame(() => requestAnimationFrame(() => root.classList.add('r2-sidebar-animate')));
  }

  // The wide sidebar is shared by the home page and the asset library.
  function mountSidebar({rail, icons, emptyCover}) {
      rail.setAttribute('aria-label','主导航与项目');
      rail.querySelector('.replica-rail-logo').insertAdjacentHTML('beforeend','<span class="r2-wordmark">Meshy</span>');
      rail.querySelector('.replica-rail-scroll > .replica-rail-group:last-child').remove();
      const projectSection = document.createElement('section');
      projectSection.className = 'r2-sidebar-projects';
      projectSection.id = 'r2-sidebar-projects';
      projectSection.setAttribute('aria-labelledby','r2-project-heading');
      const allProjects = '/redesign/2/projects';
      // The first project shows its chats as a second level, like folders and threads.
      const chats = ['道具生成','角色和动画','场景测试'];
      const onProject = Boolean(root.dataset.projectWorkspace);
      const chatsOpen = store.get('r2-project-chats') !== 'closed';
      const chevron = svg('<path d="m9 6 6 6-6 6"/>');
      const chatList = `<div class="r2-chat-wrap"><div class="r2-chat-list" id="r2-chat-list" role="group" aria-label="点我！借东西小人游戏 的对话">${chats.map((name,i)=>i===0?`<a class="r2-chat-entry" href="/redesign/2/project/arrietty" data-project-entry="arrietty" title="${name}"${onProject?' aria-current="page"':''}><span>${name}</span></a>`:`<button type="button" class="r2-chat-entry" title="${name}"><span>${name}</span></button>`).join('')}</div></div>`;
      projectSection.innerHTML = `<div class="r2-projects-head"><h2 id="r2-project-heading">项目</h2><div class="r2-projects-actions"><button type="button" class="r2-head-action r2-new-project" aria-label="新建项目">${icons.plus}</button><a class="r2-head-action r2-all-projects" href="${allProjects}" data-nav-link="projects" aria-label="全部项目">${svg('<path d="M5 12h14M13 6l6 6-6 6"/>')}</a></div></div><div class="r2-project-list">${window.MeshyProjectList.map(([name,cover,,cut],i)=>{const tag=i===0?'a':'button';const attributes=i===0?'href="/redesign/2/project/arrietty" data-project-entry="arrietty"':'type="button"';const entry = `<${tag} ${attributes} class="r2-project-entry${i===0&&onProject?' is-open':''}" title="${name}"><span class="r2-project-cover">${cover?`<img src="${cover}" alt="" width="24" height="24"${cut?' class="r2-cover-cut"':''}>`:emptyCover}</span><span>${name}</span></${tag}>`;return i===0?`<div class="r2-project-group${chatsOpen?' is-expanded':''}"><div class="r2-project-row">${entry}<button type="button" class="r2-chats-toggle" aria-controls="r2-chat-list" aria-expanded="${chatsOpen}" aria-label="${chatsOpen?'收起对话':'展开对话'}" title="${chatsOpen?'收起对话':'展开对话'}">${chevron}</button></div>${chatList}</div>`:entry;}).join('')}</div>`;
      rail.querySelector('.replica-rail-scroll').append(projectSection);
      // Hovering the project swaps its cover for a chevron that folds its chats.
      const group = projectSection.querySelector('.r2-project-group');
      const chatsToggle = group.querySelector('.r2-chats-toggle');
      const chatPanel = group.querySelector('.r2-chat-list');
      const syncChats = open => {
        group.classList.toggle('is-expanded', open);
        chatsToggle.setAttribute('aria-expanded', String(open));
        chatsToggle.setAttribute('aria-label', open ? '收起对话' : '展开对话');
        chatsToggle.title = open ? '收起对话' : '展开对话';
        chatPanel.inert = !open;
      };
      syncChats(chatsOpen);
      chatsToggle.addEventListener('click', event => {
        event.preventDefault();
        const open = !group.classList.contains('is-expanded');
        store.set('r2-project-chats', open ? 'open' : 'closed');
        syncChats(open);
      });
      // Footer: a credits card above one account row (avatar, name, reward and notification icons).
      const bottom = rail.querySelector('.replica-rail-bottom');
      const avatar = bottom.querySelector('.replica-avatar');
      avatar.insertAdjacentHTML('beforeend','<span class="r2-account-name">yaohermione</span>');
      avatar.title = 'yaohermione';
      const actions = bottom.querySelector('.replica-rail-actions');
      actions.querySelectorAll('.replica-rail-action').forEach(button => button.title = button.getAttribute('aria-label'));
      const account = document.createElement('div');
      account.className = 'r2-account';
      account.append(avatar, actions);
      const credit = bottom.querySelector('.replica-credit');
      credit.querySelector('.replica-credit-line span').insertAdjacentHTML('afterend','<span class="r2-credit-unit">积分</span>');
      bottom.querySelector('.replica-rail-separator')?.remove();
      bottom.append(account);
      const mobileToggle = document.createElement('button');
      mobileToggle.type = 'button';
      mobileToggle.className = 'r2-mobile-project-toggle';
      mobileToggle.setAttribute('aria-expanded','false');
      mobileToggle.setAttribute('aria-controls',projectSection.id);
      mobileToggle.innerHTML = `${chat}<span>项目</span>${icons.down}`;
      rail.querySelector('.replica-rail-scroll').append(mobileToggle);
      const closeProjects = () => { rail.classList.remove('r2-projects-open'); mobileToggle.setAttribute('aria-expanded','false'); };
      mobileToggle.addEventListener('click',() => {
        const open = !rail.classList.contains('r2-projects-open');
        rail.classList.toggle('r2-projects-open',open);
        mobileToggle.setAttribute('aria-expanded',String(open));
      });
      document.addEventListener('keydown',event => { if(event.key==='Escape'&&rail.classList.contains('r2-projects-open')) { closeProjects(); mobileToggle.focus({preventScroll:true}); } });
      document.addEventListener('click',event => { if(!rail.contains(event.target)) closeProjects(); });
      matchMedia('(min-width: 768px)').addEventListener('change',closeProjects);
      setupSidebar(rail);
  }

  window.MeshyRedesignVariant = {
    sidebarWidth: () => `${sidebarWidth()}px`,
    mountSidebar,
    mount({rail, modules, expansion, icons, emptyCover}) {
      mountSidebar({rail, icons, emptyCover});
      modules.querySelector('.r1-recent').remove();
      const quickContent = document.createElement('section');
      quickContent.className = 'r2-quick-content';
      quickContent.setAttribute('aria-label','常用工具');
      const tools = [
        ['image','图像生成','文字或参考图生成图像',['文生图','图生图'],'/assets/9bdbf1eddd04-019dd398-dff1-7de1-bcb4-15044a220a6a.webp'],
        ['model','3D 模型','图片或文字生成 3D 模型',['3D 生成','贴图','纹理编辑'],'/assets/37cc1ecf08a6-019e0138-c932-7029-a071-9e56f2bfaad7.webp'],
        ['print','3D 打印','检查模型，导出打印文件',['多色打印','STL / 3MF'],'/assets/redesign2/print-skeleton-wolf.webp'],
        ['animate','动画','绑定骨骼，添加动作',['自动绑骨','动作库'],'/assets/71075dda0fc4-01978af4-3ca3-7640-9ea5-448d57ba9753.webp']
      ];
      quickContent.innerHTML = `<div class="r2-banners">${tools.map(([key,name,desc,modes,image])=>`<button type="button" class="r2-banner r2-banner-${key}" aria-label="打开${name}：${desc}"><span class="r2-banner-thumb"><img src="${image}" alt="" width="180" height="180" class="r2-banner-art"></span><span class="r2-banner-body"><span class="r2-banner-name">${icons[key]}<span>${name}</span></span><span class="r2-banner-desc">${desc}</span><span class="r2-banner-modes">${modes.map(mode=>`<span>${mode}</span>`).join('')}</span></span><span class="r2-banner-arrow">${arrow}</span></button>`).join('')}</div>`;
      // Both states stay mounted in one measured container. Retargeting its real
      // height lets the community follow naturally even after rapid reversals.
      expansion.classList.add('r2-mode-content');
      expansion.prepend(quickContent);
      const selectMode = mode => {
        expansion.inert = false;
        expansion.setAttribute('aria-hidden','false');
        for (const [panel,visible] of [[quickContent,mode==='quick'],[modules,mode==='agent']]) {
          panel.inert = !visible;
          panel.setAttribute('aria-hidden',String(!visible));
        }
      };
      selectMode('quick');
      return {
        selectMode,
        observedElements: [quickContent],
        measureHeight: mode => (mode==='quick'?quickContent:modules).getBoundingClientRect().height
      };
    }
  };
})();

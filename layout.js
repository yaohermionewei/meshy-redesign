/* Presentation only. Original responsive markup and local assets are retained;
   this code handles column geometry and the appearance of the sticky header. */
(() => {
  const redesign = window.MeshyRedesign1;
  const desktop = document.createElement('template');
  desktop.innerHTML = document.querySelector('main').outerHTML;
  const templates = {
    desktop,
    tablet: document.querySelector('#layout-tablet'),
    mobile: document.querySelector('#layout-mobile'),
  };
  let mode, grid, scroller, headerState, toolbarState, observer;

  const svg = {
    plus: '<span class="replica-create-mark" aria-hidden="true"></span>',
    board: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M4 9h8M12 15h8M12 4v16"/></svg>',
    grid: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/></svg>',
    community: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M7 9.5h.01M12 9.5h.01M17 9.5h.01"/><path d="M4.2 16.4c-1.2-1.5-1.8-3.1-1.8-4.9C2.4 7 6.7 3.5 12 3.5S21.6 7 21.6 11.5 17.3 19.5 12 19.5c-1.1 0-2.2-.2-3.2-.5L4 21l1.1-4.6-.9 0Z"/></svg>',
    bag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6.3 8h11.4a2 2 0 0 1 2 2.3l-1.3 8.1a3 3 0 0 1-3 2.5H8.6a3 3 0 0 1-3-2.5l-1.2-8.1A2 2 0 0 1 6.3 8Z"/><path d="M9 11V6a3 3 0 0 1 6 0v5"/></svg>',
    terminal: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"><rect x="2.5" y="3.3" width="15" height="13.4" rx="1.7"/><path d="m6.7 7.5 2.5 2.5-2.5 2.5M10.8 12.5h2.5"/></svg>',
    book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 4H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12V4Z"/><path d="M19 16H7a2 2 0 0 0-2 2M9 8h6"/></svg>',
    gift: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8h18v4H3zM12 8v13M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"/></svg>',
    bell: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 5a2 2 0 1 1 4 0 7 7 0 0 1 4 6v3a4 4 0 0 0 2 3H4a4 4 0 0 0 2-3v-3a7 7 0 0 1 4-6ZM9 17v1a3 3 0 0 0 6 0v-1"/></svg>',
    coin: '<svg viewBox="0 0 24 24" fill="none" stroke="#F9E855" stroke-width="1.4"><circle cx="12" cy="12" r="8.5"/><path d="m12 7 1.5 3 3.3.5-2.4 2.3.6 3.2-3-1.5-3 1.5.6-3.2-2.4-2.3 3.3-.5L12 7Z"/></svg>'
  };

  function renderAgentWorkspace() {
    const logoSource = document.querySelector('header a[aria-label="Meshy"] svg');
    const logo = logoSource ? logoSource.cloneNode(true) : null;
    if (logo) {
      logo.setAttribute('viewBox', '0 0 64 64');
      logo.removeAttribute('width'); logo.removeAttribute('height');
      logo.setAttribute('class', 'agent-rail-logo-svg');
    }
    const railIcon = (kind) => {
      const paths = {
        back: '<path d="m14 5-7 7 7 7"/><path d="M7 12h13"/>',
        workspace: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v13a2.5 2.5 0 0 1-2.5 2h-11A2.5 2.5 0 0 1 4 18.5z"/><path d="M8 7h8M8 11h8M8 15h5"/>',
        agent: '<path d="M5 12c0-4 3.1-7 7-7s7 3 7 7-3.1 7-7 7c-1.5 0-2.9-.4-4-1.2L5 20l.9-3.6A6.8 6.8 0 0 1 5 12Z"/><path d="M9 12h.01M12 12h.01M15 12h.01"/>',
        image: '<rect x="4" y="4" width="16" height="16" rx="2"/><circle cx="9" cy="9" r="1.3"/><path d="m5 17 4-4 3 3 2-2 5 5"/>',
        model: '<path d="m12 3 8 4.5v9L12 21l-8-4.5v-9z"/><path d="m4 7.5 8 4.5 8-4.5M12 12v9"/>',
        print: '<path d="M7 8V4h10v4M6 17H4v-6a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v6h-2"/><path d="M7 14h10v7H7z"/>',
        animate: '<path d="m5 7 4 4-4 4M12 15h7"/><path d="M4 4h16v16H4z"/>',
        assets: '<rect x="4" y="4" width="7" height="7" rx="1"/><rect x="13" y="4" width="7" height="7" rx="1"/><rect x="4" y="13" width="7" height="7" rx="1"/><rect x="13" y="13" width="7" height="7" rx="1"/>',
        gift: '<path d="M4 9h16v4H4zM6 13v7h12v-7M12 9v11M7.5 9a2.5 2.5 0 1 1 0-5c2.5 0 4.5 5 4.5 5M16.5 9a2.5 2.5 0 1 0 0-5c-2.5 0-4.5 5-4.5 5"/>',
        bell: '<path d="M18 10a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 22h4"/>'
      };
      return `<svg viewBox="0 0 24 24" aria-hidden="true">${paths[kind] || paths.agent}</svg>`;
    };
    const assetImages = [
      '/assets/agent/home-image-to-3d.webp',
      '/assets/agent/home-gift-design.webp',
      '/assets/agent/home-batch-models.webp',
      '/assets/agent/home-sketch-to-figurine.webp',
      '/assets/agent/home-character-colorways.webp',
      '/assets/agent/home-learn-3d-printing.webp',
      '/assets/agent/skill-vinyl.webp',
      '/assets/agent/skill-chibi.webp',
      '/assets/agent/skill-lowpoly.webp',
      '/assets/agent/skill-marble.webp'
    ];
    const featureNames = ['图片转 3D','礼物设计','批量生成模型','草图转手办','人物配色实验','3D 打印学习'];
    const featureCards = featureNames.map((name, i) => `<button class="agent-feature-card"><img src="${assetImages[i]}" alt=""><span>${name}</span></button>`).join('');
    const popularNames = ['搪胶收藏人偶','Q版手办','低多边形卡通伙伴','我的大理石雕像'];
    const popularCards = popularNames.map((name, i) => `<button class="agent-popular-card"><img src="${assetImages[i + 6]}" alt=""><span>${name}</span></button>`).join('');
    const toolNames = ['Meshy 7.1','Meshy 7.1 Ultra','Meshy T2.5','Meshy 6','GPT-Image 2.5','Nano Banana Pro','多视图生成 3D','免费重试','绑骨','动画','重拓扑','2K 贴图','4K 贴图','8K 贴图','多视角贴图','多色打印','打印修复','导出切片','自动拆件','格式转换','搜索参考图','联网搜索','批量任务'];
    const toolCards = toolNames.map((name, i) => `<button class="agent-tool-chip"><span class="agent-tool-icon">${railIcon(['model','image','workspace','agent'][i % 4])}</span>${name}</button>`).join('');
    const recent = [
      ['新建项目',''],
      ['点我！借东西小人游戏','/assets/agent/recent-arrietty.webp'],
      ['Y2K','/assets/agent/recent-y2k.webp'],
      ['类双人成行游戏','/assets/agent/recent-friends.webp'],
      ['图片问题','/assets/agent/recent-face.webp']
    ];
    const recentCards = recent.map(([name, image]) => image ? `<article class="agent-recent-card"><div class="agent-recent-image"><img src="${image}" alt="${name}"></div><div class="agent-recent-name">${name}</div><div class="agent-recent-date">更新于 2026年10月16日</div></article>` : `<article class="agent-recent-card"><div class="agent-recent-image agent-new-project"><span>＋</span></div><div class="agent-recent-name">${name}</div></article>`).join('');
    const rail = `<aside class="agent-rail"><div class="agent-rail-bg"></div><div class="agent-rail-top"><button class="agent-rail-logo" aria-label="返回主页">${logo ? logo.outerHTML : ''}</button><button class="agent-rail-home" aria-label="我的工作区">${railIcon('workspace')}</button></div><div class="agent-rail-nav"><button class="agent-rail-entry is-active">${railIcon('agent')}<span>Agent</span></button><button class="agent-rail-entry">${railIcon('image')}<span>图像</span></button><button class="agent-rail-entry">${railIcon('model')}<span>模型</span></button><button class="agent-rail-entry">${railIcon('print')}<span>打印</span></button><button class="agent-rail-entry">${railIcon('animate')}<span>动画</span></button><span class="agent-rail-separator"></span><button class="agent-rail-entry">${railIcon('assets')}<span>资产</span></button></div><div class="agent-rail-bottom"><button>${railIcon('gift')}</button><button>${railIcon('bell')}<i></i></button><span class="agent-rail-separator"></span><div class="agent-agent-credit">◉ <span>692</span></div><button class="agent-recharge">充值</button><img class="agent-avatar" src="/assets/28d407c4736f-meshy.png" alt="yaohermione"></div></aside>`;
    const main = document.querySelector('main');
    main.className = 'agent-replica-root';
    main.innerHTML = `<div class="agent-replica-bg"></div><div class="agent-replica-shell">${rail}<section class="agent-replica-content"><div class="agent-replica-scroll"><div class="agent-home"><div class="agent-composer-area"><h1>Meshy 帮你创造 3D 世界</h1><div class="agent-composer"><div class="agent-composer-editable">上传一张图片——我会把它变成 3D 模型。或输入 / 查看技能。</div><div class="agent-composer-footer"><div class="agent-composer-left"><button class="agent-round">＋</button><button class="agent-skill-button">▤&nbsp; 技能</button></div><div class="agent-composer-right"><button>Meshy 7.1⌄</button><button class="agent-behavior">无需通知⌄</button><button class="agent-round">♩</button><button class="agent-send">↑</button></div></div></div></div><section class="agent-feature-section"><p class="agent-section-title">Meshy Agent 能做什么</p><div class="agent-feature-row">${featureCards}</div><div class="agent-tool-viewport"><div class="agent-tool-row">${toolCards}<button class="agent-tool-more">⌄</button></div></div></section><section class="agent-popular-section"><p class="agent-section-title">热门技能</p><div class="agent-popular-row">${popularCards}</div></section><section class="agent-recent-section"><div class="agent-recent-title">最近</div><div class="agent-recent-grid">${recentCards}</div></section></div></div></section></div>`;
    document.body.className = 'agent-home-body';
    document.title = 'meshy_redesign';
  }

  if (location.pathname === '/zh/workspace' && new URLSearchParams(location.search).get('sidebar') === 'agent') {
    renderAgentWorkspace();
    return;
  }

  if (window.MeshyProjectWorkspace || window.MeshyAssetsWorkspace || window.MeshyProjectsWorkspace) {
    applyLoggedPageState();
    redesign.mount();
    return;
  }

  function railEntry(label, key, href, extra='') {
    const tag = href ? 'a' : 'button';
    const target = href ? ` href="${href}"` : ' type="button"';
    return `<${tag}${target} class="replica-rail-entry ${extra}" aria-label="${label}"><span class="replica-rail-icon">${svg[key]}</span><span class="replica-rail-label">${label}</span></${tag}>`;
  }

  function ensureLoggedSidebar() {
    const main = document.querySelector('main');
    if (!main || (window.innerWidth < 768 && !redesign)) {
      document.querySelector('.logged-sidebar')?.remove();
      return;
    }
    if (main.querySelector('.logged-sidebar')) return;
    const logoSource = main.querySelector('header a[aria-label="Meshy"] svg');
    const nav = document.createElement('nav');
    nav.className = 'logged-sidebar';
    nav.setAttribute('data-testid', 'sidebar-nav');
    nav.innerHTML = `<div class="replica-rail-surface" aria-hidden="true"></div><div class="replica-rail-logo" aria-label="Meshy"></div>
      <div class="replica-rail-scroll"><div class="replica-rail-group">
        ${railEntry('创建','plus','','create')}${railEntry('模板','board','/zh/discover?tab=template#community-feed')}${railEntry('资产','grid','/zh/workspace?sidebar=assets')}
      </div><span class="replica-rail-separator"></span><div class="replica-rail-group">
        ${railEntry('社区','community','/zh/discover#community-feed','active')}${railEntry('商店','bag','https://www.pockella.com/?utm_source=meshy&utm_medium=sidebar_shop')}${railEntry('开发者','terminal','/zh/developers')}
      </div><span class="replica-rail-separator"></span><div class="replica-rail-group">${railEntry('资源','book','','resource')}</div></div>
      <div class="replica-rail-bottom"><div class="replica-rail-group replica-rail-actions"><button class="replica-rail-action" aria-label="领取奖励">${svg.gift}<i></i></button><button class="replica-rail-action" aria-label="通知">${svg.bell}</button></div><span class="replica-rail-separator"></span><div class="replica-credit"><div class="replica-credit-line">${svg.coin}<span>618</span></div><button>充值</button></div><button class="replica-avatar" aria-label="yaohermione"><img src="/assets/28d407c4736f-meshy.png" alt="yaohermione"></button></div>`;
    if (logoSource) {
      const logo = logoSource.cloneNode(true);
      logo.setAttribute('viewBox','0 0 64 64'); logo.removeAttribute('width'); logo.removeAttribute('height'); logo.className='replica-rail-logo-svg';
      nav.querySelector('.replica-rail-logo').appendChild(logo);
    }
    main.prepend(nav);
  }

  function applyLoggedPageState() {
    const main = document.querySelector('main');
    if (!main) return;
    document.body.classList.add('logged-in-replica');
    main.querySelectorAll(':scope > header').forEach(header => { header.setAttribute('aria-hidden','true'); header.style.display='none'; });
    const scrollArea = document.querySelector('[data-slot="scroll-area"]') || document.querySelector('[dir="ltr"][data-slot="scroll-area"]');
    scrollArea?.style.setProperty('--sidebar-w', redesign?.sidebarWidth?.() || (window.innerWidth >= 768 ? '64px' : '0px'));
    const title = main.querySelector('h1');
    const titleWrap = title?.parentElement;
    if (title && titleWrap && !titleWrap.querySelector('[data-logged-greeting]')) {
      titleWrap.classList.add('replica-logged-title-wrap');
      title.classList.remove('w-full','text-center'); title.classList.add('text-left');
      const greeting = document.createElement('span');
      greeting.setAttribute('data-logged-greeting','true');
      greeting.className='replica-greeting'; greeting.textContent='嗨，yaohermione！';
      titleWrap.insertBefore(greeting,title);
    }
    const generate = [...main.querySelectorAll('button')].find(button => button.textContent.trim()==='生成');
    if (generate) { generate.setAttribute('data-replica-generate','true'); generate.disabled=true; }
    ensureLoggedSidebar();
  }

  function layoutCards() {
    if (!grid) return;
    const viewport = window.innerWidth;
    const columns = viewport < 768 ? 2 : viewport < 1214 ? 3 :
      Math.min(8, 4 + Math.floor((viewport - 1214) / 290));
    const gap = viewport < 768 ? 5 : 10;
    const width = Number(((grid.clientWidth - gap * (columns - 1)) / columns).toFixed(2));
    const heights = Array(columns).fill(0);

    for (const cell of grid.children) {
      const column = heights.indexOf(Math.min(...heights));
      cell.style.width = `${width}px`;
      cell.style.transform = `translate3d(${Math.round(column * (width + gap))}px, ${Math.round(heights[column])}px, 0)`;
      heights[column] = Math.round(heights[column] + cell.getBoundingClientRect().height + gap);
    }
    grid.style.height = `${Math.ceil(Math.max(...heights) - gap)}px`;
    updateScrollbar();
  }

  function updateScrollbar() {
    const track = document.querySelector('[data-slot="scroll-area-scrollbar"]');
    const thumb = track?.querySelector('[data-slot="scroll-area-thumb"]');
    if (!thumb || !scroller) return;
    const available = track.clientHeight - 2;
    const thumbHeight = Math.max(18, available * scroller.clientHeight / scroller.scrollHeight);
    const position = scroller.scrollTop / Math.max(1, scroller.scrollHeight - scroller.clientHeight) * (available - thumbHeight);
    track.style.setProperty('--radix-scroll-area-thumb-height', `${thumbHeight}px`);
    thumb.style.transform = `translate3d(0px, ${position}px, 0px)`;
  }

  function replaceRegion(selector, html) {
    const region = document.querySelector(selector);
    if (region && html) region.outerHTML = html;
  }

  function updateStickyAppearance() {
    updateScrollbar();
    if (redesign) {
      redesign.updateSticky(scroller);
      return;
    }
    const states = window.REPLICA_STATES?.[mode];
    if (!states) return;
    const nextHeader = scroller.scrollTop > 24 ? 'scroll' : 'top';
    const toolbar = document.querySelector('[data-replica-toolbar]');
    toolbar.style.top = `${window.innerWidth < 640 ? 48 : 56}px`;
    const nextToolbar = toolbar.getBoundingClientRect().top <= (window.innerWidth < 640 ? 48 : 56) + 1 && scroller.scrollTop > 200 ? 'scroll' : 'top';
    if (nextHeader !== headerState) {
      replaceRegion('[data-replica-header]', states[nextHeader].header);
      headerState = nextHeader;
    }
    if (nextToolbar !== toolbarState) {
      replaceRegion('[data-replica-toolbar]', states[nextToolbar].toolbar);
      replaceRegion('#modal-root', states[nextToolbar].modal);
      toolbarState = nextToolbar;
    }
    document.querySelector('[data-replica-toolbar]').style.top = `${window.innerWidth < 640 ? 48 : 56}px`;
    let glass = document.querySelector('[data-replica-glass]');
    if (nextToolbar === 'scroll') {
      if (!glass) {
        glass = document.createElement('div');
        glass.setAttribute('aria-hidden', 'true');
        glass.setAttribute('data-replica-glass', '');
        glass.className = 'pointer-events-none fixed inset-x-0 top-0 z-[45] bg-bg-strong/72 backdrop-blur-2xl backdrop-saturate-125';
        document.querySelector('[data-replica-toolbar]').before(glass);
      }
      glass.style.height = `${document.querySelector('[data-replica-toolbar]').getBoundingClientRect().bottom}px`;
    } else {
      glass?.remove();
    }
  }

  function resize() {
    // The redesign keeps one responsive tree so drafts, cards and images survive
    // breakpoint changes as well as mode changes.
    const nextMode = redesign ? 'desktop' : window.innerWidth < 768 ? 'mobile' : window.innerWidth < 1040 ? 'tablet' : 'desktop';
    if (mode !== nextMode) {
      observer?.disconnect();
      if (mode || nextMode !== 'desktop') {
        document.querySelector('main').replaceWith(templates[nextMode].content.firstElementChild.cloneNode(true));
      }
      mode = nextMode;
      grid = document.querySelector('[data-testid="community-showcases-grid"]');
      scroller = document.querySelector('[data-radix-scroll-area-viewport]');
      headerState = toolbarState = 'top';
      scroller.addEventListener('scroll', updateStickyAppearance, { passive: true });
      observer = new ResizeObserver(layoutCards);
      observer.observe(grid);
    }
    applyLoggedPageState();
    redesign?.mount();
    layoutCards();
    updateStickyAppearance();
  }

  window.addEventListener('resize', resize, { passive: true });
  document.fonts.ready.then(layoutCards);
  resize();

  // This phase presents the requested styles without business logic.
  document.addEventListener('click', event => {
    // Project cards and the 资产 entry use native link navigation.
    if (redesign && event.target.closest('a[data-project-entry][href], a[data-nav-link][href]')) return;
    const agentMode = event.target.closest('[data-testid="community-agent-mode-tab"]') ||
      [...document.querySelectorAll('button,[role="checkbox"]')].find(node => (node.textContent || '').trim() === 'Agent 模式' && node.contains(event.target));
    if (agentMode && !redesign) {
      event.preventDefault();
      window.location.href = '/zh/workspace?sidebar=agent';
      return;
    }
    if (event.target.closest('a, button')) event.preventDefault();
  });
  document.addEventListener('submit', event => event.preventDefault());
})();

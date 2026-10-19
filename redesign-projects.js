/* All-projects page. Shared by both schemes; each keeps its own navigation. */
(() => {
  if (!document.documentElement.dataset.projectsWorkspace) return;
  const root = document.documentElement;
  const search = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>';
  const projects = window.MeshyProjectList;

  function mount({rail, utilities, emptyCover, scheme}) {
    const main = document.querySelector('main');
    main.className = 'rp-workspace';
    main.replaceChildren(rail);
    utilities.remove();
    document.body.classList.add('rp-body');
    document.title = `meshy_redesign${scheme}`;
    const create = rail.querySelector('[aria-label="创作"]');
    // On scheme 1 this page is opened from Agent's 最近项目, so it is a secondary
    // page of 创作: keep 创作 highlighted and return to Agent from it.
    if (scheme === '1') create.setAttribute('aria-current', 'page');
    else create.removeAttribute('aria-current');
    create.addEventListener('click', () => { location.href = `/redesign/${scheme}${scheme === '1' ? '?mode=agent' : ''}`; });
    const logo = rail.querySelector('.replica-rail-logo');
    if (scheme === '1') {
      logo.setAttribute('role', 'link'); logo.tabIndex = 0;
      logo.addEventListener('click', () => { location.href = '/redesign/1?mode=agent'; });
      logo.addEventListener('keydown', event => { if (event.key === 'Enter') location.href = '/redesign/1?mode=agent'; });
    }

    const card = ([name, cover, updated, cut], index) => {
      const href = index === 0 ? `/redesign/${scheme}/project/arrietty` : null;
      const tag = href ? 'a' : 'button';
      const attrs = href ? `href="${href}" data-project-entry="arrietty"` : 'type="button"';
      const media = cover ? `<img src="${cover}" alt="" loading="lazy" draggable="false"${cut ? ' class="rp-cut"' : ''}>` : emptyCover;
      return `<${tag} ${attrs} class="rp-card" title="${name}"><span class="rp-cover">${media}</span><span class="rp-name">${name}</span><span class="rp-date">更新于 ${updated}</span></${tag}>`;
    };
    main.insertAdjacentHTML('beforeend', `<div class="rp-shell"><section class="rp-content" aria-labelledby="rp-heading">
      ${scheme === '1' ? `<div class="rp-header"><button type="button" class="rp-back" aria-label="返回上一页" title="返回上一页"><svg viewBox="0 0 24 24" aria-hidden="true"><use href="/assets/redesign1/project/icons.svg#chevron-left"></use></svg><span>返回</span></button><h1 id="rp-heading" class="rp-title">全部项目</h1></div>` : '<h1 id="rp-heading" class="rp-sr">全部项目</h1>'}
      <div class="rp-toolbar"><label class="rp-search">${search}<input type="search" placeholder="搜索项目" aria-label="搜索项目" spellcheck="false"></label><span class="rp-count" aria-live="polite"></span></div>
      <div class="rp-scroll"><div class="rp-grid" data-list></div><p class="rp-empty" hidden>没有找到匹配的项目。</p></div>
    </section></div>`);

    // Scheme 1 reaches this page from Agent, so 返回 goes back there (same as the asset library).
    main.querySelector('.rp-back')?.addEventListener('click', () => {
      if (history.length > 1) history.back();
      else location.href = '/redesign/1?mode=agent';
    });
    const list = main.querySelector('[data-list]');
    const empty = main.querySelector('.rp-empty');
    const count = main.querySelector('.rp-count');
    const input = main.querySelector('.rp-search input');
    function render() {
      const q = input.value.trim().toLowerCase();
      const shown = projects.map((project, index) => [project, index]).filter(([[name]]) => !q || name.toLowerCase().includes(q));
      list.innerHTML = shown.map(([project, index]) => card(project, index)).join('');
      empty.hidden = shown.length > 0;
      count.textContent = q ? `${shown.length} 个结果` : `${projects.length} 个项目`;
    }
    input.addEventListener('input', render);
    input.addEventListener('keydown', event => { if (event.key === 'Escape' && input.value) { input.value = ''; render(); } });
    render();
    root.dataset.projectsReady = 'true';
  }
  window.MeshyProjectsWorkspace = {mount};
})();

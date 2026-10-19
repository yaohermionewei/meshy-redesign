/* Asset library replica (原站「资产」). Shared by both schemes; each keeps its own navigation. */
(() => {
  if (!document.documentElement.dataset.assetsWorkspace) return;
  const root = document.documentElement;
  const data = window.MeshyAssetLibrary;
  const sprite = '/assets/redesign1/project/icons.svg#';
  const use = name => `<svg viewBox="0 0 24 24" aria-hidden="true"><use href="${sprite}${name}"></use></svg>`;
  const tabler = paths => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
  // Icon artwork copied from the signed-in original page.
  const icons = {
    lab: tabler('<path d="M3.5 17.5c5.667 4.667 11.333 4.667 17 0"/><path d="m19 18.5-2-8.5 1-2 2 1 1.5-1.5L19 3c-5.052.218-5.99 3.133-7 6H6a3 3 0 0 0-3 3"/><path d="m5 18.5 2-9.5M8 20l2-5h4l2 5"/>'),
    check: tabler('<rect x="3" y="3" width="18" height="18" rx="2"/><path d="m9 12 2 2 4-4"/>'),
    grid: tabler('<rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/>'),
    list: tabler('<path d="M4 6h16M4 12h16M4 18h16"/>'),
    selector: tabler('<path d="m8 9 4-4 4 4M16 15l-4 4-4-4"/>'),
    refresh: tabler('<path d="M20 11a8.1 8.1 0 0 0-15.5-2m-.5-4v4h4M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4"/>'),
    download: tabler('<path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2M7 11l5 5 5-5M12 4v12"/>'),
    bookmark: tabler('<path d="m12 17-6 4V7a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v5M16 19h6M19 16v6"/>'),
    trash: tabler('<path d="M4 7h16M10 11v6M14 11v6M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-12M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3"/>'),
    copy: tabler('<rect x="7" y="7" width="14" height="14" rx="2"/><path d="M4 16c-.6 0-1-.4-1-1V5a2 2 0 0 1 2-2h10c.6 0 1 .4 1 1"/>'),
    settings: use('settings'),
    sad: tabler('<circle cx="12" cy="12" r="9"/><path d="M9 10h.01M15 10h.01M9.5 15.25a3.5 3.5 0 0 1 5 0"/>'),
    chevron: use('chevron-right'),
    textured: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M19.51 3.08 3.08 19.51c.09.34.27.65.51.9.25.24.56.42.9.51L20.93 4.49c-.19-.69-.73-1.23-1.42-1.41ZM11.88 3 3 11.88v2.83L14.71 3h-2.83ZM5 3c-1.1 0-2 .9-2 2v2l4-4H5Zm14 18c.55 0 1.05-.22 1.41-.59.37-.36.59-.86.59-1.41v-2l-4 4h2Zm-9.71 0h2.83L21 12.12V9.29L9.29 21Z"/></svg>',
    animated: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" fill-rule="evenodd" d="m9.062 18.163 2.439-2.527 3.484 1.373c.7.275 1.282.78 1.649 1.43l1.974 3.507a1.1 1.1 0 0 0 1.485.418 1.07 1.07 0 0 0 .425-1.464l-1.976-3.506a5.436 5.436 0 0 0-2.747-2.386l-3.463-1.364a6.998 6.998 0 0 1-.038-.343c-.047-.546-.041-1.216.126-1.83.147-.544.564-1.16 1.027-1.696a9.363 9.363 0 0 1 .66-.686c.485.359.96.751 1.38 1.118a28.2 28.2 0 0 1 1.272 1.186l.017.016.004.004c.348.355.897.431 1.33.184l3.344-1.904c.522-.297.701-.956.4-1.47a1.1 1.1 0 0 0-1.492-.395l-2.624 1.494a30.345 30.345 0 0 0-.802-.726c-.816-.714-1.932-1.61-3.022-2.207-1.125-.617-2.307-.924-3.184-1.08a12.016 12.016 0 0 0-1.412-.166 5.786 5.786 0 0 0-.093-.004h-.042a1.101 1.101 0 0 0-.74.268L5.487 7.969a1.067 1.067 0 0 0-.1 1.52c.399.447 1.089.49 1.542.098l2.617-2.268c.207.02.48.053.797.109a9.07 9.07 0 0 1 1.834.522c-.122.127-.254.27-.39.427-.524.606-1.2 1.52-1.476 2.536-.257.947-.25 1.892-.192 2.571.013.15.028.288.045.415l-.01.01-2.672 2.768a1.103 1.103 0 0 1-1.397.154l-3.386-2.227a1.101 1.101 0 0 0-1.514.299 1.068 1.068 0 0 0 .302 1.493l3.387 2.227a3.31 3.31 0 0 0 4.19-.46Z"/><path fill="currentColor" d="M16.287 1.5a2.2 2.2 0 0 0-1.544.63c-.41.405-.64.953-.64 1.524 0 .571.23 1.119.64 1.523a2.2 2.2 0 0 0 1.544.63 2.2 2.2 0 0 0 1.545-.63c.41-.404.64-.952.64-1.523s-.23-1.12-.64-1.523a2.2 2.2 0 0 0-1.545-.631Z"/></svg>',
    calendar: tabler('<rect x="4" y="5" width="16" height="16" rx="2"/><path d="M16 3v4M8 3v4M4 11h16M8 15h2v2H8z"/>'),
    bookmarkPlain: tabler('<path d="M18 7v14l-6-4-6 4V7a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4z"/>'),
    plus: tabler('<path d="M12 5v14M5 12h14"/>'),
    x: tabler('<path d="M18 6 6 18M6 6l12 12"/>'),
    multi: tabler('<path d="M3.5 5.5 5 7l2.5-2.5M3.5 11.5 5 13l2.5-2.5M3.5 17.5 5 19l2.5-2.5M11 6h9M11 12h9M11 18h9"/>'),
    upload: '<svg viewBox="0 0 20 20" aria-hidden="true"><path fill="currentColor" d="M8.857 1.347a2.305 2.305 0 0 1 2.286 0l5.833 3.34a2.275 2.275 0 0 1 1.149 1.972v3.759a.625.625 0 0 1-1.25 0V6.66a1.027 1.027 0 0 0-.518-.889l-5.834-3.34a1.056 1.056 0 0 0-1.046 0L3.644 5.77c-.323.185-.519.525-.519.89v6.68c0 .366.196.705.519.889l5.833 3.34a1.057 1.057 0 0 0 1.046 0 .625.625 0 1 1 .62 1.085 2.305 2.305 0 0 1-2.286 0l-5.834-3.34a2.274 2.274 0 0 1-1.148-1.973V6.66c0-.816.439-1.568 1.147-1.974l5.835-3.34ZM10 9.376c.345 0 .625.28.625.625v8.333a.625.625 0 0 1-1.25 0v-8.333c0-.345.28-.625.625-.625Zm7.816-3.888a.625.625 0 0 1-.229.854l-7.274 4.2a.625.625 0 0 1-.625-1.082l7.274-4.2a.625.625 0 0 1 .854.228Zm-15.632 0a.625.625 0 0 1 .853-.228l7.276 4.2a.625.625 0 0 1-.625 1.082l-7.275-4.2a.625.625 0 0 1-.23-.854ZM15.833 12.71c.345 0 .625.279.625.624v5a.625.625 0 1 1-1.25 0v-5c0-.345.28-.625.625-.625Zm-.442.183a.625.625 0 0 1 .884 0l2.5 2.5a.625.625 0 1 1-.884.884l-2.058-2.058-2.058 2.058a.625.625 0 0 1-.884-.884l2.5-2.5Z"/></svg>'
  };
  const views = {models: '模型', images: '图像', 'creative-lab': '创意工坊'};
  // Second-level model tabs keep the original icon chips.
  const filters = [['all','所有',use('grid-dots')],['geometry','白模',use('cube')],['textured','贴图模型',icons.textured],['animated','动画',icons.animated]];
  const typeNames = {textured: '贴图模型', geometry: '白模', animated: '动画'};
  const btn = (label, content, cls = '', attrs = '') => `<button type="button" class="ra-icon ${cls}" aria-label="${label}" title="${label}" ${attrs}>${content}</button>`;
  // Real names come from the Agent project (see names.js); unknown ones fall back to a type label.
  const names = window.MeshyAssetNames.list;

  // Filter attributes. The capture has no per-model mesh / texture / pose / status data,
  // so these are derived from type, card icons and names (documented as demo values).
  const attrs = data.models.map((item, index) => {
    const name = names[index];
    const textured = item.type !== 'geometry';
    const geometry = new Set();
    if (/高精/.test(name) || (textured && index % 3 === 0)) geometry.add('detail');
    if (/智能拓扑/.test(name) || item.badge === 'mesh') geometry.add('smart');
    if (textured) geometry.add('uv');
    if (/拓扑/.test(name) || item.badge === 'mesh') geometry.add('retopo');
    geometry.add(item.badge === 'mesh' || /拓扑/.test(name) ? 'quad' : 'tri');
    const texture = new Set();
    if (textured) {
      texture.add(/高精|多视/.test(name) ? '4k' : index % 11 === 0 ? '8k' : '2k');
      if (index % 4 === 0 || /贴图/.test(name)) texture.add('pbr');
    }
    const character = /女孩|兔子/.test(name);
    const pose = item.type === 'animated' ? 'custom' : /红裙/.test(name) ? 't' : character ? 'a' : null;
    const status = new Set([item.synced || index % 6 === 0 ? 'published' : 'unpublished', index % 5 === 0 ? 'downloaded' : 'not-downloaded']);
    const tags = /猫/.test(name) ? ['猫'] : [];
    return {geometry, texture, pose, status, tags, agent: window.MeshyAssetNames.known(index)};
  });

  // 筛选 groups per tab. The first option of each group is the default ("所有").
  const filterGroups = {
    models: [
      ['geometry', '几何', [['all','所有'],['detail','高细节'],['smart','智能拓扑'],['uv','有 UV'],['retopo','已重拓扑'],['quad','四边形网格'],['tri','三角形网格']]],
      ['texture', '贴图', [['all','所有'],['2k','2K'],['4k','4K'],['8k','8K'],['pbr','PBR']]],
      ['pose', '姿势', [['all','所有'],['a','A 姿势'],['t','T 姿势'],['custom','自定义']]],
      ['status', '状态', [['all','所有'],['published','已发布'],['unpublished','未发布'],['downloaded','已下载'],['not-downloaded','未下载']]],
      ['tag', '我的标签', [['all','全部'],['none','未标记的'],['猫','猫']]],
      ['source', '来源', [['all','所有'],['agent','Agent'],['other','非 Agent']]]
    ],
    images: [
      ['status', '状态', [['all','所有'],['done','已生成'],['blocked','已被阻止']]],
      ['ratio', '比例', [['all','所有'], ...[...new Set(data.images.flatMap(row => row.tags.filter(tag => /^\d+:\d+$/.test(tag))))].map(tag => [tag, tag])]],
      ['model', '生成模型', [['all','所有'], ...[...new Set(data.images.flatMap(row => row.tags.filter(tag => !/^\d+:\d+$/.test(tag))))].map(tag => [tag, tag])]]
    ],
    'creative-lab': [
      ['product', '产品', [['all','所有'], ...[...new Set(data.lab.map(item => item.label.split(' · ')[0]))].map(name => [name, name])]]
    ]
  };
  const timeOptions = [['all','全部时间'],['today','今天'],['7','最近 7 天'],['30','最近 30 天'],['custom','自定义时间段']];
  const filterDefaults = key => Object.fromEntries(filterGroups[key].map(([group,,options]) => [group, options[0][0]]));
  // 筛选 (funnel) and 时间 (calendar) open their own panels; a dot marks a non-default choice.
  const dropButton = (drop, label, icon) => `<button type="button" class="ra-icon ra-drop" data-drop="${drop}" aria-label="${label}" title="${label}" aria-haspopup="dialog" aria-expanded="false">${icon}<i class="ra-drop-dot" hidden></i></button>`;
  const dropBar = `<div class="ra-drops">${dropButton('filter','筛选',use('filter'))}${dropButton('time','时间',icons.calendar)}</div>`;
  const filterPanel = key => `<div class="ra-pop ra-filter-pop" data-pop="filter" role="dialog" aria-label="筛选" hidden><div class="ra-filter-body">${filterGroups[key].map(([group, label, options]) => `<div class="ra-filter-field" role="radiogroup" aria-label="${label}"><span class="ra-filter-label">${label}</span><div class="ra-filter-options">${options.map(([value, name]) => `<button type="button" class="ra-filter-option" role="radio" data-group="${group}" data-value="${value}" aria-checked="false">${name}</button>`).join('')}</div></div>`).join('')}</div><div class="ra-filter-foot"><button type="button" class="ra-filter-reset">${icons.refresh}<span>重置</span></button></div></div>`;
  const timePanel = `<div class="ra-pop ra-menu-pop" data-pop="time" role="dialog" aria-label="时间" hidden><div role="radiogroup" aria-label="时间段">${timeOptions.map(([value, name]) => `<button type="button" class="ra-menu-option" role="radio" data-time="${value}" aria-checked="false">${name}${tabler('<path d="m5 12 5 5 9-10"/>')}</button>`).join('')}</div><div class="ra-range" hidden><label><span>开始</span><input type="date" data-range="from" min="2026-09-01" max="2026-10-18"></label><label><span>结束</span><input type="date" data-range="to" min="2026-09-01" max="2026-10-18"></label></div></div>`;
  // Captured dates are relative to the capture day.
  const today = new Date(2026, 9, 18);
  const parseDate = text => {
    const us = text.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
    if (us) return new Date(+us[3], us[1] - 1, +us[2]);
    const zh = text.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/);
    if (zh) return new Date(+zh[1], zh[2] - 1, +zh[3]);
    const slash = text.match(/(\d{4})\/(\d{1,2})\/(\d{1,2})/);
    return slash ? new Date(+slash[1], slash[2] - 1, +slash[3]) : null;
  };
  const isoDay = date => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  const dayKey = text => { const d = parseDate(text || ''); return d ? isoDay(d) : '示例与模板'; };
  const inTime = (text, time) => {
    if (time.preset === 'all') return true;
    const date = parseDate(text || '');
    if (!date) return false;
    const age = (today - date) / 864e5;
    if (time.preset === 'today') return age < 1;
    if (time.preset === 'custom') { const day = isoDay(date); return (!time.from || day >= time.from) && (!time.to || day <= time.to); }
    return age < Number(time.preset);
  };
  // Infinite scroll: render this many items, then another batch as the end comes into view.
  const BATCH = 36;
  const BATCH_ROWS = 12;

  function mount({rail, utilities, emptyCover, scheme}) {
    const main = document.querySelector('main');
    main.className = 'ra-workspace';
    main.replaceChildren(rail);
    utilities.remove();
    document.body.classList.add('ra-body');
    document.title = `meshy_redesign${scheme}`;
    // Embedded in the composer's asset picker: no navigation; clicks select, 添加 confirms.
    const embed = new URLSearchParams(location.search).get('embed') === '1';
    if (embed) root.dataset.assetsEmbed = 'true';
    const showBack = !embed && scheme === '1' && new URLSearchParams(location.search).get('from') === 'agent';
    // Opened from the 资产 entry, the library is its own destination and 资产 is current.
    // Opened from Agent (with 返回), it is a secondary page of 创作: keep 创作 highlighted
    // and let it return to Agent.
    const create = rail.querySelector('[aria-label="创作"]');
    const assetsEntry = rail.querySelector('[data-nav-link="assets"]');
    if (showBack) { create.setAttribute('aria-current', 'page'); assetsEntry.removeAttribute('aria-current'); }
    else { create.removeAttribute('aria-current'); assetsEntry.setAttribute('aria-current', 'page'); }
    create.addEventListener('click', () => { location.href = `/redesign/${scheme}${showBack ? '?mode=agent' : ''}`; });
    const logo = rail.querySelector('.replica-rail-logo');
    if (scheme === '1') {
      logo.setAttribute('role', 'link'); logo.tabIndex = 0;
      logo.addEventListener('click', () => { location.href = '/redesign/1'; });
      logo.addEventListener('keydown', event => { if (event.key === 'Enter') location.href = '/redesign/1'; });
    }

    // Header: first-level tabs on the left; on the right the shared search + multi-select
    // capsule, the layout switch, then 上传.
    const tabs = [['models','模型'],['images','图像'],['creative-lab','创意工坊']]
      .map(([key, name]) => `<button type="button" class="ra-tab" role="tab" id="ra-tab-${key}" data-view="${key}" aria-controls="ra-pane-${key}" aria-selected="false" tabindex="-1">${name}</button>`).join('');
    const tabBar = `<div class="ra-tabs" role="tablist" aria-label="我的资产">${tabs}</div>`;
    const back = showBack ? `<button type="button" class="ra-back" aria-label="返回上一页" title="返回上一页">${use('chevron-left')}<span>返回</span></button><span class="ra-back-divider" aria-hidden="true"></span>` : '';
    const placeholders = {models: '搜索我的模型', images: '搜索提示词', 'creative-lab': '搜索作品'};
    const search = key => `<div class="ra-search" data-search><button type="button" class="ra-icon ra-search-btn" aria-label="搜索" title="搜索" aria-expanded="false">${use('search')}</button><input type="search" placeholder="${placeholders[key]}" aria-label="${placeholders[key]}" spellcheck="false" tabindex="-1"></div>`;
    const layoutSwitch = `<div class="ra-seg" role="radiogroup" aria-label="显示方式">${btn('宫格视图', icons.grid, '', 'role="radio" data-layout="grid" aria-checked="false"')}${btn('列表视图', icons.list, '', 'role="radio" data-layout="list" aria-checked="false"')}</div>`;
    const toolsFor = key => `<div class="ra-tool-group">${search(key)}${embed ? '' : btn('多选', icons.multi, 'ra-batch-toggle', 'aria-pressed="false"')}</div>${layoutSwitch}`;
    const toolbar = `<div class="ra-tools">${Object.keys(views).map(key => `<div class="ra-toolset" data-tools="${key}" hidden>${toolsFor(key)}</div>`).join('')}${embed ? '' : `<button type="button" class="ra-upload">${icons.upload}<span>上传</span></button>`}</div>`;

    const batchBar = `<div class="ra-batch" aria-hidden="true" inert><span class="ra-batch-count">未选择任何资产。</span><div class="ra-batch-actions"><button type="button" class="ra-chip ra-outline" disabled>${icons.download}<span>下载</span></button>${btn('添加标签',icons.bookmark,'ra-outline','disabled')}${btn('删除',icons.trash,'ra-outline','disabled')}</div></div>`;
    const scrollArea = `<div class="ra-scroll"><div class="ra-groups" data-list></div><div class="ra-sentinel" aria-hidden="true"></div><p class="ra-end" aria-live="polite"></p></div>`;
    const pops = key => `${filterPanel(key)}${timePanel}`;
    const paneFor = (key, lead = '') => `<section class="ra-pane" id="ra-pane-${key}" role="tabpanel" aria-labelledby="ra-tab-${key}" data-pane="${key}" hidden>
      <div class="ra-subbar">${lead}${dropBar}</div>${embed ? '' : batchBar}${pops(key)}${scrollArea}
    </section>`;
    const phases = `<div role="radiogroup" aria-label="模型类型" class="ra-phases">${filters.map(([key,name,icon],i)=>`<button type="button" class="ra-chip" role="radio" data-filter="${key}" aria-checked="${i===0}">${icon}<span>${name}</span></button>`).join('')}</div><span class="ra-divider"></span>`;
    const tray = embed ? `<footer class="ra-tray"><div class="ra-tray-picks"><div class="ra-tray-thumbs"></div><span class="ra-tray-count">尚未选择</span><span class="ra-tray-divider" aria-hidden="true"></span>${btn('清除所有已选择', icons.trash, 'ra-tray-clear', 'disabled')}</div><div class="ra-tray-actions"><button type="button" class="ra-tray-cancel">取消</button><button type="button" class="ra-tray-add" disabled>${icons.plus}<span>添加</span></button></div></footer>` : '';
    main.insertAdjacentHTML('beforeend', `<div class="ra-shell"><div class="ra-content"><div class="ra-header">${back}${tabBar}${toolbar}</div>${paneFor('models', phases)}${paneFor('images')}${paneFor('creative-lab')}${tray}</div></div>`);

    if (showBack) main.querySelector('.ra-back').addEventListener('click', () => {
      if (history.length > 1) history.back();
      else location.href = `/redesign/${scheme}?mode=agent`;
    });

    // Per-view state. Filters, time, search, selection and the rendered count run locally.
    const freshTime = () => ({preset: 'all', from: '', to: ''});
    const state = Object.fromEntries(Object.keys(views).map(key => [key, {limit: 0, layout: 'grid', query: '', selecting: embed, filter: 'all', panel: filterDefaults(key), time: freshTime()}]));
    // Picks across tabs, in the order they were chosen.
    const picks = new Map();
    const pane = key => main.querySelector(`[data-pane="${key}"]`);
    const toolset = key => main.querySelector(`[data-tools="${key}"]`);

    const check = `<span class="ra-check" aria-hidden="true">${tabler('<path d="m5 12 5 5 9-10"/>')}</span>`;
    const selectable = (s, id) => s.selecting ? `role="checkbox" aria-checked="${picks.has(id)}"` : 'role="button"';
    const modelCard = (item, index, s) => {
      const id = `m${index}`;
      const left = item.sample ? `<span class="ra-pill">${item.sample}</span>` : `${item.synced ? `<span title="已同步">${use('cloud-check')}</span>` : ''}${attrs[index].tags.length ? `<span title="标签：${attrs[index].tags.join('、')}">${icons.bookmarkPlain}</span>` : ''}`;
      const badge = item.badge === 'mesh' ? use('model-mesh') : item.badge === 'animated' ? icons.animated : '';
      const retry = item.retry ? `<button type="button" class="ra-hover-btn ra-retry" aria-label="重新生成（剩余 4 次）" title="重新生成">${icons.refresh}<span class="ra-retry-count">x4</span></button>` : '';
      return `<div class="ra-item"><div class="ra-card ${picks.has(id) ? 'is-selected' : ''}" data-id="${id}" data-index="${index}" tabindex="0" ${selectable(s, id)} aria-label="${names[index]}${item.date ? `，生成于 ${item.date}` : ''}"><img src="${item.src}" alt="" loading="lazy" draggable="false"><span class="ra-corner ra-corner-left">${left}</span><span class="ra-corner ra-corner-right">${badge}</span>${s.selecting ? '' : `<span class="ra-card-hover"><span class="ra-card-actions">${retry}<button type="button" class="ra-hover-btn" aria-label="更多操作" title="更多操作">${use('dots')}</button></span></span>`}${check}</div><span class="ra-item-name" title="${names[index]}">${names[index]}</span></div>`;
    };
    const modelRow = (item, index, s) => { const id = `m${index}`; return `<div class="ra-model-row ${picks.has(id) ? 'is-selected' : ''}" data-id="${id}" data-index="${index}" tabindex="0" ${selectable(s, id)}><span class="ra-model-row-thumb"><img src="${item.src}" alt="" loading="lazy"></span><span class="ra-model-row-meta"><span class="ra-model-row-name">${names[index]}</span><span class="ra-model-row-type">${item.type === 'textured' ? icons.textured : item.type === 'animated' ? icons.animated : use('cube')}${typeNames[item.type]}${item.date ? ` · ${item.date}` : ''}</span></span>${s.selecting ? check : `<span class="ra-model-row-actions">${item.retry ? `<button type="button" class="ra-icon" aria-label="重新生成（剩余 4 次）" title="重新生成">${icons.refresh}</button>` : ''}${btn('下载',icons.download)}${btn('更多操作',use('dots'))}</span>`}</div>`; };
    const imageCell = (src, prompt, s) => { const id = `i${src}`; return `<div class="ra-item"><div class="ra-image-cell ${picks.has(id) ? 'is-selected' : ''}" data-id="${id}" tabindex="0" ${selectable(s, id)} aria-label="${prompt || '图像'}"><img src="${src}" alt="" loading="lazy" draggable="false">${s.selecting ? '' : `<span class="ra-image-hover"><span class="ra-image-top">${btn('下载',icons.download,'ra-hover-btn ra-hover-lg')}${btn('更多操作',use('dots'),'ra-hover-btn ra-hover-lg')}</span><span class="ra-split"><button type="button">图片生成模型</button><i></i><button type="button" aria-label="生成设置" title="生成设置">${icons.settings}</button></span></span>`}${check}</div>${prompt ? `<span class="ra-item-name" title="${prompt}">${prompt}</span>` : ''}</div>`; };
    const imageRow = (row, s) => `<article class="ra-image-row"><div class="ra-image-grid">${row.images.length ? row.images.map(src => imageCell(src, '', s)).join('') : `<div class="ra-blocked">${icons.sad}<span>内容已被阻止</span><span class="ra-blocked-actions">${btn('删除',icons.trash,'ra-hover-btn ra-hover-lg')}</span></div>`}</div><div class="ra-image-meta"><time>${row.date}</time><div class="ra-prompt"><p>${row.prompt}</p>${btn('复制提示词',icons.copy,'ra-prompt-copy')}</div><div class="ra-tags">${row.tags.map(tag => `<span>${tag}</span>`).join('')}</div><div class="ra-meta-actions">${btn('删除',icons.trash)}${btn('下载',icons.download)}</div></div></article>`;
    const labCard = (item, index, s) => { const id = `l${index}`; return `<div class="ra-item"><div class="ra-lab-card ${picks.has(id) ? 'is-selected' : ''}" data-id="${id}" tabindex="0" ${selectable(s, id)} aria-label="${item.label}"><img src="${item.src}" alt="" loading="lazy" draggable="false">${s.selecting ? '' : btn('更多操作',use('dots'),'ra-hover-btn ra-lab-menu')}${check}</div><span class="ra-item-name">${item.label.split(' · ')[0]}</span></div>`; };
    // What a pick carries back to the composer.
    const pickInfo = id => {
      if (id[0] === 'm') { const index = Number(id.slice(1)); return {kind: 'model', name: names[index], src: data.models[index].src}; }
      if (id[0] === 'i') { const src = id.slice(1); const row = data.images.find(r => r.images.includes(src)); return {kind: 'image', name: row ? row.prompt.slice(0, 16) : '图像', src}; }
      const item = data.lab[Number(id.slice(1))];
      return {kind: 'image', name: item.label.split(' · ')[0], src: item.src};
    };

    // Each source returns [{date, html}] in display order; render groups consecutive dates.
    function source(key) {
      const s = state[key];
      const q = s.query.trim().toLowerCase();
      const p = s.panel;
      const match = (...texts) => !q || texts.some(text => text && text.toLowerCase().includes(q));
      if (key === 'models') {
        let rows = data.models.map((item, index) => [item, index]).filter(([item, index]) => {
          const a = attrs[index];
          return (s.filter === 'all' || item.type === s.filter) && inTime(item.date, s.time) &&
            (p.geometry === 'all' || a.geometry.has(p.geometry)) && (p.texture === 'all' || a.texture.has(p.texture)) &&
            (p.pose === 'all' || a.pose === p.pose) && (p.status === 'all' || a.status.has(p.status)) &&
            (p.tag === 'all' || (p.tag === 'none' ? !a.tags.length : a.tags.includes(p.tag))) &&
            (p.source === 'all' || (p.source === 'agent') === a.agent) &&
            match(names[index], typeNames[item.type], item.date, item.sample);
        });
        return rows.map(([item, index]) => ({date: dayKey(item.date), html: () => (s.layout === 'grid' ? modelCard : modelRow)(item, index, s)}));
      }
      if (key === 'images') {
        let rows = data.images.filter(row => match(row.prompt) && inTime(row.date, s.time) &&
          (p.status === 'all' || (p.status === 'blocked') === !row.images.length) &&
          (p.ratio === 'all' || row.tags.includes(p.ratio)) && (p.model === 'all' || row.tags.includes(p.model)));
        if (s.layout === 'list') return rows.map(row => ({date: dayKey(row.date), html: () => imageRow(row, s)}));
        return rows.flatMap(row => row.images.map(src => ({date: dayKey(row.date), html: () => imageCell(src, row.prompt, s)})));
      }
      const lab = data.lab.map((item, index) => [item, index]).filter(([item]) => (p.product === 'all' || item.label.startsWith(`${p.product} ·`)) && inTime(item.label, s.time) && match(item.label));
      return lab.map(([item, index]) => ({date: dayKey(item.label), html: () => labCard(item, index, s)}));
    }

    const containerFor = (key, s) => key === 'images' && s.layout === 'list' ? 'ra-image-rows'
      : s.layout === 'list' ? (key === 'models' ? 'ra-model-list' : 'ra-lab-list')
      : key === 'creative-lab' ? 'ra-lab-grid' : 'ra-model-grid';
    const stepFor = (key, s) => key === 'images' && s.layout === 'list' ? BATCH_ROWS : BATCH;

    function syncControls(key) {
      const s = state[key];
      const el = pane(key);
      const changed = filterGroups[key].filter(([group,,options]) => s.panel[group] !== options[0][0]).length;
      const states = {filter: changed > 0, time: s.time.preset !== 'all'};
      el.querySelectorAll('.ra-drop').forEach(button => {
        const on = states[button.dataset.drop];
        button.classList.toggle('is-active', on);
        button.querySelector('.ra-drop-dot').hidden = !on;
      });
      el.querySelector('.ra-drop[data-drop="filter"]').setAttribute('aria-label', changed ? `筛选（已启用 ${changed} 项）` : '筛选');
      el.querySelector('.ra-drop[data-drop="time"]').setAttribute('aria-label', states.time ? `时间：${timeOptions.find(([value]) => value === s.time.preset)[1]}` : '时间');
      el.querySelectorAll('.ra-filter-option').forEach(option => option.setAttribute('aria-checked', String(s.panel[option.dataset.group] === option.dataset.value)));
      el.querySelector('.ra-filter-reset').disabled = !changed;
      el.querySelectorAll('[data-time]').forEach(option => option.setAttribute('aria-checked', String(option.dataset.time === s.time.preset)));
      el.querySelector('.ra-range').hidden = s.time.preset !== 'custom';
      toolset(key).querySelectorAll('[data-layout]').forEach(button => button.setAttribute('aria-checked', String(button.dataset.layout === s.layout)));
      toolset(key).querySelector('.ra-batch-toggle')?.setAttribute('aria-pressed', String(s.selecting));
    }

    function render(key) {
      const s = state[key];
      const el = pane(key);
      const all = source(key);
      const step = stepFor(key, s);
      s.limit = Math.max(step, Math.min(s.limit, all.length));
      const groups = [];
      for (const item of all.slice(0, s.limit)) {
        if (!groups.length || groups[groups.length - 1].date !== item.date) groups.push({date: item.date, items: []});
        groups[groups.length - 1].items.push(item);
      }
      const empty = {models: '没有符合条件的模型。', images: '没有符合条件的生成记录。', 'creative-lab': '没有符合条件的作品。'}[key];
      el.querySelector('[data-list]').innerHTML = groups.length ? groups.map(group => `<section class="ra-group"><h3 class="ra-group-date">${group.date}</h3><div class="${containerFor(key, s)}">${group.items.map(item => item.html()).join('')}</div></section>`).join('') : `<p class="ra-empty">${empty}</p>`;
      el.querySelector('.ra-end').textContent = all.length > step && s.limit >= all.length ? `已显示全部 ${all.length} 项` : '';
      el.classList.toggle('is-selecting', s.selecting);
      syncControls(key);
      syncSelection();
    }
    // Start over from the first batch whenever what is listed changes.
    const restart = key => { state[key].limit = 0; render(key); pane(key).querySelector('.ra-scroll').scrollTop = 0; };

    // Selection: the batch bar (library) or the pick tray (picker) reflects every pick.
    function syncSelection() {
      for (const key of Object.keys(views)) {
        const bar = pane(key).querySelector('.ra-batch');
        if (!bar) continue;
        const count = [...picks.keys()].filter(id => id[0] === {models: 'm', images: 'i', 'creative-lab': 'l'}[key]).length;
        bar.querySelector('.ra-batch-count').textContent = count ? `已选择 ${count} 项。` : '未选择任何资产。';
        bar.querySelectorAll('button').forEach(button => { button.disabled = !count; });
      }
      if (!embed) return;
      const list = [...picks.entries()];
      main.querySelector('.ra-tray-thumbs').innerHTML = list.map(([id, item]) => `<span class="ra-tray-thumb" title="${item.name}"><img src="${item.src}" alt=""><button type="button" class="ra-tray-remove" data-remove="${id}" aria-label="移除 ${item.name}" title="移除">${icons.x}</button></span>`).join('');
      const models = list.filter(([, item]) => item.kind === 'model').length;
      const images = list.length - models;
      main.querySelector('.ra-tray-count').textContent = list.length ? [models && `${models} 个模型`, images && `${images} 张图像`].filter(Boolean).join('、') : '尚未选择';
      main.querySelector('.ra-tray-clear').disabled = !list.length;
      main.querySelector('.ra-tray-add').disabled = !list.length;
    }
    function togglePick(target) {
      const node = target.closest('[data-id]');
      if (!node || target.closest('.ra-hover-btn, .ra-icon, .ra-split')) return false;
      const key = node.closest('[data-pane]').dataset.pane;
      if (!state[key].selecting) return false;
      const id = node.dataset.id;
      if (picks.has(id)) picks.delete(id); else picks.set(id, pickInfo(id));
      node.classList.toggle('is-selected', picks.has(id));
      node.setAttribute('aria-checked', String(picks.has(id)));
      syncSelection();
      return true;
    }

    let current;
    function show(key, {focus = false, replace = true} = {}) {
      if (!views[key] || (embed && key === 'creative-lab')) key = 'models';
      current = key;
      root.dataset.assetsWorkspace = key;
      main.querySelectorAll('.ra-tab').forEach(row => {
        const on = row.dataset.view === key;
        row.setAttribute('aria-selected', String(on));
        row.tabIndex = on ? 0 : -1;
        if (on && focus) row.focus();
      });
      main.querySelectorAll('[data-pane]').forEach(el => { el.hidden = el.dataset.pane !== key; });
      main.querySelectorAll('[data-tools]').forEach(el => { el.hidden = el.dataset.tools !== key; });
      closePops();
      render(key);
      if (replace) {
        const url = new URL(location.href);
        if (key === 'models') url.searchParams.delete('tab'); else url.searchParams.set('tab', key);
        history.replaceState(null, '', url);
      }
    }

    const viewGroup = main.querySelector('.ra-tabs');
    viewGroup.addEventListener('click', event => { const row = event.target.closest('.ra-tab'); if (row) show(row.dataset.view); });
    viewGroup.addEventListener('keydown', event => {
      const keys = embed ? ['models', 'images'] : ['models', 'images', 'creative-lab'];
      const step = {ArrowRight: 1, ArrowLeft: -1}[event.key];
      if (!step) return;
      event.preventDefault();
      show(keys[(keys.indexOf(current) + step + keys.length) % keys.length], {focus: true});
    });

    // Popovers (筛选 / 时间): one open at a time, anchored under their button.
    let openPop = null;
    function closePops() {
      if (!openPop) return;
      openPop.panel.hidden = true;
      openPop.button.setAttribute('aria-expanded', 'false');
      openPop = null;
    }
    function togglePop(button) {
      const el = button.closest('[data-pane]');
      const panel = el.querySelector(`[data-pop="${button.dataset.drop}"]`);
      const reopen = openPop?.panel !== panel;
      closePops();
      if (!reopen) return;
      panel.hidden = false;
      button.setAttribute('aria-expanded', 'true');
      openPop = {panel, button};
      const box = button.getBoundingClientRect(), base = el.getBoundingClientRect();
      panel.style.top = `${box.bottom - base.top + 6}px`;
      panel.style.left = `${Math.max(8, Math.min(box.left - base.left, base.width - panel.offsetWidth - 8))}px`;
      panel.querySelector('[aria-checked="true"]')?.focus({preventScroll: true});
    }
    document.addEventListener('pointerdown', event => { if (openPop && !openPop.panel.contains(event.target) && !openPop.button.contains(event.target)) closePops(); });
    document.addEventListener('keydown', event => { if (event.key === 'Escape' && openPop) { event.stopImmediatePropagation(); const button = openPop.button; closePops(); button.focus(); } }, true);

    for (const key of Object.keys(views)) {
      const el = pane(key);
      const tools = toolset(key);
      const s = state[key];
      // Load the next batch when the end of the list is near.
      new IntersectionObserver(entries => {
        if (!entries.some(entry => entry.isIntersecting) || el.hidden) return;
        if (s.limit < source(key).length) { s.limit += stepFor(key, s); render(key); }
      }, {root: el.querySelector('.ra-scroll'), rootMargin: '0px 0px 480px 0px'}).observe(el.querySelector('.ra-sentinel'));

      tools.addEventListener('click', event => {
        const layout = event.target.closest('[data-layout]');
        if (layout && layout.dataset.layout !== s.layout) { s.layout = layout.dataset.layout; restart(key); return; }
        if (event.target.closest('.ra-batch-toggle')) {
          s.selecting = !s.selecting;
          if (!s.selecting) for (const id of [...picks.keys()]) if (id[0] === {models: 'm', images: 'i', 'creative-lab': 'l'}[key]) picks.delete(id);
          const bar = el.querySelector('.ra-batch');
          bar.inert = !s.selecting;
          bar.setAttribute('aria-hidden', String(!s.selecting));
          render(key);
        }
      });
      // Search collapses to an icon; it opens into a field and folds back when left empty.
      const searchBox = tools.querySelector('[data-search]');
      const input = searchBox.querySelector('input');
      const searchToggle = searchBox.querySelector('.ra-search-btn');
      const setSearch = open => {
        searchBox.classList.toggle('is-open', open);
        searchToggle.setAttribute('aria-expanded', String(open));
        input.tabIndex = open ? 0 : -1;
        if (open) input.focus({preventScroll: true});
      };
      searchToggle.addEventListener('pointerdown', event => event.preventDefault());
      searchToggle.addEventListener('click', () => setSearch(!searchBox.classList.contains('is-open') || Boolean(input.value)));
      input.addEventListener('input', () => { s.query = input.value; restart(key); });
      input.addEventListener('blur', () => { if (!input.value) setSearch(false); });
      document.addEventListener('pointerdown', event => { if (!input.value && !searchBox.contains(event.target)) setSearch(false); });
      input.addEventListener('keydown', event => {
        if (event.key !== 'Escape') return;
        event.stopPropagation();
        input.value = ''; s.query = ''; restart(key); setSearch(false); searchToggle.focus();
      });

      el.querySelector('.ra-drops').addEventListener('click', event => { const button = event.target.closest('.ra-drop'); if (button) togglePop(button); });
      el.querySelector('[data-pop="filter"]').addEventListener('click', event => {
        const option = event.target.closest('.ra-filter-option');
        if (option) s.panel[option.dataset.group] = option.dataset.value;
        else if (event.target.closest('.ra-filter-reset')) s.panel = filterDefaults(key);
        else return;
        restart(key);
      });
      el.querySelector('[data-pop="time"]').addEventListener('click', event => {
        const option = event.target.closest('[data-time]');
        if (!option) return;
        s.time = {...s.time, preset: option.dataset.time};
        restart(key);
        if (s.time.preset !== 'custom') closePops();
      });
      el.querySelectorAll('[data-range]').forEach(field => field.addEventListener('change', () => { s.time = {...s.time, [field.dataset.range]: field.value}; restart(key); }));
      const list = el.querySelector('[data-list]');
      list.addEventListener('click', event => togglePick(event.target));
      list.addEventListener('keydown', event => { if ((event.key === 'Enter' || event.key === ' ') && togglePick(event.target)) event.preventDefault(); });
    }

    const models = pane('models');
    models.querySelector('.ra-phases').addEventListener('click', event => {
      const chip = event.target.closest('[data-filter]');
      if (!chip) return;
      state.models.filter = chip.dataset.filter;
      models.querySelectorAll('[data-filter]').forEach(button => button.setAttribute('aria-checked', String(button === chip)));
      restart('models');
    });
    document.addEventListener('keydown', event => {
      if (event.key !== 'Escape' || embed) return;
      const s = state[current];
      if (s.selecting) toolset(current).querySelector('.ra-batch-toggle')?.click();
    });

    if (embed) {
      const tray = main.querySelector('.ra-tray');
      tray.addEventListener('click', event => {
        const remove = event.target.closest('[data-remove]');
        if (remove) picks.delete(remove.dataset.remove);
        else if (event.target.closest('.ra-tray-clear')) picks.clear();
        else if (event.target.closest('.ra-tray-cancel')) { parent.postMessage({type: 'meshy-asset-close'}, location.origin); return; }
        else if (event.target.closest('.ra-tray-add')) {
          parent.postMessage({type: 'meshy-asset-pick', items: [...picks.values()]}, location.origin);
          picks.clear();
          Object.keys(views).forEach(render);
          return;
        } else return;
        Object.keys(views).forEach(render);
      });
      document.addEventListener('keydown', event => { if (event.key === 'Escape') parent.postMessage({type: 'meshy-asset-close'}, location.origin); });
    }

    show(new URLSearchParams(location.search).get('tab') || 'models', {replace: false});
    root.dataset.assetsReady = 'true';
  }
  window.MeshyAssetsWorkspace = {mount};
})();

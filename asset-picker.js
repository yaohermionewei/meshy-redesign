/* "从资产中选择": the asset library opens in a dialog so the current page stays put. */
(() => {
  const root = document.documentElement;
  if (!['1', '2'].includes(root.dataset.redesign)) return;
  const closeIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>';
  const scheme = () => location.pathname.match(/^\/redesign\/([12])/)?.[1] || root.dataset.redesign;
  let dialog, frame, onPick = null, returnFocus = null;

  function build() {
    dialog = document.createElement('div');
    dialog.className = 'mp-picker';
    dialog.hidden = true;
    dialog.innerHTML = `<div class="mp-scrim" data-close></div><section class="mp-panel" role="dialog" aria-modal="true" aria-labelledby="mp-title"><header class="mp-head"><h2 id="mp-title">从资产中选择</h2><span class="mp-hint">选择模型或图像，点击「添加」加入对话</span><button type="button" class="mp-close" aria-label="关闭" title="关闭" data-close>${closeIcon}</button></header><iframe class="mp-frame" title="我的资产"></iframe></section>`;
    document.body.append(dialog);
    frame = dialog.querySelector('.mp-frame');
    dialog.addEventListener('click', event => { if (event.target.closest('[data-close]')) close(); });
    // Capture so Escape closes only the dialog, not drawers or selections underneath.
    document.addEventListener('keydown', event => {
      if (event.key !== 'Escape' || dialog.hidden) return;
      event.stopImmediatePropagation();
      close();
    }, true);
    // The embedded library reports picks and Escape presses from inside the frame.
    addEventListener('message', event => {
      if (event.origin !== location.origin || dialog.hidden || event.source !== frame.contentWindow) return;
      if (event.data?.type === 'meshy-asset-close') close();
      if (event.data?.type === 'meshy-asset-pick') {
        // 添加 confirms every selected asset at once.
        const pick = onPick;
        close();
        for (const item of event.data.items || [event.data.item]) if (item) pick?.(item);
      }
    });
  }

  function open({onPick: callback} = {}) {
    if (!dialog) build();
    onPick = callback || null;
    returnFocus = document.activeElement;
    // The frame is kept between openings, so tabs, filters and scroll stay where they were.
    const src = `/redesign/${scheme()}/assets?embed=1`;
    if (frame.getAttribute('src') !== src) frame.src = src;
    dialog.hidden = false;
    root.classList.add('mp-open');
    dialog.querySelector('.mp-close').focus({preventScroll: true});
  }

  function close() {
    if (!dialog || dialog.hidden) return;
    dialog.hidden = true;
    root.classList.remove('mp-open');
    onPick = null;
    returnFocus?.focus?.({preventScroll: true});
  }

  window.MeshyAssetPicker = {open, close};
})();

(() => {
  const root = document.documentElement;
  const status = document.querySelector('.layout-status');
  const viewButtons = [...document.querySelectorAll('[data-set-view]')];

  const setView = (view, updateUrl = true) => {
    const normalized = view === 'print' ? 'print' : 'screen';
    root.dataset.view = normalized;
    viewButtons.forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.setView === normalized));
    });
    if (updateUrl) {
      const url = new URL(location.href);
      url.searchParams.set('view', normalized);
      history.replaceState(null, '', url);
    }
    requestAnimationFrame(runDiagnostics);
  };

  const runDiagnostics = () => {
    const resume = document.querySelector('.resume');
    if (!resume || !status) return;
    const horizontalOverflow = document.documentElement.scrollWidth > document.documentElement.clientWidth + 1;
    const explicitPages = document.querySelectorAll('.resume.page').length;
    const pageHeight = 297 / 210 * resume.getBoundingClientRect().width;
    const estimatedPages = root.dataset.pagination === 'single'
      ? 1
      : (explicitPages || Math.max(1, Math.ceil(resume.scrollHeight / pageHeight)));
    const shortTails = [...document.querySelectorAll('.entry-points li')].filter((item) => {
      const range = document.createRange();
      range.selectNodeContents(item);
      const fragments = [...range.getClientRects()].filter((rect) => rect.width > 0 && rect.height > 0);
      const lines = [];
      fragments.forEach((rect) => {
        let line = lines.find((candidate) => Math.abs(candidate.top - rect.top) < 2);
        if (!line) {
          line = { top: rect.top, left: rect.left, right: rect.right };
          lines.push(line);
        } else {
          line.left = Math.min(line.left, rect.left);
          line.right = Math.max(line.right, rect.right);
        }
      });
      lines.sort((a, b) => a.top - b.top);
      if (lines.length < 2) return false;
      const lastLine = lines.at(-1);
      return lastLine.right - lastLine.left < item.getBoundingClientRect().width * 0.25;
    }).length;
    const parts = [root.dataset.view === 'print' ? `预计 ${estimatedPages} 页` : '连续网页'];
    if (horizontalOverflow) parts.push('存在横向溢出');
    if (shortTails && root.dataset.diagnostics !== 'basic') {
      parts.push(`${shortTails} 条短尾行待复核`);
    }
    status.textContent = parts.join(' · ');
  };

  viewButtons.forEach((button) => button.addEventListener('click', () => setView(button.dataset.setView)));
  document.querySelector('[data-print]')?.addEventListener('click', () => {
    setView('print');
    requestAnimationFrame(() => window.print());
  });
  addEventListener('resize', () => requestAnimationFrame(runDiagnostics));
  addEventListener('beforeprint', () => setView('print', false));

  const requestedView = new URL(location.href).searchParams.get('view');
  setView(requestedView || root.dataset.view, false);
})();

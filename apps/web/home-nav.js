(() => {
  function goHome() {
    try {
      if (typeof switchView === 'function') {
        switchView('generator');
        window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
        return;
      }
    } catch {}
    location.href = '/';
  }

  function bindHome() {
    const brand = document.querySelector('.brand');
    if (!brand || brand.dataset.lockguardHomeBound === '1') return;
    brand.dataset.lockguardHomeBound = '1';
    brand.style.cursor = 'pointer';
    brand.setAttribute('role', 'button');
    brand.setAttribute('tabindex', '0');
    brand.setAttribute('aria-label', 'Voltar ao início');
    brand.addEventListener('click', goHome);
    brand.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        goHome();
      }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bindHome);
  else bindHome();
})();
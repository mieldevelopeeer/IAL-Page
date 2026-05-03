(function () {
  const SEL_OPEN = '.ial-modal.active';
  /** @type {Map<string, Element>} */
  const focusBeforeOpen = new Map();

  function syncBodyScroll() {
    document.body.style.overflow = document.querySelector(SEL_OPEN) ? 'hidden' : '';
  }

  function focusMainHeading() {
    const h = document.getElementById('page-title');
    if (!h) return;
    h.setAttribute('tabindex', '-1');
    h.focus();
  }

  function moveFocusOutOfModal(modalId) {
    const modal = document.getElementById(modalId);
    const prev = focusBeforeOpen.get(modalId);
    focusBeforeOpen.delete(modalId);

    if (!modal || !modal.contains(document.activeElement)) return;

    if (prev && document.body.contains(prev) && typeof prev.focus === 'function' && prev !== modal) {
      try {
        prev.focus();
      } catch (_) {
        focusMainHeading();
      }
    } else {
      focusMainHeading();
    }
  }

  function open(id) {
    const el = document.getElementById(id);
    if (!el || !el.classList.contains('ial-modal')) return;
    focusBeforeOpen.set(id, document.activeElement);
    el.classList.add('active');
    el.setAttribute('aria-hidden', 'false');
    syncBodyScroll();
    const focusTarget = el.querySelector(
      '.ial-modal__sheet input:not([type="hidden"]):not([type="file"]), .ial-modal__sheet select, .ial-modal__sheet textarea'
    );
    focusTarget?.focus?.();
  }

  function close(id) {
    const el = document.getElementById(id);
    if (!el) return;
    moveFocusOutOfModal(id);
    el.classList.remove('active');
    el.setAttribute('aria-hidden', 'true');
    syncBodyScroll();
  }

  function closeAll() {
    document.querySelectorAll('.ial-modal.active').forEach((m) => {
      moveFocusOutOfModal(m.id);
      m.classList.remove('active');
      m.setAttribute('aria-hidden', 'true');
    });
    syncBodyScroll();
  }

  function init() {
    document.querySelectorAll('.ial-modal').forEach((modal) => {
      if (!modal.hasAttribute('aria-hidden')) modal.setAttribute('aria-hidden', 'true');
      modal.addEventListener('click', (e) => {
        if (e.target === modal) close(modal.id);
      });
    });

    document.querySelectorAll('.modal-dismiss, [data-modal-dismiss]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const modal = btn.closest('.ial-modal');
        if (modal) close(modal.id);
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      closeAll();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.IALModal = { open, close, closeAll };
})();

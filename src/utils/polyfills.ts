export function initWebPlatformPolyfills(): void {
  if (typeof window === 'undefined' || typeof HTMLElement === 'undefined') {
    return;
  }

  if (!Object.hasOwn(HTMLElement.prototype, 'popover')) {
    void import('@oddbird/popover-polyfill');
  }

  // Fallback for browsers that support popover="auto" / "manual" but not "hint".
  // Upgrade toggletips (paired with a [popovertarget]) to "auto" on beforetoggle.
  const probe = document.createElement('div');
  probe.setAttribute('popover', 'hint');
  if (probe.popover !== 'hint') {
    document.addEventListener(
      'beforetoggle',
      (event) => {
        const target = event.target;
        const toggleEvent = event as ToggleEvent;
        if (!(target instanceof HTMLElement)) return;
        if (toggleEvent.newState !== 'open') return;
        if (target.getAttribute('popover') !== 'hint' || !target.id) return;

        const hasTrigger = document.querySelector(`[popovertarget="${CSS.escape(target.id)}"]`);
        if (hasTrigger) {
          target.setAttribute('popover', 'auto');
        }
      },
      true
    );
  }

  if (typeof HTMLButtonElement !== 'undefined' && !('interestForElement' in HTMLButtonElement.prototype)) {
    void import('interestfor');
  }
}

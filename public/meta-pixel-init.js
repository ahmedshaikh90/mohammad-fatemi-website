(() => {
  const s = document.currentScript;
  const id = s && s.dataset ? s.dataset.pixelId : '';
  if (!id) return;
  if (window.fbq) return;
  const n = window.fbq = function(){ n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
  if (!window._fbq) window._fbq = n;
  n.push = n; n.loaded = true; n.version = '2.0'; n.queue = [];
  const t = document.createElement('script');
  t.async = true; t.src = 'https://connect.facebook.net/en_US/fbevents.js';
  const first = document.getElementsByTagName('script')[0];
  first.parentNode.insertBefore(t, first);
  n('init', id);
  n('track', 'PageView');
})();
